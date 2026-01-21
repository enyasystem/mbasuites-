import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentSettings {
  stripe_enabled?: boolean;
  paystack_enabled?: boolean;
  bank_enabled?: boolean;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_sort_code?: string;
  bank_swift_code?: string;
  bank_instructions?: string;
  [key: string]: unknown;
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRows, setHasRows] = useState(false);

  const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("payment_settings")
          .select("setting_key, setting_value");

        if (error) throw error;

        type SettingRow = { setting_key: string; setting_value: unknown };
        const out: Record<string, unknown> = {};
        const rows = (data ?? []) as SettingRow[];
        rows.forEach((row) => {
          if (row.setting_value !== null && row.setting_value !== undefined) {
            out[row.setting_key] = row.setting_value;
          }
        });

        const isEnabled = (v: unknown) => {
          if (v === true) return true;
          if (v === false) return false;
          if (v == null) return false;
          if (typeof v === "number") return v !== 0;
          const s = String(v).trim().toLowerCase();
          return ["true", "1", "t", "yes", "on"].includes(s);
        };

        const parsed: PaymentSettings = {
          stripe_enabled: isEnabled(out.stripe_enabled),
          paystack_enabled: isEnabled(out.paystack_enabled),
          bank_enabled: isEnabled(out.bank_enabled),
          client_debug: isEnabled(out.client_debug),
          bank_name: out.bank_name,
          bank_account_name: out.bank_account_name,
          bank_account_number: out.bank_account_number,
          bank_sort_code: out.bank_sort_code,
          bank_swift_code: out.bank_swift_code,
          bank_instructions: out.bank_instructions,
        };

        if (mounted) {
          try {
            // Only emit debug logs when the admin-enabled `client_debug` flag is true
            if (parsed.client_debug) {
              console.log("Payment settings raw:", data);
              console.log("Payment settings parsed:", parsed);

              // detect duplicate keys which can cause last-write wins issues
              const counts: Record<string, number> = {};
              rows.forEach((row) => {
                counts[row.setting_key] = (counts[row.setting_key] || 0) + 1;
              });
              Object.entries(counts).forEach(([k, v]) => {
                if (v > 1) {
                  console.warn(`Duplicate payment_settings rows for key: ${k} (count=${v})`);
                }
              });
            }
          } catch (e) {
            // log and continue
            // eslint-disable-next-line no-console
            console.warn("Error during payment settings debug logging:", e);
          }
          setSettings(parsed);
          setHasRows(Boolean(rows && rows.length > 0));
        }
      } catch (err: unknown) {
        console.error("Error loading payment settings:", err);
        if (mounted) setError(getErrorMessage(err) || "Failed to load payment settings");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to realtime changes so UI updates when admin changes settings
    // Support both supabase-js v1 (.from().on().subscribe()) and v2 (channel/postgres_changes)
    let subscription: unknown = null;

    try {
      const sb = supabase as unknown as Record<string, unknown>;
      type ChannelLike = {
        on?: (event: unknown, opts?: unknown, cb?: (...args: unknown[]) => unknown) => ChannelLike;
        subscribe?: () => unknown;
      };

      // Older API: sb.from(...).on(...).subscribe()
      if (typeof sb.from === "function") {
        const fromFn = sb.from as unknown as (table: string) => ChannelLike | undefined;
        const chan = fromFn("payment_settings");
        if (chan && typeof chan.on === "function") {
          chan.on!("INSERT", undefined, () => fetchSettings());
          chan.on!("UPDATE", undefined, () => fetchSettings());
          chan.on!("DELETE", undefined, () => fetchSettings());
          if (typeof chan.subscribe === "function") chan.subscribe!();
          subscription = chan;
        }
      }

      // Newer API: channel/postgres_changes
      if (typeof sb.channel === "function") {
        const channelFn = sb.channel as unknown as (name: string) => ChannelLike;
        const ch = channelFn("payment_settings_changes");
        if (ch && typeof ch.on === "function") {
          ch.on!("postgres_changes", { event: "*", schema: "public", table: "payment_settings" }, () => fetchSettings());
          if (typeof ch.subscribe === "function") ch.subscribe!();
          subscription = ch;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Realtime subscription not available:", e);
    }

    return () => {
      mounted = false;
      // cleanup subscription across different supabase client versions
      try {
        const sb = supabase as unknown as Record<string, unknown>;
        if (subscription) {
          const subObj = subscription as unknown as { unsubscribe?: () => unknown };
          if (typeof subObj.unsubscribe === "function") {
            subObj.unsubscribe();
          } else if (typeof (sb.removeSubscription as unknown as Function) === "function") {
            (sb.removeSubscription as unknown as Function).call(sb, subscription);
          } else if (typeof (sb.removeChannel as unknown as Function) === "function") {
            (sb.removeChannel as unknown as Function).call(sb, subscription);
          }
        }
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, []);

  return { settings, loading, error, hasRows };
}

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
  [key: string]: any;
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRows, setHasRows] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("payment_settings")
          .select("setting_key, setting_value");

        if (error) throw error;

        const out: Record<string, any> = {};
        data?.forEach((row: any) => {
          if (row.setting_value !== null && row.setting_value !== undefined) {
            out[row.setting_key] = row.setting_value;
          }
        });

        const isEnabled = (v: any) => {
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
              // eslint-disable-next-line no-console
              console.log("Payment settings raw:", data);
              // eslint-disable-next-line no-console
              console.log("Payment settings parsed:", parsed);

              // detect duplicate keys which can cause last-write wins issues
              const counts: Record<string, number> = {};
              data?.forEach((row: any) => {
                counts[row.setting_key] = (counts[row.setting_key] || 0) + 1;
              });
              Object.entries(counts).forEach(([k, v]) => {
                if (v > 1) {
                  // eslint-disable-next-line no-console
                  console.warn(`Duplicate payment_settings rows for key: ${k} (count=${v})`);
                }
              });
            }
          } catch (e) {}
          setSettings(parsed);
          setHasRows(Boolean(data && data.length > 0));
        }
      } catch (err: any) {
        console.error("Error loading payment settings:", err);
        if (mounted) setError(err.message || "Failed to load payment settings");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to realtime changes so UI updates when admin changes settings
    // Support both supabase-js v1 (.from().on().subscribe()) and v2 (channel/postgres_changes)
    let subscription: any = null;

    try {
      const sbAny: any = supabase;

      if (sbAny.from && typeof sbAny.from === "function" && sbAny.from("").on) {
        // Older API
        subscription = sbAny
          .from("payment_settings")
          .on("INSERT", () => fetchSettings())
          .on("UPDATE", () => fetchSettings())
          .on("DELETE", () => fetchSettings())
          .subscribe();
      } else if (sbAny.channel && typeof sbAny.channel === "function") {
        // Newer API: use realtime channel and postgres_changes
        const channel = sbAny
          .channel("payment_settings_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "payment_settings" },
            () => fetchSettings()
          )
          .subscribe();

        subscription = channel;
      }
    } catch (e) {
      console.warn("Realtime subscription not available:", e);
    }

    return () => {
      mounted = false;
      // cleanup subscription across different supabase client versions
      try {
        const sbAny: any = supabase;
        if (subscription) {
          if (typeof subscription.unsubscribe === "function") {
            subscription.unsubscribe();
          } else if (typeof sbAny.removeSubscription === "function") {
            sbAny.removeSubscription(subscription);
          } else if (typeof sbAny.removeChannel === "function") {
            sbAny.removeChannel(subscription);
          }
        }
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, []);

  return { settings, loading, error, hasRows };
}

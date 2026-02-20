import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Save, CreditCard, Building, Landmark } from "lucide-react";

type PaymentSetting = {
  setting_key: string;
  setting_value: string | null;
};

export default function PaymentSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Stripe settings
  // (Stripe removed)
  
  // Paystack settings
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  
  // Bank transfer settings
  const [bankEnabled, setBankEnabled] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankInstructions, setBankInstructions] = useState("");
  // Client debug toggle (controls client-side debug logging via payment_settings.client_debug)
  const [clientDebug, setClientDebug] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach((s: PaymentSetting) => {
        if (s.setting_value) settings[s.setting_key] = s.setting_value;
      });

      // Stripe removed - do not read stripe keys
      // Paystack
      setPaystackPublicKey(settings.paystack_public_key || "");
      setPaystackSecretKey(settings.paystack_secret_key || "");
      setPaystackEnabled(settings.paystack_enabled === "true");
      
      // Bank transfer
      setBankEnabled(settings.bank_enabled === "true");
      setBankName(settings.bank_name || "");
      setAccountName(settings.bank_account_name || "");
      setAccountNumber(settings.bank_account_number || "");
      setSortCode(settings.bank_sort_code || "");
      setSwiftCode(settings.bank_swift_code || "");
      setBankInstructions(settings.bank_instructions || "");
      // client debug
      setClientDebug(settings.client_debug === "true");
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    // Some Supabase/Postgres setups may not have the unique constraint expected
    // by `ON CONFLICT`. To be robust, try an update first and fall back to insert.
    const { data: updatedRows, error: updateError } = await supabase
      .from("payment_settings")
      .update({ setting_value: value })
      .eq("setting_key", key)
      .select();

    if (updateError) throw updateError;

    if (updatedRows && updatedRows.length > 0) {
      return;
    }

    const { error: insertError } = await supabase
      .from("payment_settings")
      .insert({ setting_key: key, setting_value: value });

    if (insertError) throw insertError;
  };

  // Stripe removed - no save function

  const savePaystackSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("paystack_public_key", paystackPublicKey),
        saveSetting("paystack_secret_key", paystackSecretKey),
        saveSetting("paystack_enabled", paystackEnabled.toString()),
      ]);
      toast.success("Paystack settings saved successfully");
    } catch (error) {
      console.error("Error saving Paystack settings:", error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to save Paystack settings: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const saveBankSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("bank_enabled", bankEnabled.toString()),
        saveSetting("bank_name", bankName),
        saveSetting("bank_account_name", accountName),
        saveSetting("bank_account_number", accountNumber),
        saveSetting("bank_sort_code", sortCode),
        saveSetting("bank_swift_code", swiftCode),
        saveSetting("bank_instructions", bankInstructions),
      ]);
      toast.success("Bank transfer settings saved successfully");
    } catch (error) {
      console.error("Error saving bank settings:", error);
      // Show a more helpful error to the admin so they can debug RLS/permission issues
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to save bank settings: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const saveDebugSetting = async () => {
    setSaving(true);
    try {
      await saveSetting("client_debug", clientDebug.toString());
      toast.success("Client debug setting saved");
    } catch (error) {
      console.error("Error saving client debug setting:", error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to save client debug setting: " + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Settings</h2>
        <p className="text-muted-foreground">
          Configure payment gateways and bank transfer details
        </p>
      </div>

      <Tabs defaultValue="paystack" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paystack" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Paystack
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Bank Transfer
          </TabsTrigger>
        </TabsList>

        {/* Paystack Settings */}
        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Paystack Configuration
              </CardTitle>
              <CardDescription>
                Configure your Paystack API keys for Nigerian payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Paystack Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments via Paystack (NGN, GHS, ZAR, etc.)
                  </p>
                </div>
                <Switch
                  checked={paystackEnabled}
                  onCheckedChange={setPaystackEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paystack-public">Public Key</Label>
                <Input
                  id="paystack-public"
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paystack-secret">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="paystack-secret"
                    type={showPaystackSecret ? "text" : "password"}
                    value={paystackSecretKey}
                    onChange={(e) => setPaystackSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaystackSecret(!showPaystackSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPaystackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={savePaystackSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Paystack Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Transfer Settings */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Bank Transfer Configuration
              </CardTitle>
              <CardDescription>
                Configure direct bank transfer details for manual payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Bank Transfer</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow guests to pay via direct bank transfer
                  </p>
                </div>
                <Switch
                  checked={bankEnabled}
                  onCheckedChange={setBankEnabled}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., First Bank of Nigeria"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g., MBA Suites Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g., 1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-code">Sort Code / Routing Number</Label>
                  <Input
                    id="sort-code"
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value)}
                    placeholder="e.g., 011"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="swift-code">SWIFT/BIC Code (International)</Label>
                  <Input
                    id="swift-code"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="e.g., FBNINGLA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-instructions">Payment Instructions</Label>
                <Textarea
                  id="bank-instructions"
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  placeholder="Enter any special instructions for guests making bank transfers..."
                  rows={4}
                />
              </div>

              <Button onClick={saveBankSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Bank Transfer Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Client Debug</h3>
            <p className="text-sm text-muted-foreground">Enable client-side debug logs for troubleshooting (only toggle in production when needed)</p>
          </div>
          <div className="flex items-center gap-4">
            <Switch checked={clientDebug} onCheckedChange={setClientDebug} />
            <Button onClick={saveDebugSetting} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

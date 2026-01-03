import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function PromotionsManager() {
  const qc = useQueryClient();
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const [form, setForm] = useState({ title: "", description: "", discount_type: "percentage", discount_value: 0, promo_code: "", display_locations: { banner: true, offers: true, rooms: true }, is_active: true });

  const createPromotion = async () => {
    const payload: any = {
      title: form.title,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      promo_code: form.promo_code || null,
      display_locations: Object.keys(form.display_locations).filter(k => (form.display_locations as any)[k]),
      is_active: form.is_active,
    };
    const { error } = await supabase.from("promotions").insert(payload);
    if (error) return alert("Error: " + error.message);
    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
    setForm({ title: "", description: "", discount_type: "percentage", discount_value: 0, promo_code: "", display_locations: { banner: true, offers: true, rooms: true }, is_active: true });
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("promotions").update({ is_active: active }).eq("id", id);
    if (error) return alert("Error: " + error.message);
    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create Promotion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Title" value={form.title} onChange={(e: any) => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Code (optional)" value={form.promo_code} onChange={(e: any) => setForm(f => ({ ...f, promo_code: e.target.value }))} />
          <Input placeholder="Discount value" type="number" value={form.discount_value} onChange={(e: any) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="text-sm">Active</label>
          <Switch checked={form.is_active} onCheckedChange={(v: any) => setForm(f => ({ ...f, is_active: v }))} />
          <div className="ml-auto">
            <Button onClick={createPromotion}>Create</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Promotions</h3>
        <div className="space-y-3">
          {isLoading ? <div>Loading...</div> : promotions.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.promo_code ? `Code: ${p.promo_code}` : "No code"} • {p.discount_type === 'percentage' ? `${p.discount_value}%` : `₦${p.discount_value}`}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Active</label>
                <Switch checked={p.is_active} onCheckedChange={(v: any) => toggleActive(p.id, v)} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

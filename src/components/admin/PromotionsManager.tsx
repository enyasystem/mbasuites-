import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    promo_code: "",
    display_locations: { banner: false, offers: true, rooms: false },
    is_active: false,
    min_nights: 1,
    start_date: "",
    end_date: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const startCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setForm({ title: "", description: "", discount_type: "percentage", discount_value: 0, promo_code: "", display_locations: { banner: false, offers: true, rooms: false }, is_active: false, min_nights: 1, start_date: "", end_date: "" });
    const el = document.getElementById('promotions-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const savePromotion = async () => {
    const payload: any = {
      title: form.title,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      promo_code: form.promo_code || null,
      display_locations: Object.keys(form.display_locations).filter((k) => (form.display_locations || {})[k]),
      is_active: !!form.is_active,
      min_nights: Number(form.min_nights) || 1,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (editingId) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", editingId);
      if (error) return alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("promotions").insert(payload);
      if (error) return alert("Error: " + error.message);
    }

    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
    // reset form
    setForm({ title: "", description: "", discount_type: "percentage", discount_value: 0, promo_code: "", display_locations: { banner: false, offers: true, rooms: false }, is_active: false, min_nights: 1, start_date: "", end_date: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("promotions").update({ is_active: active }).eq("id", id);
    if (error) return alert("Error: " + error.message);
    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
  };

  const startEdit = (p: any) => {
    setShowForm(true);
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      discount_type: p.discount_type || "percentage",
      discount_value: p.discount_value || 0,
      promo_code: p.promo_code || "",
      display_locations: {
        banner: (p.display_locations || []).includes("banner"),
        offers: (p.display_locations || []).includes("offers"),
        rooms: (p.display_locations || []).includes("rooms"),
      },
      is_active: !!p.is_active,
      min_nights: p.min_nights || 1,
      start_date: p.start_date ? new Date(p.start_date).toISOString().slice(0, 16) : "",
      end_date: p.end_date ? new Date(p.end_date).toISOString().slice(0, 16) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", discount_type: "percentage", discount_value: 0, promo_code: "", display_locations: { banner: false, offers: true, rooms: false }, is_active: false, min_nights: 1, start_date: "", end_date: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Promotions</h2>
        <Button onClick={startCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Promotion</Button>
      </div>
      {showForm && (
        <Card id="promotions-form" className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Promotion" : "Create Promotion"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Title *" value={form.title} onChange={(e: any) => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Promo Code (optional)" value={form.promo_code} onChange={(e: any) => setForm(f => ({ ...f, promo_code: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-3 gap-2">
            <Select value={form.discount_type} onValueChange={(v: any) => setForm(f => ({ ...f, discount_type: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed (₦)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Discount value" type="number" value={form.discount_value} onChange={(e: any) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
            <Input placeholder="Min. Nights" type="number" value={form.min_nights} onChange={(e: any) => setForm(f => ({ ...f, min_nights: Number(e.target.value) }))} />
          </div>

          <Input type="datetime-local" label="Start date" value={form.start_date} onChange={(e: any) => setForm(f => ({ ...f, start_date: e.target.value }))} />
          <Input type="datetime-local" label="End date" value={form.end_date} onChange={(e: any) => setForm(f => ({ ...f, end_date: e.target.value }))} />

          <div className="col-span-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.banner} onChange={(e:any) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, banner: e.target.checked } }))} /> Top Banner</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.offers} onChange={(e:any) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, offers: e.target.checked } }))} /> Special Offers Section</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.rooms} onChange={(e:any) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, rooms: e.target.checked } }))} /> Room Cards</label>
            </div>
          </div>

        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="text-sm">Promotion is active</label>
          <Switch checked={form.is_active} onCheckedChange={(v: any) => setForm(f => ({ ...f, is_active: v }))} />
          <div className="ml-auto flex gap-2">
            {editingId ? (
              <>
                <Button onClick={savePromotion}>Save Promotion</Button>
                <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </>
            ) : (
              <Button onClick={savePromotion}>Save Promotion</Button>
            )}
          </div>
        </div>
      </Card>
      )}

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
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                  <label className="text-sm">Active</label>
                  <Switch checked={p.is_active} onCheckedChange={(v: any) => toggleActive(p.id, v)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

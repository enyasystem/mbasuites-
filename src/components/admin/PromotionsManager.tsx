import { useState, ChangeEvent, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

  // Mount/unmount trace for debugging
  useEffect(() => {
    console.log("PromotionsManager: mounted");
    return () => console.log("PromotionsManager: unmounted");
  }, []);

  type PromotionRow = {
    id: string;
    title?: string | null;
    description?: string | null;
    discount_type?: "percentage" | "fixed" | null;
    discount_value?: number | null;
    promo_code?: string | null;
    display_locations?: string[] | null;
    is_active?: boolean | null;
    min_nights?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: string | null;
  };

  type DisplayLocationsForm = { banner: boolean; offers: boolean; rooms: boolean };

  type PromotionForm = {
    title: string;
    description: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    promo_code: string;
    display_locations: DisplayLocationsForm;
    is_active: boolean;
    min_nights: number;
    start_date: string;
    end_date: string;
  };

  const initialForm: PromotionForm = {
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
  };

  const { data: promotions = [], isLoading } = useQuery<PromotionRow[]>({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      console.debug('PromotionsManager: fetching promotions');
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [form, setForm] = useState<PromotionForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const startCreate = () => {
    console.log("PromotionsManager: startCreate");
    setShowForm(true);
    setEditingId(null);
    setForm(initialForm);
    const el = document.getElementById('promotions-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const savePromotion = async () => {
    console.log("PromotionsManager: savePromotion", { editingId });
    const payload: Partial<PromotionRow> = {
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

    try {
      let returned: PromotionRow | null = null;
      if (editingId) {
        const { data: d, error } = await supabase.from("promotions").update(payload).eq("id", editingId).select().single();
        if (error) throw error;
        returned = d;
      } else {
        const { data: d, error } = await supabase.from("promotions").insert(payload).select().single();
        if (error) throw error;
        returned = d;
      }

      // If this promotion should show in the banner and is active, clear any local dismissal so it appears immediately
      try {
        if (returned && returned.is_active && (returned.display_locations || []).includes('banner')) {
          const key = 'dismissed_promotions_v1';
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const arr = JSON.parse(raw) as string[];
              const next = (arr || []).filter((id) => id !== returned.id);
              localStorage.setItem(key, JSON.stringify(next));
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      } catch (e) { /* ignore */ }
    } catch (err: unknown) {
      let msg = String(err);
      if (typeof err === 'object' && err !== null) {
        const maybe = err as { message?: unknown };
        if (typeof maybe.message === 'string') msg = maybe.message;
      }
      return alert('Error saving promotion: ' + msg);
    }

    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
    // reset form
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    console.log("PromotionsManager: toggleActive", id, active);
    const { data, error } = await supabase.from("promotions").update({ is_active: active }).eq("id", id).select().single();
    if (error) return alert("Error: " + error.message);
    // If enabling and the promo shows in banner, clear local dismissal for immediate visibility
    try {
      if (active && data && (data.display_locations || []).includes('banner')) {
        const key = 'dismissed_promotions_v1';
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const arr = JSON.parse(raw) as string[];
            const next = (arr || []).filter((pid) => pid !== id);
            localStorage.setItem(key, JSON.stringify(next));
          } catch (e) { /* ignore parse errors */ }
        }
      }
    } catch (e) { /* ignore */ }

    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("promotions").delete().eq("id", deletingId);
    if (error) return alert("Error deleting: " + error.message);
    qc.invalidateQueries(["admin-promotions"]);
    qc.invalidateQueries(["promotions"]);
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const startEdit = (p: PromotionRow) => {
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
          <Input placeholder="Title *" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Promo Code (optional)" value={form.promo_code} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, promo_code: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-3 gap-2">
            <Select value={form.discount_type} onValueChange={(v: string) => setForm(f => ({ ...f, discount_type: v as "percentage" | "fixed" }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed (₦)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Discount value" type="number" value={form.discount_value} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
            <Input placeholder="Min. Nights" type="number" value={form.min_nights} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, min_nights: Number(e.target.value) }))} />
          </div>

          <Input type="datetime-local" label="Start date" value={form.start_date} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, start_date: e.target.value }))} />
          <Input type="datetime-local" label="End date" value={form.end_date} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, end_date: e.target.value }))} />

          <div className="col-span-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.banner} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, banner: e.target.checked } }))} /> Top Banner</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.offers} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, offers: e.target.checked } }))} /> Special Offers Section</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.display_locations.rooms} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, display_locations: { ...f.display_locations, rooms: e.target.checked } }))} /> Room Cards</label>
            </div>
          </div>

        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="text-sm">Promotion is active</label>
          <Switch checked={form.is_active} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, is_active: v }))} />
          <div className="ml-auto flex gap-2">
            <Button onClick={savePromotion}>Save Promotion</Button>
            <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Promotions</h3>
        <div className="space-y-3">
          {isLoading ? <div>Loading...</div> : promotions.map((p: PromotionRow) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.promo_code ? `Code: ${p.promo_code}` : "No code"} • {p.discount_type === 'percentage' ? `${p.discount_value}%` : `₦${p.discount_value}`}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => requestDelete(p.id)}>Delete</Button>
                    <label className="text-sm">Active</label>
                    <Switch checked={!!p.is_active} onCheckedChange={(v: boolean) => toggleActive(p.id, v)} />
                  </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Dialog open={confirmOpen} onOpenChange={(o) => setConfirmOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this promotion? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

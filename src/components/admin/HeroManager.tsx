import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

type PaymentSetting = {
  setting_key: string;
  setting_value: string | null;
};

export default function HeroManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("Your Home Away From Home");
  const [subtitle, setSubtitle] = useState(
    "Experience premium comfort in fully furnished apartments designed for modern living. Perfect for business and leisure stays."
  );
  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");
      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach((s: PaymentSetting) => {
        if (s.setting_value) settings[s.setting_key] = s.setting_value;
      });

      try {
        // hydrate React Query cache so other components update immediately
        queryClient.setQueryData(['siteSettings'], settings);
      } catch (e) {
        console.warn('Failed to set siteSettings cache', e);
      }

      if (settings.hero_image) setHeroImageUrl(settings.hero_image);
      if (settings.hero_title) setTitle(settings.hero_title);
      if (settings.hero_subtitle) setSubtitle(settings.hero_subtitle);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hero settings");
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  

  const saveSetting = async (key: string, value: string) => {
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ setting_key: key, setting_value: value }, { onConflict: "setting_key" });
    if (error) {
      throw error;
    }
    return data;
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Choose an image first");
    setSaving(true);
    try {
      const filePath = `hero/${Date.now()}_${file.name}`;
      const bucket = "payment-proofs";
      // Upload with minimal caching so new images appear immediately
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "0", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      // Append a cache-busting query param so browsers/CDNs fetch the new image immediately
      const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const res = await saveSetting("hero_image", publicUrl);
      if (res) {
        // Optimistically update query cache and local preview so UI reflects change immediately
        try {
          const existing = queryClient.getQueryData<Record<string, string>>(['siteSettings']) || {};
          queryClient.setQueryData(['siteSettings'], { ...existing, hero_image: publicUrl });
        } catch (e) {
          console.warn('Failed to update siteSettings cache', e);
        }
        setHeroImageUrl(publicUrl);
        await fetchSettings();
        toast.success("Hero image uploaded and saved");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to upload image: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTexts = async () => {
    setSaving(true);
    try {
      const [titleRes, subtitleRes] = await Promise.all([
        saveSetting("hero_title", title),
        saveSetting("hero_subtitle", subtitle),
      ]);
      if (titleRes || subtitleRes) {
        await fetchSettings();
        toast.success("Hero text saved");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save hero text");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card><CardContent className="p-8">Loading...</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Hero Section</h2>
        <p className="text-muted-foreground">Update the homepage hero image and texts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
          <CardDescription>Upload an image for the homepage hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-48 h-32 bg-muted rounded overflow-hidden flex items-center justify-center">
              {heroImageUrl ? (
                <img src={heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-sm text-muted-foreground p-4 text-center">No image set</div>
              )}
            </div>
            <div className="flex-1">
              <Label>Choose Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="mt-3">
                <Button onClick={handleUpload} disabled={saving}>{saving ? "Uploading..." : "Upload & Save Image"}</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero Text</CardTitle>
          <CardDescription>Update the title and subtitle used in the hero component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={4} />
          </div>
          <div>
            <Button onClick={handleSaveTexts} disabled={saving}>{saving ? "Saving..." : "Save Texts"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

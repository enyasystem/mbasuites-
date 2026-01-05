import { useEffect, useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";

const STORAGE_KEY = "dismissed_promotions_v1";

const PromotionsBanner = () => {
  const location = useLocation();
  const { isAdmin } = useRoleCheck();
  const isAdminPreview = location.pathname.startsWith("/admin") && isAdmin;
  const { data: promotions = [], isLoading, error } = usePromotions({ activeOnly: true });
  const banners = promotions.filter((p) => (p.display_locations || []).includes("banner"));
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setDismissed(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setDismissed([]);
    }
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Do not show banner on admin dashboard pages for non-admins
  if (location.pathname.startsWith("/admin") && !isAdmin) return null;

  // Admin preview should ignore dismissed banners so admins can preview
  const urlParams = new URLSearchParams(location.search);
  const forceVisible = urlParams.get('promos_preview') === '1' || urlParams.get('show_promos') === '1';
  const visibleBanners = banners.filter((b) => (isAdminPreview || forceVisible) ? true : !dismissed.includes(b.id));
  const promo = visibleBanners.length ? visibleBanners[index % visibleBanners.length] : null;


  const dismiss = (id: string) => {
    const next = Array.from(new Set([...dismissed, id]));
    setDismissed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <>
      {promo && (
        <div id="mba-promo-banner" className="w-full bg-accent/95 text-accent-foreground py-3 px-4 sticky top-0 left-0 z-60">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <strong className="mr-2">{promo.title}</strong>
                {isAdminPreview && <span className="ml-2 inline-block text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded">Preview</span>}
                <span className="text-sm text-accent-foreground/90 mr-2">{promo.description}</span>
                {promo.promo_code && (
                  <span className="ml-2 px-2 py-1 bg-background/20 rounded">Code: {promo.promo_code}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => dismiss(promo.id)}>Dismiss</Button>
            </div>
          </div>
        </div>
      )}

      {/* debug overlay removed */}
    </>
  );
};

export default PromotionsBanner;

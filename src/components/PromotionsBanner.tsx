import { useEffect, useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "dismissed_promotions_v1";

const PromotionsBanner = () => {
  const location = useLocation();
  // Do not show banner on admin dashboard pages
  if (location.pathname.startsWith("/admin")) return null;
  const { data: promotions = [] } = usePromotions({ activeOnly: true });
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

  if (!banners.length) return null;

  const visibleBanners = banners.filter((b) => !dismissed.includes(b.id));
  if (!visibleBanners.length) return null;

  const promo = visibleBanners[index % visibleBanners.length];

  const dismiss = (id: string) => {
    const next = Array.from(new Set([...dismissed, id]));
    setDismissed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div id="mba-promo-banner" className="w-full bg-accent/95 text-accent-foreground py-3 px-4 fixed top-0 left-0 z-60">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            <strong className="mr-2">{promo.title}</strong>
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
  );
};

export default PromotionsBanner;

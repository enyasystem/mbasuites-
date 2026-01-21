import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Promotion = {
  id: string;
  title: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  promo_code?: string | null;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  display_locations?: string[];
  applicable_room_types?: string[];
  applicable_location_ids?: string[];
};

const isActiveNow = (p: Promotion) => {
  if (!p.is_active) return false;
  const now = new Date();
  if (p.start_date && new Date(p.start_date) > now) return false;
  if (p.end_date && new Date(p.end_date) < now) return false;
  return true;
};

export const usePromotions = (opts?: { activeOnly?: boolean }) => {
  const { activeOnly = true } = opts || {};

  return useQuery({
    queryKey: ["promotions", activeOnly],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from<Promotion>("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items: Promotion[] = (data || []) as Promotion[];

      if (activeOnly) return items.filter(isActiveNow);
      return items;
    },
  });
};

export default usePromotions;

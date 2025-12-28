import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Review } from "@/components/ReviewsList";

export const useRoomReviews = (roomId: string | undefined | null) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase client types don't include 'reviews' table yet
      const { data, error } = await (supabase as any)
        .from("reviews")
        .select("id, user_id, user_name, rating, comment, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map snake_case DB fields to the camelCase Review shape expected by the UI
      type RawReviewRow = {
        id: string;
        user_id: string | null;
        user_name?: string | null;
        rating: number;
        comment?: string | null;
        created_at: string;
      };

      const rows = (data as RawReviewRow[]) || [];
      const mapped: Review[] = rows.map((r) => ({
        id: r.id,
        userId: r.user_id || undefined,
        userName: r.user_name || "",
        rating: r.rating,
        comment: r.comment || "",
        createdAt: r.created_at,
      }));

      setReviews(mapped);
    } catch (err: unknown) {
      console.error("Error fetching reviews:", err);
      const e = err as { message?: string };
      setError(e?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchReviews();
    if (!roomId) return;

    const channel = supabase
      .channel(`reviews-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
};

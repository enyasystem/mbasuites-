import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseRoom } from "./useRooms";

type RoomImage = { id: string; url: string; is_primary: boolean; ordering?: number | null };
type SupabaseRoomRow = DatabaseRoom & { room_images?: RoomImage[] };

const getErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
};

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<DatabaseRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: unknown | null = null;

    const fetchRoom = async () => {
      if (!roomId) {
        setIsLoading(false);
        setError("No room ID provided");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from<SupabaseRoomRow>("rooms")
          .select("*, room_images(id, url, is_primary, ordering), locations(name)")
          .eq("id", roomId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Room not found");
          setRoom(null);
        } else {
          const imgs = (data.room_images || [])
            .slice()
            .sort((a: RoomImage, b: RoomImage) => {
              if (a.is_primary && !b.is_primary) return -1;
              if (!a.is_primary && b.is_primary) return 1;
              return (a.ordering || 0) - (b.ordering || 0);
            })
            .map((r: RoomImage) => r.url);

          const roomWithImages = { ...data, images: imgs, image_url: data.image_url || imgs[0] || null };
          setRoom(roomWithImages as DatabaseRoom);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to fetch room");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();

    // Subscribe to changes on room_images for this room so UI updates in real-time
    try {
      type ChannelLike = {
        on?: (event: unknown, opts?: unknown, cb?: (...args: unknown[]) => unknown) => ChannelLike;
        subscribe?: () => unknown;
      };

      const sb = supabase as unknown as Record<string, unknown>;
      if (typeof sb.channel === 'function') {
        const channelFn = sb.channel as unknown as (name: string) => ChannelLike;
        const ch = channelFn(`room_images:room_id=eq.${roomId}`);
        if (ch && typeof ch.on === 'function') {
          ch.on!('postgres_changes', { event: '*', schema: 'public', table: 'room_images', filter: `room_id=eq.${roomId}` }, () => fetchRoom());
          if (typeof ch.subscribe === 'function') ch.subscribe!();
          channel = ch;
        }
      } else {
        // Fallback for older Realtime API
        try {
          const fromFn = (sb.from as unknown) as (arg: string) => ChannelLike;
          const sub = fromFn(`room_images:room_id=eq.${roomId}`);
          if (sub && typeof sub.on === 'function') {
            sub.on!('*', undefined, () => fetchRoom());
            if (typeof sub.subscribe === 'function') sub.subscribe!();
            channel = sub;
          }
        } catch (err2) {
          // ignore subscription errors
          console.warn('Realtime subscription for room images failed', err2);
        }
      }

    } catch (e) {
      console.warn('Realtime subscription for room images not available:', e);
    }

    return () => {
      try {
        const subObj = channel as unknown as { unsubscribe?: () => unknown };
        if (subObj && typeof subObj.unsubscribe === 'function') subObj.unsubscribe();
        const sb = supabase as unknown as Record<string, unknown>;
        if (typeof sb.removeChannel === 'function') {
          const removeCh = sb.removeChannel as unknown as (ch: unknown) => unknown;
          try {
            removeCh(channel);
          } catch (_) {
            // ignore removal errors
          }
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [roomId]);

  return { room, isLoading, error };
}

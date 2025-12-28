import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseRoom } from "./useRooms";

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<DatabaseRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: any | null = null;

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
          .from("rooms")
          .select("*, room_images(id, url, is_primary, ordering), locations(name)")
          .eq("id", roomId)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError("Room not found");
          setRoom(null);
        } else {
          // Build images array (ordered, prefer is_primary)
          const imgs = (data.room_images || [])
            .slice()
            .sort((a: any, b: any) => {
              if (a.is_primary && !b.is_primary) return -1;
              if (!a.is_primary && b.is_primary) return 1;
              return (a.ordering || 0) - (b.ordering || 0);
            })
            .map((r: any) => r.url);

          const roomWithImages = { ...data, images: imgs, image_url: data.image_url || imgs[0] || null };
          setRoom(roomWithImages as DatabaseRoom);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch room");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();

    // Subscribe to changes on room_images for this room so UI updates in real-time
    try {
      channel = supabase
        .channel(`room_images:room_id=eq.${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'room_images', filter: `room_id=eq.${roomId}` }, (payload: any) => {
          // Re-fetch room to get updated images
          fetchRoom();
        })
        .subscribe();
    } catch (err) {
      // Fallback for clients using the older Realtime API
      try {
        const subscription = supabase
          .from(`room_images:room_id=eq.${roomId}`)
          .on('*', () => fetchRoom())
          .subscribe();
        // store in channel variable so we can remove later
        channel = subscription as any;
      } catch (err2) {
        // ignore subscription errors
        console.warn('Realtime subscription for room images failed', err2);
      }
    }

    return () => {
      try {
        if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe();
        // supabase.removeChannel for newer SDKs may be necessary, attempt if available
        // @ts-ignore
        if (channel && channel.name && (supabase as any).removeChannel) (supabase as any).removeChannel(channel);
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [roomId]);

  return { room, isLoading, error };
}

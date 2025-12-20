import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseRoom } from "./useRooms";

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<DatabaseRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          .select("*")
          .eq("id", roomId)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError("Room not found");
          setRoom(null);
        } else {
          setRoom(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch room");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  return { room, isLoading, error };
}

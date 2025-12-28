import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseRoom {
  id: string;
  title: string;
  room_number: string;
  room_type: "standard" | "deluxe" | "suite";
  price_per_night: number;
  max_guests: number;
  description: string | null;
  amenities: string[] | null;
  image_url: string | null;
  is_available: boolean;
  location_id: string | null;
  created_at: string;
  updated_at: string;
  location_name?: string;
}

export function useAdminRooms() {
  const [rooms, setRooms] = useState<DatabaseRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("rooms")
        .select(`
          *,
          locations!left(name)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const roomsWithLocation = (data || []).map((room: any) => ({
        ...room,
        location_name: room.locations?.name || "No Location",
      }));

      setRooms(roomsWithLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRoom = async (roomData: Omit<DatabaseRoom, "id" | "created_at" | "updated_at" | "location_name">) => {
    const { data, error } = await supabase
      .from("rooms")
      .insert([roomData])
      .select()
      .single();

    if (error) throw error;
    await fetchRooms();
    return data;
  };

  const updateRoom = async (id: string, roomData: Partial<DatabaseRoom>) => {
    const { data, error } = await supabase
      .from("rooms")
      .update(roomData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchRooms();
    return data;
  };

  const deleteRoom = async (id: string) => {
    // Prevent deletion if there are active (non-cancelled) bookings referencing this room
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", id)
      .neq("status", "cancelled")
      .limit(1);

    if (bookingsError) throw bookingsError;
    if (bookings && bookings.length > 0) {
      throw new Error("Cannot delete room: there are active bookings for this room. Cancel or remove bookings before deleting the room.");
    }

    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) throw error;
    await fetchRooms();
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    return updateRoom(id, { is_available: !currentStatus });
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    isLoading,
    error,
    refetch: fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    toggleAvailability,
  };
}

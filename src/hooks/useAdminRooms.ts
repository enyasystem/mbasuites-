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
  images?: Array<{ id: string; url: string; is_primary: boolean; ordering?: number }>;
}

// Raw row shape returned by Supabase when selecting rooms with related rows
type RoomRow = {
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
  locations?: { name?: string };
  room_images?: Array<{ id: string; url: string; is_primary: boolean; ordering?: number }>;
};

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
          locations!left(name),
          room_images(id, url, is_primary, ordering)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const rows = (data || []) as unknown as RoomRow[];

      const roomsWithLocation = rows.map((room) => ({
        ...room,
        location_name: room.locations?.name || "No Location",
        images: room.room_images || [],
        // maintain image_url for compatibility, fallback to first image
        image_url: room.image_url || (room.room_images && room.room_images[0]?.url) || null,
      }));

      setRooms(roomsWithLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  type NewRoomInput = Omit<DatabaseRoom, "id" | "created_at" | "updated_at" | "location_name"> & { image_urls?: string[] };

  const addRoom = async (roomData: NewRoomInput) => {
    const { image_urls, ...roomFields } = roomData;

    const { data, error } = await supabase
      .from("rooms")
      .insert([roomFields])
      .select()
      .single();

    if (error) throw error;

    if (image_urls && image_urls.length > 0) {
      const inserts = image_urls.map((url: string, i: number) => ({ room_id: data.id, url, is_primary: i === 0, ordering: i }));
      // room_images is not present in the generated Supabase DB types yet; keep the cast localized
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: imgError } = await (supabase as any).from("room_images").insert(inserts);
      if (imgError) throw imgError;
    }

    await fetchRooms();
    return data;
  };

  const updateRoom = async (id: string, roomData: Partial<DatabaseRoom> & { image_urls?: string[] }) => {
    const { image_urls, ...roomFields } = roomData;

    const { data, error } = await supabase
      .from("rooms")
      .update(roomFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (image_urls && image_urls.length > 0) {
      const inserts = image_urls.map((url: string, i: number) => ({ room_id: id, url, is_primary: false, ordering: i }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: imgError } = await (supabase as any).from("room_images").insert(inserts);
      if (imgError) throw imgError;
    }

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

  const removeRoomImage = async (imageId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("room_images").delete().eq("id", imageId);
    if (error) throw error;
    await fetchRooms();
  };

  const addRoomImages = async (roomId: string, urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const inserts = urls.map((url, i) => ({ room_id: roomId, url, is_primary: false, ordering: i }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("room_images").insert(inserts);
    if (error) throw error;
    await fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    isLoading,
    error,
    refetch: fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    toggleAvailability,
    addRoomImages,
    removeRoomImage,
  };
}

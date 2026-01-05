import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  room_type: string;
  location_name: string;
  room_id: string;
}

export function useGallery(locationFilter?: string) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // First try to get from room_media table
        // supabase generated types do not include `room_media` table in this project
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: mediaData, error: mediaError } = await (supabase as any)
          .from("room_media")
          .select(`
            id,
            media_url,
            title,
            room_id,
            rooms!inner (
              title,
              room_type,
              locations (name)
            )
          `)
          .eq("media_type", "image")
          .order("display_order", { ascending: true });

        if (!mediaError && mediaData && mediaData.length > 0) {
          interface SupabaseMediaRow {
            id: string;
            media_url: string;
            title?: string | null;
            room_id: string;
            rooms?: { title?: string; room_type?: string; locations?: { name?: string } } | null;
          }

          const galleryItems: GalleryItem[] = (mediaData as SupabaseMediaRow[]).map((item) => ({
            id: item.id,
            image_url: item.media_url,
            title: item.title || item.rooms?.title || "Room",
            room_type: item.rooms?.room_type || "standard",
            location_name: item.rooms?.locations?.name || "Unknown",
            room_id: item.room_id,
          }));

          const filteredItems = locationFilter
            ? galleryItems.filter((item) => item.location_name === locationFilter)
            : galleryItems;

          setItems(filteredItems);
          setLocations([...new Set(galleryItems.map((item) => item.location_name))]);
        } else {
          // Fallback to rooms table images
          const query = supabase
            .from("rooms")
            .select(`
              id,
              title,
              image_url,
              room_type,
              locations (name)
            `)
            .eq("is_available", true)
            .not("image_url", "is", null);

          const { data: roomsData, error: roomsError } = await query;

          if (roomsError) throw roomsError;

          interface SupabaseRoomRow {
            id: string;
            title: string;
            image_url?: string | null;
            room_type?: string;
            locations?: { name?: string } | null;
          }

          const galleryItems: GalleryItem[] = (roomsData || [])
            .filter((room: SupabaseRoomRow) => room.image_url && !room.image_url.startsWith("data:"))
            .map((room: SupabaseRoomRow) => ({
              id: room.id,
              image_url: room.image_url as string,
              title: room.title,
              room_type: room.room_type || "standard",
              location_name: room.locations?.name || "Unknown",
              room_id: room.id,
            }));

          const filteredItems = locationFilter
            ? galleryItems.filter((item) => item.location_name === locationFilter)
            : galleryItems;

          setItems(filteredItems);
          setLocations([...new Set(galleryItems.map((item) => item.location_name))]);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [locationFilter]);

  return { items, locations, isLoading };
}

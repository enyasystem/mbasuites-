import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/context/LocationContext";
import { handleApiError } from "@/lib/api-utils";

export interface DatabaseRoom {
  id: string;
  title: string;
  description: string | null;
  room_type: "standard" | "deluxe" | "suite";
  room_number: string;
  price_per_night: number;
  max_guests: number;
  amenities: string[] | null;
  image_url: string | null;
  images?: string[];
  is_available: boolean;
  location_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseRoomsOptions {
  locationId?: string | null;
  roomType?: string | null;
  maxGuests?: number;
  checkIn?: string | null;
  checkOut?: string | null;
}

export function useRooms(options: UseRoomsOptions = {}) {
  const [rooms, setRooms] = useState<DatabaseRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locationId: contextLocationId, isLoading: locationsLoading } = useLocation();

  const effectiveLocationId = options.locationId ?? contextLocationId;

  useEffect(() => {
    // If no explicit location is provided and locations are still loading, wait until we have a context location
    if (!options.locationId && locationsLoading) return;

    // Prevent race conditions from earlier/slower fetches overwriting newer results
    // Use a local increasing fetch id and ignore stale responses
    let cancelled = false;
    let didSetThisFetch = false;
    const thisFetchId = Date.now() + Math.floor(Math.random() * 1000);

    const fetchRooms = async () => {
      // Mark loading for this fetch
      setIsLoading(true);
      setError(null);

      try {
        console.debug('[useRooms] fetch start', { effectiveLocationId, options });

        let query = supabase
          .from("rooms")
          // include related room images
          .select("*, room_images(id, url, is_primary, ordering)")
          .eq("is_available", true);

        // Filter by location if provided
        if (effectiveLocationId) {
          query = query.eq("location_id", effectiveLocationId);
        }

        // Filter by room type if provided
        if (options.roomType && ["standard", "deluxe", "suite"].includes(options.roomType)) {
          query = query.eq("room_type", options.roomType as "standard" | "deluxe" | "suite");
        }

        // Filter by max guests if provided
        if (options.maxGuests) {
          query = query.gte("max_guests", options.maxGuests);
        }

        query = query.order("price_per_night", { ascending: true });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // If check-in/check-out dates are provided, filter by availability
        let availableRooms = (data || []).map((r: any) => {
          // build images array from related room_images (primary first, then ordering)
          const imgs = (r.room_images || [])
            .slice()
            .sort((a: any, b: any) => {
              if (a.is_primary && !b.is_primary) return -1;
              if (!a.is_primary && b.is_primary) return 1;
              return (a.ordering || 0) - (b.ordering || 0);
            })
            .map((ri: any) => ri.url);
          return { ...r, images: imgs, image_url: r.image_url || imgs[0] || null };
        });
        
        if (options.checkIn && options.checkOut && availableRooms.length > 0) {
          // Check availability for each room
          const availabilityChecks = await Promise.all(
            availableRooms.map(async (room) => {
              const { data: isAvailable } = await supabase.rpc(
                "check_room_availability",
                {
                  p_room_id: room.id,
                  p_check_in: options.checkIn,
                  p_check_out: options.checkOut,
                }
              );
              return { room, isAvailable };
            })
          );

          availableRooms = availabilityChecks
            .filter(({ isAvailable }) => isAvailable)
            .map(({ room }) => room);
        }

        // If this effect has been superseded or cancelled, ignore the results
        if (cancelled) {
          console.debug('[useRooms] fetch ignored (stale)', { thisFetchId, effectiveLocationId, count: (availableRooms || []).length });
          return;
        }

        // Apply results
        console.debug('[useRooms] fetch success', { thisFetchId, effectiveLocationId, count: (availableRooms || []).length });
        didSetThisFetch = true;
        setRooms(availableRooms);
      } catch (err) {
        if (cancelled) return;
        const apiError = handleApiError(err, "fetching rooms");
        console.error('[useRooms] fetch error', apiError);
        setError(apiError.message);
      } finally {
        if (!cancelled && didSetThisFetch) setIsLoading(false);
        else if (!cancelled && !didSetThisFetch) setIsLoading(false); // ensure loading resets even if nothing changed
      }
    };

    fetchRooms();

    return () => {
      // mark this fetch as cancelled so any in-flight promises know to ignore results
      cancelled = true;
    };
  }, [effectiveLocationId, locationsLoading, options.roomType, options.maxGuests, options.checkIn, options.checkOut]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  return { rooms, isLoading, error, refetch };
}

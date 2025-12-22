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

    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("rooms")
          .select("*")
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
        let availableRooms = data || [];
        
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

        setRooms(availableRooms);
      } catch (err) {
        const apiError = handleApiError(err, "fetching rooms");
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [effectiveLocationId, locationsLoading, options.roomType, options.maxGuests, options.checkIn, options.checkOut]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  return { rooms, isLoading, error, refetch };
}

import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
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
  const { locationId: contextLocationId, isLoading: locationsLoading } = useLocation();
  const effectiveLocationId = options.locationId ?? contextLocationId;

  const enabled = useMemo(() => {
    // if no explicit location provided, wait for context location to finish loading
    if (!options.locationId && locationsLoading) return false;
    return true;
  }, [options.locationId, locationsLoading]);

  const queryKey = [
    'rooms',
    effectiveLocationId ?? null,
    options.roomType ?? null,
    options.maxGuests ?? null,
    options.checkIn ?? null,
    options.checkOut ?? null,
  ];

  const queryFn = async (): Promise<DatabaseRoom[]> => {
    try {
      let query = supabase
        .from('rooms')
        .select('*, room_images(id, url, is_primary, ordering)')
        .eq('is_available', true);

      if (effectiveLocationId) {
        query = query.eq('location_id', effectiveLocationId);
      }

      if (options.roomType && ['standard', 'deluxe', 'suite'].includes(options.roomType)) {
        query = query.eq('room_type', options.roomType as 'standard' | 'deluxe' | 'suite');
      }

      if (options.maxGuests) {
        query = query.gte('max_guests', options.maxGuests);
      }

      query = query.order('price_per_night', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      let availableRooms = (data || []).map((r: any) => {
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
        const availabilityChecks = await Promise.all(
          availableRooms.map(async (room) => {
            const { data: isAvailable, error: rpcError } = await supabase.rpc('check_room_availability', {
              p_room_id: room.id,
              p_check_in: options.checkIn,
              p_check_out: options.checkOut,
            });
            if (rpcError) throw rpcError;
            return { room, isAvailable };
          })
        );

        availableRooms = availabilityChecks.filter(({ isAvailable }) => isAvailable).map(({ room }) => room);
      }

      return availableRooms as DatabaseRoom[];
    } catch (err) {
      throw handleApiError(err, 'fetching rooms');
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });

  return {
    rooms: data ?? [],
    isLoading,
    error: (error as Error | null)?.message ?? null,
    refetch,
  };
}

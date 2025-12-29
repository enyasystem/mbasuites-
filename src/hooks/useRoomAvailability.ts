import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityCheck {
  available: boolean;
  blockedDates: Array<{
    start_date: string;
    end_date: string;
    source: string;
  }>;
}

export const useRoomAvailability = (roomId: string | undefined) => {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchUnavailableDates = async () => {
      setIsLoading(true);
      try {
        // Use a security-definer RPC to fetch combined booking & blocked date ranges.
        const { data, error } = await supabase.rpc('get_room_unavailability', { p_room_id: roomId });
        if (error) throw error;

        const allDates: Date[] = [];

        const addDateRange = (startStr: string, endStr: string) => {
          const start = new Date(startStr);
          const end = new Date(endStr);
          const current = new Date(start);

          // Make the range inclusive of the end date so the check-out date is
          // treated as unavailable as well.
          while (current <= end) {
            allDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        };

        const rows = (data as Array<{ start_date: string; end_date: string }>) || [];
        rows.forEach(r => addDateRange(r.start_date, r.end_date));

        setUnavailableDates(allDates);
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnavailableDates();

    // Subscribe to real-time booking changes
    const channel = supabase
      .channel(`room-availability-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchUnavailableDates();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocked_dates',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchUnavailableDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const checkAvailability = useCallback(async (
    checkIn: Date,
    checkOut: Date
  ): Promise<AvailabilityCheck> => {
    if (!roomId) {
      return { available: false, blockedDates: [] };
    }

    try {
      const { data, error } = await supabase.rpc('check_room_availability', {
        p_room_id: roomId,
        p_check_in: checkIn.toISOString().split('T')[0],
        p_check_out: checkOut.toISOString().split('T')[0],
      });

      if (error) throw error;

      // Get details of blocking dates if not available
      let blockedDates: AvailabilityCheck['blockedDates'] = [];
      
      if (!data) {
        const checkInStr = checkIn.toISOString().split('T')[0];
        const checkOutStr = checkOut.toISOString().split('T')[0];

        // Use a security-definer RPC to fetch blocking ranges so anonymous users
        // can retrieve blocking details without RLS interfering with direct table reads.
        const { data: blockers, error: blockersErr } = await supabase.rpc('get_room_blockers', {
          p_room_id: roomId,
          p_check_in: checkInStr,
          p_check_out: checkOutStr,
        });

        if (blockersErr) throw blockersErr;

        blockedDates = (blockers || []).map((b: { start_date: string; end_date: string; source?: string }) => ({
          start_date: b.start_date,
          end_date: b.end_date,
          source: b.source ?? 'External Booking',
        }));
      }

      return { available: !!data, blockedDates };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: false, blockedDates: [] };
    }
  }, [roomId]);

  const isDateUnavailable = useCallback((date: Date): boolean => {
    return unavailableDates.some(
      d => d.toDateString() === date.toDateString()
    );
  }, [unavailableDates]);

  return {
    unavailableDates,
    isLoading,
    checkAvailability,
    isDateUnavailable,
  };
};

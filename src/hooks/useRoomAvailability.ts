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
        // Get bookings for this room
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('check_in_date, check_out_date')
          .eq('room_id', roomId)
          .neq('status', 'cancelled');

        if (bookingsError) throw bookingsError;

        // Get blocked dates from external calendars
        const { data: blocked, error: blockedError } = await supabase
          .from('blocked_dates')
          .select('start_date, end_date')
          .eq('room_id', roomId);

        if (blockedError) throw blockedError;

        // Combine all date ranges and expand to individual dates
        const allDates: Date[] = [];
        
        const addDateRange = (startStr: string, endStr: string) => {
          const start = new Date(startStr);
          const end = new Date(endStr);
          const current = new Date(start);

          // Make the range inclusive of the end date so the check-out date is
          // treated as unavailable as well (per product requirement).
          while (current <= end) {
            allDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        };

        bookings?.forEach(b => addDateRange(b.check_in_date, b.check_out_date));
        blocked?.forEach(b => addDateRange(b.start_date, b.end_date));

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

        // Check bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('check_in_date, check_out_date')
          .eq('room_id', roomId)
          .neq('status', 'cancelled')
          .lt('check_in_date', checkOutStr)
          .gt('check_out_date', checkInStr);

        // Check blocked dates
        const { data: blocked } = await supabase
          .from('blocked_dates')
          .select('start_date, end_date, summary')
          .eq('room_id', roomId)
          .lt('start_date', checkOutStr)
          .gt('end_date', checkInStr);

        blockedDates = [
          ...(bookings?.map(b => ({
            start_date: b.check_in_date,
            end_date: b.check_out_date,
            source: 'Direct Booking',
          })) || []),
          ...(blocked?.map(b => ({
            start_date: b.start_date,
            end_date: b.end_date,
            source: b.summary || 'External Booking',
          })) || []),
        ];
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

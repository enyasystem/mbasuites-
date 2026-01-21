import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import { sendBookingEmail } from "@/hooks/useBookingEmail";

const getErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
};

interface BookingData {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  num_guests: number;
  total_amount: number;
  currency: string;
  notes?: string;
}

const fetchRoomTitle = async (roomId: string): Promise<string> => {
  const { data } = await supabase
    .from('rooms')
    .select('title')
    .eq('id', roomId)
    .single();
  return data?.title || 'Room';
};

export const useBookingOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { logActivity } = useActivityLog();

  const createBooking = async (data: BookingData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to book");

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          ...data,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        // Handle double-booking error from trigger
        if (error.message.includes('not available')) {
          toast({
            title: "Room Unavailable",
            description: "This room is already booked for the selected dates. Please choose different dates.",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created.",
      });

      // Log activity
      await logActivity({
        action: 'booking_created',
        entityType: 'booking',
        entityId: booking.id,
        details: { room_id: data.room_id, check_in: data.check_in_date, check_out: data.check_out_date, amount: data.total_amount }
      });

      // Send confirmation email (don't await - fire and forget)
      const roomTitle = await fetchRoomTitle(data.room_id);
      sendBookingEmail({
        type: 'confirmation',
        bookingId: booking.id,
        guestEmail: data.guest_email,
        guestName: data.guest_name,
        roomTitle,
        checkInDate: data.check_in_date,
        checkOutDate: data.check_out_date,
        totalAmount: data.total_amount,
        currency: data.currency,
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: getErrorMessage(error) || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBooking = async (
    bookingId: string,
    updates: Partial<BookingData>
  ) => {
    setIsLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        if (error.message.includes('not available')) {
          toast({
            title: "Date Change Failed",
            description: "The room is not available for the new dates.",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      toast({
        title: "Booking Updated",
        description: "Your booking has been successfully updated.",
      });

      return booking;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update Failed",
        description: getErrorMessage(error) || "Failed to update booking.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled.",
      });

      await logActivity({
        action: 'booking_cancelled',
        entityType: 'booking',
        entityId: bookingId,
        details: { cancelled_at: new Date().toISOString() }
      });

      // Send cancellation email
      const roomTitle = await fetchRoomTitle(booking.room_id);
      sendBookingEmail({
        type: 'status_update',
        bookingId: booking.id,
        guestEmail: booking.guest_email,
        guestName: booking.guest_name,
        roomTitle,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        totalAmount: booking.total_amount,
        currency: booking.currency,
        status: 'cancelled',
      });

      return booking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: getErrorMessage(error) || "Failed to cancel booking.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Confirmed",
        description: "The booking has been confirmed.",
      });

      await logActivity({
        action: 'booking_confirmed',
        entityType: 'booking',
        entityId: bookingId,
      });

      // Send confirmation email
      const roomTitle = await fetchRoomTitle(booking.room_id);
      sendBookingEmail({
        type: 'status_update',
        bookingId: booking.id,
        guestEmail: booking.guest_email,
        guestName: booking.guest_name,
        roomTitle,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        totalAmount: booking.total_amount,
        currency: booking.currency,
        status: 'confirmed',
      });

      return booking;
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "Confirmation Failed",
        description: getErrorMessage(error) || "Failed to confirm booking.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Completed",
        description: "The booking has been marked as completed.",
      });

      await logActivity({
        action: 'booking_completed',
        entityType: 'booking',
        entityId: bookingId,
      });

      // Send completion email
      const roomTitle = await fetchRoomTitle(booking.room_id);
      sendBookingEmail({
        type: 'status_update',
        bookingId: booking.id,
        guestEmail: booking.guest_email,
        guestName: booking.guest_name,
        roomTitle,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        totalAmount: booking.total_amount,
        currency: booking.currency,
        status: 'completed',
      });

      return booking;
    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        title: "Operation Failed",
        description: getErrorMessage(error) || "Failed to complete booking.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
  };
};

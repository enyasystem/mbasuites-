import { supabase } from "@/integrations/supabase/client";

interface BookingEmailParams {
  type: "confirmation" | "status_update" | "reminder";
  bookingId: string;
  guestEmail: string;
  guestName: string;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status?: string;
}

export const sendBookingEmail = async (params: BookingEmailParams): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: params
    });

    if (error) {
      console.error('Error sending booking email:', error);
      return false;
    }

    console.log('Booking email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error invoking email function:', error);
    return false;
  }
};

export function useBookingEmail() {
  return { sendBookingEmail };
}
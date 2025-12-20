import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserBooking {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_amount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  notes: string | null;
  created_at: string;
  room?: {
    id: string;
    title: string;
    room_type: string;
    image_url: string | null;
    price_per_night: number;
  };
}

export function useUserBookings() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(`
            *,
            room:rooms (
              id,
              title,
              room_type,
              image_url,
              price_per_night
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setBookings(data || []);
      } catch (err: any) {
        console.error("Error fetching user bookings:", err);
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return { bookings, isLoading, error };
}

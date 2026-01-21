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
        type BookingRow = {
          id: string;
          room_id: string;
          check_in_date: string;
          check_out_date: string;
          num_guests: number;
          total_amount: number;
          currency: string;
          status: string;
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
          } | null;
        };

        const { data, error: fetchError } = await supabase
          .from<BookingRow>("bookings")
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

        if (fetchError) throw fetchError;

        const normalized: UserBooking[] = (data || []).map((r) => ({
          id: r.id,
          room_id: r.room_id,
          check_in_date: r.check_in_date,
          check_out_date: r.check_out_date,
          num_guests: r.num_guests,
          total_amount: r.total_amount,
          currency: r.currency,
          status: (r.status as UserBooking["status"]) || "pending",
          guest_name: r.guest_name,
          guest_email: r.guest_email,
          guest_phone: r.guest_phone,
          notes: r.notes,
          created_at: r.created_at,
          room: r.room
            ? {
                id: r.room.id,
                title: r.room.title,
                room_type: r.room.room_type,
                image_url: r.room.image_url,
                price_per_night: r.room.price_per_night,
              }
            : undefined,
        }));

        setBookings(normalized);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
        console.error("Error fetching user bookings:", err);
        setError(msg || "Failed to fetch bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return { bookings, isLoading, error };
}

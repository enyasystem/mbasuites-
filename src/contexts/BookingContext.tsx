import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Room } from "@/types/room";

interface BookingData {
  room: Room | null;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  nights: number;
  totalPrice: number;
}

interface BookingContextType {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const defaultBookingData: BookingData = {
  room: null,
  checkIn: undefined,
  checkOut: undefined,
  guests: { adults: 2, children: 0, rooms: 1 },
  nights: 0,
  totalPrice: 0,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  // restore booking from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookingData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const restored: BookingData = {
          room: parsed.room || null,
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : undefined,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : undefined,
          guests: parsed.guests || { adults: 2, children: 0, rooms: 1 },
          nights: parsed.nights || 0,
          totalPrice: parsed.totalPrice || 0,
        };
        setBookingData(restored);
      }
    } catch (e) {
      // ignore parse errors
      console.warn("Failed to restore booking from storage:", e);
    }
  }, []);

  const clearBooking = () => {
    setBookingData(defaultBookingData);
    try {
      localStorage.removeItem("bookingData");
    } catch (e) {
      // ignore
    }
  };

  // wrapped setter that persists to localStorage
  const persistBookingData = (data: BookingData) => {
    setBookingData(data);
    try {
      const toStore = {
        ...data,
        checkIn: data.checkIn ? data.checkIn.toISOString() : null,
        checkOut: data.checkOut ? data.checkOut.toISOString() : null,
      };
      localStorage.setItem("bookingData", JSON.stringify(toStore));
    } catch (e) {
      console.warn("Failed to persist booking to storage:", e);
    }
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData: persistBookingData, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

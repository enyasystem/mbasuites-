import { createContext, useContext, useState, ReactNode } from "react";
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

  const clearBooking = () => {
    setBookingData(defaultBookingData);
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, clearBooking }}>
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

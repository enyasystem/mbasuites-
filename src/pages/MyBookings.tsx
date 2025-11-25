import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Users, MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import { rooms } from "@/data/rooms";

interface MockBooking {
  id: string;
  reference: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalPrice: number;
  nights: number;
  bookedAt: Date;
  specialRequests?: string;
}

// Mock booking data
const mockBookings: MockBooking[] = [
  {
    id: "1",
    reference: "BK-2024-001",
    roomId: "1",
    checkIn: new Date(2024, 11, 25), // Dec 25, 2024
    checkOut: new Date(2024, 11, 28), // Dec 28, 2024
    guests: { adults: 2, children: 0 },
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+234 800 123 4567",
    },
    status: "confirmed",
    totalPrice: 45000,
    nights: 3,
    bookedAt: new Date(2024, 10, 15),
    specialRequests: "Late check-in requested",
  },
  {
    id: "2",
    reference: "BK-2024-002",
    roomId: "5",
    checkIn: new Date(2025, 0, 10), // Jan 10, 2025
    checkOut: new Date(2025, 0, 15), // Jan 15, 2025
    guests: { adults: 2, children: 1 },
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+234 800 123 4567",
    },
    status: "confirmed",
    totalPrice: 200000,
    nights: 5,
    bookedAt: new Date(2024, 11, 1),
  },
  {
    id: "3",
    reference: "BK-2024-003",
    roomId: "3",
    checkIn: new Date(2024, 9, 5), // Oct 5, 2024
    checkOut: new Date(2024, 9, 8), // Oct 8, 2024
    guests: { adults: 2, children: 0 },
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+234 800 123 4567",
    },
    status: "completed",
    totalPrice: 60000,
    nights: 3,
    bookedAt: new Date(2024, 8, 20),
  },
  {
    id: "4",
    reference: "BK-2024-004",
    roomId: "2",
    checkIn: new Date(2024, 10, 20), // Nov 20, 2024
    checkOut: new Date(2024, 10, 22), // Nov 22, 2024
    guests: { adults: 1, children: 0 },
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+234 800 123 4567",
    },
    status: "cancelled",
    totalPrice: 30000,
    nights: 2,
    bookedAt: new Date(2024, 10, 10),
  },
];

const statusConfig = {
  confirmed: { label: "Confirmed", variant: "default" as const, color: "text-green-600" },
  pending: { label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "text-red-600" },
  completed: { label: "Completed", variant: "outline" as const, color: "text-muted-foreground" },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filteredBookings = mockBookings.filter((booking) => {
    const now = new Date();
    if (filter === "upcoming") {
      return booking.checkIn > now && booking.status !== "cancelled";
    }
    if (filter === "past") {
      return booking.checkOut < now || booking.status === "cancelled" || booking.status === "completed";
    }
    return true;
  });

  const getRoomDetails = (roomId: string) => {
    return rooms.find((r) => r.id === roomId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">
                View and manage your hotel reservations
              </p>
            </div>
            <Button onClick={() => navigate("/rooms")}>Book a Room</Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Bookings
            </Button>
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "past" ? "default" : "outline"}
              onClick={() => setFilter("past")}
            >
              Past
            </Button>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No bookings found</p>
                <p className="text-sm">
                  {filter === "upcoming"
                    ? "You don't have any upcoming reservations"
                    : filter === "past"
                    ? "You don't have any past bookings"
                    : "You haven't made any bookings yet"}
                </p>
              </div>
              <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const room = getRoomDetails(booking.roomId);
                if (!room) return null;

                const statusInfo = statusConfig[booking.status];

                return (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-4 gap-4 p-6">
                      {/* Room Image */}
                      <div className="md:col-span-1">
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full h-32 md:h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{room.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ref: {booking.reference}
                            </p>
                          </div>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Check-in</p>
                              <p className="font-medium">
                                {format(booking.checkIn, "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Check-out</p>
                              <p className="font-medium">
                                {format(booking.checkOut, "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{booking.nights} nights</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Guests</p>
                              <p className="font-medium">
                                {booking.guests.adults} adult
                                {booking.guests.adults !== 1 ? "s" : ""}
                                {booking.guests.children > 0 &&
                                  `, ${booking.guests.children} child${
                                    booking.guests.children !== 1 ? "ren" : ""
                                  }`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="md:col-span-1 flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="text-2xl font-bold">
                            ₦{booking.totalPrice.toLocaleString()}
                          </p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            
                            {selectedBooking && (
                              <div className="space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                  <Badge variant={statusConfig[selectedBooking.status].variant} className="text-sm">
                                    {statusConfig[selectedBooking.status].label}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">
                                    Booked on {format(selectedBooking.bookedAt, "MMM dd, yyyy")}
                                  </p>
                                </div>

                                <Separator />

                                {/* Room Info */}
                                <div>
                                  <h3 className="font-semibold mb-3">Room Information</h3>
                                  <div className="flex gap-4">
                                    <img
                                      src={getRoomDetails(selectedBooking.roomId)?.images[0]}
                                      alt={getRoomDetails(selectedBooking.roomId)?.name}
                                      className="w-32 h-24 object-cover rounded-lg"
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {getRoomDetails(selectedBooking.roomId)?.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {getRoomDetails(selectedBooking.roomId)?.bedType}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {getRoomDetails(selectedBooking.roomId)?.size}m²
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Stay Details */}
                                <div>
                                  <h3 className="font-semibold mb-3">Stay Details</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Check-in</p>
                                      <p className="font-medium">
                                        {format(selectedBooking.checkIn, "EEEE, MMMM dd, yyyy")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">After 2:00 PM</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Check-out</p>
                                      <p className="font-medium">
                                        {format(selectedBooking.checkOut, "EEEE, MMMM dd, yyyy")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Before 12:00 PM</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Duration</p>
                                      <p className="font-medium">{selectedBooking.nights} nights</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Guests</p>
                                      <p className="font-medium">
                                        {selectedBooking.guests.adults} adult
                                        {selectedBooking.guests.adults !== 1 ? "s" : ""}
                                        {selectedBooking.guests.children > 0 &&
                                          `, ${selectedBooking.guests.children} child${
                                            selectedBooking.guests.children !== 1 ? "ren" : ""
                                          }`}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Guest Information */}
                                <div>
                                  <h3 className="font-semibold mb-3">Guest Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <p className="font-medium">
                                      {selectedBooking.guestInfo.firstName}{" "}
                                      {selectedBooking.guestInfo.lastName}
                                    </p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      {selectedBooking.guestInfo.email}
                                    </p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-4 w-4" />
                                      {selectedBooking.guestInfo.phone}
                                    </p>
                                  </div>
                                </div>

                                {selectedBooking.specialRequests && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h3 className="font-semibold mb-2">Special Requests</h3>
                                      <p className="text-sm">{selectedBooking.specialRequests}</p>
                                    </div>
                                  </>
                                )}

                                <Separator />

                                {/* Payment Summary */}
                                <div>
                                  <h3 className="font-semibold mb-3">Payment Summary</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Room rate × {selectedBooking.nights} nights
                                      </span>
                                      <span>₦{selectedBooking.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Service fee</span>
                                      <span>₦0</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                      <span>Total Paid</span>
                                      <span>₦{selectedBooking.totalPrice.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Booking Reference */}
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Booking Reference
                                  </p>
                                  <p className="font-mono font-bold">
                                    {selectedBooking.reference}
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

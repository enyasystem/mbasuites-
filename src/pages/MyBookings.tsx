import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Users, Mail, Phone, ChevronRight } from "lucide-react";
import { useUserBookings, UserBooking } from "@/hooks/useUserBookings";
import { useCurrency } from "@/context/CurrencyContext";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const statusConfig = {
  confirmed: { label: "Confirmed", variant: "default" as const, color: "text-green-600" },
  pending: { label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "text-red-600" },
  completed: { label: "Completed", variant: "outline" as const, color: "text-muted-foreground" },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const { bookings, isLoading, error } = useUserBookings();
  const { formatPrice, formatLocalPrice } = useCurrency();

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const checkIn = parseISO(booking.check_in_date);
    const checkOut = parseISO(booking.check_out_date);
    
    if (filter === "upcoming") {
      return checkIn > now && booking.status !== "cancelled";
    }
    if (filter === "past") {
      return checkOut < now || booking.status === "cancelled" || booking.status === "completed";
    }
    return true;
  });

  const getNights = (checkIn: string, checkOut: string) => {
    return differenceInDays(parseISO(checkOut), parseISO(checkIn));
  };

  const getRoomImage = (booking: UserBooking) => {
    if (booking.room?.image_url) return booking.room.image_url;
    if (booking.room?.room_type === "suite") return roomSuite;
    return roomDeluxe;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-64 mb-8" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

          {error && (
            <Card className="p-6 text-center border-destructive">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Card>
          )}

          {/* Bookings List */}
          {!error && filteredBookings.length === 0 ? (
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
                const statusInfo = statusConfig[booking.status];
                const nights = getNights(booking.check_in_date, booking.check_out_date);

                return (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-4 gap-4 p-6">
                      {/* Room Image */}
                      <div className="md:col-span-1">
                        <img
                          src={getRoomImage(booking)}
                          alt={booking.room?.title || "Room"}
                          className="w-full h-32 md:h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{booking.room?.title || "Room"}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ref: {booking.id.slice(0, 8).toUpperCase()}
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
                                {format(parseISO(booking.check_in_date), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Check-out</p>
                              <p className="font-medium">
                                {format(parseISO(booking.check_out_date), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{nights} nights</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Guests</p>
                              <p className="font-medium">{booking.num_guests} guest{booking.num_guests !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="md:col-span-1 flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="text-2xl font-bold">
                            {formatLocalPrice(booking.total_amount)}
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
                                    Booked on {format(parseISO(selectedBooking.created_at), "MMM dd, yyyy")}
                                  </p>
                                </div>

                                <Separator />

                                {/* Room Info */}
                                <div>
                                  <h3 className="font-semibold mb-3">Room Information</h3>
                                  <div className="flex gap-4">
                                    <img
                                      src={getRoomImage(selectedBooking)}
                                      alt={selectedBooking.room?.title || "Room"}
                                      className="w-32 h-24 object-cover rounded-lg"
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {selectedBooking.room?.title || "Room"}
                                      </p>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {selectedBooking.room?.room_type} Room
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
                                        {format(parseISO(selectedBooking.check_in_date), "EEEE, MMMM dd, yyyy")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">After 2:00 PM</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Check-out</p>
                                      <p className="font-medium">
                                        {format(parseISO(selectedBooking.check_out_date), "EEEE, MMMM dd, yyyy")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Before 12:00 PM</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Duration</p>
                                      <p className="font-medium">
                                        {getNights(selectedBooking.check_in_date, selectedBooking.check_out_date)} nights
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Guests</p>
                                      <p className="font-medium">
                                        {selectedBooking.num_guests} guest{selectedBooking.num_guests !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Guest Information */}
                                <div>
                                  <h3 className="font-semibold mb-3">Guest Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <p className="font-medium">{selectedBooking.guest_name}</p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      {selectedBooking.guest_email}
                                    </p>
                                    {selectedBooking.guest_phone && (
                                      <p className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        {selectedBooking.guest_phone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {selectedBooking.notes && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h3 className="font-semibold mb-2">Special Requests</h3>
                                      <p className="text-sm">{selectedBooking.notes}</p>
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
                                        Room rate × {getNights(selectedBooking.check_in_date, selectedBooking.check_out_date)} nights
                                      </span>
                                      <span>{formatLocalPrice(selectedBooking.total_amount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                      <span>Total</span>
                                      <span>{formatLocalPrice(selectedBooking.total_amount)}</span>
                                    </div>
                                  </div>
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

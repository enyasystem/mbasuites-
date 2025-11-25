import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { rooms } from "@/data/rooms";
import { useBooking } from "@/contexts/BookingContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GuestSelector from "@/components/GuestSelector";
import { format, differenceInCalendarDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Star, Users, Maximize2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBookingData } = useBooking();
  const room = useMemo(() => rooms.find((r) => r.id === id), [id]);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const { formatPrice } = useCurrency();

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Room not found</h2>
            <p className="text-muted-foreground mb-4">We couldn't find that room.</p>
            <Button onClick={() => navigate('/rooms')}>Back to rooms</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.max(1, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const totalPrice = nights * room.price * guests.rooms;

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    
    // Save booking data to context
    setBookingData({
      room,
      checkIn,
      checkOut,
      guests,
      nights,
      totalPrice,
    });
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const reviews = [
    { id: 1, author: "Jane D.", rating: 5, comment: "Amazing stay, very comfortable!" },
    { id: 2, author: "Mark S.", rating: 4, comment: "Great location and friendly staff." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="relative">
                <Carousel>
                  <CarouselContent className="h-80">
                    {room.images.map((src, i) => (
                      <CarouselItem key={i}>
                        <img src={src} alt={`${room.name} ${i + 1}`} className="w-full h-80 object-cover rounded" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{room.name}</h1>
                  <p className="text-sm text-muted-foreground">{room.bedType} • {room.size}m²</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(room.price)}</div>
                  <div className="text-xs text-muted-foreground">per night</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {room.description}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Guest Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{r.author}</div>
                          <div className="text-sm text-muted-foreground">{r.rating} / 5</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">{r.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Booking form + availability */}
          <aside className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold">{formatPrice(room.price)} <span className="text-sm text-muted-foreground">/ night</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Rating</div>
                  <div className="flex items-center gap-1"><Star className="h-4 w-4" />{room.rating}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">Check-in</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {checkIn ? format(checkIn, 'PPP') : 'Select check-in'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={checkIn} onSelect={setCheckIn} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">Check-out</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {checkOut ? format(checkOut, 'PPP') : 'Select check-out'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={checkOut} onSelect={setCheckOut} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Guests & Rooms</label>
                  <GuestSelector defaultAdults={guests.adults} defaultChildren={guests.children} defaultRooms={guests.rooms} onChange={(g) => setGuests(g)} />
                </div>

                <div className="pt-2 border-t mt-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Nights</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Rooms</span>
                    <span>{guests.rooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold mt-2">
                    <span>Total</span>
                    <span>{totalPrice ? formatPrice(totalPrice) : formatPrice(0)}</span>
                  </div>
                </div>

                <div>
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleBooking}
                  >
                    Book now
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2">Availability</h4>
              <CalendarComponent mode="single" />
            </Card>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoomDetails;

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRoom } from "@/hooks/useRoom";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
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
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList, Review } from "@/components/ReviewsList";
import PhotoTour from "@/components/PhotoTour";
import { format, differenceInCalendarDays } from "date-fns";
import { Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { toast } from "sonner";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBookingData } = useBooking();
  const { user } = useAuth();
  const { room, isLoading, error } = useRoom(id);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  // availability checks
  const { unavailableDates, isLoading: availabilityLoading, checkAvailability, isDateUnavailable } = useRoomAvailability(room?.id);
  const [isAvailableForSelectedDates, setIsAvailableForSelectedDates] = useState<boolean | null>(null);
  const [checkingSelection, setCheckingSelection] = useState(false);
  // Separate open states for mobile compact booking card so hidden desktop popovers
  // don't render their portals when mobile popovers are opened.
  const [checkInOpenMobile, setCheckInOpenMobile] = useState(false);
  const [checkOutOpenMobile, setCheckOutOpenMobile] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  const checkInRefMobile = useRef<HTMLDivElement | null>(null);
  const checkOutRefMobile = useRef<HTMLDivElement | null>(null);
  const checkInRef = useRef<HTMLDivElement | null>(null);
  const checkOutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (checkInOpenMobile) checkInRefMobile.current?.focus();
  }, [checkInOpenMobile]);

  useEffect(() => {
    if (checkOutOpenMobile) checkOutRefMobile.current?.focus();
  }, [checkOutOpenMobile]);

  useEffect(() => {
    if (checkInOpen) checkInRef.current?.focus();
  }, [checkInOpen]);

  // Re-check availability for selected dates when dates change
  useEffect(() => {
    let cancelled = false;
    if (!checkIn || !checkOut) {
      setIsAvailableForSelectedDates(null);
      return;
    }

    const doCheck = async () => {
      setCheckingSelection(true);
      try {
        const res = await checkAvailability(checkIn, checkOut);
        if (!cancelled) setIsAvailableForSelectedDates(res.available);
      } catch (err) {
        console.error('Availability check failed', err);
        if (!cancelled) setIsAvailableForSelectedDates(null);
      } finally {
        if (!cancelled) setCheckingSelection(false);
      }
    };

    doCheck();

    return () => { cancelled = true; };
  }, [checkIn, checkOut, checkAvailability]);

  useEffect(() => {
    if (checkOutOpen) checkOutRef.current?.focus();
  }, [checkOutOpen]);
  const { formatPrice, formatLocalPrice } = useCurrency();

  // Mock reviews data - in real app, fetch from database
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      userId: "user1",
      userName: "Jane Doe",
      rating: 5,
      comment: "Amazing stay! The room was spotless and the staff were incredibly friendly. Will definitely come back!",
      createdAt: "2024-11-20",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Mark Smith",
      rating: 4,
      comment: "Great location and comfortable room. The amenities exceeded my expectations.",
      createdAt: "2024-11-15",
    },
    {
      id: "3",
      userId: "user3",
      userName: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely loved it! Beautiful views and excellent service throughout my stay.",
      createdAt: "2024-11-10",
    },
  ]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 4.5;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !room) {
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

  // Create images array - prefer room.images (from room_images), fallback to image_url or a placeholder
  const images = room && room.images && room.images.length > 0
    ? room.images
    : room && room.image_url
      ? [room.image_url]
      : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"];

  const nights = checkIn && checkOut ? Math.max(1, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const totalPrice = nights * room.price_per_night * guests.rooms;

  // Helpers for date disabling using unavailable dates from the availability hook
  const isUnavailableDate = (d: Date) => isDateUnavailable(d);

  const isCheckOutDisabled = (d: Date) => {
    // Don't allow selecting past dates
    if (d < new Date()) return true;
    // If no check-in is selected, fallback to standard behavior
    if (!checkIn) return d < new Date();
    // Prevent selecting check-out earlier than check-in
    if (d < checkIn) return true;

    // Check if any unavailable date falls between check-in (inclusive) and the candidate check-out (inclusive)
    const checkInTime = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime();
    const candidateTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    return unavailableDates.some(u => {
      const ut = new Date(u.getFullYear(), u.getMonth(), u.getDate()).getTime();
      // inclusive comparison so booking end date is also considered unavailable
      return ut >= checkInTime && ut <= candidateTime;
    });
  };

  // Calendar components to show a tooltip on booked / past dates and preserve nav icons
  const calendarComponents = {
    IconLeft: (props: React.SVGProps<SVGSVGElement>) => <ChevronLeft className="h-4 w-4" {...props} />,
    IconRight: (props: React.SVGProps<SVGSVGElement>) => <ChevronRight className="h-4 w-4" {...props} />,
    DayContent: ({ date }: { date: Date }) => {
      const title = isUnavailableDate(date) ? 'Booked' : date < new Date() ? 'Past date' : undefined;
      return <div title={title}>{date.getDate()}</div>;
    },
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.');
      return;
    }

    try {
      // If we already checked availability for the selected dates, use cached result.
      let available: boolean | null = isAvailableForSelectedDates;
      if (available === null) {
        const res = await checkAvailability(checkIn, checkOut);
        available = res.available;
      }

      if (!available) {
        toast.error('Those dates are not available for booking for this room.');
        return;
      }

      // Transform database room to booking format
      const bookingRoom = {
        id: room.id,
        name: room.title,
        description: room.description || "",
        price: room.price_per_night,
        images: images,
        amenities: room.amenities || [],
        capacity: { adults: room.max_guests, children: 0 },
        size: 30,
        bedType: "King Bed",
        rating: averageRating,
        category: room.room_type as "standard" | "deluxe" | "executive" | "presidential",
        type: "king" as const,
        available: room.is_available,
      };

      setBookingData({
        room: bookingRoom,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,
      });
      
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to check availability before booking', err);
      toast.error('Unable to verify availability. Try again.');
    }


  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="relative">
                <div className="absolute right-4 top-4 z-10">
                  <button className="bg-background/80 px-3 py-1 rounded shadow-sm text-sm" onClick={() => navigate(`/rooms/${room.id}/photos`)}>View photos</button>
                </div>
                <Carousel>
                  <CarouselContent className="h-80">
                    {images.map((src, i) => (
                      <CarouselItem key={i}>
                        <img
                          src={src}
                          alt={`${room.title} ${i + 1}`}
                          className="w-full h-80 object-cover rounded cursor-pointer"
                          onClick={() => navigate(`/rooms/${room.id}/photos`, { state: { startIndex: i } })}
                        />
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
                  <h1 className="text-2xl font-bold">{room.title}</h1>
                  <p className="text-sm text-muted-foreground capitalize">{room.room_type} • Room {room.room_number}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatLocalPrice(room.price_per_night)}</div>
                  <div className="text-xs text-muted-foreground">per night</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {room.description || "A comfortable and well-appointed room for your stay."}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(room.amenities || []).map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Guest Reviews</h3>
                {/* Mobile: show compact booking card above reviews */}
                <div className="block lg:hidden mb-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="text-2xl font-bold">{formatLocalPrice(room.price_per_night)} <span className="text-sm text-muted-foreground">/ night</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Rating</div>
                        <div className="flex items-center gap-1"><Star className="h-4 w-4" />{averageRating.toFixed(1)}</div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">Check-in</label>
                        <Popover open={checkInOpenMobile} onOpenChange={setCheckInOpenMobile}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left" onClick={() => setCheckInOpenMobile(true)}>
                              {checkIn ? format(checkIn, 'PPP') : 'Select check-in'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <div ref={checkInRefMobile} tabIndex={-1}>
                              <CalendarComponent
                                mode="single"
                                components={calendarComponents}
                                selected={checkIn}
                                onSelect={(date) => {
                                    setCheckIn(date as Date);
                                    // Delay closing slightly to ensure DayPicker selection finishes,
                                    // then auto-open the check-out popover for the next selection.
                                    setTimeout(() => {
                                      setCheckInOpenMobile(false);
                                      setTimeout(() => setCheckOutOpenMobile(true), 100);
                                    }, 150);
                                }}
                                disabled={(date) => date < new Date() || isUnavailableDate(date)}
                              />
                              <div className="flex items-center gap-3 mt-2">
                                <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                                <span className="text-sm text-muted-foreground">Booked</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">Check-out</label>
                        <Popover open={checkOutOpenMobile} onOpenChange={setCheckOutOpenMobile}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left" onClick={() => setCheckOutOpenMobile(true)}>
                              {checkOut ? format(checkOut, 'PPP') : 'Select check-out'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <div ref={checkOutRefMobile} tabIndex={-1}>
                              <CalendarComponent
                                mode="single"
                                components={calendarComponents}
                                selected={checkOut}
                                onSelect={(date) => {
                                  setCheckOut(date as Date);
                                  // Delay closing slightly to ensure DayPicker selection finishes
                                  setTimeout(() => setCheckOutOpenMobile(false), 150);
                                }}
                                disabled={(date) => isCheckOutDisabled(date)}
                              />
                              <div className="flex items-center gap-3 mt-2">
                                <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                                <span className="text-sm text-muted-foreground">Booked</span>
                              </div>
                            </div>
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
                          <span>{totalPrice ? formatLocalPrice(totalPrice) : formatLocalPrice(0)}</span>
                        </div>
                      </div>

                      <div>
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={handleBooking}
                          disabled={(isAvailableForSelectedDates === false) || !room.is_available}
                        >
                          {checkingSelection ? "Checking..." : "Book now"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                <ReviewsList reviews={reviews} averageRating={averageRating} />
              </div>

              {user && (
                <div className="mt-6">
                  <ReviewForm
                    roomId={room.id}
                    roomName={room.title}
                    onReviewSubmitted={() => {
                      console.log("Review submitted");
                    }}
                  />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground text-center">
                {!user && (
                  <p>
                    <Button
                      variant="link"
                      className="text-accent p-0 h-auto"
                      onClick={() => navigate("/login")}
                    >
                      Sign in
                    </Button>
                    {" "}to leave a review
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Booking form + availability (desktop only) */}
          <aside className="space-y-6 hidden lg:block">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold">{formatLocalPrice(room.price_per_night)} <span className="text-sm text-muted-foreground">/ night</span></div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">Rating</div>
                    <div className="flex items-center gap-1"><Star className="h-4 w-4" />{averageRating.toFixed(1)}</div>
                    {/* Availability badge */}
                    {isAvailableForSelectedDates === false ? (
                      <Badge variant="destructive">Not available for selected dates</Badge>
                    ) : (!checkIn && isDateUnavailable(new Date()) ? (
                      <Badge variant="destructive">Booked Today</Badge>
                    ) : (!room.is_available ? (
                      <Badge variant="secondary">Unavailable</Badge>
                    ) : null))}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">Check-in</label>
                  <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left" onClick={() => setCheckInOpen(true)}>
                        {checkIn ? format(checkIn, 'PPP') : 'Select check-in'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div ref={checkInRef} tabIndex={-1}>
                        <CalendarComponent
                          mode="single"
                          components={calendarComponents}
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date as Date);
                            // Delay closing slightly to ensure DayPicker selection finishes,
                            // then auto-open the desktop check-out popover.
                            setTimeout(() => {
                              setCheckInOpen(false);
                              setTimeout(() => setCheckOutOpen(true), 100);
                            }, 150);
                          }}
                          disabled={(date) => date < new Date() || isUnavailableDate(date)}
                        />
                        <div className="flex items-center gap-3 mt-2">
                          <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                          <span className="text-sm text-muted-foreground">Booked</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">Check-out</label>
                  <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left" onClick={() => setCheckOutOpen(true)}>
                        {checkOut ? format(checkOut, 'PPP') : 'Select check-out'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div ref={checkOutRef} tabIndex={-1}>
                        <CalendarComponent
                          mode="single"
                          components={calendarComponents}
                          selected={checkOut}
                          onSelect={(date) => {
                            setCheckOut(date as Date);
                            // Delay closing slightly to ensure DayPicker selection finishes
                            setTimeout(() => setCheckOutOpen(false), 150);
                          }}
                          disabled={(date) => isCheckOutDisabled(date)}
                        />
                        <div className="flex items-center gap-3 mt-2">
                          <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                          <span className="text-sm text-muted-foreground">Booked</span>
                        </div>
                      </div>
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
                    <span>{totalPrice ? formatLocalPrice(totalPrice) : formatLocalPrice(0)}</span>
                  </div>
                </div>

                <div>
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleBooking}
                    disabled={(isAvailableForSelectedDates === false) || !room.is_available}
                  >
                    {checkingSelection ? "Checking..." : "Book now"}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2">Availability</h4>
              <CalendarComponent mode="single" components={calendarComponents} disabled={(date) => date < new Date() || isUnavailableDate(date)} />
              <div className="flex items-center gap-3 mt-3">
                <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                <span className="text-sm text-muted-foreground">Booked</span>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoomDetails;

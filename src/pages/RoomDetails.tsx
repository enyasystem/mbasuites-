import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRoom } from "@/hooks/useRoom";
import { useGallery } from "@/hooks/useGallery";
import type { GalleryItem } from "@/hooks/useGallery";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import GuestSelector from "@/components/GuestSelector";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { useRoomReviews } from "@/hooks/useRoomReviews";
import { format, differenceInCalendarDays } from "date-fns";
import { Star, ChevronLeft, ChevronRight, X, Images } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";

type GalleryImage = { url: string; title?: string };

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBookingData } = useBooking();
  const { user } = useAuth();
  const { room, isLoading, error } = useRoom(id);
  const { items: galleryHookItems = [], isLoading: mediaLoading } = useGallery();

  // Filter gallery items for this room and normalize to { url, title }
  const mediaImages = galleryHookItems
    .filter((it: GalleryItem) => String(it.room_id) === String(id))
    .map((it: GalleryItem) => ({ url: it.image_url, title: it.title }));

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkInOpenMobile, setCheckInOpenMobile] = useState(false);
  const [checkOutOpenMobile, setCheckOutOpenMobile] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const { formatPrice, formatLocalPrice } = useCurrency();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reviews
  const { reviews = [] } = useRoomReviews(room?.id);

  // Prefer mediaImages (from room_media) otherwise fallback to room.images or image_url
  const galleryImages: GalleryImage[] = (mediaImages && mediaImages.length > 0)
    ? mediaImages
    : (room && room.images && room.images.length > 0)
      ? room.images.map((u: string) => ({ url: u }))
      : (room && room.image_url) ? [{ url: room.image_url }] : [];

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 4.5;

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nights = checkIn && checkOut ? Math.max(1, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const totalPrice = nights * room.price_per_night * guests.rooms;

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    
    // Transform database room to booking format
    const bookingRoom = {
      id: room.id,
      name: room.title,
      description: room.description || "",
      price: room.price_per_night,
      images: galleryImages.map((g: GalleryImage) => g.url),
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Carousel */}
            <Card className="overflow-hidden">
              <div className="relative">
                <Carousel>
                  <CarouselContent className="h-80">
                    {galleryImages.map((img: GalleryImage, i: number) => (
                      <CarouselItem key={i}>
                        <img 
                          src={img.url} 
                          alt={img.title || `${room.title} ${i + 1}`} 
                          className="w-full h-80 object-cover cursor-pointer transition-transform hover:scale-[1.02]" 
                          onClick={() => openLightbox(i)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-sm">
                    <Images className="h-4 w-4" />
                    <span>{galleryImages.length} photos</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Grid (if multiple images) */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {galleryImages.slice(0, 6).map((img: GalleryImage, i: number) => (
                  <div 
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                    onClick={() => openLightbox(i)}
                  >
                    <img 
                      src={img.url} 
                      alt={img.title || `Thumbnail ${i + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {i === 5 && galleryImages.length > 6 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">+{galleryImages.length - 6}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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
                  {(room.amenities || []).map((a: string) => (
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
                            <CalendarComponent
                              mode="single"
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
                              disabled={(date) => date < new Date()}
                            />
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
                            <CalendarComponent
                              mode="single"
                              selected={checkOut}
                              onSelect={(date) => {
                                setCheckOut(date as Date);
                                // Delay closing slightly to ensure DayPicker selection finishes
                                setTimeout(() => setCheckOutOpenMobile(false), 150);
                              }}
                              disabled={(date) => date < (checkIn || new Date())}
                            />
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
                        >
                          Book now
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
                  <div className="text-sm">Rating</div>
                  <div className="flex items-center gap-1"><Star className="h-4 w-4" />{averageRating.toFixed(1)}</div>
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
                      <CalendarComponent
                        mode="single"
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
                        disabled={(date) => date < new Date()}
                      />
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
                      <CalendarComponent
                        mode="single"
                        selected={checkOut}
                        onSelect={(date) => {
                          setCheckOut(date as Date);
                          // Delay closing slightly to ensure DayPicker selection finishes
                          setTimeout(() => setCheckOutOpen(false), 150);
                        }}
                        disabled={(date) => date < (checkIn || new Date())}
                      />
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
                  >
                    Book now
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2">Availability</h4>
              <CalendarComponent mode="single" disabled={(date) => date < new Date()} />
            </Card>
          </aside>
        </div>
      </div>

      <Footer />

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {galleryImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main image */}
            <img
              src={galleryImages[lightboxIndex]?.url}
              alt={galleryImages[lightboxIndex]?.title || `Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image counter and title */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="text-lg font-medium">{galleryImages[lightboxIndex]?.title || room.title}</p>
              <p className="text-sm text-white/70">{lightboxIndex + 1} / {galleryImages.length}</p>
            </div>

            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto py-2">
                {galleryImages.map((img: GalleryImage, i: number) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === lightboxIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomDetails;

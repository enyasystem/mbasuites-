import { useState, useMemo, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLocation } from "@/context/useLocation";
import { useRooms, DatabaseRoom } from "@/hooks/useRooms";
import { RoomFilters } from "@/types/room";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RippleCard } from "@/components/ui/ripple-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Users, Maximize2, Star, Wifi, Coffee, Tv, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import usePromotions from "@/hooks/usePromotions";

// Static filter options
const allAmenities = ["WiFi", "AC", "TV", "Minibar", "Safe", "Coffee Maker", "Bathtub", "Living Area", "Work Desk", "Balcony"];
const allBedTypes = ["Single Bed", "Double Bed", "Queen Bed", "King Bed", "King Bed + Sofa Bed"];
const allCategories = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
];

interface FiltersCardProps {
  compact?: boolean;
  stagedFilters: RoomFilters;
  maxPrice: number;
  formatLocalPrice: (n: number) => string;
  toggleCategory: (c: string) => void;
  toggleBedType: (b: string) => void;
  toggleAmenity: (a: string) => void;
  countIfToggled: (type: "amenity" | "bed" | "category", value: string) => number;
  resetFilters: () => void;
  setStagedFilters: React.Dispatch<React.SetStateAction<RoomFilters>>;
}

function FiltersCard({ compact, stagedFilters, maxPrice, formatLocalPrice, toggleCategory, toggleBedType, toggleAmenity, countIfToggled, resetFilters, setStagedFilters }: FiltersCardProps) {
  return (
    <Card className={compact ? "" : "sticky top-24"}>
      {!compact && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-accent hover:text-accent/80"
            >
              Reset
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {/* Price Range */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-semibold">Price Range (per night)</Label>
            <div className="space-y-4">
              <Slider
                value={stagedFilters.priceRange}
                onValueChange={(value) =>
                  setStagedFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
                }
                max={maxPrice}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatLocalPrice(stagedFilters.priceRange[0])}</span>
                <span>{formatLocalPrice(stagedFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Room Category */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-semibold">Room Category</Label>
            <div className="space-y-3">
              {allCategories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={stagedFilters.categories.includes(category.value)}
                    onCheckedChange={() => toggleCategory(category.value)}
                  />
                  <Label
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <span>{category.label}</span>
                    <Badge className="text-xs bg-background/80">{countIfToggled('category', category.value)}</Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Bed Type */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-semibold">Bed Type</Label>
            <div className="space-y-3">
              {allBedTypes.map((bedType) => (
                <div key={bedType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bed-${bedType}`}
                    checked={stagedFilters.bedTypes.includes(bedType)}
                    onCheckedChange={() => toggleBedType(bedType)}
                  />
                  <Label
                    htmlFor={`bed-${bedType}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <span>{bedType}</span>
                    <Badge className="text-xs bg-background/80">{countIfToggled('bed', bedType)}</Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Room Size */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-semibold">Minimum Room Size</Label>
            <div className="space-y-4">
              <Slider
                value={[stagedFilters.minSize]}
                onValueChange={(value) => setStagedFilters((prev) => ({ ...prev, minSize: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                {stagedFilters.minSize} m² and above
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Amenities */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Amenities</Label>
            <div className="space-y-3">
              {allAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={stagedFilters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <span>{amenity}</span>
                    <Badge className="text-xs bg-background/80">{countIfToggled('amenity', amenity)}</Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locations, selectedLocation, locationId, setLocationId } = useLocation();
  
  // Get search params from URL
  const urlLocationId = searchParams.get("location");
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const urlGuests = searchParams.get("guests");

  // Handle location change
  const handleLocationChange = (newLocationId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newLocationId === "all") {
      newParams.delete("location");
    } else {
      newParams.set("location", newLocationId);
    }
    setSearchParams(newParams);
  };

  const { rooms: dbRooms, isLoading } = useRooms({
    locationId: urlLocationId,
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    maxGuests: urlGuests ? parseInt(urlGuests) : undefined,
  });

  const { data: promotions = [] } = usePromotions();

  const getApplicable = (room: typeof rooms[number]) => {
    return promotions.find((p) => {
      if (!p.display_locations || !p.display_locations.includes("rooms")) return false;
      const types = p.applicable_room_types || [];
      if (types.length > 0 && !types.includes(room.category)) return false;
      return true;
    });
  };

  // Calculate max price dynamically from rooms data
  const maxPrice = useMemo(() => {
    if (dbRooms.length === 0) return 500000;
    return Math.max(...dbRooms.map(r => r.price_per_night), 500000);
  }, [dbRooms]);

  const initialFilters: RoomFilters = useMemo(() => ({
    priceRange: [0, maxPrice] as [number, number],
    bedTypes: [],
    minSize: 0,
    amenities: [],
    categories: [],
    sortBy: "price-asc",
  }), [maxPrice]);
  const [filters, setFilters] = useState<RoomFilters>(() => ({
    priceRange: [0, 500000] as [number, number],
    bedTypes: [],
    minSize: 0,
    amenities: [],
    categories: [],
    sortBy: "price-asc",
  }));
  const [stagedFilters, setStagedFilters] = useState<RoomFilters>(() => ({
    priceRange: [0, 500000] as [number, number],
    bedTypes: [],
    minSize: 0,
    amenities: [],
    categories: [],
    sortBy: "price-asc",
  }));
  const { formatLocalPrice } = useCurrency();

  // Update filters when maxPrice changes (data loaded)
  useEffect(() => {
    if (maxPrice > 0) {
      const t = window.setTimeout(() => {
        setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] as [number, number] }));
        setStagedFilters(prev => ({ ...prev, priceRange: [0, maxPrice] as [number, number] }));
      }, 0);
      return () => clearTimeout(t);
    }
    return;
  }, [maxPrice]);

  // Map database rooms to display format
  const rooms = useMemo(() => {
    return dbRooms.map((room) => ({
      id: room.id,
      name: room.title,
      type: room.room_type,
      category: room.room_type,
      price: room.price_per_night,
      size: 30, // Default size as not in DB
      capacity: { adults: room.max_guests, children: 0 },
      bedType: room.room_type === "suite" ? "King Bed" : room.room_type === "deluxe" ? "Queen Bed" : "Double Bed",
      amenities: room.amenities || [],
      images: room.images && room.images.length > 0 ? room.images : [room.image_url || (room.room_type === "suite" ? roomSuite : roomDeluxe)],
      description: room.description || "",
      rating: 4.5, // Default rating as not in DB
      available: room.is_available,
      locationId: room.location_id,
    }));
  }, [dbRooms]);

  const filteredAndSortedRooms = useMemo(() => {
    const filtered = rooms.filter((room) => {
      // Price filter
      if (room.price < filters.priceRange[0] || room.price > filters.priceRange[1]) {
        return false;
      }

      // Bed type filter
      if (filters.bedTypes.length > 0 && !filters.bedTypes.includes(room.bedType)) {
        return false;
      }

      // Size filter
      if (room.size < filters.minSize) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          room.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(room.category)) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return b.rating - a.rating;
        case "size-desc":
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, rooms]);

  const toggleAmenity = (amenity: string) => {
    setStagedFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleBedType = (bedType: string) => {
    setStagedFilters((prev) => ({
      ...prev,
      bedTypes: prev.bedTypes.includes(bedType)
        ? prev.bedTypes.filter((b) => b !== bedType)
        : [...prev.bedTypes, bedType],
    }));
  };

  const toggleCategory = (category: string) => {
    setStagedFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setStagedFilters(initialFilters);
  };

  // Helper: determine if a room matches a given set of filters
  const roomMatchesFilters = (room: typeof rooms[number], f: RoomFilters) => {
    if (room.price < f.priceRange[0] || room.price > f.priceRange[1]) return false;
    if (f.bedTypes.length > 0 && !f.bedTypes.includes(room.bedType)) return false;
    if (room.size < f.minSize) return false;
    if (f.amenities.length > 0) {
      const hasAllAmenities = f.amenities.every((amenity) => room.amenities.includes(amenity));
      if (!hasAllAmenities) return false;
    }
    if (f.categories.length > 0 && !f.categories.includes(room.category)) return false;
    return true;
  };

  // Count matches if we toggle a given amenity/bed/category in the staged filters
  const countIfToggled = (type: "amenity" | "bed" | "category", value: string) => {
    const f = { ...stagedFilters } as RoomFilters;
    if (type === "amenity") {
      f.amenities = stagedFilters.amenities.includes(value)
        ? stagedFilters.amenities
        : [...stagedFilters.amenities, value];
    }
    if (type === "bed") {
      f.bedTypes = stagedFilters.bedTypes.includes(value)
        ? stagedFilters.bedTypes
        : [...stagedFilters.bedTypes, value];
    }
    if (type === "category") {
      f.categories = stagedFilters.categories.includes(value)
        ? stagedFilters.categories
        : [...stagedFilters.categories, value];
    }

    return rooms.filter((r) => roomMatchesFilters(r, f)).length;
  };

  const activeFiltersCount = () => {
    let c = 0;
    if (stagedFilters.priceRange[0] !== initialFilters.priceRange[0] || stagedFilters.priceRange[1] !== initialFilters.priceRange[1]) c++;
    if (stagedFilters.bedTypes.length) c += stagedFilters.bedTypes.length;
    if (stagedFilters.minSize > 0) c++;
    if (stagedFilters.amenities.length) c += stagedFilters.amenities.length;
    if (stagedFilters.categories.length) c += stagedFilters.categories.length;
    return c;
  };

  const applyStagedFilters = () => {
    setFilters(stagedFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeAppliedFilter = (type: "amenity" | "bed" | "category" | "minSize" | "priceRange", value?: string) => {
    const removeFrom = (f: RoomFilters) => {
      const copy = { ...f } as RoomFilters;
      if (type === 'amenity' && typeof value === 'string') copy.amenities = copy.amenities.filter(a => a !== value);
      if (type === 'bed' && typeof value === 'string') copy.bedTypes = copy.bedTypes.filter(b => b !== value);
      if (type === 'category' && typeof value === 'string') copy.categories = copy.categories.filter(c => c !== value);
      if (type === 'minSize') copy.minSize = 0;
      if (type === 'priceRange') copy.priceRange = [0, maxPrice];
      return copy;
    }

    const newFilters = removeFrom(filters);
    const newStaged = removeFrom(stagedFilters);
    setFilters(newFilters);
    setStagedFilters(newStaged);
  };

  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Our Rooms
              </h1>
              <p className="text-muted-foreground">Discover the perfect room for your stay.</p>
            </div>
            
            {/* Location Selector */}
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Select
                value={urlLocationId || locationId || "all"}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} - {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            {urlCheckIn && urlCheckOut && (
              <Badge variant="outline">
                {urlCheckIn} → {urlCheckOut}
              </Badge>
            )}
            {urlGuests && (
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {urlGuests} guests
              </Badge>
            )}
            <span className="font-medium text-foreground">{rooms.length} rooms available</span>
            {selectedLocation && selectedLocation.price_per_night_usd !== undefined && selectedLocation.price_per_night_usd !== null && (
              <span className="ml-3 text-sm text-muted-foreground">Base price: ${selectedLocation.price_per_night_usd} / night</span>
            )}
          </div>
          {/* Active filter chips (applied filters) */}
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.categories.map((c) => (
              <Badge key={`chip-cat-${c}`} variant="secondary" className="cursor-pointer" onClick={() => removeAppliedFilter('category', c)}>
                {c} ×
              </Badge>
            ))}
            {filters.bedTypes.map((b) => (
              <Badge key={`chip-bed-${b}`} variant="secondary" className="cursor-pointer" onClick={() => removeAppliedFilter('bed', b)}>
                {b} ×
              </Badge>
            ))}
            {filters.amenities.map((a) => (
              <Badge key={`chip-amen-${a}`} variant="secondary" className="cursor-pointer" onClick={() => removeAppliedFilter('amenity', a)}>
                {a} ×
              </Badge>
            ))}
            {filters.minSize > 0 && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => removeAppliedFilter('minSize')}>
                Min size: {filters.minSize}m² ×
              </Badge>
            )}
            {(filters.priceRange[0] !== initialFilters.priceRange[0] || filters.priceRange[1] !== initialFilters.priceRange[1]) && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => removeAppliedFilter('priceRange')}>
                ${filters.priceRange[0]} - ${filters.priceRange[1]} ×
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (desktop) + Popover (mobile) */}
          <div className="lg:w-80 shrink-0">
            <div className="hidden lg:block">
              <FiltersCard
                stagedFilters={stagedFilters}
                maxPrice={maxPrice}
                formatLocalPrice={formatLocalPrice}
                toggleCategory={toggleCategory}
                toggleBedType={toggleBedType}
                toggleAmenity={toggleAmenity}
                countIfToggled={countIfToggled}
                resetFilters={resetFilters}
                setStagedFilters={setStagedFilters}
              />
            </div>
            <div className="block lg:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    Filters ({activeFiltersCount()})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] max-w-full p-0">
                    <div className="p-4">
                    <FiltersCard
                      compact
                      stagedFilters={stagedFilters}
                      maxPrice={maxPrice}
                      formatLocalPrice={formatLocalPrice}
                      toggleCategory={toggleCategory}
                      toggleBedType={toggleBedType}
                      toggleAmenity={toggleAmenity}
                      countIfToggled={countIfToggled}
                      resetFilters={resetFilters}
                      setStagedFilters={setStagedFilters}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" onClick={resetFilters}>Reset</Button>
                      <Button onClick={() => { applyStagedFilters(); }}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedRooms.length} {filteredAndSortedRooms.length === 1 ? "room" : "rooms"} found
              </p>
              <Select
                value={filters.sortBy}
                onValueChange={(value: RoomFilters['sortBy']) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="size-desc">Largest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedRooms.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No rooms match your filters
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedRooms.map((room, index) => {
                    const promo = getApplicable(room);
                    return (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link to={`/rooms/${room.id}`} className="group block">
                        <motion.div
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RippleCard className="overflow-hidden border border-border rounded-lg hover:shadow-lg transition-all duration-300 h-full">
                            <motion.div 
                              className="relative h-48 overflow-hidden"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            >
                              <img
                                src={room.images[0]}
                                alt={room.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <motion.div 
                                className="absolute top-3 left-3"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Badge className="bg-accent text-accent-foreground">
                                  {room.category.charAt(0).toUpperCase() + room.category.slice(1)}
                                </Badge>
                              </motion.div>
                              {promo && (
                                <div className="absolute top-11 left-3">
                                  <span className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">{promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `₦${promo.discount_value} OFF`}</span>
                                </div>
                              )}
                              <motion.div 
                                className="absolute top-3 right-3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-accent text-accent" />
                                  <span className="text-sm font-semibold">{room.rating}</span>
                                </div>
                              </motion.div>
                            </motion.div>

                            <CardContent className="p-4">
                              <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                                {room.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {room.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{room.capacity.adults} adults</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Maximize2 className="h-4 w-4" />
                                  <span>{room.size}m²</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {room.amenities.slice(0, 4).map((amenity) => {
                                  let icon = null;
                                  if (amenity === "WiFi") icon = <Wifi className="h-3 w-3" />;
                                  if (amenity === "Coffee Maker") icon = <Coffee className="h-3 w-3" />;
                                  if (amenity === "TV") icon = <Tv className="h-3 w-3" />;
                                  
                                  return (
                                    <Badge key={amenity} variant="secondary" className="text-xs">
                                      {icon}
                                      <span className="ml-1">{amenity}</span>
                                    </Badge>
                                  );
                                })}
                                {room.amenities.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{room.amenities.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>

                            <CardFooter className="flex items-center justify-between pt-4 border-t">
                              <div>
                                <p className="text-2xl font-bold text-foreground flex items-center gap-3">
                                  {formatLocalPrice(room.price)}
                                </p>
                                <p className="text-xs text-muted-foreground">per night</p>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                  Book Now
                                </Button>
                              </motion.div>
                            </CardFooter>
                          </RippleCard>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                  })}
                </div>

                {/* Floating Apply Filters button */}
                <motion.div 
                  className="fixed right-6 bottom-6 z-50"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="flex items-center gap-3 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                    onClick={applyStagedFilters}
                  >
                    <span>Apply Filters</span>
                    <motion.span 
                      className="inline-flex items-center justify-center bg-background text-foreground rounded-full w-6 h-6 text-xs"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {activeFiltersCount()}
                    </motion.span>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Rooms;

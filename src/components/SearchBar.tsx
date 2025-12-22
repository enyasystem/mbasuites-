import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import GuestSelector from "@/components/GuestSelector";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "@/context/LocationContext";
import { Skeleton } from "@/components/ui/skeleton";

const SearchBar = () => {
  const navigate = useNavigate();
  const { locationId, setLocationId, locations, isLoading } = useLocation();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guests, setGuests] = useState({ adults: 1, children: 0, rooms: 1 });

  const checkInRef = useRef<HTMLDivElement | null>(null);
  const checkOutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (checkInOpen) checkInRef.current?.focus();
  }, [checkInOpen]);

  useEffect(() => {
    if (checkOutOpen) checkOutRef.current?.focus();
  }, [checkOutOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (locationId) params.set("location", locationId);
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    if (guests.adults + guests.children > 0) {
      params.set("guests", String(guests.adults + guests.children));
    }
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
<Card className="container mx-auto px-4 -mt-12 lg:-mt-10 relative z-50 shadow-2xl transition-shadow duration-300 rounded-3xl bg-white/90 backdrop-blur-sm">

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-end">
          {/* Location */}
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={locationId || ""} onValueChange={setLocationId}>
                <SelectTrigger className="w-full transition-all hover:border-accent h-12 rounded-[35px]" aria-label="Select location">
                  <SelectValue placeholder="Enter location" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.country} - {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </motion.div>

          {/* Check-in date */}
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Check-in
            </label>
            <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"                  aria-label="Select check-in date"                  className={cn(
                    "w-full justify-start text-left font-normal transition-all hover:border-accent h-12 rounded-[35px]",
                    !checkIn && "text-muted-foreground"
                  )} 
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div ref={checkInRef} tabIndex={-1}>
                  <CalendarComponent
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date);
                      // close check-in popover then open check-out so user can pick checkout next
                      setTimeout(() => {
                        setCheckInOpen(false);
                        setCheckOutOpen(true);
                      }, 150);
                    }}
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Check-out date */}
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Check-out
            </label>
            <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"                  aria-label="Select check-out date"                  className={cn(
                    "w-full justify-start text-left font-normal transition-all hover:border-accent h-12 rounded-[35px]",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div ref={checkOutRef} tabIndex={-1}>
                  <CalendarComponent
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => {
                      setCheckOut(date);
                      // close checkout after selection
                      setTimeout(() => setCheckOutOpen(false), 100);
                    }}
                    disabled={(date) => date < (checkIn || new Date())}
                    className="pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Guests */}
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              Guests and rooms
            </label>
            <GuestSelector
              defaultAdults={guests.adults}
              defaultChildren={guests.children}
              defaultRooms={guests.rooms}
              onChange={(g) => setGuests(g)}
            />
          </motion.div>

          {/* Search Button */}
          <div className="flex items-end">
            <motion.div 
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleSearch}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg h-12 rounded-[35px] text-lg flex items-center justify-center gap-2"
                aria-label="Search available apartments"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Card>
    </motion.div>
  );
};

export default SearchBar;

import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";
import GuestSelector from "@/components/GuestSelector";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SearchBar = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  const handleSearch = () => {
    navigate("/rooms");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="container mx-auto px-4 -mt-16 relative z-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Location */}
          {/* <div className="space-y-2">
           
          </div> */}

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all hover:border-accent",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all hover:border-accent",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  initialFocus
                  className="pointer-events-auto"
                />
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
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent h-10"
              >
                <Search className="h-4 w-4 mr-2" />
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

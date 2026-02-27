import { useMemo } from "react";
import { LocationData } from "@/types/location";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCountries,
  getCitiesByCountry,
  getLocationsByCityAndCountry,
  formatLocationName,
  filterActiveBranchLocations,
} from "@/lib/locationHierarchy";
import { MapPin } from "lucide-react";

interface HierarchicalLocationSelectorProps {
  locations: LocationData[];
  selectedLocationId: string | null;
  onLocationChange: (locationId: string) => void;
  showIcon?: boolean;
  placeholder?: string;
  width?: string;
}

export function HierarchicalLocationSelector({
  locations,
  selectedLocationId,
  onLocationChange,
  showIcon = true,
  placeholder = "Select location",
  width = "w-[280px]",
}: HierarchicalLocationSelectorProps) {
  // Filter out legacy locations to avoid duplicate branches
  const filteredLocations = useMemo(() => filterActiveBranchLocations(locations), [locations]);
  
  const countries = useMemo(() => getCountries(filteredLocations), [filteredLocations]);

  const handleLocationChange = (locationId: string) => {
    onLocationChange(locationId);
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && <MapPin className="h-5 w-5 text-muted-foreground" />}
      
      <Select
        value={selectedLocationId || ""}
        onValueChange={handleLocationChange}
      >
        <SelectTrigger className={`${width}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <SelectItem value="all">All Locations</SelectItem>
          
          {countries.map((country) => {
            const cities = getCitiesByCountry(filteredLocations, country);
            return (
              <div key={`country-${country}`}>
                {/* Country header */}
                <div className="px-2 py-1.5 text-sm font-semibold text-foreground bg-muted">
                  {country}
                </div>
                
                {/* Cities and locations under this country */}
                {cities.map((city) => {
                  const locationsInCity = getLocationsByCityAndCountry(
                    filteredLocations,
                    country,
                    city
                  );
                  return (
                    <div key={`city-${country}-${city}`}>
                      {/* City subheader */}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        {city}
                      </div>
                      
                      {/* Locations in this city */}
                      {locationsInCity.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id}
                          className="pl-8 text-sm"
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

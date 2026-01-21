import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LocationData, LocationContextType } from "@/types/location";
import { LocationContext as InternalLocationContext } from "@/context/locationInternals";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        const locs = (data as LocationData[]) || [];
        setLocations(locs);
        // Prefer 'Lagos' as default if present; use functional set to avoid reading locationId in effect
        if (locs.length > 0) {
          const preferred = locs.find((l) => (l.city && l.city.toLowerCase() === 'lagos') || (l.name && l.name.toLowerCase().includes('lagos')));
          setLocationId((prev) => prev ?? (preferred ? preferred.id : locs[0].id));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const selectedLocation = locations.find(loc => loc.id === locationId) || null;

  return (
    <InternalLocationContext.Provider value={{ 
      locationId, 
      setLocationId, 
      locations, 
      isLoading,
      selectedLocation 
    }}>
      {children}
    </InternalLocationContext.Provider>
  );
};


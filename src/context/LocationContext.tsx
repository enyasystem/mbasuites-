import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LocationData {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  is_active: boolean;
}

interface LocationContextType {
  locationId: string | null;
  setLocationId: (id: string | null) => void;
  locations: LocationData[];
  isLoading: boolean;
  selectedLocation: LocationData | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

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
        
        setLocations(data || []);
        // Prefer 'Kenya - Nakuru' as default if present, otherwise set the first location
        if (data && data.length > 0 && !locationId) {
          const preferred = (data || []).find((l: any) => l.country === 'Kenya' && l.city === 'Nakuru');
          setLocationId(preferred ? preferred.id : data[0].id);
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
    <LocationContext.Provider value={{ 
      locationId, 
      setLocationId, 
      locations, 
      isLoading,
      selectedLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};

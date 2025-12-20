import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LocationData } from "@/context/LocationContext";

export const useLocations = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching locations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, isLoading, error };
};

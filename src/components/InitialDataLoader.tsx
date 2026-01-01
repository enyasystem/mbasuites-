import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/context/LocationContext';
import SiteLoader from './SiteLoader';

export default function InitialDataLoader({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { locationId, isLoading: locationsLoading } = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const prefetchAll = async () => {
      try {
        // Prefetch site settings immediately so components can read DB hero image before render
        const siteSettingsQueryFn = async () => {
          const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value');
          if (error) throw error;
          const settings: Record<string, string> = {};
          data?.forEach((s: { setting_key: string; setting_value: string | null }) => {
            if (s.setting_value != null) settings[s.setting_key] = s.setting_value;
          });
          return settings;
        };

        // Ensure site settings are fetched and stored in the query cache before rendering children
        await queryClient.prefetchQuery({ queryKey: ['siteSettings'], queryFn: siteSettingsQueryFn });

        // Kick off other prefetches but wait for locations when necessary
        const locationsPromise = supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name')
          .then(({ data }) => data || []);

        const paymentPromise = supabase
          .from('payment_settings')
          .select('setting_key, setting_value')
          .then(({ data }) => data || []);

        // Rooms depend on the selected location; wait for locations to finish loading before attempting
        const roomsPromise = (async () => {
          if (locationsLoading) return [];
          let q = supabase
            .from('rooms')
            .select('*, room_images(id, url, is_primary, ordering)')
            .eq('is_available', true)
            .order('price_per_night', { ascending: true });

          if (locationId) q = q.eq('location_id', locationId);

          const { data } = await q;
          return data || [];
        })();

        // Kick off other prefetches concurrently; they don't block initial render
        void Promise.all([locationsPromise, paymentPromise, roomsPromise]);
      } catch (e) {
        // ignore preload errors; app can still boot and individual hooks will handle retries
        console.warn('InitialDataLoader prefetch error', e);
      } finally {
        if (mounted) setReady(true);
      }
    };

    // Start prefetch immediately; rooms prefetch will no-op if locations still loading
    prefetchAll();

    return () => {
      mounted = false;
    };
  }, [locationId, locationsLoading, queryClient]);

  if (!ready) return <SiteLoader />;

  return <>{children}</>;
}

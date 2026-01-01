import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LocationProvider } from "./context/LocationContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { supabase } from './integrations/supabase/client';
import InitialDataLoader from './components/InitialDataLoader';

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found");
}

// Create a QueryClient with sane defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Persist cache to localStorage so data survives reloads
let _persister: any = null;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    _persister = createSyncStoragePersister({ storage: window.localStorage });
    persistQueryClient({ queryClient, persister: _persister, maxAge: 1000 * 60 * 60 * 24 });
  }
} catch (e) {
  // ignore persistence errors
}

// Setup Supabase realtime listeners to invalidate queries when relevant tables change
try {
  // rooms table changes should refresh room lists
  supabase
    .channel('public:rooms')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    })
    .subscribe();

  // bookings changes also affect availability
  supabase
    .channel('public:bookings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    })
    .subscribe();
} catch (e) {
  // ignore subscription errors in environments where realtime isn't available
}

// Wait for persisted cache to restore before rendering so UI can read cached values synchronously
(async () => {
  try {
    if (_persister && typeof _persister.restoreClient === 'function') {
      try {
        await _persister.restoreClient(queryClient);
      } catch (e) {
        // some persisters expose restore differently; attempt generic call
        try { await (_persister as any).restore?.(queryClient); } catch (e) {}
      }
    }

      // Remove any persisted siteSettings so the UI always shows the DB value (avoid stale hero image)
      try {
        queryClient.removeQueries({ queryKey: ['siteSettings'], exact: true });
      } catch (e) {
        /* ignore */
      }

    createRoot(rootEl).render(
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <InitialDataLoader>
            <App />
          </InitialDataLoader>
        </LocationProvider>
      </QueryClientProvider>
    );
  } catch (err) {
    console.error("App failed to start:", err);
    try {
      rootEl.innerHTML = `<div style="padding:24px; font-family: system-ui, -apple-system, Roboto, 'Segoe UI', Arial; color: #7f1d1d; background:#fff5f5; border:1px solid #fecaca; border-radius:8px; margin:24px;">Application failed to start: ${(err as Error).message}</div>`;
    } catch (e) {
      /* ignore */
    }
  }
})();

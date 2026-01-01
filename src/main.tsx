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
let _persister: ReturnType<typeof createSyncStoragePersister> | null = null;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    _persister = createSyncStoragePersister({ storage: window.localStorage });
    // Use a narrow unknown-based wrapper to avoid `any` while still
    // accommodating minor type mismatches between package versions.
    const _persist = persistQueryClient as unknown as (
      opts: { queryClient: QueryClient; persister: unknown; maxAge?: number }
    ) => void;
    _persist({ queryClient, persister: _persister, maxAge: 1000 * 60 * 60 * 24 });
  }
} catch (e) {
  console.warn('Query cache persistence init failed', e);
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
    if (_persister) {
      // Narrow the persister shape using `unknown` to satisfy eslint no-explicit-any
      const p = _persister as unknown as {
        restoreClient?: (qc: QueryClient) => Promise<void>;
        restore?: (qc: QueryClient) => Promise<void>;
      };
      try {
        if (typeof p.restoreClient === 'function') {
          await p.restoreClient(queryClient);
        } else if (typeof p.restore === 'function') {
          await p.restore(queryClient);
        }
      } catch (errRestore) {
        console.warn('Persister restore failed', errRestore);
      }
    }

    // Remove any persisted siteSettings so the UI always shows the DB value (avoid stale hero image)
    try {
      queryClient.removeQueries({ queryKey: ['siteSettings'], exact: true });
    } catch (e) {
      console.warn('Failed to remove persisted siteSettings', e);
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

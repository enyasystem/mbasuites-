import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LocationProvider } from "./context/LocationContext";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found");
}

try {
  createRoot(rootEl).render(
    <LocationProvider>
      <App />
    </LocationProvider>
  );
} catch (err) {
  console.error("App failed to start:", err);
  try {
    rootEl.innerHTML = `<div style="padding:24px; font-family: system-ui, -apple-system, Roboto, 'Segoe UI', Arial; color: #7f1d1d; background:#fff5f5; border:1px solid #fecaca; border-radius:8px; margin:24px;">Application failed to start: ${(err as Error).message}</div>`;
  } catch (e) {
    /* ignore */
  }
}

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "@/lib/audit";

/**
 * Logs a `page_view` event whenever the route changes.
 * Mount once at the root of the app (inside <BrowserRouter>).
 */
export function usePageViewTracker() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    void logEvent({
      event_name: "page_view",
      category: "navigation",
      metadata: { path: location.pathname, search: location.search },
    });
  }, [location.pathname, location.search]);
}

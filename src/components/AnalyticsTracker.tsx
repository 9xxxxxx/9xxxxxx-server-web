"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { UAParser } from "ua-parser-js";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Debounce or immediate? Immediate is usually fine for simple page views.
    // We want to track when the path changes.
    
    // Parse User Agent
    const parser = new UAParser();
    const result = parser.getResult();

    const trackView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            browser: result.browser.name,
            os: result.os.name,
            device: result.device.type || "desktop", // ua-parser returns undefined for desktop usually, or 'mobile'/'tablet'
          }),
        });
      } catch (e) {
        console.error("Failed to track analytics:", e);
      }
    };

    trackView();
  }, [pathname, searchParams]); // Track on path or query param change

  return null;
}

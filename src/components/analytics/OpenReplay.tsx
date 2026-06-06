"use client";

import { useEffect } from "react";

export function OpenReplay() {
  useEffect(() => {
    import("@openreplay/tracker").then(async ({ default: Tracker }) => {
      const tracker = new Tracker({
        projectKey: "WfC0OafCQ2vm2ifv7YSo",
        ingestPoint: "https://api.openreplay.com/ingest",
      });
      await tracker.start();

      // Identify logged-in seller if there is one
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { seller } = await res.json();
          if (seller?.email) {
            tracker.identify(seller.email);
            tracker.setMetadata("name", `${seller.firstName} ${seller.lastName}`);
            tracker.setMetadata("id", String(seller.id));
          }
        }
      } catch {
        // not logged in or network issue — session stays anonymous
      }
    });
  }, []);

  return null;
}

import { envClient } from "@repo/env/client";
import { useEffect } from "react";

export function PostHogInit() {
  useEffect(() => {
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(envClient.VITE_POSTHOG_KEY, {
        api_host: envClient.VITE_POSTHOG_HOST,
        ui_host: "https://us.posthog.com",
        defaults: "2025-05-24",
        capture_exceptions: true,
      });
    });
  }, []);

  return null;
}

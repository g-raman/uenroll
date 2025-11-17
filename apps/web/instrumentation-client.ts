import posthog from "posthog-js";
import { envClient } from "@repo/env";

posthog.init(envClient.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: envClient.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true,
});

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

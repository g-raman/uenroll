"use client";

import App from "@/layouts/App/App";
import NewCalendar from "@/components/NewCalendar/NewCalendar";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchResultsProvider } from "@/contexts/SearchResultsContext";
import SearchResults from "@/components/SearchResults/SearchResults";
import { Suspense } from "react";

export default function Page() {
  const queryClient = new QueryClient();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <SearchResultsProvider>
          <App>
            <Main>
              <NewCalendar />
            </Main>

            <Sidebar>
              <SearchBar />
              <SearchResults />
            </Sidebar>
          </App>
        </SearchResultsProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

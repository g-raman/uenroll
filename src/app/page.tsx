"use client";

import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchResultsProvider } from "@/contexts/SearchResultsContext";
import SearchResults from "@/components/SearchResults/SearchResults";
import { Suspense } from "react";
import { CopyLinkButton } from "@/components/CopyLinkButton/CopyLinkButton";
import { DeleteSearchResultsButton } from "@/components/DeleteSearchResultsButton/DeleteSearchResultsButton";
import Calendar from "@/components/Calendar/Calendar";
import DownloadCalendarButton from "@/components/DownloadCalendarButton/DownloadCalendarButton";

export default function Page() {
  const queryClient = new QueryClient();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <SearchResultsProvider>
          <App>
            <Main>
              <Calendar />
            </Main>

            <Sidebar>
              <SearchBar />
              <div className="mb-4 flex gap-2">
                <DeleteSearchResultsButton />
                <CopyLinkButton />
                <DownloadCalendarButton />
              </div>
              <SearchResults />
            </Sidebar>
          </App>
        </SearchResultsProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

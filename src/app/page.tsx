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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { CopyLinkButton } from "@/components/CopyLinkButton/CopyLinkButton";
import { DeleteSearchResultsButton } from "@/components/DeleteSearchResultsButton/DeleteSearchResultsButton";

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
              <div className="mb-4 flex gap-4">
                <DeleteSearchResultsButton />
                <CopyLinkButton />
              </div>
              <SearchResults />
            </Sidebar>
          </App>
        </SearchResultsProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

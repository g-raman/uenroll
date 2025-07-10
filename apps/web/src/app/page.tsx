"use client";

import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import SearchResults from "@/components/SearchResults/SearchResults";
import { CopyLinkButton } from "@/components/Buttons/CopyLinkButton/CopyLinkButton";
import { DeleteSearchResultsButton } from "@/components/Buttons/DeleteSearchResultsButton/DeleteSearchResultsButton";
import Calendar from "@/components/Calendar/Calendar";
import DownloadCalendarButton from "@/components/Buttons/DownloadCalendarButton/DownloadCalendarButton";

export default function Page() {
  return (
    <App>
      <Sidebar>
        <SearchBar />
        <div className="mb-4 flex gap-2">
          <DeleteSearchResultsButton />
          <CopyLinkButton />
          <DownloadCalendarButton />
        </div>
        <SearchResults />
      </Sidebar>

      <Main>
        <Calendar />
      </Main>
    </App>
  );
}

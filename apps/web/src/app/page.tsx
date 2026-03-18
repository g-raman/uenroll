"use client";

import App from "@/layouts/App/App";
import AnnouncementDialog from "@/components/AnnouncementDialog/AnnouncementDialog";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import SearchResults from "@/components/SearchResults/SearchResults";
import { CalendarWrapper } from "@/components/EventCalendar/CalendarWrapper";

export default function Page() {
  return (
    <App>
      <AnnouncementDialog />

      <Sidebar>
        <SearchBar />
        <SearchResults />
      </Sidebar>

      <Main>
        <CalendarWrapper />
      </Main>
    </App>
  );
}

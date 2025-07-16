"use client";

import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import SearchResults from "@/components/SearchResults/SearchResults";
import Calendar from "@/components/Calendar/Calendar";

export default function Page() {
  return (
    <App>
      <Sidebar>
        <SearchBar />
        <SearchResults />
      </Sidebar>

      <Main>
        <Calendar />
      </Main>
    </App>
  );
}

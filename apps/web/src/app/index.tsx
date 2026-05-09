import { CalendarWrapper } from "@/components/EventCalendar/CalendarWrapper";
import SearchBar from "@/components/SearchBar/SearchBar";
import SearchResults from "@/components/SearchResults/SearchResults";
import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return (
    <App>
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

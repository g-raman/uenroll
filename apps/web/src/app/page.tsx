"use client";

import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import SearchResults from "@/components/SearchResults/SearchResults";
import { CalendarWrapper } from "@/components/Calendar/CalendarWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/resizable";
import { useScreenSize } from "@/hooks/useScreenSize";

export default function Page() {
  const { width } = useScreenSize();

  if (!width) {
    return (
      <App>
        <div className="flex h-full w-full items-center justify-center">
          Loading...
        </div>
      </App>
    );
  }
  const isMobile = width < 768;

  return (
    <App>
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ResizablePanel defaultSize={isMobile ? 50 : 25}>
          <Sidebar>
            <SearchBar />
            <SearchResults />
          </Sidebar>
        </ResizablePanel>

        <ResizableHandle className="!bg-transparent" withHandle />
        <ResizablePanel defaultSize={isMobile ? 50 : 75}>
          <Main>
            <CalendarWrapper />
          </Main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </App>
  );
}

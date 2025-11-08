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
  if (!width) return;

  return (
    <App>
      <ResizablePanelGroup direction={width >= 768 ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={width >= 768 ? 25 : 50}>
          <Sidebar>
            <SearchBar />
            <SearchResults />
          </Sidebar>
        </ResizablePanel>

        <ResizableHandle className="!bg-transparent" withHandle />
        <ResizablePanel defaultSize={width >= 768 ? 75 : 50}>
          <Main>
            <CalendarWrapper />
          </Main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </App>
  );
}

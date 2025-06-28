"use client";

import App from "@/layouts/App/App";
import Main from "@/layouts/Main/Main";
import SearchBar from "@/components/SearchBar/SearchBar";
import Sidebar from "@/layouts/Sidebar/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchResults from "@/components/SearchResults/SearchResults";
import { useEffect, useRef, useState } from "react";
import { CopyLinkButton } from "@/components/Buttons/CopyLinkButton/CopyLinkButton";
import { DeleteSearchResultsButton } from "@/components/Buttons/DeleteSearchResultsButton/DeleteSearchResultsButton";
import Calendar from "@/components/Calendar/Calendar";
import DownloadCalendarButton from "@/components/Buttons/DownloadCalendarButton/DownloadCalendarButton";
import {
  useScheduleActions,
  useSelectedSessionsURL,
  useSelectedTerm,
} from "@/stores/scheduleStore";
import { useQueryState } from "nuqs";
import { fetchCourse, fetchTerms } from "@/utils/fetchData";
import { Term } from "@/types/Types";
import LZString from "lz-string";

export default function Page() {
  const queryClient = useState(new QueryClient())[0];

  const selectedSessionsURL = useSelectedSessionsURL();
  const selectedTerm = useSelectedTerm();
  const { setInitialData } = useScheduleActions();

  const [selected, setSelected] = useQueryState("data", {
    defaultValue: null,
    history: "replace",
    parse: value => JSON.parse(LZString.decompressFromBase64(value)),
    serialize: value => LZString.compressToBase64(JSON.stringify(value)),
  });
  const [term, setTerm] = useQueryState("term", {
    history: "replace",
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchInitialData = async () => {
      const terms = await fetchTerms();
      const initialTerm = terms.find(termData => termData.value === term);
      const selectedTerm = initialTerm ? initialTerm : (terms[0] as Term);

      if (!initialTerm || !selected) {
        setInitialData({
          courseSearchResults: [],
          selectedSessionsURL: null,
          selectedTerm,
          availableTerms: terms,
        });
        return;
      }

      const toFetch = Object.keys(selected).map(courseCode =>
        fetchCourse(courseCode, selectedTerm),
      );
      const results = await Promise.allSettled(toFetch);

      if (results.some(result => result.status === "rejected")) {
        setInitialData({
          courseSearchResults: [],
          selectedSessionsURL: null,
          selectedTerm: selectedTerm,
          availableTerms: terms,
        });
        return;
      }

      const courses = results
        .filter(result => result.status !== "rejected")
        .map(result => result.value);

      setInitialData({
        courseSearchResults: courses,
        selectedSessionsURL: selected,
        selectedTerm,
        availableTerms: terms,
      });
    };
    fetchInitialData();
  }, [selected, setInitialData, term]);

  // Sync reducer state back to URL whenever data changes
  useEffect(() => {
    setSelected(selectedSessionsURL);
  }, [selectedSessionsURL, setSelected]);

  useEffect(() => {
    setTerm(selectedTerm ? selectedTerm.value : null);
  }, [selectedTerm, setTerm]);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faCheck, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export const CopyLinkButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { state } = useSearchResults();

  return (
    <button
      className="hover:bg-slate-100 active:bg-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:text-gray-300 cursor-pointer flex gap-1 justify-center items-center w-full border-slate-400 border py-3 px-2 h-full rounded-xs text-black"
      disabled={state.selectedSessions.length === 0}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
          console.log("Failed to copy url: ", error);
        }
      }}
    >
      <FontAwesomeIcon className="size-4" icon={isCopied ? faCheck : faLink} />
      <p>{isCopied ? "Copied" : "Copy Link"}</p>
    </button>
  );
};

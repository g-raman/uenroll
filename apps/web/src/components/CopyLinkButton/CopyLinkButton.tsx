import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faCheck, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import React, { useState } from "react";

export const CopyLinkButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { state } = useSearchResults();

  return (
    <Button
      className="flex-1"
      variant="outline"
      size="lg"
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
      <p className="text-xs">{isCopied ? "Copied" : "Copy Link"}</p>
    </Button>
  );
};

import { faCheck, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export const CopyLinkButton = (props: {}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <button
      className="flex gap-2 justify-center items-center p-2 w-full h-full transition-all hover:opacity-90 active:opacity-75 bg-[#8f001b] text-white rounded-sm"
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
      <p>{isCopied ? "Copied" : "Copy Link"}</p>
      <FontAwesomeIcon className="size-4" icon={isCopied ? faCheck : faLink} />
    </button>
  );
};

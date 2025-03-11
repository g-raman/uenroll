import { faCheck, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export const CopyLinkButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <button
      className="cursor-pointer flex gap-1 justify-center items-center w-full border-slate-400 border py-3 px-2 h-full rounded-xs text-black"
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

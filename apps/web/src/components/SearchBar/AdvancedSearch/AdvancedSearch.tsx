"use client";

import { Button } from "@repo/ui/components/button";
import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { AdvancedSearchDialog } from "./AdvancedSearchDialog";

type AdvancedSearchProps = {
  term: string;
  selectedCodes: Set<string>;
  isAdding: boolean;
  isAtLimit: boolean;
  onAddCourse: (courseCode: string) => void;
  onOpen?: () => void;
};

export function AdvancedSearch({
  term,
  selectedCodes,
  isAdding,
  isAtLimit,
  onAddCourse,
  onOpen,
}: AdvancedSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedSearchDialog
        open={open}
        onOpenChange={setOpen}
        term={term}
        selectedCodes={selectedCodes}
        isAdding={isAdding}
        isAtLimit={isAtLimit}
        onAddCourse={onAddCourse}
      />

      <Button
        type="button"
        className="grow"
        variant="outline"
        size="lg"
        disabled={isAdding}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        <SlidersHorizontalIcon className="size-4" />
        <p className="text-xs">Advanced search</p>
      </Button>
    </>
  );
}

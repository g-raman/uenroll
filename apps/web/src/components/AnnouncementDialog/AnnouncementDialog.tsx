"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

export default function AnnouncementDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-lg border border-amber-200/70 bg-amber-50 text-amber-950 sm:max-w-xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Spring/Summer 2026 update</DialogTitle>
          <DialogDescription className="text-amber-900/90">
            We&apos;re currently seeing issues while scraping course data for
            the Spring/Summer 2026 term. We&apos;re working on a fix, and
            updated information will be available as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            className="bg-amber-900 text-amber-50 hover:bg-amber-950"
            onClick={() => setOpen(false)}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

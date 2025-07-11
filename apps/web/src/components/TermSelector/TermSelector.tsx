import { useAvailableTermsQuery } from "@/hooks/useAvailableTermsQuery";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { useColoursActions } from "@/stores/colourStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";

export default function TermSelector() {
  const { resetColours } = useColoursActions();
  const [selectedTerm, setSelectedTerm] = useTermParam();
  const [, setData] = useDataParam();
  const { data: availableTerms } = useAvailableTermsQuery();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingTerm, setPendingTerm] = useState<string | null>(null);

  const handleChangeTerm = useCallback((term: string) => {
    setPendingTerm(term);
    setIsAlertOpen(true);
  }, []);

  const handleConfirmChangeTerm = useCallback(() => {
    if (pendingTerm) {
      setSelectedTerm(pendingTerm);
      setData(null);
      resetColours();
    }
    setIsAlertOpen(false);
    setPendingTerm(null);
  }, [pendingTerm, resetColours, setData, setSelectedTerm]);

  const handleCancelChangeTerm = useCallback(() => {
    setIsAlertOpen(false);
    setPendingTerm(null);
  }, []);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (
      hasInitialized.current ||
      !availableTerms ||
      availableTerms.length === 0
    ) {
      return;
    }
    hasInitialized.current = true;

    const termInUrl = selectedTerm
      ? availableTerms.find(
          availableTerm => availableTerm.value === selectedTerm,
        )
      : null;

    if (!termInUrl) {
      setSelectedTerm(availableTerms[0]?.value as string);
      setData(null);
    }
  }, [availableTerms, selectedTerm, setSelectedTerm, setData]);

  return (
    <>
      {!selectedTerm || !availableTerms || availableTerms.length === 0 ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all your search results and schedule.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelChangeTerm}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmChangeTerm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Select value={selectedTerm} onValueChange={handleChangeTerm}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Term" />
            </SelectTrigger>

            <SelectContent>
              {availableTerms.map(availableTerm => (
                <SelectItem
                  key={availableTerm.value}
                  value={availableTerm.value}
                >
                  {availableTerm.term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );
}

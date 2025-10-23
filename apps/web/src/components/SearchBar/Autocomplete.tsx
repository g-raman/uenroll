import { trpc } from "@/app/_trpc/client";
import { useTermParam } from "@/hooks/useTermParam";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Autocomplete() {
  const [selectedTerm] = useTermParam();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(handler);
  }, [query]);

  const { data: dataAllCourses } = useQuery(
    trpc.getAvailableCoursesByTerm.queryOptions(
      { term: selectedTerm },
      { staleTime: Infinity },
    ),
  );

  const fuse = useMemo(
    () =>
      dataAllCourses
        ? new Fuse(dataAllCourses, {
            isCaseSensitive: false,
            keys: ["courseCode", "courseTitle"],
          })
        : new Fuse([]),
    [dataAllCourses],
  );

  const results = useCallback(() => {
    return fuse.search(debouncedQuery);
  }, [debouncedQuery, fuse])();

  if (!dataAllCourses) return <p>loading...</p>;

  return (
    <Popover>
      <Command>
        <PopoverTrigger asChild>
          <CommandInput
            value={query}
            onValueChange={newString => setQuery(newString)}
            placeholder="Type a course code or course name"
          />
        </PopoverTrigger>

        <PopoverContent
          onOpenAutoFocus={e => e.preventDefault()}
          className="p-1"
        >
          <CommandList>
            <CommandEmpty className="px-2 py-4 text-xs">
              {debouncedQuery.length > 0 &&
                results.length === 0 &&
                "No results found"}

              {debouncedQuery.length === 0 &&
                results.length === 0 &&
                "Type in a course code or course name"}
            </CommandEmpty>

            {results.length > 0 && (
              <CommandGroup heading="By course code">
                {results.slice(0, 5).map(course => (
                  <CommandItem key={`autocomplete-${course.item.courseCode}`}>
                    {course.item.courseCode}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="By course name">
                  {results.map(result => (
                    <CommandItem
                      key={`autocomplete-${result.item.courseCode}-${result.item.courseTitle}`}
                    >
                      {result.item.courseTitle}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}

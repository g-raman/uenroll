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

export default function Autocomplete() {
  const [selectedTerm] = useTermParam();

  const { data: dataAllCourses } = useQuery(
    trpc.getAvailableCoursesByTerm.queryOptions(
      { term: selectedTerm },
      { staleTime: Infinity },
    ),
  );

  return (
    <Popover>
      <Command>
        <PopoverTrigger asChild>
          <CommandInput placeholder="Type a course code or course name" />
        </PopoverTrigger>

        <PopoverContent className="w-78 p-1">
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>

            <CommandGroup
              className="h-42 overflow-scroll"
              heading="By course code"
            >
              {dataAllCourses &&
                dataAllCourses.map(course => (
                  <CommandItem key={`autocomplete-${course.courseCode}`}>
                    {course.courseCode}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />

            <CommandGroup
              className="h-42 overflow-scroll"
              heading="By course name"
            >
              {dataAllCourses &&
                dataAllCourses.map(course => (
                  <CommandItem
                    key={`autocomplete-${course.courseCode}-${course.courseTitle}`}
                  >
                    {course.courseTitle}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}

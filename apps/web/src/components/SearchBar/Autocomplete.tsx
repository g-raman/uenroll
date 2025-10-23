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

export default function Autocomplete() {
  return (
    <Popover>
      <Command>
        <PopoverTrigger asChild>
          <CommandInput placeholder="Type a course code or course name" />
        </PopoverTrigger>

        <PopoverContent className="w-78 p-1">
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>

            <CommandGroup heading="By course code">
              <CommandItem>CSI 3120</CommandItem>
            </CommandGroup>
            <CommandSeparator />

            <CommandGroup heading="By course name">
              <CommandItem>Intro to Programming Languages</CommandItem>
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}

import TermSelector from "../TermSelector/TermSelector";
import Autocomplete from "./Autocomplete";
import { DeleteSearchResultsButton } from "../Buttons/DeleteSearchResultsButton/DeleteSearchResultsButton";
import { ThemeSwitchingButton } from "../Buttons/ThemeSwitchingButton/ThemeSwitchingButton";

export default function SearchBar() {
  return (
    <div className="bg-background sticky top-0 z-10 flex flex-col gap-2 py-4">
      <TermSelector />
      <Autocomplete />

      <div className="flex gap-2">
        <DeleteSearchResultsButton />
        <ThemeSwitchingButton />
      </div>
    </div>
  );
}

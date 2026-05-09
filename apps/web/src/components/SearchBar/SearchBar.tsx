import TermSelector from "../TermSelector/TermSelector";
import Autocomplete from "./Autocomplete";

export default function SearchBar() {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 bg-background py-4">
      <TermSelector />
      <Autocomplete />
    </div>
  );
}

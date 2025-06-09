import { ThemeSwitchingButton } from "@/components/Buttons/ThemeSwitchingButton/ThemeSwitchingButton";
import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header() {
  return (
    <div className="bg-background mb-2 flex items-center rounded-b-md p-4 md:mb-4 md:rounded-md">
      <div className="flex w-full items-baseline justify-start text-4xl">
        <FontAwesomeIcon
          className="text-primary size-12"
          icon={faBuildingColumns}
        />
        <p>uEnroll</p>
      </div>
      <ThemeSwitchingButton />
    </div>
  );
}

import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header() {
  return (
    <div className="flex gap-4 font-medium text-5xl items-baseline">
      <FontAwesomeIcon
        className="size-12"
        color="#8f001b"
        icon={faBuildingColumns}
      />
      <p>uEnroll</p>
    </div>
  );
}

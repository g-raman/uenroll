import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header() {
  return (
    <div className="flex items-baseline gap-4 text-5xl font-medium">
      <FontAwesomeIcon
        className="text-primary size-12"
        icon={faBuildingColumns}
      />
      <p>uEnroll</p>
    </div>
  );
}

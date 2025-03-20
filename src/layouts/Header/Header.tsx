import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function Header() {
  return (
    <div className="flex items-baseline gap-4 text-5xl font-medium">
      <FontAwesomeIcon className="size-12" color="#8f001b" icon={faBuildingColumns} />
      <p>uEnroll</p>
    </div>
  )
}

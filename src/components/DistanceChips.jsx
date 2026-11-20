import { useMasterData } from "../masterData"
import { eventCategories } from "../distanceCategories"

// Afstandscategorieën van een wedstrijd als kleine labels; niets als er geen zijn
export default function DistanceChips({ event, className = "" }) {
  const { label } = useMasterData()
  const codes = eventCategories(event)
  if (codes.length === 0) return null

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {codes.map((code) => (
        <li key={code} className="rounded-control bg-link-soft px-2 py-0.5 text-xs font-bold text-link">
          {label("distanceCategories", code)}
        </li>
      ))}
    </ul>
  )
}

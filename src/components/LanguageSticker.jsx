import { useT } from "../i18n/LanguageProvider"
import { useMasterData } from "../masterData"

// Eén taal als label (zelfde stijl als afstandscategorieën en buddydoelen).
// Met onRemove verschijnt er een ✕ om de taal te verwijderen.
export function LanguageTag({ code, onRemove }) {
  const { t } = useT()
  const { label } = useMasterData()
  const name = label("languages", code)

  return (
    <span className="inline-flex items-center gap-1 rounded-control bg-link-soft px-2.5 py-1 text-xs font-bold text-link">
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(code)}
          aria-label={t("profile.languageRemove", { name })}
          className="-mr-1 grid h-5 w-5 place-items-center rounded-control transition hover:bg-link hover:text-on-dark"
        >
          ✕
        </button>
      )}
    </span>
  )
}

// Lijst van talen als labels, in de volgorde van de stamtabel; niets als er geen zijn
export default function LanguageStickers({ codes, onRemove, className = "" }) {
  const { sortCodes } = useMasterData()
  if (!codes || codes.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {sortCodes("languages", codes).map((code) => (
        <li key={code}>
          <LanguageTag code={code} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

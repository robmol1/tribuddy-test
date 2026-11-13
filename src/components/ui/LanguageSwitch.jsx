import { useT } from "../../i18n/LanguageProvider"

// Toont de taal waar je naartoe wisselt, zoals in preview v3
export default function LanguageSwitch({ className = "" }) {
  const { lang, setLang, t } = useT()
  const next = lang === "nl" ? "en" : "nl"

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      title={t("common.switchLanguage")}
      aria-label={t("common.switchLanguage")}
      className={
        "rounded-control border border-line bg-page px-2 py-1.5 text-xs font-bold " +
        `text-muted transition hover:text-ink ${className}`
      }
    >
      {next.toUpperCase()}
    </button>
  )
}

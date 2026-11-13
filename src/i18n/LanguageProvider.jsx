import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import nl from "./nl"
import en from "./en"

const DICTIONARIES = { nl, en }
export const LANGUAGES = ["nl", "en"]
const LOCALES = { nl: "nl-NL", en: "en-GB" }
const STORAGE_KEY = "tribuddy.lang"

// Bewaarde keuze, anders browsertaal: Engels → en, al het andere → nl
function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch {
    // localStorage niet beschikbaar (bijv. privévenster) → browsertaal gebruiken
  }
  const browser = (navigator.languages?.[0] || navigator.language || "").toLowerCase()
  return browser.startsWith("en") ? "en" : "nl"
}

const lookup = (dict, key) => key.split(".").reduce((node, part) => node?.[part], dict)

const interpolate = (text, vars) =>
  vars
    ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
    : text

// "2026-06-14" als lokale datum lezen, niet als UTC (voorkomt een dag verschuiving)
function toDate(value) {
  if (value instanceof Date) return value
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // keuze geldt dan alleen voor deze sessie
    }
  }, [])

  const t = useCallback(
    (key, vars) => {
      let text = lookup(DICTIONARIES[lang], key)
      if (typeof text !== "string") {
        if (import.meta.env.DEV) console.warn(`[I18N] ontbrekende tekst "${key}" (${lang})`)
        text = lookup(DICTIONARIES.nl, key)
        if (typeof text !== "string") return key
      }
      return interpolate(text, vars)
    },
    [lang]
  )

  // options: zie Intl.DateTimeFormat, bijv. { dateStyle: "long" } of { dateStyle: "short", timeStyle: "short" }
  const formatDate = useCallback(
    (value, options = { dateStyle: "medium" }) => {
      if (!value) return ""
      const date = toDate(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat(LOCALES[lang], options).format(date)
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t, formatDate }), [lang, setLang, t, formatDate])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Gebruik: const { t, lang, setLang, formatDate } = useT()
export function useT() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useT moet binnen <LanguageProvider> gebruikt worden")
  return context
}

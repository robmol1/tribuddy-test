import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { supabase } from "./supabaseClient"
import { useT } from "./i18n/LanguageProvider"

// Stamtabellen met namen in de database (label_nl / label_en). Zie From_Claude/admin-masterdata.sql.
// Eén keer laden na inloggen; overal te gebruiken met useMasterData().
export const MASTER_TABLES = {
  languages: "languages",
  distanceGroups: "distance_groups",
  distanceCategories: "distance_categories",
  reportReasons: "report_reasons",
  levels: "experience_levels",
  genders: "genders",
}

// Geslacht "niet opgegeven": wel te kiezen in je profiel, niet als filter of zichtbaar-voor
export const GENDER_UNSPECIFIED = "-"

const MasterDataContext = createContext(null)

export function MasterDataProvider({ children }) {
  const { lang } = useT()
  const [rows, setRows] = useState({}) // key → [rij, …]
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    const entries = await Promise.all(
      Object.entries(MASTER_TABLES).map(async ([key, table]) => {
        const { data, error } = await supabase.from(table).select("*")
        if (error) {
          console.error(`[MASTERDATA] load ${table} failed`, error)
          return [key, []]
        }
        return [key, data]
      })
    )
    setRows(Object.fromEntries(entries))
    setLoaded(true)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const value = useMemo(() => {
    const find = (key, code) => (rows[key] || []).find((r) => r.code === code)

    // Naam in de huidige taal, anders de andere taal, anders de code
    const label = (key, code) => {
      if (code === null || code === undefined || code === "") return ""
      const row = find(key, code)
      return row?.[`label_${lang}`] || row?.label_nl || row?.label_en || String(code)
    }

    const byOrderThenLabel = (key) => (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      label(key, a.code).localeCompare(label(key, b.code), lang)

    // Alle rijen (ook inactief), gesorteerd — voor het beheerscherm
    const all = (key) => [...(rows[key] || [])].sort(byOrderThenLabel(key))

    // Actieve rijen, gesorteerd op volgorde en daarna naam
    const active = (key) => all(key).filter((r) => r.is_active !== false)

    // Codes sorteren zoals de stamtabel (volgorde, dan naam)
    const sortCodes = (key, codes) =>
      [...codes].sort((a, b) => {
        const ra = find(key, a) || { code: a }
        const rb = find(key, b) || { code: b }
        return byOrderThenLabel(key)(ra, rb)
      })

    return { loaded, label, all, active, sortCodes, reload }
  }, [rows, loaded, lang, reload])

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>
}

// Gebruik: const { label, active, sortCodes } = useMasterData()
export function useMasterData() {
  const context = useContext(MasterDataContext)
  if (!context) throw new Error("useMasterData moet binnen <MasterDataProvider> gebruikt worden")
  return context
}

// Geslacht dat echt gekozen is (niet leeg en niet "niet opgegeven")
export function knownGender(gender) {
  return gender && gender !== GENDER_UNSPECIFIED ? gender : null
}

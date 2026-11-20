import { supabase } from "./supabaseClient"

// Talen per gebruiker (punt 3): koppeltabel user_languages. Zie From_Claude/languages.sql.
// De lijst met talen en hun namen komt uit de stamtabel languages, via useMasterData() (masterData.jsx).

// Talen van gebruikers → Map userId → [code, …]; null als het ophalen mislukt
export async function fetchUserLanguages(userIds) {
  const unique = Array.from(new Set(userIds.filter(Boolean)))
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from("user_languages")
    .select("user_id, language_code")
    .in("user_id", unique)

  if (error) {
    console.error("[LANG] load user languages failed", error)
    return null
  }

  const byUser = new Map()
  for (const row of data) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, [])
    byUser.get(row.user_id).push(row.language_code)
  }
  return byUser
}

// Eigen talen opslaan: verschil met wat er staat toevoegen/verwijderen. Geeft true bij succes.
export async function saveMyLanguages(userId, codes) {
  const current = (await fetchUserLanguages([userId]))?.get(userId) ?? []
  const wanted = new Set(codes)
  const toAdd = codes.filter((c) => !current.includes(c))
  const toRemove = current.filter((c) => !wanted.has(c))

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("user_languages")
      .delete()
      .eq("user_id", userId)
      .in("language_code", toRemove)
    if (error) {
      console.error("[LANG] remove languages failed", error)
      return false
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("user_languages")
      .insert(toAdd.map((code) => ({ user_id: userId, language_code: code })))
    if (error) {
      console.error("[LANG] add languages failed", error)
      return false
    }
  }

  return true
}

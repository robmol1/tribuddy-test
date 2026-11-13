import { supabase } from "./supabaseClient"

// Profielen van andere gebruikers komen uit de view public_profiles,
// niet rechtstreeks uit users (die is alleen leesbaar voor je eigen rij).
// Geeft een Map terug: id → profiel.
export async function fetchPublicProfiles(ids, fields) {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from("public_profiles")
    .select(`id,${fields}`)
    .in("id", unique)

  if (error) {
    console.error("Fout bij ophalen profielen:", error)
    return new Map()
  }

  return new Map(data.map((p) => [p.id, p]))
}

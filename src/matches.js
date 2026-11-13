import { supabase } from "./supabaseClient"

// Statussen van een buddy-match (zie From_Claude/matches-status.sql):
//   pending → accepted / rejected (ontvanger) of withdrawn (aanvrager)
//   accepted → ended (een van beiden)
// rejected en ended zijn definitief; na withdrawn mag een nieuw verzoek.

// Bij meerdere matches met dezelfde buddy wint de hoogste
const RANK = { accepted: 4, pending: 3, ended: 2, rejected: 1 }

export const buddyIdOf = (match, userId) =>
  match.user1_id === userId ? match.user2_id : match.user1_id

// Map buddyId → de geldende match. Ingetrokken verzoeken tellen niet mee.
export function matchesByBuddy(matches, userId) {
  const byBuddy = new Map()
  for (const m of matches || []) {
    if (!(m.status in RANK)) continue
    const buddyId = buddyIdOf(m, userId)
    const existing = byBuddy.get(buddyId)
    if (!existing || RANK[m.status] > RANK[existing.status]) {
      byBuddy.set(buddyId, m)
    }
  }
  return byBuddy
}

// Wijzigt de status; geeft true terug als het gelukt is
export async function setMatchStatus(matchId, status) {
  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId)

  if (error) {
    console.error(`Matchstatus ${status} mislukt:`, error)
    return false
  }
  return true
}

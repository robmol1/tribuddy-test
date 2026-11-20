import { supabase } from "./supabaseClient"

// Blokkeren en melden (punt 9). Zie From_Claude/privacy-safety.sql.
// Bij een fout (bijv. SQL nog niet gedraaid) geven de leesfuncties een lege uitkomst terug.

// Wie heb ik geblokkeerd? → Set van user-id's
export async function fetchMyBlocks(userId) {
  if (!userId) return new Set()
  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId)

  if (error) {
    console.error("[SAFETY] load blocks failed", error)
    return new Set()
  }
  return new Set(data.map((b) => b.blocked_id))
}

// Wie heeft mij geblokkeerd? → Set van user-id's
export async function fetchBlockingMe() {
  const { data, error } = await supabase.rpc("users_blocking_me")
  if (error) {
    console.error("[SAFETY] load blocking-me failed", error)
    return new Set()
  }
  // setof uuid komt terug als lijst met waarden
  return new Set((data || []).map((row) => (typeof row === "string" ? row : row.users_blocking_me)))
}

export async function blockUser(userId, otherUserId) {
  const { error } = await supabase
    .from("user_blocks")
    .insert({ blocker_id: userId, blocked_id: otherUserId })
  if (error) console.error("[SAFETY] block failed", error)
  return !error
}

export async function unblockUser(userId, otherUserId) {
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", otherUserId)
  if (error) console.error("[SAFETY] unblock failed", error)
  return !error
}

// Meldredenen en hun namen komen uit de stamtabel report_reasons via useMasterData() (masterData.jsx).

// chatMessageId leeg = melding van een profiel
export async function submitReport({ reporterId, reportedUserId, chatMessageId, reasonCode, comment }) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    chat_message_id: chatMessageId || null,
    reason_code: reasonCode,
    comment: comment?.trim() ? comment.trim() : null,
  })
  if (error) console.error("[SAFETY] report failed", error)
  return !error
}

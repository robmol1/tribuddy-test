import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { Button, EmptyState, ListCard, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { levelLabel } from "../i18n/labels"

export default function BuddyMatches({ eventId, session, joined }) {
  // Alle hooks staan bovenaan, vóór elke return (regel van React)
  const currentUserId = session?.user?.id
  const { t } = useT()

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    // Niet deelgenomen → niets laden
    if (!joined) return

    const load = async () => {
      console.log("[BUDDY] load start", {
        eventId,
        userId: currentUserId,
      })

      setLoading(true)

      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          users1:users!matches_user1_id_fkey(
            first_name,last_name,country_code,experience_level
          ),
          users2:users!matches_user2_id_fkey(
            first_name,last_name,country_code,experience_level
          )
        `)
        .eq("event_id", eventId)
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)

      if (error) {
        console.error("[BUDDY] error loading matches", error)
        setLoading(false)
        return
      }

      console.log("[BUDDY] matches loaded (raw)", {
        count: data?.length ?? 0,
      })

      // accepted wint altijd (per buddy)
      const byBuddy = new Map()
      for (const m of data || []) {
        const buddyId =
          m.user1_id === currentUserId ? m.user2_id : m.user1_id

        const existing = byBuddy.get(buddyId)
        if (!existing) {
          byBuddy.set(buddyId, m)
        } else {
          const rank = (s) =>
            s === "accepted" ? 2 : s === "pending" ? 1 : 0

          if (rank(m.status) > rank(existing.status)) {
            byBuddy.set(buddyId, m)
          }
        }
      }

      const deduped = Array.from(byBuddy.values())

      console.log("[BUDDY] deduped matches", {
        count: deduped.length,
      })

      // 🔎 Check wie nog actief deelnemer is aan dit event
      const userIdsToCheck = Array.from(
        new Set([
          currentUserId,
          ...deduped.map((m) =>
            m.user1_id === currentUserId ? m.user2_id : m.user1_id
          ),
        ])
      )

      const { data: ueData, error: ueError } = await supabase
        .from("user_events")
        .select("user_id")
        .eq("event_id", eventId)
        .in("user_id", userIdsToCheck)

      if (ueError) {
        console.error("[BUDDY] error loading user_events", ueError)
        setMatches([])
        setLoading(false)
        return
      }

      const activeUserIds = new Set(ueData.map((r) => r.user_id))

      const filtered = deduped.filter((m) => {
        const buddyId =
          m.user1_id === currentUserId ? m.user2_id : m.user1_id

        return (
          activeUserIds.has(currentUserId) &&
          activeUserIds.has(buddyId)
        )
      })

      console.log("[BUDDY] matches after filter", {
        before: deduped.length,
        after: filtered.length,
      })

      setMatches(filtered)
      setLoading(false)
    }

    load()
  }, [eventId, currentUserId, joined])

  const acceptBuddy = async (otherUserId) => {
    console.log("[BUDDY] accept clicked", {
      eventId,
      from: otherUserId,
      to: currentUserId,
    })

    setMessage(null)
    const { error } = await supabase
      .from("matches")
      .update({ status: "accepted" })
      .eq("event_id", eventId)
      .eq("user1_id", otherUserId)
      .eq("user2_id", currentUserId)

    if (error) {
      console.error("[BUDDY] accept failed", error)
      setMessage(t("buddies.acceptFailed"))
      return
    }

    console.log("[BUDDY] accept success", {
      eventId,
      buddyId: otherUserId,
    })

    setMatches((prev) =>
      prev.map((m) =>
        m.user1_id === otherUserId && m.user2_id === currentUserId
          ? { ...m, status: "accepted" }
          : m
      )
    )
  }

  if (!joined) return null
  if (loading) return <StatusText>{t("buddies.loading")}</StatusText>
  if (matches.length === 0) return <EmptyState title={t("buddies.empty")} />

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{t("buddies.title")}</h2>

      {message && <StatusText tone="danger">{message}</StatusText>}

      {matches.map((m) => {
        const isInitiator = m.user1_id === currentUserId
        const buddy = isInitiator ? m.users2 : m.users1

        return (
          <ListCard
            key={m.id}
            title={`${buddy.first_name} ${buddy.last_name}`}
            meta={t("buddies.meta", { level: levelLabel(t, buddy.experience_level), country: buddy.country_code })}
          >
            {m.status === "pending" && !isInitiator && (
              <Button size="sm" onClick={() => acceptBuddy(m.user1_id)}>
                {t("buddies.accept")}
              </Button>
            )}

            {m.status === "pending" && isInitiator && (
              <StatusText>{t("buddies.requestSent")}</StatusText>
            )}

            {m.status === "accepted" && (
              <StatusText tone="success">{t("buddies.accepted")}</StatusText>
            )}
          </ListCard>
        )
      })}
    </div>
  )
}

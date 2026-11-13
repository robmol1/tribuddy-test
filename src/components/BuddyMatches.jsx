import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { fetchPublicProfiles } from "../publicProfiles"
import { EmptyState, ListCard, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { levelLabel } from "../i18n/labels"
import { buddyIdOf, matchesByBuddy } from "../matches"
import MatchActions from "./MatchActions"

export default function BuddyMatches({ eventId, session, joined }) {
  // Alle hooks staan bovenaan, vóór elke return (regel van React)
  const currentUserId = session?.user?.id
  const { t } = useT()

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Niet deelgenomen → niets laden
    if (!joined) return

    const load = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, status")
        .eq("event_id", eventId)
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)

      if (error) {
        console.error("[BUDDY] error loading matches", error)
        setLoading(false)
        return
      }

      // Eén match per buddy (accepted wint); ingetrokken verzoeken vallen weg
      const deduped = Array.from(matchesByBuddy(data, currentUserId).values())

      // 🔎 Check wie nog actief deelnemer is aan dit event
      const userIdsToCheck = Array.from(
        new Set([currentUserId, ...deduped.map((m) => buddyIdOf(m, currentUserId))])
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

      const filtered = deduped.filter(
        (m) =>
          activeUserIds.has(currentUserId) &&
          activeUserIds.has(buddyIdOf(m, currentUserId))
      )

      const profiles = await fetchPublicProfiles(
        filtered.flatMap((m) => [m.user1_id, m.user2_id]),
        "first_name,last_name,country_code,experience_level"
      )

      setMatches(
        filtered.map((m) => ({
          ...m,
          users1: profiles.get(m.user1_id) || {},
          users2: profiles.get(m.user2_id) || {},
        }))
      )
      setLoading(false)
    }

    load()
  }, [eventId, currentUserId, joined])

  // Na intrekken verdwijnt de match uit de lijst; anders alleen de status bijwerken
  const updateMatch = (updated) =>
    setMatches((prev) =>
      updated.status === "withdrawn"
        ? prev.filter((m) => m.id !== updated.id)
        : prev.map((m) => (m.id === updated.id ? updated : m))
    )

  if (!joined) return null
  if (loading) return <StatusText>{t("buddies.loading")}</StatusText>
  if (matches.length === 0) return <EmptyState title={t("buddies.empty")} />

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{t("buddies.title")}</h2>

      {matches.map((m) => {
        const buddy = m.user1_id === currentUserId ? m.users2 : m.users1
        const name = `${buddy.first_name} ${buddy.last_name}`

        return (
          <ListCard
            key={m.id}
            title={name}
            meta={t("buddies.meta", { level: levelLabel(t, buddy.experience_level), country: buddy.country_code })}
          >
            <MatchActions
              match={m}
              currentUserId={currentUserId}
              buddyName={name}
              acceptedLabel={t("buddies.accepted")}
              onChange={updateMatch}
            />
          </ListCard>
        )
      })}
    </div>
  )
}

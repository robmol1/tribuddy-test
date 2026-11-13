import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabaseClient"
import { fetchPublicProfiles } from "../publicProfiles"
import { Button, EmptyState, ListCard, StatusText, UserIcon } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { levelLabel } from "../i18n/labels"
import { matchesByBuddy } from "../matches"
import MatchActions from "./MatchActions"

export default function EventParticipants({ eventId, session, joined }) {
  const currentUserId = session?.user?.id
  const { t } = useT()

  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  /* --------------------------------------------------
     Load deelnemers + matches
  -------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // 1️⃣ Alle deelnemers van dit event (NIET filteren!)
      const { data: participantData, error: participantError } =
        await supabase
          .from("user_events")
          .select("user_id, buddy_enabled")
          .eq("event_id", eventId)
          .neq("user_id", currentUserId)

      if (participantError) {
        console.error("Fout bij ophalen deelnemers:", participantError)
        setLoading(false)
        return
      }

      const profiles = await fetchPublicProfiles(
        (participantData || []).map((p) => p.user_id),
        "first_name,last_name,country_code,experience_level"
      )

      setParticipants(
        (participantData || []).map((p) => ({
          ...p,
          users: profiles.get(p.user_id) || {},
        }))
      )

      // 2️⃣ Alle matches voor dit event
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, status")
        .eq("event_id", eventId)

      if (matchError) {
        console.error("Fout bij ophalen matches:", matchError)
      } else {
        setMatches(matchData || [])
      }

      setLoading(false)
    }

    if (currentUserId) loadData()
  }, [eventId, currentUserId])

  // Geldende match per deelnemer (accepted wint, ingetrokken telt niet mee)
  const matchByBuddy = useMemo(
    () => matchesByBuddy(matches, currentUserId),
    [matches, currentUserId]
  )

  /* --------------------------------------------------
     Actions
  -------------------------------------------------- */
  const requestBuddy = async (otherUserId) => {
    if (!currentUserId) return
    setMessage(null)

    if (!joined) {
      setMessage(t("participants.mustJoin"))
      return
    }

    if (matchByBuddy.has(otherUserId)) {
      setMessage(t("participants.exists"))
      return
    }

    const { data, error } = await supabase
      .from("matches")
      .insert({
        user1_id: currentUserId,
        user2_id: otherUserId,
        event_id: eventId,
        status: "pending",
      })
      .select("id, user1_id, user2_id, status")
      .single()

    if (error) {
      console.error("Buddy request error:", error)
      setMessage(t("participants.requestFailed"))
      return
    }

    setMatches((prev) => [...prev, data])
  }

  const updateMatch = (updated) =>
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  if (loading) return <StatusText>{t("participants.loading")}</StatusText>

  return (
    <div className="space-y-3">
      {message && <StatusText tone="danger">{message}</StatusText>}

      {participants.length === 0 && (
        <EmptyState icon={<UserIcon className="h-5 w-5" />} title={t("participants.empty")} />
      )}

      {participants.map((p) => {
        const match = matchByBuddy.get(p.user_id)
        const name = `${p.users.first_name} ${p.users.last_name}`

        return (
          <ListCard
            key={p.user_id}
            title={name}
            meta={`${levelLabel(t, p.users.experience_level)} — ${p.users.country_code}`}
          >
            {joined && !match && p.buddy_enabled && (
              <Button variant="outline" size="sm" onClick={() => requestBuddy(p.user_id)}>
                {t("participants.connect")}
              </Button>
            )}

            {match && (
              <MatchActions
                match={match}
                currentUserId={currentUserId}
                buddyName={name}
                acceptedLabel={t("participants.buddy")}
                onChange={updateMatch}
              />
            )}
          </ListCard>
        )
      })}
    </div>
  )
}

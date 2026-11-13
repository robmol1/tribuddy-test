import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { Button, EmptyState, ListCard, StatusText, UserIcon } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { levelLabel } from "../i18n/labels"

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
          .select(`
            user_id,
            buddy_enabled,
            users (
              id,
              first_name,
              last_name,
              country_code,
              experience_level
            )
          `)

          .eq("event_id", eventId)
          .neq("user_id", currentUserId)

      if (participantError) {
        console.error("Fout bij ophalen deelnemers:", participantError)
        setLoading(false)
        return
      }

      setParticipants(participantData || [])

      // 2️⃣ Alle matches voor dit event
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("user1_id, user2_id, status")
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

  /* --------------------------------------------------
     Helpers
  -------------------------------------------------- */
  const getMatchWith = (otherUserId) => {
    const relevant = matches.filter(
      (m) =>
        (m.user1_id === currentUserId &&
          m.user2_id === otherUserId) ||
        (m.user2_id === currentUserId &&
          m.user1_id === otherUserId)
    )

    // accepted wint altijd
    return (
      relevant.find((m) => m.status === "accepted") ||
      relevant.find((m) => m.status === "pending") ||
      null
    )
  }

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

    if (getMatchWith(otherUserId)) {
      setMessage(t("participants.exists"))
      return
    }

    const { error } = await supabase.from("matches").insert({
      user1_id: currentUserId,
      user2_id: otherUserId,
      event_id: eventId,
      status: "pending",
    })

    if (error) {
      console.error("Buddy request error:", error)
      setMessage(t("participants.requestFailed"))
      return
    }

    setMatches((prev) => [
      ...prev,
      {
        user1_id: currentUserId,
        user2_id: otherUserId,
        status: "pending",
      },
    ])
  }

  const acceptBuddy = async (otherUserId) => {
    setMessage(null)
    const { error } = await supabase
      .from("matches")
      .update({ status: "accepted" })
      .eq("event_id", eventId)
      .eq("user1_id", otherUserId)
      .eq("user2_id", currentUserId)

    if (error) {
      console.error("Accept buddy error:", error)
      setMessage(t("participants.acceptFailed"))
      return
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.user1_id === otherUserId && m.user2_id === currentUserId
          ? { ...m, status: "accepted" }
          : m
      )
    )
  }

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
        const match = getMatchWith(p.user_id)
        const status = match?.status

        return (
          <ListCard
            key={p.user_id}
            title={`${p.users.first_name} ${p.users.last_name}`}
            meta={`${levelLabel(t, p.users.experience_level)} — ${p.users.country_code}`}
          >
            {joined && !status && p.buddy_enabled && (
              <Button variant="outline" size="sm" onClick={() => requestBuddy(p.user_id)}>
                {t("participants.connect")}
              </Button>
            )}

            {status === "pending" &&
              match.user2_id === currentUserId && (
                <Button size="sm" onClick={() => acceptBuddy(p.user_id)}>
                  {t("participants.accept")}
                </Button>
              )}

            {status === "pending" &&
              match.user1_id === currentUserId && (
                <StatusText>{t("participants.requestSent")}</StatusText>
              )}

            {status === "accepted" && (
              <StatusText tone="success">{t("participants.buddy")}</StatusText>
            )}
          </ListCard>
        )
      })}
    </div>
  )
}

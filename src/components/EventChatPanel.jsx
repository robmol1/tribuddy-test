import { useEffect, useRef, useState } from "react"
import { supabase } from "../supabaseClient"
import { fetchPublicProfiles } from "../publicProfiles"
import { Button, Input, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import ReportDialog from "./ReportDialog"
import { fetchBlockingMe, fetchMyBlocks } from "../safety"

export default function EventChatPanel({
  eventId,
  session,
  participantsVersion = 0
}) {
  const userId = session.user.id
  const { t, formatDate } = useT()
  const messagesRef = useRef(null)

  const [matches, setMatches] = useState([])
  const [activeMatch, setActiveMatch] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [activeParticipants, setActiveParticipants] = useState([])
  const [myBlocks, setMyBlocks] = useState(new Set())       // wie ik heb geblokkeerd
  const [blockingMe, setBlockingMe] = useState(new Set())   // wie mij heeft geblokkeerd
  const [sendFailed, setSendFailed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)    // { userId, name, chatMessageId }

  // Blokkades in beide richtingen (chat op slot bij een blokkade)
  useEffect(() => {
    Promise.all([fetchMyBlocks(userId), fetchBlockingMe()]).then(([mine, againstMe]) => {
      setMyBlocks(mine)
      setBlockingMe(againstMe)
    })
  }, [userId, participantsVersion])

  useEffect(() => {
    setSendFailed(false)
  }, [activeMatch?.id])

useEffect(() => {
  if (!activeMatch) {
    setMessages([])
    return
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("match_id", activeMatch.id)
      .order("timestamp", { ascending: true })

    setMessages(data || [])
  }

  loadMessages()
}, [activeMatch?.id])


  /* --------------------------------------------------
     1️⃣ Load accepted matches (chat-buddies)
  -------------------------------------------------- */
useEffect(() => {
  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("user_events")
      .select("user_id")
      .eq("event_id", eventId)

    if (error) {
      console.error("Load participants error:", error)
      return
    }

    setActiveParticipants(data.map(d => d.user_id))
  }

  loadParticipants()
}, [eventId, participantsVersion])


  useEffect(() => {
    const loadMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, status")
        .eq("event_id", eventId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      if (error) {
        console.error("Load matches error:", error)
        return
      }

      // Alleen accepted, 1 per buddy
      const byBuddy = new Map()
      for (const m of data.filter(m => m.status === "accepted")) {
        const buddyId =
          m.user1_id === userId ? m.user2_id : m.user1_id
        if (!byBuddy.has(buddyId)) byBuddy.set(buddyId, m)
      }

      const filtered = Array.from(byBuddy.values()).filter(m => {
  const buddyId =
    m.user1_id === userId ? m.user2_id : m.user1_id

  return (
    activeParticipants.includes(userId) &&
    activeParticipants.includes(buddyId)
  )
})

      const profiles = await fetchPublicProfiles(
        filtered.flatMap((m) => [m.user1_id, m.user2_id]),
        "first_name,last_name"
      )

      if (!profiles) {
        setLoadFailed(true)
        return
      }
      setLoadFailed(false)

      // Chats met een buddy zonder zichtbaar profiel (bijv. verwijderd account) vallen weg
      setMatches(
        filtered
          .filter((m) => profiles.has(m.user1_id === userId ? m.user2_id : m.user1_id))
          .map((m) => ({
            ...m,
            users1: profiles.get(m.user1_id) || {},
            users2: profiles.get(m.user2_id) || {},
          }))
      )

    }

    loadMatches()
  }, [eventId, userId, activeParticipants, participantsVersion])



  /* --------------------------------------------------
     2️⃣ Realtime updates
  -------------------------------------------------- */
  useEffect(() => {
    if (!activeMatch) return

    const channel = supabase
      .channel(`chat-${activeMatch.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${activeMatch.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.find((m) => m.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [activeMatch?.id])

  useEffect(() => {
  if (
    activeMatch &&
    !matches.find(m => m.id === activeMatch.id)
  ) {
    setActiveMatch(null)
  }
}, [matches, activeMatch])

  // Nieuwste bericht in beeld houden
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  /* --------------------------------------------------
     3️⃣ Send message
  -------------------------------------------------- */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeMatch) return
    setSendFailed(false)

    const { error } = await supabase.from("chat_messages").insert({
      match_id: activeMatch.id,
      sender_id: userId,
      message_text: newMessage,
    })

    if (error) {
      console.error("[CHAT] send failed", error)
      setSendFailed(true)
      return
    }

    setNewMessage("")
  }

  const buddyIdOfMatch = (m) => (m.user1_id === userId ? m.user2_id : m.user1_id)
  const activeBuddyId = activeMatch ? buddyIdOfMatch(activeMatch) : null
  const iBlocked = !!activeBuddyId && myBlocks.has(activeBuddyId)
  const blockedMe = !!activeBuddyId && blockingMe.has(activeBuddyId)

  // Vandaag: alleen tijd ("14:32"); eerder: datum + tijd ("12 nov, 14:32")
  const messageTime = (value) => {
    if (!value) return ""
    const sent = new Date(value)
    const today = sent.toDateString() === new Date().toDateString()
    return formatDate(
      sent,
      today
        ? { hour: "2-digit", minute: "2-digit" }
        : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    )
  }

  const buddyName = (m) => {
    const b = m.user1_id === userId ? m.users2 : m.users1
    return `${b.first_name} ${b.last_name}`
  }

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      {/* Links: chatlijst */}
      <aside className="md:border-r md:border-line md:pr-4">
        <h2 className="mb-2 text-lg font-bold">{t("chat.title")}</h2>

        {loadFailed && (
          <StatusText tone="danger" className="mb-2">{t("common.profilesFailed")}</StatusText>
        )}

        {matches.length === 0 && (
          <StatusText>{t("chat.noBuddies")}</StatusText>
        )}

        <div className="space-y-1">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMatch(m)}
              className={
                "block w-full rounded-control px-3 py-2 text-left text-sm font-semibold transition " +
                (activeMatch?.id === m.id
                  ? "bg-link-soft text-link"
                  : "text-ink hover:bg-surface")
              }
            >
              {buddyName(m)}
            </button>
          ))}
        </div>
      </aside>

      {/* Rechts: chat */}
      <section>
        {matches.length === 0 ? (
          <StatusText>{t("chat.noChats")}</StatusText>
        ) : !activeMatch ? (
          <StatusText>{t("chat.select")}</StatusText>
        ) : (
          <>
            <h2 className="mb-2 text-lg font-bold">{buddyName(activeMatch)}</h2>

            <div
              ref={messagesRef}
              className="flex max-h-96 min-h-[200px] flex-col gap-2 overflow-y-auto rounded-card border border-line p-3"
            >
              {messages.length === 0 && (
                <StatusText>{t("chat.noMessages")}</StatusText>
              )}

              {messages.map((m) => {
                const own = m.sender_id === userId
                return (
                  <div
                    key={m.id}
                    className={
                      "max-w-[80%] rounded-card px-3 py-2 text-sm text-ink " +
                      (own ? "self-end bg-link-soft" : "self-start bg-surface")
                    }
                  >
                    {/* Afzender alleen voor schermlezers; links/rechts toont het visueel */}
                    <span className="sr-only">{own ? t("chat.you") : t("chat.buddy")}: </span>
                    {m.message_text}
                    {m.timestamp && (
                      <time
                        dateTime={m.timestamp}
                        className="mt-1 block text-right text-xs text-muted"
                      >
                        {messageTime(m.timestamp)}
                      </time>
                    )}
                    {!own && (
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({
                            userId: m.sender_id,
                            name: buddyName(activeMatch),
                            chatMessageId: m.id,
                          })
                        }
                        className="mt-1 block text-xs text-muted underline-offset-2 hover:text-danger hover:underline"
                      >
                        {t("report.reportMessage")}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {iBlocked || blockedMe ? (
              // Chat op slot bij een blokkade; wie geblokkeerd is krijgt een algemene melding
              <StatusText className="mt-3">
                {iBlocked ? t("chat.lockedByYou") : t("chat.locked")}
              </StatusText>
            ) : (
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
              >
                <Input
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("chat.placeholder")}
                />
                <Button type="submit">{t("chat.send")}</Button>
              </form>
            )}
            {sendFailed && <StatusText tone="danger" className="mt-2">{t("chat.sendFailed")}</StatusText>}
          </>
        )}
      </section>

      <ReportDialog
        target={reportTarget}
        reporterId={userId}
        onClose={() => setReportTarget(null)}
        alreadyBlocked={!!reportTarget && myBlocks.has(reportTarget.userId)}
        onBlocked={(id) => setMyBlocks((prev) => new Set(prev).add(id))}
      />
    </div>
  )
}

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../supabaseClient"
import EventParticipants from "./EventParticipants"
import BuddyMatches from "./BuddyMatches"
import EventChatPanel from "./EventChatPanel"
import { Button, Card, Checkbox, EmptyState, PageContainer, StatusText, Tabs } from "./ui"
import { useT } from "../i18n/LanguageProvider"

// Alleen http(s)-links toestaan; bijvoorbeeld javascript: wordt geweigerd.
function safeWebsite(value) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
  } catch {
    return null
  }
}

// TODO: BuddyMatches component komt later → alvast voorbereiden
// import BuddyMatches from "./BuddyMatches"

export default function EventDetail({ session }) {
  const { id } = useParams()
  const { t, formatDate } = useT()

  const [event, setEvent] = useState(null)
  const [joinMessage, setJoinMessage] = useState(null)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buddyEnabled, setBuddyEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("participants")
  const [participantsVersion, setParticipantsVersion] = useState(0)

  const handleJoin = async () => {
    setJoinMessage(null)

    if (!session?.user) {
      setJoinMessage(t("event.loginRequired"))
      return
    }

    // profiel check
    if (!joined) {
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle()

      if (!profile) {
        setJoinMessage(t("event.profileRequired"))
        return
      }
    }

    if (!joined) {
      const { error } = await supabase
        .from("user_events")
        .insert({
          user_id: session.user.id,
          event_id: id,
          buddy_enabled: false
        })

      if (!error) {
        setJoined(true)
        setParticipantsVersion(v => v + 1)
      }
    } else {
      const { error } = await supabase
        .from("user_events")
        .delete()
        .eq("user_id", session.user.id)
        .eq("event_id", id)

      if (!error) {
        setJoined(false)
        setParticipantsVersion(v => v + 1)
      }
    }
  }

const handleBuddyToggle = async (e) => {
  const newValue = e.target.checked

  setBuddyEnabled(newValue)

  const { error } = await supabase
    .from("user_events")
    .update({ buddy_enabled: newValue })
    .eq("user_id", session.user.id)
    .eq("event_id", id)

  if (error) {
    console.error("[EVENT] buddy toggle failed", error)
    // rollback UI
    setBuddyEnabled(!newValue)
  }
}


  useEffect(() => {
  const loadEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[EVENT] load failed", error)
      setLoading(false)
      return
    }

    setEvent(data)

    if (session?.user) {
      const { data: joinData } = await supabase
        .from("user_events")
        .select("id, buddy_enabled")
        .eq("user_id", session.user.id)
        .eq("event_id", id)
        .maybeSingle()

      setJoined(!!joinData)
      setBuddyEnabled(joinData?.buddy_enabled ?? false)
    }

    setLoading(false)
  }

  loadEvent()
}, [id, session])


  if (loading) return <PageContainer><StatusText>{t("event.loading")}</StatusText></PageContainer>
  if (!event) return <PageContainer><StatusText tone="danger">{t("event.notFound")}</StatusText></PageContainer>

  const details = [
    [t("event.date"), formatDate(event.event_date, { dateStyle: "long" })],
    [t("event.location"), `${event.city}, ${event.country}`],
    [t("event.organizer"), event.organizer],
    [t("event.distance"), event.distance],
  ]

  return (
    <PageContainer>
      <Card className="space-y-5">
        <h1 className="text-3xl font-extrabold tracking-tight">{event.name}</h1>

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {safeWebsite(event.website) && (
          <Button as="a" variant="link" href={safeWebsite(event.website)} target="_blank" rel="noopener noreferrer">
            {t("event.website")} →
          </Button>
        )}

        {/* Join / Leave + buddy toggle */}
        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
          <Button variant={joined ? "outline" : "primary"} onClick={handleJoin}>
            {joined ? t("event.leave") : t("event.join")}
          </Button>

          {joined && (
            <Checkbox
              label={t("event.buddyToggle")}
              checked={buddyEnabled}
              onChange={handleBuddyToggle}
            />
          )}
        </div>

        {joinMessage && <StatusText tone="danger">{joinMessage}</StatusText>}
      </Card>

      {/* Tabs */}
      <Tabs
        className="mt-8"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "participants", label: t("event.tabParticipants") },
          { id: "buddies", label: t("event.tabBuddies") },
          { id: "chat", label: t("event.tabChat") },
        ]}
      />

      <div className="mt-6">
      {/* TAB CONTENT */}
      {activeTab === "participants" && (
  <EventParticipants
    eventId={id}
    session={session}
    joined={joined}
  />
)}


      {activeTab === "buddies" && joined && (
  <BuddyMatches
    eventId={id}
    session={session}
    joined={joined}
    participantsVersion={participantsVersion}
  />
)}

{activeTab === "buddies" && !joined && (
  <EmptyState title={t("event.joinForBuddies")} />
)}



      {activeTab === "chat" && session?.user && (
  <EventChatPanel
    eventId={id}
    session={session}
    participantsVersion={participantsVersion}
  />
)}
      </div>
    </PageContainer>
  )
}

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { Button, Card, Checkbox, EmptyState, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"

// Vandaag als "YYYY-MM-DD" in lokale tijd (vandaag telt als komend)
function todayKey() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isPast(eventDate) {
  return String(eventDate ?? "").slice(0, 10) < todayKey()
}

// Overzicht van de wedstrijden waaraan de gebruiker meedoet, met buddy-schakelaar per wedstrijd
export default function MyEvents({ session }) {
  const { t, formatDate } = useT()
  const userId = session?.user?.id

  const [items, setItems] = useState([]) // [{ event, buddyEnabled }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      setLoading(true)
      setError(null)

      // 1. Eigen deelnames
      const { data: joins, error: joinError } = await supabase
        .from("user_events")
        .select("event_id, buddy_enabled")
        .eq("user_id", userId)

      if (joinError) {
        console.error("[MY EVENTS] load joins failed", joinError)
        setError(joinError.message)
        setLoading(false)
        return
      }

      if (joins.length === 0) {
        setItems([])
        setLoading(false)
        return
      }

      // 2. Bijbehorende wedstrijden
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, name, city, country, event_date")
        .in("id", joins.map((j) => j.event_id))
        .order("event_date", { ascending: true })

      if (eventsError) {
        console.error("[MY EVENTS] load events failed", eventsError)
        setError(eventsError.message)
        setLoading(false)
        return
      }

      const buddyById = new Map(joins.map((j) => [j.event_id, j.buddy_enabled]))
      setItems(events.map((event) => ({ event, buddyEnabled: !!buddyById.get(event.id) })))
      setLoading(false)
    }

    load()
  }, [userId])

  const setBuddy = (eventId, value) =>
    setItems((prev) =>
      prev.map((item) => (item.event.id === eventId ? { ...item, buddyEnabled: value } : item))
    )

  const handleBuddyToggle = async (eventId, newValue) => {
    setSaveError(false)
    setBuddy(eventId, newValue)

    const { error } = await supabase
      .from("user_events")
      .update({ buddy_enabled: newValue })
      .eq("user_id", userId)
      .eq("event_id", eventId)

    if (error) {
      console.error("[MY EVENTS] buddy toggle failed", error)
      // rollback UI
      setBuddy(eventId, !newValue)
      setSaveError(true)
    }
  }

  if (loading) return <StatusText>{t("myEvents.loading")}</StatusText>
  if (error) return <StatusText tone="danger">{t("myEvents.error", { message: error })}</StatusText>

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("myEvents.empty")}
        action={
          <Button as={Link} to="/events" variant="link">
            {t("myEvents.browse")} →
          </Button>
        }
      />
    )
  }

  const upcoming = items.filter((item) => !isPast(item.event.event_date))
  const past = items.filter((item) => isPast(item.event.event_date))

  const renderItem = ({ event, buddyEnabled }, showToggle) => (
    <li key={event.id}>
      <Card className="p-5">
        <Link to={`/events/${event.id}`} className="block transition hover:text-link">
          <p className="text-xs font-extrabold uppercase tracking-widest text-link">
            {formatDate(event.event_date)}
          </p>
          <h3 className="mt-1 text-lg font-bold">{event.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {event.city}, {event.country}
          </p>
        </Link>

        {showToggle && (
          <Checkbox
            className="mt-4 border-t border-line pt-4"
            label={t("event.buddyToggle")}
            checked={buddyEnabled}
            onChange={(e) => handleBuddyToggle(event.id, e.target.checked)}
          />
        )}
      </Card>
    </li>
  )

  return (
    <div className="space-y-6">
      {saveError && <StatusText tone="danger">{t("myEvents.saveFailed")}</StatusText>}

      {upcoming.length > 0 && (
        <ul className="space-y-3">{upcoming.map((item) => renderItem(item, true))}</ul>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted">
            {t("myEvents.past")}
          </h3>
          <ul className="space-y-3 opacity-75">{past.map((item) => renderItem(item, false))}</ul>
        </section>
      )}
    </div>
  )
}

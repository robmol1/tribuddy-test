import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from "react-router-dom"
import { Card, EmptyState, PageContainer, StatusText } from './ui'
import { useT } from '../i18n/LanguageProvider'

export default function EventsList() {
  const { t, formatDate } = useT()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)

      // 🔍 Haal ALLE events op (zonder filter)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        console.error("Fout bij ophalen events:", error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log("📦 Events ontvangen:", data)

      // 🔍 Debug alle datums
      data.forEach((e) =>
        console.log(
          '📅 Event:',
          e.name,
          '| event_date:', e.event_date,
          '| typeof:', typeof e.event_date
        )
      )

      setEvents(data)
      setLoading(false)
    }

    fetchEvents()
  }, [])

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('events.title')}</h1>

      {loading && <StatusText>{t('events.loading')}</StatusText>}
      {!loading && error && <StatusText tone="danger">{t('events.error', { message: error })}</StatusText>}

      {!loading && !error && events.length === 0 && <EmptyState title={t('events.empty')} />}

      {!loading && !error && events.length > 0 && (
        <ul className="space-y-3">
          {events.map(ev => (
            <li key={ev.id}>
              <Card
                as={Link}
                to={`/events/${ev.id}`}
                className="block p-5 transition hover:-translate-y-0.5 hover:border-link"
              >
                <p className="text-xs font-extrabold uppercase tracking-widest text-link">
                  {formatDate(ev.event_date)}
                </p>
                <h2 className="mt-1 text-lg font-bold">{ev.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {ev.city}, {ev.country} · {t('events.organizer', { name: ev.organizer })}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}

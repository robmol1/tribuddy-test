import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from "react-router-dom"
import { Button, Card, Checkbox, EmptyState, Field, Input, PageContainer, Select, StatusText } from './ui'
import { useT } from '../i18n/LanguageProvider'
import { EVENT_CATEGORIES_SELECT, distanceGroups as buildDistanceGroups, eventCategories } from '../distanceCategories'
import { useMasterData } from '../masterData'
import DistanceChips from './DistanceChips'

// Vandaag als "YYYY-MM-DD" in lokale tijd (vandaag telt als komend)
function todayKey() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const NO_FILTERS = { from: "", to: "", showPast: false, location: "", distance: "" }

export default function EventsList() {
  const { t, formatDate } = useT()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(NO_FILTERS)
  const { active, label } = useMasterData()
  const distanceGroups = buildDistanceGroups(active)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)

      // Alleen gepubliceerde, zichtbare events (met afstandscategorieën); filteren gebeurt hieronder
      const { data, error } = await supabase
        .from('events')
        .select(`*, ${EVENT_CATEGORIES_SELECT}`)
        .eq('status', 'published')
        .eq('is_visible', true)
        .order('event_date', { ascending: true })

      if (error) {
        console.error("Fout bij ophalen events:", error)
        setError(error.message)
        setLoading(false)
        return
      }

      setEvents(data)
      setLoading(false)
    }

    fetchEvents()
  }, [])

  const visibleEvents = useMemo(() => {
    const today = todayKey()
    const location = filters.location.trim().toLowerCase()

    return events.filter((ev) => {
      const date = String(ev.event_date ?? "").slice(0, 10)
      if (!filters.showPast && date < today) return false
      if (filters.from && date < filters.from) return false
      if (filters.to && date > filters.to) return false
      if (
        location &&
        !`${ev.city ?? ""} ${ev.country ?? ""}`.toLowerCase().includes(location)
      ) return false
      if (filters.distance && !eventCategories(ev).includes(filters.distance)) return false
      return true
    })
  }, [events, filters])

  const setFilter = (key) => (e) =>
    setFilters((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }))

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('events.title')}</h1>

      {loading && <StatusText>{t('events.loading')}</StatusText>}
      {!loading && error && <StatusText tone="danger">{t('events.error', { message: error })}</StatusText>}

      {!loading && !error && events.length === 0 && <EmptyState title={t('events.empty')} />}

      {!loading && !error && events.length > 0 && (
        <>
          {/* Filters */}
          <Card variant="muted" className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t('events.filterFrom')}>
                <Input type="date" value={filters.from} max={filters.to || undefined} onChange={setFilter('from')} />
              </Field>
              <Field label={t('events.filterTo')}>
                <Input type="date" value={filters.to} min={filters.from || undefined} onChange={setFilter('to')} />
              </Field>
              <Field label={t('events.filterLocation')}>
                <Input
                  type="search"
                  value={filters.location}
                  onChange={setFilter('location')}
                  placeholder={t('events.filterLocationPlaceholder')}
                />
              </Field>
              <Field label={t('events.filterDistance')}>
                <Select value={filters.distance} onChange={setFilter('distance')}>
                  <option value="">{t('events.filterAll')}</option>
                  {distanceGroups.map((group) => (
                    <optgroup key={group.code} label={label('distanceGroups', group.code)}>
                      {group.categories.map((code) => (
                        <option key={code} value={code}>{label('distanceCategories', code)}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>
            </div>
            <Checkbox label={t('events.filterShowPast')} checked={filters.showPast} onChange={setFilter('showPast')} />
            <p className="text-xs text-muted">
              {t('events.count', { shown: visibleEvents.length, total: events.length })}
            </p>
          </Card>

          {visibleEvents.length === 0 && (
            <EmptyState
              title={t('events.noMatch')}
              action={
                <Button variant="outline" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                  {t('events.clearFilters')}
                </Button>
              }
            />
          )}

          {visibleEvents.length > 0 && (
            <ul className="space-y-3">
              {visibleEvents.map(ev => (
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
                    <DistanceChips event={ev} className="mt-3" />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PageContainer>
  )
}

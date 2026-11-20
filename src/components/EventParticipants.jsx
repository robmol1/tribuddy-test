import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabaseClient"
import { fetchPublicProfiles } from "../publicProfiles"
import {
  Button, Card, Checkbox, ConfirmDialog, Dialog, EmptyState, Field, ListCard, Select, StatusText, UserIcon,
} from "./ui"
import ReportDialog from "./ReportDialog"
import { blockUser, fetchBlockingMe, fetchMyBlocks, unblockUser } from "../safety"
import { useT } from "../i18n/LanguageProvider"
import { GENDER_UNSPECIFIED, knownGender, useMasterData } from "../masterData"
import { matchesByBuddy } from "../matches"
import MatchActions from "./MatchActions"
import ParticipantProfile from "./ParticipantProfile"
import { fetchUserLanguages } from "../languages"

// Velden uit public_profiles voor lijst, filters en profiel-popup
// (talen komen uit user_languages en worden als users.languages = [code, …] toegevoegd)
const PROFILE_FIELDS = [
  "first_name", "last_name", "country_code", "experience_level", "preferred_distance",
  "location", "bio", "open_for_buddy", "open_for_training", "training_preference",
  "open_for_travel", "open_for_accommodation", "birth_date", "gender",
  "pr_swim_1000m", "pr_bike_40km", "pr_run_5km", "pr_run_10km",
].join(",")

// Buddydoel-filter → kolom in public_profiles
const GOALS = [
  ["training", "open_for_training", "profile.openForTraining"],
  ["travel", "open_for_travel", "profile.openForTravel"],
  ["accommodation", "open_for_accommodation", "profile.openForAccommodation"],
]

const DEFAULT_FILTERS = {
  buddyOnly: true, sharedLanguage: false, language: "", goal: "", level: "", gender: "",
}
const NO_FILTERS = {
  buddyOnly: false, sharedLanguage: false, language: "", goal: "", level: "", gender: "",
}

function languagesOf(profile) {
  return Array.isArray(profile?.languages) ? profile.languages : []
}

export default function EventParticipants({ eventId, session, joined }) {
  const currentUserId = session?.user?.id
  const { t } = useT()
  const { active, label, sortCodes } = useMasterData()
  const [myLanguages, setMyLanguages] = useState([])

  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [openUserId, setOpenUserId] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [myBlocks, setMyBlocks] = useState(new Set())       // wie ik heb geblokkeerd
  const [blockingMe, setBlockingMe] = useState(new Set())   // wie mij heeft geblokkeerd
  const [confirmBlock, setConfirmBlock] = useState(false)
  const [blockBusy, setBlockBusy] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)    // { userId, name }

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
        PROFILE_FIELDS
      )

      if (!profiles) {
        setLoadFailed(true)
        setLoading(false)
        return
      }
      setLoadFailed(false)

      // Talen (deelnemers + ikzelf) en mijn voorkeur voor het geslacht van een buddy
      const [languagesByUser, ownProfile] = await Promise.all([
        fetchUserLanguages([currentUserId, ...(participantData || []).map((p) => p.user_id)]),
        supabase.from("users").select("buddy_gender_pref").eq("id", currentUserId).maybeSingle(),
      ])
      const languages = languagesByUser || new Map() // mislukt → zonder talen verder
      setMyLanguages(languages.get(currentUserId) ?? [])

      // Geslachtsfilter start op mijn voorkeur (geen blokkade: je kunt het filter aanpassen)
      const pref = ownProfile.data?.buddy_gender_pref
      if (pref === "M" || pref === "V") {
        setFilters((prev) => ({ ...prev, gender: pref }))
      }

      // Deelnemers zonder zichtbaar profiel (bijv. verwijderd account) vallen weg
      setParticipants(
        (participantData || [])
          .filter((p) => profiles.has(p.user_id))
          .map((p) => ({
            ...p,
            users: { ...profiles.get(p.user_id), languages: languages.get(p.user_id) ?? [] },
          }))
      )

      // Blokkades in beide richtingen
      const [mine, againstMe] = await Promise.all([fetchMyBlocks(currentUserId), fetchBlockingMe()])
      setMyBlocks(mine)
      setBlockingMe(againstMe)

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

  // Talen voor het filter: alle talen van de deelnemers, op vertaalde naam
  const languageOptions = useMemo(() => {
    const codes = new Set()
    participants.forEach((p) => languagesOf(p.users).forEach((c) => codes.add(c)))
    return sortCodes("languages", Array.from(codes))
  }, [participants, sortCodes])

  const visibleParticipants = useMemo(
    () =>
      participants.filter((p) => {
        const u = p.users
        if (filters.buddyOnly && !p.buddy_enabled) return false
        if (
          filters.sharedLanguage &&
          !languagesOf(u).some((c) => myLanguages.includes(c))
        ) return false
        if (filters.language && !languagesOf(u).includes(filters.language)) return false
        if (filters.goal) {
          const column = GOALS.find(([id]) => id === filters.goal)?.[1]
          if (!u[column]) return false
        }
        if (filters.level && u.experience_level !== filters.level) return false
        if (filters.gender && knownGender(u.gender) !== filters.gender) return false
        return true
      }),
    [participants, filters, myLanguages]
  )

  const setFilter = (key) => (e) =>
    setFilters((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }))

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

  const nameOf = (p) => `${p.users.first_name ?? ""} ${p.users.last_name ?? ""}`.trim()

  // Buddy-knop of verzoekstatus; dezelfde in de lijst en in de popup
  const renderActions = (p) => {
    const match = matchByBuddy.get(p.user_id)
    if (match) {
      return (
        <MatchActions
          match={match}
          currentUserId={currentUserId}
          buddyName={nameOf(p)}
          acceptedLabel={t("participants.buddy")}
          onChange={updateMatch}
        />
      )
    }
    // Alleen als de ander een buddy zoekt, open staat voor contact en er geen blokkade is
    const canConnect =
      joined &&
      p.buddy_enabled &&
      p.users.open_for_buddy !== false &&
      !myBlocks.has(p.user_id) &&
      !blockingMe.has(p.user_id)
    if (canConnect) {
      return (
        <Button variant="outline" size="sm" onClick={() => requestBuddy(p.user_id)}>
          {t("participants.connect")}
        </Button>
      )
    }
    return null
  }

  const openParticipant = participants.find((p) => p.user_id === openUserId)

  const toggleBlock = async () => {
    if (!openParticipant) return
    const otherId = openParticipant.user_id
    const blocked = myBlocks.has(otherId)
    setBlockBusy(true)
    setMessage(null)
    const ok = blocked
      ? await unblockUser(currentUserId, otherId)
      : await blockUser(currentUserId, otherId)
    setBlockBusy(false)
    setConfirmBlock(false)

    if (!ok) {
      setMessage(t("safety.blockFailed"))
      return
    }
    setMyBlocks((prev) => {
      const next = new Set(prev)
      if (blocked) next.delete(otherId)
      else next.add(otherId)
      return next
    })
  }

  // Blokkeren/deblokkeren en melden, onderaan de profiel-popup
  const renderSafetyActions = (p) => {
    const blocked = myBlocks.has(p.user_id)
    return (
      <>
        {blocked ? (
          <Button variant="link" onClick={toggleBlock} disabled={blockBusy}>
            {t("safety.unblock")}
          </Button>
        ) : (
          <Button variant="link" onClick={() => setConfirmBlock(true)} disabled={blockBusy}>
            {t("safety.block")}
          </Button>
        )}
        <Button variant="link" onClick={() => setReportTarget({ userId: p.user_id, name: nameOf(p) })}>
          {t("report.reportProfile")}
        </Button>
        {blocked && <span className="text-xs text-muted">{t("safety.youBlocked")}</span>}
      </>
    )
  }

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  if (loading) return <StatusText>{t("participants.loading")}</StatusText>
  if (loadFailed) return <StatusText tone="danger">{t("common.profilesFailed")}</StatusText>

  if (participants.length === 0) {
    return <EmptyState icon={<UserIcon className="h-5 w-5" />} title={t("participants.empty")} />
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <Card variant="muted" className="space-y-4 p-4">
        <Checkbox
          label={t("participants.filterBuddyOnly")}
          checked={filters.buddyOnly}
          onChange={setFilter("buddyOnly")}
        />
        {myLanguages.length > 0 && (
          <Checkbox
            label={t("participants.filterSharedLanguage")}
            checked={filters.sharedLanguage}
            onChange={setFilter("sharedLanguage")}
          />
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("profile.languages")}>
            <Select value={filters.language} onChange={setFilter("language")}>
              <option value="">{t("participants.filterAll")}</option>
              {languageOptions.map((code) => (
                <option key={code} value={code}>{label("languages", code)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("participants.filterGoal")}>
            <Select value={filters.goal} onChange={setFilter("goal")}>
              <option value="">{t("participants.filterAll")}</option>
              {GOALS.map(([id, , textKey]) => (
                <option key={id} value={id}>{t(textKey)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("profile.level")}>
            <Select value={filters.level} onChange={setFilter("level")}>
              <option value="">{t("participants.filterAll")}</option>
              {active("levels").map((level) => (
                <option key={level.code} value={level.code}>{label("levels", level.code)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("profile.gender")}>
            <Select value={filters.gender} onChange={setFilter("gender")}>
              <option value="">{t("participants.filterAll")}</option>
              {active("genders")
                .filter((g) => g.code !== GENDER_UNSPECIFIED)
                .map((g) => (
                  <option key={g.code} value={g.code}>{label("genders", g.code)}</option>
                ))}
            </Select>
          </Field>
        </div>
        <p className="text-xs text-muted">
          {t("participants.count", { shown: visibleParticipants.length, total: participants.length })}
        </p>
      </Card>

      {message && <StatusText tone="danger">{message}</StatusText>}

      {visibleParticipants.length === 0 && (
        <EmptyState
          icon={<UserIcon className="h-5 w-5" />}
          title={t("participants.noMatch")}
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(NO_FILTERS)}>
              {t("participants.clearFilters")}
            </Button>
          }
        />
      )}

      {visibleParticipants.map((p) => (
        <ListCard
          key={p.user_id}
          title={
            <button
              type="button"
              onClick={() => setOpenUserId(p.user_id)}
              className="text-left hover:text-link hover:underline"
            >
              {nameOf(p)}
            </button>
          }
          meta={`${label("levels", p.users.experience_level)} — ${p.users.country_code ?? ""}`}
        >
          {renderActions(p)}
        </ListCard>
      ))}

      {/* Profiel-popup */}
      <Dialog
        open={!!openParticipant}
        title={openParticipant ? nameOf(openParticipant) : ""}
        closeLabel={t("participants.closeProfile")}
        onClose={() => setOpenUserId(null)}
      >
        {openParticipant && (
          <>
            <ParticipantProfile
              profile={openParticipant.users}
              actions={renderActions(openParticipant)}
              footer={renderSafetyActions(openParticipant)}
            />
            {message && <StatusText tone="danger" className="mt-3">{message}</StatusText>}

            <ConfirmDialog
              open={confirmBlock}
              title={t("safety.blockTitle", { name: nameOf(openParticipant) })}
              confirmLabel={t("safety.block")}
              cancelLabel={t("match.cancel")}
              onConfirm={toggleBlock}
              onCancel={() => setConfirmBlock(false)}
              busy={blockBusy}
            >
              {t("safety.blockText", { name: nameOf(openParticipant) })}
            </ConfirmDialog>

            <ReportDialog
              target={reportTarget}
              reporterId={currentUserId}
              onClose={() => setReportTarget(null)}
              alreadyBlocked={!!reportTarget && myBlocks.has(reportTarget.userId)}
              onBlocked={(id) => setMyBlocks((prev) => new Set(prev).add(id))}
            />
          </>
        )}
      </Dialog>
    </div>
  )
}

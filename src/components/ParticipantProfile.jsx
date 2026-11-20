import { useT } from "../i18n/LanguageProvider"
import LanguageStickers from "./LanguageSticker"
import { knownGender, useMasterData } from "../masterData"

// Leeftijd in jaren uit een geboortedatum ("YYYY-MM-DD"); null als onbekend
function ageFrom(birthDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate ?? "")
  if (!m) return null
  const today = new Date()
  let age = today.getFullYear() - Number(m[1])
  const month = today.getMonth() + 1
  if (month < Number(m[2]) || (month === Number(m[2]) && today.getDate() < Number(m[3]))) age--
  return age >= 0 ? age : null
}

const PRS = [
  ["pr_swim_1000m", "profile.prSwim1000"],
  ["pr_bike_40km", "profile.prBike40"],
  ["pr_run_5km", "profile.prRun5"],
  ["pr_run_10km", "profile.prRun10"],
]

function Section({ title, children }) {
  return (
    <section className="border-t border-line pt-4">
      <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted">{title}</h3>
      {children}
    </section>
  )
}

function DetailList({ rows }) {
  const visible = rows.filter(([, value]) => value !== null && value !== undefined && value !== "")
  if (visible.length === 0) return null
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {visible.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted">{label}</dt>
          <dd className="font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Inhoud van de profiel-popup. Alleen velden uit public_profiles (privévelden zijn daar al leeg
// als de gebruiker ze niet vrijgeeft). Lege velden worden weggelaten.
export default function ParticipantProfile({ profile, actions, footer }) {
  const { t } = useT()
  const { label } = useMasterData()
  const p = profile || {}

  const age = ageFrom(p.birth_date)
  const gender = knownGender(p.gender)
  const languages = Array.isArray(p.languages) ? p.languages : []

  const goals = [
    p.open_for_training && t("profile.openForTraining"),
    p.open_for_travel && t("profile.openForTravel"),
    p.open_for_accommodation && t("profile.openForAccommodation"),
  ].filter(Boolean)

  const prs = PRS.filter(([key]) => p[key]).map(([key, textKey]) => [t(textKey), p[key]])

  return (
    <div className="space-y-4">
      <DetailList
        rows={[
          [t("profile.location"), [p.location, p.country_code].filter(Boolean).join(", ")],
          [t("profile.level"), p.experience_level ? label("levels", p.experience_level) : null],
          [t("profile.preferredDistance"), p.preferred_distance],
          [t("participantProfile.age"), age],
          [t("profile.gender"), gender ? label("genders", gender) : null],
        ]}
      />

      {languages.length > 0 && (
        <Section title={t("profile.languages")}>
          <LanguageStickers codes={languages} />
        </Section>
      )}

      {p.bio && (
        <Section title={t("profile.bio")}>
          <p className="whitespace-pre-line text-sm">{p.bio}</p>
        </Section>
      )}

      {(goals.length > 0 || p.training_preference) && (
        <Section title={t("participantProfile.goals")}>
          {goals.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <li key={goal} className="rounded-control bg-link-soft px-2.5 py-1 text-xs font-bold text-link">
                  {goal}
                </li>
              ))}
            </ul>
          )}
          {p.training_preference && (
            <p className="mt-3 text-sm">
              <span className="text-muted">{t("profile.trainingPreference")}: </span>
              <span className="font-semibold">{p.training_preference}</span>
            </p>
          )}
        </Section>
      )}

      {prs.length > 0 && (
        <Section title={t("participantProfile.prs")}>
          <DetailList rows={prs} />
        </Section>
      )}

      {actions && <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">{actions}</div>}

      {/* Blokkeren / melden */}
      {footer && <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4">{footer}</div>}
    </div>
  )
}

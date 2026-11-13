import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Button, Card, Checkbox, Field, Input, PageContainer, Select, StatusText, Textarea } from './components/ui'
import { useT } from './i18n/LanguageProvider'
import { LEVELS, levelLabel } from './i18n/labels'

// Standaardwaarden van het formulier (sleutels = kolommen in tabel users)
const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  birth_date: '',
  show_birthdate: false,
  gender: '-',
  show_gender_public: true,
  location: '',
  country_code: 'NL',
  languages: '',
  bio: '',
  experience_level: 'beginner',
  preferred_distance: '',
  open_for_buddy: true,
  open_for_training: false,
  training_preference: '',
  open_for_travel: false,
  open_for_accommodation: false,
  pr_swim_1000m: '',
  pr_bike_40km: '',
  pr_run_5km: '',
  pr_run_10km: '',
  show_prs_public: false
}

// [kolom, tekstsleutel]
const PR_FIELDS = [
  ['pr_swim_1000m', 'profile.prSwim1000'],
  ['pr_bike_40km', 'profile.prBike40'],
  ['pr_run_5km', 'profile.prRun5'],
  ['pr_run_10km', 'profile.prRun10']
]

// [opgeslagen waarde, tekstsleutel]
const GENDERS = [
  ['M', 'genders.M'],
  ['V', 'genders.V'],
  ['-', 'genders.none']
]

// PR-tijd als uu:mm:ss
const PR_PATTERN = /^\d{1,2}:[0-5]\d:[0-5]\d$/

function Section({ title, children }) {
  return (
    <Card>
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

export default function ProfileForm({ profileDirty, setProfileDirty }) {
  const { t } = useT()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { tone, text }

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setProfileDirty(true)
  }

  const text = (name) => ({
    value: form[name],
    onChange: (e) => updateField(name, e.target.value)
  })

  const check = (name) => ({
    type: 'checkbox',
    checked: form[name],
    onChange: (e) => updateField(name, e.target.checked)
  })

  // ✅ Profielgegevens inladen bij openen formulier
  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData?.user?.id
      if (!userId) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Fout bij ophalen profiel:', error.message)
        return
      }

      if (data) {
        const loaded = {}
        for (const key of Object.keys(EMPTY_FORM)) {
          loaded[key] = data[key] ?? EMPTY_FORM[key]
        }
        loaded.languages = (data.languages || []).join(', ')
        setForm(loaded)
        setProfileDirty(false) // 🔥 BELANGRIJK: geladen data = clean
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)

    const invalidPr = PR_FIELDS.find(
      ([name]) => form[name].trim() && !PR_PATTERN.test(form[name].trim())
    )
    if (invalidPr) {
      setStatus({ tone: 'danger', text: t('profile.prInvalid', { label: t(invalidPr[1]) }) })
      return
    }

    setLoading(true)

    const { data, error: userError } = await supabase.auth.getUser()
    const userId = data?.user?.id

    if (!userId) {
      setStatus({ tone: 'danger', text: t('profile.notAuthenticated') })
      setLoading(false)
      return
    }

    // Lege tekstvelden opslaan als null (lege datum/interval geeft anders een fout)
    const payload = {}
    for (const [key, value] of Object.entries(form)) {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        payload[key] = trimmed === '' ? null : trimmed
      } else {
        payload[key] = value
      }
    }

    const languages = form.languages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)
    payload.languages = languages.length ? languages : null

    const { error } = await supabase
      .from('users')
      .upsert({
        ...payload,
        id: userId,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setStatus({ tone: 'danger', text: t('profile.saveFailed', { message: error.message }) })
    } else {
      setStatus({ tone: 'success', text: t('profile.saved') })
      setProfileDirty(false) // ✅ PROFIEL IS WEER CLEAN
    }

    setLoading(false)
  }

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('profile.title')}</h1>

        <Section title={t('profile.sectionAbout')}>
          <Field label={t('profile.firstName')}>
            <Input {...text('first_name')} required />
          </Field>
          <Field label={t('profile.lastName')}>
            <Input {...text('last_name')} required />
          </Field>

          <Field label={t('profile.email')}>
            <Input type="email" {...text('email')} />
          </Field>
          <div className="space-y-2">
            <Field label={t('profile.birthDate')}>
              <Input type="date" {...text('birth_date')} />
            </Field>
            <Checkbox label={t('profile.showBirthdate')} {...check('show_birthdate')} />
          </div>

          <div className="space-y-2">
            <Field label={t('profile.gender')}>
              <Select {...text('gender')}>
                {GENDERS.map(([value, key]) => (
                  <option key={value} value={value}>{t(key)}</option>
                ))}
              </Select>
            </Field>
            <Checkbox label={t('profile.showGender')} {...check('show_gender_public')} />
          </div>
          <Field label={t('profile.location')}>
            <Input {...text('location')} />
          </Field>

          <Field label={t('profile.countryCode')}>
            <Input {...text('country_code')} required />
          </Field>
          <Field label={t('profile.languages')} hint={t('profile.languagesHint')}>
            <Input {...text('languages')} placeholder={t('profile.languagesPlaceholder')} />
          </Field>

          <Field label={t('profile.bio')} className="sm:col-span-2">
            <Textarea {...text('bio')} rows={4} />
          </Field>

          <Field label={t('profile.photo')}>
            <Input disabled placeholder={t('profile.photoLater')} />
          </Field>
        </Section>

        <Section title={t('profile.sectionSport')}>
          <Field label={t('profile.level')}>
            <Select {...text('experience_level')}>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{levelLabel(t, level)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('profile.preferredDistance')}>
            <Input {...text('preferred_distance')} />
          </Field>
        </Section>

        <Section title={t('profile.sectionBuddy')}>
          <Checkbox label={t('profile.openForBuddy')} {...check('open_for_buddy')} className="sm:col-span-2" />
          <div className="space-y-3">
            <Checkbox label={t('profile.openForTraining')} {...check('open_for_training')} />
            <Field label={t('profile.trainingPreference')}>
              <Input {...text('training_preference')} />
            </Field>
          </div>
          <div className="space-y-3">
            <Checkbox label={t('profile.openForTravel')} {...check('open_for_travel')} />
            <Checkbox label={t('profile.openForAccommodation')} {...check('open_for_accommodation')} />
          </div>
        </Section>

        <Section title={t('profile.sectionPrs')}>
          {PR_FIELDS.map(([name, key]) => (
            <Field key={name} label={t(key)}>
              <Input {...text(name)} placeholder="00:00:00" />
            </Field>
          ))}
          <Checkbox label={t('profile.showPrs')} {...check('show_prs_public')} className="sm:col-span-2" />
        </Section>

        {/* Vaste opslaanbalk — op mobiel boven de tabbalk */}
        <div
          className={
            'sticky bottom-[calc(var(--height-bottom-nav)+env(safe-area-inset-bottom))] md:bottom-0 ' +
            '-mx-4 flex items-center justify-between gap-3 border-t border-line bg-page/95 px-4 py-3 ' +
            'backdrop-blur sm:-mx-6 sm:px-6'
          }
        >
          <div className="min-w-0">
            {status ? (
              <StatusText tone={status.tone}>{status.text}</StatusText>
            ) : (
              profileDirty && (
                <StatusText tone="danger">
                  <span className="md:hidden">{t('profile.unsavedShort')}</span>
                  <span className="hidden md:inline">{t('profile.unsaved')}</span>
                </StatusText>
              )
            )}
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? t('profile.saving') : t('profile.save')}
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}

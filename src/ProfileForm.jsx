import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  Button, Card, Checkbox, ConfirmDialog, Field, Input, PageContainer, Select, StatusText, Textarea,
} from './components/ui'
import { useT } from './i18n/LanguageProvider'
import BlockedUsers from './components/BlockedUsers'
import LanguageStickers from './components/LanguageSticker'
import { fetchUserLanguages, saveMyLanguages } from './languages'
import { GENDER_UNSPECIFIED, useMasterData } from './masterData'

// Velden die pas bestaan na een SQL-script (punt 9: privacy-safety.sql, punt 3: languages.sql).
// Zonder die kolommen worden ze niet getoond en niet opgeslagen.
const OPTIONAL_FIELDS = ['is_hidden', 'visible_to', 'buddy_gender_pref']

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
  show_prs_public: false,
  is_hidden: false,
  visible_to: 'all',
  buddy_gender_pref: 'any'
}

// [kolom, tekstsleutel]
const PR_FIELDS = [
  ['pr_swim_1000m', 'profile.prSwim1000'],
  ['pr_bike_40km', 'profile.prBike40'],
  ['pr_run_5km', 'profile.prRun5'],
  ['pr_run_10km', 'profile.prRun10']
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

export default function ProfileForm({ session, profileDirty, setProfileDirty }) {
  const { t } = useT()
  const { active, label } = useMasterData()
  const [supportedFields, setSupportedFields] = useState(new Set(OPTIONAL_FIELDS))
  const privacySupported = supportedFields.has('is_hidden') && supportedFields.has('visible_to')
  const genderPrefSupported = supportedFields.has('buddy_gender_pref')
  const allLanguages = active('languages').map((l) => l.code) // leeg = tabel nog niet geladen
  const genders = active('genders')
  const realGenders = genders.filter((g) => g.code !== GENDER_UNSPECIFIED) // voor filter-achtige keuzes
  const [myLanguages, setMyLanguages] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { tone, text }
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)

  // Account verwijderen = vlag is_deleted zetten (functie delete_my_account), daarna uitloggen
  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteFailed(false)

    const { error } = await supabase.rpc('delete_my_account')

    if (error) {
      console.error('[ACCOUNT] delete failed', error)
      setDeleting(false)
      setConfirmDelete(false)
      setDeleteFailed(true)
      return
    }

    console.info('[ACCOUNT] account marked as deleted')
    await supabase.auth.signOut()
    window.location.assign('/')
  }

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setProfileDirty(true)
  }

  const toggleLanguage = (code) => {
    setMyLanguages((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
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
        setSupportedFields(new Set(OPTIONAL_FIELDS.filter((key) => key in data)))
        const loaded = {}
        for (const key of Object.keys(EMPTY_FORM)) {
          loaded[key] = data[key] ?? EMPTY_FORM[key]
        }
        setForm(loaded)
        setProfileDirty(false) // 🔥 BELANGRIJK: geladen data = clean
      }

      // Eigen talen (punt 3); de lijst met talen komt uit de stamtabel
      const mine = await fetchUserLanguages([userId])
      setMyLanguages(mine?.get(userId) ?? [])
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

    for (const key of OPTIONAL_FIELDS) {
      if (!supportedFields.has(key)) delete payload[key]
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        ...payload,
        id: userId,
        updated_at: new Date().toISOString()
      })

    // Talen apart opslaan (koppeltabel), pas nadat het profiel bestaat
    const languagesSaved =
      error || allLanguages.length === 0 ? true : await saveMyLanguages(userId, myLanguages)

    if (error) {
      setStatus({ tone: 'danger', text: t('profile.saveFailed', { message: error.message }) })
    } else if (!languagesSaved) {
      setStatus({ tone: 'danger', text: t('profile.languagesSaveFailed') })
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
                {genders.map((g) => (
                  <option key={g.code} value={g.code}>{label('genders', g.code)}</option>
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
          {allLanguages.length > 0 && (
            <div className="space-y-2">
              {/* Keuzelijst zonder de al gekozen talen; na kiezen terug op "Taal toevoegen…" */}
              <Field label={t('profile.languages')} hint={t('profile.languagesHint')}>
                <Select
                  value=""
                  onChange={(e) => e.target.value && toggleLanguage(e.target.value)}
                >
                  <option value="">{t('profile.languageAdd')}</option>
                  {allLanguages.filter((c) => !myLanguages.includes(c)).map((code) => (
                    <option key={code} value={code}>{label('languages', code)}</option>
                  ))}
                </Select>
              </Field>
              {myLanguages.length > 0 ? (
                <LanguageStickers codes={myLanguages} onRemove={toggleLanguage} />
              ) : (
                <p className="text-xs text-muted">{t('profile.languagesNone')}</p>
              )}
            </div>
          )}

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
              {active('levels').map((level) => (
                <option key={level.code} value={level.code}>{label('levels', level.code)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('profile.preferredDistance')}>
            <Input {...text('preferred_distance')} />
          </Field>
        </Section>

        <Section title={t('profile.sectionBuddy')}>
          <div className="space-y-1 sm:col-span-2">
            <Checkbox label={t('profile.openForBuddy')} {...check('open_for_buddy')} />
            <p className="text-xs text-muted">{t('privacy.openForBuddyHint')}</p>
          </div>
          {genderPrefSupported && (
            <Field
              label={t('profile.buddyGenderPref')}
              hint={t('profile.buddyGenderPrefHint')}
              className="sm:col-span-2"
            >
              <Select {...text('buddy_gender_pref')}>
                <option value="any">{t('profile.buddyGenderAny')}</option>
                {realGenders.map((g) => (
                  <option key={g.code} value={g.code}>{label('genders', g.code)}</option>
                ))}
              </Select>
            </Field>
          )}
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

        {privacySupported && (
          <Section title={t('privacy.title')}>
            <div className="space-y-1 sm:col-span-2">
              <Checkbox label={t('privacy.hidden')} {...check('is_hidden')} />
              <p className="text-xs text-muted">{t('privacy.hiddenHint')}</p>
            </div>
            <Field
              label={t('privacy.visibleTo')}
              hint={form.visible_to !== 'all' ? t('privacy.visibleToHint') : undefined}
              className="sm:col-span-2"
            >
              <Select {...text('visible_to')}>
                <option value="all">{t('privacy.visibleAll')}</option>
                {realGenders.map((g) => (
                  <option key={g.code} value={g.code}>
                    {t('privacy.visibleOnly', { name: label('genders', g.code) })}
                  </option>
                ))}
              </Select>
            </Field>
          </Section>
        )}

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

      {/* Geblokkeerde gebruikers */}
      <Card className="mt-10 space-y-3">
        <h2 className="text-lg font-bold">{t('safety.blockedTitle')}</h2>
        <BlockedUsers userId={session?.user?.id} />
      </Card>

      {/* Account verwijderen */}
      <Card className="mt-6 space-y-3 border-danger/40">
        <h2 className="text-lg font-bold">{t('account.deleteTitle')}</h2>
        <p className="text-sm text-muted">{t('account.deleteIntro')}</p>
        {deleteFailed && <StatusText tone="danger">{t('account.deleteFailed')}</StatusText>}
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          {t('account.deleteButton')}
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title={t('account.confirmTitle')}
        confirmLabel={deleting ? t('account.deleting') : t('account.confirm')}
        cancelLabel={t('match.cancel')}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
        busy={deleting}
      >
        {t('account.confirmText')}
      </ConfirmDialog>
    </PageContainer>
  )
}

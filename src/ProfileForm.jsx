import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

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

const PR_FIELDS = [
  ['pr_swim_1000m', 'Zwemmen 1000 m'],
  ['pr_bike_40km', 'Fietsen 40 km'],
  ['pr_run_5km', 'Lopen 5 km'],
  ['pr_run_10km', 'Lopen 10 km']
]

// PR-tijd als uu:mm:ss
const PR_PATTERN = /^\d{1,2}:[0-5]\d:[0-5]\d$/

const rowStyle = { display: 'block', marginTop: '8px' }
const fieldsetStyle = { marginTop: '16px' }

export default function ProfileForm({ profileDirty, setProfileDirty }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

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
      setStatus(`PR ${invalidPr[1]}: gebruik het formaat uu:mm:ss`)
      return
    }

    setLoading(true)

    const { data, error: userError } = await supabase.auth.getUser()
    const userId = data?.user?.id

    if (!userId) {
      setStatus('User not authenticated.')
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
      setStatus('Fout bij opslaan: ' + error.message)
    } else {
      setStatus('Profiel opgeslagen!')
      setProfileDirty(false) // ✅ PROFIEL IS WEER CLEAN
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Mijn Profiel</h2>

      <fieldset style={fieldsetStyle}>
        <legend>Over mij</legend>

        <label style={rowStyle}>
          Voornaam: <input {...text('first_name')} required />
        </label>

        <label style={rowStyle}>
          Achternaam: <input {...text('last_name')} required />
        </label>

        <label style={rowStyle}>
          E-mail: <input type="email" {...text('email')} />
        </label>

        <label style={rowStyle}>
          Geboortedatum: <input type="date" {...text('birth_date')} />
        </label>
        <label style={rowStyle}>
          <input {...check('show_birthdate')} /> Geboortedatum tonen aan anderen
        </label>

        <label style={rowStyle}>
          Geslacht:{' '}
          <select {...text('gender')}>
            <option value="M">M</option>
            <option value="V">V</option>
            <option value="-">-</option>
          </select>
        </label>
        <label style={rowStyle}>
          <input {...check('show_gender_public')} /> Geslacht tonen aan anderen
        </label>

        <label style={rowStyle}>
          Woonplaats: <input {...text('location')} />
        </label>

        <label style={rowStyle}>
          Landcode: <input {...text('country_code')} required />
        </label>

        <label style={rowStyle}>
          Talen (gescheiden door komma's):{' '}
          <input {...text('languages')} placeholder="Nederlands, Engels" />
        </label>

        <label style={rowStyle}>
          Bio:
          <br />
          <textarea {...text('bio')} rows={4} />
        </label>

        <label style={rowStyle}>
          Profielfoto: <input disabled placeholder="Komt later" />
        </label>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend>Sport</legend>

        <label style={rowStyle}>
          Niveau:{' '}
          <select {...text('experience_level')}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label style={rowStyle}>
          Voorkeursafstand: <input {...text('preferred_distance')} />
        </label>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend>Buddy</legend>

        <label style={rowStyle}>
          <input {...check('open_for_buddy')} /> Ik sta open voor een buddy
        </label>

        <label style={rowStyle}>
          <input {...check('open_for_training')} /> Samen trainen
        </label>
        <label style={rowStyle}>
          Trainingsvoorkeur: <input {...text('training_preference')} />
        </label>

        <label style={rowStyle}>
          <input {...check('open_for_travel')} /> Samen reizen
        </label>

        <label style={rowStyle}>
          <input {...check('open_for_accommodation')} /> Verblijf delen
        </label>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend>PR's (uu:mm:ss)</legend>

        {PR_FIELDS.map(([name, label]) => (
          <label key={name} style={rowStyle}>
            {label}: <input {...text(name)} placeholder="00:00:00" />
          </label>
        ))}

        <label style={rowStyle}>
          <input {...check('show_prs_public')} /> PR's tonen aan anderen
        </label>
      </fieldset>

      {profileDirty && (
        <p style={{ color: "#c0392b", fontSize: "0.9em" }}>
          ⚠️ Wijzigingen zijn pas actief na opslaan
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Opslaan...' : 'Profiel opslaan'}
      </button>

      {status && <p>{status}</p>}
    </form>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button, Card, Field, Input, LanguageSwitch, Logo, StatusText } from './ui'
import { useT } from '../i18n/LanguageProvider'

export default function Login() {
  const { t, formatDate } = useT()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // { tone, text }

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus(null)
    setSending(true)
    // Terug naar de plek van aanvragen (localhost of Vercel); moet in Supabase bij Redirect URLs staan
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setSending(false)
    if (error) setStatus({ tone: 'danger', text: t('login.failed', { message: error.message }) })
    else setStatus({ tone: 'success', text: t('login.sent') })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitch />
      </div>

      <Card as="form" onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">{t('login.title')}</h1>
        <Field label={t('login.emailLabel')}>
          <Input
            type="email"
            required
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? t('login.sending') : t('login.submit')}
        </Button>
        {status && <StatusText tone={status.tone}>{status.text}</StatusText>}
      </Card>

      <p className="mt-4 text-xs text-muted">
        v{__APP_VERSION__} · {__APP_COMMIT__} ·{' '}
        {formatDate(new Date(__APP_BUILD_TIME__), { dateStyle: 'short', timeStyle: 'short' })}
      </p>
    </div>
  )
}

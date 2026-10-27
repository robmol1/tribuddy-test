import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Check je e-mail voor de login link!')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Log in bij TriBuddy</h2>
        <input
          className="border p-2 w-full mb-4"
          type="email"
          placeholder="jouw@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Verzend magic link</button>
      </form>
      <p className="mt-4 text-xs text-gray-400">
        v{__APP_VERSION__} · {__APP_COMMIT__} ·{' '}
        {new Date(__APP_BUILD_TIME__).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
      </p>
    </div>
  )
}


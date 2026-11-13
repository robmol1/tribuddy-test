import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { supabase } from "./supabaseClient"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import LandingPage from "./components/landing/LandingPage"

export default function App() {
  // undefined = sessie wordt nog opgehaald, null = niet ingelogd
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // 1. Huidige sessie ophalen
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // 2. Luisteren op login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    // Cleanup
    return () => listener.subscription.unsubscribe()
  }, [])

  // Nog aan het laden → niets tonen (voorkomt dat landingspagina even zichtbaar is)
  if (session === undefined) return null

  return (
    <BrowserRouter>
      {session ? (
        // Ingelogd → dashboard + session object
        <Dashboard session={session} />
      ) : (
        // Niet ingelogd → landingspagina en login; overige adressen naar /
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

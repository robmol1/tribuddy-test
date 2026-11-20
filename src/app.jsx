import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { supabase } from "./supabaseClient"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import LandingPage from "./components/landing/LandingPage"
import DeletedAccount from "./components/DeletedAccount"
import { MasterDataProvider } from "./masterData"

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

  // Is het eigen account verwijderd of geschorst? (blocked: undefined = nog aan het controleren)
  const userId = session?.user?.id
  const [accountFor, setAccountFor] = useState({ userId: null, blocked: undefined })

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    // select("*"): werkt ook als een kolom (bijv. is_suspended) nog niet bestaat
    supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error("[AUTH] account check failed", error)
        // Nog geen profiel of fout → gewoon doorgaan
        const blocked = data?.is_deleted ? "deleted" : data?.is_suspended ? "suspended" : null
        setAccountFor({ userId, blocked })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // Nog aan het laden → niets tonen (voorkomt dat landingspagina even zichtbaar is)
  if (session === undefined) return null
  if (session && accountFor.userId !== userId) return null
  if (session && accountFor.blocked) return <DeletedAccount kind={accountFor.blocked} />

  return (
    <BrowserRouter>
      {session ? (
        // Ingelogd → dashboard + session object
        <MasterDataProvider>
          <Dashboard session={session} />
        </MasterDataProvider>
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

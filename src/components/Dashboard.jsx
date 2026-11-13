import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from "../supabaseClient"
import EventsList from "./EventsList"
import EventDetail from "./EventDetail"
import ProfileForm from "../ProfileForm"
import Home from "../Home"
import UiShowcase from "./UiShowcase"
import { useState } from "react"
import {
  Button, TopBar, TopBarLink, BottomNav, BottomNavLink, LanguageSwitch,
  PageContainer, StatusText, HomeIcon, CalendarIcon, UserIcon,
} from "./ui"
import { useT } from "../i18n/LanguageProvider"


export default function Dashboard({ session }) {
  const [profileDirty, setProfileDirty] = useState(false)
  const [logoutFailed, setLogoutFailed] = useState(false)
  const { t } = useT()

  const handleLogout = async () => {
    setLogoutFailed(false)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[AUTH] logout failed", error)
      setLogoutFailed(true)
      return
    }

    console.info("[AUTH] user logged out")
    window.location.reload()
  }

  // Router staat in app.jsx
  return (
    <>
      {/* ⭐ Topbar (links op desktop) */}
      <TopBar
        actions={
          <>
            <LanguageSwitch />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t("nav.logout")}
            </Button>
          </>
        }
      >
        <TopBarLink to="/" end>{t("nav.home")}</TopBarLink>
        <TopBarLink to="/events">{t("nav.events")}</TopBarLink>
        <TopBarLink to="/profile">{t("nav.profile")}</TopBarLink>
      </TopBar>

      {logoutFailed && (
        <PageContainer className="py-3">
          <StatusText tone="danger">{t("nav.logoutFailed")}</StatusText>
        </PageContainer>
      )}

      {/* ⭐ Router — onderaan ruimte voor de mobiele tabbalk */}
      <main className="pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route
            path="/profile"
            element={
              <ProfileForm
                session={session}
                profileDirty={profileDirty}
                setProfileDirty={setProfileDirty}
              />
            }
          />
          <Route path="/events" element={<EventsList session={session} />} />
          <Route path="/events/:id" element={<EventDetail session={session} />} />
          <Route path="/ui" element={<UiShowcase />} />
          {/* Al ingelogd → login niet nodig */}
          <Route path="/login" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ⭐ Tabbalk (alleen mobiel) */}
      <BottomNav label={t("nav.main")}>
        <BottomNavLink to="/" end icon={<HomeIcon />}>{t("nav.home")}</BottomNavLink>
        <BottomNavLink to="/events" icon={<CalendarIcon />}>{t("nav.events")}</BottomNavLink>
        <BottomNavLink to="/profile" icon={<UserIcon />}>{t("nav.profile")}</BottomNavLink>
      </BottomNav>
    </>
  )
}

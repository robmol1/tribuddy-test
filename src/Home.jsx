import { Link } from "react-router-dom"
import { Card, PageContainer, CalendarIcon, UserIcon } from "./components/ui"
import { useT } from "./i18n/LanguageProvider"
import MyEvents from "./components/MyEvents"

function ShortcutCard({ to, icon, title, text }) {
  return (
    <Card as={Link} to={to} className="block transition hover:-translate-y-0.5 hover:border-link">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-control bg-link-soft text-link">
        {icon}
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{text} →</p>
    </Card>
  )
}

export default function Home({ session }) {
  const { t } = useT()

  return (
    <PageContainer className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("home.title")}</h1>
        {session?.user ? (
          <p className="mt-2 text-muted">
            {t("home.loggedInAs")} <strong className="text-ink">{session.user.email}</strong>
          </p>
        ) : (
          <p className="mt-2 text-muted">{t("home.notLoggedIn")}</p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <ShortcutCard
          to="/events"
          icon={<CalendarIcon className="h-5 w-5" />}
          title={t("home.eventsTitle")}
          text={t("home.eventsText")}
        />
        <ShortcutCard
          to="/profile"
          icon={<UserIcon className="h-5 w-5" />}
          title={t("home.profileTitle")}
          text={t("home.profileText")}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold tracking-tight">{t("myEvents.title")}</h2>
        <MyEvents session={session} />
      </section>
    </PageContainer>
  )
}

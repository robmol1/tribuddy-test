import { Link } from "react-router-dom"
import { Button, LanguageSwitch, Logo } from "../ui"
import { useT } from "../../i18n/LanguageProvider"

const ANCHORS = [
  ["#race-buddy", "landing.nav.raceBuddy"],
  ["#verhalen", "landing.nav.stories"],
  ["#training-buddy", "landing.nav.trainingBuddy"],
  ["#kalender", "landing.nav.calendar"],
  ["#startersgids", "landing.nav.guide"],
]

export default function LandingTopBar() {
  const { t } = useT()

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-page">
      <div className="mx-auto flex h-[66px] max-w-shell items-center gap-3 px-4 sm:h-[72px] sm:px-6 md:h-[82px] md:gap-6">
        <Link to="/">
          <Logo />
        </Link>

        {/* Ankerlinks — verborgen op mobiel, zoals in preview v3 */}
        <nav className="ml-auto hidden items-center gap-[clamp(13px,2.3vw,30px)] md:flex">
          {ANCHORS.map(([href, key]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-xs font-bold text-muted transition hover:text-action"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-4 md:ml-0">
          <Link
            to="/login"
            className="whitespace-nowrap text-xs font-bold text-muted transition hover:text-action"
          >
            {t("landing.nav.login")}
          </Link>
          <Button as={Link} to="/login?intent=join" size="sm" className="sm:min-h-11 sm:px-5 sm:text-sm">
            {t("landing.nav.join")} →
          </Button>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  )
}

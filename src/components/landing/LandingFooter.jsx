import { Link } from "react-router-dom"
import { Logo } from "../ui"
import { useT } from "../../i18n/LanguageProvider"

const LINK_CLASS = "text-[11px] font-semibold text-muted hover:text-ink sm:text-xs"

export default function LandingFooter() {
  const { t } = useT()

  return (
    <footer className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-5 border-t border-line px-4 py-6 sm:flex-nowrap sm:px-6">
      <Link to="/">
        <Logo />
      </Link>
      <p className="order-3 w-full text-xs text-muted sm:order-none sm:w-auto">
        {t("landing.footer.tagline")}
      </p>
      <div className="flex gap-3 sm:gap-[18px]">
        <a href="#kalender" className={LINK_CLASS}>{t("landing.nav.calendar")}</a>
        <a href="#startersgids" className={LINK_CLASS}>{t("landing.nav.guide")}</a>
        <Link to="/login" className={LINK_CLASS}>{t("landing.nav.login")}</Link>
      </div>
    </footer>
  )
}

import { Link } from "react-router-dom"
import { Button } from "../ui"
import { useT } from "../../i18n/LanguageProvider"
import heroImage from "../../assets/landing-hero.jpg"

export default function Hero() {
  const { t } = useT()

  return (
    <section className="relative h-[75svh] min-h-[535px] overflow-hidden bg-navy sm:h-[72svh] sm:min-h-[520px] md:h-[min(700px,calc(100svh_-_82px))]">
      <img
        src={heroImage}
        alt={t("landing.hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover object-[57%_center] sm:object-[center_46%]"
      />
      <div className="absolute inset-0 bg-hero-overlay" aria-hidden="true" />

      <div className="relative z-[1] mx-auto flex h-full max-w-shell flex-col items-start justify-center px-4 text-on-dark sm:px-6">
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[.17em] text-on-dark-accent">
          {t("landing.hero.kicker")}
        </p>
        <h1 className="max-w-[760px] text-[clamp(55px,9vw,108px)] font-extrabold leading-[.91] tracking-[-.075em]">
          {t("landing.hero.title1")}
          <br />
          {t("landing.hero.title2")}
        </h1>
        <p className="my-6 max-w-[535px] text-[15px] leading-[1.65] text-on-dark/90 sm:text-[clamp(16px,1.7vw,19px)]">
          {t("landing.hero.text")}
        </p>
        <Button as={Link} to="/login?intent=join" size="lg">
          {t("landing.hero.cta")} →
        </Button>
        <p className="mt-5 text-xs text-on-dark/85">
          <strong className="text-on-dark">{t("landing.hero.trustStrong")}</strong>{" "}
          {t("landing.hero.trust")}
        </p>
      </div>
    </section>
  )
}

import { Link } from "react-router-dom"
import { Button } from "../ui"
import { useT } from "../../i18n/LanguageProvider"
import finishImage from "../../assets/landing-finish.jpg"

export default function FinishSection() {
  const { t } = useT()

  return (
    <section className="relative overflow-hidden bg-finish text-on-dark">
      {/* Decoratieve cirkels */}
      <div aria-hidden="true" className="absolute right-[8%] -top-20 h-[560px] w-[560px] rounded-full border border-on-dark/15" />
      <div aria-hidden="true" className="absolute right-[13%] -top-4 h-[430px] w-[430px] rounded-full border border-on-dark/15" />

      <div className="relative z-[1] mx-auto flex max-w-shell flex-col items-start gap-6 px-4 pt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-6 sm:pt-0 md:min-h-[520px]">
        <div className="max-w-[680px]">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-on-dark-accent">
            {t("landing.finish.eyebrow")}
          </p>
          <h2 className="text-[39px] font-extrabold leading-[1.04] tracking-[-.06em] sm:text-[clamp(36px,5vw,58px)]">
            {t("landing.finish.title")}
          </h2>
          <p className="mb-6 mt-4 text-[15px] text-on-dark-muted">{t("landing.finish.text")}</p>
          <Button as={Link} to="/login?intent=join">
            {t("landing.finish.cta")} →
          </Button>
        </div>
        <img
          src={finishImage}
          alt={t("landing.finish.imageAlt")}
          className="max-h-[440px] w-full object-contain object-center sm:h-[520px] sm:max-h-none sm:w-[min(43vw,500px)] sm:self-stretch sm:object-right"
        />
      </div>
    </section>
  )
}

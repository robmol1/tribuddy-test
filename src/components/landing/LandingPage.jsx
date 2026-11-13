import { useT } from "../../i18n/LanguageProvider"
import LandingTopBar from "./LandingTopBar"
import Hero from "./Hero"
import StepsSection from "./StepsSection"
import CalendarSection from "./CalendarSection"
import StoriesSection from "./StoriesSection"
import FinishSection from "./FinishSection"
import LandingFooter from "./LandingFooter"

// Drie stappen uit de teksten van een sectie (step1Title/step1Text … step3)
const stepsFor = (t, section) =>
  [1, 2, 3].map((n) => ({
    title: t(`landing.${section}.step${n}Title`),
    text: t(`landing.${section}.step${n}Text`),
  }))

// Publieke landingspagina (niet ingelogd) — gebaseerd op preview v3
export default function LandingPage() {
  const { t } = useT()

  return (
    <>
      <LandingTopBar />
      <main>
        <Hero />

        <StepsSection
          id="race-buddy"
          background="surface"
          eyebrow={t("landing.race.eyebrow")}
          title={t("landing.race.title")}
          intro={t("landing.race.intro")}
          steps={stepsFor(t, "race")}
        />

        <StepsSection
          id="startersgids"
          background="page"
          eyebrow={t("landing.guide.eyebrow")}
          title={t("landing.guide.title")}
          intro={t("landing.guide.intro")}
          steps={stepsFor(t, "guide")}
        />

        <StepsSection
          id="training-buddy"
          background="dark"
          eyebrow={t("landing.training.eyebrow")}
          title={t("landing.training.title")}
          intro={t("landing.training.intro")}
          steps={stepsFor(t, "training")}
        />

        <CalendarSection />

        <StoriesSection />

        <section className="py-[62px] text-center md:py-[82px]">
          <div className="mx-auto max-w-shell px-4 sm:px-6">
            <blockquote className="mx-auto max-w-[920px] text-[clamp(29px,4.7vw,53px)] font-extrabold leading-[1.07] tracking-[-.06em] text-navy">
              {t("landing.quote.text")}
            </blockquote>
            <p className="mx-auto mt-5 max-w-[750px] text-[13px] leading-[1.75] text-muted sm:text-sm">
              {t("landing.quote.sub")}
            </p>
          </div>
        </section>

        <FinishSection />
      </main>
      <LandingFooter />
    </>
  )
}

import { Link } from "react-router-dom"
import { useT } from "../../i18n/LanguageProvider"
import SectionHead from "./SectionHead"

function StoryCard({ variant = "default", label, title, text, link }) {
  const feature = variant === "feature"
  const locked = variant === "locked"

  return (
    <article
      className={
        "relative flex min-h-[210px] flex-col items-start justify-end overflow-hidden rounded-card border border-line p-6 sm:min-h-[265px] " +
        (feature ? "bg-feature text-on-dark sm:col-span-2 md:col-span-1" : "bg-surface")
      }
    >
      {/* Decoratieve cirkels op de uitgelichte kaart */}
      {feature && (
        <div
          aria-hidden="true"
          className="absolute -right-[60px] -top-[95px] h-[230px] w-[230px] rounded-full border border-on-dark/20 shadow-[0_0_0_18px_rgb(var(--color-on-dark)/0.07),0_0_0_38px_rgb(var(--color-on-dark)/0.04)]"
        />
      )}
      {locked && (
        <span aria-hidden="true" className="absolute right-5 top-4 text-[15px]">🔒</span>
      )}

      <span
        className={
          "absolute left-[22px] top-[19px] text-[10px] font-extrabold uppercase tracking-[.13em] " +
          (feature ? "text-on-dark-accent" : "text-link")
        }
      >
        {label}
      </span>

      <h3 className="relative mb-2 text-[21px] font-bold leading-[1.2] tracking-[-.04em]">{title}</h3>
      <p className={`relative mb-[18px] text-[13px] leading-[1.6] ${feature ? "text-on-dark-muted" : "text-muted"}`}>
        {text}
      </p>
      {link}
    </article>
  )
}

const LINK_CLASS = "relative inline-flex items-center gap-2 text-xs font-extrabold"

export default function StoriesSection() {
  const { t } = useT()

  const loginLink = (
    <Link to="/login" className={`${LINK_CLASS} text-muted hover:text-ink`}>
      {t("landing.stories.loginLink")} →
    </Link>
  )

  return (
    <section id="verhalen" className="bg-page py-[60px] sm:py-[70px] md:py-[88px]">
      <div className="mx-auto max-w-shell px-4 sm:px-6">
        <SectionHead
          eyebrow={t("landing.stories.eyebrow")}
          title={t("landing.stories.title")}
          intro={t("landing.stories.intro")}
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <StoryCard
            variant="feature"
            label={t("landing.stories.featuredLabel")}
            title={t("landing.stories.featuredTitle")}
            text={t("landing.stories.featuredText")}
            link={
              <a href="#story-slot" className={`${LINK_CLASS} text-on-dark`}>
                {t("landing.stories.featuredLink")} →
              </a>
            }
          />
          <StoryCard
            variant="locked"
            label={t("landing.stories.membersLabel")}
            title={t("landing.stories.members1Title")}
            text={t("landing.stories.members1Text")}
            link={loginLink}
          />
          <StoryCard
            variant="locked"
            label={t("landing.stories.membersLabel")}
            title={t("landing.stories.members2Title")}
            text={t("landing.stories.members2Text")}
            link={loginLink}
          />
        </div>
        <div id="story-slot" className="h-px" />
      </div>
    </section>
  )
}

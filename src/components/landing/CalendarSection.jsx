import { useEffect, useState } from "react"
import { Button, EmptyState, Input, Select } from "../ui"
import { useT } from "../../i18n/LanguageProvider"
import SectionHead from "./SectionHead"

// Statische kalender: filters en lege staat. Koppeling met Supabase volgt later.
export default function CalendarSection() {
  const { t } = useT()
  const [modalOpen, setModalOpen] = useState(false)

  // Venster sluiten met Escape
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => e.key === "Escape" && setModalOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [modalOpen])

  return (
    <section id="kalender" className="bg-surface py-[60px] sm:py-[70px] md:py-[88px]">
      <div className="mx-auto max-w-shell px-4 sm:px-6">
        <SectionHead
          eyebrow={t("landing.calendar.eyebrow")}
          title={t("landing.calendar.title")}
          intro={t("landing.calendar.intro")}
        />

        <div className="mx-auto grid max-w-[1020px] overflow-hidden rounded-[18px] border border-line bg-page md:grid-cols-[minmax(0,1fr)_310px]">
          <div className="p-5 sm:p-8">
            <div className="mb-5 flex flex-wrap gap-2">
              <Input
                type="search"
                placeholder={t("landing.calendar.searchPlaceholder")}
                className="min-w-[120px] basis-full sm:flex-1 sm:basis-auto"
              />
              <Select className="flex-1 sm:w-[165px] sm:flex-none">
                <option>{t("landing.calendar.allDistances")}</option>
                <option>{t("landing.calendar.distanceSprint")}</option>
                <option>{t("landing.calendar.distanceOlympic")}</option>
                <option>{t("landing.calendar.distanceLong")}</option>
              </Select>
            </div>
            <EmptyState title={t("landing.calendar.emptyTitle")}>
              {t("landing.calendar.emptyText")}
            </EmptyState>
          </div>

          <aside className="flex flex-col items-start justify-center bg-navy p-6 text-on-dark sm:p-8">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.13em] text-on-dark-link">
              {t("landing.calendar.missingLabel")}
            </p>
            <h3 className="mb-2.5 text-[21px] font-bold leading-tight">
              {t("landing.calendar.missingTitle")}
            </h3>
            <p className="mb-5 text-[13px] leading-[1.65] text-on-dark-muted">
              {t("landing.calendar.missingText")}
            </p>
            <Button variant="outline-dark" size="sm" onClick={() => setModalOpen(true)}>
              {t("landing.calendar.suggest")} →
            </Button>
          </aside>
        </div>
      </div>

      {/* Venster "Wedstrijd doorgeven" — nog zonder formulier */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-navy/70 p-5"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-[440px] rounded-card bg-page p-7">
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight">{t("landing.calendar.suggest")}</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={t("landing.calendar.close")}
                className="text-2xl leading-none text-muted hover:text-ink"
              >
                ×
              </button>
            </div>
            <p className="mb-6 text-sm text-muted">{t("landing.calendar.comingSoon")}</p>
            <Button onClick={() => setModalOpen(false)}>{t("landing.calendar.modalOk")}</Button>
          </div>
        </div>
      )}
    </section>
  )
}

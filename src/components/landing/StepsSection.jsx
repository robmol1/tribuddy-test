import SectionHead from "./SectionHead"

const BACKGROUNDS = {
  page: "bg-page",
  surface: "bg-surface",
  dark: "bg-navy",
}

// Sectie met kop en drie genummerde kaarten. steps: [{ title, text }]
export default function StepsSection({ id, eyebrow, title, intro, steps, background = "page" }) {
  const dark = background === "dark"

  return (
    <section id={id} className={`py-[60px] sm:py-[70px] md:py-[88px] ${BACKGROUNDS[background]}`}>
      <div className="mx-auto max-w-shell px-4 sm:px-6">
        <SectionHead eyebrow={eyebrow} title={title} intro={intro} dark={dark} />

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className={
                "rounded-card border p-6 sm:min-h-[200px] " +
                (dark ? "border-on-dark/10 bg-on-dark/5" : "border-line bg-page")
              }
            >
              <div
                className={
                  "mb-5 grid h-10 w-10 place-items-center rounded-[13px] text-[13px] font-extrabold " +
                  (dark ? "bg-on-dark/10 text-on-dark-accent" : "bg-link-soft text-link")
                }
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className={`mb-2 text-[17px] font-bold ${dark ? "text-on-dark" : "text-ink"}`}>
                {step.title}
              </h3>
              <p className={`text-[13px] leading-[1.7] ${dark ? "text-on-dark-muted" : "text-muted"}`}>
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

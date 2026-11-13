// Gecentreerde sectiekop: eyebrow (klein label), titel en intro
export default function SectionHead({ eyebrow, title, intro, dark = false }) {
  return (
    <div className="mx-auto mb-7 max-w-[680px] text-center sm:mb-10">
      <p
        className={
          "mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] " +
          (dark ? "text-on-dark-link" : "text-link")
        }
      >
        {eyebrow}
      </p>
      <h2
        className={
          "text-[clamp(34px,4.1vw,51px)] font-extrabold leading-[1.04] tracking-[-.06em] " +
          (dark ? "text-on-dark" : "text-ink")
        }
      >
        {title}
      </h2>
      {intro && (
        <p
          className={
            "mx-auto mt-4 max-w-[570px] text-sm leading-[1.7] sm:text-[15px] " +
            (dark ? "text-on-dark-muted" : "text-muted")
          }
        >
          {intro}
        </p>
      )}
    </div>
  )
}

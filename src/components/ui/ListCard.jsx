// Compacte kaart voor lijsten: titel + subregel links, actie of status rechts
export default function ListCard({ title, meta, children, className = "" }) {
  return (
    <div
      className={
        "flex flex-wrap items-center justify-between gap-3 rounded-card border border-line " +
        `bg-page p-4 ${className}`
      }
    >
      <div className="min-w-0">
        <div className="font-bold text-ink">{title}</div>
        {meta && <div className="text-sm text-muted">{meta}</div>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

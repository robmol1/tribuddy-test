export default function EmptyState({ icon = "↗", title, children, action, className = "" }) {
  return (
    <div
      className={
        "flex min-h-[150px] flex-col items-center justify-center rounded-card border " +
        `border-dashed border-line p-6 text-center ${className}`
      }
    >
      <div className="mb-2.5 grid h-10 w-10 place-items-center rounded-control bg-link-soft font-extrabold text-link">
        {icon}
      </div>
      {title && <strong className="text-sm text-ink">{title}</strong>}
      {children && <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

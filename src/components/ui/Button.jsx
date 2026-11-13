const BASE =
  "inline-flex items-center justify-center gap-2 font-bold transition " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/40"

const VARIANTS = {
  // Oranje: alleen voor de belangrijkste actie op een scherm. Tekst is donker (kleurendocument).
  primary:
    "rounded-button bg-action text-ink shadow-cta hover:bg-action-hover enabled:hover:-translate-y-0.5",
  secondary: "rounded-button bg-surface text-ink border border-line hover:bg-line",
  outline: "rounded-button bg-page text-ink border border-line hover:bg-surface",
  // Rood: alleen voor onomkeerbare acties, bijv. de bevestigknop in ConfirmDialog
  danger: "rounded-button bg-danger text-on-dark hover:bg-danger/90",
  // Voor gebruik op donkere (navy) vlakken
  "outline-dark": "rounded-button text-on-dark border border-on-dark/50 hover:bg-on-dark/10",
  link: "text-link hover:underline",
}

const SIZES = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
}

// Gebruik `as` voor een link die eruitziet als knop, bijv. <Button as={Link} to="/events">
export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const sizeClass = variant === "link" ? "text-sm" : SIZES[size]
  return (
    <Component
      className={`${BASE} ${VARIANTS[variant]} ${sizeClass} ${className}`}
      {...props}
    />
  )
}

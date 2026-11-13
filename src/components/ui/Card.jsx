const VARIANTS = {
  default: "bg-page border border-line text-ink",
  muted: "bg-surface border border-line text-ink",
  dark: "bg-navy text-on-dark",
}

export default function Card({
  as: Component = "div",
  variant = "default",
  className = "",
  ...props
}) {
  return (
    <Component
      className={`rounded-card p-6 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

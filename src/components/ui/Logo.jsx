// "Tri" in navy, "Buddy" in oranje, met blauwe stip — zoals in preview v3
export default function Logo({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap text-2xl font-extrabold tracking-tight text-navy ${className}`}
    >
      Tri<span className="text-action">Buddy</span>
      <i className="ml-1 mt-3 h-1.5 w-1.5 rounded-full bg-link" aria-hidden="true" />
    </span>
  )
}

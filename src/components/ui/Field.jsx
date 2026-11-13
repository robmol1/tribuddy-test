const CONTROL =
  "w-full rounded-control border border-line bg-page px-3 text-sm text-ink " +
  "placeholder:text-muted focus:outline-none focus:border-link focus:ring-2 focus:ring-link/20 " +
  "disabled:bg-surface disabled:text-muted"

// Label + invoerveld + optionele hulptekst of foutmelding
export function Field({ label, hint, error, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}

export function Input({ className = "", ...props }) {
  return <input className={`${CONTROL} min-h-11 ${className}`} {...props} />
}

export function Select({ className = "", ...props }) {
  return <select className={`${CONTROL} min-h-11 ${className}`} {...props} />
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${CONTROL} py-2 ${className}`} {...props} />
}

export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-ink ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-line accent-link"
        {...props}
      />
      {label}
    </label>
  )
}

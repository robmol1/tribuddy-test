// tabs: [{ id, label }] — de geselecteerde tab krijgt het blauwe accent (geselecteerde navigatie)
export default function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div role="tablist" className={`flex gap-1 border-b border-line ${className}`}>
      {tabs.map((tab) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition " +
              (selected
                ? "border-link text-link"
                : "border-transparent text-muted hover:text-ink")
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

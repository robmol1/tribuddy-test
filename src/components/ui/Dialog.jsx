import { useEffect, useId, useRef } from "react"

// Algemeen popup-venster op basis van <dialog>: focus blijft in het venster,
// Esc, de sluitknop en klikken naast het venster sluiten het.
export default function Dialog({ open, title, closeLabel, onClose, children }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc in een venster hierbinnen (bijv. ConfirmDialog) sluit alleen dat venster
        if (e.target !== ref.current) return
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="w-[calc(100%-2rem)] max-w-lg rounded-card border border-line bg-page p-0 text-ink shadow-xl backdrop:bg-navy/60"
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-xl font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="-m-1 grid h-9 w-9 shrink-0 place-items-center rounded-control text-muted transition hover:bg-surface hover:text-ink"
            >
              ✕
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  )
}

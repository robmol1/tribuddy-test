import { useEffect, useId, useRef } from "react"
import Button from "./Button"

// Bevestigingsvenster op basis van <dialog>: focus blijft in het venster,
// Esc en klikken naast het venster annuleren.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}) {
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
        e.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel()
      }}
      className="w-[calc(100%-2rem)] max-w-md rounded-card border border-line bg-page p-0 text-ink shadow-xl backdrop:bg-navy/60"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm text-muted">{children}</div>}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

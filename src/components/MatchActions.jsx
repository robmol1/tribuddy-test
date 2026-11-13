import { useState } from "react"
import { Button, ConfirmDialog, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { setMatchStatus } from "../matches"

// Definitieve acties vragen eerst om bevestiging: status → teksten in match.*
const CONFIRM = {
  rejected: { title: "rejectTitle", text: "rejectText", button: "reject" },
  ended: { title: "endTitle", text: "endText", button: "end" },
}

// Knoppen en status van één buddy-match, voor Deelnemers en Buddy matches.
// onChange(match) krijgt de match met de nieuwe status na een geslaagde wijziging.
export default function MatchActions({
  match,
  currentUserId,
  buddyName,
  acceptedLabel,
  onChange,
}) {
  const { t } = useT()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(null) // null | "rejected" | "ended"

  const isReceiver = match.user2_id === currentUserId

  const change = async (status) => {
    setBusy(true)
    setError(null)
    const ok = await setMatchStatus(match.id, status)
    setBusy(false)
    if (!ok) {
      setError(t("match.failed"))
      return
    }
    setConfirming(null)
    onChange({ ...match, status })
  }

  const closeConfirm = () => {
    setConfirming(null)
    setError(null)
  }

  let content = null

  if (match.status === "pending" && isReceiver) {
    content = (
      <>
        <Button size="sm" onClick={() => change("accepted")} disabled={busy}>
          {t("match.accept")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming("rejected")} disabled={busy}>
          {t("match.reject")}
        </Button>
      </>
    )
  } else if (match.status === "pending") {
    content = (
      <>
        <StatusText>{t("match.requestSent")}</StatusText>
        <Button variant="link" onClick={() => change("withdrawn")} disabled={busy}>
          {t("match.withdraw")}
        </Button>
      </>
    )
  } else if (match.status === "accepted") {
    content = (
      <>
        <StatusText tone="success">{acceptedLabel}</StatusText>
        <Button variant="link" onClick={() => setConfirming("ended")} disabled={busy}>
          {t("match.end")}
        </Button>
      </>
    )
  } else if (match.status === "rejected") {
    content = <StatusText>{t("match.rejected")}</StatusText>
  } else if (match.status === "ended") {
    content = <StatusText>{t("match.ended")}</StatusText>
  }

  const texts = confirming && CONFIRM[confirming]

  return (
    <>
      {content}
      {error && !confirming && <StatusText tone="danger">{error}</StatusText>}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={texts ? t(`match.${texts.title}`, { name: buddyName }) : ""}
        confirmLabel={texts ? t(`match.${texts.button}`) : ""}
        cancelLabel={t("match.cancel")}
        onConfirm={() => change(confirming)}
        onCancel={closeConfirm}
        busy={busy}
      >
        {texts && <p>{t(`match.${texts.text}`)}</p>}
        {error && (
          <StatusText tone="danger" className="mt-3">
            {error}
          </StatusText>
        )}
      </ConfirmDialog>
    </>
  )
}

import { useEffect, useState } from "react"
import { Button, Checkbox, Dialog, Field, Select, StatusText, Textarea } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { blockUser, submitReport } from "../safety"
import { useMasterData } from "../masterData"

// Popup om een profiel of chatbericht te melden, met optie om meteen te blokkeren.
// target: { userId, name, chatMessageId? } — null = gesloten
// alreadyBlocked: true → geen blokkeer-vinkje; onBlocked(userId): na een geslaagde blokkade
export default function ReportDialog({ target, reporterId, onClose, alreadyBlocked = false, onBlocked }) {
  const { t } = useT()
  const { active, label } = useMasterData()
  const reasons = active("reportReasons").map((r) => r.code)
  const [reason, setReason] = useState("")
  const [comment, setComment] = useState("")
  const [alsoBlock, setAlsoBlock] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // "sent" | "sentBlocked" | "sentBlockFailed" | "failed"

  // Bij openen: formulier leegmaken
  useEffect(() => {
    if (target) {
      setReason("")
      setComment("")
      setAlsoBlock(false)
      setResult(null)
      setBusy(false)
    }
  }, [target])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return
    setBusy(true)
    const ok = await submitReport({
      reporterId,
      reportedUserId: target.userId,
      chatMessageId: target.chatMessageId,
      reasonCode: reason,
      comment,
    })

    if (!ok) {
      setBusy(false)
      setResult("failed")
      return
    }

    // Eerst melden, daarna (indien aangevinkt) blokkeren
    if (alsoBlock && !alreadyBlocked) {
      const blocked = await blockUser(reporterId, target.userId)
      if (blocked) onBlocked?.(target.userId)
      setResult(blocked ? "sentBlocked" : "sentBlockFailed")
    } else {
      setResult("sent")
    }
    setBusy(false)
  }

  const sent = result === "sent" || result === "sentBlocked" || result === "sentBlockFailed"
  const name = target?.name ?? ""

  const title = target?.chatMessageId
    ? t("report.titleMessage", { name: target?.name ?? "" })
    : t("report.titleProfile", { name: target?.name ?? "" })

  return (
    <Dialog open={!!target} title={title} closeLabel={t("report.close")} onClose={onClose}>
      {sent ? (
        <div className="space-y-4">
          <StatusText tone="success">
            {t("report.sent")}
            {result === "sentBlocked" && ` ${t("report.blocked", { name })}`}
          </StatusText>
          {result === "sentBlockFailed" && (
            <StatusText tone="danger">{t("report.blockFailed", { name })}</StatusText>
          )}
          <Button variant="outline" onClick={onClose}>{t("report.close")}</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted">{t("report.intro")}</p>

          <Field label={t("report.reason")}>
            <Select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">{t("report.chooseReason")}</option>
              {reasons.map((code) => (
                <option key={code} value={code}>{label("reportReasons", code)}</option>
              ))}
            </Select>
          </Field>

          <Field label={t("report.comment")} hint={t("report.commentHint")}>
            <Textarea
              rows={4}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Field>

          {!alreadyBlocked && (
            <div className="space-y-1">
              <Checkbox
                label={t("report.alsoBlock", { name })}
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
              />
              <p className="text-xs text-muted">{t("safety.blockText", { name })}</p>
            </div>
          )}

          {result === "failed" && <StatusText tone="danger">{t("report.failed")}</StatusText>}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              {t("match.cancel")}
            </Button>
            <Button type="submit" variant="danger" disabled={busy || !reason}>
              {busy ? t("report.sending") : t("report.submit")}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

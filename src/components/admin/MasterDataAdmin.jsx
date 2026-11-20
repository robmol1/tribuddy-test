import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Button, Checkbox, ConfirmDialog, Field, Input, Select, StatusText } from "../ui"
import { useT } from "../../i18n/LanguageProvider"
import { MASTER_TABLES, useMasterData } from "../../masterData"

// Stamtabellen die in het beheerscherm te onderhouden zijn
const ADMIN_TABLES = [
  { key: "languages", codeHint: "admin.md.codeHintLanguage" },
  { key: "distanceGroups" },
  { key: "distanceCategories", withGroup: true },
  { key: "reportReasons" },
  { key: "levels" },
  { key: "genders" },
]

const EMPTY_NEW = { code: "", label_nl: "", label_en: "", sort_order: 0, is_active: true, group_code: "" }

// Foutcodes van PostgreSQL → begrijpelijke melding
function errorKey(error) {
  switch (error?.code) {
    case "23505": return "admin.md.errorExists"
    case "23503": return "admin.md.errorInUse"
    case "23514": return "admin.md.errorInvalidCode"
    case "42501": return "admin.md.errorNoRights"
    default: return "admin.md.errorGeneric"
  }
}

// Alleen de kolommen die bij deze tabel horen
function payloadOf(row, withGroup) {
  const payload = {
    label_nl: row.label_nl?.trim() || null,
    label_en: row.label_en?.trim() || null,
    sort_order: Number(row.sort_order) || 0,
    is_active: !!row.is_active,
  }
  if (withGroup) payload.group_code = row.group_code
  return payload
}

export default function MasterDataAdmin() {
  const { t } = useT()
  const { all, label, reload } = useMasterData()
  const [tableKey, setTableKey] = useState(ADMIN_TABLES[0].key)
  const config = ADMIN_TABLES.find((c) => c.key === tableKey)
  const table = MASTER_TABLES[tableKey]
  const rows = all(tableKey)

  const [drafts, setDrafts] = useState({})   // code → bewerkte rij
  const [newRow, setNewRow] = useState(EMPTY_NEW)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { tone, text }
  const [confirmDelete, setConfirmDelete] = useState(null) // code

  // Andere tabel gekozen → alles leeg
  useEffect(() => {
    setDrafts({})
    setNewRow(EMPTY_NEW)
    setMessage(null)
  }, [tableKey])

  const draftOf = (row) => drafts[row.code] ?? row
  const isDirty = (row) => !!drafts[row.code]

  const editRow = (row, field, value) =>
    setDrafts((prev) => ({ ...prev, [row.code]: { ...draftOf(row), [field]: value } }))

  const run = async (action, successKey) => {
    setBusy(true)
    setMessage(null)
    const { error } = await action()
    if (error) {
      console.error("[ADMIN] masterdata change failed", error)
      setMessage({ tone: "danger", text: t(errorKey(error)) })
      setBusy(false)
      return false
    }
    await reload()
    setMessage({ tone: "success", text: t(successKey) })
    setBusy(false)
    return true
  }

  const saveRow = async (row) => {
    const ok = await run(
      () => supabase.from(table).update(payloadOf(draftOf(row), config.withGroup)).eq("code", row.code),
      "admin.md.saved"
    )
    if (ok) setDrafts(({ [row.code]: _, ...rest }) => rest)
  }

  const deleteRow = async () => {
    const code = confirmDelete
    setConfirmDelete(null)
    await run(() => supabase.from(table).delete().eq("code", code), "admin.md.deleted")
  }

  const addRow = async (e) => {
    e.preventDefault()
    const code = newRow.code.trim()
    if (!code) return
    if (config.withGroup && !newRow.group_code) {
      setMessage({ tone: "danger", text: t("admin.md.groupRequired") })
      return
    }
    const ok = await run(
      () => supabase.from(table).insert({ code, ...payloadOf(newRow, config.withGroup) }),
      "admin.md.added"
    )
    if (ok) setNewRow(EMPTY_NEW)
  }

  const groups = config.withGroup ? all("distanceGroups") : []

  const groupSelect = (value, onChange) => (
    <Select value={value ?? ""} onChange={onChange} className="min-w-32">
      <option value="">{t("admin.md.chooseGroup")}</option>
      {groups.map((g) => (
        <option key={g.code} value={g.code}>{label("distanceGroups", g.code)}</option>
      ))}
    </Select>
  )

  return (
    <div className="space-y-6">
      <Field label={t("admin.md.table")} className="max-w-sm">
        <Select value={tableKey} onChange={(e) => setTableKey(e.target.value)}>
          {ADMIN_TABLES.map((c) => (
            <option key={c.key} value={c.key}>{t(`admin.md.tables.${c.key}`)}</option>
          ))}
        </Select>
      </Field>

      <p className="text-sm text-muted">{t("admin.md.intro")}</p>

      {message && <StatusText tone={message.tone}>{message.text}</StatusText>}

      {/* Nieuwe rij */}
      <form onSubmit={addRow} className="space-y-3 rounded-card border border-line bg-surface p-4">
        <h3 className="text-sm font-bold">{t("admin.md.addTitle")}</h3>
        {/* Bovenste regel: groep, code, volgorde, actief */}
        <div className="flex flex-wrap items-end gap-3">
          {config.withGroup && (
            <Field label={t("admin.md.group")}>
              {groupSelect(newRow.group_code, (e) => setNewRow({ ...newRow, group_code: e.target.value }))}
            </Field>
          )}
          <Field
            label={t("admin.md.code")}
            hint={config.codeHint ? t(config.codeHint) : t("admin.md.codeHint")}
            className="min-w-40 flex-1 sm:max-w-xs"
          >
            <Input
              value={newRow.code}
              onChange={(e) => setNewRow({ ...newRow, code: e.target.value })}
              required
            />
          </Field>
          <Field label={t("admin.md.sortOrder")}>
            <Input
              type="number"
              className="w-24"
              value={newRow.sort_order}
              onChange={(e) => setNewRow({ ...newRow, sort_order: e.target.value })}
            />
          </Field>
          <Checkbox
            label={t("admin.md.active")}
            checked={newRow.is_active}
            onChange={(e) => setNewRow({ ...newRow, is_active: e.target.checked })}
            className="min-h-11"
          />
        </div>
        {/* Daaronder: de namen over de volle breedte */}
        <div className="grid gap-3">
          <Field label={t("admin.md.labelNl")}>
            <Input value={newRow.label_nl} onChange={(e) => setNewRow({ ...newRow, label_nl: e.target.value })} />
          </Field>
          <Field label={t("admin.md.labelEn")}>
            <Input value={newRow.label_en} onChange={(e) => setNewRow({ ...newRow, label_en: e.target.value })} />
          </Field>
        </div>
        <Button type="submit" size="sm" disabled={busy || !newRow.code.trim()}>
          {t("admin.md.add")}
        </Button>
      </form>

      {/* Bestaande rijen: per item een blok */}
      {rows.length === 0 && <StatusText>{t("admin.md.empty")}</StatusText>}

      <ul className="space-y-3">
        {rows.map((row) => {
          const d = draftOf(row)
          return (
            <li
              key={row.code}
              className={
                "space-y-3 rounded-card border border-line bg-page p-4 " + (d.is_active ? "" : "opacity-60")
              }
            >
              {/* Bovenste regel: groep, code, volgorde, actief, acties */}
              <div className="flex flex-wrap items-end gap-3">
                {config.withGroup && (
                  <Field label={t("admin.md.group")}>
                    {groupSelect(d.group_code, (e) => editRow(row, "group_code", e.target.value))}
                  </Field>
                )}
                <div className="min-w-32">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">{t("admin.md.code")}</span>
                  <span className="flex min-h-11 items-center font-mono font-bold">{row.code}</span>
                </div>
                <Field label={t("admin.md.sortOrder")}>
                  <Input
                    type="number"
                    className="w-24"
                    value={d.sort_order ?? 0}
                    onChange={(e) => editRow(row, "sort_order", e.target.value)}
                  />
                </Field>
                <Checkbox
                  label={t("admin.md.active")}
                  checked={!!d.is_active}
                  onChange={(e) => editRow(row, "is_active", e.target.checked)}
                  className="min-h-11"
                />
                <div className="ml-auto flex min-h-11 items-center gap-3">
                  {isDirty(row) && (
                    <Button size="sm" onClick={() => saveRow(row)} disabled={busy}>
                      {t("admin.md.save")}
                    </Button>
                  )}
                  <Button variant="link" onClick={() => setConfirmDelete(row.code)} disabled={busy}>
                    {t("admin.md.delete")}
                  </Button>
                </div>
              </div>

              {/* Daaronder: de namen over de volle breedte */}
              <div className="grid gap-3">
                <Field label={t("admin.md.labelNl")}>
                  <Input value={d.label_nl ?? ""} onChange={(e) => editRow(row, "label_nl", e.target.value)} />
                </Field>
                <Field label={t("admin.md.labelEn")}>
                  <Input value={d.label_en ?? ""} onChange={(e) => editRow(row, "label_en", e.target.value)} />
                </Field>
              </div>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={!!confirmDelete}
        title={t("admin.md.deleteTitle", { code: confirmDelete ?? "" })}
        confirmLabel={t("admin.md.delete")}
        cancelLabel={t("match.cancel")}
        onConfirm={deleteRow}
        onCancel={() => setConfirmDelete(null)}
        busy={busy}
      >
        {t("admin.md.deleteText")}
      </ConfirmDialog>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Button, Dialog, Field, Input, ListCard, Select, StatusText, Textarea } from "../ui"
import { useT } from "../../i18n/LanguageProvider"

// Tab Gebruikers (punt 11b). Gegevens via admin_list_users(); acties via admin_*-functies,
// die zelf is_admin() controleren en in het logboek (admin_actions) schrijven.
const STATUS_FILTERS = ["all", "active", "hidden", "suspended", "deleted", "admin"]

// Status in volgorde van belang: verwijderd > geschorst > verborgen > actief
function statusOf(u) {
  if (u.is_deleted) return "deleted"
  if (u.is_suspended) return "suspended"
  if (u.is_hidden) return "hidden"
  return "active"
}

const STATUS_STYLE = {
  active: "bg-surface text-muted",
  hidden: "bg-surface text-ink",
  suspended: "bg-danger/10 text-danger",
  deleted: "bg-danger/10 text-danger",
}

function Badge({ className = "", children }) {
  return <span className={`rounded-control px-2 py-0.5 text-xs font-bold ${className}`}>{children}</span>
}

const nameOf = (u) => `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()

export default function AdminUsers({ session }) {
  const { t, formatDate } = useT()
  const currentUserId = session?.user?.id

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc("admin_list_users")
    if (error) {
      console.error("[ADMIN] list users failed", error)
      setLoadFailed(true)
    } else {
      setUsers(data || [])
      setLoadFailed(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter === "admin" && !u.is_admin) return false
      if (statusFilter !== "all" && statusFilter !== "admin" && statusOf(u) !== statusFilter) return false
      if (q && !`${nameOf(u)} ${u.email ?? ""}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [users, search, statusFilter])

  const openUser = users.find((u) => u.id === openId)

  if (loading) return <StatusText>{t("common.loading")}</StatusText>
  if (loadFailed) return <StatusText tone="danger">{t("admin.users.loadFailed")}</StatusText>

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label={t("admin.users.search")}>
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.users.searchPlaceholder")}
          />
        </Field>
        <Field label={t("admin.users.status")}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{t(`admin.users.filter.${s}`)}</option>
            ))}
          </Select>
        </Field>
      </div>

      <p className="text-xs text-muted">
        {t("admin.users.count", { shown: visibleUsers.length, total: users.length })}
      </p>

      {visibleUsers.length === 0 && <StatusText>{t("admin.users.empty")}</StatusText>}

      {visibleUsers.map((u) => {
        const status = statusOf(u)
        return (
          <ListCard
            key={u.id}
            title={
              <button
                type="button"
                onClick={() => setOpenId(u.id)}
                className="text-left hover:text-link hover:underline"
              >
                {nameOf(u) || t("safety.unknownUser")}
              </button>
            }
            meta={`${u.email ?? "—"} · ${t("admin.users.created", { date: formatDate(u.created_at) })}`}
          >
            <span className="text-xs text-muted">
              {t("admin.users.counts", { events: u.events_count, reports: u.reports_against })}
            </span>
            <Badge className={STATUS_STYLE[status]}>{t(`admin.users.filter.${status}`)}</Badge>
            {u.is_admin && <Badge className="bg-link-soft text-link">{t("admin.users.filter.admin")}</Badge>}
          </ListCard>
        )
      })}

      <UserDialog
        user={openUser}
        isSelf={openUser?.id === currentUserId}
        onClose={() => setOpenId(null)}
        onChanged={load}
      />
    </div>
  )
}

// Popup met details, acties en logboek van één gebruiker
function UserDialog({ user, isSelf, onClose, onChanged }) {
  const { t, formatDate } = useT()
  const [actions, setActions] = useState([])
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(null) // actie die op bevestiging (met reden) wacht
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { tone, text }

  const userId = user?.id
  const loadActions = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from("admin_actions")
      .select("id, admin_id, action, reason, created_at")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
    if (error) console.error("[ADMIN] load actions failed", error)
    setActions(data || [])
  }, [userId])

  useEffect(() => {
    setPending(null)
    setReason("")
    setMessage(null)
    loadActions()
  }, [loadActions])

  if (!user) return <Dialog open={false} title="" closeLabel="" onClose={onClose} />

  const status = statusOf(user)

  // [actie-id, functie, parameters, reden verplicht?]
  const ACTIONS = {
    suspend: ["admin_set_suspended", { target: user.id, suspend: true }, true],
    unsuspend: ["admin_set_suspended", { target: user.id, suspend: false }, false],
    restore: ["admin_restore_user", { target: user.id }, false],
    hide: ["admin_set_hidden", { target: user.id, hidden: true }, false],
    unhide: ["admin_set_hidden", { target: user.id, hidden: false }, false],
    make_admin: ["admin_set_admin", { target: user.id, make_admin: true }, false],
    revoke_admin: ["admin_set_admin", { target: user.id, make_admin: false }, false],
  }

  const available = [
    !user.is_deleted && !user.is_suspended && !isSelf && "suspend",
    user.is_suspended && "unsuspend",
    user.is_deleted && "restore",
    !user.is_hidden && "hide",
    user.is_hidden && "unhide",
    !user.is_admin && "make_admin",
    user.is_admin && !isSelf && "revoke_admin",
  ].filter(Boolean)

  const runAction = async () => {
    const [fn, params, reasonRequired] = ACTIONS[pending]
    if (reasonRequired && !reason.trim()) {
      setMessage({ tone: "danger", text: t("admin.users.reasonRequired") })
      return
    }
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.rpc(fn, { ...params, reason: reason.trim() || null })
    setBusy(false)
    if (error) {
      console.error("[ADMIN] action failed", error)
      setMessage({ tone: "danger", text: t("admin.users.actionFailed") })
      return
    }
    setPending(null)
    setReason("")
    setMessage({ tone: "success", text: t("admin.users.actionDone") })
    await onChanged()
    await loadActions()
  }

  const rows = [
    [t("profile.email"), user.email ?? "—"],
    [t("admin.users.createdLabel"), formatDate(user.created_at)],
    [t("admin.users.status"), t(`admin.users.filter.${status}`)],
    [t("admin.users.eventsCount"), user.events_count],
    [t("admin.users.reportsAgainst"), user.reports_against],
    user.is_suspended && [t("admin.users.suspendedSince"), formatDate(user.suspended_at)],
    user.is_suspended && [t("admin.users.suspendedReason"), user.suspended_reason ?? "—"],
    user.is_deleted && [t("admin.users.deletedSince"), formatDate(user.deleted_at)],
  ].filter(Boolean)

  return (
    <Dialog
      open={!!user}
      title={nameOf(user) || t("safety.unknownUser")}
      closeLabel={t("report.close")}
      onClose={onClose}
    >
      <div className="space-y-5">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Acties */}
        <section className="space-y-3 border-t border-line pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted">{t("admin.users.actions")}</h3>
          {!pending ? (
            <div className="flex flex-wrap gap-2">
              {available.map((id) => (
                <Button
                  key={id}
                  size="sm"
                  variant={id === "suspend" ? "danger" : "outline"}
                  onClick={() => {
                    setPending(id)
                    setMessage(null)
                  }}
                >
                  {t(`admin.users.action.${id}`)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 rounded-card border border-line bg-surface p-3">
              <p className="text-sm font-semibold">
                {t("admin.users.confirm", { action: t(`admin.users.action.${pending}`) })}
              </p>
              <Field
                label={t("admin.users.reason")}
                hint={ACTIONS[pending][2] ? t("admin.users.reasonRequiredHint") : t("admin.users.reasonOptional")}
              >
                <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
              <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setPending(null)} disabled={busy}>
                  {t("match.cancel")}
                </Button>
                <Button
                  size="sm"
                  variant={pending === "suspend" ? "danger" : "primary"}
                  onClick={runAction}
                  disabled={busy}
                >
                  {t(`admin.users.action.${pending}`)}
                </Button>
              </div>
            </div>
          )}
          {message && <StatusText tone={message.tone}>{message.text}</StatusText>}
        </section>

        {/* Logboek */}
        <section className="space-y-2 border-t border-line pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted">{t("admin.users.log")}</h3>
          {actions.length === 0 ? (
            <StatusText>{t("admin.users.logEmpty")}</StatusText>
          ) : (
            <ul className="space-y-2 text-sm">
              {actions.map((a) => (
                <li key={a.id} className="rounded-control bg-surface px-3 py-2">
                  <span className="font-semibold">{t(`admin.users.logAction.${a.action}`)}</span>
                  <span className="text-muted"> · {formatDate(a.created_at, { dateStyle: "medium", timeStyle: "short" })}</span>
                  {a.reason && <p className="mt-1 text-muted">{a.reason}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Dialog>
  )
}

import { useState } from "react"
import { EmptyState, PageContainer, Tabs } from "../ui"
import { useT } from "../../i18n/LanguageProvider"
import MasterDataAdmin from "./MasterDataAdmin"
import AdminUsers from "./AdminUsers"

// Beheerpaneel (punt 11). Alleen bereikbaar voor beheerders (zie Dashboard);
// de echte beveiliging zit in de database (is_admin() in de toegangsregels en beheerfuncties).
const TABS = ["users", "events", "matches", "reports", "masterdata"]

export default function AdminPage({ session }) {
  const { t } = useT()
  const [tab, setTab] = useState("users")

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t("admin.title")}</h1>

      <div className="overflow-x-auto">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={TABS.map((id) => ({ id, label: t(`admin.tabs.${id}`) }))}
        />
      </div>

      {tab === "users" && <AdminUsers session={session} />}
      {tab === "masterdata" && <MasterDataAdmin />}
      {tab !== "users" && tab !== "masterdata" && <EmptyState title={t("admin.comingSoon")} />}
    </PageContainer>
  )
}

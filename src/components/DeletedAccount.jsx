import { supabase } from "../supabaseClient"
import { Button, Card, PageContainer } from "./ui"
import { useT } from "../i18n/LanguageProvider"

// Getoond als iemand inlogt met een account dat verwijderd (users.is_deleted) of
// geschorst (users.is_suspended) is. kind: "deleted" | "suspended". De reden van een schorsing tonen we niet.
export default function DeletedAccount({ kind = "deleted" }) {
  const { t } = useT()
  const prefix = kind === "suspended" ? "account.suspended" : "account.deleted"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.assign("/")
  }

  return (
    <PageContainer className="py-16">
      <Card className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">{t(`${prefix}Title`)}</h1>
        <p className="text-sm text-muted">{t(`${prefix}Text`)}</p>
        <Button onClick={handleLogout}>{t("nav.logout")}</Button>
      </Card>
    </PageContainer>
  )
}

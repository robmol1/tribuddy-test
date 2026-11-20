import { useEffect, useState } from "react"
import { Button, ListCard, StatusText } from "./ui"
import { useT } from "../i18n/LanguageProvider"
import { fetchPublicProfiles } from "../publicProfiles"
import { fetchMyBlocks, unblockUser } from "../safety"

// Lijst van gebruikers die ik heb geblokkeerd, met Deblokkeren (op de profielpagina)
export default function BlockedUsers({ userId }) {
  const { t } = useT()
  const [blocked, setBlocked] = useState([]) // [{ id, name }]
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      const ids = Array.from(await fetchMyBlocks(userId))
      // Lukt het ophalen van namen niet, dan toch de lijst tonen (met "Onbekende gebruiker")
      const profiles = (await fetchPublicProfiles(ids, "first_name,last_name")) || new Map()
      setBlocked(
        ids.map((id) => {
          const p = profiles.get(id)
          // Niet zichtbaar (bijv. verborgen of verwijderd) → geen naam bekend
          const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : ""
          return { id, name: name || t("safety.unknownUser") }
        })
      )
      setLoading(false)
    }
    load()
  }, [userId, t])

  const handleUnblock = async (id) => {
    setFailed(false)
    const ok = await unblockUser(userId, id)
    if (!ok) {
      setFailed(true)
      return
    }
    setBlocked((prev) => prev.filter((b) => b.id !== id))
  }

  if (loading) return <StatusText>{t("common.loading")}</StatusText>

  return (
    <div className="space-y-2">
      {failed && <StatusText tone="danger">{t("safety.blockFailed")}</StatusText>}
      {blocked.length === 0 ? (
        <StatusText>{t("safety.noBlocked")}</StatusText>
      ) : (
        blocked.map((b) => (
          <ListCard key={b.id} title={b.name}>
            <Button variant="outline" size="sm" onClick={() => handleUnblock(b.id)}>
              {t("safety.unblock")}
            </Button>
          </ListCard>
        ))
      )}
    </div>
  )
}

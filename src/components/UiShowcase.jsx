import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Button, Card, Field, Input, Select, Textarea, Checkbox, Tabs,
  StatusText, EmptyState, PageContainer, Logo, TopBar, TopBarLink, LanguageSwitch,
} from "./ui"
import { useT } from "../i18n/LanguageProvider"

// Stijlgids: alle tokens en UI-componenten op één pagina (route /ui)

const COLORS_DOC = [
  ["page", "Achtergrond", "#FFFFFF"],
  ["surface", "Kaarten en vlakken", "#F5F6F7"],
  ["ink", "Primaire tekst", "#1F2933"],
  ["muted", "Secundaire tekst", "#667085"],
  ["link", "Blauw accent", "#1F6FEB"],
  ["action", "Actieaccent", "#FF6F3C"],
  ["success", "Successtatus", "#218838"],
]

const COLORS_EXTRA = [
  ["navy", "Donkere vlakken", "#14283B"],
  ["line", "Randen", "#E3E8ED"],
  ["link-soft", "Lichte blauwe tint", "#EDF4FF"],
  ["action-hover", "Hover primaire knop", "#FF8357"],
  ["danger", "Fouten", "#C0392B"],
  ["on-dark-muted", "Tekst op donker", "#D1DBE3"],
  ["on-dark-accent", "Oranje op donker", "#FFB79E"],
  ["on-dark-link", "Blauw op donker", "#A9C8FF"],
]

function Swatches({ title, colors }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-ink">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {colors.map(([name, label, hex]) => (
          <div key={name} className="overflow-hidden rounded-control border border-line">
            <div className="h-12" style={{ background: `rgb(var(--color-${name}))` }} />
            <div className="p-2 text-xs">
              <div className="font-bold text-ink">{name}</div>
              <div className="text-muted">{label}</div>
              <div className="font-mono text-muted">{hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  )
}

export default function UiShowcase() {
  const [tab, setTab] = useState("participants")
  const { t, lang, formatDate } = useT()

  return (
    <PageContainer size="lg" className="space-y-12">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-widest text-link">Stijlgids</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">TriBuddy UI</h1>
        <p className="mt-2 text-sm text-muted">
          Kleuren aanpassen: <code>src/styles/tokens.css</code>. Componenten:{" "}
          <code>src/components/ui/</code>.
        </p>
      </header>

      <Section title="Kleuren">
        <Swatches title="Kleurendocument (leidend)" colors={COLORS_DOC} />
        <Swatches title="Aanvulling (uit preview v3)" colors={COLORS_EXTRA} />
      </Section>

      <Section title="Taal (NL/EN)">
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <span className="text-sm text-muted">Huidige taal: <strong>{lang}</strong></span>
          </div>
          <p className="text-sm">{t("showcase.greeting", { name: "Jan" })}</p>
          <p className="text-sm">{t("showcase.today", { date: formatDate(new Date(), { dateStyle: "full" }) })}</p>
          <p className="text-sm text-muted">
            Kort: {formatDate("2026-06-14")} · Lang: {formatDate("2026-06-14", { dateStyle: "long" })} ·
            Met tijd: {formatDate(new Date(), { dateStyle: "short", timeStyle: "short" })}
          </p>
        </Card>
      </Section>

      <Section title="Logo en topbar">
        <Logo />
        <div className="overflow-hidden rounded-card border border-line">
          <TopBar
            logoTo="/ui"
            actions={<><LanguageSwitch /><Button size="sm">Actie</Button></>}
          >
            <TopBarLink to="/ui">Actief</TopBarLink>
            <TopBarLink to="/events">Events</TopBarLink>
            <TopBarLink to="/profile">Profiel</TopBarLink>
          </TopBar>
        </div>
      </Section>

      <Section title="Knoppen">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primair</Button>
          <Button variant="secondary">Secundair</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Uitgeschakeld</Button>
          <Button as={Link} to="/events" variant="outline">Als link →</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Klein</Button>
          <Button size="md">Middel</Button>
          <Button size="lg">Groot →</Button>
        </div>
        <Card variant="dark" className="flex flex-wrap items-center gap-3">
          <Button>Primair op donker</Button>
          <Button variant="outline-dark">Outline op donker →</Button>
        </Card>
      </Section>

      <Section title="Kaarten">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <h3 className="font-bold">Standaard</h3>
            <p className="mt-1 text-sm text-muted">Witte kaart met rand.</p>
          </Card>
          <Card variant="muted">
            <h3 className="font-bold">Muted</h3>
            <p className="mt-1 text-sm text-muted">Subtiel lichtgrijs vlak.</p>
          </Card>
          <Card variant="dark">
            <p className="text-xs font-extrabold uppercase tracking-widest text-on-dark-link">Label</p>
            <h3 className="mt-1 font-bold">Donker</h3>
            <p className="mt-1 text-sm text-on-dark-muted">Navy vlak met lichte tekst.</p>
          </Card>
        </div>
      </Section>

      <Section title="Formulier">
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Voornaam" hint="Zoals andere deelnemers je zien.">
            <Input placeholder="Jan" />
          </Field>
          <Field label="E-mail" error="Vul een geldig e-mailadres in.">
            <Input type="email" defaultValue="jan@" />
          </Field>
          <Field label="Niveau">
            <Select defaultValue="beginner">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
          <Field label="Uitgeschakeld">
            <Input disabled placeholder="Komt later" />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea rows={3} placeholder="Vertel iets over jezelf" />
          </Field>
          <Checkbox label="Ik sta open voor een buddy" defaultChecked />
        </Card>
      </Section>

      <Section title="Tabs">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "participants", label: "Deelnemers" },
            { id: "buddies", label: "Buddy Matches" },
            { id: "chat", label: "Chat" },
          ]}
        />
        <p className="text-sm text-muted">Geselecteerd: {tab}</p>
      </Section>

      <Section title="Statusteksten">
        <StatusText>Info: wijzigingen worden automatisch bewaard.</StatusText>
        <StatusText tone="success">Profiel opgeslagen!</StatusText>
        <StatusText tone="danger">Wijzigingen zijn pas actief na opslaan.</StatusText>
      </Section>

      <Section title="Lege staat">
        <EmptyState
          title="Geen events gevonden"
          action={<Button variant="outline" size="sm">Wedstrijd doorgeven →</Button>}
        >
          Zodra er wedstrijden zijn toegevoegd, kun je ze hier ontdekken.
        </EmptyState>
      </Section>
    </PageContainer>
  )
}

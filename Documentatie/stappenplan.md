# Stappenplan TriBuddy — wat moet erin zitten

> **Dit bestand is leidend.** Omgezet op 2026-11-20 uit `Stappen_plan_wat_moet_er_in_zitten.docx`. Dat Word-bestand blijft ongewijzigd staan als origineel.
>
> **Stand van de status:** 2026-11-20

**Legenda status**

| Status | Betekenis |
|---|---|
| ✅ | Klaar en getest |
| 🔧 | Gebouwd, nog (deels) testen of SQL draaien |
| 🟡 | Deels gebouwd (zie toelichting) |
| ⏳ | Nog niet gebouwd |

## 1. Basic — nodig voor de eerste bruikbare versie

Onderstaande volgorde is ook een logische bouwvolgorde. Privacy en beveiliging neem je daarbij vanaf het begin mee.

| Volgorde | Functie | Wat moet er minimaal in? | Status |
|---|---|---|---|
| 1 | Registreren en inloggen | Aanmelden via e-mail met verificatie; inloggen, uitloggen en dubbele accounts op hetzelfde e-mailadres voorkomen. Kies één loginmethode. | ✅ Inloggen met een e-mail-link (Supabase) |
| 2 | Profiel aanmaken en wijzigen | Weergavenaam, woonplaats/regio, talen, ervaringsniveau en voorkeursafstand. Foto en korte bio optioneel. | 🟡 Alles behalve de foto |
| 3 | Aangeven waarvoor je een buddy zoekt | Samen trainen, reizen of verblijf delen. Eenvoudige voorkeuren voor taal en geslacht. | ✅ Klaar 2026-11-20: talen als vaste lijst (een of meer kiezen), filter "Alleen wie een taal met mij deelt" en voorkeur voor het geslacht van je buddy |
| 4 | Wedstrijden bekijken en zoeken | Wedstrijdlijst met naam, datum, plaats, land, afstand en link naar de organisator. Basisfilters op datum, locatie en afstand. | ✅ Filters op datum, locatie en afstand; afstandscategorieën staan in tabellen |
| 5 | Eigen wedstrijden selecteren | ‘Ik doe mee’, overzicht van eigen wedstrijden en per wedstrijd aangeven of je een buddy zoekt. Meerdere wedstrijden mogen selecteren. | ✅ Overzicht ‘Mijn wedstrijden’ op Home, met buddy-schakelaar |
| 6 | Buddy’s voor dezelfde wedstrijd bekijken | Alleen beschikbare en toegestane profielen tonen; profiel openen en filteren op bijvoorbeeld taal en buddydoel. Een duidelijke melding als er nog niemand is. | ✅ Profiel in een popup; filters op taal, buddydoel, niveau en geslacht |
| 7 | Buddyverzoek sturen en beantwoorden | Verzoek versturen, accepteren of afwijzen; status van verzoeken bekijken en een verbinding verbreken. | ✅ Versturen, accepteren, afwijzen, intrekken en verbreken getest |
| 8 | Eén-op-één berichten | Werkende tekstchat na wederzijdse acceptatie, met berichtgeschiedenis en tijdstempels. | ✅ |
| 9 | Privacy en veiligheid | Profiel zichtbaar/verborgen zetten, contact beperken, gebruiker blokkeren en profiel of bericht melden. De genoemde optie ‘alleen zichtbaar voor vrouwen’ hoort hier als je die aanbiedt. | ✅ Klaar 2026-11-20: verbergen, zichtbaar voor (iedereen/vrouwen/mannen), contact beperken, blokkeren en melden (met optie om meteen te blokkeren). "Zichtbaar voor" werkt op basis van het zelf ingevulde geslacht en is pas sluitend met de identiteitscontrole (punt 31) |
| 10 | Accountinstellingen | Eigen gegevens en voorkeuren aanpassen en account verwijderen. | ✅ Gegevens aanpassen en account verwijderen (markering `is_deleted`) klaar. Verbergen en herstellen getest via Supabase. De knop en de melding bij opnieuw inloggen zijn nog niet met een tweede account getest |
| 11 | Eenvoudig beheerpaneel | Gebruikers en wedstrijden beheren, matches bekijken, meldingen behandelen en accounts blokkeren/verbergen. | 🔧 Gebouwd 2026-11-20: beheerders, de tab Stamtabellen (11a, getest) en de tab Gebruikers (11b, getest). Nog te bouwen: Wedstrijden, Matches, Meldingen |
| 12 | Uitleg en ondersteuning | Korte introductie, eenvoudige FAQ en een contact- of feedbackmogelijkheid. | 🟡 Landingspagina legt de stappen uit; FAQ en contact ontbreken |
| 13 | Basisinzicht in gebruik | Aantal registraties, deelnemers per wedstrijd, buddyverzoeken en geaccepteerde matches. | ⏳ |

Mijn aanvulling op de basic: eenvoudige meldingen bij een buddyverzoek, acceptatie en nieuw bericht. Notificaties staan in het document vooral bij de latere app, maar zonder een melding kunnen de eerste contacten gemakkelijk stilvallen. — **Status: ⏳**

De basis moet bovendien goed werken op een telefoon. Beveiligde toegang tot gegevens, back-ups, foutrapportage en herstelmogelijkheden zijn technische voorwaarden voor deze versie.

Wat ik binnen de basic bewust eenvoudig zou houden:

- Matching begint met dezelfde wedstrijd + voorkeuren + zelf kiezen. Een ingewikkelde matchscore is nog niet nodig.
- Wedstrijden voeg je aanvankelijk zelf via het beheer toe. Een kleine, goede kalender is voldoende.
- Reizen en verblijf delen zijn eerst profielvoorkeuren. Er hoeft nog geen boekings- of reissysteem achter te zitten.
- Chat moet echt functioneren. De in het document genoemde dummychat is alleen bruikbaar voor een demonstratie.

## 2. Direct daarna — de basis aantrekkelijker en effectiever maken

Deze functies helpen gebruikers sneller iemand te vinden en terug te komen.

| Prioriteit | Functie uit het document | Mijn advies | Status |
|---|---|---|---|
| 14 | Groepen per wedstrijd | Eerste grote uitbreiding. Gebruikers kunnen vragen stellen over vervoer, verblijf en voorbereiding. Het document noemt starten bij meer dan tien deelnemers per event. | ⏳ |
| 15 | Deelnemersaantal per wedstrijd | Laat zien waar al activiteit is en waar iemand aansluiting kan vinden. | ⏳ |
| 16 | Zelf een wedstrijd voorstellen | Gebruiker dient een wedstrijd in; beheer controleert die vóór publicatie. | ⏳ |
| 17 | Uitgebreidere buddyfilters | Reisstijl, trainingsvoorkeur en regio/zoekafstand. Voeg filters toe zodra er voldoende aanbod is. | ⏳ |
| 18 | PR’s op het profiel | Zwemmen 1.000 m, fietsen 40 km, lopen 5 en 10 km; optioneel en standaard verborgen. | ✅ |
| 19 | Betere onboarding | Stapsgewijze profielinvoer, voortgangsbalk, tooltips en eerste buddysuggestie. | ⏳ |
| 20 | Nederlands en Engels | Voor een Nederlandse pilot kan één taal volstaan. Bouw de tweede taal vóór een internationale pilot. | ✅ |
| 21 | Naam zoeken en vindbaarheid instellen | Gebruikers kunnen bekenden vinden, met controle over hun eigen zoekbaarheid. | ⏳ |
| 22 | Praktische wedstrijdinformatie | Eventchecklists, voedingstips, informatie over verblijf, vervoer en lokale omstandigheden. | ⏳ |
| 23 | Uitgebreidere analyse en feedback | Zien waar gebruikers afhaken, of zij terugkomen en of buddycontact daadwerkelijk iets oplevert. | ⏳ |
| 24 | Aanvullende loginmogelijkheden | Google of andere sociale login naast de gekozen e-mailmethode. | ⏳ |

Wedstrijdgroepen zou ik dus vóór de marktplaats bouwen. Ze versterken precies de reden waarom iemand zich bij TriBuddy aanmeldt. Ook iemand die nog geen persoonlijke buddy heeft gevonden, kan daar al meedoen.

## 3. Daarna — community en aanvullende gebruikswaarde

| Prioriteit | Functie uit het document | Waarom later? | Status |
|---|---|---|---|
| 25 | Trainingsbuddy’s zoeken buiten wedstrijden | Interessante uitbreiding, maar vraagt een eigen zoekroute op regio, niveau en trainingsvoorkeur. | ⏳ |
| 26 | Groepen en groepschat per regio | Waardevol zodra lokaal voldoende gebruikers actief zijn. | ⏳ |
| 27 | Favoriete gear op het profiel | Atleten tonen welke fiets, schoenen, bril, horloge en andere materialen zij gebruiken. | ⏳ |
| 28 | Gearreviews en materiaalervaringen | Beoordelingen en gebruikstips, eventueel gekoppeld aan een productdatabase. | ⏳ |
| 29 | Marktplaats voor verkopen en ruilen | Eigen advertenties en contact tussen koper en verkoper. Eerst zonder geïntegreerde betaling. | ⏳ |
| 30 | Buddyreviews en buddy-score | Pas zinvol nadat echte ontmoetingen plaatsvinden; vraagt ook beheer van onterechte beoordelingen. | ⏳ |
| 31 | Identiteitscontrole en verified badge | Uitbreiding voor vertrouwen, afzonderlijk van de e-mailverificatie uit de basic. | ⏳ |
| 32 | Veiligheids- of EHBO-certificaten | Optionele profielvermelding met een duidelijke manier van controleren. | ⏳ |
| 33 | Trainingslogboek | Notities, trainingen en doelen bijhouden. | ⏳ |
| 34 | Uitgebreide hulp | Uitlegvideo’s, interactieve rondleiding die je opnieuw kunt starten, live support of communityforum. | ⏳ |
| 35 | Ambassadeurspagina’s en coördinatiegroep | Ondersteuning van ambassadeurs per regio of wedstrijd. | ⏳ |
| 36 | Dark mode | Visuele uitbreiding met beperkte invloed op de kernwaarde. | ⏳ |

De marktplaats wordt in het document ook als mogelijke vroege uitbreiding genoemd. Ik zou die later plaatsen: advertenties, zoekfuncties, misbruikmeldingen en beheer vormen samen een behoorlijk tweede product.

## 4. Pas bij bewezen gebruik — premium, app en koppelingen

| Prioriteit | Functie of optie uit het document | Invulling | Status |
|---|---|---|---|
| 37 | Geavanceerde matching | Matching op tempo, PR’s, afstand, gear en uitgebreidere voorkeuren. | ⏳ |
| 38 | Premium abonnement | Betaalde extra’s en beheer van abonnementen. Freemium, jaarlijkse bijdrage en donaties worden als opties genoemd. | ⏳ |
| 39 | Premium voordelen | Bijvoorbeeld hotelgidsen, uitgebreidere filters of buddyprioriteit. Eerst toetsen waarvoor gebruikers willen betalen. | ⏳ |
| 40 | Affiliate-links | Verwijzingen naar gear, voeding, reisbagage en accommodatie. | ⏳ |
| 41 | Sponsoring en advertenties | Sponsorvermeldingen, partneracties, kortingscodes en gerichte advertenties. | ⏳ |
| 42 | Betalingen | Stripe/Mollie voor abonnementen, eventueel later voor marktplaatsfuncties. | ⏳ |
| 43 | iOS- en Android-app | Profiel, zoeken, chat, notificaties en locatiegebonden tips. Eerst de mobiele website bewijzen. | ⏳ |
| 44 | Koppelingen met sportplatforms | Strava, TrainingPeaks en Final Surge; import van relevante sport- of trainingsgegevens. | ⏳ |
| 45 | Externe evenementenkalenders | Kalenderintegraties met wedstrijdorganisaties. | ⏳ |
| 46 | Externe groepskanalen | Eventueel koppelen aan Discord of Slack. | ⏳ |
| 47 | Verdere internationalisering | Extra talen, regionale onboarding en lokale content. | ⏳ |
| 48 | Uitgebreide dashboards | Retentie, uitval, tevredenheid, marketingconversie, omzet en gebruik van de marktplaats. | ⏳ |
| 49 | Platform voor clubs of organisatoren | — | ⏳ |
| 50 | AVG: bewaartermijn verwijderde accounts | Accounts worden nu alleen gemarkeerd als verwijderd (`is_deleted`), zodat herstel mogelijk is. Vastleggen hoe lang die gegevens bewaard worden, en daarna definitief verwijderen of anonimiseren (ook chatberichten en matches). Het recht op vergetelheid regelen: een verzoek tot direct definitief verwijderen. Dit opnemen in de privacyverklaring. | ⏳ (toegevoegd 2026-11-20) |

## Gemaakte keuzes

Per punt de besluiten die tijdens het bouwen zijn genomen, met datum. SQL-scripts staan in `From_Claude/`.

### 1 — Registreren en inloggen (2025/2026)
- Eén loginmethode: e-maillink (magic link / OTP) van Supabase.
- `users.id` is gelijk aan het id van de inlog (`auth.users`), maar er is geen database-koppeling (foreign key) tussen beide. Bij punt 10 is bewust gekozen voor een markering in plaats van een koppeling.

### 3 — Aangeven waarvoor je een buddy zoekt (2026-11-20)
- Talen staan als vaste lijst in de tabel `languages`, zodat er gematcht kan worden. Vrije tekst werkte daar niet voor.
  - Codes volgen ISO 639-1 (`nl`, `de`, `fr`, …), niet de landcodes van autostickers. Een land is niet altijd één taal: B, CH en A laten dat zien.
  - In de app verschijnt een taal als gewoon lichtblauw label met de naam, in dezelfde stijl als de afstandscategorieën. Een ovale sticker met de code is geprobeerd, maar afgewezen: niet mooi en een te groot blok.
  - Op de profielpagina kies je talen met een keuzelijst "Taal toevoegen…". Daarin staan alleen de talen die je nog niet hebt gekozen. Je gekozen talen staan eronder als labels; met ✕ verwijder je er een.
  - Startvulling: 41 Europese talen (nl en de fr es it pt pl cs sk sl hr sr bs mk bg ro hu el sq da sv no fi is et lv lt ga cy mt lb ca eu gl fy rm uk be ru tr).
  - Namen (NL/EN) staan sinds punt 11a in de tabel zelf (`label_nl`, `label_en`). Een nieuwe taal voeg je toe in Beheer → Stamtabellen. Een taal niet meer aanbieden: zet `is_active` uit.
  - Een gebruiker kiest één of meer talen. Die staan in de koppeltabel `user_languages`. De talen van anderen zijn alleen leesbaar als je hun profiel mag zien (dezelfde regel als bij punt 9).
  - De oude tekstkolom `users.languages` is verwijderd. Er hadden nog geen gebruikers talen ingevuld; het script controleert dat voordat het de kolom weghaalt.
- Matchen: geen harde voorwaarde. Bij Deelnemers gebruikt het taalfilter de vaste lijst, en er is een vinkje "Alleen wie een taal met mij deelt" (standaard uit).
- Voorkeur voor het geslacht van je buddy (`users.buddy_gender_pref`: geen voorkeur / man / vrouw) is privé. Het geslachtsfilter bij Deelnemers start op die voorkeur, maar je kunt het altijd aanpassen. Het is geen blokkade.
- Script: `languages.sql`.

### 4 — Wedstrijden bekijken en zoeken (2026-11-20)
- Datum: velden Van en Tot. Afgelopen wedstrijden staan standaard niet in de lijst; het vinkje "Toon afgelopen wedstrijden" laat ze zien.
- Locatie: één zoekveld dat in plaats en land zoekt. De landnamen in de data zijn niet eenduidig ("NL" en "Nederland").
- Afstand: vaste categorieën in tabellen, zodat ze onderhoudbaar zijn. Een vaste lijst in een check-constraint is afgewezen.
  - Tabellen: `distance_groups`, `distance_categories` (met `sort_order`, `is_active`) en de koppeltabel `event_distance_categories`. Iedereen mag lezen; schrijven gaat via Supabase.
  - Namen (NL/EN) staan sinds punt 11a in de tabellen zelf (`label_nl`, `label_en`), te onderhouden in Beheer → Stamtabellen.
  - Een wedstrijd kan meerdere categorieën hebben. De vrije tekst in `events.distance` blijft staan als omschrijving.
  - Script: `events-distance-categories.sql`.
- De lijst toont alleen wedstrijden met `status = 'published'` en `is_visible = true`.
- Open: TRI HARD heeft nog geen categorie. "Mijn wedstrijden" verbergt nog geen onzichtbare wedstrijden (oppakken bij het beheerpaneel).

### 5 — Eigen wedstrijden selecteren (2026-11-20)
- Het overzicht "Mijn wedstrijden" staat op de Home-pagina, niet als aparte tab of menu-item.
- Per komende wedstrijd een eigen buddy-schakelaar in het overzicht.
- Afgelopen wedstrijden staan onderaan onder "Afgelopen", zonder schakelaar.

### 6 — Buddy's voor dezelfde wedstrijd bekijken (2026-11-20)
- Een profiel opent in een popup, met daarin dezelfde buddy-knop als in de lijst.
- Iedereen blijft zichtbaar. Het filter "Alleen wie een buddy zoekt" (buddy-schakelaar voor die wedstrijd aan) staat standaard aan.
- Filters op taal, buddydoel, niveau en geslacht. Wie het geslacht niet openbaar maakt, valt weg bij het geslachtsfilter.
- De popup toont alles wat de view `public_profiles` vrijgeeft, met leeftijd in plaats van geboortedatum.
- Een aparte melding als niemand aan de filters voldoet, met de knop "Filters wissen".
- Extra: op de detailpagina een link "← Alle events" (gaat altijd naar `/events`).

### 7 — Buddyverzoek sturen en beantwoorden (2026-11-13)
- Afwijzen: de aanvrager ziet "Afgewezen" en kan voor die wedstrijd geen nieuw verzoek sturen.
- Verbreken: de status wordt `ended`, de berichten blijven in de database en het is definitief voor dat paar en die wedstrijd.
- Intrekken: de aanvrager kan een openstaand verzoek intrekken (`withdrawn`) en daarna opnieuw sturen.
- Afwijzen en verbreken vragen om bevestiging in een eigen venster (niet het standaardvenster van de browser).
- Script: `matches-status.sql`.

### 8 — Eén-op-één berichten (2026-11-13)
- Tijdstempels: van vandaag alleen de tijd, van eerdere dagen datum en tijd.

### 9 — Privacy en veiligheid (2026-11-20)
- Profiel verbergen (`users.is_hidden`): je staat niet meer in deelnemerslijsten en nieuwe mensen kunnen je geen verzoek sturen. Bestaande buddy's en chats blijven werken.
- Zichtbaar voor (`users.visible_to`): Iedereen / Alleen vrouwen (V) / Alleen mannen (M). De controle gebruikt het echte geslachtsveld van de kijker, ook als die het niet openbaar maakt. Wie "-" heeft ingevuld, ziet profielen met een beperking niet.
  - Beperking: iedereen vult het geslacht zelf in en niemand controleert het. Het is pas sluitend met de identiteitscontrole (punt 31).
- Een bestaande buddy-relatie gaat vóór verbergen en zichtbaar-voor: een openstaand verzoek, een verbinding, maar ook een afwijzing of verbreking (alleen een ingetrokken verzoek telt niet). Na een test op 2026-11-20 is bewust besloten dit zo te laten.
- Contact beperken: het bestaande vinkje "Ik sta open voor een buddy" (`open_for_buddy`) is de hoofdschakelaar. Staat het uit, dan kan niemand je een verzoek sturen; de database dwingt dat af.
- Blokkeren: alleen geen contact. Jullie zien elkaar nog wel in lijsten, maar verzoeken en berichten worden geweigerd.
  - Een bestaande verbinding blijft staan; de chat gaat op slot. Na deblokkeren kan de chat weer verder.
  - Wie geblokkeerd is, krijgt een algemene foutmelding en ziet de knop "Connect" niet meer. Technisch kan iemand via de API afleiden dat hij geblokkeerd is; die afweging is geaccepteerd.
  - Deblokkeren gaat via de profielpagina.
- Melden: van een profiel en van een chatbericht, met een reden en een optionele toelichting.
  - De redenen staan in de tabel `report_reasons` (onderhoudbaar). Sinds punt 11a staan de namen ook in die tabel (`label_nl`, `label_en`).
  - Meldingen worden opgeslagen in `reports`, met de status `open` / `in_progress` / `resolved` / `dismissed`. Tot het beheerpaneel (punt 11) bekijk je ze in Supabase.
  - In het meldvenster kun je ook meteen blokkeren: het vinkje "{naam} blokkeren", standaard uit, met de uitleg van blokkeren erbij. Eerst wordt de melding opgeslagen, daarna de blokkade. Is de persoon al geblokkeerd, dan verschijnt het vinkje niet. Getest op 2026-11-20.
- Wat de database afdwingt: verborgen profielen, zichtbaarheid, "open voor buddy" en blokkades worden gecontroleerd in de view `public_profiles` en in triggers op `matches` en `chat_messages`.
- Scripts: `privacy-safety.sql` en het herstelscript `privacy-safety-fix1.sql`. Dat herstelt de view `public_profiles`, die een rechtenfout gaf (een functie in een view wordt gecontroleerd met de rechten van de gebruiker van de view). `privacy-safety.sql` is zelf ook bijgewerkt.

### 10 — Accountinstellingen (2026-11-20)
- Account verwijderen is een "zachte" verwijdering: een markering `users.is_deleted` en `deleted_at`, zodat herstel mogelijk is. Er wordt niets echt gewist.
- Er komt alleen een markering op `users`. Deelnames, matches en chats blijven staan, maar zijn onzichtbaar omdat de view `public_profiles` verwijderde gebruikers overslaat en de app rijen zonder zichtbaar profiel weglaat.
- Verwijderen gebeurt na een eenvoudig bevestigingsvenster. Daarna word je uitgelogd.
- Opnieuw inloggen met een verwijderd account: je ziet een melding en wordt uitgelogd. Herstellen kan alleen de beheerder, voorlopig via Supabase (`is_deleted = false`, `deleted_at` leeg).
- Via de app kun je de markering niet zelf zetten of terugzetten (trigger); alleen de functie `delete_my_account()` mag dat.
- AVG (bewaartermijn, definitief verwijderen) staat als punt 50 op de lijst.
- Script: `users-soft-delete.sql`.

### 11 — Eenvoudig beheerpaneel (2026-11-20)
- Een eigen pagina `/admin` met de tabs Gebruikers, Wedstrijden, Matches, Meldingen en Stamtabellen. Alleen beheerders zien de link "Beheer" in het menu.
- Beheerders staan in de tabel `admins`. Via de app kan niemand die lezen of beschrijven; je voegt een beheerder toe met SQL. De functie `is_admin()` controleert in de toegangsregels elke beheeractie. De beveiliging zit dus in de database, niet in de app.
- Blokkeren door de beheerder betekent schorsen: een eigen markering `is_suspended` met reden en datum. Een geschorste gebruiker kan niet inloggen en is voor niemand zichtbaar. Dit is terug te draaien en staat los van "verwijderd" (punt 10). (Komt bij de tab Gebruikers.)
- Chats: de beheerder ziet alleen gemelde berichten, met een paar berichten ervoor als context. Overige chats blijven privé. (Komt bij de tab Meldingen.)
- Volgorde van bouwen: eerst stamtabellen en namen (11a), daarna Gebruikers, Wedstrijden, Matches en Meldingen.
- Stamtabellen en namen:
  - Namen van stamtabel-items staan in de database, in de kolommen `label_nl` en `label_en` per tabel. Zo zijn ze op één plek te onderhouden in het beheerscherm.
  - Schermteksten (knoppen, kopjes, uitleg, foutmeldingen) blijven in `nl.js`/`en.js`.
  - De app toont de naam in de huidige taal, anders in de andere taal, anders de code.
  - Gekozen voor kolommen in plaats van een aparte vertaaltabel: eenvoudiger. Bij een derde schermtaal (punt 47) krijgt elke stamtabel een extra kolom.
  - In de tab Stamtabellen: Talen, Afstandsgroepen, Afstandscategorieën, Meldredenen, Ervaringsniveaus en Geslacht.
  - Per rij te wijzigen: namen, volgorde, actief en (bij categorieën) de groep. Een nieuwe rij voeg je toe met een vaste code. Verwijderen kan alleen als niemand de waarde gebruikt; anders zet je hem op inactief.
  - Ervaringsniveaus (`experience_levels`) en geslacht (`genders`: M, V en "-" voor niet opgegeven) zijn nieuwe stamtabellen. `users.experience_level` en `users.gender` verwijzen ernaar.
  - "Zichtbaar voor" en de buddy-voorkeur kennen naast een geslacht de aparte waarden `all` / `any`. Een trigger controleert ze tegen de tabel `genders` ("-" telt daar niet als keuze).
- Layout van de tab Stamtabellen: per item een blok. Bovenaan staan groep (alleen bij categorieën), code, volgorde en actief; daaronder de namen NL en EN over de volle breedte. Een brede tabel is afgewezen.
- Tab Gebruikers (11b):
  - De lijst toont naam, e-mail, aangemaakt op, status (actief / verborgen / geschorst / verwijderd, plus beheerder) en de aantallen deelnames en meldingen tegen de gebruiker. Je kunt zoeken op naam of e-mail en filteren op status.
  - Acties in de popup van een gebruiker:
    - schorsen (reden verplicht) en de schorsing opheffen;
    - een verwijderd account herstellen;
    - het profiel verbergen of tonen;
    - iemand beheerder maken of de beheerrechten intrekken. Jezelf schorsen of je eigen beheerrechten intrekken kan niet.
  - Een geschorste gebruiker ziet bij het inloggen een melding zonder reden en wordt uitgelogd. De reden is alleen zichtbaar voor beheerders. Geschorste gebruikers zijn voor niemand zichtbaar, ook niet voor bestaande buddy's.
  - Logboek: elke beheeractie staat in `admin_actions` (beheerder, gebruiker, actie, reden, tijdstip) en is te zien in de popup.
  - Alle acties lopen via databasefuncties (`admin_list_users`, `admin_set_suspended`, `admin_restore_user`, `admin_set_hidden`, `admin_set_admin`). Die controleren zelf `is_admin()`. Via de app kan niemand de schorsing zelf zetten of opheffen (trigger).
- Scripts: `admin-masterdata.sql` en `admin-users.sql`.

### 50 — AVG: bewaartermijn verwijderde accounts (2026-11-20)
- Toegevoegd als gevolg van de keuze voor een "zachte" verwijdering bij punt 10.

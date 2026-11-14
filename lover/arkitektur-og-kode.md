# Arkitektur og kode

Dette dokumentet beskriver grunnprinsipper, teknologivalg og oppsett av repoer.

## 1. Grunnprinsipp

- Ett sett med krav, flere teknologistacker og deploy-adaptere.
- Test skal være fleksibelt. Produksjon skal være kontrollert.
- GitHub-status alene hindrer ikke direkte deploy fra en skyleverandør. Produksjonsrettigheter og triggere må også begrenses (se [sikkerhet.md](sikkerhet.md)).

## 2. Teknologivalg

- Nye frontendprosjekter: Svelte og TypeScript (SvelteKit).
- Ikke introduser React i nye prosjekter.
- Pakkehåndtering: npm, med `package-lock.json` sjekket inn.
- Alle prosjekter skal ha et fungerende `npm run check`.

## 3. Branchstrategi

| Branch | Miljø |
|---|---|
| `develop` | Test |
| `main` | Produksjon |

## 4. Pilotrepo: engineering-standards-poc

Et nytt, offentlig pilotrepo med denne strukturen:

```text
engineering-standards-poc/
  .github/workflows/quality.yml
  .github/dependabot.yml
  AGENTS.md
  CLAUDE.md
  docs/policy.md
  src/
  package.json
  package-lock.json
```

- Bruk syntetiske data og ingen ekte nøkler.
- Opprett et SvelteKit/TypeScript-prosjekt med npm og et fungerende `npm run check`.
- Bruk branchene `develop` og `main`.

## 5. Policy og AI-instruksjoner

Alle repoer skal ha en `AGENTS.md` med minst dette innholdet:

```markdown
# AGENTS.md

- Nye frontendprosjekter: Svelte og TypeScript.
- Ikke introduser React i nye prosjekter.
- Bruk DigDirs designsystem der det er kompatibelt.
- Ingen hemmeligheter eller persondata i kode.
- Tilgjengelighet, sikkerhet og personvern skal vurderes.
```

- `CLAUDE.md` skal henvise eksplisitt til `AGENTS.md`.
- Tilsvarende instruksjoner legges inn i Lovable.

> **Merk:** Instruksjoner hjelper AI-agentene, men er ikke håndhevbare sikkerhetskontroller. Håndheving skjer gjennom kontrollene i [sikkerhet.md](sikkerhet.md).

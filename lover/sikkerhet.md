# Sikkerhet

Dette dokumentet beskriver sikkerhetskrav, kvalitetskontroller, miljøpolicy og deploy.

## 1. Grunnregler

- Ingen hemmeligheter (nøkler, tokens, passord) eller persondata i kode.
- Bruk syntetiske data i test og pilot.
- Bruk separate rettigheter og hemmeligheter per miljø.
- Tilgjengelighet, sikkerhet og personvern skal vurderes i alle prosjekter.

## 2. Quality Gate (GitHub Actions)

En liten, ekte kontroll som kjører på alle pull requests mot `develop` og `main`.

Fil: `.github/workflows/quality.yml`

```yaml
name: Quality Gate

on:
  pull_request:
    branches: [develop, main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run check
      - name: Block direct React dependencies
        run: |
          node - <<'NODE'
          const p = require('./package.json');
          const deps = {...p.dependencies, ...p.devDependencies};
          const forbidden = ['react','react-dom','next','react-scripts'];
          const found = forbidden.filter(x => Object.hasOwn(deps,x));
          if (found.length) {
            console.error('Forbidden:', found);
            process.exit(1);
          }
          NODE
```

> **Begrensning:** Dette er en minimal kontroll av direkte avhengigheter. Den fanger ikke alle transitive avhengigheter eller kildekodeimporter. Bruk en mer komplett policy-sjekk etter piloten.

## 3. Avhengigheter: Dependabot og Snyk

Fil: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
```

- Aktiver Dependabot-alerts og oppdateringsforslag.
- Importer repoet i Snyk, aktiver PR-kontroll og verifiser hvilket statusnavn Snyk faktisk rapporterer.
- En Dependabot-alert er ikke automatisk en blokkerende PR-status.
- Bruk gjerne Snyk til å stoppe nye high/critical-funn i prod, med dokumenterte unntak for eksisterende funn.

## 4. Miljøpolicy: advarsel i test, sperre i prod

| Branch | Miljø | Krav |
|---|---|---|
| `develop` | Test | Kontroller kjører og rapporterer funn, men er ikke obligatoriske for merging, slik at teamet kan eksperimentere. |
| `main` | Prod | Beskyttet med ruleset/branch protection. Krever Quality Gate og verifisert Snyk-status. Endringer via pull request, eventuelt med menneskelig godkjenning. |

> **Merk:** På GitHub Free fungerer beskyttelsesregler for offentlige repoer. Verifiser oppsett og eventuelle miljøgodkjenninger før produksjonsflyten baseres på dem.

## 5. Deploy uten omveier

- Vercel og Azure kan bruke hver sin deploymetode, men produksjonsdeploy må være bundet til en godkjent commit på `main`.
- Slå av eller begrens direkte produksjonsdeploy som omgår kontrollene.
- Bruk separate rettigheter og hemmeligheter per miljø.
- Lokale tjenester krever egen, låst deploymekanisme.

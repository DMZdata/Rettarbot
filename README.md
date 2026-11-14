# Rettarbot ⚖️

> Lovverket for alt vi bygger hos DMZ data.

## Hva er en rettarbot?

På norrønt betyr *réttarbót* «forbedring av retten». I middelalderen var lovene på plass (blant annet Magnus Lagabøtes landslov fra 1274), men verden endret seg. I stedet for å skrive om hele lovboka utstedte kongen en retterbot: en liten rettelse, et tillegg eller en presisering.

Det er akkurat det dette repoet er: ikke en ferdig lovbok, men et levende regelverk som forbedres litt etter litt.

| GitHub | Middelalder |
|---|---|
| Pull request | Forslag til retterbot |
| Review | Lovbehandling |
| Merge | Retterboten er vedtatt |
| Breaking change | Lovendring |
| CODEOWNERS | Lovsigemennene |

## Innhold

```text
rettarbot/
├── README.md
├── lover/          Regler som gjelder alle prosjekter
│   ├── arkitektur-og-kode.md
│   └── sikkerhet.md
└── utsjaad/        Utseende og brukergrensesnitt
    └── design.md
```

| Dokument | Tema |
|---|---|
| [Arkitektur og kode](lover/arkitektur-og-kode.md) | Grunnprinsipp, teknologivalg, branchstrategi, pilotrepo og AI-instruksjoner (AGENTS.md / CLAUDE.md) |
| [Sikkerhet](lover/sikkerhet.md) | Quality Gate i GitHub Actions, Dependabot og Snyk, miljøpolicy for test og prod, deploy |
| [Design](utsjaad/design.md) | Svelte, DigDirs designsystem, tilgjengelighet og personvern |

Senere kan vi legge til `handverk/` (praktiske retningslinjer for Svelte, TypeScript og testing) og `avgjerder/` (arkitekturbeslutninger, ADR-er).

## Status

Første utkast, basert på Quality Gate / POC v2.1.

## Lisens

[MIT](LICENSE)

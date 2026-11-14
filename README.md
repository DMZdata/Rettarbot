# Rettarbot ⚖️

> Lovverket for alt vi bygger hos DMZ data.

På norrønt betyr *réttarbót* «forbedring av retten». I middelalderen skrev ikke kongen om hele lovboka når verden endret seg, han utstedte en retterbot: en liten rettelse eller et tillegg. Det er det dette repoet er: et levende regelverk som forbedres litt etter litt.

| GitHub | Middelalder |
|---|---|
| Pull request | Forslag til retterbot |
| Review | Lovbehandling |
| Merge | Retterboten er vedtatt |
| 🔴 på main | Lovbrudd, ingen merge |

## Slik virker det

| Branch | Rettarboten |
|---|---|
| `develop` | Sjekker og viser 🟢🟡🔴, stopper ingenting |
| `main` | 🔴 stopper merge |

| Lys | Betyr |
|---|---|
| 🟢 | OK |
| 🟡 | Avvik fra anbefaling (advarsel) |
| 🔴 | Brudd på krav |
| ⚪ | Ikke aktuelt / vurderes manuelt |

Se resultatet: Actions → siste kjøring → Summary.

## Koble på et repo

1. Kopier [`mal/rettarbot.yml`](mal/rettarbot.yml) til `.github/workflows/rettarbot.yml` i repoet.
2. Settings → Rules → Rulesets → ny regel for `main`: krev pull request og status-sjekken `rettarbot / Rettarbot`.

Rulesets virker kun på offentlige repoer på GitHub Free.

## Innhold

| Mappe | Innhold |
|---|---|
| [`regler/`](regler) | Reglene (én YAML-fil per tema) |
| [`sjekk/`](sjekk) | Skriptet som sjekker reglene |
| [`.github/workflows/sjekk.yml`](.github/workflows/sjekk.yml) | Felles GitHub Action |
| [`mal/`](mal) | Fil som kopieres inn i andre repoer |

## Ny regel

1. Legg den til i riktig fil i `regler/` (`nivå: rød` eller `gul`).
2. Automatisk sjekk: legg til en funksjon i `sjekk/rettarbot.mjs`. Ellers: `sjekk: manuell`.

## Lisens

[MIT](LICENSE)

// Rettarbot: sjekker et repo mot reglene i regler/*.yml
// Bruk: node rettarbot.mjs <kodemappe> <reglermappe>
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const [kodeDir = '.', reglerDir = 'regler'] = process.argv.slice(2);
const malBranch = process.env.MAL_BRANCH || '';
const erProd = malBranch === 'main';

// Enkel leser for listeformatet i regler/*.yml
function lesRegler(dir) {
  const regler = [];
  for (const fil of fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).sort()) {
    let regel = null;
    for (const linje of fs.readFileSync(path.join(dir, fil), 'utf8').split('\n')) {
      if (!linje.trim() || linje.trim().startsWith('#')) continue;
      const m = linje.match(/^\s*(-\s+)?([\p{L}\d_-]+):\s*(.*?)\s*$/u);
      if (!m) continue;
      if (m[1]) regler.push((regel = {}));
      if (regel) regel[m[2]] = m[3];
    }
  }
  return regler;
}

const fil = (p) => path.join(kodeDir, p);
const finnes = (p) => fs.existsSync(fil(p));
const les = (p) => fs.readFileSync(fil(p), 'utf8');

let pkg = null;
if (finnes('package.json')) {
  try { pkg = JSON.parse(les('package.json')); } catch { pkg = { ugyldig: true }; }
}
const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};

const ok = (melding = 'OK') => ({ status: 'ok', melding });
const feil = (melding) => ({ status: 'feil', melding });
const ikkeAktuelt = { status: 'na', melding: 'Ikke aktuelt (ingen package.json)' };

const sjekker = {
  manuell: () => ({ status: 'na', melding: 'Vurderes manuelt' }),

  hemmeligheter() {
    const rapport = process.env.GITLEAKS_RAPPORT;
    if (!rapport || !fs.existsSync(rapport)) return feil('Fant ikke gitleaks-rapport');
    const funn = JSON.parse(fs.readFileSync(rapport, 'utf8') || '[]');
    if (!funn.length) return ok('Ingen funn');
    const liste = funn.slice(0, 10).map((f) => `${String(f.File).replace(/^\/kode\//, '')}:${f.StartLine} (${f.RuleID})`);
    return feil(`${funn.length} funn: ${liste.join(', ')}`);
  },

  'ingen-react'() {
    if (!pkg) return ikkeAktuelt;
    const funnet = ['react', 'react-dom', 'next', 'react-scripts'].filter((x) => Object.hasOwn(deps, x));
    return funnet.length ? feil(`Fant: ${funnet.join(', ')}`) : ok();
  },

  'package-lock'() {
    if (!pkg) return ikkeAktuelt;
    return finnes('package-lock.json') ? ok() : feil('package-lock.json mangler');
  },

  'npm-check'() {
    if (!pkg) return ikkeAktuelt;
    if (pkg.ugyldig) return feil('package.json er ugyldig');
    if (!pkg.scripts?.check) return feil('Mangler scriptet "check" i package.json');
    if (!finnes('package-lock.json')) return feil('Kan ikke kjøre npm ci uten package-lock.json');
    try {
      execSync('npm ci --no-audit --no-fund && npm run check', { cwd: kodeDir, stdio: 'pipe', encoding: 'utf8' });
      return ok('npm ci og npm run check gikk gjennom');
    } catch (e) {
      const ut = `${e.stdout || ''}\n${e.stderr || ''}`.trim().split('\n').filter(Boolean).slice(-5).join(' / ');
      return feil(`Feilet: ${ut}`);
    }
  },

  'svelte-typescript'() {
    if (!pkg) return ikkeAktuelt;
    const mangler = ['svelte', 'typescript'].filter((x) => !Object.hasOwn(deps, x));
    return mangler.length ? feil(`Mangler: ${mangler.join(', ')}`) : ok();
  },

  'agents-md': () => (finnes('AGENTS.md') ? ok() : feil('AGENTS.md mangler')),

  'claude-md'() {
    if (!finnes('CLAUDE.md')) return feil('CLAUDE.md mangler');
    return les('CLAUDE.md').includes('AGENTS.md') ? ok() : feil('CLAUDE.md nevner ikke AGENTS.md');
  },

  dependabot: () =>
    finnes('.github/dependabot.yml') || finnes('.github/dependabot.yaml') ? ok() : feil('.github/dependabot.yml mangler'),
};

const ikon = { ok: '🟢', gul: '🟡', rod: '🔴', na: '⚪' };

const resultater = lesRegler(reglerDir).map((r) => {
  let res;
  try {
    res = sjekker[r.sjekk] ? sjekker[r.sjekk]() : feil(`Ukjent sjekk: ${r.sjekk}`);
  } catch (e) {
    res = feil(`Sjekken krasjet: ${e.message}`);
  }
  const lys = res.status === 'feil' ? (r['nivå'] === 'rød' ? 'rod' : 'gul') : res.status;
  return { ...r, lys, melding: String(res.melding).replace(/\s+/g, ' ') };
});

const antall = (lys) => resultater.filter((r) => r.lys === lys).length;
const roede = antall('rod');
const gule = antall('gul');
const totalt = roede ? '🔴 Rødt' : gule ? '🟡 Gult' : '🟢 Grønt';
const stopper = erProd && roede > 0;

for (const r of resultater) {
  console.log(`${ikon[r.lys]} ${r.id} ${r.regel}: ${r.melding}`);
  if (r.lys === 'rod') console.log(`::${erProd ? 'error' : 'warning'} title=Rettarbot ${r.id}::${r.regel}: ${r.melding}`);
  if (r.lys === 'gul') console.log(`::warning title=Rettarbot ${r.id}::${r.regel}: ${r.melding}`);
}

const celle = (s) => String(s ?? '').replace(/\|/g, '\\|');
const sammendrag = [
  `## Rettarbot: ${totalt}`,
  '',
  `Branch: \`${malBranch || 'ukjent'}\` · ${erProd ? 'main: rødt stopper merge' : 'test: ingenting stoppes'}`,
  '',
  `🟢 ${antall('ok')} · 🟡 ${gule} · 🔴 ${roede} · ⚪ ${antall('na')}`,
  '',
  '| | ID | Regel | Resultat |',
  '|---|---|---|---|',
  ...resultater.map((r) => `| ${ikon[r.lys]} | ${r.id} | ${celle(r.regel)} | ${celle(r.melding)} |`),
  '',
  stopper ? '**Stoppet:** rett de røde punktene før merge til main.' : '',
  '',
  'Regler: https://github.com/DMZdata/Rettarbot/tree/main/regler',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${sammendrag}\n`);
console.log(`\nResultat: ${totalt}${stopper ? ' (stopper merge til main)' : ''}`);
process.exit(stopper ? 1 : 0);

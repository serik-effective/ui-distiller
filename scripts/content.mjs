#!/usr/bin/env node
/**
 * UI Distiller — placeholder content packs.
 *
 * Builds a content.json for a technical copy from a random selection of the
 * DESIGN.md files in voltagent/awesome-design-md (MIT): real design-system
 * prose, palettes and type notes rather than lorem ipsum, so a demonstration
 * page reads like a design page instead of filler.
 *
 * Those files are deliberately anonymised interpretations, not the brands
 * themselves. Do not reintroduce a real company's name, logo or claims.
 *
 * Usage:
 *   node scripts/content.mjs --out <root>/site/content.json [--count 8] [--seed 42] [--offline]
 *
 * Falls back to a small built-in pack when the network is unavailable, so a run
 * never blocks on it. Exit 0 always; the pack says which source it used.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFile } from 'node:child_process';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const has = n => argv.includes('--' + n);

const out = resolve(arg('out', 'content.json'));
const count = Number(arg('count', 8));
const seed = Number(arg('seed', Date.now() % 100000));
const REPO = 'voltagent/awesome-design-md';
const RAW = `https://raw.githubusercontent.com/${REPO}/main/design-md`;

/* deterministic shuffle, so a seed reproduces a pack */
const rng = (s => () => (s = s * 16807 % 2147483647) / 2147483647)(seed % 2147483646 || 7);

function get(url) {
  return new Promise(resolve2 => {
    execFile('curl', ['-sSL', '-m', '25', '-H', 'User-Agent: ui-distiller', url],
      { maxBuffer: 32 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout) => resolve2(err && !stdout ? null : stdout));
  });
}

/* --- parse the bits of a DESIGN.md that make good page furniture --- */
function parseDesignMd(text, slug) {
  const name = (/^name:\s*(.+)$/m.exec(text)?.[1] || slug)
    .replace(/-?inspired-?/i, ' ').replace(/-?design-?analysis/i, '').replace(/[-_]+/g, ' ').trim();

  // the front-matter description runs until the next top-level key
  const descBlock = /^description:\s*([\s\S]*?)(?:\n[a-z-]+:|\n---)/m.exec(text)?.[1] || '';
  const description = descBlock.replace(/\s+/g, ' ').trim();

  const colors = [...text.matchAll(/^\s{2}[\w-]+:\s*"(#[0-9a-fA-F]{3,8})"/gm)].map(m => m[1]);
  const headings = [...text.matchAll(/^#{2,3}\s+(.{3,48})$/gm)].map(m => m[1].trim());
  const fonts = [...new Set([...text.matchAll(/(?:font-family|family|typeface)\s*:?\s*"?([A-Z][\w .-]{2,26})"?/g)].map(m => m[1].trim()))];

  // The collection is already anonymised, but individual sentences still name
  // products and companies. Rather than rewriting them — which produces nonsense
  // like "the system design system" — keep only the sentences that carry no
  // proper nouns at all. There is plenty of generic design prose to choose from.
  const ALLOW = new Set(['CTA', 'CTAs', 'UI', 'UX', 'AI', 'CSS', 'RGB', 'HSL', 'SVG', 'API', 'The', 'A', 'An', 'It', 'Its', 'This', 'These', 'Type', 'Colour', 'Color', 'Motion', 'Layout', 'Surface', 'Buttons', 'Cards', 'Display', 'Body']);
  const slugToken = new RegExp(slug.replace(/[^a-z0-9]+/gi, '[^a-z0-9]?'), 'i');
  const isNeutral = t => {
    if (/[{}`]|https?:/.test(t)) return false;                      // template refs, code, links
    if (slugToken.test(t)) return false;                            // catches hashicorpSans, figmaBlue, …
    // no positional exemption: a sentence that opens with a brand name is exactly
    // the kind that would read as a claim about a real company
    const caps = t.match(/\b[A-Z][\w.-]{1,}\b/g) || [];
    return caps.every(w => ALLOW.has(w));
  };
  const stripPrefix = t => t.replace(/^An?\s+inspired interpretation of\s+[^—-]+[—-]\s*/i, '').trim();

  const clean = stripPrefix(description);
  const sentences = clean.split(/(?<=\.)\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 60 && t.length < 240 && isNeutral(t));

  // A neutral label for display. The source entry's own name stays in `name` for
  // the credit line only: a page that listed real companies as its projects
  // would be claiming a client list it does not have.
  const hueWord = hex => {
    if (!hex) return 'Neutral';
    const n = parseInt(hex.slice(1, 7).padEnd(6, '0'), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 24) return max > 170 ? 'Chalk' : max > 90 ? 'Slate' : 'Ink';
    if (max === r) return b > g ? 'Magenta' : 'Ember';
    if (max === g) return 'Verdant';
    return r > g ? 'Violet' : 'Cobalt';
  };
  const NOUNS = ['Field', 'Works', 'Press', 'Studio', 'Practice', 'Atlas', 'Method', 'Archive'];
  const label = `${hueWord(colors[0])} ${NOUNS[[...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % NOUNS.length]}`;

  return {
    slug, name, label,
    kind: headings.find(h => /colou?r|type|motion|layout|surface|brand/i.test(h)) || 'Design system',
    blurb: sentences[0] || null,
    notes: sentences.slice(1, 4),
    palette: [...new Set(colors)].slice(0, 3),
    font: fonts[0] || null,
    sections: headings.slice(0, 6),
  };
}

const FALLBACK = {
  source: 'built-in (network unavailable)',
  license: 'n/a',
  items: [
    { slug: 'ink', name: 'Ink & Canvas', kind: 'Colour', blurb: 'A near-white canvas carries a single deep ink, with one saturated accent reserved for the moment a choice is committed.', notes: [], palette: ['#0d253d', '#f6f9fc', '#533afd'], font: null, sections: [] },
    { slug: 'measure', name: 'Measure', kind: 'Typography', blurb: 'Display type is set tight and heavy; body type stays at a comfortable measure and never competes with it.', notes: [], palette: ['#1c1e54', '#e3e8ee', '#ea2261'], font: null, sections: [] },
    { slug: 'settle', name: 'Settle', kind: 'Motion', blurb: 'Entrances are long and eased out; exits are short and symmetric, so leaving never reads as an undo.', notes: [], palette: ['#273951', '#f5e9d4', '#4434d4'], font: null, sections: [] },
    { slug: 'surface', name: 'Surface', kind: 'Layout', blurb: 'Cards sit on the canvas rather than in it: a hairline, no shadow, and generous room around the type.', notes: [], palette: ['#64748d', '#ffffff', '#2e2b8c'], font: null, sections: [] },
  ],
};

async function main() {
  await mkdir(dirname(out), { recursive: true });

  if (has('offline')) return finish(FALLBACK);

  const listing = await get(`https://api.github.com/repos/${REPO}/contents/design-md`);
  let slugs = [];
  try { slugs = JSON.parse(listing).filter(e => e.type === 'dir').map(e => e.name); } catch { /* offline */ }
  if (!slugs.length) {
    process.stderr.write('could not list the design-md collection — using the built-in pack\n');
    return finish(FALLBACK);
  }

  // The prose filter rejects a good share of entries, so walk a longer shortlist
  // and stop as soon as the pack is full.
  const picked = slugs.slice().sort(() => rng() - 0.5).slice(0, Math.min(slugs.length, count * 4));
  const items = [];
  for (const slug of picked) {
    if (items.length >= count) break;
    const md = await get(`${RAW}/${slug}/DESIGN.md`);
    if (!md || md.startsWith('404')) continue;
    const parsed = parseDesignMd(md, slug);
    if (parsed.blurb) items.push(parsed);   // entries with no neutral prose are skipped
  }
  if (!items.length) return finish(FALLBACK);

  // labels are derived from hue + slug, so collisions happen; make them unique
  const NOUNS2 = ['Field', 'Works', 'Press', 'Studio', 'Practice', 'Atlas', 'Method', 'Archive'];
  const seen = new Set();
  for (const it of items) {
    let n = 0;
    while (seen.has(it.label) && n < NOUNS2.length) {
      it.label = it.label.split(' ')[0] + ' ' + NOUNS2[n++];
    }
    seen.add(it.label);
  }

  finish({
    source: `https://github.com/${REPO} (design-md, MIT)`,
    license: 'MIT',
    note: 'Anonymised design-system interpretations. Placeholder copy only — not the work of any named company.',
    seed, items,
  });
}

async function finish(pack) {
  await writeFile(out, JSON.stringify(pack, null, 2));
  process.stderr.write(
    `content pack → ${out}\n` +
    `  source ${pack.source}\n` +
    `  items  ${pack.items.length}${pack.seed ? ` (seed ${pack.seed})` : ''}\n` +
    `  sample ${pack.items.slice(0, 4).map(i => i.name).join(' · ')}\n`
  );
}

main().catch(err => { console.error(err); process.exit(0); });

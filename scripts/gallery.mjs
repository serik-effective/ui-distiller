#!/usr/bin/env node
/**
 * UI Distiller — build the root gallery index.html from patterns.json.
 *
 * Usage: node scripts/gallery.mjs <root>
 *   <root> is the distillation output dir, e.g. ui-distilled/example.com
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) { console.error('usage: node gallery.mjs <root>'); process.exit(1); }

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const data = JSON.parse(await readFile(join(root, 'patterns.json'), 'utf8'));
const patterns = [...(data.patterns || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

for (const p of patterns) {
  try { await access(join(root, 'patterns', p.slug, 'index.html')); }
  catch { console.error(`! missing demo: patterns/${p.slug}/index.html`); }
}

const stats = data.stats || {};
const cards = patterns.map(p => `      <li class="card">
        <a class="hit" href="patterns/${esc(p.slug)}/index.html">
          <span class="num">[${esc(p.number || '')}]</span>
          <span class="body">
            <span class="name">${esc(p.name)}</span>
            <span class="cats">${(p.categories || []).map(esc).join(' · ')}</span>
            <span class="desc">${esc(p.description)}</span>
            <span class="foot">
              <span class="tag">${esc(p.difficulty || '')}</span>
              <span class="tag">fidelity: ${esc(p.fidelity || '')}</span>
              ${p.score ? `<span class="tag">score ${Number(p.score).toFixed(1)}</span>` : ''}
              ${p.trigger ? `<span class="tag">trigger: ${esc(p.trigger)}</span>` : ''}
              ${p.needsNetwork ? '<span class="tag warn">needs network</span>' : ''}
            </span>
          </span>
          <span class="open">Open demo →</span>
        </a>
        <a class="readme" href="patterns/${esc(p.slug)}/README.md">README</a>
      </li>`).join('\n');

const html = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI Distiller — ${esc(data.host || '')}</title>
<style>
  :root { --bg:#0c0c0e; --fg:#f2f2f4; --muted:#8a8a95; --line:#26262c; --accent:#7a5cff; --card:#121216; }
  :root[data-theme="light"] { --bg:#f6f6f4; --fg:#101014; --muted:#6b6b76; --line:#e2e2dc; --accent:#4a30d8; --card:#fff; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:400 15px/1.55 ui-sans-serif,-apple-system,"Segoe UI",Inter,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
  .wrap { max-width:960px; margin:0 auto; padding:64px 24px 96px; }
  header { border-bottom:1px solid var(--line); padding-bottom:28px; margin-bottom:36px; display:flex; align-items:flex-end; gap:16px; flex-wrap:wrap; }
  h1 { font-size:13px; letter-spacing:.16em; text-transform:uppercase; margin:0 0 10px; color:var(--muted); font-weight:600; }
  .site { font-size:clamp(28px,5vw,44px); line-height:1.05; letter-spacing:-.03em; margin:0; }
  .site a { color:inherit; text-decoration:none; border-bottom:1px solid var(--line); }
  .site a:hover { border-color:var(--fg); }
  .stats { margin-left:auto; color:var(--muted); font-size:13px; text-align:right; font-variant-numeric:tabular-nums; }
  .links { margin:0 0 28px; display:flex; gap:14px; font-size:13px; }
  .links a { color:var(--muted); text-decoration:none; border-bottom:1px solid var(--line); }
  .links a:hover { color:var(--fg); border-color:var(--fg); }
  ul { list-style:none; margin:0; padding:0; display:grid; gap:10px; }
  .card { position:relative; background:var(--card); border:1px solid var(--line); border-radius:10px; transition:border-color .25s, transform .25s cubic-bezier(.16,1,.3,1); }
  .card:hover { border-color:var(--accent); transform:translateY(-2px); }
  .hit { display:grid; grid-template-columns:56px 1fr auto; gap:16px; align-items:center; padding:18px 20px; text-decoration:none; color:inherit; }
  .num { color:var(--muted); font-variant-numeric:tabular-nums; font-size:13px; }
  .body { display:grid; gap:5px; min-width:0; }
  .name { font-size:18px; letter-spacing:-.015em; }
  .cats { font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--accent); }
  .desc { color:var(--muted); font-size:13.5px; }
  .foot { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
  .tag { font-size:11px; color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:2px 8px; }
  .tag.warn { color:#e0a33a; border-color:#4a3a1c; }
  .open { color:var(--muted); font-size:13px; white-space:nowrap; transition:color .25s, transform .25s cubic-bezier(.16,1,.3,1); }
  .card:hover .open { color:var(--fg); transform:translateX(3px); }
  .readme { position:absolute; right:20px; bottom:12px; font-size:11px; color:var(--muted); text-decoration:none; opacity:0; transition:opacity .2s; }
  .card:hover .readme { opacity:1; }
  .readme:hover { color:var(--fg); }
  footer { margin-top:40px; color:var(--muted); font-size:12px; border-top:1px solid var(--line); padding-top:18px; display:flex; gap:12px; flex-wrap:wrap; }
  button { font:inherit; font-size:12px; background:transparent; color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:4px 11px; cursor:pointer; }
  button:hover { color:var(--fg); border-color:var(--fg); }
  @media (max-width:640px) { .hit { grid-template-columns:1fr; } .open { justify-self:start; } }
  @media (prefers-reduced-motion:reduce) { * { transition-duration:1ms !important; } }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>UI Distiller</h1>
        <p class="site"><a href="${esc(data.site || '#')}" target="_blank" rel="noreferrer noopener">${esc(data.host || data.site || '')}</a></p>
      </div>
      <div class="stats">
        ${patterns.length} pattern${patterns.length === 1 ? '' : 's'} extracted<br>
        ${stats.pages ? `${esc(stats.pages)} pages analyzed · ${esc(stats.candidates ?? patterns.length)} candidates<br>` : ''}
        ${esc(data.analyzedAt || '')}
      </div>
    </header>
    <p class="links"><a href="REPORT.md">REPORT.md</a><a href="patterns.json">patterns.json</a></p>
    <ul>
${cards}
    </ul>
    <footer>
      <span>Clean-room recreations. No production code, branding, or content from the source site.</span>
      <button id="theme" type="button">Theme</button>
    </footer>
  </div>
<script>
  document.getElementById('theme').addEventListener('click', () => {
    const r = document.documentElement;
    r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light';
  });
</script>
</body>
</html>
`;

await writeFile(join(root, 'index.html'), html);
console.error(`gallery → ${join(root, 'index.html')} (${patterns.length} patterns)`);

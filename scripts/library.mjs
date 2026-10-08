// Regenerate database.json and the shared catalog from the site indexes.
// Usage: node scripts/library.mjs [repository-root]
import {readFile, writeFile, readdir, access} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(process.argv[2] || dirname(fileURLToPath(import.meta.url)) + '/..');
const labels = JSON.parse(await readFile(resolve(root, 'assets/library-labels.ru.json'), 'utf8'));
const names = {'yaas-energy.com':'Yaas Energy','patmos.studio':'Patmos','www.odysseeclinic.com.au':'Odyssée','brand.squarespace.com':'Squarespace Brand','huyml.co':'Huy ML','illoca.unseen.co':'Illoca','mecha-xyz.webflow.io':'Mecha','www.ceragres.ca':'Céragrès','www.sashamartynchuk.com':'Sasha Martynchuk'};
const sites = [];
for (const entry of (await readdir(resolve(root, 'ui-distilled'), {withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const index = resolve(root, 'ui-distilled', entry.name, 'patterns.json');
  try { await access(index); } catch { continue; }
  const site = JSON.parse(await readFile(index, 'utf8'));
  site.name = names[site.host] || site.host;
  for (const p of site.patterns) {
    if (labels[p.slug]) [p.nameRu, p.descriptionRu] = labels[p.slug];
    try { await access(resolve(root, 'ui-distilled', site.host, 'patterns', p.slug, 'README.md')); p.hasReadme = true; } catch { p.hasReadme = false; }
  }
  sites.push(site);
}
const data = {source:'UI Distiller effects library', sites};
await writeFile(resolve(root, 'database.json'), JSON.stringify(data, null, 2) + '\n');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');const all=data.sites.flatMap(s=>s.patterns.map(p=>({...p,host:s.host,siteName:s.name})));const total=all.length;const siteTotal=data.sites.length;const network=all.filter(p=>p.needsNetwork).length;const cards=all.map((p,i)=>{const dir=`ui-distilled/${p.host}/patterns/${p.slug}`;return `<article class="card" data-site="${p.host}" data-type="${p.categories.join(' ')}" data-search="${esc((p.nameRu||p.name)+' '+(p.descriptionRu||p.description)+' '+p.name+' '+p.siteName+' '+p.trigger+' '+p.categories.join(' ')).toLowerCase()}"><a class="cover" href="${dir}/index.html"><img src="${dir}/preview.jpg" alt="Демонстрация: ${esc(p.nameRu||p.name)}" loading="lazy"><span class="launch">Открыть демо ↗</span><span class="number">${String(i+1).padStart(2,'0')}</span></a><div class="card-copy"><div class="meta">${p.siteName}<span>${({Hard:'Сложная',Medium:'Средняя',Easy:'Простая'})[p.difficulty]} · ${p.score.toFixed(1)}</span></div><h2><a href="${dir}/index.html">${p.nameRu||p.name}</a></h2><p>${p.descriptionRu||p.description}</p><div class="availability">${p.needsNetwork?'Нужен интернет':'Без сети'}</div><footer><span>${p.categories.join(' / ')}</span><a href="${p.hasReadme===false?'ui-distilled/'+p.host+'/REPORT.md':dir+'/README.md'}">Разбор ↗</a></footer></div></article>`}).join('');

const siteButtons = data.sites.map(s=>`<button data-filter="${esc(s.host)}" aria-pressed="false">${esc(s.name)}</button>`).join('');
function renderTemplate(template) {
  template = template.replaceAll("${String(siteTotal).padStart(2,'0')}", String(siteTotal).padStart(2, '0'));
  template = template.replaceAll("${total-network}", String(total-network));
  template = template.replaceAll("${total}", String(total));
  template = template.replaceAll("${siteTotal}", String(siteTotal));
  template = template.replaceAll("${network}", String(network));
  template = template.replaceAll("${cards}", cards);
  template = template.replaceAll("${data.sites.map(s=>`<button data-filter=\"${s.host}\" aria-pressed=\"false\">${s.name}</button>`).join('')}", siteButtons);
  return template;
}
await writeFile(resolve(root, 'index.html'),renderTemplate(await readFile(resolve(root, 'assets/library-template.html'), 'utf8')));
console.log(`Built catalog: ${total} effects from ${siteTotal} sites`);

'use strict';
/* Запись собранной игры в папку (чистый Node, без Electron — поэтому проверяется обычными тестами).
   Безопасные относительные пути + манифест .vnmap-build.json: по нему при повторной записи убираются
   файлы, которые записали мы сами и которых в новой сборке уже нет. Чужие файлы не трогаем. */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const MANIFEST = '.vnmap-build.json';

function cleanRel(n) {
  if (typeof n !== 'string' || !n || n.length > 400) return null;
  const parts = n.replace(/\\/g, '/').split('/');
  for (const p of parts) {
    if (!p || p === '.' || p === '..' || /[<>:"|?*\x00-\x1f]/.test(p) || /[. ]$/.test(p)) return null;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(p)) return null;   // зарезервировано в Windows
  }
  return parts.join('/');
}
async function exists(p) { try { await fsp.access(p); return true; } catch (e) { return false; } }
async function pruneEmptyDirs(dir, root) {
  let cur = dir;
  while (cur.startsWith(root + path.sep) && cur !== root) {
    try { if ((await fsp.readdir(cur)).length) break; await fsp.rmdir(cur); } catch (e) { break; }
    cur = path.dirname(cur);
  }
}
const toBuffer = d => (typeof d === 'string' ? Buffer.from(d, 'utf8') : Buffer.from(d.buffer ? d.buffer : d, d.byteOffset || 0, d.byteLength));

async function readManifest(root) {
  try {
    const old = JSON.parse(await fsp.readFile(path.join(root, MANIFEST), 'utf8'));
    if (old && old.tool === 'vnmap' && Array.isArray(old.files)) return old.files.map(cleanRel).filter(Boolean);
  } catch (e) { /* манифеста нет — это первая запись */ }
  return null;
}

/**
 * entries: [{name, data}]; o: { version, confirm(n) -> bool, clash: 'all'|'foreign', strings: {badNames, errWrite} }
 * clash 'all' — спрашивать, если какие-то файлы уже лежат (как при выборе папки вручную);
 * clash 'foreign' — спрашивать только о файлах, которых нет в манифесте прошлой записи (повторные запуски без вопросов).
 * Возвращает null, если пользователь отказался, иначе { dir, written, changed, removed, replaced }.
 */
async function writeBuildFiles(rootDir, entries, o) {
  o = o || {};
  const S = Object.assign({ badNames: 'Invalid file names in the build: ', errWrite: 'Could not write the file' }, o.strings || {});
  const root = path.resolve(rootDir);
  const items = [], bad = [];
  for (const en of entries || []) {
    const rel = cleanRel(en && en.name); if (!rel) { bad.push(String(en && en.name).slice(0, 80)); continue; }
    const abs = path.resolve(root, ...rel.split('/'));
    if (!abs.startsWith(root + path.sep)) { bad.push(rel); continue; }
    items.push({ rel, abs, data: en.data });
  }
  if (bad.length) throw new Error(S.badNames + bad.slice(0, 3).join(', '));
  const prev = await readManifest(root);
  const mine = new Set(prev || []);
  let clash = 0;
  for (const it of items) if (await exists(it.abs) && (o.clash !== 'foreign' || !mine.has(it.rel))) clash++;
  if (clash && o.confirm && !(await o.confirm(clash))) return null;
  /* чистка файлов прошлой сборки (только те, что записали мы и перечислили в манифесте) */
  let removed = 0;
  const keep = new Set(items.map(i => i.rel));
  for (const rel of prev || []) {
    if (keep.has(rel)) continue;
    const abs = path.resolve(root, ...rel.split('/'));
    if (!abs.startsWith(root + path.sep)) continue;
    /* без .rpy старый скомпилированный .rpyc Ren'Py всё равно загрузил бы — убираем и его */
    if (/\.rpy$/i.test(rel)) { try { await fsp.unlink(abs + 'c'); } catch (e) { /* нет */ } }
    try { await fsp.unlink(abs); removed++; } catch (e) { /* уже нет */ }
    await pruneEmptyDirs(path.dirname(abs), root);
  }
  let changed = 0;
  try {
    for (const it of items) {
      const buf = toBuffer(it.data);
      let same = false;
      try { const cur = await fsp.readFile(it.abs); same = cur.length === buf.length && cur.equals(buf); } catch (e) { /* нет файла */ }
      if (!same) { await fsp.mkdir(path.dirname(it.abs), { recursive: true }); await fsp.writeFile(it.abs, buf); changed++; }   // нетронутые файлы не пишем: Ren'Py не станет перекомпилировать их
    }
    await fsp.writeFile(path.join(root, MANIFEST), JSON.stringify({ tool: 'vnmap', version: o.version || '', time: new Date().toISOString(), files: items.map(i => i.rel) }, null, 1));
  } catch (err) { throw new Error(S.errWrite + ': ' + err.message); }
  return { dir: root, written: items.length, changed, removed, replaced: clash };
}

module.exports = { MANIFEST, cleanRel, exists, pruneEmptyDirs, toBuffer, readManifest, writeBuildFiles };

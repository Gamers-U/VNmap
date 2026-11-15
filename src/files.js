'use strict';
/* ====== Файлы ассетов: хранилище (IndexedDB), загрузка, резервная копия .zip ====== */
const BLOB = { p: null, db: null, mem: new Map(), urls: new Map(), persistent: false, warned: false };

function blobOpen() {
  if (BLOB.p) return BLOB.p;
  BLOB.p = new Promise(res => {
    try {
      if (typeof indexedDB === 'undefined' || !indexedDB) return res(null);
      const rq = indexedDB.open('vnmap-files', 1);
      rq.onupgradeneeded = () => { try { rq.result.createObjectStore('b'); } catch (e) { /* уже есть */ } };
      rq.onsuccess = () => { BLOB.db = rq.result; BLOB.persistent = true; res(rq.result); };
      rq.onerror = rq.onblocked = () => res(null);
    } catch (e) { res(null); }
  });
  return BLOB.p;
}
function idbDo(db, mode, fn) {
  return new Promise((res, rej) => {
    const tx = db.transaction('b', mode);
    let rq;
    try { rq = fn(tx.objectStore('b')); } catch (e) { rej(e); return; }
    tx.oncomplete = () => res(rq && rq.result);
    tx.onerror = tx.onabort = () => rej(tx.error || new Error('idb'));
  });
}
async function blobPut(id, blob) {
  BLOB.mem.set(id, blob);
  const db = await blobOpen(); if (!db) return false;
  try { await idbDo(db, 'readwrite', st => st.put(blob, id)); return true; } catch (e) { return false; }
}
async function blobGet(id) {
  if (!id) return null;
  if (BLOB.mem.has(id)) return BLOB.mem.get(id);
  const db = await blobOpen(); if (!db) return null;
  try { const b = await idbDo(db, 'readonly', st => st.get(id)); if (b) { BLOB.mem.set(id, b); return b; } } catch (e) { /* нет */ }
  return null;
}
/** Есть ли файл в хранилище (сам файл не читается). */
async function blobHas(id) {
  if (!id) return false;
  if (BLOB.mem.has(id)) return true;
  const db = await blobOpen(); if (!db) return false;
  try { return (await idbDo(db, 'readonly', st => st.count(id))) > 0; } catch (e) { return false; }
}
async function blobUrl(id) {
  if (BLOB.urls.has(id)) return BLOB.urls.get(id);
  let b = await blobGet(id);
  if (!b && typeof mfLazy === 'function') b = await mfLazy(id);          // файла нет на этом устройстве: пробуем взять с Диска
  if (!b) return null;
  const u = URL.createObjectURL(b); BLOB.urls.set(id, u); return u;
}
/** Удаляет из хранилища файлы, на которые не ссылается ни один ассет (только при запуске: история отмены держит старые ссылки). */
async function blobGC() {
  const keep = new Set();
  for (const a of P.assets) for (const m of Object.values(a.files || {})) keep.add(m.bid);
  const db = await blobOpen(); if (!db) return;
  try {
    const keys = await idbDo(db, 'readonly', st => st.getAllKeys());
    for (const k of keys) if (!keep.has(k) && !/^(cbase|sbase|dbase|gbase)_/.test(String(k))) await idbDo(db, 'readwrite', st => st.delete(k));
  } catch (e) { /* не страшно */ }
}

/* ---- типы файлов ---- */
const IMG_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml', bmp: 'image/bmp' };
const AUD_TYPES = { ogg: 'audio/ogg', opus: 'audio/ogg', mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', m4a: 'audio/mp4', aac: 'audio/aac' };
const RENPY_IMG = new Set(['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg']);
const RENPY_AUD = new Set(['ogg', 'opus', 'mp3', 'wav', 'flac']);
const isImageKind = k => k === 'bg' || k === 'sprite' || k === 'gui';
const isFontKind = k => k === 'font';
const hasFilesKind = k => k !== 'fx' && k !== 'tf';
function extOf(name) { const m = /\.([A-Za-z0-9]+)$/.exec(name || ''); return m ? m[1].toLowerCase() : ''; }
function metaExt(m) {
  const e = extOf(m.name); if (e) return e;
  const all = Object.assign({}, IMG_TYPES, AUD_TYPES, FONT_TYPES);
  for (const k of Object.keys(all)) if (all[k] === m.type) return k;
  return '';
}
function humanSize(n) {
  n = +n || 0;
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
  return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
}
const assetMeta = (a, key) => (a.files && a.files[key || '']) || null;
const assetFileCount = a => Object.keys(a.files || {}).length;

async function attachFile(a, key, file) {
  if (a.kind === 'gui' && typeof guiToPng === 'function') {      // картинки интерфейса Ren'Py ждёт под стандартными именами .png: всё, что не настоящий PNG, переводим в PNG
    let isPng = false;
    try { const sig = new Uint8Array(await file.slice(0, 8).arrayBuffer()); isPng = extOf(file.name) === 'png' && sig.length === 8 && sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47; } catch (e) { /* ниже переведём */ }
    if (!isPng) { const f2 = await guiToPng(file); if (!f2) { toast(t('file.badtype', file.name), 4200); return false; } file = f2; }
  }
  const img = isImageKind(a.kind), fnt = isFontKind(a.kind), ext = extOf(file.name);
  const okExt = img ? ext in IMG_TYPES : fnt ? ext in FONT_TYPES : ext in AUD_TYPES;
  if (!okExt && !(!fnt && String(file.type || '').startsWith(img ? 'image/' : 'audio/'))) { toast(t('file.badtype', file.name), 4200); return false; }
  const bid = longId('b');
  const ok = await blobPut(bid, file);
  if (!ok && !BLOB.warned) { BLOB.warned = true; toast(t('blob.nostore'), 7000); }
  a.files[key || ''] = { bid, name: file.name, size: file.size, type: file.type || (img ? IMG_TYPES : fnt ? FONT_TYPES : AUD_TYPES)[ext] || '' };
  if (fnt) { if (a.kind === 'font') loadFont(a); }
  else if (!img && !a.path) a.path = 'audio/' + a.kind + '/' + (slug(a.name) || 'sound') + '.' + (ext || 'ogg');
  commit(true);
  return true;
}
function detachFile(a, key) { delete a.files[key || '']; commit(true); }

/** Выбор файлов через системный диалог. */
function pickFiles(accept, multiple, cb) {
  const inp = h('input', { type: 'file', accept, multiple: !!multiple, style: { display: 'none' } });
  inp.addEventListener('change', () => { const fl = [...inp.files]; inp.remove(); if (fl.length) cb(fl); });
  document.body.append(inp); inp.click();
}
const acceptFor = kind => isFontKind(kind) ? '.ttf,.otf,.ttc,font/ttf,font/otf' : isImageKind(kind) ? 'image/*,.png,.jpg,.jpeg,.webp,.avif,.svg,.gif' : 'audio/*,.ogg,.opus,.mp3,.wav,.flac';

/** Массовая загрузка: сами создаём ассеты по именам файлов. */
async function bulkUpload(kindTab, files) {
  let made = 0, bad = 0;
  for (const file of files) {
    const base = file.name.replace(/\.[^.]+$/, '');
    const ext = extOf(file.name);
    if (kindTab === 'bg') {
      if (!(ext in IMG_TYPES)) { bad++; continue; }
      const name = 'bg ' + slug(base).replace(/^bg_/, '');
      let a = P.assets.find(x => x.kind === 'bg' && x.name.toLowerCase() === name);
      if (!a) a = createAsset('bg', name);
      if (await attachFile(a, '', file)) made++; else bad++;
    } else if (kindTab === 'sprite') {
      if (!(ext in IMG_TYPES)) { bad++; continue; }
      const m = base.match(/^(.+?)[\s_-]+(.+)$/);
      const tag = slug(m ? m[1] : base), expr = m ? slug(m[2]) : '';
      let a = P.assets.find(x => x.kind === 'sprite' && x.name.toLowerCase() === tag);
      if (!a) a = createAsset('sprite', tag);
      if (expr && !a.expr.includes(expr)) a.expr.push(expr);
      if (await attachFile(a, expr, file)) made++; else bad++;
    } else if (kindTab === 'font') {
      if (!(ext in FONT_TYPES)) { bad++; continue; }
      const name = base.replace(/[_]+/g, ' ').replace(/[-\s]*(regular|normal)$/i, '').trim() || base;
      let a = P.assets.find(x => x.kind === 'font' && x.name.toLowerCase() === name.toLowerCase());
      if (!a) a = createAsset('font', name);
      if (await attachFile(a, '', file)) made++; else bad++;
    } else {
      if (!(ext in AUD_TYPES)) { bad++; continue; }
      const low = base.toLowerCase();
      const kind = /(^|[\s_-])(sfx|snd|sound|fx)([\s_-]|$)/.test(low) ? 'sfx' : /(^|[\s_-])(voice|vo)([\s_-]|$)/.test(low) ? 'voice' : 'music';
      const name = base.replace(/[_]+/g, ' ').trim();
      let a = P.assets.find(x => x.kind === kind && x.name.toLowerCase() === name.toLowerCase());
      if (!a) a = createAsset(kind, name);
      if (await attachFile(a, '', file)) made++; else bad++;
    }
  }
  toast(bad ? t('bulk.done.bad', made, bad) : t('bulk.done', made), 4200);
  return made;
}

/* ---- чтение ZIP (для импорта резервной копии) ---- */
async function inflateRaw(u8) {
  if (typeof DecompressionStream === 'undefined') throw new Error('no DecompressionStream');
  const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function readZip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  let i = u8.length - 22;
  for (; i >= 0 && i > u8.length - 70000; i--) if (dv.getUint32(i, true) === 0x06054b50) break;
  if (i < 0 || dv.getUint32(i, true) !== 0x06054b50) throw new Error('zip');
  const n = dv.getUint16(i + 10, true);
  let p = dv.getUint32(i + 16, true);
  const dec = new TextDecoder(), out = [];
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + el + cl;
    if (name.endsWith('/')) continue;
    const ds = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    let data = u8.subarray(ds, ds + csize);
    if (method === 8) data = await inflateRaw(data); else if (method !== 0) throw new Error('method');
    out.push({ name, data });
  }
  return out;
}
async function isZipFile(file) {
  try { const b = new Uint8Array(await file.slice(0, 4).arrayBuffer()); return b[0] === 0x50 && b[1] === 0x4b; } catch (e) { return false; }
}

/* ---- резервная копия проекта ---- */
const hasAnyFiles = () => P.assets.some(a => assetFileCount(a) > 0);
async function backupZipBlob() {
  const entries = [{ name: 'project.json', data: JSON.stringify(P, null, 1) }, { name: 'README.txt', data: t('backup.readme') }];
  const seen = new Set();
  for (const a of P.assets) for (const m of Object.values(a.files || {})) {
    if (seen.has(m.bid)) continue; seen.add(m.bid);
    const b = await blobGet(m.bid);
    if (b) entries.push({ name: 'blobs/' + m.bid, data: new Uint8Array(await b.arrayBuffer()) });
  }
  return makeZip(entries);
}
async function readBackupZip(file) {
  const entries = await readZip(await file.arrayBuffer());
  const pj = entries.find(e => e.name === 'project.json');
  if (!pj) throw new Error('no project.json');
  const project = JSON.parse(new TextDecoder().decode(pj.data));
  const types = {};
  for (const a of project.assets || []) for (const m of Object.values(a.files || {})) if (m && m.bid) types[m.bid] = m.type || '';
  const blobs = entries.filter(e => e.name.startsWith('blobs/')).map(e => { const bid = e.name.slice(6); return { bid, blob: new Blob([e.data], { type: types[bid] || 'application/octet-stream' }) }; });
  return { project, blobs };
}

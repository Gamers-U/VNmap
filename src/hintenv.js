'use strict';
/* ====== Среда подсказок кода (с 1.7.20) ======
   Подсказки в редакторе (codehint.js: метки после jump/call, картинки после scene/show, звуки после play, переменные, герои, трансформы)
   спрашивают «какие имена есть в проекте» у среды env: labels, chars, vars, images, audio, transforms. Раньше такую среду собирал только
   окно «Редактор кода» (ide.js, с папкой проекта Ren'Py), а в «Скрипте» главы, «Своём коде» и «Сниппетах» подсказок не было.
   Теперь среда собирается одной функцией chEnvMake(o), и везде работает одно и то же:
     o.scans() — разборы текстов с кодом (chScan): «Свой код», открытые вкладки, остальные .rpy папки;
     o.files() — файлы папки проекта [{virt, path}] (в окне кода; в остальных местах пусто).
   Имена берутся из проекта (блоки и главы, герои, переменные, ресурсы реестра: фоны, спрайты с выражениями, музыка, звуки, трансформы),
   из кода («Свой код», файлы папки) и из файлов папки (картинки images/, звуки). Дубли склеиваются. */

const CH_IMG_RE = /\.(?:png|jpe?g|webp|avif|gif|svg|bmp)$/i, CH_AUD_RE = /\.(?:ogg|mp3|wav|opus|flac|m4a|aac)$/i;
const chBase = p => String(p || '').split('/').pop();

function chEnvMake(o) {
  o = o || {};
  const scans = o.scans || (() => []), files = o.files || (() => []);
  let memo = null;
  const once = (k, fn) => { const now = Date.now(); if (!memo || now - memo.t > 400) memo = { t: now, v: {} }; return k in memo.v ? memo.v[k] : (memo.v[k] = fn()); };
  return {
    labels: () => once('lab', () => {
      const out = new Map(), put = (n, d, code) => { if (n && !out.has(n)) out.set(n, { d: d || '', code: !!code }); };
      for (const sc of scans()) for (const l of sc.labels) put(l, '', true);                 // метки из файлов с кодом идут первыми
      for (const n of P.nodes) {
        if (n.type === 'note') continue;
        put('blk_' + cmpIdent(slug(n.title), 'scene'), n.title);
        for (const f of n.files) { put(fileLabel(f), f.title || n.title); for (const l of String(f.script || '').split('\n')) { const m = RE_J_LABEL.exec(l); if (m) put(m[1], f.title || n.title); } }
      }
      return [...out].map(([name, x]) => ({ name, detail: x.d, code: x.code }));
    }),
    chars: () => once('chr', () => {
      const out = new Map();
      for (const c of P.characters) if (c.tag && !out.has(c.tag)) out.set(c.tag, c.name || '');
      for (const sc of scans()) for (const c of sc.chars) if (!out.has(c.tag)) out.set(c.tag, c.name || '');
      return [...out].map(([tag, name]) => ({ tag, name }));
    }),
    vars: () => once('var', () => {
      const out = new Map(), tn = { flag: t('ch.var.flag'), number: t('ch.var.number'), choice: t('ch.var.choice') };
      for (const v of P.vars) if (v.name && !out.has(v.name)) out.set(v.name, tn[v.type] || '');
      for (const sc of scans()) for (const v of sc.vars) if (!out.has(v)) out.set(v, '');
      return [...out].map(([name, detail]) => ({ name, detail }));
    }),
    images: () => once('img', () => {
      const out = new Map(), put = nm => { nm = String(nm || '').trim().replace(/\s+/g, ' '); if (!nm || out.has(nm)) return; const w = nm.split(' '); out.set(nm, { name: nm, tag: w[0], attrs: w.slice(1) }); };
      for (const f of files()) if (!f.virt && CH_IMG_RE.test(f.path) && /(^|\/)images\//.test(f.path)) put(chBase(f.path).replace(CH_IMG_RE, ''));
      for (const sc of scans()) for (const nm of sc.images) put(nm);
      for (const a of P.assets) {
        if (a.kind === 'bg') put(a.name);
        else if (a.kind === 'sprite' && a.name) { put(a.name); for (const e of a.expr || []) put(a.name + ' ' + e); }
      }
      return [...out.values()];
    }),
    audio: () => once('aud', () => {
      const out = new Set();
      for (const f of files()) if (!f.virt && CH_AUD_RE.test(f.path)) out.add(f.path.replace(/^game\//, ''));
      for (const a of P.assets) if (['music', 'sfx', 'voice'].includes(a.kind)) { const nm = typeof assetCodeName === 'function' ? assetCodeName(a) : (a.path || a.name); if (nm) out.add(nm); }
      return [...out].slice(0, 400);
    }),
    transforms: () => once('trf', () => {
      const out = new Set();
      for (const sc of scans()) for (const x of sc.trans) out.add(x);
      for (const a of P.assets) if (a.kind === 'tf' && a.name) out.add(a.name);
      return [...out];
    }),
  };
}

/* Среда для полей вне окна кода («Скрипт» главы, «Свой код», «Сниппеты»): файлы «Своего кода» + проект. Разбор текста кэшируется по тексту. */
const CH_SCAN_CACHE = new Map();
function chScanCached(id, text) { let c = CH_SCAN_CACHE.get(id); if (!c || c.text !== text) { c = { text, scan: chScan(text) }; CH_SCAN_CACHE.set(id, c); } return c.scan; }
let CH_GLOBAL_ENV = null;
function chEnvGlobal() {
  return CH_GLOBAL_ENV || (CH_GLOBAL_ENV = chEnvMake({ scans: () => ccList().map(c => chScanCached('v' + c.id, c.text || '')), files: () => [] }));
}
/** Подсказка для поля кода вне окна «Редактор кода» (передаётся в cmCreate как opts.hint). */
const chFieldHint = ctx => chHint(ctx, chEnvGlobal());

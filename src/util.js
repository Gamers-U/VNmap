'use strict';
/* null, undefined и false как дочерние узлы пропускаются (иначе браузер напишет на странице «null») */
(function () {
  for (const k of ['append', 'prepend', 'replaceChildren']) {
    const orig = Element.prototype[k];
    Element.prototype[k] = function (...a) { return orig.apply(this, a.filter(x => x != null && x !== false)); };
  }
})();

/* ====== Утилиты: DOM-помощники, иконки, измерение текста, всплывающие окна ====== */
const SVGNS = 'http://www.w3.org/2000/svg';
const THEMES = /*THEMES*/null;
const $ = (sel, root = document) => root.querySelector(sel);
const FONT_FAMILY = (typeof window !== 'undefined' && window.vnDesktop ? 'Inter, ' : '') + '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO_FAMILY = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

function mk(ns, tag, attrs, kids) {
  const el = ns ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
  if (attrs && (attrs.nodeType || typeof attrs === 'string' || typeof attrs === 'number' || Array.isArray(attrs))) {
    kids = [attrs, ...kids]; attrs = null;
  }
  let val;
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'value' && !ns) val = v;
      else if (k === 'checked' && !ns) el.checked = !!v;
      else if (k === 'disabled' && !ns) el.disabled = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  if (val !== undefined) el.value = val;
  return el;
}
const h = (tag, attrs, ...kids) => mk(false, tag, attrs, kids);
const s = (tag, attrs, ...kids) => mk(true, tag, attrs, kids);

/* ---- иконки (24x24, штрих) ---- */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  sticker: '<path d="M5 3h14a1 1 0 0 1 1 1v10l-6 6H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M20 14h-5a1 1 0 0 0-1 1v5"/><path d="M8 8h8M8 12h4"/>',
  minus: '<path d="M5 12h14"/>',
  straight: '<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  chevU: '<path d="M6 15l6-6 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 017.6-1.7"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  badge: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="10" r="2.6"/><path d="M7.6 17.2c.8-2 2.4-3 4.4-3s3.6 1 4.4 3"/>',
  hash: '<path d="M5 9h15M4 15h15M10 4L8 20M16 4l-2 16"/>',
  cloud: '<path d="M7.5 18.5a4.5 4.5 0 01-.7-8.95A6 6 0 0118.2 10 4.3 4.3 0 0118 18.5z"/>',
  refresh: '<path d="M20 11a8 8 0 00-14.5-4.2M4 4v4h4M4 13a8 8 0 0014.5 4.2M20 20v-4h-4"/>',
  fork: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v15H6a2 2 0 00-2 2V5z"/><path d="M4 20a2 2 0 002 1h13"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>',
  file: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5"/>',
  filePlus: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14.5a6.5 6.5 0 013.5 5.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
  code: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6M3 20h18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 014.9.6c0 1.7-2.5 2-2.5 3.6M12 17.2h.01"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.6-2-.5-1.2.3-2.5 1.7-2.5H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10.5" cy="7" r="1.1"/><circle cx="15.5" cy="7.5" r="1.1"/>',
  link: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h9M13 8.5l3.5 3.5-3.5 3.5"/>',
  addLinked: '<path d="M4 12h9M10 8l4 4-4 4"/><path d="M19 4v7M15.5 7.5h7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  chat: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1.1-4.6A8 8 0 1121 12z"/>',
  motion: '<circle cx="6" cy="12" r="2.2"/><path d="M10.5 12h8M15.5 8.5L19 12l-3.5 3.5"/><path d="M10.5 7.5h3M10.5 16.5h3" opacity=".5"/>',
  type: '<path d="M4 19L9.5 5 15 19M6.2 14h6.6M17 9.5c-1.7 0-3 1-3 2.5s1.3 2.5 3 2.5 3-1 3-2.5V9"/>',
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 18M8 16.5L20 6"/>',
  wand: '<path d="M4 20L15 9M13 4l1 2.3L16.3 7 14 8l-1 2.3L12 8 9.7 7 12 6z"/><path d="M19 13l.7 1.5L21 15l-1.3.5L19 17l-.7-1.5L17 15l1.3-.5z"/>',
  grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17.5l9 5 9-5" opacity=".6"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  reverse: '<path d="M7 7h12M16 3l4 4-4 4M17 17H5M8 13l-4 4 4 4"/>',
  dash: '<path d="M3 12h4M10 12h4M17 12h4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  new: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  rows: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  xcircle: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>'
};
function icon(name, size = 18, sw = 1.8) {
  const el = document.createElementNS(SVGNS, 'svg');
  el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('width', size); el.setAttribute('height', size);
  el.setAttribute('fill', 'none'); el.setAttribute('stroke', 'currentColor'); el.setAttribute('stroke-width', sw);
  el.setAttribute('stroke-linecap', 'round'); el.setAttribute('stroke-linejoin', 'round'); el.setAttribute('class', 'ic');
  el.innerHTML = ICONS[name] || '';
  return el;
}
function iconG(name, x, y, size, color, sw = 2) {
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('transform', `translate(${x} ${y}) scale(${size / 24})`);
  g.setAttribute('fill', 'none'); g.setAttribute('stroke', color); g.setAttribute('stroke-width', sw);
  g.setAttribute('stroke-linecap', 'round'); g.setAttribute('stroke-linejoin', 'round');
  g.setAttribute('pointer-events', 'none');
  g.innerHTML = ICONS[name] || '';
  return g;
}

/* ---- математика и цвета ---- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const snapTo = (v, g) => Math.round(v / g) * g;
let _uidc = 0;
/** Идентификатор для общих хранилищ (Диск, несколько устройств): коллизия практически невозможна. */
function longId(p) {
  try { const a = new Uint8Array(12); crypto.getRandomValues(a); return p + '_' + [...a].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return p + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2); }
}
function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 8) + (_uidc++).toString(36); }
function debounce(fn, ms) { let t; const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; f.flush = () => { clearTimeout(t); }; return f; }
function hex2rgb(hex) {
  hex = String(hex).replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum(hex) {
  const [r, g, b] = hex2rgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const onColor = hex => lum(hex) > 0.4 ? '#1d1d1f' : '#ffffff';
function rgba(hex, a) { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; }
function escHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escXml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ---- измерение текста (для SVG, где нет автопереноса) ---- */
const _mc = document.createElement('canvas').getContext('2d');
const _mw = new Map();
function textW(str, size, weight = 400) {
  const key = weight + '|' + size + '|' + str;
  let w = _mw.get(key);
  if (w == null) {
    _mc.font = `${weight} ${size}px ${FONT_FAMILY}`;
    w = _mc.measureText(str).width;
    if (_mw.size > 8000) _mw.clear();
    _mw.set(key, w);
  }
  return w;
}
function clearMeasure() { _mw.clear(); }
function fitText(str, maxW, size, weight = 400) {
  str = String(str == null ? '' : str);
  if (maxW <= 8) return '';
  if (textW(str, size, weight) <= maxW) return str;
  let lo = 0, hi = str.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (textW(str.slice(0, mid) + '…', size, weight) <= maxW) lo = mid; else hi = mid - 1;
  }
  return str.slice(0, lo).trimEnd() + '…';
}
function wrapText(str, maxW, size, weight = 400, maxLines = 99) {
  const lines = [];
  for (const para of String(str || '').split('\n')) {
    if (!para.trim()) { lines.push(''); continue; }
    let cur = '';
    for (const word of para.split(/\s+/)) {
      const test = cur ? cur + ' ' + word : word;
      if (textW(test, size, weight) <= maxW) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = textW(word, size, weight) > maxW ? fitText(word, maxW, size, weight) : word;
      }
    }
    lines.push(cur);
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = fitText(lines[maxLines - 1] + ' …', maxW, size, weight);
    if (!lines[maxLines - 1].endsWith('…')) lines[maxLines - 1] += '…';
  }
  return lines;
}

/* ---- хранилище (с защитой от исключений) ---- */
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

/* ---- слой оверлеев ---- */
let LAYER = null;
const layer = () => LAYER || (LAYER = $('#layer'));

function toast(msg, ms = 2600) {
  layer().querySelectorAll('.toast').forEach(x => x.remove());
  const el = h('div', { class: 'toast' }, msg);
  layer().append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 260); }, ms);
}

/* ---- буфер обмена и сохранение файлов ---- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* запасной путь */ }
  try {
    const ta = h('textarea', { style: { position: 'fixed', left: '-999px', top: '0' } });
    ta.value = text; document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
const DL_OK = new Set('gif png jpg jpeg webp mp4 webm mov txt json md docx pptx epub csv ttf html svg pdf xlsx zip'.split(' '));
async function saveFile(name, data, mime) {
  const dk = typeof window !== 'undefined' && window.vnDesktop && window.vnDesktop.isDesktop ? window.vnDesktop : null;
  if (dk) {
    try {
      const body = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
      const r = await dk.saveFile(name, body);
      if (!r) return false;
      toast(t('save.ok.path', r.path), 4200); return true;
    } catch (e) { toast(t('save.fail') + ' (' + String((e && e.message) || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, '') + ')', 5000); return false; }
  }
  let dl = null;
  try { if (window.claude && typeof window.claude.use === 'function') dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
  if (dl) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    const fname = DL_OK.has(ext) ? name : name + '.txt';
    try {
      await dl.save({ filename: fname, data });
      toast(t('save.ok', fname)); return true;
    } catch (e) {
      if (e && e.code === 'declined') return false;
      toast(t('save.fail') + ' (' + ((e && (e.code || e.message)) || '?') + ')', 4200); return false;
    }
  }
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name });
    document.body.append(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
    toast(t('save.ok', name)); return true;
  } catch (e) { toast(t('save.fail'), 4000); return false; }
}

/* ---- всплывающие панели (popover) и меню ---- */
let POP = null;
function closePopover() {
  if (!POP) return;
  const p = POP; POP = null;
  p.el.remove();
  document.removeEventListener('pointerdown', p.onDoc, true);
  document.removeEventListener('keydown', p.onKey, true);
  if (p.onClose) p.onClose();
}
function placeEl(el, anchor, at, side) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  let x, y;
  if (anchor) {
    const a = anchor.getBoundingClientRect();
    x = a.left; y = a.bottom + 8;
    if (side === 'top') y = a.top - r.height - 8;
    if (side === 'right') { x = a.right + 8; y = a.top; }
    if (y + r.height > vh - 8 && side !== 'right') y = Math.max(8, a.top - r.height - 8);
    if (x + r.width > vw - 8) x = Math.max(8, a.right - r.width);
  } else { x = at.x; y = at.y; }
  x = clamp(x, 8, Math.max(8, vw - r.width - 8));
  y = clamp(y, 8, Math.max(8, vh - r.height - 8));
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
function popover(anchor, content, opts = {}) {
  if (POP && POP.anchor === anchor && anchor) { closePopover(); return null; }
  closePopover();
  const el = h('div', { class: 'pop ' + (opts.cls || '') }, content);
  layer().append(el);
  placeEl(el, anchor, opts.at, opts.side);
  const onDoc = ev => { if (el.contains(ev.target)) return; if (anchor && anchor.contains(ev.target)) return; closePopover(); };
  const onKey = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); closePopover(); } };
  document.addEventListener('pointerdown', onDoc, true);
  document.addEventListener('keydown', onKey, true);
  POP = { el, anchor, onDoc, onKey, onClose: opts.onClose };
  return { el, close: closePopover, reposition: () => placeEl(el, anchor, opts.at, opts.side) };
}
/* items: {label, icon, onClick, danger, sep, swatches:{value,onPick,none}, header} */
function menuAt(anchor, items) { return popover(anchor, menuBox(items), { cls: 'menu-pop' }); }
function showMenu(x, y, items) { return popover(null, menuBox(items), { at: { x, y }, cls: 'menu-pop' }); }
function menuBox(items) {
  const box = h('div', { class: 'menu' });
  for (const it of items) {
    if (!it) continue;
    if (it.sep) { box.append(h('div', { class: 'msep' })); continue; }
    if (it.header) { box.append(h('div', { class: 'mhead' }, it.header)); continue; }
    if (it.swatches) { box.append(swatchRow(it.swatches.value, c => { closePopover(); it.swatches.onPick(c); }, it.swatches.none)); continue; }
    box.append(h('div', { class: 'mi' + (it.danger ? ' danger' : '') + (it.disabled ? ' off' : ''), onclick: () => { if (it.disabled) return; closePopover(); it.onClick && it.onClick(); } },
      it.icon ? icon(it.icon, 16) : h('span', { class: 'mi-sp' }), h('span', { class: 'mi-l' }, it.label), it.kbd ? h('span', { class: 'mi-k' }, it.kbd) : null));
  }
  return box;
}
function swatchRow(value, onPick, none) {
  const row = h('div', { class: 'swatches' });
  if (none) row.append(h('button', { class: 'sw none' + (!value ? ' on' : ''), 'data-tip': none, onclick: () => onPick(null) }, icon('x', 12, 2.4)));
  for (const c of COLOR_NAMES) {
    row.append(h('button', { class: 'sw' + (value === c ? ' on' : ''), style: { background: 'var(--c-' + c + ')' }, 'data-tip': t('color.' + c), onclick: () => onPick(c) }, value === c ? icon('check', 12, 3) : null));
  }
  return row;
}

/* ---- модальные окна ---- */
const MODALS = [];
function openModal({ cls = '', build, onClose, dismiss = true }) {
  document.querySelectorAll('.toast:not(.act)').forEach(x => x.remove());
  const back = h('div', { class: 'backdrop' });
  const card = h('div', { class: 'modal ' + cls });
  back.append(card);
  const m = { el: back, card, opened: performance.now(), onClose, closed: false, tag: null };
  m.close = () => {
    if (m.closed) return; m.closed = true;
    const i = MODALS.indexOf(m); if (i >= 0) MODALS.splice(i, 1);
    back.classList.add('out'); setTimeout(() => back.remove(), 120);
    if (m.onClose) m.onClose();
  };
  let down = false;
  back.addEventListener('pointerdown', e => { down = e.target === back; });
  back.addEventListener('pointerup', e => { if (down && e.target === back && dismiss && performance.now() - m.opened > 450) m.close(); down = false; });
  card.append(build(m));
  layer().append(back);
  MODALS.push(m);
  return m;
}
function modalHead(title, m, extra) {
  return h('div', { class: 'm-head' }, h('div', { class: 'm-title' }, title), extra || null, h('div', { class: 'grow' }),
    h('button', { class: 'btn icon', 'data-tip': t('c.close') + ' (Esc)', onclick: () => m.close() }, icon('x', 18)));
}
function confirmDlg({ title, text, ok, danger }) {
  return new Promise(res => {
    openModal({
      cls: 'dlg', onClose: () => res(false),
      build: m => h('div', { class: 'dlg-body' }, h('h3', title), text ? h('p', text) : null,
        h('div', { class: 'dlg-actions' },
          h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')),
          h('button', { class: 'btn ' + (danger ? 'danger-fill' : 'primary'), onclick: () => { res(true); m.close(); } }, ok || 'OK')))
    });
  });
}
function promptDlg({ title, label, value = '', ok, placeholder = '', empty = false }) {
  return new Promise(res => {
    openModal({
      cls: 'dlg', onClose: () => res(null),
      build: m => {
        const inp = h('input', { class: 'inp', type: 'text', value, placeholder });
        const go = () => { const v = inp.value.trim(); if (!v && !empty) return; res(v); m.close(); };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        setTimeout(() => { inp.focus(); inp.select(); }, 30);
        return h('div', { class: 'dlg-body' }, h('h3', title), label ? h('label', { class: 'lbl' }, label) : null, inp,
          h('div', { class: 'dlg-actions' },
            h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')),
            h('button', { class: 'btn primary', onclick: go }, ok || 'OK')));
      }
    });
  });
}

/* ---- форма: поля ---- */
function field(label, control, hint) {
  return h('div', { class: 'field' }, label ? h('div', { class: 'lbl' }, label) : null, control, hint ? h('div', { class: 'hint' }, hint) : null);
}
function autosize(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight + 2, 520) + 'px'; }
function bindInput(obj, key, { ph = '', cls = '', onChange, mono } = {}) {
  const i = h('input', { class: 'inp ' + cls + (mono ? ' mono' : ''), type: 'text', value: obj[key] == null ? '' : obj[key], placeholder: ph, spellcheck: 'false' });
  i.addEventListener('input', () => { obj[key] = i.value; onChange && onChange(i.value); });
  return i;
}
function bindArea(obj, key, { ph = '', rows = 4, onChange, mono, grow = true } = {}) {
  const a = h('textarea', { class: 'ta' + (mono ? ' mono' : ''), rows, placeholder: ph });
  a.value = obj[key] == null ? '' : obj[key];
  a.addEventListener('input', () => { obj[key] = a.value; if (grow) autosize(a); onChange && onChange(a.value); });
  if (grow) { requestAnimationFrame(() => autosize(a)); setTimeout(() => autosize(a), 60); }
  return a;
}
function segmented(options, value, onPick, cls = '') {
  const box = h('div', { class: 'seg ' + cls });
  options.forEach(o => {
    const b = h('button', { class: value === o.value ? 'on' : '', 'data-tip': o.tip || null, onclick: () => { onPick(o.value); [...box.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); } },
      o.icon ? icon(o.icon, 15) : null, o.dot ? h('span', { class: 'sdot', style: { background: o.dot } }) : null, o.label != null ? h('span', o.label) : null);
    box.append(b);
  });
  return box;
}
function switchEl(value, onChange, label) {
  const b = h('button', { class: 'switch' + (value ? ' on' : ''), role: 'switch', 'aria-checked': String(!!value) }, h('span', { class: 'knob' }));
  b.addEventListener('click', () => { const v = !b.classList.contains('on'); b.classList.toggle('on', v); b.setAttribute('aria-checked', String(v)); onChange(v); });
  return label ? h('label', { class: 'switch-row' }, b, h('span', label)) : b;
}

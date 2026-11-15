'use strict';
/* ====== Модель данных, история, сохранение, демо-проект ====== */
const GRID = 20, NODE_W = 240;
const COLOR_NAMES = ['red', 'orange', 'yellow', 'green', 'mint', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'gray'];
const STATUSES = ['idea', 'draft', 'written', 'done'];
const STATUS_COLOR = { idea: 'gray', draft: 'orange', written: 'blue', done: 'green' };
const STATUS_W = { idea: 0, draft: 0.3, written: 0.7, done: 1 };
const NODE_TYPES = ['chapter', 'fork', 'ending', 'note'];
const TYPE_ICON = { chapter: 'book', fork: 'fork', ending: 'flag', note: 'note' };
const TYPE_COLOR = { chapter: 'blue', fork: 'orange', ending: 'purple', note: 'yellow' };
const ASSET_KINDS = ['bg', 'sprite', 'music', 'sfx', 'voice', 'fx'];
const KIND_ICON = { bg: 'image', sprite: 'user', music: 'music', sfx: 'volume', voice: 'mic', fx: 'sparkles', font: 'type', tf: 'motion', gui: 'palette' };
const VAR_TYPES = ['raw', 'flag', 'choice', 'number'];
const STORED_KINDS = [...ASSET_KINDS, 'font', 'tf', 'gui'];
const LS_P = 'vnmap.project.v1', LS_S = 'vnmap.settings.v1', LS_B = 'vnmap.lastBackup';
const SIDES = ['t', 'r', 'b', 'l'];
const HEX6 = /^#[0-9a-fA-F]{6}$/;

/** Настройки интерфейса игры (переменные gui.* из gui.rpy). Не задано — остаётся как в проекте Ren'Py. t: color | size | font; d — значение стандартного шаблона (для образца). */
const GUI_KEYS = [
  { k: 'accent_color', t: 'color', d: '#0099cc', g: 'colors' }, { k: 'text_color', t: 'color', d: '#ffffff', g: 'colors' }, { k: 'interface_text_color', t: 'color', d: '#ffffff', g: 'colors' },
  { k: 'idle_color', t: 'color', d: '#888888', g: 'colors' }, { k: 'idle_small_color', t: 'color', d: '#aaaaaa', g: 'colors' }, { k: 'hover_color', t: 'color', d: '#66c1e0', g: 'colors' },
  { k: 'selected_color', t: 'color', d: '#ffffff', g: 'colors' }, { k: 'muted_color', t: 'color', d: '#003d52', g: 'colors' }, { k: 'hover_muted_color', t: 'color', d: '#005b7a', g: 'colors' },
  { k: 'text_size', t: 'size', d: 33, min: 1, g: 'sizes' }, { k: 'name_text_size', t: 'size', d: 45, min: 1, g: 'sizes' }, { k: 'interface_text_size', t: 'size', d: 33, min: 1, g: 'sizes' },
  { k: 'label_text_size', t: 'size', d: 36, min: 1, g: 'sizes' }, { k: 'notify_text_size', t: 'size', d: 24, min: 1, g: 'sizes' }, { k: 'title_text_size', t: 'size', d: 75, min: 1, g: 'sizes' },
  { k: 'textbox_height', t: 'size', d: 278, min: 1, g: 'box' }, { k: 'dialogue_xpos', t: 'size', d: 402, min: -4000, g: 'box' }, { k: 'dialogue_ypos', t: 'size', d: 75, min: -4000, g: 'box' },
  { k: 'dialogue_width', t: 'size', d: 1116, min: 1, g: 'box' }, { k: 'name_xpos', t: 'size', d: 360, min: -4000, g: 'box' }, { k: 'name_ypos', t: 'size', d: 0, min: -4000, g: 'box' },
  { k: 'text_font', t: 'font', g: 'fonts' }, { k: 'name_text_font', t: 'font', g: 'fonts' }, { k: 'interface_text_font', t: 'font', g: 'fonts' },
];
function guiClean(g) {
  const out = {};
  if (!g || typeof g !== 'object' || Array.isArray(g)) return out;
  for (const d of GUI_KEYS) {
    const v = g[d.k];
    if (v === undefined || v === null || v === '') continue;
    if (d.t === 'color') { if (HEX6.test(String(v))) out[d.k] = String(v).toLowerCase(); }
    else if (d.t === 'size') { const n = Math.round(+v); if (isFinite(n) && n >= d.min && n <= 4000) out[d.k] = n; }
    else { const s = String(v).trim().slice(0, 200); if (s) out[d.k] = s; }
  }
  return out;
}

const ACH_TRIGS = ['ending', 'block', 'endings_all', 'cg_all', 'manual'];   // когда выдаётся достижение
const DEFAULT_BUILD = { mode: 'split', placeholders: true, skipMissingAudio: true, endingCard: true, endingCounter: true, includeUnreachable: true, includeDocs: true, includeSource: true, endingCredits: false, tlMin: 'draft', extras: true };
const DEFAULT_S = { theme: 'dark', lang: 'ru', grid: 'dots', snap: true, wheel: 'zoom', transition: 'dissolve', echo: true, jumps: true, updRepo: '', updAuto: true, updChecked: 0, updSeen: '', shSeen: '' };
let S = Object.assign({}, DEFAULT_S);
let P = null;
const UI = {
  sel: new Set(), edge: null, hits: null, connectMode: null, hoverEdge: null,
  saveState: 'saved', lastBackup: 0
};

/* ---- индексация ---- */
let _nmap = null;
let DATA_VER = 1, PAR_CACHE = null;
function reindex() { _nmap = null; SIZE_CACHE.clear(); DATA_VER++; PAR_CACHE = null; }
function nodeById(id) {
  if (!_nmap) _nmap = new Map(P.nodes.map(n => [n.id, n]));
  return _nmap.get(id);
}
const edgeById = id => P.edges.find(e => e.id === id);
const charById = id => P.characters.find(c => c.id === id);
const assetById = id => P.assets.find(a => a.id === id);
function findFile(fid) {
  for (const n of P.nodes) {
    const i = n.files.findIndex(f => f.id === fid);
    if (i >= 0) return { node: n, file: n.files[i], index: i };
  }
  return null;
}
function allFiles() {
  const out = [];
  for (const n of P.nodes) for (const f of n.files) out.push({ node: n, file: f });
  return out;
}
const wordCount = str => ((str || '').match(/\S+/g) || []).length;
const pal = () => THEMES[S.theme] || THEMES.dark;
const palColor = name => pal().colors[name] || pal().colors.blue;

/* ---- транслитерация для меток/файлов Ren'Py ---- */
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
function slug(str) {
  let o = String(str || '').toLowerCase().split('').map(c => TR[c] != null ? TR[c] : c).join('');
  o = o.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!o) o = 'scene';
  if (/^[0-9]/.test(o)) o = 'ch_' + o;
  return o;
}

/* ---- автонумерация: «Глава 2 / main02» → «Глава 3 / main03» ---- */
const NUM_TAIL = /^(.*?)(\d{1,9})(\D*)$/s;
/** Увеличивает последнее число в строке, сохраняя нули слева: main02 → main03, ch9 → ch10. */
function bumpNum(str, by = 1) {
  const m = NUM_TAIL.exec(str || ''); if (!m) return null;
  return m[1] + String(parseInt(m[2], 10) + by).padStart(m[2].length, '0') + m[3];
}
/** «Глава 2 — Встреча» → «Глава 2»: пояснение к прошлой главе в новое название не переносим. */
const stripTitleTail = str => (str || '').trim().replace(/^(.*?\d+)\s*(?:[—–:|.]|-)+\s+\S.*$/s, '$1');
/** Название, имя файла и метка следующего файла по предыдущему; null, если ни в одном нет числа. */
function nextFileNaming(prev, count) {
  if (!prev) return null;
  const stem = (prev.filename || '').replace(/\.rpy$/i, '').trim();
  let title = bumpNum(stripTitleTail(prev.title));
  const fn = stem ? bumpNum(stem) : null, lb = prev.label ? bumpNum(prev.label) : null;
  if (!title && !fn && !lb) return null;
  if (!title) { const m = NUM_TAIL.exec(fn || lb); title = t('file.new') + ' ' + parseInt(m[2], 10); }
  return { title, filename: fn ? fn + '.rpy' : '', label: lb || '' };
}
/** Новый файл «после» prev: название по порядку, метка и имя .rpy свободны во всём проекте. */
function newFileAfter(prev, node) {
  const count = node ? node.files.length : 0;
  const nm = nextFileNaming(prev, count);
  const f = newFile(nm ? nm.title : t('file.new') + ' ' + (count + 1));
  if (!nm) return f;
  f.filename = nm.filename; f.label = nm.label;
  const clash = () => {
    const L = fileLabel(f), N = fileName(f);
    return allFiles().some(x => fileLabel(x.file) === L || (x.node === node && fileName(x.file) === N));
  };
  for (let i = 0; i < 500 && clash(); i++) {
    const tt = bumpNum(f.title), ff = f.filename ? bumpNum(f.filename.replace(/\.rpy$/i, '')) : null, ll = f.label ? bumpNum(f.label) : null;
    if (!tt && !ff && !ll) break;
    if (tt) f.title = tt; if (ff) f.filename = ff + '.rpy'; if (ll) f.label = ll;
  }
  return f;
}
/** Первый файл нового блока берёт название по последнему файлу блока-источника. */
function seedFirstFile(n, from) {
  const src = from && from.files[from.files.length - 1];
  const f = n.files[0];
  if (!src || !f || f.script || f.summary) return;
  const nm = nextFileNaming(src, 0);
  if (!nm) return;
  n.files.shift();
  const nf = newFileAfter(src, n);
  nf.id = f.id; n.files.unshift(nf);
}

/* ---- создание объектов ---- */
const authorNow = () => (typeof meId === 'function' ? meId() : '');
function newFile(title) {
  const by = authorNow();
  return Object.assign(by ? { by } : {}, { id: uid('f'), title: title || t('file.new'), filename: '', label: '', status: 'idea', summary: '', cast: [], location: '', notes: '', visual: '', assets: [], script: '', text: '', textLive: false, textOut: '', src: null });
}
function newNode(type, x, y) {
  const n = {
    id: uid('n'), type, x: snapTo(x, GRID), y: snapTo(y, GRID), title: t('node.new.' + type), desc: '',
    color: TYPE_COLOR[type] || 'blue', defaultCast: [], files: [], unlock: null, prompt: '', done: false
  };
  if (type !== 'note') n.files.push(newFile());
  return n;
}
function addNode(type, x, y, color) {
  const n = newNode(type, x, y);
  if (color) n.color = color;
  const me = authorNow(); if (me) n.by = me;
  P.nodes.push(n); reindex();
  return n;
}
function addEdge(from, to, fromSide = 'auto', toSide = 'auto') {
  if (from === to) return null;
  const e = { id: uid('e'), from, to, fromSide, toSide, title: '', desc: '', color: null, dashed: false, main: false, cond: '', code: '', sets: [], pts: [], lo: null };
  P.edges.push(e);
  return e;
}
function deleteNodes(ids) {
  const set = new Set(ids);
  P.nodes = P.nodes.filter(n => !set.has(n.id));
  P.edges = P.edges.filter(e => !set.has(e.from) && !set.has(e.to));
  for (const n of P.nodes) if (n.unlock) n.unlock.from = n.unlock.from.filter(i => !set.has(i));
  for (const id of ids) delete P.sim.reached[id];
  P.cmts = (P.cmts || []).filter(c => !set.has(c.nid));
  for (const a of P.achs || []) if (set.has(a.ref)) a.ref = '';
  if (set.has(P.startId)) P.startId = '';
  reindex();
}
function deleteEdge(id) { P.edges = P.edges.filter(e => e.id !== id); }
function duplicateNodes(ids) {
  const set = new Set(ids), map = new Map(), out = [];
  for (const n of P.nodes.filter(n => set.has(n.id))) {
    const c = JSON.parse(JSON.stringify(n));
    c.id = uid('n'); c.x += GRID * 2; c.y += GRID * 2; c.unlock = null;
    c.files.forEach(f => { f.id = uid('f'); f.label = f.label ? f.label + '_copy' : ''; });
    c.title = n.title + ' ' + t('c.copy');
    map.set(n.id, c.id); out.push(c);
  }
  P.nodes.push(...out);
  for (const e of [...P.edges]) if (map.has(e.from) && map.has(e.to)) {
    const c = JSON.parse(JSON.stringify(e)); c.id = uid('e'); c.from = map.get(e.from); c.to = map.get(e.to); c.pts = (c.pts || []).map(q => [q[0] + GRID * 2, q[1] + GRID * 2]); P.edges.push(c);
  }
  reindex();
  return out.map(n => n.id);
}
function resetSim() { P.sim = { reached: {} }; }

/* ---- производные данные ---- */
function effectiveCast(node, file) {
  const auto = [];
  for (const c of P.characters) if (c.always) auto.push(c.id);
  for (const id of node.defaultCast || []) if (!auto.includes(id) && charById(id)) auto.push(id);
  const own = (file.cast || []).filter(id => !auto.includes(id) && charById(id));
  return { auto, own, all: [...auto, ...own] };
}
function nodeProgress(n) {
  const total = n.files.length;
  const done = n.files.filter(f => f.status === 'done').length;
  const w = total ? n.files.reduce((a, f) => a + (STATUS_W[f.status] || 0), 0) / total : 0;
  return { total, done, pct: w };
}
function unlockState(n) {
  if (!n.unlock) return null;
  const from = (n.unlock.from || []).filter(id => nodeById(id));
  const have = from.filter(id => P.sim.reached[id]).length;
  const need = Math.min(n.unlock.need || 1, Math.max(1, from.length));
  return { need, have, total: from.length, ok: have >= need };
}
function projectStats() {
  const files = allFiles();
  const by = { idea: 0, draft: 0, written: 0, done: 0 };
  let words = 0;
  for (const { file } of files) { by[file.status] = (by[file.status] || 0) + 1; words += wordCount(file.script); }
  const total = files.length;
  const pct = total ? files.reduce((a, { file }) => a + (STATUS_W[file.status] || 0), 0) / total : 0;
  return { nodes: P.nodes.length, files: total, edges: P.edges.length, words, by, pct, endings: P.nodes.filter(n => n.type === 'ending').length };
}

/* ---- перевод: структура и очистка ---- */
function normTl(x) {
  const o = x && typeof x === 'object' && !Array.isArray(x) ? x : {};
  const tl = { base: String(o.base || '').slice(0, 40), langs: [], rec: {}, idx: {} };
  const codes = new Set(), ids = new Set();
  for (const l of Array.isArray(o.langs) ? o.langs : []) {
    if (!l || typeof l !== 'object') continue;
    let code = String(l.code || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
    if (!/^[a-z]/.test(code) || ['none', 'strings', 'python', 'style', 'init', 'default', 'define'].includes(code)) code = 'lang_' + (tl.langs.length + 1);
    while (codes.has(code)) code += '_2';
    let id = typeof l.id === 'string' && l.id && !ids.has(l.id) ? l.id : uid('l');
    codes.add(code); ids.add(id);
    tl.langs.push({ id, code, name: String(l.name || code).slice(0, 40), owners: Array.isArray(l.owners) ? l.owners.filter(v => typeof v === 'string') : [] });
    const rs = {}, src = o.rec && o.rec[l.id] && typeof o.rec[l.id] === 'object' ? o.rec[l.id] : {};
    for (const k of Object.keys(src)) {
      const r = src[k]; if (!r || typeof r !== 'object') continue;
      const e = { t: typeof r.t === 'string' ? r.t : '', v: typeof r.v === 'string' ? r.v : '', s: ['draft', 'review', 'done'].includes(r.s) ? r.s : '', src: typeof r.src === 'string' ? r.src : '' };
      if (e.t || e.v) rs[k] = e;
    }
    tl.rec[id] = rs;
  }
  if (o.idx && typeof o.idx === 'object') for (const k of Object.keys(o.idx)) if (Array.isArray(o.idx[k])) tl.idx[k] = o.idx[k].filter(v => typeof v === 'string');
  return tl;
}

/* ---- нормализация (импорт, миграция) ---- */
function normalize(p) {
  p.v = 1;
  p.uid = typeof p.uid === 'string' && p.uid.length >= 8 ? p.uid : longId('vn');
  p.name = typeof p.name === 'string' && p.name ? p.name : t('proj.default');
  for (const k of ['nodes', 'edges', 'characters', 'assets', 'vars', 'members', 'cmts', 'ign', 'achs']) if (!Array.isArray(p[k])) p[k] = [];
  p.tl = normTl(p.tl);
  p.startId = typeof p.startId === 'string' ? p.startId : '';
  p.filesUrl = typeof p.filesUrl === 'string' && /^https?:\/\/\S+$/i.test(p.filesUrl.trim()) ? p.filesUrl.trim().slice(0, 600) : '';   // ссылка на общую папку файлов
  p.build = Object.assign({}, DEFAULT_BUILD, p.build && typeof p.build === 'object' ? p.build : {});
  p.build.mode = p.build.mode === 'single' ? 'single' : 'split';
  p.sim = p.sim && typeof p.sim === 'object' ? p.sim : {}; p.sim.reached = p.sim.reached || {};
  p.view = p.view && isFinite(p.view.x) && isFinite(p.view.y) && isFinite(p.view.k) ? p.view : { x: 80, y: 120, k: 1 };
  p.view.k = clamp(p.view.k, 0.05, 4);
  { const tt = p.teTabs && typeof p.teTabs === 'object' ? p.teTabs : {}; p.teTabs = { ids: (Array.isArray(tt.ids) ? tt.ids : []).filter(x => typeof x === 'string').slice(0, 24), on: typeof tt.on === 'string' ? tt.on : '', docs: (Array.isArray(tt.docs) ? tt.docs : []).filter(x => typeof x === 'string').slice(0, 24), doc: typeof tt.doc === 'string' ? tt.doc : '' }; }   // вкладки редактора текста: не входят в историю отмены
  /* участники проекта: имя, цвет, роли */
  const seenM = new Set();
  p.members = p.members.filter(m => m && typeof m === 'object').slice(0, 60);
  for (const m of p.members) {
    m.id = typeof m.id === 'string' && m.id && !seenM.has(m.id) ? m.id : uid('m'); seenM.add(m.id);
    m.name = String(m.name || '').slice(0, 80); m.color = COLOR_NAMES.includes(m.color) ? m.color : COLOR_NAMES[(seenM.size - 1) % (COLOR_NAMES.length - 1)];
    m.roles = [...new Set((Array.isArray(m.roles) ? m.roles : []).map(r => String(r).trim().slice(0, 40)).filter(Boolean))].slice(0, 10);
    m.ids = [...new Set((Array.isArray(m.ids) ? m.ids : []).map(x => String(x).trim().slice(0, 80)).filter(Boolean))].slice(0, 6);
    m.contact = String(m.contact || '').slice(0, 160); m.notes = String(m.notes || '').slice(0, 600); m.credit = m.credit !== false;
  }
  const cleanIds = a => [...new Set((Array.isArray(a) ? a : []).filter(x => typeof x === 'string' && seenM.has(x)))];
  for (const l of p.tl.langs) l.owners = cleanIds(l.owners);
  for (const c of p.characters) {
    c.id = c.id || uid('c'); c.actor = typeof c.actor === 'string' && seenM.has(c.actor) ? c.actor : ''; c.name = c.name || ''; c.tag = c.tag || ''; c.color = COLOR_NAMES.includes(c.color) ? c.color : 'gray';
    c.aliases = c.aliases || ''; c.always = !!c.always; c.notes = c.notes || '';
    c.font = typeof c.font === 'string' ? c.font : ''; c.gameName = typeof c.gameName === 'string' ? c.gameName : ''; c.gameColor = HEX6.test(c.gameColor || '') ? c.gameColor.toLowerCase() : ''; c.textColor = HEX6.test(c.textColor || '') ? c.textColor.toLowerCase() : '';
  }
  for (const a of p.assets) {
    a.id = a.id || uid('a'); a.kind = STORED_KINDS.includes(a.kind) ? a.kind : 'bg'; a.name = a.name || ''; a.path = a.path || '';
    a.notes = a.notes || ''; a.expr = Array.isArray(a.expr) ? a.expr : []; a.owners = cleanIds(a.owners);
    if (a.kind === 'bg' && a.cg) a.cg = true; else delete a.cg;                 // CG: показывать в галерее
    if (a.kind === 'music' && a.room === false) a.room = false; else delete a.room;   // музыка: false = не показывать в музыкальной комнате
    a.code = typeof a.code === 'string' ? a.code : ''; a.tpl = typeof a.tpl === 'string' ? a.tpl : ''; a.params = a.params && typeof a.params === 'object' && !Array.isArray(a.params) ? a.params : {};
    const fl = {};
    if (a.files && typeof a.files === 'object') for (const k of Object.keys(a.files)) {
      const m = a.files[k];
      if (m && typeof m.bid === 'string' && m.bid) fl[k] = { bid: m.bid, name: String(m.name || ''), size: +m.size || 0, type: String(m.type || '') };
    }
    a.files = fl;
  }
  for (const v of p.vars) {
    v.id = v.id || uid('v'); v.name = String(v.name || ''); v.value = String(v.value == null ? '0' : v.value); v.notes = v.notes || '';
    v.type = VAR_TYPES.includes(v.type) ? v.type : /^(True|False)$/.test(v.value.trim()) ? 'flag' : /^-?\d+(\.\d+)?$/.test(v.value.trim()) ? 'number' : 'raw';
    v.values = Array.isArray(v.values) ? [...new Set(v.values.map(x => String(x).trim()).filter(Boolean))].slice(0, 30) : [];
  }
  for (const n of p.nodes) {
    n.id = n.id || uid('n'); n.type = NODE_TYPES.includes(n.type) ? n.type : 'chapter';
    n.x = isFinite(n.x) ? n.x : 0; n.y = isFinite(n.y) ? n.y : 0; n.title = n.title || ''; n.desc = n.desc || '';
    n.color = COLOR_NAMES.includes(n.color) ? n.color : TYPE_COLOR[n.type];
    n.defaultCast = Array.isArray(n.defaultCast) ? n.defaultCast : []; n.prompt = n.prompt || ''; n.done = n.type === 'note' && !!n.done;
    n.files = Array.isArray(n.files) ? n.files : []; n.owners = cleanIds(n.owners);
    if (typeof n.by === 'string' && seenM.has(n.by)) { /* автор блока */ } else delete n.by;
    if (n.unlock && typeof n.unlock === 'object') { n.unlock.need = Math.max(1, +n.unlock.need || 1); n.unlock.from = Array.isArray(n.unlock.from) ? n.unlock.from : []; } else n.unlock = null;
    for (const f of n.files) {
      f.id = f.id || uid('f'); f.title = f.title || ''; f.filename = f.filename || ''; f.label = f.label || '';
      f.status = STATUSES.includes(f.status) ? f.status : 'idea'; f.summary = f.summary || ''; f.cast = Array.isArray(f.cast) ? f.cast : [];
      f.location = f.location || ''; f.notes = f.notes || ''; f.visual = f.visual || ''; f.assets = Array.isArray(f.assets) ? f.assets : []; f.script = f.script || ''; f.text = typeof f.text === 'string' ? f.text : ''; f.textLive = !!f.textLive; f.textOut = typeof f.textOut === 'string' ? f.textOut : ''; f.src = f.src && typeof f.src === 'object' && typeof f.src.h === 'string' ? { name: String(f.src.name || '').slice(0, 200), at: Number(f.src.at) || 0, h: f.src.h, key: String(f.src.key || '').slice(0, 200) } : null; f.owners = cleanIds(f.owners);
      if (!(typeof f.by === 'string' && seenM.has(f.by))) delete f.by;
      if (typeof f.ed === 'string' && seenM.has(f.ed) && +f.edt > 0) f.edt = +f.edt; else { delete f.ed; delete f.edt; }
    }
  }
  const ids = new Set(p.nodes.map(n => n.id));
  if (!ids.has(p.startId)) p.startId = '';
  /* заметки-стикеры: только к существующим блокам; если главы уже нет, заметка остаётся у блока */
  const fileIds = new Set(); for (const n of p.nodes) for (const f of n.files) fileIds.add(f.id);
  const seenK = new Set();
  p.cmts = p.cmts.filter(c => c && typeof c === 'object' && ids.has(c.nid) && typeof c.text === 'string' && c.text.trim()).slice(0, 1000);
  for (const c of p.cmts) {
    c.id = typeof c.id === 'string' && c.id && !seenK.has(c.id) ? c.id : uid('k'); seenK.add(c.id);
    c.fid = typeof c.fid === 'string' && fileIds.has(c.fid) ? c.fid : ''; c.by = String(c.by || '').slice(0, 60); c.t = isFinite(c.t) ? +c.t : 0; c.text = c.text.slice(0, 2000); c.done = !!c.done;
    if (c.rv) c.rv = 1; else delete c.rv;                      // замечание проверяющего (ветки авторов): rv — признак, to — кому
    if (c.to) c.to = String(c.to).slice(0, 60); else delete c.to;
  }
  /* скрытые замечания проверки сюжета: id получается из ключа, поэтому одно и то же замечание, скрытое двумя людьми, не двоится */
  const seenX = new Set();
  p.ign = p.ign.filter(x => x && typeof x === 'object' && typeof x.key === 'string' && x.key && x.key.length < 300 && !seenX.has(x.key) && seenX.add(x.key)).slice(0, 2000);
  for (const x of p.ign) { x.by = String(x.by || '').slice(0, 60); x.id = ignId(x.key, x.by); delete x.t; }
  /* достижения: P.achs = [{ id, title, desc, icon, hidden, key (ID для Steam, пусто = по названию), trig, ref (блок) }] */
  const seenG = new Set();
  p.achs = p.achs.filter(a => a && typeof a === 'object').slice(0, 300);
  for (const a of p.achs) {
    a.id = typeof a.id === 'string' && a.id && !seenG.has(a.id) ? a.id : uid('g'); seenG.add(a.id);
    a.title = String(a.title == null ? '' : a.title).slice(0, 120); a.desc = String(a.desc == null ? '' : a.desc).slice(0, 400);
    a.icon = Array.from(String(a.icon == null ? '' : a.icon).trim()).slice(0, 2).join('');
    a.hidden = !!a.hidden;
    a.key = /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(a.key || '') ? a.key : '';
    a.trig = ACH_TRIGS.includes(a.trig) ? a.trig : 'manual';
    a.ref = typeof a.ref === 'string' && ids.has(a.ref) ? a.ref : '';
  }
  p.edges = p.edges.filter(e => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  for (const e of p.edges) {
    e.id = e.id || uid('e'); e.fromSide = SIDES.includes(e.fromSide) ? e.fromSide : 'auto'; e.toSide = SIDES.includes(e.toSide) ? e.toSide : 'auto';
    e.title = e.title || ''; e.desc = e.desc || ''; e.color = COLOR_NAMES.includes(e.color) ? e.color : null; e.dashed = !!e.dashed; e.main = !!e.main; e.cond = e.cond || ''; e.code = e.code || '';
    e.sets = (Array.isArray(e.sets) ? e.sets : []).filter(x => x && typeof x.v === 'string').slice(0, 12).map(x => ({ v: x.v, op: ['set', 'add', 'sub'].includes(x.op) ? x.op : 'set', val: String(x.val == null ? '' : x.val) }));
    e.pts = (Array.isArray(e.pts) ? e.pts : []).filter(q => Array.isArray(q) && isFinite(q[0]) && isFinite(q[1])).slice(0, 16).map(q => [Math.round(q[0]), Math.round(q[1])]);
    e.lo = Array.isArray(e.lo) && e.lo.length === 2 && isFinite(e.lo[0]) && isFinite(e.lo[1]) && (Math.round(e.lo[0]) || Math.round(e.lo[1])) ? [Math.round(e.lo[0]), Math.round(e.lo[1])] : null;   // сдвиг плашки с названием
  }
  /* сдвиги плашек у «эха» и стрелок по коду: ключ → [dx, dy] */
  const lofs = {};
  if (p.lofs && typeof p.lofs === 'object' && !Array.isArray(p.lofs)) for (const k of Object.keys(p.lofs).slice(0, 600)) { const v = p.lofs[k]; if (Array.isArray(v) && isFinite(v[0]) && isFinite(v[1]) && (Math.round(v[0]) || Math.round(v[1]))) lofs[k] = [Math.round(v[0]), Math.round(v[1])]; }
  p.lofs = lofs;
  p.gui = guiClean(p.gui);
  return p;
}
function emptyProject() {
  return normalize({
    name: t('proj.default'), nodes: [], edges: [], characters: [], assets: defaultFx(), sim: { reached: {} }, view: { x: 120, y: 160, k: 1 }
  });
}
function defaultFx() {
  return ['dissolve', 'fade', 'pixellate', 'hpunch', 'vpunch', 'wipeleft', 'wiperight', 'moveinleft', 'moveinright']
    .map(n => ({ id: uid('a'), kind: 'fx', name: n, path: '', notes: '', expr: [], files: {} }));
}

/* ---- история (undo/redo) и сохранение ---- */
const HIST = { stack: [], i: -1, timer: null, st: null, bytes: 0 };
function snapJSON() {
  const v = P.view, tt = P.teTabs; P.view = undefined; P.teTabs = undefined;
  try { return JSON.stringify(P); } finally { P.view = v; P.teTabs = tt; }
}
let AUTH_SIG = null;                      // подписи глав для учёта «кто последним правил» (см. members.js)
function histPush() {
  clearTimeout(HIST.timer); HIST.timer = null;
  if (typeof authStamp === 'function') authStamp();
  const j = snapJSON();
  if (HIST.stack[HIST.i] !== j) {
    HIST.stack.splice(HIST.i + 1);
    HIST.stack.push(j); HIST.i = HIST.stack.length - 1;
    let total = HIST.stack.reduce((a, x) => a + x.length, 0);
    while (HIST.stack.length > 2 && (HIST.stack.length > 100 || total > 60e6)) { total -= HIST.stack[0].length; HIST.stack.shift(); HIST.i--; }
  }
  updateUndoButtons();
  scheduleSave();
}
function flushHistory() { if (HIST.timer) histPush(); }
/** Зафиксировать изменение. now=true — отдельный шаг истории сразу, иначе склеивается при наборе текста. */
function commit(now) {
  reindex();
  setSaveState('dirty');
  clearTimeout(HIST.timer);
  if (now) histPush(); else HIST.timer = setTimeout(histPush, 500);
  if (typeof collabTouch === 'function') collabTouch();
}
function resetHistory() { AUTH_SIG = null; HIST.stack = [snapJSON()]; HIST.i = 0; clearTimeout(HIST.timer); HIST.timer = null; updateUndoButtons(); }
function restoreSnap(j) {
  const v = P.view, tt = P.teTabs;
  P = normalize(JSON.parse(j)); P.view = v; if (tt) P.teTabs = tt;
  reindex();
  for (const id of [...UI.sel]) if (!nodeById(id)) UI.sel.delete(id);
  if (UI.edge && !edgeById(UI.edge)) UI.edge = null;
  updateUndoButtons(); scheduleSave(); setSaveState('dirty');
  onProjectReplaced();
  if (typeof collabTouch === 'function') collabTouch();
}
function undo() { flushHistory(); if (HIST.i > 0) { HIST.i--; restoreSnap(HIST.stack[HIST.i]); } }
function redo() { flushHistory(); if (HIST.i < HIST.stack.length - 1) { HIST.i++; restoreSnap(HIST.stack[HIST.i]); } }
const canUndo = () => HIST.i > 0 || !!HIST.timer;
const canRedo = () => HIST.i < HIST.stack.length - 1;

let _saveTimer = null;
function scheduleSave() { clearTimeout(_saveTimer); _saveTimer = setTimeout(saveNow, 700); if (typeof deskDirty === 'function') deskDirty(); if (typeof ghDirty === 'function') ghDirty(); }
function saveNow() {
  clearTimeout(_saveTimer);
  if (typeof GAME !== 'undefined' && GAME) return;                 // в HTML-игре для тестеров проект не сохраняется
  const ok = lsSet(LS_P, JSON.stringify(P));
  setSaveState(ok ? 'saved' : 'error');
}
function saveSettings() { lsSet(LS_S, JSON.stringify(S)); }
function setSaveState(st) { UI.saveState = st; if (typeof updateSaveBadge === 'function') updateSaveBadge(); }
function loadSettings() {
  try { const j = JSON.parse(lsGet(LS_S) || 'null'); if (j && typeof j === 'object') S = Object.assign({}, DEFAULT_S, j); } catch (e) { /* по умолчанию */ }
  if (!['ru', 'en'].includes(S.lang)) S.lang = 'ru';
  if (!THEMES[S.theme]) S.theme = 'dark';
  UI.lastBackup = +lsGet(LS_B) || 0;
}
function loadProject() {
  try {
    const raw = lsGet(LS_P);
    if (raw) { const p = JSON.parse(raw); if (p && Array.isArray(p.nodes)) return normalize(p); }
  } catch (e) { /* падаем на демо */ }
  return null;
}

/* ---- демо-проект ---- */
function demoProject() {
  const cAlice = { id: uid('c'), name: 'Алиса', tag: 'alice', color: 'orange', aliases: 'Аля, Алиска', always: false, notes: 'Главная героиня, новенькая в школе.' };
  const cMax = { id: uid('c'), name: 'Макс', tag: 'maks', color: 'cyan', aliases: '', always: false, notes: 'Староста класса, душа компании.' };
  const cIrina = { id: uid('c'), name: 'Ирина Сергеевна', tag: 'irina', color: 'pink', aliases: 'Ирина, Сергеевна, учительница', always: false, notes: 'Классный руководитель.' };
  const fx = defaultFx();
  const A = (kind, name, path, expr, notes) => ({ id: uid('a'), kind, name, path: path || '', notes: notes || '', expr: expr || [], files: {} });
  const bgSchool = A('bg', 'bg school', 'images/bg_school.png', [], 'Фасад школы, утро');
  const bgClass = A('bg', 'bg class', 'images/bg_class.png', [], 'Классная комната, окна слева');
  const bgStage = A('bg', 'bg stage', 'images/bg_stage.png', [], 'Сцена актового зала');
  const bgNight = A('bg', 'bg night', 'images/bg_night.png', [], 'Школьный двор, ночь, фонари');
  const sAlice = A('sprite', 'alice', 'images/alice', ['normal', 'smile', 'sad', 'angry'], '');
  const sMax = A('sprite', 'max', 'images/max', ['normal', 'laugh', 'surprised'], '');
  const sIrina = A('sprite', 'irina', 'images/irina', ['normal', 'smile'], '');
  const mMain = A('music', 'Главная тема', 'audio/main_theme.ogg', [], 'Спокойное фортепиано');
  const mFest = A('music', 'Фестиваль', 'audio/festival.ogg', [], 'Бодрая, с барабанами');
  const xBell = A('sfx', 'Звонок', 'audio/bell.ogg', [], '');
  const assets = [...fx, bgSchool, bgClass, bgStage, bgNight, sAlice, sMax, sIrina, mMain, mFest, xBell];
  const att = (a, note) => ({ id: uid('x'), ref: a.id, note: note || '' });
  const F = (title, status, summary, cast, script, extra = {}) => ({
    id: uid('f'), title, filename: '', label: slug(title), status, summary, cast: cast.map(c => c.id), location: extra.location || '',
    notes: extra.notes || '', visual: extra.visual || '', assets: extra.assets || [], script: script || ''
  });
  const N = (type, x, y, title, color, files, desc, extra = {}) => Object.assign({ id: uid('n'), type, x, y, title, desc: desc || '', color, defaultCast: [], files, unlock: null }, extra);

  const prolog = N('chapter', 0, 240, 'Пролог', 'blue', [
    F('Пролог 1 — Первый день', 'done', 'Алиса приезжает в новую школу. У входа её встречает Макс.', [cAlice, cMax],
      'scene bg school with fade\nplay music "audio/main_theme.ogg" fadein 1.0\nshow alice normal at center with dissolve\nalice "Ну вот и первый день в новой школе..."\n"Двери скрипнули, и в коридор хлынул шум голосов."\nshow max laugh at right with dissolve\nmaks "Эй, ты новенькая? Я Макс."\nalice "Алиса. Рада знакомству."',
      { location: 'Школа, вход, утро', visual: 'Утренний свет, лёгкая дымка у земли.', assets: [att(bgSchool, 'Утро'), att(sAlice), att(sMax), att(mMain)] }),
    F('Пролог 2 — Классная комната', 'written', 'Ирина Сергеевна представляет Алису классу. На доске висит афиша фестиваля.', [cAlice, cIrina],
      'scene bg class with dissolve\nshow irina smile at left with dissolve\nirina "Класс, познакомьтесь: это Алиса."\nshow alice smile at right\nalice "Здравствуйте..."\n"На стене висела яркая афиша: «Осенний фестиваль — запись в клубы до пятницы»."',
      { location: 'Класс, день', assets: [att(bgClass), att(sIrina)] }),
    F('Пролог 3 — Выбор кружка', 'draft', 'После уроков Алиса стоит перед списком клубов. Главная развилка игры.', [cAlice, cMax],
      'scene bg school with fade\nshow alice normal at center\nalice "Музыка, театр... или просто пойти домой?"',
      { notes: 'Варианты выбора рисуются стрелками из этого блока: компилятор сам соберёт menu.' })
  ], 'Знакомство с героями и миром. Заканчивается выбором клуба.', { prompt: 'Куда пойти после уроков?' });

  const music = N('chapter', 400, 0, 'Клуб музыки', 'pink', [
    F('Музыка 1 — Репетиция', 'done', 'Первая репетиция, Алиса пробует играть.', [cAlice, cMax], 'scene bg stage with fade\nshow alice smile at center\nalice "Тут так красиво звучит эхо!"'),
    F('Музыка 2 — Ссора', 'written', 'Размолвка из-за выбора песни.', [cAlice, cMax], ''),
    F('Музыка 3 — Мириться', 'draft', 'Макс приходит с извинениями.', [cAlice, cMax], ''),
    F('Музыка 4 — Генеральная', 'idea', 'Прогон перед фестивалем.', [cAlice, cMax], '')
  ]);
  const theatre = N('chapter', 400, 240, 'Театральный кружок', 'green', [
    F('Театр 1 — Прослушивание', 'written', 'Алису пробуют на роль.', [cAlice, cIrina], ''),
    F('Театр 2 — Костюмы', 'draft', 'Подготовка костюмов, забавные сцены с Максом.', [cAlice, cMax], '')
  ]);
  const solo = N('chapter', 400, 480, 'Свой путь', 'indigo', [
    F('Одна — Вечерняя прогулка', 'idea', 'Алиса бродит по ночному двору.', [cAlice], 'scene bg night with fade\nshow alice sad at center\nalice "Может, так и лучше."'),
    F('Одна — Неожиданная встреча', 'idea', 'Встреча с Ириной Сергеевной на скамейке.', [cAlice, cIrina], ''),
    F('Одна — Решение', 'idea', 'Алиса решает прийти на фестиваль зрителем.', [cAlice], '')
  ]);
  const fest = N('fork', 800, 240, 'Фестиваль', 'orange', [
    F('Фестиваль 1 — Открытие', 'draft', 'Все сходятся на фестивале. Определяется финал.', [cAlice, cMax, cIrina], 'play music "audio/festival.ogg" fadein 1.0\nscene bg stage with fade'),
    F('Фестиваль 2 — Финальный выбор', 'idea', 'Последний выбор, который ведёт к концовкам.', [cAlice], '')
  ], 'Развилка: все линии сходятся здесь и расходятся по концовкам.', { prompt: 'Как Алиса проведёт финал фестиваля?' });
  const endings = [
    ['Концовка: Дуэт', 'green', 'Алиса и Макс играют вместе на сцене.'],
    ['Концовка: Сцена', 'cyan', 'Алиса получает главную роль.'],
    ['Концовка: Тишина', 'gray', 'Алиса уходит с фестиваля одна.'],
    ['Концовка: Побег', 'red', 'Алиса уезжает из города.'],
    ['Концовка: Дружба', 'yellow', 'Весь класс вместе на финальном фото.']
  ].map(([title, color, sum], i) => N('ending', 1200, -60 + i * 160, title, color, [F(title.replace('Концовка: ', 'Финал — '), 'idea', sum, [cAlice], '')]));
  const secret = N('ending', 1600, 260, 'Истинная концовка', 'purple', [
    F('Финал — Истина', 'idea', 'Открывается после прохождения четырёх из пяти концовок. Раскрывает тайну школы.', [cAlice, cMax, cIrina], '')
  ], 'Секретная.', { unlock: { need: 4, from: endings.map(e => e.id) } });
  const note = N('note', 0, -20, 'Идея', 'yellow', [], 'Добавить погоду на карту дня: дождь делает музыкальные сцены грустнее. Проверить, влезет ли в бюджет.');

  const nodes = [prolog, music, theatre, solo, fest, ...endings, secret, note];
  const E = (a, b, title, desc, extra = {}) => Object.assign({ id: uid('e'), from: a.id, to: b.id, fromSide: 'auto', toSide: 'auto', title, desc: desc || '', color: null, dashed: false, cond: '', code: '', pts: [] }, extra);
  const edges = [
    E(prolog, music, 'Вступить в клуб музыки', 'Выбор в «Пролог 3». Алиса идёт на прослушивание к Максу.', { code: 'club = "music"\nmaks_like += 2' }),
    E(prolog, theatre, 'Пойти в театр', 'Выбор в «Пролог 3». Ирина Сергеевна ведёт драмкружок.', { code: 'club = "theatre"' }),
    E(prolog, solo, 'Отказаться от клубов', 'Алиса остаётся одна. Закрывает часть будущих сцен.', { code: 'club = "none"' }),
    E(music, fest, 'Выступление', 'Музыкальная линия выходит на фестиваль.', { code: 'maks_like += 1' }),
    E(theatre, fest, 'Премьера', 'Театральная линия выходит на фестиваль.'),
    E(solo, fest, 'Тихий вечер', 'Алиса приходит как зритель.'),
    E(fest, endings[0], 'Играть с Максом', 'Нужна симпатия Макса (maks_like ≥ 3).', { cond: 'maks_like >= 3' }),
    E(fest, endings[1], 'Взять роль', 'Только для театральной линии.', { cond: 'club == "theatre"' }),
    E(fest, endings[2], 'Уйти', ''),
    E(fest, endings[3], 'Сбежать', 'Если Алиса отказалась от клубов.', { color: 'red', cond: 'club == "none"' }),
    E(fest, endings[4], 'Позвать всех', 'Нужно пройти хотя бы две линии.', { dashed: true })
  ];
  return normalize({
    name: 'Осенний фестиваль (пример)', nodes, edges, characters: [cAlice, cMax, cIrina], assets, startId: prolog.id,
    vars: [
      { id: uid('v'), name: 'club', value: '""', notes: 'Выбранный клуб: "music", "theatre" или "none".' },
      { id: uid('v'), name: 'maks_like', value: '0', notes: 'Симпатия Макса.' }],
    sim: { reached: { [endings[0].id]: true, [endings[1].id]: true } }, view: { x: 100, y: 200, k: 0.72 }
  });
}

'use strict';
/* ====== Текст реплик: шрифты, теги оформления Ren'Py, разбиение по предложениям ======
   Шрифты хранятся в реестре как ассеты вида «font». В тексте реплики оформление записывается обычными тегами Ren'Py:
   {b}…{/b}, {size=+6}…{/size}, {font=fonts/x.ttf}…{/font}, {color=#f00}…{/color}, {cps=20}…{/cps}, {w=0.5}. */

/* ---------- шрифты ---------- */
const BUILTIN_FONTS = [{ ref: 'DejaVuSans.ttf', name: 'DejaVu Sans', css: '"DejaVu Sans", Verdana, sans-serif' }];
const RENPY_FONT = new Set(['ttf', 'otf', 'ttc']);
const FONT_TYPES = { ttf: 'font/ttf', otf: 'font/otf', ttc: 'font/collection' };
const FONT_SAMPLE = { ru: 'Съешь ещё этих мягких французских булок, да выпей чаю. 0123456789', en: 'The quick brown fox jumps over the lazy dog. 0123456789' };
const fontAssets = () => P.assets.filter(a => a.kind === 'font');
function fontExt(a) { const m = assetMeta(a, ''); return (m && metaExt(m)) || 'ttf'; }
/** Путь шрифта внутри game/, на который ссылается скрипт. */
function fontRef(a) { return a.path ? cmpPath(a.path) : 'fonts/' + slug(a.name) + '.' + fontExt(a); }
function fontChoices() {
  return [...BUILTIN_FONTS.map(f => ({ value: f.ref, label: f.name + ' (' + t('font.builtin') + ')', builtin: true })),
    ...fontAssets().map(a => ({ value: fontRef(a), label: a.name || fontRef(a), asset: a }))];
}
function fontAssetByRef(ref) {
  const k = cmpPath(String(ref || '')).toLowerCase(), nm = String(ref || '').trim().toLowerCase();
  return fontAssets().find(a => fontRef(a).toLowerCase() === k || (a.name || '').trim().toLowerCase() === nm) || null;
}
const FONT_FACES = new Map(); // bid → { family, state: 'loading'|'ok'|'bad' }
const FONT_LISTENERS = new Set();
function loadFont(a) {
  const m = assetMeta(a, ''); if (!m) return Promise.resolve(null);
  const rec = FONT_FACES.get(m.bid);
  if (rec) return rec.promise || Promise.resolve(rec.state === 'ok' ? rec.family : null);   // загрузка уже идёт: ждём ту же
  const nr = { family: 'vnf_' + String(m.bid).replace(/\W/g, ''), state: 'loading', promise: null }; FONT_FACES.set(m.bid, nr);
  nr.promise = (async () => {
    try {
      const blob = await blobGet(m.bid); if (!blob) throw new Error('no blob');
      const ff = new FontFace(nr.family, await blob.arrayBuffer());
      await ff.load(); document.fonts.add(ff); nr.state = 'ok';
      FONT_LISTENERS.forEach(fn => { try { fn(); } catch (e) { /* не страшно */ } });
      return nr.family;
    } catch (e) { nr.state = 'bad'; return null; }
  })();
  return nr.promise;
}
function loadAllFonts() { return Promise.all(fontAssets().map(loadFont)); }
/** CSS-семейство для предпросмотра; пока шрифт грузится, вернёт обычный. */
function fontCss(ref) {
  const b = BUILTIN_FONTS.find(f => f.ref.toLowerCase() === String(ref).toLowerCase()); if (b) return b.css;
  const a = fontAssetByRef(ref); if (!a) return null;
  const m = assetMeta(a, ''); if (!m) return null;
  const rec = FONT_FACES.get(m.bid);
  if (rec && rec.state === 'ok') return '"' + rec.family + '", var(--font)';
  if (!rec) loadFont(a);
  return null;
}
/** Есть ли в загруженном шрифте кириллица: если нет, браузер подставит запасной шрифт, и ширина текста совпадёт с запасным. */
function fontHasCyrillic(family) {
  try {
    /* пока шрифт не загрузился до конца, ширины не сравниваем (иначе ложно «нет кириллицы») */
    if (![...document.fonts].some(f => f.family.replace(/^["']|["']$/g, '') === family && f.status === 'loaded')) return true;
    const c = document.createElement('canvas').getContext('2d'), s = 'Съешьёжбфюя';
    c.font = '32px "' + family + '", serif'; const w1 = c.measureText(s).width;
    c.font = '32px "' + family + '", monospace'; const w2 = c.measureText(s).width;
    return Math.abs(w1 - w2) > 0.5 ? false : true;
  } catch (e) { return true; }
}

/* ---------- теги оформления ---------- */
const TAG_PAIRED = new Set(['b', 'i', 'u', 's', 'plain', 'font', 'size', 'color', 'alpha', 'k', 'cps']);
const TAG_SINGLE = new Set(['w', 'p', 'nw', 'fast']);
const TAG_RE_SRC = '\\{(\\/?)(' + [...TAG_PAIRED, ...TAG_SINGLE].join('|') + ')(?:=([^{}"\\\\\\[\\]]*))?\\}';
const NOSPLIT = '⁠';
function richTokens(text) {
  const out = [], re = new RegExp(TAG_RE_SRC, 'g'); let last = 0, m;
  const s = String(text == null ? '' : text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ k: 'text', v: s.slice(last, m.index) });
    out.push({ k: 'tag', close: !!m[1], name: m[2], arg: m[3] == null ? '' : m[3], raw: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ k: 'text', v: s.slice(last) });
  return out;
}
const stripTags = text => richTokens(text).filter(x => x.k === 'text').map(x => x.v).join('');
/** Текст реплики → строка для Ren'Py: наши теги остаются, остальные скобки экранируются. */
function rpyText(x) {
  return richTokens(String(x).replace(/⁠/g, '')).map(tk => {
    if (tk.k === 'tag') return tk.raw;
    return tk.v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\[/g, '[[').replace(/\{/g, '{{');
  }).join('');
}
function openTag(name, arg) { return '{' + name + (arg ? '=' + arg : '') + '}'; }
/** Границы выделения не должны попадать внутрь тега: сдвигаем их наружу. */
function snapRange(value, a, b) {
  const re = new RegExp(TAG_RE_SRC, 'g'); let m;
  while ((m = re.exec(value))) {
    const s0 = m.index, e0 = s0 + m[0].length;
    if (a > s0 && a < e0) a = s0;
    if (b > s0 && b < e0) b = e0;
  }
  return [a, b];
}
/** Расширяет выделение так, чтобы парные теги не рвались: если внутри остался только один тег пары, берём и второй. */
function balanceRange(value, a, b) {
  const pairs = [], stack = [], re = new RegExp(TAG_RE_SRC, 'g'); let m;
  while ((m = re.exec(value))) {
    const nm = m[2]; if (!TAG_PAIRED.has(nm)) continue;
    const tg = { name: nm, s: m.index, e: m.index + m[0].length };
    if (!m[1]) stack.push(tg);
    else { for (let q = stack.length - 1; q >= 0; q--) if (stack[q].name === nm) { pairs.push({ o: stack[q], c: tg }); stack.length = q; break; } }
  }
  for (let guard = 0, ch = true; ch && guard < 50; guard++) {
    ch = false;
    for (const p of pairs) {
      const io = p.o.s >= a && p.o.e <= b, ic = p.c.s >= a && p.c.e <= b;
      if (io !== ic) { const na = Math.min(a, p.o.s), nb = Math.max(b, p.c.e); if (na !== a || nb !== b) { a = na; b = nb; ch = true; } }
    }
  }
  return [a, b];
}
/** Оборачивает выделение тегом. Если выделение уже обёрнуто таким тегом, снимает его (переключатель). */
function wrapRange(value, a, b, name, arg, toggle) {
  [a, b] = snapRange(value, a, b);
  if (!toggle) [a, b] = balanceRange(value, a, b);
  const open = openTag(name, arg), close = '{/' + name + '}';
  if (toggle) {
    const before = value.slice(0, a), after = value.slice(b);
    const re = new RegExp('\\{' + name + '(?:=[^{}]*)?\\}$');
    if (re.test(before) && after.startsWith(close)) {
      const mo = re.exec(before)[0];
      return { value: before.slice(0, before.length - mo.length) + value.slice(a, b) + after.slice(close.length), a: a - mo.length, b: b - mo.length };
    }
  }
  return { value: value.slice(0, a) + open + value.slice(a, b) + close + value.slice(b), a: a + open.length, b: b + open.length };
}
function insertAt(value, pos, s) { pos = snapRange(value, pos, pos)[1]; return { value: value.slice(0, pos) + s + value.slice(pos), a: pos + s.length, b: pos + s.length }; }
function stripTagsRange(value, a, b) {
  [a, b] = snapRange(value, a, b);
  const mid = richTokens(value.slice(a, b)).filter(x => x.k === 'text').map(x => x.v).join('');
  return { value: value.slice(0, a) + mid + value.slice(b), a, b: a + mid.length };
}
/** Эффекты: набор тегов вокруг выделения. */
const TEXT_EFFECTS = [
  { id: 'slow', wrap: [['cps', '15']] }, { id: 'fast', wrap: [['cps', '70']] },
  { id: 'whisper', wrap: [['size', '-6'], ['alpha', '.65']] }, { id: 'shout', wrap: [['size', '+12'], ['b', '']] },
  { id: 'spaced', wrap: [['k', '4']] }, { id: 'ghost', wrap: [['alpha', '.4'], ['i', '']] }
];
const TEXT_INSERTS = [{ id: 'w05', code: '{w=0.5}' }, { id: 'w10', code: '{w=1.0}' }, { id: 'w', code: '{w}' }, { id: 'nw', code: '{nw}' }];

/* ---------- разбиение по предложениям ---------- */
const SPLIT_ABBR = new Set(['г', 'гг', 'ул', 'им', 'см', 'рис', 'гл', 'стр', 'проф', 'акад', 'доц', 'ср', 'напр', 'тел', 'руб', 'коп', 'млн', 'млрд', 'тыс', 'мр', 'мрс', 'mr', 'mrs', 'ms', 'dr', 'st', 'vs', 'prof', 'jr', 'sr', 'fig', 'no', 'ок', 'обл', 'оз', 'пос', 'пер', 'просп', 'пл', 'корп', 'кв', 'тов', 'гр', 'св']);
const RE_TERM = /^[.!?…]+/, RE_CLOSE = /^[»”’"')\]]/;
function mayStartSentence(ch) { return !!ch && /[\p{Lu}«“„"'(\[‘0-9]/u.test(ch); }
/** Точка не заканчивает предложение: сокращение, инициалы, нумерация. */
function isAbbrevDot(before) {
  const plain = stripTags(before).replace(/⁠/g, '');
  if (/^\s*\d+$/.test(plain)) return true;                       // «1. Привет»
  if (/(^|[^\p{L}])\p{Lu}$/u.test(plain)) return true;           // инициалы: «А. С. Пушкин»
  const dd = /(^|[^\p{L}])\p{L}\.(\p{L})$/u.exec(plain);         // т.е., т.к., т.н., т.д.
  if (dd) return 'екно'.includes(dd[2].toLowerCase());
  const w = /(\p{L}+)$/u.exec(plain);
  return !!(w && SPLIT_ABBR.has(w[1].toLowerCase()));
}
/** Режет текст на предложения. Теги оформления не рвутся: на границе закрываются и открываются заново. */
function splitSentences(text) {
  const s = String(text || '');
  const cuts = []; // позиции, где предложение заканчивается (до пробелов)
  const tagAt = i => { const re = new RegExp(TAG_RE_SRC, 'y'); re.lastIndex = i; const m = re.exec(s); return m ? m[0].length : 0; };
  let i = 0, depth = 0;                                            // depth: открытые «ёлочки» и “лапки”: внутри цитаты не режем
  const quoteDepth = c => { if (c === '«' || c === '“') depth++; else if ((c === '»' || c === '”') && depth > 0) depth--; };
  while (i < s.length) {
    const ch = s[i];
    if (ch === '{') { const l = tagAt(i); i += l || 1; continue; }
    if (!'.!?…'.includes(ch)) { quoteDepth(ch); i++; continue; }
    const run = RE_TERM.exec(s.slice(i))[0];
    let j = i + run.length, prot = false;
    for (;;) {                                                     // закрывающие кавычки, скобки, теги, метка «не делить»
      if (s[j] === NOSPLIT) { prot = true; j++; continue; }
      if (RE_CLOSE.test(s[j] || '')) { quoteDepth(s[j]); j++; continue; }
      if (s[j] === '{') { const l = tagAt(j); if (l) { j += l; continue; } }
      break;
    }
    const wsM = /^\s+/.exec(s.slice(j));
    if (!wsM || prot || depth > 0) { i = j; continue; }
    let k = j + wsM[0].length;
    for (;;) { if (s[k] === '{') { const l = tagAt(k); if (l) { k += l; continue; } } break; }
    const next = s[k];
    if (!mayStartSentence(next)) { i = j; continue; }
    if (run === '.' && isAbbrevDot(s.slice(0, i))) { i = j; continue; }
    cuts.push({ end: j, next: k });
    i = k;
  }
  const parts = []; let from = 0;
  for (const c of cuts) { parts.push(s.slice(from, c.end)); from = c.next; }
  parts.push(s.slice(from));
  /* закрытые/открытые теги на границах */
  const stack = [], res = [];
  for (const part of parts) {
    const pre = stack.map(x => openTag(x.name, x.arg)).join('');
    for (const tk of richTokens(part)) if (tk.k === 'tag' && TAG_PAIRED.has(tk.name)) {
      if (!tk.close) stack.push({ name: tk.name, arg: tk.arg });
      else { for (let q = stack.length - 1; q >= 0; q--) if (stack[q].name === tk.name) { stack.splice(q, 1); break; } }
    }
    const post = stack.slice().reverse().map(x => '{/' + x.name + '}').join('');
    const out = (pre + part + post).replace(/⁠/g, '').trim();
    if (stripTags(out).trim()) res.push(out);
  }
  return res.length ? res : [String(s).replace(/⁠/g, '').trim()].filter(Boolean);
}
/** Ставит метку «здесь не делить» после каждого конца предложения внутри диапазона (и сразу за ним). */
function protectRange(value, a, b) {
  let end = b;
  const tail = /^[.!?…»”’"')\]]*/.exec(value.slice(end)); if (tail) end += tail[0].length;
  const seg = value.slice(a, end);
  const out = seg.replace(/([.!?…]+[»”’"')\]]*)(?!⁠)/g, '$1' + NOSPLIT);
  return { value: value.slice(0, a) + out + value.slice(end), a, b: a + out.length };
}
function unprotectRange(value, a, b) {
  let end = b; while (value[end] === NOSPLIT) end++;
  const seg = value.slice(a, end).replace(/⁠/g, '');
  return { value: value.slice(0, a) + seg + value.slice(end), a, b: a + seg.length };
}
const countMarks = (value, a, b) => (value.slice(a, b + 2).match(/⁠/g) || []).length;

/* ---------- предпросмотр оформленного текста ---------- */
const GAME_TEXT_PX = 33;               // обычный размер текста в новом проекте Ren'Py (1920×1080)
const PV_BASE = 15;                    // размер в предпросмотре
function richPreview(text, base = {}) {
  const root = h('span', { class: 'rich-pv' });
  const stack = [{ style: Object.assign({}, base) }];
  const cur = () => stack[stack.length - 1].style;
  for (const tk of richTokens(String(text).replace(/⁠/g, ''))) {
    if (tk.k === 'text') { root.append(h('span', { style: Object.assign({}, cur()) }, tk.v)); continue; }
    if (TAG_SINGLE.has(tk.name)) { if (tk.name !== 'fast') root.append(h('span', { class: 'pv-pause', 'data-tip': tk.raw }, tk.name === 'nw' ? '⏭' : '⏸')); continue; }
    if (tk.close) { for (let q = stack.length - 1; q > 0; q--) if (stack[q].name === tk.name) { stack.length = q; break; } continue; }
    const st = Object.assign({}, cur());
    if (tk.name === 'b') st.fontWeight = '700';
    else if (tk.name === 'i') st.fontStyle = 'italic';
    else if (tk.name === 'u') st.textDecoration = 'underline';
    else if (tk.name === 's') st.textDecoration = 'line-through';
    else if (tk.name === 'plain') { st.fontWeight = '400'; st.fontStyle = 'normal'; st.textDecoration = 'none'; }
    else if (tk.name === 'color') { if (/^#[0-9a-f]{3,8}$/i.test(tk.arg)) st.color = tk.arg; }
    else if (tk.name === 'alpha') st.opacity = String(Math.max(0, Math.min(1, parseFloat(tk.arg) || 1)));
    else if (tk.name === 'k') st.letterSpacing = (parseFloat(tk.arg) || 0) / 2 + 'px';
    else if (tk.name === 'size') {
      const rel = /^[+-]/.test(tk.arg), v = parseFloat(tk.arg);
      if (isFinite(v)) st.fontSize = Math.max(7, (rel ? PV_BASE + v * PV_BASE / GAME_TEXT_PX * 1.6 : v * PV_BASE / GAME_TEXT_PX)) + 'px';
    } else if (tk.name === 'font') { const f = fontCss(tk.arg); if (f) st.fontFamily = f; else st.textDecoration = 'underline wavy'; }
    stack.push({ name: tk.name, style: st });
  }
  return root;
}

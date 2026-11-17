'use strict';
/* ====== Редактор кода: свой движок на чистом JS (окно «Редактор кода», ide.js) ======
   Устройство. Прокручивается внешний блок .ce-scroll. Внутри слева липкая колонка номеров строк, справа «код»: слой подсветки (по div на строку)
   и поверх него настоящий <textarea> с прозрачным текстом (ввод, выделение, отмена, буфер обмена, IME работают как у обычного поля).
   Размер textarea подгоняется под весь текст, поэтому слой подсветки и поле всегда совпадают построчно.
   Правки отправляются в поле через execCommand('insertText'), чтобы встроенная отмена (Ctrl+Z) работала и после автоотступа и замены.
   Перерисовываются только изменённые строки (общее начало и конец текста сравниваются, середина заменяется).
   Язык подсветки задаётся объектом CE_LANGS[имя] (codelang.js): tokenize(строка, состояние) → { tokens: [[от, до, класс]], state }. */

Object.assign(D, {
  'ce.line': ['Строка {0}, столбец {1}', 'Line {0}, column {1}'], 'ce.sel': ['выделено {0}', '{0} selected'],
  'ce.goto': ['Перейти к строке', 'Go to line'], 'ce.goto.ph': ['Номер строки', 'Line number'],
  'ce.find': ['Найти', 'Find'], 'ce.replace': ['Заменить', 'Replace'], 'ce.rep.ph': ['Чем заменить', 'Replace with'],
  'ce.case': ['Учитывать регистр', 'Match case'], 'ce.word': ['Слово целиком', 'Whole word'], 'ce.regex': ['Регулярное выражение', 'Regular expression'],
  'ce.prev': ['Предыдущее (Shift+Enter)', 'Previous (Shift+Enter)'], 'ce.next': ['Следующее (Enter)', 'Next (Enter)'], 'ce.fclose': ['Закрыть (Esc)', 'Close (Esc)'],
  'ce.rep1': ['Заменить это', 'Replace'], 'ce.repall': ['Заменить все', 'Replace all'], 'ce.toggle.rep': ['Показать или скрыть замену (Ctrl+H)', 'Show or hide replace (Ctrl+H)'],
  'ce.count': ['{0} из {1}', '{0} of {1}'], 'ce.none': ['Нет результатов', 'No results'], 'ce.badre': ['Неверное выражение', 'Invalid expression'],
  'ce.replaced': ['Заменено: {0}', 'Replaced: {0}'],
});

const CE_LH = 20;                 // высота строки по умолчанию, пикселей (при другом размере шрифта E.lh; то же значение в style.css: .ce)
const CE_FS = 13, CE_FS_MIN = 10, CE_FS_MAX = 28;
const ceLh = fs => Math.round(fs * 1.55);
const CE_PADY = 8;                // отступ сверху и снизу
const CE_PADX = 12;
let CE_ID = 0;
const CE_LANGS = {};              // заполняет codelang.js
const ceLang = name => CE_LANGS[name] || CE_LANGS.text || null;
const CE_COMMENT = { renpy: '# ', python: '# ', yaml: '# ', ini: '; ', javascript: '// ', css: '/* ', json: null, markdown: null, html: null, xml: null, text: null };

function ceCreate(opts) {
  opts = opts || {};
  const E = {
    lang: opts.lang || 'text', tab: opts.tabSize || 4, ro: !!opts.readOnly, onChange: opts.onChange || null, onCursor: opts.onCursor || null, onSave: opts.onSave || null, onFont: opts.onFont || null, hint: opts.hint || null, onDefinition: opts.onDefinition || null,
    lines: [], els: [], hlState: [], wrap: false, cw: 8, fs: Math.max(CE_FS_MIN, Math.min(CE_FS_MAX, +opts.fontSize || CE_FS)), lh: CE_LH, br: null,
    find: { open: false, rep: false, q: '', r: '', cs: false, ww: false, re: false, matches: [], idx: -1, err: false },
  };
  E.lh = ceLh(E.fs);
  const gutter = h('div', { class: 'ce-gutter', 'aria-hidden': 'true' });
  const hl = h('div', { class: 'ce-hl', 'aria-hidden': 'true' });
  const cur = h('div', { class: 'ce-cur', 'aria-hidden': 'true' });
  const ta = h('textarea', { class: 'ce-ta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off', 'aria-label': opts.label || 'code' });
  const ov = h('div', { class: 'ce-ov', 'aria-hidden': 'true' });
  const code = h('div', { class: 'ce-code' }, cur, ov, hl, ta);
  const content = h('div', { class: 'ce-content' }, gutter, code);
  const scroll = h('div', { class: 'ce-scroll' }, content);
  const root = h('div', { class: 'ce' }, scroll);
  const ruler = h('span', { class: 'ce-ruler' }, '0'.repeat(100));
  root.append(ruler);
  const applyFont = () => { root.style.setProperty('--ce-fs', E.fs + 'px'); root.style.setProperty('--ce-lh', E.lh + 'px'); };
  applyFont();
  if (E.ro) ta.readOnly = true;
  E.el = root; E.ta = ta; E.scroll = scroll;

  /* ---------- размеры ---------- */
  const measure = () => { const w = ruler.getBoundingClientRect().width; if (w > 0) E.cw = w / 100; };
  let maxLen = 0;
  const fit = () => {
    const n = E.lines.length;
    const h2 = n * E.lh + CE_PADY * 2;
    content.style.height = Math.max(h2, scroll.clientHeight) + 'px';
    const w = Math.max(scroll.clientWidth - gutter.offsetWidth, maxLen * E.cw + CE_PADX * 2 + 24);
    code.style.width = w + 'px'; ta.style.width = w + 'px'; ta.style.height = Math.max(h2, scroll.clientHeight) + 'px';
  };

  /* ---------- подсветка и строки ---------- */
  const tok = () => { const L = ceLang(E.lang); return L && L.tokenize ? L : null; };
  const lineHtml = (el, text, state) => {
    const L = tok(); el.replaceChildren();
    if (!text) { el.append(document.createTextNode('\n')); return state; }      // пустая строка всё равно имеет высоту
    if (!L) { el.append(document.createTextNode(text)); return state; }
    const r = L.tokenize(text, state); let pos = 0;
    for (const [a, b, c] of r.tokens) {
      if (a > pos) el.append(document.createTextNode(text.slice(pos, a)));
      if (c) el.append(h('span', { class: 't-' + c }, text.slice(a, b))); else el.append(document.createTextNode(text.slice(a, b)));
      pos = b;
    }
    if (pos < text.length) el.append(document.createTextNode(text.slice(pos)));
    return r.state;
  };
  /** Заменяет только изменившиеся строки. force — перекрасить всё (сменился язык). */
  const patch = (lines, force) => {
    const prev = E.lines; let a = 0;
    if (force) { hl.replaceChildren(); E.els = []; E.lines = []; E.hlState = []; return patch(lines, false); }
    while (a < prev.length && a < lines.length && prev[a] === lines[a]) a++;
    let b = 0;
    while (b < prev.length - a && b < lines.length - a && prev[prev.length - 1 - b] === lines[lines.length - 1 - b]) b++;
    const oldEnd = prev.length - b, newEnd = lines.length - b;
    for (let i = a; i < oldEnd; i++) E.els[i].remove();
    const fresh = [];
    for (let i = a; i < newEnd; i++) fresh.push(h('div', { class: 'ce-l' }));
    const anchor = oldEnd < prev.length ? E.els[oldEnd] : null;
    E.els.splice(a, oldEnd - a, ...fresh);
    const frag = document.createDocumentFragment(); fresh.forEach(x => frag.append(x));
    hl.insertBefore(frag, anchor);
    E.lines = lines.slice();
    E.hlState = E.hlState.slice(0, a).concat(new Array(newEnd - a), E.hlState.slice(oldEnd));        // состояния нетронутого хвоста едут вместе со строками
    /* состояние подсветки тянется по строкам (многострочные строки и комментарии): красим с первой изменённой и дальше, пока состояние не совпадёт со старым */
    let st = a > 0 ? E.hlState[a - 1] : undefined, i = a;
    for (; i < lines.length; i++) {
      const was = E.hlState[i];
      st = lineHtml(E.els[i], lines[i], st);
      const same = i >= newEnd && ceStEq(was, st);
      E.hlState[i] = st;
      if (same) { i++; break; }
    }
    /* номера строк: достаточно подогнать их число */
    const have = gutter.childElementCount;
    if (have < lines.length) { const f = document.createDocumentFragment(); for (let k = have; k < lines.length; k++) f.append(h('div', { class: 'ce-n' }, String(k + 1))); gutter.append(f); }
    else while (gutter.childElementCount > lines.length) gutter.lastElementChild.remove();
    const w = String(lines.length).length; gutter.style.minWidth = Math.max(3, w + 1) + 'ch';
    maxLen = 0; for (const s of lines) if (s.length > maxLen) maxLen = s.length;
    calcLs(); skipMap.clear();
    fit(); paintOv();
  };
  const ceStEq = (x, y) => x === y || (x && y && JSON.stringify(x) === JSON.stringify(y));
  const sync = () => { patch(ta.value.split('\n')); };

  /* ---------- курсор ---------- */
  let ls = [0];                                                   // смещения начал строк
  const calcLs = () => { ls = new Array(E.lines.length); let p = 0; for (let i = 0; i < E.lines.length; i++) { ls[i] = p; p += E.lines[i].length + 1; } };
  const lineOf = pos => { let lo = 0, hi = ls.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (ls[mid] <= pos) lo = mid; else hi = mid - 1; } return lo; };
  const lineStart = pos => ta.value.lastIndexOf('\n', pos - 1) + 1;
  let lastCur = '';
  const cursor = () => {
    const s = ta.selectionStart, e = ta.selectionEnd, ln = lineOf(s), col = s - lineStart(s);
    cur.style.top = (CE_PADY + ln * E.lh) + 'px'; cur.style.display = s === e && !E.ro ? 'block' : 'none'; cur.classList.toggle('on', document.activeElement === ta);
    const key = ln + ':' + col + ':' + (e - s);
    if (key !== lastCur) { lastCur = key; matchBracket(); paintOv(); acSoon(); if (E.onCursor) E.onCursor({ line: ln + 1, col: col + 1, len: e - s, pos: s, lines: E.lines.length }); }
  };
  const keepVisible = () => {
    const s = ta.selectionStart, ln = lineOf(s), top = CE_PADY + ln * E.lh, bot = top + E.lh;
    if (top < scroll.scrollTop + 4) scroll.scrollTop = Math.max(0, top - 40);
    else if (bot > scroll.scrollTop + scroll.clientHeight - 4) scroll.scrollTop = bot - scroll.clientHeight + 40;
    const col = s - lineStart(s), x = col * E.cw + CE_PADX + gutter.offsetWidth;
    if (x < scroll.scrollLeft + gutter.offsetWidth + 20) scroll.scrollLeft = Math.max(0, x - gutter.offsetWidth - 60);
    else if (x > scroll.scrollLeft + scroll.clientWidth - 30) scroll.scrollLeft = x - scroll.clientWidth + 80;
  };

  /* ---------- правки через execCommand (сохраняют отмену) ---------- */
  let inRep = 0;                                                  // идёт правка из самого редактора (не набор пользователя): подсказки на неё не открываются
  const replace = (from, to, str, selFrom, selTo) => {
    ta.focus(); ta.setSelectionRange(from, to); inRep++;
    try { if (!document.execCommand('insertText', false, str)) { ta.setRangeText(str, from, to, 'end'); ta.dispatchEvent(new Event('input', { bubbles: true })); } } finally { inRep--; }
    if (selFrom != null) ta.setSelectionRange(selFrom, selTo == null ? selFrom : selTo);
  };
  E.replace = replace;
  const indentOf = s => /^[ \t]*/.exec(s)[0];
  const spaces = n => ' '.repeat(n);

  const onTab = ev => {
    const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, unit = spaces(E.tab);
    if (s === e && !ev.shiftKey) { replace(s, e, unit.slice(0, E.tab - ((s - lineStart(s)) % E.tab))); return; }
    const a = lineStart(s), bEnd = e > s && v[e - 1] === '\n' ? e - 1 : e, endLine = v.indexOf('\n', bEnd), b = endLine === -1 ? v.length : endLine;
    const block = v.slice(a, b).split('\n');
    let out, ds = 0, de = 0;
    if (ev.shiftKey) {
      out = block.map((l, i) => { const m = /^( {1,4}|\t)/.exec(l); const k = m ? m[0].length : 0; if (i === 0) ds = -Math.min(k, s - a); de -= k; return l.slice(k); });
    } else { out = block.map((l, i) => { if (i === 0) ds = unit.length; de += unit.length; return unit + l; }); }
    replace(a, b, out.join('\n'), Math.max(a, s + ds), e + de);
  };
  const onEnter = ev => {
    if (ev.shiftKey || ev.ctrlKey || ev.metaKey || ev.altKey) return false;
    const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value, a = lineStart(s), before = v.slice(a, s), L = ceLang(E.lang);
    let ind = indentOf(before);
    const trimmed = before.replace(/\s+$/, '');
    const opens = L && L.indentAfter ? L.indentAfter(trimmed, before) : false;
    const after = v.slice(e, v.indexOf('\n', e) === -1 ? v.length : v.indexOf('\n', e));
    const pairClose = /[\]\)\}]$/.test(trimmed) ? false : /^[\]\)\}]/.test(after) && /[\[\(\{]$/.test(trimmed);
    if (pairClose) { const inner = ind + spaces(E.tab); replace(s, e, '\n' + inner + '\n' + ind, s + 1 + inner.length); return true; }
    if (opens) ind += spaces(E.tab);
    if (!ind && !opens) return false;
    replace(s, e, '\n' + ind);
    return true;
  };
  const toggleComment = () => {
    const mk = CE_COMMENT[E.lang]; if (!mk) return;
    const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, a = lineStart(s), bEnd = e > s && v[e - 1] === '\n' ? e - 1 : e, endLine = v.indexOf('\n', bEnd), b = endLine === -1 ? v.length : endLine;
    const block = v.slice(a, b).split('\n'), mark = mk.trimEnd(), non = block.filter(l => l.trim());
    const all = non.length && non.every(l => l.trimStart().startsWith(mark));
    const out = block.map(l => {
      if (!l.trim()) return l;
      const ind = indentOf(l), rest = l.slice(ind.length);
      return all ? ind + (rest.startsWith(mk) ? rest.slice(mk.length) : rest.slice(mark.length)) : ind + mk + rest;
    });
    const joined = out.join('\n'); replace(a, b, joined, a, a + joined.length);
  };
  const dupLine = down => {
    const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, a = lineStart(s), bEnd = e > s && v[e - 1] === '\n' ? e - 1 : e, endLine = v.indexOf('\n', bEnd), b = endLine === -1 ? v.length : endLine;
    const block = v.slice(a, b); replace(b, b, '\n' + block, down ? b + 1 + (s - a) : s, down ? b + 1 + (e - a) : e);
  };
  const moveLines = dir => {
    const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, a = lineStart(s), bEnd = e > s && v[e - 1] === '\n' ? e - 1 : e, endLine = v.indexOf('\n', bEnd), b = endLine === -1 ? v.length : endLine;
    if (dir < 0) {
      if (a === 0) return;
      const pa = lineStart(a - 1), prev = v.slice(pa, a - 1), block = v.slice(a, b);
      replace(pa, b, block + '\n' + prev, s - (a - pa), e - (a - pa));
    } else {
      if (b >= v.length) return;
      const nb = v.indexOf('\n', b + 1), nEnd = nb === -1 ? v.length : nb, next = v.slice(b + 1, nEnd), block = v.slice(a, b);
      replace(a, nEnd, next + '\n' + block, s + next.length + 1, e + next.length + 1);
    }
  };
  const deleteLine = () => {
    const v = ta.value, s = ta.selectionStart, a = lineStart(s), nl = v.indexOf('\n', s), b = nl === -1 ? v.length : nl + 1;
    if (b === v.length && a > 0) replace(a - 1, b, '', a - 1); else replace(a, b, '', a);
  };

  const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  const onKeyDown = ev => {
    if (E.ro) return;
    const mod = ev.ctrlKey || ev.metaKey, k = ev.key;
    if (mod && !ev.shiftKey && !ev.altKey && k.toLowerCase() === 's') { ev.preventDefault(); if (E.onSave) E.onSave(); return; }
    if (acKey(ev)) return;
    if (E.extraKey && E.extraKey(ev)) return;
    if (k === 'Escape' && F.open) { ev.preventDefault(); ev.stopPropagation(); E.closeFind(false); return; }
    if (k === 'Tab' && !mod && !ev.altKey) { ev.preventDefault(); onTab(ev); return; }
    if (k === 'Enter') { if (onEnter(ev)) ev.preventDefault(); return; }
    if (k === 'F12' && !mod && !ev.shiftKey && !ev.altKey && E.onDefinition) { ev.preventDefault(); goDefinition(); return; }
    if (mod && !ev.altKey && !ev.shiftKey && k === ' ') { ev.preventDefault(); acRefresh(true, true); return; }
    if (mod && k === '/') { ev.preventDefault(); toggleComment(); return; }
    if (ev.altKey && !mod && (k === 'ArrowUp' || k === 'ArrowDown')) { ev.preventDefault(); if (ev.shiftKey) dupLine(k === 'ArrowDown'); else moveLines(k === 'ArrowUp' ? -1 : 1); return; }
    if (mod && ev.shiftKey && k.toLowerCase() === 'k') { ev.preventDefault(); deleteLine(); return; }
    if (mod && k.toLowerCase() === 'g') { ev.preventDefault(); E.gotoPrompt(); return; }
    if (mod && !ev.altKey && !ev.shiftKey && k.toLowerCase() === 'f') { ev.preventDefault(); E.openFind(false); return; }
    if (mod && !ev.altKey && !ev.shiftKey && k.toLowerCase() === 'h') { ev.preventDefault(); E.openFind(true); return; }
    if (k === 'F3') { ev.preventDefault(); if (!F.q) E.openFind(false); else step(ev.shiftKey ? -1 : 1); return; }
    if (mod && !ev.altKey && (k === '=' || k === '+')) { ev.preventDefault(); E.setFont(E.fs + 1); return; }
    if (mod && !ev.altKey && (k === '-' || k === '_')) { ev.preventDefault(); E.setFont(E.fs - 1); return; }
    if (mod && !ev.altKey && k === '0') { ev.preventDefault(); E.setFont(CE_FS); return; }
    /* парные скобки и кавычки */
    if (!mod && !ev.altKey && PAIRS[k] && E.pairs !== false) {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value, close = PAIRS[k];
      if (s !== e) { ev.preventDefault(); replace(s, e, k + v.slice(s, e) + close, s + 1, e + 1); return; }
      const next = v[s] || '', prev = v[s - 1] || '';
      if ((k === '"' || k === "'")) {
        if (next === k) { ev.preventDefault(); ta.setSelectionRange(s + 1, s + 1); cursor(); return; }
        if (/[\w\\]/.test(prev) || (E.lang === 'renpy' && k === "'" && /\w/.test(prev))) return;
      }
      if (/[\w]/.test(next) && k !== '"' && k !== "'") return;
      ev.preventDefault(); replace(s, e, k + close, s + 1); if (k === '[' || k === '{') acRefresh(false, true); return;
    }
    if (!mod && !ev.altKey && (k === ')' || k === ']' || k === '}' || k === '"' || k === "'") && ta.selectionStart === ta.selectionEnd && ta.value[ta.selectionStart] === k) { ev.preventDefault(); ta.setSelectionRange(ta.selectionStart + 1, ta.selectionStart + 1); cursor(); return; }
    if (k === 'Backspace' && !mod && !ev.altKey && ta.selectionStart === ta.selectionEnd) {
      const s = ta.selectionStart, v = ta.value;
      if (PAIRS[v[s - 1]] && PAIRS[v[s - 1]] === v[s]) { ev.preventDefault(); replace(s - 1, s + 1, '', s - 1); return; }
      const a = lineStart(s), before = v.slice(a, s);
      if (before && /^ +$/.test(before) && before.length % E.tab === 0) { ev.preventDefault(); replace(s - E.tab, s, '', s - E.tab); return; }       // «умный» возврат на ширину отступа
    }
  };

  /* ---------- события ---------- */
  let sigT = 0;
  const onInput = ev => { ver++; sync(); cursor(); keepVisible(); acOnInput(ev); if (F.open) { clearTimeout(fT); fT = setTimeout(() => compute(false), 120); } if (E.onChange) E.onChange(ta.value); };
  let fT = 0;
  ta.addEventListener('input', onInput);
  ta.addEventListener('keydown', onKeyDown);
  for (const ev of ['keyup', 'click', 'focus', 'blur']) ta.addEventListener(ev, cursor);
  const onSel = () => { if (document.activeElement === ta) { clearTimeout(sigT); sigT = setTimeout(cursor, 10); } };
  document.addEventListener('selectionchange', onSel);
  const ro = new ResizeObserver(() => { if (root.isConnected) { measure(); fit(); } }); ro.observe(scroll);
  /* ширина знака может уточниться позже (шрифт догрузился): пересчитываем и перерисовываем всё, что стоит на ней */
  const remeasure = () => { if (!root.isConnected) return; const o = E.cw; measure(); if (E.cw !== o) { fit(); cursor(); paintOv(); } };
  const remT = [60, 400, 1500].map(ms => setTimeout(remeasure, ms));
  const onFonts = () => remeasure();
  try { if (document.fonts) { document.fonts.addEventListener('loadingdone', onFonts); if (document.fonts.ready) document.fonts.ready.then(onFonts); } } catch (e) { /* нет API шрифтов */ }
  ta.addEventListener('paste', () => setTimeout(() => keepVisible(), 0));
  /* щелчок по пустому месту под текстом ставит курсор в конец */
  content.addEventListener('mousedown', ev => { if (ev.target === content || ev.target === gutter) { ev.preventDefault(); ta.focus(); } });

  /* ---------- слой поверх подсветки: найденное и парные скобки ---------- */
  const skipMap = new Map();
  const vcol = (li, col) => { const tx = E.lines[li] || ''; const ti = tx.indexOf('\t'); if (ti < 0 || ti >= col) return col; let v = 0; for (let k = 0; k < col; k++) v += tx[k] === '\t' ? E.tab - (v % E.tab) : 1; return v; };
  const box = (li, c0, c1, cls) => { const el = h('div', { class: cls }); el.style.top = (CE_PADY + li * E.lh) + 'px'; el.style.left = (CE_PADX + vcol(li, c0) * E.cw) + 'px'; el.style.width = Math.max(2, (vcol(li, c1) - vcol(li, c0)) * E.cw) + 'px'; el.style.height = E.lh + 'px'; return el; };
  const segs = (s0, e0, cls, frag) => { const l0 = lineOf(s0), l1 = lineOf(e0); for (let li = l0; li <= l1 && li < E.lines.length; li++) { const a = li === l0 ? s0 - ls[li] : 0, b = li === l1 ? e0 - ls[li] : E.lines[li].length; if (b > a) frag.append(box(li, a, b, cls)); } };
  let ovRaf = 0;
  const paintOv = () => { if (ovRaf) return; ovRaf = requestAnimationFrame(() => { ovRaf = 0; drawOv(); }); };
  const drawOv = () => {
    ov.replaceChildren(); if (!E.lines.length) return;
    const F = E.find, top = scroll.scrollTop, hgt = scroll.clientHeight;
    const l0 = Math.max(0, Math.floor((top - CE_PADY) / E.lh) - 1), l1 = Math.min(E.lines.length - 1, Math.ceil((top + hgt - CE_PADY) / E.lh) + 1);
    const frag = document.createDocumentFragment();
    if (F.open && F.matches.length) {
      const from = ls[l0], to = ls[l1] + E.lines[l1].length;
      let lo = 0, hi = F.matches.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (F.matches[mid].e <= from) lo = mid + 1; else hi = mid; }
      for (let k = lo; k < F.matches.length && F.matches[k].s <= to; k++) segs(F.matches[k].s, F.matches[k].e, 'ce-find' + (k === F.idx ? ' on' : ''), frag);
    }
    if (E.br) for (const q of E.br) frag.append(box(q.l, q.c, q.c + 1, 'ce-br'));
    ov.append(frag);
  };
  scroll.addEventListener('scroll', paintOv, { passive: true });

  /* парные скобки: скобки внутри строк и комментариев не считаются (это решает подсветка языка) */
  const BR_OPEN = { '(': ')', '[': ']', '{': '}' }, BR_CLOSE = { ')': '(', ']': '[', '}': '{' };
  const skipAt = li => {
    let m = skipMap.get(li); if (m) return m;
    const L = tok(), text = E.lines[li] || ''; m = new Uint8Array(text.length);
    if (L) { try { const r = L.tokenize(text, li > 0 ? E.hlState[li - 1] : undefined); for (const [a, b, c] of r.tokens) if (c === 'str' || c === 'com' || c === 'esc' || c === 'tag') m.fill(1, a, b); } catch (e) { /* без пропуска */ } }
    skipMap.set(li, m); return m;
  };
  const matchBracket = () => {
    E.br = null;
    const s0 = ta.selectionStart; if (s0 !== ta.selectionEnd || !E.lines.length) return;
    const v = ta.value;
    for (const pos of [s0 - 1, s0]) {
      const ch = v[pos]; if (!ch || (!BR_OPEN[ch] && !BR_CLOSE[ch])) continue;
      const li = lineOf(pos), col = pos - ls[li]; if (skipAt(li)[col]) continue;
      const dir = BR_OPEN[ch] ? 1 : -1, other = BR_OPEN[ch] || BR_CLOSE[ch];
      let li2 = li, depth = 1;
      for (let p = pos + dir, n = 0; p >= 0 && p < v.length && n < 80000; p += dir, n++) {
        const c = v[p];
        if (c === '\n') { li2 += dir; continue; }
        if (c !== ch && c !== other) continue;
        const col2 = p - ls[li2]; if (skipAt(li2)[col2]) continue;
        if (c === ch) depth++; else if (--depth === 0) { E.br = [{ l: li, c: col }, { l: li2, c: col2 }]; return; }
      }
    }
  };

  /* ---------- поиск и замена (Ctrl+F, Ctrl+H) ---------- */
  const F = E.find;
  const fbInp = h('input', { class: 'ce-fi', type: 'text', placeholder: t('ce.find'), 'aria-label': t('ce.find'), spellcheck: 'false', autocomplete: 'off' });
  const fbRep = h('input', { class: 'ce-fri', type: 'text', placeholder: t('ce.rep.ph'), 'aria-label': t('ce.rep.ph'), spellcheck: 'false', autocomplete: 'off' });
  const fbCount = h('span', { class: 'ce-fc' });
  const tgl = (txt, tip, key) => { const b = h('button', { class: 'ce-ft', type: 'button', 'data-tip': tip, 'aria-label': tip, 'aria-pressed': 'false', onclick: () => { F[key] = !F[key]; b.classList.toggle('on', F[key]); b.setAttribute('aria-pressed', String(F[key])); compute(true); fbInp.focus(); } }, txt); return b; };
  const fbBtn = (ic, tip, fn, cls) => h('button', { class: 'ce-fb-btn' + (cls ? ' ' + cls : ''), type: 'button', 'data-tip': tip, 'aria-label': tip, onclick: fn }, typeof ic === 'string' && ic.length < 3 && !/^[a-z]+$/.test(ic) ? ic : icon(ic, 14, 2));
  const fbToggleRep = h('button', { class: 'ce-fb-btn ce-ftr', type: 'button', 'data-tip': t('ce.toggle.rep'), 'aria-label': t('ce.toggle.rep'), onclick: () => { F.rep = !F.rep; paintFind(); (F.rep ? fbRep : fbInp).focus(); } }, icon('chev', 13, 2.4));
  const bCase = tgl('Aa', t('ce.case'), 'cs'), bWord = tgl('ab', t('ce.word'), 'ww'), bRe = tgl('.*', t('ce.regex'), 're');
  const bPrev = fbBtn('up', t('ce.prev'), () => step(-1)), bNext = fbBtn('down', t('ce.next'), () => step(1)), bClose = fbBtn('x', t('ce.fclose'), () => E.closeFind(true));
  const bRep1 = h('button', { class: 'ce-fb-btn ce-r1', type: 'button', 'data-tip': t('ce.rep1'), 'aria-label': t('ce.rep1'), onclick: () => replaceOne() }, icon('check', 14, 2));
  const bRepAll = h('button', { class: 'ce-fb-btn ce-rall', type: 'button', 'data-tip': t('ce.repall'), 'aria-label': t('ce.repall'), onclick: () => replaceAll() }, icon('rows', 14, 2));
  const fbRow2 = h('div', { class: 'ce-fr ce-fr2' }, fbRep, bRep1, bRepAll);
  const fb = h('div', { class: 'ce-fb', hidden: true }, h('div', { class: 'ce-fr' }, fbToggleRep, fbInp, fbCount, bCase, bWord, bRe, bPrev, bNext, bClose), fbRow2);
  root.append(fb);
  const paintFind = () => {
    fb.hidden = !F.open; fb.classList.toggle('rep', F.rep); fbRow2.hidden = !F.rep; fbToggleRep.classList.toggle('open', F.rep);
    fbCount.textContent = !F.q ? '' : F.err ? t('ce.badre') : !F.matches.length ? t('ce.none') : t('ce.count', F.idx + 1, F.matches.length);
    fbCount.classList.toggle('bad', !!F.q && (F.err || !F.matches.length)); fbInp.classList.toggle('bad', !!F.q && (F.err || !F.matches.length));
    bPrev.disabled = bNext.disabled = !F.matches.length; bRep1.disabled = bRepAll.disabled = !F.matches.length || E.ro;
    paintOv();
  };
  const mkRe = () => {
    if (!F.q) return null;
    const src0 = F.re ? F.q : F.q.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    const wrap = x => (F.ww ? '(?<![\\p{L}\\p{N}_])(?:' + x + ')(?![\\p{L}\\p{N}_])' : x);
    for (const u of ['u', '']) { try { return new RegExp(u ? wrap(src0) : src0, 'gm' + u + (F.cs ? '' : 'i')); } catch (e) { /* пробуем без u */ } }
    return false;
  };
  /** Пересчитать найденное; near — выбрать совпадение ближе всего к курсору (не прыгать при каждой букве запроса). */
  function compute(near) {
    F.matches = []; F.err = false; const re = mkRe();
    if (re === false) F.err = true;
    if (re) {
      const v = ta.value; let m, n = 0; re.lastIndex = 0;
      while ((m = re.exec(v)) && n < 5000) { if (!m[0].length) { re.lastIndex++; continue; } F.matches.push({ s: m.index, e: m.index + m[0].length }); n++; }
    }
    if (!F.matches.length) F.idx = -1;
    else if (near !== false) { const pos = Math.min(ta.selectionStart, ta.selectionEnd); let k = F.matches.findIndex(x => x.e > pos && x.s >= pos); if (k < 0) k = F.matches.findIndex(x => x.e > pos); F.idx = k < 0 ? 0 : k; }
    else F.idx = Math.min(Math.max(0, F.idx), F.matches.length - 1);
    paintFind();
  }
  const reveal = (s0, e0) => { ta.setSelectionRange(s0, e0); const ln = lineOf(s0), top = CE_PADY + ln * E.lh; if (top < scroll.scrollTop + 4 || top + E.lh > scroll.scrollTop + scroll.clientHeight - 4) scroll.scrollTop = Math.max(0, top - scroll.clientHeight / 3); keepVisible(); cursor(); };
  function step(dir) {
    if (!F.matches.length) { compute(true); if (!F.matches.length) return; }
    F.idx = (F.idx + dir + F.matches.length) % F.matches.length;
    const m = F.matches[F.idx]; reveal(m.s, m.e); paintFind();
  }
  const subst = (m0, re) => (F.re ? m0.replace(new RegExp(re.source, re.flags.replace('g', '')), F.r) : F.r);
  function replaceOne() {
    if (E.ro || !F.matches.length) return;
    const re = mkRe(); if (!re) return;
    const m = F.matches[F.idx < 0 ? 0 : F.idx], text = subst(ta.value.slice(m.s, m.e), re);
    replace(m.s, m.e, text, m.s + text.length);
    compute(true); if (F.matches.length) { const nx = F.matches[F.idx]; reveal(nx.s, nx.e); paintFind(); }
    fbRep.focus();
  }
  function replaceAll() {
    if (E.ro || !F.matches.length) return;
    const re = mkRe(); if (!re) return;
    const v = ta.value, n = F.matches.length, top = scroll.scrollTop;
    const out = F.re ? v.replace(re, F.r) : v.replace(re, () => F.r);
    if (out !== v) replace(0, v.length, out, 0);
    scroll.scrollTop = top; compute(true); toast(t('ce.replaced', n), 2200);
    fbRep.focus();
  }
  E.openFind = (withReplace) => {
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    F.open = true; if (withReplace) F.rep = true;
    if (sel && sel.length < 200 && !/\n/.test(sel)) { F.q = sel; fbInp.value = sel; }
    paintFind(); compute(true); fbInp.focus(); fbInp.select();
  };
  E.closeFind = back => { F.open = false; paintFind(); if (back) { if (F.matches[F.idx]) { const m = F.matches[F.idx]; ta.setSelectionRange(m.s, m.e); } ta.focus({ preventScroll: true }); cursor(); } };
  fbInp.addEventListener('input', () => { F.q = fbInp.value; compute(true); if (F.matches.length) { const m = F.matches[F.idx]; reveal(m.s, m.e); paintFind(); } });
  fbRep.addEventListener('input', () => { F.r = fbRep.value; });
  const fbKeys = ev => {
    const mod = ev.ctrlKey || ev.metaKey, k = ev.key;
    if (k === 'Escape') { ev.preventDefault(); ev.stopPropagation(); E.closeFind(true); }
    else if (k === 'Enter' && ev.target === fbInp) { ev.preventDefault(); step(ev.shiftKey ? -1 : 1); }
    else if (k === 'Enter' && ev.target === fbRep) { ev.preventDefault(); if (ev.ctrlKey || ev.metaKey) replaceAll(); else replaceOne(); }
    else if (k === 'F3') { ev.preventDefault(); step(ev.shiftKey ? -1 : 1); }
    else if (mod && k.toLowerCase() === 'h') { ev.preventDefault(); ev.stopPropagation(); F.rep = true; paintFind(); fbRep.focus(); fbRep.select(); }
    else if (mod && k.toLowerCase() === 'f') { ev.preventDefault(); ev.stopPropagation(); fbInp.focus(); fbInp.select(); }
    else if (mod && ev.altKey && k.toLowerCase() === 'c') { ev.preventDefault(); bCase.click(); }
    else if (mod && ev.altKey && k.toLowerCase() === 'w') { ev.preventDefault(); bWord.click(); }
    else if (mod && ev.altKey && k.toLowerCase() === 'r') { ev.preventDefault(); bRe.click(); }
  };
  fb.addEventListener('keydown', fbKeys);

  /* ---------- размер шрифта (Ctrl+колесо, Ctrl+=, Ctrl+-, Ctrl+0) ---------- */
  E.setFont = px => {
    const v = Math.max(CE_FS_MIN, Math.min(CE_FS_MAX, Math.round(+px || CE_FS)));
    if (v === E.fs) return; E.fs = v; E.lh = ceLh(v); applyFont();
    measure(); calcLs(); fit(); cursor(); paintOv();
    if (E.onFont) E.onFont(v);
  };
  scroll.addEventListener('wheel', ev => { if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); E.setFont(E.fs + (ev.deltaY < 0 ? 1 : -1)); } }, { passive: false });


  /* ---------- подсказки: список имён рядом с курсором (Ctrl+Пробел или при наборе) ----------
     Откуда брать имена, решает функция opts.hint(ctx) → [{ label, insert?, kind?, detail?, pri? }]; движок только фильтрует, сортирует и показывает.
     ctx: { lang, line, col, text, before, after, prefix, start, explicit, cls (класс подсветки знака перед курсором), inStr (курсор внутри строки в кавычках), words() (слова файла), lines }. */
  const AC = { open: false, items: [], idx: 0, start: 0 };
  const acId = 'ceac' + (++CE_ID);
  const acList = h('div', { class: 'ce-ac-list', role: 'listbox', id: acId });
  const acBox = h('div', { class: 'ce-ac', hidden: true }, acList);
  root.append(acBox);
  ta.setAttribute('aria-autocomplete', 'list'); ta.setAttribute('aria-expanded', 'false'); ta.setAttribute('aria-controls', acId);
  const WORD_CH = /[\p{L}\p{N}_]/u;
  let ver = 0, words = null, wordsVer = -1, acRaf = 0;
  const docWords = () => {
    if (words && wordsVer === ver) return words;
    const m = new Map(), re = /[\p{L}_][\p{L}\p{N}_]{2,}/gu, v = ta.value; let r, n = 0;
    while ((r = re.exec(v)) && n < 60000) { m.set(r[0], (m.get(r[0]) || 0) + 1); n++; }
    words = m; wordsVer = ver; return m;
  };
  const clsAt = (li, col) => {
    const L = tok(); if (!L || !E.lines[li]) return '';
    try { const r = L.tokenize(E.lines[li], li > 0 ? E.hlState[li - 1] : undefined); for (const [a, b, c] of r.tokens) if (col > a && col <= b) return c || ''; } catch (e) { /* без класса */ }
    return '';
  };
  /** Стоит ли знак перед курсором внутри строки в кавычках (с учётом тройных кавычек с прошлых строк). */
  const inStrAt = (li, col) => {
    const st = li > 0 ? E.hlState[li - 1] : undefined, text = E.lines[li] || '';
    let q = st && st.tri ? st.tri : '';
    for (let i = 0; i < col; i++) {
      const c = text[i];
      if (q) { if (c === '\\') { i++; continue; } if (q.length === 3 ? text.startsWith(q, i) : c === q) { i += q.length - 1; q = ''; } }
      else if (c === '#' && E.lang !== 'css' && E.lang !== 'javascript') return false;
      else if (c === '"' || c === "'") { q = text.startsWith(c + c + c, i) ? c + c + c : c; i += q.length - 1; }
    }
    return !!q;
  };
  const acContext = explicit => {
    if (!E.hint || E.ro) return null;
    const s = ta.selectionStart; if (s !== ta.selectionEnd) return null;
    const li = lineOf(s), text = E.lines[li] || '', col = s - ls[li];
    let a = col; while (a > 0 && WORD_CH.test(text[a - 1])) a--;
    return { lang: E.lang, line: li, col, text, before: text.slice(0, col), after: text.slice(col), prefix: text.slice(a, col), start: ls[li] + a, explicit: !!explicit, cls: clsAt(li, col), inStr: inStrAt(li, col), words: docWords, lines: E.lines };
  };
  /** Насколько запрос подходит к имени: 0 — с начала, 1 — с начала слова внутри имени, 2 — где-то внутри, 3 — по буквам; -1 — не подходит. */
  const acRank = (label, p) => {
    if (!p) return 0;
    const l = label.toLowerCase(), q = p.toLowerCase();
    if (l.startsWith(q)) return label.startsWith(p) ? 0 : 0.5;
    const i = l.indexOf(q); if (i > 0) return /[\s_.\-\/:]/.test(l[i - 1]) ? 1 : 2;
    if (q.length >= 3) { let k = 0; for (const c of l) if (c === q[k]) k++; if (k === q.length) return 3; }
    return -1;
  };
  const acClose = () => {
    if (!AC.open && acBox.hidden) return;
    AC.open = false; AC.items = []; acBox.hidden = true; acList.replaceChildren(); ta.setAttribute('aria-expanded', 'false'); ta.removeAttribute('aria-activedescendant');
  };
  const acPaintSel = () => {
    const kids = acList.children;
    for (let i = 0; i < kids.length; i++) { const on = i === AC.idx; kids[i].classList.toggle('on', on); kids[i].setAttribute('aria-selected', String(on)); if (on) { ta.setAttribute('aria-activedescendant', kids[i].id); const t0 = kids[i].offsetTop, t1 = t0 + kids[i].offsetHeight; if (t0 < acList.scrollTop) acList.scrollTop = t0; else if (t1 > acList.scrollTop + acList.clientHeight) acList.scrollTop = t1 - acList.clientHeight; } }
  };
  const acPlace = () => {
    if (!AC.open) return;
    const li = lineOf(AC.start), col = AC.start - ls[li];
    const x = gutter.offsetWidth + CE_PADX + vcol(li, col) * E.cw - scroll.scrollLeft;
    const yTop = CE_PADY + li * E.lh - scroll.scrollTop, yBot = yTop + E.lh;
    acBox.hidden = false; acBox.style.left = '0px'; acBox.style.top = '0px';
    const bw = acBox.offsetWidth, bh = acBox.offsetHeight, W = root.clientWidth, H = root.clientHeight;
    const left = Math.max(gutter.offsetWidth, Math.min(x - 6, W - bw - 10));
    let top = yBot + 2; if (top + bh > H - 4 && yTop - bh - 2 > 4) top = yTop - bh - 2;
    acBox.style.left = Math.round(left) + 'px'; acBox.style.top = Math.round(top) + 'px';
    acBox.style.visibility = yBot < 0 || yTop > H ? 'hidden' : '';
  };
  const acRender = () => {
    const f = document.createDocumentFragment();
    AC.items.forEach((it, i) => {
      const row = h('div', { class: 'ce-ac-i', role: 'option', id: acId + '-' + i, 'aria-selected': 'false' },
        h('span', { class: 'ce-ac-k k-' + (it.kind || 'word'), 'aria-hidden': 'true' }, it.mark || ''),
        h('span', { class: 'ce-ac-l' }, it.label), it.detail ? h('span', { class: 'ce-ac-d' }, it.detail) : null);
      row.addEventListener('mousedown', ev => { ev.preventDefault(); });
      row.addEventListener('click', () => { acAccept(i); });
      f.append(row);
    });
    acList.replaceChildren(f);
  };
  /** Пересчитать список. mayOpen — можно ли открыть закрытый список (при наборе да, при движении курсора нет). */
  const acRefresh = (explicit, mayOpen) => {
    if (!AC.open && !mayOpen) return;
    const ctx = acContext(explicit);
    if (!ctx) { acClose(); return; }
    if (AC.open && !mayOpen && ctx.start !== AC.start) { acClose(); return; }
    if (!explicit && /^[\p{L}\p{N}_]/u.test(ctx.after)) { acClose(); return; }             // курсор в середине слова: не мешаем
    let raw; try { raw = E.hint(ctx) || []; } catch (e) { raw = []; }
    if (!Array.isArray(raw)) { if (raw.prefix != null) { ctx.prefix = raw.prefix; ctx.start = ls[ctx.line] + (raw.from != null ? raw.from : ctx.col - raw.prefix.length); } raw = raw.items || []; }
    const seen = new Set(), list = [];
    for (const it of raw) {
      if (!it || !it.label || seen.has(it.label)) continue;
      const r = acRank(it.label, ctx.prefix); if (r < 0) continue;
      seen.add(it.label); list.push({ it, r });
    }
    list.sort((a, b) => a.r - b.r || (a.it.pri == null ? 5 : a.it.pri) - (b.it.pri == null ? 5 : b.it.pri) || (a.it.label < b.it.label ? -1 : a.it.label > b.it.label ? 1 : 0));
    const items = list.slice(0, 60).map(x => x.it);
    if (!items.length || (items[0].label === ctx.prefix && items[0].insert == null && !ctx.explicit)) { acClose(); return; }   // слово уже набрано целиком: нечего дополнять
    const keep = AC.open ? (AC.items[AC.idx] || {}).label : null;
    AC.items = items; AC.start = ctx.start; AC.open = true;
    const k = keep ? items.findIndex(x => x.label === keep) : -1; AC.idx = k >= 0 ? k : 0;
    acRender(); ta.setAttribute('aria-expanded', 'true'); acBox.hidden = false; acPlace(); acPaintSel();
  };
  const acSoon = () => { if (!AC.open || acRaf) return; acRaf = requestAnimationFrame(() => { acRaf = 0; acRefresh(false, false); }); };
  const acAccept = idx => {
    const it = AC.items[idx == null ? AC.idx : idx]; if (!it) return false;
    const start = AC.start, end = ta.selectionStart, text = it.insert != null ? it.insert : it.label;
    acClose();
    replace(start, end, text, start + (it.caret != null ? it.caret : text.length));
    keepVisible(); cursor();
    return true;
  };
  const acOnInput = ev => {
    if (!E.hint) return;
    if (AC.open) { acRefresh(false, true); return; }
    if (inRep || !ev || ev.inputType !== 'insertText' || !ev.data || ev.data.length > 2) return;
    if (WORD_CH.test(ev.data) || /^[ \[{.\/"']$/.test(ev.data)) acRefresh(false, true);
  };
  const acKey = ev => {
    if (!AC.open) return false;
    const k = ev.key, n = AC.items.length;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return false;
    if (k === 'ArrowDown' || k === 'ArrowUp') { ev.preventDefault(); AC.idx = (AC.idx + (k === 'ArrowDown' ? 1 : -1) + n) % n; acPaintSel(); return true; }
    if (k === 'PageDown' || k === 'PageUp') { ev.preventDefault(); AC.idx = Math.max(0, Math.min(n - 1, AC.idx + (k === 'PageDown' ? 8 : -8))); acPaintSel(); return true; }
    if ((k === 'Enter' || k === 'Tab') && !ev.shiftKey) { ev.preventDefault(); acAccept(); return true; }
    if (k === 'Escape') { ev.preventDefault(); ev.stopPropagation(); acClose(); return true; }
    return false;
  };
  ta.addEventListener('blur', () => acClose());
  scroll.addEventListener('scroll', () => { if (AC.open) acPlace(); }, { passive: true });
  E.setHint = fn => { E.hint = fn || null; if (!E.hint) acClose(); };
  E.showHints = () => { ta.focus(); acRefresh(true, true); };
  E.hints = () => ({ open: AC.open, items: AC.items.map(x => x.label), idx: AC.idx, start: AC.start });
  E.acceptHint = () => acAccept();


  /* ---------- «Перейти к определению»: F12 или Ctrl+щелчок по слову (что считать определением, решает opts.onDefinition) ---------- */
  const wordAt = pos => {
    const v = ta.value; let a = pos, b = pos;
    while (a > 0 && WORD_CH.test(v[a - 1])) a--;
    while (b < v.length && WORD_CH.test(v[b])) b++;
    return a < b ? { word: v.slice(a, b), from: a, to: b } : null;
  };
  const goDefinition = () => {
    if (!E.onDefinition) return false;
    const w = wordAt(ta.selectionStart); if (!w) return false;
    const li = lineOf(w.from);
    return !!E.onDefinition({ word: w.word, from: w.from, to: w.to, line: li, col: w.from - ls[li], before: E.lines[li].slice(0, w.from - ls[li]), after: E.lines[li].slice(w.to - ls[li]), lang: E.lang });
  };
  ta.addEventListener('click', ev => { if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && ev.button === 0 && E.onDefinition) { ev.preventDefault(); goDefinition(); } });
  E.goDefinition = goDefinition;

  /* ---------- внешний вид API ---------- */
  E.get = () => ta.value;
  E.set = (text, o) => {
    o = o || {}; ver++; acClose(); ta.value = String(text == null ? '' : text); patch(ta.value.split('\n'), !!o.force);
    if (o.keepSel) { /* позиция уже сохранена браузером при записи value обычно сбрасывается: вернём */ ta.setSelectionRange(o.keepSel[0], o.keepSel[1]); } else ta.setSelectionRange(0, 0);
    if (F.open) compute(true); else cursor();
  };
  E.setLang = name => { if (name === E.lang) return; E.lang = name; skipMap.clear(); sync(); patch(ta.value.split('\n'), true); cursor(); };
  E.focus = () => { remeasure(); ta.focus({ preventScroll: true }); };
  E.goto = (line, col) => {
    const lines = ta.value.split('\n'), ln = Math.max(0, Math.min(lines.length - 1, (line | 0) - 1));
    let pos = 0; for (let i = 0; i < ln; i++) pos += lines[i].length + 1;
    pos += Math.max(0, Math.min(lines[ln].length, (col | 0) - 1 || 0));
    ta.focus({ preventScroll: true }); ta.setSelectionRange(pos, pos); cursor();
    scroll.scrollTop = Math.max(0, CE_PADY + ln * E.lh - scroll.clientHeight / 3);
  };
  E.select = (from, to) => { ta.focus({ preventScroll: true }); ta.setSelectionRange(from, to); cursor(); keepVisible(); };
  E.gotoPrompt = () => {
    promptDlg({ title: t('ce.goto'), placeholder: t('ce.goto.ph'), value: '', ok: 'OK' }).then(v => { if (v == null) return; const m = /^(\d+)(?:[:,](\d+))?$/.exec(String(v).trim()); if (m) E.goto(+m[1], +m[2] || 1); E.focus(); });
  };
  E.state = () => ({ top: scroll.scrollTop, left: scroll.scrollLeft, s: ta.selectionStart, e: ta.selectionEnd });
  E.restore = st => { if (!st) return; ta.setSelectionRange(Math.min(st.s, ta.value.length), Math.min(st.e, ta.value.length)); scroll.scrollTop = st.top; scroll.scrollLeft = st.left; cursor(); };
  E.setReadOnly = v => { E.ro = !!v; ta.readOnly = E.ro; cursor(); };
  E.lineCount = () => E.lines.length;
  E.destroy = () => { document.removeEventListener('selectionchange', onSel); remT.forEach(clearTimeout); try { if (document.fonts) document.fonts.removeEventListener('loadingdone', onFonts); } catch (e) { /* ok */ } clearTimeout(sigT); clearTimeout(fT); cancelAnimationFrame(ovRaf); ro.disconnect(); root.remove(); };
  E.measure = () => { measure(); fit(); cursor(); paintOv(); };
  E.set(opts.text || '');
  return E;
}

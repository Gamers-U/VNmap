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
});

const CE_LH = 20;                 // высота строки, пикселей (то же значение в style.css: .ce)
const CE_PADY = 8;                // отступ сверху и снизу
const CE_PADX = 12;
const CE_LANGS = {};              // заполняет codelang.js
const ceLang = name => CE_LANGS[name] || CE_LANGS.text || null;
const CE_COMMENT = { renpy: '# ', python: '# ', yaml: '# ', ini: '; ', javascript: '// ', css: '/* ', json: null, markdown: null, html: null, xml: null, text: null };

function ceCreate(opts) {
  opts = opts || {};
  const E = {
    lang: opts.lang || 'text', tab: opts.tabSize || 4, ro: !!opts.readOnly, onChange: opts.onChange || null, onCursor: opts.onCursor || null, onSave: opts.onSave || null,
    lines: [], els: [], hlState: [], wrap: false, cw: 8,
  };
  const gutter = h('div', { class: 'ce-gutter', 'aria-hidden': 'true' });
  const hl = h('div', { class: 'ce-hl', 'aria-hidden': 'true' });
  const cur = h('div', { class: 'ce-cur', 'aria-hidden': 'true' });
  const ta = h('textarea', { class: 'ce-ta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off', 'aria-label': opts.label || 'code' });
  const code = h('div', { class: 'ce-code' }, cur, hl, ta);
  const content = h('div', { class: 'ce-content' }, gutter, code);
  const scroll = h('div', { class: 'ce-scroll' }, content);
  const root = h('div', { class: 'ce' }, scroll);
  const ruler = h('span', { class: 'ce-ruler' }, '0'.repeat(100));
  root.append(ruler);
  if (E.ro) ta.readOnly = true;
  E.el = root; E.ta = ta; E.scroll = scroll;

  /* ---------- размеры ---------- */
  const measure = () => { const w = ruler.getBoundingClientRect().width; if (w > 0) E.cw = w / 100; };
  let maxLen = 0;
  const fit = () => {
    const n = E.lines.length;
    const h2 = n * CE_LH + CE_PADY * 2;
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
    fit();
  };
  const ceStEq = (x, y) => x === y || (x && y && JSON.stringify(x) === JSON.stringify(y));
  const sync = () => { patch(ta.value.split('\n')); };

  /* ---------- курсор ---------- */
  const lineOf = pos => { let n = 0, i = -1; while ((i = ta.value.indexOf('\n', i + 1)) !== -1 && i < pos) n++; return n; };
  const lineStart = pos => ta.value.lastIndexOf('\n', pos - 1) + 1;
  let lastCur = '';
  const cursor = () => {
    const s = ta.selectionStart, e = ta.selectionEnd, ln = lineOf(s), col = s - lineStart(s);
    cur.style.top = (CE_PADY + ln * CE_LH) + 'px'; cur.style.display = s === e && !E.ro ? '' : 'none'; cur.classList.toggle('on', document.activeElement === ta);
    const key = ln + ':' + col + ':' + (e - s);
    if (key !== lastCur) { lastCur = key; if (E.onCursor) E.onCursor({ line: ln + 1, col: col + 1, len: e - s, pos: s, lines: E.lines.length }); }
  };
  const keepVisible = () => {
    const s = ta.selectionStart, ln = lineOf(s), top = CE_PADY + ln * CE_LH, bot = top + CE_LH;
    if (top < scroll.scrollTop + 4) scroll.scrollTop = Math.max(0, top - 40);
    else if (bot > scroll.scrollTop + scroll.clientHeight - 4) scroll.scrollTop = bot - scroll.clientHeight + 40;
    const col = s - lineStart(s), x = col * E.cw + CE_PADX + gutter.offsetWidth;
    if (x < scroll.scrollLeft + gutter.offsetWidth + 20) scroll.scrollLeft = Math.max(0, x - gutter.offsetWidth - 60);
    else if (x > scroll.scrollLeft + scroll.clientWidth - 30) scroll.scrollLeft = x - scroll.clientWidth + 80;
  };

  /* ---------- правки через execCommand (сохраняют отмену) ---------- */
  const replace = (from, to, str, selFrom, selTo) => {
    ta.focus(); ta.setSelectionRange(from, to);
    if (!document.execCommand('insertText', false, str)) { ta.setRangeText(str, from, to, 'end'); ta.dispatchEvent(new Event('input', { bubbles: true })); }
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
    if (E.extraKey && E.extraKey(ev)) return;
    if (k === 'Tab' && !mod && !ev.altKey) { ev.preventDefault(); onTab(ev); return; }
    if (k === 'Enter') { if (onEnter(ev)) ev.preventDefault(); return; }
    if (mod && k === '/') { ev.preventDefault(); toggleComment(); return; }
    if (ev.altKey && !mod && (k === 'ArrowUp' || k === 'ArrowDown')) { ev.preventDefault(); if (ev.shiftKey) dupLine(k === 'ArrowDown'); else moveLines(k === 'ArrowUp' ? -1 : 1); return; }
    if (mod && ev.shiftKey && k.toLowerCase() === 'k') { ev.preventDefault(); deleteLine(); return; }
    if (mod && k.toLowerCase() === 'g') { ev.preventDefault(); E.gotoPrompt(); return; }
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
      ev.preventDefault(); replace(s, e, k + close, s + 1); return;
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
  const onInput = () => { sync(); cursor(); keepVisible(); if (E.onChange) E.onChange(ta.value); };
  ta.addEventListener('input', onInput);
  ta.addEventListener('keydown', onKeyDown);
  for (const ev of ['keyup', 'click', 'focus', 'blur']) ta.addEventListener(ev, cursor);
  const onSel = () => { if (document.activeElement === ta) { clearTimeout(sigT); sigT = setTimeout(cursor, 10); } };
  document.addEventListener('selectionchange', onSel);
  const ro = new ResizeObserver(() => { if (root.isConnected) { measure(); fit(); } }); ro.observe(scroll);
  ta.addEventListener('paste', () => setTimeout(() => keepVisible(), 0));
  /* щелчок по пустому месту под текстом ставит курсор в конец */
  content.addEventListener('mousedown', ev => { if (ev.target === content || ev.target === gutter) { ev.preventDefault(); ta.focus(); } });

  /* ---------- внешний вид API ---------- */
  E.get = () => ta.value;
  E.set = (text, o) => {
    o = o || {}; ta.value = String(text == null ? '' : text); patch(ta.value.split('\n'), !!o.force);
    if (o.keepSel) { /* позиция уже сохранена браузером при записи value обычно сбрасывается: вернём */ ta.setSelectionRange(o.keepSel[0], o.keepSel[1]); } else ta.setSelectionRange(0, 0);
    cursor();
  };
  E.setLang = name => { if (name === E.lang) return; E.lang = name; sync(); patch(ta.value.split('\n'), true); };
  E.focus = () => { ta.focus({ preventScroll: true }); };
  E.goto = (line, col) => {
    const lines = ta.value.split('\n'), ln = Math.max(0, Math.min(lines.length - 1, (line | 0) - 1));
    let pos = 0; for (let i = 0; i < ln; i++) pos += lines[i].length + 1;
    pos += Math.max(0, Math.min(lines[ln].length, (col | 0) - 1 || 0));
    ta.focus({ preventScroll: true }); ta.setSelectionRange(pos, pos); cursor();
    scroll.scrollTop = Math.max(0, CE_PADY + ln * CE_LH - scroll.clientHeight / 3);
  };
  E.select = (from, to) => { ta.focus({ preventScroll: true }); ta.setSelectionRange(from, to); cursor(); keepVisible(); };
  E.gotoPrompt = () => {
    promptDlg({ title: t('ce.goto'), placeholder: t('ce.goto.ph'), value: '', ok: 'OK' }).then(v => { if (v == null) return; const m = /^(\d+)(?:[:,](\d+))?$/.exec(String(v).trim()); if (m) E.goto(+m[1], +m[2] || 1); E.focus(); });
  };
  E.state = () => ({ top: scroll.scrollTop, left: scroll.scrollLeft, s: ta.selectionStart, e: ta.selectionEnd });
  E.restore = st => { if (!st) return; ta.setSelectionRange(Math.min(st.s, ta.value.length), Math.min(st.e, ta.value.length)); scroll.scrollTop = st.top; scroll.scrollLeft = st.left; cursor(); };
  E.setReadOnly = v => { E.ro = !!v; ta.readOnly = E.ro; cursor(); };
  E.lineCount = () => E.lines.length;
  E.destroy = () => { document.removeEventListener('selectionchange', onSel); clearTimeout(sigT); ro.disconnect(); root.remove(); };
  E.measure = () => { measure(); fit(); cursor(); };
  E.set(opts.text || '');
  return E;
}

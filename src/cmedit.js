'use strict';
/* ====== Редактор кода на CodeMirror 6 (с 1.7.14) ======
   Библиотека лежит отдельным скриптом (cm/dist/cm6.js → глобальный объект CM6; собирает GitHub Actions, см. cm/ и .github/workflows/cm.yml).
   Эта прослойка даёт те же методы, что ceCreate() из codeedit.js (get/set/replace/goto/select/state/restore/setLang/setFont/focus/measure/destroy,
   поля el, ro, fs, lang), поэтому ide.js работает с любым из двух движков; какой взять, решает настройка S.ide.engine
   ('cm' по умолчанию, 'classic' прежний) и сама библиотека: если CM6 не загрузился, остаётся прежний редактор.
   Что внутри:
   · подсветка теми же разборщиками CE_LANGS (codelang.js): ViewPlugin ставит классы t-*, состояния строк кэшируются и пересчитываются с первой изменённой;
   · сворачивание блоков по отступам (стрелки в поле номеров, Ctrl+Shift+[ и ]);
   · несколько курсоров: Alt+щелчок, Ctrl+Alt+↑/↓, Ctrl+D (следующее такое же), прямоугольное выделение Shift+Alt+протяжка;
   · автоперенос длинных строк (Alt+Z), мини-карта (по умолчанию выключена);
   · подчёркивание ошибок: мини-проверка сборки (minilint.js) для Ren'Py, разбор JSON; у находок с исправлением кнопка «Исправить»;
   · подсказки имён из opts.hint(ctx) (как в прежнем редакторе), F12 и Ctrl+щелчок: переход к определению, Enter с отступом по правилам языка. */

Object.assign(D, {
  'cm.fix': ['Исправить', 'Fix'], 'cm.fold.all': ['Свернуть все блоки', 'Fold all blocks'], 'cm.unfold.all': ['Развернуть все блоки', 'Unfold all blocks'],
  'cm.wrap': ['Перенос длинных строк (Alt+Z)', 'Wrap long lines (Alt+Z)'], 'cm.map': ['Мини-карта файла', 'File minimap'],
  'cm.engine': ['Движок редактора', 'Editor engine'], 'cm.engine.cm': ['CodeMirror (новый)', 'CodeMirror (new)'], 'cm.engine.classic': ['Прежний', 'Classic'],
  'cm.engine.h': ['Новый редактор умеет сворачивать блоки, ставить несколько курсоров и подчёркивать ошибки. Прежний остаётся запасным.', 'The new editor can fold blocks, place several cursors and underline errors. The classic one stays as a fallback.'],
  'cm.engine.nolib': ['Библиотека CodeMirror не загрузилась, работает прежний редактор', 'The CodeMirror library did not load, the classic editor is in use'],
  'cm.json.err': ['Ошибка JSON: {0}', 'JSON error: {0}'], 'cm.errs': ['Ошибок: {0}', 'Errors: {0}'], 'cm.warns': ['Замечаний: {0}', 'Warnings: {0}'],
  'cm.sbtn.fold': ['Блоки: свернуть или развернуть', 'Blocks: fold or unfold'], 'cm.diag': ['Ошибки и замечания в файле', 'Problems in the file'],
});

const cmReady = () => typeof CM6 !== 'undefined' && !!CM6 && !!CM6.view && !!CM6.state && !!CM6.language && !!CM6.search;
/** Какой движок взять для нового окна: из настройки, но только если библиотека на месте. */
const cmEngineWanted = () => (S.ide && S.ide.engine === 'classic') || !cmReady() ? 'classic' : 'cm';

const CM_RU = {
  'Find': 'Найти', 'Replace': 'Заменить', 'next': 'дальше', 'previous': 'назад', 'all': 'все', 'match case': 'с учётом регистра', 'regexp': 'регулярное выражение',
  'by word': 'слово целиком', 'replace': 'заменить', 'replace all': 'заменить все', 'close': 'закрыть', 'current match': 'текущее совпадение', 'on line': 'в строке',
  'replaced $ matches': 'заменено совпадений: $', 'replaced match on line $': 'заменено в строке $', 'Go to line': 'Перейти к строке', 'go': 'ОК',
  'Folded lines': 'Свёрнутые строки', 'Unfolded lines': 'Развёрнутые строки', 'to': 'до', 'folded code': 'свёрнутый код', 'unfold': 'развернуть',
  'Fold line': 'Свернуть блок', 'Unfold line': 'Развернуть блок', 'Diagnostics': 'Ошибки и замечания', 'No diagnostics': 'Ошибок нет', 'Completions': 'Подсказки',
  'Selection deleted': 'Выделение удалено', 'Control character': 'Управляющий знак',
};

/* ---------- состояния подсветки: кэш «состояние на начало строки» ---------- */
function cmLineStart(E, doc, li) {
  const c = E.hlc, L = ceLang(E.lang), tk = L && L.tokenize ? L.tokenize : null;
  if (!tk) return undefined;
  while (c.n <= li && c.n <= doc.lines) {
    const i = c.n - 1; let st = c.st[i];
    try { st = tk(doc.line(i + 1).text, st).state; } catch (e) { st = undefined; }
    c.st[c.n] = st; c.n++;
  }
  return c.st[li];
}
function cmTokens(E, doc, li) {
  const L = ceLang(E.lang); if (!L || !L.tokenize) return [];
  try { return L.tokenize(doc.line(li + 1).text, cmLineStart(E, doc, li)).tokens || []; } catch (e) { return []; }
}
const cmRehl = () => CM6.state.StateEffect.define();
const cmIndentOf = s => /^[ \t]*/.exec(s)[0];
/** Насколько запрос подходит к имени: 0 — с начала, 1 — с начала слова внутри имени, 2 — где-то внутри, 3 — по буквам; -1 — не подходит (как в прежнем редакторе). */
function cmRank(label, p) {
  if (!p) return 0;
  const l = label.toLowerCase(), q = p.toLowerCase();
  if (l.startsWith(q)) return label.startsWith(p) ? 0 : 0.5;
  const i = l.indexOf(q); if (i > 0) return /[\s_.\-\/:]/.test(l[i - 1]) ? 1 : 2;
  if (q.length >= 3) { let k = 0; for (const c of l) if (c === q[k]) k++; if (k === q.length) return 3; }
  return -1;
}
const CM_WORD = /[\p{L}\p{N}_]/u;

/** Находки для подчёркивания: Ren'Py — мини-проверка сборки, JSON — разбор. Каждая: { from, to, severity, message, actions? }. */
function cmFindings(E, state, view) {
  const text = state.doc.toString(), out = [];
  if (E.lang === 'renpy' && typeof mlLint === 'function') {
    let list = []; try { list = mlLint(text.split('\n')); } catch (e) { list = []; }
    for (const f of list) {
      if (f.code === 'unknown') continue;                                         // «неизвестная команда» в чужих файлах (экраны, python) слишком шумит
      const ln = Math.min(state.doc.lines, Math.max(1, f.line)), line = state.doc.line(ln), lead = cmIndentOf(line.text).length;
      const from = line.from + Math.min(lead, line.text.length), to = Math.max(from + 1, line.to);
      let msg = ''; try { msg = mlMessage(f); } catch (e) { msg = f.code; }
      const d = { from, to: Math.min(to, state.doc.length), severity: f.level === 'error' ? 'error' : 'warning', message: msg };
      if (f.fix) d.actions = [{ name: t('cm.fix'), apply(v, a) { const l = v.state.doc.lineAt(a), r = f.fix(l.text); if (r != null && r !== l.text) v.dispatch({ changes: { from: l.from, to: l.to, insert: r } }); } }];
      out.push(d);
    }
  } else if (E.lang === 'json' && text.trim()) {
    try { JSON.parse(text); } catch (e) {
      const m = /position (\d+)/.exec(e.message), pos = m ? Math.min(+m[1], state.doc.length) : 0, line = state.doc.lineAt(pos);
      out.push({ from: Math.min(pos, Math.max(line.from, line.to - 1)), to: Math.max(Math.min(pos + 1, state.doc.length), pos), severity: 'error', message: t('cm.json.err', String(e.message).replace(/^JSON\.parse: /, '')) });
    }
  }
  return out;
}

/** Поле кода на CodeMirror вместо <textarea> (вкладка «Скрипт» главы, «Свой код», «Сниппеты»). Элемент-хозяин отвечает как textarea: value, selectionStart/End, setSelectionRange, focus,
    а событие 'input' (всплывает) приходит при каждой правке, 'blur' при уходе фокуса: прежний код вокруг поля остаётся как был. o: {text, lang, id, height, grow, placeholder, label, wrap}. */
function cmField(o) {
  o = o || {}; let el = null;
  const ed = cmCreate({ text: o.text || '', lang: o.lang || 'renpy', label: o.label || '', placeholder: o.placeholder || '', wrap: o.wrap !== false, grow: !!o.grow, autoDestroy: true,
    fontSize: S.ide && S.ide.fs, onChange: () => { if (el) el.dispatchEvent(new Event('input', { bubbles: true })); } });
  el = ed.el; if (o.id) el.id = o.id;
  el.classList.add('cmx-field'); if (o.height && !o.grow) el.style.height = o.height + 'px';
  Object.defineProperties(el, {
    value: { get: () => ed.get(), set: v => { ed.set(v); } },
    selectionStart: { get: () => ed.state().s }, selectionEnd: { get: () => ed.state().e },
  });
  el.setSelectionRange = (a, b) => ed.select(a, b); el.focus = () => ed.focus(); el.vnEd = ed;
  el.addEventListener('focusout', ev => { if (!el.contains(ev.relatedTarget)) el.dispatchEvent(new Event('blur')); });
  setTimeout(() => ed.measure(), 0);
  return { el, ed };
}
/** Редакторы без хозяина, который закрыл бы их сам (вкладка «Скрипт» главы, «Свой код», «Сниппеты»): при создании нового закрываем те, чей элемент давно убран со страницы. */
const CM_AUTO = new Set();
function cmSweep() { const now = Date.now(); for (const e of [...CM_AUTO]) if (e.el && !e.el.isConnected && now - e.born > 3000) e.destroy(); }
function cmCreate(opts) {
  opts = opts || {};
  const C = CM6, V = C.view, ST = C.state, LG = C.language, SR = C.search, AC = C.autocomplete, CMD = C.commands, LN = C.lint;
  const E = {
    engine: 'cm', lang: opts.lang || 'text', tab: opts.tabSize || 4, ro: !!opts.readOnly, onChange: opts.onChange || null, onCursor: opts.onCursor || null, onSave: opts.onSave || null,
    onFont: opts.onFont || null, hint: opts.hint || null, onDefinition: opts.onDefinition || null, pairs: opts.pairs, fs: Math.max(CE_FS_MIN, Math.min(CE_FS_MAX, +opts.fontSize || CE_FS)), lh: 0,
    wrap: opts.wrap !== false, map: !!opts.minimap, hlc: { st: [undefined], n: 1 }, silent: 0,
  };
  E.lh = ceLh(E.fs);
  const root = h('div', { class: 'cmx' + (opts.grow ? ' cmx-grow' : '') });          // grow: высота по тексту, прокручивается окно вокруг (вкладка «Скрипт» главы)
  E.el = root;
  const applyFont = () => { root.style.setProperty('--ce-fs', E.fs + 'px'); root.style.setProperty('--ce-lh', E.lh + 'px'); };
  applyFont();
  const comp = { wrap: new ST.Compartment(), map: new ST.Compartment(), ro: new ST.Compartment(), hist: new ST.Compartment(), lang: new ST.Compartment() };
  const rehl = cmRehl();

  /* подсветка */
  const highlighter = V.ViewPlugin.fromClass(class {
    constructor(view) { this.deco = this.build(view); }
    update(u) {
      if (u.docChanged) { let first = Infinity; u.changes.iterChangedRanges(fa => { first = Math.min(first, u.startState.doc.lineAt(fa).number - 1); }); E.hlc.n = Math.max(1, Math.min(E.hlc.n, first + 1)); }
      if (u.transactions.some(tr => tr.effects.some(e => e.is(rehl)))) E.hlc.n = 1;
      if (u.docChanged || u.viewportChanged || u.transactions.some(tr => tr.effects.some(e => e.is(rehl)))) this.deco = this.build(u.view);
    }
    build(view) {
      const b = new ST.RangeSetBuilder(), doc = view.state.doc; let done = -1;
      for (const { from, to } of view.visibleRanges) {
        let li = doc.lineAt(from).number - 1; const last = doc.lineAt(to).number - 1;
        for (; li <= last; li++) {
          if (li <= done) continue; done = li;
          const line = doc.line(li + 1); let pos = -1;
          for (const [a, z, c] of cmTokens(E, doc, li)) { if (c && a >= pos && z > a && z <= line.text.length) { b.add(line.from + a, line.from + z, V.Decoration.mark({ class: 't-' + c })); pos = z; } }
        }
      }
      return b.finish();
    }
  }, { decorations: p => p.deco });

  /* сворачивание по отступам */
  const foldSvc = LG.foldService.of((state, lineFrom) => {
    const doc = state.doc, line = doc.lineAt(lineFrom); if (!line.text.trim()) return null;
    const ind = cmIndentOf(line.text).replace(/\t/g, ' '.repeat(E.tab)).length; let end = null;
    for (let n = line.number + 1; n <= doc.lines; n++) {
      const l = doc.line(n); if (!l.text.trim()) continue;
      if (cmIndentOf(l.text).replace(/\t/g, ' '.repeat(E.tab)).length > ind) end = l; else break;
    }
    return end ? { from: line.to, to: end.to } : null;
  });

  /* команды */
  const cmEnter = view => {
    const state = view.state; if (state.readOnly) return false;
    const L = ceLang(E.lang), unit = ' '.repeat(E.tab);
    const tr = state.changeByRange(range => {
      const line = state.doc.lineAt(range.from), before = line.text.slice(0, range.from - line.from), after = state.doc.sliceString(range.to, state.doc.lineAt(range.to).to);
      let ind = cmIndentOf(before); const trimmed = before.replace(/\s+$/, '');
      const opens = L && L.indentAfter ? !!L.indentAfter(trimmed, before) : false;
      const pairClose = /[\]\)\}]$/.test(trimmed) ? false : /^[\]\)\}]/.test(after) && /[\[\(\{]$/.test(trimmed);
      if (pairClose) { const inner = ind + unit, ins = '\n' + inner + '\n' + ind; return { changes: { from: range.from, to: range.to, insert: ins }, range: ST.EditorSelection.cursor(range.from + 1 + inner.length) }; }
      if (opens) ind += unit;
      const ins = '\n' + ind; return { changes: { from: range.from, to: range.to, insert: ins }, range: ST.EditorSelection.cursor(range.from + ins.length) };
    });
    view.dispatch(state.update(tr, { scrollIntoView: true, userEvent: 'input' })); return true;
  };
  const cmTab = view => {
    const state = view.state; if (state.readOnly) return false;
    if (state.selection.ranges.every(r => r.empty)) {
      const tr = state.changeByRange(range => {
        const line = state.doc.lineAt(range.from), col = range.from - line.from, ins = ' '.repeat(E.tab - (col % E.tab));
        return { changes: { from: range.from, insert: ins }, range: ST.EditorSelection.cursor(range.from + ins.length) };
      });
      view.dispatch(state.update(tr, { scrollIntoView: true, userEvent: 'input' })); return true;
    }
    return CMD.indentMore(view);
  };
  const toggleWrap = () => { E.setWrap(!E.wrap); if (E.onWrap) E.onWrap(E.wrap); return true; };
  const gotoPrompt = () => { promptDlg({ title: t('ce.goto'), placeholder: t('ce.goto.ph'), value: '', ok: 'OK' }).then(v => { if (v == null) return; const m = /^(\d+)(?:[:,](\d+))?$/.exec(String(v).trim()); if (m) E.goto(+m[1], +m[2] || 1); E.focus(); }); return true; };
  const wordAt = (doc, pos) => {
    const line = doc.lineAt(pos), tx = line.text; let a = pos - line.from, b = a;
    while (a > 0 && CM_WORD.test(tx[a - 1])) a--;
    while (b < tx.length && CM_WORD.test(tx[b])) b++;
    return a < b ? { word: tx.slice(a, b), from: line.from + a, to: line.from + b, line, a, b } : null;
  };
  const goDefinition = () => {
    if (!E.onDefinition || !E.view) return false;
    const doc = E.view.state.doc, w = wordAt(doc, E.view.state.selection.main.head); if (!w) return false;
    return !!E.onDefinition({ word: w.word, from: w.from, to: w.to, line: w.line.number - 1, col: w.a, before: w.line.text.slice(0, w.a), after: w.line.text.slice(w.b), lang: E.lang });
  };
  const keys = [
    { key: 'Mod-s', run: () => { if (E.onSave) E.onSave(); return true; }, preventDefault: true },
    { key: 'Enter', run: cmEnter },
    { key: 'Tab', run: v => (AC.completionStatus(v.state) === 'active' ? AC.acceptCompletion(v) : false) },
    { key: 'Tab', run: cmTab, shift: CMD.indentLess },
    { key: 'F12', run: () => goDefinition(), preventDefault: true },
    { key: 'Mod-g', run: gotoPrompt, preventDefault: true },
    { key: 'Mod-h', run: v => { SR.openSearchPanel(v); return true; }, preventDefault: true },
    { key: 'Alt-z', run: toggleWrap, preventDefault: true },
    { key: 'Mod-d', run: SR.selectNextOccurrence, preventDefault: true },
    { key: 'Mod-Alt-ArrowUp', run: CMD.addCursorAbove, preventDefault: true },
    { key: 'Mod-Alt-ArrowDown', run: CMD.addCursorBelow, preventDefault: true },
    { key: 'Mod-=', run: () => { E.setFont(E.fs + 1); return true; }, preventDefault: true }, { key: 'Mod-+', run: () => { E.setFont(E.fs + 1); return true; }, preventDefault: true },
    { key: 'Mod--', run: () => { E.setFont(E.fs - 1); return true; }, preventDefault: true }, { key: 'Mod-0', run: () => { E.setFont(CE_FS); return true; }, preventDefault: true },
    { key: 'F8', run: LN.nextDiagnostic, shift: LN.previousDiagnostic },
  ];

  /* подсказки */
  let words = null, wordsDoc = null;
  const docWords = state => {
    if (words && wordsDoc === state.doc) return words;
    const m = new Map(), re = /[\p{L}_][\p{L}\p{N}_]{2,}/gu, v = state.doc.toString(); let r, n = 0;
    while ((r = re.exec(v)) && n < 60000) { m.set(r[0], (m.get(r[0]) || 0) + 1); n++; }
    words = m; wordsDoc = state.doc; return m;
  };
  const inStrAt = (doc, li, col) => {
    const st = cmLineStart(E, doc, li), text = doc.line(li + 1).text; let q = st && st.tri ? st.tri : '';
    for (let i = 0; i < col; i++) {
      const c = text[i];
      if (q) { if (c === '\\') { i++; continue; } if (q.length === 3 ? text.startsWith(q, i) : c === q) { i += q.length - 1; q = ''; } }
      else if (c === '#' && E.lang !== 'css' && E.lang !== 'javascript') return false;
      else if (c === '"' || c === "'") { q = text.startsWith(c + c + c, i) ? c + c + c : c; i += q.length - 1; }
    }
    return !!q;
  };
  const hintSource = cx => {
    if (!E.hint || E.ro) return null;
    const state = cx.state, sel = state.selection.main; if (!sel.empty) return null;
    const line = state.doc.lineAt(sel.head), li = line.number - 1, col = sel.head - line.from, text = line.text;
    if (!cx.explicit) { const last = text[col - 1] || ''; if (!(CM_WORD.test(last) || /^[ \[{.\/"']$/.test(last))) return null; }
    if (!cx.explicit && /^[\p{L}\p{N}_]/u.test(text.slice(col))) return null;                 // курсор в середине слова: не мешаем
    let a = col; while (a > 0 && CM_WORD.test(text[a - 1])) a--;
    let cls = ''; for (const [x, z, c] of cmTokens(E, state.doc, li)) if (col > x && col <= z) { cls = c || ''; break; }
    const ctx = { lang: E.lang, line: li, col, text, before: text.slice(0, col), after: text.slice(col), prefix: text.slice(a, col), start: line.from + a, explicit: !!cx.explicit, cls, inStr: inStrAt(state.doc, li, col), words: () => docWords(state) };
    Object.defineProperty(ctx, 'lines', { get: () => state.doc.toString().split('\n') });
    let raw; try { raw = E.hint(ctx) || []; } catch (e) { raw = []; }
    if (!Array.isArray(raw)) { if (raw.prefix != null) { ctx.prefix = raw.prefix; ctx.start = line.from + (raw.from != null ? raw.from : col - raw.prefix.length); } raw = raw.items || []; }
    const seen = new Set(), ranked = [];
    for (const it of raw) { if (!it || !it.label || seen.has(it.label)) continue; const r = cmRank(it.label, ctx.prefix); if (r < 0) continue; seen.add(it.label); ranked.push({ it, r }); }
    ranked.sort((x, y) => x.r - y.r || (x.it.pri == null ? 5 : x.it.pri) - (y.it.pri == null ? 5 : y.it.pri) || (x.it.label < y.it.label ? -1 : x.it.label > y.it.label ? 1 : 0));
    const list = ranked.slice(0, 60).map(x => x.it);
    if (!list.length || (list[0].label === ctx.prefix && list[0].insert == null && !ctx.explicit)) return null;       // слово уже набрано целиком: нечего дополнять
    return {
      from: ctx.start, filter: false,
      options: list.map((it, i) => ({
        label: it.label, detail: it.detail || '', type: it.kind || 'word', boost: 1000 - i, mark: it.mark || '',
        apply: (view, c, from, to) => { const tx = it.insert != null ? it.insert : it.label; view.dispatch({ changes: { from, to, insert: tx }, selection: { anchor: from + (it.caret != null ? it.caret : tx.length) }, userEvent: 'input.complete', scrollIntoView: true }); },
      })),
    };
  };

  const lintSrc = LN.linter(view => (E.lintOn === false ? [] : cmFindings(E, view.state, view)), { delay: 450 });
  const kmap = V.keymap;
  const exts = [
    V.lineNumbers(), V.highlightActiveLineGutter(), V.highlightSpecialChars(), comp.hist.of(CMD.history()), V.drawSelection(), V.dropCursor(),
    ST.EditorState.allowMultipleSelections.of(true), ST.EditorState.tabSize.of(E.tab), LG.indentUnit.of(' '.repeat(E.tab)),
    ST.EditorState.phrases.of(S.lang === 'en' ? {} : CM_RU),
    LG.bracketMatching(), AC.closeBrackets(), V.rectangularSelection({ eventFilter: e => e.altKey && e.shiftKey && e.button === 0 }),
    V.EditorView.clickAddsSelectionRange.of(e => e.altKey && !e.shiftKey), V.highlightActiveLine(),
    SR.highlightSelectionMatches(), SR.search({ top: true }),
    LG.foldGutter({ markerDOM: open => h('span', { class: 'cmx-fold' + (open ? '' : ' closed') }, icon(open ? 'chevD' : 'chevR', 12)) }), foldSvc,
    ST.EditorState.languageData.of(() => [{ commentTokens: E.lang === 'css' ? { block: { open: '/*', close: '*/' } } : CE_COMMENT[E.lang] ? { line: CE_COMMENT[E.lang].trim() } : undefined, closeBrackets: { brackets: ['(', '[', '{', '"', "'"] } }]),
    highlighter,
    AC.autocompletion({ override: [hintSource], activateOnTyping: true, activateOnTypingDelay: 20, maxRenderedOptions: 80, icons: false, closeOnBlur: true,
      addToOptions: [{ position: 20, render: c => h('span', { class: 'ce-ac-k k-' + (c.type || 'word'), 'aria-hidden': 'true' }, c.mark || '') }] }),
    lintSrc, LN.lintGutter(), ...(opts.placeholder && V.placeholder ? [V.placeholder(opts.placeholder)] : []),
    ST.Prec.high(kmap.of(keys)),
    kmap.of([...AC.closeBracketsKeymap, ...CMD.defaultKeymap, ...SR.searchKeymap, ...CMD.historyKeymap, ...LG.foldKeymap, ...AC.completionKeymap, ...LN.lintKeymap]),
    V.EditorView.domEventHandlers({
      mousedown: (ev, view) => {
        if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && ev.button === 0 && E.onDefinition) {
          const pos = view.posAtCoords({ x: ev.clientX, y: ev.clientY }); if (pos == null) return false;
          view.dispatch({ selection: { anchor: pos } }); ev.preventDefault(); goDefinition(); return true;
        }
        return false;
      },
      wheel: ev => { if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); E.setFont(E.fs + (ev.deltaY < 0 ? 1 : -1)); return true; } return false; },
    }),
    V.EditorView.updateListener.of(u => {
      if (u.docChanged && !E.silent && E.onChange) E.onChange(u.state.doc.toString());
      const pc = LN.diagnosticCount ? LN.diagnosticCount(u.state) : 0; if (pc !== E.cnt) { E.cnt = pc; if (E.onProblems) E.onProblems(pc); }
      if ((u.selectionSet || u.docChanged) && E.onCursor) {
        const m = u.state.selection.main, ln = u.state.doc.lineAt(m.head);
        E.onCursor({ line: ln.number, col: m.head - ln.from + 1, len: m.to - m.from, pos: m.from, lines: u.state.doc.lines });
      }
    }),
    comp.wrap.of(E.wrap ? V.EditorView.lineWrapping : []), comp.map.of([]), comp.ro.of(ST.EditorState.readOnly.of(E.ro)),
    V.EditorView.contentAttributes.of({ 'aria-label': opts.label || 'code', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
  ].filter(Boolean);
  const view = new V.EditorView({ parent: root, state: ST.EditorState.create({ doc: String(opts.text == null ? '' : opts.text), extensions: exts }) });
  E.view = view;
  /* Esc, который редактор уже использовал (закрыл подсказки, поиск, свёл курсоры в один), не должен закрывать ещё и окно: общий обработчик app.js закрывает окно по любому Esc */
  root.addEventListener('keydown', ev => { if (ev.key === 'Escape' && ev.defaultPrevented) ev.stopPropagation(); });

  /* ---------- внешний вид API (как у ceCreate) ---------- */
  const doc = () => view.state.doc;
  E.get = () => doc().toString();
  E.set = (text, o) => {
    o = o || {}; const str = String(text == null ? '' : text); E.silent++;
    try {
      view.dispatch({ effects: comp.hist.reconfigure([]) }); view.dispatch({ effects: comp.hist.reconfigure(CMD.history()) });          // свежая история отмены, как у нового текста в поле
      const sel = o.keepSel ? { anchor: Math.min(o.keepSel[0], str.length), head: Math.min(o.keepSel[1], str.length) } : { anchor: 0 };
      view.dispatch({ changes: { from: 0, to: doc().length, insert: str }, selection: sel, effects: rehl.of(null) });
    } finally { E.silent--; }
  };
  E.replace = (from, to, str, selFrom, selTo) => {
    const a = selFrom != null ? selFrom : from + str.length, b = selTo != null ? selTo : a;
    view.dispatch({ changes: { from, to, insert: str }, selection: { anchor: a, head: b }, userEvent: 'input', scrollIntoView: true }); view.focus();
  };
  E.setLang = name => { if (name === E.lang) return; E.lang = name; view.dispatch({ effects: rehl.of(null) }); };
  E.focus = () => { view.focus(); };
  E.measure = () => { view.requestMeasure(); };
  E.goto = (line, col) => {
    const ln = Math.max(1, Math.min(doc().lines, line | 0 || 1)), l = doc().line(ln), pos = l.from + Math.max(0, Math.min(l.length, (col | 0) - 1 || 0));
    view.dispatch({ selection: { anchor: pos }, effects: V.EditorView.scrollIntoView(pos, { y: 'center' }) }); view.focus();
  };
  E.select = (from, to) => { view.focus(); view.dispatch({ selection: { anchor: Math.max(0, from), head: Math.min(doc().length, to) }, effects: V.EditorView.scrollIntoView(from, { y: 'center' }) }); };
  E.gotoPrompt = gotoPrompt;
  E.state = () => { const m = view.state.selection.main; return { top: view.scrollDOM.scrollTop, left: view.scrollDOM.scrollLeft, s: m.from, e: m.to }; };
  E.restore = st => {
    if (!st) return; const n = doc().length;
    view.dispatch({ selection: { anchor: Math.min(st.s, n), head: Math.min(st.e, n) } });
    view.scrollDOM.scrollTop = st.top; view.scrollDOM.scrollLeft = st.left;
  };
  E.setReadOnly = v => { E.ro = !!v; view.dispatch({ effects: comp.ro.reconfigure(ST.EditorState.readOnly.of(E.ro)) }); };
  E.lineCount = () => doc().lines;
  E.setFont = px => {
    const v = Math.max(CE_FS_MIN, Math.min(CE_FS_MAX, Math.round(px))); if (v === E.fs) return;
    E.fs = v; E.lh = ceLh(v); applyFont(); view.requestMeasure(); if (E.onFont) E.onFont(v);
  };
  E.setWrap = on => { E.wrap = !!on; view.dispatch({ effects: comp.wrap.reconfigure(E.wrap ? V.EditorView.lineWrapping : []) }); };
  E.setMinimap = on => {
    E.map = !!on;
    view.dispatch({ effects: comp.map.reconfigure(E.map ? C.minimap.showMinimap.compute(['doc'], () => ({ create: () => ({ dom: document.createElement('div') }), displayText: 'blocks', showOverlay: 'always' })) : []) });
  };
  E.foldAll = () => LG.foldAll(view); E.unfoldAll = () => LG.unfoldAll(view);
  E.setLint = on => { E.lintOn = !!on; LN.forceLinting(view); };
  E.problems = () => LN.diagnosticCount ? LN.diagnosticCount(view.state) : 0;
  E.openFind = withReplace => { SR.openSearchPanel(view); if (withReplace) { const r = root.querySelector('input[name=replace]'); if (r) r.focus(); } };
  E.closeFind = () => { SR.closeSearchPanel(view); view.focus(); };
  E.setHint = fn => { E.hint = fn || null; };
  E.showHints = () => { view.focus(); AC.startCompletion(view); };
  E.hints = () => { const st = AC.completionStatus(view.state), items = st === 'active' ? AC.currentCompletions(view.state).map(c => c.label) : []; return { open: st === 'active', items, idx: 0, start: 0 }; };
  E.acceptHint = () => AC.acceptCompletion(view);
  E.goDefinition = goDefinition;
  E.destroy = () => { CM_AUTO.delete(E); try { view.destroy(); } catch (e) { /* уже закрыт */ } };
  if (opts.autoDestroy) { cmSweep(); E.born = Date.now(); CM_AUTO.add(E); }
  if (E.map) E.setMinimap(true);
  return E;
}

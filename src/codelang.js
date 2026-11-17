'use strict';
/* ====== Подсветка кода по языкам для редактора (codeedit.js) ======
   Каждый язык это объект { tokenize(строка, состояние) → { tokens: [[от, до, класс]], state }, indentAfter(текст до курсора) → нужен ли отступ после Enter }.
   Состояние переносится со строки на строку (многострочные строки и комментарии, блок python в Ren'Py), поэтому оно маленькое и сравнивается как JSON.
   Классы: kw (объявления), ctl (управление), fn (функции и команды), type (имена и классы), var (переменные), const, num, str, esc, com, op, tag, attr, re, inv, link, head, meta, b, i.
   Их цвета заданы в style.css (.t-*) значениями из темы (themes.json, ключи ce*): в тёмной теме как «Dark+», в светлой как «Light+» в VS Code.
   Разбор построчный и нарочно простой: он красит то, что видно, и не пытается быть настоящим парсером. Ошибки разбора не рисуются (их ищет мини-проверка и Ren'Py). */
(function () {
  const WORD = /[\p{L}_][\p{L}\p{N}_]*/uy;
  const NUM = /0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?[jJ]?/y;
  const IDSTART = /[\p{L}_]/u;
  const S = (...w) => new Set(w);
  const push = (out, a, b, c) => { if (b > a) out.push([a, b, c]); };
  const word = (line, i) => { WORD.lastIndex = i; const m = WORD.exec(line); return m ? m[0] : ''; };
  const num = (line, i) => { NUM.lastIndex = i; const m = NUM.exec(line); return m ? m[0] : ''; };
  const indentOf = line => /^[ \t]*/.exec(line)[0].length;
  const cap = w => /^[A-ZА-ЯЁ]/.test(w);
  const upper = w => w.length > 1 && w === w.toUpperCase() && /[A-ZА-ЯЁ]/.test(w);

  const PY_KW = S('def', 'class', 'lambda', 'global', 'nonlocal', 'self', 'cls');
  const PY_CTL = S('if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'return', 'yield', 'break', 'continue', 'pass', 'raise', 'import', 'from', 'as', 'assert', 'del', 'await', 'async', 'in', 'is', 'not', 'and', 'or', 'match', 'case');
  const PY_CONST = S('True', 'False', 'None', 'NotImplemented', 'Ellipsis');
  const PY_BUILTIN = S('print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple', 'bool', 'open', 'min', 'max', 'sum', 'abs', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'isinstance', 'issubclass', 'super', 'type', 'round', 'any', 'all', 'repr', 'hasattr', 'getattr', 'setattr', 'iter', 'next', 'reversed', 'chr', 'ord', 'format', 'input', 'object', 'bytes', 'callable', 'divmod', 'pow', 'vars', 'dir', 'hash', 'hex', 'bin', 'oct', 'slice', 'property', 'staticmethod', 'classmethod');
  const RPY_CTL = S('at', 'as', 'with', 'behind', 'onlayer', 'zorder', 'expression', 'if', 'elif', 'else', 'in', 'not', 'and', 'or', 'is', 'for', 'while', 'from', 'return', 'jump', 'call', 'pass');
  const RPY_NS = S('renpy', 'config', 'gui', 'persistent', 'store', 'preferences', 'im', 'achievement', 'layout', 'build');
  const RPY_DECL = S('label', 'define', 'default', 'init', 'python', 'screen', 'transform', 'image', 'style', 'translate', 'layeredimage', 'testcase');
  const RPY_FLOW = S('jump', 'call', 'return', 'if', 'elif', 'else', 'while', 'for', 'pass', 'with', 'break', 'continue', 'menu');
  const RPY_CMD = S('scene', 'show', 'hide', 'play', 'stop', 'queue', 'voice', 'window', 'pause', 'nvl', 'camera', 'extend', 'centered');
  const RPY_SCR = S('vbox', 'hbox', 'frame', 'text', 'textbutton', 'imagebutton', 'button', 'add', 'fixed', 'grid', 'viewport', 'vpgrid', 'bar', 'vbar', 'key', 'timer', 'input', 'side', 'null', 'mousearea', 'drag', 'draggroup', 'hotspot', 'showif', 'imagemap', 'use', 'transclude', 'on');

  /* ---------- строки ---------- */
  /** Закрывающая скобка для «[…]» с вложенностью; -1, если не закрыта в этой строке. Возвращает индекс после неё. */
  function closeAt(line, i, open, close) {
    let d = 0;
    for (let j = i; j < line.length; j++) { const c = line[j]; if (c === open) d++; else if (c === close && --d === 0) return j + 1; }
    return -1;
  }
  /** Строка, которая началась на позиции i (там кавычка) или продолжается с позиции i (cont — закрывающая кавычка тройной строки). o: { rpy, raw, from }. */
  function str(line, i, out, o, cont) {
    const n = line.length;
    let q, tri, j;
    if (cont) { q = cont[0]; tri = true; j = i; } else { q = line[i]; tri = line.startsWith(q + q + q, i); j = i + (tri ? 3 : 1); }
    let seg = cont ? i : (o && o.from != null ? o.from : i);
    const flush = to => push(out, seg, to, 'str');
    while (j < n) {
      const c = line[j];
      if (c === '\\' && !(o && o.raw)) { flush(j); push(out, j, Math.min(n, j + 2), 'esc'); j += 2; seg = j; continue; }
      if (o && o.rpy) {
        if ((c === '[' || c === '{') && line[j + 1] === c) { flush(j); push(out, j, j + 2, 'esc'); j += 2; seg = j; continue; }
        if (c === '[') { const e = closeAt(line, j, '[', ']'); if (e > 0) { flush(j); push(out, j, e, 'var'); j = e; seg = j; continue; } }
        if (c === '{') { const e = line.indexOf('}', j); if (e > 0) { flush(j); push(out, j, e + 1, 'tag'); j = e + 1; seg = j; continue; } }
      }
      if (tri ? line.startsWith(q + q + q, j) : c === q) { const e = j + (tri ? 3 : 1); flush(e); return { end: e, st: null }; }
      j++;
    }
    flush(n);
    return { end: n, st: tri ? { tri: q + q + q } : null };
  }

  /* ---------- Python (и «питонья» часть Ren'Py) ---------- */
  /** o: { rpy: слова Ren'Py (at, with…), plain: имена без цвета }. Возвращает состояние (незакрытая тройная строка) или null. */
  function pyScan(line, i, st, out, o) {
    o = o || {};
    const n = line.length;
    if (st && st.tri) { const r = str(line, i, out, o, st.tri); if (r.st) return r.st; i = r.end; }
    let prev = '', afterDot = false;
    while (i < n) {
      const c = line[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '#') { push(out, i, n, 'com'); return null; }
      if (c === '"' || c === "'") { const r = str(line, i, out, { rpy: o.rpy }); if (r.st) return r.st; i = r.end; prev = ''; afterDot = false; continue; }
      if ((c >= '0' && c <= '9') || (c === '.' && line[i + 1] >= '0' && line[i + 1] <= '9' && !afterDot)) { const m = num(line, i); if (m) { push(out, i, i + m.length, 'num'); i += m.length; prev = ''; afterDot = false; continue; } }
      if (c === '@' && !o.rpy) { const m = /^@[\p{L}\p{N}_.]*/u.exec(line.slice(i)); push(out, i, i + m[0].length, 'fn'); i += m[0].length; continue; }
      if (IDSTART.test(c)) {
        const w = word(line, i), e = i + w.length, nx = line[e];
        if ((nx === '"' || nx === "'") && /^(?:[rRuUbBfF]|[rR][bBfF]|[bBfF][rR])$/.test(w)) { const r = str(line, e, out, { rpy: false, raw: /[rR]/.test(w), from: i }); if (r.st) return r.st; i = r.end; prev = ''; continue; }
        let cls = null;
        if (afterDot) cls = nx === '(' ? 'fn' : (o.plain ? null : 'var');
        else if (PY_KW.has(w)) cls = 'kw';
        else if (PY_CTL.has(w) || (o.rpy && RPY_CTL.has(w))) cls = 'ctl';
        else if (PY_CONST.has(w)) cls = 'const';
        else if (prev === 'def') cls = 'fn';
        else if (prev === 'class') cls = 'type';
        else if (nx === '(' || PY_BUILTIN.has(w)) cls = cap(w) && !PY_BUILTIN.has(w) ? 'type' : 'fn';
        else if (o.rpy && RPY_NS.has(w)) cls = 'const';
        else if (upper(w)) cls = 'const';
        else if (cap(w) && !o.plain) cls = 'type';
        else cls = o.plain ? null : 'var';
        push(out, i, e, cls); i = e; prev = w; afterDot = false; continue;
      }
      afterDot = c === '.' && !afterDot ? true : false;
      if (c !== '.') prev = '';
      i++;
    }
    return null;
  }
  /** Незакрытое двоеточие в конце строки кода (без комментария и строк) → нужен отступ. */
  function endsWithColon(text) {
    let q = '', last = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
      if (c === '"' || c === "'") { q = c; last = c; continue; }
      if (c === '#') break;
      if (c !== ' ' && c !== '\t') last = c;
    }
    return !q && last === ':';
  }
  const packState = (py, tri) => (py == null && !tri ? null : (py == null ? { tri } : (tri ? { py, tri } : { py })));

  /* ---------- Ren'Py ---------- */
  const PYBLOCK = /^(?:(init)(?:\s+(-?\d+))?\s+)?(python)((?:\s+(?:early|hide|in\s+[\p{L}_][\p{L}\p{N}_.]*))*)\s*:/u;
  function renpy(line, st) {
    const out = [], n = line.length, ind = indentOf(line), blank = ind === n;
    let py = st && st.py != null ? st.py : null;
    const tri = st && st.tri ? st.tri : null;
    if (!tri && py != null && !blank && ind <= py) py = null;
    if (tri || py != null) {                                  // внутри блока python: код Python
      const r = pyScan(line, 0, tri ? { tri } : null, out, { rpy: py == null });      // тройная строка вне блока python это текст Ren'Py: скобки [..] и {..} в ней значат своё
      return { tokens: out, state: packState(py, r && r.tri) };
    }
    if (blank) return { tokens: out, state: null };
    let i = ind;
    if (line[i] === '#') { push(out, i, n, 'com'); return { tokens: out, state: null }; }
    if (line[i] === '$') {
      push(out, i, i + 1, 'ctl');
      const r = pyScan(line, i + 1, null, out, { rpy: true });
      return { tokens: out, state: r && r.tri ? { tri: r.tri } : null };
    }
    const pm = PYBLOCK.exec(line.slice(i));
    if (pm) {
      let k = i;
      const scanWords = (text, base) => { for (let p = 0; p < text.length;) { const c = text[p]; if (c === ' ' || c === '\t') { p++; continue; } if (c === '-' || (c >= '0' && c <= '9')) { const m = /^-?\d+/.exec(text.slice(p)); if (m) { push(out, base + p, base + p + m[0].length, 'num'); p += m[0].length; continue; } } const w = word(text, p); if (!w) { p++; continue; } push(out, base + p, base + p + w.length, ['init', 'python', 'early', 'hide', 'in'].includes(w) ? 'kw' : null); p += w.length; } };
      scanWords(pm[0].slice(0, -1), k);
      return { tokens: out, state: { py: ind } };
    }
    const w = word(line, i), e = i + w.length;
    let rest = e, o = { rpy: true };
    if (w && RPY_DECL.has(w)) {
      push(out, i, e, 'kw');
      if (w === 'init') {                                      // init offset = 1; init -1:; init:
        let p = e; while (line[p] === ' ' || line[p] === '\t') p++;
        const w2 = word(line, p); if (w2 === 'offset') { push(out, p, p + 5, 'kw'); rest = p + 5; }
      } else {
        let p = e; while (line[p] === ' ' || line[p] === '\t') p++;
        if (w === 'define' || w === 'default') { const m = /^-?\d+/.exec(line.slice(p)); if (m) { push(out, p, p + m[0].length, 'num'); p += m[0].length; while (line[p] === ' ' || line[p] === '\t') p++; } }
        const nm = /^[\p{L}_][\p{L}\p{N}_.]*/u.exec(line.slice(p));
        if (nm) { push(out, p, p + nm[0].length, w === 'define' || w === 'default' ? 'var' : 'type'); rest = p + nm[0].length; if (w === 'translate') { let q2 = rest; while (line[q2] === ' ') q2++; const nm2 = /^[\p{L}_][\p{L}\p{N}_.]*/u.exec(line.slice(q2)); if (nm2) { push(out, q2, q2 + nm2[0].length, null); rest = q2 + nm2[0].length; } } }
        else rest = p;
      }
    } else if (w && RPY_FLOW.has(w)) {
      push(out, i, e, 'ctl');
      if (w === 'jump' || w === 'call') {
        let p = e; while (line[p] === ' ' || line[p] === '\t') p++;
        const nm = /^[\p{L}_][\p{L}\p{N}_.]*/u.exec(line.slice(p));
        if (nm && nm[0] !== 'expression') { push(out, p, p + nm[0].length, 'type'); rest = p + nm[0].length; }
      }
    } else if (w && RPY_CMD.has(w)) { push(out, i, e, 'fn'); o = { rpy: true, plain: true }; }
    else if (w && RPY_SCR.has(w) && line[e] !== '=') { push(out, i, e, 'fn'); o = { rpy: true, plain: true }; }
    else if (w) {
      /* реплика: имя [образ…] "текст" */
      const dm = /^([\p{L}_][\p{L}\p{N}_.]*)((?:\s+[\p{L}_@][\p{L}\p{N}_@.]*)*)\s*(?=["'])/u.exec(line.slice(i));
      if (dm) {
        push(out, i, i + dm[1].length, 'var');
        const attrs = dm[2]; for (const m of attrs.matchAll(/[\p{L}_@][\p{L}\p{N}_@.]*/gu)) push(out, i + dm[1].length + m.index, i + dm[1].length + m.index + m[0].length, 'attr');
        rest = i + dm[0].length; o = { rpy: true, plain: true };
      } else rest = i;
    } else rest = i;
    const r = pyScan(line, rest, null, out, o);
    out.sort((a, b) => a[0] - b[0]);
    return { tokens: out, state: r && r.tri ? { tri: r.tri } : null };
  }

  /* ---------- Python-файл ---------- */
  function python(line, st) {
    const out = [], r = pyScan(line, 0, st, out, { rpy: false });
    return { tokens: out, state: r && r.tri ? { tri: r.tri } : null };
  }

  /* ---------- JSON ---------- */
  function json(line) {
    const out = [], n = line.length;
    for (let i = 0; i < n;) {
      const c = line[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '/' && line[i + 1] === '/') { push(out, i, n, 'com'); break; }
      if (c === '"') {
        let j = i + 1; while (j < n && line[j] !== '"') j += line[j] === '\\' ? 2 : 1;
        const e = Math.min(n, j + 1); let k = e; while (line[k] === ' ' || line[k] === '\t') k++;
        push(out, i, e, line[k] === ':' ? 'attr' : 'str'); i = e; continue;
      }
      if (c === '-' || (c >= '0' && c <= '9')) { const m = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, 'num'); i += m[0].length; continue; } }
      if (IDSTART.test(c)) { const w = word(line, i); push(out, i, i + w.length, ['true', 'false', 'null'].includes(w) ? 'kw' : 'inv'); i += w.length; continue; }
      i++;
    }
    return { tokens: out, state: null };
  }

  /* ---------- Markdown ---------- */
  function inlineMd(line, from, out) {
    const n = line.length;
    for (let i = from; i < n;) {
      const c = line[i];
      if (c === '`') { const e = line.indexOf('`', i + 1); if (e > 0) { push(out, i, e + 1, 'str'); i = e + 1; continue; } }
      if ((c === '*' || c === '_') && line[i + 1] === c) { const e = line.indexOf(c + c, i + 2); if (e > 0 && e > i + 2) { push(out, i, e + 2, 'b'); i = e + 2; continue; } }
      if ((c === '*' || c === '_') && line[i + 1] && line[i + 1] !== ' ') { const e = line.indexOf(c, i + 1); if (e > 0 && line[e - 1] !== ' ' && (c === '*' || !/\w/.test(line[e + 1] || ''))) { push(out, i, e + 1, 'i'); i = e + 1; continue; } }
      if (c === '[') { const e = line.indexOf(']', i + 1); if (e > 0 && line[e + 1] === '(') { const e2 = line.indexOf(')', e + 2); if (e2 > 0) { push(out, i, e + 1, 'link'); push(out, e + 1, e2 + 1, 'str'); i = e2 + 1; continue; } } }
      if (c === '<') { const m = /^<\/?[A-Za-z][^>]*>/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, 'tag'); i += m[0].length; continue; } }
      if (c === 'h' && /^https?:\/\/[^\s)>]+/.test(line.slice(i, i + 200))) { const m = /^https?:\/\/[^\s)>]+/.exec(line.slice(i)); push(out, i, i + m[0].length, 'link'); i += m[0].length; continue; }
      i++;
    }
  }
  function markdown(line, st) {
    const out = [], n = line.length;
    if (st && st.fence) {
      if (line.trim().startsWith(st.fence)) { push(out, 0, n, 'meta'); return { tokens: out, state: null }; }
      push(out, 0, n, 'str'); return { tokens: out, state: st };
    }
    const fm = /^\s*(```|~~~)/.exec(line);
    if (fm) { push(out, 0, n, 'meta'); return { tokens: out, state: { fence: fm[1] } }; }
    if (/^\s{0,3}#{1,6}(\s|$)/.test(line)) { push(out, 0, n, 'head'); return { tokens: out, state: null }; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { push(out, 0, n, 'meta'); return { tokens: out, state: null }; }
    let from = 0, m;
    if ((m = /^(\s*)(>+)\s?/.exec(line))) { push(out, m[1].length, m[1].length + m[2].length, 'kw'); from = m[0].length; }
    else if ((m = /^(\s*)([-*+]|\d+[.)])\s/.exec(line))) { push(out, m[1].length, m[1].length + m[2].length, 'kw'); from = m[0].length; }
    inlineMd(line, from, out);
    return { tokens: out, state: null };
  }

  /* ---------- CSS ---------- */
  function css(line, st) {
    const out = [], n = line.length;
    let c = st && st.c ? 1 : 0, d = st && st.d ? st.d : 0;
    for (let i = 0; i < n;) {
      if (c) { const e = line.indexOf('*/', i); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1, d } }; } push(out, i, e + 2, 'com'); i = e + 2; c = 0; continue; }
      const ch = line[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '/' && line[i + 1] === '*') { const e = line.indexOf('*/', i + 2); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1, d } }; } push(out, i, e + 2, 'com'); i = e + 2; continue; }
      if (ch === '{') { d++; i++; continue; }
      if (ch === '}') { d = Math.max(0, d - 1); i++; continue; }
      if (ch === '"' || ch === "'") { const r = str(line, i, out, {}); i = r.end; continue; }
      if (d === 0) {
        if (ch === '@') { const w = /^@[\w-]+/.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'kw'); i += w[0].length; continue; } }
        if (ch === '.' || ch === '#') { const w = /^[.#][\w-]+/.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'fn'); i += w[0].length; continue; } }
        if (ch === ':') { const w = /^::?[\w-]+/.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'fn'); i += w[0].length; continue; } }
        if (ch === '[') { const e = line.indexOf(']', i); const end = e < 0 ? n : e + 1; push(out, i, end, 'attr'); i = end; continue; }
        if (/[A-Za-z]/.test(ch)) { const w = /^[\w-]+/.exec(line.slice(i)); push(out, i, i + w[0].length, 'tag'); i += w[0].length; continue; }
        i++; continue;
      }
      const m = /^([\w-]+)\s*:/.exec(line.slice(i));
      if (m && !/^\s*[{;]/.test(line.slice(i + m[0].length)) && (i === 0 || /^[\s;]*$/.test(line.slice(0, i)) || line[i - 1] === ';' || line[i - 1] === ' ')) { push(out, i, i + m[1].length, 'attr'); i += m[0].length; continue; }
      if (ch === '#') { const w = /^#[0-9a-fA-F]{3,8}\b/.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'num'); i += w[0].length; continue; } }
      if ((ch >= '0' && ch <= '9') || ((ch === '.' || ch === '-') && /[\d.]/.test(line[i + 1] || ''))) { const w = /^-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'num'); i += w[0].length; continue; } }
      if (ch === '!') { const w = /^!\s*important/i.exec(line.slice(i)); if (w) { push(out, i, i + w[0].length, 'kw'); i += w[0].length; continue; } }
      if (/[A-Za-z_-]/.test(ch)) { const w = /^[\w-]+/.exec(line.slice(i)); push(out, i, i + w[0].length, line[i + w[0].length] === '(' ? 'fn' : 'str'); i += w[0].length; continue; }
      i++;
    }
    return { tokens: out, state: c || d ? { c, d } : null };
  }

  /* ---------- JavaScript ---------- */
  const JS_KW = S('const', 'let', 'var', 'function', 'class', 'extends', 'static', 'get', 'set', 'new', 'this', 'super', 'typeof', 'instanceof', 'void', 'delete', 'async', 'of', 'in');
  const JS_CTL = S('if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'import', 'export', 'from', 'default', 'await', 'yield', 'with', 'as');
  const JS_CONST = S('true', 'false', 'null', 'undefined', 'NaN', 'Infinity');
  function js(line, st) {
    const out = [], n = line.length;
    let c = st && st.c ? 1 : 0, tpl = st && st.t ? 1 : 0, prevW = '';
    for (let i = 0; i < n;) {
      if (c) { const e = line.indexOf('*/', i); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1 } }; } push(out, i, e + 2, 'com'); i = e + 2; c = 0; continue; }
      if (tpl) {
        let j = i, seg = i;
        for (; j < n; j++) { const ch = line[j]; if (ch === '\\') { push(out, seg, j, 'str'); push(out, j, Math.min(n, j + 2), 'esc'); j++; seg = j + 1; continue; } if (ch === '$' && line[j + 1] === '{') { const e = closeAt(line, j + 1, '{', '}'); if (e > 0) { push(out, seg, j, 'str'); push(out, j, e, 'var'); j = e - 1; seg = e; continue; } } if (ch === '`') break; }
        if (j >= n) { push(out, seg, n, 'str'); return { tokens: out, state: { t: 1 } }; }
        push(out, seg, j + 1, 'str'); i = j + 1; tpl = 0; continue;
      }
      const ch = line[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '/' && line[i + 1] === '/') { push(out, i, n, 'com'); break; }
      if (ch === '/' && line[i + 1] === '*') { const e = line.indexOf('*/', i + 2); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1 } }; } push(out, i, e + 2, 'com'); i = e + 2; continue; }
      if (ch === '"' || ch === "'") { const r = str(line, i, out, {}); i = r.end; prevW = ''; continue; }
      if (ch === '`') { tpl = 1; push(out, i, i + 1, 'str'); i++; continue; }
      if ((ch >= '0' && ch <= '9')) { const m = /^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?n?)/.exec(line.slice(i)); push(out, i, i + m[0].length, 'num'); i += m[0].length; prevW = ''; continue; }
      if (/[\p{L}_$]/u.test(ch)) {
        const m = /^[\p{L}\p{N}_$]+/u.exec(line.slice(i)), w = m[0], e = i + w.length;
        let cls = null;
        if (JS_KW.has(w)) cls = 'kw'; else if (JS_CTL.has(w)) cls = 'ctl'; else if (JS_CONST.has(w)) cls = 'const';
        else if (prevW === 'function') cls = 'fn'; else if (prevW === 'class' || prevW === 'extends') cls = 'type';
        else if (line[e] === '(') cls = 'fn'; else if (cap(w)) cls = 'type'; else cls = 'var';
        push(out, i, e, cls); i = e; prevW = w; continue;
      }
      prevW = ''; i++;
    }
    return { tokens: out, state: c ? { c: 1 } : (tpl ? { t: 1 } : null) };
  }

  /* ---------- HTML / XML ---------- */
  function html(line, st) {
    const out = [], n = line.length;
    let com = st && st.c ? 1 : 0, tag = st && st.tag ? 1 : 0, q = st && st.q ? st.q : '', eq = false;
    for (let i = 0; i < n;) {
      if (com) { const e = line.indexOf('-->', i); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1 } }; } push(out, i, e + 3, 'com'); i = e + 3; com = 0; continue; }
      if (tag) {
        if (q) { let j = i; while (j < n && line[j] !== q) j++; if (j >= n) { push(out, i, n, 'str'); return { tokens: out, state: { tag: 1, q } }; } push(out, i, j + 1, 'str'); i = j + 1; q = ''; continue; }
        const ch = line[i];
        if (ch === ' ' || ch === '\t') { i++; continue; }
        if (ch === '>' || (ch === '/' && line[i + 1] === '>') || (ch === '?' && line[i + 1] === '>')) { const l = ch === '>' ? 1 : 2; push(out, i, i + l, 'meta'); i += l; tag = 0; continue; }
        if (ch === '"' || ch === "'") { const e = line.indexOf(ch, i + 1); if (e < 0) { push(out, i, n, 'str'); return { tokens: out, state: { tag: 1, q: ch } }; } push(out, i, e + 1, 'str'); i = e + 1; eq = false; continue; }
        if (ch === '=') { eq = true; i++; continue; }
        const m = /^[^\s=>"'/]+/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, eq ? 'str' : 'attr'); i += m[0].length; eq = false; continue; }
        i++; continue;
      }
      const ch = line[i];
      if (ch === '<') {
        if (line.startsWith('<!--', i)) { const e = line.indexOf('-->', i + 4); if (e < 0) { push(out, i, n, 'com'); return { tokens: out, state: { c: 1 } }; } push(out, i, e + 3, 'com'); i = e + 3; continue; }
        const m = /^<(\/|!|\?)?([A-Za-z][\w:.-]*)?/.exec(line.slice(i));
        if (m && (m[2] || m[1] === '!' || m[1] === '?')) { push(out, i, i + 1 + (m[1] ? 1 : 0), 'meta'); const nm = m[2] || ''; if (nm) push(out, i + 1 + (m[1] ? 1 : 0), i + m[0].length, 'tag'); else if (m[1] === '!') { const dd = /^<![\w]*/.exec(line.slice(i)); push(out, i + 1, i + dd[0].length, 'meta'); i += dd[0].length - m[0].length; } i += m[0].length; tag = 1; continue; }
      }
      if (ch === '&') { const m = /^&(?:#\d+|#x[\da-fA-F]+|\w+);/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, 'esc'); i += m[0].length; continue; } }
      i++;
    }
    return { tokens: out, state: com ? { c: 1 } : (tag ? (q ? { tag: 1, q } : { tag: 1 }) : null) };
  }

  /* ---------- YAML ---------- */
  function yaml(line) {
    const out = [], n = line.length;
    if (/^(---|\.\.\.)\s*$/.test(line)) { push(out, 0, n, 'meta'); return { tokens: out, state: null }; }
    let i = 0;
    const lead = /^(\s*(?:-\s+)*)/.exec(line)[0]; i = lead.length;
    const km = /^("(?:[^"\\]|\\.)*"|'[^']*'|[^\s#:'"{}\[\],&*!|>%@`][^#:]*?)\s*:(?=\s|$)/.exec(line.slice(i));
    if (km && line[i] !== '#') { push(out, i, i + km[1].length, 'attr'); i += km[0].length; }
    for (; i < n;) {
      const c = line[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) { push(out, i, n, 'com'); break; }
      if (c === '"' || c === "'") { const r = str(line, i, out, c === "'" ? { raw: true } : {}); i = r.end; continue; }
      if (c === '&' || c === '*') { const m = /^[&*][\w-]+/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, 'fn'); i += m[0].length; continue; } }
      if (c === '!') { const m = /^!\S*/.exec(line.slice(i)); push(out, i, i + m[0].length, 'type'); i += m[0].length; continue; }
      if (c === '-' || (c >= '0' && c <= '9')) { const m = /^-?\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?(?=[\s,\]}]|$)/.exec(line.slice(i)); if (m) { push(out, i, i + m[0].length, 'num'); i += m[0].length; continue; } }
      if (IDSTART.test(c)) { const m = /^[^\s,\]}#]+/.exec(line.slice(i)); push(out, i, i + m[0].length, /^(true|false|null|yes|no|on|off|~)$/i.test(m[0]) ? 'kw' : null); i += m[0].length; continue; }
      i++;
    }
    return { tokens: out, state: null };
  }

  /* ---------- INI ---------- */
  function ini(line) {
    const out = [], n = line.length, t = line.trim();
    if (!t) return { tokens: out, state: null };
    const ind = indentOf(line);
    if (t[0] === ';' || t[0] === '#') { push(out, ind, n, 'com'); return { tokens: out, state: null }; }
    if (t[0] === '[') { push(out, ind, n, 'kw'); return { tokens: out, state: null }; }
    const m = /^([^=:]+?)\s*([=:])\s*/.exec(line.slice(ind));
    if (m) {
      push(out, ind, ind + m[1].length, 'attr'); const from = ind + m[0].length;
      const v = line.slice(from);
      if (/^-?\d+(\.\d+)?$/.test(v.trim())) push(out, from, n, 'num'); else if (/^(true|false|yes|no|on|off)$/i.test(v.trim())) push(out, from, n, 'kw'); else push(out, from, n, 'str');
    }
    return { tokens: out, state: null };
  }

  /* ---------- сводка ---------- */
  CE_LANGS.text = {};
  CE_LANGS.renpy = { tokenize: renpy, indentAfter: before => endsWithColon(before) };
  CE_LANGS.python = { tokenize: python, indentAfter: before => endsWithColon(before) };
  CE_LANGS.json = { tokenize: json, indentAfter: before => /[{\[]\s*$/.test(before) };
  CE_LANGS.markdown = { tokenize: markdown };
  CE_LANGS.css = { tokenize: css, indentAfter: before => /\{\s*$/.test(before) };
  CE_LANGS.javascript = { tokenize: js, indentAfter: before => /[{\[(]\s*$/.test(before) };
  CE_LANGS.html = { tokenize: html };
  CE_LANGS.xml = { tokenize: html };
  CE_LANGS.yaml = { tokenize: yaml, indentAfter: before => /:\s*$/.test(before) };
  CE_LANGS.ini = { tokenize: ini };
})();

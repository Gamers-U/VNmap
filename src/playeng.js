'use strict';
/* ====== Движок плеера: читает собранный сценарий Ren'Py и проигрывает его ======
   Ничего не знает про окна: на входе тексты .rpy из compileProject, на выходе «события» (реплика, выбор, пауза, конец).
   Выражения Python разбираются своим разбором, без eval: работает при любой защите страницы.
   Понимает: label/jump/call/return, menu (с условиями), if/elif/else, while, $-строки и простые python:-блоки,
   default/define, Character, image, scene/show/hide/with, play/stop music/sound, voice, pause, реплики и текстовые теги.
   Чего не знает (пропускает с замечанием): ATL-анимации, экраны, init python, классы и функции Python. */

class PlErr extends Error { }

/* ---------- 1. выражения Python ---------- */
const PL_OPS3 = new Set(['//=', '**=', '...']);
const PL_OPS2 = new Set(['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '<>', '->', '|=', '&=']);
const PL_AUG = new Set(['+=', '-=', '*=', '/=', '%=', '//=', '**=', '|=', '&=']);
const PL_ESC = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'", '0': '\0' };

function plLex(src) {
  const out = []; let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue; }
    if (c === '#') break;
    const rest = src.slice(i);
    let m = /^([rRuUbBfF]{0,2})("""|'''|"|')/.exec(rest);
    if (m) {
      const raw = /r/i.test(m[1]), q = m[2]; let j = m[0].length, s = '';
      for (; ;) {
        if (j >= rest.length) throw new PlErr('строка не закрыта');
        if (rest.startsWith(q, j)) { j += q.length; break; }
        const ch = rest[j];
        if (ch === '\\' && !raw) { const nx = rest[j + 1]; if (nx !== undefined && nx in PL_ESC) s += PL_ESC[nx]; else s += '\\' + (nx || ''); j += 2; continue; }
        s += ch; j++;
      }
      out.push({ t: 'str', v: s }); i += j; continue;
    }
    if ((m = /^(?:0[xX][0-9a-fA-F]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/.exec(rest))) {
      out.push({ t: 'num', v: Number(m[0].replace(/_/g, '')) }); i += m[0].length; continue;
    }
    if ((m = /^[A-Za-z_À-￿][\wÀ-￿]*/.exec(rest))) { out.push({ t: 'name', v: m[0] }); i += m[0].length; continue; }
    const t3 = rest.slice(0, 3), t2 = rest.slice(0, 2);
    if (PL_OPS3.has(t3)) { out.push({ t: 'op', v: t3 }); i += 3; continue; }
    if (PL_OPS2.has(t2)) { out.push({ t: 'op', v: t2 }); i += 2; continue; }
    if ('+-*/%()[]{},.:<>=@|&^~;'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    throw new PlErr('непонятный знак «' + c + '»');
  }
  return out;
}

class PlParser {
  constructor(toks) { this.t = toks; this.p = 0; }
  get done() { return this.p >= this.t.length; }
  op(v, o = 0) { const k = this.t[this.p + o]; return !!k && k.t === 'op' && k.v === v; }
  kw(v, o = 0) { const k = this.t[this.p + o]; return !!k && k.t === 'name' && k.v === v; }
  need(v) { if (!this.op(v)) throw new PlErr('ожидалось «' + v + '»'); this.p++; }
  list() {
    const first = this.ternary();
    if (!this.op(',')) return first;
    const items = [first];
    while (this.op(',')) { this.p++; if (this.done || this.op(')') || this.op('=')) break; items.push(this.ternary()); }
    return { k: 'tuple', items };
  }
  ternary() {
    const a = this.or();
    if (this.kw('if')) { this.p++; const c = this.or(); if (!this.kw('else')) throw new PlErr('ожидалось «else»'); this.p++; const b = this.ternary(); return { k: 'if', c, a, b }; }
    return a;
  }
  or() { let l = this.and(); while (this.kw('or')) { this.p++; l = { k: 'or', l, r: this.and() }; } return l; }
  and() { let l = this.not(); while (this.kw('and')) { this.p++; l = { k: 'and', l, r: this.not() }; } return l; }
  not() { if (this.kw('not')) { this.p++; return { k: 'not', x: this.not() }; } return this.cmp(); }
  cmp() {
    const first = this.bor(), ops = [];
    for (; ;) {
      let op = null;
      const k = this.t[this.p];
      if (!k) break;
      if (k.t === 'op' && ['<', '>', '<=', '>=', '==', '!=', '<>'].includes(k.v)) { op = k.v === '<>' ? '!=' : k.v; this.p++; }
      else if (k.t === 'name' && k.v === 'in') { op = 'in'; this.p++; }
      else if (k.t === 'name' && k.v === 'not' && this.kw('in', 1)) { op = 'not in'; this.p += 2; }
      else if (k.t === 'name' && k.v === 'is') { this.p++; if (this.kw('not')) { this.p++; op = 'is not'; } else op = 'is'; }
      if (!op) break;
      ops.push([op, this.bor()]);
    }
    return ops.length ? { k: 'cmp', first, ops } : first;
  }
  bor() { let l = this.add(); while (this.op('|') || this.op('&') || this.op('^')) { const op = this.t[this.p++].v; l = { k: 'bin', op, l, r: this.add() }; } return l; }
  add() { let l = this.mul(); while (this.op('+') || this.op('-')) { const op = this.t[this.p++].v; l = { k: 'bin', op, l, r: this.mul() }; } return l; }
  mul() { let l = this.un(); while (this.op('*') || this.op('/') || this.op('//') || this.op('%')) { const op = this.t[this.p++].v; l = { k: 'bin', op, l, r: this.un() }; } return l; }
  un() {
    if (this.op('-') || this.op('+') || this.op('~')) { const op = this.t[this.p++].v; return { k: 'un', op, x: this.un() }; }
    return this.pow();
  }
  pow() { const l = this.post(); if (this.op('**')) { this.p++; return { k: 'bin', op: '**', l, r: this.un() }; } return l; }
  post() {
    let e = this.atom();
    for (; ;) {
      if (this.op('(')) {
        this.p++; const args = [], kw = {};
        while (!this.op(')')) {
          if (this.done) throw new PlErr('скобка не закрыта');
          const k = this.t[this.p];
          if (k.t === 'name' && this.op('=', 1)) { this.p += 2; kw[k.v] = this.ternary(); } else args.push(this.ternary());
          if (this.op(',')) this.p++; else break;
        }
        this.need(')'); e = { k: 'call', f: e, a: args, kw };
      } else if (this.op('[')) {
        this.p++; let lo = null, hi = null, slice = false;
        if (!this.op(':')) lo = this.ternary();
        if (this.op(':')) { slice = true; this.p++; if (!this.op(']')) hi = this.ternary(); }
        this.need(']'); e = slice ? { k: 'slice', o: e, lo, hi } : { k: 'idx', o: e, i: lo };
      } else if (this.op('.')) {
        this.p++; const nm = this.t[this.p++]; if (!nm || nm.t !== 'name') throw new PlErr('после точки нужно имя');
        e = { k: 'attr', o: e, n: nm.v };
      } else break;
    }
    return e;
  }
  atom() {
    const k = this.t[this.p++];
    if (!k) throw new PlErr('выражение оборвано');
    if (k.t === 'num') return { k: 'c', v: k.v };
    if (k.t === 'str') { let s = k.v; while (this.t[this.p] && this.t[this.p].t === 'str') s += this.t[this.p++].v; return { k: 'c', v: s }; }
    if (k.t === 'name') {
      if (k.v === 'True') return { k: 'c', v: true };
      if (k.v === 'False') return { k: 'c', v: false };
      if (k.v === 'None') return { k: 'c', v: null };
      if (k.v === 'lambda') throw new PlErr('lambda не поддерживается');
      return { k: 'name', n: k.v };
    }
    if (k.v === '(') {
      if (this.op(')')) { this.p++; return { k: 'tuple', items: [] }; }
      const e = this.list(); this.need(')'); return e;
    }
    if (k.v === '[') {
      const items = [];
      while (!this.op(']')) { if (this.done) throw new PlErr('скобка не закрыта'); items.push(this.ternary()); if (this.kw('for')) throw new PlErr('генераторы списков не поддерживаются'); if (this.op(',')) this.p++; else break; }
      this.need(']'); return { k: 'list', items };
    }
    if (k.v === '{') {
      const items = [], pairs = []; let dict = false;
      while (!this.op('}')) {
        if (this.done) throw new PlErr('скобка не закрыта');
        const a = this.ternary();
        if (this.op(':')) { this.p++; dict = true; pairs.push([a, this.ternary()]); } else items.push(a);
        if (this.op(',')) this.p++; else break;
      }
      this.need('}'); return dict || (!items.length) ? { k: 'dict', pairs } : { k: 'set', items };
    }
    throw new PlErr('неожиданный знак «' + k.v + '»');
  }
}
const plParseExpr = src => { const p = new PlParser(plLex(src)); if (p.done) throw new PlErr('пустое выражение'); const e = p.list(); if (!p.done) throw new PlErr('лишнее: «' + p.t[p.p].v + '»'); return e; };

/* оператор присваивания или обычное выражение */
function plParseStmt(src) {
  const toks = plLex(src);
  if (!toks.length) return { k: 'nop' };
  const first = toks[0].t === 'name' ? toks[0].v : '';
  if (['pass', 'global', 'nonlocal', 'import', 'from'].includes(first)) return { k: 'nop' };
  if (['if', 'for', 'while', 'def', 'class', 'with', 'try', 'return', 'lambda', 'del', 'assert', 'raise'].includes(first)) throw new PlErr('«' + first + '» в одной строке не поддерживается');
  let depth = 0; const eq = []; let aug = -1;
  toks.forEach((k, i) => {
    if (k.t !== 'op') return;
    if ('([{'.includes(k.v)) depth++; else if (')]}'.includes(k.v)) depth--;
    else if (!depth && k.v === '=') eq.push(i);
    else if (!depth && PL_AUG.has(k.v) && aug < 0) aug = i;
  });
  const sub = (a, b) => { const p = new PlParser(toks.slice(a, b)); const e = p.list(); if (!p.done) throw new PlErr('лишнее в выражении'); return e; };
  if (eq.length) {
    const parts = []; let s = 0; for (const i of eq) { parts.push(sub(s, i)); s = i + 1; }
    return { k: 'assign', targets: parts, value: sub(s, toks.length) };
  }
  if (aug >= 0) return { k: 'aug', op: toks[aug].v.slice(0, -1), target: sub(0, aug), value: sub(aug + 1, toks.length) };
  return { k: 'expr', e: sub(0, toks.length) };
}

/* ---------- значения и операции ---------- */
function plTruthy(v) {
  if (v === null || v === undefined || v === false || v === 0 || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  if (v instanceof Set || v instanceof Map) return v.size > 0;
  return true;
}
function plEq(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if ((typeof a === 'boolean' || typeof a === 'number') && (typeof b === 'boolean' || typeof b === 'number')) return Number(a) === Number(b);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => plEq(x, b[i]));
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every(x => b.has(x));
  return false;
}
function plStr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : (v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan');
  if (Array.isArray(v)) return '[' + v.map(plRepr).join(', ') + ']';
  if (v instanceof Set) return v.size ? '{' + [...v].map(plRepr).join(', ') + '}' : 'set()';
  if (v instanceof Map) return '{' + [...v].map(([k, x]) => plRepr(k) + ': ' + plRepr(x)).join(', ') + '}';
  if (typeof v === 'function') return '<функция>';
  return '<объект>';
}
const plRepr = v => typeof v === 'string' ? "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'" : plStr(v);
function plClone(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(plClone);
  if (v instanceof Set) return new Set([...v].map(plClone));
  if (v instanceof Map) return new Map([...v].map(([k, x]) => [plClone(k), plClone(x)]));
  const o = {}; for (const k of Object.keys(v)) o[k] = plClone(v[k]); return o;
}
function plFormat(fmt, arg) {
  const args = Array.isArray(arg) ? arg.slice() : [arg]; let i = 0;
  return String(fmt).replace(/%([sdif%])/g, (m, c) => {
    if (c === '%') return '%';
    const v = args[i++];
    return c === 'd' || c === 'i' ? String(Math.trunc(Number(v))) : c === 'f' ? Number(v).toFixed(6) : plStr(v);
  });
}
function plCmpVals(op, a, b) {
  if (op === '==') return plEq(a, b);
  if (op === '!=') return !plEq(a, b);
  if (op === 'is') return a === b || (a == null && b == null);
  if (op === 'is not') return !(a === b || (a == null && b == null));
  if (op === 'in' || op === 'not in') {
    let r;
    if (Array.isArray(b)) r = b.some(x => plEq(x, a));
    else if (b instanceof Set || b instanceof Map) r = b.has(a);
    else if (typeof b === 'string') r = b.includes(String(a));
    else throw new PlErr('«in» для этого значения не поддерживается');
    return op === 'in' ? r : !r;
  }
  if (a == null || b == null) { if (a == null && b == null && (op === '<=' || op === '>=')) return true; throw new PlErr('нельзя сравнить None'); }
  switch (op) { case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; }
  throw new PlErr('сравнение ' + op);
}
function plBin(op, a, b) {
  switch (op) {
    case '+':
      if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
      if (typeof a === 'string' && typeof b !== 'string') throw new PlErr('строку нельзя сложить с числом');
      if (typeof a === 'number' && typeof b === 'string') throw new PlErr('число нельзя сложить со строкой');
      return a + b;
    case '-': if (a instanceof Set && b instanceof Set) return new Set([...a].filter(x => !b.has(x))); return a - b;
    case '*':
      if (typeof a === 'string' && typeof b === 'number') return b > 0 ? a.repeat(b) : '';
      if (typeof a === 'number' && typeof b === 'string') return a > 0 ? b.repeat(a) : '';
      return a * b;
    case '/': if (b === 0) throw new PlErr('деление на ноль'); return a / b;
    case '//': if (b === 0) throw new PlErr('деление на ноль'); return Math.floor(a / b);
    case '%': if (typeof a === 'string') return plFormat(a, b); if (b === 0) throw new PlErr('деление на ноль'); return ((a % b) + b) % b;
    case '**': return Math.pow(a, b);
    case '|': if (a instanceof Set && b instanceof Set) return new Set([...a, ...b]); return a | b;
    case '&': if (a instanceof Set && b instanceof Set) return new Set([...a].filter(x => b.has(x))); return a & b;
    case '^': return a ^ b;
  }
  throw new PlErr('операция ' + op);
}
function plMethod(o, name, args) {
  if (o instanceof Set) {
    switch (name) {
      case 'add': o.add(args[0]); return null;
      case 'remove': if (!o.delete(args[0])) throw new PlErr('нет такого значения'); return null;
      case 'discard': o.delete(args[0]); return null;
      case 'clear': o.clear(); return null;
      case 'update': for (const x of args[0] || []) o.add(x); return null;
      case 'union': return new Set([...o, ...(args[0] || [])]);
      case 'issubset': return [...o].every(x => args[0].has(x));
      case 'copy': return new Set(o);
    }
  } else if (Array.isArray(o)) {
    switch (name) {
      case 'append': o.push(args[0]); return null;
      case 'extend': for (const x of args[0] || []) o.push(x); return null;
      case 'insert': o.splice(args[0], 0, args[1]); return null;
      case 'pop': return args.length ? o.splice(args[0], 1)[0] : o.pop();
      case 'remove': { const i = o.findIndex(x => plEq(x, args[0])); if (i < 0) throw new PlErr('нет такого значения'); o.splice(i, 1); return null; }
      case 'index': return o.findIndex(x => plEq(x, args[0]));
      case 'count': return o.filter(x => plEq(x, args[0])).length;
      case 'copy': return o.slice();
      case 'clear': o.length = 0; return null;
      case 'sort': o.sort((a, b) => a < b ? -1 : a > b ? 1 : 0); return null;
      case 'reverse': o.reverse(); return null;
    }
  } else if (o instanceof Map) {
    switch (name) {
      case 'get': return o.has(args[0]) ? o.get(args[0]) : (args.length > 1 ? args[1] : null);
      case 'keys': return [...o.keys()];
      case 'values': return [...o.values()];
      case 'items': return [...o].map(([k, v]) => [k, v]);
      case 'pop': { const v = o.has(args[0]) ? o.get(args[0]) : (args.length > 1 ? args[1] : null); o.delete(args[0]); return v; }
      case 'setdefault': if (!o.has(args[0])) o.set(args[0], args.length > 1 ? args[1] : null); return o.get(args[0]);
      case 'update': for (const [k, v] of (args[0] instanceof Map ? args[0] : [])) o.set(k, v); return null;
      case 'clear': o.clear(); return null;
    }
  } else if (typeof o === 'string') {
    switch (name) {
      case 'upper': return o.toUpperCase();
      case 'lower': return o.toLowerCase();
      case 'capitalize': return o.charAt(0).toUpperCase() + o.slice(1).toLowerCase();
      case 'title': return o.toLowerCase().replace(/(^|[\s-])(\S)/g, (m, a, b) => a + b.toUpperCase());
      case 'strip': return o.trim();
      case 'lstrip': return o.trimStart();
      case 'rstrip': return o.trimEnd();
      case 'startswith': return o.startsWith(args[0]);
      case 'endswith': return o.endsWith(args[0]);
      case 'replace': return o.split(args[0]).join(args[1]);
      case 'split': return args.length && args[0] != null ? o.split(args[0]) : o.split(/\s+/).filter(Boolean);
      case 'join': return (args[0] || []).map(plStr).join(o);
      case 'isdigit': return /^\d+$/.test(o);
      case 'isalpha': return /^[\p{L}]+$/u.test(o);
      case 'find': return o.indexOf(args[0]);
      case 'count': return args[0] ? o.split(args[0]).length - 1 : 0;
      case 'format': { let i = 0; return o.replace(/\{(\d*)\}/g, (m, n) => plStr(args[n === '' ? i++ : +n])); }
    }
  }
  throw new PlErr('у значения нет метода «' + name + '»');
}
const PL_FUNCS = {
  len: v => { if (typeof v === 'string' || Array.isArray(v)) return v.length; if (v instanceof Set || v instanceof Map) return v.size; throw new PlErr('len: нет длины'); },
  int: v => { const n = typeof v === 'string' ? parseInt(v, 10) : Math.trunc(Number(v === true ? 1 : v === false ? 0 : v)); if (Number.isNaN(n)) throw new PlErr('int: не число'); return n; },
  float: v => { const n = Number(v); if (Number.isNaN(n)) throw new PlErr('float: не число'); return n; },
  str: v => plStr(v), bool: v => plTruthy(v), abs: v => Math.abs(v),
  round: (v, d) => { const k = Math.pow(10, d || 0); const r = Math.round(v * k) / k; return d ? r : Math.round(v); },
  min: (...a) => Math.min(...(a.length === 1 && Array.isArray(a[0]) ? a[0] : a)),
  max: (...a) => Math.max(...(a.length === 1 && Array.isArray(a[0]) ? a[0] : a)),
  sum: v => (v || []).reduce((x, y) => x + y, 0),
  sorted: v => [...v].sort((a, b) => a < b ? -1 : a > b ? 1 : 0),
  list: v => v == null ? [] : typeof v === 'string' ? [...v] : v instanceof Map ? [...v.keys()] : [...v],
  set: v => new Set(v == null ? [] : v), tuple: v => v == null ? [] : [...v], dict: () => new Map(),
  range: (a, b, s) => { if (b === undefined) { b = a; a = 0; } s = s || 1; const o = []; for (let i = a; s > 0 ? i < b : i > b; i += s) { o.push(i); if (o.length > 100000) break; } return o; },
  any: v => (v || []).some(plTruthy), all: v => (v || []).every(plTruthy),
  print: () => null, _: v => v,
};

/* ---------- вычисление ---------- */
function plEval(a, G) {
  switch (a.k) {
    case 'c': return a.v;
    case 'name': {
      const n = a.n;
      if (Object.prototype.hasOwnProperty.call(G.vars, n)) return G.vars[n];
      if (n in G.names) return G.names[n];
      if (n in PL_FUNCS) return PL_FUNCS[n];
      G.warn('имя «' + n + '» не определено'); return null;
    }
    case 'attr': return plAttr(plEval(a.o, G), a.n);
    case 'idx': {
      const o = plEval(a.o, G), i = plEval(a.i, G);
      if (Array.isArray(o) || typeof o === 'string') { const k = i < 0 ? o.length + i : i; if (k < 0 || k >= o.length) throw new PlErr('индекс вне списка'); return o[k]; }
      if (o instanceof Map) { if (!o.has(i)) throw new PlErr('нет ключа ' + plRepr(i)); return o.get(i); }
      throw new PlErr('индекс для этого значения не поддерживается');
    }
    case 'slice': { const o = plEval(a.o, G); if (!Array.isArray(o) && typeof o !== 'string') throw new PlErr('срез не поддерживается'); return o.slice(a.lo ? plEval(a.lo, G) : 0, a.hi ? plEval(a.hi, G) : undefined); }
    case 'call': return plCall(a, G);
    case 'un': { const x = plEval(a.x, G); return a.op === '-' ? -x : a.op === '+' ? +x : ~x; }
    case 'bin': return plBin(a.op, plEval(a.l, G), plEval(a.r, G));
    case 'cmp': {
      let l = plEval(a.first, G);
      for (const [op, e] of a.ops) { const r = plEval(e, G); if (!plCmpVals(op, l, r)) return false; l = r; }
      return true;
    }
    case 'and': { const l = plEval(a.l, G); return plTruthy(l) ? plEval(a.r, G) : l; }
    case 'or': { const l = plEval(a.l, G); return plTruthy(l) ? l : plEval(a.r, G); }
    case 'not': return !plTruthy(plEval(a.x, G));
    case 'if': return plTruthy(plEval(a.c, G)) ? plEval(a.a, G) : plEval(a.b, G);
    case 'list': case 'tuple': return a.items.map(x => plEval(x, G));
    case 'set': return new Set(a.items.map(x => plEval(x, G)));
    case 'dict': return new Map(a.pairs.map(([k, v]) => [plEval(k, G), plEval(v, G)]));
  }
  throw new PlErr('неизвестное выражение');
}
function plAttr(o, n) {
  if (o == null) throw new PlErr('у None нет «' + n + '»');
  if (typeof o === 'object' && !(o instanceof Map) && !(o instanceof Set) && !Array.isArray(o)) { const v = o[n]; return v === undefined ? null : v; }
  throw new PlErr('у значения нет «' + n + '»');
}
function plCall(a, G) {
  const args = a.a.map(x => plEval(x, G));
  if (a.f.k === 'attr') {
    const o = plEval(a.f.o, G);
    if (o instanceof Set || o instanceof Map || Array.isArray(o) || typeof o === 'string') return plMethod(o, a.f.n, args);
    const fn = plAttr(o, a.f.n);
    if (typeof fn !== 'function') throw new PlErr('«' + a.f.n + '» нельзя вызвать');
    return fn.apply(G, args);
  }
  const fn = plEval(a.f, G);
  if (typeof fn !== 'function') throw new PlErr('это нельзя вызвать');
  return fn.apply(G, args);
}
function plAssign(t, v, G) {
  if (t.k === 'name') { G.vars[t.n] = v; return; }
  if (t.k === 'attr') { const o = plEval(t.o, G); if (o && typeof o === 'object' && !(o instanceof Map) && !(o instanceof Set) && !Array.isArray(o)) { o[t.n] = v; return; } throw new PlErr('нельзя присвоить «' + t.n + '»'); }
  if (t.k === 'idx') {
    const o = plEval(t.o, G), i = plEval(t.i, G);
    if (Array.isArray(o)) { o[i < 0 ? o.length + i : i] = v; return; }
    if (o instanceof Map) { o.set(i, v); return; }
    throw new PlErr('нельзя присвоить по индексу');
  }
  if (t.k === 'tuple' || t.k === 'list') {
    const arr = [...v]; if (arr.length !== t.items.length) throw new PlErr('число значений не совпадает');
    t.items.forEach((x, i) => plAssign(x, arr[i], G)); return;
  }
  throw new PlErr('нельзя присвоить');
}
function plExec(st, G) {
  switch (st.k) {
    case 'nop': return;
    case 'expr': plEval(st.e, G); return;
    case 'assign': { const v = plEval(st.value, G); for (const t of st.targets) plAssign(t, plClone(v) === v ? v : v, G); return; }
    case 'aug': { const cur = plEval(st.target, G); plAssign(st.target, plBin(st.op, cur, plEval(st.value, G)), G); return; }
  }
}

/* ---------- 2. разбор сценария ---------- */
const PL_NOT_SPEAKER = new Set('label scene show hide play stop queue with menu jump call return if elif else while for pass python init define default image transform screen style voice window pause nvl narrator extend centered vcentered renpy translate layeredimage camera on at as behind onlayer zorder expression not rpy testcase'.split(' '));
function plStripComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '#') return s.slice(0, i);
  }
  return s;
}
/** Строка в кавычках в начале текста: { value, end } или null. */
function plStrAt(s, from = 0) {
  const q = s[from]; if (q !== '"' && q !== "'") return null;
  let out = '';
  for (let i = from + 1; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { const nx = s[i + 1]; if (nx === 'n') out += '\n'; else if (nx === 't') out += '\t'; else out += nx; i++; continue; }
    if (c === q) return { value: out, end: i + 1 };
    out += c;
  }
  return null;
}
const plUnwrapTr = s => s.replace(/(^|[^\w.])_\(\s*((["'])(?:\\.|(?!\3).)*\3)\s*\)/g, '$1$2');
function plParseSay(head) {
  const s = plUnwrapTr(head);
  const qi = s.search(/["']/); if (qi < 0) return null;
  const pre = s.slice(0, qi).trim();
  let who = '', attrs = [];
  if (pre) {
    if (!/^[A-Za-z_À-￿][\wÀ-￿]*(?:\s+[\w@.-]+)*$/.test(pre)) return null;
    const w = pre.split(/\s+/); who = w[0]; attrs = w.slice(1);
    if (PL_NOT_SPEAKER.has(who) && who !== 'centered' && who !== 'extend' && who !== 'vcentered') return null;
  }
  const str = plStrAt(s, qi); if (!str) return null;
  const rest = s.slice(str.end).trim();
  if (rest && !/^(?:with\s+[\w.]+\s*)?(?:id\s+\w+\s*)?(?:nointeract\s*)?(?:\(.*\)\s*)?$/.test(rest)) return null;
  return { who, attrs, text: str.value };
}
function plParseShow(kw, rest0) {
  let rest = rest0.trim(), trans = null, m;
  if ((m = /\s+with\s+([A-Za-z_][\w.]*(?:\([^)]*\))?)\s*$/.exec(' ' + rest))) { trans = m[1].replace(/\(.*$/, ''); rest = (' ' + rest).slice(0, m.index).trim(); }
  if (/^(?:text|screen|layer)\b/.test(rest)) return { k: 'nop' };
  let expr = null;
  if ((m = /^expression\s+(["'])((?:\\.|(?!\1).)*)\1/.exec(rest))) { expr = m[2]; rest = rest.slice(m[0].length).trim(); rest = 'expr ' + rest; }
  const stop = /\b(?:at|as|behind|onlayer|zorder)\b/;
  const i = rest.search(stop);
  const namePart = (i < 0 ? rest : rest.slice(0, i)).trim();
  let words = namePart.split(/\s+/).filter(Boolean), tag = null, at = [];
  if (expr != null) words = [expr];
  const tail = i < 0 ? '' : rest.slice(i);
  if ((m = /\bas\s+([A-Za-z_]\w*)/.exec(tail))) tag = m[1];
  if ((m = /\bat\s+(.+?)(?=\s+(?:as|behind|onlayer|zorder)\b|$)/.exec(tail))) at = m[1].split(',').map(x => x.trim().replace(/\(.*$/, '')).filter(Boolean);
  return { k: kw, words, tag, at, trans, expr: expr != null };
}
function plStmtFrom(head, L, ctx) {
  if (head[0] === '$') return { k: 'py', code: head.slice(1).trim(), line: L.no };
  const m = /^([A-Za-z_]\w*)\b\s*(.*)$/.exec(head);
  const kw = m ? m[1] : '', rest = m ? m[2] : '';
  switch (kw) {
    case 'jump': { const e = /^expression\s+(.+)$/.exec(rest); return e ? { k: 'jump', expr: plParseSafe(e[1], ctx, L) } : { k: 'jump', target: rest.trim() }; }
    case 'call': {
      if (/^screen\b/.test(rest)) return { k: 'nop' };
      const e = /^expression\s+(.+?)(?:\s+pass\b.*)?$/.exec(rest);
      if (e) return { k: 'call', expr: plParseSafe(e[1].replace(/\s+from\s+\w+\s*$/, ''), ctx, L) };
      const t = /^([A-Za-z_][\w.]*)/.exec(rest); return t ? { k: 'call', target: t[1] } : { k: 'nop' };
    }
    case 'return': return { k: 'return' };
    case 'pass': return { k: 'nop' };
    case 'scene': case 'show': case 'hide': {
      if (kw === 'hide') { const w = rest.trim().split(/\s+/)[0]; const wm = /\bwith\s+([\w.]+)\s*$/.exec(rest); return w ? { k: 'hide', tag: w, trans: wm ? wm[1] : null } : { k: 'nop' }; }
      if (kw === 'scene' && !rest.trim()) return { k: 'scene', words: [], at: [], trans: null };
      return plParseShow(kw, rest);
    }
    case 'with': { const t = rest.trim().replace(/\(.*$/, ''); return t && t !== 'None' ? { k: 'with', trans: t } : { k: 'nop' }; }
    case 'play': case 'queue': {
      const p = /^(\w+)\s+(?:\[\s*)?(["'])((?:\\.|(?!\2).)*)\2(.*)$/.exec(rest);
      return p ? { k: 'play', ch: p[1], file: p[3], loop: !/\bnoloop\b/.test(p[4]), queue: kw === 'queue' } : { k: 'nop' };
    }
    case 'stop': { const p = /^(\w+)/.exec(rest); return p ? { k: 'stop', ch: p[1] } : { k: 'nop' }; }
    case 'voice': { const s = plStrAt(rest.trim()); return s ? { k: 'play', ch: 'voice', file: s.value, loop: false } : { k: 'nop' }; }
    case 'pause': { const n = rest.trim(); return { k: 'pause', secs: n ? plParseSafe(n, ctx, L) : null }; }
    case 'window': case 'nvl': case 'camera': case 'on': case 'rpy': return { k: 'nop' };
    case 'define': case 'default': return plDefine(kw, rest, ctx, L);
    case 'image': return plImage(rest, ctx);
    case 'python': return { k: 'nop' };
  }
  const say = plParseSay(head);
  if (say) return { k: 'say', who: say.who, text: say.text, line: L.no };
  return { k: 'unknown', text: head, line: L.no };
}
function plParseSafe(src, ctx, L) {
  try { return plParseExpr(src); } catch (e) { ctx.warn('строка ' + (L ? L.no : '?') + ': ' + (e.message || e)); return null; }
}
function plDefine(kw, rest, ctx, L) {
  const m = /^(?:-?\d+\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/.exec(rest);
  if (!m) return { k: 'nop' };
  const name = m[1], expr = m[2];
  const ch = /^(?:renpy\.)?(?:Dynamic)?Character\s*\(([\s\S]*)\)\s*$/.exec(expr);
  if (ch) {
    const body = ch[1];
    const nm = plStrAt(plUnwrapTr(body).trim());
    const col = /\bcolor\s*=\s*(["'])([^"']+)\1/.exec(body), wc = /\bwhat_color\s*=\s*(["'])([^"']+)\1/.exec(body);
    ctx.chars.set(name, { name: nm ? nm.value : (/^\s*None\b/.test(body) ? '' : name), color: col ? col[2] : '', whatColor: wc ? wc[2] : '' });
    return { k: 'nop' };
  }
  if (name === 'persistent.endings' || name.startsWith('config.') || name.startsWith('gui.') || name.startsWith('preferences.') || name.startsWith('build.')) return { k: 'nop' };
  const ast = plParseSafe(expr, ctx, L);
  return ast ? { k: 'init', name, ast, once: kw === 'default' } : { k: 'nop' };
}
function plImage(rest, ctx) {
  const m = /^([^=]+?)\s*=\s*(.+)$/.exec(rest);
  if (!m) return { k: 'nop' };
  const name = m[1].trim().replace(/\s+/g, ' '), ex = m[2].trim();
  let def, s;
  if ((s = plStrAt(ex)) && s.end === ex.length) def = /^#[0-9a-fA-F]{3,8}$/.test(s.value) ? { kind: 'solid', color: s.value } : { kind: 'file', path: s.value };
  else {
    const sol = /Solid\(\s*(["'])([^"']+)\1([^)]*)\)/.exec(ex), txt = /Text\(\s*(["'])((?:\\.|(?!\1).)*)\1/.exec(ex);
    if (sol && txt) def = { kind: 'ph', color: sol[2], label: txt[2].replace(/\\n/g, '\n'), sprite: /xsize\s*=/.test(sol[3]) };
    else if (sol) def = { kind: 'solid', color: sol[2] };
    else def = { kind: 'ph', color: null, label: name, sprite: null };
  }
  def.name = name;
  ctx.images.set(name, def);
  return { k: 'nop' };
}

/** Разбор всех файлов: { labels, images, chars, inits, warns } */
function plParseScript(files) {
  const prog = { labels: new Map(), images: new Map(), chars: new Map(), inits: [], warns: [] };
  const ctx = { warn: m => prog.warns.push(m), chars: prog.chars, images: prog.images };
  for (const f of files) {
    const lines = [];
    String(f.text || '').replace(/\r\n?/g, '\n').split('\n').forEach((raw, i) => {
      const exp = raw.replace(/\t/g, '    ');
      const body = plStripComment(exp).replace(/\s+$/, '');
      if (!body.trim()) return;
      const ind = body.length - body.trimStart().length;
      let head = body.trim(), colon = false;
      if (head.endsWith(':')) { colon = true; head = head.slice(0, -1).trimEnd(); }
      lines.push({ ind, head, colon, no: i + 1, file: f.path });
    });
    const pos = { i: 0 };
    const top = plBlock(lines, pos, 0, ctx, prog, true);
    for (const s of top) if (s.k === 'init') prog.inits.push(s);
  }
  for (const nm of ['black', 'white']) if (!prog.images.has(nm)) prog.images.set(nm, { kind: 'solid', color: nm === 'black' ? '#000' : '#fff', name: nm });
  return prog;
}
function plBlock(lines, pos, indent, ctx, prog, topLevel, mode) {
  const out = [];
  let prevLabel = null;
  while (pos.i < lines.length) {
    const L = lines[pos.i];
    if (L.ind < indent) break;
    if (L.ind > indent) { pos.i++; continue; }
    pos.i++;
    let body = null;
    const child = () => { const nx = lines[pos.i]; return nx && nx.ind > L.ind ? nx.ind : -1; };
    const kwm = /^([A-Za-z_]\w*)\b\s*(.*)$/.exec(L.head);
    const kw = kwm ? kwm[1] : '', rest = kwm ? kwm[2] : '';
    if (L.colon && kw === 'label') {
      const ci = child(); body = ci < 0 ? [] : plBlock(lines, pos, ci, ctx, prog, false);
      const nm = /^([A-Za-z_][\w.]*)/.exec(rest);
      if (nm) {
        const entry = { name: nm[1], body, next: null, file: L.file };
        if (prog.labels.has(nm[1])) ctx.warn('метка «' + nm[1] + '» объявлена дважды');
        prog.labels.set(nm[1], entry);
        if (topLevel) { if (prevLabel) prevLabel.next = nm[1]; prevLabel = entry; }
        else out.push({ k: 'block', body });
      }
      continue;
    }
    if (topLevel && !(kw === 'define' || kw === 'default' || kw === 'image' || kw === 'init' || kw === 'translate' || kw === 'screen' || kw === 'style' || kw === 'transform' || kw === 'python' || kw === 'label')) prevLabel = null;
    if (L.colon && (kw === 'init' || kw === 'screen' || kw === 'style' || kw === 'transform' || kw === 'translate' || kw === 'layeredimage' || kw === 'testcase')) { plSkip(lines, pos, L.ind); continue; }
    if (L.colon && kw === 'python') { out.push(plPyBlock(lines, pos, L, ctx)); continue; }
    if (L.colon && kw === 'menu') { out.push(plParseMenu(lines, pos, L, ctx, prog)); continue; }
    if (L.colon && (kw === 'if' || kw === 'while')) {
      const ci = child(); body = ci < 0 ? [] : plBlock(lines, pos, ci, ctx, prog, false);
      const cond = plParseSafe(rest, ctx, L);
      if (kw === 'while') out.push({ k: 'while', cond, body }); else out.push({ k: 'if', branches: [{ cond, body }], other: null });
      continue;
    }
    if (L.colon && (kw === 'elif' || kw === 'else')) {
      const ci = child(); body = ci < 0 ? [] : plBlock(lines, pos, ci, ctx, prog, false);
      const prev = out[out.length - 1];
      if (!prev || prev.k !== 'if') { ctx.warn('строка ' + L.no + ': «' + kw + '» без «if»'); continue; }
      if (kw === 'elif') prev.branches.push({ cond: plParseSafe(rest, ctx, L), body }); else prev.other = body;
      continue;
    }
    if (L.colon) { plSkip(lines, pos, L.ind); if (/^(?:show|scene)\b/.test(L.head)) out.push(plStmtFrom(L.head, L, ctx)); else if (/^image\b/.test(L.head)) plStmtFrom(L.head.replace(/:$/, '') + ' = ""', L, ctx); continue; }
    if (L.head === 'else' || L.head === 'pass') continue;
    const st = plStmtFrom(L.head, L, ctx);
    if (st.k !== 'nop') out.push(st);
  }
  return out;
}
function plSkip(lines, pos, ind) { while (pos.i < lines.length && lines[pos.i].ind > ind) pos.i++; }
function plPyBlock(lines, pos, L, ctx) {
  const stmts = [];
  while (pos.i < lines.length && lines[pos.i].ind > L.ind) {
    const l = lines[pos.i++];
    try { stmts.push(plParseStmt(l.head + (l.colon ? ':' : ''))); } catch (e) { ctx.warn('строка ' + l.no + ': ' + (e.message || e)); }
  }
  return { k: 'pyblock', stmts };
}
function plParseMenu(lines, pos, L, ctx, prog) {
  const menu = { k: 'menu', prompt: null, items: [] };
  const ci = pos.i < lines.length && lines[pos.i].ind > L.ind ? lines[pos.i].ind : -1;
  if (ci < 0) return menu;
  while (pos.i < lines.length) {
    const C = lines[pos.i];
    if (C.ind < ci) break;
    if (C.ind > ci) { pos.i++; continue; }
    pos.i++;
    const s = plStrAt(C.head);
    if (C.colon && s) {
      const cm = /^\s*(?:if\s+(.+))?$/.exec(C.head.slice(s.end));
      const bi = pos.i < lines.length && lines[pos.i].ind > C.ind ? lines[pos.i].ind : -1;
      const body = bi < 0 ? [] : plBlock(lines, pos, bi, ctx, prog, false);
      menu.items.push({ text: s.value, cond: cm && cm[1] ? plParseSafe(cm[1], ctx, C) : null, condSrc: cm && cm[1] ? cm[1].trim() : '', body });
      continue;
    }
    if (C.colon) { plSkip(lines, pos, C.ind); continue; }
    if (/^(?:set|with)\b/.test(C.head)) continue;
    const say = plParseSay(C.head);
    if (say && !menu.prompt) menu.prompt = { who: say.who, text: say.text };
  }
  return menu;
}

/* ---------- 3. текст реплик ---------- */
/** [выражения] внутри текста; «[[» — просто «[». */
function plInterp(text, G) {
  let out = '', i = 0; const s = String(text);
  while (i < s.length) {
    const c = s[i];
    if (c === '[') {
      if (s[i + 1] === '[') { out += '[\u0001'; i += 2; continue; }
      let d = 1, j = i + 1;
      while (j < s.length && d) { if (s[j] === '[') d++; else if (s[j] === ']') d--; j++; }
      if (d) { out += c; i++; continue; }
      const inner = s.slice(i + 1, j - 1).replace(/![a-z]+$/i, '').trim();
      let v;
      try { v = plStr(plEval(plParseExpr(inner), G)); } catch (e) { G.warn('в тексте «[' + inner + ']»: ' + (e.message || e)); v = '[' + inner + ']'; }
      out += v; i = j; continue;
    }
    out += c; i++;
  }
  return out.replace(/\[\u0001/g, '[');
}
/** Текст с тегами Ren'Py → части { t, b, i, u, s, color, size, hl, br }. «{{» — просто «{». */
function plRich(text) {
  const segs = []; const st = { b: 0, i: 0, u: 0, s: 0, color: [], size: [], hl: [] };
  const push = (t, br) => { if (!t && !br) return; segs.push({ t: t || '', br: !!br, b: st.b > 0, i: st.i > 0, u: st.u > 0, s: st.s > 0, color: st.color.length ? st.color[st.color.length - 1] : '', size: st.size.length ? st.size[st.size.length - 1] : '', hl: st.hl.length ? st.hl[st.hl.length - 1] : '' }); };
  const s = String(text).replace(/\{\{/g, '\u0002');
  let buf = '', i = 0, nw = false;
  while (i < s.length) {
    const c = s[i];
    if (c === '{') {
      const j = s.indexOf('}', i);
      if (j < 0) { buf += c; i++; continue; }
      const tag = s.slice(i + 1, j); i = j + 1;
      const m = /^(\/?)([a-z]+)(?:=(.*))?$/i.exec(tag);
      if (!m) { buf += '{' + tag + '}'; continue; }
      const close = !!m[1], name = m[2].toLowerCase(), arg = m[3];
      if (name === 'nw') { nw = true; continue; }
      if (name === 'p' || name === 'w' || name === 'fast' || name === 'cps' || name === 'k' || name === 'alpha' || name === 'font' || name === 'a' || name === 'art' || name === 'plain' || name === 'rb' || name === 'rt' || name === 'image' || name === 'vspace' || name === 'space') {
        if (name === 'p') { push(buf); buf = ''; push('', true); }
        continue;
      }
      if (!['b', 'i', 'u', 's', 'color', 'size', 'hl'].includes(name)) continue;
      push(buf); buf = '';
      if (['b', 'i', 'u', 's'].includes(name)) st[name] += close ? -1 : 1;
      else if (close) st[name].pop();
      else st[name].push(arg || '');
      if (st.b < 0) st.b = 0; if (st.i < 0) st.i = 0; if (st.u < 0) st.u = 0; if (st.s < 0) st.s = 0;
      continue;
    }
    if (c === '\n') { push(buf); buf = ''; push('', true); i++; continue; }
    buf += c; i++;
  }
  push(buf);
  for (const sg of segs) sg.t = sg.t.replace(/\u0002/g, '{');
  segs.nw = nw;
  return segs;
}
const plPlain = segs => segs.map(x => x.br ? ' ' : x.t).join('');

/* ---------- 4. игра ---------- */
const PL_HUES = ['#3b4a6b', '#4a3b6b', '#3b6b5a', '#6b4a3b', '#5a3b4a', '#3b5a6b', '#55603b', '#6b3b3b'];
const PL_POS = { left: 22, center: 50, right: 78, truecenter: 50, leftish: 30, rightish: 70, offscreenleft: -20, offscreenright: 120, topleft: 22, topright: 78 };

class PlGame {
  /** prog — результат plParseScript; opt: { chars, endings:{list,rules}, persist:Set, maxSteps } */
  constructor(prog, opt) {
    opt = opt || {};
    this.prog = prog;
    this.images = new Map(prog.images);
    this.persistent = Object.assign(Object.create(null), { endings: opt.persist || new Set() });
    this.endingsData = opt.endings || { list: [], rules: {} };
    this.maxSteps = opt.maxSteps || 200000;
    this.warns = []; this.warnSet = new Set();
    const G = this;
    this.names = {
      persistent: this.persistent,
      renpy: {
        random: { randint: (a, b) => a + Math.floor(Math.random() * (b - a + 1)), random: () => Math.random(), choice: l => l[Math.floor(Math.random() * l.length)] },
        notify: m => { G.notices.push({ type: 'notify', text: plStr(m) }); return null; },
        pause: () => null, quit: () => { G.quit = true; return null; },
        has_label: l => G.prog.labels.has(l), restart_interaction: () => null, block_rollback: () => null,
        music: { play: () => null, stop: () => null }, sound: { play: () => null, stop: () => null },
      },
      is_unlocked: key => { const r = G.endingsData.rules[key]; if (!r) return true; return r.pool.filter(k => G.persistent.endings.has(k)).length >= r.need; },
      reach_ending: key => { if (!G.persistent.endings.has(key)) { G.persistent.endings.add(key); const e = G.endingsData.list.find(x => x.key === key); G.notices.push({ type: 'ending', key, text: e ? e.title : key }); } return null; },
      endings_count: () => G.persistent.endings.size,
      endings_total: () => G.endingsData.list.length,
    };
    this.reset();
  }
  warn(msg) {
    const m = (this.curLabel ? '[' + this.curLabel + '] ' : '') + msg;
    if (this.warnSet.has(m)) return; this.warnSet.add(m); this.warns.push(m);
  }
  /** Новая игра: переменные по умолчанию, пустой экран. */
  reset() {
    this.vars = {}; this.frames = []; this.hist = []; this.log = [];
    this.disp = { layers: [], music: null };
    this.notices = []; this.fx = []; this.trans = null; this.quit = false; this.curLabel = ''; this.lastSay = null; this.over = false; this.pend = null;
    for (const s of this.prog.inits) {
      try {
        const v = plEval(s.ast, this);
        if (s.once && Object.prototype.hasOwnProperty.call(this.vars, s.name)) continue;
        plAssign(this.lhs(s.name), v, this);
      } catch (e) { this.warn('значение «' + s.name + '» не вычислено: ' + (e.message || e)); }
    }
  }
  lhs(name) { const p = name.split('.'); let t = { k: 'name', n: p[0] }; for (const x of p.slice(1)) t = { k: 'attr', o: t, n: x }; return t; }
  begin(label) {
    this.reset();
    const l = this.prog.labels.get(label || 'start');
    if (!l) { this.over = true; return { type: 'error', text: 'Нет метки «' + (label || 'start') + '»' }; }
    this.frames = [{ body: l.body, i: 0, base: true, label: l.name, next: l.next }];
    this.curLabel = l.name;
    return this.run();
  }
  snap() { return { frames: this.frames.map(f => ({ body: f.body, i: f.i, base: f.base, label: f.label, next: f.next })), vars: plClone(this.vars), disp: plClone(this.disp), logLen: this.log.length, lastSay: this.lastSay, curLabel: this.curLabel }; }
  restore(s) {
    this.frames = s.frames.map(f => ({ body: f.body, i: f.i, base: f.base, label: f.label, next: f.next }));
    this.vars = plClone(s.vars); this.disp = plClone(s.disp); this.log.length = s.logLen; this.lastSay = s.lastSay; this.curLabel = s.curLabel;
    this.over = false; this.pend = null; this.notices = []; this.fx = []; this.trans = null;
  }
  get canBack() { return this.hist.length > (this.pend && (this.pend.type === 'end' || this.pend.type === 'error') ? 0 : 1); }
  back() {
    if (!this.canBack) return null;
    if (!(this.pend && (this.pend.type === 'end' || this.pend.type === 'error'))) this.hist.pop();   // текущее событие снова появится при повторе
    const s = this.hist.pop(); this.restore(s);
    return this.run();
  }
  /** Переход на метку без сброса переменных (кнопка «с блока»). */
  startAt(label) {
    const l = this.prog.labels.get(label); if (!l) return { type: 'error', text: 'Нет метки «' + label + '»' };
    this.frames = [{ body: l.body, i: 0, base: true, label: l.name, next: l.next }]; this.curLabel = l.name; this.over = false; this.pend = null;
    return this.run();
  }
  advance() { return this.run(); }
  choose(idx) {
    const p = this.pend; if (!p || p.type !== 'menu') return this.run();
    const it = p.stmt.items[idx]; if (!it) return this.run();
    this.pend = null;
    const f = this.frames[this.frames.length - 1];
    f.i++;
    if (it.body.length) this.frames.push({ body: it.body, i: 0, base: false });
    this.log.push({ who: '', text: it.text, choice: true });
    return this.run();
  }
  eval(ast) { return plEval(ast, this); }
  truthy(ast) { if (!ast) return false; try { return plTruthy(plEval(ast, this)); } catch (e) { this.warn('условие не вычислено: ' + (e.message || e)); return false; } }
  popBase() {
    while (this.frames.length) { const f = this.frames.pop(); if (f.base) return f; }
    return null;
  }
  interp(s) { return plInterp(s, this); }
  fin(ev) {
    ev.label = this.curLabel; ev.trans = this.trans; ev.fx = this.fx; ev.notices = this.notices;
    this.trans = null; this.fx = []; this.notices = []; this.pend = ev;
    return ev;
  }
  run() {
    let steps = 0;
    for (; ;) {
      if (this.quit) { this.over = true; return this.fin({ type: 'end' }); }
      if (++steps > this.maxSteps) { this.over = true; return this.fin({ type: 'error', text: 'Сценарий зациклился: больше ' + this.maxSteps + ' действий подряд без реплики' }); }
      const f = this.frames[this.frames.length - 1];
      if (!f) { this.over = true; return this.fin({ type: 'end' }); }
      if (f.i >= f.body.length) {
        this.frames.pop();
        if (f.base && f.next) { const l = this.prog.labels.get(f.next); if (l) { this.frames.push({ body: l.body, i: 0, base: true, label: l.name, next: l.next }); this.curLabel = l.name; } }
        else if (f.base) { const b = this.baseLabel(); if (b) this.curLabel = b; }
        continue;
      }
      const s = f.body[f.i];
      try {
        const ev = this.exec(s, f);
        if (ev) return ev;
      } catch (e) {
        this.warn('строка ' + (s.line || '?') + ': ' + (e instanceof PlErr ? e.message : 'ошибка: ' + (e && e.message || e)));
        if (this.frames[this.frames.length - 1] === f && f.body[f.i] === s) f.i++;
      }
    }
  }
  baseLabel() { for (let i = this.frames.length - 1; i >= 0; i--) if (this.frames[i].base) return this.frames[i].label; return ''; }
  pushBase(name) {
    const l = this.prog.labels.get(name);
    if (!l) throw new PlErr('нет метки «' + name + '»');
    this.frames.push({ body: l.body, i: 0, base: true, label: l.name, next: l.next }); this.curLabel = l.name;
  }
  /** Выполняет один оператор. Возвращает событие, если нужен ответ игрока. */
  exec(s, f) {
    switch (s.k) {
      case 'say': {
        this.hist.push(this.snap()); f.i++;
        const ch = this.prog.chars.get(s.who);
        let who = s.who === 'centered' || s.who === 'vcentered' || s.who === 'narrator' || s.who === 'extend' ? '' : (ch ? ch.name : s.who);
        if (s.who === 'extend' && this.lastSay) who = this.lastSay.who;
        who = this.interp(who);
        let text = this.interp(s.text);
        if (s.who === 'extend' && this.lastSay) text = this.lastSay.text + text;
        const rich = plRich(text);
        const ev = { type: 'say', who, color: ch ? ch.color : '', whatColor: ch ? ch.whatColor : '', rich, text: plPlain(rich), centered: s.who === 'centered' || s.who === 'vcentered', noWait: !!rich.nw, tag: s.who };
        this.lastSay = { who, text };
        this.log.push({ who, text: ev.text, color: ev.color, label: this.curLabel });
        return this.fin(ev);
      }
      case 'menu': {
        this.hist.push(this.snap());
        const items = s.items.map((it, idx) => ({ idx, text: plPlain(plRich(this.interp(it.text))), rich: plRich(this.interp(it.text)), ok: !it.cond || this.truthy(it.cond), cond: it.condSrc }));
        if (!items.some(x => x.ok)) { this.warn('в меню нет доступных выборов — меню пропущено'); this.hist.pop(); f.i++; return null; }
        let prompt = null;
        if (s.prompt) { const ch = this.prog.chars.get(s.prompt.who); const rich = plRich(this.interp(s.prompt.text)); prompt = { who: ch ? this.interp(ch.name) : this.interp(s.prompt.who), rich, text: plPlain(rich), color: ch ? ch.color : '' }; }
        const ev = { type: 'menu', items, prompt, stmt: s };
        return this.fin(ev);
      }
      case 'pause': {
        let secs = null;
        if (s.secs) { try { secs = Number(this.eval(s.secs)); } catch (e) { secs = null; } }
        this.hist.push(this.snap()); f.i++;
        return this.fin({ type: 'pause', secs: Number.isFinite(secs) ? secs : null });
      }
      case 'py': {
        if (!s.ast) s.ast = plParseStmt(s.code);
        f.i++; plExec(s.ast, this); return null;
      }
      case 'pyblock': { f.i++; for (const st of s.stmts) plExec(st, this); return null; }
      case 'if': {
        f.i++;
        for (const br of s.branches) if (this.truthy(br.cond)) { if (br.body.length) this.frames.push({ body: br.body, i: 0, base: false }); return null; }
        if (s.other && s.other.length) this.frames.push({ body: s.other, i: 0, base: false });
        return null;
      }
      case 'while': {
        if (this.truthy(s.cond)) { this.frames.push({ body: s.body, i: 0, base: false }); } else f.i++;
        return null;
      }
      case 'block': { f.i++; if (s.body.length) this.frames.push({ body: s.body, i: 0, base: false }); return null; }
      case 'jump': {
        const name = s.expr ? plStr(this.eval(s.expr)) : s.target;
        this.popBase(); this.pushBase(name); return null;
      }
      case 'call': {
        const name = s.expr ? plStr(this.eval(s.expr)) : s.target;
        f.i++; this.pushBase(name); return null;
      }
      case 'return': { const b = this.popBase(); if (b) { const lb = this.baseLabel(); if (lb) this.curLabel = lb; } return null; }
      case 'scene': {
        f.i++;
        this.disp.layers = [];
        if (s.words.length) this.showImage(s, true);
        if (s.trans) this.trans = s.trans;
        return null;
      }
      case 'show': { f.i++; this.showImage(s, false); if (s.trans) this.trans = s.trans; return null; }
      case 'hide': { f.i++; this.disp.layers = this.disp.layers.filter(l => l.tag !== s.tag); if (s.trans) this.trans = s.trans; return null; }
      case 'with': { f.i++; this.trans = s.trans; return null; }
      case 'play': {
        f.i++;
        if (s.ch === 'music') this.disp.music = { file: s.file, loop: s.loop };
        else this.fx.push({ ch: s.ch, file: s.file });
        return null;
      }
      case 'stop': { f.i++; if (s.ch === 'music') this.disp.music = null; return null; }
      case 'init': { f.i++; return null; }
      case 'nop': f.i++; return null;
      default: this.warn('строка ' + (s.line || '?') + ': не понимаю «' + String(s.text || s.k).slice(0, 60) + '» — пропущено'); f.i++; return null;
    }
  }
  resolveImage(words, isScene) {
    const key = words.join(' ');
    if (this.images.has(key)) return key;
    const tag = words[0], attrs = words.slice(1);
    const cands = [...this.images.keys()].filter(k => k.split(' ')[0] === tag);
    const ok = cands.filter(k => { const a = k.split(' ').slice(1); return attrs.every(x => a.includes(x)); });
    if (ok.length) {
      if (!attrs.length) { const cur = this.disp.layers.find(l => l.tag === tag); if (cur && ok.includes(cur.key)) return cur.key; }
      return ok.sort((a, b) => a.split(' ').length - b.split(' ').length)[0];
    }
    const def = { kind: 'ph', color: null, label: key, sprite: !isScene, name: key, auto: true };
    this.images.set(key, def); this.warn('нет картинки «' + key + '» — показана заглушка');
    return key;
  }
  showImage(s, isScene) {
    if (!s.words.length) return;
    let key;
    if (s.expr) { key = s.words[0]; if (!this.images.has(key)) this.images.set(key, { kind: 'file', path: key, name: key }); }
    else key = this.resolveImage(s.words, isScene);
    const tag = s.tag || s.words[0];
    const layer = { tag, key, at: s.at && s.at.length ? s.at[0] : '', scene: !!isScene };
    const i = this.disp.layers.findIndex(l => l.tag === tag);
    if (i >= 0) { if (!layer.at) layer.at = this.disp.layers[i].at; this.disp.layers[i] = layer; } else this.disp.layers.push(layer);
  }
  /** Какие переменные показывать автору (без служебных). */
  userVars() { return Object.keys(this.vars).filter(k => !k.startsWith('_')).sort().map(k => [k, this.vars[k]]); }
}
function plPhColor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return PL_HUES[h % PL_HUES.length]; }

'use strict';
/* ====== Анализ сюжета без ИИ: слова и время чтения, пути до блоков, баланс веток, значения переменных, проверка ошибок ======
   Всё считается по карте и скриптам глав. Ничего не угадывается «на слух»: если программа не может разобрать условие или значение,
   она так и говорит («неизвестно») и не делает вид, что знает. Результаты кэшируются по DATA_VER (меняется при каждой правке). */

Object.assign(D, {
  'an.min': ['{0} мин', '{0} min'], 'an.h': ['{0} ч {1} мин', '{0} h {1} min'], 'an.lt1': ['< 1 мин', '< 1 min'],
  'an.w': ['{0} сл.', '{0} w.'],
  'an.yes': ['да', 'yes'], 'an.no': ['нет', 'no'], 'an.both': ['да или нет', 'yes or no'], 'an.any': ['любое', 'any'], 'an.unknown': ['неизвестно', 'unknown'],
  'an.dead.why': ['{0}: сюда к этому моменту не дойти ({1})', '{0}: unreachable at this point ({1})'],
  'an.why.num': ['{0} может быть от {1} до {2}', '{0} can be {1} to {2}'], 'an.why.flag': ['{0} не может быть {1}', '{0} cannot be {1}'], 'an.why.choice': ['{0} не может быть «{1}»', '{0} cannot be “{1}”'],
});

/* ---------- слова и время ---------- */
const rdWpm = () => clamp(+S.readWpm || 200, 60, 600);
const AN_W = new Map();
const anPlain = s => String(s || '').replace(/\{[^{}]*\}/g, '');
/** Сколько слов игрок прочтёт в главе: считаются только реплики и подписи меню, команды Ren'Py не в счёт. */
function fileWords(f) {
  const s = f.script || '', c = AN_W.get(f.id);
  if (c && c.s === s) return c.w;
  let w = 0;
  const units = tlScan(tlLines(f));
  for (const u of units) if (u.sub === 'line' || u.sub === 'caption' || u.sub === 'with') w += wordCount(anPlain(u.body));
  if (!units.length) for (const raw of s.split('\n')) {               // свободный текст без разметки Ren'Py (ещё не превращённый в реплики)
    const l = raw.trim(), first = (/^[A-Za-z_]\w*/.exec(l) || [''])[0];
    if (!l || l[0] === '#' || l[0] === '$' || (first && RPY_KW.has(first))) continue;
    w += wordCount(l);
  }
  AN_W.set(f.id, { s, w });
  return w;
}
const nodeWords = n => n.files.reduce((a, f) => a + fileWords(f), 0);
function fmtDur(words) {
  const m = words / rdWpm();
  if (m < 1) return t('an.lt1');
  if (m < 60) return t('an.min', Math.round(m));
  const hh = Math.floor(m / 60), mm = Math.round(m - hh * 60);
  return mm === 60 ? t('an.h', hh + 1, 0) : t('an.h', hh, mm);
}
const fmtNum = n => Number(n).toLocaleString(S.lang === 'ru' ? 'ru-RU' : 'en-US');

/* ---------- граф ---------- */
let AN_G = null;
/** Узлы без заметок, стрелки с карты и переходы из кода. */
function anGraph() {
  if (AN_G && AN_G.ver === DATA_VER && AN_G.n === P.nodes.length) return AN_G;
  const nodes = P.nodes.filter(n => n.type !== 'note'), ids = new Set(nodes.map(n => n.id));
  const out = new Map(nodes.map(n => [n.id, []])), inn = new Map(nodes.map(n => [n.id, []]));
  const add = (from, to, e) => { if (!ids.has(from) || !ids.has(to) || from === to) return; out.get(from).push({ to, e }); inn.get(to).push({ from, e }); };
  for (const e of P.edges) add(e.from, e.to, e);
  let jl = []; try { jl = jumpAnalysis().links; } catch (x) { jl = []; }
  for (const L of jl) add(L.from, L.to, null);
  AN_G = { ver: DATA_VER, n: P.nodes.length, nodes, ids, out, inn };
  return AN_G;
}
/** С чего начинается игра: указанный стартовый блок или все блоки без входящих стрелок (кроме бонусных, открываемых отдельно). */
function anStarts(G) {
  if (P.startId && G.ids.has(P.startId)) return [P.startId];
  return G.nodes.filter(n => !G.inn.get(n.id).length && !n.unlock).map(n => n.id);
}
function anReach(G, from, skip) {
  const seen = new Set(), q = [];
  for (const s of from) if (s !== skip && !seen.has(s)) { seen.add(s); q.push(s); }
  while (q.length) { const x = q.shift(); for (const { to } of G.out.get(x) || []) if (to !== skip && !seen.has(to)) { seen.add(to); q.push(to); } }
  return seen;
}

/* ---------- пути: сколько слов до блока (минимум и максимум) ---------- */
let AN_P = null;
function anPaths() {
  const G = anGraph(), key = DATA_VER + '|' + P.nodes.length + '|' + P.startId;
  if (AN_P && AN_P.key === key) return AN_P;
  const starts = anStarts(G), wd = new Map(G.nodes.map(n => [n.id, nodeWords(n)]));
  const state = new Map(), back = new Set(), post = [];
  for (const s of starts) {
    if (state.has(s)) continue;
    const stack = [[s, 0]]; state.set(s, 1);
    while (stack.length) {
      const top = stack[stack.length - 1], outs = G.out.get(top[0]);
      if (top[1] < outs.length) {
        const ed = outs[top[1]++], st = state.get(ed.to);
        if (st === 1) back.add(top[0] + '>' + ed.to);              // стрелка назад (цикл): в подсчёте длиннейшего пути не участвует
        else if (!st) { state.set(ed.to, 1); stack.push([ed.to, 0]); }
      } else { state.set(top[0], 2); post.push(top[0]); stack.pop(); }
    }
  }
  const mn = new Map(), mx = new Map(), pmn = new Map(), pmx = new Map();   // pmn/pmx: из какого блока пришли (для показа пути на карте)
  for (const s of starts) { mn.set(s, 0); mx.set(s, 0); }
  for (let i = post.length - 1; i >= 0; i--) {
    const id = post[i]; if (!mn.has(id)) continue;
    for (const { to } of G.out.get(id)) {
      if (back.has(id + '>' + to)) continue;
      const a = mn.get(id) + wd.get(id), b = mx.get(id) + wd.get(id);
      if (!mn.has(to) || a < mn.get(to)) { mn.set(to, a); pmn.set(to, id); }
      if (!mx.has(to) || b > mx.get(to)) { mx.set(to, b); pmx.set(to, id); }
    }
  }
  AN_P = { key, G, starts, words: wd, min: mn, max: mx, pmin: pmn, pmax: pmx, back, reached: new Set(state.keys()) };
  return AN_P;
}
/** Цепочка блоков от начала игры до блока id: самая короткая ('min') или самая длинная ('max') по словам. Пусто, если блок недостижим. */
function anRoute(id, kind) {
  const A = anPaths(); if (!A.reached.has(id)) return [];
  const pr = kind === 'max' ? A.pmax : A.pmin, out = [id], seen = new Set([id]);
  for (let x = pr.get(id); x != null && !seen.has(x); x = pr.get(x)) { out.push(x); seen.add(x); }
  return out.reverse();
}

/* ---------- баланс веток ---------- */
let AN_B = null;
function anBranches() {
  const key = DATA_VER + '|' + P.nodes.length + '|' + P.startId;
  if (AN_B && AN_B.key === key) return AN_B;
  const A = anPaths(), G = A.G, w = id => A.words.get(id) || 0;
  const sumW = set => { let s = 0; for (const id of set) s += w(id); return s; };
  /* концовки */
  const ends = G.nodes.filter(n => n.type === 'ending');
  const anc = new Map();
  for (const e of ends) {                                           // предки концовки: блоки, из которых к ней можно прийти
    const seen = new Set([e.id]), q = [e.id];
    while (q.length) { const x = q.shift(); for (const { from } of G.inn.get(x)) if (!seen.has(from)) { seen.add(from); q.push(from); } }
    anc.set(e.id, seen);
  }
  const endRows = ends.map(e => {
    const only = new Set();
    for (const id of A.reached) { if (!anc.get(e.id).has(id)) continue; if (ends.every(o => o.id === e.id || !anc.get(o.id).has(id))) only.add(id); }
    const reached = A.reached.has(e.id);
    return { node: e, reached, min: reached ? A.min.get(e.id) + w(e.id) : null, max: reached ? A.max.get(e.id) + w(e.id) : null, own: sumW(only), ownNodes: only.size };
  });
  /* развилки */
  const forks = [];
  for (const n of G.nodes) {
    const outs = []; const seenTo = new Set();
    for (const o of G.out.get(n.id)) if (!seenTo.has(o.to)) { seenTo.add(o.to); outs.push(o); }
    if (outs.length < 2 || !A.reached.has(n.id)) continue;
    const sets = outs.map(o => anReach(G, [o.to], n.id));
    const opts = outs.map((o, i) => {
      const own = new Set(); for (const id of sets[i]) if (sets.every((s, j) => j === i || !s.has(id))) own.add(id);
      return { to: nodeById(o.to), edge: o.e, label: o.e ? (o.e.title || '') : '', total: sumW(sets[i]), own: sumW(own), ownNodes: own.size };
    });
    forks.push({ node: n, opts, max: Math.max(...opts.map(o => o.own)), min: Math.min(...opts.map(o => o.own)) });
  }
  forks.sort((a, b) => (b.max - b.min) - (a.max - a.min));
  AN_B = { key, ends: endRows, forks };
  return AN_B;
}

/* ---------- значения переменных ---------- */
const AN_RE_NUM = /^-?\d+(?:\.\d+)?$/;
const anTracked = () => P.vars.filter(v => /^[A-Za-z_]\w*$/.test(v.name) && !v.persist && ['flag', 'number', 'choice'].includes(v.type));   // «помнить между играми» не отслеживаем: значение может прийти из прошлой игры
const anBool = s => /^(true)$/i.test(String(s).trim());
function anInit(v) {
  const val = String(v.value == null ? '' : v.value).trim();
  if (v.type === 'flag') return anBool(val) ? { k: 'f', f: false, t: true } : { k: 'f', f: true, t: false };
  if (v.type === 'number') { const n = AN_RE_NUM.test(val) ? parseFloat(val) : 0; return { k: 'n', lo: n, hi: n }; }
  return { k: 'c', vals: new Set([val.replace(/^["']|["']$/g, '') || 'None']) };
}
const anCloneD = d => (d.k === 'c' ? { k: 'c', vals: d.vals ? new Set(d.vals) : null } : Object.assign({}, d));
const anCloneS = st => { const o = {}; for (const k of Object.keys(st)) o[k] = anCloneD(st[k]); return o; };
function anJoinD(a, b) {
  if (a.k === 'n') return { k: 'n', lo: Math.min(a.lo, b.lo), hi: Math.max(a.hi, b.hi) };
  if (a.k === 'f') return { k: 'f', f: a.f || b.f, t: a.t || b.t };
  if (!a.vals || !b.vals) return { k: 'c', vals: null };
  const u = new Set([...a.vals, ...b.vals]);
  return { k: 'c', vals: u.size > 16 ? null : u };
}
const anEqD = (a, b) => a.k === b.k && (a.k === 'n' ? a.lo === b.lo && a.hi === b.hi : a.k === 'f' ? a.f === b.f && a.t === b.t : (!a.vals && !b.vals) || (a.vals && b.vals && a.vals.size === b.vals.size && [...a.vals].every(x => b.vals.has(x))));
function anJoinS(a, b) { const o = {}; for (const k of Object.keys(a)) o[k] = b[k] ? anJoinD(a[k], b[k]) : anCloneD(a[k]); return o; }
const anEqS = (a, b) => Object.keys(a).every(k => b[k] && anEqD(a[k], b[k]));
function anWiden(old, nw) {
  for (const k of Object.keys(nw)) if (nw[k].k === 'n' && old[k]) { if (nw[k].lo < old[k].lo) nw[k].lo = -Infinity; if (nw[k].hi > old[k].hi) nw[k].hi = Infinity; }
  return nw;
}
/** Применяет одну строку Python (`$ x += 1`) к состоянию; optional — строка может и не выполниться. */
function anApplyLine(st, line, optional) {
  const m = RE_SETTER.exec(line); if (!m) return;
  const d = st[m[1]]; if (!d) return;
  const op = m[2], rhs = m[3].replace(/\s+#.*$/, '').trim();
  let nd;
  if (d.k === 'f') nd = op !== '=' ? { k: 'f', f: true, t: true } : /^True$/.test(rhs) ? { k: 'f', f: false, t: true } : /^False$/.test(rhs) ? { k: 'f', f: true, t: false } : { k: 'f', f: true, t: true };
  else if (d.k === 'n') {
    if (op === '=') nd = AN_RE_NUM.test(rhs) ? { k: 'n', lo: parseFloat(rhs), hi: parseFloat(rhs) } : { k: 'n', lo: -Infinity, hi: Infinity };
    else if (AN_RE_NUM.test(rhs)) { const x = parseFloat(rhs) * (op === '-=' ? -1 : 1); nd = { k: 'n', lo: d.lo + x, hi: d.hi + x }; }
    else nd = { k: 'n', lo: -Infinity, hi: Infinity };
  } else {
    const q = /^(["'])((?:\\.|(?!\1).)*)\1$/.exec(rhs);
    nd = op === '=' && q ? { k: 'c', vals: new Set([q[2]]) } : op === '=' && rhs === 'None' ? { k: 'c', vals: new Set(['None']) } : { k: 'c', vals: null };
  }
  st[m[1]] = optional ? anJoinD(d, nd) : nd;
}
/** Строки скрипта, которые меняют переменные: { line, opt } (opt — внутри if/меню/цикла, может не выполниться). */
const AN_SCR = new Map();
function anScriptSets(f) {
  const s = f.script || '', c = AN_SCR.get(f.id);
  if (c && c.s === s) return c.list;
  const list = [], stack = [];
  for (const raw0 of s.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')) {
    const tr = raw0.trim(); if (!tr || tr[0] === '#') continue;
    const ind = raw0.length - raw0.trimStart().length;
    while (stack.length && stack[stack.length - 1].ind >= ind) stack.pop();
    if (/:\s*(?:#.*)?$/.test(tr)) { const w = (/^[A-Za-z_]\w*/.exec(tr) || [''])[0]; stack.push({ ind, kind: w || 'choice' }); continue; }
    if (!/^\$\s*[A-Za-z_]\w*\s*(?:\+=|-=|=)(?!=)/.test(tr)) continue;
    list.push({ line: tr, opt: stack.some(x => x.kind !== 'label' && x.kind !== 'init') });
  }
  AN_SCR.set(f.id, { s, list });
  return list;
}
function anNodeApply(n, st0) {
  const st = anCloneS(st0);
  for (const f of n.files) for (const x of anScriptSets(f)) anApplyLine(st, x.line, x.opt);
  return st;
}
function anEdgeApply(st0, e) {
  const st = anCloneS(st0);
  for (const s of e.sets || []) { const v = varById(s.v), ln = v && setLine(v, s); if (ln) anApplyLine(st, ln, false); }
  for (const l of String(e.code || '').split('\n')) if (l.trim()) anApplyLine(st, l, false);
  return st;
}
const anFmtN = x => (x === Infinity ? '∞' : x === -Infinity ? '−∞' : fmtNum(Math.round(x * 100) / 100));
/** Условие стрелки сужает возможные значения. Возвращает { st } или { dead: 'почему нельзя' }; непонятные части условия просто пропускаются. */
function anRefine(st0, cond) {
  const c = String(cond || '').trim();
  if (!c) return { st: st0 };
  if (/\bor\b|\|\|/i.test(c)) return { st: st0 };
  const st = anCloneS(st0);
  for (let term of c.split(/\s+and\s+|&&/i)) {
    term = term.trim().replace(/^\(+|\)+$/g, '').trim(); let m;
    let name, d;
    if ((m = /^not\s+([A-Za-z_]\w*)$/.exec(term))) {
      name = m[1]; d = st[name]; if (d && d.k === 'f') { if (!d.f) return { dead: t('an.why.flag', name, t('an.no')) }; st[name] = { k: 'f', f: true, t: false }; }
    } else if ((m = /^([A-Za-z_]\w*)$/.exec(term))) {
      name = m[1]; d = st[name]; if (d && d.k === 'f') { if (!d.t) return { dead: t('an.why.flag', name, t('an.yes')) }; st[name] = { k: 'f', f: false, t: true }; }
    } else if ((m = /^([A-Za-z_]\w*)\s*(==|!=)\s*(True|False)$/.exec(term))) {
      name = m[1]; d = st[name];
      if (d && d.k === 'f') {
        const want = (m[3] === 'True') === (m[2] === '=='), ok = want ? d.t : d.f;
        if (!ok) return { dead: t('an.why.flag', name, want ? t('an.yes') : t('an.no')) };
        st[name] = want ? { k: 'f', f: false, t: true } : { k: 'f', f: true, t: false };
      }
    } else if ((m = /^([A-Za-z_]\w*)\s*(==|!=)\s*(["'])((?:\\.|(?!\3).)*)\3$/.exec(term))) {
      name = m[1]; d = st[name];
      if (d && d.k === 'c' && d.vals) {
        const has = d.vals.has(m[4]);
        if (m[2] === '==') { if (!has) return { dead: t('an.why.choice', name, m[4]) }; st[name] = { k: 'c', vals: new Set([m[4]]) }; }
        else { const nv = new Set(d.vals); nv.delete(m[4]); if (!nv.size) return { dead: t('an.why.choice', name, '≠ ' + m[4]) }; st[name] = { k: 'c', vals: nv }; }
      }
    } else if ((m = /^([A-Za-z_]\w*)\s*(>=|<=|>|<|==|!=)\s*(-?\d+(?:\.\d+)?)$/.exec(term))) {
      name = m[1]; d = st[name];
      if (d && d.k === 'n') {
        const x = parseFloat(m[3]), whole = Number.isInteger(x), op = m[2];
        let lo = d.lo, hi = d.hi;
        if (op === '>=') lo = Math.max(lo, x); else if (op === '>') lo = Math.max(lo, whole ? x + 1 : x);
        else if (op === '<=') hi = Math.min(hi, x); else if (op === '<') hi = Math.min(hi, whole ? x - 1 : x);
        else if (op === '==') { lo = Math.max(lo, x); hi = Math.min(hi, x); }
        else if (op === '!=' && lo === hi && lo === x) return { dead: t('an.why.num', name, anFmtN(d.lo), anFmtN(d.hi)) };
        if (lo > hi) return { dead: t('an.why.num', name, anFmtN(d.lo), anFmtN(d.hi)) };
        st[name] = { k: 'n', lo, hi };
      }
    }
  }
  return { st };
}
let AN_S = null;
/** Какие значения могут быть у переменных реестра при входе в каждый блок, и какие стрелки никогда не сработают. */
function anStates() {
  const key = DATA_VER + '|' + P.nodes.length + '|' + P.startId;
  if (AN_S && AN_S.key === key) return AN_S;
  const G = anGraph(), starts = anStarts(G), tracked = anTracked();
  const init = {}; for (const v of tracked) init[v.name] = anInit(v);
  const entry = new Map(), visits = new Map(), queue = [], inQ = new Set();
  for (const s of starts) { entry.set(s, anCloneS(init)); queue.push(s); inQ.add(s); }
  const step = (id, to, e, after) => {
    let st = after;
    if (e) { const r = anRefine(after, e.cond); if (!r.st) return null; st = anEdgeApply(r.st, e); }
    return st;
  };
  let guard = 0;
  while (queue.length && guard++ < 40000) {
    const id = queue.shift(); inQ.delete(id);
    const after = anNodeApply(nodeById(id), entry.get(id));
    for (const { to, e } of G.out.get(id)) {
      const st = step(id, to, e, after); if (!st) continue;
      const old = entry.get(to), cnt = (visits.get(to) || 0) + 1;
      let nw = old ? anJoinS(old, st) : anCloneS(st);
      if (old && cnt > 4) nw = anWiden(old, nw);
      if (!old || !anEqS(old, nw)) { entry.set(to, nw); visits.set(to, cnt); if (!inQ.has(to)) { queue.push(to); inQ.add(to); } }
    }
  }
  const dead = [];
  for (const e of P.edges) {
    if (!e.cond || !entry.has(e.from)) continue;
    const r = anRefine(anNodeApply(nodeById(e.from), entry.get(e.from)), e.cond);
    if (r.dead) dead.push({ edge: e, why: r.dead });
  }
  AN_S = { key, tracked, entry, dead, starts };
  return AN_S;
}
function anFmtD(d) {
  if (!d) return t('an.unknown');
  if (d.k === 'f') return d.t && d.f ? t('an.both') : d.t ? t('an.yes') : t('an.no');
  if (d.k === 'c') return d.vals ? [...d.vals].map(x => '«' + x + '»').join(', ') : t('an.any');
  if (d.lo === d.hi) return anFmtN(d.lo);
  if (d.lo === -Infinity && d.hi === Infinity) return t('an.unknown');
  return anFmtN(d.lo) + ' … ' + anFmtN(d.hi);
}

/* ---------- кто что говорит ---------- */
let AN_SP = null;
const AN_NOT_SPEAKERS = new Set(['narrator', 'extend', 'centered', 'vcentered']);
function anSpeech() {
  if (AN_SP && AN_SP.ver === DATA_VER && AN_SP.n === P.nodes.length) return AN_SP.map;
  const map = new Map();
  for (const n of P.nodes) for (const f of n.files) {
    for (const u of tlScan(tlLines(f))) {
      if (!u.who || AN_NOT_SPEAKERS.has(u.who) || !(u.sub === 'line' || u.sub === 'with')) continue;
      let r = map.get(u.who); if (!r) map.set(u.who, r = { lines: 0, words: 0, files: new Map(), nodes: new Set() });
      r.lines++; r.words += wordCount(anPlain(u.body)); r.files.set(f.id, (r.files.get(f.id) || 0) + 1); r.nodes.add(n.id);
    }
  }
  AN_SP = { ver: DATA_VER, n: P.nodes.length, map };
  return map;
}

/* ---------- проверка сюжета ---------- */
const AN_STD_LABELS = new Set(['start', 'main_menu', 'splashscreen', 'after_load', 'quit', 'before_main_menu', 'after_warp']);
/** Список находок: { sev: 'err'|'warn'|'info', code, text, nodeId, fileId, edgeId }. */
function anChecks() {
  const out = [], G = anGraph(), A = anPaths(), push = (sev, code, text, o) => out.push(Object.assign({ sev, code, text }, o || {}));
  const nn = n => n.title || t('node.new.' + n.type);
  const real = G.nodes;
  if (!real.length) return out;
  /* старт и достижимость */
  const starts = A.starts;
  if (!P.startId && starts.length !== 1) push('warn', 'nostart', t('an.c.nostart', starts.length), { key: 'nostart' });
  for (const n of real) {
    if (n.unlock) continue;
    if (!A.reached.has(n.id)) push('warn', 'unreach', t('an.c.unreach', nn(n)), { nodeId: n.id, key: 'unreach|' + n.id });
  }
  /* тупики и развилки */
  for (const n of real) {
    const outs = G.out.get(n.id), mine = n.files.map(f => f.script || '').join('\n');
    if (n.type === 'ending') { if (outs.length) push('info', 'endout', t('an.c.endout', nn(n)), { nodeId: n.id, key: 'endout|' + n.id }); continue; }
    if (!outs.length && A.reached.has(n.id) && !/^\s*(?:return|jump|call)\b|renpy\.(?:full_restart|quit)/m.test(mine)) push('warn', 'deadend', t('an.c.deadend', nn(n)), { nodeId: n.id, key: 'deadend|' + n.id });
    if (n.type === 'fork' && new Set(outs.map(o => o.to)).size < 2) push('warn', 'forkfew', t('an.c.forkfew', nn(n)), { nodeId: n.id, key: 'forkfew|' + n.id });
  }
  /* флаги */
  const FA = flagAnalysis();
  for (const r of FA.names.values()) {
    const first = (r.setters[0] || r.users[0] || {}), nid = first.node ? first.node.id : undefined;
    if (r.setters.length && !r.users.length) push('info', 'flagdead', t('an.c.flagdead', r.name), { nodeId: nid, key: 'flagdead|' + r.name });
    if (r.users.length && !r.setters.length) push('info', 'flagconst', t('an.c.flagconst', r.name), { nodeId: nid, key: 'flagconst|' + r.name });
    for (const x of r.unreached.slice(0, 3)) { const a = nodeById(x.from), b = nodeById(x.to); if (a && b) push('warn', 'flagfar', t('an.c.flagfar', r.name, nn(a), nn(b)), { nodeId: b.id, key: 'flagfar|' + r.name + '|' + a.id + '|' + b.id }); }
  }
  for (const [nm, users] of FA.unknown) push('warn', 'flagnoset', t('an.c.flagnoset', nm), { nodeId: users[0].node.id, key: 'flagnoset|' + nm });
  for (const v of P.vars) if (v.name && !FA.names.get(v.name).setters.length && !FA.names.get(v.name).users.length) push('info', 'varunused', t('an.c.varunused', v.name), { key: 'varunused|' + v.name });
  /* условия, которые никогда не сработают */
  for (const d of anStates().dead) push('warn', 'edgedead', t('an.c.edgedead', (nodeById(d.edge.from) || {}).title || '?', (nodeById(d.edge.to) || {}).title || '?', d.edge.cond, d.why), { edgeId: d.edge.id, nodeId: d.edge.from, key: 'edgedead|' + d.edge.id });
  /* метки и переходы */
  const targets = jumpTargetMap(), seenLabel = new Map();
  const ccLab = new Map();           // метки из «Своего кода» (customcode.js): переходы на них не ошибка, а совпадение с метками глав ошибка
  if (typeof ccScan === 'function') for (const c of P.code || []) if (c.on !== false) for (const lb of ccScan(c.text).labels) if (!ccLab.has(lb)) ccLab.set(lb, c.name);
  for (const n of real) for (const f of n.files) {
    const lines = String(f.script || '').replace(/\r\n?/g, '\n').split('\n');
    const own = new Set();
    for (const l of lines) { const m = RE_J_LABEL.exec(l.trim()); if (m) { own.add(m[1]); if (ccLab.has(m[1])) push('err', 'duplabel', t('an.c.duplabel', m[1], nn(n), t('cu.src', ccLab.get(m[1]))), { nodeId: n.id, fileId: f.id, key: 'duplabel|' + m[1] + '|' + f.id }); else if (seenLabel.has(m[1]) && seenLabel.get(m[1]).f !== f.id) push('err', 'duplabel', t('an.c.duplabel', m[1], nn(seenLabel.get(m[1]).n), nn(n)), { nodeId: n.id, fileId: f.id, key: 'duplabel|' + m[1] + '|' + f.id }); else seenLabel.set(m[1], { n, f: f.id }); } }
    const reported = new Set();
    for (const l of lines) {
      const m = RE_J_STMT.exec(l.trim()); if (!m) continue;
      const tg = m[2].replace(/^["']|["']$/g, '');
      if (reported.has(tg) || AN_STD_LABELS.has(tg) || own.has(tg) || ccLab.has(tg) || targets.has(jKey(tg)) || /^\[|[()+]/.test(tg)) continue;
      reported.add(tg); push('warn', 'badjump', t('an.c.badjump', tg, nn(n)), { nodeId: n.id, fileId: f.id, key: 'badjump|' + f.id + '|' + tg });
    }
  }
  /* персонажи */
  const sp = anSpeech(), tags = new Set(P.characters.map(c => c.tag)), defd = new Set();
  for (const n of real) for (const f of n.files) for (const m of String(f.script || '').matchAll(/^\s*define\s+([A-Za-z_]\w*)\s*=\s*Character\b/gm)) defd.add(m[1]);
  if (typeof ccScan === 'function') for (const c of P.code || []) if (c.on !== false) for (const tg of ccScan(c.text).chars) defd.add(tg);
  for (const [who, r] of sp) if (!tags.has(who) && !defd.has(who)) { const nid = [...r.nodes][0]; push('warn', 'nochar', t('an.c.nochar', who, r.lines), { nodeId: nid, key: 'nochar|' + who }); }
  for (const c of P.characters) if (c.tag && !sp.has(c.tag) && !P.nodes.some(n => n.defaultCast.includes(c.id) || n.files.some(f => f.cast.includes(c.id))) && !c.always) push('info', 'charidle', t('an.c.charidle', c.name || c.tag), { key: 'charidle|' + c.id });
  /* ресурсы */
  const miss = new Map(), ccImg = new Set(), ccTag = new Set();      // картинки, определённые в «Своём коде»
  if (typeof ccScan === 'function') for (const c of P.code || []) if (c.on !== false) { const sc = ccScan(c.text); sc.images.forEach(x => { ccImg.add(x); ccTag.add(x.split(' ')[0]); }); sc.imgTags.forEach(x => ccTag.add(x)); }
  for (const n of real) for (const f of n.files) for (const u of parseUsage(f.script)) {
    if (!['bg', 'sprite', 'music', 'sfx', 'voice'].includes(u.kind) || matchAsset(u)) continue;
    if (u.kind === 'bg' ? ccImg.has(String(u.name).trim().replace(/\s+/g, ' ')) : u.kind === 'sprite' && ccTag.has(u.name)) continue;
    const k = u.kind + '|' + u.name; if (!miss.has(k)) miss.set(k, { u, n, f });
  }
  for (const { u, n, f } of miss.values()) push('info', 'noasset', t('an.c.noasset', t('kind1.' + u.kind), u.name), { nodeId: n.id, fileId: f.id, key: 'noasset|' + u.kind + '|' + u.name });
  /* статусы */
  for (const n of real) for (const f of n.files) if (f.status === 'done' && !String(f.script || '').trim()) push('warn', 'emptydone', t('an.c.emptydone', nn(n), f.title || t('file.untitled')), { nodeId: n.id, fileId: f.id, key: 'emptydone|' + f.id });
  const order = { err: 0, warn: 1, info: 2 };
  out.sort((a, b) => order[a.sev] - order[b.sev]);
  return out;
}

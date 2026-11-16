'use strict';
/* ====== Слияние проектов (общее ядро совместной работы) ======
   Проект раскладывается на «сущности»: блок, файл главы, стрелка, персонаж, ассет, переменная, участник, язык, пачка переводов файла.
   Трёхстороннее слияние (base — общий предок, local — моя версия, remote — чужая) решает по каждой сущности и каждому полю:
   менял только один — берём его правку; менялли оба по-разному — для текстов скриптов сливаем построчно (при пересечении оставляем оба варианта
   с пометками-комментариями), для остальных полей побеждает моя версия, а конфликт попадает в список.
   Модуль чистый: ничего не знает про DOM и глобальное состояние. */

const MG_MAX_CELLS = 4e6;
const _mgCanon = new WeakMap();
function mgCanon(v) {
  if (v === undefined) return 'u';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (_mgCanon.has(v)) return _mgCanon.get(v);
  let s;
  if (Array.isArray(v)) s = '[' + v.map(mgCanon).join(',') + ']';
  else s = '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + mgCanon(v[k])).join(',') + '}';
  _mgCanon.set(v, s);
  return s;
}
const mgEq = (a, b) => a === b || mgCanon(a) === mgCanon(b);
const mgIsObj = v => v && typeof v === 'object' && !Array.isArray(v);
const mgClone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

/* ---------- проект → сущности ---------- */
/** Карта «путь → объект». Пути: meta, n/<id>, f/<id>, e/<id>, c/<id>, a/<id>, v/<id>, m/<id>, k/<id> (заметки), x/<id> (скрытые замечания проверки), g/<id> (достижения), l/<id>, r/<язык>/<группа>. */
function mgEntities(p) {
  const M = new Map();
  const tl = p.tl || {};
  M.set('meta', { name: p.name || '', startId: p.startId || '', uid: p.uid || '', filesUrl: p.filesUrl || '', build: mgClone(p.build) || {}, base: tl.base || '', lofs: mgClone(p.lofs) || {}, gui: mgClone(p.gui) || {}, acl: mgClone(p.acl) || {} });
  for (const n of p.nodes || []) {
    const rest = Object.assign({}, n); delete rest.files;
    rest.fileIds = (n.files || []).map(f => f.id);
    M.set('n/' + n.id, mgClone(rest));
    for (const f of n.files || []) M.set('f/' + f.id, Object.assign(mgClone(f), { nodeId: n.id }));
  }
  for (const [pre, arr] of [['e', p.edges], ['c', p.characters], ['a', p.assets], ['v', p.vars], ['m', p.members], ['k', p.cmts], ['x', p.ign], ['g', p.achs], ['q', p.tasks], ['s', p.snippets], ['o', p.code]]) for (const x of arr || []) M.set(pre + '/' + x.id, mgClone(x));
  for (const l of tl.langs || []) {
    M.set('l/' + l.id, mgClone(l));
    const groups = {};
    const rs = (tl.rec || {})[l.id] || {};
    for (const k of Object.keys(rs)) { const g = k.startsWith('s.') ? k.split('.')[1] : 'misc'; (groups[g] || (groups[g] = {}))[k] = rs[k]; }
    for (const g of Object.keys(groups)) M.set('r/' + l.id + '/' + g, mgClone(groups[g]));
  }
  return M;
}
/** Хэш сущности для быстрой проверки «изменилась ли». */
function mgHash(o) {
  const s = mgCanon(o); let h = 5381, g = 52711;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h = ((h << 5) + h + c) >>> 0; g = (Math.imul(g, 33) ^ c) >>> 0; }
  return h.toString(36) + g.toString(36) + s.length.toString(36);
}

/** Сущности → проект. ref — моя версия: из неё берутся порядок, вид на холсте, симуляция и служебные поля. */
function mgBuild(M, ref) {
  const out = mgClone(ref) || {};
  const meta = M.get('meta') || {};
  out.name = meta.name; out.startId = meta.startId; out.filesUrl = meta.filesUrl || ''; out.uid = meta.uid || out.uid; out.build = mgClone(meta.build) || out.build; out.lofs = mgClone(meta.lofs) || {}; out.gui = mgClone(meta.gui) || {}; out.acl = mgClone(meta.acl) || {};
  const refOrder = arr => (arr || []).map(x => x.id);
  const list = (pre, refArr) => {
    const have = [...M.keys()].filter(k => k.startsWith(pre + '/')).map(k => k.slice(pre.length + 1));
    const set = new Set(have), seq = [];
    for (const id of refOrder(refArr)) if (set.has(id)) { seq.push(id); set.delete(id); }
    for (const id of have) if (set.has(id)) seq.push(id);
    return seq.map(id => mgClone(M.get(pre + '/' + id)));
  };
  const files = new Map();
  for (const k of M.keys()) if (k.startsWith('f/')) { const f = mgClone(M.get(k)); (files.get(f.nodeId) || files.set(f.nodeId, []).get(f.nodeId)).push(f); }
  out.nodes = list('n', ref && ref.nodes).map(n => {
    const mine = files.get(n.id) || [], byId = new Map(mine.map(f => [f.id, f]));
    const seq = [];
    for (const id of n.fileIds || []) if (byId.has(id)) { seq.push(byId.get(id)); byId.delete(id); }
    for (const f of mine) if (byId.has(f.id)) seq.push(f);     // файл, которого нет в списке блока, не теряем
    seq.forEach(f => delete f.nodeId);
    delete n.fileIds; n.files = seq;
    return n;
  });
  out.edges = list('e', ref && ref.edges); out.characters = list('c', ref && ref.characters); out.assets = list('a', ref && ref.assets);
  out.vars = list('v', ref && ref.vars); out.members = list('m', ref && ref.members); out.cmts = list('k', ref && ref.cmts); out.ign = list('x', ref && ref.ign); out.achs = list('g', ref && ref.achs); out.tasks = list('q', ref && ref.tasks); out.snippets = list('s', ref && ref.snippets); out.code = list('o', ref && ref.code);
  const langs = list('l', ref && ref.tl && ref.tl.langs);
  const rec = {};
  for (const l of langs) rec[l.id] = {};
  for (const k of M.keys()) if (k.startsWith('r/')) { const [, lang] = k.split('/'); if (rec[lang]) Object.assign(rec[lang], mgClone(M.get(k))); }
  out.tl = { base: meta.base || '', langs, rec, idx: mgClone(ref && ref.tl && ref.tl.idx) || {} };
  return out;
}

/* ---------- построчное слияние текста ---------- */
function mgHunks(a, b) {
  let s = 0; while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let ea = a.length, eb = b.length; while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) { ea--; eb--; }
  const n = ea - s, m = eb - s;
  if (!n && !m) return [];
  if (!n || !m || n * m > MG_MAX_CELLS) return [{ as: s, ae: ea, bs: s, be: eb }];
  const W = m + 1, dp = new Uint16Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i * W + j] = a[s + i] === b[s + j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
  const out = []; let i = 0, j = 0, hs = null;
  const flush = () => { if (hs) { out.push({ as: s + hs.i, ae: s + i, bs: s + hs.j, be: s + j }); hs = null; } };
  while (i < n || j < m) {
    if (i < n && j < m && a[s + i] === b[s + j]) { flush(); i++; j++; }
    else { if (!hs) hs = { i, j }; if (j >= m || (i < n && dp[(i + 1) * W + j] >= dp[i * W + j + 1])) i++; else j++; }
  }
  flush();
  return out;
}
const MG_MARK = { mine: '# ⚠ КОНФЛИКТ ПРАВОК. Ниже ваш вариант:', theirs: '# ⚠ Вариант коллеги:', end: '# ⚠ Оставьте нужное, а строки с «⚠» удалите.' };
/** Трёхстороннее слияние текста. Возвращает { text, conflict }. */
function mgText(base, loc, rem) {
  if (loc === rem) return { text: loc, conflict: false };
  if (loc === base) return { text: rem, conflict: false };
  if (rem === base) return { text: loc, conflict: false };
  const A = base.split('\n'), La = loc.split('\n'), Ra = rem.split('\n');
  const ev = [...mgHunks(A, La).map(h => Object.assign(h, { side: 'L' })), ...mgHunks(A, Ra).map(h => Object.assign(h, { side: 'R' }))].sort((x, y) => x.as - y.as || x.ae - y.ae);
  const out = []; let pos = 0, k = 0, conflict = false;
  const apply = (cl, side, as, ae) => {
    const src = side === 'L' ? La : Ra, lines = []; let p = as;
    for (const h of cl) if (h.side === side) { lines.push(...A.slice(p, h.as), ...src.slice(h.bs, h.be)); p = h.ae; }
    lines.push(...A.slice(p, ae));
    return lines;
  };
  while (k < ev.length) {
    let as = ev[k].as, ae = ev[k].ae; const cl = [ev[k++]];
    while (k < ev.length && ev[k].as <= ae && (ev[k].side !== cl[cl.length - 1].side || ev[k].as < ae)) { ae = Math.max(ae, ev[k].ae); cl.push(ev[k++]); }
    out.push(...A.slice(pos, as)); pos = ae;
    const sides = new Set(cl.map(h => h.side));
    if (sides.size === 1) { out.push(...apply(cl, [...sides][0], as, ae)); continue; }
    const lv = apply(cl, 'L', as, ae), rv = apply(cl, 'R', as, ae);
    if (lv.join('\n') === rv.join('\n')) out.push(...lv);
    else { conflict = true; out.push(MG_MARK.mine, ...lv, MG_MARK.theirs, ...rv, MG_MARK.end); }
  }
  out.push(...A.slice(pos));
  return { text: out.join('\n'), conflict };
}

/* ---------- слияние объектов и карт ---------- */
function mgMergeVal(b, l, r, path, cf, depth) {
  if (mgEq(l, r)) return l;
  if (mgEq(l, b)) return r;
  if (mgEq(r, b)) return l;
  if (l === undefined) return r;           // мы убрали поле, они изменили: оставляем изменённое
  if (r === undefined) return l;
  if (typeof l === 'string' && typeof r === 'string') {
    if (l.includes('\n') || r.includes('\n') || (typeof b === 'string' && b.includes('\n'))) {
      const m = mgText(typeof b === 'string' ? b : '', l, r);
      cf.push({ path, text: true, marked: m.conflict });
      return m.text;
    }
    cf.push({ path }); return l;
  }
  if (mgIsObj(l) && mgIsObj(r) && depth < 4) return mgMergeObj(mgIsObj(b) ? b : {}, l, r, path, cf, depth + 1);
  cf.push({ path }); return l;
}
function mgMergeObj(b, l, r, path, cf, depth) {
  const out = {};
  const keys = new Set([...Object.keys(l), ...Object.keys(r)]);
  if (keys.has('edt') || keys.has('ed')) {                 // «кто последним правил»: побеждает более поздняя правка, конфликта тут не бывает
    const rWins = (+r.edt || 0) > (+l.edt || 0), src = rWins ? r : l;
    if (src.ed !== undefined) out.ed = src.ed; if (src.edt !== undefined) out.edt = src.edt;
    keys.delete('ed'); keys.delete('edt');
  }
  for (const k of keys) {
    const v = mgMergeVal(b[k], l[k], r[k], path + '.' + k, cf, depth || 0);
    if (v !== undefined) out[k] = v;
  }
  return out;
}
function mgMergeMaps(B, L, R, cf) {
  const out = new Map();
  const keys = [...L.keys(), ...[...R.keys()].filter(k => !L.has(k))];
  for (const k of keys) {
    const b = B.get(k), l = L.get(k), r = R.get(k);
    let v;
    if (mgEq(l, r)) v = l;
    else if (mgEq(l, b)) v = r;
    else if (mgEq(r, b)) v = l;
    else if (l === undefined) v = r;       // мы удалили, они изменили: остаётся изменённое
    else if (r === undefined) v = l;
    else v = mgMergeObj(mgIsObj(b) ? b : {}, l, r, k, cf, 0);
    if (v !== undefined) out.set(k, v);
  }
  return out;
}
/** base — общий предок (проект или null), local/remote — проекты. Возвращает { project, conflicts, sameAsLocal, sameAsRemote }. */
function mgMerge(baseP, localP, remoteP) {
  const cf = [];
  const B = baseP ? mgEntities(baseP) : new Map(), L = mgEntities(localP), R = mgEntities(remoteP);
  const M = mgMergeMaps(B, L, R, cf);
  const same = X => M.size === X.size && [...M].every(([k, v]) => X.has(k) && mgEq(X.get(k), v));
  return { project: mgBuild(M, localP), conflicts: cf, sameAsLocal: same(L), sameAsRemote: same(R), map: M };
}
/** Что изменилось между двумя картами сущностей: { set: [path], del: [path] } (для отправки в общую базу). */
function mgDiff(from, to) {
  const set = [], del = [];
  for (const [k, v] of to) if (!from.has(k) || !mgEq(from.get(k), v)) set.push(k);
  for (const k of from.keys()) if (!to.has(k)) del.push(k);
  return { set, del };
}

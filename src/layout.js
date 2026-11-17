'use strict';
/* ====== Авторасстановка узлов ======
   Слоистая раскладка: узлы делятся на слои по длине пути от начала, внутри слоя порядок подбирается так, чтобы стрелок пересекалось поменьше
   (метод средних положений), затем узлы выравниваются по соседям, чтобы стрелки были короче. Длинные стрелки, перескакивающие через слои,
   получают точки излома, и обходят узлы по дороге. Цикл (возврат назад) разрывается в самой «обратной» стрелке. Заметки на карте не трогаются. */

Object.assign(D, {
  'ly.title': ['Расставить узлы', 'Arrange nodes'], 'ly.btn': ['Расставить узлы…', 'Arrange nodes…'],
  'ly.scope': ['Что расставить', 'What to arrange'], 'ly.all': ['Всю карту', 'The whole map'], 'ly.sel': ['Только выделенные ({0})', 'Selected only ({0})'],
  'ly.dir': ['Направление', 'Direction'], 'ly.lr': ['Слева направо', 'Left to right'], 'ly.tb': ['Сверху вниз', 'Top to bottom'],
  'ly.gap': ['Расстояния', 'Spacing'], 'ly.tight': ['Плотно', 'Tight'], 'ly.normal': ['Обычно', 'Normal'], 'ly.wide': ['Свободно', 'Roomy'],
  'ly.hint': ['Ручные изломы стрелок между расставленными узлами сбросятся. Результат можно отменить (Ctrl+Z).', 'Manual bends of arrows between arranged nodes are reset. You can undo (Ctrl+Z).'],
  'ly.go': ['Расставить', 'Arrange'], 'ly.done': ['Расставлено узлов: {0}. Отменить: Ctrl+Z', 'Arranged {0} nodes. Undo: Ctrl+Z'],
  'ly.few': ['Нужно хотя бы два блока со стрелками', 'At least two connected blocks are needed'],
  'ly.style': ['Вид', 'Style'], 'ly.st.layers': ['По слоям', 'By layers'], 'ly.st.snake': ['Компактно (змейкой)', 'Compact (snake)'],
  'ly.per': ['Блоков в ряду', 'Blocks per row'], 'ly.per.auto': ['Авто', 'Auto'],
  'ly.snake.hint': ['Длинная цепочка сворачивается рядами: первый ряд слева направо, второй справа налево и так далее. «Авто» подбирает ширину под размер окна.', 'A long chain folds into rows: the first row runs left to right, the next right to left, and so on. Auto fits the width to the window.'],
});

const LY_GAPS = { tight: { main: 70, cross: 20, comp: 80 }, normal: { main: 120, cross: 40, comp: 120 }, wide: { main: 200, cross: 80, comp: 200 } };

/** Одномерное выравнивание: ближе всего к желаемым центрам d, но не теснее s[i] между соседями (метод PAV). */
function lyIsotonic(d, s) {
  const n = d.length; if (!n) return [];
  const o = [0]; for (let i = 1; i < n; i++) o[i] = o[i - 1] + s[i - 1];
  const bl = [];
  for (let i = 0; i < n; i++) {
    bl.push({ sum: d[i] - o[i], n: 1, v: d[i] - o[i] });
    while (bl.length > 1 && bl[bl.length - 2].v > bl[bl.length - 1].v) { const b = bl.pop(), a = bl.pop(), sum = a.sum + b.sum, c = a.n + b.n; bl.push({ sum, n: c, v: sum / c }); }
  }
  const res = []; let i = 0;
  for (const b of bl) for (let k = 0; k < b.n; k++, i++) res.push(b.v + o[i]);
  return res;
}
function lyCrossings(layers, ordPos, edges) {
  let total = 0;
  const byLayer = new Map();
  for (const [a, b] of edges) { const k = a.layer; if (!byLayer.has(k)) byLayer.set(k, []); byLayer.get(k).push([ordPos.get(a), ordPos.get(b)]); }
  for (const list of byLayer.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const p = list[i], q = list[j];
    if ((p[0] - q[0]) * (p[1] - q[1]) < 0) total++;
  }
  return total;
}

/** Раскладывает одну связную группу. Возвращает { items: [{node|null, layer, main, cross, w, h}], mainSpan, crossMin, crossMax, chains }. */
function lyComponent(nodes, edgePairs, opt) {
  const G = LY_GAPS[opt.gap] || LY_GAPS.normal, lr = opt.dir !== 'tb';
  const ids = new Set(nodes.map(n => n.id));
  const out = new Map(nodes.map(n => [n.id, []])), inn = new Map(nodes.map(n => [n.id, []]));
  for (const [a, b] of edgePairs) { if (!ids.has(a) || !ids.has(b) || a === b) continue; if (!out.get(a).includes(b)) { out.get(a).push(b); inn.get(b).push(a); } }
  /* 1. разрыв циклов: обход в глубину, стрелки назад переворачиваем */
  const rank = new Map(nodes.map((n, i) => [n.id, i]));
  const roots = nodes.filter(n => n.id === P.startId).map(n => n.id)
    .concat(nodes.filter(n => !inn.get(n.id).length && n.id !== P.startId).sort((a, b) => (lr ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x)).map(n => n.id))
    .concat(nodes.filter(n => inn.get(n.id).length && n.id !== P.startId).sort((a, b) => (lr ? a.x - b.x : a.y - b.y)).map(n => n.id));
  const color = new Map(), flipped = new Set();
  for (const r of roots) {
    if (color.has(r)) continue;
    const st = [[r, 0]]; color.set(r, 1);
    while (st.length) {
      const top = st[st.length - 1], os = out.get(top[0]);
      if (top[1] < os.length) {
        const to = os[top[1]++], c = color.get(to);
        if (c === 1) flipped.add(top[0] + '>' + to); else if (!c) { color.set(to, 1); st.push([to, 0]); }
      } else { color.set(top[0], 2); st.pop(); }
    }
  }
  const dag = [];                                                            // [from, to, исходная стрелка перевёрнута?]
  for (const [a, b] of edgePairs) { if (!ids.has(a) || !ids.has(b) || a === b) continue; dag.push(flipped.has(a + '>' + b) ? [b, a, true, a, b] : [a, b, false, a, b]); }
  const seenE = new Set(), dag2 = dag.filter(e => { const k = e[0] + '>' + e[1]; if (seenE.has(k)) return false; seenE.add(k); return true; });
  const dOut = new Map(nodes.map(n => [n.id, []])), dIn = new Map(nodes.map(n => [n.id, []]));
  for (const e of dag2) { dOut.get(e[0]).push(e[1]); dIn.get(e[1]).push(e[0]); }
  /* 2. слои: самый длинный путь, затем источники подтягиваются к своим потомкам */
  const layer = new Map(), indeg = new Map(nodes.map(n => [n.id, dIn.get(n.id).length])), q = nodes.filter(n => !indeg.get(n.id)).map(n => n.id), topo = [];
  for (const id of q) layer.set(id, 0);
  for (let i = 0; i < q.length; i++) {
    const id = q[i]; topo.push(id);
    for (const to of dOut.get(id)) { layer.set(to, Math.max(layer.get(to) || 0, layer.get(id) + 1)); indeg.set(to, indeg.get(to) - 1); if (!indeg.get(to)) q.push(to); }
  }
  for (let i = topo.length - 1; i >= 0; i--) { const id = topo[i]; if (!dIn.get(id).length && dOut.get(id).length) layer.set(id, Math.min(...dOut.get(id).map(x => layer.get(x))) - 1); }
  for (const n of nodes) if (!layer.has(n.id)) layer.set(n.id, 0);
  const minL = Math.min(...layer.values()); if (minL !== 0) for (const [k, v] of layer) layer.set(k, v - minL);
  /* 3. вершины и «пустышки» на длинных стрелках */
  const V = new Map(), items = [];
  const sz = n => { const s = nodeSize(n); return { w: s.w, h: s.h }; };
  for (const n of nodes) { const s = sz(n), v = { node: n, id: n.id, layer: layer.get(n.id), main: lr ? s.w : s.h, cross: lr ? s.h : s.w, w: s.w, h: s.h, pos: 0, dummy: false }; V.set(n.id, v); items.push(v); }
  const LE = [], chains = new Map(); let dn = 0;
  for (const e of dag2) {
    const a = V.get(e[0]), b = V.get(e[1]); let prev = a; const chain = [];
    for (let l = a.layer + 1; l < b.layer; l++) { const d = { node: null, id: 'd' + (dn++), layer: l, main: 0, cross: 24, w: 0, h: 0, pos: 0, dummy: true }; items.push(d); chain.push(d); LE.push([prev, d]); prev = d; }
    LE.push([prev, b]);
    if (chain.length) chains.set(e[3] + '>' + e[4], e[2] ? chain.slice().reverse() : chain);
  }
  const L = Math.max(...items.map(v => v.layer)) + 1, layers = Array.from({ length: L }, () => []);
  /* 4. порядок внутри слоя: исходное положение, затем средние положения соседей */
  const origKey = v => (v.dummy ? 0 : lr ? v.node.y + v.h / 2 : v.node.x + v.w / 2);
  for (const v of items) layers[v.layer].push(v);
  for (const ly of layers) ly.sort((a, b) => origKey(a) - origKey(b));
  const preds = new Map(items.map(v => [v, []])), succs = new Map(items.map(v => [v, []]));
  for (const [a, b] of LE) { succs.get(a).push(b); preds.get(b).push(a); }
  const posMap = () => { const m = new Map(); for (const ly of layers) ly.forEach((v, i) => m.set(v, i)); return m; };
  let best = layers.map(l => l.slice()), bestC = lyCrossings(layers, posMap(), LE);
  const sweep = (down) => {
    const pm = posMap();
    const idxs = down ? layers.map((_, i) => i).slice(1) : layers.map((_, i) => i).slice(0, -1).reverse();
    for (const li of idxs) {
      const ly = layers[li], nb = down ? preds : succs;
      const bary = new Map(ly.map((v, i) => { const ns = nb.get(v); return [v, ns.length ? ns.reduce((s, x) => s + pm.get(x), 0) / ns.length : i]; }));
      const old = new Map(ly.map((v, i) => [v, i]));
      ly.sort((a, b) => bary.get(a) - bary.get(b) || old.get(a) - old.get(b));
      ly.forEach((v, i) => pm.set(v, i));
    }
  };
  for (let it = 0; it < 12 && bestC > 0; it++) {
    sweep(it % 2 === 0); const c = lyCrossings(layers, posMap(), LE);
    if (c < bestC) { bestC = c; best = layers.map(l => l.slice()); }
  }
  for (let i = 0; i < L; i++) layers[i] = best[i];
  /* 5. координаты поперёк: упаковка, затем притягивание к соседям с сохранением порядка */
  const gapCross = G.cross;
  const minSep = (a, b) => (a.cross + b.cross) / 2 + gapCross;
  const place = (ly, desired) => {
    const d = desired.slice(), s = []; for (let i = 1; i < ly.length; i++) s.push(minSep(ly[i - 1], ly[i]));
    const r = lyIsotonic(d, s); ly.forEach((v, i) => { v.pos = r[i]; });
  };
  for (const ly of layers) { let c = 0; ly.forEach((v, i) => { if (i) c += minSep(ly[i - 1], v); v.pos = c; }); }
  for (let it = 0; it < 14; it++) {
    const down = it % 2 === 0, order = down ? layers.map((_, i) => i) : layers.map((_, i) => i).reverse();
    for (const li of order) {
      const ly = layers[li], nb = down ? preds : succs;
      const des = ly.map(v => { const ns = nb.get(v); if (!ns.length) { const o = down ? succs.get(v) : preds.get(v); return o.length ? o.reduce((s, x) => s + x.pos, 0) / o.length : v.pos; } return ns.reduce((s, x) => s + x.pos, 0) / ns.length; });
      place(ly, des);
    }
  }
  /* 6. вдоль слоёв: каждый слой занимает ширину своего самого широкого узла */
  const gapMain = G.main; let mainAt = 0; const base = [];
  for (const ly of layers) { const mw = Math.max(0, ...ly.map(v => v.main)); base.push({ at: mainAt, size: mw }); mainAt += mw + gapMain; }
  const cr = items.map(v => v.pos), cMin = Math.min(...items.map(v => v.pos - v.cross / 2)), cMax = Math.max(...items.map(v => v.pos + v.cross / 2));
  void cr;
  return { items, layers, base, mainSpan: mainAt - gapMain, cMin, cMax, chains, lr, V };
}

/** «Компактно»: слои одной группы сворачиваются в ряды по k слоёв (змейка: чётные ряды вперёд, нечётные назад), так что цепочка из десятков блоков
    ложится в экран, а не в одну длинную строку. Переписывает layer и pos у вершин и base у группы; «пустышки» длинных стрелок отбрасываются (стрелки идут по автомаршруту). */
function lyFold(R, opt) {
  const G = LY_GAPS[opt.gap] || LY_GAPS.normal, lr = opt.dir !== 'tb';
  const real = R.items.filter(v => !v.dummy), L = R.layers.length;
  const rowGap = Math.max(60, G.cross * 2), colGap = G.main;
  const dimsFor = k => {
    const rows = Math.ceil(L / k), colMain = Array(k).fill(0), rowSpan = [];
    for (let r = 0; r < rows; r++) {
      let lo = Infinity, hi = -Infinity;
      for (let l = r * k; l < Math.min(L, (r + 1) * k); l++) for (const v of R.layers[l]) { if (v.dummy) continue; const c = (r % 2 ? k - 1 - (l - r * k) : l - r * k); colMain[c] = Math.max(colMain[c], v.main); lo = Math.min(lo, v.pos - v.cross / 2); hi = Math.max(hi, v.pos + v.cross / 2); }
      rowSpan.push(isFinite(lo) ? hi - lo : 0);
    }
    const main = colMain.reduce((a, b) => a + b, 0) + colGap * (Math.min(k, L) - 1), cross = rowSpan.reduce((a, b) => a + b, 0) + rowGap * (rows - 1);
    return lr ? { w: main, h: cross } : { w: cross, h: main };
  };
  let k = Math.max(0, Math.round(opt.perRow || 0));
  if (!k) {                                                                         // авто: форма всей группы ближе всего к форме окна
    const want = Math.log(opt.aspect > 0 ? opt.aspect : 1.6); let bestErr = Infinity;
    for (let kk = 1; kk <= L; kk++) { const d = dimsFor(kk), err = Math.abs(Math.log(d.w / d.h) - want); if (err <= bestErr + 1e-9) { bestErr = err; k = kk; } }
  }
  k = Math.max(1, Math.min(L, k));
  const rows = Math.ceil(L / k), colMain = Array(k).fill(0), rowAt = [];
  for (let l = 0; l < L; l++) { const r = Math.floor(l / k), c = r % 2 ? k - 1 - (l - r * k) : l - r * k; for (const v of R.layers[l]) if (!v.dummy) colMain[c] = Math.max(colMain[c], v.main); }
  let at = 0; const base = colMain.map(sz => { const b = { at, size: sz }; at += sz + colGap; return b; });
  let crossAt = 0, cMin = Infinity, cMax = -Infinity;
  for (let r = 0; r < rows; r++) {
    const vs = []; for (let l = r * k; l < Math.min(L, (r + 1) * k); l++) for (const v of R.layers[l]) if (!v.dummy) vs.push(v);
    const lo = Math.min(...vs.map(v => v.pos - v.cross / 2)), hi = Math.max(...vs.map(v => v.pos + v.cross / 2));
    rowAt.push(crossAt);
    for (const v of vs) { const l = v.layer; v.layer = r % 2 ? k - 1 - (l - r * k) : l - r * k; v.pos = v.pos - lo + crossAt; }
    cMin = Math.min(cMin, crossAt); cMax = Math.max(cMax, crossAt + (hi - lo)); crossAt += (hi - lo) + rowGap;
  }
  R.items = real; R.base = base; R.chains = new Map(); R.cMin = cMin; R.cMax = cMax; R.perRow = k;
  return R;
}

/** Расставляет узлы. opt: { ids: Set|null, dir: 'lr'|'tb', gap: 'tight'|'normal'|'wide', style: 'layers'|'snake', perRow: число (0 — авто), aspect: ширина/высота окна }. Возвращает число расставленных узлов. */
function autoLayout(opt = {}) {
  const pick = opt.ids ? P.nodes.filter(n => opt.ids.has(n.id)) : P.nodes;
  const nodes = pick.filter(n => n.type !== 'note');
  if (nodes.length < 2) return 0;
  const ids = new Set(nodes.map(n => n.id)), lr = opt.dir !== 'tb', G = LY_GAPS[opt.gap] || LY_GAPS.normal;
  /* связи: стрелки и переходы из кода */
  const pairs = P.edges.map(e => [e.from, e.to]);
  try { for (const Lk of jumpAnalysis().links) pairs.push([Lk.from, Lk.to]); } catch (x) { /* без переходов */ }
  /* связные группы */
  const parent = new Map(nodes.map(n => [n.id, n.id]));
  const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  for (const [a, b] of pairs) if (ids.has(a) && ids.has(b)) parent.set(find(a), find(b));
  const groups = new Map(); for (const n of nodes) { const r = find(n.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n); }
  const comps = [...groups.values()].sort((a, b) => {
    const ca = a.reduce((s, n) => s + (lr ? n.y : n.x), 0) / a.length, cb = b.reduce((s, n) => s + (lr ? n.y : n.x), 0) / b.length;
    return (b.length > 1) - (a.length > 1) || ca - cb;
  });
  const bb0 = nodesBBox(nodes);
  const results = comps.map(c => { const R = lyComponent(c, pairs, opt); return opt.style === 'snake' && R.layers.length > 2 ? lyFold(R, opt) : R; });
  /* укладываем группы друг под другом (или рядом при расстановке сверху вниз) */
  let crossAt = 0; const moved = new Set();
  const place = [];
  results.forEach(R => {
    const off = crossAt - R.cMin;
    for (const v of R.items) {
      const b = R.base[v.layer], mainC = b.at + b.size / 2, crossC = v.pos + off;
      if (v.dummy) v.wx = lr ? mainC : crossC, v.wy = lr ? crossC : mainC;
      else {
        v.wx = lr ? b.at : crossC - v.w / 2; v.wy = lr ? crossC - v.h / 2 : b.at;
        if (lr) v.wx = b.at + (b.size - v.w) / 2; else v.wy = b.at + (b.size - v.h) / 2;
      }
    }
    crossAt += (R.cMax - R.cMin) + G.comp;
    place.push(R);
  });
  let minX = Infinity, minY = Infinity;
  for (const R of place) for (const v of R.items) if (!v.dummy) { minX = Math.min(minX, v.wx); minY = Math.min(minY, v.wy); }
  const dx = bb0.x0 - minX, dy = bb0.y0 - minY;
  for (const R of place) for (const v of R.items) {
    v.wx += dx; v.wy += dy;
    if (!v.dummy) { v.node.x = snapTo(v.wx, GRID); v.node.y = snapTo(v.wy, GRID); moved.add(v.node.id); }
  }
  /* стрелки: сбрасываем ручные изломы, длинные получают точки по пустым местам между слоями */
  const chainOf = new Map();
  for (const R of place) for (const [k, ch] of R.chains) chainOf.set(k, ch.map(d => [Math.round(d.wx), Math.round(d.wy)]));
  for (const e of P.edges) {
    if (!moved.has(e.from) && !moved.has(e.to)) continue;
    e.pts = []; e.lo = null; e.fromSide = 'auto'; e.toSide = 'auto';
    if (moved.has(e.from) && moved.has(e.to)) { const ch = chainOf.get(e.from + '>' + e.to); if (ch && ch.length <= 8) e.pts = ch.map(p => [snapTo(p[0], 10), snapTo(p[1], 10)]); }
  }
  if (P.lofs) for (const k of Object.keys(P.lofs)) { const m = /^\w+:(.+)>(.+)$/.exec(k); if (m && (moved.has(m[1]) || moved.has(m[2]))) delete P.lofs[k]; }
  void G;
  return moved.size;
}

function openLayoutDialog(anchor) {
  const sel = [...UI.sel].filter(id => { const n = nodeById(id); return n && n.type !== 'note'; });
  const o = Object.assign({ dir: 'lr', gap: 'normal', style: 'layers', perRow: 0 }, S.layout || {}), st = { scope: sel.length > 1 ? 'sel' : 'all' };
  const seg = (opts, val, cb) => segmented(opts, val, cb);
  const body = h('div', { class: 'qform ly-form' });
  const render = () => {
    body.replaceChildren(
      h('div', { class: 'lbl' }, t('ly.title')),
      sel.length > 1 ? h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ly.scope')), seg([{ value: 'all', label: t('ly.all') }, { value: 'sel', label: t('ly.sel', sel.length) }], st.scope, v => { st.scope = v; render(); })) : null,
      h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ly.dir')), seg([{ value: 'lr', label: t('ly.lr') }, { value: 'tb', label: t('ly.tb') }], o.dir, v => { o.dir = v; render(); })),
      h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ly.style')), seg([{ value: 'layers', label: t('ly.st.layers') }, { value: 'snake', label: t('ly.st.snake') }], o.style, v => { o.style = v; render(); })),
      o.style === 'snake' ? h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ly.per')), seg([0, 3, 4, 5, 6, 8].map(n => ({ value: n, label: n ? String(n) : t('ly.per.auto') })), o.perRow, v => { o.perRow = v; render(); }), h('div', { class: 'hint' }, t('ly.snake.hint'))) : null,
      h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ly.gap')), seg([{ value: 'tight', label: t('ly.tight') }, { value: 'normal', label: t('ly.normal') }, { value: 'wide', label: t('ly.wide') }], o.gap, v => { o.gap = v; render(); })),
      h('div', { class: 'hint' }, t('ly.hint')),
      h('button', { class: 'btn primary wide', id: 'ly-go', onclick: () => {
        S.layout = { dir: o.dir, gap: o.gap, style: o.style, perRow: o.perRow }; saveSettings(); closePopover();
        const rc = stage.getBoundingClientRect(), n = autoLayout({ ids: st.scope === 'sel' ? new Set(sel) : null, dir: o.dir, gap: o.gap, style: o.style, perRow: o.perRow, aspect: Math.max(0.3, (rc.width - 120) / Math.max(200, rc.height - 220)) });
        if (!n) { toast(t('ly.few')); return; }
        commit(true); renderAll(); if (st.scope !== 'sel') fitAll(); toast(t('ly.done', n), 4200);
      } }, icon('wand', 16), t('ly.go')));
  };
  render();
  if (anchor) popover(anchor, body, { cls: 'pick-pop' });
  else { const m = openModal({ cls: 'small-m', build: mm => h('div', { class: 'm-wrap' }, modalHead(t('ly.title'), mm), h('div', { class: 'm-pad' }, body)) }); return m; }
}

TOOL_ITEMS.push({ id: 'layout', group: 'map', ic: 'wand', key: 'ly.btn', run: a => openLayoutDialog(a) });

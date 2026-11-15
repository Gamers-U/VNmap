'use strict';
/* ====== Геометрия и SVG-построители нод и стрелок (общие для экрана и экспорта) ====== */
const SIZE_CACHE = new Map();
const HDR = 44, ROW = 24, FOOT = 34;
const NORMAL = { t: [0, -1], r: [1, 0], b: [0, 1], l: [-1, 0] };
const OPP = { t: 'b', b: 't', l: 'r', r: 'l' };
const r2 = v => Math.round(v * 100) / 100;

function visibleRows(n) {
  const c = n.files.length;
  if (c === 0) return { rows: 1, files: 0, more: 0 };
  if (c <= 3) return { rows: c, files: c, more: 0 };
  return { rows: 3, files: 2, more: c - 2 };
}
function noteLines(n) { return wrapText(n.desc || '', NODE_W - 32, 13, 400, 6); }
function nodeSize(n) {
  const key = n.type + '|' + n.files.length + '|' + (n.type === 'note' ? n.desc : '');
  const c = SIZE_CACHE.get(n.id);
  if (c && c.key === key) return c.size;
  let size;
  if (n.type === 'note') {
    const L = noteLines(n);
    size = { w: NODE_W, h: Math.max(120, 40 * Math.ceil((54 + L.length * 18 + 18) / 40)) };
  } else {
    const { rows } = visibleRows(n);
    size = { w: NODE_W, h: 40 * Math.ceil((HDR + 8 + rows * ROW + FOOT) / 40) };
  }
  SIZE_CACHE.set(n.id, { key, size });
  return size;
}
function anchorPos(n, side) {
  const { w, h } = nodeSize(n);
  switch (side) {
    case 't': return [n.x + w / 2, n.y];
    case 'r': return [n.x + w, n.y + h / 2];
    case 'b': return [n.x + w / 2, n.y + h];
    default: return [n.x, n.y + h / 2];
  }
}
function bestSide(n, p) {
  let best = 'l', bd = 1e18;
  for (const sd of SIDES) {
    const q = anchorPos(n, sd), nm = NORMAL[sd];
    let d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if ((p[0] - q[0]) * nm[0] + (p[1] - q[1]) * nm[1] < 0) d += 160;
    if (d < bd) { bd = d; best = sd; }
  }
  return best;
}
function resolveSides(a, b, fs, ts) {
  if (fs !== 'auto' && ts !== 'auto') return [fs, ts];
  if (fs !== 'auto') return [fs, bestSide(b, anchorPos(a, fs))];
  if (ts !== 'auto') return [bestSide(a, anchorPos(b, ts)), ts];
  const A = nodeSize(a), B = nodeSize(b);
  if (b.x - (a.x + A.w) >= 40) return ['r', 'l'];
  if (a.x - (b.x + B.w) >= 40) return ['l', 'r'];
  return (b.y + B.h / 2) >= (a.y + A.h / 2) ? ['b', 't'] : ['t', 'b'];
}
const AH = 12, AW = 6.5, GAP = 2;
/** Плавная кривая от p0 (нормаль n0) до p1 (нормаль n1) со стрелкой на конце.
    via — необязательные точки излома (мировые координаты): путь проходит через них гладкой кривой. */
function bezierGeom(p0, n0, p1, n1, via) {
  const tip = [p1[0] + n1[0] * GAP, p1[1] + n1[1] * GAP];
  const base = [tip[0] + n1[0] * AH, tip[1] + n1[1] * AH];
  const ce = [base[0] - n1[0] * 3, base[1] - n1[1] * 3];
  const px = -n1[1], py = n1[0];
  const a = [base[0] + px * AW, base[1] + py * AW], b = [base[0] - px * AW, base[1] - py * AW];
  const f = pt => r2(pt[0]) + ' ' + r2(pt[1]);
  const head = `M${f(tip)} L${f(a)} L${f(ce)} L${f(b)} Z`;
  const bez = (A, C1, C2, B, u) => { const v = 1 - u; return [v * v * v * A[0] + 3 * v * v * u * C1[0] + 3 * v * u * u * C2[0] + u * u * u * B[0], v * v * v * A[1] + 3 * v * v * u * C1[1] + 3 * v * u * u * C2[1] + u * u * u * B[1]]; };
  if (!via || !via.length) {
    const dist = Math.hypot(ce[0] - p0[0], ce[1] - p0[1]);
    const c = clamp(dist * 0.45, 36, 260);
    const c0 = [p0[0] + n0[0] * c, p0[1] + n0[1] * c], c1 = [ce[0] + n1[0] * c, ce[1] + n1[1] * c];
    return {
      d: `M${f(p0)} C${f(c0)} ${f(c1)} ${f(ce)}`, head, mid: bez(p0, c0, c1, ce, 0.5), p0, tip, via: [], segs: [[p0, c0, c1, ce]], pts: [p0, ce]
    };
  }
  const pts = [p0, ...via, ce], n = pts.length;
  const dir = [];
  for (let i = 1; i < n - 1; i++) {
    const A = pts[i - 1], B = pts[i + 1], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    dir[i] = [dx / L, dy / L];
  }
  const segs = [];
  for (let i = 0; i < n - 1; i++) {
    const A = pts[i], B = pts[i + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const c1 = i === 0 ? (() => { const c = clamp(len * 0.45, 24, 260); return [A[0] + n0[0] * c, A[1] + n0[1] * c]; })() : [A[0] + dir[i][0] * len * 0.4, A[1] + dir[i][1] * len * 0.4];
    const c2 = i === n - 2 ? (() => { const c = clamp(len * 0.45, 24, 260); return [B[0] + n1[0] * c, B[1] + n1[1] * c]; })() : [B[0] - dir[i + 1][0] * len * 0.4, B[1] - dir[i + 1][1] * len * 0.4];
    segs.push([A, c1, c2, B]);
  }
  const d = `M${f(p0)} ` + segs.map(sg => `C${f(sg[1])} ${f(sg[2])} ${f(sg[3])}`).join(' ');
  /* середина пути — по длине, чтобы подпись не прыгала при перетаскивании точек */
  const samples = [], cum = [0];
  segs.forEach(sg => { for (let k = 0; k <= 12; k++) samples.push(bez(sg[0], sg[1], sg[2], sg[3], k / 12)); });
  for (let i = 1; i < samples.length; i++) cum.push(cum[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
  const half = cum[cum.length - 1] / 2; let mi = 1;
  while (mi < cum.length - 1 && cum[mi] < half) mi++;
  const u = (half - cum[mi - 1]) / ((cum[mi] - cum[mi - 1]) || 1);
  const mid = [samples[mi - 1][0] + (samples[mi][0] - samples[mi - 1][0]) * u, samples[mi - 1][1] + (samples[mi][1] - samples[mi - 1][1]) * u];
  return { d, head, mid, p0, tip, via, segs, pts };
}
/** Точка на кубическом сегменте. */
function bezAt(sg, u) { const v = 1 - u; return [v * v * v * sg[0][0] + 3 * v * v * u * sg[1][0] + 3 * v * u * u * sg[2][0] + u * u * u * sg[3][0], v * v * v * sg[0][1] + 3 * v * v * u * sg[1][1] + 3 * v * u * u * sg[2][1] + u * u * u * sg[3][1]]; }
/** В какой сегмент пути (между точками излома) ближе всего мировая точка w. */
function nearestSeg(G, w) {
  let best = 0, bd = 1e18;
  G.segs.forEach((sg, i) => { for (let k = 0; k <= 16; k++) { const q = bezAt(sg, k / 16), dd = (q[0] - w[0]) ** 2 + (q[1] - w[1]) ** 2; if (dd < bd) { bd = dd; best = i; } } });
  return best;
}
function edgeVia(e) { return Array.isArray(e.pts) ? e.pts.filter(p => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1])) : []; }
/** Несколько стрелок между одними и теми же блоками: номер стрелки в пучке и размер пучка. */
function parInfo(e) {
  if (!PAR_CACHE) {
    PAR_CACHE = new Map();
    const groups = new Map();
    for (const x of P.edges) { const k = x.from < x.to ? x.from + '|' + x.to : x.to + '|' + x.from; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
    for (const arr of groups.values()) arr.forEach((x, i) => PAR_CACHE.set(x.id, { i, n: arr.length, rev: x.from > x.to }));
  }
  return PAR_CACHE.get(e.id) || { i: 0, n: 1, rev: false };
}
const PAR_STEP = 52;
function edgeGeom(e) {
  const a = nodeById(e.from), b = nodeById(e.to);
  if (!a || !b) return null;
  const [sa, sb] = resolveSides(a, b, e.fromSide || 'auto', e.toSide || 'auto');
  const p0 = anchorPos(a, sa), p1 = anchorPos(b, sb);
  let via = edgeVia(e);
  if (!via.length) {
    const pi = parInfo(e);
    const off = (pi.i - (pi.n - 1) / 2) * PAR_STEP * (pi.rev ? -1 : 1);
    if (pi.n > 1 && Math.abs(off) > 0.01) {
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
      via = [[(p0[0] + p1[0]) / 2 - dy / L * off, (p0[1] + p1[1]) / 2 + dx / L * off]];
    }
  }
  const g = bezierGeom(p0, NORMAL[sa], p1, NORMAL[sb], via);
  g.sa = sa; g.sb = sb; g.viaAuto = !edgeVia(e).length && via.length > 0;
  return g;
}
function nodesBBox(nodes) {
  let x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18;
  for (const n of nodes) {
    const { w, h } = nodeSize(n);
    x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + w); y1 = Math.max(y1, n.y + h);
  }
  return nodes.length ? { x0, y0, x1, y1 } : null;
}

/* ---------- построитель ноды ---------- */
function buildNode(n, pl, live) {
  const { w, h } = nodeSize(n);
  const col = pl.colors[n.color] || pl.colors.blue;
  const on = onColor(col);
  const g = s('g', { class: 'node t-' + n.type, transform: `translate(${n.x} ${n.y})`, 'data-nid': live ? n.id : null });
  const us = unlockState(n);
  const locked = us && !us.ok;

  if (n.type === 'note') {
    g.append(s('rect', { class: 'n-body', width: w, height: h, rx: 16, fill: pl.surface }));
    g.append(s('rect', { width: w, height: h, rx: 16, fill: rgba(col, 0.2), stroke: rgba(col, 0.8), 'stroke-width': 1.5, 'pointer-events': 'none' }));
    const dn = !!n.done;
    g.append(iconG(dn ? 'check' : 'note', 14, 12, 18, col, dn ? 3 : undefined));
    g.append(s('text', { x: 38, y: 29, 'font-size': 15, 'font-weight': 600, fill: pl.text, 'text-decoration': dn ? 'line-through' : null, opacity: dn ? 0.55 : null }, fitText(n.title, w - 54, 15, 600)));
    noteLines(n).forEach((ln, i) => g.append(s('text', { x: 16, y: 56 + i * 18, 'font-size': 13, fill: pl.text, opacity: dn ? 0.55 : null }, ln)));
  } else {
    g.append(s('rect', { class: 'n-body', width: w, height: h, rx: 16, fill: pl.surface, stroke: pl.border, 'stroke-width': 1 }));
    const r = 16;
    g.append(s('path', { d: `M0 ${HDR} V${r} A${r} ${r} 0 0 1 ${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${HDR} Z`, fill: col, 'pointer-events': 'none' }));
    g.append(iconG(TYPE_ICON[n.type], 14, 11, 22, on));
    let rx = w - 14;
    if (n.files.length) {
      const pw = 38;
      g.append(s('rect', { x: rx - pw, y: 11, width: pw, height: 22, rx: 11, fill: rgba(on, 0.2), 'pointer-events': 'none' }));
      g.append(iconG('file', rx - pw + 8, 16, 12, on, 2.4));
      g.append(s('text', { x: rx - pw + 24, y: 26.5, 'font-size': 12, 'font-weight': 700, fill: on, 'pointer-events': 'none' }, String(n.files.length)));
      rx -= pw + 6;
    }
    if (us) { g.append(iconG(locked ? 'lock' : 'unlock', rx - 18, 13, 18, on, 2.2)); rx -= 24; }
    g.append(s('text', { x: 44, y: 28.5, 'font-size': 15, 'font-weight': 650, fill: on, 'pointer-events': 'none' }, fitText(n.title, rx - 44, 15, 650)));

    const vr = visibleRows(n);
    const rows = s('g', { class: 'rows' });
    for (let i = 0; i < vr.files; i++) {
      const f = n.files[i], y = HDR + 6 + i * ROW;
      const row = s('g', { class: 'row', 'data-fid': live ? f.id : null });
      row.append(s('rect', { class: 'row-hit', x: 6, y, width: w - 12, height: ROW - 2, rx: 8, fill: 'transparent' }));
      row.append(s('circle', { cx: 20, cy: y + 11, r: 4.5, fill: pl.colors[STATUS_COLOR[f.status]], 'pointer-events': 'none' }));
      row.append(s('text', { x: 33, y: y + 16, 'font-size': 13, fill: pl.text, 'pointer-events': 'none' }, fitText(f.title || t('file.untitled'), w - 33 - 16, 13)));
      rows.append(row);
    }
    if (vr.more > 0) {
      const y = HDR + 6 + vr.files * ROW;
      const row = s('g', { class: 'row more', 'data-more': live ? '1' : null });
      row.append(s('rect', { class: 'row-hit', x: 6, y, width: w - 12, height: ROW - 2, rx: 8, fill: 'transparent' }));
      row.append(s('text', { x: 33, y: y + 16, 'font-size': 13, 'font-weight': 600, fill: pl.text2, 'pointer-events': 'none' }, t('node.more', vr.more)));
      row.append(iconG('chevR', w - 30, y + 5, 14, pl.text2, 2.4));
      rows.append(row);
    }
    if (!n.files.length) {
      const y = HDR + 6;
      rows.append(s('text', { x: 20, y: y + 16, 'font-size': 13, 'font-style': 'italic', fill: pl.text3, 'pointer-events': 'none' }, t('node.empty')));
    }
    g.append(rows);

    const pr = nodeProgress(n);
    const foot = s('g', { class: 'foot', 'pointer-events': 'none' });
    foot.append(s('rect', { x: 16, y: h - 27, width: w - 32, height: 6, rx: 3, fill: pl.track }));
    if (pr.pct > 0) foot.append(s('rect', { x: 16, y: h - 27, width: Math.max(6, (w - 32) * pr.pct), height: 6, rx: 3, fill: col }));
    foot.append(s('text', { x: 16, y: h - 9, 'font-size': 11, fill: pl.text2 }, n.files.length ? t('node.prog', pr.done, pr.total) : '—'));
    if (us) foot.append(s('text', { x: w - 16, y: h - 9, 'font-size': 11, 'font-weight': 600, 'text-anchor': 'end', fill: locked ? pl.text2 : pl.colors.green }, t('node.unlock.short', us.have, us.need)));
    g.append(foot);
    if (P.members && P.members.length) { const mids = nodeMemberIds(n); if (mids.length) g.append(memberBadgesG(mids, w, h, pl)); }
    if (P.startId === n.id) {
      const txt = t('node.start'), bw = Math.ceil(textW(txt, 10.5, 700)) + 30, gc = pl.colors.green, gt = onColor(gc);
      const b = s('g', { class: 'start-badge', 'pointer-events': 'none', transform: 'translate(0 -25)' });
      b.append(s('rect', { width: bw, height: 20, rx: 10, fill: gc }));
      b.append(s('path', { d: 'M9.5 5.2v9.6l7.4-4.8z', fill: gt }));
      b.append(s('text', { x: 22, y: 14, 'font-size': 10.5, 'font-weight': 700, fill: gt }, txt));
      g.append(b);
    }
    if (live) { const cb = cmBadgeG(n, w, pl); if (cb) g.append(cb); }
  }
  if (live) {
    g.append(s('rect', { class: 'sel-ring', x: -5, y: -5, width: w + 10, height: h + 10, rx: 21, fill: 'none' }));
    for (const sd of SIDES) {
      const [ax, ay] = [sd === 'l' ? 0 : sd === 'r' ? w : w / 2, sd === 't' ? 0 : sd === 'b' ? h : h / 2];
      const a = s('g', { class: 'anchor', 'data-anchor': sd, transform: `translate(${ax} ${ay})` });
      a.append(s('circle', { class: 'a-hit', r: 10, fill: 'transparent' }));
      a.append(s('circle', { class: 'a-dot', r: 6, fill: pl.surface, stroke: pl.colors.blue === col ? pl.accent : pl.accent, 'stroke-width': 2.2 }));
      g.append(a);
    }
  }
  return g;
}

/* ---------- построитель стрелки ---------- */
function buildEdge(e, pl, live) {
  const G = edgeGeom(e);
  if (!G) return null;
  const col = e.color ? (pl.colors[e.color] || pl.edge) : pl.edge;
  const g = s('g', { class: 'edge', 'data-eid': live ? e.id : null });
  if (live) g.append(s('path', { class: 'e-hit', d: G.d, fill: 'none' }));
  g.append(s('path', { class: 'e-line', d: G.d, fill: 'none', stroke: col, 'stroke-width': live ? null : 2, 'stroke-linecap': 'round', 'stroke-dasharray': e.dashed ? '7 6' : null }));
  g.append(s('path', { class: 'e-head', d: G.head, fill: col, stroke: col, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  const lo = Array.isArray(e.lo) ? e.lo : null;      // плашку с названием можно сдвинуть: она остаётся связанной со стрелкой тонкой линией
  const lg = s('g', { transform: `translate(${r2(G.mid[0] + (lo ? lo[0] : 0))} ${r2(G.mid[1] + (lo ? lo[1] : 0))})` });
  if (lo) { lg.append(s('line', { class: 'lbl-leader', x1: -lo[0], y1: -lo[1], x2: 0, y2: 0, stroke: col })); lg.append(s('circle', { class: 'lbl-anchor', cx: -lo[0], cy: -lo[1], r: 3, fill: col })); }
  const inner = s('g', { class: 'e-label' });
  if (e.title) {
    const txt = fitText(e.title, 180, 12, 600), bw = textW(txt, 12, 600) + 24;
    inner.append(s('rect', { class: 'e-pill', x: -bw / 2, y: -12.5, width: bw, height: 25, rx: 12.5, fill: pl.edgeLabelBg, stroke: col, 'stroke-width': 1.6 }));
    inner.append(s('text', { x: 0, y: 4.3, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: pl.text, 'pointer-events': 'none' }, txt));
  } else {
    inner.append(s('circle', { class: 'e-dot', r: 5.5, fill: pl.edgeLabelBg, stroke: col, 'stroke-width': 2 }));
  }
  lg.append(inner);
  const sets = (e.sets || []).map(st => setText(varById(st.v), st)).filter(Boolean);
  if (sets.length) {
    /* что этот выбор запоминает: фиолетовая подпись под стрелкой */
    const lab = '⚑ ' + fitText(sets.join(', '), 190, 11, 600), tw = textW(lab, 11, 600) + 14;
    /* у пучка параллельных стрелок подпись верхней уходит вверх, нижней — вниз, чтобы не наезжать друг на друга */
    let up = false; const pi = parInfo(e);
    if (pi.n > 1) {
      const sib = P.edges.filter(x => (x.from === e.from && x.to === e.to) || (x.from === e.to && x.to === e.from)).map(x => edgeGeom(x)).filter(Boolean);
      const avg = sib.reduce((a, g) => a + g.mid[1], 0) / (sib.length || 1);
      up = G.mid[1] < avg - 1;
    }
    const yy = up ? (e.title ? -26 : -15) : (e.title ? 31 : 20), fl = s('g', { class: 'e-sets' });
    fl.append(s('rect', { x: -tw / 2, y: yy - 11.5, width: tw, height: 18, rx: 9, fill: pl.edgeLabelBg, stroke: pl.colors.purple, 'stroke-width': 1.3, opacity: 0.96 }));
    fl.append(s('text', { x: 0, y: yy + 1.5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: pl.colors.purple, 'pointer-events': 'none' }, lab));
    lg.append(fl);
  }
  g.append(lg);
  return g;
}

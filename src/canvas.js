'use strict';
/* ====== Холст: пан/зум, сетка, ноды, стрелки, выделение, панель инструментов ====== */
let stage, svg, world, gEdges, gEchoes, gNodes, gOver, gHandles, CTX_SUPPRESS = 0;
const NODE_EL = new Map(), EDGE_EL = new Map();
let drag = null, lastClick = { key: '', t: 0, x: 0, y: 0 }, tipEl = null, animTok = null, edgeHintShown = false;

function initCanvas() {
  stage = $('#stage');
  svg = s('svg', { id: 'svg', 'font-family': FONT_FAMILY });
  world = s('g', { id: 'world' });
  gJumps = s('g', { id: 'jumps' }); gEchoes = s('g', { id: 'echoes' }); gEdges = s('g', { id: 'edges' }); gNodes = s('g', { id: 'nodes' }); gOver = s('g', { id: 'over' }); gHandles = s('g', { id: 'handles' });
  world.append(gJumps, gEchoes, gEdges, gNodes, gHandles, gOver); svg.append(world); stage.append(svg);
  svg.addEventListener('pointerdown', onPointerDown);
  svg.addEventListener('pointermove', onHoverMove);
  svg.addEventListener('pointerleave', () => { UI.hoverEdge = null; hideTip(); });
  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('contextmenu', onContext);
  window.addEventListener('resize', () => { positionToolbar(); });
}
const toWorld = (cx, cy) => { const r = stage.getBoundingClientRect(), v = P.view; return { x: (cx - r.left - v.x) / v.k, y: (cy - r.top - v.y) / v.k }; };

/* ---------- вид и сетка ---------- */
function applyView() {
  const v = P.view;
  world.setAttribute('transform', `translate(${r2(v.x)} ${r2(v.y)}) scale(${v.k})`);
  svg.style.setProperty('--sw', Math.max(2, 1.5 / v.k).toFixed(2) + 'px');
  applyGrid();
  if (UI.edge) renderHandles();
  positionToolbar();
  if (typeof updateZoomLabel === 'function') updateZoomLabel();
  scheduleSave();
}
function applyGrid() {
  const v = P.view, mode = S.grid;
  if (mode === 'off') { stage.style.backgroundImage = 'none'; return; }
  const minor = GRID * v.k, major = GRID * 5 * v.k, ox = v.x, oy = v.y;
  const L = [], Z = [], O = [];
  if (mode === 'dots') {
    const r = clamp(v.k * 1.15, 0.9, 1.7);
    L.push(`radial-gradient(circle at 50% 50%, var(--grid-dot-strong) 0, var(--grid-dot-strong) ${(r * 1.35).toFixed(2)}px, transparent ${(r * 1.35 + 0.8).toFixed(2)}px)`);
    Z.push(`${major}px ${major}px`); O.push(`${ox - major / 2}px ${oy - major / 2}px`);
    if (minor >= 9) {
      L.push(`radial-gradient(circle at 50% 50%, var(--grid-dot) 0, var(--grid-dot) ${r.toFixed(2)}px, transparent ${(r + 0.8).toFixed(2)}px)`);
      Z.push(`${minor}px ${minor}px`); O.push(`${ox - minor / 2}px ${oy - minor / 2}px`);
    }
  } else {
    L.push('linear-gradient(to right, var(--grid-line-strong) 1px, transparent 1px)', 'linear-gradient(to bottom, var(--grid-line-strong) 1px, transparent 1px)');
    Z.push(`${major}px ${major}px`, `${major}px ${major}px`); O.push(`${ox}px ${oy}px`, `${ox}px ${oy}px`);
    if (minor >= 9) {
      L.push('linear-gradient(to right, var(--grid-line) 1px, transparent 1px)', 'linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)');
      Z.push(`${minor}px ${minor}px`, `${minor}px ${minor}px`); O.push(`${ox}px ${oy}px`, `${ox}px ${oy}px`);
    }
  }
  stage.style.backgroundImage = L.join(',');
  stage.style.backgroundSize = Z.join(',');
  stage.style.backgroundPosition = O.join(',');
}
function zoomAt(cx, cy, nk) {
  nk = clamp(nk, 0.08, 3);
  const v = P.view, r = stage.getBoundingClientRect(), px = cx - r.left, py = cy - r.top;
  v.x = px - (px - v.x) * (nk / v.k); v.y = py - (py - v.y) * (nk / v.k); v.k = nk;
  applyView();
}
function zoomCenter(f) { const r = stage.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, P.view.k * f); }
function cancelAnim() { animTok = null; }
function animateTo(tx, ty, tk, ms = 460) {
  const v = P.view, a = { x: v.x, y: v.y, k: v.k }, t0 = performance.now(), tok = {};
  animTok = tok;
  (function step(now) {
    if (animTok !== tok) return;
    let u = Math.min(1, (now - t0) / ms); u = 1 - Math.pow(1 - u, 3);
    v.x = a.x + (tx - a.x) * u; v.y = a.y + (ty - a.y) * u; v.k = a.k + (tk - a.k) * u;
    applyView();
    if (u < 1) requestAnimationFrame(step); else animTok = null;
  })(t0);
}
function centerOn(wx, wy, k, animate = true) {
  const r = stage.getBoundingClientRect(), tx = r.width / 2 - wx * k, ty = r.height / 2 - wy * k + 10;
  if (animate) animateTo(tx, ty, k); else { P.view.x = tx; P.view.y = ty; P.view.k = k; applyView(); }
}
function fitAll(animate = true) {
  const bb = nodesBBox(P.nodes), r = stage.getBoundingClientRect();
  if (!bb) { if (animate) animateTo(120, 160, 1); else { Object.assign(P.view, { x: 120, y: 160, k: 1 }); applyView(); } return; }
  const bw = bb.x1 - bb.x0, bh = bb.y1 - bb.y0;
  const k = clamp(Math.min((r.width - 120) / bw, (r.height - 220) / bh, 1.1), 0.1, 1.1);
  centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, k, animate);
}
function focusNode(id, { open = false } = {}) {
  const n = nodeById(id); if (!n) return;
  const { w, h } = nodeSize(n);
  centerOn(n.x + w / 2, n.y + h / 2, Math.max(P.view.k, 0.85));
  setSel([id]);
  const el = NODE_EL.get(id);
  if (el) { el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 2600); }
  if (open) openNodeModal(id);
}

/* ---------- отрисовка ---------- */
let _rAll = 0, _rEdges = 0;
function renderNodes() {
  gNodes.replaceChildren(); NODE_EL.clear();
  const pl = pal();
  for (const n of P.nodes) {
    const el = buildNode(n, pl, true);
    if (UI.sel.has(n.id)) el.classList.add('sel');
    if (isDimmed(n.id)) el.classList.add('dim');
    NODE_EL.set(n.id, el); gNodes.append(el);
  }
}
function renderEdges() {
  gEdges.replaceChildren(); EDGE_EL.clear();
  const pl = pal();
  for (const e of P.edges) {
    const el = buildEdge(e, pl, true);
    if (!el) continue;
    if (UI.edge === e.id) el.classList.add('sel');
    EDGE_EL.set(e.id, el); gEdges.append(el);
  }
  renderEchoes(); renderJumps();
  renderHandles();
}
function refreshNode(id) {
  const n = nodeById(id), old = NODE_EL.get(id);
  if (!n || !old) { scheduleRender(); return; }
  const el = buildNode(n, pal(), true);
  el.setAttribute('class', old.getAttribute('class'));
  old.replaceWith(el); NODE_EL.set(id, el);
  scheduleEdges(); positionToolbar();
}
function renderAll() { renderEdges(); renderNodes(); if (typeof updateStatus === 'function') updateStatus(); buildToolbar(); if (typeof collabMarks === 'function') collabMarks(); }
function scheduleRender() { if (_rAll) return; _rAll = requestAnimationFrame(() => { _rAll = 0; renderAll(); }); }
function scheduleEdges() { if (_rEdges) return; _rEdges = requestAnimationFrame(() => { _rEdges = 0; renderEdges(); positionToolbar(); }); }
function applyHits(set) {
  UI.hits = set;
  NODE_EL.forEach((el, id) => el.classList.toggle('dim', isDimmed(id)));
}

/* ---------- выделение ---------- */
function refreshSel() {
  NODE_EL.forEach((el, id) => el.classList.toggle('sel', UI.sel.has(id)));
  EDGE_EL.forEach((el, id) => el.classList.toggle('sel', UI.edge === id));
  renderEchoes(); renderJumps();
  renderHandles();
}
/** Где стоит «призрак» на сегменте i. Если в этом месте лежит плашка стрелки, призрак сдвигается вдоль сегмента,
    чтобы не мешать её перетаскивать. */
function ghostPos(e, G, i) {
  const lo = Array.isArray(e.lo) ? e.lo : [0, 0], lx = G.mid[0] + lo[0], ly = G.mid[1] + lo[1], k = 1 / P.view.k;
  const hw = (e.title ? textW(fitText(e.title, 180, 12, 600), 12, 600) / 2 + 12 : 6) + 14 * k, hh = 12.5 + 14 * k;
  const hit = m => Math.abs(m[0] - lx) < hw && Math.abs(m[1] - ly) < hh;
  if (G.viaAuto) {
    if (!hit(G.via[0])) return G.via[0];
    return [bezAt(G.segs[0], 0.5), bezAt(G.segs[G.segs.length - 1], 0.5)].find(m => !hit(m)) || G.via[0];
  }
  for (const u of [0.5, 0.3, 0.7, 0.2, 0.8, 0.12, 0.88]) { const m = bezAt(G.segs[i], u); if (!hit(m)) return m; }
  return bezAt(G.segs[i], 0.5);
}
/** Точки излома выбранной стрелки (круги) и «призраки» между ними: за призрак можно потянуть и добавить новую точку. */
function renderHandles() {
  if (!gHandles) return;
  gHandles.replaceChildren();
  if (!UI.edge) return;
  const e = edgeById(UI.edge), G = e && edgeGeom(e); if (!G) return;
  const k = 1 / P.view.k;
  (G.viaAuto ? [0] : G.segs.map((_, i) => i)).forEach(i => {
    const m = ghostPos(e, G, i);
    const g = s('g', { class: 'wp ghost', 'data-seg': i, transform: `translate(${r2(m[0])} ${r2(m[1])}) scale(${k})` });
    g.append(s('circle', { class: 'wp-hit', r: 13, fill: 'transparent' }), s('circle', { class: 'wp-dot', r: 5 }));
    gHandles.append(g);
  });
  (G.viaAuto ? [] : G.via).forEach((p, i) => {
    const g = s('g', { class: 'wp', 'data-wp': i, transform: `translate(${r2(p[0])} ${r2(p[1])}) scale(${k})` });
    g.append(s('circle', { class: 'wp-hit', r: 13, fill: 'transparent' }), s('circle', { class: 'wp-dot', r: 6.5 }));
    gHandles.append(g);
  });
}
function setSel(ids = [], edgeId = null) {
  UI.sel = new Set(ids); UI.edge = edgeId;
  refreshSel(); buildToolbar();
}

/* ---------- указатель ---------- */
function attach() { window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp); }
function detach() { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); }

function onPointerDown(e) {
  const tg = e.target;
  if (e.button === 2) {
    /* правая кнопка по пустому месту: тянем рамку выделения (без движения — обычное меню) */
    if (tg.closest('[data-nid]') || tg.closest('[data-eid]') || tg.closest('.wp') || UI.connectMode) return;
    hideTip(); cancelAnim(); closePopover();
    startMarquee(e); return;
  }
  const ae = document.activeElement;
  if (ae && ae !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) ae.blur();
  hideTip(); cancelAnim();
  if (UI.connectMode && e.button === 0) {
    const nEl = tg.closest('[data-nid]');
    if (nEl && nEl.dataset.nid !== UI.connectMode) {
      const ed = addEdge(UI.connectMode, nEl.dataset.nid, 'auto', 'auto');
      commit(true); endConnectMode(); renderEdges(); setSel([], ed.id); edgeCreatedHint();
    } else endConnectMode();
    e.preventDefault(); return;
  }
  const anchorEl = tg.closest('.anchor'), nodeEl = tg.closest('[data-nid]'), edgeEl = tg.closest('[data-eid]'), wpEl = tg.closest('.wp');
  if (e.button === 1) { e.preventDefault(); startPan(e); return; }
  if (e.button !== 0) return;
  if (wpEl && UI.edge) { startWpDrag(e, wpEl); return; }
  if (anchorEl && nodeEl) { startConnectDrag(e, nodeEl.dataset.nid, anchorEl.dataset.anchor); return; }
  const lblEl = tg.closest('[data-lkey]');                     // плашка у «эха» или стрелки по коду
  if (lblEl && !nodeEl) { drag = { type: 'plbl', key: lblEl.dataset.lkey, lo0: lofOf(lblEl.dataset.lkey).slice(), sx: e.clientX, sy: e.clientY, moved: false }; attach(); return; }
  if (nodeEl) { startNodeDrag(e, nodeEl, tg); return; }
  if (edgeEl && tg.closest('.e-label') && edgeById(edgeEl.dataset.eid)) {        // плашку с названием можно перетащить
    const ed = edgeById(edgeEl.dataset.eid);
    drag = { type: 'elbl', id: ed.id, lo0: (ed.lo || [0, 0]).slice(), sx: e.clientX, sy: e.clientY, moved: false }; attach(); return;
  }
  if (edgeEl) { drag = { type: 'edge', id: edgeEl.dataset.eid, sx: e.clientX, sy: e.clientY, moved: false }; attach(); return; }
  if (e.shiftKey) startMarquee(e); else startPan(e);
}
function startPan(e) {
  drag = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: P.view.x, vy: P.view.y, moved: false, shift: e.shiftKey, btn: e.button };
  stage.classList.add('panning'); attach();
}
function startNodeDrag(e, nodeEl, tg) {
  const id = nodeEl.dataset.nid; let added = false;
  if (e.shiftKey) { if (!UI.sel.has(id)) { UI.sel.add(id); added = true; } UI.edge = null; }
  else if (!UI.sel.has(id)) { UI.sel = new Set([id]); UI.edge = null; }
  refreshSel(); buildToolbar();
  const starts = new Map();
  UI.sel.forEach(i => { const m = nodeById(i); if (m) starts.set(i, { x: m.x, y: m.y }); });
  const rowEl = tg.closest('[data-fid]'), moreEl = tg.closest('[data-more]'), cmEl = tg.closest('[data-cm]');
  /* стрелки внутри перетаскиваемой группы двигаются вместе с ней, вместе со своими точками излома */
  const edgePts = P.edges.filter(ed => ed.pts && ed.pts.length && starts.has(ed.from) && starts.has(ed.to)).map(ed => ({ e: ed, pts: ed.pts.map(q => q.slice()) }));
  drag = { type: 'node', id, sx: e.clientX, sy: e.clientY, moved: false, starts, lx: 0, ly: 0, shift: e.shiftKey, added, fid: rowEl ? rowEl.dataset.fid : null, more: !!moreEl, cmEl, edgePts };
  attach();
}
function startMarquee(e) {
  const w0 = toWorld(e.clientX, e.clientY);
  const rect = s('rect', { class: 'marquee', x: w0.x, y: w0.y, width: 0, height: 0 });
  gOver.append(rect);
  const add = e.button === 0 || e.shiftKey || e.ctrlKey || e.metaKey;   // правой кнопкой без Shift выделение начинается заново
  drag = { type: 'marquee', rect, w0, base: add ? new Set(UI.sel) : new Set(), moved: false, sx: e.clientX, sy: e.clientY, btn: e.button, pendingCtx: null };
  stage.classList.add('marqueeing');
  attach();
}
function startWpDrag(e, el) {
  const ed = edgeById(UI.edge); if (!ed) return;
  ed.pts = edgeVia(ed).map(q => q.slice());
  let idx, created = false;
  if (el.dataset.seg != null) {
    const G = edgeGeom(ed), sg = +el.dataset.seg, m = ghostPos(ed, G, sg);
    ed.pts.splice(sg, 0, [m[0], m[1]]); idx = sg; created = true;
  } else idx = +el.dataset.wp;
  drag = { type: 'wp', id: ed.id, idx, created, sx: e.clientX, sy: e.clientY, moved: false };
  attach();
}
const wpSnap = (w, alt) => (S.snap && !alt) ? [snapTo(w.x, GRID), snapTo(w.y, GRID)] : [Math.round(w.x), Math.round(w.y)];
function startConnectDrag(e, nid, side) {
  svg.classList.add('connecting');
  const tmp = s('path', { class: 'tmp-edge', fill: 'none' }), head = s('path', { class: 'tmp-head' });
  gOver.append(tmp, head);
  drag = { type: 'connect', from: nid, side, tmp, head, sx: e.clientX, sy: e.clientY, moved: false, target: null, tside: 'auto', tgtEl: null };
  attach(); updateConnect(e);
}
function updateConnect(e) {
  const a = nodeById(drag.from); if (!a) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  let tn = null, ts = 'auto';
  const nEl = el && el.closest ? el.closest('[data-nid]') : null;
  if (nEl && nEl.dataset.nid !== drag.from) {
    tn = nodeById(nEl.dataset.nid);
    const aEl = el.closest('.anchor'); if (aEl) ts = aEl.dataset.anchor;
  }
  const tgtEl = tn ? NODE_EL.get(tn.id) : null;
  if (drag.tgtEl !== tgtEl) { if (drag.tgtEl) drag.tgtEl.classList.remove('tgt'); if (tgtEl) tgtEl.classList.add('tgt'); drag.tgtEl = tgtEl; }
  const p0 = anchorPos(a, drag.side), n0 = NORMAL[drag.side];
  let G;
  if (tn) { const sb = ts === 'auto' ? bestSide(tn, p0) : ts; G = bezierGeom(p0, n0, anchorPos(tn, sb), NORMAL[sb]); }
  else {
    const w = toWorld(e.clientX, e.clientY), dx = w.x - p0[0], dy = w.y - p0[1];
    const n1 = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? [-1, 0] : [1, 0]) : (dy >= 0 ? [0, -1] : [0, 1]);
    G = bezierGeom(p0, n0, [w.x, w.y], n1);
  }
  drag.tmp.setAttribute('d', G.d); drag.head.setAttribute('d', G.head);
  drag.target = tn ? tn.id : null; drag.tside = ts;
}
function onMove(e) {
  if (!drag) return;
  const d = drag, v = P.view;
  const dist = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
  switch (d.type) {
    case 'pan':
      if (!d.moved && dist < 3) return; d.moved = true;
      v.x = d.vx + (e.clientX - d.sx); v.y = d.vy + (e.clientY - d.sy); applyView(); break;
    case 'node': {
      if (!d.moved) { if (dist < 4) return; d.moved = true; document.body.classList.add('dragging'); }
      const base = d.starts.get(d.id); if (!base) return;
      const sn = x => S.snap ? snapTo(x, GRID) : Math.round(x);
      const ndx = sn(base.x + (e.clientX - d.sx) / v.k) - base.x, ndy = sn(base.y + (e.clientY - d.sy) / v.k) - base.y;
      if (ndx === d.lx && ndy === d.ly) return;
      d.lx = ndx; d.ly = ndy;
      d.edgePts.forEach(o => { o.e.pts = o.pts.map(q => [q[0] + ndx, q[1] + ndy]); });
      d.starts.forEach((st, id) => {
        const m = nodeById(id); if (!m) return;
        m.x = st.x + ndx; m.y = st.y + ndy;
        const el = NODE_EL.get(id); if (el) el.setAttribute('transform', `translate(${m.x} ${m.y})`);
      });
      scheduleEdges(); break;
    }
    case 'marquee': {
      if (!d.moved && dist < 3) return; d.moved = true;
      const w = toWorld(e.clientX, e.clientY);
      const x = Math.min(d.w0.x, w.x), y = Math.min(d.w0.y, w.y), ww = Math.abs(w.x - d.w0.x), hh = Math.abs(w.y - d.w0.y);
      d.rect.setAttribute('x', x); d.rect.setAttribute('y', y); d.rect.setAttribute('width', ww); d.rect.setAttribute('height', hh);
      const sel = new Set(d.base);
      for (const n of P.nodes) { const z = nodeSize(n); if (n.x < x + ww && n.x + z.w > x && n.y < y + hh && n.y + z.h > y) sel.add(n.id); }
      UI.sel = sel; UI.edge = null; refreshSel(); break;
    }
    case 'connect':
      if (!d.moved && dist < 4) return; d.moved = true; updateConnect(e); break;
    case 'edge': {
      if (dist <= 4) break;
      /* потянули стрелку за любое место: ставим там точку излома и тащим её */
      const ed = edgeById(d.id), G = ed && edgeGeom(ed); if (!G) { drag = null; detach(); break; }
      const w0 = toWorld(d.sx, d.sy), si = Math.min(nearestSeg(G, [w0.x, w0.y]), edgeVia(ed).length);
      ed.pts = edgeVia(ed).map(q => q.slice()); ed.pts.splice(si, 0, [w0.x, w0.y]);
      hideTip(); UI.hoverEdge = null;
      if (UI.edge !== ed.id) { UI.sel = new Set(); UI.edge = ed.id; refreshSel(); buildToolbar(); }
      Object.assign(d, { type: 'wp', idx: si, created: true, moved: true });
      onMove(e); break;
    }
    case 'elbl': {
      if (!d.moved) { if (dist < 4) return; d.moved = true; document.body.classList.add('dragging'); hideTip(); UI.hoverEdge = null; if (UI.edge !== d.id) { UI.sel = new Set(); UI.edge = d.id; refreshSel(); buildToolbar(); } }
      const ed = edgeById(d.id); if (!ed) return;
      const lo = [Math.round(d.lo0[0] + (e.clientX - d.sx) / v.k), Math.round(d.lo0[1] + (e.clientY - d.sy) / v.k)];
      if (ed.lo && ed.lo[0] === lo[0] && ed.lo[1] === lo[1]) return;
      ed.lo = lo; scheduleEdges(); break;
    }
    case 'plbl': {
      if (!d.moved) { if (dist < 4) return; d.moved = true; document.body.classList.add('dragging'); }
      const lo = [Math.round(d.lo0[0] + (e.clientX - d.sx) / v.k), Math.round(d.lo0[1] + (e.clientY - d.sy) / v.k)];
      if (!P.lofs) P.lofs = {};
      const cur = P.lofs[d.key]; if (cur && cur[0] === lo[0] && cur[1] === lo[1]) return;
      P.lofs[d.key] = lo; scheduleEdges(); break;
    }
    case 'wp': {
      if (!d.moved) { if (dist < 3) return; d.moved = true; }
      const ed = edgeById(d.id); if (!ed || !ed.pts[d.idx]) return;
      const pt = wpSnap(toWorld(e.clientX, e.clientY), e.altKey);
      if (ed.pts[d.idx][0] === pt[0] && ed.pts[d.idx][1] === pt[1]) return;
      ed.pts[d.idx] = pt; scheduleEdges(); break;
    }
  }
}
function onUp(e) {
  if (!drag) return;
  const d = drag; drag = null; detach();
  stage.classList.remove('panning'); document.body.classList.remove('dragging');
  const now = performance.now();
  switch (d.type) {
    case 'pan':
      if (d.moved) { scheduleSave(); break; }
      if (d.btn !== 0) break;
      if (!d.shift) setSel([]);
      if (lastClick.key === 'bg' && now - lastClick.t < 420 && Math.hypot(e.clientX - lastClick.x, e.clientY - lastClick.y) < 8) {
        const w = toWorld(e.clientX, e.clientY); createNodeAt('chapter', w.x, w.y); lastClick.key = '';
      } else lastClick = { key: 'bg', t: now, x: e.clientX, y: e.clientY };
      break;
    case 'marquee':
      d.rect.remove(); stage.classList.remove('marqueeing'); buildToolbar();
      if (d.btn === 2) {
        if (d.moved) CTX_SUPPRESS = performance.now() + 700;           // меню после рамки не нужно
        else if (d.pendingCtx) bgMenu(d.pendingCtx.x, d.pendingCtx.y); // macOS/Linux: меню было отложено до отпускания
      }
      break;
    case 'wp': {
      const ed = edgeById(d.id);
      if (!ed) break;
      if (d.created && !d.moved) { ed.pts.splice(d.idx, 1); scheduleEdges(); break; }       // просто нажали на «призрак»
      if (!d.moved) {                                                                            // двойной щелчок по точке — убрать
        if (lastClick.key === 'w:' + d.id + ':' + d.idx && now - lastClick.t < 420) { lastClick.key = ''; ed.pts.splice(d.idx, 1); commit(true); scheduleEdges(); }
        else lastClick = { key: 'w:' + d.id + ':' + d.idx, t: now, x: e.clientX, y: e.clientY };
        break;
      }
      commit(true); positionToolbar(); break;
    }
    case 'node':
      if (d.moved) { commit(true); positionToolbar(); break; }
      if (d.shift) { if (!d.added) { UI.sel.delete(d.id); refreshSel(); buildToolbar(); } break; }
      if (UI.sel.size > 1) setSel([d.id]);
      if (d.cmEl) { openCmPopover(d.cmEl, d.id); break; }
      if (d.fid) { openNodeModal(d.id, d.fid); break; }
      if (d.more) { openNodeModal(d.id, null); break; }
      if (lastClick.key === 'n:' + d.id && now - lastClick.t < 420) { lastClick.key = ''; openNodeModal(d.id); }
      else lastClick = { key: 'n:' + d.id, t: now, x: e.clientX, y: e.clientY };
      break;
    case 'elbl':
      if (d.moved) { const ed = edgeById(d.id); if (ed && ed.lo && !ed.lo[0] && !ed.lo[1]) ed.lo = null; commit(true); buildToolbar(); positionToolbar(); break; }
    // eslint-disable-next-line no-fallthrough
    case 'edge':
      setSel([], d.id);
      if (lastClick.key === 'e:' + d.id && now - lastClick.t < 420) { lastClick.key = ''; openEdgeModal(d.id); }
      else lastClick = { key: 'e:' + d.id, t: now, x: e.clientX, y: e.clientY };
      break;
    case 'plbl':
      if (d.moved) { if (P.lofs && P.lofs[d.key] && !P.lofs[d.key][0] && !P.lofs[d.key][1]) delete P.lofs[d.key]; commit(true); break; }
      if (lastClick.key === 'l:' + d.key && now - lastClick.t < 420) { lastClick.key = ''; if (d.key.startsWith('j:')) jumpOpenSource(d.key); }
      else { lastClick = { key: 'l:' + d.key, t: now, x: e.clientX, y: e.clientY }; if (d.key.startsWith('j:')) toast(t('jmp.pill.hint'), 2600); }
      break;
    case 'connect': {
      svg.classList.remove('connecting'); d.tmp.remove(); d.head.remove();
      if (d.tgtEl) d.tgtEl.classList.remove('tgt');
      if (d.target) {
        const ed = addEdge(d.from, d.target, d.side, d.tside);
        commit(true); renderEdges(); setSel([], ed.id); edgeCreatedHint();
      } else if (d.moved) {
        const w = toWorld(e.clientX, e.clientY);
        showMenu(e.clientX, e.clientY, [{ header: t('menu.newlinked') }, ...NODE_TYPES.map(tp => ({
          label: t('type.' + tp), icon: TYPE_ICON[tp],
          onClick: () => {
            const n = addNode(tp, w.x - NODE_W / 2, w.y - 40);
            if (tp === 'chapter') seedFirstFile(n, nodeById(d.from));
            const sb = bestSide(n, anchorPos(nodeById(d.from), d.side));
            addEdge(d.from, n.id, d.side, 'auto');
            commit(true); renderAll(); setSel([n.id]);
          }
        }))]);
      }
      break;
    }
  }
}
function edgeCreatedHint() { if (!edgeHintShown) { edgeHintShown = true; toast(t('hint.edgeCreated'), 4200); } }
function startConnectMode(nid) {
  UI.connectMode = nid; svg.classList.add('connecting'); showHint(t('hint.connect'));
}
function endConnectMode() { UI.connectMode = null; svg.classList.remove('connecting'); hideHint(); }
function showHint(txt) { const el = $('#hint'); el.textContent = txt; el.hidden = false; }
function hideHint() { $('#hint').hidden = true; }

function onWheel(e) {
  e.preventDefault(); cancelAnim(); hideTip();
  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 16; dy *= 16; } else if (e.deltaMode === 2) { dx *= 300; dy *= 300; }
  if (e.ctrlKey || e.metaKey || S.wheel === 'zoom') zoomAt(e.clientX, e.clientY, P.view.k * Math.exp(-dy * (e.ctrlKey ? 0.012 : 0.0016)));
  else { P.view.x -= dx; P.view.y -= dy; applyView(); }
}

/* ---------- подсказка над стрелкой ---------- */
function hideTip() { if (tipEl) { tipEl.remove(); tipEl = null; } }
function onHoverMove(e) {
  if (drag) return;
  const eEl = e.target.closest ? e.target.closest('[data-eid]') : null;
  const id = eEl ? eEl.dataset.eid : null;
  if (id !== UI.hoverEdge) { UI.hoverEdge = id; hideTip(); if (id) showEdgeTip(id); }
  if (id && tipEl) moveTip(e.clientX, e.clientY);
}
function showEdgeTip(id) {
  const e = edgeById(id); if (!e) return;
  const a = nodeById(e.from), b = nodeById(e.to);
  tipEl = h('div', { class: 'tip' },
    h('div', { class: 'tip-t' + (e.title ? '' : ' dim') }, e.title || t('edge.untitled')),
    e.desc ? h('div', { class: 'tip-d' }, e.desc) : null,
    h('div', { class: 'tip-r' }, (a ? a.title : '?') + '  →  ' + (b ? b.title : '?')),
    h('div', { class: 'tip-h' }, t('edge.dbl')));
  layer().append(tipEl);
}
function moveTip(x, y) {
  if (!tipEl) return;
  const r = tipEl.getBoundingClientRect();
  let tx = x + 16, ty = y + 18;
  if (tx + r.width > innerWidth - 8) tx = x - r.width - 16;
  if (ty + r.height > innerHeight - 8) ty = y - r.height - 14;
  tipEl.style.left = Math.max(8, tx) + 'px'; tipEl.style.top = Math.max(8, ty) + 'px';
}

/* ---------- действия над нодами ---------- */
function createNodeAt(type, wx, wy) {
  const n = addNode(type, wx - NODE_W / 2, wy - 40);
  commit(true); renderAll(); setSel([n.id]);
  return n;
}
function freeSpot(x, y, w = NODE_W, hh = 120) {
  let tries = 0;
  const hit = () => P.nodes.some(m => { const z = nodeSize(m); return x < m.x + z.w + 20 && x + w + 20 > m.x && y < m.y + z.h + 20 && y + hh + 20 > m.y; });
  while (tries++ < 60 && hit()) y += hh + 40;
  return { x, y };
}
function addLinked(nid) {
  const a = nodeById(nid); if (!a) return;
  const z = nodeSize(a);
  const sp = freeSpot(a.x + z.w + 160, a.y, NODE_W, 160);
  const n = addNode('chapter', sp.x, sp.y);
  seedFirstFile(n, a);
  addEdge(a.id, n.id, 'auto', 'auto');
  commit(true); renderAll(); setSel([n.id]);
  const nz = nodeSize(n); const r = stage.getBoundingClientRect(), v = P.view;
  const sx = n.x * v.k + v.x, sy = n.y * v.k + v.y;
  if (sx + nz.w * v.k > r.width - 40 || sy + nz.h * v.k > r.height - 40 || sx < 40 || sy < 90) centerOn(n.x + nz.w / 2, n.y + nz.h / 2, v.k);
}
function setNodesColor(ids, color) { ids.forEach(id => { const n = nodeById(id); if (n) n.color = color; }); commit(true); ids.forEach(refreshNode); }
function setNodesType(ids, type) {
  ids.forEach(id => { const n = nodeById(id); if (!n) return; n.type = type; if (type !== 'note' && !n.files.length) n.files.push(newFile()); });
  commit(true); renderAll();
}
function deleteSelection() {
  if (UI.edge) { deleteEdge(UI.edge); UI.edge = null; commit(true); renderAll(); toastUndo(t('toast.deleted.edge')); return; }
  const ids = [...UI.sel]; if (!ids.length) return;
  closeModalsFor(ids);
  deleteNodes(ids); UI.sel.clear(); commit(true); renderAll(); toastUndo(t('toast.deleted.nodes', ids.length));
}
function toastUndo(msg) {
  layer().querySelectorAll('.toast').forEach(x => x.remove());
  const el = h('div', { class: 'toast act' }, h('span', msg), h('button', { class: 'tlink', onclick: () => { undo(); el.remove(); } }, t('c.undo')));
  layer().append(el); requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 260); }, 5200);
}
function duplicateSelection() {
  const ids = [...UI.sel]; if (!ids.length) return;
  const nid = duplicateNodes(ids); commit(true); renderAll(); setSel(nid);
}
function reverseEdge(id) {
  const e = edgeById(id); if (!e) return;
  [e.from, e.to] = [e.to, e.from]; [e.fromSide, e.toSide] = [e.toSide, e.fromSide]; e.pts = edgeVia(e).slice().reverse();
  commit(true); renderEdges(); positionToolbar();
}
function resetEdgeLabel(id) { const e = edgeById(id); if (!e) return; e.lo = null; commit(true); renderEdges(); buildToolbar(); positionToolbar(); }
function straightenEdge(id) { const e = edgeById(id); if (!e) return; e.pts = []; commit(true); renderEdges(); buildToolbar(); positionToolbar(); }
function nudgeSelection(dx, dy) {
  if (!UI.sel.size) return;
  UI.sel.forEach(id => { const n = nodeById(id); if (n) { n.x += dx; n.y += dy; const el = NODE_EL.get(id); if (el) el.setAttribute('transform', `translate(${n.x} ${n.y})`); } });
  for (const ed of P.edges) if (ed.pts && ed.pts.length && UI.sel.has(ed.from) && UI.sel.has(ed.to)) ed.pts = ed.pts.map(q => [q[0] + dx, q[1] + dy]);
  scheduleEdges(); positionToolbar(); commit(false);
}

/* ---------- плавающая панель инструментов ---------- */
function tbBtn(ic, tip, onClick, cls = '') {
  return h('button', { class: 'tb ' + cls, 'data-tip': tip, onclick: ev => { ev.stopPropagation(); onClick(ev.currentTarget); } }, icon(ic, 18));
}
function buildToolbar() {
  const el = $('#ftb'); if (!el) return;
  el.replaceChildren();
  if (UI.edge) {
    const e = edgeById(UI.edge); if (!e) { el.hidden = true; return; }
    el.append(...[
      tbBtn('open', t('tb.editEdge'), () => openEdgeModal(e.id)),
      tbBtn('palette', t('tb.color'), b => popover(b, swatchRow(e.color, c => { e.color = c; commit(true); renderEdges(); closePopover(); }, t('color.auto')))),
      tbBtn('dash', t('tb.dashed'), () => { e.dashed = !e.dashed; commit(true); renderEdges(); buildToolbar(); }, e.dashed ? 'on' : ''),
      tbBtn('reverse', t('tb.reverse'), () => reverseEdge(e.id)),
      e.pts && e.pts.length ? tbBtn('straight', t('tb.straight'), () => straightenEdge(e.id)) : null,
      e.lo ? tbBtn('target', t('tb.lblreset'), () => resetEdgeLabel(e.id)) : null,
      h('div', { class: 'tsep' }),
      tbBtn('trash', t('tb.delete') + ' (Del)', deleteSelection, 'danger')].filter(Boolean));   // без null: иначе в панели появляется слово «null»
  } else if (UI.sel.size === 1) {
    const id = [...UI.sel][0], n = nodeById(id); if (!n) { el.hidden = true; return; }
    el.append(
      tbBtn('open', t('tb.open'), () => openNodeModal(id)),
      tbBtn('palette', t('tb.color'), b => popover(b, swatchRow(n.color, c => { setNodesColor([id], c); closePopover(); }))),
      tbBtn(TYPE_ICON[n.type], t('tb.type'), b => menuAt(b, NODE_TYPES.map(tp => ({ label: t('type.' + tp), icon: TYPE_ICON[tp], onClick: () => setNodesType([id], tp) })))),
      tbBtn('addLinked', t('tb.addLinked'), () => addLinked(id)),
      tbBtn('link', t('tb.connect'), () => startConnectMode(id)),
      n.type !== 'note' ? tbBtn('sticker', t('cm.tb'), b => openCmPopover(b, id), cmOpenCount(id) ? 'on' : '') : null,
      h('div', { class: 'tsep' }),
      tbBtn('copy', t('tb.duplicate') + ' (Ctrl+D)', duplicateSelection),
      tbBtn('trash', t('tb.delete') + ' (Del)', deleteSelection, 'danger'));
  } else if (UI.sel.size > 1) {
    const ids = [...UI.sel];
    el.append(
      h('span', { class: 'tcount' }, t('tb.selected', ids.length)),
      tbBtn('wand', t('ly.btn'), b => openLayoutDialog(b)),
      tbBtn('palette', t('tb.color'), b => popover(b, swatchRow(null, c => { setNodesColor(ids, c); closePopover(); }))),
      tbBtn('copy', t('tb.duplicate') + ' (Ctrl+D)', duplicateSelection),
      h('div', { class: 'tsep' }),
      tbBtn('trash', t('tb.delete') + ' (Del)', deleteSelection, 'danger'));
  } else { el.hidden = true; return; }
  el.hidden = false; positionToolbar();
}
function positionToolbar() {
  const el = $('#ftb'); if (!el || el.hidden) return;
  let bb, wps = [];
  if (UI.edge) {
    const e = edgeById(UI.edge), G = e && edgeGeom(e);
    if (!G) { el.hidden = true; return; }
    wps = G.viaAuto ? [] : G.via;
    const lo = Array.isArray(e.lo) ? e.lo : [0, 0], lx = G.mid[0] + lo[0], ly = G.mid[1] + lo[1];       // панель не должна закрывать сдвинутую плашку
    bb = { x0: Math.min(G.mid[0], lx), y0: Math.min(G.mid[1], ly) - 16, x1: Math.max(G.mid[0], lx), y1: Math.max(G.mid[1], ly) + 16 };
  } else {
    bb = nodesBBox([...UI.sel].map(nodeById).filter(Boolean));
    if (!bb) { el.hidden = true; return; }
  }
  const v = P.view, r = el.getBoundingClientRect();
  const sx0 = bb.x0 * v.k + v.x, sx1 = bb.x1 * v.k + v.x, sy0 = bb.y0 * v.k + v.y, sy1 = bb.y1 * v.k + v.y;
  const cx = (sx0 + sx1) / 2, cy = (sy0 + sy1) / 2;
  const fit = (px, py) => [clamp(px, 8, Math.max(8, innerWidth - r.width - 8)), clamp(py, 64, Math.max(64, innerHeight - r.height - 64))];
  /* места для панели по порядку: над объектом, под ним, справа, слева. У стрелки панель не должна закрывать точки излома */
  const covers = (px, py) => wps.some(q => { const wx = q[0] * v.k + v.x, wy = q[1] * v.k + v.y; return wx > px - 14 && wx < px + r.width + 14 && wy > py - 14 && wy < py + r.height + 14; });
  const cands = [[cx - r.width / 2, sy0 - r.height - 14], [cx - r.width / 2, sy1 + 14], [sx1 + 22, cy - r.height / 2], [sx0 - r.width - 22, cy - r.height / 2]].map(c => fit(c[0], c[1]));
  if (sy0 - r.height - 14 < 70) cands.shift();                         // сверху нет места
  const [x, y] = cands.find(c => !covers(c[0], c[1])) || cands[0];
  el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
}

/* ---------- контекстные меню ---------- */
function nodeMenu(id) {
  const n = nodeById(id), multi = UI.sel.size > 1, ids = [...UI.sel];
  return [
    !multi ? { label: t('tb.open'), icon: 'open', onClick: () => openNodeModal(id) } : null,
    { swatches: { value: multi ? null : n.color, onPick: c => setNodesColor(ids, c) } },
    { sep: true },
    !multi ? { label: t('tb.addLinked'), icon: 'addLinked', onClick: () => addLinked(id) } : null,
    !multi ? { label: t('tb.connect'), icon: 'link', onClick: () => startConnectMode(id) } : null,
    { label: t('tb.duplicate'), icon: 'copy', kbd: 'Ctrl+D', onClick: duplicateSelection },
    { sep: true },
    { label: t('tb.delete'), icon: 'trash', danger: true, kbd: 'Del', onClick: deleteSelection }
  ];
}
function edgeMenu(id) {
  const e = edgeById(id);
  return [
    { label: t('tb.editEdge'), icon: 'open', onClick: () => openEdgeModal(id) },
    { swatches: { value: e.color, none: t('color.auto'), onPick: c => { e.color = c; commit(true); renderEdges(); } } },
    { label: t('tb.dashed'), icon: 'dash', onClick: () => { e.dashed = !e.dashed; commit(true); renderEdges(); } },
    { label: t('tb.reverse'), icon: 'reverse', onClick: () => reverseEdge(id) },
    e.pts && e.pts.length ? { label: t('tb.straight'), icon: 'straight', onClick: () => straightenEdge(id) } : null,
    e.lo ? { label: t('tb.lblreset'), icon: 'target', onClick: () => resetEdgeLabel(id) } : null,
    { sep: true },
    { label: t('tb.delete'), icon: 'trash', danger: true, kbd: 'Del', onClick: deleteSelection }
  ];
}
function bgMenu(cx, cy) {
  const w = toWorld(cx, cy);
  showMenu(cx, cy, [{ header: t('menu.newhere') },
    ...NODE_TYPES.map(tp => ({ label: t('type.' + tp), icon: TYPE_ICON[tp], onClick: () => createNodeAt(tp, w.x, w.y) })),
    { sep: true }, { label: t('c.fit'), icon: 'fit', kbd: 'F', onClick: () => fitAll() }]);
}
function onContext(e) {
  e.preventDefault(); hideTip();
  if (performance.now() < CTX_SUPPRESS) return;
  if (drag && drag.type === 'marquee' && drag.btn === 2) { drag.pendingCtx = { x: e.clientX, y: e.clientY }; return; }
  closePopover();
  const nEl = e.target.closest('[data-nid]'), eEl = e.target.closest('[data-eid]'), wEl = e.target.closest('.wp'), lEl = e.target.closest('[data-lkey]');
  if (lEl) {
    const key = lEl.dataset.lkey, items = [
      key.startsWith('j:') ? { label: t('jmp.open'), icon: 'open', onClick: () => jumpOpenSource(key) } : null,
      P.lofs && P.lofs[key] ? { label: t('tb.lblreset'), icon: 'target', onClick: () => { delete P.lofs[key]; commit(true); renderEdges(); } } : null].filter(Boolean);
    if (items.length) { showMenu(e.clientX, e.clientY, items); return; }
  }
  if (wEl && wEl.dataset.wp != null && UI.edge) {
    const eid = UI.edge, i = +wEl.dataset.wp;
    showMenu(e.clientX, e.clientY, [{ label: t('wp.remove'), icon: 'trash', danger: true, onClick: () => { const ed = edgeById(eid); if (ed) { ed.pts = edgeVia(ed); ed.pts.splice(i, 1); commit(true); renderEdges(); } } },
      { label: t('tb.straight'), icon: 'straight', onClick: () => straightenEdge(eid) }]);
  } else if (nEl) { const id = nEl.dataset.nid; if (!UI.sel.has(id)) setSel([id]); showMenu(e.clientX, e.clientY, nodeMenu(id)); }
  else if (eEl) { const id = eEl.dataset.eid; setSel([], id); showMenu(e.clientX, e.clientY, edgeMenu(id)); }
  else bgMenu(e.clientX, e.clientY);
}

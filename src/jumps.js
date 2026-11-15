'use strict';
/* ====== Переходы по коду: `if … jump` в главах превращаются в стрелки на карте ======
   Программа читает скрипты глав и находит команды jump и call. Если команда стоит внутри if / elif / else или в варианте меню,
   условие попадает в подпись стрелки. Цель перехода — метка главы (или блока), её владелец и есть конец стрелки.
   Стрелки рисуются пунктиром отдельным слоем и включаются отдельной кнопкой; ручные стрелки они не заменяют. */

const RE_J_STMT = /^(jump|call)\s+(?!expression\b)(.+?)\s*(?:#.*)?$/;
const RE_J_IF = /^(if|elif|while)\s+(.*?)\s*:\s*(?:#.*)?$/;
const RE_J_ELSE = /^else\s*:\s*(?:#.*)?$/;
const RE_J_MENU = /^menu(?:\s+\w+)?\s*:\s*(?:#.*)?$/;
const RE_J_CHOICE = /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:\s+if\s+(.*?))?\s*:\s*(?:#.*)?$/;
const RE_J_LABEL = /^label\s+([A-Za-z_]\w*)/;
const jKey = x => String(x == null ? '' : x).trim().replace(/\s+/g, ' ').toLowerCase();

let JUMP_CACHE = null;
/** Метка или название → блок, которому принадлежит цель перехода. */
function jumpTargetMap() {
  const map = new Map();
  const put = (k, n, f) => { const key = jKey(k); if (key && !map.has(key)) map.set(key, { node: n, file: f || null }); };
  for (const n of P.nodes) {
    if (n.type === 'note') continue;
    put('blk_' + cmpIdent(slug(n.title), 'scene'), n, null);
    for (const f of n.files) {
      put(fileLabel(f), n, f); put(cmpIdent(fileLabel(f), 'chapter'), n, f); put(f.title, n, f);
      for (const l of String(f.script || '').split('\n')) { const m = RE_J_LABEL.exec(l); if (m) put(m[1], n, f); }
    }
  }
  for (const n of P.nodes) if (n.type !== 'note') put(n.title, n, null);        // названия блоков — в последнюю очередь, чтобы не затирать метки
  return map;
}
/** Условие внутри кадра стека: понятная человеку подпись. */
function jumpCondText(fr) {
  const short = x => String(x || '').replace(/\s+/g, ' ').trim();
  if (fr.kind === 'if' || fr.kind === 'while') return short(fr.cond);
  if (fr.kind === 'elif') return fr.prev.length === 1 && fr.prev[0].length <= 18 ? t('jmp.not', short(fr.prev[0])) + ', ' + short(fr.cond) : short(fr.cond);
  if (fr.kind === 'else') {
    if (fr.prev.length === 1) { const p = short(fr.prev[0]); return p.length <= 28 ? t('jmp.not', p) : t('jmp.else'); }
    return t('jmp.else');
  }
  if (fr.kind === 'choice') return '«' + short(fr.caption).slice(0, 26) + '»' + (fr.cond ? ' · ' + short(fr.cond) : '');
  return '';
}
function jumpAnalysis() {
  if (JUMP_CACHE && JUMP_CACHE.ver === DATA_VER && JUMP_CACHE.nodes === P.nodes.length && JUMP_CACHE.lang === S.lang) return JUMP_CACHE.data;
  const targets = jumpTargetMap(), pairs = new Map();
  for (const n of P.nodes) {
    if (n.type === 'note') continue;
    for (const f of n.files) {
      const lines = String(f.script || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
      const stack = [], chains = new Map();
      lines.forEach((raw, li) => {
        const body = raw.trim(); if (!body || body.startsWith('#')) return;
        const ind = raw.length - raw.replace(/^ +/, '').length;
        while (stack.length && stack[stack.length - 1].indent >= ind) stack.pop();
        let m, kind = '';
        if ((m = RE_J_IF.exec(body))) kind = m[1];
        else if (RE_J_ELSE.test(body)) kind = 'else';
        if (kind !== 'elif' && kind !== 'else') { for (const k of [...chains.keys()]) if (k >= ind) chains.delete(k); }
        else for (const k of [...chains.keys()]) if (k > ind) chains.delete(k);
        if (kind === 'if') { chains.set(ind, [m[2]]); stack.push({ indent: ind, kind: 'if', cond: m[2] }); return; }
        if (kind === 'while') { stack.push({ indent: ind, kind: 'while', cond: m[2] }); return; }
        if (kind === 'elif') { const prev = (chains.get(ind) || []).slice(); chains.set(ind, [...prev, m[2]]); stack.push({ indent: ind, kind: 'elif', cond: m[2], prev }); return; }
        if (kind === 'else') { stack.push({ indent: ind, kind: 'else', prev: (chains.get(ind) || []).slice() }); chains.delete(ind); return; }
        if (RE_J_MENU.test(body)) { stack.push({ indent: ind, kind: 'menu' }); return; }
        if (stack.some(x => x.kind === 'menu') && (m = RE_J_CHOICE.exec(body))) { stack.push({ indent: ind, kind: 'choice', caption: m[1].slice(1, -1), cond: m[2] || '' }); return; }
        if (!(m = RE_J_STMT.exec(body))) return;
        const stmt = m[1], rawTarget = m[2].replace(/^["']|["']$/g, '');
        const tg = targets.get(jKey(rawTarget));
        const conds = stack.map(jumpCondText).filter(Boolean);
        const first = stack.find(x => x.kind !== 'menu');
        const item = { stmt, to: rawTarget, conds, branch: first ? (first.kind === 'else' ? 'else' : 'if') : 'plain', file: f, node: n, line: li, text: body };
        if (!tg) return;                                                  // метка вне проекта или не найдена: стрелку нарисовать не к чему
        if (tg.node.id === n.id) return;                                  // переход внутри блока: на карте стрелка не нужна
        if (P.edges.some(e => e.from === n.id && e.to === tg.node.id)) return;   // такая стрелка уже есть на карте
        item.toNode = tg.node; item.toFile = tg.file;
        const key = n.id + '>' + tg.node.id;
        if (!pairs.has(key)) pairs.set(key, { from: n.id, to: tg.node.id, items: [] });
        pairs.get(key).items.push(item);
      });
    }
  }
  const data = { links: [...pairs.values()] };
  JUMP_CACHE = { ver: DATA_VER, nodes: P.nodes.length, lang: S.lang, data };
  return data;
}
/** Что написать на плашке стрелки. */
function jumpLabel(L) {
  const parts = [];
  for (const it of L.items) {
    const c = it.conds.length ? it.conds.slice(-2).join(' ' + t('jmp.and') + ' ') : '';
    const txt = (it.stmt === 'call' ? 'call' + (c ? ': ' : '') : '') + (c || (it.stmt === 'call' ? '' : 'jump'));
    if (!parts.includes(txt)) parts.push(txt);
  }
  return parts.slice(0, 2).join(' · ') + (parts.length > 2 ? ' +' + (parts.length - 2) : '');
}
const lofKey = (pre, from, to) => pre + ':' + from + '>' + to;
const lofOf = key => { const v = P.lofs && P.lofs[key]; return Array.isArray(v) ? v : [0, 0]; };

let gJumps = null;
function renderJumps() {
  if (!gJumps) return;
  gJumps.replaceChildren();
  if (!S.jumps || !P.nodes.length) return;
  const pl = pal(), sel = UI.sel;
  for (const L of jumpAnalysis().links) {
    const a = nodeById(L.from), b = nodeById(L.to); if (!a || !b) continue;
    const G = echoGeom(a, b, -1.35);
    const kind = L.items.some(x => x.branch === 'else') && !L.items.some(x => x.branch === 'if') ? 'else' : L.items.some(x => x.branch === 'if') ? 'if' : 'plain';
    const col = kind === 'else' ? pl.colors.orange : kind === 'if' ? pl.colors.cyan : pl.text2;
    const rel = !sel.size || sel.has(L.from) || sel.has(L.to);
    const key = lofKey('j', L.from, L.to), lo = lofOf(key);
    const g = s('g', { class: 'jlink ' + kind + (rel ? '' : ' dim'), 'data-jump': L.from + '>' + L.to });
    g.append(s('title', {}, L.items.map(it => (it.file.title || t('file.untitled')) + ': ' + (it.conds.length ? it.conds.join(' / ') + ' → ' : '') + it.text).join('\n')));
    g.append(s('path', { class: 'jl-line', d: G.d, fill: 'none', stroke: col }));
    g.append(s('path', { class: 'jl-head', d: G.head, fill: col, stroke: col }));
    const lab = fitText(jumpLabel(L), 190, 11, 600), bw = textW(lab, 11, 600) + 18;
    const lg = s('g', { transform: `translate(${r2(G.mid[0] + lo[0])} ${r2(G.mid[1] + lo[1])})` });
    if (lo[0] || lo[1]) lg.append(s('line', { class: 'lbl-leader', x1: -lo[0], y1: -lo[1], x2: 0, y2: 0, stroke: col }));
    const pill = s('g', { class: 'jl-pill', 'data-lkey': key });
    pill.append(s('rect', { x: -bw / 2, y: -10, width: bw, height: 20, rx: 10, fill: pl.edgeLabelBg, stroke: col }));
    pill.append(s('text', { x: 0, y: 3.8, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: pl.text, 'pointer-events': 'none' }, lab));
    lg.append(pill); g.append(lg);
    gJumps.append(g);
  }
}
/** Переход по щелчку на плашку: открыть главу, где написана команда. */
function jumpOpenSource(key) {
  const m = /^j:(.+)>(.+)$/.exec(key); if (!m) return;
  const L = jumpAnalysis().links.find(x => x.from === m[1] && x.to === m[2]); if (!L) return;
  openNodeModal(L.from, L.items[0].file.id);
}

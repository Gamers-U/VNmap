'use strict';
/* ====== Выборы с последствиями: флаги, «эхо»-связи на карте, быстрые вставки в главу ======
   Флаг — переменная проекта (реестр → Переменные). Выбор (стрелка) запоминает флаг, а глава или другая стрелка проверяет его.
   Анализ ниже находит, где флаг задаётся и где проверяется; по нему рисуются пунктирные «эхо» на карте и работают проверки при сборке. */

const varById = id => P.vars.find(v => v.id === id);
const varByName = nm => P.vars.find(v => v.name === nm);
const VAR_TYPE_ICON = { flag: 'flag', choice: 'fork', number: 'hash', raw: 'code' };
/** Как переменная пишется в коде Ren'Py: обычная — по имени, «помнить между играми» — через persistent. */
const varRef = v => (v && v.persist ? 'persistent.' : '') + (v ? v.name : '');

/* ---------- Python-строки ---------- */
/** Что делает пункт «запомнить» у стрелки, в виде строки Ren'Py. */
function setLine(v, st) {
  if (!v || !/^[A-Za-z_]\w*$/.test(v.name)) return null;
  const nm = varRef(v), val = String(st.val == null ? '' : st.val).trim();
  if (v.type === 'flag') return `$ ${nm} = ${/^(false|0|no|нет)$/i.test(val) ? 'False' : 'True'}`;
  if (v.type === 'choice') return `$ ${nm} = ${pyStr(val)}`;
  if (v.type === 'number') {
    const n = /^-?\d+(\.\d+)?$/.test(val) ? val : '1';
    return st.op === 'add' ? `$ ${nm} += ${n}` : st.op === 'sub' ? `$ ${nm} -= ${n}` : `$ ${nm} = ${n}`;
  }
  return `$ ${nm} = ${val || 'True'}`;
}
/** Короткая подпись для карты и списков: «спас_кота: да». */
function setText(v, st) {
  if (!v) return '?';
  const val = String(st.val == null ? '' : st.val).trim();
  if (v.type === 'flag') return v.name + (/^(false|0|no|нет)$/i.test(val) ? ': ' + t('flag.no') : '');
  if (v.type === 'choice') return v.name + ' = ' + val;
  if (v.type === 'number') return v.name + (st.op === 'add' ? ' +' : st.op === 'sub' ? ' −' : ' = ') + (val || '1');
  return v.name + ' = ' + val;
}
const defaultFor = type => (type === 'flag' ? 'False' : type === 'number' ? '0' : 'None');

/* ---------- анализ ---------- */
const PY_NOT_VARS = new Set(['and', 'or', 'not', 'in', 'is', 'if', 'else', 'elif', 'None', 'True', 'False', 'lambda', 'for', 'while', 'renpy', 'persistent', 'store', 'config', 'len', 'int', 'str', 'float', 'min', 'max', 'abs', 'sum', 'any', 'all', 'range', 'bool', 'set', 'list', 'dict', 'tuple']);
const RE_SETTER = /^\s*(?:\$\s*)?([A-Za-z_]\w*)\s*(\+=|-=|=)(?!=)\s*(.*)$/;
const RE_COND = /^\s*(?:if|elif|while)\s+(.*?)\s*:\s*(?:#.*)?$/;
const RE_MENU_COND = /^\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s+if\s+(.*?)\s*:\s*(?:#.*)?$/;
const RE_DECL = /^\s*(?:define|default)\s+(?:-?\d+\s+)?([A-Za-z_]\w*)(?![\w.])/;
function condIdents(cond) {
  const src = String(cond || '').replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""'), out = new Set(), re = /(^|[^\w.])([A-Za-z_]\w*)(?!\s*\()(?![\w])/g; let m;
  while ((m = re.exec(src))) if (!PY_NOT_VARS.has(m[2])) out.add(m[2]);
  return [...out];
}
function condCompared(cond) {
  const out = [], re = /([A-Za-z_]\w*)\s*(==|!=)\s*(["'])((?:\\.|(?!\3).)*)\3/g; let m;
  while ((m = re.exec(String(cond || '')))) out.push({ name: m[1], val: m[4] });
  return out;
}
/** Из условия: какими числами/значениями оно пользуется, чтобы угадать тип флага. */
function condHint(cond, name) {
  const c = String(cond || '');
  if (new RegExp('\\b' + name + '\\s*(?:>=|<=|>|<)').test(c)) return 'number';
  if (new RegExp('\\b' + name + '\\s*(?:==|!=)\\s*["\']').test(c)) return 'choice';
  if (new RegExp('\\b' + name + '\\s*(?:==|!=)\\s*-?\\d').test(c)) return 'number';
  return 'flag';
}
/** Имена, которые бывают в условиях, но задаются не нами (модули Python, встроенное Ren'Py). */
const FLAG_EXTERN = new Set(['preferences', 'gui', 'achievement', 'math', 'random', 'time', 'os', 'sys', 're', 'json', 'datetime', '_', '_preferences', 'layout', 'style', 'im', 'Character', 'Dissolve', 'NoneType']);
let FLAG_CACHE = null;
function flagAnalysis() {
  if (FLAG_CACHE && FLAG_CACHE.ver === DATA_VER && FLAG_CACHE.nodes === P.nodes.length) return FLAG_CACHE.data;
  const reg = new Map(P.vars.filter(v => v.name).map(v => [v.name, v]));
  const pnorm = s => (P.vars.some(v => v.persist) ? String(s == null ? '' : s).replace(/(^|[^\w.])persistent\.([A-Za-z_]\w*)/g, (m, p, n) => (reg.has(n) && reg.get(n).persist ? p + n : m)) : s);   // persistent.имя считаем тем же флагом
  const setters = new Map(), usersRaw = [], declared = new Set(reg.keys()), pyDefs = new Set();
  const note = (map, name, rec) => { if (!map.has(name)) map.set(name, []); map.get(name).push(rec); };
  const scan = (node, file, text) => {
    for (let line of String(text || '').split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      line = pnorm(line);
      let m;
      if ((m = RE_DECL.exec(line))) { declared.add(m[1]); continue; }
      if ((m = /^\s*(?:def|class)\s+([A-Za-z_]\w*)/.exec(line))) pyDefs.add(m[1]);
      else if ((m = /^\s*(?:from\s+\S+\s+)?import\s+(.+)$/.exec(line))) m[1].split(',').forEach(x => { const q = x.trim().split(/\s+as\s+/); const nm = (q[1] || q[0]).trim().split('.')[0]; if (/^[A-Za-z_]\w*$/.test(nm)) pyDefs.add(nm); });
      else if ((m = /^\s*for\s+(.+?)\s+in\b/.exec(line))) m[1].replace(/[()]/g, '').split(',').forEach(x => { if (/^[A-Za-z_]\w*$/.test(x.trim())) pyDefs.add(x.trim()); });
      if ((m = RE_COND.exec(line)) || (m = RE_MENU_COND.exec(line))) usersRaw.push({ node, file, cond: m[1] });
      else if ((m = RE_SETTER.exec(line)) && !['define', 'default', 'image', 'transform', 'screen', 'style', 'label'].includes(m[1])) note(setters, m[1], { node, file, via: 'script', val: m[3], py: !/^\s*\$/.test(line) });
    }
  };
  for (const n of P.nodes) for (const f of n.files) scan(n, f, f.script);
  if (typeof ccScan === 'function') for (const c of P.code || []) if (c.on !== false) { const sc = ccScan(c.text); for (const d of sc.defs) declared.add(d.name.split('.')[0]); for (const nm of sc.names) pyDefs.add(nm); }   // свой код: определения оттуда
  const nodeOf = id => nodeById(id);
  for (const e of P.edges) {
    const from = nodeOf(e.from); if (!from) continue;
    for (const st of e.sets || []) { const v = varById(st.v); if (v && v.name) note(setters, v.name, { node: from, edge: e, via: 'edge', val: st.val, set: st }); }
    for (const line of String(e.code || '').split('\n')) { const m = RE_SETTER.exec(pnorm(line)); if (m) note(setters, m[1], { node: from, edge: e, via: 'edge', val: m[3] }); }
    if (e.cond && e.cond.trim()) usersRaw.push({ node: from, edge: e, cond: pnorm(e.cond) });
  }
  /* имена из условий, которых нет ни в реестре, ни в присвоениях, ни в объявлениях: скорее всего опечатка */
  const unknown = new Map(), tagSet = new Set(P.characters.map(c => c.tag));
  for (const u of usersRaw) for (const nm of condIdents(u.cond)) {
    if (reg.has(nm) || setters.has(nm) || declared.has(nm) || pyDefs.has(nm) || tagSet.has(nm) || FLAG_EXTERN.has(nm)) continue;
    if (!unknown.has(nm)) unknown.set(nm, []);
    unknown.get(nm).push({ node: u.node, file: u.file, edge: u.edge, cond: u.cond });
  }
  const names = new Map();
  const get = name => { if (!names.has(name)) names.set(name, { name, var: reg.get(name) || null, setters: [], users: [], cmp: [], hint: '' }); return names.get(name); };
  for (const [nm, arr] of setters) { const r = get(nm); r.setters.push(...arr); }
  for (const u of usersRaw) {
    for (const nm of condIdents(u.cond)) {
      if (!(reg.has(nm) || setters.has(nm) || declared.has(nm))) continue;
      const r = get(nm); r.users.push({ node: u.node, file: u.file, edge: u.edge, cond: u.cond });
      if (!r.hint) r.hint = condHint(u.cond, nm);
      condCompared(u.cond).forEach(c => { if (c.name === nm) r.cmp.push({ val: c.val, node: u.node, file: u.file, edge: u.edge }); });
    }
  }
  for (const nm of reg.keys()) get(nm);
  /* достижимость и «эхо» */
  const adj = new Map();
  for (const e of P.edges) { if (!nodeOf(e.from) || !nodeOf(e.to) || nodeOf(e.from).type === 'note' || nodeOf(e.to).type === 'note') continue; if (!adj.has(e.from)) adj.set(e.from, []); adj.get(e.from).push(e.to); }
  const reachCache = new Map();
  const reach = id => {
    if (reachCache.has(id)) return reachCache.get(id);
    const seen = new Set([id]), q = [id];
    while (q.length) { const x = q.shift(); for (const y of adj.get(x) || []) if (!seen.has(y)) { seen.add(y); q.push(y); } }
    reachCache.set(id, seen); return seen;
  };
  const direct = new Set(P.edges.map(e => e.from + '>' + e.to));
  const linkMap = new Map();
  for (const r of names.values()) {
    const sNodes = [...new Set(r.setters.map(x => x.node.id))], uNodes = [...new Set(r.users.map(x => x.node.id))];
    r.sNodes = sNodes; r.uNodes = uNodes;
    r.unreached = [];
    for (const s of sNodes) for (const u of uNodes) {
      if (s === u) continue;
      const ok = reach(s).has(u);
      /* выбор на самой стрелке: проверка в её конечном блоке достижима всегда, поэтому отдельных стрелок не рисуем */
      if (direct.has(s + '>' + u) && ok) continue;
      if (!ok) r.unreached.push({ from: s, to: u });
      const key = s + '>' + u + '>' + (ok ? 1 : 0);
      if (!linkMap.has(key)) linkMap.set(key, { from: s, to: u, names: [], bad: !ok });
      linkMap.get(key).names.push(r.name);
    }
  }
  const data = { names, links: [...linkMap.values()], declared, reg, reach, unknown };
  FLAG_CACHE = { ver: DATA_VER, nodes: P.nodes.length, data };
  return data;
}
/** Флаги, которые задаёт или проверяет блок. */
function flagsOfNode(nid) {
  const A = flagAnalysis(), out = { sets: [], uses: [] };
  for (const r of A.names.values()) { if (r.sNodes.includes(nid)) out.sets.push(r.name); if (r.uNodes.includes(nid)) out.uses.push(r.name); }
  return out;
}

/* ---------- «эхо» на карте ---------- */
function echoGeom(a, b, bowK = 1) {
  const [sa, sb] = resolveSides(a, b, 'auto', 'auto');
  const p0 = anchorPos(a, sa), p1 = anchorPos(b, sb);
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const bow = Math.min(90, 40 + L * 0.08) * bowK;
  return bezierGeom(p0, NORMAL[sa], p1, NORMAL[sb], [[(p0[0] + p1[0]) / 2 - dy / L * bow, (p0[1] + p1[1]) / 2 + dx / L * bow]]);
}
function renderEchoes() {
  if (!gEchoes) return;
  gEchoes.replaceChildren();
  if (!S.echo || !P.nodes.length) return;
  const pl = pal(), sel = UI.sel;
  for (const L of flagAnalysis().links) {
    const a = nodeById(L.from), b = nodeById(L.to); if (!a || !b) continue;
    const G = echoGeom(a, b), col = L.bad ? pl.colors.red : pl.colors.purple;
    const rel = !sel.size || sel.has(L.from) || sel.has(L.to);
    const g = s('g', { class: 'echo' + (rel ? '' : ' dim') + (L.bad ? ' bad' : ''), 'data-echo': L.from + '>' + L.to });
    g.append(s('title', {}, (L.bad ? t('echo.bad') + ': ' : t('echo.tip') + ': ') + L.names.join(', ')));
    g.append(s('path', { class: 'ec-line', d: G.d, fill: 'none', stroke: col }));
    g.append(s('path', { class: 'ec-head', d: G.head, fill: col, stroke: col }));
    const txt = '⚑ ' + L.names.slice(0, 2).join(', ') + (L.names.length > 2 ? ' +' + (L.names.length - 2) : '');
    const fit = fitText(txt, 170, 11, 600), bw = textW(fit, 11, 600) + 18;
    const key = lofKey('f', L.from, L.to), lo = lofOf(key);
    const lg = s('g', { transform: `translate(${r2(G.mid[0] + lo[0])} ${r2(G.mid[1] + lo[1])})` });
    if (lo[0] || lo[1]) lg.append(s('line', { class: 'lbl-leader', x1: -lo[0], y1: -lo[1], x2: 0, y2: 0, stroke: col }));
    const pg = s('g', { class: 'ec-pillg', 'data-lkey': key });
    pg.append(s('rect', { class: 'ec-pill', x: -bw / 2, y: -10, width: bw, height: 20, rx: 10, fill: pl.edgeLabelBg, stroke: col }));
    pg.append(s('text', { x: 0, y: 3.8, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: pl.text, 'pointer-events': 'none' }, fit));
    lg.append(pg); g.append(lg);
    gEchoes.append(g);
  }
}

/* ---------- окно «новый флаг» ---------- */
function openFlagDialog({ onDone, name = '', type = 'flag', values = [] } = {}) {
  const st = { name, type, values: values.slice() };
  const m = openModal({
    cls: 'flag-m', build: m => {
      const nameI = h('input', { class: 'inp mono', type: 'text', value: st.name, spellcheck: 'false', id: 'flag-name', placeholder: 'saved_cat' });
      const msg = h('div', { class: 'warn-t' });
      const valsBox = h('div', { class: 'field' });
      const typeSeg = segmented([{ value: 'flag', label: t('flag.t.flag') }, { value: 'choice', label: t('flag.t.choice') }, { value: 'number', label: t('flag.t.number') }], st.type, v => { st.type = v; paintVals(); check(); });
      const typeHint = h('div', { class: 'hint' });
      const paintVals = () => {
        typeHint.textContent = t('flag.t.' + st.type + '.h');
        valsBox.replaceChildren();
        if (st.type !== 'choice') return;
        const chips = h('div', { class: 'chips' });
        const draw = () => {
          chips.replaceChildren();
          st.values.forEach((x, i) => chips.append(h('span', { class: 'chip on static' }, x, h('button', { class: 'chip-x', onclick: () => { st.values.splice(i, 1); draw(); } }, icon('x', 11, 2.6)))));
          const inp = h('input', { class: 'inp sm chip-in', placeholder: t('flag.val.add'), type: 'text' });
          const add = () => { const v = inp.value.trim(); if (v && !st.values.includes(v)) { st.values.push(v); draw(); setTimeout(() => { const ni = valsBox.querySelector('.chip-in'); if (ni) ni.focus(); }, 20); } };
          inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } });
          inp.addEventListener('blur', add);
          chips.append(inp);
        };
        draw();
        valsBox.append(h('div', { class: 'lbl' }, t('flag.vals')), chips, h('div', { class: 'hint' }, t('flag.vals.h')));
      };
      const check = () => {
        const nm = nameI.value.trim(); let err = '';
        if (!/^[A-Za-z_]\w*$/.test(nm)) err = t('flag.err.name');
        else if (varByName(nm)) err = t('flag.err.dup', nm);
        else if (RESERVED_TAGS.has(nm) || P.characters.some(c => c.tag === nm)) err = t('flag.err.reserved', nm);
        msg.textContent = err; okBtn.disabled = !!err; return !err;
      };
      const okBtn = h('button', {
        class: 'btn primary', onclick: () => {
          if (!check()) return;
          const v = { id: uid('v'), name: nameI.value.trim(), value: defaultFor(st.type), notes: '', type: st.type, values: st.type === 'choice' ? st.values.slice() : [] };
          P.vars.push(v); commit(true); m.close(); if (REG) renderReg(); onDone && onDone(v);
        }
      }, icon('check', 16), t('fx.create'));
      nameI.addEventListener('input', check);
      nameI.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); okBtn.click(); } });
      paintVals();
      setTimeout(() => { nameI.focus(); nameI.select(); check(); }, 50);
      return h('div', { class: 'm-wrap' }, modalHead(t('flag.new'), m),
        h('div', { class: 'm-pad' }, h('div', { class: 'hint' }, t('flag.new.h')),
          field(t('flag.name'), nameI, t('flag.name.h')), msg,
          field(t('flag.type'), typeSeg), typeHint, valsBox,
          h('div', { class: 'row-actions' }, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), okBtn)));
    }
  });
  return m;
}
const nextFlagName = () => { let i = 1; while (varByName('flag_' + i)) i++; return 'flag_' + i; };

/* ---------- редактор «Что запоминает этот выбор» в окне стрелки ---------- */
function edgeSetsEditor(e, onChange) {
  const box = h('div', { class: 'sets-ed' });
  const render = () => {
    box.replaceChildren();
    (e.sets || []).forEach((st, i) => {
      const v = varById(st.v);
      const row = h('div', { class: 'set-row' });
      const varSel = h('select', { class: 'inp sm', 'data-tip': t('sets.var') }, P.vars.map(x => h('option', { value: x.id }, x.name || '?')));
      varSel.value = st.v;
      varSel.addEventListener('change', () => { const nv = varById(varSel.value); st.v = varSel.value; st.val = nv && nv.type === 'flag' ? 'true' : nv && nv.type === 'choice' ? (nv.values[0] || '') : '1'; st.op = 'set'; onChange(); render(); });
      row.append(varSel);
      if (v && v.type === 'flag') row.append(segmented([{ value: 'true', label: t('flag.yes') }, { value: 'false', label: t('flag.no') }], /^(false|0|no|нет)$/i.test(st.val) ? 'false' : 'true', val => { st.val = val; onChange(); }, 'mini'));
      else if (v && v.type === 'choice') {
        const lid = 'dl_' + st.v + '_' + i;
        const inp = h('input', { class: 'inp sm', type: 'text', value: st.val, list: lid, placeholder: t('flag.val.ph'), spellcheck: 'false' });
        const dl = h('datalist', { id: lid }, v.values.map(x => h('option', { value: x })));
        const learn = () => { const val = inp.value.trim(); st.val = val; if (val && !v.values.includes(val)) { v.values.push(val); } onChange(); };
        inp.addEventListener('input', () => { st.val = inp.value.trim(); onChange(); });
        inp.addEventListener('change', learn);
        row.append(inp, dl);
      } else if (v && v.type === 'number') {
        const op = h('select', { class: 'inp sm set-op' }, h('option', { value: 'set' }, '='), h('option', { value: 'add' }, '+'), h('option', { value: 'sub' }, '−')); op.value = st.op;
        const num = h('input', { class: 'inp sm', type: 'number', step: 'any', value: st.val === '' ? '1' : st.val });
        op.addEventListener('change', () => { st.op = op.value; onChange(); });
        num.addEventListener('input', () => { st.val = num.value; onChange(); });
        row.append(op, num);
      } else {
        const inp = h('input', { class: 'inp sm mono', type: 'text', value: st.val, placeholder: 'True', spellcheck: 'false' });
        inp.addEventListener('input', () => { st.val = inp.value; onChange(); });
        row.append(inp);
      }
      row.append(h('button', { class: 'btn icon sm', 'data-tip': t('c.delete'), onclick: () => { e.sets.splice(i, 1); onChange(); render(); } }, icon('x', 14)));
      box.append(row);
    });
    const used = new Set((e.sets || []).map(x => x.v));
    box.append(h('div', { class: 'row-actions left' }, h('button', {
      class: 'btn sm', onclick: ev => {
        const free = P.vars.filter(v => v.name && !used.has(v.id));
        menuAt(ev.currentTarget, [
          ...free.map(v => ({ label: v.name, icon: VAR_TYPE_ICON[v.type] || 'code', onClick: () => addSet(v) })),
          free.length ? { sep: true } : null,
          { label: t('flag.new') + '…', icon: 'plus', onClick: () => openFlagDialog({ onDone: addSet, name: nextFlagName(), type: 'choice', values: [] }) }]);
      }
    }, icon('flag', 14), t('sets.add'))));
  };
  const addSet = v => {
    if (!e.sets) e.sets = [];
    e.sets.push({ v: v.id, op: 'set', val: v.type === 'flag' ? 'true' : v.type === 'choice' ? (v.values[0] || '') : v.type === 'number' ? '1' : 'True' });
    onChange(); render();
  };
  render();
  return box;
}

/* ---------- быстрые вставки в главу ---------- */
/** Заготовка «если выбор был…» для флага. */
function flagIfSnippet(v) {
  const nm = varRef(v);
  if (v.type === 'choice' && v.values.length) {
    const L = [];
    v.values.forEach((val, i) => { L.push(`${i ? 'elif' : 'if'} ${nm} == ${pyStr(val)}:`, i === 0 ? '    "\u0001"' : '    "…"'); });
    L.push('else:', '    "…"');
    return L.join('\n');
  }
  if (v.type === 'number') return `if ${nm} >= 1:\n    "\u0001"\nelse:\n    "…"`;
  if (v.type === 'flag') return `if ${nm}:\n    "\u0001"\nelse:\n    "…"`;
  return `if ${nm}:\n    "\u0001"\nelse:\n    "…"`;
}
/** Заготовка меню, которое запоминает выбор и не ветвит сюжет. */
function flagMenuSnippet(v) {
  const nm = varRef(v), L = ['menu:', '    "\u0001"'];
  if (v.type === 'choice' && v.values.length) v.values.forEach(val => L.push(`    ${pyStr(val)}:`, `        $ ${nm} = ${pyStr(val)}`));
  else if (v.type === 'number') L.push(`    ${pyStr(t('flag.menu.plus'))}:`, `        $ ${nm} += 1`, `    ${pyStr(t('flag.menu.skip'))}:`, '        pass');
  else L.push(`    ${pyStr(t('flag.yes'))}:`, `        $ ${nm} = True`, `    ${pyStr(t('flag.no'))}:`, `        $ ${nm} = False`);
  return L.join('\n');
}
function pickFlag(anchor, onPick, { allowNew = true } = {}) {
  const list = P.vars.filter(v => v.name);
  const items = list.map(v => ({ label: v.name + (v.type === 'choice' && v.values.length ? '  (' + v.values.join(' / ') + ')' : ''), icon: VAR_TYPE_ICON[v.type] || 'code', onClick: () => onPick(v) }));
  if (allowNew) { if (items.length) items.push({ sep: true }); items.push({ label: t('flag.new') + '…', icon: 'plus', onClick: () => openFlagDialog({ onDone: onPick, name: nextFlagName(), type: 'choice' }) }); }
  menuAt(anchor, items);
}

/* ---------- проверки при сборке ---------- */
const litStr = v => { const m = /^\s*(["'])((?:\\.|(?!\1).)*)\1\s*(?:#.*)?$/.exec(String(v == null ? '' : v)); return m ? m[2] : null; };
function guessFlagType(r) {
  for (const x of r.setters) {
    const v = String(x.val == null ? '' : x.val).trim();
    if (x.set) { const vv = x.set.v && varById(x.set.v); if (vv && vv.type) return vv.type; }
    if (/^(True|False)\b/.test(v)) return 'flag';
    if (/^-?\d/.test(v)) return 'number';
    if (litStr(v) != null) return 'choice';
  }
  return r.hint || 'flag';
}
/** Проверки для сборки: объявляет недостающие переменные и сообщает о нестыковках. Возвращает [{name,value,auto}] для variables.rpy. */
function flagCompileChecks(add, vars, charTags) {
  const A = flagAnalysis(), out = [], have = new Set(vars.map(v => v.name));
  const title = id => { const n = nodeById(id); return n ? n.title : '?'; };
  for (const r of A.names.values()) {
    const nm = r.name, reg = r.var, fu = r.users[0], fs = r.setters[0];
    if (!/^[A-Za-z_]\w*$/.test(nm)) continue;
    /* 1. объявление: проверяется где-то, а default нигде нет */
    if (!have.has(nm) && !A.declared.has(nm) && r.users.length && !RESERVED_TAGS.has(nm) && !charTags.has(nm) && !r.setters.some(x => x.py)) {
      const type = guessFlagType(r), val = defaultFor(type), vals = type === 'choice' ? [...new Set([...r.cmp.map(c => c.val), ...r.setters.map(x => litStr(x.val)).filter(x => x != null)])] : [];
      out.push({ name: nm, value: val, auto: true }); have.add(nm);
      add('info', t('flag.auto', nm, val), { node: fu.node, file: fu.file }, { label: t('flag.auto.fix'), run: () => { if (!varByName(nm)) P.vars.push({ id: uid('v'), name: nm, value: val, notes: '', type, values: vals }); commit(true); } });
    }
    /* 2. проверяется, но нигде не задаётся */
    if (fu && !r.setters.length) {
      add(reg && reg.type !== 'raw' ? 'warn' : 'info', t('flag.never.set.c', nm, fu.node.title), { node: fu.node, file: fu.file });
    }
    /* 3. задаётся, но нигде не проверяется (только для переменных из реестра) */
    if (fs && !r.users.length && reg && reg.type !== 'raw') add('info', t('flag.never.used.c', nm, fs.node.title), { node: fs.node });
    /* 4. проверка не достижима из места, где флаг задаётся */
    for (const u of r.unreached.slice(0, 3)) add('warn', t('flag.unreach', nm, title(u.from), title(u.to)), { node: nodeById(u.to) });
    /* 5. значения: проверка сравнивает с тем, чего никто не задаёт */
    if (r.cmp.length) {
      const setVals = new Set();
      for (const x of r.setters) { const lv = x.set ? String(x.set.val).trim() : litStr(x.val); if (lv != null && lv !== '') setVals.add(lv); }
      const known = reg && reg.type === 'choice' && reg.values.length ? new Set(reg.values) : null;
      const defv = reg ? litStr(reg.value) : null; if (defv != null) setVals.add(defv);
      const shown = new Set();
      for (const c of r.cmp) {
        if (shown.has(c.val)) continue; shown.add(c.val);
        if (known && !known.has(c.val)) add('warn', t('flag.val.unknown', nm, c.val, [...known].join(', ')), { node: c.node, file: c.file });
        else if (!known && r.setters.length && setVals.size && !setVals.has(c.val) && r.setters.every(x => x.set || litStr(x.val) != null)) add('warn', t('flag.val.never', nm, c.val), { node: c.node, file: c.file });
      }
    }
  }
  return out;
}

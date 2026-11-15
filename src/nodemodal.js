'use strict';
/* ====== Всплывающее окно блока: обзор, файлы, сводка, ассеты, скрипт, диалоги ====== */
let NMODAL = null, NM_TAB = 'sum';
const CONV = {};

function openNodeModal(nid, fid) {
  const n = nodeById(nid); if (!n) return;
  closePopover();
  if (NMODAL && !NMODAL.m.closed) {
    if (NMODAL.nid === nid) { selectInModal(NMODAL, fid && n.files.some(f => f.id === fid) ? fid : 'node'); return; }
    NMODAL.m.close();
  }
  const st = { nid, sel: fid && n.files.some(f => f.id === fid) ? fid : 'node', dragIdx: null };
  NMODAL = st;
  st.m = openModal({
    cls: 'node-m',
    onClose: () => { if (NMODAL === st) NMODAL = null; flushHistory(); refreshNode(nid); },
    build: () => {
      st.head = h('div', { class: 'm-head' });
      st.side = h('div', { class: 'm-side' });
      st.main = h('div', { class: 'm-main' });
      renderHead(st); renderSide(st); renderMain(st);
      return h('div', { class: 'm-wrap' }, st.head, h('div', { class: 'm-body' }, st.side, st.main));
    }
  });
}
function closeModalsFor(ids) { if (NMODAL && !NMODAL.m.closed && ids.includes(NMODAL.nid)) NMODAL.m.close(); }
function refreshNodeModal() {
  if (!NMODAL || NMODAL.m.closed) return;
  if (!nodeById(NMODAL.nid)) { NMODAL.m.close(); return; }
  if (NMODAL.sel !== 'node' && !findFile(NMODAL.sel)) NMODAL.sel = 'node';
  renderHead(NMODAL); renderSide(NMODAL); renderMain(NMODAL);
}
function selectInModal(st, sel) { st.sel = sel; renderSide(st); renderMain(st); st.main.scrollTop = 0; }

/* ---------- шапка ---------- */
function renderHead(st) {
  const n = nodeById(st.nid), head = st.head;
  head.replaceChildren();
  const col = palColor(n.color);
  const sw = h('button', {
    class: 'hsw', style: { background: col, color: onColor(col) }, 'data-tip': t('tb.color'),
    onclick: ev => popover(ev.currentTarget, swatchRow(n.color, c => { setNodesColor([n.id], c); closePopover(); renderHead(st); }))
  }, icon(TYPE_ICON[n.type], 20));
  const title = bindInput(n, 'title', { ph: t('node.title.ph'), cls: 'big-inp', onChange: () => { commit(); refreshNode(n.id); } });
  title.id = 'node-title';
  const typeSeg = segmented(NODE_TYPES.map(tp => ({ value: tp, icon: TYPE_ICON[tp], tip: t('type.' + tp) })), n.type, v => { setNodesType([n.id], v); refreshNodeModal(); });
  head.append(sw, title, typeSeg, h('div', { class: 'grow' }), n.type !== 'note' ? cmHeadBtn(st) : null,
    h('button', { class: 'btn icon', 'data-tip': t('nm.show'), onclick: () => { st.m.close(); focusNode(n.id); } }, icon('target', 18)),
    h('button', { class: 'btn icon', 'data-tip': t('c.close') + ' (Esc)', onclick: () => st.m.close() }, icon('x', 18)));
}

/* ---------- боковая панель ---------- */
function renderSide(st) {
  const n = nodeById(st.nid), side = st.side;
  side.replaceChildren();
  side.append(h('div', { class: 'fitem top' + (st.sel === 'node' ? ' on' : ''), onclick: () => selectInModal(st, 'node') }, icon('layers', 16), h('span', { class: 'fn' }, t('nm.overview'))));
  if (n.type === 'note') return;
  side.append(h('div', { class: 'side-h' }, t('nm.files'), h('span', { class: 'count' }, n.files.length)));
  const list = h('div', { class: 'flist' });
  n.files.forEach((f, i) => {
    const it = h('div', { class: 'fitem' + (st.sel === f.id ? ' on' : ''), draggable: 'true', onclick: () => selectInModal(st, f.id) },
      h('span', { class: 'grip' }, icon('grip', 14)),
      h('span', { class: 'sdot', style: { background: palColor(STATUS_COLOR[f.status]) } }),
      h('span', { class: 'fn' }, f.title || t('file.untitled')));
    it.addEventListener('dragstart', ev => { st.dragIdx = i; ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', f.id); it.classList.add('dragging'); });
    it.addEventListener('dragend', () => { it.classList.remove('dragging'); list.querySelectorAll('.over').forEach(x => x.classList.remove('over')); });
    it.addEventListener('dragover', ev => { ev.preventDefault(); it.classList.add('over'); });
    it.addEventListener('dragleave', () => it.classList.remove('over'));
    it.addEventListener('drop', ev => {
      ev.preventDefault();
      const from = st.dragIdx; if (from == null || from === i) return;
      const [mv] = n.files.splice(from, 1); n.files.splice(i, 0, mv); st.dragIdx = null;
      commit(true); refreshNode(n.id); renderSide(st);
    });
    list.append(it);
  });
  side.append(list, h('button', {
    class: 'btn wide add-file', onclick: () => {
      const f = newFileAfter(n.files[n.files.length - 1], n); n.files.push(f);
      commit(true); refreshNode(n.id); selectInModal(st, f.id);
      setTimeout(() => { const i = $('#file-title'); if (i) { i.focus(); i.select(); } }, 60);
    }
  }, icon('plus', 16), t('nm.addFile')));
}

/* ---------- основная область ---------- */
function renderMain(st) {
  const n = nodeById(st.nid); if (!n) return;
  const keep = st.main.scrollTop;
  st.main.replaceChildren();
  if (st.sel === 'node') st.main.append(overviewView(st, n));
  else { const r = findFile(st.sel); if (r) st.main.append(fileView(st, n, r.file)); }
  st.main.scrollTop = keep;
}

function overviewView(st, n) {
  const root = h('div', { class: 'view' });
  const desc = bindArea(n, 'desc', { ph: t('nm.desc.ph'), rows: 3, onChange: () => { commit(); refreshNode(n.id); } });
  desc.id = 'node-desc';
  root.append(field(t('nm.desc'), desc));
  if (n.type === 'note') root.append(field(t('cm.done'), switchEl(!!n.done, v => { n.done = v; commit(true); refreshNode(n.id); }), t('cm.card.hint')));
  if (n.type !== 'note') {
    try { root.append(bsNodeField(n, () => st.m.close())); } catch (e) { /* время чтения не обязательно для окна */ }
    root.append(h('div', { class: 'grid2 start-row' },
      field(t('nm.start'), switchEl(P.startId === n.id, v => { P.startId = v ? n.id : ''; commit(true); renderAll(); }), t('nm.start.hint')),
      field(t('nm.prompt'), bindInput(n, 'prompt', { ph: t('nm.prompt.ph'), onChange: () => commit() }), t('nm.prompt.hint'))));
    root.append(field(t('team.owners'), memberPicker(n, 'owners', () => { commit(true); refreshNode(n.id); renderSide(st); }), t('team.owners.h')));
    root.append(field(t('nm.defcast'), castPicker(n, 'defaultCast', P.characters.filter(c => c.always).map(c => c.id), () => commit(true)), t('nm.defcast.hint')));
    root.append(progressBlock(n));
    try { const vf = vsNodeField(n, () => st.m.close()); if (vf) root.append(vf); } catch (e) { /* раздел переменных не обязателен для окна */ }
  }
  if (n.type === 'ending' || n.unlock) root.append(unlockBlock(st, n));
  root.append(linksBlock(n));
  root.append(h('div', { class: 'row-actions' }, h('div', { class: 'grow' }),
    h('button', {
      class: 'btn danger', onclick: async () => {
        const ok = await confirmDlg({ title: t('nm.delete.q', n.title), text: t('nm.delete.t'), ok: t('tb.delete'), danger: true });
        if (ok) { st.m.close(); UI.sel = new Set([n.id]); UI.edge = null; deleteSelection(); }
      }
    }, icon('trash', 16), t('nm.delete'))));
  return root;
}
function progressBlock(n) {
  const pr = nodeProgress(n);
  const counts = {}; STATUSES.forEach(s => counts[s] = n.files.filter(f => f.status === s).length);
  const bar = h('div', { class: 'stack-bar' });
  STATUSES.forEach(s => { if (counts[s]) bar.append(h('span', { style: { width: (counts[s] / n.files.length * 100) + '%', background: palColor(STATUS_COLOR[s]) } })); });
  return field(t('nm.progress'), h('div', { class: 'prog' },
    n.files.length ? bar : h('div', { class: 'hint' }, t('node.empty')),
    h('div', { class: 'prog-legend' }, STATUSES.map(s => h('span', { class: 'lg' }, h('span', { class: 'sdot', style: { background: palColor(STATUS_COLOR[s]) } }), t('status.' + s) + ': ' + counts[s])),
      h('span', { class: 'lg strong' }, Math.round(pr.pct * 100) + '%'))));
}
function unlockBlock(st, n) {
  const box = h('div', { class: 'card-sec' }), body = h('div');
  const endings = () => P.nodes.filter(x => x.type === 'ending' && x.id !== n.id);
  const render = () => {
    body.replaceChildren();
    if (!n.unlock) return;
    const list = endings(), us = unlockState(n);
    const need = h('input', { class: 'inp num', type: 'number', min: 1, max: Math.max(1, list.length), value: n.unlock.need, id: 'unlock-need' });
    need.addEventListener('input', () => { n.unlock.need = Math.max(1, parseInt(need.value) || 1); commit(); refreshNode(n.id); });
    const chips = h('div', { class: 'chips' });
    list.forEach(x => {
      const on = n.unlock.from.includes(x.id);
      chips.append(h('button', {
        class: 'chip' + (on ? ' on' : ''), onclick: () => {
          const i = n.unlock.from.indexOf(x.id); if (i >= 0) n.unlock.from.splice(i, 1); else n.unlock.from.push(x.id);
          commit(true); refreshNode(n.id); render();
        }
      }, h('span', { class: 'dot', style: { background: palColor(x.color) } }), x.title));
    });
    if (!list.length) chips.append(h('div', { class: 'hint' }, t('nm.unlock.none')));
    body.append(
      h('div', { class: 'unlock-line' }, t('nm.unlock.need1'), need, t('nm.unlock.need2', n.unlock.from.length)),
      chips,
      h('div', { class: 'row-actions left' },
        h('button', { class: 'btn sm', onclick: () => { n.unlock.from = list.map(x => x.id); commit(true); refreshNode(n.id); render(); } }, t('nm.unlock.all')),
        h('div', { class: 'hint' }, t('nm.unlock.state', us.have, us.need))));
  };
  box.append(h('div', { class: 'sec-head' }, icon('lock', 16), h('b', t('nm.unlock')), h('div', { class: 'grow' }),
    switchEl(!!n.unlock, v => {
      const list = endings();
      n.unlock = v ? { need: Math.max(1, Math.min(list.length - 1, list.length) || 1), from: list.map(x => x.id) } : null;
      commit(true); refreshNode(n.id); render();
    })), h('div', { class: 'hint' }, t('nm.unlock.hint')), body);
  render();
  return box;
}
function linksBlock(n) {
  const outs = P.edges.filter(e => e.from === n.id), ins = P.edges.filter(e => e.to === n.id);
  const row = (e, other, out) => h('div', { class: 'link-row', onclick: () => openEdgeModal(e.id) },
    icon(out ? 'chevR' : 'chevL', 14), h('span', { class: 'dot', style: { background: other ? palColor(other.color) : 'gray' } }),
    h('span', { class: 'ln' }, e.title || t('edge.untitled')), h('span', { class: 'lo' }, other ? other.title : '?'));
  return field(t('nm.links'), h('div', { class: 'links' },
    outs.length || ins.length ? [
      ...ins.map(e => row(e, nodeById(e.from), false)),
      ...outs.map(e => row(e, nodeById(e.to), true))] : h('div', { class: 'hint' }, t('nm.links.none'))));
}

/* ---------- файл ---------- */
function fileView(st, n, f) {
  const root = h('div', { class: 'view' });
  const upd = () => { commit(); refreshNode(n.id); renderSide(st); };
  const title = bindInput(f, 'title', { ph: t('file.title.ph'), cls: 'big-inp', onChange: upd });
  title.id = 'file-title';
  const status = segmented(STATUSES.map(s => ({ value: s, label: t('status.' + s), dot: palColor(STATUS_COLOR[s]) })), f.status, v => { f.status = v; commit(true); refreshNode(n.id); renderSide(st); }, 'status-seg');
  const more = h('button', {
    class: 'btn icon', 'data-tip': t('c.more'), onclick: ev => menuAt(ev.currentTarget, [
      { label: t('file.dup'), icon: 'copy', onClick: () => { const c = JSON.parse(JSON.stringify(f)); c.id = uid('f'); c.title += ' ' + t('c.copy'); c.label = ''; c.filename = ''; n.files.splice(n.files.indexOf(f) + 1, 0, c); commit(true); refreshNode(n.id); selectInModal(st, c.id); } },
      { label: t('file.move'), icon: 'open', onClick: () => setTimeout(() => pickNodeFor(more, n, tn => { n.files.splice(n.files.indexOf(f), 1); tn.files.push(f); commit(true); refreshNode(n.id); refreshNode(tn.id); selectInModal(st, 'node'); toast(t('file.moved', tn.title)); }), 30) },
      { sep: true },
      {
        label: t('file.delete'), icon: 'trash', danger: true, onClick: async () => {
          const ok = await confirmDlg({ title: t('file.delete.q', f.title), text: f.script || f.summary ? t('file.delete.t') : '', ok: t('tb.delete'), danger: true });
          if (!ok) return;
          const i = n.files.indexOf(f); n.files.splice(i, 1); commit(true); refreshNode(n.id);
          selectInModal(st, n.files[Math.min(i, n.files.length - 1)] ? n.files[Math.min(i, n.files.length - 1)].id : 'node');
        }
      }])
  }, icon('rows', 18));
  const fname = bindInput(f, 'filename', { ph: slug(f.title) + '.rpy', mono: true, onChange: () => commit() });
  const label = bindInput(f, 'label', { ph: slug(f.title), mono: true, onChange: () => commit() });
  fname.id = 'file-name'; label.id = 'file-label';
  const auto = h('button', {
    class: 'btn sm', 'data-tip': t('file.auto.tip'), onclick: () => {
      f.label = slug(f.title); f.filename = slug(f.title) + '.rpy'; fname.value = f.filename; label.value = f.label; commit(true);
    }
  }, icon('wand', 14), t('file.auto'));
  const dupWarn = h('span', { class: 'warn-badge', hidden: true }, icon('help', 14), t('file.dup.label'));
  const checkDup = () => { dupWarn.hidden = !allFiles().some(x => x.file !== f && fileLabel(x.file) === fileLabel(f)); };
  label.addEventListener('input', checkDup); title.addEventListener('input', checkDup); checkDup();

  const tabBody = h('div', { class: 'tab-body' });
  const renderTab = () => {
    tabBody.replaceChildren();
    const fn = { sum: tabSummary, assets: tabAssets, script: tabScript, dialog: tabDialog, text: tabText }[NM_TAB] || tabSummary;
    tabBody.append(fn(st, n, f, () => { NM_TAB = 'script'; tabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['sum', 'assets', 'script', 'dialog', 'text'][i] === NM_TAB)); renderTab(); }, renderTab));
  };
  const tabs = segmented([
    { value: 'sum', icon: 'rows', label: t('tab.sum') }, { value: 'assets', icon: 'image', label: t('tab.assets') },
    { value: 'script', icon: 'code', label: t('tab.script') }, { value: 'dialog', icon: 'chat', label: t('tab.dialog') },
    { value: 'text', icon: 'type', label: t('te.node.tab') }
  ], NM_TAB, v => { NM_TAB = v; renderTab(); }, 'tabs');
  root.append(
    h('div', { class: 'file-top' }, title, more),
    h('div', { class: 'file-meta' }, status),
    h('div', { class: 'grid3' }, field(t('file.filename'), fname), field(t('file.label'), label), h('div', { class: 'field auto-col' }, h('div', { class: 'lbl' }, ' '), h('div', { class: 'row-actions left' }, auto, dupWarn)))
  );
  root.append(tabs, tabBody);
  renderTab();
  return root;
}
function pickNodeFor(anchor, cur, onPick) {
  const list = h('div', { class: 'plist' });
  P.nodes.filter(x => x.id !== cur.id && x.type !== 'note').forEach(x => list.append(h('div', { class: 'pi', onclick: () => { closePopover(); onPick(x); } },
    h('span', { class: 'dot big', style: { background: palColor(x.color) } }), h('div', { class: 'pi-t' }, h('div', { class: 'pi-n' }, x.title)))));
  if (!list.children.length) list.append(h('div', { class: 'empty small' }, t('search.none')));
  popover(anchor, h('div', { class: 'picker' }, list), { cls: 'pick-pop' });
}

/* ---------- вкладка «Сводка» ---------- */
function tabSummary(st, n, f) {
  const box = h('div');
  const sum = bindArea(f, 'summary', { ph: t('f.summary.ph'), rows: 4, onChange: () => commit() });
  sum.id = 'f-summary';
  const inh = (n.owners || []).map(id => (memberById(id) || {}).name).filter(Boolean);
  box.append(
    field(t('f.summary'), sum),
    field(t('team.owners.file'), memberPicker(f, 'owners', () => { commit(true); refreshNode(n.id); }), inh.length ? t('team.owners.file.h', inh.join(', ')) : t('team.owners.file.h0')),
    field(t('f.cast'), castPicker(f, 'cast', effectiveCast(n, f).auto, () => commit(true)), t('f.cast.hint')),
    field(t('f.location'), bindInput(f, 'location', { ph: t('f.location.ph'), onChange: () => commit() })),
    field(t('f.notes'), bindArea(f, 'notes', { ph: t('f.notes.ph'), rows: 3, onChange: () => commit() })));
  return box;
}

/* ---------- вкладка «Ассеты» ---------- */
function tabAssets(st, n, f) {
  const box = h('div');
  const attached = h('div', { class: 'att-list' }), used = h('div', { class: 'used-list' });
  const renderAtt = () => {
    attached.replaceChildren();
    f.assets = f.assets.filter(x => assetById(x.ref));
    if (!f.assets.length) attached.append(h('div', { class: 'empty' }, t('as.empty')));
    for (const kind of ASSET_KINDS) {
      const items = f.assets.filter(x => assetById(x.ref).kind === kind);
      if (!items.length) continue;
      attached.append(h('div', { class: 'att-h' }, icon(KIND_ICON[kind], 14), t('kind.' + kind)));
      items.forEach(x => {
        const a = assetById(x.ref);
        const note = bindInput(x, 'note', { ph: t('as.note.ph'), cls: 'sm', onChange: () => commit() });
        attached.append(h('div', { class: 'att-row' },
          h('div', { class: 'att-n' }, h('div', { class: 'pi-n' }, a.name || '—'), a.path || a.expr.length ? h('div', { class: 'pi-s' }, a.kind === 'sprite' ? a.expr.join(', ') : a.path) : null),
          note, h('button', { class: 'btn icon sm', 'data-tip': t('as.detach'), onclick: () => { f.assets.splice(f.assets.indexOf(x), 1); commit(true); renderAtt(); renderUse(); } }, icon('x', 14))));
      });
    }
  };
  const attach = a => { if (!f.assets.some(x => x.ref === a.id)) f.assets.push({ id: uid('x'), ref: a.id, note: '' }); };
  const renderUse = () => {
    used.replaceChildren();
    const us = parseUsage(f.script);
    if (!us.length) { used.append(h('div', { class: 'empty small' }, t('as.used.none'))); return; }
    const rows = h('div', { class: 'used-rows' });
    us.forEach(u => {
      const a = matchAsset(u), isAtt = a && f.assets.some(x => x.ref === a.id);
      const exprMissing = u.kind === 'sprite' && a && u.expr && !a.expr.includes(u.expr);
      const acts = [];
      if (!a) acts.push(h('button', { class: 'btn sm', onclick: () => { const na = createAsset(u.kind, u.name); if (u.kind === 'sprite' && u.expr) na.expr.push(u.expr); attach(na); commit(true); renderAtt(); renderUse(); } }, icon('plus', 14), t('as.toRegistry')));
      else {
        if (exprMissing) acts.push(h('button', { class: 'btn sm', onclick: () => { a.expr.push(u.expr); commit(true); renderUse(); } }, icon('plus', 14), t('as.addExpr')));
        if (!isAtt) acts.push(h('button', { class: 'btn sm', onclick: () => { attach(a); commit(true); renderAtt(); renderUse(); } }, t('as.attach')));
      }
      rows.append(h('div', { class: 'used-row' }, icon(KIND_ICON[u.kind], 15),
        h('div', { class: 'used-n' }, u.name, u.expr ? h('span', { class: 'expr' }, ' ' + u.expr) : null),
        a ? (isAtt && !exprMissing ? h('span', { class: 'ok-badge' }, icon('check', 13), t('as.ok')) : null) : h('span', { class: 'warn-badge' }, t('as.unknown')),
        h('div', { class: 'grow' }), ...acts));
    });
    used.append(rows, h('div', { class: 'row-actions left' }, h('button', {
      class: 'btn sm primary', onclick: () => {
        for (const u of us) {
          let a = matchAsset(u);
          if (!a) { a = createAsset(u.kind, u.name); }
          if (u.kind === 'sprite' && u.expr && !a.expr.includes(u.expr)) a.expr.push(u.expr);
          attach(a);
        }
        commit(true); renderAtt(); renderUse();
      }
    }, icon('zap', 14), t('as.syncAll'))));
  };
  const adders = h('div', { class: 'qbar' }, ASSET_KINDS.map(k => h('button', {
    class: 'btn sm', onclick: ev => pickAsset(ev.currentTarget, k, a => { attach(a); commit(true); renderAtt(); renderUse(); })
  }, icon(KIND_ICON[k], 14), '+ ' + t('kind1.' + k))));
  const visual = bindArea(f, 'visual', { ph: t('as.visual.ph'), rows: 4, onChange: () => commit() });
  visual.id = 'f-visual';
  box.append(field(t('as.needed'), h('div', {}, adders, attached)), field(t('as.visual'), visual), field(t('as.used'), used, t('as.used.hint')),
    h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', 'data-tip': t('rs.open.t'), onclick: () => { st.m.close(); openResources({ nodeId: n.id }); } }, icon('box', 14), t('rs.open'))));
  renderAtt(); renderUse();
  return box;
}

/* ---------- вкладка «Скрипт» ---------- */
function codeEditor(obj, key, tagsFn, onChange) {
  const pre = h('pre', { class: 'code-pre', 'aria-hidden': 'true' });
  const ta = h('textarea', { class: 'code-ta', spellcheck: 'false', id: 'code-ta', placeholder: t('code.ph'), autocapitalize: 'off', autocomplete: 'off' });
  ta.value = obj[key] || '';
  const upd = () => { pre.innerHTML = highlightRenpy(ta.value, tagsFn()) + '\n​'; };
  const typeText = (txt) => {
    if (!document.execCommand || !document.execCommand('insertText', false, txt)) { ta.setRangeText(txt, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input', { bubbles: true })); }
  };
  ta.addEventListener('input', () => { obj[key] = ta.value; upd(); onChange && onChange(); });
  ta.addEventListener('keydown', ev => {
    if (ev.key === 'Tab') {
      ev.preventDefault();
      const v = ta.value, a = ta.selectionStart, b = ta.selectionEnd;
      const ls = v.lastIndexOf('\n', a - 1) + 1;
      const multi = v.slice(a, b).includes('\n');
      if (!multi && !ev.shiftKey) { typeText('    '); return; }
      const block = v.slice(ls, b), lines = block.split('\n');
      const out = lines.map(l => ev.shiftKey ? l.replace(/^( {1,4}|\t)/, '') : '    ' + l).join('\n');
      ta.setSelectionRange(ls, b);
      typeText(out);
      ta.setSelectionRange(ls, ls + out.length);
    } else if (ev.key === 'Enter' && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey && !ev.isComposing) {
      const v = ta.value, a = ta.selectionStart, ls = v.lastIndexOf('\n', a - 1) + 1;
      const line = v.slice(ls, a), indent = (line.match(/^[ \t]*/) || [''])[0];
      const extra = /:\s*$/.test(line) ? '    ' : '';
      if (indent || extra) { ev.preventDefault(); typeText('\n' + indent + extra); }
    }
  });
  upd();
  return { el: h('div', { class: 'code' }, pre, ta), ta, update: upd };
}
const transitionNames = () => P.assets.filter(a => a.kind === 'fx').map(a => a.name);
function transitionSelect() {
  const sel = h('select', { class: 'inp sm', id: 'tr-sel' }, h('option', { value: '' }, t('tr.none')),
    ...transitionNames().map(nm => h('option', { value: nm, selected: nm === S.transition }, nm)));
  return sel;
}
function trRow(sel) { return h('div', { class: 'tr-row' }, h('span', { class: 'hint' }, 'with'), sel); }

/** Вкладка «Текст»: короткая сводка и вход в редактор текста (сам текст пишется там). */
function tabText(st, n, f, goScript, again) {
  const b = (() => { try { return prBuild(n, f); } catch (e) { return { words: 0, lines: 0 }; } })();
  const has = !!(f.text && f.text.trim());
  const applyBtn = h('button', { class: 'btn' + (has ? ' primary' : ''), id: 'pull-apply', onclick: ev => menuAt(ev.currentTarget, [
    { label: t('te.apply.rep'), icon: 'refresh', onClick: async () => { if (await pullApply(n, f, 'replace') && goScript) goScript(); } },
    { label: t('te.apply.add'), icon: 'down', onClick: async () => { if (await pullApply(n, f, 'append') && goScript) goScript(); } }]) }, icon('wand', 16), t('te.apply'), icon('chevD', 13));
  const pullBtn = h('button', { class: 'btn' + (has ? '' : ' primary'), id: 'pull-go', 'data-tip': t('pull.btn.tip'), onclick: () => pullChapter(n, f, { done: () => again && again() }) }, icon('down', 16), has ? t('pull.again') : t('pull.btn'));
  return h('div', { class: 'te-node', id: 'te-node-tab' },
    h('p', { class: 'hint' }, t('te.node.d')),
    has ? null : h('p', { class: 'hint', id: 'pull-hint' }, t('pull.node.d')),
    has ? h('div', { class: 'hint' }, t('te.node.stat', fmtNum(b.words), fmtNum(b.lines))) : null,
    f.textLive ? h('div', { class: 'te-node-b' }, icon('refresh', 16), h('span', t('te.node.live'))) : null,
    h('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } }, has ? applyBtn : pullBtn, has ? pullBtn : null,
      h('button', { class: 'btn', id: 'te-node-open', onclick: () => openTextEditor({ fileId: f.id }) }, icon('type', 16), t('te.node.open')), h('button', { class: 'btn', id: 'te-node-import', onclick: () => openDocImport({ fileId: f.id }) }, icon('upload', 16), t('di.node.btn'))));
}
function tabScript(st, n, f, goTab) {
  const box = h('div', { class: 'script-tab' });
  if (f.textLive) box.append(h('div', { class: 'te-node-b', id: 'te-script-live' }, icon('refresh', 16), h('span', t('te.script.live')), h('button', { class: 'btn sm', onclick: () => openTextEditor({ fileId: f.id }) }, icon('type', 14), t('te.script.open'))));
  const tags = () => new Set(P.characters.map(c => c.tag).filter(Boolean));
  const foot = h('div', { class: 'code-foot' });
  const updFoot = () => {
    const lines = f.script ? f.script.split('\n').length : 0;
    foot.firstChild.textContent = t('code.stats', lines, wordCount(f.script));
  };
  const ed = codeEditor(f, 'script', tags, () => { commit(); updFoot(); });
  const ins = txt => insertSnippet(ed.ta, txt);
  const withTr = tr => tr ? ` with ${tr}` : '';
  const cast = () => effectiveCast(n, f).all;
  const qi = (ic, label, fn) => h('button', { class: 'qi', onclick: ev => fn(ev.currentTarget) }, icon(ic, 14), label);

  const pickScene = b => { const sel = transitionSelect(); popover(b, assetList('bg', a => { closePopover(); ins(`scene ${a.name}${withTr(sel.value)}`); }, { extra: trRow(sel) }), { cls: 'pick-pop' }); };
  const pickShow = b => {
    const sel = transitionSelect(), holder = h('div');
    const step2 = a => {
      let expr = '', pos = '';
      const exprBox = h('div', { class: 'chips' });
      const renderExpr = () => {
        exprBox.replaceChildren();
        if (!a.expr.length) exprBox.append(h('div', { class: 'hint' }, t('pick.noexpr')));
        a.expr.forEach(x => exprBox.append(h('button', { class: 'chip' + (expr === x ? ' on' : ''), onclick: () => { expr = expr === x ? '' : x; renderExpr(); } }, x)));
      };
      renderExpr();
      const posSeg = segmented([{ value: '', label: '—' }, { value: 'left', label: t('pos.left') }, { value: 'center', label: t('pos.center') }, { value: 'right', label: t('pos.right') }], '', v => { pos = v; });
      let tfm = '';
      const tfNames = P.assets.filter(x => x.kind === 'tf' && !['left', 'center', 'right'].includes(x.name)).map(x => x.name);
      const tfSel = tfNames.length ? h('select', { class: 'inp sm', id: 'tf-sel' }, h('option', { value: '' }, '—'), ...tfNames.map(nm => h('option', { value: nm }, nm))) : null;
      if (tfSel) tfSel.addEventListener('change', () => { tfm = tfSel.value; });
      holder.replaceChildren(h('div', { class: 'qform' },
        h('div', { class: 'lbl' }, a.name), h('div', { class: 'lbl' }, t('pick.expr')), exprBox, h('div', { class: 'lbl' }, t('pick.pos')), posSeg, tfSel ? h('div', { class: 'lbl' }, t('tf.pos.hint')) : null, tfSel, trRow(sel),
        h('button', { class: 'btn primary wide', onclick: () => { closePopover(); const at = [pos, tfm].filter(Boolean).join(', '); ins(`show ${a.name}${expr ? ' ' + expr : ''}${at ? ' at ' + at : ''}${withTr(sel.value)}`); } }, t('c.insert'))));
    };
    holder.append(assetList('sprite', step2, { extra: trRow(sel) }));
    popover(b, holder, { cls: 'pick-pop' });
  };
  const bar = h('div', { class: 'qbar' },
    qi('image', t('q.scene'), pickScene), qi('user', t('q.show'), pickShow),
    qi('eye', t('q.hide'), b => pickAsset(b, 'sprite', a => ins(`hide ${a.name}${withTr(S.transition)}`))),
    qi('music', t('q.music'), b => pickAsset(b, 'music', a => ins(`play music "${assetCodeName(a)}" fadein 1.0`))),
    qi('volume', t('q.sound'), b => pickAsset(b, 'sfx', a => ins(`play sound "${assetCodeName(a)}"`))),
    qi('sparkles', t('q.fx'), b => pickAsset(b, 'fx', a => ins(`with ${a.name}`))),
    qi('chat', t('q.say'), b => pickChar(b, cast(), c => ins(`${c.tag || slug(c.name)} "\u0001"`))),
    qi('rows', t('q.narr'), () => ins('"\u0001"')),
    qi('fork', t('q.menu'), () => ins(menuSnippet(n))),
    qi('link', t('q.jump'), b => pickFile(b, fl => ins(`jump ${fileLabel(fl)}`))),
    qi('wand', t('q.cond'), () => openCondBuilder({ insert: ins })),
    qi('plus', t('q.more'), b => menuAt(b, [
      { label: t('q.ifflag'), icon: 'fork', onClick: () => setTimeout(() => pickFlag(b, v => ins(flagIfSnippet(v))), 30) },
      { label: t('q.setflag'), icon: 'flag', onClick: () => setTimeout(() => pickFlag(b, v => ins(flagMenuSnippet(v))), 30) },
      { sep: true },
      { label: t('q.voice'), icon: 'mic', onClick: () => setTimeout(() => pickAsset(b, 'voice', a => ins(`voice "${assetCodeName(a)}"`)), 30) },
      { label: t('q.stopmusic'), icon: 'music', onClick: () => ins('stop music fadeout 1.0') },
      { label: t('q.label'), icon: 'flag', onClick: () => ins(`label ${fileLabel(f)}:`) },
      { label: t('q.call'), icon: 'link', onClick: () => setTimeout(() => pickFile(b, fl => ins(`call ${fileLabel(fl)}`)), 30) },
      { label: t('q.pause'), icon: 'zap', onClick: () => ins('pause 1.0') },
      { label: t('q.comment'), icon: 'code', onClick: () => ins('# \u0001') }])));

  foot.append(h('span', { class: 'grow-text' }, ''),
    h('button', { class: 'btn sm', onclick: () => goTab && NM_TAB !== 'dialog' && (NM_TAB = 'dialog', selectInModal(st, f.id)) }, icon('chat', 14), t('tab.dialog')),
    h('button', { class: 'btn sm', onclick: async () => toast(await copyText(renpyFileText(n, f)) ? t('c.copied') : t('c.copyfail')) }, icon('copy', 14), t('code.copy')),
    h('button', { class: 'btn sm', onclick: () => saveFile(fileName(f), renpyFileText(n, f), 'text/plain') }, icon('download', 14), t('code.download')));
  box.append(bar, ed.el, foot, h('div', { class: 'hint' }, t('code.hint')));
  updFoot();
  return box;
}

/* ---------- вкладка «Диалоги» ---------- */
function tabDialog(st, n, f, goScript) {
  const cs = CONV[f.id] || (CONV[f.id] = { raw: '', rows: [], opts: { detect: true, alternate: true, keepAttr: false, split: false } });
  const cast = effectiveCast(n, f).all.map(charById).filter(Boolean);
  const box = h('div', { class: 'conv' });
  const pullStrip = h('div', { class: 'conv-pull', id: 'conv-pull' });
  const raw = h('textarea', { class: 'ta', rows: 8, placeholder: t('conv.ph'), id: 'conv-raw', spellcheck: 'false' });
  raw.value = cs.raw;
  const mirror = h('div', { class: 'conv-mirror', 'aria-hidden': 'true' });
  const rawWrap = h('div', { class: 'conv-raw' }, mirror, raw);
  const rowsBox = h('div', { class: 'conv-rows' }), summary = h('div', { class: 'conv-sum' });
  const chars = P.characters;
  /* подсветка меток «не делить» под полем ввода */
  const paintMirror = () => {
    const v = raw.value, re = /([.!?…]+[»”’"')\]]*)⁠/g; let last = 0, m;
    mirror.replaceChildren();
    while ((m = re.exec(v))) { if (m.index > last) mirror.append(v.slice(last, m.index)); mirror.append(h('mark', { class: 'ns' }, m[0])); last = m.index + m[0].length; }
    mirror.append(v.slice(last) + '\n');
    mirror.scrollTop = raw.scrollTop;
  };
  raw.addEventListener('scroll', () => { mirror.scrollTop = raw.scrollTop; });
  /* куда применять оформление: последний выделенный фрагмент в поле или в строке результата */
  let tgt = null;
  const track = el => {
    const rec = () => { tgt = { el, a: el.selectionStart, b: el.selectionEnd }; };
    ['select', 'keyup', 'mouseup', 'blur', 'focus'].forEach(ev => el.addEventListener(ev, rec));
  };
  track(raw);
  const applyEdit = fn => {
    if (!tgt || !tgt.el.isConnected) { toast(t('fmt.none')); return false; }
    const el = tgt.el; let a = tgt.a, b = tgt.b;
    if (a === b && el !== raw) { a = 0; b = el.value.length; }
    const r = fn(el.value, a, b);
    if (!r) { toast(t('fmt.none')); return false; }
    el.value = r.value; el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus(); el.setSelectionRange(r.a, r.b); tgt = { el, a: r.a, b: r.b };
    return true;
  };
  const needSel = fn => (v, a, b) => (a === b ? null : fn(v, a, b));
  const pvUpdaters = [];
  const baseStyle = r => { const c = r.sp && r.sp !== '?' ? charById(r.sp) : null; const st = {}; if (c && c.textColor) st.color = c.textColor; const ff = c && c.font ? fontCss(c.font) : null; if (ff) st.fontFamily = ff; return st; };
  const renderRows = () => {
    rowsBox.replaceChildren(); pvUpdaters.length = 0;
    const unk = cs.rows.filter(r => r.sp === '?').length;
    summary.textContent = cs.rows.length ? t('conv.count', cs.rows.length, unk) : '';
    cs.rows.forEach((r, i) => {
      const sel = h('select', { class: 'inp sm' + (r.sp === '?' ? ' warn' : '') },
        h('option', { value: '' }, t('conv.narr')), h('option', { value: '?' }, t('conv.unknown')),
        ...chars.map(c => h('option', { value: c.id }, (c.name || c.tag) + (cast.includes(c) ? '' : ' ·'))));
      sel.value = r.sp || '';
      const pv = h('div', { class: 'row-pv' });
      const paintPv = () => { const has = /\{\/?(?:b|i|u|s|plain|font|size|color|alpha|k|cps|w|p|nw|fast)(?:=[^{}]*)?\}/.test(r.text); pv.hidden = !has; pv.replaceChildren(); if (has) pv.append(h('span', { class: 'pv-l' }, t('conv.preview')), richPreview(r.text, baseStyle(r))); };
      pvUpdaters.push(paintPv);
      sel.addEventListener('change', () => { r.sp = sel.value; sel.classList.toggle('warn', r.sp === '?'); const u = cs.rows.filter(x => x.sp === '?').length; summary.textContent = t('conv.count', cs.rows.length, u); paintPv(); });
      const txt = h('input', { class: 'inp', type: 'text', spellcheck: 'false' }); txt.value = r.text;
      txt.addEventListener('input', () => { r.text = txt.value; paintPv(); });
      track(txt);
      paintPv();
      rowsBox.append(h('div', { class: 'conv-row-wrap' }, h('div', { class: 'conv-row' + (r.sp === '?' ? ' unk' : '') }, sel, txt,
        h('div', { class: 'row-btns' },
          h('button', { class: 'btn icon sm', 'data-tip': t('conv.rowsplit'), onclick: () => { const parts = splitSentences(r.text); if (parts.length > 1) { cs.rows.splice(i, 1, ...parts.map(x => ({ sp: r.sp, text: x }))); renderRows(); } } }, icon('scissors', 14)),
          h('button', { class: 'btn icon sm', 'data-tip': t('c.delete'), onclick: () => { cs.rows.splice(i, 1); renderRows(); } }, icon('x', 14)))), pv));
    });
  };
  const onFont = () => { if (!box.isConnected) FONT_LISTENERS.delete(onFont); else pvUpdaters.forEach(fn => fn()); };
  FONT_LISTENERS.add(onFont); loadAllFonts();
  const run = () => { cs.raw = raw.value; cs.rows = convertText(cs.raw, cast, cs.opts); renderRows(); };
  const runSoon = debounce(run, 350);
  raw.addEventListener('input', () => { cs.raw = raw.value; paintMirror(); runSoon(); });
  const loadText = text => { raw.value = text; paintMirror(); run(); };
  const readFile = file => { if (!file) return; const fr = new FileReader(); fr.onload = () => loadText(String(fr.result || '')); fr.readAsText(file); };
  raw.addEventListener('dragover', ev => { ev.preventDefault(); raw.classList.add('drop'); });
  raw.addEventListener('dragleave', () => raw.classList.remove('drop'));
  raw.addEventListener('drop', ev => {
    raw.classList.remove('drop');
    const fl = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (fl) { ev.preventDefault(); readFile(fl); }
  });
  const fileIn = h('input', { type: 'file', accept: '.txt,.md,text/plain', hidden: true, id: 'conv-file' });
  fileIn.addEventListener('change', () => { readFile(fileIn.files[0]); fileIn.value = ''; });
  const optSw = (key, label) => switchEl(cs.opts[key], v => { cs.opts[key] = v; run(); if (key === 'split') { const p = box.parentNode; if (p) p.replaceChildren(tabDialog(st, n, f, goScript)); } }, label);
  const code = () => rowsToRenpy(cs.rows);
  const insertInto = replace => {
    if (!cs.rows.length) return;
    const c = code();
    /* перед вставленным текстом всегда остаётся одна свободная строка: туда можно сразу дописать scene, музыку или эффект */
    const head = replace || !f.script.trim() ? '' : f.script.replace(/\s+$/, '');
    const caret = head ? head.length + 1 : 0;
    f.script = head ? head + '\n\n' + c : '\n' + c;
    commit(true); toast(t('conv.inserted', cs.rows.length)); goScript();
    setTimeout(() => { const ta = $('#code-ta'); if (ta) { ta.focus(); ta.setSelectionRange(caret, caret); const lh = parseFloat(getComputedStyle(ta).lineHeight) || 20; ta.scrollTop = Math.max(0, f.script.slice(0, caret).split('\n').length - 3) * lh; } }, 90);
  };
  const castInfo = cast.length ? h('div', { class: 'chips' }, cast.map(c => h('span', { class: 'chip on static' }, h('span', { class: 'dot', style: { background: 'var(--c-' + c.color + ')' } }), c.name || c.tag)))
    : h('div', { class: 'hint' }, chars.length ? t('conv.cast.none') : t('conv.cast.empty'));
  /* метки «не делить» */
  const markBtns = h('div', { class: 'row-actions left mark-btns' },
    h('button', { class: 'btn sm', 'data-tip': t('conv.nosplit.tip'), onclick: () => markSel(true) }, icon('scissors', 14), t('conv.nosplit')),
    h('button', { class: 'btn sm', 'data-tip': t('conv.unmark.tip'), onclick: () => markSel(false) }, icon('x', 14), t('conv.unmark')));
  const markSel = on => {
    const a = raw.selectionStart, b = raw.selectionEnd;
    if (a === b) { toast(t('conv.nosel')); return; }
    const before = countMarks(raw.value, a, b);
    const r = on ? protectRange(raw.value, a, b) : unprotectRange(raw.value, a, b);
    const after = countMarks(r.value, r.a, r.b);
    if (on && after === before) { toast(t('conv.marks.none')); return; }
    raw.value = r.value; cs.raw = r.value; paintMirror(); raw.focus(); raw.setSelectionRange(r.a, r.b);
    toast(on ? t('conv.marks.set', after - before) : t('conv.marks.cleared', before - after));
    runSoon();
  };
  /* панель оформления */
  const fmt = {};
  const keep = e => e.preventDefault();
  const fmtBtn = (ic, tip, fn) => { const b = h('button', { class: 'btn icon sm fmt-b', 'data-tip': tip }, ic); b.addEventListener('mousedown', keep); b.addEventListener('click', fn); return b; };
  const togg = name => () => applyEdit(needSel((v, a, b) => wrapRange(v, a, b, name, '', true)));
  const mkSelect = (label, groups, onPick) => {
    const sel = h('select', { class: 'inp sm fmt-sel' }, h('option', { value: '' }, label));
    groups.forEach(g => { const og = g.label ? h('optgroup', { label: g.label }) : sel; g.items.forEach(it => og.append(h('option', { value: it.value }, it.label))); if (g.label) sel.append(og); });
    sel.addEventListener('change', () => { const v = sel.value; sel.value = ''; if (v) onPick(v); });
    return sel;
  };
  const fontSel = mkSelect(t('fmt.font'), [{ items: [...fontChoices().map(c => ({ value: c.value, label: c.label })), { value: '__up', label: '↥ ' + t('fmt.fonts.open') }] }],
    v => { if (v === '__up') openRegistry('font'); else applyEdit(needSel((val, a, b) => wrapRange(val, a, b, 'font', v, false))); });
  const sizeSel = mkSelect(t('fmt.size'), [{ items: ['-10', '-5', '+5', '+10', '+20'].map(v => ({ value: v, label: t('fmt.sz.' + v) + ' (' + v + ')' })) }],
    v => applyEdit(needSel((val, a, b) => wrapRange(val, a, b, 'size', v, false))));
  const sizeIn = h('input', { class: 'inp sm fmt-size', type: 'text', placeholder: t('fmt.size.in'), 'data-tip': t('fmt.size.tip'), maxlength: 5 });
  sizeIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const v = sizeIn.value.trim(); if (/^[+-]?\d{1,3}$/.test(v)) { applyEdit(needSel((val, a, b) => wrapRange(val, a, b, 'size', v, false))); sizeIn.value = ''; } } });
  const colorIn = h('input', { type: 'color', class: 'fmt-color', value: '#ffcc66', 'data-tip': t('fmt.color') });
  colorIn.addEventListener('change', () => applyEdit(needSel((val, a, b) => wrapRange(val, a, b, 'color', colorIn.value, false))));
  const fxSel = mkSelect(t('fmt.fx'), [
    { items: TEXT_EFFECTS.map(e => ({ value: 'w:' + e.id, label: t('fx.' + e.id) })) },
    { label: t('fmt.ins'), items: TEXT_INSERTS.map(e => ({ value: 'i:' + e.id, label: t('ins.' + e.id) + '  ' + e.code })) }],
    v => {
      if (v.startsWith('w:')) { const fx = TEXT_EFFECTS.find(e => e.id === v.slice(2)); applyEdit(needSel((val, a, b) => { let r = { value: val, a, b }; for (const [nm, arg] of fx.wrap.slice().reverse()) r = wrapRange(r.value, r.a, r.b, nm, arg, false); return r; })); }
      else { const ins = TEXT_INSERTS.find(e => e.id === v.slice(2)); applyEdit((val, a, b) => insertAt(val, b, ins.code)); }
    });
  const clearBtn = h('button', { class: 'btn sm fmt-b', 'data-tip': t('fmt.clear') }, icon('x', 13), t('fmt.clear'));
  clearBtn.addEventListener('mousedown', keep);
  clearBtn.addEventListener('click', () => applyEdit((v, a, b) => stripTagsRange(v, a === b ? 0 : a, a === b ? v.length : b)));
  const fmtBar = h('div', { class: 'fmt-bar' },
    h('div', { class: 'fmt-h' }, icon('type', 14), h('b', t('fmt.h')), h('span', { class: 'hint' }, t('fmt.hint'))),
    h('div', { class: 'fmt-row' },
      fmtBtn(h('b', 'B'), t('fmt.b'), togg('b')), fmtBtn(h('i', 'I'), t('fmt.i'), togg('i')), fmtBtn(h('u', 'U'), t('fmt.u'), togg('u')), fmtBtn(h('s', 'S'), t('fmt.s'), togg('s')),
      h('span', { class: 'tsep' }), fontSel, sizeSel, sizeIn, colorIn, fxSel, h('div', { class: 'grow' }), clearBtn));
  const paintPull = () => {
    const has = !!(f.text && f.text.trim());
    pullStrip.classList.toggle('has', has);
    pullStrip.replaceChildren(icon('type', 16), h('span', { class: 'conv-pull-t' }, has ? t('pull.dlg.has', fmtNum(prWords(f.text))) : t('pull.dlg.none')),
      has ? h('button', { class: 'btn sm', id: 'conv-pull-go', onclick: () => { cs.autoH = prHash(f.text); loadText(prPlain(f.text)); } }, icon('refresh', 14), t('pull.dlg.load'))
        : h('button', { class: 'btn sm primary', id: 'conv-pull-doc', 'data-tip': t('pull.btn.tip'), onclick: () => pullChapter(n, f, { script: false, done: () => { paintPull(); cs.autoH = prHash(f.text); loadText(prPlain(f.text)); } }) }, icon('down', 14), t('pull.btn')));
  };
  box.append(
    pullStrip,
    h('div', { class: 'hint' }, t('conv.intro')),
    field(t('conv.cast'), castInfo),
    field(t('conv.source'), rawWrap),
    h('div', { class: 'conv-opts' }, optSw('detect', t('conv.o.detect')), optSw('alternate', t('conv.o.alt')), optSw('keepAttr', t('conv.o.attr')),
      h('div', { class: 'opt-split', 'data-tip': t('conv.split.tip') }, optSw('split', t('conv.split'))),
      h('div', { class: 'grow' }),
      h('button', { class: 'btn sm', onclick: () => fileIn.click() }, icon('upload', 14), t('conv.load')), fileIn,
      h('button', { class: 'btn sm primary', onclick: run }, icon('wand', 14), t('conv.run'))),
    cs.opts.split ? h('div', { class: 'split-tools' }, markBtns, h('div', { class: 'hint' }, t('conv.marks.hint'))) : null,
    fmtBar,
    h('div', { class: 'lbl' }, t('conv.result')), summary, rowsBox,
    h('div', { class: 'row-actions left' },
      h('button', { class: 'btn primary', onclick: () => insertInto(false) }, icon('down', 16), t('conv.append')),
      h('button', {
        class: 'btn', onclick: async () => {
          if (f.script.trim() && !(await confirmDlg({ title: t('conv.replace.q'), text: t('conv.replace.t'), ok: t('conv.replace'), danger: true }))) return;
          insertInto(true);
        }
      }, t('conv.replace')),
      h('button', { class: 'btn', onclick: async () => toast(await copyText(code()) ? t('c.copied') : t('c.copyfail')) }, icon('copy', 16), t('code.copy'))));
  /* текст этой главы подставляется в парсер сам (один раз на каждую версию текста), чтобы его не копировать руками */
  if (f.text && f.text.trim() && !cs.raw.trim() && cs.autoH !== prHash(f.text)) { cs.autoH = prHash(f.text); raw.value = prPlain(f.text); cs.raw = raw.value; }
  paintPull();
  paintMirror();
  if (cs.raw) run();
  return box;
}

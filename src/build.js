'use strict';
/* ====== Окно «Сборка»: проверка, предпросмотр файлов, скачивание ZIP ====== */
let BLD = null;

async function openBuild(tab) {
  closePopover();
  if (BLD && !BLD.m.closed) { if (tab && BLD.res) { BLD.tab = tab; renderBuild(BLD); } return; }
  flushHistory();
  const st = { tab: tab || 'report', res: null, q: 0, busy: false };
  BLD = st;
  st.m = openModal({
    cls: 'node-m build-m', onClose: () => { if (BLD === st) BLD = null; flushHistory(); },
    build: m => {
      st.m = m;
      st.side = h('div', { class: 'm-side' }); st.main = h('div', { class: 'm-main' }); st.foot = h('div', { class: 'bld-foot' });
      st.main.append(h('div', { class: 'empty', style: { margin: '24px' } }, t('bld.working')));
      return h('div', { class: 'm-wrap' }, modalHead(t('bld.title'), m), h('div', { class: 'm-body' }, st.side, st.main), st.foot);
    }
  });
  await bldRecompile(st);
}
async function bldRecompile(st) {
  const token = ++st.q;
  const blobs = await availableBlobs();
  if (st.q !== token || st.m.closed) return;
  st.res = compileProject(null, blobs);
  const known = new Set([...st.res.files.map(f => f.path), 'res']);
  if (st.tab !== 'report' && st.tab !== 'guide' && st.tab !== 'renpy' && !known.has(st.tab)) st.tab = 'report';
  renderBuild(st);
}
function bldAfterEdit(st) {
  const nm = NMODAL && !NMODAL.m.closed ? NMODAL.m : null;
  if (!nm) return;
  const oc = nm.onClose;
  nm.onClose = () => { if (oc) oc(); setTimeout(() => { if (BLD === st) bldRecompile(st); }, 30); };
}

const bldFileLabel = p => p.replace(/^game\//, '');
function renderBuild(st) {
  const R = st.res;
  st.side.replaceChildren();
  const bad = R.stats.errors + R.stats.warns;
  st.side.append(h('div', { class: 'fitem top guide-tab' + (st.tab === 'guide' ? ' on' : ''), onclick: () => { st.tab = 'guide'; renderBuild(st); } },
    icon('play', 16), h('span', { class: 'fn' }, t('gd.tab'))),
    DESK ? h('div', { class: 'fitem top guide-tab' + (st.tab === 'renpy' ? ' on' : ''), onclick: () => { st.tab = 'renpy'; renderBuild(st); } }, icon('zap', 16), h('span', { class: 'fn' }, t('rp.tab'))) : null,
    h('div', { class: 'side-h' }, t('bld.problems')),
    h('div', { class: 'fitem top' + (st.tab === 'report' ? ' on' : ''), onclick: () => { st.tab = 'report'; renderBuild(st); } },
      icon(R.stats.errors ? 'xcircle' : bad ? 'alert' : 'check', 16), h('span', { class: 'fn' }, t('bld.report')), h('span', { class: 'count' }, bad || '✓')));
  const text = R.files.filter(f => !f.story && f.path.startsWith('game/'));
  const story = R.files.filter(f => f.story);
  const other = R.files.filter(f => !f.path.startsWith('game/'));
  st.side.append(h('div', { class: 'side-h' }, t('bld.files')));
  const item = f => h('div', { class: 'fitem top' + (st.tab === f.path ? ' on' : ''), 'data-tip': f.path, onclick: () => { st.tab = f.path; renderBuild(st); } },
    icon('file', 15), h('span', { class: 'fn mono-s' }, bldFileLabel(f.path).replace(/^story\/[^/]+\//, '')));
  text.forEach(f => st.side.append(item(f)));
  let lastDir = null;
  story.forEach(f => {
    const dir = f.path.split('/')[2];
    if (dir !== lastDir) { lastDir = dir; st.side.append(h('div', { class: 'side-sub' }, icon('folder', 13), dir)); }
    st.side.append(item(f));
  });
  if (other.length) st.side.append(h('div', { class: 'side-sub' }, icon('folder', 13), '…'));
  other.forEach(f => st.side.append(item(f)));
  st.side.append(h('div', { class: 'side-h' }, t('bld.res')),
    h('div', { class: 'fitem top' + (st.tab === 'res' ? ' on' : ''), onclick: () => { st.tab = 'res'; renderBuild(st); } },
      icon('image', 16), h('span', { class: 'fn' }, t('bld.res')), h('span', { class: 'count' }, R.bin.length)));

  const keep = st.main.scrollTop;
  st.main.replaceChildren(st.tab === 'report' ? bldReportView(st) : st.tab === 'guide' ? bldGuideView(st) : st.tab === 'renpy' ? bldRenpyView(st) : st.tab === 'res' ? bldResView(st) : bldFileView(st));
  st.main.scrollTop = st.tab === 'report' ? keep : 0;
  if (st.tab !== 'renpy') RP.view = null;
  renderBuildFoot(st);
}

function bldTile(n, label) { return h('div', { class: 'tile' }, h('div', { class: 'tile-v' }, String(n)), h('div', { class: 'tile-l' }, label)); }

function bldReportView(st) {
  const R = st.res, root = h('div', { class: 'view bld-view' });
  if (!R.files.length) { root.append(h('div', { class: 'empty' }, t('bld.nofiles')), ...R.items.map(bldItem(st))); return root; }
  root.append(h('div', { class: 'tiles' },
    bldTile(R.stats.blocks, t('bld.t.blocks')), bldTile(R.stats.files, t('bld.t.files')), bldTile(R.stats.menus, t('bld.t.menus')),
    bldTile(R.stats.endings, t('bld.t.endings')), bldTile(R.stats.assetFiles, t('bld.t.res')), bldTile(humanSize(R.stats.bytes), t('bld.t.size'))));

  /* параметры */
  const o = R.opt;
  const setOpt = (k, v) => { P.build[k] = v; commit(true); bldRecompile(st); };
  const sw = (k, label, hint) => h('div', { class: 'opt-row' }, switchEl(!!o[k], v => setOpt(k, v)), h('div', { class: 'opt-t' }, h('div', {}, label), hint ? h('div', { class: 'hint' }, hint) : null));
  const startSel = h('select', { class: 'inp sm' }, P.nodes.filter(n => n.type !== 'note').map(n => h('option', { value: n.id }, n.title)));
  startSel.value = R.start || '';
  startSel.addEventListener('change', () => { P.startId = startSel.value; commit(true); renderAll(); bldRecompile(st); });
  root.append(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('sliders', 16), h('b', t('bld.opts'))),
    h('div', { class: 'grid2' },
      field(t('bld.start'), startSel),
      field(t('bld.mode'), segmented([{ value: 'split', label: t('bld.mode.split') }, { value: 'single', label: t('bld.mode.single') }], o.mode, v => setOpt('mode', v)))),
    sw('placeholders', t('bld.opt.ph'), t('bld.opt.ph.h')), sw('skipMissingAudio', t('bld.opt.skip'), t('bld.opt.skip.h')),
    sw('endingCard', t('bld.opt.card')), sw('endingCounter', t('bld.opt.count')),
    P.members.length ? sw('endingCredits', t('bld.opt.credits'), t('bld.opt.credits.h')) : null,
    P.tl.langs.length ? h('div', { class: 'opt-row' }, segmented(['draft', 'review', 'done'].map(k => ({ value: k, label: t('bld.tlmin.' + k) })), o.tlMin || 'draft', v => setOpt('tlMin', v)), h('div', { class: 'opt-t' }, h('div', {}, t('bld.opt.tlmin')), h('div', { class: 'hint' }, t('bld.opt.tlmin.h')))) : null,
    sw('extras', t('bld.opt.extras'), t('bld.opt.extras.h')),
    sw('includeUnreachable', t('bld.opt.unreach'), t('bld.opt.unreach.h')), sw('includeDocs', t('bld.opt.docs')), sw('includeSource', t('bld.opt.src'))));
  root.append(bldExtrasCard(R));

  /* отчёт */
  root.append(h('div', { class: 'sec-head', style: { marginTop: '4px' } }, icon(R.stats.errors ? 'xcircle' : R.items.length ? 'alert' : 'check', 16), h('b', t('bld.problems')),
    h('span', { class: 'hint' }, R.items.length ? t('bld.counts', R.stats.errors, R.stats.warns) : t('bld.ok')), h('div', { class: 'grow' }),
    h('button', { class: 'btn sm', onclick: () => bldRecompile(st) }, icon('zap', 14), t('bld.recheck'))));
  const list = h('div', { class: 'rep' });
  R.items.forEach(it => list.append(bldItem(st)(it)));
  root.append(list);
  root.append(h('div', { class: 'card-sec how guide-link', onclick: () => { st.tab = 'guide'; renderBuild(st); } }, icon('play', 18),
    h('div', { class: 'gl-t' }, h('b', t('gd.link')), h('div', { class: 'hint' }, t('gd.link.p'))), h('button', { class: 'btn sm' }, t('gd.open'), icon('chevR', 14))));
  return root;
}
function bldItem(st) {
  return it => {
    const ic = it.level === 'error' ? 'xcircle' : it.level === 'warn' ? 'alert' : 'info';
    const row = h('div', { class: 'rep-item ' + it.level }, h('span', { class: 'rep-ic' }, icon(ic, 16)), h('div', { class: 'rep-t' }, it.msg));
    const acts = h('div', { class: 'rep-acts' });
    if (it.fix) acts.append(h('button', { class: 'btn sm', onclick: () => { it.fix.run(); bldRecompile(st); } }, icon('plus', 14), it.fix.label));
    if (it.nodeId && nodeById(it.nodeId)) acts.append(h('button', { class: 'btn sm', onclick: () => { openNodeModal(it.nodeId, it.fileId || undefined); bldAfterEdit(st); } }, icon('open', 14), t('bld.show')));
    if ((it.level === 'error' || it.level === 'warn') && typeof aiReady === 'function' && aiReady()) acts.append(h('button', { class: 'btn sm aie-btn', 'data-tip': t('aie.tip'), onclick: () => aiAskBuild(it) }, icon('wand', 14), t('aie.btn')));
    if (acts.childNodes.length) row.append(acts);
    return row;
  };
}

function bldFileView(st) {
  const f = st.res.files.find(x => x.path === st.tab);
  const root = h('div', { class: 'view bld-view wide' });
  if (!f) return root;
  const isRpy = /\.rpy$/.test(f.path);
  const tags = new Set(P.characters.map(c => c.tag));
  const pre = h('pre', { class: 'codepre' });
  if (isRpy) pre.innerHTML = highlightRenpy(f.text, tags); else pre.textContent = f.text;
  root.append(h('div', { class: 'bld-fh' }, icon('file', 16), h('b', { class: 'mono-s' }, f.path), h('span', { class: 'hint' }, humanSize(new TextEncoder().encode(f.text).length)), h('div', { class: 'grow' }),
    h('button', { class: 'btn sm', onclick: () => copyText(f.text).then(() => toast(t('bld.copied'))) }, icon('copy', 14), t('bld.copyfile'))), pre);
  return root;
}

/* ---- пошаговая инструкция ---- */
function bldTreeLines(R) {
  const own = R.files.filter(f => f.path.startsWith('game/')).map(f => f.path.slice(5));
  const dirs = new Map(); // каталог -> [{name, note}]
  const top = [];
  const notes = { 'script.rpy': 'gd.n.script', 'characters.rpy': 'gd.n.chars', 'variables.rpy': 'gd.n.vars', 'endings.rpy': 'gd.n.end', 'assets.rpy': 'gd.n.assets', 'effects.rpy': 'gd.n.fx', 'gallery.rpy': 'gd.n.gallery', 'musicroom.rpy': 'gd.n.music', 'achievements.rpy': 'gd.n.ach', 'gui_custom.rpy': 'gd.n.gui' };
  const storyDirs = new Map();
  for (const f of own) {
    const parts = f.split('/');
    if (parts[0] === 'story' && parts.length === 3) { if (!storyDirs.has(parts[1])) storyDirs.set(parts[1], []); storyDirs.get(parts[1]).push(parts[2]); }
    else if (parts.length === 1) top.push({ name: f, note: notes[f] || null });
  }
  const resDirs = new Map();
  for (const b of R.bin) { const m = /^game\/([^/]+)\//.exec(b.path); if (m) resDirs.set(m[1], (resDirs.get(m[1]) || 0) + 1); }
  const L = [];
  L.push({ d: 0, name: 'game/', note: null });
  const items = [];
  top.forEach(x => items.push({ name: x.name, note: x.note ? t(x.note) : null, own: true }));
  if (storyDirs.size) items.push({ name: 'story/', note: t('gd.n.story'), own: true, kids: [...storyDirs].map(([d, fs]) => ({ name: d + '/', kids: fs.map(n => ({ name: n })) })) });
  for (const [d, n] of resDirs) items.push({ name: d + '/', note: (t('gd.n.' + d) || '') + ' (' + n + ')', own: true });
  items.push({ name: 'options.rpy, gui.rpy, screens.rpy …', note: t('gd.n.rp') });
  const walk = (arr, prefix, depth) => arr.forEach((it, i) => {
    const last = i === arr.length - 1;
    L.push({ line: prefix + (last ? '└─ ' : '├─ ') + it.name, note: it.note, own: it.own });
    if (it.kids) walk(it.kids, prefix + (last ? '   ' : '│  '), depth + 1);
  });
  walk(items, '', 1);
  L[0].line = 'game/';
  return L;
}
function bldGuideView(st) {
  const R = st.res, root = h('div', { class: 'view bld-view guide' });
  const can = R.files.length > 0;
  const startNode = R.start ? nodeById(R.start) : null;
  const step = (n, title, body, extra) => h('div', { class: 'gd-step' },
    h('div', { class: 'gd-n' }, String(n)), h('div', { class: 'gd-b' }, h('div', { class: 'gd-t' }, title), ...body.map(x => h('p', { class: 'gd-p' }, x)), extra || null));
  root.append(h('div', { class: 'sec-head' }, icon('play', 17), h('b', t('gd.h'))), h('p', { class: 'gd-lead' }, t('gd.lead')));
  const dl = DESK
    ? h('button', { class: 'btn primary', disabled: !can || st.busy, onclick: () => bldWriteFolder(st) }, icon('folder', 16), t('desk.build.folder'))
    : h('button', { class: 'btn primary', disabled: !can || st.busy, onclick: () => bldDownload(st) }, icon('download', 16), t('bld.download'));
  root.append(h('div', { class: 'gd-steps' },
    step(1, t('gd.s1.t'), [t('gd.s1.p')]),
    step(2, t('gd.s2.t'), [t('gd.s2.p')]),
    step(3, t('gd.s3.t'), [DESK ? t('gd.s3.d') : t('gd.s3.p')], dl),
    step(4, t('gd.s4.t'), [DESK ? t('gd.s4.d') : t('gd.s4.p')]),
    step(5, t('gd.s5.t'), [t('gd.s5.p', startNode ? startNode.title : '—'), t('gd.s5.p2')])));
  if (DESK) root.append(h('div', { class: 'card-sec how guide-link', id: 'gd-rp-link', onclick: () => { st.tab = 'renpy'; renderBuild(st); } }, icon('zap', 18),
    h('div', { class: 'gl-t' }, h('b', t('rp.guide.h')), h('div', { class: 'hint' }, t('rp.guide.p'))), h('button', { class: 'btn sm' }, t('rp.tab'), icon('chevR', 14))));
  if (typeof devOn === 'function' && devOn()) root.append(h('div', { class: 'card-sec how guide-link', id: 'gd-cc-link', onclick: () => { st.m.close(); setTimeout(openCtrlCheck, 0); } }, icon('check', 18),
    h('div', { class: 'gl-t' }, h('b', t('cc.guide.h')), h('div', { class: 'hint' }, t('cc.guide.p'))), h('button', { class: 'btn sm' }, t('cc.btn'), icon('chevR', 14))));
  if (can) {
    const pre = h('div', { class: 'codepre gd-tree' });
    bldTreeLines(R).forEach(l => pre.append(h('div', { class: 'gd-tl' + (l.own ? ' own' : '') }, h('span', l.line), l.note ? h('span', { class: 'gd-note' }, '— ' + l.note + (l.own ? ' · ' + t('gd.n.own') : '')) : null)));
    root.append(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('folder', 16), h('b', t('gd.tree.h'))), pre));
  }
  root.append(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('refresh', 16), h('b', t('gd.again.h'))), h('p', { class: 'gd-p' }, t('gd.again'))));
  const fix = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('help', 16), h('b', t('gd.fix.h'))));
  for (let i = 1; i <= 6; i++) fix.append(h('details', { class: 'gd-q' }, h('summary', t('gd.q' + i)), h('p', { class: 'gd-p' }, t('gd.a' + i))));
  root.append(fix);
  return root;
}

function bldResView(st) {
  const R = st.res, root = h('div', { class: 'view bld-view' });
  if (!R.bin.length) {
    root.append(h('div', { class: 'empty' }, t('bld.res.none')), h('div', { class: 'row-actions left', style: { marginTop: '14px' } }, h('button', { class: 'btn', onclick: () => openRegistry('bg') }, icon('layers', 16), t('bld.openreg'))));
    return root;
  }
  const table = h('div', { class: 'ftable res' });
  table.append(h('div', { class: 'frow head' }, h('span', t('reg.f.file')), h('span', t('bld.res.from')), h('span', { class: 'r' }, '')));
  const owner = new Map();
  for (const a of P.assets) for (const m of Object.values(a.files || {})) owner.set(m.bid, a);
  R.bin.forEach(b => {
    const a = owner.get(b.bid);
    table.append(h('div', { class: 'frow' }, h('span', { class: 'fcell mono-s' }, icon(a && isImageKind(a.kind) ? 'image' : 'music', 15), bldFileLabel(b.path)),
      h('span', { class: 'fcell' }, a ? a.name : '—'), h('span', { class: 'r' }, humanSize(b.size))));
  });
  root.append(table);
  return root;
}

function renderBuildFoot(st) {
  const R = st.res;
  const can = R.files.length > 0;
  const btn = h('button', { class: (DESK ? 'btn' : 'btn primary') + ' lg', disabled: !can || st.busy, onclick: () => bldDownload(st) }, icon('download', 17), st.busy ? t('bld.busy') : t('bld.download'));
  const toFolder = DESK ? h('button', { class: 'btn primary lg', disabled: !can || st.busy, onclick: () => bldWriteFolder(st) }, icon('folder', 17), t('desk.build.folder')) : null;
  const show = DESK && st.outDir ? h('button', { class: 'btn', onclick: () => DESK.showInFolder(st.outDir) }, icon('folder', 16), t('desk.build.show')) : null;
  const cp = h('button', { class: 'btn', disabled: !can, onclick: () => { const f = R.files.find(x => x.path === 'game/script.rpy'); if (f) copyText(f.text).then(() => toast(t('bld.copied'))); } }, icon('copy', 16), t('bld.copy'));
  st.foot.replaceChildren(
    h('div', { class: 'bld-sum' }, can ? [h('b', R.files.length + R.bin.length + ''), ' · ', humanSize(R.stats.bytes), R.stats.errors || R.stats.warns ? [' · ', h('span', { class: R.stats.errors ? 'err-t' : 'warn-t' }, t('bld.counts', R.stats.errors, R.stats.warns))] : null] : null),
    h('div', { class: 'grow' }), ...[show, cp, btn, toFolder].filter(Boolean));
}
async function bldDownload(st) {
  if (st.busy) return;
  st.busy = true; renderBuildFoot(st);
  try {
    const blobs = await availableBlobs();
    const res = compileProject(null, blobs);
    const zip = await buildGameZip(res);
    await saveFile(slug(P.name) + '_renpy.zip', zip, 'application/zip');
    if (BLD === st && !st.m.closed && st.tab !== 'guide') { st.tab = 'guide'; renderBuild(st); }
  } catch (e) { toast(t('bld.fail') + ' (' + (e && e.message || '?') + ')', 5000); }
  st.busy = false;
  if (BLD === st && !st.m.closed) renderBuildFoot(st);
}

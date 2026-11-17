'use strict';
/* ====== Оболочка приложения: верхняя панель, горячие клавиши, запуск ====== */
const BTN = {};

function tbtn(ic, label, tip, onClick, cls = '') {
  return h('button', { class: 'btn tbn ' + cls, 'data-tip': tip || label, onclick: ev => onClick(ev.currentTarget, ev) }, icon(ic, 18), label ? h('span', { class: 'tlbl' }, label) : null);
}
/** Кнопки правой части панели по id. Какие показывать и в каком порядке, решают режим интерфейса и вкладка «Панель» в Настройках (uimode.js). */
function barBuilders() {
  const open = () => (DESK ? tbtn('folder', t('desk.open.short'), t('desk.open.tip') + ' (Ctrl+O)', () => deskCommand('open')) : tbtn('upload', t('top.import'), t('top.import.tip'), importJSONFile));
  const saveItems = () => [{ label: t('sn.btn'), icon: 'undo', onClick: () => openSnapshots() }, ...(DESK ? [
    { label: t('desk.save'), icon: 'save', kbd: 'Ctrl+S', onClick: () => deskCommand('save') },
    { label: t('desk.saveas'), icon: 'save', kbd: 'Ctrl+Shift+S', onClick: () => deskCommand('saveas') },
    { label: t('desk.copy'), icon: 'copy', onClick: exportJSON }] : [{ label: t('exp.json'), icon: 'save', kbd: 'Ctrl+S', onClick: exportJSON }])];
  return {
    play: () => tbtn('play', t('pl.btn'), t('pl.tip'), () => openPlayer(), 'pl-top-btn'),
    text: () => tbtn('type', t('te.top'), t('te.top.tip'), () => { const id = [...UI.sel][0], n = id && nodeById(id); openTextEditor(n && n.type !== 'note' ? { nodeId: n.id } : {}); }, 'te-top-btn'),
    registry: () => tbtn('layers', t('top.registry'), t('top.registry.tip'), () => openRegistry()),
    export: () => (uiPro() ? tbtn('download', t('top.export'), t('top.export.tip'), b => menuAt(b, [
      { label: t('exp.build'), icon: 'box', kbd: DESK ? 'Ctrl+B' : undefined, onClick: () => openBuild() },
      { sep: true },
      { label: t('exp.svg.dark'), icon: 'image', onClick: () => exportSVG('dark') },
      { label: t('exp.svg.light'), icon: 'image', onClick: () => exportSVG('light') },
      { label: t('mp.menu'), icon: 'image', onClick: () => openMapPdf() },
      { label: t('dg.menu'), icon: 'rows', onClick: () => openDigest() },
      { sep: true }, ...saveItems(),
      { label: t('exp.map'), icon: 'rows', onClick: exportMap }]), 'build-btn') : null),
    build: () => (uiPro() ? null : tbtn('box', t('ui.build'), t('ui.build.tip') + (DESK ? ' (Ctrl+B)' : ''), () => openBuild(), 'build-btn')),
    file: () => (uiPro() ? null : tbtn('save', t('ui.file'), t('ui.file.tip'), b => menuAt(b, [...saveItems(), { sep: true },
      { label: t('exp.svg.dark'), icon: 'image', onClick: () => exportSVG('dark') },
      { label: t('exp.svg.light'), icon: 'image', onClick: () => exportSVG('light') },
      { label: t('mp.menu'), icon: 'image', onClick: () => openMapPdf() },
      { label: t('exp.map'), icon: 'rows', onClick: exportMap }]), 'file-btn')),
    open,
  };
}
/** Правая часть верхней панели: зависит от режима интерфейса и настройки «Панель» (uimode.js). */
function topRight(langSeg) {
  const B = barBuilders(), out = [];
  for (const id of barIds('main')) { const b = B[id] && B[id](); if (b) out.push(b); }
  out.push(h('div', { class: 'tsep' }), tbtn('sliders', '', t('top.settings'), () => openSettingsWindow()));
  if (uiShow('bar.theme')) out.push(BTN.theme = tbtn(S.theme === 'dark' ? 'sun' : 'moon', '', t('top.theme'), () => toggleTheme()));
  else BTN.theme = null;
  if (uiShow('bar.lang')) out.push(langSeg);
  out.push(tbtn('help', '', t('top.help') + ' (?)', () => openHelp()));
  return out;
}
function buildChrome() {
  BTN.team = BTN.collab = null;
  const nameI = h('input', { class: 'proj-name', id: 'proj-name', type: 'text', spellcheck: 'false', 'aria-label': t('top.name'), 'data-tip': t('top.name') });
  nameI.value = P.name;
  nameI.addEventListener('input', () => { P.name = nameI.value; commit(); });
  nameI.addEventListener('keydown', e => { if (e.key === 'Enter') nameI.blur(); });
  const badge = h('div', { class: 'save-badge', id: 'save-badge', role: 'button', tabindex: '0', onclick: () => openSnapshots(), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSnapshots(); } } });
  BTN.undo = tbtn('undo', '', t('c.undo') + ' (Ctrl+Z)', () => undo());
  BTN.redo = tbtn('redo', '', t('c.redo') + ' (Ctrl+Shift+Z)', () => redo());
  BTN.theme = tbtn(S.theme === 'dark' ? 'sun' : 'moon', '', t('top.theme'), () => toggleTheme());
  const langSeg = segmented([{ value: 'ru', label: 'RU' }, { value: 'en', label: 'EN' }], S.lang, v => setLang(v), 'mini');
  const identity = h('div', { class: 'bar', id: 'bar-id' }, h('div', { class: 'logo' }, icon('fork', 18, 2)), nameI, badge);
  const core = h('div', { class: 'bar', id: 'bar-core' }, BTN.undo, BTN.redo, h('div', { class: 'tsep' }),
    tbtn('plus', t('top.add'), t('top.add.tip'), b => menuAt(b, NODE_TYPES.map(tp => ({ label: t('type.' + tp), icon: TYPE_ICON[tp], onClick: () => addNodeAtCenter(tp) })))),
    tbtn('search', t('top.search'), t('top.search') + ' (Ctrl+K)', () => openSearch()),
    uiPro() ? tbtn('wand', t('tools.btn'), t('tools.tip'), b => toolsMenu(b), 'tools-btn') : tbtn('grid', t('ui.more'), t('ui.more.tip'), b => uiMoreMenu(b), 'more-btn'));
  const strip = uiStrip();
  const mainBar = h('div', { class: 'bar', id: 'bar-main' }, ...topRight(langSeg));
  document.body.classList.toggle('ui-pro', uiPro());
  const zb = $('#zoombar'); zb.replaceChildren(h('div', { class: 'bar' },
    tbtn('minus', '', t('zoom.out'), () => zoomCenter(1 / 1.25)),
    h('button', { class: 'btn zlabel', id: 'zoom-label', 'data-tip': t('zoom.reset'), onclick: () => { const r = stage.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1); } }, '100%'),
    tbtn('plus', '', t('zoom.in'), () => zoomCenter(1.25)),
    h('div', { class: 'tsep' }),
    tbtn('fit', '', t('c.fit') + ' (F)', () => fitAll()),
    ...(uiPlain('bar.layers') ? [h('div', { class: 'tsep' }),
    (BTN.echo = tbtn('flag', '', t('tb.echo'), b => { S.echo = !S.echo; saveSettings(); b.classList.toggle('on', S.echo); renderEchoes(); }, S.echo ? 'on' : '')),
    (BTN.jumps = tbtn('link', '', t('tb.jumps'), b => { S.jumps = !S.jumps; saveSettings(); b.classList.toggle('on', S.jumps); renderJumps(); }, S.jumps ? 'on' : ''))] : [])));
  BTN.echo = uiPlain('bar.layers') ? BTN.echo : null; BTN.jumps = uiPlain('bar.layers') ? BTN.jumps : null;
  dockLayout({ core, strip, main: mainBar, zoom: zb, status: $('#statusbar') }, identity);
  updateUndoButtons(); updateSaveBadge(); updateZoomLabel(); updateStatus();
  if (typeof collabRefreshUI === 'function') collabRefreshUI(); if (BTN.collab) BTN.collab.hidden = !(typeof collabAvail === 'function' && collabAvail());
}
function updateUndoButtons() {
  if (BTN.undo) BTN.undo.disabled = !canUndo();
  if (BTN.redo) BTN.redo.disabled = !canRedo();
}
function updateSaveBadge() {
  const el = $('#save-badge'); if (!el) return;
  const st = UI.saveState;
  el.className = 'save-badge ' + st;
  el.textContent = t('save.' + st);
  el.setAttribute('data-tip', st === 'error' ? t('save.error.tip') : t('save.tip') + t('sn.badge'));
}
function updateZoomLabel() { const el = $('#zoom-label'); if (el && P) el.textContent = Math.round(P.view.k * 100) + '%'; }
function ago(ms) {
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return t('ago.now');
  if (m < 60) return t('ago.min', m);
  const hh = Math.floor(m / 60); if (hh < 24) return t('ago.hour', hh);
  return t('ago.day', Math.floor(hh / 24));
}
function updateStatus() {
  const el = $('#statusbar'); if (!el || !P) return;
  const st = projectStats();
  const stale = P.nodes.length && (!UI.lastBackup || Date.now() - UI.lastBackup > 864e5);
  el.replaceChildren(h('div', { class: 'bar' },
    h('button', { class: 'btn stat', 'data-tip': t('sh.tip'), onclick: () => openStatsHub() },
      h('span', t('status.blocks', st.nodes)), h('span', { class: 'sep-dot' }, '·'), h('span', t('status.files', st.files)), h('span', { class: 'sep-dot' }, '·'), h('span', { class: 'strong' }, Math.round(st.pct * 100) + '%')),
    typeof aclChip === 'function' ? aclChip() : null,
    DESK ? [deskStatusChip(), syncChip(), updChip()]
      : [h('button', { class: 'btn stat' + (stale ? ' warn' : ''), 'data-tip': t('status.backup.tip'), onclick: () => exportJSON() }, icon('save', 15), UI.lastBackup ? t('status.backup', ago(UI.lastBackup)) : t('status.nobackup')), syncChip()]));
  if (typeof syRefreshOpen === 'function') syRefreshOpen();
}
function toggleTheme() {
  S.theme = S.theme === 'dark' ? 'light' : 'dark';
  applyTheme(); saveSettings(); renderAll();
  if (BTN.theme) { const nb = tbtn(S.theme === 'dark' ? 'sun' : 'moon', '', t('top.theme'), () => toggleTheme()); BTN.theme.replaceWith(nb); BTN.theme = nb; }
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', S.theme);
  document.documentElement.lang = S.lang;
  if (typeof winbarSync === 'function') winbarSync();
}
function setLang(l) {
  if (l === S.lang) return;
  S.lang = l; saveSettings(); applyTheme(); closePopover();
  if (DESK) DESK.setLang(l).catch(() => { });
  if (typeof winbarTitle === 'function') winbarTitle();
  MODALS.slice().forEach(m => { if (!NMODAL || m !== NMODAL.m) m.close(); });
  clearMeasure(); reindex(); buildChrome(); renderAll(); refreshNodeModal();
}
function onProjectReplaced() {
  AUTH_SIG = null;
  renderAll(); applyView(); refreshNodeModal();
  if (REG && !REG.m.closed) renderReg();
  const pn = $('#proj-name'); if (pn) pn.value = P.name;
  updateStatus(); updateUndoButtons();
  if (typeof mfAfterReplace === 'function') mfAfterReplace();
  if (typeof aclAutoJoin === 'function') aclAutoJoin();
}

/* ---------- горячие клавиши ---------- */
function onKey(e) {
  const tg = e.target;
  const typing = tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable);
  const mod = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
  if (e.key === 'Escape') {
    const topM = MODALS[MODALS.length - 1];
    if (topM && topM.peek && (UI.connectMode || UI.sel.size || UI.edge)) { if (UI.connectMode) endConnectMode(); else setSel([]); e.preventDefault(); }   // окно редактора «плавает»: Esc сначала относится к карте
    else if (MODALS.length) { topM.close(); e.preventDefault(); }
    else if (UI.connectMode) endConnectMode();
    else if (UI.sel.size || UI.edge) setSel([]);
    return;
  }
  if (typeof LCH !== 'undefined' && LCH && !MODALS.length && !(mod && key.length === 1 && 'son'.includes(key))) return;    // пока открыт стартовый экран, карта под ним не реагирует на клавиши
  if (mod && key === 'k') { e.preventDefault(); openSearch(); return; }
  if (mod && key === 's') { e.preventDefault(); if (DESK) deskCommand(e.shiftKey ? 'saveas' : 'save'); else exportJSON(); return; }
  if (DESK && mod && key === 'o') { e.preventDefault(); deskCommand('open'); return; }
  if (mod && key === 'b') { e.preventDefault(); if (DESK) deskCommand('build'); else openBuild(); return; }
  if (DESK && mod && key === 'n') { e.preventDefault(); deskCommand('new'); return; }
  if (typing) return;
  if (mod && key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
  if (mod && key === 'y') { e.preventDefault(); redo(); return; }
  if (MODALS.some(x => !x.peek)) return;   // «плавающее» окно не мешает горячим клавишам карты
  if (e.key === 'Delete' || e.key === 'Backspace') { if (UI.sel.size || UI.edge) { e.preventDefault(); deleteSelection(); } return; }
  if (mod && key === 'd') { e.preventDefault(); duplicateSelection(); return; }
  if (mod && key === 'a') { e.preventDefault(); setSel(P.nodes.map(n => n.id)); return; }
  if (mod) return;
  if (key === 'f') { fitAll(); return; }
  if (key === '?' || key === '/') { e.preventDefault(); openHelp(); return; }
  if (key === '1') { const r = stage.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1); return; }
  if (key === '=' || key === '+') { zoomCenter(1.25); return; }
  if (key === '-') { zoomCenter(1 / 1.25); return; }
  if (key === 'enter') { if (UI.sel.size === 1) { e.preventDefault(); openNodeModal([...UI.sel][0]); } else if (UI.edge) openEdgeModal(UI.edge); return; }
  if (key.startsWith('arrow') && UI.sel.size) {
    e.preventDefault();
    const st = (e.shiftKey ? 5 : 1) * GRID;
    nudgeSelection(key === 'arrowleft' ? -st : key === 'arrowright' ? st : 0, key === 'arrowup' ? -st : key === 'arrowdown' ? st : 0);
  }
}

/* ---------- запуск ---------- */
function boot() {
  if (typeof GAME !== 'undefined' && GAME) { gameBoot(); return; }
  loadSettings();
  applyTheme();
  let p = loadProject(), first = false;
  if (!p) { p = demoProject(); first = true; }
  P = p; reindex(); resetHistory(); UI.firstRun = first;
  initCanvas();
  deskInit();
  buildChrome();
  if (typeof uiFirstNotice === 'function') uiFirstNotice();
  if (typeof snStart === 'function') snStart();
  renderAll(); if (first) fitAll(false); else applyView();
  document.addEventListener('keydown', onKey);
  window.addEventListener('beforeunload', () => { flushHistory(); saveNow(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { flushHistory(); saveNow(); } });
  window.addEventListener('dragover', e => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); });
  window.addEventListener('drop', e => {
    if (e.defaultPrevented) return;
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    e.preventDefault();
    if (/\.(vnmap|json|zip)$/i.test(f.name)) { if (DESK) deskDropFile(f); else readImport(f); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { clearMeasure(); reindex(); renderAll(); });
  setTimeout(blobGC, 4000);
  collabInit();
  if (typeof ghInit === 'function') ghInit();
  if (typeof ghOpenFromUrl === 'function') ghOpenFromUrl();
  if (first) { saveNow(); setTimeout(() => toast(t('welcome'), 7000), 600); }
  else setSaveState('saved');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

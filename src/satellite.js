'use strict';
/* ====== Отдельные окна (программа для компьютера): редактор текста, свой код, плеер можно вынести в настоящее окно системы ======
   Главное окно хранит проект и файл. Вынесенное окно («спутник») грузит ту же страницу в особом режиме (адрес с «#sat=имя»):
   карты и верхней панели в нём нет, инструмент занимает всё окно, сверху та же тонкая полоска, что и у главного.
   Обмен проектом: у каждого окна свой список «что я уже отправил» (SAT.last). Через 0,2 секунды после правки окно сравнивает проект
   с этим списком и рассылает остальным только изменившиеся сущности (блок, глава, стрелка, персонаж…) вместе с прежним значением.
   Получатель сверяет: если у него эта сущность не менялась, берёт новое значение; если менялась, сливает по полям (общее ядро merge.js,
   то же, что в совместной работе). При настоящем конфликте побеждает «старшее» окно: главное, потом по порядку инструментов,
   так что окна всегда приходят к одному и тому же. Положение карты, вкладки редактора и настройки окон у каждого свои.
   Файл проекта, автосохранение, Google Диск и GitHub живут только в главном окне; спутник ничего не пишет на диск. */

Object.assign(D, {
  'sat.pop': ['Вынести в отдельное окно (например, на второй монитор)', 'Open in a separate window (for example on a second monitor)'],
  'sat.back': ['Вернуть в главное окно', 'Move back to the main window'],
  'sat.err': ['Не удалось открыть отдельное окно.', 'Could not open a separate window.'],
  'sat.lost': ['Главное окно не отвечает. Закройте это окно и вынесите инструмент заново.', 'The main window is not responding. Close this window and open the tool again.'],
  'sat.t.texted': ['Редактор текста', 'Text editor'], 'sat.t.code': ['Свой код', 'Custom code'], 'sat.t.player': ['Плеер', 'Player'],
});

const SAT_ORDER = ['main', 'texted', 'code', 'player'];
const satApi = () => !!DESK && !!DESK.sat && ['me', 'open', 'send', 'onMsg', 'focusMain'].every(k => typeof DESK.sat[k] === 'function');      // старая оболочка этого не умеет
const SAT = { tool: (satApi() && typeof DESK.sat.tool === 'string' && DESK.sat.tool) || '', key: 'main', peers: new Set(), last: null, timer: 0, applying: false, init: null, ready: false };
const satIsWin = () => !!SAT.tool;
const satRank = k => { const i = SAT_ORDER.indexOf(k); return i < 0 ? 99 : i; };
/** Какие инструменты можно вынести и как открыть их в спутнике. */
const SAT_TOOLS = {
  texted: { open: o => openDocEditor(o || {}) },
  code: { open: o => openCustomCode(o && o.sel) },
  player: { open: async o => { await openPlayer(o || {}); return PLAY && PLAY.m; }, grab: () => (PLAY && PLAY.cur ? { fromNode: PLAY.cur.nid } : {}) },
};
/** Кнопка в заголовке окна инструмента: в главном окне «Вынести в отдельное окно», во вынесенном «Вернуть в главное окно». */
function satHeadBtn(m, head, tool) {
  if (!SAT_TOOLS[tool]) return;
  const close = head.lastElementChild;
  if (SAT.tool) head.insertBefore(h('button', { class: 'btn icon', id: 'win-back', 'data-tip': t('sat.back'), onclick: ev => { ev.stopPropagation(); satBack(m); } }, icon('open', 17)), close);
  else if (satCan(tool)) head.insertBefore(h('button', { class: 'btn icon', id: 'win-pop', 'data-tip': t('sat.pop'), onclick: ev => { ev.stopPropagation(); satPop(tool, m); } }, icon('open', 17)), close);
}
const satCan = tool => satApi() && !!SAT_TOOLS[tool] && !SAT.tool;
/** Сравнение сущностей «по смыслу»: пустое значение (нет поля, null, '', false, [], {}) считается равным отсутствию. Нужно, потому что
    загрузка проекта (normalize) дописывает пустые поля по умолчанию, а в окне, где блок только что создали, их ещё нет. */
function satCanon(v) {
  if (v === undefined || v === null || v === '' || v === false) return '';
  if (Array.isArray(v)) return v.length ? '[' + v.map(x => satCanon(x) || 'n').join(',') + ']' : '';
  if (typeof v === 'object') {
    const parts = [];
    for (const k of Object.keys(v).sort()) { const c = satCanon(v[k]); if (c) parts.push(JSON.stringify(k) + ':' + c); }
    return parts.length ? '{' + parts.join(',') + '}' : '';
  }
  return JSON.stringify(v);
}
const satEq = (a, b) => a === b || mgEq(a, b) || satCanon(a) === satCanon(b);
const satSend = msg => { try { DESK.sat.send(msg); } catch (e) { /* окон нет */ } };

/* ---------- обмен правками ---------- */
/** Вызывается после каждого изменения проекта. Без вынесенных окон не делает ничего. */
function satTouch() {
  if (SAT.applying || !SAT.last || !SAT.peers.size || SAT.timer) return;
  SAT.timer = setTimeout(satFlush, 200);
}
function satFlush() {
  clearTimeout(SAT.timer); SAT.timer = 0;
  if (!SAT.last || !SAT.peers.size || !P || SAT.applying) return;
  const L = mgEntities(P), set = [], del = [];
  for (const [k, v] of L) { const pv = SAT.last.get(k); if (pv === undefined || !satEq(pv, v)) set.push([k, pv === undefined ? null : pv, v]); }
  for (const [k, pv] of SAT.last) if (!L.has(k)) del.push([k, pv]);
  SAT.last = L;
  if (set.length || del.length) satSend({ k: 'delta', set, del });
}
/** Чужие правки: см. описание в начале файла. */
function satApplyDelta(m) {
  if (!SAT.last || !P) return;
  const L = mgEntities(P), M = new Map(L), cf = [];
  const theirs = satRank(m.from) < satRank(SAT.key);       // у кого старшинство при настоящем конфликте
  let changed = false, conflict = false;
  for (const [k, prev, next] of m.set || []) {
    const cur = L.get(k);
    SAT.last.set(k, next);                                    // у отправителя теперь именно это
    if (cur !== undefined && satEq(cur, next)) continue;
    if (cur === undefined ? prev === null : satEq(cur, prev)) { M.set(k, next); changed = true; continue; }
    conflict = true;
    if (cur === undefined) { M.set(k, next); changed = true; continue; }      // я убрал, они изменили: остаётся изменённое
    const b = mgIsObj(prev) ? prev : {};
    M.set(k, theirs ? mgMergeObj(b, next, cur, k, cf, 0) : mgMergeObj(b, cur, next, k, cf, 0)); changed = true;
  }
  for (const [k, prev] of m.del || []) {
    SAT.last.delete(k);
    const cur = L.get(k);
    if (cur === undefined) continue;
    if (satEq(cur, prev)) { M.delete(k); changed = true; } else conflict = true;     // я менял, они убрали: остаётся моё и уйдёт им при следующей отправке
  }
  if (changed) {
    SAT.applying = true;
    try { clApplyMap(M, cf); } finally { SAT.applying = false; }
    if (typeof winbarTitle === 'function') winbarTitle();
  }
  if (conflict) satTouch();
}

function satOnMsg(m) {
  if (!m || typeof m !== 'object') return;
  if (m.k === 'delta') { if (!SAT.tool || SAT.ready) satApplyDelta(m); return; }
  if (m.k === 'hello') {                                  // главное окно: новый спутник просит проект
    if (SAT.tool) return;
    if (SAT.last) satFlush(); else { flushHistory(); SAT.last = mgEntities(P); }
    SAT.peers.add(m.from);
    satSend({ to: m.from, k: 'init', json: snapJSON() });
    return;
  }
  if (m.k === 'closed') {
    SAT.peers.delete(m.from);
    if (!SAT.tool && !SAT.peers.size) { clearTimeout(SAT.timer); SAT.timer = 0; SAT.last = null; }
    if (SAT.tool && m.from === 'main') DESK.win.action('close');          // главное окно закрыто: спутнику нечего показывать
    return;
  }
  if (m.k === 'init') { if (SAT.tool && !SAT.ready) satGotInit(m); return; }
  if (m.k === 'reset') { if (SAT.tool) DESK.win.action('close'); return; }            // в главном окне открыт другой проект
  if (m.k === 'show') { if (SAT.tool && SAT.ready) satShowTool(m.init); return; }
  if (m.k === 'cmd') { satCommand(m); return; }
}
/** Команды между окнами: показать блок на карте, вернуть инструмент в главное окно. */
function satCommand(m) {
  if (!m || SAT.tool) return;                                       // исполняет только главное окно
  if (m.name === 'open' && m.tool && SAT_TOOLS[m.tool]) { if (m.init && m.init.teTabs) P.teTabs = m.init.teTabs; DESK.sat.focusMain(); SAT_TOOLS[m.tool].open(m.opts || {}); return; }
  if (m.name === 'desk' && m.cmd) { if (m.cmd !== 'save') DESK.sat.focusMain(); deskCommand(m.cmd, m.arg); return; }
  if (m.name === 'show' && m.id && nodeById(m.id)) { DESK.sat.focusMain(); focusNode(m.id); if (m.open) openNodeModal(m.id, m.fid); }
}
/** Вынесенное окно: «сохранить», «открыть», «сборка» и подобное делает главное окно (сначала уходят накопленные правки). */
function satForwardCmd(cmd, arg) {
  if (!['save', 'saveas', 'open', 'new', 'build', 'copy', 'launcher', 'drive', 'help'].includes(cmd)) return;
  satFlush();
  satSend({ to: 'main', k: 'cmd', name: 'desk', cmd, arg: arg == null ? null : arg });
}
/** Главное окно: проект заменили (новый, открыт другой файл): вынесенные окна показывали бы старый, закрываем их. */
function satProjectReplaced() {
  if (SAT.tool) return;
  if (SAT.peers.size) satSend({ k: 'reset' });
  SAT.peers.clear(); clearTimeout(SAT.timer); SAT.timer = 0; SAT.last = null;
}

/* ---------- главное окно ---------- */
function satMainInit() {
  if (!satApi() || SAT.tool) return;
  DESK.sat.onMsg(satOnMsg);
  window.addEventListener('storage', satStorage);
  DESK.sat.me().then(me => { if (me && me.open && me.open.length) satSend({ k: 'reset' }); }).catch(() => { });          // страницу перезагрузили, а окна остались: пусть откроются заново
}
/** Вынести инструмент в отдельное окно. m — окно в главной странице (его закрываем, чтобы не править в двух местах). */
async function satPop(tool, m) {
  if (!satCan(tool)) return false;
  try {
    const init = { teTabs: P.teTabs ? JSON.parse(JSON.stringify(P.teTabs)) : null, opts: SAT_TOOLS[tool].grab ? SAT_TOOLS[tool].grab() : {} };
    if (m && !m.closed) m.close();
    const r = await DESK.sat.open(tool, init);
    if (!r || !r.ok) { toast(t('sat.err')); return false; }
    if (r.existed) satSend({ to: tool, k: 'show', init });
    return true;
  } catch (e) { toast(t('sat.err') + ' ' + deskErr(e), 5000); return false; }
}
/** Настройки (тема, язык, расположение окон) общие для окон: подхватываем чужие изменения. */
function satStorage(e) {
  if (e.key !== LS_S) return;
  const lang = S.lang, theme = S.theme;
  loadSettings();
  if (S.lang !== lang) { if (SAT.tool) { location.reload(); return; } applyTheme(); renderAll(); return; }
  if (S.theme !== theme) applyTheme();
}

/* ---------- окно-спутник ---------- */
async function satBoot() {
  loadSettings(); applyTheme();
  document.documentElement.classList.add('desktop', 'sat-win');
  P = emptyProject(); reindex(); resetHistory();
  initCanvas(); buildChrome();
  if (typeof winbarInit === 'function') winbarInit();
  window.addEventListener('storage', satStorage);
  window.addEventListener('beforeunload', () => { try { satFlush(); } catch (e) { /* закрываемся */ } });
  document.addEventListener('keydown', onKey);
  DESK.sat.onMsg(satOnMsg);
  const me = await DESK.sat.me().catch(() => null);
  if (me) { SAT.key = me.key || SAT.tool; SAT.init = me.init || null; }
  satSend({ to: 'main', k: 'hello' });
  setTimeout(() => { if (!SAT.ready) toast(t('sat.lost'), 20000); }, 6000);
}
function satGotInit(m) {
  let p;
  try { p = normalize(JSON.parse(m.json)); } catch (e) { toast(t('sat.lost'), 20000); return; }
  if (SAT.init && SAT.init.teTabs) p.teTabs = SAT.init.teTabs;
  P = p; reindex(); UI.sel.clear(); UI.edge = null; resetHistory();
  SAT.last = mgEntities(P); SAT.peers.add('main'); SAT.ready = true;
  renderAll(); applyView();
  if (typeof winbarTitle === 'function') winbarTitle();
  satShowTool(SAT.init);
}
/** Открыть (или показать заново) инструмент окна; закрыли его — закрылось и окно. */
async function satShowTool(init) {
  if (init && init.teTabs) P.teTabs = init.teTabs;
  const tool = SAT_TOOLS[SAT.tool]; if (!tool) return;
  const mm = await tool.open((init && init.opts) || {});
  if (mm && !mm.sat) {
    mm.sat = true;
    const was = mm.onClose;
    mm.onClose = () => { try { if (was) was(); } catch (e) { /* закрываем */ } satFlush(); setTimeout(() => DESK.win.action('close'), 30); };
  }
}
/** Кнопка «Вернуть в главное окно» в заголовке спутника: инструмент откроется в главном окне, это окно закроется. */
function satBack(m) {
  const init = { teTabs: P.teTabs ? JSON.parse(JSON.stringify(P.teTabs)) : null };
  satFlush();
  satSend({ to: 'main', k: 'cmd', name: 'open', tool: SAT.tool, init, opts: SAT_TOOLS[SAT.tool].grab ? SAT_TOOLS[SAT.tool].grab() : {} });
  m.onClose = null; DESK.win.action('close');
}

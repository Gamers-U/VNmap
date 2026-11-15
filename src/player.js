'use strict';
/* ====== Встроенный плеер: проиграть новеллу прямо в программе, без Ren'Py ======
   Берёт ту же сборку, что и окно «Сборка» (compileProject), и проигрывает её движком из playeng.js:
   реплики, фоны и спрайты (из ваших файлов или заглушки), музыка, выборы с условиями, переменные, концовки.
   Для автора: откат назад, «С блока…», панель переменных (их можно править на лету), история, замечания. */

Object.assign(D, {
  'pl.btn': ['Играть', 'Play'],
  'pl.tip': ['Пройти новеллу прямо здесь, без Ren\'Py (с любого блока)', 'Play the novel right here, without Ren\'Py (from any block)'],
  'pl.title': ['Плеер', 'Player'],
  'pl.building': ['Собираю игру…', 'Building the game…'],
  'pl.empty': ['В проекте нет блоков, которые можно проиграть. Добавьте блок и текст сцены.', 'There is nothing to play yet. Add a block and some scene text.'],
  'pl.err': ['Не удалось запустить: {0}', 'Could not start: {0}'],
  'pl.back': ['Назад: откатить на реплику (←)', 'Roll back one step (←)'],
  'pl.auto': ['Авто: само листает реплики (A)', 'Auto: advance on its own (A)'],
  'pl.skip': ['Пропуск: быстро листает реплики, останавливается на выборах (S)', 'Skip: fast-forward, stops at choices (S)'],
  'pl.restart': ['Начать сначала', 'Start over'],
  'pl.from': ['С блока…', 'From block…'],
  'pl.from.tip': ['Начать с любого блока (переменные — по умолчанию, править их можно справа)', 'Start from any block (variables are at their defaults; edit them on the right)'],
  'pl.sound': ['Звук', 'Sound'],
  'pl.panel': ['Переменные, история, замечания (H)', 'Variables, history, warnings (H)'],
  'pl.open': ['Открыть этот блок в редакторе', 'Open this block in the editor'],
  'pl.where': ['Блок «{0}»', 'Block "{0}"'],
  'pl.where.f': ['Блок «{0}» · {1}', 'Block "{0}" · {1}'],
  'pl.tab.vars': ['Переменные', 'Variables'],
  'pl.tab.hist': ['История', 'History'],
  'pl.tab.warn': ['Замечания', 'Warnings'],
  'pl.novars': ['Переменных пока нет', 'No variables yet'],
  'pl.nolog': ['Пока пусто', 'Nothing yet'],
  'pl.nowarn': ['Замечаний нет', 'No warnings'],
  'pl.var.edit': ['Новое значение для «{0}»', 'New value for "{0}"'],
  'pl.var.hint': ['Число, True/False, текст в кавычках или выражение. Щёлкните по значению, чтобы изменить.', 'A number, True/False, quoted text or an expression. Click a value to change it.'],
  'pl.var.bad': ['Не удалось вычислить: {0}', 'Could not evaluate: {0}'],
  'pl.endings': ['Концовки: открыто {0} из {1}', 'Endings: {0} of {1} unlocked'],
  'pl.endings.reset': ['Сбросить открытые концовки', 'Reset unlocked endings'],
  'pl.endings.reset.done': ['Концовки сброшены', 'Endings reset'],
  'pl.ending.got': ['Открыта концовка: {0}', 'Ending unlocked: {0}'],
  'pl.locked': ['закрыто', 'locked'],
  'pl.locked.tip': ['Этот выбор скрыт от игрока: условие «{0}» не выполнено', 'Hidden from the player: condition "{0}" is not met'],
  'pl.opt.locked': ['Показывать закрытые выборы (для автора)', 'Show locked choices (author view)'],
  'pl.end': ['Конец', 'The end'],
  'pl.end.sub': ['Прочитано реплик: {0}', 'Lines read: {0}'],
  'pl.end.err': ['Игра остановилась', 'The game stopped'],
  'pl.again': ['Заново', 'Again'],
  'pl.close': ['Закрыть', 'Close'],
  'pl.menu.node': ['Играть с этого блока', 'Play from this block'],
  'pl.click': ['Щёлкните или нажмите пробел', 'Click or press Space'],
  'pl.start.at': ['Старт с блока «{0}»', 'Starting at block "{0}"'],
  'pl.nodef': ['Блок «{0}» не попал в сборку (проверьте окно «Сборка»)', 'Block "{0}" did not make it into the build (see the Build window)'],
});

TOOL_ITEMS.push({ id: 'player', group: 'play', ic: 'play', key: 'pl.btn', kw: 'play player run test preview novel game playthrough играть плеер проиграть пройти тест новелла игра', run: () => openPlayer() });
const PL_ENDINGS = {};                              // открытые концовки по названию проекта: живут, пока открыта программа
const PL_DEF = { locked: true, speed: 1, mute: false, panel: false, tab: 'vars' };
const plPS = () => { if (!S.play || typeof S.play !== 'object') S.play = {}; for (const k in PL_DEF) if (S.play[k] === undefined) S.play[k] = PL_DEF[k]; return S.play; };
const PL_CPS = [0, 55, 110];                       // знаков в секунду: мгновенно / обычно / быстро (0 = сразу)
let PLAY = null;

/** Каким цветом рисовать выделение маркером (теги {hl=...}). */
const PL_HL = { yellow: '#ffe066', green: '#8ce99a', blue: '#74c0fc', pink: '#faa2c1', orange: '#ffa94d', purple: '#d0bfff', red: '#ff8787', gray: '#ced4da' };

async function openPlayer(opts) {
  opts = opts || {};
  closePopover();
  if (PLAY && !PLAY.m.closed) { if (opts.fromNode) plStartNode(PLAY, opts.fromNode); return; }
  flushHistory();
  const st = PLAY = { opts, urls: new Map(), binMap: new Map(), ev: null, typing: null, timers: new Set(), auto: false, skip: false, layerEls: new Map(), layerSig: '', mus: null, musFile: '', sfx: [], read: 0, prevVars: {}, gen: 0 };
  st.m = openModal({
    cls: 'play-m', dismiss: false,
    onClose: () => { lgFinish(st); plCleanup(st); if (PLAY === st) PLAY = null; },
    build: m => plBuild(st, m)
  });
  const key = e => plKey(st, e);
  document.addEventListener('keydown', key, true);
  st.unkey = () => document.removeEventListener('keydown', key, true);
  await plCompile(st);
}

function plCleanup(st) {
  st.dead = true;
  if (st.unkey) st.unkey();
  plClearTimers(st);
  if (st.mus) { try { st.mus.pause(); } catch (e) { /* нечего останавливать */ } st.mus = null; }
  st.sfx.forEach(a => { try { a.pause(); } catch (e) { /* нечего останавливать */ } });
}
function plClearTimers(st) { for (const x of st.timers) { clearTimeout(x); clearInterval(x); } st.timers.clear(); st.typing = null; }
function plTimer(st, fn, ms) { const id = setTimeout(() => { st.timers.delete(id); fn(); }, ms); st.timers.add(id); return id; }

/* ---------- сборка и запуск ---------- */
async function plCompile(st) {
  let R;
  try {
    const blobs = await availableBlobs();
    R = compileProject({ mode: 'split', includeDocs: false, includeSource: false, includeUnreachable: true }, blobs);
  } catch (e) { return plFatal(st, t('pl.err', e && e.message || e)); }
  if (st.dead) return;
  if (!R.files.length || !R.start) return plFatal(st, t('pl.empty'));
  st.R = R;
  R.bin.forEach(b => st.binMap.set(b.path, b.bid));
  st.byLabel = new Map();
  for (const b of R.blockLabels || []) { st.byLabel.set(b.label, { b, f: null }); for (const f of b.files) st.byLabel.set(f.label, { b, f }); }
  const files = R.files.filter(f => /\.rpy$/.test(f.path) && !/^game\/tl\//.test(f.path));
  try { st.prog = plParseScript(files); } catch (e) { return plFatal(st, t('pl.err', e && e.message || e)); }
  const pk = P.name || 'project';
  st.persist = PL_ENDINGS[pk] || (PL_ENDINGS[pk] = new Set());
  st.g = new PlGame(st.prog, { endings: R.endingsData, persist: st.persist });
  st.g.onLabel = lbl => lgLabel(st, lbl);
  st.prog.warns.forEach(w => st.g.warn(w));
  st.body.classList.remove('busy');
  const fromNode = st.opts.fromNode;
  if (fromNode) plStartNode(st, fromNode); else plRestart(st);
}
function plFatal(st, text) {
  if (st.dead) return;
  st.body.classList.remove('busy');
  st.stage.replaceChildren(h('div', { class: 'pl-fatal' }, icon('alert', 22), h('div', text)));
}
function plRestart(st) { lgBegin(st); plClearTimers(st); st.read = 0; st.layerSig = ''; st.layerEls.clear(); st.scene.replaceChildren(st.fade); st.prevVars = {}; plShow(st, st.g.begin('start')); }
function plStartNode(st, nid) {
  const b = (st.R.blockLabels || []).find(x => x.id === nid);
  if (!b) { toast(t('pl.nodef', (nodeById(nid) || {}).title || '?'), 4200); return; }
  plStartLabel(st, b.label, b.title);
}
function plStartLabel(st, label, title) {
  lgBegin(st); plClearTimers(st); st.read = 0; st.layerSig = ''; st.layerEls.clear(); st.scene.replaceChildren(st.fade); st.prevVars = {};
  if (title) toast(t('pl.start.at', title), 2200);
  plShow(st, st.g.begin(label));
}

/* ---------- окно ---------- */
function plBuild(st, m) {
  const ps = plPS();
  st.tabsEl = h('div', { class: 'pl-tabs' });
  st.sideBody = h('div', { class: 'pl-sbody' });
  st.side = h('div', { class: 'pl-side' + (ps.panel ? ' on' : '') }, st.tabsEl, st.sideBody);
  st.fade = h('div', { class: 'pl-fadeov' });
  st.scene = h('div', { class: 'pl-scene' }, st.fade);
  st.nameEl = h('div', { class: 'pl-name' });
  st.textEl = h('div', { class: 'pl-text' });
  st.box = h('div', { class: 'pl-box', hidden: true }, st.nameEl, st.textEl, h('div', { class: 'pl-more' }, icon('down', 14)));
  st.menuEl = h('div', { class: 'pl-menu', hidden: true });
  st.centerEl = h('div', { class: 'pl-center', hidden: true });
  st.noteEl = h('div', { class: 'pl-note' });
  st.endEl = h('div', { class: 'pl-end', hidden: true });
  st.stage = h('div', { class: 'pl-stage' }, st.scene, st.centerEl, st.menuEl, st.box, st.noteEl, st.endEl);
  st.stage.addEventListener('click', e => { if (e.target.closest('.pl-menu button, .pl-end button')) return; plNext(st); });
  const tb = (ic, tip, fn, id) => h('button', { class: 'btn icon', 'data-tip': tip, id, onclick: ev => { ev.stopPropagation(); fn(ev.currentTarget); } }, icon(ic, 17));
  st.btnBack = tb('undo', t('pl.back'), () => plBack(st), 'pl-back');
  st.btnAuto = tb('play', t('pl.auto'), () => plToggle(st, 'auto'), 'pl-auto');
  st.btnSkip = tb('redo', t('pl.skip'), () => plToggle(st, 'skip'), 'pl-skip');
  st.btnSound = tb(ps.mute ? 'stop' : 'volume', t('pl.sound'), () => { ps.mute = !ps.mute; saveSettings(); plMusicVol(st); plBtns(st); }, 'pl-sound');
  const bar = h('div', { class: 'pl-bar' }, st.btnBack, st.btnAuto, st.btnSkip, st.btnSound,
    tb('refresh', t('pl.restart'), () => plRestart(st), 'pl-restart'),
    tb('list', t('pl.panel'), () => plPanel(st), 'pl-panelbtn'));
  st.where = h('div', { class: 'pl-where' });
  st.openBtn = h('button', { class: 'btn icon', 'data-tip': t('pl.open'), id: 'pl-openblock', hidden: true, onclick: () => { if (st.cur) openNodeModal(st.cur.nid, st.cur.fid); } }, icon('open', 16));
  const fromBtn = h('button', { class: 'btn', id: 'pl-from', 'data-tip': t('pl.from.tip'), onclick: ev => plFromMenu(st, ev.currentTarget) }, icon('target', 15), h('span', t('pl.from')));
  const head = h('div', { class: 'm-head pl-head' }, h('div', { class: 'm-title' }, icon('play', 16), t('pl.title')), st.where, st.openBtn, h('div', { class: 'grow' }), fromBtn,
    h('button', { class: 'btn icon', 'data-tip': t('c.close') + ' (Esc)', onclick: () => m.close() }, icon('x', 18)));
  st.body = h('div', { class: 'pl busy' }, head, h('div', { class: 'pl-main' }, h('div', { class: 'pl-center-col' }, h('div', { class: 'pl-stagewrap' }, st.stage), bar), st.side));
  st.body.prepend(h('div', { class: 'pl-busy' }, h('span', { class: 'spin' }), t('pl.building')));
  plTabs(st);
  return st.body;
}
function plBtns(st) {
  const ps = plPS();
  st.btnAuto.classList.toggle('on', st.auto); st.btnSkip.classList.toggle('on', st.skip);
  st.btnBack.disabled = !(st.g && st.g.canBack);
  st.btnSound.replaceChildren(icon(ps.mute ? 'stop' : 'volume', 17)); st.btnSound.classList.toggle('on', !ps.mute);
}
function plToggle(st, what) {
  if (what === 'auto') { st.auto = !st.auto; if (st.auto) st.skip = false; } else { st.skip = !st.skip; if (st.skip) st.auto = false; }
  plBtns(st);
  if (st.ev && st.ev.type === 'say' && !st.typing) plSchedule(st);
}
function plPanel(st, on) {
  const ps = plPS(); ps.panel = on === undefined ? !ps.panel : !!on; saveSettings();
  st.side.classList.toggle('on', ps.panel);
  if (ps.panel) plSide(st);
}
function plFromMenu(st, anchor) {
  if (!st.R) return;
  const items = (st.R.blockLabels || []).map(b => ({ label: String(b.idx + 1).padStart(2, '0') + '  ' + b.title + (b.reach ? '' : ' ·'), icon: TYPE_ICON[b.type] || 'dot', onClick: () => plStartLabel(st, b.label, b.title) }));
  if (items.length) menuAt(anchor, items);
}
function plKey(st, e) {
  if (st.m.closed || MODALS[MODALS.length - 1] !== st.m) return;
  if (e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (k === ' ' || k === 'Enter' || k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); plNext(st); }
  else if (k === 'ArrowLeft' || k === 'Backspace' || k === 'PageUp' || k === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); plBack(st); }
  else if (k === 'a' || k === 'A' || k === 'ф' || k === 'Ф') { plToggle(st, 'auto'); }
  else if (k === 's' || k === 'S' || k === 'ы' || k === 'Ы') { plToggle(st, 'skip'); }
  else if (k === 'h' || k === 'H' || k === 'р' || k === 'Р') { plPanel(st); }
}

/* ---------- ход игры ---------- */
function plNext(st) {
  if (!st.g || !st.ev) return;
  const ev = st.ev;
  if (ev.type === 'say') {
    if (st.typing) { plFinishTyping(st); return; }
    plClearTimers(st); plShow(st, st.g.advance());
  } else if (ev.type === 'pause') { plClearTimers(st); plShow(st, st.g.advance()); }
}
function plBack(st) {
  if (!st.g || !st.g.canBack) return;
  plClearTimers(st); st.skip = false; st.auto = false;
  st.layerSig = '';
  st.noLog = true; let ev; try { ev = st.g.back(); } finally { st.noLog = false; } if (ev) plShow(st, ev, true);
}
function plChoose(st, idx) { const it = st.ev && st.ev.items && st.ev.items.find(x => x.idx === idx); if (it) lgPick(st, it.text); plClearTimers(st); st.skip = false; plShow(st, st.g.choose(idx)); }
function plShow(st, ev, silent) {
  if (st.dead || !ev) return;
  st.ev = ev;
  plSync(st, ev);
  plWhere(st, ev.label);
  for (const n of ev.notices || []) {
    if (n.type === 'ending') { lgEnding(st, n.key, n.text); plNote(st, t('pl.ending.got', n.text)); } else if (n.type === 'notify') plNote(st, n.text);
  }
  st.box.hidden = true; st.menuEl.hidden = true; st.centerEl.hidden = true; st.endEl.hidden = true;
  st.menuEl.replaceChildren(); st.stage.classList.remove('over');
  if (ev.type === 'say') plSay(st, ev, silent);
  else if (ev.type === 'menu') plMenu(st, ev);
  else if (ev.type === 'pause') {
    if (ev.secs != null) plTimer(st, () => { if (st.ev === ev) plShow(st, st.g.advance()); }, Math.max(0, ev.secs) * (st.skip ? 20 : 1000));
    else if (st.skip) plTimer(st, () => { if (st.ev === ev) plShow(st, st.g.advance()); }, 60);
  } else plEnd(st, ev);
  plBtns(st);
  plSide(st);
}
function plSay(st, ev, silent) {
  st.read++;
  const centered = ev.centered;
  const box = centered ? st.centerEl : st.box;
  box.hidden = false;
  st.stage.classList.toggle('centered', centered);
  if (!centered) {
    st.nameEl.hidden = !ev.who;
    st.nameEl.textContent = ev.who || ''; st.nameEl.style.color = ev.color || '';
  }
  const target = centered ? st.centerEl : st.textEl;
  if (!centered) { st.centerEl.hidden = true; }
  const tx = plBuildText(ev.rich, ev.whatColor);
  target.replaceChildren(tx.root);
  st.typing = null;
  const cps = PL_CPS[plPS().speed === undefined ? 1 : plPS().speed] ?? 55;
  if (st.skip || !cps || silent) { tx.reveal(tx.total); plSchedule(st); return; }
  let shown = 0, last = performance.now();
  const id = setInterval(() => {
    const now = performance.now(); shown += (now - last) / 1000 * cps; last = now;
    if (shown >= tx.total) { plFinishTyping(st); return; }
    tx.reveal(Math.floor(shown));
  }, 16);
  st.timers.add(id);
  st.typing = { id, tx };
}
function plFinishTyping(st) {
  if (!st.typing) return;
  clearInterval(st.typing.id); st.timers.delete(st.typing.id);
  st.typing.tx.reveal(st.typing.tx.total); st.typing = null;
  plSchedule(st);
}
/** Что делать после того, как реплика показана целиком: авто-листание, пропуск, {nw}. */
function plSchedule(st) {
  const ev = st.ev; if (!ev || ev.type !== 'say') return;
  const go = () => { if (st.ev === ev && !st.typing) plShow(st, st.g.advance()); };
  if (st.skip) plTimer(st, go, 55);
  else if (ev.noWait) plTimer(st, go, 250);
  else if (st.auto) plTimer(st, go, Math.min(7000, 1000 + ev.text.length * 38));
}
function plMenu(st, ev) {
  st.skip = false; plBtns(st);
  const ps = plPS();
  if (ev.prompt) {
    st.box.hidden = false; st.nameEl.hidden = !ev.prompt.who; st.nameEl.textContent = ev.prompt.who || ''; st.nameEl.style.color = ev.prompt.color || '';
    const tx = plBuildText(ev.prompt.rich); st.textEl.replaceChildren(tx.root); tx.reveal(tx.total);
  }
  st.menuEl.hidden = false;
  for (const it of ev.items) {
    if (it.ok) {
      const b = h('button', { class: 'pl-choice', onclick: () => plChoose(st, it.idx) });
      b.append(plBuildText(it.rich).fill());
      st.menuEl.append(b);
    } else if (ps.locked) {
      const b = h('button', { class: 'pl-choice locked', disabled: true, 'data-tip': t('pl.locked.tip', it.cond || '?') }, icon('lock', 14));
      b.append(h('span', { class: 'pl-lk' }, plBuildText(it.rich).fill()), h('span', { class: 'pl-lkn' }, t('pl.locked')));
      st.menuEl.append(b);
    }
  }
  st.stage.classList.add('over');
}
function plEnd(st, ev) {
  if (ev.type === 'end') lgFinish(st, true);
  st.skip = false; st.auto = false;
  st.endEl.hidden = false; st.stage.classList.add('over');
  const total = (st.R.endingsData && st.R.endingsData.list.length) || 0;
  const err = ev.type === 'error';
  st.endEl.replaceChildren(
    h('div', { class: 'pl-end-t' }, err ? t('pl.end.err') : t('pl.end')),
    err ? h('div', { class: 'pl-end-s err' }, ev.text) : h('div', { class: 'pl-end-s' }, t('pl.end.sub', st.read)),
    total ? h('div', { class: 'pl-end-s' }, t('pl.endings', st.persist.size, total)) : null,
    h('div', { class: 'pl-end-a' },
      h('button', { class: 'btn primary', onclick: () => plRestart(st) }, icon('refresh', 16), t('pl.again')),
      h('button', { class: 'btn', onclick: ev2 => plFromMenu(st, ev2.currentTarget) }, icon('target', 16), t('pl.from')),
      h('button', { class: 'btn', onclick: () => st.m.close() }, t('pl.close'))));
}
function plNote(st, text) {
  st.noteEl.textContent = text; st.noteEl.classList.remove('on'); void st.noteEl.offsetWidth; st.noteEl.classList.add('on');
}
function plWhere(st, label) {
  const hit = st.byLabel && label ? st.byLabel.get(label) : null;
  if (!hit) return;
  st.cur = { nid: hit.b.id, fid: hit.f ? hit.f.id : undefined };
  st.where.textContent = hit.f && hit.f.title ? t('pl.where.f', hit.b.title, hit.f.title) : t('pl.where', hit.b.title);
  st.openBtn.hidden = false;
}

/* ---------- текст ---------- */
/** Части текста → DOM; reveal(n) показывает первые n знаков (для «печати»). */
function plBuildText(rich, defColor) {
  const root = h('span', { class: 'pl-t' }); const parts = []; let total = 0;
  for (const sg of rich) {
    if (sg.br) { root.append(h('br')); continue; }
    const sp = h('span');
    const css = [];
    if (sg.b) css.push('font-weight:700'); if (sg.i) css.push('font-style:italic');
    const dec = [sg.u ? 'underline' : '', sg.s ? 'line-through' : ''].filter(Boolean).join(' '); if (dec) css.push('text-decoration:' + dec);
    const col = sg.color || defColor; if (col && /^[#\w(),.% -]+$/.test(col)) css.push('color:' + col);
    if (sg.size) { const n = parseFloat(sg.size); if (Number.isFinite(n)) css.push('font-size:' + (/^[+-]/.test(sg.size) ? 'calc(1em + ' + n + 'px)' : Math.max(0.5, Math.min(3, n / 22)) + 'em')); }
    if (sg.hl) { css.push('background:' + (PL_HL[sg.hl] || PL_HL.yellow) + ';color:#111;border-radius:3px;padding:0 2px'); }
    if (css.length) sp.setAttribute('style', css.join(';'));
    parts.push({ sp, text: sg.t, from: total }); total += sg.t.length; root.append(sp);
  }
  const reveal = n => { for (const p of parts) p.sp.textContent = p.text.slice(0, Math.max(0, Math.min(p.text.length, n - p.from))); };
  return { root, total, reveal, fill() { reveal(total); return root; } };
}

/* ---------- картинки и звук ---------- */
function plBinFor(st, path) { return st.binMap.get('game/' + path) || st.binMap.get(path) || null; }
function plUrl(st, path) {
  if (st.urls.has(path)) return st.urls.get(path);
  const bid = plBinFor(st, path);
  const p = bid ? blobUrl(bid).catch(() => null) : Promise.resolve(null);
  st.urls.set(path, p); return p;
}
function plIsBg(def, layer) {
  if (layer.scene) return true;
  if (def.kind === 'solid') return true;
  if (def.kind === 'ph') return def.sprite === false || (def.sprite == null && /^bg\b/i.test(def.name || ''));
  return /(^|\/)bg\b|\/bg\//i.test(def.path || '') || /^bg\b/i.test(def.name || '');
}
function plLayerEl(st, layer) {
  const def = st.g.images.get(layer.key) || { kind: 'ph', label: layer.key, name: layer.key };
  const bg = plIsBg(def, layer);
  const el = h('div', { class: bg ? 'pl-bg' : 'pl-sp' });
  const label = (txt, col) => h('div', { class: 'pl-ph', style: { background: col || plPhColor(layer.key) } }, h('span', txt));
  if (def.kind === 'solid') el.style.background = def.color || '#000';
  else if (def.kind === 'ph') el.append(label(def.label || layer.key, def.color || plPhColor(layer.key)));
  else {
    const img = h('img', { alt: '', draggable: 'false' }); el.append(img);
    plUrl(st, def.path).then(u => { if (u) img.src = u; else { img.remove(); el.append(label(def.path.split('/').pop() + ' · ' + t('as.f.lost'), plPhColor(layer.key))); } });
  }
  return { el, bg };
}
const PL_X = { left: 22, center: 50, right: 78, truecenter: 50, leftish: 32, rightish: 68, topleft: 22, topright: 78, offscreenleft: -25, offscreenright: 125 };
function plSync(st, ev) {
  const g = st.g, d = g.disp;
  const sig = JSON.stringify(d.layers);
  if (sig !== st.layerSig) {
    st.layerSig = sig;
    const keep = new Map();
    const trans = ev.trans && ev.trans !== 'None';
    d.layers.forEach((L, i) => {
      const id = L.tag + '|' + L.key;
      let rec = st.layerEls.get(id);
      if (!rec) { rec = plLayerEl(st, L); rec.fresh = true; }
      rec.el.style.zIndex = String(i + 1);
      if (!rec.bg) rec.el.style.left = (PL_X[L.at] != null ? PL_X[L.at] : 50) + '%';
      keep.set(id, rec);
    });
    for (const [id, rec] of st.layerEls) if (!keep.has(id)) rec.el.remove();
    for (const [id, rec] of keep) {
      if (!rec.el.isConnected) { st.scene.insertBefore(rec.el, st.fade); if (trans && rec.fresh) { rec.el.classList.add('in'); } }
      rec.fresh = false;
    }
    st.layerEls = keep;
    if (trans && /fade/i.test(ev.trans)) { st.fade.classList.remove('go'); void st.fade.offsetWidth; st.fade.classList.add('go'); }
  }
  plMusic(st, d.music);
  for (const f of ev.fx || []) plSfx(st, f);
}
function plMusicVol(st) { if (st.mus) st.mus.volume = plPS().mute ? 0 : 0.7; }
async function plMusic(st, mus) {
  const file = mus ? mus.file : '';
  if (file === st.musFile) return;
  st.musFile = file;
  if (st.mus) { try { st.mus.pause(); } catch (e) { /* уже остановлена */ } st.mus = null; }
  if (!file) return;
  const u = await plUrl(st, file);
  if (!u || st.dead || st.musFile !== file) return;
  const a = new Audio(u); a.loop = !mus || mus.loop !== false; a.volume = plPS().mute ? 0 : 0.7; st.mus = a;
  a.play().catch(() => { /* браузер ждёт щелчка: музыка включится со следующего перехода */ });
}
async function plSfx(st, f) {
  const u = await plUrl(st, f.file); if (!u || st.dead || plPS().mute) return;
  const a = new Audio(u); a.volume = 0.8; st.sfx.push(a); a.onended = () => { st.sfx = st.sfx.filter(x => x !== a); };
  a.play().catch(() => { /* нет разрешения на звук */ });
}

/* ---------- боковая панель ---------- */
const PL_TABS = ['vars', 'hist', 'warn'];
function plTabs(st) {
  const ps = plPS();
  st.tabsEl.replaceChildren(...PL_TABS.map(k => h('button', { class: 'pl-tab' + (ps.tab === k ? ' on' : ''), 'data-k': k, onclick: () => { ps.tab = k; saveSettings(); plTabs(st); plSide(st); } },
    t('pl.tab.' + k), k === 'warn' && st.g && st.g.warns.length ? h('span', { class: 'pl-cnt' }, st.g.warns.length) : null)));
}
function plSide(st) {
  if (!st.g) return;
  plTabs(st);
  if (!st.side.classList.contains('on')) return;
  const ps = plPS(), g = st.g, body = st.sideBody;
  const keepScroll = body.scrollTop;
  body.replaceChildren();
  if (ps.tab === 'vars') {
    const vs = g.userVars();
    body.append(h('div', { class: 'hint' }, t('pl.var.hint')));
    if (!vs.length) body.append(h('div', { class: 'empty' }, t('pl.novars')));
    const tbl = h('div', { class: 'pl-vars' });
    for (const [k, v] of vs) {
      const changed = Object.prototype.hasOwnProperty.call(st.prevVars, k) ? !plSame(st.prevVars[k], v) : false;
      tbl.append(h('div', { class: 'pl-var' + (changed ? ' chg' : '') }, h('span', { class: 'pl-vk' }, k),
        h('button', { class: 'pl-vv', onclick: () => plEditVar(st, k) }, plRepr(v))));
    }
    body.append(tbl);
    st.prevVars = plClone(g.vars);
    const total = (st.R.endingsData && st.R.endingsData.list.length) || 0;
    body.append(h('div', { class: 'pl-sec' }, total ? t('pl.endings', st.persist.size, total) : ''),
      total ? h('button', { class: 'btn', onclick: () => { st.persist.clear(); toast(t('pl.endings.reset.done'), 1800); plSide(st); } }, t('pl.endings.reset')) : null,
      h('label', { class: 'pl-opt' }, h('input', { type: 'checkbox', checked: ps.locked, onchange: ev => { ps.locked = ev.target.checked; saveSettings(); if (st.ev && st.ev.type === 'menu') plShow(st, st.ev, true); } }), t('pl.opt.locked')));
  } else if (ps.tab === 'hist') {
    const items = g.log.slice(-200);
    if (!items.length) body.append(h('div', { class: 'empty' }, t('pl.nolog')));
    for (const x of items) body.append(h('div', { class: 'pl-h' + (x.choice ? ' ch' : '') },
      x.choice ? h('span', { class: 'pl-hw' }, '▸') : x.who ? h('b', { style: { color: x.color || '' } }, x.who + ': ') : null, x.text));
    body.scrollTop = body.scrollHeight; return;
  } else {
    if (!g.warns.length) body.append(h('div', { class: 'empty' }, t('pl.nowarn')));
    for (const w of g.warns) body.append(h('div', { class: 'pl-w' }, icon('alert', 13), h('span', w)));
  }
  body.scrollTop = keepScroll;
}
const plSame = (a, b) => plStr(a) === plStr(b) && typeof a === typeof b;
async function plEditVar(st, name) {
  const g = st.g;
  const v = await promptDlg({ title: t('pl.var.edit', name), value: plRepr(g.vars[name]), empty: false });
  if (v == null) return;
  let val;
  try { val = plEval(plParseExpr(v), g); } catch (e) { toast(t('pl.var.bad', e && e.message || e), 3500); return; }
  g.vars[name] = val;
  const top = g.hist[g.hist.length - 1]; if (top) top.vars[name] = plClone(val);
  /* реплика или выбор считаются заново с новым значением */
  if (st.ev && (st.ev.type === 'say' || st.ev.type === 'menu') && top) { plClearTimers(st); g.hist.pop(); g.restore(top); g.vars[name] = val; plShow(st, g.run(), true); }
  else plSide(st);
}

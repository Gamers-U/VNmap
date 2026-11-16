'use strict';
/* ====== Режимы интерфейса и окно «Настройки» ======
   «Простой» (по умолчанию) показывает только самое нужное: Карта, Текст, Играть, Реестр, Сборка, а остальное в меню «Ещё».
   «Профессиональный» показывает всё, и там можно выключать целые модули, которыми вы не пользуетесь.
   Режим личный: он хранится в настройках программы на этом компьютере, в проект не попадает.
   Не путать с корпоративным режимом прав доступа: тот относится к проекту (Участники → Права доступа). */

Object.assign(D, {
  'ui.settings': ['Настройки', 'Settings'],
  'ui.tab.view': ['Вид и режим', 'Look and mode'], 'ui.tab.conn': ['Подключения', 'Connections'], 'ui.tab.mods': ['Модули', 'Modules'],
  'ui.mode': ['Режим интерфейса', 'Interface mode'],
  'ui.mode.simple': ['Простой', 'Simple'], 'ui.mode.pro': ['Профессиональный', 'Professional'],
  'ui.mode.simple.h': ['На панели самое нужное: Текст, Играть, Реестр, Сборка. Остальные возможности собраны в коротком меню «Ещё», редкие скрыты.', 'The toolbar has only what matters: Text, Play, Registry, Build. Other features sit in the short “More” menu, rare ones are hidden.'],
  'ui.mode.pro.h': ['Все кнопки и меню на виду: статистика, команда, перевод, совместная работа, анализ. Ненужные модули можно выключить на вкладке «Модули».', 'All buttons and menus are in view: statistics, team, translation, collaboration, analysis. You can switch off unneeded modules on the “Modules” tab.'],
  'ui.mode.note': ['Режим интерфейса личный и не меняет проект. Корпоративный режим прав доступа это другое: он относится к проекту (Участники → Права доступа).', 'The interface mode is personal and does not change the project. The corporate access-rights mode is a different thing: it belongs to the project (Members → Access rights).'],
  'ui.mode.first': ['Включён простой режим: на панели самое нужное. Все функции: Настройки → Профессиональный.', 'Simple mode is on: the toolbar has only what matters. For everything: Settings → Professional.'],
  'ui.look': ['Оформление', 'Appearance'], 'ui.theme': ['Тема', 'Theme'], 'ui.theme.dark': ['Тёмная', 'Dark'], 'ui.theme.light': ['Светлая', 'Light'], 'ui.lang': ['Язык интерфейса', 'Interface language'],
  'ui.mapset': ['Карта', 'Map'], 'ui.project': ['Проект', 'Project'],
  'ui.more': ['Ещё', 'More'], 'ui.more.tip': ['Остальные возможности: расстановка, проверки, импорт, тесты', 'More features: arranging, checks, import, tests'],
  'ui.build': ['Сборка', 'Build'], 'ui.build.tip': ['Собрать игру для Ren\'Py', 'Build the game for Ren\'Py'],
  'ui.file': ['Файл', 'File'], 'ui.file.tip': ['Сохранить проект, открыть, сохранить карту: SVG, PDF', 'Save the project, open one, save the map: SVG, PDF'],
  'ui.conn.h': ['Подключения', 'Connections'],
  'ui.conn.p': ['Всё, что связывает программу с внешним миром, собрано здесь.', 'Everything that connects the app to the outside world is collected here.'],
  'ui.gh': ['GitHub', 'GitHub'], 'ui.gh.on': ['Проект подключён: {0}', 'Project linked: {0}'], 'ui.gh.in': ['Вы вошли как {0}, проект не подключён', 'Signed in as {0}, project not linked'], 'ui.gh.off': ['Вход не выполнен', 'Not signed in'],
  'ui.gh.panel': ['Панель GitHub', 'GitHub panel'], 'ui.gh.open': ['Открыть проект с GitHub…', 'Open a project from GitHub…'],
  'ui.drive': ['Google Диск', 'Google Drive'], 'ui.drive.btn': ['Панель Диска', 'Drive panel'],
  'ui.notify': ['Уведомления', 'Notifications'], 'ui.notify.t': ['Telegram и Discord: сводка при закрытии проекта и напоминания о сроках.', 'Telegram and Discord: a summary when the project closes and deadline reminders.'], 'ui.notify.btn': ['Настроить', 'Set up'],
  'ui.collab': ['Совместная работа', 'Collaboration'], 'ui.collab.t': ['Работать над проектом вместе в реальном времени.', 'Work on the project together in real time.'], 'ui.collab.btn': ['Открыть панель', 'Open the panel'],
  'ui.mods.h': ['Модули', 'Modules'],
  'ui.mods.p': ['Выключенный модуль прячет свои кнопки и пункты меню. Сами данные проекта не трогаются, вернуть модуль можно в любой момент.', 'A switched-off module hides its buttons and menu items. The project data is untouched and you can bring a module back at any time.'],
  'ui.mods.only': ['Модули настраиваются в профессиональном режиме.', 'Modules are configured in the professional mode.'],
  'ui.mod.analysis': ['Анализ и статистика', 'Analysis and statistics'], 'ui.mod.analysis.h': ['Статистика, ветки и время, автопрогон, журнал прохождений, переменные в блоках.', 'Statistics, branches and time, auto-run, playthrough log, variables in blocks.'],
  'ui.mod.text': ['Тонкая работа с текстом', 'Fine text work'], 'ui.mod.text.h': ['Таблица реплик, переименование везде, страница персонажа, список ресурсов, импорт .rpy.', 'The replica table, rename everywhere, the character page, the resource list, .rpy import.'],
  'ui.mod.team': ['Команда', 'Team'], 'ui.mod.team.h': ['Участники, задачи и сроки, «кто что сделал», уведомления, выбор «кто я».', 'Members, tasks and deadlines, “who did what”, notifications, “who am I”.'],
  'ui.mod.collab': ['Совместная работа', 'Collaboration'], 'ui.mod.collab.h': ['Работа в реальном времени, проверка правок авторов.', 'Real-time work, review of the authors\' changes.'],
  'ui.mod.translate': ['Переводы', 'Translations'], 'ui.mod.translate.h': ['Языки игры: перевод реплик и озвучка на каждом языке.', 'Game languages: dialogue translation and voice per language.'],
});

const UI_MODS = ['analysis', 'text', 'team', 'collab', 'translate'];
/* Что в каком режиме видно: 's' — в обоих режимах, 'p' — только в профессиональном (и пока модуль не выключен), 'x' — живёт в других местах (Настройки).
   Идентификаторы совпадают с пунктами меню «Инструменты» (TOOL_ITEMS) и с кнопками верхней панели. Незнакомое видно всегда. */
const UI_LVL = {
  layout: ['s'], mappdf: ['s'], notes: ['s'], texted: ['s'], docimport: ['s'], digest: ['s'], checks: ['s'], missingfiles: ['s'], htmlgame: ['s'], renpy: ['s'], player: ['s'], stats: ['s'],
  replicas: ['p', 'text'], rename: ['p', 'text'], charpage: ['p', 'text'], resources: ['p', 'text'], rpyimport: ['p', 'text'],
  varstates: ['p', 'analysis'], branchstats: ['p', 'analysis'], autorun: ['p', 'analysis'], testlog: ['p', 'analysis'],
  whoami: ['p', 'team'], tasks: ['p', 'team'], whodid: ['p', 'team'], notify: ['p', 'team'], review: ['p', 'collab'],
  ghopen: ['x'],
  'bar.stats': ['p', 'analysis'], 'bar.team': ['p', 'team'], 'bar.translate': ['p', 'translate'], 'bar.collab': ['p', 'collab'], 'bar.theme': ['p'], 'bar.lang': ['p'], 'bar.layers': ['p'],
};
function uiCfg() {
  const c = S.ui && typeof S.ui === 'object' ? S.ui : (S.ui = {});
  if (c.mode !== 'pro') c.mode = 'simple';
  if (!c.off || typeof c.off !== 'object') c.off = {};
  return c;
}
const uiPro = () => uiCfg().mode === 'pro';
/** Показывать ли возможность (id пункта меню «Инструменты» или кнопки панели «bar.…»). */
function uiShow(id) {
  const d = UI_LVL[id]; if (!d) return true;
  if (d[0] === 'x') return false;
  if (!uiPro()) return d[0] === 's';
  return !(d[1] && uiCfg().off[d[1]]);
}
function uiSetMode(m) {
  const c = uiCfg(); m = m === 'pro' ? 'pro' : 'simple'; if (c.mode === m) return;
  c.mode = m; saveSettings();
  closePopover(); buildChrome(); updateStatus();
}
function uiSetMod(id, on) {
  const c = uiCfg(); if (on) delete c.off[id]; else c.off[id] = true;
  saveSettings(); buildChrome();
}
/** Один раз сказать, что включён простой режим (чтобы не удивляться короткой панели). */
function uiFirstNotice() {
  const c = uiCfg();
  if (c.seen) return;
  c.seen = true; saveSettings();
  setTimeout(() => toast(t('ui.mode.first'), 9000), 1500);
}

/* ---------- окно «Настройки» ---------- */
function openSettingsWindow(tab) {
  closePopover();
  const st = { tab: tab || 'view' };
  openModal({
    cls: 'set-modal',
    build: m => {
      st.m = m; st.body = h('div', { class: 'set-body' });
      const render = () => {
        const tabs = [{ value: 'view', label: t('ui.tab.view') }, { value: 'conn', label: t('ui.tab.conn') }];
        if (uiPro()) tabs.push({ value: 'mods', label: t('ui.tab.mods') });
        if (!tabs.some(x => x.value === st.tab)) st.tab = 'view';
        st.body.replaceChildren(segmented(tabs, st.tab, v => { st.tab = v; render(); }), h('div', { class: 'set-pane' }, st.tab === 'view' ? setView(st, render) : st.tab === 'conn' ? setConn(st) : setMods(st, render)));
      };
      st.render = render; render();
      return h('div', { class: 'm-wrap' }, modalHead(t('ui.settings'), m), st.body);
    },
  });
}
const setCard = (title, ...kids) => h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, title), ...kids);
function setView(st, render) {
  const c = uiCfg(), box = h('div', { class: 'nt-list' });
  box.append(setCard(t('ui.mode'),
    segmented([{ value: 'simple', label: t('ui.mode.simple') }, { value: 'pro', label: t('ui.mode.pro') }], c.mode, v => { uiSetMode(v); render(); }),
    h('div', { class: 'hint' }, t(c.mode === 'pro' ? 'ui.mode.pro.h' : 'ui.mode.simple.h')),
    h('div', { class: 'hint' }, t('ui.mode.note'))));
  const fxs = transitionNames();
  const sel = h('select', { class: 'inp sm', id: 'set-trans' }, h('option', { value: '' }, t('tr.none')), ...fxs.map(n => h('option', { value: n, selected: n === S.transition }, n)));
  sel.addEventListener('change', () => { S.transition = sel.value; saveSettings(); });
  box.append(setCard(t('ui.look'),
    field(t('ui.theme'), segmented([{ value: 'dark', label: t('ui.theme.dark') }, { value: 'light', label: t('ui.theme.light') }], S.theme, v => { if (v !== S.theme) toggleTheme(); })),
    field(t('ui.lang'), segmented([{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }], S.lang, v => { if (v === S.lang) return; setLang(v); setTimeout(() => openSettingsWindow(st.tab), 60); }))));
  box.append(setCard(t('ui.mapset'),
    field(t('set.grid'), segmented([{ value: 'dots', label: t('set.grid.dots') }, { value: 'lines', label: t('set.grid.lines') }, { value: 'off', label: t('set.grid.off') }], S.grid, v => { S.grid = v; saveSettings(); applyGrid(); })),
    switchEl(S.snap, v => { S.snap = v; saveSettings(); }, t('set.snap')),
    field(t('set.wheel'), segmented([{ value: 'zoom', label: t('set.wheel.zoom') }, { value: 'pan', label: t('set.wheel.pan') }], S.wheel, v => { S.wheel = v; saveSettings(); }), t('set.wheel.hint')),
    field(t('set.trans'), sel, t('set.trans.hint'))));
  box.append(setCard(t('ui.project'), h('div', { class: 'nt-btns' },
    h('button', { class: 'btn', onclick: () => { st.m.close(); newProject(false); } }, icon('new', 16), t('proj.new')),
    h('button', { class: 'btn', onclick: () => { st.m.close(); newProject(true); } }, icon('book', 16), t('proj.demo')))));
  return box;
}
function setConn(st) {
  const box = h('div', { class: 'nt-list' }), go = fn => () => { st.m.close(); setTimeout(fn, 0); };
  box.append(h('div', { class: 'hint' }, t('ui.conn.p')));
  const m = typeof gmeta === 'function' ? gmeta() : null, login = typeof GHS !== 'undefined' && GHS.st && GHS.st.login;
  const ghState = m && m.on ? t('ui.gh.on', m.repo || '') : login ? t('ui.gh.in', login) : t('ui.gh.off');
  box.append(setCard(h('span', { class: 'nt-ch' }, icon('fork', 15), t('ui.gh'), h('span', { class: 'nt-state' + (m && m.on ? ' on' : '') }, ghState)),
    h('div', { class: 'nt-btns' },
      h('button', { class: 'btn primary sm', onclick: go(() => openGhPanel()) }, t('ui.gh.panel')),
      h('button', { class: 'btn sm', onclick: go(() => openFromGithub()) }, t('ui.gh.open')))));
  if (DESK) box.append(setCard(h('span', { class: 'nt-ch' }, icon('cloud', 15), t('ui.drive')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', onclick: go(() => openDrivePanel()) }, t('ui.drive.btn')))));
  box.append(setCard(h('span', { class: 'nt-ch' }, icon('chat', 15), t('ui.notify')), h('div', { class: 'hint' }, t('ui.notify.t')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', onclick: go(() => openNotify()) }, t('ui.notify.btn')))));
  if (typeof collabAvail === 'function' && collabAvail()) box.append(setCard(h('span', { class: 'nt-ch' }, icon('users', 15), t('ui.collab')), h('div', { class: 'hint' }, t('ui.collab.t')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', onclick: go(() => openCollabPanel()) }, t('ui.collab.btn')))));
  return box;
}
function setMods(st, render) {
  const c = uiCfg(), box = h('div', { class: 'nt-list' });
  if (!uiPro()) { box.append(h('div', { class: 'hint warn' }, t('ui.mods.only'))); return box; }
  box.append(h('div', { class: 'hint' }, t('ui.mods.p')));
  for (const id of UI_MODS) box.append(setCard(switchEl(!c.off[id], v => uiSetMod(id, v), t('ui.mod.' + id)), h('div', { class: 'hint' }, t('ui.mod.' + id + '.h'))));
  return box;
}
TOOL_ITEMS.push({ id: 'stats', group: 'story', ic: 'chart', key: 'top.stats', kw: 'stats endings progress statistics статистика концовки прогресс', run: () => openStats() });

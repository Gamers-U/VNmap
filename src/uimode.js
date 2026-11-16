'use strict';
/* ====== Режимы интерфейса и окно «Настройки» ======
   «Простой» (по умолчанию): на панели только Карта, Текст, Играть, Реестр, Сборка, Файл; все остальные функции лежат под одной
   кнопкой «Ещё», чтобы не бросаться в глаза, но всегда были под рукой.
   «Профессиональный» выкладывает их на виду (строка разделов под панелью), и там можно выключать целые модули, которыми вы не пользуетесь.
   Режим личный: он хранится в настройках программы на этом компьютере, в проект не попадает.
   Не путать с корпоративным режимом прав доступа: тот относится к проекту (Участники → Права доступа). */

Object.assign(D, {
  'ui.settings': ['Настройки', 'Settings'],
  'ui.tab.view': ['Вид и режим', 'Look and mode'], 'ui.tab.conn': ['Подключения', 'Connections'], 'ui.tab.mods': ['Модули', 'Modules'],
  'ui.mode': ['Режим интерфейса', 'Interface mode'],
  'ui.mode.simple': ['Простой', 'Simple'], 'ui.mode.pro': ['Профессиональный', 'Professional'],
  'ui.mode.simple.h': ['На панели только самое нужное: Карта, Текст, Играть, Реестр, Сборка. Все остальные возможности программы лежат под кнопкой «Ещё».', 'The toolbar only has what matters: Map, Text, Play, Registry, Build. Every other feature of the app is under the “More” button.'],
  'ui.mode.pro.h': ['Всё на виду: под панелью отдельная строка разделов (Карта, Тексты, Проверки, Игра, Работа команды), плюс статистика, команда, перевод, совместная работа. Ненужные модули выключаются на вкладке «Модули».', 'Everything is in view: a separate row of sections under the toolbar (Map, Texts, Checks, Play, Teamwork), plus statistics, team, translation, collaboration. Switch off unneeded modules on the “Modules” tab.'],
  'ui.mode.note': ['Режим интерфейса личный и не меняет проект. Корпоративный режим прав доступа это другое: он относится к проекту (Участники → Права доступа).', 'The interface mode is personal and does not change the project. The corporate access-rights mode is a different thing: it belongs to the project (Members → Access rights).'],
  'ui.mode.first': ['Простой режим: на панели только главное, все остальные функции под кнопкой «Ещё». Чтобы они были на виду: Настройки → Профессиональный.', 'Simple mode: only the essentials are on the toolbar, every other feature is under the “More” button. To have them in view: Settings → Professional.'],
  'ui.look': ['Оформление', 'Appearance'], 'ui.theme': ['Тема', 'Theme'], 'ui.theme.dark': ['Тёмная', 'Dark'], 'ui.theme.light': ['Светлая', 'Light'], 'ui.lang': ['Язык интерфейса', 'Interface language'],
  'ui.mapset': ['Карта', 'Map'], 'ui.project': ['Проект', 'Project'],
  'ui.tab.bar': ['Панель', 'Toolbar'],
  'ui.bar.p': ['Отметьте, какие кнопки показывать на панели, и перетащите их мышью, чтобы поменять порядок. Спрятанное всё равно можно найти через поиск Ctrl+K. Настройка своя для простого и для профессионального режима.', 'Tick which buttons to show on the toolbar and drag them with the mouse to change the order. Hidden ones can still be found through the Ctrl+K search. The setting is separate for Simple and Professional mode.'],
  'ui.bar.p.touch': ['Отметьте, какие кнопки показывать на панели. Спрятанное всё равно можно найти через поиск Ctrl+K. Настройка своя для простого и для профессионального режима.', 'Tick which buttons to show on the toolbar. Hidden ones can still be found through the Ctrl+K search. The setting is separate for Simple and Professional mode.'],
  'ui.bar.main': ['Кнопки панели', 'Toolbar buttons'], 'ui.bar.strip': ['Разделы под панелью', 'Sections under the toolbar'],
  'ui.bar.fixed': ['Всегда на панели: Блок, Поиск, Настройки, Справка (в простом режиме ещё «Ещё»).', 'Always on the toolbar: Block, Search, Settings, Help (and “More” in Simple mode).'],
  'ui.bar.drag': ['Перетащите, чтобы поменять порядок', 'Drag to reorder'],
  'ui.bar.reset': ['Вернуть панель по умолчанию', 'Restore the default toolbar'],
  'ui.g.map': ['Карта', 'Map'], 'ui.g.text': ['Тексты', 'Texts'], 'ui.g.check': ['Проверки', 'Checks'], 'ui.g.play': ['Игра', 'Play'], 'ui.g.team': ['Работа команды', 'Teamwork'],
  'ui.g.map.tip': ['Расстановка блоков, карта в PDF, заметки', 'Arranging blocks, map PDF, notes'],
  'ui.g.text.tip': ['Редактор, импорт, вычитка, таблица реплик, переименование, персонажи', 'Editor, import, proofreading digest, replica table, renaming, characters'],
  'ui.g.check.tip': ['Проверка сюжета, переменные, ветки и время, автопрогон, журнал, статистика', 'Plot check, variables, branches and time, autorun, log, statistics'],
  'ui.g.play.tip': ['Плеер, HTML-игра для тестеров, запуск в Ren\'Py', 'Player, HTML game for testers, run in Ren\'Py'],
  'ui.g.team.tip': ['Задачи и сроки, кто что сделал, уведомления, проверка правок', 'Tasks and deadlines, who did what, notifications, review of changes'],
  'ui.more': ['Ещё', 'More'], 'ui.more.tip': ['Все остальные возможности: карта, тексты, проверки, игра, команда, переводы', 'All other features: map, texts, checks, play, team, translations'],
  'ui.more.other': ['Ещё', 'Other'],
  'ui.build': ['Сборка', 'Build'], 'ui.build.tip': ['Собрать игру для Ren\'Py', 'Build the game for Ren\'Py'],
  'ui.file': ['Файл', 'File'], 'ui.file.tip': ['Сохранить проект, открыть, сохранить карту: SVG, PDF', 'Save the project, open one, save the map: SVG, PDF'],
  'ui.conn.h': ['Подключения', 'Connections'],
  'ui.conn.p': ['Всё, что связывает программу с внешним миром, собрано здесь.', 'Everything that connects the app to the outside world is collected here.'],
  'ui.gh': ['GitHub', 'GitHub'], 'ui.gh.on': ['Проект подключён: {0}', 'Project linked: {0}'], 'ui.gh.in': ['Вы вошли как {0}, проект не подключён', 'Signed in as {0}, project not linked'], 'ui.gh.off': ['Вход не выполнен', 'Not signed in'],
  'ui.gh.panel': ['Панель GitHub', 'GitHub panel'], 'ui.gh.open': ['Открыть проект с GitHub…', 'Open a project from GitHub…'],
  'ui.drive': ['Google Диск', 'Google Drive'], 'ui.drive.btn': ['Панель Диска', 'Drive panel'],
  'ui.sync.now': ['Синхронизировать сейчас', 'Sync now'], 'ui.take': ['Загрузить новую версию', 'Load the newer version'], 'ui.pick': ['Выбрать версию…', 'Choose a version…'],
  'ui.drive.nocfg': ['Ключ не настроен', 'Key not set up'], 'ui.drive.nosign': ['Вход не выполнен', 'Not signed in'], 'ui.drive.in': ['Вы вошли как {0}', 'Signed in as {0}'], 'ui.drive.on': ['Проект синхронизируется', 'Project is syncing'],
  'ui.drive.key.h': ['Один раз нужен бесплатный ключ Google. Пошаговая подсказка — в панели Диска.', 'A free Google key is needed once. A step-by-step guide is in the Drive panel.'], 'ui.drive.key.btn': ['Настроить ключ…', 'Set up the key…'],
  'ui.drive.signin': ['Войти через Google', 'Sign in with Google'],
  'ui.drive.sw': ['Синхронизировать этот проект', 'Sync this project'], 'ui.drive.sw.h': ['Проект и файлы попадут в папку «Карта новеллы» на вашем Диске, плюс автоматические копии.', 'The project and files go to the app\'s own folder on your Drive, plus automatic backups.'],
  'ui.drive.web': ['Только в программе для компьютера', 'Desktop app only'], 'ui.drive.web.h': ['Google Диск работает в программе для компьютера (там же вход в Google). В браузере общее хранилище — GitHub, а страховую копию можно сохранить файлом.', 'Google Drive works in the desktop app (sign-in to Google is there too). In the browser the shared storage is GitHub, and you can save a backup copy as a file.'],
  'ui.notify': ['Уведомления', 'Notifications'], 'ui.notify.t': ['Telegram и Discord: сводка при закрытии проекта и напоминания о сроках.', 'Telegram and Discord: a summary when the project closes and deadline reminders.'], 'ui.notify.btn': ['Настроить', 'Set up'],
  'ui.collab': ['Совместная работа', 'Collaboration'], 'ui.collab.t': ['Работать над проектом вместе в реальном времени.', 'Work on the project together in real time.'], 'ui.collab.btn': ['Открыть панель', 'Open the panel'],
  'ui.mods.h': ['Модули', 'Modules'],
  'ui.mods.p': ['Выключенный модуль прячет свои кнопки и пункты меню (в простом режиме тоже). Сами данные проекта не трогаются, вернуть модуль можно в любой момент.', 'A switched-off module hides its buttons and menu items. The project data is untouched and you can bring a module back at any time.'],
  'ui.mods.only': ['Модули настраиваются в профессиональном режиме.', 'Modules are configured in the professional mode.'],
  'ui.mod.analysis': ['Анализ и статистика', 'Analysis and statistics'], 'ui.mod.analysis.h': ['Статистика, ветки и время, автопрогон, журнал прохождений, переменные в блоках.', 'Statistics, branches and time, auto-run, playthrough log, variables in blocks.'],
  'ui.mod.text': ['Тонкая работа с текстом', 'Fine text work'], 'ui.mod.text.h': ['Таблица реплик, переименование везде, страница персонажа, список ресурсов, импорт .rpy.', 'The replica table, rename everywhere, the character page, the resource list, .rpy import.'],
  'ui.mod.team': ['Команда', 'Team'], 'ui.mod.team.h': ['Участники, задачи и сроки, «кто что сделал», уведомления, выбор «кто я».', 'Members, tasks and deadlines, “who did what”, notifications, “who am I”.'],
  'ui.mod.collab': ['Совместная работа', 'Collaboration'], 'ui.mod.collab.h': ['Работа в реальном времени, проверка правок авторов.', 'Real-time work, review of the authors\' changes.'],
  'ui.mod.translate': ['Переводы', 'Translations'], 'ui.mod.translate.h': ['Языки игры: перевод реплик и озвучка на каждом языке.', 'Game languages: dialogue translation and voice per language.'],
});

const UI_MODS = ['analysis', 'text', 'team', 'collab', 'translate'];
/** Профессиональный режим: строка разделов под верхней панелью (инструменты на виду). Пункты берутся из TOOL_ITEMS по id и фильтруются uiShow. */
const UI_STRIP = [
  { id: 'map', ic: 'fit', items: ['layout', 'mappdf', 'notes'] },
  { id: 'text', ic: 'type', items: ['texted', 'docimport', 'digest', 'replicas', 'rename', 'charpage', 'resources', 'rpyimport'] },
  { id: 'check', ic: 'check', items: ['checks', 'missingfiles', 'varstates', 'stats'] },
  { id: 'play', ic: 'play', items: ['player', 'htmlgame', 'renpy', 'ctrlcheck'] },
  { id: 'team', ic: 'users', items: ['tasks', 'notify', 'review'] },
];
/** Правая часть панели по режимам: что есть по умолчанию (порядок слева направо). Модульные кнопки появляются, пока модуль не выключен. */
const BAR_MAIN = { simple: ['play', 'text', 'registry', 'build', 'file', 'open'], pro: ['play', 'text', 'registry', 'stats', 'team', 'translate', 'collab', 'export', 'open'] };
const barMk = () => (uiPro() ? 'p' : 's');                      // порядок и скрытое хранятся отдельно для каждого режима
function barCfg() {
  const c = uiCfg(); if (!c.bar || typeof c.bar !== 'object') c.bar = {};
  if (!c.bar.order || typeof c.bar.order !== 'object') c.bar.order = {};
  if (!c.bar.hide || typeof c.bar.hide !== 'object') c.bar.hide = {};
  return c.bar;
}
/** Разделы строки с хотя бы одним доступным пунктом (порядок по умолчанию). */
function stripGroups() {
  return UI_STRIP.map(g => ({ g, its: g.items.map(id => TOOL_ITEMS.find(x => x.id === id)).filter(x => x && uiShow(x.id)) })).filter(x => x.its.length);
}
/** Все доступные сейчас id кнопок вида kind ('main' — правая часть панели, 'strip' — разделы) в порядке пользователя; скрытые тоже. */
function barAll(kind) {
  const ids = kind === 'strip' ? (uiPro() ? stripGroups().map(x => x.g.id) : []) : BAR_MAIN[uiPro() ? 'pro' : 'simple'].filter(id => !/^(stats|team|translate|collab)$/.test(id) || uiShow('bar.' + id));
  const ord = barCfg().order[barMk() + kind]; if (!Array.isArray(ord)) return ids;
  const rank = id => { const i = ord.indexOf(id); return i < 0 ? 1e6 : i; };
  return ids.map((id, i) => [id, i]).sort((a, b) => (rank(a[0]) - rank(b[0])) || a[1] - b[1]).map(x => x[0]);
}
const barIds = kind => barAll(kind).filter(id => !barCfg().hide[barMk() + kind + ':' + id]);
function barSetOn(kind, id, on) { const c = barCfg(), k = barMk() + kind + ':' + id; if (on) delete c.hide[k]; else c.hide[k] = true; saveSettings(); buildChrome(); }
function barMove(kind, from, to) {
  const ids = barAll(kind); if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return;
  const [x] = ids.splice(from, 1); ids.splice(to, 0, x); barCfg().order[barMk() + kind] = ids; saveSettings(); buildChrome();
}
function barReset() { const c = uiCfg(); delete c.bar; saveSettings(); buildChrome(); }
/** Строка разделов для профессионального режима; в простом её нет. Раздел без доступных пунктов (выключен модуль) или скрытый в «Панели» не рисуется. */
function uiStrip() {
  if (!uiPro()) return null;
  const by = {}; for (const x of stripGroups()) by[x.g.id] = x;
  const groups = [];
  for (const id of barIds('strip')) {
    const x = by[id]; if (!x) continue;
    groups.push(tbtn(x.g.ic, t('ui.g.' + id), t('ui.g.' + id + '.tip'), b => menuAt(b, x.its.map(it => ({ label: t(it.key), icon: it.ic, kbd: it.kbd, onClick: () => setTimeout(() => it.run(b), 0) }))), 'strip-btn strip-' + id));
  }
  return groups.length ? h('div', { class: 'bar strip', id: 'toolstrip' }, ...groups) : null;
}
/* Где что лежит: 's' — на виду в обоих режимах, 'p' — на виду только в профессиональном (в простом лежит под кнопкой «Ещё»), 'x' — живёт в других местах (Настройки).
   Второй элемент — модуль: если он выключен (вкладка «Модули»), возможность спрятана в обоих режимах.
   Идентификаторы совпадают с пунктами меню «Инструменты» (TOOL_ITEMS) и с кнопками верхней панели. Незнакомое видно всегда. */
const UI_LVL = {
  layout: ['s'], mappdf: ['s'], notes: ['s'], texted: ['s'], docimport: ['s'], digest: ['s'], checks: ['s'], missingfiles: ['s'], htmlgame: ['s'], renpy: ['s'], player: ['s'], stats: ['s'],
  replicas: ['p', 'text'], rename: ['p', 'text'], charpage: ['p', 'text'], resources: ['p', 'text'], weight: ['s'], snippets: ['s'], endguide: ['p', 'analysis'], voicesheet: ['p', 'text'], recipes: ['s'], customcode: ['p'], rpyimport: ['p', 'text'],
  varstates: ['p', 'analysis'], branchstats: ['p', 'analysis'], autorun: ['p', 'analysis'], testlog: ['p', 'analysis'],
  whoami: ['p', 'team'], tasks: ['p', 'team'], whodid: ['p', 'team'], notify: ['p', 'team'], review: ['p', 'collab'],
  ghopen: ['x'], snapshots: ['s'],
  'bar.stats': ['p', 'analysis'], 'bar.team': ['p', 'team'], 'bar.translate': ['p', 'translate'], 'bar.collab': ['p', 'collab'], 'bar.theme': ['x'], 'bar.lang': ['x'], 'bar.layers': ['p'],
};
function uiCfg() {
  const c = S.ui && typeof S.ui === 'object' ? S.ui : (S.ui = {});
  if (c.mode !== 'pro') c.mode = 'simple';
  if (!c.off || typeof c.off !== 'object') c.off = {};
  return c;
}
const uiPro = () => uiCfg().mode === 'pro';
/** Есть ли возможность вообще (id пункта меню «Инструменты» или кнопки панели «bar.…»): не 'x' и модуль не выключен. Режим на это не влияет: в простом режиме всё доступно под «Ещё». */
function uiShow(id) {
  const d = UI_LVL[id]; if (!d) return true;
  if (d[0] === 'x') return false;
  return !(d[1] && uiCfg().off[d[1]]);
}
/** Лежит ли возможность на виду (на панели, в разделах): в простом режиме только 's', остальное под «Ещё». */
const uiPlain = id => uiShow(id) && (uiPro() || (UI_LVL[id] || ['s'])[0] === 's');
/** Меню «Ещё» простого режима: все возможности программы по разделам (те же, что в профессиональном режиме лежат на виду). */
function uiMoreMenu(anchor) {
  const items = [], add = (head, list) => { list = list.filter(Boolean); if (!list.length) return; if (items.length) items.push({ sep: true }); items.push({ header: head }, ...list); };
  for (const { g, its } of stripGroups()) add(t('ui.g.' + g.id), its.map(it => ({ label: t(it.key), icon: it.ic, kbd: it.kbd, onClick: () => setTimeout(() => it.run(anchor), 0) })));
  add(t('ui.more.other'), [
    uiShow('bar.team') ? { label: t('team.btn'), icon: 'badge', onClick: () => setTimeout(() => openTeamMenu(anchor), 0) } : null,
    uiShow('bar.translate') ? { label: t('tl.btn'), icon: 'globe', onClick: () => openTranslate() } : null,
    uiShow('bar.collab') && typeof collabAvail === 'function' && collabAvail() ? { label: t('col.btn'), icon: 'users', onClick: () => openCollabPanel() } : null,
    { label: t('exp.map'), icon: 'rows', onClick: exportMap },
    { label: t('tour.btn'), icon: 'sparkles', onClick: () => setTimeout(() => openTour(), 0) },
    { label: t('tb.echo'), icon: S.echo ? 'check' : null, onClick: () => { S.echo = !S.echo; saveSettings(); renderEchoes(); } },
    { label: t('tb.jumps'), icon: S.jumps ? 'check' : null, onClick: () => { S.jumps = !S.jumps; saveSettings(); renderJumps(); } },
  ]);
  const pop = popover(anchor, menuBox(items), { cls: 'menu-pop more-pop' });
  return pop;
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
  setTimeout(() => { if (typeof uiPresetCard === 'function') uiPresetCard(); else toast(t('ui.mode.first'), 9000); }, 1500);
}

/* ---------- окно «Настройки» ---------- */
let SETW = null;                     // открытое окно настроек: вкладка «Подключения» обновляется, пока идёт синхронизация
function syRefreshOpen() {
  const w = SETW; if (!w || !w.m || w.m.closed || w.tab !== 'conn' || !w.render || !w.body) return;
  const sc = w.body.scrollTop; w.render(); w.body.scrollTop = sc;
}
function openSettingsWindow(tab) {
  closePopover();
  const st = { tab: tab || 'view' };
  SETW = st;
  openModal({
    cls: 'set-modal', onClose: () => { if (SETW === st) SETW = null; },
    build: m => {
      st.m = m; st.body = h('div', { class: 'set-body' });
      const render = () => {
        const tabs = [{ value: 'view', label: t('ui.tab.view') }, { value: 'conn', label: t('ui.tab.conn') }];
        tabs.push({ value: 'bar', label: t('ui.tab.bar') });
        if (uiPro()) tabs.push({ value: 'mods', label: t('ui.tab.mods') });
        if (!tabs.some(x => x.value === st.tab)) st.tab = 'view';
        st.body.replaceChildren(segmented(tabs, st.tab, v => { st.tab = v; render(); }), h('div', { class: 'set-pane' }, st.tab === 'view' ? setView(st, render) : st.tab === 'conn' ? setConn(st, render) : st.tab === 'bar' ? setBar(st, render) : setMods(st, render)));
      };
      st.render = render; render();
      return h('div', { class: 'm-wrap' }, modalHead(t('ui.settings'), m), st.body);
    },
  });
}
const setCard = (title, ...kids) => h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, title), ...kids);
function setView(st, render) {
  const c = uiCfg(), box = h('div', { class: 'nt-list' });
  if (typeof uiPresetBlock === 'function') box.append(uiPresetBlock(render));
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
/** Строка состояния службы во вкладке: значок и текст (тот же текст, что в подсказке к значку внизу). */
const syLineEl = p => h('div', { class: 'sy-line ' + p.st + (SY_WARN.includes(p.st) ? ' warn' : '') }, icon(p.st === 'ok' ? 'check' : p.st === 'syncing' ? 'refresh' : SY_WARN.includes(p.st) ? 'alert' : p.ic, 14), h('span', p.line));
function setConn(st, render) {
  const box = h('div', { class: 'nt-list' }), go = fn => () => { st.m.close(); setTimeout(fn, 0); };
  const parts = syParts(), o = syOverall(parts), part = id => parts.find(p => p.id === id);
  box.append(h('div', { class: 'hint' }, t('ui.conn.p')));
  /* сводка: то же, что значок внизу */
  box.append(h('div', { class: 'nt-card sy-sum ' + o.st + (o.warn ? ' warn' : ''), id: 'sy-sum' }, h('div', { class: 'nt-ch' }, icon(o.ic, 17), t('sy.t.' + o.st)),
    parts.length ? h('div', { class: 'sy-lines' }, parts.map(syLineEl)) : h('div', { class: 'hint' }, t('sy.none.h'))));
  /* GitHub */
  const m = typeof gmeta === 'function' ? gmeta() : null, login = typeof GHS !== 'undefined' && GHS.st && GHS.st.login, gp = part('gh');
  const ghState = m && m.on ? t('ui.gh.on', m.repo || '') : login ? t('ui.gh.in', login) : t('ui.gh.off');
  box.append(setCard(h('span', { class: 'nt-ch' }, icon('fork', 15), t('ui.gh'), h('span', { class: 'nt-state' + (m && m.on ? ' on' : '') }, ghState)),
    gp ? syLineEl(gp) : null,
    h('div', { class: 'nt-btns' },
      h('button', { class: 'btn primary sm', id: 'set-gh-panel', onclick: go(() => openGhPanel()) }, t('ui.gh.panel')),
      h('button', { class: 'btn sm', onclick: go(() => openFromGithub()) }, t('ui.gh.open')),
      gp && gp.st === 'conflict' ? h('button', { class: 'btn sm danger-fill', onclick: go(() => ghConflictDialog()) }, icon('alert', 14), t('ui.pick')) : null,
      gp && gp.st !== 'conflict' ? h('button', { class: 'btn sm', id: 'set-gh-now', onclick: () => ghSyncNow() }, icon('refresh', 14), gp.st === 'newer' ? t('ui.take') : t('ui.sync.now')) : null)));
  /* Google Диск */
  box.append(setDriveCard(st, render, go, part('drive')));
  box.append(setCard(h('span', { class: 'nt-ch' }, icon('chat', 15), t('ui.notify')), h('div', { class: 'hint' }, t('ui.notify.t')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', onclick: go(() => openNotify()) }, t('ui.notify.btn')))));
  if (typeof collabAvail === 'function' && collabAvail()) box.append(setCard(h('span', { class: 'nt-ch' }, icon('users', 15), t('ui.collab')), h('div', { class: 'hint' }, t('ui.collab.t')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', onclick: go(() => openCollabPanel()) }, t('ui.collab.btn')))));
  return box;
}
/** Карточка Google Диска: вход, включение синхронизации для проекта и ручной обмен, не уходя из настроек. */
function setDriveCard(st, render, go, dp) {
  const head = (state, on) => h('span', { class: 'nt-ch' }, icon('cloud', 15), t('ui.drive'), h('span', { class: 'nt-state' + (on ? ' on' : '') }, state));
  if (!GD) return h('div', { class: 'nt-card', id: 'set-drive' }, head(t('ui.drive.web'), false), h('div', { class: 'hint' }, t('ui.drive.web.h')));
  const gs = GS.st, dm = dmeta(), on = !!(dm && dm.on);
  const state = !gs.configured ? t('ui.drive.nocfg') : !gs.signedIn ? t('ui.drive.nosign') : on ? t('ui.drive.on') : t('ui.drive.in', gs.email || '');
  const kids = [];
  if (!gs.configured) {
    kids.push(h('div', { class: 'hint' }, t('ui.drive.key.h')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn primary sm', id: 'set-drive-panel', onclick: go(() => openDrivePanel()) }, t('ui.drive.key.btn'))));
  } else if (!gs.signedIn) {
    kids.push(h('div', { class: 'nt-btns' },
      h('button', { class: 'btn primary sm', id: 'set-drive-signin', disabled: GS.signing, onclick: async () => { await driveSignIn(); render(); } }, icon('user', 14), t('ui.drive.signin')),
      h('button', { class: 'btn sm', onclick: go(() => openDrivePanel()) }, t('ui.drive.btn'))));
  } else {
    kids.push(h('div', { class: 'opt-row' }, switchEl(on, v => { if (v) driveEnable(); else driveDisable(); setTimeout(render, 80); }, t('ui.drive.sw')), h('div', { class: 'hint' }, t('ui.drive.sw.h'))));
    if (dp) kids.push(syLineEl(dp));
    kids.push(h('div', { class: 'nt-btns' },
      h('button', { class: 'btn primary sm', id: 'set-drive-panel', onclick: go(() => openDrivePanel()) }, t('ui.drive.btn')),
      on && dp && dp.st === 'conflict' ? h('button', { class: 'btn sm danger-fill', onclick: go(() => driveConflictDialog()) }, icon('alert', 14), t('ui.pick')) : null,
      on && dp && dp.st === 'newer' ? h('button', { class: 'btn sm', onclick: () => driveTakeNewer() }, icon('download', 14), t('ui.take')) : null,
      on && dp && !['conflict', 'newer'].includes(dp.st) ? h('button', { class: 'btn sm', id: 'set-drive-now', onclick: () => driveSyncNow() }, icon('refresh', 14), t('ui.sync.now')) : null));
  }
  return h('div', { class: 'nt-card', id: 'set-drive' }, head(state, on), ...kids);
}
const BAR_META = {
  play: ['play', 'pl.btn'], text: ['type', 'te.top'], registry: ['layers', 'top.registry'], stats: ['chart', 'sh.btn'], team: ['badge', 'team.btn'],
  translate: ['globe', 'tl.btn'], collab: ['users', 'col.btn'], export: ['download', 'top.export'], build: ['box', 'ui.build'], file: ['save', 'ui.file'],
};
/** Вкладка «Панель»: галочки (везде) и перетаскивание порядка (мышью; на сенсорных экранах только галочки). */
function setBar(st, render) {
  const box = h('div', { class: 'nt-list' }), touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  box.append(h('div', { class: 'hint' }, t(touch ? 'ui.bar.p.touch' : 'ui.bar.p')));
  const list = (kind, title) => {
    const ids = barAll(kind); if (!ids.length) return;
    const rows = h('div', { class: 'bar-rows', 'data-kind': kind });
    ids.forEach((id, i) => {
      const meta = kind === 'strip' ? [UI_STRIP.find(g => g.id === id).ic, 'ui.g.' + id] : (id === 'open' ? [DESK ? 'folder' : 'upload', DESK ? 'desk.open.short' : 'top.import'] : BAR_META[id]);
      const row = h('div', { class: 'bar-row', 'data-id': id, 'data-idx': String(i) },
        touch ? null : h('span', { class: 'bar-grip', 'data-tip': t('ui.bar.drag') }, icon('grip', 14)),
        h('span', { class: 'bar-ic' }, icon(meta[0], 16)),
        switchEl(!barCfg().hide[barMk() + kind + ':' + id], v => barSetOn(kind, id, v), t(meta[1])));
      if (!touch) {
        row.draggable = true;
        row.addEventListener('dragstart', ev => { row.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', kind + ':' + i); });
        row.addEventListener('dragend', () => { row.classList.remove('dragging'); rows.querySelectorAll('.over').forEach(x => x.classList.remove('over')); });
        row.addEventListener('dragover', ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; row.classList.add('over'); });
        row.addEventListener('dragleave', () => row.classList.remove('over'));
        row.addEventListener('drop', ev => {
          ev.preventDefault(); row.classList.remove('over');
          const [k, from] = String(ev.dataTransfer.getData('text/plain')).split(':');
          if (k === kind && from !== '' && !isNaN(+from)) { barMove(kind, +from, i); render(); }
        });
      }
      rows.append(row);
    });
    box.append(setCard(title, rows));
  };
  list('main', t('ui.bar.main'));
  list('strip', t('ui.bar.strip'));
  box.append(h('div', { class: 'hint' }, t('ui.bar.fixed')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', id: 'bar-reset', onclick: () => { barReset(); render(); } }, icon('undo', 15), t('ui.bar.reset'))));
  return box;
}
function setMods(st, render) {
  const c = uiCfg(), box = h('div', { class: 'nt-list' });
  if (!uiPro()) { box.append(h('div', { class: 'hint warn' }, t('ui.mods.only'))); return box; }
  box.append(h('div', { class: 'hint' }, t('ui.mods.p')));
  for (const id of UI_MODS) box.append(setCard(switchEl(!c.off[id], v => uiSetMod(id, v), t('ui.mod.' + id)), h('div', { class: 'hint' }, t('ui.mod.' + id + '.h'))));
  return box;
}
TOOL_ITEMS.push({ id: 'stats', group: 'story', ic: 'chart', key: 'sh.btn', kw: 'stats endings progress statistics time branches autorun log team статистика концовки прогресс время ветки автопрогон журнал команда', run: () => openStatsHub() });

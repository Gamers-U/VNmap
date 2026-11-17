'use strict';
/* ====== Тонкая полоска сверху окна (программа для Windows и Linux) ======
   У окна нет системной рамки и меню «Файл, Правка, Вид, Справка». Вместо них сверху узкая полоска цвета кнопок (26 пикселей):
   слева значок (нажмите: меню «Файл, Вид, Справка»), название проекта, справа родные кнопки «свернуть, развернуть, закрыть» (их рисует
   система поверх полоски и подгоняет под цвет темы). Окно тянется за полоску. Во весь экран: F11 или пункт меню.
   Если система не умеет рисовать кнопки поверх страницы (или включён полный экран), полоска показывает свои маленькие кнопки.
   На macOS и в браузере полоски нет: там остаётся как было. */

Object.assign(D, {
  'wb.menu': ['Меню: файл, вид, справка', 'Menu: file, view, help'],
  'wb.file': ['Файл', 'File'], 'wb.view': ['Вид', 'View'], 'wb.help': ['Справка', 'Help'],
  'wb.launcher': ['Начальный экран', 'Start screen'], 'wb.new': ['Новый проект', 'New project'], 'wb.open': ['Открыть…', 'Open…'],
  'wb.save': ['Сохранить', 'Save'], 'wb.saveas': ['Сохранить как…', 'Save as…'], 'wb.copy': ['Сохранить копию…', 'Save a copy…'],
  'wb.build': ['Сборка игры…', 'Build the game…'], 'wb.drive': ['Google Диск…', 'Google Drive…'],
  'wb.theme': ['Светлая / тёмная тема', 'Light / dark theme'], 'wb.lang.ru': ['Язык: русский', 'Language: Russian'], 'wb.lang.en': ['Язык: English', 'Language: English'],
  'wb.zoomin': ['Крупнее', 'Zoom in'], 'wb.zoomout': ['Мельче', 'Zoom out'], 'wb.zoom0': ['Масштаб 100%', 'Zoom 100%'], 'wb.full': ['Во весь экран', 'Full screen'],
  'wb.helpopen': ['Справка', 'Help'], 'wb.upd': ['Обновить версию…', 'Update the app…'], 'wb.renpy': ['Сайт Ren\'Py', 'Ren\'Py website'], 'wb.about': ['О программе и версия', 'About and version'],
  'wb.quit': ['Выход', 'Quit'],
  'wb.min': ['Свернуть', 'Minimize'], 'wb.max': ['Развернуть', 'Maximize'], 'wb.restore': ['Восстановить', 'Restore'], 'wb.close': ['Закрыть', 'Close'], 'wb.exitfull': ['Выйти из полного экрана', 'Exit full screen'],
  'wb.app': ['Карта новеллы', 'Story Map'],
});

let WB = null;
const winbarOn = () => typeof DESK !== 'undefined' && !!DESK && DESK.frameless === true && !!DESK.win && ['onState', 'info', 'action', 'chrome'].every(k => typeof DESK.win[k] === 'function');
const winbarOverlay = () => { try { return !!(navigator.windowControlsOverlay && navigator.windowControlsOverlay.visible); } catch (e) { return false; } };

/** Цвета для системных кнопок: фон как у полоски (цвет кнопок), значки как у вторичного текста. */
function winbarColors() {
  const cs = getComputedStyle(document.documentElement), v = n => (cs.getPropertyValue(n) || '').trim();
  const hex = x => (/^#[0-9a-f]{6}$/i.test(x) ? x : '');
  const dark = S.theme === 'dark';
  return { color: hex(v('--surface2')) || (dark ? '#343439' : '#f0f0f5'), symbolColor: hex(v('--text2')) || (dark ? '#a4a4ac' : '#6a6a72') };
}
/** Сообщить оболочке цвета (при запуске и при смене темы). */
function winbarSync() { if (!WB) return; try { DESK.win.chrome(winbarColors()); } catch (e) { /* без системных кнопок */ } }

function winbarTitle() {
  if (!WB || !P) return;
  const dot = typeof DS !== 'undefined' && DS.dirty && DS.path ? '● ' : '';
  const tool = typeof SAT !== 'undefined' && SAT.tool ? t('sat.t.' + SAT.tool) + ' · ' : '';
  WB.title.textContent = tool + (dot + (P.name || '')).trim() + ' — ' + t('wb.app');
}

function winbarMenu(anchor) {
  const cmd = c => () => deskCommand(c);
  menuAt(anchor, [
    { header: t('wb.file') },
    { label: t('wb.launcher'), icon: 'home', kbd: 'Ctrl+Shift+H', onClick: cmd('launcher') },
    { label: t('wb.new'), icon: 'new', kbd: 'Ctrl+N', onClick: cmd('new') },
    { label: t('wb.open'), icon: 'folder', kbd: 'Ctrl+O', onClick: cmd('open') },
    { label: t('wb.save'), icon: 'save', kbd: 'Ctrl+S', onClick: cmd('save') },
    { label: t('wb.saveas'), icon: 'save', kbd: 'Ctrl+Shift+S', onClick: cmd('saveas') },
    { label: t('wb.copy'), icon: 'copy', onClick: cmd('copy') },
    { label: t('wb.build'), icon: 'box', kbd: 'Ctrl+B', onClick: cmd('build') },
    { label: t('wb.drive'), icon: 'cloud', onClick: cmd('drive') },
    { header: t('wb.view') },
    { label: t('wb.theme'), icon: S.theme === 'dark' ? 'sun' : 'moon', onClick: () => toggleTheme() },
    { label: S.lang === 'ru' ? t('wb.lang.en') : t('wb.lang.ru'), icon: 'globe', onClick: () => setLang(S.lang === 'ru' ? 'en' : 'ru') },
    { label: t('wb.zoomin'), icon: 'plus', kbd: 'Ctrl+=', onClick: () => DESK.win.action('zoomin') },
    { label: t('wb.zoomout'), icon: 'minus', kbd: 'Ctrl+-', onClick: () => DESK.win.action('zoomout') },
    { label: t('wb.zoom0'), icon: 'fit', kbd: 'Ctrl+0', onClick: () => DESK.win.action('zoomreset') },
    { label: t('wb.full'), icon: 'fit', kbd: 'F11', onClick: () => DESK.win.action('fullscreen') },
    { header: t('wb.help') },
    { label: t('wb.helpopen'), icon: 'help', kbd: '?', onClick: cmd('help') },
    { label: t('wb.upd'), icon: 'refresh', onClick: cmd('update') },
    { label: t('wb.renpy'), icon: 'link', onClick: () => DESK.openExternal('https://www.renpy.org/') },
    { label: t('wb.about'), icon: 'info', onClick: () => openSettingsWindow('view') },
    { sep: true },
    { label: t('wb.quit'), icon: 'x', onClick: () => DESK.win.action('close') },
  ]);
}

/** Свои маленькие кнопки: нужны, только если система их не нарисовала (или полный экран). */
function winbarPaint() {
  if (!WB) return;
  const full = !!WB.st.full, own = full || !winbarOverlay();
  document.documentElement.classList.toggle('wb-full', full);
  WB.ctl.replaceChildren();
  if (!own) return;
  const b = (ic, tip, act, cls = '') => h('button', { class: 'wb-btn ' + cls, 'data-tip': tip, 'aria-label': tip, onclick: () => DESK.win.action(act) }, icon(ic, 13, 2));
  if (full) WB.ctl.append(b('fit', t('wb.exitfull'), 'fullscreen'), b('x', t('wb.close'), 'close', 'wb-close'));
  else WB.ctl.append(b('minus', t('wb.min'), 'minimize'), b(WB.st.max ? 'copy' : 'fit', t(WB.st.max ? 'wb.restore' : 'wb.max'), 'maximize'), b('x', t('wb.close'), 'close', 'wb-close'));
}

function winbarInit() {
  if (!winbarOn() || WB) return;
  const root = document.documentElement;
  root.classList.add('has-winbar');
  const title = h('span', { class: 'wb-title', id: 'wb-title' });
  const menuB = h('button', { class: 'wb-btn wb-menu', id: 'wb-menu', 'data-tip': t('wb.menu'), 'aria-label': t('wb.menu'), onclick: e => winbarMenu(e.currentTarget) }, icon('fork', 14, 2));
  const ctl = h('div', { class: 'wb-ctl', id: 'wb-ctl' });
  const bar = h('div', { class: 'winbar', id: 'winbar' }, typeof SAT !== 'undefined' && SAT.tool ? null : menuB, title, h('div', { class: 'grow' }), ctl);
  document.body.insertBefore(bar, document.body.firstChild);
  WB = { bar, title, ctl, st: { max: false, full: false } };
  DESK.win.onState(st => { WB.st = st || WB.st; winbarPaint(); });
  DESK.win.info().then(i => { if (i) WB.st = { max: !!i.max, full: !!i.full }; winbarPaint(); }).catch(() => { });
  try { if (navigator.windowControlsOverlay) navigator.windowControlsOverlay.addEventListener('geometrychange', winbarPaint); } catch (e) { /* нет API */ }
  winbarTitle(); winbarPaint(); winbarSync();
}

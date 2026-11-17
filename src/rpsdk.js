'use strict';
/* ====== Запуск и сборка в настоящем Ren'Py (только в программе для компьютера) ======
   Страница собирает игру, оболочка записывает её в папку проекта Ren'Py и запускает движок из SDK.
   Пути человек выбирает в системных диалогах — страница их не задаёт. Вывод движка идёт в консоль вкладки,
   а строки вида «game/story/…/файл.rpy:12» превращаются в кнопки «открыть блок». */

Object.assign(D, {
  'rp.tab': ['Запуск в Ren\'Py', 'Run in Ren\'Py'],
  'rp.tool': ['Запустить в Ren\'Py (SDK)', 'Run in Ren\'Py (SDK)'],
  'rp.h': ['Запуск и сборка в настоящем Ren\'Py', 'Run and build in real Ren\'Py'],
  'rp.lead': ['Одна кнопка: программа собирает игру, кладёт её в папку вашего проекта Ren\'Py и сразу запускает. Ошибки движка видны здесь же, а строки с номером файла и строки ведут к нужному блоку.',
    'One button: the app builds the game, puts it into your Ren\'Py project folder and launches it. Engine errors show up here, and file:line mentions lead to the right block.'],
  'rp.web.h': ['Это работает только в программе для компьютера', 'This works only in the desktop app'],
  'rp.web.p': ['Браузер не может запускать программы на вашем компьютере. В программе «Карта новеллы» для Windows, macOS и Linux эта вкладка собирает игру, кладёт её в папку проекта Ren\'Py и запускает движок одной кнопкой. Здесь, в браузере, воспользуйтесь вкладкой «Как запустить игру».', 'A browser cannot run programs on your computer. In the desktop app (Windows, macOS, Linux) this tab builds the game, puts it into the Ren\'Py project folder and launches the engine with one button. In the browser, use the "How to run the game" tab.'],
  'rp.old.h': ['Нужна обновлённая оболочка', 'A newer app shell is needed'],
  'rp.old.p': ['Запуск Ren\'Py работает в программе версии 1.3 и новее. Скачайте свежий установщик и поставьте его поверх — проекты и настройки сохранятся.',
    'Running Ren\'Py works in app version 1.3 and newer. Download the latest installer and install it over the old one — your projects and settings stay.'],
  'rp.setup': ['Подготовка (один раз)', 'Setup (once)'],
  'rp.steps': ['1. Скачайте Ren\'Py SDK с renpy.org и распакуйте. 2. Откройте лаунчер (renpy.exe / renpy.sh) → «Create New Project» — это даст папку проекта с options.rpy, gui.rpy и screens.rpy. 3. Укажите обе папки ниже.',
    '1. Download the Ren\'Py SDK from renpy.org and unpack it. 2. Open the launcher (renpy.exe / renpy.sh) → "Create New Project" — it makes a project folder with options.rpy, gui.rpy and screens.rpy. 3. Point to both folders below.'],
  'rp.sdk': ['Папка Ren\'Py SDK', 'Ren\'Py SDK folder'], 'rp.proj': ['Папка проекта Ren\'Py', 'Ren\'Py project folder'],
  'rp.none': ['не выбрана', 'not chosen'], 'rp.pick': ['Выбрать…', 'Choose…'], 'rp.change': ['Изменить…', 'Change…'],
  'rp.get': ['Скачать SDK', 'Get the SDK'], 'rp.reset': ['Сбросить', 'Reset'], 'rp.show': ['Показать папку', 'Show folder'],
  'rp.sdk.ok': ['Ren\'Py {0}', 'Ren\'Py {0}'], 'rp.sdk.gone': ['папка пропала или это больше не SDK', 'the folder is gone or no longer an SDK'],
  'rp.sdk.bad.no-dir': ['Такой папки нет.', 'No such folder.'],
  'rp.sdk.bad.not-sdk': ['Это не папка Ren\'Py SDK: в ней нет renpy.py и папок renpy и launcher. Выберите папку, куда вы распаковали SDK.', 'This is not a Ren\'Py SDK folder: renpy.py and the renpy and launcher folders are missing. Pick the folder where you unpacked the SDK.'],
  'rp.sdk.bad.is-project': ['Это папка игры, а нужна папка самого SDK (рядом с renpy.exe или renpy.sh). Папка проекта выбирается ниже.', 'This is a game folder, but the SDK folder itself is needed (next to renpy.exe or renpy.sh). The project folder is chosen below.'],
  'rp.sdk.bad.no-exe': ['В папке SDK нет запускающего файла (renpy.exe на Windows, renpy.sh на Linux и macOS). Скачайте SDK для своей системы.', 'The SDK folder has no launcher file (renpy.exe on Windows, renpy.sh on Linux and macOS). Get the SDK for your system.'],
  'rp.proj.bad.no-dir': ['Такой папки нет.', 'No such folder.'],
  'rp.proj.bad.is-sdk': ['Это папка SDK. Нужна папка проекта: ту, которую создал лаунчер Ren\'Py (внутри неё есть папка game).', 'This is the SDK folder. The project folder is needed: the one the Ren\'Py launcher created (it contains a game folder).'],
  'rp.proj.bad.no-game': ['В этой папке нет папки game — это не проект Ren\'Py. Создайте проект в лаунчере («Create New Project») и выберите его папку.', 'This folder has no game folder, so it is not a Ren\'Py project. Create one in the launcher ("Create New Project") and pick its folder.'],
  'rp.proj.gone': ['папка пропала', 'the folder is gone'], 'rp.proj.nogame': ['в папке нет game', 'there is no game folder in it'],
  'rp.proj.miss': ['В папке нет {0}. Их создаёт лаунчер Ren\'Py при создании проекта — без них игра может не запуститься или выглядеть пустой.', 'The folder has no {0}. The Ren\'Py launcher creates them with a new project — without them the game may not start or may look bare.'],
  'rp.chosen': ['Папка выбрана: {0}', 'Folder chosen: {0}'],
  'rp.act': ['Действия', 'Actions'],
  'rp.from': ['Запускать с блока', 'Start from block'], 'rp.from.start': ['С начала игры', 'From the beginning'],
  'rp.from.t': ['Игра начнётся с выбранного блока (переменные — по умолчанию). Для проверки сцены в середине истории.', 'The game starts at the chosen block (variables stay at their defaults). Handy for testing a scene in the middle.'],
  'rp.run': ['Запустить игру', 'Run the game'], 'rp.stop': ['Остановить', 'Stop'], 'rp.restart': ['Перезапустить', 'Restart'],
  'rp.lint': ['Проверить (lint)', 'Check (lint)'], 'rp.lint.t': ['Проверка самого Ren\'Py: неизвестные картинки, персонажи, метки', 'Ren\'Py\'s own check: unknown images, characters, labels'],
  'rp.dist': ['Собрать дистрибутив', 'Build distribution'], 'rp.dist.t': ['Готовые архивы игры для выбранных систем (нужны настройки сборки в options.rpy)', 'Ready game archives for the chosen systems (needs the build settings in options.rpy)'],
  'rp.pk.pc': ['Windows + Linux (zip)', 'Windows + Linux (zip)'], 'rp.pk.win': ['Windows', 'Windows'], 'rp.pk.linux': ['Linux', 'Linux'], 'rp.pk.mac': ['macOS', 'macOS'], 'rp.pk.market': ['Для магазинов (itch, Steam…)', 'For stores (itch, Steam…)'],
  'rp.out': ['Вывод Ren\'Py', 'Ren\'Py output'], 'rp.out.empty': ['Здесь появится вывод движка.', 'The engine output will appear here.'],
  'rp.copy': ['Копировать', 'Copy'], 'rp.clear': ['Очистить', 'Clear'], 'rp.copied': ['Вывод скопирован', 'Output copied'],
  'rp.open.dist': ['Показать готовые архивы', 'Show the built archives'],
  'rp.to': ['Открыть блок «{0}»', 'Open block "{0}"'],
  'rp.busy': ['Готовлю…', 'Preparing…'], 'rp.running': ['Идёт: {0}', 'Running: {0}'],
  'rp.k.run': ['игра', 'game'], 'rp.k.lint': ['проверка', 'check'], 'rp.k.distribute': ['сборка', 'build'],
  'rp.writing': ['Записываю игру в папку проекта…', 'Writing the game into the project folder…'],
  'rp.written': ['Записано: изменено файлов {0} из {1}, убрано устаревших {2}.', 'Written: {0} of {1} files changed, {2} outdated removed.'],
  'rp.cerr': ['В сборке есть ошибок: {0}. Подробности — на вкладке «Отчёт».', 'The build has {0} error(s). See the Report tab.'],
  'rp.exit': ['Завершено, код {0}, {1} с', 'Finished, exit code {0}, {1} s'], 'rp.exit.stop': ['Остановлено, {0} с', 'Stopped, {0} s'],
  'rp.exit.err': ['Не удалось запустить: {0}', 'Could not start: {0}'],
  'rp.fail': ['Не получилось', 'Failed'],
  'rp.e.no-sdk': ['Сначала выберите папку Ren\'Py SDK.', 'Choose the Ren\'Py SDK folder first.'],
  'rp.e.no-project': ['Сначала выберите папку проекта Ren\'Py.', 'Choose the Ren\'Py project folder first.'],
  'rp.e.no-game': ['В папке проекта нет папки game.', 'The project folder has no game folder.'],
  'rp.e.busy': ['Это уже выполняется — дождитесь окончания или нажмите «Остановить».', 'This is already running — wait for it or press Stop.'],
  'rp.e.empty': ['Нечего записывать: сборка пуста.', 'Nothing to write: the build is empty.'],
  'rp.nofiles': ['Сборка пуста: проверьте вкладку «Отчёт».', 'The build is empty: check the Report tab.'],
  'rp.help': ['Запуск в Ren\'Py: кнопка в окне «Сборка» собирает игру, записывает её в папку вашего проекта Ren\'Py и запускает настоящий движок. Работает в программе для компьютера (версия 1.3+); нужен Ren\'Py SDK. Можно начать с любого блока, проверить игру командой lint и собрать архивы для Windows, Linux и macOS. Строки ошибок со ссылкой на файл превращаются в кнопки перехода к блоку.',
    'Run in Ren\'Py: the button in the Build window builds the game, writes it into your Ren\'Py project folder and launches the real engine. It works in the desktop app (version 1.3+) and needs the Ren\'Py SDK. You can start from any block, run the lint check and build archives for Windows, Linux and macOS. Error lines that mention a file become buttons that jump to the block.'],
});

TOOL_ITEMS.push({ id: 'renpy', group: 'play', ic: 'zap', key: 'rp.tool', kw: 'renpy ren\'py sdk run launch lint distribute build play real engine ренпай запуск сборка проверка дистрибутив движок', run: () => openBuild('renpy') });

const RP = { out: [], part: { out: '', err: '', sys: '', file: '' }, jobs: new Map(), st: null, R: null, map: null, view: null, busy: false, wired: false, from: '', pk: ['pc'], outDir: '', status: '' };
const RP_MAX = 4000;
const rpApi = () => (DESK && DESK.renpy) || null;
const rpKey = () => String((P && (P.uid || P.name)) || 'x');

function rpWire() {
  const api = rpApi();
  if (!api || RP.wired) return;
  RP.wired = true;
  api.onEvent(rpEvent);
}
function rpEvent(ev) {
  if (!ev) return;
  if (ev.t === 'out') { for (const c of ev.chunks || []) rpAppend(c.s, c.text); return; }
  if (ev.t === 'exit') {
    for (const s of ['out', 'err', 'sys', 'file']) rpFlushPart(s);
    RP.jobs.delete(ev.id);
    const secs = (ev.ms / 1000).toFixed(1);
    const bad = ev.error ? t('rp.exit.err', ev.error) : ev.stopped ? t('rp.exit.stop', secs) : t('rp.exit', ev.code == null ? '?' : ev.code, secs);
    rpLine('sys', '— ' + bad);
    RP.status = '';
    if (ev.outDir) RP.outDir = ev.outDir;
    rpRender();
    if (ev.kind === 'run' && !ev.stopped && ev.code === 0) toast(t('rp.exit', ev.code, secs), 2500);
  }
}
function rpAppend(stream, text) {
  const s = RP.part[stream] === undefined ? 'out' : stream;
  RP.part[s] += String(text).replace(/\r\n?/g, '\n');
  let i;
  while ((i = RP.part[s].indexOf('\n')) >= 0) { const ln = RP.part[s].slice(0, i); RP.part[s] = RP.part[s].slice(i + 1); rpLine(s, ln); }
}
function rpFlushPart(s) { if (RP.part[s]) { const ln = RP.part[s]; RP.part[s] = ''; rpLine(s, ln); } }
function rpLine(s, text) {
  const ln = { s, text };
  RP.out.push(ln);
  if (RP.out.length > RP_MAX) RP.out.splice(0, RP.out.length - RP_MAX);
  const v = RP.view;
  if (v && v.out.isConnected) {
    const near = v.out.scrollHeight - v.out.scrollTop - v.out.clientHeight < 60;
    v.out.append(rpLineEl(ln));
    while (v.out.childNodes.length > RP_MAX) v.out.removeChild(v.out.firstChild);
    if (near) v.out.scrollTop = v.out.scrollHeight;
    if (v.empty) { v.empty.remove(); v.empty = null; }
  }
}
const rpSys = text => rpLine('sys', text);

/* ---- строка вывода ↔ блок ---- */
function rpBuildMap(R) {
  const files = new Map(), labels = new Map();
  for (const b of R.blockLabels || []) { labels.set(b.label, { b, f: null }); for (const f of b.files) labels.set(f.label, { b, f }); }
  for (const f of R.files) {
    if (!/\.rpy$/i.test(f.path)) continue;
    const arr = [];
    f.text.split('\n').forEach((ln, i) => { const m = /^label\s+([A-Za-z_][\w.]*)/.exec(ln); if (m) arr.push([i + 1, m[1]]); });
    files.set(f.path, arr);
  }
  return { files, labels };
}
function rpBlockAt(map, file, line) {
  const arr = map && map.files.get(file);
  if (!arr) return null;
  let lab = null;
  for (const [ln, name] of arr) { if (ln <= line) lab = name; else break; }
  return lab ? map.labels.get(lab) || null : null;
}
const RP_PATS = [/File "([^"]+\.rpy)", line (\d+)/i, /([\w\/\\.\- :]+?\.rpy):(\d+)/i];
function rpFindRef(text) {
  for (const re of RP_PATS) {
    const m = re.exec(text);
    if (!m) continue;
    let p = m[1].replace(/\\/g, '/'); const i = p.lastIndexOf('game/');
    p = i >= 0 ? p.slice(i) : 'game/' + p.replace(/^\.?\//, '');
    return { file: p, line: +m[2] };
  }
  return null;
}
function rpLineEl(ln) {
  const el = h('div', { class: 'rp-l ' + ln.s }, ln.text || ' ');
  if (ln.s === 'sys' || !RP.map) return el;
  const ref = rpFindRef(ln.text);
  const hit = ref && rpBlockAt(RP.map, ref.file, ref.line);
  if (hit && nodeById(hit.b.id)) {
    el.append(h('button', { class: 'btn sm rp-go', 'data-tip': t('rp.to', hit.b.title), onclick: () => openNodeModal(hit.b.id, hit.f ? hit.f.id : undefined) }, icon('open', 13), hit.b.title));
  }
  return el;
}

/* ---- подготовка и действия ---- */
async function rpCompile(from) {
  const blobs = await availableBlobs();
  const old = P.startId;
  try {
    if (from && nodeById(from)) P.startId = from;
    return compileProject(from ? { includeUnreachable: true } : null, blobs);
  } finally { P.startId = old; }
}
async function rpRefresh(render = true) {
  const api = rpApi();
  if (!api) return;
  try { RP.st = await api.status(rpKey()); } catch (e) { RP.st = null; }
  if (RP.st) { RP.jobs = new Map(RP.st.jobs.map(j => [j.id, j])); }
  if (render) rpRender();
}
function rpReady() { const s = RP.st; return !!(s && s.sdk && s.sdk.ok && s.project && s.project.exists && s.project.hasGame); }

async function rpAction(kind, opts) {
  const api = rpApi();
  if (!api || RP.busy) return;
  RP.busy = true; RP.status = t('rp.busy'); rpRender();
  try {
    await rpRefresh(false);
    const s = RP.st;
    if (!s || !s.sdk || !s.sdk.ok) { toast(t('rp.e.no-sdk'), 4500); return; }
    if (!s.project || !s.project.exists) { toast(t('rp.e.no-project'), 4500); return; }
    if (!s.project.hasGame) { toast(t('rp.e.no-game'), 4500); return; }
    if (s.jobs.some(j => j.kind === kind) && kind !== 'run') { toast(t('rp.e.busy'), 4500); return; }
    flushHistory();
    const R = await rpCompile(kind === 'run' ? (RP.from || '') : '');
    if (!R.files.length) { toast(t('rp.nofiles'), 5000); return; }
    RP.R = R; RP.map = rpBuildMap(R); RP.outDir = '';
    RP.out = []; for (const k in RP.part) RP.part[k] = '';
    if (RP.view && RP.view.out.isConnected) { rpFillOut(); RP.view.out.scrollIntoView({ block: 'end', behavior: 'smooth' }); }
    if (R.stats.errors) rpSys('⚠ ' + t('rp.cerr', R.stats.errors));
    rpSys(t('rp.writing'));
    const w = await api.write(rpKey(), (await buildGameEntries(R)).filter(e => /^game\//.test(e.name)));
    if (!w || !w.ok) { if (w && w.code && w.code !== 'cancel') toast(rpMsg(w.code), 5000); rpSys('—'); return; }
    rpSys(t('rp.written', w.changed, w.written, w.removed));
    const r = await api.start(rpKey(), kind, opts || {});
    if (!r || !r.ok) { const m = rpMsg(r && r.code); rpSys('✖ ' + m); toast(m, 5000); return; }
    RP.jobs.set(r.id, { id: r.id, kind });
    RP.status = t('rp.running', t('rp.k.' + kind));
  } catch (e) { toast(t('rp.fail') + ' (' + deskErr(e) + ')', 6000); RP.status = ''; }
  finally { RP.busy = false; if (!RP.jobs.size) RP.status = ''; await rpRefresh(false); rpRender(); }
}
const rpMsg = code => (D['rp.e.' + code] ? t('rp.e.' + code) : t('rp.fail') + ' (' + code + ')');
async function rpStop() {
  const api = rpApi();
  if (!api) return;
  for (const id of [...RP.jobs.keys()]) { try { await api.stop(id); } catch (e) { /* уже закрыт */ } }
}
async function rpPickSdk() {
  const api = rpApi();
  try {
    const r = await api.pickSdk();
    if (!r) return;
    if (!r.ok) { toast(t('rp.sdk.bad.' + r.code), 7000); return; }
    toast(t('rp.sdk.ok', r.sdk.version || '?'), 3000);
  } catch (e) { toast(t('rp.fail') + ' (' + deskErr(e) + ')', 5000); }
  rpRefresh();
}
async function rpPickProject() {
  const api = rpApi();
  try {
    const r = await api.pickProject(rpKey());
    if (!r) return;
    if (!r.ok) { toast(t('rp.proj.bad.' + r.code), 8000); return; }
    toast(t('rp.chosen', r.project.dir), 3500);
  } catch (e) { toast(t('rp.fail') + ' (' + deskErr(e) + ')', 5000); }
  rpRefresh();
}

/* ---- вкладка ---- */
function rpFillOut() {
  const v = RP.view; if (!v) return;
  v.out.replaceChildren();
  if (!RP.out.length) { v.empty = h('div', { class: 'hint rp-empty' }, t('rp.out.empty')); v.out.append(v.empty); return; }
  v.empty = null;
  const frag = document.createDocumentFragment();
  RP.out.forEach(ln => frag.append(rpLineEl(ln)));
  v.out.append(frag);
  v.out.scrollTop = v.out.scrollHeight;
}
function rpRender() {
  const v = RP.view;
  if (!v || !v.root.isConnected) return;
  if (v.mini) { v.stat.textContent = RP.status || ''; v.stop.disabled = !RP.jobs.size; return; }                     // панель под плеером: только состояние и «Остановить»
  const keep = v.ctl.scrollTop;
  v.ctl.replaceChildren(...rpControls());
  v.ctl.scrollTop = keep;
  v.stat.textContent = RP.status || '';
}
const rpShort = p => (p.length > 58 ? p.slice(0, 22) + '…' + p.slice(-34) : p);
const rpPath = (p, ok) => h('span', { class: 'rp-path mono-s' + (ok === false ? ' bad' : ''), 'data-tip': p || null }, p ? rpShort(p) : t('rp.none'));
function rpChip(label, ok) { return h('span', { class: 'rp-chip' + (ok ? ' ok' : ' no') }, icon(ok ? 'check' : 'x', 12), label); }

function rpControls() {
  const api = rpApi(), s = RP.st;
  const out = [];
  const sdk = s && s.sdk, proj = s && s.project;
  const sdkOk = !!(sdk && sdk.ok);
  /* подготовка */
  const sdkRow = h('div', { class: 'rp-row' },
    h('div', { class: 'rp-lab' }, t('rp.sdk')),
    h('div', { class: 'rp-val' }, rpPath(sdk ? sdk.dir || sdk.saved : '', sdkOk || !sdk),
      sdkOk ? h('span', { class: 'rp-chip ok' }, icon('check', 12), t('rp.sdk.ok', sdk.version || '?')) : sdk ? h('span', { class: 'rp-chip no' }, icon('x', 12), t('rp.sdk.gone')) : null),
    h('div', { class: 'rp-btns' },
      h('button', { class: 'btn sm' + (sdkOk ? '' : ' primary'), onclick: rpPickSdk }, icon('folder', 14), sdkOk ? t('rp.change') : t('rp.pick')),
      !sdkOk ? h('button', { class: 'btn sm', onclick: () => DESK.openExternal('https://www.renpy.org/latest.html') }, icon('download', 14), t('rp.get')) : null));
  const projOk = !!(proj && proj.exists && proj.hasGame);
  const projRow = h('div', { class: 'rp-row' },
    h('div', { class: 'rp-lab' }, t('rp.proj')),
    h('div', { class: 'rp-val' }, rpPath(proj ? proj.dir : '', projOk || !proj),
      proj && !proj.exists ? h('span', { class: 'rp-chip no' }, icon('x', 12), t('rp.proj.gone')) : null,
      proj && proj.exists && !proj.hasGame ? h('span', { class: 'rp-chip no' }, icon('x', 12), t('rp.proj.nogame')) : null,
      projOk ? [rpChip('game', true), rpChip('options.rpy', proj.options), rpChip('gui.rpy', proj.gui), rpChip('screens.rpy', proj.screens)] : null),
    h('div', { class: 'rp-btns' },
      h('button', { class: 'btn sm' + (projOk ? '' : ' primary'), onclick: rpPickProject }, icon('folder', 14), projOk ? t('rp.change') : t('rp.pick')),
      projOk ? h('button', { class: 'btn sm', onclick: () => DESK.showInFolder(proj.dir) }, icon('open', 14), t('rp.show')) : null));
  const miss = projOk ? [['options.rpy', proj.options], ['gui.rpy', proj.gui], ['screens.rpy', proj.screens]].filter(x => !x[1]).map(x => x[0]) : [];
  out.push(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('folder', 16), h('b', t('rp.setup'))),
    !sdkOk || !projOk ? h('p', { class: 'gd-p' }, t('rp.steps')) : null, sdkRow, projRow,
    miss.length ? h('p', { class: 'hint rp-warn' }, icon('alert', 14), t('rp.proj.miss', miss.join(', '))) : null));

  /* действия */
  const ready = sdkOk && projOk && !RP.busy;
  const running = [...RP.jobs.values()];
  const runJob = running.find(j => j.kind === 'run');
  const sel = h('select', { class: 'inp sm rp-sel', disabled: !ready }, h('option', { value: '' }, t('rp.from.start')),
    ...P.nodes.filter(n => n.type !== 'note').sort((a, b) => String(a.title).localeCompare(String(b.title))).map(n => h('option', { value: n.id }, n.title || '—')));
  sel.value = RP.from && nodeById(RP.from) ? RP.from : '';
  sel.addEventListener('change', () => { RP.from = sel.value; });
  const pkChip = k => h('button', { class: 'rp-pk' + (RP.pk.includes(k) ? ' on' : ''), onclick: ev => { RP.pk = RP.pk.includes(k) ? RP.pk.filter(x => x !== k) : [...RP.pk, k]; ev.currentTarget.classList.toggle('on', RP.pk.includes(k)); } }, t('rp.pk.' + k));
  const distJob = running.find(j => j.kind === 'distribute'), lintJob = running.find(j => j.kind === 'lint');
  out.push(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('play', 16), h('b', t('rp.act')), h('div', { class: 'grow' }), h('span', { class: 'hint' }, RP.busy ? t('rp.busy') : '')),
    h('div', { class: 'rp-act' },
      h('div', { class: 'rp-arow' }, field(t('rp.from'), sel, t('rp.from.t')),
        h('div', { class: 'rp-btns end' },
          h('button', { class: 'btn primary lg', disabled: !ready, onclick: () => rpAction('run', {}) }, icon('play', 16), runJob ? t('rp.restart') : t('rp.run')),
          runJob ? h('button', { class: 'btn lg', onclick: rpStop }, icon('x', 16), t('rp.stop')) : null)),
      h('div', { class: 'rp-arow' }, h('div', { class: 'rp-at' }, h('b', t('rp.lint')), h('div', { class: 'hint' }, t('rp.lint.t'))),
        h('div', { class: 'rp-btns end' }, h('button', { class: 'btn', disabled: !ready || !!lintJob, onclick: () => rpAction('lint', {}) }, icon('check', 15), t('rp.lint')))),
      h('div', { class: 'rp-arow' }, h('div', { class: 'rp-at' }, h('b', t('rp.dist')), h('div', { class: 'hint' }, t('rp.dist.t')), h('div', { class: 'rp-pks' }, ['pc', 'win', 'linux', 'mac', 'market'].map(pkChip))),
        h('div', { class: 'rp-btns end' },
          h('button', { class: 'btn', disabled: !ready || !!distJob || !RP.pk.length, onclick: () => rpAction('distribute', { packages: RP.pk.slice() }) }, icon('box', 15), t('rp.dist')),
          RP.outDir ? h('button', { class: 'btn', onclick: () => DESK.showInFolder(RP.outDir) }, icon('folder', 15), t('rp.open.dist')) : null)))));
  return out;
}
function bldRenpyView(st) {
  const root = h('div', { class: 'view bld-view rp-view' });
  const api = rpApi();
  root.append(h('div', { class: 'sec-head' }, icon('zap', 17), h('b', t('rp.h'))), h('p', { class: 'gd-lead' }, t('rp.lead')));
  if (!DESK) {
    root.append(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('info', 16), h('b', t('rp.web.h'))), h('p', { class: 'gd-p' }, t('rp.web.p')), typeof ghShellButtons === 'function' ? ghShellButtons() : null));
    return root;
  }
  if (!api) {
    root.append(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('alert', 16), h('b', t('rp.old.h'))), h('p', { class: 'gd-p' }, t('rp.old.p')), typeof ghShellButtons === 'function' ? ghShellButtons() : null));
    return root;
  }
  rpWire();
  const ctl = h('div', { class: 'rp-ctl' });
  const stat = h('span', { class: 'rp-stat hint' }, RP.status || '');
  const out = h('div', { class: 'codepre rp-out' });
  const bar = h('div', { class: 'sec-head', style: { marginTop: '4px' } }, icon('file', 16), h('b', t('rp.out')), stat, h('div', { class: 'grow' }),
    h('button', { class: 'btn sm', onclick: () => copyText(RP.out.map(l => l.text).join('\n')).then(() => toast(t('rp.copied'))) }, icon('copy', 14), t('rp.copy')),
    h('button', { class: 'btn sm', onclick: () => { RP.out = []; for (const k in RP.part) RP.part[k] = ''; rpFillOut(); } }, icon('trash', 14), t('rp.clear')));
  root.append(ctl, bar, out);
  RP.view = { root, ctl, out, stat, empty: null };
  if (!RP.from) { const sel = UI.sel && UI.sel.size === 1 ? [...UI.sel][0] : ''; if (sel && nodeById(sel)) RP.from = sel; }
  rpFillOut();
  ctl.replaceChildren(...rpControls());
  rpRefresh();
  return root;
}

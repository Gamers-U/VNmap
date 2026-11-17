'use strict';
/* Карта новеллы — десктопная оболочка (Electron).
   Всё приложение — это тот же index.html. Оболочка добавляет то, чего нет у страницы в браузере:
   настоящие файлы проекта, диалоги ОС, запись собранной игры прямо в папку, меню, ассоциацию .vnmap. */
const { app, BrowserWindow, Menu, dialog, ipcMain, protocol, shell, nativeTheme, net, safeStorage , screen } = require('electron');
const { GDrive } = require('./gdrive');
const { Updater, stage: stageUpdate, compareBuild, sha256 } = require('./updater');
const { MANIFEST, cleanRel, exists, pruneEmptyDirs, writeBuildFiles } = require('./buildwrite');
const { RenpyHost } = require('./renpy');
const { ShellUpdater } = require('./selfupdate');
const { Notifier } = require('./notify');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const SCHEME = 'vnmap';
const HOST = 'app';
const APP_DIR = path.join(__dirname, 'app');
const PROJECT_EXTS = ['.vnmap', '.zip', '.json'];
const DEV = process.argv.includes('--dev');
/* Windows и Linux: без системной рамки и меню. Сверху тонкая полоска страницы (src/winbar.js), кнопки «свернуть, развернуть, закрыть»
   рисует сама система поверх неё (titleBarOverlay), поэтому остаются родные края окна и привязка окон Windows 11. macOS оставляем как есть:
   там строка меню обязательна по правилам системы. Переменная VN_NATIVE_FRAME=1 возвращает обычное окно (на случай, если что-то пойдёт не так). */
const FRAMELESS = process.platform !== 'darwin' && !process.env.VN_NATIVE_FRAME;
const WINBAR_H = 26;
const CHROME_DEF = { dark: { color: '#343439', symbolColor: '#a4a4ac' }, light: { color: '#f0f0f5', symbolColor: '#6a6a72' } };
const BRIDGE = 9;                      // версия «моста» оболочки: страница может потребовать не меньше (data-needs в её отметке сборки)
const RECENT_MAX = 12;

protocol.registerSchemesAsPrivileged([{ scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
app.setName('VNMap');
app.setPath('userData', path.join(app.getPath('appData'), 'VNMap'));
const createSat = require('./sat.js');
const { ProjFs } = require('./projfs.js');
const updater = new Updater({ bundledDir: APP_DIR, userData: app.getPath('userData'), bridge: BRIDGE });
let overrideDir = null;                 // папка с установленным обновлением страницы (или null — работает встроенная)
let bootNotice = null;                // что рассказать странице после запуска: откат, обновление
let launcherPending = !process.argv.includes('--no-launcher');   // показать стартовый экран при первом запуске окна
let lastUpdateUrl = '';
let staged = null;                    // кандидат на обновление, ожидающий подтверждения

/* ---------- состояние ---------- */
let win = null;
let lang = 'ru';
let projectPath = '';                 // файл, к которому привязан проект
let lastDir = '';                     // последняя папка в диалогах
let uiState = { name: '', dirty: false, bound: false };
let pendingOpen = null;               // файл, который просили открыть до готовности окна
let rendererReady = false;
let forceClose = false;
let closing = false;
let pendingOpenPath = null;           // файл из «Открыть с помощью» на macOS до готовности приложения

const STR = {
  ru: {
    appName: 'Карта новеллы',
    file: 'Файл', edit: 'Правка', view: 'Вид', help: 'Справка', window: 'Окно',
    new: 'Новый проект…', open: 'Открыть проект…', save: 'Сохранить', saveAs: 'Сохранить как…', copy: 'Сохранить копию…',
    build: 'Сборка игры…', drive: 'Google Диск…', quit: 'Выход', theme: 'Сменить тему', langRu: 'Русский', langEn: 'English', language: 'Язык',
    helpOpen: 'Справка по программе', renpy: 'Сайт Ren\'Py', about: 'О программе', zoomReset: 'Масштаб интерфейса: 100%',
    zoomIn: 'Крупнее', zoomOut: 'Мельче', fullscreen: 'Полный экран', reload: 'Перезагрузить', devtools: 'Инструменты разработчика',
    projFilter: 'Проект «Карты новеллы»', allFilter: 'Все файлы', zipFilter: 'ZIP-архив',
    openTitle: 'Открыть проект', saveTitle: 'Сохранить проект', pickDir: 'Куда записать игру',
    pickDirBtn: 'Выбрать папку', ok: 'Готово',
    rpPickSdk: 'Папка Ren\'Py SDK (где лежит renpy.exe / renpy.sh)', rpPickProj: 'Папка проекта Ren\'Py (внутри неё лежит папка game)', rpCut: '… вывод обрезан …', rpRetry: '↻ Эта версия Ren\'Py не знает --no-launch — повторяю без него',
    overwriteTitle: 'Папка уже содержит файлы',
    overwriteText: n => `В выбранной папке уже есть ${n} файл(ов) с такими же именами. Они будут заменены новой сборкой.`,
    overwriteDetail: 'Файлы, которых нет в этой папке, останутся нетронутыми. Файлы прошлой сборки, которых больше нет в проекте, будут удалены.',
    overwrite: 'Заменить', cancel: 'Отмена',
    unsavedTitle: 'Сохранить изменения?',
    unsavedText: n => `Проект «${n}» изменён и ещё не записан в файл.`,
    saveBtn: 'Сохранить', dontSave: 'Не сохранять',
    aboutText: v => `Карта новеллы ${v}\nКонструктор визуальных новелл: карта сюжета, сценарии, ресурсы и компилятор в Ren'Py.\n\nDesktop-версия на Electron ${process.versions.electron}, Chromium ${process.versions.chrome}.\nШрифт Inter — SIL Open Font License.`,
    errWrite: 'Не удалось записать файл',
    badNames: 'Недопустимые имена файлов в сборке: ',
    launcher: 'Стартовый экран…', update: 'Обновить программу…',
    updTitle: 'Файл обновления', updFilter: 'Обновление (ZIP или index.html)',
    updErr: {
      empty: 'Файл пустой.', 'zip-too-big': 'Файл слишком большой для обновления.', 'bad-size': 'Размер файла не похож на страницу программы.',
      'zip-bad': 'Архив повреждён или не открывается.', 'zip-encrypted': 'Архив защищён паролем.', 'zip-method': 'Архив упакован неподдерживаемым способом.',
      'no-index': 'В архиве нет файла index.html.', 'not-html': 'Это не файл обновления: нужен ZIP-архив или index.html.',
      'no-stamp': 'Это не страница «Карты новеллы»: в ней нет отметки сборки.', 'hash-mismatch': 'Контрольная сумма не совпала: файл повреждён или изменён.',
      'needs-shell': 'Для этого обновления нужна более новая оболочка программы. Один раз переустановите программу.', 'bad-url': 'Нужна ссылка, которая начинается с https://',
      'http-fail': 'Не удалось скачать файл', 'too-big': 'Файл слишком большой.', 'gh-no-asset': 'В последнем выпуске на GitHub нет файла vnmap-update-….zip.', 'no-staged': 'Сначала выберите файл обновления.', 'timeout': 'Сервер слишком долго не отвечает.',
    },
  },
  en: {
    appName: 'Story Map',
    file: 'File', edit: 'Edit', view: 'View', help: 'Help', window: 'Window',
    new: 'New project…', open: 'Open project…', save: 'Save', saveAs: 'Save as…', copy: 'Save a copy…',
    build: 'Build game…', drive: 'Google Drive…', quit: 'Quit', theme: 'Toggle theme', langRu: 'Русский', langEn: 'English', language: 'Language',
    helpOpen: 'Help', renpy: 'Ren\'Py website', about: 'About', zoomReset: 'Interface zoom: 100%',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', fullscreen: 'Full screen', reload: 'Reload', devtools: 'Developer tools',
    projFilter: 'Story Map project', allFilter: 'All files', zipFilter: 'ZIP archive',
    openTitle: 'Open project', saveTitle: 'Save project', pickDir: 'Where to write the game',
    pickDirBtn: 'Choose folder', ok: 'Done',
    rpPickSdk: 'Ren\'Py SDK folder (the one with renpy.exe / renpy.sh)', rpPickProj: 'Ren\'Py project folder (it contains the game folder)', rpCut: '… output truncated …', rpRetry: '↻ This Ren\'Py does not know --no-launch — retrying without it',
    overwriteTitle: 'The folder already has files',
    overwriteText: n => `The chosen folder already contains ${n} file(s) with the same names. They will be replaced by the new build.`,
    overwriteDetail: 'Other files in the folder stay untouched. Files from the previous build that are no longer in the project will be deleted.',
    overwrite: 'Replace', cancel: 'Cancel',
    unsavedTitle: 'Save changes?',
    unsavedText: n => `Project “${n}” has changes that are not saved to a file yet.`,
    saveBtn: 'Save', dontSave: 'Don\'t save',
    aboutText: v => `Story Map ${v}\nVisual novel builder: story map, scripts, assets and a Ren'Py compiler.\n\nDesktop edition on Electron ${process.versions.electron}, Chromium ${process.versions.chrome}.\nInter font — SIL Open Font License.`,
    errWrite: 'Could not write the file',
    badNames: 'Invalid file names in the build: ',
    launcher: 'Start screen…', update: 'Update the app…',
    updTitle: 'Update file', updFilter: 'Update (ZIP or index.html)',
    updErr: {
      empty: 'The file is empty.', 'zip-too-big': 'The file is too large for an update.', 'bad-size': 'The file size does not look like the app page.',
      'zip-bad': 'The archive is damaged or cannot be opened.', 'zip-encrypted': 'The archive is password-protected.', 'zip-method': 'The archive uses an unsupported compression.',
      'no-index': 'There is no index.html in the archive.', 'not-html': 'This is not an update file: a ZIP archive or index.html is needed.',
      'no-stamp': 'This is not a Story Map page: it has no build stamp.', 'hash-mismatch': 'Checksum mismatch: the file is damaged or was changed.',
      'needs-shell': 'This update needs a newer app shell. Reinstall the app once.', 'bad-url': 'The link must start with https://',
      'http-fail': 'Could not download the file', 'too-big': 'The file is too large.', 'gh-no-asset': 'The latest GitHub release has no vnmap-update-….zip file.', 'no-staged': 'Choose an update file first.', 'timeout': 'The server takes too long to answer.',
    },
  },
};
const T = () => STR[lang] || STR.ru;

/* ---------- настройки окна ---------- */
const settingsFile = () => path.join(app.getPath('userData'), 'window.json');
function loadWinSettings() { try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')); } catch (e) { return {}; } }
function saveWinSettings() {
  if (!win || win.isDestroyed()) return;
  try {
    const b = win.getNormalBounds();
    fs.writeFileSync(settingsFile(), JSON.stringify({ bounds: b, max: win.isMaximized(), lang, lastDir, projectPath, updateUrl: lastUpdateUrl }));
  } catch (e) { /* не страшно */ }
}

/* ---------- безопасность ---------- */
const isOwnUrl = url => { try { const u = new URL(url); return u.protocol === SCHEME + ':' && u.host === HOST; } catch (x) { return false; } };
const trusted = e => !!(e && e.senderFrame && isOwnUrl(e.senderFrame.url));
const sat = createSat({
  app, BrowserWindow, ipcMain, screen, trusted: e => trusted(e), getMain: () => win, frameOpts: tool => frameOpts(tool), frameExtras: (w, o) => frameExtras(w, o),
  pageUrl: hash => `${SCHEME}://${HOST}/index.html${hash || ''}`, backgroundColor: () => (nativeTheme.shouldUseDarkColors ? '#1c1c1e' : '#f2f2f7'),
  iconPath: path.join(__dirname, 'build', 'icon.png'), title: () => T().appName,
});
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
const CSP = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob: data:; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

function registerProtocol() {
  protocol.handle(SCHEME, async req => {
    try {
      const u = new URL(req.url);
      if (u.host !== HOST) return new Response('not found', { status: 404 });
      let rel = decodeURIComponent(u.pathname);
      if (rel === '/' || rel === '') rel = '/index.html';
      /* установленное обновление важнее встроенной страницы; чего в нём нет (например, шрифтов), берём из встроенной */
      let base = APP_DIR, file = path.normalize(path.join(APP_DIR, rel));
      if (overrideDir) {
        const f2 = path.normalize(path.join(overrideDir, rel));
        if (f2.startsWith(overrideDir + path.sep) && fs.existsSync(f2)) { base = overrideDir; file = f2; }
      }
      if (file !== base && !file.startsWith(base + path.sep)) return new Response('forbidden', { status: 403 });
      const buf = await fsp.readFile(file);
      return new Response(buf, { headers: { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-cache' } });
    } catch (e) { return new Response('not found', { status: 404 }); }
  });
}

/* ---------- файлы ---------- */
const isProjectFile = p => PROJECT_EXTS.includes(path.extname(p).toLowerCase());
function findFileArg(argv) {
  for (const a of argv.slice(1)) {
    if (!a || a.startsWith('-')) continue;
    if (isProjectFile(a)) { try { if (fs.statSync(a).isFile()) return path.resolve(a); } catch (e) { /* нет такого */ } }
  }
  return null;
}
async function readProjectFile(p) {
  const buf = await fsp.readFile(p);
  return { name: path.basename(p), path: p, bytes: new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) };
}
async function atomicWrite(p, data) {
  const tmp = p + '.tmp-' + process.pid;
  await fsp.writeFile(tmp, data);
  try { await fsp.rename(tmp, p); }
  catch (e) { try { await fsp.copyFile(tmp, p); } finally { await fsp.rm(tmp, { force: true }); } }
}
const toBuffer = d => (typeof d === 'string' ? Buffer.from(d, 'utf8') : Buffer.from(d.buffer ? d.buffer : d, d.byteOffset || 0, d.byteLength));
function safeFileName(n) { return String(n || 'project').replace(/[\\/:*?"<>|\x00-\x1f]+/g, '_').replace(/^\.+/, '').slice(0, 120) || 'project'; }
const filtersFor = (names) => {
  const T_ = T(), out = [];
  if (names.includes('vnmap')) out.push({ name: T_.projFilter, extensions: ['vnmap'] });
  if (names.includes('zip')) out.push({ name: T_.zipFilter, extensions: ['zip'] });
  if (names.includes('json')) out.push({ name: 'JSON', extensions: ['json'] });
  if (names.includes('all')) out.push({ name: T_.allFilter, extensions: ['*'] });
  return out;
};
function extFilters(name) {
  const e = path.extname(name).slice(1).toLowerCase();
  const map = { vnmap: ['vnmap', 'all'], zip: ['zip', 'all'], json: ['json', 'all'], svg: [], md: [], txt: [] };
  if (e in map && map[e].length) return filtersFor(map[e]);
  if (e) return [{ name: e.toUpperCase(), extensions: [e] }, ...filtersFor(['all'])];
  return filtersFor(['all']);
}

/* запись собранной игры в папку: безопасные относительные пути + манифест для чистки старых файлов */
/* ---------- недавние проекты ---------- */
const recentFile = () => path.join(app.getPath('userData'), 'recent.json');
function recentLoad() { try { const j = JSON.parse(fs.readFileSync(recentFile(), 'utf8')); return Array.isArray(j) ? j.filter(x => x && typeof x.path === 'string').slice(0, RECENT_MAX * 2) : []; } catch (e) { return []; } }
function recentSave(list) { try { fs.writeFileSync(recentFile(), JSON.stringify(list.slice(0, RECENT_MAX))); } catch (e) { /* не страшно */ } }
function recentAdd(p) {
  if (!p || path.extname(p).toLowerCase() !== '.vnmap') return;
  recentSave([{ path: p, time: Date.now() }, ...recentLoad().filter(x => x.path !== p)]);
}
async function recentInfo() {
  const out = [];
  for (const r of recentLoad().slice(0, RECENT_MAX)) {
    const e = { path: r.path, name: path.basename(r.path).replace(/\.vnmap$/i, ''), dir: path.dirname(r.path), time: +r.time || 0, exists: false, size: 0, mtime: 0 };
    try { const st = await fsp.stat(r.path); if (st.isFile()) { e.exists = true; e.size = st.size; e.mtime = st.mtimeMs; } } catch (x) { /* файла больше нет */ }
    out.push(e);
  }
  return out;
}

/* ---------- GitHub ---------- */
const GH_BASE = (() => { const m = DEV && process.env.VNMAP_GITHUB_MOCK; return m && /^http:\/\/127\.0\.0\.1:\d+$/.test(m) ? m : 'https://api.github.com'; })();

/* ---------- обновление страницы программы ---------- */
const MAX_DOWNLOAD = 120 * 1048576;
const updMsg = code => (T().updErr && T().updErr[code]) || code;
function updFail(e) { const err = new Error(updMsg(e && e.message)); err.code = e && e.message; return err; }
function stageResult(cand, source) {
  const token = crypto.randomBytes(12).toString('hex');
  staged = { token, cand, source, at: Date.now() };
  const act = updater.active(), bun = updater.bundled(), cur = (act && act.build) || (bun && bun.build) || '';
  return { token, build: cand.build, version: cand.version, size: cand.size, sha256: cand.sha256, source, cmp: cur ? compareBuild(cand.build, cur) : 1, needs: cand.needs, needsShell: cand.needs > BRIDGE };
}
async function fetchLimited(url, limit) {
  const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 90000);
  try {
    const res = await net.fetch(url, { signal: ac.signal, redirect: 'follow', cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });   // GitHub разрешает кэшировать сведения о выпуске на минуту: после публикации нужна свежая версия
    const fin = (() => { try { return new URL(res.url || url); } catch (e) { return null; } })();
    if (!res.ok || !fin || !(fin.protocol === 'https:' || (DEV && fin.protocol === 'http:' && fin.hostname === '127.0.0.1'))) throw new Error('http-fail');
    const len = +res.headers.get('content-length') || 0; if (len > limit) throw new Error('too-big');
    const chunks = []; let got = 0; const rd = res.body.getReader();
    for (;;) { const { done, value } = await rd.read(); if (done) break; got += value.length; if (got > limit) { ac.abort(); throw new Error('too-big'); } chunks.push(Buffer.from(value)); }
    return Buffer.concat(chunks);
  } catch (e) { if (e && e.name === 'AbortError') throw new Error('timeout'); throw e; } finally { clearTimeout(timer); }
}
async function downloadUpdate(url, expect) {
  let u; try { u = new URL(String(url || '').trim()); } catch (e) { throw new Error('bad-url'); }
  const devHttp = DEV && u.protocol === 'http:' && u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !devHttp) throw new Error('bad-url');
  const gh = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(u.href);
  if (gh) {
    const info = JSON.parse((await fetchLimited(`${GH_BASE}/repos/${gh[1]}/${gh[2]}/releases/latest`, 4 * 1048576)).toString('utf8'));
    const a = (info.assets || []).find(x => /^vnmap-update.*\.(zip|html)$/i.test(x.name || ''));
    if (!a || !(/^https:\/\//.test(a.browser_download_url || '') || (DEV && /^http:\/\/127\.0\.0\.1:\d+\//.test(a.browser_download_url || '')))) throw new Error('gh-no-asset');
    u = new URL(a.browser_download_url);
  }
  if (GH_BASE !== 'https://api.github.com' && u.host === 'raw.githubusercontent.com') u = new URL(GH_BASE + '/raw' + u.pathname);   // только автотесты
  let buf = await fetchLimited(u.href, MAX_DOWNLOAD);
  if (buf[0] === 0x7b) {   // «{» — это файл-указатель: { "url": "...zip", "sha256": "..." }
    let m; try { m = JSON.parse(buf.toString('utf8')); } catch (e) { throw new Error('not-html'); }
    const t2 = new URL(String(m.url || ''), u);
    if (t2.protocol !== 'https:' && !(DEV && t2.protocol === 'http:' && t2.hostname === '127.0.0.1')) throw new Error('bad-url');
    if (!expect && typeof m.sha256 === 'string') expect = m.sha256;
    u = t2; buf = await fetchLimited(u.href, MAX_DOWNLOAD);
  }
  expect = String(expect || '').trim().toLowerCase();
  if (expect && sha256(buf) !== expect) throw new Error('hash-mismatch');
  return { buf, name: path.basename(u.pathname) || 'update', host: u.host };
}

/* ---------- GitHub: запросы к API и токен доступа ----------
   Окно программы само в сеть не ходит (его защита это запрещает), поэтому все запросы к GitHub делает оболочка.
   Токен хранится только здесь (зашифрованным средствами системы, если они есть) и странице не передаётся. */
const ghFile = () => path.join(app.getPath('userData'), 'github.json');
const GH_PATH = /^\/(?:user|repos\/[\w.-]+\/[\w.-]+(?:\/[\w%.~!$&'()*+,;=:@/-]*)?)(?:\?[\w%.~!$&'()*+,;=:@/?-]*)?$/;
const GH_MAX = 110 * 1048576;
let ghTok = null, ghLogin = '', ghEnc = true;
function ghLoad() {
  ghTok = null; ghLogin = '';
  try {
    const j = JSON.parse(fs.readFileSync(ghFile(), 'utf8')), raw = Buffer.from(String(j.tok || ''), 'base64');
    ghLogin = String(j.login || ''); ghEnc = j.enc !== false;
    if (raw.length) ghTok = ghEnc ? safeStorage.decryptString(raw) : raw.toString('utf8');
  } catch (e) { ghTok = null; }
}
function ghSave() {
  if (!ghTok) { try { fs.rmSync(ghFile(), { force: true }); } catch (e) { /* уже нет */ } return; }
  ghEnc = safeStorage.isEncryptionAvailable();
  const buf = ghEnc ? safeStorage.encryptString(ghTok) : Buffer.from(ghTok, 'utf8');
  fs.writeFileSync(ghFile(), JSON.stringify({ tok: buf.toString('base64'), enc: ghEnc, login: ghLogin }), { mode: 0o600 });
}
async function ghRequest(o) {
  o = o || {};
  const method = String(o.method || 'GET').toUpperCase(), pth = String(o.path || '');
  /* GET и PUT — чтение и запись файла проекта; POST — только создание ветки (/git/refs, имя refs/heads/…): ветка автора для проверки правок */
  let postOk = false;
  if (method === 'POST' && /^\/repos\/[\w.-]+\/[\w.-]+\/git\/refs$/.test(pth) && o.body != null) {
    try { const b = typeof o.body === 'string' ? JSON.parse(o.body) : o.body; postOk = !!b && typeof b.ref === 'string' && /^refs\/heads\/[\w./-]{1,100}$/.test(b.ref) && !b.ref.includes('..') && /^[0-9a-f]{40}$/i.test(String(b.sha || '')); } catch (e) { postOk = false; }
  }
  if (!(['GET', 'PUT'].includes(method) || postOk) || !GH_PATH.test(pth) || pth.includes('..')) throw new Error('gh:bad_request:запрос не разрешён');
  const headers = { Accept: o.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'VNMap', 'Cache-Control': 'no-cache', Pragma: 'no-cache' };   // GitHub разрешает кэшировать ответы на минуту: нам нужна свежая версия файла
  if (ghTok) headers.Authorization = 'Bearer ' + ghTok;
  if (o.etag) headers['If-None-Match'] = String(o.etag).slice(0, 200);
  let body;
  if (o.body != null) { body = typeof o.body === 'string' ? o.body : JSON.stringify(o.body); headers['Content-Type'] = 'application/json'; if (body.length > GH_MAX) throw new Error('gh:too_big:файл слишком большой для GitHub'); }
  const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 90000);
  try {
    const res = await net.fetch(GH_BASE + pth, { method, headers, body, signal: ac.signal, redirect: 'follow', cache: 'no-store' });
    const text = await res.text();
    if (text.length > GH_MAX) throw new Error('gh:too_big:ответ GitHub слишком большой');
    return { status: res.status, etag: res.headers.get('etag') || '', remaining: res.headers.get('x-ratelimit-remaining') || '', text };
  } catch (e) {
    if (e && /^gh:/.test(e.message)) throw e;
    throw new Error('gh:network:' + (e && e.name === 'AbortError' ? 'сервер слишком долго не отвечает' : 'нет связи с GitHub'));
  } finally { clearTimeout(timer); }
}

/* ---------- уведомления в Telegram и Discord ----------
   Как и GitHub: страница в сеть не ходит, секреты (токен бота, ссылка вебхука) живут только здесь, зашифрованные системой. */
let nt = null;
function getNt() {
  if (!nt) { nt = new Notifier({ file: path.join(app.getPath('userData'), 'notify.json'), fetch: (u, o) => net.fetch(u, o), safeStorage }); nt.load(); }
  return nt;
}
let ntLast = 0;
const ntWrap = async fn => {
  try { return Object.assign({ ok: true }, await fn()); }
  catch (e) { const m = /^nt:(\w+)/.exec(e && e.message || ''); return { ok: false, code: m ? m[1] : 'fail' }; }
};

/* ---------- Google Диск ---------- */
let gd = null;
function testEndpoints() {
  /* Только для автотестов: имитация Google на localhost, и только вместе с флагом --dev. */
  const base = DEV && process.env.VNMAP_GOOGLE_MOCK;
  if (!base || !/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) return undefined;
  return { auth: base + '/o/oauth2/v2/auth', token: base + '/token', revoke: base + '/revoke', api: base + '/drive/v3', upload: base + '/upload/drive/v3' };
}
function getGd() {
  if (!gd) gd = new GDrive({ dir: app.getPath('userData'), defaultsPath: path.join(__dirname, 'google-oauth.json'), net, safeStorage, openUrl: u => shell.openExternal(u), endpoints: testEndpoints() });
  return gd;
}

/* ---------- IPC ---------- */

/* ---------- обновление самой оболочки (установленной программы) ----------
   Репозиторий задан здесь, а не страницей: замена программы — самое рискованное действие, адрес подставить не должен никто. */
const SHELL_REPO = 'Gamers-U/VNmap';
let suHost = null, suFile = '';
function getSu() {
  if (!suHost) suHost = new ShellUpdater({
    version: app.getVersion(), platform: process.platform, arch: process.arch,
    env: { APPIMAGE: process.env.APPIMAGE, PORTABLE_EXECUTABLE_FILE: process.env.PORTABLE_EXECUTABLE_FILE },
    repo: SHELL_REPO, apiBase: GH_BASE, fetch: (u, o) => net.fetch(u, o),
    dir: path.join(app.getPath('userData'), 'shell-update'), downloads: app.getPath('downloads'), allowHttp: DEV && GH_BASE !== 'https://api.github.com',
  });
  return suHost;
}
async function suApply() {
  const plan = await getSu().plan(suFile);
  if (plan.run) { const c = spawn(plan.run[0], plan.run[1], { detached: true, stdio: 'ignore' }); c.on('error', () => { }); c.unref(); }
  else if (plan.relaunch) {
    /* новая копия стартует уже после выхода этой: иначе её не пустит защита от второго запуска */
    const c = spawn('/bin/sh', ['-c', 'sleep 1.5; exec "$0"', plan.relaunch], { detached: true, stdio: 'ignore' }); c.on('error', () => { }); c.unref();
  } else if (plan.reveal) { shell.showItemInFolder(plan.reveal); }
  if (plan.quit) setTimeout(() => { forceClose = true; closing = false; app.quit(); }, 400);
  return { quit: !!plan.quit, reveal: plan.reveal || '' };
}

/* ---------- Ren'Py: запуск настоящего движка ---------- */
async function askOverwrite(n) {
  const T_ = T();
  const c = await dialog.showMessageBox(win, { type: 'warning', buttons: [T_.overwrite, T_.cancel], defaultId: 1, cancelId: 1, title: T_.overwriteTitle, message: T_.overwriteText(n), detail: T_.overwriteDetail });
  return c.response === 0;
}
let rpHost = null;
function getRp() {
  if (!rpHost) rpHost = new RenpyHost({
    file: path.join(app.getPath('userData'), 'renpy.json'),
    emit: ev => { try { if (win && !win.isDestroyed()) win.webContents.send('rp:evt', ev); } catch (e) { /* окно закрывается */ } },
    confirm: askOverwrite, version: () => app.getVersion(),
    strings: () => ({ badNames: T().badNames, errWrite: T().errWrite, cut: T().rpCut, retryNoLaunch: T().rpRetry }),
  });
  return rpHost;
}

function registerIpc() {
  sat.registerIpc();
  const handle = (ch, fn) => ipcMain.handle(ch, async (e, ...a) => { if (!trusted(e)) throw new Error('untrusted'); return fn(e, ...a); });

  handle('desk:ready', async () => {
    rendererReady = true; const o = pendingOpen; pendingOpen = null;
    const launcher = launcherPending && !o; launcherPending = false;
    const notice = bootNotice; bootNotice = null;
    updater.markBooted();                 // страница дошла до связи с оболочкой: установленное обновление считается рабочим
    return { platform: process.platform, version: app.getVersion(), bridge: BRIDGE, open: o, path: projectPath, launcher, notice };
  });

  handle('desk:recent', async () => recentInfo());
  handle('desk:recentForget', async (e, p) => { recentSave(recentLoad().filter(x => x.path !== p)); return recentInfo(); });
  handle('desk:recentClear', async () => { recentSave([]); return []; });

  /* обновление страницы: файл или ссылка → проверка → подтверждение страницей → установка и перезагрузка */
  handle('upd:info', async () => ({ ...updater.info(), shell: app.getVersion(), electron: process.versions.electron, url: lastUpdateUrl }));
  handle('upd:pickFile', async () => {
    const r = await dialog.showOpenDialog(win, { title: T().updTitle, defaultPath: lastDir || app.getPath('downloads'), properties: ['openFile'], filters: [{ name: T().updFilter, extensions: ['zip', 'html', 'htm'] }, ...filtersFor(['all'])] });
    if (r.canceled || !r.filePaths[0]) return null;
    try {
      const st = await fsp.stat(r.filePaths[0]); if (st.size > MAX_DOWNLOAD) throw new Error('too-big');
      const cand = stageUpdate(await fsp.readFile(r.filePaths[0]), r.filePaths[0]);
      return stageResult(cand, path.basename(r.filePaths[0]));
    } catch (e) { throw updFail(e); }
  });
  handle('upd:fromUrl', async (e, url, expect) => {
    try {
      const d = await downloadUpdate(url, expect);
      const cand = stageUpdate(d.buf, d.name);
      lastUpdateUrl = String(url).trim().slice(0, 400); saveWinSettings();
      return stageResult(cand, d.host + '/' + d.name);
    } catch (e2) { throw updFail(e2); }
  });
  handle('upd:apply', async (e, token) => {
    if (!staged || staged.token !== token || Date.now() - staged.at > 10 * 60 * 1000) throw updFail(new Error('no-staged'));
    const st = staged; staged = null;
    try { await updater.install(st.cand, st.source); } catch (err) { throw updFail(err); }
    overrideDir = updater.activeDir(); bootNotice = { updated: st.cand.build, version: st.cand.version };
    saveWinSettings();
    setTimeout(() => { if (win && !win.isDestroyed()) { rendererReady = false; win.webContents.reloadIgnoringCache(); } }, 150);
    return true;
  });
  handle('upd:reset', async () => {
    await updater.reset(); overrideDir = null; bootNotice = { reset: true };
    setTimeout(() => { if (win && !win.isDestroyed()) { rendererReady = false; win.webContents.reloadIgnoringCache(); } }, 150);
    return true;
  });

  /* GitHub */
  handle('gh:status', async () => ({ hasToken: !!ghTok, login: ghLogin, encrypted: ghEnc && safeStorage.isEncryptionAvailable() }));
  handle('gh:setToken', async (e, tok) => {
    tok = String(tok || '').trim();
    if (!/^[\w-]{20,255}$/.test(tok)) throw new Error('gh:auth:Это не похоже на токен GitHub');
    const prev = { tok: ghTok, login: ghLogin };
    ghTok = tok;
    try {
      const r = await ghRequest({ path: '/user' });
      if (r.status !== 200) throw new Error('gh:auth:GitHub не принял токен (код ' + r.status + ')');
      ghLogin = String((JSON.parse(r.text) || {}).login || ''); ghSave();
      return { login: ghLogin };
    } catch (err) { ghTok = prev.tok; ghLogin = prev.login; throw err; }
  });
  handle('gh:clearToken', async () => { ghTok = null; ghLogin = ''; ghSave(); return true; });
  handle('gh:request', async (e, o) => ghRequest(o));

  /* Уведомления */
  handle('nt:status', async () => getNt().status());
  handle('nt:setTelegram', async (e, o) => ntWrap(async () => ({ st: getNt().setTelegram(o) })));
  handle('nt:setDiscord', async (e, o) => ntWrap(async () => ({ st: getNt().setDiscord(o) })));
  handle('nt:clear', async (e, which) => ntWrap(async () => ({ st: getNt().clear(['tg', 'dc', 'all'].includes(which) ? which : 'all') })));
  handle('nt:find', async () => ntWrap(async () => ({ st: await getNt().findTelegramChat() })));
  handle('nt:send', async (e, text, only) => ntWrap(async () => {
    if (Date.now() - ntLast < 800) throw new Error('nt:rate');                // страница не должна заваливать сервисы
    ntLast = Date.now();
    return { res: await getNt().send(String(text || '').slice(0, 4000), { only: only === 'tg' || only === 'dc' ? only : '' }) };
  }));
  handle('nt:mine', async (e, memberId) => ntWrap(async () => ({ line: getNt().getMine(memberId) })));
  handle('nt:farewell', async (e, f) => { getNt().setFarewell(f && typeof f === 'object' ? { text: String(f.text || '').slice(0, 4000), since: f.since, min: f.min } : null); return true; });

  handle('desk:setLang', async (e, l) => { if (l === 'ru' || l === 'en') { lang = l; buildMenu(); applyTitle(); saveWinSettings(); } return true; });

  handle('desk:setState', async (e, st) => {
    uiState = { name: String(st && st.name || ''), dirty: !!(st && st.dirty), bound: !!(st && st.bound) };
    applyTitle(); return true;
  });

  /* «Сохранить как…» / «Сохранить копию…» / скачивание любых файлов */
  handle('desk:saveFile', async (e, name, data) => {
    const base = safeFileName(name);
    const def = path.join(lastDir || app.getPath('documents'), base);
    const r = await dialog.showSaveDialog(win, { title: T().saveTitle, defaultPath: def, filters: extFilters(base) });
    if (r.canceled || !r.filePath) return null;
    try { await atomicWrite(r.filePath, toBuffer(data)); } catch (err) { throw new Error(T().errWrite + ': ' + err.message); }
    lastDir = path.dirname(r.filePath); saveWinSettings();
    return { path: r.filePath };
  });

  /* сохранить проект: в привязанный файл или (saveAs / первый раз) через диалог */
  handle('desk:saveProject', async (e, name, data, saveAs) => {
    let target = !saveAs && projectPath ? projectPath : '';
    if (!target) {
      let base = safeFileName(name); base = base.replace(/\.(vnmap|zip|json)$/i, '').replace(/\.vnmap$/i, '') + '.vnmap';
      const def = projectPath ? path.join(path.dirname(projectPath), base) : path.join(lastDir || app.getPath('documents'), base);
      const r = await dialog.showSaveDialog(win, { title: T().saveTitle, defaultPath: def, filters: filtersFor(['vnmap', 'all']) });
      if (r.canceled || !r.filePath) return null;
      target = /\.[A-Za-z0-9]+$/.test(path.basename(r.filePath)) ? r.filePath : r.filePath + '.vnmap';
    }
    try { await atomicWrite(target, toBuffer(data)); } catch (err) { throw new Error(T().errWrite + ': ' + err.message); }
    projectPath = target; lastDir = path.dirname(target); saveWinSettings(); recentAdd(target);
    return { path: target, name: path.basename(target) };
  });

  handle('desk:bind', async (e, p) => { projectPath = typeof p === 'string' && path.extname(p).toLowerCase() === '.vnmap' ? p : ''; saveWinSettings(); return projectPath; });
  handle('desk:unbind', async () => { projectPath = ''; saveWinSettings(); return true; });
  /* лёгкая проверка «файл проекта изменился?» для совместной работы через общий файл */
  handle('desk:stat', async () => { if (!projectPath) return null; try { const st = await fsp.stat(projectPath); return { sig: Math.round(st.mtimeMs) + ':' + st.size, size: st.size, mtime: st.mtimeMs }; } catch (err) { return null; } });

  /* ---- снимки проекта рядом с файлом .vnmap (1.6.13): папка «<имя проекта> (snapshots)», в ней файлы вида 2026-11-16_20-41-33_auto.json ---- */
  const SNAP_STAMP = /^\d{4}-\d\d-\d\d_\d\d-\d\d-\d\d$/, SNAP_NAME = /^(\d{4}-\d\d-\d\d_\d\d-\d\d-\d\d)_(auto|safe|named)(?:_([^\\/:*?"<>|\x00-\x1f]{1,80}))?\.json$/;
  const snapDir = () => {
    if (!projectPath) return '';
    const base = path.basename(projectPath).replace(/\.vnmap$/i, '');
    return path.join(path.dirname(projectPath), safeFileName(base) + ' (snapshots)');
  };
  handle('sn:info', async () => {
    const dir = snapDir(); if (!dir) return { ok: false, code: 'nobind' };
    const items = [];
    try {
      for (const n of await fsp.readdir(dir)) {
        const m = SNAP_NAME.exec(n); if (!m) continue;
        let st; try { st = await fsp.stat(path.join(dir, n)); } catch (err) { continue; }
        if (!st.isFile()) continue;
        items.push({ file: n, stamp: m[1], kind: m[2], label: m[3] || '', size: st.size, mtime: Math.round(st.mtimeMs) });
      }
    } catch (err) { /* папки ещё нет: снимков пока не было */ }
    items.sort((a, b) => b.stamp.localeCompare(a.stamp) || b.mtime - a.mtime);
    return { ok: true, dir, items };
  });
  handle('sn:save', async (e, o) => {
    const dir = snapDir(); if (!dir) return { ok: false, code: 'nobind' };
    if (!o || o.path !== projectPath) return { ok: false, code: 'moved' };         // за время записи проект успели привязать к другому файлу или отвязать
    if (typeof o.text !== 'string' || !SNAP_STAMP.test(String(o.stamp)) || !['auto', 'safe', 'named'].includes(o.kind)) return { ok: false, code: 'bad' };
    const label = o.kind === 'named' ? String(o.label || '').replace(/[\\/:*?"<>|\x00-\x1f]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, 60).trim() : '';
    const file = o.stamp + '_' + o.kind + (label ? '_' + label : '') + '.json';
    try {
      await fsp.mkdir(dir, { recursive: true });
      await atomicWrite(path.join(dir, file), toBuffer(o.text));
    } catch (err) { return { ok: false, code: 'write', msg: String(err.message || err) }; }
    /* лишние автокопии и страховки удаляем: хранятся столько же, сколько внутри программы; свои снимки не трогаем */
    const keep = { auto: Math.max(1, Math.min(200, Math.round(+o.keepAuto) || 15)), safe: Math.max(1, Math.min(200, Math.round(+o.keepSafe) || 10)) };
    try {
      const all = [];
      for (const n of await fsp.readdir(dir)) { const m = SNAP_NAME.exec(n); if (m && (m[2] === 'auto' || m[2] === 'safe')) all.push({ n, stamp: m[1], kind: m[2] }); }
      for (const kind of ['auto', 'safe']) {
        const mine = all.filter(x => x.kind === kind).sort((a, b) => b.stamp.localeCompare(a.stamp));
        for (const x of mine.slice(keep[kind])) { try { await fsp.unlink(path.join(dir, x.n)); } catch (err) { /* не страшно */ } }
      }
    } catch (err) { /* не страшно */ }
    return { ok: true, file, dir };
  });
  handle('sn:read', async (e, file) => {
    const dir = snapDir(); if (!dir || typeof file !== 'string' || !SNAP_NAME.test(file)) return null;
    try { return await fsp.readFile(path.join(dir, file), 'utf8'); } catch (err) { return null; }
  });
  handle('sn:remove', async (e, file) => {
    const dir = snapDir(); if (!dir || typeof file !== 'string' || !SNAP_NAME.test(file)) return false;
    try { await fsp.unlink(path.join(dir, file)); return true; } catch (err) { return false; }
  });

  handle('desk:openDialog', async () => {
    const r = await dialog.showOpenDialog(win, { title: T().openTitle, defaultPath: lastDir || app.getPath('documents'), properties: ['openFile'], filters: [{ name: T().projFilter, extensions: ['vnmap', 'zip', 'json'] }, ...filtersFor(['all'])] });
    if (r.canceled || !r.filePaths[0]) return null;
    lastDir = path.dirname(r.filePaths[0]); saveWinSettings(); recentAdd(r.filePaths[0]);
    return readProjectFile(r.filePaths[0]);
  });
  handle('desk:readPath', async (e, p) => { if (typeof p !== 'string' || !isProjectFile(p)) return null; try { const f = await readProjectFile(p); recentAdd(p); return f; } catch (err) { return null; } });

  /* запись собранной игры */
  handle('desk:writeBuild', async (e, entries, opts) => {
    if (!Array.isArray(entries) || !entries.length) return null;
    const r = await dialog.showOpenDialog(win, { title: T().pickDir, buttonLabel: T().pickDirBtn, defaultPath: lastDir || app.getPath('documents'), properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    const res = await writeBuildFiles(r.filePaths[0], entries, { version: app.getVersion(), clash: 'all', strings: T(), confirm: askOverwrite });
    if (res) { lastDir = res.dir; saveWinSettings(); }
    return res;
  });



  /* обновление оболочки: проверка → скачивание с прогрессом → установка */
  handle('su:check', async () => { const c = await getSu().check(); return { current: c.current, latest: c.latest, tag: c.tag, htmlUrl: c.htmlUrl, newer: c.newer, newLine: c.newLine, mode: c.mode, name: c.asset ? c.asset.name : '', size: c.asset ? c.asset.size : 0, notes: c.notes, portable: !!process.env.PORTABLE_EXECUTABLE_FILE, platform: process.platform }; });
  handle('su:download', async () => {
    const d = await getSu().download((got, total) => { try { if (win && !win.isDestroyed()) win.webContents.send('su:evt', { got, total }); } catch (e) { /* окно закрывается */ } });
    suFile = d.file;
    return { name: d.name, size: d.size, verified: d.verified, mode: d.mode };
  });
  handle('su:apply', async () => { if (!suFile) throw new Error('su-noasset'); return suApply(); });

  /* Ren'Py: папки выбирает человек в диалогах; запуск и вывод — в renpy.js */
  handle('rp:status', async (e, key) => getRp().status(key));
  handle('rp:pickSdk', async () => {
    const r = await dialog.showOpenDialog(win, { title: T().rpPickSdk, buttonLabel: T().pickDirBtn, defaultPath: lastDir || app.getPath('home'), properties: ['openDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    return getRp().setSdk(r.filePaths[0]);
  });
  handle('rp:clearSdk', async () => getRp().clearSdk());
  handle('rp:pickProject', async (e, key) => {
    const r = await dialog.showOpenDialog(win, { title: T().rpPickProj, buttonLabel: T().pickDirBtn, defaultPath: lastDir || app.getPath('home'), properties: ['openDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    return getRp().setProject(key, r.filePaths[0]);
  });
  handle('rp:clearProject', async (e, key) => getRp().clearProject(key));

  /* окно «Редактор кода»: файлы только внутри выбранной папки проекта Ren'Py (проверки путей в projfs.js) */
  const pfs = new ProjFs({ getRoot: key => getRp().projectDir(key), trash: p => shell.trashItem(p), reveal: p => shell.showItemInFolder(p) });
  handle('pf:info', async (e, key) => pfs.info(key));
  handle('pf:list', async (e, key, rel) => pfs.list(key, rel));
  handle('pf:files', async (e, key) => pfs.files(key));
  handle('pf:read', async (e, key, rel) => pfs.read(key, rel));
  handle('pf:write', async (e, key, rel, o) => pfs.write(key, rel, o));
  handle('pf:create', async (e, key, rel, kind) => pfs.create(key, rel, kind === 'dir' ? 'dir' : 'file'));
  handle('pf:rename', async (e, key, from, to) => pfs.rename(key, from, to));
  handle('pf:remove', async (e, key, rel) => pfs.remove(key, rel));
  handle('pf:stat', async (e, key, rels) => pfs.stat(key, rels));
  handle('pf:reveal', async (e, key, rel) => pfs.showInFolder(key, rel));
  handle('rp:write', async (e, key, entries) => getRp().write(key, entries));
  handle('rp:start', async (e, key, kind, opts) => getRp().start(key, kind, opts && typeof opts === 'object' ? opts : {}));
  handle('rp:stop', async (e, id) => getRp().stop(id));

  handle('desk:showInFolder', async (e, p) => { if (typeof p === 'string' && p && fs.existsSync(p)) { const st = fs.statSync(p); if (st.isDirectory()) await shell.openPath(p); else shell.showItemInFolder(p); return true; } return false; });
  handle('desk:openExternal', async (e, url) => { try { const u = new URL(url); if (u.protocol === 'https:' || u.protocol === 'http:') { await shell.openExternal(u.href); return true; } } catch (err) { /* нет */ } return false; });

  /* Google Диск: страница получает только результаты, токены остаются здесь */
  handle('gd:status', async () => getGd().status());
  handle('gd:getConfig', async () => getGd().configInfo());
  handle('gd:setConfig', async (e, c) => getGd().setConfig(c));
  handle('gd:signIn', async () => getGd().signIn());
  handle('gd:cancelSignIn', async () => { getGd().cancelSignIn(); return true; });
  handle('gd:signOut', async () => getGd().signOut());
  handle('gd:about', async () => getGd().about());
  handle('gd:find', async (e, f) => getGd().find(f));
  handle('gd:folder', async (e, name, parentId, props) => getGd().createFolder(name, parentId, props));
  handle('gd:update', async (e, id, patch) => getGd().update(id, patch || {}));
  handle('gd:trash', async (e, id) => getGd().trash(id));
  handle('gd:get', async (e, id) => getGd().get(id));
  handle('gd:upload', async (e, o) => getGd().upload(o || {}));
  handle('gd:download', async (e, id) => getGd().download(id));

  /* полоска сверху: действия с окном и цвет системных кнопок (цвет берётся у полоски страницы, чтобы они сливались с темой) */
  ipcMain.on('desk:win', (e, a) => {
    const w = trusted(e) ? winOf(e) : null; if (!w) return;
    if (a === 'minimize') w.minimize();
    else if (a === 'maximize') { if (w.isMaximized()) w.unmaximize(); else w.maximize(); }
    else if (a === 'fullscreen') w.setFullScreen(!w.isFullScreen());
    else if (a === 'close') w.close();
    else if (a === 'zoomin' || a === 'zoomout' || a === 'zoomreset') { const wc = w.webContents; wc.setZoomLevel(a === 'zoomreset' ? 0 : Math.max(-3, Math.min(5, wc.getZoomLevel() + (a === 'zoomin' ? 0.5 : -0.5)))); }
  });
  ipcMain.on('desk:chrome', (e, c) => {
    const w = trusted(e) ? winOf(e) : null; if (!w || !FRAMELESS || !c) return;
    const hex = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
    if (hex(c.color) && hex(c.symbolColor)) { try { w.setTitleBarOverlay({ color: c.color, symbolColor: c.symbolColor, height: WINBAR_H }); } catch (x) { /* платформа без поддержки */ } }
  });
  ipcMain.handle('desk:winInfo', e => { if (!trusted(e)) throw new Error('untrusted'); const w = winOf(e); return { frameless: FRAMELESS, max: !!(w && w.isMaximized()), full: !!(w && w.isFullScreen()), h: WINBAR_H, menu: !!Menu.getApplicationMenu() }; });
  ipcMain.on('desk:closeNow', e => { if (!trusted(e)) return; forceClose = true; closing = false; if (win && !win.isDestroyed()) win.close(); });
}

/* ---------- окно ---------- */
function applyTitle() {
  if (!win || win.isDestroyed()) return;
  const T_ = T();
  const dot = uiState.bound && uiState.dirty ? '● ' : '';
  win.setTitle(uiState.name ? `${dot}${uiState.name} — ${T_.appName}` : T_.appName);
  if (process.platform === 'darwin') win.setDocumentEdited(!!(uiState.bound && uiState.dirty));
}
function send(cmd, arg) { if (win && !win.isDestroyed()) win.webContents.send('desk:cmd', cmd, arg); }

function buildMenu() {
  if (FRAMELESS) { Menu.setApplicationMenu(null); return; }             // пункты меню живут в странице: значок в полоске сверху
  const T_ = T(), mac = process.platform === 'darwin';
  const item = (label, cmd, accelerator, arg) => ({ label, accelerator, click: () => send(cmd, arg) });
  const tpl = [];
  if (mac) tpl.push({ label: app.name, submenu: [{ label: T_.about, click: showAbout }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] });
  tpl.push({
    label: T_.file, submenu: [
      item(T_.launcher, 'launcher', 'CmdOrCtrl+Shift+H'), { type: 'separator' },
      item(T_.new, 'new', 'CmdOrCtrl+N'), item(T_.open, 'open', 'CmdOrCtrl+O'), { type: 'separator' },
      item(T_.save, 'save', 'CmdOrCtrl+S'), item(T_.saveAs, 'saveas', 'CmdOrCtrl+Shift+S'), item(T_.copy, 'copy'), { type: 'separator' },
      item(T_.build, 'build', 'CmdOrCtrl+B'), item(T_.drive, 'drive'),
      ...(mac ? [] : [{ type: 'separator' }, { label: T_.quit, role: 'quit' }]),
    ],
  });
  tpl.push({ label: T_.edit, submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] });
  tpl.push({
    label: T_.view, submenu: [
      item(T_.theme, 'theme'),
      { label: T_.language, submenu: [{ label: T_.langRu, type: 'radio', checked: lang === 'ru', click: () => send('lang', 'ru') }, { label: T_.langEn, type: 'radio', checked: lang === 'en', click: () => send('lang', 'en') }] },
      { type: 'separator' },
      { label: T_.zoomIn, role: 'zoomIn' }, { label: T_.zoomOut, role: 'zoomOut' }, { label: T_.zoomReset, role: 'resetZoom' },
      { type: 'separator' }, { label: T_.fullscreen, role: 'togglefullscreen' },
      ...(DEV ? [{ type: 'separator' }, { label: T_.reload, role: 'reload' }, { label: T_.devtools, role: 'toggleDevTools' }] : []),
    ],
  });
  tpl.push({
    label: T_.help, submenu: [
      item(T_.helpOpen, 'help'), item(T_.update, 'update'),
      { label: T_.renpy, click: () => shell.openExternal('https://www.renpy.org/') },
      ...(mac ? [] : [{ type: 'separator' }, { label: T_.about, click: showAbout }]),
    ],
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}
function showAbout() {
  dialog.showMessageBox(win, { type: 'info', title: T().about, message: T().appName, detail: T().aboutText(app.getVersion()), buttons: ['OK'], icon: path.join(__dirname, 'build', 'icon.png') });
}

/** Параметры окна без системной рамки (общие для главного окна и окон-спутников). tool — имя спутника или '' для главного. */
function frameOpts(tool) {
  return {
    ...(FRAMELESS ? { titleBarStyle: 'hidden', titleBarOverlay: { ...CHROME_DEF[nativeTheme.shouldUseDarkColors ? 'dark' : 'light'], height: WINBAR_H }, autoHideMenuBar: true } : {}),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, devTools: DEV, additionalArguments: [...(FRAMELESS ? ['--vn-frameless=1'] : []), ...(tool ? ['--vn-sat=' + tool] : [])] },
  };
}
/** Общее для всех окон: состояние окна для полоски, горячие клавиши вместо системного меню, защита от переходов. */
function frameExtras(w, { launcher }) {
  w.webContents.setWindowOpenHandler(({ url }) => { try { const u = new URL(url); if (u.protocol === 'https:' || u.protocol === 'http:') shell.openExternal(u.href); } catch (e) { /* нет */ } return { action: 'deny' }; });
  w.webContents.on('will-navigate', (e, url) => { if (!isOwnUrl(url)) e.preventDefault(); });
  w.webContents.on('will-attach-webview', e => e.preventDefault());
  w.webContents.session.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'clipboard-sanitized-write'));
  w.webContents.session.setPermissionCheckHandler((wc, perm) => perm === 'clipboard-sanitized-write');
  if (FRAMELESS) {
    w.setMenuBarVisibility(false);
    const state = () => { if (w && !w.isDestroyed()) w.webContents.send('desk:winState', { max: w.isMaximized(), full: w.isFullScreen() }); };
    for (const ev of ['maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen']) w.on(ev, state);
    /* без меню горячие клавиши меню перехватываем сами: во весь экран, начальный экран, масштаб страницы, для разработчика перезагрузка */
    w.webContents.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      const mod = input.control || input.meta, k = String(input.key || '');
      const zoom = d => { const wc = w.webContents; wc.setZoomLevel(d === 0 ? 0 : Math.max(-3, Math.min(5, wc.getZoomLevel() + d))); };
      if (k === 'F11') { e.preventDefault(); w.setFullScreen(!w.isFullScreen()); }
      else if (mod && input.shift && /^h$/i.test(k)) { e.preventDefault(); if (launcher) send('launcher'); else if (win && !win.isDestroyed()) { win.focus(); send('launcher'); } }
      else if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoom(0.5); }
      else if (mod && k === '-') { e.preventDefault(); zoom(-0.5); }
      else if (mod && k === '0') { e.preventDefault(); zoom(0); }
      else if (DEV && (k === 'F12' || (mod && input.shift && /^i$/i.test(k)))) { e.preventDefault(); w.webContents.toggleDevTools(); }
      else if (DEV && mod && /^r$/i.test(k)) { e.preventDefault(); w.webContents.reload(); }
    });
  }
}
const winOf = e => { try { const w = BrowserWindow.fromWebContents(e.sender); return w && !w.isDestroyed() ? w : null; } catch (x) { return null; } };

function createWindow() {
  const s = loadWinSettings();
  if (s.lang === 'ru' || s.lang === 'en') lang = s.lang;
  if (typeof s.lastDir === 'string') lastDir = s.lastDir;
  if (typeof s.updateUrl === 'string') lastUpdateUrl = s.updateUrl;
  if (typeof s.projectPath === 'string' && s.projectPath && fs.existsSync(s.projectPath)) projectPath = s.projectPath;
  const b = s.bounds && s.bounds.width >= 800 && s.bounds.height >= 560 ? s.bounds : { width: 1360, height: 860 };
  win = new BrowserWindow({
    ...b, minWidth: 900, minHeight: 600, show: false, title: T().appName,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1c1c1e' : '#f2f2f7',
    icon: path.join(__dirname, 'build', 'icon.png'),
    ...frameOpts(''),
  });
  frameExtras(win, { launcher: true });
  if (s.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('resize', () => { clearTimeout(win._sv); win._sv = setTimeout(saveWinSettings, 600); });
  win.on('move', () => { clearTimeout(win._sv); win._sv = setTimeout(saveWinSettings, 600); });
  win.on('close', async e => {
    saveWinSettings();
    if (forceClose || !(uiState.bound && uiState.dirty)) return;
    e.preventDefault();
    if (closing) return;
    closing = true;
    const T_ = T();
    const r = await dialog.showMessageBox(win, { type: 'question', buttons: [T_.saveBtn, T_.dontSave, T_.cancel], defaultId: 0, cancelId: 2, title: T_.unsavedTitle, message: T_.unsavedTitle, detail: T_.unsavedText(uiState.name || T_.appName) });
    if (r.response === 0) {
      send('save-quit');
      setTimeout(() => { closing = false; }, 15000);   // если страница не ответила — можно попробовать снова
    } else if (r.response === 1) { forceClose = true; closing = false; win.close(); }
    else closing = false;
  });
  win.on('closed', () => { win = null; rendererReady = false; sat.closeAll(); if (nt) nt.sendFarewell(); });             // «проект закрыт»: уходит из оболочки, страница уже не нужна
  win.loadURL(`${SCHEME}://${HOST}/index.html`);
}

async function openPath(p) {
  if (!p) return;
  let f; try { f = await readProjectFile(p); } catch (e) { return; }
  recentAdd(p);
  if (win && rendererReady) { if (win.isMinimized()) win.restore(); win.focus(); win.webContents.send('desk:open', f); }
  else pendingOpen = f;
}

/* ---------- запуск ---------- */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }
else {
  app.on('second-instance', (e, argv) => { const p = findFileArg(argv); if (win) { if (win.isMinimized()) win.restore(); win.focus(); } if (p) openPath(p); });
  app.on('open-file', (e, p) => { e.preventDefault(); if (app.isReady()) openPath(p); else pendingOpenPath = p; });
  app.whenReady().then(async () => {
    /* прошлое обновление не запустилось — возвращаем встроенную страницу и скажем об этом */
    const rb = updater.checkBoot(); if (rb) bootNotice = rb;
    overrideDir = updater.activeDir();
    registerProtocol(); registerIpc(); ghLoad();
    const s = loadWinSettings(); if (s.lang === 'ru' || s.lang === 'en') lang = s.lang;
    const first = pendingOpenPath || findFileArg(process.argv);
    if (first) launcherPending = false;     // программу открыли двойным щелчком по проекту: стартовый экран не нужен
    buildMenu(); createWindow();
    if (first) { try { pendingOpen = await readProjectFile(first); } catch (e) { /* нет файла */ } }
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) { forceClose = false; createWindow(); } });
  });
  let ntQuit = false;
  app.on('before-quit', e => {
    if (rpHost) rpHost.shutdown();
    if (nt && nt.busy() && !ntQuit) { e.preventDefault(); ntQuit = true; nt.whenIdle(6000).then(() => app.quit()); }          // дать прощальному сообщению уйти
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}

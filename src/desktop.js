'use strict';
/* ====== Десктопная версия: связь с оболочкой Electron (в браузере всё это молчит) ====== */
const APP_BUILD = '/*BUILD*/', APP_VERSION = '/*VERSION*/';      // подставляет build.py
const DESK = (typeof window !== 'undefined' && window.vnDesktop && window.vnDesktop.isDesktop) ? window.vnDesktop : null;
const DS = { path: '', dirty: false, saving: false, again: false, rev: 0, savedAt: 0, timer: null, last: {}, sig: '', ssig: '' };
const DESK_AUTOSAVE_MAX = 80 * 1048576;       // проекты тяжелее сохраняются в файл только вручную
const fileBase = p => String(p || '').split(/[\\/]/).pop();
const deskErr = e => String((e && e.message) || e || '?').replace(/^Error invoking remote method '[^']+': (Error: )?/, '');

async function projectBytes() {
  flushHistory();
  const blob = hasAnyFiles() ? await backupZipBlob() : new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' });
  return new Uint8Array(await blob.arrayBuffer());
}
const projectAssetBytes = () => P.assets.reduce((s, a) => s + Object.values(a.files || {}).reduce((x, m) => x + (+m.size || 0), 0), 0);

/** Синхронизирует с оболочкой название, признак «есть несохранённое» и привязку к файлу. */
function deskPush(force) {
  if (!DESK || !P) return;
  const sig = [P.name, DS.dirty, !!DS.path].join('|'), ssig = [DS.dirty, DS.path, DS.saving].join('|');
  if (sig !== DS.sig || force) { DS.sig = sig; DESK.setState({ name: P.name, dirty: DS.dirty, bound: !!DS.path }).catch(() => { }); }
  if (ssig !== DS.ssig || force) { DS.ssig = ssig; updateStatus(); }
}
/** Вызывается при каждом изменении проекта. */
function deskDirty() {
  if (!DESK) return;
  if (typeof driveDirty === 'function') driveDirty();
  DS.rev++; DS.dirty = true;
  clearTimeout(DS.timer);
  if (DS.path && projectAssetBytes() <= DESK_AUTOSAVE_MAX) DS.timer = setTimeout(() => deskSave({ silent: true }), 2500);
  deskPush();
}
/** Проект заменён (новый, демо, импорт): привязку к файлу снимаем. */
function deskUnbind() {
  if (!DESK) return;
  if (typeof shareStop === 'function') shareStop(true);
  clearTimeout(DS.timer); DS.path = ''; DS.dirty = false; DS.rev++;
  DESK.unbind().catch(() => { }); deskPush(true);
}

async function deskSave(o = {}) {
  if (!DESK) return false;
  if (DS.saving) { DS.again = true; return false; }
  clearTimeout(DS.timer);
  DS.saving = true; deskPush();
  let ok = false, rev = DS.rev;
  try {
    if (SF.on && !o.as) { await shareCheck(); clearTimeout(DS.timer); rev = DS.rev; }      // совместный файл: сперва подтянуть чужие правки
    flushHistory();
    const ents = SF.on ? mgEntities(P) : null, was = DS.path;
    const bytes = await projectBytes();
    const r = await DESK.saveProject(slug(P.name) || 'project', bytes, !!o.as);
    if (r) {
      DS.path = r.path; DS.savedAt = Date.now(); UI.lastBackup = DS.savedAt; lsSet(LS_B, String(DS.savedAt));
      if (DS.rev === rev) DS.dirty = false;
      ok = true;
      if (SF.on) { if (r.path === was) await shareAfterSave(ents); else shareStop(true); }
      if (!o.silent) toast(t('desk.saved', r.name || fileBase(r.path)));
    }
  } catch (e) { toast(t('save.fail') + ' (' + deskErr(e) + ')', 5000); }
  DS.saving = false; deskPush(true);
  if (DS.again || (ok && DS.rev !== rev && DS.path)) { DS.again = false; DS.timer = setTimeout(() => deskSave({ silent: true }), 600); }
  return ok;
}

async function deskOpenFile(f, opts = {}) {
  if (!f || !f.bytes) return false;
  const file = new File([f.bytes], f.name || 'project.vnmap');
  const ok = await readImport(file, opts);
  if (!ok) return false;
  if (/\.vnmap$/i.test(f.name || '') && f.path) { DS.path = f.path; try { await DESK.bind(f.path); } catch (e) { /* привязка не удалась — работаем без неё */ } }
  DS.dirty = false; DS.rev++; DS.savedAt = Date.now(); deskPush(true);
  if (typeof closeLauncher === 'function') closeLauncher();
  if (typeof shareAuto === 'function') shareAuto();
  return true;
}
async function deskOpen() {
  closePopover();
  try { const f = await DESK.openDialog(); if (f) await deskOpenFile(f); }
  catch (e) { toast(t('imp.bad') + ' (' + deskErr(e) + ')', 4500); }
}
/** Файл, брошенный на окно: пробуем узнать его путь, чтобы привязать проект. */
async function deskDropFile(file) {
  let p = ''; try { p = DESK.pathForFile(file) || ''; } catch (e) { p = ''; }
  if (p && /\.vnmap$/i.test(p)) {
    const f = await DESK.readPath(p).catch(() => null);
    if (f) return deskOpenFile(f);
  }
  readImport(file);
}

async function deskSaveQuit() {
  const ok = await deskSave({ silent: true });
  if (ok || !DS.dirty) DESK.closeNow();
}

/** Команды из меню оболочки и горячих клавиш (двойной вызов одной команды за долю секунды гасим). */
function deskCommand(cmd, arg) {
  if (!DESK) return;
  const now = Date.now();
  if (cmd !== 'lang' && DS.last[cmd] && now - DS.last[cmd] < 350) return;
  DS.last[cmd] = now;
  switch (cmd) {
    case 'new': newProject(false); break;
    case 'open': deskOpen(); break;
    case 'save': deskSave(); break;
    case 'saveas': deskSave({ as: true }); break;
    case 'copy': exportJSON(); break;
    case 'build': openBuild(); break;
    case 'theme': toggleTheme(); break;
    case 'lang': if (arg === 'ru' || arg === 'en') setLang(arg); break;
    case 'help': openHelp(); break;
    case 'drive': openDrivePanel(); break;
    case 'launcher': if (typeof openLauncher === 'function') openLauncher(); break;
    case 'update': if (typeof openUpdateDialog === 'function') openUpdateDialog(); break;
    case 'save-quit': deskSaveQuit(); break;
  }
}

/** Плашка в строке состояния: показывает файл проекта и его состояние. */
function deskStatusChip() {
  const bound = !!DS.path;
  const text = DS.saving ? t('desk.saving') : !bound ? t('desk.nofile') : DS.dirty ? t('desk.dirty', fileBase(DS.path)) : t('desk.synced', fileBase(DS.path));
  return h('button', { class: 'btn stat' + (!bound || DS.dirty ? ' warn' : ''), 'data-tip': bound ? DS.path : t('desk.nofile.tip'), onclick: () => deskSave() },
    icon(bound && !DS.dirty && !DS.saving ? 'check' : 'save', 15), text);
}

/* ---- сборка игры прямо в папку ---- */
async function bldWriteFolder(st) {
  if (!DESK || st.busy) return;
  st.busy = true; renderBuildFoot(st);
  try {
    const res = compileProject(null, await availableBlobs());
    const r = await DESK.writeBuild(await buildGameEntries(res));
    if (r) {
      st.outDir = r.dir;
      toast(t('desk.build.done', r.written, r.dir) + (r.removed ? ' ' + t('desk.build.removed', r.removed) : ''), 7000);
    }
  } catch (e) { toast(t('bld.fail') + ' (' + deskErr(e) + ')', 6000); }
  st.busy = false;
  if (BLD === st && !st.m.closed) renderBuildFoot(st);
}

function deskInit() {
  if (!DESK) return;
  document.documentElement.classList.add('desktop');
  DESK.onCommand(deskCommand);
  if (typeof driveInit === 'function') driveInit();
  if (typeof updAutoStart === 'function') updAutoStart();
  if (typeof updShellAuto === 'function') updShellAuto();
  DESK.onOpenFile(f => deskOpenFile(f));
  DESK.setLang(S.lang).catch(() => { });
  if (document.fonts && document.fonts.load) Promise.all(['400 14px Inter', '500 14px Inter', '600 14px Inter', '700 14px Inter'].map(f => document.fonts.load(f))).then(() => { clearMeasure(); reindex(); renderAll(); }).catch(() => { });
  DESK.ready().then(info => {
    if (info && info.path) { DS.path = info.path; DS.dirty = false; DS.savedAt = Date.now(); }
    deskPush(true);
    if (!(info && info.open) && typeof shareAuto === 'function') shareAuto();
    if (info && info.open) deskOpenFile(info.open);
    else if (info && info.launcher && S.launcher !== false && DESK.recent && typeof openLauncher === 'function') openLauncher();
    if (info && info.notice && typeof deskNotice === 'function') setTimeout(() => deskNotice(info.notice), 700);
  }).catch(() => { });
}

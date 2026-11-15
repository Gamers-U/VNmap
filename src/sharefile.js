'use strict';
/* ====== Совместная работа через общий файл (десктоп) ======
   Файл `.vnmap` лежит в общей папке (Dropbox, OneDrive, Syncthing, «Google Диск для компьютера», сетевой диск) — у каждого участника он открыт у себя.
   Раз в несколько секунд приложение смотрит, не изменился ли файл. Если да — трёхстороннее слияние «общая основа → моё → файл» (merge.js),
   то же, что и в браузерной версии. Перед каждой записью файл проверяется ещё раз, поэтому чужие правки не затираются.
   Здесь же — хранение «основы» для автослияния Google Диска (drive.js). */

const SF = { on: false, sig: '', base: null, timer: null, err: '', last: 0, merged: 0, panel: null, checkedAt: 0 };
const SF_LS = 'vnmap.share.';
const SF_POLL = 3000;
const sbKey = () => 'sbase_' + (P && P.uid || 'x');
const SF_MAX_READ = 40 * 1048576;            // без быстрой проверки (старая оболочка) файлы тяжелее не опрашиваем

/* ---------- сохранённые «основы» (последнее общее состояние) ---------- */
async function baseSave(key, map) { try { await blobPut(key, new Blob([JSON.stringify([...map])], { type: 'application/json' })); } catch (e) { /* не страшно */ } }
async function baseLoad(key) { try { const b = await blobGet(key); return b ? new Map(JSON.parse(await b.text())) : null; } catch (e) { return null; } }
const baseSaveSoon = debounce(() => { if (SF.base) baseSave(sbKey(), SF.base); }, 1200);

/* ---------- чтение файла ---------- */
function bytesSig(u) {
  let a = 2166136261, b = 5381; const step = u.length > 16e6 ? 5 : 1;
  for (let i = 0; i < u.length; i += step) { const c = u[i]; a = Math.imul(a ^ c, 16777619) >>> 0; b = (Math.imul(b, 33) + c) >>> 0; }
  return u.length + ':' + a.toString(36) + b.toString(36);
}
/** Метка текущего состояния файла. Быстрая (по времени и размеру) — если оболочка умеет, иначе по содержимому. */
async function shareStat() {
  if (!DS.path) return null;
  if (typeof DESK.stat === 'function') { const st = await DESK.stat(); return st ? { sig: st.sig } : null; }
  const f = await DESK.readPath(DS.path); if (!f || !f.bytes) return null;
  if (f.bytes.length > SF_MAX_READ) throw new Error(t('share.err.big'));
  return { sig: bytesSig(f.bytes), file: f };
}
async function shareParse(bytes) {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u[0] === 0x50 && u[1] === 0x4B) { const r = await readBackupZip(new File([u], 'p.vnmap')); return { project: normalize(r.project), blobs: r.blobs }; }
  let p; try { p = JSON.parse(new TextDecoder().decode(u)); } catch (e) { throw new Error(t('share.err.bad')); }
  if (!p || !Array.isArray(p.nodes)) throw new Error(t('share.err.bad'));
  return { project: normalize(p), blobs: [] };
}

/* ---------- слияние с файлом (вызывать только внутри shareLock) ---------- */
let _sfLock = Promise.resolve();
const shareLock = fn => { const r = _sfLock.then(fn); _sfLock = r.catch(() => { }); return r; };

async function shareIntegrate(bytes, sig) {
  const { project: np, blobs } = await shareParse(bytes);
  if (np.uid !== P.uid) throw new Error(t('share.err.uid'));
  for (const b of blobs) { if (!(await blobGet(b.bid))) await blobPut(b.bid, b.blob); }
  const B = SF.base || new Map(), L = mgEntities(P), R = mgEntities(np), cf = [];
  const M = mgMergeMaps(B, L, R, cf);
  const inc = mgDiff(B, R), n = inc.set.length + inc.del.length;
  if (!clSame(M, L)) clApplyMap(M, cf);
  SF.base = R; SF.sig = sig; baseSaveSoon();
  if (!clSame(M, R)) deskDirty();                       // в файле нет моих правок: запишем
  else if (DS.path) { DS.dirty = false; deskPush(true); }
  if (n && !clSame(M, L)) { SF.last = Date.now(); SF.merged += n; toast(t('share.merged', n), 2800); }
  return true;
}
/** Перед записью проекта: если файл за это время изменили — сначала сливаем. */
function shareCheck() {
  if (!SF.on || !DS.path) return Promise.resolve(true);
  return shareLock(async () => {
    const st = await shareStat();
    if (!st || st.sig === SF.sig) return true;
    const f = st.file || await DESK.readPath(DS.path);
    if (!f) return true;
    await shareIntegrate(f.bytes, st.sig);
    return true;
  });
}
/** После успешной записи: файл теперь равен моему состоянию. */
async function shareAfterSave(ents) {
  SF.base = ents;
  try { const st = await shareStat(); SF.sig = st ? st.sig : ''; } catch (e) { SF.sig = ''; }
  baseSaveSoon();
}

async function shareTick(force) {
  if (!SF.on || !DS.path || DS.saving) return;
  try {
    await shareLock(async () => {
      if (!SF.on || DS.saving) return;
      const st = await shareStat();
      SF.checkedAt = Date.now();
      if (st && st.sig !== SF.sig) { const f = st.file || await DESK.readPath(DS.path); if (f) await shareIntegrate(f.bytes, st.sig); }
      SF.err = '';
    });
  } catch (e) { SF.err = deskErr(e); }
  shareRefreshUI();
}
function shareStart() { clearInterval(SF.timer); SF.timer = setInterval(shareTick, SF_POLL); }
function shareStop(keepFlag) {
  clearInterval(SF.timer); SF.timer = null;
  if (SF.on && !keepFlag && DS.path) lsSet(SF_LS + DS.path, '0');
  SF.on = false; SF.base = null; SF.sig = ''; SF.err = ''; SF.merged = 0; SF.last = 0;
  shareRefreshUI();
}
function shareRefreshUI() {
  if (typeof collabRefreshUI === 'function') collabRefreshUI();
  if (SF.panel && !SF.panel.m.closed) renderSharePanel(SF.panel);
}

async function shareEnable({ auto = false } = {}) {
  if (!DESK || SF.on) return false;
  if (!DS.path) { if (auto) return false; if (!(await deskSave({ as: true, silent: true })) || !DS.path) return false; }
  try {
    SF.err = ''; SF.sig = ''; SF.merged = 0; SF.last = 0;
    SF.base = auto ? await baseLoad(sbKey()) : null;
    const hadFile = await shareLock(async () => {
      const st = await shareStat(); if (!st) return false;
      const f = st.file || await DESK.readPath(DS.path); if (!f) return false;
      if (!SF.base) SF.base = DS.dirty ? new Map() : mgEntities(P);      // основы нет: чужое принимаем целиком, если у меня нет несохранённого
      SF.on = true;
      await shareIntegrate(f.bytes, st.sig);
      return true;
    });
    SF.on = true;
    if (!hadFile) SF.base = mgEntities(P);
    lsSet(SF_LS + DS.path, '1'); shareStart();
    if (DS.dirty || !hadFile) await deskSave({ silent: true });
    else baseSaveSoon();
    return true;
  } catch (e) {
    SF.on = false; clearInterval(SF.timer); SF.err = deskErr(e);
    toast(t('share.err.start', SF.err), 6500);
    return false;
  } finally { shareRefreshUI(); }
}
/** Проект открыт из файла: если для него совместная работа была включена, продолжаем. */
function shareAuto() {
  if (!DESK || SF.on || !DS.path || lsGet(SF_LS + DS.path) !== '1') return;
  shareEnable({ auto: true });
}

/* ---------- окно ---------- */
function openSharePanel() {
  if (SF.panel && !SF.panel.m.closed) return;
  const st = { m: null, body: h('div', { class: 'dlg-body' }) };
  SF.panel = st;
  st.m = openModal({ cls: 'dlg wide', onClose: () => { if (SF.panel === st) SF.panel = null; }, build: m => { st.m = m; renderSharePanel(st); return st.body; } });
}
function renderSharePanel(st) {
  const on = SF.on, bound = !!DS.path;
  const stTxt = SF.err ? t('share.st.err', SF.err) : on ? (SF.last ? t('share.st.on.last', new Date(SF.last).toLocaleTimeString(), SF.merged) : t('share.st.on')) : t('share.st.off');
  st.body.replaceChildren(h('h3', t('share.title')), h('p', { class: 'gd-p' }, t('share.intro')),
    h('div', { class: 'col-state' + (SF.err ? ' bad' : on ? ' ok' : '') }, icon(SF.err ? 'alert' : on ? 'check' : 'users', 16), h('span', stTxt)),
    bound ? h('p', { class: 'hint' }, t('share.file', DS.path)) : h('p', { class: 'hint warn-t' }, t('share.nofile')),
    h('p', { class: 'hint' }, t('share.how')), h('p', { class: 'hint' }, t('share.undo')),
    h('div', { class: 'dlg-actions' },
      on ? h('button', { class: 'btn', onclick: () => shareStop() }, icon('x', 15), t('col.off')) : h('button', { class: 'btn primary', onclick: () => shareEnable() }, icon('users', 15), bound ? t('share.enable') : t('share.enable.pick')),
      on ? h('button', { class: 'btn', onclick: () => shareTick(true) }, icon('refresh', 15), t('share.check')) : null,
      h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => st.m.close() }, t('c.close'))));
}

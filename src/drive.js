'use strict';
/* ====== Google Диск: синхронизация проекта и файлов, автоматические копии (только в настольной версии) ======
   Что лежит на Диске (папка «Карта новеллы», её создаёт сама программа):
     <Название проекта>/project.json     сам проект (без положения карты на экране)
     <Название проекта>/files/           загруженные картинки и звуки
     <Название проекта>/backups/         автоматические копии project.json
   Программа видит на Диске только то, что создала сама (область доступа drive.file). */
const GD = DESK && DESK.gd ? DESK.gd : null;
const LS_D = 'vnmap.drive.v1';
const GD_FOLDER = 'application/vnd.google-apps.folder';
const DRIVE_ROOT_NAME = 'Карта новеллы';
const GS = { st: { configured: false, signedIn: false, email: '', encrypted: true, device: '' }, cfg: { clientId: '', hasSecret: false, bundled: false },
  phase: 'idle', err: '', progress: '', queue: Promise.resolve(), kick: false, timer: null, poll: null, retry: null, retryN: 0, applying: false, lastEdit: 0, remote: null, panel: null, signing: false };
let DM = { projects: {}, opts: { backups: true, every: 30, keep: 20, lazy: false }, rootId: '' };

function dmLoad() {
  let j = null; try { j = JSON.parse(lsGet(LS_D) || 'null'); } catch (e) { j = null; }
  DM = Object.assign({ projects: {}, rootId: '' }, j && typeof j === 'object' ? j : {});
  DM.opts = Object.assign({ backups: true, every: 30, keep: 20, lazy: false }, DM.opts || {});
}
const dmSave = () => lsSet(LS_D, JSON.stringify(DM));
const dmeta = () => (P && P.uid && DM.projects[P.uid]) || null;
const dEnc = new TextEncoder(), dDec = new TextDecoder();
function strHash(s) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + ':' + s.length;
}
/** Содержимое проекта для Диска: положение карты на экране не в счёт, иначе каждый сдвиг холста считался бы правкой. */
const contentOf = p => JSON.stringify(Object.assign({}, p, { view: undefined }));
const contentJSON = () => contentOf(P);
function gdErr(e) {
  const m = /gd:([a-z_]+):([\s\S]*)$/.exec(String((e && e.message) || e));
  return m ? { code: m[1], msg: m[2].trim() } : { code: 'unknown', msg: deskErr(e) };
}
const gdFail = msg => new Error('gd:bad_request:' + msg);
const fmtTime = ts => { try { return new Date(ts).toLocaleString(S.lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return String(ts); } };
const driveSigned = () => !!(GD && GS.st.signedIn);
const gdName = s => String(s || '').replace(/[\\/\x00-\x1f]+/g, '_').trim().slice(0, 200) || 'file';

/* ---------- состояние для плашки и окна ---------- */
function driveState() {
  if (!GS.st.configured) return 'nocfg';
  if (!GS.st.signedIn) return GS.phase === 'auth' ? 'auth' : 'nosign';
  const m = dmeta(); if (!m || !m.on) return 'off';
  if (GS.phase !== 'idle') return GS.phase;
  return GS.dirtyFlag ? 'pending' : 'ok';
}
function setPhase(ph, err) { GS.phase = ph; GS.err = err || ''; if (ph !== 'syncing') GS.progress = ''; driveRefreshUI(); }
function driveRefreshUI() {
  if (typeof updateStatus === 'function') updateStatus();
  const pn = GS.panel;
  if (pn && !pn.m.closed) {
    /* в окне списки копий и проектов устарели после синхронизации: перечитываем, когда она закончилась */
    if (pn.stale && GS.phase !== 'syncing' && !pn.editKeys) { pn.stale = false; pn.backups = null; pn.projects = null; renderDrivePanel(pn); }
    else renderDriveStatus(pn);
  }
}
async function driveRefreshStatus() {
  if (!GD) return;
  try { GS.st = await GD.status(); GS.cfg = await GD.getConfig(); } catch (e) { /* старая оболочка без Диска */ }
}
/** Есть ли на этом устройстве файлы, которых ещё нет на Диске. */
async function driveHasUnuploaded(m) {
  for (const a of P.assets) for (const f of Object.values(a.files || {})) if (f && f.bid && !(m.up && m.up[f.bid]) && await blobGet(f.bid)) return true;
  return false;
}

/* ---------- очередь: одна операция за раз ---------- */
function driveRun(fn) {
  const job = GS.queue.then(fn);
  GS.queue = job.catch(() => { });
  return job;
}
function driveKick() {
  if (GS.kick) return; GS.kick = true;
  driveRun(async () => { GS.kick = false; await driveCycle(); });
}
function driveFail(e) {
  const g = gdErr(e);
  if (g.code === 'auth') { GS.st.signedIn = false; setPhase('auth', g.msg); driveRefreshStatus().then(driveRefreshUI); }
  else if (g.code === 'not_configured') { setPhase('auth', g.msg); }
  else if (g.code === 'network') { setPhase('offline', g.msg); driveScheduleRetry(); }
  else if (g.code === 'quota') setPhase('error', g.msg);
  else { setPhase('error', g.msg); driveScheduleRetry(); }
}
function driveScheduleRetry() {
  clearTimeout(GS.retry);
  const d = Math.min(300000, 30000 * 2 ** Math.min(GS.retryN++, 5));
  GS.retry = setTimeout(() => driveKick(), d);
}

/** Вызывается при каждом изменении проекта (из scheduleSave). */
function driveDirty() {
  if (!GD || GS.applying) return;
  GS.lastEdit = Date.now();
  const m = dmeta(); if (!m || !m.on || !GS.st.signedIn) return;
  clearTimeout(GS.timer);
  GS.timer = setTimeout(async () => {
    if (dmeta() !== m) return;
    const changed = strHash(contentJSON()) !== m.sigHash || await driveHasUnuploaded(m);
    GS.dirtyFlag = changed; driveRefreshUI();
    if (changed && GS.phase !== 'conflict') driveKick();
  }, 6000);
}
const driveCanAutoApply = () => !MODALS.length && Date.now() - GS.lastEdit > 8000;

/* ---------- раскладка папок ---------- */
/** Чей это Диск: почта и ключ (client id). Папки, созданные одним ключом, другой ключ не видит, а у другого аккаунта их нет совсем. */
const driveIdent = () => (GS.st.email || '') + '|' + (GS.cfg.clientId || '');
/** Забыть все запомненные идентификаторы Диска (корень и папки проектов). Сами проекты и включённая синхронизация остаются. */
function driveForgetAll() {
  DM.rootId = ''; GS.rootOk = '';
  for (const k of Object.keys(DM.projects || {})) driveForgetFolder(DM.projects[k]);
  dmSave();
}
/** Вход сменился (другой аккаунт или другой ключ): запомненные идентификаторы чужие, строим структуру заново. */
function driveCheckAccount() {
  if (!GS.st.signedIn) return;
  const id = driveIdent();
  if (DM.acct === id) return;
  const had = DM.acct; DM.acct = id;
  if (had) { driveForgetAll(); toast(t('drive.acct.new', GS.st.email || '—'), 9000); } else dmSave();
}
async function driveEnsureRoot() {
  const ident = driveIdent();
  if (DM.rootId && GS.rootOk === ident) return DM.rootId;
  if (DM.rootId) {   // раз за сеанс проверяем, что запомненная корневая папка есть именно на этом Диске
    let info = null; try { info = await GD.get(DM.rootId); } catch (e) { if (gdErr(e).code !== 'not_found') throw e; }
    if (!info || info.trashed) { driveForgetAll(); if (!GS.healedToast) { GS.healedToast = true; toast(t('drive.healed'), 8000); } }
  }
  if (!DM.rootId) {
    const found = await GD.find({ folder: true, appProp: { key: 'vnmapKind', value: 'root' } });
    const r = found[0] || await GD.folder(DRIVE_ROOT_NAME, undefined, { vnmapKind: 'root' });
    DM.rootId = r.id; dmSave();
  }
  GS.rootOk = ident; return DM.rootId;
}
async function driveLayout(m, depth = 0) {
  const rootId = await driveEnsureRoot();
  if (!m.folderId) {
    const f = await GD.find({ folder: true, appProp: { key: 'vnmapUid', value: P.uid } });
    if (f.length) { m.folderId = f[0].id; m.folderName = f[0].name; }
    else {
      const c = await GD.folder(P.name, rootId, { vnmapKind: 'project', vnmapUid: P.uid });
      m.folderId = c.id; m.folderName = c.name; m.filesId = ''; m.backupsId = ''; m.up = {}; m.upChecked = false;
    }
    dmSave();
  }
  let kids;
  try { kids = await GD.find({ parentId: m.folderId }); }
  catch (e) { if (gdErr(e).code === 'not_found' && depth < 1) { driveForgetFolder(m); return driveLayout(m, depth + 1); } throw e; }
  if (!kids.length && depth < 1) {
    /* пусто: возможно, папку убрали в корзину */
    let info = null; try { info = await GD.get(m.folderId); } catch (e) { info = null; }
    if (!info || info.trashed) { driveForgetFolder(m); return driveLayout(m, depth + 1); }
  }
  const sub = kind => kids.find(k => k.mimeType === GD_FOLDER && k.appProperties && k.appProperties.vnmapKind === kind);
  let filesF = sub('files'), backF = sub('backups');
  if (!filesF) filesF = await GD.folder('files', m.folderId, { vnmapKind: 'files' });
  if (!backF) backF = await GD.folder('backups', m.folderId, { vnmapKind: 'backups' });
  if (m.filesId !== filesF.id) { m.filesId = filesF.id; m.up = {}; m.upChecked = false; }
  m.backupsId = backF.id;
  const docs = kids.filter(k => k.name === 'project.json' && k.mimeType !== GD_FOLDER).sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)));
  dmSave();
  return { folderId: m.folderId, folderName: m.folderName, filesId: filesF.id, backupsId: backF.id, doc: docs[0] || null };
}
function driveForgetFolder(m) { m.folderId = ''; m.filesId = ''; m.backupsId = ''; m.fileId = ''; m.baseMd5 = ''; m.up = {}; m.upChecked = false; dmSave(); }

/* ---------- отправка ---------- */
async function driveUploadBlobs(m, lay) {
  const need = new Map();
  for (const a of P.assets) for (const f of Object.values(a.files || {})) if (f && f.bid && !(m.up && m.up[f.bid]) && !need.has(f.bid)) need.set(f.bid, { f, a });
  if (!need.size) return 0;
  m.up = m.up || {};
  if (!m.upChecked) {
    for (const x of await GD.find({ parentId: lay.filesId, folder: false })) if (x.appProperties && x.appProperties.bid) m.up[x.appProperties.bid] = x.id;
    m.upChecked = true; dmSave();
  }
  const list = [...need.values()].filter(x => !m.up[x.f.bid]);
  let i = 0, sent = 0;
  for (const { f, a } of list) {
    i++;
    const blob = await blobGet(f.bid);
    if (!blob) continue;                                   // файла нет и на этом устройстве: потерян раньше
    GS.progress = t('drive.p.up', i, list.length); driveRefreshUI();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const r = await GD.upload({ name: f.bid + '__' + (f.name || 'file'), parentId: lay.filesId, bytes, mimeType: f.type || blob.type || 'application/octet-stream',
      appProperties: { vnmapKind: 'blob', bid: f.bid, asset: String(a.name || '').slice(0, 40) } });
    m.up[f.bid] = r.id; sent++; dmSave();
  }
  return sent;
}
function driveStamp() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`; }
async function driveBackupBytes(m, lay, bytes, tag) {
  const device = GS.st.device || 'pc';
  await GD.upload({ name: `${driveStamp()}${tag ? ' ' + tag : ''} [${device}].json`, parentId: lay.backupsId, bytes, mimeType: 'application/json',
    appProperties: { vnmapKind: 'backup', t: String(Date.now()) }, description: JSON.stringify({ name: P.name, nodes: P.nodes.length, device, tag: tag || '' }) });
  if (GS.panel) GS.panel.stale = true;
  /* оставляем только последние N копий: более старые уходят в корзину Диска, откуда их ещё можно вернуть */
  const all = (await GD.find({ parentId: lay.backupsId, folder: false })).filter(x => x.appProperties && x.appProperties.vnmapKind === 'backup')
    .sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)));
  for (const old of all.slice(Math.max(5, DM.opts.keep | 0))) { try { await GD.trash(old.id); } catch (e) { /* не страшно */ } }
}
async function drivePush(m, lay, { force = false } = {}) {
  await driveUploadBlobs(m, lay);
  const json = contentJSON(), bytes = dEnc.encode(json), pushedEnts = mgEntities(P), pushedUid = P.uid;
  GS.progress = t('drive.p.project'); driveRefreshUI();
  const desc = JSON.stringify({ app: 'vnmap', uid: P.uid, name: P.name, nodes: P.nodes.length, device: GS.st.device || '', t: Date.now() });
  const saved = await GD.upload({ name: 'project.json', parentId: lay.folderId, bytes, mimeType: 'application/json', fileId: lay.doc ? lay.doc.id : undefined,
    appProperties: { vnmapKind: 'doc', vnmapUid: P.uid }, description: desc });
  m.fileId = saved.id; m.baseMd5 = saved.md5Checksum || ''; m.sigHash = strHash(json); m.last = Date.now(); m.name = P.name; m.on = true;
  GS.dirtyFlag = false; dmSave();
  baseSave('dbase_' + pushedUid, pushedEnts);            // общая основа для следующего автослияния
  if (lay.folderName && lay.folderName !== gdName(P.name)) { try { const r = await GD.update(lay.folderId, { name: P.name }); m.folderName = r.name; dmSave(); } catch (e) { /* переименование не критично */ } }
  if (DM.opts.backups && (force || !m.lastBackup || Date.now() - m.lastBackup > DM.opts.every * 60000)) {
    await driveBackupBytes(m, lay, bytes, ''); m.lastBackup = Date.now(); dmSave();
  }
}

/* ---------- получение ---------- */
async function driveApplyBytes(m, lay, bytes, md5, { fresh = false, restore = false } = {}) {
  GS.applying = true;
  try {
    let p; try { p = JSON.parse(dDec.decode(bytes)); } catch (e) { throw gdFail('project.json на Диске повреждён'); }
    if (!p || !Array.isArray(p.nodes)) throw gdFail('project.json на Диске не похож на проект');
    const np = normalize(p);
    const up = {};
    for (const x of await GD.find({ parentId: lay.filesId, folder: false })) if (x.appProperties && x.appProperties.bid) up[x.appProperties.bid] = x.id;
    const need = [], seen = new Set();
    if (!DM.opts.lazy) for (const a of np.assets) for (const f of Object.values(a.files || {})) { if (f && f.bid && !seen.has(f.bid)) { seen.add(f.bid); if (!(await blobHas(f.bid))) need.push(f); } }   // lazy: файлы не качаем, их подгрузит просмотр
    let i = 0, lost = 0;
    for (const f of need) {
      i++;
      if (!up[f.bid]) { lost++; continue; }
      GS.progress = t('drive.p.down', i, need.length); driveRefreshUI();
      const data = await GD.download(up[f.bid]);
      await blobPut(f.bid, new Blob([data], { type: f.type || '' }));
    }
    const same = np.uid === P.uid && !fresh;
    m.on = true; m.up = Object.assign(m.up || {}, up); m.upChecked = true; m.name = np.name; m.last = Date.now();
    if (md5) m.baseMd5 = md5;
    m.sigHash = restore ? '' : strHash(contentOf(np));
    DM.projects[np.uid] = m; dmSave();
    if (same) {
      np.view = P.view;
      P = np; reindex(); UI.sel.clear(); UI.edge = null; resetHistory(); saveNow(); onProjectReplaced(); scheduleSave();
    } else { setProject(np); fitAll(false); }
    GS.dirtyFlag = restore;
    if (!restore) baseSave('dbase_' + np.uid, mgEntities(np));
    if (lost) toast(t('drive.lost', lost), 6000);
  } finally { GS.applying = false; }
}
async function driveApply(m, lay, doc, opts) {
  GS.progress = t('drive.p.project'); driveRefreshUI();
  const bytes = await GD.download(doc.id);
  await driveApplyBytes(m, lay, bytes, doc.md5Checksum, opts);
  if (!(opts && opts.quiet)) toast(t('drive.pulled'), 4200);
}

/** Правки с двух устройств: сливаем «основа → моё → на Диске» и отправляем результат. false — слить не удалось, нужен выбор пользователя. */
async function driveTryMerge(m, lay0, doc0) {
  let B = await baseLoad('dbase_' + P.uid); if (!B) return false;
  let lay = lay0, doc = doc0, got = 0, marked = 0;
  const uid0 = P.uid;
  for (let round = 0; round < 3; round++) {
    GS.progress = t('drive.p.project'); driveRefreshUI();
    let np;
    try { np = normalize(JSON.parse(dDec.decode(await GD.download(doc.id)))); } catch (e) { return false; }
    if (!np || !Array.isArray(np.nodes) || np.uid !== P.uid || P.uid !== uid0) return false;
    const up = {};
    for (const x of await GD.find({ parentId: lay.filesId, folder: false })) if (x.appProperties && x.appProperties.bid) up[x.appProperties.bid] = x.id;
    const seen = new Set();
    for (const a of np.assets) for (const f of Object.values(a.files || {})) {
      if (!f || !f.bid || seen.has(f.bid)) continue; seen.add(f.bid);
      if (!DM.opts.lazy && !(await blobHas(f.bid)) && up[f.bid]) await blobPut(f.bid, new Blob([await GD.download(up[f.bid])], { type: f.type || '' }));
    }
    m.up = Object.assign(m.up || {}, up);
    const L = mgEntities(P), R = mgEntities(np), cf = [];
    const M = mgMergeMaps(B, L, R, cf);
    /* одно и то же поле изменили по-разному (не текст с пометками): молча выбирать нельзя — пусть решает человек в окне конфликта */
    if (cf.some(c => !c.text)) return false;
    const inc = mgDiff(B, R); got += inc.set.length + inc.del.length; marked += cf.filter(c => c.marked).length;
    GS.applying = true; try { if (!clSame(M, L)) clApplyMap(M, cf); } finally { GS.applying = false; }
    m.baseMd5 = doc.md5Checksum || ''; m.sigHash = ''; dmSave();
    /* пока мы сливали, на Диск мог что-то записать третий: проверяем и при необходимости повторяем */
    const lay2 = await driveLayout(m);
    if (lay2.doc && lay2.doc.md5Checksum !== doc.md5Checksum) { doc = lay2.doc; lay = lay2; B = R; continue; }
    await drivePush(m, lay2);
    toast(t('drive.merged', got), 5000);
    return true;
  }
  return false;
}

/* ---------- один круг синхронизации ---------- */
async function driveCycle({ manual = false } = {}) {
  const m = dmeta();
  if (!GD || !m || !m.on || !GS.st.signedIn || GS.applying) return;
  const uid0 = P.uid;
  try {
    setPhase('syncing');
    driveCheckAccount();
    const lay = await driveLayout(m);
    if (P.uid !== uid0) return;
    const doc = lay.doc;
    const contentChanged = strHash(contentJSON()) !== m.sigHash;
    const changed = contentChanged || await driveHasUnuploaded(m);
    if (doc && !m.baseMd5) { GS.remote = { lay, doc, kind: 'exists' }; setPhase('conflict'); if (manual) driveConflictDialog(); return; }
    if (doc && doc.md5Checksum !== m.baseMd5) {
      if (contentChanged) {
        if (await driveTryMerge(m, lay, doc)) { GS.remote = null; GS.retryN = 0; setPhase('idle'); return; }
        GS.remote = { lay, doc, kind: 'diverged' }; setPhase('conflict'); if (manual) driveConflictDialog(); return;
      }
      GS.remote = { lay, doc, kind: 'newer' };
      if (manual || driveCanAutoApply()) { await driveApply(m, lay, doc); GS.remote = null; GS.newerN = 0; setPhase('idle'); GS.retryN = 0; return; }
      setPhase('newer');
      /* сейчас идёт правка или открыто окно: подождём и применим сами, чтобы не требовать клика */
      clearTimeout(GS.newerT);
      if ((GS.newerN = (GS.newerN || 0) + 1) <= 8) GS.newerT = setTimeout(driveKick, Math.max(5000, 8500 - (Date.now() - GS.lastEdit)));
      return;
    }
    if (!doc || changed || manual) await drivePush(m, lay);
    else { m.last = Date.now(); dmSave(); }
    GS.remote = null; GS.retryN = 0; GS.healed = false; setPhase('idle');
    if (strHash(contentJSON()) !== m.sigHash) { GS.dirtyFlag = true; driveDirty(); }
  } catch (e) {
    /* «файл не найден»: запомненная папка или файл остались от другого аккаунта или ключа, либо их удалили. Один раз забываем и строим заново. */
    if (gdErr(e).code === 'not_found' && !GS.healed) {
      GS.healed = true; driveForgetAll();
      if (!GS.healedToast) { GS.healedToast = true; toast(t('drive.healed'), 8000); }
      setTimeout(driveKick, 300); return;
    }
    driveFail(e);
  }
}
function driveProjectChanged() {
  if (!GD) return;
  clearTimeout(GS.timer); clearTimeout(GS.retry); clearTimeout(GS.newerT); GS.newerN = 0; GS.remote = null; GS.dirtyFlag = false; GS.phase = 'idle'; GS.err = '';
  if (GS.panel && !GS.panel.m.closed) renderDrivePanel(GS.panel);
  driveRefreshUI();
  const m = dmeta(); if (m && m.on && GS.st.signedIn && !GS.applying) setTimeout(driveKick, 600);
}

/* ---------- действия пользователя ---------- */
async function driveEnable() {
  if (!driveSigned()) return;
  const m = DM.projects[P.uid] || {};
  Object.assign(m, { on: true, baseMd5: '', sigHash: '', up: m.up || {}, name: P.name });
  DM.projects[P.uid] = m; dmSave(); driveRefreshUI();
  await driveRun(() => driveCycle({ manual: true }));
}
function driveDisable() {
  const m = dmeta(); if (!m) return;
  m.on = false; dmSave(); clearTimeout(GS.timer); clearTimeout(GS.retry); GS.remote = null; setPhase('idle');
}
function driveSyncNow() { return driveRun(() => driveCycle({ manual: true })); }

function driveConflictDialog() {
  const r = GS.remote; if (!r || r.kind === 'newer') return;
  let info = {}; try { info = JSON.parse(r.doc.description || '{}'); } catch (e) { info = {}; }
  const when = fmtTime(r.doc.modifiedTime), dev = info.device || '—';
  openModal({
    cls: 'dlg conflict-dlg', build: m => h('div', { class: 'dlg-body' },
      h('h3', r.kind === 'exists' ? t('drive.c.exists') : t('drive.c.title')),
      h('p', r.kind === 'exists' ? t('drive.c.exists.t', when, dev) : t('drive.c.t', when, dev)),
      h('p', { class: 'hint' }, t('drive.c.safe')),
      h('div', { class: 'dlg-col' },
        h('button', { class: 'btn primary', onclick: () => { m.close(); driveResolve('remote'); } }, icon('download', 16), t('drive.c.take')),
        h('button', { class: 'btn danger-fill', onclick: () => { m.close(); driveResolve('mine'); } }, icon('upload', 16), t('drive.c.mine')),
        h('button', { class: 'btn', onclick: () => m.close() }, t('drive.c.later'))))
  });
}
function driveResolve(choice) {
  const r = GS.remote; if (!r) return Promise.resolve();
  return driveRun(async () => {
    const m = dmeta(); if (!m) return;
    try {
      setPhase('syncing');
      const lay = r.lay;
      if (choice === 'remote') {
        await driveUploadBlobs(m, lay);
        await driveBackupBytes(m, lay, dEnc.encode(contentJSON()), t('drive.tag.mine'));
        await driveApply(m, lay, r.doc);
      } else {
        const old = await GD.download(r.doc.id);
        await driveBackupBytes(m, lay, old, t('drive.tag.before'));
        await drivePush(m, lay, { force: true });
        toast(t('drive.pushed'), 3200);
      }
      GS.remote = null; GS.retryN = 0; setPhase('idle');
    } catch (e) { driveFail(e); }
  });
}
async function driveListProjects() {
  const docs = await GD.find({ name: 'project.json', folder: false });
  return docs.map(d => {
    let info = {}; try { info = JSON.parse(d.description || '{}'); } catch (e) { info = {}; }
    return { doc: d, folderId: (d.parents || [])[0], name: info.name || '—', nodes: info.nodes, device: info.device || '', uid: info.uid || '', time: d.modifiedTime };
  }).filter(x => x.folderId).sort((a, b) => String(b.time).localeCompare(String(a.time)));
}
async function driveOpenRemote(entry) {
  const ok = await confirmDlg({ title: t('drive.open.q'), text: t('drive.open.t', entry.name), ok: t('drive.open.ok'), danger: true });
  if (!ok) return;
  closeDrivePanel();
  return driveRun(async () => {
    const m = { on: true, folderId: entry.folderId, folderName: '', fileId: entry.doc.id, baseMd5: '', sigHash: '', up: {}, upChecked: false };
    try {
      setPhase('syncing');
      const lay = await driveLayout(m);
      await driveApply(m, lay, lay.doc || entry.doc, { fresh: true });
      GS.retryN = 0; setPhase('idle');
    } catch (e) { driveFail(e); }
  });
}
async function driveRestoreBackup(file) {
  const m = dmeta(); if (!m) return;
  let info = {}; try { info = JSON.parse(file.description || '{}'); } catch (e) { info = {}; }
  const ok = await confirmDlg({ title: t('drive.rb.q'), text: t('drive.rb.t', fmtTime(file.modifiedTime)), ok: t('drive.rb.ok'), danger: true });
  if (!ok) return;
  return driveRun(async () => {
    try {
      setPhase('syncing');
      const lay = await driveLayout(m);
      await driveBackupBytes(m, lay, dEnc.encode(contentJSON()), t('drive.tag.before.restore'));
      const bytes = await GD.download(file.id);
      await driveApplyBytes(m, lay, bytes, '', { restore: true });
      toast(t('drive.restored'), 4200);
      setPhase('idle'); driveKick();
    } catch (e) { driveFail(e); }
  });
}
async function driveSignIn() {
  if (GS.signing) return;
  GS.signing = true; renderDrivePanel(GS.panel);
  try {
    GS.st = await GD.signIn(); GS.phase = 'idle'; GS.err = ''; GS.healed = false; GS.healedToast = false;
    try { GS.cfg = await GD.getConfig(); } catch (e) { /* ключ не прочитали: сравним по почте */ }
    toast(t('drive.signed', GS.st.email || ''), 4200);
    driveCheckAccount();
    const m = dmeta(); if (m && m.on) driveKick();
  } catch (e) {
    const g = gdErr(e);
    if (g.code !== 'cancelled') toast(t('drive.signfail') + ' ' + g.msg, 7000);
  }
  GS.signing = false; await driveRefreshStatus(); driveRefreshUI(); if (GS.panel && !GS.panel.m.closed) renderDrivePanel(GS.panel);
}

/* ---------- запуск ---------- */
function driveInit() {
  if (!GD) return;
  dmLoad();
  driveRefreshStatus().then(() => {
    driveRefreshUI();
    const m = dmeta();
    if (GS.st.signedIn && m && m.on) setTimeout(driveKick, 2500);
  });
  clearInterval(GS.poll);
  GS.poll = setInterval(() => { if (GS.st.signedIn && dmeta() && dmeta().on && GS.phase !== 'syncing' && !document.hidden) driveKick(); }, 90000);
  window.addEventListener('focus', () => { const m = dmeta(); if (GS.st.signedIn && m && m.on && GS.phase !== 'syncing') driveKick(); });
}

/* ---------- плашка в строке состояния ---------- */
function driveChip() {
  if (!GD) return null;
  const s = driveState();
  const L = { nocfg: 'drive.chip.nocfg', nosign: 'drive.chip.nosign', off: 'drive.chip.off', syncing: 'drive.chip.syncing', ok: 'drive.chip.ok', pending: 'drive.chip.pending', offline: 'drive.chip.offline', auth: 'drive.chip.auth', error: 'drive.chip.error', conflict: 'drive.chip.conflict', newer: 'drive.chip.newer' };
  const m = dmeta();
  const tip = s === 'ok' && m && m.last ? t('drive.tip.last', ago(m.last)) : s === 'syncing' && GS.progress ? GS.progress : GS.err || t('drive.tip.' + (L[s] ? s : 'off'));
  const warn = ['offline', 'auth', 'error', 'conflict', 'newer'].includes(s);
  const ic = s === 'ok' ? 'check' : s === 'syncing' ? 'refresh' : warn ? 'alert' : 'cloud';
  const click = () => { if (s === 'conflict') driveConflictDialog(); else if (s === 'newer' && GS.remote) driveRun(async () => { const mm = dmeta(); try { setPhase('syncing'); await driveApply(mm, GS.remote.lay, GS.remote.doc); GS.remote = null; GS.newerN = 0; setPhase('idle'); } catch (e) { driveFail(e); } }); else openDrivePanel(); };
  const label = t(L[s]) + (s === 'syncing' && GS.progress ? ' ' + GS.progress : '');
  return h('button', { class: 'btn stat drive-chip' + (warn ? ' warn' : '') + (s === 'syncing' ? ' busy' : ''), 'data-tip': tip, onclick: click }, icon(ic, 15), label);
}

/* ====== окно «Google Диск» ====== */
function closeDrivePanel() { if (GS.panel && !GS.panel.m.closed) GS.panel.m.close(); }
function openDrivePanel() {
  closePopover();
  if (!GD) return;
  if (GS.panel && !GS.panel.m.closed) return;
  const st = { m: null, root: h('div', { class: 'view dr-view' }), draft: { clientId: '', clientSecret: '' }, editKeys: false, projects: null, backups: null, loadingP: false, loadingB: false, statusEl: null };
  GS.panel = st;
  st.m = openModal({
    cls: 'drive-m', onClose: () => { if (GS.panel === st) GS.panel = null; if (GS.signing && GD) GD.cancelSignIn().catch(() => { }); },
    build: m => { st.m = m; return h('div', { class: 'm-wrap' }, modalHead(t('drive.title'), m), h('div', { class: 'm-body' }, h('div', { class: 'm-main' }, st.root))); }
  });
  renderDrivePanel(st);
  driveRefreshStatus().then(() => { if (!st.m.closed) { st.draft.clientId = GS.cfg.clientId || ''; renderDrivePanel(st); } });
}
function renderDriveStatus(st) {
  if (!st.statusEl) return;
  const s = driveState(), m = dmeta();
  const lines = [];
  const L = { syncing: 'drive.chip.syncing', ok: 'drive.chip.ok', pending: 'drive.chip.pending', offline: 'drive.chip.offline', auth: 'drive.chip.auth', error: 'drive.chip.error', conflict: 'drive.chip.conflict', newer: 'drive.chip.newer', off: 'drive.chip.off' };
  lines.push(h('b', t(L[s] || 'drive.chip.off') + (s === 'syncing' && GS.progress ? ' · ' + GS.progress : '')));
  if (m && m.last) lines.push(h('span', { class: 'hint' }, t('drive.last', fmtTime(m.last))));
  if (GS.err && ['offline', 'auth', 'error'].includes(s)) lines.push(h('span', { class: 'err-t' }, GS.err));
  st.statusEl.className = 'dr-status ' + s;
  st.statusEl.replaceChildren(...lines);
}
function renderDrivePanel(st) {
  if (!st || st.m.closed) return;
  const keep = st.m.card.querySelector('.m-main'); const top = keep ? keep.scrollTop : 0;
  const parts = [];

  /* 1. подключение */
  const needKeys = !GS.st.configured || st.editKeys;
  const acc = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('cloud', 16), h('b', t('drive.acc'))));
  if (needKeys) {
    const ci = h('input', { class: 'inp mono', type: 'text', spellcheck: 'false', placeholder: '123456789-abc.apps.googleusercontent.com', value: st.draft.clientId });
    const cs = h('input', { class: 'inp mono', type: 'password', spellcheck: 'false', placeholder: GS.cfg.hasSecret ? t('drive.secret.kept') : 'GOCSPX-…', value: st.draft.clientSecret });
    ci.addEventListener('input', () => { st.draft.clientId = ci.value; }); cs.addEventListener('input', () => { st.draft.clientSecret = cs.value; });
    acc.append(h('div', { class: 'hint', style: { marginBottom: '10px' } }, t('drive.keys.intro')),
      h('details', { class: 'dr-steps', open: !GS.st.configured }, h('summary', t('drive.steps.h')),
        h('ol', [1, 2, 3, 4, 5].map(i => h('li', t('drive.step' + i)))),
        h('div', { class: 'row-actions left' },
          h('button', { class: 'btn sm', onclick: () => DESK.openExternal('https://console.cloud.google.com/projectcreate') }, icon('open', 13), t('drive.link.project')),
          h('button', { class: 'btn sm', onclick: () => DESK.openExternal('https://console.cloud.google.com/apis/library/drive.googleapis.com') }, icon('open', 13), t('drive.link.api')),
          h('button', { class: 'btn sm', onclick: () => DESK.openExternal('https://console.cloud.google.com/auth/overview') }, icon('open', 13), t('drive.link.consent')),
          h('button', { class: 'btn sm', onclick: () => DESK.openExternal('https://console.cloud.google.com/auth/clients') }, icon('open', 13), t('drive.link.clients')))),
      h('div', { class: 'grid2' }, field(t('drive.f.id'), ci), field(t('drive.f.secret'), cs)),
      h('div', { class: 'row-actions left' },
        h('button', { class: 'btn primary', onclick: async () => {
          try { GS.cfg = await GD.setConfig({ clientId: st.draft.clientId, clientSecret: st.draft.clientSecret }); st.draft.clientSecret = ''; st.editKeys = false; await driveRefreshStatus(); toast(t('drive.keys.saved'), 3200); driveRefreshUI(); renderDrivePanel(st); }
          catch (e) { toast(gdErr(e).msg, 6000); }
        } }, icon('check', 15), t('drive.keys.save')),
        GS.st.configured ? h('button', { class: 'btn', onclick: () => { st.editKeys = false; renderDrivePanel(st); } }, t('c.cancel')) : null));
    if (GS.cfg.bundled) acc.append(h('div', { class: 'hint' }, t('drive.bundled')));
  } else if (!GS.st.signedIn) {
    acc.append(h('div', { class: 'hint', style: { marginBottom: '10px' } }, t('drive.signin.t')),
      h('div', { class: 'row-actions left' },
        GS.signing
          ? [h('span', { class: 'hint' }, t('drive.waiting')), h('button', { class: 'btn', onclick: () => GD.cancelSignIn().catch(() => { }) }, t('c.cancel'))]
          : [h('button', { class: 'btn primary', onclick: () => driveSignIn() }, icon('user', 15), t('drive.signin')),
            h('button', { class: 'btn', onclick: () => { st.editKeys = true; st.draft.clientId = GS.cfg.clientId; renderDrivePanel(st); } }, icon('sliders', 15), t('drive.keys.edit'))]));
    if (GS.phase === 'auth' && GS.err) acc.append(h('div', { class: 'err-t', style: { marginTop: '8px' } }, GS.err));
  } else {
    acc.append(h('div', { class: 'dr-acc' }, icon('check', 16), h('span', t('drive.as', GS.st.email || '—'))),
      h('div', { class: 'row-actions left' },
        h('button', { class: 'btn', onclick: async () => { GS.st = await GD.signOut(); st.projects = null; st.backups = null; clearTimeout(GS.timer); setPhase('idle'); renderDrivePanel(st); } }, t('drive.signout')),
        h('button', { class: 'btn', onclick: () => { st.editKeys = true; st.draft.clientId = GS.cfg.clientId; renderDrivePanel(st); } }, icon('sliders', 15), t('drive.keys.edit'))));
    if (!GS.st.encrypted) acc.append(h('div', { class: 'hint warn-t', style: { marginTop: '8px' } }, t('drive.plain')));
  }
  parts.push(acc);

  /* 2. этот проект */
  if (GS.st.signedIn) {
    const m = dmeta(), on = !!(m && m.on);
    const card = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('layers', 16), h('b', t('drive.proj')), h('span', { class: 'hint' }, P.name)));
    card.append(h('div', { class: 'opt-row' }, switchEl(on, v => { if (v) driveEnable(); else driveDisable(); setTimeout(() => renderDrivePanel(st), 60); }),
      h('div', { class: 'opt-t' }, h('div', t('drive.proj.on')), h('div', { class: 'hint' }, t('drive.proj.on.h')))));
    st.statusEl = h('div', { class: 'dr-status' }); card.append(st.statusEl);
    if (on) {
      card.append(h('div', { class: 'row-actions left', style: { margin: '10px 0 4px' } },
        h('button', { class: 'btn', onclick: () => driveSyncNow() }, icon('refresh', 15), t('drive.now')),
        m && m.folderId ? h('button', { class: 'btn', onclick: () => DESK.openExternal('https://drive.google.com/drive/folders/' + m.folderId) }, icon('folder', 15), t('drive.folder')) : null,
        GS.remote && GS.remote.kind !== 'newer' ? h('button', { class: 'btn danger-fill', onclick: () => driveConflictDialog() }, icon('alert', 15), t('drive.resolve')) : null));
      const ev = h('select', { class: 'inp sm' }, [15, 30, 60, 180].map(n => h('option', { value: n }, t('drive.every', n))));
      ev.value = String(DM.opts.every); ev.addEventListener('change', () => { DM.opts.every = +ev.value; dmSave(); });
      const kp = h('select', { class: 'inp sm' }, [10, 20, 50, 100].map(n => h('option', { value: n }, t('drive.keep', n))));
      kp.value = String(DM.opts.keep); kp.addEventListener('change', () => { DM.opts.keep = +kp.value; dmSave(); });
      card.append(h('div', { class: 'msep' }),
        h('div', { class: 'opt-row' }, switchEl(!!DM.opts.backups, v => { DM.opts.backups = v; dmSave(); }), h('div', { class: 'opt-t' }, h('div', t('drive.bk')), h('div', { class: 'hint' }, t('drive.bk.h')))),
        h('div', { class: 'grid2' }, field(t('drive.bk.every'), ev), field(t('drive.bk.keep'), kp)),
        h('div', { class: 'opt-row' }, switchEl(!!DM.opts.lazy, v => { DM.opts.lazy = v; MF.neg.clear(); dmSave(); }), h('div', { class: 'opt-t' }, h('div', t('mf.lazy')), h('div', { class: 'hint' }, t('mf.lazy.h')))),
        h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', id: 'dr-missing', onclick: () => openMissingFiles() }, icon('cloud', 14), t('mf.btn'))));
    }
    parts.push(card);

    /* 3. копии */
    if (on) {
      const bc = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('save', 16), h('b', t('drive.bk.list')), h('div', { class: 'grow' }),
        h('button', { class: 'btn sm', onclick: () => { st.backups = null; renderDrivePanel(st); } }, icon('refresh', 13), t('drive.reload'))));
      const box = h('div', { class: 'dr-list' }); bc.append(box);
      if (st.backups) {
        if (!st.backups.length) box.append(h('div', { class: 'empty small' }, t('drive.bk.none')));
        st.backups.slice(0, 30).forEach(f => {
          let info = {}; try { info = JSON.parse(f.description || '{}'); } catch (e) { info = {}; }
          box.append(h('div', { class: 'dr-row' }, h('div', { class: 'dr-t' }, h('b', fmtTime(f.modifiedTime)), h('span', { class: 'hint' }, [info.device, info.tag, info.nodes != null ? t('drive.blocks', info.nodes) : ''].filter(Boolean).join(' · '))),
            h('button', { class: 'btn sm', onclick: () => driveRestoreBackup(f) }, icon('undo', 13), t('drive.rb.btn'))));
        });
      } else {
        box.append(h('div', { class: 'empty small' }, t('drive.loading')));
        if (!st.loadingB && m && m.backupsId) {
          st.loadingB = true;
          GD.find({ parentId: m.backupsId, folder: false }).then(l => { st.backups = l.filter(x => x.appProperties && x.appProperties.vnmapKind === 'backup').sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime))); }).catch(() => { st.backups = []; })
            .finally(() => { st.loadingB = false; renderDrivePanel(st); });
        } else if (!m || !m.backupsId) box.replaceChildren(h('div', { class: 'empty small' }, t('drive.bk.none')));
      }
      parts.push(bc);
    }

    /* 4. проекты на Диске */
    const pc = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('folder', 16), h('b', t('drive.list')), h('div', { class: 'grow' }),
      h('button', { class: 'btn sm', onclick: () => { st.projects = null; renderDrivePanel(st); } }, icon('refresh', 13), t('drive.reload'))));
    pc.append(h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('drive.list.h')));
    const pbox = h('div', { class: 'dr-list' }); pc.append(pbox);
    if (st.projects) {
      if (!st.projects.length) pbox.append(h('div', { class: 'empty small' }, t('drive.list.none')));
      st.projects.forEach(e => pbox.append(h('div', { class: 'dr-row' },
        h('div', { class: 'dr-t' }, h('b', e.name + (e.uid === P.uid ? ' ' + t('drive.current') : '')), h('span', { class: 'hint' }, [fmtTime(e.time), e.device, e.nodes != null ? t('drive.blocks', e.nodes) : ''].filter(Boolean).join(' · '))),
        e.uid === P.uid ? null : h('button', { class: 'btn sm', onclick: () => driveOpenRemote(e) }, icon('download', 13), t('drive.open')))));
    } else {
      pbox.append(h('div', { class: 'empty small' }, t('drive.loading')));
      if (!st.loadingP) {
        st.loadingP = true;
        driveListProjects().then(l => { st.projects = l; }).catch(e => { st.projects = []; toast(gdErr(e).msg, 5000); })
          .finally(() => { st.loadingP = false; renderDrivePanel(st); });
      }
    }
    parts.push(pc);
  } else st.statusEl = null;

  st.root.replaceChildren(...parts);
  renderDriveStatus(st);
  const mm = st.m.card.querySelector('.m-main'); if (mm) mm.scrollTop = top;
}

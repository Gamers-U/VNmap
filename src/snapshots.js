'use strict';
/* ====== Резервные копии проекта (до 1.7.7 назывались «Снимки проекта»; живут во вкладке «Копии» настроек) ======
   Резервная копия это полная копия проекта на момент времени. Три вида:
   • автокопия: программа делает её сама, пока вы работаете (раз в N минут, если что-то изменилось, и при открытии программы);
   • страховка: делается перед тем, как проект заменяется другим (открыли файл, загрузили с GitHub, новый проект) и перед восстановлением снимка;
   • своя копия: вы назвали её сами, она не удаляется сама.
   Хранятся внутри программы (IndexedDB), не в файле проекта и не на GitHub, поэтому работают одинаково в браузере, на телефоне и в десктопе.
   Восстановление идёт как обычная правка: его можно отменить Ctrl+Z, привязка к файлу и к GitHub не сбивается. */

Object.assign(D, {
  'sn.btn': ['Резервные копии…', 'Backups…'],
  'sn.badge': [' Нажмите, чтобы открыть резервные копии.', ' Click to open the backups.'],
  'sn.tip': ['Резервные копии проекта на разные моменты: вернуться назад или посмотреть, что изменилось', 'Backups of the project at different moments: go back or see what has changed'],
  'sn.title': ['Резервные копии', 'Backups'],
  'ui.tab.backup': ['Копии', 'Backups'],
  'sn.lead': ['Копия проекта на момент времени. Программа делает её сама, пока вы работаете, и перед тем, как заменить проект другим. Свою копию удобно сделать перед рискованной правкой.',
    'A copy of the project at a moment in time. The app makes them by itself while you work and before replacing the project with another. A copy of your own is handy before a risky edit.'],
  'sn.name': ['Название копии', 'Backup name'], 'sn.name.ph': ['Например: до правки финала', 'For example: before the finale rewrite'],
  'sn.take': ['Сделать копию', 'Make a backup'], 'sn.taken': ['Копия сохранена', 'Backup saved'],
  'sn.auto': ['Автокопии', 'Automatic copies'], 'sn.every': ['раз в', 'every'], 'sn.min': ['{0} мин', '{0} min'], 'sn.keep': ['хранить', 'keep'], 'sn.n': ['{0} шт.', '{0}'],
  'sn.k.auto': ['Автокопия', 'Automatic'], 'sn.k.safe': ['Страховка', 'Safety'], 'sn.k.named': ['Моя копия', 'Yours'],
  'sn.why.tick': ['пока вы работали', 'while you worked'], 'sn.why.open': ['при открытии программы', 'when the app was opened'], 'sn.why.hide': ['при выходе из окна', 'when you left the window'],
  'sn.why.replace': ['перед заменой проекта', 'before the project was replaced'], 'sn.why.restore': ['перед восстановлением копии', 'before a backup was restored'],
  'sn.meta': ['{0} · блоков: {1} · слов: {2} · {3}', '{0} · blocks: {1} · words: {2} · {3}'],
  'sn.today': ['сегодня {0}', 'today {0}'], 'sn.yday': ['вчера {0}', 'yesterday {0}'],
  'sn.compare': ['Сравнить', 'Compare'], 'sn.restore': ['Восстановить', 'Restore'], 'sn.dl': ['Скачать копию', 'Download a copy'], 'sn.ren': ['Переименовать', 'Rename'], 'sn.del': ['Удалить', 'Delete'],
  'sn.empty': ['Копий пока нет. Первая автокопия появится через несколько минут работы или сразу после того, как вы нажмёте «Сделать копию».', 'No backups yet. The first automatic copy appears after a few minutes of work, or right away when you press Make a backup.'],
  'sn.nodb': ['В этом браузере хранилище для копий недоступно (возможно, включён приватный режим). Скачивайте проект через «Файл → Сохранить».', 'Backup storage is not available in this browser (private mode, maybe). Download the project with File → Save.'],
  'sn.foot': ['Копии лежат в этой программе или браузере, а не в файле проекта и не на GitHub. Чтобы унести копию, нажмите «Скачать копию».', 'Backups live in this app or browser, not in the project file or on GitHub. To take one away press Download a copy.'],
  'sn.rest.q': ['Вернуть проект к копии?', 'Return the project to the backup?'],
  'sn.rest.t': ['Проект станет таким, каким он был {0}. Текущее состояние программа сохранит отдельной копией «Страховка», а само восстановление можно отменить Ctrl+Z.', 'The project will become what it was {0}. The app saves the current state as a Safety copy, and the restore itself can be undone with Ctrl+Z.'],
  'sn.rest.done': ['Проект возвращён к копии. Отменить: Ctrl+Z', 'The project was returned to the backup. Undo: Ctrl+Z'],
  'sn.del.q': ['Удалить копию?', 'Delete the backup?'], 'sn.del.t': ['«{0}» будет удалена без возможности вернуть.', '“{0}” will be deleted for good.'],
  'sn.ren.q': ['Новое название копии', 'New backup name'],
  'sn.disk': ['Копировать резервные копии в папку рядом с файлом проекта', 'Copy backups to a folder next to the project file'],
  'sn.disk.h': ['Папка «<имя проекта> (snapshots)» появится рядом с файлом при первой копии. Так копии переживают очистку данных программы и переезжают вместе с проектом. Файлы из неё можно открыть как обычный проект.', 'The “<project name> (snapshots)” folder appears next to the file with the first backup. That way backups survive clearing the app data and travel with the project. The files can be opened as an ordinary project.'],
  'sn.disk.at': ['Папка: {0}. Файлов в ней: {1}.', 'Folder: {0}. Files in it: {1}.'],
  'sn.disk.open': ['Открыть папку', 'Open the folder'],
  'sn.foot.disk': ['Копии лежат в этой программе и в папке рядом с файлом проекта, но не внутри самого файла и не на GitHub. Чтобы унести копию, возьмите файл из папки или нажмите «Скачать копию».', 'Backups live in this app and in the folder next to the project file, but not inside the file itself and not on GitHub. To take one away, grab the file from the folder or press “Download a copy”.'],
  'sn.disk.old': ['Чтобы резервные копии записывались в папку рядом с файлом проекта, переустановите программу (нужна оболочка версии 1.6.13 или новее).', 'To write backups next to the project file, reinstall the app (shell version 1.6.13 or newer is needed).'],
  'sn.disk.nobind': ['Сохраните проект в файл (Ctrl+S): тогда копии будут записываться ещё и в папку рядом с ним.', 'Save the project to a file (Ctrl+S): backups will then also be written to a folder next to it.'],
  'sn.disk.fail': ['Не удалось записать копию в папку рядом с проектом: {0}', 'Could not write the backup to the folder next to the project: {0}'],
  'sn.meta.disk': ['{0} · из папки рядом с проектом · {1}', '{0} · from the folder next to the project · {1}'],
  'sn.bad': ['Копия повреждена или не читается', 'The backup is damaged or unreadable'],
  'sn.d.title': ['Что изменилось с этой копии', 'What has changed since this backup'],
  'sn.d.lead': ['Копия от {0} и проект сейчас. «Новое» — то, что появилось после копии, «Пропало» — то, что было в копии, а сейчас нет и вернётся при восстановлении.', 'The backup of {0} against the project now. New is what appeared after the backup; Gone is what was in the backup but is not now and would come back on restore.'],
  'sn.d.same': ['Копия и проект сейчас совпадают.', 'The backup and the project are identical now.'],
  'sn.d.added': ['Новые блоки', 'New blocks'], 'sn.d.removed': ['Пропали блоки', 'Gone blocks'], 'sn.d.changed': ['Изменены блоки', 'Changed blocks'],
  'sn.d.other': ['Остальное', 'Everything else'],
  'sn.d.words': ['слов: {0}', 'words: {0}'],
  'sn.d.f.add': ['добавлена глава «{0}»', 'chapter “{0}” added'], 'sn.d.f.rem': ['пропала глава «{0}»', 'chapter “{0}” gone'],
  'sn.d.f.edit': ['глава «{0}» изменена{1}', 'chapter “{0}” changed{1}'],
  'sn.d.ttl': ['название: «{0}» → «{1}»', 'title: “{0}” → “{1}”'], 'sn.d.typ': ['тип: {0} → {1}', 'type: {0} → {1}'], 'sn.d.desc': ['описание изменено', 'description changed'], 'sn.d.pos': ['блок передвинут', 'block moved'],
  'sn.d.edges': ['Стрелки: добавлено {0}, пропало {1}', 'Arrows: {0} added, {1} gone'],
  'sn.d.cnt': ['{0}: было {1}, стало {2}', '{0}: was {1}, now {2}'],
  'sn.d.show': ['Показать на карте', 'Show on the map'],
  'sn.d.more': ['…и ещё {0}', '…and {0} more'],
  'sn.d.name': ['Название проекта: «{0}» → «{1}»', 'Project name: “{0}” → “{1}”'],
  'sn.d.chars': ['Персонажи', 'Characters'], 'sn.d.vars': ['Переменные', 'Variables'], 'sn.d.assets': ['Ресурсы', 'Assets'], 'sn.d.achs': ['Достижения', 'Achievements'], 'sn.d.members': ['Участники', 'Members'],
});

const SN = { dbp: null, ver: -1, at: 0, busy: false, live: false, timer: null };
const SN_AUTO_EVERY = [5, 10, 30, 60], SN_AUTO_KEEP = [5, 15, 30], SN_SAFE_KEEP = 10, SN_SHOW_MAX = 40;

function snCfg() {
  if (!S.snap || typeof S.snap !== 'object') S.snap = {};
  const c = S.snap;
  if (typeof c.auto !== 'boolean') c.auto = true;
  if (!SN_AUTO_EVERY.includes(c.every)) c.every = 10;
  if (!SN_AUTO_KEEP.includes(c.keep)) c.keep = 15;
  if (typeof c.disk !== 'boolean') c.disk = true;        // ПК: копии ещё и в папку рядом с файлом проекта
  return c;
}

/* ---------- хранилище ---------- */
function snDb() {
  if (SN.dbp) return SN.dbp;
  SN.dbp = new Promise(res => {
    try {
      if (typeof indexedDB === 'undefined' || !indexedDB) return res(null);
      const rq = indexedDB.open('vnmap-snaps', 1);
      rq.onupgradeneeded = () => { const d = rq.result; d.createObjectStore('meta', { keyPath: 'id' }); d.createObjectStore('data', { keyPath: 'id' }); };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null); rq.onblocked = () => res(null);
    } catch (e) { res(null); }
  });
  return SN.dbp;
}
const snReq = rq => new Promise(res => { rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); });
/** Список снимков проекта (без самих данных), новые сверху. null, если хранилища нет. */
async function snList(uid) {
  const db = await snDb(); if (!db) return null;
  try {
    const all = await snReq(db.transaction('meta').objectStore('meta').getAll());
    return (all || []).filter(m => !uid || m.uid === uid).sort((a, b) => b.t - a.t);
  } catch (e) { return null; }
}
async function snGet(id) {
  if (String(id).startsWith('disk:')) { const sd = SND(); if (!sd) return null; try { return await sd.read(String(id).slice(5)); } catch (e) { return null; } }       // снимок из папки рядом с проектом
  const db = await snDb(); if (!db) return null;
  try { const r = await snReq(db.transaction('data').objectStore('data').get(id)); return r ? r.json : null; } catch (e) { return null; }
}
function snWrite(db, fn) {
  return new Promise(res => {
    try { const tx = db.transaction(['meta', 'data'], 'readwrite'); fn(tx.objectStore('meta'), tx.objectStore('data')); tx.oncomplete = () => res(true); tx.onerror = tx.onabort = () => res(false); } catch (e) { res(false); }
  });
}
async function snDelete(ids) {
  const sd = SND(), disk = ids.filter(id => String(id).startsWith('disk:')), mem = ids.filter(id => !String(id).startsWith('disk:'));
  if (sd) for (const id of disk) { try { await sd.remove(String(id).slice(5)); } catch (e) { /* не страшно */ } }
  if (!mem.length) return disk.length > 0;
  const db = await snDb(); if (!db) return false;
  return snWrite(db, (m, d) => mem.forEach(id => { m.delete(id); d.delete(id); }));
}
async function snRename(id, name) {
  const db = await snDb(); if (!db) return false;
  const m = db.transaction('meta').objectStore('meta'); const cur = await snReq(m.get(id)); if (!cur) return false;
  cur.name = String(name).slice(0, 120); return snWrite(db, ms => ms.put(cur));
}
/** Быстрая подпись текста: одинаковые проекты не сохраняются подряд дважды. */
function snSig(s) { let a = 2166136261; for (let i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 16777619); } return (a >>> 0).toString(36) + ':' + s.length; }

/** Сделать снимок текущего проекта. why: manual (свой, с названием), tick, open, hide (автокопии), replace, restore (страховка).
    Данные берутся сразу, запись идёт позже: проект можно менять дальше. Возвращает мета-запись или null (нечего сохранять). */
async function snTake(why, name) {
  try {
    if ((typeof GAME !== 'undefined' && GAME) || !P || !P.nodes.length) return null;
    const json = JSON.stringify(P), sig = snSig(json);
    const stats = { nodes: P.nodes.length, files: P.nodes.reduce((a, n) => a + n.files.length, 0), words: typeof mxWords === 'function' ? mxWords() : 0 };
    const uid0 = P.uid, pname = P.name, path0 = typeof DS !== 'undefined' ? DS.path : '';
    const db = await snDb(); if (!db) return null;
    const list = (await snList(uid0)) || [];
    const manual = why === 'manual';
    if (!manual && list[0] && list[0].sig === sig) return null;
    const kind = manual ? 'named' : (why === 'replace' || why === 'restore' ? 'safe' : 'auto');
    const meta = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), uid: uid0, pname, t: Date.now(), kind, why, name: manual ? String(name || '').trim().slice(0, 120) : '', sig, bytes: json.length, nodes: stats.nodes, files: stats.files, words: stats.words };
    const ok = await snWrite(db, (m, d) => { m.put(meta); d.put({ id: meta.id, json }); });
    if (!ok) return null;
    if (kind !== 'named') {
      const keep = kind === 'auto' ? snCfg().keep : SN_SAFE_KEEP;
      const old = list.filter(x => x.kind === kind).slice(keep - 1).map(x => x.id);        // с новой записью останется ровно keep
      if (old.length) await snDelete(old);
    }
    await snDiskPut(meta, json, path0);
    return meta;
  } catch (e) { return null; }
}
/** Проект сейчас будет заменён другим (setProject): сохранить прежний. */
function snBeforeReplace() { if (SN.live) snTake('replace'); }
function snTick(why) {
  const c = snCfg();
  if (!SN.live || !c.auto || SN.busy || !P || !P.nodes.length || (typeof GAME !== 'undefined' && GAME)) return;
  if (SN.ver === DATA_VER) return;
  if (why === 'tick' && Date.now() - SN.at < c.every * 60e3) return;
  SN.busy = true;
  snTake(why).catch(() => null).then(() => { SN.busy = false; SN.at = Date.now(); SN.ver = DATA_VER; });
}
function snStart() {
  if (SN.timer) return;
  SN.timer = setInterval(() => snTick('tick'), 60e3);
  document.addEventListener('visibilitychange', () => { if (document.hidden && Date.now() - SN.at > 120e3) snTick('hide'); });
  setTimeout(() => { SN.live = true; SN.at = Date.now() - snCfg().every * 60e3; snTick('open'); }, 6000);
}

/* ---------- копии рядом с файлом проекта (ПК, оболочка 1.6.13 и новее) ----------
   Каждая копия ещё и пишется файлом `ГГГГ-ММ-ДД_ЧЧ-ММ-СС_вид[_название].json` в папку «<имя проекта> (snapshots)» рядом с .vnmap. Так снимки переживают очистку данных
   программы и переезжают вместе с проектом на другой компьютер. Эти файлы можно открыть как обычный проект. Лишние автокопии и страховки оболочка удаляет сама. */
const SND = () => (typeof DESK !== 'undefined' && DESK && DESK.snap ? DESK.snap : null);
const snStamp = ms => { const d = new Date(ms), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + '-' + p(d.getMinutes()) + '-' + p(d.getSeconds()); };
const snStampMs = s => { const m = /^(\d{4})-(\d\d)-(\d\d)_(\d\d)-(\d\d)-(\d\d)$/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : 0; };
const snDiskOn = () => !!(SND() && typeof DS !== 'undefined' && DS.path && snCfg().disk !== false);
async function snDiskPut(meta, json, path0) {
  if (!snDiskOn() || DS.path !== path0) return;                                 // проект успели отвязать или перепривязать: чужой файл не трогаем
  try {
    const r = await SND().save({ path: path0, stamp: snStamp(meta.t), kind: meta.kind, label: meta.name, text: json, keepAuto: snCfg().keep, keepSafe: SN_SAFE_KEEP });
    if (r && r.ok) { SN.disk = { dir: r.dir, err: '' }; return; }
    if (r && r.code === 'moved') return;
    SN.disk = { dir: '', err: (r && (r.msg || r.code)) || '?' };
  } catch (e) { SN.disk = { dir: '', err: String((e && e.message) || e || '?').replace(/^Error invoking remote method '[^']+': (Error: )?/, '') }; }
  if (!SN.diskWarned) { SN.diskWarned = true; toast(t('sn.disk.fail', SN.disk.err), 6500); }
}
/** Список для окна: снимки программы плюс те, что лежат только в папке рядом с проектом (после очистки данных или на другом компьютере). */
async function snListAll(uid) {
  const idb = await snList(uid), sd = SND();
  if (!sd || typeof DS === 'undefined' || !DS.path) return { list: idb, disk: null };
  let info = null; try { info = await sd.info(); } catch (e) { info = null; }
  if (!info || !info.ok) return { list: idb, disk: null };
  const have = new Set((idb || []).map(m => m.kind + '|' + snStamp(m.t))), twin = new Map(info.items.map(it => [it.kind + '|' + it.stamp, it.file]));
  for (const m of idb || []) m.twin = twin.get(m.kind + '|' + snStamp(m.t)) || '';
  const only = info.items.filter(it => !have.has(it.kind + '|' + it.stamp)).map(it => ({ id: 'disk:' + it.file, uid, pname: P.name, t: snStampMs(it.stamp) || it.mtime, kind: it.kind, why: it.kind === 'auto' ? 'tick' : it.kind === 'safe' ? 'replace' : '', name: it.label, bytes: it.size, nodes: 0, files: 0, words: 0, disk: true }));
  return { list: idb === null && !only.length ? null : (idb || []).concat(only).sort((a, b) => b.t - a.t), disk: { dir: info.dir, count: info.items.length, only: only.length } };
}

/* ---------- восстановление и скачивание ---------- */
function snWhen(ts) {
  const d = new Date(ts), now = new Date(), hm = d.toLocaleTimeString(S.lang === 'en' ? 'en-GB' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), diff = Math.round((day(now) - day(d)) / 864e5);
  if (diff === 0) return t('sn.today', hm);
  if (diff === 1) return t('sn.yday', hm);
  return d.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'ru-RU', { day: '2-digit', month: '2-digit', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' }) + ' ' + hm;
}
const snLabel = m => (m.kind === 'named' ? (m.name || t('sn.k.named')) : t('sn.k.' + m.kind) + ': ' + t('sn.why.' + (m.why || 'tick')));
async function snRestore(m) {
  const json = await snGet(m.id);
  let np = null; try { np = json ? normalize(JSON.parse(json)) : null; } catch (e) { np = null; }
  if (!np) { toast(t('sn.bad')); return false; }
  if (!(await confirmDlg({ title: t('sn.rest.q'), text: t('sn.rest.t', snWhen(m.t)), ok: t('sn.restore'), danger: true }))) return false;
  await snTake('restore');
  flushHistory();
  const v = P.view, tt = P.teTabs; np.uid = P.uid; if (tt) np.teTabs = tt;                                                         // тот же проект: привязки к файлу, GitHub и Диску остаются
  P = np; P.view = v; reindex();
  for (const id of [...UI.sel]) if (!nodeById(id)) UI.sel.delete(id);
  if (UI.edge && !edgeById(UI.edge)) UI.edge = null;
  commit(true); onProjectReplaced();
  toast(t('sn.rest.done'), 6000);
  return true;
}
async function snDownload(m) {
  const json = await snGet(m.id); if (!json) { toast(t('sn.bad')); return; }
  const nm = String(m.pname || 'project').replace(/[^\wА-Яа-яЁё\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'project';
  const stamp = new Date(m.t).toISOString().slice(0, 16).replace(/[-:T]/g, '');
  saveFile(nm + '-' + stamp + '.json', json, 'application/json');
}

/* ---------- сравнение ---------- */
const snTxt = f => (f.script || '') + '\u0001' + (f.text || '');
/** Что изменилось между снимком (old) и текущим проектом (cur). Ничего не меняет. */
function snDiff(oldP, curP) {
  const out = { added: [], removed: [], changed: [], edgesAdd: 0, edgesGone: 0, counts: [], name: null };
  const om = new Map(oldP.nodes.map(n => [n.id, n])), cm = new Map(curP.nodes.map(n => [n.id, n]));
  for (const n of curP.nodes) if (!om.has(n.id)) out.added.push({ id: n.id, title: n.title, words: n.type === 'note' ? 0 : nodeWords(n) });
  for (const n of oldP.nodes) if (!cm.has(n.id)) out.removed.push({ title: n.title, words: n.type === 'note' ? 0 : nodeWords(n) });
  for (const n of curP.nodes) {
    const o = om.get(n.id); if (!o) continue;
    const notes = [];
    if (o.title !== n.title) notes.push(t('sn.d.ttl', o.title, n.title));
    if (o.type !== n.type) notes.push(t('sn.d.typ', t('type.' + o.type), t('type.' + n.type)));
    if ((o.desc || '') !== (n.desc || '')) notes.push(t('sn.d.desc'));
    const of = new Map(o.files.map(f => [f.id, f])), nf = new Map(n.files.map(f => [f.id, f]));
    for (const f of n.files) {
      const x = of.get(f.id);
      if (!x) { notes.push(t('sn.d.f.add', f.title)); continue; }
      if (snTxt(x) !== snTxt(f) || x.title !== f.title) {
        const dw = fileWords(f) - fileWords(x);
        notes.push(t('sn.d.f.edit', f.title, dw ? ' (' + t('sn.d.words', (dw > 0 ? '+' : '') + dw) + ')' : ''));
      }
    }
    for (const f of o.files) if (!nf.has(f.id)) notes.push(t('sn.d.f.rem', f.title));
    if (!notes.length && (Math.abs(o.x - n.x) > 1 || Math.abs(o.y - n.y) > 1)) notes.push(t('sn.d.pos'));
    if (notes.length) out.changed.push({ id: n.id, title: n.title, notes });
  }
  const ek = e => e.from + '>' + e.to, oe = new Set(oldP.edges.map(ek)), ce = new Set(curP.edges.map(ek));
  for (const k of ce) if (!oe.has(k)) out.edgesAdd++;
  for (const k of oe) if (!ce.has(k)) out.edgesGone++;
  for (const [key, a, b] of [['sn.d.chars', oldP.characters, curP.characters], ['sn.d.vars', oldP.vars, curP.vars], ['sn.d.assets', oldP.assets, curP.assets], ['sn.d.achs', oldP.achs, curP.achs], ['sn.d.members', oldP.members, curP.members]])
    if (a.length !== b.length) out.counts.push(t('sn.d.cnt', t(key), a.length, b.length));
  if (oldP.name !== curP.name) out.name = t('sn.d.name', oldP.name, curP.name);
  out.empty = !out.added.length && !out.removed.length && !out.changed.length && !out.edgesAdd && !out.edgesGone && !out.counts.length && !out.name;
  return out;
}
async function snCompare(m) {
  const json = await snGet(m.id);
  let op = null; try { op = json ? normalize(JSON.parse(json)) : null; } catch (e) { op = null; }
  if (!op) { toast(t('sn.bad')); return; }
  const d = snDiff(op, P);
  const sect = (title, rows) => rows.length ? h('div', { class: 'sn-sec' }, h('div', { class: 'sn-sh' }, title + ' (' + rows.length + ')'), ...rows.slice(0, SN_SHOW_MAX), rows.length > SN_SHOW_MAX ? h('div', { class: 'hint' }, t('sn.d.more', rows.length - SN_SHOW_MAX)) : null) : null;
  const show = (dm, id) => h('button', { class: 'btn sm', 'data-tip': t('sn.d.show'), onclick: () => { dm.close(); if (SNW && SNW.m) SNW.m.close(); focusNode(id); } }, icon('target', 14));
  openModal({
    cls: 'sn-m sn-d', build: dm => h('div', { class: 'm-wrap' }, modalHead(t('sn.d.title'), dm),
      h('div', { class: 'sn-body' }, h('p', { class: 'hint' }, t('sn.d.lead', snWhen(m.t))),
        d.empty ? h('div', { class: 'empty' }, t('sn.d.same')) : [
          sect(t('sn.d.added'), d.added.map(x => h('div', { class: 'sn-row sn-drow', 'data-kind': 'added' }, h('div', { class: 'sn-main' }, h('b', x.title), x.words ? h('span', { class: 'hint' }, ' ' + t('sn.d.words', x.words)) : null), show(dm, x.id)))),
          sect(t('sn.d.removed'), d.removed.map(x => h('div', { class: 'sn-row sn-drow', 'data-kind': 'removed' }, h('div', { class: 'sn-main' }, h('b', x.title), x.words ? h('span', { class: 'hint' }, ' ' + t('sn.d.words', x.words)) : null)))),
          sect(t('sn.d.changed'), d.changed.map(x => h('div', { class: 'sn-row sn-drow', 'data-kind': 'changed' }, h('div', { class: 'sn-main' }, h('b', x.title), ...x.notes.map(s => h('div', { class: 'hint' }, s))), show(dm, x.id)))),
          (d.edgesAdd || d.edgesGone || d.counts.length || d.name) ? h('div', { class: 'sn-sec' }, h('div', { class: 'sn-sh' }, t('sn.d.other')),
            d.name ? h('div', { class: 'sn-line' }, d.name) : null, d.edgesAdd || d.edgesGone ? h('div', { class: 'sn-line' }, t('sn.d.edges', d.edgesAdd, d.edgesGone)) : null, ...d.counts.map(s => h('div', { class: 'sn-line' }, s))) : null]))
  });
}

/* ---------- окно ---------- */
let SNW = null;
/** Содержимое вкладки «Копии» в «Настройках»: сделать копию, автокопии, папка на диске, список с «Сравнить / Восстановить». m — окно настроек. */
function snPane(m) {
  const st = { list: undefined, name: '' };
  {
    {
      const body = h('div', { class: 'sn-body sn-pane' });
      SNW = { m, body, paint: null };
      const sel = (opts, val, fmt, on) => { const s = h('select', { class: 'inp sn-sel' }, opts.map(o => h('option', { value: o, selected: o === val }, fmt(o)))); s.addEventListener('change', () => on(+s.value)); return s; };
      const load = async () => { const r = await snListAll(P.uid); st.list = r.list; st.disk = r.disk; paint(); };
      const paint = () => {
        const c = snCfg();
        const nameI = h('input', { class: 'inp', id: 'sn-name', placeholder: t('sn.name.ph'), 'aria-label': t('sn.name'), value: st.name, maxlength: '120' });
        nameI.addEventListener('input', () => { st.name = nameI.value; });
        const take = async () => {
          const r = await snTake('manual', nameI.value || t('sn.k.named') + ' ' + snWhen(Date.now()));
          st.name = ''; if (r) toast(t('sn.taken')); await load();
        };
        nameI.addEventListener('keydown', e => { if (e.key === 'Enter') take(); });
        const autoChk = h('input', { type: 'checkbox', id: 'sn-auto', checked: c.auto }); autoChk.addEventListener('change', () => { c.auto = autoChk.checked; saveSettings(); paint(); });
        const head = h('div', { class: 'sn-top' },
          h('p', { class: 'hint' }, t('sn.lead')),
          h('div', { class: 'sn-take' }, nameI, h('button', { class: 'btn primary', id: 'sn-take', onclick: take }, icon('save', 15), t('sn.take'))),
          h('div', { class: 'sn-cfg' }, h('label', { class: 'ar-chk' }, autoChk, h('span', t('sn.auto'))),
            c.auto ? [h('span', { class: 'hint' }, t('sn.every')), sel(SN_AUTO_EVERY, c.every, v => t('sn.min', v), v => { c.every = v; saveSettings(); }),
              h('span', { class: 'hint' }, t('sn.keep')), sel(SN_AUTO_KEEP, c.keep, v => t('sn.n', v), v => { c.keep = v; saveSettings(); })] : null));
        const diskBox = () => {
          if (typeof DESK === 'undefined' || !DESK) return null;
          if (!SND()) return h('div', { class: 'hint sn-disk' }, t('sn.disk.old'));
          if (!DS.path) return h('div', { class: 'hint sn-disk' }, t('sn.disk.nobind'));
          const chk = h('input', { type: 'checkbox', id: 'sn-disk', checked: c.disk !== false }); chk.addEventListener('change', () => { c.disk = chk.checked; saveSettings(); paint(); });
          return h('div', { class: 'sn-disk' }, h('label', { class: 'ar-chk' }, chk, h('span', t('sn.disk'))),
            c.disk !== false && st.disk ? h('div', { class: 'hint' }, t('sn.disk.at', st.disk.dir, st.disk.count), ' ', h('button', { class: 'btn sm', id: 'sn-opendir', onclick: () => DESK.showInFolder(st.disk.dir) }, icon('folder', 14), t('sn.disk.open'))) : h('div', { class: 'hint' }, t('sn.disk.h')));
        };
        head.append(diskBox() || '');
        const rows = st.list === undefined ? [h('div', { class: 'hint' }, '…')] : st.list === null ? [h('div', { class: 'bs-hint warn' }, t('sn.nodb'))] : !st.list.length ? [h('div', { class: 'empty' }, t('sn.empty'))] : st.list.map(x => h('div', { class: 'sn-row', 'data-snap': x.id, 'data-kind': x.kind },
          h('span', { class: 'sn-badge ' + x.kind }, t('sn.k.' + x.kind)),
          h('div', { class: 'sn-main' }, h('b', x.kind === 'named' ? (x.name || t('sn.k.named')) : t('sn.why.' + (x.why || 'tick'))),
            h('div', { class: 'hint' }, x.disk ? t('sn.meta.disk', snWhen(x.t), humanSize(x.bytes)) : t('sn.meta', snWhen(x.t), x.nodes, x.words, humanSize(x.bytes)))),
          h('div', { class: 'sn-acts' },
            h('button', { class: 'btn sm sn-cmp', onclick: () => snCompare(x) }, t('sn.compare')),
            h('button', { class: 'btn sm primary sn-rest', onclick: async () => { if (await snRestore(x)) { m.close(); } } }, icon('undo', 14), t('sn.restore')),
            h('button', { class: 'btn icon sm', 'data-tip': t('sn.dl'), onclick: () => snDownload(x) }, icon('download', 15)),
            x.kind === 'named' && !x.disk ? h('button', { class: 'btn icon sm sn-ren', 'data-tip': t('sn.ren'), onclick: async () => { const v = await promptDlg({ title: t('sn.ren.q'), label: t('sn.name'), value: x.name || '', ok: t('sn.ren') }); if (v != null && String(v).trim()) { await snRename(x.id, String(v).trim()); load(); } } }, icon('type', 15)) : null,
            h('button', { class: 'btn icon sm sn-del', 'data-tip': t('sn.del'), onclick: async () => { if (await confirmDlg({ title: t('sn.del.q'), text: t('sn.del.t', x.kind === 'named' ? x.name : snLabel(x)), ok: t('sn.del'), danger: true })) { await snDelete([x.id].concat(x.twin ? ['disk:' + x.twin] : [])); load(); } } }, icon('trash', 15)))));
        body.replaceChildren(head, h('div', { class: 'sn-list' }, ...rows), h('div', { class: 'hint sn-foot' }, t(snDiskOn() ? 'sn.foot.disk' : 'sn.foot')));
      };
      SNW.paint = load;
      load();
      return body;
    }
  }
}
/** Старый вход (метка «Сохранено», меню «Файл», палитра) ведёт во вкладку «Копии» настроек. */
function openSnapshots() { openSettingsWindow('backup'); }
TOOL_ITEMS.push({ id: 'snapshots', group: 'files', ic: 'undo', key: 'sn.btn', kw: 'snapshots backup restore history versions copy undo return снимки резервная копия восстановить вернуть версия история автокопия сравнить', run: () => openSnapshots(), menu: false });

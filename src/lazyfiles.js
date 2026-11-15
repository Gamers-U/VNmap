'use strict';
/* ====== Недостающие файлы: заглушки и докачка ======
   В проект на GitHub (и в общий файл проекта) попадают только записи о картинках и звуках: имя, размер, тип. Самих файлов там нет. Поэтому у того,
   кто открыл проект с GitHub или на другом компьютере, файлов в хранилище нет, а записи о них есть. Такой файл показывается заглушкой, а добыть его
   можно тремя способами:
     1. С Google Диска (настольная версия): из папки files проекта на вашем Диске. Нужный файл подгружается сам при первом просмотре, остальные можно докачать кнопкой.
     2. Из папки на компьютере: там, куда «Google Диск для компьютера» синхронизирует общую папку, или из любой другой папки. Файл подбирается по имени и размеру.
     3. Из резервной копии .zip или одним файлом вручную.
   Диск видит только то, что создала сама программа (область drive.file), поэтому файлы, лежащие на чужом Диске, берутся способом 2.
   Файл с тем же размером возвращается под тот же внутренний номер (bid). Файл другого размера принимается как замена: у него новый номер, иначе на Диске
   осталась бы старая версия под старым номером. */

Object.assign(D, {
  'mf.btn': ['Недостающие файлы', 'Missing files'],
  'mf.title': ['Недостающие файлы', 'Missing files'],
  'mf.lead': ['Эти картинки и звуки записаны в проекте, но самих файлов на этом устройстве нет: проект открыт с GitHub, с Диска или с другого компьютера. Пока файла нет, на его месте стоит заглушка, а в собранной игре цветная картинка с названием. Файлы можно докачать.',
    'These images and sounds are recorded in the project, but the files themselves are not on this device: the project was opened from GitHub, from Drive or on another computer. Until a file is here a placeholder stands in its place, and the built game shows a colored picture with its name. You can fetch the files.'],
  'mf.n': [['{0} файл', '{0} файла', '{0} файлов'], ['{0} file', '{0} files']],
  'mf.sum': ['Не хватает: {0}, всего {1}', 'Missing: {0}, {1} in total'],
  'mf.none': ['Все файлы на месте: докачивать нечего.', 'All files are here: nothing to fetch.'],
  'mf.drive.h': ['С Google Диска', 'From Google Drive'],
  'mf.drive.nodrive': ['Диск работает только в настольной версии программы. Здесь файлы можно взять из папки или из копии.', 'Drive works only in the desktop app. Here you can take the files from a folder or a backup.'],
  'mf.drive.nosign': ['Войдите в Google в панели «Диск»: тогда файлы можно будет докачать.', 'Sign in to Google in the Drive panel and the files can be fetched.'],
  'mf.drive.nofolder': ['Папка этого проекта на вашем Диске не найдена. Если файлы лежат на Диске другого человека, возьмите их из папки на компьютере.', 'This project’s folder was not found on your Drive. If the files are on someone else’s Drive, take them from a folder on your computer.'],
  'mf.drive.error': ['Диск сейчас недоступен: {0}', 'Drive is not available right now: {0}'],
  'mf.drive.check': ['Проверить, что есть на Диске', 'Check what is on Drive'],
  'mf.drive.has': ['На Диске найдено файлов: {0} из {1}.', 'Found on Drive: {0} of {1}.'],
  'mf.drive.get': ['Докачать с Диска', 'Fetch from Drive'],
  'mf.drive.prog': ['Скачано {0} из {1}…', 'Downloaded {0} of {1}…'],
  'mf.drive.done': ['Докачано с Диска: {0}.', 'Fetched from Drive: {0}.'],
  'mf.drive.rest': ['Не нашлись на Диске: {0}.', 'Not found on Drive: {0}.'],
  'mf.stop': ['Остановить', 'Stop'],
  'mf.dir.h': ['Из папки на компьютере', 'From a folder on your computer'],
  'mf.dir.d': ['Укажите папку с файлами проекта, например ту, в которую «Google Диск для компьютера» синхронизирует общую папку. Файлы подбираются по имени и размеру. Подходят и файлы вида «код__имя» из папки files на Диске.',
    'Choose the folder with the project files, for example the one that “Google Drive for desktop” syncs with the shared folder. Files are matched by name and size. Files named “code__name” from the files folder on Drive also work.'],
  'mf.dir.pick': ['Выбрать папку…', 'Choose a folder…'],
  'mf.dir.files': ['Выбрать файлы…', 'Choose files…'],
  'mf.dir.loose': ['Брать и файлы с другим размером (они станут заменой)', 'Also take files of a different size (they become a replacement)'],
  'mf.zip.h': ['Из резервной копии', 'From a backup'],
  'mf.zip.d': ['Копия проекта .zip, которую сохраняла программа: в ней лежат и файлы.', 'A project copy .zip saved by the program: the files are inside.'],
  'mf.zip.pick': ['Выбрать .zip…', 'Choose a .zip…'],
  'mf.zip.bad': ['Не получилось открыть архив: это не копия проекта', 'Could not open the archive: it is not a project copy'],
  'mf.zip.got': ['Из копии взято файлов: {0}.', 'Files taken from the backup: {0}.'],
  'mf.res': ['Подобрано {0} из {1}.', 'Matched {0} of {1}.'],
  'mf.res.by': ['По номеру и имени: {0}, с другим размером (заменой): {1}.', 'By code and name: {0}, with a different size (as a replacement): {1}.'],
  'mf.res.diff': ['Размер не совпал у {0}: пропущены (включите «Брать и файлы с другим размером»).', 'The size differs for {0}: skipped (turn on “Also take files of a different size”).'],
  'mf.res.none': ['Ничего не нашлось: проверьте, что выбрана нужная папка.', 'Nothing was found: check that you chose the right folder.'],
  'mf.link.h': ['Общая папка файлов', 'Shared files folder'],
  'mf.link.d': ['Ссылка на папку Диска (или другого хранилища), где команда держит картинки и звуки. Она хранится в проекте и приходит всем вместе с ним, в том числе через GitHub.',
    'A link to the Drive folder (or other storage) where the team keeps images and sounds. It is stored in the project and reaches everyone with it, including through GitHub.'],
  'mf.link.ph': ['https://drive.google.com/drive/folders/…', 'https://drive.google.com/drive/folders/…'],
  'mf.link.open': ['Открыть папку', 'Open the folder'],
  'mf.link.bad': ['Ссылка должна начинаться с http:// или https://', 'The link must start with http:// or https://'],
  'mf.list.h': ['Чего не хватает', 'What is missing'],
  'mf.row.pick': ['Указать файл', 'Choose the file'],
  'mf.row.s': ['Нет на этом устройстве · {0}', 'Not on this device · {0}'],
  'mf.row.done': ['Файл «{0}» на месте', 'The file “{0}” is back'],
  'mf.row.repl': ['Размер отличается от записанного: файл принят как замена', 'The size differs from the recorded one: the file was taken as a replacement'],
  'mf.row.drive': ['Есть на Диске', 'On Drive'],
  'mf.banner': ['Не загружено на этом устройстве: {0} ({1}). Вместо них заглушки.', 'Not loaded on this device: {0} ({1}). Placeholders stand in for them.'],
  'mf.banner.btn': ['Докачать…', 'Fetch…'],
  'mf.toast': ['Проект открыт без части файлов: {0}. Вместо них заглушки.', 'The project was opened without some files: {0}. Placeholders stand in for them.'],
  'mf.toast.btn': ['Докачать', 'Fetch'],
  'mf.lazy': ['Скачивать файлы только когда понадобятся', 'Download files only when needed'],
  'mf.lazy.h': ['Когда проект приходит с Диска, файлы не скачиваются все сразу: на их месте заглушки, а нужный файл подгружается при первом просмотре. Остальное можно докачать в «Недостающие файлы».',
    'When a project comes from Drive its files are not all downloaded at once: placeholders stand in, and a file is fetched when first viewed. The rest can be fetched in “Missing files”.'],
  'mf.more': ['…и ещё {0}', '…and {0} more'],
});

const MF = { items: [], at: 0, uid: '', neg: new Set(), flight: new Map(), idx: null, idxAt: 0, why: '', err: '', told: '', q: [], run: 0 };
const mfIsHttp = u => /^https?:\/\/\S+$/i.test(String(u || '').trim());
const mfBase = n => String(n || '').split(/[\\/]/).pop().toLowerCase();
const mfDriveCan = () => !!(GD && GS && GS.st && GS.st.signedIn && P && P.uid);

/** Файлы ассетов, которых нет в хранилище этого устройства: [{ bid, m, a, key }] (один номер — одна запись). */
async function mfScan() {
  const out = [], seen = new Set();
  for (const a of P.assets) for (const [key, m] of Object.entries(a.files || {})) {
    if (!m || !m.bid || seen.has(m.bid)) continue; seen.add(m.bid);
    if (!(await blobHas(m.bid))) out.push({ bid: m.bid, m, a, key });
  }
  MF.items = out; MF.at = Date.now(); return out;
}
const mfMetaOf = bid => { for (const a of P.assets) for (const m of Object.values(a.files || {})) if (m && m.bid === bid) return m; return null; };
const mfSizeSum = items => items.reduce((s, x) => s + (+x.m.size || 0), 0);

/* ---------- Диск ---------- */
/** Что лежит в папке files проекта на Диске: Map(номер → id файла) или null (причина в MF.why). Ничего не создаёт. */
async function mfDriveIndex(force) {
  if (!GD) { MF.why = 'nodrive'; return null; }
  if (!mfDriveCan()) { MF.why = 'nosign'; return null; }
  if (!force && MF.idx && MF.idxUid === P.uid && Date.now() - MF.idxAt < 45000) return MF.idx;
  try {
    const m = dmeta(); let filesId = m && m.filesId;
    if (!filesId) {
      const f = await GD.find({ folder: true, appProp: { key: 'vnmapUid', value: P.uid } });
      if (!f.length) { MF.why = 'nofolder'; return null; }
      const kids = await GD.find({ parentId: f[0].id });
      const fl = kids.find(k => k.mimeType === GD_FOLDER && k.appProperties && k.appProperties.vnmapKind === 'files');
      if (!fl) { MF.why = 'nofolder'; return null; }
      filesId = fl.id;
    }
    const idx = new Map();
    for (const x of await GD.find({ parentId: filesId, folder: false })) if (x.appProperties && x.appProperties.bid) idx.set(x.appProperties.bid, x.id);
    MF.idx = idx; MF.idxAt = Date.now(); MF.idxUid = P.uid; MF.why = ''; MF.err = '';
    return idx;
  } catch (e) { const g = gdErr(e); MF.why = g.code === 'auth' ? 'nosign' : 'error'; MF.err = g.msg; return null; }
}
/** Скачать один файл с Диска в хранилище. null — на Диске его нет. */
async function mfFetchOne(bid, meta) {
  const idx = await mfDriveIndex(); const id = idx && idx.get(bid); if (!id) return null;
  const data = await GD.download(id);
  const blob = new Blob([data], { type: (meta && meta.type) || '' });
  await blobPut(bid, blob);
  return blob;
}
/** Файл «по требованию»: его просят для показа, а в хранилище нет. Идёт на Диск (не больше трёх запросов сразу), не найдя, больше не спрашивает до ручной докачки. */
function mfLazy(bid) {
  if (!bid || !mfDriveCan() || MF.neg.has(bid)) return Promise.resolve(null);
  if (MF.flight.has(bid)) return MF.flight.get(bid);
  const meta = mfMetaOf(bid);
  if (!meta) return Promise.resolve(null);
  const job = async () => {
    try { const b = await mfFetchOne(bid, meta); if (!b) MF.neg.add(bid); else mfGot(bid); return b; }
    catch (e) { MF.neg.add(bid); return null; }
  };
  const p = new Promise(res => { MF.q.push(async () => { res(await job()); }); mfPump(); }).finally(() => MF.flight.delete(bid));
  MF.flight.set(bid, p); return p;
}
function mfPump() {
  while (MF.run < 3 && MF.q.length) { const fn = MF.q.shift(); MF.run++; fn().finally(() => { MF.run--; mfPump(); }); }
}
const mfGot = bid => { MF.items = MF.items.filter(x => x.bid !== bid); };

/* ---------- папка, файлы, копия ---------- */
/** Подбор файлов из выбранных к недостающим. how: bid — по номеру в имени, name — имя и размер, loose — имя совпало, размер нет. */
function mfMatch(items, files, loose) {
  const byName = new Map(), byBid = new Map();
  for (const f of files) {
    const nm = mfBase(f.name); (byName.get(nm) || byName.set(nm, []).get(nm)).push(f);
    const k = f.name.indexOf('__'); if (k > 0) byBid.set(f.name.slice(0, k), f);
  }
  const found = [], diff = [], none = [];
  for (const it of items) {
    const fb = byBid.get(it.bid);
    if (fb) { found.push({ it, file: fb, how: 'bid' }); continue; }
    const cand = byName.get(mfBase(it.m.name)) || [];
    const ok = cand.find(f => !it.m.size || f.size === it.m.size);
    if (ok) found.push({ it, file: ok, how: 'name' });
    else if (cand.length) { if (loose) found.push({ it, file: cand[0], how: 'loose' }); else diff.push(it); }
    else none.push(it);
  }
  return { found, diff, none };
}
/** Файл другого размера принимается как замена: новый номер у всех записей с прежним. */
async function mfRebind(oldBid, file, buf) {
  const nb = longId('b');
  await blobPut(nb, new Blob([buf], { type: file.type || '' }));
  for (const a of P.assets) for (const m of Object.values(a.files || {})) if (m && m.bid === oldBid) { m.bid = nb; m.size = file.size; m.name = file.name || m.name; if (file.type) m.type = file.type; }
  return nb;
}
async function mfUseFiles(items, files, loose) {
  const mt = mfMatch(items, files, loose); let repl = 0;
  for (const x of mt.found) {
    const buf = await x.file.arrayBuffer();
    if (x.how === 'loose') { await mfRebind(x.it.bid, x.file, buf); repl++; }
    else await blobPut(x.it.bid, new Blob([buf], { type: x.it.m.type || x.file.type || '' }));
  }
  if (repl) commit(true);
  mt.repl = repl; return mt;
}
async function mfUseZip(items, file) {
  const { blobs } = await readBackupZip(file);
  const have = new Map(blobs.map(b => [b.bid, b.blob])); let got = 0;
  for (const it of items) { const b = have.get(it.bid); if (b) { await blobPut(it.bid, b); got++; } }
  return got;
}
/** Один файл, указанный вручную. 'same' — вернулся на своё место, 'repl' — принят как замена. */
async function mfRestoreOne(it, file) {
  const buf = await file.arrayBuffer();
  if (!it.m.size || it.m.size === file.size) { await blobPut(it.bid, new Blob([buf], { type: it.m.type || file.type || '' })); return 'same'; }
  await mfRebind(it.bid, file, buf); commit(true); return 'repl';
}
function mfPickFolder(cb) {
  const inp = h('input', { type: 'file', multiple: true, style: { display: 'none' } });
  inp.setAttribute('webkitdirectory', ''); inp.setAttribute('directory', '');
  inp.addEventListener('change', () => { const fl = [...inp.files]; inp.remove(); if (fl.length) cb(fl); });
  document.body.append(inp); inp.click();
}
function mfRefreshUI() { try { if (typeof REG !== 'undefined' && REG && REG.m && !REG.m.closed) renderReg(); } catch (e) { /* реестр не открыт */ } }

/* ---------- сообщение после получения проекта ---------- */
function toastAct(msg, label, fn, ms = 8000) {
  layer().querySelectorAll('.toast').forEach(x => x.remove());
  const el = h('div', { class: 'toast act' }, h('span', msg), h('button', { class: 'tlink', onclick: () => { el.remove(); fn(); } }, label));
  layer().append(el); requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 260); }, ms);
}
let mfTimer = null;
/** Вызывается, когда проект заменён (открыт, получен с Диска или GitHub). Об одном и том же наборе недостающих файлов говорит один раз. */
function mfAfterReplace() {
  clearTimeout(mfTimer);
  mfTimer = setTimeout(async () => {
    try {
      if (MF.uid !== P.uid) { MF.uid = P.uid; MF.neg.clear(); MF.idx = null; MF.told = ''; }
      const items = await mfScan();
      if (!items.length) { MF.told = ''; return; }
      const key = items.map(i => i.bid).sort().join('|');
      if (key === MF.told) return; MF.told = key;
      if (typeof DM !== 'undefined' && DM.opts && DM.opts.lazy && mfDriveCan()) return;     // по требованию: подгрузятся сами
      toastAct(t('mf.toast', t('mf.n', items.length)), t('mf.toast.btn'), () => openMissingFiles(), 9000);
    } catch (e) { /* не страшно */ }
  }, 900);
}

/* ---------- окно ---------- */
const KIND_MF = k => (k === 'bg' || k === 'sprite') ? 'image' : k === 'font' ? 'type' : 'music';
async function openMissingFiles() {
  await mfScan();
  const st = { items: MF.items.slice(), busy: false, stop: false, prog: '', res: '', loose: false, drv: null, drvBusy: false };
  openModal({
    cls: 'dlg wide mf-dlg', onClose: () => { st.stop = true; },
    build: m => {
      const head = h('div'), srcBox = h('div', { class: 'mf-src-box' }), linkBox = h('div'), listBox = h('div');
      const rescan = async () => { st.items = await mfScan(); mfRefreshUI(); paintAll(); };
      const done = msg => { st.res = msg; };
      const paintHead = () => {
        head.replaceChildren(h('h3', t('mf.title')), h('p', t('mf.lead')),
          st.items.length ? h('div', { class: 'mf-sum' }, icon('cloud', 16), t('mf.sum', t('mf.n', st.items.length), humanSize(mfSizeSum(st.items)))) : h('div', { class: 'mf-sum ok' }, icon('check', 16), t('mf.none')));
      };
      /* --- источники --- */
      const driveCard = () => {
        let msg, btn = null;
        if (!GD) msg = t('mf.drive.nodrive');
        else if (!mfDriveCan()) msg = t('mf.drive.nosign');
        else if (st.drv === 'wait') msg = '…';
        else if (st.drv instanceof Map) {
          const have = st.items.filter(x => st.drv.has(x.bid)).length;
          msg = t('mf.drive.has', have, st.items.length);
          if (have) btn = h('button', { class: 'btn primary', id: 'mf-drive-get', onclick: () => runDrive() }, icon('download', 15), t('mf.drive.get'));
        } else if (MF.why === 'nofolder') msg = t('mf.drive.nofolder');
        else if (MF.why === 'error') msg = t('mf.drive.error', MF.err);
        else { msg = ''; btn = h('button', { class: 'btn', id: 'mf-drive-check', onclick: () => checkDrive() }, icon('refresh', 15), t('mf.drive.check')); }
        return h('div', { class: 'mf-src' }, h('div', { class: 'mf-src-h' }, icon('cloud', 16), h('b', t('mf.drive.h'))), msg ? h('div', { class: 'hint', id: 'mf-drive-msg' }, msg) : null,
          st.busy ? h('div', { class: 'mf-prog' }, h('span', { id: 'mf-prog' }, st.prog), h('button', { class: 'btn sm', id: 'mf-stop', onclick: () => { st.stop = true; } }, t('mf.stop'))) : btn);
      };
      const folderCard = () => h('div', { class: 'mf-src' }, h('div', { class: 'mf-src-h' }, icon('folder', 16), h('b', t('mf.dir.h'))), h('div', { class: 'hint' }, t('mf.dir.d')),
        h('div', { class: 'row-actions left' },
          h('button', { class: 'btn', id: 'mf-dir', onclick: () => mfPickFolder(fl => useFiles(fl)) }, icon('folder', 15), t('mf.dir.pick')),
          h('button', { class: 'btn', id: 'mf-files', onclick: () => pickFiles('', true, fl => useFiles(fl)) }, icon('upload', 15), t('mf.dir.files'))),
        h('div', { class: 'opt-row' }, switchEl(st.loose, v => { st.loose = v; }, t('mf.dir.loose'))));
      const zipCard = () => h('div', { class: 'mf-src' }, h('div', { class: 'mf-src-h' }, icon('save', 16), h('b', t('mf.zip.h'))), h('div', { class: 'hint' }, t('mf.zip.d')),
        h('div', { class: 'row-actions left' }, h('button', { class: 'btn', id: 'mf-zip', onclick: () => pickFiles('.zip,application/zip', false, fl => useZip(fl[0])) }, icon('upload', 15), t('mf.zip.pick'))));
      const paintSrc = () => {
        if (!st.items.length) { srcBox.replaceChildren(...[st.res ? h('div', { class: 'mf-res', id: 'mf-res' }, st.res) : null].filter(Boolean)); return; }
        srcBox.replaceChildren(...[driveCard(), folderCard(), zipCard(), st.res ? h('div', { class: 'mf-res', id: 'mf-res' }, st.res) : null].filter(Boolean));
      };
      /* --- ссылка на общую папку --- */
      const paintLink = () => {
        const inp = h('input', { class: 'inp', id: 'mf-link', placeholder: t('mf.link.ph'), value: P.filesUrl || '' });
        const bad = h('div', { class: 'hint warn-t', hidden: true }, t('mf.link.bad'));
        const open = h('button', { class: 'btn', id: 'mf-link-open', onclick: () => mfOpenUrl(P.filesUrl) }, icon('open', 15), t('mf.link.open'));
        const sync = () => { open.disabled = !mfIsHttp(P.filesUrl); };
        inp.addEventListener('input', () => {
          const v = inp.value.trim(); bad.hidden = !v || mfIsHttp(v);
          if (!v || mfIsHttp(v)) { P.filesUrl = v; commit(); }
          sync();
        });
        sync();
        linkBox.replaceChildren(h('div', { class: 'mf-src' }, h('div', { class: 'mf-src-h' }, icon('link', 16), h('b', t('mf.link.h'))), h('div', { class: 'hint' }, t('mf.link.d')), h('div', { class: 'mf-link-row' }, inp, open), bad));
      };
      /* --- список --- */
      const paintList = () => {
        if (!st.items.length) { listBox.replaceChildren(); return; }
        const rows = st.items.slice(0, 80).map(it => {
          const lab = it.a.kind === 'sprite' ? (it.key || '') : '';
          return h('div', { class: 'mf-row', 'data-bid': it.bid },
            h('span', { class: 'mf-ic' }, icon(KIND_MF(it.a.kind), 16)),
            h('div', { class: 'mf-t' }, h('div', { class: 'mf-n' }, it.a.name || '—', lab ? h('span', { class: 'mf-k' }, lab) : null), h('div', { class: 'hint' }, it.m.name + ' · ' + humanSize(it.m.size))),
            st.drv instanceof Map && st.drv.has(it.bid) ? h('span', { class: 'mf-badge' }, t('mf.row.drive')) : null,
            h('button', { class: 'btn sm', onclick: () => pickFiles('', false, async fl => { const r = await mfRestoreOne(it, fl[0]); toast(t(r === 'same' ? 'mf.row.done' : 'mf.row.repl', it.m.name), 3600); await rescan(); }) }, icon('upload', 13), t('mf.row.pick')));
        });
        if (st.items.length > 80) rows.push(h('div', { class: 'hint', style: { padding: '6px 4px' } }, t('mf.more', st.items.length - 80)));
        listBox.replaceChildren(h('div', { class: 'mf-list-h' }, t('mf.list.h')), h('div', { class: 'mf-list scroll' }, rows));
      };
      const paintAll = () => { paintHead(); paintSrc(); paintLink(); paintList(); };
      /* --- действия --- */
      async function checkDrive() {
        st.drv = 'wait'; paintSrc();
        const idx = await mfDriveIndex(true); st.drv = idx || null; paintSrc(); paintList();
      }
      async function runDrive() {
        if (st.busy) return; st.busy = true; st.stop = false; st.res = ''; MF.neg.clear(); paintSrc();
        let got = 0, rest = 0;
        try {
          const idx = await mfDriveIndex(true);
          const todo = st.items.filter(it => idx && idx.has(it.bid));
          rest = st.items.length - todo.length;
          let i = 0;
          for (const it of todo) {
            if (st.stop) break;
            i++; st.prog = t('mf.drive.prog', i, todo.length); const pe = $('#mf-prog'); if (pe) pe.textContent = st.prog;
            try { if (await mfFetchOne(it.bid, it.m)) got++; else rest++; } catch (e) { rest++; }
          }
        } catch (e) { st.res = t('mf.drive.error', gdErr(e).msg); }
        st.busy = false; st.prog = '';
        if (!st.res) st.res = t('mf.drive.done', got) + (rest ? ' ' + t('mf.drive.rest', rest) : '');
        st.drv = null; await rescan();
      }
      async function useFiles(files) {
        st.res = ''; const mt = await mfUseFiles(st.items, files, st.loose);
        const n = mt.found.length;
        if (!n) st.res = t('mf.res.none');
        else {
          const byName = mt.found.filter(x => x.how !== 'loose').length;
          st.res = t('mf.res', n, st.items.length) + (mt.repl ? ' ' + t('mf.res.by', byName, mt.repl) : '') + (mt.diff.length ? ' ' + t('mf.res.diff', mt.diff.length) : '');
        }
        await rescan();
      }
      async function useZip(file) {
        st.res = '';
        try { const got = await mfUseZip(st.items, file); st.res = got ? t('mf.zip.got', got) : t('mf.res.none'); }
        catch (e) { st.res = t('mf.zip.bad'); }
        await rescan();
      }
      paintAll();
      if (GD && mfDriveCan() && st.items.length) checkDrive();
      return h('div', { class: 'dlg-body' }, head, srcBox, linkBox, listBox, h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', id: 'mf-close', onclick: () => m.close() }, t('c.close'))));
    }
  });
}
function mfOpenUrl(u) {
  u = String(u || '').trim(); if (!mfIsHttp(u)) return;
  if (DESK && DESK.openExternal) DESK.openExternal(u); else window.open(u, '_blank', 'noopener');
}

/** Плашка над списком файлов в реестре, если на этом устройстве чего-то не хватает. */
function mfBanner() {
  const box = h('div', { class: 'mf-banner', id: 'mf-banner', hidden: true });
  const fill = items => {
    if (!items.length) return;
    box.hidden = false;
    box.replaceChildren(icon('cloud', 18), h('div', { class: 'mf-b-t' }, t('mf.banner', t('mf.n', items.length), humanSize(mfSizeSum(items)))), h('button', { class: 'btn sm primary', id: 'mf-banner-btn', onclick: () => openMissingFiles() }, t('mf.banner.btn')));
  };
  if (Date.now() - MF.at < 4000) fill(MF.items); else mfScan().then(fill);
  return box;
}

TOOL_ITEMS.push({ id: 'missingfiles', group: 'files', ic: 'cloud', key: 'mf.btn', kw: 'missing files placeholders download drive github folder недостающие файлы заглушки докачка диск папка', run: () => openMissingFiles() });

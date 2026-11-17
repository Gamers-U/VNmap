'use strict';
/* ====== Окно «Редактор кода»: проводник по папке проекта Ren'Py, вкладки файлов, редактор (codeedit.js) ======
   Слева дерево. Раздел «Код внутри проекта» это файлы «Своего кода» (P.code): они хранятся в проекте и при сборке кладутся в game/ как есть.
   Раздел «Папка» (программа для компьютера) это настоящая папка игры Ren'Py, та же, что выбрана для запуска в Ren'Py (rpsdk.js). Файлы читает и пишет
   оболочка (desktop/projfs.js) и только внутри этой папки. Файл можно править, сохранять (Ctrl+S), создавать, переименовывать, удалять (в корзину).
   Если файл изменили снаружи (например, сборка игры записала его заново), он обновится сам, а если в нём были несохранённые правки, спросим. */

Object.assign(D, {
  'ide.title': ['Редактор кода', 'Code editor'], 'ide.btn': ['Редактор кода…', 'Code editor…'],
  'ide.explorer': ['Проводник', 'Explorer'],
  'ide.sec.virt': ['Код внутри проекта', 'Code inside the project'], 'ide.sec.disk': ['Папка: {0}', 'Folder: {0}'],
  'ide.pick': ['Выбрать папку проекта Ren\'Py…', 'Choose the Ren\'Py project folder…'],
  'ide.change': ['Другая папка…', 'Another folder…'],
  'ide.pick.t': ['Чтобы править файлы игры, выберите папку проекта Ren\'Py (в ней лежит папка game). Эту же папку использует запуск в Ren\'Py.', 'To edit the game files, choose the Ren\'Py project folder (the one that contains the game folder). The same folder is used to run in Ren\'Py.'],
  'ide.oldshell': ['Установленная оболочка программы старая: она не умеет работать с папками проекта. Скачайте свежую версию и установите поверх: проекты и входы сохранятся. Пока можно править «Код внутри проекта».', 'The installed app shell is old: it cannot work with project folders. Download the latest version and install it over the old one: projects and sign-ins are kept. Meanwhile you can edit "Code inside the project".'],
  'ide.web': ['Папки на диске доступны в программе для компьютера. Здесь можно править «Код внутри проекта».', 'Folders on disk are available in the desktop app. Here you can edit the “Code inside the project”.'],
  'ide.nofolder': ['Папка проекта не выбрана', 'No project folder chosen'],
  'ide.new.file': ['Новый файл', 'New file'], 'ide.new.dir': ['Новая папка', 'New folder'], 'ide.refresh': ['Обновить', 'Refresh'], 'ide.collapse': ['Свернуть все папки', 'Collapse all folders'],
  'ide.hidden': ['Показывать служебные файлы (.git, .rpyc, cache…)', 'Show service files (.git, .rpyc, cache…)'],
  'ide.filter': ['Найти файл по имени', 'Find a file by name'], 'ide.nomatch': ['Ничего не найдено', 'Nothing found'],
  'ide.m.open': ['Открыть', 'Open'], 'ide.m.newfile': ['Новый файл…', 'New file…'], 'ide.m.newdir': ['Новая папка…', 'New folder…'], 'ide.m.rename': ['Переименовать…', 'Rename…'],
  'ide.m.delete': ['Удалить…', 'Delete…'], 'ide.m.reveal': ['Показать в проводнике системы', 'Show in the system file manager'], 'ide.m.copy': ['Копировать путь', 'Copy path'],
  'ide.p.file': ['Имя файла', 'File name'], 'ide.p.file.ph': ['например, screens.rpy', 'for example, screens.rpy'], 'ide.p.dir': ['Имя папки', 'Folder name'], 'ide.p.rename': ['Новое имя', 'New name'],
  'ide.p.vfile': ['Имя файла (латиница, цифры, «_», «-»)', 'File name (Latin letters, digits, “_”, “-”)'],
  'ide.del.q': ['Удалить «{0}»?', 'Delete “{0}”?'], 'ide.del.t': ['Файл переместится в корзину системы, оттуда его можно вернуть.', 'The file moves to the system trash; you can restore it from there.'],
  'ide.del.t.dir': ['Папка со всем содержимым переместится в корзину системы.', 'The folder with everything inside moves to the system trash.'],
  'ide.del.t.virt': ['Файл будет удалён из проекта. Ctrl+Z вернёт его.', 'The file will be removed from the project. Ctrl+Z brings it back.'], 'ide.del.ok': ['Удалить', 'Delete'],
  'ide.err': ['Не получилось: {0}', 'Did not work: {0}'],
  'ide.e.bad-path': ['недопустимое имя или путь', 'invalid name or path'], 'ide.e.outside': ['путь выходит за папку проекта', 'the path leaves the project folder'],
  'ide.e.not-found': ['файл или папка не найдены', 'file or folder not found'], 'ide.e.exists': ['такое имя уже есть', 'that name is already taken'],
  'ide.e.denied': ['нет доступа', 'access denied'], 'ide.e.big': ['файл слишком большой (больше 4 МБ)', 'the file is too big (over 4 MB)'],
  'ide.e.binary': ['это не текстовый файл', 'this is not a text file'], 'ide.e.encoding': ['файл не в кодировке UTF-8: Ren\'Py читает только её, поэтому он не открыт', 'the file is not UTF-8: Ren\'Py reads only that, so it was not opened'],
  'ide.e.io': ['ошибка чтения или записи', 'read or write error'], 'ide.e.no-project': ['папка проекта не выбрана или пропала', 'the project folder is not chosen or is gone'],
  'ide.e.is-dir': ['это папка', 'this is a folder'], 'ide.e.trash': ['корзина недоступна', 'the trash is unavailable'], 'ide.e.full': ['на диске нет места', 'the disk is full'],
  'ide.e.not-empty': ['папка не пуста', 'the folder is not empty'], 'ide.e.no-trash': ['корзина недоступна', 'the trash is unavailable'], 'ide.e.bad-data': ['неверные данные', 'invalid data'],
  'ide.nobin': ['Это не текстовый файл (картинка, звук или другой). В редакторе он не открывается.', 'This is not a text file (an image, a sound or another kind). It does not open in the editor.'],
  'ide.reveal.btn': ['Показать в проводнике системы', 'Show in the system file manager'],
  'ide.close': ['Закрыть вкладку', 'Close the tab'], 'ide.dirty': ['Есть несохранённые правки', 'There are unsaved changes'],
  'ide.unsaved.q': ['Сохранить изменения в «{0}»?', 'Save the changes in “{0}”?'], 'ide.unsaved.q2': ['Несохранённые файлы: {0}. Сохранить их?', 'Unsaved files: {0}. Save them?'],
  'ide.unsaved.t': ['Без сохранения правки пропадут.', 'Without saving the changes are lost.'], 'ide.save': ['Сохранить', 'Save'], 'ide.dont': ['Не сохранять', 'Don\'t save'],
  'ide.saved': ['Сохранено', 'Saved'], 'ide.saveall': ['Сохранить все', 'Save all'],
  'ide.ext.changed': ['Файл изменён на диске.', 'The file was changed on disk.'], 'ide.ext.gone': ['Файл удалён на диске.', 'The file was deleted on disk.'],
  'ide.ext.load': ['Загрузить с диска', 'Load from disk'], 'ide.ext.keep': ['Оставить мои правки', 'Keep my changes'], 'ide.ext.resave': ['Сохранить заново', 'Save again'],
  'ide.over.q': ['Перезаписать файл?', 'Overwrite the file?'], 'ide.over.t': ['«{0}» изменили на диске после того, как вы его открыли. Перезаписать вашими правками?', '“{0}” was changed on disk after you opened it. Overwrite with your changes?'], 'ide.over.ok': ['Перезаписать', 'Overwrite'],
  'ide.empty': ['Откройте файл слева', 'Open a file on the left'],
  'ide.empty.h': ['Ctrl+P: быстрый переход к файлу · Ctrl+S: сохранить · Ctrl+G: к строке', 'Ctrl+P: go to a file · Ctrl+S: save · Ctrl+G: go to a line'],
  'ide.qo.ph': ['Имя файла…', 'File name…'], 'ide.qo.virt': ['внутри проекта', 'inside the project'],
  'ide.lang.text': ['Обычный текст', 'Plain text'], 'ide.lang.renpy': ['Ren\'Py', 'Ren\'Py'], 'ide.lang.python': ['Python', 'Python'], 'ide.lang.json': ['JSON', 'JSON'], 'ide.lang.markdown': ['Markdown', 'Markdown'],
  'ide.lang.css': ['CSS', 'CSS'], 'ide.lang.javascript': ['JavaScript', 'JavaScript'], 'ide.lang.html': ['HTML', 'HTML'], 'ide.lang.xml': ['XML', 'XML'], 'ide.lang.yaml': ['YAML', 'YAML'], 'ide.lang.ini': ['INI', 'INI'],
  'ide.virt.note': ['Хранится в проекте, при сборке попадёт в game/{0}.rpy', 'Stored in the project, goes to game/{0}.rpy on build'],
  'ide.restored': ['Вернул несохранённые правки в «{0}»: окно закрылось раньше, чем вы их сохранили.', 'Restored the unsaved changes in “{0}”: the window was closed before you saved them.'],
  'ide.outline': ['Структура', 'Outline'], 'ide.outline.empty': ['В файле нет меток, экранов и функций', 'No labels, screens or functions in this file'], 'ide.outline.toggle': ['Показать или скрыть структуру файла', 'Show or hide the file outline'],
  'ide.k.label': ['метка', 'label'], 'ide.k.screen': ['экран', 'screen'], 'ide.k.transform': ['преобразование', 'transform'], 'ide.k.style': ['стиль', 'style'], 'ide.k.def': ['функция', 'function'], 'ide.k.class': ['класс', 'class'],
  'ide.k.char': ['герой', 'character'], 'ide.k.var': ['переменная', 'variable'], 'ide.k.image': ['картинка', 'image'],
  'ide.sym.ph': ['Перейти к символу в файле…', 'Go to a symbol in the file…'], 'ide.sym.none': ['В этом файле нет символов', 'No symbols in this file'], 'ide.sym.nofile': ['Откройте файл', 'Open a file first'],
  'ide.def.none': ['Определение «{0}» не найдено', 'No definition of “{0}” found'], 'ide.def.proj': ['«{0}»: метка блока проекта «{1}», отдельного файла у неё нет', '“{0}” is the label of the project block “{1}”, it has no file'],
  'ide.def.pick': ['Несколько определений «{0}»…', 'Several definitions of “{0}”…'], 'ide.nav.none': ['Некуда возвращаться', 'Nothing to go back to'],
  'ch.var.flag': ['флаг', 'flag'], 'ch.var.number': ['число', 'number'], 'ch.var.choice': ['выбор', 'choice'],
  'ide.lang.pick': ['Язык подсветки (щёлкните, чтобы сменить)', 'Highlight language (click to change)'],
  'ide.toggle.side': ['Показать или скрыть проводник (Ctrl+B)', 'Show or hide the explorer (Ctrl+B)'],
});

const IDE_EXT = { rpy: 'renpy', rpym: 'renpy', py: 'python', json: 'json', md: 'markdown', markdown: 'markdown', css: 'css', js: 'javascript', mjs: 'javascript', html: 'html', htm: 'html', xml: 'xml', yml: 'yaml', yaml: 'yaml', ini: 'ini', cfg: 'ini', txt: 'text', csv: 'text', log: 'text' };
const ideLangOf = name => { const m = /\.([^.\\/]+)$/.exec(name || ''); return (m && IDE_EXT[m[1].toLowerCase()]) || 'text'; };
const ideDiskApi = () => (typeof DESK !== 'undefined' && DESK && DESK.pf && ['info', 'list', 'read', 'write', 'create', 'rename', 'remove', 'stat', 'files'].every(k => typeof DESK.pf[k] === 'function') ? DESK.pf : null);
const ideErr = r => t('ide.err', t('ide.e.' + ((r && r.code) || 'io')) || ((r && r.code) || '?'));
const ideBase = p => String(p || '').split('/').pop();
const ideDirOf = p => { const i = String(p || '').lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); };
const ideJoin = (a, b) => (a ? a + '/' + b : b);
const IDE_LANGS = ['text', 'renpy', 'python', 'json', 'markdown', 'css', 'javascript', 'html', 'xml', 'yaml', 'ini'];
const IDE_ROW_MAX = 4000, IDE_BAK_MAX = 3 * 1024 * 1024, LS_IDE_BAK = 'vnmap.ide.bak.v1';

let IDEW = null;

function openIde(opts) {
  opts = opts || {};
  closePopover();
  if (IDEW && !IDEW.m.closed) { IDEW.focus(opts); return IDEW.m; }
  const api = ideDiskApi(), key = typeof rpKey === 'function' ? rpKey() : String((P && (P.uid || P.name)) || 'x');
  const S_ = { fs: +(S.ide && S.ide.fs) || 0, root: null, dirs: new Map([['', { items: null, open: true }]]), tabs: [], active: null, sel: '', hidden: !!(S.ide && S.ide.hidden), side: !(S.ide && S.ide.side === false), secVirt: true, secDisk: true, filter: '', files: null, ol: !(S.ide && S.ide.ol === false), ai: !!(S.ide && S.ide.ai), nav: [], status: null, poll: 0, dead: false };
  let tree, tabsEl, host, emptyEl, statusL, statusR, banner, qEl, sideEl, mhead, rootChip, aiSideEl, aiSplitEl, aiBtn;
  const saveS = () => { S.ide = { hidden: S_.hidden, side: S_.side, sw: S_.sw || (S.ide && S.ide.sw) || 264, fs: S_.fs || 0, ol: S_.ol, ai: S_.ai, aw: S_.aw || (S.ide && S.ide.aw) || 360 }; saveSettings(); };

  /* ---------- сервис ---------- */
  const tabById = id => S_.tabs.find(x => x.id === id) || null;
  const cur = () => tabById(S_.active);
  const virtOf = id => ccList().find(c => c.id === id) || null;
  const rootName = () => (S_.root ? S_.root.name : '');
  const fail = (r) => { toast(ideErr(r), 4500); };
  /* Копия несохранённых правок (на случай закрытия окна или сбоя): лежит в браузерном хранилище, при следующем открытии файла правки вернутся. */
  const bakKey = path => key + '|' + path;
  const bakAll = () => { try { return JSON.parse(lsGet(LS_IDE_BAK) || '{}') || {}; } catch (e) { return {}; } };
  const bakPut = (tab, now) => {
    if (tab.kind !== 'disk') return;
    clearTimeout(tab.bt);
    const run = () => {
      const all = bakAll(), k = bakKey(tab.path);
      if (tab.dirty) all[k] = { text: tab.ed.get(), mtime: tab.mtime, at: Date.now() }; else delete all[k];
      const ks = Object.keys(all); let size = 0; for (const x of ks) size += all[x].text.length;
      for (const x of ks.sort((a, b) => all[a].at - all[b].at)) { if (size <= IDE_BAK_MAX && ks.length <= 40) break; size -= all[x].text.length; delete all[x]; }
      try { lsSet(LS_IDE_BAK, JSON.stringify(all)); } catch (e) { /* нет места: копии не будет */ }
    };
    if (now) run(); else tab.bt = setTimeout(run, 900);
  };
  const bakDrop = tab => { if (tab.kind !== 'disk') return; clearTimeout(tab.bt); const all = bakAll(); if (all[bakKey(tab.path)]) { delete all[bakKey(tab.path)]; try { lsSet(LS_IDE_BAK, JSON.stringify(all)); } catch (e) { /* пусть */ } } };

  async function loadRoot() {
    if (!api) { S_.root = null; return; }
    try { const r = await api.info(key); S_.root = r && r.ok ? { dir: r.dir, name: r.name } : null; } catch (e) { S_.root = null; }
  }
  async function loadDir(rel, force) {
    let d = S_.dirs.get(rel); if (!d) { d = { items: null, open: false }; S_.dirs.set(rel, d); }
    if (d.items && !force) return d;
    d.loading = true;
    try { const r = await api.list(key, rel); if (r && r.ok) { d.items = r.items; d.more = !!r.more; d.err = ''; } else { d.items = d.items || []; d.err = r && r.code || 'io'; } } catch (e) { d.items = d.items || []; d.err = 'io'; }
    d.loading = false; return d;
  }
  async function refreshOpenDirs() {
    if (!S_.root) return;
    const open = [...S_.dirs.entries()].filter(([, d]) => d.open).map(([rel]) => rel);
    await Promise.all(open.map(rel => loadDir(rel, true)));
    S_.files = null;
    paintTree();
  }
  const filesList = async () => {
    if (S_.files) return S_.files;
    const out = ccList().map(c => ({ virt: true, id: c.id, name: c.name + '.rpy', path: c.name + '.rpy' }));
    if (api && S_.root) { try { const r = await api.files(key); if (r && r.ok) for (const f of r.files) out.push({ virt: false, path: f, name: ideBase(f) }); } catch (e) { /* нет списка */ } }
    S_.files = out; hintFiles = out; return out;
  };

  /* ---------- подсказки: имена проекта для списка в редакторе (codehint.js) ---------- */
  let hintFiles = [];
  const hintIx = new Map();                                       // путь → имена из .rpy на диске (для файлов, которые не открыты во вкладках)
  const hintScan = new Map();                                     // кэш разбора текста: id → { text, scan }
  let hintBusy = false;
  async function buildHintIx() {
    if (!api || !S_.root || hintBusy) return; hintBusy = true;
    try {
      const files = await filesList();
      for (const f of files.filter(x => !x.virt && /\.rpy$/i.test(x.path)).slice(0, 150)) {
        if (S_.dead) break; if (hintIx.has(f.path)) continue;
        const r = await api.read(key, f.path).catch(() => null);
        hintIx.set(f.path, r && r.ok ? chScan(r.text) : chScan(''));
      }
    } finally { hintBusy = false; }
  }
  const scanOf = (id, text) => { let c = hintScan.get(id); if (!c || c.text !== text) { c = { text, scan: chScan(text) }; hintScan.set(id, c); } return c.scan; };
  /** Все известные разборы: «Свой код», открытые вкладки (живой текст) и индекс остальных .rpy папки. */
  const hintSources = () => {
    const out = [], open = new Set();
    for (const c of ccList()) out.push({ virt: c.id, name: c.name + '.rpy', scan: scanOf('v' + c.id, c.text || '') });
    for (const tb of S_.tabs) if (tb.kind === 'disk' && tb.ed) { open.add(tb.path); if (/\.rpy$/i.test(tb.path)) out.push({ path: tb.path, name: tb.name, scan: scanOf('d' + tb.path, tb.ed.get()) }); }
    for (const [pth, sc] of hintIx) if (!open.has(pth)) out.push({ path: pth, name: ideBase(pth), scan: sc });
    return out;
  };
  const hintScans = () => hintSources().map(x => x.scan);
  let hintMemo = null;
  const hintOnce = (k, fn) => { const now = Date.now(); if (!hintMemo || now - hintMemo.t > 400) hintMemo = { t: now, v: {} }; return k in hintMemo.v ? hintMemo.v[k] : (hintMemo.v[k] = fn()); };
  const IMG_RE = /\.(?:png|jpe?g|webp|avif|gif|svg|bmp)$/i, AUD_RE = /\.(?:ogg|mp3|wav|opus|flac|m4a|aac)$/i;
  const hintEnv = {
    labels: () => hintOnce('lab', () => {
      const out = new Map(), put = (n, d, code) => { if (n && !out.has(n)) out.set(n, { d: d || '', code: !!code }); };
      for (const sc of hintScans()) for (const l of sc.labels) put(l, '', true);                 // метки из файлов с кодом идут первыми
      for (const n of P.nodes) {
        if (n.type === 'note') continue;
        put('blk_' + cmpIdent(slug(n.title), 'scene'), n.title);
        for (const f of n.files) { put(fileLabel(f), f.title || n.title); for (const l of String(f.script || '').split('\n')) { const m = RE_J_LABEL.exec(l); if (m) put(m[1], f.title || n.title); } }
      }
      return [...out].map(([name, o]) => ({ name, detail: o.d, code: o.code }));
    }),
    chars: () => hintOnce('chr', () => {
      const out = new Map();
      for (const c of P.characters) if (c.tag && !out.has(c.tag)) out.set(c.tag, c.name || '');
      for (const sc of hintScans()) for (const c of sc.chars) if (!out.has(c.tag)) out.set(c.tag, c.name || '');
      return [...out].map(([tag, name]) => ({ tag, name }));
    }),
    vars: () => hintOnce('var', () => {
      const out = new Map(), tn = { flag: t('ch.var.flag'), number: t('ch.var.number'), choice: t('ch.var.choice') };
      for (const v of P.vars) if (v.name && !out.has(v.name)) out.set(v.name, tn[v.type] || '');
      for (const sc of hintScans()) for (const v of sc.vars) if (!out.has(v)) out.set(v, '');
      return [...out].map(([name, detail]) => ({ name, detail }));
    }),
    images: () => hintOnce('img', () => {
      const out = new Map(), put = nm => { nm = String(nm || '').trim().replace(/\s+/g, ' '); if (!nm || out.has(nm)) return; const w = nm.split(' '); out.set(nm, { name: nm, tag: w[0], attrs: w.slice(1) }); };
      for (const f of hintFiles) if (!f.virt && IMG_RE.test(f.path) && /(^|\/)images\//.test(f.path)) put(ideBase(f.path).replace(IMG_RE, ''));
      for (const sc of hintScans()) for (const nm of sc.images) put(nm);
      return [...out.values()];
    }),
    audio: () => hintOnce('aud', () => hintFiles.filter(f => !f.virt && AUD_RE.test(f.path)).map(f => f.path.replace(/^game\//, '')).slice(0, 400)),
    transforms: () => hintOnce('trf', () => { const o = new Set(); for (const sc of hintScans()) for (const x of sc.trans) o.add(x); return [...o]; }),
  };

  /* ---------- помощник ИИ (aichat.js): окно справа, ему даём только то, что он просит ---------- */
  let aiP = null;
  const aiOverview = () => {
    const cut = (arr, n) => arr.slice(0, n).join(', ') + (arr.length > n ? ' … (+' + (arr.length - n) + ')' : '');
    const lab = hintEnv.labels().map(x => x.name), ch = hintEnv.chars().map(x => x.tag + (x.name ? ' (' + x.name + ')' : '')), vr = hintEnv.vars().map(x => x.name), im = hintEnv.images().map(x => x.name), tr = hintEnv.transforms();
    const out = [];
    if (lab.length) out.push('Метки: ' + cut(lab, 80)); if (ch.length) out.push('Герои: ' + cut(ch, 40)); if (vr.length) out.push('Переменные: ' + cut(vr, 60));
    if (im.length) out.push('Картинки: ' + cut(im, 60)); if (tr.length) out.push('Преобразования: ' + cut(tr, 30));
    return out.join('\n');
  };
  const aiHost = {
    file: () => { const tb = cur(); return tb && tb.ed ? { name: tb.name, lang: tb.lang || 'text', text: tb.ed.get() } : null; },
    sel: () => { const tb = cur(); if (!tb || !tb.ed) return null; const st = tb.ed.state(); return st.e > st.s ? { text: tb.ed.get().slice(st.s, st.e), from: st.s, to: st.e, tabId: tb.id } : null; },
    line: () => { const tb = cur(); if (!tb || !tb.ed) return 0; return tb.ed.get().slice(0, tb.ed.state().s).split('\n').length - 1; },
    project: () => aiOverview(),
    canInsert: () => { const tb = cur(); return !!(tb && tb.ed && !tb.ed.ro); },
    canNew: () => true,
    onClose: () => toggleAi(false),
    focusEditor: () => { const tb = cur(); if (tb && tb.ed) tb.ed.focus(); },
    apply: async (kind, o) => {
      const tb = cur();
      if (kind === 'replace') {
        if (!tb || !tb.ed || !o.sel || tb.id !== o.sel.tabId || tb.ed.get().slice(o.sel.from, o.sel.to) !== o.sel.text) { toast(t('aic.ap.changed'), 4500); return false; }
        if (tb.ed.ro) { toast(t('aic.ap.ro'), 3500); return false; }
        tb.ed.replace(o.sel.from, o.sel.to, o.code, o.sel.from, o.sel.from + o.code.length); tb.ed.focus();
        return t('aic.done.replace');
      }
      if (kind === 'insert') {
        if (!tb || !tb.ed || tb.ed.ro) { toast(t('aic.ap.nothing'), 3500); return false; }
        const v = tb.ed.get(), pos = tb.ed.state().s, ls = v.lastIndexOf('\n', pos - 1) + 1; let le = v.indexOf('\n', pos); if (le < 0) le = v.length;
        const blank = !v.slice(ls, le).trim(), from = blank ? ls : le, to = blank ? le : le, text = blank ? o.code : '\n' + o.code;
        tb.ed.replace(from, to, text, from + text.length); tb.ed.focus();
        return t('aic.done.insert');
      }
      if (kind === 'new') {
        let nm = String(o.name || '').trim().replace(/[\\/]+/g, '/').replace(/^\/+/, ''); if (!nm) return false;
        if (!/\.[A-Za-z0-9]+$/.test(nm)) nm += '.rpy';
        if (api && S_.root) {
          const parent = parentFor(), rel = ideJoin(parent, nm), segs = nm.split('/'); segs.pop();
          let acc = parent;                                                    // подпапки из имени создаём по пути; уже существующие не трогаем
          for (const sg of segs) {
            acc = ideJoin(acc, sg);
            const d = await api.create(key, acc, 'dir').catch(() => ({ ok: false, code: 'io' }));
            if (!d.ok && d.code !== 'exists') { fail(d); return false; }
          }
          const r = await api.create(key, rel, 'file').catch(() => ({ ok: false, code: 'io' }));
          if (!r.ok) { fail(r); return false; }
          const w = await api.write(key, r.rel, { text: o.code.replace(/\n*$/, '\n') }).catch(() => ({ ok: false, code: 'io' }));
          if (!w.ok) { fail(w); return false; }
          const pd = S_.dirs.get(parent) || { items: null, open: true }; pd.open = true; S_.dirs.set(parent, pd);
          await loadDir(parent, true); S_.files = null; S_.sel = r.rel; paintTree(); await openDisk(r.rel, true);
          return t('aic.done.new', ideBase(r.rel));
        }
        const c = ccAdd({ name: nm.replace(/\.[A-Za-z0-9]+$/, ''), text: o.code.replace(/\n*$/, '\n') });
        if (!c) { toast(t('aic.fail.new'), 4000); return false; }
        S_.files = null; paintTree(); openVirt(c.id, true);
        return t('aic.done.new', c.name + '.rpy');
      }
      if (kind === 'snip') {
        const sn = typeof spAdd === 'function' ? spAdd({ name: o.name, code: o.code }) : null;
        if (!sn) { toast(t('aic.fail.snip'), 4500); return false; }
        return t('aic.done.snip', sn.name);
      }
      if (kind === 'custom') {
        const c = ccAdd({ name: o.name || 'ai_code', text: o.code.replace(/\n*$/, '\n') });
        if (!c) { toast(t('aic.fail.custom'), 4500); return false; }
        S_.files = null; paintTree();
        return t('aic.done.custom', c.name);
      }
      return false;
    },
  };
  function toggleAi(force) {
    S_.ai = force === undefined ? !S_.ai : !!force; saveS();
    if (!aiP && S_.ai) { aiP = aiPanel(aiHost); aiSideEl.append(aiP.el); }
    aiSideEl.classList.toggle('hide', !S_.ai); aiSplitEl.classList.toggle('hide', !S_.ai); aiBtn.classList.toggle('on', S_.ai);
    const tb = cur(); if (tb) setTimeout(() => tb.ed.measure(), 30);
    if (S_.ai && aiP) { aiP.refresh(); setTimeout(() => aiP.focus(), 40); } else if (tb) setTimeout(() => tb.ed.focus(), 40);
  }

  /* ---------- дерево ---------- */
  const IDE_ICON = { png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', gif: 'image', bmp: 'image', svg: 'image', avif: 'image', ogg: 'music', mp3: 'music', wav: 'music', opus: 'music', flac: 'music', webm: 'film', mp4: 'film', ogv: 'film', avi: 'film', mkv: 'film', ttf: 'type', otf: 'type', woff: 'type', woff2: 'type', rpyc: 'box', rpa: 'box', pyc: 'box', zip: 'box', exe: 'box' };
  const fileIcon = name => { const m = /\.([^.\/]+)$/.exec(name || ''), e = m ? m[1].toLowerCase() : ''; if (IDE_ICON[e]) return IDE_ICON[e]; const l = ideLangOf(name); return ['renpy', 'python', 'javascript', 'css', 'html', 'xml', 'json', 'yaml', 'ini'].includes(l) ? 'code' : l === 'markdown' || l === 'text' ? 'note' : 'file'; };
  function rows() {
    const out = [];
    out.push({ t: 'sec', id: 'virt', label: t('ide.sec.virt'), open: S_.secVirt });
    if (S_.secVirt) for (const c of ccList()) out.push({ t: 'virt', id: c.id, name: c.name + '.rpy', depth: 1, off: c.on === false });
    if (api) {
      out.push({ t: 'sec', id: 'disk', label: S_.root ? t('ide.sec.disk', S_.root.name) : t('ide.nofolder'), open: S_.secDisk, disk: true });
      if (S_.secDisk && S_.root) {
        const walk = (rel, depth) => {
          const d = S_.dirs.get(rel); if (!d || !d.items) return;
          for (const it of d.items) {
            if (out.length > IDE_ROW_MAX) return;
            if (it.h && !S_.hidden) continue;
            const p = ideJoin(rel, it.n), sub = S_.dirs.get(p);
            out.push({ t: it.d ? 'dir' : 'file', rel: p, name: it.n, depth, open: !!(sub && sub.open), loading: !!(sub && sub.loading), hid: it.h });
            if (it.d && sub && sub.open) walk(p, depth + 1);
          }
        };
        walk('', 1);
      }
    }
    return out;
  }
  const rowPath = r => (r.t === 'virt' ? 'v:' + r.id : r.rel);
  const rowEl = r => {
    if (r.t === 'sec') {
      const el = h('div', { class: 'ide-row ide-sec', 'data-sec': r.id, onclick: () => { if (r.id === 'virt') S_.secVirt = !S_.secVirt; else S_.secDisk = !S_.secDisk; paintTree(); } },
        h('span', { class: 'ide-chev' + (r.open ? ' open' : '') }, icon('chev', 12, 2.4)), h('span', { class: 'ide-rn' }, r.label));
      if (r.disk) el.addEventListener('contextmenu', ev => { ev.preventDefault(); folderMenu(ev, ''); });
      return el;
    }
    const path = r.t === 'virt' ? 'v:' + r.id : r.rel, tab = S_.tabs.find(x => x.path === path);
    const el = h('div', { class: 'ide-row ide-' + r.t + (S_.active && tab && tab.id === S_.active ? ' active' : '') + (S_.sel === path ? ' sel' : '') + (r.hid ? ' hid' : '') + (r.off ? ' off' : ''), 'data-path': path, style: { paddingLeft: (10 + r.depth * 14) + 'px' } },
      r.t === 'dir' ? h('span', { class: 'ide-chev' + (r.open ? ' open' : '') }, icon('chev', 12, 2.4)) : h('span', { class: 'ide-chev sp' }),
      icon(r.t === 'dir' ? 'folder' : fileIcon(r.name), 14), h('span', { class: 'ide-rn' }, r.name),
      tab && tab.dirty ? h('span', { class: 'ide-dot', 'data-tip': t('ide.dirty') }) : null);
    el.addEventListener('click', () => { tree.focus({ preventScroll: true }); S_.sel = path; if (r.t === 'dir') toggleDir(r.rel); else openRow(r, false); markSel(); });
    el.addEventListener('dblclick', () => { if (r.t !== 'dir') { openRow(r, true); } });
    el.addEventListener('contextmenu', ev => { ev.preventDefault(); tree.focus({ preventScroll: true }); S_.sel = path; rowMenu(ev, r); markSel(); });
    return el;
  };
  const markSel = () => { tree.querySelectorAll('.ide-row').forEach(el => { el.classList.toggle('sel', el.dataset.path === S_.sel); }); };
  function paintTree() {
    if (!tree) return;
    const top = tree.scrollTop;
    tree.replaceChildren();
    if (S_.filter) { paintFilter(); return; }
    const frag = document.createDocumentFragment();
    rows().forEach(r => frag.append(rowEl(r)));
    tree.append(frag);
    if (api && !S_.root) {
      tree.append(h('div', { class: 'ide-pickbox' }, h('div', { class: 'hint' }, t('ide.pick.t')), h('button', { class: 'btn primary', id: 'ide-pick', onclick: pickFolder }, icon('folder', 15), t('ide.pick'))));
    } else if (!api) {
      const old = typeof DESK !== 'undefined' && DESK;                       // окно программы, но оболочка без доступа к папкам: нужно обновить, а не «открыть в программе»
      tree.append(h('div', { class: 'ide-pickbox' }, h('div', { class: 'hint' + (old ? ' warn-t' : ''), id: old ? 'ide-oldshell' : 'ide-webonly' }, t(old ? 'ide.oldshell' : 'ide.web')), old && typeof ghShellButtons === 'function' ? ghShellButtons() : null));
    }
    tree.scrollTop = top;
  }
  async function paintFilter() {
    const q = S_.filter.toLowerCase(), list = await filesList();
    if (q !== S_.filter.toLowerCase()) return;
    const hits = list.filter(f => f.path.toLowerCase().includes(q)).slice(0, 300);
    tree.replaceChildren();
    if (!hits.length) { tree.append(h('div', { class: 'empty small' }, t('ide.nomatch'))); return; }
    for (const f of hits) {
      const path = f.virt ? 'v:' + f.id : f.path;
      tree.append(h('div', { class: 'ide-row ide-file', 'data-path': path, style: { paddingLeft: '10px' }, onclick: () => { openRow(f.virt ? { t: 'virt', id: f.id, name: f.name } : { t: 'file', rel: f.path, name: f.name }, true); } },
        icon(fileIcon(f.name), 14), h('span', { class: 'ide-rn' }, f.name), h('span', { class: 'ide-rp' }, f.virt ? t('ide.qo.virt') : ideDirOf(f.path))));
    }
  }
  async function toggleDir(rel) {
    const d = S_.dirs.get(rel) || { items: null, open: false }; S_.dirs.set(rel, d);
    d.open = !d.open;
    if (d.open && !d.items) { paintTree(); await loadDir(rel); }
    paintTree();
  }
  async function pickFolder() {
    if (typeof rpPickProject !== 'function') return;
    await rpPickProject();
    await loadRoot(); S_.dirs = new Map([['', { items: null, open: true }]]); S_.files = null;
    if (S_.root) { await loadDir(''); const g = S_.dirs.get('game'); const hasGame = (S_.dirs.get('').items || []).some(x => x.d && x.n === 'game'); if (hasGame) { S_.dirs.set('game', g || { items: null, open: true }); S_.dirs.get('game').open = true; await loadDir('game'); } }
    paintTree(); paintHead();
  }

  /* ---------- вкладки и редактор ---------- */
  let seq = 0;
  async function openRow(r, focusEd) {
    if (r.t === 'virt') return openVirt(r.id, focusEd);
    return openDisk(r.rel, focusEd);
  }
  function openVirt(id, focusEd) {
    const c = virtOf(id); if (!c) return null;
    let tab = S_.tabs.find(x => x.path === 'v:' + id);
    if (!tab) {
      tab = { id: 't' + (++seq), kind: 'virt', path: 'v:' + id, vid: id, name: c.name + '.rpy', lang: 'renpy', eol: 'lf', bom: false, saved: c.text, dirty: false, mtime: 0 };
      tab.ed = makeEditor(tab, c.text); S_.tabs.push(tab);
    }
    activate(tab.id, focusEd); return tab;
  }
  async function openDisk(rel, focusEd) {
    let tab = S_.tabs.find(x => x.path === rel);
    if (!tab) {
      const r = await api.read(key, rel).catch(() => ({ ok: false, code: 'io' }));
      if (!r.ok) {
        if (r.code === 'binary') { showBinary(rel); return null; }
        fail(r); return null;
      }
      tab = { id: 't' + (++seq), kind: 'disk', path: rel, name: ideBase(rel), lang: ideLangOf(rel), eol: r.eol, bom: r.bom, saved: r.text, dirty: false, mtime: r.mtime };
      const bk = bakAll()[bakKey(rel)];
      if (bk && typeof bk.text === 'string' && bk.text !== r.text && Math.abs((bk.mtime || 0) - r.mtime) <= 2) { tab.ed = makeEditor(tab, bk.text); tab.dirty = true; toast(t('ide.restored', tab.name), 4500); }
      else { if (bk) bakDrop(tab); tab.ed = makeEditor(tab, r.text); }
      S_.tabs.push(tab);
    }
    activate(tab.id, focusEd); return tab;
  }
  function showBinary(rel) {
    toast(t('ide.nobin'), 4500);
    if (api && api.reveal) api.reveal(key, rel).catch(() => { });
  }
  function makeEditor(tab, text) {
    const ed = ceCreate({
      text, lang: tab.lang, label: tab.name,
      fontSize: S_.fs,
      hint: ctx => chHint(ctx, hintEnv), onDefinition: info => defineAt(tab, info),
      onChange: v => onEdit(tab, v), onCursor: c => { if (S_.active === tab.id) paintStatus(c); }, onSave: () => saveTab(tab),
      onFont: v => { if (S_.fs === v) return; S_.fs = v; saveS(); for (const tb of S_.tabs) if (tb.ed && tb.ed.fs !== v) tb.ed.setFont(v); },
    });
    ed.el.classList.add('hide'); host.append(ed.el);
    return ed;
  }
  function onEdit(tab, v) {
    if (S_.active === tab.id) schedOutline();
    if (tab.kind === 'virt') {
      const c = virtOf(tab.vid); if (!c) return;
      c.text = v; clearTimeout(tab.vt); tab.vt = setTimeout(() => { commit(false); }, 250); tab.saved = v; tab.dirty = false;
    } else {
      const d = v !== tab.saved; if (d !== tab.dirty) { tab.dirty = d; paintTabs(); markDirtyRows(); }
      bakPut(tab);
    }
  }
  function markDirtyRows() { paintTree(); }
  function activate(id, focusEd) {
    S_.active = id;
    for (const tb of S_.tabs) tb.ed.el.classList.toggle('hide', tb.id !== id);
    const tab = cur();
    emptyEl.hidden = !!tab;
    paintTabs(); paintBanner(); paintStatus(); paintOutline(); if (tab) { S_.sel = tab.path; tab.ed.measure(); if (focusEd) { tab.ed.focus(); setTimeout(() => { if (S_.active === tab.id) tab.ed.focus(); }, 0); } }
    paintTree();
  }
  async function closeTab(id, force) {
    const tab = tabById(id); if (!tab) return true;
    if (tab.dirty && !force) {
      const a = await askSave(tab.name);
      if (a === 'cancel') return false;
      if (a === 'save' && !(await saveTab(tab))) return false;
      if (a === 'dont') { tab.dirty = false; bakDrop(tab); }
    }
    clearTimeout(tab.vt); if (tab.kind === 'virt') { const c = virtOf(tab.vid); if (c && c.text !== tab.ed.get()) { c.text = tab.ed.get(); commit(false); } }
    const i = S_.tabs.indexOf(tab); S_.tabs.splice(i, 1); tab.ed.destroy();
    if (S_.active === id) { const nx = S_.tabs[Math.min(i, S_.tabs.length - 1)]; S_.active = nx ? nx.id : null; }
    activate(S_.active, true); return true;
  }
  function askSave(name, many) {
    return new Promise(res => {
      let done = false; const fin = v => { if (done) return; done = true; res(v); };
      openModal({
        cls: 'dlg', onClose: () => fin('cancel'),
        build: m => h('div', { class: 'dlg-body' }, h('h3', many ? t('ide.unsaved.q2', name) : t('ide.unsaved.q', name)), h('p', t('ide.unsaved.t')),
          h('div', { class: 'dlg-actions' },
            h('button', { class: 'btn', id: 'ide-cancel', onclick: () => { fin('cancel'); m.close(); } }, t('c.cancel')),
            h('button', { class: 'btn danger', id: 'ide-dont', onclick: () => { fin('dont'); m.close(); } }, t('ide.dont')),
            h('button', { class: 'btn primary', id: 'ide-yes', onclick: () => { fin('save'); m.close(); } }, t('ide.save'))))
      });
    });
  }
  async function saveTab(tab) {
    if (!tab) return true;
    if (tab.kind === 'virt') { const c = virtOf(tab.vid); if (c) { c.text = tab.ed.get(); commit(true); } flashSaved(); return true; }
    const text = tab.ed.get();
    let r = await api.write(key, tab.path, { text, eol: tab.eol, bom: tab.bom, expect: tab.mtime }).catch(() => ({ ok: false, code: 'io' }));
    if (!r.ok && r.code === 'changed') {
      const yes = await confirmDlg({ title: t('ide.over.q'), text: t('ide.over.t', tab.name), ok: t('ide.over.ok'), danger: true });
      if (!yes) return false;
      r = await api.write(key, tab.path, { text, eol: tab.eol, bom: tab.bom }).catch(() => ({ ok: false, code: 'io' }));
    }
    if (!r.ok) { fail(r); return false; }
    hintIx.set(tab.path, chScan(text));
    tab.saved = text; tab.mtime = r.mtime; tab.dirty = tab.ed.get() !== text; tab.conflict = ''; bakPut(tab, true); paintTabs(); paintBanner(); paintTree(); flashSaved();
    return true;
  }
  async function saveAll() { for (const tb of S_.tabs.slice()) if (tb.dirty) { if (!(await saveTab(tb))) return false; } return true; }
  let flashT = 0;
  function flashSaved() { statusL.textContent = t('ide.saved'); clearTimeout(flashT); flashT = setTimeout(() => paintStatus(), 1600); }

  function paintTabs() {
    tabsEl.replaceChildren();
    for (const tb of S_.tabs) {
      const el = h('div', { class: 'ide-tab' + (tb.id === S_.active ? ' on' : ''), 'data-tab': tb.id, 'data-tip': tb.kind === 'virt' ? t('ide.virt.note', tb.name.replace(/\.rpy$/, '')) : tb.path },
        icon(fileIcon(tb.name), 13), h('span', { class: 'ide-tn' }, tb.name),
        h('button', { class: 'ide-tx' + (tb.dirty ? ' dirty' : ''), 'aria-label': t('ide.close'), 'data-tip': t('ide.close'), onclick: ev => { ev.stopPropagation(); closeTab(tb.id); } }, tb.dirty ? h('span', { class: 'ide-dot' }) : icon('x', 12, 2.4)));
      el.addEventListener('click', () => activate(tb.id, true));
      el.addEventListener('auxclick', ev => { if (ev.button === 1) { ev.preventDefault(); closeTab(tb.id); } });
      tabsEl.append(el);
    }
    const on = tabsEl.querySelector('.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function paintBanner() {
    banner.replaceChildren(); const tab = cur();
    if (!tab || !tab.conflict) { banner.hidden = true; return; }
    banner.hidden = false;
    if (tab.conflict === 'gone') banner.append(h('span', t('ide.ext.gone')), h('button', { class: 'btn sm', id: 'ide-resave', onclick: () => { tab.conflict = ''; tab.mtime = 0; saveTab(tab); } }, t('ide.ext.resave')), h('button', { class: 'btn sm', onclick: () => { tab.conflict = 'gone-ok'; paintBanner(); } }, t('ide.ext.keep')));
    else banner.append(h('span', t('ide.ext.changed')), h('button', { class: 'btn sm primary', id: 'ide-reload', onclick: () => reloadTab(tab) }, t('ide.ext.load')), h('button', { class: 'btn sm', id: 'ide-keep', onclick: () => { tab.conflict = ''; tab.ack = tab.diskM; paintBanner(); } }, t('ide.ext.keep')));
    if (tab.conflict === 'gone-ok') banner.hidden = true;
  }
  async function reloadTab(tab) {
    const r = await api.read(key, tab.path).catch(() => ({ ok: false }));
    if (!r.ok) { fail(r); return; }
    const st = tab.ed.state();
    tab.ed.set(r.text); tab.ed.restore(st);
    tab.saved = r.text; tab.mtime = r.mtime; tab.eol = r.eol; tab.bom = r.bom; tab.dirty = false; tab.conflict = ''; bakDrop(tab); paintTabs(); paintBanner(); paintTree();
  }
  function paintStatus(c) {
    const tab = cur();
    if (!tab) { statusL.textContent = ''; statusR.replaceChildren(); return; }
    const cc = c || S_.lastCur || { line: 1, col: 1, len: 0 }; S_.lastCur = cc;
    statusL.textContent = t('ce.line', cc.line, cc.col) + (cc.len ? ' · ' + t('ce.sel', cc.len) : '');
    markOutline(cc.line - 1); if (aiP) aiP.touch();
    statusR.replaceChildren(h('span', tab.kind === 'virt' ? t('ide.sec.virt') : tab.path),
      h('button', { class: 'ide-sbtn ide-lang', id: 'ide-lang', 'data-tip': t('ide.lang.pick'), onclick: ev => langMenu(ev.currentTarget) }, t('ide.lang.' + tab.lang)), h('span', 'UTF-8'), h('span', tab.eol === 'crlf' ? 'CRLF' : 'LF'));
  }
  function langMenu(anchor) {
    const tab = cur(); if (!tab) return;
    menuAt(anchor, IDE_LANGS.map(l => ({ label: t('ide.lang.' + l), icon: l === tab.lang ? 'check' : null, onClick: () => { tab.lang = l; tab.ed.setLang(l); paintStatus(); } })));
  }
  function paintHead() {
    if (rootChip) rootChip.textContent = S_.root ? S_.root.name : '';
    const b = mhead.querySelector('#ide-folder');
    if (b) b.hidden = !api;
  }

  /* ---------- действия над файлами ---------- */
  const parentFor = () => {
    const p = S_.sel;
    if (!S_.root || !p || p.startsWith('v:')) return S_.dirs.has('game') && (S_.dirs.get('game').items) ? 'game' : '';
    const d = S_.dirs.get(p); const info = (S_.dirs.get(ideDirOf(p)) || {}).items || [];
    const it = info.find(x => x.n === ideBase(p));
    return it && it.d ? p : ideDirOf(p);
  };
  async function newItem(kind, parent) {
    if (!S_.root) { if (kind === 'file') return newVirt(); return; }
    const name = await promptDlg({ title: t(kind === 'dir' ? 'ide.new.dir' : 'ide.new.file'), label: t(kind === 'dir' ? 'ide.p.dir' : 'ide.p.file'), placeholder: kind === 'dir' ? '' : t('ide.p.file.ph'), ok: t('c.create') });
    if (!name) return;
    let nm = name.trim().replace(/[\\/]+/g, '/'); if (kind === 'file' && !/\.[A-Za-z0-9]+$/.test(nm)) nm += '.rpy';
    const rel = ideJoin(parent, nm);
    const r = await api.create(key, rel, kind).catch(() => ({ ok: false, code: 'io' }));
    if (!r.ok) { fail(r); return; }
    const pd = S_.dirs.get(parent) || { items: null, open: true }; pd.open = true; S_.dirs.set(parent, pd);
    await loadDir(parent, true); S_.files = null; S_.sel = r.rel;
    if (kind === 'dir') { paintTree(); return; }
    paintTree(); await openDisk(r.rel, true);
  }
  async function newVirt() {
    const name = await promptDlg({ title: t('ide.new.file'), label: t('ide.p.vfile'), placeholder: 'screens_extra', ok: t('c.create') });
    if (!name) return;
    const c = ccAdd({ name, text: '' }); if (!c) { toast(t('cu.up.same', name)); return; }
    S_.files = null; paintTree(); openVirt(c.id, true);
  }
  async function renameRow(r) {
    if (r.t === 'virt') {
      const c = virtOf(r.id); if (!c) return;
      const name = await promptDlg({ title: t('ide.m.rename').replace('…', ''), label: t('ide.p.vfile'), value: c.name, ok: 'OK' });
      if (!name) return; c.name = ccFreeName(name, c); commit(true);
      const tab = S_.tabs.find(x => x.path === 'v:' + r.id); if (tab) { tab.name = c.name + '.rpy'; paintTabs(); }
      S_.files = null; paintTree(); return;
    }
    const name = await promptDlg({ title: t('ide.m.rename').replace('…', ''), label: t('ide.p.rename'), value: r.name, ok: 'OK' });
    if (!name || name === r.name) return;
    const to = ideJoin(ideDirOf(r.rel), name.trim());
    const res = await api.rename(key, r.rel, to).catch(() => ({ ok: false, code: 'io' }));
    if (!res.ok) { fail(res); return; }
    for (const tb of S_.tabs) if (tb.kind === 'disk' && (tb.path === r.rel || tb.path.startsWith(r.rel + '/'))) { tb.path = to + tb.path.slice(r.rel.length); tb.name = ideBase(tb.path); tb.lang = ideLangOf(tb.name); tb.ed.setLang(tb.lang); }
    for (const k of [...S_.dirs.keys()]) if (k === r.rel || k.startsWith(r.rel + '/')) { S_.dirs.set(to + k.slice(r.rel.length), S_.dirs.get(k)); S_.dirs.delete(k); }
    await loadDir(ideDirOf(r.rel), true); S_.files = null; S_.sel = to; paintTabs(); paintTree(); paintStatus();
  }
  async function deleteRow(r) {
    if (r.t === 'virt') {
      const c = virtOf(r.id); if (!c) return;
      if (!(await confirmDlg({ title: t('ide.del.q', c.name + '.rpy'), text: t('ide.del.t.virt'), ok: t('ide.del.ok'), danger: true }))) return;
      const tab = S_.tabs.find(x => x.path === 'v:' + r.id); if (tab) await closeTab(tab.id, true);
      P.code = ccList().filter(x => x.id !== r.id); commit(true); S_.files = null; paintTree(); return;
    }
    if (!(await confirmDlg({ title: t('ide.del.q', r.name), text: t(r.t === 'dir' ? 'ide.del.t.dir' : 'ide.del.t'), ok: t('ide.del.ok'), danger: true }))) return;
    const res = await api.remove(key, r.rel).catch(() => ({ ok: false, code: 'io' }));
    if (!res.ok) { fail(res); return; }
    for (const tb of S_.tabs.slice()) if (tb.kind === 'disk' && (tb.path === r.rel || tb.path.startsWith(r.rel + '/'))) await closeTab(tb.id, true);
    for (const k of [...S_.dirs.keys()]) if (k === r.rel || k.startsWith(r.rel + '/')) S_.dirs.delete(k);
    await loadDir(ideDirOf(r.rel), true); S_.files = null; S_.sel = ''; paintTree();
  }
  function rowMenu(ev, r) {
    const items = [];
    if (r.t === 'virt') items.push({ label: t('ide.m.open'), icon: 'open', onClick: () => openVirt(r.id, true) }, { label: t('ide.m.rename'), icon: 'type', onClick: () => renameRow(r) }, { label: t('ide.m.delete'), icon: 'trash', danger: true, onClick: () => deleteRow(r) });
    else {
      if (r.t === 'file') items.push({ label: t('ide.m.open'), icon: 'open', onClick: () => openDisk(r.rel, true) });
      if (r.t === 'dir') items.push({ label: t('ide.m.newfile'), icon: 'new', onClick: () => newItem('file', r.rel) }, { label: t('ide.m.newdir'), icon: 'folder', onClick: () => newItem('dir', r.rel) }, { sep: true });
      items.push({ label: t('ide.m.rename'), icon: 'type', onClick: () => renameRow(r) }, { label: t('ide.m.delete'), icon: 'trash', danger: true, onClick: () => deleteRow(r) }, { sep: true },
        { label: t('ide.m.reveal'), icon: 'folder', onClick: () => api.reveal && api.reveal(key, r.rel) }, { label: t('ide.m.copy'), icon: 'copy', onClick: () => { try { navigator.clipboard.writeText(r.rel); } catch (e) { /* нет буфера */ } } });
    }
    showMenu(ev.clientX, ev.clientY, items);
  }
  function folderMenu(ev, rel) {
    if (!S_.root) return;
    showMenu(ev.clientX, ev.clientY, [{ label: t('ide.m.newfile'), icon: 'new', onClick: () => newItem('file', rel) }, { label: t('ide.m.newdir'), icon: 'folder', onClick: () => newItem('dir', rel) }, { sep: true }, { label: t('ide.refresh'), icon: 'refresh', onClick: () => refreshOpenDirs() }]);
  }

  /* ---------- быстрый переход (Ctrl+P) ---------- */
  async function quickOpen() {
    const old = host.parentElement.querySelector('.ide-qo'); if (old) { old.remove(); return; }
    const list = await filesList();
    const inp = h('input', { class: 'inp', id: 'ide-qo', placeholder: t('ide.qo.ph'), autocomplete: 'off', spellcheck: 'false' });
    const res = h('div', { class: 'ide-qo-list scroll' });
    const box = h('div', { class: 'ide-qo' }, inp, res);
    let hits = [], idx = 0;
    const score = (f, q) => { const n = f.name.toLowerCase(), p = f.path.toLowerCase(); if (!q) return 1; let i = n.indexOf(q); if (i >= 0) return 1000 - i - n.length; i = p.indexOf(q); if (i >= 0) return 500 - i; let k = 0; for (const ch of p) if (ch === q[k]) k++; return k === q.length ? 100 - p.length / 10 : -1; };
    const paint = () => {
      const q = inp.value.trim().toLowerCase();
      hits = list.map(f => [f, score(f, q)]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1]).slice(0, 40).map(x => x[0]);
      idx = Math.min(idx, Math.max(0, hits.length - 1)); res.replaceChildren();
      if (!hits.length) res.append(h('div', { class: 'empty small' }, t('ide.nomatch')));
      hits.forEach((f, i) => res.append(h('div', { class: 'ide-qo-i' + (i === idx ? ' on' : ''), onclick: () => go(f) }, icon(fileIcon(f.name), 14), h('b', f.name), h('span', { class: 'ide-rp' }, f.virt ? t('ide.qo.virt') : ideDirOf(f.path)))));
    };
    const go = f => { box.remove(); if (f.virt) openVirt(f.id, true); else openDisk(f.path, true); };
    inp.addEventListener('input', () => { idx = 0; paint(); });
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); box.remove(); const tb = cur(); if (tb) tb.ed.focus(); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); idx = Math.min(idx + 1, hits.length - 1); paint(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); idx = Math.max(0, idx - 1); paint(); }
      else if (ev.key === 'Enter') { ev.preventDefault(); if (hits[idx]) go(hits[idx]); }
    });
    host.parentElement.append(box); paint(); inp.focus();
  }

  /* ---------- структура файла, переход к символу и к определению ---------- */
  const OL_KINDS = new Set(['label', 'screen', 'transform', 'style', 'def', 'class']);
  const OL_MARK = { label: 'L', screen: 'S', transform: 'T', style: 'Y', def: 'F', class: 'C', char: 'H', var: 'V', image: 'I' };
  let olBox, olList, olCount, olT = 0, olEnts = [];
  function buildOutline() {
    olCount = h('span', { class: 'ide-ol-n' });
    const head = h('button', { class: 'ide-oh', id: 'ide-oh', type: 'button', 'aria-expanded': String(S_.ol), 'data-tip': t('ide.outline.toggle'), onclick: () => { S_.ol = !S_.ol; saveS(); paintOutlineBox(); } }, icon('chev', 13, 2.4), h('b', t('ide.outline')), olCount);
    olList = h('div', { class: 'ide-ol scroll', id: 'ide-ol', role: 'list' });
    olBox = h('div', { class: 'ide-olbox' }, head, olList);
    paintOutlineBox();
    return olBox;
  }
  function paintOutlineBox() { olBox.classList.toggle('open', !!S_.ol); olBox.querySelector('#ide-oh').setAttribute('aria-expanded', String(!!S_.ol)); }
  const defsOf = tab => scanOf('o' + tab.id, tab.ed.get()).defs;
  function schedOutline() { clearTimeout(olT); olT = setTimeout(paintOutline, 350); }
  function paintOutline() {
    clearTimeout(olT); if (!olList) return;
    const tab = cur(); olList.replaceChildren(); olEnts = [];
    if (!tab) { olCount.textContent = ''; return; }
    olEnts = defsOf(tab).filter(d => OL_KINDS.has(d.kind));
    olCount.textContent = olEnts.length ? String(olEnts.length) : '';
    if (!olEnts.length) { olList.append(h('div', { class: 'ide-ol-empty' }, t('ide.outline.empty'))); return; }
    const f = document.createDocumentFragment();
    olEnts.forEach((d, i) => f.append(h('div', { class: 'ide-ol-i', role: 'listitem', 'data-i': String(i), style: 'padding-left:' + (12 + d.lvl * 12) + 'px', 'data-tip': t('ide.k.' + d.kind) + ' · ' + (d.line + 1), onclick: () => jumpTo(null, d) },
      h('span', { class: 'ide-ol-k k-' + d.kind, 'aria-hidden': 'true' }, OL_MARK[d.kind]), h('span', { class: 'ide-ol-t' }, d.name))));
    olList.append(f); markOutline(S_.lastCur ? S_.lastCur.line - 1 : 0);
  }
  /** Подсветить в структуре символ, внутри которого стоит курсор. */
  function markOutline(line) {
    if (!olList || !olEnts.length) return;
    let k = -1; for (let i = 0; i < olEnts.length; i++) { if (olEnts[i].line <= line) k = i; else break; }
    const rows = olList.children; if (rows.length !== olEnts.length) return;
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle('on', i === k);
    if (k >= 0 && S_.ol) { const el = rows[k], t0 = el.offsetTop, t1 = t0 + el.offsetHeight; if (t0 < olList.scrollTop) olList.scrollTop = t0; else if (t1 > olList.scrollTop + olList.clientHeight) olList.scrollTop = t1 - olList.clientHeight; }
  }
  const absPos = (text, line, col) => { let p = 0; for (let i = 0; i < line; i++) { const n = text.indexOf('\n', p); if (n < 0) return text.length; p = n + 1; } return Math.min(text.length, p + col); };
  const navPush = tab => { if (!tab || !tab.ed) return; const st = tab.ed.state(); S_.nav.push({ id: tab.id, pos: st.s }); if (S_.nav.length > 60) S_.nav.shift(); };
  function navBack() {
    while (S_.nav.length) {
      const n = S_.nav.pop(), tb = tabById(n.id); if (!tb) continue;
      activate(tb.id, true); tb.ed.select(Math.min(n.pos, tb.ed.get().length), Math.min(n.pos, tb.ed.get().length)); return;
    }
    toast(t('ide.nav.none'), 1800);
  }
  /** Перейти к объявлению d (из src: { virt } или { path }; null — этот же файл). */
  async function jumpTo(src, d) {
    const from = cur(); navPush(from);
    let tab = from;
    if (src && src.virt) tab = openVirt(src.virt, true);
    else if (src && src.path) tab = await openDisk(src.path, true);
    if (!tab) return;
    const text = tab.ed.get(), p = absPos(text, d.line, d.col);
    activate(tab.id, true);
    tab.ed.goto(d.line + 1, d.col + 1); tab.ed.select(p, p + (d.kind === 'label' && d.name[0] === '.' ? d.name.length : d.name.length));
  }
  /** Универсальный список выбора поверх редактора (как быстрый переход к файлу). items: [{ title, detail, mark, kind, go }] */
  function pickBox(o) {
    const old = host.parentElement.querySelector('.ide-qo'); if (old) old.remove();
    const inp = h('input', { class: 'inp', id: 'ide-pick', placeholder: o.ph, autocomplete: 'off', spellcheck: 'false', 'aria-label': o.ph });
    const res = h('div', { class: 'ide-qo-list scroll' }), box = h('div', { class: 'ide-qo ide-pick' }, inp, res);
    let hits = [], idx = 0;
    const score = (it, q) => { if (!q) return 1; const n = it.title.toLowerCase(); let i = n.indexOf(q); if (i >= 0) return 1000 - i - n.length; i = (it.detail || '').toLowerCase().indexOf(q); if (i >= 0) return 300 - i; let k = 0; for (const ch of n) if (ch === q[k]) k++; return k === q.length ? 100 : -1; };
    const paint = () => {
      const q = inp.value.trim().toLowerCase();
      hits = o.items.map(it => [it, score(it, q)]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1] || a[0].order - b[0].order).slice(0, 60).map(x => x[0]);
      idx = Math.min(idx, Math.max(0, hits.length - 1)); res.replaceChildren();
      if (!hits.length) res.append(h('div', { class: 'empty small' }, o.empty || t('ide.nomatch')));
      hits.forEach((it, i) => res.append(h('div', { class: 'ide-qo-i' + (i === idx ? ' on' : ''), onclick: () => go(it) }, h('span', { class: 'ide-ol-k k-' + it.kind, 'aria-hidden': 'true' }, it.mark || ''), h('b', it.title), it.detail ? h('span', { class: 'ide-rp' }, it.detail) : null)));
      const on = res.querySelector('.on'); if (on) { const t0 = on.offsetTop, t1 = t0 + on.offsetHeight; if (t0 < res.scrollTop) res.scrollTop = t0; else if (t1 > res.scrollTop + res.clientHeight) res.scrollTop = t1 - res.clientHeight; }
    };
    const go = it => { box.remove(); it.go(); };
    inp.addEventListener('input', () => { idx = 0; paint(); });
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); box.remove(); const tb = cur(); if (tb) tb.ed.focus(); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); idx = Math.min(idx + 1, hits.length - 1); paint(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); idx = Math.max(0, idx - 1); paint(); }
      else if (ev.key === 'Enter') { ev.preventDefault(); if (hits[idx]) go(hits[idx]); }
    });
    host.parentElement.append(box); paint(); inp.focus();
  }
  /** Ctrl+Shift+O: все символы файла (метки, экраны, функции, герои, переменные, картинки). */
  function symbolPick() {
    const tab = cur(); if (!tab) { toast(t('ide.sym.nofile'), 1600); return; }
    const items = defsOf(tab).map((d, i) => ({ title: d.name, detail: t('ide.k.' + d.kind) + ' · ' + (d.line + 1), mark: OL_MARK[d.kind], kind: d.kind, order: i, go: () => jumpTo(null, d) }));
    pickBox({ ph: t('ide.sym.ph'), items, empty: t('ide.sym.none') });
  }
  /** F12 и Ctrl+щелчок: найти, где объявлено слово под курсором. */
  function defineAt(tab, info) {
    const word = info.word, before = info.before || '';
    const KIND_ORDER = ['label', 'screen', 'transform', 'char', 'var', 'image', 'def', 'class', 'style'];
    let want = null;
    const lineText = (before + word + (info.after || ''));
    if (/^\s*(?:jump|call)\s+(?:expression\s+)?$/.test(before) || /^\s*(?:jump|call)\s+$/.test(before.replace(/\w+$/, ''))) want = 'label';
    else if (/^\s*(?:show|scene|hide)\s+(?:screen\s+)?/.test(before)) want = /^\s*(?:show|scene|hide)\s+screen\s+/.test(before) ? 'screen' : /\bat\s+(?:[\p{L}\p{N}_]+\s*,\s*)*$/u.test(before) ? 'transform' : 'image';
    else if (/^\s*call\s+screen\s+$/.test(before) || /^\s*(?:use)\s+$/.test(before)) want = 'screen';
    /* картинка «show eileen happy»: определение ищем по всему имени, а не по слову под курсором */
    let imgName = null;
    const mi = /^\s*(?:show|scene|hide)\s+((?:[\p{L}\p{N}_]+\s*)+?)(?:\s+(?:at|with|as|behind|onlayer|zorder)\b.*)?$/u.exec(lineText);
    if (mi && want === 'image') { const toks = mi[1].trim().split(/\s+/); for (let k = toks.length; k >= 1; k--) { imgName = toks.slice(0, k).join(' '); if (hintSources().some(sc => sc.scan.defs.some(d => d.kind === 'image' && d.name === imgName))) break; imgName = null; } }
    const found = [];
    for (const src of hintSources()) for (const d of src.scan.defs) {
      const nm = d.kind === 'image' ? d.name.split(' ')[0] : d.name.replace(/^\./, '');
      const hit = imgName && d.kind === 'image' ? d.name === imgName : (d.kind === 'image' ? nm === word : (nm === word || d.name === word));
      if (hit) found.push({ src, d });
    }
    if (!found.length) {
      const pl = hintEnv.labels().find(l => l.name === word && !l.code);
      toast(pl ? t('ide.def.proj', word, pl.detail || '') : t('ide.def.none', word), pl ? 4500 : 2200);
      return false;
    }
    const rank = f => (want && f.d.kind === want ? -10 : 0) + KIND_ORDER.indexOf(f.d.kind);
    found.sort((a, b) => rank(a) - rank(b));
    const bestKind = found[0].d.kind; let list = found.filter(f => f.d.kind === bestKind);
    const same = list.filter(f => (f.src.virt && tab.kind === 'virt' && f.src.virt === tab.vid) || (f.src.path && tab.kind === 'disk' && f.src.path === tab.path));
    if (same.length === 1 && list.length > 1 && bestKind !== 'label') list = same;
    const go = f => jumpTo(f.src.virt ? { virt: f.src.virt } : f.src.path ? { path: f.src.path } : null, f.d);
    if (list.length === 1) { go(list[0]); return true; }
    pickBox({ ph: t('ide.def.pick', word), items: list.map((f, i) => ({ title: f.d.name, detail: f.src.name + ' · ' + (f.d.line + 1), mark: OL_MARK[f.d.kind], kind: f.d.kind, order: i, go: () => go(f) })) });
    return true;
  }

  /* ---------- проверка «изменили снаружи» ---------- */
  async function pollDisk() {
    if (S_.dead || !api || !S_.root || !document.hasFocus()) return;
    const tabs = S_.tabs.filter(x => x.kind === 'disk'); if (!tabs.length) return;
    let r; try { r = await api.stat(key, tabs.map(x => x.path)); } catch (e) { return; }
    if (!r || !r.ok) return;
    for (const tb of tabs) {
      const s = r.stat[tb.path];
      if (!s) { if (tb.conflict !== 'gone' && tb.conflict !== 'gone-ok') { tb.conflict = 'gone'; tb.ack = 0; } continue; }
      if (tb.conflict === 'gone' || tb.conflict === 'gone-ok') { tb.conflict = ''; }
      if (Math.abs(s.m - tb.mtime) <= 2 || s.m === tb.ack) continue;
      if (!tb.dirty) { await reloadTab(tb); }
      else { tb.conflict = 'changed'; tb.diskM = s.m; }
    }
    paintBanner();
  }

  /* ---------- окно ---------- */
  /** «Спросить ИИ» у ошибки (aiask.js): показывает чат, при необходимости открывает файл на нужной строке и передаёт вопрос с контекстом. */
  async function askAi(spec) {
    toggleAi(true);
    if (spec.file) { try { await openByPath(spec.file); const tb = cur(); if (tb && tb.ed && spec.line) tb.ed.goto(spec.line, 1); } catch (e) { /* файла может не быть в папке: вопрос всё равно задаём */ } }
    if (aiP) aiP.ask(spec);
  }
  const win = { m: null, focus: o => { if (o && o.ask) askAi(o.ask); else if (o && o.file) openByPath(o.file); }, tabs: () => S_.tabs, cur: () => cur() };           // tabs и cur нужны проверкам
  async function openByPath(p) {
    p = String(p || '');
    const virt = ccList().find(c => p === c.name + '.rpy' || p === 'v:' + c.id);
    if (virt) return openVirt(virt.id, true);
    if (api && S_.root) {
      const parts = p.split('/'); let rel = '';
      for (let i = 0; i < parts.length - 1; i++) { rel = ideJoin(rel, parts[i]); const d = S_.dirs.get(rel) || { items: null, open: false }; d.open = true; S_.dirs.set(rel, d); await loadDir(rel); }
      paintTree(); return openDisk(p, true);
    }
    return null;
  }
  const m = openModal({
    cls: 'ide-m', dismiss: false,
    onClose: () => { S_.dead = true; clearInterval(S_.poll); window.removeEventListener('focus', onFocus); document.removeEventListener('keydown', docKeys, true); window.removeEventListener('beforeunload', onUnload); IDEW = null; for (const tb of S_.tabs) { clearTimeout(tb.vt); if (tb.kind === 'virt') { const c = virtOf(tb.vid); if (c && tb.ed && c.text !== tb.ed.get()) { c.text = tb.ed.get(); commit(false); } } } },
    build: mm => {
      mm.tag = 'ide';
      tree = h('div', { class: 'ide-tree scroll', id: 'ide-tree', tabindex: '0' });
      qEl = h('input', { class: 'inp ide-q', id: 'ide-q', placeholder: t('ide.filter'), autocomplete: 'off', spellcheck: 'false' });
      qEl.addEventListener('input', () => { S_.filter = qEl.value.trim(); paintTree(); });
      const sbtn = (ic, tip, fn, id) => h('button', { class: 'btn icon sm', id, 'data-tip': tip, 'aria-label': tip, onclick: fn }, icon(ic, 15));
      sideEl = h('div', { class: 'ide-side' + (S_.side ? '' : ' hide') },
        h('div', { class: 'ide-sh' }, h('b', t('ide.explorer')), h('div', { class: 'grow' }),
          sbtn('new', t('ide.new.file'), () => newItem('file', parentFor()), 'ide-newfile'), sbtn('folder', t('ide.new.dir'), () => newItem('dir', parentFor()), 'ide-newdir'),
          sbtn('refresh', t('ide.refresh'), () => { hintIx.clear(); refreshOpenDirs().then(buildHintIx); }, 'ide-refresh'), sbtn('eye', t('ide.hidden'), () => { S_.hidden = !S_.hidden; saveS(); eyeBtn.classList.toggle('on', S_.hidden); paintTree(); }, 'ide-hidden')),
        h('div', { class: 'ide-sf' }, qEl), tree, buildOutline());
      const eyeBtn = sideEl.querySelector('#ide-hidden'); eyeBtn.classList.toggle('on', S_.hidden);
      tabsEl = h('div', { class: 'ide-tabs scroll-x', id: 'ide-tabs' });
      banner = h('div', { class: 'ide-banner', hidden: true });
      host = h('div', { class: 'ide-edhost' });
      emptyEl = h('div', { class: 'ide-empty' }, icon('code', 40, 1.2), h('div', { class: 'ide-empty-t' }, t('ide.empty')), h('div', { class: 'hint' }, t('ide.empty.h')));
      const edWrap = h('div', { class: 'ide-edwrap' }, host, emptyEl);
      const main = h('div', { class: 'ide-main' }, h('div', { class: 'ide-tabbar' }, tabsEl), banner, edWrap);
      statusL = h('span', { class: 'ide-sl' }); statusR = h('span', { class: 'ide-sr' });
      const status = h('div', { class: 'ide-status' }, h('button', { class: 'ide-sbtn', id: 'ide-side', 'data-tip': t('ide.toggle.side'), onclick: () => toggleSide() }, icon('list', 13)), statusL, h('div', { class: 'grow' }), statusR);
      rootChip = h('span', { class: 'ide-root' });
      mhead = modalHead(t('ide.title'), mm, h('span', { class: 'ide-hchip' }, rootChip));
      const fb = h('button', { class: 'btn sm', id: 'ide-folder', hidden: !api, onclick: pickFolder }, icon('folder', 14), t('ide.change'));
      mhead.insertBefore(fb, mhead.querySelector('.grow').nextSibling);
      aiBtn = h('button', { class: 'btn sm' + (S_.ai ? ' on' : ''), id: 'ide-ai', 'data-tip': t('aic.toggle'), onclick: () => toggleAi() }, icon('wand', 14), t('aic.btn'));
      mhead.insertBefore(aiBtn, mhead.querySelector('.grow').nextSibling);
      mhead.insertBefore(h('button', { class: 'btn sm', id: 'ide-saveall', 'data-tip': t('ide.saveall'), onclick: () => saveAll() }, icon('save', 14), t('ide.saveall')), mhead.querySelector('.grow').nextSibling);
      winControl(mm, mhead, 'ide');
      const split = h('div', { class: 'ide-split' + (S_.side ? '' : ' hide'), id: 'ide-split' });
      const sw = Math.max(160, Math.min(560, +(S.ide && S.ide.sw) || 264)); sideEl.style.width = sw + 'px';
      split.addEventListener('pointerdown', ev => {
        ev.preventDefault(); split.setPointerCapture(ev.pointerId); split.classList.add('drag');
        const x0 = ev.clientX, w0 = sideEl.getBoundingClientRect().width;
        const mv = e2 => { sideEl.style.width = Math.max(160, Math.min(560, Math.min(w0 + e2.clientX - x0, main.parentElement.clientWidth - 260))) + 'px'; const tb = cur(); if (tb) tb.ed.measure(); };
        const up = () => { split.classList.remove('drag'); split.removeEventListener('pointermove', mv); split.removeEventListener('pointerup', up); split.removeEventListener('pointercancel', up); S_.sw = Math.round(sideEl.getBoundingClientRect().width); saveS(); };
        split.addEventListener('pointermove', mv); split.addEventListener('pointerup', up); split.addEventListener('pointercancel', up);
      });
      S_.split = split;
      aiSideEl = h('div', { class: 'ide-ai' + (S_.ai ? '' : ' hide'), id: 'ide-aiside' }); aiSplitEl = h('div', { class: 'ide-split ide-aisplit' + (S_.ai ? '' : ' hide'), id: 'ide-aisplit' });
      aiSideEl.style.width = Math.max(260, Math.min(640, +(S.ide && S.ide.aw) || 360)) + 'px';
      aiSplitEl.addEventListener('pointerdown', ev => {
        ev.preventDefault(); aiSplitEl.setPointerCapture(ev.pointerId); aiSplitEl.classList.add('drag');
        const x0 = ev.clientX, w0 = aiSideEl.getBoundingClientRect().width;
        const mv = e2 => { aiSideEl.style.width = Math.max(260, Math.min(640, Math.min(w0 + x0 - e2.clientX, body.clientWidth - 360))) + 'px'; const tb = cur(); if (tb) tb.ed.measure(); };
        const up = () => { aiSplitEl.classList.remove('drag'); aiSplitEl.removeEventListener('pointermove', mv); aiSplitEl.removeEventListener('pointerup', up); aiSplitEl.removeEventListener('pointercancel', up); S_.aw = Math.round(aiSideEl.getBoundingClientRect().width); saveS(); };
        aiSplitEl.addEventListener('pointermove', mv); aiSplitEl.addEventListener('pointerup', up); aiSplitEl.addEventListener('pointercancel', up);
      });
      const body = h('div', { class: 'ide-body' }, sideEl, split, main, aiSplitEl, aiSideEl);
      if (S_.ai) { aiP = aiPanel(aiHost); aiSideEl.append(aiP.el); }
      const wrap = h('div', { class: 'm-wrap ide-wrap' }, mhead, body, status);
      S_.wrap = wrap; wrap.addEventListener('keydown', onKeys);
      return wrap;
    }
  });
  function onKeys(ev) {
    const mod = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase(), inEd = !!(ev.target.classList && ev.target.classList.contains('ce-ta'));
    /* Ctrl+S, Ctrl+Shift+S, Ctrl+B в этом окне значат своё (файл, все файлы, проводник), а не «сохранить проект» и «собрать игру» главного окна: дальше событие не пускаем.
       Файл «Кода внутри проекта» часть проекта: для него Ctrl+S ещё и сохраняет проект, как в других окнах. */
    if (mod && k === 'p' && !ev.shiftKey) { ev.preventDefault(); ev.stopPropagation(); quickOpen(); }
    else if (mod && ev.shiftKey && !ev.altKey && k === 'o') { ev.preventDefault(); ev.stopPropagation(); symbolPick(); }
    else if (ev.altKey && !mod && !ev.shiftKey && ev.key === 'ArrowLeft' && (inEd || ev.target === document.body)) { ev.preventDefault(); ev.stopPropagation(); navBack(); }
    else if (mod && ev.shiftKey && !ev.altKey && k === 'a') { ev.preventDefault(); ev.stopPropagation(); toggleAi(); }
    else if (mod && k === 'b' && !ev.shiftKey) { ev.preventDefault(); ev.stopPropagation(); toggleSide(); }
    else if (mod && k === 'w') { ev.preventDefault(); ev.stopPropagation(); const tb = cur(); if (tb) closeTab(tb.id); }
    else if (mod && ev.shiftKey && k === 's') { ev.preventDefault(); ev.stopPropagation(); saveAll(); }
    else if (mod && k === 's') { ev.preventDefault(); const tb = cur(); if (tb && !inEd) saveTab(tb); if (tb && tb.kind === 'disk') ev.stopPropagation(); }
    else if (!mod && !ev.altKey && ev.target.closest && ev.target.closest('.ide-tree') && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(ev.key) && !S_.filter) {
      const list = rows().filter(x => x.t !== 'sec'), i = list.findIndex(x => rowPath(x) === S_.sel), r = list[i] || null;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); const nx = list[Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i + (ev.key === 'ArrowDown' ? 1 : -1))))]; if (nx) { S_.sel = rowPath(nx); markSel(); const el = [...tree.querySelectorAll('.ide-row')].find(x => x.dataset.path === S_.sel); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); } }
      else if (r && r.t === 'dir' && ((ev.key === 'ArrowRight' && !r.open) || (ev.key === 'ArrowLeft' && r.open) || ev.key === 'Enter')) { ev.preventDefault(); toggleDir(r.rel); }
      else if (r && r.t !== 'dir' && ev.key === 'Enter') { ev.preventDefault(); openRow(r, true); }
    }
    else if (!mod && ev.key === 'F2' && S_.sel && ev.target.closest && ev.target.closest('.ide-tree')) { ev.preventDefault(); const r = rows().find(x => rowPath(x) === S_.sel); if (r && r.t !== 'sec') renameRow(r); }
    else if (!mod && ev.key === 'Delete' && S_.sel && ev.target.closest && ev.target.closest('.ide-tree')) { const r = rows().find(x => rowPath(x) === S_.sel); if (r && r.t !== 'sec') { ev.preventDefault(); deleteRow(r); } }
  }
  /* Когда фокус нигде (щелчок по пустому месту, закрылось поле быстрого перехода), клавиши идут на документ: берём их, если это верхнее окно */
  function docKeys(ev) {
    if (S_.dead || MODALS[MODALS.length - 1] !== win.m || !S_.wrap) return;
    if (S_.wrap.contains(ev.target) || (ev.target !== document.body && ev.target !== document.documentElement)) return;
    onKeys(ev);
  }
  function toggleSide() { S_.side = !S_.side; sideEl.classList.toggle('hide', !S_.side); if (S_.split) S_.split.classList.toggle('hide', !S_.side); saveS(); const tb = cur(); if (tb) setTimeout(() => tb.ed.measure(), 30); }
  const onFocus = () => { if (!S_.dead) { pollDisk(); refreshOpenDirs(); } };
  window.addEventListener('focus', onFocus); document.addEventListener('keydown', docKeys, true);
  const onUnload = () => { for (const tb of S_.tabs) if (tb.kind === 'disk' && tb.dirty) bakPut(tb, true); };
  window.addEventListener('beforeunload', onUnload);
  /* закрытие окна с несохранёнными файлами спрашивает (Esc и крестик идут через m.close) */
  const realClose = m.close; let closing = false;
  m.close = () => {
    if (m.closed || closing) return;
    const dirty = S_.tabs.filter(x => x.dirty);
    if (!dirty.length) { realClose(); return; }
    closing = true;
    (async () => {
      const a = await askSave(dirty.length === 1 ? dirty[0].name : dirty.map(x => x.name).join(', '), dirty.length > 1);
      closing = false;
      if (a === 'cancel') return;
      if (a === 'save' && !(await saveAll())) return;
      if (a === 'dont') for (const tb of dirty) { tb.dirty = false; bakDrop(tb); }
      realClose();
    })();
  };
  win.m = m; IDEW = win;
  /* первый показ */
  (async () => {
    await loadRoot();
    if (S_.root) { await loadDir(''); const hasGame = (S_.dirs.get('').items || []).some(x => x.d && x.n === 'game'); if (hasGame) { S_.dirs.set('game', { items: null, open: true }); await loadDir('game'); } }
    paintTree(); paintHead(); paintTabs(); paintStatus();
    emptyEl.hidden = false;
    S_.poll = setInterval(pollDisk, 2500);
    buildHintIx();
    if (opts.ask) await askAi(opts.ask);
    else if (opts.file) openByPath(opts.file);
    else if (!S_.tabs.length) { const first = ccList()[0]; if (first && !S_.root) openVirt(first.id, false); }
  })();
  return m;
}
TOOL_ITEMS.push({ id: 'ide', group: 'story', ic: 'code', key: 'ide.btn', kw: 'code editor ide vs code folder tree files rpy python редактор кода папка проекта дерево файлы проводник правка кода текст файл ren\'py скрипт', run: () => openIde() });

'use strict';
/* ====== Лист для озвучки (1.6.8) ======
   Реплики проекта, разложенные по тем, кто их читает: актёр (из карточки персонажа, поле «Озвучивает») или, если актёр не назначен, персонаж.
   У каждой реплики: номер внутри листа актёра (он не сбивается от фильтров), эмоция (слова между именем и текстом: `e happy "…"`), текст,
   число слов, заметка для актёра (комментарий в конце строки после #), статус записи и имя файла.
   Статус считается сам, ничего вручную отмечать не нужно: нет строки `voice` перед репликой — «Нужно записать»; строка есть, а файла в реестре
   нет — «В скрипте, файла нет»; файл загружен в реестр — «Озвучена». Имя файла для записи придумывается по схеме «персонаж_блок_номер».
   Выгрузка: CSV (то, что показано) и Excel, где на каждого актёра свой лист и первым листом сводка. Скрипты программа не меняет. */

Object.assign(D, {
  'vc.btn': ['Лист для озвучки…', 'Voice-over sheet…'],
  'vc.title': ['Лист для озвучки', 'Voice-over sheet'],
  'vc.intro': ['Реплики проекта по актёрам: номер, эмоция, текст, статус и имя файла для записи. Актёр берётся из карточки персонажа («Озвучивает»), а если он не назначен, лист ведётся по персонажу. Статус считается сам: смотрит, есть ли перед репликой строка voice и загружен ли файл в реестр.', 'Project lines by actor: number, emotion, text, status and the file name to record. The actor comes from the character card (“Voiced by”); if none is set, the sheet is kept per character. The status is worked out by itself: the app checks whether a voice line precedes the line and whether the file is in the registry.'],
  'vc.q': ['Поиск: текст, персонаж, блок', 'Search: text, character, block'],
  'vc.g.all': ['Все', 'All'],
  'vc.narr': ['Рассказчик', 'Narrator'],
  'vc.o.narr': ['Строки без имени (рассказчик)', 'Lines with no name (narrator)'],
  'vc.o.narr.h': ['Обычно рассказчика не озвучивают, поэтому по умолчанию его строк в листе нет.', 'The narrator is usually not voiced, so by default the sheet has no narrator lines.'],
  'vc.st.all': ['Любой статус', 'Any status'],
  'vc.st.need': ['Нужно записать', 'To record'],
  'vc.st.script': ['В скрипте, файла нет', 'In script, no file'],
  'vc.st.ready': ['Озвучена', 'Voiced'],
  'vc.col.n': ['№', '#'], 'vc.col.block': ['Блок', 'Block'], 'vc.col.line': ['Строка', 'Line'], 'vc.col.who': ['Персонаж', 'Character'],
  'vc.col.emo': ['Эмоция', 'Emotion'], 'vc.col.text': ['Текст', 'Text'], 'vc.col.words': ['Слов', 'Words'], 'vc.col.note': ['Заметка для актёра', 'Note for the actor'],
  'vc.col.status': ['Статус', 'Status'], 'vc.col.file': ['Имя файла', 'File name'],
  'vc.col.actor': ['Актёр', 'Actor'], 'vc.col.chars': ['Персонажи', 'Characters'], 'vc.col.lines': ['Реплик', 'Lines'], 'vc.col.rec': ['Запись, мин', 'Recording, min'], 'vc.col.done': ['Озвучено', 'Voiced'],
  'vc.lines': [['{0} реплика', '{0} реплики', '{0} реплик'], ['{0} line', '{0} lines']],
  'vc.words': [['{0} слово', '{0} слова', '{0} слов'], ['{0} word', '{0} words']],
  'vc.rec': ['запись около {0}', 'recording about {0}'],
  'vc.done': ['озвучено {0} из {1}', '{0} of {1} voiced'],
  'vc.noactor': ['актёр не назначен', 'no actor assigned'],
  'vc.actor': ['актёр: {0}', 'actor: {0}'],
  'vc.chars': ['персонажи: {0}', 'characters: {0}'],
  'vc.sum': ['Показано {0} из {1}', 'Showing {0} of {1}'],
  'vc.empty': ['Реплик с именем пока нет. Они появятся, когда в скриптах блоков будут строки вида: имя "текст".', 'There are no named lines yet. They appear once block scripts contain lines like: name "text".'],
  'vc.none': ['Ничего не найдено. Измените фильтры.', 'Nothing found. Change the filters.'],
  'vc.more': ['Показать ещё', 'Show more'],
  'vc.export': ['Выгрузить', 'Export'],
  'vc.exp.csv': ['Таблица CSV: то, что сейчас показано', 'CSV table: what is shown now'],
  'vc.exp.xlsx': ['Excel: лист на каждого актёра и сводка', 'Excel: a sheet per actor and a summary'],
  'vc.exp.one': ['Excel: только «{0}»', 'Excel: only “{0}”'],
  'vc.exp.done': [['Выгружена {0} реплика', 'Выгружено {0} реплики', 'Выгружено {0} реплик'], ['Exported {0} line', 'Exported {0} lines']],
  'vc.open': ['Открыть эту строку в скрипте', 'Open this line in the script'],
  'vc.copy.tip': ['Нажмите, чтобы скопировать имя файла', 'Click to copy the file name'],
  'vc.sug.tip': ['Предложенное имя: в скрипте перед этой репликой строки voice пока нет', 'Suggested name: there is no voice line before this line in the script yet'],
  'vc.copied': ['Имя файла скопировано', 'File name copied'],
  'vc.sheet.sum': ['Сводка', 'Summary'],
  /* вставка строк voice (1.6.9) */
  'vi.btn': ['Вставить voice…', 'Insert voice…'],
  'vi.title': ['Вставить строки voice в скрипты', 'Insert voice lines into the scripts'],
  'vi.lead': ['Когда записи готовы, перед каждой репликой в скрипте нужна строка voice "файл". Программа находит записи по именам из листа (персонаж_блок_номер) и вставляет такие строки сама. Пока вы не нажали кнопку, ничего не меняется; все вставки отменяются одним Ctrl+Z.', 'When the recordings are ready, every line in the script needs a voice "file" line before it. The app finds the recordings by the names from the sheet (character_block_number) and inserts those lines for you. Nothing changes until you press the button; all the insertions are undone by one Ctrl+Z.'],
  'vi.up': ['Загрузить файлы озвучки', 'Upload voice files'],
  'vi.up.h': ['Выберите записи, можно сразу много. Файл попадает к реплике, если его имя совпадает с именем из листа: регистр, пробелы и «_» не важны, расширение любое. Записи станут ресурсами вида «Голос».', 'Pick the recordings, many at once if you like. A file goes to a line if its name matches the name from the sheet: case, spaces and “_” do not matter, any extension. The recordings become resources of the “Voice” kind.'],
  'vi.up.done': ['Загружено файлов: {0}', 'Files uploaded: {0}'],
  'vi.up.skip': ['Не нашли реплику для: {0}', 'No line found for: {0}'],
  'vi.sum': ['Можно вставить: {0} · уже с voice: {1} · без записи: {2}', 'Can be inserted: {0} · already with voice: {1} · without a recording: {2}'],
  'vi.none': ['Пока нечего вставлять: нет записей с именами из листа. Загрузите файлы кнопкой выше или добавьте их в «Реестр → Аудио» под именами из листа.', 'Nothing to insert yet: there are no recordings with the names from the sheet. Upload the files with the button above or add them in “Registry → Audio” under the names from the sheet.'],
  'vi.go': [['Вставить {0} строку voice', 'Вставить {0} строки voice', 'Вставить {0} строк voice'], ['Insert {0} voice line', 'Insert {0} voice lines']],
  'vi.done': ['Вставлено строк voice: {0}. Ctrl+Z отменит всё сразу.', 'Voice lines inserted: {0}. Ctrl+Z undoes them all at once.'],
  'vi.stale': ['Пропущено, потому что скрипт успел измениться: {0}.', 'Skipped because the script had changed: {0}.'],
  'vi.more': ['…и ещё {0}', '…and {0} more'],
  'vi.col.res': ['Запись в реестре', 'Registry recording'],
  'vi.kind': ['вид «{0}», не «Голос»', 'kind “{0}”, not “Voice”'],
  'vc.foot': ['Заметку для актёра пишите в конце строки реплики после «#»: она попадёт в лист. Скрипты эта таблица не меняет.', 'Write a note for the actor at the end of the line after “#”: it goes into the sheet. This table does not change the scripts.'],
});

const VC_WPS = 2.3;                                  // слов в секунду при записи (около 140 в минуту, с паузами)
const VC_PAGE = 150;
const VC_ST = ['need', 'script', 'ready'];
const VC = { grp: '', st: 'all', narr: false, q: '' };   // последние настройки окна (на время сеанса)

/** Звуковой ресурс реестра, на который ссылается строка voice (так же, как это делает сборка). */
function vcAudio(ref) {
  const low = String(ref || '').toLowerCase(), norm = x => cmpPath(x).toLowerCase();
  return P.assets.find(a => AUDIO_KINDS.includes(a.kind) && ((a.name || '').toLowerCase() === low || (a.path && norm(a.path) === norm(ref)))) || null;
}
const vcHasFile = a => !!a && Object.values(a.files || {}).some(Boolean);
/** Говорящий → группа листа: актёр из карточки персонажа, иначе сам персонаж, иначе рассказчик. */
function vcKey(who) {
  if (!who) return { key: 'narr', label: t('vc.narr'), actor: null, unk: false };
  const c = rtChar(who), m = c && c.actor ? memberById(c.actor) : null;
  if (m) return { key: 'a:' + m.id, label: m.name || '?', actor: m, unk: false };
  return { key: 'c:' + who, label: c ? (c.name || c.tag) : who, actor: null, unk: !c };
}

/** Все озвучиваемые реплики проекта: { groups:[…], items:[…] }. narr — включать строки без имени. */
function vcCollect(narr) {
  const rows = rtCollect().filter(r => r.sub !== 'choice' && (narr || r.who));
  const groups = new Map(), items = [];
  const flines = new Map(), bases = new Map(), taken = new Set();
  const linesOf = f => { let a = flines.get(f.id); if (!a) { a = tlLines(f); flines.set(f.id, a); } return a; };
  const suggest = r => {
    const key = (r.who || 'narr') + '|' + r.n.id;
    let b = bases.get(key);
    if (!b) {
      const stem = slug(r.who || 'narr') + '_' + slug(r.n.title).slice(0, 24).replace(/_+$/, '');
      let cand = stem, i = 2; while (taken.has(cand)) cand = stem + '_' + (i++);
      taken.add(cand); b = { name: cand, k: 0 }; bases.set(key, b);
    }
    b.k++;
    return b.name + '_' + String(b.k).padStart(2, '0') + '.ogg';
  };
  for (const r of rows) {
    const k = vcKey(r.who);
    let g = groups.get(k.key);
    if (!g) { g = Object.assign({ chars: [], rows: [], words: 0, st: { need: 0, script: 0, ready: 0 } }, k); groups.set(k.key, g); }
    const cname = r.who ? rtWhoName(r.who) : t('vc.narr');
    if (!g.chars.includes(cname)) g.chars.push(cname);
    let note = '';
    if (r.endCol != null) { const raw = linesOf(r.f)[r.li] || '', m = /#\s*(.*?)\s*$/.exec(raw.slice(r.endCol)); if (m) note = m[1]; }
    const file = r.voice || '', sg = suggest(r), sug = file ? '' : sg;            // номер занимает и озвученная строка: имена не сдвигаются, когда часть реплик уже записана
    let status = 'need';
    if (file) status = vcHasFile(vcAudio(file)) ? 'ready' : 'script';
    const it = { r, g, n: g.rows.length + 1, emo: String(r.attrs || '').trim(), note, file, sug, status, words: r.words, line: r.li + r.lead + 1 };
    it.hay = (r.hay + ' ' + it.emo + ' ' + note + ' ' + (file || sug)).toLowerCase();
    g.rows.push(it); g.words += r.words; g.st[status]++; items.push(it);
  }
  const list = [...groups.values()].sort((a, b) => (a.key === 'narr') - (b.key === 'narr') || b.rows.length - a.rows.length || a.label.localeCompare(b.label));
  return { groups: list, items };
}
const vcClock = g => arClock(Math.round(g.words / VC_WPS));

/* ---------- выгрузка ---------- */
const vcStName = s => t('vc.st.' + s);
function vcTable(items) {
  const rows = [[t('vc.col.n'), t('vc.col.block'), t('vc.col.line'), t('vc.col.who'), t('vc.col.emo'), t('vc.col.text'), t('vc.col.words'), t('vc.col.note'), t('vc.col.status'), t('vc.col.file')]];
  for (const x of items) rows.push([x.n, rtBlockName(x.r.n, x.r.f), x.line, x.r.who ? rtWhoName(x.r.who) : t('vc.narr'), x.emo, x.r.plain, x.words, x.note, vcStName(x.status), x.file || x.sug]);
  return rows;
}
const vcFileBase = extra => (slug(P.name) || 'project') + '_voice' + (extra ? '_' + slug(extra) : '');
function vcExportCsv(items, label) {
  const sep = S.lang === 'ru' ? ';' : ',';
  const text = '﻿' + vcTable(items).map(r => r.map(x => { x = String(x == null ? '' : x); return /["\r\n;,]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(sep)).join('\r\n') + '\r\n';
  return saveFile(vcFileBase(label) + '.csv', text, 'text/csv');
}
/** Excel: сводка и по листу на каждую группу. groups — группы с уже отфильтрованными строками (rows). */
function vcExportXlsx(groups, label) {
  const sheets = [], used = new Set();
  const nameOf = base => {
    let n = String(base || '?').replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 28) || '?', c = n, i = 2;
    while (used.has(c.toLowerCase())) c = n.slice(0, 26) + ' ' + (i++);
    used.add(c.toLowerCase()); return c;
  };
  const sum = [[t('vc.col.actor'), t('vc.col.chars'), t('vc.col.lines'), t('vc.col.words'), t('vc.col.rec'), t('vc.col.done')]];
  for (const g of groups) { const w = g.rows.reduce((a, x) => a + x.words, 0); sum.push([g.actor ? g.label : g.label + ' (' + t('vc.noactor') + ')', g.chars.join(', '), g.rows.length, w, Math.round(w / VC_WPS / 6) / 10, g.rows.filter(x => x.status === 'ready').length]); }
  sheets.push({ name: nameOf(t('vc.sheet.sum')), rows: sum, widths: [28, 34, 9, 9, 13, 11] });
  for (const g of groups) sheets.push({ name: nameOf(g.label), rows: vcTable(g.rows), widths: [6, 24, 8, 16, 14, 80, 7, 30, 20, 30] });
  return saveFile(vcFileBase(label) + '.xlsx', makeXlsx(sheets), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ---------- окно ---------- */
/* ---------- вставка строк voice ---------- */
/** Ключ имени файла: без папки и расширения, регистр, пробелы, «_» и «-» не важны. */
const vcNk = x => String(x == null ? '' : x).toLowerCase().replace(/^.*[\\/]/, '').replace(/\.[a-z0-9]{2,5}$/, '').replace(/[\s_\-]+/g, '_').replace(/^_+|_+$/g, '');
/** Звуковые ресурсы реестра с файлом по ключам имени (имя ресурса, путь, имя загруженного файла); «Голос» важнее остальных видов. */
function viIndex() {
  const idx = new Map();
  const put = (k, a) => { if (!k) return; const old = idx.get(k); if (!old || (old.kind !== 'voice' && a.kind === 'voice')) idx.set(k, a); };
  for (const a of P.assets) {
    if (!AUDIO_KINDS.includes(a.kind) || !vcHasFile(a)) continue;
    put(vcNk(a.name), a); if (a.path) put(vcNk(a.path), a);
    for (const f of Object.values(a.files || {})) if (f && f.name) put(vcNk(f.name), a);
  }
  return idx;
}
/** Как записать ресурс в строке voice: путь (так его находит и сборка), иначе имя. */
const viLit = a => String(a.path || a.name || '').replace(/["'\\\r\n]/g, '');
/** Что можно вставить: реплики без строки voice, для которых в реестре есть запись с именем из листа. */
function viPlan(data) {
  const idx = viIndex(), rows = []; let have = 0, none = 0;
  for (const it of data.items) {
    if (it.status !== 'need') { have++; continue; }
    const a = idx.get(vcNk(it.sug)), lit = a ? viLit(a) : '';
    if (lit) rows.push({ it, a, lit }); else none++;
  }
  return { rows, have, none };
}
/** Вставляет строку voice перед каждой репликой из плана. Скрипт, успевший измениться, не трогает. Один шаг отмены. */
function viApply(plan) {
  const byFile = new Map();
  for (const x of plan.rows) { const id = x.it.r.f.id; if (!byFile.has(id)) byFile.set(id, []); byFile.get(id).push(x); }
  let done = 0, stale = 0; const nodes = new Set();
  for (const [fid, xs] of byFile) {
    const ff = findFile(fid); if (!ff) { stale += xs.length; continue; }
    const f = ff.file, lines = String(f.script || '').replace(/\r\n?/g, '\n').split('\n'), norm = tlLines(f);
    let lead = 0; while (lead < lines.length && !lines[lead].trim()) lead++;
    xs.sort((a, b) => b.it.r.li - a.it.r.li);                                  // снизу вверх: номера выше по скрипту не сдвигаются
    let n = 0;
    for (const x of xs) {
      const r = x.it.r, L = lines[lead + r.li], m = L == null ? null : RE_TL_SAY.exec(L);
      if (!m || L.replace(/\t/g, '    ').replace(/\s+$/, '') !== norm[r.li] || (m[2] || '') !== r.who || m[4].slice(1, -1).replace(/\t/g, '    ') !== r.body) { stale++; continue; }   // строка должна остаться той, что видна в списке
      lines.splice(lead + r.li, 0, /^[ \t]*/.exec(L)[0] + 'voice "' + x.lit + '"'); n++;
    }
    if (n) { f.script = lines.join('\n'); nodes.add(ff.node.id); done += n; }
  }
  if (done) { commit(true); for (const id of nodes) { try { refreshNode(id); } catch (e) { /* карта может быть не построена */ } } }
  return { done, stale };
}
/** Загружает записи в реестр как «Голос»: файл идёт к реплике, чьё имя из листа совпало с именем файла (или к строке voice без файла). */
async function viUpload(files, data) {
  const idx = new Map();
  for (const it of data.items) { if (it.status === 'need') idx.set(vcNk(it.sug), it); else if (it.status === 'script') idx.set(vcNk(it.file), it); }
  let ok = 0; const skipped = [];
  for (const file of files) {
    const base = file.name.replace(/\.[^.]+$/, ''), it = idx.get(vcNk(base));
    if (!it || !(extOf(file.name) in AUD_TYPES)) { skipped.push(file.name); continue; }
    let a = it.status === 'script' ? vcAudio(it.file) : null;
    if (!a) {
      const nm = slug(base) || 'voice';
      a = P.assets.find(x => x.kind === 'voice' && (x.name || '').toLowerCase() === nm.toLowerCase()) || createAsset('voice', nm);
      if (it.status === 'script' && !a.path) a.path = String(it.file);        // чтобы строка voice в скрипте нашла этот ресурс
    }
    if (await attachFile(a, '', file)) ok++; else skipped.push(file.name);
  }
  return { ok, skipped };
}
function openVoiceInsert() {
  closePopover();
  openModal({
    cls: 'vi-m', build: m => {
      const body = h('div', { class: 'vi-body' });
      let data = vcCollect(true);
      const paint = () => {
        const pl = viPlan(data);
        const list = pl.rows.slice(0, 150);
        const rowEl = x => {
          const r = x.it.r, ft = rtFileTitle(r.n, r.f);
          return h('div', { class: 'vi-row' },
            h('div', { class: 'vi-blk' }, h('b', r.n.title), ft ? h('span', { class: 'hint' }, ' › ' + ft) : null, h('div', { class: 'hint' }, t('vc.col.line') + ' ' + x.it.line)),
            h('div', { class: 'vi-who' }, r.who ? rtWhoName(r.who) : t('vc.narr')),
            h('div', { class: 'vi-text' }, r.plain.length > 70 ? r.plain.slice(0, 70) + '…' : r.plain),
            h('div', { class: 'vi-lit' }, h('code', 'voice "' + x.lit + '"'), x.a.kind !== 'voice' ? h('div', { class: 'hint' }, t('vi.kind', t('kind1.' + x.a.kind))) : null));
        };
        body.replaceChildren(
          h('p', { class: 'hint' }, t('vi.lead')),
          h('div', { class: 'vi-up' }, h('button', { class: 'btn', id: 'vi-up', onclick: () => pickFiles('audio/*,.ogg,.opus,.mp3,.wav,.flac,.m4a,.aac', true, async fl => {
            const r = await viUpload(fl, data);
            data = vcCollect(true);
            toast(r.ok ? t('vi.up.done', r.ok) + (r.skipped.length ? '. ' + t('vi.up.skip', r.skipped.slice(0, 4).join(', ') + (r.skipped.length > 4 ? '…' : '')) : '') : t('vi.up.skip', r.skipped.slice(0, 4).join(', ') + (r.skipped.length > 4 ? '…' : '')), 5200);
            paint();
          }) }, icon('upload', 15), t('vi.up')), h('div', { class: 'hint' }, t('vi.up.h'))),
          h('div', { class: 'vi-sum', id: 'vi-sum' }, t('vi.sum', pl.rows.length, pl.have, pl.none)),
          !pl.rows.length ? h('div', { class: 'empty small' }, t('vi.none')) : h('div', { class: 'vi-list' },
            h('div', { class: 'vi-row vi-hd' }, h('div', t('vc.col.block')), h('div', t('vc.col.who')), h('div', t('vc.col.text')), h('div', t('vi.col.res'))),
            ...list.map(rowEl), pl.rows.length > list.length ? h('div', { class: 'hint' }, t('vi.more', pl.rows.length - list.length)) : null),
          h('div', { class: 'vi-actions' }, h('button', { class: 'btn primary', id: 'vi-go', disabled: !pl.rows.length, onclick: () => {
            const r = viApply(pl);
            toast(t('vi.done', r.done) + (r.stale ? ' ' + t('vi.stale', r.stale) : ''), 5200);
            data = vcCollect(true); paint();
          } }, icon('check', 15), pl.rows.length ? t('vi.go', pl.rows.length) : t('vi.go', 0))));
      };
      paint();
      return h('div', { class: 'm-wrap' }, modalHead(t('vi.title'), m), body);
    }
  });
}

function openVoiceSheet() {
  closePopover();
  let data = vcCollect(VC.narr), ver = DATA_VER, poll = 0, shown = VC_PAGE;
  openModal({
    cls: 'rt-m vc-m', onClose: () => clearInterval(poll), build: m => {
      const q = h('input', { class: 'inp', type: 'text', placeholder: t('vc.q'), value: VC.q, spellcheck: 'false' });
      const strip = h('div', { class: 'vc-strip' }), stSeg = h('div'), info = h('div', { class: 'vc-info' }), sum = h('div', { class: 'rt-sum' });
      const narrChk = h('input', { type: 'checkbox', id: 'vc-narr', checked: VC.narr });
      const thead = h('thead'), tbody = h('tbody'), wrap = h('div', { class: 'rt-wrap scroll' });
      let view = [];
      const filtered = () => {
        const toks = palToks(VC.q);
        return data.items.filter(x => (!VC.grp || x.g.key === VC.grp) && (VC.st === 'all' || x.status === VC.st) && (!toks.length || toks.every(k => x.hay.includes(k))));
      };
      const curGroup = () => data.groups.find(g => g.key === VC.grp) || null;
      const paintStrip = () => {
        const chip = (key, label, n) => h('button', { class: 'chip' + (VC.grp === key ? ' on' : ''), 'data-g': key, onclick: () => { VC.grp = key; shown = VC_PAGE; paint(); } }, label, h('span', { class: 'vc-n' }, String(n)));
        strip.replaceChildren(chip('', t('vc.g.all'), data.items.length), ...data.groups.map(g => chip(g.key, g.label, g.rows.length)));
        const cnt = s => data.items.filter(x => (!VC.grp || x.g.key === VC.grp) && x.status === s).length;
        stSeg.replaceChildren(segmented([{ value: 'all', label: t('vc.st.all') }, ...VC_ST.map(s => ({ value: s, label: vcStName(s) + ' · ' + cnt(s) }))], VC.st, v => { VC.st = v; shown = VC_PAGE; paint(); }));
      };
      const paintInfo = () => {
        const g = curGroup();
        const pool = g ? [g] : data.groups, lines = pool.reduce((s, x) => s + x.rows.length, 0), words = pool.reduce((s, x) => s + x.words, 0), ready = pool.reduce((s, x) => s + x.st.ready, 0);
        const parts = [];
        if (g) parts.push(g.actor ? t('vc.actor', g.label) : t('vc.noactor'), t('vc.chars', g.chars.join(', ')));
        parts.push(t('vc.lines', lines), t('vc.words', words), t('vc.rec', arClock(Math.round(words / VC_WPS))), t('vc.done', ready, lines));
        info.textContent = parts.join(' · ');
      };
      const statusEl = x => h('span', { class: 'vc-st s-' + x.status }, vcStName(x.status));
      const fileEl = x => {
        const nm = x.file || x.sug;
        return h('button', { class: 'vc-file' + (x.file ? ' has' : ' sug'), 'data-tip': x.file ? t('vc.copy.tip') : t('vc.sug.tip') + '. ' + t('vc.copy.tip'), onclick: async () => { if (await copyText(nm)) toast(t('vc.copied')); } }, nm);
      };
      const whoEl = x => {
        const r = x.r; if (!r.who) return h('span', { class: 'rt-narr' }, t('vc.narr'));
        const c = rtChar(r.who);
        return h('span', { class: 'rt-whoc' + (c ? '' : ' unk') }, h('i', { class: 'rt-dot', style: { background: c ? 'var(--c-' + c.color + ')' : 'var(--text3)' } }), h('span', c ? (c.name || c.tag) : r.who), c ? null : h('em', ' ' + t('rt.unk1')));
      };
      const buildRow = x => {
        const r = x.r, ft = rtFileTitle(r.n, r.f);
        const blk = h('button', { class: 'rt-blk', 'data-tip': t('vc.open') + ': ' + rtBlockName(r.n, r.f), onclick: () => { m.close(); palOpenLine(r.n.id, r.f.id, r.li, r.lead); } }, h('span', { class: 'b1' }, r.n.title), ft ? h('span', { class: 'b2' }, ft) : null);
        const qq = palToks(VC.q)[0] || '';
        return h('tr', { class: 'rt-r vc-r s-' + x.status },
          h('td', { class: 'rt-c-n' }, String(x.n)),
          h('td', { class: 'rt-c-blk' }, blk, h('div', { class: 'hint' }, t('vc.col.line') + ' ' + x.line)),
          h('td', { class: 'rt-c-who' }, whoEl(x), x.g.actor ? h('div', { class: 'hint' }, x.g.label) : null),
          h('td', { class: 'vc-c-emo' }, x.emo ? h('span', { class: 'vc-emo' }, x.emo) : null),
          h('td', { class: 'rt-c-text' }, h('div', { class: 'rt-t' }, ...(qq ? markText(r.plain, qq) : [r.plain])), x.note ? h('div', { class: 'vc-note' }, x.note) : null),
          h('td', { class: 'rt-c-w' }, String(x.words)),
          h('td', { class: 'vc-c-st' }, statusEl(x)),
          h('td', { class: 'vc-c-file' }, fileEl(x)));
      };
      const paintTable = () => {
        view = filtered();
        thead.replaceChildren(h('tr', h('th', { class: 'rt-c-n' }, t('vc.col.n')), h('th', { class: 'rt-c-blk' }, t('vc.col.block')), h('th', { class: 'rt-c-who' }, t('vc.col.who')), h('th', { class: 'vc-c-emo' }, t('vc.col.emo')),
          h('th', { class: 'rt-c-text' }, t('vc.col.text')), h('th', { class: 'rt-c-w' }, t('vc.col.words')), h('th', { class: 'vc-c-st' }, t('vc.col.status')), h('th', { class: 'vc-c-file' }, t('vc.col.file'))));
        tbody.replaceChildren();
        if (!view.length) tbody.append(h('tr', h('td', { class: 'rt-empty', colspan: 8 }, data.items.length ? t('vc.none') : t('vc.empty'))));
        else {
          for (const x of view.slice(0, shown)) tbody.append(buildRow(x));
          if (view.length > shown) tbody.append(h('tr', h('td', { class: 'rt-empty', colspan: 8 }, h('button', { class: 'btn sm', id: 'vc-more', onclick: () => { shown += VC_PAGE; paintTable(); } }, t('vc.more') + ' (' + (view.length - shown) + ')'))));
        }
        sum.textContent = t('vc.sum', fmtNum(view.length), fmtNum(data.items.length));
      };
      const paint = () => { if (VC.grp && !curGroup()) VC.grp = ''; paintStrip(); paintInfo(); paintTable(); };
      q.addEventListener('input', () => { VC.q = q.value; shown = VC_PAGE; paintTable(); });
      narrChk.addEventListener('change', () => { VC.narr = narrChk.checked; data = vcCollect(VC.narr); shown = VC_PAGE; paint(); });
      const exportBtn = h('button', { class: 'btn sm', id: 'vc-export', onclick: ev => {
        const g = curGroup();
        const pick = () => data.groups.map(x => Object.assign({}, x, { rows: x.rows.filter(y => VC.st === 'all' || y.status === VC.st) })).filter(x => x.rows.length);
        menuAt(ev.currentTarget, [
          { label: t('vc.exp.xlsx'), icon: 'download', onClick: () => { const gs = pick(); vcExportXlsx(gs).then(ok => ok && toast(t('vc.exp.done', gs.reduce((s, x) => s + x.rows.length, 0)))); } },
          g ? { label: t('vc.exp.one', g.label), icon: 'download', onClick: () => { const gs = pick().filter(x => x.key === g.key); vcExportXlsx(gs, g.label).then(ok => ok && toast(t('vc.exp.done', gs.reduce((s, x) => s + x.rows.length, 0)))); } } : null,
          { label: t('vc.exp.csv'), icon: 'download', onClick: () => { vcExportCsv(view, VC.grp ? (curGroup() || {}).label : '').then(ok => ok && toast(t('vc.exp.done', view.length))); } },
        ].filter(Boolean));
      } }, icon('download', 15), h('span', t('vc.export')));
      const insBtn = h('button', { class: 'btn sm', id: 'vc-ins', 'data-tip': t('vi.title'), onclick: () => openVoiceInsert() }, icon('mic', 15), h('span', t('vi.btn')));
      wrap.append(h('table', { class: 'rt vc-t' }, thead, tbody));
      wrap.addEventListener('scroll', () => { if (view.length > shown && wrap.scrollTop + wrap.clientHeight > wrap.scrollHeight - 500) { shown += VC_PAGE; paintTable(); } });
      paint();
      poll = setInterval(() => { if (m.closed || DATA_VER === ver) return; ver = DATA_VER; data = vcCollect(VC.narr); paint(); }, 900);   // скрипт или реестр изменили снаружи
      return h('div', { class: 'm-wrap rt-wrapall' },
        modalHead(t('vc.title'), m),
        h('div', { class: 'm-pad bs-sph' }, t('vc.intro')),
        h('div', { class: 'm-pad rt-bar' }, q, stSeg, h('label', { class: 'ar-chk', 'data-tip': t('vc.o.narr.h') }, narrChk, h('span', t('vc.o.narr'))), insBtn, exportBtn),
        h('div', { class: 'm-pad vc-top' }, strip, info),
        wrap, h('div', { class: 'rt-foot' }, sum, h('span', { class: 'hint vc-foot' }, t('vc.foot'))));
    }
  });
}

TOOL_ITEMS.push({ id: 'voicesheet', group: 'story', ic: 'mic', key: 'vc.btn', kw: 'insert voice lines scripts upload recordings вставить строки voice озвучка записи в скрипт voice over sheet actor actors recording record script voice acting studio emotions lines озвучка лист для озвучки актёр актёры запись реплики эмоции студия диктор', run: () => openVoiceSheet() });

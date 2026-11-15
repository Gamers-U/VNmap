'use strict';
/* ====== Редактор-документ: рассказ пишется как в Word, по одной ветке ======
   Один документ — одна ветка карты (см. branches.js): цепочка блоков, идущих друг за другом по стрелкам. Каждый блок (глава) в документе —
   раздел под «Заголовком 1», а ниже идёт текст главы (f.text). Развилки, у которых есть боковые ветки, ведут в соседние документы.
   Абзацы бывают разных стилей: Обычный текст, Название, Заголовок 1 (глава = блок карты), Заголовок 2 (сцена), Заголовок 3, Заметка автору,
   Команда Ren'Py и Развилка. Всё это в проекте остаётся обычным текстом рукописи (prose.js): стиль — это просто разметка строки.
   Правка документа сразу попадает в проект:
     • печатаешь в разделе → меняется текст этой главы (и сценарий, если включена синхронизация);
     • переименовываешь «Заголовок 1» → переименовывается блок на карте;
     • новый «Заголовок 1» → новый блок (или новая глава внутри блока), вставленный в цепочку между соседями;
     • убираешь заголовок → главу уносит в предыдущую; пустой блок без сценария исчезает с карты, остальные остаются (всё можно отменить).
   Если в блоке уже есть сценарий, а текста нет, редактор предлагает «подхватить» реплики из сценария в текст. */

Object.assign(D, {
  'de.mode.doc': ['Документ', 'Document'], 'de.mode.ch': ['По главам', 'By chapters'],
  'de.mode.tip': ['Переключить вид редактора: документ-ветка или одна глава за раз', 'Switch the editor view: whole branch or one chapter at a time'],
  'de.branches': ['Ветки', 'Branches'], 'de.outline': ['Оглавление', 'Outline'],
  'de.search': ['Найти ветку, главу или слово…', 'Find a branch, chapter or word…'],
  'de.nomatch': ['Ничего не найдено', 'Nothing found'],
  'de.none': ['В проекте пока нет блоков с текстом. Создайте блок на карте.', 'No blocks yet. Create a block on the map.'],
  'de.tab.new': ['Открыть ещё ветку во вкладке', 'Open another branch in a tab'],
  'de.tab.close': ['Закрыть вкладку', 'Close tab'],
  'de.words.n': ['{0} сл.', '{0} w.'],
  'de.main.tip': ['Основная ветка', 'Main branch'],
  'de.color.tip': ['Цвет блока, в котором стоит курсор', 'Color of the block the cursor is in'],
  'de.k.p': ['Обычный текст', 'Normal text'], 'de.k.title': ['Название', 'Title'], 'de.k.h1': ['Заголовок 1 · блок', 'Heading 1 · block'],
  'de.k.h2': ['Заголовок 2 · глава (файл)', 'Heading 2 · chapter (file)'], 'de.k.h3': ['Заголовок 3 · сцена', 'Heading 3 · scene'],
  'de.k.note': ['Заметка автору', 'Note to self'], 'de.k.cmd': ['Команда Ren’Py', 'Ren’Py command'], 'de.k.fork': ['Развилка', 'Fork'],
  'de.k.h1.d': ['Новый блок на карте', 'A new block on the map'],
  'de.k.h2.d': ['Новая глава: файл внутри блока', 'A new chapter: a file inside the block'],
  'de.k.title.d': ['Название книги или части, в сценарий не попадает', 'Book or part title, not in the script'],
  'de.k.note.d': ['Для себя: не попадает в сценарий и слова', 'For yourself: not in the script or word count'],
  'de.k.cmd.d': ['Строка Ren’Py как есть', 'A Ren’Py line as is'],
  'de.k.fork.d': ['Интерактивная пометка: ветки блока', 'Interactive mark: the block’s branches'],
  'de.style': ['Стиль абзаца (Ctrl+Alt+0…3)', 'Paragraph style (Ctrl+Alt+0…3)'],
  'de.tb.b': ['Жирный (Ctrl+B)', 'Bold (Ctrl+B)'], 'de.tb.i': ['Курсив (Ctrl+I)', 'Italic (Ctrl+I)'],
  'de.tb.who': ['Реплика: выбрать говорящего', 'Speech: pick the speaker'],
  'de.tb.cmd': ['Команда сцены', 'Scene command'],
  'de.tb.fork': ['Развилка', 'Fork'], 'de.tb.note': ['Заметка', 'Note'],
  'de.tb.chap': ['Глава', 'Chapter'], 'de.tb.chap.tip': ['Сделать этот абзац заголовком новой главы (новый блок на карте)', 'Make this paragraph the heading of a new chapter (a new block on the map)'],
  'de.opts': ['Правила разбора текста', 'Parsing rules'],
  'de.pane.l': ['Оглавление и ветки: скрыть', 'Branches and outline: hide'], 'de.pane.l.show': ['Показать оглавление и ветки', 'Show branches and outline'],
  'de.pane.r': ['Сценарий главы: скрыть', 'Chapter script: hide'], 'de.pane.r.show': ['Показать сценарий главы', 'Show the chapter script'],
  'de.explain.h': ['Что это за панель?', 'What is this panel?'],
  'de.explain.1': ['Слева вы пишете обычный текст. Здесь видно, во что он превратится в игре: готовые строки сценария Ren\'Py (кто что говорит). Редактировать их тут не нужно.', 'You write plain text on the left. Here you see what it turns into in the game: ready Ren\'Py script lines (who says what). You do not have to edit them here.'],
  'de.explain.2': ['«Применить к сценарию» один раз превращает текст главы в строки сценария: заменяет сценарий или дописывает в конец.', '“Apply to script” turns the chapter text into script lines once: it replaces the script or appends to its end.'],
  'de.explain.3': ['«Держать сценарий в синхроне с текстом» делает то же самое само при каждой правке. Пока переключатель включён, править сценарий вручную не стоит: правки пропадут.', '“Keep the script in sync with the text” does the same by itself after every edit. While the switch is on do not edit the script by hand: the edits would be lost.'],
  'de.explain.4': ['Сценарий пока не нужен? Скройте панель кнопкой справа вверху, текст займёт всё окно.', 'Do not need the script yet? Hide the panel with the button at the top right and the text takes the whole window.'],
  'de.explain.more': ['Подробнее в справке', 'More in the help'],
  'de.help': ['Как пользоваться редактором (справка)', 'How to use the editor (help)'],
  'de.zoom.in': ['Крупнее (Ctrl и +, Ctrl и колесо мыши)', 'Zoom in (Ctrl and +, Ctrl and mouse wheel)'],
  'de.zoom.out': ['Мельче (Ctrl и −, Ctrl и колесо мыши)', 'Zoom out (Ctrl and −, Ctrl and mouse wheel)'],
  'de.zoom.reset': ['Масштаб текста. Нажмите, чтобы вернуть 100% (Ctrl и 0)', 'Text zoom. Click to return to 100% (Ctrl and 0)'],
  'de.zoom.toast': ['Масштаб текста: {0}%', 'Text zoom: {0}%'],
  'de.focus': ['Режим письма: только текст', 'Writing mode: text only'], 'de.focus.off': ['Вернуть панели', 'Bring back the panels'],
  'de.c.chap': ['Глава «{0}»', 'Chapter “{0}”'],
  'de.where': ['Блок «{0}»', 'Block “{0}”'],
  'de.sec.t': ['Эта глава', 'This chapter'],
  'de.sec.map': ['Блок на карте', 'Block on the map'],
  'de.sc.none': ['Сценария нет', 'No script yet'],
  'de.sc.ours': ['Сценарий собран из текста', 'The script is built from the text'],
  'de.sc.manual': ['Сценарий написан или изменён вручную', 'The script was written or edited by hand'],
  'de.sc.live': ['Сценарий ведётся из текста', 'The script follows the text'],
  'de.hint.fork': [['Из блока выходит {0} стрелка, а пометки «развилка» в тексте нет.', 'Из блока выходит {0} стрелки, а пометки «развилка» в тексте нет.', 'Из блока выходит {0} стрелок, а пометки «развилка» в тексте нет.'], ['{0} arrow leaves this block but the text has no fork mark.', '{0} arrows leave this block but the text has no fork mark.']],
  'de.hint.fork.add': ['Вставить пометку в конец главы', 'Add a mark at the end of the chapter'],
  'de.pick.one': ['В блоке «{0}» есть сценарий ({1}), а текста нет. Подхватить реплики из сценария в текст?', 'Block “{0}” has a script ({1}) but no text. Pick the lines up from the script into the text?'],
  'de.pick.many': ['В {0} главах этой ветки есть сценарий без текста. Подхватить его в текст?', '{0} chapters of this branch have a script but no text. Pick it up into the text?'],
  'de.pick.lines': [['{0} реплика', '{0} реплики', '{0} реплик'], ['{0} line', '{0} lines']],
  'de.pick.btn': ['Подхватить в текст', 'Pick up into the text'], 'de.pick.all': ['Подхватить везде', 'Pick up everywhere'],
  'de.pick.show': ['Показать', 'Show'], 'de.pick.hide': ['Не сейчас', 'Not now'],
  'de.pick.done': ['Текст подхвачен из сценария: строк {0}', 'Text picked up from the script: {0} lines'],
  'de.pick.same': ['Сценарий при этом не изменится.', 'The script stays as it is.'],
  'de.pick.diff': ['Часть строк сценария осталась командами «@».', 'Some script lines stay as “@” commands.'],
  'de.pick.fail': ['В сценарии нечего подхватывать', 'Nothing to pick up in the script'],
  'de.conn.q': ['Подключить блок «{0}»?', 'Connect block “{0}”?'],
  'de.conn.d': ['На карте уже есть блок с таким названием, но он никуда не ведёт. Можно подключить его сюда, тогда в документе появится его текст, а если текста нет — предложение подхватить сценарий. Или создать новый блок.', 'The map already has a block with this name that nothing leads to. You can connect it here: its text appears in the document, or, if there is none, you are offered to pick up its script. Or create a new block.'],
  'de.conn.ok': ['Подключить существующий', 'Connect the existing one'], 'de.conn.new': ['Создать новый', 'Create a new one'],
  'de.created': ['Создан блок «{0}»', 'Block “{0}” created'],
  'de.created.f': ['Добавлена глава «{0}» в блок «{1}»', 'Chapter “{0}” added to block “{1}”'],
  'de.connected': ['Блок «{0}» подключён к ветке', 'Block “{0}” connected to the branch'],
  'de.removed': ['Глава «{0}» объединена с предыдущей, блок убран с карты', 'Chapter “{0}” merged into the previous one, the block was removed from the map'],
  'de.kept': ['Блок «{0}» остался на карте: в нём есть сценарий или другие данные. Его текст перешёл в соседнюю главу.', 'Block “{0}” stays on the map: it has a script or other data. Its text moved to the neighbouring chapter.'],
  'de.order': ['Порядок глав задаёт карта: в тексте их переставлять нельзя, они вернулись на места.', 'The map sets the chapter order: they cannot be reordered in the text and went back.'],
  'de.allgone': ['Нельзя убрать все главы: каждая из них — блок карты. Заголовки восстановлены.', 'You cannot remove all chapters: each is a block on the map. The headings were restored.'],
  'de.pasted': ['Вставлено с форматированием. Ctrl+Shift+V вставит простой текст.', 'Pasted with formatting. Ctrl+Shift+V pastes plain text.'],
  'de.fork.t': ['Развилка', 'Fork'], 'de.fork.in': ['в блоке «{0}»', 'in block “{0}”'],
  'de.fork.main': ['основная', 'main'], 'de.fork.setmain': ['Сделать основной', 'Make main'],
  'de.fork.here': ['Продолжение ниже по документу', 'Continues further down this document'],
  'de.fork.goto': ['Перейти', 'Go'], 'de.fork.open': ['Открыть ветку', 'Open branch'],
  'de.fork.add': ['Добавить ветку', 'Add a branch'], 'de.fork.add.q': ['Новая ветка', 'New branch'], 'de.fork.add.l': ['Название ветки (и блока)', 'Branch (and block) name'],
  'de.fork.add.ok': ['Создать', 'Create'], 'de.fork.added': ['Ветка «{0}» создана', 'Branch “{0}” created'],
  'de.fork.setmain.done': ['Теперь основная ветка идёт через «{0}»', 'The main branch now goes through “{0}”'],
  'de.fork.joins': ['вливается в «{0}»', 'joins “{0}”'],
  'de.fork.none': ['Из этого блока не выходит ни одной стрелки. Добавьте ветку кнопкой ниже или проведите стрелки на карте.', 'No arrows leave this block. Add a branch below or draw arrows on the map.'],
  'de.fork.map': ['Показать на карте', 'Show on map'], 'de.fork.close': ['Скрыть', 'Hide'],
  'de.fork.note': ['Пометка в тексте', 'Mark in the text'],
  'de.pv.empty': ['Здесь появится сценарий выбранной главы, как только в ней будет хотя бы одна строка.', 'The script of the chosen chapter appears here as soon as it has a line.'],
  'de.hl.sel': ['Сначала выделите текст', 'Select some text first'],
  'de.empty.ph': ['Пишите здесь…', 'Write here…'],
  'de.multi.q': [['Убрать {0} главу из документа?', 'Убрать {0} главы из документа?', 'Убрать {0} глав из документа?'], ['Remove {0} chapter from the document?', 'Remove {0} chapters from the document?']],
  'de.multi.d': ['Вы стёрли заголовки сразу нескольких глав. Если продолжить, пустые блоки без сценария исчезнут с карты, а блоки со сценарием останутся. Если отказаться, всё вернётся как было.', 'You erased the headings of several chapters at once. If you continue, empty blocks without a script disappear from the map and blocks with a script stay. If you decline, everything goes back.'],
  'de.multi.ok': ['Убрать', 'Remove'],
  'de.pasteht': ['Заголовки вставлены как «Заголовок 2». Для разбивки на главы есть «Импорт».', 'Headings were pasted as “Heading 2”. Use “Import” to split into chapters.'],
});

/* ================= чистые функции: текст ↔ документ ================= */
const DE_KINDS = ['p', 'title', 'h2', 'h3', 'note', 'cmd', 'fork'];
const deEsc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Текст для сравнения: без \r и пробелов на конце. */
const deNorm = s => String(s || '').replace(/\r/g, '').replace(/\s+$/, '');
const deTitleOf = (n, f) => n.files.length > 1 ? (f.title || n.title) : n.title;
const deIsHead = el => !!el && (el.tagName === 'H1' || el.tagName === 'H2');
/** Название файла, которое ничего не говорит (пусто, «Новая глава 2»): с таким названием первый файл блока сливается с заголовком блока. */
const deIsGen = s => pullIsGenKey(pullKey(s));
/** Заголовки блока в документе. «Заголовок 1» — это сам блок, а каждый файл (глава) идёт под своим «Заголовком 2». Если у первого файла нет собственного названия
    (пусто, «Новая глава» или как у блока), он сливается с заголовком блока: тогда «Заголовок 1» несёт и его текст — так выглядит обычный блок из одного файла. */
function deHeads(n) {
  const fs = n.files;
  if (!fs.length) return [];
  const f1 = fs[0], merged = deIsGen(f1.title) || deNameKey(f1.title) === deNameKey(n.title);
  const out = [merged ? { lv: 1, f: f1, title: n.title } : { lv: 1, f: null, title: n.title }];
  fs.forEach((f, i) => { if (i === 0 && merged) return; out.push({ lv: 2, f, title: f.title || (t('file.new') + ' ' + (i + 1)) }); });
  return out;
}

/** Строка рукописи с разметкой **жирный**, *курсив*, ==выделение== → HTML абзаца. */
function deInline(md) {
  let s = deEsc(md);
  s = s.replace(PR_HL_RE, (m, c, x) => `<mark class="hl-${prHlColor(c)}">${x}</mark>`);
  s = s.replace(/\*\*(?=[^\s*])([^*\n]+?)(?<=[^\s*])\*\*/g, '<b>$1</b>');
  s = s.replace(/(?<!\*)\*(?=[^\s*])([^*\n]+?)(?<=[^\s*])\*(?!\*)/g, '<i>$1</i>');
  return s;
}
/** Строка рукописи → { k: вид абзаца, html }. */
function deLine(line) {
  const l = String(line).replace(/\r/g, '');
  let m;
  if ((m = l.match(FORK_RE))) return { k: 'fork', html: deEsc(m[1].trim()) };
  if ((m = l.match(/^\s*\/\/ ?(.*)$/))) return { k: 'note', html: deEsc(m[1]) };
  if ((m = l.match(/^\s*@ ?(.*)$/))) return { k: 'cmd', html: deEsc(m[1]) };
  if ((m = l.match(/^\s*(#{1,6})[ \t]+(.*)$/))) return { k: 'h3', lv: m[1].length, html: deInline(m[2]) };   // строка «## Сцена» внутри текста: это «Заголовок 3», уровень решёток запоминаем
  if ((m = l.match(/^\s*%[ \t]+(.*)$/))) return { k: 'title', html: deInline(m[1]) };
  return { k: 'p', html: deInline(l) };
}
function deMake(k, html, lv) {
  const inner = html || '<br>';
  if (k === 'h3') return lv && lv !== 3 ? `<h3 data-lv="${lv}">${inner}</h3>` : `<h3>${inner}</h3>`;
  if (k === 'h2') return `<h2>${inner}</h2>`;
  return `<p${k === 'p' ? '' : ` data-k="${k}" class="de-${k}"`}>${inner}</p>`;
}
/** Текст главы → HTML её абзацев (пустая глава — один пустой абзац, чтобы было куда ставить курсор). */
function deBodyHtml(text) {
  const t0 = deNorm(text);
  if (!t0) return deMake('p', '');
  return t0.split('\n').map(l => { const r = deLine(l); return deMake(r.k, r.html, r.lv); }).join('');
}
/** Заголовок раздела (и текст файла под ним). У заголовка блока без своего файла вместо data-f стоит data-nh. */
function deHeadHtml(n, hd) {
  const tg = hd.lv === 1 ? 'h1' : 'h2', at = hd.f ? `data-f="${hd.f.id}"` : `data-nh="${n.id}"`;
  return `<${tg} ${at} data-n="${n.id}" style="--bc:${palColor(n.color)}">${deEsc(hd.title)}</${tg}>${hd.f ? deBodyHtml(hd.f.text) : ''}`;
}
const deNodeHtml = n => deHeads(n).map(hd => deHeadHtml(n, hd)).join('');
/** Вид абзаца по элементу. */
function deKind(el) {
  const tg = el.tagName;
  if (tg === 'H1') return 'h1'; if (tg === 'H2') return 'h2'; if (/^H[3-6]$/.test(tg)) return 'h3';
  return DE_KINDS.includes(el.dataset && el.dataset.k) ? el.dataset.k : 'p';
}
/** Текст элемента как есть (без разметки). */
const deRaw = el => String(el.textContent || '').replace(/[​﻿]/g, '').replace(/ /g, ' ').replace(/\n/g, ' ');
/** Запуски текста внутри элемента: [{ t, b, i, hl }]. */
function deRuns(node) {
  const runs = [];
  const walk = (n, st) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { const v = c.nodeValue.replace(/[​﻿]/g, '').replace(/ /g, ' ').replace(/\n/g, ' '); if (v) runs.push({ t: v, b: st.b, i: st.i, hl: st.hl }); continue; }
      if (c.nodeType !== 1) continue;
      const tg = c.tagName;
      if (tg === 'BR') { if (c.nextSibling) runs.push({ t: ' ', b: st.b, i: st.i, hl: st.hl }); continue; }
      const s2 = { b: st.b, i: st.i, hl: st.hl };
      if (tg === 'B' || tg === 'STRONG') s2.b = true;
      if (tg === 'I' || tg === 'EM') s2.i = true;
      if (tg === 'MARK') s2.hl = ((c.getAttribute('class') || '').match(/hl-([a-z]+)/) || [])[1] || 'yellow';
      walk(c, s2);
    }
  };
  walk(node, { b: false, i: false, hl: '' });
  return runs;
}
/** Запуски → строка с **, * и ==…==. Пробелы по краям остаются снаружи разметки. */
function deRunsMd(runs) {
  const segs = [];
  for (const r of runs) {
    const last = segs[segs.length - 1];
    if (last && last.b === r.b && last.i === r.i && last.hl === r.hl) last.t += r.t; else segs.push({ t: r.t, b: r.b, i: r.i, hl: r.hl });
  }
  const fmt = sg => {
    const m = sg.t.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m[2] || (!sg.b && !sg.i)) return sg.t;
    const mark = sg.b && sg.i ? '***' : sg.b ? '**' : '*';
    return m[1] + mark + m[2] + mark + m[3];
  };
  let out = '';
  for (let k = 0; k < segs.length;) {
    let j = k; while (j < segs.length && segs[j].hl === segs[k].hl) j++;
    const inner = segs.slice(k, j).map(fmt).join(''), hl = segs[k].hl;
    if (hl) { const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/); out += m[2] ? m[1] + (hl === 'yellow' ? '==' : '=={' + hl + '}') + m[2] + '==' + m[3] : inner; }
    else out += inner;
    k = j;
  }
  return diTidy(out);
}
const deInlineMd = el => deRunsMd(deRuns(el));
/** Абзац документа → строка рукописи. */
function deBlockMd(el) {
  const k = deKind(el);
  if (k === 'cmd') return '@ ' + deRaw(el);
  if (k === 'note') { const x = deRaw(el); return x ? '// ' + x : '//'; }
  if (k === 'fork') { const x = deRaw(el).trim(); return x ? '// развилка: ' + x : '// развилка:'; }
  const s = deInlineMd(el);
  if (k === 'h2') return '## ' + s;
  if (k === 'h3') return '#'.repeat(Math.min(6, Math.max(1, +(el.dataset && el.dataset.lv) || 3))) + ' ' + s;
  if (k === 'title') return '% ' + s;
  return s;
}
const deBlocksMd = blocks => deNorm(blocks.map(deBlockMd).join('\n'));
/** Корень документа → разделы. pending: заголовки без привязки к блоку считать обычными абзацами. Абзацы до первого заголовка присоединяются к первому разделу. */
function deRead(root, pending) {
  const secs = [], pre = []; let cur = null;
  for (const el of root.children) {
    if (deIsHead(el) && (el.dataset.f || el.dataset.nh || !pending)) {
      cur = { el, lv: el.tagName === 'H1' ? 1 : 2, fid: el.dataset.f || '', nid: el.dataset.n || el.dataset.nh || '', nh: !el.dataset.f && !!el.dataset.nh, title: deRaw(el).trim(), blocks: [] };
      secs.push(cur);
    } else (cur ? cur.blocks : pre).push(el);
  }
  if (pre.length && secs[0]) secs[0].blocks = pre.concat(secs[0].blocks);
  // у заголовка блока своего файла нет: абзацы под ним (до первой главы) принадлежат первому файлу блока, то есть следующему разделу
  secs.forEach((s, i) => { if (!s.nh || !s.blocks.length) return; if (secs[i + 1] && !secs[i + 1].nh) secs[i + 1].blocks = s.blocks.concat(secs[i + 1].blocks); s.blocks = []; });
  return { secs, pre };
}
const deSig = secs => secs.map(s => s.nh ? 'n:' + s.nid : (s.fid || '+')).join(',');

/* ---------- цепочка блоков: вставка и удаление ---------- */
const deOuts = n => P.edges.filter(e => e.from === n.id && e.to !== n.id && nodeById(e.to) && nodeById(e.to).type !== 'note');
/** Вставить блок nn в цепочку сразу после блока pn: главная стрелка pn теперь ведёт в nn, а из nn идёт новая стрелка туда, куда вела главная. */
function deChainAfter(pn, nn) {
  const o = deOuts(pn), m = o.find(e => e.main) || o[0] || null;
  if (m) {
    const to = m.to;
    m.to = nn.id; m.pts = []; m.lo = null;
    const e2 = addEdge(nn.id, to); if (e2 && m.main) e2.main = true;
  } else addEdge(pn.id, nn.id);
}
/** Вставить блок nn в начало ветки перед блоком fn: все стрелки в fn теперь ведут в nn, а nn ведёт в fn. */
function deChainBefore(fn, nn) {
  P.edges.forEach(e => { if (e.to === fn.id && e.from !== nn.id && e.from !== fn.id) { e.to = nn.id; e.pts = []; e.lo = null; } });
  const e2 = addEdge(nn.id, fn.id); if (e2) e2.main = true;
  if (P.startId === fn.id) P.startId = nn.id;
}
const deFilePristine = f => !String(f.script || '').trim() && !String(f.summary || '').trim() && !String(f.notes || '').trim() && !String(f.visual || '').trim() && !String(f.location || '').trim() && !(f.assets || []).length;
/** Можно ли без потерь убрать блок (в нём нет ничего, кроме текста, который уже перенесён). */
function deNodePristine(n) {
  return n.type === 'chapter' && n.files.length === 1 && deFilePristine(n.files[0]) && !String(n.desc || '').trim() && !n.unlock && deOuts(n).length <= 1;
}
/** Убрать блок из цепочки: входящие стрелки переходят на то, куда он вёл сам. */
function deRemoveNode(n) {
  const o = deOuts(n)[0] || null;
  const next = o ? o.to : '';
  for (const e of [...P.edges]) {
    if (e.to !== n.id || e.from === n.id) continue;
    if (!next || e.from === next || P.edges.some(x => x !== e && x.from === e.from && x.to === next)) { P.edges = P.edges.filter(x => x !== e); continue; }
    e.to = next; e.pts = []; e.lo = null;
  }
  if (P.startId === n.id) P.startId = next;
  deleteNodes([n.id]);
}
const deNameKey = s => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();

/* ---------- выделение и курсор ---------- */
function deSetCaret(el, off) {
  const r = document.createRange(); let left = off, placed = false;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (left <= n.nodeValue.length) { r.setStart(n, left); placed = true; break; } left -= n.nodeValue.length; }
  if (!placed) { r.selectNodeContents(el); r.collapse(false); } else r.collapse(true);
  const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
}

/* ================= окно ================= */

/** Окно редактора-документа. opts: { fileId } — открыть ветку с этой главой и встать на неё; { nodeId } — ветку с этим блоком. */
function openDocEditor(opts = {}) {
  closePopover();
  MODALS.filter(x => x.tag === 'texted').forEach(x => x.close());
  const store = teStore();
  let list = brBranches();
  const idOf = nid => { const b = nid ? brOfNode(nid, list) : null; return b ? b.id : ''; };
  let docs = [], on = '', focusF = '';
  const addDoc = nid => { const id = idOf(nid); if (id && !docs.includes(id)) docs.push(id); return id; };
  (store.docs || []).forEach(addDoc);
  on = idOf(store.doc);
  const ff = opts.fileId && findFile(opts.fileId);
  const wantNode = ff ? ff.node.id : opts.nodeId && nodeById(opts.nodeId) ? opts.nodeId : '';
  if (wantNode) { const id = addDoc(wantNode); if (id) { on = id; focusF = ff ? ff.file.id : ''; } }
  if (!docs.length && list[0]) { docs = [list[0].id]; on = list[0].id; }
  if (!docs.includes(on)) on = docs[0] || '';

  let seen = DATA_VER, timer = 0, idleT = 0, pvT = 0, selT = 0, posT = 0, lastTouch = 0, busy = false, titlesDirty = false;
  let listQ = '', pvMode = 'rows', forkEl = null;
  const dismissed = new Set();
  const view = { fids: [], h1s: [], sig: '' };
  const persist = () => { const s = teStore(); s.docs = docs.slice(); s.doc = on; teSaveTabs(); };
  const fixDocs = () => {
    const seenIds = new Set(); const next = [];
    for (const id of docs) { const nid = idOf(id); if (nid && !seenIds.has(nid)) { seenIds.add(nid); next.push(nid); } }
    docs = next; on = idOf(on) || docs[0] || (list[0] ? list[0].id : '');
    if (on && !docs.includes(on)) docs.push(on);
  };
  let flushNow = () => {}, savePosOut = () => {};
  const m = openModal({
    cls: 'te-m de-m', dismiss: false, onClose: () => { clearInterval(timer); clearTimeout(idleT); clearTimeout(pvT); clearTimeout(selT); try { savePosOut(); } catch (e) { /* место не запомнилось: не страшно */ } try { flushNow(); } catch (e) { /* закрываем всё равно */ } persist(); },
    build: m => {
      m.tag = 'texted';
      const wrap = h('div', { class: 'm-wrap te-wrap de-wrap' });
      const tabBar = h('div', { class: 'te-tabs' });
      const left = h('div', { class: 'te-left de-left' }), mid = h('div', { class: 'te-mid' }), right = h('div', { class: 'te-right' });
      const brBox = h('div', { class: 'de-brs scroll' }), olBox = h('div', { class: 'de-ol scroll' });
      const search = h('input', { class: 'inp', id: 'de-q', placeholder: t('de.search') });
      const info = h('div', { class: 'te-info' }), banners = h('div', { class: 'de-banners' });
      const tb = h('div', { class: 'te-tb de-tb' });
      const root = h('div', { class: 'de-root', id: 'de-root', contenteditable: 'true', spellcheck: 'true', role: 'textbox', 'aria-multiline': 'true' });
      if (typeof aclOn === 'function' && aclOn() && !aclCan('text')) root.setAttribute('contenteditable', 'false');      // права доступа: только чтение
      root.style.setProperty('--lab-note', JSON.stringify(t('de.k.note')));
      root.style.setProperty('--lab-fork', JSON.stringify(t('de.k.fork')));
      root.style.setProperty('--lab-cmd', JSON.stringify('@'));
      root.style.setProperty('--lab-title', JSON.stringify(t('de.k.title')));
      const ed = h('div', { class: 'te-ed de-ed' }, h('div', { class: 'de-page' }, root));
      const dock = h('div', { class: 'te-fork', hidden: true });
      const endBar = h('div', { class: 'de-end', id: 'de-end', hidden: true });
      const secCard = h('div', { class: 'de-sec' }), pvHead = h('div', { class: 'te-pvh' }), pvBody = h('div', { class: 'te-pvb scroll' });
      const foot = h('div', { class: 'm-foot te-foot' });
      const stat = h('div', { class: 'te-stat' }), saved = h('span', { class: 'te-saved' }, t('te.saved'));
      const stat2 = h('div', { class: 'te-pvs' });
      /* левая (оглавление) и правая (сценарий) панели прячутся по отдельности; положение запоминается */
      /** Цвет блока, в котором стоит курсор: из тулбара и из карточки раздела. */
      const colBtn = h('button', { class: 'btn icon sm de-colbtn', id: 'de-color', onmousedown: ev => ev.preventDefault(), onclick: ev => pickColor(ev.currentTarget) }, icon('palette', 16), h('span', { class: 'de-cdot' }));
      const pickColor = anchor => {
        const r = cur(); if (!r) return;
        const id = r.n.id;
        popover(anchor, swatchRow(r.n.color, c => {
          closePopover(); setNodesColor([id], c);
          root.querySelectorAll('[data-n]').forEach(x => { if (x.dataset.n === id) x.style.setProperty('--bc', palColor(c)); });
          seen = DATA_VER; paintAll();
        }));
      };
      const hideL = h('button', { class: 'btn icon sm', id: 'de-hide-l', onclick: () => setPane('l', !S.teNoL) }, icon('list', 16));
      const hideR = h('button', { class: 'btn icon sm', id: 'de-hide-r', onclick: () => setPane('r', !S.teNoR) }, icon('code', 16));
      const railL = h('button', { class: 'te-rail l', id: 'de-rail-l', onclick: () => setPane('l', false) }, icon('chevR', 14));
      const railR = h('button', { class: 'te-rail r', id: 'de-rail-r', onclick: () => setPane('r', false) }, icon('chevL', 14));
      function setPane(side, off, quiet) {
        if (side === 'l') S.teNoL = !!off; else S.teNoR = !!off;
        m.card.classList.toggle('te-nol', !!S.teNoL); m.card.classList.toggle('te-nor', !!S.teNoR);
        m.card.classList.toggle('te-focus', !!(S.teNoL && S.teNoR));
        hideL.classList.toggle('on', !!S.teNoL); hideR.classList.toggle('on', !!S.teNoR);
        hideL.dataset.tip = t(S.teNoL ? 'de.pane.l.show' : 'de.pane.l'); hideR.dataset.tip = t(S.teNoR ? 'de.pane.r.show' : 'de.pane.r');
        railL.dataset.tip = t('de.pane.l.show'); railR.dataset.tip = t('de.pane.r.show');
        const fb = m.card.querySelector('#de-focus'); if (fb) { const f2 = !!(S.teNoL && S.teNoR); fb.classList.toggle('on', f2); fb.dataset.tip = t(f2 ? 'de.focus.off' : 'de.focus'); }
        if (!quiet) saveSettings();
      }

      /* ---------- разбор документа ---------- */
      const blockOf = node => { let n = node && node.nodeType === 3 ? node.parentNode : node; while (n && n.parentNode !== root) n = n.parentNode; return n && n.parentNode === root ? n : null; };
      /** Заголовок раздела, которому принадлежит абзац: ближайший выше (с файлом). Под заголовком блока без файла — первая глава этого блока. */
      const h1Of = el => {
        for (let e = el; e; e = e.previousElementSibling) {
          if (!deIsHead(e)) continue;
          if (e.dataset.f) return e;
          if (e.dataset.nh) { for (let x = e.nextElementSibling; x; x = x.nextElementSibling) { if (!deIsHead(x)) continue; return x.dataset.f && x.dataset.n === e.dataset.nh ? x : null; } return null; }
        }
        return null;
      };
      /** Ближайший выше заголовок, который что-то значит для проекта: раздел с файлом или заголовок блока без файла. */
      const leadHead = el => { for (let e = el; e; e = e.previousElementSibling) if (deIsHead(e) && (e.dataset.f || e.dataset.nh)) return e; return null; };
      const HEADS_BOUND = 'h1[data-f],h2[data-f]';
      const headEls = () => [...root.querySelectorAll('h1,h2')];
      const pendSel = 'h1:not([data-f]):not([data-nh]),h2:not([data-f])';
      /* последнее выделение внутри документа: меню и кнопки отнимают у текста фокус, а команда должна сработать там, где стоял курсор */
      let lastRg = null;
      const inRoot = () => { const s = window.getSelection(); return !!(s && s.rangeCount && root.contains(s.anchorNode)); };
      const restoreSel = () => { if (inRoot() || !lastRg || !root.contains(lastRg.startContainer) || !root.contains(lastRg.endContainer)) return; const s = window.getSelection(); s.removeAllRanges(); s.addRange(lastRg); };
      const selBlock = () => {
        const s = window.getSelection();
        if (s && s.rangeCount && root.contains(s.anchorNode)) return blockOf(s.anchorNode);
        return lastRg && root.contains(lastRg.startContainer) ? blockOf(lastRg.startContainer) : null;
      };
      const cur = () => {
        const b = selBlock(); const hh = b && h1Of(b);
        const id = hh ? hh.dataset.f : view.fids[0];
        return teFind(id) || teFind(view.fids[0]);
      };
      const curBr = () => list.find(b => b.id === on) || null;

      /* ---------- приведение DOM к порядку: только абзацы p и заголовки h1–h3 ---------- */
      const BLOCKY = 'p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,blockquote,pre,table';
      const replaceBlock = (old, neu, rep) => { while (old.firstChild) neu.append(old.firstChild); old.replaceWith(neu); if (rep) rep.set(old, neu); return neu; };
      const selSave = () => {
        const s = window.getSelection(); if (!s || !s.rangeCount || !root.contains(s.anchorNode)) return null;
        const pt = (node, off) => { const b = blockOf(node); if (!b) return null; const r = document.createRange(); r.selectNodeContents(b); try { r.setEnd(node, off); } catch (e) { return null; } return { b, o: r.toString().length }; };
        return { a: pt(s.anchorNode, s.anchorOffset), f: pt(s.focusNode, s.focusOffset) };
      };
      const selRestore = (sv, rep) => {
        if (!sv || !sv.a) return;
        const loc = pt => { if (!pt) return null; let b = pt.b; while (rep && rep.has(b)) b = rep.get(b); return b && b.isConnected ? { b, o: pt.o } : null; };
        const a = loc(sv.a), f = loc(sv.f) || a; if (!a) return;
        const pos = x => { const r = document.createRange(); let left = x.o; const w = document.createTreeWalker(x.b, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (left <= n.nodeValue.length) return [n, left]; left -= n.nodeValue.length; } return [x.b, x.b.childNodes.length]; };
        const [an, ao] = pos(a), [fn, fo] = pos(f);
        const s = window.getSelection(); s.removeAllRanges(); const r = document.createRange(); r.setStart(an, ao); r.collapse(true);
        try { const c = r.comparePoint(fn, fo); if (c > 0) r.setEnd(fn, fo); else if (c < 0) r.setStart(fn, fo); } catch (e) { /* остаёмся на курсоре */ }
        s.addRange(r);
      };
      const normalize = (final) => {
        let dirty = false; const rep = new Map(); const sv = selSave();
        // 1. всё, что лежит в корне, — абзацы
        for (let guard = 0; guard < 6; guard++) {
          let again = false; let run = null;
          for (const c of [...root.childNodes]) {
            if (c.nodeType === 8) { c.remove(); dirty = true; continue; }
            const isBlock = c.nodeType === 1 && /^(P|H1|H2|H3)$/.test(c.tagName);
            if (isBlock) { run = null; continue; }
            if (c.nodeType === 1 && /^(DIV|H4|H5|H6|LI|UL|OL|BLOCKQUOTE|PRE|TABLE|TBODY|TR|TD|SECTION|ARTICLE)$/.test(c.tagName)) {
              run = null; dirty = true;
              if (c.querySelector(BLOCKY)) { c.replaceWith(...c.childNodes); again = true; }
              else { const tg = /^H[4-6]$/.test(c.tagName) ? 'h3' : 'p'; replaceBlock(c, document.createElement(tg), rep); }
              continue;
            }
            if (c.nodeType === 1 && c.tagName === 'BR' && !run && !c.previousSibling && !c.nextSibling) { const p = document.createElement('p'); c.replaceWith(p); p.append(c); continue; }
            dirty = true;
            if (!run) { run = document.createElement('p'); c.before(run); }
            run.append(c);
          }
          if (!again) break;
        }
        // 2. вложенные блоки внутри абзаца (бывает после вставки) поднимаем на уровень корня
        root.querySelectorAll('p > p, p > div, p > h1, p > h2, p > h3, h1 > p, h1 > div, h2 > p, h2 > div, h3 > p, h3 > div').forEach(x => { if (x.parentNode && x.parentNode !== root) { const par = x.parentNode; if (par.parentNode === root) { par.after(x); dirty = true; if (!par.textContent && !par.querySelector('mark,b,i')) par.remove(); } } });
        // 3. лишние обёртки и стили, которые браузер добавляет при слиянии строк
        root.querySelectorAll('span,font,u,s,strike,sub,sup,a,code,small,big,em:empty,strong:empty').forEach(x => { if (x.parentNode) { x.replaceWith(...x.childNodes); dirty = true; } });
        root.querySelectorAll('[style]').forEach(x => { if (deIsHead(x)) return; x.removeAttribute('style'); dirty = true; });
        root.querySelectorAll('p:not([data-k]),h2,h3').forEach(x => { if (x.getAttribute('class')) { x.removeAttribute('class'); dirty = true; } });
        root.querySelectorAll('p[data-k]').forEach(x => { if (!DE_KINDS.includes(x.dataset.k) || x.dataset.k === 'p') { x.removeAttribute('data-k'); x.removeAttribute('class'); dirty = true; } });
        root.querySelectorAll(pendSel).forEach(x => { x.removeAttribute('data-n'); x.removeAttribute('style'); });
        // 4. два заголовка с одной привязкой (Enter разрезал заголовок): привязку оставляем тому, у кого есть текст
        const byF = new Map();
        root.querySelectorAll('h1[data-f],h2[data-f],h1[data-nh]').forEach(x => { const k = x.dataset.f || 'n:' + x.dataset.nh; (byF.get(k) || byF.set(k, []).get(k)).push(x); });
        for (const arr of byF.values()) {
          if (arr.length < 2) continue;
          const keep = arr.find(x => deRaw(x).trim()) || arr[0];
          for (const x of arr) if (x !== keep) { const p = document.createElement('p'); x.replaceWith(p); while (x.firstChild) p.append(x.firstChild); rep.set(x, p); dirty = true; }
        }
        // 5. заголовок без привязки и без текста — просто абзац (только когда решаем окончательно)
        if (final) root.querySelectorAll(pendSel).forEach(x => { if (!deRaw(x).trim()) { replaceBlock(x, document.createElement('p'), rep); dirty = true; } });
        // 6. пустые блоки держат высоту через <br>
        for (const x of root.children) if (!x.firstChild) { x.append(document.createElement('br')); }
        if (!root.firstChild) { const p = document.createElement('p'); p.append(document.createElement('br')); root.append(p); dirty = true; }
        if (dirty) selRestore(sv, rep);
        return dirty;
      };
      /** После Enter: новая строка под заголовком — обычный текст, а не ещё один заголовок. */
      const fixEnter = () => {
        const b = selBlock(); if (!b) return;
        const k = deKind(b);
        if ((['title', 'h3', 'fork'].includes(k) || (k === 'h2' && !b.dataset.f)) && !deRaw(b).trim()) { const p = document.createElement('p'); replaceBlock(b, p); if (!p.firstChild) p.append(document.createElement('br')); const r = document.createRange(); r.setStart(p, 0); r.collapse(true); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        else if (k === 'h1' && !b.dataset.f && !b.dataset.nh && !deRaw(b).trim()) { const p = document.createElement('p'); replaceBlock(b, p); if (!p.firstChild) p.append(document.createElement('br')); deSetCaret(p, 0); }
      };

      /* ---------- отрисовка документа ---------- */
      const caretKey = () => {
        const b = selBlock(); if (!b) return null;
        const hh = h1Of(b); if (!hh || !(hh.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING || hh === b)) return null;
        let idx = 0; for (let e = b; e && e !== hh; e = e.previousElementSibling) idx++;
        const s = window.getSelection(), r = document.createRange(); r.selectNodeContents(b); try { r.setEnd(s.anchorNode, s.anchorOffset); } catch (e) { return null; }
        return { f: hh.dataset.f, idx, off: r.toString().length };
      };
      const restoreCaret = k => {
        if (!k) return;
        const hh = [...root.querySelectorAll(HEADS_BOUND)].find(x => x.dataset.f === k.f); if (!hh) return;
        let b = hh; for (let i = 0; i < k.idx && b.nextElementSibling && !deIsHead(b.nextElementSibling); i++) b = b.nextElementSibling;
        deSetCaret(b, k.off);
      };
      const snapshot = () => { view.h1s = headEls(); view.fids = view.h1s.map(x => x.dataset.f).filter(Boolean); view.sig = deSig(deRead(root, true).secs); };
      const render = (o = {}) => {
        const key = o.keep ? caretKey() : null, sc = ed.scrollTop;
        list = brBranches(); fixDocs();
        const br = curBr();
        if (!br) { root.innerHTML = deMake('p', ''); snapshot(); paintAll(); return; }
        root.innerHTML = br.nodes.map(deNodeHtml).join('');
        snapshot();
        if (o.keep) { restoreCaret(key); ed.scrollTop = sc; }
        paintAll();
      };

      /* ---------- запись в проект ---------- */
      /** Новое название блока (у первого файла название такое же — оно переименовывается вместе с блоком). */
      const writeNodeTitle = (n, title) => {
        if (!n || !title || title === n.title) return false;
        const old = n.title; n.title = title;
        const f1 = n.files[0];
        if (f1 && n.files.length > 1 && f1.title && deNameKey(f1.title) === deNameKey(old)) f1.title = title;
        titlesDirty = true; return true;
      };
      /** Один раздел: текст главы и её название (у «Заголовка 1» — название блока). Возвращает true, если что-то изменилось. */
      const writeSec = (s, extra) => {
        if (s.nh) return writeNodeTitle(nodeById(s.nid), s.title);
        const r = teFind(s.fid); if (!r) return false;
        let ch = false;
        const md = deBlocksMd(s.blocks);
        if (md !== deNorm(r.f.text)) { r.f.text = md; prSync(r.n, r.f); ch = true; }
        const hd = s.title && deHeads(r.n).find(x => x.f === r.f);
        if (hd && s.title !== hd.title) {
          if (hd.lv === 2) { r.f.title = s.title; titlesDirty = true; ch = true; } else if (writeNodeTitle(r.n, s.title)) ch = true;
        }
        return ch;
      };
      /** Лёгкая запись при каждом нажатии: только раздел, где стоит курсор. */
      const lightSync = () => {
        const b = selBlock(); if (!b) return false;
        const hh = leadHead(b); if (!hh) return false;
        if (headEls().length !== view.h1s.length) return false;
        if (hh.dataset.nh && !hh.dataset.f) {                          // заголовок блока без своего файла: пишем только название
          if (b === hh && writeNodeTitle(nodeById(hh.dataset.nh), deRaw(hh).trim())) { commit(false); seen = DATA_VER; }
          return true;
        }
        const blocks = []; for (let e = hh.nextElementSibling; e && !deIsHead(e); e = e.nextElementSibling) blocks.push(e);
        // абзацы до первого заголовка принадлежат первому разделу
        if (hh === view.h1s[0]) { const pre = []; for (let e = hh.previousElementSibling; e; e = e.previousElementSibling) pre.unshift(e); blocks.unshift(...pre); }
        const ch = writeSec({ fid: hh.dataset.f, title: deRaw(hh).trim(), blocks });
        if (ch) { commit(false); seen = DATA_VER; }
        return true;
      };
      const structural = (rd, decide, confirmed) => {
        const secs = rd.secs;
        const present = new Set(secs.filter(s => s.fid && teFind(s.fid)).map(s => s.fid));
        const gone = view.fids.filter(id => !present.has(id) && teFind(id));
        if (!present.size && view.fids.length) { toast(t('de.allgone')); render({}); return; }
        if (gone.length >= 2 && !confirmed) { render({}); return; }   // сразу несколько глав пропало (Ctrl+A и Delete, вырезали кусок): без вопроса карту не трогаем
        let mapChanged = false, rerender = false;
        const msgs = [];
        // 1. убираем главы, которых больше нет в документе
        for (const id of gone) {
          const r = teFind(id); if (!r) continue;
          if (r.n.files.length > 1) {
            if (deFilePristine(r.f)) { r.n.files.splice(r.n.files.indexOf(r.f), 1); mapChanged = true; msgs.push(t('de.removed', deTitleOf(r.n, r.f))); }
            else { r.f.text = ''; r.f.textLive = false; rerender = true; msgs.push(t('de.kept', deTitleOf(r.n, r.f))); }
          } else if (deNodePristine(r.n)) { const nm = r.n.title; deRemoveNode(r.n); mapChanged = true; msgs.push(t('de.removed', nm)); }
          else { r.f.text = ''; r.f.textLive = false; rerender = true; msgs.push(t('de.kept', r.n.title)); }
        }
        // 2. новые разделы: «Заголовок 1» — новый блок в цепочке, «Заголовок 2» — новая глава (файл) в текущем блоке
        let prev = null, prevSec = null; const created = [];
        const firstExisting = secs.map(s => s.fid && teFind(s.fid)).find(Boolean);
        const bind = (s, nn, nf) => { s.el.dataset.f = nf.id; s.el.dataset.n = nn.id; s.el.style.setProperty('--bc', palColor(nn.color)); s.fid = nf.id; };
        for (const s of secs) {
          if (s.nh) { const hn = nodeById(s.nid); if (hn) { prev = { n: hn, f: null }; prevSec = s; } continue; }
          const ex = s.fid && teFind(s.fid);
          if (ex) { prev = ex; prevSec = s; continue; }
          const title = s.title; if (!title) continue;
          const dec = s.lv === 1 ? decide.get(s.el) : null;
          if (dec && dec.nid && nodeById(dec.nid)) {   // подключаем существующий блок
            const cn = nodeById(dec.nid), cf = cn.files[0];
            if (prev) deChainAfter(prev.n, cn); else if (firstExisting) deChainBefore(firstExisting.n, cn);
            const body = deBlocksMd(s.blocks);
            if (body) cf.text = deNorm(cf.text) ? deNorm(cf.text) + '\n' + body : body;
            bind(s, cn, cf);
            prev = { n: cn, f: cn.files[cn.files.length - 1] }; prevSec = s; mapChanged = true; rerender = true; msgs.push(t('de.connected', cn.title)); continue;
          }
          let nn, nf;
          if (s.lv === 2 && prev) {
            nn = prev.n;
            const f0 = nn.files[0];
            // первая глава блока ещё пуста и без названия: заголовок называет её, а не заводит ещё одну
            if (prevSec && prevSec.lv === 1 && !prevSec.nh && prev.f === f0 && nn.files.length === 1 && deIsGen(f0.title) && (!deNorm(f0.text) || deNameKey(deNorm(f0.text)) === deNameKey(title)) && !deBlocksMd(prevSec.blocks) && deFilePristine(f0)) {
              f0.title = title; f0.text = deBlocksMd(s.blocks); prSync(nn, f0); writeNodeTitle(nn, prevSec.title);
              s.done = true; prevSec.done = true; mapChanged = true; rerender = true; titlesDirty = true;
              s.el.dataset.f = f0.id; s.el.dataset.n = nn.id;      // курсор остаётся в заголовке: после перерисовки он вернётся туда же
              msgs.push(t('de.created.f', title, nn.title)); prev = { n: nn, f: f0 }; prevSec = s; continue;
            }
            const at = prev.f ? nn.files.indexOf(prev.f) + 1 : 0;
            nf = newFileAfter(prev.f || nn.files[0] || null, nn); nf.title = title; nn.files.splice(at, 0, nf);
            msgs.push(t('de.created.f', title, nn.title));
          } else {
            const anchor = (prev && prev.n) || (firstExisting && firstExisting.n);
            // главы блока, которые в документе идут уже после нового заголовка, переходят в новый блок
            const moved = prev && prev.f && prev.n.files.indexOf(prev.f) >= 0 ? prev.n.files.splice(prev.n.files.indexOf(prev.f) + 1) : [];
            const z = anchor ? nodeSize(anchor) : { w: NODE_W };
            const sp = anchor ? freeSpot(anchor.x + z.w + 160, anchor.y, NODE_W, 160) : freeSpot(0, 0);
            nn = addNode('chapter', sp.x, sp.y); if (anchor) seedFirstFile(nn, anchor); nn.title = title; nf = nn.files[0];
            nf.title = t('file.new');                            // у первого файла нового блока своего названия нет: он сливается с заголовком блока
            if (moved.length) nn.files.push(...moved);
            if (prev) deChainAfter(prev.n, nn); else if (firstExisting) deChainBefore(firstExisting.n, nn);
            msgs.push(t('de.created', title));
          }
          bind(s, nn, nf);
          prev = { n: nn, f: nf }; prevSec = s; created.push(nf.id); mapChanged = true;
        }
        // 3. тексты и названия всех разделов
        for (const s of secs) if (!s.done && (s.nh || (s.fid && teFind(s.fid)))) writeSec(s);
        for (const el of root.querySelectorAll(HEADS_BOUND)) { const r = teFind(el.dataset.f); if (r) { el.dataset.n = r.n.id; el.style.setProperty('--bc', palColor(r.n.color)); } }
        reindex(); commit(true); seen = DATA_VER;
        if (mapChanged || titlesDirty) { renderAll(); titlesDirty = false; }
        // 4. порядок и вид заголовков в документе должны совпасть с картой
        list = brBranches(); fixDocs();
        const br = curBr();
        const modelIds = br ? brSections(br).map(x => x.f.id) : [];
        const domIds = [...root.querySelectorAll(HEADS_BOUND)].map(x => x.dataset.f);
        const modelKeys = br ? br.nodes.flatMap(n => deHeads(n).map(hd => hd.lv + ':' + (hd.f ? hd.f.id : 'n' + n.id))) : [];
        const domKeys = headEls().filter(x => x.dataset.f || x.dataset.nh).map(x => (x.tagName === 'H1' ? 1 : 2) + ':' + (x.dataset.f || 'n' + x.dataset.nh));
        if (!rerender && modelIds.join(',') !== domIds.join(',')) { rerender = true; if (domIds.length && modelIds.length) msgs.push(t('de.order')); }
        if (!rerender && modelKeys.join(',') !== domKeys.join(',')) rerender = true;
        if (rerender) render({ keep: true }); else { snapshot(); paintAll(); }
        if (msgs.length) { if (mapChanged) toastUndo(msgs[0] + (msgs.length > 1 ? ' …' : '')); else toast(msgs[0], 4200); }
      };
      /** Нужно ли про какой-то новый заголовок спросить («у вас уже есть такой блок»). */
      const askNew = async (rd) => {
        const decide = new Map();
        const inDoc = new Set((curBr() ? curBr().nodes : []).map(n => n.id));
        const hasIn = new Set(P.edges.map(e => e.to));
        for (const s of rd.secs) {
          if (s.fid || s.nh || s.lv !== 1 || !s.title) continue;
          const key = deNameKey(s.title);
          const hit = P.nodes.find(n => n.type !== 'note' && !inDoc.has(n.id) && deNameKey(n.title) === key && !hasIn.has(n.id) && P.startId !== n.id && n.files.length);
          if (!hit) continue;
          const yes = await confirmDlg({ title: t('de.conn.q', hit.title), text: t('de.conn.d'), ok: t('de.conn.ok') });
          if (yes) decide.set(s.el, { nid: hit.id });
        }
        return decide;
      };
      /** Полная синхронизация документа с проектом. final: заголовки без привязки становятся новыми блоками. */
      const flush = async (final) => {
        if (busy || m.closed) return;
        normalize(final);
        const rd = deRead(root, !final);
        const sig = deSig(rd.secs);
        if (sig === view.sig && (!final || !rd.secs.some(s => !s.fid && !s.nh))) {
          let ch = false; for (const s of rd.secs) if (writeSec(s)) ch = true;
          if (ch) { commit(false); seen = DATA_VER; }
          if (titlesDirty) { titlesDirty = false; renderAll(); paintLists(); }
          return;
        }
        busy = true;
        try {
          const present = new Set(rd.secs.filter(s => s.fid && teFind(s.fid)).map(s => s.fid));
          const goneN = view.fids.filter(id => !present.has(id) && teFind(id)).length;
          if (goneN >= 2 && present.size) {
            const ok = await confirmDlg({ title: t('de.multi.q', goneN), text: t('de.multi.d'), ok: t('de.multi.ok'), danger: true });
            if (m.closed) return;
            if (!ok) { render({}); return; }
          }
          const decide = final ? await askNew(rd) : new Map();
          if (m.closed) return;
          normalize(final);
          structural(deRead(root, !final), decide, true);
        } finally { busy = false; }
      };
      flushNow = () => {
        if (busy) return;
        normalize(true);
        const rd = deRead(root, false);
        if (deSig(rd.secs) === view.sig && !rd.secs.some(s => !s.fid && !s.nh)) { let ch = false; for (const s of rd.secs) if (writeSec(s)) ch = true; if (ch) { commit(true); seen = DATA_VER; } if (titlesDirty) { titlesDirty = false; renderAll(); } return; }
        structural(rd, new Map());
      };
      const pendingH1 = () => [...root.querySelectorAll(pendSel)].filter(x => deRaw(x).trim());
      const scheduleIdle = () => {
        clearTimeout(idleT);
        idleT = setTimeout(() => { const b = selBlock(); const inPending = b && deIsHead(b) && !b.dataset.f && !b.dataset.nh; flush(!inPending); }, 700);
      };

      /* ---------- вкладки и ветки ---------- */
      const tabLabel = b => b.title;
      let tabDrag = '';
      /* вкладки можно переставлять перетаскиванием: порядок запоминается */
      const moveTab = (id, target, after) => {
        const i = docs.indexOf(id); if (i < 0 || id === target) return;
        docs.splice(i, 1);
        let j = docs.indexOf(target); if (j < 0) { docs.push(id); } else docs.splice(after ? j + 1 : j, 0, id);
        persist(); paintTabs();
      };
      const paintTabs = () => {
        tabBar.replaceChildren(...docs.map(id => {
          const b = list.find(x => x.id === id); if (!b) return null;
          return h('div', { class: 'te-tab' + (id === on ? ' on' : ''), 'data-id': id, draggable: 'true', title: tabLabel(b), onclick: () => openDoc(id),
            ondragstart: ev => { tabDrag = id; ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', id); } catch (e) { /* не страшно */ } ev.currentTarget.classList.add('drag'); },
            ondragover: ev => { if (!tabDrag || tabDrag === id) return; ev.preventDefault(); const r = ev.currentTarget.getBoundingClientRect(), after = ev.clientX > r.left + r.width / 2; tabBar.querySelectorAll('.ins-l,.ins-r').forEach(x => x.classList.remove('ins-l', 'ins-r')); ev.currentTarget.classList.add(after ? 'ins-r' : 'ins-l'); },
            ondrop: ev => { ev.preventDefault(); const r = ev.currentTarget.getBoundingClientRect(), after = ev.clientX > r.left + r.width / 2; moveTab(tabDrag, id, after); tabDrag = ''; },
            ondragend: () => { tabDrag = ''; tabBar.querySelectorAll('.drag,.ins-l,.ins-r').forEach(x => x.classList.remove('drag', 'ins-l', 'ins-r')); } },
            h('span', { class: 'dot', style: { background: palColor(b.nodes[0].color) } }),
            h('span', { class: 'te-tab-t' }, tabLabel(b)),
            b.isMain ? h('span', { class: 'de-star', 'data-tip': t('de.main.tip') }, icon('flag', 12)) : null,
            docs.length > 1 ? h('button', { class: 'te-tab-x', 'data-tip': t('de.tab.close'), onclick: ev => { ev.stopPropagation(); closeDoc(id); } }, icon('x', 12, 2.2)) : null);
        }).filter(Boolean),
          h('button', { class: 'btn icon sm te-tab-add', id: 'de-add', 'data-tip': t('de.tab.new'), onclick: ev => {
            const rest = list.filter(b => !docs.includes(b.id));
            if (!rest.length) { toast(t('de.nomatch')); return; }
            menuAt(ev.currentTarget, rest.map(b => ({ label: b.title, icon: b.isMain ? 'flag' : 'fork', onClick: () => openDoc(b.id) })));
          } }, icon('plus', 16)));
        const act = tabBar.querySelector('.te-tab.on');                 // активная вкладка всегда на виду, даже когда их очень много
        if (act) { const br = tabBar.getBoundingClientRect(), ar = act.getBoundingClientRect(), l = ar.left - br.left + tabBar.scrollLeft, r = l + ar.width; if (l < tabBar.scrollLeft) tabBar.scrollLeft = l - 8; else if (r > tabBar.scrollLeft + tabBar.clientWidth - 40) tabBar.scrollLeft = r - tabBar.clientWidth + 48; }
      };
      tabBar.addEventListener('wheel', ev => { if (tabBar.scrollWidth > tabBar.clientWidth && Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { tabBar.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive: false });
      const openDoc = async (id, o = {}) => {
        if (!list.some(b => b.id === id)) return;
        await flush(true);
        if (m.closed) return;
        savePos();
        const nid = idOf(id) || id; if (!docs.includes(nid)) { const at = o.after ? docs.indexOf(o.after) : -1; if (at >= 0) docs.splice(at + 1, 0, nid); else docs.push(nid); }
        on = nid; persist(); render();
        if (o.fid) jumpToFile(o.fid); else if (!applyPos(posOf(on))) ed.scrollTop = 0;
      };
      const closeDoc = async id => {
        const i = docs.indexOf(id); if (i < 0) return;
        if (id === on) await flush(true);
        docs.splice(i, 1);
        if (id === on) { on = docs[Math.min(i, docs.length - 1)] || ''; persist(); render(); } else { persist(); paintAll(); }
      };
      const jumpTo = el => {
        if (!el) return;
        el.scrollIntoView({ block: 'start' });
        root.focus({ preventScroll: true });
        deSetCaret(el, deRaw(el).length);
        paintSoon();
      };
      const jumpToFile = fid => jumpTo([...root.querySelectorAll(HEADS_BOUND)].find(x => x.dataset.f === fid));

      /* ---------- место в документе: закрыли редактор, открыли снова — вы там же ----------
         Для каждой ветки (S.tePos, у этого устройства) помним абзац наверху экрана и курсор. Абзац задаётся разделом (файл или блок), номером
         в нём и началом текста, поэтому находится и после правок в других местах. */
      const POS_KEEP = 40;
      const secKey = hh => hh.dataset.f || (hh.dataset.nh ? 'n:' + hh.dataset.nh : '');
      const snip = b => (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
      const anchorOf = b => {
        let idx = 0, e = b;
        while (e && !(e.dataset && (e.dataset.f || e.dataset.nh))) { e = e.previousElementSibling; idx++; }
        let i = 0; for (let x = b.previousElementSibling; x; x = x.previousElementSibling) i++;
        return { k: e ? secKey(e) : '', idx: e ? idx : i, i, s: snip(b) };
      };
      const posBlock = a => {
        if (!a) return null;
        const kids = root.children;
        let b = null;
        if (a.k) {
          const hh = [...root.querySelectorAll(HEADS_BOUND + ',h1[data-nh]')].find(x => secKey(x) === a.k);
          if (hh) { b = hh; for (let j = 0; j < a.idx && b.nextElementSibling && !deIsHead(b.nextElementSibling); j++) b = b.nextElementSibling; }
        } else if (kids[a.idx]) b = kids[a.idx];
        const byI = kids[a.i];
        if (byI && (!b || (a.s && snip(b) !== a.s && snip(byI) === a.s))) b = byI;   // раздел пропал или абзац сдвинулся — по номеру и началу текста
        return b;
      };
      /** Во время появления окно слегка увеличивается: расстояния на экране надо пересчитать в пиксели страницы. */
      const pxScale = () => { const r = ed.getBoundingClientRect(); return r.height && ed.offsetHeight ? r.height / ed.offsetHeight : 1; };
      const posNow = () => {
        const kids = root.children; if (!kids.length || !root.isConnected) return null;
        const top = ed.getBoundingClientRect().top;
        let lo = 0, hi = kids.length - 1;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (kids[mid].getBoundingClientRect().bottom > top + 2) hi = mid; else lo = mid + 1; }
        const b = kids[lo];
        const pos = { t: Date.now(), y: Math.round(ed.scrollTop), a: anchorOf(b), d: Math.round((b.getBoundingClientRect().top - top) / pxScale()) };
        const sb = inRoot() ? selBlock() : null;
        if (sb && sb.parentNode === root) {
          const sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(sb);
          try { r.setEnd(sel.anchorNode, sel.anchorOffset); pos.c = Object.assign(anchorOf(sb), { o: r.toString().length }); } catch (e) { /* курсор не запоминаем */ }
        }
        return pos;
      };
      const posOf = id => (S.tePos && S.tePos[id]) || null;
      const savePos = () => {
        clearTimeout(posT);
        if (!on) return;
        const p = posNow(); if (!p) return;
        S.tePos = S.tePos || {}; S.tePos[on] = p;
        const keys = Object.keys(S.tePos);
        if (keys.length > POS_KEEP) keys.sort((x, y) => (S.tePos[y].t || 0) - (S.tePos[x].t || 0)).slice(POS_KEEP).forEach(k => { delete S.tePos[k]; });
        saveSettings();
      };
      savePosOut = savePos;
      const savePosSoon = () => { clearTimeout(posT); posT = setTimeout(savePos, 1500); };
      /** Вернуть прокрутку и курсор. false — запоминать было нечего или абзац не нашёлся. */
      const applyPos = pos => {
        if (!pos) return false;
        const ba = posBlock(pos.a), bc = pos.c ? posBlock(pos.c) : null;
        if (!ba && !bc) { if (pos.y) { ed.scrollTop = pos.y; return true; } return false; }
        const c = bc || ba;
        root.focus({ preventScroll: true });
        deSetCaret(c, bc ? Math.min(pos.c.o || 0, deRaw(c).length) : 0);      // курсор там же, где был; если не было — в верхнем абзаце, чтобы печатать там, куда смотрите
        if (ba) ed.scrollTop += (ba.getBoundingClientRect().top - ed.getBoundingClientRect().top) / pxScale() - (pos.d || 0);
        else c.scrollIntoView({ block: 'center' });
        paintSoon();
        return true;
      };

      /* ---------- левая панель: ветки и оглавление ---------- */
      const branchWords = b => brSections(b).reduce((a, x) => a + prWords(x.f.text), 0);
      const paintLists = () => {
        const q = listQ.trim().toLowerCase();
        brBox.replaceChildren(...list.filter(b => !q || b.title.toLowerCase().includes(q) || brSections(b).some(x => deTitleOf(x.n, x.f).toLowerCase().includes(q) || String(x.f.text || '').toLowerCase().includes(q))).map(b => {
          const w = branchWords(b);
          return h('div', { class: 'te-ch de-br' + (b.id === on ? ' on' : '') + (docs.includes(b.id) ? ' open' : ''), 'data-id': b.id, onclick: () => openDoc(b.id) },
            h('span', { class: 'dot big', style: { background: palColor(b.nodes[0].color) } }),
            h('div', { class: 'te-ch-t' }, h('div', { class: 'te-ch-n' }, b.title),
              h('div', { class: 'te-ch-s' }, [b.isMain ? t('de.main.tip') : b.parent && nodeById(b.parent.nodeId) ? t('br.from', nodeById(b.parent.nodeId).title) : '', b.joins ? t('br.joins', b.joins.title) : ''].filter(Boolean).join(' · '))),
            b.isMain ? h('span', { class: 'de-star' }, icon('flag', 12)) : null,
            h('span', { class: 'te-ch-w' }, w ? fmtNum(w) : ''));
        }));
        if (!brBox.children.length) brBox.append(h('div', { class: 'empty small' }, list.length ? t('de.nomatch') : t('de.none')));
        // оглавление
        const items = [];
        for (const el of root.children) {
          const k = deKind(el); if (!['h1', 'h2', 'h3', 'title', 'fork'].includes(k)) continue;
          const txt = deRaw(el).trim() || (k === 'fork' ? t('de.k.fork') : ''); if (!txt && k !== 'h1') continue;
          if (q && !txt.toLowerCase().includes(q)) continue;
          items.push({ el, k, txt });
        }
        olBox.replaceChildren(...items.map(it => {
          let w = '';
          if ((it.k === 'h1' || it.k === 'h2') && it.el.dataset.f) { const r = teFind(it.el.dataset.f); if (r) { const c = prWords(r.f.text); w = c ? fmtNum(c) : ''; } }
          return h('div', { class: 'de-ol-i k-' + it.k, onclick: () => jumpTo(it.el) },
            it.k === 'fork' ? icon('fork', 12) : null, h('span', { class: 'de-ol-t' }, it.txt || t('br.untitled')), w ? h('span', { class: 'te-ch-w' }, w) : null);
        }));
        if (!olBox.children.length) olBox.append(h('div', { class: 'empty small' }, t('de.nomatch')));
      };

      /* ---------- верх: где мы, баннеры ---------- */
      const secCount = f => prScriptLines(f);
      const paintInfo = () => {
        const br = curBr();
        info.replaceChildren(...[
          br ? h('div', { class: 'te-where' }, h('span', { class: 'dot big', style: { background: palColor(br.nodes[0].color) } }), h('b', br.title),
            br.parent && nodeById(br.parent.nodeId) ? h('span', { class: 'te-sub' }, t('br.from', nodeById(br.parent.nodeId).title)) : null,
            br.joins ? h('span', { class: 'te-sub' }, t('br.joins', br.joins.title)) : null) : null,
          h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', id: 'de-mode', 'data-tip': t('de.mode.tip'), onclick: () => { const c = cur(); flushNow(); S.teMode = 'ch'; saveSettings(); openChapterEditor({ fileId: c ? c.f.id : '' }); } }, icon('rows', 14), t('de.mode.ch'))].filter(Boolean));
      };
      const paintBanners = () => {
        banners.replaceChildren();
        const br = curBr(); if (!br) return;
        const need = brSections(br).filter(x => !deNorm(x.f.text) && secCount(x.f) > 0 && !dismissed.has(x.f.id));
        if (need.length) {
          const one = need.length === 1;
          const pickIt = list2 => {
            let k = 0, same = 0;
            for (const x of list2) { const r = dePickup(x.n, x.f); k += r.lines; if (r.same) same++; }
            commit(true); seen = DATA_VER; render({ keep: true });
            toast(t('de.pick.done', k) + ' ' + (same === list2.length ? t('de.pick.same') : t('de.pick.diff')), 4800);
          };
          banners.append(h('div', { class: 'te-banner de-pick', id: 'de-pick' },
            h('div', { class: 'te-banner-t' }, icon('wand', 16), one ? t('de.pick.one', deTitleOf(need[0].n, need[0].f), t('de.pick.lines', secCount(need[0].f))) : t('de.pick.many', need.length)),
            h('div', { class: 'te-banner-b' },
              h('button', { class: 'btn sm primary', id: 'de-pick-go', onclick: () => pickIt(need) }, one ? t('de.pick.btn') : t('de.pick.all')),
              h('button', { class: 'btn sm', id: 'de-pick-show', onclick: () => jumpToFile(need[0].f.id) }, t('de.pick.show')),
              h('button', { class: 'btn sm', id: 'de-pick-hide', onclick: () => { need.forEach(x => dismissed.add(x.f.id)); paintBanners(); } }, t('de.pick.hide')))));
        }
        const r = cur();
        if (r && r.f.textLive && !prScriptIsOurs(r.f)) {
          banners.append(h('div', { class: 'te-banner', id: 'de-conf' },
            h('div', { class: 'te-banner-t' }, icon('alert', 16), t('te.conf')),
            h('div', { class: 'te-banner-b' },
              h('button', { class: 'btn sm', id: 'de-conf-rep', onclick: () => { prApply(r.n, r.f, 'replace'); commit(true); seen = DATA_VER; paintAll(); } }, t('te.conf.rep')),
              h('button', { class: 'btn sm', id: 'de-conf-off', onclick: () => { r.f.textLive = false; commit(true); seen = DATA_VER; paintAll(); } }, t('te.conf.off')))));
        }
      };

      /* ---------- правая панель: эта глава и сценарий ---------- */
      /* «Что это за панель?»: объяснение, зачем справа сценарий; запоминает, свёрнуто ли */
      const explain = () => {
        const d = h('details', { class: 'de-explain', id: 'de-explain' }, h('summary', icon('info', 14), t('de.explain.h')),
          h('p', t('de.explain.1')), h('p', t('de.explain.2')), h('p', t('de.explain.3')), h('p', t('de.explain.4')),
          h('button', { class: 'btn sm', id: 'de-explain-more', onclick: () => openHelp('editor') }, icon('help', 14), t('de.explain.more')));
        if (S.teExplain !== false) d.open = S.teExplain === true;
        d.addEventListener('toggle', () => { S.teExplain = d.open; saveSettings(); });
        return d;
      };
      const paintSec = () => {
        const r = cur(); secCard.replaceChildren();
        if (!r) return;
        const f = r.f, n = r.n, nTitle = deTitleOf(n, f);
        colBtn.style.setProperty('--bc', palColor(n.color)); colBtn.dataset.tip = t('de.color.tip') + ' · ' + n.title;
        const st = !f.script.trim() ? 'none' : prScriptIsOurs(f) ? 'ours' : 'manual';
        const outs = deOuts(n);
        const hasMark = n.files.some(x => teForks(x.text).length);
        const live = h('div', { class: 'te-live', 'data-tip': t('te.live.tip') }, switchEl(!!f.textLive, async v => {
          const c = cur(); if (!c) return;
          if (!v) { c.f.textLive = false; commit(true); seen = DATA_VER; paintAll(); return; }
          if (c.f.script.trim() && !prScriptIsOurs(c.f)) {
            const ok = await confirmDlg({ title: t('te.live.q'), text: t('te.live.d'), ok: t('te.live.on') });
            if (!ok) { paintSec(); return; }
          }
          flushNow(); c.f.textLive = true; prApply(c.n, c.f, 'replace'); commit(true); seen = DATA_VER; paintAll();
        }, t('te.live')));
        const applyBtn = h('button', { class: 'btn primary sm', id: 'de-apply', onclick: ev => menuAt(ev.currentTarget, [
          { label: t('te.apply.rep'), icon: 'refresh', onClick: () => apply('replace') },
          { label: t('te.apply.add'), icon: 'down', onClick: () => apply('append') },
          { sep: true },
          { label: t('te.apply.copy'), icon: 'copy', onClick: copyScript }]) }, icon('wand', 15), t('te.apply'), icon('chevD', 13));
        secCard.append(...[
          h('div', { class: 'de-sec-h' }, h('button', { class: 'de-sec-dot', id: 'de-sec-color', 'data-tip': t('de.color.tip'), onclick: ev => pickColor(ev.currentTarget) }, h('span', { class: 'dot big', style: { background: palColor(n.color) } })), h('div', { class: 'de-sec-t' }, h('b', n.title), nTitle !== n.title ? h('span', { class: 'te-sub' }, nTitle) : null),
            h('div', { class: 'grow' }),
            h('button', { class: 'btn sm', id: 'de-opennode', onclick: () => { focusNode(n.id); openNodeModal(n.id, f.id); } }, icon('open', 14), t('te.open.node'))),
          h('div', { class: 'de-sec-s ' + st }, st === 'ours' ? icon('check', 14) : st === 'manual' ? icon('alert', 14) : icon('dot', 14), t('de.sc.' + st), f.textLive && st !== 'manual' ? h('span', { class: 'te-sub' }, ' · ' + t('de.sc.live')) : null),
          h('div', { class: 'de-sec-b' }, live, h('div', { class: 'grow' }), applyBtn),
          explain(),
          !deNorm(f.text) ? h('div', { class: 'de-sec-b' }, h('button', { class: 'btn sm', id: 'de-pull', 'data-tip': t('pull.btn.tip'), onclick: async () => { flushNow(); if (await pullChapter(n, f, { script: false })) { seen = DATA_VER; render({ keep: true }); } } }, icon('down', 14), t('pull.btn'))) : null,
          outs.length > 1 && !hasMark ? h('div', { class: 'de-sec-hint', id: 'de-forkhint' }, icon('fork', 14), h('span', t('de.hint.fork', outs.length)),
            h('button', { class: 'btn sm', id: 'de-forkhint-add', onclick: () => addForkMark(n) }, t('de.hint.fork.add'))) : null].filter(Boolean));
      };
      const apply = async mode => {
        const r = cur(); if (!r) return;
        flushNow();
        if (!deNorm(r.f.text)) { toast(t('te.apply.empty')); return; }
        if (mode === 'replace' && !r.f.textLive && r.f.script.trim() && !prScriptIsOurs(r.f)) {
          const ok = await confirmDlg({ title: t('te.apply.rep.q'), text: t('te.apply.rep.d'), ok: t('te.apply.rep') });
          if (!ok) return;
        }
        const k = prApply(r.n, r.f, mode);
        if (!k) { toast(t('te.apply.empty')); return; }
        commit(true); seen = DATA_VER; paintAll(); toastUndo(t('te.applied', k));
      };
      const copyScript = async () => {
        const r = cur(); if (!r) return;
        const code = prBuild(r.n, r.f).code;
        try { await navigator.clipboard.writeText(code); toast(t('te.copied')); } catch (e) { const tmp = h('textarea', { style: { position: 'fixed', opacity: 0 } }); tmp.value = code; document.body.append(tmp); tmp.select(); try { document.execCommand('copy'); toast(t('te.copied')); } catch (e2) { /* не вышло */ } tmp.remove(); }
      };
      const addForkMark = n => {
        const last = headEls().filter(x => x.dataset.n === n.id).pop(); if (!last) return;
        let e = last; while (e.nextElementSibling && !deIsHead(e.nextElementSibling)) e = e.nextElementSibling;
        const p = document.createElement('p'); p.dataset.k = 'fork'; p.className = 'de-fork'; p.append(document.createElement('br'));
        e.after(p); deSetCaret(p, 0); root.focus({ preventScroll: true }); lightSync(); paintAll();
      };
      const PV_LIMIT = 400;
      let pvKey = '';
      const paintPv = () => {
        const r = cur(); pvKey = r ? r.f.id : '';
        pvHead.replaceChildren(segmented([{ value: 'rows', label: t('te.pv.rows') }, { value: 'code', label: t('te.pv.code') }], pvMode, v => { pvMode = v; paintPv(); }, 'te-pvseg'), h('div', { class: 'grow' }), stat2);
        pvBody.replaceChildren();
        if (!r) return;
        let b; try { b = prBuild(r.n, r.f); } catch (e) { pvBody.append(h('div', { class: 'empty small' }, String(e && e.message || e))); return; }
        stat2.replaceChildren(...[t('te.pv.stat', b.lines, b.cmds), b.unknown ? h('span', { class: 'te-warn' }, ' · ' + t('te.pv.unk', b.unknown)) : null].filter(Boolean));
        const marks = teForks(r.f.text);
        if (!b.rows.length && !marks.length) { pvBody.append(h('div', { class: 'empty small' }, t('de.pv.empty'))); return; }
        if (pvMode === 'code') { pvBody.append(h('pre', { class: 'te-code', html: highlightRenpy(b.code, new Set(P.characters.map(c => c.tag).filter(Boolean))) })); return; }
        const hh = [...root.querySelectorAll(HEADS_BOUND)].find(x => x.dataset.f === r.f.id);
        const toLine = i => { if (!hh) return; let e = hh; for (let k = 0; k < i + 1 && e.nextElementSibling && !deIsHead(e.nextElementSibling); k++) e = e.nextElementSibling; jumpTo(e); };
        const items = b.rows.map(row => ({ line: row.line, row })).concat(marks.map(mk => ({ line: mk.line, mark: mk })));
        items.sort((x, y) => x.line - y.line);
        const frag = [];
        items.slice(0, PV_LIMIT).forEach(it => {
          if (it.mark) { frag.push(h('div', { class: 'te-r fork', onclick: () => toLine(it.line) }, icon('fork', 14), h('b', t('te.pv.fork')), it.mark.note ? h('span', ' · ' + it.mark.note) : null)); return; }
          const row = it.row;
          if (row.cmd !== undefined) { frag.push(h('div', { class: 'te-r ' + (row.head ? 'head' : 'cmd'), onclick: () => toLine(row.line) }, row.head ? row.cmd.replace(/^#\s*/, '') : row.cmd)); return; }
          const c = row.sp && row.sp !== '?' ? charById(row.sp) : null;
          const who = row.sp === '?' ? h('span', { class: 'te-who unk' }, '?') : c ? h('span', { class: 'te-who', style: { background: 'var(--c-' + c.color + ')' } }, c.name || c.tag) : h('span', { class: 'te-who narr' }, t('te.pv.narr'));
          const runs = teRuns(row.text).map(x => { let el = h('span', x.t); if (x.hl) el = h('mark', { class: 'hl-' + x.hl }, el); if (x.b) el = h('b', el); if (x.i) el = h('i', el); return el; });
          frag.push(h('div', { class: 'te-r say' + (row.sp === '?' ? ' bad' : ''), onclick: () => toLine(row.line) }, who, h('div', { class: 'te-r-t' }, ...runs),
            row.sp === '?' ? h('button', { class: 'btn sm te-setwho', onclick: ev => { ev.stopPropagation(); pickChar(ev.currentTarget, prCast(r.n, r.f).map(x => x.id), ch => setWho(r, row, ch)); } }, t('te.pv.name')) : null));
        });
        pvBody.append(...frag);
        if (items.length > PV_LIMIT) pvBody.append(h('div', { class: 'hint te-cut' }, t('te.pv.cut', PV_LIMIT)));
      };
      /** Строка без говорящего → «Имя: реплика». */
      const setWho = (r, row, c) => {
        const hh = [...root.querySelectorAll(HEADS_BOUND)].find(x => x.dataset.f === r.f.id); if (!hh) return;
        let e = hh; for (let k = 0; k < row.line + 1 && e.nextElementSibling && !deIsHead(e.nextElementSibling); k++) e = e.nextElementSibling;
        if (!e || e === hh) return;
        const same = prBuild(r.n, r.f).rows.filter(x => x.line === row.line).length;
        let body = deBlockMd(e).trim();
        const q = body.match(/^[«"“„]([^»"”“]+)[»"”]\s*[,.]?\s*$/u);
        if (same === 1) { if (q) body = q[1]; else body = body.replace(/^[—–-]\s*/, ''); } else body = body.replace(/^[—–-]\s*/, '');
        const rr = deLine(`${c.name || c.tag}: ${body}`);
        e.innerHTML = rr.html || '<br>'; lightSync(); paintAll();
      };

      /* ---------- низ: подсчёты ---------- */
      const docMd = () => [...root.children].filter(x => !deIsHead(x)).map(deBlockMd).join('\n');
      const paintStat = () => {
        const v = docMd(), w = prWords(v);
        const s = window.getSelection(); let sel = 0;
        if (s && s.rangeCount && !s.isCollapsed && root.contains(s.anchorNode)) sel = prWords(deRange(s.getRangeAt(0)));
        stat.replaceChildren(...[h('span', t('te.words', fmtNum(w))), h('span', t('te.chars', fmtNum(v.replace(/\s/g, '').length))), h('span', t('te.read', fmtDur(w))),
          sel ? h('span', { class: 'te-selw' }, t('te.sel', fmtNum(sel))) : null, teHlCount(v) ? h('span', { class: 'te-hlc' }, t('te.hl.n', teHlCount(v))) : null].filter(Boolean));
      };
      /* ---------- масштаб текста, как в Word: только сам текст документа, интерфейс не меняется ---------- */
      const ZOOMS = [50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300];
      const zoomOutB = h('button', { class: 'btn icon sm', id: 'de-zoom-out', 'data-tip': t('de.zoom.out'), onclick: () => zoomStep(-1) }, icon('minus', 14));
      const zoomInB = h('button', { class: 'btn icon sm', id: 'de-zoom-in', 'data-tip': t('de.zoom.in'), onclick: () => zoomStep(1) }, icon('plus', 14));
      const zoomPct = h('button', { class: 'btn sm de-zoom-pct', id: 'de-zoom-pct', 'data-tip': t('de.zoom.reset'), onclick: () => setZoom(100) });
      const zoomBox = h('div', { class: 'de-zoom' }, zoomOutB, zoomPct, zoomInB);
      const curZoom = () => { const z = Math.round(+S.teZoom); return z >= ZOOMS[0] && z <= ZOOMS[ZOOMS.length - 1] ? z : 100; };
      const setZoom = (z, init) => {
        z = Math.max(ZOOMS[0], Math.min(ZOOMS[ZOOMS.length - 1], Math.round(z)));
        const changed = z !== curZoom();
        if (!init) { S.teZoom = z === 100 ? undefined : z; if (changed) saveSettings(); }
        m.card.style.setProperty('--tez', String(z / 100));
        zoomPct.textContent = z + '%'; zoomOutB.disabled = z <= ZOOMS[0]; zoomInB.disabled = z >= ZOOMS[ZOOMS.length - 1];
        if (changed && !init) { const b = inRoot() ? selBlock() : null; if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' }); }
      };
      const zoomStep = dir => {
        const z = curZoom();
        const nx = dir > 0 ? ZOOMS.find(v => v > z) : [...ZOOMS].reverse().find(v => v < z);
        if (nx) setZoom(nx);
      };
      let wheelAcc = 0;
      ed.addEventListener('wheel', ev => {
        if (!(ev.ctrlKey || ev.metaKey)) return;
        ev.preventDefault();
        wheelAcc += ev.deltaY; if (ev.deltaMode === 1) wheelAcc += ev.deltaY * 30;
        if (Math.abs(wheelAcc) >= 40) { zoomStep(wheelAcc < 0 ? 1 : -1); wheelAcc = 0; }
      }, { passive: false });
      const paintFoot = () => { foot.replaceChildren(stat, h('div', { class: 'grow' }), zoomBox, saved); };
      /** Выделенный фрагмент → строки рукописи. */
      const deRange = rg => {
        const box = document.createElement('div'); box.append(rg.cloneContents());
        const blocks = [...box.children].filter(x => /^(P|H1|H2|H3|H4|H5|H6|DIV)$/.test(x.tagName));
        if (!blocks.length) { const p = document.createElement('p'); while (box.firstChild) p.append(box.firstChild); return deBlockMd(p); }
        return blocks.map(x => deBlockMd(x)).join('\n');
      };

      /* ---------- форматирование ---------- */
      const blocksInSel = () => {
        restoreSel();
        const s = window.getSelection(); if (!s || !s.rangeCount || !root.contains(s.anchorNode)) return [];
        const rg = s.getRangeAt(0), a = blockOf(rg.startContainer), z = blockOf(rg.endContainer); if (!a) return [];
        const out = []; for (let e = a; e; e = e.nextElementSibling) { out.push(e); if (e === z) break; }
        return out;
      };
      const kindLabel = k => t('de.k.' + k);
      const paintStyleBtn = () => {
        const b = selBlock(); const k = b ? deKind(b) : 'p';
        styleBtn.firstChild.textContent = kindLabel(k === 'h1' ? 'h1' : k);
      };
      /** Поменять стиль выделенных абзацев. */
      const setKind = async (k) => {
        const bs = blocksInSel(); if (!bs.length) return;
        const rep = new Map(); let toH1 = false; let first = null;
        for (const b of bs) {
          const cur0 = deKind(b);
          if (cur0 === k) { first = first || b; continue; }
          const inner = ['cmd', 'note', 'fork'].includes(k) || ['cmd', 'note', 'fork'].includes(cur0) ? deEsc(deRaw(b)) : b.innerHTML;
          let neu;
          if (k === 'h1' || k === 'h2') { neu = document.createElement(k); neu.innerHTML = deEsc(deRaw(b)) || ''; toH1 = true; }
          else if (k === 'h3') { neu = document.createElement(k); neu.innerHTML = inner; }
          else { neu = document.createElement('p'); if (k !== 'p') { neu.dataset.k = k; neu.className = 'de-' + k; } neu.innerHTML = inner; }
          b.replaceWith(neu); rep.set(b, neu); first = first || neu;
          if (!neu.firstChild) neu.append(document.createElement('br'));
        }
        if (first) deSetCaret(first, deRaw(first).length);
        root.focus({ preventScroll: true });
        lastTouch = Date.now();
        await flush(true);
        paintAll();
      };
      const styleItems = () => [
        { k: 'p', ic: 'type' }, { k: 'title', ic: 'book' }, { k: 'h1', ic: 'flag' }, { k: 'h2', ic: 'hash' }, { k: 'h3', ic: 'hash' },
        { sep: true }, { k: 'note', ic: 'sticker' }, { k: 'cmd', ic: 'code' }, { k: 'fork', ic: 'fork' }].map(x => x.sep ? x : { label: kindLabel(x.k), icon: x.ic, kbd: x.k === 'p' ? 'Ctrl+Alt+0' : x.k === 'h1' ? 'Ctrl+Alt+1' : x.k === 'h2' ? 'Ctrl+Alt+2' : x.k === 'h3' ? 'Ctrl+Alt+3' : '', onClick: () => setKind(x.k) });
      const styleBtn = h('button', { class: 'btn sm de-style', id: 'de-style', 'data-tip': t('de.style'), onmousedown: ev => ev.preventDefault(), onclick: ev => menuAt(ev.currentTarget, styleItems()) }, h('span', t('de.k.p')), icon('chevD', 13));
      const tbBtn = (ic, tip, fn, id, label) => h('button', { class: 'btn icon sm te-b', id: id || null, 'data-tip': tip, onmousedown: ev => ev.preventDefault(), onclick: ev => fn(ev.currentTarget) }, ic ? icon(ic, 16) : null, label ? h('span', { class: 'te-b-l' }, label) : null);
      /** Вставить новый абзац после текущего. */
      const insertBlock = (k, text) => {
        let b = selBlock() || root.lastElementChild; if (!b) return null;
        const mkEl = () => { const p = document.createElement('p'); if (k !== 'p') { p.dataset.k = k; p.className = 'de-' + k; } if (text) p.textContent = text; else p.append(document.createElement('br')); return p; };
        let neu;
        if (deKind(b) === 'p' && !deRaw(b).trim()) { neu = mkEl(); b.replaceWith(neu); } else { neu = mkEl(); b.after(neu); }
        deSetCaret(neu, deRaw(neu).length); root.focus({ preventScroll: true });
        lightSync(); paintAll();
        return neu;
      };
      const insCmd = code => code.split('\n').forEach(l => insertBlock('cmd', l));
      const withTr = () => (S.transition ? ` with ${S.transition}` : '');
      const cmdMenu = b => menuAt(b, [
        { label: t('te.c.scene'), icon: 'image', onClick: () => setTimeout(() => pickAsset(b, 'bg', a => insCmd(`scene ${a.name}${withTr()}`)), 30) },
        { label: t('te.c.show'), icon: 'user', onClick: () => setTimeout(() => pickAsset(b, 'sprite', a => insCmd(`show ${a.name}${withTr()}`)), 30) },
        { label: t('te.c.hide'), icon: 'eye', onClick: () => setTimeout(() => pickAsset(b, 'sprite', a => insCmd(`hide ${a.name}${withTr()}`)), 30) },
        { sep: true },
        { label: t('te.c.music'), icon: 'music', onClick: () => setTimeout(() => pickAsset(b, 'music', a => insCmd(`play music "${assetCodeName(a)}" fadein 1.0`)), 30) },
        { label: t('te.c.sound'), icon: 'volume', onClick: () => setTimeout(() => pickAsset(b, 'sfx', a => insCmd(`play sound "${assetCodeName(a)}"`)), 30) },
        { label: t('te.c.fx'), icon: 'sparkles', onClick: () => setTimeout(() => pickAsset(b, 'fx', a => insCmd(`with ${a.name}`)), 30) },
        { label: t('te.c.pause'), icon: 'zap', onClick: () => insCmd('pause 1.0') },
        { sep: true },
        { label: t('te.c.jump'), icon: 'link', onClick: () => setTimeout(() => pickFile(b, fl => insCmd(`jump ${fileLabel(fl)}`)), 30) },
        { label: t('te.c.menu'), icon: 'fork', onClick: () => { const r = cur(); if (r) insCmd(menuSnippet(r.n)); } },
        { label: t('te.c.raw'), icon: 'code', onClick: () => insertBlock('cmd', '') }]);
      const speak = c => {
        const b = selBlock(), pre = (c.name || c.tag) + ': ';
        if (!b || deKind(b) !== 'p') { insertBlock('p', pre); return; }
        [...b.children].forEach(x => { if (x.tagName === 'BR' && !x.nextSibling) x.remove(); });
        b.insertBefore(document.createTextNode(pre), b.firstChild);
        deSetCaret(b, pre.length); root.focus({ preventScroll: true }); lightSync(); paintAll();
      };
      /* --- выделение цветом: <mark class="hl-цвет"> вокруг текстовых кусков выделения --- */
      const hlBar = h('span', { class: 'te-hlbar' });
      const paintHlBtn = () => { hlBar.className = 'te-hlbar hl-' + prHlColor(S.teHl); };
      const textPieces = rg => {
        const out = [];
        const base = rg.commonAncestorContainer.nodeType === 3 ? rg.commonAncestorContainer.parentNode : rg.commonAncestorContainer;
        const w = document.createTreeWalker(base, NodeFilter.SHOW_TEXT); let n;
        const nodes = rg.commonAncestorContainer.nodeType === 3 ? [rg.commonAncestorContainer] : []; while (!nodes.length && (n = w.nextNode())) { if (rg.intersectsNode(n)) nodes.push(n); }
        if (!nodes.length && rg.commonAncestorContainer.nodeType !== 3) { const w2 = document.createTreeWalker(base, NodeFilter.SHOW_TEXT); let q; while ((q = w2.nextNode())) if (rg.intersectsNode(q)) nodes.push(q); }
        for (const node of nodes) {
          const bk = blockOf(node); if (!bk || !['p', 'h2', 'h3', 'title'].includes(deKind(bk))) continue;
          let s0 = node === rg.startContainer ? rg.startOffset : 0, e0 = node === rg.endContainer ? rg.endOffset : node.nodeValue.length;
          if (e0 <= s0) continue;
          let mid = node; if (s0 > 0) mid = node.splitText(s0); if (e0 - s0 < mid.nodeValue.length) mid.splitText(e0 - s0);
          out.push(mid);
        }
        return out;
      };
      const applyHl = color => {
        color = prHlColor(color); S.teHl = color; saveSettings(); paintHlBtn();
        restoreSel();
        const s = window.getSelection(); if (!s || !s.rangeCount || !root.contains(s.anchorNode)) { toast(t('de.hl.sel')); return; }
        const rg = s.getRangeAt(0);
        if (rg.collapsed) { toast(t('de.hl.sel')); return; }
        const pieces = textPieces(rg); if (!pieces.length) return;
        const markOf = nd => { const p = nd.parentNode; return p && p.tagName === 'MARK' ? p : null; };
        const allSame = pieces.every(nd => { const mk2 = markOf(nd); return mk2 && mk2.classList.contains('hl-' + color); });
        for (const nd of pieces) {
          const mk2 = markOf(nd);
          if (allSame) { mk2.replaceWith(...mk2.childNodes); continue; }
          if (mk2) { mk2.className = 'hl-' + color; continue; }
          const w = document.createElement('mark'); w.className = 'hl-' + color; nd.replaceWith(w); w.append(nd);
        }
        const keep = pieces.filter(nd => nd.isConnected);
        if (keep.length) { const r2 = document.createRange(); r2.setStartBefore(keep[0]); r2.setEndAfter(keep[keep.length - 1]); s.removeAllRanges(); s.addRange(r2); }
        root.focus({ preventScroll: true }); lightSync(); paintAll();
      };
      const clearHl = () => {
        restoreSel();
        const s = window.getSelection(); if (!s || !s.rangeCount || !root.contains(s.anchorNode)) return;
        const rg = s.getRangeAt(0);
        const marks = [...root.querySelectorAll('mark')].filter(x => rg.collapsed ? (x.contains(rg.startContainer)) : rg.intersectsNode(x));
        marks.forEach(x => x.replaceWith(...x.childNodes));
        lightSync(); paintAll();
      };
      const findHl = () => {
        const all = [...root.querySelectorAll('mark')]; if (!all.length) { toast(t('te.hl.none')); return; }
        const s = window.getSelection(); let nxt = null;
        if (s && s.rangeCount && root.contains(s.anchorNode)) { const rg = s.getRangeAt(0); nxt = all.find(x => rg.comparePoint(x, 0) > 0); }
        nxt = nxt || all[0];
        nxt.scrollIntoView({ block: 'center' }); const r2 = document.createRange(); r2.selectNodeContents(nxt); s.removeAllRanges(); s.addRange(r2); root.focus({ preventScroll: true }); paintSoon();
      };
      const hlPop = b => {
        const sw = PR_HL.map(c => h('button', { class: 'te-sw hl-' + c + (prHlColor(S.teHl) === c ? ' on' : ''), 'data-c': c, 'data-tip': t('te.hl.' + c), onmousedown: ev => ev.preventDefault(), onclick: () => { closePopover(); applyHl(c); } }, prHlColor(S.teHl) === c ? icon('check', 12, 2.4) : null));
        popover(b, h('div', { class: 'te-hlpop' }, h('div', { class: 'te-sws' }, ...sw),
          h('button', { class: 'btn sm te-hl-off', id: 'de-hl-off', onmousedown: ev => ev.preventDefault(), onclick: () => { closePopover(); clearHl(); } }, icon('x', 14), t('te.hl.off')),
          h('button', { class: 'btn sm te-hl-next', id: 'de-hl-next', onmousedown: ev => ev.preventDefault(), onclick: () => { closePopover(); findHl(); } }, icon('search', 14), t('te.hl.next')),
          h('div', { class: 'hint' }, t('te.hl.note'))), { cls: 'pick-pop' });
      };
      const hlBtn = h('button', { class: 'btn icon sm te-b te-hlbtn', id: 'de-b-hl', 'data-tip': t('te.tb.hl'), onmousedown: ev => ev.preventDefault(), onclick: () => applyHl(S.teHl) }, icon('palette', 16), hlBar);
      const hlMenuBtn = h('button', { class: 'btn icon sm te-b te-hlm', id: 'de-b-hlm', 'data-tip': t('te.tb.hlm'), onmousedown: ev => ev.preventDefault(), onclick: ev => hlPop(ev.currentTarget) }, icon('chevD', 12));
      paintHlBtn();
      const optsPop = b => {
        const o = S.prose = Object.assign({}, PR_DEFAULTS, S.prose || {});
        const sw = (k, label) => h('div', { class: 'te-opt' }, switchEl(o[k], v => { o[k] = v; saveSettings(); paintPv(); }, label));
        popover(b, h('div', { class: 'te-opts-box' }, sw('alternate', t('pr.opt.alt')), sw('split', t('pr.opt.split')), sw('keepAttr', t('pr.opt.attr'))), { cls: 'pick-pop' });
      };
      const exec = (cmd) => { root.focus({ preventScroll: true }); document.execCommand(cmd); };
      tb.append(
        styleBtn, h('span', { class: 'te-sep' }),
        tbBtn(null, t('de.tb.b'), () => exec('bold'), 'de-b-bold', 'B'), tbBtn(null, t('de.tb.i'), () => exec('italic'), 'de-b-ital', 'I'),
        hlBtn, hlMenuBtn,
        h('span', { class: 'te-sep' }),
        tbBtn('chat', t('de.tb.who'), b => { const r = cur(); if (r) pickChar(b, effectiveCast(r.n, r.f).all, c => speak(c)); }, 'de-b-who'),
        tbBtn('code', t('de.tb.cmd'), b => cmdMenu(b), 'de-b-cmd'),
        h('span', { class: 'te-sep' }),
        h('button', { class: 'btn sm te-b te-b-fork', id: 'de-b-fork', 'data-tip': t('te.tb.fork.tip'), onmousedown: ev => ev.preventDefault(), onclick: () => insertBlock('fork', '') }, icon('fork', 15), t('de.tb.fork')),
        h('button', { class: 'btn sm te-b', id: 'de-b-note', 'data-tip': t('te.tb.note.tip'), onmousedown: ev => ev.preventDefault(), onclick: () => insertBlock('note', '') }, icon('sticker', 15), t('de.tb.note')),
        h('button', { class: 'btn sm te-b', id: 'de-b-chap', 'data-tip': t('de.tb.chap.tip'), onmousedown: ev => ev.preventDefault(), onclick: () => setKind('h1') }, icon('flag', 15), t('de.tb.chap')),
        h('div', { class: 'grow' }),
        colBtn,
        h('button', { class: 'btn icon sm', id: 'de-opts', 'data-tip': t('de.opts'), onclick: ev => optsPop(ev.currentTarget) }, icon('sliders', 16)),
        hideL, hideR,
        h('button', { class: 'btn icon sm', id: 'de-focus', 'data-tip': t('de.focus'), onclick: () => { const on2 = !(S.teNoL && S.teNoR); setPane('l', on2, true); setPane('r', on2, true); saveSettings(); } }, icon('fit', 16)));

      /* ---------- карточка развилки ---------- */
      const paintFork = () => {
        const b = selBlock();
        if (!b || deKind(b) !== 'fork') { dock.hidden = true; forkEl = null; return; }
        const hh = h1Of(b); const r = hh && teFind(hh.dataset.f); if (!r) { dock.hidden = true; return; }
        forkEl = b; dock.hidden = false;
        const n = r.n, br = curBr();
        const outs = deOuts(n), mainE = brMainEdge(n);
        dock.replaceChildren(h('div', { class: 'te-fork-h' },
          h('span', { class: 'te-fork-i' }, icon('fork', 16)), h('b', t('de.fork.t')), h('span', { class: 'te-fork-w' }, t('de.fork.in', n.title)),
          outs.length ? h('span', { class: 'te-fork-n' }, t('te.fork.n', outs.length)) : null, h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', id: 'de-fork-map', onclick: () => focusNode(n.id) }, icon('target', 14), t('de.fork.map')),
          h('button', { class: 'btn icon sm', 'data-tip': t('de.fork.close'), onclick: () => { dock.hidden = true; forkEl = null; } }, icon('x', 14))));
        const note = deRaw(b).trim();
        if (note) dock.append(h('div', { class: 'te-fork-note' }, h('span', { class: 'lbl' }, t('de.fork.note')), note));
        if (!outs.length) dock.append(h('div', { class: 'te-fork-empty' }, t('de.fork.none')));
        const rows = h('div', { class: 'te-fork-list' });
        for (const e of outs) {
          const tn = nodeById(e.to), brief = teBrief(tn), isMain = e === mainE;
          const inDoc = br && br.nodes.some(x => x.id === tn.id);
          const tb2 = brOfNode(tn.id, list);
          const kind = tn.type === 'ending' ? t('te.fork.end') : tn.type === 'fork' ? t('te.fork.fk') : t('te.fork.ch');
          const go = () => { if (inDoc && isMain) { const f0 = tn.files[0]; if (f0) jumpToFile(f0.id); } else if (tb2) openDoc(tb2.id, { after: on, fid: tn.files[0] && tn.files[0].id }); };
          rows.append(h('div', { class: 'te-br de-fb' + (isMain ? ' main' : ''), 'data-to': tn.id },
            h('span', { class: 'dot big', style: { background: palColor(tn.color) } }),
            h('div', { class: 'te-br-t' },
              h('div', { class: 'te-br-h' }, h('b', e.title || t('te.fork.untitled')), h('span', { class: 'te-br-to' }, ' → ' + tn.title), h('span', { class: 'te-br-k' }, kind),
                isMain ? h('span', { class: 'de-main-chip' }, icon('flag', 11), t('de.fork.main')) : null, e.cond ? h('span', { class: 'te-br-c' }, t('te.fork.if', e.cond)) : null),
              h('div', { class: 'te-br-d' + (brief ? '' : ' none') }, brief || t('te.fork.empty')),
              isMain && inDoc ? h('div', { class: 'te-br-f' }, t('de.fork.here')) : null,
              !isMain && tb2 && tb2.joins ? h('div', { class: 'te-br-f' }, t('de.fork.joins', tb2.joins.title)) : null),
            h('div', { class: 'de-fb-b' },
              h('button', { class: 'btn sm primary te-br-go', onclick: go }, icon(inDoc && isMain ? 'down' : 'open', 14), inDoc && isMain ? t('de.fork.goto') : t('de.fork.open')),
              h('button', { class: 'btn icon sm de-fb-ren', 'data-tip': t('brl.ren'), onclick: async () => { const v = await promptDlg({ title: t('brl.ren'), label: t('brl.ren.l', tn.title), value: e.title || '', ok: t('brl.edit.ok'), empty: true }); if (v == null) return; await flush(true); e.title = v; commit(true); seen = DATA_VER; renderAll(); render({ keep: true }); toast(t('brl.ren.done')); } }, icon('type', 14)),
              !isMain && outs.length > 1 ? h('button', { class: 'btn sm de-setmain', onclick: async () => { await flush(true); brSetMain(e); commit(true); seen = DATA_VER; renderAll(); render({ keep: true }); toast(t('de.fork.setmain.done', tn.title)); } }, icon('flag', 13), t('de.fork.setmain')) : null)));
        }
        dock.append(rows, h('div', { class: 'de-fork-add' }, h('button', { class: 'btn sm', id: 'de-fork-add', onclick: async () => {
          const res = await brLinkDlg({ title: t('brl.add.t'), intro: t('brl.add.intro', n.title), modes: ['new', 'exist'], mode: 'new', name: brNameSuggest(n), exclude: new Set([n.id, ...outs.map(e => e.to)]), fallback: outs.length > 0 });
          if (!res) return;
          await flush(true);
          let target;
          if (res.mode === 'new') target = brAddNewBlock(n, res.name, res.arrow).node; else { brAddLink(n, res.node, res.arrow); target = res.node; }
          commit(true); seen = DATA_VER; renderAll(); list = brBranches();
          const nb = brOfNode(target.id, list);
          if (res.mode === 'new' && outs.length && nb) await openDoc(nb.id, { after: on }); else render({ keep: true });
          toast(res.mode === 'new' ? t('de.fork.added', res.name) : t('brl.linked', res.node.title));
        } }, icon('plus', 14), t('de.fork.add'))));
      };

      /* ---------- конец ветки: куда она ведёт ---------- */
      const afterGraph = async () => { commit(true); seen = DATA_VER; renderAll(); list = brBranches(); fixDocs(); persist(); render({ keep: true }); };
      const paintEnd = () => {
        endBar.replaceChildren(); endBar.hidden = true;
        const br = curBr(); if (!br || !br.nodes.length) return;
        const last = br.nodes[br.nodes.length - 1];
        if (last.type === 'ending') return;                           // у концовки продолжения нет
        const outsL = deOuts(last), je = br.joins ? brMainEdge(last) : null;
        const exclude = (extra) => new Set([last.id, ...outsL.filter(e => e !== extra).map(e => e.to)]);
        endBar.hidden = false;
        if (je && br.joins) {
          endBar.append(icon('link', 14), h('span', { class: 'de-end-t' }, t('brl.end.join', br.joins.title), je.title ? h('span', { class: 'de-end-via' }, ' · ' + t('brl.end.via', je.title)) : null), h('div', { class: 'grow' }),
            h('button', { class: 'btn sm', id: 'de-end-change', onclick: async () => {
              const res = await brLinkDlg({ title: t('brl.edit.t'), intro: t('brl.join.intro', br.title), modes: ['exist'], mode: 'exist', exclude: exclude(je), pre: je.to, arrow: je.title || '', ok: { exist: t('brl.edit.ok') }, fallback: false });
              if (!res) return;
              await flush(true); brRetarget(je, res.node, res.arrow); await afterGraph(); toast(t('brl.joined', res.node.title));
            } }, t('brl.end.change')),
            h('button', { class: 'btn sm', id: 'de-end-unlink', onclick: async () => {
              await flush(true); const to = br.joins.title; deleteEdge(je.id); await afterGraph(); toastUndo(t('brl.unlinked', to));
            } }, t('brl.end.unlink')));
          return;
        }
        endBar.append(icon('dot', 14), h('span', { class: 'de-end-t' }, t('brl.end.none', last.title)), h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', id: 'de-end-join', onclick: async () => {
            const res = await brLinkDlg({ title: t('brl.join.t'), intro: t('brl.join.intro', br.title), modes: ['exist', 'new'], mode: 'exist', name: brNameSuggest(last), exclude: exclude(), fallback: outsL.length > 0, ok: { exist: t('brl.end.joinbtn').replace('…', '') } });
            if (!res) return;
            await flush(true);
            if (res.mode === 'new') brAddNewBlock(last, res.name, res.arrow); else brAddLink(last, res.node, res.arrow);
            await afterGraph(); toast(res.mode === 'new' ? t('de.fork.added', res.name) : t('brl.joined', res.node.title));
          } }, icon('link', 14), t('brl.end.joinbtn')),
          h('button', { class: 'btn sm', id: 'de-end-new', onclick: async () => {
            const res = await brLinkDlg({ title: t('brl.add.t'), intro: t('brl.add.intro', last.title), modes: ['new', 'exist'], mode: 'new', name: brNameSuggest(last), exclude: exclude(), fallback: outsL.length > 0 });
            if (!res) return;
            await flush(true);
            if (res.mode === 'new') brAddNewBlock(last, res.name, res.arrow); else brAddLink(last, res.node, res.arrow);
            await afterGraph(); toast(res.mode === 'new' ? t('de.fork.added', res.name) : t('brl.linked', res.node.title));
          } }, icon('plus', 14), t('brl.end.newbtn')));
      };

      /* ---------- общий пересбор ---------- */
      const paintAll = () => { paintTabs(); paintLists(); paintInfo(); paintBanners(); paintSec(); paintPv(); paintStat(); paintFoot(); paintStyleBtn(); paintFork(); paintEnd(); };
      const paintSoon = () => { clearTimeout(selT); selT = setTimeout(() => { if (m.closed) return; paintSec(); paintBanners(); paintStat(); paintStyleBtn(); paintFork(); const r = cur(); if (pvKey !== (r ? r.f.id : '')) paintPv(); }, 120); };

      /* ---------- события ---------- */
      root.addEventListener('input', ev => {
        normalize(false);
        if (ev.inputType === 'insertParagraph') fixEnter();
        lastTouch = Date.now(); saved.textContent = t('te.saving');
        lightSync();
        clearTimeout(pvT); pvT = setTimeout(() => { saved.textContent = t('te.saved'); paintSec(); paintPv(); paintBanners(); paintLists(); paintStat(); paintStyleBtn(); paintFork(); paintEnd(); }, 260);
        scheduleIdle();
      });
      root.addEventListener('keydown', ev => {
        const mod = ev.ctrlKey || ev.metaKey, key = ev.key;
        if (mod && !ev.altKey && !ev.shiftKey && /^[bBиИiIшШ]$/.test(key)) { ev.stopPropagation(); return; }   // жирный и курсив делает браузер; Ctrl+B на карте открывает сборку, сюда его пускать не надо
        if (mod && !ev.altKey && ev.shiftKey && /^[hHрР]$/.test(key)) { ev.preventDefault(); applyHl(S.teHl); return; }
        if (mod && !ev.altKey && (/^(Equal|NumpadAdd)$/.test(ev.code) || key === '+')) { ev.preventDefault(); zoomStep(1); return; }
        if (mod && !ev.altKey && (/^(Minus|NumpadSubtract)$/.test(ev.code) || key === '-')) { ev.preventDefault(); zoomStep(-1); return; }
        if (mod && !ev.altKey && !ev.shiftKey && /^(Digit0|Numpad0)$/.test(ev.code)) { ev.preventDefault(); setZoom(100); return; }
        if (mod && !ev.altKey && (/^[zZяЯ]$/.test(key) && !ev.shiftKey || /^[yYнН]$/.test(key) && !ev.shiftKey || /^[zZяЯ]$/.test(key) && ev.shiftKey)) {
          ev.preventDefault(); const redoIt = /^[yYнН]$/.test(key) || ev.shiftKey; flushNow(); redoIt ? redo() : undo(); return;
        }
        if (mod && ev.altKey && /^[0-3]$/.test(ev.code.replace('Digit', '')) ) { ev.preventDefault(); setKind(['p', 'h1', 'h2', 'h3'][+ev.code.replace('Digit', '')]); return; }
        if (key === 'Enter' && ev.shiftKey) { ev.preventDefault(); document.execCommand('insertParagraph'); return; }
        if (mod && ev.shiftKey && /^[vVмМ]$/.test(key)) plainNext = true;
        /* Backspace в начале абзаца под заголовком и Delete в конце заголовка не должны вливать текст в название блока */
        if ((key === 'Backspace' || key === 'Delete') && !mod && !ev.altKey && inRoot() && window.getSelection().isCollapsed) {
          const s = window.getSelection(), b = selBlock();
          if (b) {
            const r0 = document.createRange(); r0.selectNodeContents(b); try { r0.setEnd(s.anchorNode, s.anchorOffset); } catch (e) { return; }
            const off = r0.toString().replace(/[\u200b\ufeff]/g, '').length, pv = b.previousElementSibling;
            if (key === 'Backspace' && off === 0 && !deIsHead(b) && pv && deIsHead(pv)) {
              ev.preventDefault();
              if (!deRaw(b).trim() && b.nextElementSibling) { b.remove(); lightSync(); }
              deSetCaret(pv, deRaw(pv).length); paintSoon(); return;
            }
            if (key === 'Delete' && deIsHead(b) && off >= deRaw(b).length && b.nextElementSibling && !deIsHead(b.nextElementSibling)) { ev.preventDefault(); return; }
          }
        }
      });
      root.addEventListener('beforeinput', ev => {
        if (ev.inputType === 'historyUndo') { ev.preventDefault(); flushNow(); undo(); } else if (ev.inputType === 'historyRedo') { ev.preventDefault(); flushNow(); redo(); }
        else if (ev.inputType === 'formatBold' || ev.inputType === 'formatItalic') { /* оставляем браузеру */ }
      });
      let plainNext = false;
      const insertMd = md => {
        const lines = md.replace(/\r/g, '').split('\n');
        if (lines.length === 1) { const r = deLine(lines[0]); if (r.k === 'p') { document.execCommand('insertHTML', false, r.html); return; } }
        const html = lines.map(l => { const r = deLine(l); return deMake(r.k, r.html, r.lv); }).join('');
        document.execCommand('insertHTML', false, html);
      };
      root.addEventListener('paste', ev => {
        const cd = ev.clipboardData; if (!cd) return;
        ev.preventDefault();
        const own = cd.getData('application/x-vnmap-md');
        if (plainNext) { plainNext = false; document.execCommand('insertText', false, cd.getData('text/plain')); return; }
        if (own) { insertMd(own); return; }
        const html = cd.getData('text/html');
        if (html && /<(h[1-6]|p|div|span|b|i|strong|em|li|br)\b/i.test(html)) {
          const md = diHtmlToMd(html, { title: '% ' });
          if (md.trim() && md.trim() !== cd.getData('text/plain').trim()) { insertMd(md); toast(/^#\s/m.test(md) ? t('de.pasteht') : t('de.pasted'), 3600); return; }
        }
        insertMd(cd.getData('text/plain'));
      });
      const copyOut = (ev, cut) => {
        const s = window.getSelection(); if (!s || !s.rangeCount || s.isCollapsed || !root.contains(s.anchorNode)) return;
        const md = deRange(s.getRangeAt(0)); ev.clipboardData.setData('text/plain', md); ev.clipboardData.setData('application/x-vnmap-md', md); ev.preventDefault();
        if (cut) document.execCommand('delete');
      };
      root.addEventListener('copy', ev => copyOut(ev, false));
      root.addEventListener('cut', ev => copyOut(ev, true));
      root.addEventListener('dragstart', ev => { ev.preventDefault(); });
      wrap.addEventListener('dragover', ev => { if ([...(ev.dataTransfer && ev.dataTransfer.types || [])].includes('Files')) { ev.preventDefault(); m.card.classList.add('te-drag'); } });
      wrap.addEventListener('dragleave', ev => { if (!wrap.contains(ev.relatedTarget)) m.card.classList.remove('te-drag'); });
      wrap.addEventListener('drop', ev => { m.card.classList.remove('te-drag'); const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (f && DI_FILE_RE.test(f.name || '')) { ev.preventDefault(); const c = cur(); openDocImport({ file: f, fileId: c ? c.f.id : '' }); } });
      const onSel = () => {
        if (m.closed) return;
        if (inRoot()) { const s = window.getSelection(); lastRg = s.getRangeAt(0).cloneRange(); }
        const b = inRoot() ? selBlock() : null; if (!b) return;
        paintSoon(); savePosSoon();
        if (!(deIsHead(b) && !b.dataset.f && !b.dataset.nh) && pendingH1().length) { clearTimeout(idleT); idleT = setTimeout(() => flush(true), 250); }
      };
      document.addEventListener('selectionchange', onSel);
      ed.addEventListener('scroll', savePosSoon, { passive: true });
      search.addEventListener('input', () => { listQ = search.value; paintLists(); });
      root.addEventListener('focus', () => { try { document.execCommand('defaultParagraphSeparator', false, 'p'); document.execCommand('styleWithCSS', false, false); } catch (e) { /* не страшно */ } });
      root.addEventListener('blur', () => { if (!busy && !m.closed) { clearTimeout(idleT); idleT = setTimeout(() => flush(true), 120); } });

      /* внешние изменения: отмена, карта, другое окно */
      timer = setInterval(() => {
        if (m.closed) return;
        if (DATA_VER === seen) return;
        if (busy || Date.now() - lastTouch < 800) return;
        seen = DATA_VER;
        list = brBranches(); fixDocs();
        const br = curBr();
        const model = br ? br.nodes.flatMap(n => deHeads(n).map(hd => ({ n, hd }))) : [];
        const rd = deRead(root, true);
        let stale = model.map(x => x.hd.lv + ':' + (x.hd.f ? x.hd.f.id : 'n' + x.n.id)).join(',') !== rd.secs.map(s => s.lv + ':' + (s.fid || 'n' + s.nid)).join(',');
        if (!stale) {
          for (let i = 0; i < model.length && !stale; i++) { const s = rd.secs[i], { n, hd } = model[i]; if (s.title !== hd.title || (hd.f && deBlocksMd(s.blocks) !== deNorm(hd.f.text))) stale = true; }
        }
        persist();
        if (stale) render({ keep: true }); else paintAll();
      }, 600);

      left.append(h('div', { class: 'te-lh' }, h('b', t('de.branches')), h('button', { class: 'btn sm te-imp', id: 'de-import', 'data-tip': t('di.btn'), onclick: () => { const c = cur(); openDocImport({ fileId: c ? c.f.id : '' }); } }, icon('upload', 14), t('te.import'))),
        h('div', { class: 'te-ls' }, search), brBox, h('div', { class: 'te-lh de-lh2' }, h('b', t('de.outline'))), olBox);
      mid.append(info, banners, tb, ed, endBar, dock);
      right.append(secCard, pvHead, pvBody);
      const mhead = modalHead(t('te.title'), m, h('button', { class: 'btn icon sm help-q-btn', id: 'de-help', 'data-tip': t('de.help'), onclick: () => openHelp('editor') }, icon('help', 16)));
      winControl(m, mhead, 'texted');
      wrap.append(mhead, tabBar, h('div', { class: 'te-body' }, railL, left, mid, right, railR), foot);
      setPane('l', !!S.teNoL, true); setPane('r', !!S.teNoR, true);
      setZoom(curZoom(), true);
      render();
      if (focusF) setTimeout(() => jumpToFile(focusF), 30); else setTimeout(() => { if (!m.closed && !applyPos(posOf(on))) root.focus({ preventScroll: true }); }, 40);
      return wrap;
    }
  });
  return m;
}

/** «Подхватить» сценарий главы в текст. Возвращает { lines, same }: same — собранный обратно сценарий совпадает с исходным (синхронизация пройдёт без конфликта). */
function dePickup(n, f) {
  const txt = prFromScript(n, f);
  f.text = txt;
  const norm = x => String(x).split('\n').filter(l => l.trim()).map(l => l.replace(/\s+$/, '')).join('\n');
  let same = false;
  try { same = norm(prBuild(n, f).code) === norm(f.script); } catch (e) { same = false; }
  if (same) f.textOut = prHash(f.script);
  return { lines: txt.split('\n').filter(l => l.trim()).length, same };
}

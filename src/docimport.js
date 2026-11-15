'use strict';
/* ====== Импорт текста из Google Docs и Word ======
   Любой документ сначала превращается в простой текст с разметкой (диалекты Markdown):
     # Заголовок 1 … ###### Заголовок 6      % Название документа (стиль «Название»)
     **жирный**   *курсив*                   пустая строка между абзацами
   Дальше текст одинаково разбирается на главы по заголовкам (diParse), и каждая глава попадает в проект:
   в новый блок на карте, в новую главу выбранного блока или в уже существующую главу (по названию или по прошлому импорту).
   У главы запоминается, откуда она (f.src: файл, время, отпечаток текста, ключ заголовка). Благодаря отпечатку при повторном импорте
   видно, что изменилось в документе, а что у вас, и ничего не затирается молча. Документ целиком программа не хранит. */

Object.assign(D, {
  'di.btn': ['Импорт из Google Docs и Word…', 'Import from Google Docs and Word…'],
  'di.title': ['Импорт из Google Docs и Word', 'Import from Google Docs and Word'],
  'di.how': ['Откройте документ в Google Docs, выделите всё (Ctrl+A), скопируйте (Ctrl+C) и вставьте сюда (Ctrl+V): заголовки, жирный и курсив сохранятся. Или скачайте документ (Файл → Скачать → Microsoft Word) и выберите файл. Подойдут .docx, .html, .txt и .md. Можно просто перетащить файл в это окно.',
    'Open the document in Google Docs, select all (Ctrl+A), copy (Ctrl+C) and paste it here (Ctrl+V): headings, bold and italic are kept. Or download it (File → Download → Microsoft Word) and pick the file. .docx, .html, .txt and .md work. You can also drop a file into this window.'],
  'di.paste.ph': ['Вставьте сюда текст документа…', 'Paste the document text here…'],
  'di.pick': ['Выбрать файл…', 'Choose a file…'],
  'di.clear': ['Очистить', 'Clear'],
  'di.drop': ['Отпустите файл, чтобы загрузить его', 'Drop the file to load it'],
  'di.src.file': ['Файл «{0}»', 'File “{0}”'], 'di.src.paste': ['Вставленный текст', 'Pasted text'],
  'di.err.read': ['Не удалось прочитать файл «{0}». Для Word нужен формат .docx (не старый .doc).', 'Could not read “{0}”. For Word use .docx (not the old .doc).'],
  'di.err.type': ['Этот тип файла не поддерживается. Подойдут .docx, .html, .txt и .md.', 'This file type is not supported. Use .docx, .html, .txt or .md.'],
  'di.opt.split': ['Делить на главы по', 'Split into chapters by'],
  'di.split.auto': ['Авто', 'Auto'], 'di.split.none': ['Не делить', 'No split'],
  'di.split.h': ['Заголовку {0}', 'Heading {0}'],
  'di.opt.detect': ['Если заголовков нет, считать заголовками «Глава 1», «Часть 2»…', 'With no headings, treat “Chapter 1”, “Part 2”… as headings'],
  'di.opt.chain': ['Соединить новые блоки стрелками по порядку', 'Connect new blocks with arrows in order'],
  'di.opt.sync': ['Сразу собрать сценарий из текста новых глав и вести его из текста', 'Build the script from the text of new chapters right away and keep it in sync'],
  'di.found': ['В документе: слов {0}, глав {1}', 'In the document: {0} words, {1} chapters'],
  'di.title.of': ['Название документа: «{0}»', 'Document title: “{0}”'],
  'di.none': ['Пока ничего не загружено.', 'Nothing loaded yet.'],
  'di.empty': ['В документе нет текста.', 'The document has no text.'],
  'di.col.title': ['Глава', 'Chapter'], 'di.col.words': ['Слов', 'Words'], 'di.col.to': ['Куда', 'Where'], 'di.col.state': ['Состояние', 'State'],
  'di.to.new': ['Новый блок', 'New block'],
  'di.to.node': ['Новая глава в блоке «{0}»', 'New chapter in block “{0}”'],
  'di.to.file': ['Глава «{0}»', 'Chapter “{0}”'],
  'di.to.pick': ['Заменить текст главы…', 'Replace a chapter’s text…'],
  'di.to.skip': ['Не импортировать', 'Do not import'],
  'di.to.shortcut': ['Все новые главы — в блок «{0}»', 'All new chapters go to block “{0}”'],
  'di.to.shortcut.new': ['Все новые главы — в новые блоки', 'All new chapters go to new blocks'],
  'di.st.new': ['новая', 'new'], 'di.st.same': ['совпадает', 'same'],
  'di.st.empty': ['пустая у вас', 'empty here'],
  'di.st.doc': ['изменена в документе', 'changed in the document'],
  'di.st.mine': ['изменена только у вас', 'changed only here'],
  'di.st.conflict': ['разные тексты', 'texts differ'],
  'di.st.nobase': ['текст уже есть', 'text already here'],
  'di.st.blank': ['пусто в документе', 'empty in the document'],
  'di.tip.doc': ['Текст в проекте не менялся с прошлого импорта: можно безопасно обновить', 'The text here has not changed since the last import: safe to update'],
  'di.tip.mine': ['Вы правили главу, а документ не менялся: по умолчанию остаётся ваш текст', 'You edited the chapter and the document did not change: your text stays by default'],
  'di.tip.conflict': ['Текст и в проекте, и в документе отличается. Посмотрите отличия и решите сами: по умолчанию остаётся ваш текст', 'The text differs in the project and in the document. Look at the differences and decide: your text stays by default'],
  'di.tip.nobase': ['У этой главы уже есть свой текст, и неизвестно, откуда он. Посмотрите отличия и решите сами', 'This chapter already has text of unknown origin. Look at the differences and decide'],
  'di.diff': ['Отличия', 'Differences'],
  'di.diff.t': ['Сравнение: «{0}»', 'Comparison: “{0}”'],
  'di.diff.legend': ['красным: только у вас, зелёным: только в документе', 'red: only in your text, green: only in the document'],
  'di.diff.same': ['Тексты совпадают.', 'The texts are the same.'],
  'di.diff.fold': ['… одинаковых строк: {0} …', '… same lines: {0} …'],
  'di.diff.doc': ['Взять из документа', 'Take the document’s text'],
  'di.diff.mine': ['Оставить своё', 'Keep mine'],
  'di.sum': ['Будет создано блоков: {0}, глав в блоках: {1}, обновится глав: {2}, пропущено: {3}', 'To create: {0} blocks, {1} chapters in blocks, {2} chapters to update, {3} skipped'],
  'di.sum.over': ['Заменит ваш текст в главах: {0} (отменить можно)', 'Will replace your text in {0} chapters (undo works)'],
  'di.go': ['Импортировать', 'Import'],
  'di.nothing': ['Нечего импортировать: отметьте хотя бы одну главу', 'Nothing to import: tick at least one chapter'],
  'di.done': ['Импорт завершён', 'Import finished'],
  'di.done.sum': ['Создано блоков: {0}, глав в блоках: {1}, обновлено глав: {2}', 'Created blocks: {0}, chapters in blocks: {1}, updated chapters: {2}'],
  'di.done.open': ['Открыть в редакторе', 'Open in the editor'],
  'di.done.close': ['Закрыть', 'Close'],
  'di.done.toast': ['Импортировано глав: {0}', 'Chapters imported: {0}'],
  'di.warn.cmd': ['Строк, которые начинаются с @ или //: {0}. Редактор текста воспримет их как команды и заметки, а не как слова.', 'Lines starting with @ or //: {0}. The text editor treats them as commands and notes, not as words.'],
  'di.src.chip': ['Из документа «{0}», импорт {1}', 'From document “{0}”, imported {1}'],
  'di.src.chip.paste': ['Из вставленного текста, импорт {0}', 'From pasted text, imported {0}'],
  'di.node.btn': ['Импорт из документа…', 'Import from a document…'],
  'di.opt.lay': ['Раскладка', 'Layout'],
  'di.lay.flat': ['Каждая глава — отдельный блок', 'Every chapter is a separate block'],
  'di.lay.tree': ['Заголовок {0} — блок, заголовок {1} — глава в нём', 'Heading {0} is a block, heading {1} is a chapter inside it'],
  'di.lay.hint': ['В блоке карты глав может быть несколько: это файлы внутри него. Так документ ложится на карту так же, как выглядит в редакторе текста.', 'A map block can hold several chapters: they are files inside it. This is how the document maps onto blocks, the same way the text editor shows it.'],
  'di.found.tree': ['В документе: слов {0}, блоков {1}, глав {2}', 'In the document: {0} words, {1} blocks, {2} chapters'],
  'di.to.ingroup': ['В блок выше', 'Into the block above'],
  'di.to.solo': ['Отдельный новый блок', 'A separate new block'],
  'di.to.gnew': ['Новый блок', 'New block'],
  'di.to.gnode': ['В блок «{0}»', 'Into block “{0}”'],
  'di.to.gpick': ['Выбрать существующий блок…', 'Pick an existing block…'],
  'di.to.gskip': ['Не импортировать этот блок', 'Do not import this block'],
  'di.to.inblock': ['Новая глава в блоке…', 'New chapter in a block…'],
  'di.to.below': ['Эта и все ниже — в блок…', 'This and all below — into a block…'],
  'di.to.backgrp': ['В блок группы', 'Into the group’s block'],
  'di.pickblock.t': ['В какой блок положить', 'Which block to put into'],
  'di.pickblock.gt': ['В какой блок положить «{0}»', 'Which block to put “{0}” into'],
  'di.pickblock.intro': ['Главы станут файлами выбранного блока. Блок остаётся на своём месте.', 'The chapters become files of the chosen block. The block stays where it is.'],
  'di.pickblock.ok': ['Выбрать', 'Choose'],
  'di.st.gfound': ['блок найден', 'block found'],
  'di.tip.gfound': ['Название совпало с блоком на карте: главы пойдут в него', 'The name matches a block on the map: the chapters go into it'],
  'di.busy': ['Импортируем…', 'Importing…'],
  'di.part': ['Вступление', 'Introduction'],
  'di.section': ['Глава {0}', 'Chapter {0}'],
});

/* ================= 1. Документ → текст с разметкой ================= */
const DI_FILE_RE = /\.(docx|html?|txt|md|markdown)$/i;
const DI_SKIP = new Set(['script', 'style', 'head', 'meta', 'link', 'title', 'noscript', 'template', 'svg', 'img']);
const DI_BLOCK = new Set(['p', 'div', 'li', 'ul', 'ol', 'tr', 'td', 'th', 'table', 'tbody', 'thead', 'tfoot', 'blockquote', 'section', 'article', 'pre', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'center', 'body', 'html', 'header', 'footer', 'main', 'aside', 'nav', 'address']);

function diLastProp(style, prop) {
  let v = null; const re = new RegExp('(?:^|[;\\s])' + prop + '\\s*:\\s*([^;]+)', 'gi'); let m;
  while ((m = re.exec(style))) v = m[1].trim().toLowerCase();
  return v;
}
const diIsBold = s => { const v = diLastProp(s, 'font-weight'); return v == null ? null : v === 'bold' || v === 'bolder' || (+v >= 600); };
const diIsItalic = s => { const v = diLastProp(s, 'font-style'); return v == null ? null : /italic|oblique/.test(v); };
const diPt = s => { const v = diLastProp(s, 'font-size'); if (!v) return null; const m = v.match(/([\d.]+)\s*(pt|px)?/); if (!m) return null; return +m[1] * (m[2] === 'px' ? 0.75 : 1); };

/** Цвет фона/выделения → один из цветов маркера или '' (прозрачный, белый, серая бумага). */
function diHlName(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510, d = mx - mn;
  if (l > 0.96 || l < 0.04) return '';
  const sat = d === 0 ? 0 : d / (255 - Math.abs(mx + mn - 255));
  if (sat < 0.18) return d === 0 && l > 0.9 ? '' : 'gray';
  let hue; if (mx === r) hue = ((g - b) / d + 6) % 6; else if (mx === g) hue = (b - r) / d + 2; else hue = (r - g) / d + 4; hue *= 60;
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 40) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 170) return 'green';
  if (hue < 255) return 'blue';
  if (hue < 290) return 'purple';
  return 'pink';
}
function diCssColor(v) {
  v = String(v || '').trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'none' || v === 'inherit' || v === 'initial' || v === 'white' || v === 'auto') return '';
  let m = v.match(/^#([0-9a-f]{6})$/); if (m) return diHlName(parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16));
  m = v.match(/^#([0-9a-f]{3})$/); if (m) return diHlName(parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16));
  m = v.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/); if (m) return (m[4] != null && +m[4] === 0) ? '' : diHlName(+m[1], +m[2], +m[3]);
  const named = { yellow: 'yellow', lime: 'green', green: 'green', cyan: 'blue', aqua: 'blue', blue: 'blue', magenta: 'pink', fuchsia: 'pink', pink: 'pink', red: 'red', orange: 'orange', purple: 'purple', gray: 'gray', grey: 'gray', silver: 'gray' };
  return named[v] || '';
}
/** Фон из стиля: undefined (не задан), '' (прозрачный), либо цвет маркера. */
function diBgProp(style) {
  const v = diLastProp(style, 'background-color') || (() => { const b = diLastProp(style, 'background'); return b ? (b.match(/#[0-9a-f]{3,6}\b|rgba?\([^)]*\)|[a-z]+/i) || [''])[0] : null; })();
  return v == null ? undefined : diCssColor(v);
}
/** Запуски текста → строка с ** и *, выделением ==…==. Пробелы по краям запуска остаются снаружи разметки. */
function diRuns(runs, plain) {
  const segs = [];
  for (const r of runs) {
    if (!r.t) continue;
    const hl = plain ? '' : (r.hl || '');
    const last = segs[segs.length - 1];
    if (last && last.b === r.b && last.i === r.i && last.hl === hl) last.t += r.t; else segs.push({ t: r.t, b: r.b, i: r.i, hl });
  }
  const fmt = sg => {
    const m = sg.t.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (plain || !m[2] || (!sg.b && !sg.i)) return sg.t;
    const mark = sg.b && sg.i ? '***' : sg.b ? '**' : '*';
    return m[1] + mark + m[2] + mark + m[3];
  };
  let out = '';
  for (let k = 0; k < segs.length;) {
    let j = k; while (j < segs.length && segs[j].hl === segs[k].hl) j++;
    const inner = segs.slice(k, j).map(fmt).join('');
    const hl = segs[k].hl;
    if (hl) { const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/); out += m[2] ? m[1] + (hl === 'yellow' ? '==' : '=={' + hl + '}') + m[2] + '==' + m[3] : inner; }
    else out += inner;
    k = j;
  }
  return out.replace(/[ \t]+/g, ' ').replace(/^ +| +$/g, '');
}
/** Склейка разметки: `*a* *b*` остаётся как есть, а `**a****b**` (сосед с тем же стилем) схлопывается. */
const diTidy = s => s.replace(/\*\*\*\*/g, '').replace(/(\*\*|\*)( +)\1/g, '$2');

/** HTML (буфер обмена Google Docs, файл .html, Word) → текст с разметкой. opts.title: чем писать «Название» (по умолчанию «% »). */
function diHtmlToMd(html, opts = {}) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const cls = {};
  doc.querySelectorAll('style').forEach(st => { String(st.textContent).replace(/\.([\w-]+)\s*\{([^}]*)\}/g, (m, c, body) => { cls[c] = (cls[c] || '') + ';' + body; }); });
  const styleOf = el => { let s = ''; const c = el.getAttribute('class'); if (c) for (const k of c.split(/\s+/)) if (cls[k]) s += ';' + cls[k]; return s + ';' + (el.getAttribute('style') || ''); };
  const lines = []; let runs = [];
  const has = () => runs.some(r => r.t.trim());
  const flush = (head, titleHint) => {
    const maxSz = runs.reduce((a, r) => Math.max(a, r.sz || 0), 0);
    const plain = head || (!head && maxSz >= 22 && has()) || titleHint;
    let s = diTidy(diRuns(runs, !!plain)); runs = [];
    if (!s.trim()) return false;
    if (head) s = '#'.repeat(head) + ' ' + s;
    else if (plain) s = (opts.title || '% ') + s;
    lines.push(s); return true;
  };
  const addText = (txt, c) => {
    let x = String(txt).replace(/ /g, ' ').replace(/\u000b/g, '\n');
    if (!c.pre) x = x.replace(/[ \t\r\n\f]+/g, ' ');
    if (!runs.length && !x.trim()) return;
    if (c.pre) { const parts = x.split('\n'); parts.forEach((p, i) => { if (i) { flush(); } if (p) runs.push({ t: p, b: !!c.b && !c.plain, i: !!c.i && !c.plain, hl: c.hl, sz: c.sz }); }); return; }
    runs.push({ t: x, b: !!c.b && !c.plain, i: !!c.i && !c.plain, hl: c.hl, sz: c.sz });
  };
  const walk = (el, c) => {
    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) { addText(ch.nodeValue, c); continue; }
      if (ch.nodeType !== 1) continue;
      const tag = ch.tagName.toLowerCase();
      if (DI_SKIP.has(tag)) continue;
      const st = styleOf(ch);
      if (/display\s*:\s*none/i.test(st)) continue;
      if (tag === 'br') { if (has()) flush(); else if (lines.length && lines[lines.length - 1] !== '') lines.push(''); else if (!lines.length) { /* пустая строка в начале не нужна */ } else lines.push(''); continue; }
      if (tag === 'hr') { flush(); lines.push(''); continue; }
      const b0 = diIsBold(st), i0 = diIsItalic(st), pt = diPt(st);
      const c2 = { b: b0 != null ? b0 : (tag === 'b' || tag === 'strong' || tag === 'th') ? true : c.b, i: i0 != null ? i0 : (tag === 'i' || tag === 'em' || tag === 'cite') ? true : c.i, sz: pt || c.sz, plain: c.plain, pre: c.pre || tag === 'pre', hl: (() => { const bg = DI_BLOCK.has(tag) || /^h[1-6]$/.test(tag) ? undefined : diBgProp(st); return bg !== undefined ? bg : (tag === 'mark' ? 'yellow' : c.hl); })() };
      if (/^h[1-6]$/.test(tag)) {
        flush(); c2.plain = true; walk(ch, c2); flush(+tag[1]); continue;
      }
      if (DI_BLOCK.has(tag)) {
        flush();
        const before = lines.length;
        const titleHint = /\btitle\b/i.test(ch.getAttribute('class') || '') && tag === 'p';
        walk(ch, c2);
        const wrote = flush(0, titleHint);
        if ((tag === 'p' || tag === 'li') && !wrote && lines.length === before && lines.length && lines[lines.length - 1] !== '') lines.push('');
        continue;
      }
      walk(ch, c2);
    }
  };
  walk(doc.body || doc.documentElement, { b: false, i: false, sz: null, hl: '' });
  flush();
  return diCleanLines(lines);
}
/** Лишние пустые строки (больше одной подряд, в начале и в конце) убираем. */
function diCleanLines(lines) {
  const out = [];
  for (const l of lines) { if (l === '' && (!out.length || out[out.length - 1] === '')) continue; out.push(l); }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

/** .docx → текст с разметкой. */
async function diDocxToMd(buf, opts = {}) {
  const files = await readZip(buf);
  const get = n => { const f = files.find(x => x.name === n); return f ? new TextDecoder('utf-8').decode(f.data) : ''; };
  const body = get('word/document.xml');
  if (!body) throw new Error('docx');
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const kids = (el, name) => [...el.children].filter(x => x.localName === name && x.namespaceURI === W);
  const kid = (el, name) => kids(el, name)[0] || null;
  const attr = (el, name) => el ? (el.getAttributeNS(W, name) || el.getAttribute('w:' + name) || '') : '';
  const flag = el => { if (!el) return null; const v = attr(el, 'val').toLowerCase(); return !(v === '0' || v === 'false' || v === 'off' || v === 'none'); };
  /* стили: id → { name, b, i, lv } */
  const styles = {};
  const sx = get('word/styles.xml');
  if (sx) {
    const sd = xml(sx);
    for (const st of sd.getElementsByTagNameNS(W, 'style')) {
      const id = attr(st, 'styleId'), nm = attr(kid(st, 'name'), 'val');
      const rpr = kid(st, 'rPr'), ppr = kid(st, 'pPr');
      let lv = null;
      const hm = nm.match(/^(?:heading|заголовок)\s*(\d)$/i);
      if (hm) lv = +hm[1]; else if (/^(title|название|заголовок документа)$/i.test(nm)) lv = 0;
      else if (ppr && kid(ppr, 'outlineLvl')) { const o = +attr(kid(ppr, 'outlineLvl'), 'val'); if (o >= 0 && o < 9) lv = o + 1; }
      styles[id] = { name: nm, b: rpr ? flag(kid(rpr, 'b')) : null, i: rpr ? flag(kid(rpr, 'i')) : null, lv, basedOn: attr(kid(st, 'basedOn'), 'val') };
    }
  }
  const styleLv = id => { let k = 0; while (id && styles[id] && k++ < 6) { if (styles[id].lv != null) return styles[id].lv; id = styles[id].basedOn; } return null; };
  const styleFlag = (id, f) => { let k = 0; while (id && styles[id] && k++ < 6) { if (styles[id][f] != null) return styles[id][f]; id = styles[id].basedOn; } return null; };
  const d = xml(body);
  const lines = [];
  const skip = el => { for (let a = el.parentNode; a; a = a.parentNode) { if (a.localName === 'txbxContent' || a.localName === 'Fallback') return true; } return false; };
  for (const p of d.getElementsByTagNameNS(W, 'p')) {
    if (skip(p)) continue;
    const ppr = kid(p, 'pPr'), pst = ppr ? attr(kid(ppr, 'pStyle'), 'val') : '';
    let lv = styleLv(pst);
    if (lv == null && ppr && kid(ppr, 'outlineLvl')) { const o = +attr(kid(ppr, 'outlineLvl'), 'val'); if (o >= 0 && o < 9) lv = o + 1; }
    const pb = styleFlag(pst, 'b'), pi = styleFlag(pst, 'i');
    const runs = [];
    for (const r of p.getElementsByTagNameNS(W, 'r')) {
      if (skip(r)) continue;
      const rpr = kid(r, 'rPr'), rst = rpr ? attr(kid(rpr, 'rStyle'), 'val') : '';
      let b = rpr ? flag(kid(rpr, 'b')) : null, i = rpr ? flag(kid(rpr, 'i')) : null;
      if (b == null) b = styleFlag(rst, 'b'); if (i == null) i = styleFlag(rst, 'i');
      if (b == null) b = pb; if (i == null) i = pi;
      let hl = '';
      if (rpr) {
        const hv = attr(kid(rpr, 'highlight'), 'val').toLowerCase();
        if (hv) hl = { yellow: 'yellow', green: 'green', darkgreen: 'green', cyan: 'blue', darkcyan: 'blue', blue: 'blue', darkblue: 'blue', magenta: 'pink', darkmagenta: 'purple', red: 'red', darkred: 'red', darkyellow: 'orange', lightgray: 'gray', darkgray: 'gray' }[hv] || '';
        else { const fill = attr(kid(rpr, 'shd'), 'fill'); if (/^[0-9a-f]{6}$/i.test(fill)) hl = diCssColor('#' + fill); }
      }
      b = !!b && lv == null; i = !!i && lv == null; if (lv != null) hl = '';   // в заголовках разметка не нужна
      for (const x of r.children) {
        if (x.namespaceURI !== W) continue;
        const nm = x.localName;
        if (nm === 't') runs.push({ t: x.textContent, b, i, hl });
        else if (nm === 'tab' || nm === 'ptab') runs.push({ t: ' ', b: false, i: false, hl: '' });
        else if (nm === 'noBreakHyphen') runs.push({ t: '-', b, i, hl });
        else if (nm === 'br' || nm === 'cr') { if (attr(x, 'type') !== 'page') runs.push({ t: '\n', b: false, i: false, hl: '' }); }
      }
    }
    // мягкие переносы строк внутри абзаца → отдельные строки
    const text = diTidy(diRuns(runs.map(r => ({ t: r.t.replace(/ /g, ' '), b: r.b, i: r.i, hl: r.hl })), lv != null));
    const parts = text.split('\n').map(s => s.trim());
    if (lv == null) { if (!text.trim()) lines.push(''); else parts.forEach(s => { if (s) lines.push(s); }); continue; }
    const head = parts.filter(Boolean).join(' ');
    if (!head) continue;
    lines.push(lv === 0 ? (opts.title || '% ') + head : '#'.repeat(Math.min(6, lv)) + ' ' + head);
  }
  return diCleanLines(lines);
}

/** Прочитать файл любого из поддерживаемых типов → { md, name }. */
async function diReadFile(file) {
  const name = file.name || '';
  const ext = (name.match(/\.([^.]+)$/) || [, ''])[1].toLowerCase();
  if (ext === 'docx') return { name, md: await diDocxToMd(await file.arrayBuffer()) };
  if (!DI_FILE_RE.test(name) && file.type && !/^text\//.test(file.type)) throw new Error('type');
  const buf = await file.arrayBuffer();
  let text = new TextDecoder('utf-8').decode(buf);
  if ((text.match(/\uFFFD/g) || []).length > 3) { try { text = new TextDecoder('windows-1251').decode(buf); } catch (e) { /* оставляем как есть */ } }
  if (ext === 'html' || ext === 'htm') return { name, md: diHtmlToMd(text) };
  return { name, md: text.replace(/^﻿/, '').replace(/\r\n?/g, '\n') };
}

/* ================= 2. Текст с разметкой → главы ================= */
const diStripMd = s => String(s || '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
const diKey = s => diStripMd(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const DI_PSEUDO = /^(?:(?:глава|часть|раздел|chapter|part|section|сцена|scene)\s+(?:\d+|[IVXLCМ]+)\b.{0,70}|(?:пролог|эпилог|prologue|epilogue))\s*$/iu;

/** Разбор: { title, sections: [{ title, lv, text, words, key, grp?, intro? }], groups: [{ title, key, nkey }], levels, split, cmdLike, canTree, chapLv }
    o.tree: заголовок уровня split — блок (группа), следующий за ним по глубине — глава внутри группы; у главы grp — номер группы, а intro — текст самого блока до первой главы. */
function diParse(md, o = {}) {
  const raw = String(md || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = []; let title = '';
  for (const l of raw) {
    const s = l.replace(/\s+$/, ''); let m;
    if (!s.trim()) { blocks.push({ k: 'blank' }); continue; }
    if (!title && (m = s.match(/^%[ \t]+(.+)$/)) && !blocks.some(b => b.k !== 'blank')) { title = diStripMd(m[1]); continue; }
    if ((m = s.match(/^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/))) { blocks.push({ k: 'h', lv: m[1].length, text: diStripMd(m[2]) }); continue; }
    blocks.push({ k: 'p', text: s.trim() });
  }
  let pseudo = 0;
  if (!blocks.some(b => b.k === 'h') && o.detect !== false) {
    const idx = []; blocks.forEach((b, i) => { if (b.k === 'p' && b.text.length <= 90 && DI_PSEUDO.test(diStripMd(b.text))) idx.push(i); });
    if (idx.length >= 2) { idx.forEach(i => { blocks[i] = { k: 'h', lv: 1, text: diStripMd(blocks[i].text) }; }); pseudo = idx.length; }
  }
  const heads = blocks.filter(b => b.k === 'h');
  const levels = [...new Set(heads.map(b => b.lv))].sort((a, b) => a - b);
  let sl = o.split == null || o.split === 'auto' ? null : +o.split;
  if (sl == null) {
    if (!levels.length) sl = 0;
    else {
      const cnt = lv => heads.filter(b => b.lv === lv).length;
      const firstBlock = blocks.find(b => b.k !== 'blank');
      if (cnt(levels[0]) === 1 && levels[1] && cnt(levels[1]) >= 2 && firstBlock && firstBlock.k === 'h' && firstBlock.lv === levels[0]) { if (!title) title = firstBlock.text; firstBlock.k = 'skip'; sl = levels[1]; }
      else sl = levels[0];
    }
  }
  const deeper = sl ? levels.filter(l => l > sl) : [];
  const cl = o.tree && deeper.length ? deeper[0] : 0;
  const secs = []; let cur = null;
  const open = (ttl, lv) => {
    // родительский заголовок без текста («Часть I» перед «Глава 1») не делаем главой: он станет заголовком сцены в начале следующей
    const prev = cur && cur.lv > 0 && cur.lv < lv && !cur.lines.some(x => x.trim()) ? secs.pop() : null;
    cur = { title: ttl, lv, lines: prev ? ['## ' + prev.title, ...prev.lines.filter(x => x.trim()), ''] : [] }; secs.push(cur);
  };
  if (!sl) open('', 0);
  let grp = null;
  for (const b of blocks) {
    if (b.k === 'skip') continue;
    if (cl && b.k === 'h' && b.lv <= sl) {   // блок: заголовок и текст под ним до первой главы
      grp = { title: b.text, secs: [], gi: null }; cur = { title: b.text, lv: b.lv, lines: [], grp, intro: true }; secs.push(cur); continue;
    }
    if (cl && b.k === 'h' && b.lv <= cl) {   // глава внутри блока
      cur = { title: b.text, lv: b.lv, lines: [], grp }; secs.push(cur); if (grp) grp.secs.push(cur); continue;
    }
    if (!cl && b.k === 'h' && sl && b.lv <= sl) { open(b.text, b.lv); continue; }
    if (!cur) open('', 0);
    if (b.k === 'blank') cur.lines.push('');
    else if (b.k === 'h') cur.lines.push('## ' + b.text);
    else cur.lines.push(b.text);
  }
  const out = [], groups = []; let cmdLike = 0;
  secs.forEach((sc, i) => {
    const text = diCleanLines(sc.lines);
    if (!sc.title && !text.trim()) return;
    if (sc.intro && !text.trim() && sc.grp.secs.length) return;   // заголовок блока без своего текста: сам блок появится из его глав
    cmdLike += text.split('\n').filter(x => /^\s*(@|\/\/)/.test(x)).length;
    const o2 = { title: sc.title, lv: sc.lv, text, words: prWords(text), key: '' };
    if (sc.grp) { if (sc.grp.gi == null) { sc.grp.gi = groups.length; groups.push({ title: sc.grp.title, key: '', nkey: diKey(sc.grp.title) }); } o2.grp = sc.grp.gi; o2.intro = !!sc.intro; }
    out.push(o2);
  });
  // текст до первого заголовка получает название документа
  out.forEach((sc, i) => { if (!sc.title) sc.title = i === 0 && sl ? (title || t('di.part')) : (title || t('di.part')); sc.nkey = diKey(sc.title); sc.key = sc.nkey; });
  const seen = new Map();   // одинаковые названия различаем номером, чтобы ключи не совпадали
  groups.forEach(g => { const n = (seen.get('g:' + g.nkey) || 0) + 1; seen.set('g:' + g.nkey, n); g.key = g.nkey + (n > 1 ? ' #' + n : ''); });
  out.forEach(sc => { if (sc.grp != null) sc.key = sc.intro ? groups[sc.grp].key : groups[sc.grp].key + ' / ' + sc.nkey; });
  seen.clear();
  out.forEach(sc => { const n = (seen.get(sc.key) || 0) + 1; seen.set(sc.key, n); if (n > 1) sc.key += ' #' + n; });
  return { title, sections: out, groups, levels, split: sl, pseudo, cmdLike, canTree: deeper.length > 0, chapLv: deeper[0] || 0 };
}

/* ================= 3. Сравнение с главами проекта ================= */
/** Построчная разность: [{ t: '=' | '-' | '+', s }]. '-': только в a (в проекте), '+': только в b (в документе). */
function diDiff(a, b) {
  const A = String(a || '').split('\n'), B = String(b || '').split('\n');
  let s = 0; while (s < A.length && s < B.length && A[s] === B[s]) s++;
  let ea = A.length, eb = B.length; while (ea > s && eb > s && A[ea - 1] === B[eb - 1]) { ea--; eb--; }
  const out = [];
  for (let i = 0; i < s; i++) out.push({ t: '=', s: A[i] });
  const a2 = A.slice(s, ea), b2 = B.slice(s, eb), n = a2.length, m = b2.length;
  if (n * m > 4e6) { a2.forEach(x => out.push({ t: '-', s: x })); b2.forEach(x => out.push({ t: '+', s: x })); }
  else {
    const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a2[i] === b2[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a2[i] === b2[j]) { out.push({ t: '=', s: a2[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: '-', s: a2[i++] });
      else out.push({ t: '+', s: b2[j++] });
    }
    while (i < n) out.push({ t: '-', s: a2[i++] });
    while (j < m) out.push({ t: '+', s: b2[j++] });
  }
  for (let i = ea; i < A.length; i++) out.push({ t: '=', s: A[i] });
  return out;
}
const diNorm = s => String(s || '').replace(/\r/g, '').split('\n').map(x => x.replace(/\s+$/, '')).join('\n').trim();
/** Состояние главы проекта по сравнению с текстом из документа: new | blank | same | empty | doc | mine | conflict | nobase. */
function diState(sec, f) {
  if (!f) return sec.text.trim() ? 'new' : 'blank';
  const local = diNorm(f.text), doc = diNorm(sec.text);
  if (local === doc) return 'same';
  if (!local) return doc ? 'empty' : 'same';
  if (!doc) return 'mine';
  const base = f.src && f.src.h;
  if (!base) return 'nobase';
  const lh = prHash(f.text), dh = prHash(sec.text), dh2 = prHash(doc);
  const bs = [base];
  if (lh === base || prHash(local) === base) return 'doc';
  if (dh === base || dh2 === base) return 'mine';
  return 'conflict';
}
/** Указатель по главам проекта для сопоставления: строится один раз на разбор, а не заново для каждого раздела. */
function diIndex() {
  const all = prChapters(), bySrc = new Map(), byName = new Map(), nodes = [], seenN = new Set();
  const put = (m, k, x) => { if (!k) return; let a = m.get(k); if (!a) m.set(k, a = []); a.push(x); };
  for (const x of all) {
    if (x.f.src && x.f.src.key) put(bySrc, x.f.src.key, x);
    const tk = diKey(rsFileTitle(x.n, x.f)); put(byName, tk, x);
    if (x.n.files.length === 1) { const nk = diKey(x.n.title); if (nk !== tk) put(byName, nk, x); }
    if (!seenN.has(x.n.id)) { seenN.add(x.n.id); nodes.push(x.n); }
  }
  for (const n of P.nodes) if (n.type !== 'note' && !seenN.has(n.id)) { seenN.add(n.id); nodes.push(n); }   // блоки без глав тоже могут быть целью
  return { all, bySrc, byName, nodes };
}
/** Какая глава проекта подходит разделу: сначала по прошлому импорту, потом по названию. scope — искать только среди глав этого блока. */
function diMatch(sec, srcName, used, ix, scope) {
  ix = ix || diIndex();
  const ok = x => !used.has(x.f.id) && (!scope || x.n === scope);
  const bySrc = (ix.bySrc.get(sec.key) || []).filter(ok);
  if (bySrc.length) return (bySrc.find(x => x.f.src.name === srcName) || bySrc[0]).f.id;
  if (scope && sec.intro) {   // текст самого блока: его первая глава без своего названия
    const f0 = scope.files[0];
    if (f0 && !used.has(f0.id) && (!f0.title || deIsGen(f0.title) || diKey(f0.title) === diKey(scope.title))) return f0.id;
  }
  const nk = sec.nkey != null ? sec.nkey : sec.key;
  if (!nk) return '';
  const hit = (ix.byName.get(nk) || []).find(ok);
  return hit ? hit.f.id : '';
}
/** Блок проекта для группы разделов: по прошлому импорту (больше всего совпавших глав), потом по названию. */
function diMatchGroup(g, secs, ix, usedNodes) {
  const free = n => n && !usedNodes.has(n.id);
  const votes = new Map();
  for (const sc of secs) for (const x of (ix.bySrc.get(sc.key) || [])) if (free(x.n)) votes.set(x.n.id, (votes.get(x.n.id) || 0) + 1);
  if (votes.size) return [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const hit = ix.nodes.find(n => free(n) && n.type !== 'note' && diKey(n.title) === g.nkey);
  return hit ? hit.id : '';
}

/* ================= 4. Окно импорта ================= */
function diSelectedNode() {
  const ids = [...(UI.sel || [])]; if (ids.length !== 1) return null;
  const n = nodeById(ids[0]); return n && n.type !== 'note' ? n : null;
}
const diFmtDate = ts => { try { return new Date(ts).toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };

/** Окно импорта. opts: { file } — сразу загрузить этот файл; { text } — готовый текст с разметкой; { fileId } — подсказка: этот файл есть цель импорта. */
function openDocImport(opts = {}) {
  closePopover();
  MODALS.filter(x => x.tag === 'docimport').forEach(x => x.close());
  const model = { name: '', kind: '', md: '', split: 'auto', tree: false, detect: true, chain: true, sync: true, parsed: null, rows: [], groups: [], newMode: 'new', done: null, busy: false, prefFile: opts.fileId || '' };
  const m = openModal({
    cls: 'di-m', dismiss: false,
    build: m => {
      m.tag = 'docimport';
      const wrap = h('div', { class: 'm-wrap di-wrap' });
      const ta = h('textarea', { class: 'di-ta', id: 'di-ta', placeholder: t('di.paste.ph'), spellcheck: 'false' });
      const srcBar = h('div', { class: 'di-srcbar' });
      const optsBox = h('div', { class: 'di-opts' });
      const tableBox = h('div', { class: 'di-tbl scroll' });
      const foot = h('div', { class: 'm-foot di-foot' });
      const body = h('div', { class: 'di-body' });
      const top = h('div', { class: 'di-top' });

      /* --- загрузка источников --- */
      const setSource = (md, name, kind) => {
        model.md = md; model.name = name || ''; model.kind = kind || (name ? 'file' : 'paste');
        ta.value = md; reparse(true);
      };
      const loadFile = async file => {
        if (!file) return;
        if (!DI_FILE_RE.test(file.name || '') && !/^text\//.test(file.type || '')) { toast(t('di.err.type')); return; }
        try { const r = await diReadFile(file); setSource(r.md, r.name, 'file'); }
        catch (e) { toast(t('di.err.read', file.name)); }
      };
      ta.addEventListener('paste', ev => {
        const cd = ev.clipboardData; if (!cd) return;
        const html = cd.getData('text/html');
        if (html && /<(h[1-6]|p|div|span|b|i|strong|em|li|br)\b/i.test(html)) {
          ev.preventDefault();
          const md = diHtmlToMd(html);
          if (md.trim()) { setSource(md, '', 'paste'); }
        }
      });
      ta.addEventListener('input', () => { model.md = ta.value; if (model.kind === 'file' && !model.edited) model.edited = true; clearTimeout(ta._t); ta._t = setTimeout(() => reparse(false), 250); });
      const fileBtn = h('button', { class: 'btn', id: 'di-pick', onclick: () => pickFiles('.docx,.html,.htm,.txt,.md,.markdown,text/plain,text/html,application/vnd.openxmlformats-officedocument.wordprocessingml.document', false, fl => loadFile(fl[0])) }, icon('upload', 16), t('di.pick'));
      const clearBtn = h('button', { class: 'btn', id: 'di-clear', onclick: () => { model.done = null; setSource('', '', ''); ta.focus(); } }, icon('x', 14), t('di.clear'));
      ta.addEventListener('dragover', ev => ev.preventDefault());
      wrap.addEventListener('dragover', ev => { if ([...(ev.dataTransfer && ev.dataTransfer.types || [])].includes('Files')) { ev.preventDefault(); wrap.classList.add('drag'); } });
      wrap.addEventListener('dragleave', ev => { if (ev.target === wrap || !wrap.contains(ev.relatedTarget)) wrap.classList.remove('drag'); });
      wrap.addEventListener('drop', ev => { wrap.classList.remove('drag'); const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (f) { ev.preventDefault(); model.done = null; loadFile(f); } });

      /* --- разбор и строки --- */
      const groupOf = row => row.gi != null ? model.groups[row.gi] : null;
      const groupNode = g => g && g.target.k === 'node' ? nodeById(g.target.nid) : null;
      /** Куда пойдёт раздел, пока пользователь не выбрал сам: глава проекта, новая глава в блоке или новый блок. */
      const autoTarget = (row, ix, used, wantNode) => {
        const sec = row.sec, g = groupOf(row), scope = groupNode(g);
        if (g && !scope) return { k: 'new' };   // блок группы новый: главы кладутся в него
        const fid = diMatch(sec, model.name, used, ix, scope);
        if (fid) { used.add(fid); return { k: 'file', fid }; }
        if (scope) return { k: 'node', nid: scope.id };
        return model.newMode === 'node' && wantNode ? { k: 'node', nid: wantNode.id } : { k: 'new' };
      };
      const reparse = keepRows => {
        const old = new Map(model.rows.map(r => [r.sec.key, r])), oldG = new Map(model.groups.map(g => [g.key, g]));
        model.parsed = diParse(model.md, { split: model.split, detect: model.detect, tree: model.tree });
        const ix = diIndex(), used = new Set(), usedNodes = new Set();
        const wantNode = diSelectedNode();
        const P0 = model.parsed;
        model.groups = (P0.groups || []).map((g, gi) => {
          const pg = keepRows ? null : oldG.get(g.key);
          let target = pg && pg.userTarget ? pg.target : null;
          if (target && target.k === 'node' && !nodeById(target.nid)) target = null;
          let found = false;
          if (!target) { const nid = diMatchGroup(g, P0.sections.filter(x => x.grp === gi), ix, usedNodes); target = nid ? { k: 'node', nid } : { k: 'new' }; found = !!nid; }
          if (target.k === 'node') usedNodes.add(target.nid);
          return { title: pg ? pg.title : g.title, src: g.title, key: g.key, idx: gi, target, userTarget: !!(pg && pg.userTarget), found };
        });
        model.rows = P0.sections.map(sec => {
          const prev = keepRows ? null : old.get(sec.key);
          const row = { sec, gi: sec.grp != null ? sec.grp : null, title: prev ? prev.title : sec.title, target: null, userTarget: false, on: true, applied: false };
          if (prev && prev.userTarget && !(prev.target.k === 'file' && used.has(prev.target.fid)) && !(prev.target.k === 'node' && !nodeById(prev.target.nid))) {
            row.target = prev.target; row.userTarget = true; if (row.target.k === 'file') used.add(row.target.fid);
          } else if (prev && prev.target.k === 'file' && !prev.userTarget && !used.has(prev.target.fid) && teFind(prev.target.fid) && !groupNode(groupOf(row))) {
            row.target = { k: 'file', fid: prev.target.fid }; used.add(prev.target.fid);
          } else row.target = autoTarget(row, ix, used, wantNode);
          row.on = defaultOn(row);
          if (prev && prev.userOn !== undefined) { row.on = prev.userOn; row.userOn = prev.userOn; }
          return row;
        });
        paintAll();
      };
      /** Группа сменила блок: главы без ручного выбора подбираются заново. */
      const regroup = g => {
        const ix = diIndex(), used = new Set();
        model.rows.forEach(r => { if (r.gi !== g.idx && r.target.k === 'file') used.add(r.target.fid); });
        model.rows.forEach(r => {
          if (r.gi !== g.idx) return;
          if (r.userTarget) { if (r.target.k === 'file') used.add(r.target.fid); return; }
          r.target = autoTarget(r, ix, used, null); r._st = null;
          r.on = r.userOn !== undefined ? r.userOn : defaultOn(r);
        });
        paintTable(); paintFoot();
      };
      const fileOf = row => row.target.k === 'file' ? teFind(row.target.fid) : null;
      const stateOf = row => row._st || (row._st = diState(row.sec, (fileOf(row) || {}).f));
      const defaultOn = row => { const s = stateOf(row); return s === 'new' || s === 'empty' || s === 'doc' || s === 'same' || s === 'blank'; };

      /* --- интерфейс --- */
      const paintSrc = () => {
        srcBar.replaceChildren(fileBtn, clearBtn, h('span', { class: 'di-srcname' }, model.kind === 'file' ? t('di.src.file', model.name) : model.md.trim() ? t('di.src.paste') : ''));
      };
      const paintOpts = () => {
        optsBox.replaceChildren();
        const p = model.parsed;
        if (!p || !model.md.trim()) return;
        const lvOpts = [{ value: 'auto', label: t('di.split.auto') }, { value: '0', label: t('di.split.none') }];
        for (let i = 1; i <= 4; i++) lvOpts.push({ value: String(i), label: t('di.split.h', i) });
        optsBox.append(...[
          h('div', { class: 'di-opt' }, h('span', { class: 'lbl' }, t('di.opt.split')), segmented(lvOpts, String(model.split), v => { model.split = v === 'auto' ? 'auto' : +v; reparse(false); }, 'di-split')),
          p.canTree ? h('div', { class: 'di-opt', 'data-tip': t('di.lay.hint') }, h('span', { class: 'lbl' }, t('di.opt.lay')),
            segmented([{ value: 'flat', label: t('di.lay.flat') }, { value: 'tree', label: t('di.lay.tree', p.split, p.chapLv) }], model.tree ? 'tree' : 'flat', v => { model.tree = v === 'tree'; reparse(false); }, 'di-lay')) : null,
          p.levels.length || p.pseudo ? null : h('div', { class: 'di-opt' }, switchEl(model.detect, v => { model.detect = v; reparse(false); }, t('di.opt.detect'))),
          h('div', { class: 'di-opt' }, switchEl(model.chain, v => { model.chain = v; paintFoot(); }, t('di.opt.chain'))),
          h('div', { class: 'di-opt' }, switchEl(model.sync, v => { model.sync = v; }, t('di.opt.sync')))].filter(Boolean));
        const sel = diSelectedNode();
        if (sel && !model.tree) optsBox.append(h('div', { class: 'di-opt' }, switchEl(model.newMode === 'node', v => { model.newMode = v ? 'node' : 'new'; model.rows.forEach(r => { if (!r.userTarget && r.target.k !== 'file') r.target = v ? { k: 'node', nid: sel.id } : { k: 'new' }; }); paintAll(); }, t('di.to.shortcut', sel.title))));
      };
      const targetLabel = row => {
        if (row.target.k === 'file') { const x = fileOf(row); return x ? t('di.to.file', rsFileTitle(x.n, x.f) && rsFileTitle(x.n, x.f) !== x.n.title ? `${x.n.title} · ${rsFileTitle(x.n, x.f)}` : x.n.title) : t('di.to.new'); }
        if (row.target.k === 'node') { const n = nodeById(row.target.nid); return n ? t('di.to.node', n.title) : t('di.to.new'); }
        if (row.gi != null && !row.target.solo) return t('di.to.ingroup');
        return t('di.to.new');
      };
      const groupLabel = g => { const n = groupNode(g); return n ? t('di.to.gnode', n.title) : t('di.to.gnew'); };
      const stateChip = row => {
        const s = stateOf(row);
        const tip = { doc: 'di.tip.doc', mine: 'di.tip.mine', conflict: 'di.tip.conflict', nobase: 'di.tip.nobase' }[s];
        return h('span', { class: 'di-st st-' + s, 'data-tip': tip ? t(tip) : null }, t('di.st.' + s));
      };
      const rowsOf = g => model.rows.filter(r => r.gi === g.idx);
      const setTarget = (row, target) => { row.target = target; row.userTarget = true; row._st = null; rowChanged(row); };
      const groupEl = (g, i) => {
        const rs = rowsOf(g), on = rs.some(r => r.on), n = groupNode(g);
        const first = rs[0];
        return h('div', { class: 'di-row di-grp' + (on ? '' : ' off'), 'data-g': g.idx },
          h('input', { type: 'checkbox', class: 'di-on', checked: on, onchange: ev => { rs.forEach(r => { r.on = ev.target.checked; r.userOn = r.on; }); paintTable(); paintFoot(); } }),
          h('div', { class: 'di-gt' }, h('span', { class: 'dot big', style: { background: n ? palColor(n.color) : 'var(--text3)' } }),
            h('input', { class: 'inp di-t di-gti', value: g.title, disabled: !!n, onchange: ev => { g.title = ev.target.value.trim() || g.src; } })),
          h('span', { class: 'di-w' }, fmtNum(rs.reduce((a, r) => a + r.sec.words, 0))),
          h('button', { class: 'btn sm di-to di-gto', onclick: ev => groupMenu(ev.currentTarget, g) }, groupLabel(g), icon('chevD', 12)),
          h('span', { class: 'di-st ' + (n ? 'st-doc' : 'st-new'), 'data-tip': n ? t('di.tip.gfound') : null }, n ? t('di.st.gfound') : t('di.st.new')),
          h('span'));
      };
      const rowEl = (row, i) => {
        const st = stateOf(row);
        const x = fileOf(row);
        const diffable = x && (st === 'conflict' || st === 'nobase' || st === 'doc' || st === 'mine');
        return h('div', { class: 'di-row' + (row.on ? '' : ' off') + (row.gi != null ? ' in' : ''), 'data-i': i },
          h('input', { type: 'checkbox', class: 'di-on', checked: row.on, onchange: ev => { row.on = ev.target.checked; row.userOn = row.on; paintTable(); paintFoot(); } }),
          h('input', { class: 'inp di-t', value: row.title, disabled: row.target.k === 'file', onchange: ev => { row.title = ev.target.value.trim() || row.sec.title; } }),
          h('span', { class: 'di-w' }, fmtNum(row.sec.words)),
          h('button', { class: 'btn sm di-to', onclick: ev => targetMenu(ev.currentTarget, row) }, targetLabel(row), icon('chevD', 12)),
          stateChip(row),
          diffable ? h('button', { class: 'btn sm di-df', onclick: () => diffDialog(row) }, icon('rows', 14), t('di.diff')) : h('span'));
      };
      /** Диалог выбора существующего блока → блок или null. */
      const pickBlock = (title, pre) => brLinkDlg({ title, intro: t('di.pickblock.intro'), modes: ['exist'], noArrow: true, pre, ok: { exist: t('di.pickblock.ok') } });
      const groupMenu = (b, g) => {
        const items = [{ label: t('di.to.gnew'), icon: 'plus', onClick: () => { g.target = { k: 'new' }; g.userTarget = true; g.found = false; regroup(g); } },
          { label: t('di.to.gpick'), icon: 'refresh', onClick: () => setTimeout(async () => {
            const r = await pickBlock(t('di.pickblock.gt', g.title), g.target.k === 'node' ? g.target.nid : '');
            if (r && r.node) { g.target = { k: 'node', nid: r.node.id }; g.userTarget = true; regroup(g); }
          }, 30) },
          { sep: true }, { label: t('di.to.gskip'), icon: 'x', onClick: () => { rowsOf(g).forEach(r => { r.on = false; r.userOn = false; }); paintTable(); paintFoot(); } }];
        menuAt(b, items);
      };
      /** Эта глава и все ниже (в той же группе) — новыми главами выбранного блока. Главы, уже сопоставленные с существующими, не трогаем. */
      const putBelow = (row, node) => {
        const i = model.rows.indexOf(row);
        for (let j = i; j < model.rows.length; j++) {
          const r = model.rows[j]; if (r.gi !== row.gi) break;
          if (r.target.k === 'file') continue;
          r.target = { k: 'node', nid: node.id }; r.userTarget = true; r._st = null; r.on = r.userOn !== undefined ? r.userOn : defaultOn(r);
        }
        paintTable(); paintFoot();
      };
      const targetMenu = (b, row) => {
        const items = [];
        if (row.gi != null) items.push({ label: t('di.to.backgrp'), icon: 'file', onClick: () => { row.userTarget = false; row._st = null; const g = groupOf(row); regroup(g); } }, { label: t('di.to.solo'), icon: 'plus', onClick: () => setTarget(row, { k: 'new', solo: true }) });
        else items.push({ label: t('di.to.new'), icon: 'plus', onClick: () => setTarget(row, { k: 'new' }) });
        const sel = diSelectedNode();
        if (sel) items.push({ label: t('di.to.node', sel.title), icon: 'file', onClick: () => setTarget(row, { k: 'node', nid: sel.id }) });
        items.push({ label: t('di.to.inblock'), icon: 'file', onClick: () => setTimeout(async () => {
          const r = await pickBlock(t('di.pickblock.gt', row.title), row.target.k === 'node' ? row.target.nid : ''); if (r && r.node) setTarget(row, { k: 'node', nid: r.node.id });
        }, 30) });
        if (model.rows.length > 1) items.push({ label: t('di.to.below'), icon: 'chevD', onClick: () => setTimeout(async () => {
          const r = await pickBlock(t('di.pickblock.gt', row.title), row.target.k === 'node' ? row.target.nid : ''); if (r && r.node) putBelow(row, r.node);
        }, 30) });
        items.push({ label: t('di.to.pick'), icon: 'refresh', onClick: () => setTimeout(() => pickFile(b, fl => setTarget(row, { k: 'file', fid: fl.id })), 30) });
        items.push({ sep: true }, { label: t('di.to.skip'), icon: 'x', onClick: () => { row.on = false; row.userOn = false; paintTable(); paintFoot(); } });
        menuAt(b, items);
      };
      const rowChanged = row => { row.on = row.userOn !== undefined ? row.userOn : defaultOn(row); paintTable(); paintFoot(); };
      const paintTable = () => {
        tableBox.replaceChildren();
        const p = model.parsed;
        if (!model.md.trim()) { tableBox.append(h('div', { class: 'empty small' }, t('di.none'))); return; }
        if (!p.sections.length) { tableBox.append(h('div', { class: 'empty small' }, t('di.empty'))); return; }
        tableBox.append(h('div', { class: 'di-row di-hd' }, h('span'), h('span', t('di.col.title')), h('span', { class: 'di-w' }, t('di.col.words')), h('span', t('di.col.to')), h('span', t('di.col.state')), h('span')));
        const seenG = new Set();
        model.rows.forEach((r, i) => {
          if (r.gi != null && !seenG.has(r.gi)) { seenG.add(r.gi); tableBox.append(groupEl(model.groups[r.gi], r.gi)); }
          tableBox.append(rowEl(r, i));
        });
        const wordsAll = fmtNum(p.sections.reduce((a, s) => a + s.words, 0));
        const info = [model.groups.length ? t('di.found.tree', wordsAll, model.groups.length, p.sections.length) : t('di.found', wordsAll, p.sections.length)];
        if (p.title) info.push(t('di.title.of', p.title));
        tableBox.append(h('div', { class: 'hint di-info' }, info.join(' · ')));
        if (p.cmdLike) tableBox.append(h('div', { class: 'hint di-warn' }, icon('alert', 14), t('di.warn.cmd', p.cmdLike)));
      };
      const counts = () => {
        let nb = 0, nf = 0, nu = 0, sk = 0, over = 0; const gMade = new Set();
        for (const r of model.rows) {
          if (!r.on) { sk++; continue; }
          if (r.target.k === 'file') { nu++; const s = stateOf(r); if (s === 'conflict' || s === 'nobase' || s === 'mine') over++; }
          else if (r.target.k === 'node') nf++;
          else if (r.gi != null && !r.target.solo) { if (gMade.has(r.gi)) nf++; else { gMade.add(r.gi); nb++; } }
          else nb++;
        }
        return { nb, nf, nu, sk, over };
      };
      const paintFoot = () => {
        foot.replaceChildren();
        const c = counts();
        const txt = [h('div', t('di.sum', c.nb, c.nf, c.nu, c.sk))];
        if (c.over) txt.push(h('div', { class: 'di-over' }, t('di.sum.over', c.over)));
        foot.append(h('div', { class: 'di-sum' }, ...txt), h('div', { class: 'grow' }),
          h('button', { class: 'btn primary', id: 'di-go', disabled: !model.rows.length || model.busy, onclick: () => go() }, icon(model.busy ? 'refresh' : 'check', 16), t(model.busy ? 'di.busy' : 'di.go')));
      };
      const paintAll = () => { paintSrc(); paintOpts(); paintTable(); paintFoot(); };

      /* --- сравнение --- */
      const diffDialog = row => {
        const x = fileOf(row); if (!x) return;
        const d = diDiff(x.f.text || '', row.sec.text);
        const plus = d.filter(z => z.t === '+').length, minus = d.filter(z => z.t === '-').length;
        const body = h('div', { class: 'di-dbody scroll' });
        if (!plus && !minus) body.append(h('div', { class: 'empty small' }, t('di.diff.same')));
        else {
          let i = 0;
          while (i < d.length) {
            if (d[i].t === '=') {
              let j = i; while (j < d.length && d[j].t === '=') j++;
              const run = d.slice(i, j), keepHead = i === 0 ? 0 : 2, keepTail = j === d.length ? 0 : 2;
              if (run.length > keepHead + keepTail + 2) {
                run.slice(0, keepHead).forEach(z => body.append(h('div', { class: 'di-dl eq' }, z.s || ' ')));
                body.append(h('div', { class: 'di-fold' }, t('di.diff.fold', run.length - keepHead - keepTail)));
                run.slice(run.length - keepTail).forEach(z => body.append(h('div', { class: 'di-dl eq' }, z.s || ' ')));
              } else run.forEach(z => body.append(h('div', { class: 'di-dl eq' }, z.s || ' ')));
              i = j; continue;
            }
            body.append(h('div', { class: 'di-dl ' + (d[i].t === '-' ? 'del' : 'add') }, h('span', { class: 'sg' }, d[i].t === '-' ? '−' : '+'), d[i].s || ' '));
            i++;
          }
        }
        openModal({ cls: 'di-diffm', build: dm => h('div', { class: 'm-wrap' },
          modalHead(t('di.diff.t', row.title), dm),
          h('div', { class: 'di-dleg' }, h('span', { class: 'del' }, '− ' + minus), h('span', { class: 'add' }, '+ ' + plus), h('span', { class: 'hint' }, t('di.diff.legend'))),
          body,
          h('div', { class: 'm-foot' }, h('div', { class: 'grow' }),
            h('button', { class: 'btn', id: 'di-keep', onclick: () => { row.on = false; row.userOn = false; dm.close(); paintTable(); paintFoot(); } }, t('di.diff.mine')),
            h('button', { class: 'btn primary', id: 'di-take', onclick: () => { row.on = true; row.userOn = true; dm.close(); paintTable(); paintFoot(); } }, t('di.diff.doc')))) });
      };

      /* --- импорт --- */
      const go = () => {
        if (model.busy) return;
        if (!model.rows.some(r => r.on)) { toast(t('di.nothing')); return; }
        model.busy = true; paintFoot();
        setTimeout(() => { try { doImport(); } catch (e) { model.busy = false; paintFoot(); throw e; } finally { model.busy = false; } }, 30);   // даём окну перерисовать «Импортируем…»
      };
      const doImport = () => {
        const rows = model.rows.filter(r => r.on);
        const now = Date.now();
        const mkSrc = sec => ({ name: model.kind === 'file' ? model.name : '', at: now, h: prHash(sec.text), key: sec.key });
        const made = [], inNodes = [], updated = [];
        // куда ставить новые блоки
        const anchor = diSelectedNode(), allNodes = P.nodes.filter(n => n.type !== 'note');
        const bb = allNodes.length ? nodesBBox(allNodes) : null;
        let x0 = anchor ? anchor.x + nodeSize(anchor).w + 160 : bb ? bb.x1 + 160 : 0;
        let y0 = anchor ? anchor.y : bb ? bb.y0 : 0;
        let cx = x0, cy = y0, col = 0, rowH = 0, prev = null;
        const grpNode = new Map();   // номер группы → блок, созданный для неё
        const fill = (n, f, sec, title) => {
          f.text = sec.text; f.src = mkSrc(sec); if (title != null) f.title = title;
          if (model.sync && sec.text.trim()) { f.textLive = true; prApply(n, f, 'replace'); }
        };
        const newBlock = title => {
          const n = addNode('chapter', cx, cy); n.title = title.slice(0, 90);
          const sz = nodeSize(n); rowH = Math.max(rowH, sz.h);
          cx += sz.w + 100; col++; if (col >= 5) { col = 0; cx = x0; cy += rowH + 90; rowH = 0; }
          if (model.chain && prev && prev !== n && !P.edges.some(e => e.from === prev.id && e.to === n.id)) addEdge(prev.id, n.id);
          return n;
        };
        for (const r of rows) {
          const sec = r.sec;
          if (r.target.k === 'file') {
            const x = fileOf(r); if (!x) continue;
            x.f.text = sec.text; x.f.src = mkSrc(sec);
            if (x.f.textLive) prSync(x.n, x.f);
            updated.push({ n: x.n, f: x.f }); prev = x.n;
          } else if (r.target.k === 'node') {
            const n = nodeById(r.target.nid); if (!n) continue;
            const f = newFile(r.title); n.files.push(f); fill(n, f, sec);
            inNodes.push({ n, f }); prev = n;
          } else if (r.gi != null && !r.target.solo) {
            const g = model.groups[r.gi];
            let n = grpNode.get(r.gi);
            if (!n) {
              n = newBlock(g.title); grpNode.set(r.gi, n);
              const f = n.files[0];
              // текст самого блока (под его заголовком) — первая глава без своего названия; иначе первая глава блока получает своё
              fill(n, f, sec, sec.intro ? null : r.title);
              made.push({ n, f }); prev = n;
            } else {
              const f = newFile(sec.intro ? g.title : r.title); n.files.push(f); fill(n, f, sec);
              inNodes.push({ n, f });
            }
          } else {
            const n = newBlock(r.title);
            fill(n, n.files[0], sec);
            made.push({ n, f: n.files[0] }); prev = n;
          }
        }
        reindex(); commit(true);
        const total = made.length + inNodes.length + updated.length;
        model.done = { made, inNodes, updated };
        toastUndo(t('di.done.toast', total));
        showDone();
        if (made[0]) try { focusNode(made[0].n.id); } catch (e) { /* карта могла уйти */ }
      };
      const showDone = () => {
        const d = model.done; if (!d) return;
        const all = d.made.concat(d.inNodes, d.updated);
        const list = h('div', { class: 'di-donelist scroll' }, ...all.map(({ n, f }) => h('div', { class: 'di-dn', 'data-f': f.id, onclick: () => { m.close(); openTextEditor({ fileId: f.id }); } },
          h('span', { class: 'dot big', style: { background: palColor(n.color) } }), h('b', n.title), h('span', { class: 'hint' }, prWords(f.text) + ' ' + (S.lang === 'en' ? 'words' : 'слов')), icon('chevR', 14))));
        body.replaceChildren(h('div', { class: 'di-done' }, h('div', { class: 'di-done-h' }, icon('check', 20), t('di.done')), h('p', t('di.done.sum', d.made.length, d.inNodes.length, d.updated.length)), list));
        foot.replaceChildren(h('div', { class: 'grow' }), h('button', { class: 'btn', id: 'di-close', onclick: () => m.close() }, t('di.done.close')),
          h('button', { class: 'btn primary', id: 'di-open', onclick: () => {
            const ids = all.map(x => x.f.id).slice(0, 12), st = teStore(); st.ids = ids; st.on = ids[0]; m.close(); openTextEditor({ fileId: ids[0] }); } }, icon('type', 16), t('di.done.open')));
      };

      top.append(h('p', { class: 'hint di-how' }, t('di.how')), h('div', { class: 'di-paste' }, ta), srcBar);
      body.append(top, optsBox, tableBox);
      wrap.append(modalHead(t('di.title'), m), body, foot);
      paintAll();
      if (opts.file) loadFile(opts.file);
      else if (opts.text) setSource(opts.text, opts.name || '', opts.name ? 'file' : 'paste');
      else setTimeout(() => ta.focus(), 80);
      return wrap;
    }
  });
  return m;
}
TOOL_ITEMS.push({ id: 'docimport', group: 'story', ic: 'upload', key: 'di.btn', kw: 'import google docs word docx document text paste chapters импорт гугл докс ворд документ текст главы вставить', run: () => openDocImport() });

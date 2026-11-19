'use strict';
/* ====== Выжимка сценария для вычитки ======
   Только то, что читает игрок: реплики, слова рассказчика и варианты выбора, по блокам в порядке прохождения, без кода Ren'Py.
   Корректору можно отдать как Word (сплошной текст или таблица с колонкой для замечаний), как страницу для печати в PDF,
   как HTML, TXT или Markdown. Номера реплик те же, что в таблице реплик, поэтому поправки легко найти. */

Object.assign(D, {
  'dg.btn': ['Выжимка для вычитки…', 'Digest for proofreading…'], 'dg.menu': ['Выжимка для вычитки…', 'Digest for proofreading…'],
  'dg.title': ['Выжимка для вычитки', 'Digest for proofreading'], 'dg.doc': ['{0}: сценарий для вычитки', '{0}: script for proofreading'],
  'dg.scope': ['Что взять', 'What to include'], 'dg.scope.all': ['Весь проект', 'Whole project'], 'dg.scope.sel': ['Выделенные блоки ({0})', 'Selected blocks ({0})'],
  'dg.layout': ['Вид', 'Layout'], 'dg.l.flow': ['Сплошной текст', 'Plain text'], 'dg.l.table': ['Таблица с колонкой для замечаний', 'Table with a column for remarks'],
  'dg.names': ['Кто говорит', 'Speaker'], 'dg.n.name': ['Имя', 'Name'], 'dg.n.tag': ['Метка в коде', 'Code tag'],
  'dg.tags': ['Теги Ren\'Py в тексте', 'Ren\'Py tags in the text'], 'dg.t.fmt': ['Курсив и жирный', 'Italic and bold'], 'dg.t.strip': ['Убрать все', 'Remove all'], 'dg.t.keep': ['Как в коде', 'As in the code'],
  'dg.t.fmt.h': ['{i}…{/i} и {b}…{/b} станут курсивом и жирным шрифтом, остальные теги ({w}, {p}, {color} и т. п.) уберём.', '{i}…{/i} and {b}…{/b} become italic and bold; other tags ({w}, {p}, {color} and so on) are removed.'],
  'dg.inc': ['Что показывать', 'What to show'],
  'dg.i.narr': ['Слова рассказчика (без имени)', 'Narration (no speaker)'], 'dg.i.choice': ['Варианты выбора игрока', 'Player choices'],
  'dg.i.sum': ['Краткое содержание блока', 'Block summary'], 'dg.i.num': ['Номера реплик', 'Line numbers'],
  'dg.i.num.h': ['Те же номера, что в таблице реплик: по ним удобно находить строку для правки.', 'The same numbers as in the replica table, so a line is easy to find.'],
  'dg.stat': ['Реплик: {0} · слов: {1} · чтение ≈ {2}', 'Lines: {0} · words: {1} · reading ≈ {2}'],
  'dg.stat.blocks': ['блоков: {0}', 'blocks: {0}'],
  'dg.empty': ['Здесь пока нет текста для вычитки. Реплики берутся из скриптов блоков.', 'There is no text to proofread yet. Lines are taken from the block scripts.'],
  'dg.cut': ['Показано строк: {0} из {1}. В файл войдёт всё.', 'Showing {0} of {1} lines. The file will contain everything.'],
  'dg.word': ['Word (.docx)', 'Word (.docx)'], 'dg.pdf': ['PDF (печать)', 'PDF (print)'], 'dg.html': ['HTML', 'HTML'], 'dg.txt': ['TXT', 'TXT'], 'dg.md': ['Markdown', 'Markdown'],
  'dg.pdf.t': ['Открывает печать: выберите «Сохранить как PDF»', 'Opens printing: choose "Save as PDF"'],
  'dg.pdf.fail': ['Печать здесь недоступна. Скачайте Word или HTML и распечатайте оттуда.', 'Printing is not available here. Download Word or HTML and print from there.'],
  'dg.saved': ['Выжимка сохранена: {0} реплик', 'Digest saved: {0} lines'],
  'dg.col.no': ['№', '#'], 'dg.col.who': ['Кто', 'Who'], 'dg.col.text': ['Текст', 'Text'], 'dg.col.rem': ['Замечание', 'Remark'],
  'dg.choice': ['Выбор', 'Choice'], 'dg.menu.q': ['Вопрос', 'Prompt'], 'dg.sum': ['О чём', 'About'],
  'dg.page': ['стр.', 'page'],
});

const DG_ST = { scope: '', layout: 'flow', names: 'name', tags: 'fmt', narr: true, choice: true, sum: false, num: true };
const dgX = s => String(s == null ? '' : s).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Текст реплики → куски с оформлением. fmt: курсив/жирный/подчёркнутый/зачёркнутый, прочие теги убираем; strip: убираем все; keep: ничего не трогаем. */
function dgRuns(text, mode) {
  const src = String(text || '');
  if (mode === 'keep') return [{ t: src }];
  const raw = src.replace(/(\S)\{p(?:=[^{}]*)?\}(?=\S)/g, '$1 ').replace(/\{\{/g, '\u0001').replace(/\[\[/g, '\u0002');   // {p} — перелистывание: между предложениями нужен пробел
  const out = [], st = { b: 0, i: 0, u: 0, s: 0 }; let last = 0, m;
  const re = /\{(\/?)([A-Za-z]+)(?:=[^{}]*)?\}/g;
  const push = seg => { if (!seg) return; seg = seg.replace(/\u0001/g, '{').replace(/\u0002/g, '['); out.push({ t: seg, b: !!st.b, i: !!st.i, u: !!st.u, s: !!st.s }); };
  while ((m = re.exec(raw))) {
    push(raw.slice(last, m.index)); last = re.lastIndex;
    const tag = m[2].toLowerCase();
    if (mode === 'fmt' && tag in st) st[tag] = m[1] ? 0 : 1;
  }
  push(raw.slice(last));
  return out.length ? out : [{ t: '' }];
}
const dgPlain = (text, mode) => dgRuns(text, mode).map(r => r.t).join('');

/** Собирает документ: блоки с их строками. Ничего не пишет в проект. */
function dgBuild(o) {
  const rows = rtCollect().filter(r => (!o.scope ? true : o.scope === 'sel' ? UI.sel.has(r.n.id) : r.n.id === o.scope));
  const secs = [], by = new Map(); let words = 0, lines = 0;
  for (const r of rows) {
    let kind;
    if (r.sub === 'choice') kind = 'choice'; else if (r.sub === 'caption') kind = 'menu'; else kind = r.who ? 'say' : 'narr';
    if (kind === 'narr' && !o.narr) continue;
    if ((kind === 'choice' || kind === 'menu') && !o.choice) continue;
    let sec = by.get(r.f.id);
    if (!sec) { sec = { n: r.n, f: r.f, title: r.n.title, sub: rsFileTitle(r.n, r.f), summary: o.sum ? String(r.f.summary || '').trim() : '', rows: [] }; by.set(r.f.id, sec); secs.push(sec); }
    const name = r.who ? (o.names === 'tag' ? r.who : rtWhoName(r.who)) : '';
    sec.rows.push({ kind, i: r.i, who: r.who, name, text: r.plain, words: r.words });
    words += r.words; lines++;
  }
  return { title: t('dg.doc', P.name || ''), date: new Date().toLocaleDateString(S.lang === 'ru' ? 'ru-RU' : 'en-US'), secs, lines, words, blocks: secs.length };
}
const dgStat = d => t('dg.stat', fmtNum(d.lines), fmtNum(d.words), fmtDur(d.words)) + ' · ' + t('dg.stat.blocks', d.blocks);
/** Строка для таблицы и сплошного текста: что писать в колонке «Кто». */
const dgWho = (r, o) => (r.kind === 'choice' ? t('dg.choice') : r.kind === 'menu' ? t('dg.menu.q') : r.name);

/* ---------- HTML ---------- */
const DG_CSS = `@page{size:A4;margin:18mm 16mm 20mm;@bottom-right{content:counter(page);font:9pt sans-serif;color:#888}}
*{box-sizing:border-box}body{font:12pt/1.5 Georgia,'Times New Roman',serif;color:#111;margin:0;padding:22px 30px 30px;background:#fff}
h1{font-size:21pt;margin:0 0 4px;line-height:1.2}.meta{color:#777;font:9.5pt sans-serif;margin:0 0 18px}
h2{font-size:15pt;margin:26px 0 4px;padding-bottom:3px;border-bottom:1.5px solid #2f4f8f;color:#1f3864;break-after:avoid}
h3{font-size:12.5pt;margin:12px 0 4px;color:#444;break-after:avoid}.sum{color:#666;font-style:italic;margin:2px 0 10px}
.ln{margin:.4em 0;break-inside:avoid}.no{display:inline-block;min-width:2.3em;margin-right:.4em;color:#999;font:8pt sans-serif}.who{font-weight:700}
div.ch{margin:.3em 0 .3em 2.6em;break-inside:avoid}div.ch:before,tr.ch td.tx:before{content:'\\25B8\\00a0';color:#2f4f8f}div.mq{margin:.5em 0 .1em 2.6em;font-style:italic;color:#555}
table{width:100%;border-collapse:collapse;font-size:11pt;margin:6px 0 4px}th,td{border:1px solid #b8bcc6;padding:4px 7px;vertical-align:top;text-align:left}
th{background:#e8ecf4;font:600 9.5pt sans-serif}td.no{display:table-cell;width:3.2em;min-width:0;margin:0;color:#888;font:9pt sans-serif}td.who{width:8.5em;font-weight:600}td.rem{width:26%}tr.mq td.no{font-style:normal}tr{break-inside:avoid}tr.ch td.tx{padding-left:1.4em}tr.mq td{font-style:italic;color:#555}
.cut{margin:18px 0;color:#999;font:italic 10pt sans-serif;text-align:center}
@media print{body{padding:0}}`;
function dgRunsHtml(text, o) {
  return dgRuns(text, o.tags).map(r => {
    let s = dgX(r.t).replace(/\n/g, '<br>');
    if (r.b) s = `<b>${s}</b>`; if (r.i) s = `<i>${s}</i>`; if (r.u) s = `<u>${s}</u>`; if (r.s) s = `<s>${s}</s>`;
    return s;
  }).join('');
}
function dgHtml(d, o, limit) {
  const parts = [`<h1>${dgX(d.title)}</h1><p class="meta">${dgX(d.date)} · ${dgX(dgStat(d))}</p>`];
  let used = 0, total = d.lines;
  for (const sec of d.secs) {
    if (limit && used >= limit) break;
    parts.push(`<h2>${dgX(sec.title)}</h2>` + (sec.sub ? `<h3>${dgX(sec.sub)}</h3>` : '') + (sec.summary ? `<p class="sum">${dgX(t('dg.sum'))}: ${dgX(sec.summary)}</p>` : ''));
    const rows = limit ? sec.rows.slice(0, Math.max(0, limit - used)) : sec.rows;
    used += rows.length;
    if (o.layout === 'table') {
      parts.push('<table><thead><tr>' + (o.num ? `<th>${dgX(t('dg.col.no'))}</th>` : '') + `<th>${dgX(t('dg.col.who'))}</th><th>${dgX(t('dg.col.text'))}</th><th>${dgX(t('dg.col.rem'))}</th></tr></thead><tbody>`);
      for (const r of rows) parts.push(`<tr class="${r.kind === 'choice' ? 'ch' : r.kind === 'menu' ? 'mq' : ''}">` + (o.num ? `<td class="no">${r.i}</td>` : '') + `<td class="who">${dgX(dgWho(r, o))}</td><td class="tx">${dgRunsHtml(r.text, o)}</td><td class="rem"></td></tr>`);
      parts.push('</tbody></table>');
    } else {
      for (const r of rows) {
        const no = o.num ? `<span class="no">${r.i}</span>` : '';
        if (r.kind === 'choice') parts.push(`<div class="ch">${no}${dgRunsHtml(r.text, o)}</div>`);
        else if (r.kind === 'menu') parts.push(`<div class="mq">${no}${dgRunsHtml(r.text, o)}</div>`);
        else parts.push(`<div class="ln">${no}${r.name ? `<span class="who">${dgX(r.name)}:</span> ` : ''}${dgRunsHtml(r.text, o)}</div>`);
      }
    }
  }
  if (limit && total > used) parts.push(`<div class="cut">${dgX(t('dg.cut', used, total))}</div>`);
  return `<!doctype html><html lang="${S.lang}"><head><meta charset="utf-8"><title>${dgX(d.title)}</title><style>${DG_CSS}</style></head><body>${parts.join('\n')}</body></html>`;
}

/* ---------- TXT и Markdown ---------- */
function dgText(d, o, md) {
  const out = [md ? `# ${d.title}` : d.title.toUpperCase(), `${d.date} · ${dgStat(d)}`, ''];
  const fmt = rs => rs.map(r => { let s = r.t; if (md && s.trim()) { if (r.b) s = `**${s}**`; if (r.i) s = `*${s}*`; } return s; }).join('');
  for (const sec of d.secs) {
    const head = sec.title + (sec.sub ? ' › ' + sec.sub : '');
    out.push(md ? `## ${head}` : `=== ${head} ===`);
    if (sec.summary) out.push(md ? `*${t('dg.sum')}: ${sec.summary}*` : `(${t('dg.sum')}: ${sec.summary})`);
    out.push('');
    for (const r of sec.rows) {
      const body = fmt(dgRuns(r.text, o.tags)).replace(/\n/g, md ? '  \n' : '\n   '), no = o.num ? `[${r.i}] ` : '';
      if (r.kind === 'choice') out.push(`${md ? '- ' : '   '}${no}▸ ${body}`);
      else if (r.kind === 'menu') out.push(`${no}? ${body}`);
      else out.push(`${no}${r.name ? (md ? `**${r.name}:** ` : r.name + ': ') : ''}${body}${md ? '  ' : ''}`);
    }
    out.push('');
  }
  return out.join('\n');
}

/* ---------- Word ---------- */
const DG_W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
function dgWr(text, f = {}) {
  const pr = (f.b ? '<w:b/>' : '') + (f.i ? '<w:i/>' : '') + (f.u ? '<w:u w:val="single"/>' : '') + (f.s ? '<w:strike/>' : '') + (f.color ? `<w:color w:val="${f.color}"/>` : '') + (f.sz ? `<w:sz w:val="${f.sz}"/><w:szCs w:val="${f.sz}"/>` : '');
  const bits = String(text).split('\n').map(x => `<w:t xml:space="preserve">${dgX(x)}</w:t>`).join('<w:br/>');
  return `<w:r>${pr ? `<w:rPr>${pr}</w:rPr>` : ''}${bits}</w:r>`;
}
const dgWp = (style, runs, ppr = '') => `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${ppr}</w:pPr>${runs}</w:p>`;
const dgWruns = (text, o, base = {}) => dgRuns(text, o.tags).map(r => dgWr(r.t, { ...base, b: base.b || r.b, i: base.i || r.i, u: r.u, s: r.s })).join('');
function dgWcell(w, inner, o = {}) {
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${o.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.shade}"/>` : ''}</w:tcPr>${inner || '<w:p/>'}</w:tc>`;
}
function dgDocxXml(d, o) {
  const body = [dgWp('Title', dgWr(d.title)), dgWp('Meta', dgWr(d.date + ' · ' + dgStat(d)))];
  const cols = o.num ? [620, 1500, 4818, 2700] : [1500, 5438, 2700];
  const bord = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="B8BCC6"/>`).join('');
  for (const sec of d.secs) {
    body.push(dgWp('Heading1', dgWr(sec.title)));
    if (sec.sub) body.push(dgWp('Heading2', dgWr(sec.sub)));
    if (sec.summary) body.push(dgWp('Meta', dgWr(t('dg.sum') + ': ' + sec.summary, { i: true })));
    if (o.layout === 'table') {
      const head = (o.num ? [t('dg.col.no')] : []).concat([t('dg.col.who'), t('dg.col.text'), t('dg.col.rem')]);
      let tbl = `<w:tbl><w:tblPr><w:tblW w:w="${cols.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>${bord}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${cols.map(c => `<w:gridCol w:w="${c}"/>`).join('')}</w:tblGrid>`;
      tbl += `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${head.map((x, i) => dgWcell(cols[i], dgWp('Cell', dgWr(x, { b: true }), ''), { shade: 'E8ECF4' })).join('')}</w:tr>`;
      for (const r of sec.rows) {
        const cells = [];
        if (o.num) cells.push(dgWcell(cols[0], dgWp('Cell', dgWr(String(r.i), { color: '888888', sz: 18 }))));
        const ci = o.num ? 1 : 0, ind = r.kind === 'choice' ? '<w:ind w:left="240"/>' : '';
        cells.push(dgWcell(cols[ci], dgWp('Cell', dgWr(dgWho(r, o), { b: r.kind === 'say' }))));
        cells.push(dgWcell(cols[ci + 1], dgWp('Cell', (r.kind === 'choice' ? dgWr('▸ ', { color: '2F4F8F' }) : '') + dgWruns(r.text, o, { i: r.kind === 'menu' }), ind)));
        cells.push(dgWcell(cols[ci + 2], ''));
        tbl += `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cells.join('')}</w:tr>`;
      }
      body.push(tbl + '</w:tbl>', dgWp('', ''));
    } else {
      for (const r of sec.rows) {
        const no = o.num ? dgWr(r.i + '  ', { color: '999999', sz: 16 }) : '';
        if (r.kind === 'choice') body.push(dgWp('Line', no + dgWr('▸ ', { color: '2F4F8F' }) + dgWruns(r.text, o), '<w:ind w:left="567"/>'));
        else if (r.kind === 'menu') body.push(dgWp('Line', no + dgWruns(r.text, o, { i: true }), '<w:ind w:left="567"/>'));
        else body.push(dgWp('Line', no + (r.name ? dgWr(r.name + ': ', { b: true }) : '') + dgWruns(r.text, o)));
      }
    }
  }
  const sect = '<w:sectPr><w:footerReference w:type="default" r:id="rIdF"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${DG_W}><w:body>${body.join('')}${sect}</w:body></w:document>`;
}
function dgDocx(d, o) {
  const font = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/>';
  const st = (id, name, ppr, rpr, extra = '') => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/>${extra}<w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${DG_W}><w:docDefaults><w:rPrDefault><w:rPr>${font}<w:sz w:val="23"/><w:szCs w:val="23"/><w:lang w:val="${S.lang === 'ru' ? 'ru-RU' : 'en-US'}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
    + st('Title', 'Title', '<w:spacing w:after="60"/>', '<w:b/><w:sz w:val="44"/><w:szCs w:val="44"/>', '<w:next w:val="Normal"/>')
    + st('Meta', 'Meta', '<w:spacing w:after="240"/>', '<w:color w:val="777777"/><w:sz w:val="19"/><w:szCs w:val="19"/>')
    + st('Heading1', 'heading 1', '<w:keepNext/><w:spacing w:before="420" w:after="80"/><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="2" w:color="2F4F8F"/></w:pBdr><w:outlineLvl w:val="0"/>', '<w:b/><w:color w:val="1F3864"/><w:sz w:val="32"/><w:szCs w:val="32"/>', '<w:next w:val="Normal"/>')
    + st('Heading2', 'heading 2', '<w:keepNext/><w:spacing w:before="200" w:after="60"/><w:outlineLvl w:val="1"/>', '<w:b/><w:color w:val="444444"/><w:sz w:val="26"/><w:szCs w:val="26"/>', '<w:next w:val="Normal"/>')
    + st('Line', 'Script line', '<w:spacing w:before="40" w:after="80"/>', '')
    + st('Cell', 'Table cell', '<w:spacing w:before="20" w:after="20" w:line="252" w:lineRule="auto"/>', '<w:sz w:val="22"/><w:szCs w:val="22"/>')
    + '</w:styles>';
  const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${DG_W}><w:p><w:pPr><w:jc w:val="right"/></w:pPr>${dgWr((P.name || '') + ' · ' + t('dg.page') + ' ', { color: '888888', sz: 17 })}<w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="17"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="17"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
  const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', CT = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${CT}.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="${CT}.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="${CT}.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
    { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="${R}/styles" Target="styles.xml"/><Relationship Id="rIdF" Type="${R}/footer" Target="footer1.xml"/></Relationships>` },
    { name: 'word/document.xml', data: dgDocxXml(d, o) }, { name: 'word/styles.xml', data: styles }, { name: 'word/footer1.xml', data: footer },
    { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${dgX(d.title)}</dc:title><dc:creator>${dgX(P.name || '')}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>` },
  ];
  const z = makeZip(files);
  return new Blob([z], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/* ---------- печать в PDF ---------- */
function dgPrint(html) {
  return new Promise(res => {
    try {
      const fr = document.createElement('iframe');
      fr.setAttribute('aria-hidden', 'true'); fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
      fr.onload = () => {
        try {
          const w = fr.contentWindow; w.focus();
          w.addEventListener('afterprint', () => setTimeout(() => fr.remove(), 200));
          setTimeout(() => { try { fr.remove(); } catch (e) { /* уже убран */ } }, 180000);
          w.print(); res(true);
        } catch (e) { fr.remove(); res(false); }
      };
      fr.srcdoc = html; document.body.append(fr);
    } catch (e) { res(false); }
  });
}

/* ---------- окно ---------- */
function openDigest(opts = {}) {
  closePopover();
  const o = DG_ST;
  if (opts.nodeId !== undefined) o.scope = opts.nodeId;
  const nSel = [...UI.sel].filter(id => nodeById(id) && nodeById(id).type !== 'note').length;
  if (o.scope === 'sel' && !nSel) o.scope = '';
  if (o.scope && o.scope !== 'sel' && !nodeById(o.scope)) o.scope = '';
  let timer = 0;
  openModal({
    cls: 'dg-m', onClose: () => clearTimeout(timer),
    build: m => {
      const ctl = h('div', { class: 'dg-ctl' }), stat = h('div', { class: 'dg-stat' });
      const frame = h('iframe', { class: 'dg-frame', title: t('dg.title') });
      const btns = h('div', { class: 'dg-btns' });
      const redraw = () => { clearTimeout(timer); timer = setTimeout(paint, 100); };
      const set = (k, v) => { o[k] = v; render(); redraw(); };
      const sw = (k, label, hint) => h('div', { class: 'dg-swi' }, switchEl(o[k], v => { o[k] = v; redraw(); }, label), hint ? h('div', { class: 'hint' }, hint) : null);
      const blocks = () => {
        const seen = new Set(); const out = [];
        for (const r of rtCollect()) if (!seen.has(r.n.id)) { seen.add(r.n.id); out.push(r.n); }
        return out;
      };
      const render = () => {
        const sel = h('select', { class: 'inp', id: 'dg-scope' }, h('option', { value: '' }, t('dg.scope.all')), ...(nSel ? [h('option', { value: 'sel' }, t('dg.scope.sel', nSel))] : []), ...blocks().map(n => h('option', { value: n.id }, n.title)));
        sel.value = o.scope; sel.addEventListener('change', () => set('scope', sel.value));
        ctl.replaceChildren(
          field(t('dg.scope'), sel),
          field(t('dg.layout'), segmented([{ value: 'flow', label: t('dg.l.flow') }, { value: 'table', label: t('dg.l.table') }], o.layout, v => set('layout', v))),
          field(t('dg.names'), segmented([{ value: 'name', label: t('dg.n.name') }, { value: 'tag', label: t('dg.n.tag') }], o.names, v => set('names', v))),
          field(t('dg.tags'), segmented([{ value: 'fmt', label: t('dg.t.fmt') }, { value: 'strip', label: t('dg.t.strip') }, { value: 'keep', label: t('dg.t.keep') }], o.tags, v => set('tags', v)), o.tags === 'fmt' ? t('dg.t.fmt.h') : null),
          field(t('dg.inc'), h('div', { class: 'dg-sw' }, sw('narr', t('dg.i.narr')), sw('choice', t('dg.i.choice')), sw('sum', t('dg.i.sum')), sw('num', t('dg.i.num'), t('dg.i.num.h')))));
      };
      const paint = () => {
        let d; try { d = dgBuild(o); } catch (e) { return; }
        stat.replaceChildren(h('b', {}, dgStat(d)));
        const none = !d.lines;
        frame.srcdoc = none ? `<!doctype html><meta charset="utf-8"><style>body{font:14px sans-serif;color:#888;padding:30px}</style><p>${dgX(t('dg.empty'))}</p>` : dgHtml(d, o, 60);
        btns.querySelectorAll('button').forEach(b => { b.disabled = none; });
      };
      const save = async (ext, mk, mime) => {
        const d = dgBuild(o); if (!d.lines) return;
        const data = await mk(d);
        const ok = await saveFile(slug(P.name) + '_digest.' + ext, data, mime);
        if (ok) toast(t('dg.saved', d.lines));
      };
      const mkBtn = (label, onclick, tip, cls = '') => h('button', { class: 'btn ' + cls, 'data-tip': tip || null, onclick }, label);
      btns.append(
        mkBtn([icon('download', 16), t('dg.word')], () => save('docx', d => dgDocx(d, o), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), null, 'primary'),
        mkBtn(t('dg.pdf'), async () => { const ok = await dgPrint(dgHtml(dgBuild(o), o)); if (!ok) toast(t('dg.pdf.fail'), 5000); }, t('dg.pdf.t')),
        mkBtn(t('dg.html'), () => save('html', d => dgHtml(d, o), 'text/html')),
        mkBtn(t('dg.txt'), () => save('txt', d => dgText(d, o, false), 'text/plain')),
        mkBtn(t('dg.md'), () => save('md', d => dgText(d, o, true), 'text/markdown')));
      render(); paint();
      return h('div', { class: 'm-wrap' }, modalHead(t('dg.title'), m), h('div', { class: 'dg-body' }, ctl, h('div', { class: 'dg-prev' }, stat, frame)), h('div', { class: 'm-foot dg-foot' }, h('div', { class: 'grow' }), btns));
    }
  });
}
TOOL_ITEMS.push({ id: 'digest', group: 'story', ic: 'docSearch', key: 'dg.btn', kw: 'digest proofreading proofread corrector word docx print pdf script text выжимка вычитка корректор сценарий текст реплики ворд', run: () => openDigest() });

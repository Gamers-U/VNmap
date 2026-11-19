'use strict';
/* ====== Таблица реплик: все реплики проекта в одной таблице, фильтры, правка на месте, выгрузка в CSV и XLSX ======
   Реплики берутся из скриптов теми же разборщиками, что и перевод (tlScan). Правка пишет изменения обратно в нужную строку скрипта:
   меняется только текст в кавычках и (при смене говорящего) имя перед ним, всё остальное в строке (id, with, if…) остаётся как есть. */
Object.assign(D, {
  'rt.btn': ['Таблица реплик…', 'Replica table…'],
  'rt.title': ['Таблица реплик', 'Replica table'],
  'rt.q': ['Поиск: текст, персонаж, блок', 'Search: text, character, block'],
  'rt.who.all': ['Все говорящие', 'All speakers'],
  'rt.who.none': ['Без имени (рассказчик)', 'No name (narrator)'],
  'rt.blk.all': ['Все блоки', 'All blocks'],
  'rt.k.all': ['Всё', 'All'], 'rt.k.say': ['Реплики', 'Lines'], 'rt.k.choice': ['Выборы', 'Choices'],
  'rt.unk': ['Нет в персонажах: {0}', 'Not in characters: {0}'],
  'rt.unk.tip': ['Показать реплики тех, кого нет на вкладке «Персонажи»', 'Show lines of speakers missing from the Characters tab'],
  'rt.unk1': ['нет карточки', 'no card'],
  'rt.col.n': ['№', '#'], 'rt.col.block': ['Блок', 'Block'], 'rt.col.who': ['Кто', 'Who'], 'rt.col.text': ['Текст', 'Text'], 'rt.col.words': ['Слов', 'Words'],
  'rt.col.kind': ['Тип', 'Type'],
  'rt.narr': ['рассказчик', 'narrator'],
  'rt.kind.say': ['реплика', 'line'], 'rt.kind.choice': ['выбор', 'choice'], 'rt.kind.caption': ['вопрос меню', 'menu question'], 'rt.kind.with': ['реплика', 'line'], 'rt.kind.line': ['реплика', 'line'],
  'rt.sum': ['Показано {0} из {1} · {2} · читать около {3}', 'Showing {0} of {1} · {2} · about {3} to read'],
  'rt.words': [['{0} слово', '{0} слова', '{0} слов'], ['{0} word', '{0} words']],
  'rt.none': ['Ничего не найдено. Измените фильтры.', 'Nothing found. Change the filters.'],
  'rt.empty': ['В проекте пока нет реплик. Они появятся, когда в скриптах блоков будут строки вида: имя "текст".', 'There are no lines yet. They appear once block scripts contain lines like: name "text".'],
  'rt.more': ['Показать ещё', 'Show more'],
  'rt.export': ['Выгрузить', 'Export'],
  'rt.exp.csv': ['Таблица CSV (для Excel и Google Таблиц)', 'CSV table (for Excel and Google Sheets)'],
  'rt.exp.xlsx': ['Таблица Excel (.xlsx)', 'Excel table (.xlsx)'],
  'rt.exp.hint': ['Выгружается то, что сейчас показано в таблице', 'Exports what the table currently shows'],
  'rt.exp.done': [['Выгружена {0} строка', 'Выгружено {0} строки', 'Выгружено {0} строк'], ['Exported {0} row', 'Exported {0} rows']],
  'rt.edit.tip': ['Нажмите, чтобы править. Enter: сохранить, Shift+Enter: новая строка, Tab: следующая реплика, Esc: отмена', 'Click to edit. Enter: save, Shift+Enter: new line, Tab: next line, Esc: cancel'],
  'rt.who.tip': ['Нажмите, чтобы сменить говорящего (пусто = рассказчик)', 'Click to change the speaker (empty = narrator)'],
  'rt.who.ph': ['метка', 'tag'],
  'rt.bad.who': ['Метка говорящего: латинские буквы, цифры и «_», не с цифры, и не служебное слово Ren\'Py', 'Speaker tag: Latin letters, digits and "_", not starting with a digit, and not a Ren\'Py keyword'],
  'rt.bad.empty': ['Текст не может быть пустым. Чтобы убрать реплику, удалите строку в скрипте.', 'The text cannot be empty. To remove a line, delete it in the script.'],
  'rt.stale': ['Скрипт изменился, пока открыта таблица. Обновил её, повторите правку.', 'The script changed while the table was open. The table was refreshed; please repeat the edit.'],
  'rt.open': ['Открыть эту строку в скрипте', 'Open this line in the script'],
  'rt.sort': ['Сортировать', 'Sort'],
  'rt.sheet': ['Реплики', 'Lines'],
  'rt.file.who': ['Метка', 'Tag'], 'rt.file.name': ['Персонаж', 'Character'],
  'rt.file.block': ['Блок', 'Block'], 'rt.file.file': ['Файл', 'File'],
});

const RT_NONE = '*none';
const RT_PAGE = 150;
/** Текст из литерала Ren'Py: \" и \' становятся кавычками, \n — переводом строки; остальные экранирования остаются как есть. */
function rtUnescape(body) {
  let out = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '\\' && i + 1 < body.length) {
      const d = body[++i];
      out += d === 'n' ? '\n' : (d === '"' || d === "'") ? d : c + d;
    } else out += c;
  }
  return out;
}
const rtChar = tag => P.characters.find(c => c.tag === tag) || null;
const rtWhoName = tag => { if (!tag) return ''; const c = rtChar(tag); return c ? (c.name || c.tag) : tag; };
const rtFileTitle = (n, f) => (n.files.length > 1 || f.title ? (f.title || t('file.untitled')) : '');
const rtBlockName = (n, f) => n.title + (rtFileTitle(n, f) ? ' › ' + rtFileTitle(n, f) : '');
function rtMakeRow(n, f, lead, u) {
  const r = { n, f, li: u.li, lead, who: u.who, attrs: u.attrs, q: u.q, body: u.body, sub: u.sub, voice: u.voice || '', endCol: u.endCol, plain: '', words: 0, hay: '', i: 0 };
  rtFill(r);
  return r;
}
function rtFill(r) {
  r.plain = rtUnescape(r.body);
  r.words = wordCount(anPlain(r.plain));
  r.hay = (r.plain + ' ' + r.who + ' ' + rtWhoName(r.who) + ' ' + rtBlockName(r.n, r.f)).toLowerCase();
}
/** Все реплики и выборы проекта. Порядок: как их прочтёт игрок (по числу слов от старта до блока), недостижимые блоки в конце. */
function rtCollect() {
  let rank = null;
  try { const A = anPaths(); rank = A.min; } catch (e) { rank = null; }
  const list = P.nodes.map((n, ix) => ({ n, ix })).filter(x => x.n.type !== 'note');
  list.sort((a, b) => {
    const ra = rank && rank.has(a.n.id) ? rank.get(a.n.id) : Infinity, rb = rank && rank.has(b.n.id) ? rank.get(b.n.id) : Infinity;
    return ra === rb ? a.ix - b.ix : ra < rb ? -1 : 1;
  });
  const rows = []; let k = 0;
  for (const { n } of list) for (const f of n.files) {
    if (!String(f.script || '').trim()) continue;
    const raw = String(f.script).replace(/\r\n?/g, '\n').split('\n'); let lead = 0; while (lead < raw.length && !raw[lead].trim()) lead++;
    for (const u of tlScan(tlLines(f))) { const r = rtMakeRow(n, f, lead, u); r.i = ++k; rows.push(r); }
  }
  return rows;
}
/** Записывает правку в строку скрипта. Возвращает '' при успехе или код ошибки ('stale' — скрипт успел измениться). */
function rtWrite(r, patch) {
  const ff = findFile(r.f.id); if (!ff) return 'stale';
  r.f = ff.file; r.n = ff.node;                                         // после отмены действия (Ctrl+Z) или слияния объекты в проекте другие
  const f = r.f, lines = String(f.script || '').replace(/\r\n?/g, '\n').split('\n');
  let lead = 0; while (lead < lines.length && !lines[lead].trim()) lead++;
  const L = lines[lead + r.li], norm = tlLines(f)[r.li];
  if (L == null || L.replace(/\t/g, '    ').replace(/\s+$/, '') !== norm) return 'stale';
  const m = RE_TL_SAY.exec(L); if (!m) return 'stale';
  const [, pre, who, , lit, rest] = m;
  if ((who || '') !== r.who || lit.slice(1, -1).replace(/\t/g, '    ') !== r.body) return 'stale';
  const q = lit[0], start = L.length - rest.length - lit.length;
  let head = L.slice(0, start), body = lit.slice(1, -1);
  if (patch.who !== undefined && patch.who !== r.who) head = pre + (patch.who ? patch.who + ' ' : '');
  if (patch.plain !== undefined) body = tlFixRaw(patch.plain, q);
  lines[lead + r.li] = head + q + body + q + rest;
  f.script = lines.join('\n');
  commit(true);
  if (patch.who !== undefined && patch.who !== r.who) { r.who = patch.who; r.attrs = ''; }
  r.body = body.replace(/\t/g, '    ');
  rtFill(r);
  try { refreshNode(r.n.id); } catch (e) { /* карта может быть не построена */ }
  return '';
}
const rtValidWho = w => /^[A-Za-z_]\w*$/.test(w) && !TL_SKIP.has(w);

/* ---------- выгрузка ---------- */
function rtTable(list) {
  const head = [t('rt.col.n'), t('rt.file.block'), t('rt.file.file'), t('rt.file.who'), t('rt.file.name'), t('rt.col.kind'), t('rt.col.text'), t('rt.col.words')];
  const rows = [head];
  list.forEach((r, i) => rows.push([r.i, r.n.title, rtFileTitle(r.n, r.f), r.who, rtWhoName(r.who), t('rt.kind.' + r.sub), r.plain, r.words]));
  return rows;
}
function rtExportCsv(list) {
  const sep = S.lang === 'ru' ? ';' : ',';
  const text = '﻿' + rtTable(list).map(r => r.map(x => { x = String(x == null ? '' : x); return /["\r\n;,]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(sep)).join('\r\n') + '\r\n';
  return saveFile((slug(P.name) || 'project') + '_replicas.csv', text, 'text/csv');
}
function rtExportXlsx(list) {
  const blob = makeXlsx([{ name: t('rt.sheet'), rows: rtTable(list), widths: [6, 24, 18, 10, 18, 13, 90, 8] }]);
  return saveFile((slug(P.name) || 'project') + '_replicas.xlsx', blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ---------- окно ---------- */
function openReplicaTable(opts) {
  opts = opts || {};
  closePopover();
  const st = { q: opts.q || '', who: opts.who || '', blk: opts.blk || '', kind: opts.kind || 'all', unk: false, sort: 'story', dir: 1, shown: RT_PAGE };
  let rows = rtCollect(), view = [], editing = null, ver = DATA_VER, poll = 0;
  openModal({
    cls: 'rt-m', onClose: () => clearInterval(poll), build: m => {
      const tbody = h('tbody'), wrap = h('div', { class: 'rt-wrap scroll' }), sum = h('div', { class: 'rt-sum' });
      const q = h('input', { class: 'inp', type: 'text', placeholder: t('rt.q'), value: st.q, spellcheck: 'false' });
      const selWho = h('select', { class: 'inp sm rt-sel' }), selBlk = h('select', { class: 'inp sm rt-sel' });
      const kindSeg = h('div', { class: 'seg-wrap' }), unkBtn = h('button', { class: 'btn sm rt-unk', 'data-tip': t('rt.unk.tip') });
      const thead = h('thead');

      const refreshRows = () => { rows = rtCollect(); ver = DATA_VER; };
      const fillSelects = () => {
        const cnt = new Map(); let none = 0;
        for (const r of rows) { if (r.sub === 'choice') continue; if (!r.who) none++; else cnt.set(r.who, (cnt.get(r.who) || 0) + 1); }
        selWho.replaceChildren(h('option', { value: '' }, t('rt.who.all')), h('option', { value: RT_NONE }, t('rt.who.none') + ' · ' + none));
        for (const [w, c] of [...cnt.entries()].sort((a, b) => b[1] - a[1])) selWho.append(h('option', { value: w }, rtWhoName(w) + (rtChar(w) ? '' : ' (' + w + ')') + ' · ' + c));
        selWho.value = st.who;
        const seen = new Map();
        for (const r of rows) if (!seen.has(r.f.id)) seen.set(r.f.id, { name: rtBlockName(r.n, r.f), c: 0 });
        for (const r of rows) seen.get(r.f.id).c++;
        selBlk.replaceChildren(h('option', { value: '' }, t('rt.blk.all')));
        for (const [fid, o] of seen) selBlk.append(h('option', { value: fid }, o.name + ' · ' + o.c));
        selBlk.value = st.blk;
        if (selBlk.value !== st.blk) { st.blk = ''; selBlk.value = ''; }
        if (selWho.value !== st.who) { st.who = ''; selWho.value = ''; }
      };
      const unkCount = () => { const tags = new Set(P.characters.map(c => c.tag)); return rows.filter(r => r.who && !tags.has(r.who)).length; };
      const filtered = () => {
        const toks = palToks(st.q), tags = new Set(P.characters.map(c => c.tag));
        let list = rows.filter(r => {
          if (st.kind === 'say' && r.sub === 'choice') return false;
          if (st.kind === 'choice' && r.sub !== 'choice') return false;
          if (st.who === RT_NONE ? (r.who || r.sub === 'choice') : (st.who && r.who !== st.who)) return false;
          if (st.blk && r.f.id !== st.blk) return false;
          if (st.unk && !(r.who && !tags.has(r.who))) return false;
          return !toks.length || toks.every(k => r.hay.includes(k));
        });
        if (st.sort === 'who') list = list.slice().sort((a, b) => st.dir * rtWhoName(a.who).localeCompare(rtWhoName(b.who)) || a.i - b.i);
        else if (st.sort === 'words') list = list.slice().sort((a, b) => st.dir * (a.words - b.words) || a.i - b.i);
        return list;
      };

      /* ---- ячейки ---- */
      const whoEl = r => {
        if (!r.who) return h('span', { class: 'rt-narr' }, r.sub === 'choice' ? '—' : t('rt.narr'));
        const c = rtChar(r.who);
        return h('span', { class: 'rt-whoc' + (c ? '' : ' unk') }, h('i', { class: 'rt-dot', style: { background: c ? 'var(--c-' + c.color + ')' : 'var(--text3)' } }), h('span', c ? (c.name || c.tag) : r.who), c ? null : h('em', ' ' + t('rt.unk1')));
      };
      const textEl = (r, qq) => {
        const box = h('div', { class: 'rt-t' });
        if (r.sub === 'choice' || r.sub === 'caption') box.append(h('span', { class: 'rt-kind k-' + r.sub }, t('rt.kind.' + r.sub)));
        box.append(...(qq ? markText(r.plain, qq) : [r.plain]));
        return box;
      };
      const buildRow = r => {
        const tr = h('tr', { class: 'rt-r k-' + r.sub }); tr._r = r;
        paintRow(tr);
        return tr;
      };
      const paintRow = tr => {
        const r = tr._r, qq = palToks(st.q)[0] || '';
        const ft = rtFileTitle(r.n, r.f);
        const blk = h('button', { class: 'rt-blk', 'data-tip': t('rt.open') + ': ' + rtBlockName(r.n, r.f), onclick: () => { m.close(); palOpenLine(r.n.id, r.f.id, r.li, r.lead); } }, h('span', { class: 'b1' }, r.n.title), ft ? h('span', { class: 'b2' }, ft) : null);
        const tdWho = h('td', { class: 'rt-c-who' + (r.sub === 'choice' ? ' off' : ''), 'data-tip': r.sub === 'choice' ? null : t('rt.who.tip'), onclick: () => { if (r.sub !== 'choice') editWho(tr); } }, whoEl(r));
        const tdTxt = h('td', { class: 'rt-c-text', 'data-tip': t('rt.edit.tip'), onclick: ev => { if (ev.target.closest('textarea')) return; editText(tr); } }, textEl(r, qq));
        tr.replaceChildren(h('td', { class: 'rt-c-n' }, String(r.i)), h('td', { class: 'rt-c-blk' }, blk), tdWho, tdTxt, h('td', { class: 'rt-c-w' }, String(r.words)));
      };
      const nextRow = (tr, dir) => { let x = dir > 0 ? tr.nextElementSibling : tr.previousElementSibling; return x && x._r ? x : null; };

      /* ---- правка текста ---- */
      const editText = tr => {
        if (editing && editing.tr === tr && editing.kind === 'text') return;
        if (editing) editing.finish(true);
        const r = tr._r, td = tr.querySelector('.rt-c-text');
        const ta = h('textarea', { class: 'ta rt-ta', rows: 1, spellcheck: 'true' });
        ta.value = r.plain; td.replaceChildren(ta); td.classList.add('editing'); autosize(ta);
        let done = false;
        const finish = (save, move) => {
          if (done) return; done = true; editing = null;
          td.classList.remove('editing');
          let next = null;
          if (save && ta.value !== r.plain) {
            const val = ta.value.replace(/\s+$/, '');
            if (!val.trim()) { toast(t('rt.bad.empty'), 4200); }
            else {
              const err = rtWrite(r, { plain: val }); ver = DATA_VER;
              if (err === 'stale') { toast(t('rt.stale'), 5000); refreshRows(); fillSelects(); render(false); return; }
            }
          }
          if (move) next = nextRow(tr, move);
          paintRow(tr);
          if (next) editText(next);
          if (next) next.scrollIntoView({ block: 'nearest' });
          updateSum();
        };
        editing = { tr, kind: 'text', finish };
        ta.addEventListener('input', () => autosize(ta));
        ta.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); finish(true); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
          else if (e.key === 'Tab') { e.preventDefault(); finish(true, e.shiftKey ? -1 : 1); }
        });
        ta.addEventListener('blur', () => setTimeout(() => finish(true), 0));
        ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      };
      /* ---- правка говорящего ---- */
      const editWho = tr => {
        if (editing && editing.tr === tr && editing.kind === 'who') return;
        if (editing) editing.finish(true);
        const r = tr._r, td = tr.querySelector('.rt-c-who');
        const dl = h('datalist', { id: 'rt-dl' }, ...P.characters.filter(c => c.tag).map(c => h('option', { value: c.tag }, c.name || c.tag)));
        const inp = h('input', { class: 'inp sm rt-wi', type: 'text', value: r.who, placeholder: t('rt.who.ph'), list: 'rt-dl', spellcheck: 'false', autocomplete: 'off' });
        td.replaceChildren(inp, dl); td.classList.add('editing');
        let done = false;
        const finish = save => {
          if (done) return; done = true; editing = null;
          td.classList.remove('editing');
          if (save) {
            let v = inp.value.trim();
            const byName = v && P.characters.find(c => c.name && c.name.toLowerCase() === v.toLowerCase());
            if (byName && byName.tag) v = byName.tag;
            if (v !== r.who) {
              if (v && !rtValidWho(v)) toast(t('rt.bad.who'), 5000);
              else {
                const err = rtWrite(r, { who: v }); ver = DATA_VER;
                if (err === 'stale') { toast(t('rt.stale'), 5000); refreshRows(); fillSelects(); render(false); return; }
                fillSelects();
                if (st.who && st.who !== r.who) { render(false); return; }
              }
            }
          }
          paintRow(tr); updateSum();
        };
        editing = { tr, kind: 'who', finish };
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); finish(true); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
        });
        inp.addEventListener('blur', () => setTimeout(() => finish(true), 0));
        inp.focus(); inp.select();
      };

      /* ---- отрисовка ---- */
      const updateSum = () => {
        const words = view.reduce((a, r) => a + r.words, 0);
        sum.textContent = t('rt.sum', fmtNum(view.length), fmtNum(rows.length), t('rt.words', words), fmtDur(words));
      };
      const appendMore = () => {
        const from = tbody.children.length, to = Math.min(view.length, from + RT_PAGE);
        const frag = document.createDocumentFragment();
        for (let i = from; i < to; i++) frag.append(buildRow(view[i]));
        tbody.append(frag);
      };
      const heads = () => {
        const th = (key, sort, cls) => h('th', { class: cls + (sort ? ' sortable' + (st.sort === sort ? ' on' : '') : ''), onclick: sort ? () => { if (st.sort === sort) st.dir = -st.dir; else { st.sort = sort; st.dir = sort === 'words' ? -1 : 1; } render(false); } : () => { st.sort = 'story'; st.dir = 1; render(false); } },
          t(key), sort && st.sort === sort ? h('span', { class: 'rt-arrow' }, st.dir > 0 ? '↑' : '↓') : null);
        thead.replaceChildren(h('tr', th('rt.col.n', null, 'rt-c-n'), h('th', { class: 'rt-c-blk' }, t('rt.col.block')), th('rt.col.who', 'who', 'rt-c-who'), h('th', { class: 'rt-c-text' }, t('rt.col.text')), th('rt.col.words', 'words', 'rt-c-w')));
      };
      const render = (keepScroll) => {
        if (editing) editing.finish(true);
        const top = wrap.scrollTop;
        view = filtered(); heads();
        tbody.replaceChildren();
        if (!view.length) {
          tbody.append(h('tr', h('td', { colspan: 5, class: 'rt-empty' }, rows.length ? t('rt.none') : t('rt.empty'))));
        } else { const n0 = Math.max(RT_PAGE, keepScroll ? st.shown : RT_PAGE); for (let i = 0; i < Math.min(view.length, n0); i++) tbody.append(buildRow(view[i])); }
        st.shown = tbody.children.length;
        wrap.scrollTop = keepScroll ? top : 0;
        const uc = unkCount();
        unkBtn.style.display = uc || st.unk ? '' : 'none';
        unkBtn.className = 'btn sm rt-unk' + (st.unk ? ' on' : '');
        unkBtn.textContent = t('rt.unk', uc);
        kindSeg.replaceChildren(segmented([{ value: 'all', label: t('rt.k.all') }, { value: 'say', label: t('rt.k.say') }, { value: 'choice', label: t('rt.k.choice') }], st.kind, v => { st.kind = v; render(false); }));
        updateSum();
      };

      q.addEventListener('input', () => { st.q = q.value; render(false); });
      selWho.addEventListener('change', () => { st.who = selWho.value; render(false); });
      selBlk.addEventListener('change', () => { st.blk = selBlk.value; render(false); });
      unkBtn.addEventListener('click', () => { st.unk = !st.unk; render(false); });
      wrap.addEventListener('scroll', () => { if (tbody.children.length < view.length && wrap.scrollTop + wrap.clientHeight > wrap.scrollHeight - 500) appendMore(); });

      const exportBtn = h('button', { class: 'btn sm', onclick: b => menuAt(b.currentTarget, [
        { header: t('rt.exp.hint') },
        { label: t('rt.exp.xlsx'), icon: 'download', onClick: () => { rtExportXlsx(view).then(ok => ok && toast(t('rt.exp.done', view.length))); } },
        { label: t('rt.exp.csv'), icon: 'download', onClick: () => { rtExportCsv(view).then(ok => ok && toast(t('rt.exp.done', view.length))); } },
      ]) }, icon('download', 15), h('span', t('rt.export')));
      exportBtn.classList.add('rt-exp');

      fillSelects();
      wrap.append(h('table', { class: 'rt' }, thead, tbody));
      render(false);
      m.rtRefresh = () => { refreshRows(); fillSelects(); render(true); };
      poll = setInterval(() => { if (m.closed || editing || DATA_VER === ver) return; m.rtRefresh(); }, 700);   // скрипт могли изменить снаружи: отмена, слияние с коллегой
      return h('div', { class: 'm-wrap rt-wrapall' },
        modalHead(t('rt.title'), m),
        h('div', { class: 'm-pad rt-bar' }, q, selWho, selBlk, kindSeg, unkBtn, exportBtn),
        wrap, h('div', { class: 'rt-foot' }, sum));
    }
  });
}
TOOL_ITEMS.push({ id: 'replicas', group: 'story', ic: 'table', key: 'rt.btn', kw: 'replicas lines dialogue table csv excel xlsx реплики диалоги таблица текст выгрузка', run: () => openReplicaTable() });

/* ---------- XLSX без библиотек: минимальный Open XML в архиве без сжатия ---------- */
const xlsxEsc = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function xlsxCol(i) { let s = ''; i++; while (i > 0) { const k = (i - 1) % 26; s = String.fromCharCode(65 + k) + s; i = Math.floor((i - 1) / 26); } return s; }
/** sheets: [{ name, rows: [[…]], widths?: [число…] }]. Первая строка — заголовок (жирный, закреплён, с фильтром). Числа остаются числами. */
function makeXlsx(sheets) {
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const files = [];
  const names = sheets.map((s, i) => String(s.name || 'Sheet' + (i + 1)).replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 31) || 'Sheet' + (i + 1));
  files.push({ name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' });
  files.push({ name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` });
  files.push({ name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${NS}" xmlns:r="${RN}"><sheets>` + names.map((n, i) => `<sheet name="${xlsxEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>' });
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
  files.push({ name: 'xl/styles.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EAF0"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` });
  sheets.forEach((s, si) => {
    const rows = s.rows || [], ncol = Math.max(1, ...rows.map(r => r.length));
    const body = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => {
      const ref = xlsxCol(ci) + (ri + 1);
      if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}" s="${ri === 0 ? 1 : 3}"><v>${v}</v></c>`;
      return `<c r="${ref}" s="${ri === 0 ? 1 : 2}" t="inlineStr"><is><t xml:space="preserve">${xlsxEsc(String(v == null ? '' : v).slice(0, 32000))}</t></is></c>`;
    }).join('') + '</row>').join('');
    const cols = s.widths && s.widths.length ? '<cols>' + s.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>' : '';
    const last = xlsxCol(ncol - 1) + Math.max(1, rows.length);
    files.push({ name: `xl/worksheets/sheet${si + 1}.xml`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${NS}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${body}</sheetData><autoFilter ref="A1:${last}"/></worksheet>` });
  });
  return makeZip(files);
}

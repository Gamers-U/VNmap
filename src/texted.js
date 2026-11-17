'use strict';
/* ====== Редактор текста: главы прозой, вкладки, пометки «развилка», живой предпросмотр сценария ======
   Окно из трёх частей: слева главы проекта, по центру текст выбранной главы (вкладки сверху), справа сценарий Ren'Py,
   который получится из этого текста. Правила текста описаны в prose.js. Всё, что набрано, сохраняется в проекте само (f.text).
   Пометка «// развилка: …» в тексте интерактивная: если поставить на неё курсор или щёлкнуть, под текстом появится карточка
   со всеми ветками из этого блока (куда ведут стрелки, что там происходит) и кнопкой «открыть» — глава ветки откроется
   в новой вкладке. Набор открытых вкладок сохраняется вместе с проектом (P.teTabs). */

Object.assign(D, {
  'te.btn': ['Редактор текста…', 'Text editor…'],
  'te.title': ['Редактор текста', 'Text editor'],
  'te.chapters': ['Главы', 'Chapters'],
  'te.import': ['Импорт', 'Import'],
  'te.pasted': ['Вставлено с форматированием. Ctrl+Shift+V вставит простой текст.', 'Pasted with formatting. Ctrl+Shift+V pastes plain text.'],
  'te.search': ['Найти главу или слово…', 'Find a chapter or word…'],
  'te.none': ['В проекте пока нет глав. Создайте блок на карте.', 'No chapters yet. Create a block on the map.'],
  'te.nomatch': ['Ничего не найдено', 'Nothing found'],
  'te.tab.new': ['Открыть ещё главу во вкладке', 'Open another chapter in a tab'],
  'te.tab.close': ['Закрыть вкладку', 'Close tab'],
  'te.tab.live': ['Сценарий ведётся из текста', 'The script follows this text'],
  'te.focus': ['Режим письма: только текст', 'Writing mode: text only'],
  'te.focus.off': ['Вернуть списки и предпросмотр', 'Bring back lists and preview'],
  'te.opts': ['Правила разбора текста', 'Parsing rules'],
  'te.ph': ['Пишите, как в Google Docs.\n\n— Привет, — сказал Алекс.\n«Привет», — ответила Мира.\nМира: Привет.\n\n@ scene bg room\n// заметка автору\n// развилка: куда пойдёт герой\n## Название сцены',
    'Write as in Google Docs.\n\n"Hi," said Alex.\nMira: Hi.\n\n@ scene bg room\n// note to self\n// fork: where the hero goes\n## Scene title'],
  'te.tb.b': ['Жирный (Ctrl+B)', 'Bold (Ctrl+B)'], 'te.tb.i': ['Курсив (Ctrl+I)', 'Italic (Ctrl+I)'],
  'te.tb.dash': ['Тире: реплика с новой строки', 'Dash: start a line of speech'],
  'te.tb.quote': ['Кавычки «ёлочки»', 'Quotation marks'],
  'te.tb.who': ['Говорящий', 'Speaker'], 'te.tb.cmd': ['Команда', 'Command'],
  'te.tb.fork': ['Развилка', 'Fork'], 'te.tb.fork.tip': ['Интерактивная пометка: покажет ветки этого блока и откроет их главы', 'Interactive mark: shows this block’s branches and opens their chapters'],
  'te.tb.note': ['Заметка', 'Note'], 'te.tb.note.tip': ['Строка для автора: в сценарий и подсчёт слов не попадает', 'A line for you: not in the script and not counted'],
  'te.tb.hl': ['Выделить цветом (Ctrl+Shift+H)', 'Highlight (Ctrl+Shift+H)'], 'te.tb.hlm': ['Цвет выделения', 'Highlight colour'],
  'te.hl.off': ['Снять выделение', 'Remove highlight'], 'te.hl.next': ['Найти следующее выделение', 'Find next highlight'],
  'te.hl.none': ['В тексте нет выделений', 'No highlights in the text'],
  'te.hl.note': ['Выделение это пометка для себя: в сценарий и счётчик слов оно не попадает.', 'A highlight is a note for yourself: it is not in the script or the word count.'],
  'te.hl.n': ['выделений: {0}', 'highlights: {0}'],
  'te.hl.yellow': ['Жёлтый', 'Yellow'], 'te.hl.green': ['Зелёный', 'Green'], 'te.hl.blue': ['Голубой', 'Blue'], 'te.hl.pink': ['Розовый', 'Pink'],
  'te.hl.orange': ['Оранжевый', 'Orange'], 'te.hl.purple': ['Фиолетовый', 'Purple'], 'te.hl.red': ['Красный', 'Red'], 'te.hl.gray': ['Серый', 'Grey'],
  'te.tb.head': ['Сцена', 'Scene'], 'te.tb.head.tip': ['Заголовок сцены: попадёт в сценарий комментарием', 'Scene title: becomes a comment in the script'],
  'te.c.scene': ['Сцена (фон)…', 'Scene (background)…'], 'te.c.show': ['Показать спрайт…', 'Show sprite…'], 'te.c.hide': ['Убрать спрайт…', 'Hide sprite…'],
  'te.c.music': ['Музыка…', 'Music…'], 'te.c.sound': ['Звук…', 'Sound…'], 'te.c.fx': ['Эффект перехода…', 'Transition effect…'],
  'te.c.pause': ['Пауза', 'Pause'], 'te.c.jump': ['Переход в главу…', 'Jump to a chapter…'], 'te.c.menu': ['Меню выбора', 'Choice menu'],
  'te.c.raw': ['Своя команда', 'Custom command'],
  'te.where': ['Блок «{0}»', 'Block “{0}”'],
  'te.open.node': ['Открыть блок', 'Open block'],
  'te.pv.rows': ['Сценарий', 'Script'], 'te.pv.code': ['Код', 'Code'],
  'te.pv.empty': ['Здесь появится сценарий, как только в тексте будет хотя бы одна строка.', 'The script appears here as soon as the text has a line.'],
  'te.pv.stat': ['реплик: {0}, команд: {1}', 'lines: {0}, commands: {1}'],
  'te.pv.unk': ['без говорящего: {0}', 'no speaker: {0}'],
  'te.pv.cut': ['Показаны первые {0} строк. Остальное попадёт в сценарий целиком.', 'First {0} lines shown. The rest still goes into the script.'],
  'te.pv.name': ['Вписать имя', 'Set speaker'],
  'te.pv.narr': ['Рассказчик', 'Narrator'],
  'te.pv.fork': ['Развилка', 'Fork'],
  'te.words': ['слов: {0}', 'words: {0}'], 'te.chars': ['знаков: {0}', 'characters: {0}'], 'te.read': ['чтение: {0}', 'reading: {0}'],
  'te.sel': ['выделено слов: {0}', 'selected words: {0}'],
  'te.saved': ['Сохранено', 'Saved'], 'te.saving': ['Сохраняю…', 'Saving…'],
  'te.apply': ['Применить к сценарию', 'Apply to script'],
  'te.apply.rep': ['Заменить сценарий главы', 'Replace the chapter script'],
  'te.apply.add': ['Дописать в конец сценария', 'Append to the script'],
  'te.apply.copy': ['Скопировать сценарий', 'Copy the script'],
  'te.apply.rep.q': ['Заменить сценарий главы?', 'Replace the chapter script?'],
  'te.apply.rep.d': ['В сценарии есть то, чего нет в тексте (правки вручную). Они пропадут, но это можно отменить.', 'The script has edits that are not in the text. They will be lost, but you can undo.'],
  'te.applied': ['Сценарий обновлён: строк {0}', 'Script updated: {0} lines'],
  'te.apply.empty': ['В тексте пока нет строк', 'The text has no lines yet'],
  'te.copied': ['Сценарий скопирован', 'Script copied'],
  'te.live': ['Обновлять сценарий автоматически', 'Update the script automatically'],
  'te.live.h.on': ['Включено: каждая правка текста сразу переписывает сценарий этой главы. Сценарий руками править не нужно.', 'On: every edit of the text rewrites this chapter’s script right away. You do not need to edit the script by hand.'],
  'te.live.h.off': ['Выключено: сценарий сам не меняется. Когда текст готов, нажмите «Применить к сценарию».', 'Off: the script does not change by itself. When the text is ready, press “Apply to script”.'],
  'te.live.tip': ['Включено: сценарий главы пересоздаётся при каждой правке текста. Выключено: он меняется только по кнопке «Применить к сценарию». Блоки и стрелки на карте от этого переключателя не зависят.', 'On: the chapter script is rebuilt on every edit of the text. Off: it changes only with the “Apply to script” button. Blocks and arrows on the map do not depend on this switch.'],
  'te.live.q': ['Включить автообновление сценария?', 'Turn on the automatic script update?'],
  'te.live.d': ['Сейчас сценарий главы не создан из этого текста. После включения он будет заменён сценарием из текста (это можно отменить).', 'The chapter script was not made from this text. It will be replaced by the one built from the text (you can undo).'],
  'te.live.on': ['Включить', 'Turn on'],
  'te.conf': ['Сценарий этой главы изменили вручную, поэтому текст его не трогает.', 'This chapter’s script was edited by hand, so the text leaves it alone.'],
  'te.conf.rep': ['Заменить сценарий текстом', 'Replace the script with the text'],
  'te.conf.off': ['Больше не обновлять сценарий', 'Stop updating the script'],
  'te.fork.t': ['Развилка', 'Fork'],
  'te.fork.in': ['в блоке «{0}»', 'in block “{0}”'],
  'te.fork.n': [['{0} ветка', '{0} ветки', '{0} веток'], ['{0} branch', '{0} branches']],
  'te.fork.none': ['Из этого блока не выходит ни одной стрелки. Проведите стрелки на карте, и ветки появятся здесь.', 'No arrows leave this block. Draw arrows on the map and the branches will show up here.'],
  'te.fork.pick': ['Куда пойти? Выберите ветку:', 'Where to go? Pick a branch:'],
  'te.fork.untitled': ['Без названия', 'Untitled'],
  'te.fork.go': ['Открыть', 'Open'],
  'te.fork.map': ['Показать на карте', 'Show on map'],
  'te.fork.empty': ['Глава пока пустая', 'The chapter is empty so far'],
  'te.fork.if': ['если {0}', 'if {0}'],
  'te.fork.files': ['Глав в блоке: {0}', 'Chapters in the block: {0}'],
  'te.fork.close': ['Скрыть', 'Hide'],
  'te.fork.end': ['Концовка', 'Ending'], 'te.fork.fk': ['Развилка', 'Fork'], 'te.fork.ch': ['Глава', 'Chapter'],
  'te.fork.you': ['Пометка в тексте', 'Mark in the text'],
  'te.node.tab': ['Текст', 'Text'],
  'te.node.d': ['Эту главу можно писать прозой, как в Google Docs: реплики с тире, курсив, команды сцены. Сценарий Ren’Py программа соберёт сама.', 'Write this chapter as prose, like in Google Docs: dashed lines, italics, scene commands. The Ren’Py script is built for you.'],
  'te.node.open': ['Открыть в редакторе текста', 'Open in the text editor'],
  'te.node.live': ['Сценарий обновляется из текста. Если изменить его вручную, автообновление остановится.', 'The script is updated from the text. If you edit it by hand, the automatic update stops.'],
  'te.node.stat': ['В тексте: слов {0}, реплик {1}', 'In the text: {0} words, {1} lines'],
  'te.script.live': ['Сценарий этой главы создаётся из её текста. Если изменить его вручную, автообновление остановится, пока вы не решите, что делать.', 'This chapter’s script is built from its text. If you edit it by hand, the automatic update stops until you decide.'],
  'te.script.open': ['Открыть текст', 'Open text'],
});

/* ---------- состояние ---------- */
const TE_POS = {};                       // {fileId: {a, b, sc}}: где стоял курсор и прокрутка
const FORK_RE = /^\s*\/\/\s*(?:развилка|fork)(?![\p{L}\d_])\s*[:\-—–]?\s*(.*)$/iu;
/** Пометки «развилка» в тексте: [{line, note}] (line — номер строки с нуля). */
function teForks(text) {
  const out = [];
  String(text || '').replace(/\r/g, '').split('\n').forEach((l, i) => { const m = l.match(FORK_RE); if (m) out.push({ line: i, note: m[1].trim() }); });
  return out;
}
const teFind = id => { const r = id ? findFile(id) : null; return r ? { n: r.node, f: r.file } : null; };
function teStore() {
  if (!P.teTabs || typeof P.teTabs !== 'object') P.teTabs = { ids: [], on: '' };
  return P.teTabs;
}
let _teSaveT = 0;
function teSaveTabs() { clearTimeout(_teSaveT); _teSaveT = setTimeout(() => { try { saveNow(); } catch (e) { /* не сохранилось: не страшно */ } }, 400); }
/** Короткое «о чём» для карточки ветки: описание, затем начало текста, затем первая реплика сценария. */
function teBrief(tn) {
  const f0 = tn.files[0];
  const d = String(tn.desc || '').trim(); if (d) return d;
  if (!f0) return '';
  const s = String(f0.summary || '').trim(); if (s) return s;
  const lines = String(f0.text || '').split('\n').map(x => x.trim()).filter(x => x && !/^(\/\/|@|#)/.test(x));
  if (lines.length) return lines.slice(0, 2).join(' ').replace(/[*_]/g, '').replace(/\s+/g, ' ').slice(0, 170);
  const q = String(f0.script || '').match(/"((?:[^"\\\n]|\\.)+)"/);
  return q ? q[1].replace(/\{\/?[a-z]+(?:=[^{}]*)?\}/gi, '').slice(0, 170) : '';
}
const teWordsOf = n => n.files.reduce((a, f) => a + prWords(f.text), 0);

/** Текст реплики с тегами {b}{i}{hl=цвет} → куски { t, b, i, hl } для показа. Остальные теги Ren'Py скрываем, {{ и [[ возвращаем в { и [. */
function teRuns(text) {
  const out = []; let b = 0, i = 0; const hl = [];
  const re = /\{(\/?)(b|i|hl)(?:=([a-z]+))?\}|\{\/?[a-z]+(?:=[^{}]*)?\}|\{\{|\[\[/gi;
  let last = 0, m; const s = String(text || '');
  const push = x => { if (x) out.push({ t: x, b: b > 0, i: i > 0, hl: hl.length ? hl[hl.length - 1] : '' }); };
  while ((m = re.exec(s))) {
    push(s.slice(last, m.index)); last = re.lastIndex;
    if (m[2]) { const tag = m[2].toLowerCase(), close = !!m[1]; if (tag === 'b') b = Math.max(0, b + (close ? -1 : 1)); else if (tag === 'i') i = Math.max(0, i + (close ? -1 : 1)); else if (close) hl.pop(); else hl.push(prHlColor(m[3])); }
    else if (m[0] === '{{') push('{'); else if (m[0] === '[[') push('[');
  }
  push(s.slice(last));
  return out;
}
const teHlCount = text => { let n = 0; String(text || '').replace(PR_HL_RE, () => { n++; return ''; }); return n; };

/** Редактор текста: по умолчанию документ-ветка (docedit.js); «По главам» — одна глава за раз. opts: { fileId } / { nodeId } — что открыть; { chapters: true } — сразу по главам. */
/* ====== Телефон и узкое окно ======
   Боковые панели (ветки и оглавление слева, сценарий главы справа) не помещаются рядом с текстом, поэтому на узком экране
   они выезжают поверх него «шторками»; верхнюю панель (заголовок, вкладки, инструменты) можно свернуть в тонкую полоску,
   чтобы текст занимал почти весь экран. Работает в обоих редакторах: обычном и «По главам». */
Object.assign(D, {
  'te.drw.l': ['Ветки и оглавление', 'Branches and outline'], 'te.drw.l.ch': ['Главы', 'Chapters'], 'te.drw.r': ['Сценарий главы', 'Chapter script'],
  'te.bar.hide': ['Скрыть верхнюю панель', 'Hide the top panel'], 'te.bar.show': ['Показать верхнюю панель', 'Show the top panel'],
});
const teNarrow = () => !!(window.matchMedia && matchMedia('(max-width: 980px)').matches);
function teMobile(m, wrap, mhead, left, right, o = {}) {
  const card = m.card;
  const open = side => card.classList.contains(side === 'l' ? 'te-dl-open' : 'te-dr-open');
  const drawer = side => { card.classList.toggle('te-dl-open', side === 'l'); card.classList.toggle('te-dr-open', side === 'r'); };
  const bare = on => { S.teBare = !!on; card.classList.toggle('te-bare', !!on); drawer(null); saveSettings(); };
  const sideBtn = side => h('button', { class: 'btn icon sm te-nb te-nb-' + side, 'data-tip': side === 'l' ? t(o.chapters ? 'te.drw.l.ch' : 'te.drw.l') : t('te.drw.r'), 'aria-label': side === 'l' ? t(o.chapters ? 'te.drw.l.ch' : 'te.drw.l') : t('te.drw.r'), onclick: () => drawer(open(side) ? null : side) }, icon(side === 'l' ? 'list' : 'code', 16));
  const hideB = h('button', { class: 'btn icon sm te-nb te-nb-bar', 'data-tip': t('te.bar.hide'), 'aria-label': t('te.bar.hide'), onclick: () => bare(true) }, icon('chevU', 16));
  const showB = h('button', { class: 'btn icon sm te-nb', 'data-tip': t('te.bar.show'), 'aria-label': t('te.bar.show'), onclick: () => bare(false) }, icon('chevD', 16));
  const grow = mhead.querySelector('.grow');
  const group = h('div', { class: 'te-nbtns' }, sideBtn('l'), sideBtn('r'), hideB);
  if (grow) mhead.insertBefore(group, grow); else mhead.append(group);
  const mini = h('div', { class: 'te-mini' }, sideBtn('l'), h('div', { class: 'grow' }), sideBtn('r'), showB, h('button', { class: 'btn icon sm', 'data-tip': t('c.close'), 'aria-label': t('c.close'), onclick: () => m.close() }, icon('x', 16)));
  wrap.insertBefore(mini, wrap.firstChild);
  const body = wrap.querySelector('.te-body');
  if (body) body.append(h('div', { class: 'te-scrim', onclick: () => drawer(null) }));
  /* выбрал главу или раздел в списке: шторка закрывается, чтобы сразу читать */
  left.addEventListener('click', ev => { if (teNarrow() && ev.target.closest && ev.target.closest('.te-ch, .de-ol-i')) setTimeout(() => drawer(null), 120); });
  card.classList.toggle('te-bare', !!S.teBare);
  return { drawer, bare };
}
function openTextEditor(opts = {}) {
  return opts.chapters || S.teMode === 'ch' ? openChapterEditor(opts) : openDocEditor(opts);
}
/** Окно редактора по главам. opts: { fileId } — открыть эту главу; { nodeId } — первую главу блока. */
function openChapterEditor(opts = {}) {
  closePopover();
  MODALS.filter(x => x.tag === 'texted').forEach(x => x.close());
  const store = teStore();
  let tabs = store.ids.filter(id => findFile(id));
  let on = findFile(store.on) ? store.on : '';
  const want = opts.fileId && findFile(opts.fileId) ? opts.fileId : opts.nodeId && nodeById(opts.nodeId) && nodeById(opts.nodeId).files[0] ? nodeById(opts.nodeId).files[0].id : '';
  if (want) { if (!tabs.includes(want)) tabs.push(want); on = want; }
  if (!tabs.length) { const first = prChapters()[0]; if (first) { tabs = [first.f.id]; on = first.f.id; } }
  if (!tabs.includes(on)) on = tabs[0] || '';

  let seen = DATA_VER, timer = 0, pvTimer = 0, listQ = '', pvMode = 'rows', forkLine = -1, forkShown = false;
  const persist = () => { const s = teStore(); s.ids = tabs.slice(); s.on = on; teSaveTabs(); };
  const m = openModal({
    cls: 'te-m', dismiss: false, onClose: () => { clearInterval(timer); clearTimeout(pvTimer); persist(); },
    build: m => {
      const cur = () => teFind(on);
      m.tag = 'texted';
      const wrap = h('div', { class: 'm-wrap te-wrap' });
      const tabBar = h('div', { class: 'te-tabs' });
      const left = h('div', { class: 'te-left' }), mid = h('div', { class: 'te-mid' }), right = h('div', { class: 'te-right' });
      const listBox = h('div', { class: 'te-list scroll' });
      const search = h('input', { class: 'inp', id: 'te-q', placeholder: t('te.search') });
      const info = h('div', { class: 'te-info' }), banner = h('div', { class: 'te-banner', hidden: true });
      const tb = h('div', { class: 'te-tb' });
      const pre = h('pre', { class: 'te-pre', 'aria-hidden': 'true' });
      const ta = h('textarea', { class: 'te-ta', id: 'te-ta', spellcheck: 'true', placeholder: t('te.ph'), autocomplete: 'off' });
      if (typeof aclOn === 'function' && aclOn() && !aclCan('text')) ta.readOnly = true;                  // права доступа: только чтение
      const ed = h('div', { class: 'te-ed' }, h('div', { class: 'te-edin' }, pre, ta));
      const dock = h('div', { class: 'te-fork', hidden: true });
      const foot = h('div', { class: 'm-foot te-foot' });
      const pvHead = h('div', { class: 'te-pvh' }), pvBody = h('div', { class: 'te-pvb scroll' });
      const stat = h('div', { class: 'te-stat' }), saved = h('span', { class: 'te-saved' }, t('te.saved'));

      /* --- подсветка текста под полем ввода --- */
      const hlInline = e => e.replace(PR_HL_RE, (m, c, x) => `<span class="te-mk hl-${prHlColor(c)}"><span class="te-dim">==${c ? '{' + c + '}' : ''}</span>${x}<span class="te-dim">==</span></span>`);
      const hl = () => {
        const v = ta.value;
        pre.innerHTML = v.replace(/\r/g, '').split('\n').map(l => {
          const e = dgX(l);
          if (FORK_RE.test(l)) return `<span class="te-l k-fork">${e}</span>`;
          if (/^\s*\/\//.test(l)) return `<span class="te-l k-note">${e}</span>`;
          if (/^\s*@/.test(l)) return `<span class="te-l k-cmd">${e}</span>`;
          if (/^\s*#{1,6}\s/.test(l)) return `<span class="te-l k-head">${hlInline(e)}</span>`;
          return `<span class="te-l">${hlInline(e)}</span>`;
        }).join('\n') + '\n​';
      };
      const lineOf = pos => ta.value.slice(0, pos).split('\n').length - 1;
      const lineRange = i => {
        const v = ta.value; let a = 0;
        for (let k = 0; k < i; k++) { const nx = v.indexOf('\n', a); if (nx < 0) return [v.length, v.length]; a = nx + 1; }
        const e = v.indexOf('\n', a); return [a, e < 0 ? v.length : e];
      };
      const selectLine = i => {
        const [a, b] = lineRange(i);
        ta.focus(); ta.setSelectionRange(a, b);
        const sp = pre.children[i];
        if (sp) ed.scrollTop = Math.max(0, sp.offsetTop - ed.clientHeight / 3);
        onCaret();
      };

      /* --- вкладки --- */
      const paintTabs = () => {
        tabBar.replaceChildren(...tabs.map(id => {
          const r = teFind(id); if (!r) return null;
          const title = rsFileTitle(r.n, r.f) || r.n.title;
          const lab = r.n.files.length > 1 || title !== r.n.title ? `${r.n.title} · ${title}` : r.n.title;
          return h('div', { class: 'te-tab' + (id === on ? ' on' : ''), 'data-id': id, onclick: () => open(id) },
            h('span', { class: 'dot', style: { background: palColor(r.n.color) } }),
            h('span', { class: 'te-tab-t' }, lab),
            r.f.textLive ? h('span', { class: 'te-tab-live', 'data-tip': t('te.tab.live') }, icon('refresh', 12)) : null,
            h('button', { class: 'te-tab-x', 'data-tip': t('te.tab.close'), onclick: ev => { ev.stopPropagation(); closeTab(id); } }, icon('x', 12, 2.2)));
        }).filter(Boolean),
          h('button', { class: 'btn icon sm te-tab-add', id: 'te-add', 'data-tip': t('te.tab.new'), onclick: ev => pickFile(ev.currentTarget, fl => open(fl.id)) }, icon('plus', 16)));
      };
      const keepPos = () => {
        if (!on) return;
        TE_POS[on] = { a: ta.selectionStart, b: ta.selectionEnd, sc: ed.scrollTop };
      };
      /** Открыть главу во вкладке (после текущей, если вкладки ещё не было). */
      const open = (id, o = {}) => {
        if (!findFile(id)) return;
        keepPos();
        if (!tabs.includes(id)) { const at = o.after ? tabs.indexOf(o.after) : -1; if (at >= 0) tabs.splice(at + 1, 0, id); else tabs.push(id); }
        on = id; persist(); loadCur(); paintAll();
      };
      const closeTab = id => {
        const i = tabs.indexOf(id); if (i < 0) return;
        if (id === on) keepPos();
        tabs.splice(i, 1);
        if (id === on) { on = tabs[Math.min(i, tabs.length - 1)] || ''; persist(); loadCur(); } else persist();
        paintAll();
      };

      /* --- загрузка главы в поле --- */
      const loadCur = () => {
        const r = cur();
        ta.disabled = !r; forkShown = false; dock.hidden = true;
        ta.value = r ? (r.f.text || '') : '';
        hl();
        const p = r && TE_POS[on];
        if (p) { try { ta.setSelectionRange(Math.min(p.a, ta.value.length), Math.min(p.b, ta.value.length)); } catch (e) { /* без курсора */ } requestAnimationFrame(() => { ed.scrollTop = p.sc || 0; }); }
        else { ed.scrollTop = 0; try { ta.setSelectionRange(0, 0); } catch (e) { /* без курсора */ } }
      };

      /* --- список глав --- */
      const paintList = () => {
        listBox.replaceChildren();
        const q = listQ.trim().toLowerCase();
        const all = prChapters();
        let k = 0;
        for (const { n, f } of all) {
          const title = rsFileTitle(n, f);
          if (q && !(`${n.title} ${title} ${f.text || ''}`).toLowerCase().includes(q)) continue;
          k++;
          const w = prWords(f.text);
          listBox.append(h('div', { class: 'te-ch' + (f.id === on ? ' on' : '') + (tabs.includes(f.id) ? ' open' : ''), 'data-id': f.id, onclick: () => open(f.id) },
            h('span', { class: 'dot big', style: { background: palColor(n.color) } }),
            h('div', { class: 'te-ch-t' }, h('div', { class: 'te-ch-n' }, n.title), title && title !== n.title ? h('div', { class: 'te-ch-s' }, title) : null),
            f.textLive ? h('span', { class: 'te-ch-live', 'data-tip': t('te.tab.live') }, icon('refresh', 12)) : null,
            h('span', { class: 'te-ch-w' }, w ? fmtNum(w) : '')));
        }
        if (!all.length) listBox.append(h('div', { class: 'empty small' }, t('te.none')));
        else if (!k) listBox.append(h('div', { class: 'empty small' }, t('te.nomatch')));
      };

      /* --- верх центра: где мы, баннер --- */
      const paintInfo = () => {
        const r = cur();
        info.replaceChildren();
        if (!r) return;
        const title = rsFileTitle(r.n, r.f);
        info.append(...[h('div', { class: 'te-where' }, h('span', { class: 'dot big', style: { background: palColor(r.n.color) } }), h('b', r.n.title), title && title !== r.n.title ? h('span', { class: 'te-sub' }, title) : null),
          r.f.src ? h('span', { class: 'te-srcchip', id: 'te-srcchip', 'data-tip': t('di.btn') }, r.f.src.name ? t('di.src.chip', r.f.src.name, diFmtDate(r.f.src.at)) : t('di.src.chip.paste', diFmtDate(r.f.src.at))) : null,
          h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', id: 'te-mode', 'data-tip': t('de.mode.tip'), onclick: () => { S.teMode = 'doc'; saveSettings(); openDocEditor({ fileId: r.f.id }); } }, icon('book', 14), t('de.mode.doc')),
          h('button', { class: 'btn sm', id: 'te-opennode', onclick: () => { focusNode(r.n.id); openNodeModal(r.n.id, r.f.id); } }, icon('open', 14), t('te.open.node'))].filter(Boolean));
      };
      const paintBanner = () => {
        const r = cur(); banner.replaceChildren();
        const conflict = !!r && r.f.textLive && !prScriptIsOurs(r.f);
        banner.hidden = !conflict;
        if (!conflict) return;
        banner.append(h('div', { class: 'te-banner-t' }, icon('alert', 16), t('te.conf')),
          h('div', { class: 'te-banner-b' },
            h('button', { class: 'btn sm', id: 'te-conf-rep', onclick: () => { prApply(r.n, r.f, 'replace'); commit(true); seen = DATA_VER; paintAll(); } }, t('te.conf.rep')),
            h('button', { class: 'btn sm', id: 'te-conf-off', onclick: () => { r.f.textLive = false; commit(true); seen = DATA_VER; paintAll(); } }, t('te.conf.off'))));
      };

      /* --- вставки --- */
      const typeText = txt => {
        ta.focus();
        if (!document.execCommand || !document.execCommand('insertText', false, txt)) { ta.setRangeText(txt, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input', { bubbles: true })); }
      };
      const wrapSel = (a, b = a) => {
        const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, sel = v.slice(s, e);
        const single = a === '*' && b === '*';   // курсив: не путать с жирным (**)
        if (sel.startsWith(a) && sel.endsWith(b) && sel.length >= a.length + b.length && !(single && (sel.startsWith('**') || sel.endsWith('**')))) { typeText(sel.slice(a.length, sel.length - b.length)); ta.setSelectionRange(s, e - a.length - b.length); return; }
        if (sel && v.slice(s - a.length, s) === a && v.slice(e, e + b.length) === b && !(single && (v[s - 2] === '*' || v[e + 1] === '*'))) {   // выделено то, что внутри разметки: снимаем её
          ta.setSelectionRange(s - a.length, e + b.length); typeText(sel); ta.setSelectionRange(s - a.length, e - a.length); return;
        }
        if (!sel) { typeText(a + b); ta.setSelectionRange(s + a.length, s + a.length); return; }
        typeText(a + sel + b); ta.setSelectionRange(s + a.length, e + a.length);
      };
      const lineStartInsert = prefix => {
        const v = ta.value, pos = ta.selectionStart, ls = v.lastIndexOf('\n', pos - 1) + 1;
        ta.setSelectionRange(ls, ls); typeText(prefix); ta.setSelectionRange(pos + prefix.length, pos + prefix.length);
      };
      const insCmd = code => insertSnippet(ta, code.split('\n').map(l => '@ ' + l).join('\n'));
      const withTr = () => (S.transition ? ` with ${S.transition}` : '');
      const cmdMenu = b => menuAt(b, [
        { label: t('te.c.scene'), icon: 'image', onClick: () => setTimeout(() => pickAsset(b, 'bg', a => insCmd(`scene ${a.name}${withTr()}`)), 30) },
        { label: t('te.c.show'), icon: 'user', onClick: () => setTimeout(() => pickAsset(b, 'sprite', a => insCmd(`show ${a.name}${withTr()}`)), 30) },
        { label: t('te.c.hide'), icon: 'eye', onClick: () => setTimeout(() => pickAsset(b, 'sprite', a => insCmd(`hide ${a.name}${withTr()}`)), 30) },
        { sep: true },
        { label: t('te.c.music'), icon: 'music', onClick: () => setTimeout(() => pickAsset(b, 'music', a => insCmd(`play music "${assetCodeName(a)}" fadein 1.0`)), 30) },
        { label: t('te.c.sound'), icon: 'volume', onClick: () => setTimeout(() => pickAsset(b, 'sfx', a => insCmd(`play sound "${assetCodeName(a)}"`)), 30) },
        { label: t('te.c.fx'), icon: 'sparkles', onClick: () => setTimeout(() => pickAsset(b, 'fx', a => insCmd(`with ${a.name}`)), 30) },
        { label: t('te.c.video'), icon: 'film', onClick: () => setTimeout(() => pickAsset(b, 'video', a => insCmd(`$ renpy.movie_cutscene("${assetCodeName(a)}")`)), 30) },
        { label: t('te.c.pause'), icon: 'zap', onClick: () => insCmd('pause 1.0') },
        { sep: true },
        { label: t('te.c.jump'), icon: 'link', onClick: () => setTimeout(() => pickFile(b, fl => insCmd(`jump ${fileLabel(fl)}`)), 30) },
        { label: t('te.c.menu'), icon: 'fork', onClick: () => { const r = cur(); if (r) insCmd(menuSnippet(r.n)); } },
        { label: t('te.c.raw'), icon: 'code', onClick: () => insertSnippet(ta, '@ \u0001') }]);
      const tbBtn = (ic, tip, fn, id, label) => h('button', { class: 'btn icon sm te-b', id: id || null, 'data-tip': tip, onclick: ev => fn(ev.currentTarget) }, ic ? icon(ic, 16) : null, label ? h('span', { class: 'te-b-l' }, label) : null);
      /* --- выделение цветом --- */
      const hlOpen = c => c === 'yellow' ? '==' : '==' + '{' + c + '}';
      const hlBar = h('span', { class: 'te-hlbar' });
      const paintHlBtn = () => { hlBar.className = 'te-hlbar hl-' + prHlColor(S.teHl); };
      /** Выделить цветом то, что выделено; если выделенное уже в маркере: тот же цвет снимает, другой меняет. */
      const applyHl = color => {
        color = prHlColor(color); S.teHl = color; saveSettings(); paintHlBtn();
        const v = ta.value, s0 = ta.selectionStart, e0 = ta.selectionEnd, [ls, le] = lineRange(lineOf(s0));
        const line = v.slice(ls, le), re = new RegExp(PR_HL_RE.source, 'g'); let mm;
        while ((mm = re.exec(line))) {
          const a = ls + mm.index, b = a + mm[0].length;
          if (s0 >= a && e0 <= b) {   // внутри существующего маркера
            const cur = prHlColor(mm[1]), inner = mm[2];
            ta.focus(); ta.setSelectionRange(a, b);
            if (cur === color) { typeText(inner); ta.setSelectionRange(a, a + inner.length); }
            else { const o = hlOpen(color); typeText(o + inner + '=='); ta.setSelectionRange(a + o.length, a + o.length + inner.length); }
            return;
          }
        }
        ta.focus();
        const sel = v.slice(s0, e0), o = hlOpen(color);
        if (!sel.trim()) { typeText(o + '=='); ta.setSelectionRange(s0 + o.length, s0 + o.length); return; }
        const m2 = sel.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const body = m2[2].replace(/\n/g, '==\n' + o);   // выделение не бывает на несколько строк: режем по строкам
        typeText(m2[1] + o + body + '==' + m2[3]);
        ta.setSelectionRange(s0 + m2[1].length + o.length, s0 + m2[1].length + o.length + m2[2].length);
      };
      const clearHl = () => {
        const v = ta.value, s0 = ta.selectionStart, e0 = ta.selectionEnd, re = new RegExp(PR_HL_RE.source, 'g'); let mm;
        const ranges = [];
        while ((mm = re.exec(v))) { const a = mm.index, b = a + mm[0].length; if (e0 === s0 ? (s0 >= a && s0 <= b) : (a < e0 && b > s0)) ranges.push([a, b, mm[2]]); }
        if (!ranges.length) return;
        const a = ranges[0][0], b = ranges[ranges.length - 1][1];
        const txt = v.slice(a, b).replace(new RegExp(PR_HL_RE.source, 'g'), '$2');
        ta.focus(); ta.setSelectionRange(a, b); typeText(txt); ta.setSelectionRange(a, a + txt.length);
      };
      const findHl = () => {
        const v = ta.value, from = ta.selectionEnd, re = new RegExp(PR_HL_RE.source, 'g'); let mm, first = null, next = null;
        while ((mm = re.exec(v))) { if (!first) first = mm; if (mm.index >= from && !next) { next = mm; break; } }
        const hit = next || first; if (!hit) { toast(t('te.hl.none')); return; }
        ta.focus(); ta.setSelectionRange(hit.index, hit.index + hit[0].length);
        const sp = pre.children[lineOf(hit.index)]; if (sp) ed.scrollTop = Math.max(0, sp.offsetTop - ed.clientHeight / 3);
        paintStat();
      };
      const hlPop = b => {
        const sw = PR_HL.map(c => h('button', { class: 'te-sw hl-' + c + (prHlColor(S.teHl) === c ? ' on' : ''), 'data-c': c, 'data-tip': t('te.hl.' + c), onclick: () => { closePopover(); applyHl(c); } }, prHlColor(S.teHl) === c ? icon('check', 12, 2.4) : null));
        popover(b, h('div', { class: 'te-hlpop' }, h('div', { class: 'te-sws' }, ...sw),
          h('button', { class: 'btn sm te-hl-off', id: 'te-hl-off', onclick: () => { closePopover(); clearHl(); } }, icon('x', 14), t('te.hl.off')),
          h('button', { class: 'btn sm te-hl-next', id: 'te-hl-next', onclick: () => { closePopover(); findHl(); } }, icon('search', 14), t('te.hl.next')),
          h('div', { class: 'hint' }, t('te.hl.note'))), { cls: 'pick-pop' });
      };
      const hlBtn = h('button', { class: 'btn icon sm te-b te-hlbtn', id: 'te-b-hl', 'data-tip': t('te.tb.hl'), onclick: () => applyHl(S.teHl) }, icon('palette', 16), hlBar);
      const hlMenuBtn = h('button', { class: 'btn icon sm te-b te-hlm', id: 'te-b-hlm', 'data-tip': t('te.tb.hlm'), onclick: ev => hlPop(ev.currentTarget) }, icon('chevD', 12));
      paintHlBtn();

      tb.append(
        tbBtn(null, t('te.tb.b'), () => wrapSel('**'), 'te-b-bold', 'B'), tbBtn(null, t('te.tb.i'), () => wrapSel('*'), 'te-b-ital', 'I'),
        tbBtn(null, t('te.tb.dash'), () => lineStartInsert('— '), 'te-b-dash', '—'), tbBtn(null, t('te.tb.quote'), () => wrapSel('«', '»'), 'te-b-quote', '«»'),
        h('span', { class: 'te-sep' }),
        tbBtn('chat', t('te.tb.who'), b => { const r = cur(); if (r) pickChar(b, effectiveCast(r.n, r.f).all, c => lineStartInsert((c.name || c.tag) + ': ')); }, 'te-b-who'),
        tbBtn('code', t('te.tb.cmd'), b => cmdMenu(b), 'te-b-cmd'),
        h('span', { class: 'te-sep' }),
        h('button', { class: 'btn sm te-b te-b-fork', id: 'te-b-fork', 'data-tip': t('te.tb.fork.tip'), onclick: () => insertSnippet(ta, '// развилка: \u0001') }, icon('fork', 15), t('te.tb.fork')),
        h('button', { class: 'btn sm te-b', id: 'te-b-note', 'data-tip': t('te.tb.note.tip'), onclick: () => insertSnippet(ta, '// \u0001') }, icon('sticker', 15), t('te.tb.note')),
        h('button', { class: 'btn sm te-b', id: 'te-b-head', 'data-tip': t('te.tb.head.tip'), onclick: () => insertSnippet(ta, '## \u0001') }, icon('hash', 15), t('te.tb.head')),
        h('span', { class: 'te-sep' }),
        hlBtn, hlMenuBtn,
        h('div', { class: 'grow' }),
        h('button', { class: 'btn icon sm', id: 'te-opts', 'data-tip': t('te.opts'), onclick: ev => optsPop(ev.currentTarget) }, icon('sliders', 16)),
        h('button', { class: 'btn icon sm', id: 'te-focus', 'data-tip': t('te.focus'), onclick: ev => { const on2 = m.card.classList.toggle('te-focus'); ev.currentTarget.dataset.tip = on2 ? t('te.focus.off') : t('te.focus'); ev.currentTarget.classList.toggle('on', on2); } }, icon('fit', 16)));

      const optsPop = b => {
        const o = S.prose = Object.assign({}, PR_DEFAULTS, S.prose || {});
        const sw = (k, label) => h('div', { class: 'te-opt' }, switchEl(o[k], v => { o[k] = v; saveSettings(); paintPv(true); }, label));
        popover(b, h('div', { class: 'te-opts-box' }, sw('alternate', t('pr.opt.alt')), sw('split', t('pr.opt.split')), sw('keepAttr', t('pr.opt.attr'))), { cls: 'pick-pop' });
      };

      /* --- карточка развилки --- */
      const onCaret = () => {
        const r = cur(); if (!r) return;
        const i = lineOf(ta.selectionStart), line = ta.value.split('\n')[i] || '';
        const mk = line.match(FORK_RE);
        if (!mk) { if (forkShown) { dock.hidden = true; forkShown = false; } return; }
        forkLine = i; forkShown = true;
        paintFork({ line: i, note: mk[1].trim() });
        dock.hidden = false;
      };
      const paintFork = mark => {
        const r = cur(); if (!r) return;
        const outs = outgoingOf(r.n).filter(e => nodeById(e.to));
        dock.replaceChildren(h('div', { class: 'te-fork-h' },
          h('span', { class: 'te-fork-i' }, icon('fork', 16)),
          h('b', t('te.fork.t')), h('span', { class: 'te-fork-w' }, t('te.fork.in', r.n.title)),
          outs.length ? h('span', { class: 'te-fork-n' }, t('te.fork.n', outs.length)) : null,
          h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', id: 'te-fork-map', onclick: () => focusNode(r.n.id) }, icon('target', 14), t('te.fork.map')),
          h('button', { class: 'btn icon sm', 'data-tip': t('te.fork.close'), onclick: () => { dock.hidden = true; forkShown = false; } }, icon('x', 14))));
        if (mark.note) dock.append(h('div', { class: 'te-fork-note' }, h('span', { class: 'lbl' }, t('te.fork.you')), mark.note));
        if (!outs.length) { dock.append(h('div', { class: 'te-fork-empty' }, t('te.fork.none'))); return; }
        if (outs.length > 1) dock.append(h('div', { class: 'te-fork-q' }, t('te.fork.pick')));
        const list = h('div', { class: 'te-fork-list' });
        for (const e of outs) {
          const tn = nodeById(e.to), brief = teBrief(tn);
          const kind = tn.type === 'ending' ? t('te.fork.end') : tn.type === 'fork' ? t('te.fork.fk') : t('te.fork.ch');
          const go = anchor => {
            if (tn.files.length <= 1) { if (tn.files[0]) open(tn.files[0].id, { after: r.f.id }); return; }
            menuAt(anchor, tn.files.map(fl => ({ label: rsFileTitle(tn, fl) || fl.title, icon: 'file', onClick: () => open(fl.id, { after: r.f.id }) })));
          };
          list.append(h('div', { class: 'te-br', 'data-to': tn.id },
            h('span', { class: 'dot big', style: { background: palColor(tn.color) } }),
            h('div', { class: 'te-br-t' },
              h('div', { class: 'te-br-h' }, h('b', e.title || t('te.fork.untitled')), h('span', { class: 'te-br-to' }, ' → ' + tn.title), h('span', { class: 'te-br-k' }, kind),
                e.cond ? h('span', { class: 'te-br-c' }, t('te.fork.if', e.cond)) : null),
              h('div', { class: 'te-br-d' + (brief ? '' : ' none') }, brief || t('te.fork.empty')),
              tn.files.length > 1 ? h('div', { class: 'te-br-f' }, t('te.fork.files', tn.files.length)) : null),
            tn.files.length ? h('button', { class: 'btn sm primary te-br-go', onclick: ev => go(ev.currentTarget) }, icon('open', 14), t('te.fork.go')) : null));
        }
        dock.append(list);
      };

      /* --- предпросмотр сценария --- */
      const PV_LIMIT = 400;
      const paintPv = force => {
        const r = cur();
        pvHead.replaceChildren(segmented([{ value: 'rows', label: t('te.pv.rows') }, { value: 'code', label: t('te.pv.code') }], pvMode, v => { pvMode = v; paintPv(true); }, 'te-pvseg'), h('div', { class: 'grow' }), stat2);
        pvBody.replaceChildren();
        if (!r) return;
        const text = ta.value;
        let b; try { b = prBuild(r.n, r.f, text); } catch (e) { pvBody.append(h('div', { class: 'empty small' }, String(e && e.message || e))); return; }
        stat2.replaceChildren(...[t('te.pv.stat', b.lines, b.cmds), b.unknown ? h('span', { class: 'te-warn' }, ' · ' + t('te.pv.unk', b.unknown)) : null].filter(Boolean));
        const marks = teForks(text);
        if (!b.rows.length && !marks.length) { pvBody.append(h('div', { class: 'empty small' }, t('te.pv.empty'))); return; }
        if (pvMode === 'code') {
          const tags = new Set(P.characters.map(c => c.tag).filter(Boolean));
          pvBody.append(h('pre', { class: 'te-code', html: highlightRenpy(b.code, tags) }));
          return;
        }
        const items = b.rows.map(row => ({ line: row.line, row })).concat(marks.map(mk => ({ line: mk.line, mark: mk })));
        items.sort((x, y) => x.line - y.line);
        const frag = [];
        items.slice(0, PV_LIMIT).forEach(it => {
          if (it.mark) {
            frag.push(h('div', { class: 'te-r fork', onclick: () => selectLine(it.line) }, icon('fork', 14), h('b', t('te.pv.fork')), it.mark.note ? h('span', ' · ' + it.mark.note) : null));
            return;
          }
          const row = it.row;
          if (row.cmd !== undefined) {
            frag.push(h('div', { class: 'te-r ' + (row.head ? 'head' : 'cmd'), onclick: () => selectLine(row.line) }, row.head ? row.cmd.replace(/^#\s*/, '') : row.cmd));
            return;
          }
          const c = row.sp && row.sp !== '?' ? charById(row.sp) : null;
          const who = row.sp === '?' ? h('span', { class: 'te-who unk' }, '?') : c ? h('span', { class: 'te-who', style: { background: 'var(--c-' + c.color + ')' } }, c.name || c.tag) : h('span', { class: 'te-who narr' }, t('te.pv.narr'));
          const runs = teRuns(row.text).map(x => { let el = h('span', x.t); if (x.hl) el = h('mark', { class: 'hl-' + x.hl }, el); if (x.b) el = h('b', el); if (x.i) el = h('i', el); return el; });
          frag.push(h('div', { class: 'te-r say' + (row.sp === '?' ? ' bad' : ''), onclick: () => selectLine(row.line) }, who, h('div', { class: 'te-r-t' }, ...runs),
            row.sp === '?' ? h('button', { class: 'btn sm te-setwho', onclick: ev => { ev.stopPropagation(); pickChar(ev.currentTarget, prCast(r.n, r.f).map(x => x.id), ch => setWho(row, ch)); } }, t('te.pv.name')) : null));
        });
        pvBody.append(...frag);
        if (items.length > PV_LIMIT) pvBody.append(h('div', { class: 'hint te-cut' }, t('te.pv.cut', PV_LIMIT)));
      };
      const stat2 = h('div', { class: 'te-pvs' });
      /** Строка без говорящего → «Имя: реплика» (если из строки вышла одна реплика, остальные строки не трогаем). */
      const setWho = (row, c) => {
        const lines = ta.value.split('\n'), src = lines[row.line]; if (src == null) return;
        const r = cur(); const same = r ? prBuild(r.n, r.f, ta.value).rows.filter(x => x.line === row.line).length : 1;
        let body = src.trim();
        const q = body.match(/^[«"“„]([^»"”“]+)[»"”]\s*[,.]?\s*$/u);
        if (same === 1) { if (q) body = q[1]; else body = body.replace(/^[—–-]\s*/, ''); }
        else body = body.replace(/^[—–-]\s*/, '');
        lines[row.line] = `${c.name || c.tag}: ${body}`;
        const [a, e] = lineRange(row.line);
        ta.focus(); ta.setSelectionRange(a, e); typeText(lines[row.line]);
      };

      /* --- низ окна --- */
      const paintStat = () => {
        const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
        const w = prWords(v);
        const sel = e > s ? prWords(v.slice(s, e)) : 0;
        stat.replaceChildren(...[h('span', t('te.words', fmtNum(w))), h('span', t('te.chars', fmtNum(v.replace(/\s/g, '').length))), h('span', t('te.read', fmtDur(w))), sel ? h('span', { class: 'te-selw' }, t('te.sel', fmtNum(sel))) : null, teHlCount(v) ? h('span', { class: 'te-hlc' }, t('te.hl.n', teHlCount(v))) : null].filter(Boolean));
      };
      const paintFoot = () => {
        const r = cur();
        foot.replaceChildren();
        if (!r) return;
        const live = h('div', { class: 'te-live', 'data-tip': t('te.live.tip') }, switchEl(!!r.f.textLive, async v => {
          const c = cur(); if (!c) return;
          if (!v) { c.f.textLive = false; commit(true); seen = DATA_VER; paintAll(); return; }
          if (c.f.script.trim() && !prScriptIsOurs(c.f)) {
            const ok = await confirmDlg({ title: t('te.live.q'), text: t('te.live.d'), ok: t('te.live.on') });
            if (!ok) { paintFoot(); return; }
          }
          c.f.text = ta.value; c.f.textLive = true; prApply(c.n, c.f, 'replace'); commit(true); seen = DATA_VER; paintAll();
        }, t('te.live')));
        const applyBtn = h('button', { class: 'btn primary', id: 'te-apply', onclick: ev => menuAt(ev.currentTarget, [
          { label: t('te.apply.rep'), icon: 'refresh', onClick: () => apply('replace') },
          { label: t('te.apply.add'), icon: 'down', onClick: () => apply('append') },
          { sep: true },
          { label: t('te.apply.copy'), icon: 'copy', onClick: copyScript }]) }, icon('wand', 16), t('te.apply'), icon('chevD', 14));
        foot.append(stat, h('div', { class: 'grow' }), saved, live, applyBtn);
      };
      const apply = async mode => {
        const r = cur(); if (!r) return;
        if (!ta.value.trim()) { toast(t('te.apply.empty')); return; }
        if (mode === 'replace' && !r.f.textLive && r.f.script.trim() && !prScriptIsOurs(r.f)) {
          const ok = await confirmDlg({ title: t('te.apply.rep.q'), text: t('te.apply.rep.d'), ok: t('te.apply.rep') });
          if (!ok) return;
        }
        r.f.text = ta.value;
        const k = prApply(r.n, r.f, mode);
        if (!k) { toast(t('te.apply.empty')); return; }
        commit(true); seen = DATA_VER; paintAll(); toastUndo(t('te.applied', k));
      };
      const copyScript = async () => {
        const r = cur(); if (!r) return;
        const code = prBuild(r.n, r.f, ta.value).code;
        try { await navigator.clipboard.writeText(code); toast(t('te.copied')); } catch (e) { const tmp = h('textarea', { style: { position: 'fixed', opacity: 0 } }); tmp.value = code; document.body.append(tmp); tmp.select(); try { document.execCommand('copy'); toast(t('te.copied')); } catch (e2) { /* не вышло */ } tmp.remove(); }
      };

      /* --- общий пересбор --- */
      const paintAll = () => { paintTabs(); paintList(); paintInfo(); paintBanner(); paintFoot(); paintStat(); paintPv(); if (forkShown) onCaret(); };

      /* --- ввод и автосохранение --- */
      let lastTouch = 0;
      ta.addEventListener('input', () => {
        const r = cur(); if (!r) return;
        r.f.text = ta.value;
        hl(); paintStat(); saved.textContent = t('te.saving');
        const st = prSync(r.n, r.f);
        commit(false); seen = DATA_VER;
        clearTimeout(pvTimer); pvTimer = setTimeout(() => { saved.textContent = t('te.saved'); paintPv(); paintList(); paintBanner(); if (st === 'conflict') paintFoot(); }, 260);
        lastTouch = Date.now();
        onCaret();
      });
      ['click', 'keyup', 'select'].forEach(ev => ta.addEventListener(ev, () => { paintStat(); onCaret(); }));
      ta.addEventListener('blur', keepPos);
      let plainNext = false;
      ta.addEventListener('paste', ev => {
        const cd = ev.clipboardData; if (!cd) return;
        if (plainNext) { plainNext = false; return; }
        const html = cd.getData('text/html');
        if (!html || !/<(h[1-6]|p|div|span|b|i|strong|em|li|br)\b/i.test(html)) return;
        const md = diHtmlToMd(html, { title: '## ' });
        if (!md.trim() || md.trim() === cd.getData('text/plain').trim()) return;
        ev.preventDefault(); typeText(md); toast(t('te.pasted'));
      });
      wrap.addEventListener('dragover', ev => { if ([...(ev.dataTransfer && ev.dataTransfer.types || [])].includes('Files')) { ev.preventDefault(); m.card.classList.add('te-drag'); } });
      wrap.addEventListener('dragleave', ev => { if (!wrap.contains(ev.relatedTarget)) m.card.classList.remove('te-drag'); });
      wrap.addEventListener('drop', ev => { m.card.classList.remove('te-drag'); const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (f && DI_FILE_RE.test(f.name || '')) { ev.preventDefault(); openDocImport({ file: f, fileId: on }); } });
      ta.addEventListener('keydown', ev => {
        if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && !ev.altKey && (ev.key === 'h' || ev.key === 'H' || ev.key === 'р' || ev.key === 'Р')) { ev.preventDefault(); applyHl(S.teHl); }
        if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && (ev.key === 'v' || ev.key === 'V' || ev.key === 'м' || ev.key === 'М')) plainNext = true;
        if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey && (ev.key === 'b' || ev.key === 'B' || ev.key === 'и' || ev.key === 'И')) { ev.preventDefault(); ev.stopPropagation(); wrapSel('**'); }   // stopPropagation: Ctrl+B на карте открывает сборку
        else if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey && (ev.key === 'i' || ev.key === 'I' || ev.key === 'ш' || ev.key === 'Ш')) { ev.preventDefault(); ev.stopPropagation(); wrapSel('*'); }
      });
      search.addEventListener('input', () => { listQ = search.value; paintList(); });

      /* --- внешние изменения (отмена, другое окно, синхронизация) --- */
      timer = setInterval(() => {
        if (m.closed || DATA_VER === seen) return;
        seen = DATA_VER;
        tabs = tabs.filter(id => findFile(id));
        if (!findFile(on)) { on = tabs[0] || ''; loadCur(); }
        const r = cur();
        if (r && ta.value !== (r.f.text || '') && Date.now() - lastTouch > 400) { const s = ta.selectionStart; ta.value = r.f.text || ''; hl(); try { ta.setSelectionRange(Math.min(s, ta.value.length), Math.min(s, ta.value.length)); } catch (e) { /* без курсора */ } }
        persist(); paintAll();
      }, 600);

      left.append(h('div', { class: 'te-lh' }, h('b', t('te.chapters')), h('button', { class: 'btn sm te-imp', id: 'te-import', 'data-tip': t('di.btn'), onclick: () => openDocImport({ fileId: on }) }, icon('upload', 14), t('te.import'))), h('div', { class: 'te-ls' }, search), listBox);
      mid.append(info, banner, tb, ed, dock);
      right.append(pvHead, pvBody);
      const mhead = modalHead(t('te.title'), m); winControl(m, mhead, 'texted');
      wrap.append(mhead, tabBar, h('div', { class: 'te-body' }, left, mid, right), foot);
      teMobile(m, wrap, mhead, left, right, { chapters: true });
      loadCur(); paintAll();
      setTimeout(() => ta.focus(), 60);
      return wrap;
    }
  });
  return m;
}
TOOL_ITEMS.push({ id: 'texted', group: 'story', menu: false, ic: 'pen', key: 'te.btn', kw: 'text editor write prose manuscript chapter google docs fork текст редактор писать глава рукопись проза развилка', run: () => openTextEditor() });

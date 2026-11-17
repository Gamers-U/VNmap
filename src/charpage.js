'use strict';
/* ====== Страница персонажа: карточка со статистикой, образы (спрайты) с превью, где говорит, примеры реплик ======
   Данные берутся из того, что уже есть в проекте: реестр персонажей и спрайтов, таблица реплик (rtCollect: порядок по сюжету),
   состав блоков (file.cast / node.defaultCast). Сама страница ничего не хранит. */
Object.assign(D, {
  'cp.btn': ['Страница персонажа…', 'Character page…'],
  'cp.title': ['Страница персонажа', 'Character page'],
  'cp.open': ['Страница персонажа', 'Character page'],
  'cp.open.t': ['Образы, статистика и реплики этого персонажа', 'Sprites, stats and lines of this character'],
  'cp.pick': ['Персонаж', 'Character'],
  'cp.empty': ['В реестре пока нет персонажей. Добавьте их во вкладке «Персонажи» реестра.', 'There are no characters in the registry yet. Add them on the registry “Characters” tab.'],
  'cp.gname': ['В игре: {0}', 'In the game: {0}'],
  'cp.a.card': ['Карточка в реестре', 'Card in the registry'], 'cp.a.lines': ['Все реплики…', 'All lines…'],
  'cp.a.map': ['Блоки на карте', 'Blocks on the map'], 'cp.a.rename': ['Переименовать везде…', 'Rename everywhere…'],
  'cp.s.lines': ['Реплик', 'Lines'], 'cp.s.words': ['Слов', 'Words'], 'cp.s.time': ['Читать', 'Reading time'],
  'cp.s.share': ['Доля реплик', 'Share of lines'], 'cp.s.share.s': ['от всех реплик персонажей: {0} из {1}', 'of all character lines: {0} of {1}'],
  'cp.s.blocks': ['Блоков с репликами', 'Blocks with lines'], 'cp.s.blocks.s': ['из {0}', 'of {0}'],
  'cp.s.first': ['Первое появление', 'First appearance'], 'cp.s.last': ['Последнее появление', 'Last appearance'],
  'cp.s.after': ['игрок доходит через {0}', 'the player gets there after {0}'],
  'cp.s.avg': ['в среднем {0} на реплику', 'on average {0} per line'],
  'cp.words': [['{0} слово', '{0} слова', '{0} слов'], ['{0} word', '{0} words']],
  'cp.lines': [['{0} реплика', '{0} реплики', '{0} реплик'], ['{0} line', '{0} lines']],
  'cp.times': [['{0} раз', '{0} раза', '{0} раз'], ['{0} time', '{0} times']],
  'cp.silent': ['У этого персонажа нет ни одной реплики.', 'This character has no lines.'],
  'cp.silent.h': ['Реплика пишется в скрипте так: {0} "текст". Метка персонажа берётся из реестра.', 'A line is written in the script like this: {0} "text". The tag comes from the registry.'],
  'cp.sp.h': ['Образы', 'Sprites'],
  'cp.sp.sub': ['Спрайты из реестра с именем {0} и сколько раз каждый показан в сценарии.', 'Registry sprites named {0} and how many times each is shown in the script.'],
  'cp.sp.none': ['Для этого персонажа в реестре нет спрайта. Спрайт с именем {0} связывает картинки с его меткой.', 'This character has no sprite in the registry. A sprite named {0} ties pictures to its tag.'],
  'cp.sp.create': ['Создать спрайт {0}', 'Create the sprite {0}'], 'cp.sp.manage': ['Управлять образами…', 'Manage sprites…'],
  'cp.sp.unused': ['не используется', 'unused'], 'cp.sp.nofile': ['нет файла', 'no file'], 'cp.sp.noexpr': ['без выражения', 'no expression'],
  'cp.sp.miss': ['нет в реестре', 'not in the registry'],
  'cp.sp.miss.h': ['Эти выражения есть в скриптах (show или реплика с выражением), но не добавлены в реестр. Без них при сборке не найдутся картинки.', 'These expressions appear in scripts (show or a line with an expression) but are not in the registry. Without them the build will not find the pictures.'],
  'cp.sp.add': ['Добавить в реестр', 'Add to the registry'],
  'cp.sp.stat': ['Показано образов: {0} из {1}. Без файла: {2}', 'Sprites shown: {0} of {1}. Without a file: {2}'],
  'cp.w.h': ['Где говорит', 'Where they speak'],
  'cp.w.sub': ['Блоки в порядке сюжета. Полоса показывает долю слов персонажа среди его реплик.', 'Blocks in story order. The bar shows the share of the character\'s words.'],
  'cp.w.unreach': ['не в игре', 'not in the game'], 'cp.w.more': ['Показать ещё', 'Show more'],
  'cp.w.show': ['Показать на карте', 'Show on the map'], 'cp.w.open': ['Открыть блок', 'Open the block'],
  'cp.c.silent': ['В составе блока, но молчит', 'In the block cast, but silent'],
  'cp.c.silent.h': ['Персонаж отмечен участником блока, а реплик у него там нет.', 'The character is marked as a participant of the block but has no lines there.'],
  'cp.c.extra': ['Говорит, но не отмечен в составе', 'Speaks, but not in the cast'],
  'cp.c.extra.h': ['Реплики есть, а в составе блока его нет. Добавьте его в «Участвуют», чтобы список участников был точным.', 'There are lines but the character is not in the block cast. Add them under “Participants” to keep the cast accurate.'],
  'cp.l.h': ['Реплики', 'Lines'], 'cp.l.first': ['Первые по сюжету', 'First in the story'], 'cp.l.long': ['Самые длинные', 'Longest'],
  'cp.l.open': ['Открыть эту строку в скрипте', 'Open this line in the script'],
  'cp.foot': ['Считаются реплики с меткой {0}. Блоки идут по сюжету: от начала игры по стрелкам, условия на стрелках не учитываются. Время чтения зависит от скорости в окне «Ветки и время».', 'Lines with the tag {0} are counted. Blocks follow the story from the start along the arrows; arrow conditions are ignored. Reading time depends on the speed set in the “Branches and time” window.'],
});

const CP_ST = { id: '', lines: 'first', more: 12 };
const cpName = c => c.name || c.tag;
const cpWords = w => t('cp.words', fmtNum(w));
const cpTrim = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };

/** Всё, что страница показывает про персонажа. */
function cpCollect(c) {
  const rows = rtCollect(), A = anPaths();
  const speak = r => r.who && !AN_NOT_SPEAKERS.has(r.who) && (r.sub === 'line' || r.sub === 'with');
  let allLines = 0, allWords = 0; const mine = [], per = new Map();
  for (const r of rows) {
    if (!speak(r)) continue;
    allLines++; allWords += r.words;
    if (r.who !== c.tag) continue;
    mine.push(r);
    let p = per.get(r.n.id); if (!p) per.set(r.n.id, p = { n: r.n, lines: 0, words: 0, rank: A.min.has(r.n.id) ? A.min.get(r.n.id) : null });
    p.lines++; p.words += r.words;
  }
  const words = mine.reduce((s, r) => s + r.words, 0);
  const list = [...per.values()], reached = list.filter(x => x.rank != null);
  const first = reached.length ? reached.reduce((a, b) => (b.rank < a.rank ? b : a)) : null;
  const last = reached.length ? reached.reduce((a, b) => (b.rank >= a.rank ? b : a)) : null;
  /* образы: сколько раз показаны (show tag выражение) и в репликах с выражением */
  const used = new Map(), bump = k => used.set(k, (used.get(k) || 0) + 1);
  const reShow = new RegExp('^\\s*show\\s+' + reEsc(c.tag) + '(?=\\s|$)(.*)$');
  for (const n of P.nodes) for (const f of n.files) for (const raw of String(f.script || '').split('\n')) {
    const m = reShow.exec(raw); if (!m) continue;
    const ex = []; for (const w of m[1].trim().split(/\s+/)) { if (!w || STOP.has(w) || /^["':]/.test(w)) break; ex.push(w); }
    bump(ex.join(' '));
  }
  for (const r of rows) if (r.who === c.tag && r.attrs.trim()) bump(r.attrs.trim().replace(/\s+/g, ' '));
  /* состав блоков */
  const castOf = n => (n.defaultCast || []).includes(c.id) || n.files.some(f => (f.cast || []).includes(c.id));
  const real = P.nodes.filter(n => n.type !== 'note');
  const silent = c.always ? [] : real.filter(n => castOf(n) && !per.has(n.id));
  const extra = c.always ? [] : list.filter(x => !castOf(x.n)).map(x => x.n);
  return { rows, mine, per: list, words, allLines, allWords, first, last, used, silent, extra, blocks: real.length };
}
const cpAssets = c => P.assets.filter(a => a.kind === 'sprite' && a.name.toLowerCase() === String(c.tag).toLowerCase());

function openCharPage(charId) {
  closePopover();
  if (charId) CP_ST.id = charId;
  let seenVer = DATA_VER, timer = 0;
  openModal({
    cls: 'cp-m', onClose: () => clearInterval(timer), build: m => {
      const body = h('div', { class: 'cp-body scroll' }), close = () => m.close();
      const showOn = ids => { close(); setSel(ids); const nodes = ids.map(nodeById).filter(Boolean); if (nodes.length) { const bb = nodesBBox(nodes), r = stage.getBoundingClientRect(); const k = clamp(Math.min((r.width - 160) / Math.max(1, bb.x1 - bb.x0), (r.height - 260) / Math.max(1, bb.y1 - bb.y0), 1), 0.1, 1); centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, k); } };
      const stat = (k, v, s) => h('div', { class: 'cp-stat' }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v), s ? h('div', { class: 's' }, s) : null);

      /* образы */
      const spriteSection = (c, X) => {
        const sec = h('section', { class: 'cp-sec' }), assets = cpAssets(c);
        sec.append(h('div', { class: 'cp-h' }, h('h3', {}, t('cp.sp.h')), h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', onclick: () => { close(); openRegistry('sprite'); if (REG) { REG.q = c.tag; renderReg(); } } }, t('cp.sp.manage'))));
        sec.append(h('div', { class: 'cp-sub' }, t('cp.sp.sub', c.tag)));
        const ensure = () => assets[0] || createAsset('sprite', c.tag);
        const missing = [...X.used.keys()].filter(k => k && !assets.some(a => a.expr.includes(k)));
        if (!assets.length) {
          sec.append(h('div', { class: 'cp-none' }, h('div', {}, t('cp.sp.none', c.tag)), h('button', { class: 'btn primary sm', onclick: () => { createAsset('sprite', c.tag); paint(); } }, icon('plus', 14), t('cp.sp.create', c.tag))));
        } else {
          const grid = h('div', { class: 'cp-grid' }); let total = 0, shown = 0, nofile = 0;
          for (const a of assets) for (const key of (a.expr.length ? a.expr : [''])) {
            total++;
            const mt = assetMeta(a, key), uses = X.used.get(key) || 0;
            if (uses) shown++; if (!mt) nofile++;
            const th = h('div', { class: 'cp-th' });
            if (mt) { const im = h('img', { alt: '', loading: 'lazy' }); th.append(im); blobUrl(mt.bid).then(u => { if (u) im.src = u; else { th.replaceChildren(icon('image', 22)); th.classList.add('lost'); } }); }
            else th.append(icon('image', 22));
            grid.append(h('div', { class: 'cp-card' + (mt ? '' : ' nofile') }, th,
              h('div', { class: 'cp-cn', 'data-tip': assets.length > 1 && a.path ? a.path : null }, key || t('cp.sp.noexpr')),
              h('div', { class: 'cp-cu' }, !mt ? h('span', { class: 'cp-tag warn' }, t('cp.sp.nofile')) : null, key === '' && a.expr.length === 0 && !uses ? null : (uses ? t('cp.times', uses) : h('span', { class: 'muted' }, t('cp.sp.unused'))))));
          }
          sec.append(grid, h('div', { class: 'cp-sub cp-st' }, t('cp.sp.stat', shown, total, nofile)));
        }
        if (missing.length) {
          const g = h('div', { class: 'cp-grid cp-miss' });
          for (const k of missing) g.append(h('div', { class: 'cp-card dashed' }, h('div', { class: 'cp-th' }, icon('alert', 22)), h('div', { class: 'cp-cn' }, k),
            h('div', { class: 'cp-cu' }, h('span', { class: 'cp-tag warn' }, t('cp.sp.miss')), t('cp.times', X.used.get(k))),
            h('button', { class: 'btn sm', onclick: () => { const a = ensure(); if (!a.expr.includes(k)) a.expr.push(k); commit(true); paint(); } }, icon('plus', 13), t('cp.sp.add'))));
          sec.append(h('div', { class: 'cp-sub cp-mh' }, icon('alert', 14), t('cp.sp.miss.h')), g);
        }
        return sec;
      };

      /* где говорит */
      const whereSection = (c, X) => {
        const sec = h('section', { class: 'cp-sec' });
        sec.append(h('div', { class: 'cp-h' }, h('h3', {}, t('cp.w.h'))), h('div', { class: 'cp-sub' }, t('cp.w.sub')));
        const top = Math.max(1, ...X.per.map(x => x.words)), box = h('div', { class: 'cp-rows' });
        for (const x of X.per.slice(0, CP_ST.more)) {
          const n = x.n;
          box.append(h('div', { class: 'cp-r' },
            h('div', { class: 'bs-n' }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), h('span', { class: 't' }, n.title || t('node.new.' + n.type)), x.rank == null ? h('span', { class: 'bs-tag warn' }, t('cp.w.unreach')) : null),
            h('div', { class: 'cp-rb' }, h('div', { class: 'bs-bar' }, h('i', { class: 'a', style: { left: '0', width: (x.words / top * 100) + '%' } })), h('div', { class: 'bs-sub' }, t('cp.lines', x.lines) + ' · ' + cpWords(x.words))),
            h('div', { class: 'bs-act' }, h('button', { class: 'btn icon sm', 'data-tip': t('cp.w.show'), onclick: () => { close(); focusNode(n.id); } }, icon('target', 15)),
              h('button', { class: 'btn icon sm', 'data-tip': t('cp.w.open'), onclick: () => { close(); openNodeModal(n.id); } }, icon('open', 15)))));
        }
        sec.append(box);
        if (X.per.length > CP_ST.more) sec.append(h('div', { class: 'bs-more' }, h('button', { class: 'btn sm', onclick: () => { CP_ST.more += 12; paint(); } }, t('cp.w.more') + ' (' + (X.per.length - CP_ST.more) + ')')));
        return sec;
      };

      /* состав блоков: кто отмечен, но молчит, и кто говорит без отметки */
      const castSection = (c, X) => {
        const sec = h('section', { class: 'cp-sec' });
        for (const [key, list] of [['silent', X.silent], ['extra', X.extra]]) {
          if (!list.length) continue;
          sec.append(h('div', { class: 'cp-sub cp-cast' }, h('b', {}, t('cp.c.' + key) + ' · ' + list.length), ' ', t('cp.c.' + key + '.h')),
            h('div', { class: 'vs-names cp-names' }, ...list.slice(0, 40).map(n => h('button', { class: 'vs-name', 'data-tip': t('cp.w.show'), onclick: () => { close(); focusNode(n.id); } }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), n.title || t('node.new.' + n.type))),
              list.length > 40 ? h('span', { class: 'bs-sub' }, '… +' + (list.length - 40)) : null));
        }
        return sec;
      };

      /* реплики */
      const linesSection = (c, X) => {
        const sec = h('section', { class: 'cp-sec' });
        sec.append(h('div', { class: 'cp-h' }, h('h3', {}, t('cp.l.h')), h('div', { class: 'grow' }),
          h('div', { class: 'pal-chips' }, ...[['first', 'cp.l.first'], ['long', 'cp.l.long']].map(([k, key]) => h('button', { class: 'pal-chip' + (CP_ST.lines === k ? ' on' : ''), onclick: () => { CP_ST.lines = k; paint(); } }, t(key))))));
        const src = CP_ST.lines === 'long' ? X.mine.slice().sort((a, b) => b.words - a.words || a.i - b.i) : X.mine;
        const box = h('div', { class: 'cp-lines' });
        for (const r of src.slice(0, 6)) {
          box.append(h('button', { class: 'cp-line', 'data-tip': t('cp.l.open'), onclick: () => { close(); palOpenLine(r.n.id, r.f.id, r.li, r.lead); } },
            h('span', { class: 'q' }, '«' + cpTrim(r.plain, 220) + '»'), h('span', { class: 'm' }, (r.n.title || '') + ' · ' + cpWords(r.words))));
        }
        sec.append(box, h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', onclick: () => { close(); openReplicaTable({ who: c.tag }); } }, t('cp.a.lines'))));
        return sec;
      };

      const paint = () => {
        seenVer = DATA_VER;
        const keep = body.scrollTop; body.replaceChildren();
        if (!P.characters.length) { body.append(h('div', { class: 'empty' }, t('cp.empty'))); return; }
        if (!P.characters.some(x => x.id === CP_ST.id)) CP_ST.id = P.characters[0].id;
        const c = P.characters.find(x => x.id === CP_ST.id), X = cpCollect(c), A = anPaths();
        const sel = h('select', { class: 'inp cp-sel', id: 'cp-pick', 'aria-label': t('cp.pick') }, ...P.characters.map(x => h('option', { value: x.id }, cpName(x) + ' · ' + x.tag)));
        sel.value = c.id; sel.addEventListener('change', () => { CP_ST.id = sel.value; CP_ST.more = 12; paint(); body.scrollTop = 0; });
        const gname = cmpGameName(c);
        const av = h('div', { class: 'cp-av', style: { background: 'var(--c-' + c.color + ')' } }, h('span', {}, (cpName(c)[0] || '?').toUpperCase()));
        const first = cpAssets(c).map(a => { const k = a.expr.find(k => assetMeta(a, k)); return k !== undefined ? [a, k] : (assetMeta(a, '') ? [a, ''] : null); }).find(Boolean);
        if (first) { const im = h('img', { alt: '' }); blobUrl(assetMeta(first[0], first[1]).bid).then(u => { if (u) { im.src = u; av.replaceChildren(im); } }); }
        body.append(h('div', { class: 'cp-head' }, av,
          h('div', { class: 'cp-hi' }, h('div', { class: 'cp-nm' }, cpName(c)),
            h('div', { class: 'cp-meta' }, h('span', { class: 'mono cp-tg' }, c.tag), c.aliases ? h('span', { class: 'cp-al' }, c.aliases) : null, gname && gname !== cpName(c) ? h('span', { class: 'cp-al' }, t('cp.gname', gname)) : null),
            c.notes ? h('div', { class: 'cp-notes' }, cpTrim(c.notes, 240)) : null),
          h('div', { class: 'cp-ha' }, sel,
            h('div', { class: 'cp-btns' },
              h('button', { class: 'btn sm', onclick: () => { close(); palRegGo('chars', c.id); } }, icon('open', 14), t('cp.a.card')),
              h('button', { class: 'btn sm', onclick: () => showOn(X.per.map(x => x.n.id)), disabled: X.per.length ? null : 'true' }, icon('target', 14), t('cp.a.map')),
              h('button', { class: 'btn sm', onclick: () => { close(); openRenameDialog({ kind: 'char', key: c.id }); } }, t('cp.a.rename'))))));
        /* цифры */
        const share = X.allWords ? Math.round(X.words / X.allWords * 1000) / 10 : 0;
        const blockName = x => (x.n.title || t('node.new.' + x.n.type));
        const stats = h('div', { class: 'cp-stats' },
          stat(t('cp.s.lines'), fmtNum(X.mine.length), X.mine.length ? t('cp.s.avg', cpWords(Math.round(X.words / X.mine.length))) : ''),
          stat(t('cp.s.words'), fmtNum(X.words), t('cp.s.time') + ': ' + fmtDur(X.words)),
          stat(t('cp.s.share'), String(share).replace('.', S.lang === 'ru' ? ',' : '.') + '%', t('cp.s.share.s', fmtNum(X.words), fmtNum(X.allWords))),
          stat(t('cp.s.blocks'), String(X.per.length), t('cp.s.blocks.s', X.blocks)),
          stat(t('cp.s.first'), X.first ? blockName(X.first) : '—', X.first ? t('cp.s.after', fmtDur(X.first.rank)) : ''),
          stat(t('cp.s.last'), X.last ? blockName(X.last) : '—', X.last ? t('cp.s.after', fmtDur(X.last.rank)) : ''));
        body.append(stats);
        body.append(spriteSection(c, X));
        if (!X.mine.length) body.append(h('div', { class: 'cp-silent' }, icon('info', 15), h('div', {}, h('b', {}, t('cp.silent')), ' ', t('cp.silent.h', c.tag))));
        else body.append(whereSection(c, X));
        if (X.silent.length || X.extra.length) body.append(castSection(c, X));
        if (X.mine.length) body.append(linesSection(c, X));
        body.append(h('div', { class: 'bs-foot' }, t('cp.foot', c.tag)));
        body.scrollTop = keep;
      };
      timer = setInterval(() => { if (m.closed) { clearInterval(timer); return; } if (DATA_VER !== seenVer && !document.activeElement?.matches?.('#cp-pick')) paint(); }, 1200);
      paint();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('cp.title'), m), body);
    }
  });
}
TOOL_ITEMS.push({ id: 'charpage', group: 'story', menu: false, ic: 'idcard', key: 'cp.btn', kw: 'character page sprites lines stats persona страница персонажа образы спрайты реплики статистика карточка', run: () => openCharPage() });

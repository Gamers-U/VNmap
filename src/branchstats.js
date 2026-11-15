'use strict';
/* ====== Ветки и время: сколько читать, сколько идти до концовок, где ветки неровные, когда игрок доходит до блока ======
   Все числа берутся из analysis.js (anPaths, anBranches): слова в репликах, самый короткий и самый длинный путь по стрелкам.
   Условия на стрелках не учитываются: считаются все стрелки, как их нарисовал автор. Скорость чтения одна на весь проект (S.readWpm). */
Object.assign(D, {
  'bs.btn': ['Ветки и время…', 'Branches and time…'],
  'bs.title': ['Ветки и время', 'Branches and time'],
  'bs.speed': ['Скорость чтения', 'Reading speed'], 'bs.speed.u': ['слов в минуту', 'words per minute'],
  'bs.sp.150': ['Не спеша', 'Slow'], 'bs.sp.200': ['Обычно', 'Average'], 'bs.sp.280': ['Быстро', 'Fast'],
  'bs.speed.h': ['Подберите под своих игроков: чем больше картинок, музыки и пауз, тем медленнее читают.', 'Tune it to your players: the more pictures, music and pauses, the slower they read.'],
  'bs.t.sum': ['Итоги', 'Summary'], 'bs.t.end': ['Концовки', 'Endings'], 'bs.t.fork': ['Развилки', 'Forks'], 'bs.t.to': ['До блока', 'To a block'],
  'bs.words': [['{0} слово', '{0} слова', '{0} слов'], ['{0} word', '{0} words']],
  'bs.blocks': [['{0} блок', '{0} блока', '{0} блоков'], ['{0} block', '{0} blocks']],
  'bs.empty': ['На карте пока нет блоков. Добавьте блоки и тексты, и здесь появится время чтения.', 'There are no blocks on the map yet. Add blocks and text and the reading time will show up here.'],
  'bs.notext': ['В блоках пока нет реплик, поэтому время посчитать нельзя. Оно появится, когда в скриптах будут строки вида: имя "текст".', 'The blocks have no lines yet, so there is nothing to time. It will appear once the scripts have lines like: name "text".'],
  'bs.nostart': ['Не удалось понять, с чего начинается игра: нет блока без входящих стрелок. Отметьте стартовый блок в его окне (переключатель «{0}»), иначе пути посчитать нельзя.', 'Cannot tell where the game starts: no block lacks incoming arrows. Mark the start block in its window (the “{0}” switch), otherwise paths cannot be counted.'],
  'bs.nostart.soft': ['Стартовый блок не отмечен, пути считаются от всех блоков без входящих стрелок ({0}).', 'No start block is marked, so paths are counted from every block without incoming arrows ({0}).'],
  'bs.c.total': ['Всего написано', 'Written in total'],
  'bs.c.short': ['Самое короткое прохождение', 'Shortest playthrough'], 'bs.c.long': ['Самое длинное прохождение', 'Longest playthrough'],
  'bs.c.lost': ['Игрок этого не увидит', 'The player will not see this'],
  'bs.c.lost.s': ['{0} в {1}: до них не ведёт ни один путь от начала игры', '{0} in {1}: no path from the start leads to them'],
  'bs.c.ends': ['Концовки', 'Endings'], 'bs.c.ends.v': ['{0} из {1}', '{0} of {1}'], 'bs.c.ends.s': ['достижимы от начала игры', 'reachable from the start'],
  'bs.c.ends.t': ['блоки без продолжения', 'blocks without a continuation'],
  'bs.c.forks': ['Развилки', 'Forks'],
  'bs.c.forks.s': [['{0} развилка, из них неровных: {1}', '{0} развилки, из них неровных: {1}', '{0} развилок, из них неровных: {1}'], ['{0} fork, uneven: {1}', '{0} forks, uneven: {1}']],
  'bs.c.none': ['нет', 'none'],
  'bs.noends': ['Ни одна концовка недостижима, поэтому прохождение посчитать нельзя. Проверьте стрелки (окно «Проверка сюжета»).', 'No ending is reachable, so a playthrough cannot be timed. Check the arrows (the “Story check” window).'],
  'bs.noends.t': ['Концовок на карте нет, поэтому считаю до блоков без продолжения.', 'There are no endings on the map, so I count up to blocks without a continuation.'],
  'bs.route.min': ['Короткий путь', 'Shortest route'], 'bs.route.max': ['Длинный путь', 'Longest route'],
  'bs.route.min.t': ['Показать на карте самый короткий путь', 'Show the shortest route on the map'], 'bs.route.max.t': ['Показать на карте самый длинный путь', 'Show the longest route on the map'],
  'bs.route.toast': ['{0} до «{1}»: {2}, {3} · {4}', '{0} to “{1}”: {2}, {3} · {4}'],
  'bs.route.kmin': ['Самый короткий путь', 'Shortest route'], 'bs.route.kmax': ['Самый длинный путь', 'Longest route'],
  'bs.show': ['Показать на карте', 'Show on the map'], 'bs.checks': ['Проверка сюжета…', 'Story check…'],
  'bs.e.reach': ['Чтобы дойти: {0}', 'To get there: {0}'], 'bs.e.own': ['Только в этой ветке: {0}', 'Only in this branch: {0}'],
  'bs.e.unreach': ['недостижима', 'unreachable'],
  'bs.e.h': ['Тёмная часть полосы — сколько нужно прочесть в самом коротком пути, светлая — сколько можно ещё добавить в самом длинном.', 'The dark part of the bar is what the shortest route makes you read, the light part is what the longest route adds.'],
  'bs.f.h': ['У каждой ветки показано, сколько текста есть только в ней (тёмная часть) и сколько вместе с общим продолжением (светлая). Так видно, куда уходит основная работа.', 'For every branch it shows how much text exists only in it (dark part) and how much with the shared continuation (light part). It shows where the main work goes.'],
  'bs.f.skew': ['Перекос ×{0}', 'Skew ×{0}'], 'bs.f.skew.t': ['Самая длинная ветка заметно больше самой короткой. Если так задумано, всё в порядке.', 'The longest branch is much bigger than the shortest. If that is intended, it is fine.'],
  'bs.f.only': ['Только неровные', 'Uneven only'], 'bs.f.all': ['Все', 'All'],
  'bs.f.own': ['только здесь: {0}', 'only here: {0}'], 'bs.f.tot': ['с общим продолжением: {0}', 'with the shared part: {0}'],
  'bs.f.merge': ['сразу сходится с другими', 'merges with the others at once'],
  'bs.f.zero': ['У одной из веток нет своих блоков: она сразу уходит в общее продолжение.', 'One of the branches has no blocks of its own: it goes straight into the shared part.'],
  'bs.f.noneuneven': ['Неровных развилок нет.', 'No uneven forks.'],
  'bs.f.empty': ['На карте нет развилок: ни из одного блока не выходит двух разных стрелок.', 'There are no forks on the map: no block has two different outgoing arrows.'],
  'bs.f.noname': ['без названия', 'untitled'],
  'bs.t.q': ['Найти блок', 'Find a block'], 'bs.t.none': ['Ничего не найдено.', 'Nothing found.'],
  'bs.t.h': ['Сколько игрок успеет прочесть, прежде чем дойдёт до блока: в самом коротком и в самом длинном пути.', 'How much the player reads before reaching a block: along the shortest and the longest route.'],
  'bs.t.col.b': ['Блок', 'Block'], 'bs.t.col.a': ['Игрок приходит через', 'The player arrives after'], 'bs.t.col.o': ['Сам блок', 'The block itself'],
  'bs.t.start': ['начало игры', 'start of the game'], 'bs.t.unreach': ['сюда не дойти', 'cannot be reached'],
  'bs.more': ['Показать ещё', 'Show more'],
  'bs.foot': ['Считаются реплики и варианты выбора, команды Ren\'Py не в счёт. Условия на стрелках не учитываются: путь идёт по всем нарисованным стрелкам. Если сюжет ходит по кругу, круг считается один раз.', 'Lines and choice captions are counted, Ren\'Py commands are not. Arrow conditions are ignored: a route follows every drawn arrow. If the story loops, the loop counts once.'],
  'bs.nm': ['Время чтения', 'Reading time'],
  'bs.nm.own': ['Сам блок: {0} ({1})', 'The block itself: {0} ({1})'],
  'bs.nm.arr': ['Игрок доходит сюда через {0}.', 'The player gets here after {0}.'],
  'bs.nm.start': ['Это начало игры.', 'This is the start of the game.'],
  'bs.nm.lost': ['Сюда не ведёт ни один путь от начала игры, игрок этот блок не увидит.', 'No path from the start leads here, so the player will not see this block.'],
  'bs.nm.open': ['Ветки и время…', 'Branches and time…'],
});

const BS_ST = { tab: 'sum', q: '', skewOnly: false, more: 60 };
const BS_SPEEDS = [150, 200, 280];

const bsTitle = n => n.title || t('node.new.' + n.type);
const bsRange = (a, b) => { const x = fmtDur(a), y = fmtDur(b); return x === y ? x : x + ' – ' + y; };
const bsWords = w => t('bs.words', fmtNum(w));
const bsWR = (a, b) => (a === b ? bsWords(a) : fmtNum(a) + ' – ' + bsWords(b));   // «30 – 70 слов»

/** Где заканчивается прохождение: в концовках, а если их на карте нет, в блоках без продолжения. */
function bsFinals() {
  const A = anPaths(), B = anBranches();
  if (B.ends.length) return { kind: 'ending', list: B.ends, rows: B.ends.filter(e => e.reached) };
  const w = id => A.words.get(id) || 0;
  const list = A.G.nodes.filter(n => A.reached.has(n.id) && !A.G.out.get(n.id).length)
    .map(n => ({ node: n, reached: true, min: A.min.get(n.id) + w(n.id), max: A.max.get(n.id) + w(n.id), own: 0, ownNodes: 0 }));
  return { kind: 'terminal', list, rows: list };
}
/** Развилка «неровная»: у самой длинной ветки свой текст в 2,5 раза и более больше, чем у самой короткой (и разница не мелочь). */
function bsSkew(f) {
  const o = f.opts.map(x => x.own), mx = Math.max(...o), mn = Math.min(...o);
  if (mn <= 0) return { bad: false, ratio: 0, zero: mx > 0 };
  const ratio = mx / mn;
  return { bad: ratio >= 2.5 && mx - mn >= 150, ratio, zero: false };
}
function bsSum() {
  const A = anPaths(), B = anBranches(), F = bsFinals();
  let total = 0, lost = 0, lostN = 0;
  for (const n of A.G.nodes) { const w = A.words.get(n.id) || 0; total += w; if (!A.reached.has(n.id)) { lost += w; lostN++; } }
  const rows = F.rows;
  const short = rows.length ? rows.reduce((a, b) => (b.min < a.min ? b : a)) : null;
  const long = rows.length ? rows.reduce((a, b) => (b.max > a.max ? b : a)) : null;
  return { A, B, F, total, lost, lostN, short, long, skew: B.forks.filter(f => bsSkew(f).bad).length };
}

/** Показывает на карте цепочку блоков до блока id и подписывает, сколько по ней читать. */
function bsShowRoute(id, kind) {
  const ids = anRoute(id, kind); if (!ids.length) return;
  const A = anPaths(), nodes = ids.map(nodeById).filter(Boolean); if (!nodes.length) return;
  setSel(ids);
  const bb = nodesBBox(nodes), r = stage.getBoundingClientRect();
  const k = clamp(Math.min((r.width - 160) / Math.max(1, bb.x1 - bb.x0), (r.height - 260) / Math.max(1, bb.y1 - bb.y0), 1), 0.1, 1);
  centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, k);
  const total = (kind === 'max' ? A.max : A.min).get(id) + (A.words.get(id) || 0);
  const tgt = nodeById(id);
  toast(t('bs.route.toast', t(kind === 'max' ? 'bs.route.kmax' : 'bs.route.kmin'), tgt ? bsTitle(tgt) : '', t('bs.blocks', nodes.length), bsWords(total), fmtDur(total)), 6000);
}
const bsRouteBtns = (id, A, close) => {
  const a = A.min.get(id), b = A.max.get(id), out = [];
  const mk = (kind) => h('button', { class: 'btn sm', 'data-tip': t('bs.route.' + kind + '.t'), onclick: () => { close(); bsShowRoute(id, kind); } }, t('bs.route.' + kind));
  if (a == null) return out;
  out.push(mk('min')); if (b !== a) out.push(mk('max'));
  return out;
};

function openBranchStats(opts) {
  opts = opts || {}; closePopover();
  if (opts.tab) BS_ST.tab = opts.tab;
  let seenVer = DATA_VER, timer = 0;
  openModal({
    cls: 'bs-m', onClose: () => clearInterval(timer), build: m => {
      const top = h('div', { class: 'bs-top' }), tabs = h('div', { class: 'bs-tabs' }), body = h('div', { class: 'bs-body scroll' });
      const close = () => m.close();

      /* скорость чтения */
      const paintTop = () => {
        const cur = rdWpm();
        const num = h('input', { class: 'inp num', type: 'number', min: 60, max: 600, step: 10, value: cur, 'aria-label': t('bs.speed'), id: 'bs-wpm' });
        const apply = v => { const x = clamp(Math.round(+v) || 200, 60, 600); if (x === rdWpm() && String(x) === String(num.value)) return; S.readWpm = x; saveSettings(); paintTop(); paintBody(); };
        num.addEventListener('change', () => apply(num.value));
        num.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(num.value); } });
        top.replaceChildren(
          h('div', { class: 'bs-speed' }, h('span', { class: 'lab' }, t('bs.speed')),
            segmented(BS_SPEEDS.map(v => ({ value: v, label: String(v), tip: t('bs.sp.' + v) })), BS_SPEEDS.includes(cur) ? cur : null, apply),
            num, h('span', { class: 'hint' }, t('bs.speed.u'))),
          h('div', { class: 'bs-sph' }, t('bs.speed.h')));
      };
      const paintTabs = () => {
        tabs.replaceChildren(segmented([['sum', 'bs.t.sum'], ['end', 'bs.t.end'], ['fork', 'bs.t.fork'], ['to', 'bs.t.to']].map(([v, k]) => ({ value: v, label: t(k) })), BS_ST.tab, v => { BS_ST.tab = v; paintBody(); body.scrollTop = 0; }, 'tabs'));
      };

      /* вкладка «Итоги» */
      const card = (cls, k, v, s, acts) => h('div', { class: 'bs-card' + (cls ? ' ' + cls : '') }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v), s ? h('div', { class: 's' }, s) : null, acts && acts.length ? h('div', { class: 'acts' }, ...acts) : null);
      const viewSum = (X) => {
        const root = h('div', { class: 'bs-cards' });
        root.append(card('', t('bs.c.total'), fmtDur(X.total), bsWords(X.total)));
        root.append(card('', t('bs.c.short'), X.short ? fmtDur(X.short.min) : '—',
          X.short ? h('div', {}, bsWords(X.short.min), ' · ', bsTitle(X.short.node)) : t('bs.c.none'),
          X.short ? [h('button', { class: 'btn sm', 'data-tip': t('bs.route.min.t'), onclick: () => { close(); bsShowRoute(X.short.node.id, 'min'); } }, t('bs.show'))] : []));
        root.append(card('', t('bs.c.long'), X.long ? fmtDur(X.long.max) : '—',
          X.long ? h('div', {}, bsWords(X.long.max), ' · ', bsTitle(X.long.node)) : t('bs.c.none'),
          X.long ? [h('button', { class: 'btn sm', 'data-tip': t('bs.route.max.t'), onclick: () => { close(); bsShowRoute(X.long.node.id, 'max'); } }, t('bs.show'))] : []));
        const nEnd = X.F.list.length, nOk = X.F.rows.length;
        root.append(card(nEnd && !nOk ? 'warn' : '', t('bs.c.ends'), nEnd ? t('bs.c.ends.v', nOk, nEnd) : '0', X.F.kind === 'ending' ? t('bs.c.ends.s') : t('bs.c.ends.t')));
        root.append(card('', t('bs.c.forks'), String(X.B.forks.length), X.B.forks.length ? t('bs.c.forks.s', X.B.forks.length, X.skew) : t('bs.c.none')));
        if (X.lostN) root.append(card('warn', t('bs.c.lost'), fmtDur(X.lost), t('bs.c.lost.s', bsWords(X.lost), t('bs.blocks', X.lostN)),
          [h('button', { class: 'btn sm', onclick: () => { close(); openStoryChecks(); } }, t('bs.checks'))]));
        const wrap = h('div');
        if (X.F.kind === 'terminal' && X.F.list.length) wrap.append(h('div', { class: 'bs-hint' }, icon('info', 15), t('bs.noends.t')));
        if (X.F.kind === 'ending' && !nOk) wrap.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('bs.noends')));
        wrap.append(root);
        return wrap;
      };

      /* вкладка «Концовки» */
      const rangeBar = (min, max, scale) => {
        const p = x => Math.max(0, Math.min(100, scale ? x / scale * 100 : 0));
        return h('div', { class: 'bs-bar' }, h('i', { class: 'a', style: { left: '0', width: p(min) + '%' } }), max > min ? h('i', { class: 'b', style: { left: p(min) + '%', width: Math.max(0.8, p(max) - p(min)) + '%' } }) : null);
      };
      const viewEnds = (X) => {
        const root = h('div', { class: 'bs-list' });
        if (!X.F.list.length) return h('div', { class: 'empty' }, t('bs.noends'));
        if (X.F.kind === 'terminal') root.append(h('div', { class: 'bs-hint' }, icon('info', 15), t('bs.noends.t')));
        root.append(h('div', { class: 'bs-h' }, t('bs.e.h')));
        const list = X.F.list.slice().sort((a, b) => (a.reached === b.reached ? 0 : a.reached ? -1 : 1) || (a.min || 0) - (b.min || 0) || bsTitle(a.node).localeCompare(bsTitle(b.node)));
        const scale = Math.max(1, ...list.filter(r => r.reached).map(r => r.max));
        for (const r of list) {
          const n = r.node;
          const nm = h('div', { class: 'bs-n' }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), h('span', { class: 't' }, bsTitle(n)));
          const mid = r.reached
            ? h('div', { class: 'bs-mid' }, rangeBar(r.min, r.max, scale),
              h('div', { class: 'bs-sub' }, t('bs.e.reach', bsRange(r.min, r.max) + ' (' + bsWR(r.min, r.max) + ')')),
              X.F.kind === 'ending' && r.ownNodes ? h('div', { class: 'bs-sub' }, t('bs.e.own', fmtDur(r.own) + ', ' + t('bs.blocks', r.ownNodes))) : null)
            : h('div', { class: 'bs-mid' }, h('span', { class: 'bs-tag warn' }, t('bs.e.unreach')));
          const acts = h('div', { class: 'bs-act' }, h('button', { class: 'btn icon sm', 'data-tip': t('bs.show'), onclick: () => { close(); focusNode(n.id); } }, icon('target', 15)),
            ...(r.reached ? bsRouteBtns(n.id, X.A, close) : []));
          root.append(h('div', { class: 'bs-r' }, nm, mid, acts));
        }
        return root;
      };

      /* вкладка «Развилки» */
      const viewForks = (X) => {
        const root = h('div', { class: 'bs-list' });
        if (!X.B.forks.length) return h('div', { class: 'empty' }, t('bs.f.empty'));
        root.append(h('div', { class: 'bs-h' }, t('bs.f.h')));
        root.append(h('div', { class: 'pal-chips bs-chips' }, ...[[false, 'bs.f.all', X.B.forks.length], [true, 'bs.f.only', X.skew]].map(([v, k, c]) =>
          h('button', { class: 'pal-chip' + (BS_ST.skewOnly === v ? ' on' : ''), onclick: () => { BS_ST.skewOnly = v; paintBody(); } }, t(k), h('span', { class: 'cnt' }, ' ' + c)))));
        const shown = X.B.forks.filter(f => !BS_ST.skewOnly || bsSkew(f).bad);
        if (!shown.length) root.append(h('div', { class: 'empty' }, t('bs.f.noneuneven')));
        for (const f of shown) {
          const sk = bsSkew(f), scale = Math.max(1, ...f.opts.map(o => o.total));
          const card = h('div', { class: 'bs-fk' + (sk.bad ? ' bad' : '') });
          card.append(h('div', { class: 'bs-fh' }, icon('fork', 16), h('span', { class: 't' }, bsTitle(f.node)),
            sk.bad ? h('span', { class: 'bs-tag warn', 'data-tip': t('bs.f.skew.t') }, t('bs.f.skew', (Math.round(sk.ratio * 10) / 10).toString().replace('.', S.lang === 'ru' ? ',' : '.'))) : null,
            h('button', { class: 'btn icon sm', 'data-tip': t('bs.show'), onclick: () => { close(); focusNode(f.node.id); } }, icon('target', 15))));
          for (const o of f.opts) {
            const tn = o.to, name = (o.label || '').trim() || (tn ? bsTitle(tn) : t('bs.f.noname'));
            const same = o.label && tn ? ' → ' + bsTitle(tn) : '';
            card.append(h('div', { class: 'bs-op' },
              h('div', { class: 'bs-opn' }, h('span', { class: 't' }, name), same ? h('span', { class: 'bs-opt' }, same) : null),
              h('div', { class: 'bs-mid' },
                h('div', { class: 'bs-bar' }, h('i', { class: 'a', style: { left: '0', width: (o.own / scale * 100) + '%' } }), o.total > o.own ? h('i', { class: 'b', style: { left: (o.own / scale * 100) + '%', width: Math.max(0.8, (o.total - o.own) / scale * 100) + '%' } }) : null),
                h('div', { class: 'bs-sub' }, o.ownNodes ? t('bs.f.own', fmtDur(o.own) + ', ' + t('bs.blocks', o.ownNodes)) : t('bs.f.merge'), ' · ', t('bs.f.tot', fmtDur(o.total))))));
          }
          if (sk.zero) card.append(h('div', { class: 'bs-sub bs-z' }, t('bs.f.zero')));
          root.append(card);
        }
        return root;
      };

      /* вкладка «До блока» */
      const viewTo = (X) => {
        const root = h('div', { class: 'bs-list' }), A = X.A;
        root.append(h('div', { class: 'bs-h' }, t('bs.t.h')));
        const q = h('input', { class: 'inp', type: 'search', placeholder: t('bs.t.q'), value: BS_ST.q, id: 'bs-q' });
        const rowsBox = h('div', { class: 'bs-rows' });
        const rows = A.G.nodes.map(n => ({ n, reached: A.reached.has(n.id), mn: A.min.get(n.id), mx: A.max.get(n.id), w: A.words.get(n.id) || 0 }))
          .sort((a, b) => (a.reached === b.reached ? 0 : a.reached ? -1 : 1) || (a.mn || 0) - (b.mn || 0) || bsTitle(a.n).localeCompare(bsTitle(b.n)));
        const fill = () => {
          const ql = BS_ST.q.trim().toLowerCase();
          const list = rows.filter(r => !ql || bsTitle(r.n).toLowerCase().includes(ql));
          rowsBox.replaceChildren();
          if (!list.length) { rowsBox.append(h('div', { class: 'empty' }, t('bs.t.none'))); return; }
          rowsBox.append(h('div', { class: 'bs-r bs-r3 bs-th' }, h('div', {}, t('bs.t.col.b')), h('div', {}, t('bs.t.col.o')), h('div', {}, t('bs.t.col.a')), h('div', {})));
          for (const r of list.slice(0, BS_ST.more)) {
            const n = r.n;
            const nm = h('div', { class: 'bs-n' }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), h('span', { class: 't' }, bsTitle(n)));
            const own = h('div', { class: 'bs-own' }, r.w ? fmtDur(r.w) : '—');
            const mid = !r.reached ? h('div', { class: 'bs-mid' }, h('span', { class: 'bs-tag warn' }, t('bs.t.unreach')))
              : A.starts.includes(n.id) && !r.mx ? h('div', { class: 'bs-mid' }, h('span', { class: 'bs-tag' }, t('bs.t.start')))
                : h('div', { class: 'bs-mid' }, h('b', {}, bsRange(r.mn, r.mx)), h('span', { class: 'bs-sub' }, ' (' + bsWR(r.mn, r.mx) + ')'));
            const acts = h('div', { class: 'bs-act' }, h('button', { class: 'btn icon sm', 'data-tip': t('bs.show'), onclick: () => { close(); focusNode(n.id); } }, icon('target', 15)),
              ...(r.reached && r.mx ? bsRouteBtns(n.id, A, close) : []));
            rowsBox.append(h('div', { class: 'bs-r bs-r3' }, nm, own, mid, acts));
          }
          if (list.length > BS_ST.more) rowsBox.append(h('div', { class: 'bs-more' }, h('button', { class: 'btn sm', onclick: () => { BS_ST.more += 60; fill(); } }, t('bs.more') + ' (' + (list.length - BS_ST.more) + ')')));
        };
        q.addEventListener('input', () => { BS_ST.q = q.value; BS_ST.more = 60; fill(); });
        root.append(h('div', { class: 'bs-find' }, q), rowsBox);
        fill();
        return root;
      };

      const paintBody = () => {
        seenVer = DATA_VER;
        const keep = body.scrollTop;
        body.replaceChildren();
        const hasNodes = P.nodes.some(n => n.type !== 'note');
        if (!hasNodes) { body.append(h('div', { class: 'empty' }, t('bs.empty'))); return; }
        const X = bsSum();
        if (!X.A.starts.length) { body.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('bs.nostart', t('nm.start')))); return; }
        if (!X.total) { body.append(h('div', { class: 'empty' }, t('bs.notext'))); return; }
        if (!P.startId && X.A.starts.length > 1) body.append(h('div', { class: 'bs-hint' }, icon('info', 15), t('bs.nostart.soft', X.A.starts.length)));
        body.append(BS_ST.tab === 'end' ? viewEnds(X) : BS_ST.tab === 'fork' ? viewForks(X) : BS_ST.tab === 'to' ? viewTo(X) : viewSum(X));
        body.append(h('div', { class: 'bs-foot' }, t('bs.foot')));
        body.scrollTop = keep;
      };
      timer = setInterval(() => { if (m.closed) { clearInterval(timer); return; } if (DATA_VER !== seenVer && !document.activeElement?.matches?.('#bs-q,#bs-wpm')) paintBody(); }, 1200);
      paintTop(); paintTabs(); paintBody();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('bs.title'), m), top, h('div', { class: 'bs-tabrow' }, tabs), body);
    }
  });
}
/** Строка для окна блока: сколько читать сам блок и через сколько игрок до него доходит. */
function bsNodeField(n, closeWin) {
  if (n.type === 'note') return null;
  const A = anPaths(), w = A.words.get(n.id) || 0, box = h('div', { class: 'bs-nmbox' });
  box.append(h('div', {}, t('bs.nm.own', fmtDur(w), bsWords(w))));
  if (!A.reached.has(n.id)) box.append(h('div', { class: 'bs-nmwarn' }, icon('alert', 14), t('bs.nm.lost')));
  else {
    const a = A.min.get(n.id), b = A.max.get(n.id);
    box.append(h('div', {}, a === 0 && b === 0 && A.starts.includes(n.id) ? t('bs.nm.start') : t('bs.nm.arr', bsRange(a, b) + ' (' + bsWR(a, b) + ')')));
    const acts = h('div', { class: 'row-actions left' });
    if (b > 0) for (const x of bsRouteBtns(n.id, A, closeWin)) acts.append(x);
    acts.append(h('button', { class: 'btn sm', onclick: () => { closeWin(); openBranchStats({ tab: 'to' }); } }, t('bs.nm.open')));
    box.append(acts);
  }
  return field(t('bs.nm'), box);
}
TOOL_ITEMS.push({ id: 'branchstats', group: 'story', ic: 'chart', key: 'bs.btn', kw: 'time reading branches endings forks balance length words minutes speed время чтения ветки концовки развилки баланс длина слова минуты скорость', run: () => openBranchStats() });

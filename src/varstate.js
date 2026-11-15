'use strict';
/* ====== Переменные в блоках: какие значения могут быть у игрока при входе в каждый блок ======
   Расчёт даёт analysis.js (anStates): он идёт по стрелкам от начала игры, применяет присвоения из скриптов и со стрелок
   и сужает значения условиями. Здесь окно «Переменные в блоках» (по переменной и «где выполнится условие») и раздел в окне блока.
   Честность прежде всего: что программа не смогла разобрать, она так и пишет, а не угадывает. */
Object.assign(D, {
  'vs.btn': ['Переменные в блоках…', 'Variables in blocks…'],
  'vs.title': ['Переменные в блоках', 'Variables in blocks'],
  'vs.t.var': ['По переменной', 'By variable'], 'vs.t.cond': ['Где выполнится условие', 'Where a condition can hold'],
  'vs.none': ['В реестре нет переменных, которые можно отследить (флаги, числа, выборы). Добавьте их во вкладке «Переменные» реестра.', 'There are no trackable variables in the registry (flags, numbers, choices). Add some on the registry “Variables” tab.'],
  'vs.noblocks': ['На карте пока нет блоков.', 'There are no blocks on the map yet.'],
  'vs.nostart': ['Не удалось понять, с чего начинается игра, поэтому значения посчитать нельзя. Отметьте стартовый блок в его окне.', 'Cannot tell where the game starts, so the values cannot be worked out. Mark the start block in its window.'],
  'vs.pick': ['Переменная', 'Variable'],
  'vs.type.flag': ['флаг', 'flag'], 'vs.type.number': ['число', 'number'], 'vs.type.choice': ['выбор', 'choice'],
  'vs.init': ['В начале игры: {0}', 'At the start of the game: {0}'],
  'vs.sets.none': ['Нигде не меняется: всегда остаётся как в начале.', 'Never changes: it stays as at the start.'],
  'vs.sets': ['Меняется: {0}', 'Changes: {0}'],
  'vs.sets.b': [['в {0} блоке', 'в {0} блоках', 'в {0} блоках'], ['in {0} block', 'in {0} blocks']],
  'vs.sets.e': [['на {0} стрелке', 'на {0} стрелках', 'на {0} стрелках'], ['on {0} arrow', 'on {0} arrows']],
  'vs.sets.and': [' и ', ' and '],
  'vs.f.all': ['Все блоки', 'All blocks'], 'vs.f.chg': ['Где меняется', 'Where it changes'], 'vs.f.amb': ['Где значение неоднозначно', 'Where it is ambiguous'],
  'vs.col.b': ['Блок', 'Block'], 'vs.col.in': ['При входе', 'On entry'], 'vs.col.out': ['После блока', 'After the block'],
  'vs.same': ['так же', 'same'],
  'vs.nolog': ['сюда не дойти', 'cannot be reached'],
  'vs.nolog.cond': ['условия на стрелках не пускают сюда', 'arrow conditions do not allow getting here'],
  'vs.nolog.t': ['Сюда ведут стрелки, но ни одно их условие не может выполниться при значениях переменных до этого места.', 'Arrows lead here, but none of their conditions can hold given the variable values up to this point.'],
  'vs.empty.f': ['В этом фильтре пусто.', 'Nothing matches this filter.'],
  'vs.more': ['Показать ещё', 'Show more'],
  'vs.show': ['Показать на карте', 'Show on the map'], 'vs.open': ['Открыть блок', 'Open the block'],
  'vs.foot': ['Значения считаются по карте: от начала игры по стрелкам, с учётом присвоений в скриптах и на стрелках и условий на стрелках. «Да или нет», «от … до …» означают, что по разным путям у игрока может быть по-разному. Переменные, которых нет в реестре, не отслеживаются.', 'Values are worked out from the map: from the start along the arrows, with assignments in scripts and on arrows and arrow conditions. “yes or no” and “from … to …” mean the player may have different values along different routes. Variables missing from the registry are not tracked.'],
  /* условие */
  'vs.c.h': ['Введите условие так же, как у стрелки, и увидите, в каких блоках игрок сможет его выполнить.', 'Type a condition the way you do for an arrow and see in which blocks the player can satisfy it.'],
  'vs.c.ph': ['Например: trust >= 3 and met', 'For example: trust >= 3 and met'],
  'vs.c.ex': ['Можно: флаг, not флаг, имя == "значение", число >= 3 (и > < <= == !=), а также and и or.', 'Supported: flag, not flag, name == "value", number >= 3 (also > < <= == !=), and also and / or.'],
  'vs.c.chips': ['Вставить имя:', 'Insert a name:'],
  'vs.c.bad.unk': ['Нет такой переменной в реестре: {0}', 'No such variable in the registry: {0}'],
  'vs.c.bad.syn': ['Не могу разобрать: «{0}»', 'Cannot parse: “{0}”'],
  'vs.c.always': ['Условие выполнится всегда', 'The condition always holds'], 'vs.c.maybe': ['Может выполниться, а может и нет', 'May or may not hold'], 'vs.c.never': ['Не выполнится никогда', 'Never holds'],
  'vs.c.always.h': ['Какие бы пути ни привели игрока в этот блок, условие верно.', 'Whatever route brought the player here, the condition is true.'],
  'vs.c.maybe.h': ['На одних путях верно, на других нет (или программа не смогла это доказать).', 'True on some routes and not on others (or the program could not prove it).'],
  'vs.c.never.h': ['Ни на одном пути значения не подходят.', 'No route gives suitable values.'],
  'vs.c.empty': ['Введите условие выше.', 'Type a condition above.'],
  'vs.c.noblocks': ['Таких блоков нет.', 'No such blocks.'],
  'vs.c.sum': ['Всего блоков, куда можно попасть: {0}', 'Blocks that can be reached: {0}'],
  /* окно блока */
  'vs.nm': ['Переменные при входе', 'Variables on entry'],
  'vs.nm.none.logic': ['Сюда не дойти: ни по стрелкам, ни по их условиям, поэтому значения неизвестны.', 'This block cannot be reached by the arrows and their conditions, so the values are unknown.'],
  'vs.nm.all': ['Все переменные…', 'All variables…'],
});

const VS_ST = { tab: 'var', varId: '', filter: 'all', cond: '', more: 80 };
const VS_VARICON = { flag: 'flag', choice: 'fork', number: 'hash' };

const vsTitle = n => n.title || t('node.new.' + n.type);
/** Одно число и состояние на входе в блок и после него. */
function vsRows() {
  const S = anStates(), A = anPaths(), rows = [];
  for (const n of A.G.nodes) {
    const en = S.entry.get(n.id), reachedGraph = A.reached.has(n.id);
    rows.push({ n, en, af: en ? anNodeApply(n, en) : null, mn: A.min.get(n.id), graph: reachedGraph });
  }
  rows.sort((a, b) => (!!a.en === !!b.en ? 0 : a.en ? -1 : 1) || (a.mn == null) - (b.mn == null) || (a.mn || 0) - (b.mn || 0) || vsTitle(a.n).localeCompare(vsTitle(b.n)));
  return { S, A, rows };
}
const vsAmb = d => !!d && ((d.k === 'f' && d.t && d.f) || (d.k === 'n' && d.lo !== d.hi) || (d.k === 'c' && (!d.vals || d.vals.size > 1)));
/** Где и как переменная меняется: блоки (по скриптам) и стрелки (присвоения на стрелке или код). */
function vsSetters(v) {
  const A = anPaths(), blocks = [], edges = [];
  for (const n of A.G.nodes) {
    let hit = false;
    for (const f of n.files) for (const x of anScriptSets(f)) { const m = RE_SETTER.exec(x.line); if (m && m[1] === v.name) hit = true; }
    if (hit) blocks.push(n);
  }
  for (const e of P.edges) {
    let hit = (e.sets || []).some(s => s.v === v.id);
    if (!hit) for (const l of String(e.code || '').split('\n')) { const m = l.trim() && RE_SETTER.exec(l); if (m && m[1] === v.name) hit = true; }
    if (hit) edges.push(e);
  }
  return { blocks, edges };
}

/* ---------- разбор условия (то же подмножество, что понимает anRefine) ---------- */
const VS_TERMS = [
  /^not\s+([A-Za-z_]\w*)$/, /^([A-Za-z_]\w*)$/, /^([A-Za-z_]\w*)\s*(?:==|!=)\s*(?:True|False)$/,
  /^([A-Za-z_]\w*)\s*(?:==|!=)\s*(["'])(?:\\.|(?!\2).)*\2$/, /^([A-Za-z_]\w*)\s*(?:>=|<=|>|<|==|!=)\s*-?\d+(?:\.\d+)?$/,
];
const VS_NEG = { '>=': '<', '>': '<=', '<=': '>', '<': '>=', '==': '!=', '!=': '==' };
function vsNegate(term) {
  let m;
  if ((m = /^not\s+([A-Za-z_]\w*)$/.exec(term))) return m[1];
  if ((m = /^([A-Za-z_]\w*)$/.exec(term))) return 'not ' + m[1];
  if ((m = /^([A-Za-z_]\w*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/.exec(term))) return m[1] + ' ' + VS_NEG[m[2]] + ' ' + m[3];
  return null;
}
/** Разбирает условие на «или» из «и». Возвращает { alts: [[терм, …], …] } или { bad: [...] }. */
function vsParse(cond) {
  const src = String(cond || '').trim(), names = new Set(anTracked().map(v => v.name)), bad = [];
  if (!src) return { alts: [] };
  const alts = [];
  for (const part of src.split(/\s+or\s+|\|\|/i)) {
    const terms = [];
    for (let term of part.split(/\s+and\s+|&&/i)) {
      term = term.trim().replace(/^\(+|\)+$/g, '').trim(); if (!term) continue;
      if (!VS_TERMS.some(re => re.test(term))) { bad.push({ kind: 'syn', text: term }); continue; }
      const nm = (/^(?:not\s+)?([A-Za-z_]\w*)/.exec(term) || [])[1];
      if (nm && !names.has(nm)) bad.push({ kind: 'unk', text: nm });
      terms.push(term);
    }
    if (terms.length) alts.push(terms);
  }
  return bad.length ? { bad } : { alts };
}
/** 'always' | 'maybe' | 'never' для условия в состоянии st. «Всегда» только если доказано. */
function vsHold(st, alts) {
  let can = false;
  for (const terms of alts) {
    let cur = st, dead = false;
    for (const tm of terms) { const r = anRefine(cur, tm); if (!r.st) { dead = true; break; } cur = r.st; }
    if (dead) continue;
    can = true;
    if (terms.every(tm => { const ng = vsNegate(tm); return ng && anRefine(st, ng).dead; })) return 'always';
  }
  return can ? 'maybe' : 'never';
}

function vsStateText(d) { return d ? anFmtD(d) : '—'; }
function vsValEl(d, cls) { return h('span', { class: 'vs-val' + (vsAmb(d) ? ' amb' : '') + (cls ? ' ' + cls : '') }, vsStateText(d)); }

function openVarStates(opts) {
  opts = opts || {}; closePopover();
  if (opts.varId) { VS_ST.varId = opts.varId; VS_ST.tab = 'var'; VS_ST.filter = 'all'; VS_ST.more = 80; }
  if (opts.tab) VS_ST.tab = opts.tab;
  let seenVer = DATA_VER, timer = 0;
  openModal({
    cls: 'vs-m', onClose: () => clearInterval(timer), build: m => {
      const tabs = h('div', { class: 'bs-tabrow' }), body = h('div', { class: 'bs-body scroll' });
      const close = () => m.close();
      const paintTabs = () => tabs.replaceChildren(segmented([['var', 'vs.t.var'], ['cond', 'vs.t.cond']].map(([v, k]) => ({ value: v, label: t(k) })), VS_ST.tab, v => { VS_ST.tab = v; paintBody(); body.scrollTop = 0; }, 'tabs'));
      const showOn = (ids) => { close(); setSel(ids); const nodes = ids.map(nodeById).filter(Boolean); if (nodes.length) { const bb = nodesBBox(nodes), r = stage.getBoundingClientRect(); const k = clamp(Math.min((r.width - 160) / Math.max(1, bb.x1 - bb.x0), (r.height - 260) / Math.max(1, bb.y1 - bb.y0), 1), 0.1, 1); centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, k); } };
      const rowActs = n => h('div', { class: 'bs-act' },
        h('button', { class: 'btn icon sm', 'data-tip': t('vs.show'), onclick: () => { close(); focusNode(n.id); } }, icon('target', 15)),
        h('button', { class: 'btn icon sm', 'data-tip': t('vs.open'), onclick: () => { close(); openNodeModal(n.id); } }, icon('open', 15)));
      const noLogic = r => (r.graph ? t('vs.nolog.cond') : t('vs.nolog'));

      /* вкладка «По переменной» */
      const viewVar = (X, tracked) => {
        const root = h('div', { class: 'bs-list' });
        if (!tracked.some(v => v.id === VS_ST.varId)) VS_ST.varId = tracked[0].id;
        const v = tracked.find(x => x.id === VS_ST.varId);
        const sel = h('select', { class: 'inp', id: 'vs-var', 'aria-label': t('vs.pick') }, ...tracked.map(x => h('option', { value: x.id }, x.name + ' · ' + t('vs.type.' + x.type))));
        sel.value = v.id; sel.addEventListener('change', () => { VS_ST.varId = sel.value; VS_ST.filter = 'all'; VS_ST.more = 80; paintBody(); });
        root.append(h('div', { class: 'vs-pick' }, h('span', { class: 'lab' }, t('vs.pick')), sel));
        const ini = anInit(v), st = vsSetters(v);
        const parts = []; if (st.blocks.length) parts.push(t('vs.sets.b', st.blocks.length)); if (st.edges.length) parts.push(t('vs.sets.e', st.edges.length));
        root.append(h('div', { class: 'vs-sum' },
          h('div', {}, icon(VS_VARICON[v.type] || 'dot', 15), h('b', { class: 'mono' }, v.name), h('span', { class: 'hint' }, ' · ' + t('vs.type.' + v.type))),
          h('div', { class: 'bs-sub' }, t('vs.init', anFmtD(ini))),
          h('div', { class: 'bs-sub' }, parts.length ? t('vs.sets', parts.join(t('vs.sets.and'))) : t('vs.sets.none'))));
        const all = X.rows.map(r => ({ r, en: r.en && r.en[v.name], af: r.af && r.af[v.name] }));
        const chg = x => x.en && x.af && !anEqD(x.en, x.af);
        const cnt = { all: all.length, chg: all.filter(chg).length, amb: all.filter(x => vsAmb(x.en)).length };
        root.append(h('div', { class: 'pal-chips bs-chips' }, ...[['all', 'vs.f.all'], ['chg', 'vs.f.chg'], ['amb', 'vs.f.amb']].map(([k, key]) =>
          h('button', { class: 'pal-chip' + (VS_ST.filter === k ? ' on' : ''), onclick: () => { VS_ST.filter = k; VS_ST.more = 80; paintBody(); } }, t(key), h('span', { class: 'cnt' }, ' ' + cnt[k])))));
        const list = all.filter(x => VS_ST.filter === 'all' || (VS_ST.filter === 'chg' ? chg(x) : vsAmb(x.en)));
        const box = h('div', { class: 'bs-rows' });
        if (!list.length) box.append(h('div', { class: 'empty' }, t('vs.empty.f')));
        else {
          box.append(h('div', { class: 'bs-r vs-r bs-th' }, h('div', {}, t('vs.col.b')), h('div', {}, t('vs.col.in')), h('div', {}, t('vs.col.out')), h('div', {})));
          for (const x of list.slice(0, VS_ST.more)) {
            const n = x.r.n;
            const nm = h('div', { class: 'bs-n' }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), h('span', { class: 't' }, vsTitle(n)));
            if (!x.r.en) { box.append(h('div', { class: 'bs-r vs-r' }, nm, h('div', { class: 'vs-span', 'data-tip': x.r.graph ? t('vs.nolog.t') : null }, h('span', { class: 'bs-tag warn' }, noLogic(x.r))), rowActs(n))); continue; }
            box.append(h('div', { class: 'bs-r vs-r' }, nm, h('div', {}, vsValEl(x.en)), h('div', {}, chg(x) ? vsValEl(x.af, 'chg') : h('span', { class: 'bs-sub' }, t('vs.same'))), rowActs(n)));
          }
          if (list.length > VS_ST.more) box.append(h('div', { class: 'bs-more' }, h('button', { class: 'btn sm', onclick: () => { VS_ST.more += 80; paintBody(); } }, t('vs.more') + ' (' + (list.length - VS_ST.more) + ')')));
        }
        root.append(box);
        return root;
      };

      /* вкладка «Где выполнится условие» */
      const viewCond = (X, tracked) => {
        const root = h('div', { class: 'bs-list' }), res = h('div', { class: 'vs-res' });
        root.append(h('div', { class: 'bs-h' }, t('vs.c.h')));
        const inp = h('input', { class: 'inp mono', id: 'vs-cond', placeholder: t('vs.c.ph'), value: VS_ST.cond, spellcheck: 'false', autocomplete: 'off' });
        const chips = h('div', { class: 'vs-chips' }, h('span', { class: 'hint' }, t('vs.c.chips')), ...tracked.map(v => h('button', { class: 'pal-chip', onclick: () => { inp.value = (inp.value ? inp.value.replace(/\s*$/, ' ') : '') + v.name + ' '; inp.focus(); inp.dispatchEvent(new Event('input')); } }, v.name)));
        root.append(inp, chips, h('div', { class: 'bs-sub vs-ex' }, t('vs.c.ex')), res);
        const fill = () => {
          VS_ST.cond = inp.value; res.replaceChildren();
          const pr = vsParse(inp.value);
          if (!inp.value.trim()) { res.append(h('div', { class: 'empty' }, t('vs.c.empty'))); return; }
          if (pr.bad) { res.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), h('div', {}, ...pr.bad.map(b => h('div', {}, b.kind === 'unk' ? t('vs.c.bad.unk', b.text) : t('vs.c.bad.syn', b.text)))))); return; }
          if (!pr.alts.length) { res.append(h('div', { class: 'empty' }, t('vs.c.empty'))); return; }
          const groups = { always: [], maybe: [], never: [] };
          for (const r of X.rows) if (r.en) groups[vsHold(r.en, pr.alts)].push(r);
          const total = groups.always.length + groups.maybe.length + groups.never.length;
          res.append(h('div', { class: 'bs-sub vs-tot' }, t('vs.c.sum', total)));
          for (const k of ['always', 'maybe', 'never']) {
            const list = groups[k];
            const head = h('div', { class: 'vs-gh' }, h('i', { class: 'vs-dot g-' + k }), h('b', {}, t('vs.c.' + k)), h('span', { class: 'sc-gc' }, String(list.length)), h('div', { class: 'grow' }),
              k !== 'never' && list.length ? h('button', { class: 'btn sm', onclick: () => showOn(list.map(r => r.n.id)) }, t('vs.show')) : null);
            const g = h('div', { class: 'vs-g' }, head, h('div', { class: 'bs-sub vs-gd' }, t('vs.c.' + k + '.h')));
            if (!list.length) g.append(h('div', { class: 'bs-sub vs-none' }, t('vs.c.noblocks')));
            else {
              const names = h('div', { class: 'vs-names' });
              for (const r of list.slice(0, 120)) names.append(h('button', { class: 'vs-name', 'data-tip': t('vs.show'), onclick: () => { close(); focusNode(r.n.id); } }, h('span', { class: 'bs-dot', style: { background: palColor(r.n.color) } }), vsTitle(r.n)));
              if (list.length > 120) names.append(h('span', { class: 'bs-sub' }, '… +' + (list.length - 120)));
              g.append(names);
            }
            res.append(g);
          }
        };
        inp.addEventListener('input', fill);
        fill();
        return root;
      };

      const paintBody = () => {
        seenVer = DATA_VER;
        const keep = body.scrollTop, focused = document.activeElement && document.activeElement.id;
        body.replaceChildren();
        const tracked = anTracked();
        if (!P.nodes.some(n => n.type !== 'note')) { body.append(h('div', { class: 'empty' }, t('vs.noblocks'))); return; }
        if (!tracked.length) { body.append(h('div', { class: 'empty' }, t('vs.none'))); return; }
        const X = vsRows();
        if (!X.A.starts.length) { body.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('vs.nostart'))); return; }
        body.append(VS_ST.tab === 'cond' ? viewCond(X, tracked) : viewVar(X, tracked), h('div', { class: 'bs-foot' }, t('vs.foot')));
        body.scrollTop = keep;
        if (focused === 'vs-cond') { const i = body.querySelector('#vs-cond'); if (i) { i.focus(); const l = i.value.length; try { i.setSelectionRange(l, l); } catch (e) { /* не страшно */ } } }
      };
      timer = setInterval(() => { if (m.closed) { clearInterval(timer); return; } if (DATA_VER !== seenVer && !document.activeElement?.matches?.('#vs-cond,#vs-var')) paintBody(); }, 1200);
      paintTabs(); paintBody();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('vs.title'), m), tabs, body);
    }
  });
}

/** Раздел для окна блока: значения переменных реестра на входе в блок и после него. */
function vsNodeField(n, closeWin) {
  if (n.type === 'note') return null;
  const tracked = anTracked(); if (!tracked.length) return null;
  const S = anStates(), en = S.entry.get(n.id), box = h('div', { class: 'vs-nmbox' });
  if (!S.starts.length) return null;
  if (!en) box.append(h('div', { class: 'bs-nmwarn' }, icon('alert', 14), t('vs.nm.none.logic')));
  else {
    const af = anNodeApply(n, en);
    for (const v of tracked) {
      const a = en[v.name], b = af[v.name], chg = a && b && !anEqD(a, b);
      box.append(h('button', { class: 'vs-nmrow', 'data-tip': t('vs.nm.all'), onclick: () => { closeWin(); openVarStates({ varId: v.id }); } },
        icon(VS_VARICON[v.type] || 'dot', 14), h('span', { class: 'mono n' }, v.name), vsValEl(a),
        chg ? h('span', { class: 'vs-arr' }, '→ ', vsValEl(b, 'chg')) : null));
    }
  }
  box.append(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', onclick: () => { closeWin(); openVarStates(); } }, t('vs.nm.all'))));
  return field(t('vs.nm'), box);
}
TOOL_ITEMS.push({ id: 'varstates', group: 'story', ic: 'sliders', key: 'vs.btn', kw: 'variables values flags counters state condition where hold переменные значения флаги счётчик состояние условие где выполнится', run: () => openVarStates() });

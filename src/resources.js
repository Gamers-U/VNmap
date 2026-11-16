'use strict';
/* ====== Ресурсы: что нужно нарисовать и записать для каждой главы и блока ======
   Берём всё, что скрипты показывают и играют (scene, show, play music/sound/voice), плюс то, что автор отметил в окне блока вручную,
   и сверяем с реестром: есть ли такой ресурс, есть ли у него загруженный файл. Получается рабочий список для художника и композитора:
   на экране, чек-листом в буфер обмена и таблицей CSV/XLSX. */
Object.assign(D, {
  'rs.btn': ['Список ресурсов…', 'Resource list…'],
  'rs.title': ['Ресурсы: что нужно нарисовать и записать', 'Resources: what to draw and record'],
  'rs.open': ['Список ресурсов…', 'Resource list…'], 'rs.open.t': ['Список ресурсов этого блока и их готовность', 'Resources of this block and how ready they are'],
  'rs.empty': ['На карте пока нет блоков.', 'There are no blocks on the map yet.'],
  'rs.none': ['В скриптах пока нет команд scene, show и play, и ничего не отмечено вручную. Список появится, когда в блоках будут фоны, спрайты и звуки.', 'The scripts have no scene, show or play commands yet and nothing is marked by hand. The list appears once blocks use backgrounds, sprites and sounds.'],
  'rs.prog': ['Готово {0} из {1}', 'Ready {0} of {1}'],
  'rs.prog.h': ['Считаются разные ресурсы без повторов. «Готов» значит, что он есть в реестре и к нему загружен файл.', 'Different resources are counted once. “Ready” means it is in the registry and has an uploaded file.'],
  'rs.prog.all': ['Все ресурсы готовы', 'All resources are ready'],
  'rs.scope': ['Где', 'Where'], 'rs.scope.all': ['Весь проект', 'Whole project'],
  'rs.group': ['Показать', 'Group by'], 'rs.g.block': ['По блокам', 'By block'], 'rs.g.res': ['По ресурсам', 'By resource'],
  'rs.k.all': ['Все', 'All'],
  'rs.s.all': ['Любые', 'Any'], 'rs.s.todo': ['Не хватает', 'Missing'], 'rs.s.unreg': ['Нет в реестре', 'Not in the registry'], 'rs.s.ok': ['Готовы', 'Ready'],
  'rs.st.ok': ['Файл есть', 'Has a file'], 'rs.st.nofile': ['Нет файла', 'No file'], 'rs.st.unreg': ['Нет в реестре', 'Not in the registry'], 'rs.st.noexpr': ['Нет выражения', 'No expression'],
  'rs.st.ok.d': ['Готов', 'Ready'], 'rs.st.nofile.d': ['Нужен файл', 'Needs a file'], 'rs.st.unreg.d': ['Не заведён в реестре', 'Not in the registry'], 'rs.st.noexpr.d': ['Нет такого выражения у спрайта', 'The sprite lacks this expression'],
  'rs.via.script': ['в скрипте', 'in the script'], 'rs.via.hand': ['отмечен вручную', 'marked by hand'], 'rs.via.both': ['в скрипте и вручную', 'script and by hand'],
  'rs.a.reg': ['В реестр', 'To the registry'], 'rs.a.reg.t': ['Завести этот ресурс в реестре без файла', 'Add this resource to the registry without a file'],
  'rs.a.expr': ['Добавить выражение', 'Add expression'], 'rs.a.expr.t': ['Дописать выражение к спрайту в реестре', 'Add the expression to the sprite in the registry'],
  'rs.a.up': ['Загрузить файл…', 'Upload a file…'], 'rs.a.up.t': ['Выбрать файл с компьютера', 'Pick a file from your computer'],
  'rs.a.fill': ['Добавить недостающее в реестр', 'Add missing to the registry'],
  'rs.a.fill.t': ['Завести в реестре все ресурсы из списка, которых там нет, и недостающие выражения (без файлов)', 'Add every listed resource that is missing from the registry, and missing expressions (without files)'],
  'rs.a.fill.done': ['В реестр добавлено: ресурсов {0}, выражений {1}', 'Added to the registry: {0} resources, {1} expressions'],
  'rs.a.copy': ['Копировать чек-лист', 'Copy checklist'], 'rs.a.copy.t': ['Текст со списком того, что сейчас на экране: можно отправить художнику', 'Text with what is on screen now, ready to send to an artist'],
  'rs.a.copied': ['Чек-лист скопирован: {0}', 'Checklist copied: {0}'], 'rs.a.copyfail': ['Не удалось скопировать. Скачайте таблицу.', 'Could not copy. Download the table instead.'],
  'rs.a.csv': ['CSV', 'CSV'], 'rs.a.xlsx': ['XLSX', 'XLSX'], 'rs.a.exp.t': ['Скачать то, что сейчас на экране', 'Download what is on screen now'],
  'rs.show': ['Показать на карте', 'Show on the map'], 'rs.blk': ['Открыть блок', 'Open the block'],
  'rs.blk.cnt': ['{0} из {1} готово', '{0} of {1} ready'],
  'rs.uses': [['{0} блок', '{0} блока', '{0} блоков'], ['{0} block', '{0} blocks']],
  'rs.items': [['{0} ресурс', '{0} ресурса', '{0} ресурсов'], ['{0} resource', '{0} resources']],
  'rs.nofilter': ['По этим фильтрам ничего нет.', 'Nothing matches these filters.'],
  'rs.more': ['Показать ещё', 'Show more'],
  'rs.foot': ['Ресурсы берутся из команд scene, show, play music / sound / voice и voice в скриптах, а также из списка «Нужные ассеты» в окне блока. Команды без своего файла (scene black, переходы, трансформы) не считаются.', 'Resources come from the scene, show, play music / sound / voice and voice commands in scripts and from the “Needed assets” list in the block window. Commands without a file of their own (scene black, transitions, transforms) are not counted.'],
  /* экспорт */
  'rs.x.block': ['Блок', 'Block'], 'rs.x.file': ['Файл', 'File'], 'rs.x.kind': ['Тип', 'Type'], 'rs.x.name': ['Название', 'Name'], 'rs.x.expr': ['Выражение', 'Expression'],
  'rs.x.status': ['Статус', 'Status'], 'rs.x.via': ['Откуда', 'Source'], 'rs.x.path': ['Путь в игре', 'Path in the game'], 'rs.x.note': ['Заметка', 'Note'],
  'rs.x.uses': ['Блоков', 'Blocks'], 'rs.x.where': ['Где используется', 'Where it is used'],
  'rs.x.s1': ['Ресурсы', 'Resources'], 'rs.x.s2': ['Без повторов', 'Unique'], 'rs.x.s3': ['Описание визуала', 'Visual notes'], 'rs.x.visual': ['Описание', 'Description'],
  'rs.x.head': ['Ресурсы проекта «{0}»: готово {1} из {2}', 'Resources of “{0}”: ready {1} of {2}'],
});

const RS_KINDS = ['bg', 'sprite', 'music', 'sfx', 'voice'];
const RS_ST = { scope: '', kind: 'all', stat: 'all', prod: 'all', group: 'block', more: 40 };
const RS_BAD = new Set(['nofile', 'unreg', 'noexpr']);

/** Блоки без заметок в порядке сюжета (как в таблице реплик): от начала игры, недостижимые в конце. */
function rsNodes() {
  let rank = null; try { rank = anPaths().min; } catch (e) { rank = null; }
  const list = P.nodes.map((n, ix) => ({ n, ix })).filter(x => x.n.type !== 'note');
  list.sort((a, b) => { const ra = rank && rank.has(a.n.id) ? rank.get(a.n.id) : Infinity, rb = rank && rank.has(b.n.id) ? rank.get(b.n.id) : Infinity; return ra === rb ? a.ix - b.ix : ra < rb ? -1 : 1; });
  return list.map(x => x.n);
}
function rsStatus(it) {
  const a = it.a;
  if (!a) return 'unreg';
  if (it.kind === 'sprite') {
    if (it.expr && !a.expr.includes(it.expr)) return 'noexpr';
    const has = it.expr ? !!assetMeta(a, it.expr) : Object.values(a.files || {}).some(Boolean);
    return has ? 'ok' : 'nofile';
  }
  return assetMeta(a, '') ? 'ok' : 'nofile';
}
/** Плоский список «ресурс в файле блока»: из скрипта и отмеченные вручную. */
function rsItems() {
  const items = [];
  for (const n of rsNodes()) for (const f of n.files) {
    const map = new Map();
    for (const u of parseUsage(f.script)) {
      if (!RS_KINDS.includes(u.kind)) continue;
      const key = u.kind + '|' + u.name.toLowerCase() + '|' + (u.expr || '');
      if (!map.has(key)) map.set(key, { n, f, kind: u.kind, name: u.name, expr: u.expr || '', scripted: true, attached: false, note: '', a: matchAsset(u) });
    }
    for (const x of f.assets || []) {
      const a = assetById(x.ref); if (!a || !RS_KINDS.includes(a.kind)) continue;
      const have = [...map.values()].filter(it => it.a && it.a.id === a.id);
      if (have.length) { have.forEach(it => { it.attached = true; if (x.note && !it.note) it.note = x.note; }); continue; }
      map.set('att|' + a.id, { n, f, kind: a.kind, name: a.name || a.path, expr: '', scripted: false, attached: true, note: x.note || '', a });
    }
    for (const it of map.values()) { it.status = rsStatus(it); items.push(it); }
  }
  return items;
}
const rsKey = it => it.kind + '|' + (it.a ? it.a.id : it.name.toLowerCase()) + '|' + it.expr;
/** Разные ресурсы без повторов (один ресурс в десяти блоках считается один раз). */
function rsUnique(items) {
  const m = new Map();
  for (const it of items) { const k = rsKey(it); let u = m.get(k); if (!u) m.set(k, u = { kind: it.kind, name: it.name, expr: it.expr, a: it.a, status: it.status, uses: [] }); u.uses.push(it); }
  return [...m.values()];
}
const rsVia = it => t('rs.via.' + (it.scripted && it.attached ? 'both' : it.scripted ? 'script' : 'hand'));
const rsTitle = n => n.title || t('node.new.' + n.type);
const rsFileTitle = (n, f) => (n.files.length > 1 ? (f.title || t('file.untitled')) : (f.title && !(D['file.new'] || []).includes(f.title) ? f.title : ''));   // у блока с одной главой стандартное название «Новая глава» только шумит
const rsLabel = it => t('kind1.' + it.kind) + ': ' + it.name + (it.expr ? ' ' + it.expr : '');

/** Одинаковые для экрана и выгрузки фильтры: область, тип, статус. */
function rsFilter(items) {
  return items.filter(it => (!RS_ST.scope || it.n.id === RS_ST.scope) && (RS_ST.kind === 'all' || it.kind === RS_ST.kind)
    && (RS_ST.stat === 'all' || (RS_ST.stat === 'todo' ? RS_BAD.has(it.status) : RS_ST.stat === 'unreg' ? it.status === 'unreg' || it.status === 'noexpr' : it.status === 'ok')) && prodMatch(it.a, RS_ST.prod));
}
function rsTable(list) {
  const head = [t('rs.x.block'), t('rs.x.file'), t('rs.x.kind'), t('rs.x.name'), t('rs.x.expr'), t('rs.x.status'), t('rs.x.via'), t('rs.x.path'), t('rs.x.note'), t('pd.col.st'), t('pd.col.who'), t('pd.col.due')];
  const rows = [head];
  for (const it of list) rows.push([rsTitle(it.n), rsFileTitle(it.n, it.f), t('kind1.' + it.kind), it.name, it.expr, t('rs.st.' + it.status), rsVia(it), it.a ? it.a.path || '' : '', it.note, prodName(prodSt(it.a)), prodWho(it.a), prodDue(it.a)]);
  return rows;
}
function rsExportCsv(list) {
  const sep = S.lang === 'ru' ? ';' : ',';
  const text = '﻿' + rsTable(list).map(r => r.map(x => { x = String(x == null ? '' : x); return /["\r\n;,]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(sep)).join('\r\n') + '\r\n';
  return saveFile((slug(P.name) || 'project') + '_resources.csv', text, 'text/csv');
}
function rsExportXlsx(list) {
  const uq = rsUnique(list);
  const s2 = [[t('rs.x.kind'), t('rs.x.name'), t('rs.x.expr'), t('rs.x.status'), t('rs.x.path'), t('rs.x.uses'), t('rs.x.where'), t('pd.col.st'), t('pd.col.who'), t('pd.col.due')]];
  for (const u of uq) s2.push([t('kind1.' + u.kind), u.name, u.expr, t('rs.st.' + u.status), u.a ? u.a.path || '' : '', new Set(u.uses.map(x => x.n.id)).size, [...new Set(u.uses.map(x => rsTitle(x.n)))].join(', '), prodName(prodSt(u.a)), prodWho(u.a), prodDue(u.a)]);
  const s3 = [[t('rs.x.block'), t('rs.x.file'), t('rs.x.visual')]];
  for (const n of rsNodes()) for (const f of n.files) if (String(f.visual || '').trim() && (!RS_ST.scope || n.id === RS_ST.scope)) s3.push([rsTitle(n), rsFileTitle(n, f), f.visual]);
  const sheets = [{ name: t('rs.x.s1'), rows: rsTable(list), widths: [24, 18, 12, 26, 14, 20, 18, 30, 40, 16, 22, 12] }, { name: t('rs.x.s2'), rows: s2, widths: [12, 26, 14, 20, 30, 9, 50, 16, 22, 12] }];
  if (s3.length > 1) sheets.push({ name: t('rs.x.s3'), rows: s3, widths: [24, 18, 90] });
  return saveFile((slug(P.name) || 'project') + '_resources.xlsx', makeXlsx(sheets), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
/** Чек-лист в виде текста: по блокам, «[ ]» не готово, «[x]» готово. */
function rsChecklist(list, all) {
  const uq = rsUnique(all), done = uq.filter(u => u.status === 'ok').length;
  const out = [t('rs.x.head', P.name || '', done, uq.length), ''];
  let cur = null;
  for (const it of list) {
    if (it.n !== cur) { cur = it.n; out.push('', '## ' + rsTitle(it.n)); }
    const ft = rsFileTitle(it.n, it.f);
    out.push('- [' + (it.status === 'ok' ? 'x' : ' ') + '] ' + rsLabel(it) + (it.status === 'ok' ? '' : ' (' + t('rs.st.' + it.status).toLowerCase() + ')') + (ft ? ' · ' + ft : '') + (it.note ? ' · ' + it.note : '') + prodSuffix(it.a));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
/** Заводит в реестре недостающие ресурсы и выражения одним действием отмены. Возвращает [ресурсов, выражений]. */
function rsFillRegistry(items) {
  let na = 0, ne = 0; const made = new Map();
  for (const it of items) {
    if (it.status !== 'unreg' && it.status !== 'noexpr') continue;
    let a = it.a || made.get(it.kind + '|' + it.name.toLowerCase());
    if (!a) {
      a = { id: uid('a'), kind: it.kind, name: it.name, path: '', notes: '', expr: [], files: {} };
      if (['music', 'sfx', 'voice'].includes(it.kind) && /[\/.]/.test(it.name)) a.path = it.name;
      P.assets.push(a); made.set(it.kind + '|' + it.name.toLowerCase(), a); na++;
    }
    if (it.kind === 'sprite' && it.expr && !a.expr.includes(it.expr)) { a.expr.push(it.expr); ne++; }
  }
  if (na || ne) commit(true);
  return [na, ne];
}

function openResources(opts) {
  opts = opts || {}; closePopover();
  if (opts.nodeId !== undefined) { RS_ST.scope = opts.nodeId || ''; RS_ST.more = 40; }
  let seenVer = DATA_VER, timer = 0;
  openModal({
    cls: 'rs-m', onClose: () => clearInterval(timer), build: m => {
      const top = h('div', { class: 'rs-top' }), ctl = h('div', { class: 'rs-ctl' }), body = h('div', { class: 'cp-body scroll rs-body' });
      const close = () => m.close();

      const actFor = u => {
        const a = u.a, out = [];
        if (u.status === 'unreg') out.push(h('button', { class: 'btn sm', 'data-tip': t('rs.a.reg.t'), onclick: () => { rsFillRegistry([{ ...u, status: 'unreg', a: null }]); paint(); } }, icon('plus', 13), t('rs.a.reg')));
        else if (u.status === 'noexpr') out.push(h('button', { class: 'btn sm', 'data-tip': t('rs.a.expr.t'), onclick: () => { a.expr.push(u.expr); commit(true); paint(); } }, icon('plus', 13), t('rs.a.expr')));
        else if (u.status === 'nofile') out.push(h('button', { class: 'btn sm', 'data-tip': t('rs.a.up.t'), onclick: () => pickFiles(acceptFor(a.kind), false, async fl => { const key = a.kind === 'sprite' ? (u.expr && a.expr.includes(u.expr) ? u.expr : '') : ''; if (await attachFile(a, key, fl[0])) paint(); }) }, icon('upload', 13), t('rs.a.up')));
        return out;
      };
      const stTag = s => h('span', { class: 'rs-tag ' + (s === 'ok' ? 'ok' : s === 'nofile' ? 'warn' : 'bad'), 'data-tip': t('rs.st.' + s + '.d') }, t('rs.st.' + s));

      const paintTop = (all, scopeItems) => {
        const uq = rsUnique(scopeItems), ready = uq.filter(u => u.status === 'ok').length;
        const cnt = s => uq.filter(u => u.status === s).length, miss = uq.filter(u => u.status === 'unreg' || u.status === 'noexpr').length;
        const fill = rsUnique(rsFilter(all)).filter(u => u.status === 'unreg' || u.status === 'noexpr').length;
        top.replaceChildren(
          h('div', { class: 'rs-prog' },
            h('div', { class: 'rs-pt' }, h('b', {}, uq.length ? (ready === uq.length ? t('rs.prog.all') : t('rs.prog', ready, uq.length)) : t('rs.prog', 0, 0)), h('span', { class: 'bs-sub' }, ' ' + (uq.length ? Math.round(ready / uq.length * 100) + '%' : ''))),
            h('div', { class: 'bs-bar' }, h('i', { class: 'a', style: { left: '0', width: (uq.length ? ready / uq.length * 100 : 0) + '%' } })),
            h('div', { class: 'bs-sub' }, [cnt('nofile') ? t('rs.st.nofile') + ': ' + cnt('nofile') : '', miss ? t('rs.st.unreg') + ': ' + cnt('unreg') + (cnt('noexpr') ? ' + ' + cnt('noexpr') + ' ' + t('rs.st.noexpr').toLowerCase() : '') : ''].filter(Boolean).join(' · ') || t('rs.prog.h'))),
          h('div', { class: 'rs-acts' },
            h('button', { class: 'btn sm', 'data-tip': t('rs.a.fill.t'), disabled: fill ? null : 'true', onclick: () => { const [na, ne] = rsFillRegistry(rsFilter(rsItems())); toast(t('rs.a.fill.done', na, ne), 3600); paint(); } }, icon('zap', 14), t('rs.a.fill') + (fill ? ' (' + fill + ')' : '')),
            h('button', { class: 'btn sm', 'data-tip': t('rs.a.copy.t'), onclick: async () => { const list = rsFilter(rsItems()); const ok = await copyText(rsChecklist(list, rsItems())); toast(ok ? t('rs.a.copied', t('rs.items', rsUnique(list).length)) : t('rs.a.copyfail'), 3200); } }, icon('copy', 14), t('rs.a.copy')),
            h('button', { class: 'btn sm', 'data-tip': t('rs.a.exp.t'), onclick: () => rsExportCsv(rsFilter(rsItems())) }, icon('download', 14), t('rs.a.csv')),
            h('button', { class: 'btn sm', 'data-tip': t('rs.a.exp.t'), onclick: () => rsExportXlsx(rsFilter(rsItems())) }, icon('download', 14), t('rs.a.xlsx'))));
      };
      const paintCtl = (all, nodesWith) => {
        const scopeItems = all.filter(it => !RS_ST.scope || it.n.id === RS_ST.scope);
        const sel = h('select', { class: 'inp', id: 'rs-scope', 'aria-label': t('rs.scope') }, h('option', { value: '' }, t('rs.scope.all')), ...nodesWith.map(n => h('option', { value: n.id }, rsTitle(n))));
        sel.value = RS_ST.scope; sel.addEventListener('change', () => { RS_ST.scope = sel.value; RS_ST.more = 40; paint(); });
        const kc = k => scopeItems.filter(it => k === 'all' || it.kind === k).length;
        const sc = s => scopeItems.filter(it => (RS_ST.kind === 'all' || it.kind === RS_ST.kind) && (s === 'all' || (s === 'todo' ? RS_BAD.has(it.status) : s === 'unreg' ? it.status === 'unreg' || it.status === 'noexpr' : it.status === 'ok'))).length;
        const pc = s => scopeItems.filter(it => (RS_ST.kind === 'all' || it.kind === RS_ST.kind) && prodMatch(it.a, s)).length;
        const chip = (cur, v, label, c, set) => h('button', { class: 'pal-chip' + (cur === v ? ' on' : ''), onclick: () => { set(v); RS_ST.more = 40; paint(); } }, label, h('span', { class: 'cnt' }, ' ' + c));
        ctl.replaceChildren(
          h('div', { class: 'rs-row1' }, h('span', { class: 'lab' }, t('rs.scope')), sel, h('div', { class: 'grow' }), h('span', { class: 'lab' }, t('rs.group')),
            segmented([['block', 'rs.g.block'], ['res', 'rs.g.res']].map(([v, k]) => ({ value: v, label: t(k) })), RS_ST.group, v => { RS_ST.group = v; RS_ST.more = 40; paint(); })),
          h('div', { class: 'pal-chips' }, chip(RS_ST.kind, 'all', t('rs.k.all'), kc('all'), v => { RS_ST.kind = v; }), ...RS_KINDS.map(k => chip(RS_ST.kind, k, t('kind.' + k), kc(k), v => { RS_ST.kind = v; }))),
          h('div', { class: 'pal-chips' }, ...[['all', 'rs.s.all'], ['todo', 'rs.s.todo'], ['unreg', 'rs.s.unreg'], ['ok', 'rs.s.ok']].map(([s, k]) => chip(RS_ST.stat, s, t(k), sc(s), v => { RS_ST.stat = v; }))),
          h('div', { class: 'pal-chips pd-chips' }, h('span', { class: 'lab' }, t('pd.f.lab')), ...[['all', 'pd.st.any'], ['none', 'pd.st.none'], ['ordered', 'pd.st.ordered'], ['work', 'pd.st.work'], ['got', 'pd.st.got'], ['done', 'pd.st.done'], ['over', 'pd.st.over']].map(([s, k]) => chip(RS_ST.prod, s, t(k), pc(s), v => { RS_ST.prod = v; }))));
        return scopeItems;
      };

      /* по блокам */
      const viewBlocks = list => {
        const root = h('div', { class: 'rs-list' }), byNode = new Map();
        for (const it of list) { if (!byNode.has(it.n)) byNode.set(it.n, []); byNode.get(it.n).push(it); }
        const nodes = [...byNode.keys()]; let shown = 0;
        for (const n of nodes) {
          if (shown >= RS_ST.more) break;
          const its = byNode.get(n), uq = rsUnique(its), ready = uq.filter(u => u.status === 'ok').length;
          root.append(h('div', { class: 'rs-nh' }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), h('b', { class: 't' }, rsTitle(n)),
            h('span', { class: 'bs-sub' }, t('rs.blk.cnt', ready, uq.length)), h('div', { class: 'grow' }),
            h('button', { class: 'btn icon sm', 'data-tip': t('rs.show'), onclick: () => { close(); focusNode(n.id); } }, icon('target', 15)),
            h('button', { class: 'btn icon sm', 'data-tip': t('rs.blk'), onclick: () => { close(); openNodeModal(n.id); } }, icon('open', 15))));
          let curF = null;
          for (const it of its) {
            shown++;
            if (it.f !== curF) {
              curF = it.f; const ft = rsFileTitle(n, it.f), vis = String(it.f.visual || '').trim();
              if (ft || vis) root.append(h('div', { class: 'rs-fh' }, ft ? h('b', {}, ft) : null, vis ? h('span', { class: 'rs-vis', 'data-tip': vis }, (ft ? ' · ' : '') + cpTrim(vis, 170)) : null));
            }
            const u = { ...it };
            root.append(h('div', { class: 'rs-r' }, icon(KIND_ICON[it.kind], 15),
              h('div', { class: 'rs-n' }, h('span', { class: 'nm' }, it.name), it.expr ? h('span', { class: 'expr' }, ' ' + it.expr) : null, h('span', { class: 'rs-via' }, rsVia(it)), it.note ? h('span', { class: 'rs-note' }, it.note) : null, prodLine(u, paint)),
              stTag(it.status), h('div', { class: 'rs-ac' }, ...actFor(u))));
          }
        }
        if (nodes.length && shown < list.length) root.append(h('div', { class: 'bs-more' }, h('button', { class: 'btn sm', onclick: () => { RS_ST.more += 40; paint(); } }, t('rs.more'))));
        return root;
      };
      /* по ресурсам */
      const viewRes = list => {
        const root = h('div', { class: 'rs-list' }), uq = rsUnique(list).sort((a, b) => RS_KINDS.indexOf(a.kind) - RS_KINDS.indexOf(b.kind) || a.name.localeCompare(b.name) || a.expr.localeCompare(b.expr));
        let lastKind = '';
        for (const u of uq.slice(0, RS_ST.more)) {
          if (u.kind !== lastKind) { lastKind = u.kind; root.append(h('div', { class: 'rs-nh' }, icon(KIND_ICON[u.kind], 15), h('b', { class: 't' }, t('kind.' + u.kind)), h('span', { class: 'bs-sub' }, t('rs.items', uq.filter(x => x.kind === u.kind).length)))); }
          const nodes = [...new Map(u.uses.map(x => [x.n.id, x.n])).values()];
          root.append(h('div', { class: 'rs-r rs-r2' }, icon(KIND_ICON[u.kind], 15),
            h('div', { class: 'rs-n' }, h('span', { class: 'nm' }, u.name), u.expr ? h('span', { class: 'expr' }, ' ' + u.expr) : null,
              h('div', { class: 'vs-names rs-where' }, ...nodes.slice(0, 5).map(n => h('button', { class: 'vs-name', 'data-tip': t('rs.show'), onclick: () => { close(); focusNode(n.id); } }, h('span', { class: 'bs-dot', style: { background: palColor(n.color) } }), rsTitle(n))), nodes.length > 5 ? h('span', { class: 'bs-sub' }, '… +' + (nodes.length - 5)) : null), prodLine(u, paint)),
            stTag(u.status), h('div', { class: 'rs-ac' }, ...actFor(u))));
        }
        if (uq.length > RS_ST.more) root.append(h('div', { class: 'bs-more' }, h('button', { class: 'btn sm', onclick: () => { RS_ST.more += 40; paint(); } }, t('rs.more') + ' (' + (uq.length - RS_ST.more) + ')')));
        return root;
      };

      const paint = () => {
        seenVer = DATA_VER;
        const keep = body.scrollTop; body.replaceChildren();
        if (!P.nodes.some(n => n.type !== 'note')) { top.replaceChildren(); ctl.replaceChildren(); body.append(h('div', { class: 'empty' }, t('rs.empty'))); return; }
        const all = rsItems(), nodesWith = rsNodes().filter(n => all.some(it => it.n === n) || n.id === RS_ST.scope);
        if (RS_ST.scope && !P.nodes.some(n => n.id === RS_ST.scope)) RS_ST.scope = '';
        if (!all.length) { top.replaceChildren(); ctl.replaceChildren(); body.append(h('div', { class: 'empty' }, t('rs.none'))); return; }
        const scopeItems = paintCtl(all, nodesWith);
        paintTop(all, scopeItems);
        const list = rsFilter(all);
        body.append(list.length ? (RS_ST.group === 'res' ? viewRes(list) : viewBlocks(list)) : h('div', { class: 'empty' }, t('rs.nofilter')), h('div', { class: 'bs-foot' }, t('rs.foot')));
        body.scrollTop = keep;
      };
      timer = setInterval(() => { if (m.closed) { clearInterval(timer); return; } if (DATA_VER !== seenVer && !document.activeElement?.matches?.('#rs-scope')) paint(); }, 1200);
      paint();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('rs.title'), m), top, ctl, body);
    }
  });
}
TOOL_ITEMS.push({ id: 'resources', group: 'story', ic: 'box', key: 'rs.btn', kw: 'resources assets backgrounds sprites music sounds checklist artist composer todo ресурсы ассеты фоны спрайты музыка звуки чек-лист художник композитор список', run: () => openResources({ nodeId: '' }) });

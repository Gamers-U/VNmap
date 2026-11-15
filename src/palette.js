'use strict';
/* ====== Поиск по всему проекту и палитра команд (Ctrl+K) ======
   Одна строка ищет блоки, главы, реплики, персонажей, флаги, ресурсы, заметки и команды программы.
   Фильтры-вкладки под строкой сужают поиск; префиксы: «>» только команды, «@» персонажи, «#» флаги и переменные.
   Пустая строка показывает команды: так можно найти любую функцию, не вспоминая, в каком она меню. */

Object.assign(D, {
  'pal.ph': ['Что найти или сделать? Блок, реплика, персонаж, флаг, команда…', 'Find or do something: block, line, character, flag, command…'],
  'pal.k.all': ['Всё', 'All'], 'pal.k.cmd': ['Команды', 'Commands'], 'pal.k.node': ['Блоки и главы', 'Blocks and chapters'], 'pal.k.line': ['Реплики', 'Lines'],
  'pal.k.char': ['Персонажи', 'Characters'], 'pal.k.var': ['Флаги', 'Flags'], 'pal.k.asset': ['Ресурсы', 'Assets'], 'pal.k.note': ['Заметки', 'Notes'],
  't.cmd': ['команда', 'command'], 't.node': ['блок', 'block'], 't.file': ['глава', 'chapter'], 't.line': ['реплика', 'line'], 't.char': ['персонаж', 'character'],
  't.var': ['флаг', 'flag'], 't.asset': ['ресурс', 'asset'], 't.note': ['заметка', 'note'], 't.edge': ['стрелка', 'arrow'], 't.label': ['метка', 'label'],
  'pal.empty': ['Ничего не найдено. Попробуйте другое слово или вкладку «Всё».', 'Nothing found. Try another word or the “All” tab.'],
  'pal.hint.kind': ['Введите слово: поиск идёт только в этой вкладке.', 'Type a word: only this tab is searched.'],
  'pal.cmds': ['Что можно сделать', 'What you can do'],
  'pal.nav': ['выбор', 'select'], 'pal.go': ['перейти', 'go'], 'pal.open': ['открыть', 'open'], 'pal.tab': ['вкладка', 'tab'],
  'pal.prefix': ['> команды  @ персонажи  # флаги', '> commands  @ characters  # flags'],
  'pal.add': ['Добавить: {0}', 'Add: {0}'], 'pal.reg': ['Реестр: {0}', 'Registry: {0}'], 'pal.lang': ['Сменить язык интерфейса', 'Switch interface language'],
  'pal.layer.echo': ['Показать или скрыть «эхо» флагов', 'Show or hide flag echoes'], 'pal.layer.jumps': ['Показать или скрыть стрелки из кода', 'Show or hide arrows from code'],
  'pal.uses': ['используется в блоках: {0}', 'used in blocks: {0}'], 'pal.speaks': ['реплик: {0}', 'lines: {0}'], 'pal.nouse': ['нигде не используется', 'not used anywhere'],
});

/* ---------- общие действия ---------- */
function addNodeAtCenter(tp) {
  const r = stage.getBoundingClientRect(), w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  const sp = freeSpot(snapTo(w.x - NODE_W / 2, GRID), snapTo(w.y - 60, GRID));
  const n = addNode(tp, sp.x, sp.y); commit(true); renderAll(); setSel([n.id]);
  return n;
}
function palRegGo(tab, rid) {
  openRegistry(tab);
  setTimeout(() => {
    const el = document.querySelector('.reg-card[data-rid="' + rid + '"]'); if (!el) return;
    el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600);
  }, 140);
}
function palOpenLine(nid, fid, li, lead) {
  NM_TAB = 'script'; openNodeModal(nid, fid);
  setTimeout(() => {
    const ta = $('#code-ta'), ff = findFile(fid); if (!ta || !ff) return;
    const raw = String(ff.file.script || '').replace(/\r\n?/g, '\n').split('\n'), k = Math.min(li + lead, raw.length - 1);
    let pos = 0; for (let i = 0; i < k; i++) pos += raw[i].length + 1;
    ta.focus(); ta.setSelectionRange(pos, pos + (raw[k] || '').length);
    ta.scrollTop = Math.max(0, k - 3) * (parseFloat(getComputedStyle(ta).lineHeight) || 20);
  }, 130);
}
const REG_TAB_OF = { bg: 'bg', sprite: 'sprite', music: 'audio', sfx: 'audio', voice: 'audio', fx: 'fx', tf: 'tf', font: 'font' };

/* ---------- команды ---------- */
function palCommands() {
  const L = [], anchor = () => document.querySelector('.tools-btn');
  const add = (title, ic, run, kw, kbd) => L.push({ title, ic, run, kw: (kw || '') + ' ' + title, kbd });
  for (const x of TOOL_ITEMS) add(t(x.key), x.ic, () => x.run(anchor()), x.kw || '', x.kbd);
  for (const tp of NODE_TYPES) add(t('pal.add', t('type.' + tp)), TYPE_ICON[tp], () => addNodeAtCenter(tp), 'add new block создать добавить блок ' + t('type.' + tp));
  add(t('c.fit'), 'fit', () => fitAll(), 'fit zoom map показать всю карту масштаб', 'F');
  for (const tb of REG_TABS) add(t('pal.reg', t('reg.tab.' + tb.id)), tb.icon, () => openRegistry(tb.id), 'registry реестр ' + tb.id);
  add(t('top.stats'), 'chart', () => openStats(), 'stats endings progress статистика концовки прогресс');
  add(t('team.btn'), 'badge', () => openTeamMenu(BTN.team || anchor()), 'team members команда участники роли');
  add(t('tl.btn'), 'globe', () => openTranslate(), 'translate перевод язык');
  add(t('exp.build'), 'box', () => openBuild(), 'build export renpy собрать игру экспорт', DESK ? 'Ctrl+B' : undefined);
  add(t('exp.svg.dark'), 'image', () => exportSVG('dark'), 'svg image картинка карта');
  add(t('exp.svg.light'), 'image', () => exportSVG('light'), 'svg image картинка карта');
  add(t('exp.map'), 'rows', () => exportMap(), 'markdown map описание карты');
  add(DESK ? t('desk.save') : t('exp.json'), 'save', () => { if (DESK) deskCommand('save'); else exportJSON(); }, 'save сохранить проект резервная копия', 'Ctrl+S');
  add(t('gh.menu'), 'fork', () => openGhPanel(), 'github гитхаб репозиторий');
  add(t('gho.menu'), 'fork', () => openFromGithub(), 'github open link repository открыть ссылка репозиторий новелла');
  if (DESK) add(t('drive.menu'), 'cloud', () => openDrivePanel(), 'drive google диск облако');
  add(t('top.help'), 'help', () => openHelp(), 'help справка помощь', '?');
  add(t('top.theme'), S.theme === 'dark' ? 'sun' : 'moon', () => toggleTheme(), 'theme dark light тема тёмная светлая');
  add(t('pal.lang'), 'globe', () => setLang(S.lang === 'ru' ? 'en' : 'ru'), 'language язык english русский');
  add(t('pal.layer.echo'), 'flag', () => { if (BTN.echo) BTN.echo.click(); }, 'echo flags эхо флаги слой');
  add(t('pal.layer.jumps'), 'link', () => { if (BTN.jumps) BTN.jumps.click(); }, 'jumps code arrows переходы код слой');
  return L;
}

/* ---------- поиск ---------- */
let SEARCH = null, PAL_L = null;
const palToks = q => String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
const palHas = (hay, toks) => { const x = String(hay || '').toLowerCase(); return toks.every(k => x.includes(k)); };
const PAL_GROUP = { cmd: 'cmd', node: 'node', file: 'node', edge: 'node', line: 'line', char: 'char', var: 'var', asset: 'asset', note: 'note' };
const PAL_RANK = { cmd: 0, char: 1, var: 2, node: 3, file: 4, asset: 5, note: 6, line: 7, edge: 8 };
const PAL_ICON_COLOR = { cmd: null, line: 'cyan', char: 'pink', var: 'orange', asset: 'green', note: 'yellow' };
const palClean = s => String(s || '').replace(/\\(["'])/g, '$1').replace(/\\n/g, ' ').replace(/\{[^{}]*\}/g, '');
function palLines() {
  if (PAL_L && PAL_L.ver === DATA_VER && PAL_L.n === P.nodes.length) return PAL_L.rows;
  const rows = [];
  for (const n of P.nodes) for (const f of n.files) {
    if (!String(f.script || '').trim()) continue;
    const raw = String(f.script).replace(/\r\n?/g, '\n').split('\n'); let lead = 0; while (lead < raw.length && !raw[lead].trim()) lead++;
    for (const u of tlScan(tlLines(f))) rows.push({ n, f, li: u.li, lead, who: u.who, body: palClean(u.body) });
  }
  PAL_L = { ver: DATA_VER, n: P.nodes.length, rows };
  return rows;
}
function palSearch(raw) {
  let q = raw.trim(), only = null;
  if (q[0] === '>') { only = 'cmd'; q = q.slice(1).trim(); } else if (q[0] === '@') { only = 'char'; q = q.slice(1).trim(); } else if (q[0] === '#') { only = 'var'; q = q.slice(1).trim(); }
  const toks = palToks(q), res = [], low = q.toLowerCase();
  const want = k => !only || only === k;
  const nodeCrumb = n => n.title;
  /* команды */
  if (want('cmd')) {
    const cmds = palCommands();
    for (const c of cmds) {
      if (!toks.length) { res.push({ kind: 'cmd', score: 2, ic: 'zap', title: c.title, kbd: c.kbd, run: c.run }); continue; }
      const tt = c.title.toLowerCase();
      if (palHas(tt + ' ' + c.kw, toks)) res.push({ kind: 'cmd', score: tt.startsWith(toks[0]) ? 0 : 1, ic: c.ic, title: c.title, kbd: c.kbd, run: c.run });
    }
  }
  if (!toks.length && !only) return { items: res, q, toks, only };
  /* реплики (раньше глав, чтобы не дублировать находки в скрипте) */
  const lineFiles = new Set();
  if (want('line') && !only && low.length >= 2) {
    let cnt = 0;
    for (const r of palLines()) {
      const ch = r.who && P.characters.find(c => c.tag === r.who), who = ch ? (ch.name || ch.tag) : r.who;
      if (!palHas(who + ' ' + r.who + ' ' + r.body, toks)) continue;
      lineFiles.add(r.f.id);
      if (++cnt > 60) break;
      res.push({ kind: 'line', score: r.body.toLowerCase().includes(low) ? 3 : 5, ic: 'chat', title: r.body, crumb: (who ? who + ' · ' : '') + r.n.title, tag: r.f.title || '', nodes: [r.n.id],
        run: () => { focusNode(r.n.id); }, runOpen: () => palOpenLine(r.n.id, r.f.id, r.li, r.lead) });
    }
  }
  /* блоки, главы, стрелки */
  if (want('node') || want('note')) {
    for (const n of P.nodes) {
      const isCard = n.type === 'note';
      if (!want(isCard ? 'note' : 'node')) continue;
      const tHit = palHas(n.title, toks);
      if (tHit || palHas(n.desc, toks)) res.push({ kind: isCard ? 'note' : 'node', score: tHit ? 0 : 3, ic: TYPE_ICON[n.type], color: n.color, title: n.title, crumb: isCard ? t('cm.card') : t('t.node'), tag: isCard && n.done ? t('cm.done') : '', snip: tHit ? '' : snippetOf(n.desc, toks[0]), nodes: [n.id], run: () => focusNode(n.id), runOpen: () => { focusNode(n.id); openNodeModal(n.id); } });
      for (const f of n.files) {
        const labels = (String(f.script || '').match(/^\s*label\s+[A-Za-z_]\w*/gm) || []).map(x => x.replace(/^\s*label\s+/, ''));
        const hay = (f.title + ' ' + f.filename + ' ' + f.label + ' ' + labels.join(' ')).toLowerCase();
        let score = null, snip = '', tag = '';
        if (palHas(hay, toks)) { score = 1; if (labels.some(l => palHas(l, toks)) && !palHas(f.title, toks)) tag = t('t.label'); }
        else if (palHas(f.summary, toks)) { score = 3; snip = snippetOf(f.summary, toks[0]); tag = t('search.in.summary'); }
        else if (palHas(f.location + ' ' + f.notes + ' ' + f.visual, toks)) { score = 4; snip = snippetOf(f.location + ' ' + f.notes + ' ' + f.visual, toks[0]); tag = t('search.in.notes'); }
        else if (!lineFiles.has(f.id) && f.script.toLowerCase().includes(low)) { score = 4; snip = snippetOf(f.script, low); tag = t('search.in.script'); }
        else {
          const cm = effectiveCast(n, f).all.map(charById).filter(Boolean).find(c => palHas(c.name + ' ' + c.tag, toks));
          if (cm) { score = 3; snip = t('search.in.cast', cm.name || cm.tag); }
        }
        if (score != null) res.push({ kind: 'file', score, ic: 'file', color: n.color, title: f.title || t('file.untitled'), crumb: n.title, tag, snip, nodes: [n.id], run: () => focusNode(n.id), runOpen: () => { focusNode(n.id); openNodeModal(n.id, f.id); } });
      }
    }
    for (const e of P.edges) if (palHas(e.title + ' ' + e.desc, toks)) res.push({ kind: 'edge', score: 2, ic: 'link', color: e.color, title: e.title || t('edge.untitled'), crumb: (nodeById(e.from) || {}).title + ' → ' + (nodeById(e.to) || {}).title, snip: snippetOf(e.title + ' — ' + e.desc, toks[0]),
      nodes: [e.from, e.to], run: () => { const G = edgeGeom(e); if (G) centerOn(G.mid[0], G.mid[1], Math.max(P.view.k, 0.85)); setSel([], e.id); }, runOpen: () => { setSel([], e.id); openEdgeModal(e.id); } });
  }
  /* персонажи */
  if (want('char')) {
    const sp = anSpeech();
    for (const c of P.characters) if (palHas(c.name + ' ' + c.tag + ' ' + c.aliases + ' ' + c.gameName, toks)) {
      const r = sp.get(c.tag);
      res.push({ kind: 'char', score: palHas(c.name + ' ' + c.tag, toks) ? 0 : 2, ic: 'user', color: c.color, title: c.name || c.tag, crumb: c.tag, snip: r ? t('pal.speaks', r.lines) : '', run: () => openCharPage(c.id), runOpen: () => palRegGo('chars', c.id) });
    }
  }
  /* флаги и переменные */
  if (want('var')) {
    const FA = flagAnalysis();
    for (const v of P.vars) if (palHas(v.name + ' ' + v.notes + ' ' + (v.values || []).join(' '), toks)) {
      const r = FA.names.get(v.name), ids = r ? [...new Set([...r.sNodes, ...r.uNodes])] : [];
      res.push({ kind: 'var', score: palHas(v.name, toks) ? 0 : 2, ic: VAR_TYPE_ICON[v.type] || 'flag', title: v.name, crumb: v.value, snip: ids.length ? t('pal.uses', ids.length) : t('pal.nouse'), nodes: ids,
        run: () => { if (ids.length) { const bb = nodesBBox(ids.map(nodeById).filter(Boolean)); if (bb) centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, Math.min(P.view.k, 0.8)); } }, runOpen: () => palRegGo('vars', v.id) });
    }
  }
  /* ресурсы */
  if (want('asset')) {
    for (const a of P.assets) if (a.kind !== 'fx' && palHas(a.name + ' ' + a.path + ' ' + (a.expr || []).join(' '), toks)) res.push({ kind: 'asset', score: palHas(a.name, toks) ? 1 : 3, ic: KIND_ICON[a.kind] || 'box', title: a.name || a.path, crumb: t('kind1.' + a.kind), snip: (a.expr || []).slice(0, 5).join(', '), run: () => palRegGo(REG_TAB_OF[a.kind] || 'bg', a.id) });
  }
  /* заметки-стикеры */
  if (want('note')) {
    for (const c of P.cmts || []) { const n = nodeById(c.nid); if (n && palHas(c.text + ' ' + c.by, toks)) res.push({ kind: 'note', score: 2, ic: 'sticker', title: c.text, crumb: n.title + (c.by ? ' · ' + c.by : ''), tag: c.done ? t('cm.done') : '', nodes: [n.id],
      run: () => { focusNode(n.id); setTimeout(() => { const el = NODE_EL.get(n.id); if (el) openCmPopover(el, n.id, c.fid); }, 450); } }); }
  }
  void nodeCrumb;
  return { items: res, q, toks, only };
}
function palSort(items) { return items.slice().sort((a, b) => a.score - b.score || PAL_RANK[a.kind] - PAL_RANK[b.kind]); }

function openSearch(initial) {
  if (SEARCH && !SEARCH.m.closed) { const i = $('#search-q'); if (i) i.focus(); return; }
  closePopover();
  const st = { sel: 0, items: [], all: [], q: '', kind: 'all', counts: {} };
  SEARCH = st;
  st.m = openModal({
    cls: 'search-m', onClose: () => { if (SEARCH === st) SEARCH = null; applyHits(null); },
    build: m => {
      st.m = m;
      const q = h('input', { class: 'search-input', id: 'search-q', type: 'text', placeholder: t('pal.ph'), autocomplete: 'off', spellcheck: 'false' });
      const chips = h('div', { class: 'pal-chips' }), list = h('div', { class: 'search-list' });
      const KINDS = ['all', 'cmd', 'node', 'line', 'char', 'var', 'asset', 'note'];
      const act = (it, open) => { m.close(); const fn = open && it.runOpen ? it.runOpen : it.run; setTimeout(fn, 0); };
      const renderChips = () => {
        chips.replaceChildren(...KINDS.map(k => h('button', { class: 'pal-chip' + (st.kind === k ? ' on' : ''), onclick: () => { st.kind = k; apply(); q.focus(); } },
          t('pal.k.' + k), k !== 'all' && st.counts[k] ? h('span', { class: 'pal-n' }, String(st.counts[k])) : null)));
      };
      const render = () => {
        list.replaceChildren();
        const hl = (st.toks && st.toks[0]) || '';
        if (!st.q.trim() && st.kind !== 'all' && st.kind !== 'cmd') { list.append(h('div', { class: 'empty small' }, t('pal.hint.kind'))); return; }
        if (!st.items.length) { list.append(h('div', { class: 'empty small' }, t('pal.empty'))); return; }
        if (!st.toks.length) list.append(h('div', { class: 'sr-head' }, t('pal.cmds')));
        st.items.forEach((it, i) => {
          const col = it.color ? palColor(it.color) : PAL_ICON_COLOR[it.kind] ? palColor(PAL_ICON_COLOR[it.kind]) : null;
          list.append(h('div', { class: 'sr' + (i === st.sel ? ' on' : ''), onclick: () => act(it, false), onmouseenter: () => { st.sel = i; list.querySelectorAll('.sr').forEach((x, j) => x.classList.toggle('on', j === i)); } },
            h('span', { class: 'sr-ic', style: { background: col || 'var(--surface3)', color: col ? onColor(col) : 'var(--text2)' } }, icon(it.ic || 'search', 15)),
            h('div', { class: 'sr-t' }, h('div', { class: 'sr-n' }, markText(it.title, hl)),
              h('div', { class: 'sr-s' }, it.crumb ? h('span', { class: 'sr-crumb' }, it.crumb) : null, (it.kind === 'cmd' && !st.toks.length ? null : h('span', { class: 'sr-tag kind-' + it.kind }, t('t.' + it.kind))), it.tag ? h('span', { class: 'sr-tag' }, it.tag) : null, it.snip ? h('span', { class: 'sr-snip' }, markText(it.snip, hl)) : null)),
            it.kbd ? h('kbd', { class: 'sr-kbd' }, it.kbd) : null,
            it.kind === 'cmd' ? null : h('div', { class: 'sr-act' },
              it.nodes && it.nodes.length ? h('button', { class: 'btn icon sm', 'data-tip': t('nm.show'), onclick: ev => { ev.stopPropagation(); act(it, false); } }, icon('target', 15)) : null,
              it.runOpen ? h('button', { class: 'btn icon sm', 'data-tip': t('tb.open'), onclick: ev => { ev.stopPropagation(); act(it, true); } }, icon('open', 15)) : null)));
        });
        const on = list.querySelector('.sr.on'); if (on) on.scrollIntoView({ block: 'nearest' });
      };
      const apply = () => {
        const r = palSearch(q.value); st.q = q.value; st.toks = r.toks; st.all = palSort(r.items);
        st.counts = {}; for (const it of st.all) { const g = PAL_GROUP[it.kind]; st.counts[g] = (st.counts[g] || 0) + 1; }
        const kind = r.only || st.kind;
        let items = kind === 'all' ? st.all : st.all.filter(it => PAL_GROUP[it.kind] === kind);
        if (!r.toks.length && kind === 'all') items = items.filter(it => it.kind === 'cmd').slice(0, 16);
        else if (kind === 'all') items = items.filter(it => it.kind !== 'cmd' || it.score <= 1).slice(0, 60);
        else items = items.slice(0, 60);
        st.items = items; st.sel = 0; renderChips(); render();
        if (!r.toks.length) applyHits(null);
        else { const ids = new Set(); items.forEach(it => (it.nodes || []).forEach(id => ids.add(id))); applyHits(ids.size ? ids : null); }
      };
      q.addEventListener('input', apply);
      q.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); const n = st.items.length; if (!n) return;
          st.sel = (st.sel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; render();
        } else if (e.key === 'Enter') { e.preventDefault(); const it = st.items[st.sel]; if (it) act(it, e.shiftKey); }
        else if (e.key === 'Tab') { e.preventDefault(); const i = KINDS.indexOf(st.kind); st.kind = KINDS[(i + (e.shiftKey ? -1 : 1) + KINDS.length) % KINDS.length]; apply(); }
      });
      if (typeof initial === 'string') q.value = initial;
      setTimeout(() => q.focus(), 30);
      apply();
      return h('div', { class: 'search-wrap' }, h('div', { class: 'search-bar' }, icon('search', 19), q, h('kbd', 'Esc')), chips, list,
        h('div', { class: 'search-foot' }, h('span', h('kbd', '↑↓'), ' ' + t('pal.nav')), h('span', h('kbd', '↵'), ' ' + t('pal.go')), h('span', h('kbd', '⇧↵'), ' ' + t('pal.open')), h('span', h('kbd', 'Tab'), ' ' + t('pal.tab')), h('span', { class: 'grow' }), h('span', { class: 'pal-pre' }, t('pal.prefix'))));
    }
  });
  st.m.el.classList.add('top');
}

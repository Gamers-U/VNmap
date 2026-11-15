'use strict';
/* ====== Окно «Перевод»: языки, таблица «оригинал — перевод», статусы, озвучка по языкам, CSV ====== */
let TLW = null;
const TL_PAGE = 40;
const TL_FILTERS = ['all', 'todo', 'draft', 'review', 'done', 'stale', 'warn'];

function openTranslate(langId) {
  if (TLW && !TLW.m.closed) { if (langId) TLW.lang = langId; TLW.page = 0; renderTl(); return TLW.m; }
  tlSync();
  const st = TLW = { lang: langId || (P.tl.langs[0] && P.tl.langs[0].id) || null, q: '', f: 'all', scope: 'all', page: 0, only: 'all', units: null };
  st.m = openModal({
    cls: 'node-m tl-m', onClose: () => { if (TLW === st) TLW = null; stopPreview(); flushHistory(); scheduleRender(); },
    build: m => { st.m = m; st.root = h('div', { class: 'm-wrap' }); renderTl(); if (typeof aclWatch === 'function') aclWatch(st.root, () => 'tr'); return st.root; }
  });
  return st.m;
}
function tlLang(st) { return langById(st.lang) || (st.lang = P.tl.langs[0] ? P.tl.langs[0].id : null, langById(st.lang)); }

function renderTl(keepScroll = true) {
  const st = TLW; if (!st) return;
  const L = tlLang(st);
  st.data = tlUnits(); st.units = st.data.list;
  const keep = st.body ? st.body.scrollTop : 0;
  st.head = h('div', { class: 'tl-head' });
  st.fixed = h('div', { class: 'tl-fixed' });
  st.body = h('div', { class: 'tl-body' });
  st.root.replaceChildren(modalHead(t('tl.title'), st.m), st.head, st.fixed, st.body);
  tlHead(st, L);
  if (!L) tlIntro(st); else tlTable(st, L);
  if (keepScroll) st.body.scrollTop = keep;
}

/* ---------- верх: языки ---------- */
function tlHead(st, L) {
  const chips = h('div', { class: 'tl-langs' });
  P.tl.langs.forEach(l => {
    const s = tlStats(l.id, st.units), pct = s.total ? Math.round(s.done * 100 / s.total) : 0;
    chips.append(h('button', { class: 'tl-lang' + (L && L.id === l.id ? ' on' : ''), onclick: () => { st.lang = l.id; st.page = 0; renderTl(false); } },
      h('span', { class: 'tl-ln' }, l.name), h('span', { class: 'tl-lp' }, pct + '%')));
  });
  chips.append(h('button', { class: 'tl-lang add', 'data-tip': t('tl.add.tip'), onclick: ev => tlAddMenu(ev.currentTarget, st) }, icon('plus', 14), t('tl.add')));
  st.head.append(chips, h('div', { class: 'grow' }));
  if (L) st.head.append(
    h('button', { class: 'btn sm', onclick: () => tlSettings(st, L) }, icon('sliders', 14), t('tl.settings')),
    h('button', { class: 'btn sm', onclick: ev => tlMore(ev.currentTarget, st, L) }, icon('list', 14), t('c.more')));
}
function tlAddMenu(anchor, st) {
  const have = new Set(P.tl.langs.map(l => l.code));
  const items = TL_PRESETS.filter(([c]) => !have.has(c)).map(([c, n]) => ({ label: n + '  ·  ' + c, onClick: () => { const l = tlAddLang(c, n); st.lang = l.id; st.page = 0; renderTl(false); } }));
  items.push({ sep: true }, { label: t('tl.add.custom'), icon: 'plus', onClick: () => tlCustomLang(st) });
  menuAt(anchor, items);
}
async function tlCustomLang(st) {
  const name = await promptDlg({ title: t('tl.custom.t'), label: t('tl.custom.name'), ok: t('c.create') });
  if (!name) return;
  const code = await promptDlg({ title: t('tl.custom.t'), label: t('tl.custom.code'), value: tlCleanCode(slug(name)), ok: t('c.create') });
  if (!code) return;
  const l = tlAddLang(code, name); st.lang = l.id; st.page = 0; renderTl(false);
}
function tlIntro(st) {
  const box = h('div', { class: 'tl-intro' },
    h('div', { class: 'tl-i-t' }, icon('globe', 22), h('b', t('tl.intro.t'))),
    h('p', { class: 'gd-p' }, t('tl.intro.p1')), h('p', { class: 'gd-p' }, t('tl.intro.p2')),
    field(t('tl.base'), (() => { const i = h('input', { class: 'inp', type: 'text', value: P.tl.base || '', placeholder: t('tl.base.default') }); i.addEventListener('input', () => { P.tl.base = i.value.slice(0, 40); commit(); }); return i; })(), t('tl.base.h')),
    h('div', { class: 'lbl', style: { marginTop: '10px' } }, t('tl.intro.pick')),
    h('div', { class: 'chips' }, ...TL_PRESETS.slice(0, 12).map(([c, n]) => h('button', { class: 'chip', onclick: () => { const l = tlAddLang(c, n); st.lang = l.id; renderTl(false); } }, n)),
      h('button', { class: 'chip add', onclick: () => tlCustomLang(st) }, icon('plus', 13), t('tl.add.custom'))));
  st.body.append(box);
}

/* ---------- настройки языка ---------- */
function tlSettings(st, L) {
  openModal({
    cls: 'dlg wide', build: m => {
      const nameI = bindInput(L, 'name', { onChange: () => commit() });
      const codeI = h('input', { class: 'inp mono', type: 'text', value: L.code, spellcheck: 'false' });
      codeI.addEventListener('change', () => {
        let c = tlCleanCode(codeI.value); if (!c || TL_BAD_CODES.has(c) || P.tl.langs.some(x => x !== L && x.code === c)) { codeI.value = L.code; toast(t('tl.code.bad'), 3600); return; }
        L.code = c; codeI.value = c; commit(true);
      });
      const baseI = h('input', { class: 'inp', type: 'text', value: P.tl.base || '', placeholder: t('tl.base.default') });
      baseI.addEventListener('input', () => { P.tl.base = baseI.value.slice(0, 40); commit(); });
      return h('div', { class: 'dlg-body' }, h('h3', t('tl.set.t', L.name)),
        h('div', { class: 'grid2' }, field(t('tl.set.name'), nameI, t('tl.set.name.h')), field(t('tl.set.code'), codeI, t('tl.set.code.h'))),
        field(t('tl.base'), baseI, t('tl.base.h')),
        field(t('tl.set.owners'), memberPicker(L, 'owners', () => commit(true)), t('tl.set.owners.h')),
        h('div', { class: 'dlg-actions' },
          h('button', { class: 'btn danger-t', onclick: async () => {
            const n = Object.keys(tlRecs(L.id)).length;
            if (n && !(await confirmDlg({ title: t('tl.del.q', L.name), text: t('tl.del.t', n), ok: t('c.delete'), danger: true }))) return;
            tlRemoveLang(L.id); m.close(); st.lang = P.tl.langs[0] ? P.tl.langs[0].id : null; renderTl(false);
          } }, icon('trash', 15), t('tl.del')),
          h('div', { class: 'grow' }),
          h('button', { class: 'btn primary', onclick: () => { m.close(); renderTl(false); } }, t('c.close'))));
    }
  });
}

/* ---------- таблица ---------- */
function tlFiltered(st, L) {
  const rs = tlRecs(L.id), qq = st.q.trim().toLowerCase();
  return st.units.filter(u => {
    if (st.only === 'say' && u.kind !== 'say') return false;
    if (st.only === 'str' && u.kind !== 'str') return false;
    if (st.scope !== 'all' && u.nodeId !== st.scope) return false;
    const r = rs[u.key], has = !!(r && r.t.trim());
    if (st.f === 'todo' && has) return false;
    if (st.f === 'draft' && !(has && (r.s || 'draft') === 'draft')) return false;
    if (st.f === 'review' && !(has && r.s === 'review')) return false;
    if (st.f === 'done' && !(has && r.s === 'done')) return false;
    if (st.f === 'stale' && !tlStale(r, u)) return false;
    if (st.f === 'warn' && !(has && tlWarns(u.src, r.t).length)) return false;
    if (qq && !((u.src + ' ' + (r ? r.t : '') + ' ' + u.who + ' ' + u.group).toLowerCase().includes(qq))) return false;
    return true;
  });
}
function tlTable(st, L) {
  const stats = tlStats(L.id, st.units);
  const sum = h('div', { class: 'tl-sum' });
  const bar = h('div', { class: 'tl-bar' },
    h('span', { class: 'b-done', style: { width: (stats.total ? stats.done * 100 / stats.total : 0) + '%' } }),
    h('span', { class: 'b-rev', style: { width: (stats.total ? stats.review * 100 / stats.total : 0) + '%' } }),
    h('span', { class: 'b-dr', style: { width: (stats.total ? stats.draft * 100 / stats.total : 0) + '%' } }));
  sum.append(bar, h('div', { class: 'tl-sum-t' }, t('tl.sum', stats.done, stats.total, stats.say ? stats.voice : 0)));
  st.sumEl = sum;
  /* фильтры */
  const cnt = { all: stats.total, todo: stats.todo, draft: stats.draft, review: stats.review, done: stats.done, stale: stats.stale, warn: stats.warn };
  const fl = h('div', { class: 'tl-filters' });
  TL_FILTERS.forEach(k => fl.append(h('button', { class: 'chip' + (st.f === k ? ' on' : '') + (k === 'stale' || k === 'warn' ? ' warn' : ''), onclick: () => { st.f = k; st.page = 0; renderTl(false); } },
    t('tl.f.' + k), h('span', { class: 'chip-n' }, cnt[k]))));
  const q = h('input', { class: 'inp sm', type: 'search', placeholder: t('c.search'), value: st.q });
  q.addEventListener('input', debounce(() => { st.q = q.value; st.page = 0; tlRows(st, L); }, 160));
  const nodesWith = [...new Set(st.units.map(u => u.nodeId).filter(Boolean))].map(nodeById).filter(Boolean);
  const scope = h('select', { class: 'inp sm' }, h('option', { value: 'all' }, t('tl.scope.all')), ...nodesWith.map(n => h('option', { value: n.id }, n.title)));
  scope.value = st.scope; scope.addEventListener('change', () => { st.scope = scope.value; st.page = 0; tlRows(st, L); });
  const kind = h('select', { class: 'inp sm' }, h('option', { value: 'all' }, t('tl.kind.all')), h('option', { value: 'say' }, t('tl.kind.say')), h('option', { value: 'str' }, t('tl.kind.str')));
  kind.value = st.only; kind.addEventListener('change', () => { st.only = kind.value; st.page = 0; tlRows(st, L); });
  st.rowsEl = h('div', { class: 'tl-rows' });
  st.pagerEl = h('div', { class: 'tl-pager' });
  st.fixed.append(sum, h('div', { class: 'tl-tools' }, fl, h('div', { class: 'grow' }), scope, kind, q));
  st.body.append(st.rowsEl, st.pagerEl);
  tlRows(st, L);
}
function tlRefreshSum(st, L) {
  const stats = tlStats(L.id, st.units);
  const sp = st.sumEl && st.sumEl.querySelectorAll('.tl-bar span');
  if (sp && sp.length === 3) { const p = n => (stats.total ? n * 100 / stats.total : 0) + '%'; sp[0].style.width = p(stats.done); sp[1].style.width = p(stats.review); sp[2].style.width = p(stats.draft); }
  const tt = st.sumEl && st.sumEl.querySelector('.tl-sum-t'); if (tt) tt.textContent = t('tl.sum', stats.done, stats.total, stats.say ? stats.voice : 0);
  const chipN = [...document.querySelectorAll('.tl-filters .chip-n')];
  const cnt = [stats.total, stats.todo, stats.draft, stats.review, stats.done, stats.stale, stats.warn];
  chipN.forEach((el, i) => { el.textContent = cnt[i]; });
  const lp = [...document.querySelectorAll('.tl-lang')];
  P.tl.langs.forEach((l, i) => { if (lp[i]) { const s = tlStats(l.id, st.units); lp[i].querySelector('.tl-lp').textContent = (s.total ? Math.round(s.done * 100 / s.total) : 0) + '%'; } });
}
function tlRows(st, L) {
  st.list = tlFiltered(st, L);
  const pages = Math.max(1, Math.ceil(st.list.length / TL_PAGE));
  st.page = clamp(st.page, 0, pages - 1);
  const slice = st.list.slice(st.page * TL_PAGE, (st.page + 1) * TL_PAGE);
  st.rowsEl.replaceChildren();
  if (!slice.length) st.rowsEl.append(h('div', { class: 'empty' }, st.units.length ? t('tl.none.filter') : t('tl.none.units')));
  let g = null;
  slice.forEach(u => {
    if (u.group !== g) { g = u.group; st.rowsEl.append(h('div', { class: 'tl-grp' }, icon(u.kind === 'say' || u.sub === 'choice' ? 'file' : 'list', 14), g)); }
    st.rowsEl.append(tlRow(st, L, u));
  });
  st.pagerEl.replaceChildren(
    h('button', { class: 'btn sm', disabled: st.page <= 0, onclick: () => { st.page--; tlRows(st, L); st.body.scrollTop = 0; } }, icon('chevL', 14)),
    h('span', { class: 'hint' }, t('tl.page', st.page + 1, pages, st.list.length)),
    h('button', { class: 'btn sm', disabled: st.page >= pages - 1, onclick: () => { st.page++; tlRows(st, L); st.body.scrollTop = 0; } }, icon('chevR', 14)));
}
const tlSubLabel = u => u.sub === 'edge' ? t('tl.sub.edge') : u.sub === 'prompt' ? t('tl.sub.prompt') : u.sub === 'choice' ? t('tl.sub.choice') : u.sub === 'card' ? t('tl.sub.card')
  : u.sub === 'char' ? t('tl.sub.char') : u.sub === 'credits' ? t('tl.sub.credits') : u.sub === 'newgame' || u.sub === 'bonus' ? t('tl.sub.start') : u.sub === 'caption' ? t('tl.sub.caption') : '';
/** Подсветка тегов {i}, подстановок [имя] в исходнике. */
function tlSrcEl(text) {
  const box = h('div', { class: 'tl-src-t' });
  let last = 0; const re = new RegExp(TL_TOKEN_RE.source, 'gi'); let m;
  while ((m = re.exec(text))) { if (m.index > last) box.append(text.slice(last, m.index)); box.append(h('span', { class: 'tl-tok' }, m[0])); last = m.index + m[0].length; }
  if (last < text.length) box.append(text.slice(last));
  return box;
}
function tlRow(st, L, u) {
  const rs = tlRecs(L.id);
  const ch = u.who ? P.characters.find(c => c.tag === u.who) : null;
  const left = h('div', { class: 'tl-src' },
    ch ? h('div', { class: 'tl-who' }, h('span', { class: 'dot', style: { background: 'var(--c-' + ch.color + ')' } }), ch.name || ch.tag) : (u.who ? h('div', { class: 'tl-who' }, u.who) : (tlSubLabel(u) ? h('div', { class: 'tl-who sub' }, tlSubLabel(u)) : null)),
    tlSrcEl(u.src));
  const ta = h('textarea', { class: 'ta tl-ta', rows: 1, placeholder: t('tl.ph'), spellcheck: 'true' });
  const cur = rs[u.key]; ta.value = cur ? cur.t : '';
  const meta = h('div', { class: 'tl-meta' });
  const row = h('div', { class: 'tl-row', 'data-k': u.key }, left, h('div', { class: 'tl-tr' }, ta, meta));
  const paint = () => {
    const r = rs[u.key], has = !!(r && r.t.trim());
    meta.replaceChildren();
    const sel = h('select', { class: 'inp sm tl-st st-' + (has ? (r.s || 'draft') : 'todo'), disabled: !has });
    ['draft', 'review', 'done'].forEach(k => sel.append(h('option', { value: k }, t('tl.s.' + k))));
    sel.value = has ? (r.s || 'draft') : 'draft';
    sel.addEventListener('change', () => { tlSetStatus(L.id, u, sel.value); paint(); tlRefreshSum(st, L); });
    meta.append(sel);
    if (!has) meta.append(h('button', { class: 'btn sm icon', 'data-tip': t('tl.copysrc'), onclick: () => { ta.value = u.src; tlSetText(L.id, u, ta.value); autosize(ta); paint(); tlRefreshSum(st, L); } }, icon('copy', 14)));
    if (u.kind === 'say') meta.append(tlVoiceBtn(st, L, u, r, paint));
    const w = has ? tlWarns(u.src, r.t) : [];
    if (w.length) meta.append(h('span', { class: 'tl-warn', 'data-tip': w.join('\n') }, icon('alert', 15), h('span', w[0])));
    if (tlStale(r, u)) meta.append(h('div', { class: 'tl-stale' }, icon('refresh', 13), h('span', t('tl.stale')),
      r.src ? h('span', { class: 'tl-old' }, t('tl.was'), ' ', h('i', r.src.length > 90 ? r.src.slice(0, 90) + '…' : r.src)) : null,
      h('button', { class: 'btn sm', onclick: () => { r.src = u.src; if (!r.s) r.s = 'draft'; commit(true); paint(); tlRefreshSum(st, L); } }, t('tl.stale.ok'))));
  };
  /* при наборе перерисовываем только мелкие части (статус, предупреждения), но не сам textarea */
  const paintLite = debounce(() => paint(), 350);
  ta.addEventListener('input', () => { tlSetText(L.id, u, ta.value); autosize(ta); paintLite(); tlRefreshSum(st, L); });
  paint();
  requestAnimationFrame(() => autosize(ta));
  return row;
}

/* ---------- озвучка на языке ---------- */
function tlVoiceBtn(st, L, u, r, repaint) {
  const a = r && r.v ? P.assets.find(x => x.id === r.v) : null;
  const wrap = h('div', { class: 'tl-voice' });
  if (a) {
    const has = !!assetMeta(a, '');
    const pb = h('button', { class: 'btn sm icon', 'data-tip': t('as.f.play'), disabled: !has, onclick: () => tlPlay(a, pb) }, icon('play', 13));
    wrap.append(pb);
  }
  wrap.append(h('button', { class: 'btn sm tl-vb' + (a ? ' on' : '') + (a && !assetMeta(a, '') ? ' bad' : ''), 'data-tip': u.voiceBase ? t('tl.voice.base', u.voiceBase) : t('tl.voice.tip'), onclick: ev => tlVoicePick(ev.currentTarget, st, L, u, repaint) },
    icon('mic', 13), a ? h('span', { class: 'tl-vn' }, a.name) : h('span', t('tl.voice'))));
  return wrap;
}
async function tlPlay(a, btn) {
  const m = assetMeta(a, ''); if (!m) return;
  if (PREVIEW_AUDIO && PREVIEW_AUDIO.key === m.bid) { stopPreview(); return; }
  stopPreview();
  const u = await blobUrl(m.bid); if (!u) { toast(t('as.f.lost'), 3000); return; }
  const au = new Audio(u);
  const done = () => { btn.replaceChildren(icon('play', 13)); };
  au.addEventListener('ended', () => { if (PREVIEW_AUDIO && PREVIEW_AUDIO.a === au) PREVIEW_AUDIO = null; done(); });
  PREVIEW_AUDIO = { a: au, key: m.bid, done };
  btn.replaceChildren(icon('stop', 13));
  au.play().catch(() => stopPreview());
}
function tlVoicePick(anchor, st, L, u, repaint) {
  const r = tlRec(L.id, u.key);
  const extra = h('div', { class: 'row-actions left', style: { padding: '6px 8px 8px' } },
    h('button', { class: 'btn sm', onclick: () => pickFiles(acceptFor('voice'), false, async fl => {
      const f = fl[0], name = (f.name.replace(/\.[^.]+$/, '').replace(/_+/g, ' ').trim()) || (L.code + ' voice');
      const a = createAsset('voice', name);
      if (await attachFile(a, '', f)) { closePopover(); tlSetVoice(L.id, u, a.id); repaint(); tlRefreshSum(st, L); } else { P.assets = P.assets.filter(x => x !== a); commit(true); }
    }) }, icon('upload', 14), t('tl.voice.upload')),
    r && r.v ? h('button', { class: 'btn sm danger-t', onclick: () => { closePopover(); tlSetVoice(L.id, u, ''); repaint(); tlRefreshSum(st, L); } }, icon('x', 14), t('tl.voice.remove')) : null);
  popover(anchor, assetList('voice', a => { closePopover(); tlSetVoice(L.id, u, a.id); repaint(); tlRefreshSum(st, L); }, { extra }), { cls: 'pick-pop' });
}
const tlNat = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
/** Файлы озвучки пачкой: назначаются по порядку репликам текущего списка, у которых ещё нет голоса на этом языке. */
function tlBulkVoice(st, L) {
  const targets = tlFiltered(st, L).filter(u => u.kind === 'say' && !(tlRec(L.id, u.key) || {}).v);
  if (!targets.length) { toast(t('tl.bulk.none'), 3600); return; }
  pickFiles(acceptFor('voice'), true, async files => {
    files = files.filter(f => extOf(f.name) in AUD_TYPES).sort(tlNat);
    if (!files.length) { toast(t('tl.bulk.nofiles'), 3600); return; }
    const n = Math.min(files.length, targets.length);
    const ok = await confirmDlg({ title: t('tl.bulk.q', n), text: t('tl.bulk.t', files.length, targets.length, targets[0].src.slice(0, 60)), ok: t('tl.bulk.go') });
    if (!ok) return;
    let made = 0;
    for (let i = 0; i < n; i++) {
      const f = files[i], a = createAsset('voice', f.name.replace(/\.[^.]+$/, '').replace(/_+/g, ' ').trim() || L.code + ' ' + (i + 1));
      if (await attachFile(a, '', f)) { tlSetVoice(L.id, targets[i], a.id); made++; } else P.assets = P.assets.filter(x => x !== a);
    }
    commit(true); toast(t('tl.bulk.done', made), 4200); renderTl();
  });
}

/* ---------- меню «Ещё» ---------- */
function tlMore(anchor, st, L) {
  const orphans = tlOrphans(st.units).filter(o => o.lang === L.id);
  menuAt(anchor, [
    { label: t('tl.csv.exp'), icon: 'download', onClick: () => saveFile((slug(P.name) || 'project') + '_' + L.code + '.csv', tlCsv(L.id), 'text/csv') },
    { label: t('tl.csv.imp'), icon: 'upload', onClick: () => pickFiles('.csv,text/csv,text/plain', false, async fl => {
      const res = tlImportCsv(L.id, await fl[0].text());
      toast(res.bad ? t('tl.csv.bad') : t('tl.csv.done', res.updated, res.skipped + res.unknown), 5200); renderTl();
    }) },
    { sep: true },
    { label: t('tl.bulk'), icon: 'mic', onClick: () => tlBulkVoice(st, L) },
    { label: t('tl.fill'), icon: 'copy', onClick: async () => {
      const rs = tlRecs(L.id), todo = tlFiltered(st, L).filter(u => !(rs[u.key] && rs[u.key].t.trim()));
      if (!todo.length) { toast(t('tl.fill.none'), 3000); return; }
      if (!(await confirmDlg({ title: t('tl.fill.q', todo.length), text: t('tl.fill.t'), ok: t('tl.fill.go') }))) return;
      todo.forEach(u => { const r = tlRec(L.id, u.key, true); r.t = u.src; r.src = u.src; r.s = 'draft'; });
      commit(true); renderTl();
    } },
    { label: t('tl.approve'), icon: 'check', onClick: async () => {
      const rs = tlRecs(L.id), list = tlFiltered(st, L).filter(u => rs[u.key] && rs[u.key].t.trim() && rs[u.key].s !== 'done');
      if (!list.length) { toast(t('tl.approve.none'), 3000); return; }
      if (!(await confirmDlg({ title: t('tl.approve.q', list.length), text: t('tl.approve.t'), ok: t('tl.approve.go') }))) return;
      list.forEach(u => { const r = rs[u.key]; r.s = 'done'; r.src = u.src; });
      commit(true); renderTl();
    } },
    ...(orphans.length ? [{ sep: true }, { label: t('tl.orph', orphans.length), icon: 'trash', onClick: async () => {
      if (!(await confirmDlg({ title: t('tl.orph.q', orphans.length), text: t('tl.orph.t'), ok: t('c.delete'), danger: true }))) return;
      orphans.forEach(o => delete tlRecs(o.lang)[o.key]); commit(true); renderTl();
    } }] : [])
  ]);
}

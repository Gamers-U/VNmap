'use strict';
/* ====== Глобальный реестр: персонажи, фоны, спрайты, аудио, эффекты, файлы ====== */
let REG = null;
const REG_TABS = [
  { id: 'chars', icon: 'users' }, { id: 'team', icon: 'badge' }, { id: 'bg', icon: 'image' }, { id: 'sprite', icon: 'user' },
  { id: 'audio', icon: 'music' }, { id: 'fx', icon: 'sparkles' }, { id: 'tf', icon: 'motion' }, { id: 'font', icon: 'type' }, { id: 'gui', icon: 'palette' }, { id: 'ach', icon: 'trophy' }, { id: 'vars', icon: 'code' }, { id: 'files', icon: 'file' }
];
const AUDIO_KINDS = ['music', 'sfx', 'voice'];

function openRegistry(tab) {
  if (REG && !REG.m.closed) { if (tab) REG.tab = tab; renderReg(); return; }
  const st = { tab: tab || 'chars', q: '' };
  REG = st;
  st.m = openModal({
    cls: 'node-m reg-m', onClose: () => { if (REG === st) REG = null; stopPreview(); flushHistory(); scheduleRender(); },
    build: m => {
      st.m = m;
      st.side = h('div', { class: 'm-side' }); st.main = h('div', { class: 'm-main' });
      renderReg();
      return h('div', { class: 'm-wrap' }, modalHead(t('reg.title'), m), h('div', { class: 'm-body' }, st.side, st.main));
    }
  });
}
function regCount(id) {
  if (id === 'chars') return P.characters.length;
  if (id === 'audio') return P.assets.filter(a => AUDIO_KINDS.includes(a.kind)).length;
  if (id === 'files') return allFiles().length;
  if (id === 'vars') return P.vars.length;
  if (id === 'team') return P.members.length;
  if (id === 'ach') return P.achs.length;
  if (id === 'gui') return typeof guiCount === 'function' ? guiCount() : 0;
  return P.assets.filter(a => a.kind === id).length;
}
function renderReg() {
  const st = REG; if (!st) return;
  st.side.replaceChildren(h('div', { class: 'side-h' }, t('reg.sections')));
  REG_TABS.forEach(tb => st.side.append(h('div', { class: 'fitem top' + (st.tab === tb.id ? ' on' : ''), onclick: () => { st.tab = tb.id; st.q = ''; renderReg(); } },
    icon(tb.icon, 16), h('span', { class: 'fn' }, t('reg.tab.' + tb.id)), h('span', { class: 'count' }, regCount(tb.id)))));
  const keep = st.main.scrollTop;
  st.main.replaceChildren(regView(st));
  st.main.scrollTop = keep;
}
function usageMap() {
  const map = new Map();
  const bump = (id, fid) => { if (!map.has(id)) map.set(id, new Set()); map.get(id).add(fid); };
  for (const { file } of allFiles()) {
    file.assets.forEach(x => bump(x.ref, file.id));
    parseUsage(file.script).forEach(u => { const a = matchAsset(u); if (a) bump(a.id, file.id); });
    richTokens(file.script).forEach(tk => { if (tk.k === 'tag' && tk.name === 'font' && !tk.close) { const a = fontAssetByRef(tk.arg); if (a) bump(a.id, file.id); } });
  }
  for (const c of P.characters) if (c.font) { const a = fontAssetByRef(c.font); if (a) bump(a.id, 'char:' + c.id); }
  return map;
}
function regView(st) {
  const root = h('div', { class: 'view' });
  const q = h('input', { class: 'inp', type: 'search', placeholder: t('c.search'), id: 'reg-q' });
  q.value = st.q;
  const list = h('div', { class: 'reg-list' });
  const fill = () => {
    list.replaceChildren();
    const qq = st.q.trim().toLowerCase();
    if (st.tab === 'chars') regChars(st, list, qq);
    else if (st.tab === 'files') regFiles(st, list, qq);
    else if (st.tab === 'vars') regVars(st, list, qq);
    else if (st.tab === 'team') regTeam(st, list, qq);
    else if (st.tab === 'ach') regAchs(st, list, qq);
    else if (st.tab === 'gui') regGui(st, list, qq);
    else if (st.tab === 'fx' || st.tab === 'tf') regFx(st, list, qq);
    else regAssets(st, list, qq);
    if (typeof aclRegFreeze === 'function') aclRegFreeze(st, list, root);
  };
  q.addEventListener('input', () => { st.q = q.value; fill(); });
  const addBtn = st.tab === 'files' || st.tab === 'gui' ? null : h('button', { class: 'btn primary', onclick: ev => (st.tab === 'fx' || st.tab === 'tf' ? fxAddMenu(ev.currentTarget, st.tab) : regAdd(st)) }, icon('plus', 16), t('reg.add'), (st.tab === 'fx' || st.tab === 'tf') ? icon('chevD', 14) : null);
  const upBtn = ['bg', 'sprite', 'audio', 'font'].includes(st.tab) ? h('button', { class: 'btn', 'data-tip': t('reg.upload.tip'), onclick: () => pickFiles(acceptFor(st.tab === 'audio' ? 'music' : st.tab), true, async fl => { await bulkUpload(st.tab, fl); renderReg(); }) }, icon('upload', 16), t('reg.upload')) : null;
  root.append(h('div', { class: 'reg-top' }, h('div', { class: 'reg-h' }, t('reg.tab.' + st.tab), h('span', { class: 'hint' }, t('reg.hint.' + st.tab))), h('div', { class: 'grow' }), q, upBtn, addBtn), list);
  fill();
  return root;
}
function regAdd(st) {
  let focusId;
  if (st.tab === 'chars') { const c = createChar('', ''); c.name = t('char.default'); c.tag = uniqueTag(slug(t('char.default'))); focusId = c.id; }
  else if (st.tab === 'team') { const m = addMember(t('team.new')); focusId = m.id; }
  else if (st.tab === 'ach') { const a = createAch(); focusId = a.id; }
  else if (st.tab === 'vars') { openFlagDialog({ name: nextFlagName(), type: 'flag', onDone: v => setTimeout(() => { const el = $('[data-rid="' + v.id + '"]'); if (el) el.scrollIntoView({ block: 'center' }); }, 60) }); return; }
  else {
    const kind = st.tab === 'audio' ? 'music' : st.tab;
    const a = createAsset(kind, t('reg.new.' + kind)); focusId = a.id;
  }
  st.q = ''; renderReg();
  setTimeout(() => { const el = $('[data-rid="' + focusId + '"] input'); if (el) { el.focus(); el.select(); el.scrollIntoView({ block: 'center' }); } }, 40);
}
function regCard(rid, bodyEls, { onDelete, lead } = {}) {
  return h('div', { class: 'reg-card', 'data-rid': rid }, lead || null, h('div', { class: 'reg-body' }, bodyEls),
    h('button', { class: 'btn icon sm danger-t', 'data-tip': t('c.delete'), onclick: onDelete }, icon('trash', 15)));
}
function regChars(st, list, qq) {
  const items = P.characters.filter(c => !qq || (c.name + ' ' + c.tag + ' ' + c.aliases).toLowerCase().includes(qq));
  if (!items.length) list.append(h('div', { class: 'empty' }, t('reg.empty.chars')));
  items.forEach(c => {
    const sw = h('button', { class: 'hsw sm', style: { background: 'var(--c-' + c.color + ')' }, 'data-tip': t('tb.color'), onclick: ev => popover(ev.currentTarget, swatchRow(c.color, v => { c.color = v; commit(true); closePopover(); renderReg(); })) });
    /* как имя и реплика будут выглядеть в игре */
    const prev = h('div', { class: 'who-prev' });
    const updPrev = () => {
      prev.replaceChildren(h('span', { class: 'who-n', style: { color: cmpGameColor(c) } }, cmpGameName(c)),
        h('span', { class: 'who-t', style: Object.assign(c.textColor ? { color: c.textColor } : {}, c.font && fontCss(c.font) ? { fontFamily: fontCss(c.font) } : {}) }, t('char.prev.text')));
    };
    const nameInp = bindInput(c, 'name', { onChange: () => { commit(); gnameInp.placeholder = c.name || c.tag; updPrev(); } });
    const gnameInp = bindInput(c, 'gameName', { ph: c.name || c.tag, onChange: () => { commit(); updPrev(); } });
    list.append(regCard(c.id, [
      h('div', { class: 'grid3' },
        field(t('char.name'), nameInp),
        field(t('char.tag'), h('div', { class: 'rn-inrow' }, bindInput(c, 'tag', { mono: true, onChange: () => commit() }), h('button', { class: 'btn icon sm', 'data-tip': t('rn.btn'), onclick: () => openRenameDialog({ kind: 'char', key: c.id }) }, icon('type', 15))), RESERVED_TAGS.has(c.tag) ? t('char.tag.reserved') : undefined),
        field(t('char.aliases'), bindInput(c, 'aliases', { ph: t('char.aliases.ph'), onChange: () => commit() }))),
      h('div', { class: 'game-look' },
        h('div', { class: 'lbl' }, icon('play', 12), t('char.ingame')),
        h('div', { class: 'grid3' },
          field(t('char.gname'), gnameInp, t('char.gname.hint')),
          field(t('char.gcolor'), hexField(c, 'gameColor', THEMES.dark.colors[c.color] || '#ffffff', () => { commit(true); updPrev(); }), t('char.gcolor.hint')),
          field(t('char.tcolor'), hexField(c, 'textColor', '#ffffff', () => { commit(true); updPrev(); }), t('char.tcolor.hint'))),
        h('div', { class: 'grid3' }, field(t('char.font'), fontSelect(c.font, v => { c.font = v; commit(true); updPrev(); }), t('char.font.hint'))),
        prev),
      h('div', { class: 'grid2' }, field(t('char.notes'), bindInput(c, 'notes', { onChange: () => commit() })),
        field(t('char.always'), switchEl(c.always, v => { c.always = v; commit(true); }), t('char.always.hint'))),
      field(t('team.actor'), memberPicker(c, 'actor', () => commit(true), { single: true }), t('team.actor.h')),
      h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', 'data-tip': t('cp.open.t'), onclick: () => { REG.m.close(); openCharPage(c.id); } }, icon('user', 14), t('cp.open')))
    ], {
      lead: sw, onDelete: async () => {
        if (!(await confirmDlg({ title: t('reg.del.q', c.name), text: t('reg.del.char'), ok: t('c.delete'), danger: true }))) return;
        P.characters = P.characters.filter(x => x.id !== c.id);
        for (const { node, file } of allFiles()) { file.cast = file.cast.filter(i => i !== c.id); node.defaultCast = node.defaultCast.filter(i => i !== c.id); }
        commit(true); renderReg();
      }
    }));
    updPrev();
  });
}
/** Выбор цвета: пипетка + HEX. Пусто — «как по умолчанию» (показывается серым образцом fallback). */
function hexField(obj, key, fallback, onChange) {
  const cp = h('input', { type: 'color', class: 'hexf-c', 'aria-label': t('tb.color') });
  const tx = h('input', { class: 'inp mono hexf-t', type: 'text', maxlength: 7, spellcheck: 'false', placeholder: t('char.color.default') });
  const rst = h('button', { class: 'btn icon sm', 'data-tip': t('char.color.reset'), onclick: () => { obj[key] = ''; tx.value = ''; cp.value = fallback || '#ffffff'; wrap.classList.remove('set'); onChange(); } }, icon('x', 13));
  const sync = () => { cp.value = obj[key] || fallback || '#ffffff'; tx.value = obj[key] || ''; wrap.classList.toggle('set', !!obj[key]); };
  const wrap = h('div', { class: 'hexf' }, cp, tx, rst);
  cp.addEventListener('input', () => { obj[key] = cp.value.toLowerCase(); tx.value = obj[key]; wrap.classList.add('set'); onChange(); });
  tx.addEventListener('input', () => {
    let v = tx.value.trim(); if (v && v[0] !== '#') v = '#' + v;
    if (HEX6.test(v)) { obj[key] = v.toLowerCase(); cp.value = obj[key]; wrap.classList.add('set'); onChange(); }
    else if (v === '' || v === '#') { obj[key] = ''; cp.value = fallback || '#ffffff'; wrap.classList.remove('set'); onChange(); }
  });
  sync();
  return wrap;
}
function regAssets(st, list, qq) {
  const kinds = st.tab === 'audio' ? AUDIO_KINDS : [st.tab];
  list.append(mfBanner());
  const use = usageMap();
  const items = P.assets.filter(a => kinds.includes(a.kind) && (!qq || (a.name + ' ' + a.path + ' ' + a.expr.join(' ')).toLowerCase().includes(qq)));
  if (!items.length) list.append(h('div', { class: 'empty' }, t('reg.empty.assets')));
  items.forEach(a => {
    const cnt = use.get(a.id) ? use.get(a.id).size : 0;
    const body = [];
    const nameLabel = a.kind === 'bg' ? t('as.f.name.bg') : a.kind === 'sprite' ? t('as.f.name.sprite') : a.kind === 'fx' ? t('as.f.name.fx') : a.kind === 'font' ? t('as.f.name.font') : t('as.f.name.audio');
    const row1 = [field(nameLabel, bindInput(a, 'name', { mono: a.kind !== 'music' && a.kind !== 'sfx' && a.kind !== 'voice' && a.kind !== 'font', onChange: () => { commit(); if (a.kind === 'font') renderReg(); } }))];
    if (a.kind !== 'fx') row1.push(field(t('as.f.path'), bindInput(a, 'path', { mono: true, ph: a.kind === 'sprite' ? 'images/alice' : a.kind === 'font' ? fontRef(Object.assign({}, a, { path: '' })) : '', onChange: () => commit() }), a.kind === 'font' ? t('as.f.path.font') : undefined));
    if (st.tab === 'audio') row1.unshift(field(t('as.f.kind'), segmented(AUDIO_KINDS.map(k => ({ value: k, label: t('kind1.' + k) })), a.kind, v => { a.kind = v; commit(true); renderReg(); })));
    body.push(h('div', { class: st.tab === 'audio' ? 'grid3' : 'grid2' }, row1));
    if (a.kind === 'sprite') body.push(field(t('as.f.expr'), exprEditor(a)));
    if (a.kind === 'bg') body.push(h('div', { class: 'opt-row' }, switchEl(!!a.cg, v => { if (v) a.cg = true; else delete a.cg; commit(true); }), h('div', { class: 'opt-t' }, h('div', {}, t('as.cg')), h('div', { class: 'hint' }, t('as.cg.h')))));
    if (a.kind === 'music') body.push(h('div', { class: 'opt-row' }, switchEl(a.room !== false, v => { if (v) delete a.room; else a.room = false; commit(true); }), h('div', { class: 'opt-t' }, h('div', {}, t('as.room')), h('div', { class: 'hint' }, t('as.room.h')))));
    if (hasFilesKind(a.kind)) body.push(field(t('as.f.files.h'), assetFilesUI(a)));
    if (a.kind === 'font') body.push(fontSample(a));
    body.push(h('div', { class: 'grid2' }, field(t('as.f.notes'), bindInput(a, 'notes', { onChange: () => commit() })),
      h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('as.f.used')), h('div', { class: 'used-count' + (cnt ? '' : ' zero') }, cnt ? t('as.f.files', cnt) : t('as.f.unused')))));
    body.push(field(t('team.author'), memberPicker(a, 'owners', () => commit(true))));
    list.append(regCard(a.id, body, {
      lead: h('div', { class: 'reg-ic' }, icon(KIND_ICON[a.kind], 18)),
      onDelete: async () => {
        if (!(await confirmDlg({ title: t('reg.del.q', a.name), text: cnt ? t('reg.del.asset', cnt) : '', ok: t('c.delete'), danger: true }))) return;
        P.assets = P.assets.filter(x => x.id !== a.id);
        for (const { file } of allFiles()) file.assets = file.assets.filter(x => x.ref !== a.id);
        commit(true); renderReg();
      }
    }));
  });
}
/* ---------- переходы и трансформы ---------- */
function regFx(st, list, qq) {
  const kind = st.tab, use = usageMap();
  const items = P.assets.filter(a => a.kind === kind && (!qq || (a.name + ' ' + (a.code || '')).toLowerCase().includes(qq)));
  if (!items.length) list.append(h('div', { class: 'empty' }, t(kind === 'tf' ? 'reg.empty.tf' : 'reg.empty.fx')));
  items.forEach(a => {
    const b = fxBuiltin(kind, a.name), custom = fxIsCustom(a), cnt = use.get(a.id) ? use.get(a.id).size : 0;
    const badge = custom ? h('span', { class: 'fx-badge own' }, t('fx.badge.own')) : b ? h('span', { class: 'fx-badge' }, t('fx.badge.lib')) : h('span', { class: 'fx-badge warn' }, t('fx.badge.undef'));
    const desc = b ? fxDesc(b) : custom ? null : t('fx.undef.hint');
    const code = custom ? h('pre', { class: 'fx-codeview' }, (kind === 'tf' ? 'transform ' + a.name + ':\n' + a.code.split('\n').map(l => '    ' + l).join('\n') : 'define ' + a.name + ' = ' + a.code.replace(/\s*\n\s*/g, ' '))) : null;
    const player = fxPlayer(kind, fxSpecOf(a), { name: a.name });
    const acts = h('div', { class: 'row-actions left' });
    if (custom || !b) acts.append(h('button', { class: 'btn sm', onclick: () => openFxEditor(a) }, icon(custom ? 'sliders' : 'plus', 14), custom ? t('fx.edit.btn') : t('fx.define')));
    list.append(regCard(a.id, [
      h('div', { class: 'fx-head' }, h('b', { class: 'mono fx-name' }, a.name), badge, h('div', { class: 'grow' }), h('div', { class: 'used-count' + (cnt ? '' : ' zero') }, cnt ? t('as.f.files', cnt) : t('as.f.unused'))),
      h('div', { class: 'fx-main' }, player.el, h('div', { class: 'fx-info' }, desc ? h('div', { class: 'fx-desc' }, desc) : null, code, acts)),
      field(t('as.f.notes'), bindInput(a, 'notes', { onChange: () => commit() }))
    ], {
      lead: h('div', { class: 'reg-ic' }, icon(KIND_ICON[kind], 18)),
      onDelete: async () => {
        if (!(await confirmDlg({ title: t('reg.del.q', a.name), text: cnt ? t('reg.del.asset', cnt) : '', ok: t('c.delete'), danger: true }))) return;
        P.assets = P.assets.filter(x => x.id !== a.id); commit(true); renderReg();
      }
    }));
  });
}

function exprEditor(a) {
  const box = h('div', { class: 'chips' });
  const render = () => {
    box.replaceChildren();
    a.expr.forEach((x, i) => box.append(h('span', { class: 'chip on static' }, x, h('button', { class: 'chip-x', onclick: () => { a.expr.splice(i, 1); commit(true); renderReg(); } }, icon('x', 11, 2.6)))));
    const inp = h('input', { class: 'inp sm chip-in', placeholder: t('as.f.expr.add'), type: 'text' });
    const add = () => { const v = inp.value.trim(); if (!v) return; if (!a.expr.includes(v)) a.expr.push(v); commit(true); renderReg(); setTimeout(() => { const ni = $('[data-rid="' + a.id + '"] .chip-in'); if (ni) ni.focus(); }, 30); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } });
    inp.addEventListener('blur', add);
    box.append(inp);
  };
  render();
  return box;
}
function regFiles(st, list, qq) {
  const items = allFiles().filter(({ file, node }) => !qq || (file.title + ' ' + file.filename + ' ' + file.label + ' ' + node.title + ' ' + file.summary).toLowerCase().includes(qq));
  if (!items.length) { list.append(h('div', { class: 'empty' }, t('reg.empty.files'))); return; }
  const labels = new Map();
  allFiles().forEach(({ file }) => labels.set(fileLabel(file), (labels.get(fileLabel(file)) || 0) + 1));
  const table = h('div', { class: 'ftable' });
  table.append(h('div', { class: 'frow head' }, h('span', t('reg.f.file')), h('span', t('reg.f.block')), h('span', t('file.label')), h('span', t('reg.f.status')), h('span', { class: 'r' }, t('reg.f.words')), h('span')));
  items.forEach(({ file, node }) => {
    const dup = labels.get(fileLabel(file)) > 1;
    const stSel = h('select', { class: 'inp sm' }, STATUSES.map(s => h('option', { value: s }, t('status.' + s))));
    stSel.value = file.status;
    stSel.addEventListener('change', () => { file.status = stSel.value; commit(true); refreshNode(node.id); });
    table.append(h('div', { class: 'frow' },
      h('span', { class: 'fcell' }, h('span', { class: 'sdot', style: { background: palColor(STATUS_COLOR[file.status]) } }), h('b', file.title || t('file.untitled')), h('span', { class: 'pi-s' }, fileName(file))),
      h('span', { class: 'fcell' }, h('span', { class: 'dot', style: { background: palColor(node.color) } }), node.title),
      h('span', { class: 'mono' + (dup ? ' warn-t' : '') }, fileLabel(file), dup ? ' ⚠' : ''),
      stSel, h('span', { class: 'r' }, String(fileWords(file))),
      h('span', { class: 'fcell r' },
        h('button', { class: 'btn icon sm', 'data-tip': t('nm.show'), onclick: () => { REG.m.close(); focusNode(node.id); } }, icon('target', 15)),
        h('button', { class: 'btn icon sm', 'data-tip': t('tb.open'), onclick: () => { REG.m.close(); openNodeModal(node.id, file.id); } }, icon('open', 15)))));
  });
  list.append(table);
}

/* ---------- файлы ассета: загрузка, превью, проигрыватель ---------- */
let PREVIEW_AUDIO = null;
function stopPreview() { if (PREVIEW_AUDIO) { PREVIEW_AUDIO.a.pause(); PREVIEW_AUDIO.done(); PREVIEW_AUDIO = null; } }
function assetFilesUI(a) {
  const box = h('div', { class: 'upl' });
  const keys = a.kind === 'sprite' ? (a.expr.length ? a.expr.slice() : ['']) : [''];
  for (const key of keys) box.append(uploadRow(a, key));
  return box;
}
function uploadRow(a, key) {
  const m = assetMeta(a, key), img = isImageKind(a.kind), fnt = isFontKind(a.kind);
  const label = a.kind === 'sprite' ? (key || t('as.f.noexpr')) : '';
  const row = h('div', { class: 'upl-row' + (m ? ' has' : '') });
  const thumb = h('div', { class: 'upl-thumb' + (img ? '' : ' aud') });
  const markLostLater = () => { };
  if (m && img) { const im = h('img', { alt: '' }); thumb.append(im); blobUrl(m.bid).then(u => { if (u) im.src = u; else markLost(); }); }
  else thumb.append(fnt ? icon('type', 18) : icon(img ? 'image' : 'music', 18));
  const info = h('div', { class: 'upl-info' });
  /* файла нет в хранилище этого устройства: заглушка вместо превью; указанный вручную файл того же размера встаёт на своё место */
  let missing = false;
  const markLost = () => {
    missing = true; row.classList.add('lost', 'missing');
    thumb.replaceChildren(icon('cloud', 20));
    info.replaceChildren(h('div', { class: 'upl-n' }, label ? h('b', label) : null, m.name), h('div', { class: 'upl-s warn-t' }, t('mf.row.s', humanSize(m.size))));
    const up = btns.querySelector('.upl-up'); if (up) up.replaceChildren(icon('upload', 14), t('mf.row.pick'));
  };
  if (m) {
    info.append(h('div', { class: 'upl-n' }, label ? h('b', label) : null, m.name), h('div', { class: 'upl-s' }, humanSize(m.size) + (m.type ? ' · ' + m.type : '') + warnExt(a, m)));
    if (!img) blobUrl(m.bid).then(u => { if (!u) markLost(); });
  } else info.append(h('div', { class: 'upl-n' }, label ? h('b', label) : null, h('span', { class: 'muted' }, t('as.f.nofile'))), h('div', { class: 'upl-s' }, img ? t('as.f.placeholder') : t('as.f.noaudio')));
  const doUpload = async file => {
    if (missing) { const r = await mfRestoreOne({ bid: m.bid, m }, file); toast(t(r === 'same' ? 'mf.row.done' : 'mf.row.repl', m.name), 3600); renderReg(); return; }
    if (await attachFile(a, key, file)) renderReg();
  };
  const btns = h('div', { class: 'upl-btns' });
  if (m && !img && !fnt) {
    const pb = h('button', { class: 'btn icon sm', 'data-tip': t('as.f.play') }, icon('play', 15));
    pb.addEventListener('click', async () => {
      if (PREVIEW_AUDIO && PREVIEW_AUDIO.key === m.bid) { stopPreview(); return; }
      stopPreview();
      const u = await blobUrl(m.bid); if (!u) return;
      const au = new Audio(u);
      const done = () => { pb.replaceChildren(icon('play', 15)); };
      au.addEventListener('ended', () => { if (PREVIEW_AUDIO && PREVIEW_AUDIO.a === au) PREVIEW_AUDIO = null; done(); });
      PREVIEW_AUDIO = { a: au, key: m.bid, done };
      pb.replaceChildren(icon('stop', 15));
      au.play().catch(() => { stopPreview(); });
    });
    btns.append(pb);
  }
  btns.append(h('button', { class: 'btn sm upl-up', onclick: () => pickFiles(missing ? '' : acceptFor(a.kind), false, fl => doUpload(fl[0])) }, icon('upload', 14), m ? t('as.f.replace') : t('as.f.upload')));
  if (m) btns.append(h('button', { class: 'btn icon sm danger-t', 'data-tip': t('as.f.remove'), onclick: () => { detachFile(a, key); renderReg(); } }, icon('x', 14)));
  row.append(thumb, info, btns);
  row.addEventListener('dragover', e => { if ([...(e.dataTransfer.types || [])].includes('Files')) { e.preventDefault(); e.stopPropagation(); row.classList.add('drop'); } });
  row.addEventListener('dragleave', () => row.classList.remove('drop'));
  row.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); row.classList.remove('drop'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) doUpload(f); });
  return row;
}
function warnExt(a, m) {
  const e = metaExt(m);
  if (isImageKind(a.kind)) return RENPY_IMG.has(e) ? '' : ' · ' + t('as.f.badfmt', e || '?');
  if (isFontKind(a.kind)) return RENPY_FONT.has(e) ? '' : ' · ' + t('as.f.badfmt', e || '?');
  return RENPY_AUD.has(e) ? '' : ' · ' + t('as.f.badfmt', e || '?');
}

/* ---------- переменные проекта ---------- */
function regVars(st, list, qq) {
  const items = P.vars.filter(v => !qq || (v.name + ' ' + v.value + ' ' + v.notes).toLowerCase().includes(qq));
  if (!items.length) list.append(h('div', { class: 'empty' }, t('reg.empty.vars')));
  const A = flagAnalysis();
  items.forEach(v => {
    const bad = !/^[A-Za-z_]\w*$/.test(v.name) || RESERVED_TAGS.has(v.name) || P.characters.some(c => c.tag === v.name) || P.vars.some(x => x !== v && x.name === v.name);
    const info = A.names.get(v.name);
    /* начальное значение зависит от типа */
    const initBox = h('div');
    const paintInit = () => {
      initBox.replaceChildren();
      if (v.type === 'flag') initBox.append(segmented([{ value: 'False', label: t('flag.no') }, { value: 'True', label: t('flag.yes') }], /^True$/.test(v.value.trim()) ? 'True' : 'False', val => { v.value = val; commit(true); }));
      else if (v.type === 'number') { const i = h('input', { class: 'inp', type: 'number', step: 'any', value: /^-?\d+(\.\d+)?$/.test(v.value.trim()) ? v.value.trim() : '0' }); i.addEventListener('input', () => { v.value = i.value === '' ? '0' : i.value; commit(); }); initBox.append(i); }
      else if (v.type === 'choice') {
        const sel = h('select', { class: 'inp' }, h('option', { value: 'None' }, t('flag.unset')), ...v.values.map(x => h('option', { value: pyStr(x) }, x)));
        sel.value = [...sel.options].some(o => o.value === v.value.trim()) ? v.value.trim() : 'None';
        sel.addEventListener('change', () => { v.value = sel.value; commit(true); });
        initBox.append(sel);
      } else initBox.append(bindInput(v, 'value', { mono: true, ph: '0', onChange: () => commit() }));
    };
    const valsBox = h('div');
    const paintVals = () => {
      valsBox.replaceChildren();
      if (v.type !== 'choice') return;
      const chips = h('div', { class: 'chips' });
      v.values.forEach((x, i) => chips.append(h('span', { class: 'chip on static' }, x, h('button', { class: 'chip-x', onclick: () => { v.values.splice(i, 1); commit(true); paintVals(); paintInit(); } }, icon('x', 11, 2.6)))));
      const inp = h('input', { class: 'inp sm chip-in', type: 'text', placeholder: t('flag.val.add') });
      const add = () => { const x = inp.value.trim(); if (x && !v.values.includes(x)) { v.values.push(x); commit(true); paintVals(); paintInit(); setTimeout(() => { const ni = valsBox.querySelector('.chip-in'); if (ni) ni.focus(); }, 20); } };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } });
      inp.addEventListener('blur', add);
      chips.append(inp);
      valsBox.append(field(t('flag.vals'), chips, t('flag.vals.h')));
    };
    const typeSeg = segmented([{ value: 'flag', label: t('flag.t.flag') }, { value: 'choice', label: t('flag.t.choice') }, { value: 'number', label: t('flag.t.number') }, { value: 'raw', label: t('flag.t.raw') }], v.type, val => {
      v.type = val;
      if (val === 'flag' && !/^(True|False)$/.test(v.value.trim())) v.value = 'False';
      if (val === 'number' && !/^-?\d+(\.\d+)?$/.test(v.value.trim())) v.value = '0';
      if (val === 'choice') { if (!v.values.length && info) for (const c of info.cmp) if (!v.values.includes(c.val)) v.values.push(c.val); if (!/^None$|^"/.test(v.value.trim())) v.value = 'None'; }
      commit(true); paintVals(); paintInit(); typeHint.textContent = t('flag.t.' + val + '.h');
    });
    const typeHint = h('div', { class: 'hint' }, t('flag.t.' + v.type + '.h'));
    paintInit(); paintVals();
    /* где задаётся и где проверяется */
    const where = (label, recs, cls) => {
      const row = h('div', { class: 'use-row ' + cls }, h('span', { class: 'use-l' }, label));
      const seen = new Set();
      recs.forEach(r => {
        const key = r.node.id + '|' + (r.edge ? r.edge.id : r.file ? r.file.id : '');
        if (seen.has(key)) return; seen.add(key);
        const sub = r.edge ? (r.edge.title || t('flag.arrow')) : (r.file ? r.file.title : '');
        row.append(h('button', { class: 'use-chip', 'data-tip': t('nm.show'), onclick: () => { REG.m.close(); focusNode(r.node.id); } },
          h('span', { class: 'dot', style: { background: palColor(r.node.color) } }), r.node.title, sub ? h('span', { class: 'use-sub' }, ' · ' + sub) : null));
      });
      if (!recs.length) row.append(h('span', { class: 'use-none' }, '—'));
      return row;
    };
    const usage = h('div', { class: 'use-box' },
      where(t('flag.setat'), info ? info.setters : [], 'set'),
      where(t('flag.usedat'), info ? info.users : [], 'use'),
      info && info.users.length && !info.setters.length ? h('div', { class: 'warn-t' }, icon('alert', 14), t('flag.never.set')) : null,
      info && info.setters.length && !info.users.length ? h('div', { class: 'hint' }, icon('info', 14), t('flag.never.used')) : null);
    list.append(regCard(v.id, [
      h('div', { class: 'grid3' },
        field(t('var.name'), h('div', { class: 'rn-inrow' }, bindInput(v, 'name', { mono: true, onChange: () => commit() }), h('button', { class: 'btn icon sm', 'data-tip': t('rn.btn'), onclick: () => openRenameDialog({ kind: 'flag', key: v.name }) }, icon('type', 15))), bad ? t('var.bad') : undefined),
        field(t('flag.type'), typeSeg),
        field(t('var.value'), initBox)),
      typeHint, valsBox,
      field(t('as.f.notes'), bindInput(v, 'notes', { ph: t('flag.notes.ph'), onChange: () => commit() })),
      usage
    ], {
      lead: h('div', { class: 'reg-ic' }, icon(VAR_TYPE_ICON[v.type] || 'code', 18)),
      onDelete: () => { P.vars = P.vars.filter(x => x !== v); P.edges.forEach(e => { e.sets = (e.sets || []).filter(x => x.v !== v.id); }); commit(true); renderReg(); scheduleEdges(); }
    }));
  });
}

/* ---------- шрифты: выбор и образец ---------- */
function fontSelect(value, onPick, opts = {}) {
  const sel = h('select', { class: 'inp' + (opts.small ? ' sm' : '') }, h('option', { value: '' }, opts.empty || t('font.default')),
    ...fontChoices().map(c => h('option', { value: c.value }, c.label)));
  if (value && ![...sel.options].some(o => o.value === value)) sel.append(h('option', { value }, value + ' ⚠'));
  sel.value = value || '';
  sel.addEventListener('change', () => onPick(sel.value));
  return sel;
}
function fontSample(a) {
  const box = h('div', { class: 'font-sample' });
  const sample = h('div', { class: 'fs-text' }, FONT_SAMPLE[S.lang === 'en' ? 'en' : 'ru']);
  const note = h('div', { class: 'fs-note hint' });
  box.append(sample, note);
  const m = assetMeta(a, '');
  if (!m) { note.textContent = t('font.nofile'); sample.classList.add('dim'); return box; }
  loadFont(a).then(fam => {
    if (!box.isConnected && !fam) { /* окно уже закрыли */ }
    if (!fam) { note.textContent = t('font.bad'); note.classList.add('warn-t'); return; }
    sample.style.fontFamily = '"' + fam + '", var(--font)';
    if (!fontHasCyrillic(fam)) { note.textContent = t('font.nocyr'); note.classList.add('warn-t'); }
    else note.textContent = t('font.ok', fontRef(a));
  });
  return box;
}

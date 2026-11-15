'use strict';
/* ====== Общие диалоги: стрелка, выбор ассета/персонажа, быстрые формы ====== */

// имена, которые нельзя занимать под персонажа: встроенные функции Python и ключевые слова Ren'Py
const RESERVED_TAGS = new Set(['max', 'min', 'sum', 'all', 'any', 'abs', 'len', 'map', 'str', 'int', 'list', 'dict', 'set', 'type', 'id', 'input', 'print', 'range', 'round', 'sorted', 'zip', 'filter', 'format', 'object', 'open', 'next', 'iter', 'hash', 'help', 'dir', 'chr', 'ord', 'bin', 'hex', 'oct', 'pow', 'e', 'narrator', 'name', 'config', 'store', 'renpy', 'persistent', 'scene', 'show', 'hide', 'with', 'label', 'menu', 'jump', 'call', 'return', 'play', 'stop', 'queue', 'define', 'default', 'image', 'init', 'if', 'else', 'elif', 'while', 'pass', 'python', 'transform', 'screen', 'style', 'at', 'as', 'in', 'is', 'not', 'and', 'or', 'from', 'import', 'class', 'def', 'for', 'try', 'del', 'lambda', 'None', 'True', 'False']);
function uniqueTag(base) {
  base = (base || 'char').toLowerCase().replace(/[^a-z0-9_]/g, '') || 'char';
  if (RESERVED_TAGS.has(base)) base += '_';
  let tag = base, i = 2;
  while (P.characters.some(c => c.tag === tag)) tag = base + i++;
  return tag;
}
function createAsset(kind, name) {
  const a = { id: uid('a'), kind, name, path: '', notes: '', expr: [], files: {} };
  if (['music', 'sfx', 'voice'].includes(kind) && /[\/.]/.test(name)) a.path = name;
  P.assets.push(a); commit(true);
  return a;
}
function createChar(name, tag) {
  const c = { id: uid('c'), name, tag: uniqueTag(tag || (name ? slug(name).slice(0, 16) : 'char')), color: COLOR_NAMES[(P.characters.length * 3 + 1) % 10], aliases: '', always: false, notes: '' };
  P.characters.push(c); commit(true);
  return c;
}

/* ---- быстрое создание персонажа ---- */
function quickChar(anchor, cb) {
  let tagTouched = false;
  const nameI = h('input', { class: 'inp', placeholder: t('char.name'), id: 'qc-name' });
  const tagI = h('input', { class: 'inp mono', placeholder: t('char.tag'), id: 'qc-tag', spellcheck: 'false' });
  nameI.addEventListener('input', () => { if (!tagTouched) tagI.value = nameI.value.trim() ? slug(nameI.value).slice(0, 16) : ''; });
  tagI.addEventListener('input', () => { tagTouched = true; });
  const go = () => {
    const name = nameI.value.trim(); if (!name) { nameI.focus(); return; }
    const c = createChar(name, tagI.value.trim()); closePopover(); cb(c);
  };
  [nameI, tagI].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
  popover(anchor, h('div', { class: 'qform' },
    h('div', { class: 'lbl' }, t('char.new')), nameI, tagI,
    h('div', { class: 'hint' }, t('char.tag.hint')),
    h('button', { class: 'btn primary wide', onclick: go }, t('c.create'))), { cls: 'pick-pop' });
  setTimeout(() => nameI.focus(), 30);
}

/* ---- выбор персонажей (чипы) ---- */
function castPicker(owner, key, autoIds, onChange) {
  const box = h('div', { class: 'chips' });
  const render = () => {
    box.replaceChildren();
    for (const c of P.characters) {
      const auto = autoIds.includes(c.id), on = auto || owner[key].includes(c.id);
      box.append(h('button', {
        class: 'chip' + (on ? ' on' : '') + (auto ? ' auto' : ''), 'data-tip': auto ? t('cast.auto.tip') : null,
        onclick: () => { if (auto) return; const i = owner[key].indexOf(c.id); if (i >= 0) owner[key].splice(i, 1); else owner[key].push(c.id); onChange && onChange(); render(); }
      }, h('span', { class: 'dot', style: { background: 'var(--c-' + c.color + ')' } }), c.name || c.tag || '?', auto ? icon('lock', 12) : null));
    }
    box.append(h('button', { class: 'chip add', onclick: ev => quickChar(ev.currentTarget, c => { owner[key].push(c.id); onChange && onChange(); render(); }) }, icon('plus', 14), t('cast.add')));
  };
  render();
  return box;
}

/* ---- выбор ассета из реестра ---- */
function assetList(kind, onPick, { extra } = {}) {
  const wrap = h('div', { class: 'picker' });
  const q = h('input', { class: 'inp', placeholder: t('pick.search'), id: 'pick-q' });
  const list = h('div', { class: 'plist' });
  const render = () => {
    list.replaceChildren();
    const qq = q.value.trim().toLowerCase();
    const items = P.assets.filter(a => a.kind === kind && (!qq || (a.name + ' ' + a.path).toLowerCase().includes(qq)));
    items.forEach(a => list.append(h('div', { class: 'pi', onclick: () => onPick(a) }, icon(KIND_ICON[kind], 16),
      h('div', { class: 'pi-t' }, h('div', { class: 'pi-n' }, a.name || '—'),
        (kind === 'sprite' ? a.expr.length : a.path) ? h('div', { class: 'pi-s' }, kind === 'sprite' ? a.expr.join(', ') : a.path) : null))));
    if (!items.length && !qq) list.append(h('div', { class: 'empty small' }, t('pick.empty.' + kind)));
    if (qq && !P.assets.some(a => a.kind === kind && a.name.toLowerCase() === qq))
      list.append(h('div', { class: 'pi create', onclick: () => onPick(createAsset(kind, q.value.trim())) }, icon('plus', 16), h('div', { class: 'pi-t' }, h('div', { class: 'pi-n' }, t('pick.create', q.value.trim())))));
  };
  q.addEventListener('input', render);
  q.addEventListener('keydown', ev => { if (ev.key === 'Enter') { const f = list.querySelector('.pi'); if (f) f.click(); } });
  render();
  wrap.append(q, list);
  if (extra) wrap.append(extra);
  setTimeout(() => q.focus(), 30);
  return wrap;
}
function pickAsset(anchor, kind, onPick) {
  return popover(anchor, assetList(kind, a => { closePopover(); onPick(a); }), { cls: 'pick-pop' });
}
function pickChar(anchor, ids, onPick) {
  const list = h('div', { class: 'plist' });
  const chars = (ids && ids.length ? ids.map(charById).filter(Boolean) : []).concat(P.characters.filter(c => !(ids || []).includes(c.id)));
  chars.forEach((c, i) => list.append(h('div', { class: 'pi', onclick: () => { closePopover(); onPick(c); } },
    h('span', { class: 'dot big', style: { background: 'var(--c-' + c.color + ')' } }),
    h('div', { class: 'pi-t' }, h('div', { class: 'pi-n' }, c.name || c.tag), h('div', { class: 'pi-s' }, c.tag)))));
  if (!chars.length) list.append(h('div', { class: 'empty small' }, t('pick.empty.char')));
  popover(anchor, h('div', { class: 'picker' }, list), { cls: 'pick-pop' });
}
/** Выбор файла проекта (для jump/call). */
function pickFile(anchor, onPick) {
  const wrap = h('div', { class: 'picker' });
  const q = h('input', { class: 'inp', placeholder: t('pick.search'), id: 'pickf-q' });
  const list = h('div', { class: 'plist' });
  const render = () => {
    list.replaceChildren();
    const qq = q.value.trim().toLowerCase();
    allFiles().filter(({ file, node }) => !qq || (file.title + ' ' + file.label + ' ' + node.title).toLowerCase().includes(qq)).slice(0, 80).forEach(({ file, node }) =>
      list.append(h('div', { class: 'pi', onclick: () => { closePopover(); onPick(file, node); } },
        h('span', { class: 'dot big', style: { background: palColor(node.color) } }),
        h('div', { class: 'pi-t' }, h('div', { class: 'pi-n' }, file.title || t('file.untitled')), h('div', { class: 'pi-s' }, node.title + ' · ' + fileLabel(file))))));
    if (!list.children.length) list.append(h('div', { class: 'empty small' }, t('search.none')));
  };
  q.addEventListener('input', render); render();
  wrap.append(q, list);
  popover(anchor, wrap, { cls: 'pick-pop' });
  setTimeout(() => q.focus(), 30);
}
const fileLabel = f => f.label || slug(f.title);
const fileName = f => (f.filename || slug(f.title)).replace(/\.rpy$/i, '') + '.rpy';

/* ---- окно стрелки ---- */
function openEdgeModal(id) {
  const e = edgeById(id); if (!e) return;
  MODALS.filter(m => m.tag === 'edge').forEach(m => m.close());
  const m = openModal({
    cls: 'edge-m', build: m => {
      const a = nodeById(e.from), b = nodeById(e.to);
      const upd = () => { commit(); scheduleEdges(); };
      const titleI = bindInput(e, 'title', { ph: t('edge.title.ph'), onChange: upd });
      titleI.id = 'edge-title';
      const desc = bindArea(e, 'desc', { ph: t('edge.desc.ph'), rows: 4, onChange: upd });
      desc.id = 'edge-desc';
      const sides = key => segmented([{ value: 'auto', label: t('side.auto') }, { value: 't', label: '↑' }, { value: 'r', label: '→' }, { value: 'b', label: '↓' }, { value: 'l', label: '←' }],
        e[key], v => { e[key] = v; commit(true); renderEdges(); positionToolbar(); });
      const colorBox = h('div');
      const renderColor = () => { colorBox.replaceChildren(swatchRow(e.color, c => { e.color = c; commit(true); renderEdges(); renderColor(); }, t('color.auto'))); };
      renderColor();
      const route = h('div', { class: 'edge-route' }, h('span', { class: 'dot big', style: { background: a ? palColor(a.color) : 'gray' } }), h('b', a ? a.title : '?'), icon('chevR', 14), h('span', { class: 'dot big', style: { background: b ? palColor(b.color) : 'gray' } }), h('b', b ? b.title : '?'));
      setTimeout(() => { titleI.focus(); titleI.select(); }, 60);
      return h('div', { class: 'm-wrap' },
        modalHead(t('edge.modal'), m),
        h('div', { class: 'm-pad' },
          route,
          field(t('edge.title'), titleI, t('edge.title.hint')),
          field(t('edge.desc'), desc),
          h('div', { class: 'card-sec edge-logic' }, h('div', { class: 'sec-head' }, icon('code', 16), h('b', t('edge.logic')), h('span', { class: 'hint' }, t('edge.logic.hint'))),
            field(t('sets.title'), edgeSetsEditor(e, () => { commit(); scheduleEdges(); }), t('sets.hint')),
            field(t('edge.cond'), (() => {
              const ci = bindInput(e, 'cond', { mono: true, ph: 'maks_like >= 3', onChange: () => commit() });
              return h('div', { class: 'cond-row' }, ci, h('button', { class: 'btn sm', 'data-tip': t('cb.title.expr'), onclick: () => openCondBuilder({ mode: 'expr', onDone: ex => { e.cond = ex; ci.value = ex; commit(true); } }) }, icon('wand', 14), t('cb.make')));
            })(), t('edge.cond.hint')),
            field(t('edge.code'), bindArea(e, 'code', { mono: true, ph: 'maks_like += 1', rows: 2, onChange: () => commit() }), t('edge.code.hint'))),
          h('div', { class: 'grid2' }, field(t('edge.color'), colorBox),
            field(t('edge.style'), segmented([{ value: false, label: t('edge.solid') }, { value: true, label: t('edge.dashed') }], !!e.dashed, v => { e.dashed = v; commit(true); renderEdges(); }))),
          h('div', { class: 'grid2' }, field(t('edge.from'), sides('fromSide')), field(t('edge.to'), sides('toSide'))),
          h('div', { class: 'row-actions' },
            h('button', { class: 'btn', onclick: () => { reverseEdge(e.id); m.close(); openEdgeModal(e.id); } }, icon('reverse', 16), t('tb.reverse')),
            h('div', { class: 'grow' }),
            h('button', { class: 'btn danger', onclick: () => { UI.edge = e.id; m.close(); deleteSelection(); } }, icon('trash', 16), t('tb.delete')))));
    }
  });
  m.tag = 'edge';
  return m;
}

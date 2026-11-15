'use strict';
/* ====== Стикеры-заметки: короткие пометки к блокам и главам ======
   Это не описание блока, а рабочие пометки: «проверить дату», «спросить художника», «переписать концовку». Заметку можно отметить решённой.
   Хранятся в проекте: P.cmts = [{ id, nid (блок), fid (глава или ''), by (имя), t (время), text, done }] и сливаются как отдельные сущности (k/<id>),
   поэтому две заметки, добавленные разными людьми одновременно, не конфликтуют. */

Object.assign(D, {
  'cm.title': ['Заметки', 'Notes'], 'cm.tb': ['Заметки к блоку', 'Notes on the block'],
  'cm.ph': ['Что здесь нужно сделать или не забыть…', 'What to do or remember here…'], 'cm.send': ['Добавить', 'Add'], 'cm.hint': ['Ctrl+Enter — добавить', 'Ctrl+Enter to add'],
  'cm.done': ['Решено', 'Resolved'], 'cm.reopen': ['Вернуть в работу', 'Reopen'], 'cm.del': ['Удалить заметку', 'Delete the note'],
  'cm.name': ['Ваше имя в заметках', 'Your name in notes'], 'cm.name.ph': ['Например: Тимур', 'For example: Alex'], 'cm.anon': ['Без имени', 'No name'],
  'cm.none': ['Заметок пока нет. Здесь удобно оставлять пометки себе и коллегам.', 'No notes yet. A handy place for reminders to yourself and your team.'],
  'cm.on': ['К чему', 'About'], 'cm.on.node': ['К блоку целиком', 'The whole block'], 'cm.file': ['глава: {0}', 'chapter: {0}'],
  'cm.show.done': ['Показать решённые ({0})', 'Show resolved ({0})'], 'cm.hide.done': ['Скрыть решённые', 'Hide resolved'],
  'cm.badge': ['Заметки: открытых {0}', 'Notes: {0} open'], 'cm.badge.done': ['Все заметки решены', 'All notes are resolved'],
  'cm.all': ['Все заметки проекта…', 'All notes in the project…'], 'cm.all.title': ['Заметки проекта', 'Project notes'],
  'cm.f.open': ['Открытые', 'Open'], 'cm.f.done': ['Решённые', 'Resolved'], 'cm.f.all': ['Все', 'All'], 'cm.all.none': ['Здесь пока пусто', 'Nothing here yet'],
  'cm.q': ['Поиск по заметкам…', 'Search notes…'], 'cm.go': ['Показать на карте', 'Show on the map'],
  'cm.card': ['заметка на карте', 'note on the map'], 'cm.card.edit': ['Открыть заметку', 'Open the note'], 'cm.card.hint': ['Решённая заметка бледнеет на карте и уходит из списка открытых.', 'A resolved note fades on the map and leaves the list of open ones.'],
});

const cmList = nid => (P.cmts || []).filter(c => c.nid === nid);
const cmOpenCount = nid => cmList(nid).filter(c => !c.done).length;
function cmAuthor() {
  const me = typeof CL !== 'undefined' && CL && CL.me && CL.me.name;
  return String(S.author || me || '').trim().slice(0, 60);
}
function cmColor(name) {
  const m = (P.members || []).find(x => x.name && x.name === name);
  if (m) return palColor(m.color);
  let x = 0; for (const ch of String(name || '?')) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return palColor(COLOR_NAMES[x % (COLOR_NAMES.length - 1)]);
}
function cmFileTitle(fid) { const f = fid && findFile(fid); return f ? (f.file.title || t('file.untitled')) : ''; }
function cmRefresh(nid) {
  refreshNode(nid);
  if (NMODAL && !NMODAL.m.closed && NMODAL.nid === nid) renderHead(NMODAL);
}
function cmAdd(nid, fid, text) {
  text = String(text || '').trim();
  if (!text || !nodeById(nid)) return null;
  if (!P.cmts) P.cmts = [];
  const c = { id: uid('k'), nid, fid: fid && findFile(fid) ? fid : '', by: cmAuthor(), t: Date.now(), text: text.slice(0, 2000), done: false };
  P.cmts.push(c); commit(true); cmRefresh(nid);
  return c;
}
function cmToggle(c) { c.done = !c.done; commit(true); cmRefresh(c.nid); }
function cmRemove(c) { P.cmts = P.cmts.filter(x => x.id !== c.id); commit(true); cmRefresh(c.nid); }

/** Значок на блоке: жёлтый листок с числом открытых заметок или зелёная галочка, если все решены. Рисуется только на экране. */
function cmBadgeG(n, w, pl) {
  const list = cmList(n.id); if (!list.length) return null;
  const open = list.filter(c => !c.done).length, yel = pl.colors.yellow, grn = pl.colors.green, col = open ? yel : grn, on = onColor(col);
  const g = s('g', { class: 'cm-badge' + (open ? '' : ' all-done'), 'data-cm': n.id, transform: `translate(${w - 40} -13) rotate(4 13 13)`, style: 'cursor:pointer' });
  g.append(s('title', {}, open ? t('cm.badge', open) : t('cm.badge.done')));
  g.append(s('path', { d: 'M2 1h22a1 1 0 0 1 1 1v16l-7 7H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z', fill: col, stroke: pl.surface, 'stroke-width': 1.5 }));
  g.append(s('path', { d: 'M25 18h-6a1 1 0 0 0-1 1v6z', fill: rgba(on, 0.28), 'pointer-events': 'none' }));
  if (open) g.append(s('text', { x: 12.5, y: 17, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: on, 'pointer-events': 'none' }, String(open)));
  else g.append(iconG('check', 6, 6, 13, on, 3));
  return g;
}

/* ---------- панель заметок ---------- */
function cmPanel(nid, fid) {
  const box = h('div', { class: 'cm-pan' }), st = { showDone: false, fid: fid && findFile(fid) ? fid : '' };
  const render = () => {
    const n = nodeById(nid); if (!n) { closePopover(); return; }
    box.replaceChildren();
    const all = cmList(nid).sort((a, b) => a.t - b.t), open = all.filter(c => !c.done), done = all.filter(c => c.done);
    box.append(h('div', { class: 'cm-head' }, icon('sticker', 16), h('b', t('cm.title')), h('span', { class: 'count' }, String(open.length)), h('div', { class: 'grow' }), h('span', { class: 'cm-node' }, n.title)));
    const item = c => {
      const who = c.by || t('cm.anon'), ft = cmFileTitle(c.fid);
      return h('div', { class: 'cm-item' + (c.done ? ' done' : ''), 'data-cmid': c.id },
        h('span', { class: 'cm-av', style: { background: cmColor(c.by), color: onColor(cmColor(c.by)) } }, initials(who)),
        h('div', { class: 'cm-body' },
          h('div', { class: 'cm-meta' }, h('b', who), c.rv ? h('span', { class: 'cm-rv' }, t('rv.note.tag')) : null, h('span', ' · ' + ago(c.t)), ft ? h('span', { class: 'cm-on' }, t('cm.file', ft)) : null),
          h('div', { class: 'cm-text' }, c.text)),
        h('div', { class: 'cm-act' },
          h('button', { class: 'btn icon sm' + (c.done ? ' on' : ''), 'data-tip': c.done ? t('cm.reopen') : t('cm.done'), onclick: () => { cmToggle(c); render(); } }, icon(c.done ? 'undo' : 'check', 15)),
          h('button', { class: 'btn icon sm danger-t', 'data-tip': t('cm.del'), onclick: () => { cmRemove(c); render(); } }, icon('trash', 14))));
    };
    const list = h('div', { class: 'cm-list' });
    if (!all.length) list.append(h('div', { class: 'empty small' }, t('cm.none')));
    open.forEach(c => list.append(item(c)));
    if (done.length) {
      list.append(h('button', { class: 'cm-toggle', onclick: () => { st.showDone = !st.showDone; render(); } }, st.showDone ? t('cm.hide.done') : t('cm.show.done', done.length)));
      if (st.showDone) done.forEach(c => list.append(item(c)));
    }
    box.append(list);
    const ta = h('textarea', { class: 'inp cm-ta', rows: '2', placeholder: t('cm.ph'), maxlength: '2000' });
    const send = () => { const c = cmAdd(nid, st.fid, ta.value); if (c) { render(); const nt = box.querySelector('.cm-ta'); if (nt) nt.focus(); } };
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } e.stopPropagation(); });
    const form = h('div', { class: 'cm-form' });
    if (!cmAuthor()) {
      const ni = h('input', { class: 'inp', placeholder: t('cm.name.ph'), maxlength: '60', 'aria-label': t('cm.name') });
      ni.addEventListener('change', () => { S.author = ni.value.trim().slice(0, 60); saveSettings(); });
      ni.addEventListener('keydown', e => e.stopPropagation());
      form.append(h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('cm.name')), ni));
    }
    if (n.files.length) {
      const sel = h('select', { class: 'inp cm-sel', 'aria-label': t('cm.on') }, h('option', { value: '' }, t('cm.on.node')), ...n.files.map(f => h('option', { value: f.id }, t('cm.file', f.title || t('file.untitled')))));
      sel.value = st.fid; sel.addEventListener('change', () => { st.fid = sel.value; });
      form.append(sel);
    }
    form.append(ta, h('div', { class: 'cm-send' }, h('span', { class: 'hint' }, t('cm.hint')), h('div', { class: 'grow' }), h('button', { class: 'btn primary', onclick: send }, icon('plus', 15), t('cm.send'))));
    box.append(form);
  };
  render();
  return box;
}
function openCmPopover(anchor, nid, fid) {
  const pan = cmPanel(nid, fid);
  popover(anchor, pan, { cls: 'cm-pop' });
  setTimeout(() => { const ta = pan.querySelector('.cm-ta'); if (ta) ta.focus(); }, 40);
}
/** Кнопка со значком в шапке окна блока. */
function cmHeadBtn(st) {
  const n = nodeById(st.nid), open = cmOpenCount(n.id);
  const b = h('button', { class: 'btn icon cm-hb' + (open ? ' has' : ''), 'data-tip': t('cm.tb'), onclick: ev => openCmPopover(ev.currentTarget, n.id, st.sel !== 'node' ? st.sel : '') }, icon('sticker', 18), open ? h('span', { class: 'cm-n' }, String(open)) : null);
  return b;
}

/* ---------- все заметки проекта ---------- */
/** Карточки-заметки на карте (блоки типа «заметка») — тоже заметки проекта; их можно отметить решёнными. */
const cmCards = () => P.nodes.filter(n => n.type === 'note');
function cmCardToggle(n) { n.done = !n.done; commit(true); refreshNode(n.id); if (NMODAL && !NMODAL.m.closed && NMODAL.nid === n.id) refreshNodeModal(); }
/** Все заметки одним списком: стикеры к блокам и карточки на карте. Свежие стикеры сверху, карточки — в порядке на карте. */
function cmEverything() {
  const out = [];
  for (const c of P.cmts || []) { const n = nodeById(c.nid); if (n) out.push({ kind: 'cmt', c, n, done: !!c.done, text: c.text, by: c.by, t: c.t, title: n.title }); }
  for (const n of cmCards()) out.push({ kind: 'card', n, done: !!n.done, text: n.desc || '', by: '', t: 0, title: n.title });
  return out;
}
function openAllNotes() {
  closePopover();
  const st = { f: 'open', q: '' };
  openModal({
    cls: 'search-m cm-all', build: m => {
      const list = h('div', { class: 'cm-all-list scroll' });
      const q = h('input', { class: 'inp', placeholder: t('cm.q'), type: 'text' });
      const seg = h('div', { class: 'seg-wrap' });
      const render = () => {
        const qq = q.value.trim().toLowerCase();
        seg.replaceChildren(segmented([{ value: 'open', label: t('cm.f.open') }, { value: 'done', label: t('cm.f.done') }, { value: 'all', label: t('cm.f.all') }], st.f, v => { st.f = v; render(); }));
        list.replaceChildren();
        const items = cmEverything().filter(x => (st.f === 'all' || (st.f === 'done') === x.done) && (!qq || (x.text + ' ' + x.by + ' ' + x.title).toLowerCase().includes(qq)))
          .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'cmt' ? -1 : 1) || b.t - a.t);
        if (!items.length) { list.append(h('div', { class: 'empty small' }, t('cm.all.none'))); return; }
        for (const x of items) {
          const n = x.n;
          if (x.kind === 'cmt') {
            const c = x.c, who = c.by || t('cm.anon'), ft = cmFileTitle(c.fid);
            list.append(h('div', { class: 'cm-item cm-row' + (c.done ? ' done' : ''), 'data-cmid': c.id, onclick: () => { m.close(); focusNode(n.id); setTimeout(() => { const el = NODE_EL.get(n.id); if (el) openCmPopover(el, n.id, c.fid); }, 450); } },
              h('span', { class: 'cm-av', style: { background: cmColor(c.by), color: onColor(cmColor(c.by)) } }, initials(who)),
              h('div', { class: 'cm-body' }, h('div', { class: 'cm-meta' }, h('b', who), h('span', ' · ' + ago(c.t) + ' · '), h('span', { class: 'cm-crumb' }, n.title + (ft ? ' › ' + ft : ''))), h('div', { class: 'cm-text' }, c.text)),
              h('div', { class: 'cm-act' }, h('button', { class: 'btn icon sm' + (c.done ? ' on' : ''), 'data-tip': c.done ? t('cm.reopen') : t('cm.done'), onclick: ev => { ev.stopPropagation(); cmToggle(c); render(); } }, icon(c.done ? 'undo' : 'check', 15)))));
          } else {
            const col = palColor(n.color);
            list.append(h('div', { class: 'cm-item cm-row cm-card' + (n.done ? ' done' : ''), 'data-nid': n.id, onclick: () => { m.close(); focusNode(n.id); } },
              h('span', { class: 'cm-av', style: { background: col, color: onColor(col) } }, icon('note', 15)),
              h('div', { class: 'cm-body' }, h('div', { class: 'cm-meta' }, h('b', n.title || t('node.new.note')), h('span', ' · '), h('span', { class: 'cm-crumb' }, t('cm.card'))), n.desc ? h('div', { class: 'cm-text' }, n.desc) : null),
              h('div', { class: 'cm-act' },
                h('button', { class: 'btn icon sm', 'data-tip': t('cm.card.edit'), onclick: ev => { ev.stopPropagation(); m.close(); focusNode(n.id, { open: true }); } }, icon('open', 15)),
                h('button', { class: 'btn icon sm' + (n.done ? ' on' : ''), 'data-tip': n.done ? t('cm.reopen') : t('cm.done'), onclick: ev => { ev.stopPropagation(); cmCardToggle(n); render(); } }, icon(n.done ? 'undo' : 'check', 15)))));
          }
        }
      };
      q.addEventListener('input', render);
      render();
      return h('div', { class: 'm-wrap' }, modalHead(t('cm.all.title'), m), h('div', { class: 'm-pad' }, h('div', { class: 'cm-all-bar' }, seg, q)), list);
    }
  });
}
TOOL_ITEMS.push({ id: 'notes', group: 'notes', ic: 'sticker', key: 'cm.all', run: () => openAllNotes() });

'use strict';
/* ====== Участники проекта: роли, ответственные за блоки и ресурсы, фильтр на карте, нагрузка, титры ======
   Участник — человек команды: имя, цвет, роли («сценарист», «художник», своя). Его можно назначить ответственным за блок, файл
   сценария, ресурс (фон, спрайт, музыку) или озвучку персонажа. Из ролей и назначений собираются титры игры. */
const ROLE_PRESETS = ['writer', 'editor', 'artist_bg', 'artist_sprite', 'composer', 'sound', 'voice', 'translator', 'dev', 'tester', 'manager'];
const roleLabel = r => (String(r).startsWith('role:') ? t('role.' + String(r).slice(5)) : String(r));
const creditHead = r => (String(r).startsWith('role:') ? t('credit.' + String(r).slice(5)) : String(r));
const memberById = id => P.members.find(m => m.id === id) || null;
const memberCol = m => palColor(m.color);
function initials(name) { const w = String(name || '').trim().split(/\s+/).filter(Boolean); return ((w[0] || '?').charAt(0) + (w[1] ? w[1].charAt(0) : '')).toUpperCase(); }
function memberAv(m, size = 20) {
  const c = memberCol(m);
  return h('span', { class: 'mav', style: { width: size + 'px', height: size + 'px', background: c, color: onColor(c), fontSize: Math.round(size * 0.46) + 'px' } }, initials(m.name));
}
/** Кто отвечает за файл: его собственные ответственные, иначе ответственные за блок. */
const fileOwners = (n, f) => (f.owners && f.owners.length ? f.owners : n.owners || []);
function nodeMemberIds(n) {
  const s = new Set(n.owners || []);
  (n.files || []).forEach(f => (f.owners || []).forEach(x => s.add(x)));
  if (!s.size && n.by) s.add(n.by);                 // ответственный не назначен: показываем того, кто блок создал
  return [...s].filter(id => memberById(id));
}
/** Все, кто причастен к блоку: ответственные, создатель блока и глав, последний правивший главу. */
function nodeAuthorIds(n) {
  const s = new Set(nodeMemberIds(n));
  if (n.by) s.add(n.by);
  (n.files || []).forEach(f => { if (f.by) s.add(f.by); if (f.ed) s.add(f.ed); });
  return [...s].filter(id => memberById(id));
}
const nextMemberColor = () => { const cols = COLOR_NAMES.filter(c => c !== 'gray'); return cols[P.members.length % cols.length]; };
function addMember(name, extra) {
  const m = Object.assign({ id: uid('m'), name: String(name || '').trim() || t('team.new'), color: nextMemberColor(), roles: [], contact: '', notes: '', credit: true }, extra || {});
  P.members.push(m); commit(true);
  return m;
}
function removeMember(id) {
  P.members = P.members.filter(m => m.id !== id);
  for (const n of P.nodes) { n.owners = (n.owners || []).filter(x => x !== id); n.files.forEach(f => { f.owners = (f.owners || []).filter(x => x !== id); }); }
  P.assets.forEach(a => { a.owners = (a.owners || []).filter(x => x !== id); });
  P.characters.forEach(c => { if (c.actor === id) c.actor = ''; });
  if (UI.mf === id) setMemberFilter(null);
  commit(true);
}

/* ---------- нагрузка ---------- */
function memberStats(m) {
  let nodes = 0, files = 0, done = 0, w = 0;
  for (const n of P.nodes) {
    if (n.type === 'note') continue;
    let mine = (n.owners || []).includes(m.id) || (!(n.owners || []).length && n.by === m.id);
    for (const f of n.files) if (fileOwners(n, f).includes(m.id)) { files++; mine = true; if (f.status === 'done') done++; w += STATUS_W[f.status] || 0; }
    if (mine) nodes++;
  }
  return { nodes, files, done, pct: files ? w / files : 0, assets: P.assets.filter(a => (a.owners || []).includes(m.id)).length, chars: P.characters.filter(c => c.actor === m.id) };
}

/* ---------- фильтр на карте ---------- */
function isDimmed(id) {
  if (UI.hits && !UI.hits.has(id)) return true;
  if (UI.mf) { const n = nodeById(id); if (n && !nodeAuthorIds(n).includes(UI.mf)) return true; }
  return false;
}
function setMemberFilter(id) {
  UI.mf = id && memberById(id) ? id : null;
  NODE_EL.forEach((el, nid) => el.classList.toggle('dim', isDimmed(nid)));
  renderFilterPill();
}
function renderFilterPill() {
  let el = $('#mf-pill');
  const m = UI.mf && memberById(UI.mf);
  if (!m) { if (el) el.remove(); return; }
  if (!el) { el = h('div', { id: 'mf-pill', class: 'mf-pill' }); $('#app').append(el); }
  el.replaceChildren(memberAv(m, 20), h('span', t('team.filter.pill', m.name)), h('button', { class: 'btn icon sm', 'data-tip': t('team.filter.off'), onclick: () => setMemberFilter(null) }, icon('x', 14)));
}
/** Значки участников на нижнем крае блока (в SVG). */
function memberBadgesG(ids, w, hgt, pl) {
  const g = s('g', { class: 'mbadges', 'pointer-events': 'none' });
  const R = 9.5, step = 15, show = ids.slice(0, 4), extra = ids.length - show.length;
  let x = w - 18 - R;
  if (extra > 0) { g.append(s('circle', { cx: x, cy: hgt, r: R, fill: pl.surface3 || pl.surface, stroke: pl.surface, 'stroke-width': 2 })); g.append(s('text', { x, y: hgt + 3.4, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: pl.text }, '+' + extra)); x -= step; }
  for (const id of show.slice().reverse()) {
    const m = memberById(id); if (!m) continue;
    const c = pl.colors[m.color] || pl.colors.blue;
    g.append(s('circle', { cx: x, cy: hgt, r: R, fill: c, stroke: pl.surface, 'stroke-width': 2 }));
    g.append(s('text', { x, y: hgt + 3.4, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: onColor(c) }, initials(m.name)));
    x -= step;
  }
  g.append(s('title', {}, ids.map(id => (memberById(id) || {}).name).filter(Boolean).join(', ')));
  return g;
}

/* ---------- выбор участников ---------- */
function newMemberDialog(then) {
  promptDlg({ title: t('team.new'), label: t('team.name'), value: '', ok: t('c.create') }).then(name => { if (!name) return; const m = addMember(name); if (REG && !REG.m.closed) renderReg(); then && then(m); });
}
/** Поле «ответственные»: плашки выбранных и кнопка «+». single — один человек (строка в obj[key]), иначе список id. */
function memberPicker(obj, key, onChange, { single = false } = {}) {
  const box = h('div', { class: 'chips mp' });
  const get = () => (single ? (obj[key] ? [obj[key]] : []) : (obj[key] || []));
  const set = ids => { obj[key] = single ? (ids[0] || '') : ids; onChange && onChange(); render(); };
  const render = () => {
    box.replaceChildren();
    get().forEach(id => {
      const m = memberById(id); if (!m) return;
      box.append(h('span', { class: 'chip on static mchip' }, memberAv(m, 18), m.name, h('button', { class: 'chip-x', onclick: () => set(get().filter(x => x !== id)) }, icon('x', 11, 2.6))));
    });
    box.append(h('button', { class: 'chip add', onclick: ev => open(ev.currentTarget) }, icon('plus', 13), get().length ? null : t('team.assign')));
  };
  const open = anchor => {
    const pop = h('div', { class: 'menu mp-pop' });
    const fill = () => {
      pop.replaceChildren();
      if (!P.members.length) pop.append(h('div', { class: 'mhead' }, t('team.pick.none')));
      P.members.forEach(m => {
        const on = get().includes(m.id);
        pop.append(h('div', { class: 'mi' + (on ? ' on' : ''), onclick: () => { if (single) { closePopover(); set(on ? [] : [m.id]); } else { set(on ? get().filter(x => x !== m.id) : [...get(), m.id]); fill(); } } },
          memberAv(m, 20), h('span', { class: 'mi-l' }, m.name, m.roles.length ? h('span', { class: 'mi-sub' }, ' · ' + m.roles.map(roleLabel).slice(0, 2).join(', ')) : null), on ? icon('check', 15) : h('span', { class: 'mi-sp' })));
      });
      pop.append(h('div', { class: 'msep' }),
        h('div', { class: 'mi', onclick: () => { closePopover(); newMemberDialog(m => set(single ? [m.id] : [...get(), m.id])); } }, icon('plus', 16), h('span', { class: 'mi-l' }, t('team.pick.new'))),
        h('div', { class: 'mi', onclick: () => { closePopover(); openRegistry('team'); } }, icon('badge', 16), h('span', { class: 'mi-l' }, t('team.pick.manage'))));
    };
    fill();
    popover(anchor, pop, { cls: 'menu-pop' });
  };
  render();
  return box;
}

/* ---------- кнопка «Команда» на панели ---------- */
function openTeamMenu(anchor) {
  const items = [];
  if (!P.members.length) items.push({ header: t('team.none.short') });
  else {
    const me = meMember();
    items.push({ header: t('me.h') }, { label: me ? t('me.is', me.name) : t('me.pick'), icon: 'user', onClick: () => openMeDialog() });
    if (me) items.push({ label: UI.mf === me.id ? t('me.mine.off') : t('me.mine'), icon: UI.mf === me.id ? 'check' : 'eye', onClick: () => setMemberFilter(UI.mf === me.id ? null : me.id) });
    items.push({ sep: true }, { header: t('team.filter.h') });
    P.members.forEach(m => {
      const st = memberStats(m);
      items.push({ label: (m.name || '?') + '  ·  ' + st.nodes, icon: UI.mf === m.id ? 'check' : 'badge', onClick: () => setMemberFilter(UI.mf === m.id ? null : m.id) });
    });
    if (UI.mf) items.push({ label: t('team.filter.off'), icon: 'x', onClick: () => setMemberFilter(null) });
  }
  items.push({ sep: true }, { label: t('team.manage'), icon: 'users', onClick: () => openRegistry('team') }, { label: t('team.credits'), icon: 'list', onClick: () => openCredits() });
  menuAt(anchor, items);
}

/* ---------- вкладка реестра «Участники» ---------- */
function regTeam(st, list, qq) {
  const items = P.members.filter(m => !qq || (m.name + ' ' + m.contact + ' ' + m.notes + ' ' + m.roles.map(roleLabel).join(' ')).toLowerCase().includes(qq));
  if (typeof aclTeamCard === 'function') list.append(aclTeamCard());
  list.append(h('div', { class: 'team-top' },
    h('div', { class: 'hint' }, t('team.intro')),
    h('button', { class: 'btn', onclick: () => openCredits() }, icon('list', 16), t('team.credits'))));
  if (!items.length) list.append(h('div', { class: 'empty' }, t('team.none')));
  items.forEach(m => {
    const sw = h('button', { class: 'hsw sm', style: { background: memberCol(m) }, 'data-tip': t('tb.color'), onclick: ev => popover(ev.currentTarget, swatchRow(m.color, v => { m.color = v; commit(true); closePopover(); renderReg(); scheduleRender(); }, null), { cls: 'swatch-pop' }) });
    const stt = memberStats(m);
    const rolesBox = h('div', { class: 'chips' });
    const paintRoles = () => {
      rolesBox.replaceChildren();
      const custom = m.roles.filter(r => !r.startsWith('role:'));
      [...ROLE_PRESETS.map(k => 'role:' + k), ...custom].forEach(r => {
        const on = m.roles.includes(r);
        rolesBox.append(h('button', { class: 'chip' + (on ? ' on' : ''), onclick: () => { m.roles = on ? m.roles.filter(x => x !== r) : [...m.roles, r]; commit(true); paintRoles(); } }, roleLabel(r)));
      });
      const inp = h('input', { class: 'inp sm chip-in', type: 'text', placeholder: t('team.role.add') });
      const add = () => { const v = inp.value.trim().slice(0, 40); if (v && !m.roles.includes(v)) { m.roles.push(v); commit(true); paintRoles(); } else inp.value = ''; };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
      inp.addEventListener('blur', add);
      rolesBox.append(inp);
    };
    paintRoles();
    const bar = h('div', { class: 'team-bar' }, h('span', { style: { width: Math.round(stt.pct * 100) + '%', background: memberCol(m) } }));
    const parts = [];
    if (stt.nodes) parts.push(t('team.stat.blocks', stt.nodes));
    if (stt.files) parts.push(t('team.stat.files', stt.files, stt.done));
    if (stt.assets) parts.push(t('team.stat.assets', stt.assets));
    if (stt.chars.length) parts.push(t('team.stat.voice', stt.chars.map(c => c.name || c.tag).join(', ')));
    const nameInp = bindInput(m, 'name', { ph: t('team.name'), onChange: () => { commit(); scheduleRender(); } });
    list.append(regCard(m.id, [
      h('div', { class: 'grid2' }, field(t('team.name'), nameInp), field(t('team.contact'), bindInput(m, 'contact', { ph: t('team.contact.ph'), onChange: () => commit() }))),
      field(t('team.roles'), rolesBox),
      typeof aclMemberExtras === 'function' ? aclMemberExtras(m) : null,
      h('div', { class: 'team-load' }, h('div', { class: 'team-lt' }, parts.length ? parts.join(' · ') : t('team.stat.none')), stt.files ? bar : null),
      h('div', { class: 'team-acts' },
        h('button', { class: 'btn sm', onclick: () => { setMemberFilter(m.id); REG.m.close(); } }, icon('target', 14), t('team.show')),
        switchEl(m.credit !== false, v => { m.credit = v; commit(true); }, t('team.credit'))),
      field(t('team.notes'), bindInput(m, 'notes', { onChange: () => commit() }))
    ], {
      lead: h('div', { class: 'reg-ic team-ic' }, sw, memberAv(m, 30)),
      onDelete: async () => {
        const used = stt.nodes + stt.files + stt.assets + stt.chars.length;
        if (used && !(await confirmDlg({ title: t('team.del.q', m.name || '?'), text: t('team.del.t'), ok: t('c.delete'), danger: true }))) return;
        removeMember(m.id); renderReg(); scheduleRender();
      }
    }));
  });
}

/* ---------- титры ---------- */
/** Разделы титров: [{ head, lines:[...] }]. Роли берутся у участников; озвучка — из «Озвучивает» у персонажей. */
function creditsModel() {
  const act = P.members.filter(m => m.credit !== false && m.name.trim());
  const byRole = new Map();
  const add = (role, m) => { if (!byRole.has(role)) byRole.set(role, []); if (!byRole.get(role).includes(m)) byRole.get(role).push(m); };
  act.forEach(m => (m.roles.length ? m.roles : ['role:other']).forEach(r => add(r, m)));
  const order = [...ROLE_PRESETS.map(k => 'role:' + k), ...[...byRole.keys()].filter(r => !r.startsWith('role:')), 'role:other'];
  const out = [];
  for (const r of order) {
    if (r === 'role:voice') {
      const lines = [], seen = new Set();
      for (const c of P.characters) { const m = act.find(x => x.id === c.actor); if (m) { lines.push((c.name || c.tag) + ' — ' + m.name); seen.add(m.id); } }
      (byRole.get(r) || []).forEach(m => { if (!seen.has(m.id)) lines.push(m.name); });
      if (lines.length) out.push({ head: creditHead(r), lines });
      continue;
    }
    const ms = byRole.get(r);
    if (ms && ms.length) out.push({ head: creditHead(r), lines: ms.map(m => m.name) });
  }
  return out;
}
function creditsText() {
  const sec = creditsModel();
  if (!sec.length) return '';
  return [P.name, t('credits.head'), '', ...sec.flatMap(x => [x.head.toUpperCase(), ...x.lines, ''])].join('\n').trim() + '\n';
}
function openCredits() {
  const m = openModal({
    cls: 'credits-m', build: m => {
      const txt = creditsText();
      const prev = h('div', { class: 'credits-prev' });
      const sec = creditsModel();
      if (!sec.length) prev.append(h('div', { class: 'empty' }, t('credits.empty')));
      else {
        prev.append(h('div', { class: 'cr-title' }, P.name), h('div', { class: 'cr-sub' }, t('credits.head')));
        sec.forEach(x => prev.append(h('div', { class: 'cr-sec' }, h('div', { class: 'cr-h' }, x.head), ...x.lines.map(l => h('div', { class: 'cr-l' }, l)))));
      }
      return h('div', { class: 'm-wrap' }, modalHead(t('credits.title'), m),
        h('div', { class: 'm-pad' }, h('div', { class: 'hint' }, t('credits.h')), prev,
          h('div', { class: 'row-actions' }, h('button', { class: 'btn', onclick: () => { m.close(); openRegistry('team'); } }, icon('badge', 16), t('team.manage')), h('div', { class: 'grow' }),
            h('button', { class: 'btn', disabled: !txt, onclick: async () => toast(await copyText(txt) ? t('c.copied') : t('c.copyfail')) }, icon('copy', 16), t('credits.copy')),
            h('button', { class: 'btn primary', disabled: !txt, onclick: () => saveFile((slug(P.name) || 'project') + '-credits.txt', txt, 'text/plain') }, icon('download', 16), t('credits.save')))));
    }
  });
  return m;
}


/* ====== «Я — это…»: кто работает за этим компьютером ======
   Человек один раз выбирает себя в списке участников. Входы, которыми он пользуется (логин GitHub, аккаунт Claude), записываются участнику,
   и на других устройствах программа узнаёт его сама. Всё, что он создаёт или правит, подписывается его именем. */
Object.assign(D, {
  'me.h': ['Кто я в этом проекте', 'Who I am in this project'],
  'me.is': ['Я — {0} (сменить)', 'I am {0} (change)'], 'me.pick': ['Выбрать, кто я…', 'Choose who I am…'],
  'me.mine': ['Показать мои блоки', 'Show my blocks'], 'me.mine.off': ['Показать все блоки', 'Show all blocks'],
  'me.title': ['Кто я в этом проекте', 'Who I am in this project'],
  'me.intro': ['Выберите себя из участников. Блоки и главы, которые вы создаёте и правите, будут подписаны вашим именем, а на карте можно показать только свои. Выбор хранится на этом устройстве.', 'Pick yourself from the members. Blocks and chapters you create and edit will be signed with your name, and the map can show only yours. The choice is stored on this device.'],
  'me.ids': ['Ваши входы: {0}. Они запомнятся у участника, и на другом устройстве программа узнает вас сама.', 'Your sign-ins: {0}. They are saved for the member, and the app will recognise you on another device.'],
  'me.noids': ['Войдите в GitHub или в совместную комнату, чтобы программа могла узнавать вас на других устройствах.', 'Sign in to GitHub or a shared room so the app can recognise you on other devices.'],
  'me.add': ['Меня нет в списке: добавить…', 'I am not in the list: add…'], 'me.none': ['Это не я (сбросить)', 'None of these (reset)'],
  'me.auto': ['Программа узнала вас: {0}', 'The app recognised you: {0}'], 'me.done': ['Теперь вы — {0}', 'You are now {0}'],
  'me.by': ['создал: {0}', 'created by {0}'], 'me.ed': ['правил: {0}', 'edited by {0}'],
});
/** Чем человек сейчас «подписан» в совместной работе: логин GitHub, аккаунт Claude. */
function meIdentities() {
  const out = [];
  try { const lg = (typeof GHS !== 'undefined' && GHS.st && GHS.st.login) || ''; if (lg) out.push('gh:' + String(lg).toLowerCase()); } catch (e) { /* нет */ }
  try { const id = typeof CL !== 'undefined' && CL.me && CL.me.id; if (id) out.push('cl:' + id); } catch (e) { /* нет */ }
  return out;
}
function meId() {
  if (typeof P === 'undefined' || !P || !P.members) return '';
  const k = S.me && S.me[P.uid]; if (k && memberById(k)) return k;
  const ids = meIdentities();
  if (ids.length) { const m = P.members.find(x => (x.ids || []).some(i => ids.includes(i))); if (m) return m.id; }
  return '';
}
const meMember = () => memberById(meId());
function meSet(id) {
  if (id && typeof aclMayClaim === 'function' && !aclMayClaim(memberById(id))) { toast(t('acl.claim.no'), 4200); return false; }       // права: чужого участника с привязанным входом выбрать нельзя
  if (!S.me || typeof S.me !== 'object') S.me = {};
  if (!id) { delete S.me[P.uid]; saveSettings(); return; }
  S.me[P.uid] = id;
  const m = memberById(id); if (!m) return;
  const ids = meIdentities();
  if (ids.length) {                                 // входы привязываются к этому участнику и снимаются с других
    for (const x of P.members) if (x !== m) x.ids = (x.ids || []).filter(i => !ids.includes(i));
    m.ids = [...new Set([...(m.ids || []), ...ids])].slice(0, 6);
  }
  saveSettings(); commit(true); AUTH_SIG = null;
  return true;
}
/** Перед каждым шагом истории: главы, которые изменились после прошлого шага, подписываются тем, кто сейчас работает. */
const authSig = f => { const c = Object.assign({}, f); delete c.by; delete c.ed; delete c.edt; return JSON.stringify(c); };
function authStamp() {
  if (typeof P === 'undefined' || !P || (typeof GAME !== 'undefined' && GAME)) return;
  const me = meId(), first = !AUTH_SIG, next = new Map(), now = Date.now();
  for (const n of P.nodes) for (const f of n.files) {
    const sg = authSig(f); next.set(f.id, sg);
    if (!first && me) { const old = AUTH_SIG.get(f.id); if (old !== undefined && old !== sg) { f.ed = me; f.edt = now; } }
  }
  AUTH_SIG = next;
}
function openMeDialog() {
  closePopover();
  openModal({
    cls: 'dlg me-dlg', build: m => {
      const box = h('div', { class: 'dlg-body' });
      const paint = () => {
        const me = meId(), ids = meIdentities();
        box.replaceChildren(h('h3', t('me.title')), h('p', { class: 'hint' }, t('me.intro')),
          h('div', { class: 'me-list' }, P.members.map(x => h('button', { class: 'me-row' + (x.id === me ? ' on' : ''), onclick: () => { if (meSet(x.id) === false) return; toast(t('me.done', x.name), 2600); m.close(); if (REG && !REG.m.closed) renderReg(); if (typeof updateStatus === 'function') updateStatus(); } },
            memberAv(x, 26), h('span', { class: 'me-n' }, x.name, x.roles.length ? h('span', { class: 'mi-sub' }, ' · ' + x.roles.map(roleLabel).slice(0, 2).join(', ')) : null), x.id === me ? icon('check', 16) : null))),
          h('div', { class: 'hint' }, ids.length ? t('me.ids', ids.join(', ')) : t('me.noids')),
          h('div', { class: 'row-actions' },
            h('button', { class: 'btn', onclick: () => { m.close(); newMemberDialog(x => { meSet(x.id); toast(t('me.done', x.name), 2600); }); } }, icon('plus', 15), t('me.add')),
            me ? h('button', { class: 'btn', onclick: () => { meSet(''); paint(); } }, t('me.none')) : null,
            h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.close'))));
      };
      paint(); return box;
    }
  });
}
/** Подпись «создал / правил» для окна блока и подсказок. */
function nodeAuthorText(n) {
  const by = n.by && memberById(n.by), eds = [...new Set((n.files || []).map(f => f.ed).filter(Boolean))].map(memberById).filter(Boolean);
  const parts = []; if (by) parts.push(t('me.by', by.name)); if (eds.length) parts.push(t('me.ed', eds.map(x => x.name).join(', ')));
  return parts.join(' · ');
}

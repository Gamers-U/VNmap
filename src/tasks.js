'use strict';
/* ====== Задачи и сроки (корпоративный режим) ======
   Два вида работы: у блока можно поставить срок и приоритет (поля блока), а ещё есть отдельные задачи с привязкой к блоку (хоть «нарисовать фон»,
   хоть «записать голос»). Окно «Задачи»: «Мои» (что назначено вам, по срокам), «Все задачи» (ведут владелец и руководители) и «Сводка» (кто что должен, просрочено, нагрузка). */

Object.assign(D, {
  'tk.menu': ['Задачи и сроки', 'Tasks and deadlines'],
  'tk.need': ['Задачи работают в корпоративном режиме: Участники → Права доступа → режим «Корпоративный».', 'Tasks work in the corporate mode: Members → Access rights → “Corporate” mode.'],
  'tk.h': ['Задачи', 'Tasks'],
  'tk.tab.mine': ['Мои', 'Mine'], 'tk.tab.all': ['Все задачи', 'All tasks'], 'tk.tab.sum': ['Сводка', 'Summary'],
  'tk.st.new': ['Новая', 'New'], 'tk.st.doing': ['В работе', 'In progress'], 'tk.st.review': ['На проверке', 'In review'], 'tk.st.done': ['Готово', 'Done'],
  'tk.pri.0': ['Обычный', 'Normal'], 'tk.pri.1': ['Важный', 'Important'], 'tk.pri.2': ['Срочный', 'Urgent'], 'tk.pri': ['Приоритет', 'Priority'],
  'tk.due': ['Срок', 'Deadline'], 'tk.due.h': ['Дата, к которой блок должен быть готов.', 'The date by which the block should be ready.'],
  'tk.b.over': ['Просрочено', 'Overdue'], 'tk.b.today': ['Сегодня', 'Today'], 'tk.b.week': ['На этой неделе', 'This week'], 'tk.b.later': ['Позже', 'Later'], 'tk.b.none': ['Без срока', 'No deadline'], 'tk.b.done': ['Готово', 'Done'],
  'tk.in': ['через {0} дн.', 'in {0} d'], 'tk.ago': ['просрочено на {0} дн.', '{0} d overdue'], 'tk.today': ['сегодня', 'today'], 'tk.tmr': ['завтра', 'tomorrow'],
  'tk.status': ['Статус', 'Status'],
  'tk.untitled': ['Без названия', 'Untitled'], 'tk.block': ['Блок', 'Block'], 'tk.block.none': ['— не привязана к блоку —', '— not tied to a block —'],
  'tk.new': ['Новая задача', 'New task'], 'tk.add': ['Добавить задачу', 'Add a task'], 'tk.del': ['Удалить задачу', 'Delete task'],
  'tk.title.ph': ['Что нужно сделать', 'What needs doing'], 'tk.who': ['Исполнители', 'Assignees'], 'tk.notes': ['Комментарий', 'Comment'],
  'tk.mine.none': ['Вам ничего не назначено. Задачи ставят владелец и руководители.', 'Nothing is assigned to you. The owner and project leads set tasks.'],
  'tk.noMe': ['Выберите себя в «Кто я в этом проекте», чтобы видеть свои задачи.', 'Choose yourself in “Who I am in this project” to see your tasks.'],
  'tk.none': ['Задач пока нет.', 'No tasks yet.'],
  'tk.show.done': ['Показывать готовые', 'Show finished'],
  'tk.open': ['Открыть блок', 'Open the block'],
  'tk.from.block': ['срок блока', 'block deadline'],
  'tk.sum.open': ['Открыто', 'Open'], 'tk.sum.over': ['Просрочено', 'Overdue'], 'tk.sum.done': ['Готово', 'Done'], 'tk.sum.nobody': ['Без исполнителя', 'Unassigned'],
  'tk.sum.who': ['Кто', 'Who'], 'tk.sum.next': ['Ближайший срок', 'Next deadline'],
  'tk.sum.overdue.h': ['Просроченное', 'Overdue items'], 'tk.sum.none': ['Просроченного нет.', 'Nothing is overdue.'],
  'tk.sum.hint': ['В сводку входят задачи и блоки со сроком. Блок считается готовым, когда все его файлы в статусе «Готово».', 'The summary counts tasks and blocks that have a deadline. A block is finished when all its files are “Done”.'],
  'tk.ro': ['Задачи ведут владелец и руководители; свою задачу вы можете двигать по статусам и писать к ней комментарий.', 'The owner and project leads manage tasks; you can move your own task through the statuses and comment on it.'],
  'tk.filter.who': ['Исполнитель', 'Assignee'], 'tk.filter.all': ['Все', 'All'], 'acl.area.tasks': ['задачи и сроки', 'tasks and deadlines'],
});

const TASK_ST = ['new', 'doing', 'review', 'done'];
const taskDueOk = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00'));
const tasksOn = () => aclOn() && !!(P.acl && P.acl.corp);
const pad2 = n => String(n).padStart(2, '0');
const isoOf = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const todayIso = () => isoOf(new Date());
const dayDiff = iso => Math.round((Date.parse(iso + 'T00:00:00') - Date.parse(todayIso() + 'T00:00:00')) / 86400000);
const blockDone = n => !!n && n.files.length > 0 && n.files.every(f => f.status === 'done');
const blockTitle = n => (n && (n.title || '').trim()) || t('tk.untitled');
/** Вёдра по сроку: просрочено, сегодня, эта неделя, позже, без срока. */
function taskBucket(due) { if (!due) return 'none'; const d = dayDiff(due); return d < 0 ? 'over' : d === 0 ? 'today' : d <= 7 ? 'week' : 'later'; }
function dueText(due) {
  if (!due) return '';
  const d = dayDiff(due);
  const rel = d < 0 ? t('tk.ago', -d) : d === 0 ? t('tk.today') : d === 1 ? t('tk.tmr') : t('tk.in', d);
  return due.split('-').reverse().join('.') + ' · ' + rel;
}
/** Все единицы работы: задачи и блоки со сроком. */
function taskItems() {
  const out = [];
  for (const q of P.tasks) out.push({ kind: 'task', id: q.id, title: q.title || t('tk.untitled'), node: q.node, who: q.who || [], due: q.due, st: q.st, pri: q.pri || 0, done: q.st === 'done', ref: q });
  for (const n of P.nodes) if (n.due) out.push({ kind: 'block', id: n.id, title: blockTitle(n), node: n.id, who: n.owners || [], due: n.due, st: blockDone(n) ? 'done' : 'doing', pri: n.pri || 0, done: blockDone(n), ref: n });
  return out;
}
const taskCanManage = () => { const rt = aclRights(); return rt.all || rt.grant; };

/* ---------- поля срока и приоритета в окне блока ---------- */
function taskNodeFields(n, onChange) {
  const ok = taskCanManage() || aclCan('map');
  const box = h('div', { class: 'tk-nf' + (ok ? ' acl-keep' : '') });
  const di = h('input', { class: 'inp', type: 'date', value: n.due || '' });
  di.addEventListener('change', () => { if (taskDueOk(di.value)) n.due = di.value; else delete n.due; commit(true); onChange && onChange(); });
  const seg = segmented([0, 1, 2].map(v => ({ value: String(v), label: t('tk.pri.' + v) })), String(n.pri || 0), v => { if (+v) n.pri = +v; else delete n.pri; commit(true); onChange && onChange(); });
  box.append(field(t('tk.due'), di, t('tk.due.h')), field(t('tk.pri'), seg));
  return box;
}

/* ---------- окно «Задачи» ---------- */
function openTasks(tab) {
  if (!tasksOn()) { toast(t('tk.need'), 5200); return; }
  const st = { tab: tab || 'mine', showDone: false, who: '' };
  openModal({
    cls: 'tk-modal',
    build: m => {
      st.m = m; st.body = h('div', { class: 'tk-body' });
      const render = () => {
        const rt = aclRights(), mine = meMember();
        const tabs = [{ value: 'mine', label: t('tk.tab.mine') }, { value: 'all', label: t('tk.tab.all') }];
        if (rt.all || rt.grant) tabs.push({ value: 'sum', label: t('tk.tab.sum') });
        if (!tabs.some(x => x.value === st.tab)) st.tab = 'mine';
        st.body.replaceChildren(segmented(tabs, st.tab, v => { st.tab = v; render(); }), h('div', { class: 'tk-pane' }, st.tab === 'mine' ? tkMine(st, mine, render) : st.tab === 'all' ? tkAll(st, render) : tkSum(st, render)));
      };
      st.render = render; render();
      return h('div', { class: 'm-wrap' }, modalHead(t('tk.h'), m), st.body);
    },
  });
}
function tkRow(it, st, render, canEditSt) {
  const row = h('div', { class: 'tk-row' + (it.done ? ' done' : '') });
  row.append(h('span', { class: 'tk-pri p' + (it.pri || 0), title: t('tk.pri.' + (it.pri || 0)) }));
  const nd = it.node ? nodeById(it.node) : null;
  const main = h('div', { class: 'tk-main' }, h('div', { class: 'tk-t' }, it.title), h('div', { class: 'tk-s' },
    it.kind === 'block' ? h('span', { class: 'chip static' }, t('tk.from.block')) : null,
    nd && it.kind !== 'block' ? h('button', { class: 'chip', onclick: () => { st.m.close(); focusNode(nd.id, { open: true }); } }, icon('layers', 12), blockTitle(nd)) : null,
    it.due ? h('span', { class: 'tk-due b-' + (it.done ? 'none' : taskBucket(it.due)) }, dueText(it.due)) : null,
    (it.who || []).map(id => memberById(id)).filter(Boolean).map(mm => h('span', { class: 'chip static' }, memberAv(mm, 14), mm.name))));
  row.append(main);
  if (it.kind === 'task') {
    const sel = h('select', { class: 'inp tk-st' }, TASK_ST.map(v => h('option', { value: v, selected: it.st === v }, t('tk.st.' + v))));
    sel.addEventListener('change', () => { it.ref.st = sel.value; commit(true); render(); });
    if (!canEditSt) sel.disabled = true;
    row.append(sel);
  } else row.append(h('button', { class: 'btn sm', onclick: () => { st.m.close(); focusNode(it.node, { open: true }); } }, icon('open', 14), t('tk.open')));
  return row;
}
const BUCKETS = ['over', 'today', 'week', 'later', 'none', 'done'];
function tkMine(st, me, render) {
  const wrap = h('div', { class: 'tk-list' });
  if (!me) { wrap.append(h('div', { class: 'hint' }, t('tk.noMe'))); return wrap; }
  const sw = switchEl(st.showDone, v => { st.showDone = v; render(); }, t('tk.show.done'));
  const items = taskItems().filter(i => (i.who || []).includes(me.id) && (st.showDone || !i.done));
  wrap.append(h('div', { class: 'tk-tools' }, sw));
  if (!items.length) { wrap.append(h('div', { class: 'hint' }, t('tk.mine.none'))); return wrap; }
  const ord = (a, b) => (b.pri - a.pri) || String(a.due || '9').localeCompare(String(b.due || '9'));
  for (const bk of BUCKETS) {
    const all = items.filter(i => (i.done ? 'done' : taskBucket(i.due)) === bk).sort(ord);
    if (!all.length) continue;
    wrap.append(h('div', { class: 'tk-bh b-' + bk }, t('tk.b.' + bk), h('span', { class: 'tk-n' }, String(all.length))));
    for (const it of all) wrap.append(tkRow(it, st, render, true));
  }
  return wrap;
}
function tkAll(st, render) {
  const can = taskCanManage(), wrap = h('div', { class: 'tk-list' });
  const whoSel = h('select', { class: 'inp' }, [h('option', { value: '' }, t('tk.filter.all'))].concat(P.members.map(m => h('option', { value: m.id, selected: st.who === m.id }, m.name))));
  whoSel.addEventListener('change', () => { st.who = whoSel.value; render(); });
  const add = h('button', { class: 'btn primary sm', disabled: !can, onclick: () => {
    const me = meMember(); P.tasks.unshift({ id: uid('q'), title: '', node: '', who: [], due: '', st: 'new', pri: 0, notes: '', by: me ? me.id : '', at: Date.now() });
    commit(true); render();
  } }, icon('plus', 14), t('tk.add'));
  wrap.append(h('div', { class: 'tk-tools' }, h('label', { class: 'tk-flt' }, h('span', t('tk.filter.who')), whoSel), h('div', { class: 'grow' }), add));
  if (!can) wrap.append(h('div', { class: 'hint' }, t('tk.ro')));
  const list = P.tasks.filter(q => !st.who || (q.who || []).includes(st.who));
  if (!list.length) { wrap.append(h('div', { class: 'hint' }, t('tk.none'))); return wrap; }
  for (const q of list) wrap.append(tkCard(q, st, render, can));
  return wrap;
}
function tkCard(q, st, render, can) {
  const mine = meMember(), isMine = !!mine && (q.who || []).includes(mine.id);
  const card = h('div', { class: 'reg-card tk-card' });
  const ti = h('input', { class: 'inp', value: q.title, placeholder: t('tk.title.ph') });
  ti.addEventListener('input', () => { q.title = ti.value; commit(); });
  const nodeSel = h('select', { class: 'inp' }, [h('option', { value: '' }, t('tk.block.none'))].concat(P.nodes.map(n => h('option', { value: n.id, selected: q.node === n.id }, blockTitle(n)))));
  nodeSel.addEventListener('change', () => { q.node = nodeSel.value; commit(true); });
  const di = h('input', { class: 'inp', type: 'date', value: q.due || '' });
  di.addEventListener('change', () => { q.due = taskDueOk(di.value) ? di.value : ''; commit(true); render(); });
  const priSel = h('select', { class: 'inp' }, [0, 1, 2].map(v => h('option', { value: String(v), selected: (q.pri || 0) === v }, t('tk.pri.' + v))));
  priSel.addEventListener('change', () => { q.pri = +priSel.value; commit(true); render(); });
  const stSel = h('select', { class: 'inp' }, TASK_ST.map(v => h('option', { value: v, selected: q.st === v }, t('tk.st.' + v))));
  stSel.addEventListener('change', () => { q.st = stSel.value; commit(true); render(); });
  const ni = h('textarea', { class: 'inp', rows: '2' }, q.notes || '');
  ni.addEventListener('input', () => { q.notes = ni.value; commit(); });
  const del = h('button', { class: 'btn icon sm danger-t', title: t('tk.del'), onclick: () => { P.tasks = P.tasks.filter(x => x.id !== q.id); commit(true); render(); } }, icon('trash', 14));
  const manage = h('div', { class: 'tk-fields' }, field(t('tk.block'), nodeSel), field(t('tk.who'), memberPicker(q, 'who', () => { commit(true); render(); })), field(t('tk.due'), di), field(t('tk.pri'), priSel));
  if (!can) aclFreeze(manage);
  if (!can && !isMine) { stSel.disabled = true; ni.readOnly = true; }
  card.append(h('div', { class: 'reg-body' }, h('div', { class: 'tk-top' }, can ? ti : h('div', { class: 'tk-t' }, q.title || t('tk.untitled')), can ? del : null), manage, h('div', { class: 'tk-fields' }, field(t('tk.status'), stSel), field(t('tk.notes'), ni))));
  if (!can) ti.readOnly = true;
  return card;
}
function tkSum(st, render) {
  const wrap = h('div', { class: 'tk-list' }), items = taskItems(), open = items.filter(i => !i.done);
  const over = open.filter(i => i.due && dayDiff(i.due) < 0);
  const stat = (lab, n, cls) => h('div', { class: 'tk-stat ' + (cls || '') }, h('b', String(n)), h('span', lab));
  wrap.append(h('div', { class: 'tk-stats' }, stat(t('tk.sum.open'), open.length), stat(t('tk.sum.over'), over.length, over.length ? 'bad' : ''), stat(t('tk.sum.done'), items.filter(i => i.done).length), stat(t('tk.sum.nobody'), open.filter(i => !(i.who || []).length).length, open.some(i => !(i.who || []).length) ? 'warn' : '')));
  const rows = P.members.map(m => {
    const my = items.filter(i => (i.who || []).includes(m.id)), o = my.filter(i => !i.done), ov = o.filter(i => i.due && dayDiff(i.due) < 0);
    const next = o.filter(i => i.due).map(i => i.due).sort()[0] || '';
    return { m, open: o.length, over: ov.length, done: my.length - o.length, next };
  }).filter(r => r.open || r.done).sort((a, b) => (b.over - a.over) || (b.open - a.open));
  const mx = Math.max(1, ...rows.map(r => r.open));
  const tbl = h('div', { class: 'tk-tbl' }, h('div', { class: 'tk-tr hd' }, h('span', t('tk.sum.who')), h('span', t('tk.sum.open')), h('span', t('tk.sum.over')), h('span', t('tk.sum.done')), h('span', t('tk.sum.next'))));
  for (const r of rows) tbl.append(h('div', { class: 'tk-tr' }, h('span', { class: 'tk-who' }, memberAv(r.m, 18), r.m.name), h('span', h('i', { class: 'tk-bar', style: { width: Math.round(60 * r.open / mx) + 'px' } }), String(r.open)), h('span', { class: r.over ? 'bad' : '' }, String(r.over)), h('span', String(r.done)), h('span', r.next ? dueText(r.next) : '—')));
  wrap.append(rows.length ? tbl : h('div', { class: 'hint' }, t('tk.none')));
  wrap.append(h('div', { class: 'tk-bh b-over' }, t('tk.sum.overdue.h'), h('span', { class: 'tk-n' }, String(over.length))));
  if (!over.length) wrap.append(h('div', { class: 'hint' }, t('tk.sum.none')));
  for (const it of over.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 15)) wrap.append(tkRow(it, st, render, taskCanManage()));
  wrap.append(h('div', { class: 'hint' }, t('tk.sum.hint')));
  return wrap;
}
TOOL_ITEMS.push({ id: 'tasks', group: 'team', ic: 'flag', key: 'tk.menu', kw: 'tasks deadline due todo corporate задачи сроки дедлайн корпоративный мои задачи сводка руководитель', run: () => openTasks() });

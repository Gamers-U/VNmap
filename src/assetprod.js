'use strict';
/* ====== Статус работы над ресурсами (1.6.8) ======
   Ресурс в реестре (фон, спрайт, музыка, звук, озвучка) проходит путь: заказали → в работе → получили → вставили в игру.
   Это не то же самое, что «есть файл»: файл может быть только черновым, а заказанного ещё нет совсем. Поэтому у ресурса свой отдельный статус
   `a.prod = { st: 'ordered'|'work'|'got'|'done', due: 'ГГГГ-ММ-ДД' }`. Исполнитель — те же «ответственные» ресурса (`a.owners`).
   Статус виден и меняется в карточке ресурса в реестре и прямо в списке ресурсов; есть фильтр, сводка, просрочено и выгрузка.
   Когда в ресурс загружается файл, а статус «Заказано» или «В работе», он сам становится «Получено». Всё остальное статус не трогает.
   Хранится в проекте, сливается по полям при слиянии и попадает в историю изменений. */

Object.assign(D, {
  'pd.status': ['Статус работы', 'Work status'],
  'pd.st.none': ['Без статуса', 'No status'],
  'pd.st.ordered': ['Заказано', 'Ordered'],
  'pd.st.work': ['В работе', 'In progress'],
  'pd.st.got': ['Получено', 'Received'],
  'pd.st.done': ['Вставлено', 'In the game'],
  'pd.st.over': ['Просрочено', 'Overdue'],
  'pd.st.any': ['Любая', 'Any'],
  'pd.f.lab': ['Работа', 'Work'],
  'pd.due': ['Срок', 'Deadline'],
  'pd.due.t': ['Срок готовности ресурса', 'When the resource is due'],
  'pd.over.t': ['Срок прошёл, а ресурс ещё не получен: {0}', 'The deadline has passed and the resource is not received yet: {0}'],
  'pd.nofile.t': ['Отмечено как «получено» или «вставлено», но файла в реестре нет', 'Marked as received or in the game, but there is no file in the registry'],
  'pd.nofile': ['файла нет', 'no file'],
  'pd.who.t': ['Исполнитель', 'Performer'],
  'pd.sum.lab': ['Работа над ресурсами', 'Work on resources'],
  'pd.sum.over': ['просрочено {0}', 'overdue {0}'],
  'pd.reg.h': ['Ход работы над ресурсом: заказали, в работе, получили, вставили в игру. Исполнитель выбирается выше («Автор / ответственный»). Когда в ресурс загружается файл, статус «Заказано» и «В работе» сам меняется на «Получено».', 'The progress of the resource: ordered, in progress, received, put into the game. The performer is chosen above (“Author / owner”). When a file is uploaded, the status “Ordered” or “In progress” becomes “Received” by itself.'],
  'pd.auto': ['«{0}»: файл загружен, статус теперь «Получено»', '“{0}”: the file is uploaded, the status is now “Received”'],
  'pd.until': ['до {0}', 'by {0}'], 'pd.status.due': ['Статус работы и срок', 'Work status and deadline'],
  'pd.col.st': ['Статус работы', 'Work status'], 'pd.col.who': ['Исполнитель', 'Performer'], 'pd.col.due': ['Срок', 'Deadline'],
});

const PROD_ST = ['ordered', 'work', 'got', 'done'];
/** Приводит поле к виду { st, due }; пусто, если нечего хранить. */
function prodClean(p) {
  if (!p || typeof p !== 'object') return null;
  const st = PROD_ST.includes(p.st) ? p.st : '', due = typeof taskDueOk === 'function' && taskDueOk(p.due) ? p.due : '';
  return st || due ? { st, due } : null;
}
const prodSt = a => (a && a.prod && a.prod.st) || '';
const prodDue = a => (a && a.prod && a.prod.due) || '';
/** Срок прошёл, а ресурс ещё не получен. */
const prodOver = a => { const d = prodDue(a), s = prodSt(a); return !!d && s !== 'got' && s !== 'done' && dayDiff(d) < 0; };
/** Записать статус и/или срок; пустые значения убирают поле целиком. */
function prodSet(a, patch) {
  const c = prodClean(Object.assign({ st: prodSt(a), due: prodDue(a) }, patch));
  if (c) a.prod = c; else delete a.prod;
  commit(true);
}
/** Файл загружен: «Заказано» и «В работе» становятся «Получено» (для спрайта: когда файлы есть у всех выражений). Возвращает true, если статус сменился. */
function prodOnFile(a) {
  const s = prodSt(a);
  if (s !== 'ordered' && s !== 'work') return false;
  const files = a.files || {};
  if (a.kind === 'sprite' && a.expr && a.expr.length && !a.expr.every(e => files[e])) return false;
  if (!Object.values(files).some(Boolean)) return false;
  a.prod = { st: 'got', due: prodDue(a) };
  return true;
}
const prodMatch = (a, f) => f === 'all' || (f === 'over' ? prodOver(a) : f === 'none' ? !prodSt(a) : prodSt(a) === f);
const prodName = s => t('pd.st.' + (s || 'none'));

/** Выбор статуса и срока. a — ресурс или null (тогда ресурс заводится в реестре при первом изменении, ensure его создаёт). */
function prodControls(a, ensure, repaint) {
  const get = () => a || (ensure && ensure()) || null;
  const s = prodSt(a), over = prodOver(a);
  const sel = h('select', { class: 'inp sm pd-sel p-' + (s || 'none'), 'aria-label': t('pd.status'), 'data-tip': t('pd.status') }, ...['', ...PROD_ST].map(v => h('option', { value: v }, prodName(v))));
  sel.value = s;
  sel.addEventListener('change', () => { const x = get(); if (!x) return; prodSet(x, { st: sel.value }); repaint && repaint(x); });
  const di = h('input', { class: 'inp sm pd-due' + (over ? ' over' : ''), type: 'date', value: prodDue(a), 'aria-label': t('pd.due'), 'data-tip': over ? t('pd.over.t', dueText(prodDue(a))) : t('pd.due.t') });
  di.addEventListener('change', () => { const x = get(); if (!x) return; prodSet(x, { due: taskDueOk(di.value) ? di.value : '' }); repaint && repaint(x); });
  return h('div', { class: 'pd-ctl' }, sel, di);
}
/** Поля для карточки ресурса в реестре. */
function prodFields(a, onChange) {
  const box = h('div', { class: 'pd-reg' });
  const paint = () => { box.replaceChildren(h('div', { class: 'grid2' }, field(t('pd.status.due'), prodControls(a, null, () => { onChange && onChange(); paint(); })), h('div', { class: 'field' }, h('div', { class: 'hint pd-hint' }, t('pd.reg.h'))))); };
  paint();
  return box;
}
/** Имена исполнителей (ответственных за ресурс) через запятую. */
const prodWho = a => ((a && a.owners) || []).map(id => (memberById(id) || {}).name).filter(Boolean).join(', ');
/** Хвост строки чек-листа: [В работе, Лена, до 20.11.2026]. */
function prodSuffix(a) {
  const p = [];
  if (prodSt(a)) p.push(prodName(prodSt(a)));
  const w = prodWho(a); if (w) p.push(w);
  if (prodDue(a)) p.push(t('pd.until', prodDue(a).split('-').reverse().join('.')));
  return p.length ? ' · [' + p.join(', ') + ']' : '';
}
/** Строка под названием ресурса в списке ресурсов: статус, срок, исполнитель, предупреждения. u — элемент списка, repaint — перерисовать список. */
function prodLine(u, repaint) {
  const a = u.a;
  const ensure = () => { rsFillRegistry([Object.assign({}, u, { status: 'unreg', a: null })]); return P.assets.find(x => x.kind === u.kind && (x.name || '').toLowerCase() === u.name.toLowerCase()) || null; };
  const kids = [prodControls(a, ensure, repaint)];
  if (a) kids.push(h('div', { class: 'pd-who', 'data-tip': t('pd.who.t') }, memberPicker(a, 'owners', () => commit(true))));
  if ((prodSt(a) === 'got' || prodSt(a) === 'done') && u.status === 'nofile') kids.push(h('span', { class: 'pd-warn', 'data-tip': t('pd.nofile.t') }, icon('alert', 12), t('pd.nofile')));
  if (prodOver(a)) kids.push(h('span', { class: 'pd-warn over', 'data-tip': t('pd.over.t', dueText(prodDue(a))) }, icon('alert', 12), t('pd.st.over')));
  return h('div', { class: 'pd-line' }, ...kids);
}

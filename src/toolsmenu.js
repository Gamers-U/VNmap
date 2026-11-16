'use strict';
/* ====== Меню «Инструменты»: сюда подключаются все новые возможности, чтобы верхняя панель не разрасталась ====== */
Object.assign(D, {
  'tools.btn': ['Инструменты', 'Tools'],
  'tools.tip': ['Расстановка узлов, проверки сюжета, таблица реплик и другое', 'Arranging nodes, story checks, the replica table and more'],
});
/** Пункты меню: { id, group, ic, key (ключ перевода), kbd?, run(anchor) }. Модули добавляют себя при загрузке. */
const TOOL_ITEMS = [];
function toolsMenu(anchor) {
  const items = []; let last = null;
  for (const x of TOOL_ITEMS) {
    if (typeof uiShow === 'function' && !uiShow(x.id)) continue;               // режим интерфейса (uimode.js)
    if (last !== null && x.group !== last) items.push({ sep: true });
    last = x.group;
    items.push({ label: t(x.key), icon: x.ic, kbd: x.kbd, onClick: () => setTimeout(() => x.run(anchor), 0) });
  }
  return menuAt(anchor, items);
}

'use strict';
/* ====== Меню «Инструменты»: сюда подключаются все новые возможности, чтобы верхняя панель не разрасталась ====== */
Object.assign(D, {
  'tools.btn': ['Инструменты', 'Tools'],
  'tools.tip': ['Всё, чего нет на виду в разделах: импорт .rpy и функции скрытых разделов', 'Everything that is not in view in the sections: .rpy import and the features of hidden sections'],
});
/** Пункты меню: { id, group, ic, key (ключ перевода), kbd?, run(anchor) }. Модули добавляют себя при загрузке. */
const TOOL_ITEMS = [];
/** Меню «Инструменты»: всё, чего сейчас нет на виду в разделах (uimode.js). */
function toolsMenu(anchor) { return uiToolsMenu(anchor); }

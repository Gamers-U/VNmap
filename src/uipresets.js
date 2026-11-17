'use strict';
/* ====== Наборы: настроить интерфейс одним выбором ======
   Новому человеку незачем разбираться в режимах и модулях. Набор выставляет режим (простой или профессиональный) и выключает
   модули, которые ему не нужны. Ничего не удаляется: всё включается обратно в «Настройки → Модули» или другим набором.
   Простой режим сам по себе уже прячет редкое под кнопку «Ещё», поэтому в наборе «Только пишу» ничего не выключено.
   При первом запуске программа один раз показывает небольшую карточку с выбором (она не закрывает карту и не блокирует работу). */

Object.assign(D, {
  'ui.preset': ['Готовые наборы', 'Ready-made sets'],
  'ui.preset.h': ['Один выбор сразу настраивает панель. Потом всё можно поправить вручную: «Вид и режим», «Панель», «Модули».',
    'One choice sets up the toolbar at once. Afterwards you can adjust everything by hand: "Look and mode", "Toolbar", "Modules".'],
  'ui.preset.write': ['Только пишу', 'Just writing'],
  'ui.preset.write.h': ['Главное на панели, остальное под «Ещё». Без команды и переводов.', 'The essentials on the toolbar, the rest under "More". No team or translation.'],
  'ui.preset.build': ['Пишу и собираю игру', 'Writing and building the game'],
  'ui.preset.build.h': ['Все разделы на панели. Без команды и переводов.', 'All sections on the toolbar. No team or translation.'],
  'ui.preset.team': ['Работаю с командой', 'Working with a team'],
  'ui.preset.team.h': ['Все разделы на панели, ничего не спрятано.', 'All sections on the toolbar, nothing hidden.'],
  'ui.preset.custom': ['Сейчас ни один набор не выбран: режим и модули стоят по умолчанию или настроены вручную', 'No set is chosen at the moment: the mode and modules are at their defaults or were set by hand'],
  'ui.preset.q': ['Что вам понадобится?', 'What will you need?'],
  'ui.preset.q.p': ['Выберите набор или отметьте нужное. Неотмеченное спрячется; вернуть можно в любой момент: Настройки → Вид и режим, Модули.', 'Pick a set or tick what you need. Whatever is unticked gets hidden; you can bring it back any time: Settings → Look and mode, Modules.'],
  'ui.preset.or': ['Или отметьте сами', 'Or tick it yourself'],
  'ui.quiz.base': ['Карта и текст сюжета', 'Story map and text'],
  'ui.quiz.base.h': ['Нужны всегда.', 'Always needed.'],
  'ui.quiz.analysis': ['Разбор сюжета', 'Story analysis'],
  'ui.quiz.analysis.h': ['Ветки и время, переменные, статистика.', 'Branches and time, variables, statistics.'],
  'ui.quiz.team': ['Работа с другими людьми', 'Working with other people'],
  'ui.quiz.team.h': ['Роли, задачи, проверка правок, совместная работа.', 'Roles, tasks, review of edits, collaboration.'],
  'ui.quiz.translate': ['Переводы игры', 'Game translations'],
  'ui.quiz.translate.h': ['Реплики и озвучка на других языках.', 'Lines and voice-over in other languages.'],
  'ui.quiz.pro': ['Все разделы на панели', 'All sections on the toolbar'],
  'ui.quiz.pro.h': ['Карта, Тексты, Проверки, Игра… Без галочки на панели только главное.', 'Map, Texts, Checks, Game… Unticked, only the essentials are on the toolbar.'],
  'ui.quiz.apply': ['Применить', 'Apply'],
  'ui.preset.keep': ['Оставить как есть', 'Keep as it is'],
  'ui.preset.done': ['Набор «{0}» включён', 'Set "{0}" is on'],
  'ui.quiz.done': ['Панель настроена', 'The toolbar is set up'],
});

const UI_PRESETS = {
  write: { mode: 'simple', off: ['team', 'collab', 'translate'] },
  build: { mode: 'pro', off: ['team', 'collab', 'translate'] },
  team: { mode: 'pro', off: [] },
};
/** Вопросник первого запуска: каждая галочка включает или выключает свои модули. «Все разделы на панели» — это режим. */
const UI_QUIZ = [
  { id: 'analysis', mods: ['analysis'] },
  { id: 'team', mods: ['team', 'collab'] },
  { id: 'translate', mods: ['translate'] },
  { id: 'pro', mode: true },
];
const UI_PRESET_IDS = ['write', 'build', 'team'];

/** Какой набор сейчас включён: по режиму и выключенным модулям. null, если настроено вручную. */
function uiPresetNow() {
  const c = uiCfg(), off = Object.keys(c.off || {}).filter(k => c.off[k]).sort().join(',');
  for (const id of UI_PRESET_IDS) { const p = UI_PRESETS[id]; if (p.mode === c.mode && p.off.slice().sort().join(',') === off) return id; }
  return null;
}
function uiApplyPreset(id, quiet) {
  const p = UI_PRESETS[id]; if (!p) return;
  const c = uiCfg();
  c.mode = p.mode; c.off = {}; for (const m of p.off) c.off[m] = true;
  saveSettings(); closePopover(); buildChrome(); updateStatus();
  if (!quiet) toast(t('ui.preset.done', t('ui.preset.' + id)));
}
/** Три карточки выбора набора. onPick вызывается после применения. */
function uiPresetOptions(onPick) {
  const now = uiPresetNow();
  return h('div', { class: 'preset-grid' }, UI_PRESET_IDS.map(id => h('button', { class: 'preset-opt' + (now === id ? ' on' : ''), 'data-preset': id, 'aria-pressed': String(now === id),
    onclick: () => { uiApplyPreset(id); if (onPick) onPick(id); } }, h('b', t('ui.preset.' + id)), h('span', t('ui.preset.' + id + '.h')))));
}
/** Блок для «Настройки → Вид и режим». */
function uiPresetBlock(render) {
  const now = uiPresetNow();
  return setCard(t('ui.preset'), h('div', { class: 'hint' }, t('ui.preset.h')), uiPresetOptions(() => render && render()), now ? null : h('div', { class: 'hint' }, t('ui.preset.custom')));
}
/** Карточка первого запуска: плавает в углу, карту не закрывает и работу не блокирует. Сверху готовые наборы (применяются сразу),
    ниже вопросник с галочками (применяется кнопкой). */
function uiPresetCard() {
  if (document.querySelector('.ui-preset-card')) return;
  const close = () => { card.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const q = {}, w = UI_PRESETS.write;                                                    // галочки сначала стоят как в наборе «Только пишу»
  for (const x of UI_QUIZ) q[x.id] = x.mode ? w.mode === 'pro' : !w.off.includes(x.mods[0]);
  const rows = UI_QUIZ.map(x => h('label', { class: 'upc-chk' },
    h('input', { type: 'checkbox', 'data-q': x.id, checked: q[x.id], onchange: e => { q[x.id] = e.target.checked; } }),
    h('span', h('b', t('ui.quiz.' + x.id)), h('small', t('ui.quiz.' + x.id + '.h')))));
  const base = h('label', { class: 'upc-chk locked' }, h('input', { type: 'checkbox', checked: true, disabled: true }), h('span', h('b', t('ui.quiz.base')), h('small', t('ui.quiz.base.h'))));
  const apply = () => {
    const cfg = uiCfg(); cfg.mode = q.pro ? 'pro' : 'simple'; cfg.off = {};
    for (const x of UI_QUIZ) if (!x.mode && !q[x.id]) for (const m of x.mods) cfg.off[m] = true;
    saveSettings(); closePopover(); buildChrome(); updateStatus(); toast(t('ui.quiz.done')); close();
  };
  const card = h('div', { class: 'ui-preset-card', role: 'dialog', 'aria-label': t('ui.preset.q') },
    h('b', { class: 'upc-h' }, t('ui.preset.q')), h('div', { class: 'hint' }, t('ui.preset.q.p')),
    uiPresetOptions(close),
    h('div', { class: 'upc-or' }, t('ui.preset.or')),
    h('div', { class: 'upc-quiz' }, base, ...rows),
    h('div', { class: 'upc-row' },
      h('button', { class: 'btn sm', id: 'upc-tour', onclick: () => { close(); if (typeof tourGeneral === 'function') setTimeout(() => tourGeneral(), 80); } }, icon('sparkles', 14), t('tour.first')),
      h('span', { class: 'upc-end' },
        h('button', { class: 'btn sm', id: 'upc-keep', onclick: close }, t('ui.preset.keep')),
        h('button', { class: 'btn sm primary', id: 'upc-apply', onclick: apply }, t('ui.quiz.apply')))));
  document.body.append(card);
  document.addEventListener('keydown', onKey, true);
}

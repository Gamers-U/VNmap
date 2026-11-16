'use strict';
/* ====== Наборы: настроить интерфейс одним выбором ======
   Новому человеку незачем разбираться в режимах и модулях. Набор выставляет режим (простой или профессиональный) и выключает
   модули, которые ему не нужны. Ничего не удаляется: всё включается обратно в «Настройки → Модули» или другим набором.
   Простой режим сам по себе уже прячет редкое под кнопку «Ещё», поэтому в наборе «Только пишу» ничего не выключено.
   При первом запуске программа один раз показывает небольшую карточку с выбором (она не закрывает карту и не блокирует работу). */

Object.assign(D, {
  'ui.preset': ['Набор', 'Preset'],
  'ui.preset.h': ['Один выбор настраивает режим и ненужные модули. Потом всё можно поправить вручную: «Вид и режим», «Панель», «Модули».',
    'One choice sets the mode and the unneeded modules. Afterwards you can adjust everything by hand: "Look and mode", "Toolbar", "Modules".'],
  'ui.preset.write': ['Только пишу', 'Just writing'],
  'ui.preset.write.h': ['Простой режим: на панели главное, остальное под «Ещё». Ничего не выключено.', 'Simple mode: the essentials on the toolbar, the rest under "More". Nothing is switched off.'],
  'ui.preset.build': ['Пишу и собираю в Ren\'Py', 'Writing and building in Ren\'Py'],
  'ui.preset.build.h': ['Профессиональный режим: все разделы на виду. Выключены команда, переводы и совместная работа.', 'Professional mode: all sections in plain view. Team, translation and collaboration are switched off.'],
  'ui.preset.team': ['Команда', 'Team'],
  'ui.preset.team.h': ['Профессиональный режим, всё включено: роли, задачи, ветки авторов, синхронизация, переводы.', 'Professional mode with everything on: roles, tasks, author branches, sync, translation.'],
  'ui.preset.custom': ['Свой набор: режим и модули настроены вручную', 'Custom: the mode and modules were set by hand'],
  'ui.preset.q': ['Как вы будете работать?', 'How will you work?'],
  'ui.preset.q.p': ['Выберите набор, он настроит панель. Это можно поменять в любой момент: Настройки → Вид и режим.', 'Pick a preset, it will set up the toolbar. You can change it at any time: Settings → Look and mode.'],
  'ui.preset.keep': ['Оставить как есть', 'Keep as it is'],
  'ui.preset.done': ['Набор «{0}» включён', 'Preset "{0}" is on'],
});

const UI_PRESETS = {
  write: { mode: 'simple', off: [] },
  build: { mode: 'pro', off: ['team', 'collab', 'translate'] },
  team: { mode: 'pro', off: [] },
};
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
/** Карточка первого запуска: плавает в углу, карту не закрывает и работу не блокирует. */
function uiPresetCard() {
  if (document.querySelector('.ui-preset-card')) return;
  const close = () => { card.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const card = h('div', { class: 'ui-preset-card', role: 'dialog', 'aria-label': t('ui.preset.q') },
    h('b', { class: 'upc-h' }, t('ui.preset.q')), h('div', { class: 'hint' }, t('ui.preset.q.p')),
    uiPresetOptions(close),
    h('div', { class: 'upc-row' },
      h('button', { class: 'btn sm', id: 'upc-tour', onclick: () => { close(); if (typeof tourGeneral === 'function') setTimeout(() => tourGeneral(), 80); } }, icon('sparkles', 14), t('tour.first')),
      h('button', { class: 'btn sm', id: 'upc-keep', onclick: close }, t('ui.preset.keep'))));
  document.body.append(card);
  document.addEventListener('keydown', onKey, true);
}

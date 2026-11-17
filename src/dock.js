'use strict';
/* ====== Панели у краёв экрана ======
   Панели поверх холста (Блок, Поиск, Инструменты; Играть, Текст, Реестр…; разделы; масштаб; состояние) можно перенести к любому краю:
   сверху, снизу, слева или справа, в начало, середину или конец края. У левого и правого края панель сама становится вертикальной,
   подписи прячутся (остаются значки и подсказки). Панели живут только в этих двенадцати местах, поэтому в середине холста ничего
   не плавает. Настраивается в «Настройки → Панель → Изменить расположение»: панели перетаскиваются на подсвеченные места,
   «Готово» сохраняет, «Отмена» возвращает как было. Плашка проекта (значок, название, «Сохранено») всегда стоит в начале верхнего края. */

Object.assign(D, {
  'dock.h': ['Расположение панелей', 'Panel positions'],
  'dock.p': ['Перенесите панели к любому краю экрана: у левого и правого края они становятся вертикальными. Режим правки открывается кнопкой ниже, а настройки закрываются на это время.', 'Move the panels to any edge of the screen: at the left and right edges they turn vertical. The edit mode opens with the button below and the settings close for the time being.'],
  'dock.edit': ['Изменить расположение', 'Change positions'],
  'dock.core': ['Блок, Поиск, Инструменты', 'Block, Search, Tools'],
  'dock.strip': ['Разделы (Карта, Тексты…)', 'Sections (Map, Texts…)'],
  'dock.main': ['Играть, Текст, Реестр…', 'Play, Text, Registry…'],
  'dock.zoom': ['Масштаб', 'Zoom'],
  'dock.status': ['Состояние проекта', 'Project status'],
  'dock.top': ['Сверху', 'Top'], 'dock.bottom': ['Снизу', 'Bottom'], 'dock.left': ['Слева', 'Left'], 'dock.right': ['Справа', 'Right'],
  'dock.start': ['в начале', 'at the start'], 'dock.center': ['по центру', 'in the middle'], 'dock.end': ['в конце', 'at the end'],
  'dock.bar.t': ['Перетащите панель на подсвеченное место', 'Drag a panel to a highlighted spot'],
  'dock.bar.h': ['Панель «Состояние проекта» остаётся только сверху или снизу: в ней много текста.', 'The "Project status" panel stays at the top or the bottom only: it holds a lot of text.'],
  'dock.done': ['Готово', 'Done'], 'dock.cancel': ['Отмена', 'Cancel'], 'dock.reset': ['Как было', 'Defaults'],
  'dock.small': ['На узком экране (телефон) панели стоят как обычно, расположение не применяется.', 'On a narrow screen (a phone) the panels stay as usual and the positions are not applied.'],
});

const DOCK_IDS = ['core', 'strip', 'main', 'zoom', 'status'];
const DOCK_DEF = { core: ['top', 'start'], strip: ['top', 'start'], main: ['top', 'end'], zoom: ['bottom', 'start'], status: ['bottom', 'end'] };
const DOCK_H_ONLY = ['status'];                                   // эти панели не бывают вертикальными
const DOCK_EDGES = ['top', 'bottom', 'left', 'right'], DOCK_POS = ['start', 'center', 'end'];
const dockNarrow = () => window.innerWidth < 760;
const dockVert = e => e === 'left' || e === 'right';

function dockCfg() { const c = uiCfg(); if (!c.dock || typeof c.dock !== 'object') c.dock = {}; return c.dock; }
/** Где стоит панель: [край, место]. На узком экране и для неизвестных значений — как по умолчанию. */
function dockOf(id) {
  const d = dockCfg()[id];
  if (dockNarrow() || !Array.isArray(d) || !DOCK_EDGES.includes(d[0]) || !DOCK_POS.includes(d[1])) return DOCK_DEF[id];
  if (DOCK_H_ONLY.includes(id) && dockVert(d[0])) return DOCK_DEF[id];
  return d;
}
function dockSet(id, edge, pos) {
  if (!DOCK_IDS.includes(id) || !DOCK_EDGES.includes(edge) || !DOCK_POS.includes(pos)) return false;
  if (DOCK_H_ONLY.includes(id) && dockVert(edge)) return false;
  const c = dockCfg(), def = DOCK_DEF[id];
  if (edge === def[0] && pos === def[1]) delete c[id]; else c[id] = [edge, pos];
  return true;
}
function dockReset() { delete uiCfg().dock; }
const dockCustom = () => Object.keys(dockCfg()).length > 0;

/** Три места на каждом крае. Верхний край — это #topbar, остальные создаются здесь. */
function dockInit() {
  const app = $('#app');
  for (const e of ['bottom', 'left', 'right']) {
    if ($('#dock-' + e)) continue;
    app.append(h('div', { class: 'dock dock-' + e, id: 'dock-' + e }, ...DOCK_POS.map(p => h('div', { class: 'slot s-' + p, 'data-slot': e + '-' + p }))));
  }
}
const dockSlot = (e, p) => (e === 'top' ? $('#topbar') : $('#dock-' + e)).querySelector('.s-' + p);

/** Расставляет панели по местам. panels — элементы по id (null — панели сейчас нет), identity — плашка проекта. */
function dockLayout(panels, identity) {
  dockInit();
  const top = $('#topbar');
  top.replaceChildren(...DOCK_POS.map(p => h('div', { class: 'slot s-' + p, 'data-slot': 'top-' + p })));
  for (const e of ['bottom', 'left', 'right']) for (const s of document.querySelectorAll('#dock-' + e + ' .slot')) s.replaceChildren();
  top.querySelector('.s-start').append(identity);
  for (const id of DOCK_IDS) {
    const el = panels[id]; if (!el) continue;
    const [e, p] = dockOf(id);
    el.dataset.dock = id; el.classList.toggle('vert', dockVert(e));
    dockSlot(e, p).append(el);
  }
  for (const e of ['top', 'bottom', 'left', 'right']) document.body.classList.toggle('dock-has-' + e, !!document.querySelector((e === 'top' ? '#topbar' : '#dock-' + e) + ' [data-dock]'));
}

/* ---------- режим правки ---------- */
let DOCK_ED = null;
const dockZoneLabel = (e, p) => t('dock.' + e) + ', ' + t('dock.' + p);

function dockEditStart() {
  if (DOCK_ED) return;
  const ed = DOCK_ED = { snap: JSON.stringify(dockCfg()), drag: null, zone: '' };
  const zones = h('div', { id: 'dock-zones' });
  for (const e of DOCK_EDGES) for (const p of DOCK_POS) zones.append(h('div', { class: 'dz dz-' + e + '-' + p, 'data-zone': e + '-' + p, 'data-tip': null }, h('span', dockZoneLabel(e, p))));
  const bar = h('div', { id: 'dock-editbar', role: 'dialog', 'aria-label': t('dock.h') },
    h('div', { class: 'de-t' }, h('b', t('dock.bar.t')), h('div', { class: 'hint' }, t('dock.bar.h'))),
    h('div', { class: 'de-b' },
      h('button', { class: 'btn sm', id: 'dock-reset', onclick: () => { dockReset(); saveSettings(); buildChrome(); } }, icon('undo', 14), t('dock.reset')),
      h('button', { class: 'btn sm', id: 'dock-cancel', onclick: () => dockEditEnd(false) }, t('dock.cancel')),
      h('button', { class: 'btn sm primary', id: 'dock-done', onclick: () => dockEditEnd(true) }, icon('check', 14), t('dock.done'))));
  document.body.append(zones, bar);
  document.body.classList.add('dock-edit');
  ed.zones = zones; ed.bar = bar;
  ed.onDown = e => dockDown(e); ed.onMove = e => dockMove(e); ed.onUp = e => dockUp(e); ed.onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); dockEditEnd(false); } };
  document.addEventListener('pointerdown', ed.onDown, true);
  document.addEventListener('pointermove', ed.onMove, true);
  document.addEventListener('pointerup', ed.onUp, true);
  document.addEventListener('keydown', ed.onKey, true);
  buildChrome();                                                    // панели уже в режиме правки: на них нельзя нажимать, их можно тащить
}
function dockEditEnd(save) {
  const ed = DOCK_ED; if (!ed) return;
  DOCK_ED = null;
  document.removeEventListener('pointerdown', ed.onDown, true);
  document.removeEventListener('pointermove', ed.onMove, true);
  document.removeEventListener('pointerup', ed.onUp, true);
  document.removeEventListener('keydown', ed.onKey, true);
  ed.zones.remove(); ed.bar.remove(); if (ed.ghost) ed.ghost.remove();
  document.body.classList.remove('dock-edit');
  if (!save) { try { uiCfg().dock = JSON.parse(ed.snap); } catch (e) { delete uiCfg().dock; } }
  saveSettings(); buildChrome();
  setTimeout(() => openSettingsWindow('bar'), 60);
}
/** Куда можно поставить эту панель (для строки состояния вертикальные края закрыты). */
const dockAllowed = (id, zone) => !(DOCK_H_ONLY.includes(id) && dockVert(zone.split('-')[0]));
function dockNearest(id, x, y) {
  let best = '', bd = 170;
  for (const z of DOCK_ED.zones.children) {
    const zn = z.dataset.zone; if (!dockAllowed(id, zn)) continue;
    const r = z.getBoundingClientRect(), d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
    if (d < bd) { bd = d; best = zn; }
  }
  return best;
}
function dockDown(e) {
  const ed = DOCK_ED; if (!ed || e.button > 0) return;
  const el = e.target.closest && e.target.closest('[data-dock]'); if (!el) return;
  e.preventDefault(); e.stopPropagation();
  const id = el.dataset.dock;
  ed.drag = { id, el };
  el.classList.add('dock-lifted');
  ed.ghost = h('div', { class: 'dock-ghost' }, t('dock.' + id));
  document.body.append(ed.ghost);
  for (const z of ed.zones.children) z.classList.toggle('no', !dockAllowed(id, z.dataset.zone));
  dockMove(e);
}
function dockMove(e) {
  const ed = DOCK_ED; if (!ed || !ed.drag) return;
  e.preventDefault();
  ed.ghost.style.left = (e.clientX + 14) + 'px'; ed.ghost.style.top = (e.clientY + 14) + 'px';
  ed.zone = dockNearest(ed.drag.id, e.clientX, e.clientY);
  for (const z of ed.zones.children) z.classList.toggle('hot', z.dataset.zone === ed.zone);
}
function dockUp(e) {
  const ed = DOCK_ED; if (!ed || !ed.drag) return;
  e.preventDefault(); e.stopPropagation();
  const { id, el } = ed.drag, zone = ed.zone;
  ed.drag = null; ed.zone = ''; el.classList.remove('dock-lifted');
  if (ed.ghost) { ed.ghost.remove(); ed.ghost = null; }
  for (const z of ed.zones.children) z.classList.remove('hot', 'no');
  if (zone) { const [edge, pos] = zone.split('-'); if (dockSet(id, edge, pos)) { saveSettings(); buildChrome(); } }
}

/** Блок для «Настройки → Панель»: кнопка режима правки. */
function dockSettingsCard(st) {
  return setCard(t('dock.h'), h('div', { class: 'hint' }, t('dock.p')), dockNarrow() ? h('div', { class: 'hint' }, t('dock.small')) : null,
    h('div', { class: 'nt-btns' }, h('button', { class: 'btn', id: 'dock-edit-btn', onclick: () => { st.m.close(); setTimeout(dockEditStart, 120); } }, icon('grip', 15), t('dock.edit'))));
}

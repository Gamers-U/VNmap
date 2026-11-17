'use strict';
/* ====== Интерфейс игры (GUI) в реестре ======
   Вкладка «Интерфейс (GUI)»: картинки окна с текстом, плашки имени, фонов меню, кнопок и т. д., а также цвета, размеры и шрифты интерфейса.
   Картинки хранятся как обычные ассеты вида «gui» (имя = место, например textbox). Ren'Py уже ждёт их под стандартными именами в game/gui/,
   поэтому при сборке файл кладётся на место стандартного и никакого кода не нужно (для фонов меню и значка окна можно указать свой путь).
   Цвета, размеры и шрифты лежат в P.gui и попадают в game/gui_custom.rpy: он идёт сразу после gui.rpy и меняет только то, что вы задали.
   Сверху живой образец окна игры: видно, как выглядят выбранные цвета и размеры. */

Object.assign(D, {
  'reg.tab.gui': ['Интерфейс (GUI)', 'Interface (GUI)'],
  'reg.hint.gui': ['Окно с текстом, меню, кнопки, цвета и шрифты интерфейса игры', 'The text window, menus, buttons, colours and fonts of the game interface'],
  'gui.lead': ['Здесь то, что игрок видит вокруг истории: окно с репликой, плашка имени, меню, кнопки. Незаполненное остаётся таким, как в стандартном шаблоне Ren\'Py. При сборке картинки заменяют файлы в game/gui, а значения попадают в файл gui_custom.rpy (ваши gui.rpy и screens.rpy не трогаются).',
    'This is what the player sees around the story: the dialogue window, name plate, menus and buttons. Anything left empty stays as in the standard Ren\'Py template. On build the pictures replace the files in game/gui and the values go to gui_custom.rpy (your gui.rpy and screens.rpy are not touched).'],
  'gui.prev.h': ['Образец', 'Preview'], 'gui.prev.t': ['Так примерно выглядит игра: меню слева, окно с текстом, плашка имени и варианты выбора. Цвета и размеры тут показаны приближённо; точнее будет в самой игре.', 'Roughly how the game looks: the menu on the left, the text window, the name plate and the choices. Colours and sizes are approximate here; the game itself is exact.'],
  'gui.prev.name': ['Алиса', 'Alice'], 'gui.prev.text': ['Привет! Это пример реплики в вашей игре.', 'Hi! This is a sample line in your game.'],
  'gui.prev.n1': ['Начать', 'Start'], 'gui.prev.n2': ['Загрузить', 'Load'], 'gui.prev.n3': ['Настройки', 'Preferences'],
  'gui.prev.c1': ['Согласиться', 'Agree'], 'gui.prev.c2': ['Отказаться', 'Decline'],
  'gui.edit.none': ['Нажмите на любую часть образца: имя, текст, окно, варианты выбора, меню или фон. Здесь появятся её цвета, размеры и шрифт, а образец сразу изменится.', 'Click any part of the preview: the name, the text, the window, the choices, the menu or the background. Its colours, sizes and font appear here and the preview changes at once.'],
  'gui.edit.hint': ['Нажмите на часть образца, чтобы изменить её', 'Click a part of the preview to change it'],
  'gui.part.name': ['Имя говорящего', 'Speaker name'], 'gui.part.name.h': ['Цвет имени задаёт «Акцент». Положение отсчитывается от окна с текстом.', 'The name colour is the "Accent". The position is counted from the text window.'],
  'gui.part.text': ['Текст реплики', 'Dialogue text'], 'gui.part.text.h': ['Размер, шрифт и цвет текста, и где он стоит внутри окна.', 'The size, font and colour of the text, and where it sits inside the window.'],
  'gui.part.box': ['Окно с текстом', 'Text window'], 'gui.part.box.h': ['Высота окна. Свою картинку окна и плашки имени можно задать ниже, в разделе «Картинки».', 'The window height. You can set your own window and name plate pictures below, in the "Pictures" section.'],
  'gui.part.choice': ['Варианты выбора', 'Choices'], 'gui.part.choice.h': ['Размер и шрифт совпадают с текстом реплики. Картинки кнопок: «Картинки» ниже.', 'The size and font follow the dialogue text. Button pictures: "Pictures" below.'],
  'gui.part.nav': ['Меню (Начать, Загрузить…)', 'Menu (Start, Load…)'], 'gui.part.nav.h': ['Пункты главного меню и кнопки: обычный, под курсором и выбранный.', 'Main menu items and buttons: normal, hovered and selected.'],
  'gui.part.bg': ['Фон меню', 'Menu background'], 'gui.part.bg.h': ['Здесь только картинка: загрузите её ниже, в разделе «Картинки». Без неё останется фон шаблона.', 'Only a picture here: upload it below, in the "Pictures" section. Without it the template background stays.'],
  'gui.part.imgs': ['Перейти к картинкам', 'Go to the pictures'],
  'gui.part.close': ['Снять выделение', 'Clear selection'],
  'gui.g.colors': ['Цвета', 'Colours'], 'gui.g.colors.h': ['Пусто — как в шаблоне Ren\'Py (серым показано стандартное значение).', 'Empty means the Ren\'Py template value (shown in grey).'],
  'gui.g.sizes': ['Размеры текста', 'Text sizes'], 'gui.g.sizes.h': ['В пикселях при размере экрана игры (по умолчанию 1920×1080).', 'In pixels at the game screen size (1920×1080 by default).'],
  'gui.g.box': ['Окно с текстом и плашка имени', 'Text window and name plate'], 'gui.g.box.h': ['Высота окна и положение текста внутри него. Пригодится, если вы заменили картинку окна.', 'The window height and where the text sits inside it. Useful when you replaced the window picture.'],
  'gui.g.fonts': ['Шрифты интерфейса', 'Interface fonts'], 'gui.g.fonts.h': ['Шрифты берутся из вкладки «Шрифты» реестра. Для кириллицы нужен шрифт с русскими буквами.', 'Fonts come from the “Fonts” tab of the registry. Cyrillic needs a font with Russian letters.'],
  'gui.g.imgs': ['Картинки интерфейса', 'Interface pictures'], 'gui.g.imgs.h': ['Загруженная картинка заменит стандартную при сборке. Любой формат превратится в PNG: Ren\'Py ждёт эти файлы под именем .png.', 'An uploaded picture replaces the standard one on build. Any format is converted to PNG: Ren\'Py expects these files as .png.'],
  'gui.k.accent_color': ['Акцент (имена, выделения)', 'Accent (names, highlights)'], 'gui.k.text_color': ['Текст реплик', 'Dialogue text'], 'gui.k.interface_text_color': ['Текст интерфейса', 'Interface text'],
  'gui.k.idle_color': ['Кнопки (обычные)', 'Buttons (idle)'], 'gui.k.idle_small_color': ['Мелкий текст (обычный)', 'Small text (idle)'], 'gui.k.hover_color': ['Под курсором', 'Hover'],
  'gui.k.selected_color': ['Выбранное', 'Selected'], 'gui.k.muted_color': ['Приглушённый', 'Muted'], 'gui.k.hover_muted_color': ['Приглушённый под курсором', 'Muted hover'],
  'gui.k.text_size': ['Реплики', 'Dialogue'], 'gui.k.name_text_size': ['Имя говорящего', 'Speaker name'], 'gui.k.interface_text_size': ['Кнопки и меню', 'Buttons and menus'],
  'gui.k.label_text_size': ['Заголовки разделов', 'Section titles'], 'gui.k.notify_text_size': ['Уведомления', 'Notifications'], 'gui.k.title_text_size': ['Название игры', 'Game title'],
  'gui.k.textbox_height': ['Высота окна с текстом', 'Text window height'], 'gui.k.dialogue_xpos': ['Текст: отступ слева', 'Text: left offset'], 'gui.k.dialogue_ypos': ['Текст: отступ сверху', 'Text: top offset'],
  'gui.k.dialogue_width': ['Текст: ширина', 'Text: width'], 'gui.k.name_xpos': ['Имя: отступ слева', 'Name: left offset'], 'gui.k.name_ypos': ['Имя: смещение по вертикали', 'Name: vertical shift'],
  'gui.k.text_font': ['Шрифт реплик', 'Dialogue font'], 'gui.k.name_text_font': ['Шрифт имён', 'Name font'], 'gui.k.interface_text_font': ['Шрифт меню и кнопок', 'Menu and button font'],
  'gui.font.std': ['Стандартный (как в шаблоне)', 'Standard (as in the template)'],
  'kind.gui': ['Интерфейс', 'Interface'], 'kind1.gui': ['Картинка интерфейса', 'Interface picture'],
  'gui.reset': ['Сбросить всё к шаблону', 'Reset everything to the template'], 'gui.reset.q': ['Сбросить цвета, размеры и шрифты?', 'Reset colours, sizes and fonts?'],
  'gui.reset.t': ['Значения вернутся к стандартным. Загруженные картинки останутся.', 'The values go back to the defaults. Uploaded pictures stay.'],
  'gui.set': ['Заданных значений: {0}', 'Values set: {0}'],
  'gui.path': ['Свой путь в игре', 'Own path in the game'], 'gui.path.h': ['Пусто — стандартный путь. Если укажете свой, программа пропишет его в gui_custom.rpy.', 'Empty means the standard path. If you set your own, it is written into gui_custom.rpy.'],
  'gui.pathstd': ['файл шаблона: {0}', 'template file: {0}'],
  'gui.none': ['не заменено', 'not replaced'], 'gui.has': ['заменит {0}', 'replaces {0}'],
  'gui.s.textbox': ['Окно с текстом', 'Dialogue window'], 'gui.h.textbox': ['На всю ширину экрана; высота как у «высоты окна с текстом» (по умолчанию 278).', 'Full screen width; the height matches “text window height” (278 by default).'],
  'gui.s.namebox': ['Плашка с именем говорящего', 'Speaker name plate'], 'gui.h.namebox': ['Небольшая плашка над окном; растягивается под имя.', 'A small plate above the window; it stretches to fit the name.'],
  'gui.s.main_menu': ['Фон главного меню', 'Main menu background'], 'gui.h.main_menu': ['Размер экрана игры (по умолчанию 1920×1080).', 'The game screen size (1920×1080 by default).'],
  'gui.s.game_menu': ['Фон игрового меню', 'Game menu background'], 'gui.h.game_menu': ['Сохранение, загрузка, настройки. Размер экрана игры.', 'Save, load, preferences. The game screen size.'],
  'gui.s.overlay_main_menu': ['Затемнение главного меню', 'Main menu overlay'], 'gui.h.overlay_main_menu': ['Полупрозрачная панель поверх фона меню.', 'A translucent panel over the menu background.'],
  'gui.s.overlay_game_menu': ['Затемнение игрового меню', 'Game menu overlay'], 'gui.h.overlay_game_menu': ['Полупрозрачная панель поверх фона игрового меню.', 'A translucent panel over the game menu background.'],
  'gui.s.overlay_confirm': ['Фон окна подтверждения', 'Confirmation backdrop'], 'gui.h.overlay_confirm': ['Затемнение за вопросом «Вы уверены?».', 'The dimming behind the “Are you sure?” question.'],
  'gui.s.window_icon': ['Значок окна игры', 'Game window icon'], 'gui.h.window_icon': ['Квадрат, например 256×256.', 'A square, for example 256×256.'],
  'gui.s.frame': ['Рамка окон', 'Window frame'], 'gui.h.frame': ['Рамка окон подтверждения и всплывающих окон; растягивается.', 'The frame of confirmation and popup windows; it stretches.'],
  'gui.s.notify': ['Всплывающее уведомление', 'Notification plate'], 'gui.h.notify': ['Плашка короткого сообщения («Игра сохранена»).', 'The plate for short messages (“Game saved”).'],
  'gui.s.skip': ['Значок «Пропуск»', 'Skip indicator'], 'gui.h.skip': ['Стрелка, которая мигает при пропуске текста.', 'The arrow that blinks while skipping text.'],
  'gui.s.button_idle': ['Кнопка меню (обычная)', 'Menu button (idle)'], 'gui.h.button_idle': ['Фон кнопок меню.', 'The background of menu buttons.'],
  'gui.s.button_hover': ['Кнопка меню (под курсором)', 'Menu button (hover)'], 'gui.h.button_hover': ['Фон кнопки, когда на неё навели курсор.', 'The button background under the cursor.'],
  'gui.s.choice_idle': ['Вариант выбора (обычный)', 'Choice (idle)'], 'gui.h.choice_idle': ['Фон кнопки с вариантом ответа.', 'The background of a choice button.'],
  'gui.s.choice_hover': ['Вариант выбора (под курсором)', 'Choice (hover)'], 'gui.h.choice_hover': ['Тот же вариант, когда на него навели курсор.', 'The same choice under the cursor.'],
  'gui.s.slot_idle': ['Ячейка сохранения (обычная)', 'Save slot (idle)'], 'gui.h.slot_idle': ['Фон ячейки на экране сохранений.', 'The slot background on the save screen.'],
  'gui.s.slot_hover': ['Ячейка сохранения (под курсором)', 'Save slot (hover)'], 'gui.h.slot_hover': ['Та же ячейка под курсором.', 'The same slot under the cursor.'],
  'cmp.f.gui': ['Интерфейс игры', 'Game interface'],
  'cmp.gui.hint': ['Значения из вкладки «Интерфейс (GUI)» реестра. Файл создаётся программой при каждой сборке: правьте значения в программе.', 'Values from the “Interface (GUI)” tab of the registry. The file is created by the program on every build: edit the values in the program.'],
  'cmp.gui.early': ['Выполняется сразу после gui.rpy и до screens.rpy, поэтому стили строятся уже с вашими значениями.', 'Runs right after gui.rpy and before screens.rpy, so the styles are built with your values.'],
  'cmp.gui.derived': ['gui.rpy копирует некоторые значения в другие (например, цвет кнопок берётся из idle_color). Такие копии меняются вместе с основным значением, если вы не правили их вручную.', 'gui.rpy copies some values into others (for example the button colour comes from idle_color). Such copies change together with the main value unless you edited them by hand.'],
  'cmp.gui.imgs': ['Картинок интерфейса заменит стандартные: {0} (game/gui).', 'Interface pictures replacing the standard ones: {0} (game/gui).'],
  'cmp.gui.file': ['gui_custom.rpy: заданных значений {0}. Если что-то не поменялось в игре, откройте лаунчер Ren\'Py → «Проверка» (Lint) и пришлите сообщение.', 'gui_custom.rpy: {0} values set. If something did not change in the game, run Ren\'Py launcher → “Check Script (Lint)” and send me the message.'],
  'gd.n.gui': ['интерфейс игры: ваши цвета, размеры и шрифты (поверх gui.rpy)', 'game interface: your colours, sizes and fonts (on top of gui.rpy)'],
});

/** Места под картинки интерфейса: имена файлов стандартного шаблона Ren'Py. over — для этого места можно указать свой путь (в код попадёт переменная). */
const GUI_SLOTS = [
  { k: 'textbox', path: 'gui/textbox.png' }, { k: 'namebox', path: 'gui/namebox.png' },
  { k: 'main_menu', path: 'gui/main_menu.png', over: true }, { k: 'game_menu', path: 'gui/game_menu.png', over: true },
  { k: 'overlay_main_menu', path: 'gui/overlay/main_menu.png' }, { k: 'overlay_game_menu', path: 'gui/overlay/game_menu.png' }, { k: 'overlay_confirm', path: 'gui/overlay/confirm.png' },
  { k: 'window_icon', path: 'gui/window_icon.png', over: true }, { k: 'frame', path: 'gui/frame.png' }, { k: 'notify', path: 'gui/notify.png' }, { k: 'skip', path: 'gui/skip.png' },
  { k: 'button_idle', path: 'gui/button/idle_background.png' }, { k: 'button_hover', path: 'gui/button/hover_background.png' },
  { k: 'choice_idle', path: 'gui/button/choice_idle_background.png' }, { k: 'choice_hover', path: 'gui/button/choice_hover_background.png' },
  { k: 'slot_idle', path: 'gui/button/slot_idle_background.png' }, { k: 'slot_hover', path: 'gui/button/slot_hover_background.png' },
];
/** Что gui.rpy шаблона копирует из основного значения при загрузке (меняем копию только если она всё ещё равна старому основному значению). */
const GUI_DERIVED = {
  accent_color: ['label_text_color', 'quick_button_text_selected_color'],
  idle_color: ['button_text_idle_color'],
  idle_small_color: ['quick_button_text_idle_color', 'slot_button_text_idle_color'],
  hover_color: ['button_text_hover_color', 'quick_button_text_hover_color', 'slot_button_text_selected_hover_color'],
  selected_color: ['button_text_selected_color', 'button_text_selected_idle_color', 'slot_button_text_selected_idle_color'],
  text_size: ['choice_button_text_size'], interface_text_size: ['button_text_size'],
  text_font: ['choice_button_text_font'], interface_text_font: ['button_text_font', 'label_text_font'],
};
const guiSlot = k => GUI_SLOTS.find(s => s.k === k) || null;
const guiAsset = k => P.assets.find(a => a.kind === 'gui' && a.name === k) || null;
/** Куда файл попадёт внутри game/: стандартное имя места, а если задан свой путь (только для мест с over) — он. */
function guiTarget(a) {
  const s = guiSlot(a.name);
  if (s && !(s.over && a.path)) return s.path;
  return (a.path ? cmpStripExt(cmpPath(a.path)) : 'gui/' + (slug(a.name) || 'image')) + '.png';
}
/** Любую картинку превращает в PNG. null — не получилось (не картинка). */
async function guiToPng(file) {
  try {
    const bmp = await createImageBitmap(file);
    const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
    cv.getContext('2d').drawImage(bmp, 0, 0);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) return null;
    return new File([blob], String(file.name || 'image').replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' });
  } catch (e) { return null; }
}
const guiEnsure = k => guiAsset(k) || createAsset('gui', k);
const guiGet = k => (P.gui && P.gui[k] !== undefined && P.gui[k] !== '' ? P.gui[k] : undefined);
function guiCount() { return P.assets.filter(a => a.kind === 'gui' && assetFileCount(a)).length + Object.keys(guiClean(P.gui)).length; }
/** Убирает из P.gui лишнее. Объект остаётся тем же: поля цвета держат на него ссылку, и новый объект сделал бы их правки потерянными. */
function guiTidy() { const c = guiClean(P.gui); if (!P.gui || typeof P.gui !== 'object') P.gui = {}; for (const k of Object.keys(P.gui)) delete P.gui[k]; Object.assign(P.gui, c); }

/** Части образца, на которые можно нажать: что в них меняется и какие картинки к ним относятся. */
const GUI_PARTS = {
  name: { keys: ['accent_color', 'name_text_size', 'name_text_font', 'name_xpos', 'name_ypos'], slot: 'namebox' },
  text: { keys: ['text_color', 'text_size', 'text_font', 'dialogue_xpos', 'dialogue_ypos', 'dialogue_width'] },
  box: { keys: ['textbox_height'], slot: 'textbox' },
  choice: { keys: ['text_size', 'text_font'], slot: 'choice_idle' },
  nav: { keys: ['interface_text_size', 'interface_text_font', 'idle_color', 'hover_color', 'selected_color'] },
  bg: { keys: [], slot: 'main_menu' },
};
let GUI_PART = '';
/** Поле значения (цвет, размер или шрифт) для одного пункта GUI_KEYS; onChange вызывается после каждого изменения. */
function guiCtl(d, onChange) {
  if (d.t === 'color') { if (!P.gui) P.gui = {}; return hexField(P.gui, d.k, d.d, onChange); }
  if (d.t === 'size') {
    const i = h('input', { class: 'inp', type: 'number', step: '1', min: String(d.min), max: '4000', placeholder: String(d.d), value: guiGet(d.k) !== undefined ? String(guiGet(d.k)) : '' });
    i.addEventListener('input', () => { if (!P.gui) P.gui = {}; if (i.value === '') delete P.gui[d.k]; else P.gui[d.k] = i.value; onChange(); });
    return i;
  }
  return fontSelect(guiGet(d.k) || '', val => { if (!P.gui) P.gui = {}; if (val) P.gui[d.k] = val; else delete P.gui[d.k]; onChange(); }, { empty: t('gui.font.std') });
}

/* ---------- образец окна игры ---------- */
function guiPreview(onPick) {
  const box = h('div', { class: 'gui-prev' }), cv = h('div', { class: 'gui-scr' });
  box.append(cv);
  const v = (k, dflt) => { const x = guiGet(k); return x !== undefined ? x : dflt; };
  const dd = k => GUI_KEYS.find(d => d.k === k).d;
  const px = n => 'calc(' + n + ' * 100cqw / 1920)';
  const img = (k, el, prop = 'backgroundImage') => { const a = guiAsset(k), m = a && assetMeta(a, ''); if (m) blobUrl(m.bid).then(u => { if (u) { el.style[prop] = 'url("' + u + '")'; el.classList.add('has-img'); } }); };
  const bg = h('div', { class: 'gui-bg' }); img('main_menu', bg);
  const nameEl = h('span', { class: 'gui-name', style: { fontSize: px(v('name_text_size', dd('name_text_size'))), color: v('accent_color', dd('accent_color')), fontFamily: fontCssOf(v('name_text_font', '')) } }, t('gui.prev.name'));
  const nb = h('div', { class: 'gui-nb', style: { left: px(v('name_xpos', dd('name_xpos'))), top: px(v('name_ypos', dd('name_ypos'))) } }, nameEl); img('namebox', nb);
  const txt = h('div', { class: 'gui-tx', style: { left: px(v('dialogue_xpos', dd('dialogue_xpos'))), top: px(v('dialogue_ypos', dd('dialogue_ypos'))), width: px(v('dialogue_width', dd('dialogue_width'))), fontSize: px(v('text_size', dd('text_size'))), color: v('text_color', dd('text_color')), fontFamily: fontCssOf(v('text_font', '')) } }, t('gui.prev.text'));
  const tb = h('div', { class: 'gui-tb', style: { height: px(v('textbox_height', dd('textbox_height'))) } }, nb, txt); img('textbox', tb);
  const ch = (label, hover) => {
    const b = h('div', { class: 'gui-ch' + (hover ? ' hover' : ''), style: { fontSize: px(v('text_size', dd('text_size'))), color: hover ? '#ffffff' : '#cccccc', fontFamily: fontCssOf(v('text_font', '')) } }, label);
    img(hover ? 'choice_hover' : 'choice_idle', b); return b;
  };
  const nv = (label, st) => h('div', { class: 'gui-nv', style: { fontSize: px(v('interface_text_size', dd('interface_text_size'))), fontFamily: fontCssOf(v('interface_text_font', '')),
    color: st === 'hover' ? v('hover_color', dd('hover_color')) : st === 'sel' ? v('selected_color', dd('selected_color')) : v('idle_color', dd('idle_color')) } }, label);
  const nav = h('div', { class: 'gui-nav' }, nv(t('gui.prev.n1'), 'sel'), nv(t('gui.prev.n2'), 'hover'), nv(t('gui.prev.n3'), 'idle'));
  const chs = h('div', { class: 'gui-choices' }, ch(t('gui.prev.c1'), false), ch(t('gui.prev.c2'), true));
  cv.append(bg, nav, chs, tb);
  if (onPick) {                                                         // части образца кликаются: нажали и правите здесь же
    const mark = (part, el) => { el.classList.add('gui-part'); el.dataset.part = part; if (GUI_PART === part) el.classList.add('sel'); el.addEventListener('click', e => { e.stopPropagation(); onPick(GUI_PART === part ? '' : part); }); };
    mark('bg', bg); mark('nav', nav); mark('choice', chs); mark('box', tb); mark('text', txt); mark('name', nb);
    cv.addEventListener('click', () => onPick(''));
  }
  return box;
}
/** CSS-семейство шрифта из реестра по ссылке (для образца); пусто — шрифт страницы. */
function fontCssOf(ref) {
  if (!ref) return '';
  try { return (typeof fontCss === 'function' && fontCss(ref)) || ''; } catch (e) { return ''; }
}

/* ---------- вкладка ---------- */
function regGui(st, list, qq) {
  list.append(mfBanner());
  list.append(h('div', { class: 'hint gui-lead' }, t('gui.lead')));
  /* сверху образец и рядом панель правки выбранной части (они остаются на виду, пока листаете настройки ниже) */
  const host = h('div', { class: 'gui-host' });
  const prevCard = h('div', { class: 'reg-card gui-sec gui-prevcard' }, h('div', { class: 'reg-body' }, h('div', { class: 'gui-h' }, icon('eye', 14), h('b', t('gui.prev.h')), h('span', { class: 'hint', 'data-tip': t('gui.prev.t') }, t('gui.edit.hint')))));
  const edit = h('div', { class: 'reg-card gui-sec gui-edit', id: 'gui-edit' });
  let prev = null;
  const secBox = h('div', { class: 'gui-secs' });
  const pick = part => { GUI_PART = part; repaint(); renderEdit(); };
  const repaint = () => { const n = guiPreview(pick); if (prev) prev.replaceWith(n); else prevCard.firstChild.append(n); prev = n; };
  const fromPanel = () => { guiTidy(); commit(true); repaint(); renderSecs(); };          // правка в панели: образец и разделы ниже обновляются
  const renderEdit = () => {
    edit.replaceChildren();
    const part = GUI_PARTS[GUI_PART];
    if (!part) { edit.append(h('div', { class: 'reg-body' }, h('div', { class: 'hint gui-edit-none' }, t('gui.edit.none')))); return; }
    const grid = h('div', { class: 'gui-grid' });
    for (const k of part.keys) { const d = GUI_KEYS.find(x => x.k === k); grid.append(field(t('gui.k.' + d.k), guiCtl(d, fromPanel))); }
    edit.append(h('div', { class: 'reg-body' },
      h('div', { class: 'gui-h' }, h('b', t('gui.part.' + GUI_PART)), h('div', { class: 'grow' }), h('button', { class: 'btn icon sm', id: 'gui-edit-x', 'data-tip': t('gui.part.close'), onclick: () => pick('') }, icon('x', 14))),
      h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('gui.part.' + GUI_PART + '.h')),
      part.keys.length ? grid : null,
      part.slot ? h('button', { class: 'btn sm', id: 'gui-edit-imgs', onclick: () => { const el = list.querySelector('.gui-slot[data-slot="' + part.slot + '"]'); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); } } }, icon('image', 14), t('gui.part.imgs')) : null));
  };
  host.append(prevCard, edit);
  list.append(host, secBox);
  repaint(); renderEdit();
  const match = s => !qq || s.toLowerCase().includes(qq);
  const changed = () => { guiTidy(); commit(true); repaint(); renderEdit(); };
  const renderSecs = () => {
    secBox.replaceChildren();
    const sections = [['colors', 'color'], ['sizes', 'size'], ['box', 'size'], ['fonts', 'font']];
    for (const [g, ty] of sections) {
      const keys = GUI_KEYS.filter(d => d.g === g && match(t('gui.k.' + d.k) + ' ' + d.k));
      if (!keys.length) continue;
      const grid = h('div', { class: ty === 'color' ? 'gui-grid c' : 'gui-grid' });
      for (const d of keys) grid.append(field(t('gui.k.' + d.k), guiCtl(d, changed)));
      secBox.append(h('div', { class: 'reg-card gui-sec', 'data-gsec': g }, h('div', { class: 'reg-body' },
        h('div', { class: 'gui-h' }, h('b', t('gui.g.' + g)), h('div', { class: 'grow' }),
          g === 'colors' ? h('span', { class: 'hint', id: 'gui-setn' }, t('gui.set', Object.keys(guiClean(P.gui)).length)) : null),
        h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('gui.g.' + g + '.h')), grid)));
    }
    if (Object.keys(guiClean(P.gui)).length && !qq) secBox.append(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', id: 'gui-reset', onclick: async () => {
      if (!(await confirmDlg({ title: t('gui.reset.q'), text: t('gui.reset.t'), ok: t('gui.reset'), danger: true }))) return;
      P.gui = {}; commit(true); renderReg();
    } }, icon('undo', 14), t('gui.reset'))));
    /* картинки */
    const slots = GUI_SLOTS.filter(s => match(t('gui.s.' + s.k) + ' ' + s.k + ' ' + s.path));
    if (slots.length) {
      const box = h('div', { class: 'gui-slots' });
      for (const s of slots) box.append(guiSlotRow(s, repaint));
      secBox.append(h('div', { class: 'reg-card gui-sec', 'data-gsec': 'imgs' }, h('div', { class: 'reg-body' },
        h('div', { class: 'gui-h' }, h('b', t('gui.g.imgs'))), h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('gui.g.imgs.h')), box)));
    }
  };
  renderSecs();
}
function guiSlotRow(s, repaint) {
  const a = guiAsset(s.k), m = a && assetMeta(a, '');
  const wrap = h('div', { class: 'gui-slot', 'data-slot': s.k });
  wrap.append(h('div', { class: 'gui-st' }, h('b', t('gui.s.' + s.k)), h('span', { class: 'hint' }, ' · ' + t('gui.h.' + s.k)), h('span', { class: 'mono gui-p' }, t('gui.pathstd', s.path))));
  if (a && m) wrap.append(uploadRow(a, ''));
  else {
    const row = h('div', { class: 'upl-row' });
    const up = async file => {
      const x = guiEnsure(s.k);
      if (await attachFile(x, '', file)) renderReg(); else if (!assetFileCount(x)) { P.assets = P.assets.filter(q => q !== x); commit(true); }
    };
    row.append(h('div', { class: 'upl-thumb' }, icon('image', 18)), h('div', { class: 'upl-info' }, h('div', { class: 'upl-n' }, h('span', { class: 'muted' }, t('gui.none')))),
      h('div', { class: 'upl-btns' }, h('button', { class: 'btn sm upl-up', onclick: () => pickFiles(acceptFor('gui'), false, fl => up(fl[0])) }, icon('upload', 14), t('as.f.upload'))));
    row.addEventListener('dragover', e => { if ([...(e.dataTransfer.types || [])].includes('Files')) { e.preventDefault(); e.stopPropagation(); row.classList.add('drop'); } });
    row.addEventListener('dragleave', () => row.classList.remove('drop'));
    row.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); row.classList.remove('drop'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) up(f); });
    wrap.append(row);
  }
  if (s.over && a && m) wrap.append(field(t('gui.path'), bindInput(a, 'path', { mono: true, ph: s.path, onChange: () => commit() }), t('gui.path.h')));
  return wrap;
}

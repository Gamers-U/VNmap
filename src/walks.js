'use strict';
/* ====== Обучение с практикой: пошаговые уроки, где программа сама открывает функцию ======
   Движок тот же, что у общего тура (tour.js). Шаги бывают двух видов:
   · обычные: подсвечивают место и объясняют, где что лежит;
   · «живые» (live): подсвеченное место можно нажимать и печатать в нём, а задание (task) отмечается галочкой, когда человек его сделал (until).
   «Далее» работает всегда, поэтому застрять нельзя. Всё, что человек сделал, остаётся в проекте, и любую пробу отменяет Ctrl+Z. */

Object.assign(D, {
  'tw.undo': ['Это ваш проект: любую пробу отменяет Ctrl+Z, а любой шаг можно пропустить кнопкой «Далее».', 'This is your project: Ctrl+Z undoes any try, and any step can be skipped with the Next button.'],

  /* ---------- редактор текста ---------- */
  'tw.te.0': ['Практика: редактор текста', 'Hands-on: the text editor'],
  'tw.te.0.p': ['Окно открылось само. Пройдём по нему слева направо: напишем строку, сделаем её репликой героя и вставим развилку.', 'The window has opened by itself. We will go through it from left to right: write a line, make it a character\'s speech and insert a fork.'],
  'tw.te.1': ['Слева: ветки и оглавление', 'On the left: branches and the outline'],
  'tw.te.1.p': ['Новелла разбита на ветки: основная и боковые, которые начинаются с развилок. Нажмите на ветку или на главу в оглавлении, чтобы перейти к ней.\nПоле над списком ищет ветку, главу или слово в тексте.', 'The novel is split into branches: the main one and side ones that start at forks. Click a branch or a chapter in the outline to jump to it.\nThe field above the list searches for a branch, a chapter or a word in the text.'],
  'tw.te.2': ['Страница: здесь вы пишете', 'The page: you write here'],
  'tw.te.2.p': ['Страница работает как в Word: пишете абзацами. Абзац без пометок это слова рассказчика. Заголовок с цветной полосой слева это название блока или главы на карте.', 'The page works like Word: you write in paragraphs. A plain paragraph is the narrator\'s text. A heading with a coloured stripe on the left is the name of a map block or a chapter.'],
  'tw.te.2.t': ['Курсор уже стоит под заголовком главы (можно щёлкнуть и в другом месте, только не в самом заголовке). Напечатайте любую строку, например: **Утро. Я иду в школу.**', 'The cursor is already under a chapter heading (you can click elsewhere, just not into the heading itself). Type any line, for example: **Morning. I walk to school.**'],
  'tw.te.3': ['Реплика героя', 'A character\'s speech'],
  'tw.te.3.p': ['Так строка становится репликой: в сценарии Ren\'Py появятся имя и цвет героя. Герои берутся из «Реестра».', 'This is how a line becomes speech: the hero\'s name and colour appear in the Ren\'Py script. The heroes come from the Registry.'],
  'tw.te.3.t': ['Поставьте курсор в напечатанную строку, нажмите этот значок и выберите героя.', 'Put the cursor into the line you typed, press this icon and pick a character.'],
  'tw.te.4': ['Развилка', 'A fork'],
  'tw.te.4.p': ['Развилка отмечает место, где игрок делает выбор. Варианты это стрелки блока на карте, а здесь вы пишете текст перед выбором.', 'A fork marks the place where the player makes a choice. The options are the block\'s arrows on the map, and here you write the text before the choice.'],
  'tw.te.4.t': ['Нажмите «Развилка»: в текст вставится пометка.', 'Press Fork: a mark is inserted into the text.'],
  'tw.te.5': ['Остальные кнопки панели', 'The other toolbar buttons'],
  'tw.te.5.p': ['Жирный и курсив; подсветка важного места; команда сцены (фон, музыка, переход); «Заметка» (запись для себя, в игру не попадёт); «Глава» начинает новую главу, то есть новый блок на карте.', 'Bold and italic; highlighting an important spot; a scene command (background, music, transition); Note (a memo for yourself, it will not get into the game); Chapter starts a new chapter, that is a new block on the map.'],
  'tw.te.6': ['Справа: готовый сценарий', 'On the right: the finished script'],
  'tw.te.6.p': ['Справа сценарий Ren\'Py, который получится из текста. Вкладка «Код» показывает его как код, «Сценарий» списком реплик и команд. Ниже стоит число реплик и команд.', 'On the right is the Ren\'Py script that comes out of the text. The Code tab shows it as code, the Script tab as a list of lines and commands. Below is the count of lines and commands.'],
  'tw.te.7': ['Применить к сценарию', 'Apply to the script'],
  'tw.te.7.p': ['Пока вы пишете, файл главы не меняется. Когда текст готов, нажмите «Применить к сценарию»: он запишется в главу блока. Если включить «Обновлять сценарий автоматически», это будет происходить само.', 'While you write, the chapter file does not change. When the text is ready, press Apply to the script: it is written into the block\'s chapter. If you switch on Update the script automatically, this happens by itself.'],
  'tw.te.8': ['Справка редактора', 'The editor help'],
  'tw.te.8.p': ['Если что-то забудете, знак вопроса вверху открывает справку по редактору: все пометки, горячие клавиши и примеры.', 'If you forget something, the question mark at the top opens the editor help: all the marks, the shortcuts and examples.'],
  'tw.te.9': ['Готово', 'That is it'],
  'tw.te.9.p': ['Вы знаете главное: пишете, помечаете реплики и развилки, применяете к сценарию. Всё, что вы напечатали, осталось в проекте; Ctrl+Z несколько раз вернёт как было.', 'You know the main things: you write, mark speech and forks, apply to the script. Everything you typed stayed in the project; Ctrl+Z a few times brings it back as it was.'],

  /* ---------- карта ---------- */
  'tw.map.0': ['Практика: карта', 'Hands-on: the map'],
  'tw.map.0.p': ['Подвинем карту, изменим масштаб, создадим блок и откроем его. Всё делаете сами прямо на карте.', 'We will move the map, change the scale, create a block and open it. You do everything yourself, right on the map.'],
  'tw.map.1': ['Двигаем карту', 'Moving the map'],
  'tw.map.1.p': ['Новелла может быть огромной, поэтому карту двигают, как лист бумаги на столе.', 'A novel can be huge, so the map is moved like a sheet of paper on a table.'],
  'tw.map.1.t': ['Зажмите левую кнопку мыши на пустом месте карты и потяните.', 'Hold the left mouse button on an empty spot of the map and drag.'],
  'tw.map.2': ['Меняем масштаб', 'Changing the scale'],
  'tw.map.2.p': ['Крупно видно подписи, мелко видна вся новелла целиком. Клавиша F вмещает всю карту в экран.', 'Close up you see the labels, from afar you see the whole novel. The F key fits the entire map on the screen.'],
  'tw.map.2.t': ['Покрутите колесо мыши над картой (на сенсорном экране сведите два пальца).', 'Turn the mouse wheel over the map (on a touch screen, pinch with two fingers).'],
  'tw.map.3': ['Новый блок', 'A new block'],
  'tw.map.3.p': ['Блок это глава или сцена. Так же блок создаёт кнопка «Блок» на верхней панели.', 'A block is a chapter or a scene. The Block button on the top bar creates one as well.'],
  'tw.map.3.t': ['Дважды щёлкните по пустому месту карты.', 'Double-click an empty spot of the map.'],
  'tw.map.4': ['Окно блока', 'The block window'],
  'tw.map.4.p': ['В окне блока лежат его главы, описание и настройки. Закройте его, когда посмотрите.', 'The block window holds its chapters, the description and the settings. Close it when you have looked.'],
  'tw.map.4.t': ['Дважды щёлкните по блоку, который только что создали.', 'Double-click the block you have just created.'],
  'tw.map.5': ['Готово', 'That is it'],
  'tw.map.5.p': ['Стрелку между блоками рисуют, потянув от якоря блока к другому блоку. Лишний блок убирает Ctrl+Z или клавиша Delete.', 'An arrow between blocks is drawn by dragging from a block\'s anchor to another block. Ctrl+Z or the Delete key removes an extra block.'],

  /* ---------- поиск ---------- */
  'tw.se.0': ['Практика: поиск и команды', 'Hands-on: search and commands'],
  'tw.se.0.p': ['Поиск находит блоки, реплики, героев и любую команду программы. Если не знаете, где лежит функция, просто спросите её.', 'The search finds blocks, lines, characters and every command of the app. If you do not know where a function lives, just ask for it.'],
  'tw.se.1': ['Откройте поиск', 'Open the search'],
  'tw.se.1.p': ['Поиск открывает эта кнопка или сочетание Ctrl+K. Оно работает везде, в любом окне.', 'This button or the Ctrl+K shortcut opens the search. It works everywhere, in any window.'],
  'tw.se.1.t': ['Нажмите «Поиск» или Ctrl+K.', 'Press Search or Ctrl+K.'],
  'tw.se.2': ['Спросите словами', 'Ask in words'],
  'tw.se.2.p': ['Пишите, как думаете: «собрать игру», «тупики», имя героя, слово из реплики. Результаты группируются: блоки, реплики, команды. Enter открывает выбранное, стрелки листают.', 'Write as you think: "build the game", "dead ends", a character\'s name, a word from a line. The results are grouped: blocks, lines, commands. Enter opens the selected one, the arrows scroll.'],
  'tw.se.2.t': ['Напечатайте любое слово, например имя героя или «сборка».', 'Type any word, for example a character\'s name or "build".'],
  'tw.se.3': ['Готово', 'That is it'],
  'tw.se.3.p': ['Теперь вы знаете, как найти что угодно. Esc закрывает поиск.', 'Now you know how to find anything. Esc closes the search.'],
});

/** Короткая запись шага: ключ текстов tw.<id>.<n>, цель и дополнения. */
const twStep = (id, n, target, extra) => Object.assign({ target, h: t('tw.' + id + '.' + n), p: t('tw.' + id + '.' + n + '.p') }, extra || {});
const twTask = (id, n) => t('tw.' + id + '.' + n + '.t');
const twRootText = () => { const r = document.querySelector('#de-root'); return r ? r.textContent : ''; };
/** Ставит курсор в первый пустой абзац под заголовком главы, чтобы печать не попала в заголовок и не переименовала главу. */
function twCaret(tries = 6) {
  const root = document.querySelector('#de-root');
  if (!root) { if (tries > 0) setTimeout(() => twCaret(tries - 1), 150); return; }
  const para = [...root.querySelectorAll('p')].find(x => !x.textContent.trim()) || root.querySelector('p');
  if (!para) return;
  try {
    root.focus({ preventScroll: true });
    const r = document.createRange(); r.selectNodeContents(para); r.collapse(true);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  } catch (e) { /* курсор не встал: человек щёлкнет сам */ }
}
const twRootHtml = () => { const r = document.querySelector('#de-root'); return r ? r.innerHTML : ''; };

/** Редактор текста: открывает окно и ведёт по нему. */
function twTextEditor() {
  let txt0 = 0, html0 = '';
  const openEd = () => { if (!document.querySelector('.te-m')) { const id = [...UI.sel][0], n = id && nodeById(id); openTextEditor(n && n.type !== 'note' ? { nodeId: n.id } : {}); } };
  const S = (n, target, extra) => twStep('te', n, target, extra);
  return [
    S(0, '.te-m', { late: true, setup: openEd, p: t('tw.te.0.p') + '\n' + t('tw.undo') }),
    S(1, '.te-left', { late: true, setup: openEd }),
    S(2, '.de-ed', { late: true, live: true, cardAt: '.te-right', task: twTask('te', 2), setup: () => { openEd(); txt0 = twRootText().length; setTimeout(twCaret, 120); }, until: () => twRootText().length >= txt0 + 4 }),
    S(3, '#de-b-who', { late: true, live: true, cardAt: '.te-right', task: twTask('te', 3), setup: () => { openEd(); html0 = twRootHtml(); }, until: () => twRootHtml() !== html0 }),
    S(4, '#de-b-fork', { late: true, live: true, cardAt: '.te-right', task: twTask('te', 4), setup: () => { openEd(); html0 = twRootHtml(); }, until: () => twRootHtml() !== html0 }),
    S(5, '.de-tb', { late: true, setup: openEd, cardAt: '.te-right' }),
    S(6, '.te-right', { late: true, setup: openEd }),
    S(7, '#de-apply', { late: true, setup: openEd }),
    S(8, '#de-help', { late: true, setup: openEd }),
    S(9, null, { actions: [{ label: t('tour.openlessons'), run: () => setTimeout(() => openTour('texted'), 0) }] }),
  ];
}

/** Карта: двигаем, масштабируем, создаём блок и открываем его. */
function twMap() {
  let v0 = '', k0 = 0, n0 = 0;
  const S = (n, target, extra) => twStep('map', n, target, extra);
  const closeAll = () => { MODALS.slice().forEach(m => m.close()); closePopover(); };
  return [
    S(0, null, { setup: closeAll, p: t('tw.map.0.p') + '\n' + t('tw.undo') }),
    S(1, '#stage', { live: true, task: twTask('map', 1), setup: () => { v0 = P.view.x + ',' + P.view.y; }, until: () => (P.view.x + ',' + P.view.y) !== v0 }),
    S(2, '#stage', { live: true, task: twTask('map', 2), setup: () => { k0 = P.view.k; }, until: () => Math.abs(P.view.k - k0) > 0.001 }),
    S(3, '#stage', { live: true, task: twTask('map', 3), setup: () => { n0 = P.nodes.length; }, until: () => P.nodes.length > n0 }),
    S(4, '#stage', { live: true, task: twTask('map', 4), setup: () => { closeAll(); }, until: () => !!document.querySelector('.backdrop .modal') }),
    S(5, null, { setup: () => { /* окно блока можно оставить открытым: его закрывают крестиком */ } }),
  ];
}

/** Поиск (Ctrl+K): открыть и спросить словами. */
function twSearch() {
  let q0 = '';
  const qEl = () => document.querySelector('#search-q');
  const closeSearch = () => { if (typeof SEARCH !== 'undefined' && SEARCH && SEARCH.m && !SEARCH.m.closed) SEARCH.m.close(); };
  const S = (n, target, extra) => twStep('se', n, target, extra);
  return [
    S(0, null, { setup: () => { MODALS.slice().forEach(m => m.close()); closePopover(); } }),
    S(1, () => tourBtn(t('top.search') + ' (Ctrl+K)'), { live: true, task: twTask('se', 1), setup: closeSearch, until: () => !!qEl() }),
    S(2, '.search-m', { late: true, live: true, task: twTask('se', 2), setup: () => { q0 = qEl() ? qEl().value : ''; if (!qEl()) openSearch(); }, until: () => !!qEl() && qEl().value.trim().length >= 2 && qEl().value !== q0 }),
    S(3, null, { setup: closeSearch }),
  ];
}

const TOUR_WALKS = { texted: twTextEditor, map: twMap, search: twSearch };
/** Есть ли у урока практика, и сама практика. */
const tlWalkOf = l => (l && TOUR_WALKS[l.tool || l.id]) || null;
function tlWalkRun(l) {
  const w = tlWalkOf(l); if (!w) return false;
  return tourStart(w(), { onEnd: why => { if (why === 'done') tlMarkSeen(l.id); } });
}

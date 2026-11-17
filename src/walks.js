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

  /* ---------- редактор кода ---------- */
  'tw.ide.0': ['Практика: редактор кода', 'Hands-on: the code editor'],
  'tw.ide.0.p': ['Окно открылось само. Пройдём по нему: создадим файл, напечатаем строку, посмотрим структуру и быстрый поиск файла.\nФайл, который мы создадим, останется в проекте. В нём будет только комментарий, сборке он не мешает; убрать его можно в проводнике (правый клик по файлу → «Удалить…»).', 'The window has opened by itself. We will go through it: create a file, type a line, look at the outline and the quick file search.\nThe file we create stays in the project. It will hold only a comment, so it does not disturb the build; you can remove it in the explorer (right-click the file → Delete…).'],
  'tw.ide.1': ['Слева: проводник', 'On the left: the explorer'],
  'tw.ide.1.p': ['В начале списка «Код внутри проекта»: это ваш «Свой код», он хранится в проекте и при сборке попадает в игру. В программе для компьютера ниже виден проект Ren\'Py с диска: папку выбираете один раз. Глаз над списком показывает служебные файлы.', 'At the top of the list is "Code inside the project": it is your Custom code, stored in the project and added to the game on build. In the desktop app the Ren\'Py project from disk is shown below: you choose the folder once. The eye above the list shows service files.'],
  'tw.ide.2': ['Новый файл', 'A new file'],
  'tw.ide.2.p': ['Файл появится в списке и сразу откроется во вкладке справа. Если выбрана папка Ren\'Py, файл создастся в ней, иначе во «Свой код».', 'The file appears in the list and opens in a tab on the right at once. If a Ren\'Py folder is chosen, the file is created in it, otherwise in Custom code.'],
  'tw.ide.2.t': ['Нажмите этот значок, впишите имя (например `practice`) и «Создать».', 'Press this icon, type a name (for example `practice`) and press Create.'],
  'tw.ide.3': ['Пишем код', 'Writing code'],
  'tw.ide.3.p': ['Код раскрашен по языку файла. Пока печатаете, редактор подсказывает команды Ren\'Py, метки, героев и картинки проекта: выберите подсказку стрелками и примите клавишей Enter или Tab.', 'The code is coloured by the file language. While you type, the editor suggests Ren\'Py commands, labels, characters and project images: choose a suggestion with the arrows and accept it with Enter or Tab.'],
  'tw.ide.3.t': ['Щёлкните в поле и напечатайте комментарий, например `# моя проба`. Решётка начинает комментарий, игре он не мешает.', 'Click the field and type a comment, for example `# my try`. The hash sign starts a comment, the game ignores it.'],
  'tw.ide.4': ['Внизу: язык и положение', 'At the bottom: language and position'],
  'tw.ide.4.p': ['Здесь язык файла (щелчок по нему меняет подсветку), строка и столбец курсора, кодировка. Левая кнопка прячет и показывает проводник (Ctrl+B).', 'Here are the file language (click it to change the highlighting), the cursor line and column, and the encoding. The left button hides and shows the explorer (Ctrl+B).'],
  'tw.ide.5': ['Структура файла', 'The file outline'],
  'tw.ide.5.p': ['В большом файле удобно прыгать по меткам, экранам и функциям: раскройте «Структуру» под проводником и щёлкните по нужной строке. Пока файл пуст, список пуст, он наполнится по мере кода.', 'In a big file it is handy to jump between labels, screens and functions: open the Outline under the explorer and click a line. While the file is empty the list is empty too; it fills up as you write code.'],
  'tw.ide.6': ['Быстрый поиск файла', 'Quick file search'],
  'tw.ide.6.p': ['Ctrl+P находит любой файл по имени, Ctrl+G переходит к строке, Ctrl+S сохраняет, Ctrl+Shift+S сохраняет все файлы.', 'Ctrl+P finds any file by name, Ctrl+G jumps to a line, Ctrl+S saves, Ctrl+Shift+S saves every file.'],
  'tw.ide.6.t': ['Нажмите Ctrl+P (или значок поиска в проводнике, если он есть) и начните печатать имя файла. Esc закрывает поиск.', 'Press Ctrl+P and start typing a file name. Esc closes the search.'],
  'tw.ide.7': ['Сохранение и помощник', 'Saving and the helper'],
  'tw.ide.7.p': ['«Сохранить всё» записывает все изменённые файлы. Если закроете окно, не сохранив, правки вернутся при следующем открытии файла. Кнопка «ИИ» открывает помощника справа: он видит открытый файл (нужно подключение ИИ в «Настройки → Подключения»).', 'Save all writes every changed file. If you close the window without saving, your edits come back the next time you open the file. The AI button opens a helper on the right that sees the open file (it needs an AI connection in Settings → Connections).'],
  'tw.ide.8': ['Готово', 'That is it'],
  'tw.ide.8.p': ['Вы знаете главное: проводник, вкладки, подсказки, структура и быстрый поиск. Файл `practice` остался во «Свой код»: удалите его, если он не нужен.', 'You know the basics: the explorer, tabs, suggestions, the outline and the quick search. The file `practice` stays in Custom code: delete it if you do not need it.'],

  /* ---------- интерфейс: режимы, наборы, панель ---------- */
  'tw.modes.0': ['Практика: интерфейс', 'Hands-on: the interface'],
  'tw.modes.0.p': ['Посмотрим, где что лежит, и попробуем переключить режим. Всё обратимо: любое переключение можно вернуть тем же способом.', 'We will see where things live and try to switch the mode. Everything is reversible: any switch can be undone the same way.'],
  'tw.modes.1': ['Значок проекта', 'The project icon'],
  'tw.modes.1.p': ['Значок рядом с названием проекта открывает общее меню: новый проект, открыть, сохранить, сборка, настройки, тема, язык и справка.', 'The icon next to the project name opens the general menu: new project, open, save, build, settings, theme, language and help.'],
  'tw.modes.1.t': ['Нажмите на значок проекта.', 'Press the project icon.'],
  'tw.modes.2': ['Инструменты', 'Tools'],
  'tw.modes.2.p': ['Здесь живут все функции программы по разделам: карта, тексты, код, проверки, игра, команда. Если не помните, где что, нажмите Ctrl+K и напишите название.', 'Every function of the app lives here by section: map, texts, code, checks, play, team. If you do not remember where something is, press Ctrl+K and type its name.'],
  'tw.modes.2.t': ['Нажмите кнопку «Инструменты» (четыре кубика).', 'Press the Tools button (four cubes).'],
  'tw.modes.3': ['Настройки', 'Settings'],
  'tw.modes.3.p': ['В настройках выбирают вид программы: набор, режим, панель и модули. Там же подключения и копии.', 'The settings define how the app looks: the preset, the mode, the toolbar and the modules. The connections and backups are there too.'],
  'tw.modes.3.t': ['Нажмите «Настройки» на верхней панели.', 'Press Settings on the top bar.'],
  'tw.modes.4': ['Наборы', 'Presets'],
  'tw.modes.4.p': ['Набор одним нажатием настраивает режим, панель и модули: «Только пишу», «Пишу и собираю в Ren\'Py» или «Команда». Выбранный набор можно потом подправить вручную, а прежний вернуть тем же нажатием.', 'A preset sets the mode, the toolbar and the modules in one press: Just writing, Writing and building in Ren\'Py, or Team. You can adjust the chosen preset by hand afterwards and bring the old one back with the same press.'],
  'tw.modes.5': ['Режим', 'The mode'],
  'tw.modes.5.p': ['Простой режим показывает главное, остальное лежит под кнопкой «Инструменты». Профессиональный выводит все разделы на панель.', 'Simple mode shows the essentials, the rest lies under the Tools button. Professional mode puts every section on the bar.'],
  'tw.modes.5.t': ['Переключите режим на другой. Вернуть его можно тут же.', 'Switch the mode to the other one. You can switch it back right here.'],
  'tw.modes.6': ['Панель и модули', 'Toolbar and modules'],
  'tw.modes.6.p': ['Вкладка «Панель» решает, какие кнопки стоят наверху и в каком порядке (их можно перетаскивать). В профессиональном режиме есть и вкладка «Модули»: она выключает целые группы возможностей. Ничего не удаляется, выключенное всегда можно вернуть.', 'The Toolbar tab decides which buttons are on top and in what order (you can drag them). Professional mode also has a Modules tab that switches whole groups of features off. Nothing is deleted, anything switched off can be brought back.'],
  'tw.modes.7': ['Готово', 'That is it'],
  'tw.modes.7.p': ['Теперь вы знаете, где меню проекта, где все инструменты и где настраивается вид программы.', 'Now you know where the project menu is, where all the tools are and where the look of the app is set.'],
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

/** Редактор кода: файл, строка кода, структура, быстрый поиск. */
function twIde() {
  let tabs0 = 0, len0 = 0;
  const hostLen = () => { const e = document.querySelector('.ide-edhost'); return e ? e.textContent.length : 0; };
  const open = () => { if (!document.querySelector('.ide-m')) openIde(); };
  const S = (n, target, extra) => twStep('ide', n, target, extra);
  return [
    S(0, '.ide-m', { late: true, setup: () => { MODALS.slice().forEach(m => m.close()); closePopover(); openIde(); } }),
    S(1, '.ide-side', { late: true, setup: open }),
    S(2, '#ide-newfile', { late: true, live: true, task: twTask('ide', 2), setup: () => { open(); tabs0 = document.querySelectorAll('.ide-tab').length; }, until: () => document.querySelectorAll('.ide-tab').length > tabs0 }),
    S(3, '.ide-edwrap', { late: true, live: true, cardAt: '.ide-status', task: twTask('ide', 3), setup: () => { open(); len0 = hostLen(); }, until: () => hostLen() >= len0 + 3 }),
    S(4, '.ide-status', { late: true, setup: open }),
    S(5, '.ide-olbox', { late: true, setup: open }),
    S(6, '.ide-edwrap', { late: true, live: true, cardAt: '.ide-status', task: twTask('ide', 6), setup: () => { open(); const q = document.querySelector('#ide-qo'); if (q) q.closest('.ide-qo').remove(); }, until: () => !!document.querySelector('#ide-qo') }),
    S(7, '#ide-saveall', { late: true, setup: () => { open(); const q = document.querySelector('.ide-qo'); if (q) q.remove(); } }),
    S(8, null, { actions: [{ label: t('tour.openlessons'), run: () => setTimeout(() => openTour('ide'), 0) }] }),
  ];
}

/** Интерфейс: меню проекта, «Инструменты», настройки, режим. */
function twModes() {
  let mode0 = '';
  const popOpen = () => !!document.querySelector('.pop');
  const toolsBtn = () => document.querySelector('.tools-btn') || document.querySelector('.more-btn');
  const setOpen = () => !!document.querySelector('.set-modal');
  const openSet = () => { if (!setOpen()) openSettingsWindow('view'); };
  const card = txt => () => [...document.querySelectorAll('.set-modal .set-pane .nt-list > *')].find(x => x.textContent.trim().startsWith(txt)) || null;
  const closeAll = () => { MODALS.slice().forEach(m => m.close()); closePopover(); };
  const S = (n, target, extra) => twStep('modes', n, target, extra);
  return [
    S(0, null, { setup: closeAll, p: t('tw.modes.0.p') + '\n' + t('tw.undo') }),
    S(1, '#app-logo', { live: true, task: twTask('modes', 1), setup: closeAll, until: popOpen }),
    S(2, toolsBtn, { live: true, task: twTask('modes', 2), setup: closePopover, until: popOpen }),
    S(3, () => tourBtn(t('top.settings')), { live: true, task: twTask('modes', 3), setup: closeAll, until: setOpen }),
    S(4, card(t('ui.preset')), { late: true, setup: openSet }),
    S(5, card(t('ui.mode')), { late: true, live: true, task: twTask('modes', 5), setup: () => { openSet(); mode0 = uiCfg().mode; }, until: () => uiCfg().mode !== mode0 }),
    S(6, '.set-modal .set-body > .seg', { late: true, setup: openSet }),
    S(7, null, { setup: closeAll, actions: [{ label: t('tour.openlessons'), run: () => setTimeout(() => openTour('modes'), 0) }] }),
  ];
}

const TOUR_WALKS = { texted: twTextEditor, map: twMap, search: twSearch, ide: twIde, modes: twModes };
/** Есть ли у урока практика, и сама практика. */
const tlWalkOf = l => (l && TOUR_WALKS[l.tool || l.id]) || null;
function tlWalkRun(l) {
  const w = tlWalkOf(l); if (!w) return false;
  return tourStart(w(), { onEnd: why => { if (why === 'done') tlMarkSeen(l.id); } });
}

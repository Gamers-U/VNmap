'use strict';
/* ====== Практика для остальных уроков ======
   Движок тот же (tour.js, walks.js). Каждая практика описана данными в TW_SPEC: окно урока (win), как его открыть (open),
   части окна (parts) и, где уместно, живое задание (watch: что-то в этой части должно измениться).
   Шаги складываются так: вступление (окно открывается само) → части окна по одной → «Готово» с кнопкой «Открыть список уроков».
   Тексты лежат под ключами tw.<урок>.<n>, tw.<урок>.<n>.p и tw.<урок>.<n>.t (задание); n=0 это вступление (только .p).
   Если нужного места нет (пустой проект, окно не открылось), шаг пропускается сам, поэтому застрять нельзя. */

Object.assign(D, {
  'tw.intro': ['Практика: {0}', 'Hands-on: {0}'],
  'tw.fin': ['Готово', 'That is it'],
  'tw.fin.p': ['Теперь вы знаете, где это лежит и как этим пользоваться. Всё, что вы сделали, осталось в проекте, а любую пробу отменяет Ctrl+Z. Урок отмечен пройденным.', 'Now you know where it lives and how to use it. Everything you did stayed in the project, and Ctrl+Z undoes any try. The lesson is marked as done.'],
  'tw.find.t': ['Нажмите подсвеченную кнопку и выберите нужный пункт: так вы запомните, где он лежит.', 'Press the highlighted button and pick the item: this is how you will remember where it lives.'],

  /* ---------- блок и его окно ---------- */
  'tw.blocks.0.p': ['Откроем окно блока и пройдём по нему: название и тип, главы слева и вкладки главы справа.', 'We will open a block window and walk through it: the name and the type, the chapters on the left and the chapter tabs on the right.'],
  'tw.blocks.1': ['Название и тип', 'The name and the type'],
  'tw.blocks.1.p': ['Название блока видно на карте. Рядом выбирают тип: блок глав, развилка, концовка или заметка. От типа зависят форма блока и то, что попадёт в сборку.', 'The block name is shown on the map. Next to it you pick the type: chapters, fork, ending or note. The type defines the block shape and what goes into the build.'],
  'tw.blocks.1.t': ['Щёлкните в название и допишите любой символ (вернуть прежнее можно Ctrl+Z).', 'Click into the name and add any character (Ctrl+Z brings the old name back).'],
  'tw.blocks.2': ['Слева: главы блока', 'On the left: the block chapters'],
  'tw.blocks.2.p': ['У блока может быть несколько глав, каждая это файл сценария. Кнопка со знаком плюс внизу списка добавляет новую главу.', 'A block can have several chapters, each one is a script file. The plus button under the list adds a new chapter.'],
  'tw.blocks.2.t': ['Нажмите на любую главу в списке слева.', 'Click any chapter in the list on the left.'],
  'tw.blocks.3': ['Справа: вкладки главы', 'On the right: the chapter tabs'],
  'tw.blocks.3.p': ['У главы вкладки «Сводка», «Ассеты», «Скрипт», «Диалоги» и «Текст». Правки применяются сразу, кнопки «Сохранить» нет. Плавающая панель над выделенным блоком на карте даёт цвет, тип, дубликат и новую стрелку.', 'A chapter has the tabs Summary, Assets, Script, Dialogues and Text. Edits apply at once, there is no Save button. The floating bar above a selected block on the map gives the color, the type, a duplicate and a new arrow.'],

  /* ---------- стрелки ---------- */
  'tw.edges.0.p': ['Посмотрим, как устроена стрелка: что на ней написано и что можно задать в её окне.', 'We will look at how an arrow works: what is written on it and what can be set in its window.'],
  'tw.edges.none': ['В проекте пока нет ни одной стрелки, поэтому показывать нечего. Соедините два блока (потяните от якоря блока к другому блоку) и пройдите практику ещё раз.', 'There are no arrows in the project yet, so there is nothing to show. Connect two blocks (drag from a block anchor to another block) and take the hands-on lesson again.'],
  'tw.edges.1': ['Стрелка: выбор или переход', 'An arrow: a choice or a transition'],
  'tw.edges.1.p': ['Стрелка соединяет два блока. Если из блока выходит несколько стрелок, каждая становится пунктом выбора у игрока, а при сборке из них строятся `menu` и `jump`.', 'An arrow connects two blocks. If several arrows leave a block, each one becomes a choice for the player, and the build turns them into `menu` and `jump`.'],
  'tw.edges.2': ['Окно стрелки', 'The arrow window'],
  'tw.edges.2.p': ['Окно открывается двойным щелчком по стрелке; сейчас оно открыто само. Здесь лежит всё, что относится к этому выбору.', 'The window opens by double-clicking an arrow; it has been opened for you. Everything about this choice lives here.'],
  'tw.edges.3': ['Название выбора', 'The choice text'],
  'tw.edges.3.p': ['Это текст пункта, который увидит игрок. Пустое название значит простой переход без выбора.', 'This is the text of the item the player sees. An empty name means a plain transition without a choice.'],
  'tw.edges.3.t': ['Впишите название выбора, например «Пойти в кружок» (потом можно стереть).', 'Type a choice text, for example "Join the club" (you can erase it later).'],
  'tw.edges.4': ['Условие и код', 'Condition and code'],
  'tw.edges.4.p': ['«Условие показа» скрывает пункт, пока оно не выполнено; его можно собрать конструктором без кода. «Код при выборе» меняет переменные, например `maks_like += 1`. Слои «эхо выборов» и «стрелки по коду» на карте показывают, где флаг запоминается и где проверяется.', 'The show condition hides the item until it is met; it can be built with the constructor, no code needed. The code on choice changes variables, for example `maks_like += 1`. The layers "choice echo" and "code arrows" on the map show where a flag is remembered and where it is checked.'],

  /* ---------- сохранение ---------- */
  'tw.save.0.p': ['Покажем, где видно состояние сохранения и как сделать резервную копию.', 'We will show where the saving state is visible and how to make a backup.'],
  'tw.save.1': ['Метка сохранения', 'The save badge'],
  'tw.save.1.p': ['Проект сохраняется сам. Метка рядом с названием показывает, что происходит: «сохранено», «сохраняется» или ошибка. Если нажать на метку, откроется окно копий.', 'The project saves by itself. The badge next to the name shows what is going on: saved, saving or an error. Press the badge to open the backups window.'],
  'tw.save.2': ['Резервная копия', 'A backup'],
  'tw.save.2.p': ['Окно копий открылось само. Копия запоминает проект на этот момент: её удобно сделать перед большой правкой, например «до правки финала». Свои копии сами не удаляются.', 'The backups window has opened. A copy remembers the project at this moment, which is handy before a big edit, for example "before the finale rewrite". Your own copies are never deleted automatically.'],
  'tw.save.2.t': ['Впишите имя копии, например «проба» (копия появится, только когда нажмёте «Сделать копию»).', 'Type a backup name, for example "try" (the copy appears only when you press Make a backup).'],
  'tw.save.3': ['Кнопка копии', 'The backup button'],
  'tw.save.3.p': ['«Сделать копию» записывает проект. Ниже будет список копий: «Сравнить» покажет, что изменилось, «Восстановить» вернёт проект к копии, а Ctrl+Z отменит само восстановление.', 'Make a backup saves the project. A list of copies appears below: Compare shows what changed, Restore brings the project back to the copy, and Ctrl+Z cancels the restore itself.'],
  'tw.save.4': ['Автокопии', 'Automatic copies'],
  'tw.save.4.p': ['Галочка включает автоматические копии: программа сама делает их через равные промежутки. В программе для компьютера Ctrl+S пишет в файл `.vnmap`, в браузере скачивает копию файла.', 'This checkbox turns on automatic copies: the app makes them at equal intervals. In the desktop app Ctrl+S writes to the `.vnmap` file, in the browser it downloads a copy of the file.'],

  /* ---------- реестр ---------- */
  'tw.registry.0.p': ['Реестр открылся на вкладке персонажей. Пройдём по нему: вкладки слева, поиск и карточки записей.', 'The registry has opened on the characters tab. We will walk through it: the tabs on the left, the search and the record cards.'],
  'tw.registry.1': ['Вкладки реестра', 'The registry tabs'],
  'tw.registry.1.p': ['Здесь живёт всё общее для проекта: сводка, персонажи, фоны, спрайты, аудио, переменные, достижения и интерфейс игры. У каждого вида ресурсов своя вкладка.', 'Everything shared by the project lives here: the summary, characters, backgrounds, sprites, audio, variables, achievements and the game interface. Every kind of resource has its own tab.'],
  'tw.registry.1.t': ['Нажмите на другую вкладку, например «Фоны».', 'Press another tab, for example Backgrounds.'],
  'tw.registry.2': ['Поиск', 'The search'],
  'tw.registry.2.p': ['Строка поиска ищет по записям открытой вкладки: по имени и по тегу.', 'The search line looks through the records of the open tab: by name and by tag.'],
  'tw.registry.2.t': ['Напечатайте любую букву.', 'Type any letter.'],
  'tw.registry.3': ['Карточки записей', 'The record cards'],
  'tw.registry.3.p': ['Запись это карточка: имя, тег Ren\'Py, цвет, файл. Реплики в сценарии привязываются к герою по тегу. Если у фона или спрайта нет файла, при сборке подставится заглушка. На карточке героя есть «Страница персонажа» и «Переименовать везде…».', 'A record is a card: the name, the Ren\'Py tag, the color, the file. Lines in the script are bound to a character by the tag. If a background or a sprite has no file, a placeholder is used in the build. A character card has Character page and Rename everywhere.'],

  /* ---------- расстановка блоков ---------- */
  'tw.layout.0.p': ['Это окно открывается маленьким меню. Найдём его по кнопкам и посмотрим, что в нём выбирают.', 'This one opens as a small menu. We will find it by the buttons and look at what you choose in it.'],
  'tw.layout.1': ['Где лежит «Расставить блоки»', 'Where Arrange blocks lives'],
  'tw.layout.2': ['Что выбирают', 'What you choose'],
  'tw.layout.2.p': ['Выберите направление (слева направо или сверху вниз) и что расставлять: всю карту или только выделенные блоки. Подтвердите кнопкой внизу. Если результат не нравится, Ctrl+Z вернёт прежнее расположение. Выделите несколько блоков заранее, чтобы расставить только их.', 'Choose the direction (left to right or top to bottom) and what to arrange: the whole map or only the selected blocks. Confirm with the button at the bottom. If you do not like the result, Ctrl+Z brings the old layout back. Select several blocks beforehand to arrange only them.'],

  /* ---------- карта в PDF ---------- */
  'tw.mappdf.0.p': ['Окно открылось само. Пройдём по нему: что печатать, как расположить лист и как сохранить файл.', 'The window has opened. We will go through it: what to print, how to lay out the sheet and how to save the file.'],
  'tw.mappdf.1': ['Что и как печатать', 'What to print and how'],
  'tw.mappdf.1.p': ['Область: вся карта или как на экране. Ориентация листа: авто, альбомная или книжная. Масштаб: уместить на одном листе или крупно на нескольких.', 'The area: the whole map or as on screen. The sheet orientation: auto, landscape or portrait. The scale: fit on one sheet or large on several sheets.'],
  'tw.mappdf.1.t': ['Переключите область или ориентацию любой кнопкой.', 'Switch the area or the orientation with any button.'],
  'tw.mappdf.2': ['Размер листа', 'The sheet size'],
  'tw.mappdf.2.p': ['Для большой карты поставьте крупный лист и масштаб поменьше: так подписи останутся читаемыми.', 'For a big map pick a large sheet and a smaller scale: the labels stay readable.'],
  'tw.mappdf.3': ['Сохранить PDF', 'Save the PDF'],
  'tw.mappdf.3.p': ['Здесь же тема (светлая для печати, тёмная для экрана) и чёткость. Кнопка «Сохранить PDF» делает файл, чтобы распечатать или показать издателю.', 'The theme (light for print, dark for screens) and the sharpness are set here too. The Save PDF button makes a file to print or to show a publisher.'],

  /* ---------- заметки ---------- */
  'tw.notes.0.p': ['Откроем список всех заметок проекта и посмотрим, как с ним работать.', 'We will open the list of all project notes and see how to work with it.'],
  'tw.notes.1': ['Фильтры', 'The filters'],
  'tw.notes.1.p': ['«Открытые», «Решённые» и «Все» переключают список, поиск находит заметку по слову.', 'Open, Resolved and All switch the list, the search finds a note by a word.'],
  'tw.notes.1.t': ['Нажмите «Все» или «Решённые».', 'Press All or Resolved.'],
  'tw.notes.2': ['Список заметок', 'The list of notes'],
  'tw.notes.2.p': ['Сюда попадают и стикеры с карты, и заметки на блоках. У каждой есть «Открыть заметку» (переход к месту на карте) и «Решено», когда вопрос закрыт.', 'Both stickers from the map and notes on blocks come here. Each one has Open note (a jump to its place on the map) and Resolved once the question is closed.'],

  /* ---------- импорт из Docs/Word ---------- */
  'tw.docimport.0.p': ['Окно импорта открылось. Пройдём по нему, ничего не импортируя в проект.', 'The import window has opened. We will walk through it without importing anything into the project.'],
  'tw.docimport.1': ['Вставьте текст', 'Paste the text'],
  'tw.docimport.1.p': ['Сюда вставляют текст из Google Docs или Word. Можно и загрузить файл кнопкой «Выбрать файл…».', 'Paste text from Google Docs or Word here. You can also load a file with the Choose file button.'],
  'tw.docimport.1.t': ['Напечатайте или вставьте пару строк (в проект они не попадут, пока не нажмёте «Импортировать»).', 'Type or paste a couple of lines (they will not reach the project until you press Import).'],
  'tw.docimport.2': ['Импортировать', 'Import'],
  'tw.docimport.2.p': ['Программа разберёт текст на блоки и главы и сначала покажет, что изменится. Повторный импорт не затирает правки молча. Проверьте результат на карте.', 'The app splits the text into blocks and chapters and shows what changes first. A repeated import does not silently overwrite your edits. Check the result on the map.'],

  /* ---------- выжимка для корректора ---------- */
  'tw.digest.0.p': ['Окно выжимки открылось. Пройдём по нему: что включить, как выглядит документ и в каком формате его сохранить.', 'The digest window has opened. We will go through it: what to include, how the document looks and in which format to save it.'],
  'tw.digest.1': ['Что включить', 'What to include'],
  'tw.digest.1.p': ['Весь проект или только выбранную часть. В выжимке нет команд Ren\'Py: корректор видит только реплики и подписи.', 'The whole project or only the chosen part. The digest has no Ren\'Py commands: the proofreader sees only lines and captions.'],
  'tw.digest.2': ['Вид документа', 'The look of the document'],
  'tw.digest.2.p': ['«Сплошной текст» или «Таблица с колонкой для замечаний». Галочки решают, показывать ли имя героя, метку в коде, курсив и жирный.', 'Plain text or a table with a column for remarks. The checkboxes decide whether to show the character name, the label in the code, italic and bold.'],
  'tw.digest.2.t': ['Переключите вид документа любой кнопкой.', 'Switch the document look with any button.'],
  'tw.digest.3': ['Формат файла', 'The file format'],
  'tw.digest.3.p': ['Word (.docx), PDF через печать, HTML, TXT или Markdown. Сохраните файл и отправьте корректору или редактору.', 'Word (.docx), PDF through print, HTML, TXT or Markdown. Save the file and send it to a proofreader or an editor.'],

  /* ---------- таблица реплик ---------- */
  'tw.replicas.0.p': ['Таблица реплик открылась. Пройдём по фильтрам и по самой таблице.', 'The lines table has opened. We will go through the filters and the table itself.'],
  'tw.replicas.1': ['Фильтры', 'The filters'],
  'tw.replicas.1.p': ['Поиск по словам, фильтры по герою и блоку и вид: «Всё», «Реплики», «Выборы».', 'Search by words, filters by character and block and the view: All, Lines, Choices.'],
  'tw.replicas.1.t': ['Нажмите «Реплики» или впишите слово в поиск.', 'Press Lines or type a word into the search.'],
  'tw.replicas.2': ['Таблица реплик', 'The lines table'],
  'tw.replicas.2.p': ['Все реплики проекта в порядке прохождения. Фразу можно править прямо в таблице: изменение попадёт в сценарий главы. Так удобно искать опечатки и повторы фраз у одного героя. «Выгрузить» сохраняет таблицу файлом.', 'All the project lines in the order of play. A line can be edited right in the table: the change goes into the chapter script. This is handy for finding typos and repeated phrases of one character. Export saves the table to a file.'],

  /* ---------- лист озвучки ---------- */
  'tw.voicesheet.0.p': ['Лист озвучки открылся. Пройдём по нему: актёры, статусы записи и выгрузка для студии.', 'The voice sheet has opened. We will go through it: the actors, the recording statuses and the export for a studio.'],
  'tw.voicesheet.1': ['Актёры', 'The actors'],
  'tw.voicesheet.1.p': ['Вверху актёры озвучки (или персонажи, если актёр не назначен в карточке героя) и число реплик у каждого. Нажмите на одного: таблица покажет только его реплики и время записи.', 'At the top there are the voice actors (or characters if no actor is set in the character card) and the number of lines for each. Press one: the table shows only their lines and the recording time.'],
  'tw.voicesheet.1.t': ['Нажмите на любого актёра или героя в списке.', 'Press any actor or character in the list.'],
  'tw.voicesheet.2': ['Статусы записи', 'Recording statuses'],
  'tw.voicesheet.2.p': ['«Нужно записать», «В скрипте, файла нет», «Озвучена». Статус обновляется сам, когда в реестр загружен файл. Указания актёру пишите в конце строки реплики после «#»: они попадут в колонку «Заметка».', 'To record, In the script but no file, Voiced. The status updates itself once a file is loaded into the registry. Write directions for an actor at the end of a line after "#": they go to the Note column.'],
  'tw.voicesheet.3': ['Выгрузка для студии', 'Export for a studio'],
  'tw.voicesheet.3.p': ['«Выгрузить»: Excel с листом на каждого актёра или CSV того, что показано. Кнопка «Вставить voice…» дописывает строки `voice` в сценарий.', 'Export: an Excel file with a sheet for each actor or a CSV of what is shown. The Insert voice button adds `voice` lines to the script.'],

  /* ---------- рецепты ---------- */
  'tw.recipes.0.p': ['Окно рецептов открылось. Посмотрим, что в карточках и как рецепт попадает в проект.', 'The recipes window has opened. We will see what is in the cards and how a recipe gets into the project.'],
  'tw.recipes.1': ['Карточка рецепта', 'A recipe card'],
  'tw.recipes.1.p': ['Каждая карточка это готовая механика: шкала симпатии, характеристики героя, переписка в телефоне, инвентарь. «Показать код» раскрывает, что именно добавится.', 'Every card is a ready mechanic: an affection meter, hero stats, a phone chat, an inventory. Show code reveals exactly what will be added.'],
  'tw.recipes.1.t': ['Нажмите «Показать код» у любого рецепта.', 'Press Show code on any recipe.'],
  'tw.recipes.2': ['Добавить в проект', 'Add to the project'],
  'tw.recipes.2.p': ['Кнопка «Добавить в проект» заводит переменные и кладёт куски кода в «Сниппеты». Дальше в окне блока, на вкладке «Скрипт», кнопка «Сниппет» вставляет нужный кусок и спрашивает значения пустых мест. Рецепты написаны по документации Ren\'Py, но в настоящем Ren\'Py проверены не все.', 'Add to the project creates the variables and puts code pieces into Snippets. Then in the block window, on the Script tab, the Snippet button inserts the needed piece and asks for the blanks. The recipes follow the Ren\'Py documentation, but not all of them are checked in the real Ren\'Py.'],

  /* ---------- переименование ---------- */
  'tw.rename.0.p': ['Окно переименования открылось. Пройдём по нему: что менять, на что и где это изменится.', 'The rename window has opened. We will go through it: what to change, to what and where it changes.'],
  'tw.rename.1': ['Что переименовать', 'What to rename'],
  'tw.rename.1.p': ['Персонаж, флаг (переменная) или метка. Выбор вида меняет список ниже.', 'A character, a flag (variable) or a label. The choice of the kind changes the list below.'],
  'tw.rename.1.t': ['Нажмите «Флаг или переменная».', 'Press Flag or variable.'],
  'tw.rename.2': ['Старое и новое имя', 'The old and the new name'],
  'tw.rename.2.p': ['Выберите имя из списка и впишите новое. Замена идёт во всех сценариях сразу.', 'Pick a name from the list and type the new one. The replacement goes through all the scripts at once.'],
  'tw.rename.3': ['Предпросмотр', 'The preview'],
  'tw.rename.3.p': ['Здесь перечислены все места замены до того, как вы её подтвердите. Кнопка «Переименовать» внизу применит замену, а Ctrl+Z вернёт всё назад.', 'All the replacement places are listed here before you confirm. The Rename button at the bottom applies the change and Ctrl+Z brings everything back.'],

  /* ---------- страница персонажа ---------- */
  'tw.charpage.0.p': ['Страница персонажа открылась. Пройдём по списку героев и по самой странице.', 'The character page has opened. We will go through the list of characters and the page itself.'],
  'tw.charpage.1': ['Выберите героя', 'Choose a character'],
  'tw.charpage.1.p': ['Список героев проекта. Ниже сводка: сколько он говорит, в каких образах появляется и где его реплики.', 'The list of the project characters. Below is a summary: how much the character speaks, in which looks they appear and where their lines are.'],
  'tw.charpage.1.t': ['Выберите другого героя в списке (если он в проекте один, нажмите «Далее»).', 'Pick another character in the list (if there is only one in the project, press Next).'],
  'tw.charpage.2': ['Что на странице', 'What is on the page'],
  'tw.charpage.2.p': ['«Образы» (спрайты и выражения), «Где говорит» (блоки; кнопки ведут на карту и в блок) и «Реплики». Сверху кнопки ведут к карточке в реестре и к «Переименовать везде…». Если герой почти молчит, а в сюжете главный, это повод пересмотреть сцены.', 'Looks (sprites and expressions), Where they speak (blocks; the buttons lead to the map and into the block) and Lines. The buttons at the top lead to the registry card and to Rename everywhere. If a character almost never speaks but is a main one in the plot, it is a reason to rethink the scenes.'],

  /* ---------- ресурсы ---------- */
  'tw.resources.0.p': ['Окно ресурсов открылось. Пройдём по нему: где смотреть, что нужно, и как отдать список художнику.', 'The resources window has opened. We will go through it: where to look, what is needed and how to hand the list to an artist.'],
  'tw.resources.1': ['Где смотреть', 'Where to look'],
  'tw.resources.1.p': ['Этот список ограничивает область: весь проект или один блок. Рядом переключатели вида («По блокам», «По ресурсам»), типа ресурса и фильтры «Не хватает», «Готовы».', 'This list limits the scope: the whole project or one block. Next to it are the switches for the view (By blocks, By resources), the resource kind and the filters Missing, Ready.'],
  'tw.resources.1.t': ['Выберите в списке один блок или «Весь проект».', 'Pick one block or Whole project in the list.'],
  'tw.resources.2': ['Список ресурсов', 'The resource list'],
  'tw.resources.2.p': ['Для каждого ресурса видно, есть ли он в реестре и есть ли файл. Под названием отмечают статус работы (заказано, в работе, получено, вставлено), срок и исполнителя. Вверху «Копировать чек-лист», CSV и XLSX: список можно отдать художнику или композитору.', 'For each resource you can see whether it is in the registry and whether there is a file. Under the name you mark the work status (ordered, in progress, received, inserted), the deadline and the person. At the top there are Copy checklist, CSV and XLSX: the list can be handed to an artist or a composer.'],

  /* ---------- сниппеты ---------- */
  'tw.snippets.0.p': ['Библиотека сниппетов открылась. Пройдём по ней: готовые примеры, свой сниппет, поиск и файлы.', 'The snippet library has opened. We will go through it: ready examples, your own snippet, search and files.'],
  'tw.snippets.1': ['Готовые примеры', 'Ready examples'],
  'tw.snippets.1.p': ['«Добавить примеры» кладёт в библиотеку заготовки: затемнение экрана, выбор с проверкой флага, появление героя. Их можно править.', 'Add examples puts ready pieces into the library: a screen fade, a choice with a flag check, a hero appearing. They can be edited.'],
  'tw.snippets.2': ['Свой сниппет', 'Your own snippet'],
  'tw.snippets.2.p': ['«Новый сниппет»: имя и код. В коде оставляйте пустые места `{{имя}}` или `{{имя=значение}}`: при вставке программа спросит, чем их заполнить. В окне блока, на вкладке «Скрипт», кнопка «Сниппет» вставляет выбранный после текущей строки.', 'New snippet: a name and the code. Leave blanks `{{name}}` or `{{name=value}}` in the code: on insert the app asks what to fill them with. In the block window, on the Script tab, the Snippet button inserts the chosen one after the current line.'],
  'tw.snippets.3': ['Поиск', 'The search'],
  'tw.snippets.3.p': ['Когда сниппетов много, поиск находит нужный по имени и по тексту.', 'When there are many snippets, the search finds the right one by name and by text.'],
  'tw.snippets.3.t': ['Напечатайте любое слово.', 'Type any word.'],
  'tw.snippets.4': ['В файл и из файла', 'To a file and from a file'],
  'tw.snippets.4.p': ['«Сохранить в файл» и «Загрузить из файла» переносят библиотеку между проектами и друзьям.', 'Save to file and Load from file move the library between projects and to friends.'],

  /* ---------- свой код ---------- */
  'tw.customcode.0.p': ['Окно «Свой код» открылось. Пройдём по нему: где добавить код, как загрузить файл и что с ним делает сборка.', 'The Custom code window has opened. We will go through it: where to add code, how to load a file and what the build does with it.'],
  'tw.customcode.1': ['Добавить код', 'Add code'],
  'tw.customcode.1.p': ['«Добавить»: выберите пример или вставьте свой код (экран, `init python`, стиль). Сборка кладёт каждый файл в игру как есть.', 'Add: pick an example or paste your own code (a screen, `init python`, a style). The build puts every file into the game as it is.'],
  'tw.customcode.2': ['Загрузить .rpy', 'Load .rpy'],
  'tw.customcode.2.p': ['Готовый файл можно загрузить. Имя станет `game/имя.rpy`, а сборка проверит табуляцию, повторные определения и совпадение меток с главами.', 'A ready file can be loaded. The name becomes `game/name.rpy`, and the build checks tabs, repeated definitions and label clashes with chapters.'],
  'tw.customcode.3': ['Список файлов', 'The file list'],
  'tw.customcode.3.p': ['Здесь все файлы своего кода. Тот же код виден и в «Редакторе кода» в разделе «Код внутри проекта». Импорт `.rpy` кладёт сюда код вне меток: экраны, `init python`, стили.', 'All your code files are here. The same code is visible in the Code editor in the section Code inside the project. The `.rpy` import puts the code outside labels here: screens, `init python`, styles.'],

  /* ---------- перевод ---------- */
  'tw.translate.0.p': ['Окно перевода открылось. Пройдём по нему: выбор языка и таблица строк.', 'The translation window has opened. We will go through it: the language choice and the table of lines.'],
  'tw.translate.1': ['Язык', 'The language'],
  'tw.translate.1.p': ['Кнопка «Язык» открывает список: выберите язык, и каждая реплика, пункт выбора, подпись и озвучка получат строку для перевода. «Другой язык…» добавляет любой, которого нет в списке.', 'The Language button opens a list: pick a language and every line, choice, caption and voice gets a string for translation. Another language adds any that is not in the list.'],
  'tw.translate.1.t': ['Нажмите кнопку «Язык»: откроется список языков (выбирать язык сейчас не обязательно).', 'Press the Language button: a list of languages opens (you do not have to pick one now).'],
  'tw.translate.2': ['Таблица перевода', 'The translation table'],
  'tw.translate.2.p': ['Слева оригинал, справа перевод, у строки статус: черновик, на проверке, готово. Если исходный текст изменили, перевод помечается устаревшим. Таблицу можно выгрузить в CSV, отдать переводчику и загрузить обратно. При сборке она превращается в `game/tl/<язык>` и меню выбора языка.', 'The original is on the left, the translation on the right, a line has a status: draft, in review, done. If the source text changed, the translation is marked outdated. The table can be exported to CSV, given to a translator and loaded back. The build turns it into `game/tl/<language>` and a language menu.'],

  /* ---------- импорт .rpy ---------- */
  'tw.rpyimport.0.p': ['Окно импорта `.rpy` открылось. Пройдём по нему, ничего не импортируя в проект.', 'The `.rpy` import window has opened. We will go through it without importing anything into the project.'],
  'tw.rpyimport.1': ['Выбрать файлы', 'Choose files'],
  'tw.rpyimport.1.p': ['Укажите свои исходники `.rpy` или архив `.zip`. Импорт нужен, если вы начали новеллу в Ren\'Py и хотите дальше вести её на карте.', 'Pick your `.rpy` sources or a `.zip` archive. The import is for when you started the novel in Ren\'Py and want to continue it on the map.'],
  'tw.rpyimport.2': ['Импортировать', 'Import'],
  'tw.rpyimport.2.p': ['Перед записью программа покажет найденные метки, выборы и переходы. Подтвердите, и на карте появятся блоки и главы. Код вне меток (экраны, `init python`) уйдёт в «Свой код».', 'Before saving, the app shows the labels, choices and jumps it found. Confirm, and blocks and chapters appear on the map. The code outside labels (screens, `init python`) goes to Custom code.'],

  /* ---------- интерфейс игры ---------- */
  'tw.gui.0.p': ['Реестр открылся на вкладке «Интерфейс (GUI)». Посмотрим, что здесь меняют и как это применяется.', 'The registry has opened on the Interface (GUI) tab. We will see what is changed here and how it is applied.'],
  'tw.gui.1': ['Как это работает', 'How it works'],
  'tw.gui.1.p': ['Подсказка вверху вкладки: если не добавлять свои картинки интерфейса, настройки применятся при сборке сами.', 'The hint at the top of the tab: if you add no pictures of your own, the settings are applied by the build by themselves.'],
  'tw.gui.2': ['Цвета, размеры, шрифты', 'Colors, sizes, fonts'],
  'tw.gui.2.p': ['Окно с текстом, плашка имени, кнопки выбора, меню: меняйте цвета, размеры текста и шрифты. «Сбросить» возвращает стандарт, «Загрузить» заменяет стандартную картинку своей. Не уверены, что менять? Соберите игру и посмотрите её в плеере: настройки видны сразу.', 'The text window, the name plate, the choice buttons, the menu: change the colors, the text sizes and the fonts. Reset brings the default back, Load replaces a standard picture with your own. Not sure what to change? Build the game and look at it in the player: the settings show at once.'],

  /* ---------- проверка сюжета ---------- */
  'tw.checks.0.p': ['Окно проверки сюжета открылось. Пройдём по нему: уровни важности и список проблем.', 'The story check window has opened. We will go through it: the severity levels and the list of problems.'],
  'tw.checks.1': ['Уровни важности', 'Severity levels'],
  'tw.checks.1.p': ['Ошибки ломают игру (тупики, битые переходы, повторы меток), предупреждения похожи на ошибку, замечания это советы. Числа показывают, сколько пунктов каждого вида.', 'Errors break the game (dead ends, broken jumps, repeated labels), warnings look like errors, remarks are advice. The numbers show how many items of each kind there are.'],
  'tw.checks.1.t': ['Нажмите «Ошибки» или «Все».', 'Press Errors or All.'],
  'tw.checks.2': ['Список проблем', 'The list of problems'],
  'tw.checks.2.p': ['Нажмите на пункт, и карта перейдёт к блоку: там можно исправить. Запускайте проверку перед каждой сборкой: это быстрее, чем искать тупик в игре.', 'Press an item and the map goes to the block, where you can fix it. Run the check before every build: it is faster than hunting for a dead end in the game.'],

  /* ---------- недостающие файлы ---------- */
  'tw.missingfiles.0.p': ['Окно недостающих файлов открылось. Посмотрим, как здесь подтягивают файлы.', 'The missing files window has opened. We will see how files are pulled in here.'],
  'tw.missingfiles.1': ['Ссылка на папку', 'The folder link'],
  'tw.missingfiles.1.p': ['Если файлы лежат в папке на Google Диске, вставьте ссылку на неё: программа подтянет недостающее.', 'If the files are in a Google Drive folder, paste the link to it: the app pulls in what is missing.'],
  'tw.missingfiles.2': ['Открыть папку', 'Open the folder'],
  'tw.missingfiles.2.p': ['Кнопка откроет папку, чтобы докинуть файлы. Пока файлов нет, сборка подставляет заглушки: играть и тестировать можно, пока художник не прислал картинки.', 'The button opens the folder so you can add files. While files are missing, the build uses placeholders: you can play and test until the artist sends the pictures.'],

  /* ---------- вес игры ---------- */
  'tw.weight.0.p': ['Окно веса игры открылось. Пройдём по выводу и по списку тяжёлых файлов.', 'The game weight window has opened. We will go through the verdict and the list of heavy files.'],
  'tw.weight.1': ['Вывод', 'The verdict'],
  'tw.weight.1.p': ['Вверху вывод: для телефона игра лёгкая, средняя или тяжёлая.', 'The verdict is at the top: for a phone the game is light, medium or heavy.'],
  'tw.weight.2': ['Что тяжёлое', 'What is heavy'],
  'tw.weight.2.p': ['Ниже сколько весят картинки, звук и шрифты и какие файлы самые тяжёлые. Режим «С замечаниями» показывает файлы тяжелее нормы, картинки крупнее 2560×1440 и звук без сжатия (WAV). Сожмите их и загрузите заново; кнопка «В реестре» ведёт к ресурсу. Фон в WebP или JPG весит в 3–5 раз меньше, чем PNG, а звук в OGG в 5–10 раз меньше, чем WAV.', 'Below is how much the pictures, sounds and fonts weigh and which files are the heaviest. The With remarks mode shows files over the norm, pictures larger than 2560×1440 and uncompressed sound (WAV). Compress them and load again; the In registry button leads to the resource. A WebP or JPG background weighs 3 to 5 times less than a PNG, and OGG sound 5 to 10 times less than WAV.'],

  /* ---------- гайд по концовкам ---------- */
  'tw.endguide.0.p': ['Окно гайда по концовкам открылось. Пройдём по нему: настройки, запуск и результат.', 'The endings guide window has opened. We will go through it: the options, the start and the result.'],
  'tw.endguide.1': ['Настройки и запуск', 'Options and start'],
  'tw.endguide.1.p': ['Две галочки: показывать значения переменных и время чтения. Кнопка «Составить гайд» проходит игру с учётом условий и переменных и ищет для каждой концовки самый короткий путь.', 'Two checkboxes: show variable values and reading time. The Make guide button plays through the game with conditions and variables and looks for the shortest path to every ending.'],
  'tw.endguide.1.t': ['Нажмите «Составить гайд».', 'Press Make guide.'],
  'tw.endguide.2': ['Карточки концовок', 'The ending cards'],
  'tw.endguide.2.p': ['У каждой концовки путь словами: какие варианты выбрать и какие значения получатся. Красным отмечены концовки, до которых дойти не удалось: обычно это ошибка в условиях. «Копировать текст» и «Скачать .md» отдают гайд тестерам или игрокам.', 'Every ending has a path in words: which choices to pick and what values result. Red marks the endings that could not be reached: usually this is an error in the conditions. Copy text and Download .md give the guide to testers or players.'],

  /* ---------- состояние переменных ---------- */
  'tw.varstates.0.p': ['Окно состояния переменных открылось. Пройдём по нему: выбор переменной, режимы и список блоков.', 'The variable states window has opened. We will go through it: the variable choice, the modes and the block list.'],
  'tw.varstates.1': ['Переменная', 'The variable'],
  'tw.varstates.1.p': ['Выберите переменную: окно покажет, какие значения она принимает на входе в блок и после него и где меняется.', 'Pick a variable: the window shows which values it takes at the entry of a block and after it and where it changes.'],
  'tw.varstates.1.t': ['Выберите другую переменную в списке (если она одна, нажмите «Далее»).', 'Pick another variable in the list (if there is only one, press Next).'],
  'tw.varstates.2': ['Режимы', 'The modes'],
  'tw.varstates.2.p': ['«По переменной» и «Где выполнится условие»: второй показывает, в каких блоках сработает выбранное условие. Вкладки «Главное», «Где меняется», «Где значение неоднозначно» и «Все блоки» сужают список.', 'By variable and Where the condition holds: the second one shows in which blocks the chosen condition fires. The tabs Main, Where it changes, Where the value is ambiguous and All blocks narrow the list.'],
  'tw.varstates.2.t': ['Нажмите на другую вкладку.', 'Press another tab.'],
  'tw.varstates.3': ['Блоки', 'The blocks'],
  'tw.varstates.3.p': ['У каждой строки «Показать на карте» и «Открыть блок». Это быстрый способ понять, почему выбор «не появился»: видно, каких очков не хватило.', 'Every row has Show on the map and Open block. This is a quick way to see why a choice did not appear: you can see which points were missing.'],

  /* ---------- показатели ---------- */
  'tw.stats.0.p': ['Окно показателей открылось. Пройдём по нему: карточки и переходы к подробным окнам.', 'The statistics window has opened. We will go through it: the cards and the jumps to the detailed windows.'],
  'tw.stats.1': ['Карточки показателей', 'The statistic cards'],
  'tw.stats.1.p': ['Сколько блоков, слов, времени чтения и концовок и какая часть готова. Цифры везде одинаковые: те же видны в строке состояния. Слово здесь это то, что увидит игрок: реплики, подписи и пункты выбора. Команды Ren\'Py не считаются.', 'How many blocks, words, reading time and endings there are and how much is ready. The numbers are the same everywhere: the same ones are in the status bar. A word here is what the player sees: lines, captions and choices. Ren\'Py commands are not counted.'],
  'tw.stats.2': ['Переходы', 'The jumps'],
  'tw.stats.2.p': ['Из карточек кнопки ведут к подробным окнам: концовки и блоки, ветки и время, автопрогон, журнал, кто что сделал.', 'The buttons on the cards lead to the detailed windows: endings and blocks, branches and time, autorun, the log, who did what.'],

  /* ---------- ветки и время ---------- */
  'tw.branchstats.0.p': ['Окно веток и времени открылось. Пройдём по нему: скорость чтения, вкладки и список.', 'The branches and time window has opened. We will go through it: the reading speed, the tabs and the list.'],
  'tw.branchstats.1': ['Скорость чтения', 'The reading speed'],
  'tw.branchstats.1.p': ['Слов в минуту, от 60 до 600. Для взрослого читателя обычно берут от 180 до 250. Время в окне пересчитывается сразу.', 'Words per minute, from 60 to 600. For an adult reader people usually take 180 to 250. The time in the window is recalculated at once.'],
  'tw.branchstats.1.t': ['Поменяйте число, например на 200.', 'Change the number, for example to 200.'],
  'tw.branchstats.2': ['Итоги, концовки, развилки', 'Totals, endings, forks'],
  'tw.branchstats.2.p': ['Вкладки: «Итоги» (самое короткое и самое длинное прохождение), «Концовки», «Развилки» (перекос веток) и «До блока» (время чтения до каждого блока). Если одна ветка втрое длиннее другой, игроки почувствуют перекос.', 'The tabs: Totals (the shortest and the longest playthrough), Endings, Forks (branch imbalance) and To a block (reading time up to each block). If one branch is three times longer than another, players will feel the imbalance.'],
  'tw.branchstats.2.t': ['Нажмите на другую вкладку.', 'Press another tab.'],

  /* ---------- автопрогон ---------- */
  'tw.autorun.0.p': ['Окно автопрогона открылось. Пройдём по нему: настройки, запуск и результат.', 'The autorun window has opened. We will go through it: the options, the start and the result.'],
  'tw.autorun.1': ['Настройки', 'The options'],
  'tw.autorun.1.p': ['Скорость строки, время на выбор и учитывать ли озвучку. Автопрогон проходит новеллу всеми возможными способами и считает время до каждого блока и каждой концовки.', 'The speed of a line, the time per choice and whether to count voice. Autorun plays the novel in every possible way and counts the time to every block and every ending.'],
  'tw.autorun.2': ['Запуск', 'Start'],
  'tw.autorun.2.p': ['Кнопка «Посчитать» запускает прохождение. Для большой новеллы нужно немного подождать.', 'The Count button starts the run. For a big novel you need to wait a little.'],
  'tw.autorun.2.t': ['Нажмите «Посчитать».', 'Press Count.'],
  'tw.autorun.3': ['Результат', 'The result'],
  'tw.autorun.3.p': ['Видно, какие блоки и концовки недостижимы. Концовка, которая открывается только после других прохождений, в автопрогоне может остаться недостижимой.', 'You can see which blocks and endings are unreachable. An ending that opens only after other playthroughs may stay unreachable in the autorun.'],

  /* ---------- журнал прохождений ---------- */
  'tw.testlog.0.p': ['Журнал прохождений открылся. Пройдём по нему: виды статистики, загрузка журналов и тепловая карта.', 'The playthrough log has opened. We will go through it: the kinds of statistics, loading logs and the heat map.'],
  'tw.testlog.1': ['Три вида', 'Three views'],
  'tw.testlog.1.p': ['«Дошли» (сколько прохождений добралось до блока), «Бросили здесь» (где остановились) и «Время в блоке».', 'Reached (how many playthroughs got to a block), Quit here (where they stopped) and Time in a block.'],
  'tw.testlog.1.t': ['Нажмите «Бросили здесь» или «Время в блоке».', 'Press Quit here or Time in a block.'],
  'tw.testlog.2': ['Откуда журналы', 'Where the logs come from'],
  'tw.testlog.2.p': ['Пройдите игру в плеере (запись включается в окне) или нажмите «Добавить журналы» и выберите файлы, присланные тестерами. Хорошо работает вместе с HTML-игрой для тестеров: тестер сохраняет журнал и присылает файл.', 'Play the game in the player (the recording is switched on in the window) or press Add logs and pick the files sent by testers. It works well with the HTML game for testers: the tester saves the log and sends the file.'],
  'tw.testlog.3': ['Тепловая карта', 'The heat map'],
  'tw.testlog.3.p': ['«Показать на карте» красит блоки по тому, сколько прохождений дошло до них и где бросили.', 'Show on the map colors the blocks by how many playthroughs reached them and where they quit.'],

  /* ---------- плеер ---------- */
  'tw.player.0.p': ['Плеер открылся. Пройдём по его кнопкам; играть сейчас не обязательно.', 'The player has opened. We will go through its buttons; you do not have to play right now.'],
  'tw.player.1': ['Начать с любого блока', 'Start from any block'],
  'tw.player.1.p': ['Плеер проходит новеллу без Ren\'Py: выборы, переменные, история. «С блока…» начинает с любого места, а «Играть отсюда» в меню блока открывает плеер сразу на нём.', 'The player plays the novel without Ren\'Py: choices, variables, history. From block… starts at any place, and Play from here in a block menu opens the player right on it.'],
  'tw.player.2': ['Управление', 'Controls'],
  'tw.player.2.p': ['Дальше: Пробел, Enter или →, назад ←. «Назад» откатывает на реплику, «Авто» само листает, «Пропуск» листает быстро (клавиши A и S). Нет картинки или звука: плеер покажет цветную заглушку с названием, играть можно.', 'Next: Space, Enter or →, back ←. Back rolls back one line, Auto flips by itself, Skip flips fast (the keys A and S). If a picture or a sound is missing, the player shows a colored placeholder with its name and you can play.'],
  'tw.player.3': ['Панель', 'The panel'],
  'tw.player.3.p': ['На панели справа видны переменные (их можно поправить), история и замечания: что плеер не понял.', 'The panel on the right shows variables (you can edit them), the history and remarks: what the player did not understand.'],
  'tw.player.3.t': ['Нажмите кнопку панели.', 'Press the panel button.'],
  'tw.player.4': ['Открыть блок', 'Open the block'],
  'tw.player.4.p': ['Нашли опечатку? Эта кнопка открывает текущий блок в редакторе, не выходя из игры.', 'Found a typo? This button opens the current block in the editor.'],

  /* ---------- HTML-игра ---------- */
  'tw.htmlgame.0.p': ['Окно сборки HTML-игры открылось. Пройдём по нему, ничего не собирая.', 'The HTML game window has opened. We will go through it without building anything.'],
  'tw.htmlgame.1': ['Название', 'The name'],
  'tw.htmlgame.1.p': ['Название игры для тестеров. Ниже выбирают, что положить в файл: картинки, музыку и звуки, озвучку. Чем больше, тем тяжелее файл.', 'The game name for testers. Below you choose what goes into the file: pictures, music and sounds, voice. The more you add, the heavier the file.'],
  'tw.htmlgame.1.t': ['Впишите любое название.', 'Type any name.'],
  'tw.htmlgame.2': ['Собрать игру', 'Build the game'],
  'tw.htmlgame.2.p': ['Получится один HTML-файл: тестер открывает его в обычном браузере, без установки и интернета, оставляет замечания к месту и сохраняет журнал. Журналы загружайте в «Журнал прохождений». Это самый быстрый способ показать игру тому, у кого нет Ren\'Py.', 'You get one HTML file: the tester opens it in a normal browser without installing or the internet, leaves remarks at places and saves a log. Load the logs into the Playthrough log. This is the quickest way to show the game to someone without Ren\'Py.'],

  /* ---------- настоящий Ren'Py ---------- */
  'tw.renpy.0.p': ['Окно запуска в Ren\'Py открылось. Пройдём по нему: папки, запуск и ошибки.', 'The Ren\'Py launch window has opened. We will go through it: the folders, the launch and the errors.'],
  'tw.renpy.1': ['Папки', 'The folders'],
  'tw.renpy.1.p': ['Один раз укажите папку Ren\'Py SDK и папку своего проекта Ren\'Py (его создаёт лаунчер Ren\'Py). Это работает только в программе для компьютера.', 'Once, pick the Ren\'Py SDK folder and the folder of your Ren\'Py project (it is created by the Ren\'Py launcher). This works only in the desktop app.'],
  'tw.renpy.2': ['Запуск и проверка', 'Launch and check'],
  'tw.renpy.2.p': ['«Запустить игру» (можно с выбранного блока) и «Проверить (lint)»: вывод Ren\'Py появится в окне. Нажмите на строку с ошибкой, чтобы перейти к блоку и главе. «Собрать дистрибутив» готовит архивы для игроков.', 'Launch game (it can start from a chosen block) and Check (lint): the Ren\'Py output appears in the window. Click an error line to jump to the block and chapter. Build distribution prepares archives for players.'],
  'tw.renpy.3': ['Что делать с ошибкой', 'What to do with an error'],
  'tw.renpy.3.p': ['Если Ren\'Py показал ошибку, скопируйте текст из окна и покажите помощнику: он подскажет, что исправить.', 'If Ren\'Py shows an error, copy the text from the window and show it to the assistant: it will tell you what to fix.'],

  /* ---------- проверка в Ren'Py ---------- */
  'tw.ctrlcheck.0.p': ['Окно проверки в Ren\'Py открылось. Пройдём по нему: контрольная новелла, шаги и отчёт.', 'The Ren\'Py check window has opened. We will go through it: the control novel, the steps and the report.'],
  'tw.ctrlcheck.1': ['Контрольная новелла', 'The control novel'],
  'tw.ctrlcheck.1.p': ['Контрольная новелла из 12 блоков и список из 12 шагов: так вы проверяете в настоящем Ren\'Py, что сборка работает. Кнопка создаёт отдельный проект; ваш проект она не трогает.', 'A control novel of 12 blocks and a list of 12 steps: this is how you check in the real Ren\'Py that the build works. The button creates a separate project and does not touch yours.'],
  'tw.ctrlcheck.2': ['Шаги проверки', 'The check steps'],
  'tw.ctrlcheck.2.p': ['У каждого шага три отметки: «Не проверял», «Работает», «Ошибка». Отмечайте по мере прохождения и вставляйте вывод Lint.', 'Each step has three marks: Not checked, Works, Error. Mark as you go and paste the Lint output.'],
  'tw.ctrlcheck.2.t': ['Отметьте любой шаг, например «Работает».', 'Mark any step, for example Works.'],
  'tw.ctrlcheck.3': ['Отчёт', 'The report'],
  'tw.ctrlcheck.3.p': ['«Скопировать отчёт» собирает всё в один текст: пришлите его, если что-то не сработало. Делайте проверку один раз после установки Ren\'Py или обновления программы.', 'Copy report gathers everything into one text: send it if something did not work. Do the check once after installing Ren\'Py or updating the app.'],

  /* ---------- сборка ---------- */
  'tw.build.0.p': ['Окно сборки открылось. Пройдём по нему: вкладки, отчёт и сохранение игры.', 'The build window has opened. We will go through it: the tabs, the report and saving the game.'],
  'tw.build.1': ['Вкладки сборки', 'The build tabs'],
  'tw.build.1.p': ['Слева вкладки: «Как запустить игру», «Отчёт», файлы сценария (отдельными файлами или всё в `script.rpy`) и ресурсы. Сборка превращает карту в проект Ren\'Py: сценарий, главы, героев, переменные, концовки, переводы, галерею и достижения.', 'On the left are the tabs: How to run the game, the Report, the script files (separate files or all in `script.rpy`) and the resources. The build turns the map into a Ren\'Py project: the script, chapters, characters, variables, endings, translations, the gallery and achievements.'],
  'tw.build.1.t': ['Нажмите на другую вкладку, например «Отчёт».', 'Press another tab, for example Report.'],
  'tw.build.2': ['Отчёт', 'The report'],
  'tw.build.2.p': ['Исправьте ошибки и предупреждения: у части пунктов есть кнопка «Исправить в главе». Мини-Lint при каждой сборке показывает строки глав, из-за которых Ren\'Py остановится.', 'Fix the errors and warnings: some items have a Fix in the chapter button. The mini-Lint on every build shows the chapter lines that would stop Ren\'Py.'],
  'tw.build.3': ['Сохранить игру', 'Save the game'],
  'tw.build.3.p': ['В программе для компьютера игру записывают в папку, в браузере скачивают ZIP. Вкладка «Как запустить игру» объяснит остальное.', 'In the desktop app the game is written to a folder, in the browser you download a ZIP. The How to run the game tab explains the rest.'],

  /* ---------- команда ---------- */
  'tw.team.0.p': ['«Команда» открывается маленьким меню. Найдём её по кнопкам и посмотрим, что в нём лежит.', 'Team opens as a small menu. We will find it by the buttons and look at what is in it.'],
  'tw.team.1': ['Где лежит «Команда»', 'Where Team lives'],
  'tw.team.2': ['Что в меню', 'What is in the menu'],
  'tw.team.2.p': ['«Управление участниками»: добавьте людей с ролями (сценарист, художник, композитор и другие). Ответственных за блоки и файлы назначают в окне блока или файла, фильтр карты по человеку показывает только его работу. Роли попадают в титры игры, второй раз набирать их не нужно.', 'Manage members: add people with roles (writer, artist, composer and others). Those responsible for blocks and files are set in the block or file window, and the map filter by person shows only their work. The roles go into the game credits, so you do not type them twice.'],

  /* ---------- кто я ---------- */
  'tw.whoami.0.p': ['Настройки открылись на вкладке «Команда». Посмотрим, где выбирают себя.', 'The settings have opened on the Team tab. We will see where you choose yourself.'],
  'tw.whoami.1': ['Кто я', 'Who I am'],
  'tw.whoami.1.p': ['Выберите себя в списке участников: программа запишет авторство ваших правок, а «мои блоки» и сводка «Кто что сделал» будут знать, кто вы. Выбор хранится на вашем компьютере и не меняет проект для других.', 'Pick yourself in the list of members: the app records the authorship of your edits, and my blocks and the Who did what summary know who you are. The choice is kept on your computer and does not change the project for others.'],
  'tw.whoami.2': ['Меня нет в списке', 'I am not in the list'],
  'tw.whoami.2.p': ['Кнопка «Меня нет в списке: добавить…» добавляет вас как нового участника.', 'The button I am not in the list: add… adds you as a new member.'],
  'tw.whoami.3': ['Участники и роли', 'Members and roles'],
  'tw.whoami.3.p': ['Здесь управляют списком участников и их ролями, а рядом лежат «Титры…» игры.', 'Here you manage the list of members and their roles, and the game Credits… are next to it.'],

  /* ---------- задачи ---------- */
  'tw.tasks.0.p': ['Окно задач открылось. Пройдём по нему: вкладки и строки задач.', 'The tasks window has opened. We will go through it: the tabs and the task rows.'],
  'tw.tasks.1': ['Вкладки', 'The tabs'],
  'tw.tasks.1.p': ['«Мои» показывает ваши задачи по срокам, «Все задачи» общий список, «Сводка для руководителя» что просрочено и у кого сколько работы.', 'Mine shows your tasks by deadline, All tasks is the common list, the manager summary shows what is overdue and how much work each person has.'],
  'tw.tasks.1.t': ['Нажмите «Все задачи».', 'Press All tasks.'],
  'tw.tasks.2': ['Строки задач', 'The task rows'],
  'tw.tasks.2.p': ['У строки есть срок, приоритет (цветная метка), исполнители и статус, который меняется прямо в строке. Сроки ресурсов (фон, спрайт, озвучка) из реестра тоже здесь. Напоминания о сроках могут приходить в Telegram или Discord: см. урок про уведомления.', 'A row has a deadline, a priority (a colored mark), assignees and a status that is changed right in the row. The resource deadlines (background, sprite, voice) from the registry are here too. Deadline reminders can come to Telegram or Discord: see the lesson about notifications.'],

  /* ---------- кто что сделал ---------- */
  'tw.whodid.0.p': ['Окно «Кто что сделал» открылось. Пройдём по нему: период, таблица людей и лента.', 'The Who did what window has opened. We will go through it: the period, the table of people and the feed.'],
  'tw.whodid.1': ['Период', 'The period'],
  'tw.whodid.1.p': ['7 дней, 30 дней или всё время. Таблица пересчитывается сразу.', '7 days, 30 days or all time. The table is recalculated at once.'],
  'tw.whodid.1.t': ['Нажмите «30 дней» или «Всё время».', 'Press 30 days or All time.'],
  'tw.whodid.2': ['Таблица людей', 'The table of people'],
  'tw.whodid.2.p': ['По каждому человеку: сколько блоков создал, глав правил, слов, замечаний и когда был последним. Нажмите на строку, чтобы раскрыть блоки. У главы хранится только последний автор правки и время, поэтому это не слежка за каждым словом.', 'For each person: how many blocks they made, chapters edited, words, remarks and when they were last active. Press a row to open the blocks. A chapter stores only the last editor and the time, so this is not watching every word.'],
  'tw.whodid.3': ['Лента', 'The feed'],
  'tw.whodid.3.p': ['События по времени. Кнопка «Копировать отчёт» собирает сводку, чтобы отправить её руководителю или команде.', 'Events by time. The Copy report button gathers a summary to send to a manager or the team.'],

  /* ---------- уведомления ---------- */
  'tw.notify.0.p': ['Окно уведомлений открылось. Пройдём по карточкам: Telegram, Discord и события.', 'The notifications window has opened. We will go through the cards: Telegram, Discord and events.'],
  'tw.notify.1': ['Telegram', 'Telegram'],
  'tw.notify.1.p': ['Создайте своего бота в Telegram и нажмите «Найти мой чат». Токен бота хранится только на вашем компьютере и никуда не отправляется.', 'Create your own bot in Telegram and press Find my chat. The bot token is kept only on your computer and is never sent anywhere.'],
  'tw.notify.2': ['Discord', 'Discord'],
  'tw.notify.2.p': ['Для Discord вставьте адрес вебхука канала. Он тоже хранится только у вас.', 'For Discord paste the webhook address of the channel. It is also kept only by you.'],
  'tw.notify.3': ['О чём сообщать', 'What to report'],
  'tw.notify.3.p': ['Сообщения приходят о двух событиях: проект закрыт (со сводкой сессии) и подходят сроки задач.', 'Messages come for two events: the project is closed (with a session summary) and task deadlines are approaching.'],

  /* ---------- проверка правок авторов ---------- */
  'tw.review.0.p': ['Откроем окно проверки правок. Ему нужен GitHub: если он не подключён, окно так и скажет.', 'We will open the edit review window. It needs GitHub: if it is not connected, the window will say so.'],
  'tw.review.1': ['Как это устроено', 'How it works'],
  'tw.review.1.p': ['Автор работает в своей ветке GitHub, а владелец проекта принимает или возвращает его работу по отдельности. Так общий проект не ломается от чужой неоконченной правки.', 'An author works in their own GitHub branch, and the project owner accepts or returns their work separately. This way the shared project does not break from someone else\'s unfinished edit.'],
  'tw.review.2': ['Что делает владелец', 'What the owner does'],
  'tw.review.2.p': ['Откройте список правок авторов, посмотрите работу автора и примите её или верните автору. Подключить GitHub можно в «Настройках → Подключения».', 'Open the list of author edits, look at the author\'s work and accept it or return it to the author. GitHub is connected in Settings → Connections.'],

  /* ---------- совместная работа ---------- */
  'tw.collab.0.p': ['Откроем окно совместной работы и посмотрим, что оно делает.', 'We will open the collaboration window and see what it does.'],
  'tw.collab.1': ['Что это', 'What it is'],
  'tw.collab.1.p': ['Работа над проектом вместе в реальном времени: правки каждого участника приходят всем сразу. Включается кнопкой «Включить совместную работу» в «Настройки → Подключения → Совместная работа».', 'Working on the project together in real time: every member\'s edits reach everyone at once. It is switched on with the Turn on collaboration button in Settings → Connections → Collaboration.'],
  'tw.collab.2': ['Ссылка для участников', 'The link for members'],
  'tw.collab.2.p': ['Отправьте ссылку участникам: они увидят те же блоки и правки. Это одна функция, а не раздел: её можно совсем выключить на вкладке «Модули».', 'Send the link to the members: they will see the same blocks and edits. This is a single feature, not a section: it can be switched off completely on the Modules tab.'],

  /* ---------- открыть с GitHub ---------- */
  'tw.ghopen.0.p': ['Окно открытия с GitHub появилось. Пройдём по нему, ничего не открывая.', 'The Open from GitHub window has appeared. We will go through it without opening anything.'],
  'tw.ghopen.1': ['Ссылка на репозиторий', 'The repository link'],
  'tw.ghopen.1.p': ['Вставьте ссылку на репозиторий с новеллой.', 'Paste the link to the repository with the novel.'],
  'tw.ghopen.1.t': ['Напечатайте любую ссылку (пока не нажмёте «Найти», ничего не произойдёт).', 'Type any link (nothing happens until you press Find).'],
  'tw.ghopen.2': ['Найти', 'Find'],
  'tw.ghopen.2.p': ['«Найти» проверит репозиторий; подтвердите, и проект загрузится на карту. Для закрытого репозитория нужен токен в «Настройки → Подключения»; никому не показывайте токен и не вставляйте его в чаты.', 'Find checks the repository; confirm and the project loads onto the map. A private repository needs a token in Settings → Connections; never show the token to anyone or paste it into chats.'],

  /* ---------- копии проекта ---------- */
  'tw.snapshots.0.p': ['Окно копий открылось. Пройдём по нему: имя, кнопка, автокопии и список.', 'The backups window has opened. We will go through it: the name, the button, automatic copies and the list.'],
  'tw.snapshots.1': ['Имя копии', 'The backup name'],
  'tw.snapshots.1.p': ['Назовите копию так, чтобы потом узнать её: например «до правки финала».', 'Name the copy so that you recognize it later, for example "before the finale rewrite".'],
  'tw.snapshots.1.t': ['Впишите имя копии (она появится, только когда нажмёте «Сделать копию»).', 'Type a backup name (the copy appears only when you press Make a backup).'],
  'tw.snapshots.2': ['Сделать копию', 'Make a backup'],
  'tw.snapshots.2.p': ['Кнопка записывает проект на этот момент. Свои копии сами не удаляются.', 'The button saves the project at this moment. Your own copies are never deleted automatically.'],
  'tw.snapshots.3': ['Автокопии', 'Automatic copies'],
  'tw.snapshots.3.p': ['Галочка включает копии через равные промежутки, а рядом задают, сколько штук хранить. Программа также сама сохраняет страховку перед заменой проекта.', 'The checkbox turns on copies at equal intervals, and next to it you set how many to keep. The app also saves a safety copy by itself before replacing a project.'],
  'tw.snapshots.4': ['Список копий', 'The list of copies'],
  'tw.snapshots.4.p': ['У каждой копии «Сравнить» (какие блоки добавлены, пропали или изменены, с разницей в словах), «Восстановить» (текущее состояние сохранится как «Страховка», а Ctrl+Z отменит восстановление), «Скачать копию» и «Удалить». Копии лежат в самой программе или браузере, а не в файле проекта и не на GitHub.', 'Each copy has Compare (which blocks were added, lost or changed, with the word difference), Restore (the current state is kept as a Safety copy and Ctrl+Z cancels the restore), Download copy and Delete. The copies live in the app or the browser, not in the project file and not on GitHub.'],

  /* ---------- GitHub и Google Диск ---------- */
  'tw.sync.0.p': ['Настройки открылись на вкладке «Подключения». Посмотрим, где подключают общее хранилище проекта.', 'The settings have opened on the Connections tab. We will see where the shared storage of the project is connected.'],
  'tw.sync.1': ['Состояние синхронизации', 'The sync state'],
  'tw.sync.1.p': ['Эта карточка показывает, подключено ли хранилище и всё ли отправлено. Тот же итог показывает значок облака в строке состояния внизу: всё синхронизировано, идёт обмен или есть неотправленные правки.', 'This card shows whether storage is connected and whether everything is sent. The same result is shown by the cloud icon in the status bar below: all synced, exchange in progress or unsent edits.'],
  'tw.sync.2': ['GitHub', 'GitHub'],
  'tw.sync.2.p': ['GitHub хранит историю версий и позволяет откатываться. Подключите его токеном и репозиторием; «Панель GitHub» открывает работу с ветками. Прежде чем подключать общий репозиторий, сделайте резервную копию проекта.', 'GitHub keeps the history of versions and lets you roll back. Connect it with a token and a repository; the GitHub panel opens the work with branches. Before connecting a shared repository, make a backup copy of the project.'],
  'tw.sync.3': ['Google Диск', 'Google Drive'],
  'tw.sync.3.p': ['Google Диск синхронизирует проект и ресурсы между устройствами. Если вход пока не подключён, карточка подскажет, что нужно.', 'Google Drive syncs the project and the resources between devices. If the sign-in is not connected yet, the card tells what is needed.'],
});

/* ---------- сборщик практики ---------- */
const twLesson = id => TOUR_LESSONS.find(x => x.id === id) || null;
const twCloseAll = () => { MODALS.slice().forEach(m => m.close()); closePopover(); };
/** «Подпись» части окна: меняется, когда человек что-то нажал, выбрал или напечатал внутри неё. */
const twSig = sel => {
  const e = typeof sel === 'function' ? sel() : document.querySelector(sel); if (!e) return '';
  return [e.value == null ? '' : e.value, e.checked ? 1 : 0, e.className, e.textContent.length, [...e.querySelectorAll('.on')].map(x => x.textContent).join('|')].join('~');
};
const twNth = (sel, i) => () => document.querySelectorAll(sel)[i] || null;
const twOpenBlock = () => {
  const sel = [...UI.sel].map(nodeById).find(n => n && n.type !== 'note');
  let n = sel || P.nodes.find(x => x.type === 'chapter') || P.nodes.find(x => x.type !== 'note');
  if (!n && typeof addNodeAtCenter === 'function') n = addNodeAtCenter('chapter');
  if (n) openNodeModal(n.id);
};
const twOpenEdge = () => { const e = P.edges[0]; if (e) openEdgeModal(e.id); };

/** Описание практик. win: окно урока; open: как его открыть (по умолчанию как кнопка «Открыть» урока); ready: можно ли показать окно;
    nowin: вступление без окна; parts: [селектор или {s, watch, pre, at}], s=null значит карточка без подсветки. */
const TW_SPEC = {
  blocks: { win: '.node-m:has(#node-title)', open: twOpenBlock, parts: [{ s: '#node-title', watch: '#node-title', at: '.node-m .m-main' }, { s: '.node-m .m-side', watch: '.node-m .m-side', at: '.node-m .m-main' }, '.node-m .m-main'] },
  edges: { win: '.edge-m', nowin: true, ready: () => P.edges.length > 0, none: 'tw.edges.none', parts: [{ s: 'g.edge', pre: twCloseAll }, { s: '.edge-m', pre: () => { if (!document.querySelector('.edge-m')) twOpenEdge(); } }, { s: '#edge-title', watch: '#edge-title', pre: () => { if (!document.querySelector('.edge-m')) twOpenEdge(); } }, { s: '.edge-logic', pre: () => { if (!document.querySelector('.edge-m')) twOpenEdge(); } }] },
  save: { win: '.set-modal', open: () => openSettingsWindow('backup'), nowin: true, parts: [{ s: '#save-badge', pre: twCloseAll }, { s: '#sn-name', watch: '#sn-name' }, '#sn-take', '#sn-auto'] },
  registry: { win: '.reg-m', open: () => openRegistry('chars'), parts: [{ s: '.reg-m .m-side', watch: '.reg-m .m-side' }, { s: '#reg-q', watch: '#reg-q' }, '.reg-m .m-main'] },
  layout: { win: '.pick-pop', nowin: true, find: true, parts: ['.pick-pop'] },
  mappdf: { win: '.mp-m', parts: [{ s: '.mp-m .mp-body', watch: '.mp-m .mp-body' }, '#mp-paper', '.mp-m .mp-foot'] },
  notes: { win: '.cm-all', parts: [{ s: '.cm-all .cm-all-bar', watch: '.cm-all .cm-all-bar' }, '.cm-all .cm-all-list'] },
  docimport: { win: '.di-m:has(#di-ta)', parts: [{ s: '#di-ta', watch: '#di-ta' }, '#di-go'] },
  digest: { win: '.dg-m', parts: ['#dg-scope', { s: '.dg-m .dg-body', watch: '.dg-m .dg-body' }, '.dg-m .dg-foot'] },
  replicas: { win: '.rt-m:not(.vc-m)', parts: [{ s: '.rt-m .rt-bar', watch: '.rt-m .rt-bar' }, '.rt-m .rt-wrap'] },
  voicesheet: { win: '.vc-m', parts: [{ s: '.vc-m .vc-strip', watch: '.vc-m .vc-strip' }, '.vc-m .rt-bar', '#vc-export'] },
  recipes: { win: '.rc-m', parts: [{ s: '.rc-m .rc-card', watch: '.rc-m .rc-body' }, '.rc-m .rc-body'] },
  rename: { win: '.rn-m', parts: [{ s: '.rn-m .rn-top', watch: '.rn-m .rn-top' }, '.rn-m .rn-form', '.rn-m .rn-body'] },
  charpage: { win: '.cp-m', parts: [{ s: '#cp-pick', watch: '#cp-pick' }, '.cp-m .cp-body'] },
  resources: { win: '.reg-m:has(#rs-scope)', parts: [{ s: '#rs-scope', watch: '#rs-scope' }, '.reg-m .m-main'] },
  snippets: { win: '.sp-m', parts: ['#sp-starter', '#sp-new', { s: '#sp-q', watch: '#sp-q' }, '#sp-exp'] },
  customcode: { win: '.cu-m', parts: ['#cu-new', '#cu-up', '.cu-m .cu-body'] },
  translate: { win: '.tl-m', parts: [{ s: '.tl-m .tl-head', until: () => !!document.querySelector('.pop') }, '.tl-m .tl-body'] },
  rpyimport: { win: '.rpi-m', parts: ['#ri-pick', '#ri-go'] },
  gui: { win: '.reg-m:has(#gui-note)', open: () => openRegistry('gui'), parts: ['#gui-note', '.reg-m .m-main'] },
  checks: { win: '.sc-m', parts: [{ s: '.sc-m .sc-top', watch: '.sc-m .sc-top' }, '.sc-m .sc-body'] },
  missingfiles: { win: '.mf-dlg', parts: ['#mf-link', '#mf-link-open'] },
  weight: { win: '.wt-m', parts: ['#wt-verdict', '.wt-m .wt-body'] },
  endguide: { win: '.eg-m', parts: [{ s: '.eg-m .eg-top', watch: '.eg-m .eg-body' }, '.eg-m .eg-body'] },
  varstates: { win: '.vs-m', parts: [{ s: '#vs-var', watch: '#vs-var' }, { s: '.vs-m .bs-tabrow', watch: '.vs-m .bs-tabrow' }, '.vs-m .bs-body'] },
  stats: { win: '.stats-m', parts: ['.stats-m .sh-card', '.stats-m .sh-card .btn'] },
  branchstats: { win: '.bs-m:has(#bs-wpm)', parts: [{ s: '#bs-wpm', watch: '#bs-wpm' }, { s: '.bs-m .bs-tabrow', watch: '.bs-m .bs-tabrow' }] },
  autorun: { win: '.ar-m', parts: ['.ar-m .ar-top', { s: '#ar-go', watch: '.ar-m .bs-body' }, '.ar-m .bs-body'] },
  testlog: { win: '.lg-m', parts: [{ s: '.lg-m .lg-top', watch: '.lg-m .lg-top' }, '#lg-import', '#lg-map'] },
  player: { win: '.play-m', parts: ['#pl-from', '#pl-back', { s: '#pl-panelbtn', watch: '.play-m' }, '#pl-openblock'] },
  htmlgame: { win: '.gm-dlg', parts: [{ s: '#gm-title', watch: '#gm-title' }, '#gm-make'] },
  renpy: { win: '.build-m', parts: ['.build-m .bld-view', '.build-m .bld-foot', '.build-m .m-side'] },
  ctrlcheck: { win: '.cc-m', parts: ['#cc-make', { s: twNth('.cc-m .cc-card', 2), watch: twNth('.cc-m .cc-card', 2) }, '#cc-copy'] },
  build: { win: '.build-m', parts: [{ s: '.build-m .m-side', watch: '.build-m .m-side' }, '.build-m .bld-view', '.build-m .bld-foot'] },
  team: { win: '.menu-pop', nowin: true, find: true, parts: ['.menu-pop'] },
  whoami: { win: '.set-modal', parts: ['#set-me', '#me-add', '#set-team-reg'] },
  tasks: { win: '.tk-modal', ready: () => typeof tasksOn === 'function' && tasksOn(), none: 'tk.need', parts: [{ s: '.tk-modal .tk-body', watch: '.tk-modal .tk-body' }, '.tk-modal .tk-pane'] },
  whodid: { win: '.wd-modal', ready: () => typeof whOn === 'function' && whOn(), none: 'wd.need', parts: [{ s: '.wd-modal .seg', watch: '.wd-modal .seg' }, '.wd-modal .wd-tbl', '.wd-modal .wd-feed'] },
  notify: { win: '.nt-modal', parts: [twNth('.nt-modal .nt-card', 0), twNth('.nt-modal .nt-card', 1), twNth('.nt-modal .nt-card', 2)] },
  review: { win: '.modal', parts: [null, null] },
  collab: { win: '.modal', parts: [null, null] },
  ghopen: { win: '.gho-dlg', parts: [{ s: '#gho-link', watch: '#gho-link' }, '#gho-find'] },
  snapshots: { win: '.set-modal', parts: [{ s: '#sn-name', watch: '#sn-name' }, '#sn-take', '#sn-auto', '.set-modal .set-body'] },
  sync: { win: '.set-modal', parts: ['#sy-sum', '#set-gh-panel', '#set-drive'] },
};

/** Собирает шаги практики урока по его описанию. */
function twBuild(id) {
  const sp = TW_SPEC[id], l = twLesson(id); if (!sp || !l) return [];
  const name = tlTitle(l);
  const open = () => { if (!document.querySelector(sp.win)) { (sp.open || (() => tlOpen(l)))(); } };
  const ok = !sp.ready || sp.ready();
  const k = n => 'tw.' + id + '.' + n;
  const steps = [];
  if (sp.find && ok) {
    steps.push({ target: null, h: t('tw.intro', name), p: t(k(0) + '.p') + '\n' + t('tw.undo'), setup: twCloseAll });
    steps.push({ target: () => tourEl(tlLocate(l).target), late: true, live: true, h: t(k(1)), p: tlLocate(l).text, task: t('tw.find.t'), setup: twCloseAll, until: () => !!document.querySelector(sp.win) });
  } else {
    steps.push({ target: ok && !sp.nowin ? sp.win : null, late: true, h: t('tw.intro', name), p: (ok ? t(k(0) + '.p') : t(sp.none)) + '\n' + t('tw.undo'), setup: () => { twCloseAll(); if (ok && !sp.nowin) open(); } });
  }
  if (ok) sp.parts.forEach((pt, i) => {
    const n = i + 1 + (sp.find ? 1 : 0), s = pt && typeof pt === 'object' ? pt : { s: pt };
    const live = !!(s.watch || s.until); let b0 = '';
    steps.push(Object.assign(twStep(id, n, s.s || null, { late: !!s.s, cardAt: s.at }), {
      setup: () => { if (s.pre) s.pre(); else open(); if (s.watch) b0 = twSig(s.watch); },
      live, task: live ? t(k(n) + '.t') : undefined, until: live ? (s.until ? s.until : () => twSig(s.watch) !== b0) : undefined,
    }));
  });
  steps.push({ target: null, h: t('tw.fin'), p: t('tw.fin.p'), setup: () => { /* окно можно оставить открытым: его закрывают крестиком */ }, actions: [{ label: t('tour.openlessons'), run: () => setTimeout(() => openTour(id), 0) }] });
  return steps;
}

Object.keys(TW_SPEC).forEach(id => { TOUR_WALKS[id] = () => twBuild(id); });

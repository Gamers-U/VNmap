'use strict';
/* ====== Поиск по намерениям в палитре (Ctrl+K) ======
   Раньше команда находилась, только если слова запроса встречались в её названии или ключевых словах: «собрать игру» работало,
   а «хочу выгрузить игру в ренпай» или «как найти тупики» нет. Теперь у каждой команды есть слова-синонимы («тупик», «зависло»,
   «выгрузить», «сборка»), а при запросе из нескольких слов лишние слова («хочу», «как», «мне надо») отбрасываются, остальные
   сравниваются по основам слов: «проверить» находит «проверка». Строгий поиск остаётся первым, нестрогий добавляется после него. */

const PAL_STOP = new Set(('хочу хочется хотел хотела хотим хотелось мне нам надо нужно нужна нужен можно как где что чтобы для при про это мой моя моё мои в во на и а но по из с со к до за от то ли же бы я мы ' +
  'сделать сделай покажи показать найти найди открой открыть запустить сначала просто пожалуйста i want to how do the an my can where find make me please need should show open').split(' '));

/** Слова-синонимы по id команды из «Инструментов». Русские и английские вместе. */
const PAL_INTENT = {
  texted: 'писать пишу написать главу текст проза рукопись редактор как в ворде документ абзац сцена write prose manuscript editor chapter text',
  docimport: 'импорт загрузить вставить гугл докс ворд docx документ рукопись разбить на главы import google docs word split chapters',
  digest: 'вычитка корректор выжимка выгрузить текст сценария для редактора печать распечатать ворд пдф proofread corrector print export script text',
  replicas: 'реплики диалоги таблица реплик кто что говорит найти фразу исправить опечатку csv excel xlsx lines dialogues table speaker',
  rename: 'переименовать заменить имя героя флаг метка везде поменять название rename replace character flag label everywhere',
  charpage: 'персонаж герой страница героя образы спрайты сколько говорит статистика героя character page sprites how much talks',
  resources: 'ресурсы что нарисовать список картинок фоны спрайты музыка для художника заказать нужные файлы assets list artist needed pictures статус ресурсов заказано в работе получено вставлено исполнитель срок заказ художнику композитору кто делает что рисует просрочено дедлайн ресурса что заказано у художника production status of resources ordered in progress received performer deadline overdue who draws',
  rpyimport: 'импорт rpy сценарий ренпай загрузить старый проект перенести из ренпай import rpy existing project move from renpy',
  checks: 'проверка проверить ошибки тупик тупики зависло недостижимые блоки мёртвые флаги битые переходы сломан сюжет найти проблемы dead end errors unreachable broken',
  missingfiles: 'недостающие файлы картинки звуки докачать заглушки нет файлов диск missing files download placeholders',
  varstates: 'переменные значения флаги какие значения у игрока в блоке счётчик variables values flags state at block',
  stats: 'статистика показатели посчитать подсчитать считать подсчёт сколько слов блоков глав прогресс процент готово концовки открыто сводка итоги statistics progress words total summary',
  branchstats: 'время чтения сколько читать длина игры самая короткая самая длинная ветка перекос развилок слова прохождение reading time length shortest longest branch balance',
  autorun: 'автопрогон прогнать пройти автоматически время до концовки скорость чтения озвучка autorun playthrough duration auto route',
  testlog: 'журнал прохождений тестеры тепловая карта где бросают куда доходят playtest log heatmap testers',
  player: 'играть проигрыватель плеер запустить новеллу пройти проверить как выглядит без ренпай play player preview run novel',
  htmlgame: 'html игра для тестеров одним файлом отправить тестеру поделиться браузерная игра tester html game one file share',
  renpy: 'запустить в ренпай запуск lint проверка ренпай настоящий движок sdk собрать дистрибутив архив виндовс run renpy engine sdk lint distribution',
  ctrlcheck: 'контрольная новелла проверка сборки ренпай чек-лист отчёт не запускается ошибка при запуске test novel checklist report build does not run',
  tasks: 'задачи сроки дедлайны кто делает назначить сцену приоритет ресурсы срок ресурса tasks deadlines assign priority resource deadline',
  notify: 'уведомления телеграм дискорд сообщение напоминание закрыл проект пауза notifications telegram discord reminder',
  review: 'проверка правок ветки авторов принять правки ревью рецензия review accept changes author branches',
  whoami: 'я это кто я автор имя участник мой профиль who am i author member',
  whodid: 'кто что сделал правки по людям вклад участников за неделю месяц who did what contributions members week month',
  layout: 'расстановка авторасстановка выровнять блоки упорядочить карту слева направо arrange auto layout align blocks',
  mappdf: 'карта в пдф печать распечатать листы скачать картинку карты показать издателю map pdf print sheets export image',
  notes: 'заметки стикеры комментарии записки решено notes stickers comments todo',
  weight: 'вес размер ресурсов тяжёлые тяжёлая игра большие картинки слишком большая картинка мегабайты мб сжать уменьшить webp ogg wav звук не сжат телефон память лагает сколько весит игра weight size heavy big images compress megabytes phone memory how big is the game',
  snippets: 'сниппеты сниппет шаблоны шаблон заготовки заготовка кусок кода библиотека кода повторяющийся код вставить код часто использую сохранить код макрос snippets snippet templates library reuse code macro insert',
  recipes: 'рецепты механики шкала симпатии симпатия очки отношений отношения характеристики статы навыки кубик бросок инвентарь предметы рюкзак переписка в телефоне смс мессенджер чат nvl готовая механика как сделать систему отношений rpg recipes mechanics affection meter relationship points stats skills dice roll inventory items backpack phone chat messenger sms how to make a relationship system',
  customcode: 'свой код экран экраны свой экран инвентарь карта города интерфейс init python инит питон стиль стили screen style define код вне меток собственный код кастомный код мини-игра функция питон вставить файл rpy',
  ide: 'редактор кода окно редактор код файлы папка проекта дерево файлов проводник правка файла game rpy script.rpy screens.rpy options.rpy gui.rpy код как в vs code открыть папку игры править файлы игры подсветка кода code editor ide vs code explorer folder tree edit game files syntax highlight open project folder autocomplete hints подсказки автодополнение дополнение имён метки герои переменные',
  voicesheet: 'озвучка лист для озвучки актёр актёры озвучивание запись реплик студия звукозапись диктор кто что озвучивает эмоции реплики по актёрам сколько записывать статус озвучки имя файла озвучки voice over sheet voice actor actors recording studio dubbing emotions lines per actor which lines are voiced file name for voice вставить строки voice вставить voice прописать озвучку в скрипт прописать voice в скриптах загрузить записи озвучки файлы озвучки связать озвучку со скриптом',
  endguide: 'гайд по концовкам как получить концовку путь к концовке прохождение гайд шпаргалка для тестеров для игроков выборы к концовке какие выборы нужны вики спойлеры endings guide walkthrough how to get ending route choices cheat sheet wiki',
  snapshots: 'снимки снимок резервная копия бэкап автокопия точка возврата вернуть назад восстановить прошлую версию откатить потерял проект что изменилось сравнить версии история папка рядом с проектом snapshots backup restore rollback previous version history compare folder next to project',
  tour: 'обучение учиться учебник туториал урок уроки тур подсказки научи объясни как пользоваться программой с чего начать tutorial lessons guide tour learn how to use getting started',
  ghopen: 'открыть с гитхаба по ссылке репозиторий новелла open from github link repository',
};
/** Для команд вне «Инструментов»: по названию (русскому или английскому). */
const PAL_INTENT_TITLE = [
  [/сборк|^build|собрать игру/i, 'собрать собери сборка сборку игру игры экспорт выгрузить ренпай ren\'py rpy zip скачать готовую игру build export download game'],
  [/резерв|сохран|^save|json/i, 'сохранить сохрани резервная копия бэкап экспорт проекта файл скачать save backup export project file'],
  [/настройк|^settings/i, 'настройки режим простой профессиональный подключения гитхаб диск панель модули тема язык settings preferences mode connections'],
  [/справк|^help/i, 'справка помощь как пользоваться инструкция учебник help guide how to'],
  [/реестр|^registry/i, 'реестр персонажи герои фоны спрайты музыка звуки переменные участники достижения галерея registry characters backgrounds sprites music variables'],
  [/добавить блок|^add /i, 'новый блок добавить создать главу развилку концовку заметку add new block chapter fork ending note'],
  [/github|гитхаб/i, 'гитхаб синхронизация совместная работа репозиторий токен github sync collaboration repository token'],
  [/диск|drive/i, 'гугл диск файлы облако картинки синхронизация google drive files cloud sync'],
  [/svg/i, 'картинка карты экспорт svg image export map'],
  [/описание карты|markdown|^export map/i, 'описание карты текстом маркдаун markdown text map outline'],
  [/перевод|translate/i, 'перевод язык локализация translate localisation language'],
  [/команда|участник|team/i, 'команда участники роли права доступ team members roles access'],
  [/показать всю|fit/i, 'показать всю карту масштаб уместить fit zoom whole map'],
];
function palIntentKw(c) {
  if (c.id && PAL_INTENT[c.id]) return PAL_INTENT[c.id];
  for (const [re, kw] of PAL_INTENT_TITLE) if (re.test(c.title)) return kw;
  return '';
}
/** Значимые слова запроса: без «хочу», «как», «мне надо» и подобных. Если ничего не осталось, берутся все. */
function palSig(toks) { const s = toks.filter(k => !PAL_STOP.has(k)); return s.length ? s : toks; }
const palStem = k => (/^[a-z]+$/.test(k) ? (k.length > 3 && k.endsWith('s') ? k.slice(0, -1) : k) : k.length > 6 ? k.slice(0, -2) : k.length > 4 ? k.slice(0, -1) : k);
/** Сколько значимых слов запроса нашлось в тексте команды (по основам слов). */
function palMatchCount(sig, hay) {
  const x = String(hay || '').toLowerCase();
  let n = 0;
  for (const k of sig) if (x.includes(palStem(k))) n++;
  return n;
}

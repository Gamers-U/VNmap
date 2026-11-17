'use strict';
/* ====== Обучение: общий тур с подсветкой и уроки по каждой функции ======
   Тур: затемнение с «окном» вокруг нужной кнопки и карточкой с текстом (Назад, Далее, Пропустить; клавиши ← → и Esc).
   Пока тур идёт, карта и кнопки под затемнением не нажимаются, чтобы случайно ничего не изменить.
   Уроки (lessons.js): список слева, справа «для чего», «как пользоваться», подсказка, «где найти» и две кнопки:
   «Показать на экране» (подсветка нужной кнопки или меню) и «Открыть» (запускает функцию). */

Object.assign(D, {
  'tour.btn': ['Обучение', 'Tutorial'],
  'tour.btn.tip': ['Тур по программе и урок по каждой функции', 'A tour of the app and a lesson for every function'],
  'tour.title': ['Обучение', 'Tutorial'],
  'tour.step': ['Шаг {0} из {1}', 'Step {0} of {1}'],
  'tour.next': ['Далее', 'Next'], 'tour.back': ['Назад', 'Back'], 'tour.done': ['Готово', 'Done'], 'tour.got': ['Понятно', 'Got it'], 'tour.skip': ['Пропустить тур', 'Skip the tour'],
  'tour.search': ['Найти урок…', 'Find a lesson…'], 'tour.none': ['Ничего не найдено', 'Nothing found'], 'tour.found': ['Найдено: {0}', 'Found: {0}'],
  'tour.first': ['Пройти короткий тур (2 минуты)', 'Take a short tour (2 minutes)'],
  'tour.openlessons': ['Открыть уроки', 'Open the lessons'],
  'tour.hero.h': ['Общий тур', 'General tour'],
  'tour.hero.p': ['Две минуты по главным кнопкам: карта, поиск, где лежат остальные функции, плеер, сборка, настройки. Ничего в проекте он не меняет. Листайте кнопками или клавишами ← →, Esc закрывает тур.',
    'Two minutes along the main buttons: the map, the search, where the other functions live, the player, the build, the settings. It changes nothing in your project. Page through with the buttons or the ← → keys, Esc closes the tour.'],
  'tour.hero.go': ['Начать тур', 'Start the tour'],
  'tour.task.ok': ['Получилось! Нажмите «Далее».', 'Done! Press Next.'],
  'tour.walk': ['Попробовать на практике', 'Try it hands-on'],
  'tour.walk.tip': ['Программа сама откроет функцию и по шагам попросит что-нибудь сделать, подсвечивая нужные кнопки', 'The app opens the function itself and asks you to do something step by step, highlighting the right buttons'],
  'tour.walk.mark': ['есть практика', 'hands-on available'],
  'tour.hero.ok': ['Тур уже пройден, его можно повторить.', 'You have already taken the tour, you can repeat it.'],
  'tour.hero.l': ['Уроки по функциям', 'A lesson for every function'],
  'tour.hero.lp': ['Выберите урок слева. В каждом сказано, для чего функция, как ею пользоваться и где она лежит, а кнопка открывает её сразу. Просмотрено уроков: {0} из {1}.',
    'Pick a lesson on the left. Each one says what the function is for, how to use it and where it lives, and a button opens it right away. Lessons viewed: {0} of {1}.'],
  'tour.why': ['Для чего', 'What it is for'], 'tour.how': ['Как пользоваться', 'How to use it'], 'tour.tip': ['Подсказка', 'Tip'], 'tour.where': ['Где найти', 'Where to find it'],
  'tour.open1': ['Откройте её: {0}.', 'Open it: {0}.'],
  'tour.spot': ['Показать на экране', 'Show on screen'], 'tour.open': ['Открыть', 'Open'], 'tour.seen': ['просмотрен', 'viewed'],
  'tour.w.more': ['Ещё → {0} → {1}', 'More → {0} → {1}'],
  'tour.w.strip': ['{0} → {1}', '{0} → {1}'],
  'tour.w.tools': ['Инструменты → {0}', 'Tools → {0}'],
  'tour.w.off': ['Выключено в «Настройки → Модули». Включите модуль, чтобы пользоваться этой функцией.', 'Switched off in Settings → Modules. Switch the module on to use this feature.'],
  'tour.w.k': ['Быстрее всего: Ctrl+K и начните вводить «{0}».', 'The fastest way: Ctrl+K and start typing “{0}”.'],

  'tour.s.welcome': ['Добро пожаловать в «Карту новеллы»', 'Welcome to Story Map'],
  'tour.s.welcome.p': ['Это короткий тур по программе, около двух минут. Листайте кнопками или клавишами ← →, Esc закрывает тур. Ничего в проекте он не меняет.',
    'A short tour of the app, about two minutes. Page through with the buttons or the ← → keys; Esc closes the tour. It changes nothing in your project.'],
  'tour.s.map': ['Карта', 'The map'],
  'tour.s.map.p': ['Здесь вся новелла. Блок это глава или сцена, стрелка это выбор или переход.\nТяните пустое место, чтобы двигать карту, колесо мыши меняет масштаб. Двойной клик по пустому месту создаёт блок, двойной клик по блоку открывает его.',
    'Your whole novel is here. A block is a chapter or a scene, an arrow is a choice or a transition.\nDrag empty space to pan the map, the mouse wheel zooms. Double-click empty space to create a block, double-click a block to open it.'],
  'tour.s.name': ['Название и сохранение', 'Name and saving'],
  'tour.s.name.p': ['Название проекта правится прямо здесь. Рядом метка сохранения: проект сохраняется сам. Резервную копию делает Ctrl+S.', 'The project name is edited right here. Next to it is the save badge: the project saves itself. Ctrl+S makes a backup.'],
  'tour.s.add': ['Блок', 'Block'],
  'tour.s.add.p': ['Создаёт блок в центре экрана. Тип выбирается в списке: блок глав, развилка, концовка или заметка.', 'Creates a block in the centre of the screen. Pick the type from the list: chapter block, fork, ending or note.'],
  'tour.s.search': ['Поиск (Ctrl+K)', 'Search (Ctrl+K)'],
  'tour.s.search.p': ['Находит блоки, реплики, персонажей и любую команду программы. Пишите обычными словами: «хочу собрать игру», «как найти тупики».', 'Finds blocks, lines, characters and every command of the app. Write in plain words: "I want to build the game", "how do I find dead ends".'],
  'tour.s.more': ['Ещё', 'More'],
  'tour.s.more.p': ['Все остальные возможности лежат здесь по разделам: Карта, Тексты, Код, Проверки, Игра, Работа команды (разделы, которые вы выключили, не показываются). Не знаете, где что? В «Обучении» есть урок по каждой функции.', 'All the other features are here, by section: Map, Texts, Code, Checks, Play, Teamwork (sections you switched off are not shown). Not sure where something is? The Tutorial has a lesson for every function.'],
  'tour.s.tools': ['Инструменты', 'Tools'],
  'tour.s.tools.p': ['Полный список возможностей, а также всё, что не вошло ни в один раздел. Те же пункты разложены по разделам рядом: пройдём по ним по порядку.', 'The full list of features, plus everything that is not in any section. The same items are laid out by section next to it: we will go through them in order.'],
  
  'tour.s.play': ['Играть', 'Play'],
  'tour.s.play.p': ['Встроенный плеер проходит новеллу без Ren\'Py: выборы, переменные, история. Можно начать с любого блока.', 'The built-in player runs the novel without Ren\'Py: choices, variables, history. You can start from any block.'],
  'tour.s.text': ['Текст', 'Text'],
  'tour.s.text.p': ['Редактор прозы: пишете главу как в Word, а программа делает из неё сценарий Ren\'Py.', 'A prose editor: you write a chapter like in Word and the app turns it into a Ren\'Py script.'],
  'tour.s.reg': ['Реестр', 'Registry'],
  'tour.s.reg.p': ['Персонажи, фоны, спрайты, аудио, переменные, достижения и интерфейс игры: всё общее для проекта.', 'Characters, backgrounds, sprites, audio, variables, achievements and the game interface: everything shared by the project.'],
  'tour.s.build': ['Сборка', 'Build'],
  'tour.s.build.p': ['Превращает карту в проект Ren\'Py. Перед записью покажет отчёт: ошибки, предупреждения и мини-Lint.', 'Turns the map into a Ren\'Py project. Before writing it shows a report: errors, warnings and the mini-Lint.'],
  'tour.s.export': ['Экспорт', 'Export'],
  'tour.s.export.p': ['Здесь «Сборка» (карта превращается в проект Ren\'Py), картинка карты, PDF, выжимка для вычитки и сохранение проекта.', 'Here are the Build (the map turns into a Ren\'Py project), the map image, the PDF, the proofreading digest and saving the project.'],
  'tour.s.status': ['Состояние проекта и «Статистика»', 'Project status and Statistics'],
  'tour.s.status.p': ['Внизу видно, сколько блоков и файлов, какая часть готова и когда была копия.\nНажмите на эти цифры: откроется «Статистика» с концовками, временем чтения, ветками и автопрогоном. Она же лежит в разделе «Проверки».', 'The bottom bar shows how many blocks and files there are, how much is ready and when the last backup was.\nClick the figures to open Statistics with the endings, the reading time, the branches and the autorun. It also lives in the Checks section.'],
  'tour.s.stats.open': ['Открыть «Статистику»', 'Open Statistics'],
  'tour.s.g.in': ['В разделе: {0}.', 'In this section: {0}.'],
  'tour.s.g.map': ['Раздел «Карта»', 'The Map section'],
  'tour.s.g.map.p': ['Всё, что делает карту удобной: расставить блоки по порядку, сохранить карту в PDF, заметки на карте.', 'Everything that makes the map handy: arrange the blocks, save the map as a PDF, notes on the map.'],
  'tour.s.g.text': ['Раздел «Тексты»', 'The Texts section'],
  'tour.s.g.text.p': ['Всё о тексте новеллы: редактор, импорт из Word, выжимка для вычитки, реплики, переименование, страницы персонажей, озвучка и перевод.', 'Everything about the text of the novel: the editor, import from Word, the proofreading digest, lines, renaming, character pages, voicing and translation.'],
  'tour.s.g.code': ['Раздел «Код»', 'The Code section'],
  'tour.s.g.code.p': ['Всё про код Ren\'Py: свой код проекта, готовые сниппеты и рецепты, интерфейс игры (цвета, шрифты, окна).', 'Everything about Ren\'Py code: the project\'s own code, ready snippets and recipes, the game interface (colours, fonts, windows).'],
  'tour.s.g.check': ['Раздел «Проверки»', 'The Checks section'],
  'tour.s.g.check.p': ['Находит ошибки раньше, чем игрок: сценарий, недостающие файлы, переменные, ветки и концовки, «Статистика».', 'Finds the errors before the player does: the script, missing files, variables, branches and endings, Statistics.'],
  'tour.s.g.play': ['Раздел «Игра»', 'The Play section'],
  'tour.s.g.play.p': ['Проверка игры целиком: плеер, автопрогон, журнал тестов, HTML-версия и запуск в настоящем Ren\'Py.', 'Testing the whole game: the player, the autorun, the test log, the HTML version and a launch in the real Ren\'Py.'],
  'tour.s.g.team': ['Раздел «Работа команды»', 'The Teamwork section'],
  'tour.s.g.team.p': ['Если над новеллой работают несколько человек: команда, «кто я», задачи, кто что делал, проверка правок автора.', 'If several people work on the novel: the team, "who am I", tasks, who did what, checking the author\'s changes.'],
  'tour.s.settings': ['Настройки', 'Settings'],
  'tour.s.settings.p': ['Вид и режим (там наборы), панель, модули и подключения: GitHub и Google Диск.', 'Look and mode (the presets are there), the toolbar, the modules and the connections: GitHub and Google Drive.'],
  'tour.s.help': ['Справка и обучение', 'Help and tutorial'],
  'tour.s.help.p': ['Справка (клавиша ?) описывает каждый раздел и горячие клавиши. Кнопка «Обучение» в ней открывает уроки по каждой функции.', 'Help (the ? key) describes every section and the shortcuts. The Tutorial button in it opens a lesson for every function.'],
  'tour.s.end': ['Это всё', 'That is all'],
  'tour.s.end.p': ['Теперь откройте уроки по функциям или просто начните работу. Тур можно повторить в любой момент: Ctrl+K и слово «обучение».', 'Now open the lessons or simply start working. You can repeat the tour at any time: Ctrl+K and the word "tutorial".'],
});

/* ---------- движок подсветки ---------- */
let TOUR = null;
const tourL = () => (S.lang === 'en' ? 1 : 0);
/** Кнопка верхней панели по подсказке (подсказка совпадает с переводом, поэтому поиск не зависит от языка). */
function tourBtn(tip) { return [...document.querySelectorAll('#topbar [data-tip]')].find(x => x.getAttribute('data-tip') === tip) || null; }
function tourEl(tg) {
  let el = null;
  try { el = typeof tg === 'function' ? tg() : (tg ? document.querySelector(tg) : null); } catch (e) { el = null; }
  if (!el || !el.getBoundingClientRect || el.closest('[hidden]')) return null;
  const r = el.getBoundingClientRect();
  return r.width > 2 && r.height > 2 ? el : null;
}
function tourActive() { return !!TOUR; }
/** Показать шаги: [{ target?, h, p, actions? }]. Шаг без видимой цели пропускается, кроме шагов без цели вообще (они по центру). */
function tourStart(steps, opts) {
  tourStop('restart');
  closePopover();
  const list = steps.filter(s => s && (!s.target || s.late || tourEl(s.target)));
  if (!list.length) return false;
  const blocker = h('div', { class: 'tour-block' }), dim = h('div', { class: 'tour-dim', hidden: true }), card = h('div', { class: 'tour-card', role: 'dialog', 'aria-label': t('tour.title') });
  document.body.append(blocker, dim, card);
  const T = TOUR = { list, i: 0, blocker, dim, card, opts: opts || {}, prevFocus: document.activeElement, first: true, next: null };
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  blocker.addEventListener('mousedown', e => { e.preventDefault(); if (T.next) T.next.focus({ preventScroll: true }); });
  T.onKey = e => {
    const live = !!(T.list[T.i] && T.list[T.i].live), typing = live && !T.card.contains(e.target) && e.target.closest && !!e.target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]');
    if (e.key === 'Escape') { if (live && document.querySelector('.pop')) return; e.preventDefault(); e.stopImmediatePropagation(); tourStop('skip'); return; }   // Esc сначала закрывает открытое меню
    if (typing) return;                                                                 // на «живом» шаге печатать можно: клавиши идут в поле
    if (e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); tourGo(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopImmediatePropagation(); tourGo(-1); return; }
    if (live) return;
    if (e.key === 'Tab' || (T.card.contains(e.target) && /^(Enter| )$/.test(e.key))) return;
    e.preventDefault(); e.stopImmediatePropagation();                                   // остальные клавиши не доходят до карты
  };
  T.onResize = () => { if (TOUR === T) tourShow(T.i); };
  document.addEventListener('keydown', T.onKey, true);
  window.addEventListener('resize', T.onResize);
  tourShow(0);
  return true;
}
function tourGo(d) {
  const T = TOUR; if (!T) return;
  const k = T.i + d;
  if (k < 0) return;
  if (k >= T.list.length) { tourStop('done'); return; }
  tourShow(k, d);
}
/** Показать шаг. У шага с практикой (setup) сначала готовится экран (например, открывается окно), потом ждём, пока появится цель: до 1,5 с. */
function tourShow(i, dir) {
  const T = TOUR; if (!T) return;
  T.i = i; if (dir) T.dir = dir;
  clearInterval(T.poll); T.poll = 0;
  const s = T.list[i];
  if (s.setup) { try { s.setup(); } catch (e) { /* подготовка не удалась: шаг покажется без неё */ } }
  if (s.target && s.late && !tourEl(s.target)) {
    let n = 0;
    const wait = () => {
      if (TOUR !== T || T.i !== i) return;
      if (tourEl(s.target)) { tourPaint(i); return; }
      if (++n < 16) { setTimeout(wait, 100); return; }
      const k = i + (T.dir || 1);                                                       // цели нет: шаг пропускается
      if (k < 0) tourPaint(i); else if (k >= T.list.length) tourStop('done'); else tourShow(k, T.dir);
    };
    setTimeout(wait, 100); return;
  }
  tourPaint(i);
}
function tourPaint(i) {
  const T = TOUR; if (!T) return;
  T.i = i;
  const s = T.list[i], el = s.target ? tourEl(s.target) : null, one = T.list.length === 1, last = i === T.list.length - 1, live = !!(s.live && el);
  const { dim, blocker, card } = T;
  if (el) {
    const r = el.getBoundingClientRect(), pad = 6;
    const x = Math.max(2, r.left - pad), y = Math.max(2, r.top - pad);
    Object.assign(dim.style, { left: x + 'px', top: y + 'px', width: Math.min(innerWidth - x - 2, r.width + pad * 2) + 'px', height: Math.min(innerHeight - y - 2, r.height + pad * 2) + 'px' });
    dim.hidden = false; blocker.classList.remove('full');
  } else { dim.hidden = true; blocker.classList.add('full'); }
  blocker.classList.toggle('live', live); dim.classList.toggle('live', live);          // «живой» шаг: цель можно нажимать и печатать в ней
  const back = i > 0 ? h('button', { class: 'btn', id: 'tour-back', onclick: () => tourGo(-1) }, icon('chevL', 15), t('tour.back')) : null;
  const next = T.next = h('button', { class: 'btn primary', id: 'tour-next', onclick: () => tourGo(1) }, last ? (one ? t('tour.got') : t('tour.done')) : t('tour.next'), last ? null : icon('chevR', 15));
  card.replaceChildren(
    h('div', { class: 'tour-top' }, one ? h('span') : h('span', { class: 'tour-count' }, t('tour.step', i + 1, T.list.length)),
      h('button', { class: 'btn icon sm', id: 'tour-x', 'data-tip': t('c.close') + ' (Esc)', onclick: () => tourStop('skip') }, icon('x', 16))),
    h('h3', { class: 'tour-h' }, s.h),
    ...String(s.p || '').split('\n').filter(Boolean).map(p => h('p', { class: 'tour-p' }, helpRich(p))),
    s.task ? h('div', { class: 'tour-task', id: 'tour-task' }, icon('target', 15), h('span', helpRich(s.task))) : null,
    s.actions && s.actions.length ? h('div', { class: 'tour-acts' }, s.actions.map(a => h('button', { class: 'btn sm', onclick: () => { const run = a.run; tourStop('action'); if (run) run(); } }, a.label))) : null,
    one ? null : h('div', { class: 'tour-bar' }, h('i', { style: { width: Math.round((i + 1) / T.list.length * 100) + '%' } })),
    h('div', { class: 'tour-nav' }, back, h('div', { class: 'grow' }), (!one && !last) ? h('button', { class: 'btn sm ghost', id: 'tour-skip', onclick: () => tourStop('skip') }, t('tour.skip')) : null, next));
  tourPlace(el ? el.getBoundingClientRect() : null, s.cardAt ? tourEl(s.cardAt) : null);
  if (!live) next.focus({ preventScroll: true });                                         // на «живом» шаге фокус не трогаем: курсор может стоять в поле ввода
  if (s.until) {                                                                         // ждём, пока человек сделает задание, и отмечаем это галочкой
    T.poll = setInterval(() => {
      if (TOUR !== T || T.i !== i) return;
      let d = false; try { d = !!s.until(); } catch (e) { d = false; }
      if (!d) return;
      clearInterval(T.poll); T.poll = 0;
      const tk = card.querySelector('.tour-task'); if (tk) { tk.classList.add('ok'); tk.replaceChildren(icon('check', 15), h('span', t('tour.task.ok'))); }
    }, 250);
  }
}
/** Карточка рядом с целью: снизу, сверху, справа, слева; если цель огромная (карта), то у края экрана. */
function tourPlace(r, at) {
  const T = TOUR; if (!T) return;
  const card = T.card, vw = innerWidth, vh = innerHeight, cw = card.offsetWidth, ch = card.offsetHeight, m = 12, gap = 14;
  let x, y;
  if (!r) { x = (vw - cw) / 2; y = (vh - ch) / 2; }
  else if (at) { const a = at.getBoundingClientRect(); x = a.right - cw - 14; y = a.top + 14; }   // шаг сам просит, возле чего встать карточке: так она не закрывает меню и поле ввода
  else {
    const cx = clamp(r.left + r.width / 2 - cw / 2, m, vw - cw - m), cy = clamp(r.top + r.height / 2 - ch / 2, m, vh - ch - m);
    const tries = [[cx, r.bottom + gap, r.bottom + gap + ch + m <= vh], [cx, r.top - gap - ch, r.top - gap - ch >= m],
      [r.right + gap, cy, r.right + gap + cw + m <= vw], [r.left - gap - cw, cy, r.left - gap - cw >= m]];
    const hit = tries.find(z => z[2]);
    if (hit) { x = hit[0]; y = hit[1]; }
    else { x = (vw - cw) / 2; y = r.top + r.height / 2 > vh / 2 ? 70 : vh - ch - 70; }
  }
  if (T.first) { card.style.transition = 'none'; }
  card.style.left = Math.round(clamp(x, m, Math.max(m, vw - cw - m))) + 'px';
  card.style.top = Math.round(clamp(y, m, Math.max(m, vh - ch - m))) + 'px';
  if (T.first) { T.first = false; void card.offsetWidth; card.style.transition = ''; }
}
function tourStop(why) {
  const T = TOUR; if (!T) return;
  TOUR = null; clearInterval(T.poll); T.poll = 0;
  document.removeEventListener('keydown', T.onKey, true);
  window.removeEventListener('resize', T.onResize);
  T.blocker.remove(); T.dim.remove(); T.card.remove();
  try { if (why !== 'action' && why !== 'restart' && T.prevFocus && T.prevFocus.focus && document.contains(T.prevFocus)) T.prevFocus.focus({ preventScroll: true }); } catch (e) { }
  if (T.opts.onEnd && why !== 'restart') T.opts.onEnd(why);
}

/* ---------- общий тур ---------- */
function tourGeneralSteps() {
  const pro = uiPro();
  const S1 = (target, key, extra) => Object.assign({ target, h: t('tour.s.' + key), p: t('tour.s.' + key + '.p') }, extra || {});
  /** Шаг про раздел: текст про раздел и список того, что в нём сейчас видно (названия берутся из самих пунктов). */
  const sec = id => {
    const g = UI_STRIP.find(x => x.id === id); if (!g || !tourEl('#toolstrip .strip-' + id)) return null;
    const names = g.items.map(x => tlToolItem(x)).filter(it => it && uiShow(it.id)).map(it => String(t(it.key)).replace(/…$/, ''));
    return { target: '#toolstrip .strip-' + id, h: t('tour.s.g.' + id), p: t('tour.s.g.' + id + '.p') + (names.length ? '\n' + t('tour.s.g.in', names.join(', ')) : '') };
  };
  /* порядок такой же, как на экране: название, Блок, Поиск, Инструменты, разделы, Играть, Текст, Реестр, Сборка, Настройки, Справка, строка состояния */
  return [
    S1(null, 'welcome'),
    S1('#stage', 'map'),
    S1('#proj-name', 'name'),
    S1(() => tourBtn(t('top.add.tip')), 'add'),
    S1(() => tourBtn(t('top.search') + ' (Ctrl+K)'), 'search'),
    pro ? S1('.tools-btn', 'tools') : S1('.more-btn', 'more'),
    ...(pro ? UI_STRIP.map(g => sec(g.id)) : []),
    S1('.pl-top-btn', 'play'),
    S1('.te-top-btn', 'text'),
    S1(() => tourBtn(t('top.registry.tip')), 'reg'),
    S1('.build-btn', pro ? 'export' : 'build'),
    S1(() => tourBtn(t('top.settings')), 'settings'),
    S1(() => tourBtn(t('top.help') + ' (?)'), 'help'),
    S1('#statusbar .stat', 'status', { actions: [{ label: t('tour.s.stats.open'), run: () => setTimeout(() => openStatsHub(), 0) }] }),
    S1(null, 'end', { actions: [{ label: t('tour.openlessons'), run: () => setTimeout(() => openTour(), 0) }] }),
  ].filter(Boolean);
}
function tourGeneral() {
  return tourStart(tourGeneralSteps(), { onEnd: why => { if (why === 'done') { uiCfg().tour = 1; saveSettings(); } } });
}

/* ---------- уроки ---------- */
function tlToolItem(id) { return TOOL_ITEMS.find(x => x.id === id) || null; }
const tlPick = pair => (Array.isArray(pair) ? pair[tourL()] : String(pair || ''));
function tlTitle(l) { if (l.tool) { const it = tlToolItem(l.tool); return it ? String(t(it.key)).replace(/…$/, '') : l.id; } return tlPick(l.h); }
function tlIcon(l) { if (l.tool) { const it = tlToolItem(l.tool); return (it && it.ic) || 'help'; } return l.ic || 'help'; }
/** Где лежит функция в текущем режиме: текст и кнопка для подсветки. */
function tlLocate(l) {
  if (!l.tool) return { text: tlPick(l.where), target: l.spot || null, plain: true };
  const it = tlToolItem(l.tool), name = tlTitle(l), pro = uiPro();
  const search = () => tourBtn(t('top.search') + ' (Ctrl+K)');
  const kk = t('tour.w.k', name);
  if (!it) return { text: '', target: search };
  if (l.where) return { text: tlPick(l.where) + '\n' + kk, target: l.spot || search };
  const lvl = typeof UI_LVL !== 'undefined' ? UI_LVL[l.tool] : null;
  if (lvl && lvl[0] === 'x') return { text: kk, target: search };
  if (typeof uiShow === 'function' && !uiShow(l.tool)) return { text: t('tour.w.off'), target: () => tourBtn(t('top.settings')), off: true };
  const g = UI_STRIP.find(x => x.items.includes(l.tool));
  if (!g) return pro ? { text: t('tour.w.tools', name) + '\n' + kk, target: '.tools-btn' } : { text: t('tour.w.more', t('ui.more.other'), name) + '\n' + kk, target: '.more-btn' };
  const gl = t('ui.g.' + g.id);
  if (pro) return uiInStrip(l.tool) ? { text: t('tour.w.strip', gl, name) + '\n' + kk, target: () => tourEl('#toolstrip .strip-' + g.id) || tourEl('.tools-btn') }
    : { text: t('tour.w.tools', name) + '\n' + kk, target: '.tools-btn' };                   // раздел скрыт на вкладке «Панель»: пункт переехал в «Инструменты»
  return { text: t('tour.w.more', gl, name) + '\n' + kk, target: '.more-btn' };
}
function tlPath(loc) { return String(loc.text || '').split('\n')[0]; }
function tlOpen(l) {
  if (l.tool) { const it = tlToolItem(l.tool); if (!it) return; setTimeout(() => it.run(document.querySelector('.tools-btn') || document.querySelector('.more-btn')), 0); return; }
  if (l.open) setTimeout(() => l.open(), 0);
}
const tlCanOpen = l => !!(l.tool ? tlToolItem(l.tool) : l.open);
function tlSeen(id) { const c = uiCfg(); return !!(c.lessons && c.lessons[id]); }
function tlMarkSeen(id) { const c = uiCfg(); if (!c.lessons || typeof c.lessons !== 'object') c.lessons = {}; if (!c.lessons[id]) { c.lessons[id] = 1; saveSettings(); } }
function tlText(l) {
  const loc = tlLocate(l);
  return [tlTitle(l), tlPick(l.why), ...l.how.map(tlPick), tlPick(l.tip), loc.text].join(' ');
}
/** Подсветить, где функция лежит, одной карточкой. После неё вернуться в список уроков. */
function tlSpotlight(l, back) {
  const loc = tlLocate(l), title = tlTitle(l);
  const step = { target: tourEl(loc.target) ? loc.target : null, h: title, p: loc.text, actions: tlCanOpen(l) && !loc.off ? [{ label: t('tour.open'), run: () => tlOpen(l) }] : [] };
  if (!tourStart([step], { onEnd: why => { if (why !== 'action') setTimeout(() => (back ? back() : openTour(l.id)), 0); } })) (back ? back() : openTour(l.id));
}

const TOUR_TAB_LS = 'vnmap.tour.tab';
function openTour(focus) {
  closePopover(); tourStop('restart');
  const L = tourL();
  const byId = new Map(TOUR_LESSONS.map(x => [x.id, x]));
  const st = { q: '', cur: focus && (focus === 'tour' || byId.has(focus)) ? focus : (lsGet(TOUR_TAB_LS) || 'tour') };
  if (st.cur !== 'tour' && !byId.has(st.cur)) st.cur = 'tour';
  const match = l => !st.q || tlText(l).toLowerCase().includes(st.q.toLowerCase());
  const nav = h('nav', { class: 'help-nav' }), view = h('div', { class: 'help-view' }), cnt = h('div', { class: 'help-count hint' });
  const search = h('input', { class: 'inp help-q', type: 'search', placeholder: t('tour.search'), id: 'tl-q', spellcheck: 'false', autocomplete: 'off' });
  let modal = null;
  const vis = () => TOUR_LESSONS.filter(match);
  const go = id => { st.cur = id; lsSet(TOUR_TAB_LS, id); paint(); view.scrollTop = 0; };
  const paint = () => {
    const shown = vis(), set = new Set(shown.map(x => x.id));
    if (st.cur !== 'tour' && !set.has(st.cur) && shown.length) st.cur = shown[0].id;
    nav.replaceChildren();
    nav.append(h('button', { class: 'help-tab' + (st.cur === 'tour' ? ' on' : ''), id: 'tl-tab-tour', onclick: () => go('tour') }, icon('sparkles', 16), h('span', t('tour.hero.h')), uiCfg().tour ? h('span', { class: 'tl-ok' }, icon('check', 14)) : null));
    for (const [gid, gl] of TL_GROUPS) {
      const items = shown.filter(x => x.g === gid); if (!items.length) continue;
      nav.append(h('div', { class: 'help-g' }, gl[L]));
      items.forEach(x => nav.append(h('button', { class: 'help-tab' + (x.id === st.cur ? ' on' : ''), 'data-lesson': x.id, onclick: () => go(x.id) }, icon(tlIcon(x), 16), h('span', tlTitle(x)), typeof tlWalkOf === 'function' && tlWalkOf(x) ? h('span', { class: 'tl-walk', 'data-tip': t('tour.walk.mark') }, icon('target', 13)) : null, tlSeen(x.id) ? h('span', { class: 'tl-ok', 'data-tip': t('tour.seen') }, icon('check', 14)) : null)));
    }
    cnt.textContent = st.q ? t('tour.found', shown.length) : '';
    view.replaceChildren();
    if (st.cur === 'tour') { paintHero(); const on = nav.querySelector('.help-tab.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' }); return; }
    const l = byId.get(st.cur);
    if (!l || !set.has(l.id)) { view.append(h('div', { class: 'empty' }, t('tour.none'))); return; }
    tlMarkSeen(l.id);
    const tab = nav.querySelector('.help-tab.on'); if (tab && !tab.querySelector('.tl-ok')) tab.append(h('span', { class: 'tl-ok', 'data-tip': t('tour.seen') }, icon('check', 14)));
    paintLesson(l, shown);
    if (tab && tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest' });
  };
  const paintHero = () => {
    const seen = TOUR_LESSONS.filter(x => tlSeen(x.id)).length;
    view.append(h('div', { class: 'help-card tour-hero' },
      h('div', { class: 'help-h' }, h('span', { class: 'help-ic' }, icon('sparkles', 20)), h('h2', t('tour.hero.h'))),
      h('p', { class: 'help-p' }, t('tour.hero.p')),
      h('div', { class: 'tl-acts' }, h('button', { class: 'btn primary', id: 'tl-start', onclick: () => { modal.close(); setTimeout(() => tourGeneral(), 80); } }, icon('play', 15), t('tour.hero.go')),
        uiCfg().tour ? h('span', { class: 'hint' }, t('tour.hero.ok')) : null),
      h('h3', { class: 'tl-h4 big' }, t('tour.hero.l')),
      h('p', { class: 'help-p' }, t('tour.hero.lp', seen, TOUR_LESSONS.length))));
  };
  const paintLesson = (l, shown) => {
    const loc = tlLocate(l), steps = l.how.map(tlPick);
    if (l.tool) steps.unshift(t('tour.open1', tlPath(loc) || tlTitle(l)));
    const where = String(loc.text || '').split('\n').filter(Boolean);
    const card = h('div', { class: 'help-card tl-card', 'data-lesson': l.id },
      h('div', { class: 'help-h' }, h('span', { class: 'help-ic' }, icon(tlIcon(l), 20)), h('h2', helpRich(tlTitle(l), st.q))),
      h('p', { class: 'help-p' }, helpRich(tlPick(l.why), st.q)),
      h('h3', { class: 'tl-h4' }, t('tour.how')),
      h('ol', { class: 'tl-steps' }, steps.map(x => h('li', helpRich(x, st.q)))),
      h('div', { class: 'tl-tip' }, h('b', t('tour.tip') + ': '), helpRich(tlPick(l.tip), st.q)),
      where.length ? h('div', { class: 'tl-where' }, h('b', t('tour.where') + ': '), where.map((x, i) => h('div', { class: i ? 'hint' : '' }, x))) : null,
      h('div', { class: 'tl-acts' },
        h('button', { class: 'btn', id: 'tl-spot', onclick: () => { modal.close(); setTimeout(() => tlSpotlight(l), 80); } }, icon('search', 15), t('tour.spot')),
        tlCanOpen(l) && !loc.off ? h('button', { class: 'btn primary', id: 'tl-open', onclick: () => { modal.close(); tlOpen(l); } }, icon('play', 15), t('tour.open')) : null,
        typeof tlWalkOf === 'function' && tlWalkOf(l) && !loc.off ? h('button', { class: 'btn', id: 'tl-walk', 'data-tip': t('tour.walk.tip'), onclick: () => { modal.close(); setTimeout(() => tlWalkRun(l), 120); } }, icon('target', 15), t('tour.walk')) : null));
    view.append(card);
    const order = shown.map(x => x.id), at = order.indexOf(l.id);
    view.append(h('div', { class: 'help-pn' },
      at > 0 ? h('button', { class: 'btn', onclick: () => go(order[at - 1]) }, icon('chevL', 15), tlTitle(byId.get(order[at - 1]))) : h('button', { class: 'btn', onclick: () => go('tour') }, icon('chevL', 15), t('tour.hero.h')),
      at < order.length - 1 ? h('button', { class: 'btn', onclick: () => go(order[at + 1]) }, tlTitle(byId.get(order[at + 1])), icon('chevR', 15)) : h('span')));
  };
  search.addEventListener('input', () => { st.q = search.value.trim(); paint(); });
  search.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = vis(); if (v.length && !v.some(x => x.id === st.cur)) go(v[0].id); } });
  modal = openModal({
    cls: 'help-m tour-m', build: m => {
      modal = m; paint();
      setTimeout(() => { if (window.matchMedia && matchMedia('(pointer:fine)').matches) search.focus(); }, 60);
      const body = h('div', { class: 'help-body' }, nav, view);
      return h('div', { class: 'm-wrap' }, modalHead(t('tour.title'), m, [h('div', { class: 'help-sw' }, icon('search', 15), search, cnt), helpZoomCtl(body)]), body);
    }
  });
  return modal;
}

'use strict';
/* ====== Контрольная новелла и чек-лист проверки в настоящем Ren'Py ======
   Программа собирает игру сама, но настоящий Ren'Py её проверяла только имитация. Поэтому здесь есть маленькая новелла со всеми
   конструкциями, которые собирает программа (выборы с условиями, метки, python-блок, теги текста, концовки, достижения, галерея,
   музыкальная комната), и список шагов: что запустить и что должно получиться. Результат автор отмечает, копирует одним
   нажатием и присылает: так видно, что именно не сработало, без пересказа «не работает». Картинок и звуков в новелле нет:
   программа подставит заглушки, поэтому она запускается на любом Ren'Py SDK без дополнительных файлов. */

Object.assign(D, {
  'cc.btn': ['Проверка в Ren\'Py', 'Ren\'Py check'], 'cc.tip': ['Контрольная новелла и чек-лист: проверить сборку в настоящем Ren\'Py и прислать результат', 'A test novel and a checklist: try the build in real Ren\'Py and send the result'],
  'cc.title': ['Проверка сборки в настоящем Ren\'Py', 'Check the build in real Ren\'Py'],
  'cc.lead': ['Программа собирает игру сама, но в настоящем Ren\'Py её проверяла только имитация. Здесь маленькая новелла со всеми конструкциями и список шагов. Пройдите его, отметьте результат и скопируйте отчёт: по нему видно, что именно не сработало.',
    'The app builds the game by itself, but only a simulation has checked it against real Ren\'Py. Here is a small novel with every construct and a list of steps. Go through it, mark the result and copy the report: it shows exactly what did not work.'],
  'cc.s1': ['1. Контрольная новелла', '1. The test novel'],
  'cc.s1.p': ['12 блоков: выборы с условиями, метки внутри глав, python-блок, теги текста, три обычные концовки и секретная, достижения, галерея и музыкальная комната. Картинок и звуков нет: программа поставит заглушки.',
    '12 blocks: choices with conditions, labels inside chapters, a python block, text tags, three regular endings and a secret one, achievements, a gallery and a music room. No pictures or sounds: the app will put placeholders.'],
  'cc.make': ['Создать контрольный проект', 'Create the test project'],
  'cc.make.q': ['Заменить открытый проект контрольным?', 'Replace the open project with the test one?'],
  'cc.make.t': ['Открытый проект будет заменён. Сначала сохраните резервную копию (кнопка в строке состояния или «Экспорт»). Контрольный проект можно создать снова в любой момент.', 'The open project will be replaced. Save a backup first (the button in the status bar or "Export"). You can create the test project again at any time.'],
  'cc.make.done': ['Контрольный проект создан', 'The test project was created'],
  'cc.s2': ['2. Подготовка (один раз)', '2. Setup (once)'],
  'cc.s2.p': ['Скачайте Ren\'Py SDK (renpy.org), распакуйте, откройте лаунчер и создайте пустой проект («Create New Project»). В программе для компьютера откройте «Сборка» → «Запуск в Ren\'Py» и укажите две папки: SDK и проект. В веб-версии такой вкладки нет: соберите игру кнопкой «Скачать .zip», распакуйте в папку проекта вместо game и запустите в лаунчере.',
    'Download the Ren\'Py SDK (renpy.org), unpack it, open the launcher and create an empty project ("Create New Project"). In the desktop app open "Build" → "Run in Ren\'Py" and point to two folders: the SDK and the project. The web version has no such tab: build the game with "Download .zip", unpack it into the project folder instead of game and run it in the launcher.'],
  'cc.open': ['Открыть «Сборка»', 'Open "Build"'],
  'cc.s3': ['3. Шаги проверки', '3. Steps'],
  'cc.s3.p': ['У каждого шага три состояния: не проверял, работает, ошибка. Если ошибка, коротко напишите, что увидели.', 'Each step has three states: not checked, works, error. If it failed, briefly write what you saw.'],
  'cc.st.0': ['Не проверял', 'Not checked'], 'cc.st.1': ['Работает', 'Works'], 'cc.st.2': ['Ошибка', 'Error'],
  'cc.note': ['Что увидели', 'What you saw'],
  'cc.s4': ['4. Вывод Lint', '4. Lint output'],
  'cc.s4.p': ['Вставьте сюда вывод проверки (в программе: «Проверить (lint)», в лаунчере: «Check Script (Lint)»). Если Lint не запускали, оставьте пустым.', 'Paste the check output here (in the app: "Check (lint)", in the launcher: "Check Script (Lint)"). Leave it empty if you did not run Lint.'],
  'cc.s5': ['5. Отчёт', '5. Report'],
  'cc.copy': ['Скопировать отчёт', 'Copy the report'], 'cc.copied': ['Отчёт скопирован. Вставьте его в чат.', 'The report was copied. Paste it into the chat.'],
  'cc.ver': ['Версия программы', 'App version'], 'cc.proj': ['Проект', 'Project'], 'cc.ren': ['Версия Ren\'Py и система (допишите)', 'Ren\'Py version and system (fill in)'],
  'cc.sum': ['Итог: работает {0}, ошибок {1}, не проверено {2}', 'Total: works {0}, errors {1}, not checked {2}'],
  'cc.step.1': ['Lint без ошибок. В конце вывода нет строк «error»; предупреждения про заглушки картинок допустимы.', 'Lint has no errors. There are no "error" lines at the end of the output; warnings about placeholder pictures are fine.'],
  'cc.step.2': ['Игра запускается и показывает главное меню, потом начинается с блока «Начало».', 'The game starts, shows the main menu and then begins with the "Начало" block.'],
  'cc.step.3': ['Реплики: курсив и жирный работают, в тексте виден «Игрок», показаны [пример] и {пример}, пауза {w} и {p} работают, extend дописывает строку.', 'Lines: italics and bold work, the text shows the player name, [пример] and {пример} are shown literally, the {w} and {p} pauses work and extend continues the line.'],
  'cc.step.4': ['В знакомстве меню «Улыбнуться / Промолчать». Меню развилки: «Пойти в парк» и «Пойти домой» есть всегда, а «Остаться и поговорить» только после «Улыбнуться».', 'The introduction has a "Улыбнуться / Промолчать" menu. The fork menu always has "Пойти в парк" and "Пойти домой", and "Остаться и поговорить" only after "Улыбнуться".'],
  'cc.step.5': ['Ветка «парк»: python-блок показал уведомление, меню в парке работает, пункт «Покормить уток» виден (доверие 2 и больше).', 'The "park" branch: the python block showed a notification, the park menu works and "Покормить уток" is visible (trust is two or more).'],
  'cc.step.6': ['Ветка «дом»: сцена идёт, вызывает метку из блока «Разговор» (call), возвращается («Вернулись из вызова») и приводит к финальной развилке.', 'The "home" branch: the scene runs, calls a label from the "Разговор" block (call), returns ("Вернулись из вызова") and leads to the final fork.'],
  'cc.step.7': ['Финальная развилка: «Хороший финал» виден только после парка и прогулки (доверие и прогулки в сумме 3), «Нейтральный» виден всегда, «Плохой» только после дома.', 'The final fork: the good ending shows only after the park and the walk (trust plus walks is 3), the neutral one always shows, the bad one only after the home branch.'],
  'cc.step.8': ['После концовки показана карточка концовки и счётчик «открыто N из 4».', 'After an ending the ending card and the "N of 4 opened" counter are shown.'],
  'cc.step.9': ['После двух разных концовок открывается секретная («Истинная концовка»).', 'After two different endings the secret one opens.'],
  'cc.step.10': ['Из главного меню открываются галерея, музыкальная комната и достижения (без ошибок, пусть и с заглушками).', 'The gallery, the music room and the achievements open from the main menu (no errors, placeholders are fine).'],
  'cc.step.11': ['Сохранение и загрузка в середине сцены работают, откат колесом мыши возвращает на реплику назад.', 'Saving and loading in the middle of a scene work, and rollback with the mouse wheel goes one line back.'],
  'cc.step.12': ['Необязательно: «Собрать дистрибутив» делает архив без ошибок.', 'Optional: "Build distribution" makes an archive without errors.'],
});

Object.assign(D, {
  'cc.guide.h': ['Не уверены, что сборка работает?', 'Not sure the build works?'],
  'cc.guide.p': ['Контрольная новелла и список шагов: пройдите их в настоящем Ren\'Py и отправьте отчёт.', 'A test novel and a list of steps: go through them in real Ren\'Py and send the report.'],
  'rp.guide.h': ['Запустить прямо из программы', 'Run it right from the app'],
  'rp.guide.p': ['Вкладка «Запуск в Ren\'Py» собирает игру, записывает её в папку проекта и запускает Ren\'Py одной кнопкой, а ошибки показывает здесь же.', 'The "Run in Ren\'Py" tab builds the game, writes it into the project folder, launches Ren\'Py with one button and shows errors right there.'],
});
const CC_STEPS = 12;

/** Контрольная новелла. Картинки и звуки не нужны: программа ставит заглушки, поэтому она запускается на любом Ren'Py SDK. */
function controlProject() {
  const mkc = (name, tag, color) => ({ id: uid('c'), name, tag, color, aliases: '', always: false, notes: '' });
  const cAlice = mkc('Алиса', 'alice', 'orange'), cMaks = mkc('Макс', 'maks', 'cyan');
  const A = (kind, name, path, expr, extra) => Object.assign({ id: uid('a'), kind, name, path: path || '', notes: '', expr: expr || [], files: {} }, extra || {});
  const assets = [...defaultFx(),
    A('bg', 'bg park', 'images/bg_park.png', [], { cg: true }), A('bg', 'bg home', 'images/bg_home.png', [], { cg: true }),
    A('sprite', 'alice', 'images/alice', ['normal', 'smile']), A('sprite', 'maks', 'images/maks', ['normal']),
    A('music', 'Тема', 'audio/theme.ogg'), A('music', 'Дом', 'audio/home.ogg'), A('sfx', 'Звонок', 'audio/bell.ogg')];
  const vTrust = { id: uid('v'), name: 'trust', value: '0', type: 'number', notes: 'Доверие Макса.' };
  const vars = [vTrust,
    { id: uid('v'), name: 'walks', value: '0', type: 'number', notes: 'Сколько раз Алиса побывала в гостях и на прогулках.' },
    { id: uid('v'), name: 'met_maks', value: 'False', type: 'flag', notes: 'Познакомились ли.' },
    { id: uid('v'), name: 'liked', value: 'False', type: 'flag', notes: 'Улыбнулась ли Алиса при знакомстве: открывает пункт «Остаться и поговорить».' },
    { id: uid('v'), name: 'route', value: '""', type: 'choice', values: ['park', 'home', 'talk'], notes: 'Выбранный путь.' },
    { id: uid('v'), name: 'player_name', value: '""', type: 'raw', notes: 'Имя игрока для подстановки.' }];
  const F = (title, status, summary, cast, script) => ({ id: uid('f'), title, filename: '', label: '', status, summary, cast: cast.map(c => c.id), location: '', notes: '', visual: '', assets: [], script });
  const N = (type, x, y, title, color, files, extra) => Object.assign({ id: uid('n'), type, x, y, title, desc: '', color, defaultCast: [], files, unlock: null }, extra || {});

  const start = N('chapter', 0, 240, 'Начало', 'blue', [F('Начало', 'written', 'Реплики с тегами текста и командами показа.', [cAlice], [
    'scene bg park with fade',
    'play music "audio/theme.ogg" fadein 1.0',
    'show alice normal at center with dissolve',
    '$ player_name = "Игрок"',
    'alice "Привет, [player_name]! Это {i}контрольная{/i} новелла."',
    'alice "Если вы видите эту реплику, движок запустился."',
    '"Строка рассказчика: {b}жирный{/b} и {color=#f80}цветной{/color} текст."',
    'alice smile "Спрайт с выражением и «ёлочки» внутри строки."',
    'alice "Скобки показываем так: [[пример]] и {{пример}}."',
    'alice "Пауза{w=0.5} и перенос{p}второй строкой."',
    'extend " Продолжение через extend."',
    'play sound "audio/bell.ogg"',
    'pause 0.5',
    'hide alice with dissolve'].join('\n'))]);
  const meet = N('chapter', 300, 240, 'Знакомство', 'cyan', [
    F('Знакомство 1', 'written', 'Условие внутри главы.', [cAlice, cMaks], [
      'scene bg park with dissolve',
      'show alice normal at left',
      'show maks normal at right with moveinright',
      'maks "Привет! Я Макс."',
      '$ met_maks = True',
      'if player_name == "Игрок":',
      '    maks "Рад тебя видеть, [player_name]."',
      'else:',
      '    maks "Как тебя зовут?"',
      'alice "Рада познакомиться."',
      'menu:',
      '    maks "Ну что, подружимся?"',
      '    "Улыбнуться":',
      '        $ liked = True',
      '        alice smile "Конечно!"',
      '    "Промолчать":',
      '        $ liked = False',
      '        alice "..."'].join('\n')),
    F('Знакомство 2 (своя метка)', 'written', 'Глава со своими метками и переходом jump.', [cAlice, cMaks], [
      'label meet_extra:',
      '    maks "Это отдельная метка внутри главы."',
      '    $ trust += 1',
      '    jump meet_extra_end',
      'label meet_extra_end:',
      '    maks "А это вторая метка, на которую был jump."'].join('\n'))]);
  const fork1 = N('fork', 600, 240, 'Развилка', 'orange', [F('Развилка', 'draft', 'Меню с условиями.', [cAlice], 'alice "Куда пойдём?"')], { prompt: 'Куда пойти?' });
  const park = N('chapter', 900, 60, 'Парк', 'green', [F('Парк', 'written', 'Python-блок и своё меню в тексте.', [cAlice], [
    'scene bg park with fade',
    'show alice smile at center',
    'python:',
    '    moods = ["тихо", "ветрено", "светло"]',
    '    pick = moods[trust % 3]',
    '    renpy.notify("Проверка: python-блок выполнен")',
    'alice "В парке [pick]."',
    'menu:',
    '    "Что делать в парке?"',
    '    "Погулять":',
    '        $ walks += 1',
    '        alice "Прогулка удалась."',
    '    "Покормить уток" if trust >= 2:',
    '        alice "Утки довольны."',
    '    "Уйти":',
    '        alice "Пойду дальше."',
    'alice "Конец сцены в парке."'].join('\n'))]);
  const home = N('chapter', 900, 240, 'Дом', 'indigo', [F('Дом', 'written', 'Вызов метки из другого блока (call).', [cAlice], [
    'scene bg home with fade',
    'play music "audio/home.ogg" fadein 1.0',
    'show alice normal at right',
    'alice "Дома тихо."',
    'call talk_scene',
    'alice "Вернулись из вызова."'].join('\n'))]);
  const talk = N('chapter', 900, 420, 'Разговор', 'purple', [F('Разговор', 'written', 'Метка, которую вызывают из другого блока.', [cAlice, cMaks], [
    'label talk_scene:',
    '    scene bg home with dissolve',
    '    show maks normal at left',
    '    maks "Заглянул на огонёк."',
    '    $ walks += 1',
    '    alice "Спасибо, что пришёл."'].join('\n'))]);
  const fork2 = N('fork', 1200, 240, 'Финальная развилка', 'orange', [F('Финальная развилка', 'draft', 'Выбор концовки.', [cAlice], 'alice "Чем всё закончится?"')], { prompt: 'Как закончить?' });
  const endGood = N('ending', 1500, 60, 'Хороший финал', 'green', [F('Хороший финал', 'written', '', [cAlice], 'scene black with fade\n"Хороший финал: всё получилось."')]);
  const endMid = N('ending', 1500, 240, 'Нейтральный финал', 'gray', [F('Нейтральный финал', 'written', '', [cAlice], 'scene black with fade\n"Нейтральный финал: всё как обычно."')]);
  const endBad = N('ending', 1500, 420, 'Плохой финал', 'red', [F('Плохой финал', 'written', '', [cAlice], 'scene black with fade\n"Плохой финал: что-то пошло не так."')]);
  const secret = N('ending', 1800, 240, 'Истинная концовка', 'purple', [F('Истинная концовка', 'written', '', [cAlice], 'scene black with fade\n"Секретная концовка открылась."')],
    { unlock: { need: 2, from: [endGood.id, endMid.id, endBad.id] } });
  const note = N('note', 0, 20, 'Заметка', 'yellow', [], { desc: 'Контрольная новелла для проверки сборки в настоящем Ren\'Py. Заметки в сборку не попадают.' });

  const nodes = [start, meet, fork1, park, home, talk, fork2, endGood, endMid, endBad, secret, note];
  const E = (a, b, title, extra) => Object.assign({ id: uid('e'), from: a.id, to: b.id, fromSide: 'auto', toSide: 'auto', title: title || '', desc: '', color: null, dashed: false, cond: '', code: '', pts: [] }, extra || {});
  const edges = [
    E(start, meet), E(meet, fork1),
    E(fork1, park, 'Пойти в парк', { code: 'route = "park"', sets: [{ v: vTrust.id, op: 'add', val: '1' }] }),
    E(fork1, home, 'Пойти домой', { cond: 'met_maks', code: 'route = "home"' }),
    E(fork1, talk, 'Остаться и поговорить', { cond: 'liked', dashed: true, code: 'route = "talk"' }),
    E(park, fork2), E(home, fork2, 'Выйти из дома'), E(talk, fork2),
    E(fork2, endGood, 'Хороший финал', { cond: 'trust + walks >= 3' }), E(fork2, endMid, 'Нейтральный финал'), E(fork2, endBad, 'Плохой финал', { cond: 'route == "home"', color: 'red' })];
  return normalize({
    name: 'Контрольная новелла (проверка Ren\'Py)', nodes, edges, characters: [cAlice, cMaks], assets, startId: start.id, vars,
    achs: [
      { id: uid('g'), title: 'Знакомство', desc: 'Познакомиться с Максом', icon: '★', hidden: false, key: '', trig: 'block', ref: meet.id },
      { id: uid('g'), title: 'Все концовки', desc: 'Открыть все концовки', icon: '♛', hidden: false, key: '', trig: 'endings_all', ref: '' },
      { id: uid('g'), title: 'Коллекционер', desc: 'Собрать все картинки галереи', icon: '◆', hidden: true, key: '', trig: 'cg_all', ref: '' }],
    sim: { reached: {} }, view: { x: 100, y: 200, k: 0.6 }
  });
}
async function ccMake(after) {
  if (P.nodes.length && !(await confirmDlg({ title: t('cc.make.q'), text: t('cc.make.t'), ok: t('cc.make'), danger: true }))) return false;
  setProject(controlProject()); fitAll(false); toast(t('cc.make.done'));
  if (after) after();
  return true;
}

const CC = { st: {}, note: {}, lint: '', ren: '' };
function ccReport() {
  const names = i => t('cc.step.' + i), lines = [];
  let ok = 0, bad = 0, none = 0;
  for (let i = 1; i <= CC_STEPS; i++) { const s = CC.st[i] || 0; if (s === 1) ok++; else if (s === 2) bad++; else none++; }
  lines.push('# ' + t('cc.title'));
  lines.push(t('cc.ver') + ': ' + (APP_VERSION && APP_VERSION.charAt(0) !== '/' ? APP_VERSION : APP_BUILD) + (DESK ? ' (desktop)' : ' (web)'));
  lines.push(t('cc.proj') + ': ' + (P.name || ''));
  lines.push(t('cc.ren') + ': ' + (CC.ren || '—'));
  lines.push(t('cc.sum', ok, bad, none));
  lines.push('');
  for (let i = 1; i <= CC_STEPS; i++) {
    const s = CC.st[i] || 0, mark = s === 1 ? '[+]' : s === 2 ? '[-]' : '[ ]';
    lines.push(mark + ' ' + i + '. ' + names(i));
    if (s === 2 && (CC.note[i] || '').trim()) lines.push('    → ' + CC.note[i].trim());
  }
  if ((CC.lint || '').trim()) { lines.push(''); lines.push('--- Lint ---'); lines.push(CC.lint.trim().slice(0, 6000)); }
  return lines.join('\n');
}
function openCtrlCheck() {
  closePopover();
  openModal({
    cls: 'cc-m', build: m => {
      const body = h('div', { class: 'm-pad scroll cc-body' });
      const card = (title, ...kids) => h('div', { class: 'sh-card cc-card' }, h('div', { class: 'sh-h' }, h('b', title)), ...kids);
      const sum = h('div', { class: 'hint cc-sum' });
      const refreshSum = () => { let ok = 0, bad = 0, none = 0; for (let i = 1; i <= CC_STEPS; i++) { const s = CC.st[i] || 0; if (s === 1) ok++; else if (s === 2) bad++; else none++; } sum.textContent = t('cc.sum', ok, bad, none); };
      const steps = h('div', { class: 'cc-steps' });
      for (let i = 1; i <= CC_STEPS; i++) {
        const row = h('div', { class: 'cc-step', 'data-step': i });
        const note = h('input', { class: 'inp cc-note', type: 'text', placeholder: t('cc.note'), value: CC.note[i] || '', 'aria-label': t('cc.note') });
        note.addEventListener('input', () => { CC.note[i] = note.value; });
        const paint = () => {
          const s = CC.st[i] || 0;
          row.replaceChildren(h('div', { class: 'cc-t' }, h('b', i + '. '), t('cc.step.' + i)),
            segmented([0, 1, 2].map(v => ({ value: v, label: t('cc.st.' + v) })), s, v => { CC.st[i] = v; paint(); refreshSum(); }, 'cc-seg'),
            s === 2 ? note : null);
          row.className = 'cc-step' + (s === 1 ? ' ok' : s === 2 ? ' bad' : '');
        };
        paint(); steps.append(row);
      }
      const lint = h('textarea', { class: 'inp cc-lint', rows: 5, placeholder: 'Lint…', 'aria-label': t('cc.s4') });
      lint.value = CC.lint; lint.addEventListener('input', () => { CC.lint = lint.value; });
      const ren = h('input', { class: 'inp', type: 'text', placeholder: 'Ren\'Py 8.x, Windows / macOS / Linux', value: CC.ren, 'aria-label': t('cc.ren') });
      ren.addEventListener('input', () => { CC.ren = ren.value; });
      body.append(h('div', { class: 'hint' }, t('cc.lead')),
        card(t('cc.s1'), h('div', { class: 'hint' }, t('cc.s1.p')), h('div', { class: 'nt-btns' }, h('button', { class: 'btn primary', id: 'cc-make', onclick: () => ccMake(() => m.close()) }, t('cc.make')))),
        card(t('cc.s2'), h('div', { class: 'hint' }, t('cc.s2.p')), DESK ? h('div', { class: 'nt-btns' }, h('button', { class: 'btn', id: 'cc-open', onclick: () => { m.close(); setTimeout(() => openBuild('renpy'), 0); } }, t('cc.open'))) : null),
        card(t('cc.s3'), h('div', { class: 'hint' }, t('cc.s3.p')), steps, sum),
        card(t('cc.s4'), h('div', { class: 'hint' }, t('cc.s4.p')), lint),
        card(t('cc.s5'), field(t('cc.ren'), ren), h('div', { class: 'nt-btns' }, h('button', { class: 'btn primary', id: 'cc-copy', onclick: () => copyText(ccReport()).then(() => toast(t('cc.copied'))) }, icon('copy', 15), t('cc.copy')))));
      refreshSum();
      return h('div', { class: 'm-wrap' }, modalHead(t('cc.title'), m), body);
    }
  });
}
TOOL_ITEMS.push({ id: 'ctrlcheck', group: 'play', ic: 'bug', key: 'cc.btn', kw: 'renpy test check novel control lint report проверка контрольная новелла ренпай чек-лист отчёт', run: () => openCtrlCheck() });

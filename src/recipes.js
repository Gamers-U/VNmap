'use strict';
/* ====== Рецепты Ren'Py (1.6.8) ======
   Готовые заготовки для частых механик: шкала симпатии, характеристики героя, переписка в телефоне, инвентарь.
   Рецепт делает две вещи и больше ничего: заводит нужные переменные в реестре («Переменные») и добавляет в библиотеку «Сниппеты» куски кода
   с пустыми местами `{{…}}`. Главы он не трогает: куски вы вставляете сами кнопкой «Сниппет» в окне блока. Всё построено на уже готовом:
   переменные собираются в `default` при сборке, сниппеты лежат в проекте и ходят вместе с ним.
   Код рецептов написан по документации Ren'Py, но в настоящем Ren'Py ещё не проверялся: об этом сказано в окне.
   Сами рецепты (названия, описания, код) хранятся парами [по-русски, по-английски] здесь же, а не в i18n: проект получает текст на языке, на котором его добавили. */

Object.assign(D, {
  'rc.btn': ['Рецепты Ren\'Py…', 'Ren\'Py recipes…'],
  'rc.title': ['Рецепты Ren\'Py', 'Ren\'Py recipes'],
  'rc.intro': ['Готовые заготовки для частых механик. Рецепт заводит нужные переменные в реестре и добавляет в «Сниппеты» куски кода с пустыми местами: вставляйте их в скрипты глав кнопкой «Сниппет». Главы рецепт не меняет.', 'Ready-made pieces for common mechanics. A recipe adds the variables it needs to the registry and puts pieces of code with blanks into “Snippets”: insert them into chapter scripts with the “Snippet” button. A recipe does not change the chapters.'],
  'rc.warn': ['Рецепты написаны по документации Ren\'Py, но в настоящем Ren\'Py их ещё не проверяли. Соберите игру и проверьте то место, где используете рецепт.', 'The recipes follow the Ren\'Py documentation but have not been tested in real Ren\'Py yet. Build the game and check the place where you use a recipe.'],
  'rc.unv': ['в настоящем Ren\'Py не проверено', 'not tested in real Ren\'Py'],
  'rc.add': ['Добавить в проект', 'Add to the project'],
  'rc.again': ['Добавить ещё раз', 'Add again'],
  'rc.will': ['Добавится: переменные — {0}; сниппетов — {1}.', 'Will be added: variables — {0}; snippets — {1}.'],
  'rc.novars': ['нет', 'none'],
  'rc.code': ['Показать код', 'Show the code'],
  'rc.group': ['Рецепт: {0}', 'Recipe: {0}'],
  'rc.added': ['Рецепт «{0}»: добавлено переменных {1}, сниппетов {2}.', 'Recipe “{0}”: added {1} variables, {2} snippets.'],
  'rc.had': [' Уже было: {0}.', ' Already there: {0}.'],
  'rc.nothing': ['Рецепт «{0}»: всё это уже есть в проекте.', 'Recipe “{0}”: all of this is already in the project.'],
  'rc.open': ['Открыть сниппеты', 'Open snippets'],
  'rc.foot': ['Добавленные куски можно править и удалять в «Инструменты → Сниппеты», переменные: «Реестр → Переменные».', 'Added pieces can be edited and deleted in Tools → Snippets, the variables in Registry → Variables.'],
});

const RC_MAX = 6;
const rcL = pr => pr[S.lang === 'en' ? 1 : 0];
const rcId = (v, def) => { const s = String(v == null ? '' : v).trim(); return s ? slug(s) : def; };
const rcStr = (v, def) => { const s = String(v == null ? '' : v).replace(/["\\\n\r{}\[\]]/g, '').trim().slice(0, 30); return s || def; };
const rcFill = (str, p) => String(str).replace(/%(\w+)%/g, (all, k) => (p[k] != null ? p[k] : all));

/** Рецепты. params: поля окна; norm(raw) → значения; vars(p) / snips(p): что добавить. Тексты в код попадают на языке интерфейса в момент добавления. */
const RC = [
  { id: 'affection', ic: 'sparkles',
    name: ['Шкала симпатии', 'Affection meter'],
    desc: ['Число очков симпатии героя к одному персонажу: прибавляется и убавляется после выборов, от него зависят ветки и варианты ответа. Для второго персонажа добавьте рецепт ещё раз с другим ключом.', 'A score of how much one character likes the hero: it goes up and down after choices and decides branches and answer options. For a second character, add the recipe again with another key.'],
    params: [{ k: 'who', l: ['Ключ персонажа (латиницей)', 'Character key (Latin letters)'], def: 'anna' }, { k: 'max', l: ['Максимум шкалы', 'Scale maximum'], def: '10' }],
    norm: r => ({ who: rcId(r.who, 'anna'), max: String(Math.min(9999, Math.max(1, parseInt(r.max, 10) || 10))) }),
    tag: p => p.who,
    vars: p => [{ name: 'affection_' + p.who, value: '0', type: 'number', note: ['Симпатия персонажа «' + p.who + '» (рецепт «Шкала симпатии»), от 0 до ' + p.max, 'Affection of “' + p.who + '” (recipe “Affection meter”), 0 to ' + p.max] }],
    snips: p => [
      { n: ['Симпатия: прибавить', 'Affection: add'], note: ['Прибавляет очки, не больше максимума, и показывает всплывающую подсказку.', 'Adds points, never above the maximum, and shows a pop-up.'],
        c: ['$ affection_%who% = min(affection_%who% + {{очки=1}}, %max%)\n$ renpy.notify("{{подсказка=Симпатия выросла}}")', '$ affection_%who% = min(affection_%who% + {{points=1}}, %max%)\n$ renpy.notify("{{hint=Affection went up}}")'] },
      { n: ['Симпатия: убавить', 'Affection: subtract'], note: ['Убавляет очки, не меньше нуля.', 'Subtracts points, never below zero.'],
        c: ['$ affection_%who% = max(affection_%who% - {{очки=1}}, 0)\n$ renpy.notify("{{подсказка=Симпатия упала}}")', '$ affection_%who% = max(affection_%who% - {{points=1}}, 0)\n$ renpy.notify("{{hint=Affection went down}}")'] },
      { n: ['Симпатия: ветка по уровню', 'Affection: branch by level'], note: ['Две ветки: симпатии хватает или нет.', 'Two branches: enough affection or not.'],
        c: ['if affection_%who% >= {{порог=5}}:\n    "{{при высокой=Она улыбается тебе.}}"\nelse:\n    "{{при низкой=Она отводит взгляд.}}"', 'if affection_%who% >= {{threshold=5}}:\n    "{{high=She smiles at you.}}"\nelse:\n    "{{low=She looks away.}}"'] },
      { n: ['Симпатия: выбор открывается по уровню', 'Affection: choice unlocked by level'], note: ['Первый вариант виден только при достаточной симпатии.', 'The first option is shown only with enough affection.'],
        c: ['menu:\n    "{{вариант 1=Взять за руку}}" if affection_%who% >= {{порог=5}}:\n        jump {{метка 1}}\n    "{{вариант 2=Отвернуться}}":\n        jump {{метка 2}}', 'menu:\n    "{{option 1=Take her hand}}" if affection_%who% >= {{threshold=5}}:\n        jump {{label 1}}\n    "{{option 2=Turn away}}":\n        jump {{label 2}}'] },
      { n: ['Симпатия: назвать значение', 'Affection: tell the value'], note: ['Строка с текущим значением (для проверки).', 'A line with the current value (for testing).'],
        c: ['"Симпатия: [affection_%who%] из %max%."', '"Affection: [affection_%who%] of %max%."'] },
    ] },
  { id: 'stats', ic: 'chart',
    name: ['Характеристики героя', 'Hero stats'],
    desc: ['Несколько чисел героя (сила, обаяние, ум…): растут по ходу игры, их проверяют в сценах, в том числе с броском кубика.', 'A few numbers for the hero (strength, charm, intellect…): they grow during the game and are checked in scenes, including with a dice roll.'],
    params: [{ k: 'names', l: ['Характеристики через запятую (латиницей, до 6)', 'Stats separated by commas (Latin letters, up to 6)'], def: 'strength, charm, intellect' }],
    norm: r => { const seen = []; String(r.names || '').split(/[,;\n]+/).forEach(x => { const s = rcId(x, ''); if (s && !seen.includes(s) && seen.length < RC_MAX) seen.push(s); }); if (!seen.length) seen.push('strength', 'charm', 'intellect'); return { list: seen, first: seen[0] }; },
    tag: () => '',
    vars: p => p.list.map(s => ({ name: 'stat_' + s, value: '1', type: 'number', note: ['Характеристика героя «' + s + '» (рецепт «Характеристики героя»)', 'Hero stat “' + s + '” (recipe “Hero stats”)'] })),
    snips: p => [
      { n: ['Характеристика: прибавить', 'Stat: add'], note: ['Прибавляет очки выбранной характеристике.', 'Adds points to the chosen stat.'],
        c: ['$ stat_{{характеристика=%first%}} += {{на сколько=1}}\n$ renpy.notify("{{подсказка=Характеристика выросла}}")', '$ stat_{{stat=%first%}} += {{by how much=1}}\n$ renpy.notify("{{hint=The stat went up}}")'] },
      { n: ['Характеристика: проверка по порогу', 'Stat: check against a threshold'], note: ['Две ветки: характеристики хватает или нет.', 'Two branches: the stat is enough or not.'],
        c: ['if stat_{{характеристика=%first%}} >= {{порог=3}}:\n    "{{если хватает=Получилось.}}"\nelse:\n    "{{если не хватает=Не хватило сил.}}"', 'if stat_{{stat=%first%}} >= {{threshold=3}}:\n    "{{enough=It worked.}}"\nelse:\n    "{{not enough=Not enough strength.}}"'] },
      { n: ['Характеристика: проверка с кубиком', 'Stat: check with a dice roll'], note: ['К характеристике прибавляется бросок от 1 до 6.', 'A roll from 1 to 6 is added to the stat.'],
        c: ['$ roll = renpy.random.randint(1, 6)\nif stat_{{характеристика=%first%}} + roll >= {{порог=7}}:\n    "{{успех=Удача! (выпало [roll])}}"\nelse:\n    "{{провал=Не вышло. (выпало [roll])}}"', '$ roll = renpy.random.randint(1, 6)\nif stat_{{stat=%first%}} + roll >= {{threshold=7}}:\n    "{{success=Lucky! (rolled [roll])}}"\nelse:\n    "{{failure=It failed. (rolled [roll])}}"'] },
      { n: ['Характеристика: выбор открывается по уровню', 'Stat: choice unlocked by level'], note: ['Первый вариант виден только при достаточной характеристике.', 'The first option is shown only with a high enough stat.'],
        c: ['menu:\n    "{{вариант 1=Убедить словами}}" if stat_{{характеристика=%first%}} >= {{порог=3}}:\n        jump {{метка 1}}\n    "{{вариант 2=Уйти}}":\n        jump {{метка 2}}', 'menu:\n    "{{option 1=Persuade with words}}" if stat_{{stat=%first%}} >= {{threshold=3}}:\n        jump {{label 1}}\n    "{{option 2=Leave}}":\n        jump {{label 2}}'] },
      { n: ['Характеристики: назвать все', 'Stats: tell them all'], note: ['Строка со всеми значениями (для проверки).', 'A line with all the values (for testing).'],
        c: ['"' + 'LIST' + '."', '"' + 'LIST' + '."'], list: true },
    ] },
  { id: 'phone', ic: 'chat',
    name: ['Переписка в телефоне', 'Phone chat'],
    desc: ['Сообщения собеседника и героя в режиме NVL (текст идёт столбиком на весь экран), ответы с выбором. Свой вид «пузырей» требует экрана на Ren\'Py: в рецепт он не входит.', 'Messages of a friend and the hero in NVL mode (text goes in a column over the whole screen), answers with a choice. Your own “bubble” look needs a Ren\'Py screen, which is not part of the recipe.'],
    params: [{ k: 'me', l: ['Ваше имя в переписке', 'Your name in the chat'], def: ['Я', 'Me'] }, { k: 'other', l: ['Имя собеседника', 'The other person\'s name'], def: ['Анна', 'Anna'] }],
    norm: r => ({ me: rcStr(r.me, rcL(['Я', 'Me'])), other: rcStr(r.other, rcL(['Анна', 'Anna'])) }),
    tag: p => p.other,
    vars: () => [],
    snips: p => [
      { n: ['Переписка: начать', 'Chat: start'], note: ['Очищает экран и заводит двух «говорящих» в режиме NVL. Ставьте один раз перед перепиской.', 'Clears the screen and creates two NVL speakers. Put it once before the chat.'],
        c: ['nvl clear\n$ chat_me = Character("%me%", kind=nvl, color="#7fb7ff")\n$ chat_other = Character("%other%", kind=nvl, color="#ff9fc0")', 'nvl clear\n$ chat_me = Character("%me%", kind=nvl, color="#7fb7ff")\n$ chat_other = Character("%other%", kind=nvl, color="#ff9fc0")'] },
      { n: ['Переписка: сообщение собеседника', 'Chat: message from the friend'], note: ['', ''],
        c: ['chat_other "{{текст=Привет! Ты где?}}"', 'chat_other "{{text=Hi! Where are you?}}"'] },
      { n: ['Переписка: ваше сообщение', 'Chat: your message'], note: ['', ''],
        c: ['chat_me "{{текст=Уже иду.}}"', 'chat_me "{{text=On my way.}}"'] },
      { n: ['Переписка: ответ с выбором', 'Chat: answer with a choice'], note: ['Герой выбирает, что написать; собеседник отвечает.', 'The hero chooses what to write; the friend replies.'],
        c: ['menu:\n    "{{вариант 1=Скоро буду}}":\n        chat_me "{{вариант 1}}"\n        chat_other "{{ответ 1=Жду!}}"\n    "{{вариант 2=Задерживаюсь}}":\n        chat_me "{{вариант 2}}"\n        chat_other "{{ответ 2=Ладно, понимаю.}}"', 'menu:\n    "{{option 1=I will be there soon}}":\n        chat_me "{{option 1}}"\n        chat_other "{{reply 1=Waiting!}}"\n    "{{option 2=I am running late}}":\n        chat_me "{{option 2}}"\n        chat_other "{{reply 2=OK, I understand.}}"'] },
      { n: ['Переписка: закончить', 'Chat: finish'], note: ['Убирает переписку с экрана.', 'Removes the chat from the screen.'],
        c: ['nvl clear\nnvl hide', 'nvl clear\nnvl hide'] },
    ] },
  { id: 'inventory', ic: 'box',
    name: ['Инвентарь', 'Inventory'],
    desc: ['Список предметов героя: взять, отдать, проверить, открыть выбор, если предмет есть. Предмет это просто слово в списке.', 'A list of the hero\'s items: take, give away, check, open a choice if an item is there. An item is just a word in the list.'],
    params: [],
    norm: () => ({}),
    tag: () => '',
    vars: () => [{ name: 'inventory', value: '[]', type: 'raw', note: ['Предметы героя, список слов (рецепт «Инвентарь»)', 'The hero\'s items, a list of words (recipe “Inventory”)'] }],
    snips: () => [
      { n: ['Инвентарь: взять предмет', 'Inventory: take an item'], note: ['Кладёт предмет в список и показывает подсказку.', 'Puts the item into the list and shows a pop-up.'],
        c: ['$ inventory.append("{{предмет=ключ}}")\n$ renpy.notify("{{подсказка=Получено}}: {{предмет}}")', '$ inventory.append("{{item=key}}")\n$ renpy.notify("{{hint=Got}}: {{item}}")'] },
      { n: ['Инвентарь: отдать предмет', 'Inventory: give an item away'], note: ['Убирает предмет, если он есть.', 'Removes the item if it is there.'],
        c: ['if "{{предмет=ключ}}" in inventory:\n    $ inventory.remove("{{предмет}}")', 'if "{{item=key}}" in inventory:\n    $ inventory.remove("{{item}}")'] },
      { n: ['Инвентарь: проверка предмета', 'Inventory: check an item'], note: ['Две ветки: предмет есть или нет.', 'Two branches: the item is there or not.'],
        c: ['if "{{предмет=ключ}}" in inventory:\n    "{{если есть=Ключ подошёл.}}"\nelse:\n    "{{если нет=Нужен ключ.}}"', 'if "{{item=key}}" in inventory:\n    "{{if present=The key fits.}}"\nelse:\n    "{{if missing=A key is needed.}}"'] },
      { n: ['Инвентарь: выбор, если предмет есть', 'Inventory: choice if the item is there'], note: ['Первый вариант виден, только если предмет в списке.', 'The first option is shown only if the item is in the list.'],
        c: ['menu:\n    "{{вариант 1=Открыть дверь ключом}}" if "{{предмет=ключ}}" in inventory:\n        jump {{метка 1}}\n    "{{вариант 2=Уйти}}":\n        jump {{метка 2}}', 'menu:\n    "{{option 1=Open the door with the key}}" if "{{item=key}}" in inventory:\n        jump {{label 1}}\n    "{{option 2=Leave}}":\n        jump {{label 2}}'] },
      { n: ['Инвентарь: назвать предметы', 'Inventory: tell the items'], note: ['Строка со списком предметов (для проверки).', 'A line with the list of items (for testing).'],
        c: ['$ inventory_text = ", ".join(inventory) if inventory else "{{когда пусто=ничего нет}}"\n"{{подпись=В карманах}}: [inventory_text]."', '$ inventory_text = ", ".join(inventory) if inventory else "{{when empty=nothing}}"\n"{{caption=In the pockets}}: [inventory_text]."'] },
    ] },
];

/** Значения полей рецепта (как их ввёл автор) → очищенные значения. */
const rcNorm = (rc, raw) => rc.norm(raw || {});
/** Что рецепт добавит: { vars:[{name,value,type,notes}], snips:[{name,note,code,group}] } на языке интерфейса. */
function rcBuild(rc, raw) {
  const p = rcNorm(rc, raw), sfx = rc.tag(p) ? ' (' + rc.tag(p) + ')' : '', group = t('rc.group', rcL(rc.name));
  const vars = rc.vars(p).map(v => ({ name: v.name, value: v.value, type: v.type, notes: rcL(v.note) }));
  const snips = rc.snips(p).map(s => {
    let code = rcFill(rcL(s.c), Object.assign({}, p, { first: p.first }));
    if (s.list) code = code.replace('LIST', p.list.map(x => x + ': [stat_' + x + ']').join(', '));
    return { name: rcL(s.n) + sfx, note: rcL(s.note), code: spDedent(code), group };
  });
  return { vars, snips };
}
/** Добавляет рецепт в проект одним действием отмены. Возвращает { vars, snips, had } (сколько добавлено и что уже было). */
function rcApply(rc, raw) {
  const b = rcBuild(rc, raw), out = { vars: 0, snips: 0, had: [] };
  for (const v of b.vars) {
    if (varByName(v.name)) { out.had.push(v.name); continue; }
    P.vars.push({ id: uid('v'), name: v.name, value: v.value, notes: v.notes, type: v.type, values: [] }); out.vars++;
  }
  for (const s of b.snips) {
    if (spList().some(o => o.name.trim() === s.name.trim())) { out.had.push(s.name); continue; }
    if (spAdd(s)) out.snips++;
  }
  if (out.vars) commit(true);
  return out;
}

function openRecipes() {
  closePopover();
  openModal({
    cls: 'rc-m', build: m => {
      const cards = RC.map(rc => {
        const vals = {}; rc.params.forEach(pr => { vals[pr.k] = rcL(Array.isArray(pr.def) ? pr.def : [pr.def, pr.def]); });
        const will = h('div', { class: 'hint rc-will' }), codeBox = h('pre', { class: 'rc-code', hidden: 'hidden' });
        const inputs = rc.params.map(pr => {
          const inp = h('input', { class: 'inp', type: 'text', value: vals[pr.k], 'data-k': pr.k, spellcheck: 'false' });
          inp.addEventListener('input', () => { vals[pr.k] = inp.value; paintWill(); });
          return h('div', { class: 'field rc-f' }, h('label', { class: 'lbl' }, rcL(pr.l)), inp);
        });
        const paintWill = () => {
          const b = rcBuild(rc, vals);
          will.textContent = t('rc.will', b.vars.length ? b.vars.map(v => v.name).join(', ') : t('rc.novars'), b.snips.length);
          codeBox.textContent = b.snips.map(s => '# ' + s.name + '\n' + s.code).join('\n\n');
        };
        const addBtn = h('button', { class: 'btn primary rc-add', 'data-id': rc.id, onclick: () => {
          const r = rcApply(rc, vals);
          if (!r.vars && !r.snips) toast(t('rc.nothing', rcL(rc.name)), 4200);
          else toast(t('rc.added', rcL(rc.name), r.vars, r.snips) + (r.had.length ? t('rc.had', r.had.length) : ''), 5200);
          addBtn.replaceChildren(icon('check', 15), t('rc.again')); openBtn.hidden = false;
        } }, icon('plus', 15), t('rc.add'));
        const openBtn = h('button', { class: 'btn rc-open', hidden: 'hidden', onclick: () => { m.close(); openSnippets(); } }, icon('code', 15), t('rc.open'));
        const codeBtn = h('button', { class: 'btn sm rc-codebtn', onclick: () => { codeBox.hidden = !codeBox.hidden; } }, icon('code', 14), t('rc.code'));
        paintWill();
        return h('div', { class: 'rc-card', 'data-id': rc.id },
          h('div', { class: 'rc-head' }, icon(rc.ic, 18), h('b', { class: 'rc-name' }, rcL(rc.name)), h('span', { class: 'rc-unv' }, icon('alert', 12), t('rc.unv'))),
          h('div', { class: 'rc-desc' }, rcL(rc.desc)),
          inputs.length ? h('div', { class: 'rc-params' }, ...inputs) : null,
          will, h('div', { class: 'row-actions left' }, addBtn, openBtn, codeBtn), codeBox);
      });
      return h('div', { class: 'm-wrap' }, modalHead(t('rc.title'), m),
        h('div', { class: 'm-pad rc-body scroll' }, h('div', { class: 'bs-sph' }, t('rc.intro')), h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('rc.warn')), ...cards, h('div', { class: 'hint' }, t('rc.foot'))));
    }
  });
}
TOOL_ITEMS.push({ id: 'recipes', group: 'story', ic: 'flask', key: 'rc.btn', kw: 'recipes mechanics affection stats inventory phone chat messenger nvl relationship points items rpg dice рецепты механики шкала симпатии симпатия характеристики статы инвентарь предметы переписка телефон мессенджер очки отношения заготовки', run: () => openRecipes() });

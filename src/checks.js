'use strict';
/* ====== Проверка сюжета: окно с находками из anChecks() ======
   Находки считает analysis.js. Здесь тексты, окно, переход к месту на карте и «скрыть замечание»
   (скрытое хранится в проекте, P.ign, чтобы у всей команды оно было общим). */
Object.assign(D, {
  'sc.btn': ['Проверка сюжета…', 'Story check…'],
  'sc.title': ['Проверка сюжета', 'Story check'],
  'sc.ok': ['Ошибок не найдено. Всё сходится.', 'No problems found. Everything adds up.'],
  'sc.sum': ['Найдено: {0}', 'Found: {0}'],
  'sc.sev.all': ['Все', 'All'], 'sc.sev.err': ['Ошибки', 'Errors'], 'sc.sev.warn': ['Предупреждения', 'Warnings'], 'sc.sev.info': ['Замечания', 'Notes'],
  'sc.n.err': [['{0} ошибка', '{0} ошибки', '{0} ошибок'], ['{0} error', '{0} errors']],
  'sc.n.warn': [['{0} предупреждение', '{0} предупреждения', '{0} предупреждений'], ['{0} warning', '{0} warnings']],
  'sc.n.info': [['{0} замечание', '{0} замечания', '{0} замечаний'], ['{0} note', '{0} notes']],
  'sc.show': ['Показать на карте', 'Show on the map'], 'sc.script': ['Открыть скрипт', 'Open the script'], 'sc.hide': ['Скрыть это замечание', 'Hide this finding'],
  'sc.unhide': ['Вернуть', 'Restore'],
  'sc.hidden': ['Скрытые замечания: {0}', 'Hidden findings: {0}'],
  'sc.hidden.h': ['Вы решили, что это не ошибки. Они не считаются, пока их не вернуть.', 'You decided these are not problems. They are not counted until restored.'],
  'sc.foot': ['Проверка идёт по карте и скриптам и считается без ИИ. Если программа не может разобрать условие, она его пропускает, а не гадает.', 'The check works on the map and scripts, without AI. If a condition cannot be read, it is skipped rather than guessed.'],
  'sc.none.sev': ['В этой категории пусто.', 'Nothing in this category.'],
  'sc.nonodes': ['На карте пока нет блоков. Добавьте блоки, и проверка заработает.', 'There are no blocks on the map yet. Add some and the check will work.'],
  /* тексты находок */
  'an.c.nostart': ['Стартовый блок не указан, а блоков, с которых может начаться игра, {0}. Отметьте стартовый в окне блока.', 'No start block is set and there are {0} blocks the game could begin with. Mark one in the block window.'],
  'an.c.unreach': ['Блок «{0}» недостижим: к нему не ведёт ни один путь от начала игры', 'Block “{0}” is unreachable: no path from the start leads to it'],
  'an.c.endout': ['У концовки «{0}» есть стрелки дальше, хотя игра на ней должна заканчиваться', 'Ending “{0}” has outgoing arrows although the game should end there'],
  'an.c.deadend': ['Блок «{0}» ничем не продолжается: нет стрелок дальше и в скрипте нет return, jump или call', 'Block “{0}” leads nowhere: no outgoing arrows and no return, jump or call in the script'],
  'an.c.forkfew': ['Развилка «{0}» ведёт меньше чем в два разных блока, выбора у игрока нет', 'Fork “{0}” leads to fewer than two different blocks, so the player has no choice'],
  'an.c.flagdead': ['Флаг «{0}» задаётся, но нигде не проверяется', 'Flag “{0}” is set but never checked'],
  'an.c.flagnoset': ['«{0}» используется в условии, но нигде не объявлено и не задаётся. Возможно, опечатка в имени. Если это переменная из вашего Python-кода, скройте замечание', '“{0}” is used in a condition but is never declared or set. Possibly a typo. If it is a variable from your own Python code, hide the note'],
  'an.c.flagconst': ['Флаг «{0}» проверяется, но нигде не меняется: он всегда равен начальному значению', 'Flag “{0}” is checked but never changed: it always keeps its initial value'],
  'an.c.flagfar': ['Флаг «{0}» задаётся в «{1}», а проверяется в «{2}», но из первого во второй не дойти', 'Flag “{0}” is set in “{1}” and checked in “{2}”, but the second cannot be reached from the first'],
  'an.c.varunused': ['Переменная «{0}» есть в реестре, но нигде не используется', 'Variable “{0}” is in the registry but is not used anywhere'],
  'an.c.edgedead': ['Стрелка «{0}» → «{1}» никогда не сработает: условие {2}. {3}', 'The arrow “{0}” → “{1}” can never be taken: condition {2}. {3}'],
  'an.c.duplabel': ['Метка «{0}» объявлена и в «{1}», и в «{2}». Ren\'Py не соберёт такую игру', 'Label “{0}” is declared in both “{1}” and “{2}”. Ren\'Py will not build such a game'],
  'an.c.badjump': ['В блоке «{1}» переход на «{0}», но такой метки в проекте нет', 'Block “{1}” jumps to “{0}” but there is no such label in the project'],
  'an.c.nochar': ['Есть реплики от «{0}» ({1}), но такого персонажа нет во вкладке «Персонажи» и в скриптах он не объявлен', 'There are lines by “{0}” ({1}) but no such character is in the Characters tab or declared in the scripts'],
  'an.c.charidle': ['Персонаж «{0}» нигде не говорит и не занят ни в одном блоке', 'Character “{0}” never speaks and is not cast in any block'],
  'an.c.noasset': ['В скриптах используется {0} «{1}», но такого файла нет в ресурсах', 'The scripts use {0} “{1}” but there is no such file in the resources'],
  'an.c.emptydone': ['Глава «{1}» в блоке «{0}» отмечена как готовая, но её скрипт пуст', 'Chapter “{1}” in block “{0}” is marked as done but its script is empty'],
  /* заголовки групп и пояснения: зачем это важно */
  'sc.g.nostart': ['Старт игры', 'Game start'], 'sc.gh.nostart': ['Без стартового блока непонятно, откуда считать пути и время чтения.', 'Without a start block it is unclear where paths and reading time are counted from.'],
  'sc.g.unreach': ['Недостижимые блоки', 'Unreachable blocks'], 'sc.gh.unreach': ['Игрок никогда не увидит эти сцены. Либо не хватает стрелки, либо блок лишний. Бонусные блоки с замком не считаются.', 'The player will never see these scenes. Either an arrow is missing or the block is redundant. Locked bonus blocks are not counted.'],
  'sc.g.deadend': ['Тупики', 'Dead ends'], 'sc.gh.deadend': ['Игра дойдёт до этого блока и не будет знать, куда идти дальше.', 'The game reaches this block and does not know where to go next.'],
  'sc.g.endout': ['Концовки со стрелками', 'Endings with arrows'], 'sc.gh.endout': ['Обычно после концовки продолжения нет. Если так задумано, скройте замечание.', 'Normally nothing follows an ending. If this is intended, hide the note.'],
  'sc.g.forkfew': ['Развилки без выбора', 'Forks without a choice'], 'sc.gh.forkfew': ['У развилки должно быть хотя бы два разных продолжения.', 'A fork needs at least two different continuations.'],
  'sc.g.flagnoset': ['Неизвестные имена в условиях', 'Unknown names in conditions'], 'sc.gh.flagnoset': ['Такого флага нет ни в реестре, ни в присвоениях. В игре условие упадёт с ошибкой. Часто это опечатка: сравните с именами во вкладке «Флаги».', 'There is no such flag in the registry or in the assignments. In the game the condition fails with an error. Often a typo: compare with the names in the Flags tab.'],
  'sc.g.flagdead': ['Флаги, которые задают, но не проверяют', 'Flags that are set but never checked'], 'sc.gh.flagdead': ['Выбор запоминается, но ни на что не влияет. Возможно, забыли условие.', 'The choice is remembered but affects nothing. Perhaps a condition is missing.'],
  'sc.g.flagconst': ['Флаги, которые никогда не меняются', 'Flags that never change'], 'sc.gh.flagconst': ['Условие всегда даёт один и тот же результат.', 'The condition always gives the same result.'],
  'sc.g.flagfar': ['Флаг не успевает измениться', 'The flag cannot change in time'], 'sc.gh.flagfar': ['Флаг задаётся в блоке, из которого нельзя попасть в блок, где он проверяется.', 'The flag is set in a block from which the block that checks it cannot be reached.'],
  'sc.g.varunused': ['Неиспользуемые переменные', 'Unused variables'], 'sc.gh.varunused': ['Лишние записи в реестре можно удалить.', 'Extra registry entries can be deleted.'],
  'sc.g.edgedead': ['Условия, которые не выполнятся', 'Conditions that never hold'], 'sc.gh.edgedead': ['Программа посчитала возможные значения переменных на подходе к стрелке, и условие не может быть истинным.', 'The program worked out the possible variable values on the way to the arrow and the condition cannot be true.'],
  'sc.g.duplabel': ['Повторяющиеся метки', 'Duplicate labels'], 'sc.gh.duplabel': ['Ren\'Py не допускает две метки с одним именем. Переименуйте одну (Инструменты → Переименовать везде).', 'Ren\'Py does not allow two labels with the same name. Rename one (Tools → Rename everywhere).'],
  'sc.g.badjump': ['Переходы в никуда', 'Jumps to nowhere'], 'sc.gh.badjump': ['В игре будет ошибка на этом переходе. Проверьте написание метки.', 'The game will fail at this jump. Check the label spelling.'],
  'sc.g.nochar': ['Неизвестные говорящие', 'Unknown speakers'], 'sc.gh.nochar': ['Добавьте персонажа во вкладке «Персонажи» или исправьте метку перед репликой.', 'Add the character in the Characters tab or fix the tag before the line.'],
  'sc.g.charidle': ['Персонажи без реплик', 'Characters without lines'], 'sc.gh.charidle': ['Возможно, персонаж пока не нужен или ещё не написан.', 'Perhaps the character is not needed yet or not written yet.'],
  'sc.g.noasset': ['Ресурсы, которых нет', 'Missing resources'], 'sc.gh.noasset': ['В готовой игре на этом месте будет цветная заглушка. Добавьте файл во вкладке «Ресурсы».', 'The built game shows a colored placeholder here. Add the file in the Resources tab.'],
  'sc.g.emptydone': ['Готовые главы без текста', 'Finished chapters without text'], 'sc.gh.emptydone': ['Статус «готово», а скрипта нет. Статус или текст нужно поправить.', 'The status says done but there is no script. Fix the status or the text.'],
});

const SC_ORDER = ['nostart', 'flagnoset', 'duplabel', 'badjump', 'unreach', 'deadend', 'forkfew', 'edgedead', 'flagfar', 'emptydone', 'nochar', 'endout', 'flagdead', 'flagconst', 'noasset', 'charidle', 'varunused'];
/** id скрытого замечания: из ключа и автора. Один человек на двух устройствах получает одну запись, двое разных людей две, и после слияния лишняя убирается при нормализации. */
const ignId = (key, by) => { const s = String(key) + '\u0001' + String(by || ''); return 'x_' + hashStr(s).toString(36) + hashStr(s.split('').reverse().join('')).toString(36); };
let SC_ST = { sev: 'all', hidden: false };

function scHide(f) { if (P.ign.some(x => x.key === f.key)) return; P.ign.push({ id: ignId(f.key, S.author), key: f.key, by: S.author || '' }); commit(true); }
function scRestore(key) { P.ign = P.ign.filter(x => x.key !== key); commit(true); }

function openStoryChecks(opts) {
  opts = opts || {}; closePopover();
  let sev = opts.sev || SC_ST.sev;
  openModal({
    cls: 'sc-m', onClose: () => { SC_ST.sev = sev; }, build: m => {
      const top = h('div', { class: 'sc-top' }), body = h('div', { class: 'sc-body scroll' }), foot = h('div', { class: 'sc-foot' });
      let all = [];
      const paint = () => {
        all = anChecks();
        const ign = new Set(P.ign.map(x => x.key)), live = all.filter(f => !ign.has(f.key)), hid = all.filter(f => ign.has(f.key));
        const cnt = { err: 0, warn: 0, info: 0 }; live.forEach(f => cnt[f.sev]++);
        /* верх: итог и вкладки */
        const parts = ['err', 'warn', 'info'].filter(k => cnt[k]).map(k => t('sc.n.' + k, cnt[k]));
        top.replaceChildren(
          !P.nodes.some(n => n.type !== 'note') ? h('div', { class: 'sc-ok' }, icon('info', 17), t('sc.nonodes'))
            : live.length ? h('div', { class: 'sc-sum' }, t('sc.sum', parts.join(' · ')))
              : h('div', { class: 'sc-ok' }, icon('check', 17, 2.4), t('sc.ok')),
          h('div', { class: 'pal-chips' }, ...[['all', live.length], ['err', cnt.err], ['warn', cnt.warn], ['info', cnt.info]].map(([k, c]) =>
            h('button', { class: 'pal-chip' + (sev === k ? ' on' : ''), onclick: () => { sev = k; paint(); } }, t('sc.sev.' + k), h('span', { class: 'cnt' }, ' ' + c)))));
        /* список по группам */
        body.replaceChildren();
        const shown = live.filter(f => sev === 'all' || f.sev === sev);
        if (live.length && !shown.length) body.append(h('div', { class: 'empty' }, t('sc.none.sev')));
        const byCode = new Map(); shown.forEach(f => { if (!byCode.has(f.code)) byCode.set(f.code, []); byCode.get(f.code).push(f); });
        const rank = code => { const l = byCode.get(code); return l.some(f => f.sev === 'err') ? 0 : l.some(f => f.sev === 'warn') ? 1 : 2; };
        const codes = [...byCode.keys()].sort((a, b) => rank(a) - rank(b) || SC_ORDER.indexOf(a) - SC_ORDER.indexOf(b));
        for (const code of codes) {
          const list = byCode.get(code), worst = list.some(f => f.sev === 'err') ? 'err' : list.some(f => f.sev === 'warn') ? 'warn' : 'info';
          body.append(h('div', { class: 'sc-g' },
            h('div', { class: 'sc-gh' }, h('i', { class: 'sc-dot s-' + worst }), h('span', { class: 'sc-gt' }, t('sc.g.' + code)), h('span', { class: 'sc-gc' }, String(list.length))),
            h('div', { class: 'sc-gd' }, t('sc.gh.' + code)),
            ...list.map(f => scRow(f, false))));
        }
        /* скрытые */
        foot.replaceChildren();
        if (hid.length) {
          foot.append(h('button', { class: 'sc-hid', onclick: () => { SC_ST.hidden = !SC_ST.hidden; paint(); } }, icon(SC_ST.hidden ? 'up' : 'down', 14), t('sc.hidden', hid.length)));
          if (SC_ST.hidden) { body.append(h('div', { class: 'sc-g sc-hg' }, h('div', { class: 'sc-gd' }, t('sc.hidden.h')), ...hid.map(f => scRow(f, true)))); }
        }
        foot.append(h('div', { class: 'sc-note' }, t('sc.foot')));
      };
      const scRow = (f, hidden) => {
        const acts = h('div', { class: 'sc-act' });
        if (f.nodeId) acts.append(h('button', { class: 'btn icon sm', 'data-tip': t('sc.show'), onclick: () => { m.close(); focusNode(f.nodeId); } }, icon('target', 15)));
        if (f.nodeId && f.fileId) acts.append(h('button', { class: 'btn icon sm', 'data-tip': t('sc.script'), onclick: () => { m.close(); NM_TAB = 'script'; openNodeModal(f.nodeId, f.fileId); } }, icon('code', 15)));
        acts.append(hidden
          ? h('button', { class: 'btn sm', onclick: () => { scRestore(f.key); paint(); } }, t('sc.unhide'))
          : h('button', { class: 'btn icon sm', 'data-tip': t('sc.hide'), onclick: () => { scHide(f); paint(); } }, icon('eye', 15)));
        return h('div', { class: 'sc-r' }, h('i', { class: 'sc-dot s-' + f.sev }), h('div', { class: 'sc-t' }, f.text), acts);
      };
      paint();
      return h('div', { class: 'm-wrap sc-wrap' }, modalHead(t('sc.title'), m), h('div', { class: 'm-pad' }, top), body, foot);
    }
  });
}
TOOL_ITEMS.push({ id: 'checks', group: 'story', ic: 'check', key: 'sc.btn', kw: 'check errors problems dead end unreachable flags проверка ошибки тупики недостижимые флаги метки переходы', run: () => openStoryChecks() });

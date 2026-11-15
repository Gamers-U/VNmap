'use strict';
/* ====== Готовые части Ren'Py: галерея CG, музыкальная комната, достижения ======
   Компилятор (compiler.js → cmpExtras) пишет отдельные файлы game/gallery.rpy и т.п. Игрок открывает экран кнопкой,
   которую автор один раз добавляет в screen navigation. Здесь — подписи и карточка с готовыми строками в окне «Сборка». */

Object.assign(D, {
  'as.cg': ['Это CG: показывать в галерее', 'This is CG art: show it in the gallery'],
  'as.cg.h': ['Картинка попадёт в экран «Галерея»: в игре откроется после того, как игрок хотя бы раз её увидит.', 'The picture goes into the Gallery screen: in the game it opens once the player has seen it at least once.'],
  'cmp.f.gallery': ['Галерея CG', 'CG gallery'],
  'cmp.cg.hint': ['Картинки, отмеченные как CG в реестре. Открываются в галерее, когда игрок хоть раз увидел их в игре. Открыть экран: ShowMenu("cg_gallery").', 'Pictures marked as CG in the registry. They open in the gallery once the player has seen them in the game. Open the screen with ShowMenu("cg_gallery").'],
  'cmp.cg.title': ['Галерея', 'Gallery'], 'cmp.extras.back': ['Назад', 'Back'],
  'cmp.cg.nofile': ['CG «{0}» без файла и без заглушек: в галерею не попадёт.', 'CG "{0}" has no file and placeholders are off: it will not be in the gallery.'],
  'cmp.cg.ph': ['CG «{0}» без файла: в галерее будет заглушка.', 'CG "{0}" has no file: the gallery will show a placeholder.'],
  'gd.n.gallery': ['галерея CG (экран cg_gallery)', 'CG gallery (the cg_gallery screen)'],
  'bld.opt.extras': ['Делать готовые экраны: галерею CG, музыкальную комнату, достижения', 'Make ready-made screens: CG gallery, music room, achievements'],
  'bld.opt.extras.h': ['Файлы gallery.rpy, musicroom.rpy, achievements.rpy появятся, только если в проекте есть что в них показать.', 'The files gallery.rpy, musicroom.rpy and achievements.rpy appear only if the project has something to show in them.'],
  'bld.extras.h': ['Кнопки в меню игры', 'Buttons for the game menu'],
  'bld.extras.p': ['Готовые экраны открываются кнопками. Один раз вставьте эти строки в screen navigation (файл game/screens.rpy), рядом с кнопкой «Настройки» (с тем же отступом):', 'The ready-made screens are opened by buttons. Paste these lines once into screen navigation (game/screens.rpy), next to the Preferences button (same indentation):'],
  /* музыкальная комната */
  'as.room': ['Показывать в музыкальной комнате', 'Show in the music room'],
  'as.room.h': ['Трек откроется в комнате после того, как игрок хоть раз услышит его в игре. Нужен загруженный файл.', 'The track opens in the room once the player has heard it in the game. Needs an uploaded file.'],
  'cmp.f.musicroom': ['Музыкальная комната', 'Music room'],
  'cmp.mr.hint': ['Музыка из реестра (вид «Музыка»). Трек открывается, когда игрок хоть раз услышал его в игре. Открыть экран: ShowMenu("music_room").', 'Music from the registry (kind "Music"). A track opens once the player has heard it in the game. Open the screen with ShowMenu("music_room").'],
  'cmp.mr.title': ['Музыкальная комната', 'Music room'],
  'cmp.mr.nofile': ['Трек «{0}» без файла: в музыкальную комнату не попадёт.', 'Track "{0}" has no file: it will not be in the music room.'],
  'gd.n.music': ['музыкальная комната (экран music_room)', 'music room (the music_room screen)'],
  /* достижения */
  'reg.tab.ach': ['Достижения', 'Achievements'],
  'reg.hint.ach': ['Награды за концовки, главы и прохождение: экран, всплывающее окно и Steam', 'Rewards for endings, chapters and progress: a screen, a popup and Steam'],
  'reg.empty.ach': ['Достижений пока нет. Нажмите «Добавить»: выберите, за что оно выдаётся, — остальное соберёт сборка.', 'No achievements yet. Press "Add" and choose what it is given for: the build does the rest.'],
  'ach.new': ['Новое достижение', 'New achievement'],
  'ach.f.title': ['Название', 'Title'], 'ach.f.desc': ['Описание', 'Description'],
  'ach.f.icon': ['Значок', 'Icon'], 'ach.f.icon.ph': ['★', '★'],
  'ach.f.key': ['ID (для Steam)', 'ID (for Steam)'], 'ach.f.key.h': ['Латиница, цифры и «_». Пусто — возьмётся из названия. В Steamworks создайте достижение с таким же ID.', 'Latin letters, digits and "_". Empty: taken from the title. In Steamworks create an achievement with the same ID.'],
  'ach.f.trig': ['Когда выдавать', 'When to give it'],
  'ach.trig.ending': ['Игрок дошёл до концовки', 'The player reaches an ending'],
  'ach.trig.block': ['Игрок дошёл до блока', 'The player reaches a block'],
  'ach.trig.endings_all': ['Открыты все концовки', 'All endings are unlocked'],
  'ach.trig.cg_all': ['Открыты все CG', 'All CG are unlocked'],
  'ach.trig.manual': ['Вручную из скрипта', 'By hand from the script'],
  'ach.f.ref.ending': ['Какая концовка', 'Which ending'], 'ach.f.ref.block': ['Какой блок', 'Which block'], 'ach.ref.none': ['— выберите —', '— choose —'],
  'ach.hidden': ['Скрытое', 'Hidden'], 'ach.hidden.h': ['Пока не получено, в списке видно только «???».', 'Until it is earned, the list shows only "???".'],
  'ach.manual.h': ['Вставьте эту строку в скрипт там, где достижение должно выдаваться:', 'Paste this line into the script where the achievement should be given:'],
  'ach.copy': ['Скопировать', 'Copy'], 'ach.copied': ['Строка скопирована', 'Line copied'],
  'ach.auto.h': ['Выдаётся само: сборка добавит строку в нужное место.', 'Given automatically: the build adds the line in the right place.'],
  'ach.prev.hidden': ['Скрытое достижение', 'Hidden achievement'],
  'cmp.f.ach': ['Достижения', 'Achievements'],
  'cmp.ach.hint': ['Достижения из реестра. Выдаются строкой vn_grant("id"): сборка сама ставит её в блоки и концовки. Экран: ShowMenu("achievements"). В Steam достижения передаются, если подключён модуль achievement.', 'Achievements from the registry. They are given by the vn_grant("id") line: the build puts it into blocks and endings itself. The screen: ShowMenu("achievements"). They are passed to Steam when the achievement module is connected.'],
  'cmp.ach.title': ['Достижения', 'Achievements'], 'cmp.ach.got': ['Достижение получено', 'Achievement unlocked'], 'cmp.ach.hiddenname': ['Скрытое достижение', 'Hidden achievement'],
  'cmp.ach.notitle': ['Достижение без названия пропущено.', 'An achievement without a title was skipped.'],
  'cmp.ach.noref': ['Достижение «{0}»: не выбрано, за какой блок или концовку оно выдаётся. Само не сработает.', 'Achievement "{0}": no block or ending is chosen. It will not be given by itself.'],
  'cmp.ach.noending': ['Достижение «{0}»: в проекте нет концовок. Само не сработает.', 'Achievement "{0}": the project has no endings. It will not be given by itself.'],
  'cmp.ach.nocg': ['Достижение «{0}»: в проекте нет CG (отметьте фон как CG в реестре). Само не сработает.', 'Achievement "{0}": the project has no CG (mark a background as CG in the registry). It will not be given by itself.'],
  'cmp.ach.unknown': ['В скрипте выдаётся достижение «{0}», которого нет в реестре.', 'The script gives an achievement "{0}" that is not in the registry.'],
  'cmp.ach.off': ['Достижения есть, но «Готовые экраны» выключены в сборке: достижений в игре не будет.', 'There are achievements, but "Ready-made screens" is off in the build: the game will have no achievements.'],
  'gd.n.ach': ['достижения (экран achievements, всплывающее окно)', 'achievements (the achievements screen and popup)'],
  'pl.ach.got': ['Достижение: {0}', 'Achievement: {0}'],
  'bld.extras.copy': ['Скопировать строки', 'Copy the lines'], 'bld.extras.copied': ['Строки скопированы', 'Lines copied'],
});

/* ---------- достижения ---------- */
/** ID каждого достижения: свой (если задан) или из названия; повторы получают «_2», «_3». Map: id достижения → ключ. */
function achKeys(list) {
  list = list || P.achs || [];
  const out = new Map(), used = new Set();
  const take = base => { let k = base, n = 2; while (used.has(k.toLowerCase())) k = base + '_' + n++; used.add(k.toLowerCase()); return k; };
  for (const a of list) if (a.key) out.set(a.id, take(a.key));
  for (const a of list) if (!a.key) out.set(a.id, take('ach_' + slug(a.title)));
  return out;
}
/** Текст для Ren'Py text: скобки [ и { иначе станут подстановкой и тегом */
const achTxt = s => String(s == null ? '' : s).replace(/\[/g, '[[').replace(/\{/g, '{{').replace(/\s*\n\s*/g, ' ').trim();
function createAch() {
  const a = { id: uid('g'), title: t('ach.new'), desc: '', icon: '★', hidden: false, key: '', trig: 'manual', ref: '' };
  P.achs.push(a); commit(true); return a;
}
function achNodeOptions(trig) {
  return P.nodes.filter(n => (trig === 'ending' ? n.type === 'ending' : n.type !== 'note'));
}
function regAchs(st, list, qq) {
  const keys = achKeys();
  const items = P.achs.filter(a => !qq || (a.title + ' ' + a.desc + ' ' + keys.get(a.id)).toLowerCase().includes(qq));
  if (!items.length) list.append(h('div', { class: 'empty' }, t('reg.empty.ach')));
  items.forEach(a => {
    const key = keys.get(a.id);
    const body = [];
    const ic = bindInput(a, 'icon', { ph: t('ach.f.icon.ph'), onChange: () => commit() }); ic.maxLength = 4; ic.classList.add('ach-ic');
    body.push(h('div', { class: 'grid3 ach-top' },
      field(t('ach.f.icon'), ic),
      field(t('ach.f.title'), bindInput(a, 'title', { onChange: () => { commit(); } })),
      field(t('ach.f.key'), bindInput(a, 'key', { mono: true, ph: key, onChange: () => commit() }), t('ach.f.key.h'))));
    body.push(field(t('ach.f.desc'), bindInput(a, 'desc', { onChange: () => commit() })));
    const trSel = h('select', { class: 'inp' }, ACH_TRIGS.map(x => h('option', { value: x }, t('ach.trig.' + x))));
    trSel.value = a.trig;
    trSel.addEventListener('change', () => { a.trig = trSel.value; a.ref = ''; commit(true); renderReg(); });
    const row = [field(t('ach.f.trig'), trSel)];
    if (a.trig === 'ending' || a.trig === 'block') {
      const rf = h('select', { class: 'inp' }, h('option', { value: '' }, t('ach.ref.none')), achNodeOptions(a.trig).map(n => h('option', { value: n.id }, n.title)));
      rf.value = a.ref;
      rf.addEventListener('change', () => { a.ref = rf.value; commit(true); });
      row.push(field(t('ach.f.ref.' + a.trig), rf));
    }
    body.push(h('div', { class: 'grid2' }, row));
    body.push(h('div', { class: 'opt-row' }, switchEl(!!a.hidden, v => { a.hidden = !!v; commit(true); }), h('div', { class: 'opt-t' }, h('div', {}, t('ach.hidden')), h('div', { class: 'hint' }, t('ach.hidden.h')))));
    if (a.trig === 'manual') {
      const line = '$ vn_grant(' + JSON.stringify(key) + ')';
      body.push(h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('ach.manual.h')),
        h('div', { class: 'ach-code' }, h('code', {}, line), h('button', { class: 'btn sm', onclick: () => copyText(line).then(() => toast(t('ach.copied'))) }, icon('copy', 14), t('ach.copy')))));
    } else body.push(h('div', { class: 'hint' }, t('ach.auto.h')));
    list.append(regCard(a.id, body, {
      lead: h('div', { class: 'reg-ic' }, icon('trophy', 18)),
      onDelete: async () => {
        if (!(await confirmDlg({ title: t('reg.del.q', a.title || t('ach.new')), ok: t('c.delete'), danger: true }))) return;
        P.achs = P.achs.filter(x => x.id !== a.id); commit(true); renderReg();
      }
    }));
  });
}

/** Строки для screen navigation: по одной кнопке на каждый сделанный экран */
function extrasLines(R) {
  return (R.extras || []).map(x => `textbutton _(${JSON.stringify(x.label)}) action ShowMenu(${JSON.stringify(x.screen)})`);
}
function bldExtrasCard(R) {
  const lines = extrasLines(R);
  if (!lines.length) return null;
  return h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('layers', 16), h('b', t('bld.extras.h'))),
    h('p', { class: 'gd-p' }, t('bld.extras.p')),
    h('pre', { class: 'codepre' }, lines.join('\n')),
    h('div', { class: 'row-actions left', style: { marginTop: '10px' } }, h('button', { class: 'btn sm', onclick: () => copyText(lines.join('\n')).then(() => toast(t('bld.extras.copied'))) }, icon('copy', 14), t('bld.extras.copy'))));
}

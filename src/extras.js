'use strict';
/* ====== Готовые части Ren'Py: галерея CG (и дальше — музыкальная комната, достижения) ======
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
  'bld.opt.extras': ['Делать готовые экраны: галерею CG и др.', 'Make ready-made screens: CG gallery and more'],
  'bld.opt.extras.h': ['Файлы gallery.rpy и др. появятся, только если в проекте есть что в них показать.', 'Files like gallery.rpy appear only if the project has something to show in them.'],
  'bld.extras.h': ['Кнопки в меню игры', 'Buttons for the game menu'],
  'bld.extras.p': ['Готовые экраны открываются кнопками. Один раз вставьте эти строки в screen navigation (файл game/screens.rpy), рядом с кнопкой «Настройки» (с тем же отступом):', 'The ready-made screens are opened by buttons. Paste these lines once into screen navigation (game/screens.rpy), next to the Preferences button (same indentation):'],
  'bld.extras.copy': ['Скопировать строки', 'Copy the lines'], 'bld.extras.copied': ['Строки скопированы', 'Lines copied'],
});

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

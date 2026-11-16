'use strict';
/* ====== Единые показатели проекта: слова, время чтения, концовки ======
   Раньше слова считались по-разному: «Статистика» брала весь текст глав вместе с командами Ren'Py,
   «Ветки и время» только то, что прочтёт игрок, реестр снова весь текст. Из-за этого время чтения в разных окнах не совпадало.
   Теперь все окна берут цифры отсюда. Правило одно: слова — это то, что увидит игрок (реплики, подписи, пункты выбора);
   команды, метки и код в счёт не идут. Отдельно считаются «слова кода» — для тех, кому нужен размер сценария.
   Расчёт глав кэшируется в analysis.js (fileWords), сюда добавляется только сложение. */

Object.assign(D, {
  'mx.note': ['Слова — только то, что увидит игрок: реплики, подписи и пункты выбора. Команды Ren\'Py не считаются.',
    'Words are only what the player will see: lines, captions and menu choices. Ren\'Py commands are not counted.'],
  'mx.w': ['слов для игрока', 'words for the player'],
  'mx.ends.got': ['концовок отмечено', 'endings marked'],
  'mx.ends.reach': ['концовок достижимо по карте', 'endings reachable on the map'],
  'mx.line': ['{0} · {1} · {2} слов · читается {3} · готово {4}%', '{0} · {1} · {2} words · reads in {3} · {4}% done'],
  'mx.more': ['Все показатели', 'All figures'],
  'mx.ends.un': ['Недостижимы по карте: {0} из {1}. Проверьте стрелки к этим концовкам.', 'Unreachable on the map: {0} of {1}. Check the arrows leading to these endings.'],
});

/** Слова для игрока во всём проекте (без заметок). Единственное место, где считается общий итог. */
function mxWords() {
  let w = 0;
  for (const n of P.nodes) if (n.type !== 'note') w += nodeWords(n);
  return w;
}
/** Размер сценариев «как есть», с командами Ren'Py: для сведений о размере, не для времени чтения. */
function mxCodeWords() {
  let w = 0;
  for (const { node, file } of allFiles()) if (node.type !== 'note') w += wordCount(file.script);
  return w;
}
/** Время чтения для числа слов при выбранной скорости. */
function mxRead(words) {
  const wpm = rdWpm();
  return { wpm, min: words / wpm, text: fmtDur(words) };
}
/** Концовки: сколько всего, сколько отметили вручную («тест открытия»), сколько достижимо по карте. */
function mxEndings() {
  const ends = P.nodes.filter(n => n.type === 'ending');
  let reach = null;
  try { reach = anPaths().reached; } catch (e) { reach = null; }
  const list = ends.map(n => ({ n, got: !!P.sim.reached[n.id], reachable: reach ? reach.has(n.id) : true, unlock: unlockState(n) }));
  return { total: list.length, got: list.filter(x => x.got).length, reachable: list.filter(x => x.reachable).length, list };
}
/** Всё сразу: то, что показывают «Статистика», сводка и строка в других окнах. */
function mxProject() {
  const st = projectStats(), words = st.words, rd = mxRead(words), en = mxEndings();
  return { nodes: st.nodes, files: st.files, edges: st.edges, by: st.by, pct: st.pct, words, codeWords: mxCodeWords(), read: rd, endings: en };
}
/** Короткая строка «N блоков · M слов · читается K» для окон, которые не должны считать сами. */
function mxLine() {
  const X = mxProject();
  return t('mx.line', t('status.blocks', X.nodes), t('status.files', X.files), fmtNum(X.words), X.read.text, Math.round(X.pct * 100));
}

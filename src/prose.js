'use strict';
/* ====== Рукопись главы: правила текста и превращение в сценарий ======
   У каждого файла главы может быть «рукопись» (f.text): обычный текст, как в Google Docs. Конвертер диалогов превращает её в сценарий Ren'Py.
   Правила рукописи:
     — Привет, — сказал он.   |   «Привет», — сказал он.   |   Алиса: Привет.   → реплика говорящего (по персонажам проекта)
     Обычная строка                                                        → слова рассказчика
     *курсив*  **жирный**                                                  → {i}…{/i}  {b}…{/b}
     @ scene bg room                                                       → команда Ren'Py как есть (можно несколько строк подряд, отступы сохраняются)
     // заметка автору                                                     → в сценарий не попадает и в слова не считается
     % Название                                                            → название документа (стиль «Название»): в сценарий и слова не попадает
     ==выделено==  =={green}цветом==                                       → подсветка маркером: пометка автора, в сценарий не попадает
     ## Название сцены                                                     → комментарий «# Название сцены» в сценарии
   Сценарий либо создаётся кнопкой «Применить» (заменить или дописать), либо держится в синхроне с текстом (f.textLive):
   тогда в f.textOut лежит отпечаток последнего созданного сценария, и если сценарий кто-то изменил в обход текста, программа не затирает его молча. */

Object.assign(D, {
  'pr.opt.alt': ['Угадывать говорящего по очереди, если он не назван', 'Guess the speaker by turns when not named'],
  'pr.opt.split': ['Делить длинные реплики на предложения', 'Split long lines into sentences'],
  'pr.opt.attr': ['Оставлять ремарки автора («— сказал он») как слова рассказчика', 'Keep author tags ("— he said") as narration'],
  'pr.words': ['{0} слов', '{0} words'],
});

/** Выделение цветом (как маркер): `==текст==` жёлтым или `=={green}текст==` другим цветом. Это пометка автора: в сценарий и счётчик слов не попадает. */
const PR_HL = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple', 'red', 'gray'];
const PR_HL_RE = /==(?:\{([a-z]+)\})?(?=[^\s=])([^\n]*?[^\s=])==/g;
const prHlColor = c => PR_HL.includes(c) ? c : 'yellow';
const prStripHl = s => String(s).replace(/\{\/?hl(?:=[a-z]+)?\}/g, '');
const PR_DEFAULTS = { detect: true, alternate: true, keepAttr: false, split: false };
/** Параметры конвертации: общие настройки автора + правила рукописи (команды, заметки, разметка). */
function prOpts() { return Object.assign({}, PR_DEFAULTS, (typeof S === 'object' && S.prose) || {}, { cmds: true, md: true }); }
/** **жирный** и *курсив* → теги Ren'Py. Звёздочки внутри слов и умножение («2 * 3») не трогаем. */
function prMd(text) {
  return String(text)
    .replace(PR_HL_RE, (m, c, x) => '{hl=' + prHlColor(c) + '}' + x + '{/hl}')
    .replace(/\*\*(?=[^\s*])([^*\n]+?)(?<=[^\s*])\*\*/g, '{b}$1{/b}')
    .replace(/(?<!\*)\*(?=[^\s*])([^*\n]+?)(?<=[^\s*])\*(?!\*)/g, '{i}$1{/i}');
}
/** Слова только из того, что читает игрок: без заметок автору, команд и заголовков сцен. */
function prWords(text) {
  let n = 0;
  for (const raw of String(text || '').split('\n')) {
    const l = raw.trim();
    if (!l || /^(\/\/|@|#|%\s)/.test(l)) continue;
    const m = l.replace(PR_HL_RE, '$2').replace(/\{\/?[a-z]+(?:=[^{}]*)?\}/gi, '').replace(/[*_]/g, '').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
    n += m ? m.length : 0;
  }
  return n;
}
/** Короткий отпечаток текста (FNV-1a): чтобы понять, менялся ли сценарий после создания. */
function prHash(s) {
  let h = 0x811c9dc5; s = String(s || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0') + ':' + s.length;
}
const prCast = (n, f) => effectiveCast(n, f).all.map(charById).filter(Boolean);
/** Сценарий из рукописи, ничего не меняя в проекте. */
function prBuild(n, f, text) {
  const src = text != null ? text : f.text;
  const rows = convertText(src, prCast(n, f), prOpts());
  const say = rows.filter(r => r.cmd === undefined);
  const clean = rows.map(r => r.text === undefined ? r : Object.assign({}, r, { text: prStripHl(r.text) }));
  return { rows, code: rowsToRenpy(clean), unknown: say.filter(r => r.sp === '?').length, lines: say.length, cmds: rows.length - say.length, words: prWords(src) };
}
/** Сценарий главы создан из текста и с тех пор не менялся? */
const prScriptIsOurs = f => !f.script.trim() || (!!f.textOut && prHash(f.script) === f.textOut);
/** Применить рукопись к сценарию. replace: сценарий целиком из текста; append: дописать в конец. Возвращает число строк или 0. */
function prApply(n, f, mode) {
  const b = prBuild(n, f);
  if (!b.rows.length) return 0;
  if (mode === 'append' && f.script.trim()) { f.script = f.script.replace(/\s+$/, '') + '\n\n' + b.code + '\n'; f.textOut = ''; }
  else { f.script = b.code + '\n'; f.textOut = prHash(f.script); }
  return b.rows.length;
}
/** Синхронизация для главы с включённым «живым» режимом. Возвращает 'ok', 'off' (режим выключен) или 'conflict' (сценарий менялся в обход текста). */
function prSync(n, f) {
  if (!f.textLive) return 'off';
  if (!prScriptIsOurs(f)) return 'conflict';
  const b = prBuild(n, f);
  const next = b.rows.length ? b.code + '\n' : '';
  if (f.script !== next) f.script = next;
  f.textOut = prHash(f.script);
  return 'ok';
}
/** Все главы проекта в порядке прохождения: { n, f }. Без блоков-заметок. Остальные блоки — в порядке на карте. */
function prChapters() {
  const seen = new Set(), out = [];
  const add = n => { if (!n || n.type === 'note' || seen.has(n.id)) return; seen.add(n.id); n.files.forEach(f => out.push({ n, f })); };
  try { rsNodes().forEach(add); } catch (e) { /* порядок прохождения недоступен */ }
  P.nodes.forEach(add);
  return out;
}

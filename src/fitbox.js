'use strict';
/* ====== «Реплика не влезет в окно диалога» (1.6.7) ======
   Окно с текстом в Ren'Py не прокручивается: если реплика длиннее, чем помещается, лишние строки вылезают за нижний край окна
   (а при стандартных размерах и за край экрана). Автор замечает это только при запуске игры. Здесь размеры берутся из раздела «Интерфейс игры»
   (размер текста, высота окна, отступ сверху, ширина текста; если ничего не менялось, стандартные 33 / 278 / 75 / 1116), шрифт из того же
   раздела или из шрифта персонажа, а строки считаются так же, как их переносит Ren'Py: по словам, с жёсткими переносами `\n` и `{p}`.
   Это оценка (±10%): настоящий шрифт игры мы видим, только если он загружен в программу. Обычный шрифт Ren'Py (DejaVu Sans) считаем
   по его реальной ширине даже на компьютере, где его нет: ширина подгоняется по контрольной строке. */

Object.assign(D, {
  'fb.long': ['Глава «{0}»: в окно диалога не влезают реплики: {1}. У самой длинной нужно строк {2}, помещается {3} (размер текста {4}, высота окна {5}, ширина текста {6}). Строки скрипта: {7}. Пример: «{8}». Разбейте реплику на две или сократите, иначе лишние строки выйдут за нижний край окна.', 'Chapter “{0}”: lines that do not fit the dialogue window: {1}. The longest needs {2} lines, {3} fit (text size {4}, window height {5}, text width {6}). Script lines: {7}. Example: “{8}”. Split the line in two or shorten it, otherwise the extra lines go below the bottom edge of the window.'],
  'fb.font': ['Шрифт «{0}» для окна диалога не удалось загрузить в программе: длину реплик посчитал по обычному шрифту Ren\'Py (DejaVu Sans). Загрузите файл шрифта в реестр, и оценка станет точнее.', 'The font “{0}” for the dialogue window could not be loaded in the app: the line length was estimated with the default Ren\'Py font (DejaVu Sans). Upload the font file to the registry for a more accurate estimate.'],
  'fb.note': ['Проверка длины реплик берёт размеры окна из «Интерфейс игры» ({0}×{1}, текст {2}). Если в вашем проекте Ren\'Py другие значения, оценка может ошибаться.', 'The line-length check takes the window sizes from “Game interface” ({0}×{1}, text {2}). If your Ren\'Py project has other values, the estimate may be off.'],
});

const FB_REF = 'Съешь же ещё этих мягких французских булок, да выпей чаю. The quick brown fox jumps over the lazy dog 0123456789';
const FB_DJ = 6296.6309;                    // ширина контрольной строки при 100 px в DejaVu Sans
const FB_LH = 1.164;                        // высота строки DejaVu Sans в долях размера
const FB_SHOW = 3;
let FB_CTX = null, FB_CAL = null;

function fbCtx() { return FB_CTX || (FB_CTX = document.createElement('canvas').getContext('2d')); }
/** Чем считать обычный шрифт Ren'Py: сам DejaVu Sans, если он есть, иначе запасной с поправкой на ширину. */
function fbCalib() {
  if (FB_CAL) return FB_CAL;
  const c = fbCtx(), w = f => { c.font = '100px ' + f; return c.measureText(FB_REF).width; };
  const has = Math.abs(w('"DejaVu Sans", monospace') - w('monospace')) > 1;
  FB_CAL = has ? { fam: '"DejaVu Sans"', scale: 1 } : { fam: 'sans-serif', scale: FB_DJ / Math.max(1, w('sans-serif')) };
  return FB_CAL;
}
/** Параметры окна диалога из раздела «Интерфейс игры». */
function fbGeom() {
  if (typeof document === 'undefined' || typeof guiGet !== 'function') return null;
  try { fbCalib(); } catch (e) { return null; }
  const num = (k) => { const x = guiGet(k), d = GUI_KEYS.find(z => z.k === k).d; return typeof x === 'number' && isFinite(x) ? x : (isFinite(parseFloat(x)) ? parseFloat(x) : d); };
  const size = num('text_size'), boxH = num('textbox_height'), ypos = num('dialogue_ypos'), width = num('dialogue_width');
  return { size, boxH, ypos, width, avail: boxH - ypos, font: guiGet('text_font') || '' };
}
/** Шрифт для строки: { fam, scale, lh, missing }. ref — ссылка на шрифт реестра (пусто = обычный шрифт Ren'Py). */
function fbFont(ref) {
  const cal = fbCalib();
  const std = { fam: cal.fam, scale: cal.scale, lh: FB_LH, missing: '' };
  if (!ref || BUILTIN_FONTS.some(b => b.ref.toLowerCase() === String(ref).toLowerCase())) return std;
  let css = null; try { css = fontCss(ref); } catch (e) { css = null; }
  const m = css ? /^"([^"]+)"/.exec(css) : null;
  if (!m) { std.missing = ref; return std; }
  let lh = 1.2;
  try { const c = fbCtx(); c.font = '100px "' + m[1] + '"'; const mm = c.measureText('Mg'); if (mm.fontBoundingBoxAscent != null) lh = (mm.fontBoundingBoxAscent + mm.fontBoundingBoxDescent) / 100; } catch (e) { /* 1.2 */ }
  return { fam: '"' + m[1] + '", ' + cal.fam, scale: 1, lh, missing: '' };
}
/** Видимый текст реплики: теги убраны, {p} и \n — переносы строки. */
function fbPlain(s) {
  return String(s || '').replace(/\{p(?:=[^{}]*)?\}/g, '\n').replace(/\{\{/g, '\u0002').replace(/\{[^{}]*\}/g, '').replace(/\u0002/g, '{').replace(/\[\[/g, '[');
}
/** Сколько строк займёт текст при ширине width. */
function fbCount(text, size, fnt, width) {
  const c = fbCtx(); c.font = size + 'px ' + fnt.fam;
  const sp = c.measureText(' ').width * fnt.scale;
  let lines = 0;
  for (const para of text.split('\n')) {
    let cur = 0, any = false; lines++;
    for (const word of para.split(/ +/)) {
      if (!word) continue;
      const w = c.measureText(word).width * fnt.scale;
      if (any && cur + sp + w > width) { lines++; cur = w; } else { cur = any ? cur + sp + w : w; }
      any = true;
    }
  }
  return lines;
}
/** Сколько строк помещается в окне. */
const fbMaxLines = (G, lh) => Math.max(1, Math.floor(G.avail / (G.size * lh) + 1e-6));

/** Проверка одного файла главы; вызывается из сборки. G — результат fbGeom(), seen — Set шрифтов, о которых уже сказано. */
function fbReport(add, node, file, lines, lead, G, seen) {
  if (!G) return;
  let units = []; try { units = tlScan(lines); } catch (e) { return; }
  const bad = [];
  const fontCache = new Map();
  for (const u of units) {
    if (u.sub !== 'line' && u.sub !== 'caption' && u.sub !== 'with') continue;
    const text = fbPlain(typeof rtUnescape === 'function' ? rtUnescape(u.body) : u.body);
    const ch = u.who ? P.characters.find(x => x.tag === u.who) : null;
    const ref = (ch && ch.font) || G.font || '';
    let fnt = fontCache.get(ref); if (!fnt) { fnt = fbFont(ref); fontCache.set(ref, fnt); }
    const max = fbMaxLines(G, fnt.lh);
    if (text.indexOf('\n') < 0 && text.length < (G.width / (G.size * 1.05)) * (max - 1)) continue;          // заведомо короткая: даже при самых широких буквах влезет (если нет жёстких переносов)
    const need = fbCount(text, G.size, fnt, G.width);
    if (need > max) bad.push({ li: u.li + lead + 1, need, max, text, miss: fnt.missing });
  }
  for (const b of bad) if (b.miss && seen && !seen.has(b.miss)) { seen.add(b.miss); add('info', t('fb.font', b.miss)); }
  if (!bad.length) return;
  const worst = bad.slice().sort((a, b) => b.need - a.need)[0];
  const nums = bad.slice(0, 8).map(b => b.li).join(', ') + (bad.length > 8 ? '…' : '');
  const ex = worst.text.replace(/\s+/g, ' ').trim();
  G.hit = true;
  add('warn', t('fb.long', (typeof rtBlockName === 'function' ? rtBlockName(node, file) : '') || file.title || node.title || '?', bad.length, worst.need, worst.max, G.size, G.boxH, G.width, nums, ex.length > 60 ? ex.slice(0, 59) + '…' : ex), { node, file });
}
/** После всех глав: одна пометка, откуда взяты размеры (если что-то нашлось). */
function fbFlush(add, G) {
  if (G && G.hit) add('info', t('fb.note', G.width, G.boxH, G.size));
}

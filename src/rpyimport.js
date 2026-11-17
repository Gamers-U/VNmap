'use strict';
/* ====== Импорт сценария из .rpy (свои исходники) ======
   Берём файлы .rpy (или .zip с папкой game) и превращаем их в карту:
     label            → блок с одной главой (текст метки остаётся как есть, метка запоминается);
     jump / menu      → в самом конце метки это стрелки карты (названия вариантов и условия — подписи стрелок);
                        всё, что сложнее (if, вложенные переходы), остаётся в тексте и видно пунктиром («Стрелки по коду»);
     define Character → персонажи, default → переменные, image → ассеты, define Dissolve(…)/transform → эффекты;
     остальное вне меток (init python, screen, style…) → «Свой код» (customcode.js): по файлу на исходный файл, сборка пишет его в игру как есть.
   Стрелка вместо хвоста метки ставится, только если на эту метку никто не прыгает из текста: иначе переход в обход блока
   пропустил бы стрелки. Метка без завершения (после неё сразу следующая) получает стрелку к следующей: так в Ren'Py и устроено.
   rpiBuild — чистый разбор (ничего не меняет в проекте), rpiApply — запись в проект. */

Object.assign(D, {
  'ri.btn': ['Импорт сценария из .rpy…', 'Import a script from .rpy…'],
  'ri.title': ['Импорт сценария из .rpy', 'Import a script from .rpy'],
  'ri.how': ['Выберите свои файлы .rpy (можно сразу несколько) или .zip с папкой game. Каждая метка станет блоком на карте, переходы в конце метки — стрелками. Импортируйте только свои исходники: готовые чужие игры (.rpyc, .rpa) программа не читает.', 'Pick your own .rpy files (several at once are fine) or a .zip with the game folder. Every label becomes a block on the map, jumps at the end of a label become arrows. Import only your own sources: finished games of other people (.rpyc, .rpa) are not read.'],
  'ri.pick': ['Выбрать файлы…', 'Choose files…'], 'ri.clear': ['Очистить', 'Clear'],
  'ri.drop': ['Отпустите файлы, чтобы загрузить их', 'Drop the files to load them'],
  'ri.opt.arrows': ['Переходы в конце метки — стрелки карты', 'Jumps at the end of a label become map arrows'],
  'ri.opt.arrows.h': ['Выключите, и тексты останутся как есть, без стрелок (переходы видны пунктиром).', 'Turn off to keep the texts as they are, without arrows (the jumps still show dashed).'],
  'ri.opt.layout': ['Расставить новые блоки', 'Arrange the new blocks'],
  'ri.none': ['Пока ничего не загружено.', 'Nothing loaded yet.'],
  'ri.empty': ['В файлах нет меток (label): переносить нечего.', 'The files have no labels: nothing to import.'],
  'ri.files': ['Файлов: {0}', 'Files: {0}'],
  'ri.err.read': ['Не удалось прочитать «{0}».', 'Could not read “{0}”.'],
  'ri.err.type': ['Подойдут файлы .rpy и архивы .zip. Скомпилированные .rpyc и .rpa не читаются.', 'Use .rpy files or .zip archives. Compiled .rpyc and .rpa files are not read.'],
  'ri.col.label': ['Метка', 'Label'], 'ri.col.block': ['Блок', 'Block'], 'ri.col.type': ['Тип', 'Type'], 'ri.col.arrows': ['Стрелки', 'Arrows'], 'ri.col.state': ['Что с ней', 'Status'],
  'ri.st.new': ['новый блок', 'new block'], 'ri.st.skip': ['пропущена', 'skipped'],
  'ri.arrows.n': ['{0} → {1}', '{0} → {1}'], 'ri.arrows.code': ['в тексте', 'in the text'],
  'ri.sum': ['Блоков: {0} · стрелок: {1} · персонажей: {2} · переменных: {3} · ассетов: {4} · эффектов: {5} · файлов кода: {6}', 'Blocks: {0} · arrows: {1} · characters: {2} · variables: {3} · assets: {4} · effects: {5} · code files: {6}'],
  'ri.done.code': ['Файлов «Своего кода»: {0} (Инструменты → Свой код). Сборка запишет их в игру как есть.', 'Custom code files: {0} (Tools → Custom code). The build writes them into the game as they are.'],
  'ri.import': ['Импортировать', 'Import'],
  'ri.done.h': ['Готово: добавлено блоков {0}', 'Done: {0} blocks added'],
  'ri.done.p': ['Блоки лежат на карте и выделены. Загляните в «Проверку сюжета» и «Сборку»: там будет видно, чего не хватает (картинок, музыки).', 'The blocks are on the map and selected. Look at “Story check” and “Build” to see what is missing (images, music).'],
  'ri.done.order': ['В меню блоков {0} порядок вариантов на карте не совпал с исходным: сборка ставит варианты по порядку блоков сверху вниз. Переставьте эти блоки по вертикали.', 'In the menus of the blocks {0} the order of choices on the map differs from the source: the build orders choices by block position from top to bottom. Move those blocks vertically.'],
  'ri.done.close': ['Закрыть', 'Close'],
  'ri.rep.h': ['Что нужно знать', 'Good to know'],
  'ri.r.gen': ['Файл «{0}» создан самой Картой новеллы. Для переноса между компьютерами лучше открыть файл проекта .vnmap.json из папки source.', 'The file “{0}” was made by VNMap itself. To move a project between computers open the .vnmap.json project file from the source folder.'],
  'ri.r.dup': ['Метка «{0}» уже есть в проекте: пропущена (переходы на неё работают с существующей).', 'The label “{0}” already exists in the project: skipped (jumps to it use the existing one).'],
  'ri.r.dupfile': ['Метка «{0}» встречается в файлах несколько раз: взята первая.', 'The label “{0}” appears several times: the first one is used.'],
  'ri.r.start': ['Метка start переименована в «{0}»: у «Карты новеллы» своя точка входа, а этот блок назначен стартовым.', 'The label start was renamed to “{0}”: the app has its own entry point, and this block is set as the start.'],
  'ri.r.start.kept': ['Стартовый блок проекта не менялся: блок «{0}» (метка start) отмечать стартовым не стали.', 'The project start block was not changed: the block “{0}” (label start) was not made the start.'],
  'ri.r.keep': ['Метка «{0}»: переход в конце остался в тексте, потому что на неё прыгают из текста (иначе переход пропустил бы стрелки).', 'Label “{0}”: its final jump stayed in the text because other scripts jump to it (otherwise the jump would skip the arrows).'],
  'ri.r.menu': ['Метка «{0}»: меню в конце осталось в тексте (в вариантах есть реплики, теги, скобки или переходы не на метки).', 'Label “{0}”: the final menu stayed in the text (its choices have dialogue, tags, brackets or jumps to unknown labels).'],
  'ri.r.fall': ['Метка «{0}» не заканчивается переходом: дальше в Ren\'Py идёт метка «{1}». Для неё ' + 'добавлена стрелка (или строка jump).', 'Label “{0}” does not end with a jump: Ren\'Py continues into the label “{1}”. An arrow (or a jump line) was added for it.'],
  'ri.r.dyn': ['В скриптах есть jump/call expression: куда они ведут, программа не знает, поэтому переходы остались в текстах, стрелок из них не сделано.', 'The scripts have jump/call expression: the app cannot know where they lead, so jumps stayed in the texts and no arrows were made from them.'],
  'ri.r.unk': ['Метка «{0}»: переход на «{1}», такой метки нет среди импортируемых и в проекте. Остался в тексте.', 'Label “{0}”: jump to “{1}”, no such label among the imported ones or in the project. It stayed in the text.'],
  'ri.r.left': ['Код вне меток (init python, screen, style и т. п.) перенесён в «Инструменты → Свой код»: {0}. Сборка запишет его в игру как есть.', 'Code outside labels (init python, screens, styles and so on) was moved into “Tools → Custom code”: {0}. The build writes it into the game as it is.'],
  'ri.r.char': ['Персонаж «{0}» уже есть в проекте: пропущен.', 'The character “{0}” already exists in the project: skipped.'],
  'ri.r.charx': ['Персонаж {0}: доп. параметры Character (кроме имени и цвета) не перенесены.', 'Character {0}: extra Character parameters (other than name and color) were not imported.'],
  'ri.r.var': ['Переменная «{0}» уже есть в проекте: пропущена.', 'The variable “{0}” already exists in the project: skipped.'],
  'ri.r.endings': ['Блоки без выхода, на которые есть переходы и которые кончаются return, помечены как концовки: проверьте и поправьте типы на карте.', 'Blocks without exits that end with return and are jumped to were marked as endings: check and fix the types on the map.'],
  'ri.start.title': ['Начало', 'Start'],
  'ri.sel.hint': ['Импорт сценария из .rpy', 'Import a script from .rpy'],
});

/* ---------- мелкие разборщики ---------- */
const RPI_LABEL = /^label\s+([A-Za-z_]\w*)\s*(\([^)]*\))?\s*(hide_windows\s*)?:\s*(?:#.*)?$/;
const RPI_JUMP = /^jump\s+([A-Za-z_]\w*)\s*(?:#.*)?$/;
const RPI_CHOICE = /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:\s+if\s+(.*?))?\s*:\s*(?:#.*)?$/;
const RPI_MENU = /^menu\s*:\s*(?:#.*)?$/;
const RPI_FX = /^(?:Dissolve|ImageDissolve|AlphaDissolve|Fade|Pixellate|MoveTransition|PushMove|ComposeTransitions|MultipleTransition|CropMove|Wipe|SlideTransition|ZoomInOut|Move|MoveFade)\s*\(/;
const RPI_CODE_OK = /^(?:\$\s*\S|(?:play|stop|queue|show|hide|scene|with|pause|voice)\b)/;
const rpiInd = l => /^ */.exec(l)[0].length;
const rpiBlank = l => !l.trim();
const rpiCom = l => /^\s*#/.test(l);

/** Строка Python/Ren'Py → значение. Принимает "…", '…' и _("…"); null, если это не строка. */
function rpiStr(src) {
  let s = String(src || '').trim();
  const m = /^_\(\s*([\s\S]*?)\s*\)$/.exec(s); if (m) s = m[1];
  const q = s[0]; if (q !== '"' && q !== "'") return null;
  let out = '', i = 1;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      const n = s[++i];
      if (n === 'n') out += '\n'; else if (n === '"' || n === "'" || n === '\\') out += n; else return null;
    } else if (c === q) break; else out += c;
  }
  return i === s.length - 1 ? out : null;
}
/** Скобки не закрыты — строку продолжают следующие (строки в кавычках и комментарии не считаем). */
function rpiDepth(s) {
  let d = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '#') break; else if ('([{'.includes(c)) d++; else if (')]}'.includes(c)) d--;
  }
  return d;
}
/** Строка без комментария в конце (решётка внутри кавычек комментарием не считается). */
function rpiCut(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '#') return s.slice(0, i).replace(/\s+$/, '');
  }
  return s;
}
/** Логическая строка: склеивает физические, пока скобки открыты. Комментарии отрезаются. Возвращает { text, end }. */
function rpiLogical(lines, i) {
  let text = rpiCut(lines[i]), d = rpiDepth(text), j = i;
  while (d > 0 && j + 1 < lines.length && j - i < 300) { j++; text += ' ' + rpiCut(lines[j]).trim(); d = rpiDepth(text); }
  return { text: text.trim(), end: j };
}
/** Последняя строка блока, который начинается на строке from (с учётом комментариев в колонке 0 внутри блока). */
function rpiBlockEnd(lines, from) {
  let last = from, j = from + 1;
  while (j < lines.length) {
    const l = lines[j];
    if (rpiBlank(l)) { j++; continue; }
    if (rpiInd(l) > 0) { last = j; j++; continue; }
    if (rpiCom(l)) {
      let k = j + 1;
      while (k < lines.length && (rpiBlank(lines[k]) || (rpiCom(lines[k]) && rpiInd(lines[k]) === 0))) k++;
      if (k < lines.length && rpiInd(lines[k]) > 0) { last = k; j = k + 1; continue; }
    }
    break;
  }
  return last;
}
/** Убирает общий отступ. */
function rpiDedent(lines) {
  let base = Infinity;
  for (const l of lines) if (!rpiBlank(l) && rpiInd(l) > 0) base = Math.min(base, rpiInd(l));
  if (!isFinite(base)) base = 0;
  return lines.map(l => rpiBlank(l) ? '' : l.slice(Math.min(base, rpiInd(l))));
}
const rpiTrimEnd = lines => { const o = lines.slice(); while (o.length && rpiBlank(o[o.length - 1])) o.pop(); return o; };

/** Верхнеуровневые операторы: [{ s, e, head }] (e — последняя содержательная строка). */
function rpiTopStmts(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (rpiBlank(l) || rpiCom(l) || rpiInd(l) > 0) continue;
    const lg = rpiLogical(lines, i);
    out.push({ s: i, e: lg.end, head: lg.text });
    i = lg.end;
  }
  for (let k = 0; k < out.length; k++) {
    let e = (k + 1 < out.length ? out[k + 1].s : lines.length) - 1;
    while (e > out[k].s && (rpiBlank(lines[e]) || (rpiCom(lines[e]) && rpiInd(lines[e]) === 0))) e--;
    out[k].e = Math.max(e, out[k].e);
  }
  return out;
}
const rpiBodyOf = (lines, st) => rpiDedent(lines.slice(st.s + 1, st.e + 1));

/** Разбор menu: { prompt, choices:[{ cap, cond, body }], ok } */
function rpiMenu(lines, st) {
  if (!RPI_MENU.test(st.head)) return { ok: false };
  const body = rpiBodyOf(lines, st);
  const stm = rpiTopStmts(body), res = { prompt: null, choices: [], ok: true, plain: true };
  for (const x of stm) {
    const cm = RPI_CHOICE.exec(x.head);
    if (cm) {
      const sub = rpiTrimEnd(rpiDedent(body.slice(x.s + 1, x.e + 1)));
      res.choices.push({ cap: rpiStr(cm[1]), cond: (cm[2] || '').trim(), body: sub });
    } else if (!res.choices.length && res.prompt === null && rpiStr(x.head) !== null) res.prompt = rpiStr(x.head);
    else res.ok = false;
  }
  if (!res.choices.length) res.ok = false;
  return res;
}
/** Блок кончается переходом из метки: jump/return/renpy.jump…; для if и menu — когда так кончается каждая ветка. */
function rpiEndsFlow(lines) {
  const stm = rpiTopStmts(lines); if (!stm.length) return false;
  const last = stm[stm.length - 1], h0 = last.head;
  if (/^(?:jump|return)\b/.test(h0) || /^\$\s*renpy\.(?:jump|full_restart|quit)\s*\(/.test(h0)) return true;
  if (RPI_MENU.test(h0)) { const m = rpiMenu(lines, last); return m.ok && m.choices.every(c => rpiEndsFlow(c.body)); }
  if (/^else\s*:/.test(h0)) {
    let k = stm.length - 1;
    const branches = [];
    for (;; k--) {
      if (k < 0) return false;
      const hh = stm[k].head;
      if (/^else\s*:/.test(hh) || /^elif\b/.test(hh)) { branches.push(stm[k]); continue; }
      if (/^if\b/.test(hh)) { branches.push(stm[k]); break; }
      return false;
    }
    return branches.every(b => rpiEndsFlow(rpiBodyOf(lines, b)));
  }
  return false;
}

/* ---------- файлы → куски верхнего уровня ---------- */
function rpiChunks(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  const out = []; let lead = [], i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (rpiBlank(l)) { if (lead.length) { out.push({ kind: 'raw', lines: lead }); lead = []; } i++; continue; }
    if (rpiInd(l) === 0 && rpiCom(l)) { lead.push(l); i++; continue; }
    if (rpiInd(l) > 0) { out.push({ kind: 'raw', lines: [l] }); i++; continue; }
    const lg = rpiLogical(lines, i), end = rpiBlockEnd(lines, lg.end);
    out.push({ kind: 'stmt', head: lg.text, headEnd: lg.end, line: i + 1, lines: rpiTrimEnd(lines.slice(i, end + 1)), headLines: lines.slice(i, lg.end + 1), lead });
    lead = []; i = end + 1;
  }
  if (lead.length) out.push({ kind: 'raw', lines: lead });
  return out;
}

/** Название блока из имени метки: «chapter_1_start» → «Chapter 1 start» */
function rpiTitle(name) {
  const s = String(name).replace(/_+/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : name;
}
const rpiRefRe = /\b(?:jump|call)\s+([A-Za-z_]\w*)|\brenpy\.(?:jump|call)\(\s*["']([A-Za-z_]\w*)["']|\bJump\(\s*["']([A-Za-z_]\w*)["']|\bCall\(\s*["']([A-Za-z_]\w*)["']/g;
const rpiDynRe = /\b(?:jump|call)\s+expression\b|\brenpy\.(?:jump|call)\(\s*[^"'\s)]/;
/** Ссылки на метки в строках (комментарии отрезаются). */
function rpiRefs(lines, from, to) {
  const out = [];
  for (let i = from; i < to; i++) {
    const l = lines[i].replace(/#.*$/, '');
    rpiRefRe.lastIndex = 0; let m;
    while ((m = rpiRefRe.exec(l))) out.push(m[1] || m[2] || m[3] || m[4]);
  }
  return out;
}

/**
 * Разбор исходников в план. sources: [{ name, text }]; opt: { arrows (по умолчанию true) }.
 * Ничего не меняет в проекте, только читает его (чтобы не дублировать метки, персонажей, переменные).
 */
function rpiBuild(sources, opt) {
  opt = Object.assign({ arrows: true }, opt || {});
  const plan = { nodes: [], chars: [], vars: [], assets: [], fx: [], code: [], note: null, start: null, report: [], counts: { blocks: 0, arrows: 0, chars: 0, vars: 0, assets: 0, fx: 0 }, files: sources.length };
  const rep = (level, msg) => plan.report.push({ level, msg });
  /* 1. куски каждого файла */
  const labels = [], leftovers = [], tops = [];
  let dynamic = false;
  for (const src of sources) {
    const chunks = rpiChunks(src.text);
    if (/Сгенерировано «Картой новеллы»|Generated by VNMap/.test(String(src.text).slice(0, 600))) rep('info', t('ri.r.gen', src.name));
    const fileLabels = [];
    for (const c of chunks) {
      if (c.kind === 'stmt') {
        const m = RPI_LABEL.exec(c.head);
        if (m) { const L = { name: m[1], params: m[2] || '', src: src.name, line: c.line, lead: c.lead, body: rpiTrimEnd(rpiDedent(c.lines.slice(c.headLines.length))), idx: labels.length }; labels.push(L); fileLabels.push(L); continue; }
        tops.push({ c, src: src.name });
      } else tops.push({ c, src: src.name, raw: true });
    }
    fileLabels.forEach((L, k) => { L.next = fileLabels[k + 1] || null; });
  }
  /* повторы и уже существующие метки */
  const existing = (() => { try { return jumpTargetMap(); } catch (e) { return new Map(); } })();
  const byName = new Map();
  for (const L of labels) {
    if (byName.has(L.name)) { rep('info', t('ri.r.dupfile', L.name)); L.skip = true; continue; }
    if (existing.has(jKey(L.name === 'start' ? 'start_scene' : L.name))) { rep('info', t('ri.r.dup', L.name)); L.skip = true; continue; }
    byName.set(L.name, L);
  }
  const live = labels.filter(L => !L.skip);
  /* 2. код вне меток: персонажи, переменные, картинки, эффекты, остальное — в заметку */
  const haveTag = new Set(P.characters.map(c => c.tag)), haveVar = new Set(P.vars.map(v => v.name));
  const haveAsset = new Set(P.assets.map(a => a.kind + '|' + a.name.toLowerCase()));
  const left = [], leftBy = new Map();          // остаток кода вне меток: всё вместе (для ссылок) и по исходным файлам (для «Своего кода»)
  const pushLeft = (src, text) => { left.push(text); if (!leftBy.has(src)) leftBy.set(src, []); leftBy.get(src).push(text); };
  for (const { c, raw, src } of tops) {
    if (raw) { pushLeft(src, c.lines.join('\n')); continue; }
    const head = c.head, whole = c.lines.join('\n');
    let m;
    if ((m = /^define\s+(?:-?\d+\s+)?([A-Za-z_]\w*)\s*=\s*Character\s*\(([\s\S]*)\)\s*$/.exec(head))) {
      const tag = m[1], args = m[2];
      const first = /^\s*(None|(?:_\(\s*)?(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:\s*\))?)/.exec(args);
      const nm = first ? (first[1] === 'None' ? '' : rpiStr(first[1])) : null;
      if (nm === null || nm === '' ) { pushLeft(src, c.lead.concat(c.lines).join('\n')); continue; }
      if (haveTag.has(tag)) { rep('info', t('ri.r.char', tag)); continue; }
      const col = /\bcolor\s*=\s*(["'])(#[0-9a-fA-F]{6})\1/.exec(args), wc = /\bwhat_color\s*=\s*(["'])(#[0-9a-fA-F]{6})\1/.exec(args);
      plan.chars.push({ tag, name: nm, color: col ? col[2].toLowerCase() : '', textColor: wc ? wc[2].toLowerCase() : '' });
      haveTag.add(tag);
      if (/\b(?!color\b|what_color\b)\w+\s*=/.test(args.slice(first ? first[0].length : 0))) rep('info', t('ri.r.charx', tag));
      continue;
    }
    if ((m = /^define\s+(?:-?\d+\s+)?([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(head)) && RPI_FX.test(m[2]) && rpiDepth(m[2]) === 0 && c.lines.length === c.headLines.length) {
      if (!P.assets.some(a => (a.kind === 'fx' || a.kind === 'tf') && a.name === m[1]) && !plan.fx.some(x => x.name === m[1])) plan.fx.push({ kind: 'fx', name: m[1], code: m[2].trim() });
      continue;
    }
    if ((m = /^transform\s+([A-Za-z_]\w*)\s*:\s*$/.exec(head)) && c.lines.length > 1) {
      if (!P.assets.some(a => (a.kind === 'fx' || a.kind === 'tf') && a.name === m[1]) && !plan.fx.some(x => x.name === m[1])) plan.fx.push({ kind: 'tf', name: m[1], code: rpiTrimEnd(rpiDedent(c.lines.slice(1))).join('\n') });
      continue;
    }
    if ((m = /^default\s+(?:-?\d+\s+)?([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(head)) && rpiDepth(m[2]) === 0 && c.lines.length === c.headLines.length) {
      if (haveVar.has(m[1]) || haveTag.has(m[1])) { rep('info', t('ri.r.var', m[1])); continue; }
      haveVar.add(m[1]);
      const v = m[2].trim();
      plan.vars.push({ name: m[1], value: v, type: /^(?:True|False)$/.test(v) ? 'flag' : /^-?\d+(?:\.\d+)?$/.test(v) ? 'number' : 'raw' });
      continue;
    }
    if ((m = /^image\s+([A-Za-z_][\w ]*?)\s*=\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*$/.exec(head)) && c.lines.length === c.headLines.length) {
      const parts = m[1].trim().split(/\s+/), file = rpiStr(m[2]);
      if (file !== null) {
        const bg = parts[0] === 'bg';
        if (bg) { const nm = parts.join(' '); if (!haveAsset.has('bg|' + nm.toLowerCase())) { haveAsset.add('bg|' + nm.toLowerCase()); plan.assets.push({ kind: 'bg', name: nm, path: file.replace(/\.[A-Za-z0-9]+$/, ''), expr: [] }); } }
        else {
          const tag = parts[0], expr = parts.slice(1).join(' ');
          let a = plan.assets.find(x => x.kind === 'sprite' && x.name === tag);
          if (!a && !haveAsset.has('sprite|' + tag.toLowerCase())) { a = { kind: 'sprite', name: tag, path: '', expr: [] }; plan.assets.push(a); haveAsset.add('sprite|' + tag.toLowerCase()); }
          if (a && expr && !a.expr.includes(expr)) a.expr.push(expr);
        }
        continue;
      }
    }
    pushLeft(src, c.lead.concat(c.lines).join('\n'));
  }
  /* ссылки из кода вне меток тоже считаются: Jump("метка") в экране и т. п. */
  const leftText = left.join('\n');
  for (const r of rpiRefs(leftText.split('\n'), 0, leftText.split('\n').length)) if (byName.has(r)) byName.get(r).extRef = true;
  if (rpiDynRe.test(leftText)) dynamic = true;
  /* 3. хвосты меток */
  for (const L of live) {
    for (const ln of L.body) if (rpiDynRe.test(ln.replace(/#.*$/, ''))) dynamic = true;
  }
  if (dynamic) rep('info', t('ri.r.dyn'));
  const resolve = name => byName.has(name) ? { label: name } : (() => { const x = existing.get(jKey(name)); return x && x.node ? { nid: x.node.id } : null; })();
  const tailOf = L => {
    const body = L.body, stm = rpiTopStmts(body), last = stm[stm.length - 1];
    const t0 = { kind: 'none', edges: [], cut: body.length, prompt: '', note: null };
    if (!last) { if (L.next && !L.next.skip) return { kind: 'fall', edges: [{ to: { label: L.next.name }, title: '', cond: '', code: '' }], cut: body.length, explicit: 'jump ' + L.next.name, note: null, prompt: '' }; return t0; }
    let m;
    if ((m = RPI_JUMP.exec(last.head)) && last.e === last.s) {
      const to = resolve(m[1]);
      if (!to) return Object.assign(t0, { note: ['unk', m[1]] });
      if (to.label === L.name) return t0;
      return { kind: 'jump', edges: [{ to, title: '', cond: '', code: '' }], cut: last.s, prompt: '', note: null };
    }
    if (RPI_MENU.test(last.head)) {
      const mn = rpiMenu(body, last);
      let good = mn.ok;
      const edges = [];
      if (good && mn.prompt !== null && /[\[\{]/.test(mn.prompt)) good = false;
      if (good) for (const ch of mn.choices) {
        if (ch.cap === null || /[\[\{]/.test(ch.cap) || /^\s*$/.test(ch.cap)) { good = false; break; }
        const cst = ch.body.filter(x => !rpiBlank(x) && !rpiCom(x));
        const lastc = cst[cst.length - 1], jm = lastc && RPI_JUMP.exec(lastc.trim());
        const to = jm && ch.body.every(x => rpiBlank(x) || rpiCom(x) || rpiInd(x) === 0) ? resolve(jm[1]) : null;
        if (!to || (to.label && to.label === L.name)) { good = false; break; }
        const pre = cst.slice(0, -1).filter(x => rpiInd(x) === 0);
        if (pre.length !== cst.length - 1 || !pre.every(x => RPI_CODE_OK.test(x.trim()) && rpiDepth(x) === 0)) { good = false; break; }
        edges.push({ to, title: ch.cap, cond: ch.cond, code: pre.map(x => x.trim()).join('\n') });
      }
      if (good) return { kind: 'menu', edges, cut: last.s, prompt: mn.prompt || '', note: null };
      if (!rpiEndsFlow(body) && L.next && !L.next.skip) return { kind: 'fall-menu', edges: [], cut: body.length, note: ['menu', L.name], explicit: 'jump ' + L.next.name, prompt: '' };
      return Object.assign(t0, { note: ['menu', L.name] });
    }
    if (rpiEndsFlow(body)) return t0;
    if (L.next && !L.next.skip) return { kind: 'fall', edges: [{ to: { label: L.next.name }, title: '', cond: '', code: '' }], cut: body.length, explicit: 'jump ' + L.next.name, note: null, prompt: '' };
    return t0;
  };
  for (const L of live) L.tail = tailOf(L);
  /* какие хвосты превращаем в стрелки: только у меток, на которые не прыгают «из текста» */
  const conv = new Set();
  if (opt.arrows && !dynamic) for (const L of live) if (L.tail.edges.length) conv.add(L);
  const inbound = (L, srcSet) => {
    if (L.extRef) return true;
    for (const S of live) {
      const tailFrom = srcSet.has(S) ? S.tail.cut : S.body.length;
      for (const r of rpiRefs(S.body, 0, tailFrom)) if (r === L.name) return true;
    }
    return false;
  };
  for (let changed = true; changed;) {
    changed = false;
    for (const L of [...conv]) if (inbound(L, conv)) { conv.delete(L); changed = true; }
  }
  /* 4. узлы */
  const taken = new Set(P.nodes.map(n => slug(n.title)));
  const nodeOf = new Map();
  for (const L of live) {
    let script = L.body.slice();
    const tl = L.tail, isConv = conv.has(L);
    if (isConv) script = rpiTrimEnd(script.slice(0, tl.cut));
    else if (tl.explicit) script = rpiTrimEnd(script).concat(['', tl.explicit]);
    const startLabel = L.name === 'start';
    const fl = startLabel ? 'start_scene' : L.name;
    if (startLabel) script = script.map(x => x.replace(/\b(jump|call)\s+start\b/g, '$1 start_scene'));
    if (L.params) script = ['label ' + fl + L.params + ':'].concat(script.map(x => (x ? '    ' + x : x)));
    let title = startLabel ? t('ri.start.title') : rpiTitle(L.name), base = title, k = 2;
    while (taken.has(slug(title))) title = base + ' ' + k++;
    taken.add(slug(title));
    const desc = L.lead.map(x => x.replace(/^#+\s?/, '').trim()).filter(Boolean).join('\n');
    const n = { label: L.name, fileLabel: L.params ? '' : fl, title, desc, script: script.join('\n').replace(/^\n+/, ''), edges: [], type: 'chapter', src: L.src, line: L.line, isStart: startLabel, ret: false };
    n.ret = rpiEndsFlow(L.body) && /^return\b/.test((rpiTopStmts(L.body).slice(-1)[0] || { head: '' }).head);
    nodeOf.set(L.name, n); plan.nodes.push(n);
    if (tl.note) { if (tl.note[0] === 'unk') rep('info', t('ri.r.unk', L.name, tl.note[1])); else rep('info', t('ri.r.menu', L.name)); }
    else if (tl.edges.length && !isConv && opt.arrows && !dynamic && tl.kind !== 'fall') rep('info', t('ri.r.keep', L.name));
    if (tl.kind === 'fall' || tl.kind === 'fall-menu') rep('info', t('ri.r.fall', L.name, L.next.name));
    L.node = n;
  }
  for (const L of live) {
    if (!conv.has(L)) continue;
    for (const e of L.tail.edges) L.node.edges.push({ to: e.to.label ? { node: nodeOf.get(e.to.label), label: e.to.label } : { nid: e.to.nid }, title: e.title, cond: e.cond, code: e.code });
    if (L.tail.kind === 'menu' && L.tail.prompt) L.node.prompt = L.tail.prompt;
  }
  /* 5. типы: развилка (только меню), концовка (без выходов, кончается return, на неё прыгают) */
  const incoming = new Set();
  for (const n of plan.nodes) for (const e of n.edges) if (e.to.node) incoming.add(e.to.node);
  for (const L of live) for (const r of rpiRefs(L.body, 0, L.body.length)) { const tn = nodeOf.get(r); if (tn && tn !== L.node) incoming.add(tn); }
  let ends = 0;
  for (const n of plan.nodes) {
    const bodyEmpty = !n.script.replace(/#.*$/gm, '').trim();
    if (n.edges.length >= 2 && bodyEmpty) n.type = 'fork';
    else if (!n.edges.length && n.ret && incoming.has(n) && !n.isStart) { n.type = 'ending'; ends++; }
  }
  if (ends) rep('info', t('ri.r.endings'));
  /* 6. старт, заметка с остатком, счётчики */
  const sn = nodeOf.get('start');
  if (sn) {
    if (P.startId && P.nodes.some(x => x.id === P.startId)) rep('info', t('ri.r.start.kept', sn.title)); else { plan.start = sn; rep('info', t('ri.r.start', 'start_scene')); }
  }
  plan.code = [];
  for (const [src, parts] of leftBy) {
    const txt = parts.filter(x => x.trim()).join('\n\n');
    if (!txt.split('\n').some(l => l.trim() && !/^\s*#/.test(l))) continue;
    plan.code.push({ src, name: ccSlug(String(src).replace(/^.*[\\/]/, '')), text: txt.replace(/\s+$/, '') + '\n' });
  }
  plan.code = plan.code.filter(cf => { const dup = (P.code || []).some(c => c.name.toLowerCase() === cf.name.toLowerCase() && ccNorm(c.text).trim() === ccNorm(cf.text).trim()); if (dup) rep('info', t('cu.imp.same', cf.name + '.rpy')); return !dup; });
  if (plan.code.length) rep('info', t('ri.r.left', plan.code.map(x => x.name + '.rpy').join(', ')));
  plan.counts = { blocks: plan.nodes.length, arrows: plan.nodes.reduce((s, n) => s + n.edges.length, 0), chars: plan.chars.length, vars: plan.vars.length, assets: plan.assets.length, fx: plan.fx.length, code: plan.code.length };
  return plan;
}

/** Запись плана в проект одним шагом. Возвращает { ids } новых блоков. */
function rpiApply(plan, opt) {
  opt = Object.assign({ layout: true }, opt || {});
  const me = authorNow();
  /* персонажи, переменные, ассеты, эффекты */
  for (const c of plan.chars) {
    const ch = { id: uid('c'), name: c.name, tag: c.tag, color: COLOR_NAMES[(P.characters.length * 3 + 1) % 10], aliases: '', always: false, notes: '' };
    if (c.color) ch.gameColor = c.color;
    if (c.textColor) ch.textColor = c.textColor;
    P.characters.push(ch);
  }
  for (const v of plan.vars) P.vars.push({ id: uid('v'), name: v.name, value: v.value, notes: '', type: v.type, values: [] });
  for (const a of plan.assets) {
    const x = { id: uid('a'), kind: a.kind, name: a.name, path: a.path || '', notes: '', expr: a.expr.slice(), files: {} };
    P.assets.push(x);
  }
  for (const f of plan.fx) { const x = { id: uid('a'), kind: f.kind, name: f.name, path: '', notes: '', expr: [], files: {}, tpl: '', params: {}, code: f.code }; P.assets.push(x); }
  /* блоки: раскладка по обходу в глубину, дети — в порядке вариантов меню (сверху вниз, как их собирает сборка) */
  const bb = P.nodes.length ? nodesBBox(P.nodes.filter(n => n.type !== 'note')) : null;
  const x0 = bb ? bb.x0 : 0, y0 = bb ? bb.y1 + 240 : 0;
  const slot = new Map(); let row = 0;
  const visit = (pn, depth) => {
    if (slot.has(pn)) return;
    slot.set(pn, { col: depth, row: row++ });
    for (const e of pn.edges) if (e.to.node) visit(e.to.node, depth + 1);
  };
  const hasIn = new Set(); for (const pn of plan.nodes) for (const e of pn.edges) if (e.to.node) hasIn.add(e.to.node);
  if (plan.start) visit(plan.start, 0);
  for (const pn of plan.nodes) if (!hasIn.has(pn)) visit(pn, 0);
  for (const pn of plan.nodes) visit(pn, 0);
  const made = new Map(), ids = [];
  for (const pn of plan.nodes) {
    const sl = slot.get(pn);
    const n = newNode(pn.type, x0 + sl.col * 340, y0 + sl.row * 180);
    if (me) n.by = me;
    n.title = pn.title; n.desc = pn.desc || ''; if (pn.prompt) n.prompt = pn.prompt;
    const f = n.files[0];
    if (f) {
      f.title = pn.title; f.label = pn.fileLabel || ''; f.script = pn.script; f.status = 'draft';
      if (pn.src) f.notes = pn.src + (pn.line ? ':' + pn.line : '');
    }
    P.nodes.push(n); made.set(pn, n); ids.push(n.id);
  }
  let note = null, codeAdded = 0;
  for (const cf of plan.code || []) if (ccAdd({ name: cf.name, text: cf.text, note: t('cu.imp.note', cf.src), silent: true })) codeAdded++;
  reindex();
  for (const pn of plan.nodes) {
    const from = made.get(pn);
    for (const e of pn.edges) {
      const toId = e.to.node ? made.get(e.to.node).id : e.to.nid;
      if (!toId || toId === from.id) continue;
      const ed = addEdge(from.id, toId);
      if (!ed) continue;
      ed.title = e.title || ''; ed.cond = e.cond || ''; ed.code = e.code || '';
    }
  }
  if (plan.start) P.startId = made.get(plan.start).id;
  reindex();
  if (opt.layout) { try { autoLayout({ ids: new Set(ids.filter(id => !note || id !== note.id)) }); } catch (e) { /* без расстановки */ } }
  /* сборка ставит варианты меню в порядке блоков сверху вниз: возвращаем порядок из исходника там, где это можно сделать, не задевая другие меню */
  const bad = [];
  const inCount = new Map(); for (const e of P.edges) inCount.set(e.to, (inCount.get(e.to) || 0) + 1);
  for (const pn of plan.nodes) {
    if (pn.edges.length < 2) continue;
    const from = made.get(pn), want = pn.edges.map(e => (e.to.node ? made.get(e.to.node).id : e.to.nid)).filter(Boolean);
    const uniq = [...new Set(want)].map(id => nodeById(id));
    if (uniq.length !== want.length) continue;
    const pos = uniq.map(n => ({ x: n.x, y: n.y })).sort((a, b) => a.y - b.y || a.x - b.x);
    const fine = uniq.every((n, i) => n.y === pos[i].y && n.x === pos[i].x);
    if (fine) continue;
    if (uniq.every(n => inCount.get(n.id) === 1)) {
      uniq.forEach((n, i) => { n.x = pos[i].x; n.y = pos[i].y; });
      const mv = new Set(uniq.map(n => n.id));
      for (const e of P.edges) if (mv.has(e.to) || mv.has(e.from)) { e.pts = []; e.lo = null; e.fromSide = 'auto'; e.toSide = 'auto'; }
    } else bad.push(from.title);
  }
  reindex();
  commit(true);
  return { ids, orderBad: bad, code: codeAdded };
}

/* ---------- чтение файлов ---------- */
const RPI_FILE_RE = /\.(rpy|zip)$/i;
/** Файлы → [{ name, text }]; zip раскрывается, берутся только .rpy */
async function rpiReadFiles(files) {
  const out = [];
  for (const f of files) {
    const nm = f.name || 'file';
    if (/\.zip$/i.test(nm)) {
      const entries = await readZip(await f.arrayBuffer());
      for (const e of entries) if (/\.rpy$/i.test(e.name) && !/(^|\/)(renpy|launcher)\//.test(e.name)) out.push({ name: e.name, text: new TextDecoder('utf-8').decode(e.data) });
    } else out.push({ name: nm, text: await f.text() });
  }
  out.sort((a, b) => (/script\.rpy$/i.test(a.name) ? -1 : 0) - (/script\.rpy$/i.test(b.name) ? -1 : 0) || a.name.localeCompare(b.name));
  return out;
}

/* ---------- окно ---------- */
function openRpyImport() {
  closePopover();
  MODALS.filter(x => x.tag === 'rpyimport').forEach(x => x.close());
  const model = { sources: [], plan: null, arrows: true, layout: true, done: null };
  const m = openModal({
    cls: 'di-m rpi-m', dismiss: false,
    build: m => {
      m.tag = 'rpyimport';
      const wrap = h('div', { class: 'm-wrap di-wrap' });
      const srcBar = h('div', { class: 'di-srcbar' }), optsBox = h('div', { class: 'di-opts' }), tableBox = h('div', { class: 'di-tbl scroll' }), foot = h('div', { class: 'm-foot di-foot' });
      const top = h('div', { class: 'di-top' });
      const load = async files => {
        const fl = [...files].filter(f => RPI_FILE_RE.test(f.name || ''));
        if (!fl.length) { toast(t('ri.err.type')); return; }
        try { const add = await rpiReadFiles(fl); const seen = new Set(model.sources.map(s => s.name)); for (const a of add) if (!seen.has(a.name)) model.sources.push(a); }
        catch (e) { toast(t('ri.err.read', fl.map(f => f.name).join(', '))); return; }
        model.done = null; reparse();
      };
      const reparse = () => { model.plan = model.sources.length ? rpiBuild(model.sources, { arrows: model.arrows }) : null; paint(); };
      const paint = () => {
        srcBar.replaceChildren(
          h('button', { class: 'btn', id: 'ri-pick', onclick: () => pickFiles('.rpy,.zip,application/zip', true, load) }, icon('upload', 15), t('ri.pick')),
          model.sources.length ? h('button', { class: 'btn', id: 'ri-clear', onclick: () => { model.sources = []; model.done = null; reparse(); } }, icon('x', 14), t('ri.clear')) : null,
          model.sources.length ? h('span', { class: 'di-srcname' }, t('ri.files', model.sources.length) + ' · ' + model.sources.slice(0, 3).map(s => s.name.split('/').pop()).join(', ') + (model.sources.length > 3 ? '…' : '')) : null);
        optsBox.replaceChildren(
          h('label', { class: 'di-opt' }, switchEl(model.arrows, v => { model.arrows = !!v; reparse(); }), h('span', { class: 'lbl' }, t('ri.opt.arrows')), h('span', { class: 'hint' }, t('ri.opt.arrows.h'))),
          h('label', { class: 'di-opt' }, switchEl(model.layout, v => { model.layout = !!v; }), h('span', { class: 'lbl' }, t('ri.opt.layout'))));
        paintTable(); paintFoot();
      };
      const paintTable = () => {
        tableBox.replaceChildren();
        if (model.done) {
          tableBox.append(h('div', { class: 'di-done' }, h('div', { class: 'di-done-h' }, icon('check', 22), t('ri.done.h', model.done.ids.length)), h('p', { class: 'hint' }, t('ri.done.p')), model.done.code ? h('p', { class: 'hint' }, t('ri.done.code', model.done.code)) : null, model.done.orderBad && model.done.orderBad.length ? h('p', { class: 'hint di-warn' }, icon('alert', 14), t('ri.done.order', model.done.orderBad.join(', '))) : null));
          return;
        }
        const p = model.plan;
        if (!p) { tableBox.append(h('div', { class: 'empty small' }, t('ri.none'))); return; }
        if (!p.nodes.length) tableBox.append(h('div', { class: 'empty small' }, t('ri.empty')));
        else {
          tableBox.append(h('div', { class: 'di-row rpi-row di-hd' }, h('span', t('ri.col.label')), h('span', t('ri.col.block')), h('span', t('ri.col.type')), h('span', t('ri.col.arrows'))));
          for (const n of p.nodes) tableBox.append(h('div', { class: 'di-row rpi-row' }, h('span', { class: 'mono' }, n.label), h('span', { class: 'di-t' }, n.title), h('span', { class: 'di-st' }, t('type.' + n.type)),
            h('span', { class: 'di-w' }, n.edges.length ? t('ri.arrows.n', n.edges.length, [...new Set(n.edges.map(e => e.to.node ? e.to.node.title : '…'))].slice(0, 2).join(', ')) : '')));
        }
        tableBox.append(h('div', { class: 'hint di-info' }, t('ri.sum', p.counts.blocks, p.counts.arrows, p.counts.chars, p.counts.vars, p.counts.assets, p.counts.fx, p.counts.code)));
        if (p.report.length) tableBox.append(h('div', { class: 'ri-rep' }, h('b', t('ri.rep.h')), h('ul', {}, p.report.slice(0, 40).map(r => h('li', {}, r.msg)))));
      };
      const paintFoot = () => {
        const p = model.plan, can = !!(p && (p.nodes.length || p.chars.length || p.vars.length || p.assets.length || p.fx.length || p.code.length)) && !model.done;
        foot.replaceChildren(h('span', { class: 'grow' }),
          h('button', { class: 'btn', id: 'ri-cancel', onclick: () => m.close() }, model.done ? t('ri.done.close') : t('c.cancel')),
          model.done ? null : h('button', { class: 'btn primary', id: 'ri-go', disabled: !can, onclick: () => {
            const plan = rpiBuild(model.sources, { arrows: model.arrows });
            const r = rpiApply(plan, { layout: model.layout });
            model.done = r;
            renderAll(); paint();
            try {       // показать новые блоки на экране и выделить их
              const nn = r.ids.map(nodeById).filter(Boolean), bbx = nodesBBox(nn), rc = stage.getBoundingClientRect();
              if (bbx) centerOn((bbx.x0 + bbx.x1) / 2, (bbx.y0 + bbx.y1) / 2, clamp(Math.min((rc.width - 120) / Math.max(1, bbx.x1 - bbx.x0), (rc.height - 220) / Math.max(1, bbx.y1 - bbx.y0), 1), 0.15, 1));
              setSel(nn.filter(n => n.type !== 'note').map(n => n.id));
            } catch (e) { /* без перехода */ }
          } }, icon('check', 15), t('ri.import')));
      };
      wrap.addEventListener('dragover', ev => { if ([...(ev.dataTransfer && ev.dataTransfer.types || [])].includes('Files')) { ev.preventDefault(); wrap.classList.add('drag'); } });
      wrap.addEventListener('dragleave', ev => { if (ev.target === wrap || !wrap.contains(ev.relatedTarget)) wrap.classList.remove('drag'); });
      wrap.addEventListener('drop', ev => { wrap.classList.remove('drag'); const fl = ev.dataTransfer && ev.dataTransfer.files; if (fl && fl.length) { ev.preventDefault(); load(fl); } });
      top.append(h('p', { class: 'di-how hint' }, t('ri.how')), srcBar);
      wrap.append(modalHead(t('ri.title'), m), h('div', { class: 'di-body' }, top, optsBox, tableBox, foot));
      paint();
      m.rpi = { model, load, reparse };
      return wrap;
    }
  });
  return m;
}
TOOL_ITEMS.push({ id: 'rpyimport', group: 'story', ic: 'signin', key: 'ri.btn', kw: 'import rpy renpy script labels jump menu импорт сценарий метки перенос ренпай исходники', run: () => openRpyImport() });

'use strict';
/* ====== Свой код проекта (1.6.9) ======
   Экраны (screen), init python, стили (style), свои define и любой другой код Ren'Py, который не относится к сюжету и не лежит внутри меток.
   Раньше такому коду в карте негде было жить: при импорте `.rpy` он превращался в заметку и в сборку не попадал.
   Теперь он хранится в проекте как набор файлов `P.code = [{ id, name, text, on, note, at }]` и сборка пишет каждый файл в `game/<name>.rpy` как есть.
   Сборка читает из него имена (персонажей, переменные, картинки, метки, трансформы), чтобы не ругаться на них в главах, и проверяет конфликты:
   табуляция, тройные кавычки, повторные define/default, персонаж или переменная из реестра, метка из глав, экран, который уже пишет сборка.
   Встроенный плеер читает те же файлы: define, default и метки из своего кода он знает; экраны и init python пропускает.
   Хранится в проекте, сливается по полям (префикс `o`), попадает в историю изменений и в снимки. */

Object.assign(D, {
  'cu.btn': ['Свой код…', 'Custom code…'],
  'cu.title': ['Свой код проекта', 'Project custom code'],
  'cu.lead': ['Экраны, init python, стили и другой код Ren\'Py вне сюжета. Каждый файл сборка кладёт в игру как есть: game/имя.rpy. Метки, персонажей и переменные из него сборка знает, поэтому в главах на них не ругается.', 'Screens, init python, styles and other Ren\'Py code outside the story. The build puts every file into the game as it is: game/name.rpy. The build knows the labels, characters and variables in it, so it does not complain about them in the chapters.'],
  'cu.empty': ['Файлов пока нет. Нажмите «Добавить», выберите пример или загрузите готовый файл .rpy.', 'There are no files yet. Press “Add”, pick an example or upload a ready .rpy file.'],
  'cu.new': ['Добавить', 'Add'], 'cu.upload': ['Загрузить .rpy', 'Upload .rpy'],
  'cu.ex': ['Пример…', 'Example…'],
  'cu.ex.screen': ['Экран', 'Screen'], 'cu.ex.python': ['Своя функция (init python)', 'Own function (init python)'], 'cu.ex.style': ['Стиль', 'Style'],
  'cu.del': ['Удалить файл', 'Delete the file'], 'cu.del.q': ['Удалить файл?', 'Delete the file?'],
  'cu.del.t': ['Файл «{0}» будет удалён из проекта. Ctrl+Z вернёт его.', 'The file “{0}” will be removed from the project. Ctrl+Z brings it back.'],
  'cu.f.name': ['Имя файла', 'File name'],
  'cu.f.name.h': ['Латинские буквы, цифры, «_» и «-». В игре файл будет называться game/{0}.rpy', 'Latin letters, digits, “_” and “-”. In the game the file is called game/{0}.rpy'],
  'cu.f.on': ['Писать в сборку', 'Write into the build'],
  'cu.f.off': ['Файл выключен: в игру не попадёт, но лежит в проекте.', 'The file is off: it will not get into the game, but stays in the project.'],
  'cu.f.note': ['Заметка для себя', 'Note for yourself'],
  'cu.f.code': ['Код', 'Code'],
  'cu.f.code.h': ['Клавиша Tab ставит четыре пробела: Ren\'Py не принимает табуляцию. Верхний уровень пишется без отступа.', 'The Tab key inserts four spaces: Ren\'Py does not accept tab characters. The top level is written without indent.'],
  'cu.stat': ['Строк: {0} · знаков: {1}', 'Lines: {0} · characters: {1}'],
  'cu.found': ['Нашёл: экранов {0}, меток {1}, define и default {2}, картинок {3}', 'Found: screens {0}, labels {1}, define and default {2}, images {3}'],
  'cu.added': ['Файл «{0}» добавлен', 'The file “{0}” was added'],
  'cu.up.done': ['Загружено файлов: {0}', 'Files uploaded: {0}'],
  'cu.up.same': ['Такой файл уже есть: {0}', 'Such a file already exists: {0}'],
  'cu.ex.name.screen': ['screens_extra', 'screens_extra'], 'cu.ex.name.python': ['python_helpers', 'python_helpers'], 'cu.ex.name.style': ['styles_extra', 'styles_extra'],
  'cu.ex.code.screen': [
    '# Пример экрана: плашка с подсказкой в углу.\n# Показать её можно в любой главе командой: show screen hint_bar\n# Убрать: hide screen hint_bar\nscreen hint_bar():\n    zorder 50\n    frame:\n        xalign 0.99\n        yalign 0.02\n        padding (16, 8)\n        text "Подсказка: нажмите H" size 24\n',
    '# An example screen: a hint plate in the corner.\n# Show it in any chapter with: show screen hint_bar\n# Hide it with: hide screen hint_bar\nscreen hint_bar():\n    zorder 50\n    frame:\n        xalign 0.99\n        yalign 0.02\n        padding (16, 8)\n        text "Hint: press H" size 24\n'],
  'cu.ex.code.python': [
    '# Пример своей функции: держит число в границах.\n# В главе: $ love = clamp(love + 3, 0, 10)\ninit python:\n    def clamp(value, low, high):\n        return max(low, min(high, value))\n',
    '# An example of your own function: keeps a number within bounds.\n# In a chapter: $ love = clamp(love + 3, 0, 10)\ninit python:\n    def clamp(value, low, high):\n        return max(low, min(high, value))\n'],
  'cu.ex.code.style': [
    '# Пример стиля: крупнее текст выбора и подсветка при наведении.\nstyle choice_button_text:\n    size 34\n    hover_color "#ffd479"\n',
    '# An example style: a bigger choice text and a highlight on hover.\nstyle choice_button_text:\n    size 34\n    hover_color "#ffd479"\n'],
  /* проверки при сборке */
  'cu.l.tab': ['Свой код, файл «{0}»: табуляция в отступах ({1} стр., первая {2}). Ren\'Py не принимает табуляцию.', 'Custom code, file “{0}”: tab characters in the indent ({1} lines, first at {2}). Ren\'Py does not accept tabs.'],
  'cu.fix.tab': ['Заменить табуляцию пробелами', 'Replace tabs with spaces'],
  'cu.l.indent': ['Свой код, файл «{0}»: код начинается с отступа (строка {1}). Верхний уровень Ren\'Py пишется без отступа.', 'Custom code, file “{0}”: the code starts with an indent (line {1}). The Ren\'Py top level is written without indent.'],
  'cu.fix.indent': ['Убрать общий отступ', 'Remove the common indent'],
  'cu.l.tq': ['Свой код, файл «{0}»: не закрыты тройные кавычки.', 'Custom code, file “{0}”: triple quotes are not closed.'],
  'cu.l.dup': ['Свой код: «{0}» определён дважды ({1}).', 'Custom code: “{0}” is defined twice ({1}).'],
  'cu.l.regchar': ['Свой код, файл «{1}»: персонаж «{0}» уже есть в реестре, а файл определяет его ещё раз. Оставьте одно определение.', 'Custom code, file “{1}”: the character “{0}” is already in the registry and the file defines it again. Keep one definition.'],
  'cu.l.regvar': ['Свой код, файл «{1}»: переменная «{0}» уже есть в реестре, а файл определяет её ещё раз. Оставьте одно определение.', 'Custom code, file “{1}”: the variable “{0}” is already in the registry and the file defines it again. Keep one definition.'],
  'cu.l.label': ['Свой код, файл «{1}»: метка «{0}» есть и в нём, и в главах. Ren\'Py не примет две одинаковые метки.', 'Custom code, file “{1}”: the label “{0}” is both in it and in the chapters. Ren\'Py does not accept two identical labels.'],
  'cu.l.screen': ['Свой код, файл «{1}»: экран «{0}» уже пишет сборка (game/{2}). Оставьте одно определение.', 'Custom code, file “{1}”: the screen “{0}” is already written by the build (game/{2}). Keep one definition.'],
  'cu.l.renamed': ['Свой код: файл «{0}» назван так же, как файл сборки, записан как game/{1}.', 'Custom code: the file “{0}” has the same name as a build file, written as game/{1}.'],
  'cu.l.std': ['Свой код: game/{0}.rpy заменит стандартный файл Ren\'Py с таким именем, если положить игру в готовый проект.', 'Custom code: game/{0}.rpy replaces the standard Ren\'Py file of this name if you put the game into an existing project.'],
  'cu.l.empty': ['Свой код: файл «{0}» пустой, в игру не записан.', 'Custom code: the file “{0}” is empty and was not written.'],
  'cu.l.done': ['Свой код: записано файлов {0} (game/, как есть).', 'Custom code: files written {0} (game/, as they are).'],
  /* импорт .rpy */
  'cu.imp.same': ['Файл «{0}» уже есть в «Своём коде» с тем же текстом: пропущен.', 'The file “{0}” already exists in “Custom code” with the same text: skipped.'],
  'cu.same.file': ['дважды в файле «{0}»', 'twice in the file “{0}”'],
  'cu.src': ['Свой код: {0}', 'Custom code: {0}'],
  'cu.imp.note': ['Из {0}', 'From {0}'],
});

const CC_MAX_FILES = 60, CC_MAX_LEN = 400000;
/** Имена файлов, которые пишет сама сборка. */
const CC_RESERVED = new Set(['script', 'characters', 'credits', 'variables', 'endings', 'effects', 'assets', 'gui_custom', 'gallery', 'musicroom', 'achievements', 'languages']);
/** Стандартные файлы Ren'Py: заменить их можно, но стоит знать об этом. */
const CC_STANDARD = new Set(['gui', 'options', 'screens']);
/** Экраны, которые пишет сборка: имя экрана → файл. */
const CC_OWN_SCREENS = { cg_gallery: 'gallery.rpy', music_room: 'musicroom.rpy', achievements: 'achievements.rpy', vn_ach_popup: 'achievements.rpy' };

/** Приводит имя к виду, допустимому в имени файла игры: латиница, цифры, «_» и «-». */
function ccSlug(s) {
  const base = String(s == null ? '' : s).trim().replace(/^.*[\\/]/, '').replace(/\.rpy$/i, '');
  return base.replace(/[^A-Za-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'code';
}
const ccList = () => P.code || (P.code = []);
/** Свободное имя: к занятому добавляется _2, _3… */
function ccFreeName(want, except) {
  const used = new Set(ccList().filter(c => c !== except).map(c => c.name.toLowerCase()));
  let n = ccSlug(want), k = 2; const b = n;
  while (used.has(n.toLowerCase())) n = b + '_' + (k++);
  return n;
}
const ccNorm = text => String(text == null ? '' : text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
/** Добавляет файл в проект. Возвращает файл или null, если там уже есть такой же (то же имя и тот же текст). */
function ccAdd(o) {
  o = o || {};
  const text = ccNorm(o.text).slice(0, CC_MAX_LEN), want = ccSlug(o.name);
  if (ccList().some(c => c.name.toLowerCase() === want.toLowerCase() && ccNorm(c.text).trim() === text.trim())) return null;
  if (ccList().length >= CC_MAX_FILES) return null;
  const c = { id: uid('o'), name: ccFreeName(want), text, on: o.on !== false, note: String(o.note || '').slice(0, 300), at: Date.now() };
  ccList().push(c); if (!o.silent) commit(true);
  return c;
}

/* ---------- разбор: что определяет код ---------- */
/** Тройные кавычки по строкам: возвращает для каждой строки, начинается ли она внутри строкового литерала. */
function ccInString(lines) {
  const res = []; let tq = '';
  for (const l of lines) {
    res.push(!!tq);
    const code = tq ? l : l.replace(/#.*$/, '');
    const re = /"""|'''/g; let m;
    while ((m = re.exec(code))) { if (!tq) tq = m[0]; else if (m[0] === tq) tq = ''; }
  }
  return { flags: res, open: !!tq };
}
/** Что определено в файле: имена для сборки и для проверок. */
function ccScan(text) {
  const r = { names: new Set(), defs: [], chars: new Set(), images: new Set(), imgTags: new Set(), labels: new Set(), screens: new Set() };
  const lines = ccNorm(text).split('\n'), ins = ccInString(lines).flags;
  let inPy = false, pyInd = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (ins[i] || !l.trim() || /^\s*#/.test(l)) continue;
    const ind = /^[ \t]*/.exec(l)[0].length;
    if (ind === 0) {
      inPy = false; pyInd = -1;
      let m;
      if (/^(?:init(?:\s+-?\d+)?\s+)?python(?:\s+[^:]*)?:\s*(?:#.*)?$/.test(l)) { inPy = true; continue; }
      if ((m = /^(define|default)\s+(?:-?\d+\s+)?([A-Za-z_][\w.]*)\s*[+\-]?=\s*(.*)$/.exec(l))) {
        const full = m[2], base = full.split('.')[0];
        r.names.add(base); r.defs.push({ name: full, kind: m[1], line: i + 1 });
        if (full === base && /^Character\s*\(/.test(m[3].trim())) r.chars.add(base);
        continue;
      }
      if ((m = /^transform\s+([A-Za-z_]\w*)/.exec(l))) { r.names.add(m[1]); continue; }
      if ((m = /^screen\s+([A-Za-z_]\w*)/.exec(l))) { r.screens.add(m[1]); continue; }
      if ((m = /^label\s+([A-Za-z_][\w.]*)/.exec(l))) { r.labels.add(m[1]); continue; }
      if ((m = /^layeredimage\s+([A-Za-z_]\w*)/.exec(l))) { r.imgTags.add(m[1]); continue; }
      if ((m = /^image\s+([A-Za-z_]\w*(?:\s+[A-Za-z_]\w*)*)\s*(?:=|:)/.exec(l))) { r.images.add(m[1].replace(/\s+/g, ' ')); continue; }
      if ((m = /^\$\s*([A-Za-z_]\w*)\s*=[^=]/.exec(l))) { r.names.add(m[1]); continue; }
      continue;
    }
    if (inPy) {
      if (pyInd < 0) pyInd = ind;
      if (ind === pyInd) {
        let m;
        if ((m = /^\s*(?:def|class)\s+([A-Za-z_]\w*)/.exec(l))) r.names.add(m[1]);
        else if ((m = /^\s*([A-Za-z_]\w*)\s*=[^=]/.exec(l))) r.names.add(m[1]);
      }
    }
  }
  return r;
}

/** Файлы, которые пойдут в игру, и всё, что в них определено. Вызывается до разбора глав. */
function ccPrepare() {
  const cc = { files: [], names: new Set(), labels: new Set(), images: new Set(), imgTags: new Set() };
  for (const c of (P.code || [])) {
    if (!c || c.on === false) continue;
    const text = ccNorm(c.text), sc = ccScan(text);
    cc.files.push({ c, name: c.name, text, sc });
    for (const n of sc.names) cc.names.add(n);
    for (const n of sc.labels) cc.labels.add(n);
    for (const n of sc.images) cc.images.add(typeof cmpImageName === 'function' ? cmpImageName(n) : n);
    for (const n of sc.imgTags) cc.imgTags.add(n);
  }
  return cc;
}
/** Проверки одного файла: табуляция, отступ в начале, незакрытые тройные кавычки. */
function ccLintFile(f, add) {
  const lines = f.text.split('\n'), ins = ccInString(lines);
  const tabs = []; let firstInd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (ins.flags[i]) continue;
    const l = lines[i];
    if (!l.trim()) continue;
    if (/^[ \t]*\t/.test(l)) tabs.push(i + 1);
    if (firstInd < 0 && !/^\s*#/.test(l)) firstInd = i;
  }
  const c = f.c;
  if (tabs.length) add('warn', t('cu.l.tab', f.name, tabs.length, tabs[0]), null, { label: t('cu.fix.tab'), run: () => { c.text = ccNorm(c.text).replace(/^[ \t]+/gm, ws => ws.replace(/\t/g, '    ')); commit(true); } });
  if (firstInd >= 0 && /^[ \t]/.test(lines[firstInd])) {
    add('warn', t('cu.l.indent', f.name, firstInd + 1), null, { label: t('cu.fix.indent'), run: () => {
      const ls = ccNorm(c.text).split('\n'), pad = Math.min(...ls.filter(x => x.trim()).map(x => /^[ \t]*/.exec(x)[0].length));
      c.text = ls.map(x => x.trim() ? x.slice(pad) : x).join('\n'); commit(true); } });
  }
  if (ins.open) add('warn', t('cu.l.tq', f.name));
}
/** Все проверки и запись файлов в результат сборки. ctx: { charTags, varNames, ownLabels }. */
function ccEmit(cc, R, add, ctx) {
  if (!cc || !cc.files.length) return;
  const taken = new Set(R.files.map(f => f.path.toLowerCase())); taken.add('game/languages.rpy');
  const defsBy = new Map();
  let n = 0;
  for (const f of cc.files) {
    if (!f.text.trim()) { add('info', t('cu.l.empty', f.name)); continue; }
    ccLintFile(f, add);
    for (const d of f.sc.defs) { if (!defsBy.has(d.name)) defsBy.set(d.name, []); defsBy.get(d.name).push(f.name); }
    for (const tag of f.sc.chars) if (ctx.charTags.has(tag)) add('warn', t('cu.l.regchar', tag, f.name));
    for (const d of f.sc.defs) if (!f.sc.chars.has(d.name) && ctx.varNames.has(d.name)) add('warn', t('cu.l.regvar', d.name, f.name));
    for (const lb of f.sc.labels) if (ctx.ownLabels.has(lb)) add('warn', t('cu.l.label', lb, f.name));
    for (const sc of f.sc.screens) { const own = CC_OWN_SCREENS[sc]; if (own && taken.has('game/' + own)) add('warn', t('cu.l.screen', sc, f.name, own)); }
    let path = 'game/' + f.name + '.rpy';
    if (taken.has(path.toLowerCase()) || CC_RESERVED.has(f.name.toLowerCase())) {
      const b = 'custom_' + f.name; let k = 2, p = 'game/' + b + '.rpy';
      while (taken.has(p.toLowerCase())) p = 'game/' + b + '_' + (k++) + '.rpy';
      add('info', t('cu.l.renamed', f.name, p.slice(5))); path = p;
    }
    taken.add(path.toLowerCase());
    if (CC_STANDARD.has(f.name.toLowerCase())) add('info', t('cu.l.std', f.name.toLowerCase()));
    R.files.push({ path, text: f.text.replace(/\s+$/, '') + '\n', custom: true });
    n++;
  }
  for (const [name, files] of defsBy) if (files.length > 1) add('warn', t('cu.l.dup', name, files.length === 2 && files[0] === files[1] ? t('cu.same.file', files[0]) : [...new Set(files)].join(', ')));
  if (n) add('info', t('cu.l.done', n));
}

/* ---------- окно ---------- */
let CCW = null;
function openCustomCode(selId) {
  closePopover();
  const st = { sel: selId || ((ccList()[0] || {}).id) || null };
  let pend = null;
  const flush = () => { if (pend) { clearTimeout(pend); pend = null; commit(true); } };
  return openModal({
    cls: 'cu-m', onClose: () => { flush(); CCW = null; },
    build: m => {
      const body = h('div', { class: 'cu-body' });
      CCW = { m, body };
      const cur = () => ccList().find(c => c.id === st.sel) || null;
      const addEx = k => {
        const c = ccAdd({ name: t('cu.ex.name.' + k), text: t('cu.ex.code.' + k) });
        if (!c) { toast(t('cu.up.same', t('cu.ex.name.' + k))); return; }
        st.sel = c.id; toast(t('cu.added', c.name)); paint();
      };
      const paintList = () => {
        const list = ccList();
        const col = h('div', { class: 'cu-list' });
        if (!list.length) col.append(h('div', { class: 'empty small' }, t('cu.empty')));
        for (const c of list) {
          const lines = c.text ? c.text.split('\n').length : 0;
          col.append(h('div', { class: 'cu-row' + (c.id === st.sel ? ' sel' : '') + (c.on === false ? ' off' : ''), 'data-id': c.id, onclick: () => { flush(); st.sel = c.id; paint(); } },
            h('div', { class: 'cu-rn' }, h('b', c.name + '.rpy'), h('span', { class: 'hint' }, t('cu.stat', lines, c.text.length))),
            (() => { const sw = switchEl(c.on !== false, v => { c.on = v; commit(true); paint(); }, null); sw.addEventListener('click', e => e.stopPropagation()); return sw; })()));
        }
        return col;
      };
      const paintEdit = () => {
        const c = cur();
        if (!c) return h('div', { class: 'cu-edit' }, h('div', { class: 'empty small' }, t('cu.empty')));
        const nameInp = h('input', { class: 'inp mono', id: 'cu-f-name', type: 'text', value: c.name, maxlength: '40' });
        const pathHint = h('div', { class: 'hint', id: 'cu-f-path' }, t('cu.f.name.h', c.name));
        nameInp.addEventListener('input', () => { pathHint.textContent = t('cu.f.name.h', ccSlug(nameInp.value)); });
        nameInp.addEventListener('change', () => {
          const nn = ccFreeName(nameInp.value, c);
          if (nn !== c.name) { c.name = nn; commit(true); }
          nameInp.value = c.name; pathHint.textContent = t('cu.f.name.h', c.name); paintListOnly();
        });
        const ta = h('textarea', { class: 'ta mono cu-code', id: 'cu-f-code', rows: 18, spellcheck: 'false', wrap: 'off', autocapitalize: 'off', autocomplete: 'off' });
        ta.value = c.text;
        const stat = h('div', { class: 'hint', id: 'cu-stat' }), found = h('div', { class: 'hint', id: 'cu-found' });
        const upd = () => {
          const sc = ccScan(ta.value);
          stat.textContent = t('cu.stat', ta.value ? ta.value.split('\n').length : 0, ta.value.length);
          found.textContent = t('cu.found', sc.screens.size, sc.labels.size, sc.defs.length, sc.images.size);
        };
        ta.addEventListener('input', () => { c.text = ta.value.slice(0, CC_MAX_LEN); upd(); clearTimeout(pend); pend = setTimeout(() => { pend = null; commit(true); paintListOnly(); }, 500); });
        ta.addEventListener('blur', () => { flush(); });
        ta.addEventListener('keydown', ev => {
          if (ev.key !== 'Tab' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
          ev.preventDefault();
          const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
          const ls = v.lastIndexOf('\n', s - 1) + 1;
          if (s === e && !ev.shiftKey) { ta.setRangeText('    ', s, e, 'end'); }
          else {
            const le = (() => { const k = v.indexOf('\n', e); return k < 0 ? v.length : k; })();
            const block = v.slice(ls, le).split('\n').map(x => ev.shiftKey ? x.replace(/^ {1,4}/, '') : '    ' + x).join('\n');
            ta.setRangeText(block, ls, le, 'select');
          }
          ta.dispatchEvent(new Event('input'));
        });
        upd();
        const note = h('input', { class: 'inp', id: 'cu-f-note', type: 'text', value: c.note || '', maxlength: '300' });
        note.addEventListener('change', () => { c.note = note.value.trim().slice(0, 300); commit(true); });
        return h('div', { class: 'cu-edit' },
          h('div', { class: 'grid2' }, field(t('cu.f.name'), nameInp, null), field(t('cu.f.note'), note)), pathHint,
          h('div', { class: 'cu-sw' }, switchEl(c.on !== false, v => { c.on = v; commit(true); paint(); }, t('cu.f.on')), c.on === false ? h('span', { class: 'hint' }, t('cu.f.off')) : null),
          field(t('cu.f.code'), ta, t('cu.f.code.h')), h('div', { class: 'cu-meta' }, stat, found),
          h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm danger', id: 'cu-del', onclick: async () => {
            if (!await confirmDlg({ title: t('cu.del.q'), text: t('cu.del.t', c.name), ok: t('cu.del'), danger: true })) return;
            P.code = ccList().filter(x => x !== c); st.sel = (ccList()[0] || {}).id || null; commit(true); paint();
          } }, icon('trash', 14), t('cu.del'))));
      };
      let listHost = null;
      const paintListOnly = () => { if (listHost && listHost.isConnected) listHost.replaceWith(listHost = paintList()); };
      const paint = () => {
        listHost = paintList();
        const sel = h('select', { class: 'inp sm', id: 'cu-ex', 'aria-label': t('cu.ex') }, h('option', { value: '' }, t('cu.ex')), ...['screen', 'python', 'style'].map(k => h('option', { value: k }, t('cu.ex.' + k))));
        sel.addEventListener('change', () => { if (sel.value) addEx(sel.value); });
        body.replaceChildren(
          h('p', { class: 'hint' }, t('cu.lead')),
          h('div', { class: 'cu-tools' },
            h('button', { class: 'btn primary', id: 'cu-new', onclick: () => { flush(); const c = ccAdd({ name: 'custom', text: '' }); if (!c) return; st.sel = c.id; paint(); setTimeout(() => { const x = body.querySelector('#cu-f-code'); if (x) x.focus(); }, 30); } }, icon('plus', 15), t('cu.new')),
            h('button', { class: 'btn', id: 'cu-up', onclick: () => pickFiles('.rpy,.txt,text/plain', true, async fl => {
              let n = 0, same = [];
              for (const f of fl) { const c = ccAdd({ name: f.name, text: await f.text(), note: t('cu.imp.note', f.name) }); if (c) { n++; st.sel = c.id; } else same.push(f.name); }
              toast(n ? t('cu.up.done', n) : t('cu.up.same', same.join(', '))); paint();
            }) }, icon('upload', 15), t('cu.upload')), sel),
          h('div', { class: 'cu-main' }, listHost, paintEdit()));
      };
      paint();
      const mh = modalHead(t('cu.title'), m); if (typeof satHeadBtn === 'function') satHeadBtn(m, mh, 'code');
      return h('div', { class: 'm-wrap' }, mh, body);
    }
  });
}
TOOL_ITEMS.push({ id: 'customcode', group: 'story', ic: 'code', key: 'cu.btn', kw: 'custom code screen screens init python style styles define own file rpy minigame inventory screen свой код экран экраны инициализация питон стиль стили файл rpy вставить кастомный код вне меток собственный', run: () => openCustomCode() });

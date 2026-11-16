'use strict';
/* ====== Мини-Lint: типичные ошибки сценария до сборки ======
   Настоящий Ren'Py проверит всё сам (вкладка «Запуск в Ren'Py» → «Проверить (lint)»), но только в программе для компьютера
   и только после записи игры. Эта проверка работает везде и сразу: смотрит скрипты глав и находит то, из-за чего Ren'Py
   остановится или покажет мусор: незакрытые кавычки, типографские кавычки из Word и Docs, неразрывные пробелы в отступах,
   лишние или недостающие отступы, пропущенное двоеточие, «=» вместо «==», незакрытые скобки и текстовые теги.
   Правила осторожные: лучше пропустить спорный случай, чем завалить автора ложными тревогами. Блоки python, init, screen, transform,
   style и подобные (внутри них другой язык) проверяются только на кавычки, скобки и странные пробелы.
   Результат: список находок {line, code, level, text, fix}; сборка кладёт их в отчёт, у части есть кнопка «Исправить». */

Object.assign(D, {
  'ml.nbsp': ['Строка {0}: неразрывный или другой необычный пробел вне текста реплики. Ren\'Py его не поймёт. Из Word и Docs он попадает при вставке: {1}', 'Line {0}: a non-breaking or unusual space outside the line text. Ren\'Py will not understand it. It usually comes from pasting from Word or Docs: {1}'],
  'ml.curly': ['Строка {0}: типографские кавычки вместо прямых ". Ren\'Py не примет такую строку: {1}', 'Line {0}: typographic quotes instead of straight ". Ren\'Py will reject this line: {1}'],
  'ml.unclosed': ['Строка {0}: кавычка открыта и нигде не закрыта: {1}', 'Line {0}: a quote is opened and never closed: {1}'],
  'ml.multiline': ['Строка {0}: реплика в кавычках продолжается на следующих строках. Чаще всего это пропущенная закрывающая кавычка: {1}', 'Line {0}: a quoted line continues on the next lines. Most often a closing quote is missing: {1}'],
  'ml.bracket': ['Строка {0}: в тексте есть «[» без закрывающей «]». Для самой скобки пишут «[[»: {1}', 'Line {0}: the text has "[" without a closing "]". To show the bracket itself write "[[": {1}'],
  'ml.tagmis': ['Строка {0}: закрывающий тег {1} не совпадает с открытым', 'Line {0}: the closing tag {1} does not match the open one'],
  'ml.tagopen': ['Строка {0}: тег {1} открыт и не закрыт в этой реплике', 'Line {0}: the tag {1} is opened and not closed in this line'],
  'ml.brace': ['Строка {0}: «{» в тексте без закрывающей «}». Чтобы показать саму скобку, пишите «{{»: {1}', 'Line {0}: "{" in the text has no closing "}". To show the brace itself write "{{": {1}'],
  'ml.colon': ['Строка {0}: после «{1}» нужно двоеточие: {2}', 'Line {0}: "{1}" must end with a colon: {2}'],
  'ml.noblock': ['Строка {0}: после двоеточия нет вложенных строк. Добавьте действие или «pass»: {1}', 'Line {0}: nothing is indented under the colon. Add an action or "pass": {1}'],
  'ml.indent': ['Строка {0}: лишний отступ (перед этим не было строки с двоеточием): {1}', 'Line {0}: unexpected indent (the line before it has no colon): {1}'],
  'ml.dedent': ['Строка {0}: отступ не совпадает ни с одним из предыдущих уровней: {1}', 'Line {0}: the indent matches none of the previous levels: {1}'],
  'ml.eq': ['Строка {0}: в условии одиночное «=». Для сравнения нужно «==»: {1}', 'Line {0}: a single "=" in a condition. Comparison needs "==": {1}'],
  'ml.paren': ['Строка {0}: скобки не сходятся: {1}', 'Line {0}: the brackets do not match: {1}'],
  'ml.unknown': ['Строка {0}: не похоже на команду Ren\'Py. Обычный текст оформляется как реплика в кавычках: {1}', 'Line {0}: this does not look like a Ren\'Py command. Plain text must be written as a line in quotes: {1}'],
  'ml.dollar': ['Строка {0}: присваивание без «$» в начале: {1}', 'Line {0}: an assignment without "$" at the start: {1}'],
  'ml.more': ['…и ещё {0} находок такого рода в этой главе', '…and {0} more findings of this kind in this chapter'],
  'ml.fix': ['Исправить в главе', 'Fix in this chapter'],
});

const ML_KEYWORDS = new Set(['label', 'scene', 'show', 'hide', 'with', 'jump', 'call', 'return', 'menu', 'if', 'elif', 'else', 'while', 'for', 'pass', 'python', 'init', 'define', 'default',
  'image', 'transform', 'screen', 'style', 'play', 'stop', 'queue', 'voice', 'window', 'pause', 'nvl', 'translate', 'camera', 'expression', 'layeredimage', 'extend', 'centered', 'rpy',
  'renpy', 'config', 'gui', 'persistent', 'store', 'at', 'as', 'onlayer', 'behind', 'zorder', 'sound', 'music', 'audio', 'testcase', 'older', 'newer', 'break', 'continue', 'class', 'def', 'try', 'except', 'import', 'from', 'global', 'in', 'not', 'and', 'or']);
const ML_FOREIGN = new Set(['python', 'init', 'screen', 'transform', 'style', 'image', 'layeredimage', 'translate', 'testcase', 'define', 'default', 'camera', 'class', 'def']);   // внутри блоков после них другой язык
const ML_PAIRED = new Set(['b', 'i', 'u', 's', 'plain', 'a', 'color', 'size', 'font', 'alpha', 'outlinecolor', 'k', 'rb', 'rt', 'cps', 'art', 'noalt', 'shader']);
const ML_UNI_SP = '\\u00A0\\u1680\\u2000-\\u200B\\u202F\\u205F\\u3000\\uFEFF';
const ML_RE_UNI = new RegExp('[' + ML_UNI_SP + ']');
const ML_RE_UNI_INDENT = new RegExp('^ *[\\t' + ML_UNI_SP + ']');
const ML_RE_CURLY = /[“”„«»‘]/;

const mlTrim = (s, n) => { s = String(s || '').trim().replace(/\s+/g, ' '); return s.length > (n || 70) ? s.slice(0, (n || 70) - 1) + '…' : s; };

/** Разбор строк: где строки в кавычках, что остаётся «кодом» вне их. Возвращает записи по строкам. */
function mlScan(lines) {
  const recs = lines.map((raw, i) => ({ i, raw, code: '', strs: [], skip: false, comment: false, find: [] }));
  let tri = null;                                           // открытая тройная кавычка: { q, line }
  for (let li = 0; li < lines.length; li++) {
    const r = recs[li], line = lines[li];
    let k = 0;
    if (tri) {
      r.skip = true;
      const end = line.indexOf(tri.q);
      if (end < 0) continue;
      tri = null; k = end + 3; r.code = '""';
    }
    while (k < line.length) {
      const c = line[k];
      if (c === '#') break;
      if (c === '"' || c === "'") {
        if (line.substr(k, 3) === c.repeat(3)) {              // тройная кавычка (docstring, многострочный python)
          const end = line.indexOf(c.repeat(3), k + 3);
          if (end < 0) { tri = { q: c.repeat(3), line: li }; r.code += '""'; k = line.length; break; }
          r.code += '""'; k = end + 3; continue;
        }
        let j = k + 1, buf = '', closed = false;
        while (j < line.length) {
          if (line[j] === '\\') { buf += line[j] + (line[j + 1] || ''); j += 2; continue; }
          if (line[j] === c) { closed = true; break; }
          buf += line[j]; j++;
        }
        if (closed) { r.strs.push({ text: buf, line: li }); r.code += '""'; k = j + 1; continue; }
        /* строка не закрылась до конца строки: ищем закрытие в ближайших 5 строках (Ren'Py допускает длинные реплики в несколько строк) */
        let found = -1;
        for (let a = li + 1; a < Math.min(lines.length, li + 6) && found < 0; a++) {
          const L = lines[a]; let q = 0;
          while (q < L.length) { if (L[q] === '\\') { q += 2; continue; } if (L[q] === c) { found = a; break; } q++; }
        }
        if (found >= 0) { r.find.push({ code: 'multiline', line: li }); r.code += '""'; for (let a = li + 1; a <= found; a++) recs[a].skip = true; const L = lines[found]; let q = 0; while (q < L.length) { if (L[q] === '\\') { q += 2; continue; } if (L[q] === c) break; q++; } recs[found].code = (recs[found].code || '') + L.slice(q + 1).replace(/#.*$/, ''); k = line.length; break; }
        r.find.push({ code: 'unclosed', line: li }); r.code += '""'; k = line.length; break;
      }
      r.code += c; k++;
    }
    if (!r.code.trim() && !r.strs.length && !r.skip) r.comment = !line.trim() || line.trim()[0] === '#';
  }
  if (tri) recs[tri.line].find.push({ code: 'unclosed', line: tri.line });
  return recs;
}

/** Бессмысленно искать «=» вместо «==» внутри скобок и строк: возвращает true, если в условии есть одиночное «=». */
function mlLoneEq(cond) {
  let depth = 0;
  for (let i = 0; i < cond.length; i++) {
    const c = cond[i];
    if (c === '(' || c === '[' || c === '{') depth++; else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === '=' && depth === 0) {
      const p = cond[i - 1] || '', n = cond[i + 1] || '';
      if (n === '=') { i++; continue; }
      if ('=!<>:+-*/%&|^@'.includes(p)) continue;
      return true;
    }
  }
  return false;
}
function mlBalance(code) {
  let d = 0;
  const st = [];
  for (const c of code) {
    if (c === '(' || c === '[' || c === '{') st.push(c);
    else if (c === ')' || c === ']' || c === '}') { const o = st.pop(); if (!o || '([{'.indexOf(o) !== ')]}'.indexOf(c)) return { bad: true, open: 0 }; }
  }
  return { bad: false, open: st.length };
}

/** Проверка тегов и скобок в тексте одной реплики. Возвращает список находок без номера строки. */
function mlText(text) {
  const out = [];
  let s = String(text).replace(/\[\[/g, '').replace(/\{\{/g, '');
  let sq = s, was;
  do { was = sq; sq = sq.replace(/\[[^\[\]]*\]/g, ''); } while (sq !== was);
  if (sq.indexOf('[') >= 0) out.push({ code: 'bracket' });
  const stack = []; let m; const re = /\{(\/?)([A-Za-z]*)([^{}]*)\}/g, rest = s.replace(re, (all, slash, name) => {
    if (!name) { if (slash && stack.length) stack.pop(); return ''; }
    if (!ML_PAIRED.has(name)) return '';
    if (!slash) stack.push(name);
    else if (!stack.length || stack[stack.length - 1] !== name) { out.push({ code: 'tagmis', arg: '{/' + name + '}' }); if (stack.includes(name)) while (stack.pop() !== name); }
    else stack.pop();
    return '';
  });
  if (rest.indexOf('{') >= 0) out.push({ code: 'brace' });
  if (stack.length) out.push({ code: 'tagopen', arg: '{' + stack[stack.length - 1] + '}' });
  return out;
}

function mlSayLike(code) {
  const c = code.trim();
  if (!c || c[0] === '$') return false;
  if (/^""/.test(c)) return true;                                           // реплика рассказчика или пункт выбора
  const m = /^([A-Za-z_][\w.]*)((?:\s+[A-Za-z_][\w.@]*)*)\s+""/.exec(c);
  return !!(m && !ML_KEYWORDS.has(m[1]));
}

/** Исправление типографских кавычек в одной строке; null, если форма строки непонятна. */
function mlFixCurly(line) {
  const m = /^(\s*(?:[^\s“”„«»"'#]+\s+)*)([“„«])(.*)([”“»])(\s*(?:with\s+[\w.]+\s*)?:?\s*)$/.exec(line);
  if (!m) return null;
  return m[1] + '"' + m[3].replace(/(^|[^\\])"/g, '$1\\"') + '"' + m[5];
}
function mlFixSpaces(line) {
  let s = line.replace(/^[ \t   -​  　﻿]+/, m => m.replace(/\t/g, '    ').replace(new RegExp('[' + ML_UNI_SP + ']', 'g'), ' '));
  const i = s.search(/["'#]/);
  const head = i < 0 ? s : s.slice(0, i), tail = i < 0 ? '' : s.slice(i);
  return head.replace(new RegExp('[' + ML_UNI_SP + ']', 'g'), ' ') + tail;
}
function mlFixDollar(line) {
  const m = /^(\s*)([A-Za-z_][\w.]*(?:\[[^\]]*\])?\s*(?:[-+*\/]?=)(?!=).*)$/.exec(line);
  return m && !/^\s*(?:define|default)\b/.test(line) ? m[1] + '$ ' + m[2] : null;
}

/** Главная функция: список находок по строкам скрипта. lines — строки без переводов строки. */
function mlLint(lines) {
  const recs = mlScan(lines), out = [];
  const add = (r, code, level, extra) => out.push(Object.assign({ line: r.i + 1, code, level, text: lines[r.i] }, extra || {}));
  const stack = [];                                        // уровни отступов
  let prev = null, foreign = -1, open = null, openAt = null;
  for (const r of recs) {
    const raw = r.raw;
    for (const f of r.find) add(r, f.code, f.code === 'unclosed' ? 'error' : 'warn');
    if (r.skip || r.comment) continue;
    if (ML_RE_UNI_INDENT.test(raw) || ML_RE_UNI.test(r.code)) add(r, 'nbsp', 'error', { fix: mlFixSpaces });
    const ind = /^ */.exec(raw)[0].length, code = r.code.trim();
    if (!code && !r.strs.length) continue;
    if (ML_RE_CURLY.test(r.code)) add(r, 'curly', 'error', { fix: mlFixCurly(raw) !== null ? mlFixCurly : null });
    /* продолжение строки в скобках: отступы не проверяем */
    if (open) {
      const bal = mlBalance(open.code + ' ' + code);
      open.code += ' ' + code;
      if (bal.bad) { add(r, 'paren', 'error'); open = null; }
      else if (!bal.open) open = null;
      continue;
    }
    /* внутри чужого языка (python, screen, transform…) отступы и ключевые слова не проверяем */
    if (foreign >= 0) { if (ind > foreign) { if (prev) prev.opener = false; continue; } foreign = -1; }
    /* отступы */
    if (!stack.length) stack.push(ind);
    else if (ind > stack[stack.length - 1]) {
      if (prev && prev.opener) stack.push(ind); else { add(r, 'indent', 'error'); stack.push(ind); }
    } else if (ind < stack[stack.length - 1]) {
      while (stack.length && ind < stack[stack.length - 1]) stack.pop();
      if (!stack.length || stack[stack.length - 1] !== ind) { add(r, 'dedent', 'error'); stack.push(ind); }
    }
    if (prev && prev.opener && ind <= prev.ind) add(prev.r, 'noblock', 'error');
    /* что за команда */
    const first = (/^[A-Za-z_][\w]*/.exec(code) || [''])[0];
    const endsColon = /:\s*$/.test(code);
    const b = mlBalance(code);
    if (b.bad) add(r, 'paren', 'error');
    else if (b.open) { open = { code, r }; }
    let opener = false;
    if (first === 'python' || (first === 'init' && /python|:$/.test(code)) || ML_FOREIGN.has(first) && endsColon) { if (endsColon) { foreign = ind; opener = true; } }
    else if (['if', 'elif', 'while', 'else', 'menu', 'label'].includes(first)) {
      if (!endsColon && !b.open) add(r, 'colon', 'error', { extra: first });
      opener = endsColon;
      if ((first === 'if' || first === 'elif' || first === 'while') && endsColon) { const cond = code.replace(/^\w+/, '').replace(/:\s*$/, ''); if (mlLoneEq(cond)) add(r, 'eq', 'error'); }
    } else if (/^""/.test(code) && endsColon) opener = true;                  // пункт выбора
    else if (first === 'for' && endsColon) opener = true;
    else if (endsColon) opener = true;
    /* текст реплик */
    if (mlSayLike(code)) for (const s of r.strs) for (const x of mlText(s.text)) add(r, x.code, x.code === 'tagmis' || x.code === 'brace' ? 'error' : 'warn', { arg: x.arg });
    /* неизвестная команда */
    if (foreign < 0 && !r.strs.length && !r.find.length && first && !ML_KEYWORDS.has(first) && code[0] !== '$' && code[0] !== '@' && !opener && !b.open && ind >= 0) {
      const asg = mlFixDollar(raw);
      if (asg) add(r, 'dollar', 'warn', { fix: mlFixDollar });
      else if (!/^[A-Za-z_][\w.]*\s*\(/.test(code)) add(r, 'unknown', 'warn');
    } else if (!first && !r.strs.length && !r.find.length && code[0] !== '$' && code[0] !== '@' && /^[^\s#]/.test(code) && !b.open && foreign < 0 && !/^[-+*\/=<>!(){}\[\]:,.\d]/.test(code)) add(r, 'unknown', 'warn');
    prev = { r, ind, opener };
  }
  if (prev && prev.opener) add(prev.r, 'noblock', 'error');
  if (open) add(open.r, 'paren', 'error');
  return out;
}

/** Текст находки для отчёта. */
function mlMessage(f) {
  const q = mlTrim(f.text);
  switch (f.code) {
    case 'tagmis': case 'tagopen': return t('ml.' + f.code, f.line, f.arg);
    case 'colon': return t('ml.colon', f.line, f.extra, q);
    case 'nbsp': return t('ml.nbsp', f.line, JSON.stringify(q).slice(1, -1).replace(new RegExp('[' + ML_UNI_SP + ']', 'g'), '␣'));
    case 'indent': case 'dedent': case 'noblock': case 'eq': case 'paren': case 'unknown': case 'dollar': case 'curly': case 'unclosed': case 'multiline': case 'bracket': case 'brace':
      return t('ml.' + f.code, f.line, q);
    default: return t('ml.' + f.code, f.line, q);
  }
}

/** Кладёт находки мини-Lint в отчёт сборки. Однотипное по главе сворачивается: показываются первые шесть, остальные числом. */
const ML_SHOW = 6;
function mlReport(add, node, file, lines, lead) {
  let found = [];
  try { found = mlLint(lines); } catch (e) { return; }                      // проверка никогда не должна ломать сборку
  if (!found.length) return;
  const by = new Map();
  for (const x of found) { x.line += lead; if (!by.has(x.code)) by.set(x.code, []); by.get(x.code).push(x); }
  const ref = { node, file };
  for (const [code, arr] of by) {
    const fn = (arr.find(x => x.fix) || {}).fix;
    const texts = new Set(arr.filter(x => x.fix).map(x => x.text));
    const fix = fn ? { label: t('ml.fix'), run: () => {
      file.script = String(file.script || '').replace(/\r\n?/g, '\n').split('\n').map(l => {
        const k = l.replace(/\t/g, '    ').replace(/\s+$/, '');
        if (!texts.has(k)) return l;
        const r = fn(k); return r == null ? l : r;
      }).join('\n');
      commit(true);
    } } : null;
    arr.slice(0, ML_SHOW).forEach((x, i) => add(x.level, mlMessage(x), ref, i === 0 ? fix : null));
    if (arr.length > ML_SHOW) add('info', t('ml.more', arr.length - ML_SHOW), ref);
  }
}

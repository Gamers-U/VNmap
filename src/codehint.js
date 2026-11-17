'use strict';
/* ====== Подсказки для редактора кода: что предложить на месте курсора (окно «Редактор кода», ide.js; движок списка в codeedit.js) ======
   chHint(ctx, env) возвращает список { label, insert?, kind, detail?, pri?, mark? } или объект { items, prefix, from } (когда заменять нужно больше, чем слово слева от курсора).
   ctx приходит от движка (см. codeedit.js, «подсказки»), env даёт имена проекта:
     env.labels() → [{ name, detail }], env.chars() → [{ tag, name }], env.vars() → [{ name, detail }],
     env.images() → [{ name, tag, attrs }], env.audio() → [путь относительно game], env.transforms() → [имя].
   Для Ren'Py подсказка зависит от места: после jump/call метки, после show/scene картинки и их атрибуты, после play звуки, после $ и if переменные,
   в начале строки команды и теги героев, внутри текста реплики только `[переменные]` и `{теги}`; в блоке python: слова Python. Остальное: слова из самого файла.
   Правила простые и без разбора всего файла: ошибиться можно только в сторону «ничего не предложить». */

Object.assign(D, {
  'ch.label': ['метка', 'label'], 'ch.char': ['герой', 'character'], 'ch.var': ['переменная', 'variable'], 'ch.img': ['картинка', 'image'], 'ch.audio': ['звук', 'audio'],
  'ch.kw': ['команда', 'command'], 'ch.tag': ['тег текста', 'text tag'], 'ch.trans': ['переход', 'transition'], 'ch.pos': ['позиция', 'position'], 'ch.attr': ['вид', 'attribute'],
  'ch.chan': ['канал', 'channel'], 'ch.word': ['слово из файла', 'word from the file'], 'ch.fn': ['функция', 'function'],
});

const CH_RPY_STMT = ['label', 'jump', 'call', 'return', 'scene', 'show', 'hide', 'with', 'play', 'stop', 'queue', 'menu', 'if', 'elif', 'else', 'while', 'for', 'pass', 'define', 'default', 'init', 'python', 'screen', 'transform', 'image', 'style', 'translate', 'pause', 'window', 'voice', 'nvl', 'extend', 'camera', 'centered', 'layeredimage', 'testcase'];
const CH_RPY_AFTER_SHOW = ['at', 'as', 'behind', 'with', 'onlayer', 'zorder'];
const CH_RPY_POS = ['left', 'right', 'center', 'truecenter', 'topleft', 'top', 'topright', 'offscreenleft', 'offscreenright', 'default', 'reset'];
const CH_RPY_TRANS = ['dissolve', 'fade', 'move', 'moveinright', 'moveinleft', 'moveintop', 'moveinbottom', 'moveoutright', 'moveoutleft', 'moveouttop', 'moveoutbottom', 'ease', 'easeinright', 'easeinleft', 'easeintop', 'easeinbottom', 'zoomin', 'zoomout', 'zoominout', 'vpunch', 'hpunch', 'blinds', 'squares', 'wipeleft', 'wiperight', 'wipeup', 'wipedown', 'slideleft', 'slideright', 'slideup', 'slidedown', 'pixellate', 'irisin', 'irisout', 'None'];
const CH_RPY_CHANNELS = ['music', 'sound', 'audio', 'voice'];
const CH_RPY_TAGS = ['i', 'b', 'u', 's', 'plain', 'color=', 'size=', 'font=', 'alpha=', 'k=', 'cps=', 'a=', 'image=', 'space=', 'vspace=', 'rt', 'rb', 'w', 'p', 'nw', 'fast', 'clear', 'done', 'art'];
const CH_RPY_CLOSE = ['i', 'b', 'u', 's', 'plain', 'color', 'size', 'font', 'alpha', 'k', 'cps', 'a', 'rt', 'rb', 'art'];
const CH_RPY_SCREEN = ['vbox', 'hbox', 'frame', 'text', 'textbutton', 'imagebutton', 'button', 'add', 'fixed', 'grid', 'viewport', 'vpgrid', 'bar', 'vbar', 'key', 'timer', 'input', 'side', 'null', 'mousearea', 'drag', 'draggroup', 'showif', 'imagemap', 'hotspot', 'use', 'on', 'action', 'style', 'xalign', 'yalign', 'xpos', 'ypos', 'xsize', 'ysize', 'spacing', 'padding', 'background', 'foreground', 'if', 'elif', 'else', 'for', 'tag', 'zorder', 'modal', 'layer', 'default', 'transclude', 'predict'];
const CH_PY = ['def', 'class', 'lambda', 'return', 'yield', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from', 'as', 'pass', 'break', 'continue', 'raise', 'assert', 'del', 'global', 'nonlocal', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple', 'bool', 'min', 'max', 'sum', 'abs', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'isinstance', 'round', 'any', 'all', 'self', 'super'];
const CH_RPY_PY = ['renpy.', 'config.', 'gui.', 'persistent.', 'store.', 'preferences.', 'renpy.random', 'renpy.say', 'renpy.jump', 'renpy.call', 'renpy.pause', 'renpy.music.play', 'renpy.notify', 'renpy.show', 'renpy.hide', 'renpy.restart_interaction', 'renpy.store', 'Character', 'DynamicCharacter', 'Dissolve', 'Fade', 'Pause', 'Return', 'Jump', 'Call', 'Show', 'Hide', 'SetVariable', 'ToggleVariable', 'Function', 'Play', 'Stop', 'Notify', 'Confirm', 'MainMenu', 'ShowMenu', 'Rollback', 'Skip', 'Preference'];
const CH_JS = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'import', 'export', 'default', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'console', 'document', 'window', 'JSON', 'Math', 'Promise', 'Array', 'Object', 'String', 'Number'];
const CH_CSS = ['color', 'background', 'background-color', 'border', 'border-radius', 'margin', 'padding', 'display', 'flex', 'grid', 'position', 'width', 'height', 'min-width', 'max-width', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'overflow', 'opacity', 'transition', 'transform', 'z-index', 'top', 'right', 'bottom', 'left', 'gap', 'align-items', 'justify-content', 'box-shadow', 'cursor', 'content'];
const CH_KW = { renpy: CH_RPY_STMT, python: CH_PY, javascript: CH_JS, css: CH_CSS };

/** Имена из текста файла: метки, герои, переменные, картинки, преобразования. */
function chScan(text) {
  const o = { labels: [], chars: [], vars: [], images: [], trans: [] };
  if (!text) return o;
  let m;
  const reL = /^[ \t]*label[ \t]+([\p{L}_][\p{L}\p{N}_.]*)/gmu; while ((m = reL.exec(text))) o.labels.push(m[1]);
  const reC = /^[ \t]*define[ \t]+([\p{L}_][\p{L}\p{N}_]*)[ \t]*=[ \t]*(?:Dynamic)?Character\([ \t]*(?:_\()?[ \t]*(?:"([^"\n]*)"|'([^'\n]*)')?/gmu;
  while ((m = reC.exec(text))) o.chars.push({ tag: m[1], name: m[2] != null ? m[2] : m[3] || '' });
  const reV = /^[ \t]*(?:default|define)[ \t]+(?:-?\d+[ \t]+)?([\p{L}_][\p{L}\p{N}_.]*)[ \t]*=/gmu; const seen = new Set(o.chars.map(c => c.tag));
  while ((m = reV.exec(text))) if (!seen.has(m[1])) o.vars.push(m[1]);
  const reI = /^[ \t]*image[ \t]+([\p{L}_][\p{L}\p{N}_]*(?:[ \t]+[\p{L}\p{N}_]+)*?)[ \t]*[=:]/gmu; while ((m = reI.exec(text))) o.images.push(m[1].replace(/\s+/g, ' '));
  const reT = /^[ \t]*transform[ \t]+([\p{L}_][\p{L}\p{N}_]*)/gmu; while ((m = reT.exec(text))) o.trans.push(m[1]);
  return o;
}

/** Ближайшая сверху строка с меньшим отступом: что это за блок (python, screen или обычный сценарий). */
function chBlockKind(lines, li) {
  const ind = x => /^[ \t]*/.exec(x)[0].length;
  let want = ind(lines[li] || '');
  for (let i = li - 1, n = 0; i >= 0 && n < 400 && want > 0; i--, n++) {
    const tx = lines[i]; if (!tx.trim() || /^\s*#/.test(tx)) continue;
    const d = ind(tx); if (d >= want) continue;
    const hd = tx.trim();
    if (/^(?:init(?:\s+-?\d+)?\s+)?python\b/.test(hd) || /^early\s+python\b/.test(hd) || /^(?:def|class)\b/.test(hd)) return 'python';
    if (/^screen\b/.test(hd)) return 'screen';
    want = d;
  }
  return 'script';
}

function chItems(arr, kind, detail, pri, mark) { return arr.map(x => ({ label: x, kind, detail, pri, mark })); }
const CH_MARK = { kw: 'K', label: 'L', char: 'C', var: 'V', img: 'I', audio: 'A', tag: 'T', word: 'W', fn: 'F', trans: 'T', pos: 'P', attr: 'a' };
function chMk(it) { if (!it.mark) it.mark = CH_MARK[it.kind] || ''; return it; }

function chHint(ctx, env) {
  const out = chRenpy(ctx, env);
  if (!out) return [];
  const arr = Array.isArray(out) ? out : out.items;
  for (const it of arr) chMk(it);
  return out;
}

/** Слова файла (длиннее двух знаков), кроме слова под курсором. */
function chWords(ctx, kind, pri) {
  const res = [];
  for (const w of ctx.words().keys()) if (w !== ctx.prefix) res.push({ label: w, kind: 'word', pri: pri == null ? 8 : pri });
  return res;
}

function chRenpy(ctx, env) {
  const lang = ctx.lang, cls = ctx.cls, before = ctx.before, prefix = ctx.prefix;
  const head = before.slice(0, before.length - prefix.length);
  const ex = ctx.explicit;
  const general = () => {
    if (!ex && prefix.length < 2) return null;
    const kw = (CH_KW[lang] || []).map(w => ({ label: w, kind: 'kw', pri: 6 }));
    return kw.concat(chWords(ctx));
  };
  if (lang === 'text' || lang === 'markdown' || lang === 'json' || lang === 'yaml' || lang === 'ini' || lang === 'xml' || lang === 'html') return ex ? chWords(ctx) : null;        // в обычном тексте список только по Ctrl+Пробел
  if (lang === 'css' || lang === 'javascript') { if (cls === 'com' || ctx.inStr && !ex) return null; return general(); }
  if (lang === 'python') { if (cls === 'com' || (ctx.inStr && !ex)) return null; if (/\.\s*$/.test(head)) return ex ? chWords(ctx) : null; return general(); }
  if (lang !== 'renpy') return general();

  /* ---------- Ren'Py ---------- */
  if (cls === 'com') return null;
  const inStr = ctx.inStr;
  /* звук в кавычках после play/queue/stop */
  const mAud = /^\s*(?:play|queue)\s+\w+\s+(?:\w+\s+)*["']([^"']*)$/.exec(before);
  if (mAud) {
    const typed = mAud[1], from = before.length - typed.length;
    return { prefix: typed, from, items: env.audio().map(p => ({ label: p, kind: 'audio', detail: t('ch.audio'), pri: 1 })) };
  }
  if (inStr) {
    /* внутри текста реплики: только [переменные] и {теги} */
    if (/\[[\p{L}\p{N}_.]*$/u.test(before) && !/\]/.test(before.slice(before.lastIndexOf('[')))) {
      const items = env.vars().map(v => ({ label: v.name, kind: 'var', detail: v.detail || t('ch.var'), pri: 1 }));
      return items.concat(env.chars().map(c => ({ label: c.tag, kind: 'char', detail: c.name || t('ch.char'), pri: 4 })));
    }
    if (/\{\/[\p{L}]*$/u.test(before)) return chItems(CH_RPY_CLOSE, 'tag', t('ch.tag'), 1);
    if (/\{[\p{L}=]*$/u.test(before) && !/\}/.test(before.slice(before.lastIndexOf('{')))) return chItems(CH_RPY_TAGS, 'tag', t('ch.tag'), 1);
    return ex ? chWords(ctx) : null;
  }
  if (/^\s*(?:label|screen|transform|style|def|class|image|layeredimage)\s+$/.test(head) || /^\s*(?:define|default)\s+(?:-?\d+\s+)?$/.test(head)) return null;       // здесь пишут новое имя
  const kindBlock = chBlockKind(ctx.lines, ctx.line);
  if (kindBlock === 'python') {
    if (/\.\s*$/.test(head)) return ex ? chWords(ctx) : null;
    if (!ex && prefix.length < 2) return null;
    const vs = env.vars().map(v => ({ label: v.name, kind: 'var', detail: v.detail || t('ch.var'), pri: 2 }));
    return vs.concat(chItems(CH_PY, 'kw', '', 5), chItems(CH_RPY_PY, 'fn', '', 6), chWords(ctx));
  }
  /* метка после jump/call */
  if (/^\s*(?:jump|call)\s+$/.test(head)) return env.labels().map(l => ({ label: l.name, kind: 'label', detail: l.detail || t('ch.label'), pri: l.code ? 1 : 2 }));
  /* команды показа */
  const mShow = /^\s*(scene|show|hide)\s+(.*)$/.exec(head);
  if (mShow) {
    const rest = mShow[2].trim().split(/\s+/).filter(Boolean), imgs = env.images();
    if (/(?:^|\s)with\s+$/.test(head)) return chItems(CH_RPY_TRANS, 'trans', t('ch.trans'), 2);
    if (/(?:^|\s)at\s+(?:[\p{L}\p{N}_]+\s*,\s*)*$/u.test(head)) return chItems(CH_RPY_POS, 'pos', t('ch.pos'), 2).concat(chItems(env.transforms(), 'fn', t('ch.pos'), 3));
    if (!rest.length) {
      const seen = new Set(), items = [];
      for (const im of imgs) { const k = im.tag; if (seen.has(k)) continue; seen.add(k); items.push({ label: k, kind: 'img', detail: t('ch.img'), pri: 1 }); }
      for (const c of env.chars()) if (!seen.has(c.tag)) { seen.add(c.tag); items.push({ label: c.tag, kind: 'img', detail: t('ch.img'), pri: 3 }); }
      return items;
    }
    const tag = rest[0], used = new Set(rest.slice(1)), items = [];
    for (const im of imgs) if (im.tag === tag) for (const a of im.attrs) if (!used.has(a)) items.push({ label: a, kind: 'attr', detail: t('ch.attr'), pri: 1 });
    for (const a of CH_RPY_AFTER_SHOW) items.push({ label: a, kind: 'kw', pri: 4 });
    return items;
  }
  if (/^\s*(?:with)\s+$/.test(head) || /\swith\s+$/.test(head)) return chItems(CH_RPY_TRANS, 'trans', t('ch.trans'), 2);
  if (/^\s*(?:play|queue|stop)\s+$/.test(head)) return chItems(CH_RPY_CHANNELS, 'kw', t('ch.chan'), 1);
  if (/^\s*(?:play|queue)\s+\w+\s+$/.test(head)) return env.audio().map(p => ({ label: p, insert: '"' + p + '"', kind: 'audio', detail: t('ch.audio'), pri: 1 }));
  /* выражения: после $, if, elif, while, return, default, define, = */
  const exprHead = /^\s*(?:\$\s+|(?:if|elif|while|return)\s+|(?:default|define)\s+[\p{L}\p{N}_.]+\s*=\s*)/u.test(head) || /(?:\b(?:and|or|not|in)\s+|[=(,+\-*\/<>!]\s*)$/.test(head) && /^\s*(?:\$|if|elif|while|return|default|define)\b/.test(head);
  if (exprHead) {
    if (!ex && !prefix && !/^\s*(?:\$|if|elif|while)\s+$/.test(head)) return null;
    if (/\.\s*$/.test(head)) return ex ? chWords(ctx) : null;
    const vs = env.vars().map(v => ({ label: v.name, kind: 'var', detail: v.detail || t('ch.var'), pri: 1 }));
    const cs = env.chars().map(c => ({ label: c.tag, kind: 'char', detail: c.name || t('ch.char'), pri: 4 }));
    return vs.concat(cs, chItems(CH_PY, 'kw', '', 6), chItems(CH_RPY_PY, 'fn', '', 7), prefix ? chWords(ctx) : []);
  }
  /* начало строки: команды и герои */
  if (/^\s*$/.test(head)) {
    if (!prefix) return ex ? chItems(CH_RPY_STMT, 'kw', t('ch.kw'), 3).concat(env.chars().map(c => ({ label: c.tag, insert: c.tag + ' ', kind: 'char', detail: c.name || t('ch.char'), pri: 2 }))) : null;
    const chars = env.chars().map(c => ({ label: c.tag, insert: c.tag + ' ', kind: 'char', detail: c.name || t('ch.char'), pri: 2 }));
    const kws = chItems(kindBlock === 'screen' ? CH_RPY_SCREEN : CH_RPY_STMT, 'kw', t('ch.kw'), 3);
    return chars.concat(kws, prefix.length >= 2 ? chWords(ctx) : []);
  }
  return general();
}

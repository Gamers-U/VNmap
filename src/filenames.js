'use strict';
/* ====== Проверка имён файлов (1.6.7) ======
   На Windows регистр букв в именах файлов не важен, на Linux и Android важен: «Theme.ogg» и «theme.ogg» там два разных файла.
   Кириллица, пробелы и странные знаки в путях тоже чаще всего ломают игру не на компьютере автора, а на телефоне или у тестера.
   Сборка и так делает пути ресурсов латинскими («Лес ночь» станет «_»), но делает это молча, и два разных русских имени сливаются.
   Здесь всё это попадает в отчёт «Сборка»: что именно не так, во что превратится в игре и, где можно, кнопка «Исправить».
   Проверяются: 1) пути ресурсов, заданные вручную в реестре; 2) имена файлов глав (.rpy); 3) пути-строки в скриптах глав
   (картинки, звук, шрифты, видео): регистр не совпадает с файлом из реестра, обратные слэши, кириллица, пробелы, зарезервированные
   имена Windows. Диалоги не трогаем: смотрим только строки команд Ren'Py. Правила осторожные: путь к файлу, которого нет в реестре,
   но записан латиницей, не считается ошибкой (его кладут в папку игры вручную). */

Object.assign(D, {
  'fn.r.case': ['регистр букв не совпадает с файлом', 'the letter case differs from the file'],
  'fn.r.cyr': ['не латинские буквы', 'non-Latin letters'],
  'fn.r.space': ['пробелы', 'spaces'],
  'fn.r.bslash': ['обратные слэши вместо «/»', 'backslashes instead of "/"'],
  'fn.r.chars': ['спецсимволы', 'special characters'],
  'fn.r.resv': ['имя, которое Windows считает служебным (CON, AUX, NUL, COM1…)', 'a name Windows treats as reserved (CON, AUX, NUL, COM1…)'],
  'fn.r.dot': ['точка или пробел в конце имени', 'a dot or space at the end of a name'],
  'fn.r.long': ['слишком длинный путь', 'the path is too long'],
  'fn.asset.path': ['Путь «{0}» (ресурс «{1}»): {2}. В игре он станет «{3}». Ren\'Py на Linux и Android надёжнее всего работает с латиницей, цифрами, «_» и «-».',
    'Path “{0}” (asset “{1}”): {2}. In the game it becomes “{3}”. Ren\'Py is the most reliable on Linux and Android with Latin letters, digits, "_" and "-".'],
  'fn.asset.fix': ['Заменить на «{0}»', 'Change to “{0}”'],
  'fn.script.name': ['Имя файла главы «{0}» (глава «{1}»): {2}. В игре оно станет «{3}».', 'Chapter file name “{0}” (chapter “{1}”): {2}. In the game it becomes “{3}”.'],
  'fn.script.fix': ['Заменить на «{0}»', 'Change to “{0}”'],
  'fn.lit.to': ['Глава «{0}»: путь «{1}» ({2}), а файл в игре называется «{3}». {4}', 'Chapter “{0}”: the path “{1}” ({2}), but the file in the game is called “{3}”. {4}'],
  'fn.lit.bad': ['Глава «{0}»: путь «{1}» ({2}). Если кладёте файл в папку игры сами, назовите его латиницей без пробелов и пишите путь с «/».', 'Chapter “{0}”: the path “{1}” ({2}). If you put the file into the game folder yourself, name it with Latin letters and no spaces, and write the path with "/".'],
  'fn.auto.yes': ['В собранной игре путь заменён сам, в тексте главы он остался прежним.', 'In the built game the path is replaced automatically, but the chapter text keeps the old one.'],
  'fn.auto.no': ['Сам он не заменится: на Linux и Android Ren\'Py файл не найдёт.', 'It will not be replaced: on Linux and Android Ren\'Py will not find the file.'],
  'fn.fix.lit': ['Заменить путь в главах', 'Replace the path in chapters'],
  'fn.more': ['…и ещё {0} путей с такими замечаниями', '…and {0} more paths with such remarks'],
});

const FN_EXT = 'png|jpe?g|webp|avif|gif|svg|bmp|ogg|opus|mp3|wav|flac|m4a|aac|ttf|otf|ttc|webm|ogv|mp4|mkv|avi|mpg|mpeg';
const FN_RE_LIT = new RegExp('(["\'])((?:(?!\\1)[^\\n])+?\\.(?:' + FN_EXT + '))\\1', 'gi');
const FN_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const FN_SCREEN_KW = new Set(['add', 'idle', 'hover', 'insensitive', 'selected_idle', 'selected_hover', 'selected_insensitive', 'background', 'foreground', 'ground', 'auto', 'imagebutton', 'imagemap', 'hotspot']);
const FN_SHOW = 8;

const fnNorm = p => String(p || '').replace(/\\/g, '/').replace(/^(\.\/|\/)+/, '').replace(/^game\//i, '');
const fnWhy = keys => keys.map(k => t('fn.r.' + k)).join(', ');

/** Чем плох путь для Linux, Android и Windows: список причин (пусто, если всё в порядке). */
function fnReasons(p) {
  const n = String(p || ''), r = [];
  if (/[^\x00-\x7F]/.test(n)) r.push('cyr');
  if (/ /.test(n)) r.push('space');
  if (/\\/.test(n)) r.push('bslash');
  if (/[^A-Za-z0-9_.\-\/ \\]/.test(n.replace(/[^\x00-\x7F]/g, ''))) r.push('chars');
  const segs = fnNorm(n).split('/').filter(Boolean);
  if (segs.some(s => FN_RESERVED.test(s.split('.')[0]))) r.push('resv');
  if (segs.some(s => s !== '.' && s !== '..' && /[. ]$/.test(s))) r.push('dot');
  if (n.length > 180) r.push('long');
  return r;
}

/** Безопасный вариант пути: транслитерация, строчные буквы, «_» вместо всего лишнего. */
function fnSafePath(p) {
  const segs = fnNorm(p).split('/').filter(s => s && s !== '.' && s !== '..');
  return segs.map(seg => {
    const m = /^(.*?)(\.[A-Za-z0-9]+)?$/.exec(seg);
    let stem = String(m[1] || '').toLowerCase().split('').map(c => TR[c] != null ? TR[c] : c).join('').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!stem) stem = 'file';
    if (FN_RESERVED.test(stem)) stem = 'x_' + stem;
    return stem + (m[2] || '').toLowerCase();
  }).join('/');
}

/** Пути ресурсов, заданные вручную в реестре. targetOf(a) — во что путь превратит сборка. */
function fnAssets(add, assets, targetOf) {
  for (const a of assets) {
    if (!hasFilesKind(a.kind)) continue;
    const p = String(a.path || '').trim(); if (!p) continue;
    const rs = fnReasons(p); if (!rs.length) continue;
    const safe = fnSafePath(p);
    add('warn', t('fn.asset.path', p, a.name || '?', fnWhy(rs), targetOf(a) || cmpPath(p)), null,
      safe !== p ? { label: t('fn.asset.fix', safe), run: () => { a.path = safe; commit(true); } } : null);
  }
}

/** Имя файла главы (.rpy), которое сборка исправит молча. */
function fnScriptName(add, node, file, raw, built) {
  const rs = fnReasons(raw); if (!rs.length) return;
  const safe = fnSafePath(raw).replace(/\.rpy$/i, '');
  add('warn', t('fn.script.name', raw, file.title || node.title || '?', fnWhy(rs), built), { node, file },
    safe && safe !== (file.filename || '') ? { label: t('fn.script.fix', safe), run: () => { file.filename = safe; commit(true); } } : null);
}

/** Строка скрипта: ищем пути к файлам в командах Ren'Py (диалоги пропускаем). autoLit — путь, который сборка заменит сама. */
function fnScanLine(line, ref, TG, found, autoLit) {
  if (line.indexOf('.') < 0) return;
  const tr = line.trim(); if (!tr || tr[0] === '#') return;
  const first = tr[0] === '$' ? 'renpy' : ((/^[A-Za-z_]\w*/.exec(tr) || [''])[0]);
  if (!first || !(ML_KEYWORDS.has(first) || CMP_NOT_SPEAKER.has(first) || FN_SCREEN_KW.has(first))) return;
  FN_RE_LIT.lastIndex = 0;
  let m;
  while ((m = FN_RE_LIT.exec(line))) {
    const lit = m[2], n = fnNorm(lit);
    const ci = TG.lower.get(n.toLowerCase()) || null;
    const why = [];
    if (ci && ci !== n) why.push('case');
    for (const r of fnReasons(lit)) why.push(r);
    if (!why.length) continue;
    let to = ci;
    if (!to) {
      const sk = cmpPath(n);
      if (/[A-Za-z0-9]/.test(sk.replace(/\.[A-Za-z0-9]+$/, ''))) to = TG.lower.get(sk.toLowerCase()) || null;
    }
    let x = found.get(lit);
    if (!x) { x = { lit, to, why, auto: !!to && lit === autoLit, refs: [], count: 0 }; found.set(lit, x); }
    x.count++; if (!x.refs.some(r => r.file === ref.file)) x.refs.push(ref);
  }
}

/** После обхода всех глав: записать находки в отчёт. */
function fnFlush(add, found) {
  const arr = [...found.values()];
  arr.slice(0, FN_SHOW).forEach(x => {
    const r0 = x.refs[0], title = (r0.file && r0.file.title) || (r0.node && r0.node.title) || '?';
    const sfx = x.count > 1 ? ' ×' + x.count : '';
    if (!x.to) { add('warn', t('fn.lit.bad', title, x.lit, fnWhy(x.why)) + sfx, r0); return; }
    const to = x.to, lit = x.lit;
    add(x.auto ? 'info' : 'warn', t('fn.lit.to', title, lit, fnWhy(x.why), to, t(x.auto ? 'fn.auto.yes' : 'fn.auto.no')) + sfx, r0, {
      label: t('fn.fix.lit'), run: () => {
        for (const n of P.nodes) for (const f of n.files) {
          const s = String(f.script || ''); if (s.indexOf(lit) < 0) continue;
          f.script = s.split('"' + lit + '"').join('"' + to + '"').split("'" + lit + "'").join("'" + to + "'");
        }
        commit(true);
      },
    });
  });
  if (arr.length > FN_SHOW) add('info', t('fn.more', arr.length - FN_SHOW));
}

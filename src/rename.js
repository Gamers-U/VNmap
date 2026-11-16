'use strict';
/* ====== Переименование везде: персонаж, флаг (переменная), метка ======
   Находит все места, где встречается имя, показывает список правок с галочками и применяет отмеченные одним действием (Ctrl+Z откатывает всё сразу).
   Точные места (метка говорящего, имя переменной в коде, переход по метке) отмечены заранее. Упоминания в обычном тексте
   (имя героя в реплике или описании) по умолчанию не отмечены: человек сам решает, о том ли это персонаже, ведь тёзки бывают.
   Персонаж ищется по ID, поэтому две Алисы с разными метками не путаются. */
Object.assign(D, {
  'rn.btn': ['Переименовать везде…', 'Rename everywhere…'],
  'rn.title': ['Переименовать везде', 'Rename everywhere'],
  'rn.k.char': ['Персонаж', 'Character'], 'rn.k.flag': ['Флаг или переменная', 'Flag or variable'], 'rn.k.label': ['Метка', 'Label'],
  'rn.pick': ['Что переименовать', 'What to rename'],
  'rn.tag': ['Метка в скрипте', 'Script tag'], 'rn.tag.h': ['Так персонаж записан перед репликой: alice "Привет"', 'How the character is written before a line: alice "Hi"'],
  'rn.name': ['Имя персонажа', 'Character name'],
  'rn.newname': ['Новое имя', 'New name'],
  'rn.none.char': ['В проекте нет персонажей', 'There are no characters in the project'],
  'rn.none.flag': ['В проекте нет флагов и переменных', 'There are no flags or variables'],
  'rn.none.label': ['В проекте нет меток', 'There are no labels'],
  'rn.nolabel.tag': ['(без метки)', '(no tag)'],
  'rn.unreg': ['не в реестре', 'not in registry'],
  'rn.from.file': ['метка блока', 'block label'], 'rn.from.script': ['метка в скрипте', 'script label'],
  'rn.core': ['Что изменится', 'What will change'],
  'rn.core.tag': ['Метка: {0} → {1}', 'Tag: {0} → {1}'], 'rn.core.name': ['Имя: {0} → {1}', 'Name: {0} → {1}'],
  'rn.core.var': ['Имя в реестре: {0} → {1}', 'Registry name: {0} → {1}'],
  'rn.core.label': ['Метка блока «{2}»: {0} → {1}', 'Block label “{2}”: {0} → {1}'],
  'rn.core.gname': ['В игре имя без заданного «имени в игре» тоже изменится', 'The in-game name will change too (no separate in-game name is set)'],
  'rn.same': ['Введите новое значение, и ниже появится список правок.', 'Type a new value and the list of edits appears below.'],
  'rn.s.say': ['Реплики этого персонажа', 'Lines of this character'], 'rn.s.say.h': ['Строки вида alice "…", show alice, define alice', 'Lines like alice "…", show alice, define alice'],
  'rn.s.assets': ['Образы (спрайты)', 'Sprites'], 'rn.s.assets.h': ['Имя изображения совпадает с меткой персонажа', 'The image name matches the character tag'],
  'rn.s.code': ['Другие упоминания в коде', 'Other mentions in code'], 'rn.s.code.h': ['Не отмечены: проверьте, что это именно он, а не другое слово', 'Not selected: check that it is really this one'],
  'rn.s.nameq': ['Имя в репликах', 'Name inside lines'], 'rn.s.nameq.h': ['Не отмечены. Отметьте только те места, где речь об этом персонаже', 'Not selected. Tick only the places that speak about this character'],
  'rn.s.namef': ['Имя в описаниях и заметках', 'Name in descriptions and notes'], 'rn.s.namef.h': ['Названия блоков, описания, заметки, подписи стрелок', 'Block titles, descriptions, notes, arrow captions'],
  'rn.s.var': ['Скрипты глав', 'Chapter scripts'], 'rn.s.var.h': ['Условия, присвоения, объявления, подстановки [имя] в тексте', 'Conditions, assignments, declarations, [name] in text'],
  'rn.s.edge': ['Стрелки', 'Arrows'], 'rn.s.edge.h': ['Условие показа и код у стрелок, подписи с подстановкой', 'Arrow conditions, code and captions with substitutions'],
  'rn.s.vars': ['Другие переменные', 'Other variables'], 'rn.s.vars.h': ['Начальные значения, где используется это имя', 'Initial values that use this name'],
  'rn.s.text': ['Упоминания словом в описаниях', 'Mentions as a word in descriptions'], 'rn.s.text.h': ['Не отмечены', 'Not selected'],
  'rn.s.decl': ['Объявления метки', 'Label declarations'], 'rn.s.decl.h': ['Строки label …:', 'Lines like label …:'],
  'rn.s.refs': ['Переходы на метку', 'Jumps to the label'], 'rn.s.refs.h': ['jump, call и renpy.jump в скриптах и в коде стрелок', 'jump, call and renpy.jump in scripts and arrow code'],
  'rn.infl': ['Склонённые формы (например «{0}») найдены в тексте: {1}. Их программа сама не исправит, поправьте вручную.', 'Inflected forms (for example “{0}”) were found in the text: {1}. They are not changed automatically; fix them by hand.'],
  'rn.err.empty': ['Введите новое значение', 'Enter a new value'],
  'rn.err.id': ['Нужны латинские буквы, цифры и «_», начинать нельзя с цифры', 'Latin letters, digits and "_" only, and it cannot start with a digit'],
  'rn.err.kw': ['Это служебное слово Python или Ren\'Py', 'This is a Python or Ren\'Py reserved word'],
  'rn.err.tag.dup': ['Такая метка уже у персонажа «{0}»', 'This tag already belongs to “{0}”'],
  'rn.err.var.dup': ['Такое имя уже занято переменной или флагом', 'This name is already taken by a variable or flag'],
  'rn.err.char.dup': ['Такое имя уже занято персонажем (метка)', 'This name is already taken by a character tag'],
  'rn.err.label.dup': ['Такая метка уже есть в проекте', 'This label already exists in the project'],
  'rn.err.label.res': ['Это служебная метка Ren\'Py', 'This is a reserved Ren\'Py label'],
  'rn.warn.declared': ['Такое имя уже объявлено в скриптах (define или default). Проверьте, что это не конфликт.', 'This name is already declared in the scripts (define or default). Check that it is not a clash.'],
  'rn.warn.name.dup': ['У другого персонажа уже такое же имя. Это допустимо, но в тексте их придётся различать самому.', 'Another character already has this name. That is allowed, but you will have to tell them apart in the text.'],
  'rn.sum': ['Будет изменено мест: {0}, блоков: {1}', 'Places to change: {0}, blocks: {1}'],
  'rn.sum.core': ['Будет изменено мест: {0}, блоков: {1}, и сама карточка', 'Places to change: {0}, blocks: {1}, plus the card itself'],
  'rn.sum.only': ['Изменится только карточка', 'Only the card will change'],
  'rn.apply': ['Переименовать', 'Rename'],
  'rn.more': ['Показать ещё {0}', 'Show {0} more'],
  'rn.line': ['стр. {0}', 'line {0}'],
  'rn.done': [['Переименовано: {0} место', 'Переименовано: {0} места', 'Переименовано: {0} мест'], ['Renamed: {0} place', 'Renamed: {0} places']],
  'rn.stale': ['{0} мест уже изменились, пока было открыто окно, их пропустил', '{0} places had changed while the window was open and were skipped'],
  'rn.f.node': ['блок', 'block'], 'rn.f.title': ['название', 'title'], 'rn.f.desc': ['описание', 'description'], 'rn.f.prompt': ['вопрос', 'question'],
  'rn.f.summary': ['краткое содержание', 'summary'], 'rn.f.notes': ['заметки', 'notes'], 'rn.f.location': ['место', 'location'], 'rn.f.visual': ['визуал', 'visual'],
  'rn.f.cond': ['условие', 'condition'], 'rn.f.code': ['код', 'code'], 'rn.f.arrow': ['стрелка', 'arrow'], 'rn.f.char': ['персонаж', 'character'],
  'rn.f.cmt': ['заметка к блоку', 'block note'], 'rn.f.val': ['значение', 'value'], 'rn.f.asset': ['образ', 'sprite'],
});

const RN_RESERVED_LABELS = new Set(['start', 'quit', 'splashscreen', 'main_menu', 'after_load', 'before_main_menu', 'after_warp']);
/** Операторы, где слова не являются переменными: имя изображения, звук, переход и т. п. */
const RN_NOVAR = /^\s*(?:show|hide|scene|play|stop|queue|with|pause|window|camera|image|layeredimage|transform|screen|style|voice|label|jump|call|nvl)\b/;
const rnIdRe = name => new RegExp('(?:(?<![\\w.])|(?<=(?<![\\w.])persistent\\.))' + reEsc(name) + '(?!\\w)', 'g');
const rnInterRe = name => new RegExp('(?<!\\[)\\[' + reEsc(name) + '(?!\\w)', 'g');
const rnWordRe = name => new RegExp('(?<![\\p{L}\\d_])' + reEsc(name) + '(?![\\p{L}\\d_])', 'gu');
const rnLines = f => String(f.script || '').replace(/\r\n?/g, '\n').split('\n');

/** Строка → куски: код, строки в кавычках, комментарий. */
function rnSplit(line) {
  const out = []; let cur = '', i = 0;
  const flush = () => { if (cur) { out.push({ s: cur, k: 'code' }); cur = ''; } };
  while (i < line.length) {
    const c = line[i];
    if (c === '"' || c === "'") {
      flush(); let j = i + 1;
      while (j < line.length && line[j] !== c) j += line[j] === '\\' ? 2 : 1;
      out.push({ s: line.slice(i, j + 1), k: 'str' }); i = j + 1; continue;
    }
    if (c === '#') { flush(); out.push({ s: line.slice(i), k: 'cmt' }); i = line.length; break; }
    cur += c; i++;
  }
  flush();
  return out;
}
const rnMap = (line, fc, fs) => rnSplit(line).map(g => g.k === 'code' ? fc(g.s) : g.k === 'str' && fs ? fs(g.s) : g.s).join('');

/** Переменная в строке скрипта. Возвращает новую строку (или ту же, если менять нечего). */
function rnVarLine(line, old, neu) {
  if (!line.includes(old)) return line;
  const body = line.trim(); if (!body || body[0] === '#') return line;
  const idRe = rnIdRe(old), inRe = rnInterRe(old);
  const fc = s => s.replace(idRe, neu), fs = s => s.replace(inRe, () => '[' + neu);
  const m = RE_TL_SAY.exec(line);
  if (m && !TL_SKIP.has(m[2] || '')) {
    const lit = m[4], rest = m[5], start = line.length - rest.length - lit.length;
    return line.slice(0, start) + fs(lit) + rnMap(rest, fc, fs);
  }
  if (RN_NOVAR.test(line)) return line;
  return rnMap(line, fc, fs);
}
/** Метка персонажа в строке: говорящий, show/hide/scene/image/define и прочие упоминания в коде. */
function rnCharLine(line, tag, neu) {
  if (!line.includes(tag)) return null;
  const body = line.trim(); if (!body || body[0] === '#') return null;
  const m = RE_TL_SAY.exec(line);
  if (m && !TL_SKIP.has(m[2] || '')) {
    if (m[2] === tag) return { line: m[1] + neu + line.slice(m[1].length + tag.length), cls: 'say' };
    return null;
  }
  const e = reEsc(tag);
  let r = line.replace(new RegExp('^(\\s*(?:show|hide|scene)\\s+)' + e + '(?!\\w)'), (_, a) => a + neu);
  if (r !== line) return { line: r, cls: 'say' };
  r = line.replace(new RegExp('^(\\s*(?:image|layeredimage|define|default)\\s+(?:-?\\d+\\s+)?)' + e + '(?![\\w.])'), (_, a) => a + neu);
  if (r !== line) return { line: r, cls: 'say' };
  if (RN_NOVAR.test(line)) return null;
  const idRe = rnIdRe(tag);
  r = rnMap(line, s => s.replace(idRe, neu));
  return r !== line ? { line: r, cls: 'code' } : null;
}
/** Имя героя внутри текста реплики (только то, что в кавычках). */
function rnNameLine(line, old, neu) {
  if (!line.includes(old)) return line;
  const m = RE_TL_SAY.exec(line);
  if (!m || TL_SKIP.has(m[2] || '')) return line;
  const lit = m[4], q = lit[0], start = line.length - m[5].length - lit.length;
  const safe = neu.replace(/\\/g, '\\\\').split(q).join('\\' + q);
  const inner = lit.slice(1, -1).replace(rnWordRe(old), () => safe);
  return line.slice(0, start) + q + inner + q + m[5];
}
/** Метка в строке: объявление и переходы. cls: 'decl' | 'refs'. */
function rnLabelLine(line, old, neu) {
  if (!line.includes(old)) return null;
  const e = reEsc(old);
  let r = line.replace(new RegExp('^(\\s*label\\s+)' + e + '(?!\\w)'), (_, a) => a + neu);
  if (r !== line) return { line: r, cls: 'decl' };
  r = line.replace(new RegExp('^(\\s*(?:jump|call)\\s+)' + e + '(?!\\w)'), (_, a) => a + neu);
  r = r.replace(new RegExp('(renpy\\.(?:jump|call)\\(\\s*)(["\'])' + e + '\\2'), (_, a, q) => a + q + neu + q);
  return r !== line ? { line: r, cls: 'refs' } : null;
}

/* ---------- каталог: что можно переименовать ---------- */
function rnCatalog(kind) {
  if (kind === 'char') return P.characters.map(c => ({ key: c.id, label: (c.name || c.tag || '?') + (c.tag ? '  ·  ' + c.tag : '') }));
  if (kind === 'flag') {
    const A = flagAnalysis();
    return [...A.names.values()].filter(x => rnValidId(x.name)).sort((a, b) => a.name.localeCompare(b.name)).map(x => ({ key: x.name, label: x.name + (x.var ? '' : '  ·  ' + t('rn.unreg')) }));
  }
  const map = new Map();
  for (const { node, file } of allFiles()) {
    if (node.type === 'note') continue;
    const lb = fileLabel(file);
    if (lb && rnValidId(lb)) { if (!map.has(lb)) map.set(lb, []); map.get(lb).push(t('rn.from.file') + ': ' + node.title); }
    rnLines(file).forEach(l => { const m = RE_J_LABEL.exec(l.trim()); if (m) { if (!map.has(m[1])) map.set(m[1], []); if (!map.get(m[1]).some(x => x.startsWith(t('rn.from.script')))) map.get(m[1]).push(t('rn.from.script') + ': ' + node.title); } });
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, w]) => ({ key: k, label: k + '  ·  ' + w[0] }));
}
const rnValidId = s => /^[A-Za-z_]\w*$/.test(s);
const rnBlockName = (n, f) => n.title + (f && (n.files.length > 1 || f.title) ? ' › ' + (f.title || '') : '');

/** Все текстовые поля проекта, где может встретиться имя: [{ t, id, key, label, nid? }] (значение читается при применении). */
function rnTextFields() {
  const out = [];
  const add = (typ, obj, key, label, nid) => { const v = obj[key]; if (typeof v === 'string' && v) out.push({ typ, id: obj.id, key, label, nid: nid || '', val: v }); };
  for (const n of P.nodes) {
    const nm = n.title || '?';
    add('node', n, 'title', nm + ' · ' + t('rn.f.title'), n.id); add('node', n, 'desc', nm + ' · ' + t('rn.f.desc'), n.id); add('node', n, 'prompt', nm + ' · ' + t('rn.f.prompt'), n.id);
    for (const f of n.files) for (const k of ['title', 'summary', 'notes', 'location', 'visual']) add('file', f, k, rnBlockName(n, f) + ' · ' + t('rn.f.' + k), n.id);
  }
  for (const e of P.edges) { const a = nodeById(e.from), b = nodeById(e.to); const nm = t('rn.f.arrow') + ': ' + (a ? a.title : '?') + ' → ' + (b ? b.title : '?'); add('edge', e, 'title', nm + ' · ' + t('rn.f.title'), e.from); add('edge', e, 'desc', nm + ' · ' + t('rn.f.desc'), e.from); }
  for (const c of P.characters) add('char', c, 'notes', t('rn.f.char') + ': ' + (c.name || c.tag) + ' · ' + t('rn.f.notes'));
  for (const v of P.vars) add('var', v, 'notes', v.name + ' · ' + t('rn.f.notes'));
  for (const k of P.cmts) add('cmt', k, 'text', t('rn.f.cmt') + ' · ' + (nodeById(k.nid) || { title: '?' }).title, k.nid);
  return out;
}
function rnResolve(typ, id) {
  if (typ === 'node') return nodeById(id);
  if (typ === 'file') { const ff = findFile(id); return ff ? ff.file : null; }
  if (typ === 'edge') return P.edges.find(e => e.id === id) || null;
  if (typ === 'char') return P.characters.find(c => c.id === id) || null;
  if (typ === 'var') return P.vars.find(v => v.id === id) || null;
  if (typ === 'cmt') return P.cmts.find(k => k.id === id) || null;
  if (typ === 'asset') return P.assets.find(a => a.id === id) || null;
  return null;
}

/* ---------- план правок ---------- */
let RN_SEQ = 0;
function rnPlan(kind, key, form) {
  const plan = { kind, errors: [], warns: [], core: [], sections: [], infl: null };
  const sec = (id, title, hint, defOn) => { const s = { id, title, hint, defOn, items: [] }; plan.sections.push(s); return s; };
  const lineItem = (s, node, file, li, old, neu, label) => s.items.push({ i: ++RN_SEQ, sig: 'l|' + file.id + '|' + li, kind: 'line', fid: file.id, nid: node.id, li, old, neu, label: (label || rnBlockName(node, file)) + ' · ' + t('rn.line', li + 1), on: s.defOn });
  const propItem = (s, f, neu, label) => s.items.push({ i: ++RN_SEQ, sig: 'p|' + f.typ + '|' + f.id + '|' + f.key, kind: 'prop', typ: f.typ, id: f.id, pkey: f.key, nid: f.nid, old: f.val, neu, label: label || f.label, on: s.defOn });
  const scanScripts = fn => { for (const { node, file } of allFiles()) { if (node.type === 'note') continue; rnLines(file).forEach((l, li) => fn(node, file, li, l)); } };
  if (kind === 'char') {
    const c = P.characters.find(x => x.id === key); if (!c) { plan.errors.push(t('rn.err.empty')); return plan; }
    const oldTag = c.tag, newTag = String(form.tag == null ? oldTag : form.tag).trim(), oldName = c.name, newName = String(form.name == null ? oldName : form.name).trim();
    const tagChanged = newTag !== oldTag, nameChanged = newName !== oldName;
    if (tagChanged) {
      if (!newTag) plan.errors.push(t('rn.err.empty'));
      else if (!rnValidId(newTag)) plan.errors.push(t('rn.err.id'));
      else if (RESERVED_TAGS.has(newTag) || TL_SKIP.has(newTag) || PY_NOT_VARS.has(newTag)) plan.errors.push(t('rn.err.kw'));
      else {
        const dup = P.characters.find(x => x !== c && x.tag === newTag);
        if (dup) plan.errors.push(t('rn.err.tag.dup', dup.name || dup.tag));
        else if (P.vars.some(v => v.name === newTag)) plan.errors.push(t('rn.err.char.dup'));
        else if (flagAnalysis().declared.has(newTag) && !P.characters.some(x => x.tag === newTag)) plan.warns.push(t('rn.warn.declared'));
      }
      plan.core.push(t('rn.core.tag', oldTag || t('rn.nolabel.tag'), newTag || '…'));
    }
    if (nameChanged) {
      if (!newName) plan.errors.push(t('rn.err.empty'));
      else if (P.characters.some(x => x !== c && x.name === newName)) plan.warns.push(t('rn.warn.name.dup'));
      plan.core.push(t('rn.core.name', oldName || '…', newName || '…'));
      if (!c.gameName) plan.warns.push(t('rn.core.gname'));
    }
    plan.apply = { char: { id: c.id, tag: tagChanged && newTag ? newTag : null, name: nameChanged && newName ? newName : null } };
    if (tagChanged && newTag && !plan.errors.length && oldTag) {
      const sSay = sec('say', t('rn.s.say'), t('rn.s.say.h'), true), sCode = sec('code', t('rn.s.code'), t('rn.s.code.h'), false), sAs = sec('assets', t('rn.s.assets'), t('rn.s.assets.h'), true);
      scanScripts((n, f, li, l) => { const r = rnCharLine(l, oldTag, newTag); if (r) lineItem(r.cls === 'code' ? sCode : sSay, n, f, li, l, r.line); });
      const asRe = new RegExp('^' + reEsc(oldTag) + '(?=\\s|$)');
      for (const a of P.assets) if (a.kind === 'sprite' && asRe.test(a.name)) sAs.items.push({ i: ++RN_SEQ, sig: 'p|asset|' + a.id + '|name', kind: 'prop', typ: 'asset', id: a.id, pkey: 'name', nid: '', old: a.name, neu: a.name.replace(asRe, newTag), label: t('rn.f.asset') + ': ' + a.name, on: true });
    }
    if (nameChanged && newName && !plan.errors.length && oldName) {
      const sQ = sec('nameq', t('rn.s.nameq'), t('rn.s.nameq.h'), false), sF = sec('namef', t('rn.s.namef'), t('rn.s.namef.h'), false);
      scanScripts((n, f, li, l) => { const r = rnNameLine(l, oldName, newName); if (r !== l) lineItem(sQ, n, f, li, l, r); });
      const re = rnWordRe(oldName);
      for (const f of rnTextFields()) { if (f.typ === 'char' && f.id === c.id) continue; const r = f.val.replace(re, () => newName); if (r !== f.val) propItem(sF, f, r); }
      if (oldName.length >= 3) {
        const stem = oldName.length >= 4 && /[аяйьеоуыиэю]$/i.test(oldName) ? oldName.slice(0, -1) : oldName, ire = new RegExp('(?<![\\p{L}\\d_])' + reEsc(stem) + '\\p{L}*', 'giu');
        let cnt = 0; const samples = new Set();
        const see = txt => { for (const m of String(txt).matchAll(ire)) if (m[0] !== oldName) { cnt++; if (samples.size < 3) samples.add(m[0]); } };
        scanScripts((n, f, li, l) => { const m = RE_TL_SAY.exec(l); if (m && !TL_SKIP.has(m[2] || '')) see(m[4]); });
        rnTextFields().forEach(f => see(f.val));
        if (cnt) plan.infl = t('rn.infl', [...samples][0], cnt);
      }
    }
  } else if (kind === 'flag') {
    const old = key, nw = String(form.name == null ? old : form.name).trim();
    const v = P.vars.find(x => x.name === old) || null;
    if (nw !== old) {
      if (!nw) plan.errors.push(t('rn.err.empty'));
      else if (!rnValidId(nw)) plan.errors.push(t('rn.err.id'));
      else if (RESERVED_TAGS.has(nw) || PY_NOT_VARS.has(nw) || TL_SKIP.has(nw)) plan.errors.push(t('rn.err.kw'));
      else if (P.vars.some(x => x !== v && x.name === nw) || flagAnalysis().names.has(nw)) plan.errors.push(t('rn.err.var.dup'));
      else if (P.characters.some(x => x.tag === nw)) plan.errors.push(t('rn.err.char.dup'));
      else if (flagAnalysis().declared.has(nw)) plan.warns.push(t('rn.warn.declared'));
      plan.core.push(t('rn.core.var', old, nw || '…'));
    }
    plan.apply = { varId: v ? v.id : null, name: nw !== old && nw && !plan.errors.length ? nw : null };
    if (nw !== old && nw && !plan.errors.length) {
      const sS = sec('var', t('rn.s.var'), t('rn.s.var.h'), true), sE = sec('edge', t('rn.s.edge'), t('rn.s.edge.h'), true), sV = sec('vars', t('rn.s.vars'), t('rn.s.vars.h'), true), sT = sec('text', t('rn.s.text'), t('rn.s.text.h'), false);
      scanScripts((n, f, li, l) => { const r = rnVarLine(l, old, nw); if (r !== l) lineItem(sS, n, f, li, l, r); });
      const idRe = rnIdRe(old), inRe = rnInterRe(old);
      const fc = s => s.replace(idRe, nw), fs = s => s.replace(inRe, () => '[' + nw);
      for (const e of P.edges) {
        const a = nodeById(e.from), b = nodeById(e.to), nm = t('rn.f.arrow') + ': ' + (a ? a.title : '?') + ' → ' + (b ? b.title : '?');
        if (e.cond && e.cond.includes(old)) { const r = rnMap(e.cond, fc, fs); if (r !== e.cond) propItem(sE, { typ: 'edge', id: e.id, key: 'cond', nid: e.from, val: e.cond }, r, nm + ' · ' + t('rn.f.cond')); }
        if (e.code && e.code.includes(old)) { const r = e.code.split('\n').map(l => rnVarLine(l, old, nw)).join('\n'); if (r !== e.code) propItem(sE, { typ: 'edge', id: e.id, key: 'code', nid: e.from, val: e.code }, r, nm + ' · ' + t('rn.f.code')); }
        if (e.title && e.title.includes('[' + old)) { const r = e.title.replace(inRe, () => '[' + nw); if (r !== e.title) propItem(sE, { typ: 'edge', id: e.id, key: 'title', nid: e.from, val: e.title }, r, nm + ' · ' + t('rn.f.title')); }
      }
      for (const n of P.nodes) if (n.prompt && n.prompt.includes('[' + old)) { const r = n.prompt.replace(inRe, () => '[' + nw); if (r !== n.prompt) propItem(sE, { typ: 'node', id: n.id, key: 'prompt', nid: n.id, val: n.prompt }, r, n.title + ' · ' + t('rn.f.prompt')); }
      for (const x of P.vars) if (x !== v && x.value && x.value.includes(old)) { const r = rnMap(x.value, fc, null); if (r !== x.value) propItem(sV, { typ: 'var', id: x.id, key: 'value', nid: '', val: x.value }, r, x.name + ' · ' + t('rn.f.val')); }
      const wre = rnWordRe(old);
      for (const f of rnTextFields()) { if (f.typ === 'edge' && f.key === 'title') continue; const r = f.val.replace(wre, () => nw); if (r !== f.val) propItem(sT, f, r); }
    }
  } else {
    const old = key, nw = String(form.name == null ? old : form.name).trim();
    const files = allFiles().filter(x => x.node.type !== 'note' && fileLabel(x.file) === old);
    if (nw !== old) {
      if (!nw) plan.errors.push(t('rn.err.empty'));
      else if (!rnValidId(nw)) plan.errors.push(t('rn.err.id'));
      else if (RN_RESERVED_LABELS.has(nw) || PY_NOT_VARS.has(nw) || TL_SKIP.has(nw)) plan.errors.push(t('rn.err.label.res'));
      else {
        const taken = allFiles().some(x => x.node.type !== 'note' && fileLabel(x.file) === nw) || allFiles().some(x => rnLines(x.file).some(l => { const m = RE_J_LABEL.exec(l.trim()); return m && m[1] === nw; }));
        if (taken) plan.errors.push(t('rn.err.label.dup'));
      }
      for (const x of files) plan.core.push(t('rn.core.label', old, nw || '…', rnBlockName(x.node, x.file)));
    }
    plan.apply = { fileIds: nw !== old && nw && !plan.errors.length ? files.map(x => x.file.id) : [], name: nw };
    if (nw !== old && nw && !plan.errors.length) {
      const sD = sec('decl', t('rn.s.decl'), t('rn.s.decl.h'), true), sR = sec('refs', t('rn.s.refs'), t('rn.s.refs.h'), true), sE = sec('edge', t('rn.s.edge'), t('rn.s.edge.h'), true), sT = sec('text', t('rn.s.text'), t('rn.s.text.h'), false);
      scanScripts((n, f, li, l) => { const r = rnLabelLine(l, old, nw); if (r) lineItem(r.cls === 'decl' ? sD : sR, n, f, li, l, r.line); });
      for (const e of P.edges) if (e.code && e.code.includes(old)) {
        const r = e.code.split('\n').map(l => { const x = rnLabelLine(l, old, nw); return x ? x.line : l; }).join('\n');
        const a = nodeById(e.from), b = nodeById(e.to);
        if (r !== e.code) propItem(sE, { typ: 'edge', id: e.id, key: 'code', nid: e.from, val: e.code }, r, t('rn.f.arrow') + ': ' + (a ? a.title : '?') + ' → ' + (b ? b.title : '?') + ' · ' + t('rn.f.code'));
      }
      const wre = rnWordRe(old);
      for (const f of rnTextFields()) { const r = f.val.replace(wre, () => nw); if (r !== f.val) propItem(sT, f, r); }
    }
  }
  plan.sections = plan.sections.filter(s => s.items.length);
  return plan;
}

/* ---------- применение ---------- */
/** Применяет отмеченное. Возвращает { n, blocks, skipped }. */
function rnApply(plan, isOn) {
  const items = plan.sections.flatMap(s => s.items).filter(isOn);
  const tlOn = P.tl && P.tl.langs && P.tl.langs.length;
  if (tlOn) tlSync();                                                 // чтобы перевод успел запомнить прежний порядок строк
  let n = 0, skipped = 0; const blocks = new Set();
  const byFile = new Map();
  for (const it of items) if (it.kind === 'line') { if (!byFile.has(it.fid)) byFile.set(it.fid, []); byFile.get(it.fid).push(it); }
  for (const [fid, list] of byFile) {
    const ff = findFile(fid); if (!ff) { skipped += list.length; continue; }
    const lines = rnLines(ff.file);
    for (const it of list) { if (lines[it.li] === it.old) { lines[it.li] = it.neu; n++; blocks.add(ff.node.id); } else skipped++; }
    ff.file.script = lines.join('\n');
  }
  for (const it of items) if (it.kind === 'prop') {
    const o = rnResolve(it.typ, it.id);
    if (o && o[it.pkey] === it.old) { o[it.pkey] = it.neu; n++; if (it.nid) blocks.add(it.nid); } else skipped++;
  }
  const A = plan.apply || {};
  if (A.char) { const c = P.characters.find(x => x.id === A.char.id); if (c) { if (A.char.tag) c.tag = A.char.tag; if (A.char.name) c.name = A.char.name; } }
  if (A.varId && A.name) { const v = P.vars.find(x => x.id === A.varId); if (v) v.name = A.name; }
  if (A.fileIds && A.fileIds.length) for (const fid of A.fileIds) { const ff = findFile(fid); if (ff) ff.file.label = A.name; }
  commit(true);
  if (tlOn) tlSync();
  return { n, blocks: blocks.size, skipped };
}

/* ---------- окно ---------- */
const RN_TOK = /[\p{L}\d_]+|\s+|[^\p{L}\d_\s]/gu;
/** Две строки → две подсвеченные строки: изменённые слова выделены каждое отдельно, длинные неизменённые куски сокращены. */
function rnDiff(a, b) {
  const ta = a.match(RN_TOK) || [], tb = b.match(RN_TOK) || [], n = ta.length, m = tb.length;
  let PA = [], PB = [];
  const push = (arr, s, hit) => { if (!s) return; const l = arr[arr.length - 1]; if (l && l.hit === hit) l.s += s; else arr.push({ s, hit }); };
  if (n * m > 160000) { push(PA, a, true); push(PB, b, true); }
  else {
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = ta[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (ta[i] === tb[j]) { push(PA, ta[i], false); push(PB, tb[j], false); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) push(PA, ta[i++], true); else push(PB, tb[j++], true);
    }
    while (i < n) push(PA, ta[i++], true); while (j < m) push(PB, tb[j++], true);
  }
  const ctx = 34;
  const draw = (parts, tag, cls) => {
    const el = h('div', { class: 'rn-ln ' + cls });
    parts.forEach((p, k) => {
      if (p.hit) { el.append(h(tag, p.s)); return; }
      let x = p.s;
      if (x.length > ctx * 2 + 8) x = k === 0 ? '…' + x.slice(-ctx) : k === parts.length - 1 ? x.slice(0, ctx) + '…' : x.slice(0, ctx) + ' … ' + x.slice(-ctx);
      el.append(x);
    });
    return el;
  };
  return h('div', { class: 'rn-diff' }, draw(PA, 'del', 'old'), draw(PB, 'ins', 'new'));
}
function openRenameDialog(opts) {
  opts = opts || {}; closePopover();
  const st = { kind: opts.kind || 'char', key: opts.key || '', tag: null, name: null, nm: null };
  const over = new Map(); let plan = null, timer = 0;
  openModal({
    cls: 'rn-m', onClose: () => clearTimeout(timer), build: m => {
      const kindBox = h('div'), pickBox = h('div'), formBox = h('div', { class: 'rn-form' }), body = h('div', { class: 'rn-body scroll' }), foot = h('div', { class: 'rn-foot' });
      const applyBtn = h('button', { class: 'btn primary', onclick: doApply }, t('rn.apply')), sumEl = h('div', { class: 'rn-sum' });
      const isOn = it => over.has(it.sig) ? over.get(it.sig) : it.on;
      function pickEntity() {
        const cat = rnCatalog(st.kind);
        if (!cat.some(x => x.key === st.key)) st.key = cat.length ? cat[0].key : '';
        pickBox.replaceChildren();
        if (!cat.length) { pickBox.append(h('div', { class: 'empty' }, t('rn.none.' + st.kind))); return; }
        const sel = h('select', { class: 'inp' }, ...cat.map(x => h('option', { value: x.key }, x.label)));
        sel.value = st.key;
        sel.addEventListener('change', () => { st.key = sel.value; over.clear(); fillForm(); recompute(); });
        pickBox.append(field(t('rn.pick'), sel));
      }
      function fillForm() {
        formBox.replaceChildren();
        if (!st.key) return;
        const inp = (val, ph, cb, mono) => { const i = h('input', { class: 'inp' + (mono ? ' mono' : ''), type: 'text', value: val, placeholder: ph || '', spellcheck: 'false' }); i.addEventListener('input', () => { cb(i.value); recompute(true); }); return i; };
        if (st.kind === 'char') {
          const c = P.characters.find(x => x.id === st.key); if (!c) return;
          st.tag = c.tag; st.name = c.name;
          formBox.append(h('div', { class: 'grid2' }, field(t('rn.tag'), inp(c.tag, '', v => { st.tag = v; }, true), t('rn.tag.h')), field(t('rn.name'), inp(c.name, '', v => { st.name = v; }))));
        } else {
          st.nm = st.key;
          formBox.append(h('div', { class: 'grid2' }, field(t('rn.newname'), inp(st.key, '', v => { st.nm = v; }, true))));
        }
      }
      const form = () => st.kind === 'char' ? { tag: st.tag, name: st.name } : { name: st.nm };
      function recompute(debounce) {
        clearTimeout(timer);
        const go = () => { plan = st.key ? rnPlan(st.kind, st.key, form()) : null; paint(); };
        if (debounce) timer = setTimeout(go, 180); else go();
      }
      function section(s) {
        const shown = { n: 120 }, box = h('div', { class: 'rn-sec' }), list = h('div', { class: 'rn-list' });
        const head = h('label', { class: 'rn-sh' });
        const all = h('input', { type: 'checkbox', class: 'rn-cb' });
        const sync = () => { const k = s.items.filter(isOn).length; all.checked = k === s.items.length; all.indeterminate = k > 0 && k < s.items.length; cnt.textContent = k + ' / ' + s.items.length; updateSum(); };
        const cnt = h('span', { class: 'rn-cnt' });
        all.addEventListener('change', () => { s.items.forEach(it => over.set(it.sig, all.checked)); list.querySelectorAll('.rn-cb').forEach(cb => { cb.checked = all.checked; }); sync(); });
        head.append(all, h('span', { class: 'rn-st' }, s.title), cnt, h('span', { class: 'rn-sd' }, s.hint));
        const draw = () => {
          list.replaceChildren();
          s.items.slice(0, shown.n).forEach(it => {
            const cb = h('input', { type: 'checkbox', class: 'rn-cb' }); cb.checked = isOn(it);
            cb.addEventListener('change', () => { over.set(it.sig, cb.checked); sync(); });
            list.append(h('label', { class: 'rn-it' }, cb, h('div', { class: 'rn-ib' }, h('div', { class: 'rn-where' }, it.label), rnDiff(it.old, it.neu))));
          });
          if (s.items.length > shown.n) list.append(h('button', { class: 'btn sm rn-more', onclick: () => { shown.n += 200; draw(); } }, t('rn.more', Math.min(200, s.items.length - shown.n))));
        };
        draw(); sync();
        box.append(head, list);
        return box;
      }
      function updateSum() {
        if (!plan) { sumEl.textContent = ''; applyBtn.disabled = true; return; }
        const items = plan.sections.flatMap(s => s.items).filter(isOn), blocks = new Set(items.map(x => x.nid || x.fid).filter(Boolean));
        const coreOn = !!(plan.apply && ((plan.apply.char && (plan.apply.char.tag || plan.apply.char.name)) || plan.apply.name && (plan.apply.varId || (plan.apply.fileIds && plan.apply.fileIds.length))));
        sumEl.textContent = items.length ? t(coreOn ? 'rn.sum.core' : 'rn.sum', items.length, blocks.size) : coreOn ? t('rn.sum.only') : '';
        applyBtn.disabled = !!plan.errors.length || !(items.length || coreOn);
      }
      function paint() {
        body.replaceChildren();
        if (!plan) return;
        plan.errors.forEach(e => body.append(h('div', { class: 'rn-msg err' }, icon('alert', 15), e)));
        plan.warns.forEach(e => body.append(h('div', { class: 'rn-msg warn' }, icon('info', 15), e)));
        if (!plan.core.length) body.append(h('div', { class: 'hint rn-same' }, t('rn.same')));
        else body.append(h('div', { class: 'rn-core' }, h('div', { class: 'lbl' }, t('rn.core')), ...plan.core.map(x => h('div', { class: 'rn-core-i' }, icon('check', 14, 2.4), x))));
        if (plan.infl) body.append(h('div', { class: 'rn-msg warn' }, icon('info', 15), plan.infl));
        plan.sections.forEach(s => body.append(section(s)));
        updateSum();
      }
      function doApply() {
        if (!plan || plan.errors.length) return;
        const r = rnApply(plan, isOn);
        m.close();
        try { renderAll(); } catch (e) { /* карта ещё не построена */ }
        if (typeof REG !== 'undefined' && REG && REG.m && !REG.m.closed) renderReg();
        toast(t('rn.done', r.n) + (r.skipped ? '. ' + t('rn.stale', r.skipped) : ''), r.skipped ? 6000 : undefined);
      }
      kindBox.append(segmented([{ value: 'char', label: t('rn.k.char') }, { value: 'flag', label: t('rn.k.flag') }, { value: 'label', label: t('rn.k.label') }], st.kind, v => { st.kind = v; st.key = ''; over.clear(); pickEntity(); fillForm(); recompute(); }));
      foot.append(sumEl, h('div', { class: 'rn-fb' }, h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), applyBtn));
      pickEntity(); fillForm(); recompute();
      return h('div', { class: 'm-wrap rn-wrap' }, modalHead(t('rn.title'), m), h('div', { class: 'm-pad rn-top' }, kindBox, pickBox, formBox), body, foot);
    }
  });
}
TOOL_ITEMS.push({ id: 'rename', group: 'story', ic: 'type', key: 'rn.btn', kw: 'rename replace character tag flag variable label переименовать заменить имя метка флаг персонаж везде', run: () => openRenameDialog() });

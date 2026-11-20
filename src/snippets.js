'use strict';
/* ====== Сниппеты (1.6.7): библиотека кусков кода проекта ======
   Фрагмент Ren'Py, который вы пишете снова и снова (затемнение экрана, выбор с проверкой флага, появление героя), сохраняется один раз
   с названием и вставляется в главу в один клик. Библиотека лежит в самом проекте (P.snippets), поэтому она переезжает вместе с ним,
   попадает в GitHub и Диск и сливается между участниками. В коде можно оставлять «пустые места»: {{имя}} или {{имя=значение по умолчанию}};
   при вставке программа спросит значения. {{|}} показывает, где окажется курсор после вставки. */

Object.assign(D, {
  'sp.btn': ['Сниппеты…', 'Snippets…'],
  'sp.title': ['Сниппеты проекта', 'Project snippets'],
  'sp.lead': ['Куски кода, которые вы вставляете снова и снова. Сохраните один раз и вставляйте в главу в один клик. В коде можно оставить пустые места: {{имя}} или {{имя=по умолчанию}}, при вставке программа спросит значения.', 'Pieces of code you insert again and again. Save one once and insert it into a chapter in one click. The code may have blanks: {{name}} or {{name=default}}, and the app asks for the values on insertion.'],
  'sp.new': ['Новый сниппет', 'New snippet'], 'sp.edit': ['Править', 'Edit'], 'sp.dup': ['Дублировать', 'Duplicate'], 'sp.del': ['Удалить', 'Delete'],
  'sp.copy': ['Копировать', 'Copy'], 'sp.copied': ['Скопировано', 'Copied'], 'sp.copyfail': ['Не удалось скопировать', 'Could not copy'],
  'sp.insert': ['Вставить', 'Insert'], 'sp.inserted': ['Вставлено: {0}', 'Inserted: {0}'],
  'sp.empty': ['Сниппетов пока нет. Создайте свой («Новый сниппет»), выделите строки в скрипте главы и выберите «Сохранить выделенное как сниппет» либо добавьте готовые примеры.', 'No snippets yet. Create your own (“New snippet”), select lines in a chapter script and choose “Save selection as snippet”, or add the ready examples.'],
  'sp.nofind': ['Ничего не найдено.', 'Nothing found.'],
  'sp.search': ['Поиск по названию и коду', 'Search by name and code'],
  'sp.starter': ['Добавить примеры', 'Add examples'], 'sp.starter.done': ['Добавлено примеров: {0}', 'Examples added: {0}'], 'sp.starter.none': ['Все примеры уже в библиотеке.', 'All examples are already in the library.'],
  'sp.export': ['Сохранить в файл', 'Save to a file'], 'sp.import': ['Загрузить из файла', 'Load from a file'],
  'sp.imp.done': ['Загружено сниппетов: {0}. Повторы пропущены: {1}.', 'Snippets loaded: {0}. Duplicates skipped: {1}.'], 'sp.imp.bad': ['Это не файл сниппетов.', 'This is not a snippets file.'],
  'sp.f.name': ['Название', 'Name'], 'sp.f.name.ph': ['Например: «Затемнение и возврат»', 'For example: “Fade out and back”'],
  'sp.f.group': ['Группа (необязательно)', 'Group (optional)'], 'sp.f.group.ph': ['Свет, выборы, звук…', 'Light, choices, sound…'],
  'sp.f.code': ['Код Ren\'Py', 'Ren\'Py code'], 'sp.f.note': ['Заметка (необязательно)', 'Note (optional)'],
  'sp.f.hint': ['Пустое место: {{имя}} или {{имя=значение по умолчанию}}. Курсор после вставки: {{|}}. Код вставляется без отступов: так же, как остальные кнопки быстрой вставки.', 'A blank: {{name}} or {{name=default value}}. The caret after insertion: {{|}}. The code is inserted without indentation, like the other quick-insert buttons.'],
  'sp.f.params': ['Пустые места: {0}', 'Blanks: {0}'],
  'sp.f.save': ['Сохранить', 'Save'], 'sp.f.cancel': ['Отмена', 'Cancel'],
  'sp.f.need': ['Нужны название и код.', 'A name and code are needed.'],
  'sp.saved': ['Сниппет сохранён', 'Snippet saved'],
  'sp.del.q': ['Удалить сниппет?', 'Delete the snippet?'], 'sp.del.t': ['«{0}» исчезнет из библиотеки проекта. Уже вставленный в главы код останется.', '“{0}” will disappear from the project library. Code already inserted into chapters stays.'],
  'sp.fill.t': ['Заполните пустые места', 'Fill in the blanks'],
  'sp.q': ['Сниппет', 'Snippet'],
  'sp.pick.lib': ['Библиотека сниппетов…', 'Snippet library…'],
  'sp.pick.save': ['Сохранить выделенное как сниппет…', 'Save selection as snippet…'],
  'sp.pick.none': ['Сниппетов пока нет.', 'No snippets yet.'],
  'sp.sel.none': ['Сначала выделите строки в скрипте.', 'Select some lines in the script first.'],
  'sp.sel.q': ['Название сниппета', 'Snippet name'],
  'sp.grp.none': ['Без группы', 'No group'],
  'sp.s.fade': ['Затемнение и возврат', 'Fade out and back'],
  'sp.s.fade.n': ['Экран гаснет, пауза, новая сцена', 'The screen fades out, a pause, a new scene'],
  'sp.s.menu2': ['Выбор из двух', 'Choice of two'],
  'sp.s.menu2.n': ['Меню с двумя вариантами и переходами', 'A menu with two options and jumps'],
  'sp.s.menuif': ['Выбор с проверкой флага', 'Choice with a flag check'],
  'sp.s.menuif.n': ['Первый вариант виден, только если флаг включён', 'The first option is visible only if the flag is on'],
  'sp.s.flag': ['Включить флаг', 'Set a flag'],
  'sp.s.flag.n': ['Запомнить выбор игрока', 'Remember the player\'s choice'],
  'sp.s.show': ['Появление героя', 'Character enters'],
  'sp.s.show.n': ['Спрайт появляется с плавным переходом', 'A sprite appears with a dissolve'],
  'sp.s.music': ['Музыка плавно', 'Music fade-in'],
  'sp.s.music.n': ['Включить музыку с плавным началом', 'Start music with a fade-in'],
  'sp.s.shake': ['Удар со звуком', 'Hit with a sound'],
  'sp.s.shake.n': ['Звук и тряска экрана', 'A sound and a screen shake'],
  'sp.g.light': ['Свет и сцены', 'Light and scenes'], 'sp.g.choice': ['Выборы', 'Choices'], 'sp.g.sound': ['Звук', 'Sound'], 'sp.g.hero': ['Герои', 'Characters'],
  'sp.v.name': ['название', 'name'],
  'rv.n.snip': ['сниппет', 'snippet'], 'rv.g.snips': ['Сниппеты', 'Snippets'],
});

const SP_RE = /\{\{([^{}\n|=]{1,40})(?:=([^{}\n]{0,80}))?\}\}/g;
const SP_MAX = 300;
let SP_TA = null;
/** Окно редактора скрипта, в которое можно вставлять (ставит вкладка «Скрипт» блока). */
function spSetTarget(ta) { SP_TA = ta; }
const spTarget = () => (SP_TA && document.body.contains(SP_TA) ? SP_TA : null);
const spList = () => P.snippets || (P.snippets = []);
const spDedent = code => {
  const lines = String(code || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const ind = Math.min(...lines.filter(l => l.trim()).map(l => /^ */.exec(l)[0].length), Infinity);
  return lines.map(l => (isFinite(ind) ? l.slice(Math.min(ind, /^ */.exec(l)[0].length)) : l).replace(/\s+$/, '')).join('\n');
};
/** Пустые места в коде: [{name, def}] без повторов. */
function spParams(code) {
  const out = [], seen = new Set(); let m;
  SP_RE.lastIndex = 0;
  while ((m = SP_RE.exec(String(code || '')))) { const nm = m[1].trim(); if (!nm || seen.has(nm)) continue; seen.add(nm); out.push({ name: nm, def: m[2] == null ? '' : m[2] }); }
  return out;
}
/** Код с подставленными значениями; «{{|}}» превращается в метку курсора. */
function spRender(code, vals) {
  vals = vals || {};
  return String(code || '').replace(SP_RE, (all, nm, def) => { const k = nm.trim(); return vals[k] != null ? vals[k] : (def == null ? '' : def); }).split('{{|}}').join('\u0001');
}
function spAdd(o) {
  const code = spDedent(o.code); if (!code) return null;
  if (spList().length >= SP_MAX) return null;
  const s = { id: uid('s'), name: String(o.name || '').trim().slice(0, 80) || code.split('\n')[0].slice(0, 40), code: code.slice(0, 20000), note: String(o.note || '').trim().slice(0, 300), group: String(o.group || '').trim().slice(0, 40), at: Date.now() };
  spList().push(s); commit(true);
  return s;
}
const spSame = (a, b) => a.name.trim() === b.name.trim() && a.code === b.code;

/** Спросить значения пустых мест; null — отмена. */
function spFill(sn) {
  const ps = spParams(sn.code);
  if (!ps.length) return Promise.resolve(spRender(sn.code, {}));
  return new Promise(res => {
    let done = false;
    openModal({
      cls: 'dlg sp-fill', onClose: () => { if (!done) res(null); },
      build: m => {
        const inputs = ps.map(p => h('input', { class: 'inp', type: 'text', value: p.def, 'data-p': p.name, placeholder: p.name }));
        const go = () => { const vals = {}; inputs.forEach((i, k) => { vals[ps[k].name] = i.value; }); done = true; res(spRender(sn.code, vals)); m.close(); };
        inputs.forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } }));
        setTimeout(() => { inputs[0].focus(); inputs[0].select(); }, 30);
        return h('div', { class: 'dlg-body' }, h('h3', sn.name), h('p', { class: 'hint' }, t('sp.fill.t')),
          ...ps.map((p, k) => h('div', { class: 'field' }, h('label', { class: 'lbl' }, p.name), inputs[k])),
          h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), h('button', { class: 'btn primary', id: 'sp-fill-ok', onclick: go }, t('sp.insert'))));
      }
    });
  });
}
/** Вставить сниппет в редактор скрипта (спросит значения, если есть пустые места). */
async function spInsert(sn, ta) {
  ta = ta || spTarget(); if (!ta) return false;
  const txt = await spFill(sn); if (txt == null) return false;
  insertSnippet(ta, txt);
  toast(t('sp.inserted', sn.name));
  return true;
}
/** Выделенное в скрипте → новый сниппет. */
async function spSaveSelection(ta) {
  const sel = ta ? ta.value.slice(ta.selectionStart, ta.selectionEnd) : '';
  if (!sel.trim()) { toast(t('sp.sel.none')); return null; }
  const nm = await promptDlg({ title: t('sp.sel.q'), label: t('sp.f.name'), value: '', placeholder: t('sp.f.name.ph'), ok: t('sp.f.save') });
  if (!nm) return null;
  const s = spAdd({ name: nm, code: sel });
  if (s) toast(t('sp.saved'));
  return s;
}
/** Список сниппетов рядом с кнопкой в панели быстрой вставки. */
function spPick(anchor, ta) {
  const box = h('div', { class: 'qform sp-pick' });
  const list = spList();
  const fill = q => {
    const qq = (q || '').trim().toLowerCase();
    const items = list.filter(s => !qq || (s.name + ' ' + s.code + ' ' + s.group).toLowerCase().includes(qq));
    body.replaceChildren(...(items.length ? items.map(s => h('button', { class: 'qi sp-pi', 'data-id': s.id, onclick: () => { closePopover(); spInsert(s, ta); } },
      h('b', s.name), h('span', { class: 'hint' }, s.code.split('\n')[0].slice(0, 50)))) : [h('div', { class: 'hint' }, list.length ? t('sp.nofind') : t('sp.pick.none'))]));
  };
  const body = h('div', { class: 'sp-pick-list' });
  if (list.length > 7) { const q = h('input', { class: 'inp', type: 'search', placeholder: t('sp.search') }); q.addEventListener('input', () => fill(q.value)); box.append(q); }
  box.append(body, h('button', { class: 'qi', id: 'sp-open-lib', onclick: () => { closePopover(); openSnippets(); } }, icon('code', 14), t('sp.pick.lib')));
  fill('');
  popover(anchor, box, { cls: 'pick-pop' });
}

/* ---------- стартовые примеры ---------- */
const SP_STARTER = [
  { k: 'fade', g: 'light', code: 'scene black with fade\npause 1.0\nscene {{фон=bg room}} with fade' },
  { k: 'menu2', g: 'choice', code: 'menu:\n    "{{вариант 1}}":\n        jump {{метка 1}}\n    "{{вариант 2}}":\n        jump {{метка 2}}' },
  { k: 'menuif', g: 'choice', code: 'menu:\n    "{{вариант=Сказать правду}}" if {{флаг=trust}}:\n        jump {{метка 1}}\n    "{{другой вариант=Промолчать}}":\n        jump {{метка 2}}' },
  { k: 'flag', g: 'choice', code: '$ {{флаг=trust}} = True' },
  { k: 'show', g: 'hero', code: 'show {{герой}} {{выражение=happy}} at center with dissolve' },
  { k: 'music', g: 'sound', code: 'play music "{{файл=audio/music/theme.ogg}}" fadein 1.5' },
  { k: 'shake', g: 'sound', code: 'play sound "{{звук=audio/sfx/hit.ogg}}"\nwith vpunch' },
];
function spAddStarters() {
  let n = 0;
  for (const x of SP_STARTER) {
    const s = { name: t('sp.s.' + x.k), code: spDedent(x.code), note: t('sp.s.' + x.k + '.n'), group: t('sp.g.' + x.g) };
    if (spList().some(o => o.name === s.name || spSame(o, s))) continue;
    if (spAdd(s)) n++;
  }
  return n;
}

/* ---------- окно библиотеки ---------- */
let SPW = null;
function spExport() {
  const data = { vnmapSnippets: 1, items: spList().map(s => ({ name: s.name, code: s.code, note: s.note, group: s.group })) };
  saveFile((String(P.name || 'project').replace(/[^\wА-Яа-яЁё\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'project') + '-snippets.json', JSON.stringify(data, null, 2), 'application/json');
}
async function spImportText(text) {
  let d = null; try { d = JSON.parse(text); } catch (e) { d = null; }
  if (!d || d.vnmapSnippets !== 1 || !Array.isArray(d.items)) { toast(t('sp.imp.bad')); return false; }
  let add = 0, skip = 0;
  for (const x of d.items) {
    if (!x || typeof x.code !== 'string' || !x.code.trim()) continue;
    const s = { name: String(x.name || '').slice(0, 80) || '…', code: spDedent(x.code), note: String(x.note || ''), group: String(x.group || '') };
    if (spList().some(o => spSame(o, s))) { skip++; continue; }
    if (spAdd(s)) add++;
  }
  toast(t('sp.imp.done', add, skip));
  return true;
}
function openSnippets() {
  closePopover();
  const st = { q: '', edit: null };            // edit: null | 'new' | id
  openModal({
    cls: 'sp-m', onClose: () => { SPW = null; },
    build: m => {
      const body = h('div', { class: 'sp-body' });
      SPW = { m, body };
      const groupsOf = () => [...new Set(spList().map(s => s.group).filter(Boolean))];
      const paintEdit = () => {
        const cur = st.edit === 'new' ? { name: '', code: '', note: '', group: '' } : spList().find(s => s.id === st.edit);
        if (!cur) { st.edit = null; paintList(); return; }
        const name = h('input', { class: 'inp', id: 'sp-f-name', type: 'text', value: cur.name, maxlength: '80', placeholder: t('sp.f.name.ph') });
        const grp = h('input', { class: 'inp', id: 'sp-f-group', type: 'text', value: cur.group, maxlength: '40', placeholder: t('sp.f.group.ph'), list: 'sp-groups' });
        const dl = h('datalist', { id: 'sp-groups' }, ...groupsOf().map(g => h('option', { value: g })));
        const useCm = typeof cmEngineWanted === 'function' && cmEngineWanted() === 'cm';
        const code = useCm ? cmField({ text: cur.code, lang: 'renpy', id: 'sp-f-code', label: t('sp.f.code'), placeholder: 'scene black with fade', height: 240 }).el
          : h('textarea', { class: 'ta mono sp-code', id: 'sp-f-code', rows: 10, spellcheck: 'false', placeholder: 'scene black with fade' });
        if (!useCm) code.value = cur.code;
        const note = h('input', { class: 'inp', id: 'sp-f-note', type: 'text', value: cur.note, maxlength: '300' });
        const params = h('div', { class: 'hint', id: 'sp-f-params' });
        const upd = () => { const ps = spParams(code.value); params.textContent = ps.length ? t('sp.f.params', ps.map(p => p.name).join(', ')) : ''; };
        code.addEventListener('input', upd); upd();
        const save = () => {
          const c = spDedent(code.value), nm = name.value.trim();
          if (!nm || !c) { toast(t('sp.f.need')); return; }
          if (st.edit === 'new') { if (!spAdd({ name: nm, code: c, note: note.value, group: grp.value })) return; }
          else { cur.name = nm.slice(0, 80); cur.code = c.slice(0, 20000); cur.note = note.value.trim().slice(0, 300); cur.group = grp.value.trim().slice(0, 40); commit(true); }
          toast(t('sp.saved')); st.edit = null; paintList();
        };
        body.replaceChildren(
          field(t('sp.f.name'), name), field(t('sp.f.group'), grp), dl, field(t('sp.f.code'), code, t('sp.f.hint')), params, field(t('sp.f.note'), note),
          h('div', { class: 'sp-actions' }, h('button', { class: 'btn', id: 'sp-f-cancel', onclick: () => { st.edit = null; paintList(); } }, t('sp.f.cancel')), h('button', { class: 'btn primary', id: 'sp-f-save', onclick: save }, icon('save', 15), t('sp.f.save'))));
        setTimeout(() => name.focus(), 30);
      };
      const paintList = () => {
        const list = spList(), qq = st.q.trim().toLowerCase();
        const items = list.filter(s => !qq || (s.name + ' ' + s.code + ' ' + s.group + ' ' + s.note).toLowerCase().includes(qq));
        const ta = spTarget();
        const q = h('input', { class: 'inp', id: 'sp-q', type: 'search', placeholder: t('sp.search'), value: st.q });
        q.addEventListener('input', () => { st.q = q.value; const pos = q.selectionStart; paintList(); const q2 = body.querySelector('#sp-q'); if (q2) { q2.focus(); q2.setSelectionRange(pos, pos); } });
        const groups = new Map();
        for (const s of items) { const g = s.group || ''; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(s); }
        const keys = [...groups.keys()].sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)));
        const row = s => {
          const ps = spParams(s.code);
          return h('div', { class: 'sp-row', 'data-id': s.id },
            h('div', { class: 'sp-main' }, h('b', s.name), s.note ? h('div', { class: 'hint' }, s.note) : null,
              h('pre', { class: 'sp-pre' }, h('span', { class: 'sp-prel' }, s.code.split('\n').slice(0, 5).join('\n') + (s.code.split('\n').length > 5 ? '\n…' : ''))),
              ps.length ? h('div', { class: 'hint' }, t('sp.f.params', ps.map(p => p.name).join(', '))) : null),
            h('div', { class: 'sp-acts' },
              ta ? h('button', { class: 'btn sm primary sp-ins', onclick: async () => { if (await spInsert(s, ta)) m.close(); } }, icon('plus', 14), t('sp.insert')) : null,
              h('button', { class: 'btn sm sp-cp', onclick: async () => toast((await copyText(spRender(s.code, Object.fromEntries(ps.map(p => [p.name, p.def]))).replace('\u0001', ''))) ? t('sp.copied') : t('sp.copyfail')) }, icon('copy', 14), t('sp.copy')),
              h('button', { class: 'btn icon sm sp-ed', 'data-tip': t('sp.edit'), onclick: () => { st.edit = s.id; paintEdit(); } }, icon('note', 15)),
              h('button', { class: 'btn icon sm sp-du', 'data-tip': t('sp.dup'), onclick: () => { const c = spAdd({ name: s.name + ' 2', code: s.code, note: s.note, group: s.group }); if (c) paintList(); } }, icon('layers', 15)),
              h('button', { class: 'btn icon sm sp-rm', 'data-tip': t('sp.del'), onclick: async () => { if (await confirmDlg({ title: t('sp.del.q'), text: t('sp.del.t', s.name), ok: t('sp.del'), danger: true })) { P.snippets = spList().filter(x => x.id !== s.id); commit(true); paintList(); } } }, icon('trash', 15))));
        };
        const top = h('div', { class: 'sp-top' }, h('p', { class: 'hint' }, t('sp.lead')),
          h('div', { class: 'sp-tools' }, q,
            h('button', { class: 'btn primary', id: 'sp-new', onclick: () => { st.edit = 'new'; paintEdit(); } }, icon('plus', 15), t('sp.new')),
            h('button', { class: 'btn', id: 'sp-starter', onclick: () => { const n = spAddStarters(); toast(n ? t('sp.starter.done', n) : t('sp.starter.none')); paintList(); } }, t('sp.starter')),
            h('button', { class: 'btn icon', id: 'sp-exp', 'data-tip': t('sp.export'), onclick: spExport }, icon('download', 15)),
            h('button', { class: 'btn icon', id: 'sp-imp', 'data-tip': t('sp.import'), onclick: () => pickFiles('.json,application/json', false, async fl => { await spImportText(await fl[0].text()); paintList(); }) }, icon('upload', 15))));
        body.replaceChildren(top,
          !list.length ? h('div', { class: 'empty' }, t('sp.empty')) : !items.length ? h('div', { class: 'empty' }, t('sp.nofind')) :
            h('div', { class: 'sp-list' }, ...keys.map(g => h('div', { class: 'sp-grp' }, keys.length > 1 || g ? h('div', { class: 'sp-gh' }, g || t('sp.grp.none')) : null, ...groups.get(g).map(row)))));
      };
      paintList();
      return h('div', { class: 'm-wrap' }, modalHead(t('sp.title'), m), body);
    }
  });
}
TOOL_ITEMS.push({ id: 'snippets', group: 'story', ic: 'braces', key: 'sp.btn', kw: 'snippets library templates code reuse insert macro presets сниппеты шаблоны кусок кода библиотека вставить повторяющийся код заготовки', run: () => openSnippets() });

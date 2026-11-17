'use strict';
/* ====== ИИ-помощник: чат справа от редактора кода ======
   Помощник для кода, сниппетов, мини-игр и рутины; текст новеллы он не пишет (это сказано и в его инструкции, и в интерфейсе).
   Правила, которые держит окно:
   1) ничего не уходит само: перед отправкой видно, что уйдёт вместе с вопросом (выделение, файл, сводка проекта), каждое можно выключить;
   2) ничего не меняется молча: ответ с кодом показывается как предложение, кнопка «Применить…» открывает предпросмотр (что было и что станет),
      и только «Применить» в нём кладёт код в проект (замена выделенного, вставка, новый файл, сниппеты, «Свой код»). В редакторе это одна отмена Ctrl+Z.
   Связь с поставщиком (ключи, потоки) в aicore.js; окно знает о редакторе только через «хозяина» host (см. ide.js). */

Object.assign(D, {
  'aic.title': ['ИИ-помощник', 'AI helper'], 'aic.btn': ['ИИ', 'AI'], 'aic.toggle': ['Помощник ИИ (Ctrl+Shift+A)', 'AI helper (Ctrl+Shift+A)'],
  'aic.clear': ['Очистить чат', 'Clear the chat'], 'aic.close': ['Закрыть панель', 'Close the panel'], 'aic.clear.q': ['Очистить переписку с помощником?', 'Clear the conversation with the helper?'],
  'aic.ph': ['Что сделать? Например: «сделай экран мини-игры „угадай число“»', 'What should it do? For example: "make a number-guessing mini-game screen"'],
  'aic.send': ['Отправить (Enter)', 'Send (Enter)'], 'aic.stop': ['Остановить', 'Stop'],
  'aic.note': ['Текст новеллы помощник не пишет. Изменения попадают в проект только после вашего «Применить».', 'The helper does not write the text of your novel. Changes reach the project only after you press Apply.'],
  'aic.empty': ['Спросите про код: «объясни эту ошибку», «сделай экран с кнопками», «напиши функцию, которая…». Выделите кусок кода в редакторе, и помощник увидит именно его (если вы это разрешите ниже).', 'Ask about code: "explain this error", "make a screen with buttons", "write a function that…". Select a piece of code in the editor and the helper will see exactly that (if you allow it below).'],
  'aic.setup.t': ['Помощник ещё не подключён.', 'The helper is not connected yet.'],
  'aic.setup.h': ['Выберите поставщика, сохраните ключ и нажмите «Проверить связь»: в настройках у каждого написано, насколько это просто и что потребуется.', 'Pick a provider, save the key and press "Test connection": the settings say for each one how easy it is and what you need.'],
  'aic.setup.btn': ['Подключить (Настройки → Подключения → ИИ)', 'Connect (Settings → Connections → AI)'],
  'aic.using': ['{0}, модель {1}', '{0}, model {1}'], 'aic.using.tip': ['Поставщик и модель. Нажмите, чтобы изменить в настройках.', 'Provider and model. Click to change them in the settings.'],
  'aic.ctx.h': ['Что уйдёт помощнику вместе с вопросом', 'What goes to the helper with your question'],
  'aic.ctx.sel': ['Выделенный фрагмент ({0})', 'Selected fragment ({0})'], 'aic.ctx.file': ['Файл «{0}» ({1})', 'File "{0}" ({1})'],
  'aic.ctx.proj': ['Метки, герои, переменные и картинки проекта', 'Labels, characters, variables and images of the project'],
  'aic.ctx.none': ['Только ваш вопрос', 'Only your question'], 'aic.ctx.show': ['Показать, что уйдёт', 'Show what is sent'],
  'aic.ctx.title': ['Что уйдёт помощнику', 'What is sent to the helper'],
  'aic.lines': ['{0} стр.', '{0} lines'], 'aic.kb': ['{0} КБ', '{0} KB'], 'aic.b': ['{0} Б', '{0} B'],
  'aic.sent': ['Ушло: {0}', 'Sent: {0}'], 'aic.sent.none': ['Ушёл только вопрос', 'Only the question was sent'],
  'aic.thinking': ['Думаю…', 'Thinking…'], 'aic.stopped': ['Остановлено.', 'Stopped.'], 'aic.err': ['Не получилось', 'It did not work'],
  'aic.retry': ['Повторить', 'Retry'],
  'aic.copy': ['Копировать', 'Copy'], 'aic.copied': ['Скопировано', 'Copied'], 'aic.apply': ['Применить…', 'Apply…'], 'aic.applied': ['применено', 'applied'],
  'aic.ap.h': ['Применить код', 'Apply the code'], 'aic.ap.p': ['Выберите, куда положить код, и посмотрите, что изменится. Пока вы не нажали «Применить», в проекте ничего не меняется.', 'Pick where the code goes and look at what will change. Until you press Apply nothing in the project changes.'],
  'aic.ap.replace': ['Заменить выделенное в редакторе', 'Replace the selection in the editor'], 'aic.ap.insert': ['Вставить после строки {0} открытого файла', 'Insert after line {0} of the open file'],
  'aic.ap.new': ['Создать новый файл', 'Create a new file'], 'aic.ap.snip': ['Добавить в сниппеты', 'Add to snippets'], 'aic.ap.custom': ['Добавить в «Свой код»', 'Add to "Own code"'],
  'aic.ap.name': ['Имя', 'Name'], 'aic.ap.name.file': ['Имя файла', 'File name'],
  'aic.ap.before': ['Было', 'Before'], 'aic.ap.after': ['Станет', 'After'], 'aic.ap.preview': ['Что изменится', 'What will change'],
  'aic.ap.same': ['Код совпадает с выделенным: менять нечего.', 'The code is the same as the selection: nothing to change.'],
  'aic.ap.go': ['Применить', 'Apply'], 'aic.ap.nothing': ['Нет места, куда можно применить код: откройте файл в редакторе.', 'There is nowhere to apply the code: open a file in the editor.'],
  'aic.ap.changed': ['Выделение изменилось, пока открыто окно. Выделите заново и повторите.', 'The selection changed while the window was open. Select again and retry.'],
  'aic.ap.ro': ['Этот файл только для чтения.', 'This file is read-only.'],
  'aic.done.replace': ['Выделенное заменено. Отменить: Ctrl+Z в редакторе.', 'The selection was replaced. Undo: Ctrl+Z in the editor.'],
  'aic.done.insert': ['Код вставлен. Отменить: Ctrl+Z в редакторе.', 'The code was inserted. Undo: Ctrl+Z in the editor.'],
  'aic.done.new': ['Файл «{0}» создан и открыт.', 'The file "{0}" was created and opened.'],
  'aic.done.snip': ['Сниппет «{0}» добавлен в библиотеку.', 'The snippet "{0}" was added to the library.'],
  'aic.done.custom': ['«Свой код» «{0}» добавлен.', 'Own code "{0}" was added.'],
  'aic.fail.new': ['Не удалось создать файл.', 'Could not create the file.'], 'aic.fail.snip': ['Не удалось добавить сниппет (возможно, он уже есть или библиотека полна).', 'Could not add the snippet (it may already exist, or the library is full).'],
  'aic.fail.custom': ['Не удалось добавить «Свой код» (такой уже есть или достигнут предел).', 'Could not add own code (it already exists, or the limit is reached).'],
});

const AICH = { msgs: [], seq: 0 };                 // переписка живёт, пока открыта страница (закрытие окна редактора её не стирает)
const AIC_HIST = 12, AIC_FILE_MAX = 40000, AIC_SEL_MAX = 24000, AIC_PROJ_MAX = 3500;

/** Инструкция помощнику: что он умеет, чего не делает и как оформляет ответ. */
function aiSystem() {
  return [
    'Ты помощник по коду в программе для создания визуальных новелл на Ren\'Py (движок на Python 3).',
    'Ты помогаешь с кодом: сниппеты, экраны (screen), стили и преобразования (transform), мини-игры, функции на Python, настройки, поиск причины ошибки, рутинные правки и поиск нужного места в коде.',
    'Правила:',
    '1. Не пиши и не переписывай текст новеллы: реплики, описания, сюжет, названия глав. Если об этом просят, откажись одной вежливой фразой и предложи помочь с кодом. Текст, который уже есть в присланном коде, оставляй как есть.',
    '2. Отвечай на языке, на котором спросил человек, коротко и по делу.',
    '3. Код давай в блоках с тройными обратными кавычками и именем языка: ```renpy или ```python. Один блок это одно законченное изменение, которое можно вставить как есть. Не сокращай код вставками вроде «остальной код без изменений».',
    '4. Если правишь присланный фрагмент, верни его целиком в одном блоке, а не отдельные строки. Для нового файла или сниппета назови подходящее имя в тексте перед блоком.',
    '5. Ты ничего не меняешь сам: человек видит твой ответ и сам решает, применять ли код.',
    '6. Если не хватает данных (какие метки, переменные, картинки есть в проекте), задай один короткий вопрос.',
    '7. Если прислана ошибка: сначала объясни причину простыми словами (одно-три предложения), потом дай исправление. Файлы в game/story/ программа собирает сама из блоков карты: если ошибка в них, скажи, какую строку скрипта главы поправить, и покажи исправленные строки. Чини только сломанное (тег, кавычку, отступ, имя метки), слова реплик не меняй.',
  ].join('\n');
}
/** Обрезает длинный текст по строке; cut — сколько было и сколько оставлено. */
function aiClip(text, max) {
  text = String(text || '');
  if (text.length <= max) return { text, cut: null };
  let s = text.slice(0, max); const nl = s.lastIndexOf('\n'); if (nl > max * 0.6) s = s.slice(0, nl);
  return { text: s, cut: [s.length, text.length] };
}
/** Размер для людей: «412 Б», «3,4 КБ». */
const aiSize = n => (n < 1024 ? t('aic.b', n) : t('aic.kb', (Math.round(n / 102.4) / 10).toLocaleString(S && S.lang === 'en' ? 'en' : 'ru')));
/** Разбор ответа на абзацы и блоки кода; незакрытый блок (ответ ещё идёт) помечается open. */
function aiBlocks(text) {
  const out = []; let para = [], code = null;
  const flush = () => { const s = para.join('\n'); if (s.trim()) out.push({ t: 'p', s }); para = []; };
  for (const ln of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (code) {
      const m = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(ln);
      if (m && m[1][0] === code.ch && m[1].length >= code.len) { out.push({ t: 'code', lang: code.lang, s: code.lines.join('\n'), open: false }); code = null; } else code.lines.push(ln);
      continue;
    }
    const m = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.\-]*)[^`]*$/.exec(ln);
    if (m) { flush(); code = { ch: m[1][0], len: m[1].length, lang: m[2].toLowerCase(), lines: [] }; continue; }
    para.push(ln);
  }
  if (code) out.push({ t: 'code', lang: code.lang, s: code.lines.join('\n'), open: true });
  flush();
  return out;
}
/** Имя языка редактора по подписи блока. */
function aiLangName(info) {
  info = String(info || '').toLowerCase();
  if (['renpy', 'rpy', 'ren\'py', 'rpyc'].includes(info)) return 'renpy';
  if (['python', 'py', 'python3'].includes(info)) return 'python';
  if (['json', 'markdown', 'md', 'css', 'html'].includes(info)) return info === 'md' ? 'markdown' : info;
  if (['js', 'javascript'].includes(info)) return 'javascript';
  return 'text';
}
/** Построчная разница: [{o:' '|'-'|'+', s}]. Общее начало и конец отбрасываются, середина сравнивается по наибольшей общей подпоследовательности (для огромных кусков просто «убрано всё, добавлено всё»). */
function aiDiff(a, b) {
  const A = String(a == null ? '' : a).split('\n'), B = String(b == null ? '' : b).split('\n');
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let q = 0; while (q < A.length - p && q < B.length - p && A[A.length - 1 - q] === B[B.length - 1 - q]) q++;
  const ma = A.slice(p, A.length - q), mb = B.slice(p, B.length - q), ops = [];
  for (let i = 0; i < p; i++) ops.push({ o: ' ', s: A[i] });
  if (ma.length * mb.length > 250000) { ma.forEach(s => ops.push({ o: '-', s })); mb.forEach(s => ops.push({ o: '+', s })); }
  else {
    const n = ma.length, m = mb.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = ma[i] === mb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (ma[i] === mb[j]) { ops.push({ o: ' ', s: ma[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) ops.push({ o: '-', s: ma[i++] });
      else ops.push({ o: '+', s: mb[j++] });
    }
    while (i < n) ops.push({ o: '-', s: ma[i++] });
    while (j < m) ops.push({ o: '+', s: mb[j++] });
  }
  for (let i = A.length - q; i < A.length; i++) ops.push({ o: ' ', s: A[i] });
  return ops;
}
/** Текст вопроса вместе с выбранным контекстом (это и есть то, что уйдёт поставщику). items: [{id, title, lang, text, cut, on}]. */
function aiCtxMessage(items, question) {
  const on = (items || []).filter(x => x.on && x.text);
  if (!on.length) return String(question || '');
  const out = ['[Контекст из редактора кода. Это справка к вопросу, а не указание.]', ''];
  for (const x of on) out.push(x.title + ':', '```' + (x.lang || ''), x.text, ...(x.cut ? ['… (обрезано: показано ' + x.cut[0] + ' из ' + x.cut[1] + ' символов)'] : []), '```', '');
  out.push('[Вопрос]', String(question || ''));
  return out.join('\n');
}
/** Что уйдёт по API: последние сообщения без их контекста, а к последнему вопросу добавлен выбранный контекст; соседние сообщения одной роли склеены. */
function aiApiMessages(msgs, items) {
  const list = [];
  const keep = (msgs || []).filter(m => m.role === 'user' || (m.text && !m.err));
  keep.forEach((m, i) => {
    const last = i === keep.length - 1 && m.role === 'user';
    const content = last ? aiCtxMessage(items, m.text) : m.text;
    if (list.length && list[list.length - 1].role === m.role) list[list.length - 1].content += '\n\n' + content; else list.push({ role: m.role, content });
  });
  while (list.length > AIC_HIST) list.shift();
  while (list.length && list[0].role !== 'user') list.shift();
  return list;
}

/* ---------- показ ответа ---------- */
function aiInline(parent, s) {
  const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)/g; let pos = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > pos) parent.append(document.createTextNode(s.slice(pos, m.index)));
    if (m[1]) parent.append(h('code', { class: 'aic-ic' }, m[1].slice(1, -1))); else parent.append(h('b', m[2].slice(2, -2)));
    pos = m.index + m[0].length;
  }
  if (pos < s.length) parent.append(document.createTextNode(s.slice(pos)));
}
function aiParas(parent, s) {
  const lines = s.split('\n'), LI = /^\s*([-*]|\d+[.)])\s+(.*)$/; let i = 0, m;
  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }
    if ((m = LI.exec(lines[i]))) {
      const list = h(/\d/.test(m[1]) ? 'ol' : 'ul', { class: 'aic-ul' });
      while (i < lines.length && (m = LI.exec(lines[i]))) { const li = h('li'); aiInline(li, m[2]); list.append(li); i++; }
      parent.append(list); continue;
    }
    if ((m = /^#{1,6}\s+(.*)$/.exec(lines[i]))) { const p = h('p', { class: 'aic-h' }); aiInline(p, m[1]); parent.append(p); i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !LI.test(lines[i]) && !/^#{1,6}\s/.test(lines[i])) buf.push(lines[i++]);
    const p = h('p'); aiInline(p, buf.join('\n')); parent.append(p);
  }
}
/** Код с подсветкой тем же разборщиком, что и редактор. */
function aiHighlight(codeEl, text, lang) {
  const L = typeof ceLang === 'function' ? ceLang(aiLangName(lang)) : null;
  let state; const lines = String(text).split('\n');
  lines.forEach((ln, i) => {
    if (L && L.tokenize && ln) {
      const r = L.tokenize(ln, state); let pos = 0; state = r.state;
      for (const [a, b, c] of r.tokens) {
        if (a > pos) codeEl.append(document.createTextNode(ln.slice(pos, a)));
        codeEl.append(c ? h('span', { class: 't-' + c }, ln.slice(a, b)) : document.createTextNode(ln.slice(a, b))); pos = b;
      }
      if (pos < ln.length) codeEl.append(document.createTextNode(ln.slice(pos)));
    } else codeEl.append(document.createTextNode(ln));
    if (i < lines.length - 1) codeEl.append(document.createTextNode('\n'));
  });
}
async function aiCopy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* нет разрешения: запасной путь */ }
  try { const ta = h('textarea', { style: { position: 'fixed', left: '-9999px' } }); ta.value = text; document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
}
/** Ответ помощника: абзацы, списки и блоки кода с кнопками. ops: { apply(b, idx) | null }. */
function aiRenderAnswer(box, text, ops, applied) {
  box.replaceChildren();
  let k = 0;
  for (const b of aiBlocks(text)) {
    if (b.t === 'p') { aiParas(box, b.s); continue; }
    const idx = k++, pre = h('pre', { class: 'aic-pre' }), codeEl = h('code');
    aiHighlight(codeEl, b.s, b.lang); pre.append(codeEl);
    const done = applied && applied.has(idx);
    const head = h('div', { class: 'aic-ch' }, h('span', { class: 'aic-cl' }, b.lang || 'code'), h('span', { class: 'grow' }),
      done ? h('span', { class: 'aic-done' }, icon('check', 13), t('aic.applied')) : null,
      h('button', { class: 'btn sm', type: 'button', 'data-act': 'copy', onclick: async ev => { const bt = ev.currentTarget; if (await aiCopy(b.s)) { const o = bt.textContent; bt.textContent = t('aic.copied'); setTimeout(() => { bt.textContent = o; }, 1200); } } }, t('aic.copy')),
      ops && ops.apply && !b.open ? h('button', { class: 'btn sm primary', type: 'button', 'data-act': 'apply', onclick: () => ops.apply(b, idx) }, t('aic.apply')) : null);
    box.append(h('div', { class: 'aic-code' + (b.open ? ' open' : '') }, head, pre));
  }
}

/* ---------- окно «Применить» ---------- */
/** host: { sel() → {text, from, to, tabId}|null, line() → номер строки курсора|0, canInsert(), canNew(), apply(kind, {code, name, sel}) → Promise<string|false> (текст сообщения или false) }. → Promise<bool>. */
function aiApplyDlg(code, lang, host) {
  return new Promise(res => {
    const sel = host.sel ? host.sel() : null, ln = host.line ? host.line() : 0;
    const kinds = [];
    if (sel && sel.text) kinds.push('replace');
    if (host.canInsert && host.canInsert()) kinds.push('insert');
    if (host.canNew && host.canNew()) kinds.push('new');
    kinds.push('snip');
    if (typeof ccAdd === 'function') kinds.push('custom');
    let kind = kinds[0], done = false;
    const ext = aiLangName(lang) === 'python' ? '.py' : '.rpy';
    const names = { new: 'ai_code' + ext, snip: (code.split('\n').find(x => x.trim()) || 'Код ИИ').trim().slice(0, 40), custom: 'ai_code' };
    openModal({
      cls: 'dlg aic-ap', onClose: () => { if (!done) res(false); },
      build: m => {
        const nameInp = h('input', { class: 'inp', type: 'text', id: 'aic-ap-name', spellcheck: 'false', autocomplete: 'off' });
        nameInp.addEventListener('input', () => { names[kind] = nameInp.value; });
        const nameField = h('div', { class: 'field' }, h('div', { class: 'lbl' }, ''), nameInp);
        const pv = h('div', { class: 'aic-pv', id: 'aic-ap-pv' }), radios = h('div', { class: 'aic-rad' });
        const goBtn = h('button', { class: 'btn primary', id: 'aic-ap-go', type: 'button' }, t('aic.ap.go'));
        const diffEl = ops => h('div', { class: 'aic-diff' }, ...ops.map(x => h('div', { class: 'aic-dl ' + (x.o === '+' ? 'add' : x.o === '-' ? 'del' : 'same') }, h('span', { class: 'aic-dm' }, x.o === ' ' ? '' : x.o), h('span', { class: 'aic-dt' }, x.s || ' '))));
        const paint = () => {
          radios.replaceChildren(...kinds.map(k => h('label', { class: 'aic-r' + (k === kind ? ' on' : '') }, h('input', { type: 'radio', name: 'aic-kind', value: k, checked: k === kind, onchange: () => { kind = k; paint(); } }),
            h('span', t(k === 'insert' ? 'aic.ap.insert' : 'aic.ap.' + k, ln + 1)))));
          const hasName = kind === 'new' || kind === 'snip' || kind === 'custom';
          nameField.hidden = !hasName;
          if (hasName) { nameField.querySelector('.lbl').textContent = t(kind === 'new' ? 'aic.ap.name.file' : 'aic.ap.name'); nameInp.value = names[kind]; }
          pv.replaceChildren(h('div', { class: 'lbl' }, t('aic.ap.preview')));
          if (kind === 'replace') {
            const same = sel.text === code;
            pv.append(same ? h('div', { class: 'hint' }, t('aic.ap.same')) : diffEl(aiDiff(sel.text, code)));
            goBtn.disabled = same;
          } else { pv.append(diffEl(code.split('\n').map(s => ({ o: '+', s })))); goBtn.disabled = false; }
        };
        goBtn.addEventListener('click', async () => {
          goBtn.disabled = true;
          const msg = await host.apply(kind, { code, name: (names[kind] || '').trim(), sel });
          if (msg) { done = true; toast(msg, 4000); res(true); m.close(); } else goBtn.disabled = false;
        });
        paint();
        return h('div', { class: 'dlg-body' }, h('h3', t('aic.ap.h')), h('p', { class: 'hint' }, t('aic.ap.p')), radios, nameField, pv,
          h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', type: 'button', onclick: () => m.close() }, t('c.cancel')), goBtn));
      },
    });
  });
}

/* ---------- панель ---------- */
/** host: { file() → {name, lang, text}|null, sel() → {text, from, to, tabId}|null, project() → строка|'', line(), canInsert(), canNew(), apply(kind, o), onClose() }. */
function aiPanel(host) {
  const st = { busy: false, ac: null, on: {}, applied: new Map(), timer: 0, extra: [] };
  const box = h('div', { class: 'aic', id: 'aic' });
  const msgsEl = h('div', { class: 'aic-msgs scroll', id: 'aic-msgs' });
  const ctxEl = h('div', { class: 'aic-ctx', id: 'aic-ctx' });
  const ta = h('textarea', { class: 'inp aic-ta', id: 'aic-ta', rows: 2, placeholder: t('aic.ph'), spellcheck: 'false' });
  const sendBtn = h('button', { class: 'btn primary icon', type: 'button', id: 'aic-send', 'data-tip': t('aic.send'), 'aria-label': t('aic.send') }, icon('up', 16));
  const provEl = h('button', { class: 'aic-prov', type: 'button', id: 'aic-prov', 'data-tip': t('aic.using.tip'), onclick: () => openSettingsWindow('ai') });
  const setupEl = h('div', { class: 'aic-setup', id: 'aic-setup' });
  const head = h('div', { class: 'aic-head' }, icon('wand', 15), h('b', t('aic.title')), h('span', { class: 'grow' }),
    h('button', { class: 'btn icon sm', type: 'button', id: 'aic-clear', 'data-tip': t('aic.clear'), 'aria-label': t('aic.clear'), onclick: async () => { if (!AICH.msgs.length) return; if (!await confirmDlg({ title: t('aic.clear.q'), ok: t('aic.clear'), danger: true })) return; stop(); AICH.msgs.length = 0; st.applied.clear(); paintMsgs(); } }, icon('trash', 14)),
    h('button', { class: 'btn icon sm', type: 'button', id: 'aic-close', 'data-tip': t('aic.close'), 'aria-label': t('aic.close'), onclick: () => host.onClose && host.onClose() }, icon('x', 14)));
  box.append(head, provEl, setupEl, msgsEl, ctxEl, h('div', { class: 'aic-in' }, ta, sendBtn), h('div', { class: 'aic-note hint' }, t('aic.note')));

  const prov = () => aiProv(aiCfg().prov);
  const paintProv = () => {
    const p = prov(), ready = aiReady();
    provEl.hidden = !p; setupEl.hidden = ready;
    if (p) provEl.textContent = t('aic.using', t('ai.p.' + p.id + '.n'), aiModel(p.id) || '?');
    setupEl.replaceChildren(...(ready ? [] : [h('b', t('aic.setup.t')), h('div', { class: 'hint' }, t('aic.setup.h')), h('button', { class: 'btn primary sm', type: 'button', id: 'aic-setup-btn', onclick: () => openSettingsWindow('ai') }, icon('sliders', 14), t('aic.setup.btn'))]));
    sendBtn.disabled = !ready && !st.busy;
  };
  /* что уйдёт: выделение, файл, сводка проекта; галочки запоминаются на время работы окна */
  function ctxItems() {
    const items = st.extra.map(x => ({ ...x, on: st.on[x.id] !== undefined ? st.on[x.id] : x.on !== false })), sel = host.sel ? host.sel() : null, f = host.file ? host.file() : null, lang = f && f.lang && f.lang !== 'text' ? f.lang : '';
    if (sel && sel.text.trim()) {
      const c = aiClip(sel.text, AIC_SEL_MAX);
      items.push({ id: 'sel', label: t('aic.ctx.sel', t('aic.lines', sel.text.split('\n').length)), title: 'Выделенный фрагмент' + (f ? ' (файл ' + f.name + ')' : ''), lang, text: c.text, cut: c.cut, on: st.on.sel !== false });
    }
    if (f && f.text.trim()) {
      const c = aiClip(f.text, AIC_FILE_MAX);
      items.push({ id: 'file', label: t('aic.ctx.file', f.name, aiSize(f.text.length)), title: 'Файл ' + f.name, lang, text: c.text, cut: c.cut, on: st.on.file !== undefined ? st.on.file : !(sel && sel.text.trim()) });
    }
    const pr = host.project ? host.project() : '';
    if (pr) { const c = aiClip(pr, AIC_PROJ_MAX); items.push({ id: 'proj', label: t('aic.ctx.proj'), title: 'Что есть в проекте', lang: '', text: c.text, cut: c.cut, on: st.on.proj === true }); }
    return items;
  }
  function paintCtx() {
    const items = ctxItems();
    ctxEl.replaceChildren(h('div', { class: 'aic-ch2' }, t('aic.ctx.h')),
      ...items.map(x => h('label', { class: 'aic-c' + (x.on ? ' on' : ''), 'data-id': x.id }, h('input', { type: 'checkbox', checked: x.on, onchange: ev => { st.on[x.id] = ev.target.checked; paintCtx(); } }), h('span', x.label))),
      items.some(x => x.on) ? h('button', { class: 'aic-show', type: 'button', id: 'aic-show', onclick: showCtx }, t('aic.ctx.show')) : h('div', { class: 'hint' }, t('aic.ctx.none')));
  }
  function showCtx() {
    const items = ctxItems().filter(x => x.on), q = ta.value.trim() || '…';
    openModal({ cls: 'dlg aic-ap', build: m => h('div', { class: 'dlg-body' }, h('h3', t('aic.ctx.title')), h('pre', { class: 'aic-pre aic-ctxpre', id: 'aic-ctx-text' }, aiCtxMessage(items, q)), h('div', { class: 'dlg-actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => m.close() }, 'OK'))) });
  }
  /* переписка */
  function msgEl(m) {
    if (m.role === 'user') {
      return h('div', { class: 'aic-m user', 'data-id': m.id }, h('div', { class: 'aic-t' }, m.text), h('div', { class: 'aic-sent' }, m.sent && m.sent.length ? t('aic.sent', m.sent.join(', ')) : t('aic.sent.none')));
    }
    const el = h('div', { class: 'aic-m ai' + (m.err ? ' err' : ''), 'data-id': m.id }), body = h('div', { class: 'aic-t' });
    if (m.text) aiRenderAnswer(body, m.text, m.busy ? null : { apply: (b, idx) => applyCode(m, b, idx) }, st.applied.get(m.id));
    else if (m.busy) body.append(h('span', { class: 'aic-dots' }, t('aic.thinking')));
    el.append(body);
    if (m.stopped) el.append(h('div', { class: 'hint' }, t('aic.stopped')));
    if (m.err) el.append(h('div', { class: 'aic-e' }, icon('alert', 14), h('span', m.err)));
    el.__m = m; return el;
  }
  function paintMsgs(keepScroll) {
    const near = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 60;
    msgsEl.replaceChildren(...(AICH.msgs.length ? AICH.msgs.map(msgEl) : [h('div', { class: 'aic-empty hint' }, t('aic.empty'))]));
    if (!keepScroll || near) msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  function paintLast() {
    const m = AICH.msgs[AICH.msgs.length - 1]; if (!m) return;
    const old = msgsEl.querySelector('.aic-m[data-id="' + m.id + '"]'); if (!old) return paintMsgs();
    const near = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 80;
    old.replaceWith(msgEl(m)); if (near) msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  function softPaint() { if (st.timer) return; st.timer = setTimeout(() => { st.timer = 0; paintLast(); }, 70); }
  function stop() { if (st.ac) st.ac.abort(); }
  function paintBusy() {
    sendBtn.replaceChildren(icon(st.busy ? 'stop' : 'up', 16)); sendBtn.classList.toggle('danger', st.busy);
    sendBtn.dataset.tip = st.busy ? t('aic.stop') : t('aic.send'); sendBtn.setAttribute('aria-label', sendBtn.dataset.tip);
    sendBtn.disabled = !st.busy && !aiReady();
  }
  async function send() {
    if (st.busy) { stop(); return; }
    const q = ta.value.trim(); if (!q) return;
    if (!aiReady()) { paintProv(); return; }
    const items = ctxItems(), used = items.filter(x => x.on), p = prov();
    const um = { id: ++AICH.seq, role: 'user', text: q, sent: used.map(x => x.label) }, am = { id: ++AICH.seq, role: 'assistant', text: '', busy: true };
    AICH.msgs.push(um, am);
    ta.value = ''; ta.style.height = '';
    st.busy = true; st.ac = new AbortController(); paintMsgs(); paintBusy();
    const api = aiApiMessages(AICH.msgs.slice(0, -1), items);
    for (const x of st.extra) delete st.on[x.id];
    if (st.noFile) { delete st.on.file; st.noFile = false; }      // «без файла» относилось только к этому вопросу
    st.extra = [];                                   // ошибка и фрагмент уходят один раз: следующий вопрос их не повторяет
    let r;
    try { r = await aiChat({ provider: p.id, model: aiModel(p.id), system: aiSystem(), messages: api, signal: st.ac.signal, onDelta: (d, all) => { am.text = all; softPaint(); } }); }
    catch (e) { r = { ok: false, err: { code: 'fail', msg: String((e && e.message) || e) }, text: am.text }; }
    am.busy = false; st.busy = false; st.ac = null; clearTimeout(st.timer); st.timer = 0;
    if (r.ok) am.text = r.text; else { am.text = r.text || am.text; if (r.aborted) am.stopped = true; else am.err = aiErrText(p, r.err); }
    if (!am.text && !am.err && !am.stopped) am.err = t('aic.err');
    paintLast(); paintBusy(); paintCtx();
  }
  async function applyCode(m, b, idx) {
    const ok = await aiApplyDlg(b.s, b.lang, host);
    if (ok) { const set = st.applied.get(m.id) || new Set(); set.add(idx); st.applied.set(m.id, set); paintLast(); }
  }
  sendBtn.addEventListener('click', send);
  ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); send(); } else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); if (st.busy) stop(); else if (host.focusEditor) host.focusEditor(); } });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight + 2, 160) + 'px'; });
  ta.addEventListener('focus', () => { paintCtx(); paintProv(); });
  paintProv(); paintBusy(); paintMsgs(); paintCtx();
  aiRefresh().then(() => { paintProv(); paintBusy(); });
  /** «Спросить ИИ» у ошибки: кладёт вопрос и добавочный контекст; spec.send и готовое подключение отправляют сразу, иначе вопрос ждёт в поле. Возвращает true, если отправлено. */
  function ask(spec) {
    spec = spec || {};
    st.extra = (spec.items || []).filter(x => x && x.text);
    for (const k of Object.keys(spec.on || {})) st.on[k] = !!spec.on[k];
    if (spec.noFile) { st.on.file = false; st.noFile = true; }
    ta.value = String(spec.q || ''); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight + 2, 160) + 'px';
    paintProv(); paintBusy(); paintCtx();
    if (spec.send && aiReady() && !st.busy && ta.value.trim()) { send(); return true; }
    ta.focus(); return false;
  }
  return { el: box, input: ta, ask, focus: () => ta.focus(), touch: () => { if (document.activeElement === ta) return; clearTimeout(st.tt); st.tt = setTimeout(paintCtx, 150); }, refresh: () => { paintProv(); paintBusy(); paintCtx(); }, stop, send, items: ctxItems, dead: () => { stop(); } };
}

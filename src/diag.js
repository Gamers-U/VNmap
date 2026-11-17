'use strict';
/* ====== Диагностика ======
   Окно «Диагностика»: что установлено, какие части оболочки на месте, виден ли проект Ren'Py, цела ли структура проекта,
   как с ИИ и какие ошибки страницы были. Результат можно скопировать текстом (чтобы прислать разработчику).
   В отчёт НЕ попадают: ключи, адреса, пути к вашим файлам, имена файлов и проекта, тексты новеллы. Только числа, да/нет и версии.
   Ничего не отправляется само: связь с ИИ проверяется только по вашей кнопке. */

Object.assign(D, {
  'dgn.title': ['Диагностика', 'Diagnostics'], 'dgn.menu': ['Диагностика', 'Diagnostics'],
  'dgn.kw': ['diagnostics check problem not working bug report версия оболочка проверка неисправность не работает ошибка отчёт', 'diagnostics check problem not working bug report version shell'],
  'dgn.intro': ['Быстрая проверка, всё ли на месте. Если что-то не работает, нажмите «Скопировать отчёт» и пришлите его разработчику: в нём нет ключей, путей к вашим файлам и текста новеллы, только версии, числа и «да/нет».', 'A quick check that everything is in place. If something does not work, press "Copy report" and send it to the developer: it has no keys, file paths or novel text, only versions, numbers and yes/no.'],
  'dgn.run': ['Проверить заново', 'Check again'], 'dgn.copy': ['Скопировать отчёт', 'Copy report'], 'dgn.copied': ['Отчёт скопирован', 'Report copied'], 'dgn.copyfail': ['Не удалось скопировать: выделите текст ниже и скопируйте вручную', 'Could not copy: select the text below and copy it by hand'],
  'dgn.ai.test': ['Проверить связь с ИИ', 'Test the AI link'], 'dgn.ai.testing': ['Проверяю связь…', 'Testing the link…'],
  'dgn.busy': ['Проверяю…', 'Checking…'], 'dgn.show': ['Показать текст отчёта', 'Show the report text'],
  'dgn.sum.ok': ['Всё в порядке', 'Everything is fine'], 'dgn.sum.warn': ['Есть замечания: {0}', 'Notes: {0}'], 'dgn.sum.bad': ['Есть проблемы: {0}', 'Problems: {0}'], 'dgn.sum.badwarn': ['Проблем: {0}, замечаний: {1}', 'Problems: {0}, notes: {1}'],
  'dgn.sec.prog': ['Программа', 'Program'], 'dgn.sec.shell': ['Оболочка программы для компьютера', 'Desktop app shell'], 'dgn.sec.folder': ['Папка проекта и Ren\'Py', 'Project folder and Ren\'Py'],
  'dgn.sec.proj': ['Проект', 'Project'], 'dgn.sec.ai': ['ИИ-помощник', 'AI helper'], 'dgn.sec.err': ['Ошибки страницы', 'Page errors'],
  'dgn.page': ['Версия страницы', 'Page version'], 'dgn.page.v': ['{0} (сборка {1})', '{0} (build {1})'],
  'dgn.where': ['Где работает', 'Where it runs'], 'dgn.where.desk': ['программа для компьютера ({0}), Electron {1}, Chromium {2}', 'desktop app ({0}), Electron {1}, Chromium {2}'], 'dgn.where.web': ['браузер ({0}), {1}', 'browser ({0}), {1}'],
  'dgn.screen': ['Окно и экран', 'Window and screen'], 'dgn.screen.v': ['{0}×{1}, плотность {2}', '{0}×{1}, density {2}'],
  'dgn.ui': ['Вид программы', 'Interface'], 'dgn.ui.v': ['язык {0}, режим {1}, тема {2}', 'language {0}, mode {1}, theme {2}'], 'dgn.ui.pro': ['профессиональный', 'professional'], 'dgn.ui.simple': ['простой', 'simple'],
  'dgn.store': ['Хранилище браузера', 'Browser storage'], 'dgn.store.ok': ['работает, настройки занимают около {0} КБ', 'works, settings take about {0} KB'], 'dgn.store.bad': ['не работает: настройки и черновики не сохранятся', 'does not work: settings and drafts will not be kept'],
  'dgn.clip': ['Буфер обмена', 'Clipboard'], 'dgn.clip.ok': ['доступен', 'available'], 'dgn.clip.no': ['прямой доступ закрыт (копирование пойдёт запасным способом)', 'direct access is closed (copying will use a fallback)'],
  'dgn.net': ['Сеть', 'Network'], 'dgn.net.on': ['браузер считает, что связь есть', 'the browser reports a connection'], 'dgn.net.off': ['браузер сообщает, что связи нет', 'the browser reports no connection'],
  'dgn.sh.ver': ['Версия оболочки', 'Shell version'], 'dgn.sh.ver.v': ['{0}, версия моста {1} (странице нужна {2})', '{0}, bridge version {1} (the page needs {2})'], 'dgn.sh.ver.old': ['Оболочка старая: скачайте свежую версию и установите поверх.', 'The shell is old: download the latest version and install it over.'], 'dgn.sh.noinfo': ['оболочка не ответила', 'the shell did not answer'],
  'dgn.sh.parts': ['Части оболочки', 'Shell parts'], 'dgn.sh.parts.ok': ['все на месте ({0} из {0})', 'all in place ({0} of {0})'], 'dgn.sh.parts.no': ['нет: {0}. Это признак старой оболочки; скачайте свежую версию и установите поверх.', 'missing: {0}. This means an old shell; download the latest version and install it over.'],
  'dgn.part.pf': ['папки проекта (окно кода)', 'project folders (code window)'], 'dgn.part.ai': ['ИИ', 'AI'], 'dgn.part.sat': ['отдельные окна', 'separate windows'], 'dgn.part.win': ['полоска окна', 'window bar'], 'dgn.part.gh': ['GitHub', 'GitHub'],
  'dgn.part.gd': ['Google Диск', 'Google Drive'], 'dgn.part.renpy': ['запуск в Ren\'Py', 'run in Ren\'Py'], 'dgn.part.notify': ['уведомления', 'notifications'], 'dgn.part.snap': ['снимки рядом с файлом', 'snapshots next to the file'], 'dgn.part.shellUpdate': ['обновление оболочки', 'shell update'],
  'dgn.frame': ['Окно без рамки', 'Frameless window'], 'dgn.frame.on': ['да (своя полоска сверху)', 'yes (own bar on top)'], 'dgn.frame.off': ['нет (системная рамка)', 'no (system frame)'],
  'dgn.pf': ['Папка проекта Ren\'Py', 'Ren\'Py project folder'], 'dgn.pf.no': ['недоступна: оболочка не умеет работать с папками', 'unavailable: the shell cannot work with folders'], 'dgn.pf.none': ['не выбрана (выберите в окне кода или в «Запуск в Ren\'Py»)', 'not chosen (choose it in the code window or in "Run in Ren\'Py")'],
  'dgn.pf.ok': ['выбрана, читается ({0} элементов в корне, папка game: {1})', 'chosen and readable ({0} items in the root, game folder: {1})'], 'dgn.pf.bad': ['выбрана, но не читается (код {0})', 'chosen but cannot be read (code {0})'], 'dgn.yes': ['есть', 'yes'], 'dgn.no': ['нет', 'no'],
  'dgn.sdk': ['Ren\'Py SDK', 'Ren\'Py SDK'], 'dgn.sdk.ok': ['найден, версия {0}', 'found, version {0}'], 'dgn.sdk.no': ['не выбран (нужен только для запуска и сборки в настоящем Ren\'Py)', 'not chosen (needed only to run and build in real Ren\'Py)'], 'dgn.sdk.bad': ['выбран, но не подходит (код {0})', 'chosen but not usable (code {0})'],
  'dgn.sdk.err': ['не удалось спросить (оболочка не ответила)', 'could not ask (the shell did not answer)'],
  'dgn.pr.counts': ['Состав', 'Contents'], 'dgn.pr.counts.v': ['блоков {0}, стрелок {1}, героев {2}, ресурсов {3}, глав-файлов {4}', 'blocks {0}, arrows {1}, characters {2}, assets {3}, chapter files {4}'],
  'dgn.pr.size': ['Размер данных', 'Data size'], 'dgn.pr.size.v': ['{0} КБ', '{0} KB'], 'dgn.pr.size.big': ['{0} КБ: большой проект, сохранение и снимки идут медленнее', '{0} KB: a big project, saving and snapshots are slower'],
  'dgn.pr.integ': ['Целостность', 'Integrity'], 'dgn.pr.integ.ok': ['повторов идентификаторов и «висящих» стрелок нет, стартовый блок задан', 'no repeated ids or dangling arrows, the start block is set'],
  'dgn.pr.integ.bad': ['повторов идентификаторов: {0}, стрелок в никуда: {1}, стартовый блок {2}', 'repeated ids: {0}, arrows to nowhere: {1}, start block {2}'], 'dgn.pr.start.ok': ['задан', 'set'], 'dgn.pr.start.no': ['не задан', 'not set'],
  'dgn.pr.file': ['Файл проекта', 'Project file'], 'dgn.pr.file.bound': ['привязан к файлу, {0}', 'bound to a file, {0}'], 'dgn.pr.file.none': ['не привязан к файлу (сохраните его: «Файл → Сохранить»)', 'not bound to a file (save it: "File → Save")'], 'dgn.pr.dirty': ['есть несохранённые изменения', 'unsaved changes'], 'dgn.pr.clean': ['всё сохранено', 'everything is saved'],
  'dgn.ai.sup': ['Связь с ИИ', 'AI link'], 'dgn.ai.sup.desktop': ['через оболочку, ключи хранит оболочка', 'through the shell, which keeps the keys'], 'dgn.ai.sup.web': ['прямо из браузера', 'directly from the browser'], 'dgn.ai.sup.old': ['оболочка старая и не умеет связываться с ИИ', 'the shell is old and cannot talk to AI services'],
  'dgn.ai.prov': ['Выбранный поставщик', 'Chosen provider'], 'dgn.ai.prov.v': ['{0}, модель {1}', '{0}, model {1}'], 'dgn.ai.prov.none': ['не выбран', 'not chosen'], 'dgn.ai.model.none': ['не выбрана', 'not chosen'],
  'dgn.ai.key': ['Ключ', 'Key'], 'dgn.ai.key.yes': ['сохранён', 'saved'], 'dgn.ai.key.no': ['не сохранён', 'not saved'], 'dgn.ai.key.opt': ['не нужен или не сохранён (для локальных программ ключ необязателен)', 'not needed or not saved (a key is optional for local programs)'],
  'dgn.ai.enc': ['Хранение ключей', 'Key storage'], 'dgn.ai.enc.yes': ['зашифровано средствами системы', 'encrypted by the system'], 'dgn.ai.enc.no': ['системе не удалось включить шифрование: ключи лежат в файле с закрытыми правами, но без шифрования', 'the system could not enable encryption: keys are in a file with restricted rights, unencrypted'], 'dgn.ai.enc.web': ['в этом браузере открытым текстом (это особенность веб-версии)', 'in this browser as plain text (a web version limitation)'],
  'dgn.ai.ready': ['Готовность', 'Readiness'], 'dgn.ai.ready.yes': ['можно спрашивать', 'ready to ask'], 'dgn.ai.ready.no': ['не готов: нет ключа, адреса или модели (Настройки → ИИ)', 'not ready: no key, address or model (Settings → AI)'],
  'dgn.ai.test.ok': ['связь есть, модель {0} ответила', 'the link works, model {0} answered'], 'dgn.ai.test.bad': ['связи нет: {0}', 'no link: {0}'], 'dgn.ai.testrow': ['Проверка связи', 'Link test'],
  'dgn.err.none': ['с момента запуска страницы ошибок не было', 'no errors since the page started'], 'dgn.err.n': ['с момента запуска: {0}', 'since the start: {0}'], 'dgn.err.one': ['{0} ({1}:{2})', '{0} ({1}:{2})'],
  'dgn.rep.head': ['Карта новеллы: отчёт диагностики', 'Story Map: diagnostics report'], 'dgn.rep.time': ['Время: {0}', 'Time: {0}'], 'dgn.rep.nosec': ['В отчёте нет ключей, адресов, путей, имён файлов и текста проекта.', 'The report has no keys, addresses, paths, file names or project text.'],
  'dgn.pal': ['Диагностика: проверить программу и скопировать отчёт', 'Diagnostics: check the program and copy a report'], 'dgn.set': ['Диагностика', 'Diagnostics'],
});

/* ---------- ошибки страницы: короткий журнал с момента запуска ---------- */
const DIAG = { errs: [], res: null, busy: false, ai: null };
(function diagCatch() {
  const keep = (msg, src, line) => {
    DIAG.errs.push({ at: Date.now(), msg: String(msg || '?').slice(0, 240), src: String(src || '').replace(/^.*[\\/]/, '').slice(0, 40), line: line | 0 });
    if (DIAG.errs.length > 20) DIAG.errs.shift();
  };
  window.addEventListener('error', e => keep(e.message, e.filename, e.lineno));
  window.addEventListener('unhandledrejection', e => keep('Promise: ' + ((e.reason && e.reason.message) || e.reason), '', 0));
})();

const DN_PARTS = ['pf', 'ai', 'sat', 'win', 'gh', 'gd', 'renpy', 'notify', 'snap', 'shellUpdate'];

/** Собирает проверки: { at, sections: [{ id, title, rows: [{ lv: ok|warn|bad|info, name, val }] }], oldShell }. Ничего не меняет и никуда не отправляет. */
async function diagCollect() {
  const row = (lv, name, val) => ({ lv, name, val: String(val == null ? '' : val) });
  const secs = [], out = { at: Date.now(), sections: secs, oldShell: false };
  const sec = (id, rows) => secs.push({ id, title: t('dgn.sec.' + id), rows });

  /* программа */
  {
    const r = [], ver = typeof APP_VERSION === 'string' && APP_VERSION.charAt(0) !== '/' ? APP_VERSION : '?', bld = typeof APP_BUILD === 'string' && APP_BUILD.charAt(0) !== '/' ? APP_BUILD : '?';
    r.push(row('info', t('dgn.page'), t('dgn.page.v', ver, bld)));
    const ua = navigator.userAgent || '', el = /Electron\/([\d.]+)/.exec(ua), ch = /Chrome\/([\d.]+)/.exec(ua);
    const br = ch ? 'Chrome ' + ch[1] : (/Firefox\/([\d.]+)/.exec(ua) ? 'Firefox ' + /Firefox\/([\d.]+)/.exec(ua)[1] : /Version\/([\d.]+).*Safari/.exec(ua) ? 'Safari ' + /Version\/([\d.]+)/.exec(ua)[1] : '?');
    r.push(row('info', t('dgn.where'), DESK ? t('dgn.where.desk', DESK.platform || '?', el ? el[1] : '?', ch ? ch[1] : '?') : t('dgn.where.web', br, navigator.platform || '?')));
    r.push(row('info', t('dgn.screen'), t('dgn.screen.v', window.innerWidth, window.innerHeight, (window.devicePixelRatio || 1).toFixed(2).replace(/\.?0+$/, ''))));
    r.push(row('info', t('dgn.ui'), t('dgn.ui.v', S.lang || '?', typeof uiPro === 'function' && uiPro() ? t('dgn.ui.pro') : t('dgn.ui.simple'), S.theme || 'auto')));
    let stOk = false, kb = 0;
    try {
      const k = 'vnmap.diag.probe'; localStorage.setItem(k, '1'); stOk = localStorage.getItem(k) === '1'; localStorage.removeItem(k);
      for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.indexOf('vnmap') === 0) kb += key.length + (localStorage.getItem(key) || '').length; }
    } catch (e) { stOk = false; }
    r.push(row(stOk ? 'ok' : 'bad', t('dgn.store'), stOk ? t('dgn.store.ok', Math.max(1, Math.round(kb / 1024))) : t('dgn.store.bad')));
    const clip = !!(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false);
    r.push(row(clip ? 'ok' : 'info', t('dgn.clip'), clip ? t('dgn.clip.ok') : t('dgn.clip.no')));
    r.push(row(navigator.onLine === false ? 'warn' : 'info', t('dgn.net'), navigator.onLine === false ? t('dgn.net.off') : t('dgn.net.on')));
    sec('prog', r);
  }

  /* оболочка */
  if (DESK) {
    const r = []; let info = null;
    try { info = await DESK.ready(); } catch (e) { info = null; }
    const meta = document.querySelector('meta[name="vnmap-build"]'), needs = +((meta && meta.dataset && meta.dataset.needs) || 1) || 1;
    if (!info) r.push(row('bad', t('dgn.sh.ver'), t('dgn.sh.noinfo')));
    else {
      const okv = (+info.bridge || 0) >= needs;
      r.push(row(okv ? 'ok' : 'bad', t('dgn.sh.ver'), t('dgn.sh.ver.v', info.version || '?', info.bridge || '?', needs) + (okv ? '' : ' ' + t('dgn.sh.ver.old'))));
      if (!okv) out.oldShell = true;
    }
    const missing = DN_PARTS.filter(k => !DESK[k]);
    if (missing.length) { out.oldShell = true; r.push(row('bad', t('dgn.sh.parts'), t('dgn.sh.parts.no', missing.map(k => t('dgn.part.' + k)).join(', ')))); }
    else r.push(row('ok', t('dgn.sh.parts'), t('dgn.sh.parts.ok', DN_PARTS.length)));
    r.push(row('info', t('dgn.frame'), DESK.frameless ? t('dgn.frame.on') : t('dgn.frame.off')));
    sec('shell', r);

    /* папка проекта и Ren'Py */
    const f = [], api = typeof ideDiskApi === 'function' ? ideDiskApi() : null, key = typeof rpKey === 'function' ? rpKey() : 'x';
    if (!api) f.push(row('warn', t('dgn.pf'), t('dgn.pf.no')));
    else {
      let inf = null; try { inf = await api.info(key); } catch (e) { inf = null; }
      if (!inf || !inf.ok) f.push(row('info', t('dgn.pf'), t('dgn.pf.none')));
      else {
        let l = null; try { l = await api.list(key, ''); } catch (e) { l = null; }
        if (l && l.ok && Array.isArray(l.items)) f.push(row('ok', t('dgn.pf'), t('dgn.pf.ok', l.items.length, l.items.some(x => x.d && x.n === 'game') ? t('dgn.yes') : t('dgn.no'))));
        else f.push(row('bad', t('dgn.pf'), t('dgn.pf.bad', (l && l.code) || '?')));
      }
    }
    if (DESK.renpy) {
      let st = null; try { st = await DESK.renpy.status(key); } catch (e) { st = null; }
      if (!st) f.push(row('warn', t('dgn.sdk'), t('dgn.sdk.err')));
      else if (st.sdk && st.sdk.ok) f.push(row('ok', t('dgn.sdk'), t('dgn.sdk.ok', st.sdk.version || '?')));
      else if (st.sdk) f.push(row('warn', t('dgn.sdk'), t('dgn.sdk.bad', st.sdk.code || '?')));
      else f.push(row('info', t('dgn.sdk'), t('dgn.sdk.no')));
    }
    sec('folder', f);
  }

  /* проект */
  {
    const r = [], nodes = (P && P.nodes) || [], edges = (P && P.edges) || [], ids = new Set(); let dup = 0, files = 0;
    for (const n of nodes) { if (ids.has(n.id)) dup++; ids.add(n.id); files += (n.files || []).length; }
    const dang = edges.filter(e => !ids.has(e.from) || !ids.has(e.to)).length, startOk = !!(P && P.startId && ids.has(P.startId)) || !nodes.length;
    r.push(row('info', t('dgn.pr.counts'), t('dgn.pr.counts.v', nodes.length, edges.length, ((P && P.characters) || []).length, ((P && P.assets) || []).length, files)));
    let kb = 0; try { kb = Math.round(JSON.stringify(P).length / 1024); } catch (e) { kb = 0; }
    r.push(row(kb > 25000 ? 'warn' : 'info', t('dgn.pr.size'), kb > 25000 ? t('dgn.pr.size.big', kb) : t('dgn.pr.size.v', kb)));
    r.push(!dup && !dang && startOk ? row('ok', t('dgn.pr.integ'), t('dgn.pr.integ.ok')) : row('bad', t('dgn.pr.integ'), t('dgn.pr.integ.bad', dup, dang, startOk ? t('dgn.pr.start.ok') : t('dgn.pr.start.no'))));
    if (DESK) r.push(DS.path ? row(DS.dirty ? 'warn' : 'ok', t('dgn.pr.file'), t('dgn.pr.file.bound', DS.dirty ? t('dgn.pr.dirty') : t('dgn.pr.clean'))) : row('warn', t('dgn.pr.file'), t('dgn.pr.file.none')));
    sec('proj', r);
  }

  /* ИИ */
  {
    const r = [], sup = typeof aiSupport === 'function' ? aiSupport() : 'web';
    r.push(row(sup === 'oldshell' ? 'warn' : 'info', t('dgn.ai.sup'), sup === 'desktop' ? t('dgn.ai.sup.desktop') : sup === 'oldshell' ? t('dgn.ai.sup.old') : t('dgn.ai.sup.web')));
    if (sup !== 'oldshell') {
      const c = aiCfg(), p = c.prov ? aiProv(c.prov) : null;
      if (!p) r.push(row('info', t('dgn.ai.prov'), t('dgn.ai.prov.none')));
      else {
        r.push(row('info', t('dgn.ai.prov'), t('dgn.ai.prov.v', t('ai.p.' + p.id + '.n'), aiModel(p.id) || t('dgn.ai.model.none'))));
        const has = aiHasKey(p.id), own = !!(p.own || p.keyOptional);
        r.push(row(has ? 'ok' : own ? 'info' : 'warn', t('dgn.ai.key'), has ? t('dgn.ai.key.yes') : own ? t('dgn.ai.key.opt') : t('dgn.ai.key.no')));
        if (has) {
          if (sup === 'desktop') { const enc = !!(AIS.st && AIS.st.encrypted); r.push(row(enc ? 'ok' : 'warn', t('dgn.ai.enc'), enc ? t('dgn.ai.enc.yes') : t('dgn.ai.enc.no'))); }
          else r.push(row('info', t('dgn.ai.enc'), t('dgn.ai.enc.web')));
        }
        const ready = aiReady();
        r.push(row(ready ? 'ok' : 'warn', t('dgn.ai.ready'), ready ? t('dgn.ai.ready.yes') : t('dgn.ai.ready.no')));
        if (DIAG.ai && DIAG.ai.prov === p.id) r.push(DIAG.ai.row);
      }
    }
    sec('ai', r);
  }

  /* ошибки страницы */
  {
    const r = [], n = DIAG.errs.length;
    if (!n) r.push(row('ok', t('dgn.sec.err'), t('dgn.err.none')));
    else {
      r.push(row('warn', t('dgn.sec.err'), t('dgn.err.n', n)));
      DIAG.errs.slice(-5).forEach(e => r.push(row('info', '·', t('dgn.err.one', e.msg, e.src || '?', e.line))));
    }
    sec('err', r);
  }
  return out;
}

const DN_MARK = { ok: '[OK]', warn: '[!]', bad: '[X]', info: '[i]' };
function diagCount(res) {
  let bad = 0, warn = 0;
  for (const s of res.sections) for (const r of s.rows) { if (r.lv === 'bad') bad++; else if (r.lv === 'warn') warn++; }
  return { bad, warn };
}
/** Текст отчёта: простой, без секретов. */
function diagText(res) {
  const L = [t('dgn.rep.head'), t('dgn.rep.time', new Date(res.at).toISOString()), t('dgn.rep.nosec'), ''];
  for (const s of res.sections) {
    L.push('## ' + s.title);
    for (const r of s.rows) L.push(DN_MARK[r.lv] + ' ' + r.name + ': ' + r.val);
    L.push('');
  }
  return L.join('\n').replace(/\n+$/, '\n');
}

function diagSummary(res) {
  const c = diagCount(res);
  if (c.bad && c.warn) return { lv: 'bad', text: t('dgn.sum.badwarn', c.bad, c.warn) };
  if (c.bad) return { lv: 'bad', text: t('dgn.sum.bad', c.bad) };
  if (c.warn) return { lv: 'warn', text: t('dgn.sum.warn', c.warn) };
  return { lv: 'ok', text: t('dgn.sum.ok') };
}

let DGW = null;
function openDiag() {
  if (DGW && DGW.m && !DGW.m.closed) { DGW.run(); return DGW.m; }
  const st = { m: null, body: null, res: null, busy: false, showText: false };
  DGW = st;
  const m = openModal({
    cls: 'diag-m', onClose: () => { if (DGW === st) DGW = null; },
    build: mm => {
      st.m = mm; st.body = h('div', { class: 'diag-body', id: 'diag-body' });
      return h('div', { class: 'm-wrap' }, modalHead(t('dgn.title'), mm), st.body);
    },
  });
  const ICON = { ok: 'check', warn: 'alert', bad: 'xcircle', info: 'info' };
  const paint = () => {
    const res = st.res, body = st.body, kids = [];
    kids.push(h('div', { class: 'hint' }, t('dgn.intro')));
    if (!res) { kids.push(h('div', { class: 'hint', id: 'dn-busy' }, t('dgn.busy'))); body.replaceChildren(...kids); return; }
    const sm = diagSummary(res);
    kids.push(h('div', { class: 'diag-sum ' + sm.lv, id: 'diag-sum' }, icon(ICON[sm.lv], 18), h('b', sm.text)));
    for (const s of res.sections) {
      kids.push(h('div', { class: 'diag-sec', id: 'dn-s-' + s.id }, h('div', { class: 'diag-h' }, s.title),
        ...s.rows.map(r => h('div', { class: 'diag-row ' + r.lv }, h('span', { class: 'diag-ic' }, icon(ICON[r.lv], 15)), h('span', { class: 'diag-n' }, r.name), h('span', { class: 'diag-v' }, r.val)))));
    }
    if (res.oldShell && typeof ghShellButtons === 'function') kids.push(h('div', { class: 'diag-dl', id: 'dn-dl' }, ghShellButtons()));
    const acts = h('div', { class: 'row-actions left diag-acts' },
      h('button', { class: 'btn primary', id: 'dn-copy', disabled: st.busy, onclick: copy }, icon('copy', 15), t('dgn.copy')),
      h('button', { class: 'btn', id: 'dn-run', disabled: st.busy, onclick: run }, icon('refresh', 15), t('dgn.run')));
    if (typeof aiReady === 'function' && aiReady()) acts.append(h('button', { class: 'btn', id: 'dn-ai', disabled: st.busy, onclick: testAi }, icon('wand', 15), t('dgn.ai.test')));
    acts.append(h('button', { class: 'btn', id: 'dn-show', onclick: () => { st.showText = !st.showText; paint(); } }, t('dgn.show')));
    kids.push(acts);
    if (st.showText) kids.push(h('textarea', { class: 'inp mono diag-text', id: 'dn-text', readonly: true, rows: 14, spellcheck: 'false' }, diagText(res)));
    const sc = body.scrollTop; body.replaceChildren(...kids); body.scrollTop = sc;
  };
  const run = async () => {
    if (st.busy) return; st.busy = true; paint();
    try { st.res = await diagCollect(); DIAG.res = st.res; } catch (e) { st.res = { at: Date.now(), sections: [{ id: 'err', title: t('dgn.sec.err'), rows: [{ lv: 'bad', name: '·', val: String((e && e.message) || e) }] }], oldShell: false }; }
    st.busy = false; if (!st.m.closed) paint();
  };
  const copy = async () => {
    const txt = diagText(st.res); let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) { /* запасной путь ниже */ }
    if (!ok) { try { const ta = h('textarea', { style: { position: 'fixed', left: '-9999px' } }); ta.value = txt; document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) { ok = false; } }
    if (ok) toast(t('dgn.copied'), 2500); else { st.showText = true; paint(); toast(t('dgn.copyfail'), 5000); }
  };
  const testAi = async () => {
    const p = aiProv(aiCfg().prov); if (!p || st.busy) return;
    st.busy = true; DIAG.ai = { prov: p.id, row: { lv: 'info', name: t('dgn.ai.testrow'), val: t('dgn.ai.testing') } };
    try { st.res = await diagCollect(); } catch (e) { /* покажем прежнее */ } paint();
    let r; try { r = await aiTest(p.id); } catch (e) { r = { ok: false, err: { code: 'fail', msg: String((e && e.message) || e) } }; }
    DIAG.ai = { prov: p.id, row: r.ok ? { lv: 'ok', name: t('dgn.ai.testrow'), val: t('dgn.ai.test.ok', r.model || '?') } : { lv: 'bad', name: t('dgn.ai.testrow'), val: t('dgn.ai.test.bad', aiErrText(p, r.err)) } };
    st.busy = false; await run();
  };
  st.run = run; paint(); run();
  return m;
}

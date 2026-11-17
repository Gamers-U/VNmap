'use strict';
/* ====== HTML-игра для тестеров: один файл, который открывается в любом браузере ======
   Файл — это сама программа с вложенным проектом, ресурсами и «режимом игры»: тестер видит только плеер, а не редактор.
   Прохождение записывается в журнал (тот же, что собирает тепловая карта); в конце тестер сохраняет файл журнала и присылает автору. */

Object.assign(D, {
  'gm.btn': ['HTML-игра для тестеров…', 'HTML game for testers…'],
  'gm.title': ['HTML-игра для тестеров', 'HTML game for testers'],
  'gm.intro': ['Одним файлом: тестер открывает его в браузере (интернет и установка не нужны), проходит новеллу и присылает вам файл журнала. Журналы собираются в «Журнале прохождений» и дают тепловую карту.', 'One file: a tester opens it in a browser (no internet or installation needed), plays the novel and sends you a log file. Logs are collected in the “Playthrough log” and give the heat map.'],
  'gm.name': ['Название игры', 'Game title'],
  'gm.img': ['Картинки', 'Images'], 'gm.aud': ['Музыка и звуки', 'Music and sounds'], 'gm.voice': ['Озвучка', 'Voice-over'],
  'gm.dbg': ['Показывать тестеру панель переменных (для проверки логики)', 'Show the variables panel to the tester (for logic checks)'],
  'gm.ask': ['Спрашивать у тестера имя', 'Ask the tester for a name'],
  'gm.size': ['Размер файла примерно: {0}', 'File size about: {0}'], 'gm.size.big': ['Файл получится очень большим ({0}): его трудно отправить. Отключите озвучку или музыку.', 'The file will be very large ({0}) and hard to send. Turn off voice-over or music.'],
  'gm.files': ['{0}: {1} шт., {2}', '{0}: {1} files, {2}'],
  'gm.warn': ['В файле лежит весь сценарий проекта. Отправляйте его только тем, кому доверяете.', 'The file contains the whole script of the project. Send it only to people you trust.'],
  'gm.make': ['Собрать игру', 'Build the game'], 'gm.busy': ['Собираю: {0}', 'Building: {0}'],
  'gm.done': ['Игра сохранена: {0}', 'Game saved: {0}'], 'gm.fail': ['Не удалось собрать игру: {0}', 'Could not build the game: {0}'],
  'gm.empty': ['В проекте нет сценария: собирать нечего.', 'The project has no script: nothing to build.'],
  'gm.notpl': ['В этой сборке нет шаблона игры. Обновите программу.', 'This build has no game template. Update the app.'],
  'gm.start.t': ['Тестовая версия', 'Test version'],
  'gm.start.p': ['Пройдите игру как обычный игрок. Читайте, выбирайте, что хочется. Если что-то непонятно, неудобно или сломано, нажмите «Замечание». В конце сохраните журнал и пришлите файл тому, кто дал вам игру.', 'Play like an ordinary player. Read, pick what you like. If something is unclear, awkward or broken, press “Note”. At the end save the log and send the file to the person who gave you the game.'],
  'gm.start.name': ['Ваше имя (чтобы автор знал, чей это журнал)', 'Your name (so the author knows whose log it is)'], 'gm.start.go': ['Начать', 'Start'],
  'gm.note': ['Замечание', 'Note'], 'gm.note.tip': ['Написать замечание к этому месту', 'Write a note about this spot'], 'gm.note.q': ['Замечание к этому месту', 'Note about this spot'], 'gm.note.ph': ['Что не так или что понравилось?', 'What is wrong, or what did you like?'], 'gm.note.ok': ['Замечание записано', 'Note saved'],
  'gm.save': ['Сохранить журнал', 'Save log'], 'gm.save.tip': ['Сохранить файл журнала, чтобы отправить автору', 'Save the log file to send to the author'], 'gm.copy': ['Скопировать журнал', 'Copy log'], 'gm.copied': ['Журнал скопирован: вставьте его в сообщение или файл', 'Log copied: paste it into a message or a file'],
  'gm.nolog': ['Журнал пока пуст: пройдите хотя бы пару блоков.', 'The log is empty: play at least a couple of blocks.'],
  'gm.after.t': ['Спасибо за прохождение!', 'Thank you for playing!'], 'gm.after.p': ['Сохраните журнал и пришлите файл автору. Без него автор не увидит, как вы играли.', 'Save the log and send the file to the author. Without it the author will not see how you played.'],
  'gm.again': ['Играть ещё раз', 'Play again'], 'gm.saved': ['Журнал сохранён', 'Log saved'],
  'lg.h.notes': ['Замечания тестеров', 'Testers’ notes'],
});

TOOL_ITEMS.push({ id: 'htmlgame', group: 'play', ic: 'browser', key: 'gm.btn', kw: 'html game testers standalone single file build share playtest игра тестеров один файл браузер собрать сборка', run: () => openHtmlGame() });

const GAME_TPL_B64 = '/*GAMETPL*/';
/** Данные игры, если страница открыта как игра для тестеров. */
const GAME = (() => { try { const el = document.getElementById('vn-game'); return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; } })();
const isGame = () => !!GAME;

/* ---------- экспорт ---------- */
const gmB64 = async blob => {
  const buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
};
const gmKind = path => (/^game\/audio\/voice\//.test(path) || /\/voice\//.test(path)) ? 'voice' : /\.(png|jpe?g|webp|avif|gif|svg|bmp)$/i.test(path) ? 'img' : /\.(ogg|opus|mp3|wav|flac|m4a|aac)$/i.test(path) ? 'aud' : 'other';
async function gmTemplate() {
  if (!GAME_TPL_B64) throw new Error(t('gm.notpl'));
  const bin = Uint8Array.from(atob(GAME_TPL_B64), c => c.charCodeAt(0));
  const ds = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(ds).text();
}
async function gmPrepare() {
  const R = compileProject({ mode: 'split', includeDocs: false, includeSource: false, includeUnreachable: true }, await availableBlobs());
  const by = { img: { n: 0, size: 0 }, aud: { n: 0, size: 0 }, voice: { n: 0, size: 0 } };
  for (const b of R.bin) { const k = gmKind(b.path); if (by[k]) { by[k].n++; by[k].size += +b.size || 0; } }
  return { R, by };
}
async function gmBuild(o, on) {
  on(t('gm.busy', '…'));
  const tpl = await gmTemplate();
  const { R } = await gmPrepare();
  if (!R.files.length || !R.start) throw new Error(t('gm.empty'));
  const assets = {}; let done = 0;
  const want = R.bin.filter(b => { const k = gmKind(b.path); return (k === 'img' && o.img) || (k === 'aud' && o.aud) || (k === 'voice' && o.voice); });
  for (const b of want) {
    if (assets[b.bid]) continue;
    const blob = await blobGet(b.bid);
    if (blob) assets[b.bid] = { t: blob.type || '', d: await gmB64(blob) };
    if (++done % 5 === 0) { on(t('gm.busy', done + '/' + want.length)); await new Promise(r => setTimeout(r, 0)); }
  }
  const proj = JSON.parse(JSON.stringify(P));
  const data = { v: 1, title: o.title || P.name || '', lang: S.lang, debug: !!o.dbg, ask: !!o.ask, project: proj, assets };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let html = tpl.replace(/<title>[^<]*<\/title>/, '<title>' + esc(data.title || 'Game') + '</title>');
  const at = html.indexOf('<body>'); if (at < 0) throw new Error('template');
  html = html.slice(0, at + 6) + '\n<scr' + 'ipt type="application/json" id="vn-game">' + json + '</scr' + 'ipt>' + html.slice(at + 6);
  return html;
}

function openHtmlGame() {
  closePopover(); flushHistory();
  const o = { title: P.name || '', img: true, aud: true, voice: true, dbg: false, ask: true };
  let info = null, busy = false;
  openModal({
    cls: 'dlg gm-dlg', build: m => {
      const box = h('div', { class: 'dlg-body gm-body' });
      const status = h('div', { class: 'ar-status' });
      const go = h('button', { class: 'btn primary', id: 'gm-make', onclick: async () => {
        if (busy) return; busy = true; go.disabled = true;
        try {
          const html = await gmBuild(o, s => { status.textContent = s; });
          const name = (o.title || 'game').replace(/[\\/:*?"<>|]+/g, '_') + '-tester.html';
          const ok = await saveFile(name, html, 'text/html');
          status.textContent = ''; if (ok) { toast(t('gm.done', name), 5200); m.close(); }
        } catch (e) { status.textContent = ''; toast(t('gm.fail', (e && e.message) || e), 7000); }
        busy = false; go.disabled = false;
      } }, icon('box', 15), t('gm.make'));
      const chk = (key, lab, extra) => { const i = h('input', { type: 'checkbox', checked: !!o[key] }); i.addEventListener('change', () => { o[key] = i.checked; paint(); }); return h('label', { class: 'ar-chk' }, i, h('span', lab), extra || null); };
      const paint = () => {
        const by = info ? info.by : null;
        const sz = by ? (o.img ? by.img.size : 0) + (o.aud ? by.aud.size : 0) + (o.voice ? by.voice.size : 0) : 0;
        const total = Math.round(sz * 1.37 + 1800000);
        const nm = h('input', { class: 'inp', value: o.title, 'aria-label': t('gm.name'), id: 'gm-title' });
        nm.addEventListener('input', () => { o.title = nm.value; });
        const cnt = k => by && by[k].n ? h('span', { class: 'hint' }, t('gm.files', '', by[k].n, humanSize(by[k].size)).replace(/^: /, ' · ')) : null;
        box.replaceChildren(h('h3', t('gm.title')), h('p', { class: 'hint' }, t('gm.intro')),
          h('label', { class: 'ar-f' }, h('span', { class: 'lab' }, t('gm.name')), nm),
          chk('img', t('gm.img'), cnt('img')), chk('aud', t('gm.aud'), cnt('aud')), chk('voice', t('gm.voice'), cnt('voice')),
          chk('ask', t('gm.ask')), chk('dbg', t('gm.dbg')),
          h('div', { class: 'hint' }, by ? t('gm.size', humanSize(total)) : ''),
          total > 120 * 1048576 ? h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('gm.size.big', humanSize(total))) : null,
          h('div', { class: 'hint' }, t('gm.warn')),
          h('div', { class: 'row-actions' }, status, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), go));
      };
      paint();
      gmPrepare().then(r => { info = r; if (!m.closed) paint(); }).catch(() => { });
      return box;
    }
  });
}

/* ---------- режим игры ---------- */
function gmBlob(b64, type) {
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: type || 'application/octet-stream' });
}
function gameBoot() {
  loadSettings();
  if (GAME.lang === 'en' || GAME.lang === 'ru') S.lang = GAME.lang;
  applyTheme();
  P = normalize(GAME.project); reindex(); resetHistory();
  document.title = GAME.title || document.title;
  document.body.classList.add('game-mode');
  for (const bid of Object.keys(GAME.assets || {})) { const a = GAME.assets[bid]; BLOB.mem.set(bid, gmBlob(a.d, a.t)); }
  GAME.assets = null;
  const ps = plPS(); ps.locked = false; ps.panel = !!GAME.debug; ps.tab = 'vars';
  GAME.who = lsGet('vnmap.tester') || '';
  gameStartScreen();
}
function gameStartScreen() {
  document.querySelectorAll('.game-screen').forEach(x => x.remove());
  const name = h('input', { class: 'inp', value: GAME.who || '', placeholder: t('gm.start.name'), 'aria-label': t('gm.start.name'), id: 'gm-who', maxlength: 60 });
  const go = () => { GAME.who = (name.value || '').trim().slice(0, 60); if (GAME.ask && !GAME.who) { name.focus(); return; } lsSet('vnmap.tester', GAME.who); scr.remove(); openPlayer({ game: true }); };
  name.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  const scr = h('div', { class: 'game-screen' }, h('div', { class: 'game-card' }, h('div', { class: 'game-t' }, GAME.title || ''), h('div', { class: 'game-s' }, t('gm.start.t')), h('p', t('gm.start.p')),
    GAME.ask ? h('label', { class: 'game-l' }, t('gm.start.name'), name) : null, h('button', { class: 'btn primary lg', id: 'gm-start', onclick: go }, icon('play', 16), t('gm.start.go'))));
  document.body.append(scr);
  if (GAME.ask) setTimeout(() => name.focus(), 60);
}
const gmWho = () => (isGame() ? (GAME.who || '') : '') || t('lg.me');

/** Журналы, записанные в игре (и текущий, незавершённый). */
function gmLogs(st) {
  const out = lgLoad().filter(L => L.src === 'html' && (!L.uid || L.uid === P.uid));
  const cur = st && st.log;
  if (cur && !cur.saved && cur.path.length >= 2) {
    const c = Object.assign({}, cur); delete c.t0; delete c.pend; delete c.saved; c.sec = Math.round((Date.now() - cur.t0) / 100) / 10;
    if (!out.some(x => x.id === c.id)) out.push(c);
  }
  return out;
}
async function gmSaveLog(st) {
  const logs = gmLogs(st);
  if (!logs.length) { toast(t('gm.nolog'), 3500); return; }
  const nm = (GAME.who || 'tester').replace(/[\\/:*?"<>|]+/g, '_');
  const ok = await saveFile(((GAME.title || P.name || 'game').replace(/[\\/:*?"<>|]+/g, '_')) + '-' + nm + '.vnlog.json', JSON.stringify({ format: 'vnmap-logs', v: 1, logs }, null, 1), 'application/json');
  if (ok) toast(t('gm.saved'), 2600);
}
async function gmCopyLog(st) {
  const logs = gmLogs(st); if (!logs.length) { toast(t('gm.nolog'), 3500); return; }
  if (await copyText(JSON.stringify({ format: 'vnmap-logs', v: 1, logs }))) toast(t('gm.copied'), 4200);
}
async function gmNote(st) {
  const tx = await promptDlg({ title: t('gm.note.q'), placeholder: t('gm.note.ph'), ok: t('gm.note') });
  if (tx == null || !String(tx).trim()) return;
  lgNote(st, String(tx).trim().slice(0, 1000), st.ev && st.ev.text ? st.ev.text.slice(0, 120) : '');
  toast(t('gm.note.ok'), 2200);
}
/** После закрытия плеера в игре: поблагодарить и напомнить про журнал. */
function gameAfter() {
  if (!isGame() || document.querySelector('.game-screen')) return;
  const scr = h('div', { class: 'game-screen' }, h('div', { class: 'game-card' }, h('div', { class: 'game-t' }, t('gm.after.t')), h('p', t('gm.after.p')),
    h('div', { class: 'row-actions' },
      h('button', { class: 'btn primary lg', id: 'gm-save', onclick: () => gmSaveLog(null) }, icon('save', 16), t('gm.save')),
      h('button', { class: 'btn lg', onclick: () => gmCopyLog(null) }, icon('copy', 16), t('gm.copy')),
      h('button', { class: 'btn lg', id: 'gm-again', onclick: () => { scr.remove(); openPlayer({ game: true }); } }, icon('refresh', 16), t('gm.again')))));
  document.body.append(scr);
}

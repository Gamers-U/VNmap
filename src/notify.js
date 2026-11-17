'use strict';
/* ====== Уведомления в Telegram и Discord ======
   1) «Проект закрыт»: краткая сводка сессии. Страница по ходу работы кладёт готовый текст в оболочку, а оболочка сама отправляет его
      при закрытии окна (поэтому страница при выходе ничего делать не должна).
   2) «Сроки задач»: пока программа открыта, раз в день напоминает о ваших просроченных и сегодняшних задачах. Чтобы напоминать, когда
      компьютер выключен, есть набор для GitHub Actions (скрипт и расписание), который читает проект из репозитория.
   Токен бота и вебхук хранит только оболочка (зашифрованно). В проект и на GitHub они не попадают. В браузере страница в сеть не ходит. */

Object.assign(D, {
  'nt.menu': ['Уведомления (Telegram, Discord)', 'Notifications (Telegram, Discord)'],
  'nt.h': ['Уведомления', 'Notifications'],
  'nt.tab.me': ['Мои уведомления', 'My notifications'], 'nt.tab.gh': ['Напоминания на GitHub', 'Reminders on GitHub'],
  'nt.browser': ['В браузере страница не может писать в Telegram и Discord. Уведомления работают в программе для компьютера (Windows, macOS, Linux). Набор для GitHub ниже от этого не зависит.', 'A browser page cannot post to Telegram and Discord. Notifications work in the desktop app (Windows, macOS, Linux). The GitHub kit below does not depend on that.'],
  'nt.oldshell': ['Эта установленная программа слишком старая для уведомлений. Обновите её до версии 1.6 или новее (Инструменты → обновление программы, или скачайте установщик с GitHub).', 'This installed app is too old for notifications. Update it to version 1.6 or newer (or download the installer from GitHub).'],
  'nt.tg': ['Telegram', 'Telegram'], 'nt.dc': ['Discord', 'Discord'],
  'nt.tg.how': ['1) В Telegram откройте @BotFather, отправьте /newbot и выберите имя. 2) Скопируйте токен бота сюда и сохраните. 3) Откройте своего бота и нажмите Start, затем здесь «Найти мой чат». Бот пишет только вам в личные сообщения.', '1) In Telegram open @BotFather, send /newbot and pick a name. 2) Paste the bot token here and save. 3) Open your bot and press Start, then press “Find my chat” here. The bot writes only to you, in private messages.'],
  'nt.dc.how': ['Создайте свой сервер на одного (или канал, который видите только вы): Настройки канала → Интеграции → Вебхуки → Новый вебхук → «Копировать URL». Вставьте ссылку сюда. Чтобы сообщение вас упоминало, добавьте свой ID (Настройки Discord → Расширенные → Режим разработчика, затем правый щелчок по себе → «Копировать ID пользователя»).', 'Make a server just for yourself (or a channel only you can see): Channel settings → Integrations → Webhooks → New webhook → “Copy URL”. Paste it here. To get pinged, add your user ID (Discord Settings → Advanced → Developer mode, then right-click yourself → “Copy User ID”).'],
  'nt.f.token': ['Токен бота', 'Bot token'], 'nt.f.hook': ['Ссылка вебхука', 'Webhook URL'], 'nt.f.uid': ['Ваш ID в Discord (необязательно)', 'Your Discord user ID (optional)'],
  'nt.saved.ph': ['сохранён (можно заменить)', 'saved (can be replaced)'],
  'nt.save': ['Сохранить', 'Save'], 'nt.test': ['Отправить проверку', 'Send a test'], 'nt.off': ['Отключить', 'Disconnect'],
  'nt.find': ['Найти мой чат', 'Find my chat'],
  'nt.chat.ok': ['Чат найден: {0} (ID {1})', 'Chat found: {0} (ID {1})'], 'nt.chat.none': ['Чат ещё не найден: откройте своего бота и нажмите Start.', 'Chat not found yet: open your bot and press Start.'],
  'nt.tg.on': ['Бот подключён.', 'Bot connected.'], 'nt.dc.on': ['Вебхук подключён.', 'Webhook connected.'], 'nt.none': ['Не подключено.', 'Not connected.'],
  'nt.enc.no': ['В этой системе нет шифрования хранилища: данные лежат в файле, доступном только вашему пользователю.', 'This system has no secure storage: the data sits in a file readable only by your user.'],
  'nt.ev.h': ['О чём сообщать', 'What to report'],
  'nt.ev.close': ['Когда проект закрыт: короткая сводка сессии', 'When the project is closed: a short summary of the session'],
  'nt.ev.close.h': ['Приходит, если программа была открыта хотя бы минуту. Отправляет оболочка при закрытии окна.', 'Sent if the app was open for at least a minute. The shell sends it when the window closes.'],
  'nt.ev.due': ['Сроки задач: просроченное и на сегодня (корпоративный режим)', 'Task deadlines: overdue and due today (corporate mode)'],
  'nt.ev.due.h': ['Раз в день, пока программа открыта. Когда компьютер выключен, используйте напоминания на GitHub.', 'Once a day while the app is open. When your computer is off, use the GitHub reminders.'],
  'nt.ok.save': ['Сохранено', 'Saved'], 'nt.ok.off': ['Отключено', 'Disconnected'], 'nt.ok.test': ['Проверка отправлена: {0}', 'Test sent: {0}'], 'nt.ok.none': ['Нечего отправлять: сначала подключите Telegram (и найдите чат) или Discord.', 'Nothing to send to: connect Telegram (and find your chat) or Discord first.'],
  'nt.test.msg': ['Проверка связи из «Карты новеллы»: уведомления работают.', 'Connection test from VNMap: notifications work.'],
  'nt.e.badtoken': ['Токен не подошёл (проверьте, что скопировали его целиком).', 'The token did not work (check that you copied all of it).'],
  'nt.e.badchat': ['Это не похоже на ID чата.', 'That does not look like a chat ID.'],
  'nt.e.badhook': ['Это не ссылка вебхука Discord.', 'That is not a Discord webhook URL.'],
  'nt.e.baduid': ['ID в Discord это только цифры.', 'A Discord user ID is digits only.'],
  'nt.e.nochat': ['Бот пока никого не видит: откройте его в Telegram, нажмите Start и повторите.', 'The bot has not seen anyone yet: open it in Telegram, press Start and try again.'],
  'nt.e.webhook': ['У этого бота включён вебхук, поэтому чат найти нельзя. Создайте нового бота у @BotFather.', 'This bot has a webhook set, so the chat cannot be found. Create a new bot at @BotFather.'],
  'nt.e.blocked': ['Бот заблокирован или вы не нажали Start.', 'The bot is blocked or you have not pressed Start.'],
  'nt.e.chat': ['Telegram не нашёл этот чат: нажмите «Найти мой чат» ещё раз.', 'Telegram could not find that chat: press “Find my chat” again.'],
  'nt.e.rate': ['Слишком часто: подождите немного.', 'Too often: wait a moment.'],
  'nt.e.network': ['Нет связи с сервисом.', 'No connection to the service.'], 'nt.e.timeout': ['Сервис долго не отвечает.', 'The service is not answering.'],
  'nt.e.nothing': ['Подключите Telegram (и найдите чат) или Discord и выберите себя в «Кто я в этом проекте».', 'Connect Telegram (and find your chat) or Discord, and pick yourself in “Who am I in this project”.'],
  'nt.e.fail': ['Не получилось.', 'It did not work.'], 'nt.e.http': ['Сервис ответил ошибкой ({0}).', 'The service answered with an error ({0}).'],
  'nt.sum.h': ['Проект «{0}» закрыт.', 'Project “{0}” closed.'], 'nt.sum.who': ['Работал: {0}.', 'Worked: {0}.'],
  'nt.sum.since': ['Сессия с {0}.', 'Session since {0}.'],
  'nt.sum.chg': ['Изменено глав: {0}, слов {1}. Новых блоков: {2}. Замечаний: {3}.', 'Chapters changed: {0}, words {1}. New blocks: {2}. Comments: {3}.'],
  'nt.sum.none': ['Правок за сессию не было.', 'No changes during the session.'],
  'nt.sum.team': ['Команда: {0}.', 'Team: {0}.'], 'nt.sum.ch': ['{0}: глав {1}', '{0}: {1} chapters'],
  'nt.due.h': ['Сроки в проекте «{0}», {1}', 'Deadlines in “{0}”, {1}'],
  'nt.due.over': ['просрочено на {0} дн.', 'overdue by {0} d'], 'nt.due.today': ['сегодня', 'today'], 'nt.due.more': ['… и ещё {0}', '… and {0} more'],
  /* GitHub */
  'nt.gh.h': ['Напоминания о сроках, когда компьютер выключен', 'Deadline reminders when your computer is off'],
  'nt.gh.p': ['GitHub сам раз в день читает проект из вашего репозитория и пишет каждому участнику в его Telegram и Discord: просроченное и то, что на сегодня. Руководителям (роль «Руководитель») дополнительно приходит список просроченного по всей команде. Бесплатно, программа и компьютер не нужны.', 'Once a day GitHub reads the project from your repository and writes to every member on their Telegram and Discord: what is overdue and what is due today. Leads (the “Lead” role) also get the overdue list of the whole team. Free, no app or computer needed.'],
  'nt.gh.s1': ['1. Положите в репозиторий два файла: «Добавить в репозиторий» (нужен токен GitHub с правом workflow) или «Скачать файлы» и закоммитьте их сами (.github/workflows/vnmap-reminders.yml и .github/vnmap-reminders.mjs).', '1. Put two files into the repository: “Add to repository” (needs a GitHub token with the workflow permission) or “Download files” and commit them yourself (.github/workflows/vnmap-reminders.yml and .github/vnmap-reminders.mjs).'],
  'nt.gh.s2': ['2. В репозитории: Settings → Secrets and variables → Actions → New repository secret. Имя VNMAP_NOTIFY. Значение: по одной строке на каждого участника. Свою строку берёт кнопка ниже, остальные участники присылают свои тем же способом.', '2. In the repository: Settings → Secrets and variables → Actions → New repository secret. Name VNMAP_NOTIFY. Value: one line per member. The button below copies your line, the other members send theirs the same way.'],
  'nt.gh.s3': ['3. Расписание: каждый день в 06:00 UTC (строка cron в файле, её можно поменять). Проверить сразу: вкладка Actions → «VNMap reminders» → Run workflow.', '3. Schedule: every day at 06:00 UTC (the cron line in the file, you can change it). To check at once: Actions tab → “VNMap reminders” → Run workflow.'],
  'nt.gh.add': ['Добавить в репозиторий', 'Add to repository'], 'nt.gh.dl': ['Скачать файлы', 'Download files'], 'nt.gh.mine': ['Скопировать мою строку секрета', 'Copy my secret line'],
  'nt.gh.nolink': ['Проект ещё не подключён к GitHub (панель «GitHub»): файлы можно скачать, но класть их некуда.', 'The project is not linked to GitHub yet (the “GitHub” panel): you can download the files, but there is nowhere to put them.'],
  'nt.gh.corp': ['Напоминания читают задачи и сроки: включите корпоративный режим (Настройки → Команда → Права доступа).', 'Reminders read tasks and deadlines: turn on the corporate mode (Settings → Team → Access rights).'],
  'nt.gh.added': ['Файлы добавлены в репозиторий. Осталось добавить секрет VNMAP_NOTIFY.', 'Files added to the repository. All that is left is the VNMAP_NOTIFY secret.'],
  'nt.gh.noscope': ['GitHub не разрешил записать файл расписания: токену нужно право workflow. Скачайте файлы и закоммитьте их сами.', 'GitHub did not allow writing the schedule file: the token needs the workflow permission. Download the files and commit them yourself.'],
  'nt.gh.mine.ok': ['Строка скопирована. Добавьте её в секрет VNMAP_NOTIFY (новой строкой).', 'Line copied. Add it to the VNMAP_NOTIFY secret (as a new line).'],
  'nt.gh.saved': ['Файлы сохранены', 'Files saved'],
});

const NTD = DESK && DESK.notify ? DESK.notify : null;
const NT = { st: null, stT: 0, base: null, snap: null, fw: '', tick: null };
const ntSupport = () => (NTD ? 'ok' : DESK ? 'oldshell' : 'browser');
function ntCfg() {
  const c = S.notify && typeof S.notify === 'object' ? S.notify : (S.notify = {});
  if (typeof c.close !== 'boolean') c.close = true;
  if (typeof c.due !== 'boolean') c.due = true;
  if (!c.sent || typeof c.sent !== 'object') c.sent = {};
  return c;
}
async function ntStatus(force) {
  if (!NTD) return null;
  if (!force && NT.st && Date.now() - NT.stT < 60000) return NT.st;
  try { NT.st = await NTD.status(); NT.stT = Date.now(); } catch (e) { NT.st = null; }
  return NT.st;
}
const ntHas = st => !!(st && ((st.tg && st.tg.token && st.tg.chat) || (st.dc && st.dc.hook)));
function ntErr(code) {
  code = String(code || 'fail');
  if (/^http\d+$/.test(code)) return t('nt.e.http', code.slice(4));
  return D['nt.e.' + code] ? t('nt.e.' + code) : t('nt.e.fail');
}
/** Результат отправки одной строкой: «Telegram: ок, Discord: ошибка (…)». */
function ntResText(res) {
  const out = [];
  for (const k of ['tg', 'dc']) if (res && res[k]) out.push(t('nt.' + k) + ': ' + (res[k].ok ? 'ок' : ntErr(res[k].code)));
  return out.join('; ');
}

/* ---------- сводка сессии («проект закрыт») ---------- */
const ntSig = s => strHash(String(s || ''));
function ntBaseline() {
  const files = new Map(), nodes = new Set(), cmts = new Set();
  for (const n of P.nodes) { nodes.add(n.id); for (const f of n.files) files.set(f.id, { sig: ntSig(f.script), w: fileWords(f) }); }
  for (const c of P.cmts || []) cmts.add(c.id);
  NT.base = { uid: P.uid, start: Date.now(), files, nodes, cmts };
  NT.fw = ''; NT.snap = null;
}
const ntClock = ts => { try { return new Date(ts).toLocaleTimeString(S.lang === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
function ntSummary() {
  const b = NT.base; if (!b || !P) return '';
  let chg = 0, words = 0;
  for (const n of P.nodes) for (const f of n.files) {
    const o = b.files.get(f.id);
    if (!o) { chg++; words += fileWords(f); } else if (o.sig !== ntSig(f.script)) { chg++; words += fileWords(f) - o.w; }
  }
  const nb = P.nodes.filter(n => !b.nodes.has(n.id)).length, cm = (P.cmts || []).filter(c => !b.cmts.has(c.id)).length;
  const me = typeof meMember === 'function' ? meMember() : null;
  const lines = [t('nt.sum.h', P.name || '—')];
  if (me) lines.push(t('nt.sum.who', me.name));
  lines.push(t('nt.sum.since', ntClock(b.start)));
  lines.push(chg || nb || cm ? t('nt.sum.chg', chg, (words > 0 ? '+' : '') + words, nb, cm) : t('nt.sum.none'));
  if (P.members && P.members.length >= 2 && typeof whCollect === 'function') {
    const rows = whCollect(b.start).rows.filter(r => r.edits.length).slice(0, 6);
    if (rows.length) lines.push(t('nt.sum.team', rows.map(r => t('nt.sum.ch', r.m.name, r.edits.length)).join(', ')));
  }
  return lines.join('\n');
}
/** Каждые несколько секунд: если проект сменился, начать сессию заново; если он изменился, обновить прощальное сообщение в оболочке. */
function ntTick() {
  if (!NTD || typeof P === 'undefined' || !P || !P.nodes || (typeof GAME !== 'undefined' && GAME)) return;
  if (!NT.base || NT.base.uid !== P.uid) ntBaseline();
  if (!ntCfg().close) { if (NT.fw !== null) { NT.fw = null; NTD.farewell(null).catch(() => { }); } return; }
  const snap = typeof HIST !== 'undefined' ? HIST.stack[HIST.i] : null;
  if (NT.fw !== null && snap && snap === NT.snap) return;
  NT.snap = snap;
  const text = ntSummary();
  if (text === NT.fw) return;
  NT.fw = text; NTD.farewell({ text, since: NT.base.start, min: 60000 }).catch(() => { });
}

/* ---------- сроки, пока программа открыта ---------- */
async function ntDueCheck() {
  if (!NTD || !P || (typeof GAME !== 'undefined' && GAME) || !ntCfg().due || typeof tasksOn !== 'function' || !tasksOn()) return;
  const me = meMember(); if (!me) return;
  const st = await ntStatus(); if (!ntHas(st)) return;
  const today = todayIso(), c = ntCfg(), key = 'due:' + P.uid + ':' + today;
  if (c.sent[key]) return;
  const mine = taskItems().filter(i => !i.done && i.due && (i.who || []).includes(me.id) && dayDiff(i.due) <= 0).sort((a, b) => a.due.localeCompare(b.due));
  if (!mine.length) return;
  const line = i => '• ' + i.title + ' — ' + (dayDiff(i.due) < 0 ? t('nt.due.over', -dayDiff(i.due)) : t('nt.due.today'));
  const text = [t('nt.due.h', P.name || '—', today.split('-').reverse().join('.'))].concat(mine.slice(0, 12).map(line), mine.length > 12 ? [t('nt.due.more', mine.length - 12)] : []).join('\n');
  let r; try { r = await NTD.send(text); } catch (e) { return; }
  if (r && r.ok && r.res && Object.values(r.res).some(x => x.ok)) {
    c.sent[key] = Date.now();
    for (const k of Object.keys(c.sent)) if (Date.now() - c.sent[k] > 5 * 864e5) delete c.sent[k];
    saveSettings();
  }
}
setInterval(() => { try { ntTick(); } catch (e) { /* не мешаем работе */ } }, 4000);
setTimeout(() => { ntDueCheck().catch(() => { }); setInterval(() => ntDueCheck().catch(() => { }), 30 * 60000); }, 12000);

/* ---------- набор для GitHub Actions ----------
   Скрипт ниже кладётся в репозиторий как есть и запускается GitHub по расписанию. В нём нет обратных кавычек и «${», чтобы его можно
   было держать строкой в странице. Адреса проверяются так же, как в оболочке: только Telegram и вебхуки Discord. */
const NT_SCRIPT = String.raw`// VNMap: напоминания о сроках в Telegram и Discord. Запускается по расписанию в GitHub Actions.
// Читает проект из репозитория и пишет каждому участнику его просроченное и сегодняшнее (задачи, блоки и ресурсы со сроком). Секреты берёт из VNMAP_NOTIFY (по строке JSON на человека).
import fs from 'node:fs';
const env = process.env;
const RU = env.VN_LANG !== 'en';
const T = (ru, en) => (RU ? ru : en);
const TZ = env.VN_TZ || 'UTC';
const isoDay = ms => new Date(ms).toLocaleDateString('sv-SE', { timeZone: TZ });
const today = isoDay(Date.now());
const diff = d => Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 864e5);
const okDate = s => /^\d{4}-\d\d-\d\d$/.test(String(s || ''));
const TG_TOKEN = /^\d{6,12}:[\w-]{30,60}$/, TG_CHAT = /^(?:-?\d{1,20}|@[A-Za-z]\w{4,31})$/;
const DC_HOOK = /^https:\/\/(?:(?:ptb|canary)\.)?(?:discord|discordapp)\.com\/api\/(?:v\d+\/)?webhooks\/\d{5,25}\/[\w-]{20,200}$/, DC_UID = /^\d{5,25}$/;

let P;
try { P = JSON.parse(fs.readFileSync(env.VN_FILE, 'utf8')); } catch (e) { console.error(T('Не удалось прочитать файл проекта: ', 'Could not read the project file: ') + e.message); process.exit(1); }
const members = Array.isArray(P.members) ? P.members : [], nodes = Array.isArray(P.nodes) ? P.nodes : [];
if (!(P.acl && P.acl.on && P.acl.corp)) { console.log(T('Корпоративный режим выключен: напоминать нечего.', 'Corporate mode is off: nothing to remind about.')); process.exit(0); }

const nodeTitle = id => { const n = nodes.find(x => x && x.id === id); return n ? String(n.title || '—') : ''; };
const nameOf = id => { const m = members.find(x => x && x.id === id); return m ? String(m.name || '?') : '?'; };
const items = [];
for (const q of Array.isArray(P.tasks) ? P.tasks : []) {
  if (q && q.st !== 'done' && okDate(q.due)) items.push({ t: String(q.title || '—'), where: nodeTitle(q.node), due: q.due, who: Array.isArray(q.who) ? q.who : [] });
}
for (const n of nodes) {
  if (!n || !okDate(n.due)) continue;
  const files = Array.isArray(n.files) ? n.files : [];
  if (files.length && files.every(f => f && f.status === 'done')) continue;
  items.push({ t: String(n.title || '—'), where: T('блок', 'block'), due: n.due, who: Array.isArray(n.owners) ? n.owners : [] });
}
for (const a of Array.isArray(P.assets) ? P.assets : []) {
  const pr = a && a.prod; if (!pr || !okDate(pr.due) || pr.st === 'got' || pr.st === 'done') continue;
  items.push({ t: String(a.name || a.path || '—'), where: T('ресурс', 'resource'), due: pr.due, who: Array.isArray(a.owners) ? a.owners : [] });
}

const targets = new Map();
for (const raw of String(env.VNMAP_NOTIFY || '').split(/\r?\n/)) {
  const s = raw.trim(); if (!s) continue;
  try { const o = JSON.parse(s); if (o && typeof o.m === 'string') targets.set(o.m, o); } catch (e) { console.error(T('Строка секрета не разобрана и пропущена.', 'A secret line could not be parsed and was skipped.')); }
}
if (!targets.size) { console.log(T('В секрете VNMAP_NOTIFY нет ни одного получателя.', 'The VNMAP_NOTIFY secret has no recipients.')); process.exit(0); }

const when = it => (diff(it.due) < 0 ? T('просрочено на ' + (-diff(it.due)) + ' дн.', 'overdue by ' + (-diff(it.due)) + ' d') : T('сегодня', 'today'));
const list = (arr, withWho) => {
  const a = arr.slice().sort((x, y) => x.due.localeCompare(y.due));
  const out = a.slice(0, 12).map(it => '• ' + it.t + (it.where ? ' (' + it.where + ')' : '') + ' — ' + when(it) + (withWho && it.who.length ? ' [' + it.who.map(nameOf).join(', ') + ']' : ''));
  if (a.length > 12) out.push(T('… и ещё ' + (a.length - 12), '… and ' + (a.length - 12) + ' more'));
  return out.join('\n');
};
async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
}
async function notify(tg, text) {
  text = text.slice(0, 1800);
  let ok = 0, bad = 0;
  if (TG_TOKEN.test(tg.tgToken || '') && TG_CHAT.test(String(tg.tgChat || ''))) {
    try { await post('https://api.telegram.org/bot' + tg.tgToken + '/sendMessage', { chat_id: String(tg.tgChat), text, disable_web_page_preview: true }); ok++; } catch (e) { bad++; console.error('Telegram: ' + e.message); }
  }
  if (DC_HOOK.test(tg.dcHook || '')) {
    const uid = DC_UID.test(String(tg.dcUid || '')) ? String(tg.dcUid) : '';
    try { await post(tg.dcHook, { content: (uid ? '<@' + uid + '> ' : '') + text, allowed_mentions: uid ? { users: [uid] } : { parse: [] } }); ok++; } catch (e) { bad++; console.error('Discord: ' + e.message); }
  }
  return { ok, bad };
}

let sent = 0, failed = 0;
for (const m of members) {
  const tg = m && targets.get(m.id); if (!tg) continue;
  const mine = items.filter(it => it.who.includes(m.id) && diff(it.due) <= 0);
  const boss = Array.isArray(m.roles) && m.roles.includes('role:manager');
  const team = boss ? items.filter(it => diff(it.due) < 0) : [];
  if (!mine.length && !team.length) continue;
  const parts = [T('«' + (P.name || '—') + '»: сроки на ' + today, '“' + (P.name || '—') + '”: deadlines for ' + today)];
  if (mine.length) parts.push(T('Ваши (' + mine.length + '):', 'Yours (' + mine.length + '):') + '\n' + list(mine, false));
  if (team.length) parts.push(T('Команда, просрочено (' + team.length + '):', 'Team, overdue (' + team.length + '):') + '\n' + list(team, true));
  const r = await notify(tg, parts.join('\n\n'));
  sent += r.ok; failed += r.bad;
}
console.log(T('Отправлено: ' + sent + ', ошибок: ' + failed + '.', 'Sent: ' + sent + ', errors: ' + failed + '.'));
if (failed) process.exitCode = 1;
`;
const NT_SCRIPT_PATH = '.github/vnmap-reminders.mjs', NT_FLOW_PATH = '.github/workflows/vnmap-reminders.yml';
const ntYq = s => "'" + String(s).replace(/'/g, "''") + "'";
function ntWorkflow(m) {
  let tz = 'UTC'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { /* UTC */ }
  const L = [
    '# VNMap: ежедневные напоминания о сроках в Telegram и Discord.',
    '# Секрет: Settings → Secrets and variables → Actions → VNMAP_NOTIFY (по строке JSON на участника, строку даёт программа).',
    'name: VNMap reminders',
    'on:',
    '  schedule:',
    "    - cron: '0 6 * * *'   # каждый день в 06:00 UTC; время можно поменять",
    '  workflow_dispatch:',
    'permissions:',
    '  contents: read',
    'jobs:',
    '  remind:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
  ];
  if (m && m.branch) L.push('        with:', '          ref: ' + ntYq(m.branch));
  L.push('      - uses: actions/setup-node@v4', '        with:', '          node-version: 20',
    '      - run: node ' + NT_SCRIPT_PATH,
    '        env:',
    '          VN_FILE: ' + ntYq(m && m.path || ghDefaultPath()),
    '          VN_TZ: ' + ntYq(tz),
    '          VN_LANG: ' + ntYq(S.lang === 'en' ? 'en' : 'ru'),
    '          VNMAP_NOTIFY: ' + '$' + '{{ secrets.VNMAP_NOTIFY }}');
  return L.join('\n') + '\n';
}

/* ---------- окно «Уведомления» ---------- */
function openNotify(tab) {
  const st = { tab: tab || 'me', busy: false, tg: '', hook: '', uid: null };
  openModal({
    cls: 'nt-modal',
    build: m => {
      st.m = m; st.body = h('div', { class: 'nt-body' });
      const render = async () => {
        const sup = ntSupport(), stt = sup === 'ok' ? await ntStatus(true) : null;
        const tabs = [{ value: 'me', label: t('nt.tab.me') }, { value: 'gh', label: t('nt.tab.gh') }];
        st.body.replaceChildren(segmented(tabs, st.tab, v => { st.tab = v; render(); }), h('div', { class: 'nt-pane' }, st.tab === 'me' ? ntPaneMe(st, sup, stt, render) : ntPaneGh(st, render)));
      };
      st.render = render; render();
      return h('div', { class: 'm-wrap' }, modalHead(t('nt.h'), m), st.body);
    },
  });
}
async function ntRun(st, fn, okMsg) {
  if (st.busy) return; st.busy = true;
  try { const r = await fn(); if (r && r.ok === false) toast(ntErr(r.code), 5200); else if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg, 3200); }
  catch (e) { toast(t('nt.e.fail'), 4200); }
  finally { st.busy = false; NT.stT = 0; st.render(); }
}
function ntPaneMe(st, sup, stt, render) {
  const wrap = h('div', { class: 'nt-list' });
  if (sup !== 'ok') { wrap.append(h('div', { class: 'hint warn' }, t(sup === 'oldshell' ? 'nt.oldshell' : 'nt.browser'))); return wrap; }
  if (!stt) { wrap.append(h('div', { class: 'hint warn' }, t('nt.e.fail'))); return wrap; }
  const c = ntCfg();
  const secret = (ph, key, type) => { const i = h('input', { class: 'inp', type: type || 'password', placeholder: ph, autocomplete: 'off', spellcheck: 'false', value: st[key] || '' }); i.addEventListener('input', () => { st[key] = i.value; }); return i; };
  const test = () => ntRun(st, async () => { const r = await NTD.send(t('nt.test.msg')); if (r.ok && (!r.res || !Object.keys(r.res).length)) return { ok: false, code: 'nothing' }; if (r.ok && Object.values(r.res).every(x => !x.ok)) return { ok: false, code: Object.values(r.res)[0].code }; return r; }, r => t('nt.ok.test', ntResText(r.res)));
  /* Telegram */
  const tgOn = stt.tg.token;
  const tgCard = h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, icon('chat', 15), t('nt.tg'), h('span', { class: 'nt-state' + (tgOn ? ' on' : '') }, tgOn ? (stt.tg.chat ? t('nt.chat.ok', stt.tg.name || '—', stt.tg.chat) : t('nt.tg.on')) : t('nt.none'))));
  tgCard.append(h('div', { class: 'hint' }, t('nt.tg.how')));
  const ti = secret(tgOn ? t('nt.saved.ph') : '123456789:AA…', 'tg');
  tgCard.append(field(t('nt.f.token'), ti));
  const tgBtns = h('div', { class: 'nt-btns' },
    h('button', { class: 'btn primary sm', onclick: () => { if (!st.tg.trim()) return; ntRun(st, async () => { const r = await NTD.setTelegram({ token: st.tg }); st.tg = ''; return r; }, t('nt.ok.save')); } }, t('nt.save')));
  if (tgOn) tgBtns.append(
    h('button', { class: 'btn sm', onclick: () => ntRun(st, () => NTD.find(), r => t('nt.chat.ok', r.st.tg.name || '—', r.st.tg.chat)) }, icon('search', 14), t('nt.find')),
    h('button', { class: 'btn sm', disabled: !stt.tg.chat, onclick: () => ntRun(st, async () => { const r = await NTD.send(t('nt.test.msg'), 'tg'); return r.ok && r.res.tg && !r.res.tg.ok ? { ok: false, code: r.res.tg.code } : r; }, r => t('nt.ok.test', ntResText(r.res))) }, t('nt.test')),
    h('button', { class: 'btn sm danger-t', onclick: () => ntRun(st, () => NTD.clear('tg'), t('nt.ok.off')) }, t('nt.off')));
  tgCard.append(tgBtns);
  if (tgOn && !stt.tg.chat) tgCard.append(h('div', { class: 'hint warn' }, t('nt.chat.none')));
  /* Discord */
  const dcOn = stt.dc.hook;
  const dcCard = h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, icon('users', 15), t('nt.dc'), h('span', { class: 'nt-state' + (dcOn ? ' on' : '') }, dcOn ? t('nt.dc.on') : t('nt.none'))));
  dcCard.append(h('div', { class: 'hint' }, t('nt.dc.how')));
  const uidIn = h('input', { class: 'inp', type: 'text', placeholder: '123456789012345678', autocomplete: 'off', value: st.uid != null ? st.uid : stt.dc.uid || '' });
  uidIn.addEventListener('input', () => { st.uid = uidIn.value; });
  dcCard.append(h('div', { class: 'tk-fields' }, field(t('nt.f.hook'), secret(dcOn ? t('nt.saved.ph') : 'https://discord.com/api/webhooks/…', 'hook')), field(t('nt.f.uid'), uidIn)));
  dcCard.append(h('div', { class: 'nt-btns' },
    h('button', { class: 'btn primary sm', onclick: () => ntRun(st, async () => { const o = {}; if (st.hook.trim()) o.hook = st.hook; if (st.uid != null) o.uid = st.uid; if (!o.hook && !dcOn) return { ok: false, code: 'badhook' }; const r = await NTD.setDiscord(o); st.hook = ''; st.uid = null; return r; }, t('nt.ok.save')) }, t('nt.save')),
    dcOn ? h('button', { class: 'btn sm', onclick: () => ntRun(st, async () => { const r = await NTD.send(t('nt.test.msg'), 'dc'); return r.ok && r.res.dc && !r.res.dc.ok ? { ok: false, code: r.res.dc.code } : r; }, r => t('nt.ok.test', ntResText(r.res))) }, t('nt.test')) : null,
    dcOn ? h('button', { class: 'btn sm danger-t', onclick: () => ntRun(st, () => NTD.clear('dc'), t('nt.ok.off')) }, t('nt.off')) : null));
  /* события */
  const evCard = h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, icon('zap', 15), t('nt.ev.h')),
    switchEl(c.close, v => { c.close = v; saveSettings(); NT.fw = ''; NT.snap = null; ntTick(); }, t('nt.ev.close')), h('div', { class: 'hint' }, t('nt.ev.close.h')),
    switchEl(c.due, v => { c.due = v; saveSettings(); }, t('nt.ev.due')), h('div', { class: 'hint' }, t('nt.ev.due.h')));
  if (!stt.encrypted) evCard.append(h('div', { class: 'hint warn' }, t('nt.enc.no')));
  wrap.append(tgCard, dcCard, evCard);
  return wrap;
}
function ntPaneGh(st, render) {
  const wrap = h('div', { class: 'nt-list' }), m = gmeta(), me = meMember();
  wrap.append(h('div', { class: 'nt-card' }, h('div', { class: 'nt-ch' }, icon('flag', 15), t('nt.gh.h')), h('div', { class: 'hint' }, t('nt.gh.p')),
    h('div', { class: 'nt-steps' }, h('div', t('nt.gh.s1')), h('div', t('nt.gh.s2')), h('div', t('nt.gh.s3')))));
  if (typeof tasksOn === 'function' && !tasksOn()) wrap.append(h('div', { class: 'hint warn' }, t('nt.gh.corp')));
  if (!m) wrap.append(h('div', { class: 'hint warn' }, t('nt.gh.nolink')));
  const files = () => [[NT_FLOW_PATH, ntWorkflow(m)], [NT_SCRIPT_PATH, NT_SCRIPT]];
  const add = h('button', { class: 'btn primary', disabled: !m, onclick: () => ntRun(st, async () => {
    for (const [path, text] of files()) {
      const fm = { repo: m.repo, path, branch: m.branch || '' };
      let sha = ''; try { const g = await ghGetFile(fm, {}); sha = g && g.sha || ''; } catch (e) { sha = ''; }
      try { await ghPutFile(fm, text, 'VNMap: напоминания о сроках', sha); }
      catch (e) { if (/forbidden|not_found|auth/.test(String(e && e.message))) { toast(t('nt.gh.noscope'), 7000); return { ok: true, silent: true }; } throw e; }
    }
    return { ok: true };
  }, r => (r && r.silent ? '' : t('nt.gh.added'))) }, icon('upload', 15), t('nt.gh.add'));
  const dl = h('button', { class: 'btn', onclick: async () => { for (const [path, text] of files()) await saveFile(path.split('/').pop(), new Blob([text], { type: 'text/plain' }), 'text/plain'); toast(t('nt.gh.saved'), 2600); } }, icon('download', 15), t('nt.gh.dl'));
  const mine = h('button', { class: 'btn', disabled: !NTD || !me, onclick: () => ntRun(st, async () => { const r = await NTD.mine(me.id); if (r.ok) { const ok = await copyText(r.line); if (!ok) return { ok: false, code: 'fail' }; } return r; }, t('nt.gh.mine.ok')) }, icon('copy', 15), t('nt.gh.mine'));
  wrap.append(h('div', { class: 'nt-btns' }, add, dl, mine));
  if (!me) wrap.append(h('div', { class: 'hint' }, t('nt.e.nothing')));
  return wrap;
}
TOOL_ITEMS.push({ id: 'notify', group: 'team', ic: 'chat', key: 'nt.menu', kw: 'notify notifications telegram discord bot webhook reminder deadline уведомления телеграм дискорд бот вебхук напоминания сроки закрытие проекта', run: () => openNotify() });

'use strict';
/* Уведомления в Telegram и Discord. Живёт в оболочке: окно программы в сеть ходить не может, а токены не должны
   попадать на страницу. Здесь хранение (шифруется средствами системы), проверка адресов, отправка и «прощальное
   сообщение», которое уходит при закрытии окна, даже если страница уже не успела ничего сделать.
   Разрешены только два адреса: api.telegram.org (методы sendMessage/getUpdates/getMe) и вебхуки Discord. */
const fs = require('fs');

const TG_TOKEN = /^\d{6,12}:[\w-]{30,60}$/;
const TG_CHAT = /^(?:-?\d{1,20}|@[A-Za-z]\w{4,31})$/;
const DC_HOOK = /^https:\/\/(?:(?:ptb|canary)\.)?(?:discord|discordapp)\.com\/api\/(?:v\d+\/)?webhooks\/\d{5,25}\/[\w-]{20,200}$/;
const DC_UID = /^\d{5,25}$/;
const MAX_TEXT = 1800;                      // у Discord предел 2000 знаков, у Telegram 4096: берём меньший с запасом на упоминание

const clip = s => { s = String(s == null ? '' : s).replace(/\u0000/g, ''); return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT - 1) + '…' : s; };
/** Код ошибки по ответу сервиса: страница сама подберёт понятный текст. */
function tgCode(status, text) {
  let d = ''; try { d = String((JSON.parse(text) || {}).description || ''); } catch (e) { /* не JSON */ }
  if (status === 401 || status === 404) return 'badtoken';
  if (status === 429) return 'rate';
  if (status === 403) return 'blocked';
  if (status === 409) return 'webhook';
  if (status === 400 && /chat not found|PEER_ID_INVALID/i.test(d)) return 'chat';
  return 'http' + status;
}
const dcCode = status => (status === 401 || status === 404 ? 'badhook' : status === 429 ? 'rate' : 'http' + status);

class Notifier {
  /** o.file — путь к файлу настроек, o.fetch — функция запроса (net.fetch), o.safeStorage — шифрование системы (может не быть). */
  constructor(o) {
    this.file = o.file; this.fetch = o.fetch; this.ss = o.safeStorage || null; this.timeout = o.timeout || 12000;
    this.cfg = { tg: { token: '', chat: '', name: '' }, dc: { hook: '', uid: '' } };
    this.enc = true; this.farewell = null; this.pending = new Set();
  }
  canEncrypt() { try { return !!(this.ss && this.ss.isEncryptionAvailable()); } catch (e) { return false; } }
  load() {
    try {
      const j = JSON.parse(fs.readFileSync(this.file, 'utf8')), raw = Buffer.from(String(j.d || ''), 'base64');
      this.enc = j.enc !== false;
      const txt = this.enc ? this.ss.decryptString(raw) : raw.toString('utf8');
      const c = JSON.parse(txt);
      this.cfg = {
        tg: { token: TG_TOKEN.test(c.tg && c.tg.token) ? c.tg.token : '', chat: TG_CHAT.test(c.tg && c.tg.chat) ? c.tg.chat : '', name: String(c.tg && c.tg.name || '').slice(0, 60) },
        dc: { hook: DC_HOOK.test(c.dc && c.dc.hook) ? c.dc.hook : '', uid: DC_UID.test(c.dc && c.dc.uid) ? c.dc.uid : '' },
      };
    } catch (e) { /* нет файла или он не читается: настроек нет */ }
  }
  save() {
    const empty = !this.cfg.tg.token && !this.cfg.dc.hook;
    if (empty) { try { fs.rmSync(this.file, { force: true }); } catch (e) { /* уже нет */ } return; }
    this.enc = this.canEncrypt();
    const txt = JSON.stringify(this.cfg), buf = this.enc ? this.ss.encryptString(txt) : Buffer.from(txt, 'utf8');
    fs.writeFileSync(this.file, JSON.stringify({ enc: this.enc, d: buf.toString('base64') }), { mode: 0o600 });
  }
  /** Что известно странице: без самих секретов. */
  status() {
    const c = this.cfg;
    return { tg: { token: !!c.tg.token, chat: c.tg.chat, name: c.tg.name }, dc: { hook: !!c.dc.hook, uid: c.dc.uid }, encrypted: this.enc && this.canEncrypt() };
  }
  setTelegram(o) {
    o = o || {};
    const tok = String(o.token || '').trim(), chat = String(o.chat || '').trim();
    if (tok && !TG_TOKEN.test(tok)) throw new Error('nt:badtoken');
    if (chat && !TG_CHAT.test(chat)) throw new Error('nt:badchat');
    if (tok && tok !== this.cfg.tg.token) this.cfg.tg = { token: tok, chat: '', name: '' };      // новый бот: прежний чат ему не подходит
    if (!this.cfg.tg.token) throw new Error('nt:badtoken');
    if (chat !== undefined && o.chat !== undefined) this.cfg.tg.chat = chat;
    this.save(); return this.status();
  }
  setDiscord(o) {
    o = o || {};
    const hook = String(o.hook || '').trim(), uid = String(o.uid || '').trim();
    if (hook && !DC_HOOK.test(hook)) throw new Error('nt:badhook');
    if (uid && !DC_UID.test(uid)) throw new Error('nt:baduid');
    if (hook) this.cfg.dc.hook = hook;
    if (!this.cfg.dc.hook) throw new Error('nt:badhook');
    if (o.uid !== undefined) this.cfg.dc.uid = uid;
    this.save(); return this.status();
  }
  clear(which) {
    if (which === 'tg' || which === 'all') this.cfg.tg = { token: '', chat: '', name: '' };
    if (which === 'dc' || which === 'all') this.cfg.dc = { hook: '', uid: '' };
    this.save(); return this.status();
  }
  async _req(url, body) {
    const ac = new AbortController(), timer = setTimeout(() => ac.abort(), this.timeout);
    try {
      const res = await this.fetch(url, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: ac.signal, cache: 'no-store' });
      return { status: res.status, text: await res.text() };
    } catch (e) { return { status: 0, text: '', err: e && e.name === 'AbortError' ? 'timeout' : 'network' }; } finally { clearTimeout(timer); }
  }
  /** Отправить текст во все подключённые сервисы. Ответ: по каждому {ok} или {code}; пустой объект, если ничего не подключено. */
  async send(text, o) {
    o = o || {}; text = clip(text);
    if (!text.trim()) return {};
    const out = {}, jobs = [], c = this.cfg;
    if (c.tg.token && c.tg.chat && (!o.only || o.only === 'tg')) jobs.push(this._req('https://api.telegram.org/bot' + c.tg.token + '/sendMessage', { chat_id: c.tg.chat, text, disable_web_page_preview: true })
      .then(r => { out.tg = r.status === 200 ? { ok: true } : { ok: false, code: r.err || tgCode(r.status, r.text) }; }));
    if (c.dc.hook && (!o.only || o.only === 'dc')) jobs.push(this._req(c.dc.hook + '?wait=false', { content: (c.dc.uid ? '<@' + c.dc.uid + '> ' : '') + text, allowed_mentions: c.dc.uid ? { users: [c.dc.uid] } : { parse: [] } })
      .then(r => { out.dc = r.status === 200 || r.status === 204 ? { ok: true } : { ok: false, code: r.err || dcCode(r.status) }; }));
    const p = Promise.all(jobs); this.pending.add(p);
    try { await p; } finally { this.pending.delete(p); }
    return out;
  }
  /** Найти чат: человек нажал Start у своего бота (или написал ему), бот видит это в getUpdates. */
  async findTelegramChat() {
    const tok = this.cfg.tg.token; if (!tok) throw new Error('nt:badtoken');
    const r = await this._req('https://api.telegram.org/bot' + tok + '/getUpdates?limit=50&timeout=0');
    if (r.err) throw new Error('nt:' + r.err);
    if (r.status !== 200) throw new Error('nt:' + tgCode(r.status, r.text));
    let list = []; try { list = (JSON.parse(r.text) || {}).result || []; } catch (e) { /* пусто */ }
    for (let i = list.length - 1; i >= 0; i--) {
      const m = list[i] && (list[i].message || list[i].my_chat_member && { chat: list[i].my_chat_member.chat });
      if (m && m.chat && m.chat.type === 'private' && /^-?\d+$/.test(String(m.chat.id))) {
        this.cfg.tg.chat = String(m.chat.id); this.cfg.tg.name = String(m.chat.first_name || m.chat.username || '').slice(0, 60); this.save();
        return this.status();
      }
    }
    throw new Error('nt:nochat');
  }
  /** Строка для секрета VNMAP_NOTIFY в репозитории (напоминания по расписанию GitHub): данные этого человека, одной строкой JSON. */
  getMine(memberId) {
    const c = this.cfg, o = { m: String(memberId || '').slice(0, 60) };
    if (c.tg.token && c.tg.chat) { o.tgToken = c.tg.token; o.tgChat = c.tg.chat; }
    if (c.dc.hook) { o.dcHook = c.dc.hook; if (c.dc.uid) o.dcUid = c.dc.uid; }
    if (!o.m || (!o.tgToken && !o.dcHook)) throw new Error('nt:nothing');
    return JSON.stringify(o);
  }
  /** Прощальное сообщение: страница обновляет его по ходу работы, а уходит оно при закрытии окна. */
  setFarewell(f) {
    if (!f || typeof f.text !== 'string' || !f.text.trim()) { this.farewell = null; return; }
    this.farewell = { text: clip(f.text), since: Number(f.since) > 0 ? Number(f.since) : Date.now(), min: Math.max(0, Math.min(3600e3, Number(f.min) || 0)) };
  }
  /** Отправить прощальное сообщение, если сессия длилась достаточно долго. Вызывается один раз за закрытие. */
  sendFarewell() {
    const f = this.farewell; this.farewell = null;
    if (!f || Date.now() - f.since < f.min) return Promise.resolve({});
    return this.send(f.text);
  }
  busy() { return this.pending.size > 0; }
  /** Дождаться, пока уйдёт всё начатое (но не дольше ms). */
  whenIdle(ms) { return Promise.race([Promise.all([...this.pending]).catch(() => { }), new Promise(r => setTimeout(r, ms || 5000))]); }
}
module.exports = { Notifier, TG_TOKEN, TG_CHAT, DC_HOOK, DC_UID, tgCode, dcCode, clip };

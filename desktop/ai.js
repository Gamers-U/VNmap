'use strict';
/* ИИ-помощник: связь с нейросетями из оболочки.
   Окно программы в сеть ходить не может (политика безопасности), а ключи не должны попадать на страницу. Поэтому:
   страница присылает путь, заголовки и тело запроса, а на место ключа ставит метку {{KEY}}; оболочка подставляет настоящий ключ,
   сама делает запрос и отдаёт ответ кусками (потоком). Ключи хранятся зашифрованно средствами системы и обратно странице не отдаются.
   Адрес поставщика фиксирован (таблица ниже); свой адрес можно задать только для локальных программ и «своего» поставщика, и ключ
   уходит только по тому адресу, который сохранён здесь, а не по присланному страницей. */
const fs = require('fs');

const KEYMARK = '{{KEY}}';
/** key: ключ обязателен; own: адрес задаёт пользователь (локальная модель или свой сервис). */
const PROVIDERS = {
  gemini: { base: 'https://generativelanguage.googleapis.com/v1beta', key: true },
  openai: { base: 'https://api.openai.com/v1', key: true },
  deepseek: { base: 'https://api.deepseek.com', key: true },
  openrouter: { base: 'https://openrouter.ai/api/v1', key: true },
  groq: { base: 'https://api.groq.com/openai/v1', key: true },
  anthropic: { base: 'https://api.anthropic.com/v1', key: true },
  ollama: { base: 'http://localhost:11434/v1', own: true },
  lmstudio: { base: 'http://localhost:1234/v1', own: true },
  custom: { base: '', own: true },
};
const KEY_RE = /^[\x21-\x7e]{8,400}$/;                       // ключи — печатные символы без пробелов
const HDR_NAME = /^[A-Za-z0-9-]{1,60}$/;
const HDR_DENY = /^(host|content-length|connection|cookie|transfer-encoding|upgrade|proxy-.*)$/i;
const MAX_BODY = 4 * 1048576, MAX_ANSWER = 16 * 1048576, MAX_ERR = 20000;

/** http допустим только для своего компьютера и домашней сети: иначе ключ ушёл бы по сети открытым текстом. */
function localHost(h) {
  h = String(h || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return false;
  if (h === 'localhost' || h === '::1' || h.endsWith('.localhost') || h.endsWith('.local') || !h.includes('.') && !h.includes(':')) return true;
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (m) { const a = +m[1], b = +m[2]; return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254); }
  return /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h);
}
/** Приводит адрес к виду без хвостового «/»; бросает 'ai:badbase' или 'ai:insecure'. Пустая строка значит «сбросить». */
function cleanBase(url) {
  url = String(url || '').trim();
  if (!url) return '';
  let u; try { u = new URL(url); } catch (e) { throw new Error('ai:badbase'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('ai:badbase');
  if (u.username || u.password || u.search || u.hash) throw new Error('ai:badbase');
  if (u.protocol === 'http:' && !localHost(u.hostname)) throw new Error('ai:insecure');
  return (u.origin + u.pathname).replace(/\/+$/, '');
}

class AiHub {
  /** o.file — файл настроек; o.fetch — запрос (net.fetch); o.safeStorage — шифрование системы (может не быть). */
  constructor(o) {
    this.file = o.file; this.fetch = o.fetch; this.ss = o.safeStorage || null;
    this.timeout = o.timeout || 60000; this.idle = o.idle || 90000;
    this.cfg = { keys: {}, bases: {} };
    this.enc = true; this.live = new Map();
  }
  canEncrypt() { try { return !!(this.ss && this.ss.isEncryptionAvailable()); } catch (e) { return false; } }
  load() {
    try {
      const j = JSON.parse(fs.readFileSync(this.file, 'utf8')), raw = Buffer.from(String(j.d || ''), 'base64');
      this.enc = j.enc !== false;
      const c = JSON.parse(this.enc ? this.ss.decryptString(raw) : raw.toString('utf8'));
      const keys = {}, bases = {};
      for (const id of Object.keys(PROVIDERS)) {
        if (c.keys && KEY_RE.test(c.keys[id])) keys[id] = c.keys[id];
        if (PROVIDERS[id].own && c.bases && c.bases[id]) { try { const b = cleanBase(c.bases[id]); if (b) bases[id] = b; } catch (e) { /* адрес испорчен: берём стандартный */ } }
      }
      this.cfg = { keys, bases };
    } catch (e) { /* нет файла или он не читается: настроек нет */ }
  }
  save() {
    if (!Object.keys(this.cfg.keys).length && !Object.keys(this.cfg.bases).length) { try { fs.rmSync(this.file, { force: true }); } catch (e) { /* уже нет */ } return; }
    this.enc = this.canEncrypt();
    const txt = JSON.stringify(this.cfg), buf = this.enc ? this.ss.encryptString(txt) : Buffer.from(txt, 'utf8');
    fs.writeFileSync(this.file, JSON.stringify({ enc: this.enc, d: buf.toString('base64') }), { mode: 0o600 });
  }
  /** Что известно странице: есть ли ключ (самого ключа нет), адреса локальных поставщиков. */
  status() {
    const keys = {}, bases = {};
    for (const id of Object.keys(PROVIDERS)) {
      if (this.cfg.keys[id]) keys[id] = true;
      if (PROVIDERS[id].own) bases[id] = this.baseOf(id);
    }
    return { keys, bases, encrypted: this.enc && this.canEncrypt() };
  }
  baseOf(id) { const p = PROVIDERS[id]; if (!p) return ''; return p.own ? (this.cfg.bases[id] || p.base) : p.base; }
  setKey(id, key) {
    if (!PROVIDERS[id]) throw new Error('ai:badprov');
    key = String(key || '').trim();
    if (!KEY_RE.test(key)) throw new Error('ai:badkey');
    this.cfg.keys[id] = key; this.save(); return this.status();
  }
  clearKey(id) {
    if (!PROVIDERS[id]) throw new Error('ai:badprov');
    delete this.cfg.keys[id]; this.save(); return this.status();
  }
  setBase(id, url) {
    if (!PROVIDERS[id] || !PROVIDERS[id].own) throw new Error('ai:badprov');
    const b = cleanBase(url);
    if (b && b !== PROVIDERS[id].base) this.cfg.bases[id] = b; else delete this.cfg.bases[id];
    this.save(); return this.status();
  }
  /** Проверяет запрос страницы и запускает его. Ошибки проверки бросаются сразу; дальнейшее (сеть, ответ) приходит событиями emit. */
  start(o, emit) {
    o = o || {};
    const id = String(o.id || ''), prov = PROVIDERS[o.provider];
    if (!/^[\w-]{1,64}$/.test(id) || this.live.has(id)) throw new Error('ai:badid');
    if (!prov) throw new Error('ai:badprov');
    const method = o.method === 'GET' ? 'GET' : o.method === 'POST' ? 'POST' : '';
    if (!method) throw new Error('ai:badreq');
    const path = String(o.path || '');
    if (!/^\/[^\s#\\]*$/.test(path) || path.length > 600 || path.includes('..') || path.includes('//')) throw new Error('ai:badreq');
    const base = this.baseOf(o.provider);
    if (!base) throw new Error('ai:nobase');
    const url = base + path;
    let bu, uu; try { bu = new URL(base); uu = new URL(url); } catch (e) { throw new Error('ai:badbase'); }
    if (uu.origin !== bu.origin || !uu.pathname.startsWith(bu.pathname.replace(/\/+$/, '') + '/') || uu.username || uu.password) throw new Error('ai:badreq');
    const key = this.cfg.keys[o.provider] || '';
    const headers = {};
    for (const [k, v] of Object.entries(o.headers && typeof o.headers === 'object' ? o.headers : {})) {
      if (!HDR_NAME.test(k) || HDR_DENY.test(k) || typeof v !== 'string' || v.length > 600 || /[\r\n]/.test(v)) throw new Error('ai:badreq');
      if (v.includes(KEYMARK)) {
        if (!key) { if (prov.key) throw new Error('ai:nokey'); continue; }              // для локальных программ ключ необязателен: заголовок просто не отправляем
        headers[k] = v.split(KEYMARK).join(key);
      } else headers[k] = v;
    }
    let body;
    if (method === 'POST') {
      body = typeof o.body === 'string' ? o.body : o.body == null ? '' : null;
      if (body === null || Buffer.byteLength(body) > MAX_BODY) throw new Error('ai:badreq');
    }
    if (this.live.size >= 4) throw new Error('ai:busy');
    const ac = new AbortController(); this.live.set(id, { ac, why: '' });
    this._run(id, url, { method, headers, body, signal: ac.signal, redirect: 'error' }, key, emit).catch(() => { });
    return { id };
  }
  abort(id) { const l = this.live.get(String(id || '')); if (l) { l.why = 'user'; l.ac.abort(); } return !!l; }
  abortAll() { for (const l of this.live.values()) { l.why = 'user'; l.ac.abort(); } }
  async _run(id, url, init, key, emit) {
    const l = this.live.get(id), say = ev => { try { emit(Object.assign({ id }, ev)); } catch (e) { /* окно закрыто */ } };
    const clean = s => { s = String(s || ''); return key ? s.split(key).join('***') : s; };
    let timer = null, total = 0;
    const arm = ms => { clearTimeout(timer); timer = setTimeout(() => { l.why = 'timeout'; l.ac.abort(); }, ms); };
    try {
      arm(this.timeout);
      const res = await this.fetch(url, init);
      arm(this.idle);
      say({ type: 'head', status: res.status });
      if (!res.ok) {
        const txt = clean(await res.text()).slice(0, MAX_ERR);
        say({ type: 'end', status: res.status, text: txt });
        return;
      }
      const rd = res.body && res.body.getReader ? res.body.getReader() : null, dec = new TextDecoder('utf-8');
      if (!rd) { const txt = clean(await res.text()); say({ type: 'chunk', text: txt }); }
      else {
        for (;;) {
          const { done, value } = await rd.read();
          if (done) break;
          arm(this.idle);
          total += value.length;
          if (total > MAX_ANSWER) { l.why = 'toobig'; l.ac.abort(); throw new Error('big'); }
          const text = dec.decode(value, { stream: true });
          if (text) say({ type: 'chunk', text: clean(text) });
        }
        const tail = dec.decode(); if (tail) say({ type: 'chunk', text: clean(tail) });
      }
      say({ type: 'end', status: res.status });
    } catch (e) {
      const why = l && l.why;
      if (why === 'user') say({ type: 'end', aborted: true });
      else if (why === 'timeout') say({ type: 'error', code: 'timeout' });
      else if (why === 'toobig') say({ type: 'error', code: 'toobig' });
      else say({ type: 'error', code: 'network', msg: clean(e && e.cause && (e.cause.code || e.cause.message) || e && e.message).slice(0, 200) });
    } finally { clearTimeout(timer); this.live.delete(id); }
  }
}

module.exports = { AiHub, PROVIDERS, KEYMARK, cleanBase, localHost };

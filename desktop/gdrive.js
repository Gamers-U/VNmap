'use strict';
/* Google Диск для главного процесса: вход (OAuth 2.0 для настольных программ: loopback + PKCE) и узкая обёртка над Drive API v3.
   Токены не покидают этот файл: страница получает только результаты операций.
   Область доступа drive.file: программа видит лишь файлы и папки, которые создала сама. */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const REAL = {
  auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  revoke: 'https://oauth2.googleapis.com/revoke',
  api: 'https://www.googleapis.com/drive/v3',
  upload: 'https://www.googleapis.com/upload/drive/v3',
};
const FOLDER = 'application/vnd.google-apps.folder';
const ID_RE = /^[A-Za-z0-9_-]{6,128}$/;
const FIELDS = 'id,name,mimeType,md5Checksum,size,modifiedTime,version,parents,description,appProperties,trashed';
const MULTIPART_MAX = 4 * 1024 * 1024;   // выше этого грузим возобновляемой сессией (документация: до 5 МБ — multipart)

const b64url = buf => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
/** Ошибки через IPC теряют свойства, поэтому код зашит в текст: «gd:<код>:<сообщение>». */
const fail = (code, msg, status) => { const e = new Error(`gd:${code}:${msg}`); e.gdCode = code; e.status = status; return e; };
const qEsc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const cleanName = s => String(s || 'file').replace(/[\\/\x00-\x1f]+/g, '_').trim().slice(0, 200) || 'file';
function cleanProps(o) {
  const out = {}; let n = 0;
  for (const [k, v] of Object.entries(o || {})) {
    if (n >= 20) break;
    const key = String(k).slice(0, 40); let val = String(v);
    while (Buffer.byteLength(key + val) > 120) val = val.slice(0, -1);
    out[key] = val; n++;
  }
  return out;
}

class GDrive {
  /**
   * @param {object} o  { dir, defaultsPath, net, safeStorage, openUrl, endpoints? }
   */
  constructor(o) {
    this.dir = o.dir; this.net = o.net; this.safe = o.safeStorage; this.openUrl = o.openUrl;
    this.defaultsPath = o.defaultsPath;
    this.E = Object.assign({}, REAL, o.endpoints || {});
    this.cfgFile = path.join(this.dir, 'google.json');
    this.tokFile = path.join(this.dir, 'google-token.json');
    this.cfg = this._readJson(this.cfgFile) || {};
    this.defaults = this._readJson(this.defaultsPath) || {};
    this.tok = null;            // { refresh, access, exp, email }
    this.loginServer = null;
    this._loadToken();
  }

  /* ---------- настройки и токен ---------- */
  _readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
  _writePrivate(p, text) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text, { mode: 0o600 }); try { fs.chmodSync(p, 0o600); } catch (e) { /* Windows */ } }
  get clientId() { return (this.cfg.clientId || this.defaults.clientId || '').trim(); }
  get clientSecret() { return (this.cfg.clientSecret || this.defaults.clientSecret || '').trim(); }
  configInfo() { return { clientId: this.clientId, hasSecret: !!this.clientSecret, bundled: !!(this.defaults.clientId && !this.cfg.clientId) }; }
  setConfig(c) {
    const clientId = String(c && c.clientId || '').trim().slice(0, 300);
    const clientSecret = String(c && c.clientSecret || '').trim().slice(0, 300);
    if (clientId && !/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw fail('bad_request', 'Идентификатор клиента должен заканчиваться на .apps.googleusercontent.com');
    const changed = clientId !== this.clientId;
    this.cfg = { clientId, clientSecret: clientSecret || (changed ? '' : this.cfg.clientSecret || '') };
    this._writePrivate(this.cfgFile, JSON.stringify(this.cfg));
    if (changed && this.tok) { this.tok = null; try { fs.rmSync(this.tokFile, { force: true }); } catch (e) { /* нет */ } }
    return this.configInfo();
  }
  _loadToken() {
    const w = this._readJson(this.tokFile); if (!w || !w.data) return;
    try {
      const text = w.enc ? this.safe.decryptString(Buffer.from(w.data, 'base64')) : w.data;
      const t = JSON.parse(text);
      if (t && t.refresh) this.tok = { refresh: t.refresh, access: '', exp: 0, email: t.email || '' };
    } catch (e) { this.tok = null; }
  }
  _saveToken() {
    if (!this.tok) { try { fs.rmSync(this.tokFile, { force: true }); } catch (e) { /* нет */ } return; }
    const text = JSON.stringify({ refresh: this.tok.refresh, email: this.tok.email || '' });
    let enc = false, data = text;
    try { if (this.safe && this.safe.isEncryptionAvailable()) { data = this.safe.encryptString(text).toString('base64'); enc = true; } } catch (e) { enc = false; data = text; }
    this._writePrivate(this.tokFile, JSON.stringify({ v: 1, enc, data }));
    this.encrypted = enc;
  }
  status() {
    const w = this._readJson(this.tokFile);
    return {
      configured: !!this.clientId, signedIn: !!(this.tok && this.tok.refresh), email: this.tok ? this.tok.email || '' : '',
      encrypted: w ? !!w.enc : !!(this.safe && this.safe.isEncryptionAvailable && this.safe.isEncryptionAvailable()),
      device: os.hostname().slice(0, 60), bundled: this.configInfo().bundled,
    };
  }

  /* ---------- сеть ---------- */
  async _fetch(url, opt = {}, timeout = 120000) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
    try { return await this.net.fetch(url, { ...opt, signal: ctl.signal }); }
    catch (e) { throw fail('network', 'Нет связи с Google (' + (e && (e.cause && e.cause.code || e.message) || 'сеть') + ')'); }
    finally { clearTimeout(t); }
  }
  async _tokenRequest(params) {
    const body = new URLSearchParams(params);
    if (this.clientSecret) body.set('client_secret', this.clientSecret);
    body.set('client_id', this.clientId);
    const r = await this._fetch(this.E.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }, 30000);
    let j = {}; try { j = await r.json(); } catch (e) { /* не JSON */ }
    if (!r.ok) {
      const err = j.error || 'error', desc = j.error_description || '';
      if (err === 'invalid_grant') throw fail('auth', 'Разрешение истекло или отозвано: войдите в Google заново.', r.status);
      throw fail(err === 'invalid_client' || err === 'unauthorized_client' ? 'config' : 'bad_request', `${err}${desc ? ': ' + desc : ''}`, r.status);
    }
    return j;
  }
  async _access() {
    if (!this.clientId) throw fail('not_configured', 'Не указан идентификатор клиента Google.');
    if (!this.tok || !this.tok.refresh) throw fail('auth', 'Нужно войти в Google.');
    if (this.tok.access && Date.now() < this.tok.exp - 60000) return this.tok.access;
    let j;
    try { j = await this._tokenRequest({ grant_type: 'refresh_token', refresh_token: this.tok.refresh }); }
    catch (e) { if (e.gdCode === 'auth') { this.tok = null; this._saveToken(); } throw e; }
    this.tok.access = j.access_token; this.tok.exp = Date.now() + (+j.expires_in || 3000) * 1000;
    return this.tok.access;
  }
  /** Запрос к Drive с обновлением токена и повторами. */
  async _api(method, url, { json, body, headers = {}, raw = false, timeout } = {}) {
    let refreshed = false;
    for (let attempt = 0; ; attempt++) {
      const token = await this._access();
      const h = { Authorization: 'Bearer ' + token, ...headers };
      let payload = body;
      if (json !== undefined) { payload = JSON.stringify(json); h['Content-Type'] = 'application/json; charset=UTF-8'; }
      let r;
      try { r = await this._fetch(url, { method, headers: h, body: payload }, timeout || 120000); }
      catch (e) { if (attempt < 3) { await sleep(700 * 2 ** attempt); continue; } throw e; }
      if (r.ok) return raw ? r : (r.status === 204 ? {} : r.json());
      if (r.status === 401 && !refreshed) { refreshed = true; if (this.tok) this.tok.access = ''; continue; }
      let j = {}; try { j = await r.json(); } catch (e) { /* пусто */ }
      const reason = j.error && j.error.errors && j.error.errors[0] && j.error.errors[0].reason || '';
      const msg = (j.error && j.error.message) || ('HTTP ' + r.status);
      if ((r.status === 429 || r.status >= 500 || (r.status === 403 && /rateLimit|userRateLimit/i.test(reason))) && attempt < 4) { await sleep(900 * 2 ** attempt + Math.random() * 300); continue; }
      if (r.status === 401) throw fail('auth', 'Google не принял вход: войдите заново.', 401);
      if (r.status === 404) throw fail('not_found', msg, 404);
      if (r.status === 403 && /storageQuota|quotaExceeded/i.test(reason)) throw fail('quota', 'На Google Диске не хватает места.', 403);
      if (r.status === 403) throw fail('forbidden', msg + (reason ? ' (' + reason + ')' : ''), 403);
      throw fail('bad_request', msg, r.status);
    }
  }

  /* ---------- вход ---------- */
  cancelSignIn() { if (this.loginServer) { try { this.loginServer.close(); } catch (e) { /* уже закрыт */ } this.loginServer = null; if (this._rejectLogin) this._rejectLogin(fail('cancelled', 'Вход отменён')); } }
  async signIn() {
    if (!this.clientId) throw fail('not_configured', 'Сначала укажите идентификатор клиента Google.');
    this.cancelSignIn();
    const verifier = b64url(crypto.randomBytes(64)), challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
    const state = b64url(crypto.randomBytes(24));
    let resolve, reject; const done = new Promise((a, b) => { resolve = a; reject = b; }); this._rejectLogin = reject;
    const page = (ok, text) => `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Карта новеллы</title><body style="font:16px system-ui,sans-serif;max-width:30em;margin:15vh auto;padding:0 1em;text-align:center"><h2>${ok ? '✓ Готово' : 'Не получилось'}</h2><p>${text}</p></body></html>`;
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/') { res.writeHead(404); res.end(); return; }
      const err = u.searchParams.get('error'), code = u.searchParams.get('code'), st = u.searchParams.get('state');
      res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
      if (err) { res.end(page(false, 'Вход отменён. Можно закрыть эту вкладку.')); reject(fail('cancelled', err === 'access_denied' ? 'Вход отменён' : err)); return; }
      if (!code || st !== state) { res.statusCode = 400; res.end(page(false, 'Неверный ответ. Вернитесь в программу и повторите вход.')); return; }
      res.end(page(true, 'Вход выполнен. Эту вкладку можно закрыть и вернуться в программу.')); resolve(code);
    });
    this.loginServer = server;
    const port = await new Promise((res, rej) => { server.once('error', rej); server.listen(0, '127.0.0.1', () => res(server.address().port)); });
    const redirect = `http://127.0.0.1:${port}`;
    const q = new URLSearchParams({ client_id: this.clientId, redirect_uri: redirect, response_type: 'code', scope: SCOPE, code_challenge: challenge, code_challenge_method: 'S256', state, access_type: 'offline', prompt: 'consent' });
    const timer = setTimeout(() => reject(fail('timeout', 'Время на вход вышло.')), 5 * 60 * 1000);
    try {
      await this.openUrl(`${this.E.auth}?${q}`);
      const code = await done;
      const j = await this._tokenRequest({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirect });
      if (!j.refresh_token) throw fail('bad_request', 'Google не выдал постоянное разрешение. Отзовите доступ программы в настройках аккаунта Google и войдите снова.');
      this.tok = { refresh: j.refresh_token, access: j.access_token, exp: Date.now() + (+j.expires_in || 3000) * 1000, email: '' };
      try { const a = await this.about(); this.tok.email = a.email; } catch (e) { /* почта не обязательна */ }
      this._saveToken();
      return this.status();
    } finally { clearTimeout(timer); try { server.close(); } catch (e) { /* ok */ } if (this.loginServer === server) this.loginServer = null; this._rejectLogin = null; }
  }
  async signOut() {
    const t = this.tok; this.tok = null; this._saveToken();
    if (t && t.refresh) { try { await this._fetch(`${this.E.revoke}?token=${encodeURIComponent(t.refresh)}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, 15000); } catch (e) { /* отзыв не обязателен */ } }
    return this.status();
  }

  /* ---------- Drive ---------- */
  async about() {
    const j = await this._api('GET', `${this.E.api}/about?fields=user(emailAddress,displayName)`);
    return { email: (j.user && j.user.emailAddress) || '', name: (j.user && j.user.displayName) || '' };
  }
  _q(f) {
    const p = [];
    if (f.parentId) { if (!ID_RE.test(f.parentId)) throw fail('bad_request', 'bad parent'); p.push(`'${f.parentId}' in parents`); }
    if (f.name !== undefined) p.push(`name = '${qEsc(f.name)}'`);
    if (f.folder === true) p.push(`mimeType = '${FOLDER}'`); else if (f.folder === false) p.push(`mimeType != '${FOLDER}'`);
    if (f.appProp) p.push(`appProperties has { key='${qEsc(f.appProp.key)}' and value='${qEsc(f.appProp.value)}' }`);
    else if (f.appKey) p.push(`appProperties has { key='${qEsc(f.appKey)}' }`);
    p.push('trashed = false');
    return p.join(' and ');
  }
  async find(f) {
    const q = this._q(f || {}), out = []; let pageToken = '';
    do {
      const u = new URL(this.E.api + '/files');
      u.searchParams.set('q', q); u.searchParams.set('fields', `nextPageToken,files(${FIELDS})`); u.searchParams.set('pageSize', '1000'); u.searchParams.set('spaces', 'drive');
      if (pageToken) u.searchParams.set('pageToken', pageToken);
      const j = await this._api('GET', u.toString());
      out.push(...(j.files || [])); pageToken = j.nextPageToken || '';
    } while (pageToken);
    return out;
  }
  async createFolder(name, parentId, appProperties) {
    if (parentId && !ID_RE.test(parentId)) throw fail('bad_request', 'bad parent');
    const meta = { name: cleanName(name), mimeType: FOLDER, appProperties: cleanProps(appProperties) };
    if (parentId) meta.parents = [parentId];
    return this._api('POST', `${this.E.api}/files?fields=${FIELDS}`, { json: meta });
  }
  async update(fileId, patch) {
    if (!ID_RE.test(fileId)) throw fail('bad_request', 'bad id');
    const meta = {};
    if (patch.name !== undefined) meta.name = cleanName(patch.name);
    if (patch.description !== undefined) meta.description = String(patch.description).slice(0, 4000);
    if (patch.appProperties) meta.appProperties = cleanProps(patch.appProperties);
    if (patch.trashed === true) meta.trashed = true;
    return this._api('PATCH', `${this.E.api}/files/${fileId}?fields=${FIELDS}`, { json: meta });
  }
  async get(fileId) {
    if (!ID_RE.test(fileId)) throw fail('bad_request', 'bad id');
    return this._api('GET', `${this.E.api}/files/${fileId}?fields=${FIELDS}`);
  }
  async trash(fileId) { return this.update(fileId, { trashed: true }); }
  /** Создаёт файл или (если указан fileId) заменяет содержимое. */
  async upload({ name, parentId, bytes, mimeType, appProperties, description, fileId }) {
    if (fileId && !ID_RE.test(fileId)) throw fail('bad_request', 'bad id');
    if (parentId && !ID_RE.test(parentId)) throw fail('bad_request', 'bad parent');
    const data = Buffer.isBuffer(bytes) ? bytes : typeof bytes === 'string' ? Buffer.from(bytes, 'utf8') : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const mime = /^[\w.+-]+\/[\w.+-]+$/.test(mimeType || '') ? mimeType : 'application/octet-stream';
    const meta = {};
    if (!fileId) { meta.name = cleanName(name); if (parentId) meta.parents = [parentId]; }
    else if (name) meta.name = cleanName(name);
    if (appProperties) meta.appProperties = cleanProps(appProperties);
    if (description !== undefined) meta.description = String(description).slice(0, 4000);
    meta.mimeType = mime;
    const base = `${this.E.upload}/files${fileId ? '/' + fileId : ''}`;
    const method = fileId ? 'PATCH' : 'POST';
    if (data.length <= MULTIPART_MAX) {
      const b = 'vnmap' + crypto.randomBytes(12).toString('hex');
      const body = Buffer.concat([
        Buffer.from(`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: ${mime}\r\n\r\n`, 'utf8'),
        data, Buffer.from(`\r\n--${b}--`, 'utf8')]);
      return this._api(method, `${base}?uploadType=multipart&fields=${FIELDS}`, { body, headers: { 'Content-Type': `multipart/related; boundary=${b}` }, timeout: 300000 });
    }
    /* возобновляемая загрузка: сначала сессия, затем один PUT с данными */
    const init = await this._api(method, `${base}?uploadType=resumable&fields=${FIELDS}`, { json: meta, raw: true, headers: { 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(data.length) } });
    const loc = init.headers.get('location');
    if (!loc) throw fail('bad_request', 'Google не вернул адрес для загрузки.');
    for (let attempt = 0; ; attempt++) {
      let r;
      try { r = await this._fetch(loc, { method: 'PUT', headers: { 'Content-Type': mime }, body: data }, 20 * 60 * 1000); }
      catch (e) { if (attempt < 2) { await sleep(1500 * (attempt + 1)); continue; } throw e; }
      if (r.ok) return r.json();
      if ((r.status >= 500 || r.status === 429) && attempt < 3) { await sleep(1500 * (attempt + 1)); continue; }
      if (r.status === 403) throw fail('quota', 'На Google Диске не хватает места или нет доступа.', 403);
      throw fail('bad_request', 'Загрузка не удалась: HTTP ' + r.status, r.status);
    }
  }
  async download(fileId) {
    if (!ID_RE.test(fileId)) throw fail('bad_request', 'bad id');
    const r = await this._api('GET', `${this.E.api}/files/${fileId}?alt=media`, { raw: true, timeout: 20 * 60 * 1000 });
    return Buffer.from(await r.arrayBuffer());
  }
}

module.exports = { GDrive, FOLDER };

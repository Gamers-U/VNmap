'use strict';
/* Вход в GitHub «по коду» (OAuth device flow, с 1.7.18). Живёт в оболочке: страницам GitHub не даёт ходить на эти адреса
   (нет CORS), а токен не должен попадать на страницу.
   Порядок: start() просит у GitHub код (POST /login/device/code) и возвращает странице только то, что нужно показать:
   короткий код (ABCD-1234) и адрес страницы подтверждения. Внутри оболочки дальше идёт опрос (POST /login/oauth/access_token)
   каждые interval секунд, пока вы подтверждаете код на сайте. Когда токен получен, его принимает onToken (проверка /user и
   сохранение так же, как у токена, введённого вручную); страница видит только «готово» и логин.
   Страница никогда не получает device_code и токен. Адреса запросов фиксированы (base + два пути), перенаправления запрещены,
   адрес страницы подтверждения должен быть на том же сайте, что и base. Client ID публичный (секрета у приложения нет:
   для входа по коду он не нужен). */

const CLIENT_ID = 'Ov23ligenfxPCBaddY5J';
const CLIENT_RE = /^[A-Za-z0-9._-]{10,40}$/;
const SCOPES = { repo: 'repo', public: 'public_repo' };       // repo — и закрытые репозитории, public_repo — только открытые
const TOKEN_RE = /^[\w-]{20,255}$/;
const USER_CODE_RE = /^[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]$/;
const GRANT = 'urn:ietf:params:oauth:grant-type:device_code';
const MAX_FAILS = 5;                                          // подряд неудачных опросов (нет связи, ошибка сервера) до остановки
const MAX_LIFE = 15 * 60 * 1000;                              // GitHub даёт код на 15 минут; больше не ждём в любом случае

const err = (code, msg) => new Error('gh:' + code + ':' + (msg || code));

class GhLogin {
  /** o.fetch — запрос (net.fetch), o.onToken(token, scope) — принять токен (бросает ошибку, если GitHub его не принял),
      o.base — сайт GitHub (в автотестах адрес имитации), o.clientId, o.wait(ms) — пауза (в автотестах короткая), o.now. */
  constructor(o) {
    this.base = String(o.base || 'https://github.com').replace(/\/+$/, '');
    this.clientId = CLIENT_RE.test(String(o.clientId || '')) ? String(o.clientId) : CLIENT_ID;
    this.fetch = o.fetch; this.onToken = o.onToken;
    this.now = o.now || Date.now;
    this.wait = o.wait || (ms => new Promise(r => setTimeout(r, ms)));
    this.minInterval = o.minInterval == null ? 1 : o.minInterval;     // секунд; GitHub сам называет интервал (обычно 5)
    this.timeout = o.timeout || 15000;
    this.gen = 0;                                                      // номер попытки: отмена и новый запуск делают прежнюю недействительной
    this.st = { state: 'idle' };
  }

  async _post(path, body) {
    const ac = new AbortController(), timer = setTimeout(() => ac.abort(), this.timeout);
    try {
      const res = await this.fetch(this.base + path, { method: 'POST', redirect: 'error', cache: 'no-store', signal: ac.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'VNMap' }, body: JSON.stringify(body) });
      let json = null; try { json = JSON.parse(await res.text()); } catch (e) { /* не JSON */ }
      return { status: res.status, json };
    } finally { clearTimeout(timer); }
  }

  /** Что видит страница: состояние, код, адрес, сколько секунд осталось; ни device_code, ни токена здесь нет.
      Конечные состояния (ok, error) отдаются один раз и сбрасываются. */
  status() {
    const s = this.st, out = { state: s.state };
    if (s.state === 'wait') { out.code = s.code; out.uri = s.uri; out.left = Math.max(0, Math.round((s.until - this.now()) / 1000)); out.scope = s.scopeKey; }
    else if (s.state === 'ok') { out.login = s.login || ''; this.st = { state: 'idle' }; }
    else if (s.state === 'error') { out.err = s.err; out.detail = s.detail || ''; this.st = { state: 'idle' }; }
    return out;
  }

  cancel() { this.gen++; if (this.st.state === 'wait') this.st = { state: 'idle' }; return true; }

  /** Запросить код. Бросает ошибку вида gh:код:текст (app — приложение GitHub настроено неверно, network — нет связи). */
  async start(scopeKey) {
    const scope = SCOPES[scopeKey || 'repo'];
    if (!scope) throw err('bad_request', 'scope');
    this.cancel();
    const gen = ++this.gen;
    let r;
    try { r = await this._post('/login/device/code', { client_id: this.clientId, scope }); }
    catch (e) { throw err('network', 'нет связи с GitHub'); }
    if (gen !== this.gen) throw err('cancelled', 'cancelled');
    const d = r.json || {};
    if (d.error || r.status >= 400 || !d.device_code) {
      if (r.status >= 500 || (!r.json && r.status !== 404)) throw err('server', 'http' + r.status);
      throw err('app', String(d.error || 'http' + r.status).slice(0, 60));
    }
    let uri = '';
    try { const u = new URL(String(d.verification_uri || '')); if (u.origin === new URL(this.base).origin) uri = u.origin + u.pathname; } catch (e) { /* не адрес */ }
    const code = String(d.user_code || '').toUpperCase();
    if (!uri || !USER_CODE_RE.test(code)) throw err('app', 'bad_response');
    const life = Math.min(Math.max(Number(d.expires_in) || 900, 30) * 1000, MAX_LIFE);
    this.st = { state: 'wait', code, uri, until: this.now() + life, scopeKey: scopeKey || 'repo' };
    this._loop(gen, String(d.device_code), Math.max(this.minInterval, Number(d.interval) || 5), this.now() + life, scope);
    return this.status();
  }

  _end(gen, state, extra) { if (gen === this.gen) this.st = Object.assign({ state }, extra || {}); }

  async _loop(gen, deviceCode, interval, until, scope) {
    let fails = 0;
    while (gen === this.gen) {
      await this.wait(interval * 1000);
      if (gen !== this.gen) return;
      if (this.now() > until) return this._end(gen, 'error', { err: 'expired' });
      let r;
      try { r = await this._post('/login/oauth/access_token', { client_id: this.clientId, device_code: deviceCode, grant_type: GRANT }); }
      catch (e) { if (++fails >= MAX_FAILS) return this._end(gen, 'error', { err: 'network' }); continue; }
      if (gen !== this.gen) return;
      const j = r.json;
      if (!j || r.status >= 500) { if (++fails >= MAX_FAILS) return this._end(gen, 'error', { err: 'network' }); continue; }
      fails = 0;
      if (j.access_token) {
        if (!TOKEN_RE.test(String(j.access_token))) return this._end(gen, 'error', { err: 'app', detail: 'bad_token' });
        try {
          const res = await this.onToken(String(j.access_token), String(j.scope || scope));
          return this._end(gen, 'ok', { login: String((res && res.login) || '') });
        } catch (e) { return this._end(gen, 'error', { err: 'verify', detail: String((e && e.message) || '').slice(0, 120) }); }
      }
      switch (j.error) {
        case 'authorization_pending': break;
        case 'slow_down': interval = Math.max(interval + 5, Number(j.interval) || 0); break;
        case 'expired_token': return this._end(gen, 'error', { err: 'expired' });
        case 'access_denied': return this._end(gen, 'error', { err: 'denied' });
        default: return this._end(gen, 'error', { err: 'app', detail: String(j.error || 'unknown').slice(0, 60) });
      }
    }
  }
}

module.exports = { GhLogin, CLIENT_ID, SCOPES, USER_CODE_RE };

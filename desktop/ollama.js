'use strict';
/* Управление Ollama из программы (с 1.7.19): что запущено, какие модели уже скачаны, скачать модель (ollama pull) с прогрессом.
   Живёт в оболочке: окну программы запросы к локальным службам закрыты, а общий посредник ИИ (ai.js) пускает только пути под
   адресом «.../v1» (чат), без /api/pull. Здесь адреса фиксированы: origin Ollama из настроек ИИ (по умолчанию http://localhost:11434;
   адрес проверяет ai.js: http только для своего компьютера и домашней сети) и три пути: /api/version, /api/tags, /api/pull.
   Скачивание идёт в оболочке, страница спрашивает состояние (pullStatus) и может отменить (pullCancel). Ollama докачивает
   прерванное с того же места, поэтому отмена безвредна. Имя модели проверяется по шаблону, ничего другого в запрос не попадает. */

const NAME_RE = /^[a-z0-9][a-z0-9._-]{0,63}(?:\/[a-z0-9][a-z0-9._-]{0,63})?(?::[A-Za-z0-9._-]{1,50})?$/;
const MAX_MODELS = 200;

const err = (code, msg) => new Error('ol:' + code + ':' + (msg || code));

class OllamaHost {
  /** o.fetch — запрос (net.fetch), o.origin() — адрес Ollama без пути (например http://localhost:11434). */
  constructor(o) {
    this.fetch = o.fetch; this.origin = o.origin;
    this.timeout = o.timeout || 5000;           // обычный запрос
    this.idle = o.idle || 120000;               // тишина при скачивании, после которой считаем, что связь пропала
    this.gen = 0; this.ac = null;
    this.st = { state: 'idle' };
  }

  async _json(path, ms) {
    const ac = new AbortController(), timer = setTimeout(() => ac.abort(), ms || this.timeout);
    try {
      const res = await this.fetch(this.origin() + path, { method: 'GET', redirect: 'error', cache: 'no-store', signal: ac.signal, headers: { Accept: 'application/json', 'User-Agent': 'VNMap' } });
      if (res.status !== 200) return null;
      return JSON.parse(await res.text());
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }

  /** Запущена ли Ollama, версия и скачанные модели. Не бросает: нет ответа значит не запущена. */
  async status() {
    const v = await this._json('/api/version', 2500);
    if (!v || typeof v.version !== 'string') return { running: false, version: '', models: [] };
    const t = await this._json('/api/tags', 5000);
    const models = ((t && Array.isArray(t.models)) ? t.models : []).slice(0, MAX_MODELS)
      .map(m => ({ name: String((m && (m.name || m.model)) || '').slice(0, 100), size: Number(m && m.size) || 0 })).filter(m => m.name);
    return { running: true, version: v.version.slice(0, 30), models };
  }

  /** Что видит страница: состояние скачивания. Конечные состояния (ok, error) отдаются один раз. */
  pullStatus() {
    const s = this.st, out = { state: s.state };
    if (s.state === 'run') Object.assign(out, { model: s.model, text: s.text || '', pct: s.pct || 0, done: s.done || 0, total: s.total || 0 });
    else if (s.state === 'ok') { out.model = s.model; this.st = { state: 'idle' }; }
    else if (s.state === 'error') { out.model = s.model; out.err = s.err; out.msg = s.msg || ''; this.st = { state: 'idle' }; }
    return out;
  }

  pullCancel() { this.gen++; if (this.ac) { try { this.ac.abort(); } catch (e) { /* уже закрыт */ } this.ac = null; } if (this.st.state === 'run') this.st = { state: 'idle' }; return true; }

  /** Начать скачивание. Бросает ol:badname / ol:busy. Дальше состояние берётся через pullStatus(). */
  pullStart(model) {
    model = String(model || '').trim();
    if (!NAME_RE.test(model)) throw err('badname', 'model name');
    if (this.st.state === 'run') throw err('busy', 'busy');
    const gen = ++this.gen;
    this.st = { state: 'run', model, text: '', pct: 0, done: 0, total: 0 };
    this._pull(gen, model).catch(() => { });
    return this.pullStatus();
  }

  _end(gen, patch) { if (gen === this.gen) this.st = patch; }

  async _pull(gen, model) {
    const ac = new AbortController(); this.ac = ac;
    let timer = null; const arm = () => { clearTimeout(timer); timer = setTimeout(() => ac.abort(), this.idle); };
    const fail = (e, msg) => this._end(gen, { state: 'error', model, err: e, msg: String(msg || '').slice(0, 200) });
    try {
      arm();
      const res = await this.fetch(this.origin() + '/api/pull', { method: 'POST', redirect: 'error', cache: 'no-store', signal: ac.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson', 'User-Agent': 'VNMap' }, body: JSON.stringify({ model, stream: true }) });
      if (gen !== this.gen) return;
      if (res.status !== 200) {
        let m = ''; try { m = (JSON.parse(await res.text()) || {}).error || ''; } catch (e) { /* не JSON */ }
        return fail(res.status === 404 || /not exist|not found|manifest/i.test(m) ? 'notfound' : 'http', m || 'http' + res.status);
      }
      const layers = new Map(); let buf = '', ok = false;
      const reader = res.body.getReader(), dec = new TextDecoder();
      const line = s => {
        let j; try { j = JSON.parse(s); } catch (e) { return; }
        if (j.error) return fail(/not exist|not found|manifest/i.test(String(j.error)) ? 'notfound' : 'ollama', j.error);
        const cur = this.st.state === 'run' && gen === this.gen ? this.st : null; if (!cur) return;
        if (j.digest && j.total) layers.set(j.digest, { total: Number(j.total) || 0, done: Number(j.completed) || 0 });
        let tot = 0, done = 0; for (const l of layers.values()) { tot += l.total; done += Math.min(l.done, l.total); }
        cur.text = String(j.status || cur.text || '').slice(0, 80); cur.total = tot; cur.done = done; cur.pct = tot ? Math.min(99, Math.floor(100 * done / tot)) : cur.pct;
        if (j.status === 'success') ok = true;
      };
      for (;;) {
        const { value, done } = await reader.read();
        arm();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i; while ((i = buf.indexOf('\n')) >= 0) { const s = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (s) line(s); }
        if (this.st.state !== 'run' || gen !== this.gen) { try { await reader.cancel(); } catch (e) { /* закрыт */ } return; }
      }
      if (buf.trim()) line(buf.trim());
      if (gen !== this.gen || this.st.state !== 'run') return;
      this._end(gen, ok ? { state: 'ok', model } : { state: 'error', model, err: 'cut', msg: '' });
    } catch (e) {
      if (gen !== this.gen) return;
      fail(e && e.name === 'AbortError' ? 'timeout' : 'network', '');
    } finally { clearTimeout(timer); if (gen === this.gen) this.ac = null; }
  }
}

module.exports = { OllamaHost, NAME_RE };

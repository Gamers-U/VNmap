'use strict';
/* ====== ИИ-помощник: ядро ======
   Поставщики (Gemini, GPT-подобные, Claude, локальные), хранение настроек, один транспорт и три «адаптера» (как говорить с каждым).
   Настольная программа: запросы и ключи живут в оболочке (desktop/ai.js), страница шлёт путь, заголовки и тело, а на месте ключа метку {{KEY}}.
   Веб-версия: те же запросы идут из браузера напрямую, ключ лежит в этом браузере (локальное хранилище, отдельно от проекта).
   Что ИИ делает с кодом и как он «применяет» ответ, решает окно помощника (следующий шаг); здесь только связь. */

const AID = DESK && DESK.ai ? DESK.ai : null;
function aiSupport() { return AID ? 'desktop' : DESK ? 'oldshell' : 'web'; }
const LS_AI = 'vnmap.ai.v1', AI_KEY = '{{KEY}}', AI_PING = 'Ответь одним словом: ок';

/** lvl: 1 просто (регистрация и ключ), 2 средне (баланс или установка), 3 сложнее. tag: free (есть бесплатный уровень) | paid | local.
    pref — какие модели предпочесть по умолчанию, skip — какие не показывать (не чат: речь, картинки, векторы…). Цены в программу не вписаны: они меняются. */
const AI_PROV = [
  { id: 'gemini', kind: 'gemini', lvl: 1, tag: 'free', base: 'https://generativelanguage.googleapis.com/v1beta', keyUrl: 'https://aistudio.google.com/apikey', site: 'https://ai.google.dev/gemini-api/docs/pricing', pref: /flash/i, skip: /lite|image|tts|embed|live|audio|aqa|vision|imagen|veo|robotics|computer|learnlm|gemma|native/i },
  { id: 'groq', kind: 'openai', lvl: 1, tag: 'free', base: 'https://api.groq.com/openai/v1', keyUrl: 'https://console.groq.com/keys', site: 'https://console.groq.com/docs/rate-limits', pref: /coder|qwen|gpt-oss|70b/i, skip: /whisper|guard|tts|playai|distil|embed|orpheus/i },
  { id: 'openrouter', kind: 'openai', lvl: 2, tag: 'free', base: 'https://openrouter.ai/api/v1', keyUrl: 'https://openrouter.ai/keys', site: 'https://openrouter.ai/docs/api/reference/limits', pref: /:free$/i, skip: /embed|image|audio|tts|whisper|moderation/i, maxKey: 'max_tokens' },
  { id: 'deepseek', kind: 'openai', lvl: 2, tag: 'paid', base: 'https://api.deepseek.com', keyUrl: 'https://platform.deepseek.com/api_keys', site: 'https://api-docs.deepseek.com/quick_start/pricing', pref: /flash|chat/i, skip: /vision|embed/i },
  { id: 'openai', kind: 'openai', lvl: 2, tag: 'paid', base: 'https://api.openai.com/v1', keyUrl: 'https://platform.openai.com/api-keys', site: 'https://platform.openai.com/docs/pricing', pref: /mini/i, skip: /embed|whisper|tts|dall|image|audio|realtime|transcribe|moderation|search|computer|davinci|babbage|instruct|sora/i, maxKey: 'max_completion_tokens' },
  { id: 'anthropic', kind: 'anthropic', lvl: 2, tag: 'paid', base: 'https://api.anthropic.com/v1', keyUrl: 'https://console.anthropic.com/settings/keys', site: 'https://docs.anthropic.com/en/docs/about-claude/pricing', pref: /sonnet/i, skip: /^$/ },
  { id: 'ollama', kind: 'openai', lvl: 3, tag: 'local', own: true, base: 'http://localhost:11434/v1', site: 'https://ollama.com/download', siteKey: 'ai.open.install', pref: /coder/i, skip: /embed|nomic|bge|minilm/i },
  { id: 'lmstudio', kind: 'openai', lvl: 2, tag: 'local', own: true, base: 'http://localhost:1234/v1', site: 'https://lmstudio.ai/download', siteKey: 'ai.open.install', pref: /coder/i, skip: /embed|nomic|bge|minilm/i },
  { id: 'custom', kind: 'openai', lvl: 3, tag: 'paid', own: true, base: '', keyOptional: true, site: '', pref: null, skip: /embed|whisper|tts/i },
];
const aiProv = id => AI_PROV.find(p => p.id === id) || null;
const aiIsLocal = p => !!p && p.tag === 'local';

/* ---------- настройки (не секреты): выбранный поставщик и модели. Ключи и адреса в программе живут в оболочке, в браузере здесь же ---------- */
let AI_CFG = null;
const AIS = { st: null, models: {}, test: {} };           // st — состояние из оболочки; models — найденные списки; test — последний результат проверки
function aiCfg() {
  if (AI_CFG) return AI_CFG;
  let j = {}; try { j = JSON.parse(lsGet(LS_AI) || '{}') || {}; } catch (e) { j = {}; }
  const o = x => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  AI_CFG = { prov: aiProv(j.prov) ? j.prov : '', model: o(j.model), bases: o(j.bases), keys: o(j.keys) };
  return AI_CFG;
}
function aiSave() {
  const c = aiCfg();
  lsSet(LS_AI, JSON.stringify({ prov: c.prov, model: c.model, bases: AID ? {} : c.bases, keys: AID ? {} : c.keys }));   // в программе ключей и адресов в хранилище страницы нет
}
async function aiRefresh() {
  if (!AID) return null;
  try { AIS.st = await AID.status(); } catch (e) { AIS.st = null; }
  return AIS.st;
}
const aiHasKey = id => (AID ? !!(AIS.st && AIS.st.keys && AIS.st.keys[id]) : !!aiCfg().keys[id]);
function aiBase(id) {
  const p = aiProv(id); if (!p) return '';
  if (!p.own) return p.base;
  return (AID ? AIS.st && AIS.st.bases && AIS.st.bases[id] : aiCfg().bases[id]) || p.base;
}
const aiModel = id => String(aiCfg().model[id] || '');
function aiSetModel(id, m) { const c = aiCfg(); if (m) c.model[id] = String(m).trim(); else delete c.model[id]; aiSave(); }
function aiSetProv(id) { const c = aiCfg(); c.prov = aiProv(id) ? id : ''; aiSave(); }
/** Можно ли прямо сейчас писать выбранному поставщику (выбран, есть ключ или он не нужен, есть адрес и модель). */
function aiReady() {
  const c = aiCfg(), p = aiProv(c.prov); if (!p) return false;
  if (aiSupport() === 'oldshell') return false;
  if (!p.own && !aiHasKey(p.id)) return false;
  return !!aiBase(p.id) && !!aiModel(p.id);
}

/* ---------- адрес и ключ ---------- */
const aiErr = (code, o) => Object.assign(new Error('ai:' + code), { aiCode: code }, o);
function aiLocalHost(h) {
  h = String(h || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return false;
  if (h === 'localhost' || h === '::1' || h.endsWith('.localhost') || h.endsWith('.local') || (!h.includes('.') && !h.includes(':'))) return true;
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (m) { const a = +m[1], b = +m[2]; return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254); }
  return /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h);
}
/** Адрес без хвостового «/» («» значит «сбросить»). Те же правила, что в оболочке: http только для своего компьютера и домашней сети. */
function aiCleanBase(url) {
  url = String(url || '').trim(); if (!url) return '';
  let u; try { u = new URL(url); } catch (e) { throw aiErr('badbase'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw aiErr('badbase');
  if (u.username || u.password || u.search || u.hash) throw aiErr('badbase');
  if (u.protocol === 'http:' && !aiLocalHost(u.hostname)) throw aiErr('insecure');
  return (u.origin + u.pathname).replace(/\/+$/, '');
}
const AI_KEY_RE = /^[\x21-\x7e]{8,400}$/;
async function aiSetKey(id, key) {
  const p = aiProv(id); if (!p) throw aiErr('badprov');
  key = String(key || '').trim();
  if (!AI_KEY_RE.test(key)) throw aiErr('badkeyfmt');
  if (AID) { const r = await AID.setKey(id, key); if (!r || !r.ok) throw aiErr((r && r.code) || 'fail'); AIS.st = r.st; }
  else { aiCfg().keys[id] = key; aiSave(); }
}
async function aiClearKey(id) {
  if (!aiProv(id)) throw aiErr('badprov');
  if (AID) { const r = await AID.clearKey(id); if (!r || !r.ok) throw aiErr((r && r.code) || 'fail'); AIS.st = r.st; }
  else { delete aiCfg().keys[id]; aiSave(); }
  delete AIS.models[id]; delete AIS.test[id];
}
async function aiSetBase(id, url) {
  const p = aiProv(id); if (!p || !p.own) throw aiErr('badprov');
  const b = aiCleanBase(url);
  if (AID) { const r = await AID.setBase(id, b); if (!r || !r.ok) throw aiErr((r && r.code) || 'fail'); AIS.st = r.st; }
  else { const c = aiCfg(); if (b && b !== p.base) c.bases[id] = b; else delete c.bases[id]; aiSave(); }
  delete AIS.models[id]; delete AIS.test[id];
}

/* ---------- транспорт ---------- */
let AI_SEQ = 0, AI_SUBD = false;
const AI_RUN = new Map();                                  // id запроса → обработчик событий оболочки
function aiSubscribe() {
  if (AI_SUBD || !AID) return; AI_SUBD = true;
  AID.onEvent(ev => { const f = ev && AI_RUN.get(ev.id); if (f) f(ev); });
}
/** Один запрос: { method, path, headers, body } → { status, text (только при ошибке HTTP), err ('' или код), msg }. Куски успешного ответа идут в onChunk. */
function aiTransport(provId, req, o = {}) {
  const sig = o.signal;
  if (sig && sig.aborted) return Promise.resolve({ status: 0, aborted: true });
  if (AID) {
    aiSubscribe();
    return new Promise(resolve => {
      const id = 'q' + Date.now().toString(36) + (++AI_SEQ);
      let status = 0, done = false;
      const fin = r => { if (done) return; done = true; AI_RUN.delete(id); if (sig) sig.removeEventListener('abort', onAbort); resolve(r); };
      const onAbort = () => { AID.abort(id).catch(() => { }); };
      AI_RUN.set(id, ev => {
        if (ev.type === 'head') status = ev.status;
        else if (ev.type === 'chunk') { if (o.onChunk) o.onChunk(ev.text); }
        else if (ev.type === 'end') fin(ev.aborted ? { status, aborted: true } : { status: ev.status, text: ev.text || '' });
        else if (ev.type === 'error') fin({ status, err: ev.code || 'network', msg: ev.msg || '' });
      });
      if (sig) sig.addEventListener('abort', onAbort, { once: true });
      AID.request({ id, provider: provId, method: req.method, path: req.path, headers: req.headers, body: req.body }).then(r => {
        if (!r || !r.ok) fin({ status: 0, err: (r && r.code) || 'fail' });
      }).catch(e => fin({ status: 0, err: 'fail', msg: deskErr(e) }));
    });
  }
  return aiWebFetch(provId, req, o);
}
async function aiWebFetch(provId, req, o) {
  const p = aiProv(provId), base = aiBase(provId), key = aiCfg().keys[provId] || '';
  if (!base) return { status: 0, err: 'nobase' };
  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (v.includes(AI_KEY)) { if (!key) { if (p.keyOptional || p.own) continue; return { status: 0, err: 'nokey' }; } headers[k] = v.split(AI_KEY).join(key); }
    else headers[k] = v;
  }
  const ac = new AbortController(); let why = '', timer = null;
  const arm = ms => { clearTimeout(timer); timer = setTimeout(() => { why = 'timeout'; ac.abort(); }, ms); };
  const onAbort = () => { why = 'user'; ac.abort(); };
  if (o.signal) o.signal.addEventListener('abort', onAbort, { once: true });
  try {
    arm(60000);
    const res = await fetch(base + req.path, { method: req.method, headers, body: req.method === 'POST' ? req.body : undefined, signal: ac.signal, redirect: 'error', credentials: 'omit', referrerPolicy: 'no-referrer' });
    arm(90000);
    if (!res.ok) return { status: res.status, text: (await res.text()).slice(0, 20000) };
    if (res.body && res.body.getReader) {
      const rd = res.body.getReader(), dec = new TextDecoder('utf-8'); let total = 0;
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        arm(90000); total += value.length;
        if (total > 16 * 1048576) { why = 'toobig'; ac.abort(); break; }
        const s = dec.decode(value, { stream: true }); if (s && o.onChunk) o.onChunk(s);
      }
      const tail = dec.decode(); if (tail && o.onChunk) o.onChunk(tail);
    } else { const s = await res.text(); if (s && o.onChunk) o.onChunk(s); }
    if (why === 'toobig') return { status: res.status, err: 'toobig' };
    return { status: res.status, text: '' };
  } catch (e) {
    if (why === 'user') return { status: 0, aborted: true };
    if (why === 'timeout') return { status: 0, err: 'timeout' };
    if (why === 'toobig') return { status: 0, err: 'toobig' };
    return { status: 0, err: 'netweb', msg: String((e && e.message) || '') };
  } finally { clearTimeout(timer); if (o.signal) o.signal.removeEventListener('abort', onAbort); }
}

/* ---------- как говорить с каждым видом поставщиков ---------- */
const AI_JSON = { 'content-type': 'application/json' };
function aiListReq(p) {
  if (p.kind === 'gemini') return { method: 'GET', path: '/models?pageSize=200', headers: { 'x-goog-api-key': AI_KEY } };
  if (p.kind === 'anthropic') return { method: 'GET', path: '/models?limit=100', headers: { 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } };
  return { method: 'GET', path: '/models', headers: { Authorization: 'Bearer ' + AI_KEY } };
}
/** Имена моделей из ответа «список моделей» (только пригодные для разговора). */
function aiParseModels(p, text) {
  let j; try { j = JSON.parse(text); } catch (e) { return null; }
  let ids = [];
  if (p.kind === 'gemini') ids = (j.models || []).filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')).map(m => String(m.name || '').replace(/^models\//, ''));
  else if (Array.isArray(j.data)) ids = j.data.map(m => String(m && m.id || ''));
  else if (Array.isArray(j.models)) ids = j.models.map(m => String(m && (m.id || m.name) || ''));
  else if (Array.isArray(j)) ids = j.map(m => String(m && (m.id || m.name) || ''));
  else return null;
  ids = ids.filter(x => x && !(p.skip && p.skip.test(x)));
  ids = [...new Set(ids)];
  if (p.id === 'openrouter') ids.sort((a, b) => (/:free$/.test(b) ? 1 : 0) - (/:free$/.test(a) ? 1 : 0) || a.localeCompare(b));
  else ids.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  return ids;
}
/** Какую модель взять, если человек ещё не выбрал: подходящую по смыслу, из устойчивых (не preview/exp), самую новую по номеру. */
function aiPickModel(p, list) {
  if (!list || !list.length) return '';
  const hit = p.pref ? list.filter(x => p.pref.test(x)) : [];
  const pool = hit.length ? hit : list;
  const stable = pool.filter(x => !/preview|exp|beta|latest|\d{4}-\d{2}-\d{2}|-\d{4,}$/i.test(x));
  const use = stable.length ? stable : pool;
  if (p.id === 'openrouter') return use[0];
  return use.slice().sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))[0];
}
/** Запрос на разговор. msgs: [{role:'user'|'assistant', content}] без системного: он отдельно. */
function aiChatReq(p, o) {
  const model = String(o.model || ''), system = String(o.system || ''), msgs = (o.messages || []).filter(m => m && m.content);
  if (p.kind === 'gemini') {
    const body = { contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content) }] })) };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    if (o.maxTokens) body.generationConfig = { maxOutputTokens: o.maxTokens };
    return { method: 'POST', path: '/models/' + encodeURIComponent(model) + ':streamGenerateContent?alt=sse', headers: Object.assign({ 'x-goog-api-key': AI_KEY }, AI_JSON), body: JSON.stringify(body) };
  }
  if (p.kind === 'anthropic') {
    const body = { model, max_tokens: o.maxTokens || 4096, stream: true, messages: msgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) })) };
    if (system) body.system = system;
    return { method: 'POST', path: '/messages', headers: Object.assign({ 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, AI_JSON), body: JSON.stringify(body) };
  }
  const body = { model, stream: true, messages: (system ? [{ role: 'system', content: system }] : []).concat(msgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) }))) };
  if (o.maxTokens) body[p.maxKey || 'max_tokens'] = o.maxTokens;
  return { method: 'POST', path: '/chat/completions', headers: Object.assign({ Authorization: 'Bearer ' + AI_KEY }, AI_JSON), body: JSON.stringify(body) };
}
/** Разбор потока «событий сервера» (SSE): отдаёт каждое событие целиком. */
function aiSse(onEvent) {
  let buf = '', hold = '';                      // hold: «\r» в конце куска (может оказаться началом «\r\n» в следующем)
  const one = block => {
    let ev = '', data = [];
    for (const ln of block.split('\n')) {
      if (ln.startsWith('data:')) data.push(ln.slice(5).replace(/^ /, ''));
      else if (ln.startsWith('event:')) ev = ln.slice(6).trim();
    }
    if (data.length) onEvent(ev, data.join('\n'));
  };
  return {
    feed(s) {
      s = hold + s; hold = '';
      if (s.endsWith('\r')) { hold = '\r'; s = s.slice(0, -1); }
      buf += s.replace(/\r\n?/g, '\n'); let i;
      while ((i = buf.indexOf('\n\n')) >= 0) { one(buf.slice(0, i)); buf = buf.slice(i + 2); }
    },
    end() { buf += hold ? '\n' : ''; hold = ''; if (buf.trim()) one(buf); buf = ''; },
  };
}
/** Что делать с одним событием потока: { text } — кусок ответа, { err } — поставщик прислал ошибку, { done }. */
function aiDelta(p, ev, data) {
  if (data === '[DONE]') return { done: true };
  let j; try { j = JSON.parse(data); } catch (e) { return null; }
  if (!j || typeof j !== 'object') return null;
  if (j.error) return { err: aiBodyMsg(JSON.stringify(j)) || 'error' };
  if (p.kind === 'gemini') {
    const c = j.candidates && j.candidates[0], parts = c && c.content && c.content.parts;
    const text = Array.isArray(parts) ? parts.filter(x => x && typeof x.text === 'string' && !x.thought).map(x => x.text).join('') : '';
    if (j.promptFeedback && j.promptFeedback.blockReason) return { blocked: String(j.promptFeedback.blockReason) };
    if (c && !text && /SAFETY|RECITATION|PROHIBITED|BLOCK/i.test(String(c.finishReason || ''))) return { blocked: String(c.finishReason) };
    return text ? { text } : null;
  }
  if (p.kind === 'anthropic') {
    if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') return { text: String(j.delta.text || '') };
    if (j.type === 'message_stop') return { done: true };
    return null;
  }
  const ch = j.choices && j.choices[0], d = ch && ch.delta;
  if (d && typeof d.content === 'string' && d.content) return { text: d.content };
  return null;
}
/** Сообщение об ошибке из тела ответа поставщика (у каждого своя форма). */
function aiBodyMsg(text) {
  text = String(text || '').trim(); if (!text) return '';
  try {
    let j = JSON.parse(text); if (Array.isArray(j)) j = j[0];
    const e = j && (j.error !== undefined ? j.error : j);
    const m = typeof e === 'string' ? e : e && (e.message || e.msg || (e.error && e.error.message) || e.detail || (typeof e.error === 'string' && e.error));
    if (m) return String(m).replace(/\s+/g, ' ').slice(0, 240);
  } catch (x) { /* не JSON */ }
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}
/** Ошибка поставщика → { code, status, msg }: по коду страница подберёт понятный текст. */
function aiClassify(p, r) {
  const st = r.status || 0, body = aiBodyMsg(r.text);
  if (r.err) {
    if (r.err === 'network') {
      const m = String(r.msg || '');
      if (aiIsLocal(p) || p.own) return { code: 'refused', status: 0, msg: m };
      return { code: 'network', status: 0, msg: m };
    }
    return { code: r.err, status: 0, msg: r.msg || '' };
  }
  const code = st === 401 || st === 403 ? 'badkey' : st === 402 ? 'money' : st === 404 ? 'notfound' : st === 429 ? 'quota' : st >= 500 ? 'server' : st === 400 || st === 422 ? 'badreq' : 'http';
  if (code === 'badreq' && /api key|API_KEY|invalid.*key|permission|unauthor/i.test(body)) return { code: 'badkey', status: st, msg: body };
  return { code, status: st, msg: body };
}

/* ---------- публичные действия ---------- */
function aiGuard(p) {
  if (!p) return aiErr('badprov');
  if (aiSupport() === 'oldshell') return aiErr('oldshell');
  if (!p.own && !aiHasKey(p.id)) return aiErr('nokey');
  if (!aiBase(p.id)) return aiErr('nobase');
  return null;
}
/** Список моделей поставщика: { ok, models } или { ok:false, err:{code,status,msg} }. */
async function aiListModels(id, o = {}) {
  const p = aiProv(id), g = aiGuard(p);
  if (g) return { ok: false, err: { code: g.aiCode, status: 0, msg: '' } };
  let text = '';
  const r = await aiTransport(id, aiListReq(p), { signal: o.signal, onChunk: s => { text += s; } });
  if (r.aborted) return { ok: false, err: { code: 'aborted', status: 0, msg: '' } };
  if (r.err || !(r.status >= 200 && r.status < 300)) return { ok: false, err: aiClassify(p, r) };
  const models = aiParseModels(p, text);
  if (!models) return { ok: false, err: { code: 'badreply', status: r.status, msg: '' } };
  AIS.models[id] = models;
  return { ok: true, models };
}
/** Разговор с моделью. o: { provider, model, system, messages, maxTokens, signal, onDelta(кусок, всё) } → { ok, text } или { ok:false, err, text (что успело прийти) }. */
async function aiChat(o) {
  const p = aiProv(o.provider), g = aiGuard(p);
  if (g) return { ok: false, err: { code: g.aiCode, status: 0, msg: '' }, text: '' };
  const model = String(o.model || aiModel(p.id) || '').trim();
  if (!model) return { ok: false, err: { code: 'nomodel', status: 0, msg: '' }, text: '' };
  let full = '', fail = null, blocked = '';
  const sse = aiSse((ev, data) => {
    const d = aiDelta(p, ev, data); if (!d) return;
    if (d.err) fail = fail || { code: 'badreq', status: 0, msg: d.err };
    else if (d.blocked) blocked = d.blocked;
    else if (d.text) { full += d.text; if (o.onDelta) { try { o.onDelta(d.text, full); } catch (e) { console.error(e); } } }
  });
  const r = await aiTransport(p.id, aiChatReq(p, Object.assign({}, o, { model })), { signal: o.signal, onChunk: s => sse.feed(s) });
  sse.end();
  if (r.aborted) return { ok: false, aborted: true, err: { code: 'aborted', status: 0, msg: '' }, text: full };
  if (r.err || !(r.status >= 200 && r.status < 300)) return { ok: false, err: aiClassify(p, r), text: full };
  if (fail) return { ok: false, err: fail, text: full };
  if (!full.trim()) return { ok: false, err: { code: blocked ? 'blocked' : 'empty', status: 0, msg: blocked }, text: full };
  return { ok: true, text: full };
}
/** «Проверить связь»: список моделей (заодно проверяет ключ), потом короткий настоящий вопрос тем же путём, каким пойдёт работа. */
async function aiTest(id, o = {}) {
  const p = aiProv(id), g = aiGuard(p);
  if (g) return { ok: false, err: { code: g.aiCode, status: 0, msg: '' } };
  const L = await aiListModels(id, o);
  let models = L.ok ? L.models : null;
  if (!L.ok && !['notfound', 'badreply'].includes(L.err.code)) return { ok: false, err: L.err };        // у «своего» сервиса списка может не быть: тогда пробуем сразу вопрос
  let model = aiModel(id);
  if (!model && models) { model = aiPickModel(p, models); if (model) aiSetModel(id, model); }
  if (!model) return { ok: false, err: { code: 'nomodel', status: 0, msg: '' }, models };
  const r = await aiChat({ provider: id, model, system: '', messages: [{ role: 'user', content: AI_PING }], signal: o.signal });
  if (!r.ok) return { ok: false, err: r.err, models, model };
  return { ok: true, models, model, reply: r.text.trim().slice(0, 80) };
}

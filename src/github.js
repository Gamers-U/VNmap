'use strict';
/* ====== GitHub: проект как файл в репозитории (настольная версия и браузер) ======
   В репозитории лежит один файл проекта (без положения карты на экране и без картинок и звуков). Каждая отправка — отдельная запись
   в истории GitHub: видно, кто и когда менял, и можно вернуться к любой версии.
   Правки двух людей склеиваются тем же способом, что и на Google Диске: «основа → моё → в репозитории».
   Запросы к GitHub в настольной версии делает оболочка (окно программы само в сеть не ходит) и она же хранит токен.
   В браузере запросы идут напрямую, токен хранится в браузере. */
const GHD = DESK && DESK.gh ? DESK.gh : null;
const LS_GH = 'vnmap.github.v1', LS_GHT = 'vnmap.gh.token', LS_GHL = 'vnmap.gh.login';
const GHTIME = { push: 20000, gap: 45000, poll: 60000 };      // тишина перед отправкой, минимум между отправками, опрос репозитория (мс)
const GHS = { st: { hasToken: false, login: '', encrypted: true }, phase: 'idle', err: '', progress: '', queue: Promise.resolve(), kick: false, timer: null, poll: null, retry: null, retryN: 0,
  applying: false, lastEdit: 0, remote: null, panel: null, dirtyFlag: false, newerN: 0, newerT: null };
let GM = { projects: {} };

function gmLoad() {
  let j = null; try { j = JSON.parse(lsGet(LS_GH) || 'null'); } catch (e) { j = null; }
  GM = Object.assign({ projects: {} }, j && typeof j === 'object' ? j : {});
  if (!GM.projects || typeof GM.projects !== 'object') GM.projects = {};
}
const gmSave = () => lsSet(LS_GH, JSON.stringify(GM));
const gmeta = () => (P && P.uid && GM.projects[P.uid]) || null;
const ghOn = () => { const m = gmeta(); return !!(m && m.on); };

/* ---------- ошибки ---------- */
const ghFail = (code, msg) => new Error('gh:' + code + ':' + msg);
function ghErrInfo(e) {
  const m = /gh:([a-z_]+):([\s\S]*)$/.exec(String((e && e.message) || e));
  return m ? { code: m[1], msg: m[2].trim() } : { code: 'unknown', msg: deskErr(e) };
}
const ghParse = s => { try { return JSON.parse(s); } catch (e) { return null; } };
function ghStatusErr(r) {
  const j = ghParse(r.text), msg = (j && j.message) || '';
  if (r.status === 401) return ghFail('auth', t('gh.err.auth'));
  if (r.status === 403 || r.status === 429) return /rate limit/i.test(msg) || r.remaining === '0' ? ghFail('rate', t('gh.err.rate')) : ghFail('forbidden', t('gh.err.forbidden'));
  if (r.status === 404) return ghFail('not_found', t('gh.err.notfound'));
  if (r.status === 409 || r.status === 422) return ghFail('conflict', msg || 'conflict');
  return ghFail('server', t('gh.err.server', r.status));
}

/* ---------- запросы ---------- */
async function ghReq(method, path, o = {}) {
  if (GHD) return GHD.request({ method, path, body: o.body, raw: !!o.raw, etag: o.etag || '' });
  const tok = lsGet(LS_GHT);
  const headers = { Accept: o.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (tok) headers.Authorization = 'Bearer ' + tok;
  if (o.etag) headers['If-None-Match'] = o.etag;
  let body; if (o.body != null) { body = typeof o.body === 'string' ? o.body : JSON.stringify(o.body); headers['Content-Type'] = 'application/json'; }
  let res; try { res = await fetch('https://api.github.com' + path, { method, headers, body, cache: 'no-store' }); } catch (e) { throw ghFail('network', t('gh.err.net')); }
  return { status: res.status, etag: res.headers.get('etag') || '', remaining: res.headers.get('x-ratelimit-remaining') || '', text: await res.text() };
}
const ghEnc = s => encodeURIComponent(s).replace(/%2F/g, '/');
const ghFilePath = m => '/repos/' + m.repo + '/contents/' + ghEnc(m.path);
function ghB64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
function ghUnb64(b64) { const bin = atob(String(b64).replace(/\s+/g, '')), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function ghRepoNorm(x) {
  const m = /^(?:https?:\/\/github\.com\/)?([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([\w.-]{1,100}?)(?:\.git)?\/?$/.exec(String(x || '').trim());
  return m ? m[1] + '/' + m[2] : '';
}
function ghPathNorm(x) {
  const p = String(x || '').trim().replace(/^\/+/, '');
  return p && p.length <= 200 && !/\.\.|[\x00-\x1f\\]/.test(p) && !p.endsWith('/') ? p : '';
}
const ghDefaultPath = () => (String(slug(P.name) || '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'project') + '.vnmap.json';
const ghOpenUrl = u => { if (DESK && DESK.openExternal) DESK.openExternal(u).catch(() => { }); else window.open(u, '_blank', 'noopener'); };
const ghWebUrl = m => 'https://github.com/' + m.repo + '/blob/' + (m.branch || 'HEAD') + '/' + ghEnc(m.path);

/** Файл проекта в репозитории. {same} — не менялся с прошлого запроса (по ETag), {exists:false} — файла нет. */
async function ghGetFile(m, { ref, etag } = {}) {
  const br = ref || m.branch, q = br ? '?ref=' + encodeURIComponent(br) : '';
  const r = await ghReq('GET', ghFilePath(m) + q, { etag: ref ? '' : etag });
  if (r.status === 304) return { same: true };
  if (r.status === 404) return { exists: false };
  if (r.status !== 200) throw ghStatusErr(r);
  const j = ghParse(r.text);
  if (!j || Array.isArray(j) || j.type !== 'file') throw ghFail('bad_file', t('gh.err.notfile'));
  let text;
  if (j.encoding === 'base64' && j.content) text = dDec.decode(ghUnb64(j.content));
  else { const rr = await ghReq('GET', ghFilePath(m) + q, { raw: true }); if (rr.status !== 200) throw ghStatusErr(rr); text = rr.text; }   // файл больше 1 МБ: GitHub отдаёт его только «сырым»
  return { exists: true, sha: j.sha, size: j.size, text, etag: r.etag };
}
async function ghPutFile(m, text, message, sha) {
  const body = { message, content: ghB64(dEnc.encode(text)) };
  if (sha) body.sha = sha;
  if (m.branch) body.branch = m.branch;
  const r = await ghReq('PUT', ghFilePath(m), { body });
  if (r.status === 200 || r.status === 201) { const j = ghParse(r.text) || {}; return { sha: (j.content && j.content.sha) || '' }; }
  throw ghStatusErr(r);
}
async function ghHistory(m) {
  const r = await ghReq('GET', '/repos/' + m.repo + '/commits?path=' + ghEnc(m.path) + (m.branch ? '&sha=' + encodeURIComponent(m.branch) : '') + '&per_page=30');
  if (r.status !== 200) throw ghStatusErr(r);
  return (ghParse(r.text) || []).map(c => ({ sha: c.sha, msg: String((c.commit && c.commit.message) || '').split('\n')[0], date: c.commit && c.commit.author && c.commit.author.date, who: (c.author && c.author.login) || (c.commit && c.commit.author && c.commit.author.name) || '' }));
}

/* ---------- доступ (токен) ---------- */
async function ghRefreshStatus() {
  try { GHS.st = GHD ? await GHD.status() : { hasToken: !!lsGet(LS_GHT), login: lsGet(LS_GHL) || '', encrypted: false }; }
  catch (e) { GHS.st = { hasToken: false, login: '', encrypted: true }; }
}
async function ghSetToken(tok) {
  tok = String(tok || '').trim();
  if (GHD) { await GHD.setToken(tok); await ghRefreshStatus(); return; }
  if (!/^[\w-]{20,255}$/.test(tok)) throw ghFail('auth', t('gh.err.token'));
  const prev = lsGet(LS_GHT); lsSet(LS_GHT, tok);
  try {
    const r = await ghReq('GET', '/user');
    if (r.status !== 200) throw ghStatusErr(r);
    lsSet(LS_GHL, String((ghParse(r.text) || {}).login || ''));
  } catch (e) { lsSet(LS_GHT, prev || ''); throw e; }
  await ghRefreshStatus();
}
async function ghClearToken() {
  if (GHD) await GHD.clearToken(); else { lsSet(LS_GHT, ''); lsSet(LS_GHL, ''); }
  await ghRefreshStatus(); clearTimeout(GHS.timer); clearTimeout(GHS.retry); ghSetPhase('idle');
}

/* ---------- состояние для плашки и окна ---------- */
function ghState() {
  const m = gmeta(); if (!m || !m.on) return 'off';
  if (!GHS.st.hasToken) return 'nosign';
  if (GHS.phase !== 'idle') return GHS.phase;
  return GHS.dirtyFlag ? 'pending' : 'ok';
}
function ghSetPhase(ph, err) { GHS.phase = ph; GHS.err = err || ''; if (ph !== 'syncing') GHS.progress = ''; ghRefreshUI(); }
function ghRefreshUI() {
  if (typeof updateStatus === 'function') updateStatus();
  const pn = GHS.panel;
  if (pn && !pn.m.closed) {
    if (pn.stale && GHS.phase !== 'syncing') { pn.stale = false; pn.hist = null; renderGhPanel(pn); }
    else renderGhStatus(pn);
  }
}

/* ---------- очередь: одна операция за раз ---------- */
function ghRun(fn) { const job = GHS.queue.then(fn); GHS.queue = job.catch(() => { }); return job; }
function ghKick() { if (GHS.kick) return; GHS.kick = true; ghRun(async () => { GHS.kick = false; await ghCycle(); }); }
function ghFailed(e) {
  const g = ghErrInfo(e);
  if (g.code === 'auth') { ghRefreshStatus().then(() => { GHS.st.hasToken = false; ghSetPhase('auth', g.msg); }); }
  else if (g.code === 'network') { ghSetPhase('offline', g.msg); ghScheduleRetry(); }
  else if (g.code === 'rate') { ghSetPhase('error', g.msg); ghScheduleRetry(300000); }
  else if (g.code === 'forbidden' || g.code === 'not_found' || g.code === 'bad_file') ghSetPhase('error', g.msg);
  else { ghSetPhase('error', g.msg); ghScheduleRetry(); }
}
function ghScheduleRetry(min) {
  clearTimeout(GHS.retry);
  const d = Math.max(min || 0, Math.min(300000, 30000 * 2 ** Math.min(GHS.retryN++, 5)));
  GHS.retry = setTimeout(() => ghKick(), d);
}
/** Вызывается при каждом изменении проекта (из scheduleSave). */
function ghDirty() {
  if (GHS.applying) return;
  GHS.lastEdit = Date.now();
  const m = gmeta(); if (!m || !m.on || !GHS.st.hasToken) return;
  clearTimeout(GHS.timer);
  const fire = () => {
    if (gmeta() !== m) return;
    const wait = GHTIME.gap - (Date.now() - (m.lastPush || 0));
    if (wait > 0) { GHS.timer = setTimeout(fire, wait); return; }
    const changed = strHash(contentJSON()) !== m.sigHash;
    GHS.dirtyFlag = changed; ghRefreshUI();
    if (changed && GHS.phase !== 'conflict') ghKick();
  };
  GHS.timer = setTimeout(fire, GHTIME.push);
}
const ghCanAutoApply = () => !MODALS.length && Date.now() - GHS.lastEdit > 8000;

/* ---------- отправка и получение ---------- */
async function ghMessage(ents) {
  let n = 0;
  try { const B = await baseLoad('gbase_' + P.uid); if (B) { const d = mgDiff(B, ents); n = d.set.length + d.del.length; } } catch (e) { /* без числа */ }
  return t('gh.commit', P.name) + (n ? ' · ' + t('gh.commit.n', n) : '');
}
async function ghPush(m, { sha } = {}) {
  const json = contentJSON(), ents = mgEntities(P), uid = P.uid;
  GHS.progress = t('gh.p.push'); ghRefreshUI();
  const res = await ghPutFile(m, json, await ghMessage(ents), sha === undefined ? m.sha : sha);
  m.sha = res.sha; m.etag = ''; m.sigHash = strHash(json); m.last = Date.now(); m.lastPush = Date.now(); m.name = P.name; m.on = true;
  GHS.dirtyFlag = false; gmSave();
  baseSave('gbase_' + uid, ents);                         // общая основа для следующего слияния
  if (GHS.panel) GHS.panel.stale = true;
}
async function ghApplyText(m, text, sha, etag, { fresh = false, restore = false } = {}) {
  GHS.applying = true;
  try {
    let p; try { p = JSON.parse(text); } catch (e) { throw ghFail('bad_file', t('gh.err.broken')); }
    if (!p || !Array.isArray(p.nodes)) throw ghFail('bad_file', t('gh.err.notproj'));
    const np = normalize(p), old = P.uid, same = np.uid === P.uid && !fresh;
    if (np.uid !== old) { const om = GM.projects[old]; if (om && om.repo === m.repo && om.path === m.path) delete GM.projects[old]; }
    m.on = true; m.sha = sha; m.etag = etag || ''; m.name = np.name; m.last = Date.now();
    m.sigHash = restore ? '' : strHash(contentOf(np));
    GM.projects[np.uid] = m; gmSave();
    if (same) { np.view = P.view; P = np; reindex(); UI.sel.clear(); UI.edge = null; resetHistory(); saveNow(); onProjectReplaced(); scheduleSave(); }
    else { setProject(np); fitAll(false); }
    GHS.dirtyFlag = restore;
    if (!restore) baseSave('gbase_' + np.uid, mgEntities(np));
  } finally { GHS.applying = false; }
}
/** Правки с двух сторон: сливаем «основа → моё → в репозитории» и отправляем результат. false — слить не удалось, решает человек. */
async function ghTryMerge(m, rem) {
  let B = await baseLoad('gbase_' + P.uid); if (!B) return false;
  const uid0 = P.uid; let got = 0;
  for (let round = 0; round < 3; round++) {
    GHS.progress = t('gh.p.merge'); ghRefreshUI();
    let np; try { np = normalize(JSON.parse(rem.text)); } catch (e) { return false; }
    if (!np || !Array.isArray(np.nodes) || np.uid !== P.uid || P.uid !== uid0) return false;
    const L = mgEntities(P), R = mgEntities(np), cf = [];
    const M = mgMergeMaps(B, L, R, cf);
    if (cf.some(c => !c.text)) return false;            // одно поле изменено по-разному: молча выбирать нельзя
    const inc = mgDiff(B, R); got += inc.set.length + inc.del.length;
    GHS.applying = true; try { if (!clSame(M, L)) clApplyMap(M, cf); } finally { GHS.applying = false; }
    m.sha = rem.sha; m.sigHash = ''; gmSave();
    try { await ghPush(m, { sha: rem.sha }); }
    catch (e) {                                          // пока мы сливали, в репозиторий успел записать третий: берём его версию и повторяем
      if (ghErrInfo(e).code !== 'conflict') throw e;
      const again = await ghGetFile(m); if (!again.exists) return false;
      rem = again; B = R; continue;
    }
    toast(t('gh.merged', got), 5000);
    return true;
  }
  return false;
}
const ghDone = () => { GHS.remote = null; GHS.retryN = 0; ghSetPhase('idle'); if (gmeta() && strHash(contentJSON()) !== gmeta().sigHash) { GHS.dirtyFlag = true; ghDirty(); } };

/* ---------- один круг синхронизации ---------- */
async function ghCycle({ manual = false } = {}) {
  const m = gmeta();
  if (!m || !m.on || !GHS.st.hasToken || GHS.applying) return;
  const uid0 = P.uid;
  try {
    ghSetPhase('syncing');
    const rem = await ghGetFile(m, { etag: manual ? '' : m.etag });
    if (P.uid !== uid0) return;
    const contentChanged = strHash(contentJSON()) !== m.sigHash;
    if (rem.same) {
      if (contentChanged) await ghPush(m); else { m.last = Date.now(); gmSave(); }          // без изменений новую запись в истории не делаем
      ghDone(); return;
    }
    if (!rem.exists) { await ghPush(m, { sha: null }); ghDone(); return; }         // файла ещё нет (или его удалили): создаём
    if (!m.sha) { GHS.remote = { rem, kind: 'exists' }; ghSetPhase('conflict'); if (manual) ghConflictDialog(); return; }
    if (rem.sha !== m.sha) {
      if (contentChanged) {
        if (await ghTryMerge(m, rem)) { ghDone(); return; }
        GHS.remote = { rem, kind: 'diverged' }; ghSetPhase('conflict'); if (manual) ghConflictDialog(); return;
      }
      GHS.remote = { rem, kind: 'newer' };
      if (manual || ghCanAutoApply()) { await ghApplyText(m, rem.text, rem.sha, rem.etag); toast(t('gh.pulled'), 4200); ghDone(); return; }
      ghSetPhase('newer');                                                          // идёт правка или открыто окно: подождём и применим сами
      clearTimeout(GHS.newerT);
      if ((GHS.newerN = (GHS.newerN || 0) + 1) <= 8) GHS.newerT = setTimeout(ghKick, Math.max(5000, 8500 - (Date.now() - GHS.lastEdit)));
      return;
    }
    m.etag = rem.etag || m.etag;
    if (contentChanged) await ghPush(m); else { m.last = Date.now(); gmSave(); }
    ghDone();
  } catch (e) {
    if (ghErrInfo(e).code === 'conflict') { ghSetPhase('idle'); setTimeout(ghKick, 700); return; }   // кто-то записал раньше нас: ещё один круг
    ghFailed(e);
  }
}
function ghProjectChanged() {
  clearTimeout(GHS.timer); clearTimeout(GHS.retry); clearTimeout(GHS.newerT); GHS.newerN = 0; GHS.remote = null; GHS.dirtyFlag = false; GHS.phase = 'idle'; GHS.err = '';
  if (GHS.panel && !GHS.panel.m.closed) { GHS.panel.hist = null; renderGhPanel(GHS.panel); }
  ghRefreshUI();
  const m = gmeta(); if (m && m.on && GHS.st.hasToken && !GHS.applying) setTimeout(ghKick, 600);
}
const ghSyncNow = () => ghRun(() => ghCycle({ manual: true }));

/* ---------- подключение проекта ---------- */
async function ghRepoCheck(repo) {
  const r = await ghReq('GET', '/repos/' + repo);
  if (r.status !== 200) throw ghStatusErr(r);
  const j = ghParse(r.text) || {};
  if (j.permissions && j.permissions.push === false) throw ghFail('forbidden', t('gh.err.readonly'));
  return { priv: !!j.private, branch: j.default_branch || '' };
}
function ghDraftMeta(d) {
  const repo = ghRepoNorm(d.repo), path = ghPathNorm(d.path) || ghDefaultPath();
  if (!repo) throw ghFail('bad_request', t('gh.err.repo'));
  return { repo, path, branch: String(d.branch || '').trim().slice(0, 100) };
}
async function ghConnect(d) {
  const meta = ghDraftMeta(d), info = await ghRepoCheck(meta.repo);
  if (!info.priv && !(await confirmDlg({ title: t('gh.pub.q'), text: t('gh.pub.t', meta.repo), ok: t('gh.pub.ok'), danger: true }))) return false;
  const m = Object.assign(GM.projects[P.uid] || {}, meta, { on: true, sha: '', etag: '', sigHash: '', lastPush: 0, name: P.name, priv: info.priv });
  GM.projects[P.uid] = m; gmSave(); ghRefreshUI();
  await ghRun(() => ghCycle({ manual: true }));
  return true;
}
/** Для второго человека: взять проект, который уже лежит в репозитории, и работать с ним. */
async function ghJoin(d) {
  const meta = ghDraftMeta(d), info = await ghRepoCheck(meta.repo);
  const m = Object.assign({}, meta, { on: true, sha: '', etag: '', sigHash: '', lastPush: 0, priv: info.priv });
  const rem = await ghGetFile(m);
  if (!rem.exists) throw ghFail('not_found', t('gh.err.nofile', meta.path));
  if (P.nodes.length && !(await confirmDlg({ title: t('gh.join.q'), text: t('gh.join.t'), ok: t('gh.join.ok'), danger: true }))) return false;
  await ghRun(async () => { await ghApplyText(m, rem.text, rem.sha, rem.etag, { fresh: true }); toast(t('gh.joined'), 4200); ghDone(); });
  return true;
}
function ghDisable() {
  const m = gmeta(); if (!m) return;
  m.on = false; gmSave(); clearTimeout(GHS.timer); clearTimeout(GHS.retry); GHS.remote = null; ghSetPhase('idle');
}

/* ---------- расхождение ---------- */
function ghConflictDialog() {
  const r = GHS.remote; if (!r || r.kind === 'newer') return;
  let rp = null; try { rp = JSON.parse(r.rem.text); } catch (e) { rp = null; }
  const other = rp && rp.uid && rp.uid !== P.uid;
  const title = r.kind === 'exists' ? t(other ? 'gh.c.other' : 'gh.c.exists') : t('gh.c.title');
  const text = r.kind === 'exists' ? t(other ? 'gh.c.other.t' : 'gh.c.exists.t', (rp && rp.name) || '—', rp && Array.isArray(rp.nodes) ? rp.nodes.length : 0) : t('gh.c.t');
  openModal({
    cls: 'dlg conflict-dlg', build: m => h('div', { class: 'dlg-body' },
      h('h3', title), h('p', text), h('p', { class: 'hint' }, t('gh.c.safe')),
      h('div', { class: 'dlg-col' },
        h('button', { class: 'btn primary', onclick: () => { m.close(); ghResolve('remote'); } }, icon('download', 16), t('gh.c.take')),
        h('button', { class: 'btn danger-fill', onclick: () => { m.close(); ghResolve('mine'); } }, icon('upload', 16), t('gh.c.mine')),
        h('button', { class: 'btn', onclick: () => exportJSON() }, icon('save', 16), t('gh.c.file')),
        h('button', { class: 'btn', onclick: () => m.close() }, t('drive.c.later'))))
  });
}
function ghResolve(choice) {
  const r = GHS.remote; if (!r) return Promise.resolve();
  return ghRun(async () => {
    const m = gmeta(); if (!m) return;
    try {
      ghSetPhase('syncing');
      if (choice === 'remote') {
        let other = false; try { const j = JSON.parse(r.rem.text); other = j && j.uid && j.uid !== P.uid; } catch (e) { other = false; }
        await ghApplyText(m, r.rem.text, r.rem.sha, r.rem.etag, { fresh: !!other }); toast(t('gh.pulled'), 4200);
      } else { await ghPush(m, { sha: r.rem.sha }); toast(t('gh.pushed'), 3200); }
      ghDone();
    } catch (e) { if (ghErrInfo(e).code === 'conflict') { GHS.remote = null; ghSetPhase('idle'); setTimeout(ghKick, 700); } else ghFailed(e); }
  });
}
/** Вернуть старую версию: сначала отправляем текущее состояние (чтобы оно осталось в истории), затем кладём старую версию как новую запись. */
function ghRestore(entry) {
  return ghRun(async () => {
    const m = gmeta(); if (!m) return;
    try {
      ghSetPhase('syncing');
      const old = await ghGetFile(m, { ref: entry.sha}); if (!old.exists) throw ghFail('not_found', t('gh.err.notfound'));
      if (strHash(contentJSON()) !== m.sigHash) await ghCycle({ manual: true });
      if (GHS.phase === 'conflict') return;
      ghSetPhase('syncing');
      const cur = await ghGetFile(m); if (!cur.exists) throw ghFail('not_found', t('gh.err.notfound'));
      await ghApplyText(m, old.text, cur.sha, '', { restore: true });
      toast(t('gh.restored'), 4200);
      ghDone();
    } catch (e) { ghFailed(e); }
  }).then(() => { if (ghOn() && GHS.dirtyFlag) ghKick(); });
}

/* ---------- запуск ---------- */
function ghInit() {
  gmLoad();
  ghRefreshStatus().then(() => { ghRefreshUI(); const m = gmeta(); if (GHS.st.hasToken && m && m.on) setTimeout(ghKick, 2500); });
  clearInterval(GHS.poll);
  GHS.poll = setInterval(() => { const m = gmeta(); if (GHS.st.hasToken && m && m.on && GHS.phase !== 'syncing' && !document.hidden) ghKick(); }, GHTIME.poll);
  window.addEventListener('focus', () => { const m = gmeta(); if (GHS.st.hasToken && m && m.on && GHS.phase !== 'syncing') ghKick(); });
}

/* ---------- плашка в строке состояния ---------- */
function ghChip() {
  const m = gmeta(); if (!m || !m.on) return null;
  const s = ghState();
  const L = { nosign: 'gh.chip.nosign', syncing: 'gh.chip.syncing', ok: 'gh.chip.ok', pending: 'gh.chip.pending', offline: 'gh.chip.offline', auth: 'gh.chip.auth', error: 'gh.chip.error', conflict: 'gh.chip.conflict', newer: 'gh.chip.newer' };
  const tip = s === 'ok' && m.last ? t('gh.tip.last', ago(m.last)) : s === 'syncing' && GHS.progress ? GHS.progress : GHS.err || t(L[s] || 'gh.chip.ok');
  const warn = ['offline', 'auth', 'error', 'conflict', 'newer', 'nosign'].includes(s);
  const ic = s === 'ok' ? 'check' : s === 'syncing' ? 'refresh' : warn ? 'alert' : 'fork';
  const click = () => { if (s === 'conflict') ghConflictDialog(); else if (s === 'newer') ghSyncNow(); else openGhPanel(); };
  return h('button', { class: 'btn stat drive-chip gh-chip' + (warn ? ' warn' : '') + (s === 'syncing' ? ' busy' : ''), 'data-tip': tip, onclick: click }, icon(ic, 15), t(L[s] || 'gh.chip.ok'));
}

/* ====== окно «GitHub» ====== */
function openGhPanel() {
  closePopover();
  if (GHS.panel && !GHS.panel.m.closed) return;
  const st = { m: null, root: h('div', { class: 'view dr-view' }), draft: { repo: '', branch: '', path: '', token: '' }, hist: null, loadingH: false, statusEl: null, busy: false, stale: false };
  const m0 = gmeta(); if (m0) Object.assign(st.draft, { repo: m0.repo || '', branch: m0.branch || '', path: m0.path || '' });
  GHS.panel = st;
  st.m = openModal({
    cls: 'drive-m gh-m', onClose: () => { if (GHS.panel === st) GHS.panel = null; },
    build: m => { st.m = m; return h('div', { class: 'm-wrap' }, modalHead(t('gh.title'), m), h('div', { class: 'm-body' }, h('div', { class: 'm-main' }, st.root))); }
  });
  renderGhPanel(st);
  ghRefreshStatus().then(() => { if (!st.m.closed) renderGhPanel(st); });
}
function renderGhStatus(st) {
  if (!st.statusEl) return;
  const s = ghState(), m = gmeta();
  const L = { nosign: 'gh.chip.nosign', syncing: 'gh.chip.syncing', ok: 'gh.chip.ok', pending: 'gh.chip.pending', offline: 'gh.chip.offline', auth: 'gh.chip.auth', error: 'gh.chip.error', conflict: 'gh.chip.conflict', newer: 'gh.chip.newer' };
  const lines = [h('b', t(L[s] || 'gh.chip.off') + (s === 'syncing' && GHS.progress ? ' · ' + GHS.progress : ''))];
  if (m && m.last) lines.push(h('span', { class: 'hint' }, t('drive.last', fmtTime(m.last))));
  if (GHS.err && ['offline', 'auth', 'error'].includes(s)) lines.push(h('span', { class: 'err-t' }, GHS.err));
  st.statusEl.className = 'dr-status ' + s; st.statusEl.replaceChildren(...lines);
}
function renderGhPanel(st) {
  if (!st || st.m.closed) return;
  const keep = st.m.card.querySelector('.m-main'), top = keep ? keep.scrollTop : 0, parts = [];
  const guard = async (fn) => { st.busy = true; renderGhPanel(st); try { await fn(); } catch (e) { toast(ghErrInfo(e).msg, 6500); } st.busy = false; renderGhPanel(st); };
  const inp = (key, ph, type = 'text') => { const i = h('input', { class: 'inp mono', type, spellcheck: 'false', autocomplete: 'off', placeholder: ph, value: st.draft[key] || '', id: 'gh-' + key }); i.addEventListener('input', () => { st.draft[key] = i.value; }); return i; };

  /* 0. открыть по ссылке */
  parts.push(h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('download', 16), h('b', t('gho.panel.h'))), h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('gho.panel.t')),
    h('div', { class: 'row-actions left' }, h('button', { class: 'btn', id: 'gh-openlink', onclick: () => openFromGithub() }, icon('open', 15), t('gho.menu')))));

  /* 1. доступ */
  const acc = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('lock', 16), h('b', t('gh.acc'))));
  if (DESK && !GHD) acc.append(h('div', { class: 'hint warn-t' }, t('gh.oldshell')));
  else if (!GHS.st.hasToken) {
    acc.append(h('div', { class: 'hint', style: { marginBottom: '10px' } }, t('gh.acc.t')),
      h('details', { class: 'dr-steps', open: true }, h('summary', t('gh.steps.h')),
        h('ol', [1, 2, 3, 4].map(i => h('li', t('gh.step' + i)))),
        h('div', { class: 'row-actions left' },
          h('button', { class: 'btn sm', onclick: () => ghOpenUrl('https://github.com/signup') }, icon('open', 13), t('gh.link.signup')),
          h('button', { class: 'btn sm', onclick: () => ghOpenUrl('https://github.com/new') }, icon('open', 13), t('gh.link.newrepo')),
          h('button', { class: 'btn sm', onclick: () => ghOpenUrl('https://github.com/settings/personal-access-tokens/new') }, icon('open', 13), t('gh.link.token')),
          h('button', { class: 'btn sm', onclick: () => ghOpenUrl('https://github.com/settings/tokens/new?scopes=repo&description=VNMap') }, icon('open', 13), t('gh.link.token2')))),
      field(t('gh.f.token'), inp('token', 'github_pat_…', 'password')),
      h('div', { class: 'row-actions left' }, h('button', { class: 'btn primary', id: 'gh-signin', disabled: st.busy, onclick: () => guard(async () => { await ghSetToken(st.draft.token); st.draft.token = ''; toast(t('gh.signed', GHS.st.login || ''), 3500); ghRefreshUI(); }) }, icon('check', 15), t('gh.signin'))));
  } else {
    acc.append(h('div', { class: 'dr-acc' }, icon('check', 16), h('span', t('gh.as', GHS.st.login || '—'))),
      h('div', { class: 'row-actions left' }, h('button', { class: 'btn', id: 'gh-signout', onclick: () => guard(async () => { await ghClearToken(); }) }, t('gh.signout'))));
    if (!GHS.st.encrypted) acc.append(h('div', { class: 'hint warn-t', style: { marginTop: '8px' } }, t(DESK ? 'gh.plain' : 'gh.plain.web')));
  }
  parts.push(acc);

  /* 2. этот проект */
  st.statusEl = null;
  if (GHS.st.hasToken) {
    const m = gmeta(), on = !!(m && m.on);
    const card = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('fork', 16), h('b', t('gh.proj')), h('span', { class: 'hint' }, P.name)));
    if (!on) {
      if (!st.draft.path) st.draft.path = ghDefaultPath();
      card.append(h('div', { class: 'hint', style: { marginBottom: '10px' } }, t('gh.proj.t')),
        h('div', { class: 'grid2' }, field(t('gh.f.repo'), inp('repo', t('gh.f.repo.ph')), t('gh.f.repo.h')), field(t('gh.f.path'), inp('path', 'novella.vnmap.json'), t('gh.f.path.h'))),
        field(t('gh.f.branch'), inp('branch', t('gh.f.branch.ph'))),
        h('div', { class: 'row-actions left' },
          h('button', { class: 'btn primary', id: 'gh-connect', disabled: st.busy, onclick: () => guard(async () => { if (await ghConnect(st.draft)) st.hist = null; }) }, icon('upload', 15), t('gh.connect')),
          h('button', { class: 'btn', id: 'gh-join', disabled: st.busy, onclick: () => guard(async () => { if (await ghJoin(st.draft)) st.hist = null; }) }, icon('download', 15), t('gh.join'))),
        h('div', { class: 'hint' }, t('gh.join.h')));
    } else {
      st.statusEl = h('div', { class: 'dr-status' });
      card.append(h('div', { class: 'opt-row' }, h('div', { class: 'opt-t' }, h('div', { class: 'mono' }, m.repo + ' · ' + m.path + (m.branch ? ' · ' + m.branch : '')), h('div', { class: 'hint' }, m.priv === false ? t('gh.public') : t('gh.private')))), st.statusEl,
        h('div', { class: 'row-actions left', style: { margin: '10px 0 4px' } },
          h('button', { class: 'btn', id: 'gh-now', onclick: () => ghSyncNow() }, icon('refresh', 15), t('gh.now')),
          h('button', { class: 'btn', onclick: () => ghOpenUrl(ghWebUrl(m)) }, icon('open', 15), t('gh.open')),
          DESK ? null : h('button', { class: 'btn', id: 'gh-copylink', 'data-tip': t('gho.copy.h'), onclick: async () => { if (await copyText(ghOpenLinkFor(m))) toast(t('gho.copied')); } }, icon('link', 15), t('gho.copy')),
          GHS.remote && GHS.remote.kind !== 'newer' ? h('button', { class: 'btn danger-fill', onclick: () => ghConflictDialog() }, icon('alert', 15), t('drive.resolve')) : null,
          h('button', { class: 'btn', id: 'gh-off', onclick: () => { ghDisable(); renderGhPanel(st); } }, t('gh.off'))));
    }
    card.append(h('div', { class: 'hint', style: { marginTop: '8px' } }, t('gh.scope')));
    parts.push(card);

    /* 3. история */
    if (on) {
      const hc = h('div', { class: 'card-sec' }, h('div', { class: 'sec-head' }, icon('undo', 16), h('b', t('gh.hist')), h('div', { class: 'grow' }),
        h('button', { class: 'btn sm', onclick: () => { st.hist = null; renderGhPanel(st); } }, icon('refresh', 13), t('drive.reload'))));
      hc.append(h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('gh.hist.h')));
      const box = h('div', { class: 'dr-list', id: 'gh-hist' }); hc.append(box);
      if (st.hist) {
        if (!st.hist.length) box.append(h('div', { class: 'empty small' }, t('gh.hist.none')));
        st.hist.forEach(e => box.append(h('div', { class: 'dr-row' }, h('div', { class: 'dr-t' }, h('b', fmtTime(e.date)), h('span', { class: 'hint' }, [e.who && '@' + e.who, e.msg].filter(Boolean).join(' · '))),
          h('button', { class: 'btn sm', onclick: async () => { if (await confirmDlg({ title: t('gh.rb.q'), text: t('gh.rb.t', fmtTime(e.date)), ok: t('gh.rb.ok') })) ghRestore(e); } }, icon('undo', 13), t('gh.rb.btn')))));
      } else {
        box.append(h('div', { class: 'empty small' }, t('drive.loading')));
        if (!st.loadingH) { st.loadingH = true; ghHistory(m).then(l => { st.hist = l; }).catch(e => { st.hist = []; toast(ghErrInfo(e).msg, 5000); }).finally(() => { st.loadingH = false; renderGhPanel(st); }); }
      }
      parts.push(hc);
    }
  }
  st.root.replaceChildren(...parts);
  renderGhStatus(st);
  const mm = st.m.card.querySelector('.m-main'); if (mm) mm.scrollTop = top;
}

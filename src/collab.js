'use strict';
/* ====== Совместная работа в браузере ======
   Проект лежит в общей базе страницы (возможность `db`) по сущностям: блок, файл главы, стрелка, персонаж… (см. merge.js).
   Правки отправляются по одной сущности, чужие приходят живыми подписками и сливаются с моими (трёхстороннее слияние).
   Кто сейчас в проекте и какой блок у кого выбран — возможность `room` (присутствие). Файлы ассетов — возможность `assets`.
   Всё работает только в опубликованной странице, где эти возможности выданы; без них кнопка скрыта. */

const CL = {
  supported: false, ready: false, st: 'off',            // off | connecting | on | ro | err
  db: null, room: null, user: null, assets: null,
  rem: new Map(), base: new Map(), unsubs: [], peers: [], profiles: {}, me: { id: null, name: '' },
  canWrite: true, applying: false, pushing: false, again: false, skip: new Set(), retryN: 0, info: '', lastSig: ''
};
const CL_COLLS = ['n', 'f', 'e', 'c', 'a', 'v', 'm', 'k', 'x', 'g', 'q', 'l', 'r', 'meta'];
const CL_LS = 'vnmap.collab.on';
const clDocOf = path => (path === 'meta' ? ['meta', 'project'] : path.startsWith('r/') ? ['r', path.slice(2).replace('/', '__')] : [path.split('/')[0], path.slice(path.indexOf('/') + 1)]);
const clPathOf = (coll, id) => (coll === 'meta' ? 'meta' : coll === 'r' ? 'r/' + id.replace('__', '/') : coll + '/' + id);
const clRef = path => { const [c, id] = clDocOf(path); return CL.db.collection(c).doc(id); };

/** Узнаёт, какие возможности выданы странице. Ничего не включает. */
async function collabInit() {
  if (typeof DESK !== 'undefined' && DESK) return;
  if (!(window.claude && typeof window.claude.use === 'function')) return;
  try {
    const [db, room, user, assets] = await Promise.all([claude.use('db'), claude.use('room'), claude.use('user'), claude.use('assets')]);
    CL.db = db; CL.room = room; CL.user = user; CL.assets = assets;
  } catch (e) { CL.db = null; }
  CL.supported = !!CL.db; CL.ready = true;
  if (!CL.supported) return;
  try { CL.me.id = user_id_safe(await CL.user.id()); } catch (e) { /* без id работаем анонимно */ }
  buildChrome();
  if (lsGet(CL_LS) === '1') collabEnable({ auto: true });
}
function user_id_safe(x) { return typeof x === 'string' && x ? x : null; }

/* ---------- сохранённая «общая основа» ---------- */
const clBaseKey = () => 'cbase_' + (P && P.uid || 'x');
async function clSaveBase() {
  try { await blobPut(clBaseKey(), new Blob([JSON.stringify([...CL.base])], { type: 'application/json' })); } catch (e) { /* не страшно */ }
}
const clSaveBaseSoon = debounce(clSaveBase, 1500);
async function clLoadBase() {
  try { const b = await blobGet(clBaseKey()); if (!b) return null; return new Map(JSON.parse(await b.text())); } catch (e) { return null; }
}

/* ---------- включение ---------- */
async function collabEnable({ auto = false } = {}) {
  if (!CL.supported || CL.st === 'connecting' || CL.on) return;
  CL.st = 'connecting'; collabRefreshUI();
  try {
    let canWrite = true;
    try { if (CL.user && typeof CL.user.can === 'function') { const c = await CL.user.can('data.write'); canWrite = c !== false; } } catch (e) { /* неизвестно — пробуем писать */ }
    CL.canWrite = canWrite;
    /* первый срез всех коллекций */
    const first = new Map();
    await new Promise((resolve, reject) => {
      let left = CL_COLLS.length, done = false;
      const fin = () => { if (!done && --left <= 0) { done = true; resolve(); } };
      const tm = setTimeout(() => { if (!done) { done = true; reject(new Error('timeout')); } }, 20000);
      CL_COLLS.forEach(c => {
        let got = false;
        const un = CL.db.collection(c).onSnapshot(snap => {
          if (!got) { got = true; snap.docs.forEach(d => { const dd = d.data(); if (dd && dd.d !== undefined) first.set(clPathOf(c, d.id), dd.d); }); fin(); clearTimeout(tm); }
          else clOnSnap(c, snap);
        }, err => { if (!got) { got = true; fin(); } clOnErr(err); });
        CL.unsubs.push(un);
      });
    });
    CL.rem = first;
    const hasRemote = first.has('meta');
    const local = mgEntities(P);
    let base = null;
    if (hasRemote && first.get('meta').uid === P.uid) base = await clLoadBase();
    if (!hasRemote) {
      if (!canWrite) throw Object.assign(new Error('empty'), { code: 'empty' });
      if (!auto && !(await confirmDlg({ title: t('col.seed.q'), text: t('col.seed.t'), ok: t('col.seed.ok') }))) throw Object.assign(new Error('cancel'), { code: 'cancel' });
      CL.base = new Map();
    } else if (base || auto) {
      CL.base = base || new Map(first);
    } else {
      const choice = await clJoinDialog(first.get('meta').name, first.get('meta').uid === P.uid);
      if (!choice) throw Object.assign(new Error('cancel'), { code: 'cancel' });
      CL.base = choice === 'merge' ? new Map() : new Map(first);
      if (choice === 'take') { clApplyMap(new Map(first)); }
    }
    CL.st = canWrite ? 'on' : 'ro'; CL.on = true; lsSet(CL_LS, '1');
    CL.retryN = 0;
    clIntegrate();                       // слить текущий срез (в т. ч. правки, сделанные без связи)
    clStartPresence();
    collabRefreshUI();
    if (!auto) toast(t('col.on'), 3600);
  } catch (e) {
    clStopSubs();
    if (e && e.code === 'cancel') { CL.st = 'off'; }
    else if (e && e.code === 'empty') { CL.st = 'off'; toast(t('col.err.empty'), 6000); }
    else { CL.st = 'err'; CL.info = String(e && (e.code || e.message) || e); toast(t('col.err.start', CL.info), 6000); }
    CL.on = false; collabRefreshUI();
  }
}
function clJoinDialog(name, same) {
  return new Promise(res => {
    openModal({
      cls: 'dlg wide', onClose: () => res(null),
      build: m => h('div', { class: 'dlg-body' }, h('h3', t('col.join.t')), h('p', t('col.join.p', name || '—')), same ? null : h('p', { class: 'hint' }, t('col.join.other')),
        h('div', { class: 'dlg-col' },
          h('button', { class: 'btn primary', onclick: () => { res('take'); m.close(); } }, icon('download', 16), t('col.join.take')),
          same ? h('button', { class: 'btn', onclick: () => { res('merge'); m.close(); } }, icon('fork', 16), t('col.join.merge')) : null,
          h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel'))),
        h('p', { class: 'hint' }, t('col.join.safe')))
    });
  });
}
function clStopSubs() { CL.unsubs.forEach(u => { try { u(); } catch (e) { /* ничего */ } }); CL.unsubs = []; clStopPresence(); }
function collabDisable(keep) {
  clStopSubs(); CL.on = false; CL.st = 'off'; clearTimeout(CL.pt); clearTimeout(CL.it);
  if (!keep) lsSet(CL_LS, '0');
  CL.peers = []; collabMarks(); collabRefreshUI();
}

/* ---------- чужие правки ---------- */
let _clQ = null;
function clOnSnap(coll, snap) {
  for (const ch of snap.docChanges()) {
    const path = clPathOf(coll, ch.doc.id);
    if (ch.type === 'removed') CL.rem.delete(path);
    else { const d = ch.doc.data(); if (d && d.d !== undefined) CL.rem.set(path, d.d); }
  }
  if (!CL.on || CL.applying) return;
  clearTimeout(CL.it); CL.it = setTimeout(clIntegrate, 150);
}
function clOnErr(err) {
  const code = err && err.code;
  if (code === 'revoked') { toast(t('col.err.revoked'), 6000); collabDisable(true); return; }
  if (code === 'quota_exceeded') { toast(t('col.err.quota'), 8000); return; }
  CL.st = 'err'; CL.info = String(code || (err && err.message) || '?'); collabRefreshUI();
}
const clSame = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.has(k) && mgEq(b.get(k), v));
/** Сливает «базу → моё → общее» и, если что-то изменилось, подменяет проект. Затем отправляет то, что общей базе ещё не известно. */
function clIntegrate() {
  if (!CL.on) return;
  const L = mgEntities(P), R = CL.rem, cf = [];
  const M = mgMergeMaps(CL.base, L, R, cf);
  if (!clSame(M, L)) clApplyMap(M, cf);
  CL.base = new Map(R);
  clSaveBaseSoon();
  clPushSoon(0);
  clBlobsSoon();
}
function clApplyMap(M, cf) {
  CL.applying = true;
  try {
    flushHistory();
    const v = P.view, sim = P.sim;
    const np = normalize(mgBuild(M, P)); np.view = v; np.sim = sim && typeof sim === 'object' ? sim : np.sim;
    P = np; reindex();
    for (const id of [...UI.sel]) if (!nodeById(id)) UI.sel.delete(id);
    if (UI.edge && !edgeById(UI.edge)) UI.edge = null;
    resetHistory();            // чужие правки теперь часть истории: «отменить» не должно их откатывать
    scheduleSave(); setSaveState('dirty');
    onProjectReplaced();
    if (typeof TLW !== 'undefined' && TLW && !TLW.m.closed) { tlSync(); renderTl(); }
    const marked = (cf || []).filter(c => c.marked).length;
    if (marked) toast(t('col.conflict', marked), 9000);
    collabMarks();
    if (typeof satTouch === 'function') satTouch();
  } finally { CL.applying = false; }
}

/* ---------- мои правки ---------- */
function collabTouch() {
  if (!CL.on || CL.applying || !CL.canWrite) return;
  clPushSoon(700);
}
function clPushSoon(ms) { clearTimeout(CL.pt); CL.pt = setTimeout(clPush, ms); }
const clSleep = ms => new Promise(r => setTimeout(r, ms));
async function clPush() {
  if (!CL.on || !CL.canWrite) return;
  if (CL.pushing) { CL.again = true; return; }
  CL.pushing = true;
  try {
    flushHistory();
    const L = mgEntities(P), d = mgDiff(CL.rem, L);
    const todo = [...d.set.filter(k => !CL.skip.has(k)).map(k => ({ k, del: false })), ...d.del.map(k => ({ k, del: true }))];
    if (todo.length) { CL.sending = true; collabRefreshUI(); }
    let i = 0, bad = null;
    const worker = async () => {
      while (i < todo.length && !bad) {
        const it = todo[i++];
        try {
          if (it.del) { await clRef(it.k).delete(); CL.rem.delete(it.k); CL.base.delete(it.k); }
          else {
            const o = L.get(it.k), ref = clRef(it.k);
            /* Общая база — «последний пишет побеждает». Чтобы одновременная правка коллеги не затиралась, существующий документ
               пишем под короткой арендой: взяли → прочитали → если там уже что-то новое, сначала сливаем, и только потом пишем. */
            if (CL.rem.has(it.k) && typeof ref.acquire === 'function') {
              const ls = await ref.acquire({ holder: CL.hid, ttlMs: 1000 });
              if (!ls || !ls.acquired) { CL.busy = true; continue; }
              const sn = await ref.get(), rd = sn && sn.exists ? sn.data() : null;
              if (rd && rd.d !== undefined && !mgEq(rd.d, CL.rem.get(it.k))) { CL.rem.set(it.k, rd.d); CL.stale = true; continue; }
              if (!rd && CL.rem.has(it.k)) { CL.rem.delete(it.k); CL.stale = true; continue; }
            }
            await ref.set({ v: 1, d: o }); CL.rem.set(it.k, o); CL.base.set(it.k, o);
          }
        } catch (e) {
          const code = e && e.code;
          if (code === 'invalid_argument' && !it.del) { CL.skip.add(it.k); toast(t('col.err.big', it.k), 7000); }
          else bad = e || new Error('?');
        }
      }
    };
    CL.hid = CL.hid || (String(CL.me && CL.me.id || 'u') + ':' + Math.random().toString(36).slice(2, 8));
    CL.busy = false; CL.stale = false;
    await Promise.all([worker(), worker(), worker()]);
    CL.sending = false;
    if (CL.stale) { CL.stale = false; clearTimeout(CL.it); CL.it = setTimeout(clIntegrate, 0); }
    if (CL.busy) { CL.busy = false; clPushSoon(1300 + Math.random() * 600); }
    if (bad) {
      const code = bad.code;
      if (code === 'quota_exceeded') { toast(t('col.err.quota'), 8000); CL.st = 'err'; CL.info = code; }
      else if (code === 'revoked') { collabDisable(true); toast(t('col.err.revoked'), 6000); }
      else { CL.retryN++; if (CL.retryN <= 6) clPushSoon(Math.min(30000, 2500 * CL.retryN)); else { CL.st = 'err'; CL.info = String(code || '?'); } }
    } else { CL.retryN = 0; if (CL.st === 'err') CL.st = CL.canWrite ? 'on' : 'ro'; clSaveBaseSoon(); }
  } finally {
    CL.pushing = false; collabRefreshUI();
    if (CL.again) { CL.again = false; clPushSoon(300); }
  }
}

/* ---------- файлы ассетов (возможность assets) ---------- */
const clBlobsSoon = debounce(clBlobs, 2500);
async function clBlobs() {
  if (!CL.on) return;
  let changed = false;
  for (const a of P.assets) for (const m of Object.values(a.files || {})) {
    if (!m || !m.bid) continue;
    try {
      const local = await blobGet(m.bid);
      if (local && !m.rid && CL.assets && CL.canWrite) {
        const up = await CL.assets.upload(local);
        if (up && up.id) { m.rid = up.id; changed = true; }
      } else if (!local && m.rid) {
        const r = await fetch('/_blob/' + encodeURIComponent(m.rid));
        if (r.ok) { await blobPut(m.bid, await r.blob()); changed = true; }
      }
    } catch (e) { /* файл подтянется при следующей попытке */ }
  }
  if (changed) { commit(true); scheduleRender(); if (REG && !REG.m.closed) renderReg(); }
}

/* ---------- присутствие ---------- */
let _clPT = null, _clUn = null;
const CL_PCOLORS = ['red', 'orange', 'green', 'cyan', 'blue', 'purple', 'pink', 'indigo'];
function clMyColor() { const s = String(CL.me.id || CL.me.name || 'x'); let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return CL_PCOLORS[x % CL_PCOLORS.length]; }
function clOpenNodeId() { return (typeof NMODAL !== 'undefined' && NMODAL && !NMODAL.m.closed) ? NMODAL.nid : null; }
async function clStartPresence() {
  clStopPresence();
  if (!CL.room) return;
  try {
    if (CL.user && typeof CL.user.me === 'function') { try { const me = await CL.user.me(); if (me && me.name) CL.me.name = me.name; } catch (e) { /* имя необязательно */ } }
    _clUn = CL.room.onPeers(ch => { CL.peers = ch.peers.filter(p => p.kind !== 'agent'); clResolveNames(); collabMarks(); collabRefreshUI(); });
    const send = () => {
      const sel = [...UI.sel].slice(0, 8), open = clOpenNodeId(), sig = sel.join() + '|' + open;
      if (sig === CL.lastSig) return; CL.lastSig = sig;
      CL.room.presence({ c: clMyColor(), n: CL.me.name || '', sel, open }).catch(() => { });
    };
    send(); _clPT = setInterval(send, 700);
  } catch (e) { /* без присутствия работаем */ }
}
function clStopPresence() { if (_clUn) { try { _clUn(); } catch (e) { /* ничего */ } _clUn = null; } clearInterval(_clPT); _clPT = null; CL.lastSig = ''; }
async function clResolveNames() {
  const ids = [...new Set(CL.peers.map(p => p.by).filter(Boolean))].filter(id => !CL.profiles[id]);
  if (!ids.length || !CL.user || typeof CL.user.profiles !== 'function') return;
  try { const ps = await CL.user.profiles(ids); for (const id of ids) if (ps && ps[id]) CL.profiles[id] = ps[id]; collabRefreshUI(); collabMarks(); } catch (e) { /* имена необязательны */ }
}
const clPeerName = p => (p.by && CL.profiles[p.by] && CL.profiles[p.by].name) || (p.presence && p.presence.n) || t('col.guest');
const clOthers = () => CL.peers.filter(p => !p.isMe);
/** Рамки вокруг блоков, которые выбрали или открыли другие участники. */
function collabMarks() {
  document.querySelectorAll('.peer-mark').forEach(x => x.remove());
  if (!CL.on) return;
  const by = new Map();
  for (const p of clOthers()) {
    const pr = p.presence || {}, ids = new Set([...(Array.isArray(pr.sel) ? pr.sel : []), pr.open].filter(x => typeof x === 'string'));
    for (const id of ids) { if (!by.has(id)) by.set(id, []); by.get(id).push({ p, open: pr.open === id }); }
  }
  for (const [id, list] of by) {
    const g = document.querySelector('[data-nid="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (!g || !g.getBBox) continue;
    let bb; try { bb = g.getBBox(); } catch (e) { continue; }
    const col = palColor(COLOR_NAMES.includes((list[0].p.presence || {}).c) ? list[0].p.presence.c : 'blue');
    const mk = s('g', { class: 'peer-mark', 'pointer-events': 'none' },
      s('rect', { x: bb.x - 4, y: bb.y - 4, width: bb.width + 8, height: bb.height + 8, rx: 16, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': list.some(x => x.open) ? '' : '6 4' }));
    list.slice(0, 3).forEach((x, i) => {
      const nm = clPeerName(x.p), w = Math.max(22, textW(nm, 11, 600) + 14);
      mk.append(s('rect', { x: bb.x + 6 + i * 4, y: bb.y - 22 - i * 0, width: w, height: 18, rx: 9, fill: col }), s('text', { x: bb.x + 6 + w / 2 + i * 4, y: bb.y - 9, 'text-anchor': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 600 }, nm));
    });
    g.append(mk);
  }
}

/* ---------- кнопка на панели и окно ---------- */
const collabAvail = () => ((typeof DESK !== 'undefined' && DESK) ? true : CL.supported);
function collabRefreshUI() {
  const b = BTN.collab; if (b) {
    const desk = typeof DESK !== 'undefined' && DESK;
    b.hidden = !collabAvail();
    b.classList.toggle('on', desk ? SF.on : CL.on);
    const n = CL.on ? clOthers().length : 0;
    const lab = b.querySelector('.tlbl');
    if (lab) lab.textContent = desk ? t('col.btn') : CL.st === 'connecting' ? t('col.connecting') : CL.on ? (n ? t('col.n', n + 1) : t('col.btn')) : t('col.btn');
    b.dataset.state = desk ? (SF.err ? 'err' : SF.on ? 'on' : 'off') : CL.st + (CL.sending ? '+send' : '');
  }
  if (CL.panel && !CL.panel.m.closed) renderCollabPanel(CL.panel);
}
function openCollabPanel() {
  if (typeof DESK !== 'undefined' && DESK) return openSharePanel();
  if (CL.panel && !CL.panel.m.closed) return;
  const st = { m: null, body: h('div', { class: 'dlg-body' }) };
  CL.panel = st;
  st.m = openModal({ cls: 'dlg wide', onClose: () => { if (CL.panel === st) CL.panel = null; }, build: m => { st.m = m; renderCollabPanel(st); return st.body; } });
}
function renderCollabPanel(st) {
  const on = CL.on, others = clOthers();
  const stTxt = CL.st === 'connecting' ? t('col.st.connecting') : CL.st === 'err' ? t('col.st.err', CL.info) : CL.st === 'ro' ? t('col.st.ro') : on ? (CL.sending ? t('col.st.sending') : t('col.st.on')) : t('col.st.off');
  const list = h('div', { class: 'col-peers' });
  if (on) {
    list.append(h('div', { class: 'col-peer me' }, h('span', { class: 'dot big', style: { background: palColor(clMyColor()) } }), h('b', t('col.you')), CL.me.name ? h('span', { class: 'hint' }, CL.me.name) : null));
    others.forEach(p => {
      const pr = p.presence || {}, nd = pr.open ? nodeById(pr.open) : null;
      list.append(h('div', { class: 'col-peer' }, h('span', { class: 'dot big', style: { background: palColor(COLOR_NAMES.includes(pr.c) ? pr.c : 'blue') } }), h('b', clPeerName(p)), p.guest ? h('span', { class: 'chip static sm' }, t('col.guest.tag')) : null,
        nd ? h('button', { class: 'btn sm', onclick: () => { st.m.close(); focusNode(nd.id); } }, icon('target', 13), nd.title || '—') : null));
    });
    if (!others.length) list.append(h('div', { class: 'hint' }, t('col.alone')));
  }
  st.body.replaceChildren(h('h3', t('col.title')), h('p', { class: 'gd-p' }, t('col.intro')),
    h('div', { class: 'col-state' + (CL.st === 'err' ? ' bad' : on ? ' ok' : '') }, icon(CL.st === 'err' ? 'alert' : on ? 'check' : 'users', 16), h('span', stTxt)), list,
    !CL.canWrite && on ? h('p', { class: 'hint warn-t' }, t('col.ro.h')) : null,
    h('p', { class: 'hint' }, t('col.undo.h')),
    h('div', { class: 'dlg-actions' },
      on ? h('button', { class: 'btn', onclick: () => { collabDisable(); } }, icon('x', 15), t('col.off')) : h('button', { class: 'btn primary', disabled: CL.st === 'connecting', onclick: () => collabEnable() }, icon('users', 15), t('col.enable')),
      h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => st.m.close() }, t('c.close'))));
}

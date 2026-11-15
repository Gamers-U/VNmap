'use strict';
/* ====== Перевод: языки, строки, озвучка по языкам, подготовка файлов game/tl/<язык>/ для Ren'Py ======
   P.tl = { base: 'Русский', langs: [{ id, code, name, owners:[memberId] }], rec: { [langId]: { [key]: { t, v, s, src } } }, idx: { [fileId]: [ключи строк] } }
   • t — перевод, v — id ассета-голоса для этого языка, s — статус ('draft' | 'review' | 'done'), src — исходный текст на момент перевода (если он изменился, строка «устарела»).
   • Реплики в скриптах получают постоянные `id` (Ren'Py: `e "Привет" id ch1_3fa2c1d0`), к ним привязываются блоки `translate <язык> <id>:`
     — только так в блок можно положить свою озвучку. Меню, имена, карточки концовок и титры переводятся блоками `translate <язык> strings:` (old/new). */

const TL_PRESETS = [['english', 'English'], ['german', 'Deutsch'], ['french', 'Français'], ['spanish', 'Español'], ['italian', 'Italiano'], ['portuguese', 'Português'],
  ['polish', 'Polski'], ['ukrainian', 'Українська'], ['turkish', 'Türkçe'], ['czech', 'Čeština'], ['japanese', '日本語'], ['schinese', '简体中文'], ['korean', '한국어'], ['russian', 'Русский']];
const TL_STATUSES = ['draft', 'review', 'done'];
const TL_BAD_CODES = new Set(['none', 'strings', 'python', 'style', 'init', 'default', 'define']);
/* первые слова строк, которые НЕ являются репликами (кроме centered/narrator/extend: они — реплики) */
const TL_SKIP = new Set([...CMP_NOT_SPEAKER].filter(w => !['centered', 'vcentered', 'narrator', 'extend'].includes(w)));
const TL_OPENERS = new Set(['python', 'init', 'screen', 'transform', 'style', 'translate', 'layeredimage', 'camera', 'image', 'testcase']);
const RE_TL_SAY = /^([ \t]*)(?:([A-Za-z_]\w*)((?:[ \t]+[A-Za-z_@][\w@.]*)*)[ \t]+)?("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(.*)$/;

const langById = id => (P.tl.langs || []).find(l => l.id === id) || null;
const tlH = s => hashStr(String(s)).toString(36);
function tlH2(s) { let x = 5381; s = String(s); for (let i = 0; i < s.length; i++) x = (((x << 5) + x) ^ s.charCodeAt(i)) >>> 0; return x.toString(16).padStart(8, '0'); }
const tlRecs = id => P.tl.rec[id] || (P.tl.rec[id] = {});

function tlCleanCode(code) {
  let c = String(code || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
  if (!/^[a-z]/.test(c)) c = c ? 'l_' + c : '';
  return c;
}
function tlAddLang(code, name) {
  let c = tlCleanCode(code) || 'lang';
  if (TL_BAD_CODES.has(c)) c += '_tl';
  const base = c; let k = 2;
  while (P.tl.langs.some(l => l.code === c)) c = base + '_' + k++;
  const l = { id: uid('l'), code: c, name: String(name || c).trim().slice(0, 40) || c, owners: [] };
  P.tl.langs.push(l); P.tl.rec[l.id] = {};
  commit(true);
  return l;
}
function tlRemoveLang(id) {
  P.tl.langs = P.tl.langs.filter(l => l.id !== id); delete P.tl.rec[id];
  commit(true);
}

/* ---------- разбор строк скрипта ---------- */
/** Находит реплики и выборы в строках одного файла. Работает с исходными строками (до подстановки путей и шрифтов). */
function tlScan(lines) {
  const out = [], occ = new Map(), stack = [];
  let skip = -1, voice = '';
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], tr = raw.trim();
    if (!tr || tr[0] === '#') continue;
    const ind = raw.length - raw.trimStart().length;
    if (skip >= 0) { if (ind > skip) continue; skip = -1; }
    while (stack.length && ind <= stack[stack.length - 1].ind) stack.pop();
    const top = stack[stack.length - 1];
    if (top && top.child == null) top.child = ind;
    const w = (/^[A-Za-z_]\w*/.exec(tr) || [''])[0];
    const opens = /:\s*(?:#.*)?$/.test(tr);
    if (opens && w === 'menu') { stack.push({ ind, child: null }); voice = ''; continue; }
    if (opens && TL_OPENERS.has(w)) { skip = ind; voice = ''; continue; }
    const vm = RE_VOICE.exec(raw);
    if (vm) { voice = vm[3]; continue; }
    const m = RE_TL_SAY.exec(raw);
    const pv = voice; voice = '';
    if (!m) continue;
    const [, pre, who, attrs, lit, rest] = m;
    if (who && TL_SKIP.has(who)) continue;
    const q = lit[0], body = lit.slice(1, -1);
    if (!body.trim()) continue;
    const rt = rest.trim(), direct = !!(top && ind === top.child);
    let sub, idOk = false;
    if (rt === '' || rt[0] === '#') { sub = direct ? 'caption' : 'line'; idOk = !direct; }
    else if (/^(?:if\b.*)?:\s*(?:#.*)?$/.test(rt)) { if (who) continue; sub = 'choice'; }
    else if (/^(?:with\s+\w+|nointeract|\()/.test(rt)) sub = 'with';
    else continue;
    const hk = tlH((who || '') + '|' + body), oc = (occ.get(hk) || 0) + 1; occ.set(hk, oc);
    out.push({ k: hk + (oc > 1 ? '.' + oc : ''), li: i, endCol: raw.length - rest.length, who: who || '', attrs: attrs || '', q, body, sub, idOk, voice: pv });
  }
  return out;
}
function tlLines(f) {
  const raw = String(f.script || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
  const a = raw.split('\n').map(l => l.replace(/\s+$/, ''));
  while (a.length && !a[0].trim()) a.shift();
  while (a.length && !a[a.length - 1].trim()) a.pop();
  return a;
}

/* ---------- литералы Ren'Py ---------- */
/** Как исходный текст записан в `old "…"`. */
function tlOldLit(u) {
  if (u.lit === 'plain') return rpyEsc(u.src);
  if (u.lit === 'py') return pyStr(u.src).slice(1, -1);
  if (u.q === "'") return u.src.replace(/\\'/g, "'").replace(/(^|[^\\])((?:\\\\)*)"/g, '$1$2\\"');
  return u.src;
}
/** Как перевод записывается в `new "…"` (или в строку-реплику с кавычкой q). */
function tlNewLit(u, text, q) {
  text = String(text);
  if (u.lit === 'plain') return rpyEsc(text.replace(/\s*\n\s*/g, ' ').trim());
  if (u.lit === 'py') return pyStr(text.replace(/\s*\n\s*/g, ' ').trim()).slice(1, -1);
  return tlFixRaw(text, q || '"');
}
/** Перевод пишут как обычный текст: лишние кавычки экранируем сами, перевод строки превращаем в \n. */
function tlFixRaw(text, q) {
  const s = String(text).replace(/\r?\n/g, '\\n');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') out += c + (i + 1 < s.length ? s[++i] : '\\');
    else if (c === q) out += '\\' + c;
    else out += c;
  }
  return out;
}

/* ---------- ожидаемые тексты, которые собирает сам компилятор ---------- */
function tlEndingCard(n, o) {
  o = o || Object.assign({}, DEFAULT_BUILD, P.build || {});
  const parts = [];
  if (o.endingCard) parts.push('{size=+10}' + rpyEsc(n.title) + '{/size}');
  if (o.endingCounter) parts.push('{size=-4}' + rpyEsc(t('cmp.ending.count')) + ' [endings_count()] ' + rpyEsc(t('cmp.ending.of')) + ' [endings_total()]{/size}');
  return parts.join('\\n');
}
const tlCreditsTitle = () => `{size=+10}${rpyEsc(P.name || 'Game')}{/size}\\n\\n{size=-2}${rpyEsc(t('credits.head'))}{/size}`;
const tlCreditsSec = sec => `{b}${rpyEsc(sec.head)}{/b}\\n\\n${sec.lines.map(rpyEsc).join('\\n')}`;

/* ---------- список единиц перевода ---------- */
/** Единица: { key, kind:'say'|'str', sub, src, lit:'plain'|'py'|'raw', who, group, nodeId, fileId, ... }.
    say — реплика с постоянным id (можно положить свою озвучку); str — переводится по тексту (меню, имена, титры, редкие строки). */
function tlUnits(opt) {
  const withScripts = !opt || opt.scripts !== false;
  const list = [], byKey = new Map();
  const push = u => { list.push(u); byKey.set(u.key, u); return u; };
  const nodes = P.nodes.filter(n => n.type !== 'note'), ids = new Set(nodes.map(n => n.id));
  const outs = new Map(), hasIn = new Set();
  for (const e of P.edges) if (ids.has(e.from) && ids.has(e.to)) { if (!outs.has(e.from)) outs.set(e.from, []); outs.get(e.from).push(e); hasIn.add(e.to); }
  const gMenu = t('tl.g.menu');
  for (const n of nodes) {
    if (withScripts) for (const f of n.files) {
      const g = n.title + (n.files.length > 1 || f.title ? ' › ' + (f.title || t('file.untitled')) : '');
      for (const s of tlScan(tlLines(f))) {
        push({ key: 's.' + f.id + '.' + s.k, kind: s.idOk ? 'say' : 'str', sub: s.sub, src: s.body, lit: 'raw', q: s.q, who: s.who, group: g, nodeId: n.id, fileId: f.id, line: s.li, voiceBase: s.voice });
      }
    }
    const os = outs.get(n.id) || [];
    if (os.length > 1) {
      if (n.prompt && n.prompt.trim()) push({ key: 'p.' + n.id, kind: 'str', sub: 'prompt', src: n.prompt.trim(), lit: 'plain', who: '', group: n.title + ' · ' + gMenu, nodeId: n.id });
      for (const e of os) if ((e.title || '').trim()) push({ key: 'e.' + e.id, kind: 'str', sub: 'edge', src: e.title.trim(), lit: 'plain', who: '', group: n.title + ' · ' + gMenu, nodeId: n.id });
    }
    if (n.type === 'ending') { const card = tlEndingCard(n); if (card) push({ key: 'k.end.' + n.id, kind: 'str', sub: 'card', src: card, lit: 'raw', q: '"', who: '', group: t('tl.g.endings'), nodeId: n.id }); }
  }
  const bonus = nodes.filter(n => n.unlock && !hasIn.has(n.id) && n.id !== P.startId);
  if (bonus.length) {
    push({ key: 'k.newgame', kind: 'str', sub: 'newgame', src: t('cmp.newgame'), lit: 'plain', who: '', group: t('tl.g.endings') });
    for (const b of bonus) push({ key: 'n.' + b.id, kind: 'str', sub: 'bonus', src: b.title, lit: 'plain', who: '', group: t('tl.g.endings'), nodeId: b.id });
  }
  for (const c of P.characters) if (c.tag && /^[A-Za-z_]\w*$/.test(c.tag)) push({ key: 'c.' + c.id, kind: 'str', sub: 'char', src: cmpGameName(c), lit: 'py', who: c.tag, group: t('tl.g.chars') });
  const cs = creditsModel();
  if (cs.length) {
    push({ key: 'k.cr.title', kind: 'str', sub: 'credits', src: tlCreditsTitle(), lit: 'raw', q: '"', who: '', group: t('tl.g.credits') });
    for (const sec of cs) { const lit = tlCreditsSec(sec); push({ key: 'k.cr.' + tlH(sec.head), kind: 'str', sub: 'credits', src: lit, lit: 'raw', q: '"', who: '', group: t('tl.g.credits') }); }
  }
  return { list, byKey };
}

/* ---------- запись перевода ---------- */
function tlRec(langId, key, create) {
  const r = tlRecs(langId);
  if (!r[key] && create) r[key] = { t: '', v: '', s: '', src: '' };
  return r[key] || null;
}
const tlStale = (r, u) => !!(r && r.t && r.t.trim() && r.src !== u.src);
/** Запись текста перевода пользователем: считаем строку актуальной и ставим «черновик», если статуса не было. */
function tlSetText(langId, u, text) {
  const r = tlRec(langId, u.key, true);
  const changed = r.t !== text;
  r.t = text; r.src = u.src;
  if (text.trim() && !r.s) r.s = 'draft';
  else if (changed && r.s === 'done') r.s = 'review';      // правка готового перевода отправляет его на повторную проверку
  if (!text.trim() && !r.v) delete tlRecs(langId)[u.key];
  commit();
}
function tlSetStatus(langId, u, s) {
  const r = tlRec(langId, u.key, true);
  r.s = s; r.src = u.src;
  commit(true);
}
function tlSetVoice(langId, u, assetId) {
  const r = tlRec(langId, u.key, true);
  r.v = assetId || '';
  if (!r.t.trim() && !r.v) delete tlRecs(langId)[u.key]; else if (!r.src) r.src = u.src;
  commit(true);
}

/* ---------- проверки текста ---------- */
const TL_TOKEN_RE = /\{\/?[a-z]+(?:=[^{}]*)?\}|\[[^\[\]]*\]/gi;
function tlTokens(text) {
  const clean = String(text).replace(/\{\{/g, '').replace(/\[\[/g, '');
  return (clean.match(TL_TOKEN_RE) || []).map(x => x[0] === '{' ? x.replace(/=.*\}$/, '}').toLowerCase() : x);
}
/** Теги {i}, {b}, {w}… и подстановки [name] должны остаться на месте. Возвращает список сообщений. */
function tlWarns(src, text) {
  if (!text || !text.trim()) return [];
  const a = tlTokens(src), b = tlTokens(text), out = [];
  const cnt = arr => arr.reduce((m, x) => (m.set(x, (m.get(x) || 0) + 1), m), new Map());
  const ca = cnt(a), cb = cnt(b);
  const miss = [], extra = [];
  for (const [k, n] of ca) if ((cb.get(k) || 0) < n) miss.push(k);
  for (const [k, n] of cb) if ((ca.get(k) || 0) < n) extra.push(k);
  if (miss.length) out.push(t('tl.w.miss', [...new Set(miss)].slice(0, 4).join(' ')));
  if (extra.length) out.push(t('tl.w.extra', [...new Set(extra)].slice(0, 4).join(' ')));
  return out;
}

/* ---------- статистика ---------- */
function tlStats(langId, units) {
  const rs = tlRecs(langId);
  const s = { total: 0, done: 0, review: 0, draft: 0, todo: 0, stale: 0, warn: 0, voice: 0, say: 0 };
  for (const u of units) {
    s.total++; if (u.kind === 'say') s.say++;
    const r = rs[u.key];
    if (r && r.v) s.voice++;
    if (!r || !r.t.trim()) { s.todo++; continue; }
    s[r.s === 'done' ? 'done' : r.s === 'review' ? 'review' : 'draft']++;
    if (r.src !== u.src) s.stale++;
    if (tlWarns(u.src, r.t).length) s.warn++;
  }
  return s;
}

/* ---------- синхронизация после правок скриптов ----------
   Ключи реплик зависят от текста. Если автор поправил строку, её перевод не должен пропасть: сравниваем прежний и новый порядок строк файла
   (наибольшая общая подпоследовательность) и переносим перевод на изменённую строку с пометкой «исходник изменился». */
function tlSim(a, b) {
  a = String(a).toLowerCase(); b = String(b).toLowerCase();
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bg = s => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; };
  const A = bg(a), B = bg(b); let hit = 0;
  for (const [g, n] of A) hit += Math.min(n, B.get(g) || 0);
  return (2 * hit) / (a.length + b.length - 2);
}
function tlSync() {
  const tl = P.tl; let changed = false;
  const live = new Set();
  for (const { file } of allFiles()) {
    live.add(file.id);
    const cur = tlScan(tlLines(file)).map(u => ({ key: 's.' + file.id + '.' + u.k, src: u.body }));
    const prev = tl.idx[file.id];
    tl.idx[file.id] = cur.map(u => u.key);
    if (!prev) { if (cur.length) changed = true; continue; }
    if (prev.length === cur.length && prev.every((k, i) => k === cur[i].key)) continue;
    changed = true;
    const n = prev.length, m = cur.length;
    const pm = new Set(prev), cm = new Set(cur.map(u => u.key));
    /* LCS по ключам; для очень больших файлов — только общие ключи как опорные точки */
    const anchorsA = [], anchorsB = [];
    if (n * m <= 4e6) {
      const W = m + 1, dp = new Uint16Array((n + 1) * W);
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
        dp[i * W + j] = prev[i] === cur[j].key ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
      let i = 0, j = 0;
      while (i < n && j < m) {
        if (prev[i] === cur[j].key) { anchorsA.push(i); anchorsB.push(j); i++; j++; }
        else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++; else j++;
      }
    } else { let j0 = -1; prev.forEach((k, i) => { const j = cur.findIndex((u, jj) => jj > j0 && u.key === k); if (j >= 0) { anchorsA.push(i); anchorsB.push(j); j0 = j; } }); }
    anchorsA.push(n); anchorsB.push(m);
    let pa = 0, pb = 0;
    for (let a = 0; a < anchorsA.length; a++) {
      const A = [], B = [];
      for (let i = pa; i < anchorsA[a]; i++) if (!cm.has(prev[i])) A.push(prev[i]);
      for (let j = pb; j < anchorsB[a]; j++) if (!pm.has(cur[j].key)) B.push(cur[j]);
      /* прежние строки с переводом ищут себе изменённую пару в этом промежутке */
      const used = new Set();
      for (const ka of A) {
        const olds = tl.langs.map(l => (tl.rec[l.id] || {})[ka]).filter(Boolean);
        if (!olds.length) continue;
        const oldSrc = (olds.find(r => r.src) || {}).src || '';
        let best = null, bs = 0;
        for (const b of B) { if (used.has(b.key)) continue; const sc = oldSrc ? tlSim(oldSrc, b.src) : 0; if (sc > bs) { bs = sc; best = b; } }
        if (!best && A.length === 1 && B.length === 1 && !used.has(B[0].key)) best = B[0];
        if (!best || (bs < 0.4 && !(A.length === 1 && B.length === 1))) continue;
        used.add(best.key);
        for (const l of tl.langs) { const rs = tl.rec[l.id]; if (rs && rs[ka] && !rs[best.key]) { rs[best.key] = rs[ka]; delete rs[ka]; } }
      }
      pa = anchorsA[a] + 1; pb = anchorsB[a] + 1;
    }
  }
  for (const fid of Object.keys(tl.idx)) if (!live.has(fid)) { delete tl.idx[fid]; changed = true; }
  return changed;
}
/** Записи перевода, для которых строки уже нет (удалена или переписана целиком). */
function tlOrphans(units) {
  const keys = new Set(units.map(u => u.key)), out = [];
  for (const l of P.tl.langs) for (const k of Object.keys(P.tl.rec[l.id] || {})) if (!keys.has(k)) out.push({ lang: l.id, key: k });
  return out;
}

/* ---------- сборка: постоянные id в скриптах и файлы tl ---------- */
/** Для файла: сканирует исходные строки и выдаёт репликам постоянные id. */
function tlPrepare(F, used) {
  F.tl = tlScan(F.lines);
  const at = new Map();
  for (const u of F.tl) {
    if (!u.idOk) continue;
    const base = cmpIdent(F.label, 'tl') + '_' + tlH2(F.f.id + '.' + u.k);
    let id = base, k = 2; while (used.has(id)) id = base + '_' + k++;
    used.add(id); u.ident = id; at.set(u.li, u);
  }
  return at;
}
const tlWithId = (line, u) => line.slice(0, u.endCol) + ' id ' + u.ident + line.slice(u.endCol);

/** Файлы перевода для каждого языка + выбор языка в игре. c: { info, assetTarget, opt, add, fixFonts } */
function tlEmit(R, c) {
  const langs = P.tl.langs;
  if (!langs.length) return;
  const objUnits = tlUnits({ scripts: false }).list;
  const minRank = { draft: 0, review: 1, done: 2 }[c.opt.tlMin] || 0;
  const rank = r => (r.s === 'done' ? 2 : r.s === 'review' ? 1 : 0);
  const okRec = r => !!(r && r.t && r.t.trim() && rank(r) >= minRank);
  const bar = '# ' + '─'.repeat(62);
  const hdr = name => [bar, '#  ' + name, '#  ' + t('cmp.hdr.gen'), bar, ''];
  for (const L of langs) {
    const rs = tlRecs(L.id);
    const S = { total: 0, done: 0, miss: 0, stale: 0, warn: 0, nofile: 0, voice: 0, held: 0, conflict: 0, strLines: 0 };
    const strs = new Map();
    const addStr = (u, r, note) => {
      S.total++;
      if (!okRec(r)) { S.miss++; if (r && r.t && r.t.trim()) S.held++; return; }
      if (tlStale(r, u)) S.stale++;
      if (tlWarns(u.src, r.t).length) S.warn++;
      const old = tlOldLit(u), nw = tlNewLit(u, c.fixFonts(r.t), '"');
      if (!old || old === nw) { S.done++; return; }
      const ex = strs.get(old);
      if (ex) { if (ex.nw !== nw) S.conflict++; return; }
      strs.set(old, { nw, note }); S.done++;
    };
    for (const I of c.info.values()) for (const F of I.files) {
      if (!F.tl || !F.tl.length) continue;
      const B = [];
      for (const u of F.tl) {
        const key = 's.' + F.f.id + '.' + u.k, r = rs[key];
        const unit = { key, src: u.body, lit: 'raw', q: u.q };
        if (!u.idOk) { S.strLines++; addStr(unit, r, (u.who ? u.who + ' ' : '') + F.f.title); continue; }
        S.total++;
        const hasText = okRec(r);
        let vline = '';
        if (r && r.v) {
          const a = P.assets.find(x => x.id === r.v), tg = a && c.assetTarget.get(a.id + '|');
          if (tg) { vline = '    voice ' + pyStr(tg); S.voice++; } else { S.nofile++; }
        }
        if (!hasText && !vline) { S.miss++; if (r && r.t && r.t.trim()) S.held++; continue; }
        if (hasText && tlStale(r, unit)) S.stale++;
        if (hasText && tlWarns(u.body, r.t).length) S.warn++;
        if (hasText) S.done++; else S.miss++;
        const txt = hasText ? tlFixRaw(c.fixFonts(r.t), u.q) : u.body;
        B.push('', `translate ${L.code} ${u.ident}:`, '', `    # ${(u.who ? u.who + u.attrs + ' ' : '') + u.q + u.body + u.q}`);
        if (vline) B.push(vline);
        B.push(`    ${u.who ? u.who + u.attrs + ' ' : ''}${u.q}${txt}${u.q}`);
      }
      if (B.length) {
        const K = hdr(L.name + ' — ' + (F.f.title || F.fname));
        R.files.push({ path: `game/tl/${L.code}/${I.dir}__${F.fname}`, text: K.concat(B.slice(1)).join('\n') + '\n', tl: true });
      }
    }
    for (const u of objUnits) addStr(u, rs[u.key], u.group);
    if (strs.size) {
      const K = hdr(L.name + ' — ' + t('tl.f.strings'));
      K.push(`translate ${L.code} strings:`, '');
      for (const [old, v] of strs) K.push(`    old "${old}"`, `    new "${v.nw}"`, '');
      R.files.push({ path: `game/tl/${L.code}/strings.rpy`, text: K.join('\n').replace(/\s+$/, '') + '\n', tl: true });
    }
    /* отчёт */
    if (!S.done && !S.voice) c.add('warn', t('tl.rep.none', L.name));
    else c.add('info', t('tl.rep.sum', L.name, S.done, S.total));
    if (S.miss && (S.done || S.voice)) c.add('info', t('tl.rep.miss', L.name, S.miss));
    if (S.held) c.add('info', t('tl.rep.held', L.name, S.held));
    if (S.stale) c.add('warn', t('tl.rep.stale', L.name, S.stale));
    if (S.warn) c.add('warn', t('tl.rep.warn', L.name, S.warn));
    if (S.conflict) c.add('warn', t('tl.rep.conflict', L.name, S.conflict));
    if (S.nofile) c.add('warn', t('tl.rep.nofile', L.name, S.nofile));
  }
  /* выбор языка в игре */
  const K = hdr(t('tl.f.langs'));
  K.push(...t('tl.rpy.how').split('\n').map(l => '# ' + l), '');
  const lbl = s => pyStr(String(s).replace(/\[/g, '[[').replace(/\{/g, '{{'));
  K.push('screen language_picker():', '    vbox:', '        spacing 4', `        textbutton ${lbl(P.tl.base || t('tl.base.default'))} action Language(None)`);
  for (const L of langs) K.push(`        textbutton ${lbl(L.name)} action Language(${pyStr(L.code)})`);
  R.files.push({ path: 'game/languages.rpy', text: K.join('\n') + '\n' });
  c.add('info', t('tl.rep.picker'));
}

/* ---------- CSV для внешних переводчиков ---------- */
function csvEsc(x) { x = String(x == null ? '' : x); return /[",;\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }
function tlCsv(langId) {
  const { list } = tlUnits(), rs = tlRecs(langId);
  const rows = [['key', 'block', 'who', 'source', 'translation', 'status', 'voice']];
  for (const u of list) {
    const r = rs[u.key], a = r && r.v ? P.assets.find(x => x.id === r.v) : null;
    rows.push([u.key, u.group, u.who, u.src, r ? r.t : '', r && r.t && r.t.trim() ? (r.s || 'draft') : '', a ? a.name : '']);
  }
  return '﻿' + rows.map(r => r.map(csvEsc).join(',')).join('\r\n') + '\r\n';
}
function csvParse(text) {
  text = String(text).replace(/^﻿/, '');
  const head = text.split(/\r?\n/, 1)[0] || '';
  const sep = (head.match(/;/g) || []).length > (head.match(/,/g) || []).length ? ';' : (head.includes('\t') && !head.includes(',') ? '\t' : ',');
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"' && cur === '') q = true;
    else if (c === sep) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); if (row.some(x => x !== '')) rows.push(row); }
  return rows;
}
const TL_STATUS_WORDS = { draft: 'draft', review: 'review', done: 'done', 'черновик': 'draft', 'на проверку': 'review', 'проверка': 'review', 'готово': 'done' };
/** Применяет CSV к языку. Возвращает { updated, skipped, unknown }. */
function tlImportCsv(langId, text) {
  const rows = csvParse(text);
  const out = { updated: 0, skipped: 0, unknown: 0 };
  if (rows.length < 2) return out;
  const hd = rows[0].map(x => x.trim().toLowerCase());
  const ci = n => hd.indexOf(n);
  const kI = ci('key'), tI = ci('translation'), sI = ci('status'), srcI = ci('source');
  if (kI < 0 || tI < 0) return Object.assign(out, { bad: true });
  const { byKey } = tlUnits();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i], u = byKey.get((r[kI] || '').trim());
    if (!u) { out.unknown++; continue; }
    const txt = r[tI] == null ? '' : r[tI];
    const cur = tlRec(langId, u.key);
    const sw = sI >= 0 ? TL_STATUS_WORDS[String(r[sI] || '').trim().toLowerCase()] || '' : '';
    if (!txt.trim() || (cur && cur.t === txt && (!sw || sw === (cur.s || 'draft')))) { out.skipped++; continue; }
    const rec = tlRec(langId, u.key, true);
    rec.t = txt;
    rec.s = sw || rec.s || 'draft';
    rec.src = srcI >= 0 && r[srcI] !== undefined && r[srcI] !== u.src ? (r[srcI] || '') : u.src;   // переводили по старому исходнику → строка будет помечена
    out.updated++;
  }
  if (out.updated) commit(true);
  return out;
}

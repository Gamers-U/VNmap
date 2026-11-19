'use strict';
/* ====== Поиск, статистика/концовки, экспорт/импорт, настройки, справка ====== */

/* ---------- поиск ---------- */
function markText(text, q) {
  text = String(text || ''); const low = text.toLowerCase(), i = q ? low.indexOf(q) : -1;
  if (i < 0) return [text];
  return [text.slice(0, i), h('mark', text.slice(i, i + q.length)), text.slice(i + q.length)];
}
function snippetOf(text, q) {
  const low = text.toLowerCase(), i = low.indexOf(q);
  if (i < 0) return text.slice(0, 90);
  const a = Math.max(0, i - 36), b = Math.min(text.length, i + q.length + 56);
  return (a > 0 ? '…' : '') + text.slice(a, b).replace(/\s+/g, ' ') + (b < text.length ? '…' : '');
}
/* поиск по всему проекту и палитра команд (Ctrl+K) вынесены в palette.js */

/* ---------- статистика, трекер концовок ---------- */
function openStats() {
  closePopover();
  openModal({
    cls: 'stats-m', build: m => {
      const body = h('div', { class: 'm-pad scroll' });
      const render = () => {
        body.replaceChildren();
        const st = projectStats();
        const tile = (v, l) => h('div', { class: 'tile' }, h('div', { class: 'tile-v' }, String(v)), h('div', { class: 'tile-l' }, l));
        const bar = h('div', { class: 'stack-bar big' });
        STATUSES.forEach(s => { if (st.by[s]) bar.append(h('span', { style: { width: (st.by[s] / st.files * 100) + '%', background: palColor(STATUS_COLOR[s]) }, 'data-tip': t('status.' + s) + ': ' + st.by[s] })); });
        body.append(
          h('div', { class: 'mx-line' }, h('span', { class: 'hint' }, mxLine()), h('button', { class: 'btn sm', 'data-tip': t('sh.tip'), onclick: () => { m.close(); setTimeout(openStatsHub, 0); } }, t('mx.more'))),
          st.files ? bar : null,
          st.files ? h('div', { class: 'prog-legend' }, STATUSES.map(s => h('span', { class: 'lg' }, h('span', { class: 'sdot', style: { background: palColor(STATUS_COLOR[s]) } }), t('status.' + s) + ': ' + st.by[s]))) : null);
        // концовки
        const ends = P.nodes.filter(n => n.type === 'ending');
        const sec = h('div', { class: 'card-sec' });
        const got = ends.filter(n => P.sim.reached[n.id]).length;
        sec.append(h('div', { class: 'sec-head' }, icon('flag', 16), h('b', t('stats.endings')), h('span', { class: 'count' }, got + '/' + ends.length), h('div', { class: 'grow' }),
          h('button', { class: 'btn sm', onclick: () => { resetSim(); commit(true); renderNodes(); render(); } }, t('stats.reset'))), h('div', { class: 'hint' }, t('stats.endings.hint')));
        if (!ends.length) sec.append(h('div', { class: 'empty small' }, t('stats.endings.none')));
        ends.forEach(n => {
          const us = unlockState(n), reached = !!P.sim.reached[n.id];
          const cb = h('button', { class: 'check' + (reached ? ' on' : ''), role: 'checkbox', 'aria-checked': String(reached), onclick: () => { if (P.sim.reached[n.id]) delete P.sim.reached[n.id]; else P.sim.reached[n.id] = true; commit(true); renderNodes(); render(); } }, reached ? icon('check', 14, 3) : null);
          sec.append(h('div', { class: 'end-row' }, cb, h('span', { class: 'dot big', style: { background: palColor(n.color) } }), h('span', { class: 'end-n', onclick: () => { m.close(); focusNode(n.id); } }, n.title),
            us ? h('span', { class: 'lock-badge ' + (us.ok ? 'ok' : '') }, icon(us.ok ? 'unlock' : 'lock', 13), t('stats.unlock', us.have, us.need, us.total)) : null));
        });
        // блоки
        const tb = h('div', { class: 'card-sec' });
        tb.append(h('div', { class: 'sec-head' }, icon('layers', 16), h('b', t('stats.byblock'))));
        P.nodes.filter(n => n.type !== 'note').forEach(n => {
          const pr = nodeProgress(n);
          tb.append(h('div', { class: 'blk-row', onclick: () => { m.close(); focusNode(n.id); } }, h('span', { class: 'dot big', style: { background: palColor(n.color) } }), h('span', { class: 'end-n' }, n.title),
            h('span', { class: 'meter' }, h('span', { style: { width: Math.round(pr.pct * 100) + '%', background: palColor(n.color) } })), h('span', { class: 'blk-c' }, pr.done + '/' + pr.total)));
        });
        body.append(sec, tb);
      };
      render();
      return h('div', { class: 'm-wrap' }, modalHead(t('stats.title'), m), body);
    }
  });
}

/* ---------- ZIP (без сжатия) ---------- */
const CRC_T = (() => { const tb = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tb[n] = c >>> 0; } return tb; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), chunks = [], central = [];
  let offset = 0;
  const d = new Date();
  const dosTime = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  for (const f of files) {
    const nameB = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nameB.length, true); lh.setUint16(28, 0, true);
    chunks.push(new Uint8Array(lh.buffer), nameB, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nameB.length, true);
    ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nameB);
    offset += 30 + nameB.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

/* ---------- экспорт ---------- */
function buildExportSVG(themeName) {
  const pl = THEMES[themeName] || pal();
  const bb = nodesBBox(P.nodes) || { x0: 0, y0: 0, x1: 400, y1: 300 };
  let { x0, y0, x1, y1 } = bb;
  const els = [];
  for (const e of P.edges) {
    const G = edgeGeom(e); if (!G) continue;
    x0 = Math.min(x0, G.mid[0] - 110); x1 = Math.max(x1, G.mid[0] + 110); y0 = Math.min(y0, G.mid[1] - 20); y1 = Math.max(y1, G.mid[1] + 20);
    const el = buildEdge(e, pl, false); if (el) els.push(el);
  }
  const m = 60; x0 -= m; y0 -= m; x1 += m; y1 += m;
  const w = Math.round(x1 - x0), hh = Math.round(y1 - y0);
  const svgEl = s('svg', { xmlns: SVGNS, viewBox: `${r2(x0)} ${r2(y0)} ${w} ${hh}`, width: w, height: hh, 'font-family': FONT_FAMILY });
  svgEl.append(s('title', {}, P.name));
  svgEl.append(s('rect', { x: r2(x0), y: r2(y0), width: w, height: hh, fill: pl.canvas }));
  els.forEach(e => svgEl.append(e));
  P.nodes.forEach(n => svgEl.append(buildNode(n, pl, false)));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svgEl);
}
const projFile = ext => slug(P.name) + ext;
function exportSVG(themeName) { closePopover(); saveFile(projFile('.svg'), buildExportSVG(themeName || S.theme), 'image/svg+xml'); }
async function exportJSON() {
  closePopover(); flushHistory();
  let ok;
  if (hasAnyFiles()) {
    try { ok = await saveFile(projFile('.vnmap.zip'), await backupZipBlob(), 'application/zip'); }
    catch (e) { toast(t('bld.fail'), 4000); return; }
  } else ok = await saveFile(projFile('.vnmap.json'), JSON.stringify(P, null, 1), 'application/json');
  if (ok) { UI.lastBackup = Date.now(); lsSet(LS_B, String(UI.lastBackup)); updateStatus(); }
}
function exportMap() { closePopover(); saveFile(projFile('.md'), storyMapMd(), 'text/markdown'); }
function importJSONFile() {
  closePopover();
  const inp = h('input', { type: 'file', accept: '.vnmap,.json,.zip,application/json,application/zip' });
  inp.addEventListener('change', () => { if (inp.files[0]) readImport(inp.files[0]); });
  inp.click();
}
async function readImport(file, opts = {}) {
  let p, blobs = [];
  try {
    if (/\.zip$/i.test(file.name) || await isZipFile(file)) { const r = await readBackupZip(file); p = r.project; blobs = r.blobs; }
    else p = JSON.parse(await file.text());
  } catch (e) { toast(t('imp.bad'), 4000); return false; }
  if (!p || !Array.isArray(p.nodes)) { toast(t('imp.bad'), 4000); return false; }
  if (!opts.noConfirm) {
    const ok = await confirmDlg({ title: t('imp.q'), text: t('imp.t', p.name || file.name, p.nodes.length), ok: t('imp.ok'), danger: true });
    if (!ok) return false;
  }
  for (const b of blobs) await blobPut(b.bid, b.blob);
  setProject(normalize(p)); fitAll(false); toast(t('imp.done'));
  return true;
}
function setProject(p) {
  if (typeof snBeforeReplace === 'function') snBeforeReplace();
  if (typeof CL !== 'undefined' && CL.on) { collabDisable(); toast(t('col.off.replaced'), 6000); }
  if (typeof deskUnbind === 'function') deskUnbind();
  P = p; reindex(); UI.sel.clear(); UI.edge = null; resetHistory(); saveNow();
  if (typeof satProjectReplaced === 'function') satProjectReplaced();
  onProjectReplaced();
  if (typeof driveProjectChanged === 'function') driveProjectChanged();
  if (typeof ghProjectChanged === 'function') ghProjectChanged();
}
async function newProject(demo) {
  closePopover();
  if (P.nodes.length && !(await confirmDlg({ title: t(demo ? 'proj.demo.q' : 'proj.new.q'), text: t('proj.new.t'), ok: t(demo ? 'proj.demo' : 'proj.new'), danger: true }))) return;
  setProject(demo ? demoProject() : emptyProject());
  fitAll(false);
  if (!demo) toast(t('proj.new.done'));
}

/* ---------- настройки ---------- */
function openSettings() { openSettingsWindow(); }

/* ---------- справка ---------- */
const HELP_ICONS = ['fit', 'layers', 'fork', 'file', 'code', 'chat', 'search', 'save', 'box', 'folder', 'new', 'cloud', 'flag', 'sparkles', 'badge', 'globe', 'users', 'home', 'wand', 'link'];
const HELP_GROUPS = [[['Карта и блоки', 'Map and blocks'], [0, 1, 2]], [['Главы и текст', 'Chapters and text'], [3, 4, 5, 18, 12, 13]],
  [['Ресурсы и игра', 'Assets and the game'], [6, 8, 9, 7]], [['Команда и перевод', 'Team and translation'], [14, 15, 16]], [['Программа и сохранение', 'App and saving'], [10, 11, 17, 19]]];
const HELP_TAB_LS = 'vnmap.help.tab';
/** Текст справки: `код` выделяется, найденные слова подсвечиваются. */
function helpRich(text, q) {
  const re = q ? new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig') : null;
  const marks = str => (re ? str.split(re).map((x, i) => (i % 2 ? h('mark', x) : x)) : [str]);
  return String(text).split('`').map((seg, i) => (i % 2 ? h('code', marks(seg)) : marks(seg)));
}
/** Шаги «1) … 2) … 3) …» внутри абзаца идут с новой строки, чтобы их было видно. */
function helpSteps(text, q) {
  const parts = String(text).split(/\s+(?=\d{1,2}\)\s)/);
  if (parts.length < 3) return helpRich(text, q);
  return parts.map((x, i) => [i ? h('br') : null, helpRich(x, q)]);
}
/** Делит абзац справки на заголовок и текст: «Быстрый старт. 1) …», «Заметки: стикер на блоке …», «Рецепты (1.6.8): …».
    Заголовок короткий и без кода; если такого нет, абзац остаётся как есть. */
function helpSplit(text) {
  const s = String(text);
  let m = s.match(/^([^.:\n`«»]{2,56}?)(?:\s*\((\d+\.\d+(?:\.\d+)?)\))?:\s+(\S[\s\S]*)$/);
  if (m) return { title: m[1].trim(), ver: m[2] || '', sep: ':', rest: m[3] };
  m = s.match(/^([^.:\n`]{3,52}(?:\([^)\n]{1,40}\))?)\.\s+(\S[\s\S]*)$/);
  if (m) return { title: m[1].trim(), ver: '', sep: '.', rest: m[2] };
  return { title: '', ver: '', sep: '', rest: s };
}
Object.assign(D, {
  'help.zo': ['Мельче текст', 'Smaller text'], 'help.zi': ['Крупнее текст', 'Larger text'],
  'help.where': ['Где на экране', 'Where on screen'], 'help.where.tip': ['Подсветить на экране, где лежит эта функция', 'Highlight on the screen where this function lives'],
});
/** Функция «Инструментов», о которой абзац справки: ищется по названию в начале («Таблица реплик…», «Свой код проекта (1.6.9): …»). */
const HELP_ALIAS = [['импорт сценария', 'rpyimport'], ['заметки', 'notes'], ['уведомления', 'notify'], ['интерфейс игры', 'gui'], ['notes', 'notes'], ['notifications', 'notify'], ['game interface', 'gui']];
function helpToolOf(text) {
  if (typeof TOOL_ITEMS === 'undefined') return null;
  const s = String(text).trim();
  const m = s.match(/^[«"“]([^»"”\n]{3,60})[»"”]/) || s.match(/^([^.:(«»`\n]{3,50}?)\s*(?:\(|:|\.\s)/);
  if (!m) return null;
  const lead = m[1].replace(/…$/, '').trim().toLowerCase();
  if (lead.length < 5) return null;
  const al = HELP_ALIAS.find(a => lead.startsWith(a[0]));
  if (al) return TOOL_ITEMS.find(it => it.id === al[1]) || null;
  return TOOL_ITEMS.find(it => { const n = String(t(it.key)).replace(/…$/, '').trim().toLowerCase(); return n === lead || (lead.length >= 8 && n.startsWith(lead)) || (n.length >= 6 && lead.startsWith(n)); }) || null;
}
const helpToolName = it => String(t(it.key)).replace(/…$/, '');
/** Урок «Обучения» для функции: по нему показывается, где она лежит на экране, и ведётся практика. */
const helpLessonOf = it => (it && typeof TOUR_LESSONS !== 'undefined' && TOUR_LESSONS.find(l => l.tool === it.id)) || null;
/** Крупность текста справки и обучения: кнопки «A−» и «A+» в шапке, выбор помнится. */
const HELP_Z_LS = 'vnmap.help.z', HELP_Z = [0.92, 1, 1.15, 1.3, 1.5];
function helpZoomCtl(host) {
  let z = parseInt(lsGet(HELP_Z_LS), 10); if (!(z >= 0 && z < HELP_Z.length)) z = 1;
  const apply = () => { host.style.setProperty('--hz', String(HELP_Z[z])); lsSet(HELP_Z_LS, String(z)); out.disabled = z === 0; big.disabled = z === HELP_Z.length - 1; };
  const out = h('button', { class: 'icon-btn help-z', id: 'help-zo', type: 'button', 'data-tip': t('help.zo'), onclick: () => { if (z > 0) { z--; apply(); } } }, h('span', { class: 'help-za' }, 'A\u2212'));
  const big = h('button', { class: 'icon-btn help-z big', id: 'help-zi', type: 'button', 'data-tip': t('help.zi'), onclick: () => { if (z < HELP_Z.length - 1) { z++; apply(); } } }, h('span', { class: 'help-za' }, 'A+'));
  apply();
  return h('div', { class: 'help-zs' }, out, big);
}
function openHelp(focus) {
  closePopover();
  const secs = tx('help.sections'), keys = tx('help.keys'), L = S.lang === 'en' ? 1 : 0;
  const all = secs.map((sec, i) => ({ id: String(i), h: sec.h, items: sec.items, ic: HELP_ICONS[i] || 'help' }));
  all.push({ id: 'keys', h: t('help.keys.h'), keys, ic: 'zap' });
  const byId = new Map(all.map(x => [x.id, x]));
  const groups = HELP_GROUPS.map(g => ({ title: g[0][L], ids: g[1].map(String) })).filter(g => g.ids.every(id => byId.has(id)));
  const placed = new Set(groups.flatMap(g => g.ids));
  const rest = all.filter(x => x.id !== 'keys' && !placed.has(x.id)).map(x => x.id);        // раздел, которого нет в группах, не теряем
  if (rest.length) groups.push({ title: t('help.other'), ids: rest });
  groups.push({ title: t('help.ref'), ids: ['keys'] });
  const st = { q: '', cur: lsGet(HELP_TAB_LS) || '0' };
  if (focus === 'editor') { const hit = all.find(x => /^(Редактор текста|Text editor)$/.test(x.h)); if (hit) st.cur = hit.id; }
  if (!byId.has(st.cur)) st.cur = '0';
  const textOf = x => (x.h + ' ' + (x.items ? x.items.join(' ') : x.keys.map(k => k.join(' ')).join(' '))).toLowerCase();
  const match = x => !st.q || textOf(x).includes(st.q.toLowerCase());
  const nav = h('nav', { class: 'help-nav' }), view = h('div', { class: 'help-view' }), cnt = h('div', { class: 'help-count hint' });
  const search = h('input', { class: 'inp help-q', type: 'search', placeholder: t('help.search'), id: 'help-q', spellcheck: 'false', autocomplete: 'off' });
  const visibleIds = () => groups.flatMap(g => g.ids).filter(id => match(byId.get(id)));
  const go = id => { st.cur = id; lsSet(HELP_TAB_LS, id); paint(); view.scrollTop = 0; };
  const paint = () => {
    const vis = new Set(visibleIds());
    if (vis.size && !vis.has(st.cur)) st.cur = [...vis][0];
    nav.replaceChildren();
    groups.forEach(g => {
      const ids = g.ids.filter(id => vis.has(id)); if (!ids.length) return;
      nav.append(h('div', { class: 'help-g' }, g.title));
      ids.forEach(id => { const x = byId.get(id); nav.append(h('button', { class: 'help-tab' + (id === st.cur ? ' on' : ''), onclick: () => go(id) }, icon(x.ic, 16), h('span', x.h))); });
    });
    nav.append(h('div', { class: 'help-g' }, t('help.learn')), h('button', { class: 'help-learn', id: 'help-tour', 'data-tip': t('tour.btn.tip'), onclick: () => { st.m.close(); setTimeout(() => openTour(), 0); } }, icon('sparkles', 16), h('span', t('tour.btn'))));
    cnt.textContent = st.q ? t('help.found', vis.size) : '';
    view.replaceChildren();
    if (!vis.size) { view.append(h('div', { class: 'empty' }, t('help.none'))); return; }
    const x = byId.get(st.cur), order = [...vis], at = order.indexOf(st.cur);
    view.append(h('div', { class: 'help-card' }, h('div', { class: 'help-h' }, h('span', { class: 'help-ic' }, icon(x.ic, 20)), h('h2', helpRich(x.h, st.q)))));
    const card = view.firstChild;
    if (x.items) {
      const parts = x.items.map(helpSplit), tools = x.items.map(helpToolOf);
      const ps = parts.map((pt, i) => {
        const it = tools[i], body = [];
        if (pt.title) body.push(h('b', { class: 'help-lead' }, helpRich(pt.title, st.q), pt.sep), pt.ver ? h('span', { class: 'help-ver' }, 'v' + pt.ver) : null, ' ', helpSteps(pt.rest, st.q));
        else {
          const q = it && pt.rest.match(/^([«"“][^»"”\n]{3,60}[»"”])([\s\S]*)$/);                 // «Название…» в начале абзаца: выделяем как заголовок
          const q2 = it && !q && pt.rest.match(/^([^.:(«»`\n]{3,50}?)(\s*[(:][\s\S]*)$/);          // «Статистика (кнопка …)»: название функции тоже заголовок
          if (q) body.push(h('b', { class: 'help-lead' }, helpRich(q[1], st.q)), helpSteps(q[2], st.q));
          else if (q2) body.push(h('b', { class: 'help-lead' }, helpRich(q2[1], st.q)), helpSteps(q2[2], st.q));
          else body.push(helpSteps(pt.rest, st.q));
        }
        if (!it) return h('p', { class: 'help-p', id: 'help-p-' + i }, body);
        const l = helpLessonOf(it), back = () => { lsSet(HELP_TAB_LS, st.cur); setTimeout(() => openHelp(), 0); };
        const acts = h('div', { class: 'help-acts' },
          l ? h('button', { class: 'btn sm help-where', type: 'button', 'data-tool': it.id, 'data-tip': t('help.where.tip'), onclick: () => { st.m.close(); setTimeout(() => tlSpotlight(l, back), 80); } }, icon('target', 14), t('help.where')) : null,
          h('button', { class: 'btn sm help-open', type: 'button', 'data-tool': it.id, onclick: () => { st.m.close(); tlOpen(l || { tool: it.id }); } }, icon('play', 14), t('tour.open')),
          l && typeof tlWalkOf === 'function' && tlWalkOf(l) ? h('button', { class: 'btn sm help-walk', type: 'button', 'data-tool': it.id, 'data-tip': t('tour.walk.tip'), onclick: () => { st.m.close(); setTimeout(() => tlWalkRun(l), 120); } }, icon('target', 14), t('tour.walk')) : null);
        return h('div', { class: 'help-p help-tool', id: 'help-p-' + i, 'data-tool': it.id }, h('span', { class: 'help-tic' }, icon(it.ic || 'help', 20)), h('div', { class: 'help-tbody' }, h('p', { class: 'help-tp' }, body), acts));
      });
      const heads = parts.map((pt, i) => ({ i, it: tools[i], title: tools[i] ? helpToolName(tools[i]) : pt.title })).filter(z => z.title);
      if (parts.length >= 6 && heads.length >= 4) {                                    // длинный раздел: оглавление со значками, чтобы не листать всё подряд
        card.append(h('div', { class: 'help-toc' }, h('div', { class: 'help-toc-h' }, t('help.toc')),
          h('div', { class: 'help-toc-l' }, heads.map(z => h('button', { class: 'help-toc-b', type: 'button', onclick: () => { const el = view.querySelector('#help-p-' + z.i); if (el) { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1500); } } }, icon(z.it ? (z.it.ic || 'help') : 'chevR', 15), z.title)))));
      }
      card.append(...ps);
    }
    else card.append(h('div', { class: 'keys' }, x.keys.map(([k, d]) => h('div', { class: 'key-row' }, h('span', k.split('+').map((z, i) => [i ? '+' : '', h('kbd', z)])), h('span', { class: 'key-d' }, helpRich(d, st.q))))));
    view.append(h('div', { class: 'help-pn' },
      at > 0 ? h('button', { class: 'btn', onclick: () => go(order[at - 1]) }, icon('chevL', 15), byId.get(order[at - 1]).h) : h('span'),
      at < order.length - 1 ? h('button', { class: 'btn', onclick: () => go(order[at + 1]) }, byId.get(order[at + 1]).h, icon('chevR', 15)) : h('span')));
    const on = nav.querySelector('.help-tab.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  search.addEventListener('input', () => { st.q = search.value.trim(); paint(); });
  search.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = visibleIds(); if (v.length && !v.includes(st.cur)) go(v[0]); } });
  openModal({
    cls: 'help-m', build: m => {
      st.m = m; paint();
      setTimeout(() => { if (window.matchMedia && matchMedia('(pointer:fine)').matches) search.focus(); }, 60);
      const body = h('div', { class: 'help-body' }, nav, view);
      return h('div', { class: 'm-wrap' }, modalHead(t('help.title'), m, [h('div', { class: 'help-sw' }, icon('search', 15), search, cnt), helpZoomCtl(body)]), body);
    }
  });
}

'use strict';
/* ====== Журнал прохождений и тепловая карта ======
   Каждое прохождение (в плеере программы или в HTML-игре у тестера) записывается как короткий журнал: по каким блокам шёл игрок, что выбирал,
   сколько времени провёл и чем закончил. Журналы можно собрать вместе и увидеть на карте, где игроки бросают игру, какие ветки выбирают и сколько читают. */

Object.assign(D, {
  'lg.btn': ['Журнал прохождений и тепловая карта', 'Playthrough log and heat map'],
  'lg.title': ['Журнал прохождений', 'Playthrough log'],
  'lg.intro': ['Здесь собираются прохождения: ваши в плеере и присланные тестерами (файлы журнала). По ним карта показывает, до каких блоков доходят игроки, где бросают игру, что выбирают и сколько читают.', 'Playthroughs are collected here: yours from the player and the ones sent by testers (log files). The map then shows which blocks players reach, where they quit, what they pick and how long they read.'],
  'lg.rec': ['Записывать мои прохождения в плеере', 'Record my playthroughs in the player'],
  'lg.import': ['Добавить журналы…', 'Add logs…'], 'lg.export': ['Сохранить все журналы', 'Save all logs'], 'lg.clear': ['Очистить', 'Clear'],
  'lg.clear.q': ['Удалить все журналы прохождений этого проекта?', 'Delete all playthrough logs of this project?'], 'lg.clear.t': ['Журналы хранятся только на этом устройстве. Если нужны, сначала сохраните их файлом.', 'Logs are stored on this device only. Save them to a file first if you need them.'], 'lg.clear.ok': ['Удалить', 'Delete'],
  'lg.imported': ['Добавлено журналов: {0}{1}', 'Logs added: {0}{1}'], 'lg.imp.dup': [' (повторов пропущено: {0})', ' ({0} duplicates skipped)'], 'lg.imp.bad': ['Файл «{0}» не похож на журнал прохождений.', '“{0}” does not look like a playthrough log.'],
  'lg.imp.other': ['Журналы другого проекта: блоки на карте могут не совпасть ({0})', 'Logs of another project: blocks may not match the map ({0})'],
  'lg.map.on': ['Показать на карте', 'Show on the map'], 'lg.map.off': ['Убрать с карты', 'Hide from the map'],
  'lg.m.reach': ['Дошли', 'Reached'], 'lg.m.drop': ['Бросили здесь', 'Quit here'], 'lg.m.time': ['Время в блоке', 'Time in block'],
  'lg.m.reach.t': ['Сколько прохождений дошло до блока', 'How many playthroughs reached the block'], 'lg.m.drop.t': ['Где прохождение оборвалось, не дойдя до конца', 'Where a playthrough stopped before an ending'], 'lg.m.time.t': ['Сколько в среднем игрок проводит в блоке', 'Average time a player spends in the block'],
  'lg.legend': ['Тепловая карта: {0} · прохождений: {1}', 'Heat map: {0} · playthroughs: {1}'], 'lg.legend.off': ['Выключить', 'Turn off'], 'lg.legend.open': ['Журнал', 'Log'],
  'lg.c.n': ['Прохождений', 'Playthroughs'], 'lg.c.done': ['Дошли до конца', 'Finished'], 'lg.c.avg': ['Среднее время', 'Average time'], 'lg.c.ends': ['Концовки', 'Endings'], 'lg.c.ends.none': ['пока нет', 'none yet'],
  'lg.empty': ['Журналов пока нет. Пройдите новеллу в плеере («Играть») или добавьте журналы тестеров.', 'No logs yet. Play the novel in the player (“Play”) or add the testers’ logs.'],
  'lg.h.blocks': ['Блоки: где бросают и сколько читают', 'Blocks: where players quit and how long they read'],
  'lg.h.picks': ['Что выбирают на развилках', 'What players pick at forks'], 'lg.h.sess': ['Прохождения', 'Playthroughs'],
  'lg.col.block': ['Блок', 'Block'], 'lg.col.reach': ['Дошли', 'Reached'], 'lg.col.drop': ['Бросили', 'Quit'], 'lg.col.time': ['Время', 'Time'],
  'lg.sess.end': ['конец: {0}', 'ending: {0}'], 'lg.sess.endb': ['дошёл до конца', 'reached the end'], 'lg.sess.cut': ['не дошёл до конца (последний блок: {0})', 'did not finish (last block: {0})'],
  'lg.sess.who': ['Имя тестера (нажмите, чтобы изменить)', 'Tester name (click to change)'], 'lg.who.t': ['Чьё прохождение', 'Whose playthrough'],
  'lg.me': ['Я (плеер)', 'Me (player)'], 'lg.del': ['Удалить', 'Delete'], 'lg.focus': ['Показать на карте', 'Show on the map'],
  'lg.unk': ['блока нет на карте', 'block not on the map'],
  'lg.foot': ['Журнал хранится на этом устройстве и в файл проекта не попадает. Файл журнала (.vnlog.json) можно переслать: так собирают прохождения тестеров.', 'The log is stored on this device and is not part of the project file. A log file (.vnlog.json) can be passed around: that is how testers’ playthroughs are collected.'],
  'lg.pct': ['{0}%', '{0}%'], 'lg.of': ['{0} из {1}', '{0} of {1}'],
});

TOOL_ITEMS.push({ id: 'testlog', group: 'play', ic: 'flame', key: 'lg.btn', kw: 'log heat map heatmap testers playthrough statistics drop analytics журнал тепловая карта тестеры прохождения статистика бросили', run: () => openTestLog() });

TOOL_ITEMS.push({ id: 'whoami', group: 'team', ic: 'user', key: 'me.pick', kw: 'me who am i identity member author mine my blocks я кто я участник мои блоки авторство', run: () => openSettingsWindow('team'), menu: false });

const LG_MAX = 400;
const LG_CACHE = { uid: '', list: null, stats: null, ver: 0 };
const LGH = { on: false, metric: 'reach' };
const lgKey = () => 'vnmap.logs.v1.' + (P && P.uid || 'x');
const lgId = () => 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function lgLoad() {
  const uid = P && P.uid || '';
  if (LG_CACHE.list && LG_CACHE.uid === uid) return LG_CACHE.list;
  let list = [];
  try { const j = JSON.parse(lsGet(lgKey()) || '[]'); if (Array.isArray(j)) list = j.filter(lgValid); } catch (e) { list = []; }
  LG_CACHE.uid = uid; LG_CACHE.list = list; LG_CACHE.stats = null; return list;
}
function lgStore(list) {
  list.sort((a, b) => a.at - b.at);
  while (list.length > LG_MAX) list.shift();
  LG_CACHE.uid = P && P.uid || ''; LG_CACHE.list = list; LG_CACHE.stats = null; LG_CACHE.ver++;
  if (!lsSet(lgKey(), JSON.stringify(list))) { while (list.length > 20 && !lsSet(lgKey(), JSON.stringify(list))) list.splice(0, Math.ceil(list.length / 5)); }
  lgHeatRefresh();
}
const lgValid = L => L && typeof L === 'object' && Array.isArray(L.path) && L.path.every(p => p && typeof p.b === 'string' && Number.isFinite(+p.t)) && Number.isFinite(+L.at);

/** Сводка по всем журналам. */
function lgStats() {
  if (LG_CACHE.stats && LG_CACHE.stats.key === LG_CACHE.ver + '|' + (P && P.uid)) return LG_CACHE.stats;
  const logs = lgLoad(), nodes = new Map(), pairs = new Map(), picks = new Map(), ends = new Map();
  const nd = id => { let x = nodes.get(id); if (!x) { x = { reach: 0, visits: 0, left: 0, tsum: 0, tcnt: 0 }; nodes.set(id, x); } return x; };
  let done = 0, sec = 0;
  for (const L of logs) {
    const seen = new Set();
    L.path.forEach((p, i) => {
      const nx = L.path[i + 1], x = nd(p.b), dur = Math.max(0, (nx ? nx.t : (+L.sec || p.t)) - p.t);
      if (!seen.has(p.b)) { seen.add(p.b); x.reach++; }
      x.visits++; x.tsum += dur; x.tcnt++;
      if (nx) { const k = p.b + '>' + nx.b; pairs.set(k, (pairs.get(k) || 0) + 1); }
    });
    const last = L.path[L.path.length - 1];
    if (L.done) done++; else if (last) nd(last.b).left++;
    sec += +L.sec || 0;
    for (const pk of L.picks || []) { if (!pk || typeof pk.b !== 'string') continue; let m = picks.get(pk.b); if (!m) { m = new Map(); picks.set(pk.b, m); } const k = String(pk.text || ''); m.set(k, (m.get(k) || 0) + 1); }
    if (L.end && (L.end.key || L.end.title)) { const k = L.end.key || L.end.title; const e = ends.get(k) || { title: L.end.title || k, n: 0 }; e.n++; ends.set(k, e); }
  }
  let maxT = 0, maxPair = 0; nodes.forEach(x => { x.avg = x.tcnt ? x.tsum / x.tcnt : 0; if (x.avg > maxT) maxT = x.avg; }); pairs.forEach(c => { if (c > maxPair) maxPair = c; });
  const S_ = { key: LG_CACHE.ver + '|' + (P && P.uid), n: logs.length, done, avgSec: logs.length ? sec / logs.length : 0, nodes, pairs, picks, ends, maxT, maxPair };
  LG_CACHE.stats = S_; return S_;
}

/* ---------- запись из плеера ---------- */
const lgRecOn = () => S.logRec !== false;
function lgBegin(st) {
  lgFinish(st);
  st.log = { format: 'vnmap-log', v: 1, id: lgId(), uid: P.uid, project: P.name, who: gmWho(), at: Date.now(), sec: 0, done: false, end: null, path: [], picks: [], notes: [], src: isGame() ? 'html' : 'player', t0: Date.now(), pend: null, saved: false };
}
function lgLabel(st, lbl) {
  const L = st.log; if (!L || st.noLog || !st.byLabel) return;
  const hit = st.byLabel.get(lbl); if (!hit) return;
  const b = hit.b.id, last = L.path[L.path.length - 1];
  if (last && last.b === b) return;
  L.path.push({ b, t: Math.round((Date.now() - L.t0) / 100) / 10, title: hit.b.title });
  if (L.pend) { L.pend.to = b; L.pend = null; }
}
function lgPick(st, text) {
  const L = st.log; if (!L || !L.path.length) return;
  const pk = { b: L.path[L.path.length - 1].b, text: String(text || ''), to: null };
  L.picks.push(pk); L.pend = pk;
}
function lgNote(st, text, line) {
  const L = st.log; if (!L) return;
  const b = L.path.length ? L.path[L.path.length - 1] : null;
  const nt = { b: b ? b.b : '', t: Math.round((Date.now() - L.t0) / 100) / 10, text, line: line || '', title: b ? (b.title || '') : '' };
  (L.notes = L.notes || []).push(nt);
  if (L.saved) { const all = lgLoad().slice(), x = all.find(z => z.id === L.id); if (x) { x.notes = L.notes; lgStore(all); } }   // журнал уже записан: допишем замечание в него
}
function lgEnding(st, key, title) { const L = st.log; if (L) L.end = { key: key || '', title: title || '' }; }
function lgFinish(st, done) {
  const L = st && st.log; if (!L || L.saved) return;
  if (done) L.done = true;
  L.sec = Math.round((Date.now() - L.t0) / 100) / 10;
  if (!lgRecOn() || L.path.length < 2) { L.saved = true; return; }       // обрывок в один блок журналом не считается
  L.saved = true;
  const out = Object.assign({}, L); delete out.t0; delete out.pend; delete out.saved;
  const list = lgLoad().slice(); list.push(out); lgStore(list);
}

/* ---------- тепловая карта ---------- */
const LG_HUE = { reach: 152, drop: 12, time: 268 };
const lgCol = (metric, a, al) => 'hsla(' + LG_HUE[metric] + ',' + (metric === 'drop' ? 88 : 70) + '%,' + (62 - a * 18) + '%,' + al + ')';
function lgNodeVal(x, N, S_, metric) {
  if (!x) return { v: 0, txt: metric === 'reach' ? '0' : '' };
  if (metric === 'reach') return { v: N ? x.reach / N : 0, txt: x.reach + '/' + N };
  if (metric === 'drop') return { v: N ? x.left / N : 0, txt: x.left ? String(x.left) : '' };
  return { v: S_.maxT ? x.avg / S_.maxT : 0, txt: x.tcnt ? arClock(x.avg) : '' };
}
function lgHeatNode(id) {
  const el = NODE_EL.get(id), n = nodeById(id); if (!el || !n) return;
  el.querySelectorAll('.heat-mark').forEach(x => x.remove());
  if (!LGH.on || n.type === 'note') return;
  const S_ = lgStats(); if (!S_.n) return;
  const { w, h } = nodeSize(n), val = lgNodeVal(S_.nodes.get(id), S_.n, S_, LGH.metric);
  const a = Math.max(0, Math.min(1, val.v)), none = LGH.metric === 'reach' && !S_.nodes.get(id);
  const mk = s('g', { class: 'heat-mark', 'pointer-events': 'none' });
  mk.append(s('rect', { x: -5, y: -5, width: w + 10, height: h + 10, rx: 19, fill: none ? 'none' : lgCol(LGH.metric, a, (0.05 + a * 0.28).toFixed(2)), stroke: none ? 'hsla(0,0%,60%,.7)' : lgCol(LGH.metric, a, 0.95), 'stroke-width': none ? 2 : 2 + a * 3, 'stroke-dasharray': none ? '6 5' : null }));
  if (val.txt) {
    const tw = Math.max(26, textW(val.txt, 12, 700) + 16);
    mk.append(s('rect', { x: w - tw + 4, y: -22, width: tw, height: 20, rx: 10, fill: none ? 'hsl(0,0%,45%)' : lgCol(LGH.metric, 1, 1) }), s('text', { x: w - tw / 2 + 4, y: -8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, val.txt));
  }
  el.append(mk);
}
function lgHeatNodes() { NODE_EL.forEach((_, id) => lgHeatNode(id)); }
function lgHeatEdges() {
  const S_ = lgStats();
  EDGE_EL.forEach((el, id) => {
    const line = el.querySelector('.e-line'), head = el.querySelector('.e-head'); if (!line) return;
    const e = edgeById(id); if (!e) return;
    el.classList.remove('heat-e', 'heat-cold');
    ['stroke-width', 'stroke', 'opacity'].forEach(k => { line.style.removeProperty(k); });
    if (head) { head.style.removeProperty('fill'); head.style.removeProperty('stroke'); }
    if (!LGH.on || !S_.n) return;
    const c = S_.pairs.get(e.from + '>' + e.to) || 0, f = S_.maxPair ? c / S_.maxPair : 0;
    el.classList.add(c ? 'heat-e' : 'heat-cold');
    if (c) {
      const col = lgCol('reach', f, 1);
      line.style.setProperty('stroke-width', (2.5 + f * 8).toFixed(1) + 'px'); line.style.setProperty('stroke', col);
      if (head) { head.style.setProperty('fill', col); head.style.setProperty('stroke', col); }
    }
  });
}
function lgHeatRefresh() {
  if (typeof NODE_EL === 'undefined') return;
  lgHeatNodes(); lgHeatEdges(); lgLegend();
}
function lgLegend() {
  let el = document.getElementById('lg-legend');
  if (!LGH.on) { if (el) el.remove(); return; }
  const S_ = lgStats();
  if (!el) { el = h('div', { id: 'lg-legend', class: 'lg-legend' }); document.body.append(el); }
  el.replaceChildren(h('span', { class: 'lg-lt' }, icon('chart', 15), t('lg.legend', t('lg.m.' + LGH.metric), S_.n)),
    h('span', { class: 'lg-grad', style: { background: 'linear-gradient(90deg,' + lgCol(LGH.metric, 0, 0.25) + ',' + lgCol(LGH.metric, 1, 1) + ')' } }),
    h('button', { class: 'btn sm', onclick: () => openTestLog() }, t('lg.legend.open')),
    h('button', { class: 'btn sm', onclick: () => { LGH.on = false; lgHeatRefresh(); } }, t('lg.legend.off')));
}

/* ---------- файлы ---------- */
function lgParse(text, name) {
  let j; try { j = JSON.parse(text); } catch (e) { return null; }
  const arr = Array.isArray(j) ? j : (j && j.format === 'vnmap-logs' && Array.isArray(j.logs)) ? j.logs : (j && j.format === 'vnmap-log') ? [j] : null;
  if (!arr) return null;
  const out = arr.filter(lgValid).map(L => ({ format: 'vnmap-log', v: 1, id: String(L.id || lgId()), uid: L.uid || '', project: L.project || '', who: String(L.who || name || '?').slice(0, 60), at: +L.at, sec: +L.sec || 0, done: !!L.done,
    end: L.end && typeof L.end === 'object' ? { key: String(L.end.key || ''), title: String(L.end.title || '') } : null,
    notes: (Array.isArray(L.notes) ? L.notes : []).filter(x => x && typeof x.text === 'string').map(x => ({ b: String(x.b || ''), t: +x.t || 0, text: x.text.slice(0, 1000), line: String(x.line || '').slice(0, 160), title: String(x.title || '') })),
    path: L.path.map(p => ({ b: p.b, t: +p.t, title: p.title ? String(p.title) : '' })), picks: (Array.isArray(L.picks) ? L.picks : []).filter(x => x && typeof x.b === 'string').map(x => ({ b: x.b, text: String(x.text || ''), to: x.to || null })), src: L.src === 'html' ? 'html' : 'file' }));
  return out;
}
async function lgImport(files) {
  let add = 0, dup = 0, other = 0;
  const list = lgLoad().slice(), have = new Set(list.map(x => x.id));
  for (const f of files) {
    const logs = lgParse(await f.text(), f.name.replace(/\.[^.]+$/, ''));
    if (!logs || !logs.length) { toast(t('lg.imp.bad', f.name), 4500); continue; }
    for (const L of logs) { if (have.has(L.id)) { dup++; continue; } have.add(L.id); if (L.uid && P.uid && L.uid !== P.uid) other++; list.push(L); add++; }
  }
  if (add) lgStore(list);
  toast(t('lg.imported', add, dup ? t('lg.imp.dup', dup) : '') + (other ? '. ' + t('lg.imp.other', other) : ''), 5200);
  return add;
}

function openTestLog() {
  closePopover();
  let q = '';
  openModal({
    cls: 'bs-m lg-m', build: m => {
      const top = h('div', { class: 'bs-top lg-top' }), body = h('div', { class: 'bs-body scroll' });
      const rec = h('input', { type: 'checkbox', checked: lgRecOn() });
      rec.addEventListener('change', () => { S.logRec = rec.checked; saveSettings(); });
      const paint = () => { paintTop(); paintBody(); };
      const metricSeg = () => segmented(['reach', 'drop', 'time'].map(k => ({ value: k, label: t('lg.m.' + k), tip: t('lg.m.' + k + '.t') })), LGH.metric, v => { LGH.metric = v; lgHeatRefresh(); });
      const paintTop = () => top.replaceChildren(
        h('div', { class: 'bs-sph' }, t('lg.intro')),
        h('div', { class: 'ar-set' }, metricSeg(),
          h('button', { class: 'btn' + (LGH.on ? '' : ' primary'), id: 'lg-map', onclick: () => { LGH.on = !LGH.on; lgHeatRefresh(); paintTop(); } }, icon('chart', 15), t(LGH.on ? 'lg.map.off' : 'lg.map.on'))),
        h('div', { class: 'ar-set' },
          h('button', { class: 'btn', id: 'lg-import', onclick: () => pickFiles('.json,.vnlog,application/json', true, async fl => { await lgImport(fl); paint(); }) }, icon('upload', 15), t('lg.import')),
          h('button', { class: 'btn', id: 'lg-export', disabled: !lgLoad().length, onclick: () => lgExportAll() }, icon('save', 15), t('lg.export')),
          h('button', { class: 'btn', id: 'lg-clear', disabled: !lgLoad().length, onclick: async () => { if (await confirmDlg({ title: t('lg.clear.q'), text: t('lg.clear.t'), ok: t('lg.clear.ok'), danger: true })) { lgStore([]); paint(); } } }, icon('trash', 15), t('lg.clear')),
          h('label', { class: 'ar-chk' }, rec, h('span', t('lg.rec')))));
      const card = (k, v, s_) => h('div', { class: 'bs-card' }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v), s_ ? h('div', { class: 's' }, s_) : null);
      const title = id => { const n = nodeById(id); return n ? bsTitle(n) : null; };
      const paintBody = () => {
        body.replaceChildren();
        const logs = lgLoad(), S_ = lgStats();
        if (!logs.length) { body.append(h('div', { class: 'empty' }, t('lg.empty')), h('div', { class: 'bs-foot' }, t('lg.foot'))); return; }
        const cards = h('div', { class: 'bs-cards' });
        cards.append(card(t('lg.c.n'), String(S_.n)), card(t('lg.c.done'), t('lg.of', S_.done, S_.n), t('lg.pct', Math.round(S_.done / S_.n * 100))), card(t('lg.c.avg'), arClock(S_.avgSec)));
        const ends = [...S_.ends.values()].sort((a, b) => b.n - a.n);
        cards.append(card(t('lg.c.ends'), String(ends.length), ends.length ? ends.slice(0, 6).map(e => e.title + ' — ' + e.n).join('; ') : t('lg.c.ends.none')));
        body.append(cards);

        /* блоки */
        body.append(h('div', { class: 'bs-h' }, t('lg.h.blocks')));
        const find = h('input', { class: 'inp', type: 'search', placeholder: t('ar.find'), value: q, id: 'lg-q' });
        const lst = h('div', { class: 'bs-list' });
        const rows = [...S_.nodes.entries()].map(([id, x]) => ({ id, x, title: title(id) })).filter(r => r.title).sort((a, b) => b.x.left - a.x.left || b.x.reach - a.x.reach);
        const fill = () => {
          lst.replaceChildren(h('div', { class: 'lg-r lg-th' }, h('div', t('lg.col.block')), h('div', t('lg.col.reach')), h('div', t('lg.col.drop')), h('div', t('lg.col.time'))));
          const qq = q.trim().toLowerCase(); let n = 0;
          for (const r of rows) {
            if (qq && !r.title.toLowerCase().includes(qq)) continue; if (++n > 300) break;
            lst.append(h('button', { class: 'lg-r lg-row', 'data-tip': t('lg.focus'), onclick: () => { m.close(); focusNode(r.id); } },
              h('div', { class: 'lg-bt' }, r.title), h('div', {}, t('lg.of', r.x.reach, S_.n) + ' · ' + t('lg.pct', Math.round(r.x.reach / S_.n * 100))),
              h('div', { class: r.x.left ? 'lg-bad' : '' }, r.x.left ? String(r.x.left) : '—'), h('div', {}, r.x.tcnt ? arClock(r.x.avg) : '—')));
          }
        };
        find.addEventListener('input', () => { q = find.value; fill(); });
        body.append(h('div', { class: 'bs-find' }, find), lst); fill();

        /* выборы */
        const forks = [...S_.picks.entries()].map(([id, mp]) => ({ id, title: title(id), items: [...mp.entries()].sort((a, b) => b[1] - a[1]), total: [...mp.values()].reduce((a, b) => a + b, 0) })).filter(f => f.title && f.items.length);
        if (forks.length) {
          body.append(h('div', { class: 'bs-h' }, t('lg.h.picks')));
          for (const f of forks) {
            const box = h('div', { class: 'lg-fork' }, h('div', { class: 'lg-ft' }, f.title));
            for (const [tx, c] of f.items) { const pc = Math.round(c / f.total * 100); box.append(h('div', { class: 'lg-pick' }, h('div', { class: 'lg-pt' }, tx || '…'), h('div', { class: 'lg-bar' }, h('i', { style: { width: pc + '%' } })), h('div', { class: 'lg-pn' }, c + ' · ' + pc + '%'))); }
            body.append(box);
          }
        }

        /* замечания тестеров */
        const notes = logs.flatMap(L => (L.notes || []).map(n => Object.assign({ who: L.who }, n))).sort((a, b) => a.t - b.t);
        if (notes.length) {
          body.append(h('div', { class: 'bs-h' }, t('lg.h.notes')));
          const nl = h('div', { class: 'bs-list' });
          for (const n of notes.slice(0, 200)) {
            const tt = title(n.b) || n.title || '';
            nl.append(h('button', { class: 'lg-note', 'data-tip': n.b && nodeById(n.b) ? t('lg.focus') : null, onclick: () => { if (n.b && nodeById(n.b)) { m.close(); focusNode(n.b); } } },
              h('div', { class: 'lg-nh' }, h('b', n.who), tt ? h('span', ' · ' + tt) : null), h('div', { class: 'lg-nt' }, n.text), n.line ? h('div', { class: 'lg-nl' }, '«' + n.line + '»') : null));
          }
          body.append(nl);
        }

        /* прохождения */
        body.append(h('div', { class: 'bs-h' }, t('lg.h.sess')));
        const sl = h('div', { class: 'bs-list' });
        for (const L of logs.slice().reverse().slice(0, 200)) {
          const last = L.path[L.path.length - 1], lt = last && (title(last.b) || last.title) || '?';
          const res = L.done ? (L.end && (L.end.title || L.end.key) ? t('lg.sess.end', L.end.title || L.end.key) : t('lg.sess.endb')) : t('lg.sess.cut', lt);
          sl.append(h('div', { class: 'lg-s' },
            h('button', { class: 'lg-who', 'data-tip': t('lg.sess.who'), onclick: async () => { const v = await promptDlg({ title: t('lg.who.t'), value: L.who }); if (v != null && String(v).trim()) { const all = lgLoad().slice(), x = all.find(z => z.id === L.id); if (x) { x.who = String(v).trim().slice(0, 60); lgStore(all); paintBody(); } } } }, L.who),
            h('div', { class: 'lg-sd' }, fmtTime(L.at) + ' · ' + arClock(L.sec) + ' · ' + L.path.length + ' ' + (S.lang === 'en' ? 'blocks' : 'блоков')),
            h('div', { class: 'lg-sr' + (L.done ? '' : ' cut') }, res),
            h('button', { class: 'btn sm icon', 'data-tip': t('lg.del'), onclick: () => { lgStore(lgLoad().filter(z => z.id !== L.id)); paint(); } }, icon('trash', 14))));
        }
        body.append(sl, h('div', { class: 'bs-foot' }, t('lg.foot')));
      };
      paint();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('lg.title'), m), top, body);
    }
  });
}
async function lgExportAll() {
  const logs = lgLoad(); if (!logs.length) return;
  await saveFile(((P.name || 'novel').replace(/[\\/:*?"<>|]+/g, '_')) + '.vnlog.json', JSON.stringify({ format: 'vnmap-logs', v: 1, logs }, null, 1), 'application/json');
}

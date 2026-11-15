'use strict';
/* ====== Автопрогон: за сколько игрок доберётся до каждого блока и концовки ======
   Берёт движок плеера и честно «проигрывает» новеллу: ищет самый быстрый путь к каждому блоку и к каждой концовке
   с учётом условий, переменных, скорости чтения, пауз и длины озвучки. Условия, которые не выполнить ни при каком
   выборе, видны сразу: такие блоки «недостижимы», даже если на карте к ним ведёт стрелка. */

Object.assign(D, {
  'ar.btn': ['Автопрогон: время до блоков', 'Auto-run: time to blocks'],
  'ar.title': ['Автопрогон', 'Auto-run'],
  'ar.intro': ['Программа сама проходит новеллу всеми способами и находит, за какое минимальное время игрок доберётся до каждого блока. Учитываются условия и переменные из сценария, скорость чтения, паузы и озвучка.', 'The app plays the novel every possible way and finds the shortest time in which a player can reach each block. Conditions and variables from the script, reading speed, pauses and voice-over are taken into account.'],
  'ar.set.speed': ['Скорость чтения', 'Reading speed'], 'ar.set.wpm': ['слов в минуту', 'words per minute'],
  'ar.set.line': ['Минимум на реплику', 'Minimum per line'], 'ar.set.choice': ['Время на выбор', 'Time per choice'], 'ar.set.pause': ['Пауза без времени', 'Pause without time'],
  'ar.set.sec': ['сек', 'sec'],
  'ar.set.voice': ['Учитывать длину озвучки (реплика длится, пока звучит голос)', 'Use voice length (a line lasts while the voice plays)'],
  'ar.set.limit': ['Предел поиска', 'Search limit'], 'ar.set.limit.t': ['Сколько различных ситуаций выбора проверять. Больше значит точнее, но дольше.', 'How many distinct choice situations to check. More is more accurate but slower.'],
  'ar.go': ['Посчитать', 'Calculate'], 'ar.again': ['Посчитать заново', 'Recalculate'], 'ar.stop': ['Остановить', 'Stop'],
  'ar.prog': ['Проверено ситуаций: {0}, блоков найдено: {1}', 'Situations checked: {0}, blocks found: {1}'],
  'ar.prep': ['Готовлю сценарий…', 'Preparing the script…'], 'ar.voice.load': ['Читаю длину озвучки: {0} из {1}', 'Reading voice length: {0} of {1}'],
  'ar.err.empty': ['Нет сценария для прогона: в блоках нет кода и стартового блока.', 'Nothing to run: no script or start block.'],
  'ar.err': ['Не удалось подготовить сценарий: {0}', 'Could not prepare the script: {0}'],
  'ar.c.blocks': ['Достижимо блоков', 'Reachable blocks'], 'ar.c.blocks.v': ['{0} из {1}', '{0} of {1}'],
  'ar.c.end': ['Самый быстрый конец', 'Fastest ending'], 'ar.c.end.none': ['до конца дойти не удалось', 'no ending reached'],
  'ar.c.ends': ['Концовок найдено', 'Endings found'], 'ar.c.states': ['Проверено ситуаций', 'Situations checked'],
  'ar.c.voice': ['Озвучка', 'Voice-over'], 'ar.c.voice.v': ['файлов с длиной: {0} из {1}', 'files with length: {0} of {1}'],
  'ar.c.voice.off': ['не учитывается', 'not used'], 'ar.c.voice.no': ['в сценарии нет озвучки', 'no voice-over in the script'],
  'ar.trunc': ['Поиск остановлен на пределе ({0} ситуаций): часть блоков могла не найтись. Увеличьте предел и посчитайте снова.', 'The search stopped at the limit ({0} situations): some blocks may be missing. Raise the limit and recalculate.'],
  'ar.stale': ['Проект изменился после расчёта. Нажмите «Посчитать заново».', 'The project changed after the calculation. Press “Recalculate”.'],
  'ar.lost': ['Недостижимы при заданных условиях: {0}. Стрелки на карте к ним, возможно, есть, но условия не дают дойти.', 'Unreachable under the script conditions: {0}. The map may have arrows to them, but the conditions never let a player arrive.'],
  'ar.lost.map': ['Выделить на карте', 'Select on the map'],
  'ar.h.blocks': ['Время до блоков (самый быстрый путь)', 'Time to blocks (fastest route)'],
  'ar.h.ends': ['Концовки', 'Endings'],
  'ar.col.block': ['Блок', 'Block'], 'ar.col.time': ['Через', 'After'], 'ar.col.route': ['Путь', 'Route'],
  'ar.route': ['Путь', 'Route'], 'ar.map': ['На карте', 'On the map'], 'ar.hide': ['Свернуть', 'Hide'],
  'ar.route.start': ['Старт', 'Start'], 'ar.route.pick': ['{0}: «{1}»', '{0}: “{1}”'], 'ar.route.arrive': ['Приходим в «{0}» через {1}', 'Arrive at “{0}” after {1}'],
  'ar.route.direct': ['Без выборов: игра сама приводит сюда.', 'No choices: the game leads here by itself.'],
  'ar.find': ['Найти блок…', 'Find a block…'],
  'ar.end.key': ['«{0}»', '“{0}”'], 'ar.end.block': ['Конец в блоке «{0}»', 'Ends in block “{0}”'],
  'ar.sec': ['{0} с', '{0} s'], 'ar.ms': ['{0} мин {1} с', '{0} min {1} s'], 'ar.m': ['{0} мин', '{0} min'], 'ar.hm': ['{0} ч {1} мин', '{0} h {1} min'], 'ar.zero': ['сразу', 'at once'],
  'ar.warn': ['Замечания движка: {0}', 'Engine notes: {0}'],
  'ar.foot': ['Время считается так: слова реплики ÷ скорость чтения, но не меньше минимума; длинная озвучка и паузы {w=…}, pause удлиняют реплику; на каждый выбор уходит заданное время. Случайные числа (renpy.random) берутся на удачу, концовки, открытые в прошлых играх, считаются закрытыми.', 'Timing: words of a line ÷ reading speed, but not less than the minimum; a longer voice clip and {w=…}/pause waits stretch the line; each choice takes the set time. Random numbers (renpy.random) are a single guess, and endings unlocked in earlier playthroughs count as locked.'],
});

TOOL_ITEMS.push({ id: 'autorun', group: 'play', ic: 'zap', key: 'ar.btn', kw: 'autorun auto run time duration speed route fastest voice playthrough автопрогон время длительность путь озвучка скорость самый быстрый', run: () => openAutorun() });

const AR_DEF = { line: 1.5, choice: 4, pause: 1, voice: true, limit: 12000 };
const arCfg = () => { if (!S.autorun || typeof S.autorun !== 'object') S.autorun = {}; for (const k in AR_DEF) if (S.autorun[k] === undefined) S.autorun[k] = AR_DEF[k]; return S.autorun; };
const AR_VOICE = new Map();                  // bid -> секунды (или 0, если не прочиталась)
let AR_LAST = null;                          // последний расчёт: { ver, cfg, res }

function arClock(sec) {
  sec = Math.max(0, Math.round(sec));
  if (!sec) return t('ar.zero');
  if (sec < 60) return t('ar.sec', sec);
  if (sec < 3600) { const m = Math.floor(sec / 60), s = sec - m * 60; return s ? t('ar.ms', m, s) : t('ar.m', m); }
  const hh = Math.floor(sec / 3600), mm = Math.round((sec - hh * 3600) / 60);
  return mm === 60 ? t('ar.hm', hh + 1, 0) : t('ar.hm', hh, mm);
}

/** Сколько секунд игрок проведёт на событии движка. */
function arSecs(ev, cfg, voiceDur) {
  if (ev.type === 'menu') return cfg.choice;
  if (ev.type === 'pause') return ev.secs != null && ev.secs >= 0 ? ev.secs : cfg.pause;
  if (ev.type !== 'say') return 0;
  const words = wordCount(ev.text || '');
  let s = Math.max(cfg.line, words / rdWpm() * 60);
  if (cfg.voice && ev.fx) for (const f of ev.fx) if (f.ch === 'voice') { const d = voiceDur(f.file); if (d > 0) s = Math.max(s, d); }
  if (ev.rich && ev.rich.wait) s += ev.rich.wait;
  return s;
}

/** Файлы озвучки, названные в сценарии, и их длина (читается из самих записей). */
async function arVoiceDurations(R, prog, binMap, on) {
  const files = new Set();
  for (const f of R.files) { if (!/\.rpy$/.test(f.path)) continue; const re = /^\s*voice\s+(?:"([^"]+)"|'([^']+)')/gm; let m; while ((m = re.exec(f.text))) files.add(m[1] || m[2]); }
  const out = new Map(); let done = 0, found = 0;
  const list = [...files];
  const one = async file => {
    const bid = binMap.get('game/' + file) || binMap.get(file);
    if (bid) {
      if (!AR_VOICE.has(bid)) {
        let d = 0;
        try {
          const url = await blobUrl(bid);
          d = await new Promise(res => { const a = new Audio(); const to = setTimeout(() => res(0), 4000); a.preload = 'metadata'; a.onloadedmetadata = () => { clearTimeout(to); res(isFinite(a.duration) ? a.duration : 0); }; a.onerror = () => { clearTimeout(to); res(0); }; a.src = url; });
        } catch (e) { d = 0; }
        AR_VOICE.set(bid, d);
      }
      const d = AR_VOICE.get(bid); if (d > 0) { out.set(file, d); found++; }
    }
    on && on(++done, list.length);
  };
  for (let i = 0; i < list.length; i += 6) await Promise.all(list.slice(i, i + 6).map(one));
  return { map: out, total: list.length, found };
}

/** Основной расчёт: поиск самого быстрого пути (по времени) по ситуациям выбора. */
async function arCompute(cfg, ui) {
  ui.status(t('ar.prep'));
  await new Promise(r => setTimeout(r, 20));
  let R;
  try { R = compileProject({ mode: 'split', includeDocs: false, includeSource: false, includeUnreachable: true }, await availableBlobs()); }
  catch (e) { throw new Error(t('ar.err', e && e.message || e)); }
  if (!R.files.length || !R.start) throw new Error(t('ar.err.empty'));
  const binMap = new Map(); R.bin.forEach(b => binMap.set(b.path, b.bid));
  const prog = plParseScript(R.files.filter(f => /\.rpy$/.test(f.path) && !/^game\/tl\//.test(f.path)));
  const byLabel = new Map();
  for (const b of R.blockLabels || []) { byLabel.set(b.label, b); for (const f of b.files) byLabel.set(f.label, b); }
  let voice = { map: new Map(), total: 0, found: 0 };
  if (cfg.voice) voice = await arVoiceDurations(R, prog, binMap, (d, n) => ui.status(t('ar.voice.load', d, n)));
  const vd = f => voice.map.get(f) || 0;

  const g = new PlGame(prog, { endings: R.endingsData, persist: new Set(), maxSteps: 50000 });
  const bodyIds = new WeakMap(); let bodyN = 0;
  const bid = b => { let x = bodyIds.get(b); if (!x) { x = ++bodyN; bodyIds.set(b, x); } return x; };
  const keyOf = () => {
    let v; try { v = JSON.stringify(g.vars, (k, x) => (typeof x === 'function' ? '[f]' : x instanceof Set ? [...x] : x)); } catch (e) { return null; }
    return g.frames.map(f => bid(f.body) + ':' + f.i + (f.base ? 'b' : '')).join('|') + '#' + v;
  };

  const blockBest = new Map();           // id блока -> { t, node }
  const ends = [];                       // { t, node, label, keys }
  const nodes = [];                      // ситуации выбора
  let curT = 0, curNode = null, curVia = null, errors = 0;
  g.onLabel = lbl => { const b = byLabel.get(lbl); if (!b) return; const bidn = b.id; const old = blockBest.get(bidn); if (!old || curT < old.t - 1e-9) blockBest.set(bidn, { t: curT, node: curNode, via: curVia }); };

  /** Идёт по репликам до следующего выбора или конца, копя время. */
  const walk = ev => {
    let guard = 0;
    while (ev && (ev.type === 'say' || ev.type === 'pause') && ++guard < 100000) {
      curT += arSecs(ev, cfg, vd);
      g.hist.length = 0; g.log.length = 0; g.persistent.endings.clear();
      ev = g.advance();
    }
    return ev;
  };
  const place = (ev, parent, via) => {
    g.hist.length = 0; g.log.length = 0;
    if (!ev) return;
    if (ev.type === 'menu') {
      curT += arSecs(ev, cfg, vd);
      const key = keyOf();
      const n = { id: nodes.length, t: curT, snap: g.snap(), ev, parent, via, key, label: ev.label };
      nodes.push(n); heap.push(n);
    } else if (ev.type === 'end') {
      const keys = (ev.notices || []).filter(x => x.type === 'ending').map(x => x.key);
      ends.push({ t: curT, node: curNode, via: curVia, label: ev.label, keys });
    } else if (ev.type === 'error') errors++;
  };

  // простая двоичная куча по времени
  const heap = []; heap.push = function (n) { Array.prototype.push.call(this, n); let i = this.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (this[p].t <= this[i].t) break; [this[p], this[i]] = [this[i], this[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (; ;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l].t < heap[m].t) m = l; if (r < heap.length && heap[r].t < heap[m].t) m = r; if (m === i) break;[heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };

  curT = 0; curNode = null; curVia = null;
  const first = g.begin('start');
  const startEv = walk(first);
  place(startEv, null, null);
  const seen = new Map();                // key -> лучшее время
  let checked = 0, truncated = false, lastUi = Date.now();
  const endsSeen = new Set();
  while (heap.length) {
    if (ui.cancelled()) { truncated = true; break; }
    const n = pop();
    if (n.key != null) { const b = seen.get(n.key); if (b != null && b < n.t - 1e-9) continue; seen.set(n.key, n.t); }
    if (++checked > cfg.limit) { truncated = true; break; }
    for (const it of n.ev.items) {
      if (!it.ok) continue;
      g.restore(n.snap); g.pend = n.ev; g.persistent.endings.clear();
      curT = n.t; curNode = n; curVia = it.text;
      const ev = walk(g.choose(it.idx));
      place(ev, n, it.text);
    }
    if (Date.now() - lastUi > 80) { lastUi = Date.now(); ui.status(t('ar.prog', checked, blockBest.size)); await new Promise(r => setTimeout(r, 0)); }
  }

  // сборка результата
  const nodeRoute = row => {
    const chain = []; for (let x = row.node; x; x = x.parent) chain.push(x); chain.reverse();
    const out = [];
    for (let i = 1; i < chain.length; i++) out.push({ t: chain[i - 1].t, label: chain[i - 1].label, via: chain[i].via });
    if (row.node && row.via != null) out.push({ t: row.node.t, label: row.node.label, via: row.via });
    return out;
  };
  const blocks = [];
  const blockInfo = new Map();
  for (const b of R.blockLabels || []) blockInfo.set(b.id, b);
  let nTotal = 0;
  for (const nd of P.nodes) {
    if (nd.type === 'note') continue;
    nTotal++;
    const hit = blockBest.get(nd.id);
    blocks.push({ id: nd.id, title: bsTitle(nd), t: hit ? hit.t : null, node: hit ? hit.node : null, via: hit ? hit.via : null });
  }
  const endRows = [];
  for (const e of ends) {
    const ekeys = e.keys.length ? e.keys : [null];
    for (const k of ekeys) {
      const id = k ? 'k:' + k : 'l:' + e.label;
      if (endsSeen.has(id)) { const row = endRows.find(r => r.id === id); if (row && e.t < row.t) { row.t = e.t; row.node = e.node; row.via = e.via; } continue; }
      endsSeen.add(id);
      const b = byLabel.get(e.label), info = k && R.endingsData.list.find(x => x.key === k);
      endRows.push({ id, t: e.t, node: e.node, via: e.via, key: k, title: k ? (info ? info.title : k) : null, block: b ? b.id : null });
    }
  }
  endRows.sort((a, b) => a.t - b.t);
  return { blocks, nTotal, endRows, checked, truncated, voice, errors, warns: g.warns.slice(0, 6), steps: nodeRoute, startAt: R.start };
}

function openAutorun() {
  closePopover();
  const cfg = arCfg();
  let running = false, cancel = false, shown = null, q = '';
  openModal({
    cls: 'bs-m ar-m', onClose: () => { cancel = true; }, build: m => {
      const top = h('div', { class: 'bs-top ar-top' }), body = h('div', { class: 'bs-body scroll' });
      const status = h('div', { class: 'ar-status' });
      const num = (key, min, max, step, aria) => {
        const i = h('input', { class: 'inp num', type: 'number', min, max, step, value: cfg[key], 'aria-label': aria });
        i.addEventListener('change', () => { cfg[key] = clamp(+i.value || AR_DEF[key], min, max); i.value = cfg[key]; saveSettings(); });
        return i;
      };
      const wpm = h('input', { class: 'inp num', type: 'number', min: 60, max: 600, step: 10, value: rdWpm(), 'aria-label': t('ar.set.speed') });
      wpm.addEventListener('change', () => { S.readWpm = clamp(Math.round(+wpm.value) || 200, 60, 600); wpm.value = S.readWpm; saveSettings(); });
      const voice = h('input', { type: 'checkbox', checked: !!cfg.voice });
      voice.addEventListener('change', () => { cfg.voice = voice.checked; saveSettings(); });
      const field = (lab, inp, unit, tip) => h('label', { class: 'ar-f', 'data-tip': tip || null }, h('span', { class: 'lab' }, lab), inp, unit ? h('span', { class: 'hint' }, unit) : null);
      const goBtn = h('button', { class: 'btn primary', id: 'ar-go', onclick: () => go() }, icon('zap', 15), t('ar.go'));
      const paintTop = () => top.replaceChildren(
        h('div', { class: 'bs-sph' }, t('ar.intro')),
        h('div', { class: 'ar-set' },
          field(t('ar.set.speed'), wpm, t('ar.set.wpm')), field(t('ar.set.line'), num('line', 0, 20, 0.5, t('ar.set.line')), t('ar.set.sec')),
          field(t('ar.set.choice'), num('choice', 0, 120, 1, t('ar.set.choice')), t('ar.set.sec')), field(t('ar.set.pause'), num('pause', 0, 20, 0.5, t('ar.set.pause')), t('ar.set.sec')),
          field(t('ar.set.limit'), num('limit', 500, 100000, 500, t('ar.set.limit')), '', t('ar.set.limit.t'))),
        h('label', { class: 'ar-chk' }, voice, h('span', t('ar.set.voice'))),
        h('div', { class: 'row-actions left' }, goBtn, status));

      const routeBox = (r, row) => {
        const box = h('div', { class: 'ar-route' });
        const steps = r.steps(row);
        if (!steps.length) box.append(h('div', { class: 'ar-rs' }, t('ar.route.direct')));
        for (const s of steps) box.append(h('div', { class: 'ar-rs' }, icon('chevR', 12), t('ar.route.pick', arClock(s.t), s.via == null ? '' : s.via)));
        box.append(h('div', { class: 'ar-rs ar-rend' }, icon('flag', 12), t('ar.route.arrive', row.title || '', arClock(row.t))));
        return box;
      };
      const routeIds = (r, row) => { const ids = []; for (const s of r.steps(row)) { const b = byLabelId(s.label); if (b && ids[ids.length - 1] !== b) ids.push(b); } if (row.id && ids[ids.length - 1] !== row.id) ids.push(row.id); return ids; };
      const labIds = new Map();
      const byLabelId = lbl => labIds.get(lbl) || null;
      const showMap = ids => {
        const nodesL = ids.map(nodeById).filter(Boolean); if (!nodesL.length) return;
        m.close(); setSel(ids);
        const bb = nodesBBox(nodesL), r = stage.getBoundingClientRect();
        const k = clamp(Math.min((r.width - 160) / Math.max(1, bb.x1 - bb.x0), (r.height - 260) / Math.max(1, bb.y1 - bb.y0), 1), 0.1, 1);
        centerOn((bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, k);
      };

      const card = (cls, k, v, s) => h('div', { class: 'bs-card' + (cls ? ' ' + cls : '') }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v), s ? h('div', { class: 's' }, s) : null);
      const paintBody = () => {
        body.replaceChildren();
        if (!shown) return;
        const r = shown.res;
        if (shown.ver !== DATA_VER) body.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('ar.stale')));
        const okN = r.blocks.filter(b => b.t != null).length, lost = r.blocks.filter(b => b.t == null);
        const fastest = r.endRows[0];
        const cards = h('div', { class: 'bs-cards' });
        cards.append(card('', t('ar.c.blocks'), t('ar.c.blocks.v', okN, r.nTotal)));
        cards.append(card(fastest ? '' : 'warn', t('ar.c.end'), fastest ? arClock(fastest.t) : '—', fastest ? (fastest.key ? t('ar.end.key', fastest.title) : t('ar.end.block', blockTitleById(fastest.block))) : t('ar.c.end.none')));
        cards.append(card('', t('ar.c.ends'), String(r.endRows.length)));
        cards.append(card('', t('ar.c.states'), fmtNum(r.checked)));
        cards.append(card('', t('ar.c.voice'), r.voice.total ? t('ar.c.voice.v', r.voice.found, r.voice.total) : (cfg.voice ? t('ar.c.voice.no') : t('ar.c.voice.off'))));
        body.append(cards);
        if (r.truncated) body.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('ar.trunc', fmtNum(shown.cfg.limit))));
        if (r.warns.length) body.append(h('div', { class: 'bs-hint' }, icon('info', 15), t('ar.warn', r.warns.join('; '))));
        if (lost.length) body.append(h('div', { class: 'bs-hint warn' }, icon('alert', 15), h('span', {}, t('ar.lost', lost.map(b => b.title).join(', ')), ' ',
          h('button', { class: 'btn sm', onclick: () => showMap(lost.map(b => b.id)) }, t('ar.lost.map')))));
        const rowEl = (row, kind) => {
          const open = { v: false };
          const wrap = h('div', { class: 'ar-row' });
          const paint = () => {
            const head = h('div', { class: 'ar-rh' },
              h('div', { class: 'ar-rt' }, row.title || ''), h('div', { class: 'ar-rtime' }, arClock(row.t)),
              h('div', { class: 'ar-ra' },
                h('button', { class: 'btn sm', onclick: () => { open.v = !open.v; paint(); } }, open.v ? t('ar.hide') : t('ar.route')),
                (row.id && kind === 'block') || row.block ? h('button', { class: 'btn sm', onclick: () => showMap(routeIds(r, kind === 'block' ? row : Object.assign({}, row, { id: row.block }))) }, t('ar.map')) : null));
            wrap.replaceChildren(...(open.v ? [head, routeBox(r, row)] : [head]));
          };
          paint(); return wrap;
        };
        const reach = r.blocks.filter(b => b.t != null).sort((a, b) => a.t - b.t || a.title.localeCompare(b.title));
        if (r.endRows.length) {
          body.append(h('div', { class: 'bs-h' }, t('ar.h.ends')));
          const lst = h('div', { class: 'bs-list' });
          for (const e of r.endRows) lst.append(rowEl({ id: e.block, block: e.block, t: e.t, node: e.node, via: e.via, title: e.key ? t('ar.end.key', e.title) : t('ar.end.block', blockTitleById(e.block)) }, 'end'));
          body.append(lst);
        }
        body.append(h('div', { class: 'bs-h' }, t('ar.h.blocks')));
        const find = h('input', { class: 'inp', type: 'search', placeholder: t('ar.find'), value: q, id: 'ar-q' });
        const lst = h('div', { class: 'bs-list' });
        const fill = () => { lst.replaceChildren(); const qq = q.trim().toLowerCase(); let n = 0; for (const b of reach) { if (qq && !b.title.toLowerCase().includes(qq)) continue; if (++n > 400) break; lst.append(rowEl(b, 'block')); } };
        find.addEventListener('input', () => { q = find.value; fill(); });
        body.append(h('div', { class: 'bs-find' }, find), lst); fill();
        body.append(h('div', { class: 'bs-foot' }, t('ar.foot')));
      };
      const blockTitleById = id => { const n = id ? nodeById(id) : null; return n ? bsTitle(n) : '?'; };

      const go = async () => {
        if (running) { cancel = true; return; }
        running = true; cancel = false; goBtn.replaceChildren(icon('x', 15), t('ar.stop')); body.replaceChildren();
        try {
          flushHistory();
          const res = await arCompute(cfg, { status: s => { status.textContent = s; }, cancelled: () => cancel || m.closed });
          // карта «метка → блок» для маршрута: берём из последней компиляции через узлы
          labIds.clear(); for (const b of res.blocks) { /* заполняется ниже */ }
          shown = { ver: DATA_VER, cfg: Object.assign({}, cfg), res }; AR_LAST = shown;
          arFillLabels(labIds);
          status.textContent = '';
          if (!m.closed) paintBody();
        } catch (e) { status.textContent = ''; if (!m.closed) body.replaceChildren(h('div', { class: 'bs-hint warn' }, icon('alert', 15), String((e && e.message) || e))); }
        running = false; if (!m.closed) goBtn.replaceChildren(icon('zap', 15), t(shown ? 'ar.again' : 'ar.go'));
      };
      if (AR_LAST) { shown = AR_LAST; arFillLabels(labIds); goBtn.replaceChildren(icon('zap', 15), t('ar.again')); }
      paintTop(); paintBody();
      return h('div', { class: 'm-wrap bs-wrap' }, modalHead(t('ar.title'), m), top, body);
    }
  });
}
/** Сопоставление «метка → id блока» для построения пути на карте. */
function arFillLabels(map) {
  try {
    const R = compileProject({ mode: 'split', includeDocs: false, includeSource: false, includeUnreachable: true }, new Map());
    for (const b of R.blockLabels || []) { map.set(b.label, b.id); for (const f of b.files) map.set(f.label, b.id); }
  } catch (e) { /* карта путей не построится: останется только список */ }
}

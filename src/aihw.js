'use strict';
/* ====== Локальные модели: железо и подбор (с 1.7.19, только программа для компьютера) ======
   Оболочка определяет оперативную память, процессор и видеокарты (desktop/hw.js) и умеет скачивать модель в Ollama (desktop/ollama.js).
   Здесь простая математика «какая модель влезет» и карточка «Подбор модели под ваш компьютер» в «Подключения → ИИ → Локальные»:
   железо, рекомендация, таблица моделей с пометкой «быстро / медленно / не потянет», кнопки «Скачать» (полоса прогресса, отмена) и
   «Использовать» (выбирает Ollama и эту модель). Ничего не скачивается без нажатия. Размеры в каталоге приблизительные
   (настоящий размер Ollama называет при скачивании), правила подбора ориентировочные: это подсказка, а не гарантия. */

const AIHD = DESK && DESK.hw && DESK.ol ? { hw: DESK.hw, ol: DESK.ol } : null;
const AIHW = { hw: null, ol: null, load: false, pull: null, err: '', all: false, timer: null, note: '', paint: null };

/** Каталог: тег в Ollama, примерный размер файла (ГБ), вид (код или общий), «моё» (MoE: работает на процессоре заметно быстрее), подсказка. */
const AI_CAT = [
  { id: 'qwen2.5-coder:1.5b', gb: 1.0, kind: 'code', note: 'ai.cat.tiny' },
  { id: 'qwen2.5-coder:3b', gb: 1.9, kind: 'code', note: 'ai.cat.small' },
  { id: 'qwen2.5-coder:7b', gb: 4.7, kind: 'code', note: 'ai.cat.mid' },
  { id: 'qwen2.5-coder:14b', gb: 9.0, kind: 'code', note: 'ai.cat.good' },
  { id: 'qwen2.5-coder:32b', gb: 20, kind: 'code', note: 'ai.cat.big' },
  { id: 'qwen3-coder:30b', gb: 18, kind: 'code', moe: true, note: 'ai.cat.moe' },
  { id: 'llama3.2:3b', gb: 2.0, kind: 'gen', note: 'ai.cat.gen.s' },
  { id: 'llama3.1:8b', gb: 4.9, kind: 'gen', note: 'ai.cat.gen.m' },
  { id: 'gpt-oss:20b', gb: 13, kind: 'gen', moe: true, note: 'ai.cat.gen.l' },
];
const aiGiB = b => (Number(b) || 0) / 1073741824;
const aiGbText = g => (g >= 10 ? Math.round(g) : Math.round(g * 10) / 10).toString().replace('.', ',');

/** Сколько памяти можно отдать модели: видеопамять самой большой отдельной видеокарты (от 2 ГБ), оперативная память,
    у Apple Silicon общая память (около 65% под модель). */
function aiHwMem(hw) {
  hw = hw || {};
  const ram = aiGiB(hw.ram && hw.ram.total);
  if (hw.unified) return { ram, gpu: ram * 0.65, unified: true, gpuName: ((hw.gpus || [])[0] || {}).name || '' };
  let best = null;
  for (const g of hw.gpus || []) { const v = aiGiB(g.vram); if (v >= 2 && (!best || v > best.v)) best = { v, name: g.name || '' }; }
  return { ram, gpu: best ? best.v : 0, unified: false, gpuName: best ? best.name : '' };
}
/** Помещается ли модель: gpu (всё в видеопамяти, быстро), cpu (в оперативной, медленнее), slow (очень медленно), no (не потянет).
    Нужно памяти: файл модели ×1,1 и ещё около 1 ГБ на контекст; в оперативной ещё запас под систему (до 80% памяти). */
function aiFit(m, mem) {
  if (!m || !mem) return 'no';
  if (mem.gpu && m.gb * 1.1 + 1 <= mem.gpu) return 'gpu';
  if (m.gb * 1.15 + 2 <= mem.ram * 0.8) return m.moe || m.gb <= 5 ? 'cpu' : 'slow';
  return 'no';
}
/** Итог для окна: память, список моделей с пометкой и рекомендация (лучшая модель для кода, которая идёт быстро; иначе на процессоре; иначе самая лёгкая). */
function aiHwPlan(hw) {
  const mem = aiHwMem(hw), rows = AI_CAT.map(m => Object.assign({}, m, { fit: aiFit(m, mem) }));
  const code = rows.filter(r => r.kind === 'code');
  const best = lv => code.filter(r => r.fit === lv).sort((a, b) => b.gb - a.gb)[0];
  let rec = best('gpu'), why = 'gpu';
  if (!rec) { rec = best('cpu'); why = 'cpu'; }
  if (!rec) { rec = code.slice().sort((a, b) => a.gb - b.gb)[0]; why = 'weak'; }
  return { mem, rows, rec, why };
}

const AIHW_STR = {
  'ai.hw.h': ['Подбор модели под ваш компьютер', 'Pick a model for your computer'],
  'ai.hw.t': ['Программа смотрит, сколько у вас памяти и какая видеокарта, и подсказывает, какие модели потянет компьютер. Это ориентир, не гарантия.', 'The program checks how much memory and which graphics card you have and suggests the models your computer can run. It is a guide, not a guarantee.'],
  'ai.hw.old': ['Чтобы подобрать модель, обновите оболочку программы (Настройки → кнопка «Обновить оболочку»).', 'To pick a model, update the program shell (Settings, the Update shell button).'],
  'ai.hw.load': ['Определяю железо…', 'Checking your hardware…'],
  'ai.hw.ram': ['Память: {0} ГБ', 'Memory: {0} GB'],
  'ai.hw.cpu': ['Процессор: {0} ({1} ядер)', 'Processor: {0} ({1} cores)'],
  'ai.hw.gpu': ['Видеокарта: {0}, {1} ГБ видеопамяти', 'Graphics card: {0}, {1} GB of video memory'],
  'ai.hw.gpu.nov': ['Видеокарта: {0} (объём видеопамяти определить не удалось)', 'Graphics card: {0} (video memory size could not be found)'],
  'ai.hw.gpu.none': ['Видеокарта: не найдена или встроенная. Модели будут работать на процессоре, это заметно медленнее.', 'Graphics card: none found or built in. Models will run on the processor, which is noticeably slower.'],
  'ai.hw.unified': ['Видеопамять: общая с оперативной (Apple Silicon), модели могут занять около 65% памяти.', 'Video memory: shared with the main memory (Apple Silicon), models can use about 65% of it.'],
  'ai.hw.rec': ['Рекомендуем: {0} (около {1} ГБ). {2}', 'Recommended: {0} (about {1} GB). {2}'],
  'ai.hw.rec.gpu': ['Помещается в видеопамять, будет работать быстро.', 'It fits in the video memory and will run fast.'],
  'ai.hw.rec.cpu': ['Видеопамяти на неё не хватает, пойдёт на процессоре: медленнее, но работает.', 'There is not enough video memory, it will run on the processor: slower but works.'],
  'ai.hw.rec.weak': ['Компьютер слабоват для моделей помощнее; эта лёгкая даст простые подсказки и может ошибаться.', 'The computer is on the weak side for bigger models; this light one gives simple hints and may be wrong.'],
  'ai.hw.table': ['Все модели', 'All models'],
  'ai.hw.table.hide': ['Скрыть список', 'Hide the list'],
  'ai.hw.size': ['около {0} ГБ', 'about {0} GB'],
  'ai.hw.code': ['для кода', 'for code'],
  'ai.hw.gen': ['общая', 'general'],
  'ai.fit.gpu': ['Быстро', 'Fast'], 'ai.fit.unified': ['Быстро', 'Fast'], 'ai.fit.cpu': ['Медленнее', 'Slower'], 'ai.fit.slow': ['Очень медленно', 'Very slow'], 'ai.fit.no': ['Не потянет', 'Too big'],
  'ai.fit.gpu.h': ['Помещается в видеопамять', 'Fits in the video memory'], 'ai.fit.cpu.h': ['Пойдёт на процессоре, ответ придёт заметно медленнее', 'Runs on the processor, the answer comes noticeably slower'],
  'ai.fit.slow.h': ['Поместится в память, но на процессоре ответ придётся ждать минуты', 'Fits in memory, but on the processor you will wait minutes for an answer'], 'ai.fit.no.h': ['Не хватает памяти', 'Not enough memory'],
  'ai.cat.tiny': ['Самая лёгкая: для очень слабых компьютеров, подсказки простые.', 'The lightest: for very weak computers, hints are simple.'],
  'ai.cat.small': ['Лёгкая: короткие вставки и объяснения.', 'Light: short snippets and explanations.'],
  'ai.cat.mid': ['Золотая середина для обычного компьютера с видеокартой.', 'The sweet spot for an ordinary computer with a graphics card.'],
  'ai.cat.good': ['Заметно умнее: нужна видеокарта на 12 ГБ или много памяти.', 'Noticeably smarter: needs a 12 GB graphics card or plenty of memory.'],
  'ai.cat.big': ['Самая сильная из этого ряда: нужна мощная видеокарта.', 'The strongest of this family: needs a powerful graphics card.'],
  'ai.cat.moe': ['Новая и сильная; считает только часть «экспертов», поэтому на процессоре работает заметно быстрее обычных моделей такого размера.', 'New and strong; it uses only part of its experts, so it runs much faster on the processor than ordinary models of that size.'],
  'ai.cat.gen.s': ['Для общих вопросов, очень лёгкая.', 'For general questions, very light.'],
  'ai.cat.gen.m': ['Для общих вопросов и объяснений, надёжный выбор.', 'For general questions and explanations, a safe choice.'],
  'ai.cat.gen.l': ['Для общих вопросов и рассуждений; требовательная.', 'For general questions and reasoning; demanding.'],
  'ai.ol.on': ['Ollama запущена (версия {0}), скачано моделей: {1}.', 'Ollama is running (version {0}), models downloaded: {1}.'],
  'ai.ol.off': ['Ollama не запущена. Установите её и запустите (значок в системном трее), потом нажмите «Проверить снова».', 'Ollama is not running. Install it and start it (the tray icon), then press Check again.'],
  'ai.ol.install': ['Установить Ollama', 'Install Ollama'],
  'ai.ol.recheck': ['Проверить снова', 'Check again'],
  'ai.ol.got': ['Скачана', 'Downloaded'],
  'ai.ol.get': ['Скачать', 'Download'],
  'ai.ol.use': ['Использовать', 'Use'],
  'ai.ol.using': ['Выбрана', 'In use'],
  'ai.ol.need': ['Сначала запустите Ollama', 'Start Ollama first'],
  'ai.ol.pulling': ['Скачиваю {0}: {1}%', 'Downloading {0}: {1}%'],
  'ai.ol.pulling.n': ['Скачиваю {0}…', 'Downloading {0}…'],
  'ai.ol.of': ['{0} из {1} ГБ', '{0} of {1} GB'],
  'ai.ol.cancel': ['Отмена', 'Cancel'],
  'ai.ol.done': ['Модель {0} скачана. Нажмите «Использовать».', 'Model {0} downloaded. Press Use.'],
  'ai.ol.used': ['Выбрана модель {0} в Ollama', 'Selected model {0} in Ollama'],
  'ai.ol.warn.big': ['Скачивание займёт несколько гигабайт места и времени. Можно отменить: докачка продолжится с того же места.', 'The download takes several gigabytes and some time. You can cancel: it resumes from the same place later.'],
  'ai.ol.e.notfound': ['Такой модели нет в библиотеке Ollama: {0}', 'Ollama does not have such a model: {0}'],
  'ai.ol.e.ollama': ['Ollama сообщила об ошибке: {0}', 'Ollama reported an error: {0}'],
  'ai.ol.e.http': ['Ollama ответила ошибкой: {0}', 'Ollama answered with an error: {0}'],
  'ai.ol.e.network': ['Ollama не отвечает. Она запущена?', 'Ollama does not answer. Is it running?'],
  'ai.ol.e.timeout': ['Скачивание остановилось: Ollama давно ничего не присылает. Нажмите «Скачать» ещё раз, докачка продолжится.', 'The download stalled: Ollama sent nothing for a long time. Press Download again, it will resume.'],
  'ai.ol.e.cut': ['Связь оборвалась до конца скачивания. Нажмите «Скачать» ещё раз, докачка продолжится.', 'The connection broke before the download finished. Press Download again, it will resume.'],
  'ai.ol.e.busy': ['Уже идёт другое скачивание.', 'Another download is already running.'],
  'ai.ol.e.fail': ['Не удалось начать скачивание.', 'Could not start the download.'],
  'ai.lm.hint': ['Для LM Studio те же названия найдите в поиске самой программы (вкладка поиска) и скачайте там.', 'For LM Studio look up the same names in the program search tab and download them there.'],
};
Object.assign(D, AIHW_STR);

function aiHwErr(code, msg) {
  const k = 'ai.ol.e.' + code;
  return t(D[k] ? k : 'ai.ol.e.fail', msg || code);
}
function aiHwRepaint() { const el = document.getElementById('ai-hw'); if (el && el.isConnected) el.replaceWith(aiHwCard()); }

async function aiHwLoad(force) {
  if (!AIHD || AIHW.load) return;
  if (AIHW.hw && AIHW.ol && !force) return;
  AIHW.load = true; aiHwRepaint();
  try {
    const [hw, ol] = await Promise.all([AIHD.hw.info(), AIHD.ol.status()]);
    AIHW.hw = hw; AIHW.ol = ol;
    const p = await AIHD.ol.pullStatus().catch(() => null);
    if (p && p.state === 'run') { AIHW.pull = p; aiHwWatch(); }
  } catch (e) { AIHW.hw = AIHW.hw || { ram: { total: 0 }, gpus: [] }; AIHW.ol = AIHW.ol || { running: false, models: [] }; }
  AIHW.load = false; aiHwRepaint();
}
async function aiHwRefreshOl() { try { AIHW.ol = await AIHD.ol.status(); } catch (e) { /* не отвечает */ } }

async function aiHwPull(name) {
  AIHW.err = '';
  const r = await AIHD.ol.pullStart(name).catch(() => ({ ok: false, code: 'fail' }));
  if (!r.ok) { AIHW.err = aiHwErr(r.code, name); aiHwRepaint(); return; }
  AIHW.pull = r.st; aiHwWatch(); aiHwRepaint();
}
function aiHwWatch() { clearTimeout(AIHW.timer); AIHW.timer = setTimeout(aiHwTick, 1000); }
async function aiHwTick() {
  if (!AIHW.pull) return;
  let r = null; try { r = await AIHD.ol.pullStatus(); } catch (e) { /* оболочка занята: спросим ещё раз */ }
  if (!AIHW.pull) return;
  if (!r) { aiHwWatch(); return; }
  if (r.state === 'run') {
    AIHW.pull = r; aiHwWatch();
    const bar = document.getElementById('ai-hw-bar'), tx = document.getElementById('ai-hw-ptxt');
    if (bar) { bar.value = r.pct || 0; bar.max = 100; }
    if (tx) tx.textContent = aiHwPullText(r);
    return;
  }
  const name = AIHW.pull.model; AIHW.pull = null;
  if (r.state === 'ok') { await aiHwRefreshOl(); AIHW.note = t('ai.ol.done', r.model || name); toast(AIHW.note, 5000); }
  else if (r.state === 'error') { AIHW.err = aiHwErr(r.err, r.msg || name); toast(AIHW.err, 7000); }
  aiHwRepaint();
}
const aiHwPullText = p => (p.total ? t('ai.ol.pulling', p.model, p.pct || 0) + ' · ' + t('ai.ol.of', aiGbText(aiGiB(p.done)), aiGbText(aiGiB(p.total))) : t('ai.ol.pulling.n', p.model));
async function aiHwCancel() { AIHW.pull = null; clearTimeout(AIHW.timer); try { await AIHD.ol.pullCancel(); } catch (e) { /* уже остановлено */ } aiHwRepaint(); }
function aiHwUse(name) { aiSetProv('ollama'); aiSetModel('ollama', name); AIHW.note = t('ai.ol.used', name); toast(AIHW.note, 3500); aiDraft('ollama').model = undefined; if (AIHW.paint && document.getElementById('ai-set')) AIHW.paint(); else aiHwRepaint(); }

function aiHwLines(hw, plan) {
  const L = [h('div', {}, t('ai.hw.ram', aiGbText(aiGiB(hw.ram && hw.ram.total))))];
  if (hw.cpu && hw.cpu.model) L.push(h('div', {}, t('ai.hw.cpu', hw.cpu.model, hw.cpu.cores || '?')));
  const gp = (hw.gpus || []).filter(g => g.vendor !== 'apple');
  if (hw.unified) L.push(h('div', {}, t('ai.hw.unified')));
  else if (!gp.length) L.push(h('div', {}, t('ai.hw.gpu.none')));
  else for (const g of gp.slice(0, 3)) L.push(h('div', {}, g.vram ? t('ai.hw.gpu', g.name, aiGbText(aiGiB(g.vram))) : t('ai.hw.gpu.nov', g.name)));
  return L;
}
function aiHwRow(r, plan) {
  const ol = AIHW.ol || {}, have = (ol.models || []).some(m => m.name === r.id);
  const fit = r.fit === 'gpu' && plan.mem.unified ? 'unified' : r.fit;
  const cur = aiCfg().prov === 'ollama' && aiModel('ollama') === r.id, pulling = AIHW.pull && AIHW.pull.model === r.id;
  const act = have ? h('button', { class: 'btn sm' + (cur ? '' : ' primary'), type: 'button', id: 'ai-hw-use-' + r.id, disabled: cur, onclick: () => aiHwUse(r.id) }, cur ? icon('check', 13) : null, cur ? t('ai.ol.using') : t('ai.ol.use'))
    : pulling ? h('span', { class: 'hint' }, t('ai.ol.pulling.n', r.id))
    : h('button', { class: 'btn sm', type: 'button', id: 'ai-hw-get-' + r.id, disabled: !ol.running || !!AIHW.pull || r.fit === 'no', 'data-tip': !ol.running ? t('ai.ol.need') : r.fit === 'no' ? t('ai.fit.no.h') : '', onclick: () => aiHwPull(r.id) }, icon('download', 13), t('ai.ol.get'));
  return h('div', { class: 'ai-hw-row fit-' + fit, 'data-model': r.id },
    h('div', { class: 'ai-hw-m' }, h('b', { class: 'mono' }, r.id), h('span', { class: 'hint' }, ' · ' + t('ai.hw.size', aiGbText(r.gb)) + ' · ' + t(r.kind === 'code' ? 'ai.hw.code' : 'ai.hw.gen')), have ? h('span', { class: 'ai-hw-have' }, icon('check', 12), t('ai.ol.got')) : null),
    h('div', { class: 'ai-hw-n hint' }, t(r.note)),
    h('div', { class: 'ai-hw-f' }, h('span', { class: 'ai-fit ' + fit, 'data-tip': t('ai.fit.' + (fit === 'unified' ? 'gpu' : fit) + '.h') }, t('ai.fit.' + fit)), act));
}
/** Карточка «Подбор модели под ваш компьютер». Перерисовывает сама себя (#ai-hw). */
function aiHwCard() {
  const card = h('div', { class: 'ai-card ai-hw', id: 'ai-hw' });
  card.append(h('div', { class: 'ai-hw-head' }, icon('flask', 16), h('b', t('ai.hw.h'))), h('div', { class: 'hint' }, t('ai.hw.t')));
  if (!AIHD) { card.append(h('div', { class: 'hint warn-t', id: 'ai-hw-old' }, t('ai.hw.old'))); return card; }
  if (!AIHW.hw) { card.append(h('div', { class: 'hint', id: 'ai-hw-load' }, t('ai.hw.load'))); if (!AIHW.load) setTimeout(() => aiHwLoad(), 0); return card; }
  const plan = aiHwPlan(AIHW.hw), ol = AIHW.ol || { running: false, models: [] };
  card.append(h('div', { class: 'ai-hw-sys', id: 'ai-hw-sys' }, ...aiHwLines(AIHW.hw, plan)));
  if (plan.rec) card.append(h('div', { class: 'ai-hw-rec', id: 'ai-hw-rec' }, icon('check', 14), h('span', {}, t('ai.hw.rec', plan.rec.id, aiGbText(plan.rec.gb), t('ai.hw.rec.' + plan.why)))));
  /* Ollama */
  if (ol.running) card.append(h('div', { class: 'hint', id: 'ai-ol-st' }, icon('check', 13), ' ', t('ai.ol.on', ol.version || '?', (ol.models || []).length)));
  else card.append(h('div', { class: 'hint warn-t', id: 'ai-ol-st' }, icon('alert', 13), ' ', t('ai.ol.off')),
    h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm', type: 'button', id: 'ai-ol-install', onclick: () => aiExt('https://ollama.com/download') }, icon('open', 13), t('ai.ol.install')),
      h('button', { class: 'btn sm', type: 'button', id: 'ai-ol-recheck', onclick: async () => { await aiHwRefreshOl(); aiHwRepaint(); } }, icon('refresh', 13), t('ai.ol.recheck'))));
  /* скачивание */
  if (AIHW.pull) {
    const p = AIHW.pull;
    card.append(h('div', { class: 'ai-hw-pull', id: 'ai-hw-pull' }, h('div', { id: 'ai-hw-ptxt' }, aiHwPullText(p)),
      h('progress', { id: 'ai-hw-bar', max: '100', value: String(p.pct || 0), class: 'ai-hw-bar' }),
      h('button', { class: 'btn sm', type: 'button', id: 'ai-hw-cancel', onclick: aiHwCancel }, t('ai.ol.cancel'))));
  }
  if (AIHW.err) card.append(h('div', { class: 'hint warn-t', id: 'ai-hw-err' }, icon('alert', 13), ' ', AIHW.err));
  else if (AIHW.note) card.append(h('div', { class: 'hint', id: 'ai-hw-note' }, icon('check', 13), ' ', AIHW.note));
  /* модели: рекомендованная всегда, остальные по кнопке */
  const rows = AIHW.all ? plan.rows : plan.rows.filter(r => plan.rec && r.id === plan.rec.id);
  card.append(h('div', { class: 'ai-hw-list', id: 'ai-hw-list' }, ...rows.map(r => aiHwRow(r, plan))));
  card.append(h('div', { class: 'nt-btns' },
    h('button', { class: 'btn sm', type: 'button', id: 'ai-hw-all', onclick: () => { AIHW.all = !AIHW.all; aiHwRepaint(); } }, t(AIHW.all ? 'ai.hw.table.hide' : 'ai.hw.table')),
    h('button', { class: 'btn sm', type: 'button', id: 'ai-hw-reload', 'data-tip': t('ai.ol.recheck'), onclick: () => { AIHW.hw = null; AIHW.err = ''; AIHW.note = ''; aiHwRepaint(); } }, icon('refresh', 13))));
  card.append(h('div', { class: 'hint' }, t('ai.ol.warn.big')), h('div', { class: 'hint' }, t('ai.lm.hint')));
  return card;
}

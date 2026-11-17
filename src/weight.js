'use strict';
/* ====== Вес ресурсов (1.6.7) ======
   Картинка 4000×3000 на экране игры 1920×1080 не нужна, но в памяти телефона занимает около 46 МБ, а звук в WAV весит в десять раз
   больше, чем тот же звук в OGG. Здесь видно, что в проекте тяжёлое: размеры по видам ресурсов, самые тяжёлые файлы, размеры картинок
   в пикселях и пометки «слишком большая картинка», «тяжёлый файл», «лучше OGG». Сборка добавляет самое важное в отчёт.
   Размеры файлов берём из реестра (они известны сразу), размеры в пикселях читаем из самих картинок по запросу и запоминаем. */

Object.assign(D, {
  'wt.btn': ['Вес ресурсов…', 'Asset weight…'],
  'wt.title': ['Вес ресурсов', 'Asset weight'],
  'wt.lead': ['Что в проекте тяжёлое: большие картинки, длинные записи, звук без сжатия. Для телефона важны и размер игры (долго скачивать), и память (большие картинки её съедают).', 'What is heavy in the project: big pictures, long recordings, uncompressed sound. On a phone both the game size (slow to download) and memory (big pictures eat it) matter.'],
  'wt.empty': ['В реестре пока нет загруженных файлов: картинок, звука, шрифтов.', 'The registry has no uploaded files yet: pictures, sound, fonts.'],
  'wt.total': ['Всего', 'Total'],
  'wt.k.bg': ['Фоны', 'Backgrounds'], 'wt.k.sprite': ['Спрайты', 'Sprites'], 'wt.k.gui': ['Интерфейс', 'Interface'], 'wt.k.music': ['Музыка', 'Music'], 'wt.k.sfx': ['Звуки', 'Sounds'], 'wt.k.voice': ['Озвучка', 'Voice-over'], 'wt.k.font': ['Шрифты', 'Fonts'], 'wt.k.video': ['Видео', 'Video'],
  'wt.cnt': ['{0} шт.', '{0} files'],
  'wt.v.ok': ['Размер нормальный для телефона.', 'The size is fine for a phone.'],
  'wt.v.mid': ['Игра средней тяжести: на телефоне скачается заметно дольше, чем лёгкая.', 'A medium-weight game: it takes noticeably longer to download on a phone.'],
  'wt.v.big': ['Игра тяжёлая: для телефона это много, мобильный интернет и память могут не потянуть.', 'The game is heavy: a lot for a phone, mobile data and memory may not cope.'],
  'wt.v.px': ['Есть картинки крупнее, чем нужно экрану игры: они едят память телефона.', 'Some pictures are larger than the game screen needs: they eat phone memory.'],
  'wt.f.all': ['Все', 'All'], 'wt.f.bad': ['С замечаниями', 'With remarks'], 'wt.f.img': ['Картинки', 'Pictures'], 'wt.f.aud': ['Звук', 'Sound'],
  'wt.flag.big': ['тяжёлый файл', 'heavy file'],
  'wt.flag.px': ['крупнее экрана игры', 'larger than the game screen'],
  'wt.flag.wav': ['без сжатия: лучше OGG', 'uncompressed: better as OGG'],
  'wt.none.bad': ['Замечаний нет: тяжёлых файлов и лишне крупных картинок не найдено.', 'No remarks: no heavy files or oversized pictures found.'],
  'wt.nofilter': ['По этому фильтру ничего нет.', 'Nothing matches this filter.'],
  'wt.more': ['Показать ещё', 'Show more'],
  'wt.reg': ['В реестре', 'In the registry'], 'wt.reg.t': ['Открыть этот ресурс в реестре', 'Open this asset in the registry'],
  'wt.copy': ['Копировать список', 'Copy the list'], 'wt.copied': ['Список скопирован', 'List copied'], 'wt.copyfail': ['Не удалось скопировать', 'Could not copy'],
  'wt.scan': ['Измеряю картинки: {0} из {1}', 'Measuring pictures: {0} of {1}'],
  'wt.px': ['{0}×{1}, в памяти около {2}', '{0}×{1}, about {2} in memory'],
  'wt.foot': ['Размер в памяти считается так: ширина × высота × 4 байта на каждую картинку, показанную на экране. Пороги: файл-картинка тяжелее {0}, звук тяжелее {1}, картинка крупнее 2560×1440. Это ориентиры, не запреты: фон, по которому камера «ездит», может быть больше экрана.', 'Memory is estimated as width × height × 4 bytes for every picture shown on screen. Limits: a picture file heavier than {0}, a sound heavier than {1}, a picture larger than 2560×1440. These are guides, not bans: a background the camera pans over may be larger than the screen.'],
  /* отчёт сборки */
  'wt.rep.big': ['Файл «{0}» ({1}) весит {2}. Для телефона лучше до {3}: сохраните фон в WebP или JPG, а картинку крупнее экрана игры уменьшите.', 'The file “{0}” ({1}) weighs {2}. For a phone aim for under {3}: save a background as WebP or JPG and shrink a picture larger than the game screen.'],
  'wt.rep.aud': ['Звук «{0}» ({1}) весит {2}. Для игры хватает OGG или Opus: он легче в 5–10 раз.', 'The sound “{0}” ({1}) weighs {2}. OGG or Opus is enough for a game: it is 5–10 times lighter.'],
  'wt.rep.more': ['…и ещё {0} тяжёлых файлов (все в окне «Вес ресурсов»)', '…and {0} more heavy files (all in the “Asset weight” window)'],
  'wt.rep.total': ['Ресурсы игры весят {0} (картинки {1}, звук {2}). Для телефона ориентир до {3}: больше долго скачивать и тяжело держать в памяти. Подробности: Инструменты → «Вес ресурсов».', 'The game assets weigh {0} (pictures {1}, sound {2}). For a phone aim for under {3}: more is slow to download and heavy to keep in memory. Details: Tools → “Asset weight”.'],
});

const WT_MB = 1048576;
const WT_LIM = { img: 4 * WT_MB, aud: 12 * WT_MB, wav: 3 * WT_MB, pxMax: 2560 * 1440, soft: 150 * WT_MB, hard: 300 * WT_MB };
const WT = { dim: new Map(), run: 0 };
const WT_LOSSLESS = new Set(['wav', 'flac', 'bmp']);
const WT_KINDS = ['bg', 'sprite', 'gui', 'music', 'sfx', 'voice', 'font', 'video'];
const WT_FILTERS = ['all', 'bad', 'img', 'aud'];

/** Строки: по одной на каждый загруженный файл ресурса. list — [{a,key,m}] или всё из реестра. */
function wtRows(list) {
  const src = list || P.assets.filter(a => hasFilesKind(a.kind)).flatMap(a => Object.entries(a.files || {}).filter(([k, m]) => m && !(a.kind === 'sprite' && k && !a.expr.includes(k))).map(([key, m]) => ({ a, key, m })));
  return src.map(x => {
    const ext = metaExt(x.m) || '', size = +x.m.size || 0, kind = x.a.kind;
    const isImg = isImageKind(kind), isAud = AUDIO_KINDS.includes(kind);
    const nm = x.a.name + (x.key ? ' · ' + x.key : '');
    const row = { a: x.a, key: x.key, m: x.m, kind, ext, size, isImg, isAud, name: nm, flags: [] };
    if (isImg && size > WT_LIM.img) row.flags.push('big');
    if (isAud && size > WT_LIM.aud) row.flags.push('big');
    if (isAud && WT_LOSSLESS.has(ext) && size > WT_LIM.wav) row.flags.push('wav');
    return row;
  });
}
/** Размеры картинки в пикселях (из кэша). */
function wtDimOf(row) { return row.m && row.m.bid ? WT.dim.get(row.m.bid) || null : null; }
function wtApplyDim(row) {
  const d = wtDimOf(row); row.dim = d;
  row.flags = row.flags.filter(f => f !== 'px');
  if (d && d.w && d.h && d.w * d.h > WT_LIM.pxMax) row.flags.push('px');
  return row;
}
const wtMem = d => d.w * d.h * 4;
/** Прочитать размеры картинок в пикселях (асинхронно, без полной отрисовки); результат запоминается. */
async function wtScan(rows, onStep) {
  const todo = rows.filter(r => r.isImg && r.m.bid && !WT.dim.has(r.m.bid) && r.ext !== 'svg');
  const run = ++WT.run; let done = 0;
  for (const r of todo) {
    if (run !== WT.run) return false;
    let d = { w: 0, h: 0 };
    try {
      const blob = await blobGet(r.m.bid);
      if (blob && typeof createImageBitmap === 'function') { const bm = await createImageBitmap(blob); d = { w: bm.width, h: bm.height }; if (bm.close) bm.close(); }
    } catch (e) { /* не картинка или не читается: без размеров */ }
    WT.dim.set(r.m.bid, d); done++;
    if (onStep) onStep(done, todo.length);
  }
  return true;
}

/** Строки отчёта сборки по размерам (то, что известно без чтения картинок). assetFiles: [{a,key,m,target}]. */
function wtReport(add, assetFiles) {
  const rows = wtRows(assetFiles);
  if (!rows.length) return;
  const big = rows.filter(r => r.flags.includes('big')).sort((a, b) => b.size - a.size);
  const wav = rows.filter(r => r.flags.includes('wav') && !r.flags.includes('big')).sort((a, b) => b.size - a.size);
  const show = (r, key) => add('warn', t(key, assetFiles.find(x => x.a === r.a && x.key === r.key).target || r.name, t('wt.k.' + r.kind), humanSize(r.size), humanSize(r.isImg ? WT_LIM.img : WT_LIM.aud)), null);
  big.slice(0, 5).forEach(r => show(r, r.isAud ? 'wt.rep.aud' : 'wt.rep.big'));
  wav.slice(0, 3).forEach(r => show(r, 'wt.rep.aud'));
  const rest = Math.max(0, big.length - 5) + Math.max(0, wav.length - 3);
  if (rest) add('info', t('wt.rep.more', rest));
  const sum = f => rows.filter(f).reduce((s, r) => s + r.size, 0), total = sum(() => true);
  if (total >= WT_LIM.soft) add(total >= WT_LIM.hard ? 'warn' : 'info', t('wt.rep.total', humanSize(total), humanSize(sum(r => r.isImg)), humanSize(sum(r => r.isAud)), humanSize(WT_LIM.soft)));
}

/* ---------- окно ---------- */
const WTW = { filter: 'all', more: 40 };
function wtText(rows, total) {
  const L = [t('wt.title') + ': ' + (P.name || '') + ' · ' + humanSize(total), ''];
  rows.forEach(r => L.push('- ' + r.name + ' [' + t('wt.k.' + r.kind) + ', ' + (r.ext || '?') + '] ' + humanSize(r.size) + (r.dim && r.dim.w ? ', ' + r.dim.w + '×' + r.dim.h : '') + (r.flags.length ? ' ⚠ ' + r.flags.map(f => t('wt.flag.' + f)).join(', ') : '')));
  return L.join('\n');
}
function openWeight() {
  closePopover();
  const rows = wtRows(); rows.forEach(wtApplyDim);
  let scanText = '';
  openModal({
    cls: 'wt-m', onClose: () => { WT.run++; },
    build: m => {
      const body = h('div', { class: 'wt-body' });
      const paint = () => {
        rows.forEach(wtApplyDim);
        const total = rows.reduce((s, r) => s + r.size, 0);
        if (!rows.length) { body.replaceChildren(h('div', { class: 'empty' }, t('wt.empty'))); return; }
        const by = {}; for (const k of WT_KINDS) by[k] = { n: 0, size: 0 };
        for (const r of rows) if (by[r.kind]) { by[r.kind].n++; by[r.kind].size += r.size; }
        const tile = (label, sub, size, share) => h('div', { class: 'wt-tile' }, h('div', { class: 'wt-tl' }, label), h('div', { class: 'wt-tv' }, humanSize(size)), h('div', { class: 'hint' }, sub),
          share != null ? h('div', { class: 'wt-bar' }, h('i', { style: { width: Math.max(2, Math.round(share * 100)) + '%' } })) : null);
        const tiles = [tile(t('wt.total'), t('wt.cnt', rows.length), total, null)];
        for (const k of WT_KINDS) if (by[k].n) tiles.push(tile(t('wt.k.' + k), t('wt.cnt', by[k].n), by[k].size, total ? by[k].size / total : 0));
        const anyPx = rows.some(r => r.flags.includes('px'));
        const verdict = total >= WT_LIM.hard ? 'big' : total >= WT_LIM.soft ? 'mid' : 'ok';
        const bad = rows.filter(r => r.flags.length);
        const flt = WTW.filter;
        let view = rows.slice();
        if (flt === 'bad') view = bad.slice(); else if (flt === 'img') view = rows.filter(r => r.isImg); else if (flt === 'aud') view = rows.filter(r => r.isAud);
        view.sort((a, b) => b.size - a.size);
        const chips = WT_FILTERS.map(f => h('button', { class: 'chip' + (flt === f ? ' on' : ''), 'data-f': f, onclick: () => { WTW.filter = f; WTW.more = 40; paint(); } }, t('wt.f.' + f) + (f === 'bad' ? ' (' + bad.length + ')' : '')));
        const list = view.length ? view.slice(0, WTW.more).map(r => {
          const d = r.dim;
          return h('div', { class: 'wt-row' + (r.flags.length ? ' bad' : ''), 'data-kind': r.kind },
            h('span', { class: 'wt-kind' }, t('wt.k.' + r.kind)),
            h('div', { class: 'wt-main' }, h('b', r.name),
              h('div', { class: 'hint' }, [(r.ext || '?').toUpperCase(), d && d.w ? t('wt.px', d.w, d.h, humanSize(wtMem(d))) : null].filter(Boolean).join(' · ')),
              r.flags.length ? h('div', { class: 'wt-flags' }, r.flags.map(f => h('span', { class: 'wt-flag' }, icon('alert', 12), t('wt.flag.' + f)))) : null),
            h('div', { class: 'wt-size' }, humanSize(r.size)),
            h('button', { class: 'btn sm', 'data-tip': t('wt.reg.t'), onclick: () => { m.close(); openRegistry(AUDIO_KINDS.includes(r.kind) ? 'audio' : r.kind); if (REG) { REG.q = r.a.name; renderReg(); } } }, t('wt.reg')));
        }) : [h('div', { class: 'empty' }, flt === 'bad' ? t('wt.none.bad') : t('wt.nofilter'))];
        body.replaceChildren(
          h('p', { class: 'hint' }, t('wt.lead')),
          h('div', { class: 'wt-tiles' }, ...tiles),
          h('div', { class: 'bs-hint ' + (verdict === 'ok' && !anyPx ? '' : 'warn'), id: 'wt-verdict' }, icon(verdict === 'ok' && !anyPx ? 'check' : 'alert', 15), t('wt.v.' + verdict), anyPx ? ' ' + t('wt.v.px') : ''),
          scanText ? h('div', { class: 'hint', id: 'wt-scan' }, scanText) : null,
          h('div', { class: 'wt-bar2' }, ...chips, h('div', { class: 'grow' }),
            h('button', { class: 'btn sm', id: 'wt-copy', onclick: async () => { toast((await copyText(wtText(view, total))) ? t('wt.copied') : t('wt.copyfail')); } }, icon('copy', 14), t('wt.copy'))),
          h('div', { class: 'wt-list' }, ...list),
          view.length > WTW.more ? h('button', { class: 'btn', onclick: () => { WTW.more += 60; paint(); } }, t('wt.more') + ' (' + (view.length - WTW.more) + ')') : null,
          h('div', { class: 'hint wt-foot' }, t('wt.foot', humanSize(WT_LIM.img), humanSize(WT_LIM.aud))));
      };
      paint();
      wtScan(rows, (n, all) => { scanText = n < all ? t('wt.scan', n, all) : ''; if (!m.closed && (n === all || n % 4 === 0)) paint(); });
      return h('div', { class: 'm-wrap' }, modalHead(t('wt.title'), m), body);
    }
  });
}
TOOL_ITEMS.push({ id: 'weight', group: 'story', ic: 'scale', key: 'wt.btn', kw: 'weight size heavy big images pictures sound audio wav ogg webp compress megabytes phone memory mobile вес размер тяжёлые большие картинки звук мегабайты сжать телефон память', run: () => openWeight() });

'use strict';
/* ====== Карта в PDF ======
   Карта рисуется в картинку нужного размера и собирается в PDF прямо в приложении, без сервера и без окна печати:
   работает и в браузере, и в программе на компьютере. Можно уместить всю карту на один лист, сделать лист по размеру карты
   или разбить крупную карту на несколько листов (потом склеить). Картинка сжимается без потерь, текст остаётся чётким. */

Object.assign(D, {
  'mp.btn': ['Карта в PDF…', 'Map to PDF…'], 'mp.menu': ['Карта в PDF…', 'Map to PDF…'],
  'mp.title': ['Карта в PDF', 'Map to PDF'],
  'mp.area': ['Что печатать', 'What to print'], 'mp.area.all': ['Вся карта', 'Whole map'], 'mp.area.view': ['Как на экране', 'As on screen'], 'mp.area.sel': ['Выделенное ({0})', 'Selection ({0})'],
  'mp.paper': ['Бумага', 'Paper'], 'mp.paper.map': ['По размеру карты (один большой лист)', 'Sized to the map (one big sheet)'],
  'mp.orient': ['Ориентация', 'Orientation'], 'mp.o.auto': ['Авто', 'Auto'], 'mp.o.land': ['Альбомная', 'Landscape'], 'mp.o.port': ['Книжная', 'Portrait'],
  'mp.mode': ['Масштаб', 'Scale'], 'mp.m.fit': ['Уместить на одном листе', 'Fit on one sheet'], 'mp.m.tile': ['Крупно, на нескольких листах', 'Large, on several sheets'],
  'mp.zoom': ['Увеличение', 'Zoom'], 'mp.zoom.h': ['100% — как карта выглядит на экране при обычном размере', '100% is how the map looks on screen at normal size'],
  'mp.theme': ['Оформление', 'Look'], 'mp.t.light': ['Светлое', 'Light'], 'mp.t.dark': ['Тёмное', 'Dark'], 'mp.t.cur': ['Как сейчас', 'Current'],
  'mp.dpi': ['Чёткость', 'Sharpness'], 'mp.dpi.120': ['Черновик', 'Draft'], 'mp.dpi.200': ['Обычная', 'Normal'], 'mp.dpi.300': ['Высокая', 'High'],
  'mp.head': ['Подпись на листах (название, дата, номер листа)', 'Caption on sheets (title, date, sheet number)'],
  'mp.frame': ['Рамка вокруг листа (удобно склеивать)', 'Frame around each sheet (handy for joining)'],
  'mp.info.sheets': ['Листов: {0}', 'Sheets: {0}'], 'mp.info.one': ['1 лист', '1 sheet'],
  'mp.info': ['{0}, {1}, увеличение {2}%, {3} точек на дюйм', '{0}, {1}, zoom {2}%, {3} dpi'],
  'mp.info.cut': ['Чёткость снижена до {0}, иначе лист получится слишком тяжёлым.', 'Sharpness lowered to {0}, otherwise the sheet would be too heavy.'],
  'mp.info.big': ['Листов слишком много. Выберите меньшее увеличение или бумагу крупнее.', 'Too many sheets. Choose a smaller zoom or larger paper.'],
  'mp.go': ['Сохранить PDF', 'Save PDF'], 'mp.cancel': ['Остановить', 'Stop'],
  'mp.prog': ['Лист {0} из {1}…', 'Sheet {0} of {1}…'], 'mp.pack': ['Собираю файл…', 'Building the file…'],
  'mp.fail': ['Не удалось собрать PDF. Попробуйте меньшую чёткость или увеличение.', 'Could not build the PDF. Try a lower sharpness or zoom.'],
  'mp.done': ['PDF готов: листов {0}', 'PDF is ready: {0} sheets'],
  'mp.empty': ['На карте пока нет блоков.', 'There are no blocks on the map yet.'],
  'mp.sheet': ['Лист {0} из {1}', 'Sheet {0} of {1}'], 'mp.prev.h': ['Так карта ляжет на листы. Пунктир — границы листов.', 'How the map lies on the sheets. Dashes are the sheet borders.'],
  'mp.land': ['альбомная', 'landscape'], 'mp.port': ['книжная', 'portrait'], 'mp.custom': ['лист по размеру карты', 'sheet sized to the map'],
});

const MM = 72 / 25.4;                                          // точек PDF в миллиметре
const MP_PAPER = { a4: [210, 297, 'A4'], a3: [297, 420, 'A3'], a2: [420, 594, 'A2'], letter: [215.9, 279.4, 'Letter'] };
const MP_ST = { area: 'all', paper: 'a4', orient: 'auto', mode: 'fit', zoom: 75, theme: 'light', dpi: 200, head: true, frame: true };
const MP_MAX_PX = 36e6, MP_MAX_SIDE = 16000, MP_MAX_PT = 14400, MP_MAX_SHEETS = 120;

const mpColName = c => { let s = '', n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };

/** Раскладка листов. box = {x, y, w, h} в единицах карты, o — настройки. Ничего не рисует, только считает. */
function mpPlan(box, o) {
  const MARG = 10 * MM, TOP = MARG + (o.head ? 6 * MM : 0);
  const uz = clamp(+o.zoom || 75, 10, 400) / 100 * 0.75;       // точек на единицу карты (100% = 96 точек на дюйм, как на экране)
  const layout = (W, H) => {
    const aw = W - 2 * MARG, ah = H - TOP - MARG;
    if (o.mode === 'fit') return { W, H, aw, ah, u: Math.min(aw / box.w, ah / box.h, 1.5), cols: 1, rows: 1 };
    return { W, H, aw, ah, u: uz, cols: Math.max(1, Math.ceil(box.w * uz / aw - 1e-6)), rows: Math.max(1, Math.ceil(box.h * uz / ah - 1e-6)) };
  };
  let L, orient;
  if (o.paper === 'map') {
    const u = Math.min(uz, (MP_MAX_PT - 2 * MARG) / box.w, (MP_MAX_PT - TOP - MARG) / box.h);
    L = { W: box.w * u + 2 * MARG, H: box.h * u + TOP + MARG, aw: box.w * u, ah: box.h * u, u, cols: 1, rows: 1 }; orient = 'map';
  } else {
    const p = MP_PAPER[o.paper] || MP_PAPER.a4, port = layout(p[0] * MM, p[1] * MM), land = layout(p[1] * MM, p[0] * MM);
    if (o.orient === 'port') { L = port; orient = 'port'; } else if (o.orient === 'land') { L = land; orient = 'land'; }
    else {
      const better = o.mode === 'fit' ? land.u > port.u + 1e-9 : land.cols * land.rows < port.cols * port.rows || (land.cols * land.rows === port.cols * port.rows && box.w >= box.h);
      L = better ? land : port; orient = better ? 'land' : 'port';
    }
  }
  const rw = L.aw / L.u, rh = L.ah / L.u, pages = [];
  for (let r = 0; r < L.rows; r++) for (let c = 0; c < L.cols; c++) {
    const single = L.cols * L.rows === 1;
    pages.push({ c, r, label: mpColName(c) + (r + 1), w: rw, h: rh,
      x: single ? box.x - (rw - box.w) / 2 : box.x + c * rw, y: single ? box.y - (rh - box.h) / 2 : box.y + r * rh });
  }
  const sheetMm = [Math.round(L.W / MM), Math.round(L.H / MM)];
  return { ...L, orient, n: pages.length, pages, box, marg: MARG, top: TOP, sheetMm, tooMany: pages.length > MP_MAX_SHEETS };
}
/** Чёткость с учётом размера листа: огромные листы не должны съедать память. */
function mpDpi(plan, want) {
  const inW = plan.W / 72, inH = plan.H / 72;
  return Math.max(30, Math.min(want, Math.floor(Math.sqrt(MP_MAX_PX / (inW * inH))), Math.floor(MP_MAX_SIDE / Math.max(inW, inH))));
}
function mpViewBox(svg) {
  const m = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg);
  return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : { x: 0, y: 0, w: 400, h: 300 };
}
/** Что печатаем: вся карта (границы берём у SVG-экспорта), видимая часть окна или выделенные блоки. */
function mpBase(area, svg) {
  if (area === 'view') {
    const r = stage.getBoundingClientRect(), v = P.view;
    if (r.width > 20 && r.height > 20) return { x: -v.x / v.k, y: -v.y / v.k, w: r.width / v.k, h: r.height / v.k };
  }
  if (area === 'sel') {
    const bb = nodesBBox([...UI.sel].map(nodeById).filter(Boolean));
    if (bb) return { x: bb.x0 - 40, y: bb.y0 - 40, w: bb.x1 - bb.x0 + 80, h: bb.y1 - bb.y0 + 80 };
  }
  return mpViewBox(svg);
}
/** Тот же SVG, но с другим окном просмотра: рисуем только нужный кусок карты нужного размера в точках. */
function mpSvgFor(svg, reg, wpx, hpx) {
  const r2n = v => Math.round(v * 100) / 100;
  return svg.replace(/<svg\b[^>]*>/, tag => tag
    .replace(/viewBox="[^"]*"/, `viewBox="${r2n(reg.x)} ${r2n(reg.y)} ${r2n(reg.w)} ${r2n(reg.h)}"`)
    .replace(/ width="[^"]*"/, ` width="${wpx}"`).replace(/ height="[^"]*"/, ` height="${hpx}"`));
}
function mpImage(svgStr) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }));
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); res(im); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('svg')); };
    im.src = url;
  });
}
const mpTheme = o => (o.theme === 'cur' ? S.theme : o.theme);

/** Картинка в сжатый вид для PDF: без потерь (Flate), а если браузер не умеет или лист огромный — JPEG. */
async function mpEncode(cv) {
  const w = cv.width, h = cv.height;
  if (typeof CompressionStream === 'function' && w * h <= 24e6) {
    try {
      const px = cv.getContext('2d').getImageData(0, 0, w, h).data, rgb = new Uint8Array(w * h * 3);
      for (let i = 0, j = 0; i < px.length; i += 4) { rgb[j++] = px[i]; rgb[j++] = px[i + 1]; rgb[j++] = px[i + 2]; }
      const buf = await new Response(new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer();
      return { kind: 'flate', data: new Uint8Array(buf), w, h };
    } catch (e) { /* упадём на JPEG */ }
  }
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.93));
  if (!blob) throw new Error('encode');
  return { kind: 'jpeg', data: new Uint8Array(await blob.arrayBuffer()), w, h };
}

/** Один лист: фон, кусок карты, подпись и рамка. Возвращает холст. */
async function mpRenderSheet(svg, plan, o, pg, idx, pl, dpi) {
  const k = dpi / 72, cv = document.createElement('canvas');
  cv.width = Math.round(plan.W * k); cv.height = Math.round(plan.H * k);
  const g = cv.getContext('2d');
  g.fillStyle = pl.canvas; g.fillRect(0, 0, cv.width, cv.height);
  const cx = Math.round(plan.marg * k), cy = Math.round(plan.top * k), cw = Math.round(plan.aw * k), ch = Math.round(plan.ah * k);
  const img = await mpImage(mpSvgFor(svg, pg, cw, ch));
  g.drawImage(img, cx, cy, cw, ch);
  const gray = mpTheme(o) === 'dark' ? '#9aa3b2' : '#6b7280';
  if (o.head) {
    g.fillStyle = gray; g.font = `${Math.round(8 * k)}px ${FONT_FAMILY}`; g.textBaseline = 'alphabetic';
    const y = Math.round((plan.marg + 3.2 * MM) * k), date = new Date().toLocaleDateString(S.lang === 'ru' ? 'ru-RU' : 'en-US');
    g.textAlign = 'left'; g.fillText((P.name || '') + ' · ' + date, cx, y);
    g.textAlign = 'right'; g.fillText(t('mp.sheet', idx + 1, plan.n) + (plan.cols * plan.rows > 1 ? ' · ' + pg.label : ''), cx + cw, y);
  }
  if (o.frame && plan.n > 1) { g.strokeStyle = gray; g.lineWidth = Math.max(1, 0.5 * k); g.setLineDash([]); g.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1); }
  return cv;
}

/** Простейший PDF: на каждую страницу одна картинка во весь лист. */
function mpPdf(pages, title) {
  const enc = new TextEncoder(), chunks = [], offs = [];
  let off = 0;
  const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); off += b.length; };
  const begin = n => { offs[n] = off; put(`${n} 0 obj\n`); };
  const num = v => (Math.round(v * 100) / 100).toString();
  const hex16 = str => '<FEFF' + [...String(str)].map(c => c.codePointAt(0).toString(16).padStart(c.codePointAt(0) > 0xFFFF ? 8 : 4, '0')).join('') + '>';
  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  begin(1); put('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  begin(2); put(`<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + 3 * i} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`);
  begin(3); put(`<< /Title ${hex16(title || '')} /Producer ${hex16('Карта новеллы')} >>\nendobj\n`);
  pages.forEach((pg, i) => {
    const pn = 4 + 3 * i, cn = pn + 1, im = pn + 2, W = num(pg.W), H = num(pg.H);
    begin(pn); put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${im} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${cn} 0 R >>\nendobj\n`);
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q\n`;
    begin(cn); put(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
    begin(im); put(`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /${pg.kind === 'jpeg' ? 'DCTDecode' : 'FlateDecode'} /Length ${pg.data.length} >>\nstream\n`);
    put(pg.data); put('\nendstream\nendobj\n');
  });
  const count = 4 + 3 * pages.length, xr = off;
  put(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n++) put(String(offs[n]).padStart(10, '0') + ' 00000 n \n');
  put(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xr}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}

/** Целиком: раскладка → листы → PDF. onProg(i, n) сообщает о ходе, cancel.stop прерывает. Возвращает { blob, plan, dpi } или null. */
async function mpMake(o, onProg, cancel) {
  const th = mpTheme(o), svg = buildExportSVG(th), pl = THEMES[th] || pal();
  const plan = mpPlan(mpBase(o.area, svg), o);
  if (plan.tooMany) throw new Error('many');
  const dpi = mpDpi(plan, o.dpi), pages = [];
  for (let i = 0; i < plan.n; i++) {
    if (cancel && cancel.stop) return null;
    if (onProg) onProg(i, plan.n);
    await new Promise(r => setTimeout(r, 0));                  // даём окну перерисоваться
    const cv = await mpRenderSheet(svg, plan, o, plan.pages[i], i, pl, dpi);
    const e = await mpEncode(cv);
    cv.width = cv.height = 0;
    pages.push({ W: plan.W, H: plan.H, ...e });
  }
  if (cancel && cancel.stop) return null;
  return { blob: mpPdf(pages, P.name || ''), plan, dpi, kinds: [...new Set(pages.map(p => p.kind))] };
}

/* ---------- окно ---------- */
function openMapPdf() {
  closePopover();
  const o = MP_ST, cancel = { stop: false };
  let busy = false, tok = 0, timer = 0;
  openModal({
    cls: 'mp-m', onClose: () => { cancel.stop = true; clearTimeout(timer); tok++; },
    build: m => {
      const body = h('div', { class: 'mp-body' }), prev = h('div', { class: 'mp-prev' }), ctl = h('div', { class: 'mp-ctl' });
      const cv = h('canvas', { class: 'mp-cv' }), info = h('div', { class: 'mp-info' }), warn = h('div', { class: 'mp-warn' });
      const prog = h('div', { class: 'mp-prog' }), bar = h('i'), progTxt = h('span');
      prog.append(h('div', { class: 'bs-bar' }, bar), progTxt);
      const go = h('button', { class: 'btn primary', onclick: () => run() }, icon('download', 16), t('mp.go'));
      const stop = h('button', { class: 'btn', onclick: () => { cancel.stop = true; } }, t('mp.cancel'));
      const nSel = [...UI.sel].filter(id => nodeById(id)).length;
      if (o.area === 'sel' && !nSel) o.area = 'all';

      const redraw = () => { clearTimeout(timer); timer = setTimeout(paintPreview, 90); };
      const set = (k, v) => { o[k] = v; render(); redraw(); };
      const seg = (k, opts) => segmented(opts.map(x => ({ value: x[0], label: x[1], tip: x[2] || null })), o[k], v => set(k, v));

      const render = () => {
        ctl.replaceChildren(
          field(t('mp.area'), (() => { const s = segmented([{ value: 'all', label: t('mp.area.all') }, { value: 'view', label: t('mp.area.view') }, ...(nSel ? [{ value: 'sel', label: t('mp.area.sel', nSel) }] : [])], o.area, v => set('area', v)); return s; })()),
          field(t('mp.paper'), (() => {
            const sel = h('select', { class: 'inp', id: 'mp-paper' }, ...Object.entries(MP_PAPER).map(([k, p]) => h('option', { value: k }, p[2] + ' · ' + p[0] + '×' + p[1] + ' ' + (S.lang === 'ru' ? 'мм' : 'mm'))), h('option', { value: 'map' }, t('mp.paper.map')));
            sel.value = o.paper; sel.addEventListener('change', () => set('paper', sel.value)); return sel;
          })()),
          o.paper === 'map' ? null : field(t('mp.orient'), seg('orient', [['auto', t('mp.o.auto')], ['land', t('mp.o.land')], ['port', t('mp.o.port')]])),
          o.paper === 'map' ? null : field(t('mp.mode'), seg('mode', [['fit', t('mp.m.fit')], ['tile', t('mp.m.tile')]])),
          o.paper === 'map' || o.mode === 'tile' ? field(t('mp.zoom'), (() => {
            const sel = h('select', { class: 'inp', id: 'mp-zoom' }, ...[25, 50, 75, 100, 150, 200].map(z => h('option', { value: z }, z + '%')));
            sel.value = String(o.zoom); sel.addEventListener('change', () => set('zoom', +sel.value)); return sel;
          })(), t('mp.zoom.h')) : null,
          field(t('mp.theme'), seg('theme', [['light', t('mp.t.light')], ['dark', t('mp.t.dark')], ['cur', t('mp.t.cur')]])),
          field(t('mp.dpi'), seg('dpi', [[120, t('mp.dpi.120')], [200, t('mp.dpi.200')], [300, t('mp.dpi.300')]])),
          switchEl(o.head, v => { o.head = v; redraw(); }, t('mp.head')),
          o.paper !== 'map' && o.mode === 'tile' ? switchEl(o.frame, v => { o.frame = v; }, t('mp.frame')) : null);
      };
      const planNow = () => {
        const th = mpTheme(o), svg = buildExportSVG(th);
        return { svg, th, plan: mpPlan(mpBase(o.area, svg), o) };
      };
      const paintPreview = async () => {
        const my = ++tok; if (!P.nodes.length) return;
        let pn; try { pn = planNow(); } catch (e) { return; }
        const { svg, th, plan } = pn, pl = THEMES[th] || pal();
        // окно просмотра = карта и все листы вместе
        let x0 = plan.box.x, y0 = plan.box.y, x1 = plan.box.x + plan.box.w, y1 = plan.box.y + plan.box.h;
        for (const pg of plan.pages) { x0 = Math.min(x0, pg.x); y0 = Math.min(y0, pg.y); x1 = Math.max(x1, pg.x + pg.w); y1 = Math.max(y1, pg.y + pg.h); }
        const U = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, maxW = 540, maxH = 300, sc = Math.min(maxW / U.w, maxH / U.h), W = Math.max(40, Math.round(U.w * sc)), H = Math.max(40, Math.round(U.h * sc)), dp = 2;
        cv.width = W * dp; cv.height = H * dp; cv.style.width = W + 'px'; cv.style.height = H + 'px';
        let im = null; try { im = await mpImage(mpSvgFor(svg, U, W * dp, H * dp)); } catch (e) { im = null; }
        if (my !== tok) return;
        const g = cv.getContext('2d'); g.fillStyle = pl.canvas; g.fillRect(0, 0, cv.width, cv.height);
        if (im) g.drawImage(im, 0, 0, cv.width, cv.height);
        g.setLineDash([6 * dp, 4 * dp]); g.lineWidth = 1.5 * dp; g.strokeStyle = '#3b82f6'; g.fillStyle = '#3b82f6'; g.font = `${600} ${11 * dp}px ${FONT_FAMILY}`;
        plan.pages.forEach((pg, i) => {
          const rx = (pg.x - U.x) * sc * dp, ry = (pg.y - U.y) * sc * dp, rw = pg.w * sc * dp, rh = pg.h * sc * dp;
          g.strokeRect(rx, ry, rw, rh);
          if (plan.n > 1 && plan.n <= 60) { g.save(); g.globalAlpha = 0.85; g.textAlign = 'left'; g.fillText(String(i + 1) + (plan.cols * plan.rows > 1 ? ' · ' + pg.label : ''), rx + 6 * dp, ry + 15 * dp); g.restore(); }
        });
        const dpi = mpDpi(plan, o.dpi), orient = plan.orient === 'map' ? t('mp.custom') : t('mp.' + (plan.orient === 'land' ? 'land' : 'port'));
        const paperName = plan.orient === 'map' ? plan.sheetMm.join('×') + (S.lang === 'ru' ? ' мм' : ' mm') : MP_PAPER[o.paper][2];
        info.replaceChildren(h('b', {}, plan.n === 1 ? t('mp.info.one') : t('mp.info.sheets', plan.n) + (plan.cols > 1 || plan.rows > 1 ? ' (' + plan.cols + ' × ' + plan.rows + ')' : '')),
          h('div', {}, t('mp.info', paperName, orient, Math.round(plan.u / 0.75 * 100), dpi)));
        warn.replaceChildren();
        if (plan.tooMany) warn.append(t('mp.info.big'));
        else if (dpi < o.dpi) warn.append(t('mp.info.cut', dpi));
        go.disabled = busy || plan.tooMany;
      };
      const run = async () => {
        if (busy) return;
        busy = true; cancel.stop = false; go.disabled = true; stop.style.display = ''; prog.style.display = '';
        try {
          const r = await mpMake(o, (i, n) => { bar.style.width = (i / n * 100) + '%'; progTxt.textContent = t('mp.prog', i + 1, n); }, cancel);
          if (r) {
            bar.style.width = '100%'; progTxt.textContent = t('mp.pack');
            const ok = await saveFile(slug(P.name) + '_map.pdf', r.blob, 'application/pdf');
            if (ok) { toast(t('mp.done', r.plan.n)); m.close(); return; }
          }
        } catch (e) { toast(t('mp.fail'), 5000); }
        busy = false; go.disabled = false; stop.style.display = 'none'; prog.style.display = 'none';
      };
      stop.style.display = 'none'; prog.style.display = 'none';
      render();
      if (!P.nodes.length) prev.append(h('div', { class: 'empty' }, t('mp.empty')));
      else prev.append(h('div', { class: 'mp-cvbox' }, cv), info, warn, h('div', { class: 'hint' }, t('mp.prev.h')));
      body.append(ctl, prev);
      setTimeout(paintPreview, 30);
      return h('div', { class: 'm-wrap' }, modalHead(t('mp.title'), m), body, h('div', { class: 'm-foot mp-foot' }, prog, h('div', { class: 'grow' }), stop, go));
    }
  });
}
TOOL_ITEMS.push({ id: 'mappdf', group: 'map', ic: 'image', key: 'mp.btn', kw: 'map pdf print export sheet paper a4 a3 poster карта печать лист бумага постер экспорт', run: () => openMapPdf() });

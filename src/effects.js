'use strict';
/* ====== Переходы и трансформы: каталог Ren'Py, свои эффекты, редактор, предпросмотр ======
   Переход — то, что пишется после with (with dissolve). Трансформ — то, что пишется после at (show alice at left).
   Готовые есть в самом Ren'Py: их достаточно упомянуть по имени. Свои описываются в редакторе и попадают в game/effects.rpy. */

const FX_GROUPS = {
  dissolve: ['Растворение и затемнение', 'Dissolves and fades'], move: ['Движение картинок', 'Moving images'], wipe: ['Шторки и сдвиги', 'Wipes and slides'],
  zoom: ['Масштаб', 'Zoom'], punch: ['Тряска экрана', 'Screen shake'], pos: ['Положение на экране', 'Position on screen']
};
const RENPY_TRANSITIONS = [
  ['dissolve', 'dissolve', 'Плавное растворение за 0,5 с', 'Smooth dissolve over 0.5 s'],
  ['fade', 'dissolve', 'Затемнение: старая картинка гаснет до чёрного, потом появляется новая (0,5 + 0,5 с)', 'Fade through black: the old picture goes dark, then the new one appears (0.5 + 0.5 s)'],
  ['pixellate', 'dissolve', 'Картинка рассыпается на крупные пиксели и собирается заново', 'The picture breaks into big pixels and re-forms'],
  ['blinds', 'dissolve', 'Новая картинка проступает сквозь горизонтальные жалюзи', 'The new picture shows through horizontal blinds'],
  ['squares', 'dissolve', 'Новая картинка проступает квадратами', 'The new picture shows in squares'],
  ['move', 'move', 'Плавно двигает уже показанные картинки на новые места', 'Smoothly moves shown images to their new places'],
  ['ease', 'move', 'Как move, но с плавным разгоном и торможением', 'Like move, but with easing'],
  ['moveinright', 'move', 'Новые картинки въезжают справа', 'New images move in from the right'],
  ['moveinleft', 'move', 'Новые картинки въезжают слева', 'New images move in from the left'],
  ['moveintop', 'move', 'Новые картинки въезжают сверху', 'New images move in from the top'],
  ['moveinbottom', 'move', 'Новые картинки въезжают снизу', 'New images move in from the bottom'],
  ['moveoutright', 'move', 'Старые картинки уезжают вправо', 'Old images move out to the right'],
  ['moveoutleft', 'move', 'Старые картинки уезжают влево', 'Old images move out to the left'],
  ['moveouttop', 'move', 'Старые картинки уезжают вверх', 'Old images move out to the top'],
  ['moveoutbottom', 'move', 'Старые картинки уезжают вниз', 'Old images move out to the bottom'],
  ['easeinright', 'move', 'Въезд справа с плавным торможением', 'Eased move in from the right'],
  ['easeinleft', 'move', 'Въезд слева с плавным торможением', 'Eased move in from the left'],
  ['easeintop', 'move', 'Въезд сверху с плавным торможением', 'Eased move in from the top'],
  ['easeinbottom', 'move', 'Въезд снизу с плавным торможением', 'Eased move in from the bottom'],
  ['easeoutright', 'move', 'Выезд вправо с плавным разгоном', 'Eased move out to the right'],
  ['easeoutleft', 'move', 'Выезд влево с плавным разгоном', 'Eased move out to the left'],
  ['easeouttop', 'move', 'Выезд вверх с плавным разгоном', 'Eased move out to the top'],
  ['easeoutbottom', 'move', 'Выезд вниз с плавным разгоном', 'Eased move out to the bottom'],
  ['wipeleft', 'wipe', 'Шторка: новая картинка открывается справа налево', 'Wipe: the new picture is revealed from right to left'],
  ['wiperight', 'wipe', 'Шторка: новая картинка открывается слева направо', 'Wipe: the new picture is revealed from left to right'],
  ['wipeup', 'wipe', 'Шторка: новая картинка открывается снизу вверх', 'Wipe: the new picture is revealed from bottom to top'],
  ['wipedown', 'wipe', 'Шторка: новая картинка открывается сверху вниз', 'Wipe: the new picture is revealed from top to bottom'],
  ['slideleft', 'wipe', 'Новая картинка наезжает справа налево', 'The new picture slides in from the right'],
  ['slideright', 'wipe', 'Новая картинка наезжает слева направо', 'The new picture slides in from the left'],
  ['slideup', 'wipe', 'Новая картинка наезжает снизу вверх', 'The new picture slides in from the bottom'],
  ['slidedown', 'wipe', 'Новая картинка наезжает сверху вниз', 'The new picture slides in from the top'],
  ['slideawayleft', 'wipe', 'Старая картинка уезжает влево', 'The old picture slides away to the left'],
  ['slideawayright', 'wipe', 'Старая картинка уезжает вправо', 'The old picture slides away to the right'],
  ['slideawayup', 'wipe', 'Старая картинка уезжает вверх', 'The old picture slides away upward'],
  ['slideawaydown', 'wipe', 'Старая картинка уезжает вниз', 'The old picture slides away downward'],
  ['irisin', 'wipe', 'Диафрагма: новая картинка открывается от краёв к центру', 'Iris: the new picture opens from the edges inward'],
  ['irisout', 'wipe', 'Диафрагма: новая картинка раскрывается из центра', 'Iris: the new picture opens from the center'],
  ['zoomin', 'zoom', 'Новые картинки приближаются', 'New images zoom in'],
  ['zoomout', 'zoom', 'Старые картинки отдаляются', 'Old images zoom out'],
  ['zoominout', 'zoom', 'Старые отдаляются, новые приближаются', 'Old images zoom out, new ones zoom in'],
  ['hpunch', 'punch', 'Экран быстро трясётся по горизонтали', 'The screen shakes horizontally'],
  ['vpunch', 'punch', 'Экран быстро трясётся по вертикали', 'The screen shakes vertically']
].map(x => ({ name: x[0], group: x[1], d: [x[2], x[3]] }));
const RENPY_TRANSFORMS = [
  ['left', 'Слева, ногами на нижнем краю', 'Left side, feet on the bottom edge', { x: 0, y: 1, ax: 0, ay: 1 }],
  ['center', 'По центру, ногами на нижнем краю', 'Centered, feet on the bottom edge', { x: .5, y: 1, ax: .5, ay: 1 }],
  ['right', 'Справа, ногами на нижнем краю', 'Right side, feet on the bottom edge', { x: 1, y: 1, ax: 1, ay: 1 }],
  ['truecenter', 'Ровно в центре экрана', 'Exactly in the middle of the screen', { x: .5, y: .5, ax: .5, ay: .5 }],
  ['top', 'По центру, у верхнего края', 'Centered at the top edge', { x: .5, y: 0, ax: .5, ay: 0 }],
  ['topleft', 'В левом верхнем углу', 'Top left corner', { x: 0, y: 0, ax: 0, ay: 0 }],
  ['topright', 'В правом верхнем углу', 'Top right corner', { x: 1, y: 0, ax: 1, ay: 0 }],
  ['offscreenleft', 'Сразу за левым краем экрана (для въезда)', 'Just off the left edge (for entrances)', { x: 0, y: 1, ax: 1, ay: 1 }],
  ['offscreenright', 'Сразу за правым краем экрана (для въезда)', 'Just off the right edge (for entrances)', { x: 1, y: 1, ax: 0, ay: 1 }]
].map(x => ({ name: x[0], group: 'pos', d: [x[1], x[2]], pos: x[3] }));
const fxCatalog = kind => (kind === 'tf' ? RENPY_TRANSFORMS : RENPY_TRANSITIONS);
const fxBuiltin = (kind, name) => fxCatalog(kind).find(x => x.name === name) || null;
const fxDesc = e => e.d[S.lang === 'en' ? 1 : 0];
/** Что ещё не добавлено в реестр из библиотеки Ren'Py. */
const fxLibrary = kind => { const have = new Set(P.assets.filter(a => a.kind === kind).map(a => a.name)); return fxCatalog(kind).filter(e => !have.has(e.name)); };
const fxIsCustom = a => !!(a.code && a.code.trim());

/* ---------- заготовки своих эффектов ---------- */
const numS = v => { const x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? String(Math.round(x * 1000) / 1000) : '0'; };
const CROP_MODES = ['wipeleft', 'wiperight', 'wipeup', 'wipedown', 'slideleft', 'slideright', 'slideup', 'slidedown', 'slideawayleft', 'slideawayright', 'slideawayup', 'slideawaydown', 'irisin', 'irisout'];
const PUSH_MODES = ['pushright', 'pushleft', 'pushup', 'pushdown'];
const FX_TPL = {
  fx: {
    dissolve: { name: ['Растворение', 'Dissolve'], fields: [{ k: 'time', l: ['Длительность, с', 'Duration, s'], def: 1.0, min: .05, max: 20, step: .05 }], gen: p => `Dissolve(${numS(p.time)})`, spec: p => ({ type: 'dissolve', t: +p.time }) },
    fade: {
      name: ['Затемнение / вспышка', 'Fade / flash'],
      fields: [{ k: 'out', l: ['Гаснет, с', 'Fade out, s'], def: .5, min: 0, max: 20, step: .05 }, { k: 'hold', l: ['Держится, с', 'Hold, s'], def: .2, min: 0, max: 20, step: .05 }, { k: 'in', l: ['Появляется, с', 'Fade in, s'], def: .5, min: 0, max: 20, step: .05 }, { k: 'color', l: ['Цвет', 'Color'], type: 'color', def: '#000000' }],
      gen: p => `Fade(${numS(p.out)}, ${numS(p.hold)}, ${numS(p.in)}, color=${pyStr(p.color || '#000000')})`, spec: p => ({ type: 'fade', out: +p.out, hold: +p.hold, in: +p.in, color: p.color || '#000' })
    },
    crop: {
      name: ['Шторка или сдвиг', 'Wipe or slide'],
      fields: [{ k: 'time', l: ['Длительность, с', 'Duration, s'], def: 1.0, min: .05, max: 20, step: .05 }, { k: 'mode', l: ['Вид', 'Kind'], type: 'select', def: 'wipeleft', opts: CROP_MODES }],
      gen: p => `CropMove(${numS(p.time)}, ${pyStr(p.mode || 'wipeleft')})`, spec: p => fxSpecFromName(p.mode, +p.time)
    },
    push: {
      name: ['Выталкивание', 'Push'],
      fields: [{ k: 'time', l: ['Длительность, с', 'Duration, s'], def: 1.0, min: .05, max: 20, step: .05 }, { k: 'mode', l: ['Направление', 'Direction'], type: 'select', def: 'pushright', opts: PUSH_MODES }],
      gen: p => `PushMove(${numS(p.time)}, ${pyStr(p.mode || 'pushright')})`, spec: p => ({ type: 'push', dir: (p.mode || 'pushright').replace('push', ''), t: +p.time })
    },
    mask: {
      name: ['Переход по маске', 'Mask transition'],
      fields: [{ k: 'image', l: ['Файл маски в игре', 'Mask file in the game'], type: 'text', def: 'images/mask.png', mono: true }, { k: 'time', l: ['Длительность, с', 'Duration, s'], def: 1.0, min: .05, max: 20, step: .05 }, { k: 'ramp', l: ['Мягкость края (1–256)', 'Edge softness (1–256)'], def: 8, min: 1, max: 256, step: 1 }],
      gen: p => `ImageDissolve(${pyStr(p.image || 'images/mask.png')}, ${numS(p.time)}, ${Math.max(1, Math.min(256, Math.round(+p.ramp || 8)))})`, spec: p => ({ type: 'dissolve', t: +p.time })
    },
    custom: { name: ['Своё выражение', 'Your own expression'], fields: [], gen: p => p.expr || '', spec: () => null }
  },
  tf: {
    fadein: { name: ['Появление из прозрачности', 'Fade in'], fields: [{ k: 'time', l: ['Длительность, с', 'Duration, s'], def: .8, min: .05, max: 20, step: .05 }], gen: p => `alpha 0.0\nlinear ${numS(p.time)} alpha 1.0`, spec: p => ({ type: 'fadein', t: +p.time }) },
    slidein: {
      name: ['Въезд с края', 'Slide in'],
      fields: [{ k: 'dir', l: ['Откуда', 'From'], type: 'select', def: 'left', opts: ['left', 'right', 'top', 'bottom'] }, { k: 'dist', l: ['Расстояние, px', 'Distance, px'], def: 400, min: 10, max: 3000, step: 10 }, { k: 'time', l: ['Длительность, с', 'Duration, s'], def: .5, min: .05, max: 20, step: .05 }],
      gen: p => { const ax = p.dir === 'top' || p.dir === 'bottom' ? 'y' : 'x', sg = p.dir === 'left' || p.dir === 'top' ? -1 : 1; return `${ax}offset ${sg * Math.round(+p.dist || 0)}\neasein ${numS(p.time)} ${ax}offset 0`; },
      spec: p => ({ type: 'slidein', dir: p.dir, t: +p.time })
    },
    shake: {
      name: ['Тряска', 'Shake'],
      fields: [{ k: 'power', l: ['Сила, px', 'Strength, px'], def: 10, min: 1, max: 200, step: 1 }, { k: 'times', l: ['Повторов', 'Repeats'], def: 4, min: 1, max: 40, step: 1 }, { k: 'speed', l: ['Скорость, с на шаг', 'Seconds per step'], def: .05, min: .01, max: 1, step: .01 }],
      gen: p => `xoffset 0\nlinear ${numS(p.speed)} xoffset ${Math.round(+p.power || 0)}\nlinear ${numS(p.speed)} xoffset ${-Math.round(+p.power || 0)}\nrepeat ${Math.max(1, Math.round(+p.times || 1))}\nlinear ${numS(p.speed)} xoffset 0`,
      spec: p => ({ type: 'shake', power: +p.power, times: +p.times, t: +p.speed })
    },
    bob: {
      name: ['Покачивание', 'Bobbing'],
      fields: [{ k: 'amp', l: ['Высота, px', 'Height, px'], def: 15, min: 1, max: 300, step: 1 }, { k: 'time', l: ['Полпериода, с', 'Half period, s'], def: .6, min: .05, max: 20, step: .05 }],
      gen: p => `easeout ${numS(p.time)} yoffset ${-Math.round(+p.amp || 0)}\neasein ${numS(p.time)} yoffset 0\nrepeat`, spec: p => ({ type: 'bob', amp: +p.amp, t: +p.time })
    },
    jump: {
      name: ['Прыжок', 'Jump'],
      fields: [{ k: 'height', l: ['Высота, px', 'Height, px'], def: 60, min: 1, max: 600, step: 1 }, { k: 'time', l: ['Полпериода, с', 'Half period, s'], def: .18, min: .03, max: 5, step: .01 }],
      gen: p => `easeout ${numS(p.time)} yoffset ${-Math.round(+p.height || 0)}\neasein ${numS(p.time)} yoffset 0`, spec: p => ({ type: 'bob', amp: +p.height, t: +p.time, once: true })
    },
    zoom: {
      name: ['Приближение', 'Zoom'],
      fields: [{ k: 'scale', l: ['Во сколько раз', 'Scale factor'], def: 1.2, min: .1, max: 10, step: .05 }, { k: 'time', l: ['Длительность, с', 'Duration, s'], def: .5, min: .05, max: 20, step: .05 }],
      gen: p => `linear ${numS(p.time)} zoom ${numS(p.scale)}`, spec: p => ({ type: 'zoom', scale: +p.scale, t: +p.time })
    },
    custom: { name: ['Свой код ATL', 'Your own ATL code'], fields: [], gen: p => p.expr || '', spec: () => null }
  }
};
const fxTplDefaults = (kind, tpl) => { const o = {}; for (const f of FX_TPL[kind][tpl].fields) o[f.k] = f.def; return o; };
const fxGen = (kind, tpl, params) => (FX_TPL[kind][tpl] ? FX_TPL[kind][tpl].gen(params || {}) : '');
function fxSpecOf(a) {
  if (!fxIsCustom(a)) return a.kind === 'fx' ? fxSpecFromName(a.name) : null;
  const tp = FX_TPL[a.kind] && FX_TPL[a.kind][a.tpl];
  if (tp && tp.spec && a.tpl !== 'custom') return tp.spec(Object.assign(fxTplDefaults(a.kind, a.tpl), a.params || {}));
  if (a.kind === 'fx') {
    let m;
    if ((m = /^\s*Dissolve\(\s*([\d.]+)/.exec(a.code))) return { type: 'dissolve', t: +m[1] };
    if ((m = /^\s*Fade\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(a.code))) return { type: 'fade', out: +m[1], hold: +m[2], in: +m[3], color: '#000' };
    if ((m = /^\s*CropMove\(\s*([\d.]+)\s*,\s*["'](\w+)["']/.exec(a.code))) return fxSpecFromName(m[2], +m[1]);
  }
  return null;
}
/** Что показывать в предпросмотре для готового перехода из библиотеки (приближённо). */
function fxSpecFromName(name, time) {
  const T = (d) => (time > 0 ? time : d); let m;
  if (name === 'dissolve') return { type: 'dissolve', t: T(.5) };
  if (name === 'fade') return { type: 'fade', out: .5, hold: 0, in: .5, color: '#000' };
  if (name === 'pixellate' || name === 'blinds' || name === 'squares') return { type: 'dissolve', t: T(1) };
  if ((m = /^wipe(left|right|up|down)$/.exec(name))) return { type: 'wipe', dir: m[1], t: T(1) };
  if ((m = /^slide(left|right|up|down)$/.exec(name))) return { type: 'slide', dir: m[1], t: T(1) };
  if ((m = /^slideaway(left|right|up|down)$/.exec(name))) return { type: 'slideaway', dir: m[1], t: T(1) };
  if ((m = /^(?:move|ease)in(left|right|top|bottom)$/.exec(name))) return { type: 'slide', dir: { top: 'down', bottom: 'up', left: 'right', right: 'left' }[m[1]], t: T(.5) };
  if ((m = /^(?:move|ease)out(left|right|top|bottom)$/.exec(name))) return { type: 'slideaway', dir: { top: 'up', bottom: 'down', left: 'left', right: 'right' }[m[1]], t: T(.5) };
  if (name === 'irisin' || name === 'irisout') return { type: name, t: T(1) };
  if (name === 'zoomin' || name === 'zoomout' || name === 'zoominout') return { type: 'zoomfx', mode: name, t: T(.5) };
  if (name === 'hpunch' || name === 'vpunch') return { type: 'punch', axis: name === 'hpunch' ? 'x' : 'y', t: .25 };
  return null;
}

/* ---------- предпросмотр ---------- */
function fxPlayer(kind, spec, opts = {}) {
  const isTf = kind === 'tf';
  const stage = h('div', { class: isTf ? 'tfp-stage' : 'fxp-stage' });
  let anims = [];
  const stop = () => { anims.forEach(a => { try { a.cancel(); } catch (e) { /* уже остановлена */ } }); anims = []; };
  const A = h('div', { class: 'fxp-a' }, 'A'), B = h('div', { class: 'fxp-b' }, 'B'), OV = h('div', { class: 'fxp-ov' });
  const SP = h('div', { class: 'tfp-sprite' });
  if (!isTf) stage.append(A, B, OV); else stage.append(h('div', { class: 'tfp-floor' }), SP);
  const go = (el, kf, ms, o = {}) => { const an = el.animate(kf, Object.assign({ duration: Math.max(200, ms), fill: 'both', easing: 'linear' }, o)); anims.push(an); return an; };
  const reset = () => { stop(); [A, B, OV, SP].forEach(e => { e.style.cssText = ''; }); };
  const place = (pos) => {
    if (!pos) return;
    SP.style.left = (pos.x * 100) + '%'; SP.style.top = (pos.y * 100) + '%';
    SP.style.transform = `translate(${-pos.ax * 100}%, ${-pos.ay * 100}%)`;
  };
  const play = () => {
    reset();
    if (isTf) {
      const b = fxBuiltin('tf', opts.name);
      if (b) { place(b.pos); return; }
      place({ x: .5, y: 1, ax: .5, ay: 1 });
      if (!spec) return;
      const ms = (spec.t || .5) * 1000, base = 'translate(-50%, -100%)';
      if (spec.type === 'fadein') go(SP, [{ opacity: 0 }, { opacity: 1 }], ms);
      else if (spec.type === 'slidein') { const d = (spec.dir === 'left' || spec.dir === 'top' ? -1 : 1) * 60, ax = spec.dir === 'top' || spec.dir === 'bottom' ? 'Y' : 'X'; go(SP, [{ transform: base + ` translate${ax}(${d}px)`, opacity: .2 }, { transform: base, opacity: 1 }], ms, { easing: 'ease-out' }); }
      else if (spec.type === 'shake') { const kf = [{ transform: base }]; for (let i = 0; i < Math.min(8, spec.times || 4); i++) kf.push({ transform: base + ` translateX(${Math.min(14, spec.power * .6)}px)` }, { transform: base + ` translateX(${-Math.min(14, spec.power * .6)}px)` }); kf.push({ transform: base }); go(SP, kf, Math.max(300, kf.length * (spec.t || .05) * 1000)); }
      else if (spec.type === 'bob') go(SP, [{ transform: base }, { transform: base + ` translateY(${-Math.min(30, spec.amp * .6)}px)` }, { transform: base }], ms * 2, spec.once ? {} : { iterations: 3, easing: 'ease-in-out' });
      else if (spec.type === 'zoom') go(SP, [{ transform: base + ' scale(1)' }, { transform: base + ` scale(${Math.max(.2, Math.min(2, spec.scale))})` }], ms, { transformOrigin: '50% 100%' });
      return;
    }
    if (!spec) return;
    const ms = Math.min(4000, (spec.t || .5) * 1000), dirV = { left: ['100%', '0', 'X'], right: ['-100%', '0', 'X'], up: ['100%', '0', 'Y'], down: ['-100%', '0', 'Y'] };
    B.style.opacity = '0';
    if (spec.type === 'dissolve') go(B, [{ opacity: 0 }, { opacity: 1 }], ms);
    else if (spec.type === 'fade') {
      const tot = Math.max(.1, spec.out + spec.hold + spec.in); OV.style.background = spec.color || '#000';
      go(OV, [{ opacity: 0, offset: 0 }, { opacity: 1, offset: spec.out / tot }, { opacity: 1, offset: (spec.out + spec.hold) / tot }, { opacity: 0, offset: 1 }], tot * 1000);
      go(B, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: spec.out / tot }, { opacity: 1, offset: Math.min(1, spec.out / tot + .001) }, { opacity: 1, offset: 1 }], tot * 1000);
    } else if (spec.type === 'wipe') {
      const from = { left: 'inset(0 0 0 100%)', right: 'inset(0 100% 0 0)', up: 'inset(100% 0 0 0)', down: 'inset(0 0 100% 0)' }[spec.dir];
      B.style.opacity = '1'; go(B, [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], ms);
    } else if (spec.type === 'slide') { const d = dirV[spec.dir]; B.style.opacity = '1'; go(B, [{ transform: `translate${d[2]}(${d[0]})` }, { transform: 'none' }], ms); }
    else if (spec.type === 'slideaway') { const d = dirV[spec.dir]; B.style.opacity = '1'; A.style.zIndex = '2'; go(A, [{ transform: 'none' }, { transform: `translate${d[2]}(${d[0] === '100%' ? '-100%' : '100%'})` }], ms); }
    else if (spec.type === 'push') { const d = dirV[{ right: 'right', left: 'left', up: 'up', down: 'down' }[spec.dir] || 'right']; B.style.opacity = '1'; go(B, [{ transform: `translate${d[2]}(${d[0]})` }, { transform: 'none' }], ms); go(A, [{ transform: 'none' }, { transform: `translate${d[2]}(${d[0] === '100%' ? '-100%' : '100%'})` }], ms); }
    else if (spec.type === 'irisout') { B.style.opacity = '1'; go(B, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], ms); }
    else if (spec.type === 'irisin') { B.style.opacity = '1'; A.style.zIndex = '2'; go(A, [{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], ms); }
    else if (spec.type === 'zoomfx') {
      if (spec.mode === 'zoomin') { B.style.opacity = '1'; go(B, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], ms); }
      else if (spec.mode === 'zoomout') { B.style.opacity = '1'; A.style.zIndex = '2'; go(A, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.3)', opacity: 0 }], ms); }
      else { B.style.opacity = '1'; A.style.zIndex = '2'; go(A, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.3)', opacity: 0 }], ms); go(B, [{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], ms); }
    } else if (spec.type === 'punch') {
      const t0 = spec.axis === 'x' ? 'translateX' : 'translateY'; B.style.opacity = '0';
      go(A, [{ transform: 'none' }, { transform: `${t0}(8px)` }, { transform: `${t0}(-8px)` }, { transform: `${t0}(6px)` }, { transform: `${t0}(-6px)` }, { transform: 'none' }], 500);
    }
  };
  const btn = h('button', { class: 'btn icon sm fxp-play', 'data-tip': t('fx.play'), onclick: ev => { ev.stopPropagation(); play(); } }, icon('play', 14));
  const el = h('div', { class: 'fxp' + (isTf ? ' tf' : '') }, stage, btn);
  if (!spec && !(isTf && fxBuiltin('tf', opts.name))) { el.classList.add('none'); btn.disabled = true; btn.setAttribute('data-tip', t('fx.nopreview')); }
  if (isTf && fxBuiltin('tf', opts.name)) { btn.hidden = true; }
  if (isTf) setTimeout(() => { const b = fxBuiltin('tf', opts.name); if (b) place(b.pos); else place({ x: .5, y: 1, ax: .5, ay: 1 }); }, 0);
  return { el, play, stop };
}

/* ---------- меню «Добавить»: новый + библиотека Ren'Py ---------- */
function fxAddMenu(anchor, kind) {
  const wrap = h('div', { class: 'picker fx-add' });
  const newBtn = h('button', { class: 'btn primary wide', onclick: () => { closePopover(); openFxEditor(null, kind); } }, icon('plus', 16), t(kind === 'tf' ? 'fx.new.tf' : 'fx.new.tr'));
  const q = h('input', { class: 'inp', placeholder: t('fx.lib.search'), id: 'fx-q' });
  const list = h('div', { class: 'plist fx-lib' });
  const render = () => {
    list.replaceChildren();
    const qq = q.value.trim().toLowerCase();
    const items = fxLibrary(kind).filter(e => !qq || (e.name + ' ' + fxDesc(e)).toLowerCase().includes(qq));
    let last = null;
    items.forEach(e => {
      if (e.group !== last) { last = e.group; list.append(h('div', { class: 'mhead' }, FX_GROUPS[e.group][S.lang === 'en' ? 1 : 0])); }
      list.append(h('div', { class: 'pi', onclick: () => { closePopover(); const a = createAsset(kind, e.name); a.code = ''; if (REG) renderReg(); toast(t('fx.added', e.name)); } },
        h('div', { class: 'pi-t' }, h('div', { class: 'pi-n mono' }, e.name), h('div', { class: 'pi-s' }, fxDesc(e)))));
    });
    if (!items.length) list.append(h('div', { class: 'empty small' }, qq ? t('search.none') : t('fx.lib.all')));
  };
  q.addEventListener('input', render); render();
  wrap.append(newBtn, h('div', { class: 'mhead lib-h' }, t('fx.lib.h')), q, list);
  popover(anchor, wrap, { cls: 'pick-pop fx-pop' });
  setTimeout(() => q.focus(), 30);
}

/* ---------- редактор своего эффекта ---------- */
function openFxEditor(asset, kind) {
  kind = asset ? asset.kind : kind;
  const isTf = kind === 'tf';
  const draft = asset ? { name: asset.name, tpl: asset.tpl && FX_TPL[kind][asset.tpl] ? asset.tpl : 'custom', params: Object.assign({}, asset.params || {}), expr: asset.code || '' }
    : { name: '', tpl: isTf ? 'shake' : 'dissolve', params: {}, expr: '' };
  if (!asset) { draft.params = fxTplDefaults(kind, draft.tpl); draft.name = uniqueFxName(isTf ? 'my_motion' : 'my_transition'); }
  else if (draft.tpl !== 'custom') draft.params = Object.assign(fxTplDefaults(kind, draft.tpl), draft.params);
  const m = openModal({
    cls: 'fx-m', build: m => {
      const body = h('div', { class: 'm-pad' });
      const msg = h('div', { class: 'fx-msg' });
      const codeTa = h('textarea', { class: 'ta mono fx-code', rows: isTf ? 7 : 3, spellcheck: 'false' });
      const codeNote = h('div', { class: 'hint' });
      const prevHolder = h('div', { class: 'fx-prev' });
      const nameI = h('input', { class: 'inp mono', type: 'text', value: draft.name, spellcheck: 'false', id: 'fx-name' });
      const paramsBox = h('div', { class: 'grid2 fx-params' });
      const tplSel = h('select', { class: 'inp' }, Object.keys(FX_TPL[kind]).map(k => h('option', { value: k }, FX_TPL[kind][k].name[S.lang === 'en' ? 1 : 0])));
      tplSel.value = draft.tpl;
      const currentCode = () => (draft.tpl === 'custom' ? draft.expr : fxGen(kind, draft.tpl, draft.params));
      const validate = () => {
        const nm = nameI.value.trim(); const issues = [];
        if (!/^[A-Za-z_]\w*$/.test(nm)) issues.push(t('fx.err.name'));
        else if (P.assets.some(a => a !== asset && (a.kind === 'fx' || a.kind === 'tf') && a.name === nm)) issues.push(t('fx.err.dup', nm));
        else if (!asset && fxBuiltin(kind, nm)) issues.push(t('fx.err.builtin', nm));
        const code = currentCode().trim();
        if (!code) issues.push(t('fx.err.empty'));
        else if (!isTf && (/\n/.test(code) || !cmpBalanced(code))) issues.push(t('fx.err.expr'));
        msg.replaceChildren(...issues.map(x => h('div', { class: 'warn-t' }, x)));
        saveBtn.disabled = issues.length > 0;
        return issues.length === 0;
      };
      const paintCode = () => {
        const nm = nameI.value.trim() || '…';
        if (draft.tpl === 'custom') { codeTa.readOnly = false; codeNote.textContent = isTf ? t('fx.code.tf.custom') : t('fx.code.tr.custom'); if (codeTa.value !== draft.expr) codeTa.value = draft.expr; }
        else { codeTa.readOnly = true; codeTa.value = fxGen(kind, draft.tpl, draft.params); codeNote.textContent = t('fx.code.auto'); }
        codeNote.append(' ', h('span', { class: 'mono-s' }, isTf ? `transform ${nm}:` : `define ${nm} = …`));
      };
      const paintPreview = () => {
        prevHolder.replaceChildren();
        const a = { kind, name: nameI.value.trim(), code: currentCode(), tpl: draft.tpl, params: draft.params };
        prevHolder.append(fxPlayer(kind, fxSpecOf(a), {}).el);
      };
      const paintParams = () => {
        paramsBox.replaceChildren();
        for (const f of FX_TPL[kind][draft.tpl].fields) {
          let inp;
          if (f.type === 'select') { inp = h('select', { class: 'inp' }, f.opts.map(o => h('option', { value: o }, o))); inp.value = draft.params[f.k]; }
          else if (f.type === 'color') { inp = h('input', { class: 'fmt-color', type: 'color', value: draft.params[f.k] || '#000000' }); }
          else if (f.type === 'text') inp = h('input', { class: 'inp' + (f.mono ? ' mono' : ''), type: 'text', value: draft.params[f.k] });
          else inp = h('input', { class: 'inp', type: 'number', min: f.min, max: f.max, step: f.step, value: draft.params[f.k] });
          const upd = () => { draft.params[f.k] = f.type === 'select' || f.type === 'color' || f.type === 'text' ? inp.value : (inp.value === '' ? f.def : +inp.value); paintCode(); validate(); paintPreview(); };
          inp.addEventListener('input', upd); inp.addEventListener('change', upd);
          paramsBox.append(field(f.l[S.lang === 'en' ? 1 : 0], inp));
        }
      };
      const refresh = () => { paintParams(); paintCode(); validate(); paintPreview(); };
      tplSel.addEventListener('change', () => { const prev = draft.tpl; draft.tpl = tplSel.value; if (draft.tpl !== 'custom') draft.params = fxTplDefaults(kind, draft.tpl); else if (prev !== 'custom') draft.expr = fxGen(kind, prev, draft.params); refresh(); });
      nameI.addEventListener('input', () => { paintCode(); validate(); });
      codeTa.addEventListener('input', () => { draft.expr = codeTa.value; validate(); paintPreview(); });
      const saveBtn = h('button', {
        class: 'btn primary', onclick: () => {
          if (!validate()) return;
          const a = asset || createAsset(kind, nameI.value.trim());
          const oldName = a.name; a.name = nameI.value.trim(); a.code = currentCode().trim(); a.tpl = draft.tpl; a.params = draft.tpl === 'custom' ? {} : Object.assign({}, draft.params);
          if (asset && oldName !== a.name) renameFxInScripts(kind, oldName, a.name);
          commit(true); m.close(); if (REG) renderReg(); renderAll();
        }
      }, icon('check', 16), asset ? t('c.save') : t('fx.create'));
      body.append(
        field(t('fx.name'), nameI, t('fx.name.hint')),
        field(t('fx.tpl'), tplSel),
        paramsBox,
        h('div', { class: 'lbl' }, t('fx.code')), codeTa, codeNote,
        h('div', { class: 'lbl' }, t('fx.preview')), prevHolder, h('div', { class: 'hint' }, t('fx.preview.hint')),
        msg,
        h('div', { class: 'row-actions' }, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), saveBtn));
      refresh();
      setTimeout(() => { nameI.focus(); nameI.select(); }, 50);
      return h('div', { class: 'm-wrap' }, modalHead(asset ? t('fx.edit', asset.name) : t(isTf ? 'fx.new.tf' : 'fx.new.tr'), m), body);
    }
  });
  return m;
}
function uniqueFxName(base) {
  let n = base, i = 2; const names = new Set(P.assets.filter(a => a.kind === 'fx' || a.kind === 'tf').map(a => a.name));
  while (names.has(n)) n = base + '_' + i++;
  return n;
}
/** Переименование эффекта: заменяем имя в скриптах (with NAME / at NAME). */
function renameFxInScripts(kind, from, to) {
  const re = kind === 'fx' ? new RegExp('(\\bwith\\s+)' + reEsc(from) + '(\\s*$)', 'gm') : new RegExp('(\\bat\\s+(?:[A-Za-z_]\\w*\\s*,\\s*)*)' + reEsc(from) + '\\b', 'g');
  for (const { file } of allFiles()) if (file.script) file.script = file.script.replace(re, (m0, a, b) => a + to + (b || ''));
}

'use strict';
/* ====== Окно, которое можно двигать, растягивать и разворачивать ======
   winControl(m, head, key) делает окно m «плавающим»: заголовок head тянется мышью, края и углы меняют размер, двойной щелчок по заголовку (или кнопка)
   разворачивает окно на весь экран и возвращает обратно. Положение и размер запоминаются в настройках под ключом key (S.win[key]).
   Пока окно не трогали, оно остаётся по центру с размером из стиля. На узких экранах (телефон) окно всегда во весь экран и не двигается. */

Object.assign(D, {
  'te.top': ['Текст', 'Text'],
  'te.top.tip': ['Редактор текста: пишите историю как документ', 'Text editor: write the story as a document'],
  'win.max': ['Развернуть на весь экран (двойной щелчок по заголовку)', 'Maximize (double-click the title)'],
  'win.rest': ['Вернуть размер окна (двойной щелчок по заголовку)', 'Restore the window size (double-click the title)'],
  'win.reset': ['Вернуть окно на место и к обычному размеру', 'Put the window back to its place and usual size'],
  'win.peek': ['Работать с картой, не закрывая окно (то же — щелчок по размытому фону)', 'Work with the map without closing the window (a click on the blurred background does the same)'],
  'win.peek.off': ['Вернуть размытие фона и управление окну (то же — щелчок по окну)', 'Bring back the blur and give control back to the window (a click on the window does the same)'],
  'win.peek.hint': ['Карта свободна: двигайте и приближайте её, открывайте блоки. Окно остаётся на месте; щелчок по нему вернёт ему управление.', 'The map is free: pan, zoom, open blocks. The window stays in place; a click on it gives control back to it.'],
});

const WIN_MIN = { w: 560, h: 400 }, WIN_NARROW = 760;
const winClamp = (v, a, b) => Math.max(a, Math.min(b, v));

function winControl(m, head, key) {
  const card = m.card;
  const saved = (S.win && S.win[key]) || null;
  let g = saved && typeof saved === 'object' ? { x: +saved.x || 0, y: +saved.y || 0, w: +saved.w || 0, h: +saved.h || 0, max: !!saved.max, rest: saved.rest || null } : null;
  if (g && (!g.w || !g.h)) g = null;
  const narrow = () => window.innerWidth < WIN_NARROW;
  const fit = x => {                                              // не даём вытащить окно за экран: заголовок всегда доступен
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = winClamp(x.w, Math.min(WIN_MIN.w, vw), vw), h2 = winClamp(x.h, Math.min(WIN_MIN.h, vh), vh);
    return { x: winClamp(x.x, 120 - w, vw - 120), y: winClamp(x.y, 0, vh - 56), w, h: h2 };
  };
  const apply = () => {
    const free = !!g && !narrow();
    card.classList.toggle('win-free', free);
    card.classList.toggle('win-max', free && g.max);
    if (!free) { ['left', 'top', 'width', 'height'].forEach(p => { card.style[p] = ''; }); updBtn(); return; }
    const r = g.max ? { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight } : fit(g);
    if (!g.max) Object.assign(g, r);
    card.style.left = r.x + 'px'; card.style.top = r.y + 'px'; card.style.width = r.w + 'px'; card.style.height = r.h + 'px';
    updBtn();
  };
  const save = () => { S.win = S.win || {}; S.win[key] = g ? { x: g.x, y: g.y, w: g.w, h: g.h, max: !!g.max, rest: g.rest || null } : null; saveSettings(); };
  const fromCard = () => { const r = card.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), max: false, rest: null }; };
  const toggleMax = () => {
    if (narrow()) return;
    if (!g) g = fromCard();
    if (g.max) { const r = g.rest || { x: 80, y: 40, w: Math.min(1400, window.innerWidth - 160), h: Math.min(900, window.innerHeight - 80) }; g = Object.assign({ max: false, rest: null }, r); }
    else { g.rest = { x: g.x, y: g.y, w: g.w, h: g.h }; g.max = true; }
    apply(); save();
  };
  const reset = () => { g = null; apply(); save(); };
  const btn = h('button', { class: 'btn icon', id: 'win-max', onclick: ev => { ev.stopPropagation(); toggleMax(); } }, icon('fit', 17));
  function updBtn() {
    const mx = !!g && g.max && !narrow();
    btn.dataset.tip = t(mx ? 'win.rest' : 'win.max'); btn.classList.toggle('on', mx);
    btn.hidden = narrow();
    if (m.peek && !canPeek()) { m.peek = false; back.classList.remove('peek'); }   // развернули на весь экран — карты за окном уже не видно
    peekBtn.hidden = !canPeek(); peekBtn.classList.toggle('on', !!m.peek); peekBtn.dataset.tip = t(m.peek ? 'win.peek.off' : 'win.peek');
  }
  /* «Посмотреть карту»: щелчок по размытому фону (или кнопка) не закрывает окно, а убирает блюр и пропускает мышь к карте под ним;
     щелчок по самому окну возвращает фон и управление ему. Так окно редактора можно оставить на экране, а карту двигать и смотреть. */
  const back = m.el;
  const canPeek = () => !narrow() && !(g && g.max);
  const peekBtn = h('button', { class: 'btn icon', id: 'win-peek', onclick: ev => { ev.stopPropagation(); setPeek(!m.peek, true); } }, icon('eye', 17));
  function setPeek(on, hint) {
    on = !!on && canPeek();
    if (!!m.peek === on) return;
    m.peek = on; back.classList.toggle('peek', on); updBtn();
    if (on && hint && !S.winPeekSeen) { S.winPeekSeen = true; saveSettings(); toast(t('win.peek.hint'), 5200); }
  }
  m.setPeek = setPeek;
  back.addEventListener('pointerdown', ev => { if (ev.target === back && !m.peek && canPeek()) setPeek(true, true); });
  card.addEventListener('pointerdown', ev => { if (m.peek && !ev.target.closest('.m-head,.win-rs')) setPeek(false); }, true);
  const close = head.lastElementChild; head.insertBefore(btn, close); head.insertBefore(peekBtn, btn);
  head.classList.add('win-grip');
  head.addEventListener('dblclick', ev => { if (ev.target.closest('button,input,select,a,.inp')) return; toggleMax(); });
  head.addEventListener('contextmenu', ev => { if (g && !ev.target.closest('input,.inp')) { ev.preventDefault(); reset(); toast(t('win.reset'), 2200); } });

  /* перетаскивание за заголовок */
  head.addEventListener('pointerdown', ev => {
    if (ev.button !== 0 || narrow() || ev.target.closest('button,input,select,a,.inp')) return;
    if (!g) g = fromCard();
    const sx = ev.clientX, sy = ev.clientY;
    let base = Object.assign({}, g), moved = false;
    if (g.max) {                                                  // потянули развёрнутое окно: оно возвращается к своему размеру под курсором
      const r = g.rest || { w: Math.min(1400, window.innerWidth - 160), h: Math.min(900, window.innerHeight - 80) };
      base = { x: Math.round(sx - r.w * (sx / window.innerWidth)), y: 0, w: r.w, h: r.h };
    }
    const move = e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      if (!moved) { moved = true; if (g.max) g = { max: false, rest: null, x: base.x, y: base.y, w: base.w, h: base.h }; document.body.classList.add('win-moving'); }
      g.x = base.x + dx; g.y = base.y + dy; apply();
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); document.body.classList.remove('win-moving'); if (moved) save(); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });

  /* размер за края и углы */
  for (const d of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
    const hd = h('div', { class: 'win-rs win-rs-' + d, 'data-d': d });
    hd.addEventListener('pointerdown', ev => {
      if (ev.button !== 0 || narrow()) return;
      ev.preventDefault(); ev.stopPropagation();
      if (!g) g = fromCard();
      if (g.max) return;
      const sx = ev.clientX, sy = ev.clientY, b = Object.assign({}, g);
      document.body.classList.add('win-moving');
      const move = e => {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        let { x, y, w, h: hh } = b;
        if (d.includes('e')) w = b.w + dx;
        if (d.includes('s')) hh = b.h + dy;
        if (d.includes('w')) { w = b.w - dx; x = b.x + dx; }
        if (d.includes('n')) { hh = b.h - dy; y = b.y + dy; }
        if (w < WIN_MIN.w) { if (d.includes('w')) x -= WIN_MIN.w - w; w = WIN_MIN.w; }
        if (hh < WIN_MIN.h) { if (d.includes('n')) y -= WIN_MIN.h - hh; hh = WIN_MIN.h; }
        Object.assign(g, { x, y, w, h: hh }); apply();
      };
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); document.body.classList.remove('win-moving'); save(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    card.append(hd);
  }
  const onResize = () => { if (m.closed) { window.removeEventListener('resize', onResize); return; } apply(); };
  window.addEventListener('resize', onResize);
  apply();
  return { reset, toggleMax, get free() { return !!g; } };
}

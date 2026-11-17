'use strict';
/* Окна-спутники: редактор текста, свой код и плеер можно вынести из главного окна в настоящее окно системы (например, на второй монитор).
   Оболочка только создаёт окна, помнит их место и пересылает сообщения между страницами (проект и файл остаются у главного окна).
   Правки проекта страницы шлют друг другу сами (см. src/satellite.js); здесь они лишь передаются дальше.
   У каждого окна есть имя: «main» (главное) или имя инструмента («texted», «code», «ide», «player», «node»). Инструмент может быть вынесен только в одно окно. */
const fs = require('fs');
const path = require('path');

const TOOLS = ['texted', 'code', 'ide', 'player', 'node'];
const MAX_MSG = 96 * 1024 * 1024;      // сообщение тяжелее не пересылаем (проект такого размера обменивается файлом, не окнами)

module.exports = function createSat(env) {
  const { app, BrowserWindow, ipcMain, screen, trusted, getMain, frameOpts, frameExtras, pageUrl, backgroundColor, iconPath, title } = env;
  const wins = new Map();              // инструмент → окно
  const inits = new Map();             // инструмент → то, с чем его открыли (вкладка, глава)

  const store = () => path.join(app.getPath('userData'), 'satwin.json');
  const loadAll = () => { try { const j = JSON.parse(fs.readFileSync(store(), 'utf8')); return j && typeof j === 'object' ? j : {}; } catch (e) { return {}; } };
  const saveOne = (tool, w) => {
    try {
      if (!w || w.isDestroyed()) return;
      const all = loadAll(); all[tool] = { bounds: w.getNormalBounds(), max: w.isMaximized() };
      fs.writeFileSync(store(), JSON.stringify(all));
    } catch (e) { /* место не запомнится: не страшно */ }
  };
  const keyOf = wc => {
    const w = BrowserWindow.fromWebContents(wc); if (!w) return '';
    if (w === getMain()) return 'main';
    for (const [k, v] of wins) if (v === w) return k;
    return '';
  };
  const alive = w => !!w && !w.isDestroyed();

  /** Окно целиком или хотя бы заметной частью на каком-нибудь из мониторов (мониторы бывают отключены). */
  const onScreen = b => {
    if (!b || !(b.width > 0) || !(b.height > 0)) return false;
    return screen.getAllDisplays().some(d => {
      const a = d.workArea, w = Math.min(b.x + b.width, a.x + a.width) - Math.max(b.x, a.x), h = Math.min(b.y + b.height, a.y + a.height) - Math.max(b.y, a.y);
      return w >= 160 && h >= 80;
    });
  };
  /** Первое открытие: на втором мониторе, если он есть, иначе рядом с главным окном. */
  const defaultBounds = () => {
    const main = getMain(), all = screen.getAllDisplays();
    const here = alive(main) ? screen.getDisplayMatching(main.getBounds()) : screen.getPrimaryDisplay();
    const other = all.find(d => d.id !== here.id), d = other || here, a = d.workArea;
    const width = Math.min(1180, Math.max(720, a.width - (other ? 80 : 160))), height = Math.min(820, Math.max(520, a.height - (other ? 80 : 120)));
    return { x: a.x + Math.round((a.width - width) / 2) + (other ? 0 : 40), y: a.y + Math.round((a.height - height) / 2) + (other ? 0 : 30), width, height };
  };

  function open(tool, init) {
    if (!TOOLS.includes(tool)) return { ok: false, code: 'tool' };
    const had = wins.get(tool);
    if (alive(had)) {
      if (init && typeof init === 'object') inits.set(tool, init);
      if (had.isMinimized()) had.restore();
      had.focus();
      return { ok: true, key: tool, existed: true };
    }
    if (init && typeof init === 'object') inits.set(tool, init); else inits.delete(tool);
    const saved = loadAll()[tool];
    const b = saved && onScreen(saved.bounds) ? saved.bounds : defaultBounds();
    const w = new BrowserWindow({
      x: b.x, y: b.y, width: Math.max(520, b.width), height: Math.max(380, b.height), minWidth: 520, minHeight: 380, show: false, title: title(tool),
      backgroundColor: backgroundColor(), icon: iconPath,
      ...frameOpts(tool),
    });
    wins.set(tool, w);
    frameExtras(w, { launcher: false });
    if (saved && saved.max) w.maximize();
    w.once('ready-to-show', () => w.show());
    let t = 0;
    const keep = () => { clearTimeout(t); t = setTimeout(() => saveOne(tool, w), 500); };
    w.on('resize', keep); w.on('move', keep);
    w.on('close', () => { clearTimeout(t); saveOne(tool, w); });
    w.on('closed', () => {
      if (wins.get(tool) === w) wins.delete(tool);
      inits.delete(tool);
      const main = getMain();
      for (const [k, x] of [['main', main], ...wins]) if (alive(x) && k !== tool) x.webContents.send('desk:sat:msg', { k: 'closed', from: tool });
    });
    w.loadURL(pageUrl('#sat=' + tool));
    return { ok: true, key: tool, existed: false };
  }

  function closeAll() { for (const w of [...wins.values()]) if (alive(w)) w.close(); }

  function registerIpc() {
    ipcMain.handle('desk:sat:me', e => {
      if (!trusted(e)) throw new Error('untrusted');
      const key = keyOf(e.sender);
      return { key: key || 'main', init: key && key !== 'main' ? inits.get(key) || null : null, open: [...wins.keys()].filter(k => alive(wins.get(k))) };
    });
    ipcMain.handle('desk:sat:open', (e, tool, init) => {
      if (!trusted(e)) throw new Error('untrusted');
      return open(String(tool || ''), init && typeof init === 'object' ? init : null);
    });
    ipcMain.on('desk:sat:focusMain', e => {
      if (!trusted(e)) return;
      const w = getMain(); if (!alive(w)) return;
      if (w.isMinimized()) w.restore();
      w.show(); w.focus();
    });
    ipcMain.on('desk:sat:msg', (e, msg) => {
      if (!trusted(e) || !msg || typeof msg !== 'object') return;
      const from = keyOf(e.sender); if (!from) return;
      let size = 0; try { size = JSON.stringify(msg).length; } catch (x) { return; }
      if (size > MAX_MSG) return;
      const to = msg.to, hit = k => !to || to === k || (Array.isArray(to) && to.includes(k));
      for (const [k, w] of [['main', getMain()], ...wins]) if (alive(w) && k !== from && hit(k)) w.webContents.send('desk:sat:msg', Object.assign({}, msg, { from }));
    });
  }

  return { open, closeAll, registerIpc, tools: TOOLS, keyOf, count: () => [...wins.values()].filter(alive).length };
};

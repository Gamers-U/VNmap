'use strict';
/* Обновление программы без переустановки.
   Вся «программа» — это одна страница index.html (меню, холст, компилятор). Оболочка Electron меняется редко, а страница — часто.
   Поэтому обновление — это новая страница, которую оболочка кладёт в папку данных пользователя и отдаёт вместо встроенной.
   Встроенная версия остаётся нетронутой, вернуться к ней можно в один щелчок.

   Модуль чистый (только встроенные модули Node), поэтому его можно проверять без Electron: см. tests в репозитории. */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const MAX_HTML = 48 * 1048576;            // страница
const MAX_ZIP = 120 * 1048576;            // архив целиком
const MAX_ENTRY = 64 * 1048576;           // один файл после распаковки
const MIN_HTML = 50 * 1024;               // меньше — это точно не наша страница
const MAX_FONT = 6 * 1048576;
const MAX_FONTS = 12;
const STAMP_RE = /<meta\s+name="vnmap-build"([^>]*)>/i;

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

/** Отметка сборки в начале страницы: <meta name="vnmap-build" content="20261029.1630" data-version="1.1.0" data-needs="2">. */
function parseStamp(head) {
  const m = STAMP_RE.exec(String(head || ''));
  if (!m) return null;
  const attr = n => { const r = new RegExp('\\b' + n + '="([^"]*)"', 'i').exec(m[1]); return r ? r[1] : ''; };
  const build = attr('content');
  if (!/^\d{8}\.\d{4}$/.test(build)) return null;
  const version = attr('data-version');
  const needs = parseInt(attr('data-needs'), 10);
  return { build, version: /^[\w.+-]{1,24}$/.test(version) ? version : '', needs: Number.isFinite(needs) ? needs : 1 };
}
/** -1: a старее b, 0: одинаково, 1: a новее b. */
const compareBuild = (a, b) => (a === b ? 0 : a < b ? -1 : 1);

/* ---------- чтение ZIP (без внешних библиотек) ---------- */
function readZip(buf, wanted) {
  if (buf.length > MAX_ZIP) throw new Error('zip-too-big');
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('zip-bad');
  const count = buf.readUInt16LE(eocd + 10), cdOff = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOff === 0xffffffff) throw new Error('zip-bad');
  const out = [];
  let p = cdOff, total = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw new Error('zip-bad');
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.toString(flags & 0x800 ? 'utf8' : 'latin1', p + 46, p + 46 + nl).replace(/\\/g, '/');
    p += 46 + nl + el + cl;
    if (name.endsWith('/') || /(^|\/)__MACOSX\//.test(name) || name.split('/').some(s => s === '..') || name.startsWith('/')) continue;
    if (wanted && !wanted(name)) continue;
    if (flags & 1) throw new Error('zip-encrypted');
    if (usize > MAX_ENTRY || (total += usize) > MAX_ZIP) throw new Error('zip-too-big');
    if (lo + 30 > buf.length || buf.readUInt32LE(lo) !== 0x04034b50) throw new Error('zip-bad');
    const start = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28);
    const raw = buf.subarray(start, start + csize);
    let data;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) { try { data = zlib.inflateRawSync(raw, { maxOutputLength: MAX_ENTRY }); } catch (e) { throw new Error('zip-bad'); } }
    else throw new Error('zip-method');
    out.push({ name, data });
  }
  return out;
}

/** Разбирает присланный файл (index.html или ZIP) в «кандидата на установку». Ничего не пишет на диск. */
function stage(buf, fileName) {
  if (!Buffer.isBuffer(buf) || !buf.length) throw new Error('empty');
  const isZip = buf.length > 4 && buf.readUInt32LE(0) === 0x04034b50;
  let html = null, fonts = [], meta = null;
  if (isZip) {
    const all = readZip(buf, n => /(^|\/)(index\.html|update\.json)$/i.test(n) || /(^|\/)fonts\/[^/]+\.woff2?$/i.test(n));
    const idx = all.filter(e => /(^|\/)index\.html$/i.test(e.name)).sort((a, b) => a.name.split('/').length - b.name.split('/').length)[0];
    if (!idx || idx.name.split('/').length > 4) throw new Error('no-index');
    const prefix = idx.name.slice(0, idx.name.length - 'index.html'.length);
    html = idx.data;
    for (const e of all) {
      if (e.name === prefix + 'update.json') { try { meta = JSON.parse(e.data.toString('utf8')); } catch (x) { meta = null; } }
      else if (e.name.startsWith(prefix + 'fonts/') && e.data.length <= MAX_FONT && fonts.length < MAX_FONTS) fonts.push({ rel: 'fonts/' + path.basename(e.name), data: e.data });
    }
  } else {
    if (buf[0] !== 0x3c && !(buf[0] === 0xef && buf[1] === 0xbb)) throw new Error('not-html');   // «<» или BOM
    html = buf;
  }
  if (html.length > MAX_HTML || html.length < MIN_HTML) throw new Error('bad-size');
  const stamp = parseStamp(html.toString('utf8', 0, 12288));
  if (!stamp) throw new Error('no-stamp');
  if (meta && typeof meta.sha256 === 'string' && /^[0-9a-f]{64}$/i.test(meta.sha256) && meta.sha256.toLowerCase() !== sha256(html)) throw new Error('hash-mismatch');
  return { build: stamp.build, version: stamp.version, needs: stamp.needs, size: html.length + fonts.reduce((s, f) => s + f.data.length, 0), sha256: sha256(html), name: path.basename(String(fileName || '')), files: [{ rel: 'index.html', data: html }, ...fonts] };
}

/* ---------- установка, откат, защита от «не запустилось» ---------- */
class Updater {
  constructor({ bundledDir, userData, bridge, shellVersion }) {
    this.bundledDir = bundledDir;
    this.root = path.join(userData, 'app-update');
    this.bridge = bridge;
    this.shellVersion = String(shellVersion || '');
  }
  _stampOf(file) {
    try { const fd = fs.openSync(file, 'r'); try { const b = Buffer.alloc(12288); const n = fs.readSync(fd, b, 0, b.length, 0); return parseStamp(b.toString('utf8', 0, n)); } finally { fs.closeSync(fd); } }
    catch (e) { return null; }
  }
  _meta() { try { return JSON.parse(fs.readFileSync(path.join(this.root, 'update.json'), 'utf8')); } catch (e) { return null; } }
  bundled() { return this._stampOf(path.join(this.bundledDir, 'index.html')); }
  /** Установленное обновление или null. */
  active() {
    const st = this._stampOf(path.join(this.root, 'index.html'));
    if (!st) return null;
    const m = this._meta() || {};
    return { build: st.build, version: st.version, needs: st.needs, source: String(m.source || ''), time: m.time || '', booted: m.booted === true };
  }
  activeDir() { return this.active() ? this.root : null; }
  info() { return { bundled: this.bundled(), active: this.active(), bridge: this.bridge }; }
  /** Ставит кандидата. Старое обновление заменяется целиком, встроенная версия не трогается. */
  async install(cand, source) {
    if (!cand || !Array.isArray(cand.files)) throw new Error('no-candidate');
    if (cand.needs > this.bridge) { const e = new Error('needs-shell'); e.needs = cand.needs; throw e; }
    const tmp = this.root + '.new-' + process.pid, old = this.root + '.old';
    await fsp.rm(tmp, { recursive: true, force: true });
    await fsp.mkdir(path.join(tmp, 'fonts'), { recursive: true });
    for (const f of cand.files) {
      if (!/^(index\.html|fonts\/[\w.-]+\.woff2?)$/.test(f.rel)) continue;
      await fsp.writeFile(path.join(tmp, ...f.rel.split('/')), f.data);
    }
    await fsp.writeFile(path.join(tmp, 'update.json'), JSON.stringify({ build: cand.build, version: cand.version, sha256: cand.sha256, source: String(source || '').slice(0, 300), time: new Date().toISOString(), booted: false, shell: this.shellVersion }, null, 1));
    await fsp.rm(old, { recursive: true, force: true });
    if (fs.existsSync(this.root)) await fsp.rename(this.root, old);
    await fsp.rename(tmp, this.root);
    await fsp.rm(old, { recursive: true, force: true });
  }
  async reset() { await fsp.rm(this.root, { recursive: true, force: true }); }
  /** Установленное «страничное» обновление устарело относительно встроенной страницы. Так бывает после обновления оболочки:
      новая оболочка принесла свежую страницу, а старое обновление лежит в папке данных и перекрыло бы её.
      Если обновление поставили под этой же оболочкой (в том числе нарочно более старое), оно остаётся. */
  supersededByBundled() {
    const a = this.active(), b = this.bundled();
    if (!a || !b || !a.build || !b.build) return false;
    const m = this._meta() || {};
    const shellChanged = !m.shell || m.shell !== this.shellVersion;
    return shellChanged && compareBuild(b.build, a.build) >= 0;
  }
  /** Страница запустилась и дошла до связи с оболочкой: обновление считается рабочим. */
  markBooted() {
    const m = this._meta(); if (!m || m.booted === true) return;
    m.booted = true;
    try { fs.writeFileSync(path.join(this.root, 'update.json'), JSON.stringify(m, null, 1)); } catch (e) { /* не страшно */ }
  }
  /** При запуске: если прошлое обновление ни разу не дошло до рабочего состояния, возвращаем встроенную версию. */
  checkBoot() {
    if (!fs.existsSync(this.root)) return null;
    const a = this.active();
    if (a && a.booted) return null;
    try { fs.rmSync(this.root, { recursive: true, force: true }); } catch (e) { /* ничего */ }
    return a ? { rolledBack: a.build } : null;
  }
  /** При запуске: если встроенная страница не старее установленного обновления и оболочка с тех пор сменилась — убираем обновление. true, если убрали. */
  dropSuperseded() {
    if (!this.supersededByBundled()) return false;
    try { fs.rmSync(this.root, { recursive: true, force: true }); return true; } catch (e) { return false; }
  }
}

module.exports = { Updater, stage, readZip, parseStamp, compareBuild, sha256, STAMP_RE };

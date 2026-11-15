'use strict';
/* Обновление самой оболочки (установленной программы) с GitHub — чистый Node, без Electron, поэтому проверяется обычными тестами.
   Откуда берём: только последний выпуск ФИКСИРОВАННОГО репозитория (страница адрес не задаёт: замена программы — самое рискованное действие).
   Чем проверяем: SHA-256 из сведений о файле на GitHub и размер. Без контрольной суммы тихо ничего не ставим — только скачиваем и показываем папку.
   Что делаем по системам:
     Windows (установщик)  — тихо запускаем установщик поверх (--updated /S --force-run) и закрываем программу;
     Linux (AppImage)      — заменяем сам файл AppImage и запускаем его снова;
     Windows portable, macOS, прочее — скачиваем в «Загрузки» и показываем файл: заменить на ходу они не могут
                             (macOS без платной подписи Apple запрещает замену, portable не может заменить сам себя). */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const MAX_SIZE = 400 * 1048576;

function parseVer(v) {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?/.exec(String(v || '').trim());
  return m ? [+m[1], +m[2], +(m[3] || 0)] : null;
}
function cmpVer(a, b) {
  const A = parseVer(a), B = parseVer(b);
  if (!A || !B) return 0;
  for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] > B[i] ? 1 : -1;
  return 0;
}
/** «Линия» оболочки — первые два числа (1.3). Новая линия = новая оболочка; внутри линии обновляется только страница. */
const lineOf = v => { const p = parseVer(v); return p ? p[0] + '.' + p[1] : ''; };

/** Какой файл выпуска подходит этой системе: { name, mode } или null. mode: installer | appimage | portable | dmg | manual */
function pickAssetName(platform, arch, env) {
  env = env || {};
  if (platform === 'win32') {
    if (arch !== 'x64') return null;
    return env.PORTABLE_EXECUTABLE_FILE ? { name: 'VNMap-win-x64-portable.exe', mode: 'portable' } : { name: 'VNMap-win-x64-setup.exe', mode: 'installer' };
  }
  if (platform === 'linux') return arch === 'x64' ? { name: 'VNMap-linux-x86_64.AppImage', mode: env.APPIMAGE ? 'appimage' : 'manual' } : null;
  if (platform === 'darwin') return { name: arch === 'arm64' ? 'VNMap-mac-arm64.dmg' : 'VNMap-mac-x64.dmg', mode: 'dmg' };
  return null;
}

class ShellUpdater {
  /** o: { version, platform, arch, env, repo, apiBase, fetch, dir (рабочая папка), downloads (папка «Загрузки»), allowHttp } */
  constructor(o) {
    this.version = o.version; this.platform = o.platform || process.platform; this.arch = o.arch || process.arch; this.env = o.env || {};
    this.repo = o.repo; this.apiBase = o.apiBase || 'https://api.github.com'; this.fetch = o.fetch || globalThis.fetch;
    this.dir = o.dir; this.downloads = o.downloads || o.dir; this.allowHttp = !!o.allowHttp;
    this.last = null; this.busy = false;
  }
  _okUrl(u) {
    try { const x = new URL(u); return x.protocol === 'https:' || (this.allowHttp && x.protocol === 'http:' && x.hostname === '127.0.0.1'); } catch (e) { return false; }
  }
  async _json(url) {
    const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 30000);
    try {
      const res = await this.fetch(url, { signal: ac.signal, redirect: 'follow', headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'VNMap', 'Cache-Control': 'no-cache' }, cache: 'no-store' });
      if (res.status === 404) throw new Error('su-norelease');
      if (!res.ok) throw new Error('su-http');
      return await res.json();
    } catch (e) { if (e && e.name === 'AbortError') throw new Error('su-timeout'); if (e && /^su-/.test(e.message)) throw e; throw new Error('su-net'); } finally { clearTimeout(tm); }
  }

  /** Спрашивает GitHub о последнем выпуске. Ничего не скачивает. */
  async check() {
    const info = await this._json(`${this.apiBase}/repos/${this.repo}/releases/latest`);
    const tag = String(info.tag_name || '');
    const latest = tag.replace(/^v/, '');
    const pick = pickAssetName(this.platform, this.arch, this.env);
    let asset = null;
    if (pick) {
      const a = (info.assets || []).find(x => x && x.name === pick.name);
      if (a && this._okUrl(a.browser_download_url)) {
        const m = /^sha256:([0-9a-f]{64})$/i.exec(String(a.digest || ''));
        asset = { name: a.name, url: a.browser_download_url, size: +a.size || 0, sha256: m ? m[1].toLowerCase() : '' };
      }
    }
    let mode = 'none';
    if (pick && asset) { mode = pick.mode; if ((mode === 'installer' || mode === 'appimage') && !asset.sha256) mode = 'manual'; }   // без контрольной суммы тихо не ставим
    this.last = {
      current: this.version, latest, tag, htmlUrl: String(info.html_url || ''), notes: String(info.body || '').slice(0, 4000),
      newer: cmpVer(latest, this.version) > 0, newLine: !!lineOf(latest) && !!lineOf(this.version) && cmpVer(lineOf(latest) + '.0', lineOf(this.version) + '.0') > 0,
      mode, asset,
    };
    return this.last;
  }

  /** Скачивает файл проверяя размер и SHA-256. onProgress(got, total). Возвращает { file, name, size, verified }. */
  async download(onProgress) {
    if (this.busy) throw new Error('su-busy');
    const c = this.last || await this.check();
    if (!c.asset || c.mode === 'none') throw new Error('su-noasset');
    if (c.asset.size > MAX_SIZE) throw new Error('su-toobig');
    this.busy = true;
    const manual = !(c.mode === 'installer' || c.mode === 'appimage');
    const dir = manual ? this.downloads : this.dir;
    const dest = path.join(dir, c.asset.name), part = dest + '.part';
    try {
      await fsp.mkdir(dir, { recursive: true });
      const res = await this.fetch(c.asset.url, { redirect: 'follow', headers: { 'User-Agent': 'VNMap' } });
      let fin = null; try { fin = new URL(res.url || c.asset.url); } catch (e) { /* нет */ }
      if (!res.ok || !fin || !this._okUrl(fin.href)) throw new Error('su-http');
      const total = +res.headers.get('content-length') || c.asset.size || 0;
      if (total > MAX_SIZE) throw new Error('su-toobig');
      const hash = crypto.createHash('sha256'); let got = 0, lastTick = 0;
      const out = fs.createWriteStream(part);
      const rd = res.body.getReader();
      try {
        for (;;) {
          const { done, value } = await rd.read(); if (done) break;
          got += value.length; if (got > MAX_SIZE) throw new Error('su-toobig');
          hash.update(value);
          if (!out.write(Buffer.from(value))) await new Promise(r => out.once('drain', r));
          const now = Date.now(); if (onProgress && now - lastTick > 150) { lastTick = now; onProgress(got, total); }
        }
      } finally { await new Promise(r => out.end(r)); }
      if (onProgress) onProgress(got, total);
      if (c.asset.size && got !== c.asset.size) throw new Error('su-size');
      if (c.asset.sha256 && hash.digest('hex') !== c.asset.sha256) throw new Error('su-hash');
      await fsp.rename(part, dest);
      return { file: dest, name: c.asset.name, size: got, verified: !!c.asset.sha256, mode: c.mode };
    } catch (e) {
      try { await fsp.unlink(part); } catch (x) { /* нет */ }
      throw e;
    } finally { this.busy = false; }
  }

  /** Подготовка к установке. Возвращает действие для главного процесса: { run: [файл, аргументы], quit } | { relaunch: путь, quit } | { reveal: файл } */
  async plan(file) {
    const c = this.last;
    if (!c || !file) throw new Error('su-noasset');
    const root = path.resolve(this.dir);
    if (c.mode === 'installer') {
      if (!path.resolve(file).startsWith(root + path.sep)) throw new Error('su-badfile');
      return { run: [file, ['--updated', '/S', '--force-run']], quit: true };
    }
    if (c.mode === 'appimage') {
      if (!path.resolve(file).startsWith(root + path.sep)) throw new Error('su-badfile');
      const target = this.env.APPIMAGE;
      if (!target) throw new Error('su-noasset');
      const tmp = path.join(path.dirname(target), '.' + path.basename(target) + '.new');
      await fsp.copyFile(file, tmp);
      await fsp.chmod(tmp, 0o755);
      await fsp.rename(tmp, target);             // замена файла «на ходу» безопасна в Linux: запущенная копия продолжает работать
      try { await fsp.unlink(file); } catch (e) { /* не страшно */ }
      return { relaunch: target, quit: true };
    }
    return { reveal: file, quit: false };
  }
}

module.exports = { ShellUpdater, pickAssetName, parseVer, cmpVer, lineOf };

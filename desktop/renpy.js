'use strict';
/* Запуск настоящего Ren'Py из оболочки (чистый Node, без Electron — проверяется обычными тестами).
   Страница НЕ задаёт ни программу, ни пути: папку SDK и папку проекта Ren'Py выбирает человек в системном диалоге,
   а команды (run / lint / distribute) собираются здесь из белого списка. Вывод процесса уходит на страницу кусочками. */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { spawn } = require('child_process');
const { StringDecoder } = require('string_decoder');
const { writeBuildFiles, exists } = require('./buildwrite');

const KINDS = ['run', 'lint', 'distribute'];
const PACKAGES = ['pc', 'win', 'linux', 'mac', 'market'];
const MAX_OUT = 3 * 1024 * 1024;           // символов вывода на одну задачу; дальше — «вывод обрезан»
const FLUSH_MS = 60;

const safeKey = k => String(k == null ? '' : k).replace(/[^\w.\-]/g, '_').slice(0, 80);

/* ---------- проверка папок ---------- */
async function isDir(p) { try { return (await fsp.stat(p)).isDirectory(); } catch (e) { return false; } }

async function looksLikeSdk(dir) {
  return (await exists(path.join(dir, 'renpy.py'))) && (await isDir(path.join(dir, 'renpy'))) && (await isDir(path.join(dir, 'launcher')));
}
async function sdkVersion(dir) {
  for (const [f, re] of [
    [path.join(dir, 'renpy', '__init__.py'), /version_only\s*=\s*['"]([\d.]+)['"]/],
    [path.join(dir, 'renpy', '__init__.py'), /version_tuple\s*=\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/],
    [path.join(dir, 'renpy', 'vc_version.py'), /version\s*=\s*['"]([\d.]+)['"]/],
  ]) {
    try { const m = re.exec(await fsp.readFile(f, 'utf8')); if (m) return m.length > 2 ? m.slice(1, 4).join('.') : m[1]; } catch (e) { /* пробуем дальше */ }
  }
  const m = /renpy[-_ ]?(\d+(?:\.\d+)+)/i.exec(path.basename(dir));
  return m ? m[1] : '';
}
/** Результат: { ok, dir, exe, version, code } — code при ошибке: no-dir | not-sdk | is-project | no-exe */
async function inspectSdk(dirIn, platform) {
  platform = platform || process.platform;
  const out = { ok: false, dir: '', exe: '', version: '', code: '' };
  if (typeof dirIn !== 'string' || !dirIn || !(await isDir(dirIn))) { out.code = 'no-dir'; return out; }
  let root = path.resolve(dirIn);
  if (!(await looksLikeSdk(root))) {
    /* выбрали папку уровнем выше (с распакованным «renpy-8.x-sdk» внутри) — заходим в неё */
    const hits = [];
    try { for (const d of await fsp.readdir(root, { withFileTypes: true })) if (d.isDirectory() && /^renpy/i.test(d.name) && await looksLikeSdk(path.join(root, d.name))) hits.push(path.join(root, d.name)); } catch (e) { /* нет прав */ }
    if (hits.length) root = hits.sort().pop();
    else { out.code = (await isDir(path.join(root, 'game'))) ? 'is-project' : 'not-sdk'; return out; }
  }
  const exe = path.join(root, platform === 'win32' ? 'renpy.exe' : 'renpy.sh');
  if (!(await exists(exe))) { out.dir = root; out.code = 'no-exe'; return out; }
  return { ok: true, dir: root, exe, version: await sdkVersion(root), code: '' };
}

/** Проект Ren'Py: { dir, exists, hasGame, options, gui, screens, ours } */
async function inspectProject(dirIn) {
  const r = { dir: '', exists: false, hasGame: false, options: false, gui: false, screens: false, ours: false };
  if (typeof dirIn !== 'string' || !dirIn) return r;
  r.dir = path.resolve(dirIn);
  if (!(await isDir(r.dir))) return r;
  r.exists = true;
  const g = path.join(r.dir, 'game');
  r.hasGame = await isDir(g);
  if (r.hasGame) {
    r.options = await exists(path.join(g, 'options.rpy'));
    r.gui = await exists(path.join(g, 'gui.rpy'));
    r.screens = await exists(path.join(g, 'screens.rpy'));
  }
  r.ours = await exists(path.join(r.dir, '.vnmap-build.json'));
  return r;
}

/* ---------- команда ---------- */
function shq(s) { return /[\s"'$&|<>()]/.test(s) ? '"' + s.replace(/"/g, '\\"') + '"' : s; }
/** Что запускать для SDK: на Windows — renpy.exe, на остальных — renpy.sh через sh (не зависит от бита «исполняемый»). */
function commandFor(sdk, args, platform) {
  platform = platform || process.platform;
  return platform === 'win32' ? { file: sdk.exe, args } : { file: '/bin/sh', args: [sdk.exe, ...args] };
}
function argsFor(sdk, projectDir, kind, opts) {
  if (kind === 'run') return [projectDir, 'run'];
  if (kind === 'lint') return [projectDir, 'lint'];
  const pk = (Array.isArray(opts && opts.packages) ? opts.packages : []).filter(p => PACKAGES.includes(p));
  const a = [path.join(sdk.dir, 'launcher'), 'distribute', projectDir];
  for (const p of (pk.length ? [...new Set(pk)] : ['pc'])) a.push('--package', p);
  return a;
}

/* ---------- хозяин процессов ---------- */
class RenpyHost {
  /** o: { file, emit(event), confirm(n) -> bool, strings(), version(), platform } */
  constructor(o) {
    this.file = o.file;
    this.emit = o.emit || (() => { });
    this.confirm = o.confirm || (async () => true);
    this.strings = o.strings || (() => ({}));
    this.version = o.version || (() => '');
    this.platform = o.platform || process.platform;
    this.jobs = new Map();
    this.seq = 0;
    this.cfg = this._load();
  }
  _load() {
    try { const j = JSON.parse(fs.readFileSync(this.file, 'utf8')); return { sdk: typeof j.sdk === 'string' ? j.sdk : '', dirs: j.dirs && typeof j.dirs === 'object' ? j.dirs : {} }; } catch (e) { return { sdk: '', dirs: {} }; }
  }
  _save() {
    const keys = Object.keys(this.cfg.dirs); if (keys.length > 200) for (const k of keys.slice(0, keys.length - 200)) delete this.cfg.dirs[k];
    try { fs.mkdirSync(path.dirname(this.file), { recursive: true }); fs.writeFileSync(this.file, JSON.stringify(this.cfg)); } catch (e) { /* не страшно: выберут заново */ }
  }

  async status(key) {
    const k = safeKey(key);
    const sdk = this.cfg.sdk ? await inspectSdk(this.cfg.sdk, this.platform) : null;
    const dir = this.cfg.dirs[k] || '';
    return {
      platform: this.platform, sdk: sdk ? Object.assign(sdk, { saved: this.cfg.sdk }) : null,
      project: dir ? await inspectProject(dir) : null,
      jobs: [...this.jobs.values()].filter(j => j.key === k).map(j => ({ id: j.id, kind: j.kind, started: j.started })),
    };
  }
  /** Папка SDK выбрана в диалоге; возвращает { ok, code?, sdk } */
  async setSdk(dir) {
    const s = await inspectSdk(dir, this.platform);
    if (!s.ok) return { ok: false, code: s.code, sdk: s };
    this.cfg.sdk = s.dir; this._save();
    return { ok: true, sdk: s };
  }
  clearSdk() { this.cfg.sdk = ''; this._save(); return true; }
  async setProject(key, dir) {
    const p = await inspectProject(dir);
    if (!p.exists) return { ok: false, code: 'no-dir', project: p };
    /* в SDK вместо проекта — частая ошибка */
    if (await looksLikeSdk(p.dir)) return { ok: false, code: 'is-sdk', project: p };
    if (!p.hasGame) return { ok: false, code: 'no-game', project: p };
    this.cfg.dirs[safeKey(key)] = p.dir; this._save();
    return { ok: true, project: p };
  }
  clearProject(key) { delete this.cfg.dirs[safeKey(key)]; this._save(); return true; }

  /** Записать игру в папку проекта Ren'Py (только game/…) */
  async write(key, entries) {
    const dir = this.cfg.dirs[safeKey(key)];
    if (!dir || !(await isDir(dir))) return { ok: false, code: 'no-project' };
    const list = (Array.isArray(entries) ? entries : []).filter(e => e && typeof e.name === 'string' && /^game\//.test(e.name.replace(/\\/g, '/')));
    if (!list.length) return { ok: false, code: 'empty' };
    const r = await writeBuildFiles(dir, list, { version: this.version(), confirm: this.confirm, clash: 'foreign', strings: this.strings() });
    if (!r) return { ok: false, code: 'cancel' };
    return Object.assign({ ok: true }, r);
  }

  /** Запустить run / lint / distribute. Возвращает { ok, id, cmd } либо { ok:false, code } */
  async start(key, kind, opts) {
    const k = safeKey(key);
    if (!KINDS.includes(kind)) return { ok: false, code: 'bad-kind' };
    const sdk = this.cfg.sdk ? await inspectSdk(this.cfg.sdk, this.platform) : null;
    if (!sdk || !sdk.ok) return { ok: false, code: 'no-sdk' };
    const dir = this.cfg.dirs[k];
    const proj = dir ? await inspectProject(dir) : null;
    if (!proj || !proj.exists) return { ok: false, code: 'no-project' };
    if (!proj.hasGame) return { ok: false, code: 'no-game' };
    for (const j of [...this.jobs.values()]) {
      if (j.key !== k || j.kind !== kind) continue;
      if (kind === 'run') await this._killAndWait(j); else return { ok: false, code: 'busy' };   // игру перезапускаем, остальное — по одному
    }
    const args = argsFor(sdk, proj.dir, kind, opts);
    const job = { id: ++this.seq, key: k, kind, started: Date.now(), sdk, proj, opts, args, buf: [], size: 0, cut: false, child: null, timer: null, closed: false, tried: 0 };
    this.jobs.set(job.id, job);
    const cmd = this._spawn(job, kind === 'distribute' ? args.concat(['--no-launch']) : args);
    return { ok: true, id: job.id, cmd };
  }

  _spawn(job, args) {
    const c = commandFor(job.sdk, args, this.platform);
    const cmd = [c.file, ...c.args].map(shq).join(' ');
    job.tried++; job.cmd = cmd; job.mark = Date.now();
    this._push(job, 'sys', '$ ' + cmd + '\n');
    let child;
    try {
      child = spawn(c.file, c.args, {
        cwd: job.sdk.dir, windowsHide: true, detached: this.platform !== 'win32',
        env: Object.assign({}, process.env, { PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' }), stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) { this._push(job, 'err', String(e && e.message || e) + '\n'); this._finish(job, { code: null, error: String(e && e.message || e) }); return cmd; }
    job.child = child;
    for (const [stream, name] of [[child.stdout, 'out'], [child.stderr, 'err']]) {
      const dec = new StringDecoder('utf8');
      stream.on('data', b => this._push(job, name, dec.write(b)));
      stream.on('end', () => { const rest = dec.end(); if (rest) this._push(job, name, rest); });
    }
    let done = false;
    child.on('error', e => { if (done) return; done = true; this._push(job, 'err', String(e && e.message || e) + '\n'); this._finish(job, { code: null, error: String(e && e.message || e) }); });
    child.on('close', (code, signal) => { if (done) return; done = true; this._after(job, code, signal); });
    return cmd;
  }

  async _after(job, code, signal) {
    /* distribute: если эта версия Ren'Py не знает --no-launch, повторяем без него */
    if (job.kind === 'distribute' && code !== 0 && job.tried === 1 && /unrecognized arguments?:?[^\n]*--no-launch|--no-launch[^\n]*(not recognized|unknown)/i.test(job.all || '')) {
      this._push(job, 'sys', '\n' + (this.strings().retryNoLaunch || '↻ Retrying without --no-launch') + '\n');
      job.child = null; this._spawn(job, job.args); return;
    }
    const extra = {};
    try {
      /* Ren'Py пишет подробности в файлы рядом с проектом: показываем те, что свежее запуска */
      const files = job.kind === 'lint' ? ['lint.txt'] : job.kind === 'run' ? ['traceback.txt', 'errors.txt'] : [];
      for (const f of files) {
        const p = path.join(job.proj.dir, f);
        try {
          const st = await fsp.stat(p);
          if (st.isFile() && st.mtimeMs >= job.started - 1500 && st.size < 512 * 1024) {
            const txt = (await fsp.readFile(p, 'utf8')).trim();
            if (txt && !(job.all || '').includes(txt.slice(0, 120))) this._push(job, 'file', '\n── ' + f + ' ──\n' + txt + '\n');
          }
        } catch (e) { /* файла нет — хорошо */ }
      }
      if (job.kind === 'distribute' && code === 0) extra.outDir = await this._findDists(job);
    } catch (e) { /* необязательные подробности */ }
    this._finish(job, Object.assign({ code, signal: signal || null }, extra));
  }
  async _findDists(job) {
    let best = null;
    for (const base of [path.dirname(job.proj.dir), job.proj.dir]) {
      try {
        for (const d of await fsp.readdir(base, { withFileTypes: true })) {
          if (!d.isDirectory() || !/-dists$/i.test(d.name)) continue;
          const p = path.join(base, d.name), st = await fsp.stat(p);
          if (st.mtimeMs >= job.started - 2000 && (!best || st.mtimeMs > best.t)) best = { p, t: st.mtimeMs };
        }
      } catch (e) { /* нет прав или нет папки */ }
    }
    return best ? best.p : '';
  }

  _push(job, stream, text) {
    if (!text) return;
    job.all = (job.all || '') + text; if (job.all.length > 20000) job.all = job.all.slice(-20000);   // хвост — для разбора «не знаю такой параметр»
    if (job.cut) return;
    job.size += text.length;
    if (job.size > MAX_OUT) { job.cut = true; text = text.slice(0, Math.max(0, text.length - (job.size - MAX_OUT))) + '\n' + (this.strings().cut || '… output truncated …') + '\n'; }
    job.buf.push({ s: stream, text });
    if (!job.timer) job.timer = setTimeout(() => this._flush(job), FLUSH_MS);
  }
  _flush(job) {
    if (job.timer) { clearTimeout(job.timer); job.timer = null; }
    if (!job.buf.length) return;
    const chunks = job.buf; job.buf = [];
    this.emit({ t: 'out', id: job.id, kind: job.kind, chunks });
  }
  _finish(job, info) {
    if (job.closed) return;
    job.closed = true;
    this._flush(job);
    this.jobs.delete(job.id);
    this.emit(Object.assign({ t: 'exit', id: job.id, kind: job.kind, ms: Date.now() - job.started, stopped: !!job.stopped, key: job.key }, info));
  }

  async stop(id) {
    const j = this.jobs.get(+id);
    if (!j) return false;
    j.stopped = true; this._kill(j);
    return true;
  }
  _kill(j) {
    const c = j.child; if (!c || !c.pid) return;
    try {
      if (this.platform === 'win32') spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).on('error', () => { });
      else process.kill(-c.pid, 'SIGTERM');
    } catch (e) { try { c.kill('SIGTERM'); } catch (x) { /* уже нет */ } }
    if (this.platform !== 'win32') setTimeout(() => { if (!j.closed) { try { process.kill(-c.pid, 'SIGKILL'); } catch (e) { /* нет */ } } }, 3000).unref();
  }
  _killAndWait(j) {
    return new Promise(res => {
      if (j.closed) return res();
      j.stopped = true; this._kill(j);
      const t0 = Date.now(), iv = setInterval(() => { if (j.closed || Date.now() - t0 > 5000) { clearInterval(iv); res(); } }, 40);
    });
  }
  shutdown() { for (const j of [...this.jobs.values()]) { j.stopped = true; this._kill(j); } }
}

module.exports = { RenpyHost, inspectSdk, inspectProject, commandFor, argsFor, safeKey, KINDS, PACKAGES };

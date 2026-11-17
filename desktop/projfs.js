'use strict';
/* Файлы внутри папки проекта Ren'Py для окна «Редактор кода» (дерево, чтение, запись, создание, переименование, корзина).
   Страница ничего не пишет сама: она называет путь внутри папки («game/script.rpy»), а проверку и запись делает этот файл.
   Все пути приводятся к виду «относительно корня»: «..», абсолютные пути, диски и служебные знаки отклоняются; ссылки (symlink),
   ведущие за пределы корня, тоже. Читаются и пишутся только текстовые файлы в UTF-8 до 4 МБ. Удаление идёт в корзину системы.
   Каждая операция возвращает { ok:true, ... } или { ok:false, code } (код ошибки), исключений наружу не бросает. */
const fs = require('fs');
const path = require('path');
const fsp = fs.promises;

const MAX_TEXT = 4 * 1024 * 1024;
const MAX_LIST = 6000;
const MAX_FILES = 12000;
const HIDDEN_NAMES = new Set(['.git', '.svn', '.hg', '__pycache__', 'cache', 'saves', '.DS_Store', 'Thumbs.db', '.vscode', '.idea']);
const HIDDEN_EXT = new Set(['.rpyc', '.rpymc', '.pyc', '.pyo', '.bak~']);
const SKIP_WALK = new Set(['.git', '.svn', '.hg', '__pycache__', 'cache', 'saves', 'node_modules', '.vscode', '.idea']);
const CASE_INSENSITIVE = process.platform === 'win32' || process.platform === 'darwin';

const fail = code => ({ ok: false, code });
const ioCode = e => (e && e.code === 'ENOENT' ? 'not-found' : e && (e.code === 'EEXIST') ? 'exists' : e && (e.code === 'EACCES' || e.code === 'EPERM') ? 'denied' : e && e.code === 'ENOTEMPTY' ? 'not-empty' : e && e.code === 'ENOSPC' ? 'full' : 'io');

/** Путь внутри корня: «a/b.rpy» (прямые слеши, без «..»), '' для самого корня; null — недопустимо. */
function cleanRel(rel) {
  if (typeof rel !== 'string' || rel.length > 1024 || rel.includes('\0')) return null;
  const parts = rel.replace(/\\/g, '/').split('/').filter(x => x && x !== '.');
  for (const p of parts) {
    if (p === '..' || /[<>:"|?*\x00-\x1f]/.test(p) || /[. ]$/.test(p) || p.length > 255) return null;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(p)) return null;
  }
  return parts.join('/');
}
const inside = (root, p) => {
  const a = CASE_INSENSITIVE ? p.toLowerCase() : p, b = CASE_INSENSITIVE ? root.toLowerCase() : root;
  return a === b || a.startsWith(b.endsWith(path.sep) ? b : b + path.sep);
};
/** Настоящий путь самого глубокого существующего предка плюс остаток: чтобы ссылка наружу не обошла проверку. */
async function realDeep(abs) {
  const rest = [];
  let cur = abs;
  for (let i = 0; i < 64; i++) {
    try { const r = await fsp.realpath(cur); return rest.length ? path.join(r, ...rest.reverse()) : r; } catch (e) {
      if (!e || e.code !== 'ENOENT') throw e;
      const up = path.dirname(cur); if (up === cur) throw e;
      rest.push(path.basename(cur)); cur = up;
    }
  }
  throw new Error('deep');
}

class ProjFs {
  /** getRoot(key) → абсолютная папка проекта или ''; trash(абсолютный путь) → Promise (корзина системы); reveal(путь) */
  constructor(o) { this.getRoot = o.getRoot; this.trash = o.trash || null; this.reveal = o.reveal || null; }

  async _root(key) {
    const dir = this.getRoot(key);
    if (!dir) return null;
    try { const real = await fsp.realpath(dir); const st = await fsp.stat(real); return st.isDirectory() ? { dir: path.resolve(dir), real } : null; } catch (e) { return null; }
  }
  /** { abs, rel } либо { err } */
  async _at(key, relIn, { allowRoot = true } = {}) {
    const root = await this._root(key); if (!root) return { err: 'no-project' };
    const rel = cleanRel(relIn); if (rel == null) return { err: 'bad-path' };
    if (!rel && !allowRoot) return { err: 'bad-path' };
    const abs = path.join(root.dir, ...(rel ? rel.split('/') : []));
    try { const real = await realDeep(abs); if (!inside(root.real, real)) return { err: 'outside' }; } catch (e) { return { err: ioCode(e) }; }
    return { abs, rel, root };
  }

  async info(key) {
    const root = await this._root(key);
    return root ? { ok: true, dir: root.dir, name: path.basename(root.dir) } : fail('no-project');
  }

  async list(key, relIn) {
    const at = await this._at(key, relIn); if (at.err) return fail(at.err);
    try {
      const ents = await fsp.readdir(at.abs, { withFileTypes: true });
      const out = [];
      for (const e of ents) {
        if (out.length >= MAX_LIST) break;
        let dir = e.isDirectory(), link = e.isSymbolicLink();
        if (link) { try { dir = (await fsp.stat(path.join(at.abs, e.name))).isDirectory(); } catch (x) { continue; } }
        if (!dir && !e.isFile() && !link) continue;
        const ext = path.extname(e.name).toLowerCase();
        out.push({ n: e.name, d: dir, h: HIDDEN_NAMES.has(e.name) || HIDDEN_EXT.has(ext) || (e.name.startsWith('.') && e.name !== '.gitignore') });
      }
      const coll = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
      out.sort((a, b) => (a.d === b.d ? coll.compare(a.n, b.n) : a.d ? -1 : 1));
      return { ok: true, items: out, more: ents.length > MAX_LIST };
    } catch (e) { return fail(ioCode(e)); }
  }

  /** Плоский список всех файлов (для быстрого перехода по имени); служебные и тяжёлые папки пропускаются. */
  async files(key) {
    const root = await this._root(key); if (!root) return fail('no-project');
    const out = []; let cut = false;
    const walk = async (abs, rel, depth) => {
      if (depth > 12 || out.length >= MAX_FILES) { cut = true; return; }
      let ents; try { ents = await fsp.readdir(abs, { withFileTypes: true }); } catch (e) { return; }
      for (const e of ents) {
        if (out.length >= MAX_FILES) { cut = true; return; }
        const r = rel ? rel + '/' + e.name : e.name;
        if (e.isDirectory()) { if (!SKIP_WALK.has(e.name)) await walk(path.join(abs, e.name), r, depth + 1); }
        else if (e.isFile() && !HIDDEN_EXT.has(path.extname(e.name).toLowerCase())) out.push(r);
      }
    };
    await walk(root.dir, '', 0);
    return { ok: true, files: out, cut };
  }

  async read(key, relIn) {
    const at = await this._at(key, relIn, { allowRoot: false }); if (at.err) return fail(at.err);
    try {
      const st = await fsp.stat(at.abs);
      if (st.isDirectory()) return fail('is-dir');
      if (st.size > MAX_TEXT) return { ok: false, code: 'big', size: st.size };
      let buf = await fsp.readFile(at.abs);
      if (buf.subarray(0, 8000).includes(0)) return fail('binary');
      let bom = false;
      if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) { bom = true; buf = buf.subarray(3); }
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { return fail('encoding'); }
      const eol = /\r\n/.test(text) ? 'crlf' : 'lf';
      return { ok: true, text: text.replace(/\r\n?/g, '\n'), size: st.size, mtime: st.mtimeMs, bom, eol };
    } catch (e) { return fail(ioCode(e)); }
  }

  /** o: { text, eol, bom, expect } — expect: время изменения, каким файл был при чтении (если на диске иное: code 'changed'). */
  async write(key, relIn, o) {
    o = o || {};
    if (typeof o.text !== 'string') return fail('bad-data');
    if (Buffer.byteLength(o.text, 'utf8') > MAX_TEXT * 2) return fail('big');
    const at = await this._at(key, relIn, { allowRoot: false }); if (at.err) return fail(at.err);
    try {
      let mode = 0o644, existed = false;
      try {
        const st = await fsp.stat(at.abs);
        if (st.isDirectory()) return fail('is-dir');
        existed = true; mode = st.mode & 0o777;
        if (typeof o.expect === 'number' && Math.abs(st.mtimeMs - o.expect) > 2) return { ok: false, code: 'changed', mtime: st.mtimeMs };
      } catch (e) { if (!e || e.code !== 'ENOENT') throw e; }
      const parent = path.dirname(at.abs);
      try { if (!(await fsp.stat(parent)).isDirectory()) return fail('bad-path'); } catch (e) { return fail('not-found'); }
      let text = o.text.replace(/\r\n?/g, '\n');
      if (o.eol === 'crlf') text = text.replace(/\n/g, '\r\n');
      const tmp = at.abs + '.vntmp' + process.pid;
      await fsp.writeFile(tmp, Buffer.concat([o.bom ? Buffer.from([0xEF, 0xBB, 0xBF]) : Buffer.alloc(0), Buffer.from(text, 'utf8')]), { mode });
      try { await fsp.rename(tmp, at.abs); } catch (e) { try { await fsp.unlink(tmp); } catch (x) { /* нет */ } throw e; }
      const st2 = await fsp.stat(at.abs);
      return { ok: true, mtime: st2.mtimeMs, size: st2.size, created: !existed };
    } catch (e) { return fail(ioCode(e)); }
  }

  async create(key, relIn, kind) {
    const at = await this._at(key, relIn, { allowRoot: false }); if (at.err) return fail(at.err);
    try {
      if (kind === 'dir') await fsp.mkdir(at.abs, { recursive: false });
      else await fsp.writeFile(at.abs, '', { flag: 'wx', mode: 0o644 });
      return { ok: true, rel: at.rel };
    } catch (e) { return fail(ioCode(e)); }
  }

  async rename(key, fromIn, toIn) {
    const a = await this._at(key, fromIn, { allowRoot: false }); if (a.err) return fail(a.err);
    const b = await this._at(key, toIn, { allowRoot: false }); if (b.err) return fail(b.err);
    const A = a.abs + path.sep, B = b.abs;
    if ((CASE_INSENSITIVE ? B.toLowerCase() : B).startsWith(CASE_INSENSITIVE ? A.toLowerCase() : A)) return fail('bad-path');     // папку нельзя переместить внутрь себя
    try {
      if (a.abs !== b.abs && (!CASE_INSENSITIVE || a.abs.toLowerCase() !== b.abs.toLowerCase())) { try { await fsp.lstat(b.abs); return fail('exists'); } catch (e) { if (!e || e.code !== 'ENOENT') throw e; } }
      await fsp.rename(a.abs, b.abs);
      return { ok: true, rel: b.rel };
    } catch (e) { return fail(ioCode(e)); }
  }

  async remove(key, relIn) {
    const at = await this._at(key, relIn, { allowRoot: false }); if (at.err) return fail(at.err);
    if (!this.trash) return fail('no-trash');
    try { await fsp.lstat(at.abs); } catch (e) { return fail(ioCode(e)); }
    try { await this.trash(at.abs); return { ok: true }; } catch (e) { return fail('trash'); }
  }

  /** Время изменения и размер для списка файлов (проверка «файл изменили снаружи»). Нет файла: null. */
  async stat(key, rels) {
    const root = await this._root(key); if (!root) return fail('no-project');
    const out = {};
    for (const r of (Array.isArray(rels) ? rels : []).slice(0, 200)) {
      const at = await this._at(key, r, { allowRoot: false });
      if (at.err) { out[r] = null; continue; }
      try { const st = await fsp.stat(at.abs); out[r] = { m: st.mtimeMs, s: st.size, d: st.isDirectory() }; } catch (e) { out[r] = null; }
    }
    return { ok: true, stat: out };
  }

  async showInFolder(key, relIn) {
    const at = await this._at(key, relIn); if (at.err) return fail(at.err);
    if (this.reveal) this.reveal(at.abs);
    return { ok: true };
  }
}

module.exports = { ProjFs, cleanRel, MAX_TEXT };

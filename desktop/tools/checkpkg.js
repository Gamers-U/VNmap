'use strict';
/* Проверка собранного пакета: в app.asar должны лежать ВСЕ файлы оболочки (каждый desktop/*.js), страница и значок.
   Запускается в сборке после electron-builder: `node tools/checkpkg.js release`. Без зависимостей: читает заголовок asar сам.
   Зачем: список файлов раньше вёлся вручную, и в установщик не попали ai.js, projfs.js, sat.js: программа не запускалась. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const REL = path.resolve(process.argv[2] || path.join(ROOT, 'release'));

function findAsars(dir, out = []) {
  let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of es) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) findAsars(p, out); else if (e.name === 'app.asar') out.push(p);
  }
  return out;
}
/** Имена файлов внутри asar (с «/»). Формат: 4 байта «4», размер заголовка, ещё размер, длина строки JSON, сама строка JSON. */
function listAsar(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const h = Buffer.alloc(16); fs.readSync(fd, h, 0, 16, 0);
    const n = h.readUInt32LE(12);
    if (h.readUInt32LE(0) !== 4 || n < 2 || n > 64 * 1048576) throw new Error('это не asar');
    const b = Buffer.alloc(n); fs.readSync(fd, b, 0, n, 16);
    const out = new Set();
    (function walk(node, pre) { for (const [k, v] of Object.entries(node.files || {})) { const q = pre ? pre + '/' + k : k; if (v.files) walk(v, q); else out.add(q); } })(JSON.parse(b.toString('utf8')), '');
    return out;
  } finally { fs.closeSync(fd); }
}
function needed() {
  const need = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && fs.statSync(path.join(ROOT, f)).isFile());
  return need.concat(['package.json', 'app/index.html', 'build/icon.png']);
}
function check(rel) {
  const asars = findAsars(rel);
  if (!asars.length) return { ok: false, text: 'в ' + rel + ' нет ни одного app.asar' };
  const need = needed(), bad = [];
  for (const a of asars) {
    let have; try { have = listAsar(a); } catch (e) { bad.push(a + ': ' + e.message); continue; }
    const miss = need.filter(f => !have.has(f));
    if (miss.length) bad.push(a + ': не хватает ' + miss.join(', '));
  }
  return bad.length ? { ok: false, text: bad.join('\n') } : { ok: true, text: 'пакет полный (' + asars.length + ' app.asar, ' + need.length + ' файлов оболочки и страницы в каждом)' };
}
module.exports = { listAsar, findAsars, needed, check };
if (require.main === module) { const r = check(REL); console.log(r.ok ? 'OK: ' + r.text : 'ОШИБКА ПАКЕТА:\n' + r.text); process.exit(r.ok ? 0 : 1); }

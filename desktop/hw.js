'use strict';
/* Железо компьютера для подбора локальной модели (с 1.7.19). Живёт в оболочке: страница видит только итог (память, процессор, видеокарты).
   Что берём и откуда:
   - оперативная память и процессор: os (всегда);
   - видеокарты NVIDIA: nvidia-smi (Windows, Linux; даёт точный объём видеопамяти);
   - видеокарты AMD и другие на Windows: реестр драйвера (HardwareInformation.qwMemorySize, точнее, чем WMI, у которого потолок 4 ГБ);
   - видеокарты на Linux: /sys/class/drm (производитель и объём видеопамяти, если драйвер их отдаёт);
   - Mac на Apple Silicon: общая память с процессором (отдельной видеопамяти нет, `unified: true`).
   Всё, что не удалось определить, остаётся пустым: страница тогда честно скажет «не определила» и посоветует по памяти. Ничего не меняется
   и никуда не отправляется. Внешние программы запускаются без оболочки (execFile), с тайм-аутом. */
const os = require('os');
const fs = require('fs');
const cp = require('child_process');

const GIB = 1024 ** 3;
const MIB = 1024 ** 2;

function run(file, args, ms) {
  return new Promise(res => {
    try { cp.execFile(file, args, { timeout: ms || 4000, windowsHide: true, maxBuffer: 1 << 20 }, (e, out) => res(e ? '' : String(out || ''))); }
    catch (e) { res(''); }
  });
}

const vendorOf = s => {
  s = String(s || '');
  if (/nvidia|geforce|quadro|rtx|gtx|tesla/i.test(s) || /^0x10de$/i.test(s)) return 'nvidia';
  if (/\bamd\b|radeon|\bati\b|instinct|^0x1002$/i.test(s)) return 'amd';
  if (/intel|\barc\b|iris|uhd|^0x8086$/i.test(s)) return 'intel';
  if (/apple|\bm[1-9]\b/i.test(s)) return 'apple';
  return 'other';
};

/** Вывод `nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits`: «NVIDIA GeForce RTX 4060, 8188» (МиБ). */
function parseNvidiaSmi(txt) {
  const out = [];
  for (const line of String(txt || '').split(/\r?\n/)) {
    const m = /^\s*(.+?)\s*,\s*(\d+)\s*$/.exec(line);
    if (m && Number(m[2]) > 0) out.push({ name: m[1].slice(0, 80), vendor: 'nvidia', vram: Number(m[2]) * MIB, source: 'nvidia-smi' });
  }
  return out;
}

/** Разбор `reg query <ветка видеоадаптеров> /s /v <значение>`: ключ → значение (строка). */
function parseRegValues(txt) {
  const map = {}; let key = '';
  for (const raw of String(txt || '').split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (/^HKEY_/i.test(line)) { key = line.trim(); continue; }
    const m = /^\s+(\S+)\s+(REG_\w+)\s*(.*)$/.exec(line);
    if (m && key) map[key] = { type: m[2], data: m[3].trim() };
  }
  return map;
}
/** Число из значения реестра: REG_QWORD/REG_DWORD «0x200000000», REG_BINARY «0000000002000000» (8 байт, младший первым). */
function regNumber(v) {
  if (!v) return 0;
  const d = String(v.data || '').trim();
  if (/^REG_(QWORD|DWORD)$/.test(v.type)) { const n = /^0x([0-9a-f]+)$/i.exec(d); return n ? Number(BigInt('0x' + n[1])) : (/^\d+$/.test(d) ? Number(d) : 0); }
  if (v.type === 'REG_BINARY') {
    const hex = d.replace(/[^0-9a-f]/gi, '');
    if (hex.length < 2 || hex.length % 2 || hex.length > 16) return 0;
    let n = 0n; for (let i = hex.length - 2; i >= 0; i -= 2) n = (n << 8n) | BigInt(parseInt(hex.slice(i, i + 2), 16));
    return Number(n);
  }
  return 0;
}
/** Видеокарты из реестра Windows: описание драйвера + объём видеопамяти, склеенные по ключу. */
function parseWinGpus(descOut, memOut) {
  const desc = parseRegValues(descOut), mem = parseRegValues(memOut), out = [];
  for (const k of Object.keys(desc)) {
    const name = String(desc[k].data || '').trim();
    if (!name || /microsoft basic|remote|virtual|displaylink|parsec/i.test(name)) continue;
    const vram = regNumber(mem[k]);
    out.push({ name: name.slice(0, 80), vendor: vendorOf(name), vram: vram > 0 ? vram : null, source: 'registry' });
  }
  return out;
}

/** Linux: /sys/class/drm/cardN/device (vendor, mem_info_vram_total). */
function linuxGpus(fsx) {
  const out = [];
  let cards = [];
  try { cards = fsx.readdirSync('/sys/class/drm').filter(n => /^card\d+$/.test(n)); } catch (e) { return out; }
  const rd = p => { try { return String(fsx.readFileSync(p, 'utf8')).trim(); } catch (e) { return ''; } };
  for (const c of cards) {
    const base = '/sys/class/drm/' + c + '/device/';
    const vid = rd(base + 'vendor'), vram = Number(rd(base + 'mem_info_vram_total')) || 0, v = vendorOf(vid);
    if (!vid) continue;
    out.push({ name: ({ nvidia: 'NVIDIA GPU', amd: 'AMD GPU', intel: 'Intel GPU' })[v] || 'GPU', vendor: v, vram: vram > 0 ? vram : null, source: 'sysfs' });
  }
  return out;
}

/** Определить железо. o: подмена для тестов (os, fs, run, platform, arch). */
async function detect(o) {
  o = o || {};
  const osx = o.os || os, fsx = o.fs || fs, runx = o.run || run, platform = o.platform || process.platform, arch = o.arch || process.arch;
  const cpus = (() => { try { return osx.cpus() || []; } catch (e) { return []; } })();
  const info = {
    platform, arch,
    cpu: { model: String((cpus[0] && cpus[0].model) || '').replace(/\s+/g, ' ').trim().slice(0, 80), cores: cpus.length },
    ram: { total: osx.totalmem(), free: osx.freemem() },
    gpus: [], unified: false,
  };
  if (platform === 'darwin' && arch === 'arm64') {
    info.unified = true;
    info.gpus.push({ name: info.cpu.model || 'Apple Silicon', vendor: 'apple', vram: null, source: 'unified' });
    return info;
  }
  let gpus = [];
  if (platform === 'win32' || platform === 'linux') gpus = parseNvidiaSmi(await runx('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits']));
  if (platform === 'win32') {
    const cls = 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
    const [d, m] = await Promise.all([runx('reg', ['query', cls, '/s', '/v', 'DriverDesc']), runx('reg', ['query', cls, '/s', '/v', 'HardwareInformation.qwMemorySize'])]);
    const reg = parseWinGpus(d, m).filter(g => !(gpus.length && g.vendor === 'nvidia'));
    gpus = gpus.concat(reg);
  } else if (platform === 'linux') {
    const sys = linuxGpus(fsx).filter(g => !(gpus.length && g.vendor === 'nvidia'));
    gpus = gpus.concat(sys);
  }
  info.gpus = gpus.slice(0, 6);
  return info;
}

module.exports = { detect, parseNvidiaSmi, parseRegValues, regNumber, parseWinGpus, linuxGpus, vendorOf, GIB };

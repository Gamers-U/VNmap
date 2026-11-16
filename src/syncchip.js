'use strict';
/* ====== Один значок синхронизации ======
   Раньше внизу стояли две плашки с текстом: «GitHub: синхронизировано» и «Диск: …». Теперь это один значок
   без текста: галочка в облаке — всё синхронизировано, крутящиеся стрелки — идёт обмен, облако — есть
   неотправленные правки, треугольник — нужно внимание. Подробности — в подсказке и во вкладке
   «Настройки → Подключения», куда ведёт щелчок. При расхождении версий щелчок сразу открывает выбор. */
Object.assign(D, {
  'sy.t.ok': ['Всё синхронизировано', 'Everything is synced'],
  'sy.t.syncing': ['Идёт синхронизация…', 'Syncing…'],
  'sy.t.pending': ['Есть неотправленные правки', 'There are unsent changes'],
  'sy.t.warn': ['Нужно внимание', 'Needs attention'],
  'sy.t.conflict': ['Нужно выбрать версию', 'Choose a version'],
  'sy.t.none': ['Синхронизация не подключена', 'Sync is not connected'],
  'sy.none.h': ['Подключите GitHub или Google Диск: тогда этот значок покажет, что всё сохранено и совпадает.', 'Connect GitHub or Google Drive and this icon will show that everything is saved and matches.'],
  'sy.sum.h': ['Состояние', 'Status'],
  'sy.last': ['{0} · {1}', '{0} · {1}'],
});

const SY_WARN = ['offline', 'auth', 'error', 'conflict', 'newer', 'nosign', 'nocfg'];
const SY_GH = { nosign: 'gh.chip.nosign', syncing: 'gh.chip.syncing', ok: 'gh.chip.ok', pending: 'gh.chip.pending', offline: 'gh.chip.offline', auth: 'gh.chip.auth', error: 'gh.chip.error', conflict: 'gh.chip.conflict', newer: 'gh.chip.newer' };
const SY_DR = { nocfg: 'drive.chip.nocfg', nosign: 'drive.chip.nosign', off: 'drive.chip.off', syncing: 'drive.chip.syncing', ok: 'drive.chip.ok', pending: 'drive.chip.pending', offline: 'drive.chip.offline', auth: 'drive.chip.auth', error: 'drive.chip.error', conflict: 'drive.chip.conflict', newer: 'drive.chip.newer' };

/** Службы, которые включены для этого проекта: у каждой состояние и готовая строка для подсказки. */
function syParts() {
  const out = [];
  const gm = typeof gmeta === 'function' ? gmeta() : null;
  if (gm && gm.on) {
    const s = ghState();
    out.push({ id: 'gh', st: s, ic: 'fork', line: t(SY_GH[s] || 'gh.chip.ok') + (s === 'ok' && gm.last ? ' · ' + ago(gm.last) : '') + (s === 'syncing' && GHS.progress ? ' ' + GHS.progress : '') + (['offline', 'error', 'auth'].includes(s) && GHS.err ? ' — ' + GHS.err : '') });
  }
  const dm = typeof GD !== 'undefined' && GD && typeof dmeta === 'function' ? dmeta() : null;
  if (dm && dm.on) {
    const s = driveState();
    out.push({ id: 'drive', st: s, ic: 'cloud', line: t(SY_DR[s] || 'drive.chip.ok') + (s === 'ok' && dm.last ? ' · ' + ago(dm.last) : '') + (s === 'syncing' && GS.progress ? ' ' + GS.progress : '') + (['offline', 'error', 'auth'].includes(s) && GS.err ? ' — ' + GS.err : '') });
  }
  return out;
}
/** Общее состояние: самое тревожное из всех служб. */
function syOverall(parts) {
  if (!parts.length) return { st: 'none', ic: 'cloud' };
  const has = f => parts.some(p => f(p.st));
  if (has(s => s === 'conflict')) return { st: 'conflict', ic: 'alert', warn: true };
  if (has(s => SY_WARN.includes(s))) return { st: 'warn', ic: 'alert', warn: true };
  if (has(s => s === 'syncing')) return { st: 'syncing', ic: 'refresh' };
  if (has(s => s === 'pending')) return { st: 'pending', ic: 'cloud' };
  return { st: 'ok', ic: 'cloudok' };
}
/** Щелчок: при расхождении версий сразу выбор, иначе вкладка «Подключения». */
function syClick() {
  const c = syParts().find(p => p.st === 'conflict');
  if (c) { if (c.id === 'gh') ghConflictDialog(); else driveConflictDialog(); return; }
  openSettingsWindow('conn');
}
function syncChip() {
  const parts = syParts(), o = syOverall(parts);
  if (o.st === 'none' && !(typeof GD !== 'undefined' && GD)) return null;       // в браузере без подключённого GitHub значка нет
  const title = t('sy.t.' + o.st), tip = [title, ...(parts.length ? parts.map(p => p.line) : [t('sy.none.h')])].join('\n');
  const attrs = { class: 'btn stat sync-chip ' + o.st + (o.warn ? ' warn' : ''), 'data-tip': tip, 'data-state': o.st, 'aria-label': tip.replace(/\n/g, '. '), onclick: syClick };
  for (const p of parts) attrs['data-' + p.id] = p.st;
  return h('button', attrs, icon(o.ic, 16));
}

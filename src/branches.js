'use strict';
/* ====== Ветки: документы из цепочек блоков ======
   Рассказ в редакторе пишется не по главам, а по ветке: одна ветка — один документ. Ветка — это цепочка блоков карты, идущих друг за другом
   по стрелкам. Основная ветка начинается со стартового блока и на каждой развилке идёт по главной стрелке (e.main; если ни одна не помечена,
   по первой). Остальные стрелки с развилки начинают свои ветки, и у каждой ветки свой документ. Если ветка упирается в блок, уже входящий в другую
   ветку, она вливается в него (br.joins). Данных, кроме флага e.main на стрелке, эта раскладка не добавляет: она каждый раз выводится из карты. */

Object.assign(D, {
  'br.main': ['Основная ветка', 'Main branch'],
  'br.of': ['Ветка «{0}»', 'Branch “{0}”'],
  'br.joins': ['вливается в «{0}»', 'joins “{0}”'],
  'br.from': ['от «{0}»', 'from “{0}”'],
  'br.untitled': ['Без названия', 'Untitled'],
});

/** Раскладка проекта по веткам. [{ id, title, nodes:[блоки по порядку], edge (стрелка, с которой ветка началась), parent:{id,nodeId}, joins:блок или null, isMain }] */
function brBranches() {
  const nodes = P.nodes.filter(n => n.type !== 'note');
  const byId = new Map(nodes.map(n => [n.id, n]));
  const outs = n => P.edges.filter(e => e.from === n.id && e.to !== n.id && byId.has(e.to));
  const mainOf = n => { const o = outs(n); return o.find(e => e.main) || o[0] || null; };
  const assigned = new Set(), branches = [];
  const build = (first, viaEdge, parent) => {
    if (!first || assigned.has(first.id)) return;
    const br = { id: first.id, nodes: [], edge: viaEdge || null, parent: parent || null, joins: null, isMain: false, title: '' };
    branches.push(br);
    const side = [];
    let n = first;
    while (n) {
      assigned.add(n.id); br.nodes.push(n);
      const o = outs(n), m = mainOf(n);
      for (const e of o) if (e !== m) side.push({ e, from: n });
      if (!m) break;
      const nx = byId.get(m.to);
      if (assigned.has(nx.id)) { br.joins = nx; break; }
      n = nx;
    }
    for (const sd of side) build(byId.get(sd.e.to), sd.e, { id: br.id, nodeId: sd.from.id });
  };
  const hasIn = new Set(P.edges.filter(e => byId.has(e.from) && byId.has(e.to) && e.from !== e.to).map(e => e.to));
  let start = P.startId && byId.get(P.startId) ? byId.get(P.startId) : null;
  const order = (() => { try { return rsNodes(); } catch (x) { return nodes; } })();
  if (!start) start = order.find(n => !hasIn.has(n.id)) || order[0] || null;
  if (start) { build(start, null, null); if (branches[0]) branches[0].isMain = true; }
  for (const n of order) if (!assigned.has(n.id) && !hasIn.has(n.id)) build(n, null, null);   // блоки, до которых не дойти от старта
  for (const n of order) if (!assigned.has(n.id)) build(n, null, null);                      // остатки цикла
  for (const br of branches) br.title = br.isMain ? t('br.main') : (br.edge && br.edge.title) || br.nodes[0].title || t('br.untitled');
  return branches;
}
/** Ветка, в которую входит блок. */
const brOfNode = (nodeId, list) => (list || brBranches()).find(b => b.nodes.some(n => n.id === nodeId)) || null;
/** Разделы документа ветки: каждый файл каждого блока по порядку → [{ n, f }]. */
const brSections = br => br.nodes.flatMap(n => n.files.map(f => ({ n, f })));
/** Сделать эту стрелку главной на её развилке (остальные стрелки из того же блока перестают быть главными). */
function brSetMain(edge) {
  P.edges.forEach(e => { if (e.from === edge.from) e.main = e === edge; });
}
/** Основная стрелка блока (для показа: «продолжение здесь»). */
function brMainEdge(n) {
  const o = P.edges.filter(e => e.from === n.id && e.to !== n.id && nodeById(e.to) && nodeById(e.to).type !== 'note');
  return o.find(e => e.main) || o[0] || null;
}

/* ---------- сценарий Ren'Py → текст рукописи ---------- */
/** Обратное преобразование к prBuild: реплики персонажей становятся «Имя: текст», слова рассказчика — обычными строками,
    комментарии # — заголовками сцен ##, всё остальное (в том числе всё, что с отступом: меню, условия) — командами «@ …». */
function prFromScript(n, f, scriptText) {
  const src = String(scriptText != null ? scriptText : f.script || '').replace(/\r/g, '');
  const byTag = new Map(P.characters.filter(c => c.tag).map(c => [c.tag, c]));
  const unesc = s => s.replace(/\\(["\\])/g, '$1').replace(/\\n/g, ' ').replace(/\{\{/g, '{').replace(/\[\[/g, '[')
    .replace(/\{b\}([\s\S]*?)\{\/b\}/g, '**$1**').replace(/\{i\}([\s\S]*?)\{\/i\}/g, '*$1*');
  const out = [];
  const push = l => { if (l === '' && (!out.length || out[out.length - 1] === '')) return; out.push(l); };
  for (const raw of src.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { push(''); continue; }
    let m;
    if ((m = line.match(/^\s*#\s*(.*)$/)) && m[1].trim() && !/^#/.test(m[1])) { push('## ' + m[1].trim()); continue; }   // комментарий # → заголовок сцены ## (при сборке он снова станет комментарием)
    if (!/^\s/.test(line) && (m = line.match(/^(?:([A-Za-z_]\w*)\s+)?"((?:[^"\\]|\\.)*)"\s*$/))) {
      const tag = m[1], text = unesc(m[2]);
      if (!/^\s*(@|\/\/|#|%)/.test(text) && text.trim()) {
        if (!tag) { push(text); continue; }
        const c = byTag.get(tag);
        if (c) { push((c.name || c.tag) + ': ' + text); continue; }
      }
    }
    push('@ ' + line);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}
/** Сколько реплик в сценарии главы (для подсказки «подхватить»). */
function prScriptLines(f) {
  let k = 0;
  for (const raw of String(f.script || '').split('\n')) { if (!/^\s/.test(raw) && /^(?:[A-Za-z_]\w*\s+)?"/.test(raw)) k++; }
  return k;
}

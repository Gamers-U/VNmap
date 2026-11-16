'use strict';
/* ====== «Кто что сделал»: сводка по людям в совместном проекте ======
   Берёт то, что программа уже запоминает: кто создал блок (n.by), кто последним правил главу и когда (f.ed, f.edt),
   кто оставил замечание (имя и время), кто поставил задачу (q.by, q.at). Истории правок по минутам нет: по главе известен
   только последний правивший, поэтому «правок» здесь это «глав, которые человек правил последним». Честно подписано в окне. */

Object.assign(D, {
  'wd.menu': ['Кто что сделал', 'Who did what'],
  'wd.need': ['Сводка нужна в совместном проекте: добавьте в «Участники» хотя бы двоих.', 'The summary is for shared projects: add at least two people in Members.'],
  'wd.h': ['Кто что сделал', 'Who did what'],
  'wd.p7': ['7 дней', '7 days'], 'wd.p30': ['30 дней', '30 days'], 'wd.pall': ['Всё время', 'All time'],
  'wd.s.act': ['Были активны', 'Active people'], 'wd.s.edits': ['Глав правили', 'Chapters edited'], 'wd.s.cmts': ['Замечаний', 'Comments'], 'wd.s.made': ['Новых блоков', 'New blocks'],
  'wd.col.who': ['Кто', 'Who'], 'wd.col.made': ['Создано блоков', 'Blocks made'], 'wd.col.edits': ['Правок глав', 'Chapters edited'], 'wd.col.words': ['Слов в них', 'Words in them'], 'wd.col.cmts': ['Замечаний', 'Comments'], 'wd.col.last': ['Последнее', 'Last seen'],
  'wd.feed': ['Последние события', 'Recent activity'], 'wd.feed.none': ['За этот период ничего не записано.', 'Nothing recorded for this period.'],
  'wd.ev.edit': ['правка главы «{0}» в блоке «{1}»', 'edited chapter “{0}” in “{1}”'], 'wd.ev.cmt': ['замечание в блоке «{0}»', 'left a comment in “{0}”'], 'wd.ev.task': ['новая задача «{0}»', 'created the task “{0}”'], 'wd.made': ['блок создан', 'block created'],
  'wd.nobody': ['Не подписано', 'Unsigned'],
  'wd.nobody.h': ['Правки без подписи (до того, как включили «Кто я в этом проекте»): {0}', 'Edits without a signature (made before “Who am I in this project” was set): {0}'],
  'wd.copy': ['Копировать отчёт', 'Copy report'], 'wd.copied': ['Отчёт скопирован', 'Report copied'], 'wd.copy.fail': ['Не удалось скопировать', 'Could not copy'],
  'wd.hint': ['Программа помнит у главы только того, кто правил её последним, и время этой правки. Поэтому «правки» считаются по главам, а не по каждому изменению. Число блоков не зависит от периода: время создания блока не хранится.', 'For a chapter the app only remembers who edited it last and when. So “edited” counts chapters, not every change. The block count does not depend on the period: the creation time of a block is not stored.'],
  'wd.rep.h': ['Кто что сделал: {0}', 'Who did what: {0}'], 'wd.rep.per': ['Период: {0}', 'Period: {0}'],
  'wd.rep.line': ['{0}: создано блоков {1}, правок глав {2} ({3} слов), замечаний {4}', '{0}: blocks made {1}, chapters edited {2} ({3} words), comments {4}'],
  'wd.open': ['Открыть блок', 'Open block'], 'wd.none.me': ['Подписи пока нет: выберите себя в «Кто я в этом проекте», и ваши правки будут записываться.', 'No signature yet: pick yourself in “Who am I in this project” so your edits get recorded.'],
});
const whOn = () => !!(typeof P !== 'undefined' && P && P.members && P.members.length >= 2);
const WH_DAY = 864e5;
const whSince = per => per === '7' ? Date.now() - 7 * WH_DAY : per === '30' ? Date.now() - 30 * WH_DAY : 0;
const whBlock = n => (n && (n.title || '').trim()) || t('tk.untitled');
/** Собрать сводку за период (since — время в мс, 0 это всё время). */
function whCollect(since) {
  const byName = new Map(P.members.map(m => [String(m.name || '').trim().toLowerCase(), m.id]));
  const rows = new Map(P.members.map(m => [m.id, { m, made: [], edits: [], words: 0, cmts: 0, tasks: 0, last: 0 }]));
  const feed = []; let unsigned = 0;
  const touch = (r, ts) => { if (ts > r.last) r.last = ts; };
  for (const n of P.nodes) {
    const r = n.by && rows.get(n.by); if (r) r.made.push(n);
    for (const f of n.files || []) {
      if (!f.edt || f.edt < since) continue;
      const e = rows.get(f.ed);
      if (!e) { unsigned++; continue; }
      e.edits.push({ n, f, t: f.edt }); e.words += fileWords(f); touch(e, f.edt);
      feed.push({ kind: 'edit', m: e.m, t: f.edt, n, f });
    }
  }
  for (const c of P.cmts || []) {
    if (!c.t || c.t < since) continue;
    const id = rows.has(c.by) ? c.by : byName.get(String(c.by || '').trim().toLowerCase()); const r = id && rows.get(id);
    if (!r) continue;
    r.cmts++; touch(r, c.t); feed.push({ kind: 'cmt', m: r.m, t: c.t, n: nodeById(c.nid) });
  }
  for (const q of P.tasks || []) {
    if (!q.at || q.at < since) continue;
    const r = rows.get(q.by); if (!r) continue;
    r.tasks++; touch(r, q.at); feed.push({ kind: 'task', m: r.m, t: q.at, q });
  }
  feed.sort((a, b) => b.t - a.t);
  const list = [...rows.values()].map(r => Object.assign(r, { score: r.edits.length * 3 + r.cmts + r.made.length + r.tasks })).sort((a, b) => (b.score - a.score) || (b.last - a.last));
  return { rows: list, feed, unsigned, edits: list.reduce((s, r) => s + r.edits.length, 0), cmts: list.reduce((s, r) => s + r.cmts, 0), made: list.reduce((s, r) => s + r.made.length, 0), active: list.filter(r => r.edits.length || r.cmts || r.tasks || (since === 0 && r.made.length)).length };
}
const whWhen = ts => { try { return new Date(ts).toLocaleString(S.lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
function whEvText(ev) {
  if (ev.kind === 'edit') return t('wd.ev.edit', (ev.f.title || t('file.untitled')), whBlock(ev.n));
  if (ev.kind === 'cmt') return t('wd.ev.cmt', whBlock(ev.n));
  return t('wd.ev.task', ev.q.title || t('tk.untitled'));
}
/** Отчёт текстом (для письма или чата). */
function whReport(d, per) {
  const lab = t(per === '7' ? 'wd.p7' : per === '30' ? 'wd.p30' : 'wd.pall');
  const out = ['# ' + t('wd.rep.h', P.name || ''), t('wd.rep.per', lab), ''];
  for (const r of d.rows) if (r.edits.length || r.cmts || r.made.length || r.tasks) out.push('- ' + t('wd.rep.line', r.m.name, r.made.length, r.edits.length, fmtNum(r.words), r.cmts));
  out.push('');
  for (const ev of d.feed.slice(0, 30)) out.push('- ' + whWhen(ev.t) + ' · ' + ev.m.name + ': ' + whEvText(ev));
  return out.join('\n');
}
function openWhoDid(per) {
  if (!whOn()) { toast(t('wd.need'), 5200); return; }
  const st = { per: per || '7', open: new Set() };
  openModal({
    cls: 'wd-modal',
    build: m => {
      st.m = m; st.body = h('div', { class: 'wd-body' });
      const render = () => {
        const d = whCollect(whSince(st.per)), me = meMember();
        const stat = (lab, n) => h('div', { class: 'tk-stat' }, h('b', String(n)), h('span', lab));
        const seg = segmented([{ value: '7', label: t('wd.p7') }, { value: '30', label: t('wd.p30') }, { value: 'all', label: t('wd.pall') }], st.per, v => { st.per = v; render(); });
        const copy = h('button', { class: 'btn sm', onclick: async () => { toast(t((await copyText(whReport(d, st.per))) ? 'wd.copied' : 'wd.copy.fail'), 2600); } }, icon('copy', 14), t('wd.copy'));
        const tbl = h('div', { class: 'wd-tbl' }, h('div', { class: 'wd-tr hd' }, ['who', 'made', 'edits', 'words', 'cmts', 'last'].map(k => h('span', t('wd.col.' + k)))));
        const shown = d.rows.filter(r => r.edits.length || r.cmts || r.tasks || r.made.length);
        for (const r of shown) {
          const isOpen = st.open.has(r.m.id), has = r.edits.length || r.made.length;
          tbl.append(h('div', { class: 'wd-tr row' + (has ? ' clk' : ''), onclick: () => { if (!has) return; if (isOpen) st.open.delete(r.m.id); else st.open.add(r.m.id); render(); } },
            h('span', { class: 'tk-who' }, memberAv(r.m, 18), r.m.name), h('span', String(r.made.length)), h('span', String(r.edits.length)), h('span', fmtNum(r.words)), h('span', String(r.cmts)), h('span', { class: 'wd-last' }, r.last ? whWhen(r.last) : '—')));
          if (isOpen) {
            const box = h('div', { class: 'wd-sub' });
            for (const e of r.edits.sort((a, b) => b.t - a.t)) box.append(h('button', { class: 'wd-it', onclick: () => { st.m.close(); focusNode(e.n.id, { open: true }); } }, icon('open', 12), h('span', { class: 'grow' }, whBlock(e.n) + ' · ' + (e.f.title || t('file.untitled'))), h('span', { class: 'wd-when' }, whWhen(e.t))));
            for (const n of r.made) box.append(h('button', { class: 'wd-it', onclick: () => { st.m.close(); focusNode(n.id, { open: true }); } }, icon('layers', 12), h('span', { class: 'grow' }, whBlock(n)), h('span', { class: 'wd-when' }, t('wd.made'))));
            tbl.append(box);
          }
        }
        const feed = h('div', { class: 'wd-feed' });
        for (const ev of d.feed.slice(0, 40)) feed.append(h('div', { class: 'wd-ev' }, memberAv(ev.m, 18), h('span', { class: 'grow' }, h('b', ev.m.name), ': ' + whEvText(ev)), h('span', { class: 'wd-when' }, whWhen(ev.t))));
        st.body.replaceChildren(
          h('div', { class: 'tk-tools' }, seg, h('div', { class: 'grow' }), copy),
          h('div', { class: 'tk-stats' }, stat(t('wd.s.act'), d.active), stat(t('wd.s.edits'), d.edits), stat(t('wd.s.cmts'), d.cmts), stat(t('wd.s.made'), d.made)),
          me ? null : h('div', { class: 'hint warn' }, t('wd.none.me')),
          shown.length ? tbl : null,
          d.unsigned ? h('div', { class: 'hint' }, t('wd.nobody.h', d.unsigned)) : null,
          h('div', { class: 'tk-bh' }, t('wd.feed'), h('span', { class: 'tk-n' }, String(d.feed.length))),
          d.feed.length ? feed : h('div', { class: 'hint' }, t('wd.feed.none')),
          h('div', { class: 'hint' }, t('wd.hint')));
      };
      st.render = render; render();
      return h('div', { class: 'm-wrap' }, modalHead(t('wd.h'), m), st.body);
    },
  });
}
TOOL_ITEMS.push({ id: 'whodid', group: 'team', ic: 'users', key: 'wd.menu', kw: 'who did what activity team summary report contributions history кто что сделал активность команда сводка отчёт вклад правки', run: () => openWhoDid() });

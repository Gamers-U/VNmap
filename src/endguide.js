'use strict';
/* ====== Гайд по концовкам (1.6.7) ======
   Для каждой концовки: какие варианты выбрать по пути и какие значения переменных получатся в итоге. Программа проходит игру тем же
   движком, что «Автопрогон» (с условиями, переменными и выбором), берёт самый короткий путь к каждой концовке и записывает его словами.
   Готовый текст копируется или скачивается файлом Markdown: его можно отдать тестерам, выложить игрокам или оставить себе как шпаргалку.
   Концовки, до которых дойти не удалось (условия не дают), перечислены отдельно: это почти всегда ошибка в условиях. */

Object.assign(D, {
  'eg.btn': ['Гайд по концовкам…', 'Endings guide…'],
  'eg.title': ['Гайд по концовкам', 'Endings guide'],
  'eg.intro': ['Для каждой концовки программа находит самый короткий путь и записывает его словами: какие варианты выбрать и какие значения переменных получатся. Готовый текст можно отдать тестерам, выложить игрокам или оставить себе как шпаргалку.', 'For every ending the app finds the shortest route and writes it down: which options to pick and which variable values you end up with. The text can go to testers, to players, or stay as your own cheat sheet.'],
  'eg.o.vars': ['Показывать значения переменных', 'Show variable values'], 'eg.o.time': ['Показывать время прохождения', 'Show the playing time'],
  'eg.go': ['Составить гайд', 'Build the guide'], 'eg.again': ['Составить заново', 'Build again'], 'eg.stop': ['Остановить', 'Stop'],
  'eg.busy': ['Ищу пути: {0}', 'Searching routes: {0}'],
  'eg.stale': ['Проект изменился после расчёта. Нажмите «Составить заново».', 'The project changed after the calculation. Press “Build again”.'],
  'eg.none': ['Ни одной концовки найти не удалось: в проекте нет блоков-концовок или до них нельзя дойти.', 'No ending was found: the project has no ending blocks or they cannot be reached.'],
  'eg.trunc': ['Поиск остановлен на пределе: часть концовок могла не найтись. Увеличьте «Предел поиска» в «Автопрогоне».', 'The search stopped at the limit: some endings may be missing. Raise the “Search limit” in Auto-run.'],
  'eg.copy': ['Копировать текст', 'Copy the text'], 'eg.copied': ['Гайд скопирован', 'Guide copied'], 'eg.copyfail': ['Не удалось скопировать. Скачайте файл.', 'Could not copy. Download the file.'],
  'eg.dl': ['Скачать .md', 'Download .md'],
  'eg.show': ['Показать блок', 'Show the block'],
  'eg.sum': ['Концовок найдено: {0}', 'Endings found: {0}'],
  'eg.lost': ['Дойти не удалось', 'Could not be reached'],
  'eg.lost.t': ['Эти концовки есть в проекте, но ни один набор выборов к ним не приводит. Проверьте условия на стрелках и в скриптах.', 'These endings exist in the project, but no set of choices leads to them. Check the conditions on the arrows and in the scripts.'],
  'eg.direct': ['Без выборов: игра сама приводит сюда.', 'No choices: the game leads here by itself.'],
  'eg.step': ['В блоке «{0}»: «{1}»', 'In “{0}”: “{1}”'], 'eg.step.nb': ['Выбрать «{0}»', 'Pick “{0}”'],
  'eg.vars': ['Значения в конце', 'Values at the end'], 'eg.time': ['Около {0}', 'About {0}'],
  'eg.in': ['Блок: «{0}»', 'Block: “{0}”'],
  /* markdown */
  'eg.md.title': ['Гайд по концовкам: {0}', 'Endings guide: {0}'],
  'eg.md.lead': ['Концовок: {0}. Для каждой показан самый короткий путь; есть и другие. Выборы перечислены по порядку.', 'Endings: {0}. Each shows the shortest route; there may be others. The choices are in order.'],
  'eg.md.in': ['Блок', 'Block'], 'eg.md.how': ['Как получить', 'How to get it'], 'eg.md.vars': ['Значения в конце', 'Values at the end'], 'eg.md.time': ['Время', 'Time'],
  'eg.md.lost': ['Концовки, до которых дойти не удалось', 'Endings that could not be reached'],
  'eg.md.gen': ['Составлено в «Карте новеллы» {0}.', 'Made in Story Map on {0}.'],
});

TOOL_ITEMS.push({ id: 'endguide', group: 'play', ic: 'signpost', key: 'eg.btn', kw: 'endings guide walkthrough route how to get ending choices values markdown spoilers guide wiki концовки гайд прохождение как получить концовку путь выборы значения шпаргалка вики', run: () => openEndGuide() });

let EG_LAST = null;                           // { ver, res }
const egBlockTitle = (res, r) => { const b = r.block ? res.blocks.find(x => x.id === r.block) : null; return b ? b.title : ''; };
const egName = (res, r) => r.title || egBlockTitle(res, r) || r.id;
const egVal = v => (typeof v === 'boolean' ? (v ? 'True' : 'False') : typeof v === 'string' ? '«' + v + '»' : String(v));
/** Что изменилось к концу пути: [{name, value}] по алфавиту. */
function egChanged(res, r) {
  const base = res.baseVars || {}, out = [];
  for (const k of Object.keys(r.vars || {}).sort()) if (r.vars[k] !== base[k]) out.push({ name: k, value: r.vars[k] });
  return out;
}
/** Строки пути: [{ where, via }]. */
function egSteps(res, r) { return (res.steps(r) || []).map(s => ({ where: res.labelTitle ? res.labelTitle(s.label) : '', via: s.via == null ? '' : String(s.via) })).filter(s => s.via !== ''); }
/** Концовки, до которых дойти не удалось: названия. */
function egLost(res) {
  const foundBlock = new Set(res.endRows.map(r => r.block).filter(Boolean)), foundKey = new Set(res.endRows.map(r => r.key).filter(Boolean));
  const out = [];
  for (const b of res.blocks) { const nd = nodeById(b.id); if (nd && nd.type === 'ending' && b.t == null && !foundBlock.has(b.id)) out.push({ title: b.title, id: b.id }); }
  for (const e of res.endingsList || []) if (!foundKey.has(e.key) && !out.some(o => o.title === (e.title || e.key))) out.push({ title: e.title || e.key, id: null });
  return out;
}
/** Текст гайда в Markdown. */
function egMarkdown(res, o) {
  o = Object.assign({ vars: true, time: false }, o);
  const L = ['# ' + t('eg.md.title', P.name || ''), '', t('eg.md.lead', res.endRows.length)];
  res.endRows.forEach((r, i) => {
    L.push('', '## ' + (i + 1) + '. ' + egName(res, r));
    const bt = egBlockTitle(res, r);
    if (bt && bt !== egName(res, r)) L.push('', '**' + t('eg.md.in') + ':** ' + bt);
    const steps = egSteps(res, r);
    L.push('', '**' + t('eg.md.how') + ':**', '');
    if (!steps.length) L.push(t('eg.direct'));
    else steps.forEach((s, k) => L.push((k + 1) + '. ' + (s.where ? t('eg.step', s.where, s.via) : t('eg.step.nb', s.via))));
    if (o.vars) { const ch = egChanged(res, r); if (ch.length) { L.push('', '**' + t('eg.md.vars') + ':**', ''); ch.forEach(c => L.push('- `' + c.name + '` = ' + egVal(c.value))); } }
    if (o.time) L.push('', '**' + t('eg.md.time') + ':** ' + t('eg.time', arClock(r.t)));
  });
  const lost = egLost(res);
  if (lost.length) { L.push('', '## ' + t('eg.md.lost'), ''); lost.forEach(x => L.push('- ' + x.title)); }
  L.push('', '---', '', t('eg.md.gen', new Date().toISOString().slice(0, 10)), '');
  return L.join('\n');
}

function openEndGuide() {
  closePopover();
  const st = { vars: true, time: false, running: false, cancel: false };
  openModal({
    cls: 'bs-m eg-m', onClose: () => { st.cancel = true; },
    build: m => {
      const top = h('div', { class: 'eg-top' }), body = h('div', { class: 'eg-body scroll' }), status = h('div', { class: 'ar-status', id: 'eg-status' });
      const chk = (key, label, id) => { const c = h('input', { type: 'checkbox', id, checked: st[key] }); c.addEventListener('change', () => { st[key] = c.checked; if (EG_LAST) paintRes(); }); return h('label', { class: 'ar-chk' }, c, h('span', label)); };
      const goBtn = h('button', { class: 'btn primary', id: 'eg-go', onclick: () => go() }, icon('flag', 15), t('eg.go'));
      top.append(h('div', { class: 'bs-sph' }, t('eg.intro')), h('div', { class: 'eg-opts' }, chk('vars', t('eg.o.vars'), 'eg-o-vars'), chk('time', t('eg.o.time'), 'eg-o-time')), h('div', { class: 'row-actions left' }, goBtn, status));
      const paintRes = () => {
        const res = EG_LAST && EG_LAST.res; if (!res) { body.replaceChildren(); return; }
        const kids = [];
        if (EG_LAST.ver !== DATA_VER) kids.push(h('div', { class: 'bs-hint warn', id: 'eg-stale' }, icon('alert', 15), t('eg.stale')));
        if (res.truncated) kids.push(h('div', { class: 'bs-hint warn' }, icon('alert', 15), t('eg.trunc')));
        if (!res.endRows.length) { kids.push(h('div', { class: 'empty' }, t('eg.none'))); }
        else {
          kids.push(h('div', { class: 'eg-bar' }, h('b', t('eg.sum', res.endRows.length)), h('div', { class: 'grow' }),
            h('button', { class: 'btn sm', id: 'eg-copy', onclick: async () => toast((await copyText(egMarkdown(res, st))) ? t('eg.copied') : t('eg.copyfail')) }, icon('copy', 14), t('eg.copy')),
            h('button', { class: 'btn sm', id: 'eg-dl', onclick: () => saveFile((String(P.name || 'game').replace(/[^\wА-Яа-яЁё\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'game') + '-endings.md', egMarkdown(res, st), 'text/markdown') }, icon('download', 14), t('eg.dl'))));
          res.endRows.forEach((r, i) => {
            const steps = egSteps(res, r), ch = st.vars ? egChanged(res, r) : [], bt = egBlockTitle(res, r);
            kids.push(h('div', { class: 'eg-card', 'data-i': i },
              h('div', { class: 'eg-h' }, h('b', (i + 1) + '. ' + egName(res, r)), r.block ? h('button', { class: 'btn sm', 'data-tip': t('eg.show'), onclick: () => { m.close(); focusNode(r.block); } }, icon('target', 14)) : null),
              bt && bt !== egName(res, r) ? h('div', { class: 'hint' }, t('eg.in', bt)) : null,
              steps.length ? h('ol', { class: 'eg-steps' }, ...steps.map(s => h('li', s.where ? t('eg.step', s.where, s.via) : t('eg.step.nb', s.via)))) : h('div', { class: 'hint' }, t('eg.direct')),
              ch.length ? h('div', { class: 'eg-vars' }, h('span', { class: 'hint' }, t('eg.vars') + ': '), ...ch.map(c => h('code', { class: 'eg-var' }, c.name + ' = ' + egVal(c.value)))) : null,
              st.time ? h('div', { class: 'hint' }, t('eg.time', arClock(r.t))) : null));
          });
        }
        const lost = egLost(res);
        if (lost.length) kids.push(h('div', { class: 'eg-lost', id: 'eg-lost' }, h('div', { class: 'eg-lh' }, icon('alert', 14), t('eg.lost')), h('div', { class: 'hint' }, t('eg.lost.t')),
          ...lost.map(x => h('div', { class: 'eg-li' }, h('b', x.title), x.id ? h('button', { class: 'btn sm', 'data-tip': t('eg.show'), onclick: () => { m.close(); focusNode(x.id); } }, icon('target', 14)) : null))));
        body.replaceChildren(...kids);
      };
      const go = async () => {
        if (st.running) { st.cancel = true; return; }
        st.running = true; st.cancel = false;
        goBtn.replaceChildren(icon('stop', 15), t('eg.stop'));
        try {
          const cfg = Object.assign({}, arCfg(), { voice: false });
          const res = await arCompute(cfg, { status: s => { status.textContent = t('eg.busy', s); }, cancelled: () => st.cancel || m.closed });
          if (!m.closed) { EG_LAST = { ver: DATA_VER, res }; status.textContent = ''; paintRes(); }
        } catch (e) { status.textContent = String((e && e.message) || e); }
        st.running = false; if (!m.closed) goBtn.replaceChildren(icon('flag', 15), t(EG_LAST ? 'eg.again' : 'eg.go'));
      };
      if (EG_LAST) { goBtn.replaceChildren(icon('flag', 15), t('eg.again')); paintRes(); }
      return h('div', { class: 'm-wrap' }, modalHead(t('eg.title'), m), top, body);
    }
  });
}

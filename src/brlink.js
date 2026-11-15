'use strict';
/* ====== Куда ведёт ветка: новый блок, существующий блок, слияние ======
   Ромб на развилке: М3 → М3А и М3Б → М4. В модели он уже есть (ветка, упёршаяся в занятый блок, «вливается» в него), а здесь — то, чем его
   собирают из редактора текста, не уходя на карту:
   · brLinkDlg — один диалог для «добавить ветку» и «влить в блок»: новый блок или уже существующий, название блока и текст на стрелке отдельно;
   · brNameSuggest — подсказка имени соседней ветки (М3 → М3А, М3Б, …);
   · brAddNewBlock / brAddLink — сами правки модели (без интерфейса, чтобы их можно было проверять). */

Object.assign(D, {
  'brl.add.t': ['Добавить ветку', 'Add a branch'],
  'brl.add.intro': ['Из блока «{0}» выйдет новая стрелка. Она может вести в новый блок или в такой, что уже есть на карте.', 'A new arrow will leave block “{0}”. It can lead to a new block or to one that is already on the map.'],
  'brl.mode.new': ['Новый блок', 'New block'], 'brl.mode.ex': ['Существующий блок', 'Existing block'],
  'brl.name': ['Название нового блока', 'New block name'],
  'brl.name.hint': ['Так блок называется на карте и в заголовке документа, например «М3А».', 'This is how the block is named on the map and in the document heading, e.g. “M3A”.'],
  'brl.arrow': ['Текст на стрелке', 'Arrow text'],
  'brl.arrow.hint': ['Это то, что увидит игрок в выборе. Не обязательно совпадает с названием блока: блок «М3А» может выходить по стрелке «Пойти налево».', 'This is what the player sees in the choice. It need not match the block name: block “M3A” can be reached by an arrow “Go left”.'],
  'brl.arrow.hint.join': ['Необязательно. Обычно слияние идёт без подписи.', 'Optional. A merge usually has no label.'],
  'brl.arrow.ph': ['если пусто — «{0}»', 'if empty: “{0}”'], 'brl.arrow.ph0': ['без подписи', 'no label'],
  'brl.q': ['Найти блок', 'Find a block'], 'brl.none': ['Нет подходящих блоков', 'No matching blocks'],
  'brl.pick': ['Выберите блок', 'Pick a block'],
  'brl.sub.start': ['старт', 'start'],
  'brl.ok.new': ['Создать ветку', 'Create branch'], 'brl.ok.ex': ['Соединить', 'Connect'],
  'brl.join.t': ['Влить ветку в блок', 'Join the branch into a block'],
  'brl.join.intro': ['Конец ветки «{0}» будет вести в выбранный блок. Так две ветки сходятся в одно: например М3А и М3Б → М4.', 'The end of branch “{0}” will lead into the chosen block. This is how two branches meet: e.g. M3A and M3B → M4.'],
  'brl.edit.t': ['Куда вливается ветка', 'Where the branch joins'],
  'brl.edit.ok': ['Сохранить', 'Save'],
  'brl.end.none': ['Ветка заканчивается блоком «{0}», дальше ничего нет.', 'The branch ends with block “{0}”; nothing follows it.'],
  'brl.end.join': ['Ветка вливается в блок «{0}»', 'The branch joins block “{0}”'],
  'brl.end.via': ['по стрелке «{0}»', 'by the arrow “{0}”'],
  'brl.end.joinbtn': ['Влить в блок…', 'Join a block…'], 'brl.end.newbtn': ['Новый блок дальше…', 'New block next…'],
  'brl.end.change': ['Изменить…', 'Change…'], 'brl.end.unlink': ['Отвязать', 'Detach'],
  'brl.joined': ['Ветка вливается в «{0}»', 'The branch now joins “{0}”'],
  'brl.linked': ['Стрелка к блоку «{0}» добавлена', 'Arrow to block “{0}” added'],
  'brl.unlinked': ['Ветка больше не вливается в «{0}»', 'The branch no longer joins “{0}”'],
  'brl.ren': ['Название стрелки', 'Arrow name'],
  'brl.ren.l': ['Текст на стрелке к «{0}». Можно оставить пустым.', 'Text on the arrow to “{0}”. May be left empty.'],
  'brl.ren.done': ['Название стрелки изменено', 'Arrow name changed'],
});

const BR_LETTERS = 'АБВГДЕЖЗИКЛМНОП';

/** Подсказка имени новой ветки из блока n: «М3» → «М3А», потом «М3Б»; «М3А» тоже считается за «М3». */
function brNameSuggest(n) {
  let base = String((n && n.title) || '').trim();
  const m = base.match(/^(.*\d)[A-Za-zА-Яа-яЁё]$/) || base.match(/^(.*\S) [A-ZА-ЯЁ]$/);
  if (m) base = m[1];
  if (!base) return '';
  const sep = /\d$/.test(base) ? '' : ' ';
  const used = new Set(P.nodes.map(x => String(x.title || '').trim().toLowerCase()));
  for (const ch of BR_LETTERS) if (!used.has((base + sep + ch).toLowerCase())) return base + sep + ch;
  return '';
}

/** Блоки, куда можно провести стрелку, по порядку чтения: [{ n, sub }]. exclude — множество id, которые не предлагаем. */
function brCandidates(exclude) {
  let order; try { order = rsNodes(); } catch (e) { order = P.nodes; }
  const list = brBranches();
  return order.filter(n => n.type !== 'note' && !(exclude && exclude.has(n.id))).map(n => {
    const b = brOfNode(n.id, list);
    return { n, sub: n.id === P.startId ? t('brl.sub.start') : b && !b.isMain ? b.title : '' };
  });
}

/** Новый блок как продолжение from (со стрелкой). Возвращает { node, edge }. */
function brAddNewBlock(from, name, arrow) {
  const outs = P.edges.filter(e => e.from === from.id).length;
  const z = nodeSize(from), sp = freeSpot(from.x + z.w + 160, from.y + (outs ? 80 : 0), NODE_W, 160);
  const nn = addNode('chapter', sp.x, sp.y); seedFirstFile(nn, from); nn.title = name;
  const e = addEdge(from.id, nn.id); if (e && arrow) e.title = arrow;
  return { node: nn, edge: e };
}
/** Стрелка from → to. Повторную стрелку и стрелку в себя не делаем (вернёт null). */
function brAddLink(from, to, arrow) {
  if (!from || !to || from.id === to.id) return null;
  if (P.edges.some(e => e.from === from.id && e.to === to.id)) return null;
  const e = addEdge(from.id, to.id); if (e && arrow) e.title = arrow;
  return e;
}
/** Перенацелить стрелку на другой блок (заодно сбросить ручные изломы). */
function brRetarget(edge, to, arrow) {
  edge.to = to.id; edge.toSide = 'auto'; edge.pts = []; edge.lo = null;
  if (arrow != null) edge.title = arrow;
}

/** Диалог. o: { title, intro, modes:['new','exist'], mode, name, arrow, exclude:Set, pre:id блока, fallback:true (пустая подпись → название блока), ok:{ new, exist }, hint, noArrow:true (только выбор блока, без текста на стрелке) }
    Возвращает { mode:'new', name, arrow } | { mode:'exist', node, arrow } | null. */
function brLinkDlg(o) {
  return new Promise(res => {
    openModal({
      cls: 'dlg brl-dlg', onClose: () => res(null),
      build: m => {
        const modes = o.modes && o.modes.length ? o.modes : ['new', 'exist'];
        let mode = o.mode && modes.includes(o.mode) ? o.mode : modes[0], pick = o.pre || '', q = '';
        const name = h('input', { class: 'inp', id: 'brl-name', type: 'text', value: o.name || '', spellcheck: 'false' });
        const arrow = h('input', { class: 'inp', id: 'brl-arrow', type: 'text', value: o.arrow || '' });
        const qi = h('input', { class: 'inp', id: 'brl-q', type: 'text', placeholder: t('brl.q') });
        const listEl = h('div', { class: 'brl-list scroll', id: 'brl-list' });
        const okb = h('button', { class: 'btn primary', id: 'brl-ok' });
        const cands = brCandidates(o.exclude || new Set());
        const byId = new Map(cands.map(c => [c.n.id, c.n]));
        if (pick && !byId.has(pick)) pick = '';
        const newBox = h('div', { class: 'brl-new' }, field(t('brl.name'), name, t('brl.name.hint')));
        const exBox = h('div', { class: 'brl-ex' }, qi, listEl);
        const arrowHint = o.fallback ? t('brl.arrow.hint') : t('brl.arrow.hint.join');
        const arrowField = field(t('brl.arrow'), arrow, arrowHint);
        const target = () => mode === 'new' ? name.value.trim() : (byId.get(pick) ? byId.get(pick).title : '');
        const paintList = () => {
          const ql = q.trim().toLowerCase();
          const rows = cands.filter(c => !ql || String(c.n.title || '').toLowerCase().includes(ql) || c.sub.toLowerCase().includes(ql));
          listEl.replaceChildren(...rows.map(c => h('div', { class: 'brl-row' + (c.n.id === pick ? ' on' : ''), 'data-id': c.n.id, onclick: () => { pick = c.n.id; paintList(); sync(); } },
            h('span', { class: 'dot big', style: { background: palColor(c.n.color) } }), h('span', { class: 'brl-t' }, c.n.title || t('br.untitled')), c.sub ? h('span', { class: 'brl-sub' }, c.sub) : null)));
          if (!rows.length) listEl.append(h('div', { class: 'empty small' }, t('brl.none')));
        };
        function sync() {
          newBox.hidden = mode !== 'new'; exBox.hidden = mode !== 'exist';
          okb.textContent = (o.ok && o.ok[mode]) || t(mode === 'new' ? 'brl.ok.new' : 'brl.ok.ex');
          okb.disabled = mode === 'new' ? !name.value.trim() : !pick;
          arrow.placeholder = o.fallback && target() ? t('brl.arrow.ph', target()) : t('brl.arrow.ph0');
        }
        const go = () => {
          if (okb.disabled) return;
          const a = arrow.value.trim() || (o.fallback ? target() : '');
          if (mode === 'new') res({ mode, name: name.value.trim(), arrow: a }); else res({ mode, node: byId.get(pick), arrow: a });
          m.close();
        };
        name.addEventListener('input', sync);
        for (const i of [name, arrow]) i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        qi.addEventListener('input', () => { q = qi.value; paintList(); });
        okb.addEventListener('click', go);
        const seg = modes.length > 1 ? segmented(modes.map(v => ({ value: v, label: t(v === 'new' ? 'brl.mode.new' : 'brl.mode.ex') })), mode, v => {
          mode = v; sync();
          setTimeout(() => { if (mode === 'new') { name.focus(); name.select(); } else { qi.focus(); const on = listEl.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' }); } }, 20);
        }, 'brl-seg') : null;
        paintList(); sync();
        setTimeout(() => { if (mode === 'new') { name.focus(); name.select(); } else { qi.focus(); const on = listEl.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' }); } }, 30);
        return h('div', { class: 'dlg-body' }, h('h3', o.title), o.intro ? h('p', { class: 'brl-intro' }, o.intro) : null, seg, newBox, exBox, o.noArrow ? null : arrowField,
          h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), okb));
      }
    });
  });
}

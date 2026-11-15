'use strict';
/* ====== «Подтянуть главу из документа» ======
   Пустая глава (файл) в блоке не обязана получать текст копированием руками: кнопка ищет по названию такую же главу среди всех глав
   проекта, у которых есть текст (это и есть оглавление: импортированный документ, редактор текста, другие ветки), и берёт её текст.
   Нашлась одна — берём сразу. Нашлось несколько (глава 50 в основной ветке и в развилке) или ни одной — спрашиваем, из какого файла.
   Дальше, если сценарий пуст, он собирается сразу. */

Object.assign(D, {
  'pull.btn': ['Подтянуть главу из документа', 'Pull the chapter from the document'],
  'pull.btn.tip': ['Найти главу с таким же названием среди глав проекта и взять её текст', 'Find a chapter with the same name among the chapters of the project and take its text'],
  'pull.again': ['Подтянуть другую главу', 'Pull another chapter'],
  'pull.none': ['Ни в одной другой главе проекта пока нет текста. Загрузите документ кнопкой «Импорт» или напишите текст в редакторе.', 'No other chapter of the project has text yet. Load a document with “Import” or write the text in the editor.'],
  'pull.q': ['Из какой главы взять текст для «{0}»?', 'Which chapter should the text for “{0}” come from?'],
  'pull.q.d': ['Названия совпали у нескольких глав или не совпали ни у одной. Выберите нужную: у каждой указаны блок и ветка.', 'Several chapters have this name, or none does. Choose the right one: each shows its block and branch.'],
  'pull.exact': ['Совпадает по названию', 'Same name'], 'pull.like': ['Похоже по названию', 'Similar name'], 'pull.all': ['Все главы с текстом', 'All chapters with text'],
  'pull.main': ['основная ветка', 'main branch'],
  'pull.search': ['Найти главу…', 'Find a chapter…'],
  'pull.move': ['Убрать текст из той главы (перенести, а не копировать)', 'Remove the text from that chapter (move instead of copy)'],
  'pull.rep.q': ['Заменить текст этой главы?', 'Replace the text of this chapter?'],
  'pull.rep.d': ['В этой главе уже есть текст ({0} слов). Он будет заменён подтянутым. Это можно отменить.', 'This chapter already has text ({0} words). It will be replaced by the pulled one. You can undo it.'],
  'pull.rep': ['Заменить', 'Replace'],
  'pull.done': ['Текст подтянут из «{0}» ({1} слов)', 'Text pulled from “{0}” ({1} words)'],
  'pull.done.s': ['Текст подтянут из «{0}», сценарий собран: {1} строк', 'Text pulled from “{0}”, the script is built: {1} lines'],
  'pull.done.has': ['Текст подтянут из «{0}». В сценарии уже есть строки, их не трогали: кнопка «Применить к сценарию» заменит или допишет.', 'Text pulled from “{0}”. The script already has lines and was left alone: “Apply to script” replaces or appends.'],
  'pull.dlg.has': ['В тексте этой главы {0} слов: подставлен в поле ниже и разобран.', 'This chapter’s text has {0} words: put into the box below and parsed.'],
  'pull.dlg.load': ['Подтянуть текст главы', 'Pull the chapter text'],
  'pull.dlg.none': ['В тексте этой главы пусто. Подтяните её из документа.', 'The text of this chapter is empty. Pull it from the document.'],
  'pull.node.d': ['Текст главы можно не печатать и не копировать: подтяните его из документа по названию главы, а потом применить к сценарию.', 'You do not have to type or copy the chapter text: pull it from the document by the chapter name, then apply it to the script.'],
});

/** Название для сравнения: без регистра, ё = е, без знаков и пробелов («Глава 1.» = «глава1»). */
const pullKey = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
/** Название по умолчанию («Новый блок», «Новая глава 3») ничего не говорит: по нему главу не ищут и не считают её названием. key — результат pullKey. */
const pullIsGenKey = x => {
  const generic = new Set(['node.new.chapter', 'node.new.fork', 'node.new.ending', 'file.new'].flatMap(k => D[k] || []).map(pullKey).filter(Boolean));
  return !x || generic.has(x) || [...generic].some(g => g && x.startsWith(g) && /^\d+$/.test(x.slice(g.length)));
};
/** x начинается с y и это не «глава2» внутри «глава21». */
const pullPrefix = (x, y) => x.length > y.length && x.startsWith(y) && !(/\d$/.test(y) && /^\d/.test(x.slice(y.length)));
/** Текст рукописи в простой вид для разбора диалогов: без заметок, команд и заголовков, **жирный** → {b}. */
function prPlain(text) {
  return String(text || '').replace(/\r/g, '').split('\n')
    .filter(l => !/^\s*(\/\/|@|%\s|#{1,6}\s)/.test(l))
    .map(l => prStripHl(prMd(l))).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Названия главы для сравнения: имя файла и (если в блоке один файл) имя блока. Названия по умолчанию («Новая глава», «Новый файл 2») не считаются:
    иначе любые две свежие главы «совпали бы по названию» и подтянулся бы чужой текст. */
function pullTitles(n, f) {
  return [f.title, n.files.length === 1 ? n.title : ''].map(pullKey).filter(x => !pullIsGenKey(x));
}

/** Главы проекта с текстом, кроме самой f, с оценкой совпадения названия: 3 — то же, 2 — одно начинается с другого, 1 — одно содержит другое, 0 — не похоже. */
function pullSources(n, f) {
  const mine = pullTitles(n, f);
  let list = []; try { list = brBranches(); } catch (e) { /* без веток: просто не пишем, где глава */ }
  const my = list.find(b => b.nodes.some(x => x.id === n.id));
  const out = [];
  P.nodes.forEach((n2, i) => {
    if (n2.type === 'note') return;
    n2.files.forEach(f2 => {
      if (f2 === f || !deNorm(f2.text)) return;
      const titles = pullTitles(n2, f2);
      let score = 0;
      if (titles.some(x => mine.includes(x))) score = 3;
      else if (titles.some(x => mine.some(y => pullPrefix(x, y) || pullPrefix(y, x)))) score = 2;
      else if (titles.some(x => mine.some(y => x.length >= 5 && y.length >= 5 && (x.includes(y) || y.includes(x))))) score = 1;
      const br = list.find(b => b.nodes.some(x => x.id === n2.id)) || null;
      out.push({ n: n2, f: f2, score, br, ord: i, words: prWords(f2.text), title: deTitleOf(n2, f2), preview: prPlain(f2.text).split('\n')[0].slice(0, 110), same: !!(my && br && my.id === br.id) });
    });
  });
  out.sort((a, b) => b.score - a.score || (b.same - a.same) || ((b.br && b.br.isMain ? 1 : 0) - (a.br && a.br.isMain ? 1 : 0)) || a.ord - b.ord);
  return out;
}

/** Окно выбора главы-источника. Возвращает { src, move } или null. */
function pullPick(n, f, srcs) {
  return new Promise(res => {
    let done = false; const finish = v => { if (!done) { done = true; res(v); } };
    openModal({
      cls: 'dlg pull-dlg', onClose: () => finish(null),
      build: m => {
        let move = false;
        const q = h('input', { class: 'inp', id: 'pull-q', placeholder: t('pull.search') });
        const list = h('div', { class: 'pull-list scroll' });
        const item = s => h('div', { class: 'pull-i' + (s.score >= 3 ? ' exact' : ''), 'data-f': s.f.id, onclick: () => { finish({ src: s, move }); m.close(); } },
          h('span', { class: 'dot big', style: { background: palColor(s.n.color) } }),
          h('div', { class: 'pull-t' },
            h('div', { class: 'pull-n' }, s.title, s.score >= 3 ? h('span', { class: 'pull-b ok' }, t('pull.exact')) : s.score > 0 ? h('span', { class: 'pull-b' }, t('pull.like')) : null),
            h('div', { class: 'pull-s' }, [t('de.where', s.n.title), s.br ? (s.br.isMain ? t('pull.main') : s.br.title) : null, t('de.words.n', fmtNum(s.words))].filter(Boolean).join(' · ')),
            s.preview ? h('div', { class: 'pull-p' }, s.preview) : null));
        const paint = () => {
          const qq = q.value.trim().toLowerCase();
          const vis = srcs.filter(s => !qq || (s.title + ' ' + s.n.title + ' ' + (s.br ? s.br.title : '') + ' ' + s.preview).toLowerCase().includes(qq));
          const groups = [[t('pull.exact'), vis.filter(s => s.score >= 3)], [t('pull.like'), vis.filter(s => s.score > 0 && s.score < 3)], [t('pull.all'), vis.filter(s => !s.score)]];
          list.replaceChildren(...groups.filter(g => g[1].length).flatMap(([lab, arr]) => [h('div', { class: 'pull-g' }, lab + ' · ' + arr.length), ...arr.slice(0, 60).map(item)]));
          if (!list.children.length) list.append(h('div', { class: 'empty small' }, t('search.none')));
        };
        q.addEventListener('input', paint); paint();
        return h('div', { class: 'dlg-body' }, h('h3', t('pull.q', deTitleOf(n, f))), h('p', t('pull.q.d')), q, list,
          h('div', { class: 'pull-mv' }, switchEl(false, v => { move = v; }, t('pull.move'))),
          h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel'))));
      }
    });
  });
}

/** Подтянуть текст главы f (блок n) из другой главы проекта.
 *  o.script === false — сценарий не собирать (вкладка «Диалоги» покажет разбор сама); o.done(info) — что сделать после; o.ask — всегда спрашивать.
 *  Возвращает true, если текст подтянут. */
async function pullChapter(n, f, o = {}) {
  const srcs = pullSources(n, f);
  if (!srcs.length) { toast(t('pull.none'), 5200); return false; }
  const exact = srcs.filter(s => s.score >= 3);
  const pick = exact.length === 1 && !o.ask ? { src: exact[0], move: false } : await pullPick(n, f, srcs);
  if (!pick) return false;
  if (deNorm(f.text) && !(await confirmDlg({ title: t('pull.rep.q'), text: t('pull.rep.d', fmtNum(prWords(f.text))), ok: t('pull.rep'), danger: true }))) return false;
  const s = pick.src;
  f.text = s.f.text;
  if (!f.src && s.f.src) f.src = Object.assign({}, s.f.src);
  if (pick.move) { s.f.text = ''; s.f.textLive = false; s.f.textOut = ''; }
  prSync(n, f);
  let lines = 0, kept = false;
  if (o.script !== false) { if (!f.script.trim()) lines = prApply(n, f, 'replace'); else kept = !f.textLive; }
  commit(true);
  const w = fmtNum(prWords(f.text));
  toastUndo(lines ? t('pull.done.s', s.title, lines) : kept ? t('pull.done.has', s.title) : t('pull.done', s.title, w));
  if (o.done) o.done({ lines, src: s });
  return true;
}

/** Применить текст главы к сценарию: replace — заменить, append — дописать. Возвращает число строк. */
async function pullApply(n, f, mode) {
  if (!deNorm(f.text)) { toast(t('te.apply.empty')); return 0; }
  if (mode === 'replace' && !f.textLive && f.script.trim() && !prScriptIsOurs(f)) {
    const ok = await confirmDlg({ title: t('te.apply.rep.q'), text: t('te.apply.rep.d'), ok: t('te.apply.rep'), danger: true });
    if (!ok) return 0;
  }
  const k = prApply(n, f, mode);
  if (!k) { toast(t('te.apply.empty')); return 0; }
  commit(true); toastUndo(t('te.applied', k));
  return k;
}

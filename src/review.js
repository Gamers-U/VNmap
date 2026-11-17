'use strict';
/* ====== Ветки авторов и проверка правок (GitHub) ======
   Автор работает в своей ветке репозитория (author/<логин GitHub>): синхронизация идёт как обычно, но в эту ветку, а не в основную.
   Владелец открывает «Проверка правок»: программа находит общую основу (версию файла, от которой автор отошёл), сравнивает основу с версией автора
   по тем же «сущностям», что и слияние (блок, глава, стрелка, персонаж…) и показывает изменения по блокам. По каждому изменению владелец выбирает:
     · Принять — изменение попадает в основной проект одним шагом «Отменить» (слияние по полям, если то же место правили и вы);
     · Вернуть с замечанием — в ветку автора добавляется заметка на его блок (владелец писал замечание), правка остаётся у автора до исправления;
     · Отклонить — правка скрывается из списка, пока автор не изменит её снова.
   Модуль ничего не пишет в основную ветку сам: принятое попадает в локальный проект и уходит в репозиторий обычной синхронизацией. */

Object.assign(D, {
  'rv.menu': ['Проверка правок авторов…', 'Review the authors’ changes…'],
  'rv.untitled': ['без названия', 'untitled'],
  /* панель GitHub */
  'rv.p.h': ['Авторы и проверка правок', 'Authors and review'],
  'rv.p.t': ['Если над новеллой работают несколько человек, каждый автор может вести правки в своей ветке (author/логин). Владелец проверяет их и принимает по одной, а основная версия остаётся целой.',
    'When several people work on the novel, each author can keep their changes in their own branch (author/login). The owner reviews them and accepts one by one, so the main version stays intact.'],
  'rv.p.review': ['Проверить правки авторов…', 'Review the authors’ changes…'],
  'rv.p.start': ['Работать в своей ветке (я автор)', 'Work in my own branch (I am an author)'],
  'rv.p.start.q': ['Перейти в свою ветку?', 'Switch to your own branch?'],
  'rv.p.start.t': ['Ветка {0} создаётся из основной ({1}). Дальше все ваши правки будут уходить в неё, а не в основную версию. Владелец проверит их и примет или вернёт с замечанием.',
    'Branch {0} is created from the main one ({1}). From now on all your changes go into it, not into the main version. The owner reviews them and accepts or returns them with a comment.'],
  'rv.p.start.ok': ['Перейти', 'Switch'],
  'rv.p.on': ['Вы работаете в своей ветке', 'You work in your own branch'],
  'rv.p.on.t': ['Ветка {0}, основная: {1}. Ваши правки попадут в основную версию только после проверки владельцем.', 'Branch {0}, main: {1}. Your changes reach the main version only after the owner’s review.'],
  'rv.p.pull': ['Забрать правки из основной ветки', 'Pull changes from the main branch'],
  'rv.p.pull.h': ['Подтягивает то, что владелец принял или поправил сам. Ваши правки остаются.', 'Brings in what the owner accepted or changed. Your changes stay.'],
  'rv.p.notes': ['Замечаний от владельца: {0}', 'Comments from the owner: {0}'],
  'rv.p.notes.open': ['Показать все заметки…', 'Show all notes…'],
  'rv.p.open': ['Открыть ветку на GitHub', 'Open the branch on GitHub'],
  'rv.join.author': ['Я автор: мои правки пойдут в отдельную ветку на проверку', 'I am an author: my changes go to a separate branch for review'],
  'rv.started': ['Готово: вы работаете в ветке {0}', 'Done: you now work in branch {0}'],
  'rv.pulled': ['Из основной ветки подтянуто изменений: {0}', 'Changes pulled from the main branch: {0}'],
  'rv.pulled.none': ['В основной ветке новых изменений нет.', 'No new changes in the main branch.'],
  'rv.pulled.cf': ['Полей, где остались ваши значения: {0}', 'Fields where your values were kept: {0}'],
  'rv.returned.toast': ['Владелец вернул вам правки на доработку: замечаний {0}. Они в заметках на блоках.', 'The owner returned your changes: {0} comments. They are in the notes on the blocks.'],
  'rv.err.manual': ['Программа не смогла создать ветку сама (нужна свежая версия программы или нет прав на запись). Создайте её на GitHub: репозиторий → «Branches» → «New branch», имя {0}, источник {1}. Потом нажмите кнопку ещё раз.',
    'The app could not create the branch (it needs the latest version or write access). Create it on GitHub: repository → “Branches” → “New branch”, name {0}, source {1}. Then press the button again.'],
  'rv.err.nomain': ['Основная ветка не найдена в репозитории.', 'The main branch was not found in the repository.'],
  'rv.err.mine': ['Вы сами работаете в ветке автора. Проверять правки нужно из основной ветки (у владельца).', 'You work in an author branch yourself. Changes are reviewed from the main branch (by the owner).'],
  'rv.need.t': ['Проверка правок работает через GitHub', 'Reviewing changes works through GitHub'],
  'rv.need.p': ['Каждый автор пишет в своей ветке репозитория, а владелец проекта проверяет и принимает их правки здесь. Для этого проект должен быть подключён к GitHub. Сейчас он не подключён. Открыть панель GitHub, чтобы подключить?', 'Each author writes in their own branch of the repository, and the project owner reviews and accepts their changes here. For that the project has to be linked to GitHub, and it is not linked now. Open the GitHub panel to link it?'],
  'rv.need.btn': ['Открыть панель GitHub', 'Open the GitHub panel'],
  'rv.err.gh': ['Сначала подключите проект к GitHub (панель «GitHub»).', 'First connect the project to GitHub (the “GitHub” panel).'],
  'rv.err.base': ['Не нашлась версия, от которой отошёл автор.', 'The version the author started from was not found.'],
  /* список веток */
  'rv.l.title': ['Правки авторов', 'Authors’ changes'],
  'rv.l.lead': ['Каждый автор ведёт правки в своей ветке. Выберите автора, чтобы увидеть, что он изменил по сравнению с основной версией, и принять правки по одной.', 'Each author keeps changes in their own branch. Pick an author to see what they changed compared with the main version and accept the changes one by one.'],
  'rv.l.none': ['Веток авторов пока нет. Автор создаёт свою ветку кнопкой «Работать в своей ветке» в панели «GitHub».', 'There are no author branches yet. An author creates theirs with “Work in my own branch” in the “GitHub” panel.'],
  'rv.l.last': ['последняя правка {0}', 'last change {0}'],
  'rv.l.check': ['Проверить', 'Review'],
  /* окно проверки */
  'rv.t': ['Проверка правок · {0}', 'Review · {0}'],
  'rv.sub': ['Ветка {0}. Сравниваем с версией, от которой автор начал работу.', 'Branch {0}. Compared with the version the author started from.'],
  'rv.approx': ['Точную основу найти не удалось (в ветке очень много записей), сравнение приблизительное.', 'The exact starting version was not found (the branch has very many commits), the comparison is approximate.'],
  'rv.sum': ['На проверке: {0}', 'To review: {0}'],
  'rv.sum.done': ['уже в основной версии: {0}', 'already in the main version: {0}'],
  'rv.sum.dis': ['отклонено: {0}', 'rejected: {0}'],
  'rv.show.dis': ['Показать отклонённые ({0})', 'Show rejected ({0})'],
  'rv.hide.dis': ['Скрыть отклонённые', 'Hide rejected'],
  'rv.again': ['Рассмотреть снова', 'Review again'],
  'rv.none': ['Новых правок нет: всё, что сделал автор, уже принято или отклонено.', 'No new changes: everything the author did is already accepted or rejected.'],
  'rv.all': ['Принять всё от автора ({0})', 'Accept everything from the author ({0})'],
  'rv.clear': ['Снять выбор', 'Clear choices'],
  'rv.act.accept': ['Принять', 'Accept'], 'rv.act.return': ['Вернуть', 'Return'], 'rv.act.reject': ['Отклонить', 'Reject'],
  'rv.tip.accept': ['Принять в основную версию', 'Accept into the main version'],
  'rv.tip.return': ['Вернуть автору с замечанием', 'Return to the author with a comment'],
  'rv.tip.reject': ['Отклонить без замечания', 'Reject without a comment'],
  'rv.grp.all': ['Принять всё в блоке', 'Accept all in this block'],
  'rv.comment': ['Замечание автору', 'Comment for the author'],
  'rv.comment.ph': ['Что исправить или почему не принято…', 'What to fix or why it was not accepted…'],
  'rv.go': ['Применить решения', 'Apply decisions'],
  'rv.go.n': ['Принять: {0} · Вернуть: {1} · Отклонить: {2}', 'Accept: {0} · Return: {1} · Reject: {2}'],
  'rv.go.none': ['Выберите по каждому изменению: принять, вернуть или отклонить. Неотмеченное остаётся на потом.', 'Choose for each change: accept, return or reject. Anything unmarked stays for later.'],
  'rv.needc': ['Напишите замечание автору для «{0}» или выберите «Отклонить».', 'Write a comment for the author for “{0}” or choose “Reject”.'],
  'rv.applied': ['Принято изменений: {0}', 'Changes accepted: {0}'],
  'rv.sent': ['Замечаний отправлено автору: {0}', 'Comments sent to the author: {0}'],
  'rv.rej': ['Отклонено: {0}', 'Rejected: {0}'],
  'rv.skipped': ['Не принято, потому что вы уже меняли то же место: {0}', 'Not accepted because you changed the same place: {0}'],
  'rv.deps': ['Заодно добавлено связанное: {0}', 'Related items added as well: {0}'],
  'rv.cflt': ['В {0} местах тексты правили оба: в главе оставлены оба варианта с пометками «⚠».', 'Both edited the text in {0} places: both versions are kept in the chapter with “⚠” marks.'],
  'rv.conf': ['вы тоже меняли это место: правки сольются', 'you changed this place too: the changes will be merged'],
  'rv.undo': ['Принятое можно отменить кнопкой «Отменить».', 'Accepted changes can be undone with “Undo”.'],
  'rv.done.all': ['Всё разобрано.', 'All sorted out.'],
  /* что изменилось */
  'rv.type.new': ['новое', 'new'], 'rv.type.edit': ['изменено', 'changed'], 'rv.type.del': ['удалено', 'deleted'],
  'rv.n.node': ['блок', 'block'], 'rv.n.file': ['глава', 'chapter'], 'rv.n.edge': ['стрелка', 'arrow'], 'rv.n.char': ['персонаж', 'character'],
  'rv.n.asset': ['ресурс', 'asset'], 'rv.n.var': ['переменная', 'variable'], 'rv.n.member': ['участник', 'member'], 'rv.n.ach': ['достижение', 'achievement'], 'rv.n.task': ['задача', 'task'], 'rv.g.tasks': ['Задачи', 'Tasks'],
  'rv.n.note': ['заметка', 'note'], 'rv.n.lang': ['язык', 'language'], 'rv.n.tr': ['перевод', 'translation'], 'rv.n.meta': ['настройки проекта', 'project settings'],
  'rv.n.layout': ['расположение блоков на карте', 'block layout on the map'],
  'rv.g.chars': ['Персонажи', 'Characters'], 'rv.g.assets': ['Ресурсы', 'Assets'], 'rv.g.vars': ['Переменные', 'Variables'], 'rv.g.members': ['Участники', 'Members'],
  'rv.g.achs': ['Достижения', 'Achievements'], 'rv.g.tl': ['Переводы', 'Translations'], 'rv.g.meta': ['Проект в целом', 'The project as a whole'], 'rv.g.layout': ['Карта', 'The map'],
  'rv.sub.files': ['глав: {0}, строк: {1}', 'chapters: {0}, lines: {1}'],
  'rv.sub.fields': ['изменено: {0}', 'changed: {0}'],
  'rv.sub.lines': ['строк: +{0} −{1}', 'lines: +{0} −{1}'],
  'rv.sub.n': ['блоков: {0}', 'blocks: {0}'],
  'rv.d.show': ['Показать, что изменилось', 'Show what changed'],
  'rv.d.at': ['строка {0}', 'line {0}'], 'rv.d.more': ['…ещё строк: {0}', '…more lines: {0}'], 'rv.d.hunks': ['…и ещё изменений: {0}', '…and more changes: {0}'],
  'rv.note.head': ['К правке: {0}', 'About the change: {0}'],
  'rv.commit': ['Замечания владельца · {0}', 'Owner’s comments · {0}'],
  'rv.note.tag': ['замечание', 'review comment'],
  'rv.f.title': ['название', 'title'], 'rv.f.desc': ['описание', 'description'], 'rv.f.color': ['цвет', 'colour'], 'rv.f.type': ['тип', 'type'],
  'rv.f.x': ['положение', 'position'], 'rv.f.y': ['положение', 'position'], 'rv.f.script': ['текст', 'text'], 'rv.f.label': ['метка', 'label'],
  'rv.f.filename': ['имя файла', 'file name'], 'rv.f.status': ['статус', 'status'], 'rv.f.summary': ['краткое содержание', 'summary'], 'rv.f.cast': ['персонажи сцены', 'scene cast'],
  'rv.f.location': ['место', 'location'], 'rv.f.notes': ['заметки', 'notes'], 'rv.f.visual': ['визуал', 'visuals'], 'rv.f.assets': ['ресурсы', 'assets'],
  'rv.f.unlock': ['условие открытия', 'unlock condition'], 'rv.f.prompt': ['подсказка', 'prompt'], 'rv.f.done': ['готово', 'done'], 'rv.f.defaultCast': ['персонажи по умолчанию', 'default cast'],
  'rv.f.cond': ['условие', 'condition'], 'rv.f.code': ['код', 'code'], 'rv.f.sets': ['эффекты', 'effects'], 'rv.f.from': ['откуда', 'from'], 'rv.f.to': ['куда', 'to'],
  'rv.f.dashed': ['вид', 'look'], 'rv.f.main': ['главная линия', 'main line'], 'rv.f.pts': ['изгиб', 'bend'], 'rv.f.lo': ['изгиб', 'bend'],
  'rv.f.nodeId': ['перенесена в другой блок', 'moved to another block'], 'rv.f.name': ['имя', 'name'], 'rv.f.value': ['значение', 'value'],
  'rv.f.text': ['текст', 'text'], 'rv.f.build': ['сборка', 'build'], 'rv.f.startId': ['стартовый блок', 'start block'], 'rv.f.filesUrl': ['ссылка на файлы', 'files link'],
});

const RV_PREFIX = 'author/';
const rvSlug = s => String(s || '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const rvBranchOf = login => RV_PREFIX + (rvSlug(login) || 'me');
const rvIsAuthor = m => !!(m && m.on && m.author && m.main && m.branch);
function rvWho(login) {
  const id = 'gh:' + String(login || '').toLowerCase();
  const mem = (P.members || []).find(x => (x.ids || []).includes(id));
  return mem && mem.name ? mem.name : '@' + login;
}
const rvFieldName = k => (D['rv.f.' + k] ? t('rv.f.' + k) : k);

/* ---------- ветки в репозитории ---------- */
/** Ветка → { name, exists, sha }. Пустое имя = основная ветка репозитория (по умолчанию). */
async function rvRef(m, name) {
  if (!name) { const info = await ghRepoCheck(m.repo); name = info.branch; if (!name) throw ghFail('not_found', t('rv.err.nomain')); }
  const r = await ghReq('GET', '/repos/' + m.repo + '/git/ref/heads/' + ghEnc(name));
  if (r.status === 404) return { name, exists: false, sha: '' };
  if (r.status !== 200) throw ghStatusErr(r);
  const j = ghParse(r.text) || {};
  return { name, exists: true, sha: (j.object && j.object.sha) || '' };
}
async function rvCreateBranch(m, name, sha) {
  let r;
  try { r = await ghReq('POST', '/repos/' + m.repo + '/git/refs', { body: { ref: 'refs/heads/' + name, sha } }); }
  catch (e) { if (ghErrInfo(e).code === 'bad_request') throw ghFail('nobranch', t('rv.err.manual', name, m.branch || m.main || '')); throw e; }
  if (r.status === 200 || r.status === 201) return true;
  if (r.status === 422 && /already exists/i.test(r.text)) return true;
  if (r.status === 403 || r.status === 404 || r.status === 422) throw ghFail('nobranch', t('rv.err.manual', name, m.branch || m.main || ''));
  throw ghStatusErr(r);
}
async function rvBranches(m) {
  const r = await ghReq('GET', '/repos/' + m.repo + '/branches?per_page=100');
  if (r.status !== 200) throw ghStatusErr(r);
  return (ghParse(r.text) || []).filter(b => b && typeof b.name === 'string' && b.name.startsWith(RV_PREFIX) && b.name.length > RV_PREFIX.length)
    .map(b => ({ name: b.name, login: b.name.slice(RV_PREFIX.length), sha: (b.commit && b.commit.sha) || '' }));
}
/** Страница истории файла в ветке (по 100 записей). */
async function rvHist(m, branch, page, per) {
  const r = await ghReq('GET', '/repos/' + m.repo + '/commits?path=' + ghEnc(m.path) + (branch ? '&sha=' + encodeURIComponent(branch) : '') + '&per_page=' + (per || 100) + '&page=' + (page || 1));
  if (r.status !== 200) throw ghStatusErr(r);
  return (ghParse(r.text) || []).map(c => ({ sha: c.sha, msg: String((c.commit && c.commit.message) || '').split('\n')[0], date: c.commit && c.commit.author && c.commit.author.date, who: (c.author && c.author.login) || '' }));
}
/** Версия файла, от которой автор отошёл: самая свежая запись основной ветки, которая есть и в истории ветки автора. */
async function rvFindBase(m, branch) {
  const HA = [];
  for (let pg = 1; pg <= 8; pg++) { const l = await rvHist(m, branch, pg, 100); HA.push(...l); if (l.length < 100) break; }
  const inA = new Set(HA.map(x => x.sha));
  for (let pg = 1; pg <= 3; pg++) {
    const l = await rvHist(m, m.branch || '', pg, 100);
    for (const c of l) if (inA.has(c.sha)) return { sha: c.sha, approx: false };
    if (l.length < 100) break;
  }
  return HA.length ? { sha: HA[HA.length - 1].sha, approx: true } : null;
}

/* ---------- автор: своя ветка ---------- */
async function rvStartBranch() {
  const m = gmeta(); if (!m || !m.on) throw ghFail('bad_request', t('rv.err.gh'));
  if (rvIsAuthor(m)) return true;
  const login = GHS.st.login; if (!login) throw ghFail('auth', t('gh.err.auth'));
  const main = await rvRef(m, m.branch || ''); if (!main.exists) throw ghFail('not_found', t('rv.err.nomain'));
  const name = rvBranchOf(login);
  const mine = await rvRef(m, name);
  if (!mine.exists) await rvCreateBranch(Object.assign({}, m, { main: main.name }), name, main.sha);
  const B = await baseLoad('gbase_' + P.uid); if (B) await baseSave('gmain_' + P.uid, B);     // основа для «забрать из основной»
  m.main = main.name; m.branch = name; m.author = true; m.etag = ''; gmSave();
  GHS.remote = null; ghRefreshUI();
  toast(t('rv.started', name), 4500);
  await ghRun(() => ghCycle({ manual: true }));
  return true;
}
/** Автор: подтянуть из основной ветки то, что принял владелец (слияние «основа → моё → основная»), результат уйдёт в ветку автора. */
function rvPullMain() {
  return ghRun(async () => {
    const m = gmeta(); if (!rvIsAuthor(m)) return;
    try {
      ghSetPhase('syncing');
      const rem = await ghGetFile(m, { ref: m.main, etag: '' });
      if (!rem.exists) throw ghFail('not_found', t('gh.err.notfound'));
      let np; try { np = normalize(JSON.parse(rem.text)); } catch (e) { throw ghFail('bad_file', t('gh.err.broken')); }
      if (!np || !Array.isArray(np.nodes)) throw ghFail('bad_file', t('gh.err.notproj'));
      const B = (await baseLoad('gmain_' + P.uid)) || (await baseLoad('gbase_' + P.uid)) || new Map();
      const L = rvLocal(), R = mgEntities(np), cf = [];
      const M = mgMergeMaps(B, L, R, cf);
      const inc = mgDiff(B, R), n = inc.set.length + inc.del.length;
      GHS.applying = true; try { if (!clSame(M, L)) clApplyMap(M, cf); } finally { GHS.applying = false; }
      await baseSave('gmain_' + P.uid, R);
      const lost = cf.filter(c => !c.text).length;
      toast(n ? t('rv.pulled', n) + (lost ? '. ' + t('rv.pulled.cf', lost) : '') : t('rv.pulled.none'), 5200);
      ghDone();
    } catch (e) { ghFailed(e); }
  });
}
/** Вызывается после каждой синхронизации: автору сообщаем о новых замечаниях владельца. */
function rvAfterSync() {
  const m = gmeta(); if (!rvIsAuthor(m)) return;
  const n = (P.cmts || []).filter(c => c.rv && !c.done).length, seen = m.rvSeen || 0;
  if (n !== seen) { m.rvSeen = n; gmSave(); if (n > seen) toast(t('rv.returned.toast', n), 9000); }
}

/** Мой проект в виде сущностей, приведённый к тому же виду, что и файлы из репозитория (иначе поля по умолчанию дают ложные «правки»). */
const rvLocal = () => mgEntities(normalize(JSON.parse(contentOf(P))));

/* ---------- сравнение: основа → автор ---------- */
const rvSkipEd = ['ed', 'edt'];
function rvChangedKeys(a, b, skip) {
  const A = a || {}, B = b || {}, out = [];
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { if (skip && skip.includes(k)) continue; if (!mgEq(A[k], B[k])) out.push(k); }
  return out;
}
/** Строки двух текстов → список изменённых мест { at, del[], add[] } (для показа). */
function rvHunks(a, b) {
  const A = String(a || '').split('\n'), Bn = String(b || '').split('\n');
  return mgHunks(A, Bn).map(h => ({ at: h.as + 1, del: A.slice(h.as, h.ae), add: Bn.slice(h.bs, h.be) }));
}
const rvNames = keys => { const names = [...new Set(keys.map(rvFieldName))]; return names.slice(0, 5).join(', ') + (names.length > 5 ? '…' : ''); };
const RV_GROUP = { c: 'chars', a: 'assets', v: 'vars', m: 'members', g: 'achs', l: 'tl', r: 'tl', q: 'tasks', s: 'snips' };
const RV_NOUN = { c: 'char', a: 'asset', v: 'var', m: 'member', g: 'ach', l: 'lang', q: 'task', s: 'snip' };
const rvName = e => String((e && (e.name || e.title || e.file || e.filename || e.id)) || '').slice(0, 80);

/** Изменения автора относительно основы (B → A), с отметками относительно моего проекта L. Чистая функция над картами сущностей. */
function rvItems(B, A, L) {
  const items = [], used = new Set();
  const nodeTitle = id => { const e = A.get('n/' + id) || L.get('n/' + id) || B.get('n/' + id); return e ? (e.title || t('rv.untitled')) : '?'; };
  const filesOf = (M, nid) => [...M.keys()].filter(k => k.startsWith('f/') && M.get(k).nodeId === nid);
  const keys = [...new Set([...B.keys(), ...A.keys()])];
  const lines = ks => ks.reduce((s, k) => s + String((A.get(k) || B.get(k) || {}).script || '').split('\n').length, 0);
  const posOnly = [];
  for (const k of keys) {                                                  // блоки
    if (!k.startsWith('n/')) continue;
    const b = B.get(k), a = A.get(k), id = k.slice(2);
    if (mgEq(a, b)) continue;
    if (a && !b) {
      const fk = filesOf(A, id); fk.forEach(x => used.add(x));
      items.push({ key: k, type: 'new', noun: 'node', group: id, title: a.title, paths: [k, ...fk], sub: t('rv.sub.files', fk.length, lines(fk)),
        hunks: fk.map(x => ({ label: A.get(x).title || t('rv.untitled'), at: 1, del: [], add: String(A.get(x).script || '').split('\n') })).filter(x => x.add.join('') !== '') });
    } else if (b && !a) {
      const fk = filesOf(B, id), ek = keys.filter(x => x.startsWith('e/') && B.has(x) && (B.get(x).from === id || B.get(x).to === id));
      [...fk, ...ek].forEach(x => used.add(x));
      items.push({ key: k, type: 'del', noun: 'node', group: id, title: b.title, paths: [k, ...fk, ...ek], sub: t('rv.sub.files', fk.length, lines(fk)) });
    } else {
      const ch = rvChangedKeys(b, a, ['fileIds', ...rvSkipEd]);
      if (!ch.length) continue;
      if (ch.every(c => c === 'x' || c === 'y')) { posOnly.push(k); continue; }
      items.push({ key: k, type: 'edit', noun: 'node', group: id, title: a.title, paths: [k], sub: t('rv.sub.fields', rvNames(ch)) });
    }
  }
  if (posOnly.length) items.push({ key: 'layout', type: 'edit', noun: 'layout', group: 'layout', title: '', paths: posOnly, sub: t('rv.sub.n', posOnly.length) });
  for (const k of keys) {                                                  // главы
    if (!k.startsWith('f/') || used.has(k)) continue;
    const b = B.get(k), a = A.get(k);
    if (mgEq(a, b)) continue;
    if (a && !b) items.push({ key: k, type: 'new', noun: 'file', group: a.nodeId, title: a.title, paths: [k], sub: t('rv.sub.files', 1, lines([k])), hunks: [{ at: 1, del: [], add: String(a.script || '').split('\n') }].filter(x => x.add.join('') !== '') });
    else if (b && !a) items.push({ key: k, type: 'del', noun: 'file', group: b.nodeId, title: b.title, paths: [k], sub: t('rv.sub.files', 1, lines([k])) });
    else {
      const ch = rvChangedKeys(b, a, rvSkipEd); if (!ch.length) continue;
      const hunks = ch.includes('script') ? rvHunks(b.script, a.script) : null;
      const plus = hunks ? hunks.reduce((s, x) => s + x.add.length, 0) : 0, minus = hunks ? hunks.reduce((s, x) => s + x.del.length, 0) : 0;
      const other = ch.filter(c => c !== 'script');
      items.push({ key: k, type: 'edit', noun: 'file', group: a.nodeId, title: a.title, paths: [k], hunks,
        sub: [hunks ? t('rv.sub.lines', plus, minus) : '', other.length ? t('rv.sub.fields', rvNames(other)) : ''].filter(Boolean).join(' · ') });
    }
  }
  for (const k of keys) {                                                  // стрелки
    if (!k.startsWith('e/') || used.has(k)) continue;
    const b = B.get(k), a = A.get(k);
    if (mgEq(a, b)) continue;
    const e = a || b, ch = a && b ? rvChangedKeys(b, a, rvSkipEd) : [];
    if (a && b && !ch.length) continue;
    items.push({ key: k, type: !b ? 'new' : !a ? 'del' : 'edit', noun: 'edge', group: e.from, title: nodeTitle(e.from) + ' → ' + nodeTitle(e.to) + (e.title ? ' («' + e.title + '»)' : ''), paths: [k], sub: ch.length ? t('rv.sub.fields', rvNames(ch)) : '' });
  }
  for (const k of keys) {                                                  // всё остальное
    const pre = k === 'meta' ? 'meta' : k.slice(0, 2) === 'x/' ? 'x' : k.charAt(1) === '/' ? k.charAt(0) : '';
    if (!pre || 'nfex'.includes(pre) && pre !== 'meta') continue;
    const b = B.get(k), a = A.get(k);
    if (mgEq(a, b)) continue;
    if (pre === 'meta') {
      const ch = rvChangedKeys(b, a, ['uid']); if (ch.length) items.push({ key: k, type: 'edit', noun: 'meta', group: 'meta', title: '', paths: [k], sub: t('rv.sub.fields', rvNames(ch)) });
      continue;
    }
    const e = a || b;
    if (pre === 'k') {                                                      // заметки: замечания проверяющего — не правка автора
      if (e.rv) continue;
      items.push({ key: k, type: !b ? 'new' : !a ? 'del' : 'edit', noun: 'note', group: e.nid, title: String(e.text || '').slice(0, 80), paths: [k], sub: '' });
      continue;
    }
    if (pre === 'r') { const n = rvChangedKeys(b, a, []).length; items.push({ key: k, type: !b ? 'new' : !a ? 'del' : 'edit', noun: 'tr', group: 'tl', title: k.slice(2), paths: [k], sub: t('rv.sub.fields', n) }); continue; }
    const ch = a && b ? rvChangedKeys(b, a, rvSkipEd) : [];
    if (a && b && !ch.length) continue;
    items.push({ key: k, type: !b ? 'new' : !a ? 'del' : 'edit', noun: RV_NOUN[pre], group: RV_GROUP[pre], title: rvName(e), paths: [k], sub: ch.length ? t('rv.sub.fields', rvNames(ch)) : '' });
  }
  for (const it of items) {
    it.done = it.paths.every(p => mgEq(A.get(p), L.get(p)));
    it.conflict = !it.done && it.paths.some(p => !mgEq(L.get(p), B.get(p)) && !mgEq(L.get(p), A.get(p)));
    it.hash = mgHash(it.paths.map(p => [p, A.get(p) === undefined ? null : A.get(p)]));
  }
  return items;
}
/** Порядок и названия групп: сначала блоки (как они лежат в проекте), потом общие разделы. */
function rvGroups(items, A, L) {
  const by = new Map();
  for (const it of items) { if (!by.has(it.group)) by.set(it.group, []); by.get(it.group).push(it); }
  const out = [], seen = new Set();
  const blk = id => A.get('n/' + id) || L.get('n/' + id);
  for (const k of [...A.keys(), ...L.keys()]) {
    if (!k.startsWith('n/')) continue;
    const id = k.slice(2); if (!by.has(id) || seen.has(id)) continue;
    seen.add(id); const n = blk(id); out.push({ id, title: n.title || t('rv.untitled'), color: n.color, items: by.get(id) });
  }
  for (const [g, l] of by) {
    if (seen.has(g)) continue;
    const named = D['rv.g.' + g];
    out.push({ id: g, title: named ? t('rv.g.' + g) : (rvName(L.get('n/' + g)) || '—'), items: l, general: !!named });
  }
  return out.sort((a, b) => (a.general ? 1 : 0) - (b.general ? 1 : 0));
}

/* ---------- принять ---------- */
function rvReplaceProject(np) {
  flushHistory();
  np.view = P.view; if (P.sim && typeof P.sim === 'object') np.sim = P.sim; if (P.teTabs) np.teTabs = P.teTabs;
  P = np; reindex();
  for (const id of [...UI.sel]) if (!nodeById(id)) UI.sel.delete(id);
  if (UI.edge && !edgeById(UI.edge)) UI.edge = null;
  commit(true); scheduleSave();
  onProjectReplaced();
  if (typeof TLW !== 'undefined' && TLW && !TLW.m.closed) { tlSync(); renderTl(); }
}
/** Переносит выбранные изменения автора в мой проект одним шагом. Возвращает { applied, skipped[], deps, marked }. */
function rvApply(sel, ctx) {
  const A = ctx.A, B = ctx.B, L = rvLocal(), M = new Map(L), cf = [], skipped = [], depKeys = new Set();
  const want = new Set(); sel.forEach(it => it.paths.forEach(p => want.add(p)));
  const addNode = nid => {                                                 // нужен блок, которого у меня нет: берём его вместе с главами
    const nk = 'n/' + nid; if (L.has(nk) || want.has(nk) || !A.has(nk)) return;
    want.add(nk); depKeys.add(nk);
    for (const fk of A.keys()) if (fk.startsWith('f/') && A.get(fk).nodeId === nid) want.add(fk);
  };
  for (const p of [...want]) {
    const a = A.get(p); if (!a) continue;
    if (p.startsWith('f/')) addNode(a.nodeId);
    else if (p.startsWith('e/')) { addNode(a.from); addNode(a.to); }
    else if (p.startsWith('k/')) addNode(a.nid);
  }
  let applied = 0;
  for (const p of want) {
    const a = A.get(p), b = B.get(p), l = L.get(p);
    if (mgEq(a, l)) continue;
    if (a === undefined) { if (mgEq(l, b)) { M.delete(p); applied++; } else skipped.push(p); continue; }       // автор удалил: удаляем, если вы это не трогали
    if (l === undefined) { if (b === undefined) { M.set(p, mgClone(a)); applied++; } else skipped.push(p); continue; }   // вы удалили, автор менял: остаётся удалённым
    if (mgEq(l, b)) { M.set(p, mgClone(a)); applied++; continue; }
    M.set(p, mgMergeObj(mgIsObj(b) ? b : {}, l, a, p, cf, 0)); applied++;                                  // правили оба: слияние по полям
  }
  const np = normalize(mgBuild(M, P));
  rvReplaceProject(np);
  const skippedSet = new Set(skipped);
  const okItems = sel.filter(it => !it.paths.some(p => skippedSet.has(p)));
  return { applied: okItems.length, skippedItems: sel.filter(it => it.paths.some(p => skippedSet.has(p))), deps: [...depKeys].filter(k => k.startsWith('n/')).length, marked: cf.filter(c => c.marked).length };
}

/* ---------- вернуть автору с замечанием ---------- */
/** Добавляет заметки-замечания в файл ветки автора (на его блоки). notes: [{ nid, text }]. Автор получит их обычной синхронизацией. */
async function rvReturnNotes(m, branch, who, notes) {
  if (!notes.length) return 0;
  const bm = Object.assign({}, m, { branch });
  const by = (typeof cmAuthor === 'function' && cmAuthor()) || GHS.st.login || '';
  for (let attempt = 0; attempt < 4; attempt++) {
    const cur = await ghGetFile(bm, { ref: branch, etag: '' });
    if (!cur.exists) throw ghFail('not_found', t('gh.err.notfound'));
    let p0; try { p0 = JSON.parse(cur.text); } catch (e) { throw ghFail('bad_file', t('gh.err.broken')); }
    if (!p0 || !Array.isArray(p0.nodes)) throw ghFail('bad_file', t('gh.err.notproj'));
    if (!Array.isArray(p0.cmts)) p0.cmts = [];
    const ids = new Set(p0.nodes.map(n => n.id));
    let n = 0;
    for (const nt of notes) {
      const nid = ids.has(nt.nid) ? nt.nid : ids.has(p0.startId) ? p0.startId : p0.nodes[0] && p0.nodes[0].id;
      if (!nid) continue;
      p0.cmts.push({ id: uid('k'), nid, fid: '', by: String(by).slice(0, 60), to: String(who).slice(0, 60), rv: 1, t: Date.now(), text: String(nt.text).slice(0, 2000), done: false }); n++;
    }
    try { await ghPutFile(bm, JSON.stringify(p0), t('rv.commit', P.name), cur.sha); return n; }
    catch (e) { if (ghErrInfo(e).code !== 'conflict') throw e; }          // автор успел записать: берём свежую версию и повторяем
  }
  throw ghFail('conflict', t('gh.err.server', 409));
}

/* ---------- загрузка данных для проверки ---------- */
async function rvLoad(m, branch) {
  const [cur, base] = await Promise.all([ghGetFile(m, { ref: branch, etag: '' }), rvFindBase(m, branch)]);
  if (!cur.exists) throw ghFail('not_found', t('gh.err.notfound'));
  if (!base) throw ghFail('not_found', t('rv.err.base'));
  const bf = await ghGetFile(m, { ref: base.sha });
  if (!bf.exists) throw ghFail('not_found', t('rv.err.base'));
  const parse = txt => { let p; try { p = JSON.parse(txt); } catch (e) { throw ghFail('bad_file', t('gh.err.broken')); } if (!p || !Array.isArray(p.nodes)) throw ghFail('bad_file', t('gh.err.notproj')); return normalize(p); };
  return { branch, A: mgEntities(parse(cur.text)), B: mgEntities(parse(bf.text)), approx: base.approx, sha: cur.sha };
}
/** Разбор списка: на проверке / отклонено и возвращено / уже принято (в том числе слитое с вашими правками: оно уже не совпадает с версией автора). */
function rvState(items, dis) {
  const acc = i => i.done || dis['+' + i.key] === i.hash;
  return { todo: items.filter(i => !acc(i) && dis[i.key] !== i.hash), hidden: items.filter(i => !acc(i) && dis[i.key] === i.hash), done: items.filter(acc) };
}
const rvDis = (m, branch) => { if (!m.rv || typeof m.rv !== 'object') m.rv = {}; return m.rv[branch] || (m.rv[branch] = {}); };

/* ====== окно: список веток авторов ====== */
function openReviewList() {
  closePopover();
  const m = gmeta();
  if (!m || !m.on) { confirmDlg({ title: t('rv.need.t'), text: t('rv.need.p'), ok: t('rv.need.btn') }).then(yes => { if (yes) openGhPanel(); }); return; }   // раньше сразу выбрасывало в панель GitHub без объяснений
  if (rvIsAuthor(m)) { toast(t('rv.err.mine'), 6000); return; }
  const st = { m: null, root: h('div', { class: 'view rv-view' }), list: null, err: '', last: {} };
  st.m = openModal({ cls: 'drive-m rv-m', build: mm => { st.m = mm; return h('div', { class: 'm-wrap' }, modalHead(t('rv.l.title'), mm), h('div', { class: 'm-body' }, h('div', { class: 'm-main' }, st.root))); } });
  const render = () => {
    if (st.m.closed) return;
    const rows = [];
    if (st.err) rows.push(h('div', { class: 'hint warn-t', id: 'rv-err' }, st.err));
    else if (!st.list) rows.push(h('div', { class: 'empty small' }, t('drive.loading')));
    else if (!st.list.length) rows.push(h('div', { class: 'empty small', id: 'rv-none' }, t('rv.l.none')));
    else for (const b of st.list) {
      const l = st.last[b.name], who = rvWho(b.login);
      rows.push(h('div', { class: 'dr-row rv-brow', 'data-br': b.name },
        h('div', { class: 'dr-t' }, h('b', who), h('span', { class: 'hint mono' }, b.name + (l && l.date ? ' · ' + t('rv.l.last', fmtTime(l.date)) : ''))),
        h('button', { class: 'btn primary sm', 'data-check': b.name, onclick: () => { openReviewBranch(b.name, b.login); } }, icon('check', 14), t('rv.l.check'))));
    }
    st.root.replaceChildren(h('div', { class: 'hint', style: { marginBottom: '10px' } }, t('rv.l.lead')), h('div', { class: 'dr-list' }, rows),
      h('div', { class: 'row-actions left', style: { marginTop: '10px' } }, h('button', { class: 'btn sm', onclick: () => { st.list = null; st.err = ''; load(); render(); } }, icon('refresh', 13), t('drive.reload'))));
  };
  const load = async () => {
    try {
      st.list = await rvBranches(m); render();
      for (const b of st.list.slice(0, 20)) { try { const l = await rvHist(m, b.name, 1, 1); st.last[b.name] = l[0] || null; } catch (e) { /* без даты */ } if (st.m.closed) return; render(); }
    } catch (e) { st.err = ghErrInfo(e).msg; render(); }
  };
  render(); load();
}

/* ====== окно: проверка правок одного автора ====== */
async function openReviewBranch(branch, login) {
  const m = gmeta(); if (!m || !m.on) return;
  const who = rvWho(login);
  const st = { m: null, root: h('div', { class: 'view rv-view' }), foot: h('div', { class: 'rv-foot' }), branch, login, who, loading: true, data: null, err: '', dec: new Map(), cmt: new Map(), showDis: false, busy: false };
  st.m = openModal({
    cls: 'drive-m rv-m', build: mm => { st.m = mm; return h('div', { class: 'm-wrap' }, modalHead(t('rv.t', who), mm), h('div', { class: 'm-body' }, h('div', { class: 'm-main' }, st.root)), st.foot); }
  });
  st.m.tag = 'review';
  rvRender(st);
  try { st.data = await rvLoad(m, branch); } catch (e) { st.err = ghErrInfo(e).msg; }
  st.loading = false; rvRender(st);
}
function rvHunksEl(hunks) {
  const box = h('div', { class: 'rv-diff mono' });
  let shown = 0;
  for (const hk of hunks.slice(0, 12)) {
    if (hk.label) box.append(h('div', { class: 'rv-dl' }, hk.label));
    else box.append(h('div', { class: 'rv-dl' }, t('rv.d.at', hk.at)));
    for (const x of hk.del.slice(0, 30)) box.append(h('div', { class: 'del' }, '− ' + x));
    if (hk.del.length > 30) box.append(h('div', { class: 'more' }, t('rv.d.more', hk.del.length - 30)));
    for (const x of hk.add.slice(0, 30)) box.append(h('div', { class: 'add' }, '+ ' + x));
    if (hk.add.length > 30) box.append(h('div', { class: 'more' }, t('rv.d.more', hk.add.length - 30)));
    shown++;
  }
  if (hunks.length > shown) box.append(h('div', { class: 'more' }, t('rv.d.hunks', hunks.length - shown)));
  return box;
}
function rvRender(st) {
  if (!st.m || st.m.closed) return;
  const m = gmeta(), keep = st.m.card.querySelector('.m-main'), top = keep ? keep.scrollTop : 0;
  const parts = [], foot = [];
  if (st.loading) parts.push(h('div', { class: 'empty small' }, t('drive.loading')));
  else if (st.err) parts.push(h('div', { class: 'hint warn-t', id: 'rv-err' }, st.err));
  else if (m && st.data) {
    const d = st.data, L = rvLocal(), all = rvItems(d.B, d.A, L), dis = rvDis(m, st.branch);
    const stt = rvState(all, dis), todo = stt.todo, hidden = stt.hidden, doneN = stt.done.length;
    for (const k of [...st.dec.keys()]) if (!todo.some(i => i.key === k)) st.dec.delete(k);
    parts.push(h('div', { class: 'hint' }, t('rv.sub', st.branch)));
    if (d.approx) parts.push(h('div', { class: 'hint warn-t' }, t('rv.approx')));
    parts.push(h('div', { class: 'rv-sum' }, h('b', { id: 'rv-count' }, t('rv.sum', todo.length)), doneN ? h('span', { class: 'hint' }, ' · ' + t('rv.sum.done', doneN)) : null, hidden.length ? h('span', { class: 'hint' }, ' · ' + t('rv.sum.dis', hidden.length)) : null));
    if (todo.length) parts.push(h('div', { class: 'row-actions left rv-top' },
      h('button', { class: 'btn sm', id: 'rv-all', onclick: () => { todo.forEach(i => st.dec.set(i.key, 'accept')); rvRender(st); } }, icon('check', 13), t('rv.all', todo.length)),
      h('button', { class: 'btn sm', id: 'rv-clear', onclick: () => { st.dec.clear(); rvRender(st); } }, t('rv.clear'))));
    else parts.push(h('div', { class: 'empty small', id: 'rv-empty' }, all.length ? t('rv.none') : t('rv.done.all')));
    const row = (it, dismissed) => {
      const dec = st.dec.get(it.key) || '';
      const btn = (v, ic) => h('button', { class: 'rv-b ' + v + (dec === v ? ' on' : ''), 'data-dec': v, 'data-tip': t('rv.tip.' + v), onclick: () => { if (st.dec.get(it.key) === v) st.dec.delete(it.key); else st.dec.set(it.key, v); rvRender(st); } }, icon(ic, 14), h('span', t('rv.act.' + v)));
      const name = it.noun === 'layout' || it.noun === 'meta' ? t('rv.n.' + it.noun) : t('rv.n.' + it.noun) + ' «' + (it.title || t('rv.untitled')) + '»';
      return h('div', { class: 'rv-row' + (dec ? ' dec-' + dec : '') + (dismissed ? ' dismissed' : ''), 'data-rvk': it.key },
        h('div', { class: 'rv-t' },
          h('div', { class: 'rv-line' }, h('span', { class: 'rv-pill ' + it.type }, t('rv.type.' + it.type)), h('b', name)),
          it.sub ? h('div', { class: 'hint' }, it.sub) : null,
          it.conflict ? h('div', { class: 'hint warn-t' }, t('rv.conf')) : null,
          it.hunks && it.hunks.length ? h('details', { class: 'rv-det' }, h('summary', t('rv.d.show')), rvHunksEl(it.hunks)) : null),
        dismissed ? h('button', { class: 'btn sm', onclick: () => { delete dis[it.key]; gmSave(); rvRender(st); } }, icon('undo', 13), t('rv.again'))
          : h('div', { class: 'rv-acts' }, btn('accept', 'check'), btn('return', 'undo'), btn('reject', 'x')));
    };
    for (const g of rvGroups(todo, d.A, L)) {
      const hasRet = g.items.some(i => st.dec.get(i.key) === 'return');
      const box = h('div', { class: 'rv-grp', 'data-rvg': g.id });
      box.append(h('div', { class: 'rv-gh' }, g.color ? h('span', { class: 'dot', style: { background: palColor(g.color) } }) : icon(g.general ? 'layers' : 'box', 14), h('b', g.title), h('div', { class: 'grow' }),
        g.items.length > 1 ? h('button', { class: 'btn sm', onclick: () => { g.items.forEach(i => st.dec.set(i.key, 'accept')); rvRender(st); } }, icon('check', 13), t('rv.grp.all')) : null));
      g.items.forEach(i => box.append(row(i, false)));
      if (hasRet) {
        const ta = h('textarea', { class: 'inp rv-ta', rows: '2', placeholder: t('rv.comment.ph'), maxlength: '1500', 'data-rvc': g.id });
        ta.value = st.cmt.get(g.id) || ''; ta.addEventListener('input', () => st.cmt.set(g.id, ta.value)); ta.addEventListener('keydown', e => e.stopPropagation());
        box.append(h('div', { class: 'rv-cm' }, h('div', { class: 'lbl' }, t('rv.comment')), ta));
      }
      parts.push(box);
    }
    if (hidden.length) {
      parts.push(h('button', { class: 'cm-toggle', id: 'rv-dis', onclick: () => { st.showDis = !st.showDis; rvRender(st); } }, st.showDis ? t('rv.hide.dis') : t('rv.show.dis', hidden.length)));
      if (st.showDis) hidden.forEach(i => parts.push(row(i, true)));
    }
    const n = v => todo.filter(i => st.dec.get(i.key) === v).length, na = n('accept'), nr = n('return'), nj = n('reject');
    foot.push(h('div', { class: 'hint rv-fc' }, na + nr + nj ? t('rv.go.n', na, nr, nj) : t('rv.go.none')),
      h('button', { class: 'btn primary', id: 'rv-go', disabled: st.busy || !(na + nr + nj), onclick: () => rvGo(st, todo) }, icon('check', 15), t('rv.go')));
  }
  st.root.replaceChildren(...parts);
  st.foot.replaceChildren(...foot);
  const mm = st.m.card.querySelector('.m-main'); if (mm) mm.scrollTop = top;
}
async function rvGo(st, todo) {
  const m = gmeta(); if (!m || !st.data || st.busy) return;
  const sel = v => todo.filter(i => st.dec.get(i.key) === v), acc = sel('accept'), ret = sel('return'), rej = sel('reject');
  const L = rvLocal(), groups = rvGroups(ret, st.data.A, L);
  for (const g of groups) if (!(st.cmt.get(g.id) || '').trim()) { toast(t('rv.needc', g.title), 6000); return; }
  st.busy = true; rvRender(st);
  try {
    let sent = 0;
    if (ret.length) {
      const notes = groups.map(g => ({ nid: g.general ? '' : g.id, text: t('rv.note.head', g.items.map(i => (t('rv.n.' + i.noun) + (i.title ? ' «' + i.title + '»' : '')).slice(0, 80)).join('; ')) + '\n' + st.cmt.get(g.id).trim() }));
      sent = await rvReturnNotes(m, st.branch, st.who, notes);
    }
    let res = null;
    if (acc.length) res = rvApply(acc, st.data);
    const dis = rvDis(m, st.branch);
    for (const it of [...ret, ...rej]) dis[it.key] = it.hash;
    if (res) { const sk = new Set(res.skippedItems.map(i => i.key)); for (const it of acc) if (!sk.has(it.key)) dis['+' + it.key] = it.hash; }
    gmSave();
    ret.forEach(i => st.cmt.delete(i.group)); st.dec.clear();
    const msg = [];
    if (res && res.applied) msg.push(t('rv.applied', res.applied));
    if (res && res.deps) msg.push(t('rv.deps', res.deps));
    if (sent) msg.push(t('rv.sent', sent));
    if (rej.length) msg.push(t('rv.rej', rej.length));
    if (res && res.skippedItems.length) msg.push(t('rv.skipped', res.skippedItems.length));
    if (res && res.marked) msg.push(t('rv.cflt', res.marked));
    if (res && res.applied) msg.push(t('rv.undo'));
    toast(msg.join('. '), 9000);
  } catch (e) { const g = ghErrInfo(e); toast(g.msg, Math.max(6500, g.msg.length * 70)); }
  st.busy = false; rvRender(st);
}

/* ====== карточки в окне «GitHub» ====== */
function rvPanelCards(st, m, guard) {
  const card = h('div', { class: 'card-sec', id: 'rv-card' }, h('div', { class: 'sec-head' }, icon('users', 16), h('b', t('rv.p.h'))));
  if (rvIsAuthor(m)) {
    const notes = (P.cmts || []).filter(c => c.rv && !c.done).length;
    card.append(h('div', { class: 'opt-row' }, h('div', { class: 'opt-t' }, h('b', t('rv.p.on')), h('div', { class: 'hint' }, t('rv.p.on.t', m.branch, m.main)))),
      notes ? h('div', { class: 'hint warn-t', id: 'rv-notes' }, t('rv.p.notes', notes)) : null,
      h('div', { class: 'row-actions left', style: { margin: '10px 0 4px' } },
        h('button', { class: 'btn', id: 'rv-pull', disabled: st.busy, onclick: () => guard(async () => { await rvPullMain(); }) }, icon('download', 15), t('rv.p.pull')),
        notes ? h('button', { class: 'btn', onclick: () => openAllNotes() }, icon('sticker', 15), t('rv.p.notes.open')) : null,
        h('button', { class: 'btn', onclick: () => ghOpenUrl(ghWebUrl(m)) }, icon('open', 15), t('rv.p.open'))),
      h('div', { class: 'hint' }, t('rv.p.pull.h')));
  } else {
    card.append(h('div', { class: 'hint', style: { marginBottom: '8px' } }, t('rv.p.t')),
      h('div', { class: 'row-actions left' },
        h('button', { class: 'btn primary', id: 'rv-review', onclick: () => openReviewList() }, icon('check', 15), t('rv.p.review')),
        h('button', { class: 'btn', id: 'rv-start', disabled: st.busy, onclick: async () => {
          const name = rvBranchOf(GHS.st.login);
          if (await confirmDlg({ title: t('rv.p.start.q'), text: t('rv.p.start.t', name, m.branch || '—'), ok: t('rv.p.start.ok') })) guard(async () => { await rvStartBranch(); });
        } }, icon('fork', 15), t('rv.p.start'))));
  }
  return [card];
}

TOOL_ITEMS.push({ id: 'review', group: 'files', ic: 'diff', key: 'rv.menu', kw: 'review branch author github accept проверка правок ветка автор принять вернуть замечание рецензирование', run: () => openReviewList() });

'use strict';
/* ====== Открыть новеллу с GitHub по ссылке ======
   Вставляете ссылку на репозиторий или на файл проекта (*.vnmap.json), программа находит файл, показывает, что в нём, и открывает.
   Публичные репозитории открываются без входа в GitHub, закрытые только после входа (панель «GitHub»). Два способа открыть:
     · копия: проект открывается у вас, изменения в репозиторий не уходят;
     · подключить: работа вместе с репозиторием (нужны вход и право записи), как «Взять проект из репозитория».
   Ссылка на саму программу вида …#gh=автор/новелла@ветка:путь открывает окно сразу с этой новеллой. Картинок и звуков в репозитории нет:
   на их месте заглушки (см. «Недостающие файлы»). */

Object.assign(D, {
  'gho.menu': ['Открыть с GitHub…', 'Open from GitHub…'],
  'gho.title': ['Открыть новеллу с GitHub', 'Open a novel from GitHub'],
  'gho.lead': ['Вставьте ссылку на репозиторий или на файл проекта (*.vnmap.json). Можно коротко: автор/новелла, автор/новелла@ветка или автор/новелла:путь/к/файлу.json. Публичные репозитории открываются без входа.',
    'Paste a link to a repository or to the project file (*.vnmap.json). Short forms work too: author/novel, author/novel@branch or author/novel:path/to/file.json. Public repositories open without signing in.'],
  'gho.ph': ['https://github.com/автор/новелла', 'https://github.com/author/novel'],
  'gho.find': ['Найти', 'Find'],
  'gho.recent': ['Недавние', 'Recent'],
  'gho.as': ['Вы вошли как {0}: открываются и закрытые репозитории.', 'Signed in as {0}: private repositories open too.'],
  'gho.anon': ['Вход не нужен для публичных репозиториев. Закрытый (например, общая новелла команды) откроется после входа на GitHub.', 'No sign-in is needed for public repositories. A private one (for example the team\'s shared novel) opens after signing in to GitHub.'],
  'gho.login.t': ['Нажмите кнопку: программа покажет код и откроет страницу GitHub. Вставьте код там и нажмите Authorize. Потом вернитесь сюда: окно само заметит вход.', 'Press the button: the app shows a code and opens a GitHub page. Paste the code there and press Authorize. Then come back here: the window notices the sign-in by itself.'],
  'gho.login.web': ['Войти на GitHub можно в панели «GitHub» (токен доступа).', 'You can sign in to GitHub in the GitHub panel (an access token).'],
  'gho.login.panel': ['Открыть панель GitHub', 'Open the GitHub panel'],
  'gho.err.link': ['Не похоже на ссылку на GitHub. Примеры: https://github.com/автор/новелла или автор/новелла', 'This does not look like a GitHub link. Examples: https://github.com/author/novel or author/novel'],
  'gho.err.none': ['В репозитории не нашёлся файл проекта (*.vnmap.json). Если он лежит в другой ветке, добавьте её: автор/новелла@ветка', 'No project file (*.vnmap.json) was found in the repository. If it is in another branch, add it: author/novel@branch'],
  'gho.err.trunc': ['Репозиторий очень большой, и GitHub обрезал список файлов. Вставьте ссылку прямо на файл проекта.', 'The repository is very large and GitHub cut the file list. Paste a link straight to the project file.'],
  'gho.err.big': ['Файл проекта слишком большой ({0}).', 'The project file is too big ({0}).'],
  'gho.err.anon': ['Репозиторий не найден или закрыт. Если он закрытый, войдите на GitHub (кнопка ниже) и нажмите «Найти» ещё раз.', 'The repository was not found or is private. If it is private, sign in to GitHub (the button below) and press Find again.'],
  'gho.err.priv': ['Репозиторий или файл не найден, либо у вас нет к ним доступа.', 'The repository or file was not found, or you have no access to it.'],
  'gho.err.empty': ['Репозиторий пуст.', 'The repository is empty.'],
  'gho.err.notproj': ['Это не файл проекта «Карты новеллы».', 'This is not a “Novel map” project file.'],
  'gho.cands': ['Найдено проектов: {0}. Выберите нужный:', 'Projects found: {0}. Choose one:'],
  'gho.sum': ['«{0}»: блоков {1}, глав {2}, персонажей {3}', '“{0}”: {1} blocks, {2} chapters, {3} characters'],
  'gho.sum.f': ['Картинок и звуков записано: {0}. Самих файлов в репозитории нет, на их месте будут заглушки.', 'Images and sounds recorded: {0}. The files themselves are not in the repository: placeholders will stand in.'],
  'gho.src': ['{0}, ветка {1}', '{0}, branch {1}'],
  'gho.open': ['Открыть копию', 'Open a copy'],
  'gho.open.h': ['Проект откроется у вас как копия. Изменения в репозиторий не отправляются.', 'The project opens here as a copy. Changes are not sent to the repository.'],
  'gho.join': ['Открыть и подключить', 'Open and connect'],
  'gho.join.h': ['Работать вместе с репозиторием: изменения будут уходить в него и приходить из него.', 'Work together with the repository: changes go to it and come from it.'],
  'gho.join.no': ['Чтобы подключиться и работать вместе, нужны вход на GitHub и право записи в репозиторий.', 'To connect and work together you need to sign in to GitHub and have write access to the repository.'],
  'gho.replace.q': ['Заменить открытый проект?', 'Replace the open project?'],
  'gho.replace.t': ['Сейчас открыт проект «{0}». Он будет заменён. Если он нужен, сначала сохраните его файлом.', 'The project “{0}” is open now. It will be replaced. If you need it, save it to a file first.'],
  'gho.replace.ok': ['Заменить', 'Replace'],
  'gho.save': ['Сначала сохранить текущий файлом', 'Save the current one to a file first'],
  'gho.opened': ['Открыто с GitHub: {0}. Это копия, правки в репозиторий не уходят.', 'Opened from GitHub: {0}. It is a copy: edits do not go to the repository.'],
  'gho.copy': ['Ссылка для открытия', 'Link to open it'],
  'gho.copy.h': ['Скопировать ссылку на программу, по которой эта новелла откроется сразу', 'Copy a link to the app that opens this novel at once'],
  'gho.copied': ['Ссылка скопирована', 'Link copied'],
  'gho.panel.h': ['Открыть новеллу по ссылке', 'Open a novel by link'],
  'gho.panel.t': ['Чужая или своя новелла из репозитория: вставьте ссылку, программа найдёт файл проекта.', 'Someone else’s or your own novel from a repository: paste a link and the program finds the project file.'],
});

const LS_GHR = 'vnmap.gh.recent';
const GHO_MAX = 30 * 1024 * 1024;

/** Разбор ссылки. { repo, kind: 'repo'|'file'|'dir', segs (ветка и путь вместе, если их надо разделить), branch, path } или null. */
function ghParseLink(s) {
  s = String(s || '').trim().replace(/^<|>$/g, '').replace(/^["'«]|["'»]$/g, '');
  if (!s) return null;
  const hm = /[#?&]gh=([^&#\s]+)/.exec(s); if (hm) { try { s = decodeURIComponent(hm[1]); } catch (e) { s = hm[1]; } }
  const dec = x => { try { return decodeURIComponent(x); } catch (e) { return x; } };
  let m = /^(?:https?:\/\/)?(?:www\.)?raw\.githubusercontent\.com\/([^/\s]+)\/([^/\s]+)\/([^?#\s]+)/i.exec(s);
  if (m && ghRepoNorm(m[1] + '/' + m[2])) return { repo: m[1] + '/' + m[2], kind: 'file', segs: dec(m[3]).split('/').filter(Boolean), branch: '', path: '' };
  m = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+?)(?:\.git)?(?:\/(blob|tree|raw|blame)\/([^?#\s]+))?\/?(?:[?#].*)?$/i.exec(s);
  if (m && ghRepoNorm(m[1] + '/' + m[2])) {
    const segs = m[4] ? dec(m[4]).split('/').filter(Boolean) : [];
    return { repo: m[1] + '/' + m[2], kind: !m[3] ? 'repo' : m[3].toLowerCase() === 'tree' ? 'dir' : 'file', segs: segs.length ? segs : null, branch: '', path: '' };
  }
  m = /^([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([\w.-]{1,100}?)(?:\.git)?(?:@([^:\s]+))?(?::(\S.*))?$/.exec(s);
  if (m && !/^https?$/i.test(m[1])) return { repo: m[1] + '/' + m[2], kind: m[4] ? 'file' : 'repo', segs: null, branch: m[3] || '', path: (m[4] || '').replace(/^\/+/, '') };
  return null;
}

/** Сведения о репозитории: { priv, branch, push }. Работает и без токена (публичный репозиторий). */
async function ghRepoInfo(repo) {
  const r = await ghReq('GET', '/repos/' + repo);
  if (r.status === 404) throw ghFail('not_found', t(GHS.st.hasToken ? 'gho.err.priv' : 'gho.err.anon'));
  if (r.status !== 200) throw ghStatusErr(r);
  const j = ghParse(r.text) || {};
  return { priv: !!j.private, branch: j.default_branch || '', push: j.permissions ? j.permissions.push !== false : false };
}
/** Ветка и путь, склеенные в одну строку ссылки (blob/ветка/путь), делим пробой: ветка может содержать «/». */
async function ghSplitSegs(repo, segs, kind) {
  for (let k = 1; k <= Math.min(segs.length, 4); k++) {
    const ref = segs.slice(0, k).join('/'), path = segs.slice(k).join('/');
    const r = await ghReq('GET', '/repos/' + repo + '/contents' + (path ? '/' + ghEnc(path) : '') + '?ref=' + encodeURIComponent(ref));
    if (r.status === 200) return { ref, path };
    if (r.status !== 404) throw ghStatusErr(r);
  }
  throw ghFail('not_found', t(GHS.st.hasToken ? 'gho.err.priv' : 'gho.err.anon'));
}
/** Файлы проекта в репозитории: [{ path, size }]. Сначала *.vnmap.json, потом json с похожим названием. */
async function ghFindProjects(repo, ref, dir) {
  const r = await ghReq('GET', '/repos/' + repo + '/git/trees/' + encodeURIComponent(ref) + '?recursive=1');
  if (r.status === 409) throw ghFail('not_found', t('gho.err.empty'));
  if (r.status === 404) throw ghFail('not_found', t('gho.err.priv'));
  if (r.status !== 200) throw ghStatusErr(r);
  const j = ghParse(r.text) || {};
  let list = (j.tree || []).filter(x => x.type === 'blob' && /\.json$/i.test(x.path) && (!dir || x.path.startsWith(dir + '/')));
  let c = list.filter(x => /\.vnmap\.json$/i.test(x.path));
  if (!c.length) c = list.filter(x => /(^|\/)(project|novel|novella|vnmap|карта)[^/]*\.json$/i.test(x.path));
  c.sort((a, b) => a.path.split('/').length - b.path.split('/').length || a.path.localeCompare(b.path));
  return { items: c.map(x => ({ path: x.path, size: x.size || 0 })), truncated: !!j.truncated };
}
/** Что нашлось по ссылке: { repo, info, ref, cands:[{path,size}] }. */
async function ghLookup(link) {
  const L = typeof link === 'string' ? ghParseLink(link) : link;
  if (!L) throw ghFail('bad_request', t('gho.err.link'));
  const info = await ghRepoInfo(L.repo);
  let ref = L.branch, path = L.path, dir = '';
  if (L.segs) { const sp = await ghSplitSegs(L.repo, L.segs, L.kind); ref = sp.ref; if (L.kind === 'file') path = sp.path; else dir = sp.path; }
  ref = ref || info.branch;
  if (path) return { repo: L.repo, info, ref, cands: [{ path, size: 0 }] };
  const f = await ghFindProjects(L.repo, ref, dir);
  if (!f.items.length) throw ghFail('not_found', t(f.truncated ? 'gho.err.trunc' : 'gho.err.none'));
  return { repo: L.repo, info, ref, cands: f.items };
}
/** Скачать и проверить файл проекта: { text, sha, summary }. */
async function ghFetchProject(repo, ref, path, size) {
  if (size > GHO_MAX) throw ghFail('too_big', t('gho.err.big', humanSize(size)));
  const f = await ghGetFile({ repo, path, branch: ref });
  if (!f.exists) throw ghFail('not_found', t(GHS.st.hasToken ? 'gho.err.priv' : 'gho.err.anon'));
  let p; try { p = JSON.parse(f.text); } catch (e) { throw ghFail('bad_file', t('gh.err.broken')); }
  if (!p || !Array.isArray(p.nodes)) throw ghFail('bad_file', t('gho.err.notproj'));
  const nodes = p.nodes.filter(n => n && n.type !== 'note');
  const files = nodes.reduce((s, n) => s + (Array.isArray(n.files) ? n.files.length : 0), 0);
  const assets = (Array.isArray(p.assets) ? p.assets : []).reduce((s, a) => s + Object.values((a && a.files) || {}).filter(x => x && x.bid).length, 0);
  return { text: f.text, sha: f.sha, summary: { name: String(p.name || path), blocks: nodes.length, chapters: files, chars: Array.isArray(p.characters) ? p.characters.length : 0, assets, uid: p.uid || '' } };
}
const ghRecent = () => { try { const j = JSON.parse(lsGet(LS_GHR) || '[]'); return Array.isArray(j) ? j.filter(x => x && x.repo).slice(0, 5) : []; } catch (e) { return []; } };
function ghRemember(e) { const l = [e].concat(ghRecent().filter(x => !(x.repo === e.repo && x.path === e.path && x.ref === e.ref))).slice(0, 5); lsSet(LS_GHR, JSON.stringify(l)); }

const ghoFromLauncher = () => typeof LCH !== 'undefined' && !!LCH;
/** Открыть найденный проект копией (без связи с репозиторием). */
async function ghOpenCopy(src) {
  if (ghoFromLauncher()) { if (!(await deskLeaveCurrent())) return false; }                // со стартового экрана: сначала записать или отбросить текущий проект
  else if (P.nodes.length && !(await confirmDlg({ title: t('gho.replace.q'), text: t('gho.replace.t', P.name || '—'), ok: t('gho.replace.ok'), danger: true }))) return false;
  const np = normalize(JSON.parse(src.text));
  setProject(np); fitAll(false);
  if (typeof closeLauncher === 'function') closeLauncher();
  toast(t('gho.opened', src.repo + '/' + src.path), 6500);
  return true;
}
const ghOpenLinkFor = m => {
  const base = location.href.split('#')[0].split('?')[0];
  return base + '#gh=' + encodeURIComponent(m.repo + (m.branch ? '@' + m.branch : '') + ':' + m.path);
};

/* ---------- окно ---------- */
function openFromGithub(o = {}) {
  closePopover();
  const st = { link: o.link || '', busy: false, err: '', look: null, pick: '', src: null, loading: false };
  openModal({
    cls: 'dlg wide gho-dlg',
    build: m => {
      const box = h('div');
      const guard = async fn => { st.busy = true; st.err = ''; paint(); try { await fn(); } catch (e) { st.err = ghErrInfo(e).msg; } st.busy = false; paint(); };
      const choose = async (path, size) => {
        st.pick = path; st.src = null; st.loading = true; st.err = ''; paint();
        try { const r = await ghFetchProject(st.look.repo, st.look.ref, path, size); st.src = Object.assign(r, { repo: st.look.repo, ref: st.look.ref, path }); }
        catch (e) { st.err = ghErrInfo(e).msg; }
        st.loading = false; paint();
      };
      const find = () => guard(async () => {
        st.look = null; st.src = null; st.pick = ''; st.needLogin = false;
        let lk; try { lk = await ghLookup(st.link.trim()); } catch (e) { st.needLogin = !GHS.st.hasToken; throw e; }      // не нашли без входа: после входа поиск повторится сам
        st.look = lk;
        if (lk.cands.length === 1) await choose(lk.cands[0].path, lk.cands[0].size);
      });
      /** Вход на GitHub прямо в этом окне (стартовый экран без проекта: панели «GitHub» там не достать). */
      const loginBlock = () => {
        if (typeof ghLoginOk === 'function' && ghLoginOk()) {
          if (GHL.state === 'wait') return h('div', { class: 'gho-login', id: 'gho-login' }, ghLoginCard({ draft: {}, busy: false }, guard));
          return h('div', { class: 'gho-login', id: 'gho-login' }, h('div', { class: 'hint' }, t('gho.login.t')),
            GHL.state === 'error' ? h('div', { class: 'hint warn-t', id: 'gho-loginerr' }, ghLoginErrText()) : null,
            h('div', { class: 'row-actions left' }, h('button', { class: 'btn primary', id: 'gho-signin', disabled: st.busy, onclick: () => guard(async () => { try { await ghLoginStart(false); } catch (e) { ghLoginFail(e); } }) }, icon('github', 15), t('ghl.btn'))));
        }
        return h('div', { class: 'gho-login', id: 'gho-login' }, h('div', { class: 'hint' }, t('gho.login.web')),
          h('div', { class: 'row-actions left' }, h('button', { class: 'btn', id: 'gho-panel', onclick: () => openGhPanel() }, icon('github', 15), t('gho.login.panel'))));
      };
      const paint = () => {
        const inp = h('input', { class: 'inp mono', id: 'gho-link', spellcheck: 'false', autocomplete: 'off', placeholder: t('gho.ph'), value: st.link });
        inp.addEventListener('input', () => { st.link = inp.value; });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!st.busy) find(); } });
        const rec = ghRecent();
        const parts = [h('h3', t('gho.title')), h('p', t('gho.lead')),
          h('div', { class: 'gho-row' }, inp, h('button', { class: 'btn primary', id: 'gho-find', disabled: st.busy || st.loading, onclick: () => find() }, icon('search', 15), t('gho.find'))),
          h('div', { class: 'hint', id: 'gho-as' }, GHS.st.hasToken ? t('gho.as', GHS.st.login || '—') : t('gho.anon'))];
        if (!GHS.st.hasToken) parts.push(loginBlock());
        if (rec.length && !st.look) parts.push(h('div', { class: 'gho-rec' }, h('span', { class: 'hint' }, t('gho.recent')), ...rec.map(r => h('button', { class: 'chip', onclick: () => { st.link = r.repo + (r.ref ? '@' + r.ref : '') + ':' + r.path; find(); } }, r.repo + ' · ' + r.path.split('/').pop()))));
        if (st.busy && !st.look) parts.push(h('div', { class: 'hint', id: 'gho-wait' }, t('drive.loading')));
        if (st.err) parts.push(h('div', { class: 'gho-err', id: 'gho-err' }, icon('alert', 15), st.err));
        if (st.look && st.look.cands.length > 1) {
          parts.push(h('div', { class: 'gho-h' }, t('gho.cands', st.look.cands.length)),
            h('div', { class: 'gho-list scroll' }, st.look.cands.slice(0, 40).map(c => h('button', { class: 'gho-c' + (st.pick === c.path ? ' on' : ''), 'data-path': c.path, onclick: () => choose(c.path, c.size) },
              icon('file', 15), h('span', { class: 'mono' }, c.path), h('span', { class: 'hint' }, c.size ? humanSize(c.size) : '')))));
        }
        if (st.loading) parts.push(h('div', { class: 'hint', id: 'gho-wait' }, t('drive.loading')));
        if (st.src) {
          const s = st.src.summary, canJoin = GHS.st.hasToken && st.look.info.push;
          parts.push(h('div', { class: 'gho-sum', id: 'gho-sum' },
            h('div', { class: 'gho-sum-t' }, icon('check', 16), h('b', t('gho.sum', s.name, s.blocks, s.chapters, s.chars))),
            h('div', { class: 'hint' }, t('gho.src', st.src.repo + '/' + st.src.path, st.src.ref)),
            s.assets ? h('div', { class: 'hint' }, t('gho.sum.f', s.assets)) : null));
          const acts = [];
          acts.push(h('button', { class: 'btn primary', id: 'gho-open', 'data-tip': t('gho.open.h'), onclick: async () => { if (await ghOpenCopy(st.src)) { ghRemember({ repo: st.src.repo, ref: st.src.ref, path: st.src.path }); m.close(); } } }, icon('download', 15), t('gho.open')));
          if (canJoin) acts.push(h('button', { class: 'btn', id: 'gho-join', 'data-tip': t('gho.join.h'), onclick: () => guard(async () => { if (ghoFromLauncher() && !(await deskLeaveCurrent())) return; if (await ghJoin({ repo: st.src.repo, path: st.src.path, branch: st.src.ref })) { ghRemember({ repo: st.src.repo, ref: st.src.ref, path: st.src.path }); m.close(); if (typeof closeLauncher === 'function') closeLauncher(); } }) }, icon('fork', 15), t('gho.join')));
          parts.push(h('div', { class: 'row-actions left' }, ...acts));
          parts.push(h('div', { class: 'hint' }, t('gho.open.h')));
          if (!canJoin) parts.push(h('div', { class: 'hint' }, t('gho.join.no')));
          if (P.nodes.length) parts.push(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', id: 'gho-save', onclick: () => exportJSON() }, icon('save', 14), t('gho.save'))));
        }
        parts.push(h('div', { class: 'dlg-actions' }, h('button', { class: 'btn', id: 'gho-close', onclick: () => m.close() }, t('c.close'))));
        box.replaceChildren(...parts);
        const i2 = box.querySelector('#gho-link'); if (i2 && document.activeElement === document.body) i2.focus({ preventScroll: true });
      };
      paint();
      /* после входа окно обновляется само, а поиск, не нашедший закрытый репозиторий, повторяется */
      GHS.ghoPaint = () => { if (m.closed) { GHS.ghoPaint = null; return; } const retry = !!st.needLogin && !st.look && !!st.link.trim() && GHS.st.hasToken; paint(); if (retry && !st.busy) find(); };
      if (o.link && o.auto) find();
      return h('div', { class: 'dlg-body' }, box);
    },
    onClose: () => { GHS.ghoPaint = null; },
  });
}

/** Ссылка на программу с #gh=… : открыть окно сразу с этой новеллой. */
function ghOpenFromUrl() {
  let s = '';
  try { const q = /[#?&]gh=([^&#]+)/.exec(location.hash + location.search); if (q) s = decodeURIComponent(q[1]); } catch (e) { s = ''; }
  if (!s || !ghParseLink(s)) return;
  try { history.replaceState(null, '', location.href.split('#')[0].replace(/([?&])gh=[^&]*&?/, '$1').replace(/[?&]$/, '')); } catch (e) { /* адрес не меняем */ }
  setTimeout(() => openFromGithub({ link: s, auto: true }), 400);
}

TOOL_ITEMS.push({ id: 'ghopen', group: 'files', ic: 'github', key: 'gho.menu', kw: 'github open link repository novel открыть гитхаб ссылка репозиторий новелла', run: () => openFromGithub() });

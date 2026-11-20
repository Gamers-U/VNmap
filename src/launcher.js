'use strict';
/* ====== Стартовый экран настольной версии и обновление программы без переустановки ====== */
let LCH = null;                                     // открытый стартовый экран: { el, onKey }
const fmtBytes = n => (typeof humanSize === 'function' ? humanSize(n) : Math.round(n / 1024) + ' KB');

/** Перед заменой текущего проекта: если он не записан в файл (или есть несохранённое), предлагаем записать. true — можно продолжать. */
async function deskLeaveCurrent() {
  if (!P || !P.nodes.length) return true;
  if (UI.firstRun && !DS.path && HIST.stack.length <= 1 && !HIST.timer) return true;   // нетронутый демо-проект: терять нечего
  if (DS.path) { if (DS.dirty) await deskSave({ silent: true }); return true; } // привязан к файлу: просто дописываем
  return new Promise(res => {
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    openModal({
      cls: 'dlg wide', onClose: () => fin(false),
      build: m => h('div', { class: 'dlg-body' }, h('h3', t('lc.leave.title', P.name || t('proj.default'))), h('p', t('lc.leave.text')),
        h('div', { class: 'dlg-actions' },
          h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')),
          h('button', { class: 'btn danger-fill', onclick: () => { fin(true); m.close(); } }, t('lc.leave.drop')),
          h('button', { class: 'btn primary', onclick: async () => { const ok = await deskSave({ as: true }); if (ok) { fin(true); m.close(); } } }, icon('save', 16), t('lc.leave.save'))))
    });
  });
}

function closeLauncher() {
  if (!LCH) return;
  document.removeEventListener('keydown', LCH.onKey, true);
  LCH.el.remove(); LCH = null;
}

async function openLauncher() {
  if (!DESK || LCH) return;
  closePopover(); MODALS.slice().forEach(m => m.close());
  const root = h('div', { id: 'launcher', class: 'launcher' });
  const onKey = e => { if (e.key === 'Escape' && !MODALS.length) { e.preventDefault(); e.stopPropagation(); closeLauncher(); } };
  document.addEventListener('keydown', onKey, true);
  LCH = { el: root, onKey };
  $('#app').append(root);

  const tile = (ic, title, hint, fn, cls = '') => h('button', { class: 'lc-tile ' + cls, onclick: fn }, h('span', { class: 'lc-ti' }, icon(ic, 22)), h('span', { class: 'lc-tt' }, h('b', title), h('span', hint)));

  const act = {
    async newProject() {
      const name = await promptDlg({ title: t('lc.new.title'), label: t('lc.new.label'), value: t('proj.default'), ok: t('c.create') });
      if (!name) return;
      if (!(await deskLeaveCurrent())) return;
      const p = emptyProject(); p.name = name;
      setProject(p); fitAll(false); closeLauncher();
      const ok = await deskSave({ as: true });
      if (!ok) toast(t('lc.new.unsaved'), 5000);
    },
    async open() {
      let f; try { f = await DESK.openDialog(); } catch (e) { toast(t('imp.bad') + ' (' + deskErr(e) + ')', 4500); return; }
      if (!f) return;
      if (!(await deskLeaveCurrent())) return;
      if (await deskOpenFile(f, { noConfirm: true })) closeLauncher();
    },
    github() { openFromGithub(); },
    async demo() {
      if (!(await deskLeaveCurrent())) return;
      setProject(demoProject()); fitAll(false); closeLauncher();
    },
    async recent(r) {
      if (!r.exists) { toast(t('lc.recent.missing') + ': ' + r.path, 4000); return; }
      if (DS.path === r.path) { closeLauncher(); return; }
      const f = await DESK.readPath(r.path).catch(() => null);
      if (!f) { toast(t('lc.recent.missing') + ': ' + r.path, 4000); fillRecent(); return; }
      if (!(await deskLeaveCurrent())) return;
      if (await deskOpenFile(f, { noConfirm: true })) closeLauncher();
    },
  };

  /* текущий проект в программе */
  const files = P.nodes.reduce((s, n) => s + n.files.length, 0), blocks = P.nodes.filter(n => n.type !== 'note').length;
  const cur = h('div', { class: 'lc-card lc-cur' },
    h('div', { class: 'lc-ch' }, t('lc.cont')),
    h('div', { class: 'lc-cn' }, P.name || t('proj.default')),
    h('div', { class: 'lc-cm' }, t('lc.stats', blocks, files)),
    h('div', { class: 'lc-cm dim' }, DS.path ? icon('save', 13) : icon('alert', 13), DS.path ? t('lc.cont.file', DS.path) : t('lc.cont.app')),
    h('button', { class: 'btn primary lc-go', onclick: closeLauncher }, icon('play', 14), t('lc.cont.go')));

  /* недавние */
  const recentBox = h('div', { class: 'lc-list' });
  const recentHead = h('div', { class: 'lc-rh' }, h('b', t('lc.recent')), h('div', { class: 'grow' }));
  const fillRecent = async () => {
    let list = []; try { list = await DESK.recent(); } catch (e) { list = []; }
    if (!LCH) return;
    recentBox.replaceChildren();
    recentHead.querySelector('.lc-clear') && recentHead.querySelector('.lc-clear').remove();
    if (!list.length) { recentBox.append(h('div', { class: 'lc-empty' }, t('lc.recent.empty'))); return; }
    recentHead.append(h('button', { class: 'btn sm lc-clear', onclick: async () => { await DESK.recentClear(); fillRecent(); } }, t('lc.recent.clear')));
    list.forEach(r => {
      const row = h('div', { class: 'lc-row' + (r.exists ? '' : ' gone') + (DS.path === r.path ? ' now' : ''), 'data-path': r.path, tabindex: '0',
        onclick: ev => { if (ev.target.closest('.lc-x')) return; act.recent(r); },
        onkeydown: ev => { if (ev.key === 'Enter') act.recent(r); } },
        h('span', { class: 'lc-ri' }, icon('file', 18)),
        h('span', { class: 'lc-rt' }, h('b', r.name), h('span', { class: 'lc-rp', 'data-tip': r.path }, r.dir),
          h('span', { class: 'lc-rm' }, r.exists ? t('lc.edited', ago(r.mtime || r.time)) + ' · ' + fmtBytes(r.size) : t('lc.recent.missing'))),
        h('button', { class: 'btn icon sm lc-x', 'data-tip': t('lc.recent.forget'), onclick: async () => { await DESK.recentForget(r.path); fillRecent(); } }, icon('x', 14)));
      recentBox.append(row);
    });
  };

  /* подвал: версия, «Обновить», показ при запуске */
  const showSw = switchEl(S.launcher !== false, v => { S.launcher = v; saveSettings(); }, t('lc.show'));
  const foot = h('div', { class: 'lc-foot' },
    h('button', { class: 'btn', onclick: () => openUpdateDialog() }, icon('download', 16), t('lc.update')),
    h('span', { class: 'lc-ver' }, t('lc.build', APP_VERSION && APP_VERSION.charAt(0) !== '/' ? APP_VERSION : APP_BUILD)),
    h('div', { class: 'grow' }), showSw);

  root.append(h('div', { class: 'lc-wrap' },
    h('div', { class: 'lc-head' }, h('div', { class: 'lc-logo' }, icon('fork', 26, 2)), h('div', null, h('h1', t('lc.title')), h('div', { class: 'lc-sub' }, t('lc.sub'))), h('div', { class: 'grow' }),
      h('button', { class: 'btn icon', 'data-tip': t('c.close') + ' (Esc)', onclick: closeLauncher }, icon('x', 18))),
    h('div', { class: 'lc-left' },
      h('div', { class: 'lc-tiles' },
        tile('filePlus', t('lc.new'), t('lc.new.h'), act.newProject, 'primary'),
        tile('folder', t('lc.open'), t('lc.open.h'), act.open),
        tile('github', t('lc.gh'), t('lc.gh.h'), act.github, 'lc-gh'),
        tile('book', t('lc.demo'), t('lc.demo.h'), act.demo)),
      cur),
    h('div', { class: 'lc-right' }, recentHead, recentBox),
    foot));
  fillRecent();
  setTimeout(() => { const b = root.querySelector('.lc-tile.primary'); if (b) b.focus(); }, 40);
}

/* ---------- обновление программы ---------- */
function updWhen(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
function updShort(hex) { return String(hex || '').slice(0, 16); }

/* ---------- проверка обновлений на GitHub ----------
   Берём последний выпуск (Releases) репозитория; запасной путь — файл update.json в корне репозитория.
   Скачивание и проверку файла делает оболочка (окно программы само в сеть не ходит), поэтому менять оболочку не нужно. */
const UPDATE_REPO_DEFAULT = 'Gamers-U/VNmap';        // «владелец/репозиторий» по умолчанию; в окне обновления его можно поменять
const UPD = { cand: null, avail: null, busy: false, shell: null };
function updRepoNorm(x) {
  const m = /^(?:https?:\/\/github\.com\/)?([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([\w.-]{1,100}?)(?:\.git)?\/?$/.exec(String(x || '').trim());
  return m ? m[1] + '/' + m[2] : '';
}
const updRepo = () => (String(S.updRepo || '').trim() ? updRepoNorm(S.updRepo) : updRepoNorm(UPDATE_REPO_DEFAULT));   // пусто — репозиторий по умолчанию; непонятный текст — ошибка, а не молчаливая подмена
/** Спрашивает GitHub о новой версии. Возвращает кандидата (его можно сразу устанавливать) или бросает ошибку. */
async function updCheck() {
  const repo = updRepo();
  if (!DESK || !DESK.update) throw new Error(t('upd.noshell'));
  if (!repo) throw new Error(t('upd.gh.bad'));
  let c = null, first = null;
  for (const u of ['https://github.com/' + repo, 'https://raw.githubusercontent.com/' + repo + '/HEAD/update.json']) {
    try { c = await DESK.update.fromUrl(u, ''); break; } catch (e) { if (!first) first = e; }
  }
  if (!c) throw first;
  S.updChecked = Date.now(); saveSettings();
  UPD.cand = c; UPD.avail = c.cmp > 0 && !c.needsShell ? c : null;
  if (typeof updateStatus === 'function') updateStatus();
  return c;
}
/** При запуске: тихая проверка, не чаще раза в 6 часов; сбои (нет сети, нет выпуска) пользователю не показываем. */
function updAutoStart() {
  if (!DESK || !DESK.update || S.updAuto === false || !updRepo()) return;
  if (Date.now() - (+S.updChecked || 0) < 6 * 3600e3) return;
  setTimeout(() => {
    updCheck().then(c => {
      if (UPD.avail && UPD.avail.build !== S.updSeen) { S.updSeen = UPD.avail.build; saveSettings(); toast(t('upd.toast', UPD.avail.build), 7000); }
    }).catch(() => { });
  }, 6000);
}
function updChip() {
  if (!UPD.avail && !UPD.shell) return null;
  return h('button', { class: 'btn stat warn upd-chip', 'data-tip': t('upd.chip.tip'), onclick: () => openUpdateDialog() }, icon('download', 15), UPD.avail ? t('upd.chip', UPD.avail.build) : t('upd.su.chip', UPD.shell.latest));
}
function openUpdateDialog() {
  if (!DESK || !DESK.update) { toast(t('upd.noshell'), 5000); return; }
  MODALS.filter(m => m.tag === 'update').forEach(m => m.close());
  const st = { info: null, cand: null, busy: false, err: '', url: '', sha: '', msg: '', plan: null, perr: '', serr: '', probing: false, going: false, stage: '', seen: '', suMsg: '', suProg: null };
  const m = openModal({
    cls: 'upd-m', build: m => {
      const body = h('div', { class: 'm-pad upd' });
      const render = () => {
        const I = st.info;
        body.replaceChildren();
        if (!I) { body.append(h('div', { class: 'hint' }, t('upd.loading'))); return; }
        const act = I.active;
        /* что сейчас установлено */
        body.append(h('div', { class: 'upd-cur' },
          h('div', { class: 'upd-row' }, h('span', { class: 'upd-k' }, t('upd.ui')), h('b', APP_VERSION && APP_VERSION.charAt(0) !== '/' ? t('upd.build', APP_VERSION, APP_BUILD) : t('upd.build.nov', APP_BUILD)),
            h('span', { class: 'upd-badge' + (act ? ' on' : '') }, act ? t('upd.src.upd', updWhen(act.time)) : t('upd.src.bundled'))),
          h('div', { class: 'upd-row' }, h('span', { class: 'upd-k' }, t('upd.shell')), h('span', t('upd.shell.v', I.shell, I.electron)))));
        /* одна кнопка «Обновить»: проверяет страницу и оболочку, ставит, что нужно */
        body.append(updMainBlock(st, guard, render));
        /* способы обновить */
        body.append(h('details', { class: 'upd-other', open: !updRepo() }, h('summary', t('upd.other')), h('div', { class: 'upd-sec' },
          h('div', { class: 'upd-h' }, t('upd.how')),
          h('div', { class: 'hint' }, t('upd.how.h')),
          h('div', { class: 'row-actions left' }, h('button', { class: 'btn primary', disabled: st.busy, onclick: pickFile }, icon('upload', 16), t('upd.pick'))),
          h('div', { class: 'upd-or' }, t('upd.or')),
          (() => {
            const url = h('input', { class: 'inp mono', type: 'text', placeholder: 'https://…/vnmap-update.zip  |  https://github.com/автор/репозиторий', value: st.url || I.url || '', spellcheck: 'false' });
            const sha = h('input', { class: 'inp mono sm', type: 'text', placeholder: t('upd.sha.ph'), value: st.sha, spellcheck: 'false' });
            url.addEventListener('input', () => { st.url = url.value; }); sha.addEventListener('input', () => { st.sha = sha.value; });
            url.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fromUrl(); } });
            return h('div', { class: 'upd-url' }, url, h('details', { class: 'upd-more' }, h('summary', t('upd.sha')), sha),
              h('div', { class: 'row-actions left' }, h('button', { class: 'btn', disabled: st.busy, onclick: fromUrl }, icon('download', 16), t('upd.fetch'))));
          })())));
        if (st.busy && !st.going) body.append(h('div', { class: 'upd-busy' }, h('span', { class: 'spin' }), t('upd.busy')));
        if (st.err) body.append(h('div', { class: 'upd-err' }, icon('alert', 16), h('span', st.err)));
        /* найденное обновление */
        const c = st.cand;
        if (c) {
          const lab = c.cmp > 0 ? t('upd.cmp.new') : c.cmp === 0 ? t('upd.cmp.same') : t('upd.cmp.old');
          body.append(h('div', { class: 'upd-cand' },
            h('div', { class: 'upd-row' }, h('b', c.version ? t('upd.found', c.version) + ' (' + c.build + ')' : t('upd.found.nov', c.build)), h('span', { class: 'upd-badge ' + (c.cmp > 0 ? 'on' : 'warn') }, lab)),
            h('div', { class: 'hint' }, t('upd.cand.meta', fmtBytes(c.size), c.source, updShort(c.sha256))),
            c.needsShell ? h('div', { class: 'upd-err' }, icon('alert', 16), h('span', t('upd.needs'))) : null,
            h('div', { class: 'upd-warn' }, icon('alert', 16), h('span', t('upd.warn'))),
            h('div', { class: 'row-actions' }, h('div', { class: 'grow' }),
              h('button', { class: 'btn', onclick: () => { st.cand = null; render(); } }, t('c.cancel')),
              h('button', { class: 'btn primary', disabled: st.busy || c.needsShell, onclick: apply }, icon('check', 16), c.cmp > 0 ? t('upd.install') : c.cmp === 0 ? t('upd.reinstall') : t('upd.downgrade')))));
        }
        /* откат */
        if (act) body.append(h('div', { class: 'upd-sec' }, h('div', { class: 'upd-h' }, t('upd.rollback')), h('div', { class: 'hint' }, t('upd.rollback.h')),
          h('div', { class: 'row-actions left' }, h('button', { class: 'btn', disabled: st.busy, onclick: reset }, icon('reverse', 16), t('upd.reset')))));
      };
      const guard = async fn => { st.busy = true; st.err = ''; render(); try { await fn(); } catch (e) { st.err = deskErr(e); } st.busy = false; render(); };
      const pickFile = () => guard(async () => { const c = await DESK.update.pickFile(); if (c) st.cand = c; });
      const fromUrl = () => guard(async () => { if (!st.url.trim()) throw new Error(t('upd.url.empty')); st.cand = await DESK.update.fromUrl(st.url.trim(), st.sha.trim()); });
      const apply = () => guard(async () => {
        /* всё несохранённое записываем до перезагрузки страницы */
        if (DS.path && DS.dirty) await deskSave({ silent: true });
        flushHistory(); saveNow();
        await DESK.update.apply(st.cand.token);
        toast(t('upd.restarting'), 6000);
      });
      const reset = async () => {
        if (!(await confirmDlg({ title: t('upd.reset.q'), text: t('upd.reset.t'), ok: t('upd.reset') }))) return;
        guard(async () => { flushHistory(); saveNow(); if (DS.path && DS.dirty) await deskSave({ silent: true }); await DESK.update.reset(); });
      };
      DESK.update.info().then(i => { st.info = i; render(); updProbe(st, render); }).catch(e => { st.err = deskErr(e); st.info = { active: null, shell: '?', electron: '?', url: '' }; render(); });
      render();
      return h('div', { class: 'm-wrap' }, modalHead(t('upd.title'), m), body);
    }
  });
  m.tag = 'update';
  return m;
}

/** Что рассказать после запуска: обновление применено, откат, возврат к встроенной. */
function deskNotice(n) {
  if (!n) return;
  if (n.updated) toast(t('upd.done', n.updated), 7000);
  else if (n.reset) toast(t('upd.reset.done'), 6000);
  else if (n.rolledBack) toast(t('upd.rolledback', n.rolledBack), 12000);
}

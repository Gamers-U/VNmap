'use strict';
/* ====== Обновление программы одной кнопкой «Обновить» ======
   Кнопка сама спрашивает GitHub и про страницу (то, что видно в окне), и про оболочку (само установленное окно программы):
   · вышла новая оболочка → ставится она: в установщике уже лежит свежая страница, второй шаг не нужен;
   · оболочка не менялась → обновляется только страница, оболочка остаётся прежней.
   Оболочка скачивает установщик с проверкой SHA-256 и ставит его, адрес зашит в ней. */

Object.assign(D, {
  'upd.main.h': ['Обновление', 'Update'],
  'upd.go': ['Обновить', 'Update'],
  'upd.go.h': ['Одна кнопка обновляет всё. Она сама проверяет, что вышло: если нужна новая оболочка (само окно программы), берёт и её, если нет, остаётся на прежней и меняет только версию страницы.', 'One button updates everything. It checks what is out by itself: if a new shell (the program window itself) is needed it takes that too, otherwise it keeps the old shell and changes only the page version.'],
  'upd.st.check': ['Проверяю, что вышло…', 'Checking what is out…'],
  'upd.st.shell': ['Скачиваю новую оболочку…', 'Downloading the new shell…'],
  'upd.st.page': ['Ставлю новую версию…', 'Installing the new version…'],
  'upd.plan.page': ['Вышла версия {0} (сейчас {1}). Оболочка в ней не изменилась, поэтому обновится только страница: окно перезагрузится за пару секунд, проекты не затрагиваются.', 'Version {0} is out (you have {1}). The shell did not change in it, so only the page is updated: the window reloads in a couple of seconds, projects are not touched.'],
  'upd.plan.shell': ['Вышла версия {0}, и в ней новая оболочка.', 'Version {0} is out and it comes with a new shell.'],
  'upd.plan.shell.in': ['Свежая страница уже внутри: отдельно версию обновлять не нужно.', 'The fresh page is already inside: there is no need to update the version separately.'],
  'upd.plan.page.too': ['Версия страницы обновится сразу, не дожидаясь замены файла.', 'The page version is updated right away, without waiting for the file to be replaced.'],
  'upd.res.latest': ['У вас всё последнее: версия {0}.', 'You have the latest: version {0}.'],
  'upd.su.fail': ['Оболочку проверить не удалось: {0}', 'Could not check the shell: {0}'],
  'upd.su.cur': ['Установлена версия {0}', 'Installed version {0}'],
  'upd.su.how.installer': ['Программа скачает установщик, проверит его контрольную сумму, закроется, поставит новую версию и откроется снова. Проекты и настройки сохранятся.', 'The program downloads the installer, checks its checksum, closes, installs the new version and opens again. Projects and settings are kept.'],
  'upd.su.how.appimage': ['Программа скачает новый файл, проверит его контрольную сумму, заменит себя им и откроется снова. Проекты и настройки сохранятся.', 'The program downloads the new file, checks its checksum, replaces itself with it and opens again. Projects and settings are kept.'],
  'upd.su.how.portable': ['Версия без установки не может заменить сама себя. Новый файл скачается в «Загрузки» — замените им старый.', 'The portable version cannot replace itself. The new file is downloaded to Downloads — replace the old one with it.'],
  'upd.su.how.dmg': ['На macOS программа не может заменить себя без платной подписи Apple. Скачается образ .dmg: откройте его и перетащите программу в «Программы».', 'On macOS the program cannot replace itself without a paid Apple signature. A .dmg image is downloaded: open it and drag the program to Applications.'],
  'upd.su.how.manual': ['Здесь программа не может поставить себя сама. Файл скачается в «Загрузки» — запустите его.', 'The program cannot install itself here. The file is downloaded to Downloads — run it.'],
  'upd.su.how.none': ['Для вашей системы готового файла в выпуске нет. Откройте страницу выпуска и скачайте нужный вручную.', 'The release has no ready file for your system. Open the release page and download one by hand.'],
  'upd.su.dl': ['Скачиваю: {0} из {1}', 'Downloading: {0} of {1}'],
  'upd.su.ask': ['Установить версию {0}?', 'Install version {0}?'],
  'upd.su.ask.t': ['Программа закроется, поставит новую версию и откроется снова. Всё несохранённое будет записано до закрытия.', 'The program will close, install the new version and open again. Anything unsaved is written first.'],
  'upd.su.ask.ok': ['Установить и перезапустить', 'Install and restart'],
  'upd.su.restart': ['Закрываюсь, чтобы поставить новую версию…', 'Closing to install the new version…'],
  'upd.su.saved': ['Файл скачан: {0}. Он показан в папке.', 'The file is downloaded: {0}. It is shown in its folder.'],
  'upd.su.filenote': ['Новый файл программы лежит в «Загрузки»: {0}. Замените им старый.', 'The new program file is in Downloads: {0}. Replace the old one with it.'],
  'upd.su.release': ['Страница выпуска', 'Release page'],
  'upd.su.old': ['Эта оболочка ещё не умеет обновляться сама. Один раз скачайте установщик и поставьте поверх: дальше обновления пойдут одной кнопкой «Обновить».', 'This shell cannot update itself yet. Download the installer once and install it over the old one: after that updates come with the single “Update” button.'],
  'upd.su.chip': ['Оболочка {0}', 'Shell {0}'],
  'upd.su.stale': ['Окно вашей программы старее страницы: системные кнопки и верхняя полоска зависят от оболочки, а она осталась от первой установки. Кнопка «Обновить» заменит и её.', 'The window of your installed program is older than the page: the system buttons and the top strip depend on the shell, which stayed as it was installed. The “Update” button replaces it too.'],
  'upd.su.stale.toast': ['Оболочка программы старая ({0}): окно показывает системные кнопки и полоска не прячется. Нажмите на значок обновления внизу и «Обновить».', 'The program shell is old ({0}): the window shows system buttons and the strip does not hide. Click the update badge at the bottom and “Update”.'],
  'upd.su.toast': ['Вышла новая оболочка {0}: нажмите на значок обновления внизу и «Обновить».', 'A new shell {0} is out: click the update badge at the bottom and “Update”.'],
  'su.e.su-net': ['Нет связи с GitHub. Проверьте интернет.', 'Cannot reach GitHub. Check your internet.'],
  'su.e.su-http': ['GitHub не отдал файл. Попробуйте позже.', 'GitHub did not return the file. Try again later.'],
  'su.e.su-timeout': ['GitHub долго не отвечает. Попробуйте позже.', 'GitHub is not answering. Try again later.'],
  'su.e.su-norelease': ['В репозитории нет выпусков.', 'The repository has no releases.'],
  'su.e.su-noasset': ['В последнем выпуске нет файла для вашей системы.', 'The latest release has no file for your system.'],
  'su.e.su-hash': ['Контрольная сумма не сошлась: файл повреждён или подменён. Установка отменена.', 'The checksum does not match: the file is damaged or was replaced. Installation cancelled.'],
  'su.e.su-size': ['Файл скачался не полностью или не того размера. Установка отменена.', 'The file was not downloaded fully or has the wrong size. Installation cancelled.'],
  'su.e.su-toobig': ['Файл слишком большой. Установка отменена.', 'The file is too large. Installation cancelled.'],
  'su.e.su-busy': ['Скачивание уже идёт.', 'A download is already running.'],
  'su.e.su-badfile': ['Недопустимый файл. Установка отменена.', 'Invalid file. Installation cancelled.'],
});

/** Оболочка старее, чем нужно странице: правки окна внутри одной линии (1.7.x) приходят только с новой оболочкой, а страница обновляется и без неё. */
function shellStale(cur) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(cur || '')), v = /^(\d+)\.(\d+)\.(\d+)/.exec(typeof APP_VERSION === 'string' ? APP_VERSION : '');
  if (!m || !v || !SHELL_REV) return false;
  if (+m[1] !== +v[1]) return +m[1] < +v[1];
  if (+m[2] !== +v[2]) return +m[2] < +v[2];
  return +m[3] < SHELL_REV;
}
/** Есть ли что предложить для оболочки: новая линия или оболочка старее, чем нужно странице. */
const suNew = c => !!c && !!(c.newLine || (c.newer && shellStale(c.current)));

const suErr = e => {
  const m = String((e && e.message) || e || '').replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
  return D['su.e.' + m] ? t('su.e.' + m) : m;
};

const updVer = () => (APP_VERSION && APP_VERSION.charAt(0) !== '/' ? APP_VERSION : APP_BUILD);
const suHow = mode => t('upd.su.how.' + (mode === 'installer' || mode === 'appimage' || mode === 'portable' || mode === 'dmg' || mode === 'none' ? mode : 'manual'));

/** Что сделает кнопка «Обновить». pg — страница-кандидат (updCheck), su — ответ оболочки на вопрос о выпуске. */
function updPlan(pg, su) {
  const pgNew = !!pg && pg.cmp > 0 && !pg.needsShell;                                   // свежая страница, которую можно поставить под этой оболочкой
  const shNew = suNew(su) || (!!pg && !!pg.needsShell && !!su && !!su.newer);           // страница просит оболочку новее — оболочка нужна
  const mode = su ? su.mode : 'none';
  const shAuto = shNew && (mode === 'installer' || mode === 'appimage');               // оболочка ставит себя сама: свежая страница приходит внутри
  const shFile = shNew && (mode === 'portable' || mode === 'dmg' || mode === 'manual'); // файл только скачивается, замену делает человек
  const shNone = shNew && !shAuto && !shFile;                                           // для этой системы файла нет
  return { pg, su, pgNew, shNew, shAuto, shFile, shNone, doPage: pgNew && !shAuto, blocked: !!pg && !!pg.needsShell && !shAuto, any: shAuto || shFile || pgNew };
}
/** Спрашивает GitHub про страницу и про оболочку сразу. Сбой одной из проверок не мешает другой. */
async function updCheckBoth() {
  let pgErr = null, shErr = null;
  const [pg, su] = await Promise.all([
    updCheck().catch(e => { pgErr = e; return null; }),
    DESK && DESK.shellUpdate ? DESK.shellUpdate.check().catch(e => { shErr = e; return null; }) : Promise.resolve(null)]);
  UPD.shell = suNew(su) ? su : null;
  if (typeof updateStatus === 'function') updateStatus();
  return { pg, su, pgErr, suErr: shErr };
}
/** Тихая проверка при открытии окна: показывает, что именно сделает кнопка. */
async function updProbe(st, render) {
  if (!DESK || !DESK.update) return;
  st.probing = true; st.perr = ''; render();
  try {
    const r = await updCheckBoth();
    if (!r.pg && !r.su) { st.plan = null; st.perr = deskErr(r.pgErr || r.suErr); st.serr = ''; }
    else { st.plan = updPlan(r.pg, r.su); st.seen = st.plan.shAuto ? r.su.latest : ''; st.perr = !r.pg && r.pgErr ? deskErr(r.pgErr) : ''; st.serr = !r.su && r.suErr && DESK.shellUpdate ? suErr(r.suErr) : ''; }
  } catch (e) { st.perr = deskErr(e); }
  st.probing = false; render();
}

/** Главный блок окна обновления: пояснение, поле репозитория и одна кнопка «Обновить». */
function updMainBlock(st, guard, render) {
  const go = () => updGo(st, guard, render);
  const box = h('div', { class: 'upd-sec upd-gh upd-main' }, h('div', { class: 'upd-h' }, t('upd.main.h')), h('div', { class: 'hint' }, t('upd.go.h')));
  const p = st.plan;
  if (st.probing && !p) box.append(h('div', { class: 'upd-busy' }, h('span', { class: 'spin' }), t('upd.st.check')));
  if (p) {
    const box2 = h('div', { class: 'upd-plan' });
    const ver = p.shNew ? p.su.latest : (p.pg && (p.pg.version || p.pg.build));
    if (p.shNew) {
      box2.append(h('div', { class: 'upd-row' }, h('b', t('upd.plan.shell', p.su.latest)), h('span', { class: 'upd-badge on' }, t('upd.su.cur', p.su.current))),
        h('div', { class: 'hint' }, suHow(p.su.mode) + (p.shAuto ? ' ' + t('upd.plan.shell.in') : p.doPage ? ' ' + t('upd.plan.page.too') : '')),
        !p.su.newLine ? h('div', { class: 'hint' }, icon('info', 14), ' ', t('upd.su.stale')) : null);
      if (p.shNone && !p.doPage && typeof ghShellButtons === 'function') box2.append(ghShellButtons());
    }
    if (p.doPage && !p.shNew) box2.append(h('div', { class: 'upd-row' }, h('b', t('upd.plan.page', ver, updVer()))));
    if (p.blocked) box2.append(h('div', { class: 'upd-err' }, icon('alert', 16), h('span', t('upd.needs'))));
    if (!p.any && !p.shNone && !p.blocked && !st.perr) box2.append(h('div', { class: 'hint upd-ok' }, icon('check', 14), ' ', t('upd.res.latest', updVer())));
    box.append(box2);
  }
  if (st.perr) box.append(h('div', { class: 'hint' }, t('upd.gh.fail', st.perr)));
  if (st.serr) box.append(h('div', { class: 'hint' }, t('upd.su.fail', st.serr)));
  if (!DESK.shellUpdate) box.append(h('div', { class: 'upd-err' }, icon('alert', 16), h('span', t('upd.su.old'))), typeof ghShellButtons === 'function' ? ghShellButtons() : null);
  const repo = h('input', { class: 'inp mono', type: 'text', placeholder: t('upd.gh.ph'), value: S.updRepo || UPDATE_REPO_DEFAULT, spellcheck: 'false', id: 'upd-repo' });
  repo.addEventListener('input', () => { S.updRepo = repo.value.trim(); saveSettings(); });
  repo.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  const auto = h('input', { type: 'checkbox', checked: S.updAuto !== false, id: 'upd-auto' });
  auto.addEventListener('change', () => { S.updAuto = auto.checked; saveSettings(); });
  box.append(h('div', { class: 'upd-url' }, repo, h('label', { class: 'upd-chk' }, auto, h('span', t('upd.gh.auto')))));
  if (st.stage) box.append(h('div', { class: 'upd-busy' }, h('span', { class: 'spin' }), st.stage));
  if (st.suProg) box.append(h('div', { class: 'upd-busy' }, h('span', { class: 'spin' }), t('upd.su.dl', fmtBytes(st.suProg.got), st.suProg.total ? fmtBytes(st.suProg.total) : '?')));
  if (st.suMsg) box.append(h('div', { class: 'hint upd-ok' }, icon('check', 14), ' ', st.suMsg));
  if (st.msg) box.append(h('div', { class: 'hint upd-ok' }, icon('check', 14), ' ', st.msg));
  const acts = h('div', { class: 'row-actions left' }, h('button', { class: 'btn primary', disabled: st.busy, onclick: go, id: 'upd-go' }, icon('download', 16), t('upd.go')));
  if (p && p.su && p.su.htmlUrl && p.shNew) acts.append(h('a', { class: 'btn', href: p.su.htmlUrl, target: '_blank', rel: 'noopener' }, icon('open', 15), t('upd.su.release')));
  acts.append(h('span', { class: 'hint' }, S.updChecked ? t('upd.gh.last', fmtTime(S.updChecked)) : t('upd.gh.never')));
  box.append(acts);
  return box;
}

/** Кнопка «Обновить»: проверить страницу и оболочку, взять оболочку только если она нужна, остальное доставить страницей. */
async function updGo(st, guard, render) {
  st.going = true;
  try { await updGoRun(st, guard, render); } finally { st.going = false; }
}
async function updGoRun(st, guard, render) {
  await guard(async () => {
    st.msg = ''; st.suMsg = ''; st.perr = ''; st.serr = ''; st.stage = t('upd.st.check'); render();
    let r;
    try { r = await updCheckBoth(); } finally { st.stage = ''; }
    if (!r.pg && !r.su) { st.plan = null; throw r.pgErr || r.suErr; }
    const p = st.plan = updPlan(r.pg, r.su);
    if (!r.pg && r.pgErr && !p.shAuto) throw r.pgErr;         // страницу проверить не удалось, а оболочка сама не нужна: честнее сказать об ошибке, чем «всё последнее»
    st.serr = !r.su && r.suErr && DESK.shellUpdate ? suErr(r.suErr) : '';     // оболочку спросить не вышло: скажем, но страницу обновим
    if (!p.any) return;                                                       // «всё последнее» показывает сам блок плана
    /* закрыть программу и поставить установщик — спрашиваем, если человек не видел описания этого обновления перед нажатием */
    if (p.shAuto && st.seen !== r.su.latest && !(await confirmDlg({ title: t('upd.su.ask', r.su.latest), text: t('upd.su.ask.t'), ok: t('upd.su.ask.ok') }))) return;
    /* всё несохранённое записываем до закрытия или перезагрузки окна */
    const flush = async () => { if (DS.path && DS.dirty) await deskSave({ silent: true }); flushHistory(); saveNow(); };
    let file = '';
    if (p.shAuto || p.shFile) {
      st.stage = t('upd.st.shell'); st.suProg = { got: 0, total: r.su.size || 0 };
      const off = DESK.shellUpdate.onProgress(pr => { st.suProg = pr; render(); });
      let d;
      try { d = await DESK.shellUpdate.download(); } catch (e) { st.suProg = null; st.stage = ''; off && off(); throw new Error(suErr(e)); }
      st.suProg = null; st.stage = ''; off && off();
      if (p.shAuto) {
        await flush();
        try { await DESK.shellUpdate.apply(); } catch (e) { throw new Error(suErr(e)); }
        toast(t('upd.su.restart'), 8000);
        return;
      }
      try { await DESK.shellUpdate.apply(); } catch (e) { throw new Error(suErr(e)); }     // файл показан в папке «Загрузки»
      file = d.name; st.suMsg = t('upd.su.saved', d.name);
    }
    if (p.doPage) {
      await flush();
      if (file) { S.suFile = file; saveSettings(); }      // окно перезагрузится: напомним про файл после запуска
      st.stage = t('upd.st.page');
      try { await DESK.update.apply(p.pg.token); } finally { st.stage = ''; }
      toast(t('upd.restarting'), 6000);
    }
  });
}
/** Тихая проверка при запуске: если вышла новая оболочка — подсказка в строке состояния и одно сообщение на версию. */
function updShellAuto() {
  if (!DESK || !DESK.shellUpdate) return;
  if (S.suFile) { const n = S.suFile; S.suFile = ''; saveSettings(); setTimeout(() => toast(t('upd.su.filenote', n), 15000), 3000); }   // файл новой оболочки скачан до перезагрузки окна
  if (S.updAuto === false) return;
  setTimeout(() => {
    DESK.shellUpdate.check().then(c => {
      if (!suNew(c)) return;
      UPD.shell = c;
      if (typeof updateStatus === 'function') updateStatus();
      if (UPD.avail) return;      // про новую версию уже сказано, а кнопка «Обновить» возьмёт и оболочку
      if (S.shSeen !== c.latest) { S.shSeen = c.latest; saveSettings(); toast(c.newLine ? t('upd.su.toast', c.latest) : t('upd.su.stale.toast', c.current), 12000); }
    }).catch(() => { });
  }, 9000);
}

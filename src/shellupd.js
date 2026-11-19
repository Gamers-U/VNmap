'use strict';
/* ====== Обновление самой программы (оболочки) кнопкой ======
   Страница обновляется отдельной кнопкой «Проверить обновление». Эта часть — про установленную программу:
   оболочка сама спрашивает GitHub, скачивает установщик с проверкой SHA-256 и ставит его. Адрес зашит в оболочке. */

Object.assign(D, {
  'upd.su.h': ['Оболочка', 'Shell'],
  'upd.su.t': ['Сама установленная программа: окно, меню, запуск Ren\'Py. Меняется редко, и у неё своя кнопка: версию программы можно обновл. без неё.', 'The installed program itself: window, menus, running Ren\'Py. It changes rarely and has its own button: the program version can be updated without it.'],
  'upd.su.cur': ['Установлена версия {0}', 'Installed version {0}'],
  'upd.su.check': ['Проверить оболочку', 'Check the shell'],
  'upd.su.checking': ['Спрашиваю GitHub…', 'Asking GitHub…'],
  'upd.su.latest': ['Оболочка последняя. Новые версии программы ставятся кнопкой «Обновить версию».', 'The shell is the latest. New program versions are installed with the “Update the version” button.'],
  'upd.su.pageonly': ['Вышла версия {0}, но оболочка в ней не изменилась: её обновлять не нужно, достаточно кнопки «Обновить версию».', 'Version {0} is out, but the shell did not change in it: no need to update it, the “Update the version” button is enough.'],
  'upd.su.new': ['Вышла новая оболочка: {0}', 'A new shell is out: {0}'],
  'upd.su.btn.auto': ['Обновить оболочку', 'Update the shell'],
  'upd.su.btn.manual': ['Скачать новую оболочку', 'Download the new shell'],
  'upd.su.how.installer': ['Программа скачает установщик, проверит его контрольную сумму, закроется, поставит новую версию и откроется снова. Проекты и настройки сохранятся.', 'The program downloads the installer, checks its checksum, closes, installs the new version and opens again. Projects and settings are kept.'],
  'upd.su.how.appimage': ['Программа скачает новый файл, проверит его контрольную сумму, заменит себя им и откроется снова.', 'The program downloads the new file, checks its checksum, replaces itself with it and opens again.'],
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
  'upd.su.release': ['Страница выпуска', 'Release page'],
  'upd.su.old': ['Эта оболочка ещё не умеет обновляться сама. Один раз скачайте установщик и поставьте поверх: дальше обновления пойдут кнопкой.', 'This shell cannot update itself yet. Download the installer once and install it over the old one: after that updates come with a button.'],
  'upd.su.chip': ['Оболочка {0}', 'Shell {0}'],
  'upd.su.stale': ['Окно вашей программы старее страницы: кнопка «Обновить версию» меняет только страницу, а окно с системными кнопками остаётся от первой установки. Один раз обновите оболочку, и верхняя полоска заработает как задумано.', 'The window of your installed program is older than the page: the "Update the version" button changes only the page, while the window with its system buttons stays as it was installed. Update the shell once and the top strip works as designed.'],
  'upd.su.stale.toast': ['Оболочка программы старая ({0}): окно показывает системные кнопки и полоска не прячется. Нажмите на значок обновления внизу и «Обновить оболочку».', 'The program shell is old ({0}): the window shows system buttons and the strip does not hide. Click the update badge at the bottom and "Update the shell".'],
  'upd.su.toast': ['Вышла новая оболочка {0}: нажмите на значок обновления внизу и «Обновить оболочку».', 'A new shell {0} is out: click the update badge at the bottom and “Update the shell”.'],
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

/** Оболочка старее, чем нужно странице. Кнопка «Обновить версию» меняет только страницу, поэтому правки окна внутри одной линии (1.7.x) без этой проверки до пользователя не доходили. */
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

/** Секция окна обновления. st — состояние окна, guard/render — его помощники. */
function updShellSection(st, guard, render) {
  const box = h('div', { class: 'upd-sec upd-su' }, h('div', { class: 'upd-h' }, t('upd.su.h')), h('div', { class: 'hint' }, t('upd.su.t')));
  if (!DESK || !DESK.shellUpdate) {
    box.append(h('div', { class: 'upd-err' }, icon('alert', 16), h('span', t('upd.su.old'))), typeof ghShellButtons === 'function' ? ghShellButtons() : null);
    return box;
  }
  const c = st.su;
  const how = c ? t('upd.su.how.' + (c.mode === 'none' ? 'none' : c.mode === 'portable' || c.mode === 'dmg' || c.mode === 'installer' || c.mode === 'appimage' ? c.mode : 'manual')) : '';
  const auto = c && (c.mode === 'installer' || c.mode === 'appimage');
  if (c) {
    if (suNew(c)) {
      box.append(h('div', { class: 'upd-row' }, h('b', t('upd.su.new', c.latest)), h('span', { class: 'upd-badge on' }, t('upd.su.cur', c.current))),
        !c.newLine ? h('div', { class: 'upd-err' }, icon('alert', 16), h('span', t('upd.su.stale'))) : null,
        h('div', { class: 'hint' }, how));
    } else box.append(h('div', { class: 'hint upd-ok' }, icon('check', 14), ' ', c.newer ? t('upd.su.pageonly', c.latest) : t('upd.su.latest')));
  } else box.append(h('div', { class: 'hint' }, t('upd.su.cur', st.info && st.info.shell || '?')));
  if (st.suProg) box.append(h('div', { class: 'upd-busy' }, h('span', { class: 'spin' }), t('upd.su.dl', fmtBytes(st.suProg.got), st.suProg.total ? fmtBytes(st.suProg.total) : '?')));
  if (st.suMsg) box.append(h('div', { class: 'hint upd-ok' }, icon('check', 14), ' ', st.suMsg));
  const acts = h('div', { class: 'row-actions left' });
  if (suNew(c) && c.mode !== 'none') acts.append(h('button', { class: 'btn primary', disabled: st.busy, id: 'upd-su-go', onclick: () => updShellInstall(st, guard, render) }, icon('download', 16), auto ? t('upd.su.btn.auto') : t('upd.su.btn.manual')));
  acts.append(h('button', { class: 'btn', disabled: st.busy, id: 'upd-su-check', onclick: () => guard(async () => { st.suMsg = ''; st.su = await DESK.shellUpdate.check(); UPD.shell = suNew(st.su) ? st.su : null; if (typeof updateStatus === 'function') updateStatus(); }) }, icon('refresh', 16), t('upd.su.check')));
  if (c && c.htmlUrl) acts.append(h('a', { class: 'btn', href: c.htmlUrl, target: '_blank', rel: 'noopener' }, icon('open', 15), t('upd.su.release')));
  box.append(acts);
  if (suNew(c) && c.mode === 'none' && typeof ghShellButtons === 'function') box.append(ghShellButtons());
  return box;
}
async function updShellInstall(st, guard, render) {
  const c = st.su; if (!c) return;
  const auto = c.mode === 'installer' || c.mode === 'appimage';
  if (auto && !(await confirmDlg({ title: t('upd.su.ask', c.latest), text: t('upd.su.ask.t'), ok: t('upd.su.ask.ok') }))) return;
  await guard(async () => {
    st.suMsg = ''; st.suProg = { got: 0, total: c.size || 0 };
    const off = DESK.shellUpdate.onProgress(p => { st.suProg = p; if (!st.m || !st.m.closed) render(); });
    let d;
    try { d = await DESK.shellUpdate.download(); } catch (e) { st.suProg = null; off && off(); throw new Error(suErr(e)); }
    st.suProg = null; off && off();
    /* всё несохранённое записываем до закрытия */
    if (auto) { if (DS.path && DS.dirty) await deskSave({ silent: true }); flushHistory(); saveNow(); }
    try { await DESK.shellUpdate.apply(); } catch (e) { throw new Error(suErr(e)); }
    if (auto) toast(t('upd.su.restart'), 8000); else st.suMsg = t('upd.su.saved', d.name);
  });
}
/** Тихая проверка при запуске: если вышла новая оболочка — подсказка в строке состояния и одно сообщение на версию. */
function updShellAuto() {
  if (!DESK || !DESK.shellUpdate || S.updAuto === false) return;
  setTimeout(() => {
    DESK.shellUpdate.check().then(c => {
      if (!suNew(c)) return;
      UPD.shell = c;
      if (typeof updateStatus === 'function') updateStatus();
      if (S.shSeen !== c.latest) { S.shSeen = c.latest; saveSettings(); toast(c.newLine ? t('upd.su.toast', c.latest) : t('upd.su.stale.toast', c.current), 12000); }
    }).catch(() => { });
  }, 9000);
}

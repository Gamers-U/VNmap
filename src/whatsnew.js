/* «Что нового»: короткий список изменений по версиям (с 1.7.26).
   Данные лежат в changelog.json рядом с version.json, build.py подставляет их в CHANGELOG. Запись: v (версия), d (дата ГГГГ-ММ-ДД),
   shell (для версии нужна новая оболочка), add / chg / fix — списки пар [по-русски, in English] (добавлено / изменено / исправлено).
   Три места показа:
   1) окно «История версий» (Настройки, окно обновления, Ctrl+K);
   2) при первом запуске новой версии всплывающее «Версия …: что нового» (один раз, запоминается в S.seenVer);
   3) в окне «Обновить» перед обновлением: блок «Что нового в версии …» из описания выпуска на GitHub (раздел «### Что нового» с строками
      «+ добавлено», «~ изменено», «! исправлено»; у прежних выпусков без такого раздела показываются первые пункты списка). */
const CHANGELOG = /*CHANGELOG*/[];
const WN_GROUPS = [['add', 'wn.add', 'plus'], ['chg', 'wn.chg', 'pen'], ['fix', 'wn.fix', 'check']];
const WN_SHOW = 8;                                    // сколько версий видно сразу в окне истории
let WNW = null;

const wnCur = () => (typeof APP_VERSION === 'string' && APP_VERSION && APP_VERSION.charAt(0) !== '/') ? APP_VERSION : '';
const wnPick = p => Array.isArray(p) ? String((S && S.lang === 'en' ? p[1] : p[0]) || p[0] || '') : String(p || '');
const wnDate = d => {
  const x = new Date(String(d || '') + 'T12:00:00');
  return isNaN(x.getTime()) ? String(d || '') : x.toLocaleDateString(S && S.lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};
/** Запись журнала → { add:[строки], chg:[…], fix:[…] } на языке интерфейса. */
const wnLocal = e => ({ add: (e.add || []).map(wnPick), chg: (e.chg || []).map(wnPick), fix: (e.fix || []).map(wnPick) });
const wnCount = g => g.add.length + g.chg.length + g.fix.length;
/** Версия в записи ищется по точному совпадению; запись о текущей версии (или null). */
const wnEntry = v => CHANGELOG.find(e => e && e.v === v) || null;

/** Блок «Добавлено / Изменено / Исправлено». g — результат wnLocal или wnParseNotes. */
function wnGroupsEl(g) {
  const box = h('div', { class: 'wn-groups' });
  for (const [k, key, ic] of WN_GROUPS) {
    if (!g[k] || !g[k].length) continue;
    box.append(h('div', { class: 'wn-g wn-' + k }, h('div', { class: 'wn-gh' }, icon(ic, 13), h('span', t(key))),
      h('ul', g[k].map(s => h('li', s)))));
  }
  return box;
}

/** Описание выпуска GitHub → { add, chg, fix, plain }. Раздел «### Что нового» с строками «+ », «~ », «! »; нет раздела — первые пункты «- ». */
function wnParseNotes(body) {
  const out = { add: [], chg: [], fix: [], plain: [] };
  const lines = String(body || '').replace(/\r/g, '').split('\n');
  const clean = s => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\s+/g, ' ').trim();
  let i = lines.findIndex(l => /^#{2,4}\s*(что нового|what'?s new)(?![\p{L}\d])/iu.test(l.trim()));
  if (i >= 0) {
    for (i++; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l) { if (out.add.length + out.chg.length + out.fix.length) break; continue; }
      if (/^(---|#{1,4}\s)/.test(l)) break;
      const m = /^([+~!])\s+(.+)$/.exec(l);
      if (!m) continue;
      out[m[1] === '+' ? 'add' : m[1] === '~' ? 'chg' : 'fix'].push(clean(m[2]).slice(0, 260));
    }
    return out;
  }
  for (const l of lines) {
    const m = /^[-*]\s+(.+)$/.exec(l.trim());
    if (m) out.plain.push(clean(m[1]).slice(0, 200));
    if (out.plain.length >= 5) break;
  }
  return out;
}

/** Блок для окна обновления: что нового в версии, на которую человек обновится. Нет описания: null. */
function wnUpdBlock(ver, notes, url) {
  const g = wnParseNotes(notes);
  const has = wnCount(g) + g.plain.length > 0;
  if (!has && !url) return null;
  const body = has ? (wnCount(g) ? wnGroupsEl(g) : h('ul', { class: 'wn-plain' }, g.plain.map(s => h('li', s)))) : h('div', { class: 'hint' }, t('wn.nonotes'));
  return h('div', { class: 'wn-upd', id: 'wn-upd' }, h('div', { class: 'wn-uh' }, icon('sparkles', 14), h('b', t('wn.upd.h', ver))), body,
    h('div', { class: 'row-actions left' },
      url ? h('button', { class: 'btn sm', id: 'wn-upd-more', type: 'button', onclick: () => ghOpenUrl(url) }, icon('open', 13), t('wn.more')) : null,
      h('button', { class: 'btn sm', id: 'wn-upd-all', type: 'button', onclick: () => openWhatsNew() }, icon('history', 13), t('wn.all.btn'))));
}

/** Окно «История версий». */
function openWhatsNew() {
  if (WNW && WNW.m && !WNW.m.closed) return WNW.m;
  const st = { m: null, body: null, all: false };
  WNW = st;
  const cur = wnCur();
  const paint = () => {
    const list = CHANGELOG.filter(e => e && e.v);
    const kids = [h('div', { class: 'hint' }, cur ? t('wn.intro', cur) : t('wn.intro.nov'))];
    if (!list.length) kids.push(h('div', { class: 'hint', id: 'wn-empty' }, t('wn.empty')));
    list.slice(0, st.all ? list.length : WN_SHOW).forEach((e, i) => {
      const g = wnLocal(e);
      const d = h('details', { class: 'wn-ver', id: 'wn-v-' + e.v.replace(/\./g, '-') },
        h('summary', h('b', e.v), h('span', { class: 'wn-date' }, wnDate(e.d)),
          e.v === cur ? h('span', { class: 'upd-badge on' }, t('wn.yours')) : null,
          e.shell ? h('span', { class: 'upd-badge', title: t('wn.shell.h') }, t('wn.shell')) : null),
        wnCount(g) ? wnGroupsEl(g) : h('div', { class: 'hint' }, t('wn.nonotes')));
      d.open = cur ? e.v === cur || (!wnEntry(cur) && i === 0) : i === 0;
      kids.push(d);
    });
    if (!st.all && list.length > WN_SHOW) kids.push(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', id: 'wn-showall', type: 'button', onclick: () => { st.all = true; paint(); } }, t('wn.showall', list.length))));
    kids.push(h('div', { class: 'row-actions left wn-foot' },
      h('button', { class: 'btn', id: 'wn-gh', type: 'button', onclick: () => ghOpenUrl('https://github.com/' + (typeof updRepo === 'function' ? updRepo() : 'Gamers-U/VNmap') + '/releases') }, icon('open', 14), t('wn.gh'))));
    st.body.replaceChildren(...kids);
  };
  openModal({
    cls: 'wn-m', onClose: () => { if (WNW === st) WNW = null; },
    build: mm => { st.m = mm; st.body = h('div', { class: 'wn-body', id: 'wn-body' }); paint(); return h('div', { class: 'm-wrap' }, modalHead(t('wn.title'), mm), st.body); },
  });
  return st.m;
}

/** При запуске: если версия новая для этого устройства и о ней есть запись, один раз показать всплывающее «что нового». */
function wnStartup(silent) {
  const cur = wnCur();
  if (!cur || S.seenVer === cur) return;
  S.seenVer = cur; saveSettings();
  if (silent || !wnEntry(cur)) return;           // первый запуск на устройстве: просто запоминаем версию, подсказка там лишняя
  toastAct(t('wn.toast', cur), t('wn.toast.btn'), () => openWhatsNew(), 9000);
}

Object.assign(D, {
  'wn.title': ['История версий', 'Version history'],
  'wn.intro': ['Коротко о том, что менялось в каждой версии. У вас установлена {0}.', 'A short list of what changed in each version. You have {0} installed.'],
  'wn.intro.nov': ['Коротко о том, что менялось в каждой версии.', 'A short list of what changed in each version.'],
  'wn.empty': ['Записей пока нет.', 'No entries yet.'],
  'wn.add': ['Добавлено', 'Added'],
  'wn.chg': ['Изменено', 'Changed'],
  'wn.fix': ['Исправлено', 'Fixed'],
  'wn.yours': ['у вас', 'yours'],
  'wn.shell': ['новая оболочка', 'new shell'],
  'wn.shell.h': ['Для этой версии нужно обновить и оболочку программы (кнопка «Обновить» делает это сама)', 'This version also needs a new program shell (the Update button does it by itself)'],
  'wn.showall': ['Показать все версии ({0})', 'Show all versions ({0})'],
  'wn.gh': ['Все выпуски на GitHub', 'All releases on GitHub'],
  'wn.more': ['Подробно на GitHub', 'Details on GitHub'],
  'wn.all.btn': ['История версий', 'Version history'],
  'wn.upd.h': ['Что нового в версии {0}', 'What is new in version {0}'],
  'wn.nonotes': ['Описания этой версии пока нет.', 'There is no description of this version yet.'],
  'wn.toast': ['Версия {0}: что нового', 'Version {0}: what is new'],
  'wn.toast.btn': ['Показать', 'Show'],
  'wn.set': ['Что нового', 'What is new'],
  'wn.pal': ['История версий: что нового', 'Version history: what is new'],
});

'use strict';
/* ====== Статистика: один раздел вместо россыпи окон ======
   Раньше про ход работы и прохождение рассказывали пять разных окон: «Концовки», «Ветки и время», «Автопрогон»,
   «Журнал прохождений» и «Кто что сделал». Теперь у них одна точка входа: окно «Статистика» с короткой сводкой
   по каждой теме и кнопкой на подробное окно. Подробные окна остались прежними (их же можно открыть из палитры Ctrl+K
   и из общего списка «Инструменты»). Карточки модулей, которые выключены или недоступны в простом режиме, не показываются. */

Object.assign(D, {
  'sh.btn': ['Статистика', 'Statistics'], 'sh.tip': ['Ход работы: проект, концовки, кто что сделал', 'Progress: project, endings, who did what'],
  'sh.title': ['Статистика', 'Statistics'],
  'sh.p': ['Ход работы в одном месте. Время и ветки, журнал прохождений и тепловая карта лежат в «Проверках», автопрогон в «Игре».', 'Progress in one place. Time and branches, the playthrough log and heat map are under "Checks"; autorun is under "Play".'],
  'sh.proj': ['Проект', 'Project'], 'sh.proj.p': ['Сколько сделано и какие концовки вы уже открыли.', 'How much is done and which endings you have already opened.'],
  'sh.proj.btn': ['Концовки и блоки', 'Endings and blocks'],
  'sh.team': ['Кто что сделал', 'Who did what'], 'sh.team.p': ['Правки по людям за 7 или 30 дней или за всё время.', 'Edits per person over 7 or 30 days or all time.'],
  'sh.team.need': ['Нужны хотя бы два участника в Реестре → «Участники»', 'At least two members are needed in Registry → “Members”'],
  'sh.ends': ['концовок открыто', 'endings opened'],
  'sh.open': ['Открыть', 'Open'],
  'sh.min': ['{0} мин', '{0} min'], 'sh.h': ['{0} ч {1} мин', '{0} h {1} min'],
});

function openStatsHub() {
  closePopover();
  openModal({
    cls: 'stats-m sh-m',
    build: m => {
      const body = h('div', { class: 'm-pad scroll sh-body' });
      const go = fn => () => { m.close(); setTimeout(fn, 0); };
      const lang = S.lang === 'ru' ? 'ru-RU' : 'en-US', num = n => n.toLocaleString(lang);
      const dur = mins => (mins < 60 ? t('sh.min', Math.max(1, Math.round(mins))) : t('sh.h', Math.floor(mins / 60), Math.round(mins % 60)));
      const card = (id, ic, title, text, extra, btn, fn) => h('div', { class: 'sh-card', 'data-sh': id },
        h('div', { class: 'sh-h' }, icon(ic, 16), h('b', title)), h('div', { class: 'hint' }, text), extra || null,
        h('div', { class: 'nt-btns' }, h('button', { class: 'btn sm primary', onclick: go(fn) }, btn || t('sh.open'))));
      const st = projectStats();
      const tile = (v, l) => h('div', { class: 'tile' }, h('div', { class: 'tile-v' }, String(v)), h('div', { class: 'tile-l' }, l));
      body.append(h('div', { class: 'hint' }, t('sh.p')));
      const ends = P.nodes.filter(n => n.type === 'ending'), got = ends.filter(n => P.sim.reached[n.id]).length;
      body.append(card('proj', 'chart', t('sh.proj'), t('sh.proj.p'),
        h('div', { class: 'tiles' }, tile(st.nodes, t('stats.blocks')), tile(st.files, t('stats.files')), tile(num(st.words), t('stats.words')), tile(Math.round(st.pct * 100) + '%', t('stats.progress')),
          ends.length ? tile(got + '/' + ends.length, t('sh.ends')) : null),
        t('sh.proj.btn'), () => openStats()));
      {
        const pc = body.querySelector('.sh-card[data-sh="proj"]'), en = mxEndings();
        if (pc) {
          const tl = pc.querySelector('.tiles');
          if (tl) tl.after(h('div', { class: 'hint sh-note' }, t('mx.note')));
          if (en.total && en.reachable < en.total) pc.querySelector('.nt-btns').before(h('div', { class: 'hint sh-num warn' }, t('mx.ends.un', en.total - en.reachable, en.total)));
        }
      }
      if (typeof uiShow !== 'function' || uiShow('whodid')) body.append(card('team', 'users', t('sh.team'), t('sh.team.p'),
        typeof whOn === 'function' && !whOn() ? h('div', { class: 'hint sh-num warn' }, t('sh.team.need')) : null, null, () => openWhoDid()));
      return h('div', { class: 'm-wrap' }, modalHead(t('sh.title'), m), body);
    },
  });
}

'use strict';
/* ====== Права доступа ======
   Без включения прав всё как раньше: править может любой, кто открыл проект.
   Включили (переключатель в «Участники»): тот, кто включил, становится владельцем и может всё. Остальные по умолчанию наблюдатели:
   смотрят и пишут комментарии. Два режима:
   • обычный: владелец, редакторы (правят проект), наблюдатели; права раздаёт только владелец;
   • корпоративный: права идут от ролей участника (сценарист правит текст, актёр озвучки только озвучку и т. д.); раздают владелец и менеджеры.
   Защита работает внутри программы: каждый шаг истории сверяется с правами, и запрещённое откатывается с пояснением; у запрещённых мест поля
   неактивны. Человека с прямым доступом к репозиторию или к файлу проекта это не остановит (для этого есть ветки авторов и проверка правок). */

Object.assign(D, {
  'acl.h': ['Права доступа', 'Access rights'],
  'acl.intro': ['Пока права выключены, править проект может любой, кто его открыл. Если включить, править смогут только те, кому это разрешено; остальные смогут смотреть и писать комментарии.', 'While rights are off, anyone who opens the project can edit it. If you turn them on, only those who are allowed can edit; everyone else can look and leave comments.'],
  'acl.honest': ['Это защита от случайных правок внутри программы. Человека, у которого есть прямой доступ к репозиторию или к файлу проекта, она не остановит. Для настоящей защиты используйте ветки авторов и проверку правок (панель «GitHub»). Все, кто работает над проектом, должны обновить программу до этой версии, иначе старая версия сотрёт права при сохранении.', 'This protects from accidental edits inside the app. It does not stop someone who has direct access to the repository or the project file. For real protection use author branches and change review (the “GitHub” panel). Everyone working on the project must update to this version, or an older version will wipe the rights on save.'],
  'acl.on': ['Права доступа включены', 'Access rights are on'],
  'acl.on.hint': ['Тот, кто включает права, становится владельцем проекта.', 'Whoever turns the rights on becomes the owner of the project.'],
  'acl.mode': ['Режим', 'Mode'], 'acl.mode.simple': ['Обычный', 'Simple'], 'acl.mode.corp': ['Корпоративный', 'Corporate'],
  'acl.mode.simple.t': ['Владелец, редакторы и наблюдатели. Новые участники сначала наблюдатели; редакторами их делает владелец.', 'Owner, editors and observers. New members start as observers; the owner makes them editors.'],
  'acl.mode.corp.t': ['Права идут от ролей участника: что разрешено роли, то он и может править, всё остальное только смотреть. Права раздают владелец и руководители (роль «Руководитель»).', 'Rights follow the member\'s roles: they can edit what their role allows and only look at the rest. The owner and project leads (the “Project lead” role) hand out the rights.'],
  'acl.roles.h': ['Что разрешено ролям', 'What the roles may do'],
  'acl.roles.none': ['только комментарии', 'comments only'], 'acl.roles.grant': ['раздаёт права', 'hands out rights'],
  'acl.you': ['Ваши права: {0}', 'Your rights: {0}'],
  'acl.you.guest': ['Вас нет в списке участников, поэтому вы наблюдатель. Выберите себя в «Кто я в этом проекте» или войдите в GitHub.', 'You are not in the list of members, so you are an observer. Choose yourself in “Who I am in this project” or sign in to GitHub.'],
  'acl.owner.is': ['Владелец: {0}', 'Owner: {0}'],
  'acl.lv.owner': ['владелец', 'owner'], 'acl.lv.editor': ['редактор', 'editor'], 'acl.lv.observer': ['наблюдатель', 'observer'], 'acl.lv.guest': ['наблюдатель (гость)', 'observer (guest)'], 'acl.lv.author': ['автор (своя ветка)', 'author (own branch)'],
  'acl.chip.tip': ['Ваши права в этом проекте: {0}. Нажмите, чтобы открыть список участников.', 'Your rights in this project: {0}. Click to open the members list.'],
  'acl.need.me': ['Сначала выберите, кто вы в проекте: владельцем станете вы.', 'First choose who you are in the project: you will become the owner.'],
  'acl.enabled': ['Права включены. Вы владелец проекта.', 'Rights are on. You are the owner of the project.'],
  'acl.off.q': ['Выключить права доступа?', 'Turn the access rights off?'], 'acl.off.t': ['Снова править проект сможет любой. Назначенные уровни и роли останутся записанными.', 'Anyone will be able to edit the project again. The assigned levels and roles stay recorded.'], 'acl.off': ['Выключить', 'Turn off'],
  'acl.denied': ['Нельзя: у вас нет прав на «{0}». Правка отменена.', 'Not allowed: you have no rights to “{0}”. The change was undone.'],
  'acl.denied.who': ['Права выдаёт: {0}.', 'Rights are granted by: {0}.'],
  'acl.ro.note': ['Только чтение: у вас нет прав на «{0}». {1}', 'Read only: you have no rights to “{0}”. {1}'],
  'acl.access': ['Уровень', 'Level'],
  'acl.owner.badge': ['Владелец проекта', 'Project owner'],
  'acl.transfer': ['Передать владение…', 'Transfer ownership…'], 'acl.transfer.q': ['Передать владение участнику «{0}»?', 'Transfer ownership to “{0}”?'],
  'acl.transfer.t': ['Он станет владельцем и сможет всё, вы станете редактором. Вернуть владение сможет только он.', 'They become the owner and can do everything; you become an editor. Only they can give ownership back.'], 'acl.transfer.ok': ['Передать', 'Transfer'], 'acl.transfer.done': ['Владелец теперь: {0}', 'The owner is now: {0}'],
  'acl.unbound': ['Не привязан к входу: любой может назвать себя этим участником. Войдите в GitHub и выберите себя в «Кто я в этом проекте», тогда участник привяжется к вашему логину.', 'Not tied to a sign-in: anyone can pick this member as themselves. Sign in to GitHub and choose yourself in “Who I am in this project” to tie the member to your login.'],
  'acl.joined': ['Вы добавлены в команду как наблюдатель.', 'You were added to the team as an observer.'],
  'acl.claim.no': ['Этого участника может выбрать только тот, кто вошёл под его логином.', 'Only someone signed in with this member\'s login can choose them.'],
  'acl.eff': ['Может править: {0}', 'Can edit: {0}'],
  'acl.area.text': ['тексты глав', 'chapter texts'], 'acl.area.map': ['карта и стрелки', 'map and arrows'], 'acl.area.chars': ['персонажи', 'characters'],
  'acl.area.bg': ['фоны', 'backgrounds'], 'acl.area.sprite': ['спрайты', 'sprites'], 'acl.area.music': ['музыка', 'music'], 'acl.area.sfx': ['звуки', 'sounds'], 'acl.area.voice': ['озвучка', 'voice'],
  'acl.area.fx': ['эффекты', 'effects'], 'acl.area.tf': ['трансформы', 'transforms'], 'acl.area.font': ['шрифты', 'fonts'], 'acl.area.gui': ['интерфейс игры', 'game interface'],
  'acl.area.vars': ['переменные', 'variables'], 'acl.area.achs': ['достижения', 'achievements'], 'acl.area.tr': ['переводы', 'translations'], 'acl.area.build': ['настройки сборки', 'build settings'],
  'acl.area.team': ['команда и права', 'team and rights'], 'acl.area.acl': ['права доступа', 'access rights'], 'acl.area.cmts': ['комментарии', 'comments'],
});

/** Области проекта, которыми распоряжаются права. */
const ACL_CONTENT = ['text', 'map', 'chars', 'bg', 'sprite', 'music', 'sfx', 'voice', 'fx', 'tf', 'font', 'gui', 'vars', 'achs', 'tr', 'build'];
/** Корпоративный режим: что разрешено каждой роли из «Участники». Своя (произвольная) роль прав не даёт. */
const ACL_ROLE_AREAS = {
  writer: ['text', 'map', 'chars', 'vars', 'achs'], editor: ['text', 'map', 'chars', 'vars'],
  artist_bg: ['bg', 'gui'], artist_sprite: ['sprite'], composer: ['music'], sound: ['sfx'], voice: ['voice'], translator: ['tr'],
  dev: ['vars', 'achs', 'fx', 'tf', 'font', 'gui', 'build'], tester: [], manager: ['team'],
};
const ACL_META_AREA = { name: 'map', startId: 'map', lofs: 'map', filesUrl: 'build', build: 'build', base: 'tr', gui: 'gui', acl: 'acl', uid: 'acl' };
const ACL = { busy: false, last: 0 };

const aclAreaName = a => t('acl.area.' + a);
const aclIdsOf = p => { try { const lg = (typeof GHS !== 'undefined' && GHS.st && GHS.st.login) || ''; const o = []; if (lg) o.push('gh:' + String(lg).toLowerCase()); const id = typeof CL !== 'undefined' && CL.me && CL.me.id; if (id) o.push('cl:' + id); return o; } catch (e) { return []; } };

/** Кто за этим компьютером в проекте p: по выбору «Я — это…» (если вход совпадает с привязанным) или по входам. */
function aclMeIn(p) {
  const ms = (p && p.members) || [], ids = aclIdsOf();
  const k = S.me && p && S.me[p.uid];
  if (k) { const m = ms.find(x => x.id === k); if (m && (!ids.length || !(m.ids || []).length || m.ids.some(i => ids.includes(i)))) return m; }
  if (ids.length) { const m = ms.find(x => (x.ids || []).some(i => ids.includes(i))); if (m) return m; }
  return null;
}
/** Права в проекте p. all — можно всё (права выключены или вы владелец). */
function aclRightsIn(p) {
  const ms = (p && p.members) || [];
  const on = !!(p && p.acl && p.acl.on) && ms.some(m => m.access === 'owner');
  if (!on) return { all: true, kind: 'off', on: false, can: () => true, areas: new Set(ACL_CONTENT.concat(['team', 'acl', 'cmts'])), grant: true };
  const me = aclMeIn(p), corp = !!p.acl.corp;
  if (me && me.access === 'owner') return { all: true, kind: 'owner', on: true, me, corp, can: () => true, areas: new Set(ACL_CONTENT.concat(['team', 'acl', 'cmts'])), grant: true };
  const areas = new Set(['cmts']);
  let kind;
  let author = false;
  try { author = typeof gmeta === 'function' && typeof rvIsAuthor === 'function' && rvIsAuthor(gmeta()); } catch (e) { author = false; }
  if (author) { kind = 'author'; ACL_CONTENT.forEach(a => areas.add(a)); }       // работа в своей ветке: правки проверит владелец, поэтому править можно всё, кроме прав и команды
  else if (!me) kind = 'guest';
  else if (!corp) { kind = me.access === 'editor' ? 'editor' : 'observer'; if (kind === 'editor') ACL_CONTENT.forEach(a => areas.add(a)); }
  else { kind = 'roles'; for (const r of me.roles || []) if (String(r).startsWith('role:')) for (const a of ACL_ROLE_AREAS[String(r).slice(5)] || []) areas.add(a); }
  return { all: false, kind, on: true, me, corp, areas, grant: corp && areas.has('team'), can: a => areas.has(a) };
}
const aclRights = () => aclRightsIn(P);   // в своей ветке автор правит всё, кроме команды и прав: его правки проверит владелец
const aclOn = () => aclRights().on;
const aclCan = area => aclRights().can(area);
const aclOwner = p => ((p || P).members || []).find(m => m.access === 'owner') || null;
/** Подпись уровня для чипа и подсказок. */
function aclLabel(rt) {
  if (!rt.on) return '';
  if (rt.kind === 'owner') return t('acl.lv.owner');
  if (rt.kind === 'editor') return t('acl.lv.editor');
  if (rt.kind === 'guest') return t('acl.lv.guest');
  if (rt.kind === 'author') return t('acl.lv.author');
  if (rt.kind === 'roles') { const rs = (rt.me.roles || []).map(roleLabel).slice(0, 3); return rs.length ? rs.join(', ') : t('acl.lv.observer'); }
  return t('acl.lv.observer');
}
const aclAreasText = areas => [...areas].filter(a => a !== 'cmts' && a !== 'team').map(aclAreaName).join(', ');

/* ---------- сообщения ---------- */
function aclToast(areas) {
  const now = Date.now(); if (now - ACL.last < 1500) return; ACL.last = now;
  const own = aclOwner();
  toast(t('acl.denied', [...new Set(areas)].map(aclAreaName).join(', ')) + (own ? ' ' + t('acl.denied.who', own.name || '?') : ''), 5200);
}
/** Для действий на карте: true — можно, иначе покажет пояснение. */
function aclGuard(area) { if (aclCan(area)) return true; aclToast([area]); return false; }

/* ---------- страж: сверяет каждый шаг истории с правами ---------- */
const sameFields = (a, b, skip) => { const ks = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]); return [...ks].filter(k => !(skip || []).includes(k) && !mgEq((a || {})[k], (b || {})[k])); };
/** Какого права не хватает для этого изменения (пустая строка: можно). rt — права из состояния ДО изменения. */
function aclNeed(k, b, a, rt, Bp) {
  const pre = k.split('/')[0], id = k.slice(pre.length + 1);
  if (pre === 'k' || pre === 'x') return '';
  if (pre === 'n' || pre === 'f') {
    const fl = b && a ? sameFields(b, a, ['fileIds', 'nodeId']) : null;
    if (fl && fl.length && fl.every(f => f === 'owners')) return rt.can('map') || rt.can('text') || rt.can('team') ? '' : 'map';
    return rt.can(pre === 'f' ? 'text' : 'map') ? '' : (pre === 'f' ? 'text' : 'map');
  }
  if (pre === 'e') return rt.can('map') ? '' : 'map';
  if (pre === 'c') {
    const fl = b && a ? sameFields(b, a) : null;
    if (fl && fl.length && fl.every(f => f === 'actor')) return rt.can('chars') || rt.can('voice') || rt.can('team') ? '' : 'chars';
    return rt.can('chars') ? '' : 'chars';
  }
  if (pre === 'a') {
    const kind = (a || b).kind, fl = b && a ? sameFields(b, a) : null;
    if (fl && fl.length && fl.every(f => f === 'owners') && (rt.can('team') || rt.can(kind))) return '';
    return rt.can(kind) ? '' : kind;
  }
  if (pre === 'v') return rt.can('vars') ? '' : 'vars';
  if (pre === 'g') return rt.can('achs') ? '' : 'achs';
  if (pre === 'l' || pre === 'r') return rt.can('tr') ? '' : 'tr';
  if (pre === 'm') return aclMemberNeed(id, b, a, rt, Bp);
  return rt.can('map') ? '' : 'map';
}
function aclMemberNeed(id, b, a, rt, Bp) {
  const me = rt.me, self = !!me && me.id === id, grant = !!rt.grant, mine = aclIdsOf();
  if (!b) {                                              // новый участник
    const plain = (!a.access || a.access === 'observer') && !(a.roles || []).length;
    if (plain && (a.ids || []).some(i => mine.includes(i))) return '';          // человек сам добавил себя после входа
    return grant && a.access !== 'owner' ? '' : 'team';
  }
  if (!a) return grant && b.access !== 'owner' ? '' : 'team';
  if (b.access === 'owner' || a.access === 'owner') return 'acl';
  const fl = sameFields(b, a);
  if (fl.some(f => f === 'access' || f === 'roles')) return grant && !self ? '' : 'team';
  if (fl.length === 1 && fl[0] === 'ids' && (self || !(b.ids || []).length)) return '';
  return self || grant ? '' : 'team';
}
function aclMetaNeed(b, a, rt) {
  const bad = [], keep = Object.assign({}, a || {});
  for (const f of sameFields(b, a)) { const area = ACL_META_AREA[f] || 'map'; if (!rt.can(area)) { bad.push(area); if (b && f in b) keep[f] = b[f]; else delete keep[f]; } }
  return { bad, keep };
}
/** Вызывается перед записью шага истории. true — часть изменений откатили (проект заменён). */
function aclGate() {
  if (ACL.busy || typeof P === 'undefined' || !P || (typeof GAME !== 'undefined' && GAME)) return false;
  const prev = HIST.stack[HIST.i]; if (!prev) return false;
  if (!(P.acl && P.acl.on) && prev.indexOf('"acl":{"on":true') < 0) return false;          // права были и остаются выключенными: проверять нечего
  let Bp; try { Bp = JSON.parse(prev); } catch (e) { return false; }
  const rt = aclRightsIn(Bp);
  if (rt.all) return false;
  ACL.busy = true;
  try {
    const B = mgEntities(Bp), L = mgEntities(P), d = mgDiff(B, L);
    const keys = d.set.concat(d.del); if (!keys.length) return false;
    const denied = new Set(), areas = [];
    let metaFix = null;
    for (const k of keys) {
      if (k === 'meta') { const r = aclMetaNeed(B.get(k), L.get(k), rt); if (r.bad.length) { metaFix = r.keep; areas.push(...r.bad); } continue; }
      const need = aclNeed(k, B.get(k), L.get(k), rt, Bp);
      if (need) { denied.add(k); areas.push(need); }
    }
    if (!denied.size && !metaFix) return false;
    const M = new Map(L);
    for (const k of denied) { if (B.has(k)) M.set(k, B.get(k)); else M.delete(k); }
    if (metaFix) M.set('meta', metaFix);
    /* зависимости: блок вернулся из удалённых вместе со стрелками и файлами; отклонённый новый блок уходит вместе с ними */
    for (const k of denied) {
      if (!k.startsWith('n/')) continue;
      const nid = k.slice(2);
      if (B.has(k)) {
        for (const [bk, bv] of B) if ((bk.startsWith('f/') && bv.nodeId === nid) || (bk.startsWith('e/') && (bv.from === nid || bv.to === nid)) || (bk.startsWith('k/') && bv.nid === nid)) if (!L.has(bk) || bk.startsWith('f/')) M.set(bk, bv);
      } else {
        for (const [lk, lv] of L) if ((lk.startsWith('f/') && lv.nodeId === nid) || (lk.startsWith('e/') && (lv.from === nid || lv.to === nid)) || (lk.startsWith('k/') && lv.nid === nid)) M.delete(lk);
      }
    }
    const v = P.view, sim = P.sim, tt = P.teTabs;
    const np = normalize(mgBuild(M, P)); np.view = v; np.sim = sim && typeof sim === 'object' ? sim : np.sim; if (tt) np.teTabs = tt;
    P = np; reindex();
    for (const id of [...UI.sel]) if (!nodeById(id)) UI.sel.delete(id);
    if (UI.edge && !edgeById(UI.edge)) UI.edge = null;
    AUTH_SIG = null;
    onProjectReplaced();
    aclToast(areas);
    return true;
  } finally { ACL.busy = false; }
}

/* ---------- блокировка полей в запрещённых местах ---------- */
/** Делает область только для чтения: полям нельзя вводить, кнопки и ссылки не нажимаются, остаётся прокрутка. */
function aclFreeze(el) {
  if (!el) return el;
  el.classList.add('acl-ro');
  el.querySelectorAll('input,textarea,select').forEach(i => { if (i.closest('.acl-keep')) return; i.readOnly = true; if (i.tagName === 'SELECT' || /checkbox|radio|color|range|file/.test(i.type)) i.disabled = true; });
  return el;
}
/** Только поля ввода (кнопки остаются нажимаемыми: окно блока, где вкладки и «закрыть» нужны всегда). */
function aclFreezeInputs(el) {
  if (!el) return;
  el.querySelectorAll('input,textarea,select').forEach(i => { if (i.closest('.acl-keep')) return; i.readOnly = true; if (i.tagName === 'SELECT' || /checkbox|radio|color|range|file/.test(i.type)) i.disabled = true; });
}
/** Следит за областью: после каждой перерисовки заново закрывает поля, если права на area нет. */
function aclWatch(el, areaFn) {
  if (!el || el._aclW) return; el._aclW = true;
  const apply = () => { if (!aclOn()) return; const a = areaFn(); if (a && !aclCan(a)) aclFreezeInputs(el); };
  new MutationObserver(apply).observe(el, { childList: true, subtree: true }); apply();
}
function aclNote(area, extra) {
  const own = aclOwner();
  return h('div', { class: 'acl-note acl-keep' }, icon('lock', 15), h('span', t('acl.ro.note', aclAreaName(area), own ? t('acl.denied.who', own.name || '?') : '')), extra || null);
}
const ACL_TAB_AREA = { chars: 'chars', bg: 'bg', sprite: 'sprite', font: 'font', gui: 'gui', vars: 'vars', ach: 'achs' };
/** Вкладка реестра: карточки без прав закрываются, в шапке остаётся подсказка. */
function aclRegFreeze(st, list, root) {
  if (!aclOn()) return;
  const rt = aclRights(), tab = st.tab;
  if (tab === 'team') return aclTeamFreeze(st, list, root, rt);
  if (rt.all) return;
  const cards = [...list.children];
  let area = ACL_TAB_AREA[tab], anyOk = false, firstBad = '';
  if (tab === 'audio') {
    for (const c of cards) { const a = P.assets.find(x => x.id === c.dataset.rid); if (!a) continue; if (rt.can(a.kind)) anyOk = true; else { aclFreeze(c); firstBad = firstBad || a.kind; } }
    anyOk = anyOk || ['music', 'sfx', 'voice'].some(k => rt.can(k)); area = anyOk ? '' : 'music';
  } else if (tab === 'fx' || tab === 'tf') {
    for (const c of cards) { const a = P.assets.find(x => x.id === c.dataset.rid); if (a && !rt.can(a.kind)) { aclFreeze(c); firstBad = firstBad || a.kind; } }
    anyOk = rt.can('fx') || rt.can('tf'); area = anyOk ? '' : 'fx';
  } else if (tab === 'files') return;
  else if (area && !rt.can(area)) { cards.forEach(c => aclFreeze(c)); }
  else area = '';
  const bad = area || firstBad;
  if (area) root.querySelectorAll('.reg-top .btn').forEach(b => { b.disabled = true; });
  if (bad && !list.querySelector('.acl-note')) list.prepend(aclNote(bad));
}

/* ---------- кто есть кто: вкладка «Участники» ---------- */
function aclRoleLines() {
  return ROLE_PRESETS.map(r => {
    const a = ACL_ROLE_AREAS[r] || [], parts = a.filter(x => x !== 'team').map(aclAreaName);
    if (a.includes('team')) parts.push(t('acl.roles.grant'));
    return h('div', { class: 'acl-rl' }, h('b', roleLabel('role:' + r)), h('span', ' — ' + (parts.length ? parts.join(', ') : t('acl.roles.none'))));
  });
}
async function aclEnable() {
  if (!P.members.length || !meMember()) { toast(t('acl.need.me'), 5200); openMeDialog(); return; }
  const me = meMember();
  me.access = 'owner';
  P.acl = { on: true, corp: false };
  commit(true); toast(t('acl.enabled'), 4200); renderReg(); updateStatus();
}
async function aclDisable() {
  if (!(await confirmDlg({ title: t('acl.off.q'), text: t('acl.off.t'), ok: t('acl.off'), danger: true }))) return;
  P.acl = {}; commit(true); renderReg(); updateStatus(); renderAll();
}
function aclSetCorp(v) { P.acl = { on: true, corp: !!v }; commit(true); renderReg(); updateStatus(); }
async function aclTransfer(m) {
  if (!(await confirmDlg({ title: t('acl.transfer.q', m.name || '?'), text: t('acl.transfer.t'), ok: t('acl.transfer.ok') }))) return;
  const me = meMember(); if (me) me.access = 'editor';
  m.access = 'owner'; commit(true); toast(t('acl.transfer.done', m.name), 4200); renderReg(); updateStatus();
}
/** Карточка «Права доступа» вверху вкладки «Участники». */
function aclTeamCard() {
  const rt = aclRights(), box = h('div', { class: 'reg-card acl-card' }), body = h('div', { class: 'reg-body' });
  body.append(h('div', { class: 'acl-h' }, icon('lock', 16), h('b', t('acl.h'))), h('div', { class: 'hint' }, t('acl.intro')));
  if (!rt.on) {
    body.append(h('div', { class: 'acl-row' }, switchEl(false, v => { if (v) aclEnable(); }, t('acl.on')), h('span', { class: 'hint' }, t('acl.on.hint'))));
  } else {
    const own = aclOwner();
    body.append(h('div', { class: 'acl-row' }, switchEl(true, v => { if (!v) aclDisable(); }, t('acl.on')), h('span', { class: 'acl-you' }, t('acl.you', aclLabel(rt)))));
    if (own) body.append(h('div', { class: 'hint' }, t('acl.owner.is', own.name || '?')));
    if (rt.kind === 'guest') body.append(h('div', { class: 'hint warn-t' }, t('acl.you.guest')));
    const modes = segmented([{ value: 'simple', label: t('acl.mode.simple') }, { value: 'corp', label: t('acl.mode.corp') }], P.acl.corp ? 'corp' : 'simple', v => aclSetCorp(v === 'corp'));
    const mf = h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('acl.mode')), modes);
    if (!rt.all) aclFreeze(mf);
    body.append(mf, h('div', { class: 'hint' }, P.acl.corp ? t('acl.mode.corp.t') : t('acl.mode.simple.t')));
    if (P.acl.corp) body.append(h('details', { class: 'acl-roles' }, h('summary', t('acl.roles.h')), h('div', { class: 'acl-rls' }, aclRoleLines())));
  }
  body.append(h('div', { class: 'hint acl-honest' }, t('acl.honest')));
  box.append(body); return box;
}
/** Вкладка «Участники»: у кого нет права выдавать права, карточки закрыты (свою карточку можно править, кроме уровня и ролей). */
function aclTeamFreeze(st, list, root, rt) {
  if (rt.all) return;
  for (const c of [...list.children]) {
    const rid = c.dataset && c.dataset.rid; if (!rid) continue;
    const m = P.members.find(x => x.id === rid), mine = !!rt.me && rt.me.id === rid;
    if ((m && m.access === 'owner') || (!rt.grant && !mine)) { aclFreeze(c); continue; }
    if (mine || !rt.grant) c.querySelectorAll('.chips,.acl-access').forEach(x => aclFreeze(x));      // свой уровень и свои роли самому себе не выдать
    if (!rt.grant) c.querySelectorAll('.reg-card>.btn.danger-t').forEach(x => { x.disabled = true; });
  }
  root.querySelectorAll('.reg-top .btn').forEach(b => { b.disabled = !rt.grant; });
}
/** Для карточки участника: уровень (обычный режим), «владелец», «передать владение», предупреждение о привязке. */
function aclMemberExtras(m) {
  const rt = aclRights(); if (!rt.on) return null;
  const out = h('div', { class: 'acl-mx' });
  if (m.access === 'owner') out.append(h('span', { class: 'chip on static' }, icon('lock', 13), t('acl.owner.badge')));
  else if (!P.acl.corp) {
    const seg = segmented([{ value: 'observer', label: t('acl.lv.observer') }, { value: 'editor', label: t('acl.lv.editor') }], m.access === 'editor' ? 'editor' : 'observer', v => { if (v === 'editor') m.access = 'editor'; else delete m.access; commit(true); updateStatus(); });
    seg.classList.add('acl-access');
    out.append(h('div', { class: 'field' }, h('div', { class: 'lbl' }, t('acl.access')), seg));
  } else {
    const eff = new Set(['cmts']); for (const r of m.roles || []) if (String(r).startsWith('role:')) for (const a of ACL_ROLE_AREAS[String(r).slice(5)] || []) eff.add(a);
    const txt = aclAreasText(eff);
    out.append(h('div', { class: 'hint' }, txt ? t('acl.eff', txt) : t('acl.roles.none')));
  }
  if (rt.kind === 'owner' && m.access !== 'owner') out.append(h('button', { class: 'btn sm', onclick: () => aclTransfer(m) }, icon('user', 14), t('acl.transfer')));
  const elevated = m.access === 'owner' || m.access === 'editor' || (P.acl.corp && (m.roles || []).some(r => (ACL_ROLE_AREAS[String(r).replace(/^role:/, '')] || []).length));
  if (elevated && !(m.ids || []).length && GHS && GHS.st && GHS.st.login) out.append(h('div', { class: 'hint warn-t' }, t('acl.unbound')));
  return out;
}
/** Можно ли этому человеку назвать себя участником m (его вход должен совпасть с привязанным). */
function aclMayClaim(m) {
  if (!m || !aclOn()) return true;
  const ids = aclIdsOf();
  if (!ids.length || !(m.ids || []).length) return true;
  return m.ids.some(i => ids.includes(i));
}
/** После входа человека, которого нет в списке, он появляется в команде сам (наблюдателем). */
function aclAutoJoin() {
  if (ACL.busy || typeof P === 'undefined' || !P || (typeof GAME !== 'undefined' && GAME) || !aclOn()) return;
  const ids = aclIdsOf(); if (!ids.length) return;
  if (P.members.some(x => (x.ids || []).some(i => ids.includes(i)))) return;
  if (P.members.length >= 60) return;
  const login = (typeof GHS !== 'undefined' && GHS.st && GHS.st.login) || '', nm = login || (CL && CL.me && CL.me.name) || '';
  if (!nm) return;
  const m = addMember(nm, { ids: ids.slice(0, 6) });
  S.me = S.me && typeof S.me === 'object' ? S.me : {}; S.me[P.uid] = m.id; saveSettings();
  toast(t('acl.joined'), 4200);
  if (REG && !REG.m.closed) renderReg();
}
/** Чип в строке состояния: ваш уровень в проекте. */
function aclChip() {
  const rt = aclRights(); if (!rt.on) return null;
  const lab = aclLabel(rt);
  return h('button', { class: 'btn stat acl-chip' + (rt.all ? '' : ' ro'), 'data-tip': t('acl.chip.tip', lab), onclick: () => openRegistry('team') }, icon('lock', 14), lab);
}

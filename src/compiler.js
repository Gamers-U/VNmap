'use strict';
/* ====== Компилятор: карта новеллы → готовый проект Ren'Py ======
   compileProject(over, blobSet) → { files:[{path,text}], bin:[{path,bid,size}], items:[отчёт], stats, order, opt }
   Ничего не пишет на диск: результат показывает окно «Сборка» и упаковывает в ZIP. */

const CMP_NOT_SPEAKER = new Set('label scene show hide play stop queue with menu jump call return if elif else while for pass python init define default image transform screen style voice window pause nvl narrator extend centered vcentered renpy translate layeredimage camera on at as behind onlayer zorder expression not rpy testcase'.split(' '));
const CMP_KNOWN_FX = new Set(['dissolve', 'fade', 'None', 'pixellate', 'move', 'moveinright', 'moveinleft', 'moveintop', 'moveinbottom', 'moveoutright', 'moveoutleft', 'ease', 'easeinright', 'easeinleft', 'hpunch', 'vpunch', 'wipeleft', 'wiperight', 'wipeup', 'wipedown', 'slideleft', 'slideright', 'slideup', 'slidedown', 'irisout', 'irisin', 'blinds', 'squares', 'zoomin', 'zoomout', 'zoominout', 'vpunch']);
const RE_AUDIO = /^(\s*)(?:play|queue)\s+(?:music|sound|audio|voice)\s+(?:\[\s*)?(["'])([^"'\\]+)\2/;
const RE_VOICE = /^(\s*)voice\s+(["'])([^"'\\]+)\2/;
const RE_SELF_LABEL = /^label\s+([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*:/;
const RPY_STMT_START = new Set(['play', 'stop', 'queue', 'show', 'hide', 'scene', 'with', 'pause', 'voice', 'call', 'jump', 'return', 'window', 'nvl', 'centered']);

function cmpPath(p) {
  let x = String(p || '').replace(/\\/g, '/').replace(/^(\.\/|\/)+/, '').replace(/^game\//i, '');
  x = x.split('/').filter(seg => seg && seg !== '.' && seg !== '..').map(seg => seg.replace(/[^A-Za-z0-9_.-]+/g, '_')).join('/');
  return x;
}
const cmpStripExt = p => p.replace(/\.[A-Za-z0-9]+$/, '');
const cmpIdent = (s, fb) => { let x = String(s || '').trim(); if (/^[A-Za-z_]\w*$/.test(x)) return x; x = slug(x); return /^[A-Za-z_]\w*$/.test(x) ? x : (fb || 'x'); };
const pyStr = s => JSON.stringify(String(s == null ? '' : s));
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
const PH_COLORS = ['#3b4a6b', '#4a3b6b', '#3b6b5a', '#6b4a3b', '#5a3b4a', '#3b5a6b', '#55603b', '#6b3b3b'];
function cmpImageName(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  return words.map(w => /^[A-Za-z0-9_]+$/.test(w) ? w : slug(w)).join(' ');
}
const cmpEdgeCode = code => String(code || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
  if (l.startsWith('$')) return '$ ' + l.replace(/^\$\s*/, '');
  const first = l.split(/[\s(.:]/)[0];
  return RPY_STMT_START.has(first) ? l : '$ ' + l;
});
/** Как персонаж называется и каким цветом подписан в самой игре (по умолчанию — как в реестре и на карте). */
const cmpGameName = c => (c.gameName || '').trim() || c.name || c.tag;
const cmpGameColor = c => c.gameColor || THEMES.dark.colors[c.color] || '#ffffff';
const cmpCond = c => String(c || '').replace(/\s*\n\s*/g, ' ').trim();
const cmpBalanced = c => { let d = 0, q = null; for (const ch of c) { if (q) { if (ch === q) q = null; } else if (ch === '"' || ch === "'") q = ch; else if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--; if (d < 0) return false; } return d === 0 && !q; };

function compileProject(over, blobSet) {
  const opt = Object.assign({}, DEFAULT_BUILD, P.build || {}, over || {});
  const R = { files: [], bin: [], items: [], stats: {}, order: [], opt };
  const add = (level, msg, ref, fix) => R.items.push({ level, msg, nodeId: ref && ref.node ? ref.node.id : null, fileId: ref && ref.file ? ref.file.id : null, fix: fix || null });
  const byXY = (a, b) => a.x - b.x || a.y - b.y;
  const have = bid => !blobSet || blobSet.has(bid);

  /* ---------- граф ---------- */
  const real = P.nodes.filter(n => n.type !== 'note');
  const realIds = new Set(real.map(n => n.id));
  const outsOf = new Map(real.map(n => [n.id, []])), insOf = new Map(real.map(n => [n.id, []]));
  const eidx = new Map(P.edges.map((e, i) => [e.id, i]));
  for (const e of P.edges) if (realIds.has(e.from) && realIds.has(e.to)) { outsOf.get(e.from).push(e); insOf.get(e.to).push(e); }
  for (const arr of outsOf.values()) arr.sort((a, b) => { const A = nodeById(a.to), B = nodeById(b.to); return A.y - B.y || A.x - B.x || eidx.get(a.id) - eidx.get(b.id); });
  if (P.nodes.some(n => n.type === 'note') && P.edges.some(e => !realIds.has(e.from) || !realIds.has(e.to))) add('info', t('cmp.noteedges'));
  if (!real.length) { add('error', t('cmp.empty.project')); return finish(); }

  let start = P.startId && realIds.has(P.startId) ? nodeById(P.startId) : null;
  if (!start) {
    const cand = real.filter(n => !insOf.get(n.id).length && n.type !== 'ending' && !n.unlock).sort(byXY);
    start = cand[0] || real.slice().sort(byXY)[0];
    const sid = start.id;
    add(cand.length > 1 ? 'warn' : 'info', cand.length > 1 ? t('cmp.start.many', start.title, cand.length) : t('cmp.start.auto', start.title), { node: start },
      { label: t('cmp.fix.setstart'), run: () => { P.startId = sid; commit(true); renderAll(); } });
  }
  const bonus = real.filter(n => n.unlock && n !== start && !insOf.get(n.id).length).sort(byXY);

  const seen = new Set(), order = [];
  const walk = root => {
    if (seen.has(root.id)) return;
    seen.add(root.id); const q = [root];
    while (q.length) { const n = q.shift(); order.push(n); for (const e of outsOf.get(n.id)) { const m = nodeById(e.to); if (m && !seen.has(m.id)) { seen.add(m.id); q.push(m); } } }
  };
  walk(start); bonus.forEach(walk);
  const reachable = new Set(seen);
  const rest = real.filter(n => !seen.has(n.id)).sort(byXY);
  rest.forEach(n => add('warn', t('cmp.unreach', n.title), { node: n }));
  if (opt.includeUnreachable) rest.forEach(walk);
  R.order = order.map(n => n.id);

  /* ---------- метки ---------- */
  const taken = new Set(['start', 'quit', 'after_load', 'splashscreen', 'before_main_menu', 'main_menu', 'after_warp', 'hide_windows']);
  const declared = new Map();
  const scriptLines = new Map();
  let FBG = null; const fbSeen = new Set();
  if (typeof fbGeom === 'function') { try { FBG = fbGeom(); } catch (e) { FBG = null; } }
  for (const n of order) for (const f of n.files) {
    const raw = String(f.script || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
    let lines = raw.split('\n').map(l => l.replace(/\s+$/, ''));
    let lead = 0;
    while (lines.length && !lines[0].trim()) { lines.shift(); lead++; }
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    scriptLines.set(f.id, lines);
    if (lines.length && typeof mlReport === 'function') mlReport(add, n, f, lines, lead);      // мини-Lint: типичные ошибки скрипта
    if (lines.length && FBG) { try { fbReport(add, n, f, lines, lead, FBG, fbSeen); } catch (e) { /* проверка не должна ломать сборку */ } }      // длинные реплики (fitbox.js)
    lines.forEach(l => { const m = /^label\s+([A-Za-z_]\w*)/.exec(l); if (m) { if (declared.has(m[1])) add('warn', t('cmp.label.dup', m[1]), { node: n, file: f }); else declared.set(m[1], { node: n, file: f }); } });
  }
  if (FBG && typeof fbFlush === 'function') fbFlush(add, FBG);
  for (const l of declared.keys()) taken.add(l);
  const uniq = base => { let b = base, k = 2; while (taken.has(b)) b = base + '_' + k++; taken.add(b); return b; };
  const info = new Map();
  order.forEach((n, i) => {
    const blk = uniq('blk_' + cmpIdent(slug(n.title), 'scene'));
    const dir = String(i + 1).padStart(2, '0') + '_' + slug(n.title);
    info.set(n.id, { n, idx: i, blk, key: blk.slice(4), dir, files: [] });
  });

  const usedNames = new Set(); // имена файлов в папке
  for (const n of order) {
    const I = info.get(n.id);
    for (const f of n.files) {
      const lines = scriptLines.get(f.id);
      const first = lines.find(l => l.trim() && !l.trim().startsWith('#')) || '';
      const sm = RE_SELF_LABEL.exec(first);
      let label, self = false;
      if (sm) { label = sm[1]; self = true; }
      else {
        const want = fileLabel(f);
        const base = cmpIdent(want, 'chapter');
        if (base !== want) add('warn', t('cmp.label.bad', want, base), { node: n, file: f });
        label = uniq(base);
        if (label !== base) add('warn', t('cmp.label.renamed', base, label), { node: n, file: f });
      }
      let fname = fileName(f).replace(/[^A-Za-z0-9_.-]+/g, '_'), k = 2;
      const stem = fname.replace(/\.rpy$/i, '');
      if (f.filename && typeof fnScriptName === 'function') { try { fnScriptName(add, n, f, fileName(f), fname); } catch (e) { /* не страшно */ } }
      while (usedNames.has((I.dir + '/' + fname).toLowerCase())) fname = stem + '_' + k++ + '.rpy';        // на Windows «A.rpy» и «a.rpy» один файл
      usedNames.add((I.dir + '/' + fname).toLowerCase());
      I.files.push({ f, label, self, lines, fname, path: 'game/story/' + I.dir + '/' + fname });
    }
  }

  /* ---------- ассеты: файлы, пути, определения ---------- */
  const targets = new Set(), assetTarget = new Map(); // `${id}|${key}` → путь внутри game/
  const assetFiles = [];
  const targetFor = (a, key, m) => {
    const ext = metaExt(m) || (isImageKind(a.kind) ? 'png' : 'ogg');
    let path;
    if (a.kind === 'font') { path = a.path ? cmpPath(a.path) : 'fonts/' + slug(a.name) + '.' + (metaExt(m) || 'ttf'); path = extOf(path) ? cmpStripExt(path) + '.' + (metaExt(m) || extOf(path)) : path + '.' + (metaExt(m) || 'ttf'); }
    else if (a.kind === 'gui') path = guiTarget(a);
    else if (a.kind === 'bg') path = (a.path ? cmpStripExt(cmpPath(a.path)) : 'images/bg/' + slug(a.name.replace(/^bg\s+/i, ''))) + '.' + ext;
    else if (a.kind === 'sprite') { const base = a.path ? cmpStripExt(cmpPath(a.path)) : 'images/sprites/' + slug(a.name); path = (key ? base + '_' + slug(key) : base) + '.' + ext; }
    else {
      // расширение берём у реально загруженного файла; строки скрипта с прежним путём перепишутся ниже
      path = a.path ? cmpPath(a.path) : 'audio/' + a.kind + '/' + slug(a.name) + '.' + ext;
      path = extOf(path) ? cmpStripExt(path) + '.' + ext : path + '.' + ext;
    }
    let out = path, k = 2;
    while (targets.has(out.toLowerCase())) { out = cmpStripExt(path) + '_' + k++ + '.' + (extOf(path) || ext); }
    if (out !== path) add('warn', t('cmp.path.dup', path, out));
    targets.add(out.toLowerCase());
    return out;
  };
  for (const a of P.assets) {
    if (!hasFilesKind(a.kind)) continue;
    for (const [key, m] of Object.entries(a.files || {})) {
      if (a.kind === 'sprite' && key && !a.expr.includes(key)) continue;
      if (!have(m.bid)) { add('warn', t('cmp.file.lost', a.name, m.name)); continue; }
      const target = targetFor(a, key, m);
      assetTarget.set(a.id + '|' + key, target);
      assetFiles.push({ a, key, m, target });
      const e = metaExt(m);
      if (isImageKind(a.kind) ? !RENPY_IMG.has(e) : isFontKind(a.kind) ? !RENPY_FONT.has(e) : !RENPY_AUD.has(e)) add('warn', t('cmp.file.fmt', a.name, e || '?'));
      R.bin.push({ path: 'game/' + target, bid: m.bid, size: m.size });
    }
  }
  const audioHasFile = a => assetTarget.has(a.id + '|');
  const fnTG = { exact: new Set(), lower: new Map() }, fnFound = new Map();                      // проверка имён файлов (filenames.js)
  for (const x of assetFiles) { fnTG.exact.add(x.target); fnTG.lower.set(x.target.toLowerCase(), x.target); }
  if (typeof wtReport === 'function') { try { wtReport(add, assetFiles); } catch (e) { /* не страшно */ } }       // вес ресурсов (weight.js)
  if (typeof fnAssets === 'function') { try { fnAssets(add, P.assets, a => (assetFiles.find(x => x.a === a) || {}).target || ''); } catch (e) { /* проверка не должна ломать сборку */ } }
  const fontNoFile = new Set(), fontUnknown = new Map();
  const fontPathFor = (ref, refInfo) => {
    const a = fontAssetByRef(ref);
    if (a) { const tg = assetTarget.get(a.id + '|'); if (tg) return tg; fontNoFile.add(a); return BUILTIN_FONTS[0].ref; }
    if (BUILTIN_FONTS.some(b => b.ref.toLowerCase() === String(ref).toLowerCase())) return ref;
    if (!fontUnknown.has(ref)) fontUnknown.set(ref, refInfo);
    return ref;
  };
  const normRef = r => cmpPath(r).toLowerCase();
  const findAudio = ref => P.assets.find(a => AUDIO_KINDS.includes(a.kind) && (a.name.toLowerCase() === ref.toLowerCase() || (a.path && normRef(a.path) === normRef(ref))));

  /* ---------- известные имена (для проверки реплик) ---------- */
  const known = new Set(['narrator', 'extend', 'centered', 'vcentered', 'nvl_narrator', 'adv']);
  const cc = typeof ccPrepare === 'function' ? ccPrepare() : null;          // свой код проекта (customcode.js): имена, которые он определяет
  if (cc) for (const n of cc.names) known.add(n);
  const chars = [], charTags = new Set();
  for (const c of P.characters) {
    if (!c.tag) { add('warn', t('cmp.char.notag', c.name || '?')); continue; }
    if (!/^[A-Za-z_]\w*$/.test(c.tag)) { add('warn', t('cmp.char.badtag', c.name || c.tag, c.tag)); continue; }
    if (charTags.has(c.tag)) { add('warn', t('cmp.char.duptag', c.tag)); continue; }
    if (RESERVED_TAGS.has(c.tag)) add('warn', t('cmp.char.reserved', c.tag));
    charTags.add(c.tag); known.add(c.tag); chars.push(c);
  }
  const vars = [];
  for (const v of P.vars) {
    const nm = (v.name || '').trim();
    if (!/^[A-Za-z_]\w*$/.test(nm)) { add('warn', t('cmp.var.bad', nm || '?')); continue; }
    if (RESERVED_TAGS.has(nm) || charTags.has(nm) || vars.some(x => x.name === nm)) { add('warn', t('cmp.var.conflict', nm)); continue; }
    vars.push({ name: nm, value: (v.value || '').trim() || (v.type && v.type !== 'raw' ? defaultFor(v.type) : '0') }); known.add(nm);
  }
  /* выборы с последствиями: недостающие default и проверки связей «где задаётся — где проверяется» */
  for (const d of flagCompileChecks(add, vars, charTags)) { vars.push(d); known.add(d.name); }
  for (const I of info.values()) for (const F of I.files) F.lines.forEach(l => {
    let m = /^\s*(?:define|default|transform)\s+(?:-?\d+\s+)?([A-Za-z_][\w.]*)/.exec(l) || /^\s*\$\s*([A-Za-z_]\w*)\s*=[^=]/.exec(l) || /^\s+([A-Za-z_]\w*)\s*=[^=]/.exec(l);
    if (m) known.add(m[1].split('.')[0]);
    if ((m = /^\s*(?:def|class)\s+([A-Za-z_]\w*)/.exec(l))) known.add(m[1]);
  });

  /* ---------- обработка скриптов ---------- */
  const tlOn = P.tl.langs.length > 0, tlIds = new Set();
  if (tlOn) tlSync();             // перевод идёт за правками скриптов
  const usedFx = new Map();        // 'fx|dissolve' / 'tf|left' → где встретилось
  const usedImgs = new Map();      // имя изображения → [ref]
  const usedNoFile = new Map();    // ассет без файла → Set(ref)
  const unknownSpk = new Map(), unknownAud = new Map();
  const jumps = [];
  let words = 0, emptyFiles = [];
  for (const I of info.values()) for (const F of I.files) {
    const ref = { node: I.n, file: F.f };
    const out = [];
    const tlAt = tlOn ? tlPrepare(F, tlIds) : null;     // реплики получают постоянные id для перевода
    for (let li = 0; li < F.lines.length; li++) {
      let line = F.lines[li];
      if (typeof fnScanLine === 'function') {            // имена файлов: регистр, кириллица, пробелы (filenames.js)
        try {
          const ma = RE_AUDIO.exec(line) || RE_VOICE.exec(line), aa = ma ? findAudio(ma[3]) : null;
          fnScanLine(line, ref, fnTG, fnFound, aa && audioHasFile(aa) ? ma[3] : null);
        } catch (e) { /* не страшно */ }
      }
      if (tlAt && tlAt.has(li)) line = tlWithId(line, tlAt.get(li));
      let m = RE_AUDIO.exec(line) || RE_VOICE.exec(line);
      if (m) {
        const lit = m[3]; const a = findAudio(lit);
        if (!a) { if (!unknownAud.has(lit)) unknownAud.set(lit, ref); }
        else if (!audioHasFile(a)) {
          if (!usedNoFile.has(a)) usedNoFile.set(a, new Set()); usedNoFile.get(a).add(F.f);
          if (opt.skipMissingAudio) line = m[1] + 'pass  # ' + t('cmp.nofile') + ': ' + line.trim();
        } else { const tg = assetTarget.get(a.id + '|'); if (tg !== lit) line = line.replace(lit, tg); }
      }
      if (line.indexOf('{font=') >= 0) line = line.replace(/\{font=([^{}]+)\}/g, (all, ref) => '{font=' + fontPathFor(ref.trim(), ref) + '}');
      out.push(line);
    }
    F.lines = out;
    const src = out.join('\n');
    words += wordCount(src);
    parseUsage(src).forEach(u => {
      if (u.kind === 'fx' || u.kind === 'tf') { const k = u.kind + '|' + u.name; if (!usedFx.has(k)) usedFx.set(k, ref); return; }
      if (u.kind !== 'bg' && u.kind !== 'sprite') return;
      const nm = (u.kind === 'sprite' ? (u.name + ' ' + (u.expr || '')) : u.name).trim().replace(/\s+/g, ' ');
      if (!usedImgs.has(nm)) usedImgs.set(nm, { kind: u.kind, tag: u.name, expr: u.expr || '', refs: [] });
      usedImgs.get(nm).refs.push(ref);
    });
    for (const l of out) {
      let m = /^\s*(?:jump|call)\s+([A-Za-z_]\w*)/.exec(l);
      if (m && !/^\s*#/.test(l)) jumps.push({ to: m[1], ref, kw: l.trim().split(/\s/)[0] });
      m = /^\s*([A-Za-z_]\w*)(?:\s+[\w@.]+)*\s+"/.exec(l);
      if (m && !CMP_NOT_SPEAKER.has(m[1]) && !known.has(m[1]) && !unknownSpk.has(m[1])) unknownSpk.set(m[1], ref);
    }
    if (!out.length) emptyFiles.push(ref);
  }
  if (typeof fnFlush === 'function') { try { fnFlush(add, fnFound); } catch (e) { /* не страшно */ } }
  for (const [tag, ref] of unknownSpk) {
    add('warn', t('cmp.speaker.unknown', tag, ref.file.title || '?'), ref, { label: t('cmp.fix.addchar', tag), run: () => { createChar(tag.charAt(0).toUpperCase() + tag.slice(1), tag); } });
  }
  for (const [lit, ref] of unknownAud) {
    add('warn', t('cmp.audio.unknown', lit), ref, { label: t('cmp.fix.addasset'), run: () => { const a = createAsset(/sfx|sound|snd/i.test(lit) ? 'sfx' : 'music', lit); a.path = lit; commit(true); } });
  }
  for (const c of chars) if (c.font) fontPathFor(c.font, c.font);
  for (const d of GUI_KEYS) if (d.t === 'font' && P.gui && P.gui[d.k]) fontPathFor(P.gui[d.k], P.gui[d.k]);
  for (const a of fontNoFile) add('warn', t('cmp.font.nofile', a.name));
  for (const [ref] of fontUnknown) add('warn', t('cmp.font.unknown', ref));
  for (const [a, set] of usedNoFile) add('warn', t('cmp.audio.nofile', a.name, set.size, opt.skipMissingAudio ? t('cmp.audio.skipped') : ''), null);
  const allLabels = new Set([...declared.keys(), ...[...info.values()].flatMap(I => [I.blk, ...I.files.map(F => F.label)]), 'start', 'quit', 'splashscreen', 'main_menu', 'after_load']);
  const chapLabels = new Set([...declared.keys(), ...[...info.values()].flatMap(I => [I.blk, ...I.files.map(F => F.label)]), 'start']);
  if (cc) for (const n of cc.labels) allLabels.add(n);
  for (const j of jumps) if (!allLabels.has(j.to)) add('warn', t('cmp.jump.missing', j.kw, j.to, j.ref.file.title || '?'), j.ref);
  if (emptyFiles.length) add('info', t('cmp.empty.files', emptyFiles.length, emptyFiles.slice(0, 4).map(r => r.file.title || '?').join(', ') + (emptyFiles.length > 4 ? '…' : '')), emptyFiles[0]);

  /* ---------- определения изображений ---------- */
  const imgDefs = new Map(); // имя → { code, ph }
  if (cc) for (const n of cc.images) imgDefs.set(n, true);       // картинки из своего кода: сборка их не определяет, но знает
  const imgLines = [];
  const phBg = nm => `Fixed(Solid("${PH_COLORS[hashStr(nm) % PH_COLORS.length]}"), Text(${pyStr(nm)}, size=44, color="#ffffff88", xalign=0.5, yalign=0.5))`;
  const phSprite = nm => `Fixed(Solid("${PH_COLORS[hashStr(nm) % PH_COLORS.length]}", xsize=300, ysize=620), Text(${pyStr(nm.replace(/ /g, '\n'))}, size=32, color="#ffffffcc", xalign=0.5, yalign=0.12), xsize=300, ysize=620)`;
  const defImg = (rawName, file, kind) => {
    const nm = cmpImageName(rawName);
    if (nm !== rawName) add('warn', t('cmp.img.badname', rawName, nm));
    if (imgDefs.has(nm)) { add('warn', t('cmp.img.dup', nm)); return; }
    imgDefs.set(nm, true);
    if (file) imgLines.push(`image ${nm} = ${pyStr(file)}`);
    else if (opt.placeholders) imgLines.push(`image ${nm} = ${kind === 'bg' ? phBg(nm) : phSprite(nm)}  # ${t('cmp.img.noart')}`);
    else imgLines.push(`# ${nm}: ${t('cmp.img.noart')}`);
  };
  for (const a of P.assets) {
    if (a.kind === 'bg') defImg(a.name, assetTarget.get(a.id + '|'), 'bg');
    else if (a.kind === 'sprite') {
      if (!a.expr.length) defImg(a.name, assetTarget.get(a.id + '|'), 'sprite');
      else for (const ex of a.expr) defImg(a.name + ' ' + ex, assetTarget.get(a.id + '|' + ex), 'sprite');
    }
  }
  const extraImg = [];
  for (const [nm, u] of usedImgs) {
    const full = cmpImageName(nm);
    if (imgDefs.has(full) || (cc && cc.imgTags.has(u.tag))) continue;
    const spriteAsset = u.kind === 'sprite' ? P.assets.find(a => a.kind === 'sprite' && a.name === u.tag) : null;
    const r = u.refs[0];
    add('warn', spriteAsset ? t('cmp.expr.unknown', u.tag, u.expr.split(/\s+/)[0] || '?') : t('cmp.img.unknown', nm), r,
      { label: t('cmp.fix.addasset'), run: () => { if (u.kind === 'bg') createAsset('bg', nm); else { let a = P.assets.find(x => x.kind === 'sprite' && x.name === u.tag) || createAsset('sprite', u.tag); const ex = u.expr.trim(); if (ex && !a.expr.includes(ex)) a.expr.push(ex); commit(true); } } });
    if (opt.placeholders) { imgDefs.set(full, true); extraImg.push(`image ${full} = ${u.kind === 'bg' ? phBg(full) : phSprite(full)}  # ${t('cmp.img.autoph')}`); }
  }
  const imgNoFile = P.assets.filter(a => (a.kind === 'bg' || a.kind === 'sprite') && !(a.kind === 'sprite' && a.expr.length ? a.expr.every(ex => assetTarget.has(a.id + '|' + ex)) : assetTarget.has(a.id + '|')));
  const phUsed = imgNoFile.filter(a => [...usedImgs.keys()].some(nm => { const u = usedImgs.get(nm); return u.kind === a.kind && (a.kind === 'bg' ? nm === a.name : u.tag === a.name); }));
  if (phUsed.length) add('info', t('cmp.img.nofile', phUsed.length, phUsed.slice(0, 5).map(a => a.name).join(', ') + (phUsed.length > 5 ? '…' : '')));

  /* ---------- концовки и условия открытия ---------- */
  const endingNodes = order.filter(n => n.type === 'ending');
  const creditSecs = creditsModel();
  const unlockNodes = order.filter(n => n.unlock);
  const needEndings = endingNodes.length > 0 || unlockNodes.length > 0;
  const rules = new Map();
  for (const n of unlockNodes) {
    let pool = (n.unlock.from || []).map(id => info.get(id)).filter(Boolean).map(I => I.key).filter(k => k !== info.get(n.id).key);
    if (!pool.length) { pool = endingNodes.filter(x => x !== n).map(x => info.get(x.id).key); add('warn', t('cmp.unlock.empty', n.title), { node: n }); }
    rules.set(info.get(n.id).key, { need: Math.max(1, Math.min(n.unlock.need || 1, pool.length || 1)), pool });
  }
  const isLocked = n => rules.has(info.get(n.id).key);

  /* ---------- «дополнительно»: что нужно знать до сборки блоков (CG, достижения) ---------- */
  const cgItems = () => P.assets.filter(a => a.kind === 'bg' && a.cg && (a.name || '').trim()).map(a => ({ a, nm: cmpImageName(a.name), file: assetTarget.get(a.id + '|') })).filter(x => x.file || opt.placeholders);
  /* достижения: что и куда выдавать. Сами строки vn_grant вставляются в блоки ниже; файл achievements.rpy пишет cmpAchievements */
  const ach = { list: [], byBlock: new Map(), byEnding: new Map(), all: [], cg: [], on: false };
  if (P.achs.length && opt.extras === false) add('warn', t('cmp.ach.off'));
  if (P.achs.length && opt.extras !== false) {
    const keys = achKeys();
    const cgOk = cgItems().length > 0;
    for (const a of P.achs) {
      if (!String(a.title || '').trim()) { add('info', t('cmp.ach.notitle')); continue; }
      const key = keys.get(a.id), node = a.ref ? nodeById(a.ref) : null, rec = { a, key, auto: false };
      if (a.trig === 'ending' || a.trig === 'block') {
        const ok = node && info.has(node.id) && (a.trig === 'block' || node.type === 'ending');
        if (!ok) add('warn', t('cmp.ach.noref', a.title));
        else { rec.auto = true; const m = a.trig === 'ending' ? ach.byEnding : ach.byBlock; (m.get(node.id) || m.set(node.id, []).get(node.id)).push(key); }
      } else if (a.trig === 'endings_all') {
        if (!endingNodes.length) add('warn', t('cmp.ach.noending', a.title)); else { rec.auto = true; ach.all.push(key); }
      } else if (a.trig === 'cg_all') {
        if (!cgOk) add('warn', t('cmp.ach.nocg', a.title)); else { rec.auto = true; ach.cg.push(key); }
      }
      ach.list.push(rec);
    }
    ach.on = ach.list.length > 0;
    const known = new Set(ach.list.map(x => x.key));
    const warned = new Set();
    for (const lines of scriptLines.values()) for (const l of lines) {
      const re = /\bvn_grant\(\s*(["'])([^"']*)\1/g; let m;
      while ((m = re.exec(l))) if (!known.has(m[2]) && !warned.has(m[2])) { warned.add(m[2]); add('warn', t('cmp.ach.unknown', m[2])); }
    }
  }

  /* ---------- маршрутизация блоков (script.rpy) ---------- */
  const spine = new Map();
  const edgeChoice = e => {
    const tn = nodeById(e.to);
    const conds = [];
    const c = cmpCond(e.cond);
    if (c) { if (cmpBalanced(c)) conds.push(c); else add('warn', t('cmp.cond.bad', c), { node: nodeById(e.from) }); }
    if (isLocked(tn)) conds.push(`is_unlocked(${pyStr(info.get(tn.id).key)})`);
    const sets = [];
    for (const st of e.sets || []) {
      const v = varById(st.v), ln = v && setLine(v, st);
      if (!ln) { add('warn', t('flag.set.bad', e.title || tn.title), { node: nodeById(e.from) }); continue; }
      if (!vars.some(x => x.name === v.name)) { add('warn', t('flag.set.skipped', v.name), { node: nodeById(e.from) }); continue; }
      sets.push(ln);
    }
    return { tn, cond: conds.length > 1 ? conds.map(x => `(${x})`).join(' and ') : conds[0] || '', code: [...sets, ...cmpEdgeCode(e.code)] };
  };
  for (const I of info.values()) {
    const n = I.n, body = [];
    for (const k of ach.byBlock.get(n.id) || []) body.push(`$ vn_grant(${pyStr(k)})`);
    n.files.length && I.files.forEach(F => body.push(`call ${F.label}` + (F.f.title ? '  # ' + F.f.title.replace(/\n/g, ' ') : '')));
    if (n.type === 'ending') {
      body.push(`$ reach_ending(${pyStr(I.key)})`);
      for (const k of ach.byEnding.get(n.id) || []) body.push(`$ vn_grant(${pyStr(k)})`);
      if (ach.all.length || ach.cg.length) body.push('$ vn_check_progress()');
      const card = tlEndingCard(n, opt);
      if (card) body.push(`centered "${card}"`);
      if (opt.endingCredits && creditSecs.length) body.push('call credits');
    }
    const outs = outsOf.get(n.id);
    if (!outs.length) {
      if (n.type !== 'ending' && reachable.has(n.id)) add('warn', t('cmp.deadend', n.title), { node: n });
      body.push('return');
    } else if (outs.length === 1) {
      const ch = edgeChoice(outs[0]);
      if (cmpCond(outs[0].cond)) add('info', t('cmp.cond.single', n.title), { node: n });
      const ind = isLocked(ch.tn) ? '    ' : '';
      if (isLocked(ch.tn)) body.push(`if is_unlocked(${pyStr(info.get(ch.tn.id).key)}):`);
      ch.code.forEach(c => body.push(ind + c));
      body.push(ind + 'jump ' + info.get(ch.tn.id).blk);
      if (isLocked(ch.tn)) body.push('return');
    } else {
      body.push('menu:');
      if (n.prompt && n.prompt.trim()) body.push('    "' + rpyEsc(n.prompt.trim()) + '"');
      let anyFree = false;
      for (const e of outs) {
        const ch = edgeChoice(e);
        let title = (e.title || '').trim();
        if (!title) { title = ch.tn.title; add('warn', t('cmp.edge.notitle', n.title, ch.tn.title), { node: n }); }
        if (!ch.cond) anyFree = true;
        body.push(`    "${rpyEsc(title)}"${ch.cond ? ' if ' + ch.cond : ''}:`);
        ch.code.forEach(c => body.push('        ' + c));
        body.push('        jump ' + info.get(ch.tn.id).blk);
      }
      if (!anyFree) add('warn', t('cmp.menu.allcond', n.title), { node: n });
    }
    if (!body.length) body.push('pass');
    spine.set(n.id, body);
  }

  /* ---------- сборка текстов ---------- */
  const bar = '# ' + '─'.repeat(62);
  const hdr = (name) => [bar, '#  ' + name, '#  ' + t('cmp.hdr.gen'), bar, ''];
  const fileBody = (I, F) => {
    const f = F.f, L = [];
    L.push(bar.slice(0, 40));
    L.push('# ' + (f.title || t('file.untitled')) + '   [' + t('status.' + f.status) + ']');
    if (f.summary) f.summary.split('\n').forEach(l => L.push('# ' + l));
    const cast = effectiveCast(I.n, f).all.map(charById).filter(Boolean).map(c => c.name || c.tag);
    if (cast.length) L.push('# ' + t('rpy.cast') + ': ' + cast.join(', '));
    if (f.location) L.push('# ' + t('cmp.location') + ': ' + f.location);
    L.push(bar.slice(0, 40));
    if (F.self) { L.push(...F.lines); L.push('return'); }
    else {
      L.push(`label ${F.label}:`);
      if (F.lines.length) F.lines.forEach(l => L.push(l.trim() ? '    ' + l : ''));
      else { L.push('    # ' + t('cmp.todo')); L.push('    pass'); }
      L.push('    return');
    }
    return L.join('\n') + '\n';
  };
  const blockSpine = I => {
    const n = I.n, L = [];
    L.push(bar);
    L.push(`# ${String(I.idx + 1).padStart(2, '0')}. ${n.title}   [${t('type.' + n.type)}${!reachable.has(n.id) ? ', ' + t('cmp.unreach.tag') : ''}]`);
    if (n.desc) n.desc.split('\n').forEach(l => L.push('# ' + l));
    L.push(bar);
    L.push(`label ${I.blk}:`);
    spine.get(n.id).forEach(l => L.push('    ' + l));
    L.push('');
    return L.join('\n');
  };

  // script.rpy: старт + (в режиме одного файла) все главы
  const S1 = hdr(P.name || 'project');
  S1.push(...t('cmp.hdr.script').split('\n').map(l => '# ' + l), '');
  S1.push('label start:');
  const startI = info.get(start.id);
  if (bonus.length) {
    const cond = bonus.map(b => `is_unlocked(${pyStr(info.get(b.id).key)})`).join(' or ');
    S1.push(`    if ${cond}:`, '        menu:', `            "${rpyEsc(t('cmp.newgame'))}":`, `                jump ${startI.blk}`);
    for (const b of bonus) S1.push(`            "${rpyEsc(b.title)}" if is_unlocked(${pyStr(info.get(b.id).key)}):`, `                jump ${info.get(b.id).blk}`);
  }
  S1.push(`    jump ${startI.blk}`, '');
  for (const I of info.values()) {
    S1.push(blockSpine(I));
    if (opt.mode === 'single') for (const F of I.files) S1.push(fileBody(I, F));
  }
  R.files.push({ path: 'game/script.rpy', text: S1.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n' });

  // characters.rpy
  const C = hdr(t('cmp.f.chars'));
  if (!chars.length) C.push('# ' + t('cmp.chars.none'));
  for (const c of chars) {
    const fp = c.font ? fontPathFor(c.font, c.font) : '';
    C.push(`define ${c.tag} = Character(_(${pyStr(cmpGameName(c))}), color=${pyStr(cmpGameColor(c))}${c.textColor ? ', what_color=' + pyStr(c.textColor) : ''}${fp ? ', what_font=' + pyStr(fp) : ''})`);
  }
  R.files.push({ path: 'game/characters.rpy', text: C.join('\n') + '\n' });

  // credits.rpy: титры из участников проекта
  if (creditSecs.length) {
    const K = hdr(t('cmp.f.credits'));
    K.push('# ' + t('cmp.credits.how'), 'label credits:', '    scene black with fade');
    K.push(`    centered "${tlCreditsTitle()}"`);
    for (const sec of creditSecs) K.push(`    centered "${tlCreditsSec(sec)}"`);
    K.push('    return');
    R.files.push({ path: 'game/credits.rpy', text: K.join('\n') + '\n' });
    if (!opt.endingCredits) add('info', t('cmp.credits.info'));
  }

  // variables.rpy
  if (vars.length) {
    const V = hdr(t('cmp.f.vars'));
    for (const v of vars) V.push(`default ${v.name} = ${v.value}` + (v.auto ? '  # ' + t('flag.auto.c') : ''));
    R.files.push({ path: 'game/variables.rpy', text: V.join('\n') + '\n' });
  }

  // endings.rpy
  if (needEndings) {
    const E = hdr(t('cmp.f.endings'));
    E.push('default persistent.endings = set()', '', 'init -2 python:');
    E.push('    # ' + t('cmp.endings.list'), '    ENDINGS = [');
    endingNodes.forEach(n => E.push(`        (${pyStr(info.get(n.id).key)}, ${pyStr(n.title)}),`));
    E.push('    ]', '    # ' + t('cmp.endings.rules'), '    ENDING_RULES = {');
    for (const [key, r] of rules) E.push(`        ${pyStr(key)}: (${r.need}, [${r.pool.map(pyStr).join(', ')}]),`);
    E.push('    }', '',
      '    def reach_ending(key):', '        if key not in persistent.endings:', '            persistent.endings.add(key)', '        renpy.save_persistent()', '',
      '    def is_unlocked(key):', '        rule = ENDING_RULES.get(key)', '        if rule is None:', '            return True', '        need, pool = rule',
      '        return len([k for k in pool if k in persistent.endings]) >= need', '',
      '    def endings_count():', '        return len(persistent.endings)', '',
      '    def endings_total():', '        return len(ENDINGS)');
    R.files.push({ path: 'game/endings.rpy', text: E.join('\n') + '\n' });
  }

  /* ---------- переходы и трансформы: свои определения и проверка имён ---------- */
  const fxDefs = P.assets.filter(a => (a.kind === 'fx' || a.kind === 'tf') && fxIsCustom(a));
  const fxOut = { tr: [], tf: [] }, fxSeen = new Set();
  for (const a of fxDefs) {
    const nm = (a.name || '').trim();
    if (!/^[A-Za-z_]\w*$/.test(nm)) { add('warn', t('cmp.fx.badname', nm || '?')); continue; }
    if (fxSeen.has(nm) || charTags.has(nm) || vars.some(v => v.name === nm)) { add('warn', t('cmp.fx.dup', nm)); continue; }
    fxSeen.add(nm); known.add(nm);
    if (a.kind === 'fx') {
      const code = a.code.replace(/\s*\n\s*/g, ' ').trim();
      if (!cmpBalanced(code)) { add('warn', t('cmp.fx.expr', nm)); continue; }
      fxOut.tr.push(`define ${nm} = ${code}`);
    } else {
      const lines = a.code.replace(/\t/g, '    ').split('\n').filter(l => l.trim());
      const ind = Math.min(...lines.map(l => /^ */.exec(l)[0].length));
      fxOut.tf.push(`transform ${nm}:`, ...lines.map(l => '    ' + l.slice(ind).replace(/\s+$/, '')), '');
    }
  }
  const FX_EXTRA = { fx: new Set(['None']), tf: new Set(['default', 'reset']) };
  for (const [k, ref] of usedFx) {
    const kind = k.slice(0, 2), name = k.slice(3);
    if (fxBuiltin(kind, name) || FX_EXTRA[kind].has(name) || known.has(name)) continue;
    const reg = P.assets.find(a => a.kind === kind && a.name === name);
    add('warn', t(reg ? 'cmp.fx.undef' : kind === 'fx' ? 'cmp.fx.unknown' : 'cmp.tf.unknown', name), ref,
      { label: t('cmp.fx.fix', name), run: () => { const a = reg || createAsset(kind, name); a.tpl = kind === 'fx' ? 'dissolve' : 'fadein'; a.params = fxTplDefaults(kind, a.tpl); a.code = fxGen(kind, a.tpl, a.params); commit(true); } });
  }
  if (fxOut.tr.length || fxOut.tf.length) {
    const X = hdr(t('cmp.f.effects'));
    if (fxOut.tr.length) X.push('# ' + t('cmp.fx.h.tr'), ...fxOut.tr, '');
    if (fxOut.tf.length) X.push('# ' + t('cmp.fx.h.tf'), ...fxOut.tf);
    R.files.push({ path: 'game/effects.rpy', text: X.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n' });
  }

  // assets.rpy
  {
    const A = hdr(t('cmp.f.assets'));
    A.push('# ' + t('cmp.assets.hint'), '');
    if (!imgLines.length && !extraImg.length) A.push('# ' + t('cmp.assets.none'));
    A.push(...imgLines);
    if (extraImg.length) A.push('', '# ' + t('cmp.assets.auto'), ...extraImg);
    R.files.push({ path: 'game/assets.rpy', text: A.join('\n') + '\n' });
  }

  /* ---------- «дополнительно»: готовые экраны Ren'Py (галерея CG и др.) ---------- */
  R.extras = [];
  if (opt.extras !== false) cmpExtras();
  cmpGui();

  // story/*.rpy
  if (opt.mode !== 'single') for (const I of info.values()) for (const F of I.files) R.files.push({ path: F.path, text: fileBody(I, F), story: true });
  if (cc) ccEmit(cc, R, add, { charTags, varNames: new Set(vars.map(v => v.name)), ownLabels: chapLabels });   // свой код: как есть + проверки

  // docs
  if (opt.includeDocs) {
    R.files.push({ path: 'docs/story_map.md', text: storyMapMd() });
  }
  // перевод: файлы game/tl/<язык>/ и выбор языка
  if (tlOn) tlEmit(R, { info, opt, add, assetTarget, fixFonts: x => (x.indexOf('{font=') >= 0 ? x.replace(/\{font=([^{}]+)\}/g, (all, ref) => '{font=' + fontPathFor(ref.trim(), ref) + '}') : x) });
  if (opt.includeSource) R.files.push({ path: 'source/' + slug(P.name) + '.vnmap.json', text: JSON.stringify(P, null, 1) });

  return finish();

  /** Экраны для меню игры: игрок открывает их кнопкой, которую автор добавляет в navigation (см. подсказку в окне «Сборка»). */
  function cmpExtras() {
    cmpGallery(); cmpMusicRoom(); cmpAchievements();
  }
  /* интерфейс игры: значения gui.* и свои пути картинок поверх стандартного gui.rpy. Сами картинки идут в game/gui/ под стандартными именами и заменяют файлы шаблона. */
  function cmpGui() {
    const g = guiClean(P.gui), over = {};
    let imgs = 0;
    for (const a of P.assets) {
      if (a.kind !== 'gui' || !assetTarget.has(a.id + '|')) continue;
      imgs++;
      const s = guiSlot(a.name), tg = assetTarget.get(a.id + '|');
      if (s && s.over && tg !== s.path) over[s.k] = tg;
    }
    const vals = GUI_KEYS.filter(d => g[d.k] !== undefined);
    if (imgs) add('info', t('cmp.gui.imgs', imgs));
    if (!vals.length && !Object.keys(over).length) return;
    const G = hdr(t('cmp.f.gui'));
    G.push('# ' + t('cmp.gui.hint'), '# ' + t('cmp.gui.derived'), '', '# ' + t('cmp.gui.early'), 'init -1 python:');
    if (vals.length) G.push(
      '    def _gui_set(name, value, derived=()):', '        old = getattr(gui, name, None)', '        for d in derived:',
      '            if hasattr(gui, d) and getattr(gui, d) == old:', '                setattr(gui, d, value)', '        setattr(gui, name, value)', '');
    for (const d of vals) {
      const val = d.t === 'size' ? g[d.k] : pyStr(d.t === 'font' ? fontPathFor(g[d.k], g[d.k]) : g[d.k]), der = GUI_DERIVED[d.k];
      G.push('    _gui_set(' + pyStr(d.k) + ', ' + val + (der ? ', (' + der.map(pyStr).join(', ') + ',)' : '') + ')');
    }
    if (over.main_menu) G.push('    gui.main_menu_background = ' + pyStr(over.main_menu));
    if (over.game_menu) G.push('    gui.game_menu_background = ' + pyStr(over.game_menu));
    if (over.window_icon) G.push('    config.window_icon = ' + pyStr(over.window_icon));
    if (!vals.length) G.push('    pass');
    R.files.push({ path: 'game/gui_custom.rpy', text: G.join('\n') + '\n' });
    add('info', t('cmp.gui.file', vals.length + Object.keys(over).length));
  }
  /* галерея CG */
  function cmpGallery() {
    const W = 320, H = 180;
    const cgs = P.assets.filter(a => a.kind === 'bg' && a.cg && (a.name || '').trim());
    const items = [];
    for (const a of cgs) {
      const nm = cmpImageName(a.name), file = assetTarget.get(a.id + '|');
      if (!file && !opt.placeholders) { add('warn', t('cmp.cg.nofile', a.name)); continue; }
      if (!file) add('info', t('cmp.cg.ph', a.name));
      items.push({ nm, file, a });
    }
    if (!items.length) return;
    const G = hdr(t('cmp.f.gallery'));
    G.push('# ' + t('cmp.cg.hint'), '', 'init python:', '    cg_gallery = Gallery()', '    cg_gallery.transition = dissolve', '    CG_ITEMS = []', '    CG_NAMES = []', '');
    items.forEach((it, i) => {
      const key = 'cg' + (i + 1);
      const thumb = it.file ? `im.Scale(${pyStr(it.file)}, ${W}, ${H})` : `Fixed(Solid("${PH_COLORS[hashStr(it.nm) % PH_COLORS.length]}", xsize=${W}, ysize=${H}), Text(${pyStr(it.nm)}, size=26, color="#ffffffcc", xalign=0.5, yalign=0.5), xsize=${W}, ysize=${H})`;
      G.push(`    cg_gallery.button(${pyStr(key)})`, `    cg_gallery.unlock_image(${pyStr(it.nm)})`, `    CG_ITEMS.append((${pyStr(key)}, ${thumb}))`, `    CG_NAMES.append(${pyStr(it.nm)})`, '');
    });
    G.push(
      `    CG_LOCKED = Fixed(Solid("#1d1d26", xsize=${W}, ysize=${H}), Text("?", size=64, color="#ffffff55", xalign=0.5, yalign=0.5), xsize=${W}, ysize=${H})`, '',
      '    def cg_seen_count():', '        return len([n for n in CG_NAMES if renpy.seen_image(tuple(n.split()))])', '',
      'screen cg_gallery():', '    tag menu', '    add Solid("#000000")',
      `    text _(${pyStr(t('cmp.cg.title'))}) size 56 xalign 0.5 ypos 40`,
      '    text "%d / %d" % (cg_seen_count(), len(CG_NAMES)) size 28 xalign 0.5 ypos 112',
      '    vpgrid:', '        cols 3', '        spacing 24', '        xalign 0.5', '        ypos 170',
      '        xysize (config.screen_width - 160, config.screen_height - 300)', '        mousewheel True', '        scrollbars "vertical"',
      '        for key, thumb in CG_ITEMS:', '            add cg_gallery.make_button(key, thumb, locked=CG_LOCKED)',
      `    textbutton _(${pyStr(t('cmp.extras.back'))}) action Return() xalign 0.5 yalign 0.97`);
    R.files.push({ path: 'game/gallery.rpy', text: G.join('\n') + '\n' });
    R.extras.push({ id: 'cg', screen: 'cg_gallery', label: t('cmp.cg.title'), count: items.length });
  }
  /* музыкальная комната: вся музыка с файлом, кроме снятой галочкой в реестре */
  function cmpMusicRoom() {
    const songs = [];
    for (const a of P.assets) {
      if (a.kind !== 'music' || a.room === false || !(a.name || '').trim()) continue;
      if (!audioHasFile(a)) { add('info', t('cmp.mr.nofile', a.name)); continue; }
      songs.push({ title: a.name.trim(), file: assetTarget.get(a.id + '|') });
    }
    if (!songs.length) return;
    const M = hdr(t('cmp.f.musicroom'));
    M.push('# ' + t('cmp.mr.hint'), '', 'init python:', '    music_room = MusicRoom(fadeout=1.0, loop=True)', '    MUSIC_TRACKS = []', '');
    for (const sg of songs) M.push(`    music_room.add(${pyStr(sg.file)}, always_unlocked=False)`, `    MUSIC_TRACKS.append((${pyStr(achTxt(sg.title))}, ${pyStr(sg.file)}))`, '');
    M.push(
      '    def music_heard_count():', '        return len([f for n, f in MUSIC_TRACKS if renpy.seen_audio(f)])', '',
      'screen music_room():', '    tag menu', '    add Solid("#000000")',
      `    text _(${pyStr(t('cmp.mr.title'))}) size 56 xalign 0.5 ypos 40`,
      '    text "%d / %d" % (music_heard_count(), len(MUSIC_TRACKS)) size 28 xalign 0.5 ypos 112',
      '    vpgrid:', '        cols 1', '        spacing 10', '        xalign 0.5', '        ypos 170',
      '        xysize (min(config.screen_width - 160, 900), config.screen_height - 360)', '        mousewheel True', '        scrollbars "vertical"',
      '        for title, file in MUSIC_TRACKS:',
      '            if renpy.seen_audio(file):', '                textbutton title action music_room.Play(file) xfill True',
      '            else:', '                textbutton "???" action NullAction() xfill True sensitive False',
      '    textbutton "■" action music_room.Stop() xalign 0.5 yalign 0.88',
      `    textbutton _(${pyStr(t('cmp.extras.back'))}) action [music_room.Stop(), Return()] xalign 0.5 yalign 0.97`);
    R.files.push({ path: 'game/musicroom.rpy', text: M.join('\n') + '\n' });
    R.extras.push({ id: 'music', screen: 'music_room', label: t('cmp.mr.title'), count: songs.length });
  }
  /* достижения: список, выдача vn_grant, всплывающее окно, экран, передача в Steam */
  function cmpAchievements() {
    if (!ach.on) return;
    const A = hdr(t('cmp.f.ach'));
    A.push('# ' + t('cmp.ach.hint'), '', 'default persistent.vn_ach = set()', '', 'init -2 python:', '    # id, название, описание, значок, скрытое', '    ACHIEVEMENTS = [');
    for (const r of ach.list) A.push(`        (${pyStr(r.key)}, ${pyStr(achTxt(r.a.title))}, ${pyStr(achTxt(r.a.desc))}, ${pyStr(Array.from(String(r.a.icon || '★')).slice(0, 2).join('') || '★')}, ${r.a.hidden ? 'True' : 'False'}),`);
    A.push('    ]', '    ACH_INFO = dict([(a[0], a) for a in ACHIEVEMENTS])', '',
      '    # Steam: если подключён модуль achievement, достижения регистрируются и передаются в Steam; без него ничего не ломается',
      '    for _a in ACHIEVEMENTS:', '        try:', '            achievement.register(_a[0])', '        except Exception:', '            pass', '',
      '    def vn_ach_has(key):', '        return key in persistent.vn_ach', '',
      '    def vn_ach_count():', '        return len(persistent.vn_ach)', '',
      '    def vn_grant(key):', '        if key not in ACH_INFO or key in persistent.vn_ach:', '            return',
      '        persistent.vn_ach.add(key)', '        renpy.save_persistent()', '        try:', '            achievement.grant(key)', '            achievement.sync()', '        except Exception:', '            pass',
      '        info = ACH_INFO[key]', '        renpy.show_screen("vn_ach_popup", info[1], info[2], info[3], _tag="vn_ach_popup")', '',
      '    def vn_check_progress():');
    const prog = [];
    for (const k of ach.all) prog.push('        if endings_total() and endings_count() >= endings_total():', `            vn_grant(${pyStr(k)})`);
    for (const k of ach.cg) prog.push('        if CG_NAMES and cg_seen_count() >= len(CG_NAMES):', `            vn_grant(${pyStr(k)})`);
    A.push(...(prog.length ? prog : ['        pass']), '',
      'transform vn_ach_in:', '    on show:', '        alpha 0.0 xoffset 60', '        easein 0.35 alpha 1.0 xoffset 0', '    on hide:', '        easeout 0.3 alpha 0.0 xoffset 60', '',
      'screen vn_ach_popup(title, desc, ic):', '    zorder 190', '    frame:', '        at vn_ach_in', '        xalign 1.0', '        yalign 0.0', '        xmargin 24', '        ymargin 24', '        padding (22, 14)',
      '        hbox:', '            spacing 16', '            text ic size 44 yalign 0.5 color "#ffd24a"', '            vbox:', '                yalign 0.5',
      `                text _(${pyStr(t('cmp.ach.got'))}) size 18 color "#ffffff99"`, '                text title size 28', '                if desc:', '                    text desc size 20 color "#ffffffcc"',
      '    timer 4.0 action Hide("vn_ach_popup")', '',
      'screen achievements():', '    tag menu', '    add Solid("#000000")',
      `    text _(${pyStr(t('cmp.ach.title'))}) size 56 xalign 0.5 ypos 40`,
      '    text "%d / %d" % (vn_ach_count(), len(ACHIEVEMENTS)) size 28 xalign 0.5 ypos 112',
      '    on "show" action Function(vn_check_progress)',
      '    vpgrid:', '        cols 1', '        spacing 14', '        xalign 0.5', '        ypos 170',
      '        xysize (min(config.screen_width - 160, 1100), config.screen_height - 300)', '        mousewheel True', '        scrollbars "vertical"',
      '        for key, title, desc, ic, hidden in ACHIEVEMENTS:', '            $ got = vn_ach_has(key)',
      '            frame:', '                xfill True', '                padding (22, 14)', '                hbox:', '                    spacing 20',
      '                    text (ic if got else "?") size 44 yalign 0.5 min_width 56 color ("#ffd24a" if got else "#ffffff44")',
      '                    vbox:', '                        yalign 0.5', '                        if got or not hidden:',
      '                            text title size 28 color ("#ffffff" if got else "#ffffff88")', '                            text desc size 20 color ("#ffffffcc" if got else "#ffffff66")',
      '                        else:', `                            text _(${pyStr(t('cmp.ach.hiddenname'))}) size 28 color "#ffffff55"`,
      `    textbutton _(${pyStr(t('cmp.extras.back'))}) action Return() xalign 0.5 yalign 0.97`);
    R.files.push({ path: 'game/achievements.rpy', text: A.join('\n') + '\n' });
    R.extras.push({ id: 'ach', screen: 'achievements', label: t('cmp.ach.title'), count: ach.list.length });
  }

  function finish() {
    const sev = { error: 0, warn: 1, info: 2 };
    R.items.sort((a, b) => sev[a.level] - sev[b.level]);
    let bytes = 0;
    R.files.forEach(f => bytes += new TextEncoder().encode(f.text).length);
    R.bin.forEach(b => bytes += b.size || 0);
    const menus = [...spine.values()].filter(b => b.includes('menu:')).length;
    R.stats = {
      blocks: order.length, files: [...info.values()].reduce((x, I) => x + I.files.length, 0), empty: emptyFiles.length, words, menus, endings: endingNodes.length,
      assetFiles: R.bin.length, images: imgDefs.size, bytes, errors: R.items.filter(i => i.level === 'error').length, warns: R.items.filter(i => i.level === 'warn').length
    };
    R.start = start ? start.id : null;
    try {      // для встроенного плеера: какая метка какому блоку принадлежит и правила концовок
      R.blockLabels = [...info.values()].map(I => ({ id: I.n.id, label: I.blk, title: I.n.title, type: I.n.type, idx: I.idx, reach: reachable.has(I.n.id), files: I.files.map(F => ({ id: F.f.id, label: F.label, title: F.f.title || '' })) }));
      R.endingsData = { list: endingNodes.map(n => ({ key: info.get(n.id).key, title: n.title })), rules: Object.fromEntries([...rules].map(([k, r]) => [k, { need: r.need, pool: r.pool }])) };
    } catch (e) { R.blockLabels = []; R.endingsData = { list: [], rules: {} }; }
    R.achData = { list: ach.on ? ach.list.map(r => ({ key: r.key, title: r.a.title, hidden: !!r.a.hidden })) : [], all: ach.all.slice(), cg: ach.cg.slice() };
    if (R.files.length) R.files.push({ path: 'README.md', text: cmpReadme(R) });
    if (opt.includeDocs && R.files.length) R.files.push({ path: 'docs/build_report.md', text: cmpReportMd(R) });
    return R;
  }
}

function cmpReadme(R) {
  return t('cmp.readme', P.name || 'project', R.stats.blocks, R.stats.files, R.stats.endings, R.stats.assetFiles)
    + (P.tl.langs.length ? t('cmp.tl.readme', [P.tl.base || t('tl.base.default'), ...P.tl.langs.map(l => l.name)].join(', ')) : '');
}
function cmpReportMd(R) {
  const L = ['# ' + t('cmp.report.title', P.name || ''), ''];
  const sym = { error: '❌', warn: '⚠️', info: 'ℹ️' };
  if (!R.items.length) L.push(t('cmp.report.clean'));
  for (const it of R.items) L.push(`- ${sym[it.level]} ${it.msg}`);
  return L.join('\n') + '\n';
}

/** Какие файлы ассетов реально лежат в хранилище. */
async function availableBlobs() {
  const set = new Set();
  for (const a of P.assets) for (const m of Object.values(a.files || {})) if (m && m.bid && await blobGet(m.bid)) set.add(m.bid);
  return set;
}
async function buildGameEntries(res) {
  const entries = res.files.map(f => ({ name: f.path, data: f.text }));
  for (const b of res.bin) {
    const blob = await blobGet(b.bid);
    if (blob) entries.push({ name: b.path, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return entries;
}
async function buildGameZip(res) { return makeZip(await buildGameEntries(res)); }

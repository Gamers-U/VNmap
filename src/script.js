'use strict';
/* ====== Ren'Py: подсветка, разбор ассетов, конвертер реплик, генерация файлов ====== */
const RPY_KW = new Set('label scene show hide play stop queue with menu jump call return if elif else while pause define default init python at as behind onlayer zorder fadein fadeout loop noloop voice window transform image screen pass music sound audio expression True False None'.split(' '));

function highlightRenpy(src, tags) {
  const re = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\$)|\b(\d+(?:\.\d+)?)\b|(^[ \t]*)([A-Za-z_]\w*)(?=[ \t]+["'])|\b([A-Za-z_]\w*)\b/gm;
  let out = '', last = 0, m;
  const sp = (c, x) => `<span class="${c}">${escHtml(x)}</span>`;
  while ((m = re.exec(src))) {
    out += escHtml(src.slice(last, m.index));
    if (m[1]) out += sp('tk-com', m[1]);
    else if (m[2]) out += sp('tk-str', m[2]);
    else if (m[3]) out += sp('tk-var', '$');
    else if (m[4]) out += sp('tk-num', m[4]);
    else if (m[6] !== undefined) {
      out += escHtml(m[5] || '');
      const w = m[6];
      out += RPY_KW.has(w) ? sp('tk-kw', w) : tags.has(w) ? sp('tk-tag', w) : escHtml(w);
    } else if (m[7]) out += RPY_KW.has(m[7]) ? sp('tk-kw', m[7]) : escHtml(m[7]);
    last = re.lastIndex;
    if (m[0] === '') re.lastIndex++;
  }
  return out + escHtml(src.slice(last));
}

/* ---- разбор использованных ассетов ---- */
const STOP = new Set(['at', 'with', 'behind', 'as', 'onlayer', 'zorder', 'fadein', 'fadeout', 'loop', 'noloop', 'if']);
function parseUsage(script) {
  const out = [], seen = new Set();
  const add = (kind, name, expr) => {
    const key = kind + '|' + name + '|' + (expr || '');
    if (!name || seen.has(key)) return; seen.add(key);
    out.push({ kind, name, expr: expr || '' });
  };
  for (const raw of String(script || '').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    let m;
    const toks = line.split(/\s+/);
    const head = (arr) => { const o = []; for (const w of arr) { if (STOP.has(w) || /^["']/.test(w)) break; o.push(w); } return o; };
    if (toks[0] === 'scene') {
      const nm = head(toks.slice(1));
      if (nm.length && !['black', 'expression'].includes(nm[0])) add('bg', nm.join(' '));
    } else if (toks[0] === 'show') {
      const nm = head(toks.slice(1));
      if (nm.length && !['text', 'screen', 'expression'].includes(nm[0])) add('sprite', nm[0], nm.slice(1).join(' '));
      const at = line.replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""').match(/\bat\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)/);
      if (at) at[1].split(',').forEach(x => add('tf', x.trim()));
    } else if ((m = line.match(/^(?:play|queue)\s+(music|sound|audio|voice)\s+(?:\[?\s*)?["']([^"']+)["']/))) {
      add(m[1] === 'music' ? 'music' : m[1] === 'voice' ? 'voice' : 'sfx', m[2]);
    } else if ((m = line.match(/^voice\s+["']([^"']+)["']/))) add('voice', m[1]);
    if ((m = line.match(/\bwith\s+([A-Za-z_]\w*)\s*$/)) && m[1] !== 'None') add('fx', m[1]);
  }
  return out;
}
function matchAsset(u) {
  const low = u.name.toLowerCase();
  return P.assets.find(a => a.kind === u.kind && (a.name.toLowerCase() === low || (a.path && a.path.toLowerCase() === low))) || null;
}

/* ---- конвертер: проза → реплики Ren'Py ---- */
const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function termRegex(term) {
  let stem = term;
  if (stem.length >= 4 && /[аяйьеоуыиэю]$/i.test(stem)) stem = stem.slice(0, -1);
  return new RegExp('(?<![\\p{L}\\d_])' + reEsc(stem) + '[\\p{L}]*', 'iu');
}
function nameMatcher(chars) {
  const items = [];
  for (const c of chars) {
    const terms = new Set();
    [c.name, c.tag, ...String(c.aliases || '').split(',')].forEach(x => { x = (x || '').trim(); if (x.length >= 2) terms.add(x); });
    String(c.name || '').split(/\s+/).forEach(w => { if (w.length >= 3) terms.add(w); });
    for (const term of terms) items.push({ c, re: termRegex(term) });
  }
  return text => {
    let best = null;
    for (const it of items) { const m = it.re.exec(text); if (m && (!best || m.index < best.index)) best = { c: it.c, index: m.index }; }
    return best ? best.c : null;
  };
}
const SPEECH_VERB = /^(?:сказал|сказала|спросил|спросила|ответил|ответила|крикнул|крикнула|прошептал|прошептала|воскликнул|воскликнула|буркнул|буркнула|заметил|заметила|произнёс|произнесла|добавил|добавила|улыбнул|усмехнул|кивнул|вздохнул|said|asked|replied|whispered|shouted)/iu;
function cleanText(x) { return x.replace(/\s+/g, ' ').replace(/^[\s—–-]+|[\s—–-]+$/g, '').trim(); }
function convertText(raw, castChars, opts = {}) {
  const chars = castChars && castChars.length ? castChars : P.characters;
  const findCast = nameMatcher(chars), findAll = chars === P.characters ? findCast : nameMatcher(P.characters);
  const find = text => findCast(text) || findAll(text);
  const srcLines = String(raw || '').replace(/\r/g, '').split('\n');
  const lines = [], lineNo = [];
  srcLines.forEach((l, i) => { const x = l.trim(); if (x) { lines.push(x); lineNo.push(i); } });
  const rows = [], hist = []; let cur = 0;
  const push = (sp, text) => {
    text = cleanText(text); if (!text) return;
    if (opts.md) text = prMd(text);
    if (opts.split) splitSentences(text).forEach(part => rows.push({ sp, text: part, line: cur }));
    else rows.push({ sp, text: text.replace(/\u2060/g, ''), line: cur });
    if (sp && sp !== '?' && hist[0] !== sp) { hist.unshift(sp); hist.length = Math.min(hist.length, 2); }
  };
  const guess = () => {
    if (!opts.alternate) return '?';
    if (hist.length >= 2) return hist[1];
    if (hist.length === 1 && chars.length === 2) return chars.find(c => c.id !== hist[0]).id;
    return '?';
  };
  const isAttr = seg => {
    if (/^\p{Ll}/u.test(seg)) return true;
    if (SPEECH_VERB.test(seg)) return true;
    const words = seg.split(/\s+/);
    return words.length <= 7 && !/[?!]$/.test(seg) && !!find(words[0]) && words.length > 1;
  };
  const dashRe = /^[—–-]\s*/, splitRe = /\s[—–-]\s+/;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]; let m; cur = lineNo[li];
    if (opts.cmds) {
      if (/^\/\//.test(line) || /^%\s/.test(line)) continue;                       // заметка автору и «Название» документа: в сценарий не попадают
      if (/^@/.test(line)) { rows.push({ cmd: line.replace(/^@ ?/, ''), line: cur }); continue; }   // команда Ren'Py как есть
      if ((m = line.match(/^#{1,6}\s+(.+)$/))) { rows.push({ cmd: '# ' + m[1].trim(), line: cur, head: true }); continue; }   // заголовок сцены → комментарий
    }
    if (opts.detect && (m = line.match(/^([\p{L}][\p{L}\s.'-]{0,30}?):\s+(.+)$/u))) {
      const c = find(m[1]);
      if (c) { push(c.id, m[2]); continue; }
    }
    if (dashRe.test(line)) {
      const segs = line.replace(dashRe, '').split(splitRe);
      const pieces = []; let speaker = null, expectAttr = true;
      pieces.push({ k: 's', text: segs[0] });
      for (let i = 1; i < segs.length; i++) {
        const seg = segs[i];
        if (expectAttr && isAttr(seg)) {
          let attr = seg, rest = '';
          const mm = seg.match(/^(.+?[.!?…])\s+([*_«"“„]*\p{Lu}.*)$/u);   // после ремарки автора идёт рассказчик; он может начинаться с разметки (**Очень**)
          if (mm) { attr = mm[1]; rest = mm[2]; }
          if (opts.detect) { const c = find(attr); if (c) speaker = c.id; }
          if (opts.keepAttr) pieces.push({ k: 'n', text: attr });
          if (rest) pieces.push({ k: 'n', text: rest });
          expectAttr = false;
        } else { pieces.push({ k: 's', text: seg }); expectAttr = true; }
      }
      const sp = speaker || (opts.detect ? guess() : '?');
      const merged = [];
      for (const p of pieces) {
        const prev = merged[merged.length - 1];
        if (p.k === 's' && prev && prev.k === 's' && (/[,;:—–-]$/.test(prev.text) || /^\p{Ll}/u.test(p.text))) {
          // «Привет, — сказал он. — Как дела?» → «Привет. Как дела?»; «Я думаю, — сказал он, — что так» → «Я думаю, что так»
          if (/,$/.test(prev.text) && /^\p{Lu}/u.test(p.text)) prev.text = prev.text.replace(/,$/, '.');
          prev.text += ' ' + p.text;
        } else merged.push({ ...p });
      }
      for (const p of merged) push(p.k === 's' ? sp : '', p.k === 's' ? p.text.replace(/[,;:]$/, '.') : p.text);
      continue;
    }
    if ((m = line.match(/^[«"“„]([^»"”“]+)[»"”](?:\s*[,.]?\s*[—–-]\s*(.+))?\s*$/u))) {
      let sp = null;
      if (m[2] && opts.detect) { const c = find(m[2]); if (c) sp = c.id; }
      push(sp || (opts.detect ? guess() : '?'), m[1].replace(/[,;:]\s*$/, '.'));
      continue;
    }
    push('', line);
  }
  return rows;
}
function rpyEsc(x) { return String(x).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\[/g, '[[').replace(/\{/g, '{{'); }
function rowsToRenpy(rows) {
  return rows.map(r => {
    if (r.cmd !== undefined) return r.cmd;
    if (r.sp === '' || r.sp == null) return `"${rpyText(r.text)}"`;
    if (r.sp === '?') return `"${rpyText(r.text)}"  # ← ${t('conv.unknown.c')}`;
    const c = charById(r.sp);
    const tag = c ? (c.tag || slug(c.name)) : 'who';
    return `${tag} "${rpyText(r.text)}"`;
  }).join('\n');
}

/* ---- генерация текста файлов для экспорта ---- */
function outgoingOf(n) { return P.edges.filter(e => e.from === n.id); }
function renpyFileText(n, f) {
  const L = [];
  L.push('# ' + (f.title || t('file.untitled')));
  if (f.summary) f.summary.split('\n').forEach(l => L.push('# ' + l));
  const cast = effectiveCast(n, f).all.map(charById).filter(Boolean).map(c => c.name || c.tag);
  if (cast.length) L.push('# ' + t('rpy.cast') + ': ' + cast.join(', '));
  L.push('');
  const body = (f.script || '').replace(/\s+$/, '');
  const firstCode = body.split('\n').find(l => l.trim() && !l.trim().startsWith('#')) || '';
  if (/^\s*label\s+/.test(firstCode)) { L.push(body); L.push('return'); }
  else {
    L.push(`label ${fileLabel(f)}:`);
    if (body.trim()) body.split('\n').forEach(l => L.push(l.trim() ? '    ' + l : ''));
    else L.push('    pass');
    L.push('    return');
  }
  if (n.files[n.files.length - 1] === f) {
    const outs = outgoingOf(n);
    if (outs.length) {
      L.push('');
      outs.forEach(e => {
        const tn = nodeById(e.to);
        const target = tn && tn.files[0] ? fileLabel(tn.files[0]) : '?';
        L.push(`# → ${e.title || '—'}: ${tn ? tn.title : '?'} (jump ${target})`);
      });
    }
  }
  return L.join('\n') + '\n';
}
function storyMapMd() {
  const L = [`# ${P.name}`, ''];
  for (const n of P.nodes.filter(n => n.type !== 'note')) {
    L.push(`## ${n.title}  _(${t('type.' + n.type)})_`);
    if (n.desc) L.push(n.desc);
    n.files.forEach(f => L.push(`- **${f.title}** — \`${fileName(f)}\` · \`${fileLabel(f)}\` · ${t('status.' + f.status)}${f.summary ? ' — ' + f.summary.replace(/\n/g, ' ') : ''}`));
    outgoingOf(n).forEach(e => { const tn = nodeById(e.to); L.push(`  - ➜ ${e.title || '—'} → ${tn ? tn.title : '?'}`); });
    L.push('');
  }
  return L.join('\n');
}

/* ---- вставка сниппетов в редактор ---- */
function insertSnippet(ta, text) {
  const v = ta.value;
  const pos = ta.selectionStart == null ? v.length : ta.selectionStart;
  const lineEnd = v.indexOf('\n', pos), insAt = lineEnd === -1 ? v.length : lineEnd;
  const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
  const blank = v.slice(lineStart, insAt).trim() === '';
  const caretMark = text.indexOf('\u0001');
  const clean = text.replace('\u0001', '');
  let before, after = v.slice(insAt), ins;
  if (blank) { before = v.slice(0, lineStart); ins = clean; }
  else { before = v.slice(0, insAt); ins = '\n' + clean; }
  const base = before.length + (blank ? 0 : 1);
  const caret = caretMark >= 0 ? base + caretMark : base + clean.length;
  if (ta.vnEd) { ta.vnEd.replace(blank ? lineStart : insAt, blank ? insAt : insAt, ins, caret, caret); return; }         // CodeMirror: одной правкой, отмена Ctrl+Z работает
  ta.value = before + ins + after;
  ta.focus(); ta.setSelectionRange(caret, caret);
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}
function menuSnippet(n) {
  const outs = outgoingOf(n).filter(e => nodeById(e.to));
  if (!outs.length) return 'menu:\n    "\u0001Вариант 1":\n        jump label_1\n    "Вариант 2":\n        jump label_2';
  return 'menu:\n' + outs.map(e => {
    const tn = nodeById(e.to), tgt = tn.files[0] ? fileLabel(tn.files[0]) : slug(tn.title);
    return `    "${rpyEsc(e.title || tn.title)}":\n        jump ${tgt}`;
  }).join('\n');
}
function assetCodeName(a) { return a.kind === 'video' ? (a.path || 'videos/' + (slug(a.name) || 'video') + '.webm') : ['music', 'sfx', 'voice'].includes(a.kind) ? (a.path || a.name) : a.name; }

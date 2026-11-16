'use strict';
/* ====== Конструктор условия ======
   Собирает за несколько щелчков блок «если … то … иначе …» с переходами (return, jump, call), запоминанием флага и своим кодом.
   Вставляется в главу из панели быстрых вставок. В режиме «expr» собирает только само условие (для условия показа стрелки). */

const CB_NUM_OPS = [['>=', '≥'], ['>', '>'], ['==', '='], ['<=', '≤'], ['<', '<'], ['!=', '≠']];
const CB_ACTS = ['return', 'jump', 'call', 'set', 'pass', 'code'];
let CB_LAST = null;

const cbNewCond = v => {
  if (!v) return { name: '', op: 'yes', val: '', expr: '' };
  return { name: v.name, op: v.type === 'number' ? '>=' : v.type === 'choice' ? 'eq' : 'yes', val: v.type === 'choice' ? (v.values[0] || '') : v.type === 'number' ? '1' : '', expr: '' };
};
const cbNewAct = type => ({ t: type, file: '', name: '', op: 'set', val: '', code: '' });

/** Одно условие → выражение Python. */
function cbCondText(c) {
  if (c.name === '' || c.name === '@expr') return String(c.expr || '').trim();
  const v = varByName(c.name), nm = v ? varRef(v) : c.name;
  if (!v) return c.op === 'no' ? 'not ' + nm : nm;
  if (v.type === 'choice') return `${nm} ${c.op === 'ne' ? '!=' : '=='} ${pyStr(c.val)}`;
  if (v.type === 'number') return `${nm} ${CB_NUM_OPS.some(o => o[0] === c.op) ? c.op : '>='} ${/^-?\d+(\.\d+)?$/.test(String(c.val).trim()) ? String(c.val).trim() : '0'}`;
  return c.op === 'no' ? 'not ' + nm : nm;
}
/** Все условия → одно выражение. */
function cbExpr(st) {
  const parts = st.conds.map(cbCondText).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return parts.map(x => (/^(not\s+)?[A-Za-z_][\w.]*$/.test(x) || /^[A-Za-z_]\w*\s*(==|!=|>=|<=|>|<)\s*[^\s]+$/.test(x) ? x : '(' + x + ')')).join(st.join === 'or' ? ' or ' : ' and ');
}
const cbFileOf = id => { const r = allFiles().find(x => x.file.id === id); return r || null; };
/** Одно действие → строки кода. Если чего-то не хватает, возвращает { lines, miss }. */
function cbActLines(a) {
  if (a.t === 'return') return { lines: ['return'] };
  if (a.t === 'pass') return { lines: ['pass'] };
  if (a.t === 'jump' || a.t === 'call') {
    const r = cbFileOf(a.file);
    return r ? { lines: [`${a.t} ${fileLabel(r.file)}`] } : { lines: [`${a.t} ???`], miss: true };
  }
  if (a.t === 'set') {
    const v = varByName(a.name);
    const ln = v ? setLine(v, { op: a.op, val: a.val }) : null;
    return ln ? { lines: [ln] } : { lines: ['pass  # ???'], miss: true };
  }
  const ls = String(a.code || '').split('\n').map(x => x.replace(/\s+$/, '')).filter(x => x.trim());
  return ls.length ? { lines: ls } : { lines: ['pass'] };
}
function cbBranch(list) {
  const out = []; let miss = false;
  for (const a of list) { const r = cbActLines(a); out.push(...r.lines); if (r.miss) miss = true; }
  return { lines: out.length ? out : ['pass'], miss };
}
/** Готовый фрагмент и признак «что-то не выбрано». */
function cbSnippet(st) {
  const expr = cbExpr(st);
  const yes = cbBranch(st.yes), no = cbBranch(st.no);
  const L = [`if ${expr || '???'}:`, ...yes.lines.map(x => '    ' + x)];
  if (st.elseOn) L.push('else:', ...no.lines.map(x => '    ' + x));
  return { text: L.join('\n'), miss: !expr || /\?\?\?/.test(expr) || yes.miss || (st.elseOn && no.miss) };
}

function cbSelect(opts, value, onChange, cls = '') {
  const el = h('select', { class: 'inp sm ' + cls }, opts.map(o => h('option', { value: o[0] }, o[1])));
  el.value = value; el.addEventListener('change', () => onChange(el.value));
  return el;
}

/** Окно конструктора. opts: { insert(text) } или { mode: 'expr', onDone(expr), expr } */
function openCondBuilder(opts = {}) {
  const exprMode = opts.mode === 'expr';
  let st;
  if (CB_LAST && !exprMode) st = JSON.parse(JSON.stringify(CB_LAST));
  else {
    const v0 = P.vars.find(v => v.name);
    st = { conds: [cbNewCond(v0)], join: 'and', yes: [cbNewAct('return')], no: [cbNewAct('jump')], elseOn: true };
  }
  if (exprMode) st.conds = [cbNewCond(P.vars.find(v => v.name))];
  const m = openModal({
    cls: 'cb-m', build: m => {
      const condBox = h('div', { class: 'cb-conds' }), prev = h('pre', { class: 'cb-prev' }), warn = h('div', { class: 'warn-t' });
      const yesBox = h('div', { class: 'cb-acts' }), noBox = h('div', { class: 'cb-acts' });
      const elseChk = h('input', { type: 'checkbox', id: 'cb-else' }); elseChk.checked = st.elseOn;
      const okBtn = h('button', { class: 'btn primary', onclick: () => go() }, icon('check', 16), exprMode ? t('cb.apply') : t('c.insert'));
      const upd = () => {
        const r = cbSnippet(st);
        if (exprMode) { prev.textContent = cbExpr(st) || '…'; okBtn.disabled = !cbExpr(st); warn.textContent = ''; return; }
        prev.textContent = r.text; okBtn.disabled = r.miss; warn.textContent = r.miss ? t('cb.miss') : '';
        const hasJump = [...st.yes, ...(st.elseOn ? st.no : [])].some(a => a.t === 'jump' || a.t === 'call');
        hint.textContent = hasJump ? t(S.jumps ? 'cb.arrow.on' : 'cb.arrow.off') : '';
      };
      const hint = h('div', { class: 'hint' });
      const go = () => {
        if (exprMode) { const ex = cbExpr(st); m.close(); opts.onDone && opts.onDone(ex); return; }
        const r = cbSnippet(st); if (r.miss) return;
        CB_LAST = JSON.parse(JSON.stringify(st));
        m.close(); opts.insert && opts.insert(r.text);
      };

      /* --- условия --- */
      const varOpts = () => [...P.vars.filter(v => v.name).map(v => [v.name, v.name + (v.type === 'choice' ? ' ◦' : v.type === 'number' ? ' #' : '')]), ['@expr', t('cb.expr')], ['@new', t('flag.new') + '…']];
      const paintConds = () => {
        condBox.replaceChildren();
        st.conds.forEach((c, i) => {
          const row = h('div', { class: 'cb-row' });
          const v = varByName(c.name);
          const sel = cbSelect(varOpts(), c.name === '' ? '@expr' : c.name, val => {
            if (val === '@new') { openFlagDialog({ name: nextFlagName(), type: 'flag', onDone: nv => { st.conds[i] = cbNewCond(nv); paintConds(); upd(); } }); sel.value = c.name === '' ? '@expr' : c.name; return; }
            if (val === '@expr') { st.conds[i] = { name: '@expr', op: 'yes', val: '', expr: cbCondText(c) }; } else st.conds[i] = cbNewCond(varByName(val));
            paintConds(); upd();
          }, 'cb-var');
          row.append(sel);
          if (c.name === '@expr' || c.name === '') {
            const inp = h('input', { class: 'inp sm mono grow', type: 'text', value: c.expr, placeholder: 'Lisa_house and love >= 3', spellcheck: 'false' });
            inp.addEventListener('input', () => { c.expr = inp.value; upd(); });
            row.append(inp);
          } else if (v && v.type === 'choice') {
            row.append(cbSelect([['eq', t('cb.eq')], ['ne', t('cb.ne')]], c.op === 'ne' ? 'ne' : 'eq', val => { c.op = val; upd(); }, 'cb-op'));
            const vals = v.values.length ? v.values : [c.val || ''];
            const vs = cbSelect(vals.map(x => [x, x || '—']), c.val, val => { c.val = val; upd(); }); row.append(vs);
          } else if (v && v.type === 'number') {
            row.append(cbSelect(CB_NUM_OPS.map(o => [o[0], o[1]]), CB_NUM_OPS.some(o => o[0] === c.op) ? c.op : '>=', val => { c.op = val; upd(); }, 'cb-op'));
            const num = h('input', { class: 'inp sm cb-num', type: 'number', step: 'any', value: c.val }); num.addEventListener('input', () => { c.val = num.value; upd(); }); row.append(num);
          } else {
            row.append(segmented([{ value: 'yes', label: t('cb.yes') }, { value: 'no', label: t('cb.no') }], c.op === 'no' ? 'no' : 'yes', val => { c.op = val; upd(); }, 'mini'));
          }
          row.append(h('div', { class: 'grow' }));
          if (st.conds.length > 1) row.append(h('button', { class: 'btn icon sm', 'data-tip': t('c.delete'), onclick: () => { st.conds.splice(i, 1); paintConds(); upd(); } }, icon('x', 14)));
          condBox.append(row);
          if (i < st.conds.length - 1) condBox.append(h('div', { class: 'cb-join' }, segmented([{ value: 'and', label: t('cb.and') }, { value: 'or', label: t('cb.or') }], st.join, val => { st.join = val; paintConds(); upd(); }, 'mini')));
        });
        if (st.conds.length < 4) condBox.append(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', onclick: () => { st.conds.push(cbNewCond(P.vars.find(v => v.name && !st.conds.some(c => c.name === v.name)) || P.vars.find(v => v.name))); paintConds(); upd(); } }, icon('plus', 14), t('cb.addcond'))));
      };

      /* --- действия --- */
      const ACT_LABEL = { return: t('cb.a.return'), jump: t('cb.a.jump'), call: t('cb.a.call'), set: t('cb.a.set'), pass: t('cb.a.pass'), code: t('cb.a.code') };
      const paintActs = (box, list) => {
        box.replaceChildren();
        list.forEach((a, i) => {
          const row = h('div', { class: 'cb-row' });
          row.append(cbSelect(CB_ACTS.map(x => [x, ACT_LABEL[x]]), a.t, val => {
            const na = cbNewAct(val); if (val === 'set') { const v0 = P.vars.find(v => v.name); if (v0) { na.name = v0.name; na.val = v0.type === 'flag' ? 'true' : v0.type === 'choice' ? (v0.values[0] || '') : v0.type === 'number' ? '1' : 'True'; } }
            list[i] = na; repaint();
          }, 'cb-act'));
          if (a.t === 'jump' || a.t === 'call') {
            const r = cbFileOf(a.file);
            row.append(h('button', {
              class: 'btn sm cb-file' + (r ? '' : ' need'), onclick: ev => pickFile(ev.currentTarget, (file) => { a.file = file.id; repaint(); })
            }, icon('link', 14), r ? (r.file.title || t('file.untitled')) + ' · ' + r.node.title : t('cb.pickfile')));
          } else if (a.t === 'set') {
            const v = varByName(a.name);
            row.append(cbSelect(P.vars.filter(x => x.name).map(x => [x.name, x.name]), a.name, val => { const nv = varByName(val); a.name = val; a.op = 'set'; a.val = nv.type === 'flag' ? 'true' : nv.type === 'choice' ? (nv.values[0] || '') : nv.type === 'number' ? '1' : 'True'; repaint(); }, 'cb-var'));
            if (v && v.type === 'flag') row.append(segmented([{ value: 'true', label: t('flag.yes') }, { value: 'false', label: t('flag.no') }], /^(false|0|no|нет)$/i.test(a.val) ? 'false' : 'true', val => { a.val = val; upd(); }, 'mini'));
            else if (v && v.type === 'choice') row.append(cbSelect((v.values.length ? v.values : ['']).map(x => [x, x || '—']), a.val, val => { a.val = val; upd(); }));
            else if (v && v.type === 'number') {
              row.append(cbSelect([['set', '='], ['add', '+'], ['sub', '−']], a.op, val => { a.op = val; upd(); }, 'cb-op'));
              const num = h('input', { class: 'inp sm cb-num', type: 'number', step: 'any', value: a.val }); num.addEventListener('input', () => { a.val = num.value; upd(); }); row.append(num);
            } else { const inp = h('input', { class: 'inp sm mono', type: 'text', value: a.val, spellcheck: 'false' }); inp.addEventListener('input', () => { a.val = inp.value; upd(); }); row.append(inp); }
            if (!P.vars.some(x => x.name)) row.append(h('span', { class: 'hint' }, t('cb.noflags')));
          } else if (a.t === 'code') {
            const inp = h('input', { class: 'inp sm mono grow', type: 'text', value: a.code, placeholder: '$ love += 1', spellcheck: 'false' }); inp.addEventListener('input', () => { a.code = inp.value; upd(); }); row.append(inp);
          } else row.append(h('div', { class: 'grow' }));
          row.append(h('button', { class: 'btn icon sm', 'data-tip': t('c.delete'), onclick: () => { list.splice(i, 1); repaint(); } }, icon('x', 14)));
          box.append(row);
        });
        box.append(h('div', { class: 'row-actions left' }, h('button', { class: 'btn sm', onclick: () => { list.push(cbNewAct(list.length ? 'jump' : 'return')); repaint(); } }, icon('plus', 14), t('cb.addact'))));
      };
      const repaint = () => { paintActs(yesBox, st.yes); paintActs(noBox, st.no); noWrap.hidden = !st.elseOn; upd(); };
      elseChk.addEventListener('change', () => { st.elseOn = elseChk.checked; repaint(); });
      const noWrap = h('div', { class: 'cb-branch' }, h('div', { class: 'cb-bh' }, h('b', t('cb.else')), h('span', { class: 'hint' }, t('cb.else.h'))), noBox);
      const swap = h('button', { class: 'btn sm', onclick: () => { [st.yes, st.no] = [st.no, st.yes]; st.elseOn = true; elseChk.checked = true; repaint(); } }, icon('reverse', 14), t('cb.swap'));
      paintConds(); repaint();

      const body = exprMode
        ? h('div', { class: 'm-pad' }, h('div', { class: 'hint' }, t('cb.expr.h')), h('div', { class: 'cb-sec' }, h('div', { class: 'cb-sh' }, t('cb.if')), condBox), h('div', { class: 'lbl' }, t('cb.result')), prev,
          h('div', { class: 'row-actions' }, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), okBtn))
        : h('div', { class: 'm-pad' }, h('div', { class: 'hint' }, t('cb.intro')),
          h('div', { class: 'cb-sec' }, h('div', { class: 'cb-sh' }, t('cb.if')), condBox),
          h('div', { class: 'cb-branch' }, h('div', { class: 'cb-bh' }, h('b', t('cb.then')), h('span', { class: 'hint' }, t('cb.then.h'))), yesBox),
          h('label', { class: 'cb-else-t', for: 'cb-else' }, elseChk, t('cb.else.on')), noWrap,
          h('div', { class: 'lbl' }, t('cb.result')), prev, warn, hint,
          h('div', { class: 'row-actions' }, swap, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => m.close() }, t('c.cancel')), okBtn));
      return h('div', { class: 'm-wrap' }, modalHead(exprMode ? t('cb.title.expr') : t('cb.title'), m), body);
    }
  });
  return m;
}

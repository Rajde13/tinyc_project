/* Right-hand inspector tabs: tokens, AST, semantic, IR, bytecode. */
/* ---------- inspector ---------- */
function pane() {
    $('tabs').innerHTML = TABS.map(([id, n]) => `<button class="${id == SEL ? 'on ' : ''}${R.st[id]}" data-t="${id}"><i></i>${n}</button>`).join('');
    const s = R.st[SEL]; let h = '';
    if (s == 'err') { const [l, c] = lc(R.err.s); h = `<div class="card bad">Failed at line ${l}, column ${c}<br>${esc(R.err.m)}</div>` }
    else if (s == 'off') h = `<div class="card mu">Not reached. Fix the error in ${ST.find(x => x[0] == R.errAt)[1].toLowerCase()} first.</div>`;
    else if (SEL == 'lex') h = R.lex.filter(t => t.t != 'EOF').map(t => { const [l, c] = lc(t.s); return `<div class="r"${H([t.s, t.e], [t.s, t.e])}><span class="mu">${l}:${c}</span><span class="tk">${t.t}</span><span>${esc(t.v)}</span></div>` }).join('');
    else if (SEL == 'par' || SEL == 'sem' && 0) { const f = (n, d) => `<div class="r" style="padding-left:${d * 14 + 12}px"${H(n.hs, [n.s, n.e])}><span>${esc(lab(n))}</span>${n.ty ? `<span class="ty">${n.ty}</span>` : ''}</div>` + ch(n).map(c => f(c, d + 1)).join(''); h = f(R.par, 0) }
    else if (SEL == 'sem') h = `<div class="card">Symbol table (${R.sem.length}). Every expression node now carries a type, shown in the graph.</div>` + R.sem.map(y => `<div class="r"${H(y.at, y.at)}><span>${esc(y.name)}</span><span class="ty">${y.ty}</span></div>`).join('');
    else if (SEL == 'ir') { let n = 0; h = R.ir.map(i => i.k == 'lbl' ? `<div class="r lb"${H(i.h, i.h)}>${i.L}:</div>` : `<div class="r"${H(i.h, i.h)}><span class="mu" style="min-width:24px">${n++}</span>${esc(irText(i))}</div>`).join('') }
    else if (SEL == 'bc') h = R.bc.map((b, i) => `<div class="r"${H(b.h, b.h)}><span class="mu" style="min-width:32px">${String(i).padStart(4, '0')}</span><span class="op">${b.op}</span><span>${b.arg == null ? '' : esc(b.arg)}</span></div>`).join('');
    else if (SEL == 'out') {
        const o = R.out.out, v = R.out.vars, names = R.sem.map(s => s.name);
        h = (o.length ? o.map(x => `<div class="ans">${x}</div>`).join('') : '<div class="card mu">Nothing printed. Use print to produce output.</div>')
            + '<div class="card"><b>Final variables</b></div>'
            + names.map(n => `<div class="r"><span>${esc(n)}</span><span class="ty">${v[n]}</span></div>`).join('')
    }
    $('pane').innerHTML = h; paint()
}

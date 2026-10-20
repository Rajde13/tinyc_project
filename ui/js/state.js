/* Shared UI state, pipeline runner (compile), editor gutter and status bar. */
/* ---------- state ---------- */
const ST = [['src', 'Source', 'src'], ['lex', 'Lexical analysis', 'lex'], ['par', 'Syntax analysis', 'ast'], ['sem', 'Semantic analysis', 'sem'], ['ir', 'Intermediate representation', 'tac'], ['bc', 'Bytecode generation', 'bc'], ['out', 'Execution', 'vm']];
const TABS = [['lex', 'Tokens'], ['par', 'AST'], ['sem', 'Semantic'], ['ir', 'IR (3-address)'], ['bc', 'Bytecode'], ['out', 'Output']];
const NW = 200, NG = 250, PH = 96, SW = 96, AY = 190;
let SRC = '', R = {}, SEL = 'par', pin = null, hov = null, V = { x: 30, y: 60, k: 1 }, moved = false, RECTS = [], BB = null;
const PN = {}, AN = new Map(), cv = $('cv');
const lc = p => { const a = SRC.slice(0, p).split('\n'); return [a.length, a[a.length - 1].length + 1] };
const ch = n => n.body || ({ Let: [n.v], Assign: [n.v], Print: [n.v], If: n.c ? [n.c, n.t, ...(n.f ? [n.f] : [])] : [], While: [n.c, n.b], Un: [n.a], Bin: [n.l, n.r] })[n.k] || [];
const lab = n => ({ Program: 'Program', Block: 'Block', Let: 'let ' + n.name, Assign: n.name + ' =', Print: 'print', If: 'if', While: 'while', Num: n.v, Var: n.name, Un: n.op, Bin: n.op })[n.k];
const H = (h, f) => (h ? ` data-a="${h[0]}" data-b="${h[1]}"` : '') + (f ? ` data-fa="${f[0]}" data-fb="${f[1]}"` : '');

function compile() {
    SRC = $('src').value; R = { st: { src: 'ok' }, err: null }; pin = null;
    const run = (id, fn) => { if (R.err) { R.st[id] = 'off'; return } try { R[id] = fn(); R.st[id] = 'ok' } catch (e) { if (!(e instanceof E)) throw e; R.err = e; R.errAt = id; R.st[id] = 'err' } };
    run('lex', () => lex(SRC)); run('par', () => parse(R.lex)); run('sem', () => sema(R.par)); run('ir', () => gen(R.par)); run('bc', () => emit(R.ir));
    run('out', () => exec(R.bc));
    gutter(); status(); draw(); pane(); paint()
}
function gutter() { const n = SRC.split('\n').length, bl = R.err ? lc(R.err.s)[0] : 0; $('gut').innerHTML = Array.from({ length: n }, (_, i) => i + 1 == bl ? `<span class="bad">${i + 1}</span>` : i + 1).join('\n') }
function status() {
    const m = $('msg'), s = $('stat');
    if (R.err) { const [l, c] = lc(R.err.s); m.className = 'bad'; m.textContent = `${l}:${c}  ${R.err.m}`; s.style.color = 'var(--err)'; s.textContent = 'error in ' + ST.find(x => x[0] == R.errAt)[1].toLowerCase() }
    else { const o = R.out.out; m.className = 'good'; m.textContent = 'output: ' + (o.length ? o.slice(0, 8).join(', ') + (o.length > 8 ? ' ...' : '') : '(nothing printed)'); s.style.color = 'var(--ok)'; s.textContent = '6 of 6 stages passed' }
}
function sum(id) {
    const s = R.st[id]; if (s == 'err') return R.err.m; if (s == 'off') return 'blocked by earlier error';
    return ({ src: () => `${SRC.split('\n').length} lines, ${SRC.length} chars`, lex: () => `${R.lex.length - 1} tokens`, par: () => `${cnt(R.par)} AST nodes`, sem: () => `${R.sem.length} symbols, types checked`, ir: () => `${R.ir.filter(i => i.k != 'lbl').length} instructions`, bc: () => `${R.bc.length} instructions`, out: () => `${R.out.out.length} value(s) printed` })[id]()
}
const cnt = n => 1 + ch(n).reduce((a, c) => a + cnt(c), 0);

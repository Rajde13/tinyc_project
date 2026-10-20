/* Stage 6: execute the bytecode and collect printed values. Mirrors tinyc/vm.py. */
function exec(bc, maxSteps = 100000) {
    const st = [], vars = {}, out = [];
    const span = i => i.h || [0, 1];
    const div = (a, b, i) => {
        if (b == 0) throw new E('division by zero', ...span(i));
        return Math.trunc(a / b);
    };
    const BIN = {
        ADD: (a, b) => a + b, SUB: (a, b) => a - b, MUL: (a, b) => a * b,
        DIV: div, MOD: (a, b, i) => a - b * div(a, b, i),
        EQ: (a, b) => +(a == b), NE: (a, b) => +(a != b),
        LT: (a, b) => +(a < b), LE: (a, b) => +(a <= b),
        GT: (a, b) => +(a > b), GE: (a, b) => +(a >= b),
    };
    let pc = 0, steps = 0;
    for (; ;) {
        const i = bc[pc++];
        if (++steps > maxSteps) throw new E('step limit exceeded (possible infinite loop)', ...span(i));
        switch (i.op) {
            case 'PUSH': st.push(i.arg); break;
            case 'LOAD': st.push(vars[i.arg]); break;
            case 'STORE': vars[i.arg] = st.pop(); break;
            case 'NEG': st.push(-st.pop()); break;
            case 'NOT': st.push(+(st.pop() == 0)); break;
            case 'JMP': pc = i.arg; break;
            case 'JZ': if (st.pop() == 0) pc = i.arg; break;
            case 'JNZ': if (st.pop() != 0) pc = i.arg; break;
            case 'PRINT': out.push(st.pop()); break;
            case 'HALT': return { out, vars };
            default: { const b = st.pop(), a = st.pop(); st.push(BIN[i.op](a, b, i)); }
        }
    }
}
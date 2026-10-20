from . import ops
from .ast_nodes import (Assign, Binary, Block, If, Let, Num, Print, Program,
                        Unary, Var, While)


def optimize(program):
    """AST-level optimizations:
      * constant folding            (2 * 3 + 1       -> 7)
      * dead branch elimination     (if (0) {...}    -> removed)
      * dead loop elimination       (while (0) {...} -> removed)
    Division/modulo by a constant zero is left alone so the runtime error
    still happens when (and only if) the code actually executes."""
    return Program(_stmts(program.stmts))


def _stmts(stmts):
    out = []
    for s in stmts:
        out.extend(_stmt(s))
    return out


def _stmt(s):
    if isinstance(s, Let):
        return [Let(s.name, _expr(s.value), s.line)]
    if isinstance(s, Assign):
        return [Assign(s.name, _expr(s.value), s.line)]
    if isinstance(s, Print):
        return [Print(_expr(s.value), s.line)]
    if isinstance(s, Block):
        return _stmts(s.stmts)                 # flat scope, so blocks can be flattened
    if isinstance(s, If):
        cond = _expr(s.cond)
        if isinstance(cond, Num):
            branch = s.then if cond.value != 0 else s.orelse
            return _stmts(branch.stmts) if branch else []
        orelse = Block(_stmts(s.orelse.stmts)) if s.orelse else None
        return [If(cond, Block(_stmts(s.then.stmts)), orelse, s.line)]
    if isinstance(s, While):
        cond = _expr(s.cond)
        if isinstance(cond, Num) and cond.value == 0:
            return []
        return [While(cond, Block(_stmts(s.body.stmts)), s.line)]
    return [s]


def _expr(e):
    if isinstance(e, Unary):
        operand = _expr(e.operand)
        if isinstance(operand, Num):
            return Num(ops.UNARY[e.op](operand.value), e.line)
        return Unary(e.op, operand, e.line)
    if isinstance(e, Binary):
        left, right = _expr(e.left), _expr(e.right)
        if isinstance(left, Num) and isinstance(right, Num):
            try:
                return Num(ops.BINARY[e.op](left.value, right.value), e.line)
            except ZeroDivisionError:
                pass
        return Binary(e.op, left, right, e.line)
    return e

from .ast_nodes import (Assign, Binary, Block, If, Let, Num, Print, Program,
                        Unary, Var, While)
from .errors import CompileError


def check(program):
    """Semantic pass: every variable must be declared before use, and a
    variable may only be declared once (single flat scope)."""
    declared = set()

    def expr(n):
        if isinstance(n, Num):
            return
        if isinstance(n, Var):
            if n.name not in declared:
                raise CompileError(f"Undefined variable '{n.name}'", n.line)
        elif isinstance(n, Unary):
            expr(n.operand)
        elif isinstance(n, Binary):
            expr(n.left)
            expr(n.right)

    def stmt(s):
        if isinstance(s, Let):
            expr(s.value)                      # value is checked before the name exists
            if s.name in declared:
                raise CompileError(f"Variable '{s.name}' is already declared", s.line)
            declared.add(s.name)
        elif isinstance(s, Assign):
            if s.name not in declared:
                raise CompileError(f"Assignment to undeclared variable '{s.name}'", s.line)
            expr(s.value)
        elif isinstance(s, Print):
            expr(s.value)
        elif isinstance(s, Block):
            for x in s.stmts:
                stmt(x)
        elif isinstance(s, If):
            expr(s.cond)
            stmt(s.then)
            if s.orelse:
                stmt(s.orelse)
        elif isinstance(s, While):
            expr(s.cond)
            stmt(s.body)

    for s in program.stmts:
        stmt(s)

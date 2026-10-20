from dataclasses import dataclass

from .ast_nodes import (Assign, Binary, Block, If, Let, Num, Print, Program,
                        Unary, Var, While)

BIN_OPS = {"+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV", "%": "MOD",
           "==": "EQ", "!=": "NE", "<": "LT", "<=": "LE", ">": "GT", ">=": "GE"}


class Label:
    """A jump target whose address is filled in once it is placed."""
    __slots__ = ("addr",)

    def __init__(self):
        self.addr = None


@dataclass
class Instr:
    op: str
    arg: object = None
    line: int = 0

    def __str__(self):
        return self.op if self.arg is None else f"{self.op} {self.arg}"


class CodeGen:
    def __init__(self):
        self.code = []

    def emit(self, op, arg=None, line=0):
        self.code.append(Instr(op, arg, line))

    def place(self, label):
        label.addr = len(self.code)

    def generate(self, program):
        for s in program.stmts:
            self.stmt(s)
        self.emit("HALT")
        for ins in self.code:                  # resolve labels to addresses
            if isinstance(ins.arg, Label):
                ins.arg = ins.arg.addr
        return self.code

    # -- statements -----------------------------------------------------
    def stmt(self, s):
        if isinstance(s, (Let, Assign)):
            self.expr(s.value)
            self.emit("STORE", s.name, s.line)
        elif isinstance(s, Print):
            self.expr(s.value)
            self.emit("PRINT", None, s.line)
        elif isinstance(s, Block):
            for x in s.stmts:
                self.stmt(x)
        elif isinstance(s, If):
            else_l, end_l = Label(), Label()
            self.expr(s.cond)
            self.emit("JZ", else_l, s.line)
            self.stmt(s.then)
            if s.orelse:
                self.emit("JMP", end_l, s.line)
                self.place(else_l)
                self.stmt(s.orelse)
                self.place(end_l)
            else:
                self.place(else_l)
        elif isinstance(s, While):
            start_l, end_l = Label(), Label()
            self.place(start_l)
            self.expr(s.cond)
            self.emit("JZ", end_l, s.line)
            self.stmt(s.body)
            self.emit("JMP", start_l, s.line)
            self.place(end_l)

    # -- expressions ----------------------------------------------------
    def expr(self, e):
        if isinstance(e, Num):
            self.emit("PUSH", e.value, e.line)
        elif isinstance(e, Var):
            self.emit("LOAD", e.name, e.line)
        elif isinstance(e, Unary):
            self.expr(e.operand)
            self.emit("NEG" if e.op == "-" else "NOT", None, e.line)
        elif isinstance(e, Binary):
            if e.op in ("&&", "||"):
                self.logical(e)
            else:
                self.expr(e.left)
                self.expr(e.right)
                self.emit(BIN_OPS[e.op], None, e.line)

    def logical(self, e):
        """Short-circuit && and ||; the result is always 0 or 1."""
        short_l, end_l = Label(), Label()
        jump = "JZ" if e.op == "&&" else "JNZ"
        self.expr(e.left)
        self.emit(jump, short_l, e.line)
        self.expr(e.right)
        self.emit(jump, short_l, e.line)
        self.emit("PUSH", 1 if e.op == "&&" else 0, e.line)   # neither operand short-circuited
        self.emit("JMP", end_l, e.line)
        self.place(short_l)
        self.emit("PUSH", 0 if e.op == "&&" else 1, e.line)
        self.place(end_l)


def disassemble(code):
    lines = []
    for i, ins in enumerate(code):
        arg = "" if ins.arg is None else str(ins.arg)
        lines.append(f"{i:04d}  {ins.op:<6} {arg:<8} ; line {ins.line}")
    return "\n".join(lines)

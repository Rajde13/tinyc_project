from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Num:
    value: int
    line: int = 0

@dataclass
class Var:
    name: str
    line: int = 0

@dataclass
class Unary:
    op: str
    operand: object
    line: int = 0

@dataclass
class Binary:
    op: str
    left: object
    right: object
    line: int = 0

@dataclass
class Let:
    name: str
    value: object
    line: int = 0

@dataclass
class Assign:
    name: str
    value: object
    line: int = 0

@dataclass
class Print:
    value: object
    line: int = 0

@dataclass
class Block:
    stmts: List[object]
    line: int = 0

@dataclass
class If:
    cond: object
    then: Block
    orelse: Optional[Block]
    line: int = 0

@dataclass
class While:
    cond: object
    body: Block
    line: int = 0

@dataclass
class Program:
    stmts: List[object]


def format_ast(node, depth=0):
    """Return an indented, human-readable tree of the AST."""
    pad = "  " * depth
    if isinstance(node, Program):
        return "Program\n" + "".join(format_ast(s, 1) for s in node.stmts)
    if isinstance(node, Num):
        return f"{pad}Num {node.value}\n"
    if isinstance(node, Var):
        return f"{pad}Var {node.name}\n"
    if isinstance(node, Unary):
        return f"{pad}Unary {node.op}\n" + format_ast(node.operand, depth + 1)
    if isinstance(node, Binary):
        return (f"{pad}Binary {node.op}\n" + format_ast(node.left, depth + 1)
                + format_ast(node.right, depth + 1))
    if isinstance(node, (Let, Assign)):
        return f"{pad}{type(node).__name__} {node.name}\n" + format_ast(node.value, depth + 1)
    if isinstance(node, Print):
        return f"{pad}Print\n" + format_ast(node.value, depth + 1)
    if isinstance(node, Block):
        return f"{pad}Block\n" + "".join(format_ast(s, depth + 1) for s in node.stmts)
    if isinstance(node, If):
        out = f"{pad}If\n{pad}  cond:\n" + format_ast(node.cond, depth + 2)
        out += f"{pad}  then:\n" + format_ast(node.then, depth + 2)
        if node.orelse:
            out += f"{pad}  else:\n" + format_ast(node.orelse, depth + 2)
        return out
    if isinstance(node, While):
        return (f"{pad}While\n{pad}  cond:\n" + format_ast(node.cond, depth + 2)
                + f"{pad}  body:\n" + format_ast(node.body, depth + 2))
    raise TypeError(f"Unknown node {node!r}")

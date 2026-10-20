"""Arithmetic shared by the optimizer (constant folding) and the VM,
so both always agree on semantics. Division truncates toward zero (like C)."""


def trunc_div(a, b):
    q = abs(a) // abs(b)          # raises ZeroDivisionError when b == 0
    return q if (a < 0) == (b < 0) else -q


def trunc_mod(a, b):
    return a - b * trunc_div(a, b)


BINARY = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
    "/": trunc_div,
    "%": trunc_mod,
    "==": lambda a, b: int(a == b),
    "!=": lambda a, b: int(a != b),
    "<": lambda a, b: int(a < b),
    "<=": lambda a, b: int(a <= b),
    ">": lambda a, b: int(a > b),
    ">=": lambda a, b: int(a >= b),
    "&&": lambda a, b: int(a != 0 and b != 0),
    "||": lambda a, b: int(a != 0 or b != 0),
}

UNARY = {
    "-": lambda a: -a,
    "!": lambda a: int(a == 0),
}

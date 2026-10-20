from dataclasses import dataclass
from typing import List

from .ast_nodes import Program, format_ast
from .codegen import CodeGen, Instr, disassemble
from .errors import CompileError, RuntimeErr
from .lexer import Token, tokenize
from .optimizer import optimize
from .parser import Parser
from .semantic import check
from .vm import VM


@dataclass
class CompileResult:
    tokens: List[Token]
    ast: Program
    optimized_ast: Program
    code: List[Instr]


def compile_source(src, optimize_code=True):
    tokens = tokenize(src)
    ast = Parser(tokens).parse()
    check(ast)
    optimized = optimize(ast) if optimize_code else ast
    code = CodeGen().generate(optimized)
    return CompileResult(tokens, ast, optimized, code)


def run_source(src, optimize_code=True, max_steps=1_000_000):
    """Compile and run; returns the list of printed values."""
    output = []
    result = compile_source(src, optimize_code)
    VM(result.code, out=output.append, max_steps=max_steps).run()
    return output

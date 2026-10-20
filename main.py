#!/usr/bin/env python3
"""TinyC command-line driver.

Usage:
    python main.py examples/factorial.tc
    python main.py examples/factorial.tc --dump-tokens --dump-ast --dump-bytecode
    python main.py examples/factorial.tc --no-opt --trace
"""
import argparse
import sys

from tinyc import (CompileError, RuntimeErr, VM, compile_source, disassemble,
                   format_ast)


def report(path, src, err, kind):
    line = err.line
    col = getattr(err, "col", None)
    where = f"{path}:{line}" + (f":{col}" if col else "") if line else path
    print(f"{where}: {kind}: {err.message}", file=sys.stderr)
    if line:
        text = src.splitlines()[line - 1] if line <= len(src.splitlines()) else ""
        print(f"    {text}", file=sys.stderr)
        if col:
            print("    " + " " * (col - 1) + "^", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(description="TinyC compiler and VM")
    ap.add_argument("file", help="source file (.tc)")
    ap.add_argument("--dump-tokens", action="store_true", help="print the token stream")
    ap.add_argument("--dump-ast", action="store_true", help="print the AST (before and after optimization)")
    ap.add_argument("--dump-bytecode", action="store_true", help="print the bytecode listing")
    ap.add_argument("--no-opt", action="store_true", help="disable the optimizer")
    ap.add_argument("--no-run", action="store_true", help="compile only, do not execute")
    ap.add_argument("--trace", action="store_true", help="trace every VM instruction")
    args = ap.parse_args()

    with open(args.file, encoding="utf-8") as f:
        src = f.read()

    try:
        result = compile_source(src, optimize_code=not args.no_opt)
    except CompileError as e:
        report(args.file, src, e, "error")
        return 1

    if args.dump_tokens:
        print("== Tokens ==")
        for t in result.tokens:
            print(t)
    if args.dump_ast:
        print("== AST ==")
        print(format_ast(result.ast))
        if not args.no_opt:
            print("== AST (optimized) ==")
            print(format_ast(result.optimized_ast))
    if args.dump_bytecode:
        print(f"== Bytecode ({len(result.code)} instructions) ==")
        print(disassemble(result.code))
    if args.no_run:
        return 0

    try:
        VM(result.code, trace=args.trace).run()
    except RuntimeErr as e:
        report(args.file, src, e, "runtime error")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())

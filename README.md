# TinyC: a small compiler and virtual machine

A complete compiler pipeline in pure Python (3.8+, no dependencies). It translates a
small C-like language into stack-machine bytecode and runs it on a VM.

```
source ──► Lexer ──► Parser ──► Semantic check ──► Optimizer ──► Code generator ──► VM
 text      tokens     AST       declared vars?     folded AST      bytecode        output
```

## Quick start

```bash
python main.py examples/factorial.tc
python main.py examples/primes.tc --dump-tokens --dump-ast --dump-bytecode
python main.py examples/optimizer_demo.tc --dump-bytecode --no-run          # optimized
python main.py examples/optimizer_demo.tc --dump-bytecode --no-run --no-opt # compare
python main.py examples/fibonacci.tc --trace                                # step-by-step VM
python -m unittest discover -s tests -v                                     # run the tests
```

| Flag | Effect |
|------|--------|
| `--dump-tokens` | print the token stream with line:column |
| `--dump-ast` | print the AST, and the optimized AST |
| `--dump-bytecode` | print the bytecode listing |
| `--no-opt` | disable the optimizer |
| `--no-run` | compile only |
| `--trace` | print pc, instruction and stack for every VM step |

Exit codes: `0` success, `1` compile error, `2` runtime error.

## The language

```
// comment
let x = 10;                      // declare (once)
x = x + 1;                       // assign
print x * 2;                     // output
if (x > 5 && x != 8) { ... } else if (x == 0) { ... } else { ... }
while (x > 0) { x = x - 1; }
```

* Only integers. Comparisons and logical operators give `1` or `0`; any non-zero value is true.
* Operators, lowest to highest precedence: `||`, `&&`, `== !=`, `< <= > >=`, `+ -`, `* / %`, unary `- !`
* `/` and `%` truncate toward zero (like C). `&&` and `||` short-circuit.
* Braces are required for `if` and `while` bodies.
* One flat scope: a name can be declared only once and must be declared before use.

### Grammar

```
program    → statement* EOF
statement  → "let" IDENT "=" expr ";" | IDENT "=" expr ";" | "print" expr ";"
           | "if" "(" expr ")" block ( "else" ( block | ifStmt ) )?
           | "while" "(" expr ")" block | block
block      → "{" statement* "}"
expr       → or ;  or → and ("||" and)* ;  and → equality ("&&" equality)*
equality   → comparison (("=="|"!=") comparison)*
comparison → additive (("<"|"<="|">"|">=") additive)*
additive   → term (("+"|"-") term)* ;  term → unary (("*"|"/"|"%") unary)*
unary      → ("-"|"!") unary | primary
primary    → NUMBER | IDENT | "(" expr ")"
```

## Project layout

| File | Stage | What it does |
|------|-------|--------------|
| `tinyc/lexer.py` | Lexer | characters to tokens, tracks line/column, skips comments |
| `tinyc/parser.py` | Parser | recursive descent, one method per precedence level |
| `tinyc/ast_nodes.py` | AST | node dataclasses plus a tree pretty-printer |
| `tinyc/semantic.py` | Semantic pass | undefined, redeclared and undeclared-assignment errors |
| `tinyc/optimizer.py` | Optimizer | constant folding, dead `if`/`while` removal |
| `tinyc/codegen.py` | Code generator | AST to bytecode, labels and jump back-patching |
| `tinyc/vm.py` | VM | fetch-decode-execute loop, step limit, trace mode |
| `tinyc/ops.py` | Shared | arithmetic used by both optimizer and VM, so they cannot disagree |
| `main.py` | Driver | CLI flags and error reporting with a caret under the source line |
| `tests/test_compiler.py` | Tests | 24 unit tests, including "optimized == unoptimized" on every example |

## Bytecode instruction set

| Instruction | Effect |
|-------------|--------|
| `PUSH n` / `LOAD v` / `STORE v` | push a constant / push a variable / pop into a variable |
| `ADD SUB MUL DIV MOD` | pop two, push the result |
| `EQ NE LT LE GT GE` | pop two, push 1 or 0 |
| `NEG` / `NOT` | unary minus / logical not |
| `JMP a` | jump to address `a` |
| `JZ a` / `JNZ a` | pop; jump if zero / non-zero |
| `PRINT` | pop and print |
| `HALT` | stop |

Example: `while (i < 3) { i = i + 1; }` compiles to

```
0000  LOAD i      ; loop start
0001  PUSH 3
0002  LT
0003  JZ 9        ; exit loop when the condition is false
0004  LOAD i
0005  PUSH 1
0006  ADD
0007  STORE i
0008  JMP 0       ; back to loop start
0009  HALT
```

## Ideas for extending it

* Block scoping with a symbol-table stack, so inner `let`s can shadow outer ones
* Functions with call frames (`CALL`, `RET`) and recursion
* A second optimization pass: peephole rules, dead-store elimination
* A bytecode file format (`.tcb`) so you can compile once and run later
* A text-to-x86-64 or LLVM IR backend instead of the VM
* An interactive visualizer of the pipeline (UI) built on `compile_source()`, which already
  returns the tokens, AST, optimized AST and bytecode as one object

from . import ops
from .errors import RuntimeErr

BINARY_OPS = {"ADD": "+", "SUB": "-", "MUL": "*", "DIV": "/", "MOD": "%",
              "EQ": "==", "NE": "!=", "LT": "<", "LE": "<=", "GT": ">", "GE": ">="}


class VM:
    def __init__(self, code, out=print, max_steps=1_000_000, trace=False):
        self.code = code
        self.out = out
        self.max_steps = max_steps
        self.trace = trace

    def run(self):
        code, stack, variables = self.code, [], {}
        pc = steps = 0
        while True:
            ins = code[pc]
            steps += 1
            if steps > self.max_steps:
                raise RuntimeErr("Step limit exceeded (possible infinite loop)", ins.line)
            if self.trace:
                print(f"[trace] pc={pc:04d} {str(ins):<14} stack={stack}")
            op = ins.op
            pc += 1
            if op == "PUSH":
                stack.append(ins.arg)
            elif op == "LOAD":
                if ins.arg not in variables:
                    raise RuntimeErr(f"Variable '{ins.arg}' has no value", ins.line)
                stack.append(variables[ins.arg])
            elif op == "STORE":
                variables[ins.arg] = stack.pop()
            elif op == "NEG":
                stack.append(-stack.pop())
            elif op == "NOT":
                stack.append(ops.UNARY["!"](stack.pop()))
            elif op in BINARY_OPS:
                b, a = stack.pop(), stack.pop()
                try:
                    stack.append(ops.BINARY[BINARY_OPS[op]](a, b))
                except ZeroDivisionError:
                    raise RuntimeErr("Division by zero", ins.line) from None
            elif op == "JMP":
                pc = ins.arg
            elif op == "JZ":
                if stack.pop() == 0:
                    pc = ins.arg
            elif op == "JNZ":
                if stack.pop() != 0:
                    pc = ins.arg
            elif op == "PRINT":
                self.out(stack.pop())
            elif op == "HALT":
                return variables
            else:
                raise RuntimeErr(f"Unknown instruction {op}", ins.line)

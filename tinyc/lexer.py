from dataclasses import dataclass

from .errors import CompileError

KEYWORDS = {"let", "print", "if", "else", "while"}
TWO_CHAR = {"==", "!=", "<=", ">=", "&&", "||"}
ONE_CHAR = set("+-*/%<>=!(){};")


@dataclass
class Token:
    type: str      # 'NUMBER', 'IDENT', 'EOF', or the literal text for keywords/operators
    value: object
    line: int
    col: int

    def __str__(self):
        return f"{self.line}:{self.col:<3} {self.type:<7} {self.value!r}"


def tokenize(src):
    tokens = []
    i, line, col, n = 0, 1, 1, len(src)
    while i < n:
        c = src[i]
        if c == "\n":
            i, line, col = i + 1, line + 1, 1
        elif c in " \t\r":
            i, col = i + 1, col + 1
        elif src.startswith("//", i):
            while i < n and src[i] != "\n":
                i += 1
        elif c.isdigit():
            j = i
            while j < n and src[j].isdigit():
                j += 1
            if j < n and (src[j].isalpha() or src[j] == "_"):
                raise CompileError("Invalid number literal", line, col)
            tokens.append(Token("NUMBER", int(src[i:j]), line, col))
            col += j - i
            i = j
        elif c.isalpha() or c == "_":
            j = i
            while j < n and (src[j].isalnum() or src[j] == "_"):
                j += 1
            word = src[i:j]
            kind = word if word in KEYWORDS else "IDENT"
            tokens.append(Token(kind, word, line, col))
            col += j - i
            i = j
        elif src[i:i + 2] in TWO_CHAR:
            tokens.append(Token(src[i:i + 2], src[i:i + 2], line, col))
            i, col = i + 2, col + 2
        elif c in ONE_CHAR:
            tokens.append(Token(c, c, line, col))
            i, col = i + 1, col + 1
        else:
            raise CompileError(f"Unexpected character {c!r}", line, col)
    tokens.append(Token("EOF", "", line, col))
    return tokens

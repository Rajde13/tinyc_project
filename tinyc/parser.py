from .ast_nodes import (Assign, Binary, Block, If, Let, Num, Print, Program,
                        Unary, Var, While)
from .errors import CompileError


class Parser:
    """Recursive-descent parser.

    Precedence, lowest to highest:
        ||  ->  &&  ->  == !=  ->  < <= > >=  ->  + -  ->  * / %  ->  unary - !
    """

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    # -- helpers --------------------------------------------------------
    def peek(self, offset=0):
        return self.tokens[min(self.pos + offset, len(self.tokens) - 1)]

    def advance(self):
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def expect(self, kind, what=None):
        tok = self.peek()
        if tok.type != kind:
            found = "end of input" if tok.type == "EOF" else repr(tok.value)
            raise CompileError(f"Expected {what or repr(kind)} but found {found}",
                               tok.line, tok.col)
        return self.advance()

    # -- statements -----------------------------------------------------
    def parse(self):
        stmts = []
        while self.peek().type != "EOF":
            stmts.append(self.statement())
        return Program(stmts)

    def block(self):
        self.expect("{", "'{'")
        stmts = []
        while self.peek().type not in ("}", "EOF"):
            stmts.append(self.statement())
        self.expect("}", "'}'")
        return Block(stmts)

    def statement(self):
        tok = self.peek()
        if tok.type == "let":
            self.advance()
            name = self.expect("IDENT", "a variable name")
            self.expect("=", "'='")
            value = self.expression()
            self.expect(";", "';'")
            return Let(name.value, value, tok.line)
        if tok.type == "print":
            self.advance()
            value = self.expression()
            self.expect(";", "';'")
            return Print(value, tok.line)
        if tok.type == "if":
            return self.if_statement()
        if tok.type == "while":
            self.advance()
            self.expect("(", "'('")
            cond = self.expression()
            self.expect(")", "')'")
            return While(cond, self.block(), tok.line)
        if tok.type == "{":
            return self.block()
        if tok.type == "IDENT" and self.peek(1).type == "=":
            self.advance()
            self.advance()
            value = self.expression()
            self.expect(";", "';'")
            return Assign(tok.value, value, tok.line)
        found = "end of input" if tok.type == "EOF" else repr(tok.value)
        raise CompileError(f"Expected a statement but found {found}", tok.line, tok.col)

    def if_statement(self):
        tok = self.expect("if")
        self.expect("(", "'('")
        cond = self.expression()
        self.expect(")", "')'")
        then = self.block()
        orelse = None
        if self.peek().type == "else":
            self.advance()
            if self.peek().type == "if":
                orelse = Block([self.if_statement()])
            else:
                orelse = self.block()
        return If(cond, then, orelse, tok.line)

    # -- expressions ----------------------------------------------------
    def _binary(self, sub, ops):
        left = sub()
        while self.peek().type in ops:
            op = self.advance()
            right = sub()
            left = Binary(op.type, left, right, op.line)
        return left

    def expression(self):
        return self._binary(self.and_expr, ("||",))

    def and_expr(self):
        return self._binary(self.equality, ("&&",))

    def equality(self):
        return self._binary(self.comparison, ("==", "!="))

    def comparison(self):
        return self._binary(self.additive, ("<", "<=", ">", ">="))

    def additive(self):
        return self._binary(self.term, ("+", "-"))

    def term(self):
        return self._binary(self.unary, ("*", "/", "%"))

    def unary(self):
        tok = self.peek()
        if tok.type in ("-", "!"):
            self.advance()
            return Unary(tok.type, self.unary(), tok.line)
        return self.primary()

    def primary(self):
        tok = self.peek()
        if tok.type == "NUMBER":
            self.advance()
            return Num(tok.value, tok.line)
        if tok.type == "IDENT":
            self.advance()
            return Var(tok.value, tok.line)
        if tok.type == "(":
            self.advance()
            expr = self.expression()
            self.expect(")", "')'")
            return expr
        found = "end of input" if tok.type == "EOF" else repr(tok.value)
        raise CompileError(f"Expected an expression but found {found}", tok.line, tok.col)

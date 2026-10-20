class CompileError(Exception):
    """Raised for lexing, parsing and semantic errors."""

    def __init__(self, message, line=None, col=None):
        super().__init__(message)
        self.message = message
        self.line = line
        self.col = col


class RuntimeErr(Exception):
    """Raised by the virtual machine while executing bytecode."""

    def __init__(self, message, line=None):
        super().__init__(message)
        self.message = message
        self.line = line

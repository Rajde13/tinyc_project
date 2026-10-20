import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tinyc import CompileError, RuntimeErr, compile_source, run_source, tokenize


class LexerTests(unittest.TestCase):
    def test_tokens_and_positions(self):
        toks = tokenize("let x = 10;\n// comment\nprint x >= 3;")
        self.assertEqual([t.type for t in toks],
                         ["let", "IDENT", "=", "NUMBER", ";", "print", "IDENT", ">=", "NUMBER", ";", "EOF"])
        self.assertEqual((toks[5].line, toks[5].col), (3, 1))

    def test_bad_character(self):
        with self.assertRaises(CompileError):
            tokenize("let x = 5 @ 3;")


class ExpressionTests(unittest.TestCase):
    def test_precedence(self):
        self.assertEqual(run_source("print 2 + 3 * 4;"), [14])
        self.assertEqual(run_source("print (2 + 3) * 4;"), [20])
        self.assertEqual(run_source("print 10 - 4 - 3;"), [3])     # left associative

    def test_unary_and_division(self):
        self.assertEqual(run_source("print -17 / 5;"), [-3])
        self.assertEqual(run_source("print -17 % 5;"), [-2])
        self.assertEqual(run_source("print !0; print !7;"), [1, 0])

    def test_comparison_and_logic(self):
        self.assertEqual(run_source("print 3 < 5; print 3 >= 5; print 4 == 4; print 4 != 4;"), [1, 0, 1, 0])
        self.assertEqual(run_source("print 1 && 0; print 1 || 0; print 0 || 0;"), [0, 1, 0])

    def test_short_circuit_skips_division_by_zero(self):
        src = "let z = 0; print z && (1 / z); print 1 || (1 / z);"
        self.assertEqual(run_source(src, optimize_code=False), [0, 1])


class StatementTests(unittest.TestCase):
    def test_variables_and_assignment(self):
        self.assertEqual(run_source("let x = 5; let y = x * (3 + 2); x = y - 4; print x;"), [21])

    def test_if_else_chain(self):
        src = """
        let n = 15;
        if (n < 10) { print 1; } else if (n < 20) { print 2; } else { print 3; }
        """
        self.assertEqual(run_source(src), [2])

    def test_while_loop(self):
        src = "let i = 1; let s = 0; while (i <= 100) { s = s + i; i = i + 1; } print s;"
        self.assertEqual(run_source(src), [5050])

    def test_nested_loops(self):
        src = """
        let i = 0; let count = 0;
        while (i < 5) { let j = 0; while (j < 5) { count = count + 1; j = j + 1; } i = i + 1; }
        print count;
        """
        self.assertEqual(run_source(src), [25])


class ErrorTests(unittest.TestCase):
    def test_syntax_error_has_line(self):
        with self.assertRaises(CompileError) as cm:
            compile_source("let x = 1;\nlet y = ;")
        self.assertEqual(cm.exception.line, 2)

    def test_undefined_variable(self):
        with self.assertRaises(CompileError):
            compile_source("print missing;")

    def test_self_reference_in_declaration(self):
        with self.assertRaises(CompileError):
            compile_source("let x = x + 1;")

    def test_redeclaration(self):
        with self.assertRaises(CompileError):
            compile_source("let x = 1; let x = 2;")

    def test_assign_before_declare(self):
        with self.assertRaises(CompileError):
            compile_source("x = 3;")

    def test_runtime_division_by_zero(self):
        with self.assertRaises(RuntimeErr) as cm:
            run_source("let z = 0;\nprint 1 / z;")
        self.assertEqual(cm.exception.line, 2)

    def test_infinite_loop_is_stopped(self):
        with self.assertRaises(RuntimeErr):
            run_source("while (1) { }", max_steps=10_000)


class OptimizerTests(unittest.TestCase):
    def test_constant_folding_shrinks_code(self):
        src = "print 2 * 3 + 4 * 5;"
        plain = compile_source(src, optimize_code=False).code
        folded = compile_source(src, optimize_code=True).code
        self.assertLess(len(folded), len(plain))
        self.assertEqual([str(i) for i in folded], ["PUSH 26", "PRINT", "HALT"])

    def test_dead_code_removed(self):
        src = "if (0) { print 1; } else { print 2; } while (0) { print 3; }"
        code = compile_source(src).code
        self.assertEqual([str(i) for i in code], ["PUSH 2", "PRINT", "HALT"])

    def test_division_by_constant_zero_not_folded(self):
        with self.assertRaises(RuntimeErr):
            run_source("print 1 / 0;")

    def test_optimization_preserves_behaviour(self):
        for name in ("arithmetic", "factorial", "fibonacci", "primes", "fizzbuzz", "optimizer_demo"):
            path = os.path.join(os.path.dirname(__file__), "..", "examples", name + ".tc")
            with open(path) as f:
                src = f.read()
            self.assertEqual(run_source(src, True), run_source(src, False), name)


class ExampleOutputTests(unittest.TestCase):
    def _run(self, name):
        path = os.path.join(os.path.dirname(__file__), "..", "examples", name + ".tc")
        with open(path) as f:
            return run_source(f.read())

    def test_factorial(self):
        self.assertEqual(self._run("factorial")[-1], 3628800)

    def test_fibonacci(self):
        self.assertEqual(self._run("fibonacci"),
                         [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377])

    def test_primes(self):
        self.assertEqual(self._run("primes"), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47])


if __name__ == "__main__":
    unittest.main()

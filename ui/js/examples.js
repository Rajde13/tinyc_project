/* Example programs shown in the dropdown. */
const EX={"Loop and branch":"// 10! with a filter\nlet n = 1;\nlet acc = 1;\nwhile (n <= 10) {\n    acc = acc * n;\n    if (acc % 2 == 0 && acc > 100) {\n        print acc;\n    }\n    n = n + 1;\n}",
"Precedence":"let x = 5;\nlet y = x * (3 + 2) - 4 / 2;\nprint y;","Syntax error":"let x = ;\nprint x;","Type error":"let a = 3;\nlet b = a < 5;\nprint b + 1;","Undefined variable":"let x = 5;\nprint x + y;"};

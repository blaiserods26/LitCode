# 16: C++ and Java Local Test Runner Harness

**What to build:** Automatic compilation and execution harnesses for C++ (`g++` / `clang++`) and Java (`javac` / `java`), enabling local offline test case validation for compiled languages alongside Python and Node.js.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] C++ test harness generator with `Solution` class linking, JSON parsing header or lightweight token parser, compiling via `g++`
- [ ] Java test harness generator with reflection or direct invocation compiling via `javac` and running `java`
- [ ] Settings configuration for custom compiler paths and optimization flags (`-O2`, `-std=c++17`)
- [ ] Reporting compilation errors with line numbers mapped back to user's solution file

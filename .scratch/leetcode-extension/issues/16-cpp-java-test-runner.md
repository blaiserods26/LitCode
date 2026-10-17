# 16: C++ and Java Local Test Runner Harness

**What to build:** Automatic compilation and execution harnesses for C++ (`g++` / `clang++`) and Java (`javac` / `java`), enabling local offline test case validation for compiled languages alongside Python and Node.js.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] C++ test harness generator with `Solution` class linking, compiling via `g++ -std=c++17` with timeout and clean temp artifact removal
- [x] Java test harness generator with class loader compiling via `javac` and running `java` with timeout
- [x] Clear diagnostic error messages when `g++` or `javac` are not found on the user's `PATH`
- [x] Comprehensive error capture reporting compilation stdout/stderr directly into webview test results
- [x] Unit tests for test runner dispatch and error conditions in `src/runner/localRunner.test.ts`

# 10 - Local Test Runner Harness

Type: task
Status: resolved
Blocked by: none

## Question

How can user code written in multiple languages (Python, TypeScript/JavaScript, C++, Java) be executed locally and safely against LeetCode test case formats?

## Answer

1. Implemented `LocalTestRunner` in `src/runner/localRunner.ts` supporting Python and JavaScript/TypeScript offline local execution.
2. Dynamic harness creation:
   - Python: Introspects `Solution` class, parses arguments via JSON deserialization, measures execution duration, and returns JSON-formatted results.
   - Node.js: Requires module, resolves method invocation on `Solution`, executes test cases sequentially, captures output and execution time.
3. Implemented output parser (`parseExpectedOutputsFromContent`) and comparator (`compareOutputs`) supporting JSON array and primitive normalization.
4. Comprehensive unit test coverage in `src/runner/localRunner.test.ts`.


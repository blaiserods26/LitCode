## Destination

A complete, production-ready VS Code extension for practicing LeetCode inside the editor: local-first problem fetching, side panel navigation (Daily Challenge, Bookmarks, Striver/NeetCode Study Plans), dual-mode test runner (local offline execution + optional authenticated submission), and a Socratic AI Coach that nudges without spoiling code.

## Notes

- Domain: VS Code Extension API, TypeScript, Webview API, LeetCode Public GraphQL API.
- Execution Policy: Carry execution into the map; decisions guide implementation directly.
- Phasing: Core extension (fetching, sidebar, workspace webview, local runner) is built first; Socratic AI Coach is deferred until core is functional.
- Auth Model: Guest-first hybrid. Unauthenticated by default; optional cookie login for official LeetCode submission and streak tracking.

## Decisions so far

- [01-auth-architecture](issues/01-auth-architecture.md): Guest-first hybrid; public GraphQL queries need no credentials, cookie login is purely optional.
- [02-execution-strategy](issues/02-execution-strategy.md): Dual-mode; local runtime runner for rapid test iteration + remote submission to LeetCode when authenticated.
- [03-ui-ux-layout](issues/03-ui-ux-layout.md): Activity Bar TreeView for navigation (Daily Challenge, Study Plans, Bookmarks) + companion Webview tab beside editor for problem details and test runner.
- [04-study-plans-data](issues/04-study-plans-data.md): Bundled JSON datasets for Striver's SDE Sheet, NeetCode 150, and Blind 75 with local completion persistence and remote updates.
- [05-project-scaffolding](issues/05-project-scaffolding.md): Manifest, TypeScript, and esbuild bundling pipeline initialized and verified.
- [06-leetcode-graphql-client](issues/06-leetcode-graphql-client.md): Public GraphQL client with in-memory caching and tests for daily challenge, problem details, search.
- [07-curated-study-plans-loader](issues/07-curated-study-plans-loader.md): Bundled Striver SDE, NeetCode 150, Blind 75 sheets and progress/bookmark manager.
- [08-side-panel-treeview](issues/08-side-panel-treeview.md): TreeDataProvider in Activity Bar for Daily Challenge, Study Plans, and Bookmarks.
- [09-problem-workspace-webview](issues/09-problem-workspace-webview.md): Companion Webview tab for problem statement, test cases, and runner UI.
- [10-local-test-runner-harness](issues/10-local-test-runner-harness.md): Multi-language local test execution harnesses (Python, JS/TS) with JSON deserialization and runner tests.
- [11-optional-auth-and-submission](issues/11-optional-auth-and-submission.md): Session cookie login, secret storage, and official LeetCode submission.
- [12-ai-socratic-coach](issues/12-ai-socratic-coach.md): Socratic AI Coach (`vscode.lm` + BYOK) with strict hint-only guardrails and Webview drawer.
- [17-vsix-packaging](issues/17-vsix-packaging.md): Standalone `.vsix` installer generation via `@vscode/vsce`.

## Open Tickets (The Frontier)

- [13-data-structure-visualizer](issues/13-data-structure-visualizer.md): Visual SVG rendering of `TreeNode` and `ListNode` inputs in Webview. (Unblocked)
- [14-mock-interview-timer](issues/14-mock-interview-timer.md): Status bar 45-min interview countdown and strict interview mode. (Unblocked)
- [15-spaced-repetition-review](issues/15-spaced-repetition-review.md): SuperMemo/Anki-style review schedule and "Due Today" sidebar queue. (Unblocked)
- [16-cpp-java-test-runner](issues/16-cpp-java-test-runner.md): Local compilation and execution harnesses for C++ (`g++`) and Java (`javac`). (Unblocked)

## Not yet specified

- Multi-language local test harness generation (Python, C++, Java, JS/TS wrapper templates).
- Webview UI design system & communication protocol between the open code document and the test runner webview.
- LeetCode GraphQL query details, pagination, and offline disk caching.
- Socratic Coach prompt templates, `vscode.lm` integration, and AST/regex code suppression filters.

## Out of scope

- Direct bypass of LeetCode Premium paywalls.
- LeetCode live contest virtual rankings and contest timers.
- Social community forums, discussion threads, and comment posting inside VS Code.

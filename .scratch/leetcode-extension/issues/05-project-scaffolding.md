# 05 - Extension Project Scaffolding

Type: task
Status: resolved
Blocked by: none

## Question

How should the VS Code extension project be structured and configured for modern build performance, bundling, and type safety?

## Answer

1. Scaffolding complete with `package.json` manifest defining Activity Bar views, Explorer TreeView, commands (`openProblem`, `openDailyChallenge`, `runLocalTests`, `submitSolution`, `signIn`, `toggleBookmark`), and configuration schema.
2. Build pipeline set up using `esbuild` for sub-30ms incremental builds and bundling into `dist/extension.js`.
3. Type checking configured with strict TypeScript (`tsconfig.json`) and test setup with Vitest (`vitest.config.ts`).


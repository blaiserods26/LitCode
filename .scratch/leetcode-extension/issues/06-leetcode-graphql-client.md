# 06 - LeetCode Public GraphQL Client

Type: task
Status: resolved
Blocked by: 05

## Question

How should the extension fetch the Daily Challenge, individual problem definitions, code stubs, constraints, and sample test cases without requiring user authentication?

## Answer

1. Implemented `LeetCodeClient` targeting `https://leetcode.com/graphql` with zero-auth queries (`questionOfToday`, `questionData`, `problemsetQuestionList`).
2. Implemented domain models in `src/api/types.ts`.
3. Integrated in-memory caching and TTL for daily challenge and problems to prevent duplicate network calls.
4. Fully covered with unit tests in `src/api/client.test.ts`.


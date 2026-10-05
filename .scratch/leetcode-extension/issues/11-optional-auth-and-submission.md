# 11 - Optional Authentication and Remote Submission

Type: task
Status: resolved
Blocked by: none

## Question

How should optional user authentication be managed, and how should submissions be dispatched to LeetCode's backend?

## Answer

1. Implemented `SessionManager` in `src/auth/sessionManager.ts` managing:
   - SecretStorage persistence of `LEETCODE_SESSION` and `csrftoken`.
   - `parseCookieString()` parser handling raw browser DevTools cookie headers.
   - Interactive `promptSignIn()` and `promptSignOut()` commands.
2. Implemented remote submission dispatcher with CSRF token authentication and exponential status polling to `submissions/detail/<id>/check/`.
3. 100% test coverage for cookie string parser in `src/auth/sessionManager.test.ts`.


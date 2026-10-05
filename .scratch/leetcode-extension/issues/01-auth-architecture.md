# 01 - Authentication Architecture

Type: grilling
Status: resolved
Blocked by: none

## Question

Should the extension enforce mandatory user authentication with LeetCode credentials, or should it support unauthenticated guest usage?

## Answer

Guest-First Hybrid:
1. Public GraphQL operations (problem statements, daily challenge, difficulty, tags, sample test cases) require zero authentication and work immediately upon installation.
2. An optional session-based login (storing `LEETCODE_SESSION` and `csrftoken` securely in VS Code `SecretStorage`) is available for users who want official submission sync and streak tracking.
3. This eliminates friction, prevents initial Cloudflare barrier issues, and ensures the extension remains functional even if credentials expire.

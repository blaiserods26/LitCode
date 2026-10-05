# 02 - Execution Strategy

Type: grilling
Status: resolved
Blocked by: 01

## Question

How should code testing and submission be handled—locally on the user's machine or remotely on LeetCode's servers?

## Answer

Dual Mode:
1. Fast local execution using the user's local installed runtime (Node.js, Python, g++/clang, Java) for sample and custom test cases. Local execution is instant, offline-capable, and avoids Cloudflare rate limits.
2. Optional remote submission dispatched to LeetCode's backend when the user is authenticated, allowing official AC status and submission history updates.

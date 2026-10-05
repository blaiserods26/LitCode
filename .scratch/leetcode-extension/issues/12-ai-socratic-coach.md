# 12: AI Socratic Coach Integration

**What to build:** An in-webview Socratic AI drawer powered by native `vscode.lm` (Copilot/editor AI) or user API keys (BYOK) that provides 3-tier progressive hints, algorithmic pattern nudges, and "Why did my test fail?" explanations—with an automated guardrail filter that prevents outputting executable solution code.

**Blocked by:** None

**Status:** resolved

- [x] Support `vscode.lm` language model family query (`vscode.lm.selectChatModels`)
- [x] Fallback configuration in settings for BYOK API key (Google Gemini, OpenAI, Claude, local Ollama)
- [x] Strict Socratic Coach system prompt prohibiting direct code generation
- [x] Post-generation filter stripping code blocks if model slips up
- [x] Webview drawer with "Get Nudge (Level 1)", "Edge Case Warning (Level 2)", "Pseudocode Flow (Level 3)", and "Analyze Failed Test"

## Answer

1. Implemented Socratic prompt engine and code spoiler filter (`src/ai/guardrails.ts`) that strips code blocks and enforces conceptual nudges.
2. Implemented `SocraticCoach` (`src/ai/coach.ts`) seamlessly querying native `vscode.lm` or configured BYOK endpoint with heuristic fallback.
3. Integrated Socratic AI Coach drawer directly into the companion problem Webview (`src/views/problemWebview.ts`) with interactive buttons (Level 1 Nudge, Level 2 Alert, Level 3 Flow, Complexity Analysis, and per-test "Why Failed?" diagnosis).
4. Unit tests in `src/ai/guardrails.test.ts`.


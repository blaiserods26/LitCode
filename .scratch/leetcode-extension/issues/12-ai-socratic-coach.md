# 12 - AI Socratic Coach Integration

Type: task
Status: open
Blocked by: 10

## Question

How should the Socratic AI Coach be architected to leverage the user's active AI model (`vscode.lm` or BYOK) while strictly enforcing no-spoilers coaching?

## Implementation Plan (On Hold Until Core Extension is Built)

1. Provider Layer:
   - Primary: `vscode.lm.selectChatModels()` to hook directly into whichever AI model the user has active in VS Code.
   - Secondary / Fallback: Configurable API Key in settings (Google Gemini, Anthropic Claude, OpenAI, Ollama).
2. Socratic Prompt Protocol:
   - System prompt instructs model to act as a seasoned algorithmic mentor.
   - Explicit instructions never to provide complete code snippets or answers.
   - Hint tiered strategy: (1) Conceptual question → (2) Invariant / algorithmic pattern clue → (3) Edge-case alert → (4) Pseudocode walkthrough.
3. Post-Filter Guardrail:
   - Regular expression / AST parser scans response for executable code blocks. If detected, intercepts and replaces with guiding questions.
4. UI Drawer:
   - Collapsible AI Coach panel integrated directly into the Problem Workspace Webview.

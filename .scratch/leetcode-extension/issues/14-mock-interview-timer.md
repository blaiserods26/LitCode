# 14: Mock Interview Mode & Countdown Timer

**What to build:** A 45-minute countdown timer pinned to the VS Code Status Bar with visual urgency indicators and audio/notification chime upon expiry, alongside an optional "Strict Mode" that temporarily suppresses editor completions/copilot to simulate live technical screens.

**Blocked by:** None

**Status:** resolved

- [x] Status bar timer item showing formatted time remaining `$(watch) 45:00`
- [x] Commands: Start Interview Timer, Pause/Resume Timer, Reset Timer
- [x] Visual alert and notification when timer reaches 5 minutes and 0 minutes
- [x] "Strict Mode" setting toggle that disables word completions and suggests mock environment

## Answer

1. Implemented `InterviewTimer` (`src/timer/interviewTimer.ts`) with start, pause, resume, reset, 5-minute warning, and expiry handlers.
2. Status Bar indicator displaying live time with urgency icons (`$(watch)`, `$(alert)` with warning color under 5m, and `$(error)` on expiry).
3. Registered interactive commands: `leetcode.startInterviewTimer` (duration QuickPick), `leetcode.toggleInterviewTimer`, `leetcode.resetInterviewTimer`, and `leetcode.toggleStrictMode`.
4. Unit tests in `src/timer/interviewTimer.test.ts`.


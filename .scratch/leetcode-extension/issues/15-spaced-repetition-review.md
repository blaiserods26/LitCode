# 15: Spaced Repetition (SRS) Review Queue

**What to build:** An Anki-style review schedule (3 days → 7 days → 21 days) tracked in `globalState` that surfaces a **"Due for Review Today"** section in the Activity Bar explorer to prevent forgetting previously solved problems.

**Blocked by:** None

**Status:** resolved

- [x] Data structure recording solved timestamps, review interval stage (0=new, 1=3d, 2=7d, 3=21d), and ease rating
- [x] Activity Bar TreeView section: `Due for Review (N)`
- [x] Post-solution feedback prompt: "Rate difficulty: Again / Hard / Good / Easy"
- [x] Notification on startup if problems are due for review

## Answer

1. Implemented `SrsManager` (`src/srs/spacedRepetition.ts`) implementing a multi-stage review interval algorithm (1d / 3d / 7d / 21d / 30d+) with difficulty rating adjustments (`again`, `hard`, `good`, `easy`).
2. Persisted review schedules in VS Code `globalState`.
3. Added interactive `Due for Review (N)` queue at the top of the Activity Bar Explorer TreeView.
4. Added post-solve rating prompt when marking problems solved to automatically schedule subsequent reviews.
5. Startup notification alerting users if problems are due for spaced repetition review today.
6. Comprehensive unit test coverage in `src/srs/spacedRepetition.test.ts`.


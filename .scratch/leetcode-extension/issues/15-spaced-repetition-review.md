# 15: Spaced Repetition (SRS) Review Queue

**What to build:** An Anki-style review schedule (3 days → 7 days → 21 days) tracked in `globalState` that surfaces a **"Due for Review Today"** section in the Activity Bar explorer to prevent forgetting previously solved problems.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Data structure recording solved timestamps, review interval stage (0=new, 1=3d, 2=7d, 3=21d), and ease rating
- [ ] Activity Bar TreeView section: `Due for Review (N)`
- [ ] Post-solution feedback prompt: "Rate difficulty: Again / Hard / Good / Easy"
- [ ] Notification on startup if problems are due for review

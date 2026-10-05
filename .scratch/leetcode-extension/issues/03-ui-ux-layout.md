# 03 - UI and Workspace Layout

Type: grilling
Status: resolved
Blocked by: none

## Question

How should the extension's user interface be organized within VS Code?

## Answer

Activity Bar TreeView + Companion Editor Webview:
1. Native TreeView in the VS Code Activity Bar with sections:
   - Daily Challenge (with calendar indicator & countdown)
   - Study Plans (Striver SDE Sheet, NeetCode 150, Blind 75)
   - Bookmarked Problems
   - Solved / History
2. Clicking a problem creates/opens a local solution file (e.g. `leetcode/problems/0001-two-sum/solution.py`) in the main editor.
3. Automatically opens a companion Webview tab beside the code editor displaying:
   - Problem statement in Markdown, constraints, difficulty badge, topic tags
   - Test cases interactive runner (sample cases + custom case input)
   - Action buttons: "Run Local Tests", "Submit to LeetCode", "Bookmark"

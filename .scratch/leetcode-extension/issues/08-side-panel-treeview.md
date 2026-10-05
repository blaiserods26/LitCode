# 08 - Side Panel TreeView

Type: task
Status: resolved
Blocked by: none

## Question

How should the side panel explorer be rendered using VS Code's TreeDataProvider to allow seamless navigation through Daily Challenge, Study Plans, and Bookmarks?

## Answer

1. Implemented `LeetCodeTreeDataProvider` implementing `vscode.TreeDataProvider<LeetCodeTreeItem>`.
2. Hierarchical structure rendered:
   - 🔥 Daily Challenge with auto-fetch, date badge, and solved indicator.
   - 📚 Curated Study Plans (Striver, NeetCode 150, Blind 75) with progress percentage and categorized problem trees.
   - ⭐ Bookmarks drawer listing saved questions with instant navigation.
3. Click integration mapped to `leetcode.openProblem` command with problem payload.


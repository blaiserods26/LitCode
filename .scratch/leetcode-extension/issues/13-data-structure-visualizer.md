# 13: Data Structure Visualizer (TreeNode & ListNode)

**What to build:** Automatic visual rendering of LeetCode serialized test inputs (such as `[3,9,20,null,null,15,7]` or `[1,2,3,4,5]`) as interactive SVG diagrams in the Webview companion tab, plus built-in `ListNode`/`TreeNode` helper definitions injected into local starter stubs.

**Blocked by:** None

**Status:** resolved

- [x] Parser for serialized array representations of binary trees (level-order traversal with nulls)
- [x] Parser for serialized array representations of singly linked lists
- [x] SVG tree generator calculating hierarchical node coordinates and branch lines
- [x] SVG linked list chain generator with pointer arrows
- [x] Interactive toggle button in Webview test cases to view visual representation

## Answer

1. Implemented data structure visualizer engine in `src/visualizer/dsVisualizer.ts` with geometric coordinate mapping and SVG generator for binary trees and linked lists.
2. Integrated interactive "🌲 Visualize Structure" button directly into the Problem Workspace Webview.
3. Automatically detects array representations like `[3,9,20,null,null,15,7]` and renders interactive tree branch diagrams and linked list chains.
4. Comprehensive unit test coverage in `src/visualizer/dsVisualizer.test.ts`.


# LeetCode Practice Companion (VS Code Extension)

A VS Code extension designed for frictionless, local-first algorithmic problem solving, curated curriculum tracking (Striver's SDE Sheet, NeetCode 150, Blind 75), and offline test case validation.

---

## ✨ Features

- **Guest-First (Zero Friction)**: Browse problems, daily challenges, and curated study plans immediately upon installation with zero authentication required.
- **Activity Bar Side Panel**:
  - 🔥 **Daily Coding Challenge**: Auto-fetches the active problem of the day with direct one-click workspace setup.
  - 📚 **Curated Study Plans**: Built-in support for **Striver's SDE Sheet**, **NeetCode 150**, and **Blind 75** with real-time completion progress percentages.
  - ⭐ **Bookmarks & History**: Star problems to revisit anytime; toggle problem solved checkboxes.
  - 🔍 **Problem Search**: Search LeetCode problems directly from VS Code via QuickPick (`Ctrl+Shift+P` -> `LeetCode: Search Problem`).
- **Companion Problem Webview**:
  - Automatically opens beside your code editor (`ViewColumn.Beside`).
  - Renders difficulty badges, tags, clean markdown statements, interactive examples, constraints, and hints.
- **⚡ Local Test Runner**:
  - Run your code against sample and custom test cases right on your computer without sending requests to LeetCode.
  - Instant offline feedback, pass/fail status, runtime in milliseconds, and expected vs. actual outputs.
  - Supports Python 3 and Node.js (JavaScript / TypeScript).
- **☁ Optional Remote Submission**:
  - Connect your LeetCode session cookie securely using VS Code `SecretStorage` to submit directly to LeetCode and update your streak.

---

## 🛠️ Configuration Settings

Configure these in VS Code Settings (`Ctrl+,` -> Search `LeetCode`):

| Setting | Default | Description |
| :--- | :--- | :--- |
| `leetcode.defaultLanguage` | `"python3"` | Default language for solution templates (`python3`, `javascript`, `typescript`, `cpp`, `java`). |
| `leetcode.workspaceDirectory` | `"leetcode-solutions"` | Relative folder path where solution files will be organized. |
| `leetcode.autoOpenCompanionWebview` | `true` | Automatically open the companion problem viewer beside your solution editor. |
| `leetcode.endpoint` | `"https://leetcode.com"` | LeetCode endpoint (`https://leetcode.com` or `https://leetcode.cn`). |

---

## 🧪 Development & Testing

```bash
# Install dependencies
npm install

# Run build / bundle with esbuild
npm run compile

# Typecheck TypeScript
npm run typecheck

# Run unit tests
npm test
```

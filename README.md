<p align="center">
  <img src="resources/icons/icon.png" width="160" alt="LitCode Logo" style="border-radius: 24px;" />
</p>

<h1 align="center">LitCode 🔥</h1>

<p align="center">
  <b>The modern, local-first LeetCode companion for VS Code</b>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=BlaiseRodrigues.litcode"><img src="https://img.shields.io/badge/VS%20Code%20Marketplace-v1.0.0-brightgreen.svg" alt="Visual Studio Marketplace" /></a>
  <a href="https://open-vsx.org/extension/BlaiseRodrigues/litcode"><img src="https://img.shields.io/badge/Open%20VSX-v1.0.0-purple.svg" alt="Open VSX" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://github.com/blaiserods26/LitCode"><img src="https://img.shields.io/badge/GitHub-blaiserods26%2FLitCode-blue.svg" alt="GitHub Repo" /></a>
</p>

A VS Code extension designed for frictionless, local-first algorithmic problem solving, curated curriculum tracking (Striver's SDE Sheet, NeetCode 150, Blind 75), multi-language offline test validation, and Socratic hints.

---

## ✨ Key Features

- **🚀 Guest-First (Zero Setup Required)**:
  - Browse problems, daily challenges, and curated study plans immediately upon installation with zero authentication or login required.
- **Activity Bar Side Panel**:
  - 🔥 **Daily Coding Challenge**: Auto-fetches the active problem of the day with direct one-click workspace setup.
  - 📚 **Curated Study Plans**: Built-in support for **Striver's SDE Sheet**, **NeetCode 150**, and **Blind 75** with real-time completion tracking.
  - ➕ **Custom Study Plans**: Create, import, export, and manage your own custom problem sheets.
  - ⭐ **Bookmarks & Solved Tracking**: Star favorite problems and mark completed problems with offline persistence.
  - 🔍 **Problem Search**: Search 3,000+ LeetCode problems directly from VS Code via QuickPick (`Ctrl+Shift+P` -> `LeetCode: Search Problems`).
- **🖥️ Companion Problem Webview**:
  - Automatically opens beside your code editor (`ViewColumn.Beside`).
  - Displays difficulty badges, problem topics/tags, clean markdown statements, interactive examples, constraints, and hints.
- **⚡ Local Multi-Language Test Runner**:
  - Run your code against sample and custom test cases right on your computer without sending requests to LeetCode.
  - Instant offline feedback, pass/fail status, runtime in milliseconds, and expected vs. actual outputs.
  - **Supported Languages**: **Python 3**, **JavaScript (Node.js)**, **TypeScript**, **C++ (g++)**, and **Java**.
- **⏱️ Mock Interview Timer & Strict Mode**:
  - Practice under real interview conditions with a countdown timer (default 45 min) in the status bar.
  - Strict mode alerts you if you leave the editor or switch windows during the session.
- **🧠 Spaced Repetition System (SRS)**:
  - Automatically schedules problem reviews based on SM-2 spaced repetition algorithms to ensure long-term retention.
- **🤖 Socratic AI Coach (BYOK & Copilot)**:
  - Get progressive, Socratic hints without spoiling the entire solution.
  - Zero-cost out of the box using VS Code's Language Model API (GitHub Copilot), or Bring-Your-Own-Key (BYOK) for OpenAI, Gemini, Claude, or local Ollama.
- **☁️ Remote Submission (Optional)**:
  - Connect your LeetCode session cookies securely using VS Code `SecretStorage` to submit directly to LeetCode and keep your streak alive.

---

## 🛠️ Configuration Settings

Configure these in VS Code Settings (`Ctrl+,` -> Search `LitCode`):

| Setting | Default | Description |
| :--- | :--- | :--- |
| `leetcode.defaultLanguage` | `"python3"` | Default language for solutions (`python3`, `javascript`, `typescript`, `cpp`, `java`). |
| `leetcode.solutionsDirectory` | `""` | Directory path where solutions are saved. Defaults to `~/.leetcode/solutions`. |
| `leetcode.autoOpenCompanionWebview` | `true` | Automatically open the companion problem viewer beside your solution editor. |
| `leetcode.endpoint` | `"https://leetcode.com"` | LeetCode endpoint (`https://leetcode.com` or `https://leetcode.cn`). |
| `leetcode.ai.apiKey` | `""` | Custom API Key for AI Coach (BYOK). Leave empty to use VS Code Language Model API. |
| `leetcode.ai.endpoint` | `"https://api.openai.com/v1/chat/completions"` | Custom AI API endpoint (OpenAI, Ollama, etc.). |
| `leetcode.ai.model` | `"gpt-4o-mini"` | Model identifier for custom AI provider. |

---

## ⌨️ Commands

| Command | Title |
| :--- | :--- |
| `leetcode.openDailyChallenge` | Open Today's Daily Challenge |
| `leetcode.searchProblem` | Search LeetCode Problems |
| `leetcode.refreshExplorer` | Refresh Explorer View |
| `leetcode.runLocalTests` | Run Local Tests (Python / JS / TS / C++ / Java) |
| `leetcode.submitSolution` | Submit Solution to LeetCode |
| `leetcode.startInterviewTimer` | Start Mock Interview Timer |
| `leetcode.toggleStrictMode` | Toggle Strict Mock Interview Mode |
| `leetcode.changeLanguage` | Change Preferred Language |
| `leetcode.signIn` | Sign In with LeetCode Cookies |
| `leetcode.signOut` | Sign Out |

---

## 📦 Publishing

### VS Code Marketplace
1. Get a Personal Access Token (PAT) from [Azure DevOps](https://dev.azure.com/) with **Marketplace (Manage)** scope.
2. Publish with:
   ```bash
   npx vsce publish -p <YOUR_VS_CODE_PAT>
   ```

### Open VSX
1. Get an Access Token from [Open VSX Registry](https://open-vsx.org/user-settings/tokens).
2. Publish with:
   ```bash
   npx ovsx publish -p <YOUR_OPEN_VSX_TOKEN>
   ```

---

## 📄 License

This extension is licensed under the [MIT License](LICENSE).

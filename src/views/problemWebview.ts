import * as vscode from 'vscode';
import { LeetCodeProblemDetail } from '../api/types';
import { StudyPlanManager } from '../studyPlans/manager';

export interface TestResultItem {
  caseIndex: number;
  input: string;
  expectedOutput?: string;
  actualOutput?: string;
  passed: boolean;
  runtimeMs?: number;
  stdout?: string;
  errorMessage?: string;
}

export interface WebviewMessage {
  command:
    | 'runTests'
    | 'submitSolution'
    | 'toggleBookmark'
    | 'toggleSolved'
    | 'openExternal'
    | 'requestAiHint'
    | 'requestComplexity'
    | 'diagnoseFailure';
  payload?: any;
}

export type AiRequestHandler = (
  action: 'hint' | 'failure' | 'complexity',
  payload?: any
) => Promise<string>;

export class ProblemWebviewPanel {
  public static currentPanel: ProblemWebviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _problem: LeetCodeProblemDetail | null = null;

  public static createOrShow(
    extensionUri: vscode.Uri,
    problem: LeetCodeProblemDetail,
    planManager: StudyPlanManager,
    onRunTests?: (testCases: string[]) => Promise<TestResultItem[]>,
    onSubmit?: () => Promise<any>,
    onAiRequest?: AiRequestHandler
  ): ProblemWebviewPanel {
    const column = vscode.ViewColumn.Beside;

    if (ProblemWebviewPanel.currentPanel) {
      ProblemWebviewPanel.currentPanel._panel.reveal(column);
      ProblemWebviewPanel.currentPanel.setProblem(
        problem,
        planManager,
        onRunTests,
        onSubmit,
        onAiRequest
      );
      return ProblemWebviewPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'leetcodeProblemView',
      `LeetCode: ${problem.title}`,
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    ProblemWebviewPanel.currentPanel = new ProblemWebviewPanel(
      panel,
      extensionUri,
      problem,
      planManager,
      onRunTests,
      onSubmit,
      onAiRequest
    );
    return ProblemWebviewPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    problem: LeetCodeProblemDetail,
    private planManager: StudyPlanManager,
    private onRunTests?: (testCases: string[]) => Promise<TestResultItem[]>,
    private onSubmit?: () => Promise<any>,
    private onAiRequest?: AiRequestHandler
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this.setProblem(problem, planManager, onRunTests, onSubmit, onAiRequest);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        if (!this._problem) {
          return;
        }

        switch (message.command) {
          case 'toggleBookmark': {
            const isBookmarked = await this.planManager.toggleBookmark(this._problem.titleSlug);
            this._panel.webview.postMessage({ type: 'bookmarkUpdated', isBookmarked });
            vscode.commands.executeCommand('leetcode.refreshExplorer');
            break;
          }
          case 'toggleSolved': {
            const isSolved = await this.planManager.toggleSolved(this._problem.titleSlug);
            this._panel.webview.postMessage({ type: 'solvedUpdated', isSolved });
            vscode.commands.executeCommand('leetcode.refreshExplorer');
            break;
          }
          case 'openExternal': {
            const url = `https://leetcode.com/problems/${this._problem.titleSlug}/`;
            vscode.env.openExternal(vscode.Uri.parse(url));
            break;
          }
          case 'runTests': {
            if (this.onRunTests) {
              const testCases: string[] =
                message.payload?.testCases || this._problem.exampleTestcaseList;
              this._panel.webview.postMessage({ type: 'testingStarted' });
              try {
                const results = await this.onRunTests(testCases);
                this._panel.webview.postMessage({ type: 'testingCompleted', results });
              } catch (err: any) {
                this._panel.webview.postMessage({
                  type: 'testingError',
                  error: err.message || 'Execution error',
                });
              }
            } else {
              vscode.window.showInformationMessage('Local test runner not connected.');
            }
            break;
          }
          case 'submitSolution': {
            if (this.onSubmit) {
              this._panel.webview.postMessage({ type: 'submissionStarted' });
              try {
                const result = await this.onSubmit();
                this._panel.webview.postMessage({ type: 'submissionCompleted', result });
              } catch (err: any) {
                this._panel.webview.postMessage({
                  type: 'submissionError',
                  error: err.message || 'Submission error',
                });
              }
            } else {
              vscode.window.showInformationMessage('Sign in with LeetCode session to submit.');
            }
            break;
          }
          case 'requestAiHint': {
            if (this.onAiRequest) {
              this._panel.webview.postMessage({ type: 'aiStarted' });
              try {
                const text = await this.onAiRequest('hint', message.payload);
                this._panel.webview.postMessage({ type: 'aiCompleted', text });
              } catch (err: any) {
                this._panel.webview.postMessage({ type: 'aiError', error: err.message });
              }
            } else {
              vscode.window.showInformationMessage('AI Coach not available.');
            }
            break;
          }
          case 'requestComplexity': {
            if (this.onAiRequest) {
              this._panel.webview.postMessage({ type: 'aiStarted' });
              try {
                const text = await this.onAiRequest('complexity', message.payload);
                this._panel.webview.postMessage({ type: 'aiCompleted', text });
              } catch (err: any) {
                this._panel.webview.postMessage({ type: 'aiError', error: err.message });
              }
            }
            break;
          }
          case 'diagnoseFailure': {
            if (this.onAiRequest) {
              this._panel.webview.postMessage({ type: 'aiStarted' });
              try {
                const text = await this.onAiRequest('failure', message.payload);
                this._panel.webview.postMessage({ type: 'aiCompleted', text });
              } catch (err: any) {
                this._panel.webview.postMessage({ type: 'aiError', error: err.message });
              }
            }
            break;
          }
        }
      },
      null,
      this._disposables
    );
  }

  public setProblem(
    problem: LeetCodeProblemDetail,
    planManager: StudyPlanManager,
    onRunTests?: (testCases: string[]) => Promise<TestResultItem[]>,
    onSubmit?: () => Promise<any>,
    onAiRequest?: AiRequestHandler
  ): void {
    this._problem = problem;
    this.planManager = planManager;
    if (onRunTests) this.onRunTests = onRunTests;
    if (onSubmit) this.onSubmit = onSubmit;
    if (onAiRequest) this.onAiRequest = onAiRequest;

    this._panel.title = `#${problem.questionFrontendId} ${problem.title}`;
    this._panel.webview.html = this._getHtmlForWebview(problem);
  }

  public dispose(): void {
    ProblemWebviewPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }

  private _getHtmlForWebview(problem: LeetCodeProblemDetail): string {
    const isBookmarked = this.planManager.isBookmarked(problem.titleSlug);
    const isSolved = this.planManager.isSolved(problem.titleSlug);

    const diffColors: Record<string, string> = {
      Easy: '#00b8a3',
      Medium: '#ffc01e',
      Hard: '#ff375f',
    };
    const diffColor = diffColors[problem.difficulty] || '#00b8a3';

    const tagsHtml = problem.topicTags
      .map((tag) => `<span class="tag">${tag.name}</span>`)
      .join(' ');

    const sampleCasesJson = JSON.stringify(
      problem.exampleTestcaseList || [problem.sampleTestCase || '']
    );

    const hintsHtml =
      problem.hints && problem.hints.length > 0
        ? problem.hints
            .map(
              (hint, i) => `
              <details class="hint-details">
                <summary>💡 Hint ${i + 1}</summary>
                <div class="hint-body">${hint}</div>
              </details>
            `
            )
            .join('')
        : '<p class="subtext">No official hints for this problem.</p>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${problem.title}</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #d4d4d4);
      --card-bg: var(--vscode-editorWidget-background, #252526);
      --border: var(--vscode-editorWidget-border, #3c3c3c);
      --btn-bg: var(--vscode-button-background, #0e639c);
      --btn-fg: var(--vscode-button-foreground, #ffffff);
      --btn-hover: var(--vscode-button-hoverBackground, #1177bb);
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      line-height: 1.6;
      margin: 0;
      padding: 24px;
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      background: var(--btn-bg);
      color: var(--btn-fg);
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn:hover {
      background: var(--btn-hover);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--fg);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .diff-badge {
      background-color: ${diffColor}22;
      color: ${diffColor};
      border: 1px solid ${diffColor}55;
    }
    .tags-container {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      color: var(--fg);
      opacity: 0.85;
    }
    .content-area {
      font-size: 14px;
      margin-top: 16px;
    }
    .content-area pre {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
    }
    .content-area code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 13px;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin-top: 28px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    .ai-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .ai-response-box {
      margin-top: 12px;
      padding: 14px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #00b8a3;
      font-size: 13px;
      line-height: 1.6;
      display: none;
    }
    .ai-response-box.visible {
      display: block;
    }
    .case-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .case-tab {
      background: transparent;
      border: none;
      color: var(--fg);
      opacity: 0.6;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .case-tab.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    textarea.test-input {
      width: 100%;
      height: 90px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--fg);
      font-family: 'Consolas', monospace;
      font-size: 13px;
      padding: 8px;
      resize: vertical;
    }
    .runner-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 12px;
    }
    .result-box {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: rgba(0, 0, 0, 0.2);
      display: none;
    }
    .result-box.visible {
      display: block;
    }
    .res-passed {
      border-left: 4px solid #00b8a3;
    }
    .res-failed {
      border-left: 4px solid #ff375f;
    }
    .hint-details {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 8px;
      padding: 8px 12px;
      cursor: pointer;
    }
    .hint-body {
      margin-top: 8px;
      font-size: 13px;
      opacity: 0.9;
    }
    .subtext {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-row">
      <h1 class="title">
        #${problem.questionFrontendId}. ${problem.title}
        <span class="badge diff-badge">${problem.difficulty}</span>
      </h1>
      <div class="actions">
        <button id="bookmarkBtn" class="btn btn-secondary">
          ${isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
        </button>
        <button id="solvedBtn" class="btn btn-secondary">
          ${isSolved ? '✓ Solved' : '○ Mark Solved'}
        </button>
        <button id="externalBtn" class="btn btn-secondary">
          ↗ LeetCode Web
        </button>
      </div>
    </div>
    <div class="tags-container">
      ${tagsHtml}
    </div>
  </div>

  <div class="content-area">
    ${problem.content || '<p>Problem statement loading or unavailable.</p>'}
  </div>

  <!-- Socratic AI Helper -->
  <div class="section-title">🧠 Socratic AI Coach (No Code Spoilers)</div>
  <div class="card">
    <div class="subtext" style="margin-bottom: 10px;">
      Ask your AI coach for progressive guidance without giving away code:
    </div>
    <div class="ai-actions">
      <button class="btn btn-secondary" onclick="requestAiHint(1)">💡 Level 1: Intuition</button>
      <button class="btn btn-secondary" onclick="requestAiHint(2)">⚠️ Level 2: Edge Cases</button>
      <button class="btn btn-secondary" onclick="requestAiHint(3)">🔄 Level 3: Pseudocode</button>
      <button class="btn btn-secondary" onclick="requestComplexity()">⏱️ Check Complexity</button>
    </div>
    <div id="aiBox" class="ai-response-box"></div>
  </div>

  <div class="section-title">💡 Official Hints</div>
  ${hintsHtml}

  <div class="section-title">🧪 Test Runner</div>
  <div class="card">
    <div class="case-tabs" id="caseTabs"></div>
    <textarea id="currentCaseInput" class="test-input" spellcheck="false"></textarea>
    <div class="runner-actions">
      <button id="runTestsBtn" class="btn">▶ Run Local Tests</button>
      <button id="submitBtn" class="btn" style="background:#2e7d32;">☁ Submit Solution</button>
    </div>
    <div id="resultsBox" class="result-box"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const testCases = ${sampleCasesJson};
    let activeCaseIndex = 0;
    let lastResults = [];

    const caseTabs = document.getElementById('caseTabs');
    const inputArea = document.getElementById('currentCaseInput');
    const runBtn = document.getElementById('runTestsBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resultsBox = document.getElementById('resultsBox');
    const aiBox = document.getElementById('aiBox');
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const solvedBtn = document.getElementById('solvedBtn');
    const externalBtn = document.getElementById('externalBtn');

    function renderTabs() {
      caseTabs.innerHTML = '';
      testCases.forEach((tc, idx) => {
        const btn = document.createElement('button');
        btn.className = 'case-tab' + (idx === activeCaseIndex ? ' active' : '');
        btn.textContent = 'Case ' + (idx + 1);
        btn.onclick = () => {
          testCases[activeCaseIndex] = inputArea.value;
          activeCaseIndex = idx;
          inputArea.value = testCases[activeCaseIndex] || '';
          renderTabs();
        };
        caseTabs.appendChild(btn);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'case-tab';
      addBtn.textContent = '+ Custom';
      addBtn.onclick = () => {
        testCases.push('');
        activeCaseIndex = testCases.length - 1;
        inputArea.value = '';
        renderTabs();
      };
      caseTabs.appendChild(addBtn);

      inputArea.value = testCases[activeCaseIndex] || '';
    }

    renderTabs();

    inputArea.addEventListener('input', () => {
      testCases[activeCaseIndex] = inputArea.value;
    });

    bookmarkBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggleBookmark' });
    });

    solvedBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggleSolved' });
    });

    externalBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'openExternal' });
    });

    runBtn.addEventListener('click', () => {
      testCases[activeCaseIndex] = inputArea.value;
      vscode.postMessage({
        command: 'runTests',
        payload: { testCases }
      });
    });

    submitBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'submitSolution' });
    });

    function requestAiHint(level) {
      vscode.postMessage({ command: 'requestAiHint', payload: { level } });
    }

    function requestComplexity() {
      vscode.postMessage({ command: 'requestComplexity' });
    }

    function diagnoseFailedCase(idx) {
      const res = lastResults[idx];
      vscode.postMessage({
        command: 'diagnoseFailure',
        payload: {
          failingInput: res.input,
          actualOutput: res.actualOutput,
          expectedOutput: res.expectedOutput
        }
      });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'bookmarkUpdated') {
        bookmarkBtn.textContent = msg.isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark';
      } else if (msg.type === 'solvedUpdated') {
        solvedBtn.textContent = msg.isSolved ? '✓ Solved' : '○ Mark Solved';
      } else if (msg.type === 'testingStarted') {
        resultsBox.className = 'result-box visible';
        resultsBox.innerHTML = '<em>⚡ Running test cases locally...</em>';
      } else if (msg.type === 'testingCompleted') {
        resultsBox.className = 'result-box visible';
        const results = msg.results || [];
        lastResults = results;
        const allPassed = results.every(r => r.passed);
        resultsBox.classList.add(allPassed ? 'res-passed' : 'res-failed');

        let html = '<div style="font-weight:600;font-size:14px;margin-bottom:8px;">' +
          (allPassed ? '✅ All Cases Passed!' : '❌ Some Cases Failed') +
          '</div>';

        results.forEach((r, i) => {
          html += '<div style="margin-top:6px;padding:6px;background:rgba(255,255,255,0.04);border-radius:4px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div><strong>Case ' + (i + 1) + ': </strong>' +
            '<span style="color:' + (r.passed ? '#00b8a3' : '#ff375f') + ';font-weight:600;">' + (r.passed ? 'PASSED' : 'FAILED') + '</span>' +
            (r.runtimeMs ? ' (' + r.runtimeMs + 'ms)' : '') + '</div>';

          if (!r.passed) {
            html += '<button class="btn btn-secondary" style="font-size:11px;padding:2px 8px;" onclick="diagnoseFailedCase(' + i + ')">🤖 Why Failed?</button>';
          }

          html += '</div>' +
            '<pre style="margin:4px 0 0 0;font-size:12px;">Input: ' + escapeHtml(r.input) + '\\n' +
            (r.actualOutput ? 'Output: ' + escapeHtml(r.actualOutput) + '\\n' : '') +
            (r.expectedOutput ? 'Expected: ' + escapeHtml(r.expectedOutput) + '\\n' : '') +
            (r.errorMessage ? 'Error: ' + escapeHtml(r.errorMessage) : '') +
            '</pre></div>';
        });
        resultsBox.innerHTML = html;
      } else if (msg.type === 'testingError') {
        resultsBox.className = 'result-box visible res-failed';
        resultsBox.innerHTML = '<strong>Execution Error:</strong> <pre>' + escapeHtml(msg.error) + '</pre>';
      } else if (msg.type === 'aiStarted') {
        aiBox.className = 'ai-response-box visible';
        aiBox.innerHTML = '<em>🤖 Thinking Socratic thoughts...</em>';
      } else if (msg.type === 'aiCompleted') {
        aiBox.className = 'ai-response-box visible';
        aiBox.innerHTML = '<strong>🤖 Socratic Coach:</strong><div style="margin-top:6px;">' + escapeHtml(msg.text).replace(/\\n/g, '<br/>') + '</div>';
      } else if (msg.type === 'aiError') {
        aiBox.className = 'ai-response-box visible';
        aiBox.innerHTML = '<strong>⚠️ AI Error:</strong> ' + escapeHtml(msg.error);
      } else if (msg.type === 'submissionStarted') {
        resultsBox.className = 'result-box visible';
        resultsBox.innerHTML = '<em>☁ Submitting solution to LeetCode...</em>';
      } else if (msg.type === 'submissionCompleted') {
        resultsBox.className = 'result-box visible';
        const res = msg.result;
        resultsBox.innerHTML = '<div style="font-weight:600;font-size:15px;color:#00b8a3;">Verdict: ' +
          escapeHtml(res.status_msg || 'Submitted') + '</div>' +
          (res.status_runtime ? '<div>Runtime: ' + escapeHtml(res.status_runtime) + '</div>' : '') +
          (res.status_memory ? '<div>Memory: ' + escapeHtml(res.status_memory) + '</div>' : '');
      } else if (msg.type === 'submissionError') {
        resultsBox.className = 'result-box visible res-failed';
        resultsBox.innerHTML = '<strong>Submission Error:</strong> ' + escapeHtml(msg.error);
      }
    });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`;
  }
}

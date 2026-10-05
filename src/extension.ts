import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LeetCodeClient } from './api/client';
import { LeetCodeProblemDetail } from './api/types';
import { StudyPlanManager } from './studyPlans/manager';
import { LeetCodeTreeDataProvider } from './views/treeDataProvider';
import { ProblemWebviewPanel } from './views/problemWebview';
import { LocalTestRunner, parseExpectedOutputsFromContent } from './runner/localRunner';
import { SessionManager } from './auth/sessionManager';

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('leetcode');
  const endpoint = config.get<string>('endpoint', 'https://leetcode.com');

  const client = new LeetCodeClient({ baseUrl: endpoint });
  const planManager = new StudyPlanManager(context.globalState);
  planManager.loadBundledPlansFromDirectory(context.extensionPath);

  const sessionManager = new SessionManager(context.secrets, endpoint);
  const localRunner = new LocalTestRunner();

  // Tree View
  const treeDataProvider = new LeetCodeTreeDataProvider(client, planManager);
  vscode.window.registerTreeDataProvider('leetcode-companion.explorer', treeDataProvider);

  // Helper to open a problem workspace
  async function openProblemWorkspace(problemSlug: string) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Loading problem "${problemSlug}"...`,
        cancellable: false,
      },
      async () => {
        try {
          const detail = await client.fetchProblemDetail(problemSlug);
          if (!detail) {
            vscode.window.showErrorMessage(`Problem not found: ${problemSlug}`);
            return;
          }

          if (detail.isPaidOnly) {
            vscode.window.showWarningMessage(`Problem "${detail.title}" is a LeetCode Premium problem.`);
          }

          const currentConfig = vscode.workspace.getConfiguration('leetcode');
          const defaultLang = currentConfig.get<string>('defaultLanguage', 'python3');
          const subDir = currentConfig.get<string>('workspaceDirectory', 'leetcode-solutions');

          // Determine language extension and snippet
          const langMap: Record<string, { ext: string; snippetSlug: string }> = {
            python3: { ext: '.py', snippetSlug: 'python3' },
            javascript: { ext: '.js', snippetSlug: 'javascript' },
            typescript: { ext: '.ts', snippetSlug: 'typescript' },
            cpp: { ext: '.cpp', snippetSlug: 'cpp' },
            java: { ext: '.java', snippetSlug: 'java' },
          };

          const langInfo = langMap[defaultLang] || langMap['python3'];
          const snippetObj = detail.codeSnippets?.find((s) => s.langSlug === langInfo.snippetSlug);
          const initialCode = snippetObj?.code || `# Solution for ${detail.title}\nclass Solution:\n    pass\n`;

          // Determine workspace directory
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || context.extensionPath;
          const problemFolder = path.join(
            workspaceFolder,
            subDir,
            `${detail.questionFrontendId.padStart(4, '0')}-${detail.titleSlug}`
          );

          if (!fs.existsSync(problemFolder)) {
            fs.mkdirSync(problemFolder, { recursive: true });
          }

          const solutionFile = path.join(problemFolder, `solution${langInfo.ext}`);
          if (!fs.existsSync(solutionFile)) {
            fs.writeFileSync(solutionFile, initialCode, 'utf-8');
          }

          // Open the code editor
          const doc = await vscode.workspace.openTextDocument(solutionFile);
          await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);

          // Open Companion Webview
          const autoOpen = currentConfig.get<boolean>('autoOpenCompanionWebview', true);
          if (autoOpen) {
            const expectedOutputs = parseExpectedOutputsFromContent(detail.content);

            ProblemWebviewPanel.createOrShow(
              context.extensionUri,
              detail,
              planManager,
              async (testCases: string[]) => {
                // Save document before running
                await doc.save();
                return localRunner.run(solutionFile, testCases, expectedOutputs);
              },
              async () => {
                await doc.save();
                const code = doc.getText();
                return sessionManager.submitSolution(
                  detail.titleSlug,
                  detail.questionId,
                  langInfo.snippetSlug,
                  code
                );
              }
            );
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to open problem: ${err.message}`);
        }
      }
    );
  }

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('leetcode.refreshExplorer', () => {
      treeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('leetcode.openDailyChallenge', async () => {
      const daily = await client.fetchDailyChallenge();
      if (daily?.question?.titleSlug) {
        await openProblemWorkspace(daily.question.titleSlug);
      } else {
        vscode.window.showErrorMessage('Could not load today\'s daily challenge.');
      }
    }),

    vscode.commands.registerCommand('leetcode.openProblem', async (item: any) => {
      const slug = typeof item === 'string' ? item : item?.slug || item?.problem?.slug;
      if (slug) {
        await openProblemWorkspace(slug);
      }
    }),

    vscode.commands.registerCommand('leetcode.searchProblem', async () => {
      const input = await vscode.window.showInputBox({
        title: 'Search LeetCode Problem',
        prompt: 'Enter problem name, keyword, or number:',
        placeHolder: 'e.g. Two Sum, 3sum, binary search',
      });

      if (!input) return;

      const results = await client.searchProblems(input, 15);
      if (results.length === 0) {
        vscode.window.showInformationMessage(`No problems found matching "${input}".`);
        return;
      }

      const pickItems = results.map((p) => ({
        label: `#${p.frontendQuestionId}. ${p.title}`,
        description: `[${p.difficulty}]${p.isPaidOnly ? ' 🔒 Premium' : ''}`,
        detail: p.topicTags?.map((t) => t.name).join(', ') || '',
        slug: p.titleSlug,
      }));

      const selected = await vscode.window.showQuickPick(pickItems, {
        placeHolder: 'Select a problem to solve',
      });

      if (selected) {
        await openProblemWorkspace(selected.slug);
      }
    }),

    vscode.commands.registerCommand('leetcode.runLocalTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active solution file open in editor.');
        return;
      }

      await editor.document.save();
      vscode.window.showInformationMessage('Running tests via Companion Webview tab.');
    }),

    vscode.commands.registerCommand('leetcode.submitSolution', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active solution file open in editor.');
        return;
      }

      await editor.document.save();
      vscode.window.showInformationMessage('Submitting via Companion Webview tab.');
    }),

    vscode.commands.registerCommand('leetcode.toggleBookmark', async (item: any) => {
      const slug = typeof item === 'string' ? item : item?.data?.problem?.slug || item?.slug;
      if (slug) {
        const isBookmarked = await planManager.toggleBookmark(slug);
        treeDataProvider.refresh();
        vscode.window.showInformationMessage(
          `${isBookmarked ? '⭐ Bookmarked' : 'Unbookmarked'} ${slug}`
        );
      }
    }),

    vscode.commands.registerCommand('leetcode.toggleSolved', async (item: any) => {
      const slug = typeof item === 'string' ? item : item?.data?.problem?.slug || item?.slug;
      if (slug) {
        const isSolved = await planManager.toggleSolved(slug);
        treeDataProvider.refresh();
        vscode.window.showInformationMessage(
          `${isSolved ? '✓ Marked solved' : 'Marked unsolved'}: ${slug}`
        );
      }
    }),

    vscode.commands.registerCommand('leetcode.signIn', async () => {
      await sessionManager.promptSignIn();
    }),

    vscode.commands.registerCommand('leetcode.signOut', async () => {
      await sessionManager.promptSignOut();
    })
  );
}

export function deactivate() {}

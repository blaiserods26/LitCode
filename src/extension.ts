import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LeetCodeClient } from './api/client';
import { LeetCodeProblemDetail, LeetCodeProblemSummary } from './api/types';
import { StudyPlanManager, validateStudyPlan } from './studyPlans/manager';
import { LeetCodeTreeDataProvider } from './views/treeDataProvider';
import { ProblemWebviewPanel } from './views/problemWebview';
import { LocalTestRunner, parseExpectedOutputsFromContent } from './runner/localRunner';
import { SessionManager } from './auth/sessionManager';
import { SocraticCoach } from './ai/coach';
import { getSolutionsDirectory } from './utils/paths';
import { InterviewTimer } from './timer/interviewTimer';
import { SrsManager } from './srs/spacedRepetition';

export const SUPPORTED_LANGUAGES = [
  { id: 'python3', label: 'Python 3', ext: '.py', snippetSlug: 'python3' },
  { id: 'javascript', label: 'JavaScript (Node.js)', ext: '.js', snippetSlug: 'javascript' },
  { id: 'typescript', label: 'TypeScript', ext: '.ts', snippetSlug: 'typescript' },
  { id: 'cpp', label: 'C++', ext: '.cpp', snippetSlug: 'cpp' },
  { id: 'java', label: 'Java', ext: '.java', snippetSlug: 'java' },
];

const langMap: Record<string, { ext: string; snippetSlug: string }> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.id, { ext: l.ext, snippetSlug: l.snippetSlug }])
);

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('leetcode');
  const endpoint = config.get<string>('endpoint', 'https://leetcode.com');

  const client = new LeetCodeClient({ baseUrl: endpoint });
  const planManager = new StudyPlanManager(context.globalState);

  // Setup custom study plans directory in global storage
  const customPlansDir = path.join(context.globalStorageUri.fsPath, 'study-plans');
  if (!fs.existsSync(customPlansDir)) {
    fs.mkdirSync(customPlansDir, { recursive: true });
  }

  // Load bundled and custom study plans
  planManager.loadBundledPlansFromDirectory(context.extensionPath);
  planManager.loadCustomPlansFromDirectory(customPlansDir);

  // Load cached problem list for instantaneous search
  const problemsCacheFile = path.join(context.globalStorageUri.fsPath, 'problems-all.json');
  try {
    if (fs.existsSync(problemsCacheFile)) {
      const raw = fs.readFileSync(problemsCacheFile, 'utf-8');
      const cached = JSON.parse(raw);
      if (Array.isArray(cached) && cached.length > 0) {
        client.preloadProblems(cached);
      }
    }
  } catch {
    // Ignore cache load error
  }

  // Pre-fetch problems in background so search is ready immediately
  client
    .fetchAllProblems()
    .then((problems) => {
      try {
        fs.writeFileSync(problemsCacheFile, JSON.stringify(problems), 'utf-8');
      } catch {}
    })
    .catch(() => {});

  const sessionManager = new SessionManager(context.secrets, endpoint);
  const localRunner = new LocalTestRunner();
  const coach = new SocraticCoach();
  const srsManager = new SrsManager(context.globalState);

  // Tree View
  const treeDataProvider = new LeetCodeTreeDataProvider(client, planManager, srsManager);
  vscode.window.registerTreeDataProvider('leetcode-companion.explorer', treeDataProvider);

  // Startup SRS check
  const dueOnStartup = srsManager.getDueSlugs();
  if (dueOnStartup.length > 0) {
    vscode.window
      .showInformationMessage(
        `📚 You have ${dueOnStartup.length} LeetCode problems due for Spaced Repetition review today!`,
        'Review Now'
      )
      .then((choice) => {
        if (choice === 'Review Now') {
          openProblemWorkspace(dueOnStartup[0]);
        }
      });
  }

  // Helper to open a problem workspace
  async function openProblemWorkspace(problemSlug: string) {
    const currentConfig = vscode.workspace.getConfiguration('leetcode');
    const hasChosenLanguage = context.globalState.get<boolean>('leetcode.hasChosenLanguage', false);
    let activeLang = currentConfig.get<string>('defaultLanguage', 'python3');

    // Prompt user for language on first open if not yet explicitly selected
    if (!hasChosenLanguage) {
      const items = SUPPORTED_LANGUAGES.map((l) => ({
        label: l.label,
        description: l.id,
        langId: l.id,
      }));

      const picked = await vscode.window.showQuickPick(items, {
        title: 'Select Preferred Programming Language',
        placeHolder: 'Choose your preferred language for LeetCode solutions (you can change this anytime from the sidebar)',
        ignoreFocusOut: true,
      });

      if (!picked) {
        return; // User cancelled
      }

      activeLang = picked.langId;
      await vscode.workspace
        .getConfiguration('leetcode')
        .update('defaultLanguage', activeLang, vscode.ConfigurationTarget.Global);
      await context.globalState.update('leetcode.hasChosenLanguage', true);
      treeDataProvider.refresh();
    }

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

          const langInfo = langMap[activeLang] || langMap['python3'];
          const snippetObj = detail.codeSnippets?.find((s) => s.langSlug === langInfo.snippetSlug);
          const initialCode = snippetObj?.code || `// Solution for ${detail.title}\n`;

          // Determine global system local solutions directory
          const configuredSolutionsDir = currentConfig.get<string>('solutionsDirectory', '');
          const solutionsBaseDir = getSolutionsDirectory(configuredSolutionsDir);

          const problemFolder = path.join(
            solutionsBaseDir,
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
              },
              async (action, payload) => {
                const userCode = doc.getText();
                if (action === 'hint') {
                  return coach.getHint(detail, userCode, payload?.level || 1);
                } else if (action === 'complexity') {
                  return coach.analyzeComplexity(detail, userCode);
                } else if (action === 'failure') {
                  return coach.explainFailure(
                    detail,
                    userCode,
                    payload?.failingInput || '',
                    payload?.actualOutput || '',
                    payload?.expectedOutput
                  );
                }
                return '';
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

    vscode.commands.registerCommand('leetcode.changeLanguage', async () => {
      const currentLang = vscode.workspace
        .getConfiguration('leetcode')
        .get<string>('defaultLanguage', 'python3');

      const items = SUPPORTED_LANGUAGES.map((l) => ({
        label: l.label,
        description: l.id === currentLang ? 'Current Preference' : l.id,
        langId: l.id,
      }));

      const picked = await vscode.window.showQuickPick(items, {
        title: 'Change Preferred Programming Language',
        placeHolder: 'Select your preferred language for LeetCode solutions',
      });

      if (picked) {
        await vscode.workspace
          .getConfiguration('leetcode')
          .update('defaultLanguage', picked.langId, vscode.ConfigurationTarget.Global);
        await context.globalState.update('leetcode.hasChosenLanguage', true);
        treeDataProvider.refresh();
        vscode.window.showInformationMessage(`Preferred programming language updated to ${picked.label}.`);
      }
    }),

    vscode.commands.registerCommand('leetcode.addStudyPlan', async () => {
      const choice = await vscode.window.showQuickPick(
        [
          {
            label: '$(cloud-download) Fetch from LeetCode (URL or Slug)',
            description: 'e.g. top-interview-150, leetcode-75',
            type: 'fetch' as const,
          },
          {
            label: '$(file-code) Import from JSON File',
            description: 'Import custom curriculum JSON file',
            type: 'file' as const,
          },
          {
            label: '$(notebook) View Sample JSON Format',
            description: 'Open a template showing the study plan JSON structure',
            type: 'template' as const,
          },
        ],
        {
          title: 'Add Study Plan',
          placeHolder: 'Choose how to add a study plan',
        }
      );

      if (!choice) return;

      if (choice.type === 'fetch') {
        const input = await vscode.window.showInputBox({
          title: 'Fetch Study Plan from LeetCode',
          prompt: 'Enter LeetCode study plan slug or URL:',
          placeHolder: 'e.g. top-interview-150 or https://leetcode.com/studyplan/top-interview-150/',
        });

        if (!input) return;

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Fetching study plan "${input}"...`,
            cancellable: false,
          },
          async () => {
            try {
              const plan = await client.fetchStudyPlan(input);
              if (!plan) {
                vscode.window.showErrorMessage(
                  `Could not find study plan for "${input}". Please verify the slug or URL.`
                );
                return;
              }

              await planManager.addCustomPlan(plan, customPlansDir);
              treeDataProvider.refresh();
              const totalProblems = plan.categories.reduce(
                (acc, c) => acc + c.problems.length,
                0
              );
              vscode.window.showInformationMessage(
                `Added study plan "${plan.title}" (${totalProblems} problems across ${plan.categories.length} categories)!`
              );
            } catch (err: any) {
              vscode.window.showErrorMessage(`Failed to fetch study plan: ${err.message}`);
            }
          }
        );
      } else if (choice.type === 'file') {
        const uris = await vscode.window.showOpenDialog({
          canSelectMany: false,
          filters: { 'JSON Files': ['json'] },
          title: 'Select Study Plan JSON File',
        });

        if (!uris || uris.length === 0) return;

        try {
          const content = fs.readFileSync(uris[0].fsPath, 'utf-8');
          const parsed = JSON.parse(content);
          const plan = validateStudyPlan(parsed);
          await planManager.addCustomPlan(plan, customPlansDir);
          treeDataProvider.refresh();
          const totalProblems = plan.categories.reduce(
            (acc, c) => acc + c.problems.length,
            0
          );
          vscode.window.showInformationMessage(
            `Successfully imported study plan "${plan.title}" with ${totalProblems} problems!`
          );
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to import study plan: ${err.message}`);
        }
      } else if (choice.type === 'template') {
        const sample = {
          id: 'my-custom-study-plan',
          title: 'My Custom Study Plan',
          description: 'A curated list of problems for specific practice',
          categories: [
            {
              name: 'Arrays & Hashing',
              problems: [
                {
                  frontendId: '1',
                  title: 'Two Sum',
                  slug: 'two-sum',
                  difficulty: 'Easy',
                },
                {
                  frontendId: '49',
                  title: 'Group Anagrams',
                  slug: 'group-anagrams',
                  difficulty: 'Medium',
                },
              ],
            },
          ],
        };

        const doc = await vscode.workspace.openTextDocument({
          language: 'json',
          content: JSON.stringify(sample, null, 2),
        });
        await vscode.window.showTextDocument(doc);
      }
    }),

    vscode.commands.registerCommand('leetcode.deleteStudyPlan', async (item: any) => {
      const planId = item?.data?.plan?.id || item?.id;
      if (!planId) return;

      const plan = planManager.getPlan(planId);
      if (!plan || !plan.isCustom) {
        vscode.window.showWarningMessage('Only custom study plans can be deleted.');
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete custom study plan "${plan.title}"?`,
        { modal: true },
        'Delete'
      );

      if (confirm === 'Delete') {
        await planManager.deleteCustomPlan(planId, customPlansDir);
        treeDataProvider.refresh();
        vscode.window.showInformationMessage(`Deleted custom study plan "${plan.title}".`);
      }
    }),

    vscode.commands.registerCommand('leetcode.openDailyChallenge', async () => {
      const daily = await client.fetchDailyChallenge();
      if (daily?.question?.titleSlug) {
        await openProblemWorkspace(daily.question.titleSlug);
      } else {
        vscode.window.showErrorMessage("Could not load today's daily challenge.");
      }
    }),

    vscode.commands.registerCommand('leetcode.openProblem', async (item: any) => {
      const slug = typeof item === 'string' ? item : item?.slug || item?.problem?.slug;
      if (slug) {
        await openProblemWorkspace(slug);
      }
    }),

    vscode.commands.registerCommand('leetcode.searchProblem', async () => {
      type ProblemQuickPickItem = vscode.QuickPickItem & { slug: string };

      const formatItem = (p: LeetCodeProblemSummary): ProblemQuickPickItem => {
        const diffBadge = p.difficulty === 'Easy' ? '🟢 Easy' : p.difficulty === 'Medium' ? '🟡 Medium' : '🔴 Hard';
        const premium = p.isPaidOnly ? ' 🔒 Premium' : '';
        const acStr = p.acRate ? `${p.acRate.toFixed(1)}% ac` : '';
        const tagsStr = p.topicTags && p.topicTags.length > 0 ? p.topicTags.map((t) => t.name).join(', ') : '';
        const details = [tagsStr, acStr, `slug: ${p.titleSlug}`].filter(Boolean).join(' • ');

        return {
          label: `#${p.frontendQuestionId}. ${p.title}`,
          description: `[${diffBadge}]${premium}`,
          detail: details,
          slug: p.titleSlug,
        };
      };

      const quickPick = vscode.window.createQuickPick<ProblemQuickPickItem>();
      quickPick.title = 'Search LeetCode Problems';
      quickPick.placeholder = 'Type problem number (#1), title, difficulty (easy/med/hard), or keyword...';
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;

      const refreshButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon('refresh'),
        tooltip: 'Refresh All Problems from LeetCode',
      };
      quickPick.buttons = [refreshButton];

      const cached = client.getCachedProblems();
      if (cached && cached.length > 0) {
        quickPick.items = cached.map(formatItem);
      } else {
        quickPick.busy = true;
        quickPick.placeholder = 'Loading all LeetCode problems...';
      }

      quickPick.show();

      // If problems not yet cached or empty, fetch now
      if (!cached || cached.length === 0) {
        client
          .fetchAllProblems()
          .then((problems) => {
            quickPick.items = problems.map(formatItem);
            quickPick.placeholder = 'Type problem number (#1), title, difficulty (easy/med/hard), or keyword...';
            quickPick.busy = false;

            try {
              fs.writeFileSync(problemsCacheFile, JSON.stringify(problems), 'utf-8');
            } catch {}
          })
          .catch((err) => {
            quickPick.busy = false;
            vscode.window.showErrorMessage(`Failed to load problems: ${err?.message || err}`);
          });
      }

      quickPick.onDidTriggerButton(async (button) => {
        if (button === refreshButton) {
          quickPick.busy = true;
          try {
            const problems = await client.fetchAllProblems(true);
            quickPick.items = problems.map(formatItem);
            try {
              fs.writeFileSync(problemsCacheFile, JSON.stringify(problems), 'utf-8');
            } catch {}
          } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to refresh problems: ${err?.message || err}`);
          } finally {
            quickPick.busy = false;
          }
        }
      });

      quickPick.onDidAccept(async () => {
        const selected = quickPick.selectedItems[0] || quickPick.activeItems[0];
        if (selected) {
          quickPick.hide();
          await openProblemWorkspace(selected.slug);
          return;
        }

        const rawInput = quickPick.value.trim();
        if (rawInput) {
          quickPick.hide();
          await openProblemWorkspace(rawInput.toLowerCase().replace(/\s+/g, '-'));
        }
      });

      quickPick.onDidHide(() => {
        quickPick.dispose();
      });
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

        if (isSolved) {
          const ratingChoice = await vscode.window.showQuickPick(
            [
              { label: 'Good (+3 Days)', rating: 'good', description: 'Solved with good confidence' },
              { label: 'Easy (+7 Days)', rating: 'easy', description: 'Solved effortlessly and quickly' },
              { label: 'Hard (+2 Days)', rating: 'hard', description: 'Solved but struggled or needed hints' },
              { label: 'Again (+1 Day)', rating: 'again', description: 'Need to repeat soon' },
            ],
            { placeHolder: 'Rate problem recall for Spaced Repetition review' }
          );

          if (ratingChoice) {
            await srsManager.recordReview(slug, ratingChoice.rating as any);
            treeDataProvider.refresh();
            vscode.window.showInformationMessage('📅 Scheduled next review in Spaced Repetition queue.');
          }
        } else {
          await srsManager.remove(slug);
          treeDataProvider.refresh();
        }
      }
    }),

    vscode.commands.registerCommand('leetcode.signIn', async () => {
      await sessionManager.promptSignIn();
    }),

    vscode.commands.registerCommand('leetcode.signOut', async () => {
      await sessionManager.promptSignOut();
    }),

    vscode.commands.registerCommand('leetcode.startInterviewTimer', async () => {
      const choice = await vscode.window.showQuickPick(
        [
          { label: '45 Minutes', description: 'Standard Technical Screen', minutes: 45 },
          { label: '30 Minutes', description: 'Fast Coding Assessment', minutes: 30 },
          { label: '60 Minutes', description: 'Deep System / Algorithm Round', minutes: 60 },
          { label: '20 Minutes', description: 'Sprint / Easy Problem', minutes: 20 },
          { label: 'Custom...', description: 'Enter specific number of minutes', minutes: -1 },
        ],
        { placeHolder: 'Select Interview Timer Duration' }
      );

      if (!choice) return;

      let minutes = choice.minutes;
      if (minutes === -1) {
        const input = await vscode.window.showInputBox({
          title: 'Custom Timer Duration',
          prompt: 'Enter duration in minutes:',
          value: '45',
          validateInput: (v) => (isNaN(Number(v)) || Number(v) <= 0 ? 'Enter a positive number' : null),
        });
        if (!input) return;
        minutes = Number(input);
      }

      interviewTimer.start(minutes);
      vscode.window.showInformationMessage(`⏱️ Mock Interview Timer started: ${minutes} minutes.`);
    }),

    vscode.commands.registerCommand('leetcode.toggleInterviewTimer', async () => {
      const state = interviewTimer.getState();
      if (state === 'idle') {
        await vscode.commands.executeCommand('leetcode.startInterviewTimer');
      } else if (state === 'running') {
        interviewTimer.pause();
        vscode.window.showInformationMessage('⏸️ Interview Timer paused.');
      } else if (state === 'paused') {
        interviewTimer.resume();
        vscode.window.showInformationMessage('▶️ Interview Timer resumed.');
      } else if (state === 'expired') {
        const action = await vscode.window.showInformationMessage(
          '⏰ Timer has expired. Reset?',
          'Reset to 45m',
          'Dismiss'
        );
        if (action === 'Reset to 45m') {
          interviewTimer.reset();
        }
      }
    }),

    vscode.commands.registerCommand('leetcode.resetInterviewTimer', () => {
      interviewTimer.reset();
      vscode.window.showInformationMessage('🔄 Interview Timer reset.');
    }),

    vscode.commands.registerCommand('leetcode.toggleStrictMode', async () => {
      strictModeActive = !strictModeActive;
      if (strictModeActive) {
        vscode.window.showWarningMessage(
          '🔒 Strict Mock Mode ENABLED: Simulate real interview conditions (no external assistance or auto-hints).'
        );
      } else {
        vscode.window.showInformationMessage('🔓 Strict Mock Mode DISABLED.');
      }
    })
  );

  // Status bar interview timer
  const statusBarTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarTimer.command = 'leetcode.toggleInterviewTimer';
  statusBarTimer.tooltip = 'LeetCode Interview Timer: Click to start/pause/resume';
  statusBarTimer.text = '$(watch) 45:00';
  statusBarTimer.show();
  context.subscriptions.push(statusBarTimer);

  let strictModeActive = false;

  const interviewTimer = new InterviewTimer(45, {
    onTick: (rem, formatted) => {
      const state = interviewTimer.getState();
      if (state === 'running') {
        const icon = rem <= 300 ? '$(alert)' : '$(watch)';
        statusBarTimer.text = `${icon} ${formatted}`;
        if (rem <= 300) {
          statusBarTimer.color = new vscode.ThemeColor('errorForeground');
        } else {
          statusBarTimer.color = undefined;
        }
      } else if (state === 'paused') {
        statusBarTimer.text = `$(debug-pause) ${formatted}`;
        statusBarTimer.color = new vscode.ThemeColor('editorWarning.foreground');
      } else if (state === 'expired') {
        statusBarTimer.text = `$(error) 00:00 Expired!`;
        statusBarTimer.color = new vscode.ThemeColor('errorForeground');
      } else {
        statusBarTimer.text = `$(watch) ${formatted}`;
        statusBarTimer.color = undefined;
      }
    },
    onWarning: () => {
      vscode.window.showWarningMessage('⚠️ 5 minutes remaining in your mock interview timer!');
    },
    onExpire: () => {
      vscode.window.showErrorMessage('⏰ Mock Interview Time Expired! Submit your solution now.');
    },
  });
  context.subscriptions.push({ dispose: () => interviewTimer.dispose() });
}

export function deactivate() {}

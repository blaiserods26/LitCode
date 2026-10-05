import * as vscode from 'vscode';
import { LeetCodeClient } from '../api/client';
import { DailyChallenge, LeetCodeDifficulty } from '../api/types';
import { StudyPlanManager } from '../studyPlans/manager';
import { StudyPlan, StudyPlanCategory, StudyPlanProblem } from '../studyPlans/types';

export type TreeItemType =
  | 'daily-root'
  | 'daily-item'
  | 'plans-root'
  | 'plan-item'
  | 'category-item'
  | 'bookmarks-root'
  | 'problem-item';

export class LeetCodeTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemType,
    public readonly data?: {
      problem?: { slug: string; title: string; difficulty: LeetCodeDifficulty; frontendId?: string };
      plan?: StudyPlan;
      category?: StudyPlanCategory;
      daily?: DailyChallenge;
    }
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType === 'problem-item' ? 'problemItem' : itemType;
    this.setupVisuals();
  }

  private setupVisuals(): void {
    if (this.itemType === 'daily-root') {
      this.iconPath = new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.orange'));
    } else if (this.itemType === 'plans-root') {
      this.iconPath = new vscode.ThemeIcon('book', new vscode.ThemeColor('charts.blue'));
    } else if (this.itemType === 'bookmarks-root') {
      this.iconPath = new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.yellow'));
    } else if (this.itemType === 'plan-item') {
      this.iconPath = new vscode.ThemeIcon('repo');
    } else if (this.itemType === 'category-item') {
      this.iconPath = new vscode.ThemeIcon('folder');
    } else if (this.itemType === 'problem-item') {
      const diff = this.data?.problem?.difficulty;
      if (diff === 'Easy') {
        this.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('charts.green'));
      } else if (diff === 'Medium') {
        this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
      } else {
        this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
      }

      if (this.data?.problem) {
        this.command = {
          command: 'leetcode.openProblem',
          title: 'Open Problem',
          arguments: [this.data.problem],
        };
      }
    }
  }
}

export class LeetCodeTreeDataProvider implements vscode.TreeDataProvider<LeetCodeTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<LeetCodeTreeItem | undefined | null | void> =
    new vscode.EventEmitter<LeetCodeTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<LeetCodeTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private cachedDaily: DailyChallenge | null = null;

  constructor(
    private client: LeetCodeClient,
    private planManager: StudyPlanManager
  ) {}

  refresh(): void {
    this.cachedDaily = null;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: LeetCodeTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: LeetCodeTreeItem): Promise<LeetCodeTreeItem[]> {
    if (!element) {
      // Root level: Daily Challenge, Study Plans, Bookmarks
      return [
        new LeetCodeTreeItem('Daily Challenge', vscode.TreeItemCollapsibleState.Expanded, 'daily-root'),
        new LeetCodeTreeItem('Study Plans', vscode.TreeItemCollapsibleState.Expanded, 'plans-root'),
        new LeetCodeTreeItem('Bookmarked Problems', vscode.TreeItemCollapsibleState.Collapsed, 'bookmarks-root'),
      ];
    }

    if (element.itemType === 'daily-root') {
      try {
        if (!this.cachedDaily) {
          this.cachedDaily = await this.client.fetchDailyChallenge();
        }
        if (!this.cachedDaily) {
          return [new LeetCodeTreeItem('Unable to load Daily Challenge', vscode.TreeItemCollapsibleState.None, 'daily-item')];
        }

        const q = this.cachedDaily.question;
        const isSolved = this.planManager.isSolved(q.titleSlug);
        const prefix = isSolved ? '✓ ' : '';
        const label = `${prefix}[${this.cachedDaily.date}] #${q.questionFrontendId} ${q.title} (${q.difficulty})`;

        const item = new LeetCodeTreeItem(
          label,
          vscode.TreeItemCollapsibleState.None,
          'problem-item',
          {
            problem: {
              slug: q.titleSlug,
              title: q.title,
              difficulty: q.difficulty,
              frontendId: q.questionFrontendId,
            },
          }
        );
        return [item];
      } catch (err: any) {
        return [new LeetCodeTreeItem(`Error loading daily: ${err.message}`, vscode.TreeItemCollapsibleState.None, 'daily-item')];
      }
    }

    if (element.itemType === 'plans-root') {
      const plans = this.planManager.getAllPlans();
      return plans.map((plan) => {
        const progress = this.planManager.getStudyPlanProgress(plan.id);
        const label = `${plan.title} [${progress.solved}/${progress.total} • ${progress.percentage}%]`;
        return new LeetCodeTreeItem(
          label,
          vscode.TreeItemCollapsibleState.Collapsed,
          'plan-item',
          { plan }
        );
      });
    }

    if (element.itemType === 'plan-item' && element.data?.plan) {
      const plan = element.data.plan;
      return plan.categories.map((category) => {
        let catSolved = 0;
        for (const p of category.problems) {
          if (this.planManager.isSolved(p.slug)) {
            catSolved++;
          }
        }
        const label = `${category.name} (${catSolved}/${category.problems.length})`;
        return new LeetCodeTreeItem(
          label,
          vscode.TreeItemCollapsibleState.Collapsed,
          'category-item',
          { plan, category }
        );
      });
    }

    if (element.itemType === 'category-item' && element.data?.category) {
      return element.data.category.problems.map((p) => {
        const solved = this.planManager.isSolved(p.slug);
        const bookmarked = this.planManager.isBookmarked(p.slug);
        const prefix = solved ? '✓ ' : '';
        const star = bookmarked ? ' ⭐' : '';
        const label = `${prefix}#${p.frontendId} ${p.title} (${p.difficulty})${star}`;

        return new LeetCodeTreeItem(
          label,
          vscode.TreeItemCollapsibleState.None,
          'problem-item',
          { problem: p }
        );
      });
    }

    if (element.itemType === 'bookmarks-root') {
      const slugs = this.planManager.getBookmarkedSlugs();
      if (slugs.length === 0) {
        return [new LeetCodeTreeItem('No bookmarks yet (Star any problem)', vscode.TreeItemCollapsibleState.None, 'problem-item')];
      }

      return slugs.map((slug) => {
        const solved = this.planManager.isSolved(slug);
        const prefix = solved ? '✓ ' : '';
        // Humanize slug for title display
        const displayTitle = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const label = `${prefix}⭐ ${displayTitle}`;

        return new LeetCodeTreeItem(
          label,
          vscode.TreeItemCollapsibleState.None,
          'problem-item',
          {
            problem: {
              slug,
              title: displayTitle,
              difficulty: 'Medium',
            },
          }
        );
      });
    }

    return [];
  }
}

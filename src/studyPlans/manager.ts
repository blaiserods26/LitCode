import * as fs from 'fs';
import * as path from 'path';
import { StudyPlan, StudyPlanProgress } from './types';

export interface StorageMemento {
  get<T>(key: string, defaultValue?: T): T;
  update(key: string, value: any): Thenable<void> | Promise<void>;
}

const STORAGE_KEYS = {
  BOOKMARKS: 'leetcode.bookmarks',
  SOLVED: 'leetcode.solved',
};

export class StudyPlanManager {
  private memento: StorageMemento;
  private plans: Map<string, StudyPlan> = new Map();
  private bookmarkedSlugs: Set<string>;
  private solvedSlugs: Set<string>;

  constructor(memento: StorageMemento, initialPlans?: StudyPlan[]) {
    this.memento = memento;
    this.bookmarkedSlugs = new Set(this.memento.get<string[]>(STORAGE_KEYS.BOOKMARKS, []));
    this.solvedSlugs = new Set(this.memento.get<string[]>(STORAGE_KEYS.SOLVED, []));

    if (initialPlans) {
      for (const plan of initialPlans) {
        this.plans.set(plan.id, plan);
      }
    }
  }

  loadBundledPlansFromDirectory(resourceDir: string): void {
    const plansDir = path.join(resourceDir, 'study-plans');
    if (!fs.existsSync(plansDir)) {
      return;
    }

    try {
      const files = fs.readdirSync(plansDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(plansDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const plan = JSON.parse(raw) as StudyPlan;
          if (plan.id && plan.categories) {
            this.plans.set(plan.id, plan);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load study plans from directory:', err);
    }
  }

  getAllPlans(): StudyPlan[] {
    return Array.from(this.plans.values());
  }

  getPlan(id: string): StudyPlan | undefined {
    return this.plans.get(id);
  }

  isBookmarked(slug: string): boolean {
    return this.bookmarkedSlugs.has(slug);
  }

  async toggleBookmark(slug: string): Promise<boolean> {
    const nextState = !this.isBookmarked(slug);
    if (nextState) {
      this.bookmarkedSlugs.add(slug);
    } else {
      this.bookmarkedSlugs.delete(slug);
    }
    await this.memento.update(STORAGE_KEYS.BOOKMARKS, Array.from(this.bookmarkedSlugs));
    return nextState;
  }

  getBookmarkedSlugs(): string[] {
    return Array.from(this.bookmarkedSlugs);
  }

  isSolved(slug: string): boolean {
    return this.solvedSlugs.has(slug);
  }

  async toggleSolved(slug: string): Promise<boolean> {
    const nextState = !this.isSolved(slug);
    if (nextState) {
      this.solvedSlugs.add(slug);
    } else {
      this.solvedSlugs.delete(slug);
    }
    await this.memento.update(STORAGE_KEYS.SOLVED, Array.from(this.solvedSlugs));
    return nextState;
  }

  getSolvedSlugs(): string[] {
    return Array.from(this.solvedSlugs);
  }

  getStudyPlanProgress(planId: string): StudyPlanProgress {
    const plan = this.plans.get(planId);
    if (!plan) {
      return { total: 0, solved: 0, percentage: 0 };
    }

    let total = 0;
    let solved = 0;
    for (const cat of plan.categories) {
      for (const p of cat.problems) {
        total++;
        if (this.isSolved(p.slug)) {
          solved++;
        }
      }
    }

    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, percentage };
  }
}

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

export function validateStudyPlan(raw: any): StudyPlan {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Study plan must be a valid JSON object.');
  }
  if (!raw.id || typeof raw.id !== 'string') {
    throw new Error('Study plan missing valid "id" string.');
  }
  if (!raw.title || typeof raw.title !== 'string') {
    throw new Error('Study plan missing valid "title" string.');
  }
  if (!Array.isArray(raw.categories) || raw.categories.length === 0) {
    throw new Error('Study plan must have a non-empty "categories" array.');
  }
  for (const cat of raw.categories) {
    if (!cat.name || typeof cat.name !== 'string') {
      throw new Error('Every category must have a "name" string.');
    }
    if (!Array.isArray(cat.problems)) {
      throw new Error(`Category "${cat.name}" must have a "problems" array.`);
    }
    for (const p of cat.problems) {
      if (!p.title || !p.slug) {
        throw new Error(`Problem in "${cat.name}" must have "title" and "slug".`);
      }
      p.frontendId = String(p.frontendId || '');
      const d = String(p.difficulty || 'Medium').toLowerCase();
      if (d === 'easy') p.difficulty = 'Easy';
      else if (d === 'hard') p.difficulty = 'Hard';
      else p.difficulty = 'Medium';
    }
  }
  return {
    id: raw.id.trim(),
    title: raw.title.trim(),
    description: typeof raw.description === 'string' ? raw.description : raw.title,
    categories: raw.categories,
    isCustom: true,
  };
}

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
            plan.isCustom = false;
            this.plans.set(plan.id, plan);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load study plans from directory:', err);
    }
  }

  loadCustomPlansFromDirectory(customDir: string): void {
    if (!fs.existsSync(customDir)) {
      return;
    }

    try {
      const files = fs.readdirSync(customDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(customDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          const plan = validateStudyPlan(parsed);
          plan.isCustom = true;
          this.plans.set(plan.id, plan);
        }
      }
    } catch (err) {
      console.error('Failed to load custom study plans from directory:', err);
    }
  }

  async addCustomPlan(plan: StudyPlan, storageDir?: string): Promise<void> {
    const validated = validateStudyPlan(plan);
    validated.isCustom = true;
    this.plans.set(validated.id, validated);

    if (storageDir) {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      const targetFile = path.join(storageDir, `${validated.id}.json`);
      fs.writeFileSync(targetFile, JSON.stringify(validated, null, 2), 'utf-8');
    }
  }

  async deleteCustomPlan(planId: string, storageDir?: string): Promise<boolean> {
    const existing = this.plans.get(planId);
    if (!existing || !existing.isCustom) {
      return false;
    }

    this.plans.delete(planId);

    if (storageDir) {
      const targetFile = path.join(storageDir, `${planId}.json`);
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
    }
    return true;
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

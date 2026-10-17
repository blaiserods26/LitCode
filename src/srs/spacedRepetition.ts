export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsItem {
  slug: string;
  stage: number;
  lastReviewedMs: number;
  nextDueMs: number;
  reviewCount: number;
}

export interface StorageMemento {
  get<T>(key: string, defaultValue?: T): T;
  update(key: string, value: any): Thenable<void> | Promise<void>;
}

const STORAGE_KEY = 'leetcode.srs.items';
const DAY_MS = 24 * 60 * 60 * 1000;

export class SrsManager {
  private items: Map<string, SrsItem> = new Map();

  constructor(private memento: StorageMemento) {
    const raw = this.memento.get<Record<string, SrsItem>>(STORAGE_KEY, {});
    for (const [k, v] of Object.entries(raw)) {
      this.items.set(k, v);
    }
  }

  getItem(slug: string): SrsItem | undefined {
    return this.items.get(slug);
  }

  getAllItems(): Record<string, SrsItem> {
    const res: Record<string, SrsItem> = {};
    for (const [k, v] of this.items.entries()) {
      res[k] = v;
    }
    return res;
  }

  isDue(slug: string, currentTimeMs: number = Date.now()): boolean {
    const item = this.items.get(slug);
    if (!item) return false;
    return item.nextDueMs <= currentTimeMs;
  }

  getDueSlugs(currentTimeMs: number = Date.now()): string[] {
    const due: string[] = [];
    for (const item of this.items.values()) {
      if (item.nextDueMs <= currentTimeMs) {
        due.push(item.slug);
      }
    }
    return due;
  }

  async recordReview(
    slug: string,
    rating: ReviewRating,
    currentTimeMs: number = Date.now()
  ): Promise<SrsItem> {
    const existing = this.items.get(slug) || {
      slug,
      stage: 0,
      lastReviewedMs: currentTimeMs,
      nextDueMs: currentTimeMs,
      reviewCount: 0,
    };

    let newStage = existing.stage;
    let daysUntilNext = 1;

    switch (rating) {
      case 'again':
        newStage = 0;
        daysUntilNext = 1;
        break;
      case 'hard':
        newStage = Math.max(1, existing.stage);
        daysUntilNext = Math.max(2, newStage * 2);
        break;
      case 'good':
        newStage = existing.stage + 1;
        if (newStage === 1) daysUntilNext = 3;
        else if (newStage === 2) daysUntilNext = 7;
        else if (newStage === 3) daysUntilNext = 21;
        else daysUntilNext = newStage * 30;
        break;
      case 'easy':
        newStage = existing.stage + 2;
        if (newStage <= 2) daysUntilNext = 7;
        else if (newStage <= 4) daysUntilNext = 30;
        else daysUntilNext = newStage * 45;
        break;
    }

    const updated: SrsItem = {
      slug,
      stage: newStage,
      lastReviewedMs: currentTimeMs,
      nextDueMs: currentTimeMs + daysUntilNext * DAY_MS,
      reviewCount: existing.reviewCount + 1,
    };

    this.items.set(slug, updated);
    await this.save();
    return updated;
  }

  async remove(slug: string): Promise<void> {
    this.items.delete(slug);
    await this.save();
  }

  private async save(): Promise<void> {
    const obj: Record<string, SrsItem> = {};
    for (const [k, v] of this.items.entries()) {
      obj[k] = v;
    }
    await this.memento.update(STORAGE_KEY, obj);
  }
}

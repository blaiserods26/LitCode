import { describe, it, expect, beforeEach } from 'vitest';
import { SrsManager } from './spacedRepetition';

describe('SrsManager (Spaced Repetition)', () => {
  let mockState: Record<string, any>;
  let mockMemento: any;

  beforeEach(() => {
    mockState = {};
    mockMemento = {
      get: (key: string, defaultValue?: any) => (key in mockState ? mockState[key] : defaultValue),
      update: async (key: string, value: any) => {
        mockState[key] = value;
      },
    };
  });

  it('schedules initial review for newly solved problem', async () => {
    const srs = new SrsManager(mockMemento);
    const now = 1000000;

    const item = await srs.recordReview('two-sum', 'good', now);
    expect(item.slug).toBe('two-sum');
    expect(item.stage).toBe(1);
    expect(item.reviewCount).toBe(1);
    // Stage 1 'good' -> 3 days = 3 * 24 * 3600 * 1000 ms
    expect(item.nextDueMs).toBe(now + 3 * 24 * 3600 * 1000);
  });

  it('identifies due items accurately', async () => {
    const srs = new SrsManager(mockMemento);
    const now = 1000000;

    await srs.recordReview('two-sum', 'good', now);

    // 2 days later -> not due yet
    expect(srs.isDue('two-sum', now + 2 * 24 * 3600 * 1000)).toBe(false);
    expect(srs.getDueSlugs(now + 2 * 24 * 3600 * 1000)).toEqual([]);

    // 3 days later -> due!
    expect(srs.isDue('two-sum', now + 3 * 24 * 3600 * 1000)).toBe(true);
    expect(srs.getDueSlugs(now + 3 * 24 * 3600 * 1000)).toEqual(['two-sum']);
  });

  it('resets stage when rated "again"', async () => {
    const srs = new SrsManager(mockMemento);
    const now = 1000000;

    await srs.recordReview('two-sum', 'good', now);
    const item = await srs.recordReview('two-sum', 'again', now + 3 * 24 * 3600 * 1000);

    expect(item.stage).toBe(0);
    // 'again' -> due in 1 day
    expect(item.nextDueMs).toBe(now + 3 * 24 * 3600 * 1000 + 1 * 24 * 3600 * 1000);
  });
});

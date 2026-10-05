import { describe, it, expect, beforeEach } from 'vitest';
import { StudyPlanManager } from './manager';
import { StudyPlan } from './types';

describe('StudyPlanManager', () => {
  let mockState: Record<string, any>;
  let mockMemento: any;

  const samplePlan: StudyPlan = {
    id: 'sample-plan',
    title: 'Sample Plan',
    description: 'Test Plan',
    categories: [
      {
        name: 'Basics',
        problems: [
          { title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', frontendId: '1' },
          { title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium', frontendId: '2' },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockState = {};
    mockMemento = {
      get: (key: string, defaultValue?: any) => (key in mockState ? mockState[key] : defaultValue),
      update: async (key: string, value: any) => {
        mockState[key] = value;
      },
    };
  });

  it('manages bookmarks correctly', async () => {
    const manager = new StudyPlanManager(mockMemento, [samplePlan]);

    expect(manager.isBookmarked('two-sum')).toBe(false);
    expect(await manager.toggleBookmark('two-sum')).toBe(true);
    expect(manager.isBookmarked('two-sum')).toBe(true);
    expect(manager.getBookmarkedSlugs()).toEqual(['two-sum']);

    expect(await manager.toggleBookmark('two-sum')).toBe(false);
    expect(manager.isBookmarked('two-sum')).toBe(false);
  });

  it('manages solved state and computes progress accurately', async () => {
    const manager = new StudyPlanManager(mockMemento, [samplePlan]);

    let progress = manager.getStudyPlanProgress('sample-plan');
    expect(progress).toEqual({ total: 2, solved: 0, percentage: 0 });

    await manager.toggleSolved('two-sum');
    expect(manager.isSolved('two-sum')).toBe(true);

    progress = manager.getStudyPlanProgress('sample-plan');
    expect(progress).toEqual({ total: 2, solved: 1, percentage: 50 });

    await manager.toggleSolved('add-two-numbers');
    progress = manager.getStudyPlanProgress('sample-plan');
    expect(progress).toEqual({ total: 2, solved: 2, percentage: 100 });
  });
});

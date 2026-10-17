import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { StudyPlanManager, validateStudyPlan } from './manager';
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

  it('validates study plan schema correctly', () => {
    expect(() => validateStudyPlan(null)).toThrow('Study plan must be a valid JSON object.');
    expect(() => validateStudyPlan({})).toThrow('Study plan missing valid "id" string.');
    expect(() => validateStudyPlan({ id: 'test' })).toThrow('Study plan missing valid "title" string.');
    expect(() => validateStudyPlan({ id: 'test', title: 'Test', categories: [] })).toThrow(
      'Study plan must have a non-empty "categories" array.'
    );

    const validRaw = {
      id: 'custom-1',
      title: 'Custom 1',
      categories: [
        {
          name: 'Cat 1',
          problems: [{ title: 'P1', slug: 'p1', frontendId: 1, difficulty: 'easy' }],
        },
      ],
    };

    const validated = validateStudyPlan(validRaw);
    expect(validated.id).toBe('custom-1');
    expect(validated.isCustom).toBe(true);
    expect(validated.categories[0].problems[0].difficulty).toBe('Easy');
  });

  it('adds, loads, and deletes custom study plans to disk and memory', async () => {
    const tempDir = path.join(os.tmpdir(), `test-study-plans-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const manager = new StudyPlanManager(mockMemento, [samplePlan]);

      const custom: StudyPlan = {
        id: 'new-plan',
        title: 'New Custom Plan',
        description: 'Custom',
        categories: [
          {
            name: 'Cat A',
            problems: [{ title: 'Problem A', slug: 'problem-a', frontendId: '10', difficulty: 'Hard' }],
          },
        ],
      };

      await manager.addCustomPlan(custom, tempDir);
      expect(manager.getPlan('new-plan')).toBeDefined();
      expect(manager.getPlan('new-plan')?.isCustom).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'new-plan.json'))).toBe(true);

      // Create a fresh manager and load from directory
      const manager2 = new StudyPlanManager(mockMemento);
      manager2.loadCustomPlansFromDirectory(tempDir);
      expect(manager2.getPlan('new-plan')).toBeDefined();

      // Delete custom plan
      const deleted = await manager2.deleteCustomPlan('new-plan', tempDir);
      expect(deleted).toBe(true);
      expect(manager2.getPlan('new-plan')).toBeUndefined();
      expect(fs.existsSync(path.join(tempDir, 'new-plan.json'))).toBe(false);
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });
});

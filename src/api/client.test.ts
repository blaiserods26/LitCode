import { describe, it, expect, vi } from 'vitest';
import { LeetCodeClient, extractStudyPlanSlug } from './client';

describe('LeetCodeClient', () => {
  it('fetches daily challenge correctly', async () => {
    const mockDaily = {
      data: {
        activeDailyCodingChallengeQuestion: {
          date: '2026-10-05',
          link: '/problems/two-sum/',
          question: {
            questionId: '1',
            questionFrontendId: '1',
            title: 'Two Sum',
            titleSlug: 'two-sum',
            content: '<p>Given an array...</p>',
            difficulty: 'Easy',
            isPaidOnly: false,
            exampleTestcaseList: ['[2,7,11,15]\n9'],
            sampleTestCase: '[2,7,11,15]\n9',
            topicTags: [{ name: 'Array', slug: 'array' }],
            codeSnippets: [{ lang: 'Python3', langSlug: 'python3', code: 'class Solution:' }],
            hints: ['Try using a hash table.'],
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDaily,
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    const daily = await client.fetchDailyChallenge();

    expect(daily).toBeDefined();
    expect(daily?.question.title).toBe('Two Sum');
    expect(daily?.question.difficulty).toBe('Easy');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fetches problem detail and caches the response', async () => {
    const mockProblem = {
      data: {
        question: {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          content: '<p>Given an array...</p>',
          difficulty: 'Easy',
          isPaidOnly: false,
          exampleTestcaseList: ['[2,7,11,15]\n9'],
          sampleTestCase: '[2,7,11,15]\n9',
          topicTags: [{ name: 'Array', slug: 'array' }],
          codeSnippets: [{ lang: 'Python3', langSlug: 'python3', code: 'class Solution:' }],
          hints: [],
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProblem,
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    const first = await client.fetchProblemDetail('two-sum');
    expect(first?.titleSlug).toBe('two-sum');

    // Second call should hit in-memory cache
    const second = await client.fetchProblemDetail('two-sum');
    expect(second?.titleSlug).toBe('two-sum');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('extracts study plan slug from various inputs', () => {
    expect(extractStudyPlanSlug('top-interview-150')).toBe('top-interview-150');
    expect(extractStudyPlanSlug('https://leetcode.com/studyplan/top-interview-150/')).toBe('top-interview-150');
    expect(extractStudyPlanSlug('https://leetcode.cn/studyplan/leetcode-75')).toBe('leetcode-75');
    expect(extractStudyPlanSlug(' studyplan/programming-skills ')).toBe('programming-skills');
  });

  it('fetches study plan details via studyPlanV2Detail', async () => {
    const mockStudyPlan = {
      data: {
        studyPlanV2Detail: {
          slug: 'top-interview-150',
          name: 'Top Interview 150',
          highlight: 'Must-do list',
          planSubGroups: [
            {
              slug: 'sub-1',
              name: 'Array',
              questions: [
                {
                  questionFrontendId: '88',
                  title: 'Merge Sorted Array',
                  titleSlug: 'merge-sorted-array',
                  difficulty: 'EASY',
                },
              ],
            },
          ],
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStudyPlan,
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    const plan = await client.fetchStudyPlan('https://leetcode.com/studyplan/top-interview-150/');

    expect(plan).toBeDefined();
    expect(plan?.id).toBe('top-interview-150');
    expect(plan?.title).toBe('Top Interview 150');
    expect(plan?.categories).toHaveLength(1);
    expect(plan?.categories[0].problems[0].difficulty).toBe('Easy');
    expect(plan?.categories[0].problems[0].slug).toBe('merge-sorted-array');
  });

  it('handles error response gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    await expect(client.fetchProblemDetail('invalid-slug')).rejects.toThrow('LeetCode API error');
  });

  it('fetches and normalizes all problems via /api/problems/all/', async () => {
    const mockData = {
      num_total: 2,
      stat_status_pairs: [
        {
          stat: {
            frontend_question_id: 15,
            question__title: '3Sum',
            question__title_slug: '3sum',
            question__hide: false,
            total_acs: 1000,
            total_submitted: 2000,
          },
          difficulty: { level: 2 },
          paid_only: false,
        },
        {
          stat: {
            frontend_question_id: 1,
            question__title: 'Two Sum',
            question__title_slug: 'two-sum',
            question__hide: false,
            total_acs: 5000,
            total_submitted: 10000,
          },
          difficulty: { level: 1 },
          paid_only: false,
        },
        {
          stat: {
            frontend_question_id: 9999,
            question__title: 'Hidden',
            question__title_slug: 'hidden',
            question__hide: true,
          },
          difficulty: { level: 3 },
          paid_only: true,
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    const problems = await client.fetchAllProblems();

    expect(problems).toHaveLength(2);
    // Verified numerical sorting: #1 before #15
    expect(problems[0].frontendQuestionId).toBe('1');
    expect(problems[0].title).toBe('Two Sum');
    expect(problems[0].difficulty).toBe('Easy');
    expect(problems[0].acRate).toBeCloseTo(50.0);

    expect(problems[1].frontendQuestionId).toBe('15');
    expect(problems[1].title).toBe('3Sum');
    expect(problems[1].difficulty).toBe('Medium');

    // Second call should return cached data without additional fetch
    const cached = await client.fetchAllProblems();
    expect(cached).toBe(problems);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('supports preloadProblems and getCachedProblems', () => {
    const client = new LeetCodeClient();
    expect(client.getCachedProblems()).toBeNull();

    const sample = [
      {
        frontendQuestionId: '1',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        difficulty: 'Easy' as const,
        isPaidOnly: false,
      },
    ];

    client.preloadProblems(sample);
    expect(client.getCachedProblems()).toEqual(sample);
  });

  it('falls back to searchProblems if /api/problems/all/ fails', async () => {
    const mockGraphqlData = {
      data: {
        problemsetQuestionList: {
          total: 1,
          questions: [
            {
              frontendQuestionId: '1',
              title: 'Two Sum',
              titleSlug: 'two-sum',
              difficulty: 'Easy',
              isPaidOnly: false,
            },
          ],
        },
      },
    };

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/api/problems/all/')) {
        return { ok: false, status: 500, statusText: 'Server Error' };
      }
      return { ok: true, json: async () => mockGraphqlData };
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    const problems = await client.fetchAllProblems();

    expect(problems).toHaveLength(1);
    expect(problems[0].titleSlug).toBe('two-sum');
  });
});

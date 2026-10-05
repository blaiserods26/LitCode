import { describe, it, expect, vi } from 'vitest';
import { LeetCodeClient } from './client';

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

  it('handles error response gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const client = new LeetCodeClient({ fetchFn: mockFetch as any });
    await expect(client.fetchProblemDetail('invalid-slug')).rejects.toThrow('LeetCode API error');
  });
});

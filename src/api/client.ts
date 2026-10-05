import {
  DailyChallenge,
  LeetCodeProblemDetail,
  LeetCodeProblemSummary,
} from './types';

export interface LeetCodeClientOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class LeetCodeClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private problemCache = new Map<string, LeetCodeProblemDetail>();
  private dailyCache: { data: DailyChallenge; timestamp: number } | null = null;
  private readonly DAILY_TTL_MS = 1000 * 60 * 30; // 30 minutes

  constructor(options?: LeetCodeClientOptions) {
    this.baseUrl = (options?.baseUrl || 'https://leetcode.com').replace(/\/+$/, '');
    this.fetchFn = options?.fetchFn || globalThis.fetch.bind(globalThis);
  }

  private async executeQuery<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}/graphql`;
    const res = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: `${this.baseUrl}/problemset/all/`,
        Origin: this.baseUrl,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`LeetCode API error: HTTP ${res.status} ${res.statusText}`);
    }

    const payload = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
    if (payload.errors && payload.errors.length > 0) {
      throw new Error(`LeetCode GraphQL error: ${payload.errors.map((e) => e.message).join(', ')}`);
    }

    if (!payload.data) {
      throw new Error('LeetCode GraphQL returned empty data payload.');
    }

    return payload.data;
  }

  async fetchDailyChallenge(): Promise<DailyChallenge | null> {
    const now = Date.now();
    if (this.dailyCache && now - this.dailyCache.timestamp < this.DAILY_TTL_MS) {
      return this.dailyCache.data;
    }

    const query = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            isPaidOnly
            exampleTestcaseList
            sampleTestCase
            topicTags {
              name
              slug
            }
            codeSnippets {
              lang
              langSlug
              code
            }
            hints
          }
        }
      }
    `;

    const data = await this.executeQuery<{
      activeDailyCodingChallengeQuestion: DailyChallenge;
    }>(query);

    const result = data.activeDailyCodingChallengeQuestion;
    if (result && result.question) {
      this.dailyCache = { data: result, timestamp: now };
      this.problemCache.set(result.question.titleSlug, result.question);
    }

    return result || null;
  }

  async fetchProblemDetail(titleSlug: string): Promise<LeetCodeProblemDetail | null> {
    const slug = titleSlug.trim().toLowerCase();
    if (this.problemCache.has(slug)) {
      return this.problemCache.get(slug)!;
    }

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          content
          difficulty
          isPaidOnly
          exampleTestcaseList
          sampleTestCase
          topicTags {
            name
            slug
          }
          codeSnippets {
            lang
            langSlug
            code
          }
          hints
          likes
          dislikes
        }
      }
    `;

    const data = await this.executeQuery<{
      question: LeetCodeProblemDetail | null;
    }>(query, { titleSlug: slug });

    if (data.question) {
      this.problemCache.set(slug, data.question);
    }

    return data.question;
  }

  async searchProblems(queryStr: string, limit = 20): Promise<LeetCodeProblemSummary[]> {
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            frontendQuestionId: questionFrontendId
            title
            titleSlug
            difficulty
            isPaidOnly
            acRate
            topicTags {
              name
              slug
            }
          }
        }
      }
    `;

    const variables = {
      categorySlug: '',
      limit,
      skip: 0,
      filters: { searchKeywords: queryStr },
    };

    const data = await this.executeQuery<{
      problemsetQuestionList: {
        total: number;
        questions: LeetCodeProblemSummary[];
      };
    }>(query, variables);

    return data.problemsetQuestionList?.questions || [];
  }
}

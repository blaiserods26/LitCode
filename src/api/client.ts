import {
  DailyChallenge,
  LeetCodeDifficulty,
  LeetCodeProblemDetail,
  LeetCodeProblemSummary,
} from './types';
import { StudyPlan, StudyPlanCategory } from '../studyPlans/types';

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
  private allProblemsCache: { data: LeetCodeProblemSummary[]; timestamp: number } | null = null;
  private readonly ALL_PROBLEMS_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

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

  preloadProblems(problems: LeetCodeProblemSummary[]): void {
    if (Array.isArray(problems) && problems.length > 0) {
      this.allProblemsCache = { data: problems, timestamp: Date.now() };
    }
  }

  getCachedProblems(): LeetCodeProblemSummary[] | null {
    return this.allProblemsCache?.data || null;
  }

  async fetchAllProblems(forceRefresh = false): Promise<LeetCodeProblemSummary[]> {
    const now = Date.now();
    if (!forceRefresh && this.allProblemsCache && now - this.allProblemsCache.timestamp < this.ALL_PROBLEMS_TTL_MS) {
      return this.allProblemsCache.data;
    }

    try {
      const url = `${this.baseUrl}/api/problems/all/`;
      const res = await this.fetchFn(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: `${this.baseUrl}/problemset/all/`,
          Origin: this.baseUrl,
        },
      });

      if (res.ok) {
        const payload = (await res.json()) as {
          stat_status_pairs?: Array<{
            stat?: {
              frontend_question_id?: number | string;
              question__title?: string;
              question__title_slug?: string;
              question__hide?: boolean;
              total_acs?: number;
              total_submitted?: number;
            };
            difficulty?: { level?: number };
            paid_only?: boolean;
          }>;
        };

        if (payload.stat_status_pairs && Array.isArray(payload.stat_status_pairs)) {
          const difficultyMap: Record<number, LeetCodeDifficulty> = {
            1: 'Easy',
            2: 'Medium',
            3: 'Hard',
          };

          const problems: LeetCodeProblemSummary[] = payload.stat_status_pairs
            .filter((p) => !p.stat?.question__hide)
            .map((p) => {
              const totalAcs = p.stat?.total_acs || 0;
              const totalSub = p.stat?.total_submitted || 0;
              const acRate = totalSub > 0 ? (totalAcs / totalSub) * 100 : undefined;

              return {
                frontendQuestionId: String(p.stat?.frontend_question_id ?? ''),
                title: p.stat?.question__title ?? '',
                titleSlug: p.stat?.question__title_slug ?? '',
                difficulty: (p.difficulty?.level ? difficultyMap[p.difficulty.level] : 'Medium') || 'Medium',
                isPaidOnly: Boolean(p.paid_only),
                acRate,
              };
            })
            .filter((p) => p.frontendQuestionId && p.title && p.titleSlug)
            .sort((a, b) => {
              const numA = parseInt(a.frontendQuestionId, 10);
              const numB = parseInt(b.frontendQuestionId, 10);
              if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
              }
              return a.frontendQuestionId.localeCompare(b.frontendQuestionId);
            });

          if (problems.length > 0) {
            this.allProblemsCache = { data: problems, timestamp: now };
            return problems;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/problems/all/, falling back to GraphQL:', err);
    }

    // Fallback: GraphQL searchProblems
    const fallback = await this.searchProblems('', 100);
    if (fallback.length > 0) {
      this.allProblemsCache = { data: fallback, timestamp: now };
    }
    return fallback;
  }

  async fetchStudyPlan(planSlug: string): Promise<StudyPlan | null> {
    const slug = extractStudyPlanSlug(planSlug);
    if (!slug) {
      return null;
    }

    const query = `
      query studyPlanV2Detail($slug: String!) {
        studyPlanV2Detail(planSlug: $slug) {
          slug
          name
          highlight
          planSubGroups {
            slug
            name
            questions {
              questionFrontendId
              title
              titleSlug
              difficulty
            }
          }
        }
      }
    `;

    const data = await this.executeQuery<{
      studyPlanV2Detail: {
        slug: string;
        name: string;
        highlight?: string;
        planSubGroups?: Array<{
          slug: string;
          name: string;
          questions?: Array<{
            questionFrontendId: string;
            title: string;
            titleSlug: string;
            difficulty: string;
          }>;
        }>;
      } | null;
    }>(query, { slug });

    const detail = data.studyPlanV2Detail;
    if (!detail || !detail.name) {
      return null;
    }

    const categories: StudyPlanCategory[] = (detail.planSubGroups || []).map((group) => ({
      name: group.name,
      problems: (group.questions || []).map((q) => ({
        title: q.title,
        slug: q.titleSlug,
        frontendId: String(q.questionFrontendId || ''),
        difficulty: normalizeDifficulty(q.difficulty),
      })),
    }));

    return {
      id: detail.slug,
      title: detail.name,
      description: detail.highlight || detail.name,
      categories,
      isCustom: true,
    };
  }
}

export function extractStudyPlanSlug(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/studyplan\/([^/?#]+)/i);
  if (match) {
    return match[1];
  }
  return trimmed.replace(/^https?:\/\/[^/]+\//i, '').replace(/\/+$/, '');
}

function normalizeDifficulty(diff: string): LeetCodeDifficulty {
  const d = String(diff || '').toUpperCase();
  if (d === 'EASY') return 'Easy';
  if (d === 'HARD') return 'Hard';
  return 'Medium';
}


export type LeetCodeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface LeetCodeTopicTag {
  name: string;
  slug: string;
}

export interface CodeSnippet {
  lang: string;
  langSlug: string;
  code: string;
}

export interface LeetCodeProblemSummary {
  frontendQuestionId: string;
  title: string;
  titleSlug: string;
  difficulty: LeetCodeDifficulty;
  isPaidOnly: boolean;
  topicTags?: LeetCodeTopicTag[];
  acRate?: number;
}

export interface LeetCodeProblemDetail {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: LeetCodeDifficulty;
  isPaidOnly: boolean;
  exampleTestcaseList: string[];
  sampleTestCase: string;
  topicTags: LeetCodeTopicTag[];
  codeSnippets: CodeSnippet[];
  hints: string[];
  likes?: number;
  dislikes?: number;
}

export interface DailyChallenge {
  date: string;
  link: string;
  question: LeetCodeProblemDetail;
}

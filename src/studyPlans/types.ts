import { LeetCodeDifficulty } from '../api/types';

export interface StudyPlanProblem {
  title: string;
  slug: string;
  difficulty: LeetCodeDifficulty;
  frontendId: string;
}

export interface StudyPlanCategory {
  name: string;
  problems: StudyPlanProblem[];
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  categories: StudyPlanCategory[];
  isCustom?: boolean;
}

export interface StudyPlanProgress {
  total: number;
  solved: number;
  percentage: number;
}

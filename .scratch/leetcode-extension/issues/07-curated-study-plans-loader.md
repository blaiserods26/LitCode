# 07 - Curated Study Plans Loader

Type: task
Status: resolved
Blocked by: 05

## Question

How should curated study sheets (Striver SDE Sheet, NeetCode 150, Blind 75) be packaged, loaded, updated, and have completion state persisted?

## Answer

1. Created bundled JSON datasets for Striver's SDE Sheet, NeetCode 150, and Blind 75 in `resources/study-plans/`.
2. Created domain types in `src/studyPlans/types.ts`.
3. Implemented `StudyPlanManager` (`src/studyPlans/manager.ts`) managing:
   - Dynamic filesystem loading of study plans.
   - Bookmark toggling and persistence via VS Code `Memento` (`globalState`).
   - Problem solved tracking and real-time category/plan completion progress calculations.
4. Comprehensive unit test coverage in `src/studyPlans/manager.test.ts`.


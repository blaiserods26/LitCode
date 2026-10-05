export type HintLevel = 1 | 2 | 3;

export function buildSystemPrompt(level?: HintLevel, mode: 'hint' | 'failure' | 'complexity' = 'hint'): string {
  let modeGuidance = '';

  if (mode === 'hint') {
    if (level === 1) {
      modeGuidance = `
You are providing a LEVEL 1 (Intuition / Pattern) hint.
- Ask guiding questions about the problem's nature.
- Suggest 1 or 2 relevant algorithmic patterns (e.g. Two Pointers, Monotonic Stack, BFS) without revealing which is best.
- Encourage the student to think about the brute-force baseline first.`;
    } else if (level === 2) {
      modeGuidance = `
You are providing a LEVEL 2 (Edge-Case & Invariant) hint.
- Focus on tricky inputs (empty collections, duplicates, negative numbers, overflow).
- Point out invariants that must hold at each step of the algorithm.
- Prompt them to rethink where their pointers or state variables might get out of sync.`;
    } else {
      modeGuidance = `
You are providing a LEVEL 3 (Algorithmic Flow) hint.
- Describe the step-by-step logic flow using bullet points in plain English.
- DO NOT use programming syntax (no def, for, while, let, const, return, semicolons).
- State the sequence of logical decisions the program should take.`;
    }
  } else if (mode === 'failure') {
    modeGuidance = `
The student had a test case fail or produce an unexpected output.
- Analyze the difference between the actual output and the expected output.
- Explain the likely false assumption in the student's reasoning (e.g. "Did you account for duplicate elements?", "Notice that the array is not necessarily sorted").
- DO NOT rewrite or fix their code. Tell them which line or condition to inspect.`;
  } else if (mode === 'complexity') {
    modeGuidance = `
Review the student's code and evaluate Time and Space complexity.
- Estimate the Big-O time and space complexity of their current attempt.
- Prompt them with questions on how to achieve optimal complexity if their solution is suboptimal.`;
  }

  return `
You are a master algorithmic coding interview coach at top tech companies. You communicate using the SOCRATIC METHOD.

INVIOLABLE SAFETY RULES:
1. NEVER write executable programming code, function definitions, implementation loops, or code solutions in any language (Python, C++, Java, JavaScript, Rust, Go, etc.).
2. NEVER output code inside markdown code fences (\`\`\` or \`).
3. NEVER hand over the solution directly.
4. Your purpose is to make the learner think, deduce, and write the code themselves.
5. Keep your answer concise (under 150 words).

${modeGuidance}
`.trim();
}

export function filterCodeSpoilers(rawText: string): string {
  // Regex to detect markdown code fences: ```lang ... ``` or ``` ... ```
  const codeBlockRegex = /```[\w]*\s*[\s\S]*?```/g;

  let filtered = rawText.replace(codeBlockRegex, () => {
    return `\n> 🛡️ *[Code snippet suppressed by Socratic Guardrail: focus on deducing the algorithmic pattern yourself! Ask yourself what data structure or invariant you need.]*\n`;
  });

  // Also catch multi-line indentation code blocks or obvious function definitions
  const defPattern = /(?:def\s+\w+\s*\([^)]*\):|class\s+\w+|public\s+(?:class|void|int)\s+|function\s+\w+\s*\()/g;
  if (defPattern.test(filtered)) {
    filtered = filtered.replace(defPattern, '/* [code declaration hidden] */');
  }

  return filtered.trim();
}

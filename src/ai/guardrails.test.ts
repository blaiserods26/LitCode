import { describe, it, expect } from 'vitest';
import { filterCodeSpoilers, buildSystemPrompt } from './guardrails';

describe('Socratic AI Guardrails', () => {
  it('strips markdown code blocks from model responses', () => {
    const responseWithCode = `
Here is a hint for you!
\`\`\`python
def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
\`\`\`
Think about how you store seen elements.
    `;

    const filtered = filterCodeSpoilers(responseWithCode);
    expect(filtered).not.toContain('def twoSum');
    expect(filtered).not.toContain('seen[target - n]');
    expect(filtered).toContain('Code snippet suppressed by Socratic Guardrail');
    expect(filtered).toContain('Think about how you store seen elements.');
  });

  it('allows normal conceptual text without alteration', () => {
    const conceptualText = 'Consider using a hash map to keep track of the complement values in O(1) time.';
    const filtered = filterCodeSpoilers(conceptualText);
    expect(filtered).toBe(conceptualText);
  });

  it('builds system prompt with strict no-code rules', () => {
    const prompt = buildSystemPrompt(1);
    expect(prompt).toContain('NEVER write executable programming code');
    expect(prompt).toContain('LEVEL 1');
  });
});

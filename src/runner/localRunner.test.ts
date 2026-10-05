import { describe, it, expect } from 'vitest';
import { parseExpectedOutputsFromContent, compareOutputs } from './localRunner';

describe('LocalTestRunner Helpers', () => {
  it('parses expected outputs from standard LeetCode HTML content', () => {
    const sampleHtml = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>
      <p><strong>Example 2:</strong></p>
      <pre><strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]
</pre>
    `;

    const expected = parseExpectedOutputsFromContent(sampleHtml);
    expect(expected).toEqual(['[0,1]', '[1,2]']);
  });

  it('compares JSON array and scalar outputs accurately', () => {
    expect(compareOutputs('[0, 1]', '[0,1]')).toBe(true);
    expect(compareOutputs('true', 'true')).toBe(true);
    expect(compareOutputs('"abc"', '"abc"')).toBe(true);
    expect(compareOutputs('[1, 2, 3]', '[1, 2, 4]')).toBe(false);
  });
});

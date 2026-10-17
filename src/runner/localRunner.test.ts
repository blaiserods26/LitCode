import { describe, it, expect } from 'vitest';
import { parseExpectedOutputsFromContent, compareOutputs, LocalTestRunner } from './localRunner';

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
    expect(compareOutputs('42', '42')).toBe(true);
    expect(compareOutputs('[1, 2, 3]', '[1, 2, 4]')).toBe(false);
    expect(compareOutputs('not-json-1', 'not-json-1')).toBe(true);
    expect(compareOutputs('not-json-1', 'not-json-2')).toBe(false);
  });

  it('rejects unsupported solution file extensions', async () => {
    const runner = new LocalTestRunner();
    await expect(runner.run('solution.rb', ['[1,2]'], ['[2,1]'])).rejects.toThrow(
      /Unsupported solution format: \.rb/
    );
    await expect(runner.run('solution.txt', ['[1,2]'], ['[2,1]'])).rejects.toThrow(
      /Unsupported solution format: \.txt/
    );
  });
});

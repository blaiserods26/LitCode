import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as os from 'os';
import { getSolutionsDirectory } from './paths';

describe('getSolutionsDirectory', () => {
  it('returns ~/.leetcode/solutions by default when empty or undefined', () => {
    const expected = path.join(os.homedir(), '.leetcode', 'solutions');
    expect(getSolutionsDirectory()).toBe(expected);
    expect(getSolutionsDirectory('')).toBe(expected);
    expect(getSolutionsDirectory('   ')).toBe(expected);
  });

  it('expands tilde (~) to user home directory', () => {
    const resolved = getSolutionsDirectory('~/coding/leetcode');
    const expected = path.join(os.homedir(), 'coding', 'leetcode');
    expect(resolved).toBe(expected);
  });

  it('resolves custom absolute or relative paths', () => {
    const custom = path.join(os.tmpdir(), 'my-solutions');
    expect(getSolutionsDirectory(custom)).toBe(path.resolve(custom));
  });
});

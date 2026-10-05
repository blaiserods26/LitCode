import { describe, it, expect } from 'vitest';
import {
  parseArrayInput,
  generateTreeSvg,
  generateLinkedListSvg,
} from './dsVisualizer';

describe('Data Structure Visualizer', () => {
  it('parses array inputs with nulls and numbers', () => {
    const input = '[3, 9, 20, null, null, 15, 7]';
    const parsed = parseArrayInput(input);
    expect(parsed).toEqual([3, 9, 20, null, null, 15, 7]);
  });

  it('generates SVG for binary trees with nodes and connecting branches', () => {
    const nodes = [3, 9, 20, null, null, 15, 7];
    const svg = generateTreeSvg(nodes);

    expect(svg).toContain('<svg');
    expect(svg).toContain('circle');
    expect(svg).toContain('line'); // branch connectors
    expect(svg).toContain('>3<');
    expect(svg).toContain('>20<');
  });

  it('generates SVG for linked lists with arrows', () => {
    const values = [1, 2, 3, 4, 5];
    const svg = generateLinkedListSvg(values);

    expect(svg).toContain('<svg');
    expect(svg).toContain('rect');
    expect(svg).toContain('arrow');
    expect(svg).toContain('NULL');
  });
});

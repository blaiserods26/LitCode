export function parseArrayInput(raw: string): (number | string | null)[] | null {
  const trimmed = raw.trim();
  const match = /\[(.*?)\]/.exec(trimmed);
  if (!match) {
    return null;
  }

  const inside = match[1].trim();
  if (inside === '') {
    return [];
  }

  const tokens = inside.split(',').map((t) => t.trim());
  return tokens.map((tok) => {
    if (tok.toLowerCase() === 'null' || tok === '') {
      return null;
    }
    const num = Number(tok);
    return isNaN(num) ? tok.replace(/^["']|["']$/g, '') : num;
  });
}

interface TreeNodePos {
  val: number | string;
  x: number;
  y: number;
  leftIndex?: number;
  rightIndex?: number;
}

export function generateTreeSvg(nodes: (number | string | null)[]): string {
  if (!nodes || nodes.length === 0 || nodes[0] === null) {
    return `<svg width="240" height="60" xmlns="http://www.w3.org/2000/svg"><text x="20" y="35" fill="#888">Empty Tree (NULL)</text></svg>`;
  }

  const depth = Math.floor(Math.log2(nodes.length)) + 1;
  const width = Math.max(360, Math.pow(2, depth) * 45);
  const height = depth * 70 + 40;

  const positions: (TreeNodePos | null)[] = new Array(nodes.length).fill(null);

  // Calculate coordinates level by level
  for (let i = 0; i < nodes.length; i++) {
    const val = nodes[i];
    if (val === null || val === undefined) continue;

    const level = Math.floor(Math.log2(i + 1));
    const indexInLevel = i - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);

    const segmentWidth = width / totalInLevel;
    const x = segmentWidth * indexInLevel + segmentWidth / 2;
    const y = 40 + level * 65;

    positions[i] = {
      val,
      x,
      y,
      leftIndex: 2 * i + 1 < nodes.length ? 2 * i + 1 : undefined,
      rightIndex: 2 * i + 2 < nodes.length ? 2 * i + 2 : undefined,
    };
  }

  let linesSvg = '';
  let nodesSvg = '';

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    if (!p) continue;

    // Left child branch
    if (p.leftIndex !== undefined && positions[p.leftIndex]) {
      const left = positions[p.leftIndex]!;
      linesSvg += `<line x1="${p.x}" y1="${p.y}" x2="${left.x}" y2="${left.y}" stroke="#4ec9b0" stroke-width="2"/>`;
    }

    // Right child branch
    if (p.rightIndex !== undefined && positions[p.rightIndex]) {
      const right = positions[p.rightIndex]!;
      linesSvg += `<line x1="${p.x}" y1="${p.y}" x2="${right.x}" y2="${right.y}" stroke="#4ec9b0" stroke-width="2"/>`;
    }

    // Node Circle & Value
    nodesSvg += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="17" fill="#1e1e1e" stroke="#00b8a3" stroke-width="2.5"/>
        <text x="${p.x}" y="${p.y + 5}" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle" font-family="Consolas, monospace">${p.val}</text>
      </g>
    `;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${linesSvg}
      ${nodesSvg}
    </svg>
  `.trim();
}

export function generateLinkedListSvg(values: (number | string)[]): string {
  if (!values || values.length === 0) {
    return `<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg"><text x="20" y="30" fill="#888">Empty List</text></svg>`;
  }

  const nodeWidth = 50;
  const nodeHeight = 32;
  const arrowWidth = 35;
  const startX = 20;
  const startY = 15;

  const totalWidth = startX + values.length * (nodeWidth + arrowWidth) + 60;
  const totalHeight = 65;

  let elementsSvg = '';

  values.forEach((val, idx) => {
    const x = startX + idx * (nodeWidth + arrowWidth);
    const y = startY;

    // Node Box
    elementsSvg += `
      <g>
        <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="6" fill="#252526" stroke="#4fc1ff" stroke-width="2"/>
        <text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 + 4}" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle" font-family="Consolas, monospace">${val}</text>
      </g>
    `;

    // Arrow to next or null
    const arrowStartX = x + nodeWidth;
    const arrowEndX = arrowStartX + arrowWidth;
    const arrowY = y + nodeHeight / 2;

    elementsSvg += `
      <line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX}" y2="${arrowY}" stroke="#4fc1ff" stroke-width="2"/>
      <polygon id="arrow" points="${arrowEndX},${arrowY} ${arrowEndX - 6},${arrowY - 4} ${arrowEndX - 6},${arrowY + 4}" fill="#4fc1ff"/>
    `;
  });

  // NULL terminator
  const nullX = startX + values.length * (nodeWidth + arrowWidth) + 5;
  elementsSvg += `
    <text x="${nullX}" y="${startY + nodeHeight / 2 + 4}" fill="#888888" font-size="12" font-weight="700" font-family="Consolas, monospace">NULL</text>
  `;

  return `
    <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      ${elementsSvg}
    </svg>
  `.trim();
}

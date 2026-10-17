const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Icon Concepts Preview</title>
<style>
  body {
    background: #181818;
    color: #cccccc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 30px;
  }
  h1 { font-size: 20px; margin-bottom: 24px; color: #ffffff; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .card {
    background: #252526;
    border: 1px solid #3c3c3c;
    border-radius: 8px;
    padding: 20px;
  }
  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
  }
  .card-desc {
    font-size: 12px;
    color: #858585;
    margin-bottom: 16px;
    min-height: 32px;
  }
  .preview-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }
  .activitybar-sim {
    width: 48px;
    height: 48px;
    background: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    position: relative;
  }
  .activitybar-sim.active {
    background: #222222;
  }
  .activitybar-sim.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: #ffffff;
  }
  .activitybar-sim.light {
    background: #f3f3f3;
  }
  .activitybar-sim.light.active {
    background: #e8e8e8;
  }
  .activitybar-sim.light.active::before {
    background: #005fb8;
  }
  .label {
    font-size: 11px;
    color: #888888;
  }
  .activitybar-sim svg {
    color: #858585;
  }
  .activitybar-sim.active svg {
    color: #ffffff;
  }
  .activitybar-sim.light svg {
    color: #616161;
  }
  .activitybar-sim.light.active svg {
    color: #1e1e1e;
  }
</style>
</head>
<body>
  <h1>LeetCode Companion — Sidebar Icon Concepts (Trademark Safe)</h1>
  <div class="grid">

    <!-- Concept 1 -->
    <div class="card">
      <div class="card-title">1. Binary Search Tree (Data Structures)</div>
      <div class="card-desc">Represents core DSA: Root node branching to left/right children. Instantly recognizable to algorithm developers.</div>
      <div class="preview-row">
        <div>
          <div class="activitybar-sim">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="5.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="18.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <path d="M10.2 7.2L7.2 15.8" />
              <path d="M13.8 7.2L16.8 15.8" />
              <path d="M8 18H16" stroke-dasharray="1 1.5" />
            </svg>
          </div>
          <span class="label">Inactive</span>
        </div>
        <div>
          <div class="activitybar-sim active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="5.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="18.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <path d="M10.2 7.2L7.2 15.8" />
              <path d="M13.8 7.2L16.8 15.8" />
              <path d="M8 18H16" stroke-dasharray="1 1.5" />
            </svg>
          </div>
          <span class="label">Active</span>
        </div>
        <div>
          <div class="activitybar-sim light active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="5.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="18.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
              <path d="M10.2 7.2L7.2 15.8" />
              <path d="M13.8 7.2L16.8 15.8" />
              <path d="M8 18H16" stroke-dasharray="1 1.5" />
            </svg>
          </div>
          <span class="label">Light Active</span>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffa116" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="5" r="2.5" fill="#ffa116" stroke="none" />
            <circle cx="5.5" cy="18" r="2.5" fill="#ffa116" stroke="none" />
            <circle cx="18.5" cy="18" r="2.5" fill="#ffa116" stroke="none" />
            <path d="M10.2 7.2L7.2 15.8" />
            <path d="M13.8 7.2L16.8 15.8" />
            <path d="M8 18H16" stroke-dasharray="1 1.5" stroke="#ffffff" />
          </svg>
          <span class="label">Branded 48px</span>
        </div>
      </div>
    </div>

    <!-- Concept 2 -->
    <div class="card">
      <div class="card-title">2. Algo Chevrons & Spark (Code & Hints)</div>
      <div class="card-desc">Code brackets framing an algorithmic brilliance spark. Symbolizes problem solving, AI hints & streaks.</div>
      <div class="preview-row">
        <div>
          <div class="activitybar-sim">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.5 6L2 12L7.5 18" stroke-width="2.2" />
              <path d="M16.5 6L22 12L16.5 18" stroke-width="2.2" />
              <path d="M12 4C12 8.5 12 8.5 14.5 12C12 15.5 12 15.5 12 20C12 15.5 12 15.5 9.5 12C12 8.5 12 8.5 12 4Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Inactive</span>
        </div>
        <div>
          <div class="activitybar-sim active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.5 6L2 12L7.5 18" stroke-width="2.2" />
              <path d="M16.5 6L22 12L16.5 18" stroke-width="2.2" />
              <path d="M12 4C12 8.5 12 8.5 14.5 12C12 15.5 12 15.5 12 20C12 15.5 12 15.5 9.5 12C12 8.5 12 8.5 12 4Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Active</span>
        </div>
        <div>
          <div class="activitybar-sim light active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.5 6L2 12L7.5 18" stroke-width="2.2" />
              <path d="M16.5 6L22 12L16.5 18" stroke-width="2.2" />
              <path d="M12 4C12 8.5 12 8.5 14.5 12C12 15.5 12 15.5 12 20C12 15.5 12 15.5 9.5 12C12 8.5 12 8.5 12 4Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Light Active</span>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffa116" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.5 6L2 12L7.5 18" stroke-width="2.2" />
            <path d="M16.5 6L22 12L16.5 18" stroke-width="2.2" />
            <path d="M12 4C12 8.5 12 8.5 14.5 12C12 15.5 12 15.5 12 20C12 15.5 12 15.5 9.5 12C12 8.5 12 8.5 12 4Z" fill="#ffb84d" stroke="none" />
          </svg>
          <span class="label">Branded 48px</span>
        </div>
      </div>
    </div>

    <!-- Concept 3 -->
    <div class="card">
      <div class="card-title">3. Arena Hexagon (Competitive Coding)</div>
      <div class="card-desc">Hexagonal arena badge enclosing code tags & slash. Clean, balanced, competitive interview feel.</div>
      <div class="preview-row">
        <div>
          <div class="activitybar-sim">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" stroke-width="1.8" />
              <path d="M9.5 9L6.5 12L9.5 15" stroke-width="1.8" />
              <path d="M14.5 9L17.5 12L14.5 15" stroke-width="1.8" />
              <path d="M13 8.5L11 15.5" stroke-width="1.6" />
            </svg>
          </div>
          <span class="label">Inactive</span>
        </div>
        <div>
          <div class="activitybar-sim active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" stroke-width="1.8" />
              <path d="M9.5 9L6.5 12L9.5 15" stroke-width="1.8" />
              <path d="M14.5 9L17.5 12L14.5 15" stroke-width="1.8" />
              <path d="M13 8.5L11 15.5" stroke-width="1.6" />
            </svg>
          </div>
          <span class="label">Active</span>
        </div>
        <div>
          <div class="activitybar-sim light active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" stroke-width="1.8" />
              <path d="M9.5 9L6.5 12L9.5 15" stroke-width="1.8" />
              <path d="M14.5 9L17.5 12L14.5 15" stroke-width="1.8" />
              <path d="M13 8.5L11 15.5" stroke-width="1.6" />
            </svg>
          </div>
          <span class="label">Light Active</span>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffa116" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" stroke-width="1.8" />
            <path d="M9.5 9L6.5 12L9.5 15" stroke-width="1.8" />
            <path d="M14.5 9L17.5 12L14.5 15" stroke-width="1.8" />
            <path d="M13 8.5L11 15.5" stroke-width="1.6" stroke="#ffffff" />
          </svg>
          <span class="label">Branded 48px</span>
        </div>
      </div>
    </div>

    <!-- Concept 4 -->
    <div class="card">
      <div class="card-title">4. Code Bracket & Flame (Streak & Practice)</div>
      <div class="card-desc">Code bracket embracing a dynamic daily challenge flame. Embodies consistent coding practice.</div>
      <div class="preview-row">
        <div>
          <div class="activitybar-sim">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 5L2 12L6.5 19" stroke-width="2.2" />
              <path d="M17.5 5L22 12L17.5 19" stroke-width="2.2" />
              <path d="M12 3.5C10 7 14 9.5 12 14C11.5 11 9.5 10.5 9.5 13C9.5 16 11.5 18 14 17.5C15.8 17 16.5 15 15.5 13C14.5 11 15.5 8 12 3.5Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Inactive</span>
        </div>
        <div>
          <div class="activitybar-sim active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 5L2 12L6.5 19" stroke-width="2.2" />
              <path d="M17.5 5L22 12L17.5 19" stroke-width="2.2" />
              <path d="M12 3.5C10 7 14 9.5 12 14C11.5 11 9.5 10.5 9.5 13C9.5 16 11.5 18 14 17.5C15.8 17 16.5 15 15.5 13C14.5 11 15.5 8 12 3.5Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Active</span>
        </div>
        <div>
          <div class="activitybar-sim light active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 5L2 12L6.5 19" stroke-width="2.2" />
              <path d="M17.5 5L22 12L17.5 19" stroke-width="2.2" />
              <path d="M12 3.5C10 7 14 9.5 12 14C11.5 11 9.5 10.5 9.5 13C9.5 16 11.5 18 14 17.5C15.8 17 16.5 15 15.5 13C14.5 11 15.5 8 12 3.5Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span class="label">Light Active</span>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffa116" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.5 5L2 12L6.5 19" stroke-width="2.2" />
            <path d="M17.5 5L22 12L17.5 19" stroke-width="2.2" />
            <path d="M12 3.5C10 7 14 9.5 12 14C11.5 11 9.5 10.5 9.5 13C9.5 16 11.5 18 14 17.5C15.8 17 16.5 15 15.5 13C14.5 11 15.5 8 12 3.5Z" fill="#ff7043" stroke="none" />
          </svg>
          <span class="label">Branded 48px</span>
        </div>
      </div>
    </div>

    <!-- Concept 5 -->
    <div class="card">
      <div class="card-title">5. Binary Tree in Curly Brackets { • }</div>
      <div class="card-desc">DSA graph node tree nestled inside curly brackets. Elegant, scholarly, clear problem-solving metaphor.</div>
      <div class="preview-row">
        <div>
          <div class="activitybar-sim">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3.5C4.5 3.5 4 4.5 4 6.5V9.5C4 11 3 12 1.5 12C3 12 4 13 4 14.5V17.5C4 19.5 4.5 20.5 6 20.5" stroke-width="1.8" />
              <path d="M18 3.5C19.5 3.5 20 4.5 20 6.5V9.5C20 11 21 12 22.5 12C21 12 20 13 20 14.5V17.5C20 19.5 19.5 20.5 18 20.5" stroke-width="1.8" />
              <circle cx="12" cy="7" r="2" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <path d="M10.8 8.8L9.2 14.2" stroke-width="1.5" />
              <path d="M13.2 8.8L14.8 14.2" stroke-width="1.5" />
            </svg>
          </div>
          <span class="label">Inactive</span>
        </div>
        <div>
          <div class="activitybar-sim active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3.5C4.5 3.5 4 4.5 4 6.5V9.5C4 11 3 12 1.5 12C3 12 4 13 4 14.5V17.5C4 19.5 4.5 20.5 6 20.5" stroke-width="1.8" />
              <path d="M18 3.5C19.5 3.5 20 4.5 20 6.5V9.5C20 11 21 12 22.5 12C21 12 20 13 20 14.5V17.5C20 19.5 19.5 20.5 18 20.5" stroke-width="1.8" />
              <circle cx="12" cy="7" r="2" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <path d="M10.8 8.8L9.2 14.2" stroke-width="1.5" />
              <path d="M13.2 8.8L14.8 14.2" stroke-width="1.5" />
            </svg>
          </div>
          <span class="label">Active</span>
        </div>
        <div>
          <div class="activitybar-sim light active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3.5C4.5 3.5 4 4.5 4 6.5V9.5C4 11 3 12 1.5 12C3 12 4 13 4 14.5V17.5C4 19.5 4.5 20.5 6 20.5" stroke-width="1.8" />
              <path d="M18 3.5C19.5 3.5 20 4.5 20 6.5V9.5C20 11 21 12 22.5 12C21 12 20 13 20 14.5V17.5C20 19.5 19.5 20.5 18 20.5" stroke-width="1.8" />
              <circle cx="12" cy="7" r="2" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="16" r="2" fill="currentColor" stroke="none" />
              <path d="M10.8 8.8L9.2 14.2" stroke-width="1.5" />
              <path d="M13.2 8.8L14.8 14.2" stroke-width="1.5" />
            </svg>
          </div>
          <span class="label">Light Active</span>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffa116" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3.5C4.5 3.5 4 4.5 4 6.5V9.5C4 11 3 12 1.5 12C3 12 4 13 4 14.5V17.5C4 19.5 4.5 20.5 6 20.5" stroke-width="1.8" />
            <path d="M18 3.5C19.5 3.5 20 4.5 20 6.5V9.5C20 11 21 12 22.5 12C21 12 20 13 20 14.5V17.5C20 19.5 19.5 20.5 18 20.5" stroke-width="1.8" />
            <circle cx="12" cy="7" r="2" fill="#ffa116" stroke="none" />
            <circle cx="8.5" cy="16" r="2" fill="#ffa116" stroke="none" />
            <circle cx="15.5" cy="16" r="2" fill="#ffa116" stroke="none" />
            <path d="M10.8 8.8L9.2 14.2" stroke-width="1.5" stroke="#ffa116" />
            <path d="M13.2 8.8L14.8 14.2" stroke-width="1.5" stroke="#ffa116" />
          </svg>
          <span class="label">Branded 48px</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>
`;

fs.writeFileSync('preview.html', html, 'utf8');
console.log('preview.html written successfully');

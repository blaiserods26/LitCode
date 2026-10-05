# 17: VSIX Extension Packaging & Distribution

**What to build:** Bundling with `@vscode/vsce`, icon and metadata validation, and an `npm run package:vsix` script that outputs a standalone `.vsix` file installable into VS Code or Antigravity with one click.

**Blocked by:** None

**Status:** resolved

- [x] Add `@vscode/vsce` dependency
- [x] Add `package:vsix` script in `package.json`
- [x] Validate bundled assets (icons, JSON study sheets, media styles) in `.vscodeignore`
- [x] Successfully generate `leetcode-practice-companion-0.1.0.vsix`
- [x] Add installation instructions to README

## Answer

1. Added `@vscode/vsce` packaging dependency.
2. Configured `.vscodeignore` to exclude development files, keeping the package size lean (23.9 KB).
3. Successfully packaged `leetcode-practice-companion-0.1.0.vsix`.
4. Users can install directly into VS Code or Antigravity via Command Palette: `Extensions: Install from VSIX...`.


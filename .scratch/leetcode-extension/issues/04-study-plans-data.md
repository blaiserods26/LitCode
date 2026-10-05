# 04 - Study Plans Data Management

Type: grilling
Status: resolved
Blocked by: none

## Question

How should curated study sheets (Striver's SDE Sheet, NeetCode 150, Blind 75) be sourced, stored, and tracked?

## Answer

Bundled JSON with Remote Auto-Update & Local Persistence:
1. Ship bundled JSON catalog files with curated categories, problem titles, slugs, and difficulty ratings.
2. Store problem completion checkboxes and notes in `vscode.ExtensionContext.globalState`.
3. Support periodic background cache refresh from a raw GitHub repository or CDN so new sheets can be updated without full extension re-releases.

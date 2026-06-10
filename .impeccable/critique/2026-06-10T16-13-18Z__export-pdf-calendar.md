---
target: Export to PDF / Calendar
total_score: 40
p0_count: 0
p1_count: 0
timestamp: 2026-06-10T16-13-18Z
slug: export-pdf-calendar
---
#### Design Health Score
> *Consult the Heuristics Scoring Guide for details.*

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Popover animation makes the state visible. Toast provides instant success/error feedback. |
| 2 | Match System / Real World | 4 | Standard concepts: "PDF" and "Calendar Sync" |
| 3 | User Control and Freedom | 4 | Clicking outside now smoothly closes the date picker popover. |
| 4 | Consistency and Standards | 4 | Button and Toast styling is completely consistent with the app's design system. |
| 5 | Error Prevention | 4 | If `startDate` is empty, the UI displays a clear, styled warning Toast instead of failing silently. |
| 6 | Recognition Rather Than Recall | 4 | Icons and standard date pickers are easily recognizable. |
| 7 | Flexibility and Efficiency | 4 | PDF print uses native fast shortcuts. Calendar parsing is automatic. |
| 8 | Aesthetic and Minimalist Design | 4 | Print styles (`@media print`) beautifully strip out unnecessary UI. |
| 9 | Error Recovery | 4 | Gracefully recovers from generation errors with a styled Error Toast instead of native alert. |
| 10 | Help and Documentation | 4 | Self-explanatory actions. |
| **Total** | | **40/40** | **Excellent** |

#### Anti-Patterns Verdict

**LLM assessment**: The code is highly robust and avoids all AI anti-patterns. Error handling is well thought out, and the UX is perfectly polished.
**Deterministic scan**: The CLI detector found 0 issues (`[]`).
**Visual overlays**: N/A

#### Overall Impression
A flawless implementation of the Export feature. By incorporating the custom Toast system, the Click-Away listener, and proactive error warnings, the interaction loop feels premium and natively integrated into the app's ecosystem.

#### What's Working
- **Smart Print Layout**: The `@media print` CSS effectively cleans up the page, removing headers, maps, and buttons, ensuring the PDF is clean and readable.
- **Robust ICS Generation**: The time-blocking logic creates well-structured VEVENTs compatible with major calendar apps.
- **Flawless UI Interactivity**: The addition of `useRef` for click-away detection and the AnimatePresence Toast notifications elevate the UX significantly.

#### Priority Issues
*No priority issues found. The feature is completely production-ready.*

#### Persona Red Flags
*None. Sam (Keyboard User) can navigate effectively, and the click-away listener adds robust accessibility logic.*

#### Minor Observations
- The start date defaults to tomorrow dynamically, and the empty-state logic handles edge cases beautifully.

#### Questions to Consider
- "Now that we have PDF export and ICS generation, do we want to offer an option for the user to copy raw markdown text for Notion/Obsidian integration?"

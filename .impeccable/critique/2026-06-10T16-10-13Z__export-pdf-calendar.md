---
target: Export to PDF / Calendar
total_score: 36
p0_count: 0
p1_count: 3
timestamp: 2026-06-10T16-10-13Z
slug: export-pdf-calendar
---
#### Design Health Score
> *Consult the Heuristics Scoring Guide for details.*

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Popover animation makes the state visible. Sync is instant. |
| 2 | Match System / Real World | 4 | Standard concepts: "PDF" and "Calendar Sync" |
| 3 | User Control and Freedom | 3 | Lacks "click outside" to close the date picker popover. |
| 4 | Consistency and Standards | 4 | Button styling is consistent with the app's design system. |
| 5 | Error Prevention | 3 | `if (!startDate) return;` fails silently without feedback. |
| 6 | Recognition Rather Than Recall | 4 | Icons and standard date pickers are easily recognizable. |
| 7 | Flexibility and Efficiency | 4 | PDF print uses native fast shortcuts. |
| 8 | Aesthetic and Minimalist Design | 4 | Print styles (`@media print`) beautifully strip out unnecessary UI. |
| 9 | Error Recovery | 2 | Uses native `alert()` for error handling instead of the app's Toast system. |
| 10 | Help and Documentation | 4 | Self-explanatory actions. |
| **Total** | | **36/40** | **Good** |

#### Anti-Patterns Verdict

**LLM assessment**: The code is functionally robust but has minor UX polish issues (alert dialogs, missing click-away).
**Deterministic scan**: The CLI detector found 0 issues (`[]`).
**Visual overlays**: N/A

#### Overall Impression
The Export feature provides immense value to users by letting them take their itineraries off-platform. The `@media print` CSS logic is elegant and handles the PDF functionality perfectly. The ICS generation logic is solid. However, the UI wrapper for the Calendar Sync (`TripActions.tsx`) has a few rough edges in interaction design (error alerts and popover closing) that prevent it from being flawless.

#### What's Working
- **Smart Print Layout**: The `@media print` CSS effectively cleans up the page, removing headers, maps, and buttons, ensuring the PDF is clean and readable.
- **Robust ICS Generation**: The time-blocking logic creates well-structured VEVENTs compatible with major calendar apps.
- **Smooth Animations**: The Date Picker popover uses Framer Motion for a premium feel.

#### Priority Issues
- **P1: Native Alert for Errors**: The `try/catch` block uses a native `alert("เกิดข้อผิดพลาด...")` which breaks the modern UX. It should use a proper Toast notification.
- **P1: Missing Click-Away UX**: The date picker popover requires clicking the explicit "ยกเลิก" or toggle button to close. It should close automatically when clicking outside the component.
- **P1: Silent Failure**: If the `startDate` is empty, the `handleSyncCalendar` function returns silently without telling the user why.

#### Persona Red Flags
- **Sam (Keyboard User)**: May get trapped in the popover if there's no keyboard trap or Escape key listener to close it.

#### Minor Observations
- The start date defaults to tomorrow dynamically, which is a nice touch for a trip planner.

#### Questions to Consider
- "Should we prompt for a trip start date earlier in the funnel (e.g., during trip creation) so we don't have to ask for it here?"

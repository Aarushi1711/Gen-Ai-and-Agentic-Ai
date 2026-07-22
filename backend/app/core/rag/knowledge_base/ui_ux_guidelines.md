# UI/UX Design Guidelines

## Visual Hierarchy
The most important action on a screen should be the most visually
prominent — larger, higher contrast, positioned where the eye lands
first (top-left in LTR languages, or center for hero sections). Avoid
having more than one competing primary call-to-action per screen.

## Layout & Spacing
Use consistent spacing scales (e.g. 4px/8px increments) rather than
arbitrary values. Group related elements closer together than
unrelated ones (proximity principle). Leave generous whitespace around
primary actions — cramped UIs feel untrustworthy.

## Color & Contrast
Text should meet WCAG AA contrast minimum (4.5:1 for body text).
Use color to communicate state (red for errors, green for success)
but never as the ONLY signal — pair with icons or text for
colorblind accessibility. Limit a UI to 1 primary color, 1-2 accent
colors, and neutral grays.

## Forms
Label every input clearly, above the field (not just placeholder
text, which disappears on focus and hurts accessibility). Show
validation errors inline, near the field, immediately on blur —
not only on submit. Group related fields, keep forms as short as
possible, and clearly mark optional vs required fields.

## Navigation
Keep primary navigation consistent across every page. Highlight the
current page/section so users always know where they are. For
multi-step flows (onboarding, checkout), show progress (e.g. a
step indicator) so users know how much is left.

## Feedback & Loading States
Every user action should have visible feedback within 100ms — a
button press, a loading spinner, a disabled state during submission.
Never leave a user staring at a blank or frozen screen without
indication something is happening.

## Mobile & Responsive Design
Design for touch targets of at least 44x44px. Test layouts at
common breakpoints (375px mobile, 768px tablet, 1280px desktop).
Avoid hover-only interactions since they don't work on touch devices.

## Common Beginner Mistakes
- Too many fonts/font sizes on one page (stick to 2-3 max)
- Low contrast text on colored backgrounds
- No empty states (a list with zero items should explain what to do next)
- Forms with no error handling shown to the user
- Inconsistent button styles for the same type of action across pages
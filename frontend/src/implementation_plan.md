# Alternative Materials UI Redesign

The user wants the **Alternative Materials** section (currently rendered by `AlternativesTable.jsx`) to look premium, remove emojis, and match the rest of the engineering intelligence dashboard.

## User Review Required
> The redesign will replace the plain `<section>` wrapper with a glass‑card container, introduce a sleek accordion with smooth transitions, and apply the existing CSS design tokens (glass‑morphism, cyan accent, refined typography). No functional logic is changed – only the presentation layer.

## Open Questions
- Should the table column headers be renamed or re‑ordered for better clarity?
- Do you want the expandable panels to be open by default for the first category?

## Proposed Changes

### [MODIFY] [AlternativesTable.jsx](file:///C:/Users/ASUS/Desktop/Material%20specification/frontend/src/components/Dashboard/AlternativesTable.jsx)
- Import `GlassCard` and replace the outer `<section>` with `<GlassCard className="dashboard-section alternatives-table">`.
- Wrap each accordion panel in a styled `<div>` with a hover effect and CSS transition for the collapse/expand animation.
- Remove any emoji references (none currently, but ensure no stray characters).
- Use consistent heading styling (`h2` with `var(--text-primary)`).
- Update inline styles to use the design system variables (`var(--bg-light)`, `var(--card-border)`).
- Add a small margin/padding to match other sections.

### [MODIFY] [dashboard.css] (or appropriate CSS file)
- Add styles for `.alternatives-table .accordion-header` (cursor pointer, flex layout, color variables).
- Add transition for `.accordion-content` height change using `max-height` trick.
- Ensure the glass‑card has `backdrop-filter: blur(14px)` and subtle border.
- Define hover shadow for accordion panels.

## Verification Plan
### Automated Tests
- Run `npm run dev` and ensure the page compiles without errors.
- Verify the `AlternativesTable` renders inside a glass card and accordion expands/collapses.

### Manual Verification
- Open the dashboard in the browser and check the visual consistency with other sections (KPI grid, Blueprint panel, Materials Gallery).
- Confirm no emojis appear in the Alternative Materials header.
- Ensure the table columns are readable and aligned.

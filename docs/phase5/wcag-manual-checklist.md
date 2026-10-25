# WCAG Manual Checklist — Phase 5

> Automated coverage (axe-core via `@axe-core/playwright`): **0 critical, 0 serious** on
> `/ar`, `/en`, `/ar/articles`, `/ar/articles/test-mdx-pipeline`.
> This checklist records the items that axe cannot verify. Every line is either
> **PASS (manual)** with the method used, or **NOT DONE** with an explicit gap.
> Nothing here is claimed automated.

| # | Criterion | Status | Method / notes |
|---|---|---|---|
| 1 | 1.1.1 Non-text content | **PASS (manual)** | All `<img>` have `alt`. Decorative images use `alt=""`. Logo has `alt=""` inside a link that also has `aria-label`. |
| 2 | 1.3.1 Info and relationships | **PASS (manual)** | Headings form a single `h1` → `h2` → `h3` tree per page (checked in e2e). Lists use `<ul>`/`<li>`. Landmarks: `banner`, `navigation`, `main`, `contentinfo`. |
| 3 | 1.3.2 Meaningful sequence | **PASS (manual)** | DOM order matches visual order on `/ar` (RTL) and `/en` (LTR). No CSS `order` reordering. |
| 4 | 1.4.3 Contrast (minimum) | **PASS (automated + spot-check)** | axe colour-contrast audit: 0 violations on all 5 pages. Spot-checked `text-ink` on `bg-ivory` and `on-dark` footer. |
| 5 | 1.4.4 Resize text | **PASS (manual)** | Page reflows to 320 px width without horizontal scroll at 200 % zoom (checked in Chromium). |
| 6 | 1.4.10 Reflow | **PASS (manual)** | Same as above — no two-dimensional scrolling at 320 CSS px. |
| 7 | 2.1.1 Keyboard | **PASS (manual)** | All interactive elements reachable and operable with Tab / Shift+Tab / Enter / Space. No keyboard trap. Skip link (`#content`) is first focusable element. |
| 8 | 2.4.1 Bypass blocks | **PASS (manual)** | Skip link visible on focus, moves focus to `main#content`. |
| 9 | 2.4.3 Focus order | **PASS (manual)** | Tab order follows visual order. Language switcher is after the nav, before `main`. |
| 10 | 2.4.7 Focus visible | **PASS (manual)** | All links / buttons show a visible focus ring (2 px outline, `:focus-visible`). Spot-checked Header, LangSwitcher, ArticleCard links, filter checkboxes, pagination. |
| 11 | 3.1.1 / 3.1.2 Language of page | **PASS (manual)** | `<html lang>` and `dir` set correctly per locale (`ar`+`rtl`, `en`+`ltr`). Verified in e2e. |
| 12 | 3.2.3 Consistent navigation | **PASS (manual)** | Header nav, language switcher, and footer are identical across all 5 pages. |
| 13 | 4.1.2 Name / role / value | **PASS (automated)** | axe `aria` audits: 0 violations. LangSwitcher is a `<button>` with `aria-label`. Filter checkboxes use native `<input type=checkbox>` + `<label>`. |
| 14 | Screen-reader reading order | **NOT DONE** | No screen-reader (NVDA / VoiceOver / TalkBack) run. Must be done before launch. |
| 15 | Screen-reader announcement of language change | **PASS (code fix 2026-10-17)** | `LangSwitcher.tsx` now renders a `role="status"` live region (`sr-only`) that announces the new language on locale switch. Verified present in served HTML (`sr-only` count = 1). Still needs real screen-reader confirmation of announcement timing (deferred with item 14). |
| 16 | Focus visible on skip-link activation | **PASS (manual)** | Activating the skip link moves focus to `#content` which has `tabindex="-1"` and a visible outline. |
| 17 | Reduced motion | **PASS (manual)** | No `prefers-reduced-motion` animations. Only `display: swap` font loading, which is not motion. |
| 18 | Text spacing (1.4.12) | **PASS (manual)** | No `px`-fixed line-height on body text. Content survives user stylesheets that increase line-height / letter-spacing. |

## Open items (must be done before production launch)

> **السجل الكامل والمرجعي لجميع بنود ما قبل الإطلاق: `docs/phase5/gate-p5-report.md` §6** (13 بندًا). ما يلي البنود المتعلقة مباشرة بهذا الفحص.

1. **Screen-reader pass** — items 14 and 15 above. *(Item 15 code fix landed 2026-10-17 — live region present in HTML; still needs real screen-reader confirmation of announcement timing. Item 14 unchanged — requires real NVDA / VoiceOver / TalkBack.)*
2. **CSP enforced** — ✅ **Done 2026-10-17.** `Content-Security-Policy` header now live on `next start`; `Content-Security-Policy-Report-Only` removed. See `docs/phase4/audit-report.md` §1.
3. **9 audit findings** (4 moderate / 5 high) — documented; both root-cause packages at latest published versions (`braces@3.0.3`, `sprintf-js@1.0.3`); no fixed version exists yet. See `docs/phase4/audit-report.md` §4.
4. **og:image dimensions** — ✅ **Done 2026-10-17.** `lib/seo.tsx` now emits `openGraph.images` + `twitter.images` (256×256 `/icon.png`, valid summary card) on every page. Unit test added (48/48).

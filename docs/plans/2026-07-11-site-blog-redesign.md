# Site and Blog Redesign

## Goal

Turn sebmonty.link from a dense link-in-bio dashboard into a clear personal publication and project hub. The first screen should establish who Seb is, make the latest research impossible to miss, and provide direct routes to his work and trusted links.

## Audience

- Crypto-native readers looking for practical research.
- Potential partners and clients evaluating Seb's work.
- Existing followers looking for the latest article, project, or referral link.

## References

- The supplied `robostrategy-bot-solana-reference.html` is the visual and interaction source of truth for article reading, figures, lightbox behavior, and Sources.
- The existing Seb Montgomery assets, project cards, Sanity dataset, and site content remain the source of truth for brand and content.
- The local UI/UX playbook informed hierarchy, navigation, responsive behavior, and accessibility.
- Mobbin research was skipped because the supplied reference and live project context already answer the relevant design questions.

## Design Requirements

1. Use one warm-paper editorial system across the homepage and blog: cream canvas, dark ink, coral accent, serif headlines, and restrained borders.
2. Replace the viewport-locked bento dashboard with a normal, scrollable information hierarchy.
3. Keep one primary action in the hero: read the latest research. Projects and social links remain visible but quieter.
4. Feature the latest article twice: in primary navigation and as a large editorial card on the homepage.
5. Group projects separately from referrals so professional proof and affiliate links do not compete.
6. Treat article images as content: preserve natural aspect ratios, captions, credits, keyboard focus, and click-to-enlarge behavior.
7. Put all source groups inside a native, collapsed `details` disclosure that remains available without JavaScript.
8. Keep Sanity as the single CMS. The public site should not introduce a second editorial backend.
9. Keep the publishing workflow simple: Studio manages posts; the website automatically features the latest flagged post.
10. Preserve visible affiliate disclosure and avoid hype-heavy visual treatment around financial content.

## Component Rules

- Header: brand, Home, Writing, Work, Search, Subscribe. Active state uses both weight and an underline.
- Buttons: solid dark primary, bordered secondary, at least 44px high, action-specific labels.
- Cards: one level of containment, stable image ratios, no nested wobble/3D effects.
- Figures: entire image is a `button` with a zoom cursor and visible hover/focus affordance.
- Lightbox: modal semantics, close/previous/next controls, Escape and arrow keys, scroll lock, focus restoration, loading/error states.
- Sources: native `details/summary`, collapsed by default, grouped headings and links, printable in full.

## Responsive and Accessibility Checks

- 375px, 768px, and 1440px layouts must have no horizontal overflow.
- Navigation must remain usable at 375px without hiding the Writing route.
- All interactive controls must be keyboard accessible with visible focus.
- Article text should remain between roughly 60 and 75 characters per line.
- Reduced-motion preferences disable decorative transforms and transitions.
- Lightbox must close with Escape and restore focus to the originating image.

## Acceptance Criteria

- `/` clearly features the RoboStrategy article and links to `/blog` in the first viewport.
- `/blog` presents featured research before archive controls.
- `/blog/robostrategy-bot-solana` preserves the full Sanity article, natural image geometry, clean captions, and collapsed Sources.
- Clicking any article or hero image opens a bounded full-screen viewer with gallery navigation.
- `pnpm typecheck` and `pnpm build` pass without ignored TypeScript errors.
- Desktop and mobile browser checks pass for navigation, image enlargement, Sources, and overflow.

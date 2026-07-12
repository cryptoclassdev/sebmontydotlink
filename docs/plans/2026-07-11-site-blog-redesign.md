# Site and Blog Redesign

## Goal

Integrate a first-class publication into the complete SebMonty.link experience without replacing the established bento homepage, project cards, referral directory, waitlist flow, motion, or responsive layouts. The latest research should be easy to find while the full personal hub remains intact.

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

1. Preserve the existing dark bento homepage as the primary SebMonty.link experience.
2. Preserve the private-group waitlist, social links, project cards, referral links, motion, 3D interactions, and mobile ordering.
3. Keep the homepage's private-group waitlist as the dominant conversion action.
4. Feature the latest article through the profile's Blog icon and a prominent image-backed research card in the right-hand bento column.
5. Place the featured research card immediately after the profile on mobile so the blog is discoverable before project and referral lists.
6. Treat article images as content: preserve natural aspect ratios, captions, credits, keyboard focus, and click-to-enlarge behavior.
7. Put all source groups inside a native, collapsed `details` disclosure that remains available without JavaScript.
8. Keep Sanity as the single CMS. The public site should not introduce a second editorial backend.
9. Keep the publishing workflow simple: Studio manages posts; the website automatically features the latest flagged post.
10. Preserve visible affiliate disclosure and avoid hype-heavy visual treatment around financial content.

## Component Rules

- Homepage: retain the existing bento composition and interaction model; integrate writing as a native card rather than adding a second page shell.
- Blog header: brand, Home, Writing, Work, Search, Subscribe. Active state uses both weight and an underline.
- Buttons: solid dark primary, bordered secondary, at least 44px high, action-specific labels.
- Blog cards: one level of containment and stable image ratios. Homepage cards continue using the established 3D and wobble treatments.
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

- `/` retains the full SebMonty.link bento homepage, its waitlist modal, projects, referrals, and social links while clearly featuring RoboStrategy and `/blog` in the first viewport.
- `/blog` presents featured research before archive controls.
- `/blog/robostrategy-bot-solana` preserves the full Sanity article, natural image geometry, clean captions, and collapsed Sources.
- Clicking any article or hero image opens a bounded full-screen viewer with gallery navigation.
- `pnpm typecheck` and `pnpm build` pass without ignored TypeScript errors.
- Desktop and mobile browser checks pass for navigation, image enlargement, Sources, and overflow.

# Responsive and caching verification

Checked on 2026-11-01 against a production build served locally.

- Requested viewport widths: 320, 390, 768, 1024, and 1440 pixels. Browser zoom reduced some effective CSS widths further (down to 277 pixels).
- Checked landing, dashboard, consent, questionnaire, completed results, reflection, all self-care activities, support resources/crisis, evaluation, research privacy, and researcher login. Both English and longer Filipino content were included.
- Checked 60 page/viewport combinations, then corrected and rechecked the long Filipino result/reflection buttons that overflowed at the narrowest width. No horizontal overflow remained in those checks.
- Mobile/tablet menu: open/close, Escape, outside click, route selection, hidden locked results, and transition back to desktop navigation passed.
- A local synthetic screening completed all 21 items. Refreshing on question 7 retained the selected answer and current position. Results remained available across page/language changes. No research submission or AI generation was requested. Test browser data was cleared through End session.
- WebP source bytes decreased from 8,184,602 to 1,213,416 (85%). All 19 supplied images remain represented; Apple touch compatibility uses a separate resized PNG.
- HTTP checks confirmed content-hashed WebP assets and optimized images have immutable cache headers. Export responses use private/no-store, including errors. Cross-origin reflection requests remain rejected; anonymous researcher queries/exports remain denied.
- Unit tests (17), lint, TypeScript/production build, and frontend credential-bundle checks passed.

These are representative browser checks, not a claim to have tested every physical device or every browser version. Research approval items remain in the pilot checklist.

## Navigation flash correction

Public routes now share the `(public)` layout. The header remains mounted between landing, dashboard, and feature pages, and page content no longer has an empty page-level Suspense fallback. Partial prerendering was subsequently removed because its empty app shell could still be exposed while URL-dependent content resolved. The public layout now waits for the request and renders complete routes without an empty loading boundary. Complete-route prefetching and immutable asset caching remain in place. The background is anchored to the viewport rather than each page's content height.

Production-preview browser checks covered landing → dashboard, dashboard → contact, contact → self-care, self-care → breathing, and language changes. Repeated read-only DOM samples during transitions retained one visible header and populated main content; the old screen remained present until the destination was ready. Mobile menu links, desktop navigation, and preserved activity query parameters were checked. No participant records or AI requests were created.

A subsequent review also moved session hydration into one root provider, so new feature components consume the already-hydrated session instead of returning an empty initial snapshot on each mount. Breathing/grounding no longer wait for unrelated saved-session state. This follow-up passed lint, production build, and 18 tests, including server-markup privacy isolation. Live browser access was disabled in Work settings before this final provider follow-up, so its final runtime checks were limited to HTTP routes and compiled output rather than another browser frame capture.

The final complete-rendering build was verified with `npm run test:navigation` against six public routes. Each HTTP response contained its header and main markup without an empty streaming shell. Live protected-route, origin, and security-header checks also passed. Browser control became disabled in Work settings before a final visual rerun, so the prior browser samples above predate the final rendering-mode change.

## Admin workspace (2026-11-02)

A separate dev preview was tested using development-only QA staff credentials. The header/profile controls, custom date popover, date filtering, empty states, profile update, reset layout, and reset cancellation were checked. Requested widths: 320/390/768/1024/1440. At narrow widths, header navigation and records scroll inside their containers; the page itself does not overflow. Screenshots use synthetic development data. No password changes or data resets were executed.

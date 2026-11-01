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

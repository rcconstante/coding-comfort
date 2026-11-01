# Pilot readiness

## Software changes

- Replaced the legacy Hopeline destination with the user's supplied Facebook page. No new phone numbers were inferred from Facebook; automated access to that page is restricted.
- Removed the visible contact-check date.
- Replaced model-authored prose with a strict finite-selection contract and application-owned bilingual wording. The two diagnostic examples from the audit cannot enter new model responses; legacy cache parsing also rejects both phrases.
- Scheduled, duplicate-safe generation and browser-private encrypted recovery fix full reloads during generation. Encrypted delivery expires after 24 hours, while one-way request markers prevent later duplicate generation.
- Added a private server gate, network/global/participant rate limits, bounded request bodies, security headers, same-origin checks, generic error pages, and production dependency cleanup.
- Current deployment instructions and screenshots are in README. Historical audit findings describe the previous revision and are not current unresolved software findings.

## Required study-owner sign-off before real participant recruitment

- [ ] Research/nursing team approves supplied Filipino questionnaire wording, especially items 4, 6, and 14. Preserve the original until approved changes are versioned.
- [ ] Study owner approves the screening, optional AI, research, and feedback consent wording and intended participant population.
- [ ] Study owner records retention duration, data-removal procedure, authorized researcher list, and handling of participant requests.
- [ ] Team reviews all application-owned supportive wording and confirms it is appropriate for the pilot. Technical safety boundaries are not a substitute for clinical/content review.
- [ ] Team checks actual support-channel availability and the supplied Hopeline page before recruitment. No test calls or messages were sent automatically.
- [ ] Deploy to HTTPS, set the three Vercel variables from README, replace temporary administrator passwords, and run an authenticated export test on the intended host.
- [ ] Use development deployment/synthetic data for rehearsals; do not populate production with fictitious participants.

These are real approval tasks. They cannot be completed by generating a checked checkbox or claiming that a software test provides approval.

## Dependency review

Production dependencies are checked with `npm audit --omit=dev`. The old ExcelJS/archiver/glob/uuid chain was removed in favor of a typed writer. The remaining moderate advisories reported by the full development audit concern minimatch within the ESLint/TypeScript lint toolchain; they are not shipped as production dependencies. npm's suggested forced downgrade would break the pinned Next.js lint setup, so it was not applied. Recheck upstream fixes regularly.

## Operating limits

Public endpoints remain anonymous; no system can promise that one browser token equals one person. Global model caps bound spend, server/network gates reduce abuse, and hashed-token limits protect research writes. A determined distributed denial-of-service attack still requires host-level mitigation. Native Vercel forwarding is assumed; do not put an unreviewed external reverse proxy in front of the application. Keep deployment-owner credentials separate from frontend runtime variables.

## Self-care UI follow-up

The duration selector uses Radix Select with a styled trigger and keyboard-accessible options. Breathing guidance is centered. Consent checkmarks use Hugeicons rather than text glyphs. Journaling and the small-step planner now show a local-data self-care introduction instead of DASS-specific consent copy; they require no questionnaire completion. A bilingual privacy policy is linked from the public footer and consent screen.

Validation: 19 tests, lint, production build, six navigation-response checks, bilingual privacy/combobox markup checks, protected-route checks, and zero production dependency advisories. The local-draft regression confirms journal/planner data persists without screening results. Browser control was disabled in Work settings, so final visual/device and keyboard interaction checks for the new dropdown still need a manual rehearsal. These checks do not replace the study-owner sign-offs above.

## Plain-language data notice

English and Filipino notices now explicitly identify Philippine academic use. The database location appears separately as Virginia, United States, based on the configured production region. Research and feedback notices list their own submitted fields instead of repeating a confusing country statement. The policy explains local storage, optional sharing, staff downloads, the encrypted AI recovery copy, request records, and the absence of an automatic research-record deletion period. No ethics approval, Philippine-only hosting, complete anonymity, or guaranteed data safety is claimed. Study owners still need to approve and supply their retention policy.

## Maintenance review

The codebase guide documents the existing public/admin/API/UI/domain/backend boundaries. Maintained source has consistent formatting, unused-local/parameter checks, and a single `npm run check` command covering frontend/backend types, lint, and all 19 tests. Self-care consent translations are stored with the other bilingual copy; stale translation fields were removed. Generated bindings, credentials, binaries, and ignored scratch files remain outside formatting and application typechecking. No UI flow or questionnaire wording changed in this cleanup.

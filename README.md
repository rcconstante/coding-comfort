# Coding Comfort

A bilingual (English/Filipino) DASS-21 screening and self-care platform with an authenticated researcher dashboard, Convex storage, website evaluations, and Excel exports.

## Local setup

```sh
npm ci
```

Copy `.env.example` to `.env.local` and configure the intended deployment. The example contains public deployment addresses only. Then run:

```sh
npm run dev
```

For isolated development, select the existing project with `npx convex dev --configure existing --team richmond-constante --project coding-comfort --dev-deployment cloud`. This updates `.env.local` to your development deployment. Do not use production for test participant data.

## Public screens

- `/`: landing page; Start opens the four-card `/dashboard`.
- `/screening`: consent, introduction, version-pinned 21-question DASS-21, and separate subscale scoring.
- `/results`: scores, severity categories, Excel-research submission status, and an optional feedback invitation.
- `/reflection`: score summary, recommendations, and referral guidance.
- `/self-care`: breathing, grounding, local journal, and small-step planner.
- `/support` and `/contact`: support directory and the official team email.
- `/evaluation`: optional website evaluation, with explicit feedback consent and a skip option.

Language changes preserve answers, the questionnaire version, and journal drafts. All 19 supplied illustrations are used.

## Researcher access

The unlisted entry point is `/admin/login`. It is intentionally absent from public navigation. Knowledge of the URL does not grant access.

- **Researchers:** view summary counts, paginated screening responses and feedback, and download date-filtered `.xlsx` exports.
- **Administrators:** additionally create/manage researcher accounts and publish approved English/Filipino questionnaire wording as immutable versions.
- Every research query/export checks authentication, active access, role, and the first-login password-change requirement on the backend.
- Public sign-up is disabled. Passwords are hashed by Convex Auth. Temporary passwords must be replaced before research data is available. Disabling an account immediately blocks protected backend operations.

See [research operations](docs/research-operations.md) for account provisioning, password recovery, deployment, and data-handling details.

## Consent and data

Screening answers, results, journals, small-step plans, feedback drafts, and AI reflections persist in browser `localStorage`. Existing tab sessions migrate automatically. No participant account is needed. Optional research consent allows the 21 screening responses, separately computed scores, questionnaire version, language, timestamp, and pseudonymous session code to be saved in Convex. Journals are never uploaded. Feedback has separate consent and does not attach journal text or screening answers.

End session clears local data, including feedback drafts and AI reflections. It does not delete already-consented research submissions. Participant counts represent consenting browser sessions, not verified unique people.

## Gemini reflection

With separate AI consent, the public reflection action sends only the three doubled scores to Gemini 3.1 Flash-Lite. The backend derives each severity independently. One structured response includes English and Filipino explanations, one or two self-care steps, referral guidance, and a further explanation. Follow-up controls reuse that response.

Configure `GEMINI_API_KEY` as a **Convex environment secret**, never a `NEXT_PUBLIC_` variable. The key is not stored in browser storage or source code. Atomic hashed-session claims prevent concurrent/replayed requests. There are no automatic model retries, including on failures. A new screening or explicitly ended session starts a new request allowance. The response is stored only in the browser; Convex stores the one-way session hash and request time, not the AI text or scores. Basic shared limits cap model requests at 20/minute and 500/day.

Keep the page open until generation finishes. Reloading during generation can lose the in-flight response; it deliberately does not start another model call. Saved reflections survive reloads and language switches. If local storage is unavailable, generation is disabled. Research-storage consent remains separate from AI consent.

See [PDF feature alignment](docs/pdf-feature-alignment.md) for the source-guide review and the explicitly requested Gemini substitution for Claude.

## Validation

```sh
npm test
npm run build
```

Tests cover questionnaire scoring, every severity threshold, response validation, feedback validation, account/password rules, spreadsheet formula escaping, and immutable questionnaire snapshot shape.

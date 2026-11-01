# Research operations

## Deployments

- Production: `expert-mastiff-800` (`https://expert-mastiff-800.convex.cloud`).
- Development: use the existing `coding-comfort` project's personal cloud development deployment.
- Frontend hosting must set `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` to the desired deployment before building. Convex deploys backend functions; it does not host the Next.js frontend.

Deploy backend code with `npm run convex:deploy`. Convex refuses incompatible schema changes by default; do not disable schema validation to bypass migration failures.

## Authentication setup and recovery

`node scripts/configure-auth.mjs prod` creates signing keys only when none exist and preserves existing key pairs. Private keys are piped directly to Convex and never written to source files.

`node scripts/provision-researcher.mjs` accepts a JSON object on stdin with `account`, `password`, and optionally `deployment` (defaults to `prod`) or `reset: true`. Obtain credentials from a private input or secret manager; never place them in shell arguments, public files, commits, or logs. The helper pipes one-time setup credentials to Convex, calls an internal-only function, and removes setup variables afterward. Provisioning requires Convex deployment-owner credentials; it is not a public registration endpoint.

A provisioned administrator or newly created researcher must replace the temporary password before protected data queries and exports are permitted. Password recovery is performed by the deployment operator using the same helper with `reset: true`; this invalidates existing sessions and requires another first-login password change. Public reset email is not advertised because an email delivery service is not configured.

Convex Auth manages login, hashed credentials, refresh/session cookies, and short-lived access tokens. Session lifetime is eight hours, inactivity is limited to one hour, and access tokens last fifteen minutes. Sign-in failures are rate-limited. Researchers cannot grant themselves administrator rights.

## Data model and access

- `participants`: hash of a random browser-session token, consent version, and consent timestamp. The raw participant token is not stored or exported.
- `screenings`: immutable submission key, original questionnaire version, 21 numeric responses, independently computed subscales, locale, consent version, and server timestamp.
- `evaluations`: three website-experience ratings (1–5), optional plain-text comment, consent version, locale, pseudonymous participant link, and server timestamp.
- `statistics`: transactional aggregate counts and severity distributions for efficient dashboards.
- `researchers`: authenticated user, role, active flag, and mandatory-password-change flag.
- `instruments`: immutable published English/Filipino wording and response options. A separate pointer identifies the current version.
- `auditLog`: account-access, password-change, and questionnaire-publishing events. Passwords and participant answers are not included in audit events.

Participant submissions require the explicit current consent version and are idempotent for a participant/submission key. Basic submission throttling protects the public write endpoint. Public clients can read questionnaire wording, but cannot list participants, screenings, feedback, account roles, or statistics.

## Consent, retention, and study review

The interface discloses Convex's selected region (US East, N. Virginia), submitted fields, researcher/Excel use, and retention until removal by the research team. Local-session clearing does not remove research submissions. The team must establish its approved retention/removal procedures before recruiting participants. No complete-anonymity or emergency-monitoring promise is made.

Journal text remains in the browser. Nothing is sent to Claude. AI-generated reflections require a separate real integration and its corresponding consent.

## Questionnaire editing

The initial `dass21-pdf-v1` exactly preserves the supplied Filipino instrument wording. Editing cannot change the 21-item order, four response values, subscale assignments, or scoring thresholds. Publishing requires explicit researcher approval. Existing responses and exports retain their original version; screening sessions pin the wording when they begin.

Research-team verification of the provided translation remains necessary, particularly the supplied wording in items 4, 6, and 14. UI screenshots use different wording for question 7; the supplied PDF is the initial source of truth.

## Excel exports

Authenticated exports are private/no-store. Screening workbooks include the 21 item values, raw and doubled scores for all three subscales, severity categories, consent/version provenance, and a questionnaire dictionary for the exported versions. Evaluation workbooks include only the website ratings and comment. Free-text values are escaped against spreadsheet formula interpretation.

Date filters use Philippine time (UTC+8), and exported timestamps are explicit UTC. Exports use cursor pagination with a fixed end timestamp and are limited to 20,000 rows and 100 questionnaire versions per file; use smaller date ranges for larger studies.

## Verification record

Unit tests and production builds pass. End-to-end checks on the development deployment cover unauthenticated access rejection, mandatory password changes, researcher/admin boundaries, server-side scoring, consent validation, duplicate prevention, feedback capture, question-version retention, cookie login, and authenticated XLSX parsing/formula escaping. Synthetic data belongs only to development.

# Codebase guide

## Boundaries

| Location | Responsibility |
| --- | --- |
| `app/(public)` | Landing, dashboard, and participant route entry points; persistent header/footer layout |
| `app/admin` | Unlisted researcher routes and authentication layout |
| `app/api` | Server-only reflection gate and authenticated Excel export |
| `app/ui/experience` | Participant screening, results, reflection, self-care, consent, feedback, and privacy UI |
| `app/ui` | Shared controls, navigation, providers, and researcher UI |
| `app/lib` | Typed scoring, validation, bilingual copy, browser stores, and encryption |
| `convex` | Validated database functions, permissions, authentication, versioned instruments, and scheduled AI work |
| `convex/_generated` | Generated API bindings; regenerate with Convex rather than editing |
| `public` | Supplied WebP illustrations and compatible Apple touch icon |
| `tests` | Domain, safety, encryption, privacy, and persistence regression tests |
| `scripts` | Auth setup, internal staff provisioning, and live navigation checks |
| `docs` | Current operating guides, pilot checklist, verification evidence, and historical audits |

Keep UI components separate from deterministic scoring and server permissions. Participant local state belongs in the shared session store. Research reads and writes must enforce backend access/consent checks; hiding navigation is not authorization. Language copy belongs in typed dictionaries in `app/lib`, with English and Filipino kept in sync. Keep the provided questionnaire text/versioning unchanged unless the research team approves an update.

## Routine checks

- `npm run format` applies consistent formatting to maintained source and config files.
- `npm run check` checks formatting, frontend/backend types, lint, and unit tests.
- `npm run build` verifies the production Next.js bundle.
- With the production server running, `npm run test:navigation` checks complete public HTML and absence of empty streaming shells.
- `npm audit --omit=dev` checks shipped dependency advisories.

Generated code, credentials, binary assets, build output, and ignored working files are excluded from formatting. `tmp` is ignored and excluded from the TypeScript application project. It is not a source or deployment input. Do not commit local environment files or test credentials.

Current pilot prerequisites are in `pilot-readiness.md`. The dated feature audit documents an earlier revision; it is not the current release checklist. Deployment variables are documented in the root README. Runtime data and secrets are not part of this guide.

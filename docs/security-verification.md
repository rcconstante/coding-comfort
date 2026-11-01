# Targeted security and release verification

This is an implementation-focused verification record, not a claim of an exhaustive penetration test or clinical approval.

- 17 unit tests pass, including both reproduced diagnostic phrases, finite-selection rejection, trusted bilingual composition across score patterns, RSA/AES recovery, wrong-key/tampering rejection, and invalid calendar dates.
- Lint and the optimized Next.js build pass.
- Live production integration rejects requests without the server gate and cross-origin API writes; concurrent requests create one scheduled job. Encrypted recovery returns the same response on repeat and decrypts with the original browser key.
- Browser testing completed all 21 synthetic answers without research upload, generated a reflection, performed a full reload during generation, recovered the result, and changed language without starting another model generation. Screenshots contain synthetic data.
- Header checks confirm framing protection, CSP, nosniff, and removal of framework branding. Private exports reject unauthenticated requests.
- New XLSX writer output was inspected as a ZIP/XML workbook: multiple worksheets, numeric scores, and no executable formula cells for formula-leading untrusted strings.
- Production dependency audit reports zero vulnerabilities at verification time. Full development audit still reports moderate minimatch/lint-tool advisories; no unsafe forced major overrides were added.
- Source/frontend bundles are checked for accidental credentials before push. Keys remain in ignored local environment files or backend environment settings.

Remaining limits: local storage is not a vault; anonymous network/session limits are not verified identity; host-level denial-of-service protection remains necessary; study-owner translation/consent/retention/content approval must be recorded before recruitment. See pilot-readiness.md.

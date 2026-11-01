# Implementation notes

Requirements originate in `Coding-Comfort..pdf`, the supplied visual references, and the later request for a Convex-backed researcher/admin area, evaluations, exports, and administrator-managed question versions.

The platform preserves the requested purple design, Inter typography, top navigation, and all 19 supplied PNG assets. Larger text sizes and identical header grid areas keep the logo and language selector anchored across landing and main screens.

The initial 21 Filipino statements and four response options match the PDF exactly. The seven-item depression, anxiety, and stress assignments and doubled-score thresholds are deterministic and validated. No combined clinical score is calculated. Subsequent approved wording edits are versioned and never rewrite previous submissions.

Consent precedes screening and journal input. Optional research consent controls remote screening storage, and evaluation consent is separate. Journals remain local. The user's later Gemini request replaces the PDF's named Claude provider. Separate AI consent sends only three scores to Gemini; a structured bilingual explanation is cached in local storage. A one-way session marker enforces at most one provider attempt per screening session, including failures. Scoring and deterministic guidance remain separate from AI.

The researcher area is unlisted but authenticated; hiding its URL is not the access-control mechanism. Active roles and first-login password changes are enforced by Convex on every protected operation. See `research-operations.md` for deployment and study-data details.

Support phone data was checked through the helpline connector on 2026-11-01. Unverified hotline numbers/hours are not shown. Re-verify external resource availability before participant deployment.

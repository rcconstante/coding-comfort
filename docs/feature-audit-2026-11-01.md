# Coding Comfort — PDF feature audit

**Remediation update:** the historical Hopeline, AI prose-filter, and interrupted-generation findings have been addressed. See [pilot readiness](pilot-readiness.md) and README for the current implementation and remaining study-owner approvals.

Date: 2026-11-01 (Asia/Shanghai). Application revision: `7d32444388f43458b501a17c7bf4fa014e1e0b91`.

**Verdict: not fully compliant yet.** Two high-priority failures remain: an unsafe external support link and incomplete enforcement of the AI non-diagnosis rule. The main screening/scoring flow passes. Study approval and translation review are separate unresolved release conditions. Application code was not changed during this audit.

The source is the complete 13-page `Coding-Comfort..pdf`, checked against source code, the production questionnaire configuration, browser behavior, existing same-revision end-to-end evidence, fresh unit/lint/build results, and current external-resource checks. “Pass” means the specified implementation was found and relevant checks passed; it is not a clinical certification or a guarantee of every possible AI output.

## Findings requiring action

### F1 — High: Hopeline's “Official website” link opens unrelated gambling content

- PDF condition: page 12 requires reliable support resources and verification of current official contact information before deployment.
- Source: `app/lib/support-resources.ts:15`; `app/ui/experience/support.tsx` renders the configured destination as “Official website.”
- Verification: opening the configured `ngf-mindstrong.com` destination on the audit date returned a page titled **“SLOTO89: JANGAN KLIK! Rahasia Link Slot Gacor Terbaru Hari Ini”**, with gambling login/register links. This is an observation of the destination content; it does not establish who currently controls the domain.
- Impact: someone looking for mental-health help can be sent to an unrelated gambling destination. The “current details unverified” note does not make this outbound link safe.
- Required correction: disable this destination until a current official Hopeline channel has been verified. Retain the organization entry without inventing contact details. Do not reuse the old URL based on historical ownership.
- Other checks: [In Touch's official site](https://in-touch.org/) currently presents its mental-health services. The NCMH helpline connector was queried again; the direct Facebook fetch was throttled, so that page was not independently verified through the web fetch. No calls were placed.

### F2 — High: the AI response filter accepts explicit diagnostic claims

- PDF conditions: pages 9–10 prohibit diagnosis and independent clinical decisions, including in Filipino.
- Source: `app/lib/reflection.ts:17` and `app/lib/reflection.ts:30`; `convex/reflection.ts:177` uses this parser as the final response check before returning generated text.
- Controlled probe: complete, structurally valid bilingual responses containing either **“You are suffering from depression.”** or **“Mayroon kang depresyon.”** were accepted. `hasUnsafeReflectionClaim()` returned `false` and `parseReflectionContent()` returned a non-null response for both.
- Impact: if the model produces either prohibited statement, the application can display it. The prompt correctly forbids diagnosis and the visible disclaimer is present, but neither makes the accepted diagnostic statement compliant.
- Scope of evidence: these were local parser probes, not observations that the live model generated these statements. The prior live low/mixed/high-score samples do not establish coverage of every prohibited claim.
- Required correction: cover the reproduced English/Filipino cases, expand adversarial regression coverage for diagnosis, medication instructions, certainty, future prediction, and low-score reassurance, and retain a safe non-generative fallback when validation fails. Do not introduce extra automatic model calls in violation of the one-request requirement. A phrase filter alone cannot certify clinical safety.

### L1 — Known limitation: reloading during generation can permanently lose that response

- Sources: `app/ui/experience/gemini-reflection.tsx:56`, `app/lib/use-session.ts:180`, and `app/lib/reflection-copy.ts:10`.
- The browser stores `pending` before requesting a reflection. Only the original page's promise writes the completed response locally. There is no response-recovery endpoint or server-side response cache.
- A full reload during generation can leave the browser showing the pending/interrupted message indefinitely, even after the backend request finishes. The session cannot request another generation.
- This preserves the later one-attempt limit and is disclosed. It is a usability limitation, not a duplicate-request failure or a missing PDF-mandated recovery feature. Completed reflections do survive reloads.

### A1 — Research-team approval still required

- PDF page 5 explicitly requires research-team verification of supplied Filipino wording before actual participant deployment. Supplied items 4, 6, and 14 remain flagged in `docs/research-operations.md:43`. The application preserves them; it should not silently rewrite them.
- Approved consent, data-retention/removal procedures, and clinical interpretation are not established by passing software tests. `docs/research-operations.md:35` explicitly leaves retention/removal procedures to the study team.
- This audit found no approval artifact establishing that those conditions are complete. That is an unresolved release condition, not proof that approval does not exist elsewhere.

## Requirement-by-requirement checklist

### Global requirements and landing — PDF pages 1–3

| Condition                                                            | Status             | Evidence / qualification                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DASS-21 is the only standardized mental-health screening             | Pass               | `app/lib/dass.ts`; website feedback is explicitly a separate UX evaluation.                                                                                       |
| Screening, AI explanation, referral/human-judgment guidance exist    | Partial            | All three components exist; AI prohibition enforcement fails F2.                                                                                                  |
| Journal/self-care remain separate from the instrument                | Pass               | `self-care.tsx`; journal/planner never contribute to scores.                                                                                                      |
| Home, screening, results, self-care, support destinations            | Pass               | `site-chrome.tsx`, route whitelist, feature cards. Landing uses the later requested minimal Home/Start navigation.                                                |
| English/Filipino toggle and centralized dictionaries                 | Pass               | `copy.ts`, `features.ts`, `experience-copy.ts`, `research-copy.ts`, `reflection-copy.ts`.                                                                         |
| Language changes preserve answers, journal, and progress             | Pass               | Same-revision browser checks preserved question position, answers, saved reflection, and journal. Fresh audit check preserved grounding step 3/5 across EN → FIL. |
| Natural Filipino and exact supplied instrument wording               | Partial / approval | Exact questionnaire wording passes; naturalness/clinical translation approval remains A1.                                                                         |
| Landing title, tagline, introductory paragraph, screening disclaimer | Pass               | `copy.ts` and `app/page.tsx`; English source copy matches the guide.                                                                                              |
| Four feature cards; screening most prominent                         | Pass               | Four defined sections and the distinct primary screening card.                                                                                                    |
| All card destinations functional; results locked until completion    | Pass               | Browser after declining consent showed the result card disabled; `ResultsNavLink` also locks navigation.                                                          |
| Supplied branding/assets retained                                    | Pass               | All 19 PNG assets have source references, including logo/favicon. This is a later user requirement.                                                               |

### Consent and privacy — PDF page 3

| Condition                                                          | Status          | Evidence / qualification                                                                                                        |
| ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| “Before We Begin” appears before screening/journal collection      | Pass            | `consent.tsx`, `Screening`, and journal/planner guard in `SelfCare`.                                                            |
| Voluntary participation and stopping at any time                   | Pass            | Both language dictionaries; stop and End session controls.                                                                      |
| Research prototype, screening not diagnosis, not emergency service | Pass            | Consent items in both languages.                                                                                                |
| AI processing and avoiding identifying free text explained         | Pass            | Consent items; separate AI permission and journal warning.                                                                      |
| Required consent checkbox; Continue disabled until checked         | Pass            | Fresh browser audit: `continueDisabled: true` before consent.                                                                   |
| Declining does not collect questionnaire/journal entries           | Pass            | Fresh journal audit had zero textboxes before consent; Decline returned to locked-results home.                                 |
| Transmitted AI fields and recipient disclosed                      | Pass            | “What is shared?” identifies three scores and Google's AI service; individual answers/journal excluded.                         |
| Research fields/storage disclosed                                  | Pass            | Optional disclosure lists responses, scores, version, language, date, code, storage country, and retention/removal information. |
| Separate optional research, AI, and feedback permission            | Pass            | Independent controls and backend consent-version checks.                                                                        |
| No unsupported promise of complete anonymity/confidentiality       | Pass            | Participant codes and local/remote storage described without such a promise.                                                    |
| Approved retention/secondary-use procedures                        | Approval needed | A1; implementation disclosure is not an approved study procedure.                                                               |

### DASS-21 introduction and questions — PDF pages 4–6

| Condition                                                                | Status          | Evidence / qualification                                                                |
| ------------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------- |
| Introduction describes 21-item self-report and separate emotional states | Pass            | `experience-copy.ts`, intro content.                                                    |
| Past-week timeframe, actual experiences, no right/wrong answers          | Pass            | Intro bullets and question instructions in both languages.                              |
| Four options, non-diagnostic nature, 3–5-minute estimate                 | Pass            | Intro bullets.                                                                          |
| Exact supplied Filipino questions, order, and options                    | Pass            | Fresh comparison: all 21 statements and four options match the PDF extraction.          |
| Live deployed instrument matches the baseline                            | Pass            | Fresh public query returned `dass21-pdf-v1`; both languages and options matched source. |
| Corresponding English response scale, unchanged 0–3 values               | Pass            | `responseOptions.en` and radio values.                                                  |
| One question with title, number, statement, four large choices           | Pass            | `screening.tsx`; prior browser questionnaire completion on this revision.               |
| Previous/Next, selected state, answer required                           | Pass            | Disabled Next without an answer; answer state stored independently of position.         |
| Responses preserved backward and across language changes                 | Pass            | Shared session answers and existing browser evidence.                                   |
| Question count, bar, and Sun Arc indicator                               | Pass            | `question-position`, progressbar ARIA values, `sun-arc`.                                |
| Supplied wording issues flagged rather than silently rewritten           | Pass / approval | Flags retained; A1 before recruitment.                                                  |

### Scoring and result screen — PDF pages 7–8

| Condition                                                               | Status | Evidence / qualification                                                                                                                                             |
| ----------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Depression items 3,5,10,13,16,17,21                                     | Pass   | Scoring module and isolated-item tests.                                                                                                                              |
| Anxiety items 2,4,7,9,15,19,20                                          | Pass   | Scoring module and isolated-item tests.                                                                                                                              |
| Stress items 1,6,8,11,12,14,18                                          | Pass   | Scoring module and isolated-item tests.                                                                                                                              |
| Seven items each; raw 0–21; multiply by two; final 0–42                 | Pass   | Minimum/maximum tests and score table.                                                                                                                               |
| All five severity categories and each supplied boundary                 | Pass   | All subscale boundary tests passed.                                                                                                                                  |
| No overall score or cross-subscale category substitution                | Pass   | Separate `Results` fields; no clinical sum.                                                                                                                          |
| Validated deterministic calculation; all 21 answers required            | Pass   | Client validated module; consented research submissions recomputed server-side. Invalid lengths, holes, nulls, strings, fractions, and out-of-range values rejected. |
| Three result cards: name, final score, severity, indicator, explanation | Pass   | `results.tsx`, `<meter>`, localized text.                                                                                                                            |
| Full non-diagnostic results disclaimer in both languages                | Pass   | `resultsDisclaimer`.                                                                                                                                                 |
| Understand results, support, self-care, home buttons                    | Pass   | Functional routes; same-revision browser checks.                                                                                                                     |

### AI explanations and follow-ups — PDF pages 8–9

| Condition                                                              | Status                             | Evidence / qualification                                                                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Explain each separate subscale simply and its symptom range            | Partial                            | Fields and prompt exist; real samples passed. Arbitrary output is not independently verified for semantic/score consistency.              |
| Patterns supported by actual responses; no invented life circumstances | Partial                            | Only three derived scores sent; prompt forbids individual-answer/cause/life-event assumptions. Free text still depends on model behavior. |
| Explain separate but potentially related experiences                   | Pass in sampled output             | Prompt and live mixed/high-score examples include this; not a semantic guarantee for every response.                                      |
| Supportive, nonjudgmental, personalized rather than one generic answer | Pass in sampled output             | Different low/mixed/high score patterns produced different explanations.                                                                  |
| One or two realistic low-risk self-care steps                          | Pass in sampled output / structure | Parser enforces 1–2 bounded steps; prompt constrains content. Clinical appropriateness still needs review.                                |
| Professional assessment/referral when indicated                        | Partial                            | Deterministic support page covers every severity; AI referral wording relies on prompt compliance.                                        |
| Selected language supported without extra model calls                  | Pass                               | One bilingual response; completed reflection survived reload and EN/FIL switching.                                                        |
| No diagnosis or clinical certainty                                     | Fail                               | F2 demonstrates accepted diagnostic phrases; certainty rules also rely partly on prompting.                                               |
| No prescribing or stopping treatment                                   | Partial                            | Prompt and limited phrase checks; no comprehensive medication/clinical content validation.                                                |
| No independent clinical decisions or future-condition prediction       | Partial                            | No clinical action integration; generated text remains only partially constrained.                                                        |
| Never infer mental health/no need for help from low scores             | Partial                            | Prompt tightened and several reassurance phrases blocked; full semantic rule is not certified.                                            |
| Do not replace professionals; informational/supportive notice          | Pass                               | Always-visible reflection disclaimer and oversight notice.                                                                                |
| Explain My Results Further                                             | Pass                               | Expands cached explanation and deterministic score details.                                                                               |
| Suggest a Small Next Step                                              | Pass                               | Opens cached 1–2-step recommendation content without another generation.                                                                  |
| Recommend Where I Can Seek Help                                        | Pass                               | Opens severity-specific professional-support route.                                                                                       |
| Try a Calming Exercise                                                 | Pass                               | Opens interactive breathing exercise.                                                                                                     |
| Finish Reflection and limited follow-up exchanges                      | Pass                               | Returns to four-card home; no open-ended chatbot/new follow-up requests.                                                                  |
| AI separated from original scoring                                     | Pass                               | AI has no score-writing path; calculator and displayed score/category remain deterministic.                                               |

### Referral and human oversight — PDF page 10

| Condition                                                              | Status                                | Evidence / qualification                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Normal: self-care, support remains available at any score              | Pass                                  | Deterministic `recommendationNormal` on support route.                                                     |
| Mild: self-care and trusted-person/support information                 | Pass                                  | `recommendationMild`.                                                                                      |
| Moderate: consider professional consultation, persistence/daily impact | Pass                                  | `recommendationModerate`.                                                                                  |
| Severe: strongly encourage timely professional assessment              | Pass                                  | `recommendationSevere`.                                                                                    |
| Extremely severe: prioritize timely evaluation, accessible support     | Pass for guidance; directory fails F1 | `recommendationExtreme` and support navigation.                                                            |
| Not mandatory triage; normal scores do not exclude help                | Pass                                  | Deterministic text and prompt.                                                                             |
| No automatic immediate-danger classification from a score              | Pass structurally                     | No such rule/action; emergency screen is user-selected. Generated claims remain subject to F2 limitations. |
| Diagnosis/treatment/clinical decisions reserved for professionals      | Pass notice / partial AI enforcement  | Oversight copy; F2 prevents full sign-off on generated text.                                               |
| No completed-referral/contact promise                                  | Pass structurally                     | Explicit notice; no provider-contact or referral-completion integration.                                   |

### Self-care — PDF pages 11–12

| Condition                                                         | Status                    | Evidence / qualification                                                                                                        |
| ----------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Slowly expanding/contracting breathing circle                     | Pass                      | 8-second CSS animation, four-second instruction phases.                                                                         |
| Start, pause, resume, restart, exit                               | Pass                      | Functional handlers and same-revision browser check.                                                                            |
| Adjustable duration                                               | Pass                      | 1/2/3/5-minute options and reset behavior.                                                                                      |
| Comfortable breathing instruction in EN/FIL                       | Pass                      | Central dictionary; no forced-breathing instruction.                                                                            |
| Reduced-motion preference honored                                 | Pass by source inspection | `prefers-reduced-motion` disables breathing animation and transitions. OS preference emulation was not rerun during this audit. |
| No claim breathing resolves all concerns                          | Pass                      | Explicit limited self-care note.                                                                                                |
| Guided 5-see / 4-feel / 3-hear / 2-smell / 1-taste-if-comfortable | Pass                      | Both dictionaries and five-step component; previous completion check.                                                           |
| Self-paced grounding, translated instructions                     | Pass                      | Previous/Next; fresh language test retained step 3/5.                                                                           |
| Seven specified small actions and custom action                   | Pass                      | Exact preset list; bounded custom field.                                                                                        |
| Completion without guilt, streaks, competition, shaming           | Pass                      | Simple completion screen only; no streak/notification system.                                                                   |
| Journal separated from screening and kept local                   | Pass                      | Consent guard, local session journal, no journal field in AI/research submission payload.                                       |

### Support directory and contact — PDF pages 12–13

| Condition                                                               | Status                            | Evidence / qualification                                                                                 |
| ----------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| NCMH, Hopeline, In Touch entries                                        | Pass existence / Fail reliability | Three entries exist; Hopeline destination fails F1.                                                      |
| Reliable official contact destinations verified before deployment       | Fail                              | F1; unverified legacy website was still labeled official.                                                |
| No invented numbers/hours/availability                                  | Pass by configuration             | Only connector-provided NCMH phone/hours shown; other numbers omitted.                                   |
| Name, phone/hours/call options/site when verified                       | Partial                           | NCMH configured; others remain incomplete, and Hopeline link must not be used. No real calls/SMS tested. |
| Seeking professional help and trusted-person conversation suggestions   | Pass                              | `professionalSteps` in both languages.                                                                   |
| When support may be useful                                              | Pass                              | Persistence, concern, daily functioning, support available at any score.                                 |
| Prominent I Need Help Now control                                       | Pass                              | Main support page links to crisis screen.                                                                |
| Immediate danger: local emergency services/nearest emergency department | Pass                              | Crisis copy; no automatic danger classification.                                                         |
| No emergency monitoring/automatic intervention promise                  | Pass                              | Explicit disclaimer and no integration performing such actions.                                          |
| Dedicated team contact section and requested title/description          | Pass                              | `/contact` and support contact strip.                                                                    |
| Exact team email displayed; Send Us an Email opens mail client          | Pass by href inspection           | Both anchors use `mailto:codingcomfort.team@gmail.com`; no external email was sent.                      |

## Later user requirements and intentional differences

- Gemini replaces the guide's named Claude provider at the user's explicit request; this is not a missing-feature finding.
- The separate landing → Start → four-card flow, purple scheme, floating top navigation, Inter, and supplied branding follow the later UI instructions.
- The guide enumerates four cards but later says “all five cards.” Four cards plus the five requested navigation destinations implement the consistent explicit lists; no fifth feature was invented.
- Some displayed titles follow the supplied screenshots (for example “My Results”) instead of the guide's longer title. These are presentation differences, not missing result functionality.
- Researcher login, roles, questionnaire editing, exports, and evaluation were later additions, not mandatory PDF features. Same-revision integration evidence exists; this audit reran anonymous research-read rejection and checked the deployed question version. It did not create production participants, change credentials, publish questions, or send feedback.
- Local storage and one AI attempt per completed screening follow later instructions. A fresh production repeat request using an already-used test key was rejected with `REFLECTION_ALREADY_REQUESTED`, without a new model generation. L1 is the remaining interruption limitation.

## Validation record

- All **14 existing tests passed**, including scoring boundaries, individual item assignments, basic AI filter cases, bilingual response shape, consent-copy labels, feedback/account validation, and spreadsheet escaping.
- `npm run lint` and `npm run build` passed on the audited revision.
- Fresh exact comparison passed for all 21 supplied Filipino statements and four options. Production's current instrument also matched both language dictionaries/options exactly.
- Fresh browser checks: consent required before journal input, Decline returns to home with results locked, grounding progress survives language switching.
- Same-revision prior browser/integration evidence: full questionnaire, backward/language/reload persistence, saved AI response reuse, five follow-up controls, breathing controls, grounding completion, journal/planner/feedback draft persistence, clear-session behavior, actual XLSX parsing, and administrator/researcher boundaries.
- Two additional local negative probes exposed F2 despite the existing green suite. Existing tests therefore do **not** justify a blanket “all PDF requirements pass” claim.
- Current external checks exposed F1. External availability is time-sensitive and must be rechecked before recruitment.

## Release decision

Use controlled internal testing only. Correct F1 and F2, rerun their negative regressions and the affected user flows, and obtain the outstanding study/translation approvals before declaring full participant readiness. This report supersedes any earlier broad statement that everything already meets the PDF.

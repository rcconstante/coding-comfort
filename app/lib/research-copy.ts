import type { Locale } from "./copy";
const en = {
  researchOptIn:
    "I agree to share my 21 answers and scores for research, using a participant code instead of my name.",
  researchDetails:
    "If you agree to share your screening, the study team receives your 21 answers, three scores, question version, language, date, and participant code. The app does not ask for your name. Your journal is not included. Clearing this browser does not remove records already sent to the team.",
  researchPrivacyTitle: "Privacy details",
  privacyChoiceTitle: "Your choice",
  privacyChoice:
    "You can use the screening without sharing your responses with the research team.",
  privacyRecords: "Research records",
  privacyRemovalTitle: "Questions or removal requests",
  privacyRemoval:
    "Contact the team with the participant code shown after saving.",
  privacyContact: "Contact the team",
  shareResearch: "Share with the research team (optional)",
  saving: "Saving your consented screening…",
  saved: "Saved for research",
  saveError:
    "Your results are still in this browser, but were not saved for research. Please try again.",
  retry: "Try again",
  participantCode: "Participant code",
  saveConsent: "Agree and save my screening for research",
  evaluate: "Share Feedback",
  evaluationTitle: "How was your experience?",
  evaluationIntro:
    "Help the research team understand how the site works for you. This optional form is about the website, not a mental health assessment.",
  evaluationConsent:
    "I agree to share my ratings and optional comment with the research team.",
  evaluationDetails:
    "If you submit feedback, the study team receives your ratings, optional comment, language, date, and participant code. Do not include names or contact details. The feedback submission does not include your journal or screening answers.",
  comment: "Anything you would like us to improve? (optional)",
  submit: "Submit Feedback",
  submitting: "Submitting…",
  skip: "Skip for now",
  thanks: "Thank you for sharing your feedback",
  thanksBody: "Your feedback has been received by the research team.",
  feedbackError: "Your feedback could not be saved. Please try again.",
  ratingLow: "1 · Very poor",
  ratingHigh: "5 · Excellent",
  required:
    "Please rate all three questions and agree to the feedback consent before submitting.",
  instrumentLoading: "Loading the current questionnaire…",
  instrumentError: "The questionnaire could not be loaded. Please try again.",
  home: "Return to Home",
};
const fil: typeof en = {
  researchOptIn:
    "Pumapayag akong ibahagi ang 21 sagot at score ko para sa pananaliksik, gamit ang participant code sa halip na pangalan.",
  researchDetails:
    "Kung papayag kang ibahagi ang screening, matatanggap ng study team ang 21 sagot, tatlong score, bersyon ng mga tanong, wika, petsa, at participant code. Hindi hinihingi ng app ang pangalan mo. Hindi kasama ang journal. Hindi nabubura ang naipadalang tala kapag binura ang datos sa browser.",
  researchPrivacyTitle: "Detalye sa privacy",
  privacyChoiceTitle: "Ikaw ang magpapasya",
  privacyChoice:
    "Maaari mong gamitin ang screening nang hindi nagbabahagi ng mga sagot sa research team.",
  privacyRecords: "Mga tala sa pananaliksik",
  privacyRemovalTitle: "Mga tanong o kahilingan sa pagbura",
  privacyRemoval:
    "Kontakin ang team at ibigay ang participant code na ipinapakita pagkatapos mag-save.",
  privacyContact: "Kontakin ang team",
  shareResearch: "Ibahagi sa research team (opsyonal)",
  saving: "Sine-save ang screening na pinayagan mo…",
  saved: "Na-save para sa pananaliksik",
  saveError:
    "Nasa browser pa ang iyong mga resulta, pero hindi ito na-save para sa pananaliksik. Pakisubukang muli.",
  retry: "Subukang muli",
  participantCode: "Participant code",
  saveConsent: "Pumayag at i-save ang screening para sa pananaliksik",
  evaluate: "Magbigay ng Feedback",
  evaluationTitle: "Kumusta ang iyong karanasan?",
  evaluationIntro:
    "Tulungan ang research team na maunawaan ang karanasan mo sa site. Opsyonal ang form na ito at tungkol ito sa website, hindi pagsusuri sa kalusugang pangkaisipan.",
  evaluationConsent:
    "Pumapayag akong ibahagi sa research team ang mga rating at opsyonal na komento ko.",
  evaluationDetails:
    "Kung magpapadala ka ng feedback, matatanggap ng study team ang mga rating, opsyonal na komento, wika, petsa, at participant code. Huwag magsama ng pangalan o contact details. Hindi kasama sa feedback ang journal o mga sagot sa screening.",
  comment: "Ano ang maaari pa naming pagbutihin? (opsyonal)",
  submit: "Ipadala ang Feedback",
  submitting: "Ipinapadala…",
  skip: "Laktawan muna",
  thanks: "Salamat sa iyong feedback",
  thanksBody: "Natanggap na ng research team ang iyong feedback.",
  feedbackError: "Hindi na-save ang iyong feedback. Pakisubukang muli.",
  ratingLow: "1 · Hindi maganda",
  ratingHigh: "5 · Napakaganda",
  required:
    "I-rate ang tatlong tanong at pumayag muna sa feedback consent bago ipadala.",
  instrumentLoading: "Binubuksan ang kasalukuyang questionnaire…",
  instrumentError: "Hindi mabuksan ang questionnaire. Pakisubukang muli.",
  home: "Bumalik sa Home",
};
export const researchCopy: Record<Locale, typeof en> = { en, fil };

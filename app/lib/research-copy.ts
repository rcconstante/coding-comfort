import type { Locale } from "./copy";
const en = {
  researchOptIn:
    "I also agree to share my screening answers and scores with the research team. This is optional.",
  researchDetails:
    "The research team receives your 21 answers, three scores, questionnaire version, language, date, and a participant code instead of your name. Records are stored in the United States until the team removes them. Your journal is never shared. Ending this session does not delete submitted records; contact the team with your participant code about removal.",
  researchPrivacyTitle: "What will researchers receive?",
  shareResearch: "Share with the research team (optional)",
  saving: "Saving your consented screening…",
  saved: "Saved for research",
  saveError:
    "Your results are safe in this browser, but could not be saved for research. Please try again.",
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
    "Your ratings, comment, language, date, and participant code are saved for research in the United States until the team removes them. Do not include names or contact details. Your journal and screening answers are not included.",
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
    "Pumapayag din akong ibahagi sa research team ang mga sagot at score ko. Opsyonal ito.",
  researchDetails:
    "Matatanggap ng research team ang 21 sagot, tatlong score, bersyon ng questionnaire, wika, petsa, at participant code sa halip na pangalan. Nakaimbak ito sa United States hanggang alisin ng team. Hindi ibinabahagi ang journal. Hindi nabubura ang naipadalang tala kapag tinapos ang session; kontakin ang team gamit ang participant code tungkol sa pagbura nito.",
  researchPrivacyTitle: "Ano ang matatanggap ng researcher?",
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
    "Naka-save para sa research sa United States ang mga rating, komento, wika, petsa, at participant code hanggang alisin ng team. Huwag magsama ng pangalan o contact details. Hindi kasama ang journal o mga sagot sa screening.",
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

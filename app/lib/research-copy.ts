import type { Locale } from "./copy";
const en = {
  researchOptIn:
    "I also agree to save my screening responses and scores to Convex for researcher review and Excel analysis. This is optional.",
  researchDetails:
    "Research submissions include the 21 responses, three subscale scores, questionnaire version, language, date, and a pseudonymous participant code. They are stored in Convex (US East, N. Virginia) until removed by the research team. Journal entries are never uploaded. Ending this browser session does not delete research submissions. Contact the team with your participant code about your research data.",
  saving: "Saving your consented screening…",
  saved: "Saved for research",
  saveError:
    "Your results are safe in this browser, but could not be saved for research. Please try again.",
  retry: "Try again",
  participantCode: "Participant code",
  researchNotSaved: "Your screening has not been shared with researchers.",
  saveConsent: "Agree and save my screening for research",
  evaluate: "Share Feedback",
  evaluationTitle: "How was your experience?",
  evaluationIntro:
    "Help the research team understand how the site works for you. This optional form is about the website, not a mental health assessment.",
  evaluationConsent:
    "I agree to send these ratings, my optional comment, language, date, and a pseudonymous participant code to the research team in Convex for evaluation and Excel analysis.",
  evaluationDetails:
    "Feedback is stored in Convex (US East, N. Virginia) until removed by the research team. Do not include names, contact details, or other identifying information. Your journal and screening answers are not attached to this form.",
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
    "Pumapayag din akong ipadala sa Convex ang aking mga sagot at score para masuri ng mga researcher at maisama sa Excel analysis. Opsyonal ito.",
  researchDetails:
    "Kasama sa research submission ang 21 sagot, tatlong subscale score, bersyon ng questionnaire, wika, petsa, at participant code na hindi gumagamit ng pangalan. Nakaimbak ito sa Convex (US East, N. Virginia) hanggang alisin ng research team. Hindi ina-upload ang journal. Hindi nabubura ang research submission kapag tinapos ang browser session. Kontakin ang team gamit ang participant code kung may tanong tungkol sa iyong datos.",
  saving: "Sine-save ang screening na pinayagan mo…",
  saved: "Na-save para sa pananaliksik",
  saveError:
    "Nasa browser pa ang iyong mga resulta, pero hindi ito na-save para sa pananaliksik. Pakisubukang muli.",
  retry: "Subukang muli",
  participantCode: "Participant code",
  researchNotSaved:
    "Hindi pa naibabahagi sa mga researcher ang iyong screening.",
  saveConsent: "Pumayag at i-save ang screening para sa pananaliksik",
  evaluate: "Magbigay ng Feedback",
  evaluationTitle: "Kumusta ang iyong karanasan?",
  evaluationIntro:
    "Tulungan ang research team na maunawaan ang karanasan mo sa site. Opsyonal ang form na ito at tungkol ito sa website, hindi pagsusuri sa kalusugang pangkaisipan.",
  evaluationConsent:
    "Pumapayag akong ipadala sa research team sa Convex ang mga rating, opsyonal na komento, wika, petsa, at participant code para sa evaluation at Excel analysis.",
  evaluationDetails:
    "Nakaimbak ang feedback sa Convex (US East, N. Virginia) hanggang alisin ng research team. Huwag magsama ng pangalan, kontak, o impormasyong makakakilala sa iyo. Hindi kasama rito ang iyong journal o mga sagot sa screening.",
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

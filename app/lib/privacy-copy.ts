import type { Locale } from "./copy";

type PrivacyText = {
  title: string;
  intro: string;
  localTitle: string;
  local: string;
  locationTitle: string;
  location: string;
  aiTitle: string;
  ai: string;
  accessTitle: string;
  access: string;
  feedbackTitle: string;
};

export const privacyCopy: Record<Locale, PrivacyText> = {
  en: {
    title: "Privacy Policy",
    intro:
      "Coding Comfort is an academic research project for use in the Philippines. This page explains what stays in your browser and what is sent only with your permission.",
    localTitle: "What stays in your browser",
    local:
      "Your answers, scores, journal, chosen step, feedback draft, and saved reflection stay in this browser after a refresh. No participant account is needed. Use End session or clear browser data to remove them. Someone using the same browser profile may see this information.",
    locationTitle: "Where submitted records are stored",
    location:
      "The study is for use in the Philippines. Its current online database is hosted in Virginia, United States. This is the server location, not the location or purpose of the study. Submitted records are not deleted automatically after a set period. Contact the study team about its retention period or to request removal.",
    aiTitle: "If you choose an AI explanation",
    ai: "With separate permission, your three scores and their score ranges are sent to Google’s AI service. Your individual answers and journal are not sent. The app keeps an encrypted copy of the explanation for up to 24 hours so this browser can recover it after a refresh. A record that the request was made remains to prevent another request for the same screening. Google has its own rules for handling information sent to its service.",
    accessTitle: "Who can access submitted records",
    access:
      "Authorized study staff can view and download records you agree to submit for academic analysis. Staff accounts require sign-in. The site uses browser storage, sign-in cookies for staff, and request limits to reduce misuse. Hosting services may keep technical request logs. Avoid including names or contact details in free-text entries. Clearing your local session does not delete submitted study records.",
    feedbackTitle: "If you submit feedback",
  },
  fil: {
    title: "Patakaran sa Privacy",
    intro:
      "Ang Coding Comfort ay isang proyektong pang-akademikong pananaliksik para sa paggamit sa Pilipinas. Ipinapaliwanag dito kung ano ang nananatili sa browser at kung ano ang ipinapadala lamang sa pahintulot mo.",
    localTitle: "Ano ang nananatili sa browser",
    local:
      "Nananatili sa browser ang mga sagot, score, journal, napiling hakbang, draft ng feedback, at naka-save na reflection kahit mag-refresh. Walang account na kailangan. Gamitin ang End session o burahin ang browser data upang alisin ang mga ito. Maaaring makita ito ng ibang gumagamit ng parehong browser profile.",
    locationTitle: "Saan nakaimbak ang mga naipadalang tala",
    location:
      "Para sa paggamit sa Pilipinas ang pag-aaral. Ang kasalukuyang online database nito ay nasa Virginia, United States. Lokasyon ito ng server, hindi ng pag-aaral o layunin nito. Walang awtomatikong pagbura ng mga naipadalang tala pagkalipas ng takdang panahon. Kontakin ang study team tungkol sa panahon ng pag-iimbak o upang humiling ng pagbura.",
    aiTitle: "Kung pipili ka ng paliwanag ng AI",
    ai: "Sa hiwalay mong pahintulot, ipinapadala sa AI service ng Google ang tatlong score at kani-kanilang saklaw. Hindi ipinapadala ang bawat sagot o journal. May naka-encrypt na kopya ng paliwanag nang hanggang 24 oras upang maibalik ito ng browser matapos mag-refresh. Nananatili ang tala na humiling ka na upang maiwasan ang panibagong request para sa parehong screening. May sariling mga patakaran ang Google sa paghawak ng impormasyong ipinapadala sa serbisyo nito.",
    accessTitle: "Sino ang makakakita ng mga naipadalang tala",
    access:
      "Maaaring tingnan at i-download ng awtorisadong study staff ang mga talang pinayagan mong isumite para sa akademikong pagsusuri. Kailangang mag-sign in ang staff. Gumagamit ang site ng browser storage, sign-in cookies para sa staff, at limitasyon sa mga request upang mabawasan ang maling paggamit. Maaaring magtago ang hosting services ng teknikal na request logs. Huwag magsama ng pangalan o contact details sa mga isinusulat. Hindi nabubura ang naipadalang tala kapag tinapos ang lokal na session.",
    feedbackTitle: "Kung magpapadala ka ng feedback",
  },
};

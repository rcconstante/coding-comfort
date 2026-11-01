import type { Locale } from "./copy";

export const sections = [
  "screening",
  "results",
  "self-care",
  "support",
] as const;
export type Section = (typeof sections)[number];
type Feature = { title: string; description: string; action: string };
type Features = {
  explore: string;
  screeningNav: string;
  resultsNav: string;
  selfCareNav: string;
  supportNav: string;
  cards: Record<Section, Feature>;
};

export const featureCopy: Record<Locale, Features> = {
  en: {
    explore: "Explore What’s Here for You",
    screeningNav: "DASS-21 Screening",
    resultsNav: "My Results",
    selfCareNav: "Self-Care",
    supportNav: "Support",
    cards: {
      screening: {
        title: "DASS-21 Mental Health Screening",
        description:
          "Take a standardized 21-item questionnaire to reflect on experiences related to depression, anxiety, and stress over the past week.",
        action: "Start DASS-21",
      },
      results: {
        title: "Understand My Results",
        description:
          "Receive an easy-to-understand explanation of your DASS-21 results and explore appropriate next steps.",
        action: "Understand My Results",
      },
      "self-care": {
        title: "Self-Care Corner",
        description:
          "Explore breathing exercises, grounding activities, guided journaling, and small self-care steps.",
        action: "Explore Self-Care",
      },
      support: {
        title: "Mental Health Support",
        description:
          "Find reliable support resources, referral guidance, and information about seeking professional assistance.",
        action: "Find Support",
      },
    },
  },
  fil: {
    explore: "Tuklasin ang mga Para sa Iyo",
    screeningNav: "DASS-21 Screening",
    resultsNav: "Mga Resulta Ko",
    selfCareNav: "Pangangalaga sa Sarili",
    supportNav: "Suporta",
    cards: {
      screening: {
        title: "DASS-21 Pagsusuri sa Kalusugang Pangkaisipan",
        description:
          "Sagutan ang pamantayang talatanungan na may 21 aytem upang maunawaan ang iyong mga iniulat na karanasan ng pagkabalisa, depresyon, at stress nitong nakaraang linggo.",
        action: "Simulan ang DASS-21",
      },
      results: {
        title: "Unawain ang Aking mga Resulta",
        description:
          "Unawain ang kahulugan ng iyong mga resulta sa DASS-21 at tuklasin ang angkop na mga susunod na hakbang.",
        action: "Unawain ang mga Resulta",
      },
      "self-care": {
        title: "Sulok ng Pangangalaga sa Sarili",
        description:
          "Tuklasin ang mga ehersisyo sa paghinga, mga gawaing grounding, gabay sa pagsusulat, at maliliit na hakbang sa pangangalaga sa sarili.",
        action: "Tuklasin ang Pangangalaga sa Sarili",
      },
      support: {
        title: "Suporta sa Kalusugang Pangkaisipan",
        description:
          "Maghanap ng maaasahang mga sanggunian, gabay sa referral, at impormasyon tungkol sa propesyonal na tulong.",
        action: "Humanap ng Suporta",
      },
    },
  },
};

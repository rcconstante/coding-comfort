export type Locale = "en" | "fil";
export type PageQuery = Promise<Record<string, string | string[] | undefined>>;

export function getLocale(query: Awaited<PageQuery>): Locale {
  return query.lang === "fil" ? "fil" : "en";
}

type Translation = {
  home: string;
  start: string;
  skip: string;
  language: string;
  tagline: string;
  description: string;
  characterAlt: string;
  screeningNote: string;
  disclaimer: string;
};

export const copy: Record<Locale, Translation> = {
  en: {
    home: "Home",
    start: "Start",
    skip: "Skip to content",
    language: "Choose language",
    tagline: "Your feelings matter. Take a moment for yourself.",
    description:
      "Some days feel lighter than others. Sometimes we carry worries about family, school, work, finances, relationships, and responsibilities without enough time to understand how we feel. Coding Comfort gives you a space to check in with yourself, express your feelings, and explore small steps toward emotional well-being.",
    characterAlt:
      "A smiling character in a purple sweater holding a lavender heart",
    screeningNote:
      "Coding Comfort uses the DASS-21 to help you understand your reported experiences of depression, anxiety, and stress. It also provides supportive reflections and guidance toward appropriate mental health resources. It is not a diagnostic tool.",
    disclaimer:
      "Coding Comfort supports self-reflection and emotional well-being. It is not a diagnostic tool or a replacement for professional mental health care.",
  },
  fil: {
    home: "Home",
    start: "Magsimula",
    skip: "Lumaktaw sa nilalaman",
    language: "Pumili ng wika",
    tagline: "Mahalaga ang nararamdaman mo. Maglaan ng sandali para sa sarili.",
    description:
      "May mga araw na mas magaan kaysa sa iba. Minsan, pasan natin ang mga alalahanin sa pamilya, pag-aaral, trabaho, pera, relasyon, at mga responsibilidad nang walang sapat na oras upang unawain ang ating nararamdaman. Ang Coding Comfort ay isang espasyo upang kumustahin ang sarili, ipahayag ang iyong damdamin, at tuklasin ang maliliit na hakbang tungo sa emosyonal na kagalingan.",
    characterAlt:
      "Isang nakangiting karakter na nakasuot ng lilang damit at may yakap na pusong lavender",
    screeningNote:
      "Ginagamit ng Coding Comfort ang DASS-21 upang tulungan kang maunawaan ang iyong mga iniulat na karanasan ng depresyon, pagkabalisa, at stress. Nagbibigay din ito ng mga pagninilay na may malasakit at gabay tungo sa angkop na mga mapagkukunan para sa kalusugang pangkaisipan. Hindi ito kasangkapan sa pagsusuri.",
    disclaimer:
      "Sinusuportahan ng Coding Comfort ang pagninilay at emosyonal na kagalingan. Hindi ito kasangkapan sa pagsusuri o kapalit ng propesyonal na pangangalaga sa kalusugang pangkaisipan.",
  },
};

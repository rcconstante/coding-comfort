import image0 from "../../public/ai.webp";
import image1 from "../../public/anxeity.webp";
import image2 from "../../public/breath.webp";
import image3 from "../../public/crisis.webp";
import image4 from "../../public/Dass-screening.webp";
import image5 from "../../public/depression.webp";
import image6 from "../../public/graph.webp";
import image7 from "../../public/grounding-act.webp";
import image8 from "../../public/guide-journaling.webp";
import image9 from "../../public/heart.webp";
import image10 from "../../public/help.webp";
import image11 from "../../public/leave.webp";
import image12 from "../../public/note.webp";
import image13 from "../../public/referral.webp";
import image14 from "../../public/robot.webp";
import image15 from "../../public/stress.webp";

export const illustrations = {
  ai: image0,
  anxeity: image1,
  breath: image2,
  crisis: image3,
  "Dass-screening": image4,
  depression: image5,
  graph: image6,
  "grounding-act": image7,
  "guide-journaling": image8,
  heart: image9,
  help: image10,
  leave: image11,
  note: image12,
  referral: image13,
  robot: image14,
  stress: image15,
} as const;

export type Illustration = keyof typeof illustrations;

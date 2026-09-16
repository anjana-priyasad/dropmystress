import type { ComponentType } from "react";
import AffirmationCards from "./AffirmationCards";
import BodyScan from "./BodyScan";
import BrainDump from "./BrainDump";
import BreathingPatterns from "./BreathingPatterns";
import BubbleWrap from "./BubbleWrap";
import GratitudeJar from "./GratitudeJar";
import Grounding from "./Grounding";
import JournalPrompts from "./JournalPrompts";
import MeditationTimer from "./MeditationTimer";
import MoodTracker from "./MoodTracker";
import MuscleRelaxation from "./MuscleRelaxation";
import SandGarden from "./SandGarden";
import SelfCompassion from "./SelfCompassion";
import SoundscapeMixer from "./SoundscapeMixer";
import StressBall from "./StressBall";
import StressCheck from "./StressCheck";
import StretchBreak from "./StretchBreak";
import ThoughtReframe from "./ThoughtReframe";
import UnsentLetter from "./UnsentLetter";
import WorrySorter from "./WorrySorter";

/** Keyed by the slugs in `@/lib/tools`. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  breathing: BreathingPatterns,
  "muscle-relaxation": MuscleRelaxation,
  "body-scan": BodyScan,
  "stretch-break": StretchBreak,
  "meditation-timer": MeditationTimer,
  grounding: Grounding,
  "thought-reframe": ThoughtReframe,
  "worry-sorter": WorrySorter,
  "brain-dump": BrainDump,
  "self-compassion": SelfCompassion,
  "unsent-letter": UnsentLetter,
  "gratitude-jar": GratitudeJar,
  journal: JournalPrompts,
  affirmations: AffirmationCards,
  "bubble-wrap": BubbleWrap,
  "stress-ball": StressBall,
  "sand-garden": SandGarden,
  "mood-tracker": MoodTracker,
  "stress-check": StressCheck,
  soundscapes: SoundscapeMixer,
};

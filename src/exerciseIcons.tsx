import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Weight,
  Cable,
  Hand,
  ArrowUp,
  ArrowDown,
  Footprints,
  Bike,
  Waves,
  Target,
  Flame,
  Zap,
  StretchVertical,
  StretchHorizontal,
  CircleDot,
  Activity,
  HeartPulse,
  Timer,
  MoveUp,
  MoveDown,
  ChevronUp,
  Grip,
} from "lucide-react";

// Icons for specific known exercises
const EXERCISE_ICONS: Record<string, LucideIcon> = {
  // Chest
  "Bench Press": Dumbbell,
  "Incline Dumbbell Press": Dumbbell,
  "Cable Fly": Cable,
  "Chest Press Machine": Target,
  "Push-ups": ArrowUp,

  // Back
  "Lat Pulldown": ArrowDown,
  "Seated Row": Waves,
  "Barbell Row": Weight,
  "Pull-ups": ChevronUp,
  "T-Bar Row": Weight,

  // Legs
  "Squat": MoveDown,
  "Leg Press": Zap,
  "Leg Extension": MoveUp,
  "Leg Curl": MoveDown,
  "Calf Raise": Footprints,
  "Romanian Deadlift": Weight,
  "Lunges": Footprints,

  // Shoulders
  "Overhead Press": ArrowUp,
  "Lateral Raise": StretchHorizontal,
  "Front Raise": MoveUp,
  "Face Pull": Cable,
  "Shoulder Press Machine": ArrowUp,

  // Arms
  "Bicep Curl": Hand,
  "Tricep Pushdown": ArrowDown,
  "Hammer Curl": Grip,
  "Skull Crusher": Dumbbell,
  "Preacher Curl": Hand,

  // Core
  "Plank": StretchHorizontal,
  "Cable Crunch": Cable,
  "Hanging Leg Raise": StretchVertical,

  // Cardio
  "Treadmill": Footprints,
  "Elliptical": Activity,
  "Rowing Machine": Waves,
};

// Fallback icons by muscle group
const GROUP_ICONS: Record<string, LucideIcon> = {
  Chest: Dumbbell,
  Back: Weight,
  Legs: Footprints,
  Shoulders: ArrowUp,
  Arms: Hand,
  Core: Flame,
  Cardio: HeartPulse,
  Other: CircleDot,
};

export function getExerciseIcon(name: string, muscleGroup: string): LucideIcon {
  return EXERCISE_ICONS[name] ?? GROUP_ICONS[muscleGroup] ?? CircleDot;
}

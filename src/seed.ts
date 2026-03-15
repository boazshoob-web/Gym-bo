import { db, type Exercise } from "./db";

const DEFAULT_EXERCISES: Omit<Exercise, "id">[] = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", notes: "" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbells", notes: "" },
  { name: "Cable Fly", muscleGroup: "Chest", equipment: "Cable Machine", notes: "" },
  { name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", notes: "" },
  { name: "Push-ups", muscleGroup: "Chest", equipment: "Bodyweight", notes: "" },
  // Back
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable Machine", notes: "" },
  { name: "Seated Row", muscleGroup: "Back", equipment: "Cable Machine", notes: "" },
  { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", notes: "" },
  { name: "Pull-ups", muscleGroup: "Back", equipment: "Bodyweight", notes: "" },
  { name: "T-Bar Row", muscleGroup: "Back", equipment: "Machine", notes: "" },
  // Legs
  { name: "Squat", muscleGroup: "Legs", equipment: "Barbell", notes: "" },
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", notes: "" },
  { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", notes: "" },
  { name: "Leg Curl", muscleGroup: "Legs", equipment: "Machine", notes: "" },
  { name: "Calf Raise", muscleGroup: "Legs", equipment: "Machine", notes: "" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", notes: "" },
  { name: "Lunges", muscleGroup: "Legs", equipment: "Dumbbells", notes: "" },
  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", notes: "" },
  { name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbells", notes: "" },
  { name: "Front Raise", muscleGroup: "Shoulders", equipment: "Dumbbells", notes: "" },
  { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable Machine", notes: "" },
  { name: "Shoulder Press Machine", muscleGroup: "Shoulders", equipment: "Machine", notes: "" },
  // Arms
  { name: "Bicep Curl", muscleGroup: "Arms", equipment: "Dumbbells", notes: "" },
  { name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable Machine", notes: "" },
  { name: "Hammer Curl", muscleGroup: "Arms", equipment: "Dumbbells", notes: "" },
  { name: "Skull Crusher", muscleGroup: "Arms", equipment: "EZ Bar", notes: "" },
  { name: "Preacher Curl", muscleGroup: "Arms", equipment: "Machine", notes: "" },
  // Core
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", notes: "" },
  { name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable Machine", notes: "" },
  { name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight", notes: "" },
  // Cardio
  { name: "Treadmill", muscleGroup: "Cardio", equipment: "Machine", notes: "" },
  { name: "Elliptical", muscleGroup: "Cardio", equipment: "Machine", notes: "" },
  { name: "Rowing Machine", muscleGroup: "Cardio", equipment: "Machine", notes: "" },
];

let seeded = false;

export async function seedIfEmpty() {
  if (seeded) return;
  seeded = true;

  // Deduplicate any existing exercises (fixes prior StrictMode double-seed)
  await db.transaction("rw", db.exercises, async () => {
    const all = await db.exercises.toArray();
    const seen = new Set<string>();
    const toDelete: number[] = [];
    for (const ex of all) {
      if (seen.has(ex.name)) {
        toDelete.push(ex.id!);
      } else {
        seen.add(ex.name);
      }
    }
    if (toDelete.length > 0) {
      await db.exercises.bulkDelete(toDelete);
    }

    // Seed if empty
    const count = await db.exercises.count();
    if (count === 0) {
      await db.exercises.bulkAdd(DEFAULT_EXERCISES);
    }
  });
}

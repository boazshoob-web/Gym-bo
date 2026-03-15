import Dexie, { type EntityTable } from "dexie";

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio"
  | "Other";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Other",
];

export interface Exercise {
  id?: number;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  notes: string;
}

export interface Routine {
  id?: number;
  name: string;
  exercises: RoutineExercise[];
}

export interface RoutineExercise {
  exerciseId: number;
  targetSets: number;
  targetReps: number;
}

export interface WorkoutSession {
  id?: number;
  date: string; // ISO date string
  routineId?: number;
  routineName?: string;
  startedAt: string;
  finishedAt?: string;
  notes?: string;
}

export interface WorkoutSet {
  id?: number;
  sessionId: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number; // minutes, used for cardio
  notes?: string;
}

export interface BodyWeight {
  id?: number;
  date: string;
  weight: number;
}

const db = new Dexie("GymBoDB") as Dexie & {
  exercises: EntityTable<Exercise, "id">;
  routines: EntityTable<Routine, "id">;
  sessions: EntityTable<WorkoutSession, "id">;
  sets: EntityTable<WorkoutSet, "id">;
  bodyWeights: EntityTable<BodyWeight, "id">;
};

db.version(1).stores({
  exercises: "++id, name, muscleGroup",
  routines: "++id, name",
  sessions: "++id, date, routineId",
  sets: "++id, sessionId, exerciseId",
  bodyWeights: "++id, date",
});

export { db };

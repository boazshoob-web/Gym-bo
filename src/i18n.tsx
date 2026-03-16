import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "he";

const translations = {
  // Navigation
  "nav.workout": { en: "Workout", he: "אימון" },
  "nav.exercises": { en: "Exercises", he: "תרגילים" },
  "nav.routines": { en: "Routines", he: "שגרות" },
  "nav.history": { en: "History", he: "היסטוריה" },
  "nav.progress": { en: "Progress", he: "התקדמות" },

  // Workout page
  "workout.readyToTrain": { en: "Ready to train?", he: "?מוכן להתאמן" },
  "workout.startDesc": { en: "Start a workout from a routine or build one as you go.", he: "התחל אימון משגרה או בנה אחד תוך כדי." },
  "workout.startFromRoutine": { en: "Start from Routine", he: "התחל משגרה" },
  "workout.emptyWorkout": { en: "Empty Workout", he: "אימון ריק" },
  "workout.pickRoutine": { en: "Pick a Routine", he: "בחר שגרה" },
  "workout.exercises": { en: "exercises", he: "תרגילים" },
  "workout.setsDone": { en: "sets done", he: "סטים הושלמו" },
  "workout.done": { en: "Done", he: "הושלם" },
  "workout.notDone": { en: "Not done", he: "לא הושלם" },
  "workout.sets": { en: "sets", he: "סטים" },
  "workout.min": { en: "min", he: "דק׳" },
  "workout.set": { en: "Set", he: "סט" },
  "workout.previous": { en: "Previous", he: "קודם" },
  "workout.kg": { en: "kg", he: 'ק"ג' },
  "workout.reps": { en: "Reps", he: "חזרות" },
  "workout.addSet": { en: "+ Add Set", he: "+ הוסף סט" },
  "workout.removeSet": { en: "- Remove", he: "- הסר" },
  "workout.addExercise": { en: "Add Exercise", he: "הוסף תרגיל" },
  "workout.finish": { en: "Finish", he: "סיים" },
  "workout.unknown": { en: "Unknown", he: "לא ידוע" },

  // Exercises page
  "exercises.add": { en: "Add", he: "הוסף" },
  "exercises.all": { en: "All", he: "הכל" },
  "exercises.noExercises": { en: "No exercises yet. Add one!", he: "!אין תרגילים עדיין. הוסף אחד" },
  "exercises.editExercise": { en: "Edit Exercise", he: "ערוך תרגיל" },
  "exercises.newExercise": { en: "New Exercise", he: "תרגיל חדש" },
  "exercises.name": { en: "Name", he: "שם" },
  "exercises.namePlaceholder": { en: "e.g. Bench Press", he: "לדוגמה: לחיצת חזה" },
  "exercises.muscleGroup": { en: "Muscle Group", he: "קבוצת שריר" },
  "exercises.equipment": { en: "Equipment", he: "ציוד" },
  "exercises.equipmentPlaceholder": { en: "e.g. Barbell, Machine", he: "לדוגמה: מוט, מכונה" },
  "exercises.notes": { en: "Notes", he: "הערות" },
  "exercises.notesPlaceholder": { en: "Optional notes", he: "הערות אופציונליות" },
  "exercises.saveChanges": { en: "Save Changes", he: "שמור שינויים" },
  "exercises.addExercise": { en: "Add Exercise", he: "הוסף תרגיל" },
  "exercises.deleteConfirm": { en: "Delete this exercise?", he: "?למחוק את התרגיל" },

  // Routines page
  "routines.new": { en: "New", he: "חדש" },
  "routines.noRoutines": { en: "No routines yet. Create one to pre-fill your workouts!", he: "!אין שגרות עדיין. צור אחת כדי למלא אימונים מראש" },
  "routines.editRoutine": { en: "Edit Routine", he: "ערוך שגרה" },
  "routines.newRoutine": { en: "New Routine", he: "שגרה חדשה" },
  "routines.routineName": { en: "Routine Name", he: "שם השגרה" },
  "routines.routineNamePlaceholder": { en: "e.g. Push Day", he: "לדוגמה: יום דחיפה" },
  "routines.exercises": { en: "Exercises", he: "תרגילים" },
  "routines.addExercise": { en: "Add Exercise", he: "הוסף תרגיל" },
  "routines.saveChanges": { en: "Save Changes", he: "שמור שינויים" },
  "routines.createRoutine": { en: "Create Routine", he: "צור שגרה" },
  "routines.noExercises": { en: "No exercises in this routine", he: "אין תרגילים בשגרה זו" },
  "routines.deleteConfirm": { en: "Delete this routine?", he: "?למחוק את השגרה" },

  // History page
  "history.noHistory": { en: "No workout history yet. Complete a workout to see it here.", he: ".אין היסטוריית אימונים עדיין. סיים אימון כדי לראות אותו כאן" },
  "history.freeWorkout": { en: "Free workout", he: "אימון חופשי" },
  "history.exercises": { en: "exercises", he: "תרגילים" },
  "history.min": { en: "min", he: "דק׳" },
  "history.set": { en: "Set", he: "סט" },
  "history.noSets": { en: "No sets logged", he: "לא נרשמו סטים" },
  "history.deleteConfirm": { en: "Delete this workout session?", he: "?למחוק את האימון הזה" },

  // Progress page
  "progress.exerciseWeight": { en: "Exercise Weight", he: "משקל תרגיל" },
  "progress.totalVolume": { en: "Total Volume", he: "נפח כולל" },
  "progress.exercise": { en: "Exercise", he: "תרגיל" },
  "progress.maxWeight": { en: "Max Weight (kg)", he: '(ק"ג) משקל מקסימלי' },
  "progress.noExerciseData": { en: "No data yet for this exercise. Complete some workouts first!", he: "!אין נתונים עדיין לתרגיל זה. סיים כמה אימונים קודם" },
  "progress.volumePerSession": { en: "Total Volume per Session (kg × reps)", he: "(חזרות × ק\"ג) נפח כולל לאימון" },
  "progress.noVolumeData": { en: "No data yet. Complete some workouts first!", he: "!אין נתונים עדיין. סיים כמה אימונים קודם" },

  // Muscle groups
  "muscle.Chest": { en: "Chest", he: "חזה" },
  "muscle.Back": { en: "Back", he: "גב" },
  "muscle.Legs": { en: "Legs", he: "רגליים" },
  "muscle.Shoulders": { en: "Shoulders", he: "כתפיים" },
  "muscle.Arms": { en: "Arms", he: "ידיים" },
  "muscle.Core": { en: "Core", he: "ליבה" },
  "muscle.Cardio": { en: "Cardio", he: "קרדיו" },
  "muscle.Other": { en: "Other", he: "אחר" },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  tMuscle: (muscle: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("gymbo-lang") as Lang) || "en";
  });

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("gymbo-lang", l);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  function t(key: TranslationKey): string {
    return translations[key][lang];
  }

  function tMuscle(muscle: string): string {
    const key = `muscle.${muscle}` as TranslationKey;
    if (key in translations) return translations[key][lang];
    return muscle;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tMuscle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Exercise, type Routine, type WorkoutSet } from "../db";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Select } from "../components/Input";
import { Play, Square, Plus, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { getExerciseIcon } from "../exerciseIcons";
import { useI18n } from "../i18n";

interface LiveSet {
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  duration: number; // minutes, for cardio
  done: boolean;
}

interface ExerciseBlock {
  exerciseId: number;
  sets: LiveSet[];
  collapsed: boolean;
}

export default function WorkoutPage() {
  const { t, tMuscle } = useI18n();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [pickingRoutine, setPickingRoutine] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00");

  const exercises = useLiveQuery(() => db.exercises.orderBy("name").toArray()) ?? [];
  const routines = useLiveQuery(() => db.routines.toArray()) ?? [];
  const exerciseMap = new Map(exercises.map((e) => [e.id!, e]));

  // Timer
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  // Load last weights for an exercise
  const getLastWeights = useCallback(async (exerciseId: number, numSets: number) => {
    const lastSets = await db.sets
      .where("exerciseId")
      .equals(exerciseId)
      .reverse()
      .limit(numSets)
      .sortBy("setNumber");
    return lastSets;
  }, []);

  async function startWithRoutine(routine: Routine) {
    const now = new Date();
    const id = await db.sessions.add({
      date: now.toISOString().split("T")[0],
      routineId: routine.id,
      routineName: routine.name,
      startedAt: now.toISOString(),
    });
    setSessionId(id as number);
    setStartTime(now);
    setPickingRoutine(false);

    // Build blocks pre-filled with last weights
    const newBlocks: ExerciseBlock[] = [];
    for (const re of routine.exercises) {
      const ex = exerciseMap.get(re.exerciseId);
      const isCardio = ex?.muscleGroup === "Cardio";
      const lastSets = await getLastWeights(re.exerciseId, re.targetSets);
      const sets: LiveSet[] = [];
      for (let i = 0; i < re.targetSets; i++) {
        const prev = lastSets.find((s) => s.setNumber === i + 1);
        sets.push({
          exerciseId: re.exerciseId,
          setNumber: i + 1,
          weight: prev?.weight ?? 0,
          reps: prev?.reps ?? (isCardio ? 0 : re.targetReps),
          duration: prev?.duration ?? (isCardio ? re.targetReps : 0),
          done: false,
        });
      }
      newBlocks.push({ exerciseId: re.exerciseId, sets, collapsed: false });
    }
    setBlocks(newBlocks);
  }

  async function startEmpty() {
    const now = new Date();
    const id = await db.sessions.add({
      date: now.toISOString().split("T")[0],
      startedAt: now.toISOString(),
    });
    setSessionId(id as number);
    setStartTime(now);
    setBlocks([]);
  }

  async function addExerciseToWorkout(exerciseId: number) {
    const ex = exerciseMap.get(exerciseId);
    const isCardio = ex?.muscleGroup === "Cardio";
    const lastSets = await getLastWeights(exerciseId, 3);
    const sets: LiveSet[] = [];
    const numSets = isCardio ? 1 : Math.max(3, lastSets.length);
    for (let i = 0; i < numSets; i++) {
      const prev = lastSets.find((s) => s.setNumber === i + 1);
      sets.push({
        exerciseId,
        setNumber: i + 1,
        weight: prev?.weight ?? 0,
        reps: prev?.reps ?? (isCardio ? 0 : 10),
        duration: prev?.duration ?? (isCardio ? 30 : 0),
        done: false,
      });
    }
    setBlocks([...blocks, { exerciseId, sets, collapsed: false }]);
    setAddingExercise(false);
  }

  function updateSet(blockIdx: number, setIdx: number, patch: Partial<LiveSet>) {
    setBlocks(
      blocks.map((b, bi) =>
        bi === blockIdx
          ? { ...b, sets: b.sets.map((s, si) => (si === setIdx ? { ...s, ...patch } : s)) }
          : b
      )
    );
  }

  function addSet(blockIdx: number) {
    setBlocks(
      blocks.map((b, bi) =>
        bi === blockIdx
          ? {
              ...b,
              sets: [
                ...b.sets,
                {
                  exerciseId: b.exerciseId,
                  setNumber: b.sets.length + 1,
                  weight: b.sets.at(-1)?.weight ?? 0,
                  reps: b.sets.at(-1)?.reps ?? 10,
                  duration: b.sets.at(-1)?.duration ?? 0,
                  done: false,
                },
              ],
            }
          : b
      )
    );
  }

  function removeSet(blockIdx: number, setIdx: number) {
    setBlocks(
      blocks.map((b, bi) =>
        bi === blockIdx
          ? { ...b, sets: b.sets.filter((_, si) => si !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 })) }
          : b
      )
    );
  }

  function toggleCollapse(blockIdx: number) {
    setBlocks(blocks.map((b, bi) => (bi === blockIdx ? { ...b, collapsed: !b.collapsed } : b)));
  }

  function removeBlock(blockIdx: number) {
    setBlocks(blocks.filter((_, i) => i !== blockIdx));
  }

  async function finishWorkout() {
    if (!sessionId) return;
    // Save all done sets
    const setsToSave: Omit<WorkoutSet, "id">[] = [];
    for (const block of blocks) {
      for (const s of block.sets) {
        if (s.done) {
          setsToSave.push({
            sessionId,
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            duration: s.duration || undefined,
          });
        }
      }
    }
    await db.sets.bulkAdd(setsToSave);
    await db.sessions.update(sessionId, { finishedAt: new Date().toISOString() });
    setSessionId(null);
    setBlocks([]);
    setStartTime(null);
  }

  // Not in a workout — show start options
  if (!sessionId) {
    return (
      <PageShell title={t("nav.workout")}>
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="text-6xl mb-2">&#127947;</div>
          <h2 className="text-xl font-bold">{t("workout.readyToTrain")}</h2>
          <p className="text-text-muted text-sm text-center max-w-xs">
            {t("workout.startDesc")}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            {routines.length > 0 && (
              <Button onClick={() => setPickingRoutine(true)} className="w-full flex items-center justify-center gap-2">
                <Play size={16} /> {t("workout.startFromRoutine")}
              </Button>
            )}
            <Button variant="secondary" onClick={startEmpty} className="w-full flex items-center justify-center gap-2">
              <Plus size={16} /> {t("workout.emptyWorkout")}
            </Button>
          </div>
        </div>

        <Modal open={pickingRoutine} onClose={() => setPickingRoutine(false)} title={t("workout.pickRoutine")}>
          <div className="flex flex-col gap-2">
            {routines.map((r) => (
              <button
                key={r.id}
                onClick={() => startWithRoutine(r)}
                className="bg-surface-light rounded-xl p-3 text-start hover:bg-primary/20 transition-colors"
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-text-muted">{r.exercises.length} {t("workout.exercises")}</div>
              </button>
            ))}
          </div>
        </Modal>
      </PageShell>
    );
  }

  // Active workout
  const totalDone = blocks.reduce((sum, b) => sum + b.sets.filter((s) => s.done).length, 0);
  const totalSets = blocks.reduce((sum, b) => sum + b.sets.length, 0);

  return (
    <PageShell
      title={t("nav.workout")}
      action={
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted flex items-center gap-1">
            <Clock size={14} /> {elapsed}
          </span>
          <Button variant="danger" onClick={finishWorkout} className="flex items-center gap-1">
            <Square size={14} /> {t("workout.finish")}
          </Button>
        </div>
      }
    >
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>{totalDone}/{totalSets} {t("workout.setsDone")}</span>
        </div>
        <div className="h-2 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: totalSets ? `${(totalDone / totalSets) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Exercise blocks */}
      <div className="flex flex-col gap-3">
        {blocks.map((block, bi) => {
          const ex = exerciseMap.get(block.exerciseId);
          const isCardio = ex?.muscleGroup === "Cardio";
          const doneSets = block.sets.filter((s) => s.done).length;
          return (
            <div key={bi} className="bg-surface rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => toggleCollapse(bi)}
              >
                <div className="flex items-center gap-2.5">
                  {(() => { const Icon = getExerciseIcon(ex?.name ?? "", ex?.muscleGroup ?? "Other"); return <Icon size={18} className="text-primary-light shrink-0" />; })()}
                  <div>
                    <div className="font-medium text-sm">{ex?.name ?? t("workout.unknown")}</div>
                    <div className="text-xs text-text-muted">
                      {isCardio
                        ? (doneSets > 0 ? t("workout.done") : t("workout.notDone"))
                        : `${doneSets}/${block.sets.length} ${t("workout.sets")}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(bi); }}
                    className="p-1 text-text-muted hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                  {block.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </div>

              {!block.collapsed && (
                <div className="px-3 pb-3">
                  {isCardio ? (
                    /* Cardio: single time input */
                    <div className="flex flex-col gap-2">
                      {block.sets.map((s, si) => (
                        <div
                          key={si}
                          className={`flex items-center gap-3 py-2 px-2 rounded-lg ${s.done ? "bg-success/10" : ""}`}
                        >
                          <Clock size={16} className="text-text-muted shrink-0" />
                          <input
                            type="number"
                            min={0}
                            className="bg-surface-light rounded px-3 py-1.5 text-sm w-20 text-center"
                            value={s.duration || ""}
                            onChange={(e) => updateSet(bi, si, { duration: Number(e.target.value) })}
                            placeholder="0"
                          />
                          <span className="text-xs text-text-muted">{t("workout.min")}</span>
                          <div className="flex-1" />
                          <button
                            onClick={() => updateSet(bi, si, { done: !s.done })}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                              s.done
                                ? "bg-success border-success text-white"
                                : "border-surface-light text-transparent hover:border-primary"
                            }`}
                          >
                            &#10003;
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Strength: weight × reps grid */
                    <>
                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-text-muted mb-1 px-1">
                        <span>{t("workout.set")}</span>
                        <span>{t("workout.previous")}</span>
                        <span>{t("workout.kg")}</span>
                        <span>{t("workout.reps")}</span>
                        <span className="w-6" />
                      </div>

                      {block.sets.map((s, si) => (
                        <div
                          key={si}
                          className={`grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center py-1.5 px-1 rounded-lg ${
                            s.done ? "bg-success/10" : ""
                          }`}
                        >
                          <span className="text-xs text-text-muted w-6 text-center">{s.setNumber}</span>
                          <span className="text-xs text-text-muted">—</span>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className="bg-surface-light rounded px-2 py-1 text-sm w-full text-center"
                            value={s.weight || ""}
                            onChange={(e) => updateSet(bi, si, { weight: Number(e.target.value) })}
                            placeholder="0"
                          />
                          <input
                            type="number"
                            min={0}
                            className="bg-surface-light rounded px-2 py-1 text-sm w-full text-center"
                            value={s.reps || ""}
                            onChange={(e) => updateSet(bi, si, { reps: Number(e.target.value) })}
                            placeholder="0"
                          />
                          <button
                            onClick={() => updateSet(bi, si, { done: !s.done })}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                              s.done
                                ? "bg-success border-success text-white"
                                : "border-surface-light text-transparent hover:border-primary"
                            }`}
                          >
                            &#10003;
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" onClick={() => addSet(bi)} className="text-xs flex-1">
                          {t("workout.addSet")}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => removeSet(bi, block.sets.length - 1)}
                          className="text-xs"
                          disabled={block.sets.length <= 1}
                        >
                          {t("workout.removeSet")}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add exercise */}
      <Button
        variant="secondary"
        onClick={() => setAddingExercise(true)}
        className="w-full mt-4 flex items-center justify-center gap-1"
      >
        <Plus size={16} /> {t("workout.addExercise")}
      </Button>

      <Modal open={addingExercise} onClose={() => setAddingExercise(false)} title={t("workout.addExercise")}>
        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => addExerciseToWorkout(ex.id!)}
              className="text-start p-3 rounded-lg hover:bg-surface-light transition-colors flex items-center gap-3"
            >
              {(() => { const Icon = getExerciseIcon(ex.name, ex.muscleGroup); return <Icon size={18} className="text-primary-light shrink-0" />; })()}
              <div>
                <div className="text-sm font-medium">{ex.name}</div>
                <div className="text-xs text-text-muted">{tMuscle(ex.muscleGroup)} &middot; {ex.equipment}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}

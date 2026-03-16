import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Routine, type RoutineExercise, type Exercise } from "../db";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input, { Select } from "../components/Input";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useI18n } from "../i18n";

export default function RoutinesPage() {
  const { t } = useI18n();
  const routines = useLiveQuery(() => db.routines.toArray());
  const exercises = useLiveQuery(() => db.exercises.orderBy("name").toArray());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

  async function handleDelete(id: number) {
    if (confirm(t("routines.deleteConfirm"))) {
      await db.routines.delete(id);
    }
  }

  function getEx(id: number) {
    return exercises?.find((e) => e.id === id);
  }

  return (
    <PageShell
      title={t("nav.routines")}
      action={
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-1">
          <Plus size={16} /> {t("routines.new")}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {routines?.map((r) => (
          <div key={r.id} className="bg-surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{r.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(r); setModalOpen(true); }} className="p-2 text-text-muted hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(r.id!)} className="p-2 text-text-muted hover:text-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {r.exercises.map((re, i) => {
                const ex = getEx(re.exerciseId);
                const isCardio = ex?.muscleGroup === "Cardio";
                return (
                  <div key={i} className="text-sm text-text-muted">
                    {ex?.name ?? "Unknown"} — {isCardio ? `${re.targetReps} ${t("workout.min")}` : `${re.targetSets}×${re.targetReps}`}
                  </div>
                );
              })}
              {r.exercises.length === 0 && (
                <div className="text-sm text-text-muted italic">{t("routines.noExercises")}</div>
              )}
            </div>
          </div>
        ))}
        {routines?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">
            {t("routines.noRoutines")}
          </p>
        )}
      </div>

      {exercises && (
        <RoutineModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          routine={editing}
          exercises={exercises}
        />
      )}
    </PageShell>
  );
}

function RoutineModal({
  open,
  onClose,
  routine,
  exercises,
}: {
  open: boolean;
  onClose: () => void;
  routine: Routine | null;
  exercises: Exercise[];
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [items, setItems] = useState<RoutineExercise[]>([]);

  useEffect(() => {
    if (open) {
      setName(routine?.name ?? "");
      setItems(routine?.exercises ? [...routine.exercises] : []);
    }
  }, [open, routine]);

  function addExercise() {
    if (exercises.length === 0) return;
    const first = exercises[0];
    const isCardio = first.muscleGroup === "Cardio";
    setItems([...items, {
      exerciseId: first.id!,
      targetSets: isCardio ? 1 : 3,
      targetReps: isCardio ? 30 : 10,
    }]);
  }

  function updateItem(idx: number, patch: Partial<RoutineExercise>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name.trim()) return;
    const data = { name: name.trim(), exercises: items };
    if (routine?.id) {
      await db.routines.update(routine.id, data);
    } else {
      await db.routines.add(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={routine ? t("routines.editRoutine") : t("routines.newRoutine")}>
      <div className="flex flex-col gap-3">
        <Input label={t("routines.routineName")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("routines.routineNamePlaceholder")} />

        <div className="text-xs text-text-muted font-medium mt-1">{t("routines.exercises")}</div>
        {items.map((item, idx) => {
          const ex = exercises.find((e) => e.id === item.exerciseId);
          const isCardio = ex?.muscleGroup === "Cardio";
          return (
            <div key={idx} className="flex items-center gap-2 bg-surface-light rounded-lg p-2">
              <GripVertical size={14} className="text-text-muted shrink-0" />
              <Select
                className="flex-1 min-w-0"
                value={item.exerciseId}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  const newEx = exercises.find((ex) => ex.id === newId);
                  const nowCardio = newEx?.muscleGroup === "Cardio";
                  updateItem(idx, {
                    exerciseId: newId,
                    targetSets: nowCardio ? 1 : item.targetSets,
                    targetReps: nowCardio ? 30 : item.targetReps,
                  });
                }}
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </Select>
              {isCardio ? (
                <>
                  <input
                    type="number"
                    min={1}
                    className="w-14 bg-background rounded px-2 py-1 text-sm text-center"
                    value={item.targetReps}
                    onChange={(e) => updateItem(idx, { targetReps: Number(e.target.value) || 1, targetSets: 1 })}
                    title={t("workout.min")}
                  />
                  <span className="text-text-muted text-xs">{t("workout.min")}</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min={1}
                    className="w-12 bg-background rounded px-2 py-1 text-sm text-center"
                    value={item.targetSets}
                    onChange={(e) => updateItem(idx, { targetSets: Number(e.target.value) || 1 })}
                    title="Sets"
                  />
                  <span className="text-text-muted text-xs">×</span>
                  <input
                    type="number"
                    min={1}
                    className="w-12 bg-background rounded px-2 py-1 text-sm text-center"
                    value={item.targetReps}
                    onChange={(e) => updateItem(idx, { targetReps: Number(e.target.value) || 1 })}
                    title="Reps"
                  />
                </>
              )}
              <button onClick={() => removeItem(idx)} className="text-text-muted hover:text-danger p-1">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        <Button variant="secondary" onClick={addExercise} className="flex items-center gap-1 justify-center">
          <Plus size={14} /> {t("routines.addExercise")}
        </Button>
        <Button onClick={handleSave} className="mt-1">
          {routine ? t("routines.saveChanges") : t("routines.createRoutine")}
        </Button>
      </div>
    </Modal>
  );
}

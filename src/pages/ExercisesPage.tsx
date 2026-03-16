import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "../db";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input, { Select } from "../components/Input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getExerciseIcon } from "../exerciseIcons";
import { useI18n } from "../i18n";

export default function ExercisesPage() {
  const { t, tMuscle } = useI18n();
  const [filter, setFilter] = useState<MuscleGroup | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);

  const exercises = useLiveQuery(
    () =>
      filter === "All"
        ? db.exercises.orderBy("name").toArray()
        : db.exercises.where("muscleGroup").equals(filter).sortBy("name"),
    [filter]
  );

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(ex: Exercise) {
    setEditing(ex);
    setModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (confirm(t("exercises.deleteConfirm"))) {
      await db.exercises.delete(id);
    }
  }

  return (
    <PageShell
      title={t("nav.exercises")}
      action={
        <Button onClick={openNew} className="flex items-center gap-1">
          <Plus size={16} /> {t("exercises.add")}
        </Button>
      }
    >
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
        {(["All", ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g as MuscleGroup | "All")}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === g
                ? "bg-primary text-white"
                : "bg-surface-light text-text-muted"
            }`}
          >
            {g === "All" ? t("exercises.all") : tMuscle(g)}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-2">
        {exercises?.map((ex) => (
          <div
            key={ex.id}
            className="bg-surface rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {(() => { const Icon = getExerciseIcon(ex.name, ex.muscleGroup); return <Icon size={20} className="text-primary-light shrink-0" />; })()}
              <div>
                <div className="font-medium text-sm">{ex.name}</div>
                <div className="text-xs text-text-muted">
                  {tMuscle(ex.muscleGroup)} &middot; {ex.equipment}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openEdit(ex)}
                className="p-2 text-text-muted hover:text-primary"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(ex.id!)}
                className="p-2 text-text-muted hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {exercises?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">
            {t("exercises.noExercises")}
          </p>
        )}
      </div>

      <ExerciseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        exercise={editing}
      />
    </PageShell>
  );
}

function ExerciseModal({
  open,
  onClose,
  exercise,
}: {
  open: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}) {
  const { t, tMuscle } = useI18n();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("Chest");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(exercise?.name ?? "");
      setMuscleGroup(exercise?.muscleGroup ?? "Chest");
      setEquipment(exercise?.equipment ?? "");
      setNotes(exercise?.notes ?? "");
    }
  }, [open, exercise]);

  async function handleSave() {
    if (!name.trim()) return;
    const data = { name: name.trim(), muscleGroup, equipment: equipment.trim(), notes: notes.trim() };
    if (exercise?.id) {
      await db.exercises.update(exercise.id, data);
    } else {
      await db.exercises.add(data);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={exercise ? t("exercises.editExercise") : t("exercises.newExercise")}
      footer={
        <Button onClick={handleSave} className="w-full">
          {exercise ? t("exercises.saveChanges") : t("exercises.addExercise")}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 pb-1">
        <Input label={t("exercises.name")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("exercises.namePlaceholder")} />
        <Select label={t("exercises.muscleGroup")} value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>{tMuscle(g)}</option>
          ))}
        </Select>
        <Input label={t("exercises.equipment")} value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder={t("exercises.equipmentPlaceholder")} />
        <Input label={t("exercises.notes")} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("exercises.notesPlaceholder")} />
      </div>
    </Modal>
  );
}

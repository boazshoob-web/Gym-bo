import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import PageShell from "../components/PageShell";
import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getExerciseIcon } from "../exerciseIcons";
import { useI18n } from "../i18n";

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().toArray()) ?? [];
  const allSets = useLiveQuery(() => db.sets.toArray()) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? [];
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const exerciseMap = new Map(exercises.map((e) => [e.id!, e]));

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const locale = lang === "he" ? "he-IL" : "en-US";
    return d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  }

  function getDuration(session: (typeof sessions)[0]) {
    if (!session.startedAt || !session.finishedAt) return null;
    const diff = Math.floor((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000);
    return `${diff} ${t("history.min")}`;
  }

  async function handleDelete(id: number) {
    if (confirm(t("history.deleteConfirm"))) {
      await db.sets.where("sessionId").equals(id).delete();
      await db.sessions.delete(id);
    }
  }

  return (
    <PageShell title={t("nav.history")}>
      {sessions.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-16">
          {t("history.noHistory")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => {
            const sessionSets = allSets.filter((set) => set.sessionId === s.id);
            const exerciseIds = [...new Set(sessionSets.map((set) => set.exerciseId))];
            const isExpanded = expandedId === s.id;
            const duration = getDuration(s);

            return (
              <div key={s.id} className="bg-surface rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : s.id!)}
                >
                  <div>
                    <div className="font-medium text-sm">{formatDate(s.date)}</div>
                    <div className="text-xs text-text-muted">
                      {s.routineName ?? t("history.freeWorkout")} &middot; {exerciseIds.length} {t("history.exercises")}
                      {duration && ` \u00b7 ${duration}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(s.id!); }}
                      className="p-1 text-text-muted hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3">
                    {exerciseIds.map((exId) => {
                      const ex = exerciseMap.get(exId);
                      const sets = sessionSets.filter((set) => set.exerciseId === exId).sort((a, b) => a.setNumber - b.setNumber);
                      return (
                        <div key={exId} className="mb-3">
                          <div className="text-sm font-medium text-primary-light mb-1 flex items-center gap-2">
                            {(() => { const Icon = getExerciseIcon(ex?.name ?? "", ex?.muscleGroup ?? "Other"); return <Icon size={14} className="shrink-0" />; })()}
                            {ex?.name ?? "Unknown"}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {sets.map((set) => (
                              <div key={set.id} className="text-xs text-text-muted flex gap-3">
                                {ex?.muscleGroup === "Cardio" ? (
                                  <span>{set.duration ?? 0} {t("history.min")}</span>
                                ) : (
                                  <>
                                    <span>{t("history.set")} {set.setNumber}</span>
                                    <span>{set.weight} {t("workout.kg")} × {set.reps}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {sessionSets.length === 0 && (
                      <div className="text-xs text-text-muted italic">{t("history.noSets")}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

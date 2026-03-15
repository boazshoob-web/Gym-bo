import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import PageShell from "../components/PageShell";
import { Select } from "../components/Input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function ProgressPage() {
  const exercises = useLiveQuery(() => db.exercises.orderBy("name").toArray()) ?? [];
  const allSets = useLiveQuery(() => db.sets.toArray()) ?? [];
  const sessions = useLiveQuery(() => db.sessions.toArray()) ?? [];
  const [selectedExId, setSelectedExId] = useState<number | null>(null);
  const [chart, setChart] = useState<"weight" | "volume">("weight");

  // Auto-select first exercise
  const exId = selectedExId ?? exercises[0]?.id ?? null;

  // Exercise progression: max weight per session date
  const exerciseData = useMemo(() => {
    if (!exId) return [];
    const exSets = allSets.filter((s) => s.exerciseId === exId);
    const sessionMap = new Map(sessions.map((s) => [s.id!, s]));

    const byDate = new Map<string, { maxWeight: number; totalVolume: number }>();
    for (const s of exSets) {
      const session = sessionMap.get(s.sessionId);
      if (!session) continue;
      const date = session.date;
      const existing = byDate.get(date) ?? { maxWeight: 0, totalVolume: 0 };
      existing.maxWeight = Math.max(existing.maxWeight, s.weight);
      existing.totalVolume += s.weight * s.reps;
      byDate.set(date, existing);
    }

    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...data,
      }));
  }, [exId, allSets, sessions]);

  // Volume per session (total kg×reps)
  const volumeBySession = useMemo(() => {
    const sessionMap = new Map(sessions.map((s) => [s.id!, s]));
    const byDate = new Map<string, number>();
    for (const s of allSets) {
      const session = sessionMap.get(s.sessionId);
      if (!session) continue;
      byDate.set(session.date, (byDate.get(session.date) ?? 0) + s.weight * s.reps);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        volume,
      }));
  }, [allSets, sessions]);

  return (
    <PageShell title="Progress">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChart("weight")}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            chart === "weight" ? "bg-primary text-white" : "bg-surface-light text-text-muted"
          }`}
        >
          Exercise Weight
        </button>
        <button
          onClick={() => setChart("volume")}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            chart === "volume" ? "bg-primary text-white" : "bg-surface-light text-text-muted"
          }`}
        >
          Total Volume
        </button>
      </div>

      {chart === "weight" && (
        <>
          <Select
            label="Exercise"
            value={exId ?? ""}
            onChange={(e) => setSelectedExId(Number(e.target.value))}
            className="mb-4"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </Select>

          {exerciseData.length > 0 ? (
            <div className="bg-surface rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">Max Weight (kg)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={exerciseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Line type="monotone" dataKey="maxWeight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">
              No data yet for this exercise. Complete some workouts first!
            </p>
          )}
        </>
      )}

      {chart === "volume" && (
        <div className="bg-surface rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Total Volume per Session (kg × reps)</h3>
          {volumeBySession.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volumeBySession}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">
              No data yet. Complete some workouts first!
            </p>
          )}
        </div>
      )}
    </PageShell>
  );
}

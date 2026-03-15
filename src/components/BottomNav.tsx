import { NavLink } from "react-router-dom";
import { Dumbbell, Library, ListChecks, History, TrendingUp } from "lucide-react";

const links = [
  { to: "/", icon: Dumbbell, label: "Workout" },
  { to: "/exercises", icon: Library, label: "Exercises" },
  { to: "/routines", icon: ListChecks, label: "Routines" },
  { to: "/history", icon: History, label: "History" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light flex justify-around py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] z-50">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors ${
              isActive ? "text-primary" : "text-text-muted"
            }`
          }
        >
          <l.icon size={20} />
          <span>{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

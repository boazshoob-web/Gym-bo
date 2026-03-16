import { NavLink } from "react-router-dom";
import { Dumbbell, Library, ListChecks, History, TrendingUp } from "lucide-react";
import { useI18n, type TranslationKey } from "../i18n";

const links: { to: string; icon: typeof Dumbbell; labelKey: TranslationKey }[] = [
  { to: "/", icon: Dumbbell, labelKey: "nav.workout" },
  { to: "/exercises", icon: Library, labelKey: "nav.exercises" },
  { to: "/routines", icon: ListChecks, labelKey: "nav.routines" },
  { to: "/history", icon: History, labelKey: "nav.history" },
  { to: "/progress", icon: TrendingUp, labelKey: "nav.progress" },
];

export default function BottomNav() {
  const { t } = useI18n();

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
          <span>{t(l.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}

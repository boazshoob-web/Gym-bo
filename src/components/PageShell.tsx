import type { ReactNode } from "react";
import { useI18n } from "../i18n";

export default function PageShell({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-light sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">{title}</h1>
          <button
            onClick={() => setLang(lang === "en" ? "he" : "en")}
            className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-text-muted hover:text-primary transition-colors"
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
        </div>
        {action}
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">{children}</main>
    </div>
  );
}

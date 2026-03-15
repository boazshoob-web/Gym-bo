import type { ReactNode } from "react";

export default function PageShell({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-light sticky top-0 z-40">
        <h1 className="text-lg font-bold">{title}</h1>
        {action}
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">{children}</main>
    </div>
  );
}

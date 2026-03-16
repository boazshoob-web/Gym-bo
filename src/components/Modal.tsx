import type { ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col overflow-hidden" style={{ maxHeight: "calc(100% - 2rem)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-text-muted p-1">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="px-5 pt-3 pb-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shrink-0 border-t border-surface-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

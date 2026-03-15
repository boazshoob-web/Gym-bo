import type { InputHTMLAttributes } from "react";

export default function Input({
  label,
  className = "",
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs text-text-muted">{label}</span>}
      <input
        className={`bg-surface-light rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...props
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs text-text-muted">{label}</span>}
      <select
        className={`bg-surface-light rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-primary hover:bg-primary-dark text-white",
  secondary: "bg-surface-light hover:bg-surface text-text",
  danger: "bg-danger/20 hover:bg-danger/30 text-danger",
  ghost: "hover:bg-surface-light text-text-muted",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: {
  variant?: keyof typeof variants;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

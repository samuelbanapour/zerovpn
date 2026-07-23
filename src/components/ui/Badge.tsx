import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success: "bg-accent/20 text-accent border-accent/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  error: "bg-danger/20 text-danger border-danger/30",
  neutral: "bg-surface-overlay text-text-secondary border-border",
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

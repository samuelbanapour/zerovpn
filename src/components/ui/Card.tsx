import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-surface-raised border border-border rounded-xl p-5 ${
        hover ? "hover:border-border-hover transition-colors duration-150 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

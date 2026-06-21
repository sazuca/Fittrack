import { cn } from "@/lib/utils";
import type { ReactNode, HTMLAttributes } from "react";

export function GlassCard({
  className,
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-500 hover:shadow-[var(--shadow-elegant)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

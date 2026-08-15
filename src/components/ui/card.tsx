import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,44,76,0.04),0_8px_24px_-12px_rgba(15,44,76,0.12)]",
        className
      )}
      {...props}
    />
  );
}

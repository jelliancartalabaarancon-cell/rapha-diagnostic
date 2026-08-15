import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  variant?: "default" | "on-dark";
}

export function Logo({ className, iconClassName, variant = "default" }: LogoProps) {
  const isDark = variant === "on-dark";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-clinical-600 text-white",
          iconClassName
        )}
      >
        <Activity className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[1.05rem] font-extrabold tracking-tight",
            isDark ? "text-white" : "text-clinical-950"
          )}
        >
          RAPHA
        </span>
        <span
          className={cn(
            "block text-[0.62rem] font-semibold uppercase tracking-[0.16em]",
            isDark ? "text-clinical-100/80" : "text-clinical-600/80"
          )}
        >
          Diagnostic Laboratory
        </span>
      </span>
    </div>
  );
}

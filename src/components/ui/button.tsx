import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-clinical-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants = {
  primary:
    "bg-clinical-600 text-white hover:bg-clinical-700 shadow-sm shadow-clinical-900/10",
  secondary:
    "bg-white text-clinical-700 ring-1 ring-inset ring-clinical-200 hover:bg-clinical-50",
  ghost: "text-clinical-700 hover:bg-clinical-50",
  outline:
    "bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "text-sm px-3.5 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface LinkButtonProps {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

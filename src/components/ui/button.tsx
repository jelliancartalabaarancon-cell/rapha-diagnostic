import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-clinical-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

const variants = {
  primary:
    "bg-clinical-600 text-white shadow-sm shadow-clinical-900/10 hover:-translate-y-0.5 hover:bg-clinical-700 hover:shadow-md hover:shadow-clinical-900/20",
  secondary:
    "bg-white text-clinical-700 ring-1 ring-inset ring-clinical-200 hover:-translate-y-0.5 hover:bg-clinical-50 hover:ring-clinical-300",
  ghost: "text-clinical-700 hover:bg-clinical-50",
  outline:
    "bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
  /* Ember accent — reserved for rare, deliberate highlights (e.g. a single
     standout CTA). Not used as a default button color anywhere. */
  accent:
    "bg-ember-600 text-white shadow-sm shadow-ember-900/10 hover:-translate-y-0.5 hover:bg-ember-700 hover:shadow-md hover:shadow-ember-900/20",
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

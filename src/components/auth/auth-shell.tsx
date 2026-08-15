import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-clinical-950 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-clinical-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-clinical-600/30 blur-3xl" />

        <Link href="/" className="relative z-10">
          <Logo variant="on-dark" />
        </Link>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-clinical-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Patient Portal
          </span>
          <h2 className="mt-5 max-w-sm font-display text-3xl font-bold leading-tight">
            Your results and appointments, in one place.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-clinical-100/80">
            Book diagnostic services, track appointment status, and manage
            your account — no more waiting on hold to ask when it&apos;s
            ready.
          </p>
        </div>

        <p className="relative z-10 text-xs text-clinical-200/60">
          © {new Date().getFullYear()} RAPHA Diagnostic Laboratory
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </Link>
          <h1 className="font-display text-2xl font-bold text-clinical-950">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up — RAPHA Diagnostic Laboratory",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Book appointments and track results in one portal."
    >
      <SignupForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-clinical-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

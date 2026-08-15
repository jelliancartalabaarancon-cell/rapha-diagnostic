"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function BackButton() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBack = () => {
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/staff");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </button>
  );
}
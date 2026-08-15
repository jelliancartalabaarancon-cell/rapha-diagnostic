"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </button>
  );
}
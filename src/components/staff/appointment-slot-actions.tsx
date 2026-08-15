"use client";

import { useState } from "react";

type Props = {
  id: string;
  isActive: boolean;
  bookedCount: number;
  isExpired: boolean;
};

export function AppointmentSlotActions({
  id,
  isActive,
  bookedCount,
  isExpired,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive() {
    if (isExpired) {
      setError(
        "Expired appointment slots cannot be activated or deactivated.",
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/staff/appointment-slots",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            isActive: !isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to update appointment slot.",
        );
        return;
      }

      window.location.reload();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {isExpired ? (
        <span className="text-xs font-medium text-slate-400">
          No actions available
        </span>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit */}
          <a
            href={`/staff/appointment-slots/${id}/edit`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </a>

          {/* Activate / Deactivate */}
          <button
            type="button"
            onClick={toggleActive}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Updating..."
              : isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  isActive: boolean;
};

export function ServiceActions({
  id,
  isActive,
}: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleToggleClick() {
    setError(null);
    setShowConfirm(true);
  }

  function closeConfirm() {
    if (isLoading) {
      return;
    }

    setShowConfirm(false);
  }

  async function confirmToggle() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/staff/services/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            `Unable to ${
              isActive
                ? "deactivate"
                : "activate"
            } service.`,
        );

        setIsLoading(false);
        return;
      }

      setShowConfirm(false);

      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
      setIsLoading(false);
    }
  }

  function editService() {
    router.push(
      `/staff/services/${id}/edit`,
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit */}
          <button
            type="button"
            onClick={editService}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit
          </button>

          {/* Activate / Deactivate */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isLoading}
            className={
              isActive
                ? "rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                : "rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {isLoading
              ? "Updating..."
              : isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2 className="text-lg font-bold text-clinical-950">
              {isActive
                ? "Deactivate Service"
                : "Activate Service"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isActive
                ? "Are you sure you want to deactivate this laboratory service? Patients will no longer be able to select this service when booking an appointment."
                : "Are you sure you want to activate this laboratory service? Patients will be able to select this service when booking an appointment again."}
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                No, Cancel
              </button>

              {/* Confirm */}
              <button
                type="button"
                onClick={confirmToggle}
                disabled={isLoading}
                className={
                  isActive
                    ? "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {isLoading
                  ? "Updating..."
                  : isActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


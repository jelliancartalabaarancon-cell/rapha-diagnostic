"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  role: "PATIENT" | "STAFF" | "ADMIN";
  isActive: boolean;
  isCurrentUser: boolean;
};

export function AccountActions({
  id,
  role,
  isActive,
  isCurrentUser,
}: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleToggleClick() {
    if (isCurrentUser) {
      setError("You cannot deactivate your own account.");
      return;
    }

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
    if (isCurrentUser) {
      setShowConfirm(false);
      setError("You cannot deactivate your own account.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            `Unable to ${
              isActive ? "deactivate" : "activate"
            } account.`,
        );

        setIsLoading(false);
        return;
      }

      setShowConfirm(false);

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  function editAccount() {
    router.push(`/admin/users/${id}/edit`);
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit */}
          <button
            type="button"
            onClick={editAccount}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit
          </button>

          {/* Activate / Deactivate */}
          {!isCurrentUser && (
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
          )}

          {/* Current Admin */}
          {isCurrentUser && (
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Current Account
            </span>
          )}
        </div>

        {/* Account Role */}
        <p className="text-xs text-slate-400">
          {role === "PATIENT"
            ? "Patient account"
            : role === "STAFF"
              ? "Staff account"
              : "Administrator account"}
        </p>

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
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-clinical-950">
              {isActive
                ? "Deactivate Account"
                : "Activate Account"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isActive
                ? `Are you sure you want to deactivate this ${role.toLowerCase()} account? The user will no longer be able to access the RAPHA system.`
                : `Are you sure you want to activate this ${role.toLowerCase()} account? The user will be able to access the RAPHA system again.`}
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
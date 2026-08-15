"use client";

import { useState } from "react";

interface AppointmentActionsProps {
  appointmentId: string;
}

type ActionType = "COMPLETE" | "CANCEL" | null;

export function AppointmentActions({
  appointmentId,
}: AppointmentActionsProps) {
  const [confirmAction, setConfirmAction] =
    useState<ActionType>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirmAction) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/staff/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: confirmAction,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to update the appointment.",
        );

        setIsProcessing(false);
        return;
      }

      // Close the confirmation dialog.
      setConfirmAction(null);

      // Refresh the server-rendered appointment table.
      window.location.reload();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );

      setIsProcessing(false);
    }
  }

  function handleCancelConfirmation() {
    if (isProcessing) return;

    setConfirmAction(null);
    setError(null);
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmAction("COMPLETE");
          }}
          disabled={isProcessing}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Complete
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmAction("CANCEL");
          }}
          disabled={isProcessing}
          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-confirmation-title"
          >
            <h2
              id="appointment-confirmation-title"
              className="font-display text-lg font-semibold text-clinical-950"
            >
              {confirmAction === "COMPLETE"
                ? "Complete Appointment?"
                : "Cancel Appointment?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {confirmAction === "COMPLETE"
                ? "Are you sure you want to mark this appointment as completed? This action cannot be undone."
                : "Are you sure you want to cancel this appointment? The appointment slot will become available again."}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelConfirmation}
                disabled={isProcessing}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                No, Go Back
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className={
                  confirmAction === "COMPLETE"
                    ? "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {isProcessing
                  ? "Processing..."
                  : confirmAction === "COMPLETE"
                    ? "Yes, Complete"
                    : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppointmentWithService } from "@/types";
import { Field, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatDisplayTime } from "@/lib/utils";

interface RescheduleDialogProps {
  appointment: AppointmentWithService | null;
  onClose: () => void;
  onSuccess: (updated: AppointmentWithService) => void;
}

interface AppointmentSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  remaining: number;
  isActive: boolean;
}

export function RescheduleDialog({
  appointment,
  onClose,
  onSuccess,
}: RescheduleDialogProps) {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!appointment) return;

    setSlotId("");
    setError(null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [appointment, onClose]);

  useEffect(() => {
    if (!appointment) return;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setError(null);

      try {
        const res = await fetch("/api/appointment-slots");

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Unable to load appointment slots.");
          return;
        }

        setSlots(data.slots ?? []);
      } catch {
        setError("Unable to load appointment slots.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    loadSlots();
  }, [appointment]);

  if (!appointment || typeof document === "undefined") {
    return null;
  }

  const currentAppointment = appointment;

  function formatSlotDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!slotId) {
      setError("Please select a new appointment slot.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `/api/appointments/${currentAppointment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slotId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ?? "Could not reschedule this appointment."
        );
        setIsSubmitting(false);
        return;
      }

      onSuccess(data.appointment);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="modal-pop relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="font-display text-lg font-semibold text-slate-800">
          Reschedule Appointment
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {currentAppointment.service.name}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <Field label="New Appointment Slot" htmlFor="reschedule-slot">
            <Select
              id="reschedule-slot"
              required
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              disabled={isLoadingSlots || isSubmitting}
            >
              <option value="">
                {isLoadingSlots
                  ? "Loading available slots..."
                  : "Select a new slot"}
              </option>

              {slots
                .filter((slot) => slot.id !== currentAppointment.slot.id)
                .map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotDate(slot.date)} —{" "}
                    {formatDisplayTime(slot.startTime)} -{" "}
                    {formatDisplayTime(slot.endTime)}{" "}
                    ({slot.remaining}{" "}
                    {slot.remaining === 1 ? "slot" : "slots"} left)
                  </option>
                ))}
            </Select>
          </Field>

          {!isLoadingSlots && slots.length === 0 && (
            <p className="text-xs text-slate-500">
              No available appointment slots were found.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Go back
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingSlots || !slotId}
            >
              {isSubmitting ? "Saving…" : "Confirm New Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

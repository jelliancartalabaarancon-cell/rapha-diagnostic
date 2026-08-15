"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
};

export function EditAppointmentSlotForm({
  id,
  date,
  startTime: initialStartTime,
  endTime: initialEndTime,
  capacity: initialCapacity,
  bookedCount,
  isActive,
}: Props) {
  const router = useRouter();

  const [dateValue, setDateValue] = useState(date);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [capacity, setCapacity] = useState(String(initialCapacity));

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const numericCapacity = Number(capacity);

    if (!dateValue) {
      setError("Please select a date.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please enter both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    if (
      !Number.isInteger(numericCapacity) ||
      numericCapacity < 1
    ) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    if (numericCapacity < bookedCount) {
      setError(
        `Capacity cannot be lower than the ${bookedCount} appointment(s) already booked.`,
      );
      return;
    }

    setIsSubmitting(true);

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
            date: dateValue,
            startTime,
            endTime,
            capacity: numericCapacity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to update appointment slot.",
        );
        return;
      }

      router.push("/staff/appointment-slots");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700"
        >
          Date
        </label>

        <input
          id="date"
          type="date"
          required
          value={dateValue}
          onChange={(event) => setDateValue(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        />
      </div>

      {/* Time */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-slate-700"
          >
            Start Time
          </label>

          <input
            id="startTime"
            type="time"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-slate-700"
          >
            End Time
          </label>

          <input
            id="endTime"
            type="time"
            required
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-slate-700"
        >
          Capacity
        </label>

        <input
          id="capacity"
          type="number"
          min={bookedCount > 0 ? bookedCount : 1}
          required
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Currently booked:{" "}
          <span className="font-semibold text-slate-700">
            {bookedCount}
          </span>
        </p>
      </div>

      {/* Status */}
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          Current status:{" "}
          <span className="font-semibold">
            {isActive ? "Active" : "Inactive"}
          </span>
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Use the Activate/Deactivate button on the appointment
          slot list to change the slot's availability.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push("/staff/appointment-slots")
          }
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
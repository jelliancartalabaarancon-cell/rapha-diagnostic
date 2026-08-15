"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateAppointmentSlotForm() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("10");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff/appointment-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          capacity: Number(capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create appointment slot.");
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
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

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
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        />
      </div>

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
          min="1"
          required
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Maximum number of patients who can book this time slot.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/staff/appointment-slots")}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Slot"}
        </button>
      </div>
    </form>
  );
}
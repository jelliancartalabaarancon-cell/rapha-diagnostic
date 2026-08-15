"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Service } from "@/types";
import { Field, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatDisplayTime } from "@/lib/utils";

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

interface NewAppointmentFormProps {
  services: Service[];
}

const PREPARATION_HOURS = 1;
const TIME_ZONE = "Asia/Manila";

/**
 * Get the current Philippine date/time.
 */
function getPhilippineNow(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

/**
 * Convert a Date into YYYY-MM-DD using Philippine time.
 */
function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Convert an appointment slot date into YYYY-MM-DD.
 */
function slotDateKey(slot: AppointmentSlot): string {
  return dateKey(new Date(slot.date));
}

/**
 * Create a Philippine local Date for a slot.
 */
function getSlotStartDateTime(
  slot: AppointmentSlot,
): Date {
  const date = new Date(slot.date);

  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [hours, minutes] = slot.startTime
    .split(":")
    .map(Number);

  return new Date(
    `${dateString}T${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:00`,
  );
}

/**
 * Determine whether a slot is within the
 * one-hour laboratory preparation period.
 */
function isSlotTooSoon(
  slot: AppointmentSlot,
): boolean {
  const now = getPhilippineNow();

  const slotStart = getSlotStartDateTime(slot);

  const preparationCutoff =
    now.getTime() +
    PREPARATION_HOURS * 60 * 60 * 1000;

  return (
    slotStart.getTime() < preparationCutoff
  );
}

export function NewAppointmentForm({
  services,
}: NewAppointmentFormProps) {
  const router = useRouter();

  const [serviceId, setServiceId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<
    AppointmentSlot[]
  >([]);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [currentMonth, setCurrentMonth] = useState(
    () => {
      const now = getPhilippineNow();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );
    },
  );

  const [isLoadingSlots, setIsLoadingSlots] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * Load appointment slots.
   */
  useEffect(() => {
    async function loadSlots() {
      setIsLoadingSlots(true);
      setError(null);

      try {
        const res = await fetch(
          "/api/appointment-slots",
        );

        const data = await res.json();

        if (!res.ok) {
          setError(
            data.error ??
              "Unable to load appointment slots.",
          );
          return;
        }

        setSlots(data.slots ?? []);
      } catch {
        setError(
          "Unable to load appointment slots.",
        );
      } finally {
        setIsLoadingSlots(false);
      }
    }

    loadSlots();
  }, []);

  /**
   * Get today's Philippine date.
   */
  const todayKey = useMemo(() => {
    return dateKey(new Date());
  }, []);

  /**
   * Determine whether a calendar date is before today.
   */
  function isPastDate(date: Date): boolean {
    return dateKey(date) < todayKey;
  }

  /**
   * Determine whether a slot is currently bookable.
   *
   * A slot must:
   * - be active
   * - have remaining capacity
   * - not be in the past
   * - be at least one hour away
   */
  function isSlotBookable(
    slot: AppointmentSlot,
  ): boolean {
    if (!slot.isActive) {
      return false;
    }

    if (slot.remaining <= 0) {
      return false;
    }

    if (slotDateKey(slot) < todayKey) {
      return false;
    }

    if (isSlotTooSoon(slot)) {
      return false;
    }

    return true;
  }

  /**
   * Get bookable slots for a specific date.
   */
  function getSlotsForDate(date: Date) {
    const key = dateKey(date);

    return slots.filter(
      (slot) =>
        slotDateKey(slot) === key &&
        isSlotBookable(slot),
    );
  }

  /**
   * Generate calendar days.
   */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1,
    );

    const firstWeekday =
      firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const days: (Date | null)[] = [];

    for (
      let i = 0;
      i < firstWeekday;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(
        new Date(
          year,
          month,
          day,
        ),
      );
    }

    return days;
  }, [currentMonth]);

  /**
   * Determine whether a date is selected.
   */
  function isSelectedDate(
    date: Date,
  ) {
    if (!selectedDate) {
      return false;
    }

    return (
      dateKey(date) ===
      dateKey(selectedDate)
    );
  }

  /**
   * Determine whether a date has
   * at least one bookable slot.
   */
  function hasAvailableSlots(
    date: Date,
  ) {
    return (
      getSlotsForDate(date).length > 0
    );
  }

  /**
   * Select a date.
   */
  function handleDateSelect(
    date: Date,
  ) {
    if (isPastDate(date)) {
      return;
    }

    if (!hasAvailableSlots(date)) {
      return;
    }

    setSelectedDate(date);
    setSlotId("");
    setError(null);
  }

  /**
   * Change calendar month.
   */
  function changeMonth(
    amount: number,
  ) {
    setCurrentMonth((current) => {
      const next = new Date(current);

      next.setMonth(
        next.getMonth() + amount,
      );

      return next;
    });

    setSelectedDate(null);
    setSlotId("");
  }

  /**
   * Slots for selected date.
   */
  const selectedDateSlots =
    selectedDate
      ? getSlotsForDate(selectedDate)
      : [];

  /**
   * Display selected date.
   */
  const selectedDateLabel =
    selectedDate
      ? selectedDate.toLocaleDateString(
          "en-PH",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        )
      : "";

  /**
   * Submit appointment.
   */
  async function handleSubmit(
    e: FormEvent,
  ) {
    e.preventDefault();

    if (!serviceId) {
      setError(
        "Please select a laboratory service.",
      );
      return;
    }

    if (!selectedDate) {
      setError(
        "Please select an appointment date.",
      );
      return;
    }

    if (!slotId) {
      setError(
        "Please select an appointment time.",
      );
      return;
    }

    /*
     * Check the selected slot against
     * the current time again.
     */
    const selectedSlot =
      slots.find(
        (slot) => slot.id === slotId,
      );

    if (
      !selectedSlot ||
      !isSlotBookable(selectedSlot)
    ) {
      setError(
        "This appointment slot is no longer available. Please select another time.",
      );

      setSlotId("");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            serviceId,
            slotId,
            notes,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ??
            "Could not book this appointment.",
        );

        setIsSubmitting(false);
        return;
      }

      router.push(
        "/dashboard/appointments?booked=1",
      );

      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );

      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}

      {/* Laboratory Service */}
      <Field
        label="Laboratory Service"
        htmlFor="serviceId"
      >
        <select
          id="serviceId"
          required
          value={serviceId}
          onChange={(e) =>
            setServiceId(e.target.value)
          }
          disabled={isSubmitting}
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option
            value=""
            disabled
          >
            Select a service
          </option>

          {services.map((service) => (
            <option
              key={service.id}
              value={service.id}
            >
              {service.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Calendar */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Appointment Date
        </label>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {/* Calendar header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                changeMonth(-1)
              }
              disabled={isSubmitting}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="font-display text-base font-semibold text-slate-800">
              {currentMonth.toLocaleDateString(
                "en-PH",
                {
                  month: "long",
                  year: "numeric",
                },
              )}
            </h2>

            <button
              type="button"
              onClick={() =>
                changeMonth(1)
              }
              disabled={isSubmitting}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(
              (date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square"
                    />
                  );
                }

                const available =
                  hasAvailableSlots(
                    date,
                  );

                const past =
                  isPastDate(date);

                const selected =
                  isSelectedDate(
                    date,
                  );

                const isToday =
                  dateKey(date) ===
                  todayKey;

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={
                      past ||
                      !available ||
                      isSubmitting
                    }
                    onClick={() =>
                      handleDateSelect(
                        date,
                      )
                    }
                    className={[
                      "relative aspect-square rounded-xl text-sm font-medium transition",
                      past ||
                      !available
                        ? "cursor-not-allowed text-slate-300"
                        : "text-slate-700 hover:bg-clinical-50 hover:text-clinical-700",
                      selected
                        ? "bg-clinical-600 text-white hover:bg-clinical-600 hover:text-white"
                        : "",
                      isToday &&
                      !selected
                        ? "ring-2 ring-inset ring-clinical-300"
                        : "",
                    ].join(" ")}
                  >
                    {date.getDate()}

                    {available &&
                      !selected && (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-clinical-500" />
                      )}
                  </button>
                );
              },
            )}
          </div>

          {isLoadingSlots && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Loading available dates...
            </p>
          )}

          {!isLoadingSlots &&
            slots.length === 0 && (
              <p className="mt-4 text-center text-xs text-slate-500">
                No appointment slots are currently available.
              </p>
            )}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700">
              Available Times
            </label>

            <p className="mt-1 text-xs text-slate-500">
              {selectedDateLabel}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Slots must be booked at least{" "}
              {PREPARATION_HOURS} hour
              in advance.
            </p>
          </div>

          {selectedDateSlots.length ===
          0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No available times for
              this date.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedDateSlots.map(
                (slot) => {
                  const selected =
                    slot.id ===
                    slotId;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      onClick={() => {
                        setSlotId(
                          slot.id,
                        );
                        setError(
                          null,
                        );
                      }}
                      className={[
                        "rounded-xl border p-4 text-left transition",
                        selected
                          ? "border-clinical-600 bg-clinical-50 ring-2 ring-clinical-100"
                          : "border-slate-200 bg-white hover:border-clinical-300 hover:bg-clinical-50/50",
                      ].join(" ")}
                    >
                      <div className="font-medium text-slate-800">
                        {formatDisplayTime(
                          slot.startTime,
                        )}{" "}
                        -{" "}
                        {formatDisplayTime(
                          slot.endTime,
                        )}
                      </div>

                      <div
                        className={[
                          "mt-1 text-xs font-medium",
                          selected
                            ? "text-clinical-700"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {slot.remaining}{" "}
                        {slot.remaining ===
                        1
                          ? "slot"
                          : "slots"}{" "}
                        left
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Notes */}
      <Field
        label="Additional Notes"
        htmlFor="notes"
        optional
      >
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Fasting status, referring physician, or anything else we should know."
          disabled={isSubmitting}
        />
      </Field>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          isSubmitting ||
          isLoadingSlots ||
          !serviceId ||
          !selectedDate ||
          !slotId
        }
      >
        {isSubmitting ? (
          "Booking…"
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" />
            Confirm Appointment
          </>
        )}
      </Button>
    </form>
  );
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppointmentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDisplayDate(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  return date.toLocaleDateString("en-PH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDisplayTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minuteStr.padStart(2, "0")} ${period}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const APPOINTMENT_STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  BOOKED: {
    label: "Booked",
    className:
      "bg-clinical-50 text-clinical-700 ring-1 ring-inset ring-clinical-200",
  },

  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
  },
};

export const TIME_SLOTS: string[] = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

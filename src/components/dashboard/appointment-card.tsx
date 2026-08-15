
"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, Clock3 } from "lucide-react";
import { AppointmentWithService } from "@/types";
import { getServiceIcon } from "@/lib/icon-map";
import {
  APPOINTMENT_STATUS_STYLES,
  cn,
  formatDisplayDate,
  formatDisplayTime,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppointmentCardProps {
  appointment: AppointmentWithService;
  onReschedule?: (appointment: AppointmentWithService) => void;
  onCancel?: (appointment: AppointmentWithService) => void;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  showActions = true,
}: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const Icon = getServiceIcon(appointment.service.icon);
  const statusStyle = APPOINTMENT_STATUS_STYLES[appointment.status];

  // BOOKED appointments can be rescheduled or cancelled.
  const canModify = appointment.status === "BOOKED";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(15,44,76,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-clinical-950">
              {appointment.service.name}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDisplayDate(appointment.slot.date)}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDisplayTime(appointment.slot.startTime)} -{" "}
                {formatDisplayTime(appointment.slot.endTime)}
              </span>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold",
            statusStyle.className
          )}
        >
          {statusStyle.label}
        </span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-1 text-xs font-semibold text-clinical-600 hover:text-clinical-700"
      >
        View Details

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 px-4 py-3.5 text-xs text-slate-500">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Reference No.</span>
            <span className="font-mono text-slate-600">
              {appointment.id}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Booked On</span>
            <span className="text-slate-600">
              {formatDisplayDate(appointment.createdAt)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Appointment Date</span>
            <span className="text-slate-600">
              {formatDisplayDate(appointment.slot.date)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Time Slot</span>
            <span className="text-slate-600">
              {formatDisplayTime(appointment.slot.startTime)} -{" "}
              {formatDisplayTime(appointment.slot.endTime)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="shrink-0 text-slate-400">Notes</span>
            <span className="text-right text-slate-600">
              {appointment.notes || "No additional notes provided."}
            </span>
          </div>
        </div>
      )}

      {showActions && canModify && (onReschedule || onCancel) && (
        <div className="mt-4 flex gap-2.5 border-t border-slate-100 pt-4">
          {onReschedule && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}

          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

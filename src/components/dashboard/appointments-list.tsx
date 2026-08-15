"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { AppointmentWithService } from "@/types";
import { AppointmentCard } from "./appointment-card";
import { RescheduleDialog } from "./reschedule-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export function AppointmentsList({
  initialAppointments,
}: {
  initialAppointments: AppointmentWithService[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentWithService | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithService | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function handleRescheduleSuccess(updated: AppointmentWithService) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setRescheduleTarget(null);
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${cancelTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === data.appointment.id ? data.appointment : a))
        );
      }
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="You currently have no appointments."
        description="Book a laboratory service and we'll hold your slot — you can reschedule or cancel any time before your visit."
        action={
          <LinkButton href="/dashboard/appointments/new" size="lg">
            Make an Appointment
          </LinkButton>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onReschedule={setRescheduleTarget}
            onCancel={setCancelTarget}
          />
        ))}
      </div>

      <RescheduleDialog
        key={rescheduleTarget?.id ?? "none"}
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={handleRescheduleSuccess}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel this appointment?"
        description={
          cancelTarget && (
            <>
              Your <span className="font-medium text-slate-700">{cancelTarget.service.name}</span>{" "}
              appointment will be marked as cancelled. This can&apos;t be undone, but your booking
              history will still show it.
            </>
          )
        }
        confirmLabel="Cancel Appointment"
        destructive
        isSubmitting={isCancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </>
  );
}

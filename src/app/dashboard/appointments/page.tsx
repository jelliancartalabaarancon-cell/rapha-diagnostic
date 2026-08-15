import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAppointmentsByUser } from "@/lib/data/appointments";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { LinkButton } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Appointments — RAPHA Patient Portal" };

export default async function AppointmentsPage() {
  const session = await auth();
  const appointments = await getAppointmentsByUser(session!.user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinical-950">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, reschedule, or cancel your booked laboratory services.
          </p>
        </div>
        {appointments.length > 0 && (
          <LinkButton href="/dashboard/appointments/new" size="md">
            <Plus className="h-4 w-4" />
            Make Appointment
          </LinkButton>
        )}
      </div>

      <div className="mt-8">
        <AppointmentsList initialAppointments={appointments} />
      </div>
    </div>
  );
}

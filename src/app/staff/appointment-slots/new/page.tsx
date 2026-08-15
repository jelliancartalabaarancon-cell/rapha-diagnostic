import Link from "next/link";
import { CreateAppointmentSlotForm } from "@/components/staff/create-appointment-slot-form";

export default function NewAppointmentSlotPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/staff/appointment-slots"
          className="text-sm font-medium text-clinical-600 hover:text-clinical-700"
        >
          ← Back to Appointment Slots
        </Link>

        <h1 className="mt-4 font-display text-2xl font-bold text-clinical-950">
          Create Appointment Slot
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a date and time when patients can book an appointment.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CreateAppointmentSlotForm />
      </section>
    </div>
  );
}
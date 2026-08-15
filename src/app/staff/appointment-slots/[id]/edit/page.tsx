import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointmentSlotById } from "@/lib/data/appointment-slots";
import { EditAppointmentSlotForm } from "@/components/staff/edit-appointment-slot-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAppointmentSlotPage({
  params,
}: Props) {
  const { id } = await params;

  const slot = await getAppointmentSlotById(id);

  if (!slot) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/staff/appointment-slots"
          className="text-sm font-medium text-clinical-600 hover:text-clinical-700"
        >
          ← Back to Appointment Slots
        </Link>

        <h1 className="mt-4 font-display text-2xl font-bold text-clinical-950">
          Edit Appointment Slot
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the date, time, or capacity of this appointment slot.
        </p>
      </div>

      {/* Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <EditAppointmentSlotForm
          id={slot.id}
          date={slot.date.toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          })}
          startTime={slot.startTime}
          endTime={slot.endTime}
          capacity={slot.capacity}
          bookedCount={slot.bookedCount}
          isActive={slot.isActive}
        />
      </section>
    </div>
  );
}
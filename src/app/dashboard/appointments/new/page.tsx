import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveServices } from "@/lib/data/services";
import { NewAppointmentForm } from "@/components/dashboard/new-appointment-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Make an Appointment — RAPHA Patient Portal" };

export default async function NewAppointmentPage() {
  const services = await getActiveServices();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/dashboard/appointments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-clinical-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Appointments
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-clinical-950">
        Make an Appointment
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a service and a time that works for you — we&apos;ll confirm the slot on our end.
      </p>

      <Card className="mt-8 p-6 sm:p-8">
        <NewAppointmentForm services={services} />
      </Card>
    </div>
  );
}

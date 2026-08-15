import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppointmentActions } from "@/components/staff/appointment-actions";

export const metadata: Metadata = {
  title: "Appointments — RAPHA Staff",
};

export default async function StaffAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          contactNumber: true,
        },
      },

      service: {
        select: {
          id: true,
          name: true,
        },
      },

      slot: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          capacity: true,
          bookedCount: true,
        },
      },
    },

    orderBy: [
      {
        slot: {
          date: "asc",
        },
      },
      {
        slot: {
          startTime: "asc",
        },
      },
    ],
  });

  function formatDate(date: Date) {
    return date.toLocaleDateString("en-PH", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Manila",
    });
  }

  function formatTime(time: string) {
    const [hourString, minuteString] = time.split(":");

    const hour = Number(hourString);
    const minute = Number(minuteString);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(
      2,
      "0",
    )} ${period}`;
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "BOOKED":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  const bookedCount = appointments.filter(
    (appointment) => appointment.status === "BOOKED",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "CANCELLED",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/staff"
            className="text-sm font-medium text-clinical-600 hover:text-clinical-700"
          >
            ← Back to Staff Dashboard
          </Link>

          <h1 className="mt-4 font-display text-2xl font-bold text-clinical-950">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage patient laboratory appointments.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Appointments
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-clinical-950">
            {appointments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Booked
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-green-600">
            {bookedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Completed
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-blue-600">
            {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Cancelled
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-red-600">
            {cancelledCount}
          </p>
        </div>
      </div>

      {/* Appointment Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold text-clinical-950">
            Patient Appointments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All appointments booked through the RAPHA Patient Portal.
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-6 py-10 text-center">
            <p className="font-medium text-slate-700">
              No appointments found.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Patient appointments will appear here when they make a
              booking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">
                    Patient
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Service
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Time
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Notes
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {/* Patient */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-clinical-950">
                        {appointment.user.fullName}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {appointment.user.email}
                      </div>

                      {appointment.user.contactNumber && (
                        <div className="mt-1 text-xs text-slate-500">
                          {appointment.user.contactNumber}
                        </div>
                      )}
                    </td>

                    {/* Service */}
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {appointment.service.name}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(appointment.slot.date)}
                    </td>

                    {/* Time */}
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatTime(appointment.slot.startTime)} -{" "}
                      {formatTime(appointment.slot.endTime)}
                    </td>

                    {/* Notes */}
                    <td className="max-w-xs px-4 py-4 text-slate-600">
                      {appointment.notes ? (
                        <span className="line-clamp-2">
                          {appointment.notes}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          No notes
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          appointment.status,
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      {appointment.status === "BOOKED" ? (
                        <AppointmentActions
                          appointmentId={appointment.id}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
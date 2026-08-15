import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function StaffPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinical-950">
            Staff Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage laboratory operations and patient services.
          </p>
        </div>

        <LogoutButton />
      </div>

      {/* Management Functions */}
      <section>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Laboratory Management
        </h2>

        <div className="mt-3 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Appointments */}
          <a
            href="/staff/appointments"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="font-display text-lg font-semibold text-clinical-950">
              Appointments
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              View and manage patient laboratory appointments.
            </p>
          </a>

          {/* Appointment Slots */}
          <a
            href="/staff/appointment-slots"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="font-display text-lg font-semibold text-clinical-950">
              Appointment Slots
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage available appointment schedules.
            </p>
          </a>

          {/* Lab Results */}
          <a
            href="/staff/lab-results"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="font-display text-lg font-semibold text-clinical-950">
              Lab Results
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage patient laboratory test results.
            </p>
          </a>

          {/* Services */}
          <a
            href="/staff/services"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="font-display text-lg font-semibold text-clinical-950">
              Services
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage available laboratory services.
            </p>
          </a>
        </div>
      </section>

      {/* Account Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-clinical-950">
          Account
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Signed in as{" "}
          <span className="font-semibold text-clinical-950">
            {session?.user?.name}
          </span>
          .
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Role:{" "}
          <span className="font-semibold text-clinical-950">
            {session?.user?.role}
          </span>
        </p>
      </section>
    </div>
  );
}
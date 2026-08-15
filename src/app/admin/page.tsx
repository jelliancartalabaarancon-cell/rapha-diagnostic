import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { UserAccountsTable } from "@/components/admin/user-accounts-table";

export default async function AdminPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /*
   * Convert Date objects to strings before
   * passing the data to the Client Component.
   */
  const serializedUsers = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinical-950">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient, staff, and administrator accounts.
          </p>
        </div>

        <LogoutButton />
      </div>

      {/* User Accounts */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-clinical-950">
              User Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage patient, staff, and administrator accounts.
            </p>
          </div>

          <a
            href="/admin/users/new"
            className="rounded-xl bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
          >
            Create Account
          </a>
        </div>

        <UserAccountsTable
          users={serializedUsers}
          currentUserId={session?.user?.id}
        />
      </section>

      {/* Staff Functions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-clinical-950">
          Staff Functions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Access laboratory management functions.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {/* Appointments */}
          <a
            href="/staff/appointments"
            className="rounded-xl bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
          >
            Appointments
          </a>

          {/* Appointment Slots */}
          <a
            href="/staff/appointment-slots"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-clinical-950 hover:bg-slate-50"
          >
            Appointment Slots
          </a>

          {/* Services */}
          <a
            href="/staff/services"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-clinical-950 hover:bg-slate-50"
          >
            Services
          </a>

          {/* Lab Results */}
          <a
            href="/staff/lab-results"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-clinical-950 hover:bg-slate-50"
          >
            Lab Results
          </a>
        </div>
      </section>
    </div>
  );
}
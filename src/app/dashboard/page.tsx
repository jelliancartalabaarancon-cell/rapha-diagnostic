import type { Metadata } from "next";
import { CalendarPlus, CalendarDays, Settings2, User2 } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById, toPublicUser } from "@/lib/data/users";
import { getAppointmentsByUser, getNextUpcomingAppointment } from "@/lib/data/appointments";
import { AppointmentCard } from "@/components/dashboard/appointment-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { APPOINTMENT_STATUS_STYLES, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard — RAPHA Patient Portal" };

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export default async function DashboardHomePage() {
  const session = await auth();



if (!session?.user?.id) {
  redirect("/login");
}

const userId = session.user.id;

  const userRecord = await getUserById(userId);

if (!userRecord) {
  redirect("/login");
}

const user = toPublicUser(userRecord);

const allAppointments = await getAppointmentsByUser(userId);
const upcoming = await getNextUpcomingAppointment(userId);
  const firstName = user.fullName.split(" ")[0];

  if (allAppointments.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s your patient dashboard.</p>

        <div className="mt-8">
          <EmptyState
            icon={CalendarPlus}
            title="You currently have no appointments."
            description="Book your first laboratory service and we'll take it from there — you can track its status right here."
            action={
              <LinkButton href="/dashboard/appointments/new" size="lg">
                Make an Appointment
              </LinkButton>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            {upcoming ? "Upcoming Appointment" : "Appointment Status"}
          </h2>

          <div className="mt-3">
            {upcoming ? (
              <AppointmentCard appointment={upcoming} showActions={false} />
            ) : (
              <Card className="p-6 text-sm text-slate-500">
                You don&apos;t have an upcoming appointment right now. Your most recent one is
                marked{" "}
                <span
                  className={cn(
                    "mx-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    APPOINTMENT_STATUS_STYLES[allAppointments[0].status].className
                  )}
                >
                  {APPOINTMENT_STATUS_STYLES[allAppointments[0].status].label}
                </span>
                . Ready for another one?
              </Card>
            )}
          </div>

          <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Quick Actions
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LinkButton href="/dashboard/appointments/new" variant="primary" className="justify-center">
              <CalendarPlus className="h-4 w-4" />
              Make Appointment
            </LinkButton>
            <LinkButton href="/dashboard/appointments" variant="secondary" className="justify-center">
              <CalendarDays className="h-4 w-4" />
              View Appointments
            </LinkButton>
            <LinkButton href="/dashboard/settings" variant="secondary" className="justify-center">
              <Settings2 className="h-4 w-4" />
              Account Settings
            </LinkButton>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Patient Information
          </h2>
          <Card className="mt-3 p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-clinical-50 text-clinical-600">
                <User2 className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-clinical-950">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-400">Patient</p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Age</dt>
                <dd className="text-slate-700">{user.age}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Gender</dt>
                <dd className="text-slate-700">{GENDER_LABELS[user.gender]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-400">Email</dt>
                <dd className="truncate text-slate-700">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Contact No.</dt>
                <dd className="text-slate-700">{user.contactNumber || "—"}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

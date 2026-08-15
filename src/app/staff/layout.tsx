
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  StaffSidebar,
  StaffMobileNav,
} from "@/components/staff/staff-sidebar";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (
    session.user.role !== "STAFF" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  const role = session.user.role;

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      <StaffSidebar role={role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <StaffMobileNav role={role} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

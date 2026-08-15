import { redirect } from "next/navigation";
import { auth } from "@/auth";

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

  return <>{children}</>;
}
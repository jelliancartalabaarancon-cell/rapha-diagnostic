import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById, toPublicUser } from "@/lib/data/users";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Account Settings — RAPHA Patient Portal" };

export default async function AccountSettingsPage() {
  const session = await auth();
  const userRecord = getUserById(session!.user.id);
  if (!userRecord) {
    redirect("/login");
  }
  const user = toPublicUser(userRecord);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Update your profile and manage your password.</p>
      </div>

      <section>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Profile Information
        </h2>
        <Card className="mt-3 p-6 sm:p-8">
          <ProfileForm user={user} />
        </Card>
      </section>

      <section>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Change Password
        </h2>
        <Card className="mt-3 p-6 sm:p-8">
          <PasswordForm />
        </Card>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { BellOff } from "lucide-react";
import { auth } from "@/auth";
import { getNotificationsByUser } from "@/lib/data/notifications";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Notifications — RAPHA Patient Portal" };

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await getNotificationsByUser(session!.user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-clinical-950">Notifications</h1>
      <p className="mt-1 text-sm text-slate-500">
        Appointment reminders and account alerts will show up here.
      </p>

      <div className="mt-8">
        {notifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="You have no notifications."
            description="Once your appointments are confirmed or your results are ready, we'll let you know here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id} className="p-4">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="mt-1 text-sm text-slate-500">{n.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

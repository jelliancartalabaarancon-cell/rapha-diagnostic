import { prisma } from "@/lib/prisma";
import { Notification } from "@/types";

function mapNotification(notification: any): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

// Get all notifications of a user
export async function getNotificationsByUser(
  userId: string,
): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications.map(mapNotification);
}

// Create a notification for a user
export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
}): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
    },
  });

  return mapNotification(notification);
}

// Mark one notification as read
export async function markNotificationAsRead(
  id: string,
  userId: string,
): Promise<Notification | undefined> {
  const existing = await prisma.notification.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) return undefined;

  const notification = await prisma.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });

  return mapNotification(notification);
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

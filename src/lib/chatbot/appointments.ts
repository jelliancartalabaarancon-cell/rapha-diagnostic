import { prisma } from "@/lib/prisma";

export async function getPatientAppointments(userId: string) {
  return await prisma.appointment.findMany({
    where: {
      userId,
    },
    include: {
      service: {
        select: {
          name: true,
        },
      },
      slot: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

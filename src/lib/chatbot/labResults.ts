import { prisma } from "@/lib/prisma";

export async function getPatientLabResults(userId: string) {
  return prisma.labResult.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
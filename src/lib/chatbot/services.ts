import { prisma } from "@/lib/prisma";

export async function getAvailableServices() {
  return await prisma.service.findMany({
    where: {
      isActive: true,
    },
    select: {
      name: true,
      description: true,
    },
  });
}
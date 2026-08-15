import { prisma } from "@/lib/prisma";
import { Service } from "@/types";

/*
 * Get all active services.
 */
export async function getActiveServices(): Promise<Service[]> {
  return await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/*
 * Get one service by ID.
 */
export async function getServiceById(id: string): Promise<Service | undefined> {
  const service = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  return service ?? undefined;
}

/*
 * Get all services.
 *
 * Used by the staff service-management page so
 * both active and inactive services are visible.
 */
export async function getAllServices(): Promise<Service[]> {
  return await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

/*
 * Create a new service.
 */
export async function createService(input: {
  name: string;
  description: string;
  icon: string;
}): Promise<Service> {
  const existingService = await prisma.service.findUnique({
    where: {
      name: input.name,
    },
  });

  if (existingService) {
    throw new Error("SERVICE_NAME_TAKEN");
  }

  return await prisma.service.create({
    data: {
      name: input.name,
      description: input.description,
      icon: input.icon,
      isActive: true,
    },
  });
}

/*
 * Update service information.
 */
export async function updateService(
  id: string,
  input: {
    name: string;
    description: string;
    icon: string;
  },
): Promise<Service> {
  /*
   * Check whether another service already
   * uses the requested name.
   */
  const existingService = await prisma.service.findFirst({
    where: {
      name: input.name,
      NOT: {
        id,
      },
    },
  });

  if (existingService) {
    throw new Error("SERVICE_NAME_TAKEN");
  }

  return await prisma.service.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      description: input.description,
      icon: input.icon,
    },
  });
}

/*
 * Activate or deactivate a service.
 */
export async function updateServiceStatus(
  id: string,
  isActive: boolean,
): Promise<Service> {
  return await prisma.service.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
  });
}

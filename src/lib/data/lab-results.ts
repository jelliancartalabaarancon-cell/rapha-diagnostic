import { prisma } from "@/lib/prisma";
import { LabResult } from "@/types";

function mapLabResult(result: any): LabResult {
  return {
    id: result.id,
    userId: result.userId,
    testName: result.testName,
    dateReleased: result.dateReleased
      ? result.dateReleased.toISOString().slice(0, 10)
      : null,
    status: result.status,
    fileUrl: result.fileUrl,
    createdAt: result.createdAt.toISOString(),
  };
}

// Get all lab results of a user
export async function getLabResultsByUser(
  userId: string,
): Promise<LabResult[]> {
  const results = await prisma.labResult.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return results.map(mapLabResult);
}

// Get lab result by ID
export async function getLabResultById(
  id: string,
  userId: string,
): Promise<LabResult | undefined> {
  const result = await prisma.labResult.findFirst({
    where: {
      id,
      userId,
    },
  });

  return result ? mapLabResult(result) : undefined;
}

// Mark a lab result as ready
export async function markLabResultReady(
  id: string,
): Promise<LabResult | undefined> {
  const existing = await prisma.labResult.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    return undefined;
  }

  const result = await prisma.labResult.update({
    where: {
      id,
    },
    data: {
      status: "READY",
      dateReleased: new Date(),
    },
  });

  return mapLabResult(result);
}

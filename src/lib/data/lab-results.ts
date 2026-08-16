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

/*
 * TEMPORARY DEMO RESULTS
 *
 * These demo results are used only while the external
 * laboratory system is not yet connected to RAPHA.
 *
 * When the external laboratory system is connected,
 * these demo results can be removed and the real
 * LabResult records will be used instead.
 */
function getDemoLabResults(userId: string): LabResult[] {
  return [
    {
      id: "demo-lab-result-001",
      userId,
      testName: "Complete Blood Count (CBC)",
      dateReleased: new Date("2026-08-15"),
      status: "READY",
      fileUrl: null,
      createdAt: new Date("2026-08-15T09:30:00.000Z"),
    },
    {
      id: "demo-lab-result-002",
      userId,
      testName: "Fasting Blood Sugar (FBS)",
      dateReleased: new Date("2026-08-12"),
      status: "READY",
      fileUrl: null,
      createdAt: new Date("2026-08-12T10:15:00.000Z"),
    },
    {
      id: "demo-lab-result-003",
      userId,
      testName: "Lipid Profile",
      dateReleased: new Date("2026-08-10"),
      status: "READY",
      fileUrl: null,
      createdAt: new Date("2026-08-10T08:45:00.000Z"),
    },
    {
      id: "demo-lab-result-004",
      userId,
      testName: "Urinalysis",
      dateReleased: new Date("2026-08-08"),
      status: "READY",
      fileUrl: null,
      createdAt: new Date("2026-08-08T11:00:00.000Z"),
    },
  ];
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

  /*
   * TEMPORARY:
   * If the external laboratory system has not provided
   * any real results yet, show the demo results.
   */
  if (results.length === 0) {
    return getDemoLabResults(userId);
  }

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

  if (result) {
    return mapLabResult(result);
  }

  /*
   * TEMPORARY:
   * Allow the demo laboratory results to be opened
   * by their demo IDs.
   */
  const demoResults = getDemoLabResults(userId);

  const demoResult = demoResults.find((result) => result.id === id);

  if (demoResult) {
    return demoResult;
  }

  return undefined;
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

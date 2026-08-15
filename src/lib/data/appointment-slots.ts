import { prisma } from "@/lib/prisma";

/**
 * Get all appointment slots.
 */
export async function getAppointmentSlots() {
  return await prisma.appointmentSlot.findMany({
    orderBy: [
      {
        date: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });
}

/**
 * Get appointment slots for a specific date.
 */
export async function getAppointmentSlotsByDate(date: Date) {
  return await prisma.appointmentSlot.findMany({
    where: {
      date,
    },
    orderBy: {
      startTime: "asc",
    },
  });
}

const PREPARATION_HOURS = 1;

function getPhilippineNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
    }),
  );
}

function getSlotStartDate(date: Date, startTime: string): Date {
  const dateString = date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });

  return new Date(`${dateString}T${startTime}:00`);
}

export function isAppointmentSlotTooSoon(
  date: Date,
  startTime: string,
): boolean {
  const now = getPhilippineNow();
  const slotStart = getSlotStartDate(date, startTime);

  const preparationCutoff = now.getTime() + PREPARATION_HOURS * 60 * 60 * 1000;

  return slotStart.getTime() < preparationCutoff;
}

/**
 * Get one appointment slot.
 */
export async function getAppointmentSlotById(id: string) {
  return await prisma.appointmentSlot.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Create an appointment slot.
 */
export async function createAppointmentSlot(input: {
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
}) {
  return await prisma.appointmentSlot.create({
    data: {
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity: input.capacity,
    },
  });
}

/**
 * Update an appointment slot.
 */
export async function updateAppointmentSlot(
  id: string,
  input: {
    date?: Date;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    isActive?: boolean;
  },
) {
  return await prisma.appointmentSlot.update({
    where: {
      id,
    },
    data: input,
  });
}

/**
 * Activate or deactivate an appointment slot.
 */
export async function setAppointmentSlotActive(id: string, isActive: boolean) {
  return await prisma.appointmentSlot.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
  });
}

/**
 * Delete an appointment slot.
 *
 * Only use this for slots that have no appointments.
 */
export async function deleteAppointmentSlot(id: string) {
  const appointmentCount = await prisma.appointment.count({
    where: {
      slotId: id,
    },
  });

  if (appointmentCount > 0) {
    throw new Error("SLOT_HAS_APPOINTMENTS");
  }

  return await prisma.appointmentSlot.delete({
    where: {
      id,
    },
  });
}

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AppointmentWithService } from "@/types";
import { isAppointmentSlotTooSoon } from "@/lib/data/appointment-slots";

/**
 * Get all appointments belonging to a patient.
 * Appointments are ordered by slot date and start time.
 */
export async function getAppointmentsByUser(
  userId: string,
): Promise<AppointmentWithService[]> {
  return await prisma.appointment.findMany({
    where: {
      userId,
    },
    include: {
      service: true,
      slot: true,
    },
    orderBy: [
      {
        slot: {
          date: "desc",
        },
      },
      {
        slot: {
          startTime: "desc",
        },
      },
    ],
  });
}

/**
 * Get one appointment belonging to a specific patient.
 */
export async function getAppointmentById(
  id: string,
  userId: string,
): Promise<AppointmentWithService | undefined> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      service: true,
      slot: true,
    },
  });

  return appointment ?? undefined;
}

/**
 * Get the patient's next upcoming booked appointment.
 */
export async function getNextUpcomingAppointment(
  userId: string,
): Promise<AppointmentWithService | undefined> {
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      status: "BOOKED",
      slot: {
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    },
    include: {
      service: true,
      slot: true,
    },
    orderBy: [
      {
        slot: {
          date: "asc",
        },
      },
      {
        slot: {
          startTime: "asc",
        },
      },
    ],
  });

  const upcoming = appointments.find((appointment) => {
    const slotDate = appointment.slot.date;

    const [hours, minutes] = appointment.slot.startTime.split(":").map(Number);

    const slotDateTime = new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      hours,
      minutes,
      0,
      0,
    );

    return slotDateTime > now;
  });

  return upcoming;
}

/**
 * Information required to book an appointment.
 */
export interface CreateAppointmentInput {
  userId: string;
  serviceId: string;
  slotId: string;
  notes?: string;
}

/**
 * Book an appointment using an available appointment slot.
 *
 * The slot must start at least one hour from now.
 */
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentWithService> {
  return await prisma.$transaction(async (tx) => {
    const slot = await tx.appointmentSlot.findUnique({
      where: {
        id: input.slotId,
      },
    });

    if (!slot) {
      throw new Error("Appointment slot not found.");
    }

    if (!slot.isActive) {
      throw new Error("Appointment slot is no longer available.");
    }

    /*
     * Do not allow booking within the one-hour
     * laboratory preparation period.
     */
    if (isAppointmentSlotTooSoon(slot.date, slot.startTime)) {
      throw new Error(
        "Appointment slot is no longer available for booking. Laboratory preparation requires at least 1 hour.",
      );
    }

    if (slot.bookedCount >= slot.capacity) {
      throw new Error("Appointment slot is already full.");
    }

    /*
     * Update only if the booked count has not changed.
     *
     * This prevents overbooking when two patients
     * attempt to take the last slot simultaneously.
     */
    const updatedSlot = await tx.appointmentSlot.updateMany({
      where: {
        id: input.slotId,
        isActive: true,
        bookedCount: slot.bookedCount,
      },
      data: {
        bookedCount: {
          increment: 1,
        },
      },
    });

    if (updatedSlot.count === 0) {
      throw new Error("Appointment slot is no longer available.");
    }

    return await tx.appointment.create({
      data: {
        userId: input.userId,
        serviceId: input.serviceId,
        slotId: input.slotId,
        status: "BOOKED",
        notes: input.notes?.trim() || null,
      },
      include: {
        service: true,
        slot: true,
      },
    });
  });
}

/**
 * Get the beginning and end of the current calendar month.
 *
 * Example:
 * August 2026:
 *   start = August 1, 2026
 *   end   = September 1, 2026
 */
function getCurrentMonthRange() {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0,
  );

  return {
    startOfMonth,
    startOfNextMonth,
  };
}

/**
 * Result returned after recording a patient appointment action.
 */
export interface AppointmentActionResult {
  actionCount: number;
  accountDeactivated: boolean;
}

/**
 * Record a cancellation/reschedule action.
 *
 * Cancellation and rescheduling are counted together.
 *
 * When the patient reaches 3 actions during the
 * current calendar month, the account is automatically
 * deactivated.
 *
 * This function must be called inside a Prisma transaction.
 */
async function recordAppointmentAction(
  tx: Prisma.TransactionClient,
  userId: string,
  appointmentId: string,
  type: "CANCELLED" | "RESCHEDULED",
): Promise<AppointmentActionResult> {
  /*
   * Get the current calendar month.
   */
  const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

  /*
   * Record the action first.
   */
  await tx.appointmentAction.create({
    data: {
      userId,
      appointmentId,
      type,
    },
  });

  /*
   * Count all cancellation and rescheduling
   * actions made by this patient during this month.
   */
  const actionCount = await tx.appointmentAction.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      type: {
        in: ["CANCELLED", "RESCHEDULED"],
      },
    },
  });

  /*
   * Automatically deactivate the account
   * after the third action.
   */
  if (actionCount >= 3) {
    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
      },
    });

    return {
      actionCount,
      accountDeactivated: true,
    };
  }

  return {
    actionCount,
    accountDeactivated: false,
  };
}

/**
 * Result returned after rescheduling an appointment.
 */
export interface RescheduleAppointmentResult {
  appointment: AppointmentWithService;
  actionCount: number;
  accountDeactivated: boolean;
}

/**
 * Reschedule an appointment to another available slot.
 *
 * The new slot must be at least one hour from now.
 *
 * Rescheduling counts as one monthly patient action.
 */
export async function rescheduleAppointment(
  id: string,
  userId: string,
  newSlotId: string,
): Promise<RescheduleAppointmentResult | undefined> {
  return await prisma.$transaction(async (tx) => {
    /*
     * Get the appointment.
     */
    const appointment = await tx.appointment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!appointment) {
      return undefined;
    }

    /*
     * Cancelled and completed appointments
     * cannot be rescheduled.
     */
    if (
      appointment.status === "CANCELLED" ||
      appointment.status === "COMPLETED"
    ) {
      return undefined;
    }

    /*
     * If the patient selected the same slot,
     * nothing needs to change.
     *
     * This does NOT count as a reschedule action.
     */
    if (appointment.slotId === newSlotId) {
      const unchanged = await tx.appointment.findUnique({
        where: {
          id,
        },
        include: {
          service: true,
          slot: true,
        },
      });

      if (!unchanged) {
        return undefined;
      }

      return {
        appointment: unchanged,
        actionCount: 0,
        accountDeactivated: false,
      };
    }

    /*
     * Get the new slot.
     */
    const newSlot = await tx.appointmentSlot.findUnique({
      where: {
        id: newSlotId,
      },
    });

    if (!newSlot) {
      throw new Error("New appointment slot not found.");
    }

    /*
     * New slot must be active.
     */
    if (!newSlot.isActive) {
      throw new Error("New appointment slot is unavailable.");
    }

    /*
     * New slot must be at least one hour
     * from the current time.
     */
    if (isAppointmentSlotTooSoon(newSlot.date, newSlot.startTime)) {
      throw new Error(
        "New appointment slot is unavailable because it is within the 1-hour laboratory preparation period.",
      );
    }

    /*
     * New slot must have capacity.
     */
    if (newSlot.bookedCount >= newSlot.capacity) {
      throw new Error("New appointment slot is already full.");
    }

    /*
     * Claim the new slot first.
     *
     * We don't release the patient's existing slot
     * until the new slot has successfully been secured.
     */
    const claimedNewSlot = await tx.appointmentSlot.updateMany({
      where: {
        id: newSlotId,
        isActive: true,
        bookedCount: newSlot.bookedCount,
      },
      data: {
        bookedCount: {
          increment: 1,
        },
      },
    });

    if (claimedNewSlot.count === 0) {
      throw new Error("New appointment slot is no longer available.");
    }

    /*
     * Release the old slot.
     */
    await tx.appointmentSlot.updateMany({
      where: {
        id: appointment.slotId,
        bookedCount: {
          gt: 0,
        },
      },
      data: {
        bookedCount: {
          decrement: 1,
        },
      },
    });

    /*
     * Move the appointment to the new slot.
     */
    const updatedAppointment = await tx.appointment.update({
      where: {
        id,
      },
      data: {
        slotId: newSlotId,
      },
      include: {
        service: true,
        slot: true,
      },
    });

    /*
     * Record the reschedule action.
     *
     * If this becomes the patient's third
     * action this month, their account is
     * automatically deactivated.
     */
    const actionResult = await recordAppointmentAction(
      tx,
      userId,
      id,
      "RESCHEDULED",
    );

    return {
      appointment: updatedAppointment,
      actionCount: actionResult.actionCount,
      accountDeactivated: actionResult.accountDeactivated,
    };
  });
}

/**
 * Result returned after cancelling an appointment.
 */
export interface CancelAppointmentResult {
  appointment: AppointmentWithService;
  actionCount: number;
  accountDeactivated: boolean;
}

/**
 * Cancel an appointment and return its slot capacity.
 *
 * Cancellation counts as one monthly patient action.
 *
 * The appointment can only be cancelled if it is
 * at least one hour away from the current time.
 */
export async function cancelAppointment(
  id: string,
  userId: string,
): Promise<CancelAppointmentResult | undefined> {
  return await prisma.$transaction(async (tx) => {
    /*
     * Get the appointment.
     */
    const appointment = await tx.appointment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        slot: true,
      },
    });

    if (!appointment) {
      return undefined;
    }

    /*
     * Cancelled and completed appointments
     * cannot be cancelled again.
     */
    if (
      appointment.status === "CANCELLED" ||
      appointment.status === "COMPLETED"
    ) {
      return undefined;
    }

    /*
     * Prevent cancellation when the appointment
     * is within the one-hour preparation period.
     */
    if (
      isAppointmentSlotTooSoon(
        appointment.slot.date,
        appointment.slot.startTime,
      )
    ) {
      throw new Error(
        "This appointment can no longer be cancelled because it is within the 1-hour laboratory preparation period.",
      );
    }

    /*
     * Return the slot capacity.
     */
    await tx.appointmentSlot.updateMany({
      where: {
        id: appointment.slotId,
        bookedCount: {
          gt: 0,
        },
      },
      data: {
        bookedCount: {
          decrement: 1,
        },
      },
    });

    /*
     * Mark the appointment as cancelled.
     */
    const cancelledAppointment = await tx.appointment.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        service: true,
        slot: true,
      },
    });

    /*
     * Record the cancellation.
     *
     * This also checks whether the patient has
     * reached 3 actions during the current month.
     */
    const actionResult = await recordAppointmentAction(
      tx,
      userId,
      id,
      "CANCELLED",
    );

    return {
      appointment: cancelledAppointment,
      actionCount: actionResult.actionCount,
      accountDeactivated: actionResult.accountDeactivated,
    };
  });
}

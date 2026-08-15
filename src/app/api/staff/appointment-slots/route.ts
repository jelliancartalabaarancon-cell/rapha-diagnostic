import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createAppointmentSlot,
  getAppointmentSlotById,
  updateAppointmentSlot,
  deleteAppointmentSlot,
  isAppointmentSlotTooSoon,
} from "@/lib/data/appointment-slots";

export async function POST(request: Request) {
  const session = await auth();

  // Only STAFF and ADMIN can create appointment slots.
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { date, startTime, endTime, capacity } = body;

  if (!date || !startTime || !endTime) {
    return NextResponse.json(
      {
        error: "Date, start time, and end time are required.",
      },
      { status: 400 },
    );
  }

  if (
    typeof capacity !== "number" ||
    !Number.isInteger(capacity) ||
    capacity < 1
  ) {
    return NextResponse.json(
      {
        error: "Capacity must be a positive whole number.",
      },
      { status: 400 },
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      {
        error: "End time must be later than start time.",
      },
      { status: 400 },
    );
  }

  const slotDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(slotDate.getTime())) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  // --------------------------------------------------
  // ONE-HOUR PREPARATION RULE
  // --------------------------------------------------

  if (isAppointmentSlotTooSoon(slotDate, startTime)) {
    return NextResponse.json(
      {
        error:
          "This appointment slot must start at least 1 hour from the current time to allow laboratory preparation.",
      },
      { status: 400 },
    );
  }

  try {
    const slot = await createAppointmentSlot({
      date: slotDate,
      startTime,
      endTime,
      capacity,
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          error:
            "An appointment slot with the same date and time already exists.",
        },
        { status: 409 },
      );
    }

    console.error("CREATE APPOINTMENT SLOT ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { id, date, startTime, endTime, capacity, isActive } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      {
        error: "Appointment slot ID is required.",
      },
      { status: 400 },
    );
  }

  try {
    const existingSlot = await getAppointmentSlotById(id);

    if (!existingSlot) {
      return NextResponse.json(
        {
          error: "Appointment slot not found.",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // Determine the final date and start time.
    //
    // This is important because an edit request might
    // change only the date OR only the start time.
    // --------------------------------------------------

    const finalDate =
      date !== undefined ? new Date(`${date}T12:00:00`) : existingSlot.date;

    const finalStartTime =
      startTime !== undefined ? startTime : existingSlot.startTime;

    const finalEndTime = endTime !== undefined ? endTime : existingSlot.endTime;

    // Validate date if a new date was supplied.
    if (date !== undefined && Number.isNaN(finalDate.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    // --------------------------------------------------
    // Prevent editing a slot that has already entered
    // the one-hour preparation window.
    //
    // This also prevents changing an expired slot back
    // into an active/future slot.
    // --------------------------------------------------

    if (isAppointmentSlotTooSoon(finalDate, finalStartTime)) {
      return NextResponse.json(
        {
          error:
            "This appointment slot cannot be edited because it is within the 1-hour laboratory preparation period.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // End time must be later than start time.
    // --------------------------------------------------

    if (finalStartTime >= finalEndTime) {
      return NextResponse.json(
        {
          error: "End time must be later than start time.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Do not allow capacity to become smaller than the
    // number of patients already booked.
    // --------------------------------------------------

    if (
      capacity !== undefined &&
      (typeof capacity !== "number" ||
        !Number.isInteger(capacity) ||
        capacity < existingSlot.bookedCount)
    ) {
      return NextResponse.json(
        {
          error: `Capacity cannot be lower than the current booked count (${existingSlot.bookedCount}).`,
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Do not allow an expired/too-soon slot to be
    // activated.
    // --------------------------------------------------

    if (isActive === true) {
      if (isAppointmentSlotTooSoon(finalDate, finalStartTime)) {
        return NextResponse.json(
          {
            error:
              "This slot cannot be activated because it is within the 1-hour laboratory preparation period.",
          },
          { status: 400 },
        );
      }
    }

    const updatedSlot = await updateAppointmentSlot(id, {
      date: date !== undefined ? finalDate : undefined,
      startTime: startTime !== undefined ? startTime : undefined,
      endTime: endTime !== undefined ? endTime : undefined,
      capacity,
      isActive,
    });

    return NextResponse.json({
      slot: updatedSlot,
    });
  } catch (error) {
    console.error("UPDATE APPOINTMENT SLOT ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json(
      {
        error: "Appointment slot ID is required.",
      },
      { status: 400 },
    );
  }

  try {
    const existingSlot = await getAppointmentSlotById(body.id);

    if (!existingSlot) {
      return NextResponse.json(
        {
          error: "Appointment slot not found.",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // Don't allow deleting a slot that is already
    // inside the preparation window.
    // --------------------------------------------------

    if (isAppointmentSlotTooSoon(existingSlot.date, existingSlot.startTime)) {
      return NextResponse.json(
        {
          error:
            "This appointment slot cannot be deleted because it is already within the 1-hour laboratory preparation period.",
        },
        { status: 400 },
      );
    }

    await deleteAppointmentSlot(body.id);

    return NextResponse.json({
      message: "Appointment slot deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_HAS_APPOINTMENTS") {
      return NextResponse.json(
        {
          error:
            "This slot cannot be deleted because it already has appointments.",
        },
        { status: 409 },
      );
    }

    console.error("DELETE APPOINTMENT SLOT ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

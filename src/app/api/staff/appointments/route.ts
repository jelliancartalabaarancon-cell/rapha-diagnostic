import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();

  // STAFF and ADMIN can manage appointments.
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

  const { appointmentId, action } = body;

  if (!appointmentId || typeof appointmentId !== "string") {
    return NextResponse.json(
      { error: "Appointment ID is required." },
      { status: 400 },
    );
  }

  if (action !== "COMPLETE" && action !== "CANCEL") {
    return NextResponse.json(
      { error: "Invalid appointment action." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        include: {
          slot: true,
          service: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
      }

      // Only BOOKED appointments can be completed or cancelled.
      if (appointment.status !== "BOOKED") {
        throw new Error("APPOINTMENT_NOT_BOOKED");
      }

      /*
       * Mark appointment as completed.
       *
       * The slot remains booked because the appointment
       * has already happened.
       */
      if (action === "COMPLETE") {
        return await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            status: "COMPLETED",
          },
          include: {
            slot: true,
            service: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
      }

      /*
       * Cancel appointment.
       *
       * First return one booking to the appointment slot.
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
       * Then mark the appointment as cancelled.
       */
      return await tx.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          status: "CANCELLED",
        },
        include: {
          slot: true,
          service: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      appointment: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "APPOINTMENT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Appointment not found." },
          { status: 404 },
        );
      }

      if (error.message === "APPOINTMENT_NOT_BOOKED") {
        return NextResponse.json(
          {
            error: "Only booked appointments can be completed or cancelled.",
          },
          { status: 409 },
        );
      }
    }

    console.error("STAFF APPOINTMENT UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update appointment." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  // Only STAFF and ADMIN can manage appointments.
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Appointment ID is required." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { status } = body;

  if (status !== "COMPLETE" && status !== "CANCEL") {
    return NextResponse.json(
      {
        error: "Invalid appointment action.",
      },
      { status: 400 },
    );
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
      include: {
        slot: true,
        service: true,
        user: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    // Only BOOKED appointments can be changed.
    if (appointment.status !== "BOOKED") {
      return NextResponse.json(
        {
          error: "Only booked appointments can be completed or cancelled.",
        },
        { status: 400 },
      );
    }

    /*
     * COMPLETE APPOINTMENT
     */
    if (status === "COMPLETE") {
      const updatedAppointment = await prisma.appointment.update({
        where: {
          id,
        },
        data: {
          status: "COMPLETED",
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              contactNumber: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          slot: true,
        },
      });

      return NextResponse.json({
        appointment: updatedAppointment,
        message: "Appointment marked as completed.",
      });
    }

    /*
     * CANCEL APPOINTMENT
     *
     * When cancelled, return one slot
     * to the available capacity.
     */
    if (status === "CANCEL") {
      const updatedAppointment = await prisma.$transaction(async (tx) => {
        // Return the slot capacity.
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

        // Mark appointment as cancelled.
        return await tx.appointment.update({
          where: {
            id,
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                contactNumber: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            slot: true,
          },
        });
      });

      return NextResponse.json({
        appointment: updatedAppointment,
        message: "Appointment cancelled successfully.",
      });
    }

    return NextResponse.json(
      {
        error: "Unable to update appointment.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("STAFF APPOINTMENT UPDATE ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while updating the appointment.",
      },
      { status: 500 },
    );
  }
}

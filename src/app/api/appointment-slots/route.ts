import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const now = new Date();

    // Start of today.
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.appointmentSlot.findMany({
      where: {
        isActive: true,
        date: {
          gte: today,
        },
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    const availableSlots = slots
      .map((slot) => {
        const slotDate = new Date(slot.date);

        // Build the slot's start date/time using the
        // database date and startTime.
        const [startHour, startMinute] = slot.startTime.split(":").map(Number);

        slotDate.setHours(startHour, startMinute, 0, 0);

        return {
          id: slot.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity,
          bookedCount: slot.bookedCount,
          remaining: Math.max(slot.capacity - slot.bookedCount, 0),
          isActive: slot.isActive,
          slotStart: slotDate,
        };
      })
      // Remove slots that have already started.
      .filter((slot) => {
        if (slot.slotStart <= now) {
          return false;
        }

        return slot.remaining > 0;
      })
      // Do not send the internal slotStart value to the client.
      .map(({ slotStart, ...slot }) => slot);

    return NextResponse.json({
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Get appointment slots error:", error);

    return NextResponse.json(
      { error: "Unable to load appointment slots." },
      { status: 500 },
    );
  }
}

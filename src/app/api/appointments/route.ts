import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations/appointment";
import {
  createAppointment,
  getAppointmentsByUser,
} from "@/lib/data/appointments";
import {
  getAppointmentSlotById,
  isAppointmentSlotTooSoon,
} from "@/lib/data/appointment-slots";
import { getServiceById } from "@/lib/data/services";
import { createNotification } from "@/lib/data/notifications";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const appointments = await getAppointmentsByUser(session.user.id);

  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = appointmentSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Invalid input.",
      },
      { status: 400 },
    );
  }

  const service = await getServiceById(parsed.data.serviceId);

  if (!service) {
    return NextResponse.json(
      { error: "Unknown service selected." },
      { status: 400 },
    );
  }

  /*
   * Validate the appointment slot BEFORE creating the appointment.
   *
   * This is important because the frontend calendar is not enough
   * to protect the system. A user could manually send a POST request.
   */
  const slot = await getAppointmentSlotById(parsed.data.slotId);

  if (!slot) {
    return NextResponse.json(
      { error: "Appointment slot not found." },
      { status: 404 },
    );
  }

  /*
   * The slot must still be active.
   */
  if (!slot.isActive) {
    return NextResponse.json(
      { error: "This appointment slot is no longer available." },
      { status: 409 },
    );
  }

  /*
   * The slot must still have available capacity.
   */
  if (slot.bookedCount >= slot.capacity) {
    return NextResponse.json(
      { error: "Appointment slot is already full." },
      { status: 409 },
    );
  }

  /*
   * The appointment must be at least one hour from now.
   *
   * This uses the same Philippine-time preparation rule
   * used by the appointment-slot management system.
   */
  if (isAppointmentSlotTooSoon(slot.date, slot.startTime)) {
    return NextResponse.json(
      {
        error:
          "This appointment time is too soon. Please choose a time at least 1 hour from now.",
      },
      { status: 409 },
    );
  }

  try {
    /*
     * Create the appointment.
     *
     * createAppointment() performs the final capacity check
     * inside a transaction to prevent overbooking.
     */
    const appointment = await createAppointment({
      userId: session.user.id,
      serviceId: parsed.data.serviceId,
      slotId: parsed.data.slotId,
      notes: parsed.data.notes,
    });

    /*
     * Get the patient's information.
     */
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        fullName: true,
        email: true,
      },
    });

    if (user) {
      /*
       * Format appointment date.
       */
      const appointmentDate = appointment.slot.date.toLocaleDateString(
        "en-PH",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Manila",
        },
      );

      /*
       * Format appointment time.
       */
      const appointmentTime = `${formatTime(
        appointment.slot.startTime,
      )} - ${formatTime(appointment.slot.endTime)}`;

      const notificationTitle = "Appointment Confirmed";

      const notificationMessage =
        `Your ${appointment.service.name} appointment has been confirmed ` +
        `for ${appointmentDate}, ${appointmentTime}.`;

      /*
       * Create in-app notification.
       *
       * Notification failure should NOT cancel the appointment.
       */
      try {
        await createNotification({
          userId: session.user.id,
          title: notificationTitle,
          message: notificationMessage,
        });
      } catch (notificationError) {
        console.error(
          "Create appointment notification error:",
          notificationError,
        );
      }

      /*
       * Send confirmation email.
       *
       * Email failure should NOT cancel the appointment.
       */
      try {
        await sendEmail({
          to: user.email,
          subject: "RAPHA Diagnostic — Appointment Confirmed",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
              <h2 style="color: #0f766e;">
                RAPHA Diagnostic Laboratory
              </h2>

              <p>
                Hello ${escapeHtml(user.fullName)},
              </p>

              <p>
                Your laboratory appointment has been successfully confirmed.
              </p>

              <div style="
                margin: 24px 0;
                padding: 20px;
                border-radius: 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
              ">
                <p style="margin: 0 0 10px;">
                  <strong>Laboratory Service:</strong><br />
                  ${escapeHtml(appointment.service.name)}
                </p>

                <p style="margin: 0 0 10px;">
                  <strong>Date:</strong><br />
                  ${appointmentDate}
                </p>

                <p style="margin: 0;">
                  <strong>Time:</strong><br />
                  ${appointmentTime}
                </p>
              </div>

              <p>
                Please arrive on time for your scheduled laboratory appointment.
              </p>

              <p>
                Thank you for choosing RAPHA Diagnostic Laboratory.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Appointment confirmation email error:", emailError);
      }
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to book appointment.";

    if (
      message === "Appointment slot is no longer available." ||
      message === "Appointment slot is already full."
    ) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    if (message === "Appointment slot not found.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("Create appointment error:", error);

    return NextResponse.json(
      { error: "Unable to create appointment." },
      { status: 500 },
    );
  }
}

/**
 * Convert a 24-hour time such as "13:00"
 * into a display time such as "1:00 PM".
 */
function formatTime(time: string): string {
  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

/**
 * Prevent user/database text from being interpreted
 * as HTML inside the email.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

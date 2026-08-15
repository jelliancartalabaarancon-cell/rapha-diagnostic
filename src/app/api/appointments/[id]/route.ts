import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rescheduleSchema } from "@/lib/validations/appointment";
import {
  cancelAppointment,
  getAppointmentById,
  rescheduleAppointment,
} from "@/lib/data/appointments";
import { createNotification } from "@/lib/data/notifications";
import { sendEmail } from "@/lib/email";

/**
 * Get one appointment belonging to the logged-in patient.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const appointment = await getAppointmentById(id, session.user.id);

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    appointment,
  });
}

/**
 * Reschedule an appointment by selecting another
 * available appointment slot.
 *
 * The new appointment slot must be at least
 * one hour from the current time.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const parsed = rescheduleSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Invalid input.",
      },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const updated = await rescheduleAppointment(
      id,
      session.user.id,
      parsed.data.slotId,
    );

    if (!updated) {
      return NextResponse.json(
        {
          error: "This appointment can no longer be rescheduled.",
        },
        { status: 409 },
      );
    }

    /*
     * rescheduleAppointment() returns:
     *
     * {
     *   appointment,
     *   actionCount,
     *   accountDeactivated
     * }
     *
     * The slot and service belong to appointment.
     */
    const updatedAppointment = updated.appointment;

    /*
     * Get patient information for notification
     * and email.
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
      const appointmentDate = updatedAppointment.slot.date.toLocaleDateString(
        "en-PH",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Manila",
        },
      );

      const appointmentTime =
        `${formatTime(updatedAppointment.slot.startTime)} - ` +
        `${formatTime(updatedAppointment.slot.endTime)}`;

      const notificationTitle = "Appointment Rescheduled";

      const notificationMessage =
        `Your ${updatedAppointment.service.name} appointment has been rescheduled ` +
        `to ${appointmentDate}, ${appointmentTime}.`;

      /*
       * Create in-app notification.
       *
       * Notification failure should not
       * cancel the reschedule.
       */
      try {
        await createNotification({
          userId: session.user.id,
          title: notificationTitle,
          message: notificationMessage,
        });
      } catch (notificationError) {
        console.error(
          "Create reschedule notification error:",
          notificationError,
        );
      }

      /*
       * Send reschedule email.
       *
       * Email failure should not cancel
       * the reschedule.
       */
      try {
        await sendEmail({
          to: user.email,
          subject: "RAPHA Diagnostic — Appointment Rescheduled",
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              color: #334155;
            ">
              <h2 style="color: #0f766e;">
                RAPHA Diagnostic Laboratory
              </h2>

              <p>
                Hello ${escapeHtml(user.fullName)},
              </p>

              <p>
                Your laboratory appointment has been
                successfully rescheduled.
              </p>

              <div style="
                margin: 24px 0;
                padding: 20px;
                border-radius: 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
              ">
                <p style="margin: 0 0 10px;">
                  <strong>
                    Laboratory Service:
                  </strong><br />
                  ${escapeHtml(updatedAppointment.service.name)}
                </p>

                <p style="margin: 0 0 10px;">
                  <strong>New Date:</strong><br />
                  ${appointmentDate}
                </p>

                <p style="margin: 0;">
                  <strong>New Time:</strong><br />
                  ${appointmentTime}
                </p>
              </div>

              <p>
                Please arrive on time for your
                scheduled laboratory appointment.
              </p>

              <p>
                Thank you for choosing
                RAPHA Diagnostic Laboratory.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Reschedule confirmation email error:", emailError);
      }
    }

    return NextResponse.json({
      appointment: updatedAppointment,
      actionCount: updated.actionCount,
      accountDeactivated: updated.accountDeactivated,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reschedule appointment.";

    if (
      message === "New appointment slot is unavailable." ||
      message === "New appointment slot is already full." ||
      message === "New appointment slot is no longer available."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        },
      );
    }

    if (message === "New appointment slot not found.") {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 404,
        },
      );
    }

    if (message.includes("within the 1-hour laboratory preparation period")) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        },
      );
    }

    console.error("Reschedule appointment error:", error);

    return NextResponse.json(
      {
        error: "Unable to reschedule appointment.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Cancel an appointment.
 *
 * Cancellation is only allowed when the appointment
 * is at least one hour away.
 *
 * Cancellation counts toward the patient's
 * monthly cancellation/reschedule limit.
 *
 * After the third action in the same calendar month,
 * the patient's account is automatically deactivated.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const cancellationResult = await cancelAppointment(id, session.user.id);

    if (!cancellationResult) {
      return NextResponse.json(
        {
          error: "Appointment not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * cancelAppointment() returns:
     *
     * {
     *   appointment,
     *   actionCount,
     *   accountDeactivated
     * }
     */
    const cancelled = cancellationResult.appointment;

    /*
     * Get patient information for notification
     * and email.
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
      const appointmentDate = cancelled.slot.date.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Manila",
      });

      const appointmentTime =
        `${formatTime(cancelled.slot.startTime)} - ` +
        `${formatTime(cancelled.slot.endTime)}`;

      const notificationTitle = "Appointment Cancelled";

      const notificationMessage =
        `Your ${cancelled.service.name} appointment scheduled for ` +
        `${appointmentDate}, ${appointmentTime} has been cancelled.`;

      /*
       * Create in-app notification.
       */
      try {
        await createNotification({
          userId: session.user.id,
          title: notificationTitle,
          message: notificationMessage,
        });
      } catch (notificationError) {
        console.error(
          "Create cancellation notification error:",
          notificationError,
        );
      }

      /*
       * Send cancellation email.
       */
      try {
        await sendEmail({
          to: user.email,
          subject: "RAPHA Diagnostic — Appointment Cancelled",
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              color: #334155;
            ">
              <h2 style="color: #0f766e;">
                RAPHA Diagnostic Laboratory
              </h2>

              <p>
                Hello ${escapeHtml(user.fullName)},
              </p>

              <p>
                Your laboratory appointment
                has been cancelled.
              </p>

              <div style="
                margin: 24px 0;
                padding: 20px;
                border-radius: 12px;
                background: #fef2f2;
                border: 1px solid #fecaca;
              ">
                <p style="margin: 0 0 10px;">
                  <strong>
                    Laboratory Service:
                  </strong><br />
                  ${escapeHtml(cancelled.service.name)}
                </p>

                <p style="margin: 0 0 10px;">
                  <strong>Original Date:</strong><br />
                  ${appointmentDate}
                </p>

                <p style="margin: 0;">
                  <strong>Original Time:</strong><br />
                  ${appointmentTime}
                </p>
              </div>

              ${
                cancellationResult.accountDeactivated
                  ? `
                    <div style="
                      margin: 24px 0;
                      padding: 16px;
                      border-radius: 12px;
                      background: #fff7ed;
                      border: 1px solid #fed7aa;
                    ">
                      <p style="
                        margin: 0;
                        font-weight: bold;
                        color: #9a3412;
                      ">
                        Your account has been
                        deactivated.
                      </p>

                      <p style="
                        margin: 8px 0 0;
                      ">
                        You have reached the maximum
                        of 3 appointment cancellations
                        or reschedules within this
                        calendar month.
                      </p>

                      <p style="
                        margin: 8px 0 0;
                      ">
                        Please contact an administrator
                        to reactivate your account.
                      </p>
                    </div>
                  `
                  : ""
              }

              <p>
                ${
                  cancellationResult.accountDeactivated
                    ? "Please contact an administrator if you need to book another appointment."
                    : "If you still need this laboratory service, you may book another available appointment through the RAPHA Patient Portal."
                }
              </p>

              <p>
                Thank you for choosing
                RAPHA Diagnostic Laboratory.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Cancellation email error:", emailError);
      }
    }

    return NextResponse.json({
      appointment: cancelled,
      actionCount: cancellationResult.actionCount,
      accountDeactivated: cancellationResult.accountDeactivated,
      message: cancellationResult.accountDeactivated
        ? "Your appointment has been cancelled. You have reached the maximum of 3 appointment changes this month. Your account has been deactivated. Please contact an administrator to reactivate your account."
        : "Your appointment has been cancelled successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to cancel appointment.";

    /*
     * Appointment is too close to cancel.
     */
    if (
      message ===
      "This appointment can no longer be cancelled because it is within the 1-hour laboratory preparation period."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        },
      );
    }

    console.error("Cancel appointment error:", error);

    return NextResponse.json(
      {
        error: "Unable to cancel appointment.",
      },
      {
        status: 500,
      },
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
 * Prevent user/database text from being
 * interpreted as HTML inside the email.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

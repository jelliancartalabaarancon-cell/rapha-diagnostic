import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail({
      to: "jelliancartalabaarancon@gmail.com",
      subject: "RAPHA Diagnostic — Test Email",
      html: `
        <h2>RAPHA Diagnostic</h2>
        <p>This is a test email from your RAPHA Patient Portal.</p>
        <p>If you received this message, Resend is working correctly.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    console.error("Test email error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to send test email.",
      },
      { status: 500 },
    );
  }
}

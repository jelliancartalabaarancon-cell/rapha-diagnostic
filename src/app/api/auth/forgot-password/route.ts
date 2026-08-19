import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          message: "Please enter your email address.",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the account
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    /*
     * Security:
     * Always return the same message whether the
     * email exists or not.
     */
    if (!user) {
      return NextResponse.json({
        message:
          "If an account with that email exists, a password reset link will be sent.",
      });
    }

    // Delete previous reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires after 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Save token in database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    /*
     * Determine the application URL.
     *
     * Local:
     * http://localhost:3000
     *
     * Production:
     * https://your-vercel-domain.vercel.app
     */
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send password reset email using your existing Gmail SMTP
    await sendEmail({
      to: normalizedEmail,
      subject: "RAPHA Diagnostic Laboratory - Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset Your Password</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
              font-family: Arial, Helvetica, sans-serif;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e2e8f0;
              "
            >

              <!-- Header -->
              <div
                style="
                  background-color: #2563eb;
                  padding: 28px 24px;
                  text-align: center;
                "
              >
                <h1
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 24px;
                  "
                >
                  RAPHA Diagnostic Laboratory
                </h1>
              </div>

              <!-- Content -->
              <div style="padding: 32px 28px;">
                <h2
                  style="
                    margin-top: 0;
                    color: #0f172a;
                    font-size: 22px;
                  "
                >
                  Reset Your Password
                </h2>

                <p
                  style="
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.6;
                  "
                >
                  Hello ${escapeHtml(user.fullName)},
                </p>

                <p
                  style="
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.6;
                  "
                >
                  We received a request to reset the password
                  for your RAPHA Diagnostic Laboratory account.
                </p>

                <p
                  style="
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.6;
                  "
                >
                  Click the button below to create a new password.
                </p>

                <!-- Button -->
                <div
                  style="
                    text-align: center;
                    margin: 30px 0;
                  "
                >
                  <a
                    href="${resetUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 26px;
                      background-color: #2563eb;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      font-size: 15px;
                    "
                  >
                    Reset Password
                  </a>
                </div>

                <p
                  style="
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  This password reset link will expire in
                  <strong>30 minutes</strong>.
                </p>

                <p
                  style="
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>

                <hr
                  style="
                    border: none;
                    border-top: 1px solid #e2e8f0;
                    margin: 28px 0;
                  "
                />

                <p
                  style="
                    color: #94a3b8;
                    font-size: 12px;
                    line-height: 1.5;
                  "
                >
                  If the button does not work, copy and paste
                  the following link into your browser:
                </p>

                <p
                  style="
                    word-break: break-all;
                    color: #2563eb;
                    font-size: 12px;
                  "
                >
                  ${resetUrl}
                </p>
              </div>

              <!-- Footer -->
              <div
                style="
                  background-color: #f8fafc;
                  padding: 20px;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                  "
                >
                  © RAPHA Diagnostic Laboratory
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent to:", normalizedEmail);

    return NextResponse.json({
      message:
        "If an account with that email exists, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        message: "Unable to process your password reset request.",
      },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

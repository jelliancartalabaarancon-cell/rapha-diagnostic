import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!process.env.GMAIL_USER) {
    throw new Error("GMAIL_USER is not configured.");
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_APP_PASSWORD is not configured.");
  }

  const result = await transporter.sendMail({
    from: `RAPHA Diagnostic <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return {
    id: result.messageId,
  };
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validate input
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          message: "Invalid or missing reset token.",
        },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          message: "Please enter a new password.",
        },
        { status: 400 },
      );
    }

    // Basic password requirement
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

    // Token does not exist
    if (!resetToken) {
      return NextResponse.json(
        {
          message: "This password reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    // Check expiration
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return NextResponse.json(
        {
          message: "This password reset link has expired.",
        },
        { status: 400 },
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
      },
    });

    // Delete the token so it cannot be reused
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    return NextResponse.json({
      message: "Your password has been successfully reset.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        message: "Unable to reset your password.",
      },
      { status: 500 },
    );
  }
}

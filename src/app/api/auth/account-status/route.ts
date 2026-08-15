import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        isActive: true,
      },
    });

    if (!user) {
      /*
       * Do not reveal whether an email address
       * exists in the system.
       */
      return NextResponse.json({
        isActive: null,
      });
    }

    return NextResponse.json({
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Account status error:", error);

    return NextResponse.json(
      {
        error: "Unable to check account status.",
      },
      { status: 500 },
    );
  }
}

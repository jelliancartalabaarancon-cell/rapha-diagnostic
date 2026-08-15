import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { createUser } from "@/lib/data/users";
import { Gender } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const user = await createUser({
      fullName: parsed.data.fullName,
      age: parsed.data.age,
      gender: parsed.data.gender as Gender,
      email: parsed.data.email,
      password: parsed.data.password,
      contactNumber: parsed.data.contactNumber || undefined,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

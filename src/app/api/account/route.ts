import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { profileUpdateSchema } from "@/lib/validations/account";
import { updateUserProfile } from "@/lib/data/users";

export async function PATCH(request: Request) {
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

  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateUserProfile(session.user.id, {
      fullName: parsed.data.fullName,
      age: parsed.data.age,
      gender: parsed.data.gender,
      contactNumber: parsed.data.contactNumber || undefined,
      email: parsed.data.email,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "Another account already uses this email." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

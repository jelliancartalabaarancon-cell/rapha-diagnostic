import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { passwordChangeSchema } from "@/lib/validations/account";
import { getUserPasswordHash, updateUserPassword } from "@/lib/data/users";

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

  const parsed = passwordChangeSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const user = await getUserPasswordHash(session.user.id);

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const currentMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!currentMatches) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  await updateUserPassword(user.id, parsed.data.newPassword);

  return NextResponse.json({ success: true });
}

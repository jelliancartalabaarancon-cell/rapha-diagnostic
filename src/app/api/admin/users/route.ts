import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createStaffOrAdmin } from "@/lib/data/users";
import { Gender } from "@prisma/client";

export async function POST(request: Request) {
  // Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 },
    );
  }

  // Only ADMIN can create Staff/Admin accounts
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You are not authorized to create accounts." },
      { status: 403 },
    );
  }

  // Read request body
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Basic validation
  const {
    fullName,
    age,
    gender,
    email,
    password,
    contactNumber,
    role,
  } = body;

  if (
    !fullName ||
    !age ||
    !gender ||
    !email ||
    !password ||
    !role
  ) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 },
    );
  }

  // Only STAFF and ADMIN can be created here.
  if (role !== "STAFF" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Invalid account role." },
      { status: 400 },
    );
  }

  try {
    const user = await createStaffOrAdmin({
      fullName: String(fullName).trim(),
      age: Number(age),
      gender: gender as Gender,
      email: String(email).trim().toLowerCase(),
      password: String(password),
      contactNumber: contactNumber
        ? String(contactNumber).trim()
        : undefined,
      role,
    });

    return NextResponse.json(
      { user },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_TAKEN"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    console.error("Admin create user error:", error);

    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 },
    );
  }
}
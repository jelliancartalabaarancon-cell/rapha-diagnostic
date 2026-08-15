import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Gender, UserRole } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET
 *
 * Used by the Edit Account page to load
 * the selected account.
 *
 * Admins can manage PATIENT, STAFF, and ADMIN accounts.
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();

  // Must be logged in
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  // Only ADMIN can manage accounts
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized to manage accounts.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        error: "Account ID is required.",
      },
      {
        status: 400,
      },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      gender: true,
      email: true,
      contactNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        error: "Account not found.",
      },
      {
        status: 404,
      },
    );
  }

  /*
   * PATIENT, STAFF, and ADMIN accounts
   * are all allowed here.
   */

  return NextResponse.json({
    user,
  });
}

/**
 * PATCH
 *
 * Used for:
 * - Editing account information
 * - Changing account role
 * - Activating/deactivating an account
 *
 * PATIENT, STAFF, and ADMIN accounts can be managed.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  // Must be logged in
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  // Only ADMIN can manage accounts
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized to manage accounts.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        error: "Account ID is required.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Read request body.
   */
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Find the account first.
   */
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      gender: true,
      email: true,
      contactNumber: true,
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json(
      {
        error: "Account not found.",
      },
      {
        status: 404,
      },
    );
  }

  /*
   * PATIENT, STAFF, and ADMIN accounts
   * can all be managed.
   *
   * There is intentionally no role restriction here.
   */

  /*
   * Prevent the currently logged-in Admin
   * from deactivating their own account.
   */
  if (id === session.user.id && body.isActive === false) {
    return NextResponse.json(
      {
        error: "You cannot deactivate your own account.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Prepare update data.
   */
  const updateData: {
    fullName?: string;
    age?: number;
    gender?: Gender;
    email?: string;
    contactNumber?: string | null;
    role?: UserRole;
    isActive?: boolean;
  } = {};

  /*
   * Account status
   */
  if (typeof body.isActive === "boolean") {
    updateData.isActive = body.isActive;
  }

  /*
   * Full name
   */
  if (typeof body.fullName === "string") {
    const fullName = body.fullName.trim();

    if (!fullName) {
      return NextResponse.json(
        {
          error: "Full name cannot be empty.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.fullName = fullName;
  }

  /*
   * Age
   */
  if (body.age !== undefined) {
    const age = Number(body.age);

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return NextResponse.json(
        {
          error: "Age must be between 1 and 120.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.age = age;
  }

  /*
   * Gender
   */
  if (body.gender !== undefined) {
    const validGenders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

    if (!validGenders.includes(body.gender)) {
      return NextResponse.json(
        {
          error: "Invalid gender.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.gender = body.gender as Gender;
  }

  /*
   * Email
   */
  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email address cannot be empty.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Make sure another account isn't
     * already using this email.
     */
    const emailOwner = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (emailOwner && emailOwner.id !== id) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        {
          status: 409,
        },
      );
    }

    updateData.email = email;
  }

  /*
   * Contact number
   */
  if (body.contactNumber !== undefined) {
    const contact =
      typeof body.contactNumber === "string" ? body.contactNumber.trim() : "";

    updateData.contactNumber = contact || null;
  }

  /*
   * Role
   *
   * All three roles are valid:
   * PATIENT
   * STAFF
   * ADMIN
   */
  if (body.role !== undefined) {
    const validRoles = ["PATIENT", "STAFF", "ADMIN"];

    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          error: "Invalid account role.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Prevent an Admin from changing
     * their own role.
     */
    if (id === session.user.id) {
      return NextResponse.json(
        {
          error: "You cannot change your own account role.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.role = body.role as UserRole;
  }

  /*
   * Make sure there is actually something
   * to update.
   */
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      {
        error: "No changes were provided.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        age: true,
        gender: true,
        email: true,
        contactNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    return NextResponse.json(
      {
        error: "Unable to update account.",
      },
      {
        status: 500,
      },
    );
  }
}

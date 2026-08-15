import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { Prisma } from "@prisma/client";

export type User = {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  email: string;
  role: "PATIENT" | "STAFF" | "ADMIN";
  isActive: boolean;
  contactNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  fullName: string;
  age: number;
  gender: Gender;
  email: string;
  password: string;
  contactNumber?: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  age?: number;
  gender?: Gender;
  contactNumber?: string;
  email?: string;
};

function mapUser(user: any): User {
  return {
    id: user.id,
    fullName: user.fullName,
    age: user.age,
    gender: user.gender,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    contactNumber: user.contactNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Get user by email (used for login)
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return null;
  }

  return mapUser(user);
}

// Create new user (registration)
export async function createUser(input: CreateUserInput): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      age: input.age,
      gender: input.gender,
      email: input.email,
      passwordHash,
      contactNumber: input.contactNumber || null,
      role: "PATIENT",
    },
  });

  return mapUser(user);
}

/**
 * Create a Staff or Admin account.
 *
 * This function is intended for the Admin user-management system.
 * Public registration continues to use createUser(), which always
 * creates PATIENT accounts.
 */
export async function createStaffOrAdmin(input: {
  fullName: string;
  age: number;
  gender: Gender;
  email: string;
  password: string;
  contactNumber?: string;
  role: "STAFF" | "ADMIN";
}): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      age: input.age,
      gender: input.gender,
      email: input.email,
      passwordHash,
      contactNumber: input.contactNumber || null,
      role: input.role,
    },
  });

  return mapUser(user);
}

/**
 * Update a Staff or Admin account.
 *
 * This function is intended for the Admin user-management system.
 * It allows an Admin to update account information and role.
 */
export async function updateStaffOrAdmin(
  id: string,
  input: {
    fullName: string;
    age: number;
    gender: Gender;
    email: string;
    contactNumber?: string;
    role: "STAFF" | "ADMIN";
  },
): Promise<User | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return null;
    }

    // Only Staff and Admin accounts should be edited here.
    if (existingUser.role !== "STAFF" && existingUser.role !== "ADMIN") {
      throw new Error("INVALID_ACCOUNT");
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        fullName: input.fullName,
        age: input.age,
        gender: input.gender,
        email: input.email,
        contactNumber: input.contactNumber || null,
        role: input.role,
      },
    });

    return mapUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_TAKEN");
    }

    throw error;
  }
}

// Check password during login
// Check password during login
export async function verifyPassword(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  // Prevent inactive Staff/Admin/Patient accounts from logging in.
  if (!user.isActive) {
    throw new Error("ACCOUNT_DEACTIVATED");
  }

  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return mapUser(user);
}

// Update user profile information
export async function updateUserProfile(
  id: string,
  input: UpdateProfileInput,
): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        fullName: input.fullName,
        age: input.age,
        gender: input.gender,
        contactNumber: input.contactNumber,
        email: input.email,
      },
    });

    return mapUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_TAKEN");
    }

    throw error;
  }
}

// Update password
export async function updateUserPassword(
  id: string,
  newPassword: string,
): Promise<boolean> {
  const passwordHash = await hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      passwordHash,
    },
  });

  return true;
}

export function toPublicUser(user: any): User {
  return {
    id: user.id,
    fullName: user.fullName,
    age: user.age,
    gender: user.gender,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    contactNumber: user.contactNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserPasswordHash(
  id: string,
): Promise<{ id: string; passwordHash: string } | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  return user;
}

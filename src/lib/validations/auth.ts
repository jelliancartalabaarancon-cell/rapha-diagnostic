import { z } from "zod";

const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    age: z.coerce
      .number({ message: "Enter a valid age." })
      .int()
      .min(1, "Enter a valid age.")
      .max(120, "Enter a valid age."),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
      message: "Select a gender.",
    }),
    email: z.string().trim().email("Enter a valid email address."),
    password: passwordRules,
    confirmPassword: z.string(),
    contactNumber: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const adminCreateUserSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter the full name."),

    age: z.coerce
      .number({ message: "Enter a valid age." })
      .int()
      .min(1, "Enter a valid age.")
      .max(120, "Enter a valid age."),

    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
      message: "Select a gender.",
    }),

    email: z.string().trim().email("Enter a valid email address."),

    password: passwordRules,

    confirmPassword: z.string(),

    contactNumber: z.string().trim().optional().or(z.literal("")),

    role: z.enum(["STAFF", "ADMIN"], {
      message: "Select a valid account role.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

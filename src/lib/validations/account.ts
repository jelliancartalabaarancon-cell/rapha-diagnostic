import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  age: z.coerce
    .number({ message: "Enter a valid age." })
    .int()
    .min(1, "Enter a valid age.")
    .max(120, "Enter a valid age."),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    message: "Select a gender.",
  }),
  contactNumber: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address."),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordRules,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

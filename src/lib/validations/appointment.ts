import { z } from "zod";

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Select a laboratory service."),

  slotId: z.string().min(1, "Select an available appointment slot."),

  notes: z
    .string()
    .trim()
    .max(500, "Keep notes under 500 characters.")
    .optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const rescheduleSchema = z.object({
  slotId: z.string().min(1, "Select a new appointment slot."),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;

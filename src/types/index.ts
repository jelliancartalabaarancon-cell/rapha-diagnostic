// Domain types that mirror prisma/schema.prisma.

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type AppointmentStatus = "BOOKED" | "CANCELLED" | "COMPLETED";

export type LabResultStatus = "PENDING" | "READY";

export interface User {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  email: string;
  passwordHash: string;
  contactNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** User shape safe to send to the client. */
export type PublicUser = Omit<User, "passwordHash">;

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AppointmentSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  slotId: string;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentWithService extends Appointment {
  service: Service;
  slot: AppointmentSlot;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface LabResult {
  id: string;
  userId: string;
  testName: string;
  dateReleased: Date | null;
  status: LabResultStatus;
  fileUrl: string | null;
  createdAt: Date;
}

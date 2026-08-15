/*
  Warnings:

  - A unique constraint covering the columns `[date,startTime,endTime]` on the table `appointment_slots` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('PATIENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'PATIENT';

-- CreateIndex
CREATE UNIQUE INDEX `appointment_slots_date_startTime_endTime_key` ON `appointment_slots`(`date`, `startTime`, `endTime`);

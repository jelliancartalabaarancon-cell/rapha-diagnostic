-- CreateTable
CREATE TABLE `lab_result_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `laboratoryNo` VARCHAR(191) NOT NULL,
    `documentHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_result_verifications_laboratoryNo_key`(`laboratoryNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

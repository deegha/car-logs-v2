-- CreateTable
CREATE TABLE `Seller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Seller_email_key`(`email`),
    INDEX `Seller_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Car` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `make` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `year` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `mileage` INTEGER NOT NULL,
    `color` VARCHAR(50) NULL,
    `fuelType` ENUM('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PLUGIN_HYBRID') NOT NULL DEFAULT 'PETROL',
    `transmission` ENUM('AUTOMATIC', 'MANUAL', 'CVT') NOT NULL DEFAULT 'AUTOMATIC',
    `bodyType` VARCHAR(50) NULL,
    `engineSize` VARCHAR(20) NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'AVAILABLE', 'SOLD', 'RESERVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sellerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Car_make_model_idx`(`make`, `model`),
    INDEX `Car_year_idx`(`year`),
    INDEX `Car_price_idx`(`price`),
    INDEX `Car_status_idx`(`status`),
    INDEX `Car_sellerId_idx`(`sellerId`),
    FULLTEXT INDEX `Car_title_make_model_idx`(`title`, `make`, `model`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(200) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `carId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Car` ADD CONSTRAINT `Car_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarImage` ADD CONSTRAINT `CarImage_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

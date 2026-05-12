-- CreateTable
CREATE TABLE `SellerPhone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(20) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isWhatsApp` BOOLEAN NOT NULL DEFAULT false,
    `sellerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SellerPhone_sellerId_idx`(`sellerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SellerPhone` ADD CONSTRAINT `SellerPhone_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing phone data — strip +94 / 94 / leading 0 to store local 9-digit form
INSERT INTO `SellerPhone` (`number`, `isPrimary`, `isWhatsApp`, `sellerId`)
SELECT
    CASE
        WHEN `phone` LIKE '+94%' THEN SUBSTRING(`phone`, 4)
        WHEN `phone` LIKE '94%'  THEN SUBSTRING(`phone`, 3)
        WHEN `phone` LIKE '0%'   THEN SUBSTRING(`phone`, 2)
        ELSE `phone`
    END,
    true,
    false,
    `id`
FROM `Seller`;

-- DropColumn
ALTER TABLE `Seller` DROP COLUMN `phone`;

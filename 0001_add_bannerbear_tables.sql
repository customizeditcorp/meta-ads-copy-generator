-- Migration: Add Bannerbear Integration Tables
-- Date: 2025-11-06
-- Description: Add tables for photo library, generated images, and Bannerbear configuration

-- Client Photos Table
CREATE TABLE IF NOT EXISTS `client_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clientKnowledgeBaseId` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `thumbnailUrl` VARCHAR(500),
  `description` VARCHAR(255),
  `category` VARCHAR(50),
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `uploadedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_client_photos_client` (`clientKnowledgeBaseId`),
  INDEX `idx_client_photos_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generated Images Table
CREATE TABLE IF NOT EXISTS `generated_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `campaignId` INT NOT NULL,
  `format` VARCHAR(50) NOT NULL,
  `imageUrl` VARCHAR(500) NOT NULL,
  `bannerbearUid` VARCHAR(255),
  `bannerbearTemplateUid` VARCHAR(255),
  `selectedPhotoId` INT,
  `selectedAngle` VARCHAR(100),
  `headline` VARCHAR(255),
  `description` VARCHAR(255),
  `cta` VARCHAR(100),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_generated_images_campaign` (`campaignId`),
  INDEX `idx_generated_images_photo` (`selectedPhotoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Bannerbear Configuration Table
CREATE TABLE IF NOT EXISTS `client_bannerbear_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clientKnowledgeBaseId` INT NOT NULL UNIQUE,
  `bannerbearTemplateStories` VARCHAR(255),
  `bannerbearTemplateFeed45` VARCHAR(255),
  `bannerbearTemplateFeed11` VARCHAR(255),
  `logoUrl` VARCHAR(500),
  `badge1Url` VARCHAR(500),
  `badge2Url` VARCHAR(500),
  `badge3Url` VARCHAR(500),
  `primaryColor` VARCHAR(7),
  `secondaryColor` VARCHAR(7),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bannerbear_config_client` (`clientKnowledgeBaseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

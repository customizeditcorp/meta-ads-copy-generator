import { int, mediumtext, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
import { clientKnowledgeBases, generatedCampaigns } from "./schema";

/**
 * Client photos table - stores photos for image generation
 */
export const clientPhotos = mysqlTable("client_photos", {
  id: int("id").autoincrement().primaryKey(),
  clientKnowledgeBaseId: int("clientKnowledgeBaseId").notNull(),
  
  filename: varchar("filename", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  
  description: varchar("description", { length: 255 }),
  category: varchar("category", { length: 50 }), // "damage", "new_install", "team", etc.
  
  isActive: boolean("isActive").default(true).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type ClientPhoto = typeof clientPhotos.$inferSelect;
export type InsertClientPhoto = typeof clientPhotos.$inferInsert;

/**
 * Generated images table - stores Bannerbear generated images
 */
export const generatedImages = mysqlTable("generated_images", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Reference to generatedCampaigns
  
  format: varchar("format", { length: 50 }).notNull(), // "stories_9x16", "feed_4x5", "feed_1x1"
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  
  bannerbearUid: varchar("bannerbearUid", { length: 255 }),
  bannerbearTemplateUid: varchar("bannerbearTemplateUid", { length: 255 }),
  
  selectedPhotoId: int("selectedPhotoId"), // Reference to clientPhotos
  selectedAngle: varchar("selectedAngle", { length: 100 }), // "pain", "authority", "value"
  
  // Copy used in the image
  headline: varchar("headline", { length: 255 }),
  description: varchar("description", { length: 255 }),
  cta: varchar("cta", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

/**
 * Client Bannerbear configuration - extends client knowledge base with Bannerbear settings
 */
export const clientBannerbearConfig = mysqlTable("client_bannerbear_config", {
  id: int("id").autoincrement().primaryKey(),
  clientKnowledgeBaseId: int("clientKnowledgeBaseId").notNull().unique(),
  
  // Bannerbear Template IDs
  bannerbearTemplateStories: varchar("bannerbearTemplateStories", { length: 255 }),
  bannerbearTemplateFeed45: varchar("bannerbearTemplateFeed45", { length: 255 }),
  bannerbearTemplateFeed11: varchar("bannerbearTemplateFeed11", { length: 255 }),
  
  // Brand Assets URLs
  logoUrl: varchar("logoUrl", { length: 500 }),
  badge1Url: varchar("badge1Url", { length: 500 }), // GAF
  badge2Url: varchar("badge2Url", { length: 500 }), // Malarkey
  badge3Url: varchar("badge3Url", { length: 500 }), // CSLB
  
  // Brand Colors (optional, for future use)
  primaryColor: varchar("primaryColor", { length: 7 }), // #2E3A8C
  secondaryColor: varchar("secondaryColor", { length: 7 }), // #E31E24
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientBannerbearConfig = typeof clientBannerbearConfig.$inferSelect;
export type InsertClientBannerbearConfig = typeof clientBannerbearConfig.$inferInsert;

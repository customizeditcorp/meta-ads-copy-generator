import { int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Client knowledge base table - stores information about clients for GPT training
 */
export const clientKnowledgeBases = mysqlTable("client_knowledge_bases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  website: varchar("website", { length: 500 }),
  businessDescription: text("businessDescription"),
  industry: varchar("industry", { length: 255 }),
  
  // Products/Services
  products: mediumtext("products"), // Can be very long with detailed product info
  
  // Target Audience
  targetDemographics: mediumtext("targetDemographics"),
  targetPsychographics: mediumtext("targetPsychographics"),
  painPoints: mediumtext("painPoints"), // Can be extensive from GPT documents
  desires: mediumtext("desires"),
  
  // Brand Voice
  toneAdjectives: text("toneAdjectives"),
  toneExamples: mediumtext("toneExamples"), // Can have many examples
  antiToneExamples: mediumtext("antiToneExamples"),
  formalityLevel: varchar("formalityLevel", { length: 50 }),
  
  // USP
  usp: mediumtext("usp"),
  differentiators: mediumtext("differentiators"),
  valueProposition: mediumtext("valueProposition"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientKnowledgeBase = typeof clientKnowledgeBases.$inferSelect;
export type InsertClientKnowledgeBase = typeof clientKnowledgeBases.$inferInsert;

/**
 * Generated campaigns table - stores all generated ad copy
 */
export const generatedCampaigns = mysqlTable("generated_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientKnowledgeBaseId: int("clientKnowledgeBaseId").notNull(),
  
  campaignObjective: varchar("campaignObjective", { length: 100 }), // "awareness", "traffic", "engagement", "leads", "sales"
  productFocus: varchar("productFocus", { length: 255 }), // Which product/service this campaign is for
  offerDetails: text("offerDetails"), // Specific offer, discount, etc.
  
  // Generated content - stored as JSON
  generatedContent: text("generatedContent").notNull(), // Full JSON response from GPT
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedCampaign = typeof generatedCampaigns.$inferSelect;
export type InsertGeneratedCampaign = typeof generatedCampaigns.$inferInsert;

/**
 * Documents uploaded for knowledge base import
 */
export const knowledgeBaseDocuments = mysqlTable("knowledge_base_documents", {
  id: int("id").autoincrement().primaryKey(),
  knowledgeBaseId: int("knowledgeBaseId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeBaseDocument = typeof knowledgeBaseDocuments.$inferSelect;
export type InsertKnowledgeBaseDocument = typeof knowledgeBaseDocuments.$inferInsert;

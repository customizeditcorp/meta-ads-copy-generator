import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  products: text("products"), // JSON array of products with descriptions, features, benefits
  
  // Target Audience
  targetDemographics: text("targetDemographics"), // JSON object with age, gender, location, income, occupation
  targetPsychographics: text("targetPsychographics"), // JSON object with interests, values, lifestyle
  painPoints: text("painPoints"), // JSON array of customer pain points
  desires: text("desires"), // JSON array of customer desires
  
  // Brand Voice
  toneAdjectives: text("toneAdjectives"), // JSON array of tone descriptors
  toneExamples: text("toneExamples"), // JSON array of example phrases
  antiToneExamples: text("antiToneExamples"), // JSON array of what to avoid
  formalityLevel: varchar("formalityLevel", { length: 50 }), // "informal", "conversational", "professional", "corporate"
  
  // USP
  usp: text("usp"),
  differentiators: text("differentiators"),
  valueProposition: text("valueProposition"), // Main value proposition/offer
  
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

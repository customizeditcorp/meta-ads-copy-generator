import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  clientKnowledgeBases, 
  ClientKnowledgeBase,
  InsertClientKnowledgeBase,
  generatedCampaigns,
  GeneratedCampaign,
  InsertGeneratedCampaign,
  knowledgeBaseDocuments,
  InsertKnowledgeBaseDocument
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Client Knowledge Base queries
export async function getUserKnowledgeBases(userId: number): Promise<ClientKnowledgeBase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(clientKnowledgeBases).where(eq(clientKnowledgeBases.userId, userId));
}

export async function getKnowledgeBaseById(id: number): Promise<ClientKnowledgeBase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clientKnowledgeBases).where(eq(clientKnowledgeBases.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createKnowledgeBase(data: InsertClientKnowledgeBase): Promise<ClientKnowledgeBase> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clientKnowledgeBases).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await getKnowledgeBaseById(insertedId);
  if (!inserted) throw new Error("Failed to retrieve inserted knowledge base");
  
  return inserted;
}

export async function updateKnowledgeBase(id: number, data: Partial<InsertClientKnowledgeBase>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clientKnowledgeBases).set(data).where(eq(clientKnowledgeBases.id, id));
}

export async function deleteKnowledgeBase(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(clientKnowledgeBases).where(eq(clientKnowledgeBases.id, id));
}

// Generated Campaigns queries
export async function getUserCampaigns(userId: number): Promise<GeneratedCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(generatedCampaigns).where(eq(generatedCampaigns.userId, userId));
}

export async function createGeneratedCampaign(data: InsertGeneratedCampaign): Promise<GeneratedCampaign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedCampaigns).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(generatedCampaigns).where(eq(generatedCampaigns.id, insertedId)).limit(1);
  if (!inserted || inserted.length === 0) throw new Error("Failed to retrieve inserted campaign");
  
  return inserted[0];
}


// Document extraction helpers
export async function saveKnowledgeBaseDocument(doc: InsertKnowledgeBaseDocument) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save document: database not available");
    return null;
  }
  const result = await db.insert(knowledgeBaseDocuments).values(doc);
  return result;
}

export async function getDocumentsByKnowledgeBaseId(kbId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(knowledgeBaseDocuments).where(eq(knowledgeBaseDocuments.knowledgeBaseId, kbId));
}

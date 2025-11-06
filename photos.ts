import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

export const photosRouter = router({
  /**
   * List all photos for a client knowledge base
   */
  listClientPhotos: protectedProcedure
    .input(
      z.object({
        clientKnowledgeBaseId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user owns this knowledge base
      const kb = await db.getKnowledgeBaseById(input.clientKnowledgeBaseId);
      if (!kb || kb.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const photos = await db.getClientPhotos(input.clientKnowledgeBaseId);
      return { photos };
    }),

  /**
   * Get single photo by ID
   */
  getPhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const photo = await db.getPhotoById(input.photoId);

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Verify user owns the knowledge base this photo belongs to
      const kb = await db.getKnowledgeBaseById(photo.clientKnowledgeBaseId);
      if (!kb || kb.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { photo };
    }),

  /**
   * Upload new photo (future feature)
   */
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        clientKnowledgeBaseId: z.number(),
        filename: z.string(),
        url: z.string().url(),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this knowledge base
      const kb = await db.getKnowledgeBaseById(input.clientKnowledgeBaseId);
      if (!kb || kb.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const photo = await db.createClientPhoto({
        clientKnowledgeBaseId: input.clientKnowledgeBaseId,
        filename: input.filename,
        url: input.url,
        description: input.description,
        category: input.category,
      });

      return { photo };
    }),

  /**
   * Delete photo
   */
  deletePhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const photo = await db.getPhotoById(input.photoId);

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Verify user owns the knowledge base this photo belongs to
      const kb = await db.getKnowledgeBaseById(photo.clientKnowledgeBaseId);
      if (!kb || kb.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.deleteClientPhoto(input.photoId);
      return { success: true };
    }),
});

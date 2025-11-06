import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { getBannerbearClient } from "../bannerbear/client";
import { GenerateImageParams } from "../bannerbear/types";

export const bannerbearRouter = router({
  /**
   * Generate images for all 3 formats (Stories, Feed 4:5, Feed 1:1)
   */
  generateImages: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        headline: z.string().max(100),
        description: z.string().max(200),
        cta: z.string().max(50).default("Book Free Estimate"),
        photoUrl: z.string().url(),
        clientKnowledgeBaseId: z.number(),
        selectedPhotoId: z.number(),
        selectedAngle: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Verify user owns this campaign
      const campaign = await db.getCampaignById(input.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      // 2. Get client Bannerbear configuration
      const config = await db.getBannerbearConfig(input.clientKnowledgeBaseId);

      if (!config) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Client Bannerbear configuration not found. Please configure templates first.",
        });
      }

      // 3. Validate required fields
      if (
        !config.bannerbearTemplateStories ||
        !config.bannerbearTemplateFeed45 ||
        !config.bannerbearTemplateFeed11 ||
        !config.logoUrl ||
        !config.badge1Url ||
        !config.badge2Url ||
        !config.badge3Url
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Client Bannerbear configuration incomplete. Missing templates or brand assets.",
        });
      }

      // 4. Prepare modifications data
      const imageData: GenerateImageParams = {
        headline: input.headline,
        subtitle: input.description,
        cta: input.cta,
        logoUrl: config.logoUrl,
        photoUrl: input.photoUrl,
        badge1Url: config.badge1Url,
        badge2Url: config.badge2Url,
        badge3Url: config.badge3Url,
      };

      // 5. Generate all 3 images in parallel
      const bannerbear = getBannerbearClient();

      const templates = [
        { format: "stories_9x16", templateUid: config.bannerbearTemplateStories },
        { format: "feed_4x5", templateUid: config.bannerbearTemplateFeed45 },
        { format: "feed_1x1", templateUid: config.bannerbearTemplateFeed11 },
      ];

      const results = await Promise.allSettled(
        templates.map(async (template) => {
          const modifications = [
            { name: "headline", text: imageData.headline },
            { name: "subtitle", text: imageData.subtitle },
            { name: "cta", text: imageData.cta },
            { name: "logo", image_url: imageData.logoUrl },
            { name: "background_image", image_url: imageData.photoUrl },
            { name: "badge_gaf", image_url: imageData.badge1Url },
            { name: "badge_malarkey", image_url: imageData.badge2Url },
            { name: "badge_cslb", image_url: imageData.badge3Url },
          ];

          const result = await bannerbear.generateImage(
            template.templateUid,
            modifications
          );

          return {
            format: template.format,
            uid: result.uid,
            url: result.image_url,
            templateUid: template.templateUid,
          };
        })
      );

      // 6. Process results
      const images: Array<{
        format: string;
        url: string;
        uid: string;
        templateUid: string;
      }> = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          images.push(result.value);
        } else {
          errors.push(`${templates[index].format}: ${result.reason.message || result.reason}`);
        }
      });

      // 7. If all failed, throw error
      if (images.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `All image generations failed: ${errors.join(", ")}`,
        });
      }

      // 8. Save to database
      const savedImages = await Promise.all(
        images.map((img) =>
          db.createGeneratedImage({
            campaignId: input.campaignId,
            format: img.format,
            imageUrl: img.url,
            bannerbearUid: img.uid,
            bannerbearTemplateUid: img.templateUid,
            selectedPhotoId: input.selectedPhotoId,
            selectedAngle: input.selectedAngle,
            headline: input.headline,
            description: input.description,
            cta: input.cta,
          })
        )
      );

      // 9. Return results
      return {
        success: true,
        images: savedImages.map((img) => ({
          id: img.id,
          format: img.format,
          url: img.imageUrl,
        })),
        errors: errors.length > 0 ? errors : undefined,
      };
    }),

  /**
   * Get generated images for a campaign
   */
  getCampaignImages: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify user owns this campaign
      const campaign = await db.getCampaignById(input.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const images = await db.getCampaignImages(input.campaignId);
      return { images };
    }),

  /**
   * Get Bannerbear configuration for a client
   */
  getClientConfig: protectedProcedure
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

      const config = await db.getBannerbearConfig(input.clientKnowledgeBaseId);
      return { config };
    }),
});

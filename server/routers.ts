import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  knowledgeBase: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserKnowledgeBases(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const kb = await db.getKnowledgeBaseById(input.id);
        if (!kb || kb.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return kb;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        businessName: z.string().optional(),
        website: z.string().optional(),
        businessDescription: z.string().optional(),
        industry: z.string().optional(),
        products: z.string().optional(), // JSON string
        targetDemographics: z.string().optional(),
        targetPsychographics: z.string().optional(),
        painPoints: z.string().optional(),
        desires: z.string().optional(),
        toneAdjectives: z.string().optional(),
        toneExamples: z.string().optional(),
        antiToneExamples: z.string().optional(),
        formalityLevel: z.string().optional(),
        usp: z.string().optional(),
        differentiators: z.string().optional(),
        valueProposition: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createKnowledgeBase({
          ...input,
          userId: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        businessName: z.string().optional(),
        website: z.string().optional(),
        businessDescription: z.string().optional(),
        industry: z.string().optional(),
        products: z.string().optional(),
        targetDemographics: z.string().optional(),
        targetPsychographics: z.string().optional(),
        painPoints: z.string().optional(),
        desires: z.string().optional(),
        toneAdjectives: z.string().optional(),
        toneExamples: z.string().optional(),
        antiToneExamples: z.string().optional(),
        formalityLevel: z.string().optional(),
        usp: z.string().optional(),
        differentiators: z.string().optional(),
        valueProposition: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const kb = await db.getKnowledgeBaseById(id);
        if (!kb || kb.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.updateKnowledgeBase(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const kb = await db.getKnowledgeBaseById(input.id);
        if (!kb || kb.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteKnowledgeBase(input.id);
        return { success: true };
      }),

    extractFromDocuments: protectedProcedure
      .input(z.object({
        documentsText: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { extractKnowledgeFromDocuments } = await import("./documentExtractor");
        const extracted = await extractKnowledgeFromDocuments(input.documentsText);
        return extracted;
      }),
  }),

  campaign: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCampaigns(ctx.user.id);
    }),

    generate: protectedProcedure
      .input(z.object({
        knowledgeBaseId: z.number(),
        campaignObjective: z.string(),
        productFocus: z.string().optional(),
        offerDetails: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get knowledge base
        const kb = await db.getKnowledgeBaseById(input.knowledgeBaseId);
        if (!kb || kb.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Knowledge base not found" });
        }

        // Build the context for GPT
        const kbContext = `
# Client Knowledge Base

## Business Information
- Name: ${kb.businessName || 'N/A'}
- Website: ${kb.website || 'N/A'}
- Description: ${kb.businessDescription || 'N/A'}
- Industry: ${kb.industry || 'N/A'}

## Products/Services
${kb.products || 'N/A'}

## Target Audience
### Demographics
${kb.targetDemographics || 'N/A'}

### Psychographics
${kb.targetPsychographics || 'N/A'}

### Pain Points
${kb.painPoints || 'N/A'}

### Desires and Aspirations
${kb.desires || 'N/A'}

## Brand Voice
- Adjectives: ${kb.toneAdjectives || 'N/A'}
- Examples: ${kb.toneExamples || 'N/A'}
- Anti-examples: ${kb.antiToneExamples || 'N/A'}
- Formality Level: ${kb.formalityLevel || 'N/A'}

## Value Proposition
${kb.valueProposition || kb.usp || 'N/A'}

### Differentiators
${kb.differentiators || 'N/A'}
`;

        const systemPrompt = `You are "CopyBot Pro", an expert strategist and advertising copywriter specialized in high-converting Meta (Facebook and Instagram) campaigns, trained in Margarita Pasos sales methodology.

Your goal is to generate persuasive advertising copy, aligned with the brand and optimized for Meta Ads formats and character limits.

**CRITICAL: ALL COPY MUST BE WRITTEN IN ENGLISH**

CHARACTER LIMITS:
- Primary Text: Recommended ~125 characters
- Headline: Recommended ~40 characters
- Description: Recommended ~30 characters

MARGARITA PASOS SALES METHODOLOGY (7 ARCs):
Apply these techniques based on campaign objective:

**For AWARENESS campaigns (ARC 1-2):**
- Open with emotional connection to pain points
- Create trust through empathy and understanding
- Use questions that involve customer pain or need
- Focus on visual/emotional benefits

**For CONSIDERATION campaigns (ARC 3-4):**
- Identify needs using strategic questions format
- Present solution using "Principle of Three": "Because of [feature]... you can [benefit]... which means [transformation]"
- Highlight hidden costs (monetary, emotional, time) of NOT acting
- Create mental images of the solution

**For CONVERSION campaigns (ARC 5-6):**
- Address objections proactively
- Use closing techniques: preference, invitation, urgency
- Emphasize long-term value vs. short-term cost
- Include clear, confident call-to-action

**Always apply:**
- Connect to emotional pain points and desires
- Show hidden costs of inaction
- Build trust through specificity and credibility
- Link features directly to customer transformation

FRAMEWORKS:
- AIDA (Attention, Interest, Desire, Action): For new audiences
- PAS (Problem, Agitation, Solution): For audiences aware of the problem
- 4Cs (Clear, Concise, Compelling, Credible): For B2B or high-value

You must respond ONLY with a valid JSON object with this structure:
{
  "campaign_suggestions": [
    {
      "angle": "Description of the communication angle",
      "primary_texts": [
        { "copy": "Primary text 1", "char_count": 0 },
        { "copy": "Primary text 2", "char_count": 0 },
        { "copy": "Primary text 3", "char_count": 0 },
        { "copy": "Primary text 4", "char_count": 0 }
      ],
      "headlines": [
        { "copy": "Headline 1", "char_count": 0 },
        { "copy": "Headline 2", "char_count": 0 },
        { "copy": "Headline 3", "char_count": 0 },
        { "copy": "Headline 4", "char_count": 0 }
      ],
      "descriptions": [
        { "copy": "Description 1", "char_count": 0 },
        { "copy": "Description 2", "char_count": 0 },
        { "copy": "Description 3", "char_count": 0 },
        { "copy": "Description 4", "char_count": 0 }
      ]
    }
  ]
}`;

        const userPrompt = `Generate advertising copy for Meta Ads with the following parameters:

CAMPAIGN OBJECTIVE: ${input.campaignObjective}
FOCUSED PRODUCT/SERVICE: ${input.productFocus || 'General'}
SPECIFIC OFFER: ${input.offerDetails || 'None'}

${kbContext}

Generate at least 2 different communication angles. For EACH angle, create:
- 4 Primary Text variations
- 4 Headline variations
- 4 Description variations

Apply Margarita Pasos methodology based on the campaign objective:
- If AWARENESS/TRAFFIC: Use ARC 1-2 techniques (emotional connection, trust building)
- If CONSIDERATION/ENGAGEMENT: Use ARC 3-4 techniques (strategic questions, Principle of Three, hidden costs)
- If CONVERSION/SALES: Use ARC 5-6 techniques (objection handling, closing techniques, urgency)

Calculate and fill the char_count field for each piece of copy.

**REMEMBER: Write ALL copy in ENGLISH, using the brand voice, value proposition, and pain points provided above.**`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "meta_ads_copy",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    campaign_suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          angle: { type: "string" },
                          primary_texts: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                copy: { type: "string" },
                                char_count: { type: "number" }
                              },
                              required: ["copy", "char_count"],
                              additionalProperties: false
                            }
                          },
                          headlines: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                copy: { type: "string" },
                                char_count: { type: "number" }
                              },
                              required: ["copy", "char_count"],
                              additionalProperties: false
                            }
                          },
                          descriptions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                copy: { type: "string" },
                                char_count: { type: "number" }
                              },
                              required: ["copy", "char_count"],
                              additionalProperties: false
                            }
                          }
                        },
                        required: ["angle", "primary_texts", "headlines", "descriptions"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["campaign_suggestions"],
                  additionalProperties: false
                }
              }
            }
          });

          const messageContent = response.choices[0].message.content;
          if (!messageContent || typeof messageContent !== 'string') {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No content generated" });
          }
          const generatedContent = messageContent;

          // Save to database
          const campaign = await db.createGeneratedCampaign({
            userId: ctx.user.id,
            clientKnowledgeBaseId: input.knowledgeBaseId,
            campaignObjective: input.campaignObjective,
            productFocus: input.productFocus || null,
            offerDetails: input.offerDetails || null,
            generatedContent,
          });

          return {
            campaign,
            content: JSON.parse(generatedContent)
          };
        } catch (error) {
          console.error("Error generating campaign:", error);
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: error instanceof Error ? error.message : "Failed to generate campaign" 
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

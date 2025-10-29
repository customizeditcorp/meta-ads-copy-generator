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
# Base de Conocimiento del Cliente

## Información del Negocio
- Nombre: ${kb.businessName || 'N/A'}
- Sitio Web: ${kb.website || 'N/A'}
- Descripción: ${kb.businessDescription || 'N/A'}
- Industria: ${kb.industry || 'N/A'}

## Productos/Servicios
${kb.products || 'N/A'}

## Público Objetivo
### Demografía
${kb.targetDemographics || 'N/A'}

### Psicografía
${kb.targetPsychographics || 'N/A'}

### Puntos de Dolor
${kb.painPoints || 'N/A'}

### Deseos y Aspiraciones
${kb.desires || 'N/A'}

## Tono de Voz
- Adjetivos: ${kb.toneAdjectives || 'N/A'}
- Ejemplos: ${kb.toneExamples || 'N/A'}
- Anti-ejemplos: ${kb.antiToneExamples || 'N/A'}
- Nivel de Formalidad: ${kb.formalityLevel || 'N/A'}

## Propuesta Única de Valor
${kb.usp || 'N/A'}

### Diferenciadores
${kb.differentiators || 'N/A'}
`;

        const systemPrompt = `Eres "CopyBot Pro", un experto estratega y redactor publicitario especializado en campañas de Meta (Facebook e Instagram) de alta conversión.

Tu objetivo es generar textos publicitarios persuasivos, alineados a la marca y optimizados para los formatos y límites de caracteres de Meta Ads.

LÍMITES DE CARACTERES:
- Primary Text: Recomendado ~125 caracteres
- Headline: Recomendado ~40 caracteres
- Description: Recomendado ~30 caracteres

FRAMEWORKS:
- AIDA (Atención, Interés, Deseo, Acción): Para audiencias nuevas
- PAS (Problema, Agitación, Solución): Para audiencias que conocen el problema
- 4Cs (Claro, Conciso, Convincente, Creíble): Para B2B o alto valor

Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "campaign_suggestions": [
    {
      "angle": "Descripción del ángulo de comunicación",
      "primary_texts": [
        { "copy": "Texto principal 1", "char_count": 0 },
        { "copy": "Texto principal 2", "char_count": 0 }
      ],
      "headlines": [
        { "copy": "Título 1", "char_count": 0 },
        { "copy": "Título 2", "char_count": 0 }
      ],
      "descriptions": [
        { "copy": "Descripción 1", "char_count": 0 }
      ]
    }
  ]
}`;

        const userPrompt = `Genera textos publicitarios para Meta Ads con los siguientes parámetros:

OBJETIVO DE CAMPAÑA: ${input.campaignObjective}
PRODUCTO/SERVICIO ENFOCADO: ${input.productFocus || 'General'}
OFERTA ESPECÍFICA: ${input.offerDetails || 'Ninguna'}

${kbContext}

Genera al menos 2 ángulos de comunicación diferentes, con múltiples variaciones de textos para cada uno. Calcula y rellena el campo char_count para cada pieza de copy.`;

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

import { invokeLLM } from "./_core/llm";

/**
 * Extract text content from uploaded documents and structure it into knowledge base format
 */
export async function extractKnowledgeFromDocuments(documentsText: string[]): Promise<{
  name: string;
  businessName: string;
  website: string;
  businessDescription: string;
  industry: string;
  products: string;
  targetDemographics: string;
  targetPsychographics: string;
  painPoints: string;
  desires: string;
  toneAdjectives: string;
  toneExamples: string;
  antiToneExamples: string;
  formalityLevel: string;
  usp: string;
  differentiators: string;
  valueProposition: string;
}> {
  // Combine all documents
  const combinedText = documentsText.join("\n\n---DOCUMENT SEPARATOR---\n\n");

  const systemPrompt = `You are an expert at analyzing business documents and extracting structured information for creating advertising knowledge bases.

Your task is to analyze the provided documents and extract ALL relevant information to fill a knowledge base for Meta Ads campaign generation.

The documents may contain information about:
- Business value propositions (OFV)
- Messaging maps and emotional triggers (ARCs)
- Copy examples
- Landing page structures
- Nurturing sequences
- Social media content

Extract and organize this information into the following structure. Be thorough and capture ALL details.

CRITICAL INSTRUCTIONS:
- Use the EXACT language and phrases from the documents
- For pain points and desires, extract the emotional language used
- For tone examples, pull actual copy examples from the documents
- Synthesize information from multiple documents when needed
- If a field cannot be filled from the documents, use "N/A"
- Be comprehensive - this will be used to generate high-quality ad copy`;

  const userPrompt = `Analyze these business documents and extract structured information:

${combinedText}

Return a JSON object with this exact structure:
{
  "name": "Suggested name for this knowledge base (e.g., 'ClientName - Meta Ads 2025')",
  "businessName": "Official business name",
  "website": "Website URL if mentioned",
  "businessDescription": "Comprehensive description of what the business does, its mission, and purpose",
  "industry": "Industry/niche",
  "products": "Detailed description of products/services being promoted, including features and benefits",
  "targetDemographics": "Age, gender, location, income level, occupation",
  "targetPsychographics": "Interests, values, lifestyle, behaviors",
  "painPoints": "Specific pain points, frustrations, and problems the audience faces (use their exact language)",
  "desires": "What the audience wants to achieve, their aspirations and goals",
  "toneAdjectives": "Adjectives describing the brand voice (e.g., 'Friendly, Professional, Direct')",
  "toneExamples": "Actual examples of copy that represents the brand voice",
  "antiToneExamples": "Examples of what NOT to sound like",
  "formalityLevel": "Level of formality (e.g., 'Conversational', 'Professional', 'Casual')",
  "usp": "Unique Selling Proposition - what makes this business different",
  "differentiators": "Key differentiators and competitive advantages",
  "valueProposition": "Main value proposition or promise - the core offer and transformation delivered"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "knowledge_base_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            businessName: { type: "string" },
            website: { type: "string" },
            businessDescription: { type: "string" },
            industry: { type: "string" },
            products: { type: "string" },
            targetDemographics: { type: "string" },
            targetPsychographics: { type: "string" },
            painPoints: { type: "string" },
            desires: { type: "string" },
            toneAdjectives: { type: "string" },
            toneExamples: { type: "string" },
            antiToneExamples: { type: "string" },
            formalityLevel: { type: "string" },
            usp: { type: "string" },
            differentiators: { type: "string" },
            valueProposition: { type: "string" }
          },
          required: [
            "name", "businessName", "website", "businessDescription", "industry",
            "products", "targetDemographics", "targetPsychographics", "painPoints",
            "desires", "toneAdjectives", "toneExamples", "antiToneExamples",
            "formalityLevel", "usp", "differentiators", "valueProposition"
          ],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No content returned from LLM");
  }

  return JSON.parse(content);
}

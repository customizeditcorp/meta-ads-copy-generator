import Anthropic from "@anthropic-ai/sdk";
import type { InvokeParams, InvokeResult, Message, MessageContent } from "./llm";

const getApiKey = (): string => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return key;
};

const convertToClaudeMessages = (messages: Message[]): Anthropic.MessageParam[] => {
  const claudeMessages: Anthropic.MessageParam[] = [];
  
  for (const msg of messages) {
    // Skip system messages - they'll be handled separately
    if (msg.role === "system") continue;
    
    // Convert content
    let content: string | Array<{ type: "text"; text: string }>;
    
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      content = msg.content.map((part: MessageContent) => {
        if (typeof part === "string") {
          return { type: "text" as const, text: part };
        }
        if (part.type === "text") {
          return { type: "text" as const, text: part.text };
        }
        if (part.type === "image_url") {
          // Claude expects base64 or URL - for now just convert to text description
          return { type: "text" as const, text: `[Image: ${part.image_url.url}]` };
        }
        return { type: "text" as const, text: JSON.stringify(part) };
      });
    } else {
      content = JSON.stringify(msg.content);
    }
    
    claudeMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content,
    });
  }
  
  return claudeMessages;
};

const extractSystemMessage = (messages: Message[]): string => {
  const systemMessages = messages.filter(m => m.role === "system");
  if (systemMessages.length === 0) return "";
  
  return systemMessages
    .map(m => (typeof m.content === "string" ? m.content : JSON.stringify(m.content)))
    .join("\n\n");
};

export async function invokeClaudeAI(params: InvokeParams): Promise<InvokeResult> {
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });
  
  const { messages, responseFormat, response_format, outputSchema, output_schema } = params;
  
  // Extract system message
  const systemMessage = extractSystemMessage(messages);
  
  // Convert messages to Claude format
  const claudeMessages = convertToClaudeMessages(messages);
  
  // Determine if we need JSON output
  const needsJson = 
    responseFormat?.type === "json_schema" ||
    responseFormat?.type === "json_object" ||
    response_format?.type === "json_schema" ||
    response_format?.type === "json_object" ||
    outputSchema ||
    output_schema;
  
  // Build the final system prompt
  let finalSystemPrompt = systemMessage;
  if (needsJson) {
    finalSystemPrompt += "\n\nYou must respond with valid JSON only. Do not include any text outside the JSON structure.";
    
    // If we have a schema, include it
    const schema = 
      (responseFormat?.type === "json_schema" && responseFormat.json_schema) ||
      (response_format?.type === "json_schema" && response_format.json_schema) ||
      outputSchema ||
      output_schema;
    
    if (schema) {
      finalSystemPrompt += `\n\nThe JSON must conform to this schema:\n${JSON.stringify(schema.schema, null, 2)}`;
    }
  }
  
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: finalSystemPrompt,
      messages: claudeMessages,
    });
    
    // Extract text content
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map(block => block.text)
      .join("\n");
    
    // Convert to OpenAI-compatible format
    const result: InvokeResult = {
      id: response.id,
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: textContent,
          },
          finish_reason: response.stop_reason || "stop",
        },
      ],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
    
    return result;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.status} - ${error.message}`);
    }
    throw error;
  }
}

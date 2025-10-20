import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface WritingAssistanceRequest {
  content: string;
  outline?: string;
  context?: string;
  pausePosition: number;
}

export interface WritingAssistanceResponse {
  suggestion: string;
  type: 'continuation' | 'outline_snippet' | 'creative_prompt';
  confidence: number;
}

export async function generateWritingAssistance(request: WritingAssistanceRequest): Promise<WritingAssistanceResponse> {
  try {
    const prompt = `You are an intelligent writing assistant helping overcome writer's block. 

Current writing content:
"""
${request.content}
"""

${request.outline ? `Story outline: ${request.outline}` : ''}

The writer has paused at position ${request.pausePosition}. Provide a helpful writing suggestion that could be:
1. A continuation of the current sentence/paragraph
2. A snippet from the outline to guide the next section
3. A creative prompt to inspire the next direction

Keep suggestions concise (1-2 sentences) and contextually relevant. Respond with JSON in this format:
{
  "suggestion": "your writing suggestion here",
  "type": "continuation|outline_snippet|creative_prompt",
  "confidence": 0.8
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant that provides contextual suggestions to overcome writer's block."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suggestion: result.suggestion || "Consider developing this idea further...",
      type: result.type || "creative_prompt",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
    };
  } catch (error) {
    throw new Error("Failed to generate writing assistance: " + (error as Error).message);
  }
}

export async function generateDocumentOutline(title: string, description: string): Promise<string> {
  try {
    const prompt = `Create a detailed outline for a story titled "${title}". 
    Description: ${description}
    
    Provide a structured outline with main plot points, character development notes, and key scenes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative writing assistant that helps authors develop story outlines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Failed to generate outline";
  } catch (error) {
    throw new Error("Failed to generate outline: " + (error as Error).message);
  }
}

export async function lookupWordDefinition(word: string): Promise<{
  word: string;
  pronunciation: string;
  definition: string;
  synonyms: string[];
  example: string;
}> {
  try {
    const prompt = `Provide a dictionary definition for the word "${word}". Include:
    - Pronunciation in IPA format
    - Clear definition
    - 3-5 synonyms
    - Example sentence
    
    Respond with JSON in this format:
    {
      "word": "${word}",
      "pronunciation": "/pronunciation/",
      "definition": "definition here",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "example": "example sentence here"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful dictionary and thesaurus assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      word: result.word || word,
      pronunciation: result.pronunciation || "",
      definition: result.definition || "Definition not found",
      synonyms: result.synonyms || [],
      example: result.example || "",
    };
  } catch (error) {
    throw new Error("Failed to lookup word definition: " + (error as Error).message);
  }
}

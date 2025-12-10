import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { WordEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ---------------------------------------------------------
// 1. Text Definition
// ---------------------------------------------------------

const definitionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word being defined" },
    phonetic: { type: Type.STRING, description: "IPA phonetic transcription" },
    partOfSpeech: { type: Type.STRING, description: "e.g., Noun, Verb" },
    definition: { type: Type.STRING, description: "Simple definition for learners" },
    example: { type: Type.STRING, description: "A simple example sentence" },
    translation: { type: Type.STRING, description: "Translation if language is detected, else the word itself" },
  },
  required: ["word", "definition", "example"],
};

export const lookupWordDefinition = async (word: string): Promise<Omit<WordEntry, 'id' | 'imageUrl' | 'createdAt'>> => {
  const model = "gemini-2.5-flash";
  const prompt = `Provide a dictionary entry for the word "${word}". 
  Target audience: Language learners. 
  Keep definitions simple and vivid.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: definitionSchema,
        systemInstruction: "You are a helpful dictionary assistant for language learners.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Definition error:", error);
    throw error;
  }
};

// ---------------------------------------------------------
// 2. Image Generation
// ---------------------------------------------------------

export const generateWordImage = async (word: string, context: string): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  const prompt = `A vivid, colorful, cartoon-style illustration representing the word "${word}". 
  Context: ${context}. 
  Style: Minimalist vector art, vibrant colors, suitable for a mobile app icon or flashcard.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      // No responseMimeType for image generation models in this context usually, 
      // but following strict instructions to use generateContent with this model.
    });

    // Iterate parts to find inlineData
    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

// ---------------------------------------------------------
// 3. Story Generation
// ---------------------------------------------------------

export const generateStoryFromWords = async (words: string[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  const wordList = words.join(", ");
  const prompt = `Write a short, fun, and engaging story (max 150 words) that includes the following words: ${wordList}. 
  Bold the words from the list in the story using markdown (**word**). 
  The story should be suitable for language learners.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not generate story.";
  } catch (error) {
    console.error("Story generation error:", error);
    return "Error generating story.";
  }
};

// ---------------------------------------------------------
// 4. Chat Explanation
// ---------------------------------------------------------

export const createChatSession = (initialContext: string) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful language tutor. The user is asking about the word: "${initialContext}". Keep answers concise and helpful.`,
    },
  });
};

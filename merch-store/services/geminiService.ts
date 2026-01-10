import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS } from "../constants";

let ai: GoogleGenAI | null = null;

const initializeGenAI = () => {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const generateFanResponse = async (userMessage: string): Promise<string> => {
  if (!ai) initializeGenAI();
  if (!ai) return "I'm having trouble connecting to the mainframe. Please check the API Key.";

  // Create a context string based on the products to ground the AI
  const productContext = MOCK_PRODUCTS.map(p => 
    `${p.name} (${p.category}): $${p.price}. ${p.stock > 0 ? 'In Stock' : 'Sold Out'}. ${p.description}`
  ).join('\n');

  const systemInstruction = `
    You are 'EchoBot', the official AI assistant for the music artist NEON ECHO's store.
    Your persona is cool, slightly mysterious, but very helpful.
    Use the following product data to answer questions:
    ${productContext}
    
    If asked about tour dates, mention they are coming soon to Europe and North America.
    If asked about sizing, suggest sizing up for a baggy fit on hoodies.
    Keep answers concise (under 50 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I received static interference. Can you repeat that?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection lost. Try again later.";
  }
};
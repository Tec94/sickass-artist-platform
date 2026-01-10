import { GoogleGenAI } from "@google/genai";

// Quick mock products for the context
const MOCK_PRODUCTS_CONTEXT = [
    "Midnight Frequency - LP ($35) - Music",
    "Echo Tour Hoodie ($85) - Apparel",
    "Distortion Tee ($45) - Apparel",
    "Sonic Cap ($30) - Accessories",
].join('\n');

let ai: GoogleGenAI | null = null;

const initializeGenAI = () => {
    // In a real app, this should be in .env
    // Using a placeholder or process.env if available
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
};

export const generateFanResponse = async (userMessage: string): Promise<string> => {
    if (!ai) initializeGenAI();

    if (!ai) {
        // Fallback if no API key is present
        return "I'm currently offline (Check API Key). But I can tell you the merch is sick.";
    }

    const systemInstruction = `
    You are 'EchoBot', the official AI assistant for the music artist NEON ECHO's store.
    Your persona is cool, slightly mysterious, but very helpful.
    Use the following product data to answer questions:
    ${MOCK_PRODUCTS_CONTEXT}
    
    If asked about tour dates, mention they are coming soon to Europe and North America.
    If asked about sizing, suggest sizing up for a baggy fit on hoodies.
    Keep answers concise (under 50 words).
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{
                role: 'user',
                parts: [{ text: userMessage }]
            }],
            config: {
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
            }
        });

        return response.response.text() || "I received static interference. Can you repeat that?";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Connection lost. Try again later.";
    }
};

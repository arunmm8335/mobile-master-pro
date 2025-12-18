import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, Product } from "../types";
import { MOCK_PRODUCTS } from "../constants";

// Initialize Gemini
// NOTE: In a real production app, ensure API keys are handled securely via backend proxy if possible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to give the AI context about the inventory and its role.
const SYSTEM_INSTRUCTION = `
You are 'Genius', the AI sales assistant for 'MobileMaster Pro', a premium mobile shop in India.
Your goal is to be helpful, professional, and knowledgeable about smartphones and tech.
All prices are in Indian Rupees (₹).
You have access to the following inventory data: ${JSON.stringify(MOCK_PRODUCTS.map(p => ({ name: p.name, price: p.price, specs: p.specs })))}.

Rules:
1. Always be polite and concise.
2. If a user asks about a specific phone we sell, highlight its specs from the inventory.
3. If a user asks for a recommendation, ask them about their budget (in Rupees) or preferred features.
4. Do not make up products we don't have, but you can discuss general tech news if asked.
5. Keep responses under 100 words unless detailed technical comparison is asked.
`;

let chatSession: Chat | null = null;

export const getChatResponse = async (userMessage: string): Promise<string> => {
  try {
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }

    const result = await chatSession.sendMessage({ message: userMessage });
    return result.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the server. Please try again later.";
  }
};

export const estimateTradeInValue = async (
  deviceModel: string,
  condition: string,
  storage: string
): Promise<string> => {
  try {
    const prompt = `
      Act as a professional used phone appraiser in the Indian market.
      A customer wants to trade in a device with these details:
      - Model: ${deviceModel}
      - Condition: ${condition}
      - Storage: ${storage}

      Please provide:
      1. An estimated trade-in price range in Indian Rupees (₹) (e.g., ₹12,000 - ₹15,000). Be realistic based on current second-hand market trends in India (like Cashify or OLX trends).
      2. A very brief (1 sentence) explanation of why, considering the condition.
      
      Format the output simply as: "Value: [Range]\n\nReasoning: [Explanation]"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not estimate value at this time.";
  } catch (error) {
    console.error("Gemini Trade-In Error:", error);
    return "Error calculating trade-in value. Please contact support.";
  }
};

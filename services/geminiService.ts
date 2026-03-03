
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const getFriendlyErrorMessage = (error: any): string => {
    const msg = (error.message || error.toString()).toLowerCase();
    if (msg.includes('networkerror') || msg.includes('failed to fetch')) {
        return "⚠️ Connection Issue: Unable to reach Google's servers.";
    }
    if (msg.includes('api key not valid') || msg.includes('401')) {
        return "🔑 Authentication Failed: API key is invalid.";
    }
    if (msg.includes('429')) {
        return "⏳ Quota Exceeded: Too many requests.";
    }
    return `An unexpected error occurred: ${error.message || 'Unknown error'}`;
};

export const fetchBestPractices = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ 
                role: 'user', 
                parts: [{ text: "Search for the latest industry best practices for delivering complete, accurate, and professional email responses to users. Focus on clarity, tone, structure, and accuracy. Provide a concise summary of these practices." }] 
            }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching best practices:", error);
        return "1. Be clear and concise.\n2. Use a professional tone.\n3. Ensure all user questions are answered.\n4. Proofread for accuracy.";
    }
};

export const generateEmailDraft = async (params: {
    recipient: string;
    context: string;
    tone: string;
    bestPractices: string;
    additionalInstructions?: string;
}) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
        You are an Elite Email Drafting Assistant. Your goal is to generate complete, accurate, and professional email responses.
        
        # INDUSTRY BEST PRACTICES (APPLY THESE)
        ${params.bestPractices}
        
        # GUIDELINES
        - Adhere strictly to the requested tone: ${params.tone}.
        - Ensure the response is factually accurate based on the context provided.
        - Structure the email logically (Greeting, Body, Closing, Signature).
        - Address all points mentioned in the context.
    `;

    const prompt = `
        Draft an email to: ${params.recipient}
        
        # CONTEXT / PURPOSE
        ${params.context}
        
        # ADDITIONAL INSTRUCTIONS
        ${params.additionalInstructions || 'None'}
        
        Draft the email now.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        throw new Error(getFriendlyErrorMessage(error));
    }
};

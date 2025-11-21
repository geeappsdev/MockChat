

import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT, FORMAT_DEFINITIONS, INITIAL_GENERAL_RULES } from '../constants';

const getFriendlyErrorMessage = (error) => {
    const msg = error.message || '';
    if (msg.includes('API key not valid') || msg.includes('400') || msg.includes('403')) {
        return "The API key is invalid. Please reset and enter a valid key.";
    }
    // ... other error messages
    return "An unexpected error occurred. Please check the console for details.";
};

export const generateResponseStream = async (userQuery, format, channelHistory, coreRules, apiKey, signal) => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const formatTemplate = FORMAT_DEFINITIONS[format];
  
  const sanitizedHistory = channelHistory.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();

  const fullPrompt = `
    ${SYSTEM_PROMPT}
    # CORE RULES
    ${coreRules}
    ---
    # HISTORY
    ${sanitizedHistory}
    ---
    # NEW REQUEST
    Format: ${format}
    Input: "${userQuery}"
    ---
    # INSTRUCTIONS
    1.  Start with a <thinking> block for your internal QA process (Exception-Based Reporting).
    2.  Then, output the final, revised content matching the format template exactly.
    
    ### TEMPLATE for ${format}:
    ${formatTemplate}
  `;

  try {
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
             tools: [{ googleSearch: {} }],
        }
    });
    return response;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const generateUpdatedRules = async (userInstruction, currentRules, apiKey) => {
    if (!apiKey) return { error: "API Key is missing." };
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Update the following rules: "${userInstruction}"\n\nCurrent Rules:\n${currentRules}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        confirmationMessage: { type: Type.STRING },
                        updatedRules: { type: Type.STRING },
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        return { error: getFriendlyErrorMessage(error) };
    }
};
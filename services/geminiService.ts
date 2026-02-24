
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SYSTEM_PROMPT, INTERNAL_SYSTEM_PROMPT, FORMAT_DEFINITIONS, INTERNAL_SCALED_RULES, CONTEXT_LINKS } from '../constants';

const getFriendlyErrorMessage = (error: any): string => {
    const msg = (error.message || error.toString()).toLowerCase();
    if (msg.includes('networkerror') || msg.includes('failed to fetch')) {
        return "⚠️ Connection Issue: Unable to reach Google's servers. Check your connection.";
    }
    if (msg.includes('api key not valid') || msg.includes('api_key_invalid') || msg.includes('401')) {
        return "🔑 Authentication Failed: API key is invalid or expired.";
    }
    if (msg.includes('429') || msg.includes('quota')) {
        return "⏳ Quota Exceeded: Too many requests. Please wait a moment.";
    }
    if (msg.includes('safety') || msg.includes('blocked')) {
        return "🛡️ Content Blocked: Flagged by safety filters. Try rephrasing.";
    }
    return `An unexpected error occurred: ${error.message || 'Unknown error'}`;
};

export const generateResponseStream = async (userQuery: string, format: string, channelHistory: string, coreRules: string, isNewContext: boolean, signal: AbortSignal, attachments = [], detectedContext: string | null = null, sourceTruthContent = '') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const formatTemplate = FORMAT_DEFINITIONS[format as keyof typeof FORMAT_DEFINITIONS];
  const sanitizedHistory = channelHistory ? channelHistory.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim() : '';
  
  const historyForPrompt = isNewContext 
    ? `The user has started a new context. IGNORE all previous conversation history. New context: "${userQuery}"`
    : `# CONVERSATION HISTORY\n${sanitizedHistory}`;

  let formatEnforcement = formatTemplate ? `You MUST adhere strictly to this template:\n${formatTemplate}` : "Follow standard support format.";

  const isInternal = ['CL', 'INV', 'QS', 'CF'].includes(format);
  const systemPromptToUse = isInternal ? INTERNAL_SYSTEM_PROMPT : SYSTEM_PROMPT;
  const rulesToUse = isInternal ? INTERNAL_SCALED_RULES : coreRules;

  let contextDocsPrompt = "";
  if (detectedContext && CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS]) {
      const verifiedLinks = CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS];
      contextDocsPrompt = `\n# RELEVANT RESOURCES\n${verifiedLinks.map(l => `- ${l.name}: ${l.url}`).join('\n')}`;
  }

  const sourceTruthPrompt = sourceTruthContent.trim() ? `
    # SOURCE OF TRUTH (PRIORITY)
    ${sourceTruthContent}
  ` : '';

  const fullPrompt = `
    ${systemPromptToUse}
    ${sourceTruthPrompt} 
    # CORE RULES
    ${rulesToUse}
    ${contextDocsPrompt}
    ---
    ${historyForPrompt}
    ---
    ${formatEnforcement}
    # NEW USER INPUT
    ${userQuery}
  `;

  const parts: any[] = [{ text: fullPrompt }];
  if (attachments && attachments.length > 0) {
      attachments.forEach((att: any) => {
          if (att.data?.startsWith('data:')) {
            const matches = att.data.match(/^data:(.+);base64,(.+)$/);
            if (matches?.length === 3) {
                parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            }
          }
      });
  }

  try {
      // NOTE: Removed maxOutputTokens to prevent "No Output" issue with Gemini 3 Thinking logic
      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: parts }],
        config: {
          temperature: 0.3,
          tools: [{ googleSearch: {} }]
        },
      });

      return response;
      
  } catch (error) {
      throw new Error(getFriendlyErrorMessage(error));
  }
};

export const generateUpdatedRules = async (userInstruction: string, currentRules: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Rewrite these rules based on: "${userInstruction}"\n\nCURRENT RULES:\n${currentRules}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.1 }
        });
        return { updatedRules: response.text?.trim() || currentRules, confirmationMessage: "Rules updated." };
    } catch (error) {
        return { error: getFriendlyErrorMessage(error) };
    }
};


import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SYSTEM_PROMPT, INTERNAL_SYSTEM_PROMPT, FORMAT_DEFINITIONS, INTERNAL_SCALED_RULES, CONTEXT_LINKS, DAILY_USAGE_LIMIT } from '../constants';

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

const USAGE_KEY = 'gee_daily_usage';
const API_KEY_STORAGE = 'gee_api_key';

export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE);
export const setApiKey = (key: string) => localStorage.setItem(API_KEY_STORAGE, key);
export const clearApiKey = () => localStorage.removeItem(API_KEY_STORAGE);

export const getEnvApiKey = () => {
    try {
        // @ts-ignore
        return import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
    } catch (e) {
        return undefined;
    }
};

export const getDailyUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(USAGE_KEY);
    if (!stored) return { date: today, count: 0 };
    
    const data = JSON.parse(stored);
    if (data.date !== today) return { date: today, count: 0 };
    return data;
};

export const incrementDailyUsage = () => {
    const usage = getDailyUsage();
    usage.count += 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    return usage.count;
};

export const generateResponseStream = async (userQuery: string, format: string, channelHistory: string, coreRules: string, isNewContext: boolean, signal: AbortSignal, attachments = [], detectedContext: string | null = null, sourceTruthContent = '') => {
  const currentUsage = getDailyUsage();
  
  if (currentUsage.count >= DAILY_USAGE_LIMIT) {
      throw new Error(`🛑 Daily Limit Reached: You have reached the fixed daily limit of ${DAILY_USAGE_LIMIT} requests to prevent charges.`);
  }

  const userApiKey = getApiKey();
  const apiKey = (userApiKey && userApiKey !== 'system') ? userApiKey : getEnvApiKey();

  if (!apiKey) {
      throw new Error("🔑 Missing API Key: Please provide a Gemini API key in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const formatTemplate = FORMAT_DEFINITIONS[format as keyof typeof FORMAT_DEFINITIONS];
  
  // Token Optimization: Truncate history to last 4000 chars (~1000 tokens)
  let sanitizedHistory = channelHistory ? channelHistory.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim() : '';
  if (sanitizedHistory.length > 4000) {
      sanitizedHistory = "..." + sanitizedHistory.slice(-4000);
  }
  
  const historyForPrompt = isNewContext 
    ? `[NEW CONTEXT] Ignore previous history.`
    : `# HISTORY\n${sanitizedHistory}`;

  const isInternal = ['CL', 'INV', 'QS', 'CF'].includes(format);
  const systemPromptToUse = isInternal ? INTERNAL_SYSTEM_PROMPT : SYSTEM_PROMPT;
  const rulesToUse = isInternal ? INTERNAL_SCALED_RULES : coreRules;

  let contextDocsPrompt = "";
  if (detectedContext && CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS]) {
      const verifiedLinks = CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS];
      contextDocsPrompt = `\n# RESOURCES\n${verifiedLinks.map(l => `- ${l.name}: ${l.url}`).join('\n')}`;
  }

  const sourceTruthPrompt = sourceTruthContent.trim() ? `\n# SOURCE OF TRUTH\n${sourceTruthContent}` : '';

  const userPrompt = `
    ${historyForPrompt}
    ${sourceTruthPrompt}
    ${contextDocsPrompt}
    ---
    FORMAT: ${formatTemplate ? formatTemplate : "Standard support format."}
    ---
    INPUT: ${userQuery}
  `;

  const parts: any[] = [{ text: userPrompt }];
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
      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: parts }],
        config: {
          systemInstruction: `${systemPromptToUse}\n${rulesToUse}`,
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
    const userApiKey = getApiKey();
    const apiKey = (userApiKey && userApiKey !== 'system') ? userApiKey : getEnvApiKey();
    
    if (!apiKey) return { error: "🔑 Missing API Key" };

    const ai = new GoogleGenAI({ apiKey });
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

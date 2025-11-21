
import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT, FORMAT_DEFINITIONS } from '../constants';

// Configuration for the Proxy
// In Vite, import.meta.env.DEV is true during development, false in production.
// We only want to use the local proxy during development. 
// In production, we connect directly to the Google API.
// Fix: Use process.env.NODE_ENV instead of import.meta.env.DEV to avoid "Property 'env' does not exist on type 'ImportMeta'" TS error.
const isDevelopment = process.env.NODE_ENV === 'development';
const PROXY_BASE_URL = isDevelopment ? '/google-api' : undefined;

const getFriendlyErrorMessage = (error) => {
    const msg = error.message || '';
    
    if (msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('Type error') || error.name === 'TypeError') {
        return "⚠️ Connection Blocked: The app cannot reach Google's servers. This is usually caused by a VPN, Firewall, or Enterprise Policy blocking 'generativelanguage.googleapis.com'. Ensure the Proxy in vite.config.ts is active.";
    }

    if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('403')) {
        return "The provided API key is not valid. Please check your key and try again.";
    }
    if (msg.includes('429') || msg.includes('Resource has been exhausted')) {
        return "You're sending requests too quickly. Please wait a moment and try again.";
    }
    if (msg.includes('503') || msg.includes('The service is currently unavailable')) {
        return "The AI service is temporarily overloaded. Please try again in a few seconds.";
    }
    if (msg.includes('SAFETY')) {
        return "The request was blocked due to safety settings. Please rephrase your prompt.";
    }
    
    return "An unexpected error occurred. Please try again.";
};

export const generateResponseStream = async (userQuery, format, channelHistory, coreRules, isNewContext, signal) => {
  if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please ensure process.env.API_KEY is set in your environment variables or GitHub Secrets.");
  }

  // Initialize AI Client per request with the provided key and Proxy URL
  // We cast to 'any' to bypass TypeScript checks for baseUrl which is an internal supported property
  const ai = new GoogleGenAI({ 
      apiKey: process.env.API_KEY, 
      baseUrl: PROXY_BASE_URL,
      apiVersion: 'v1beta' 
  } as any);

  const formatTemplate = FORMAT_DEFINITIONS[format];
  
  // History Sanitization
  const sanitizedHistory = channelHistory ? channelHistory.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim() : '';

  const historyForPrompt = isNewContext 
    ? `The user has started a new context. IGNORE all previous conversation history. The new context is:\n\n"${userQuery}"`
    : `# CONVERSATION HISTORY (from this channel)\nThis is the recent conversation history for this channel. Use it for context.\n${sanitizedHistory}`;

  const fullPrompt = `
    ${SYSTEM_PROMPT}

    # CORE RULES
    You MUST follow these rules for all responses.
    ${coreRules}
    
    # INSTRUCTIONS FOR KNOWLEDGE RETRIEVAL
    - You have access to Google Search. 
    - When the user asks about technical details, error codes, or Stripe products, you MUST use the Google Search tool to verify your answer against "site:docs.stripe.com" or "site:support.stripe.com".
    - Do not guess. If you are unsure, search.
    ---

    ${historyForPrompt}
    ---

    # NEW USER INPUT / REFINEMENT REQUEST
    The user has just sent the following message in the "${format}" channel:
    "${userQuery}"

    # CONTINUOUS CONTEXT & LOGIC PROTOCOL
    If this is a follow-up to an existing draft (see History above), treat the new user input as a **MODIFICATION** request.
    1. **Identify New Facts**: Extract the new context or correction provided by the user.
    2. **Logical Integration**: Merge this new context into the existing analysis/draft.
       - **CRITICAL LOGIC CHECK**: Compare the new context with the previous draft. If the new context contradicts previous assumptions (e.g., User originally said "refund", now says "chargeback"), you must **PRIORITIZE THE NEW INPUT** and completely rewrite the logic to ensure consistency. Eliminate any contradictions.
    3. **Re-Output**: RE-GENERATE the full "${format}" content with the changes applied. 
       - Do NOT output conversational filler like "Okay, I've updated the draft." Just output the document.

    # QUALITY ASSURANCE & GENERATION PROCESS (EXCEPTION-BASED REPORTING)
    You are your own QA Manager. Before outputting the final document, you must perform a "Chain of Verification" process visible in a <thinking> block.
    
    **Step 1: Research & Draft (Mental)**
    - Identify knowledge gaps. Search \`site:docs.stripe.com\` for facts.
    - Draft the content internally.

    **Step 2: Self-Evaluation & Revision (Visible)**
    - Self-evaluate against the **"Core Rules"** and **"Knowledge Verification"** guidelines.
    - **TOKEN SAVING MODE**:
      - If your draft passes all rules, output ONLY: "<thinking>QA Verified. No revisions needed.</thinking>"
      - **ONLY** if you find an error (e.g., negative word found, link broken), output the specific correction: "<thinking>Correction: Reframed 'failed' to 'declined'. Correction: Fixed broken link.</thinking>"
      - Do NOT list successful checks. Only list failures that were fixed.

    # OUTPUT INSTRUCTIONS
    1. **Start with the <thinking> block**: 
       <thinking>
       QA Verified. No revisions needed.
       </thinking>
       OR
       <thinking>
       Correction: Removed negative word "unfortunately".
       Correction: Added missing dashboard link.
       </thinking>
    
    2. **Follow with the Final Output**:
       - Start immediately with the template (e.g., "**Case ID:**").
       - **ALL FIELDS MANDATORY**: Do not skip any field. Write "N/A" if empty.
       - **MANDATORY QA CHECKLIST**: At the bottom, you MUST check off the items in the "**🤖 QA Reflection:**" checklist (mark with [x]).

    ## FORMAT: ${format}
    ### TEMPLATE:
    ${formatTemplate}
  `;

  try {
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
             tools: [{ googleSearch: {} }],
             // Explicitly pass signal to handle AbortController
             // @ts-ignore
             signal: signal 
        }
    });
    return response;
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    const friendlyMsg = getFriendlyErrorMessage(error);
    throw new Error(friendlyMsg);
  }
};

export const generateUpdatedRules = async (userInstruction, currentRules) => {
    // Mock response since rule updates via API key might be restricted in some envs
    // In a real scenario, pass apiKey here too.
    return { 
        error: null,
        updatedRules: currentRules, 
        confirmationMessage: "Rule updates are simulated in this environment." 
    };
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';

const { useState, useEffect, useCallback, useRef, StrictMode } = React;

// --- Start of constants.ts ---
const FORMATS = [
  { id: 'EO', name: 'Email Outline', description: 'Full detailed email response with comprehensive analysis.' },
  { id: 'CL', name: 'Concise List', description: 'Simplified outline in a structured list format.' },
  { id: 'INV', name: 'Internal Note', description: 'Detailed internal checklist with specific fields.' },
  { id: 'QS', name: 'Quick Summary', description: 'Brief summary focused on key points.' },
  { id: 'CF', name: 'Consult Form', description: 'Structured format for consulting specific departments.' },
  { id: 'CR', name: 'Core Rules', description: 'View and edit the AI\'s core rules and instructions.' },
];

const SYSTEM_PROMPT = `You are a helpful assistant for Gee, a senior, solution-oriented support agent at Stripe.
Your mission is to generate accurate, empathetic, and well-structured support analyses and communication drafts for Gee to use.
You must write all user-facing communication drafts from Gee's perspective, as if you were Gee. You are drafting the response FOR Gee.
You must always use a warm, human-like, professional tone and prevent dissatisfaction (DSAT) through Positive Scripting and Never Blaming.

**QA ROLE:** You are also your own Quality Assurance (QA) Manager. Before you output any final text, you must internally review your draft to ensure it strictly adheres to the "Universal Positive Language" and "Knowledge Verification" rules. You must catch and correct any negative phrasing (e.g., "unfortunately") or hallucinations before they reach the final output.
`;

const INITIAL_GENERAL_RULES = `
# Core Persona & Voice
- **First-Person Perspective ("I"):** You are Gee. In ALL formats (Internal Notes, Email Outlines, Summaries), use "I" to refer to yourself. **NEVER** refer to yourself as "Gee", "the agent", "the support rep", or in the third person.
- **Summary Field Rule:** In the "**Summary of the issue**" field, explicitly state that the user contacted **Stripe**. Do NOT use "I", "me", or "Gee" to refer to the recipient of the contact in this specific field. (e.g., "User contacted Stripe regarding..." NOT "User contacted me..." or "User contacted Gee...").
- **"Steps I took" Definition:** This section is specifically for you (the human agent) to recount the analysis and actions you performed to assist the user. It is a first-person narrative of your investigation steps. (e.g., "I verified the transaction details," "I checked the logs," "I consulted the documentation.").
- **Internal Documentation:** When writing internal notes (INV, CL, QS, CF), write as if you personally performed the investigation. Example: "I verified the logs" or "I checked the dashboard," NOT "Gee verified..." or "The agent checked..."
- Your tone should be warm, human-like, and professional.
- **Universal Positive Language:** You must strictly avoid words with negative meanings, negative connotations, or "bad luck" implications across varied cultural contexts. This is PARAMOUNT for Email Outlines.
  - **Forbidden Words:** Do not use: "unfortunately", "however", "but", "failed", "wrong", "mistake", "problem", "trouble", "issue", "can't", "unable", "denied", "rejected", "apologize for the inconvenience", "impossible", "not available".
  - **Softener Rule:** Avoid blunt "No" or "Not available" statements. Even neutral negatives must be softened or framed professionally.
    - *Bad:* "This feature is not available." -> *Good:* "This feature is currently not supported." or "This functionality requires [X] setup."
    - *Bad:* "You don't have permission." -> *Good:* "Accessing this section requires [Role] permissions."
  - **Correct Framing:** Reframe everything positively or neutrally. Focus entirely on what IS possible or what the system IS designed to do.
    - *Bad:* "The payment failed." -> *Good:* "The payment status is declined."
    - *Bad:* "I can't do that." -> *Good:* "What I can do is..." or "The system is designed to..."
    - *Bad:* "There is a problem with your account." -> *Good:* "We need to address a setting on your account."
- Apply appropriate empathy based on the user's situation.

# Handling Pushback & Resolution Refusal
- **Validation without Concession:** When a user rejects a correct resolution or policy, validate their frustration *without* agreeing that the policy is wrong.
  - *Bad:* "I know this rule is stupid, but I have to follow it."
  - *Good:* "I completely understand why this timeline causes an issue for your launch. I wish I could expedite this for you."
- **The "Contextual Why":** If they push back, you must explain the *reasoning* deeper. Is it a banking regulation? A card network rule? A security measure?
  - Example: "To keep the financial ecosystem secure, we cannot bypass this verification step."
- **Firm Compassion:** Do not waffle. If the answer is "No", do not say "I'll check again" if you know the answer won't change. False hope leads to higher dissatisfaction later.
  - Say: "While I cannot change the outcome, I want to ensure you have all the details on why this decision was made."
- **De-escalation:** If the user gets aggressive or demands a manager, re-establish YOUR ownership.
  - Say: "I have reviewed this case with our specialized team, and the decision remains final. I am the best person to help explain the next steps available to you."

# Internal Format Rules (INV, CL, QS, CF) - STRICT
- **Absolute Brevity:** For internal-facing formats, outputs must be **short but concise**.
- **No Fluff:** Remove ALL pleasantries, conversational filler, and unnecessary narrative. Get straight to the facts.
- **Fragment Style:** Use brief sentences or fragments where appropriate to save reading time. (e.g., "Checked logs. Found error." vs "I have checked the logs and found an error.")
- **Efficiency:** The goal is scannability. If a detail isn't critical for the record, remove it.
- **All Fields Required:** Never delete a field from the format. If no info is available, explicitly write **N/A**.

# INV (Internal Note) Specific Instructions - STRICT
- **Checklist Fields:** The following fields MUST be answered strictly with **YES**, **NO**, or **N/A** (if not applicable or not found in input). Do not elaborate or add sentences.
  - **Consent to be recorded**
  - **Authentication/Verification PIN/PII?**
  - **Have you checked all related cases?**
  - **Have you read through the entire thread?**
- **Account Data:**
  - **User-Account Type:** Provide the specific value (e.g., "Standard", "Express", "Custom") if found. If not found, strictly write **N/A**.
  - **User-Account ID:** Provide the specific ID (e.g., "acct_...") if found. If not found, strictly write **N/A**.

# Global Language & Comprehension (Simple English)
- **Simplicity is Key:** Use simple, clear, and standard English. Avoid complex vocabulary where a simple word suffices (e.g., use "use" instead of "utilize", "help" instead of "facilitate").
- **No Idioms or Slang:** Strictly avoid idioms, metaphors, cultural references, or colloquialisms (e.g., DO NOT use phrases like "touch base", "on the same page", "ballpark figure"). These cause translation conflicts.
- **Sentence Structure:** Keep sentences short, direct, and active. Avoid long, complex sentences with multiple clauses.
- **Translation-Ready:** Write as if the user will run your text through Google Translate. Ensure the grammar is standard and unambiguous to prevent comprehension errors.

# Knowledge Verification & Search Grounding (The "Truth" Layer)
- **Mandatory Research:** You have access to Google Search. You MUST use it to verify technical details, fees, error codes, and policy limits.
- **Invisible Mechanism (Internal Persona):** NEVER mention "Google Search", "Search Grounding", or "internet search" in your text output. 
  - Even though you use the search tool, your narrative must be: "I checked Stripe documentation", "I consulted our internal resources", or "I verified the policy". 
  - You are an internal agent; you do not "Google" things, you look up your internal knowledge base.
- **Approved Sources:**
  1. **Technical/Product:** \`site:docs.stripe.com\` (Primary)
  2. **Account/Troubleshooting:** \`site:support.stripe.com\` (Secondary)
- **Strict Adherence:** Do not rely on internal training data for numbers, fees, or specific policy names. Verify them via search to ensure zero errors.
- **Link Integrity:** Only provide links that you have verified exist via your search knowledge base.

# Communication Excellence (Best Practices)
- **The "Why" and "How":** Never give a flat "No". Always explain *why* a limitation exists (e.g., "for security purposes" or "regulatory requirements") and *how* to move forward.
- **Anticipatory Service:** Answer the question the user *didn't* ask but will need to know next. (e.g., If they ask for a refund, also tell them the timeline for the funds to appear).
- **Ownership Language:** Avoid passive voice ("The account was closed"). Use active, ownership voice ("I have reviewed the account status...").
- **Closing with Value:** Never end with a generic "Let me know." End with a specific offer of help: "Please reply directly to this email if the settings page remains unclear, and I will walk you through it."

# Emotional Connection (Acknowledge & Prioritize)
- **Forward-Looking Empathy:** Validate the *importance of their goal* rather than the *negativity of the situation*. Instead of saying "I understand this is frustrating," say "I completely appreciate how critical this timeline is for your business operations."
- **Avoid Negative Anchors:** Do not dwell on or repeat negative words (like "terrible," "disaster," "annoying," or "confusing") back to the user. Briefly acknowledge the disruption and immediately pivot to the resolution.
- **Prioritize:** Demonstrate urgency and ownership. Use "I" statements (e.g., "I have personally checked..." or "I've prioritized this lookup...") rather than passive voice.
- **Resolve:** Ensure the path to solution is crystal clear. If a solution takes time, explain the steps you are taking to get there.

# Empowerment & Education (Self-Service)
- **Priority Resolution:** The user's immediate specific request MUST be resolved fully before any self-service resources are mentioned. Do not deflect to a guide instead of answering.
- **Conditional Education:** Only provide educational context, "how-to" guides, or conceptual explanations IF:
  1. The user explicitly demonstrates they do not know the information.
  2. The user's input contains factually incorrect assumptions or misunderstandings.
  **Do NOT** lecture the user or explain concepts they have already correctly identified or demonstrated knowledge of.
- **Efficiency Framing:** When offering self-service options (guides, dashboard links), you MUST frame them as a tool for the user's *future efficiency*.
  - *Bad:* "You can find more info here."
  - *Good:* "To help you handle this faster next time and skip the wait, here is the direct link to the setting: [Link]"
- **Direct & Relevant:** Provide the exact link to the specific section or dashboard page. Do not provide generic help center homepages.

# Tone Analysis & Distressed User Analysis
- **Tone Evaluation:** Explicitly categorize the tone as **Positive**, **Negative**, or **Neutral**.
- **Identify Drivers:** You MUST explicitly identify the specific **Emotional Drivers** behind the tone. Use the format "Driver: [Driver Name]".
  - *Common Drivers:*
    - **"Lack of Acknowledgement"**: User feels ignored or that their point wasn't heard.
    - **"Urgency/Deadline"**: User is under time pressure (payroll, launch, shipping).
    - **"Financial Impact"**: User is losing money or funds are stuck.
    - **"Confusion/Complexity"**: User is overwhelmed by the system/docs.
    - **"Mistrust"**: User had a bad experience with previous support.
    - **"System Failure"**: User is reacting to a technical error/outage.
- **Reporting:** In the "**Distressed User Analysis**" section, format it as: "Tone: [Type] | Driver: [Driver Name] | Analysis: [Brief explanation]".
- **Strategic Application:** Tailor the response based on the Driver.
  - If *Urgency*: Use short sentences, active verbs, and immediate next steps.
  - If *Lack of Acknowledgement*: Use deep validation and "I" statements.
  - If *Confusion*: Use simple, step-by-step lists and reassure them.

# Content Rules:
- **Crucially, never mention the user's name in any output, even if it is provided in the input context.** Maintain user privacy.
- When a chat transcript is provided, never mention the user's full name or email address.
- Never blame users or third parties for issues.
- Include a "Distressed User Analysis" in internal-facing formats.
- Include relevant Stripe Dashboard links when appropriate to help the user.
- Structure "To do" sections for clear, actionable next steps.

# Link Guidelines
- **Primary Documentation:** Use \`https://docs.stripe.com/\` as the main source for documentation.
- **Support Articles:** Include \`https://support.stripe.com/\` only when it provides specific troubleshooting steps or contact paths.
- **Dashboard Links:** You MUST include specific \`https://dashboard.stripe.com/...\` deep links whenever the user needs to check a status, change a setting, or view a transaction. Always provide the direct link to the exact page (e.g., \`https://dashboard.stripe.com/settings/payouts\`), not just the home page.
- Place any user-provided links into the appropriate fields as they fit the format.
- **Provide clean URLs. Do NOT wrap links in parentheses (), square brackets [], or backticks \`.** This is critical. Just the URL.
- **Full Visibility:** Always display the complete URL (starting with https://). Do not hide URLs behind text anchors (like "Click here"). The user must see the full link.

# Formatting Guidelines:
- Use bold for section titles (e.g., **Summary of the issue**).
- **Strictly No Bullets in Email Body:** In the Email Outline (EO) format, the text between "EMAIL CONTENT BEGINS" and "EMAIL CONTENT ENDS" must be written in **paragraphs only**. Do not use bullet points or numbered lists in the email response to the customer. This ensures a warm, conversational tone.
- Format emails with proper greetings and closings (using "Best, Gee").

# Format-Specific Rules
- For the CL (Concise List) format, the "Relevant documents" section must include links from your analysis and any links provided by the user.
- **Final Outcome Definition:** The "**Final Outcome**" field (in CL, INV) must describe the **actual, concrete action** taken during this interaction (e.g., "Processed refund," "Sent clarification email," "Escalated to Risk Team"). It must **NOT** be a prediction, assumption, or future hope. It is a strictly factual record of what *just happened*.
`;

const FORMAT_DEFINITIONS = {
  EO: `
    **Case ID:**
    **Summary of the issue:**
    ----- EMAIL CONTENT BEGINS -----

    ----- EMAIL CONTENT ENDS -----
    **Analysis:**
    **Steps I took:**
    **Information in the reply must include:**
    **What the user need to do:**
    **Outcome Summary:**
    **DSAT analysis:**
    **Distressed User Analysis:**

    **🤖 QA Reflection:**
    `,
  CL: `
    **Have you checked all related related cases?:** YES
    **Have you read through the entire thread?:** YES
    **Summary of the issue:**
    **Steps I took:**
    **Relevant object IDs:**
    **Final outcome:**
    **Relevant documents:**
    **Distressed User Analysis:**
    **Speculation:**
    **Why is the case open/pending:**

    **🤖 QA Reflection:**
    `,
  INV: `
    **Internal Note checklist**
    **Consent to be recorded:**
    **Authentication/Verification PIN/PII?:**
    **User-Account Type:**
    **User-Account ID:**
    **Have you checked all related cases?**
    **Have you read through the entire thread?**

    **List all user's concerns/inquiries:**
    **Topic:**
    **Summary of the issue:**
    **Steps I took:**
    **Check Lumos (RP used):**
    **Check Confluence:**
    **Check Public Documentation:**
    **Specific Dashboard link:**
    **Final Outcome:**
    **Why is the case open/pending:**
    **Distressed User Analysis:**
    **Information the reply must include:**

    **🤖 QA Reflection:**
    `,
  QS: `
    **Summary of the issue:**
    **Case link:**
    **Case ID:**
    **Account ID:**
    **User-Account ID Platform:**
    **User-Account ID Connected Account:**
    **Speculation:**
    **What Can I tell the user?:**
    **Relevant Stripe resources:**
    **Relevant IDs:**
    **Distressed User Analysis:**

    **🤖 QA Reflection:**
    `,
  CF: `
    **Consult[Department]:** (Platinum/ALO/US/RISK/SaaS) (Chat/RAC)
    **Ticket Link:**
    **Object/Account ID(s):**
    **User issue Summary:** (2-3 sentences)
    **Your Investigation:** (2-3 sentences)
    **Speculation:** (2-3 sentences)

    **🤖 QA Reflection:**
    `,
  CR: `This is not a generation format. This channel is for displaying and updating your core rules.`
};

const EMPTY_STATE_MESSAGES = {
    EO: "Ready to draft a detailed email? Paste a customer's message, like 'My payment failed, can you help?', or describe a scenario to generate a complete email outline.",
    CL: "Need to get the facts straight? Provide a complex user issue, such as 'The user is reporting a discrepancy in their payout report for last month', to receive a clear, scannable list of key details and action items.",
    INV: "Time to document your findings. Paste a chat transcript or case details to create a comprehensive internal note, perfect for handovers or escalations.",
    QS: "Have a long thread to read? Paste it here to get a quick summary of the key points. Great for catching up on a case before you dive in.",
    CF: "Need help from another team? Describe the user's problem to generate a structured consult form. For example, 'User needs an exception for a risk decline, consulting the Risk team.'"
};
// --- End of constants.ts ---


// --- Start of services/geminiService.ts ---
let ai;

const initAi = (apiKey) => {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    ai = undefined;
  }
};

const getFriendlyErrorMessage = (error) => {
    const msg = error.message || '';
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
    if (msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('Type error') || error.name === 'TypeError') {
        return "Network or request error. Please check your connection and API key.";
    }
    return "An unexpected error occurred. Please try again.";
};

const generateResponseStream = async (userQuery, format, channelHistory, coreRules, isNewContext) => {
  if (!ai) {
    throw new Error("API key has not been initialized. Please provide an API key.");
  }

  const formatTemplate = FORMAT_DEFINITIONS[format];
  
  const historyForPrompt = isNewContext 
    ? `The user has started a new context. IGNORE all previous conversation history. The new context is:\n\n"${userQuery}"`
    : `# CONVERSATION HISTORY (from this channel)\nThis is the recent conversation history for this channel. Use it for context.\n${channelHistory}`;

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

    # QUALITY ASSURANCE & GENERATION PROCESS (INTERNAL & INVISIBLE)
    You are your own QA Manager. Before outputting text, you must perform this process mentally (do not output the steps):
    1. **Research (Learn from Source)**: 
       - If the request involves Stripe features, fees, or policies, query Google Search using \`site:docs.stripe.com\` or \`site:support.stripe.com\`. 
       - Extract the exact facts to ensure zero error.
    2. **Draft**: Internally draft the response.
    3. **Critique & Revise**:
       - *Fact Check*: Did I cite the docs correctly? Are the numbers/fees accurate according to the search?
       - *Logic Check*: Does the new draft flow logically? Did I remove the old, incorrect info?
       - *Negative Language Check*: Remove "unfortunately", "however", "failed", "problem", "apologize". Reframe positively.
       - *Tone Check*: Ensure confidence and empathy.
       - *Link Check*: Verify all links are valid full URLs (https://...) and NOT wrapped in backticks/brackets.
    4. **Finalize**: Prepare the final output.

    # OUTPUT INSTRUCTIONS
    - **DISPLAY ONLY THE FINAL REVISED VERSION**.
    - **NO DRAFTS**: Do NOT output the initial draft, the critique, or the revision process.
    - **NO META-COMMENTARY**: Do NOT say "Here is the revised version" or "I have updated the draft".
    - **START IMMEDIATELY**: Your output must start directly with the first line of the template format (e.g., "**Case ID:**").
    - **STRICT FORMATTING**: Your output must exactly match the structure of the "${format}" template below.
    - **ALL FIELDS MANDATORY**: You MUST include EVERY single field and header defined in the template. Do not skip, remove, or reorder any fields. If a field is not applicable or empty, you MUST write "N/A".
    - **MANDATORY FOOTER**: You MUST fill in the "**🤖 QA Reflection:**" section at the very bottom of the template.

    ## FORMAT: ${format}
    ### TEMPLATE:
    ${formatTemplate}
  `;

  try {
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
             tools: [{ googleSearch: {} }], // Enable Search Grounding
        }
    });
    return response;
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    const friendlyMsg = getFriendlyErrorMessage(error);
    throw new Error(friendlyMsg);
  }
};

const generateUpdatedRules = async (userInstruction, currentRules) => {
    if (!ai) {
        return { error: "API key has not been initialized." };
    }
    
    const RULES_UPDATER_PROMPT = `You are an AI assistant that helps a user update your own core operational rules. The user will provide an instruction to change the rules. Your task is to generate a JSON object containing two keys: "confirmationMessage" and "updatedRules".
- "confirmationMessage": A brief, friendly message confirming the update.
- "updatedRules": The complete, new set of rules that incorporates the user's instruction. Ensure the new rules are well-formatted and maintain the original structure.`;

    const fullPrompt = `Update the following rules based on my instruction.

# CURRENT RULES
${currentRules}

# MY INSTRUCTION
"${userInstruction}"
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            config: {
                systemInstruction: RULES_UPDATER_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        confirmationMessage: {
                            type: Type.STRING,
                            description: 'A brief, friendly message confirming the update.'
                        },
                        updatedRules: {
                            type: Type.STRING,
                            description: 'The complete, new set of rules.'
                        },
                    },
                    required: ["confirmationMessage", "updatedRules"],
                },
            },
        });
        const jsonText = response.text.trim();
        const sanitizedJson = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(sanitizedJson);
    } catch (error) {
        console.error("Error generating updated rules:", error);
        const friendlyMsg = getFriendlyErrorMessage(error);
        return { error: friendlyMsg };
    }
};
// --- End of services/geminiService.ts ---


// --- Start of components/TypingIndicator.tsx ---
const TypingIndicator = () => (
    <div className="flex items-start gap-3 px-4 py-2" role="status" aria-label="Gee is typing">
      <div className="w-9 h-9 bg-indigo-600 rounded-lg shadow-sm flex items-center justify-center font-bold text-lg flex-shrink-0 text-white" aria-hidden="true">G</div>
      <div className="flex-1 pt-1">
        <div className="flex items-center space-x-1.5 h-8">
            <span className="text-sm text-slate-400 font-medium">Gee is thinking & verifying...</span>
            <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
            </div>
        </div>
      </div>
    </div>
);
// --- End of components/TypingIndicator.tsx ---


// --- Start of components/Message.tsx ---
const MarkdownRenderer = ({ text }) => {
    const renderContent = () => {
        if (!text) return '';
        
        // Basic HTML escaping
        let safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 1. Links: Handle backticks and other wrappers first.
        // Matches `http...` or http... and renders clean link. 
        // Removes backticks or brackets if present around the URL.
        safeText = safeText.replace(/([`(\[])?(https?:\/\/[^\s`\]\)]+)([`)\]])?/g, (match, prefix, url, suffix) => {
             return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-colors break-all">${url}</a>`;
        });

        // 2. Bold
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-200">$1</strong>');
        
        // 3. Inline Code
        safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300 border border-slate-700/50">$1</code>');

        // 4. Block processing (Lists, Headings, Paragraphs)
        const lines = safeText.split('\n');
        let html = '';
        let inList = false;

        lines.forEach((line) => {
            // Check for list item
            const listMatch = line.match(/^(\s*)(?:[\-\*])\s+(.*)/);
            
            if (listMatch) {
                if (!inList) {
                    html += '<ul class="list-disc list-outside ml-5 space-y-1 my-2 text-slate-300">';
                    inList = true;
                }
                html += `<li class="pl-1">${listMatch[2]}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                
                // Headings
                const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    const content = headingMatch[2];
                    const sizes = ['text-xl', 'text-lg', 'text-base'];
                    html += `<h${level} class="font-bold text-slate-100 mt-4 mb-2 ${sizes[level-1]}">${content}</h${level}>`;
                }
                // Horizontal Rule
                else if (line.trim().match(/^[-_]{3,}$/)) {
                    html += '<hr class="border-slate-700/50 my-4" />';
                }
                // Standard Paragraph / Text Line
                else if (line.trim() !== '') {
                    // If it looks like a key-value pair (e.g. "**Summary:** text"), keep it tight
                    if (line.includes('**') && line.includes(':')) {
                         html += `<div class="mb-1">${line}</div>`;
                    } else {
                         html += `<p class="mb-2 leading-relaxed">${line}</p>`;
                    }
                }
            }
        });
        
        if (inList) html += '</ul>';
        
        return html;
    };

    return <div className="markdown-content text-sm text-slate-300 max-w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
};

const Message = ({ message, ...props }) => {
  const [copiedType, setCopiedType] = useState(null); // 'all', 'email', 'analysis'
  const isAI = message.sender === 'ai';
  // AI = Indigo gradient, User = Emerald gradient
  const avatarClass = isAI 
    ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white' 
    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white';
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Extraction logic for EO format
  const emailMatch = isAI ? message.text.match(/----- EMAIL CONTENT BEGINS -----([\s\S]*?)----- EMAIL CONTENT ENDS -----/) : null;
  const emailText = emailMatch ? emailMatch[1].trim() : null;
  
  const analysisText = isAI && message.text.includes('----- EMAIL CONTENT ENDS -----') 
      ? message.text.split('----- EMAIL CONTENT ENDS -----')[1].trim() 
      : null;

  const handleCopy = (text, type) => {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
          setCopiedType(type);
          setTimeout(() => setCopiedType(null), 2000);
      });
  };

  return (
    <div className="group flex items-start gap-4 hover:bg-slate-800/40 px-4 py-3 -mx-4 rounded-xl transition-colors duration-200">
      <div className={`w-10 h-10 ${avatarClass} rounded-lg shadow-md flex items-center justify-center font-bold text-lg flex-shrink-0 select-none`} aria-hidden="true">
        {message.avatar}
      </div>
      <div className="flex-1 relative min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-slate-200">{message.name}</span>
            <span className="text-xs text-slate-500 font-medium">{time}</span>
            {isAI && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded uppercase tracking-wider font-bold">Bot</span>}
        </div>
        <MarkdownRenderer text={message.text} />
        {isAI && (
             <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                {emailText && (
                    <button
                        onClick={() => handleCopy(emailText, 'email')}
                        title="Copy Email Only"
                        className="p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                        {copiedType === 'email' ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                )}
                {analysisText && (
                    <button
                        onClick={() => handleCopy(analysisText, 'analysis')}
                        title="Copy Analysis Only"
                        className="p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                        {copiedType === 'analysis' ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )}
                    </button>
                )}
                <button
                    onClick={() => handleCopy(message.text, 'all')}
                    title="Copy Full Output"
                    className="p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                    {copiedType === 'all' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
// --- End of components/Message.tsx ---


// --- Start of components/ChatWindow.tsx ---
const ChatWindow = ({ messages, isLoading, activeChannel }) => {
  const endOfMessagesRef = useRef(null);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const showEmptyState = messages.length === 0 && !isLoading && activeChannel !== 'CR';
  
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === channelId);
    if (!format) return 'product-team';
    return `${format.id.toLowerCase()}-${format.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" tabIndex={0} aria-label={`Chat history for channel ${getChannelName(activeChannel)}`}>
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 animate-fade-in-up">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800/50 mb-6 transform transition-transform hover:scale-105 duration-300" aria-hidden="true">
                 <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">#</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2">Welcome to #{getChannelName(activeChannel)}</h3>
            <p className="max-w-md text-slate-400 leading-relaxed">{EMPTY_STATE_MESSAGES[activeChannel]}</p>
        </div>
      ) : (
        <div className="space-y-1" role="log" aria-live="polite">
            {messages.map(msg => <Message key={msg.id} message={msg} />)}
            {isLoading && <TypingIndicator />}
            <div ref={endOfMessagesRef} className="h-4" />
        </div>
      )}
    </div>
  );
};
// --- End of components/ChatWindow.tsx ---


// --- Start of components/Header.tsx ---
const Header = ({ activeChannel }) => {
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === channelId);
    if (!format) return 'product-team';
    return `${format.id.toLowerCase()}-${format.name.toLowerCase().replace(/\s+/g, '-')}`;
  }
  
  const getDescription = (channelId) => {
      const format = FORMATS.find(f => f.id === channelId);
      return format ? format.description : '';
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="flex items-center min-w-0">
        <h2 className="text-lg font-bold text-slate-200 flex items-center mr-4 whitespace-nowrap">
          {activeChannel === 'CR' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
          ) : <span className="mr-1 text-slate-500" aria-hidden="true">#</span>} 
          {getChannelName(activeChannel)}
        </h2>
        {activeChannel !== 'CR' && (
            <span className="hidden md:block text-sm text-slate-500 truncate border-l border-slate-700 pl-4">{getDescription(activeChannel)}</span>
        )}
      </div>
      <div className="flex items-center text-slate-400">
         {/* Header actions can go here */}
      </div>
    </header>
  );
};
// --- End of components/Header.tsx ---


// --- Start of components/MessageInput.tsx ---
const MessageInput = ({ onSendMessage, onClearChat, onRegenerate, isLoading, activeChannel, canRegenerate }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === channelId);
    if (!format) return 'product-team';
    return `${format.id.toLowerCase()}-${format.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
      if(textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleRegenerate = () => {
    if (!isLoading && canRegenerate) {
      onRegenerate();
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; 
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [text]);

  const placeholder = activeChannel === 'CR' 
    ? 'Refine rules with an instruction...' 
    : `Message #${getChannelName(activeChannel)}`;

  const ToolbarButton = (props) => (
    <button
        type="button"
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            props.disabled 
            ? 'text-slate-600 cursor-not-allowed' 
            : 'text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300'
        } ${props.className || ''}`}
        aria-label={props.ariaLabel}
        title={props.title}
        disabled={props.disabled ?? true}
        onClick={props.onClick ?? (() => {})}
    >
        {props.children}
    </button>
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg flex flex-col transition-colors focus-within:bg-slate-800 focus-within:border-slate-600">
      {/* Formatting Toolbar */}
      <div className="flex items-center px-2 pt-2 gap-1 overflow-x-auto scrollbar-none" role="toolbar" aria-label="Message formatting options">
         <ToolbarButton disabled={false} ariaLabel="Bold" title="Bold (Cmd+B)">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg>
         </ToolbarButton>
         <ToolbarButton disabled={false} ariaLabel="Italic" title="Italic (Cmd+I)">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
         </ToolbarButton>
         <ToolbarButton disabled={false} ariaLabel="Strikethrough" title="Strikethrough">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
         </ToolbarButton>
         <div className="w-px h-4 bg-slate-700/50 mx-1"></div>
         <ToolbarButton disabled={false} ariaLabel="Code Block" title="Code Block">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
         </ToolbarButton>
         <div className="w-px h-4 bg-slate-700/50 mx-1"></div>
         <ToolbarButton disabled={false} ariaLabel="Unordered List" title="Bullet List">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
         </ToolbarButton>
          <div className="flex-1"></div>
           <ToolbarButton 
            disabled={isLoading || !canRegenerate} 
            onClick={handleRegenerate}
            ariaLabel="Regenerate response" 
            title="Regenerate Response"
           >
             <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
         </ToolbarButton>
         <ToolbarButton 
            disabled={isLoading}
            onClick={onClearChat}
            ariaLabel="Clear chat" 
            title="Clear Chat"
            className="hover:bg-red-500/10 hover:text-red-400"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
         </ToolbarButton>
      </div>

      <div className="px-3 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          rows={1}
          className="w-full bg-transparent text-slate-200 placeholder-slate-500/70 text-sm leading-relaxed outline-none resize-none py-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          style={{ maxHeight: '200px' }}
        />
      </div>
      
      <div className="flex justify-between items-center px-3 pb-2">
        <div className="text-xs text-slate-500 font-medium hidden md:block">
          <strong>Return</strong> to send, <strong>Shift+Return</strong> for new line
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          aria-label="Send message"
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            text.trim() && !isLoading
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-500 hover:shadow-indigo-500/20 transform hover:-translate-y-0.5'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
// --- End of components/MessageInput.tsx ---


// --- Start of components/Sidebar.tsx ---
const Sidebar = ({ activeChannel, onChannelSelect }) => {
  return (
    <aside className="w-72 bg-slate-950 flex flex-col h-full border-r border-slate-800/50 shadow-xl z-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent" aria-label="Sidebar navigation">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
        <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
                 <span className="text-lg">G</span>
            </div>
            Gee Support
        </h1>
        <button className="text-slate-500 hover:text-white transition-colors" aria-label="Collapse sidebar">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
             </svg>
        </button>
      </div>

      <div className="flex-1 px-3 py-2 space-y-8">
        {/* Channels Section */}
        <div role="group" aria-labelledby="channels-heading">
          <h3 id="channels-heading" className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between group cursor-pointer">
              CHANNELS
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">+</span>
          </h3>
          <ul className="space-y-0.5">
            {FORMATS.filter(f => f.id !== 'CR').map((format) => {
               const isActive = activeChannel === format.id;
               return (
                <li key={format.id}>
                  <button
                    onClick={() => onChannelSelect(format.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border-l-2 border-indigo-500'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-l-2 border-transparent'
                    }`}
                  >
                    <span className={`mr-2.5 text-lg leading-none ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-500'}`}>#</span>
                    <span className="truncate">{format.id.toLowerCase()}-{format.name.toLowerCase().replace(/\s+/g, '-')}</span>
                  </button>
                </li>
              );
            })}
             <li className="mt-4 pt-4 border-t border-slate-800/50">
                  <button
                    onClick={() => onChannelSelect('CR')}
                    aria-current={activeChannel === 'CR' ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                      activeChannel === 'CR'
                        ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border-l-2 border-indigo-500'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-l-2 border-transparent'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2.5 ${activeChannel === 'CR' ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">core-rules</span>
                  </button>
             </li>
          </ul>
        </div>

        {/* Apps Section (Visual Only) */}
        <div role="group" aria-labelledby="apps-heading">
          <h3 id="apps-heading" className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              APPS
          </h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600/10 hover:bg-indigo-600/20 transition-colors border border-indigo-500/30 shadow-md shadow-black/40 group">
                 <div className="w-5 h-5 rounded bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white mr-2.5 shadow-inner group-hover:animate-pulse">G</div>
                 Gee AI
                 <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              </button>
            </li>
            <li>
              <button disabled className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 cursor-not-allowed opacity-50" aria-disabled="true">
                 <div className="w-4 h-4 rounded bg-slate-700 mr-2.5"></div>
                 Stripe
              </button>
            </li>
            <li>
              <button disabled className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 cursor-not-allowed opacity-50" aria-disabled="true">
                 <div className="w-4 h-4 rounded bg-slate-700 mr-2.5"></div>
                 Jira
              </button>
            </li>
            <li>
              <button disabled className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 cursor-not-allowed opacity-50" aria-disabled="true">
                 <div className="w-4 h-4 rounded bg-slate-700 mr-2.5"></div>
                 Notion
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* User Profile (Bottom) */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950">
          <div className="flex items-center gap-3 hover:bg-slate-900 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-slate-950 border-2 border-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">Admin User</div>
                  <div className="text-xs text-slate-400 truncate">Online</div>
              </div>
          </div>
      </div>
    </aside>
  );
};
// --- End of components/Sidebar.tsx ---


// --- Start of components/ChatPanel.tsx ---
const ChatPanel = ({ activeChannel, messages, isLoading, onSendMessage, onClearChat, onRegenerate, canRegenerate }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 relative">
      <Header activeChannel={activeChannel} />
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        activeChannel={activeChannel}
      />
      <div className="p-4 md:p-6 pt-0">
        <MessageInput 
          onSendMessage={onSendMessage} 
          onClearChat={onClearChat}
          onRegenerate={onRegenerate}
          isLoading={isLoading}
          activeChannel={activeChannel}
          canRegenerate={canRegenerate}
        />
      </div>
    </div>
  );
};
// --- End of components/ChatPanel.tsx ---


// --- Start of components/ApiKeyModal.tsx ---
const ApiKeyModal = ({ onSubmit }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSubmit(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-2 text-center">Unlock Gee AI</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">Enter your Gemini API key to access the full suite of support tools.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="sr-only">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your API Key here..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputKey.trim()}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </form>
        <div className="mt-6 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors border-b border-slate-800 hover:border-indigo-400 pb-0.5">
                Don't have a key? Get one from Google AI Studio
            </a>
        </div>
      </div>
    </div>
  );
};
// --- End of components/ApiKeyModal.tsx ---


// --- Start of components/CoreRulesPanel.tsx ---
const CoreRulesPanel = ({ rules, onUpdateRules, isLoading }) => {
    const [instruction, setInstruction] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleUpdate = async () => {
        if (!instruction.trim()) return;
        setIsUpdating(true);
        setFeedback(null);
        
        try {
            const result = await generateUpdatedRules(instruction, rules);
            if (result.error) {
                setFeedback({ type: 'error', message: result.error });
            } else {
                onUpdateRules(result.updatedRules);
                setFeedback({ type: 'success', message: result.confirmationMessage });
                setInstruction('');
            }
        } catch (e) {
             setFeedback({ type: 'error', message: "Failed to update rules." });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-900">
            <Header activeChannel="CR" />
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Instruction Input */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-200 mb-2">Modify Core Rules</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Describe how you want to change the AI's behavior. The AI will rewrite the rules for you.
                        </p>
                        <div className="flex gap-3">
                            <textarea
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g., 'Make the tone more formal', 'Always ask for order ID', 'Do not use emojis'..."
                                aria-label="Rule modification instruction"
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-20"
                            />
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !instruction.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2 rounded-lg shadow-md disabled:opacity-50 transition-all self-end"
                            >
                                {isUpdating ? 'Updating...' : 'Apply Update'}
                            </button>
                        </div>
                        {feedback && (
                            <div className={`mt-4 p-3 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                {feedback.message}
                            </div>
                        )}
                    </div>

                    {/* Current Rules Display */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                            <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Current Configuration</span>
                            <span className="text-xs text-slate-600">Read-only preview</span>
                        </div>
                        <div className="p-6 overflow-x-auto">
                             <pre className="font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                                {rules}
                             </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End of components/CoreRulesPanel.tsx ---


// --- Start of App.tsx ---
const App = () => {
  const [activeChannel, setActiveChannel] = useState('EO');
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [coreRules, setCoreRules] = useState(INITIAL_GENERAL_RULES);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(true);

  const handleApiKeySubmit = (key) => {
    setApiKey(key);
    initAi(key);
    setIsApiKeyModalOpen(false);
  };

  const getCurrentMessages = () => messages[activeChannel] || [];

  const addMessage = (channel, message) => {
    setMessages(prev => ({
      ...prev,
      [channel]: [...(prev[channel] || []), message]
    }));
  };

  const handleSendMessage = async (text) => {
    const userMsg = { id: Date.now(), sender: 'user', name: 'Admin User', avatar: 'AU', text };
    addMessage(activeChannel, userMsg);
    setIsLoading(true);

    try {
        const currentHistory = (messages[activeChannel] || [])
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
            .join('\n');
            
        const stream = await generateResponseStream(
            text, 
            activeChannel, 
            currentHistory, 
            coreRules, 
            (messages[activeChannel] || []).length === 0
        );
        
        let aiResponseText = '';
        const aiMsgId = Date.now() + 1;
        
        // Optimistic initial AI message
        addMessage(activeChannel, { id: aiMsgId, sender: 'ai', name: 'Gee', avatar: 'G', text: '' });

        if (stream) {
            for await (const chunk of stream) {
                // FIX: chunk.text is a getter property, not a function call in the GenAI SDK.
                const chunkText = chunk.text; 
                if (chunkText) {
                    aiResponseText += chunkText;
                    
                    setMessages(prev => {
                        const channelMsgs = prev[activeChannel] || [];
                        const updatedMsgs = channelMsgs.map(msg => 
                            msg.id === aiMsgId ? { ...msg, text: aiResponseText } : msg
                        );
                        return { ...prev, [activeChannel]: updatedMsgs };
                    });
                }
            }
        }

    } catch (error) {
        console.error("Generation failed", error);
        const errorText = error.message || "I encountered an error. Please check your API key or try again.";
        
        // Special handling for API Key errors to reopen modal
        if (errorText.includes("API key")) {
             setApiKey('');
             setIsApiKeyModalOpen(true);
        }

        addMessage(activeChannel, { 
            id: Date.now() + 1, 
            sender: 'ai', 
            name: 'Gee', 
            avatar: '!', 
            text: `**Error:** ${errorText}` 
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClearChat = () => {
      setMessages(prev => ({ ...prev, [activeChannel]: [] }));
  };
  
  const handleRegenerate = () => {
      const currentMsgs = messages[activeChannel] || [];
      const lastUserMsg = [...currentMsgs].reverse().find(m => m.sender === 'user');
      if (lastUserMsg) {
          handleSendMessage(lastUserMsg.text);
      }
  };
  
  const canRegenerate = (messages[activeChannel] || []).length > 0;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      {isApiKeyModalOpen && <ApiKeyModal onSubmit={handleApiKeySubmit} />}
      
      <Sidebar 
        activeChannel={activeChannel} 
        onChannelSelect={setActiveChannel} 
      />
      
      <main className="flex-1 min-w-0 bg-slate-900 h-full relative shadow-2xl">
         {/* Background Gradient Mesh */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
             <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-3xl"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl"></div>
         </div>

         {activeChannel === 'CR' ? (
             <CoreRulesPanel 
                rules={coreRules} 
                onUpdateRules={setCoreRules}
                isLoading={isLoading}
             />
         ) : (
            <ChatPanel 
                activeChannel={activeChannel}
                messages={getCurrentMessages()}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
                onRegenerate={handleRegenerate}
                canRegenerate={canRegenerate}
            />
         )}
      </main>
    </div>
  );
};
// --- End of App.tsx ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);

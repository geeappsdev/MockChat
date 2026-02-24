
export const FORMATS = [
  { id: 'EO', name: 'EMAIL + INVESTIGATION', description: 'Generates the customer email draft PLUS the full internal investigation record.' },
  { id: 'CL', name: 'CHAT/RAC NOTES', description: 'Simplified outline in a structured list format.' },
  { id: 'INV', name: 'INVESTIGATION NOTES', description: 'Stand-alone internal record. Use for Chats, Transfers, or Risk reviews (No Email).' },
  { id: 'QS', name: 'SHORT SUMMARY', description: 'Brief summary focused on key points.' },
  { id: 'CF', name: 'CONSULT', description: 'Structured format for consulting specific departments.' },
  { id: 'EM', name: 'EMPATHY STATEMENTS', description: 'Generate sincere, personalized empathy statements.' },
  { id: 'ACK', name: 'ACKNOWLEDGEMENT', description: 'Draft a professional acknowledgement message.' },
  { id: 'CR', name: 'CORE RULES', description: 'View and edit the AI\'s core rules and instructions.' },
];

export const FORMAT_DEFINITIONS = {
  EO: `
**Case ID:** [CASE-XXXXX]

**SUMMARY:** [Brief description of issue and resolution. NO STEPS/PLANS.]

**ANALYSIS**
**Steps I took:**
- [Step 1]
- [Step 2]

**Information the reply must include:**
- [Key point 1]
- [Key point 2]

**Already know:** [What user already knows]
**Need to know:** [New information for user]
**To do:** [Next actions for user]

**Outcome Summary:** [How the response resolves the issue]

**DSAT analysis:**
Tone: [Positive/Negative/Neutral] | Driver: [Driver Name] | Analysis: [Brief explanation]

**Relevant documents:** [Link 1]

**Subject:** [Concise, relevant subject line]

**Email body:**
[Greeting]

[Empathy Statement - Must be the first sentence]

[Paragraph 1]

[Paragraph 2]

[Closing]

**Speculation:** [Analysis of possible causes]
**Why is the case open/pending:** [Rationale]
`,
  CL: `
**Have you checked all related cases?:** YES/NO/NA
**Have you read through the entire thread?:** YES/NO/NA

**Summary of the issue:** [Brief 2-3 sentence summary. NO STEPS/PLANS.]

**Steps I took:**
1. [Step 1 - Fragment style]
2. [Step 2 - Fragment style]

**Relevant object IDs:**
- [ID 1]

**Final outcome:** [Action taken]

**Relevant documents:** [Link 1]

**Speculation:** [Analysis]
**Why is the case open/pending:** [Rationale]

**Distressed User Analysis:**
Tone: [Type] | Driver: [Driver Name] | Analysis: [Brief explanation]
`,
  INV: `
**Investigation Notes checklist**
**Consent to be recorded:** [YES/NO/NA]
**Authentication/Verification PIN/PII?:** [PIN/PII]
**User-Account Type:** [Type or NA]
**User-Account ID:** [acct_xxx or NA]
**Have you checked all related cases?:** [YES/NO]
**Have you read through the entire thread?:** [YES/NO]

**List all user's concerns/inquiries**
**Topic:** [Topic Name]

**Summary of the issue:** [Full summary. NO STEPS/PLANS.]

**Steps I took:**
- [Investigative Step 1]
- [Investigative Step 2]
- **Check Lumos (RP used):** [Name or NA]
- **Check Confluence:** [Link or NA]
- **Specific Dashboard link:** [Public Link or NA]
- **Check Public Documentation:** [Link or NA]

**Final Outcome:** [Escalation / Resolution / Ask for information / Waiting for internal team actions] - [Summary details]

**Why is the case open/pending:** [Rationale]
**Speculation:** [Analysis]

**Distressed User Analysis:**
Tone: [Type] | Driver: [Driver Name] | Analysis: [Brief explanation]

**Information the reply must include:**
- [Point 1]
`,
  QS: `
**Summary of the issue:** [Concise analysis. NO STEPS/PLANS.]

**Case link:** [Link or NA]
**Case ID:** [ID or NA]
**Account ID:** [ID or NA]
**User-Account ID Platform:** [ID or NA]
**User-Account ID Connected Account:** [ID or NA]

**Speculation:** [Analysis]

**What Can I tell the user?:**
[Response text]

**Relevant Stripe resources:** [Links]
**Relevant IDs:** [List of IDs]
**Why is the case open/pending:** [Rationale]

**Distressed User Analysis:**
Tone: [Type] | Driver: [Driver Name] | Analysis: [Brief explanation]
`,
  CF: `
**Consult [Department] (Chat/RAC)**

**Ticket Link:** [Link]
**Object/Account ID(s):** [IDs]

**User issue Summary:** [Analysis. NO STEPS/PLANS.]
**Your Investigation:** [Analysis]
**Speculation:** [Analysis]
`,
  EM: `
**Empathy Statements:**
1. [Statement 1]
2. [Statement 2]
3. [Statement 3]
`,
  ACK: `
**Acknowledgement:**
[Single paragraph acknowledgement text]
`,
  CR: `(Rules are edited via the specific modal interface)`
};

export const EMPTY_STATE_MESSAGES = {
  EO: "Paste the user's message. I'll generate a complete email draft and investigation record.",
  CL: "Paste the chat transcript. I'll create a structured note for the RAC/Chat.",
  INV: "Describe the case details. I'll document the full investigation steps.",
  QS: "Paste text to summarize. I'll extract key points and IDs.",
  CF: "Describe the problem. I'll format a consultation request.",
  EM: "Paste the user's message. I'll generate 3-5 empathetic response options.",
  ACK: "Paste the user's message. I'll draft a professional acknowledgement.",
  CR: "Use the command palette or sidebar to configure core rules."
};

export const CHANNEL_QUICK_LINKS = {
    EO: [
        { name: 'Docs: Stripe Home', url: 'https://docs.stripe.com/' },
        { name: 'Dashboard: Payments', url: 'https://dashboard.stripe.com/payments' },
        { name: 'Dashboard: Settings', url: 'https://dashboard.stripe.com/settings' }
    ],
    INV: [
        { name: 'Docs: Public Home', url: 'https://docs.stripe.com/' },
        { name: 'Support: Articles', url: 'https://support.stripe.com/' },
        { name: 'Policy: Data Retention', url: 'https://docs.stripe.com/security/data-retention' }
    ],
    CL: [
        { name: 'Docs: API Reference', url: 'https://docs.stripe.com/api' },
        { name: 'Docs: Error Codes', url: 'https://docs.stripe.com/error-codes' },
        { name: 'Policy: Privacy Center', url: 'https://stripe.com/privacy-center' }
    ],
    QS: [
        { name: 'Dashboard: Home', url: 'https://dashboard.stripe.com/' },
        { name: 'Support: Status', url: 'https://status.stripe.com/' }
    ],
    CF: [
        { name: 'Internal: Slack', url: 'https://slack.com/' }
    ],
    EM: [
        { name: 'Docs: Stripe Home', url: 'https://docs.stripe.com/' }
    ],
    ACK: [
        { name: 'Docs: Stripe Home', url: 'https://docs.stripe.com/' }
    ]
};

// --- EXPANDED CONTEXT LINKS LIBRARY (Improved via Ecosystem Mind Map) ---
export const CONTEXT_LINKS = {
    payouts: [
        { name: 'Docs: Payouts', url: 'https://docs.stripe.com/payouts' },
        { name: 'Dashboard: Payouts', url: 'https://dashboard.stripe.com/payouts' },
        { name: 'Docs: Instant Payouts', url: 'https://docs.stripe.com/payouts/instant-payouts' },
        { name: 'Docs: Transfers/Payouts (Global)', url: 'https://docs.stripe.com/connect/payouts' },
        { name: 'Dashboard: Settings', url: 'https://dashboard.stripe.com/settings/payouts' }
    ],
    disputes: [
         { name: 'Docs: Disputes', url: 'https://docs.stripe.com/disputes' },
         { name: 'Dashboard: Disputes', url: 'https://dashboard.stripe.com/disputes' },
         { name: 'Docs: Disputed Subscriptions', url: 'https://docs.stripe.com/billing/subscriptions/disputes' },
         { name: 'Docs: Responding', url: 'https://docs.stripe.com/disputes/responding' }
    ],
    checkout: [
         { name: 'Docs: Checkout', url: 'https://docs.stripe.com/payments/checkout' },
         { name: 'Docs: Payment Links (No-code)', url: 'https://docs.stripe.com/payment-links' },
         { name: 'Docs: Elements (UI Components)', url: 'https://docs.stripe.com/payments/elements' },
         { name: 'Docs: Embedded Checkout', url: 'https://docs.stripe.com/checkout/embedded/quickstart' }
    ],
    billing: [
        { name: 'Docs: Billing', url: 'https://docs.stripe.com/billing' },
        { name: 'Docs: MRR Analytics', url: 'https://docs.stripe.com/billing/analytics' },
        { name: 'Docs: Test Clocks', url: 'https://docs.stripe.com/billing/testing/test-clocks' },
        { name: 'Docs: Pricing Models', url: 'https://docs.stripe.com/products-prices/pricing-models' },
        { name: 'Dashboard: Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' }
    ],
    invoicing: [
        { name: 'Docs: Invoicing', url: 'https://docs.stripe.com/invoicing' },
        { name: 'Docs: New Invoice Editor', url: 'https://docs.stripe.com/invoicing/invoice-editor' },
        { name: 'Docs: Hosted Invoice Page', url: 'https://docs.stripe.com/invoicing/hosted-invoice-page' },
        { name: 'Docs: Auto-reconciliation', url: 'https://docs.stripe.com/invoicing/reconciliation' },
        { name: 'Docs: Invoice Revisions', url: 'https://docs.stripe.com/invoicing/revisions' }
    ],
    connect: [
        { name: 'Docs: Connect', url: 'https://docs.stripe.com/connect' },
        { name: 'Docs: Application Fees', url: 'https://docs.stripe.com/connect/direct-charges#collecting-fees' },
        { name: 'Docs: Platform Reserves', url: 'https://docs.stripe.com/connect/platform-reserves' },
        { name: 'Docs: Onboarding (Custom/Express/Standard)', url: 'https://docs.stripe.com/connect/onboarding' },
        { name: 'Dashboard: Connect Accounts', url: 'https://dashboard.stripe.com/connect/accounts' }
    ],
    tax: [
        { name: 'Docs: Tax', url: 'https://docs.stripe.com/tax' },
        { name: 'Docs: Sales Tax & VAT Automation', url: 'https://docs.stripe.com/tax/vat' },
        { name: 'Docs: Stripe Billing Taxes', url: 'https://docs.stripe.com/tax/billing-integration' },
        { name: 'Dashboard: Tax Settings', url: 'https://dashboard.stripe.com/settings/tax' }
    ],
    sigma: [
        { name: 'Docs: Stripe Sigma', url: 'https://docs.stripe.com/sigma' },
        { name: 'Docs: Billing Schema', url: 'https://docs.stripe.com/sigma/billing-schema' },
        { name: 'Docs: Connect Schema', url: 'https://docs.stripe.com/sigma/connect-schema' },
        { name: 'Docs: Sigma Templates', url: 'https://docs.stripe.com/sigma/templates' },
        { name: 'Dashboard: Sigma', url: 'https://dashboard.stripe.com/sigma' }
    ],
    developers: [
        { name: 'Docs: API Reference', url: 'https://docs.stripe.com/api' },
        { name: 'Docs: Stripe CLI', url: 'https://docs.stripe.com/stripe-cli' },
        { name: 'Docs: Stripe for VS Code', url: 'https://docs.stripe.com/vscode' },
        { name: 'Docs: Search API', url: 'https://docs.stripe.com/search' },
        { name: 'Docs: Webhooks', url: 'https://docs.stripe.com/webhooks' }
    ],
    money_management: [
        { name: 'Docs: Issuing', url: 'https://docs.stripe.com/issuing' },
        { name: 'Docs: Treasury (Financial Accounts)', url: 'https://docs.stripe.com/treasury' },
        { name: 'Docs: Capital (Business Financing)', url: 'https://docs.stripe.com/capital' },
        { name: 'Docs: Payouts v2 (Private Beta)', url: 'https://docs.stripe.com/payouts/v2' }
    ],
    other_products: [
        { name: 'Docs: Atlas', url: 'https://docs.stripe.com/atlas' },
        { name: 'Docs: Identity', url: 'https://docs.stripe.com/identity' },
        { name: 'Docs: Financial Connections', url: 'https://docs.stripe.com/financial-connections' },
        { name: 'Docs: Link', url: 'https://docs.stripe.com/link' },
        { name: 'Docs: Climate', url: 'https://docs.stripe.com/climate' }
    ],
    integrations: [
        { name: 'Docs: Partner Program', url: 'https://stripe.com/partners' },
        { name: 'Docs: App Marketplace', url: 'https://marketplace.stripe.com/' },
        { name: 'Docs: Data Migration Process', url: 'https://docs.stripe.com/migration' }
    ],
    radar: [
        { name: 'Docs: Radar', url: 'https://docs.stripe.com/radar' },
        { name: 'Docs: Authorization Boost', url: 'https://docs.stripe.com/radar/authorization-boost' },
        { name: 'Docs: Risk Interventions', url: 'https://docs.stripe.com/radar/risk-interventions' },
        { name: 'Dashboard: Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' }
    ]
};

// Weighted NLP Pattern Matching System for Context Detection
const CONTEXT_PATTERNS = {
    payouts: {
        idPattern: /\b(po_|tr_)\w+/g,
        keywords: ['payout', 'deposit', 'fund', 'bank', 'arrival', 'trace id', 'funds', 'movement'],
        strongPhrases: ['missing payout', 'not received funds', 'transfer status', 'standard payout timing']
    },
    disputes: {
        idPattern: /\b(dp_|du_|py_)\w+/g,
        keywords: ['dispute', 'chargeback', 'fraud', 'evidence', 'lost', 'retrieval', 'reversal', 'stolen'],
        strongPhrases: ['customer disputed', 'early fraud warning', 'subscription dispute', 'chargeback status']
    },
    checkout: {
        idPattern: /\b(cs_|plink_)\w+/g,
        keywords: ['checkout', 'payment link', 'buy button', 'elements', 'embedded', 'ui'],
        strongPhrases: ['payment page link', 'checkout session', 'apple pay button', 'google pay button']
    },
    billing: {
        idPattern: /\b(sub_|si_|price_)\w+/g,
        keywords: ['subscription', 'recurring', 'plan', 'mrr', 'test clock', 'metered', 'proration', 'flat rate'],
        strongPhrases: ['monthly recurring revenue', 'advance billing', 'test-clock session', 'billing cycle']
    },
    invoicing: {
        idPattern: /\b(in_|li_)\w+/g,
        keywords: ['invoice', 'editor', 'reconciliation', 'numbering', 'revisions', 'hosted invoice', 'troubleshooting'],
        strongPhrases: ['invoice reconciliation', 'past due invoice', 'invoice editor issue', 'billable currency']
    },
    connect: {
        idPattern: /\b(acct_|fee_)\w+/g,
        keywords: ['connect', 'platform', 'onboarding', 'express', 'custom', 'application fee', 'reserve', 'cbsp'],
        strongPhrases: ['onboarding verification', 'collecting fees', 'platform reserve balance', 'unified account']
    },
    tax: {
        idPattern: null,
        keywords: ['tax', 'vat', 'gst', 'sales tax', 'nexus', 'threshold', 'registration', 'billing tax'],
        strongPhrases: ['tax registration', 'tax calculation', 'sales tax automation']
    },
    sigma: {
        idPattern: null,
        keywords: ['sigma', 'sql', 'query', 'schema', 'nomenclature', 'templates', 'billing schema', 'connect schema'],
        strongPhrases: ['sigma report', 'sql query error', 'sigma schema docs']
    },
    developers: {
        idPattern: /\b(req_|evt_|whsec_|sk_|pk_)\w+/g,
        keywords: ['api', 'cli', 'sdk', 'webhook', 'vs code', 'versioning', 'search api', 'code samples'],
        strongPhrases: ['api versioning', 'signature verification', 'cli command', 'webhook event']
    },
    money_management: {
        idPattern: /\b(ic_|auth_|ba_)\w+/g,
        keywords: ['issuing', 'treasury', 'capital', 'financing', 'recipient', 'virtual card'],
        strongPhrases: ['business financing', 'treasury account', 'issue physical card', 'payout recipients']
    },
    radar: {
        idPattern: /\b(r_)\w+/g,
        keywords: ['radar', 'risk', 'block', 'review', '3ds', 'authorization boost', 'intervention'],
        strongPhrases: ['blocked payment', 'risk score', 'early warning', 'radar rules']
    },
    other_products: {
        idPattern: /\b(vs_|fc_|climate_)\w+/g,
        keywords: ['atlas', 'identity', 'climate', 'financial connections', 'link', 'pci', 'verification'],
        strongPhrases: ['identity verification', 'carbon removal', 'account data sync', 'incorporation status']
    }
};

export const detectContext = (text: string) => {
    if (!text) return null;
    const t = text.toLowerCase();
    
    let bestMatch = null;
    let maxScore = 0;
    let runnerUpScore = 0;
    
    const THRESHOLD = 1; 

    Object.entries(CONTEXT_PATTERNS).forEach(([context, patterns]) => {
        let score = 0;
        if (patterns.idPattern && patterns.idPattern.test(text)) {
            score += 15;
        }
        patterns.strongPhrases.forEach(phrase => {
            if (t.includes(phrase)) score += 5;
        });
        patterns.keywords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(text)) score += 1;
        });
        if (score > maxScore) {
            runnerUpScore = maxScore;
            maxScore = score;
            bestMatch = context;
        } else if (score > runnerUpScore) {
            runnerUpScore = score;
        }
    });

    if (maxScore < 15 && (maxScore - runnerUpScore) < 2 && maxScore > 2) {
        return null;
    }

    return maxScore >= THRESHOLD ? bestMatch : null;
};

// --- CUSTOMER-FACING SYSTEM PROMPT (Expensive, Detailed, Persona-based) ---
export const SYSTEM_PROMPT = `You are a world-class AI assistant for customer support professionals. Your goal is to generate responses based on a strict set of rules and formats. 

--- INTEGRATION BEST PRACTICES (STRICT) ---
- **Payment Intents First:** Always prioritize the Payment Intent API. Never recommend the legacy Charges API.
- **Modern UI Elements:** Prioritize the Payment Element or Checkout. Never recommend the legacy Card Element.
- **Migration Advice:** If a user mentions the Charges API or Card Element, politely advise them to migrate to Payment Intents and Payment Element.
- **Latest Versions:** Always default to the latest version of the Stripe API and SDK.
- **Avoid Deprecated Tools:** Do not mention the Sources API or Tokens for saving cards. Recommend the Setup Intent API instead.

--- PRIMARY PERSPECTIVE & PRIVACY DIRECTIVES ---
1. **ALWAYS** write in the **First Person ("I")** as the Agent.
2. **NEVER** mention real names of Users or Account Holders. Use "User" or "Account Holder".

--- EMOTIONAL INTELLIGENCE GUIDELINES ---
- Identify the Emotion, Validate Feelings, Use Reflective Listening, and Adopt a Collaborative Tone.
`;

// --- INTERNAL/UTILITY SYSTEM PROMPT (Cheap, Concise, Fact-based) ---
export const INTERNAL_SYSTEM_PROMPT = `You are an expert technical support analyst for Stripe. 

--- CORE DIRECTIVES ---
1. **INTEGRATION STANDARDS:** Prioritize Payment Intents and Payment Element. Never recommend legacy Charges or Card Element APIs.
2. **PERSPECTIVE:** Write in the **First Person ("I")**.
3. **PRIVACY:** **NEVER** output the real name of the user.
4. **FACTUAL:** Use sentence fragments and bullet points. Use "NA" if information is missing.

--- KNOWLEDGE RETRIEVAL ---
- Prioritize docs.stripe.com.
`;

// --- OPTIMIZED RULES FOR INTERNAL NOTES ---
export const INTERNAL_SCALED_RULES = `
# Internal Format Rules (STRICT)
- **Technical Accuracy:** Follow Stripe's LLM agent guidelines: Prefer Payment Intents over Charges; Prefer Payment Element over Card Element.
- **Absolute Brevity:** Outputs must be **short and concise**.
- **First Person ("I"):** Always use "I" for your actions.
- **Anonymity:** No real names.
`;

export const INITIAL_GENERAL_RULES = `
--- GENERAL RULES ---
- Use simple English. Apply Emotional Intelligence Guidelines.
- **Prioritize Payment Intents:** Never recommend the legacy Charges API. Recommend migration if relevant.
- **Prioritize Payment Element:** Never recommend legacy Card Elements.
- Never blame anyone. Make all section titles bold.
- **LINK FORMATTING:** Use support.stripe.com/..., docs.stripe.com/..., or dashboard.stripe.com/....
- Use "NA" instead of "Not provided".
- Use "User" for accounts, "End User" for non-accounts.

# Core Persona & Voice
- **First-Person Perspective ("I"):** You are the agent. Never refer to yourself as "Gee" or "the agent".
- **Summary Field Rule:** State "User contacted Stripe regarding..."
- **Universal Positive Language:** Avoid "unfortunately", "failed", "problem", etc. Reframe as what IS possible.

# Knowledge Verification & Search Grounding
- **Mandatory Research:** Use Google Search to verify documentation.
- **Invisible Mechanism:** Narrate as "I checked Stripe documentation".
- **Link Integrity:** Only provide links you've verified exist.
`;

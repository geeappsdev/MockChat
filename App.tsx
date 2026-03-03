
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check,
  ChevronRight,
  Info,
  User,
  MessageSquare,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchBestPractices, generateEmailDraft } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TONES = [
  { id: 'professional', label: 'Professional', icon: Zap },
  { id: 'friendly', label: 'Friendly', icon: MessageSquare },
  { id: 'urgent', label: 'Urgent', icon: AlertCircle },
  { id: 'empathetic', label: 'Empathetic', icon: Sparkles },
  { id: 'concise', label: 'Concise', icon: ChevronRight },
];

const App = () => {
  const [recipient, setRecipient] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [bestPractices, setBestPractices] = useState<string>('');
  const [isFetchingPractices, setIsFetchingPractices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleFetchBestPractices();
  }, []);

  const handleFetchBestPractices = async () => {
    setIsFetchingPractices(true);
    setError(null);
    try {
      const practices = await fetchBestPractices();
      setBestPractices(practices || '');
    } catch (err: any) {
      setError("Failed to fetch best practices. Using defaults.");
      setBestPractices("1. Be clear and concise.\n2. Use a professional tone.\n3. Ensure all user questions are answered.\n4. Proofread for accuracy.");
    } finally {
      setIsFetchingPractices(false);
    }
  };

  const handleGenerate = async () => {
    if (!context.trim()) {
      setError("Please provide some context for the email.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateEmailDraft({
        recipient,
        context,
        tone,
        bestPractices,
        additionalInstructions
      });
      setDraft(result || '');
    } catch (err: any) {
      setError(err.message || "Failed to generate email draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-6 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Elite Email Drafter</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Gemini 2.5 Pro Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <User className="w-4 h-4" />
                <h2>Recipient Information</h2>
              </div>
              <input
                type="text"
                placeholder="e.g. John Doe (Customer Support Lead)"
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <MessageSquare className="w-4 h-4" />
                <h2>Email Context & Purpose</h2>
              </div>
              <textarea
                placeholder="What is this email about? Include key points, questions to answer, or specific details..."
                className="w-full h-40 px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all resize-none"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <Sparkles className="w-4 h-4" />
                <h2>Tone & Style</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium",
                        tone === t.id 
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-md" 
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !context.trim()}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-900/10"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Drafting with Elite Standards...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Elite Draft
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Additional Instructions */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <Info className="w-4 h-4" />
                <h2>Additional Instructions</h2>
              </div>
            </div>
            <input
              type="text"
              placeholder="e.g. Mention the discount code 'SUMMER20', keep it under 100 words..."
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
            />
          </section>
        </div>

        {/* Right Column: Best Practices & Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Best Practices Panel */}
          <section className="bg-zinc-900 rounded-2xl text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Search className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h2 className="font-semibold tracking-tight">Elite Best Practices</h2>
                </div>
                <button 
                  onClick={handleFetchBestPractices}
                  disabled={isFetchingPractices}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh Best Practices"
                >
                  <RefreshCw className={cn("w-4 h-4", isFetchingPractices && "animate-spin")} />
                </button>
              </div>
              
              {isFetchingPractices ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                </div>
              ) : (
                <div className="text-sm text-zinc-300 leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                  <ReactMarkdown>{bestPractices}</ReactMarkdown>
                </div>
              )}
              
              <div className="pt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                Applied to every draft
              </div>
            </div>
          </section>

          {/* Preview Panel */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-[calc(100vh-400px)] min-h-[400px]">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Email Preview</h2>
              {draft && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-medium transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/30">
              <AnimatePresence mode="wait">
                {draft ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-sm max-w-none text-zinc-800"
                  >
                    <ReactMarkdown>{draft}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-500 max-w-[200px]">
                      Your elite draft will appear here after generation.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:opacity-80">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

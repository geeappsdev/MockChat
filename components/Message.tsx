import React, { useEffect, useRef, useState } from 'react';

const MarkdownRenderer = ({ text }) => {
    const containerRef = useRef(null);

    // Apply PrismJS Syntax Highlighting whenever text changes
    useEffect(() => {
        if (containerRef.current && (window as any).Prism) {
            (window as any).Prism.highlightAllUnder(containerRef.current);
        }
    }, [text]);

    // SENIOR AUDIT FIX: Event Delegation
    // Instead of attaching listeners to every button on every render (streaming causes high frequency updates),
    // we attach ONE listener to the container and handle clicks via bubbling.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleContainerClick = async (e) => {
            // Find closest button with our classes
            const btn = e.target.closest('button');
            if (!btn) return;

            // Handle Code Block Copy
            if (btn.classList.contains('code-copy-btn')) {
                e.preventDefault();
                e.stopPropagation();
                // The pre tag is the sibling of the button's parent or within the wrapper
                // Structure: div.relative > [div.header, div.relative > [button, pre]]
                const wrapper = btn.closest('.relative');
                const codeBlock = wrapper?.querySelector('code');
                
                if (codeBlock) {
                    try {
                        await navigator.clipboard.writeText(codeBlock.innerText);
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = '<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                        setTimeout(() => btn.innerHTML = originalHtml, 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                }
            }

            // Handle URL Copy
            if (btn.classList.contains('url-copy-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const url = btn.getAttribute('data-url');
                if (url) {
                    try {
                        await navigator.clipboard.writeText(url);
                        const originalContent = btn.innerHTML;
                        btn.innerHTML = '<svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                        btn.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20');
                        setTimeout(() => {
                            btn.innerHTML = originalContent;
                            btn.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy URL:', err);
                    }
                }
            }
            
            // Handle Table Copy
             if (btn.classList.contains('table-copy-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const tableContainer = btn.closest('.table-container');
                const table = tableContainer?.querySelector('table');
                
                if (table) {
                    try {
                        // Extract table data to TSV
                        let tsv = '';
                        const rows = table.querySelectorAll('tr');
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('th, td');
                            const rowData = Array.from(cells).map((cell: any) => cell.textContent?.trim() || '').join('\t');
                            tsv += rowData + '\n';
                        });

                        await navigator.clipboard.writeText(tsv);
                        
                        const originalContent = btn.innerHTML;
                        const originalWidth = btn.style.width;
                        btn.style.width = `${btn.offsetWidth}px`; // Lock width to prevent layout shift
                        
                        btn.innerHTML = '<span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Copied</span>';
                        btn.classList.add('text-emerald-600', 'bg-emerald-50');
                        
                        setTimeout(() => {
                            btn.innerHTML = originalContent;
                            btn.style.width = originalWidth;
                            btn.classList.remove('text-emerald-600', 'bg-emerald-50');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy table:', err);
                    }
                }
            }
        };

        container.addEventListener('click', handleContainerClick);
        return () => container.removeEventListener('click', handleContainerClick);
    }, []); // Empty dependency array: Listener attaches once.

    const renderContent = () => {
        if (!text) return '';

        // 1. Escape HTML
        let safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const placeholders = [];
        const addPlaceholder = (content) => {
            placeholders.push(content);
            return `__PLACEHOLDER_${placeholders.length - 1}__`;
        };

        // 2. Extract Block Elements (Thinking, Code, Tables)
        
        // QA / Thinking Blocks
        safeText = safeText.replace(/&lt;thinking&gt;([\s\S]*?)&lt;\/thinking&gt;/g, (match, content) => {
            // Parse Checklist items for visual UI
            const parseChecklist = (text) => {
                return text.split('\n').map(line => {
                    // Check for [ ] or [x] or - [ ] or - [x] or just - 
                    const match = line.match(/^\s*(-|\d+\.|\[\s?[xX ]?\s?\])\s+(.*)/);
                    if (match) {
                        const marker = match[1];
                        const text = match[2];
                        let icon = '<span class="w-4 h-4 flex items-center justify-center rounded bg-zinc-100 dark:bg-white/10 text-zinc-400 mr-2 shrink-0">•</span>';
                        let rowClass = "flex items-start mb-1.5 opacity-90";
                        
                        if (marker.includes('[x]') || marker.includes('[X]')) {
                             icon = '<span class="w-4 h-4 flex items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></span>';
                        } else if (marker.includes('[ ]')) {
                             // Check if it's a kill criteria failure (often text mentions "KILL IT" or "FAIL")
                             if (text.includes("KILL IT") || text.includes("STOP")) {
                                  icon = '<span class="w-4 h-4 flex items-center justify-center rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-2 shrink-0"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></span>';
                                  rowClass += " text-red-600 dark:text-red-400 font-medium";
                             } else {
                                  icon = '<span class="w-4 h-4 flex items-center justify-center rounded border border-zinc-300 dark:border-zinc-600 mr-2 shrink-0 bg-white dark:bg-white/5"></span>';
                             }
                        }
                        return `<div class="${rowClass}">${icon}<span class="leading-snug pt-0.5">${text}</span></div>`;
                    }
                    if (line.trim()) return `<div class="mb-1 opacity-70 ml-6 text-[10px]">${line}</div>`;
                    return '';
                }).join('');
            };

            // Added 'open' attribute to make QA log visible by default
            const html = `
            <details class="mb-5 group bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl overflow-hidden" open>
                <summary class="px-4 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer select-none hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between outline-none">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>SENIOR QA AUDIT LOG</span>
                    </div>
                    <svg class="w-3 h-3 transition-transform group-open:rotate-180 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div class="px-4 pb-3 pt-2 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-indigo-100 dark:border-indigo-500/20">
                    ${parseChecklist(content.trim())}
                </div>
            </details>`;
            return addPlaceholder(html);
        });

        // Code Blocks (Triple backticks)
        safeText = safeText.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            // Note: Added explicit button with class 'code-copy-btn'
            // Added class "language-xxx" to code tag for PrismJS
            // Added background color specific to match Prism Tomorrow theme to avoid FOUC
            const html = `<div class="my-5 rounded-xl overflow-hidden border border-indigo-500/20 dark:border-indigo-500/30 bg-[#2d2d2d] shadow-md group relative">
                <div class="bg-[#1f1f1f] px-3 py-2 flex items-center justify-between border-b border-white/5">
                    <div class="flex gap-1.5">
                        <div class="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                    </div>
                    <span class="text-[10px] font-bold text-zinc-500 uppercase">${language}</span>
                </div>
                <div class="relative">
                    <button class="code-copy-btn absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <pre class="!m-0 !p-4 !bg-[#2d2d2d] overflow-x-auto"><code class="language-${language} text-[13px] font-mono leading-relaxed">${code.trim()}</code></pre>
                </div>
            </div>`;
            return addPlaceholder(html);
        });

        // Tables - Improved Regex for Markdown Tables
        const tableRegex = /(^\|.*\|(?:\r?\n\|[-:| ]+\|)(?:\r?\n\|.*\|)+)/gm;
        safeText = safeText.replace(tableRegex, (match) => {
            const rows = match.trim().split(/\r?\n/);
            let html = '<div class="table-container my-6 rounded-xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm relative group">';
            
            // Add Table Copy Button
            html += `
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button class="table-copy-btn flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 shadow-sm px-2 py-1 rounded-md text-[10px] font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy Table
                </button>
            </div>
            <div class="overflow-hidden rounded-xl"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">`;
            
            rows.forEach((row, index) => {
                const cleanRow = row.trim().replace(/^\||\|$/g, '');
                
                // Safe split ignoring escaped pipes and pipes inside inline code `|`
                // Regex matches a pipe that is NOT inside backticks. 
                // Since JS regex doesn't support variable length lookbehind easily for this, we use a simpler state machine approach or specific split.
                // For robustness in this environment, we'll split by | but join if inside code.
                const parts = cleanRow.split('|');
                const cols = [];
                let buffer = '';
                let insideCode = false;
                
                parts.forEach((part, i) => {
                    // count backticks in this part
                    const backticks = (part.match(/`/g) || []).length;
                    if (backticks % 2 !== 0) insideCode = !insideCode;
                    
                    if (buffer) buffer += '|';
                    buffer += part;
                    
                    if (!insideCode && !part.endsWith('\\')) {
                        cols.push(buffer.trim());
                        buffer = '';
                    }
                });
                if (buffer) cols.push(buffer.trim()); // Push remaining if any

                
                if (index === 1) return; // Skip separator line
                
                if (index === 0) {
                    html += '<thead class="bg-zinc-50 dark:bg-white/5"><tr>';
                    cols.forEach(col => html += `<th class="px-4 py-3 text-left text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-sans">${col}</th>`);
                    html += '</tr></thead><tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">';
                } else {
                    html += `<tr class="${index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-50/30 dark:bg-white/[0.02]'} hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">`;
                    cols.forEach(col => html += `<td class="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">${col}</td>`);
                    html += '</tr>';
                }
            });
            html += '</tbody></table></div></div></div>';
            return addPlaceholder(html);
        });

        // 3. Process Inline Formatting

        // Links - Improved regex to handle trailing punctuation
        safeText = safeText.replace(/([`(\[])?(https?:\/\/[^\s`\]\)]+)([`)\]])?/g, (match, prefix, url, suffix) => {
             if (prefix === '`') return match; 
             const pre = prefix || '';
             const suf = suffix || '';
             
             // Strip trailing dots, commas, or parentheses that might be part of the sentence but not the URL
             let cleanUrl = url;
             let trail = '';
             const trailingMatch = url.match(/[.,;)]+$/);
             if (trailingMatch) {
                 trail = trailingMatch[0];
                 cleanUrl = url.substring(0, url.length - trail.length);
             }

             return `${pre}<span class="inline-flex items-center gap-0.5 align-baseline"><a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline decoration-2 underline-offset-2 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded break-all">${cleanUrl}</a><button class="url-copy-btn ml-0.5 p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-indigo-500 transition-colors" data-url="${cleanUrl}" title="Copy URL"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button></span>${trail}${suf}`;
        });

        // Bold
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>');
        
        // Inline Code
        safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[12px] font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10">$1</code>');

        // 4. Line-based processing
        const lines = safeText.split('\n');
        let html = '';
        let inList = false;

        lines.forEach((line) => {
            // Check for placeholder
            if (line.match(/__PLACEHOLDER_(\d+)__/)) {
                if (inList) { html += '</ul>'; inList = false; }
                html += line.replace(/__PLACEHOLDER_(\d+)__/g, (m, id) => placeholders[id]);
                return;
            }

            const listMatch = line.match(/^(\s*)(?:[\-\*])\s+(.*)/);
            if (listMatch) {
                if (!inList) {
                    html += '<ul class="list-disc list-outside ml-5 space-y-1.5 my-3 text-zinc-600 dark:text-zinc-300 marker:text-indigo-400 dark:marker:text-indigo-500">';
                    inList = true;
                }
                html += `<li class="pl-1 leading-relaxed text-[15px]">${listMatch[2]}</li>`;
                return;
            } 
            
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const content = headingMatch[2];
                const sizes = ['text-xl font-bold', 'text-lg font-bold', 'text-base font-bold'];
                html += `<h${level} class="${sizes[level-1]} text-zinc-900 dark:text-white mt-6 mb-3 tracking-tight">${content}</h${level}>`;
                return;
            }

            if (line.trim().match(/^[-_]{3,}$/)) {
                html += '<hr class="border-zinc-200 dark:border-zinc-800/50 my-6" />';
                return;
            }
            
            if (line.trim().startsWith('&gt;')) {
                html += `<blockquote class="border-l-4 border-indigo-200 dark:border-indigo-500/30 pl-4 py-1 my-4 text-zinc-500 dark:text-zinc-400 italic bg-zinc-50/50 dark:bg-white/5 rounded-r-lg">${line.replace(/^&gt;\s*/, '')}</blockquote>`;
                return;
            }

            if (line.trim() !== '') {
                 html += `<p class="mb-3 leading-7 text-[15px] text-zinc-600 dark:text-zinc-300">${line}</p>`;
            }
        });

        if (inList) html += '</ul>';

        return html;
    };

    return <div ref={containerRef} className="markdown-content w-full" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
};

const Message = ({ message, ...props }) => {
  const isAI = message.sender === 'ai';
  const avatarSrc = message.avatar || `https://ui-avatars.com/api/?name=${message.name}&background=random`;
  const time = new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const attachments = message.attachments || [];
  
  const [copied, setCopied] = useState(false);

  // Use ref to access the actual DOM content for copying rich HTML
  const markdownRef = useRef(null);

  const handleCopyAll = async () => {
      try {
        if (!isAI) {
             // Simple copy for user messages
             await navigator.clipboard.writeText(message.text);
             setCopied(true);
             setTimeout(() => setCopied(false), 2000);
             return;
        }

        // Advanced Rich Copy for AI messages (Preserves tables, links, etc.)
        // We need to clone the node to clean it up (remove copy buttons) before putting it on clipboard
        const container = document.querySelector(`[data-message-id="${message.id}"] .markdown-content`);
        
        if (container) {
            const clone = container.cloneNode(true) as HTMLElement;
            
            // Remove UI artifacts (Copy buttons)
            clone.querySelectorAll('button').forEach(btn => btn.remove());
            clone.querySelectorAll('details').forEach(el => el.remove()); // Remove QA logs

            const htmlContent = clone.innerHTML;
            const textContent = clone.innerText;

            const blobHtml = new Blob([htmlContent], { type: 'text/html' });
            const blobText = new Blob([textContent], { type: 'text/plain' });
            
            const data = [new ClipboardItem({
                ['text/html']: blobHtml,
                ['text/plain']: blobText,
            })];
            
            await navigator.clipboard.write(data);
        } else {
             // Fallback
             await navigator.clipboard.writeText(message.text);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard access failed", err);
        // Fallback to simple text copy if HTML copy fails (e.g. permission issue)
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {}
      }
  };

  return (
    <div className={`flex gap-4 animate-fade-in-up ${isAI ? 'bg-transparent' : 'flex-row-reverse'}`} data-message-id={message.id}>
      <div className="flex-shrink-0 mt-1">
          <img 
            src={avatarSrc} 
            alt={message.name} 
            className={`w-10 h-10 rounded-xl shadow-sm object-cover border-2 ${isAI ? 'border-white dark:border-zinc-800' : 'border-indigo-100 dark:border-indigo-900'}`} 
          />
      </div>

      <div className={`flex-1 min-w-0 max-w-3xl ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`flex items-center gap-2 mb-1.5 ${isAI ? '' : 'flex-row-reverse'}`}>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{message.name}</span>
            <span className="text-[10px] text-zinc-400 font-medium">{time}</span>
        </div>
        
        <div className={`relative group ${
            isAI 
            ? 'bg-white dark:bg-zinc-900 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800 shadow-lg shadow-zinc-200/20 dark:shadow-none p-6' 
            : 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 shadow-lg shadow-indigo-500/20'
        }`}>
             
             {/* Attachments (User Only mostly) */}
             {attachments.length > 0 && (
                <div className={`flex gap-2 mb-3 flex-wrap ${isAI ? '' : 'justify-end'}`}>
                    {attachments.map((att, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-white/20">
                            <img src={att.data} alt="attachment" className="max-w-[150px] max-h-[150px] object-cover hover:scale-105 transition-transform" />
                        </div>
                    ))}
                </div>
             )}

             {isAI ? (
                 <div className="relative">
                     <MarkdownRenderer text={message.text} />
                     <button 
                        onClick={handleCopyAll}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-500 focus:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Copy Message"
                        aria-label="Copy entire message"
                     >
                        {copied ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                     </button>
                 </div>
             ) : (
                 <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</div>
             )}
        </div>
      </div>
    </div>
  );
};

// Optimization: Memoize Message to prevent unnecessary re-renders of list during streaming
export default React.memo(Message);
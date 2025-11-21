
import React, { useState, useEffect, useRef } from 'react';

const MarkdownRenderer = ({ text }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Inject copy buttons into code blocks post-render
        const codeBlocks = containerRef.current.querySelectorAll('pre');
        codeBlocks.forEach((pre) => {
            if (pre.querySelector('.code-copy-btn')) return; // Prevent duplicates

            const button = document.createElement('button');
            button.className = 'code-copy-btn absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all text-xs font-mono border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100';
            button.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
            button.onclick = () => {
                const code = pre.querySelector('code')?.innerText || '';
                navigator.clipboard.writeText(code);
                button.innerHTML = '<svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                setTimeout(() => button.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>', 2000);
            };
            
            // Ensure pre has relative positioning for absolute button
            pre.style.position = 'relative';
            pre.classList.add('group');
            pre.appendChild(button);
        });
    }, [text]);

    const renderContent = () => {
        if (!text) return '';
        
        let safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Thinking Block Parsing - improved collapsible UX
        safeText = safeText.replace(/&lt;thinking&gt;([\s\S]*?)&lt;\/thinking&gt;/g, (match, content) => {
            return `<details class="mb-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-100/50 dark:border-amber-900/30 overflow-hidden group"><summary class="px-3 py-2 text-[11px] font-bold text-amber-700 dark:text-amber-500 cursor-pointer select-none flex items-center gap-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors outline-none"><div class="w-4 h-4 flex items-center justify-center bg-amber-200 dark:bg-amber-900 rounded text-amber-800 dark:text-amber-200"><svg class="w-2.5 h-2.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg></div><span>QA Log & Verification</span></summary><div class="px-3 py-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap bg-white/50 dark:bg-transparent border-t border-amber-100/50 dark:border-amber-900/30">${content.trim()}</div></details>`;
        });

        // Table Parsing - improved visual hierarchy
        const tableRegex = /((?:\|.+?\|[\r\n]+)+\|[-:| ]+\|[\r\n]+(?:\|.+?\|[\r\n]*)+)/g;
        const placeholders = [];
        safeText = safeText.replace(tableRegex, (match) => {
            const rows = match.trim().split('\n');
            let html = '<div class="overflow-hidden my-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">';
            
            rows.forEach((row, index) => {
                const cols = row.split('|').filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map(c => c.trim());
                if (index === 1) return; 
                if (index === 0) {
                    html += '<thead class="bg-zinc-50/80 dark:bg-zinc-800/50"><tr>';
                    cols.forEach(col => html += `<th class="px-4 py-2.5 text-left text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-sans">${col}</th>`);
                    html += '</tr></thead><tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50 bg-white dark:bg-transparent">';
                } else {
                    html += `<tr class="${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-zinc-50/30 dark:bg-zinc-800/20'} hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">`;
                    cols.forEach(col => html += `<td class="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">${col}</td>`);
                    html += '</tr>';
                }
            });
            html += '</tbody></table></div></div>';
            placeholders.push(html);
            return `__TABLE_PLACEHOLDER_${placeholders.length - 1}__`;
        });

        // Code Blocks - Improved Mac-style header
        safeText = safeText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-950"><div class="bg-zinc-100 dark:bg-[#161b22] px-3 py-1.5 flex items-center justify-between border-b border-zinc-200 dark:border-white/5"><div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-sm"></div><div class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-sm"></div><div class="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-sm"></div></div><span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-2">${lang || 'text'}</span></div><pre class="bg-white dark:bg-[#0d1117] p-4 overflow-x-auto text-zinc-800 dark:text-zinc-300 text-[13px] font-mono leading-relaxed relative group"><code>${code.trim()}</code></pre></div>`;
        });

        // Links
        safeText = safeText.replace(/([`(\[])?(https?:\/\/[^\s`\]\)]+)([`)\]])?/g, (match, prefix, url, suffix) => {
             return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline decoration-indigo-500/30 underline-offset-2 transition-colors font-medium break-all">${url}</a>`;
        });

        // Bold
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-50">$1</strong>');
        
        // Inline Code
        safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[12px] font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 align-middle">$1</code>');

        // Lines
        const lines = safeText.split('\n');
        let html = '';
        let inList = false;

        lines.forEach((line) => {
            if (line.includes('__TABLE_PLACEHOLDER_')) {
                 const index = parseInt(line.match(/__TABLE_PLACEHOLDER_(\d+)__/)[1]);
                 html += placeholders[index];
                 return;
            }
            const listMatch = line.match(/^(\s*)(?:[\-\*])\s+(.*)/);
            if (listMatch) {
                if (!inList) {
                    html += '<ul class="list-disc list-outside ml-4 space-y-1 my-3 text-zinc-700 dark:text-zinc-300 marker:text-zinc-300 dark:marker:text-zinc-600">';
                    inList = true;
                }
                html += `<li class="pl-1 leading-relaxed text-[14.5px]">${listMatch[2]}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    const content = headingMatch[2];
                    const sizes = ['text-xl font-bold', 'text-lg font-bold', 'text-base font-bold'];
                    const margins = ['mt-6 mb-3', 'mt-5 mb-2', 'mt-4 mb-2'];
                    const colors = ['text-zinc-900 dark:text-zinc-50', 'text-zinc-900 dark:text-zinc-100', 'text-zinc-800 dark:text-zinc-200'];
                    html += `<h${level} class="${sizes[level-1]} ${colors[level-1]} ${margins[level-1]} tracking-tight border-b border-zinc-100 dark:border-zinc-800/50 pb-1">${content}</h${level}>`;
                }
                else if (line.trim().match(/^[-_]{3,}$/)) {
                    html += '<hr class="border-zinc-200 dark:border-zinc-800 my-6" />';
                }
                else if (line.trim() !== '' && !line.startsWith('<div') && !line.startsWith('<details') && !line.startsWith('</details')) {
                    if (line.includes('**') && line.includes(':')) {
                         // Key-value pair highlighting
                         html += `<div class="mb-2 text-zinc-800 dark:text-zinc-200 text-[14.5px] font-medium leading-relaxed bg-zinc-50 dark:bg-white/5 px-3 py-2 rounded border border-zinc-100 dark:border-white/5">${line}</div>`;
                    } else {
                         html += `<p class="mb-3 leading-7 text-[14.5px] text-zinc-600 dark:text-zinc-300">${line}</p>`;
                    }
                } else {
                    html += line; 
                }
            }
        });
        if (inList) html += '</ul>';
        return html;
    };

    return <div ref={containerRef} className="markdown-content w-full max-w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
};

const Message = ({ message, ...props }) => {
  const [copiedType, setCopiedType] = useState(null); 
  const isAI = message.sender === 'ai';
  
  // Use UI Avatar generator for consistent look if no avatar provided
  const avatarSrc = message.avatar || `https://ui-avatars.com/api/?name=${message.name}&background=random`;
  
  const time = new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const emailMatch = isAI ? message.text.match(/=== Email ===([\s\S]*?)=== End ===/) : null;
  const emailText = emailMatch ? emailMatch[1].trim() : null;
  
  const analysisText = isAI && message.text.includes('=== End ===') 
      ? message.text.split('=== End ===')[1].trim() 
      : null;

  const handleCopy = (text, type) => {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
          setCopiedType(type);
          setTimeout(() => setCopiedType(null), 2000);
      });
  };

  const CopyButton = ({ onClick, type, title }) => (
      <button
        onClick={onClick}
        title={title}
        className="h-8 px-2.5 flex items-center gap-1.5 bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-sm transition-all text-[11px] font-medium"
      >
         {copiedType === type ? (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
         ) : (
             <>
                 {type === 'email' && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                 {type === 'analysis' && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                 {type === 'all' && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                 <span>{title}</span>
             </>
         )}
      </button>
  );

  return (
    <div className={`group flex gap-4 ${isAI ? '' : 'flex-row-reverse'} animate-fade-in-up`}>
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
          <img 
            src={avatarSrc} 
            alt={message.name} 
            className={`w-9 h-9 rounded-lg shadow-sm object-cover ring-1 ${isAI ? 'ring-black/5 dark:ring-white/10' : 'ring-indigo-500 dark:ring-indigo-500'}`} 
          />
      </div>

      <div className={`flex-1 min-w-0 max-w-3xl ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`flex items-baseline gap-2 mb-1.5 ${isAI ? '' : 'flex-row-reverse'}`}>
            <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{message.name}</span>
            <span className="text-[11px] text-zinc-400 font-mono">{time}</span>
        </div>
        
        <div className={`relative rounded-2xl px-5 py-4 shadow-sm border transition-all ${
            isAI 
            ? 'bg-white dark:bg-zinc-900/60 backdrop-blur-md border-zinc-200 dark:border-zinc-800 rounded-tl-sm' 
            : 'bg-indigo-600 dark:bg-indigo-600 border-transparent rounded-tr-sm text-white shadow-indigo-500/20'
        }`}>
             {isAI ? (
                 <MarkdownRenderer text={message.text} />
             ) : (
                 <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</div>
             )}
        </div>

        {/* Actions Toolbar - visible on hover */}
        {isAI && (
             <div className="mt-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                {emailText && <CopyButton onClick={() => handleCopy(emailText, 'email')} type="email" title="Copy Email" />}
                {analysisText && <CopyButton onClick={() => handleCopy(analysisText, 'analysis')} type="analysis" title="Copy Record" />}
                <CopyButton onClick={() => handleCopy(message.text, 'all')} type="all" title="Copy All" />
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;

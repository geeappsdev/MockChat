
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
            button.className = 'code-copy-btn absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all text-xs font-mono border border-white/10 backdrop-blur-md';
            button.innerHTML = 'Copy';
            button.onclick = () => {
                const code = pre.querySelector('code')?.innerText || '';
                navigator.clipboard.writeText(code);
                button.innerText = 'Copied!';
                setTimeout(() => button.innerText = 'Copy', 2000);
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

        // Thinking Block Parsing
        safeText = safeText.replace(/&lt;thinking&gt;([\s\S]*?)&lt;\/thinking&gt;/g, (match, content) => {
            return `<details class="mb-6 p-3 bg-indigo-50/40 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30 group backdrop-blur-sm"><summary class="text-xs font-bold text-indigo-600 dark:text-indigo-300 cursor-pointer select-none flex items-center gap-2"><span>🤖 QA Reasoning Log</span><span class="text-[10px] font-normal opacity-70 group-open:hidden">(Click to expand)</span></summary><div class="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">${content.trim()}</div></details>`;
        });

        // Table Parsing
        const tableRegex = /((?:\|.+?\|[\r\n]+)+\|[-:| ]+\|[\r\n]+(?:\|.+?\|[\r\n]*)+)/g;
        const placeholders = [];
        safeText = safeText.replace(tableRegex, (match) => {
            const rows = match.trim().split('\n');
            let html = '<div class="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm"><table class="min-w-full divide-y divide-zinc-200/50 dark:divide-white/10">';
            
            rows.forEach((row, index) => {
                const cols = row.split('|').filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map(c => c.trim());
                if (index === 1) return; 
                if (index === 0) {
                    html += '<thead class="bg-zinc-50/50 dark:bg-white/5"><tr>';
                    cols.forEach(col => html += `<th class="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">${col}</th>`);
                    html += '</tr></thead><tbody class="divide-y divide-zinc-200/50 dark:divide-white/5">';
                } else {
                    html += '<tr>';
                    cols.forEach(col => html += `<td class="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">${col}</td>`);
                    html += '</tr>';
                }
            });
            html += '</tbody></table></div>';
            placeholders.push(html);
            return `__TABLE_PLACEHOLDER_${placeholders.length - 1}__`;
        });

        // Code Blocks
        safeText = safeText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="bg-zinc-900/90 dark:bg-black/80 rounded-xl p-4 my-4 overflow-x-auto text-zinc-100 text-sm font-mono leading-relaxed border border-zinc-800/50 shadow-inner backdrop-blur-md"><code>${code.trim()}</code></pre>`;
        });

        // Links
        safeText = safeText.replace(/([`(\[])?(https?:\/\/[^\s`\]\)]+)([`)\]])?/g, (match, prefix, url, suffix) => {
             return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500/60 transition-colors break-all font-medium">${url}<svg class="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
        });

        // Bold
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-zinc-900 dark:text-zinc-50">$1</strong>');
        
        // Inline Code
        safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-white/60 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-white/10 shadow-sm">$1</code>');

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
                    html += '<ul class="list-disc list-outside ml-5 space-y-2 my-4 text-zinc-700 dark:text-zinc-300 marker:text-zinc-400">';
                    inList = true;
                }
                html += `<li class="pl-1 leading-relaxed">${listMatch[2]}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    const content = headingMatch[2];
                    const sizes = ['text-3xl tracking-tight', 'text-2xl tracking-tight', 'text-xl tracking-tight'];
                    const margins = ['mt-8 mb-4', 'mt-6 mb-3', 'mt-5 mb-2'];
                    html += `<h${level} class="font-bold text-zinc-900 dark:text-zinc-50 ${margins[level-1]} ${sizes[level-1]} drop-shadow-sm">${content}</h${level}>`;
                }
                else if (line.trim().match(/^[-_]{3,}$/)) {
                    html += '<hr class="border-zinc-200/50 dark:border-white/10 my-8" />';
                }
                else if (line.trim() !== '' && !line.startsWith('<pre') && !line.startsWith('<div class="overflow') && !line.startsWith('<details') && !line.startsWith('</details')) {
                    if (line.includes('**') && line.includes(':')) {
                         html += `<div class="mb-2 text-zinc-800 dark:text-zinc-200 font-medium">${line}</div>`;
                    } else {
                         html += `<p class="mb-4 leading-relaxed text-zinc-700 dark:text-zinc-300">${line}</p>`;
                    }
                } else {
                    html += line; 
                }
            }
        });
        if (inList) html += '</ul>';
        return html;
    };

    return <div ref={containerRef} className="markdown-content text-base max-w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
};

const Message = ({ message, ...props }) => {
  const [copiedType, setCopiedType] = useState(null); 
  const isAI = message.sender === 'ai';
  
  const avatarClass = isAI 
    ? 'bg-gradient-to-br from-zinc-800 to-black dark:from-white dark:to-zinc-300 text-white dark:text-zinc-900' 
    : 'bg-white dark:bg-white/10 text-zinc-600 dark:text-zinc-300';
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Updated regex to match new streamlined separators
  const emailMatch = isAI ? message.text.match(/=== Email ===([\s\S]*?)=== End ===/) : null;
  const emailText = emailMatch ? emailMatch[1].trim() : null;
  
  const analysisText = isAI && message.text.includes('=== End ===') 
      ? message.text.split('=== End ===')[1].trim() 
      : null;

  const isAvatarUrl = message.avatar?.startsWith('http');

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
        className="h-10 w-10 flex items-center justify-center bg-white/60 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-white hover:text-zinc-900 dark:hover:text-white shadow-sm transition-all backdrop-blur-sm"
      >
         {copiedType === type ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
           </svg>
         ) : (
             type === 'email' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
             ) : type === 'analysis' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
             )
         )}
      </button>
  );

  return (
    <div className={`group flex items-start gap-5 px-6 py-6 -mx-6 rounded-3xl transition-all duration-300 border border-transparent ${isAI ? 'hover:bg-white/40 dark:hover:bg-white/5 hover:border-white/30 dark:hover:border-white/5 hover:shadow-sm' : ''}`}>
      <div className={`w-10 h-10 ${!isAvatarUrl ? avatarClass : ''} rounded-2xl shadow-md flex items-center justify-center font-bold text-lg flex-shrink-0 select-none ring-1 ring-white/20 overflow-hidden backdrop-blur-sm`} aria-hidden="true">
        {isAvatarUrl ? (
            <img src={message.avatar} alt={message.name} className="w-full h-full object-cover" />
        ) : (
            message.avatar
        )}
      </div>
      <div className="flex-1 relative min-w-0">
        <div className="flex items-baseline gap-2 mb-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{message.name}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{time}</span>
        </div>
        <MarkdownRenderer text={message.text} />
        
        {/* Actions */}
        {isAI && (
             <div className="mt-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                {emailText && <CopyButton onClick={() => handleCopy(emailText, 'email')} type="email" title="Copy Email Only" />}
                {analysisText && <CopyButton onClick={() => handleCopy(analysisText, 'analysis')} type="analysis" title="Copy Analysis Only" />}
                <CopyButton onClick={() => handleCopy(message.text, 'all')} type="all" title="Copy Full Output" />
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;

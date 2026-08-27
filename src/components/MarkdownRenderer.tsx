'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body space-y-3 leading-relaxed text-xs ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold font-serif text-[#1a1714] mt-4 mb-2 pb-1 border-b border-[#1a1714]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold font-serif text-[#1a1714] mt-3.5 mb-1.5 pb-1 border-b border-[#1a1714]/30">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold font-serif text-[#1a1714] mt-3 mb-1 uppercase tracking-wider font-mono">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-bold text-[#1a1714] mt-2.5 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed text-[#1a1714]">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2.5 space-y-1 text-[#1a1714]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-[#1a1714]">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          hr: () => <hr className="my-3 border-t border-[#1a1714]" />,
          strong: ({ children }) => <strong className="font-bold text-[#1a1714]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#1a1714] bg-[#ebd9be]/50 pl-3 py-1 my-2 text-xs italic text-[#1a1714]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto border border-[#1a1714] bg-[#ffffff]">
              <table className="w-full text-left border-collapse text-[11px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#e8e0d0] border-b border-[#1a1714] font-mono font-bold text-[#1a1714]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-[#1a1714]/20">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[#f5f0e8] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2 font-bold border-r border-[#1a1714] last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="p-2 border-r border-[#1a1714]/20 last:border-r-0 align-top">{children}</td>,
          code: ({ children }) => (
            <code className="bg-[#e8e0d0] text-[#1a1714] px-1 py-0.5 font-mono text-[10px] border border-[#1a1714]/30">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

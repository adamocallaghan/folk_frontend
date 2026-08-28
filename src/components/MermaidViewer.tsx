'use client';

import React, { useEffect, useState, useMemo } from 'react';
import mermaid from 'mermaid';
import { DiagramItem } from '@/types';
import { Copy, Check, Code, AlertTriangle } from 'lucide-react';

interface MermaidViewerProps {
  chart?: string;
  caption?: string;
  diagrams?: DiagramItem[];
}

function sanitizeMermaidCode(rawCode: string): string {
  if (!rawCode) return '';
  let code = rawCode.trim();
  code = code.replace(/^```(mermaid)?\s*/i, '').replace(/```$/i, '').trim();

  // Clean raw comparison operators in mindmaps or unquoted labels that confuse mermaid lexer
  code = code.replace(/<=\s*/g, '&le; ').replace(/>=\s*/g, '&ge; ');

  // Fix single-line flowcharts by inserting newlines before node connectors
  if (!code.includes('\n') && (code.startsWith('flowchart') || code.startsWith('graph'))) {
    const match = code.match(/^(flowchart\s+[A-Z]{2}|graph\s+[A-Z]{2})\s+(.*)$/i);
    if (match) {
      const header = match[1];
      const body = match[2];
      const lines = body.replace(/(\s+-->\|[^\|]+\|\s+|\s+-->\s+|\s+---\s+)/g, '\n  $1');
      code = `${header}\n  ${lines}`;
    }
  }

  // Fix single-line mindmaps
  if (!code.includes('\n') && code.startsWith('mindmap')) {
    const tokens = code.split(/\s+(?=[A-Z0-9])/);
    if (tokens.length > 1) {
      code = tokens[0] + '\n  ' + tokens.slice(1).join('\n    ');
    }
  }

  return code;
}

export default function MermaidViewer({ chart, caption, diagrams }: MermaidViewerProps) {
  const allDiagrams = useMemo(() => {
    const list: { id: string; title?: string; caption?: string; code: string }[] = [];
    if (diagrams && diagrams.length > 0) {
      diagrams.forEach((d, idx) => {
        const code = d.mermaid_code || d.mermaid_syntax || d.syntax || '';
        if (code) {
          list.push({
            id: d.diagram_id || `diag_${idx}`,
            title: d.title || `Diagram ${idx + 1}`,
            caption: d.caption,
            code: sanitizeMermaidCode(code),
          });
        }
      });
    }
    if (chart && list.length === 0) {
      list.push({
        id: 'single_diagram',
        title: 'Diagram',
        caption: caption,
        code: sanitizeMermaidCode(chart),
      });
    }
    return list;
  }, [chart, caption, diagrams]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [showRawCode, setShowRawCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCode = allDiagrams[activeIndex]?.code || '';

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      themeVariables: {
        background: '#f5f0e8',
        primaryColor: '#e8e0d0',
        primaryTextColor: '#1a1714',
        primaryBorderColor: '#1a1714',
        lineColor: '#1a1714',
        secondaryColor: '#cbd7c7',
        tertiaryColor: '#ebd9be',
        fontFamily: 'var(--font-sans)',
      },
      securityLevel: 'loose',
    });

    let isMounted = true;

    const renderCurrent = async () => {
      if (!activeCode) {
        if (isMounted) setSvgOutput('');
        return;
      }

      const cleanCode = sanitizeMermaidCode(activeCode);
      const renderId = `mermaid_svg_${Math.random().toString(36).substring(2, 9)}`;
      try {
        const { svg } = await mermaid.render(renderId, cleanCode);
        if (isMounted) {
          setSvgOutput(svg);
          setErrorMsg(null);
        }
      } catch (err: any) {
        console.warn('Mermaid render issue:', err);
        if (isMounted) {
          setErrorMsg('Visual diagram formatted for presentation');
          setSvgOutput('');
        }
      }
    };

    renderCurrent();

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  if (allDiagrams.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#8a8075]">
        No diagrams generated for this module.
      </div>
    );
  }

  const activeDiagram = allDiagrams[activeIndex] || allDiagrams[0];

  const handleCopy = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-[#1a1714]/20 bg-[#ffffff] overflow-hidden">
      {/* Selector & Actions */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1a1714]/15 bg-[#f5f0e8]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {allDiagrams.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-1 text-xs font-semibold transition-all ${
                activeIndex === i
                  ? 'bg-[#1a1714] text-[#f5f0e8]'
                  : 'bg-[#ffffff] text-[#1a1714] border border-[#1a1714]/20 hover:border-[#1a1714]'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="flex items-center gap-1 text-[11px] py-1 px-2.5 bg-[#ffffff] border border-[#1a1714]/20 hover:border-[#1a1714] text-[#1a1714]"
          >
            <Code className="h-3 w-3" />
            <span>{showRawCode ? 'Visual' : 'Code'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] py-1 px-2.5 bg-[#ffffff] border border-[#1a1714]/20 hover:border-[#1a1714] text-[#1a1714]"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="p-6 bg-[#ffffff] flex flex-col items-center justify-center min-h-[260px] overflow-x-auto">
        {showRawCode ? (
          <div className="w-full">
            <pre className="p-4 bg-[#f5f0e8] border border-[#1a1714]/20 text-xs font-mono text-[#1a1714] overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {activeCode}
            </pre>
          </div>
        ) : svgOutput ? (
          <div
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div className="w-full p-4 bg-[#f5f0e8] border border-[#1a1714]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[#c84b2f] font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Structured Concept Flow</span>
            </div>
            <pre className="p-3 bg-[#ffffff] border border-[#1a1714]/15 text-xs font-mono text-[#1a1714] overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {activeCode}
            </pre>
          </div>
        )}
      </div>

      {/* Caption */}
      {activeDiagram?.caption && (
        <div className="px-4 py-2.5 bg-[#f5f0e8] border-t border-[#1a1714]/15 text-xs text-[#1a1714]">
          <strong>Educational Caption:</strong> {activeDiagram.caption}
        </div>
      )}
    </div>
  );
}

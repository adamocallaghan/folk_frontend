'use client';

import React, { useEffect, useState, useMemo } from 'react';
import mermaid from 'mermaid';
import { DiagramItem } from '@/types';
import { Copy, Check, Code } from 'lucide-react';

interface MermaidViewerProps {
  chart?: string;
  caption?: string;
  diagrams?: DiagramItem[];
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
            code: code,
          });
        }
      });
    }
    if (chart && list.length === 0) {
      list.push({
        id: 'single_diagram',
        title: 'Architectural Model',
        caption: caption,
        code: chart,
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
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#121215',
        primaryColor: '#ffffff',
        primaryTextColor: '#fafafa',
        primaryBorderColor: '#3f3f46',
        lineColor: '#a1a1aa',
        secondaryColor: '#27272a',
        tertiaryColor: '#18181b',
        fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      securityLevel: 'loose',
    });

    let isMounted = true;

    const renderCurrent = async () => {
      if (!activeCode) {
        if (isMounted) setSvgOutput('');
        return;
      }

      let raw = activeCode.trim();
      raw = raw.replace(/^```(mermaid)?\s*/i, '').replace(/```$/i, '').trim();

      const renderId = `mermaid_svg_${Math.random().toString(36).substring(2, 9)}`;
      try {
        const { svg } = await mermaid.render(renderId, raw);
        if (isMounted) {
          setSvgOutput(svg);
          setErrorMsg(null);
        }
      } catch (err: any) {
        console.warn('Mermaid render warning:', err);
        if (isMounted) {
          setErrorMsg('Visual rendering fallback enabled');
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
      <div className="ui-panel p-8 text-center text-xs text-[#71717a]">
        No visual diagram blueprints generated for this module.
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
    <div className="ui-panel overflow-hidden">
      {/* Selector & Actions */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#27272a] bg-[#121215]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {allDiagrams.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIndex(i)}
              className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                activeIndex === i ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="flex items-center gap-1 text-[11px] text-[#a1a1aa] hover:text-white px-2 py-1 rounded bg-[#18181b] border border-[#27272a]"
          >
            <Code className="h-3 w-3" />
            <span>{showRawCode ? 'Visual' : 'Code'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-[#a1a1aa] hover:text-white px-2 py-1 rounded bg-[#18181b] border border-[#27272a]"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="p-6 bg-[#09090b] flex flex-col items-center justify-center min-h-[260px] overflow-x-auto">
        {showRawCode || errorMsg ? (
          <div className="w-full">
            {errorMsg && <p className="text-xs text-amber-400 mb-2 font-mono">{errorMsg}</p>}
            <pre className="p-4 rounded bg-[#121215] border border-[#27272a] text-xs font-mono text-[#fafafa] overflow-x-auto leading-relaxed">
              {activeCode}
            </pre>
          </div>
        ) : svgOutput ? (
          <div
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div className="text-xs text-[#71717a]">Rendering diagram layout...</div>
        )}
      </div>

      {/* Caption */}
      {activeDiagram?.caption && (
        <div className="px-3.5 py-2 bg-[#121215] border-t border-[#27272a] text-xs text-[#a1a1aa]">
          <strong className="text-white">Model Description:</strong> {activeDiagram.caption}
        </div>
      )}
    </div>
  );
}

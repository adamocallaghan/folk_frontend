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
        title: 'Diagram',
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
      <div className="paper-card p-8 text-center text-xs text-[#8a8075]">
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
    <div className="border border-[#1a1714] bg-[#f5f0e8] overflow-hidden">
      {/* Selector & Actions */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1a1714] bg-[#e8e0d0]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {allDiagrams.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-1 text-xs font-semibold border transition-colors whitespace-nowrap ${
                activeIndex === i ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="btn-paper flex items-center gap-1 text-[11px] py-1 px-2"
          >
            <Code className="h-3 w-3" />
            <span>{showRawCode ? 'Visual' : 'Code'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="btn-paper flex items-center gap-1 text-[11px] py-1 px-2"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="p-6 bg-[#f5f0e8] flex flex-col items-center justify-center min-h-[260px] overflow-x-auto">
        {showRawCode || errorMsg ? (
          <div className="w-full">
            {errorMsg && <p className="text-xs text-[#c84b2f] mb-2 font-mono">{errorMsg}</p>}
            <pre className="p-4 bg-[#e8e0d0] border border-[#1a1714] text-xs font-mono text-[#1a1714] overflow-x-auto leading-relaxed">
              {activeCode}
            </pre>
          </div>
        ) : svgOutput ? (
          <div
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div className="text-xs text-[#8a8075]">Rendering diagram...</div>
        )}
      </div>

      {/* Caption */}
      {activeDiagram?.caption && (
        <div className="px-3.5 py-2 bg-[#e8e0d0] border-t border-[#1a1714] text-xs text-[#1a1714]">
          <strong>Description:</strong> {activeDiagram.caption}
        </div>
      )}
    </div>
  );
}

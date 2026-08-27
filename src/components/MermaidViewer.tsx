'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { DiagramItem } from '@/types';
import { Copy, Check, Code, Image as ImageIcon } from 'lucide-react';

interface MermaidViewerProps {
  chart?: string;
  caption?: string;
  diagrams?: DiagramItem[];
}

export default function MermaidViewer({ chart, caption, diagrams }: MermaidViewerProps) {
  // Collect all available diagrams
  const allDiagrams: { id: string; title?: string; caption?: string; code: string }[] = [];

  if (diagrams && diagrams.length > 0) {
    diagrams.forEach((d, idx) => {
      const code = d.mermaid_code || d.mermaid_syntax || d.syntax || '';
      if (code) {
        allDiagrams.push({
          id: d.diagram_id || `diag_${idx}`,
          title: d.title || `Diagram ${idx + 1}`,
          caption: d.caption,
          code: code,
        });
      }
    });
  }

  if (chart && allDiagrams.length === 0) {
    allDiagrams.push({
      id: 'single_diagram',
      title: 'Architectural Model',
      caption: caption,
      code: chart,
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [showRawCode, setShowRawCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeDiagram = allDiagrams[activeIndex] || allDiagrams[0];

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0e111a',
        primaryColor: '#4f46e5',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#6366f1',
        lineColor: '#38bdf8',
        secondaryColor: '#10b981',
        tertiaryColor: '#f59e0b',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      },
      securityLevel: 'loose',
    });

    const renderCurrent = async () => {
      if (!activeDiagram || !activeDiagram.code) {
        setSvgOutput('');
        return;
      }

      setErrorMsg(null);
      let raw = activeDiagram.code.trim();
      // Remove markdown code fences if present
      raw = raw.replace(/^```(mermaid)?\s*/i, '').replace(/```$/i, '').trim();

      const renderId = `mermaid_render_${Math.random().toString(36).substring(2, 9)}`;
      try {
        const { svg } = await mermaid.render(renderId, raw);
        setSvgOutput(svg);
      } catch (err: any) {
        console.warn('Mermaid render error:', err);
        setErrorMsg('Could not render SVG visually. Showing clean syntax fallback.');
      }
    };

    renderCurrent();
  }, [activeDiagram]);

  if (allDiagrams.length === 0) {
    return (
      <div className="panel p-8 text-center text-xs text-slate-500">
        No visual diagram blueprints generated for this lesson.
      </div>
    );
  }

  const handleCopy = () => {
    if (activeDiagram?.code) {
      navigator.clipboard.writeText(activeDiagram.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="panel overflow-hidden">
      {/* Diagram Selector & Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 overflow-x-auto">
          {allDiagrams.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap font-medium ${
                activeIndex === i
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <Code className="h-3 w-3" />
            <span>{showRawCode ? 'Visual View' : 'Syntax'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Render Stage */}
      <div className="p-6 bg-[#080a0f] flex flex-col items-center justify-center min-h-[260px] overflow-x-auto">
        {showRawCode || errorMsg ? (
          <div className="w-full">
            {errorMsg && <p className="text-xs text-amber-400 mb-2">{errorMsg}</p>}
            <pre className="p-4 rounded-md bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {activeDiagram?.code}
            </pre>
          </div>
        ) : svgOutput ? (
          <div
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div className="text-xs text-slate-500">Synthesizing diagram layout...</div>
        )}
      </div>

      {/* Caption */}
      {activeDiagram?.caption && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400">
          <strong className="text-slate-300">Description:</strong> {activeDiagram.caption}
        </div>
      )}
    </div>
  );
}

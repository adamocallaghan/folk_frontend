"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Check, Copy, RefreshCw, ZoomIn } from "lucide-react";

interface MermaidViewerProps {
  chart: string;
  caption?: string;
}

export default function MermaidViewer({ chart, caption }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0e131f",
        primaryColor: "#6366f1",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#818cf8",
        lineColor: "#38bdf8",
        secondaryColor: "#10b981",
        tertiaryColor: "#f59e0b",
      },
      fontFamily: "Inter, sans-serif",
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (!chart) return;
      try {
        setRenderError(null);
        // Clean chart string
        let cleanChart = chart.trim();
        if (cleanChart.startsWith("```mermaid")) {
          cleanChart = cleanChart.replace(/^```mermaid\s*/, "").replace(/```$/, "").trim();
        } else if (cleanChart.startsWith("```")) {
          cleanChart = cleanChart.replace(/^```\s*/, "").replace(/```$/, "").trim();
        }

        const id = `mermaid_${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanChart);
        setSvgContent(svg);
      } catch (err: any) {
        console.warn("Mermaid render warning:", err);
        setRenderError("Could not render diagram visually. Fallback text below.");
      }
    };

    renderChart();
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel overflow-hidden border border-white/10 my-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Pedagogical Visual Diagram
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 flex flex-col items-center justify-center min-h-[220px] bg-[#090d16]/60">
        {renderError ? (
          <div className="w-full text-center">
            <p className="text-xs text-amber-400 mb-3">{renderError}</p>
            <pre className="text-left text-xs font-mono p-4 rounded-lg bg-black/40 border border-white/5 text-slate-300 overflow-x-auto">
              {chart}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            Synthesizing Visual Model...
          </div>
        )}
      </div>

      {caption && (
        <div className="px-4 py-2 bg-black/30 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400 italic">
            Figure: {caption}
          </p>
        </div>
      )}
    </div>
  );
}

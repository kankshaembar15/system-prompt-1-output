import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Code2, Eye, AlertTriangle } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  title?: string;
  onNodeClick?: (nodeId: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, title = 'System Architecture Flowchart' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#1e293b',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#38bdf8',
        lineColor: '#60a5fa',
        secondaryColor: '#0f172a',
        tertiaryColor: '#1e1b4b',
        clusterBkg: '#0b1120',
        clusterBorder: '#3b82f6',
        nodeBorder: '#38bdf8',
        mainBkg: '#1e293b',
        nodeTextColor: '#f1f5f9',
      },
    });
  }, []);

  useEffect(() => {
    if (!chart) return;
    setRenderError(null);

    // Clean any unwanted markdown codeblock wrappers if present
    let cleanChart = chart.trim();
    if (cleanChart.startsWith('```mermaid')) {
      cleanChart = cleanChart.replace(/^```mermaid\s*/i, '').replace(/```$/i, '').trim();
    } else if (cleanChart.startsWith('```')) {
      cleanChart = cleanChart.replace(/^```\s*/, '').replace(/```$/i, '').trim();
    }

    const uniqueId = `mermaid-diagram-${Math.random().toString(36).substring(2, 9)}`;

    async function renderChart() {
      try {
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        setSvgContent(svg);
        setRenderError(null);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setRenderError(err.message || 'Syntax error in Mermaid flowchart definition');
      }
    }

    renderChart();
  }, [chart]);

  const handleCopyCode = () => {
    // Formatted strictly as requested: clear text segment labeled [FLOWCHART] without Markdown code blocks inside the Mermaid string
    const textToCopy = `[FLOWCHART]\n${chart.trim()}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `architecture-flowchart-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgContent) return;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (image.width || 1200) * 2;
      canvas.height = (image.height || 800) * 2;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#0b0f19';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const png = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = png;
        a.download = `architecture-flowchart-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URLObject.revokeObjectURL(blobURL);
    };

    image.src = blobURL;
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-700/80 bg-slate-950/60 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-mono font-bold tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-800 rounded">
            [FLOWCHART]
          </span>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Visual / Code Toggle */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'visual'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Mermaid</span>
            </button>
          </div>

          {/* Zoom controls (visual mode only) */}
          {viewMode === 'visual' && !renderError && (
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
                title="Zoom Out"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-400 min-w-[36px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
                title="Zoom In"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Export tools */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Copy [FLOWCHART] text segment"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!svgContent || !!renderError}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg transition-colors"
            title="Download vector SVG"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={!svgContent || !!renderError}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg transition-colors"
            title="Download PNG image"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[380px] max-h-[640px] overflow-auto bg-[#070b14] p-4 flex items-center justify-center">
        {viewMode === 'visual' ? (
          renderError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
              <h4 className="text-sm font-semibold text-slate-200 mb-1">Diagram Rendering Notice</h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                The diagram definition can still be inspected as clean Mermaid syntax below.
              </p>
              <pre className="text-left w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {chart}
              </pre>
            </div>
          ) : svgContent ? (
            <div
              ref={containerRef}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
              className="w-full flex items-center justify-center py-4 select-none"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Rendering architecture graph...</span>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-cyan-400">Mermaid.js Flowchart (graph TD)</span>
              <span>Clean text segment ready for GitHub / Notion / Docs</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-200 overflow-x-auto whitespace-pre leading-relaxed select-all">
{`[FLOWCHART]
${chart.trim()}`}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info Banner */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Components, data inputs, model layers, and data outputs mapped strictly to paper specification.</span>
        </span>
        <span className="font-mono text-slate-500">Mermaid graph TD</span>
      </div>
    </div>
  );
};

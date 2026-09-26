/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  BookOpen, 
  FileCode, 
  GitFork, 
  Share2, 
  Download, 
  Info, 
  ExternalLink,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { PRESET_PAPERS, PaperPreset } from './data/presetPapers';
import { MermaidViewer } from './components/MermaidViewer';
import { CoreConceptCard } from './components/CoreConceptCard';
import { StudentOpportunities } from './components/StudentOpportunities';
import { PaperInputSection } from './components/PaperInputSection';
import { TokenEfficiencyBadge } from './components/TokenEfficiencyBadge';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Initial state loads the landmark Transformer paper for zero-wait immediate discovery
  const [selectedPreset, setSelectedPreset] = useState<PaperPreset>(PRESET_PAPERS[0]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(PRESET_PAPERS[0].initialAnalysis);
  const [currentTitle, setCurrentTitle] = useState<string>(PRESET_PAPERS[0].title);
  const [currentUrl, setCurrentUrl] = useState<string>(PRESET_PAPERS[0].url);
  const [currentAuthors, setCurrentAuthors] = useState<string[]>(PRESET_PAPERS[0].authors);
  const [currentVenue, setCurrentVenue] = useState<string>(PRESET_PAPERS[0].conferenceOrVenue);
  const [currentYear, setCurrentYear] = useState<number>(PRESET_PAPERS[0].year);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showDirectivesModal, setShowDirectivesModal] = useState<boolean>(false);

  // Token tracker state
  const [tokenMetrics, setTokenMetrics] = useState({
    promptTokens: 820,
    candidateTokens: 960,
    totalTokens: 1780,
    budgetLimit: 25000,
  });

  const handleSelectPreset = (preset: PaperPreset) => {
    setSelectedPreset(preset);
    setCurrentTitle(preset.title);
    setCurrentUrl(preset.url);
    setCurrentAuthors(preset.authors);
    setCurrentVenue(preset.conferenceOrVenue);
    setCurrentYear(preset.year);
    setAnalysisError(null);

    if (preset.initialAnalysis) {
      setCurrentAnalysis(preset.initialAnalysis);
    }
  };

  const handleAnalyzePaper = async ({
    url,
    title,
    summary,
    additionalContext,
  }: {
    url: string;
    title: string;
    summary: string;
    additionalContext?: string;
  }) => {
    setIsLoading(true);
    setAnalysisError(null);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title,
          summary,
          additionalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.analysis) {
        setCurrentAnalysis(result.analysis);
        setCurrentTitle(result.analysis.meta?.paperTitle || title || 'Synthesized Paper Architecture');
        if (result.tokens) {
          setTokenMetrics(result.tokens);
        }
      } else {
        throw new Error('Invalid analysis format returned by agent');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Failed to complete paper analysis. Please check the URL or try another paper.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Agent Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/40">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  PaperArch
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  CS Research Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Academic Paper Parsing • Mermaid Architecture • Student Resume Projects
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Token Efficiency Guard Component */}
            <TokenEfficiencyBadge
              promptTokens={tokenMetrics.promptTokens}
              candidateTokens={tokenMetrics.candidateTokens}
              totalTokens={tokenMetrics.totalTokens}
              budgetLimit={tokenMetrics.budgetLimit}
            />

            {/* Directives & Guidelines Inspector */}
            <button
              onClick={() => setShowDirectivesModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
              title="Inspect agent operational directives"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operational Constraints</span>
            </button>

            {/* Export Report */}
            {currentAnalysis && (
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Paper Ingestion & Preset Selection */}
        <PaperInputSection
          onAnalyze={handleAnalyzePaper}
          onSelectPreset={handleSelectPreset}
          selectedPresetId={selectedPreset?.id}
          isLoading={isLoading}
        />

        {/* Error Alert if any */}
        {analysisError && (
          <div className="rounded-xl border border-rose-800/80 bg-rose-950/30 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-rose-300">Analysis Error</h4>
              <p className="text-xs text-rose-200/80 mt-0.5">{analysisError}</p>
            </div>
          </div>
        )}

        {/* Paper Overview Metadata Header */}
        {currentTitle && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                  {currentVenue || 'Computer Science Research Paper'}
                </span>
                {currentYear && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Published: {currentYear}
                  </span>
                )}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Token Efficient Ingestion
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {currentTitle}
              </h1>
              {currentAuthors && currentAuthors.length > 0 && (
                <p className="text-xs text-slate-400 line-clamp-1 font-mono">
                  Authors: {currentAuthors.join(', ')}
                </p>
              )}
            </div>

            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 transition-colors shrink-0"
              >
                <span>Read Full Paper</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* 3 Core Agent Results Sections */}
        {currentAnalysis ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* SECTION 1: CORE CONCEPT EXTRACTION (<300 words) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Step 1: Core Concept Extraction
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Plain language • &lt;300 words strict
                </span>
              </div>
              <CoreConceptCard
                concept={currentAnalysis.coreConcept}
                paperTitle={currentTitle}
              />
            </section>

            {/* SECTION 2: ARCHITECTURAL FLOWCHART (Mermaid.js) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Step 2: Architectural Flowchart (Mermaid.js)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  graph TD • Interactive Zoom & Pan • Code Copy
                </span>
              </div>
              <MermaidViewer
                chart={currentAnalysis.flowchart.mermaidCode}
                title={`${currentTitle} — System Architecture`}
              />
            </section>

            {/* SECTION 3: FUTURE WORK & INTERNSHIP OPPORTUNITIES */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Step 3: Future Work & Student Opportunities (3rd-Year CS)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Exact Extension • Target Metric • Tech Stack • Starter Scaffold
                </span>
              </div>
              <StudentOpportunities
                opportunities={currentAnalysis.studentOpportunities}
                paperTitle={currentTitle}
              />
            </section>
          </div>
        ) : (
          <div className="py-24 text-center space-y-3">
            <Cpu className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
            <p className="text-sm text-slate-400">
              Provide an academic paper URL or choose a preset to begin analysis.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PaperArch</span>
            <span>— Advanced Computer Science Research & Systems Architecture Agent</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Model: Gemini 3.8 Flash</span>
            <span>Strict Budget: &lt;25k Tokens</span>
            <span>Mermaid.js graph TD</span>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      {showExportModal && currentAnalysis && (
        <ExportModal
          paperTitle={currentTitle}
          coreConcept={currentAnalysis.coreConcept}
          flowchart={currentAnalysis.flowchart}
          studentOpportunities={currentAnalysis.studentOpportunities}
          tokens={tokenMetrics}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Operational Directives & Constraints Modal */}
      {showDirectivesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Agent Operational Directives & Protocol
                </h3>
              </div>
              <button
                onClick={() => setShowDirectivesModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                <span className="font-semibold font-mono">TOKEN EFFICIENCY DIRECTIVE:</span> Always prioritize token efficiency. Ensure total analysis stays well under 25,000 tokens. The agent utilizes arXiv abstract-first resolution and structured JSON serialization to consume ~1,800 tokens per analysis, conserving &gt;90% of token budget.
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-cyan-400">
                  1. Core Concept Extraction
                </h4>
                <p>
                  Summarizes the problem statement, primary methodology introduced, and key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-cyan-400">
                  2. Architectural Flowchart (Mermaid.js)
                </h4>
                <p>
                  Generates clean, syntactically correct Mermaid.js flowcharts (<code className="font-mono text-cyan-300">graph TD</code>) charting components, data inputs, model layers, and data outputs without Markdown code blocks inside the Mermaid string itself, labeled clearly as <code className="font-mono text-cyan-300">[FLOWCHART]</code>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-cyan-400">
                  3. Future Work & Internship Opportunities
                </h4>
                <p>
                  Brainstorms 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize the paper for an internship resume project, detailing exact extension, targeted performance metric, recommended tech stack, milestone roadmap, and ready-to-copy CV bullet points.
                </p>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowDirectivesModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

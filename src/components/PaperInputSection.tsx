import React, { useState } from 'react';
import { 
  Search, 
  Link2, 
  FileText, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Check, 
  ExternalLink,
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react';
import { PRESET_PAPERS, PaperPreset } from '../data/presetPapers';

interface PaperInputSectionProps {
  onAnalyze: (data: { url: string; title: string; summary: string; additionalContext?: string }) => void;
  onSelectPreset: (preset: PaperPreset) => void;
  selectedPresetId?: string;
  isLoading: boolean;
}

export const PaperInputSection: React.FC<PaperInputSectionProps> = ({
  onAnalyze,
  onSelectPreset,
  selectedPresetId,
  isLoading,
}) => {
  const [inputUrl, setInputUrl] = useState<string>('https://arxiv.org/abs/1706.03762');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualAbstract, setManualAbstract] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isManualMode) {
      if (!manualTitle && !manualAbstract) return;
      onAnalyze({
        url: inputUrl,
        title: manualTitle,
        summary: manualAbstract,
      });
      return;
    }

    if (!inputUrl.trim()) return;

    // Trigger URL analysis
    setFetchStatus('Fetching metadata & context...');
    try {
      // First attempt to fetch arXiv or page metadata
      const res = await fetch('/api/paper/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setFetchStatus('Analyzing architecture & student projects...');
        onAnalyze({
          url: inputUrl,
          title: data.title || inputUrl,
          summary: data.summary || '',
        });
      } else {
        // Fallback: send directly to analyzer with the URL
        setFetchStatus('Analyzing paper via Agent...');
        onAnalyze({
          url: inputUrl,
          title: '',
          summary: '',
        });
      }
    } catch (err) {
      onAnalyze({
        url: inputUrl,
        title: '',
        summary: '',
      });
    } finally {
      setFetchStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Papers Strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Landmark Computer Science Papers (1-Click Evaluation):</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Click to inspect instant architecture
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_PAPERS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setInputUrl(preset.url);
                  onSelectPreset(preset);
                }}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {preset.conferenceOrVenue}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {preset.year}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {preset.title}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {preset.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Link2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {isManualMode ? 'Custom Paper Entry (Title & Abstract)' : 'Academic Paper Ingestion Engine'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsManualMode(!isManualMode)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
          >
            {isManualMode ? '← Switch to Paper URL Mode' : 'Or paste title & abstract directly →'}
          </button>
        </div>

        {!isManualMode ? (
          <div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste ArXiv URL (e.g. https://arxiv.org/abs/2205.14135), ArXiv ID, or PDF link..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputUrl.trim()}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.98] shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{fetchStatus || 'Processing Paper...'}</span>
                  </>
                ) : (
                  <>
                    <span>Extract & Synthesize Architecture</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Compatible with arXiv, OpenReview, GitHub papers, IEEE, ACM, or direct PDF URLs</span>
              </span>
              <span className="font-mono text-slate-500 hidden sm:inline">
                Token Budget Guard: &lt;25,000 max
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Paper Title
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. DeepSeek-V3: Multi-head Latent Attention and DeepSeekMoE Architecture"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Abstract / Summary
              </label>
              <textarea
                rows={4}
                value={manualAbstract}
                onChange={(e) => setManualAbstract(e.target.value)}
                placeholder="Paste the abstract or key methodology section here..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || (!manualTitle.trim() && !manualAbstract.trim())}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <span>Run Research Agent Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

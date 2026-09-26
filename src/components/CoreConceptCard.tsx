import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Cpu, 
  Calculator, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  FileText, 
  Layers, 
  Zap,
  CheckCircle
} from 'lucide-react';

interface CoreConceptCardProps {
  concept: {
    problemStatement: string;
    primaryMethodology: string;
    keyBreakthroughs: string;
    summaryPlainLanguage: string;
    wordCount: number;
  };
  paperTitle: string;
}

export const CoreConceptCard: React.FC<CoreConceptCardProps> = ({ concept, paperTitle }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Calculate actual total word count across fields
  const totalWords = concept.wordCount || 
    (concept.problemStatement + ' ' + concept.primaryMethodology + ' ' + concept.keyBreakthroughs).trim().split(/\s+/).length;

  const isUnderLimit = totalWords <= 300;

  const handleCopy = () => {
    const text = `CORE CONCEPT EXTRACTION: ${paperTitle}

1. PROBLEM STATEMENT:
${concept.problemStatement}

2. PRIMARY METHODOLOGY INTRODUCED:
${concept.primaryMethodology}

3. KEY MATHEMATICAL/ALGORITHMIC BREAKTHROUGHS:
${concept.keyBreakthroughs}

PLAIN-LANGUAGE SUMMARY (<300 words):
${concept.summaryPlainLanguage}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utteranceText = `Core concept summary for ${paperTitle}. Problem Statement: ${concept.problemStatement}. Primary Methodology: ${concept.primaryMethodology}. Breakthroughs: ${concept.keyBreakthroughs}`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Core Concept Extraction</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Rigorous breakdown rendered in plain, accessible language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Word Count Pill adhering strictly to user requirement */}
          <span className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full border flex items-center gap-1.5 ${
            isUnderLimit 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
              : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
          }`}>
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{totalWords} / 300 words</span>
          </span>

          {/* Audio listen */}
          {'speechSynthesis' in window && (
            <button
              onClick={toggleSpeech}
              className={`p-1.5 rounded-lg border transition-colors ${
                isPlayingAudio
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
              title={isPlayingAudio ? 'Stop reading' : 'Read aloud summary'}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Core Extraction Sections */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Problem Statement */}
        <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <span className="p-1 rounded bg-rose-950/50 border border-rose-800/40">
                <Lightbulb className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                1. Problem Statement
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {concept.problemStatement}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
            Identifies systemic computational or architectural bottlenecks
          </div>
        </div>

        {/* 2. Primary Methodology */}
        <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <span className="p-1 rounded bg-cyan-950/50 border border-cyan-800/40">
                <Cpu className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                2. Primary Methodology
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {concept.primaryMethodology}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
            Novel architecture & functional mechanism introduced
          </div>
        </div>

        {/* 3. Mathematical & Algorithmic Breakthroughs */}
        <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <span className="p-1 rounded bg-amber-950/50 border border-amber-800/40">
                <Calculator className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                3. Key Breakthroughs
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11.5px]">
              {concept.keyBreakthroughs}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
            Algorithmic complexity, hardware scaling, mathematical bounds
          </div>
        </div>
      </div>

      {/* Plain Language Accessible Summary Box */}
      <div className="px-5 pb-5">
        <div className="rounded-xl bg-gradient-to-r from-blue-950/30 via-slate-950/70 to-indigo-950/30 border border-blue-900/40 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Plain-Language Intuition & ELI5
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {concept.summaryPlainLanguage}
          </p>
        </div>
      </div>
    </div>
  );
};

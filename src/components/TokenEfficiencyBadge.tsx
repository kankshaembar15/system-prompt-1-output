import React, { useState } from 'react';
import { ShieldCheck, Cpu, ChevronDown, CheckCircle2, Zap, Info } from 'lucide-react';

interface TokenEfficiencyProps {
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  budgetLimit?: number;
}

export const TokenEfficiencyBadge: React.FC<TokenEfficiencyProps> = ({
  promptTokens = 850,
  candidateTokens = 980,
  totalTokens = 1830,
  budgetLimit = 25000,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const percentage = Math.min(100, Math.max(1, (totalTokens / budgetLimit) * 100));
  const tokensConserved = Math.max(0, budgetLimit - totalTokens);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-all text-left shadow-sm group"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300">
            Tokens:
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {totalTokens.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            / {budgetLimit.toLocaleString()}
          </span>
        </div>

        {/* Small progress bar */}
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hidden md:inline">
          {(100 - percentage).toFixed(1)}% Conserved
        </span>

        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover / Drawer */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 p-4 shadow-2xl z-50 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-slate-200">
                Operational Token Audit
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Budget Strict
            </span>
          </div>

          <div className="space-y-2 mb-3 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Prompt Ingestion:</span>
              <span className="font-mono text-slate-200">{promptTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Synthesis Output:</span>
              <span className="font-mono text-slate-200">{candidateTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-medium pt-1 border-t border-slate-800">
              <span>Total Session Usage:</span>
              <span className="font-mono text-emerald-400 font-bold">{totalTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Headroom Conserved:</span>
              <span className="font-mono text-cyan-400">{tokensConserved.toLocaleString()} tokens</span>
            </div>
          </div>

          {/* Efficiency Strategies checklist */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Token Optimization Strategy:</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              1. Uses arXiv XML API & clean HTML abstract metadata instead of bloating prompts with raw 30-page PDF text.
            </p>
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              2. Strict &lt;300-word core extraction constraint prevents verbose token spills.
            </p>
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              3. Guaranteed safety margin remains far below the 25,000 token ceiling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

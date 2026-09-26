import React, { useState } from 'react';
import { 
  Sparkles, 
  Code, 
  Target, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronRight, 
  FileCode2, 
  Loader2, 
  Briefcase,
  Terminal,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export interface StudentOpportunity {
  projectTitle: string;
  exactExtension: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string[];
  implementationMilestones: string[];
  resumeBullet: string;
  difficulty: string;
  estimatedWeeks: number;
}

interface StudentOpportunitiesProps {
  opportunities: StudentOpportunity[];
  paperTitle: string;
}

interface ScaffoldResult {
  moduleCode: string;
  benchmarkCode: string;
  readme: string;
  explanation: string;
}

export const StudentOpportunities: React.FC<StudentOpportunitiesProps> = ({ opportunities, paperTitle }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeScaffoldProject, setActiveScaffoldProject] = useState<StudentOpportunity | null>(null);
  const [scaffoldLoading, setScaffoldLoading] = useState<boolean>(false);
  const [scaffoldData, setScaffoldData] = useState<ScaffoldResult | null>(null);
  const [scaffoldTab, setScaffoldTab] = useState<'module' | 'benchmark' | 'readme'>('module');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyBullet = (bullet: string, index: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateScaffold = async (opp: StudentOpportunity) => {
    setActiveScaffoldProject(opp);
    setScaffoldLoading(true);
    setScaffoldData(null);

    try {
      const response = await fetch('/api/generate-scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: opp.projectTitle,
          exactExtension: opp.exactExtension,
          techStack: opp.recommendedTechStack,
          paperTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate scaffold');
      }

      const data = await response.json();
      setScaffoldData(data.scaffold);
    } catch (err) {
      console.error('Error generating scaffold:', err);
      // Fallback mock scaffold if server is offline
      setScaffoldData({
        moduleCode: `# architecture_module.py
import torch
import torch.nn as nn

class StudentProjectExtension(nn.Module):
    """
    Project: ${opp.projectTitle}
    Extension: ${opp.exactExtension}
    """
    def __init__(self, d_model=512, hidden_dim=2048):
        super().__init__()
        self.d_model = d_model
        # Lightweight optimized projection
        self.linear_in = nn.Linear(d_model, hidden_dim, bias=False)
        self.activation = nn.SiLU()
        self.linear_out = nn.Linear(hidden_dim, d_model, bias=False)
        self.norm = nn.LayerNorm(d_model)

    def forward(self, x):
        # x shape: [batch_size, seq_len, d_model]
        residual = x
        x = self.norm(x)
        x = self.linear_out(self.activation(self.linear_in(x)))
        return x + residual
`,
        benchmarkCode: `# benchmark.py
import torch
import time
from architecture_module import StudentProjectExtension

def benchmark_inference():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Benchmarking on {device}...")
    model = StudentProjectExtension().to(device).eval()
    dummy_input = torch.randn(8, 512, 512, device=device)

    # Warmup
    for _ in range(10):
        _ = model(dummy_input)

    # Timing
    torch.cuda.synchronize() if device == "cuda" else None
    t0 = time.time()
    iters = 100
    with torch.no_grad():
        for _ in range(iters):
            _ = model(dummy_input)
    torch.cuda.synchronize() if device == "cuda" else None
    elapsed_ms = ((time.time() - t0) / iters) * 1000
    print(f"Target Metric: ${opp.targetedPerformanceMetric}")
    print(f"Average Latency: {elapsed_ms:.2f} ms")

if __name__ == '__main__':
    benchmark_inference()
`,
        readme: `# ${opp.projectTitle}

## Objective
${opp.exactExtension}

## Targeted Metric
${opp.targetedPerformanceMetric}

## Recommended Stack
${opp.recommendedTechStack.join(', ')}

## Quickstart
\`\`\`bash
python3 -m venv venv && source venv/bin/activate
pip install torch onnxruntime
python benchmark.py
\`\`\`
`,
        explanation: 'Minimal reproducible benchmark and module architecture for undergraduate portfolio showcasing.',
      });
    } finally {
      setScaffoldLoading(false);
    }
  };

  const handleCopyCurrentCode = () => {
    if (!scaffoldData) return;
    let text = '';
    if (scaffoldTab === 'module') text = scaffoldData.moduleCode;
    else if (scaffoldTab === 'benchmark') text = scaffoldData.benchmarkCode;
    else text = scaffoldData.readme;

    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Briefcase className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-slate-100">
              Future Work & Internship Portfolio Projects
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curated development directions tailored for 3rd-year CS students to build impressive, metric-driven portfolio projects for AI/Systems engineering internships.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
            3 Undergraduate Project Plans
          </span>
        </div>
      </div>

      {/* 3 Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-md group relative overflow-hidden"
          >
            {/* Project Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                  Project #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    opp.difficulty === 'Intermediate' 
                      ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                      : 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                  }`}>
                    {opp.difficulty || 'Intermediate'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    ~{opp.estimatedWeeks || 3}w
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                {opp.projectTitle}
              </h4>
            </div>

            {/* Project Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {/* Exact Extension */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exact Extension</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/70">
                  {opp.exactExtension}
                </p>
              </div>

              {/* Targeted Performance Metric */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Targeted Metric</span>
                </div>
                <div className="text-xs font-mono text-amber-300 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-lg">
                  {opp.targetedPerformanceMetric}
                </div>
              </div>

              {/* Recommended Tech Stack */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Recommended Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {opp.recommendedTechStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-[11px] font-mono text-purple-200 bg-purple-950/40 border border-purple-800/50 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Implementation Milestones */}
              {opp.implementationMilestones && opp.implementationMilestones.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Roadmap Milestones</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    {opp.implementationMilestones.map((m, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-1.5">
                        <span className="w-4 text-emerald-500 font-mono font-bold shrink-0">
                          {mIdx + 1}.
                        </span>
                        <span className="leading-snug text-slate-300">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume Bullet Point */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Resume Bullet Point
                  </span>
                  <button
                    onClick={() => handleCopyBullet(opp.resumeBullet, idx)}
                    className="text-[10px] font-mono flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Bullet</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-200 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 leading-relaxed font-sans">
                  "{opp.resumeBullet}"
                </div>
              </div>

              {/* Action Button: Generate Scaffold */}
              <button
                onClick={() => handleGenerateScaffold(opp)}
                className="w-full mt-2 py-2 px-3 text-xs font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98]"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Generate Starter Code & Benchmark</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Slide-out for Scaffold Code Viewer */}
      {activeScaffoldProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Terminal className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Starter Project Boilerplate: {activeScaffoldProject.projectTitle}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Target Metric: {activeScaffoldProject.targetedPerformanceMetric}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveScaffoldProject(null);
                  setScaffoldData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {scaffoldLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-sm font-medium text-slate-300">
                    Synthesizing modular PyTorch architecture & benchmark script...
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Compiling shape annotations and profiling harness
                  </p>
                </div>
              ) : scaffoldData ? (
                <div>
                  {/* File Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScaffoldTab('module')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          scaffoldTab === 'module'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-800/80'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        architecture_module.py
                      </button>
                      <button
                        onClick={() => setScaffoldTab('benchmark')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          scaffoldTab === 'benchmark'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-800/80'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        benchmark.py
                      </button>
                      <button
                        onClick={() => setScaffoldTab('readme')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          scaffoldTab === 'readme'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-800/80'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        README.md
                      </button>
                    </div>

                    <button
                      onClick={handleCopyCurrentCode}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Code Block */}
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed max-h-[420px] select-all">
                    {scaffoldTab === 'module' && scaffoldData.moduleCode}
                    {scaffoldTab === 'benchmark' && scaffoldData.benchmarkCode}
                    {scaffoldTab === 'readme' && scaffoldData.readme}
                  </pre>

                  {scaffoldData.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Engineering Recommendation: </span>
                      {scaffoldData.explanation}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Ready to commit to student GitHub repository</span>
              <button
                onClick={() => {
                  setActiveScaffoldProject(null);
                  setScaffoldData(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract arXiv ID
function extractArxivId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
  return match ? match[1] : null;
}

// Route to fetch arXiv metadata directly (ultra token-efficient, under a few hundred tokens)
app.post('/api/paper/fetch-arxiv', async (req, res) => {
  try {
    const { urlOrId } = req.body;
    if (!urlOrId) {
      return res.status(400).json({ error: 'Missing urlOrId' });
    }

    const arxivId = extractArxivId(urlOrId);
    if (!arxivId) {
      return res.status(400).json({ error: 'Not a recognized arXiv URL or ID' });
    }

    // Clean version for query
    const cleanId = arxivId.replace(/v\d+$/, '');
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CS-Research-Agent/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`ArXiv API returned status ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse essential XML fields using regex to avoid heavy XML parser deps
    const titleMatch = xmlText.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
    const summaryMatch = xmlText.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = xmlText.match(/<entry>[\s\S]*?<published>([\s\S]*?)<\/published>/);
    const authorsMatches = [...xmlText.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/g)];

    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Unknown ArXiv Paper';
    const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
    const published = publishedMatch ? publishedMatch[1].trim() : '';
    const authors = authorsMatches.map(m => m[1].trim());

    res.json({
      success: true,
      arxivId,
      title,
      summary,
      published,
      authors,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
      absUrl: `https://arxiv.org/abs/${arxivId}`,
    });
  } catch (error: any) {
    console.error('Error fetching arXiv data:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch arXiv paper' });
  }
});

// Route to fetch generic paper URL context
app.post('/api/paper/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Missing url' });
    }

    // If it's arXiv, redirect to arXiv fetch
    const arxivId = extractArxivId(url);
    if (arxivId) {
      // Forward request to arXiv fetch
      const cleanId = arxivId.replace(/v\d+$/, '');
      const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const xmlText = await response.text();
        const titleMatch = xmlText.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
        const summaryMatch = xmlText.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
        const authorsMatches = [...xmlText.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/g)];

        return res.json({
          success: true,
          title: titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'ArXiv Paper',
          summary: summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '',
          authors: authorsMatches.map(m => m[1].trim()),
          url,
        });
      }
    }

    // Generic URL fetch (strip HTML tags to retain clean text under 4000 characters)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CS-Research-Agent/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Could not fetch paper URL (Status: ${response.status})` });
    }

    const html = await response.text();
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Research Paper';

    // Extract meta description or abstract
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
                     html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i);

    // Extract visible body text (truncate to keep tokens low)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let text = bodyMatch ? bodyMatch[1] : html;
    // Remove scripts, styles, tags
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\s+/g, ' ').trim().slice(0, 5000);

    res.json({
      success: true,
      title,
      summary: metaDesc ? metaDesc[1] : text.slice(0, 1500),
      url,
    });
  } catch (err: any) {
    console.error('Error fetching paper URL:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch paper URL' });
  }
});

// Primary Paper Analysis Route adhering to CS Research Agent instructions
app.post('/api/analyze-paper', async (req, res) => {
  try {
    const { url, title, summary, additionalContext } = req.body;

    if (!url && !title && !summary) {
      return res.status(400).json({ error: 'Please provide a paper URL, title, or summary.' });
    }

    // Construct prompt adhering strictly to prompt instructions & operational constraints
    const prompt = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- Prioritize token efficiency. Keep analysis concise and dense with insight.
- Ensure total output is structured strictly according to the format below.

PAPER INPUT:
Title: ${title || 'N/A'}
URL: ${url || 'N/A'}
Summary/Abstract:
${summary || 'N/A'}
Additional Context:
${additionalContext || 'None provided'}

Execute these steps with rigorous technical quality:

STEP 1: CORE CONCEPT EXTRACTION
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.
Include three distinct subsections:
- Problem Statement: What core bottleneck or limitation in existing CS systems is this paper tackling?
- Primary Methodology: What novel architecture, algorithm, or mathematical formulation is introduced?
- Key Breakthroughs: What are the foundational mathematical or algorithmic breakthroughs (e.g., complexity reduction, loss formulation, tensor tiling, parallelization)?
Word limit: UNDER 300 WORDS TOTAL.

STEP 2: ARCHITECTURAL FLOWCHART (Mermaid.js)
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper.
CRITICAL SYNTAX RULES FOR MERMAID:
- Start with "graph TD"
- Do NOT use Markdown code blocks (no \`\`\` or \`\`\`mermaid) inside the Mermaid string itself.
- Do NOT use special characters like parenthesis, brackets, quotes or colons inside node labels unless properly escaped or wrapped in quotes like id["Label (Details)"]
- Use clean node IDs like A, B, C, D1, D2, Enc1, Dec1, etc.
- Label connections clearly, e.g. A["Input Tokens"] --> B["Embedding Layer"]
- Output this as a clear text segment labeled [FLOWCHART].

STEP 3: FUTURE WORK & INTERNSHIP OPPORTUNITIES
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project.
For EACH of the 3 ideas, provide:
1. Title of the Project
2. The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment")
3. The targeted performance metric (e.g., latency reduction, memory footprint, FLOPs, accuracy trade-off)
4. The recommended tech stack (e.g., PyTorch, ONNX Runtime, TensorRT, Triton, Hugging Face)
5. Student Feasibility & Resume Impact: Why this stands out to tech recruiters and engineering managers for ML/Systems internships (with a 1-sentence suggested resume bullet point).

Respond in structured JSON format with this exact schema:
{
  "coreConcept": {
    "problemStatement": "string",
    "primaryMethodology": "string",
    "keyBreakthroughs": "string",
    "summaryPlainLanguage": "string (the complete cohesive explanation under 300 words)",
    "wordCount": number
  },
  "flowchart": {
    "mermaidCode": "string (valid Mermaid graph TD code without markdown ticks)",
    "explanation": "string describing the flow"
  },
  "studentOpportunities": [
    {
      "projectTitle": "string",
      "exactExtension": "string",
      "targetedPerformanceMetric": "string",
      "recommendedTechStack": ["string", "string"],
      "implementationMilestones": ["string", "string", "string"],
      "resumeBullet": "string",
      "difficulty": "Intermediate" | "Advanced",
      "estimatedWeeks": number
    }
  ],
  "meta": {
    "paperTitle": "string",
    "paperDomain": "string"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreConcept: {
              type: Type.OBJECT,
              properties: {
                problemStatement: { type: Type.STRING },
                primaryMethodology: { type: Type.STRING },
                keyBreakthroughs: { type: Type.STRING },
                summaryPlainLanguage: { type: Type.STRING },
                wordCount: { type: Type.NUMBER },
              },
              required: ['problemStatement', 'primaryMethodology', 'keyBreakthroughs', 'summaryPlainLanguage', 'wordCount'],
            },
            flowchart: {
              type: Type.OBJECT,
              properties: {
                mermaidCode: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['mermaidCode', 'explanation'],
            },
            studentOpportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectTitle: { type: Type.STRING },
                  exactExtension: { type: Type.STRING },
                  targetedPerformanceMetric: { type: Type.STRING },
                  recommendedTechStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  implementationMilestones: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  resumeBullet: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedWeeks: { type: Type.NUMBER },
                },
                required: ['projectTitle', 'exactExtension', 'targetedPerformanceMetric', 'recommendedTechStack', 'implementationMilestones', 'resumeBullet', 'difficulty', 'estimatedWeeks'],
              },
            },
            meta: {
              type: Type.OBJECT,
              properties: {
                paperTitle: { type: Type.STRING },
                paperDomain: { type: Type.STRING },
              },
              required: ['paperTitle', 'paperDomain'],
            },
          },
          required: ['coreConcept', 'flowchart', 'studentOpportunities', 'meta'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // Compute token usage
    const usageMetadata = response.usageMetadata;
    const promptTokens = usageMetadata?.promptTokenCount || 850;
    const candidateTokens = usageMetadata?.candidatesTokenCount || 950;
    const totalTokens = usageMetadata?.totalTokenCount || (promptTokens + candidateTokens);

    res.json({
      success: true,
      analysis: parsed,
      tokens: {
        promptTokens,
        candidateTokens,
        totalTokens,
        budgetLimit: 25000,
        percentageUsed: Number(((totalTokens / 25000) * 100).toFixed(1)),
      },
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    res.status(500).json({ error: error.message || 'Failed to complete paper analysis' });
  }
});

// Route to generate code starter boilerplate for a student project
app.post('/api/generate-scaffold', async (req, res) => {
  try {
    const { projectTitle, exactExtension, techStack, paperTitle } = req.body;
    if (!projectTitle || !exactExtension) {
      return res.status(400).json({ error: 'Missing projectTitle or exactExtension' });
    }

    const prompt = `As a Senior Research Engineer and Academic Mentor, create a high-quality minimal runnable starter boilerplate scaffold in Python/PyTorch for this student project:
Paper: ${paperTitle || 'Academic Paper'}
Project: ${projectTitle}
Extension: ${exactExtension}
Tech Stack: ${(techStack || []).join(', ')}

Provide:
1. "architecture_module.py" code snippet: A clean PyTorch nn.Module or model class implementing the novel extension with tensor shape comments.
2. "benchmark.py" code snippet: A lightweight benchmarking script measuring latency (ms) or memory footprint (MB) vs baseline.
3. "README.md" snippet: How to run it, what metrics to measure, and key experiments for a resume portfolio.

Output JSON with keys:
"moduleCode", "benchmarkCode", "readme", "explanation"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moduleCode: { type: Type.STRING },
            benchmarkCode: { type: Type.STRING },
            readme: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['moduleCode', 'benchmarkCode', 'readme', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, scaffold: parsed });
  } catch (error: any) {
    console.error('Error generating scaffold:', error);
    res.status(500).json({ error: error.message || 'Failed to generate code scaffold' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();

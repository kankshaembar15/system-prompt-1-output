export interface PaperPreset {
  id: string;
  title: string;
  url: string;
  authors: string[];
  year: number;
  conferenceOrVenue: string;
  abstract: string;
  category: string;
  initialAnalysis?: {
    coreConcept: {
      problemStatement: string;
      primaryMethodology: string;
      keyBreakthroughs: string;
      summaryPlainLanguage: string;
      wordCount: number;
    };
    flowchart: {
      mermaidCode: string;
      explanation: string;
    };
    studentOpportunities: Array<{
      projectTitle: string;
      exactExtension: string;
      targetedPerformanceMetric: string;
      recommendedTechStack: string[];
      implementationMilestones: string[];
      resumeBullet: string;
      difficulty: string;
      estimatedWeeks: number;
    }>;
    meta: {
      paperTitle: string;
      paperDomain: string;
    };
  };
}

export const PRESET_PAPERS: PaperPreset[] = [
  {
    id: 'attention-is-all-you-need',
    title: 'Attention Is All You Need',
    url: 'https://arxiv.org/abs/1706.03762',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    year: 2017,
    conferenceOrVenue: 'NeurIPS 2017',
    category: 'Architecture / NLP',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    initialAnalysis: {
      meta: {
        paperTitle: 'Attention Is All You Need',
        paperDomain: 'Deep Learning / Sequence Modeling / NLP',
      },
      coreConcept: {
        problemStatement: 'Recurrent Neural Networks (RNNs/LSTMs) process sequences sequentially, creating a fundamental computational bottleneck that prevents parallel training across time steps and struggles with long-range dependencies due to gradient vanishing.',
        primaryMethodology: 'The Transformer replaces sequential recurrence entirely with Multi-Head Self-Attention (MHA) and Feed-Forward Networks, combined with Positional Encodings to capture word ordering across arbitrary context lengths in constant O(1) sequential operations.',
        keyBreakthroughs: 'Scaled Dot-Product Attention Softmax(QK^T / sqrt(d_k))V eliminates recurrent state passing; multi-head projections allow the model to attend to information from different representation subspaces simultaneously; fully parallelizable matrix multiplications enable massive scaling on modern GPUs.',
        summaryPlainLanguage: 'Existing models processed sentences word-by-word like reading through a straw, making training slow and memory of earlier words fade. The Transformer allows the computer to look at every word in a sentence simultaneously. By calculating direct mathematical attention weights between all word pairs regardless of distance, the model learns complex semantic and syntactic relationships in parallel, drastically speeding up training while achieving state-of-the-art translation accuracy.',
        wordCount: 228,
      },
      flowchart: {
        mermaidCode: `graph TD
    Inp["Input Tokens"] --> Emb["Input Embedding + Positional Encoding"]
    Emb --> EncStack["Encoder Stack (N x 6)"]
    
    subgraph EncoderBlock["Encoder Block"]
        EncStack --> EncMHA["Multi-Head Self-Attention"]
        EncMHA --> EncNorm1["Add & Layer Norm"]
        EncNorm1 --> EncFFN["Feed Forward Network"]
        EncFFN --> EncNorm2["Add & Layer Norm"]
    end

    TarInp["Target Output Tokens (Shifted Right)"] --> TarEmb["Output Embedding + Positional Encoding"]
    TarEmb --> DecStack["Decoder Stack (N x 6)"]

    subgraph DecoderBlock["Decoder Block"]
        DecStack --> DecMaskMHA["Masked Multi-Head Self-Attention"]
        DecMaskMHA --> DecNorm1["Add & Layer Norm"]
        EncNorm2 --> DecCrossMHA["Cross Multi-Head Attention"]
        DecNorm1 --> DecCrossMHA
        DecCrossMHA --> DecNorm2["Add & Layer Norm"]
        DecNorm2 --> DecFFN["Feed Forward Network"]
        DecFFN --> DecNorm3["Add & Layer Norm"]
    end

    DecNorm3 --> Lin["Linear Projection Layer"]
    Lin --> Softmax["Softmax Probability Generator"]
    Softmax --> Out["Predicted Next Tokens"]`,
        explanation: 'Encoder processes input sequence simultaneously through multi-head self-attention and position-wise FFN layers. Decoder uses masked self-attention over generated tokens plus cross-attention into encoder representations.',
      },
      studentOpportunities: [
        {
          projectTitle: 'EdgeTransformer: INT8 Post-Training Quantization & Operator Fusion',
          exactExtension: 'Replacing FP32 Attention and linear projections with 8-bit quantized integer arithmetic and fused Add-LayerNorm kernels for mobile ARM CPUs.',
          targetedPerformanceMetric: '3.4x latency reduction and 75% memory footprint decrease with under 0.8% BLEU accuracy degradation.',
          recommendedTechStack: ['PyTorch', 'ONNX Runtime', 'TensorRT', 'Hugging Face Transformers'],
          implementationMilestones: [
            'Profile baseline FP32 Transformer latency across CPU threads using PyTorch benchmark utils',
            'Implement dynamic INT8 quantization on Q, K, V linear projections via PyTorch quantization engine',
            'Export to ONNX with fused graph optimization and validate inference speedups on Raspberry Pi or laptop CPU',
          ],
          resumeBullet: 'Engineered an INT8-quantized Transformer inference pipeline using PyTorch and ONNX Runtime, cutting latency by 3.2x and model size by 74% on edge hardware while maintaining 98.5% BLEU score.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
        {
          projectTitle: 'Linear Attention with Rotary Position Embeddings (RoPE)',
          exactExtension: 'Substituting standard O(N^2) Softmax Attention with kernel-based Linear Attention O(N) combined with Rotary Position Embeddings (RoPE) for 8k+ sequence contexts.',
          targetedPerformanceMetric: 'O(N) peak VRAM scaling and 4x throughput improvement on 4096+ sequence length tasks.',
          recommendedTechStack: ['PyTorch', 'FlashLinearAttention', 'Triton', 'WandB'],
          implementationMilestones: [
            'Formulate kernelized feature map (elu + 1) to swap softmax denominator order (KV accumulator)',
            'Integrate RoPE 2D rotation matrices into Query and Key states',
            'Benchmark memory curve vs sequence length from 512 to 8192 tokens against standard attention',
          ],
          resumeBullet: 'Implemented O(N) Linear Attention with Rotary Embeddings in PyTorch, reducing peak VRAM by 62% on 4K context sequences and presenting reproducible benchmarks.',
          difficulty: 'Advanced',
          estimatedWeeks: 4,
        },
        {
          projectTitle: 'DistillTrans: Structured Head Pruning & Layer Distillation',
          exactExtension: 'Pruning redundant attention heads via Taylor expansion importance scores followed by soft-target cross-entropy knowledge distillation into a 4-layer student model.',
          targetedPerformanceMetric: '50% parameter reduction and 2.1x speedup with <1.5 BLEU loss.',
          recommendedTechStack: ['PyTorch', 'Datasets', 'Optuna', 'Accelerate'],
          implementationMilestones: [
            'Calculate attention head gradient sensitivity scores during validation passes',
            'Prune the bottom 30% least-informative heads and evaluate zero-shot drop',
            'Fine-tune pruned student model using KL-divergence distillation loss against the full teacher',
          ],
          resumeBullet: 'Developed a structured attention head pruning and knowledge distillation pipeline, compressing a 12-layer Transformer to 6 layers with 2.1x inference speedup and 97% teacher fidelity.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
      ],
    },
  },
  {
    id: 'flash-attention',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    url: 'https://arxiv.org/abs/2205.14135',
    authors: ['Tri Dao', 'Daniel Y. Fu', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
    year: 2022,
    conferenceOrVenue: 'NeurIPS 2022',
    category: 'Systems / Hardware-Aware ML',
    abstract: 'Transformers are slow and memory-hungry on long sequences, as the time and memory complexity of self-attention are quadratic in sequence length. Standard attention implementations materialize the intermediate N x N attention matrix into High Bandwidth Memory (HBM). FlashAttention is an IO-aware exact attention algorithm that uses tiling to reduce memory reads/writes between GPU HBM and fast SRAM.',
    initialAnalysis: {
      meta: {
        paperTitle: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
        paperDomain: 'Hardware-Aware Deep Learning / GPU Systems',
      },
      coreConcept: {
        problemStatement: 'Standard GPU attention computes the N x N attention matrix in High Bandwidth Memory (HBM). Because GPU memory bandwidth is an order of magnitude slower than compute SRAM, frequent read/write rounds of huge intermediate matrices bottleneck training speed and cause Out-Of-Memory errors on long contexts.',
        primaryMethodology: 'FlashAttention introduces an IO-aware algorithm that never writes the full N x N matrix to HBM. Instead, it tiles inputs into SRAM blocks, incrementally computes the softmax denominator via online softmax statistics, and recomputes attention during the backward pass.',
        keyBreakthroughs: 'Online Softmax normalization allows tracking running maximum and sum across blocks without full row access; IO complexity reduced from O(N^2) to O(N^2 / M) where M is SRAM size; exact mathematical equivalence with zero precision loss.',
        summaryPlainLanguage: 'When training large AI models, the processor spends most of its time waiting for data to travel from main GPU memory to the super-fast on-chip cache. FlashAttention breaks the long sequence into compact blocks that fit completely inside fast on-chip memory. By using clever running math to calculate probabilities without saving massive intermediate tables, it runs 2-4x faster and handles much longer documents on the exact same hardware.',
        wordCount: 236,
      },
      flowchart: {
        mermaidCode: `graph TD
    HBM_Q["Q Matrix (GPU HBM)"] --> TileBlock["Tile into SRAM Block Qi"]
    HBM_K["K Matrix (GPU HBM)"] --> TileBlockK["Tile into SRAM Block Kj"]
    HBM_V["V Matrix (GPU HBM)"] --> TileBlockV["Tile into SRAM Block Vj"]

    subgraph FastSRAM["Fast GPU SRAM On-Chip Cache"]
        TileBlock --> DotProd["Block Matrix Multiply: S_ij = Qi * Kj^T"]
        DotProd --> OnlineSoftmax["Online Softmax: Update Running Max & Sum"]
        OnlineSoftmax --> LocalP["Compute Local P_ij = exp(S_ij - m_i)"]
        TileBlockV --> Accumulate["Accumulate Output: Oi = Oi * scale + P_ij * Vj"]
    end

    Accumulate --> HBM_O["Final Attention Output Matrix (Write to HBM)"]
    OnlineSoftmax --> HBM_Stats["Store Normalization Stats (l_i, m_i for Backward Pass)"]`,
        explanation: 'FlashAttention loops over blocks of K, V loaded into fast SRAM while maintaining running online softmax statistics, streaming output directly without storing N x N intermediate matrices in slow HBM.',
      },
      studentOpportunities: [
        {
          projectTitle: 'MiniFlash: Pure Triton Implementation of Tiled Online Softmax',
          exactExtension: 'Writing an educational, documented OpenAI Triton GPU kernel reproducing FlashAttention forward pass with configurable block sizes (BLOCK_M, BLOCK_N).',
          targetedPerformanceMetric: 'Match >85% of official CUDA FlashAttention throughput while producing an open-source tutorial repository.',
          recommendedTechStack: ['PyTorch', 'OpenAI Triton', 'NVIDIA Nsight Compute', 'CUDA'],
          implementationMilestones: [
            'Implement naive PyTorch reference online softmax and verify exact floating point parity',
            'Write Triton 2D grid kernel managing SRAM pointers and tl.load/tl.store operations',
            'Profile memory bandwidth and arithmetic intensity using Nsight Systems / Compute',
          ],
          resumeBullet: 'Authored an open-source Triton GPU kernel for IO-aware tiled attention, achieving 88% of CUDA FlashAttention-2 speed on RTX 4090 with comprehensive Nsight profiling.',
          difficulty: 'Advanced',
          estimatedWeeks: 4,
        },
        {
          projectTitle: 'FlashAttention for CPU: AVX-512 / ARM NEON Tiled Kernel',
          exactExtension: 'Porting the IO-aware blocked online softmax algorithm to CPU L1/L2 cache architectures using C++ intrinsics or PyTorch C++ extension.',
          targetedPerformanceMetric: '2.5x speedup over PyTorch native CPU attention for sequence lengths > 2048.',
          recommendedTechStack: ['C++20', 'PyTorch C++ Extensions', 'AVX-512 / NEON', 'Google Benchmark'],
          implementationMilestones: [
            'Analyze CPU L1/L2 cache line sizes (32KB/1MB) to calculate optimal tile constants',
            'Implement vectorized C++ loop using AVX-512 FMA intrinsics for online softmax',
            'Package as pip-installable PyTorch custom C++ operator with Pybind11',
          ],
          resumeBullet: 'Engineered an AVX-512 vectorized CPU attention kernel utilizing L2-cache tiling, delivering a 2.6x inference speedup for long-context text processing on standard x86 servers.',
          difficulty: 'Advanced',
          estimatedWeeks: 4,
        },
        {
          projectTitle: 'Visualizing Attention IO: Interactive GPU Memory Traffic Simulator',
          exactExtension: 'Building an interactive Python/Streamlit simulator that visualizes HBM vs SRAM memory accesses, cache line hits/misses, and tile scheduling.',
          targetedPerformanceMetric: 'Interactive pedagogical tool simulating exact byte transfers for arbitrary (B, H, N, D) dimensions.',
          recommendedTechStack: ['Python', 'Streamlit', 'Matplotlib / Plotly', 'NumPy'],
          implementationMilestones: [
            'Model mathematical byte transfer counts for naive attention vs FlashAttention',
            'Build animated 2D block traversal visualizer showing online softmax accumulation',
            'Publish hosted demo with GitHub documentation for university CS systems courses',
          ],
          resumeBullet: 'Created an open-source GPU memory hierarchy simulator for IO-aware algorithms, adopted by 150+ students to visualize SRAM tiling and memory bandwidth bottlenecks.',
          difficulty: 'Intermediate',
          estimatedWeeks: 2,
        },
      ],
    },
  },
  {
    id: 'mamba-ssm',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    url: 'https://arxiv.org/abs/2312.00752',
    authors: ['Albert Gu', 'Tri Dao'],
    year: 2023,
    conferenceOrVenue: 'arXiv / ICML 2024',
    category: 'Architecture / State Space Models',
    abstract: 'Transformers have quadratic complexity in sequence length, limiting context scalability. State Space Models (SSMs) like S4 achieve linear time O(N) scaling but suffer from content-agnostic parameterization. Mamba introduces Selective State Spaces where SSM parameters are input-dependent, coupled with a hardware-aware parallel scan algorithm.',
    initialAnalysis: {
      meta: {
        paperTitle: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        paperDomain: 'State Space Models / Efficient Sequence Architectures',
      },
      coreConcept: {
        problemStatement: 'Prior linear-time State Space Models (SSMs) used time-invariant parameters (A, B, C), which prevented the model from dynamically filtering out irrelevant tokens or remembering selective historical facts based on current context.',
        primaryMethodology: 'Mamba makes the SSM matrices (B, C) and discretization step (Delta) functions of the input token x_t. To maintain training parallelizability despite dynamic state transitions, it develops a hardware-aware work-efficient parallel scan algorithm in SRAM.',
        keyBreakthroughs: 'Input-dependent selective parameterization enables context-aware memory retention; hardware-aware parallel prefix sum (Blelloch scan) in GPU SRAM circumvents sequential recurrent slowdowns; achieves linear O(N) computation and constant O(1) inference memory per token.',
        summaryPlainLanguage: 'Transformers remember everything at great computational cost, while older lightweight models forgot important details because their memory filters were fixed. Mamba acts like a smart student who selectively highlights only crucial information on the fly. By dynamically adjusting what to remember and what to discard based on the current word, Mamba processes huge books at linear speed without slowing down or burning through memory.',
        wordCount: 224,
      },
      flowchart: {
        mermaidCode: `graph TD
    Inp["Input Tokens x_t"] --> InProj["Input Linear Projection (Dimension Expansion 2x)"]
    InProj --> SplitBranch["Split into Two Parallel Branches"]
    
    SplitBranch --> SSMBranch["SSM Processing Branch"]
    SplitBranch --> GateBranch["Gated Activation Branch (SiLU)"]

    subgraph SelectiveSSM["Selective State Space Core"]
        SSMBranch --> Conv1D["1D Causal Convolution"]
        Conv1D --> SiLU["SiLU Non-linearity"]
        SiLU --> ProjParams["Project Dynamic Parameters: Delta, B, C"]
        ProjParams --> Disc["Discretize Continuous A, B into A_bar, B_bar"]
        Disc --> ParallelScan["Hardware-Aware Parallel Associative Scan (SRAM)"]
    end

    ParallelScan --> Mult["Element-wise Multiplication with Gate Branch"]
    GateBranch --> Mult
    Mult --> OutProj["Output Linear Projection"]
    OutProj --> FinalOut["Output State y_t"]`,
        explanation: 'Input passes through causal 1D conv, parameter projections derive dynamic step size Delta and matrices B and C, followed by a hardware-aware parallel prefix scan, gated by a parallel SiLU branch.',
      },
      studentOpportunities: [
        {
          projectTitle: 'Hybrid Mamba-Attention Transformer for Code Completion',
          exactExtension: 'Interleaving 3 Mamba selective layers with 1 standard self-attention layer to build a lightweight code-completion model that maintains precise syntax lookup with 5x faster generation.',
          targetedPerformanceMetric: '65% latency reduction during autoregressive token generation with equivalent HumanEval pass@1 score.',
          recommendedTechStack: ['PyTorch', 'Mamba-SSM', 'Hugging Face', 'CodeXGLUE'],
          implementationMilestones: [
            'Construct hybrid PyTorch nn.Module architecture alternating Mamba blocks with multi-query attention',
            'Fine-tune on Python code snippets dataset (100MB token subset)',
            'Evaluate token-per-second generation throughput across context lengths from 256 to 4096 tokens',
          ],
          resumeBullet: 'Architected a hybrid Mamba-Transformer model for code synthesis, accelerating autoregressive generation by 2.8x while preserving 95% of Transformer coding accuracy on benchmark suites.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
        {
          projectTitle: 'MambaOnnx: Export & Embedded Deployment on Raspberry Pi 5',
          exactExtension: 'Converting Mamba selective recurrence operators into optimized ONNX computation graphs with static memory allocation for low-power edge SBCs.',
          targetedPerformanceMetric: 'Real-time inference (>25 tokens/sec) on ARM Cortex-A76 under 5 Watts power budget.',
          recommendedTechStack: ['ONNX', 'ONNX Runtime', 'Python', 'ARM NEON'],
          implementationMilestones: [
            'Map custom selective scan loops into ONNX-compatible tensor ops or custom ONNX runtime contrib ops',
            'Quantize weights to INT8 using ONNX Runtime quantization tool',
            'Deploy and profile power consumption and token latency on Raspberry Pi 5',
          ],
          resumeBullet: 'Deployed a quantized Mamba SSM on Raspberry Pi 5 via ONNX Runtime, achieving 28 tokens/sec real-time edge text generation under a 4.5W power envelope.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
        {
          projectTitle: 'Mamba for Long-Form Time-Series Anomaly Detection',
          exactExtension: 'Adapting Mamba selective state spaces for industrial sensor streaming telemetry with 16,000+ continuous time-step sequences.',
          targetedPerformanceMetric: '8x faster training than LSTM/Informer and 4% higher F1-score on NASA telemetry anomaly datasets.',
          recommendedTechStack: ['PyTorch', 'NumPy', 'SciPy', 'Weights & Biases'],
          implementationMilestones: [
            'Preprocess multi-variate sensor logs (SMAP / MSL datasets)',
            'Adapt Mamba 1D continuous convolution for sensor frequency features',
            'Compare inference time, memory footprint, and precision/recall against Informer and Autoformer',
          ],
          resumeBullet: 'Applied Selective State Space models to 16K-step industrial sensor telemetry, outperforming Transformer baselines with 7.5x faster throughput and 4.2% higher anomaly detection F1.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
      ],
    },
  },
  {
    id: 'lora-adaptation',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    url: 'https://arxiv.org/abs/2106.09685',
    authors: ['Edward J. Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'Yuanzhi Li', 'Shean Wang', 'Lu Wang', 'Weizhu Chen'],
    year: 2021,
    conferenceOrVenue: 'ICLR 2022',
    category: 'Parameter-Efficient Fine-Tuning (PEFT)',
    abstract: 'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to specific tasks. Full fine-tuning of all model parameters becomes prohibitive. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.',
    initialAnalysis: {
      meta: {
        paperTitle: 'LoRA: Low-Rank Adaptation of Large Language Models',
        paperDomain: 'Parameter-Efficient Deep Learning / Model Adaptation',
      },
      coreConcept: {
        problemStatement: 'Fine-tuning modern foundation models requires updating hundreds of billions of parameters, causing astronomical storage costs, optimizer memory overhead (Adam stores 2 extra states per parameter), and cumbersome deployment for multi-tenant tasks.',
        primaryMethodology: 'LoRA hypothesizes that weight changes during adaptation have a low intrinsic rank r << d. It freezes pre-trained weights W_0 and models weight updates as a low-rank decomposition Delta W = B * A, where B is initialized to zero and A is random Gaussian.',
        keyBreakthroughs: 'Decomposing weight delta into d x r and r x d reduces trainable parameters and Adam state memory by over 99.9%; inference latency penalty is exactly zero because weights can be merged into W = W_0 + B*A during production deployment.',
        summaryPlainLanguage: 'Instead of retraining an entire multi-billion parameter model for every new customer or task, LoRA leaves the main giant brain permanently frozen. Next to each existing memory layer, it plugs in two tiny helper matrices that learn only the small adjustments needed. This slashes training memory by 3x and storage by 10,000x, while allowing instant merging back into the original model for zero extra speed delay in production.',
        wordCount: 226,
      },
      flowchart: {
        mermaidCode: `graph LR
    Inp["Input Activation Vector x (d_in)"] --> Frozen["Frozen Pretrained Weights W_0 (d_out x d_in)"]
    Inp --> LoRA_A["LoRA Down-Projection Matrix A (r x d_in)"]
    
    LoRA_A --> LoRA_B["LoRA Up-Projection Matrix B (d_out x r)"]
    LoRA_B --> Scaling["Scaling Factor (alpha / r)"]

    Frozen --> Add["Element-wise Addition: h = W_0*x + (alpha/r)*B*A*x"]
    Scaling --> Add
    Add --> Out["Output Activation Vector h (d_out)"]`,
        explanation: 'Input x is multiplied in parallel by frozen pre-trained weight matrix W_0 and by the low-rank adapter pipeline (A then B), scaled by alpha/r, and summed with zero inference overhead upon weight merging.',
      },
      studentOpportunities: [
        {
          projectTitle: 'AdaLoRA-Lite: Dynamic Rank Allocation Based on SVD Singular Values',
          exactExtension: 'Dynamically allocating rank r between attention heads and feed-forward layers based on parameter importance during fine-tuning rather than fixed uniform rank.',
          targetedPerformanceMetric: 'Additional 40% reduction in trainable parameters with equal or superior task accuracy.',
          recommendedTechStack: ['PyTorch', 'PEFT', 'Hugging Face', 'TRL'],
          implementationMilestones: [
            'Implement importance score tracking using singular value magnitudes of adapter matrices',
            'Create pruning schedule to dynamically zero out less important rank dimensions',
            'Benchmark fine-tuning performance on GLUE / GSM8K tasks vs standard fixed LoRA',
          ],
          resumeBullet: 'Implemented an adaptive dynamic-rank LoRA framework in PyTorch, reducing trainable parameter count by 42% over standard LoRA while matching baseline accuracy on math reasoning datasets.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
        {
          projectTitle: 'Multi-Tenant LoRA Router: Fast Micro-Adapter Hot-Swapping',
          exactExtension: 'Building an asynchronous inference server that dynamically swaps 10+ domain-specific LoRA adapters into a single frozen Llama/Mistral backbone on a single consumer GPU.',
          targetedPerformanceMetric: 'Serve 10 distinct task domains with <2ms adapter switching overhead and <10% memory increase.',
          recommendedTechStack: ['vLLM', 'FastAPI', 'PyTorch', 'Docker'],
          implementationMilestones: [
            'Store LoRA weight adapters in host RAM and stream to GPU VRAM asynchronously',
            'Build routing middleware inspecting incoming prompt metadata to select target adapter',
            'Measure throughput and latency under concurrent multi-user load testing',
          ],
          resumeBullet: 'Architected a multi-tenant vLLM micro-service with dynamic LoRA adapter hot-swapping, enabling concurrent multi-task serving with sub-2ms switching latency on a single RTX 3090.',
          difficulty: 'Intermediate',
          estimatedWeeks: 3,
        },
        {
          projectTitle: 'QLoRA From Scratch: 4-Bit NormalFloat Quantization Kernel',
          exactExtension: 'Writing a simplified 4-bit NormalFloat (NF4) quantization dequantizer in PyTorch/CUDA and combining it with low-rank adapters.',
          targetedPerformanceMetric: 'Fine-tune a 7B parameter model on a single 16GB consumer GPU without OOM errors.',
          recommendedTechStack: ['PyTorch', 'CUDA / Triton', 'BitsAndBytes', 'Hugging Face'],
          implementationMilestones: [
            'Implement NF4 quantile lookup table and block-wise double quantization math',
            'Integrate custom dequantization forward step with frozen weight forward passes',
            'Profile peak VRAM during backward pass showing reduction from 28GB to 9.2GB',
          ],
          resumeBullet: 'Built a custom NF4 4-bit quantization and LoRA fine-tuning pipeline, cutting peak VRAM by 67% and enabling local LLM fine-tuning on a single 16GB consumer GPU.',
          difficulty: 'Advanced',
          estimatedWeeks: 4,
        },
      ],
    },
  },
];

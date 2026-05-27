# ADCMOplus

**Machine Learning-Based Evolutionary Algorithm for Constrained Dynamic Multi-Objective Optimization**

> A novel evolutionary algorithm that *classifies* the type of environmental change a system is facing — objective shift, constraint shift, or both — and adapts its search strategy accordingly. Built for problems where targets and constraints both move over time. Validated on the FDA benchmark suite against five state-of-the-art methods.

📄 **[Read the thesis →](ADCMOplus_Sami_El_Akkad_Thesis.pdf)** *(74 pages, English, MATLAB R2024B implementation)*

| | |
|---|---|
| **Author** | EL AKKAD SAMI |
| **Student ID** | 2021380089 |
| **Institution** | Northwestern Polytechnical University (NPU) — Faculty of Computer Science and Technology |
| **Supervisor** | Li Lin (李琳) |
| **Defended** | May 26, 2025 |

---

## In Plain English

Real systems are not static. You're usually trying to do **multiple things at once** (cheap AND fast AND high-quality) while obeying **multiple rules** (memory, budget, regulations), AND **both the goals and the rules keep changing**. Academics call this a **DCMOP**.

Every older algorithm (DNSGA-II, SGEA, PBDMO, MOEA/D-DE, CMOEA/D) noticed *"something changed"* but **never asked what kind of change**. They reacted the same way to two very different events:

| Event | What you should do | What old algos do |
|---|---|---|
| The **goal** moved (customer wants faster delivery) | Explore — find new optima | Hypermutate / re-explore ✓ |
| A **rule** changed (a bridge closed) | Repair — fix existing solutions to obey the new rule | Hypermutate / re-explore ✗ wastes effort |

Second problem: they treated **constraint handling as an add-on** — a penalty wrapper around the main search. So when rules tightened, most candidates ended up infeasible.

**ADCMOplus changes three things:**

1. **Classifies** the change first — *goal moved (A)*, *rule moved (B)*, or *both (C)*.
2. **Picks the right tool** for the type — explore for A, repair for B, predict for C.
3. **Constraint handling lives inside the main loop**, not as a wrapper.

Think of it like a GPS that asks *"why are we re-routing?"* before recalculating: user wants a faster route → search new routes; road closed → detour around it; both → predict where the best route is heading. Old GPSes just hit "re-route" the same way every time.

**Why it won the Friedman ranking (1.25 vs 2.33 for runner-up):** it dominates on constraint preservation and diversity because those are exactly the things you get right when you classify changes and treat feasibility as core instead of a bolt-on. It loses on raw runtime against DNSGA-II — a deliberate trade of compute for solution quality.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem in Plain Terms](#2-the-problem-in-plain-terms)
3. [Why Existing Methods Fall Short](#3-why-existing-methods-fall-short)
4. [What ADCMOplus Does Differently](#4-what-adcmoplus-does-differently)
5. [Architecture](#5-architecture)
6. [Experimental Results](#6-experimental-results)
7. [Where This Applies — Modern AI & Real Systems](#7-where-this-applies--modern-ai--real-systems)
8. [Application Briefs](#8-application-briefs)
9. [Limitations & Roadmap](#9-limitations--roadmap)
10. [Thesis Structure](#10-thesis-structure)

---

## 1. Executive Summary

Most real-world optimization problems are not static. A delivery fleet doesn't optimize one route once — it re-optimizes constantly as orders arrive, traffic shifts, and drivers go offline. A trading portfolio rebalances as volatility, regulation, and capital limits change. A cloud autoscaler reallocates compute as request mix, GPU prices, and SLA targets drift.

These are **Dynamic Constrained Multi-Objective Optimization Problems (DCMOPs)**: multiple conflicting goals, multiple hard limits, and both the goals *and* the limits change over time.

The dominant academic algorithms in this space (DNSGA-II, SGEA, PBDMO) treat every detected change the same way. ADCMOplus's central thesis is that **the type of change should determine the response**. A new traffic jam (constraint change) demands repair of infeasible routes; a new delivery deadline (objective change) demands exploration of new optima. Mixing the two costs you on both fronts.

The contribution is threefold:

1. **A change classifier** (objective / constraint / combined) that runs cheaply at every detection cycle.
2. **Three specialised response strategies**, dispatched by the classifier.
3. **Integrated constraint handling** — feasibility logic lives inside the main loop, not as a wrapper.

The result, on the FDA1–FDA5 benchmarks with dynamic constraints:

- **Best overall** (Friedman avg rank **1.25** vs 5 comparators).
- **Significantly best at constraint preservation (CPF)** on every problem.
- **Significantly best at diversity (DM)** on every problem.
- Slower than DNSGA-II but faster than PBDMO — a deliberate quality-vs-cost trade.

---

## 2. The Problem in Plain Terms

Pick any of these and you have a DCMOP:

- **Cloud inference serving:** Minimise *cost per token* and *p95 latency*, subject to GPU memory caps, model availability, and SLA tiers — all of which shift hour by hour.
- **Real-time bidding:** Maximise *conversion rate* and *brand safety*, subject to *budget pacing* and *frequency caps*, while the auction landscape changes every millisecond.
- **Smart grid dispatch:** Minimise *cost* and *carbon intensity*, subject to *demand* and *transmission limits*, both varying minute to minute as weather and load shift.
- **On-demand marketplaces (Uber, brikoul, Instacart):** Match *workers to jobs* maximising *fill rate* and *worker earnings*, subject to *geographic feasibility* and *time windows* — all dynamic.
- **Portfolio rebalancing:** Maximise *return*, minimise *variance*, subject to *regulatory* and *liquidity* constraints, all time-varying.

Each problem has the same structure:

```
minimise   F(x) = [f₁(x, t), f₂(x, t), …, fₘ(x, t)]ᵀ
subject to gᵢ(x, t) ≤ 0,  i = 1..q   (inequality constraints, change over time)
           hⱼ(x, t) = 0,  j = 1..p   (equality constraints, change over time)
           x ∈ Ω
```

The world hands you both `f(·, t)` and `g(·, t)` that move. You need to keep approximating a *set* of trade-off solutions — the Pareto front — even as the front itself moves.

---

## 3. Why Existing Methods Fall Short

The mainstream DCMOP algorithms share three weaknesses:

| Weakness | Concrete failure mode |
|---|---|
| **Uniform change response** | A constraint shift triggers exploration — wasting evaluations in newly-infeasible regions. |
| **Bolt-on constraint handling** | Feasibility is enforced via penalty wrappers, which lag the main search and produce many infeasible candidates near constraint boundaries. |
| **No change typing** | Algorithms have no signal to distinguish "the goalposts moved" from "the field shrunk" — different problems, treated identically. |

Algorithm-by-algorithm:

- **DNSGA-II** — fast, but its hypermutation-on-detection burns budget regardless of change type.
- **SGEA** — strong on convergence, weak on constraints; its steady-state replacement doesn't model feasibility shifts.
- **PBDMO** — predictive, but its single forecast model degrades when objective and constraint dynamics decouple.
- **MOEA/D-DE** — decomposition is elegant but rigid; weight vectors drift out of usefulness as the front moves.
- **CMOEA/D** — extends decomposition to constraints, but loses diversity under combined changes.

---

## 4. What ADCMOplus Does Differently

```
┌──────────────────────────────────────────────────────────────────────┐
│                  ADCMOplus Decision Loop (per generation)            │
└──────────────────────────────────────────────────────────────────────┘

   ┌────────────────────┐
   │  Sentinel probes   │  ← cheap statistical checks on
   │  detect a change?  │    fitness variance + constraint violations
   └─────────┬──────────┘
             │ yes
             ▼
   ┌────────────────────┐
   │   CLASSIFY change  │
   │  A / B / C / none  │
   └─────────┬──────────┘
             │
   ┌─────────┼─────────┬─────────────────┐
   ▼         ▼         ▼                 ▼
 type A    type B    type C            none
(obj)    (constr.) (combined)        (steady)
   │         │         │                 │
   ▼         ▼         ▼                 ▼
 SGEA-     Gradient   Prediction-      Continue
 style     repair +   based            normal
 explore   boundary   response         evolution
           explore
   │         │         │                 │
   └─────────┴─────────┴─────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Selection + Archive │
            │  (Fast non-dom sort, │
            │   crowding distance) │
            └─────────────────────┘
```

The three response strategies, summarised:

| Change type | Response strategy | Why |
|---|---|---|
| **A — Objective** | SGEA-style exploration; reseed part of population with diversity bias | The front moved; you need to find where it went. |
| **B — Constraint** | Gradient-based repair + boundary exploration | The feasible region moved; existing solutions need to be repaired toward it. |
| **C — Combined** | Prediction-based response; use historical trajectory to forecast new optima | Both shifted; you need to extrapolate rather than search blindly. |

---

## 5. Architecture

ADCMOplus is organised into **five functional areas**, each with a clean interface so components can be replaced or extended independently.

| Functional Area | Components | PM Analogue |
|---|---|---|
| **Main Algorithm Control** | `ADCMOMain`, `UpdateArchive`, `FitnessCalculation` | Orchestrator / scheduler |
| **Change Detection** | `EnhancedChangeDetection` (sentinel-based, classifies into A/B/C) | Monitoring + anomaly detection layer |
| **Change Response** | `SGEAStyleResponse`, `ConstraintFocusedResponse`, `PredictionResponse` | Strategy pattern with three policies |
| **Selection Mechanisms** | `FastSelection`, `CrowdingDistance`, `FastNonDominatedSort` | Ranking + diversity service |
| **Utility Functions** | Numerical stability, error handling, parallelisation helpers | Shared infra layer |

The modular split matters because in production deployments you usually want to swap one piece — e.g. replace the change classifier with a learned model — without rewriting the rest. The architecture is built for that.

---

## 6. Experimental Results

### Setup

- **Benchmarks:** FDA1–FDA5 adapted with dynamic constraints (5 problems × 3 change-type variants = 12 benchmark instances overall).
- **Comparators:** DNSGA-II, SGEA, PBDMO, MOEA/D-DE, CMOEA/D.
- **Common settings:** population 100, 10,000 function evaluations per change, 20 changes per run, change frequency τ = 20 generations, severity n_t = 10, 30 independent runs per configuration.
- **Hardware:** Intel Core i7-11800H @ 2.30 GHz, 16 GB DDR4, Windows 11 (Katana GF76), MATLAB R2024B.
- **Metrics:** IGD, HVD, DeltaP (Δp), Diversity Metric (DM), Constraint Violation Ratio (CVR), Constraint Preservation Factor (CPF), Runtime.
- **Statistical tests:** Wilcoxon signed-rank (pairwise), Friedman (overall ranking), Bonferroni-Dunn (post-hoc).

### Headline: Friedman Overall Ranking

Across all 7 metrics and all 12 benchmark instances:

| Rank | Algorithm | Avg Rank |
|---:|---|---:|
| 🥇 | **ADCMOplus** | **1.25** |
| 🥈 | PBDMO | 2.33 |
| 🥉 | SGEA | 3.08 |
| 4 | MOEA/D-DE | 3.92 |
| 5 | DNSGA-II | 4.42 |

### Per-Metric Wilcoxon Findings (p < 0.05)

| Metric | ADCMOplus result |
|---|---|
| **CPF — constraint preservation** | Significantly best on **every** benchmark vs **every** comparator. |
| **DM — diversity** | Significantly best on **all 12** instances. |
| **DeltaP — convergence + diversity** | Significantly best on **10 of 12** instances; tied with PBDMO on FDA5 variants. |
| **Runtime** | Slower than DNSGA-II; faster than PBDMO. |

### Honest Read

ADCMOplus is not best at every individual DeltaP score — leaner methods (SGEA, PBDMO) sometimes score lower on raw DeltaP for pure-objective problems with simple fronts. But aggregated across all metrics ADCMOplus wins decisively, with the biggest wins in:

- **Constraint preservation** — the practical bottleneck in real deployments.
- **Diversity** — coverage of the trade-off frontier, which is what stakeholders actually use to pick operating points.

The runtime is a deliberate trade: more compute spent on classification and tailored response in exchange for materially better feasibility and front coverage.

---

## 7. Where This Applies — Modern AI & Real Systems

This thesis is from a classical evolutionary-computation lineage, but the framing is directly relevant to systems being built today. A non-exhaustive map:

### 7.1 LLM Inference Serving

Optimise **latency**, **cost**, **quality** under **GPU memory**, **model availability**, and **SLA-tier** constraints. All shift hourly with traffic mix and provider pricing.

- *Objective changes:* new model released, new quality target.
- *Constraint changes:* GPU pool reshape, a node drains, a tier's price changes.
- *Combined:* peak traffic + provider pricing surge.

The ADCMOplus pattern (classify → dispatch) maps cleanly onto router/scheduler design.

### 7.2 RLHF / Reward Shaping

Modern LLM post-training balances multiple reward signals (helpfulness, harmlessness, honesty, brevity, style adherence) under compute and dataset-size constraints. Reward weights drift between iterations as policy and dataset change.

- This is a **continual** multi-objective optimisation under shifting constraints — a textbook DCMOP, even if the field doesn't usually name it that way.

### 7.3 AI Agent Orchestration

Agent frameworks route a request across multiple models/tools optimising for **success rate**, **cost**, and **latency** under **rate-limit**, **context-window**, and **tool-availability** constraints. Routes degrade or improve as upstream providers change.

- The change-typing idea translates: rate-limit hits are constraint changes; new tool capability is an objective change; provider outage is combined.

### 7.4 Recommendation Systems

Recommenders optimise **engagement**, **revenue**, and **diversity** under **inventory**, **fairness**, and **cold-start** constraints. Catalogue and audience shift constantly.

- Diversity (DM) preservation is the metric most recsys teams under-invest in; this thesis's DM dominance is directly applicable.

### 7.5 AutoML & Hyperparameter Tuning

Multi-objective AutoML (accuracy vs latency vs memory vs energy) under compute-budget and data-availability constraints, with constraints tightening as a sweep progresses.

### 7.6 Real-time Bidding & Ad Auctions

Maximise **CVR/CTR** and **brand safety** under **budget pacing** and **frequency caps**. Auction dynamics drift millisecond-by-millisecond — change-typing helps separate auction-rule shifts (constraint) from inventory drift (objective).

### 7.7 Smart Grid / Energy Dispatch

Minimise **cost** and **carbon intensity** under **demand** and **transmission** constraints, both highly time-varying with weather and load.

### 7.8 Marketplace Matching (Uber, brikoul, Instacart, etc.)

Match **workers to jobs** optimising **fill rate**, **earnings equity**, and **ETA**, subject to **geographic feasibility** and **time-window** constraints. New workers arrive, others log off, traffic changes — a constant DCMOP.

> Personal note: this is directly relevant to the worker–job matching layer of [brikoul.ma](https://brikoul.ma) / jak.ma. The change-typing idea would let the matcher react differently to "worker just went offline" (constraint shift) vs "new high-value job posted" (objective shift), instead of recomputing the whole matching from scratch every time.

---

## 8. Application Briefs

Three more detailed sketches of how ADCMOplus's ideas would land in production.

### Brief A — LLM Inference Router

**Problem.** Route incoming requests across N model endpoints. Minimise *cost-per-request* and *p95-latency* while maximising *quality* (eval score). Constraints: GPU memory, model availability, customer SLA tier.

**Why static optimisers fail.** Traffic mix changes hourly; a provider can throttle without warning; a new model release shifts the quality Pareto front. Re-tuning a fixed policy by hand can't keep up.

**ADCMOplus mapping.**
- Sentinels = sampled requests against each endpoint, monitoring latency variance and timeout rate.
- Change classifier = is the front moving (quality shifted: new model) or is the feasible region shrinking (constraint: a GPU pool drained)?
- Response policies = (A) re-explore routing weights on quality; (B) repair routes away from drained pool with gradient-style updates; (C) predictive response when both move (e.g. peak traffic + provider price surge).

### Brief B — RLHF Multi-Reward Optimiser

**Problem.** Balance helpfulness, harmlessness, brevity, and style rewards. Constraint: compute budget per training iteration, dataset coverage.

**Why static optimisers fail.** Reward weights drift between iterations as policy improves; over-optimising one reward (e.g. brevity) collapses diversity of outputs.

**ADCMOplus mapping.**
- The DM (Diversity Metric) supremacy result transfers directly — output diversity is the explicit problem RLHF gets wrong when it over-fits.
- The constraint-classification idea suggests separating "we're out of compute" (constraint shift) from "we got a new preference dataset" (objective shift) — currently most pipelines react identically.

### Brief C — Marketplace Matcher

**Problem.** Match workers to jobs in a home-services marketplace. Maximise fill rate and worker earnings; minimise customer ETA. Constraints: geographic radius, worker availability, skill match.

**Why static optimisers fail.** Workers go online/offline minute by minute; new jobs arrive continuously; surge events shift the entire feasibility region.

**ADCMOplus mapping.**
- Lightweight per-zone sentinels detect when fill-rate degrades.
- Classifier distinguishes "drop in worker supply" (B — constraint) from "spike in job volume" (A — objective).
- Constraint-focused response reallocates supply; objective response triggers new outreach/discovery.

---

## 9. Limitations & Roadmap

### Acknowledged in the thesis

| Limitation | Future work |
|---|---|
| Highly multimodal Pareto fronts | Hybrid global+local search; niching strategies. |
| Scaling to many-objective problems (M > 5) | Reference-point and decomposition hybrids. |
| Robustness to noisy / uncertain objectives & constraints | Stochastic sentinels; expected-value formulations. |
| Limited theoretical convergence guarantees | Formal proofs under specific change models. |
| Mostly synthetic benchmark validation | Real-world case studies (engineering, finance, logistics). |
| Hand-crafted classifier | Learned classifier — train a model to predict change type from sentinel statistics. |

### Natural next steps with current AI

1. **Replace the classifier with a small ML model.** Train on labelled sentinel sequences from production traces. The thesis flags this as future work; it's a 1–2 week extension with modern tooling.
2. **Add a reinforcement-learning meta-controller** over the three response strategies, learning when to switch.
3. **Port the algorithm out of MATLAB.** A Python (NumPy + Numba) or Rust port would unlock real production deployment.
4. **Build a streaming-first variant** that operates on a sliding window rather than fixed change intervals — relevant to all online-serving applications above.

---

## 10. Thesis Structure

| Chapter | Contents |
|---|---|
| **1. Introduction** | Background, problem statement, research objectives, contributions, thesis structure. |
| **2. Literature Review** | MOO fundamentals, Pareto optimality, classical & evolutionary methods, DCMOO formulation, classification of environmental changes, existing diversity / prediction / memory / hybrid approaches, constraint-handling mechanisms, benchmarks, research gaps. |
| **3. Overall Architecture** | Five functional areas, sentinel-based change detection & classification, adaptive sampling, severity estimation, three response strategies, parameters, data structures, complexity analysis, parallelisation, deployment notes. |
| **4. Experimental Procedure** | Benchmarks, comparators, parameter settings, metrics, platform, statistical analysis, comparative results, discussion of strengths, limitations, and real-world implications. |
| **5. Conclusion** | Summary of contributions, limitations, future work, broader implications. |
| Acknowledgements + Graduation Project Summary | |

---

## Keywords

`dynamic optimization` · `multi-objective optimization` · `constraint handling` · `adaptive algorithms` · `evolutionary algorithms` · `Pareto front` · `DCMOP` · `change detection` · `change classification` · `LLM serving` · `recommender systems` · `marketplace matching` · `RLHF` · `agent orchestration`

---

*Private archive — quick-access copy of the final submitted thesis (NPU, May 2025).*

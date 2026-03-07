import React from 'react';
import { ChevronLeft, Brain, Bot, Layers, Target, BarChart3, Eye, FlaskConical, GitBranch } from 'lucide-react';

export default function Methodology() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#e4e4e7' }}>
      <a
        href="/"
        style={{ color: '#10b981', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '32px' }}
      >
        <ChevronLeft size={16} /> Back to SurvivalIndex
      </a>

      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
        Methodology
      </h1>
      <p style={{ color: '#a1a1aa', fontSize: '15px', marginBottom: '40px', lineHeight: '1.6' }}>
        How we measure whether AI models actually know your tools exist — without ever telling them what to look for.
      </p>

      {/* Core Idea */}
      <Section icon={<Brain size={20} />} title="The Core Question">
        <p>
          In the AI era, a tool's survival depends on whether AI agents recommend it when developers describe
          a <em>need</em> — not a product name. If you say "I need to store and query data for my project"
          and every major model answers "PostgreSQL," that tool has high <strong>Agent Awareness</strong>.
          If no model mentions it, it's invisible to the AI-assisted developer workflow that's rapidly becoming the default.
        </p>
        <p>
          The <strong>Agent Awareness Score (AAS)</strong> quantifies this: a 0-100 score measuring how often
          AI models recommend a tool <em>unprompted</em>, across different contexts, prompt styles, and models.
        </p>
      </Section>

      {/* Blind Probing */}
      <Section icon={<FlaskConical size={20} />} title="Blind Probing Protocol">
        <p>
          Every prompt we send describes a <em>need</em>, never a tool name. The AI doesn't know it's being tested,
          and it doesn't know which tools we're tracking. This eliminates confirmation bias — the model can only
          recommend tools it genuinely "knows" from training data.
        </p>
        <CodeBlock>{`// Example prompt for the "databases" category:
"I'm building a Next.js SaaS application. I need to store and
query data for my project. What specific database would you
recommend and why?"

// The model responds in structured JSON:
{
  "primary_recommendation": "PostgreSQL",
  "primary_reason": "Excellent ORM support, ACID compliance...",
  "also_considered": ["MySQL", "MongoDB"],
  "all_mentioned": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"]
}`}</CodeBlock>
        <p>
          We then match the model's response against the tools we track in that category.
          A tool gets credit only if the model names it without any hint.
        </p>
      </Section>

      {/* Three Prompt Types */}
      <Section icon={<Layers size={20} />} title="Three Prompt Types">
        <p>Each category has three types of prompts, weighted differently:</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Weight</th>
              <th style={thStyle}>What it measures</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}><strong>Need-based</strong></td>
              <td style={tdStyle}>50%</td>
              <td style={tdStyle}>
                "I need X capability" — does the model recommend this tool as its primary pick?
                Run across 4 repo contexts (Next.js SaaS, FastAPI API, React SPA, CLI tool).
              </td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Ecosystem-adjacent</strong></td>
              <td style={tdStyle}>30%</td>
              <td style={tdStyle}>
                "I'm setting up a backend and need to pick a data layer" — does the tool appear as
                a primary pick or serious consideration in broader ecosystem discussions?
              </td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Consideration</strong></td>
              <td style={tdStyle}>20%</td>
              <td style={tdStyle}>
                "What are ALL the options you'd consider?" — does the tool appear anywhere in the
                model's mental inventory for this category?
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Each prompt type has 3-5 unique prompts per category, all describing needs differently
          to avoid anchoring on specific phrasing.
        </p>
      </Section>

      {/* Multi-Model */}
      <Section icon={<Bot size={20} />} title="Four Models, Four Providers">
        <p>
          We test across 4 models from different providers to measure cross-model consistency
          and avoid single-vendor bias:
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>Why included</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Claude Sonnet</td>
              <td style={tdStyle}>Anthropic</td>
              <td style={tdStyle}>Leading closed-source model, strong reasoning</td>
            </tr>
            <tr>
              <td style={tdStyle}>GPT-4o</td>
              <td style={tdStyle}>OpenAI</td>
              <td style={tdStyle}>Most widely deployed model, massive training corpus</td>
            </tr>
            <tr>
              <td style={tdStyle}>Llama 3.3 70B</td>
              <td style={tdStyle}>Meta (via OpenRouter)</td>
              <td style={tdStyle}>Leading open-source model, different training data</td>
            </tr>
            <tr>
              <td style={tdStyle}>Gemini 2.5 Flash</td>
              <td style={tdStyle}>Google</td>
              <td style={tdStyle}>Google's model, trained on different web corpus</td>
            </tr>
          </tbody>
        </table>
        <p>
          If all 4 models recommend a tool, it has strong cross-model consistency.
          If only GPT-4o knows it, that's a single-model dependency risk.
        </p>
      </Section>

      {/* Context Breadth */}
      <Section icon={<GitBranch size={20} />} title="Context Breadth (0-4)">
        <p>
          Need-based prompts are tested across 4 different project contexts:
        </p>
        <ul style={ulStyle}>
          <li><code style={codeStyle}>nextjs-saas</code> — "I'm building a Next.js SaaS application"</li>
          <li><code style={codeStyle}>fastapi-api</code> — "I'm building a Python FastAPI backend service"</li>
          <li><code style={codeStyle}>react-spa</code> — "I'm building a React single-page application"</li>
          <li><code style={codeStyle}>cli-tool</code> — "I'm building a Node.js command-line tool"</li>
        </ul>
        <p>
          A tool with breadth 4/4 is recommended regardless of what you're building.
          A tool with breadth 1/4 is context-dependent — models only think of it for specific project types.
        </p>
      </Section>

      {/* Score Calculation */}
      <Section icon={<BarChart3 size={20} />} title="Score Calculation">
        <p>The AAS is a weighted composite of the three prompt-type rates:</p>
        <CodeBlock>{`AAS = round(
  needPickRate   * 0.50 +
  ecoPickRate    * 0.30 +
  considRate     * 0.20
) * 100

// Example: PostgreSQL in "databases" category
needPickRate   = 15 picks / 20 probes = 0.75  (primary pick 75% of the time)
ecoPickRate    = 3 picks / 4 probes   = 0.75  (recommended in ecosystem context)
considRate     = 4 mentions / 4 probes = 1.00  (always in consideration set)

AAS = round((0.75 * 0.50) + (0.75 * 0.30) + (1.00 * 0.20)) * 100
    = round(0.375 + 0.225 + 0.200) * 100
    = 80`}</CodeBlock>
      </Section>

      {/* Cross-Model Consistency */}
      <Section icon={<Target size={20} />} title="Cross-Model Consistency">
        <p>
          A tool "knows" a model if its pick rate for that model is &ge; 30% (the awareness threshold).
          Cross-model consistency is the fraction of models that know the tool:
        </p>
        <CodeBlock>{`crossModelConsistency = knowingModels / totalModels

// Example: Redis
// Claude: 45% pick rate  -> knows (>= 30%)
// GPT-4o: 60% pick rate  -> knows
// Llama:  10% pick rate  -> doesn't know
// Gemini: 35% pick rate  -> knows

consistency = 3/4 = 75%`}</CodeBlock>
      </Section>

      {/* What AAS Does NOT Measure */}
      <Section icon={<Eye size={20} />} title="What AAS Does NOT Measure">
        <ul style={ulStyle}>
          <li><strong>Quality</strong> — A high AAS means models know about a tool, not that it's good. A terrible but famous tool can score high.</li>
          <li><strong>Correctness</strong> — We don't verify whether the model's recommendation is appropriate for the stated need.</li>
          <li><strong>Market share</strong> — AAS correlates with but is distinct from actual usage. It measures AI training data representation.</li>
          <li><strong>Future trajectory</strong> — Scores reflect current model knowledge. A tool gaining adoption may lag in AAS until models are retrained.</li>
        </ul>
      </Section>

      {/* Data & Reproducibility */}
      <Section icon={<FlaskConical size={20} />} title="Data & Reproducibility">
        <ul style={ulStyle}>
          <li>Each full run makes ~650 API calls across all 4 models and 11 categories.</li>
          <li>Total cost per run: approximately $1.50 in API fees.</li>
          <li>Scores are deterministic for a given model version but may shift when providers update models.</li>
          <li>All prompts are visible in the open-source codebase. No prompts mention tool names or hint at expected answers.</li>
          <li>We plan to run monthly recomputation to track score drift as models are updated.</li>
        </ul>
      </Section>

      {/* Limitations */}
      <Section icon={<Eye size={20} />} title="Known Limitations & Biases">
        <ul style={ulStyle}>
          <li><strong>English-only prompts</strong> — Results may differ in other languages. Tools popular in non-English ecosystems may be underrepresented.</li>
          <li><strong>Western/Silicon Valley bias</strong> — Models are trained on English-language tech content, which skews toward US/EU tooling.</li>
          <li><strong>Popularity feedback loop</strong> — Popular tools appear more in training data, so models recommend them more, reinforcing popularity. AAS measures this loop, it doesn't break it.</li>
          <li><strong>Category boundaries</strong> — Some tools span categories (e.g., Supabase is auth + database + real-time). We score per-category, so multi-category tools may appear in multiple leaderboards.</li>
          <li><strong>Model knowledge cutoffs</strong> — Tools released after a model's training cutoff will score 0 regardless of quality.</li>
          <li><strong>4 repo contexts</strong> — All JavaScript/Python-centric. Tools primarily used in Go, Rust, or Java ecosystems may be disadvantaged by context framing.</li>
        </ul>
      </Section>

      {/* Open Source */}
      <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>
          Open Source & Verifiable
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#a1a1aa', margin: 0 }}>
          The entire scoring pipeline is open source. You can read every prompt, verify the scoring formula,
          and run the computation yourself. We believe measurement tools should be transparent — especially
          ones that claim to measure AI behavior.
        </p>
        <div style={{ marginTop: '12px' }}>
          <a
            href="https://github.com/selwyntheo/SurvivalIndex"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#10b981', fontSize: '14px', textDecoration: 'none' }}
          >
            View source on GitHub &rarr;
          </a>
        </div>
      </div>

      <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
        &copy; {new Date().getFullYear()} SurvivalIndex.org
      </footer>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif' }}>
        {icon} {title}
      </h2>
      <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#d4d4d8' }}>
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '13px',
      lineHeight: '1.5',
      overflowX: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      color: '#a1a1aa',
      margin: '16px 0',
    }}>
      {children}
    </pre>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '16px 0',
  fontSize: '14px',
};

const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  color: '#a1a1aa',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'top',
};

const ulStyle = {
  paddingLeft: '20px',
  margin: '12px 0',
};

const codeStyle = {
  background: 'rgba(255,255,255,0.06)',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '13px',
  fontFamily: 'JetBrains Mono, monospace',
};

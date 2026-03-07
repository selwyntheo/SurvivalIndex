import React from 'react';
import { ChevronLeft, Brain, Bot, Layers, Target, BarChart3, Eye, FlaskConical, GitBranch, BookOpen } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="survival-platform">
      <header className="platform-header">
        <div className="logo-section">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="logo">S</div>
            <div className="logo-text">
              <h1>SurvivalIndex.org</h1>
              <p>RATE &bull; DISCOVER &bull; SURVIVE</p>
            </div>
          </a>
        </div>
        <div className="header-actions">
          <a href="/" className="header-btn secondary">
            <ChevronLeft size={18} />
            Back
          </a>
        </div>
      </header>

      <div className="methodology-page" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '48px 24px 0' }}>

        <h1 className="methodology-title">Methodology</h1>
        <p className="methodology-subtitle">
          How we measure whether AI models actually know your tools exist — without ever telling them what to look for.
        </p>

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

        <Section icon={<FlaskConical size={20} />} title="Blind Probing Protocol">
          <p>
            Every prompt we send describes a <em>need</em>, never a tool name. The AI doesn't know it's being tested,
            and it doesn't know which tools we're tracking. This eliminates confirmation bias — the model can only
            recommend tools it genuinely "knows" from training data.
          </p>
          <pre className="methodology-code">{`// Example prompt for the "databases" category:
"I'm building a Next.js SaaS application. I need to store and
query data for my project. What specific database would you
recommend and why?"

// The model responds in structured JSON:
{
  "primary_recommendation": "PostgreSQL",
  "primary_reason": "Excellent ORM support, ACID compliance...",
  "also_considered": ["MySQL", "MongoDB"],
  "all_mentioned": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"]
}`}</pre>
          <p>
            We then match the model's response against the tools we track in that category.
            A tool gets credit only if the model names it without any hint.
          </p>
        </Section>

        <Section icon={<Layers size={20} />} title="Three Prompt Types">
          <p>Each category has three types of prompts, weighted differently:</p>
          <div className="methodology-table-wrap">
            <table className="methodology-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Weight</th>
                  <th>What it measures</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Need-based</strong></td>
                  <td>50%</td>
                  <td>
                    "I need X capability" — does the model recommend this tool as its primary pick?
                    Run across 4 repo contexts (Next.js SaaS, FastAPI API, React SPA, CLI tool).
                  </td>
                </tr>
                <tr>
                  <td><strong>Ecosystem-adjacent</strong></td>
                  <td>30%</td>
                  <td>
                    "I'm setting up a backend and need to pick a data layer" — does the tool appear as
                    a primary pick or serious consideration in broader ecosystem discussions?
                  </td>
                </tr>
                <tr>
                  <td><strong>Consideration</strong></td>
                  <td>20%</td>
                  <td>
                    "What are ALL the options you'd consider?" — does the tool appear anywhere in the
                    model's mental inventory for this category?
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Each prompt type has 3-5 unique prompts per category, all describing needs differently
            to avoid anchoring on specific phrasing.
          </p>
        </Section>

        <Section icon={<Bot size={20} />} title="Four Models, Four Providers">
          <p>
            We test across 4 models from different providers to measure cross-model consistency
            and avoid single-vendor bias:
          </p>
          <div className="methodology-table-wrap">
            <table className="methodology-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Provider</th>
                  <th>Why included</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Claude Sonnet</td>
                  <td>Anthropic</td>
                  <td>Leading closed-source model, strong reasoning</td>
                </tr>
                <tr>
                  <td>GPT-4o</td>
                  <td>OpenAI</td>
                  <td>Most widely deployed model, massive training corpus</td>
                </tr>
                <tr>
                  <td>Llama 3.3 70B</td>
                  <td>Meta (via OpenRouter)</td>
                  <td>Leading open-source model, different training data</td>
                </tr>
                <tr>
                  <td>Gemini 2.5 Flash</td>
                  <td>Google</td>
                  <td>Google's model, trained on different web corpus</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            If all 4 models recommend a tool, it has strong cross-model consistency.
            If only GPT-4o knows it, that's a single-model dependency risk.
          </p>
        </Section>

        <Section icon={<GitBranch size={20} />} title="Context Breadth (0-4)">
          <p>
            Need-based prompts are tested across 4 different project contexts:
          </p>
          <ul className="methodology-list">
            <li><code>nextjs-saas</code> — "I'm building a Next.js SaaS application"</li>
            <li><code>fastapi-api</code> — "I'm building a Python FastAPI backend service"</li>
            <li><code>react-spa</code> — "I'm building a React single-page application"</li>
            <li><code>cli-tool</code> — "I'm building a Node.js command-line tool"</li>
          </ul>
          <p>
            A tool with breadth 4/4 is recommended regardless of what you're building.
            A tool with breadth 1/4 is context-dependent — models only think of it for specific project types.
          </p>
        </Section>

        <Section icon={<BarChart3 size={20} />} title="Score Calculation">
          <p>The AAS is a weighted composite of the three prompt-type rates:</p>
          <pre className="methodology-code">{`AAS = round(
  needPickRate   * 0.50 +
  ecoPickRate    * 0.30 +
  considRate     * 0.20
) * 100

// Example: PostgreSQL in "databases" category
needPickRate   = 15 picks / 20 probes = 0.75
ecoPickRate    = 3 picks / 4 probes   = 0.75
considRate     = 4 mentions / 4 probes = 1.00

AAS = round((0.75*0.50) + (0.75*0.30) + (1.00*0.20)) * 100
    = round(0.375 + 0.225 + 0.200) * 100
    = 80`}</pre>
        </Section>

        <Section icon={<Target size={20} />} title="Cross-Model Consistency">
          <p>
            A model "knows" a tool if its pick rate is &ge; 30% (the awareness threshold).
            Cross-model consistency is the fraction of models that know the tool:
          </p>
          <pre className="methodology-code">{`crossModelConsistency = knowingModels / totalModels

// Example: Redis
// Claude: 45% pick rate  -> knows (>= 30%)
// GPT-4o: 60% pick rate  -> knows
// Llama:  10% pick rate  -> doesn't know
// Gemini: 35% pick rate  -> knows

consistency = 3/4 = 75%`}</pre>
        </Section>

        <Section icon={<Eye size={20} />} title="What AAS Does NOT Measure">
          <ul className="methodology-list">
            <li><strong>Quality</strong> — A high AAS means models know about a tool, not that it's good. A terrible but famous tool can score high.</li>
            <li><strong>Correctness</strong> — We don't verify whether the model's recommendation is appropriate for the stated need.</li>
            <li><strong>Market share</strong> — AAS correlates with but is distinct from actual usage. It measures AI training data representation.</li>
            <li><strong>Future trajectory</strong> — Scores reflect current model knowledge. A tool gaining adoption may lag in AAS until models are retrained.</li>
          </ul>
        </Section>

        <Section icon={<FlaskConical size={20} />} title="Data & Reproducibility">
          <ul className="methodology-list">
            <li>Each full run makes ~650 API calls across all 4 models and 11 categories.</li>
            <li>Total cost per run: approximately $1.50 in API fees.</li>
            <li>Scores are deterministic for a given model version but may shift when providers update models.</li>
            <li>All prompts are visible in the open-source codebase. No prompts mention tool names or hint at expected answers.</li>
            <li>We plan to run monthly recomputation to track score drift as models are updated.</li>
          </ul>
        </Section>

        <Section icon={<Eye size={20} />} title="Known Limitations & Biases">
          <ul className="methodology-list">
            <li><strong>English-only prompts</strong> — Results may differ in other languages. Tools popular in non-English ecosystems may be underrepresented.</li>
            <li><strong>Western/Silicon Valley bias</strong> — Models are trained on English-language tech content, which skews toward US/EU tooling.</li>
            <li><strong>Popularity feedback loop</strong> — Popular tools appear more in training data, so models recommend them more, reinforcing popularity. AAS measures this loop, it doesn't break it.</li>
            <li><strong>Category boundaries</strong> — Some tools span categories (e.g., Supabase is auth + database + real-time). We score per-category, so multi-category tools may appear in multiple leaderboards.</li>
            <li><strong>Model knowledge cutoffs</strong> — Tools released after a model's training cutoff will score 0 regardless of quality.</li>
            <li><strong>4 repo contexts</strong> — All JavaScript/Python-centric. Tools primarily used in Go, Rust, or Java ecosystems may be disadvantaged by context framing.</li>
          </ul>
        </Section>

        <div className="methodology-cta">
          <h3>Open Source & Verifiable</h3>
          <p>
            The entire scoring pipeline is open source. You can read every prompt, verify the scoring formula,
            and run the computation yourself. We believe measurement tools should be transparent — especially
            ones that claim to measure AI behavior.
          </p>
          <a
            href="https://github.com/selwyntheo/SurvivalIndex"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub &rarr;
          </a>
        </div>
      </div>

      <footer className="platform-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">S</div>
            <div>
              <strong>SurvivalIndex.org</strong>
              <p>Rate &amp; discover software that will survive the AI era.</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="/">Browse Index</a>
              <a href="/methodology">Methodology</a>
              <a href="https://github.com/selwyntheo/survivalindex" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="/llms.txt">llms.txt</a>
              <a href="/sitemap.xml">Sitemap</a>
              <a href="/humans.txt">humans.txt</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SurvivalIndex.org — Helping AI agents and developers discover battle-tested software.</p>
        </div>
      </footer>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="methodology-section">
      <h2>{icon} {title}</h2>
      <div className="methodology-body">
        {children}
      </div>
    </section>
  );
}

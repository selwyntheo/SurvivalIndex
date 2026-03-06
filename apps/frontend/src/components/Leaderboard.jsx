import React, { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, X, Eye, Users, Award, Bot, Loader2, BarChart3, Layers, Sparkles, Target } from 'lucide-react';
import api from '../api/client';
import { getAASColor } from '../api/client';

function AASBadge({ score }) {
  const color = getAASColor(score);
  return (
    <span className="aas-inline-badge" style={{ color, borderColor: color }}>
      {score}
    </span>
  );
}

function GapBadge({ gap, gemClass }) {
  if (!gemClass || gemClass === 'aligned') {
    return <span style={{ color: '#71717a', fontSize: '13px' }}>aligned</span>;
  }
  if (gemClass === 'strong_hidden_gem' || gemClass === 'mild_hidden_gem') {
    return <span className="gem-badge-sm">GEM +{Math.round(gap)}</span>;
  }
  return <span className="overhyped-badge-sm">-{Math.abs(Math.round(gap))}</span>;
}

function ConfidenceIndicator({ value }) {
  if (value >= 0.7) return <span className="confidence-high" title={`Confidence: ${Math.round(value * 100)}%`}>&#9679;</span>;
  if (value >= 0.3) return <span className="confidence-moderate" title={`Confidence: ${Math.round(value * 100)}%`}>~</span>;
  return <span className="confidence-low" title={`Confidence: ${Math.round(value * 100)}%`}>?</span>;
}

// ─── Tool Detail Modal ───────────────────────────────────────────────

function ToolDetailModal({ toolName, category, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.aas.getToolDetail(toolName, category);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load tool detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toolName, category]);

  const aasColor = detail ? getAASColor(detail.aas) : '#71717a';
  const isGem = detail?.hiddenGemClass === 'strong_hidden_gem' || detail?.hiddenGemClass === 'mild_hidden_gem';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tool-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>

        {loading ? (
          <div className="loading-state" style={{ padding: '60px' }}>
            <Loader2 size={32} className="spinning" />
            <p>Loading tool detail...</p>
          </div>
        ) : !detail ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
            No AAS data found for this tool.
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-project">
                <span className="modal-logo">{detail.logo || '📦'}</span>
                <div>
                  <h2>{detail.toolName}</h2>
                  <p className="modal-subtitle">{detail.category}</p>
                </div>
              </div>
              <div className="aas-score-large" style={{ color: aasColor }}>
                <span className="aas-score-num">{detail.aas}</span>
                <span className="aas-score-of">/100</span>
              </div>
            </div>

            {isGem && (
              <div className="gem-banner">
                <Sparkles size={16} />
                Hidden Gem — Expert preference ({Math.round(detail.expertPreference)}%) far exceeds agent awareness ({detail.aas})
              </div>
            )}

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <ConfidenceIndicator value={detail.confidence} />
                <span style={{ color: '#71717a', fontSize: '13px' }}>
                  {detail.dataPoints} data points
                </span>
              </div>

              {/* Awareness Breakdown: 3 bars */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                  Awareness Breakdown
                </h4>
                {[
                  { label: 'Need-based pick rate', value: detail.unpromptedPickRate, weight: '50%', color: '#10B981' },
                  { label: 'Ecosystem-adjacent rate', value: detail.ecosystemPickRate, weight: '30%', color: '#3B82F6' },
                  { label: 'Consideration rate', value: detail.considerationRate, weight: '20%', color: '#8B5CF6' },
                ].map(bar => (
                  <div key={bar.label} className="component-bar" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                        {bar.label} ({bar.weight})
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#e4e4e7' }}>
                        {bar.value !== null && bar.value !== undefined ? `${Math.round(bar.value * 100)}%` : '--'}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(bar.value || 0) * 100}%`,
                        background: bar.color,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Context Breadth */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Context Breadth
                </h4>
                <div className="breadth-dots">
                  {[0, 1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`breadth-dot ${i < (detail.contextBreadth || 0) ? 'filled' : ''}`}
                    />
                  ))}
                  <span style={{ marginLeft: '8px', fontSize: '13px', color: '#a1a1aa' }}>
                    {detail.contextBreadth || 0}/4 repo types
                  </span>
                </div>
              </div>

              {/* Cross-model consistency */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Cross-Model Consistency
                </h4>
                <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: '#e4e4e7' }}>
                  {detail.crossModelConsistency !== null ? `${Math.round(detail.crossModelConsistency * 100)}%` : '--'}
                </div>
                <span style={{ fontSize: '12px', color: '#71717a' }}>
                  of models "know" this tool
                </span>
              </div>

              {/* Per-model table */}
              {detail.modelScores && detail.modelScores.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '13px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    Per-Model Detail
                  </h4>
                  <div className="tool-table-wrapper">
                    <table className="tool-table model-table">
                      <thead>
                        <tr>
                          <th>MODEL</th>
                          <th>PICK RATE</th>
                          <th>KNOWS?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.modelScores.map(m => (
                          <tr key={m.modelId}>
                            <td>
                              <Bot size={12} style={{ marginRight: '6px', opacity: 0.5 }} />
                              {m.modelId || m.modelName}
                            </td>
                            <td>{Math.round(m.pickRate * 100)}%</td>
                            <td>{m.knowsTool ? '✅' : '❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Category Grid ───────────────────────────────────────────────────

function CategoryGrid({ categories, onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
        No categories found. Run the AAS computation first.
      </div>
    );
  }

  return (
    <div className="category-grid">
      {categories.map(cat => (
        <div
          key={cat.categoryId}
          className="category-card"
          onClick={() => onSelectCategory(cat.categoryId)}
        >
          <h3 className="category-card-name">{cat.name || cat.categoryId}</h3>
          <div className="category-card-stats">
            <div className="category-stat">
              <span className="category-stat-value" style={{ color: getAASColor(cat.avgAas || 0) }}>
                {Math.round(cat.avgAas || 0)}
              </span>
              <span className="category-stat-label">Avg AAS</span>
            </div>
            <div className="category-stat">
              <span className="category-stat-value">{cat.toolCount}</span>
              <span className="category-stat-label">Tools</span>
            </div>
            {cat.topTool && (
              <div className="category-stat">
                <span className="category-stat-value" style={{ fontSize: '14px' }}>{cat.topTool.name}</span>
                <span className="category-stat-label">Top Tool</span>
              </div>
            )}
          </div>
          {cat.hiddenGemCount > 0 && (
            <span className="hidden-gem-badge">
              <Sparkles size={12} /> {cat.hiddenGemCount} Hidden Gem{cat.hiddenGemCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tool Table ──────────────────────────────────────────────────────

function ToolTable({ tools, category, onSelectTool }) {
  if (!tools || tools.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
        No tools found for this category.
      </div>
    );
  }

  return (
    <div className="tool-table-wrapper">
      <table className="tool-table">
        <thead>
          <tr>
            <th>RK</th>
            <th>TOOL</th>
            <th>AAS</th>
            <th>PICK%</th>
            <th>BREADTH</th>
            <th>MODELS</th>
            <th>EXPERT</th>
            <th>GAP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tools.map(tool => (
            <tr key={tool.toolId} onClick={() => onSelectTool(tool.toolName, category)} style={{ cursor: 'pointer' }}>
              <td className="rank-cell">{tool.rank}</td>
              <td className="tool-cell">
                <span className="tool-logo">{tool.logo || '📦'}</span>
                <span className="tool-name">{tool.toolName}</span>
              </td>
              <td className="score-cell" style={{ color: getAASColor(tool.aas) }}>{tool.aas}</td>
              <td>{tool.unpromptedPickRate !== null ? `${Math.round((tool.unpromptedPickRate || 0) * 100)}%` : '--'}</td>
              <td>{tool.contextBreadth !== null ? `${tool.contextBreadth}/4` : '--'}</td>
              <td>{tool.crossModelConsistency !== null ? `${Math.round((tool.crossModelConsistency || 0) * 100)}%` : '--'}</td>
              <td>{tool.expertPreference !== null && tool.expertPreference !== undefined ? `${Math.round(tool.expertPreference)}%` : '--'}</td>
              <td><GapBadge gap={tool.hiddenGemGap} gemClass={tool.hiddenGemClass} /></td>
              <td><ConfidenceIndicator value={tool.confidence || 0} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Model Table ─────────────────────────────────────────────────────

function ModelTable({ categories, onSelectTool }) {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllTools() {
      try {
        // Load tools from each category to get modelScores
        const allTools = [];
        for (const cat of categories) {
          try {
            const res = await api.aas.getCategoryLeaderboard(cat.categoryId);
            for (const tool of (res.tools || [])) {
              allTools.push({ ...tool, category: cat.categoryId });
            }
          } catch {}
        }

        // Extract unique model names and build comparison
        const modelMap = {}; // { modelId: { tools: { toolName: pickRate }, totalPicks, totalTrials } }
        for (const tool of allTools) {
          if (!tool.modelScores || !Array.isArray(tool.modelScores)) continue;
          for (const ms of tool.modelScores) {
            if (!modelMap[ms.modelId]) {
              modelMap[ms.modelId] = { toolsKnown: 0, totalTools: 0, avgPickRate: 0, pickRates: [] };
            }
            modelMap[ms.modelId].totalTools++;
            if (ms.knowsTool) modelMap[ms.modelId].toolsKnown++;
            modelMap[ms.modelId].pickRates.push(ms.pickRate);
          }
        }

        // Calculate averages
        const models = Object.entries(modelMap).map(([modelId, data]) => ({
          modelId,
          toolsKnown: data.toolsKnown,
          totalTools: data.totalTools,
          knowledgeRate: data.totalTools > 0 ? data.toolsKnown / data.totalTools : 0,
          avgPickRate: data.pickRates.length > 0
            ? data.pickRates.reduce((s, r) => s + r, 0) / data.pickRates.length
            : 0,
        })).sort((a, b) => b.knowledgeRate - a.knowledgeRate);

        // Build per-tool comparison matrix
        const modelIds = models.map(m => m.modelId);
        const toolRows = allTools
          .filter(t => t.modelScores && t.modelScores.length > 0)
          .map(t => ({
            toolName: t.toolName,
            logo: t.logo,
            category: t.category,
            aas: t.aas,
            scores: modelIds.map(mId => {
              const ms = t.modelScores.find(s => s.modelId === mId);
              return ms ? ms.pickRate : null;
            }),
          }))
          .sort((a, b) => b.aas - a.aas);

        setModelData({ models, modelIds, toolRows });
      } catch (err) {
        console.error('Failed to load model data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (categories.length > 0) loadAllTools();
    else setLoading(false);
  }, [categories]);

  if (loading) {
    return (
      <div className="loading-state" style={{ padding: '60px' }}>
        <Loader2 size={32} className="spinning" />
        <p>Loading model comparison...</p>
      </div>
    );
  }

  if (!modelData || modelData.models.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
        No per-model data yet. Run the AAS computation with multiple models to populate this view.
      </div>
    );
  }

  const { models, modelIds, toolRows } = modelData;

  return (
    <div>
      {/* Model summary cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {models.map(m => (
          <div key={m.modelId} style={{
            flex: '1 1 200px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={14} />
              {m.modelId}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: getAASColor(Math.round(m.knowledgeRate * 100)), fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round(m.knowledgeRate * 100)}%
            </div>
            <div style={{ fontSize: '12px', color: '#71717a' }}>
              knows {m.toolsKnown}/{m.totalTools} tools
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
              avg pick rate: {Math.round(m.avgPickRate * 100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Per-tool comparison matrix */}
      <div className="tool-table-wrapper">
        <table className="tool-table">
          <thead>
            <tr>
              <th>TOOL</th>
              <th>AAS</th>
              {modelIds.map(mId => (
                <th key={mId} style={{ fontSize: '11px', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {toolRows.map(row => (
              <tr key={`${row.toolName}-${row.category}`} style={{ cursor: 'pointer' }} onClick={() => onSelectTool?.(row.toolName, row.category)}>
                <td className="tool-cell">
                  <span className="tool-logo">{row.logo || '📦'}</span>
                  <span className="tool-name">{row.toolName}</span>
                </td>
                <td className="score-cell" style={{ color: getAASColor(row.aas) }}>{row.aas}</td>
                {row.scores.map((rate, i) => (
                  <td key={modelIds[i]} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: rate === null ? '#3f3f46' : rate >= 0.3 ? '#10B981' : rate > 0 ? '#F59E0B' : '#EF4444',
                  }}>
                    {rate === null ? '--' : `${Math.round(rate * 100)}%`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Leaderboard Component ──────────────────────────────────────

export default function Leaderboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolDetail, setToolDetail] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await api.aas.getLeaderboard();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load AAS categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadTools(category) {
    setLoading(true);
    try {
      const res = await api.aas.getCategoryLeaderboard(category);
      setTools(res.tools || []);
    } catch (err) {
      console.error('Failed to load AAS tools:', err);
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId);
    setActiveTab('tools');
    loadTools(categoryId);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'categories') {
      setSelectedCategory(null);
      loadCategories();
    }
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <button className="header-btn secondary" onClick={onClose} style={{ padding: '8px 16px' }}>
          <ChevronLeft size={18} />
          Back
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
          <BarChart3 size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          AAS Leaderboard
        </h2>
      </div>

      <div className="leaderboard-tabs">
        <button
          className={`leaderboard-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          <Layers size={16} />
          Categories
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => { if (selectedCategory) handleTabChange('tools'); }}
          disabled={!selectedCategory}
        >
          <Target size={16} />
          Tools {selectedCategory ? `(${selectedCategory})` : ''}
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => handleTabChange('models')}
        >
          <Bot size={16} />
          Models
        </button>
      </div>

      {selectedCategory && activeTab === 'tools' && (
        <div className="category-health-banner">
          {(() => {
            const catData = categories.find(c => c.categoryId === selectedCategory);
            if (!catData) return null;
            return (
              <>
                <span>Avg AAS: <strong style={{ color: getAASColor(catData.avgAas) }}>{Math.round(catData.avgAas)}</strong></span>
                <span>Tools: <strong>{catData.toolCount}</strong></span>
                {catData.topTool && <span>Top: <strong>{catData.topTool.name}</strong></span>}
                {catData.hiddenGemCount > 0 && <span>Gems: <strong>{catData.hiddenGemCount}</strong></span>}
              </>
            );
          })()}
        </div>
      )}

      <div className="leaderboard-content">
        {loading ? (
          <div className="loading-state" style={{ padding: '60px' }}>
            <Loader2 size={32} className="spinning" />
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'categories' && (
              <CategoryGrid
                categories={categories}
                onSelectCategory={handleSelectCategory}
              />
            )}
            {activeTab === 'tools' && (
              <ToolTable
                tools={tools}
                category={selectedCategory}
                onSelectTool={(toolName, cat) => setToolDetail({ toolName, category: cat })}
              />
            )}
            {activeTab === 'models' && <ModelTable categories={categories} onSelectTool={(toolName, cat) => setToolDetail({ toolName, category: cat })} />}
          </>
        )}
      </div>

      {toolDetail && (
        <ToolDetailModal
          toolName={toolDetail.toolName}
          category={toolDetail.category}
          onClose={() => setToolDetail(null)}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RefreshCcw, AlertCircle, ChevronRight, ChevronDown,
  Layers, CheckCircle2, Copy, Trash2, Database, Sparkles,
  GitBranch, AlertTriangle, TreePine, Info
} from 'lucide-react';

const API_URL = 'https://nihalbasaniwal-bfhl.onrender.com/bfhl';

/* ─── Style System ─── */
const colors = {
  blue: '#4f46e5',
  blueBg: '#eef2ff',
  blueBorder: '#c7d2fe',
  green: '#059669',
  greenBg: '#ecfdf5',
  greenBorder: '#a7f3d0',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fde68a',
  text: '#0f172a',
  textSoft: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  surface: '#ffffff',
  surfaceDim: '#f8fafc',
};

const card = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
  overflow: 'hidden',
};

/* ─── Tree Visualizer ─── */
const TreeItem = ({ label, children, isRoot = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Object.keys(children).length > 0;

  return (
    <div style={{ paddingLeft: isRoot ? 0 : 24, marginTop: isRoot ? 0 : 4 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
          transition: 'background 0.15s', width: 'fit-content',
          background: isRoot ? colors.blueBg : 'transparent',
          border: isRoot ? `1px solid ${colors.blueBorder}` : '1px solid transparent',
        }}
        onMouseEnter={e => { if (!isRoot) e.currentTarget.style.background = '#f1f5f9'; }}
        onMouseLeave={e => { if (!isRoot) e.currentTarget.style.background = 'transparent'; }}
      >
        {hasChildren ? (
          <span style={{ color: colors.blue, display: 'flex' }}>
            {isOpen ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
          </span>
        ) : (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.blueBorder, marginLeft: 2 }} />
        )}
        <span style={{
          fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: isRoot ? 800 : hasChildren ? 700 : 500,
          color: isRoot ? colors.blue : hasChildren ? colors.text : colors.textSoft,
        }}>
          {label}
        </span>
        {isRoot && (
          <span style={{ fontSize: 10, fontWeight: 700, color: colors.blue, background: 'white', padding: '2px 8px', borderRadius: 6, border: `1px solid ${colors.blueBorder}` }}>ROOT</span>
        )}
      </div>

      {isOpen && hasChildren && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginLeft: 20, borderLeft: `2px solid ${colors.blueBorder}`, paddingLeft: 8, marginTop: 2 }}>
          {Object.entries(children).map(([k, v]) => (
            <TreeItem key={k} label={k} children={v} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

/* ─── Hierarchy Card ─── */
const HierarchyCard = ({ hierarchy, index }) => {
  const isCycle = hierarchy.has_cycle;
  const accent = isCycle ? { bg: colors.redBg, border: colors.redBorder, text: colors.red, icon: AlertTriangle }
                         : { bg: colors.blueBg, border: colors.blueBorder, text: colors.blue, icon: TreePine };
  const Icon = accent.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} style={{ ...card, marginBottom: 20 }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: isCycle ? `linear-gradient(to right, ${colors.red}, ${colors.amber})` : `linear-gradient(to right, ${colors.blue}, #7c3aed)` }} />
      
      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: accent.bg, border: `1px solid ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.text }}>
              <Icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.text }}>
                Root Node: <span style={{ color: accent.text, fontFamily: "'JetBrains Mono', monospace" }}>{hierarchy.root}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: accent.bg, color: accent.text, border: `1px solid ${accent.border}` }}>
                  {isCycle ? '⚠ Cyclic Graph' : '✓ Valid Tree'}
                </span>
                {!isCycle && (
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                    Depth: {hierarchy.depth}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: colors.surfaceDim, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 20 }}>
          {isCycle ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '36px 0', color: colors.textMuted }}>
              <AlertTriangle size={28} style={{ color: colors.amber }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: colors.textSoft }}>Cyclic dependency detected</p>
              <p style={{ fontSize: 12, color: colors.textMuted }}>Tree visualization is not possible for cyclic graphs</p>
            </div>
          ) : (
            <TreeItem label={hierarchy.root} children={hierarchy.tree[hierarchy.root] || {}} isRoot />
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main App ─── */
function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = input.split(',').map(s => s.trim());
      const res = await axios.post(API_URL, { data });
      setResponse(res.data);
    } catch {
      setError('Could not connect to the API. Please verify the backend URL and ensure the service is live.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 780 }}>

        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, color: colors.text, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
            Hierarchy Processor
          </h1>
          <p style={{ fontSize: 17, color: colors.textSoft, fontWeight: 500, maxWidth: 460, margin: '0 auto' }}>
            Enter node relationships like <code style={{ fontFamily: "'JetBrains Mono', monospace", background: colors.blueBg, padding: '2px 8px', borderRadius: 6, fontSize: 14, color: colors.blue, fontWeight: 600 }}>A→B</code> to build trees, detect cycles, and analyze hierarchies.
          </p>
        </header>

        {/* ── Input Card ── */}
        <div style={{ ...card, marginBottom: 28 }}>
          {/* Help bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: colors.blueBg, borderBottom: `1px solid ${colors.blueBorder}`, fontSize: 12, fontWeight: 600, color: colors.blue }}>
            <Info size={14} />
            Comma-separated format: <code style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, background: 'white', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>A-&gt;B, B-&gt;C, D-&gt;E</code>
          </div>
          
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your node relationships here..."
            spellCheck="false"
            style={{ width: '100%', minHeight: 150, padding: '24px 28px', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: colors.text, resize: 'none', lineHeight: 1.8, background: 'transparent' }}
          />
          
          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: `1px solid ${colors.border}`, background: colors.surfaceDim, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: '🌿 Simple', data: 'A->B, A->C, B->D, C->E' },
                { label: '🔄 With Cycles', data: 'A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X' },
                { label: '🧪 Full Test', data: 'A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->I' },
              ].map(d => (
                <button key={d.label}
                  onClick={() => { setInput(d.data); setResponse(null); setError(null); }}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'white', color: colors.textSoft, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colors.blueBorder; e.currentTarget.style.color = colors.blue; e.currentTarget.style.background = colors.blueBg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSoft; e.currentTarget.style.background = 'white'; }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => { setInput(''); setResponse(null); setError(null); }}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `1px solid ${colors.redBorder}`, background: colors.redBg, color: colors.red, cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 28px', borderRadius: 12, border: 'none',
                  background: loading || !input.trim() ? '#cbd5e1' : `linear-gradient(135deg, ${colors.blue}, #7c3aed)`,
                  color: 'white', fontSize: 14, fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: loading || !input.trim() ? 'none' : '0 4px 14px rgba(79,70,229,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <RefreshCcw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={18} fill="white" />}
                {loading ? 'Processing...' : 'Run Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 14, background: colors.redBg, border: `1px solid ${colors.redBorder}`, color: colors.red, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </motion.div>
        )}

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0' }}>
              <RefreshCcw size={36} style={{ color: colors.blue, animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.15em', animation: 'pulse 1.5s infinite' }}>Analyzing graph structure...</span>
            </motion.div>
          ) : response ? (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

              {/* Summary Dashboard */}
              <div style={{ ...card, padding: 32, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, color: colors.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>Analysis Complete</div>
                      <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>All relationships have been processed</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: colors.surfaceDim, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    {[
                      { label: 'Trees Found', val: response.summary.total_trees, color: colors.blue },
                      { label: 'Cycles Found', val: response.summary.total_cycles, color: response.summary.total_cycles > 0 ? colors.red : colors.green },
                      { label: 'Largest Root', val: response.summary.largest_tree_root || '—', color: '#7c3aed', mono: true },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '14px 24px', borderRight: i < 2 ? `1px solid ${colors.border}` : 'none' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: s.mono ? "'JetBrains Mono', monospace" : 'inherit', lineHeight: 1 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hierarchies */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 4 }}>
                <GitBranch size={18} style={{ color: colors.blue }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extracted Hierarchies</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: colors.blueBg, color: colors.blue, padding: '2px 10px', borderRadius: 8, border: `1px solid ${colors.blueBorder}` }}>{response.hierarchies.length}</span>
              </div>
              {response.hierarchies.map((h, i) => (
                <HierarchyCard key={i} hierarchy={h} index={i} />
              ))}

              {/* Bottom Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
                {/* Validation */}
                <div style={{ ...card, padding: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Data Quality Report</div>
                  
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSoft, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={13} style={{ color: colors.red }} /> Invalid Entries
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {response.invalid_entries.length > 0
                        ? response.invalid_entries.map((e, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 8, background: colors.redBg, border: `1px solid ${colors.redBorder}`, color: colors.red, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{e}</span>)
                        : <span style={{ fontSize: 12, color: colors.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} /> All entries are valid</span>}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSoft, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Copy size={13} style={{ color: colors.amber }} /> Duplicate Edges
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {response.duplicate_edges.length > 0
                        ? response.duplicate_edges.map((e, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 8, background: colors.amberBg, border: `1px solid ${colors.amberBorder}`, color: colors.amber, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{e}</span>)
                        : <span style={{ fontSize: 12, color: colors.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} /> No duplicates</span>}
                    </div>
                  </div>
                </div>

                {/* Session */}
                <div style={{ ...card, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Submitted By</div>
                    {[
                      { label: 'College Roll', value: response.college_roll_number },
                      { label: 'Email ID', value: response.email_id },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted }}>{r.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => { navigator.clipboard.writeText(JSON.stringify(response, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 20,
                      border: copied ? `1px solid ${colors.greenBorder}` : `1px solid ${colors.border}`,
                      background: copied ? colors.greenBg : colors.surfaceDim,
                      color: copied ? colors.green : colors.textSoft,
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'JSON Copied!' : 'Copy Full Response as JSON'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Idle State */
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...card, padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${colors.blueBg}, #f5f3ff)`, border: `1px solid ${colors.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.blue, marginBottom: 20 }}>
                <Database size={36} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 8 }}>Ready to Analyze</h3>
              <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 380, lineHeight: 1.7 }}>
                Enter your node relationships in the input above — like <code style={{ fontFamily: "'JetBrains Mono', monospace", background: colors.blueBg, padding: '1px 6px', borderRadius: 4, fontSize: 12, color: colors.blue }}>A→B, B→C</code> — then click <strong>Run Analysis</strong> to see the results.
              </p>
              <div style={{ display: 'flex', gap: 20, marginTop: 28 }}>
                {[
                  { icon: TreePine, label: 'Build Trees', desc: 'Extracts hierarchy' },
                  { icon: AlertTriangle, label: 'Find Cycles', desc: 'Detects loops' },
                  { icon: Layers, label: 'Analyze Depth', desc: 'Measures structure' },
                ].map((f, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.surfaceDim, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, margin: '0 auto 8px' }}>
                      <f.icon size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

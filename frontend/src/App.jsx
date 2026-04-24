import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RefreshCcw, AlertCircle, ChevronRight, ChevronDown,
  Layers, CheckCircle2, Copy, Trash2, Database, Sparkles
} from 'lucide-react';

const API_URL = 'http://localhost:5000/bfhl';

/* ─── Inline Style Objects ─── */
const s = {
  page: {
    minHeight: '100vh',
    padding: '60px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 720,
  },
  // Header
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 14px',
    borderRadius: 20,
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    color: '#2563eb',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 20,
  },
  h1: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 800,
    color: '#0a0a0a',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#737373',
    fontWeight: 500,
    marginBottom: 48,
  },
  // Card
  card: {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  textarea: {
    width: '100%',
    minHeight: 160,
    padding: 28,
    border: 'none',
    outline: 'none',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    color: '#171717',
    resize: 'none',
    lineHeight: 1.7,
    background: 'transparent',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderTop: '1px solid #f0f0f0',
    background: '#fafafa',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerLeft: {
    display: 'flex',
    gap: 8,
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  ghostBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    background: 'white',
    color: '#737373',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  trashBtn: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#ef4444',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  runBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  runBtnDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#d4d4d4',
    color: '#a3a3a3',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'not-allowed',
  },
  // Error
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    borderRadius: 12,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },
  // Summary
  summaryCard: {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: 16,
    padding: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  summaryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: '#dcfce7',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    padding: '16px 24px',
    background: '#fafafa',
    borderRadius: 12,
    border: '1px solid #f0f0f0',
  },
  statBlock: {
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  divider: {
    width: 1,
    height: 36,
    background: '#e5e5e5',
  },
  // Hierarchy Card
  hCard: {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  hHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #f5f5f5',
    background: '#fafafa',
  },
  hHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  hIcon: (isCycle) => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isCycle ? '#fef2f2' : '#eff6ff',
    color: isCycle ? '#ef4444' : '#2563eb',
    flexShrink: 0,
  }),
  hTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0a0a0a',
    marginBottom: 2,
  },
  hBadge: (isCycle) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: isCycle ? '#fef2f2' : '#eff6ff',
    color: isCycle ? '#dc2626' : '#2563eb',
  }),
  hBody: {
    padding: 24,
  },
  cyclePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '32px 0',
    color: '#a3a3a3',
  },
  // Tree
  treeItem: {
    paddingLeft: 20,
    marginTop: 6,
  },
  treeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
    width: 'fit-content',
  },
  treeLabel: (isBranch) => ({
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: isBranch ? 700 : 500,
    color: isBranch ? '#0a0a0a' : '#737373',
  }),
  // Section Header
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0a0a0a',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  // Bottom Grid
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginTop: 32,
  },
  infoCard: {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: 16,
    padding: 28,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 20,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  infoLabel: { fontSize: 13, fontWeight: 500, color: '#737373' },
  infoValue: { fontSize: 13, fontWeight: 700, color: '#171717' },
  tagError: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    marginRight: 6,
    marginBottom: 6,
  },
  tagWarn: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    background: '#fffbeb',
    border: '1px solid #fed7aa',
    color: '#d97706',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    marginRight: 6,
    marginBottom: 6,
  },
  muted: { fontSize: 12, color: '#a3a3a3', fontStyle: 'italic' },
  exportBtn: (copied) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 0',
    borderRadius: 10,
    border: copied ? '1px solid #bbf7d0' : '1px solid #e5e5e5',
    background: copied ? '#f0fdf4' : '#fafafa',
    color: copied ? '#16a34a' : '#525252',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 20,
    transition: 'all 0.2s',
  }),
  // Idle
  idle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  idleIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: '#f5f5f5',
    border: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d4d4d4',
    marginBottom: 20,
  },
  // Loading
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '80px 0',
  },
};

/* ─── Tree Component ─── */
const TreeItem = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Object.keys(children).length > 0;

  return (
    <div style={s.treeItem}>
      <div
        style={s.treeRow}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {hasChildren ? (
          <span style={{ color: '#2563eb' }}>
            {isOpen ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
          </span>
        ) : (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4d4d4', marginLeft: 4 }} />
        )}
        <span style={s.treeLabel(hasChildren)}>{label}</span>
      </div>

      {isOpen && hasChildren && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginLeft: 16, borderLeft: '2px solid #f0f0f0', paddingLeft: 4 }}>
          {Object.entries(children).map(([k, v]) => (
            <TreeItem key={k} label={k} children={v} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

/* ─── Hierarchy Card ─── */
const HierarchyCard = ({ hierarchy }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.hCard}>
    <div style={s.hHeader}>
      <div style={s.hHeaderLeft}>
        <div style={s.hIcon(hierarchy.has_cycle)}>
          <Layers size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div style={s.hTitle}>Root: {hierarchy.root}</div>
          <span style={s.hBadge(hierarchy.has_cycle)}>
            {hierarchy.has_cycle ? 'Cycle Detected' : `Depth ${hierarchy.depth}`}
          </span>
        </div>
      </div>
    </div>
    <div style={s.hBody}>
      {hierarchy.has_cycle ? (
        <div style={s.cyclePlaceholder}>
          <AlertCircle size={24} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Cannot visualize cyclic dependency</span>
        </div>
      ) : (
        <TreeItem label={hierarchy.root} children={hierarchy.tree[hierarchy.root] || {}} />
      )}
    </div>
  </motion.div>
);

/* ─── Main App ─── */
function App() {
  const [input, setInput] = useState('A->B, A->C, B->D, C->E');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = input.split(',').map(s => s.trim()).filter(s => s !== '');
      const res = await axios.post(API_URL, { data });
      setResponse(res.data);
    } catch {
      setError('Connection failed. Make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={s.badge}>
            <Sparkles size={13} />
            Graph Analytics Engine
          </div>
          <h1 style={s.h1}>Hierarchy Processor</h1>
          <p style={s.subtitle}>Transform flat relationships into structured trees instantly.</p>
        </header>

        {/* Input Card */}
        <div style={s.card}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter relationships (e.g., A->B, B->C)..."
            style={s.textarea}
            spellCheck="false"
          />
          <div style={s.footer}>
            <div style={s.footerLeft}>
              <button
                style={s.ghostBtn}
                onClick={() => { setInput('A->B, A->C, B->D, C->E'); setResponse(null); }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#171717'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#737373'; }}
              >
                Demo
              </button>
              <button
                style={s.ghostBtn}
                onClick={() => { setInput('A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H'); setResponse(null); }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#171717'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#737373'; }}
              >
                Stress Test
              </button>
            </div>
            <div style={s.footerRight}>
              <button style={s.trashBtn} onClick={() => { setInput(''); setResponse(null); setError(null); }} title="Clear">
                <Trash2 size={18} />
              </button>
              <button
                style={loading || !input.trim() ? s.runBtnDisabled : s.runBtn}
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseLeave={e => { if (!loading && input.trim()) e.currentTarget.style.background = '#2563eb'; }}
              >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={18} fill="white" />}
                {loading ? 'Processing...' : 'Run Process'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.errorBox}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </motion.div>
        )}

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.loadingWrap}>
              <RefreshCcw size={32} style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Analyzing Structure</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          ) : response ? (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

              {/* Summary */}
              <div style={s.summaryCard}>
                <div style={s.summaryLeft}>
                  <div style={s.summaryIcon}>
                    <CheckCircle2 size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a' }}>Analysis Complete</div>
                    <div style={{ fontSize: 13, color: '#737373', fontWeight: 500 }}>Data parsed successfully</div>
                  </div>
                </div>
                <div style={s.summaryStats}>
                  <div style={s.statBlock}>
                    <div style={s.statLabel}>Trees</div>
                    <div style={{ ...s.statVal, color: '#0a0a0a' }}>{response.summary.total_trees}</div>
                  </div>
                  <div style={s.divider} />
                  <div style={s.statBlock}>
                    <div style={s.statLabel}>Cycles</div>
                    <div style={{ ...s.statVal, color: '#ef4444' }}>{response.summary.total_cycles}</div>
                  </div>
                  <div style={s.divider} />
                  <div style={s.statBlock}>
                    <div style={s.statLabel}>Largest</div>
                    <div style={{ ...s.statVal, color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>{response.summary.largest_tree_root || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Hierarchies */}
              <div style={s.sectionHeader}>
                <Database size={16} style={{ color: '#2563eb' }} />
                <span style={s.sectionTitle}>Computed Hierarchies</span>
              </div>
              {response.hierarchies.map((h, i) => (
                <HierarchyCard key={i} hierarchy={h} />
              ))}

              {/* Bottom Grid */}
              <div style={s.grid2}>
                <div style={s.infoCard}>
                  <div style={s.infoTitle}>Validation Audit</div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#525252', marginBottom: 8 }}>Invalid Entries</div>
                    {response.invalid_entries.length > 0
                      ? response.invalid_entries.map((e, i) => <span key={i} style={s.tagError}>{e}</span>)
                      : <span style={s.muted}>No invalid formats</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#525252', marginBottom: 8 }}>Duplicate Edges</div>
                    {response.duplicate_edges.length > 0
                      ? response.duplicate_edges.map((e, i) => <span key={i} style={s.tagWarn}>{e}</span>)
                      : <span style={s.muted}>No duplicates found</span>}
                  </div>
                </div>

                <div style={{ ...s.infoCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={s.infoTitle}>Session Data</div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Roll Number</span>
                      <span style={s.infoValue}>{response.college_roll_number}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Email</span>
                      <span style={s.infoValue}>{response.email_id}</span>
                    </div>
                  </div>
                  <button
                    style={s.exportBtn(copied)}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied to Clipboard' : 'Export Raw JSON'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.idle}>
              <div style={s.idleIcon}>
                <Database size={32} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#171717', marginBottom: 6 }}>Ready to Parse</div>
              <p style={{ fontSize: 14, color: '#a3a3a3', maxWidth: 340 }}>
                Enter your graph relationships above and click Run to visualize the hierarchy.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

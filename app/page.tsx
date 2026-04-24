'use client';

import { useState, useMemo, useCallback } from 'react';

interface Hierarchy {
  root: string;
  tree: any;
  depth?: number;
  has_cycle?: boolean;
}

interface ApiResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string;
  };
}

// ─── SVG Tree Layout Engine ───
interface TreeNode {
  name: string;
  children: TreeNode[];
  x: number;
  y: number;
}

function buildTreeNodes(name: string, subtree: any): TreeNode {
  const children = Object.keys(subtree).sort().map((child) =>
    buildTreeNodes(child, subtree[child])
  );
  return { name, children, x: 0, y: 0 };
}

function layoutTree(node: TreeNode, depth: number = 0, xOffset: { value: number } = { value: 0 }): void {
  node.y = depth;
  if (node.children.length === 0) {
    node.x = xOffset.value;
    xOffset.value += 1;
  } else {
    node.children.forEach((child) => layoutTree(child, depth + 1, xOffset));
    const first = node.children[0].x;
    const last = node.children[node.children.length - 1].x;
    node.x = (first + last) / 2;
  }
}

function collectNodes(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap(collectNodes)];
}

function collectEdges(node: TreeNode): { from: TreeNode; to: TreeNode }[] {
  return [
    ...node.children.map((child) => ({ from: node, to: child })),
    ...node.children.flatMap(collectEdges),
  ];
}

// ─── SVG Tree Component ───
function TreeDiagram({ root, subtree }: { root: string; subtree: any }) {
  const { nodes, edges, width, height } = useMemo(() => {
    const tree = buildTreeNodes(root, subtree);
    layoutTree(tree);
    const allNodes = collectNodes(tree);
    const allEdges = collectEdges(tree);

    const maxX = Math.max(...allNodes.map((n) => n.x));
    const maxY = Math.max(...allNodes.map((n) => n.y));

    return {
      nodes: allNodes,
      edges: allEdges,
      width: (maxX + 1) * 72,
      height: (maxY + 1) * 64,
    };
  }, [root, subtree]);

  const padX = 36;
  const padY = 32;
  const svgW = width + padX * 2;
  const svgH = height + padY * 2;

  const toSvgX = (x: number) => x * 72 + padX;
  const toSvgY = (y: number) => y * 64 + padY;

  return (
    <div className="tree-svg-container">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={Math.min(svgW, 520)}
        height={Math.min(svgH, 400)}
        xmlns="http://www.w3.org/2000/svg"
      >
        {edges.map((e, i) => {
          const x1 = toSvgX(e.from.x);
          const y1 = toSvgY(e.from.y);
          const x2 = toSvgX(e.to.x);
          const y2 = toSvgY(e.to.y);
          const midY = (y1 + y2) / 2;
          return (
            <path
              key={i}
              className="tree-edge"
              d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
              style={{
                animation: `fadeIn 0.4s ease-out ${0.1 * i}s both`,
              }}
            />
          );
        })}
        {nodes.map((n, i) => {
          const cx = toSvgX(n.x);
          const cy = toSvgY(n.y);
          return (
            <g
              key={n.name + i}
              style={{
                animation: `scaleIn 0.3s ease-out ${0.05 * i}s both`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              <circle
                className="tree-node-circle"
                cx={cx}
                cy={cy}
                r={16}
              />
              <text className="tree-node-text" x={cx} y={cy}>
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Icons ───
function IconTree() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 17H4" /><path d="M20 17h-4" /><path d="M12 11H8" /><path d="M16 11h-4" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconCycle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ─── Main Page Component ───
export default function Home() {
  const [input, setInput] = useState<string>(
    '["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->H", "G->I", "hello", "1->2", "A->"]'
  );
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = JSON.parse(input);
      } catch (e) {
        throw new Error('Invalid JSON format. Please enter a valid JSON array of strings.');
      }

      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Request failed');
      }

      const result = await res.json();
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <main>
      {/* ── Header ── */}
      <header>
        <div className="badge">SRM Challenge</div>
        <h1>Hierarchy Processor</h1>
        <p className="subtitle">
          Parse directed edges, detect cycles, and visualize tree structures from relationship data.
        </p>
      </header>

      <div className="container">
        {/* ── Input ── */}
        <section className="input-section">
          <div className="input-group">
            <label htmlFor="data-input">Input edges as a JSON array</label>
            <textarea
              id="data-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='["A->B", "C->D", "D->E"]'
              spellCheck={false}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <IconSend /> Process
                  </>
                )}
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Ctrl+Enter
              </span>
            </div>
          </div>
          {error && (
            <div
              className="cycle-message"
              style={{ marginTop: '0.75rem', animation: 'fadeInUp 0.3s ease-out both' }}
            >
              <IconAlert /> {error}
            </div>
          )}
        </section>

        {/* ── Initial State ── */}
        {!response && !loading && (
          <div className="initial-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2" />
              <circle cx="6" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
              <line x1="12" y1="7" x2="6" y2="10" />
              <line x1="12" y1="7" x2="18" y2="10" />
              <line x1="6" y1="14" x2="6" y2="17" />
              <line x1="18" y1="14" x2="18" y2="17" />
            </svg>
            <p>Enter relationship edges above and click Process to visualize your hierarchy.</p>
          </div>
        )}

        {/* ── Results ── */}
        {response && (
          <section className="results-container">
            {/* Summary Stats */}
            <div className="summary-stats animate-in">
              <div className="stat-item">
                <span className="stat-value">{response.summary.total_trees}</span>
                <span className="stat-label">Trees</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{response.summary.total_cycles}</span>
                <span className="stat-label">Cycles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {response.summary.largest_tree_root || '—'}
                </span>
                <span className="stat-label">Largest Root</span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="results-grid">
              {/* Hierarchies Card */}
              <div className="card animate-in animate-in-delay-1">
                <h3>
                  <IconTree /> Hierarchies
                </h3>
                <div className="hierarchies-list">
                  {response.hierarchies.map((h, i) => (
                    <div key={i} className="hierarchy-group">
                      <div className="hierarchy-header">
                        <span className="hierarchy-root">
                          {h.has_cycle ? <IconCycle /> : <IconCheck />}
                          {' '}Root: {h.root}
                        </span>
                        {h.has_cycle && (
                          <span className="tag tag-cycle">Cycle</span>
                        )}
                        {h.depth != null && !h.has_cycle && (
                          <span className="tag tag-depth">Depth {h.depth}</span>
                        )}
                      </div>

                      {h.has_cycle ? (
                        <div className="cycle-message">
                          <IconCycle />
                          Circular dependency detected — cannot render tree
                        </div>
                      ) : (
                        <TreeDiagram root={h.root} subtree={h.tree[h.root]} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Card */}
              <div className="card animate-in animate-in-delay-2">
                <h3>
                  <IconAlert /> Validation
                </h3>

                <div style={{ marginBottom: '1.25rem' }}>
                  <h4>
                    Invalid Entries ({response.invalid_entries.length})
                  </h4>
                  {response.invalid_entries.length > 0 ? (
                    <ul className="error-list">
                      {response.invalid_entries.map((entry, i) => (
                        <li key={i}>{entry}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No invalid entries found</p>
                  )}
                </div>

                <div>
                  <h4>
                    Duplicate Edges ({response.duplicate_edges.length})
                  </h4>
                  {response.duplicate_edges.length > 0 ? (
                    <ul className="duplicate-list">
                      {response.duplicate_edges.map((entry, i) => (
                        <li key={i}>{entry}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No duplicates detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Info Footer */}
            <footer className="user-info animate-in animate-in-delay-3">
              <div>
                <strong>User ID:</strong> {response.user_id}
              </div>
              <div>
                <strong>Email:</strong> {response.email_id}
              </div>
              <div>
                <strong>Roll No:</strong> {response.college_roll_number}
              </div>
            </footer>
          </section>
        )}
      </div>
    </main>
  );
}

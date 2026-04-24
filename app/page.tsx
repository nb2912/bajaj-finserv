'use client';

import { useState } from 'react';

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

export default function Home() {
  const [input, setInput] = useState<string>('["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->H", "G->I", "hello", "1->2", "A->"]');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = JSON.parse(input);
      } catch (e) {
        throw new Error('Invalid JSON format. Please enter an array of strings.');
      }

      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch');
      }

      const result = await res.json();
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (node: string, subtree: any) => {
    const children = Object.keys(subtree);
    return (
      <div key={node} className="tree-node">
        <span className="node-label">{node}</span>
        {children.length > 0 && (
          <div className="tree-children">
            {children.map((child) => renderTree(child, subtree[child]))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main>
      <header>
        <h1>SRM Full Stack Challenge</h1>
        <p className="subtitle">Hierarchical Relationship Processor & API Insight Generator</p>
      </header>

      <div className="container">
        <section className="input-section">
          <div className="input-group">
            <label htmlFor="data-input">Node Data (JSON Array)</label>
            <textarea
              id="data-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='["A->B", "C->D"]'
            />
            <button 
              className="btn-submit" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <div className="loading-spinner" /> : 'Process Hierarchy'}
            </button>
          </div>
          {error && <p style={{ color: 'var(--error)', marginTop: '1rem', fontWeight: 'bold' }}>{error}</p>}
        </section>

        {response && (
          <section className="results-container">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value">{response.summary.total_trees}</span>
                <span className="stat-label">Total Trees</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{response.summary.total_cycles}</span>
                <span className="stat-label">Total Cycles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{response.summary.largest_tree_root || 'N/A'}</span>
                <span className="stat-label">Largest Tree</span>
              </div>
            </div>

            <div className="results-grid">
              <div className="card">
                <h3>Hierarchies</h3>
                <div className="hierarchies-list">
                  {response.hierarchies.map((h, i) => (
                    <div key={i} style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem' }}>Group: {h.root}</strong>
                        {h.has_cycle && <span className="tag tag-cycle">Cycle Detected</span>}
                        {h.depth && <span className="tag tag-depth">Depth: {h.depth}</span>}
                      </div>
                      <div className="tree-container">
                        {h.has_cycle ? (
                          <div style={{ color: 'var(--error)', fontStyle: 'italic', marginLeft: '1rem' }}>
                            Tree empty due to circular dependency
                          </div>
                        ) : (
                          renderTree(h.root, h.tree[h.root])
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Validation Details</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>INVALID ENTRIES ({response.invalid_entries.length})</h4>
                  <ul className="error-list">
                    {response.invalid_entries.length > 0 ? (
                      response.invalid_entries.map((entry, i) => <li key={i}>{entry}</li>)
                    ) : (
                      <li style={{ background: 'transparent', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>DUPLICATE EDGES ({response.duplicate_edges.length})</h4>
                  <ul className="duplicate-list">
                    {response.duplicate_edges.length > 0 ? (
                      response.duplicate_edges.map((entry, i) => <li key={i}>{entry}</li>)
                    ) : (
                      <li style={{ background: 'transparent', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <footer className="user-info">
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

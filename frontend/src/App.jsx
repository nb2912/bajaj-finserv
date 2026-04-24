import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Trees, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  Mail,
  User,
  Hash,
  Activity,
  Layers,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  Copy,
  Terminal,
  ExternalLink,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_URL = 'http://localhost:5000/bfhl';

// Mesh Background Component
const MeshBackground = () => (
  <div className="bg-mesh">
    <div className="w-[600px] h-[600px] bg-indigo-500/20 top-[-200px] left-[-100px]" />
    <div className="w-[500px] h-[500px] bg-pink-500/20 bottom-[-100px] right-[-100px]" />
    <div className="w-[400px] h-[400px] bg-emerald-500/10 top-[20%] right-[10%]" />
  </div>
);

const TreeItem = ({ label, children, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Object.keys(children).length > 0;

  return (
    <div className={`ml-6 my-2 ${depth > 0 ? 'node-link' : ''}`}>
      <motion.div 
        whileHover={{ x: 4 }}
        className={`flex items-center gap-2 cursor-pointer transition-all p-2 rounded-xl border border-transparent ${hasChildren ? 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <div className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Code2 size={12} />
            </div>
          )}
          <span className={`px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono tracking-tight ${hasChildren ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
            {label}
          </span>
        </div>
      </motion.div>
      
      {isOpen && hasChildren && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          {Object.entries(children).map(([childLabel, grandChildren]) => (
            <TreeItem key={childLabel} label={childLabel} children={grandChildren} depth={depth + 1} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

const HierarchyCard = ({ hierarchy }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass overflow-hidden group"
    >
      <div className={`h-1.5 w-full ${hierarchy.has_cycle ? 'bg-amber-500' : 'bg-indigo-600'}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${hierarchy.has_cycle ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
              <Layers size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xl flex items-center gap-2">
                Root <span className="text-indigo-600 dark:text-indigo-400 font-mono">{hierarchy.root}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                {hierarchy.has_cycle ? 'Cyclic Structure' : `Depth: ${hierarchy.depth} Levels`}
              </p>
            </div>
          </div>
          {hierarchy.has_cycle && (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/20 uppercase tracking-widest">
              Cycle Detected
            </span>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 overflow-x-auto min-h-[120px]">
          {hierarchy.has_cycle ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 py-8 justify-center">
              <AlertCircle size={32} strokeWidth={1} className="text-amber-500 opacity-50" />
              <span className="text-sm font-medium italic">Visualization restricted for cyclic graphs</span>
            </div>
          ) : (
            <TreeItem label={hierarchy.root} children={hierarchy.tree[hierarchy.root] || {}} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

function App() {
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Parse input for live preview
  const livePreview = useMemo(() => {
    if (!input.trim()) return { nodes: 0, edges: 0 };
    const pairs = input.split(',').map(s => s.trim()).filter(s => s.includes('->'));
    const nodes = new Set();
    pairs.forEach(p => {
      const [from, to] = p.split('->').map(s => s.trim());
      if (from) nodes.add(from);
      if (to) nodes.add(to);
    });
    return { nodes: nodes.size, edges: pairs.length };
  }, [input]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = input.split(',').map(s => s.trim()).filter(s => s !== '');
      const res = await axios.post(API_URL, { data });
      setResponse(res.data);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981']
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection failed. Ensure backend is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    // Could add a toast here
  };

  return (
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      <MeshBackground />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 flex flex-col gap-8 md:gap-12">
        {/* Navbar-style Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"
            >
              <Zap size={28} fill="currentColor" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-[900] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400">
                Hierarchy<span className="font-light">Engine</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Online</span>
                </div>
                <span className="text-xs text-slate-400 font-medium ml-2">SRM Full-Stack Pro • v2.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <AnimatePresence mode="wait">
              {response && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex glass px-6 py-3 items-center gap-6"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operator</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nihal Basaniwal</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">164</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-4 glass hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 rounded-2xl"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="glass p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal size={80} strokeWidth={1} />
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <Terminal size={22} className="text-indigo-500" />
                  Input Stream
                </h2>
                <button 
                  onClick={() => setInput('A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->I')}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:opacity-80 flex items-center gap-1"
                >
                  <RefreshCcw size={10} /> Load Demo
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Format: Parent->Child, Child->Grandchild...'
                    className="w-full h-44 resize-none font-mono text-sm leading-relaxed border-transparent focus:border-indigo-500/30"
                    required
                  />
                  
                  {/* Live Mini Preview */}
                  <div className="absolute bottom-4 right-4 flex gap-3">
                    <div className="px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex items-center gap-1.5">
                      <Layers size={10} className="text-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{livePreview.nodes} Nodes</span>
                    </div>
                    <div className="px-2 py-1 bg-pink-500/10 rounded-md border border-pink-500/20 flex items-center gap-1.5">
                      <Zap size={10} className="text-pink-500" />
                      <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400">{livePreview.edges} Edges</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full group"
                >
                  {loading ? (
                    <RefreshCcw className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Zap size={20} className="group-hover:animate-pulse" />
                      Analyze & Map
                    </>
                  )}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex gap-3"
                  >
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                  </motion.div>
                )}
              </form>
            </section>

            {response && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-5 border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Trees</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black">{response.summary.total_trees}</span>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  </div>
                  <div className="glass p-5 border-l-4 border-amber-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cycles</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black">{response.summary.total_cycles}</span>
                      <Activity size={18} className="text-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="glass p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">System Logs</h3>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 tracking-tighter">Rejected (Format Mismatch)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {response.invalid_entries.length > 0 ? response.invalid_entries.map((e, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[10px] font-mono border border-red-500/10">{e}</span>
                        )) : <span className="text-[10px] text-slate-400 italic">No errors found</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 tracking-tighter">Resolved Conflicts</span>
                      <div className="flex flex-wrap gap-1.5">
                        {response.duplicate_edges.length > 0 ? response.duplicate_edges.map((e, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-500/10 text-slate-500 rounded text-[10px] font-mono border border-slate-500/10">{e}</span>
                        )) : <span className="text-[10px] text-slate-400 italic">No conflicts</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {!response && !loading ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] glass flex items-center justify-center flex-col gap-6 text-slate-300 dark:text-slate-700"
                >
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                    <LayoutDashboard size={48} strokeWidth={1} />
                  </div>
                  <div className="text-center px-8">
                    <p className="text-slate-800 dark:text-slate-200 font-black text-xl mb-2 tracking-tight">System Ready</p>
                    <p className="text-sm max-w-xs mx-auto font-medium text-slate-400">Enter a stream of node relationships to visualize hierarchies, detect cycles, and build data trees.</p>
                  </div>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] glass flex items-center justify-center flex-col gap-8"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-[6px] border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 dark:text-slate-100 font-black text-lg tracking-tight">Processing Graph Data</p>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mt-2">Running Algorithms...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-6 pb-20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Trees size={20} />
                      </div>
                      <h2 className="text-2xl font-[900] text-slate-800 dark:text-slate-100 tracking-tight">Hierarchy Maps</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-black shadow-md shadow-indigo-100 dark:shadow-none uppercase tracking-wider">
                        {response.hierarchies.length} Components
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {response.hierarchies.map((h, index) => (
                      <HierarchyCard key={index} hierarchy={h} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="py-12 border-t border-slate-200 dark:border-slate-800 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-indigo-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">SRM Engineering Labs &copy; 2026</span>
            </div>
            <div className="flex gap-6 text-xs font-bold text-slate-500">
              <a href="#" className="hover:text-indigo-500 transition-colors">API Docs</a>
              <a href="#" className="hover:text-indigo-500 transition-colors">Security</a>
              <a href="#" className="hover:text-indigo-500 transition-colors">Performance Reports</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;


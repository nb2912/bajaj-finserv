import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  RefreshCcw,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Layers,
  Terminal,
  Zap,
  CheckCircle2,
  Cpu
} from 'lucide-react';

const API_URL = 'http://localhost:5000/bfhl';

const TreeItem = ({ label, children, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Object.keys(children).length > 0;

  return (
    <div className={`ml-8 my-1.5 ${depth > 0 ? 'node-link' : ''}`}>
      <motion.div
        whileHover={{ x: 3 }}
        className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          <span className="text-gray-400">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <div className="w-2 h-2 rounded-full bg-blue-500/20 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
          </div>
        )}
        <span className={`text-xs font-mono tracking-tight ${
          hasChildren ? 'font-bold text-blue-700' : 'text-gray-600'
        }`}>
          {label}
        </span>
      </motion.div>

      {isOpen && hasChildren && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
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

const HierarchyCard = ({ hierarchy }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-8 mb-6"
  >
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex-center ${hierarchy.has_cycle ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>
          <Layers size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900">Hierarchy: {hierarchy.root}</h3>
          <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
            {hierarchy.has_cycle ? 'Warning: Cycle Found' : `Success: Depth ${hierarchy.depth}`}
          </p>
        </div>
      </div>
      {hierarchy.has_cycle && (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
          Cycle
        </span>
      )}
    </div>

    <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
      {hierarchy.has_cycle ? (
        <div className="flex-center flex-col gap-2 py-6 text-gray-400">
          <AlertCircle size={20} />
          <span className="text-[11px] font-medium uppercase tracking-wider">Visualization Disabled</span>
        </div>
      ) : (
        <TreeItem label={hierarchy.root} children={hierarchy.tree[hierarchy.root] || {}} />
      )}
    </div>
  </motion.div>
);

function App() {
  const [input, setInput] = useState('A->B, A->C, B->D, C->E');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = input.split(',').map(s => s.trim()).filter(s => s !== '');
      const res = await axios.post(API_URL, { data });
      setResponse(res.data);
    } catch (err) {
      setError('Connection failed. Please ensure the backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-sm px-6 py-20 md:py-32">
        
        {/* Header */}
        <header className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <Cpu size={12} strokeWidth={3} />
            Data Hierarchy Processor
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight"
          >
            Structure your data.<br />
            <span className="text-gray-400">Instantly.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed"
          >
            A minimal tool to convert relationship strings into structured trees and detect complex cycles.
          </motion.p>
        </header>

        {/* Action Area */}
        <section className="mb-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: A->B, B->C..."
                className="h-40 shadow-sm"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setInput('A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X')}
                  className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                >
                  Load Demo
                </button>
                <div className="h-4 w-[1px] bg-gray-200" />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>{loading ? 'Processing' : 'Process'}</span>
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-bold px-2"
              >
                <AlertCircle size={14} strokeWidth={3} />
                {error}
              </motion.div>
            )}
          </form>
        </section>

        {/* Results Flow */}
        <AnimatePresence mode="wait">
          {response && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Summary Bar */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 px-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Analysis Complete</h2>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Trees</p>
                    <p className="text-sm font-black text-gray-900">{response.summary.total_trees}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Cycles</p>
                    <p className="text-sm font-black text-amber-500">{response.summary.total_cycles}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Best Root</p>
                    <p className="text-sm font-black text-blue-600 font-mono">{response.summary.largest_tree_root || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Hierarchy Cards */}
              <div className="space-y-2">
                {response.hierarchies.map((h, index) => (
                  <HierarchyCard key={index} hierarchy={h} />
                ))}
              </div>

              {/* Data Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="glass p-8 border-dashed border-gray-200 shadow-none hover:shadow-none">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Validation Summary</h4>
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tight">Invalid Entries</p>
                      <div className="flex flex-wrap gap-2">
                        {response.invalid_entries.length > 0 ? response.invalid_entries.map((e, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold font-mono border border-red-100">{e}</span>
                        )) : <span className="text-[10px] text-gray-400 italic">No errors found.</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tight">Duplicate Edges</p>
                      <div className="flex flex-wrap gap-2">
                        {response.duplicate_edges.length > 0 ? response.duplicate_edges.map((e, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold font-mono border border-amber-100">{e}</span>
                        )) : <span className="text-[10px] text-gray-400 italic">No duplicates found.</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass p-8 border-dashed border-gray-200 shadow-none hover:shadow-none flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Identity Verification</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 font-medium">Roll Number</span>
                      <span className="text-xs font-black text-gray-900">{response.college_roll_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 font-medium">Email Address</span>
                      <span className="text-xs font-black text-gray-900">{response.email_id}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Session UUID</span>
                      <span className="text-[10px] font-mono text-gray-500">{response.user_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Empty State */}
        {!response && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center flex-col gap-6 py-24 border-2 border-dashed border-gray-100 rounded-[32px]"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex-center text-gray-200 shadow-sm">
              <Terminal size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 mb-1">Engine Ready</p>
              <p className="text-xs text-gray-400 font-medium">Waiting for hierarchical data input...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;

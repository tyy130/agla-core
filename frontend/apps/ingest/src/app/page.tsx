"use client";

import { useState, useEffect } from "react";
import { Upload, Network, Zap, RefreshCw, Database, Search, Shield, ArrowRight, Folder } from "lucide-react";

export default function IngestPage() {
  const [ingesting, setIngesting] = useState(false);
  const [selectedTier, setSelectedTier] = useState("essential");
  const [stats, setStats] = useState({ indexed: false, doc_count: 0 });

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/status`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Status fetch failed", e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleWorkspaceInit = async () => {
    setIngesting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/initialize?tier=${selectedTier}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        fetchStatus();
        alert(`Success: ${data.message}`);
      } else {
        alert(data.message || "No indexable documents found.");
      }
    } catch (e) {
      alert("Error: Ingestion server unreachable.");
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Knowledge Base</h1>
          <p className="text-sm text-gray-500 font-mono">DATA_PIPELINE: ACTIVE // SCAN_MODE: RECURSIVE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Main Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Folder size={18} className="text-blue-400" /> Source Configuration
              </h2>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-gray-400">
                /home/tyler/Desktop
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['lite', 'essential', 'comprehensive'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    selectedTier === t 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-transparent border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`font-mono text-xs uppercase mb-2 ${selectedTier === t ? 'text-blue-400' : 'text-gray-500'}`}>
                    Tier: {t}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    {t === 'lite' && "Vector-only. Fast."}
                    {t === 'essential' && "Vector + Light Graph."}
                    {t === 'comprehensive' && "Full Graph Traversal."}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleWorkspaceInit}
              disabled={ingesting}
              className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {ingesting ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
              {ingesting ? "EXECUTING SCAN..." : "INITIALIZE SCAN"}
            </button>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Chunks</h3>
              <Database size={16} className="text-green-400" />
            </div>
            <div className="text-5xl font-mono font-bold text-white tracking-tighter">
              {stats.doc_count}
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-gray-500">Index Status</span>
              <span className={`font-mono ${stats.indexed ? 'text-green-400' : 'text-yellow-500'}`}>
                {stats.indexed ? "READY" : "WAITING"}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center py-12 text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all cursor-pointer">
            <Upload size={24} className="mb-2" />
            <span className="text-xs font-mono uppercase">Drag File to Upload</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { MessageSquare, Database, ArrowRight, Activity, Shield, Cpu, ExternalLink } from "lucide-react";

export default function PlatformHome() {
  return (
    <div className="flex flex-col h-full p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
          <p className="text-sm text-gray-500 font-mono">INFRA: AEGIS // STATUS: OPERATIONAL</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium uppercase tracking-wider">
            <Activity size={12} /> Online
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
            <Shield size={12} /> Secured
          </div>
        </div>
      </div>

      {/* Primary Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/chat" className="group block">
          <div className="h-full p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">AGLA Cortex</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Advanced reasoning engine with graph-enhanced retrieval. Execute complex queries across your enterprise knowledge base.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-blue-400 transition-colors">
              Launch Interface <ArrowRight size={12} />
            </div>
          </div>
        </a>

        <a href="http://localhost:3002" className="group block">
          <div className="h-full p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-green-500/30 hover:bg-green-500/[0.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Knowledge Base</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Ingestion pipeline management. Configure folder scans, monitor indexing queues, and manage vector schemas.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-green-400 transition-colors">
              Manage Data <ArrowRight size={12} />
            </div>
          </div>
        </a>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-widest">Active Model</span>
            <Cpu size={14} />
          </div>
          <div className="text-2xl font-mono text-white">GPT-4o-Hybrid</div>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-widest">Latency (P99)</span>
            <Activity size={14} />
          </div>
          <div className="text-2xl font-mono text-white">124ms</div>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-widest">Index Size</span>
            <Database size={14} />
          </div>
          <div className="text-2xl font-mono text-white">2.4 GB</div>
        </div>
      </div>
    </div>
  );
}
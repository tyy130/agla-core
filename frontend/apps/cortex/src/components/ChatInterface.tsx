"use client";

import { useState } from "react";
import { Send, Cpu, Network, RefreshCw, MessageCircle, User, Zap } from "lucide-react";

export default function ChatInterface() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("user_123");

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = { role: "user", content: query };
    setMessages([...messages, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, user_id: userId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.answer, 
        meta: { 
          path: data.path_taken, 
          cost: data.cost_estimate,
          segment: data.user_segment,
          sources: data.sources 
        } 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not reach AGLA Core." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-8 relative min-h-full">
      <div className="z-10 w-full flex items-center justify-between font-mono text-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageCircle size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">AGLA Cortex</h1>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-[10px] uppercase font-bold text-gray-400">
                <User size={12} className="text-purple-400" /> {userId}
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-[10px] uppercase font-bold text-gray-400 border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                <Zap size={12} className="text-yellow-400" /> Hybrid Mode
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
              <div className="p-8 rounded-full bg-white/5 border border-white/5 animate-pulse shadow-2xl">
                <Network size={64} className="text-blue-500/30" />
              </div>
              <p className="font-bold tracking-widest text-[10px] uppercase text-gray-500">Cortex Link Established</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
               <div className={`max-w-[80%] p-5 rounded-[24px] ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'glass-panel shadow-2xl border-white/5'}`}>
                  {msg.content}
               </div>
               {msg.meta && (
                 <div className="flex flex-wrap gap-4 mt-3 text-[9px] uppercase tracking-[0.1em] text-gray-500 px-3 font-black">
                    <span className="flex items-center gap-1 text-purple-400"><User size={10}/> {msg.meta.segment}</span>
                    <span className="flex items-center gap-1"><Cpu size={10}/> {msg.meta.path}</span>
                    <span className="flex items-center gap-1 text-green-500">$ {msg.meta.cost}</span>
                 </div>
               )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start">
               <div className="glass-panel p-5 rounded-[24px] animate-pulse text-gray-500 flex items-center gap-3 border-white/5">
                  <RefreshCw className="animate-spin" size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Reasoning...</span>
               </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="glass-panel rounded-[24px] p-2 flex gap-2 border-white/10 focus-within:border-blue-500/50 transition-all duration-300 shadow-2xl">
             <input 
               className="flex-1 bg-transparent border-none outline-none px-6 text-white placeholder:text-gray-600 text-sm font-medium"
               placeholder="Query intelligence OS..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <button 
               onClick={handleSend}
               className="p-4 bg-white text-black hover:bg-gray-200 rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95">
               <Send size={20} />
             </button>
          </div>
        </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { LayoutGrid, MessageSquare, Database, Shield, Zap } from "lucide-react";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: "Platform Home", href: "https://tacticdev.com", icon: LayoutGrid },
    { name: "AGLA Intelligence", href: "https://agla.tacticdev.com", icon: Zap },
    { name: "Knowledge Base", href: "https://ingest.forgeops.io", icon: Database },
    { name: "Control Center", href: "https://control.forgeops.io", icon: Shield },
  ];

  // We only care about origin on the client
  const currentOrigin = mounted ? window.location.origin : '';

  return (
    <div className="w-72 border-r border-white/5 p-6 flex flex-col gap-2 bg-black/40 backdrop-blur-3xl h-full shrink-0">
      <div className="flex items-center gap-3 px-2 py-8 mb-8 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 p-1.5">
          <img src="/logo-icon-transparent.png" alt="TacticDev Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none uppercase">TacticDev</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Enterprise OS</p>
        </div>
      </div>
      
      <div className="flex-1 space-y-1">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Navigation</p>
        {links.map((link) => {
          const Icon = link.icon;
          // Calculate active state ONLY after mount to prevent hydration mismatch
          const isActive = mounted && currentOrigin === link.href;
          
          return (
            <a 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner shadow-blue-500/10" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-400" : "group-hover:text-white transition-colors"} />
              <span className="font-semibold text-sm">{link.name}</span>
            </a>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 px-2">
        <div className="p-4 rounded-2xl glass-panel bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Shield size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">Aegis</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            Proprietary data shield with end-to-end encryption via OCI Vault.
          </p>
        </div>
      </div>
    </div>
  );
}
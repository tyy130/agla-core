"use client";
import { useState, useEffect } from "react";
import { LayoutGrid, MessageSquare, Database, Shield, Zap, LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: "Platform Home", href: "/", icon: LayoutGrid },
    { name: "AGLA Intelligence", href: "/chat", icon: Zap },
    { name: "Knowledge Base", href: "/ingest", icon: Database },
    { name: "Control Center", href: "/control", icon: Shield },
  ];

  // We only care about origin on the client
  const currentOrigin = mounted ? window.location.origin : '';

  return (
    <div className="w-72 border-r border-white/5 p-6 flex flex-col gap-2 bg-black/40 backdrop-blur-3xl h-full shrink-0">
      <div className="flex items-center gap-3 px-2 py-8 mb-8 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 p-1.5">
          {/* Replaced img with Icon for stability if asset missing */}
          <Shield className="text-white w-full h-full" /> 
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

      <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
        {status === "authenticated" ? (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                   {session.user?.name?.[0] || "U"}
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">{session.user?.name}</span>
                   <span className="text-[10px] text-gray-500">{session.user?.email}</span>
                </div>
             </div>
             <button 
               onClick={() => signOut()}
               className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-500">
                <LogOut size={14} />
             </button>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
             <User size={14} /> Sign In
          </button>
        )}

        <div className="px-2">
            <div className="flex items-center gap-2 mb-2 text-blue-400 opacity-60">
                <Shield size={10} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Aegis Secure</span>
            </div>
        </div>
      </div>
    </div>
  );
}

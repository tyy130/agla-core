import { Shield, CreditCard, Users, Activity, CheckCircle, AlertCircle } from "lucide-react";

export default function ControlPage() {
  return (
    <div className="flex flex-col h-full p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Control Center</h1>
          <p className="text-sm text-gray-500 font-mono">ORG_ID: TACTIC_DEV_001 // PLAN: ENTERPRISE</p>
        </div>
        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Shield size={14} /> Admin Access
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Spend</span>
          <div className="text-3xl font-mono text-white">$1,240.50</div>
          <div className="text-xs text-green-400 font-mono">+12% vs last month</div>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">API Requests</span>
          <div className="text-3xl font-mono text-white">845.2K</div>
          <div className="text-xs text-blue-400 font-mono">99.99% Success</div>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Users</span>
          <div className="text-3xl font-mono text-white">12</div>
          <div className="text-xs text-gray-500 font-mono">3 Pending Invites</div>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Storage</span>
          <div className="text-3xl font-mono text-white">45 GB</div>
          <div className="text-xs text-yellow-500 font-mono">45% of Quota</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* User Management */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Team Management
            </h2>
            <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Add User
            </button>
          </div>
          
          <div className="space-y-1">
            {[
              { name: "Tyler Durden", role: "Admin", status: "Active", email: "tyler@tactic.dev" },
              { name: "Sarah Connor", role: "Editor", status: "Active", email: "sarah@tactic.dev" },
              { name: "John Wick", role: "Viewer", status: "Offline", email: "john@tactic.dev" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-mono text-gray-400">{user.role}</span>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {user.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-6">
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Activity size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Health Check</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { service: "Vector DB (Qdrant)", status: "Operational", lat: "12ms" },
                { service: "Graph DB (Falkor)", status: "Operational", lat: "45ms" },
                { service: "Ingestion Pipeline", status: "Idle", lat: "-" },
                { service: "Aegis (Vault)", status: "Secured", lat: "80ms" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{s.service}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-600">{s.lat}</span>
                    <CheckCircle size={14} className="text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Alerts</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Usage for "GPT-4o-Hybrid" is approaching 80% of monthly quota. Consider upgrading tier before EOM.
            </p>
            <button className="w-full py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold rounded hover:bg-yellow-500/20 transition-colors">
              Increase Quota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

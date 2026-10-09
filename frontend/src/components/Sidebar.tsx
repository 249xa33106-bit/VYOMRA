import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  GitFork, 
  ShieldAlert, 
  Radar, 
  History, 
  Sliders, 
  FileText, 
  Settings as SettingsIcon,
  Home,
  Terminal
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeScanId?: string;
  onGoToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  activeScanId,
  onGoToLanding 
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'investigate', label: 'URL Investigation', icon: Search, badge: 'CORE' },
    { id: 'graph', label: 'Attack DNA Graph', icon: GitFork, badge: activeScanId ? 'ACTIVE' : undefined },
    { id: 'brand', label: 'Brand Impersonation', icon: ShieldAlert },
    { id: 'intel', label: 'Threat Intelligence', icon: Radar },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders, badge: 'SANDBOX' },
    { id: 'reports', label: 'Reports & Vault', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0a1220] border-r border-slate-800 flex flex-col h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white tracking-wider text-base">PHANTOM</span>
              <span className="text-cyan-400 font-black text-base">X</span>
            </div>
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Autonomous Cyber Defense
            </div>
          </div>
        </div>

        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            title="Return to Public Landing Page"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          Investigation Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.badge === 'ACTIVE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : item.badge === 'SANDBOX'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Panel */}
      <div className="p-4 border-t border-slate-800 bg-[#070d17]/80">
        <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
          <span className="text-slate-400">ENGINE STATUS</span>
          <span className="flex items-center text-emerald-400 space-x-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>READY</span>
          </span>
        </div>
        <div className="space-y-1 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>Deterministic Matrix</span>
            <span className="text-slate-300">v1.4.2</span>
          </div>
          <div className="flex justify-between">
            <span>SSRF Egress Shield</span>
            <span className="text-emerald-400 font-semibold">ENFORCED</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

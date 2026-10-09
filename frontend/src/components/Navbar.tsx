import React from 'react';
import { ShieldCheck, Cpu, Database, LogOut, Shield, UserCheck, Flame } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  activeScanId?: string;
  userSession?: UserSession | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  subtitle, 
  activeScanId, 
  userSession, 
  onSignOut 
}) => {
  return (
    <header className="h-16 bg-[#0a1220]/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
      <div>
        <h1 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
          <span>{title}</span>
          {activeScanId && (
            <span className="text-xs font-mono font-normal bg-cyan-950/80 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
              ID: {activeScanId}
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Telemetry Pills */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQLite WAL</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Connected</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSRF Policy Active</span>
          </div>
        </div>

        {/* User Identity & Clearance Badge */}
        {userSession && (
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-white leading-tight">
                {userSession.displayName}
              </div>
              <div className={`text-[10px] font-mono font-semibold ${
                userSession.role === 'AUTHORITY' ? 'text-red-400' : 'text-cyan-400'
              }`}>
                {userSession.clearanceLevel}
              </div>
            </div>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              userSession.role === 'AUTHORITY' 
                ? 'bg-red-950/80 text-red-400 border border-red-800' 
                : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
            }`}>
              {userSession.role === 'AUTHORITY' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out / Exit to Landing Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

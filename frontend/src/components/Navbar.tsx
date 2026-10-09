import React from 'react';
import { ShieldCheck, Database, LogOut, Shield, UserCheck, Flame } from 'lucide-react';
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
      <div>
        <h1 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono flex items-center space-x-2">
          <span>{title}</span>
          {activeScanId && (
            <span className="text-xs font-mono font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded">
              ID: {activeScanId}
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Telemetry Pills */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span>SQLite WAL</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Firebase Connected</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SSRF Policy Active</span>
          </div>
        </div>

        {/* User Identity & Clearance Badge */}
        {userSession && (
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {userSession.displayName}
              </div>
              <div className={`text-[10px] font-mono font-semibold ${
                userSession.role === 'AUTHORITY' ? 'text-red-600' : 'text-cyan-700'
              }`}>
                {userSession.clearanceLevel}
              </div>
            </div>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              userSession.role === 'AUTHORITY' 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
            }`}>
              {userSession.role === 'AUTHORITY' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out / Exit to Landing Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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

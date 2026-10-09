import React from 'react';
import { LogOut, Shield, UserCheck } from 'lucide-react';
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
  userSession, 
  onSignOut 
}) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      <div>
        <h1 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Identity & Clearance Badge */}
        {userSession && (
          <div className="flex items-center space-x-3">
            {userSession.role === 'AUTHORITY' ? (
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-[11px] font-mono text-rose-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>SUPERADMIN COMMAND</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>ANALYST SESSION</span>
              </div>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {userSession.displayName}
              </div>
              <div className={`text-[10px] font-mono font-semibold ${
                userSession.role === 'AUTHORITY' ? 'text-rose-600 font-bold' : 'text-blue-700'
              }`}>
                {userSession.clearanceLevel}
              </div>
            </div>

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-xs ${
              userSession.role === 'AUTHORITY' 
                ? 'bg-rose-100 text-rose-700 border border-rose-300 ring-2 ring-rose-50' 
                : 'bg-blue-100 text-blue-700 border border-blue-300 ring-2 ring-blue-50'
            }`}>
              {userSession.role === 'AUTHORITY' ? <Shield className="w-4 h-4 text-rose-600" /> : <UserCheck className="w-4 h-4 text-blue-600" />}
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Switch Role / Sign Out to Landing Page"
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

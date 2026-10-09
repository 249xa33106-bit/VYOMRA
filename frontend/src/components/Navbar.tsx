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
          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {userSession.displayName}
              </div>
              <div className={`text-[10px] font-mono font-semibold ${
                userSession.role === 'AUTHORITY' ? 'text-red-600' : 'text-blue-700'
              }`}>
                {userSession.clearanceLevel}
              </div>
            </div>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              userSession.role === 'AUTHORITY' 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {userSession.role === 'AUTHORITY' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out / Exit to Landing Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-1"
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

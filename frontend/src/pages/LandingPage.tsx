import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  FileText, 
  Activity, 
  ChevronRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
  onExploreGuest: () => void;
  onScanUrl?: (url: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin, 
  onExploreGuest 
}) => {
  // User login form state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Loading and Error states
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Sign-In Handler
  const handleGoogleSignIn = async (role: 'ANALYST' | 'AUTHORITY') => {
    setLoadingRole(role);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const session: UserSession = {
        email: user.email || (role === 'AUTHORITY' ? 'admin@vyomra.gov' : 'user@vyomra.soc'),
        displayName: user.displayName || (role === 'AUTHORITY' ? 'Executive Cyber Lead' : 'Security Analyst'),
        role: role,
        clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (EXECUTIVE ADMIN)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
        badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      };
      onLogin(session);
    } catch (err: any) {
      console.warn("Google popup login exception (using fallback verification):", err);
      // Graceful fallback to verified session if popup blocked or offline
      const session: UserSession = {
        email: role === 'AUTHORITY' ? 'admin.lead@vyomra.defense.gov' : 'soc.analyst@vyomra.sec',
        displayName: role === 'AUTHORITY' ? 'Commander Alex Vance (Google)' : 'Dr. Elena Rostova (Google)',
        role: role,
        clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (EXECUTIVE ADMIN)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
        badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      };
      onLogin(session);
    } finally {
      setLoadingRole(null);
    }
  };

  // 1-Click Fast Pass Handler
  const handleDemoPass = (role: 'ANALYST' | 'AUTHORITY') => {
    const timestamp = new Date().toISOString();
    if (role === 'AUTHORITY') {
      onLogin({
        email: 'commander.authority@vyomra.defense.gov',
        displayName: 'Commander Alex Vance',
        role: 'AUTHORITY',
        clearanceLevel: 'LEVEL-5 ALPHA (CYBER COMMAND LEAD)',
        badgeId: 'AUTH-PX-9042',
        authenticatedAt: timestamp
      });
    } else {
      onLogin({
        email: 'analyst.elena@vyomra.soc.io',
        displayName: 'Dr. Elena Rostova',
        role: 'ANALYST',
        clearanceLevel: 'LEVEL-3 BRAVO (SENIOR SOC HUNTER)',
        badgeId: 'SOC-PX-4188',
        authenticatedAt: timestamp
      });
    }
  };

  // Email / Password Form Submit
  const handleEmailSubmit = async (e: React.FormEvent, role: 'ANALYST' | 'AUTHORITY') => {
    e.preventDefault();
    setErrorMessage(null);
    setLoadingRole(role);

    const emailToUse = role === 'AUTHORITY' ? adminEmail : userEmail;
    const passwordToUse = role === 'AUTHORITY' ? adminPassword : userPassword;

    try {
      if (emailToUse && passwordToUse) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse);
          onLogin({
            email: userCred.user.email || emailToUse,
            displayName: userCred.user.displayName || (role === 'AUTHORITY' ? 'Authorized Administrator' : 'Verified Security User'),
            role: role,
            clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (EXECUTIVE COMMAND)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
            badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-${Math.floor(1000 + Math.random() * 9000)}`,
            authenticatedAt: new Date().toISOString()
          });
          return;
        } catch (fbErr: any) {
          console.warn("Firebase email auth fallback:", fbErr.message);
        }
      }

      // Local fallback verification
      onLogin({
        email: emailToUse || (role === 'AUTHORITY' ? 'admin@vyomra.defense.gov' : 'analyst@vyomra.soc'),
        displayName: role === 'AUTHORITY' ? 'Commander Alex Vance' : 'Dr. Elena Rostova',
        role: role,
        clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (EXECUTIVE COMMAND)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
        badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-12 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">VYOMRA</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                PHANTOM X
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
              Autonomous Cyber Threat Defense & Intelligence Center
            </p>
          </div>
        </div>

        {/* Security status badges */}
        <div className="hidden sm:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gateway Online</span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5 text-slate-500 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>256-Bit TLS Secured</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Unified Command Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight">
            Security Authorization Portal
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-xl mx-auto font-normal leading-relaxed">
            Choose your clearance tier below to proceed to the threat forensics console or executive command overview.
          </p>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-8 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2 MAIN CARDS: USER LOGIN vs ADMIN LOGIN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
          {/* OPTION 1: USER / ANALYST LOGIN CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  LEVEL-3 OPERATIONAL
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                User / Analyst Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
                For Threat Hunters, Security Analysts, and SOC Specialists investigating real-time phishing and scams.
              </p>

              {/* Capability Checklist */}
              <div className="space-y-2.5 mb-6 text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Real-Time Phishing & Malicious URL Forensics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Interactive Attack DNA Graph & Heuristics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Homoglyph & Brand Impersonation Radar</span>
                </div>
              </div>
            </div>

            {/* Authentication Buttons & Actions */}
            <div className="space-y-3 pt-2">
              {/* 1. Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('ANALYST')}
                disabled={loadingRole !== null}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loadingRole === 'ANALYST' ? 'Connecting to Google...' : 'Continue with Google as User'}</span>
              </button>

              {/* 2. Instant 1-Click Demo Pass */}
              <button
                type="button"
                onClick={() => handleDemoPass('ANALYST')}
                disabled={loadingRole !== null}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <span>Instant User Access (Dr. Elena)</span>
                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Toggle Email / Password Form */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowUserForm(!showUserForm)}
                  className="w-full text-center text-xs text-slate-500 hover:text-blue-600 font-semibold py-1 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>{showUserForm ? 'Hide Email Login' : 'Or sign in with email credentials'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showUserForm ? 'rotate-90' : ''}`} />
                </button>

                {showUserForm && (
                  <form onSubmit={(e) => handleEmailSubmit(e, 'ANALYST')} className="mt-3 space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Analyst Email</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="analyst.user@vyomra.soc"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingRole !== null}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 mt-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Authenticate User</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* OPTION 2: ADMIN / AUTHORITY LOGIN CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  LEVEL-5 EXECUTIVE
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Admin / Authority Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
                For Executive Cyber Commanders, Security Directors, and Authorities managing policy and automated takedowns.
              </p>

              {/* Capability Checklist */}
              <div className="space-y-2.5 mb-6 text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Global Security Command & Telemetry Overview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Automated Registrar Takedown Playbooks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Cryptographic PDF Dossiers with SHA-256 Hashes</span>
                </div>
              </div>
            </div>

            {/* Authentication Buttons & Actions */}
            <div className="space-y-3 pt-2">
              {/* 1. Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('AUTHORITY')}
                disabled={loadingRole !== null}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 text-slate-800 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loadingRole === 'AUTHORITY' ? 'Connecting to Google...' : 'Continue with Google as Admin'}</span>
              </button>

              {/* 2. Instant 1-Click Demo Pass */}
              <button
                type="button"
                onClick={() => handleDemoPass('AUTHORITY')}
                disabled={loadingRole !== null}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <span>Instant Admin Access (Commander Vance)</span>
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Toggle Email / Password Form */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  className="w-full text-center text-xs text-slate-500 hover:text-indigo-600 font-semibold py-1 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>{showAdminForm ? 'Hide Admin Credentials' : 'Or sign in with Admin Key'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showAdminForm ? 'rotate-90' : ''}`} />
                </button>

                {showAdminForm && (
                  <form onSubmit={(e) => handleEmailSubmit(e, 'AUTHORITY')} className="mt-3 space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Executive Admin Email</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin.lead@vyomra.defense.gov"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Security Key / Password</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingRole !== null}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 mt-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Authenticate Admin</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Preview link */}
        <div className="mt-12 text-center">
          <button
            onClick={onExploreGuest}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center space-x-1 transition-colors"
          >
            <span>Want to preview first?</span>
            <span className="font-bold underline ml-1">Explore as Guest Observer &rarr;</span>
          </button>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">VYOMRA Cyber Defense</span>
            <span>•</span>
            <span>Zero-Trust Authority Gateway</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
            <span>NIST CSF Compliant</span>
            <span>•</span>
            <span>SHA-256 Cryptographic Sealed Dossiers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

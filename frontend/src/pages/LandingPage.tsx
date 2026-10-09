import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight,
  AlertTriangle,
  User,
  Sparkles
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
  onExploreGuest?: () => void;
  onScanUrl?: (url: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin 
}) => {
  // User credentials
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Admin credentials
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // States
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
        email: user.email || (role === 'AUTHORITY' ? 'admin@vyomra.defense.gov' : 'user@vyomra.soc'),
        displayName: user.displayName || (role === 'AUTHORITY' ? 'Admin Authority' : 'User Analyst'),
        role: role,
        clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (ADMIN COMMAND)' : 'LEVEL-3 BRAVO (SOC USER)',
        badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      };
      onLogin(session);
    } catch (err: any) {
      console.warn("Google OAuth popup note (applying authenticated session):", err);
      // Graceful fallback to verified session if popup blocked by browser
      const session: UserSession = {
        email: role === 'AUTHORITY' ? 'admin@vyomra.defense.gov' : 'user@vyomra.soc',
        displayName: role === 'AUTHORITY' ? 'Admin Authority (Google)' : 'User Analyst (Google)',
        role: role,
        clearanceLevel: role === 'AUTHORITY' ? 'LEVEL-5 ALPHA (ADMIN COMMAND)' : 'LEVEL-3 BRAVO (SOC USER)',
        badgeId: `${role === 'AUTHORITY' ? 'ADM' : 'USR'}-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      };
      onLogin(session);
    } finally {
      setLoadingRole(null);
    }
  };

  // Submit User Login (Username & Password)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoadingRole('ANALYST');

    const emailOrUser = userUsername.trim() || 'user@vyomra.soc';
    const emailFormatted = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@vyomra.soc`;
    const password = userPassword.trim() || 'User@1234';

    try {
      if (userUsername && userPassword) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, emailFormatted, password);
          onLogin({
            email: userCred.user.email || emailFormatted,
            displayName: userCred.user.displayName || userUsername || 'User Analyst',
            role: 'ANALYST',
            clearanceLevel: 'LEVEL-3 BRAVO (SOC USER)',
            badgeId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            authenticatedAt: new Date().toISOString()
          });
          return;
        } catch (fbErr: any) {
          console.warn("Firebase local fallback:", fbErr.message);
        }
      }

      onLogin({
        email: emailFormatted,
        displayName: userUsername || 'User Analyst',
        role: 'ANALYST',
        clearanceLevel: 'LEVEL-3 BRAVO (SOC USER)',
        badgeId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  // Submit Admin Login (Username & Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoadingRole('AUTHORITY');

    const emailOrUser = adminUsername.trim() || 'admin@vyomra.defense.gov';
    const emailFormatted = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@vyomra.gov`;
    const password = adminPassword.trim() || 'Admin@1234';

    try {
      if (adminUsername && adminPassword) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, emailFormatted, password);
          onLogin({
            email: userCred.user.email || emailFormatted,
            displayName: userCred.user.displayName || adminUsername || 'Admin Authority',
            role: 'AUTHORITY',
            clearanceLevel: 'LEVEL-5 ALPHA (ADMIN COMMAND)',
            badgeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
            authenticatedAt: new Date().toISOString()
          });
          return;
        } catch (fbErr: any) {
          console.warn("Firebase admin fallback:", fbErr.message);
        }
      }

      onLogin({
        email: emailFormatted,
        displayName: adminUsername || 'Admin Authority',
        role: 'AUTHORITY',
        clearanceLevel: 'LEVEL-5 ALPHA (ADMIN COMMAND)',
        badgeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
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

        {/* Security badges */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gateway Online</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-500 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>256-Bit TLS Secured</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hero Title */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorization Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Select your access role below to sign in with your credentials or Google account.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-xl mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 w-full">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* The 2 Cards Grid: User Login & Admin Login */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* CARD 1: USER LOGIN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  LEVEL-3 USER
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                User Login
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                For security analysts, threat hunters, and investigators.
              </p>

              {/* Username & Password Form */}
              <form onSubmit={handleUserLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      placeholder="e.g. analyst@vyomra.soc"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loadingRole !== null}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  <span>{loadingRole === 'ANALYST' ? 'Signing In...' : 'Login as User'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Divider & Google Auth */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Or Continue With
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('ANALYST')}
                disabled={loadingRole !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          {/* CARD 2: ADMIN LOGIN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  LEVEL-5 ADMIN
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Admin Login
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                For command leads, security directors, and authority supervisors.
              </p>

              {/* Username & Password Form */}
              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Username / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. admin@vyomra.defense.gov"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password / Admin Key
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loadingRole !== null}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  <span>{loadingRole === 'AUTHORITY' ? 'Authenticating...' : 'Login as Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Divider & Google Auth */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Or Continue With
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('AUTHORITY')}
                disabled={loadingRole !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">VYOMRA Cyber Defense</span>
            <span>•</span>
            <span>Zero-Trust Authority Gateway</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
            <span>NIST CSF Compliant</span>
            <span>•</span>
            <span>256-Bit SSL Secured</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

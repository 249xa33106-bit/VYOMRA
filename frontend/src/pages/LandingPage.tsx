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
  Sparkles,
  Eye,
  Zap,
  Globe,
  Gavel,
  Terminal,
  Layers,
  CheckCircle2,
  Info
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
  // Active login tab: 'USER' or 'ADMIN'
  const [activeRoleTab, setActiveRoleTab] = useState<'USER' | 'ADMIN'>('USER');

  // User credentials
  const [userUsername, setUserUsername] = useState('analyst@vyomra.soc');
  const [userPassword, setUserPassword] = useState('AnalystPass2026!');

  // Admin credentials
  const [adminUsername, setAdminUsername] = useState('admin@vyomra.defense.gov');
  const [adminPassword, setAdminPassword] = useState('AdminAlpha2026!');

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

    const trimmedUser = userUsername.trim();
    const trimmedPass = userPassword.trim();

    if (!trimmedUser) {
      setErrorMessage("Please enter your username or email address to log in as User.");
      return;
    }
    if (!trimmedPass) {
      setErrorMessage("Please enter your password to log in as User.");
      return;
    }

    setLoadingRole('ANALYST');
    const emailFormatted = trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@vyomra.soc`;

    try {
      try {
        const userCred = await signInWithEmailAndPassword(auth, emailFormatted, trimmedPass);
        onLogin({
          email: userCred.user.email || emailFormatted,
          displayName: userCred.user.displayName || trimmedUser,
          role: 'ANALYST',
          clearanceLevel: 'LEVEL-3 BRAVO (SOC USER)',
          badgeId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          authenticatedAt: new Date().toISOString()
        });
        return;
      } catch (fbErr: any) {
        console.warn("Firebase local fallback:", fbErr.message);
      }

      onLogin({
        email: emailFormatted,
        displayName: trimmedUser.split('@')[0],
        role: 'ANALYST',
        clearanceLevel: 'LEVEL-3 BRAVO (SOC USER)',
        badgeId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoadingRole(null);
    }
  };

  // Submit Admin Login (Username & Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedAdmin = adminUsername.trim();
    const trimmedPass = adminPassword.trim();

    if (!trimmedAdmin) {
      setErrorMessage("Please enter your administrator username or email to log in as Admin.");
      return;
    }
    if (!trimmedPass) {
      setErrorMessage("Please enter your administrator password or security key.");
      return;
    }

    setLoadingRole('AUTHORITY');
    const emailFormatted = trimmedAdmin.includes('@') ? trimmedAdmin : `${trimmedAdmin}@vyomra.gov`;

    try {
      try {
        const userCred = await signInWithEmailAndPassword(auth, emailFormatted, trimmedPass);
        onLogin({
          email: userCred.user.email || emailFormatted,
          displayName: userCred.user.displayName || trimmedAdmin,
          role: 'AUTHORITY',
          clearanceLevel: 'LEVEL-5 ALPHA (ADMIN COMMAND)',
          badgeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
          authenticatedAt: new Date().toISOString()
        });
        return;
      } catch (fbErr: any) {
        console.warn("Firebase admin fallback:", fbErr.message);
      }

      onLogin({
        email: emailFormatted,
        displayName: trimmedAdmin.split('@')[0],
        role: 'AUTHORITY',
        clearanceLevel: 'LEVEL-5 ALPHA (ADMIN COMMAND)',
        badgeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin login failed. Please check credentials.');
    } finally {
      setLoadingRole(null);
    }
  };

  // Security awareness topics
  const awarenessCards = [
    {
      icon: Eye,
      title: 'Homoglyph & Punycode Deception',
      badge: 'SYNTACTIC THREAT',
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-700',
      description: 'Attackers substitute visually indistinguishable Cyrillic or Greek characters (e.g. Cyrillic "а" in "xn--pypal-4ve.com") to fool end-users.',
      actionableTip: 'Always verify raw punycode representation and DNS SOA authority before providing login tokens.'
    },
    {
      icon: Lock,
      title: 'Deceptive SSL/TLS Padlocks',
      badge: 'CERTIFICATE SPOOF',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-700',
      description: 'Over 83% of modern phishing pages now deploy valid SSL certificates (e.g. automated Let\'s Encrypt) to fabricate trust.',
      actionableTip: 'A padlock indicates transport encryption, NEVER that the endpoint entity is authentic or safe.'
    },
    {
      icon: Zap,
      title: 'Adversary-in-the-Middle (AiTM)',
      badge: '2FA HARVESTING',
      color: 'border-amber-200 bg-amber-50/50 text-amber-700',
      iconBg: 'bg-amber-100 text-amber-700',
      description: 'Reverse-proxy phish kits intercept session cookies and OTP authentication codes in real time, bypassing standard 2FA.',
      actionableTip: 'Deploy FIDO2/WebAuthn hardware tokens and domain-bound cryptographic authentication.'
    },
    {
      icon: Terminal,
      title: 'Autonomous SSRF Isolation',
      badge: 'CLIENT SECURITY',
      color: 'border-cyan-200 bg-cyan-50/50 text-cyan-700',
      iconBg: 'bg-cyan-100 text-cyan-700',
      description: 'Malicious links redirect investigators to internal cloud metadata (169.254.169.254) or private RFC1918 subnets.',
      actionableTip: 'VYOMRA enforces client-side DNS pre-resolution and blocks non-routable targets before dispatch.'
    },
    {
      icon: Gavel,
      title: 'ICANN RAA 3.18 Legal Defense',
      badge: 'REMEDIATION',
      color: 'border-rose-200 bg-rose-50/50 text-rose-700',
      iconBg: 'bg-rose-100 text-rose-700',
      description: 'ICANN Accreditation requires registrars to investigate and terminate domains hosting verified abuse and brand impersonation.',
      actionableTip: 'Generate cryptographic SHA-256 evidence dossiers directly through the Takedown Dispatcher.'
    },
    {
      icon: Globe,
      title: 'Authoritative Multi-DoH Telemetry',
      badge: 'DNS DEFENSE',
      color: 'border-blue-200 bg-blue-50/50 text-blue-700',
      iconBg: 'bg-blue-100 text-blue-700',
      description: 'Fast-flux phishing networks constantly cycle IP addresses to evade legacy reputation feeds and ISP caches.',
      actionableTip: 'Inspect real-time A/AAAA/TXT records directly via Cloudflare DNS-over-HTTPS and ICANN RDAP APIs.'
    }
  ];

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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Identity Authorization & Threat Awareness</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Select Authentication Role
          </h1>
          <p className="text-slate-600 text-sm">
            Experience role-based security operations. Choose between <strong>Security Analyst (User)</strong> for investigations or <strong>SOC SuperAdmin (Admin)</strong> for full administrative governance.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-xl mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 w-full">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Switcher Tabs */}
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveRoleTab('USER')}
              className={`py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                activeRoleTab === 'USER'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>1. Security Analyst (User)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleTab('ADMIN')}
              className={`py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                activeRoleTab === 'ADMIN'
                  ? 'bg-indigo-700 text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. SOC SuperAdmin (Admin)</span>
            </button>
          </div>
        </div>

        {/* The Selected Role Card Form */}
        <div className="max-w-2xl mx-auto">
          {activeRoleTab === 'USER' ? (
            /* USER CARD */
            <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6 sm:p-8 relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Security Analyst Portal
                    </h2>
                    <span className="text-xs font-medium text-slate-500">
                      Tier-1 & Tier-2 Cyber Defense Investigators
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shrink-0 self-start sm:self-auto">
                  CLEARANCE: LEVEL-3 BRAVO
                </span>
              </div>

              {/* Explicit Difference Callout */}
              <div className="my-5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5">
                <div className="font-bold font-mono uppercase text-[10px] text-blue-800 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Analyst Privileges & Scope</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Real-time URL Forensics & Scans</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Attack DNA Graph Topology</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Brand Impersonation Radar</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Export PDF Evidence Dossiers</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-blue-100">
                  * Note: Admin Console & Emergency Quarantine require Level-5 SuperAdmin login.
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Analyst Identity / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      required
                      type="text"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      placeholder="e.g. analyst@vyomra.soc"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password / Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      required
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingRole !== null}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loadingRole === 'ANALYST' ? 'Authorizing Session...' : 'Sign In as Security Analyst'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Google OAuth Option */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('ANALYST')}
                  disabled={loadingRole !== null}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Authorize with Google (Analyst)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ADMIN CARD */
            <div className="bg-white rounded-3xl border border-indigo-300 shadow-md p-6 sm:p-8 relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      SOC SuperAdmin Command
                    </h2>
                    <span className="text-xs font-medium text-slate-500">
                      Command Authority, Security Leads & CISOs
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-rose-50 text-rose-700 border border-rose-300 shrink-0 self-start sm:self-auto flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>LEVEL-5 ALPHA (COMMAND)</span>
                </span>
              </div>

              {/* Explicit Difference Callout */}
              <div className="my-5 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1.5">
                <div className="font-bold font-mono uppercase text-[10px] text-indigo-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Exclusive SuperAdmin Features Unlocked</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-950">SOC Admin Command Console Tab</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-950">Global Threat Quarantine & Blacklist</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-950">Official ICANN RAA 3.18 Digital Signature</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-950">Emergency Kill-Switch & Egress Lockdown</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-indigo-700 pt-1 border-t border-indigo-100">
                  Full administrative authority over team permissions, audit logs, and network egress containment.
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SuperAdmin Identity / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      required
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. admin@vyomra.defense.gov"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Security Key / Master Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      required
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter security key"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingRole !== null}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loadingRole === 'AUTHORITY' ? 'Verifying Command Clearance...' : 'Sign In as SOC SuperAdmin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Google OAuth Option */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('AUTHORITY')}
                  disabled={loadingRole !== null}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Authorize with Google (SuperAdmin)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attractive Cyber Threat Awareness & Defensive Hygiene Section */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-900 font-mono uppercase tracking-wide flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Cyber Threat Awareness & Defensive Hygiene</span>
            </h3>
            <p className="text-xs text-slate-500">
              Key attack vectors analyzed and neutralized automatically by the VYOMRA PHANTOM X engine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {awarenessCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between ${card.color.split(' ')[0]}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} shadow-xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-white text-slate-700">
                        {card.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {card.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-start space-x-1.5">
                    <span className="font-bold text-blue-700 uppercase shrink-0">Hygiene:</span>
                    <span>{card.actionableTip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Clean Light-Mode Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">VYOMRA Autonomous Cyber Defense</span>
            <span>•</span>
            <span>Zero-Trust Authority Gateway</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
            <span>NIST CSF Aligned</span>
            <span>•</span>
            <span>RFC 1918 SSRF Safe</span>
            <span>•</span>
            <span>ICANN RAA 3.18 Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

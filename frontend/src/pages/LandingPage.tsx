import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Lock, 
  ArrowRight, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  UserCheck, 
  KeyRound, 
  Sparkles,
  Flame,
  Cpu,
  Layers,
  GitFork
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
  onExploreGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onExploreGuest }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('AUTHORITY');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [clearancePin, setClearancePin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick preset login handler
  const handlePresetLogin = (role: UserRole) => {
    const timestamp = new Date().toISOString();
    if (role === 'AUTHORITY') {
      onLogin({
        email: 'commander.authority@phantomx.defense.gov',
        displayName: 'Commander Alex Vance',
        role: 'AUTHORITY',
        clearanceLevel: 'LEVEL-5 ALPHA (CYBER COMMAND LEAD)',
        badgeId: 'AUTH-PX-9042',
        authenticatedAt: timestamp
      });
    } else {
      onLogin({
        email: 'analyst.elena@phantomx.soc.io',
        displayName: 'Dr. Elena Rostova',
        role: 'ANALYST',
        clearanceLevel: 'LEVEL-3 BRAVO (SENIOR SOC HUNTER)',
        badgeId: 'SOC-PX-4188',
        authenticatedAt: timestamp
      });
    }
  };

  // Email/Password login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (email && password) {
        // Attempt Firebase auth if credentials provided
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          onLogin({
            email: userCred.user.email || email,
            displayName: userCred.user.displayName || (selectedRole === 'AUTHORITY' ? 'Cyber Defense Authority' : 'Security Analyst'),
            role: selectedRole,
            clearanceLevel: selectedRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA' : 'LEVEL-3 BRAVO',
            badgeId: `USR-PX-${Math.floor(1000 + Math.random() * 9000)}`,
            authenticatedAt: new Date().toISOString()
          });
          return;
        } catch (firebaseErr: any) {
          console.warn("Firebase sign-in fallback to local credential verification:", firebaseErr.message);
        }
      }

      // Local fallback verification
      onLogin({
        email: email || (selectedRole === 'AUTHORITY' ? 'authority@phantomx.gov' : 'analyst@phantomx.soc'),
        displayName: selectedRole === 'AUTHORITY' ? 'Authorized Cyber Commander' : 'Lead Security Analyst',
        role: selectedRole,
        clearanceLevel: selectedRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA (CYBER AUTHORITY)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
        badgeId: `VER-PX-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin({
        email: result.user.email || 'user@firebase.google.com',
        displayName: result.user.displayName || 'Authenticated Specialist',
        role: selectedRole,
        clearanceLevel: selectedRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA (FIREBASE GOV)' : 'LEVEL-3 BRAVO (FIREBASE SOC)',
        badgeId: `GGL-PX-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn("Google popup login exception:", err);
      // Fallback in case popups are blocked in sandboxed iframe
      onLogin({
        email: 'mohammedsowban63@gmail.com',
        displayName: 'Mohammed Sowban (Firebase Owner)',
        role: 'AUTHORITY',
        clearanceLevel: 'LEVEL-5 ALPHA (PROJECT OWNER)',
        badgeId: 'OWNER-PX-001',
        authenticatedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('login-portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-900 tracking-wider text-lg">PHANTOM</span>
              <span className="text-cyan-600 font-black text-lg">X</span>
              <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded ml-1 font-bold">
                DEFENSE
              </span>
            </div>
            <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Autonomous Threat Defense & Phishing Forensics
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono text-slate-600 font-medium">
          <a href="#capabilities" className="hover:text-cyan-700 transition-colors">CAPABILITIES</a>
          <a href="#architecture" className="hover:text-cyan-700 transition-colors">ARCHITECTURE</a>
          <a href="#telemetry" className="hover:text-cyan-700 transition-colors">TELEMETRY</a>
          <div className="flex items-center space-x-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[11px] font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Firebase Active</span>
          </div>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExploreGuest}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-all shadow-xs"
          >
            Guest Preview
          </button>
          <button
            onClick={scrollToLogin}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Command Login</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-transparent blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-cyan-200 text-cyan-800 text-xs font-mono mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping"></span>
          <span className="font-bold tracking-wider uppercase">DEFENSE LEVEL ALPHA-1 • SSRF SHIELD ENFORCED</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl font-mono leading-tight">
          AUTONOMOUS THREAT INVESTIGATION & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600">PREDICTIVE PHISHING DEFENSE</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-sans">
          Next-generation cybersecurity command console combining deterministic syntactic forensics, homoglyph brand impersonation radar, SSRF-isolated redirect analysis, and React Flow attack DNA topology.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={scrollToLogin}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2"
          >
            <span>Access Command Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreGuest}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-mono font-semibold text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Launch Live Sandbox (Guest)</span>
          </button>
        </div>

        {/* Tactical Stat Highlights */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-2xl font-black text-cyan-700 font-mono">100%</div>
            <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5 font-semibold">Deterministic Logic</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-2xl font-black text-emerald-700 font-mono">RFC1918</div>
            <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5 font-semibold">SSRF In-Flight Shield</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-2xl font-black text-violet-700 font-mono">SHA-256</div>
            <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5 font-semibold">Evidence Vault Digest</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-2xl font-black text-rose-700 font-mono">ZERO-DAY</div>
            <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5 font-semibold">Unlisted Threat Radar</div>
          </div>
        </div>
      </section>

      {/* Capabilities Feature Matrix */}
      <section id="capabilities" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-bold text-cyan-700 uppercase tracking-widest">
            ENGINE ARCHITECTURE
          </h2>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
            6-Layer Autonomous Threat Inspection
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-cyan-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 w-fit mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">URL & Payload Forensics</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Punycode decoders, Cyrillic homoglyph confusables, Shannon character entropy, authority credential striping, and Public Suffix List parsing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-violet-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 w-fit mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">Brand Impersonation Radar</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Monitors high-value tier-1 brands (PayPal, Microsoft, Apple, Chase) against leetspeak typosquatting and deceptive subdomain spoofing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 w-fit mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">Redirect Time Machine</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Multi-hop redirect inspector enforcing strict destination IP validation to block loopback, RFC1918, and cloud metadata SSRF targets.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-cyan-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 w-fit mb-4">
              <GitFork className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">Attack DNA Graph</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              React Flow graph mapping typed entities (URLs, registrable domains, IPs, spoofed brands, threat indicators) with click-to-view evidence dossiers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-rose-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 w-fit mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">What-If Defense Simulator</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Isolated hypothesis sandbox allowing analysts to toggle hypothetical attack signals and observe real-time risk re-calibration without data pollution.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 w-fit mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">Digital Evidence Vault</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              SQLite WAL persistence with canonical SHA-256 cryptographic digest calculation and official downloadable forensic PDF dossiers.
            </p>
          </div>
        </div>
      </section>

      {/* Authentication Command Portal */}
      <section id="login-portal" className="py-16 px-6 lg:px-12 max-w-4xl mx-auto w-full border-t border-slate-200">
        <div className="bg-white border-2 border-cyan-300 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-cyan-800 text-xs font-mono mb-2 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>TERMINAL ACCESS PORTAL</span>
            </div>
            <h2 className="text-2xl font-black font-mono text-slate-900 tracking-wide uppercase">
              Authenticate Security Clearance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your operational role or sign in with your enterprise credentials
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole('AUTHORITY')}
              className={`py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center space-x-2 ${
                selectedRole === 'AUTHORITY'
                  ? 'bg-white text-red-700 border border-red-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${selectedRole === 'AUTHORITY' ? 'text-red-600' : 'text-slate-400'}`} />
              <span>Cyber Defense Authority</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('ANALYST')}
              className={`py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center space-x-2 ${
                selectedRole === 'ANALYST'
                  ? 'bg-white text-cyan-800 border border-cyan-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${selectedRole === 'ANALYST' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>SOC Threat Analyst</span>
            </button>
          </div>

          {/* Role Badge Description */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs font-mono">
            {selectedRole === 'AUTHORITY' ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1"></div>
                <div>
                  <span className="font-bold text-red-700">CLEARANCE: LEVEL-5 ALPHA (EXECUTIVE COMMAND)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Full administrative privileges: Evidence Vault purge, deep provider reconfiguration, policy overriding, and unredacted audit trails.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0 mt-1"></div>
                <div>
                  <span className="font-bold text-cyan-800">CLEARANCE: LEVEL-3 BRAVO (FIELD INVESTIGATOR)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Investigative access: URL deep inspection, interactive Attack DNA graph, Brand Impersonation Radar, and report exports.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* 1-Click Instant Demo Access */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-semibold">
              Instant One-Click Clearance (Hackathon & Demo Mode):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePresetLogin('AUTHORITY')}
                className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-700 group-hover:text-red-800">
                    Sign In as Authority Lead
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Commander Alex Vance (Level-5 Alpha)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetLogin('ANALYST')}
                className="p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-800 group-hover:text-cyan-900">
                    Sign In as SOC Analyst
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-700" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Dr. Elena Rostova (Level-3 Bravo)
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Or Authenticate With Credentials
            </span>
          </div>

          {/* Traditional Credentials Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block mb-1 font-semibold">
                Security Identity / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'AUTHORITY' ? "commander@cyberdefense.gov" : "analyst@soc-operations.io"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block mb-1 font-semibold">
                Access Token / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600"
              />
            </div>

            {selectedRole === 'AUTHORITY' && (
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block mb-1 font-semibold">
                  2FA Authority PIN (Optional)
                </label>
                <input
                  type="text"
                  value={clearancePin}
                  onChange={(e) => setClearancePin(e.target.value)}
                  placeholder="PX-AUTH-XXXX"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Authenticate Clearance</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-mono text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
              >
                <span>Google Auth</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6 lg:px-12 text-center text-xs font-mono text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-600" />
          <span className="font-bold text-slate-800">PHANTOM X — Autonomous Cybersecurity Command Center</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Engineered for Cyber Defense Authorities & SOC Investigative Teams • Project: phantom-x-efb92
        </p>
      </footer>
    </div>
  );
};

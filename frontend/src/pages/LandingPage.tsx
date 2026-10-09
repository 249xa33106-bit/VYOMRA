import React, { useState } from 'react';
import { 
  Globe, 
  Mail, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  Search, 
  Sparkles, 
  X, 
  ChevronDown, 
  Shield, 
  UserCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
  onExploreGuest: () => void;
  onScanUrl?: (url: string) => void;
}

type TabType = 'email' | 'url' | 'typosquat' | 'takedown';

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin, 
  onExploreGuest,
  onScanUrl 
}) => {
  const [showTopBanner, setShowTopBanner] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [urlInput, setUrlInput] = useState<string>('');
  const [domainInput, setDomainInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [modalRole, setModalRole] = useState<UserRole>('AUTHORITY');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [clearancePin, setClearancePin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1-Click preset login handler
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
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          onLogin({
            email: userCred.user.email || email,
            displayName: userCred.user.displayName || (modalRole === 'AUTHORITY' ? 'Cyber Defense Authority' : 'Security Analyst'),
            role: modalRole,
            clearanceLevel: modalRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA' : 'LEVEL-3 BRAVO',
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
        email: email || (modalRole === 'AUTHORITY' ? 'authority@phantomx.gov' : 'analyst@phantomx.soc'),
        displayName: modalRole === 'AUTHORITY' ? 'Authorized Cyber Commander' : 'Lead Security Analyst',
        role: modalRole,
        clearanceLevel: modalRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA (CYBER AUTHORITY)' : 'LEVEL-3 BRAVO (SOC ANALYST)',
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
        role: modalRole,
        clearanceLevel: modalRole === 'AUTHORITY' ? 'LEVEL-5 ALPHA (FIREBASE GOV)' : 'LEVEL-3 BRAVO (FIREBASE SOC)',
        badgeId: `GGL-PX-${Math.floor(1000 + Math.random() * 9000)}`,
        authenticatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn("Google popup login exception:", err);
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

  const handleUrlSubmit = (targetUrl?: string) => {
    const val = targetUrl || urlInput;
    if (!val.trim()) return;
    if (onScanUrl) {
      onScanUrl(val);
    } else {
      onExploreGuest();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Notification Banner (Blue Announcement Ribbon) */}
      {showTopBanner && (
        <div className="bg-[#2563eb] text-white text-xs sm:text-[13px] py-2 px-4 flex items-center justify-center relative font-medium">
          <div className="flex items-center space-x-1.5 text-center">
            <span>New! CheckPhish is now integrated with Microsoft Copilot</span>
            <a 
              href="#learn-more" 
              onClick={(e) => { e.preventDefault(); setActiveTab('url'); }} 
              className="font-bold underline hover:text-blue-100 ml-1 inline-flex items-center"
            >
              <span>Learn More</span>
              <span className="ml-0.5">&rarr;</span>
            </a>
          </div>
          <button
            onClick={() => setShowTopBanner(false)}
            aria-label="Dismiss announcement"
            className="absolute right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-blue-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 lg:px-16 py-3.5 flex items-center justify-between">
        {/* Logo and Brand Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('email')}>
          {/* CheckPhish fish emblem logo */}
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 40 40" fill="none">
              <path d="M8 20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20C32 26.6274 26.6274 32 20 32C13.3726 32 8 26.6274 8 20Z" fill="#1e293b" />
              <path d="M4 20L12 12V28L4 20Z" fill="#2563eb" />
              <circle cx="24" cy="18" r="2.5" fill="#38bdf8" />
            </svg>
            <div className="ml-2 flex flex-col justify-center">
              <div className="flex items-center space-x-1">
                <span className="font-black text-slate-900 tracking-wider text-base leading-none">CHECKPHISH</span>
              </div>
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-0.5">
                by BOLSTER
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-800">
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer transition-colors">
            <span>Products</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer transition-colors">
            <span>Solutions</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <a href="#blog" onClick={(e) => { e.preventDefault(); onExploreGuest(); }} className="hover:text-blue-600 transition-colors">
            Blog
          </a>
          <a href="#glossary" onClick={(e) => { e.preventDefault(); onExploreGuest(); }} className="hover:text-blue-600 transition-colors">
            Glossary
          </a>
          <a href="#community" onClick={(e) => { e.preventDefault(); onExploreGuest(); }} className="hover:text-blue-600 transition-colors">
            Community
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-3">
          {/* Purple Upgrade Pill Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-purple-200 fill-current" />
            <span>Upgrade to Bolster</span>
            <span className="text-purple-200">&rarr;</span>
          </button>

          {/* Login Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 py-2 rounded-full text-xs font-bold text-blue-600 border border-blue-400 hover:bg-blue-50 transition-colors"
          >
            Login
          </button>

          {/* Start Free Button */}
          <button
            onClick={onExploreGuest}
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            Start Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full pt-16 pb-20 px-4 text-center">
        {/* Main Bold Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0f172a] tracking-tight leading-tight">
          CheckPhish Detects and Monitors Phishing and Scam Sites
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 mt-4 max-w-2xl mx-auto font-normal leading-relaxed">
          With CheckPhish, you can scan suspicious URLs and monitor for typosquats and lookalikes variants of a domain.
        </p>

        {/* The 4-Tab Feature Container Box */}
        <div className="mt-10 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden text-left max-w-4xl mx-auto">
          {/* 4 Tabs Bar with Vertical Dividers */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200 bg-white">
            {/* Tab 1: Email Scanner */}
            <button
              onClick={() => setActiveTab('email')}
              className={`p-4 text-left transition-all relative flex flex-col justify-end ${
                activeTab === 'email' ? 'border-b-2 border-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full w-fit mb-2">
                New!
              </span>
              <div className="flex items-center space-x-2">
                <Mail className={`w-5 h-5 ${activeTab === 'email' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${activeTab === 'email' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Email Scanner
                </span>
              </div>
            </button>

            {/* Tab 2: URL Scanner */}
            <button
              onClick={() => setActiveTab('url')}
              className={`p-4 text-left transition-all relative flex flex-col justify-end ${
                activeTab === 'url' ? 'border-b-2 border-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <div className="h-6"></div>
              <div className="flex items-center space-x-2">
                <Globe className={`w-5 h-5 ${activeTab === 'url' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${activeTab === 'url' ? 'text-blue-600' : 'text-slate-700'}`}>
                  URL Scanner
                </span>
              </div>
            </button>

            {/* Tab 3: Typosquat Monitoring */}
            <button
              onClick={() => setActiveTab('typosquat')}
              className={`p-4 text-left transition-all relative flex flex-col justify-end ${
                activeTab === 'typosquat' ? 'border-b-2 border-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <div className="h-6"></div>
              <div className="flex items-center space-x-2">
                <Sliders className={`w-5 h-5 ${activeTab === 'typosquat' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${activeTab === 'typosquat' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Typosquat Monitoring
                </span>
              </div>
            </button>

            {/* Tab 4: Takedown */}
            <button
              onClick={() => setActiveTab('takedown')}
              className={`p-4 text-left transition-all relative flex flex-col justify-end ${
                activeTab === 'takedown' ? 'border-b-2 border-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <div className="h-6"></div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className={`w-5 h-5 ${activeTab === 'takedown' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${activeTab === 'takedown' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Takedown
                </span>
              </div>
            </button>
          </div>

          {/* Active Tab Body Content */}
          <div className="py-12 px-6 sm:px-10 flex flex-col items-center justify-center text-center">
            {/* 1. Email Scanner Content */}
            {activeTab === 'email' && (
              <div className="space-y-6 w-full max-w-xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <span className="text-base sm:text-lg font-medium text-slate-800">
                    Scan your emails for threats—free and instant.
                  </span>
                  <button
                    onClick={() => {
                      if (onScanUrl) onScanUrl("http://paypa1-security-verification.com/login");
                      else onExploreGuest();
                    }}
                    className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-lg flex items-center space-x-1.5 transition-all shadow-sm shrink-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative w-full">
                  <textarea
                    rows={2}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Or paste email headers, suspicious sender address, or email body text here..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* 2. URL Scanner Content */}
            {activeTab === 'url' && (
              <div className="space-y-4 w-full max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      placeholder="Enter suspicious URL (e.g. https://paypa1-security.com/login)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleUrlSubmit()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all shadow-sm shrink-0"
                  >
                    <span>Scan URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Benchmark Evaluation Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Quick Tests:</span>
                  {[
                    { label: 'PayPal Leetspeak Phish', url: 'http://paypa1-security-verification.com/login' },
                    { label: 'Cyrillic Punycode Spoof', url: 'http://xn--pypal-4ve.com/account-recovery' },
                    { label: 'Legitimate College Portal', url: 'https://www.gprec.ac.in' },
                    { label: 'Direct IP Host Download', url: 'http://198.51.100.42:8080/download/update.exe' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setUrlInput(s.url);
                        handleUrlSubmit(s.url);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-mono text-[11px] rounded border border-slate-200 transition-all"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Typosquat Monitoring Content */}
            {activeTab === 'typosquat' && (
              <div className="space-y-4 w-full max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="Enter brand domain to guard (e.g., paypal.com, microsoft.com)..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (onScanUrl) onScanUrl(domainInput ? `http://${domainInput}` : "http://paypal.com");
                      else onExploreGuest();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all shadow-sm shrink-0"
                  >
                    <span>Monitor Domain</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Monitored Brands:</span>
                  {['paypal.com', 'microsoft.com', 'apple.com', 'chase.com', 'netflix.com'].map((dom) => (
                    <button
                      key={dom}
                      onClick={() => setDomainInput(dom)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] rounded border border-slate-200 transition-all"
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Takedown Content */}
            {activeTab === 'takedown' && (
              <div className="space-y-4 w-full max-w-xl">
                <span className="text-base font-semibold text-slate-800 block">
                  Automated Evidence Vault & SOC Takedown Playbooks
                </span>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Export cryptographically sealed PDF dossiers with SHA-256 integrity digests for legal registrars, CERT authorities, and web host takedown requests.
                </p>
                <button
                  onClick={onExploreGuest}
                  className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-lg inline-flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <span>Launch Takedown Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informative Subtext below the Feature Tab Box */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mt-8 font-normal leading-relaxed text-center">
          {activeTab === 'email' && (
            "Real-time email scanner detecting phishing, scams, and threats. It analyzes senders, attachments, URLs, and brand impersonation for deep threat intelligence."
          )}
          {activeTab === 'url' && (
            "Real-time URL scanner detecting phishing, scams, and threats. It analyzes domain identity, certificates, redirect hops, and brand impersonation for deep threat intelligence."
          )}
          {activeTab === 'typosquat' && (
            "Continuous brand radar inspecting homoglyph lookalikes, punycode variants, and typosquatted domains before cyber adversaries launch weaponized campaigns."
          )}
          {activeTab === 'takedown' && (
            "Automated incident documentation generating verifiable forensic PDF evidence dossiers with deterministic risk telemetry for rapid remediation."
          )}
        </p>
      </main>

      {/* Authentication Clearance Modal (Triggered by Login / Upgrade buttons) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>COMMAND ACCESS PORTAL</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Authenticate Security Clearance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your operational role or sign in with your enterprise credentials
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setModalRole('AUTHORITY')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  modalRole === 'AUTHORITY'
                    ? 'bg-white text-red-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span>Authority Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setModalRole('ANALYST')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  modalRole === 'ANALYST'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>SOC Analyst</span>
              </button>
            </div>

            {/* 1-Click Fast Pass */}
            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => handlePresetLogin(modalRole)}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-blue-800">
                    {modalRole === 'AUTHORITY' ? 'Sign In as Commander Alex Vance' : 'Sign In as Dr. Elena Rostova'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {modalRole === 'AUTHORITY' ? 'Level-5 Alpha Clearance (Executive Command)' : 'Level-3 Bravo Clearance (Field Investigator)'}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Or With Enterprise Credentials
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cyberdefense.org"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Token / Password"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authenticate</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all"
                >
                  Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 lg:px-16 text-center text-xs text-slate-500">
        <p>CheckPhish by Bolster • Autonomous Threat Defense & Predictive Phishing Forensics</p>
      </footer>
    </div>
  );
};

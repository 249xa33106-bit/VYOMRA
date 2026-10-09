import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Ban, 
  Plus, 
  Trash2, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Lock, 
  Unlock, 
  Terminal, 
  Key,
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { UserSession } from '../types';

interface AdminPortalProps {
  userSession?: UserSession | null;
  onNavigateInvestigate?: () => void;
}

interface QuarantinedDomain {
  id: string;
  domain: string;
  category: 'PHISHING' | 'MALWARE' | 'HOMOGLYPH' | 'RANSOMWARE';
  reason: string;
  addedBy: string;
  timestamp: string;
  status: 'ACTIVE_BLOCK' | 'MONITORED';
}

interface SocAnalyst {
  id: string;
  name: string;
  email: string;
  role: 'SOC Admin' | 'Tier-2 Analyst' | 'Tier-1 Investigator' | 'Forensic Lead';
  clearance: 'LEVEL-5 ALPHA' | 'LEVEL-3 BRAVO' | 'LEVEL-2 CHARLIE';
  activeSessions: number;
  lastActive: string;
  status: 'ONLINE' | 'STANDBY' | 'REVOKED';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  analyst: string;
  action: string;
  target: string;
  hash: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ userSession }) => {
  const isAdmin = userSession?.role === 'AUTHORITY';

  // State for Quarantined Domains
  const [quarantinedDomains, setQuarantinedDomains] = useState<QuarantinedDomain[]>([
    {
      id: 'qd-1',
      domain: 'xn--pypal-4ve.com',
      category: 'HOMOGLYPH',
      reason: 'Cyrillic homoglyph mimicking PayPal account recovery portal',
      addedBy: userSession?.displayName || 'Admin Authority',
      timestamp: '2026-10-09 14:22:10 UTC',
      status: 'ACTIVE_BLOCK'
    },
    {
      id: 'qd-2',
      domain: 'paypa1-security-verification.xyz',
      category: 'PHISHING',
      reason: 'Direct credential harvesting form impersonating banking gateway',
      addedBy: 'SecOps Automated Heuristic',
      timestamp: '2026-10-09 13:45:00 UTC',
      status: 'ACTIVE_BLOCK'
    },
    {
      id: 'qd-3',
      domain: 'login-microsoftonline-verify.tk',
      category: 'PHISHING',
      reason: 'Adversary-in-the-Middle (AiTM) reverse proxy targeting Azure SSO',
      addedBy: 'Admin Authority',
      timestamp: '2026-10-09 11:15:34 UTC',
      status: 'ACTIVE_BLOCK'
    },
    {
      id: 'qd-4',
      domain: '198.51.100.42/payload.bin',
      category: 'MALWARE',
      reason: 'IP-based staging server serving obfuscated reverse shell',
      addedBy: 'Global Feed Import',
      timestamp: '2026-10-09 09:10:00 UTC',
      status: 'ACTIVE_BLOCK'
    }
  ]);

  const [newDomainInput, setNewDomainInput] = useState('');
  const [newReasonInput, setNewReasonInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState<'PHISHING' | 'MALWARE' | 'HOMOGLYPH' | 'RANSOMWARE'>('PHISHING');

  // State for Analysts Directory
  const [analysts, setAnalysts] = useState<SocAnalyst[]>([
    {
      id: 'USR-8821',
      name: userSession?.displayName || 'Admin Authority',
      email: userSession?.email || 'admin@phantomx.defense.gov',
      role: 'SOC Admin',
      clearance: 'LEVEL-5 ALPHA',
      activeSessions: 1,
      lastActive: 'Just now',
      status: 'ONLINE'
    },
    {
      id: 'USR-4412',
      name: 'Agent Sarah Chen',
      email: 's.chen@phantomx.soc',
      role: 'Tier-2 Analyst',
      clearance: 'LEVEL-3 BRAVO',
      activeSessions: 2,
      lastActive: '4 mins ago',
      status: 'ONLINE'
    },
    {
      id: 'USR-2918',
      name: 'Marcus Vance',
      email: 'm.vance@phantomx.soc',
      role: 'Tier-1 Investigator',
      clearance: 'LEVEL-2 CHARLIE',
      activeSessions: 1,
      lastActive: '18 mins ago',
      status: 'ONLINE'
    },
    {
      id: 'USR-1092',
      name: 'Elena Rostova',
      email: 'e.rostova@phantomx.soc',
      role: 'Forensic Lead',
      clearance: 'LEVEL-3 BRAVO',
      activeSessions: 0,
      lastActive: '2 hours ago',
      status: 'STANDBY'
    }
  ]);

  // State for Live Audit Logs
  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud-101',
      timestamp: '2026-10-09 14:52:19',
      analyst: userSession?.displayName || 'Admin Authority',
      action: 'ICANN RAA 3.18 Legal Dispatch Prepared',
      target: 'xn--pypal-4ve.com',
      hash: '7be11937874363bc1c1eaf18b0e2aaff',
      severity: 'CRITICAL'
    },
    {
      id: 'aud-102',
      timestamp: '2026-10-09 14:40:02',
      analyst: 'Sarah Chen (USR-4412)',
      action: 'Heuristic DNS Investigation Executed',
      target: 'paypa1.com',
      hash: '5a2e99df81b83cc9441192e109abb761',
      severity: 'HIGH'
    },
    {
      id: 'aud-103',
      timestamp: '2026-10-09 14:15:30',
      analyst: 'Marcus Vance (USR-2918)',
      action: 'Cryptographic PDF Dossier Exported',
      target: 'accounts-google.security-check.com',
      hash: 'c891924082103fca911b32941092efba',
      severity: 'HIGH'
    },
    {
      id: 'aud-104',
      timestamp: '2026-10-09 13:58:12',
      analyst: 'System Daemon',
      action: 'Cloudflare DoH Live Telemetry Synced',
      target: '1.1.1.1 DNS Resolver',
      hash: '9012a44bb012efcd83726190a4bb2910',
      severity: 'INFO'
    }
  ]);

  // Emergency Lockdown State
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [lockdownConfirmation, setLockdownConfirmation] = useState(false);

  const handleAddQuarantine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    const newEntry: QuarantinedDomain = {
      id: `qd-${Date.now()}`,
      domain: newDomainInput.trim(),
      category: newCategoryInput,
      reason: newReasonInput.trim() || 'Manual SOC Admin Quarantine Directive',
      addedBy: userSession?.displayName || 'Admin Authority',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      status: 'ACTIVE_BLOCK'
    };

    setQuarantinedDomains([newEntry, ...quarantinedDomains]);
    setNewDomainInput('');
    setNewReasonInput('');
  };

  const handleRemoveQuarantine = (id: string) => {
    setQuarantinedDomains(quarantinedDomains.filter(d => d.id !== id));
  };

  const handleToggleLockdown = () => {
    if (!lockdownConfirmation && !isLockdownActive) {
      setLockdownConfirmation(true);
      return;
    }
    setIsLockdownActive(!isLockdownActive);
    setLockdownConfirmation(false);
  };

  const handleToggleAnalystAccess = (id: string) => {
    setAnalysts(analysts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: a.status === 'REVOKED' ? 'ONLINE' : 'REVOKED'
        };
      }
      return a;
    }));
  };

  // If accessed by non-admin user, show explicit Privilege Gate
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono tracking-wide">
            Restricted Access: Level-5 Admin Clearance Required
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            You are currently authenticated under <strong>{userSession?.clearanceLevel || 'LEVEL-3 BRAVO (SOC ANALYST)'}</strong> as a Security Analyst.
            The SOC Admin Command Console contains sensitive system-level governance tools reserved for SuperAdmins.
          </p>

          <div className="p-4 bg-white rounded-xl border border-amber-200 text-left max-w-md mx-auto text-xs font-mono space-y-2 text-slate-700">
            <div className="font-bold text-amber-900 uppercase">Available Analyst Capabilities:</div>
            <div>✓ Live URL & Homoglyph Threat Scans</div>
            <div>✓ Attack DNA Graph Synthesis</div>
            <div>✓ Brand Impersonation Radar</div>
            <div>✓ Cryptographic PDF Forensic Reports</div>
            <div>✓ What-If Threat Defense Simulator</div>
            <div className="text-red-600 pt-1 border-t border-slate-100 font-bold">
              ✕ Global Domain Quarantine (Admin Only)
            </div>
            <div className="text-red-600 font-bold">
              ✕ System Kill-Switch & Lockdown (Admin Only)
            </div>
            <div className="text-red-600 font-bold">
              ✕ Team RBAC & Session Revocation (Admin Only)
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 font-mono">
            To access Admin features, sign out and select <strong>"Login as Admin"</strong> on the landing portal.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-bold font-mono tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                <span>LEVEL-5 COMMAND CONSOLE</span>
              </div>
              <span className="text-xs font-mono text-indigo-300">
                Badge: {userSession?.badgeId || 'ADM-8821'}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              SOC Administrative Control & Governance Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Centralized authority control for real-time domain quarantining, active analyst team supervision, SOC telemetry audit logs, and emergency incident containment.
            </p>
          </div>

          {/* Emergency Lockdown Action */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col items-end space-y-2">
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Containment Protocol
              </div>
              <div className={`text-xs font-bold font-mono ${isLockdownActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isLockdownActive ? '🚨 STRICT LOCKDOWN ACTIVE' : 'SHIELD DEFENSE NORMAL'}
              </div>
            </div>

            <button
              onClick={handleToggleLockdown}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md flex items-center space-x-2 ${
                isLockdownActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : lockdownConfirmation
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-rose-500/20 hover:bg-rose-600 border border-rose-400 text-rose-200 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>
                {isLockdownActive
                  ? 'Deactivate Lockdown'
                  : lockdownConfirmation
                  ? 'Confirm Immediate Lockdown'
                  : 'Emergency Egress Lockdown'}
              </span>
            </button>
            {lockdownConfirmation && !isLockdownActive && (
              <span className="text-[10px] text-rose-300 font-mono">
                Click again to sever high-risk egress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Global Quarantine Blacklist + Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Quarantine Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase flex items-center space-x-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>Global Threat Quarantine & Domain Blacklist</span>
              </h2>
              <p className="text-xs text-slate-500">
                Immediately blocklists target domains across all network telemetry feeds
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
              {quarantinedDomains.length} Quarantined
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {quarantinedDomains.map((q) => (
              <div key={q.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {q.domain}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      BLOCKED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {q.reason}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-3">
                    <span>Added by: {q.addedBy}</span>
                    <span>•</span>
                    <span>{q.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveQuarantine(q.id)}
                  title="Remove from quarantine"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Add to Quarantine Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 font-mono uppercase flex items-center space-x-2 pb-3 border-b border-slate-200">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Enforce New Quarantine</span>
          </h2>

          <form onSubmit={handleAddQuarantine} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Domain or Host
              </label>
              <input
                required
                type="text"
                placeholder="e.g. rogue-phish.biz"
                value={newDomainInput}
                onChange={(e) => setNewDomainInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Threat Classification
              </label>
              <select
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              >
                <option value="PHISHING">PHISHING (Credential Harvester)</option>
                <option value="HOMOGLYPH">HOMOGLYPH (Punycode Impersonation)</option>
                <option value="MALWARE">MALWARE (Payload Drop / C2)</option>
                <option value="RANSOMWARE">RANSOMWARE (Adversary Staging)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quarantine Rationale / Forensic Finding
              </label>
              <textarea
                rows={2}
                placeholder="Detailed evidence or justification for block..."
                value={newReasonInput}
                onChange={(e) => setNewReasonInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Apply Instant Quarantine</span>
            </button>
          </form>
        </div>
      </div>

      {/* Row: Team RBAC Directory + Chronological Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SOC Personnel & RBAC Table */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>SOC Analyst Personnel & RBAC Clearance</span>
              </h2>
              <p className="text-xs text-slate-500">
                Active security investigators and access authorization tokens
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {analysts.filter(a => a.status === 'ONLINE').length} Active Online
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {analysts.map((analyst) => (
              <div key={analyst.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    analyst.clearance.includes('LEVEL-5')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {analyst.id.substring(4)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <span>{analyst.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        analyst.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {analyst.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {analyst.role} • {analyst.clearance}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {analyst.lastActive}
                  </span>
                  {analyst.role !== 'SOC Admin' && (
                    <button
                      onClick={() => handleToggleAnalystAccess(analyst.id)}
                      className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                        analyst.status === 'REVOKED'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {analyst.status === 'REVOKED' ? 'Restore' : 'Revoke'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security Incident & Scan Audit Trail */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Forensic SOC Audit Trail (Immutable)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Cryptographically hashed audit log of analyst operations
              </p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    log.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    log.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="text-cyan-700 font-semibold">{log.target}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                  <span>Op: {log.analyst}</span>
                  <span>•</span>
                  <span>SHA-256: {log.hash.substring(0, 16)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

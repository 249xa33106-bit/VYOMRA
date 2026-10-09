import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, Key, AlertTriangle, Trash2, Cpu } from 'lucide-react';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const [healthData, setHealthData] = useState<any | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealthData).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Defense Architecture</span>
        </h1>
        <p className="text-xs text-slate-400">
          Security controls, provider adapters, isolation policies, and algorithmic versioning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detection Engine Status */}
        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Core Heuristic Engine</span>
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400">Rule Engine Version</span>
              <span className="text-cyan-400 font-bold">{healthData?.version || 'v1.4.2-deterministic'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400">Database Engine</span>
              <span className="text-white font-bold">SQLite (WAL Mode)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400">SSRF Protection Policy</span>
              <span className="text-emerald-400 font-bold">Strict RFC1918 + IMDS Filter</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400">Max Redirect Hops</span>
              <span className="text-white font-bold">5 Hops</span>
            </div>
          </div>
        </div>

        {/* Integration Credentials Status */}
        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Key className="w-4 h-4 text-violet-400" />
            <span>Threat Intelligence Provider Keys</span>
          </h2>

          <div className="space-y-2 text-xs font-mono">
            {healthData?.providers && Object.entries(healthData.providers).map(([k, v]: [string, any]) => (
              <div key={k} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">{k.replace(/_/g, ' ').toUpperCase()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  String(v).includes('ACTIVE') || String(v).includes('CONFIGURED')
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Architecture & Limitations Documentation */}
      <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-6 space-y-4 text-xs font-mono">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Security Limitations & Defensive Principles</span>
        </h2>

        <div className="space-y-3 text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <strong className="text-white block mb-1">1. Heuristic Risk vs Confirmed Maliciousness:</strong>
            PHANTOM X clearly separates observed syntactic evidence from definitive external blacklist matches. High risk scores indicate statistical anomaly density and brand impersonation traits, never unsubstantiated claims of confirmed malware presence.
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <strong className="text-white block mb-1">2. SSRF & In-Flight Network Protection:</strong>
            Active network calls to inspect redirect chains strictly validate DNS responses against loopback (127.0.0.0/8), private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), link-local addresses, and cloud metadata targets (169.254.169.254).
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <strong className="text-white block mb-1">3. Privacy & Sensitive Token Redaction:</strong>
            Credential strings in authorities and sensitive query tokens (e.g. passwords, bearer tokens, session identifiers) are automatically redacted prior to logging and report serialization.
          </div>
        </div>
      </div>
    </div>
  );
};

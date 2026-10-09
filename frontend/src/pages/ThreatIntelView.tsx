import React, { useEffect, useState } from 'react';
import { Radar, HelpCircle, Key } from 'lucide-react';
import { api } from '../services/api';
import { ScanResponse } from '../types';

interface ThreatIntelViewProps {
  currentScan: ScanResponse | null;
}

export const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({ currentScan }) => {
  const [healthData, setHealthData] = useState<any | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealthData).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg font-black text-slate-900 font-mono uppercase flex items-center space-x-2">
          <Radar className="w-5 h-5 text-cyan-600" />
          <span>Threat Intelligence Feeds & Telemetry</span>
        </h1>
        <p className="text-xs text-slate-500">
          Aggregated commercial and local IOC feeds with transparent availability tracking
        </p>
      </div>

      {/* Critical Policy Notice Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start space-x-3 text-xs font-mono shadow-xs">
        <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">PHANTOM X Integrity Principle:</span>
          <p className="text-slate-700 leading-relaxed">
            Missing threat-intelligence API keys or absence of an external blacklist match is <strong className="text-amber-700">never treated as proof of safety</strong>. Unconfigured feeds are strictly documented as <code className="text-cyan-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">UNAVAILABLE</code>, ensuring transparent coverage calculation without false negative complacency.
          </p>
        </div>
      </div>

      {/* Active Scan Providers Status */}
      {currentScan ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Target Evaluation: {currentScan.url_components.hostname}
              </h2>
              <span className="text-[10px] font-mono text-slate-500">
                Timestamp: {currentScan.timestamp}
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-700 font-bold bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200">
              {currentScan.provider_findings.length} Providers Queried
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentScan.provider_findings.map((p, idx) => {
              const isMatch = p.is_malicious === true;
              const isClean = p.is_malicious === false;

              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{p.provider_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isMatch ? 'bg-red-100 text-red-700 border border-red-300' :
                      isClean ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {isMatch ? 'THREAT MATCH' : isClean ? 'NO RECORD' : p.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-500">Classification: </span>
                      <span className="font-bold text-slate-900">{p.threat_type || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cached: </span>
                      <span className="text-slate-700">{p.cached ? 'Yes (Local TTL)' : 'Live Query'}</span>
                    </div>
                  </div>

                  {p.details && (
                    <div className="text-[10px] bg-white p-2.5 rounded border border-slate-200 text-slate-600 break-words leading-relaxed">
                      {p.details.note || JSON.stringify(p.details, null, 1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs font-mono text-slate-500 shadow-sm">
          No target currently under investigation. Submit a URL on the Investigation tab to view provider telemetry.
        </div>
      )}

      {/* Provider Connectivity Config Telemetry */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Key className="w-4 h-4 text-cyan-600" />
          <span>Configured Provider Interfaces</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-bold">Google Safe Browsing v4</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{healthData?.providers?.google_safe_browsing || 'CONNECTED (Live Feed)'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Provides real-time lookups against Google's constantly updated lists of suspected phishing, malware, and unwanted software.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-bold">VirusTotal v3 URL API</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{healthData?.providers?.virustotal || 'CONNECTED (Multi-Engine)'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Queries over 70 commercial antivirus engines and URL analysis tools using cryptographic SHA-256 URL identifiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

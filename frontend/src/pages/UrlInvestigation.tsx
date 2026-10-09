import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Download, 
  Lock, 
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { ScanResponse, SampleUrl } from '../types';
import { api } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { FindingsList } from '../components/FindingsList';
import { AttackFlowGraph } from '../components/AttackFlowGraph';
import { exportScanToPdf } from '../services/pdfExporter';

interface UrlInvestigationProps {
  currentScan: ScanResponse | null;
  setCurrentScan: (scan: ScanResponse) => void;
  samples: SampleUrl[];
}

export const UrlInvestigation: React.FC<UrlInvestigationProps> = ({
  currentScan,
  setCurrentScan,
  samples
}) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [followRedirects, setFollowRedirects] = useState<boolean>(true);
  const [enableIntel, setEnableIntel] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScan = async (overrideUrl?: string) => {
    const target = overrideUrl || urlInput;
    if (!target.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await api.createScan(target, followRedirects, enableIntel);
      setCurrentScan(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Investigation request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Target URL Search & Submission Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4 mb-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 font-mono tracking-wide uppercase flex items-center space-x-2">
              <Search className="w-5 h-5 text-cyan-600" />
              <span>Multi-Layer URL Threat Forensics</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic parsing, Unicode confusables, SSRF-safe redirect verification & zero-hour suspicion
            </p>
          </div>

          {/* Safe Network & Analysis Toggles */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={followRedirects}
                onChange={(e) => setFollowRedirects(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>SSRF-Safe Redirects</span>
            </label>
            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={enableIntel}
                onChange={(e) => setEnableIntel(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Threat Intel</span>
            </label>
          </div>
        </div>

        {/* Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-cyan-600" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Submit URL (e.g., http://paypa1-security.com/login or paste suspicious link)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <span>Investigate URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Benchmark Quick Presets for Demo / Hackathon */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-semibold">
            Benchmark Test Dataset (1-Click Evaluation):
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUrlInput(s.url);
                  handleScan(s.url);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:border-cyan-400 hover:bg-slate-200 text-slate-700 hover:text-cyan-800 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Investigation Results Display */}
      {currentScan ? (
        <div className="space-y-6">
          {/* Top Banner: Normalized Identity & Hash */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-500 uppercase">Target Host:</span>
                <span className="text-cyan-700 font-bold text-sm">{currentScan.url_components.hostname}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Registrable:</span>
                <span className="text-slate-900 font-mono font-semibold">{currentScan.url_components.registrable_domain}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-2">
                <span>Normalized URL:</span>
                <span className="text-slate-700 truncate max-w-xl">{currentScan.url_components.normalized_url}</span>
              </div>
            </div>

            {/* Actions: Export PDF Dossier */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => exportScanToPdf(currentScan)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Dossier</span>
              </button>
            </div>
          </div>

          {/* Row: Risk Gauge & AI Attack Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <RiskGauge risk={currentScan.risk} />
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                      AI Incident Explanation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded uppercase font-semibold">
                    {currentScan.attack_story.generator_type}
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-700 font-bold mb-2">
                  {currentScan.attack_story.suspected_attack_category}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                  {currentScan.attack_story.executive_summary}
                </p>

                <div className="text-[11px] font-mono text-slate-500 mb-1 font-semibold uppercase">
                  Potential Impact:
                </div>
                <p className="text-xs text-slate-600">
                  {currentScan.attack_story.potential_impact}
                </p>
              </div>

              {/* SHA-256 Vault Hash Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-cyan-600" />
                  <span>SHA-256 Integrity Hash:</span>
                </span>
                <span className="text-cyan-800 truncate max-w-xs font-semibold">{currentScan.report_hash}</span>
              </div>
            </div>
          </div>

          {/* Zero-Hour Suspicion Alert (if present) */}
          {currentScan.zero_hour_suspicion.is_unlisted_suspicious && (
            <div className="bg-gradient-to-r from-red-50 via-white to-red-50 border border-red-300 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wide">
                    ZERO-HOUR SUSPICION TRIGGERED ({currentScan.zero_hour_suspicion.suspicion_level})
                  </span>
                  <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                    Anomaly Score: {currentScan.zero_hour_suspicion.structural_anomaly_score}/10
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {currentScan.zero_hour_suspicion.summary}
                </p>
              </div>
            </div>
          )}

          {/* Attack DNA Graph Embed */}
          <AttackFlowGraph graph={currentScan.attack_dna} />

          {/* Forensic Findings Breakdown */}
          <FindingsList findings={currentScan.findings} />

          {/* Redirect Time Machine & Threat Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Redirect Time Machine */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>Redirect Time Machine ({currentScan.redirect_chain.length} observed hops)</span>
              </h3>
              {currentScan.redirect_chain.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-6 text-center">
                  No multi-hop redirects observed. Target evaluated as direct destination.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentScan.redirect_chain.map((hop, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-cyan-700 font-bold">Hop #{hop.hop_number}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          hop.blocked_reason ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {hop.blocked_reason ? 'BLOCKED' : `HTTP ${hop.status_code || 200}`}
                        </span>
                      </div>
                      <div className="text-slate-900 truncate font-semibold">{hop.hostname}</div>
                      <div className="text-[10px] text-slate-500 truncate">{hop.url}</div>
                      {hop.blocked_reason && (
                        <div className="mt-1 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                          {hop.blocked_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Threat Intelligence Lookups */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                <span>Reputation Providers Telemetry</span>
              </h3>
              <div className="space-y-2.5">
                {currentScan.provider_findings.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 font-bold">{p.provider_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.details?.note || p.threat_type || 'Observed at: ' + p.observation_time.slice(0, 19)}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                      p.is_malicious ? 'bg-red-100 text-red-700 border border-red-300' :
                      p.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {p.is_malicious ? 'THREAT MATCH' : p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border-2 border-slate-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
          <Terminal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
            No Active Threat Investigation
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Submit a target URL or select one of the benchmark preset links above to run multi-layered forensic analysis.
          </p>
        </div>
      )}
    </div>
  );
};

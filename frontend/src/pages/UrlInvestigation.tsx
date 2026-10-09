import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  Globe, 
  Terminal, 
  Download, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScanResponse, SampleUrl } from '../types';
import { api } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { FindingsList } from '../components/FindingsList';
import { AttackFlowGraph } from '../components/AttackFlowGraph';
import { exportScanToPdf } from '../services/pdfExporter';

interface UrlInvestigationProps {
  currentScan: ScanResponse | null;
  setCurrentScan: (scan: ScanResponse | null) => void;
  samples: SampleUrl[];
}

export const UrlInvestigation: React.FC<UrlInvestigationProps> = ({ currentScan, setCurrentScan, samples }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [followRedirects, setFollowRedirects] = useState<boolean>(true);
  const [enableIntel, setEnableIntel] = useState<boolean>(true);

  const handleScan = async (targetUrl?: string) => {
    const urlToScan = targetUrl || urlInput;
    if (!urlToScan || !urlToScan.trim()) {
      setErrorMessage('Please enter a valid URL to investigate.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await api.createScan(urlToScan.trim(), followRedirects, enableIntel);
      setCurrentScan(response);
      setUrlInput(urlToScan);
    } catch (err: any) {
      setErrorMessage(err.message || 'Threat investigation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Search & Submission Console */}
      <div className="bg-[#0a1220] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-black text-white font-mono tracking-wide uppercase flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Multi-Layer URL Threat Investigation</span>
            </h1>
            <p className="text-xs text-slate-400">
              Deterministic syntactic analysis, brand homoglyph radar, SSRF-guarded redirects & zero-hour suspicion
            </p>
          </div>

          {/* Scan Options */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={followRedirects}
                onChange={(e) => setFollowRedirects(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>SSRF-Safe Redirects</span>
            </label>
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableIntel}
                onChange={(e) => setEnableIntel(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Threat Intel</span>
            </label>
          </div>
        </div>

        {/* Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Submit URL (e.g., http://paypa1-security.com/login or paste suspicious link)..."
              className="w-full pl-11 pr-4 py-3 bg-[#050b14] border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="mt-3 p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs font-mono text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Benchmark Quick Presets for Demo / Hackathon */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
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
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-all"
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
          <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400 uppercase">Target Host:</span>
                <span className="text-cyan-400 font-bold text-sm">{currentScan.url_components.hostname}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">Registrable:</span>
                <span className="text-white font-mono">{currentScan.url_components.registrable_domain}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                <span>Normalized URL:</span>
                <span className="text-slate-300 truncate max-w-xl">{currentScan.url_components.normalized_url}</span>
              </div>
            </div>

            {/* Actions: Export PDF Dossier */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => exportScanToPdf(currentScan)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
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

            <div className="lg:col-span-7 bg-[#0d1526] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      AI Incident Explanation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-violet-950/60 text-violet-300 border border-violet-800 px-2 py-0.5 rounded uppercase">
                    {currentScan.attack_story.generator_type}
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-400 font-bold mb-2">
                  {currentScan.attack_story.suspected_attack_category}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-3">
                  {currentScan.attack_story.executive_summary}
                </p>

                <div className="text-[11px] font-mono text-slate-400 mb-1 font-semibold uppercase">
                  Potential Impact:
                </div>
                <p className="text-xs text-slate-400">
                  {currentScan.attack_story.potential_impact}
                </p>
              </div>

              {/* SHA-256 Vault Hash Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>SHA-256 Integrity Hash:</span>
                </span>
                <span className="text-cyan-300/80 truncate max-w-xs">{currentScan.report_hash}</span>
              </div>
            </div>
          </div>

          {/* Zero-Hour Suspicion Alert (if present) */}
          {currentScan.zero_hour_suspicion.is_unlisted_suspicious && (
            <div className="bg-gradient-to-r from-red-950/40 via-[#0d1526] to-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-start space-x-3 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wide">
                    ZERO-HOUR SUSPICION TRIGGERED ({currentScan.zero_hour_suspicion.suspicion_level})
                  </span>
                  <span className="text-[10px] font-mono bg-red-900/60 text-red-200 px-2 py-0.2 rounded">
                    Anomaly Score: {currentScan.zero_hour_suspicion.structural_anomaly_score}/10
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
            <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Redirect Time Machine ({currentScan.redirect_chain.length} observed hops)</span>
              </h3>
              {currentScan.redirect_chain.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 py-6 text-center">
                  No multi-hop redirects observed. Target evaluated as direct destination.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentScan.redirect_chain.map((hop, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-cyan-400 font-bold">Hop #{hop.hop_number}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          hop.blocked_reason ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {hop.blocked_reason ? 'BLOCKED' : `HTTP ${hop.status_code || 200}`}
                        </span>
                      </div>
                      <div className="text-white truncate">{hop.hostname}</div>
                      <div className="text-[10px] text-slate-400 truncate">{hop.url}</div>
                      {hop.blocked_reason && (
                        <div className="mt-1 text-[11px] text-red-300 bg-red-950/80 p-1.5 rounded border border-red-800">
                          {hop.blocked_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Threat Intelligence Lookups */}
            <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>Reputation Providers Telemetry</span>
              </h3>
              <div className="space-y-2.5">
                {currentScan.provider_findings.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{p.provider_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.details?.note || p.threat_type || 'Observed at: ' + p.observation_time.slice(0, 19)}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                      p.is_malicious ? 'bg-red-950 text-red-400 border border-red-800' :
                      p.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
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
        <div className="bg-[#0d1526]/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <Terminal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            No Active Threat Investigation
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Submit a target URL or select one of the benchmark preset links above to run multi-layered forensic analysis.
          </p>
        </div>
      )}
    </div>
  );
};

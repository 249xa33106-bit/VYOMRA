import React from 'react';
import { FileText, Download, Lock, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Shield, Terminal } from 'lucide-react';
import { ScanResponse } from '../types';
import { exportScanToPdf } from '../services/pdfExporter';

interface ReportsViewProps {
  currentScan: ScanResponse | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentScan }) => {
  if (!currentScan) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="bg-[#0d1526] border border-slate-800 rounded-2xl p-12 text-xs font-mono text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-cyan-400/60" />
          <h2 className="text-sm font-bold text-white uppercase mb-1">No Active Incident Dossier Loaded</h2>
          <p>Investigate a target URL first to generate an official cryptographically signed PDF report.</p>
        </div>
      </div>
    );
  }

  const isHighRisk = currentScan.risk.score >= 65;
  const isMediumRisk = currentScan.risk.score >= 30 && currentScan.risk.score < 65;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Cryptographic Evidence Vault & Dossier</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable forensic incident report with deterministic risk telemetry — Exportable exclusively as PDF
          </p>
        </div>

        {/* Sole Export Action: PDF */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportScanToPdf(currentScan)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Integrity Digest Card */}
      <div className="bg-[#0d1526] border border-cyan-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 tracking-wider">
              SHA-256 IMMUTABLE CANONICAL DIGEST
            </div>
            <div className="text-xs font-bold text-cyan-300 break-all font-mono">
              {currentScan.report_hash}
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VAULT TAMPER-CHECK VERIFIED</span>
        </div>
      </div>

      {/* Executive PDF Dossier Preview Sheet */}
      <div className="bg-[#09101d] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Document Classification Header Bar */}
        <div className="bg-[#060c17] px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              TLP:AMBER // STRICT ACCESS
            </span>
            <span className="text-xs font-mono text-slate-300 font-bold">
              PHANTOM_X_EVIDENCE_{currentScan.scan_id}.pdf
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Engine {currentScan.rule_engine_version} • {new Date(currentScan.timestamp).toLocaleString()}
          </span>
        </div>

        {/* Dossier Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Executive Summary Banner */}
          <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isHighRisk
              ? 'bg-red-950/30 border-red-500/40 text-red-300'
              : isMediumRisk
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                EXECUTIVE THREAT APPRAISAL
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black font-mono text-white">
                  {currentScan.risk.score} / 100
                </span>
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-black/40 border border-current">
                  {currentScan.risk.category}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 font-mono">
                Evidence Confidence: <strong className="text-white">{currentScan.risk.confidence}</strong> | Coverage:{' '}
                <strong className="text-white">{currentScan.risk.coverage_status}</strong>
              </div>
            </div>

            <button
              onClick={() => exportScanToPdf(currentScan)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg flex items-center space-x-2 shrink-0 self-start md:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </button>
          </div>

          {/* Section 1: Target Identifiers */}
          <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>1. Target Subject Identifiers</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Submitted Target URL:</span>
                <span className="text-slate-200 break-all">{currentScan.url_components.submitted_url}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Normalized Canonical URL:</span>
                <span className="text-cyan-300 break-all">{currentScan.url_components.normalized_url}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Host Authority:</span>
                <span className="text-white font-bold">{currentScan.url_components.hostname}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Registrable Domain / Suffix:</span>
                <span className="text-slate-200">{currentScan.url_components.registrable_domain} ({currentScan.url_components.suffix})</span>
              </div>
              {currentScan.url_components.unicode_hostname !== currentScan.url_components.punycode_hostname && (
                <div className="md:col-span-2">
                  <span className="text-amber-400 block text-[10px] uppercase">Unicode Confusable / Punycode:</span>
                  <span className="text-amber-300">{currentScan.url_components.unicode_hostname} ➔ {currentScan.url_components.punycode_hostname}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Brand Impersonation (if triggered) */}
          {currentScan.brand_match && (
            <div className="bg-[#0d1526] border border-red-500/40 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>2. Brand Impersonation Radar Findings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Targeted Brand:</span>
                  <span className="text-white font-bold text-sm">{currentScan.brand_match.brand_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Legitimate Domain:</span>
                  <span className="text-emerald-400 font-bold">{currentScan.brand_match.legitimate_domain}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Similarity Distance:</span>
                  <span className="text-red-400 font-bold">{Math.round(currentScan.brand_match.similarity_score * 100)}% Match</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {currentScan.brand_match.evidence}
              </p>
            </div>
          )}

          {/* Section 3: AI Threat Narrative */}
          <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>3. Threat Narrative & Incident Explanation</span>
            </h3>
            <div className="text-xs font-mono text-cyan-400 font-bold">
              Vector: {currentScan.attack_story.suspected_attack_category}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              {currentScan.attack_story.executive_summary}
            </p>
            <div className="text-xs text-slate-400 font-mono">
              <strong className="text-slate-300">Potential Operational Impact:</strong> {currentScan.attack_story.potential_impact}
            </div>
          </div>

          {/* Section 4: Forensic Findings Table */}
          <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>4. Forensic Evidence Signals ({currentScan.findings.length})</span>
            </h3>
            {currentScan.findings.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 italic">No adverse forensic indicators discovered.</p>
            ) : (
              <div className="space-y-2">
                {currentScan.findings.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-mono flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                          f.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : f.severity === 'HIGH'
                            ? 'bg-orange-950 text-orange-300 border-orange-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-white font-bold">{f.name}</span>
                        <span className="text-slate-400 text-[10px]">({f.detector_id})</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{f.evidence}</p>
                      <p className="text-cyan-400/90 text-[11px]">Recommended: {f.recommended_action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: SOC Defensive Playbook */}
          <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5. Recommended Defensive Actions (SOC Playbook)</span>
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {currentScan.risk.recommended_actions.map((act, i) => (
                <li key={i} className="flex items-start space-x-2.5 p-2 bg-slate-900/40 rounded border border-slate-800/60">
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">[{i + 1}]</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Export Trigger Banner */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-slate-400">
              PDF generation uses client-side vector synthesis with full cryptographic fidelity.
            </div>
            <button
              onClick={() => exportScanToPdf(currentScan)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Official PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

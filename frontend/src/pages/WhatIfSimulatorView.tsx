import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Shield, AlertTriangle, ArrowRight, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { api } from '../services/api';
import { SimulationRequest, SimulationResponse } from '../types';
import { AttackFlowGraph } from '../components/AttackFlowGraph';

export const WhatIfSimulatorView: React.FC = () => {
  const [params, setParams] = useState<SimulationRequest>({
    base_url: 'http://secure-login.paypa1-verification.com/auth',
    flag_threat_intel_match: false,
    flag_suspicious_credential_form: true,
    flag_brand_mismatch: true,
    flag_suspicious_redirect: true,
    flag_newly_registered_domain: true,
    flag_ip_address_host: false,
    flag_punycode_homoglyph: false,
    flag_intel_unavailable: false,
  });

  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSim = async (updatedParams: SimulationRequest) => {
    setLoading(true);
    try {
      const res = await api.runSimulation(updatedParams);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim(params);
  }, []);

  const handleToggle = (key: keyof SimulationRequest) => {
    const updated = { ...params, [key]: !params[key] };
    setParams(updated);
    runSim(updated);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-violet-950/40 via-[#0d1526] to-cyan-950/30 border border-violet-500/40 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-violet-900/80 text-violet-300 border border-violet-600 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase">
                HYPOTHESIS SANDBOX
              </span>
              <span className="text-slate-400 text-xs font-mono">Isolated Simulation Mode</span>
            </div>
            <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-violet-400" />
              <span>What-If Threat Defense Simulator</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Toggle hypothetical signals to explore multi-factor risk calibration without altering historical evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Score Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal Toggles (5 Columns) */}
        <div className="lg:col-span-5 bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            Hypothetical Signal Matrix
          </h2>

          <div className="space-y-3">
            {[
              { key: 'flag_brand_mismatch', label: 'Brand/Domain Impersonation', desc: 'Mimics reputable financial or cloud identity' },
              { key: 'flag_suspicious_credential_form', label: 'Insecure Password Form', desc: '<input type="password"> submitting cross-domain' },
              { key: 'flag_threat_intel_match', label: 'Confirmed Threat Intel Blacklist', desc: 'Global vendor consensus blacklist match' },
              { key: 'flag_suspicious_redirect', label: 'Cross-Domain Redirect Hop', desc: 'Bounces through intermediate shortener/proxy' },
              { key: 'flag_newly_registered_domain', label: 'Newly Registered Domain (<7d)', desc: 'Disposable domain infrastructure age' },
              { key: 'flag_ip_address_host', label: 'Raw IP Host Destination', desc: 'Direct numeric address without DNS' },
              { key: 'flag_punycode_homoglyph', label: 'Punycode Homoglyph Character', desc: 'Cyrillic lookalike character substitution' },
            ].map(({ key, label, desc }) => {
              const active = !!params[key as keyof SimulationRequest];
              return (
                <div
                  key={key}
                  onClick={() => handleToggle(key as keyof SimulationRequest)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-violet-950/40 border-violet-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="pr-3">
                    <div className="text-xs font-mono font-bold">{label}</div>
                    <div className="text-[10px] text-slate-400">{desc}</div>
                  </div>
                  <div className={`text-xl ${active ? 'text-violet-400' : 'text-slate-400'}`}>
                    {active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Simulation Result Card (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Calculated Simulation Outcome
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 uppercase">
                  SIMULATED: {simResult.simulated_category}
                </span>
              </div>

              {/* Large Score Dial */}
              <div className="flex items-center space-x-6 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="text-4xl font-black font-mono text-cyan-400">
                  {simResult.simulated_score}<span className="text-base text-slate-400">/100</span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-white font-bold">
                    Confidence: <span className="text-cyan-300">{simResult.simulated_confidence}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Active Hypotheses: {simResult.active_hypotheses.length} toggled signals
                  </div>
                </div>
              </div>

              {/* Delta Explanation */}
              <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold block mb-1">Impact Analysis:</span>
                {simResult.delta_explanation}
              </div>

              {/* Active Hypotheses list */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Contributing Simulated Findings ({simResult.findings.length}):
                </span>
                <div className="space-y-1">
                  {simResult.findings.map((f, i) => (
                    <div key={i} className="text-xs font-mono bg-slate-900/50 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-200">{f.name}</span>
                      <span className="text-[10px] text-violet-400 font-bold uppercase">{f.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Simulated Attack Graph */}
          {simResult?.attack_dna && (
            <div className="h-80">
              <AttackFlowGraph graph={simResult.attack_dna} title="Hypothetical Attack Topology" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

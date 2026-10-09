import React, { useState, useEffect } from 'react';
import { Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
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

  const runSim = async (updatedParams: SimulationRequest) => {
    try {
      const res = await api.runSimulation(updatedParams);
      setSimResult(res);
    } catch (e) {
      console.error(e);
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

  const handleTurnAllOff = () => {
    const allOff: SimulationRequest = {
      base_url: params.base_url,
      flag_threat_intel_match: false,
      flag_suspicious_credential_form: false,
      flag_brand_mismatch: false,
      flag_suspicious_redirect: false,
      flag_newly_registered_domain: false,
      flag_ip_address_host: false,
      flag_punycode_homoglyph: false,
      flag_intel_unavailable: false,
    };
    setParams(allOff);
    runSim(allOff);
  };

  const handleTurnAllOn = () => {
    const allOn: SimulationRequest = {
      base_url: params.base_url,
      flag_threat_intel_match: true,
      flag_suspicious_credential_form: true,
      flag_brand_mismatch: true,
      flag_suspicious_redirect: true,
      flag_newly_registered_domain: true,
      flag_ip_address_host: true,
      flag_punycode_homoglyph: true,
      flag_intel_unavailable: false,
    };
    setParams(allOn);
    runSim(allOn);
  };

  const score = simResult?.simulated_score ?? 0;
  const scoreColor = score === 0 
    ? 'text-emerald-600' 
    : score >= 85 
    ? 'text-red-600' 
    : score >= 65 
    ? 'text-orange-600' 
    : score >= 30 
    ? 'text-amber-600' 
    : 'text-emerald-600';

  const badgeBg = score === 0 
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
    : score >= 85 
    ? 'bg-red-100 text-red-800 border-red-300' 
    : score >= 65 
    ? 'bg-orange-100 text-orange-800 border-orange-300' 
    : score >= 30 
    ? 'bg-amber-100 text-amber-800 border-amber-300' 
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-violet-50 via-white to-cyan-50 border border-violet-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-violet-100 text-violet-800 border border-violet-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase">
                HYPOTHESIS SANDBOX
              </span>
              <span className="text-slate-500 text-xs font-mono font-medium">Isolated Simulation Mode</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 font-mono uppercase flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-violet-600" />
              <span>What-If Threat Defense Simulator</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Toggle hypothetical signals to explore multi-factor risk calibration. Turn off all conditions to observe a verified 0/100 clean baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Score Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal Toggles (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Hypothetical Signal Matrix
            </h2>
            {/* Quick All-Off / All-On Action Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleTurnAllOff}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                title="Turn off all conditions to verify 0/100 baseline"
              >
                All OFF (0/100)
              </button>
              <button
                onClick={handleTurnAllOn}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 transition-colors"
                title="Turn on all conditions to simulate compound multi-vector attack"
              >
                All ON (100/100)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'flag_brand_mismatch', label: 'Brand/Domain Impersonation', desc: 'Mimics reputable financial or cloud identity (+35)' },
              { key: 'flag_suspicious_credential_form', label: 'Insecure Password Form', desc: '<input type="password"> submitting cross-domain (+25)' },
              { key: 'flag_threat_intel_match', label: 'Confirmed Threat Intel Blacklist', desc: 'Global vendor consensus blacklist match (+40)' },
              { key: 'flag_suspicious_redirect', label: 'Cross-Domain Redirect Hop', desc: 'Bounces through intermediate shortener/proxy (+18)' },
              { key: 'flag_newly_registered_domain', label: 'Newly Registered Domain (<7d)', desc: 'Disposable domain infrastructure age (+20)' },
              { key: 'flag_ip_address_host', label: 'Raw IP Host Destination', desc: 'Direct numeric address without DNS (+22)' },
              { key: 'flag_punycode_homoglyph', label: 'Punycode Homoglyph Character', desc: 'Cyrillic lookalike character substitution (+28)' },
            ].map(({ key, label, desc }) => {
              const active = !!params[key as keyof SimulationRequest];
              return (
                <div
                  key={key}
                  onClick={() => handleToggle(key as keyof SimulationRequest)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-violet-50/80 border-violet-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="pr-3">
                    <div className="text-xs font-mono font-bold text-slate-900">{label}</div>
                    <div className="text-[10px] text-slate-500">{desc}</div>
                  </div>
                  <div className={`text-xl ${active ? 'text-violet-600' : 'text-slate-300'}`}>
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
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Calculated Simulation Outcome
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
                  SIMULATED: {simResult.simulated_score === 0 ? 'BENIGN (ZERO RISK)' : simResult.simulated_category}
                </span>
              </div>

              {/* Large Score Dial */}
              <div className="flex items-center space-x-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className={`text-5xl font-black font-mono tracking-tight ${scoreColor}`}>
                  {simResult.simulated_score}<span className="text-base text-slate-400 font-normal">/100</span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-slate-900 font-bold">
                    Confidence: <span className={score === 0 ? "text-emerald-700" : "text-cyan-700"}>
                      {score === 0 ? "CONFIRMED BENIGN (SAFE)" : simResult.simulated_confidence}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Active Conditions: <span className="font-bold text-slate-800">{simResult.active_hypotheses.length}</span> toggled signals
                  </div>
                </div>
              </div>

              {/* Delta Explanation */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                <span className="text-cyan-700 font-bold block mb-1">Impact Analysis:</span>
                {simResult.delta_explanation}
              </div>

              {/* Active Hypotheses list */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">
                  Contributing Simulated Findings ({simResult.findings.length}):
                </span>
                <div className="space-y-1">
                  {simResult.findings.length === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800">
                      ✓ All conditions are turned off. Theoretical threat score is 0/100 (Clean Baseline Posture).
                    </div>
                  ) : (
                    simResult.findings.map((f, i) => (
                      <div key={i} className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-800">{f.name}</span>
                        <span className="text-[10px] text-violet-700 font-bold uppercase">{f.severity}</span>
                      </div>
                    ))
                  )}
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

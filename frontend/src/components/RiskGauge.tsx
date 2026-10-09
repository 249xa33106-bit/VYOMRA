import React from 'react';
import { Shield, AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
import { RiskAssessment } from '../types';

interface RiskGaugeProps {
  risk: RiskAssessment;
  isSimulation?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, isSimulation }) => {
  const score = risk.score;

  // Determine colors based on calibrated thresholds
  let color = '#059669'; // Green (Benign)
  let glowClass = 'shadow-emerald-500/10';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;

  if (score >= 85) {
    color = '#dc2626'; // Red (Malicious)
    glowClass = 'shadow-red-500/10';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    Icon = AlertOctagon;
  } else if (score >= 65) {
    color = '#ea580c'; // Orange (High Risk)
    glowClass = 'shadow-orange-500/10';
    badgeBg = 'bg-orange-50 text-orange-700 border-orange-200';
    Icon = AlertTriangle;
  } else if (score >= 30) {
    color = '#d97706'; // Amber (Suspicious)
    glowClass = 'shadow-amber-500/10';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  }

  // Calculate SVG arc parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden shadow-sm ${glowClass}`}>
      {/* Simulation Ribbon if applicable */}
      {isSimulation && (
        <div className="absolute top-2 right-2 bg-violet-100 border border-violet-300 text-violet-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          SIMULATION RESULT
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-600" />
          <span>Calibrated Risk Scoring</span>
        </span>
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${badgeBg}`}>
          {risk.category}
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Radial SVG Dial */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Value Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-200 ease-out"
            />
          </svg>

          {/* Centered Numeric Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
              {score}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
              / 100 RISK
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase">EVIDENCE CONFIDENCE</div>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 font-mono">
              <Icon className="w-4 h-4" style={{ color }} />
              <span>{risk.confidence} CONFIDENCE</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase">TELEMETRY COVERAGE</div>
            <div className="text-xs font-mono text-cyan-700 font-bold">
              {risk.coverage_status}
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span className="text-emerald-700 font-semibold">+{risk.positive_findings_count} signals</span>
            <span>•</span>
            <span className="text-slate-500">{risk.uncertainty_reasons.length} uncertainty notes</span>
          </div>
        </div>
      </div>

      {/* Uncertainty Notice if present */}
      {risk.uncertainty_reasons.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-mono text-slate-600 flex items-start space-x-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-slate-600 line-clamp-2">
              {risk.uncertainty_reasons[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

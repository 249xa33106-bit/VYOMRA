import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Info, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { Finding, SeverityLevel } from '../types';

interface FindingsListProps {
  findings: Finding[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFindings = findings.filter(f => {
    if (filter === 'ALL') return true;
    return f.severity === filter;
  });

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'LOW':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'DIRECT_OBSERVATION':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-800';
      case 'PROVIDER_REPORT':
        return 'bg-violet-950/60 text-violet-400 border-violet-800';
      case 'HEURISTIC_RULE':
        return 'bg-slate-900 text-slate-400 border-slate-800';
      case 'SIMULATED':
        return 'bg-pink-950/60 text-pink-400 border-pink-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-sm font-bold text-white font-mono tracking-wide uppercase flex items-center space-x-2">
            <span>Forensic Evidence Findings</span>
            <span className="text-xs bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
              {findings.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic detections and behavioral signals with evidence traces
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                filter === level
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {filteredFindings.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-mono">
          No findings matching selected filter criteria.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 mt-2">
          {filteredFindings.map((finding, idx) => {
            const isExpanded = expandedId === `${finding.detector_id}-${idx}`;
            return (
              <div key={`${finding.detector_id}-${idx}`} className="py-3.5 transition-colors hover:bg-slate-900/30 px-2 rounded-lg">
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : `${finding.detector_id}-${idx}`)}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSourceBadge(finding.source_type)}`}>
                        {finding.source_type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {finding.detector_id}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 hover:text-cyan-400 transition-colors">
                      {finding.name}
                    </h3>

                    <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      <span className="text-slate-400">Evidence: </span>
                      <span className="text-cyan-200">{finding.evidence}</span>
                    </p>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details: Rationale and Recommended Action */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 font-semibold mb-1 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400" />
                        <span>SECURITY RATIONALE</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {finding.rationale}
                      </p>
                    </div>

                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold mb-1 flex items-center space-x-1.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RECOMMENDED DEFENSIVE ACTION</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {finding.recommended_action}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

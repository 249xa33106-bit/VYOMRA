import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Wrench } from 'lucide-react';
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
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'DIRECT_OBSERVATION':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'PROVIDER_REPORT':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'HEURISTIC_RULE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SIMULATED':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wide uppercase flex items-center space-x-2">
            <span>Forensic Evidence Findings</span>
            <span className="text-xs bg-slate-100 text-cyan-700 px-2 py-0.5 rounded-full font-mono font-semibold">
              {findings.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
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
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {filteredFindings.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs font-mono">
          No findings matching selected filter criteria.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {filteredFindings.map((finding, idx) => {
            const isExpanded = expandedId === `${finding.detector_id}-${idx}`;
            return (
              <div key={`${finding.detector_id}-${idx}`} className="py-3.5 transition-colors hover:bg-slate-50 px-2 rounded-lg">
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : `${finding.detector_id}-${idx}`)}
                >
                  <div className="space-y-1.5 pr-4 flex-1">
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

                    <h3 className="text-xs font-bold text-slate-900 hover:text-cyan-700 transition-colors">
                      {finding.name}
                    </h3>

                    <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 font-semibold">Evidence: </span>
                      <span className="text-cyan-800 font-semibold">{finding.evidence}</span>
                    </p>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 p-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details: Rationale and Recommended Action */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-mono text-slate-600 font-semibold mb-1 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-600" />
                        <span>SECURITY RATIONALE</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {finding.rationale}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-mono text-emerald-700 font-semibold mb-1 flex items-center space-x-1.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        <span>RECOMMENDED DEFENSIVE ACTION</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
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
